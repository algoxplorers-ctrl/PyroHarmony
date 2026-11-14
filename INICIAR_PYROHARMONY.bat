@echo off
title PyroHarmony v2.0.0 - AlgoXplorers (NASA Space Apps Challenge 2026)
color 0B
echo ===============================================================================
echo   PYROHARMONY v2.0.0 - HARMONIZATION OF MODIS AND VIIRS HOT SPOTS
echo   Team AlgoXplorers (Argentina) - NASA Space Apps Challenge 2026
echo   100%% Wolf Amendment Compliant - Open Science (FAIR / MIT License)
echo ===============================================================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [1/2] Node.js detectado. Compilando arquitectura MVC en app.bundle.js...
    node build_bundle.mjs
) else (
    echo [1/2] Modo Autonomo Zero-Dependency activado (usando app.bundle.js precompilado)...
)

echo [2/2] Abriendo Centro de Comando PyroHarmony (index.html) y Dossier Ejecutivo...
start "" "%~dp0index.html"
echo.
echo Listo. La interfaz se ha iniciado en su navegador predeterminado (Ingles por defecto, conmutable EN/ES).
timeout /t 4 >nul
exit /b 0
