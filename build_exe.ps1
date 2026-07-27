# Собирает gui_app.py в один .exe (PyInstaller + pywebview).
# Запускать из корня проекта: powershell -File build_exe.ps1

$ErrorActionPreference = "Stop"

pip install -r requirements-dev.txt

pyinstaller `
    --onefile `
    --windowed `
    --name hh-agent-settings `
    --add-data "web;web" `
    --add-data ".env.example;." `
    gui_app.py

Write-Host "Готово: dist\hh-agent-settings.exe"
