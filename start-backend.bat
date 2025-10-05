@echo off
echo Starting DugaWeld Backend...
echo.

REM Проверяем наличие Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Java не найдена в PATH. Пожалуйста, установите Java или добавьте в PATH.
    pause
    exit /b 1
)

REM Компилируем и запускаем через Maven Wrapper
echo Компилируем проект...
call mvnw.cmd clean compile -q

if %errorlevel% neq 0 (
    echo Ошибка компиляции!
    pause
    exit /b 1
)

echo Запускаем приложение...
call mvnw.cmd spring-boot:run

pause

