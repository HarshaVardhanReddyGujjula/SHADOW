@echo off
title Push SHADOW to GitHub
color 0B

echo ========================================================
echo   SHADOW - PUSH TO GITHUB HELPER
echo ========================================================
echo.

cd /d "D:\shadow"

echo Current Git Status:
git status -s
echo.

set /p REPO_URL="Enter your GitHub Repository URL (e.g., https://github.com/USERNAME/shadow.git): "

if "%REPO_URL%"=="" (
    echo.
    echo [ERROR] No repository URL entered!
    pause
    exit /b
)

echo.
echo Setting remote origin to %REPO_URL% ...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

echo Renaming branch to main...
git branch -M main

echo.
echo Pushing code to GitHub...
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   SUCCESS! SHADOW has been pushed to your GitHub repo!
    echo ========================================================
) else (
    echo [ERROR] Git push failed. Please check your GitHub credentials/permissions.
)

pause
