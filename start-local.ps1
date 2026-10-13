$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$huntmateNpm = 'C:\Program Files\nodejs\npm.cmd'
if (-not (Test-Path -LiteralPath $huntmateNpm)) { $huntmateNpm = (Get-Command npm.cmd -ErrorAction Stop).Source }
if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'node_modules'))) {
    & $huntmateNpm install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw 'Instalacja zależności nie powiodła się.' }
}
& $huntmateNpm run db:init
if ($LASTEXITCODE -ne 0) { throw 'Inicjalizacja bazy nie powiodła się.' }
$huntmatePort = 3000
while ($huntmatePort -lt 3100) {
    $huntmateListener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $huntmatePort)
    try { $huntmateListener.Start(); $huntmateListener.Stop(); break } catch { $huntmatePort++ }
}
if ($huntmatePort -ge 3100) { throw 'Brak wolnego portu w zakresie 3000–3099.' }
$env:DEMO_MODE = 'true'
Write-Host "HuntMate: http://127.0.0.1:$huntmatePort" -ForegroundColor Yellow
Write-Host 'W górnym pasku wybierz konto klienta, wykonawcy lub administracji.'
& $huntmateNpm run dev -- --port $huntmatePort
