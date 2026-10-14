<#
Dioxyzine Frog - prepare a separate LOCAL restore drill workspace.
Creates only local configuration on D:. No production network calls,
database restores, Docker containers, or customer data copies.
Run from the Dioxyzine_Frog app directory:
  .\scripts\prepare-restore-workspace.ps1
#>

[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$appRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = (Resolve-Path -LiteralPath (Join-Path $appRoot '..\..')).Path
$backupRoot = Split-Path -Parent $sourceRoot
$backupParent = Split-Path -Parent $backupRoot
$workspace = Join-Path $backupParent 'DioxyzineFrog-RestoreDrill'
$privateRoot = Join-Path $backupRoot 'Private-Backups'
$expectedRef = 'xeljnocizvlmefqovvfw'

if (-not (Get-Command 'supabase' -ErrorAction SilentlyContinue)) {
    throw 'Supabase CLI is not available.'
}

if (-not (Test-Path -LiteralPath $privateRoot -PathType Container)) {
    throw 'Private-Backups was not found. The existing backup folder must remain intact.'
}
foreach ($path in @(
    'Auth\auth-data.sql',
    'Auth\manifest.json',
    'Storage\manifest.json'
)) {
    if (-not (Test-Path -LiteralPath (Join-Path $privateRoot $path) -PathType Leaf)) {
        throw ('Required private backup item is missing: ' + $path)
    }
}

# A sibling workspace is intentional. Resume only a previously initialized,
# unlinked and unused local CLI workspace. Never overwrite other user projects.
$existingWorkspace = Test-Path -LiteralPath $workspace -PathType Container
if ($existingWorkspace) {
    $existingConfig = Join-Path $workspace 'supabase\config.toml'
    if (-not (Test-Path -LiteralPath $existingConfig -PathType Leaf)) {
        throw 'RestoreDrill exists without a Supabase config. Refusing to overwrite it.'
    }
    $unexpected = @(Get-ChildItem -LiteralPath $workspace -Force |
        Where-Object { $_.Name -notin @('supabase', '.vscode', '.gitignore') })
    if ($unexpected.Count -gt 0) {
        throw 'RestoreDrill contains unexpected files. Refusing to modify it.'
    }
    foreach ($unsafePath in @('supabase\.temp\project-ref', '.git', 'supabase\seed.sql')) {
        if (Test-Path -LiteralPath (Join-Path $workspace $unsafePath)) {
            throw 'RestoreDrill contains linked, versioned or seed data. Refusing to modify it.'
        }
    }
    $migrationFolder = Join-Path $workspace 'supabase\migrations'
    if (Test-Path -LiteralPath $migrationFolder -PathType Container) {
        if (@(Get-ChildItem -LiteralPath $migrationFolder -File -Recurse).Count -gt 0) {
            throw 'RestoreDrill contains migration files. Refusing to modify it.'
        }
    }
}
$ancestor = $backupParent
while ($true) {
    if (Test-Path -LiteralPath (Join-Path $ancestor '.git')) {
        throw 'RestoreDrill would be inside a Git repository. Move DioxyzineFrog-Backup outside the repository.'
    }
    $next = Split-Path -Parent $ancestor
    if ([string]::IsNullOrEmpty($next) -or $next -eq $ancestor) { break }
    $ancestor = $next
}

if (-not $existingWorkspace) {
    New-Item -ItemType Directory -Path $workspace -ErrorAction Stop | Out-Null
}
Write-Host ('Preparing isolated workspace: ' + $workspace)

Push-Location -LiteralPath $workspace
try {
    if (-not $existingWorkspace) {
        & supabase init --yes
        if ($LASTEXITCODE -ne 0) {
            throw 'Supabase init failed. Check the isolated workspace manually.'
        }
    }
    else {
        Write-Host 'Resuming existing initialized workspace. No files or backups were deleted.'
    }

    $configPath = Join-Path $workspace 'supabase\config.toml'
    if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
        throw 'Supabase init did not create config.toml.'
    }
    $content = [IO.File]::ReadAllText($configPath)
    $projectPattern = '(?m)^project_id\s*=\s*"[^"]*"'
    if (-not [regex]::IsMatch($content, $projectPattern)) {
        throw 'Could not find project_id in isolated Supabase config.'
    }
    $content = [regex]::Replace(
        $content, $projectPattern, 'project_id = "dioxyzine_frog_restore_drill"'
    )

    # In this workspace the remote app's incomplete migrations are NEVER copied.
    # Explicitly disable migrations and seed when starting the local database.
    foreach ($section in @('db.migrations', 'db.seed')) {
        $escapedSection = [regex]::Escape($section)
        $pattern = '(?m)(^\[' + $escapedSection +
            '\]\r?\n(?:(?!^\[).*\r?\n)*?^\s*enabled\s*=\s*)(?:true|false)\b'
        if (-not [regex]::IsMatch($content, $pattern)) {
            throw ('Unable to safely disable ' + $section + '. No containers were started.')
        }
        $content = [regex]::Replace($content, $pattern, '${1}false')
    }

    # Keep the drill off the default database port used by other local projects.
    $dbPortPattern = '(?m)(^\[db\]\r?\n(?:(?!^\[).*\r?\n)*?^\s*port\s*=\s*)(?:54322|55432)\b'
    if (-not [regex]::IsMatch($content, $dbPortPattern)) {
        throw 'Unable to identify default local DB port in config.toml.'
    }
    $content = [regex]::Replace($content, $dbPortPattern, '${1}55432')

    $shadowPortPattern = '(?m)(^\[db\]\r?\n(?:(?!^\[).*\r?\n)*?^\s*shadow_port\s*=\s*)(?:54320|55420)\b'
    if ([regex]::IsMatch($content, $shadowPortPattern)) {
        $content = [regex]::Replace($content, $shadowPortPattern, '${1}55420')
    }
    # Ensure remote and local Postgres major versions align.
    $majorPattern = '(?m)(^\[db\]\r?\n(?:(?!^\[).*\r?\n)*?^\s*major_version\s*=\s*)\d+\b'
    if ([regex]::IsMatch($content, $majorPattern)) {
        $content = [regex]::Replace($content, $majorPattern, '${1}17')
    }
    else {
        # Some Supabase CLI templates omit or comment out major_version.
        # Add the explicit setting under [db] rather than assuming its presence.
        $dbSection = [regex]::Match($content, '(?m)^\[db\][ \t]*\r?

    [IO.File]::WriteAllText(
        $configPath, $content, (New-Object System.Text.UTF8Encoding($false))
    )

    if (Test-Path -LiteralPath (Join-Path $workspace 'supabase\.temp\project-ref')) {
        throw 'Unexpected remote project link found in isolated workspace.'
    }

    Write-Host ''
    Write-Host 'Isolated local Supabase configuration prepared.'
    Write-Host 'Local project id: dioxyzine_frog_restore_drill'
    Write-Host 'Local Postgres port: 55432'
    Write-Host 'Local Postgres major version: 17'
    Write-Host 'Automatic schema migrations: disabled'
    Write-Host 'Automatic seed: disabled'
    Write-Host 'Remote project link: absent'
    Write-Host 'No databases, containers or backups were altered.'
    Write-Host ''
    Write-Host 'Next step (NOT executed): validate CLI db start help and start only the local database.'
}
finally {
    Pop-Location
}
)
        if (-not $dbSection.Success) {
            throw 'Supabase config has no [db] section. Refusing to alter it.'
        }
        $content = $content.Insert($dbSection.Index + $dbSection.Length, "`nmajor_version = 17")
    }

    if (-not ($content -match '(?m)^\[db\][ \t]*\r?

    [IO.File]::WriteAllText(
        $configPath, $content, (New-Object System.Text.UTF8Encoding($false))
    )

    if (Test-Path -LiteralPath (Join-Path $workspace 'supabase\.temp\project-ref')) {
        throw 'Unexpected remote project link found in isolated workspace.'
    }

    Write-Host ''
    Write-Host 'Isolated local Supabase configuration prepared.'
    Write-Host 'Local project id: dioxyzine_frog_restore_drill'
    Write-Host 'Local Postgres port: 55432'
    Write-Host 'Local Postgres major version: 17'
    Write-Host 'Automatic schema migrations: disabled'
    Write-Host 'Automatic seed: disabled'
    Write-Host 'Remote project link: absent'
    Write-Host 'No databases, containers or backups were altered.'
    Write-Host ''
    Write-Host 'Next step (NOT executed): validate CLI db start help and start only the local database.'
}
finally {
    Pop-Location
}
) -or
        -not ($content -match '(?m)^\[db\.migrations\][ \t]*\r?

    [IO.File]::WriteAllText(
        $configPath, $content, (New-Object System.Text.UTF8Encoding($false))
    )

    if (Test-Path -LiteralPath (Join-Path $workspace 'supabase\.temp\project-ref')) {
        throw 'Unexpected remote project link found in isolated workspace.'
    }

    Write-Host ''
    Write-Host 'Isolated local Supabase configuration prepared.'
    Write-Host 'Local project id: dioxyzine_frog_restore_drill'
    Write-Host 'Local Postgres port: 55432'
    Write-Host 'Local Postgres major version: 17'
    Write-Host 'Automatic schema migrations: disabled'
    Write-Host 'Automatic seed: disabled'
    Write-Host 'Remote project link: absent'
    Write-Host 'No databases, containers or backups were altered.'
    Write-Host ''
    Write-Host 'Next step (NOT executed): validate CLI db start help and start only the local database.'
}
finally {
    Pop-Location
}
) -or
        -not ($content -match '(?m)^\[db\.seed\][ \t]*\r?

    [IO.File]::WriteAllText(
        $configPath, $content, (New-Object System.Text.UTF8Encoding($false))
    )

    if (Test-Path -LiteralPath (Join-Path $workspace 'supabase\.temp\project-ref')) {
        throw 'Unexpected remote project link found in isolated workspace.'
    }

    Write-Host ''
    Write-Host 'Isolated local Supabase configuration prepared.'
    Write-Host 'Local project id: dioxyzine_frog_restore_drill'
    Write-Host 'Local Postgres port: 55432'
    Write-Host 'Local Postgres major version: 17'
    Write-Host 'Automatic schema migrations: disabled'
    Write-Host 'Automatic seed: disabled'
    Write-Host 'Remote project link: absent'
    Write-Host 'No databases, containers or backups were altered.'
    Write-Host ''
    Write-Host 'Next step (NOT executed): validate CLI db start help and start only the local database.'
}
finally {
    Pop-Location
}
)) {
        throw 'Configuration sections were not preserved. Refusing to save an invalid config.'
    }

    [IO.File]::WriteAllText(
        $configPath, $content, (New-Object System.Text.UTF8Encoding($false))
    )

    if (Test-Path -LiteralPath (Join-Path $workspace 'supabase\.temp\project-ref')) {
        throw 'Unexpected remote project link found in isolated workspace.'
    }

    Write-Host ''
    Write-Host 'Isolated local Supabase configuration prepared.'
    Write-Host 'Local project id: dioxyzine_frog_restore_drill'
    Write-Host 'Local Postgres port: 55432'
    Write-Host 'Local Postgres major version: 17'
    Write-Host 'Automatic schema migrations: disabled'
    Write-Host 'Automatic seed: disabled'
    Write-Host 'Remote project link: absent'
    Write-Host 'No databases, containers or backups were altered.'
    Write-Host ''
    Write-Host 'Next step (NOT executed): validate CLI db start help and start only the local database.'
}
finally {
    Pop-Location
}
