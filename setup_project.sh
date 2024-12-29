#!/bin/bash

# --- Node.js Setup ---
echo "Verifying if Node.js is available..."
if ! node --version >/dev/null 2>&1; then
    echo "Node.js is not installed, installing it..."
    curl -o node-setup.tar.xz https://nodejs.org/dist/v18.17.1/node-v18.17.1-linux-x64.tar.xz
    tar -xf node-setup.tar.xz
    sudo mv node-v18.17.1-linux-x64 /usr/local/lib/nodejs
    export PATH="/usr/local/lib/nodejs/bin:$PATH"
    echo 'export PATH="/usr/local/lib/nodejs/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc
    rm node-setup.tar.xz
    if ! node --version >/dev/null 2>&1; then
        echo "Error while installing Node.js."
        exit 1
    else
        echo "Node.js was successfully installed."
    fi
else
    echo "Node.js is already installed."
fi

# --- Python 3 Setup ---
echo "Verifying if Python 3 is available..."
if ! python3 --version >/dev/null 2>&1; then
    echo "Python 3 is not installed, installing it..."
    sudo apt update
    sudo apt install -y python3 python3-venv python3-pip
    if ! python3 --version >/dev/null 2>&1; then
        echo "Error while installing Python 3."
        exit 1
    else
        echo "Python 3 was successfully installed."
    fi
else
    echo "Python 3 is already installed."
fi

# --- Handle process on port 8000 ---
echo "Checking for processes on port 8000..."
PID=$(lsof -t -i:8000)
if [ -n "$PID" ]; then
    echo "Process on port 8000 found with PID: $PID"
    kill -9 "$PID"
fi

# --- src-back Setup ---
echo "Running src-back build..."
cd src-back || exit
python3 -m venv env
source env/bin/activate
python3 ./app/sql_script.py
openssl rand -hex 32 > JWT_SECRET
pip install -r requirements.txt
gnome-terminal -- bash -c "uvicorn app.main:app --host 0.0.0.0 --port 8000; exec bash"
cd ..

# --- src-front Setup ---
echo "Running src-front build..."
cd src-front || exit
npm ci