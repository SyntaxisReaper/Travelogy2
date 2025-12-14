@echo off
echo Starting TraveLogy Servers...

echo.
echo =================================
echo Starting Django Backend Server...
echo =================================
cd backend
start "Django Server" cmd /k "python manage.py runserver 8000"

echo.
echo Waiting for Django server to start...
timeout /t 3 /nobreak > nul

echo.
echo ===============================
echo Starting React Frontend Server...
echo ===============================
cd ../frontend
start "React Server" cmd /k "npm start"

echo.
echo =================================
echo Both servers are starting!
echo =================================
echo Django Backend: http://localhost:8000
echo React Frontend: http://localhost:3000
echo Admin Panel: http://localhost:8000/admin
echo.
echo Username: admin
echo Password: admin
echo.
echo Press any key to exit this script...
pause > nul