# Собирает gui_app.py + main.py (бот) в один .exe (PyInstaller + pywebview + Playwright + React-фронтенд).
# Пользователю итогового .exe не нужны ни Python, ни Node.js, ни pip-пакеты — всё внутри.
# Запускать из корня проекта: powershell -File build_exe.ps1
# Для сборки (не для запуска .exe) нужен Node.js/npm.

$ErrorActionPreference = "Stop"

pip install -r requirements.txt
pip install -r requirements-dev.txt
# Chromium сюда специально не ставим и не бандлим — .exe скачивает его сам
# при первом запуске бота (см. gui_app.py::_install_chromium), чтобы не
# раздувать exe на ~300МБ и не тащить браузер, который может устареть.

npm --prefix frontend install
npm --prefix frontend run build

pyinstaller `
    --onefile `
    --windowed `
    --name hh-agent `
    --collect-data playwright `
    --collect-data playwright_stealth `
    --add-data "frontend/dist;frontend/dist" `
    --add-data ".env.example;." `
    gui_app.py

Write-Host "Готово: dist\hh-agent.exe"
