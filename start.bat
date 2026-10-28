@echo off
rem Serve the site locally: start.bat [port]  (picks the next free port if taken)
setlocal
cd /d "%~dp0"

set "PORT=%~1"
if "%PORT%"=="" set "PORT=8080"

rem Find Python: the "py" launcher first, then "python"
set "PY="
where py >nul 2>&1 && set "PY=py -3"
if not defined PY (
  python --version >nul 2>&1 && set "PY=python"
)
if not defined PY (
  echo Python 3 is not installed. Get it from https://www.python.org/downloads/
  echo ^(tick "Add python.exe to PATH" in the installer^), then run this again.
  pause
  exit /b 1
)

:findport
netstat -an | findstr /r /c:":%PORT% .*LISTENING" >nul
if not errorlevel 1 (
  echo Port %PORT% is in use, trying next one
  set /a PORT+=1
  goto findport
)

echo CollegeMC site -^> http://localhost:%PORT%/  (Ctrl+C or close this window to stop)
start "" "http://localhost:%PORT%/"
%PY% -m http.server %PORT% --bind 127.0.0.1
pause
