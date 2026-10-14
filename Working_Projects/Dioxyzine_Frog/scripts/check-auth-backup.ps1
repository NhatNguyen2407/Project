<#
Dioxyzine Frog - Local-only Auth dump inspection.
Reads a private SQL dump without displaying or uploading its contents.
Never connects to Supabase or changes Production.
#>
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Layout: DioxyzineFrog-Backup/{Source,Private-Backups}
$appRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = (Resolve-Path -LiteralPath (Join-Path $appRoot '..\..')).Path
$backupRoot = Split-Path -Parent $sourceRoot
$authDir = Join-Path $backupRoot 'Private-Backups\Auth'
$authFile = Join-Path $authDir 'auth-data.sql'

if (-not (Test-Path -LiteralPath $authFile -PathType Leaf)) {
    throw 'Auth dump not found in Private-Backups\Auth. Nothing has been changed.'
}

$names = @('users', 'identities', 'sessions')
$counts = @{}
$seen = @{}
foreach ($name in $names) {
    $counts[$name] = 0
    $seen[$name] = $false
}

$active = $null
$totalCopyBlocks = 0
$insertStatementsFound = $false
# Matches unquoted and quoted pg_dump names, e.g. auth.users and "auth"."users".
$copyPattern = '^\s*COPY\s+(?:"?auth"?\.)"?(users|identities|sessions)"?\s*(?:\(|FROM\b)'
$insertPattern = '^\s*INSERT\s+INTO\s+(?:"?auth"?\.)"?(users|identities|sessions)"?\b'

foreach ($line in [System.IO.File]::ReadLines($authFile)) {
    if ($null -ne $active) {
        if ($line.Trim() -eq '\.') {
            $active = $null
        }
        elseif ($active -ne 'other') {
            # Each PostgreSQL COPY data line represents one row.
            $counts[$active] = [int]$counts[$active] + 1
        }
        continue
    }

    if ($line -match $copyPattern) {
        $active = $Matches[1].ToLowerInvariant()
        $seen[$active] = $true
        $totalCopyBlocks++
        continue
    }
    if ($line -match '^\s*COPY\s+') {
        $active = 'other'
        $totalCopyBlocks++
        continue
    }
    if ($line -match $insertPattern) {
        $insertStatementsFound = $true
    }
}

Write-Host 'Local Auth export inspection (no personal data displayed):'
Write-Host ('File bytes: ' + (Get-Item -LiteralPath $authFile).Length)
Write-Host ('COPY blocks (all tables): ' + $totalCopyBlocks)
foreach ($name in $names) {
    Write-Host ('auth.' + $name + ' | COPY found: ' + $seen[$name] + ' | rows in COPY: ' + $counts[$name])
}

if (-not $seen['users'] -or -not $seen['identities']) {
    Write-Warning 'Auth users/identities COPY blocks are missing. Export is NOT verified; no manifest was written.'
    if ($insertStatementsFound) {
        Write-Warning 'INSERT syntax was detected. The file needs a different parser.'
    }
    exit 2
}

if ($counts['users'] -eq 0 -or $counts['identities'] -eq 0) {
    Write-Warning 'Auth table COPY blocks exist but at least one contains no records. Check against the production snapshot.'
    exit 2
}

$hash = (Get-FileHash -LiteralPath $authFile -Algorithm SHA256).Hash.ToLowerInvariant()
$manifest = [ordered]@{
    description = 'Dioxyzine Frog - local Auth export inspection'
    created_utc = [DateTime]::UtcNow.ToString('o')
    project_ref = 'xeljnocizvlmefqovvfw'
    file = 'auth-data.sql'
    bytes = (Get-Item -LiteralPath $authFile).Length
    sha256 = $hash
    copy_row_counts = [ordered]@{
        users = $counts['users']
        identities = $counts['identities']
        sessions = $counts['sessions']
    }
    auth_copy_structure_checked = $true
    production_row_counts_compared = $false
    restore_verified = $false
}
$manifestPath = Join-Path $authDir 'manifest.json'
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
Write-Host 'Auth manifest created locally.'
Write-Host 'Next: compare row counts with Production and plan an isolated restore.'
