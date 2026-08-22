# Voice RAG - Forever Alive Script
# Run this ONCE and it keeps everything alive forever
# Usage: Right-click → Run with PowerShell

$ErrorActionPreference = "SilentlyContinue"
$port = 8000
$taskName = "VoiceRAG_Tunnel"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Voice RAG - Never-Die Tunnel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing instances
Get-Process cloudflare -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*uvicorn*" } | Stop-Process -Force
Start-Sleep -Seconds 2

# Start the server
Write-Host "[1/3] Starting API server..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot"
# Load .env file if it exists
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.+)$") {
            [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
        }
    }
    Write-Host "  Loaded .env file" -ForegroundColor Green
}
$env:LIGHTWEIGHT_MODE = "false"
Start-Process -FilePath ".venv\Scripts\python.exe" -ArgumentList "-m","uvicorn","backend.main:app","--host","127.0.0.1","--port","$port" -WindowStyle Hidden
Write-Host "  Server starting on port $port..." -ForegroundColor Green

# Wait for server
Start-Sleep -Seconds 35
try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/health" -TimeoutSec 5
    Write-Host "  Server OK (views: $($health.index_count))" -ForegroundColor Green
} catch {
    Write-Host "  Server may still be loading, continuing..." -ForegroundColor Yellow
}

# Start tunnel
Write-Host "[2/3] Starting Cloudflare tunnel..." -ForegroundColor Yellow
$global:tunnelUrl = ""
$global:logFile = "$env:TEMP\rag_tunnel_forever.log"

function Start-Tunnel {
    Get-Process cloudflare -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    Start-Process -FilePath "$PSScriptRoot\cloudflared.exe" -ArgumentList "tunnel --url http://127.0.0.1:$port" -RedirectStandardOutput $global:logFile -RedirectStandardError "$global:logFile.err" -NoNewWindow
    Start-Sleep -Seconds 15
    $line = Get-Content $global:logFile -ErrorAction SilentlyContinue | Select-String "trycloudflare" | Select-Object -Last 1
    if ($line) {
        $global:tunnelUrl = ($line.ToString() -split '\|')[1].Trim()
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  TUNNEL LIVE:" -ForegroundColor Green
        Write-Host "  $global:tunnelUrl" -ForegroundColor White
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
    }
    return $global:tunnelUrl
}

Start-Tunnel

# Register a scheduled task to restart tunnel every 3 hours (prevents death)
Write-Host "[3/3] Setting up auto-restart task..." -ForegroundColor Yellow
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-WindowStyle Hidden -Command `"Get-Process cloudflare -ErrorAction SilentlyContinue | Stop-Process -Force; Start-Sleep 5; cd '$PSScriptRoot'; Start-Process cloudflared.exe -ArgumentList 'tunnel --url http://127.0.0.1:$port'`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddHours(3) -RepetitionInterval (New-TimeSpan -Hours 3)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -AllowStartIfOnBatteries
try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force -Description "Keep Voice RAG tunnel alive" | Out-Null
    Write-Host "  Auto-restart task registered (every 3 hours)" -ForegroundColor Green
} catch {
    Write-Host "  Could not register task (non-admin) - script monitor will handle it" -ForegroundColor Yellow
}

# Monitor loop - restart if anything dies
Write-Host ""
Write-Host "Monitoring... Press Ctrl+C to stop." -ForegroundColor Cyan
Write-Host ""

while ($true) {
    Start-Sleep -Seconds 30

    # Check server
    try {
        $null = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/health" -TimeoutSec 5
    } catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Server died! Restarting..." -ForegroundColor Red
        Start-Process -FilePath ".venv\Scripts\python.exe" -ArgumentList "-m","uvicorn","backend.main:app","--host","127.0.0.1","--port","$port" -WindowStyle Hidden
        Start-Sleep -Seconds 35
    }

    # Check tunnel
    $cloudflared = Get-Process cloudflare -ErrorAction SilentlyContinue
    if (-not $cloudflared) {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Tunnel died! Restarting..." -ForegroundColor Red
        Start-Tunnel
    }
}
