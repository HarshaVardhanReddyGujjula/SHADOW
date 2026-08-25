@echo off
title SHADOW Real-Time AI Threat Platform
color 0A

echo ========================================================
echo   SHADOW REAL-TIME AI THREAT PLATFORM - LAUNCHER
echo ========================================================
echo.

cd /d "D:\shadow"

echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "SHADOW - FastAPI Backend (Port 8000)" cmd /k "cd /d D:\shadow\backend && .\venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo [2/3] Starting React Vite Frontend on http://localhost:5173 ...
start "SHADOW - React Frontend (Port 5173)" cmd /k "cd /d D:\shadow\frontend && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Telemetry Simulator Streamer...
start "SHADOW - Traffic Simulator" cmd /k "cd /d D:\shadow\backend && .\venv\Scripts\python.exe simulator.py"

echo.
echo ========================================================
echo   ALL SERVICES ARE RUNNING!
echo   Frontend Dashboard: http://localhost:5173
echo   FastAPI API Docs:   http://127.0.0.1:8000/docs
echo   Chairman Login:     harsha / harsha
echo ========================================================
echo.

REM Automatically open browser
start http://localhost:5173
