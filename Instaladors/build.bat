@echo off
REM Script de compilacio per a Assignador Destinacions (Tauri)

echo ========================================
echo Assignador Destinacions - Compilador
echo ========================================
echo.

if not exist "..\app_tauri\package.json" (
    echo ERROR: Aquest script s'ha d'executar des de la carpeta Instaladors
    pause
    exit /b 1
)

echo Compilant l'aplicacio Tauri (Rust + Frontend)...
echo Aixo pot trigar uns minuts...
echo.

cd ..\app_tauri
call npm install
call npm run tauri build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: La compilacio ha fallat
    pause
    exit /b 1
)

echo.
echo ========================================
echo Compilacio completada amb exit!
echo ========================================
echo.
echo L'instal·lador / executable (.msi / .exe) es troba a:
echo %CD%\src-tauri\target\release\bundle\
echo.
pause
