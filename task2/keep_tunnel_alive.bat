@echo off
REM Keep tunnel alive - restarts cloudflared if it dies
REM Usage: Double-click this file to start the tunnel

:restart
echo [%date% %time%] Starting Cloudflare Tunnel...
cd /d "%~dp0"
start /B cloudflared.exe tunnel --url http://127.0.0.1:8000 > /tmp/tunnel.log 2>&1

REM Wait 60 seconds, then check if cloudflared is still running
timeout /t 60 /nobreak >nul

tasklist /FI "IMAGENAME eq cloudflared.exe" 2>nul | find /I "cloudflared.exe" >nul
if errorlevel 1 (
    echo [%date% %time%] Tunnel died! Restarting...
    goto restart
) else (
    echo [%date% %time%] Tunnel still alive. Checking again in 60s...
    goto restart
)
