@echo off
title HTML Anything Server Console
color 0B

echo ===================================================
echo           HTML Anything Server Launcher
echo ===================================================
echo.
echo Checking pnpm environment...

where pnpm >nul 2>nul
if errorlevel 1 goto NOPNPM

echo Starting Next.js dev server (pnpm dev)...
echo Browser will automatically open http://localhost:3000 in 3 seconds.
echo.
echo [TIP] To stop the server, simply close this console window!
echo ===================================================

start "" /b powershell -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

pnpm dev
goto END

:NOPNPM
echo [ERROR] pnpm not found! Please install Node.js and pnpm first.
echo Tip: You can install pnpm via "npm install -g pnpm".
pause
exit /b 1

:END
