@echo off
:: ==============================================================================
:: SCRIPT DE VERIFICACION Y PUSH SEGURO PARA GIT (WINDOWS)
:: Proyecto: PyroHarmony v2.0.0 - NASA Space Apps Challenge 2026
:: Proposito: Prevenir sobreescrituras y conflictos cuando dos o mas personas
::            trabajan simultaneamente en el mismo repositorio de GitHub.
:: ==============================================================================

:: Configuramos la consola para interpretar caracteres y acentos en UTF-8
chcp 65001 >nul

:: Habilitamos la expansion retardada de variables para manejar variables dentro de bloques IF
setlocal EnableDelayedExpansion

:: Configuramos el titulo de la ventana y el color (Fondo negro, texto cian/verde)
title Verificacion y Push Seguro a GitHub - PyroHarmony
color 0B

:: Nos aseguramos de situarnos en la carpeta raiz del repositorio donde esta guardado este script
cd /d "%~dp0"

echo ==============================================================================
echo       VERIFICACION DE SEGURIDAD ANTES DE PUSH - EQUIPO PYROHARMONY
echo ==============================================================================
echo.

:: ------------------------------------------------------------------------------
:: PASO 0: DETECTAR SI GIT ESTA INSTALADO EN EL SISTEMA
:: ------------------------------------------------------------------------------
:: Buscamos si el comando 'git' existe en el PATH del sistema operativo
set "GIT_CMD=git"
where git >nul 2>nul
if %ERRORLEVEL% EQU 0 goto GIT_OK

:: Si no esta en el PATH, verificamos rutas habituales de instalacion en Windows
if exist "C:\Program Files\Git\cmd\git.exe" (
    set "GIT_CMD=C:\Program Files\Git\cmd\git.exe"
    goto GIT_OK
)
if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
    set "GIT_CMD=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
    goto GIT_OK
)

:: Si no se encuentra Git en ninguna parte, alertamos al usuario y salimos
color 0C
echo [ERROR CRITICO] No se encontro Git instalado en esta computadora.
echo Por favor, instala Git desde: https://git-scm.com/download/win
echo O mediante PowerShell ejecutando: winget install --id Git.Git -e --source winget
echo.
pause
exit /b 1

:GIT_OK
:: Verificamos si la carpeta actual es un repositorio de Git valido
if not exist ".git" (
    color 0C
    echo [ERROR CRITICO] Esta carpeta no contiene un repositorio Git inicializado (.git no existe).
    echo.
    pause
    exit /b 1
)

:: Obtenemos el nombre de la rama actual (por ejemplo: main o master)
for /f "tokens=*" %%b in ('"%GIT_CMD%" branch --show-current 2^>nul') do set "RAMA_ACTUAL=%%b"
if "%RAMA_ACTUAL%"=="" set "RAMA_ACTUAL=main"

echo [RAMA ACTIVA] Trabajando sobre la rama: %RAMA_ACTUAL%
echo.

:: ------------------------------------------------------------------------------
:: PASO 1: VERIFICAR EL ESTADO ACTUAL LOCAL (git status)
:: ------------------------------------------------------------------------------
echo ==============================================================================
echo [PASO 1/4] Verificando el estado actual de tus archivos locales (git status)...
echo ==============================================================================
echo.

:: Ejecutamos git status para mostrar el estado completo
"%GIT_CMD%" status

echo.
:: Verificamos si hay archivos modificados o sin rastrear de forma resumida
for /f "tokens=*" %%s in ('"%GIT_CMD%" status --porcelain 2^>nul') do set "HAY_CAMBIOS_LOCALES=1"

:: Verificamos si hay un proceso de Merge o Conflicto pendiente sin resolver
if exist ".git\MERGE_HEAD" (
    color 0C
    echo ==============================================================================
    echo [ALERTA DE CONFLICTO] Hay una fusion (merge) incompleta o en conflicto.
    echo Debes resolver los conflictos locales antes de poder hacer push.
    echo ==============================================================================
    echo.
    pause
    exit /b 1
)

echo [OK] Estado local inspeccionado correctamente.
echo.

:: ------------------------------------------------------------------------------
:: PASO 2: CONSULTAR CAMBIOS DEL REPOSITORIO REMOTO (git fetch)
:: ------------------------------------------------------------------------------
echo ==============================================================================
echo [PASO 2/4] Consultando ultimos cambios en GitHub (git fetch origin)...
echo ==============================================================================
echo Conectando con GitHub para revisar si tu companero subio cambios nuevos...
echo.

:: 'git fetch' descarga los metadatos e historial del remoto SIN tocar tus archivos locales
"%GIT_CMD%" fetch origin %RAMA_ACTUAL% 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] 'git fetch origin %RAMA_ACTUAL%' fallo o no encontro la rama remota.
    echo Intentando fetch general de todo el remoto origin...
    "%GIT_CMD%" fetch origin
    if %ERRORLEVEL% NEQ 0 (
        color 0E
        echo.
        echo [ADVERTENCIA] No se pudo conectar con el repositorio remoto de GitHub.
        echo Revisa tu conexion a Internet o tus permisos de acceso.
        echo.
        pause
        exit /b 1
    )
)

echo.
echo [OK] Historial remoto obtenido satisfactoriamente.
echo.

:: ------------------------------------------------------------------------------
:: PASO 3: COMPARAR HISTORIAL LOCAL VS REMOTO Y DETECTAR COMMITS PENDIENTES
:: ------------------------------------------------------------------------------
echo ==============================================================================
echo [PASO 3/4] Analizando divergencia entre tu copia local y la rama remota...
echo ==============================================================================
echo.

:: Inicializamos los contadores de diferencia
set "COMMITS_ATRAS=0"
set "COMMITS_ADELANTE=0"

:: Calculamos cuantos commits tiene la rama remota que tu NO tienes (COMMITS_ATRAS / behind)
for /f "tokens=*" %%c in ('"%GIT_CMD%" rev-list --count HEAD..origin/%RAMA_ACTUAL% 2^>nul') do (
    set "COMMITS_ATRAS=%%c"
)

:: Calculamos cuantos commits locales tienes listos que el remoto aun NO tiene (COMMITS_ADELANTE / ahead)
for /f "tokens=*" %%c in ('"%GIT_CMD%" rev-list --count origin/%RAMA_ACTUAL%..HEAD 2^>nul') do (
    set "COMMITS_ADELANTE=%%c"
)

:: SI LA RAMA REMOTA TIENE CAMBIOS NUEVOS: DETENEMOS EL PROCESO INMEDIATAMENTE
if %COMMITS_ATRAS% GTR 0 (
    color 0C
    echo ==============================================================================
    echo                 ¡¡¡ ALERTA DE SEGURIDAD - PUSH DETENIDO !!!
    echo ==============================================================================
    echo.
    echo Tu companero ha subido %COMMITS_ATRAS% cambio(s) nuevo(s) a GitHub que tu aun no tienes.
    echo.
    echo Si hicieras 'git push' ahora mismo:
    echo   1. GitHub rechazaria tu subida por no estar actualizado (non-fast-forward).
    echo   2. O podrias sobreescribir y perder el trabajo de tu companero de equipo.
    echo.
    echo ------------------------------------------------------------------------------
    echo ULTIMOS CAMBIOS REALIZADOS POR TU COMPANERO EN GITHUB:
    echo ------------------------------------------------------------------------------
    "%GIT_CMD%" log HEAD..origin/%RAMA_ACTUAL% --oneline --graph --decorate
    echo.
    echo ==============================================================================
    echo ACCION RECOMENDADA:
    echo   1. Ejecuta primero: git pull origin %RAMA_ACTUAL%
    echo   2. Integra y revisa los cambios de tu companero.
    echo   3. Luego vuelve a ejecutar este script para subir tus cambios de forma segura.
    echo ==============================================================================
    echo.
    pause
    exit /b 1
)

:: SI NO HAY CAMBIOS REMOTOS NUEVOS, CONTINUAMOS DE MANERA SEGURA
color 0A
echo [TODO SEGURO] Tu rama local esta al dia con los cambios remotos de tu companero.
echo No hay commits pendientes de descargar en origin/%RAMA_ACTUAL%.
echo.

:: Si el usuario tiene archivos locales modificados sin commitear, ofrecemos guardarlos
if defined HAY_CAMBIOS_LOCALES (
    color 0E
    echo ------------------------------------------------------------------------------
    echo [NOTIFICACION] Tienes archivos modificados localmente que aun no estan en un commit:
    "%GIT_CMD%" status -s
    echo ------------------------------------------------------------------------------
    echo.
    set "AUTO_COMMIT="
    set /p "AUTO_COMMIT=¿Deseas agregar todos estos archivos y crear un commit ahora? (S/N): "
    if /i "!AUTO_COMMIT!"=="S" (
        set "MSG_COMMIT="
        set /p "MSG_COMMIT=Ingresa el mensaje para este commit: "
        if "!MSG_COMMIT!"=="" set "MSG_COMMIT=Actualizacion de trabajo en equipo PyroHarmony"
        "%GIT_CMD%" add -A
        "%GIT_CMD%" commit -m "!MSG_COMMIT!"
        :: Recalculamos los commits listos para push
        for /f "tokens=*" %%c in ('"%GIT_CMD%" rev-list --count origin/%RAMA_ACTUAL%..HEAD 2^>nul') do set "COMMITS_ADELANTE=%%c"
        echo.
    )
)

:: Verificamos si realmente hay commits locales pendientes de subir
if %COMMITS_ADELANTE% EQU 0 (
    color 0B
    echo ==============================================================================
    echo [SIN CAMBIOS PENDIENTES]
    echo Tu repositorio local y GitHub estan exactamente en el mismo estado.
    echo No hay ningun commit nuevo para subir a GitHub.
    echo ==============================================================================
    echo.
    pause
    exit /b 0
)

:: ------------------------------------------------------------------------------
:: PASO 4: CONFIRMACION EXPLICITA DEL USUARIO ANTES DEL PUSH
:: ------------------------------------------------------------------------------
color 0B
echo ==============================================================================
echo [PASO 4/4] CONFIRMACION DE SEGURIDAD ANTES DE SUBIR A GITHUB
echo ==============================================================================
echo.
echo Tienes %COMMITS_ADELANTE% commit(s) local(es) listo(s) para publicarse en GitHub:
echo.
"%GIT_CMD%" log origin/%RAMA_ACTUAL%..HEAD --oneline --graph --decorate
echo.
echo Destino remoto: origin / rama: %RAMA_ACTUAL%
echo.

:: Pedimos confirmacion interactiva al usuario antes de enviar nada a la red
set "CONFIRMACION="
set /p "CONFIRMACION=¿Confirmas que deseas hacer PUSH a GitHub ahora mismo? (S/N): "

if /i "%CONFIRMACION%"=="S" (
    echo.
    echo Enviando cambios a GitHub (git push origin %RAMA_ACTUAL%)...
    echo.
    "%GIT_CMD%" push origin %RAMA_ACTUAL%
    if !ERRORLEVEL! EQU 0 (
        color 0A
        echo.
        echo ==============================================================================
        echo ¡PUSH COMPLETADO CON EXITO!
        echo Tus cambios ya estan sincronizados y disponibles para tu companero en:
        echo https://github.com/algoxplorers-ctrl/PyroHarmony
        echo ==============================================================================
    ) else (
        color 0C
        echo.
        echo ==============================================================================
        echo [ERROR] No se pudo completar el push a GitHub.
        echo Verifica si se solicitan credenciales en tu navegador o si falta autenticacion.
        echo ==============================================================================
    )
) else (
    color 0E
    echo.
    echo ==============================================================================
    echo [OPERACION CANCELADA] No se realizo ningun push a GitHub.
    echo Tus archivos y commits locales permanecen intactos y seguros.
    echo ==============================================================================
)

echo.
pause
exit /b 0
