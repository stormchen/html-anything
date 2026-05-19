@echo off
title HTML Anything - Desktop Shortcut Setup
color 0A

echo ===================================================
echo          HTML Anything Desktop Shortcut Setup
echo ===================================================
echo.

set "TARGET_PATH=%~dp0windows_start.bat"
set "WORKING_DIR=%~dp0"

echo Creating desktop shortcut...
echo Target: %TARGET_PATH%

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $path = Join-Path $desktop 'HTML Anything.lnk'; $s = $ws.CreateShortcut($path); $s.TargetPath = '%TARGET_PATH%'; $s.WorkingDirectory = '%WORKING_DIR%'; $s.Description = 'HTML Anything AI'; $s.IconLocation = 'shell32.dll,13'; $s.Save()"

if errorlevel 1 goto FAIL

echo.
echo [SUCCESS] Shortcut "HTML Anything" created on your desktop!
echo You can now double-click the shortcut anytime to launch the app.
goto END

:FAIL
echo.
echo [ERROR] Failed to create shortcut. Please check your permissions.

:END
echo.
pause
