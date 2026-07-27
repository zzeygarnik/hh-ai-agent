"""
Настроечный GUI для HH AI Agent (pywebview).

Frontend — React/Vite-приложение в frontend/ (дизайн из Google Stitch).
Перед запуском его нужно собрать: `npm --prefix frontend install && npm --prefix frontend run build`
(build_exe.ps1 делает это автоматически). Backend — этот файл: читает и
пишет .env, запускает/останавливает main.py, стримит его вывод в лог-панель.

Работает и как обычный скрипт (`python gui_app.py`), и после сборки в .exe
через PyInstaller (см. build_exe.ps1).
"""
import json
import shutil
import subprocess
import sys
import threading
from pathlib import Path
from typing import Optional

import webview
from dotenv import dotenv_values

if getattr(sys, "frozen", False):
    # PyInstaller-сборка: .env/main.py живут рядом с .exe, а не во временной
    # папке распаковки (sys._MEIPASS), куда попадают только бандленные ресурсы.
    BASE_DIR = Path(sys.executable).resolve().parent
    _RESOURCE_DIR = Path(getattr(sys, "_MEIPASS", BASE_DIR))
else:
    BASE_DIR = Path(__file__).resolve().parent
    _RESOURCE_DIR = BASE_DIR

ENV_PATH = BASE_DIR / ".env"
ENV_EXAMPLE_PATH = BASE_DIR / ".env.example"
MAIN_SCRIPT = BASE_DIR / "main.py"
FRONTEND_DIST = _RESOURCE_DIR / "frontend" / "dist"

DEFAULTS = {
    "LLM_PROVIDER": "deepseek",
    "DEEPSEEK_MODEL": "deepseek-chat",
    "OLLAMA_URL": "http://localhost:11434/api/generate",
    "OLLAMA_MODEL": "llama3",
}

CONFIG_KEYS = [
    "TG_BOT_TOKEN", "TG_USER_ID", "LLM_PROVIDER",
    "DEEPSEEK_API_KEY", "DEEPSEEK_MODEL",
    "OLLAMA_URL", "OLLAMA_MODEL",
    "MY_NAME", "MY_GITHUB", "MY_PET_PROJECT",
    "TARGET_RESUME_NAME", "SEARCH_QUERIES", "MY_RESUME_SUMMARY",
    "SEARCH_REGION_MOSCOW", "SEARCH_REGION_SPB", "SEARCH_REGION_REMOTE",
]


def _detect_python() -> str:
    if not getattr(sys, "frozen", False):
        return sys.executable
    for candidate in ("python", "py"):
        found = shutil.which(candidate)
        if found:
            return found
    return "python"


def _encode_env_value(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"').replace("\r", "").replace("\n", "\\n")
    return f'"{escaped}"'


def load_env_values() -> dict:
    values = dict(DEFAULTS)
    if ENV_EXAMPLE_PATH.exists():
        for k, v in dotenv_values(ENV_EXAMPLE_PATH).items():
            if v:
                values.setdefault(k, v)
    if ENV_PATH.exists():
        for k, v in dotenv_values(ENV_PATH).items():
            if v is not None:
                values[k] = v
    return values


def write_env_values(values: dict) -> None:
    lines = [f"{key}={_encode_env_value(val or '')}" for key, val in values.items()]
    ENV_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


class Api:
    def __init__(self):
        self.bot_process: Optional[subprocess.Popen] = None

    # ---- вызывается фронтендом через window.pywebview.api.* ----

    def get_config(self):
        values = load_env_values()
        result = {key: values.get(key, "") for key in CONFIG_KEYS}
        queries_raw = result.get("SEARCH_QUERIES", "")
        result["SEARCH_QUERIES"] = "\n".join(q.strip() for q in queries_raw.split(",") if q.strip())
        result["running"] = self._is_running()
        return result

    def save_config(self, data):
        self._persist(data)
        return {"ok": True}

    def start_bot(self, data):
        if self._is_running():
            return {"ok": True, "already_running": True}

        self._persist(data)

        python_path = _detect_python()
        creationflags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
        try:
            self.bot_process = subprocess.Popen(
                [python_path, str(MAIN_SCRIPT)],
                cwd=str(BASE_DIR),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                creationflags=creationflags,
            )
        except OSError as e:
            return {"ok": False, "error": str(e)}

        threading.Thread(target=self._stream_logs, daemon=True).start()
        return {"ok": True}

    def stop_bot(self):
        if self.bot_process is None:
            return {"ok": True}
        self.bot_process.terminate()
        try:
            self.bot_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            self.bot_process.kill()
        self.bot_process = None
        self._push_log("[бот остановлен]\n")
        self._push_status(False)
        return {"ok": True}

    def get_status(self):
        return {"running": self._is_running()}

    # ---- внутреннее ----

    def _is_running(self) -> bool:
        return self.bot_process is not None and self.bot_process.poll() is None

    def _persist(self, data: dict):
        values = load_env_values()
        for key in CONFIG_KEYS:
            raw = data.get(key) or ""
            if key == "SEARCH_QUERIES":
                queries = [q.strip() for q in raw.splitlines() if q.strip()]
                raw = ", ".join(queries)
            values[key] = raw
        write_env_values(values)

    def _stream_logs(self):
        proc = self.bot_process
        if proc is None or proc.stdout is None:
            return
        for line in proc.stdout:
            self._push_log(line)
        self._push_log("[процесс бота завершился]\n")
        self.bot_process = None
        self._push_status(False)

    def _push_log(self, line: str):
        window = webview.windows[0] if webview.windows else None
        if window is None:
            return
        window.evaluate_js(f"window.appendLog({json.dumps(line)})")

    def _push_status(self, running: bool):
        window = webview.windows[0] if webview.windows else None
        if window is None:
            return
        window.evaluate_js(f"window.setStatus({json.dumps(running)})")


def main():
    index_file = FRONTEND_DIST / "index.html"
    if not index_file.exists():
        raise SystemExit(
            f"Не найден собранный фронтенд: {index_file}\n"
            "Собери его сначала:\n"
            "  npm --prefix frontend install\n"
            "  npm --prefix frontend run build"
        )

    api = Api()
    webview.create_window(
        "HH AI Agent",
        str(index_file),
        js_api=api,
        width=1100,
        height=820,
        min_size=(900, 640),
        background_color="#0D0D0D",
    )
    webview.start()


if __name__ == "__main__":
    main()
