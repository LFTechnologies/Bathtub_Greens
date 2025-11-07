@echo off
echo ========================================
echo  AI-Powered News Blog - Quick Start
echo ========================================
echo.

REM Check if MongoDB is running
docker ps | findstr mongodb-news >nul
if errorlevel 1 (
    echo Starting MongoDB...
    docker run -d --rm --name mongodb-news -p 27017:27017 mongo:7.0
    timeout /t 3 /nobreak >nul
) else (
    echo MongoDB is already running
)

echo.
echo MongoDB: Running on port 27017
echo.
echo ========================================
echo  Next Steps:
echo ========================================
echo.
echo 1. Start Backend API (in a new terminal):
echo    cd node-news-api
echo    npm run dev
echo.
echo 2. Start Admin Frontend (in another terminal):
echo    cd admin
echo    npm run dev
echo.
echo 3. Seed Admin User (after backend starts):
echo    cd node-news-api
echo    npm run seed:admin
echo.
echo ========================================
echo  Service URLs:
echo ========================================
echo  Backend API:  http://localhost:4000
echo  Admin Panel:  http://localhost:3000
echo  MongoDB:      localhost:27017
echo.
pause
