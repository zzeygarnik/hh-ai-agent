# Собирает gui_app.py в один .exe (PyInstaller + pywebview + собранный React-фронтенд).
# Запускать из корня проекта: powershell -File build_exe.ps1
# Требует Node.js/npm для сборки frontend/.

$ErrorActionPreference = "Stop"

pip install -r requirements-dev.txt

npm --prefix frontend install
npm --prefix frontend run build

pyinstaller `
    --onefile `
    --windowed `
    --name hh-agent-settings `
    --add-data "frontend/dist;frontend/dist" `
    --add-data ".env.example;." `
    gui_app.py

Write-Host "Готово: dist\hh-agent-settings.exe"
