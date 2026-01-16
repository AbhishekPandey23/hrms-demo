@echo off
echo ========================================
echo HRMS Backend Setup Script
echo ========================================
echo.

echo Step 1: Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    exit /b 1
)
echo Virtual environment activated successfully
echo.

echo Step 2: Installing/Upgrading Prisma...
python -m pip install --upgrade prisma
if errorlevel 1 (
    echo ERROR: Failed to install Prisma
    exit /b 1
)
echo Prisma installed successfully
echo.

echo Step 3: Generating Prisma Client...
python -m prisma generate
if errorlevel 1 (
    echo ERROR: Failed to generate Prisma client
    exit /b 1
)
echo Prisma client generated successfully
echo.

echo Step 4: Pushing database schema...
python -m prisma db push
if errorlevel 1 (
    echo WARNING: Database push failed - you may need to check your DATABASE_URL
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You can now run the server with:
echo   fastapi dev main.py
echo.
pause
