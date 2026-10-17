# Synthetic SQL fixtures only. Requires a locally cached postgres:17 image.
[CmdletBinding()]
param()
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$fixtureRoot = Split-Path -Parent $PSScriptRoot
$containerName = 'dioxyzine-ticket-test-' + [Guid]::NewGuid().ToString('N')
$createdId = $null
try {
    $createdId = (& docker run -d --name $containerName --pull never --network none `
        --label dioxyzine.purpose=synthetic-ticket-test `
        --tmpfs /var/lib/postgresql/data:rw,size=268435456 `
        --env POSTGRES_HOST_AUTH_METHOD=trust --env POSTGRES_DB=inquiry_upload_disposable `
        --mount "type=bind,source=$fixtureRoot,target=/fixture,readonly" `
        postgres:17 postgres -c listen_addresses=).Trim()
    if ($LASTEXITCODE -ne 0) { throw 'Cannot create disposable PostgreSQL container' }
    $state = @(& docker inspect $containerName | ConvertFrom-Json)[0]
    if ($state.Id -ne $createdId -or $state.HostConfig.NetworkMode -ne 'none' -or
        @($state.HostConfig.PortBindings.PSObject.Properties).Count -ne 0) {
        throw 'Disposable database isolation check failed'
    }
    $ready = $false
    for ($attempt=0; $attempt -lt 40; $attempt++) {
        $mainProcess = (& docker exec $containerName cat /proc/1/comm 2>$null)
        & docker exec $containerName pg_isready -U postgres *> $null
        if ($LASTEXITCODE -eq 0 -and "$mainProcess".Trim() -eq 'postgres') {
            $ready=$true; break
        }
        Start-Sleep -Milliseconds 250
    }
    if (-not $ready) { throw 'Disposable PostgreSQL did not initialize' }
    & docker exec $containerName psql -X -U postgres -d inquiry_upload_disposable `
        -v ON_ERROR_STOP=1 -f /fixture/scripts/verify-inquiry-upload-ticket-disposable.sql
    if ($LASTEXITCODE -ne 0) { throw 'Upload ticket SQL regression failed' }
}
finally {
    if ($createdId) {
        $state = @(& docker inspect $containerName | ConvertFrom-Json)[0]
        if ($state.Id -eq $createdId -and $state.Config.Labels.'dioxyzine.purpose' -eq 'synthetic-ticket-test') {
            & docker rm -f $containerName | Out-Null
            if ($LASTEXITCODE -ne 0) { throw 'Disposable container cleanup failed' }
        }
    }
}
