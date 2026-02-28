@echo off
cd /d "%~dp0"

echo ========================================
echo   City Events - Site starten
echo ========================================
echo.
echo Map: %CD%
echo.

set LOG=install-log.txt
echo Datum: %date% %time% > "%LOG%"
echo. >> "%LOG%"

echo Stap 1: pakketten controleren...
call "C:\Program Files\nodejs\npm.cmd" install >> "%LOG%" 2>&1
echo Stap 1 klaar.
echo.

if not exist "node_modules\.bin\next.cmd" (
    echo FOUT: Next.js niet gevonden. Zie install-log.txt
    echo.
    pause
    exit /b 1
)

echo Stap 2: server starten...
echo.
echo --- Open in je browser: http://localhost:3000 ---
echo --- Laat dit venster OPEN ---
echo.
call "node_modules\.bin\next.cmd" dev

echo.
echo Server gestopt. Druk op een toets om dit venster te sluiten...
pause
