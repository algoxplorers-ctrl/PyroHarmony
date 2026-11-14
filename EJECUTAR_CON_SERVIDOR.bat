@echo off
title PyroHarmony v2.0.0 - Servidor Local (AlgoXplorers)
color 0B
cd /d "%~dp0"

echo ===============================================================================
echo   PYROHARMONY v2.0.0 - SERVIDOR WEB LOCAL (PWA + HTTP LOCALHOST)
echo   Team AlgoXplorers (Argentina) - NASA Space Apps Challenge 2026
echo ===============================================================================
echo.
echo [1/2] Iniciando servidor web local en http://localhost:8080/ ...
echo       (Esto habilita al 100%% el Service Worker PWA, manifiesto y modelos 3D)
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$port = 8080; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:' + $port + '/'); try { $listener.Start() } catch { Write-Host '[AVISO] Puerto 8080 ocupado, intentando en 8081...'; $port = 8081; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:' + $port + '/'); $listener.Start() }; Start-Process ('http://localhost:' + $port + '/index.html'); Write-Host ('[OK] Servidor activo en http://localhost:' + $port + '/'); Write-Host 'Presiona Ctrl+C o cierra esta ventana para detener el servidor.'; while ($listener.IsListening) { $context = $listener.GetContext(); $req = $context.Request; $res = $context.Response; $rel = $req.Url.LocalPath.TrimStart('/'); if ([string]::IsNullOrEmpty($rel)) { $rel = 'index.html' }; $path = Join-Path $PWD $rel; if (Test-Path $path -PathType Leaf) { $ext = [System.IO.Path]::GetExtension($path).ToLower(); $mime = switch ($ext) { '.html' { 'text/html; charset=utf-8' } '.js' { 'application/javascript; charset=utf-8' } '.mjs' { 'application/javascript; charset=utf-8' } '.css' { 'text/css; charset=utf-8' } '.json' { 'application/json; charset=utf-8' } '.webmanifest' { 'application/manifest+json; charset=utf-8' } '.png' { 'image/png' } '.jpg' { 'image/jpeg' } '.svg' { 'image/svg+xml' } '.ico' { 'image/x-icon' } default { 'application/octet-stream' } }; $res.ContentType = $mime; $res.Headers.Add('Access-Control-Allow-Origin', '*'); $bytes = [System.IO.File]::ReadAllBytes($path); $res.ContentLength64 = $bytes.Length; $res.OutputStream.Write($bytes, 0, $bytes.Length) } else { $res.StatusCode = 404; $err = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found'); $res.OutputStream.Write($err, 0, $err.Length) }; $res.OutputStream.Close() }"
