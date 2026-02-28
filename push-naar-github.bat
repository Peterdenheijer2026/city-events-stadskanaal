@echo off
cd /d "%~dp0"
echo Verbinden met bestaande GitHub-repo en pushen...
echo.

REM Git zoeken (GitHub Desktop of standaard installatie)
set GIT=
if exist "C:\Program Files\Git\bin\git.exe" set GIT="C:\Program Files\Git\bin\git.exe"
if exist "C:\Program Files (x86)\Git\bin\git.exe" set GIT="C:\Program Files (x86)\Git\bin\git.exe"
if "%GIT%"=="" for /d %%i in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do if exist "%%i\resources\app\git\cmd\git.exe" set GIT="%%i\resources\app\git\cmd\git.exe"

if "%GIT%"=="" (
    echo Git niet gevonden. Installeer van https://git-scm.com
    pause
    exit /b 1
)

%GIT% remote remove origin 2>nul
%GIT% remote add origin https://github.com/Peterdenheijer2026/city-events-stadskanaal.git
echo Eerst wijzigingen van GitHub ophalen...
%GIT% pull origin main --allow-unrelated-histories --no-edit --no-rebase
if errorlevel 1 (
    echo Pull mislukt. Probeer handmatig: git pull origin main --allow-unrelated-histories
    pause
    exit /b 1
)
echo Nu pushen...
%GIT% push -u origin main

echo.
echo Klaar. Druk op een toets om te sluiten.
pause
