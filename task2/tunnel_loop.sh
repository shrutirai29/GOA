#!/bin/bash
# Auto-restart tunnel loop
cd "$(dirname "$0")"
while true; do
    echo "[$(date)] Starting cloudflared tunnel..."
    ./cloudflared.exe tunnel --url http://127.0.0.1:8000 2>&1 | grep --line-buffered "trycloudflare.com"
    echo "[$(date)] Tunnel exited! Restarting in 5s..."
    sleep 5
done
