@echo off
title Install Voice RAG Auto-Start
echo.
echo ========================================
echo   Installing Voice RAG Auto-Start
echo   (runs tunnel on every boot)
echo ========================================
echo.

REM Create a shortcut in the Startup folder
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SCRIPT=%~dp0keep_alive_forever.ps1"

REM Create a VBS launcher (hidden window, no console popup)
echo Set WshShell = CreateObject("WScript.Shell") > "%STARTUP%\VoiceRAG.vbs"
echo WshShell.Run "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File ""%SCRIPT%""", 0, False >> "%STARTUP%\VoiceRAG.vbs"

echo.
echo DONE! Tunnel will auto-start on every boot.
echo.
echo To REMOVE: delete "%STARTUP%\VoiceRAG.vbs"
echo.
pause
