# Register RAG Server to auto-start on login
$action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument '/c cd /d D:\projects\goa\task2 && D:\projects\goa\task2\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info'
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName 'RAG-Server' -Action $action -Trigger $trigger -Settings $settings -Force -Description 'HH Goa RAG System - auto-start on login'
Write-Host 'Scheduled task created successfully!'

# Also create tunnel auto-start task
$action2 = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument '/c cd /d D:\projects\goa\task2 && D:\projects\goa\task2\cloudflared.exe tunnel --url http://127.0.0.1:8000'
$trigger2 = New-ScheduledTaskTrigger -AtLogOn
$settings2 = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName 'RAG-Tunnel' -Action $action2 -Trigger $trigger2 -Settings $settings2 -Force -Description 'HH Goa RAG Tunnel - auto-start on login'
Write-Host 'Tunnel task created successfully!'
