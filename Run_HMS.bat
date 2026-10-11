@echo off
title Hospital Management System - Developed by Sajjad Qaiser Shah
echo ==========================================================
echo   HOSPITAL MANAGEMENT SYSTEM (HMS) - OFFLINE DESKTOP MODE
echo   Developed by Sajjad Qaiser Shah
echo ==========================================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js aap ke computer mein install nahi hai!
    echo Baraye meharbani pehle https://nodejs.org se Node.js install karein.
    pause
    exit /b
)

if not exist "node_modules" (
    echo Pehli dafa packages install ho rahe hain...
    call npm install
)

echo.
echo HMS Offline Server start ho raha hai...
echo Desktop App Window khul rahi hai (http://localhost:3000)...
timeout /t 2 /nobreak >nul
start msedge --app=http://localhost:3000 2>nul || start chrome --app=http://localhost:3000 2>nul || start "" http://localhost:3000
call npm run dev
pause
