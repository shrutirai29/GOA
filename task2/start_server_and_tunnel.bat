@echo off
REM ============================================
REM  RAG System - Auto-restart Launcher
REM  Starts server + tunnel, restarts on crash
REM ============================================

set TASK2=%~dp0
set VENV_PY=%TASK2%.venv\Scripts\python.exe
set CLOUDFLARED=%TASK2%cloudflared.exe

echo.
echo ============================================
echo   HH Goa 2026 - Voice RAG System
echo   Auto-restart launcher
echo ============================================
echo.

REM Kill any existing instances
taskkill /F /IM cloudflared.exe >nul 2>&1
taskkill /F /IM python.exe /FI "WINDOWTITLE eq uvicorn*" >nul 2>&1

REM Start the server in background
echo [%time%] Starting uvicorn server on port 8000...
start "RAG-Server" /MIN cmd /c "cd /d %TASK2% && %VENV_PY% -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info > server.log 2>&1"

REM Wait for server to be ready
echo [%time%] Waiting for server to load models (30s)...
timeout /t 30 /nobreak >nul

:check_server
curl -s -m 5 http://127.0.0.1:8000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [%time%] Server not ready yet, waiting 10 more seconds...
    timeout /t 10 /nobreak >nul
    goto check_server
)
echo [%time%] Server is ready!

REM Start tunnel with auto-restart loop
echo [%time%] Starting Cloudflare tunnel...
echo.
echo ============================================
echo   LIVE URL (will be printed below):
echo ============================================
echo.

:tunnel_loop
"%CLOUDFLARED%" tunnel --url http://127.0.0.1:8000 2>&1 | findstr /C:"trycloudflare.com"
echo [%time%] Tunnel died! Restarting in 3 seconds...
timeout /t 3 /nobreak >nul
goto tunnel_loop
