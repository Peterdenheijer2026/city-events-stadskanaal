@echo off
REM Start altijd vanuit de projectmap, daarna het echte deploy-script
cd /d "%~dp0"
call "%~dp0deploy-naar-vercel.bat"
