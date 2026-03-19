@echo off
cd /d "%~dp0"
REM Als dit script in htdocs staat, ga naar de projectmap waar .git staat
if not exist ".git" if exist "buidlingsite\.git" cd /d "%~dp0buidlingsite"
if not exist ".git" (
    echo FOUT: Geen Git-repo gevonden. Start dit script uit de map buidlingsite.
    echo Huidige map: %cd%
    pause
    exit /b 1
)
echo Werkmap: %cd%
echo ===== Deploy naar Vercel (commit + push naar GitHub) =====
echo.

REM Git zoeken
set GIT=
if exist "C:\Program Files\Git\bin\git.exe" set GIT="C:\Program Files\Git\bin\git.exe"
if exist "C:\Program Files (x86)\Git\bin\git.exe" set GIT="C:\Program Files (x86)\Git\bin\git.exe"
if "%GIT%"=="" for /d %%i in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do if exist "%%i\resources\app\git\cmd\git.exe" set GIT="%%i\resources\app\git\cmd\git.exe"

if "%GIT%"=="" (
    echo Git niet gevonden. Installeer van https://git-scm.com of gebruik GitHub Desktop.
    pause
    exit /b 1
)

REM Remote instellen als die nog niet bestaat
%GIT% remote get-url origin 2>nul || (
    %GIT% remote add origin https://github.com/Peterdenheijer2026/city-events-stadskanaal.git
)

echo 1. Wijzigingen toevoegen...
%GIT% add .
echo 2. Status controleren...
%GIT% status --short
if %errorlevel% neq 0 (
    echo Er ging iets mis bij git add.
    pause
    exit /b 1
)

echo 3. Commit maken...
%GIT% commit -m "Update site - %date% %time:~0,5%" 2>nul
if errorlevel 1 (
    echo Geen wijzigingen om te committen, of commit mislukt.
    echo Je kunt alsnog pushen als er al commits klaarstaan.
)

echo 4. Ophalen van GitHub...
%GIT% pull origin main --allow-unrelated-histories --no-edit --no-rebase 2>nul
echo 5. Pushen naar GitHub...
%GIT% push -u origin main

if errorlevel 1 (
    echo.
    echo Push mislukt. Controleer of je bent ingelogd bij GitHub en of er conflicten zijn.
) else (
    echo.
    echo Klaar. Vercel start nu automatisch een nieuwe deployment.
    echo Bekijk de status op vercel.com bij je project - Deployments.
)

echo.
pause
