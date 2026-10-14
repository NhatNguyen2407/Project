<#
Dioxyzine Frog - Manual, read-only Supabase logical database export.
Local Windows PowerShell. This file contains no credentials.

Prerequisites:
  1. Supabase CLI and Docker are installed and Docker is running.
  2. Log into Supabase CLI, and link the local application directory to
     the expected project using `supabase link --project-ref ...`.
     The CLI can obtain the database password securely via a local prompt or
     SUPABASE_DB_PASSWORD set in the current PowerShell process.
  3. Run from a trusted Windows account with an encrypted drive.

Output: <parent of Source>\Private-Backups\Database\db-<UTC>\roles.sql,
        schema.sql, data.sql, manifest.json

IMPORTANT: This script does NOT back up Auth user records, Storage file bytes,
Edge Function secrets, or all platform-managed settings. See docs/BACKUP_RUNBOOK.md.
#>

[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$expectedRef = 'xeljnocizvlmefqovvfw'
$appRoot = Split-Path -Parent $PSScriptRoot
$projectRefFile = Join-Path $appRoot 'supabase\.temp\project-ref'
if (-not (Test-Path -LiteralPath $projectRefFile -PathType Leaf)) {
    throw 'Local project is not linked. Run supabase link --project-ref for the expected production project from the app root.'
}
$linkedRef = (Get-Content -LiteralPath $projectRefFile -Raw).Trim()
if ($linkedRef -ne $expectedRef) {
    throw 'Local Supabase CLI is linked to a different project. Aborting.'
}
if (-not (Get-Command 'supabase' -ErrorAction SilentlyContinue)) {
    throw 'Supabase CLI not found. Install it and verify supabase --version.'
}
if (-not (Get-Command 'docker' -ErrorAction SilentlyContinue)) {
    throw 'Docker CLI not found. Install Docker Desktop and start it.'
}

# With the prescribed folder layout, Source and Private-Backups are siblings.
$sourceRoot = (Resolve-Path -LiteralPath (Join-Path $appRoot '..\..')).Path
$backupParent = Split-Path -Parent $sourceRoot
$privateRoot = Join-Path $backupParent 'Private-Backups'
if (-not (Test-Path -LiteralPath $privateRoot -PathType Container)) {
    throw 'Private-Backups folder was not found beside Source. Aborting.'
}

# Even if Private-Backups is outside the nested Source repo, it must not be
# inside ANY enclosing Git repository. The outer Project working tree may
# otherwise accidentally include SQL exports in a later git add.
$checkDir = (Resolve-Path -LiteralPath $privateRoot).Path
while ($true) {
    if (Test-Path -LiteralPath (Join-Path $checkDir '.git')) {
        throw ('Private-Backups is inside a Git repository at ' + $checkDir + '. Move DioxyzineFrog-Backup outside the parent Git working tree, then retry.')
    }
    $parentDir = Split-Path -Parent $checkDir
    if ([string]::IsNullOrWhiteSpace($parentDir) -or $parentDir -eq $checkDir) { break }
    $checkDir = $parentDir
}

$root = Join-Path $privateRoot 'Database'
$stamp = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss')
$out = Join-Path $root ("db-" + $stamp)
New-Item -Path $out -ItemType Directory -Force | Out-Null

function Invoke-SafeDump {
    param(
        [Parameter(Mandatory = $true)][string]$OutputFile,
        [Parameter(Mandatory = $true)][string[]]$ExtraFlags
    )
    Write-Host ('Exporting ' + [IO.Path]::GetFileName($OutputFile) + '...')
    & supabase db dump --linked -f $OutputFile @ExtraFlags
    if ($LASTEXITCODE -ne 0) {
        throw ('Supabase CLI backup failed for ' + [IO.Path]::GetFileName($OutputFile))
    }
    if (-not (Test-Path -LiteralPath $OutputFile -PathType Leaf)) {
        throw ('Backup output was not created: ' + [IO.Path]::GetFileName($OutputFile))
    }
    if ((Get-Item -LiteralPath $OutputFile).Length -eq 0) {
        throw ('Backup output is empty: ' + [IO.Path]::GetFileName($OutputFile))
    }
}

Push-Location -LiteralPath $appRoot
try {
    Invoke-SafeDump -OutputFile (Join-Path $out 'roles.sql') -ExtraFlags @('--role-only')
    Invoke-SafeDump -OutputFile (Join-Path $out 'schema.sql') -ExtraFlags @()
    Invoke-SafeDump -OutputFile (Join-Path $out 'data.sql') -ExtraFlags @(
        '--data-only',
        '--use-copy'
    )

    $manifestFiles = @()
    foreach ($name in @('roles.sql', 'schema.sql', 'data.sql')) {
        $file = Join-Path $out $name
        $manifestFiles += [ordered]@{
            name = $name
            bytes = (Get-Item -LiteralPath $file).Length
            sha256 = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant()
        }
    }

    $manifest = [ordered]@{
        description = 'Dioxyzine Frog - Supabase CLI logical export'
        project_ref = $expectedRef
        created_utc = [DateTime]::UtcNow.ToString('o')
        export_type = 'roles, application schema, application data (not Auth or Storage object bytes)'
        storage_object_bytes_included = $false
        restore_verified = $false
        files = $manifestFiles
    }
    $manifestPath = Join-Path $out 'manifest.json'
    $manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

    Write-Host ''
    Write-Host 'Local export completed. This is NOT a verified restore.'
    Write-Host ('Backup directory: ' + $out)
    Write-Host 'Keep the backup private, encrypted and outside the public Git repository.'
    Write-Host 'Auth data, Storage objects and platform configuration require separate recovery planning.'
    Write-Host 'Complete an isolated restore drill before marking backups verified.'
}
catch {
    Write-Warning 'Export is INCOMPLETE. Do not rely on these files as a verified backup.'
    Write-Warning ('Partial output may exist in: ' + $out)
    throw
}
finally {
    Pop-Location
}
