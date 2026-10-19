@echo off
setlocal
cd /d "%~dp0"
set "BIOTOP_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "BIOTOP_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
"%BIOTOP_NODE%" --version >nul 2>nul
if errorlevel 1 (
  echo Node.js wurde nicht gefunden. Bitte Node.js ab Version 20 installieren.
  pause
  exit /b 1
)
echo Biotop startet. Im Browser http://127.0.0.1:4173 oeffnen.
echo Dieses Fenster zum Lernen offen lassen. Beenden mit Strg+C.
"%BIOTOP_NODE%" server.mjs
pause
