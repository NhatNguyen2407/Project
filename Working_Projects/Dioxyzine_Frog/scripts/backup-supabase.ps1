<#
Dioxyzine Frog - Manual, read-only Supabase logical database export.
Local Windows PowerShell. This file contains no credentials.

Prerequisites:
  1. Supabase CLI and Docker are installed and Docker is running.
  2. Set SUPABASE_DB_URL in the current PowerShell process to the direct/pooler
     connection string obtained from the project's Supabase dashboard.
  3. Run from a trusted Windows account with an encrypted drive.

Output: Documents\DioxyzineFrog\DatabaseBackups\db-<UTC>\roles.sql,
        schema.sql, data.sql, manifest.json

IMPORTANT: This script does NOT back up Storage file bytes, Edge Function
secrets, or every platform-managed setting. See docs/BACKUP_RUNBOOK.md.
#>

[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$expectedRef = 'xeljnocizvlmefqovvfw'
$databaseUrl = [Environment]::GetEnvironmentVariable('SUPABASE_DB_URL', 'Process')

if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    throw 'SUPABASE_DB_URL is missing. Set it locally, not in GitHub or ChatGPT.'
}
if ($databaseUrl -notmatch '^postgres(ql)?://') {
    throw 'SUPABASE_DB_URL must be a PostgreSQL connection URL.'
}
if ($databaseUrl -notmatch [regex]::Escape($expectedRef)) {
    throw 'Connection URL does not appear to target the expected Supabase project. Aborting.'
}
if (-not (Get-Command 'supabase' -ErrorAction SilentlyContinue)) {
    throw 'Supabase CLI not found. Install it and verify supabase --version.'
}
if (-not (Get-Command 'docker' -ErrorAction SilentlyContinue)) {
    throw 'Docker CLI not found. Install Docker Desktop and start it.'
}

$docs = [Environment]::GetFolderPath('MyDocuments')
if ([string]::IsNullOrWhiteSpace($docs)) {
    throw 'Windows Documents directory could not be determined.'
}

$root = Join-Path $docs 'DioxyzineFrog\DatabaseBackups'
$stamp = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss')
$out = Join-Path $root ("db-" + $stamp)
New-Item -Path $out -ItemType Directory -Force | Out-Null

function Invoke-SafeDump {
    param(
        [Parameter(Mandatory = $true)][string]$OutputFile,
        [Parameter(Mandatory = $true)][string[]]$ExtraFlags
    )
    Write-Host ('Exporting ' + [IO.Path]::GetFileName($OutputFile) + '...')
    & supabase db dump --db-url $databaseUrl -f $OutputFile @ExtraFlags
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

try {
    Invoke-SafeDump -OutputFile (Join-Path $out 'roles.sql') -ExtraFlags @('--role-only')
    Invoke-SafeDump -OutputFile (Join-Path $out 'schema.sql') -ExtraFlags @()
    Invoke-SafeDump -OutputFile (Join-Path $out 'data.sql') -ExtraFlags @(
        '--data-only',
        '--use-copy',
        '-x', 'storage.buckets_vectors',
        '-x', 'storage.vector_indexes'
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
        export_type = 'roles, schema, application data'
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
    Write-Host 'Back up Storage objects separately and complete an isolated restore drill.'
}
catch {
    Write-Warning 'Export is INCOMPLETE. Do not rely on these files as a verified backup.'
    Write-Warning ('Partial output may exist in: ' + $out)
    throw
}
finally {
    $databaseUrl = $null
}
