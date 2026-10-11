@echo off
title Create HMS Desktop Shortcut - Developed by Sajjad Qaiser Shah
echo ==========================================================
echo   CREATING DESKTOP SHORTCUT FOR HOSPITAL MANAGEMENT SYSTEM
echo ==========================================================
echo.

set "APP_DIR=%~dp0"
set "BAT_PATH=%APP_DIR%Run_HMS.bat"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $Desktop = $WshShell.SpecialFolders('Desktop'); $Shortcut = $WshShell.CreateShortcut(\"$Desktop\Hospital Management System.lnk\"); $Shortcut.TargetPath = '%BAT_PATH%'; $Shortcut.WorkingDirectory = '%APP_DIR%'; $Shortcut.WindowStyle = 7; $Shortcut.Description = 'Hospital Management System - Developed by Sajjad Qaiser Shah'; $Shortcut.Save()"

echo [SUCCESS] Aap ke Desktop par "Hospital Management System" ka shortcut ban gaya hai!
echo Ab aap bina internet (Offline) bhi Desktop se double-click kar ke HMS chala sakte hain.
echo.
pause
