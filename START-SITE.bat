@echo off
cd /d "%~dp0"
REM Opent een venster dat OPEN BLIJFT (ook bij fouten)
start "City Events - Server" cmd /k "cd /d "%~dp0" && install-auto.bat"
