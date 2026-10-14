<#
Dioxyzine Frog - prepare an isolated local Supabase restore workspace.

This script ONLY creates or updates a local Supabase config.toml in a
separate, unlinked directory. It never starts Docker containers, imports
SQL, accesses the remote database, or deletes a directory.

Run from the application:
  .\scripts\prepare-restore-workspace.ps1
#>
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$appRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = (Resolve-Path -LiteralPath (Join-Path $appRoot '..\..')).Path
$backupRoot = Split-Path -Parent $sourceRoot
$workParent = Split-Path -Parent $backupRoot
$workspace = Join-Path $workParent 'DioxyzineFrog-RestoreDrill'
$privateRoot = Join-Path $backupRoot 'Private-Backups'

if (-not (Test-Path -LiteralPath $privateRoot -PathType Container)) {
    throw 'Private-Backups is missing. Nothing was changed.'
}
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    throw 'Supabase CLI is not installed. Nothing was changed.'
}

# Prevent writing inside any enclosing Git repository.
$ancestor = $workParent
while ($true) {
    if (Test-Path -LiteralPath (Join-Path $ancestor '.git')) {
        throw 'The restore workspace would be inside a Git repository.'
    }
    $parent = Split-Path -Parent $ancestor
    if ([string]::IsNullOrWhiteSpace($parent) -or $parent -eq $ancestor) {
        break
    }
    $ancestor = $parent
}

$existing = Test-Path -LiteralPath $workspace -PathType Container
if ($existing) {
    $configPath = Join-Path $workspace 'supabase\config.toml'
    if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
        throw 'The existing restore directory has no config.toml. Refusing to overwrite.'
    }
    $unknown = @(Get-ChildItem -LiteralPath $workspace -Force |
        Where-Object { $_.Name -notin @('supabase', '.vscode', '.gitignore') })
    if ($unknown.Count -gt 0) {
        throw 'The existing restore directory contains unrelated files. Refusing to overwrite.'
    }
}
else {
    New-Item -ItemType Directory -Path $workspace | Out-Null
    Push-Location -LiteralPath $workspace
    try {
        & supabase init --yes
        if ($LASTEXITCODE -ne 0) {
            throw 'Supabase init failed. No data has been imported.'
        }
    }
    finally {
        Pop-Location
    }
}

# This directory must never have been linked to a remote project.
$linkedRefPath = Join-Path $workspace 'supabase\.temp\project-ref'
if (Test-Path -LiteralPath $linkedRefPath) {
    throw 'The restore workspace contains a remote project link. Refusing to proceed.'
}
if (Test-Path -LiteralPath (Join-Path $workspace '.git')) {
    throw 'The restore workspace is itself a Git repository. Refusing to proceed.'
}
if (Test-Path -LiteralPath (Join-Path $workspace 'supabase\seed.sql')) {
    throw 'The restore workspace contains seed data. Refusing to proceed.'
}
$migrationsPath = Join-Path $workspace 'supabase\migrations'
if (Test-Path -LiteralPath $migrationsPath -PathType Container) {
    $migrationFiles = @(Get-ChildItem -LiteralPath $migrationsPath -Recurse -File)
    if ($migrationFiles.Count -gt 0) {
        throw 'The restore workspace has migrations. Refusing to proceed.'
    }
}

$configPath = Join-Path $workspace 'supabase\config.toml'
if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
    throw 'Supabase config.toml was not created.'
}

# Edit active TOML keys by section. Avoid regex substitution back-references.
$lines = New-Object 'System.Collections.Generic.List[string]'
foreach ($line in (Get-Content -LiteralPath $configPath)) {
    [void]$lines.Add([string]$line)
}

$section = ''
$found = @{
    project = $false
    db_port = $false
    db_major = $false
    migrations = $false
    seed = $false
}
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match '^\s*\[([^\]]+)\]\s*$') {
        $section = $Matches[1]
        continue
    }

    if ($section -eq '' -and $line -match '^\s*project_id\s*=') {
        $lines[$i] = 'project_id = "dioxyzine_frog_restore_drill"'
        $found.project = $true
    }
    elseif ($section -eq 'db' -and $line -match '^\s*port\s*=') {
        $lines[$i] = 'port = 55432'
        $found.db_port = $true
    }
    elseif ($section -eq 'db' -and $line -match '^\s*shadow_port\s*=') {
        $lines[$i] = 'shadow_port = 55420'
    }
    elseif ($section -eq 'db' -and $line -match '^\s*major_version\s*=') {
        $lines[$i] = 'major_version = 17'
        $found.db_major = $true
    }
    elseif ($section -eq 'db.migrations' -and $line -match '^\s*enabled\s*=') {
        $lines[$i] = 'enabled = false'
        $found.migrations = $true
    }
    elseif ($section -eq 'db.seed' -and $line -match '^\s*enabled\s*=') {
        $lines[$i] = 'enabled = false'
        $found.seed = $true
    }
}

# Some CLI-generated TOML files have only a commented-out major_version.
if (-not $found.db_major) {
    $dbIndex = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^\s*\[db\]\s*$') {
            $dbIndex = $i
            break
        }
    }
    if ($dbIndex -lt 0) {
        throw 'Could not find [db] in config.toml. Nothing was written.'
    }
    $lines.Insert($dbIndex + 1, 'major_version = 17')
    $found.db_major = $true
}

foreach ($name in @('project', 'db_port', 'db_major', 'migrations', 'seed')) {
    if (-not $found[$name]) {
        throw ('Missing required config key: ' + $name + '. Nothing was written.')
    }
}

$updated = [string]::Join([Environment]::NewLine, $lines) + [Environment]::NewLine
[System.IO.File]::WriteAllText(
    $configPath,
    $updated,
    (New-Object System.Text.UTF8Encoding($false))
)

Write-Host 'Isolated Supabase workspace configuration prepared.'
Write-Host ('Workspace: ' + $workspace)
Write-Host 'Project ID: dioxyzine_frog_restore_drill'
Write-Host 'Local DB port: 55432'
Write-Host 'PostgreSQL major version: 17'
Write-Host 'Auto migrations: disabled'
Write-Host 'Auto seed: disabled'
Write-Host 'Remote project link: absent'
Write-Host 'No Docker services started. No database restored.'
