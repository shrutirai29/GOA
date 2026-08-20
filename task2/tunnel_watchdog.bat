@echo off
REM Tunnel watchdog - restarts cloudflared automatically if it crashes
REM Run this once and it will keep the tunnel alive forever

set TUNNEL_EXE=%~dp0cloudflared.exe
set TUNNEL_URL=http://127.0.0.1:8000
set LOG_FILE=%~dp0tunnel_watchdog.log

echo [%date% %time%] Tunnel watchdog started >> "%LOG_FILE%"

:restart
echo [%date% %time%] Starting cloudflared tunnel... >> "%LOG_FILE%"
echo Starting tunnel (will auto-restart if it dies)...

"%TUNNEL_EXE%" tunnel --url %TUNNEL_URL% 2>> "%LOG_FILE%"

echo [%date% %time%] cloudflared exited, restarting in 3 seconds... >> "%LOG_FILE%"
echo Tunnel died! Restarting in 3 seconds...
timeout /t 3 /nobreak >nul
goto restart
