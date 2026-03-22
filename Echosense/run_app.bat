@echo off
TITLE EchoSense - Music Recognition System
echo [1/3] Checking Root Dependencies...
if not exist "node_modules" (
    echo [!] Root node_modules not found. Installing concurrently...
    npm install
)

echo [2/3] Verifying Backend Virtual Environment...
if not exist ".venv" (
    echo [!] .venv not found. Please ensure you have created a virtual environment in the root.
    echo [!] Run: python -m venv .venv
    pause
    exit /b
)

echo [3/3] Launching Backend and Frontend...
echo Press Ctrl+C to stop both services.
npm run dev
pause
