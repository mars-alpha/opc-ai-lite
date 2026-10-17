@echo off
cd /d "%~dp0\..\.."
echo OPC AI independent task manager: http://127.0.0.1:4317
node tools/task-manager/server.mjs
pause
