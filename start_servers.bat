@echo off
echo ================================
echo FastAPI + React 통합 실행
echo ================================
echo.

echo [1/2] FastAPI 백엔드 서버 시작...
start "FastAPI Backend" cmd /k "cd /d D:\fastapi && python run.py"

timeout /t 3 /nobreak >nul

echo [2/2] React 프론트엔드 서버 시작...
start "React Frontend" cmd /k "cd /d D:\projects\FianlProject_webApplication\frontend && npm start"

echo.
echo ================================
echo 서버 실행 완료!
echo ================================
echo.
echo FastAPI: http://192.168.0.40:8000
echo React: http://192.168.0.40:3000
echo.
echo 종료하려면 각 터미널 창을 닫으세요.
echo.
pause
