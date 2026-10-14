<#
Dioxyzine Frog - read-only local backup and Docker preflight.
Checks private database, Storage and Auth backup manifests without
printing personal data, uploading files, starting containers, or
connecting to the remote Supabase project.

Usage from Working_Projects/Dioxyzine_Frog:
  .\scripts\verify-private-backups.ps1
#>

[CmdletBinding()]
param(
    [string]$ExpectedDockerDataPath = 'D:\App\Docker\Data\DockerDesktopWSL'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$expectedRef = 'xeljnocizvlmefqovvfw'
$appRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = (Resolve-Path -LiteralPath (Join-Path $appRoot '..\..')).Path
$backupParent = Split-Path -Parent $sourceRoot
$privateRoot = Join-Path $backupParent 'Private-Backups'

function Assert-ValidPrivateLocation {
    if (-not (Test-Path -LiteralPath $privateRoot -PathType Container)) {
        throw 'Private-Backups directory not found.'
    }
    $ancestor = (Resolve-Path -LiteralPath $privateRoot).Path
    while ($true) {
        if (Test-Path -LiteralPath (Join-Path $ancestor '.git')) {
            throw 'Private-Backups is inside a Git repository. Move it outside the repository.'
        }
        $parent = Split-Path -Parent $ancestor
        if ([string]::IsNullOrEmpty($parent) -or $parent -eq $ancestor) {
            break
        }
        $ancestor = $parent
    }
}

function Read-Manifest {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw 'A required local backup manifest is missing.'
    }
    $m = Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
    if ($m.project_ref -ne $expectedRef) {
        throw 'The backup manifest belongs to another project.'
    }
    return $m
}

function Assert-FileIntegrity {
    param(
        [string]$Path,
        [long]$ExpectedBytes,
        [string]$ExpectedHash
    )
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw 'A file listed in a backup manifest was not found.'
    }
    $actualBytes = (Get-Item -LiteralPath $Path).Length
    if ($actualBytes -le 0 -or $actualBytes -ne $ExpectedBytes) {
        throw 'A backup file has an unexpected size.'
    }
    $actualHash = (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash
    if ($actualHash -ine $ExpectedHash) {
        throw 'A backup file does not match its saved SHA-256.'
    }
}

Assert-ValidPrivateLocation
Write-Host 'Dioxyzine Frog - local recovery preflight'
Write-Host 'No remote connections or restoration will be performed.'
Write-Host ''

$dbParent = Join-Path $privateRoot 'Database'
if (-not (Test-Path -LiteralPath $dbParent -PathType Container)) {
    throw 'Database backup directory not found.'
}
$dbDirs = @(Get-ChildItem -LiteralPath $dbParent -Directory |
    Where-Object { $_.Name -like 'db-*' } |
    Sort-Object Name -Descending)
if ($dbDirs.Count -eq 0) {
    throw 'No database backup snapshot directories found.'
}
$dbDir = $dbDirs[0].FullName
$db = Read-Manifest -Path (Join-Path $dbDir 'manifest.json')
foreach ($name in @('roles.sql', 'schema.sql', 'data.sql')) {
    $entry = @($db.files | Where-Object { $_.name -eq $name })
    if ($entry.Count -ne 1) {
        throw 'The database manifest is missing one of the three expected SQL files.'
    }
    Assert-FileIntegrity -Path (Join-Path $dbDir $name) -ExpectedBytes ([long]$entry[0].bytes) -ExpectedHash ([string]$entry[0].sha256)
}
Write-Host 'Database SQL files: size and SHA-256 verified (3 files).'

$storageRoot = Join-Path $privateRoot 'Storage'
$storageManifestPath = Join-Path $storageRoot 'manifest.json'
$storage = Read-Manifest -Path $storageManifestPath
if ($storage.file_count -ne @($storage.files).Count) {
    throw 'Storage manifest file count does not match the number of entries.'
}
foreach ($entry in $storage.files) {
    $relativePath = [string]$entry.path
    if ($relativePath.StartsWith('/') -or $relativePath.Contains('..') -or
        [IO.Path]::IsPathRooted($relativePath)) {
        throw 'The Storage manifest contains an unsafe relative path.'
    }
    $localPath = Join-Path $storageRoot ($relativePath.Replace('/', '\'))
    Assert-FileIntegrity -Path $localPath -ExpectedBytes ([long]$entry.bytes) -ExpectedHash ([string]$entry.sha256)
}
$storageFiles = @(Get-ChildItem -LiteralPath $storageRoot -Recurse -File |
    Where-Object { $_.FullName -ne $storageManifestPath })
$storageBytes = ($storageFiles | Measure-Object -Property Length -Sum).Sum
if ($storageFiles.Count -ne [int]$storage.file_count -or
    $storageBytes -ne [long]$storage.total_bytes) {
    throw 'Storage manifest totals do not match the local file inventory.'
}
Write-Host ('Storage objects: size and SHA-256 verified (' + $storageFiles.Count + ' files).')

$authDir = Join-Path $privateRoot 'Auth'
$auth = Read-Manifest -Path (Join-Path $authDir 'manifest.json')
if ($auth.file -ne 'auth-data.sql') {
    throw 'Unexpected Auth dump filename in the manifest.'
}
Assert-FileIntegrity -Path (Join-Path $authDir 'auth-data.sql') -ExpectedBytes ([long]$auth.bytes) -ExpectedHash ([string]$auth.sha256)
if (-not $auth.auth_copy_structure_checked) {
    throw 'Auth COPY blocks were not checked when the manifest was created.'
}
Write-Host 'Auth SQL file: size and SHA-256 verified. COPY structure was previously checked.'

Write-Host ''
$dockerFound = [bool](Get-Command 'docker' -ErrorAction SilentlyContinue)
$dockerRunning = $false
if ($dockerFound) {
    try {
        $engineVersion = (& docker info --format '{{.ServerVersion}}' 2>$null)
        if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($engineVersion)) {
            $dockerRunning = $true
            Write-Host ('Docker Engine: available (' + $engineVersion.Trim() + ').')
        }
    }
    catch {
        # A stopped engine is a preflight warning, not a reason to alter state.
    }
}
if (-not $dockerRunning) {
    Write-Warning 'Docker Engine is not reachable. Open Docker Desktop before the restore drill.'
}

if (Test-Path -LiteralPath $ExpectedDockerDataPath -PathType Container) {
    Write-Host 'Expected Docker WSL data directory on D: exists.'
    Write-Host 'Confirm its active location in Docker Desktop Settings; folder presence alone is not proof of migration.'
}
else {
    Write-Warning 'The expected Docker WSL data directory was not found on D:. Check Docker Desktop Settings.'
}

foreach ($driveName in @('C', 'D')) {
    $drive = Get-PSDrive -Name $driveName -ErrorAction SilentlyContinue
    if ($null -ne $drive) {
        $freeGB = [math]::Round(($drive.Free / 1GB), 2)
        Write-Host ('Free space on ' + $driveName + ': ' + $freeGB + ' GiB.')
    }
}

Write-Host ''
Write-Host 'Preflight complete. Files were verified against LOCAL manifests only.'
Write-Host 'Restore NOT tested. Remote recovery point, platform settings, and off-device copy NOT verified.'
