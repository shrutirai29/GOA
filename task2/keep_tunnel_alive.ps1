# Keep Tunnel Alive - runs forever, restarts cloudflared if it crashes
# Usage: Right-click → Run with PowerShell

$ErrorActionPreference = "SilentlyContinue"
$port = 8000
$logFile = "C:\temp\tunnel_persistent.log"

Write-Host "Starting persistent tunnel on port $port..." -ForegroundColor Green

while ($true) {
    # Kill any existing cloudflared
    Get-Process cloudflare -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2

    # Start new tunnel
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Starting tunnel..." -ForegroundColor Yellow
    $proc = Start-Process -FilePath "cloudflared.exe" `
        -ArgumentList "tunnel --url http://127.0.0.1:$port" `
        -RedirectStandardOutput $logFile `
        -RedirectStandardError "$logFile.err" `
        -NoNewWindow -PassThru

    # Wait 15 seconds for tunnel to establish
    Start-Sleep -Seconds 15

    # Read the tunnel URL
    $url = (Get-Content $logFile -ErrorAction SilentlyContinue | Select-String "trycloudflare" | Select-Object -Last 1)
    if ($url) {
        Write-Host "TUNNEL LIVE: $url" -ForegroundColor Green
    }

    # Monitor loop - restart if tunnel dies
    while (-not $proc.HasExited) {
        Start-Sleep -Seconds 30
    }

    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Tunnel died! Restarting in 3 seconds..." -ForegroundColor Red
    Start-Sleep -Seconds 3
}
