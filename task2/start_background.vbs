' Start RAG system completely in background (no visible window)
' Double-click this file to launch everything silently

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

task2 = fso.GetParentFolderName(WScript.ScriptFullName) & "\"

' Start uvicorn server
WshShell.Run """" & task2 & ".venv\Scripts\python.exe"" -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info", 0, False

' Wait for server to load
WScript.Sleep 35000

' Start tunnel watchdog loop
Do
    WshShell.Run """" & task2 & "cloudflared.exe"" tunnel --url http://127.0.0.1:8000", 0, True
    WScript.Sleep 5000
Loop
