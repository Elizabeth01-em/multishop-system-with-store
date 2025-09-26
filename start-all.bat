@echo off
TITLE Multishop System Starter

REM Check if required directories exist
cd backend >nul 2>&1
if errorlevel 1 (
    echo Error: Backend directory not found!
    pause
    exit /b 1
)

cd ..
cd admin-dashboard >nul 2>&1
if errorlevel 1 (
    echo Error: Admin Dashboard directory not found!
    pause
    exit /b 1
)

cd ..
cd ecommerce-store >nul 2>&1
if errorlevel 1 (
    echo Error: E-commerce Store directory not found!
    pause
    exit /b 1
)

cd ..

REM Check if .env file exists in backend
cd backend
if not exist ".env" (
    echo Warning: .env file not found in backend directory!
    echo Please create a .env file with database and JWT configuration.
    echo Refer to RUNNING_THE_APPLICATION.md for details.
    pause
    exit /b 1
)
cd ..

echo ==========================================
echo    Multishop System Starting...
echo ==========================================

echo.
echo 1. Starting Backend API Server...
start "Backend API" cmd /k "cd backend && npm run start:dev"

timeout /t 15 /nobreak >nul

echo.
echo 2. Starting Admin Dashboard...
start "Admin Dashboard" cmd /k "cd admin-dashboard && npm start"

timeout /t 15 /nobreak >nul

echo.
echo 3. Starting E-commerce Store...
start "E-commerce Store" cmd /k "cd ecommerce-store && npm run dev"

echo.
echo ==========================================
echo    All components started!
echo ==========================================
echo.
echo Access the applications at:
echo - Admin Dashboard: http://localhost:3000
echo - E-commerce Store: http://localhost:3001
echo - Backend API: http://localhost:3002
echo.
echo Login as owner with:
echo - Email: owner@test.com
echo - Password: password123
echo.
echo Note: Please wait for all applications to fully initialize.
echo You can close this window now.
pause