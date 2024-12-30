@echo off
:: Enable delayed expansion for variable management
setlocal EnableDelayedExpansion

:: --- Node.js Setup ---
echo Verifying if Node.js is available...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed, installing it...
    curl -o node-setup.msi https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi
    msiexec /i node-setup.msi /quiet
    if %errorlevel% neq 0 (
        echo Error while installing Node.js.
        exit /b 1
    ) else (
        echo Node.js was successfully installed.
    )
    del node-setup.msi
) else (
    echo Node.js is already installed.
)

:: --- Python 3 Setup ---
echo Verifying if Python 3 is available...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python 3 is not installed, installing it...
    curl -o python-setup.exe https://www.python.org/ftp/python/3.11.5/python-3.11.5-amd64.exe
    python-setup.exe /quiet InstallAllUsers=1 PrependPath=1
    if %errorlevel% neq 0 (
        echo Error while installing Python 3.
        exit /b 1
    ) else (
        echo Python 3 was successfully installed.
    )
    del python-setup.exe
) else (
    echo Python 3 is already installed.
)

:: --- Running the setup multiple times will try to launch the process on port 8000 again ---
:: --- Which will cause an error as the port is already occupied by the old process ---
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do set PID=%%a

:: Check if a PID was found
if defined PID (
    echo Process on port 8000 found with PID: %PID%
    taskkill /PID %PID% /F
)


:: --- src-back Setup ---
echo Running src-back build...
cd src-back
python -m venv env
call env\Scripts\activate.bat
python ./app/sql_script.py
openssl rand -hex 32 > JWT_SECRET
py -m pip install -r requirements.txt
start cmd /K "fastapi run ./app/main.py"
cd ..

:: --- src-front Setup ---
echo Running src-front build...
cd src-front
npm ci