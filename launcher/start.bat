@echo off
REM MiMoCode Project Launcher - Start Script
REM This script bypasses PowerShell execution policy

echo Starting MiMoCode Project Launcher...
echo.

powershell.exe -ExecutionPolicy Bypass -NoExit -Command "cd '%~dp0'; .\mimo-launcher.ps1"
