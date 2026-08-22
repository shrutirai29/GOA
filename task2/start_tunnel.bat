@echo off
title Voice RAG - Keep Alive
color 0A
echo ============================================
echo   Voice RAG - Persistent Tunnel
echo   Never lets the tunnel die
echo ============================================
echo.

:loop
echo [%date% %time%] Starting tunnel...
cd /d "%~dp0"

REM Start cloudflared in background
start /B cloudflared.exe tunnel --url http://127.0.0.1:8000 > %TEMP%\rag_tunnel.log 2>&1

REM Wait 20 seconds for tunnel to establish
timeout /t 20 /nobreak >nul

REM Find the URL
for /f "tokens=*" %%a in ('findstr /c:"trycloudflare" %TEMP%\rag_tunnel.log 2^>nul') do set TUNNEL_LINE=%%a

REM Extract URL from the line
for /f "tokens=2" %%b in ("%TUNNEL_LINE%") do set TUNNEL_URL=%%b

echo.
echo ============================================
echo   TUNNEL LIVE: %TUNNEL_URL%
echo   Share this link for submission!
echo ============================================
echo.

REM Monitor: restart if tunnel dies
:check
timeout /t 30 /nobreak >nul
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>nul | find /I "cloudflared.exe" >nul
if errorlevel 1 (
    echo [%date% %time%] Tunnel crashed! Restarting...
    goto loop
)
goto check
