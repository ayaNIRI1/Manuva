@echo off
echo ==========================================
echo   Manuva Project Startup Script
echo ==========================================
echo.

echo Starting Backend Server...
start "Manuva Backend" cmd /k "cd manuva-backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Manuva Frontend" cmd /k "cd manuva-frontend && npm run dev"

echo.
echo ==========================================
echo   Both servers are starting...
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:3001
echo ==========================================
echo.
echo Press any key to exit this window...
pause >nul
