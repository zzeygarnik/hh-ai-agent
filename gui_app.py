"""
Настроечный GUI для HH AI Agent (pywebview).

Frontend — React/Vite-приложение в frontend/ (дизайн из Google Stitch).
Перед запуском его нужно собрать: `npm --prefix frontend install && npm --prefix frontend run build`
(build_exe.ps1 делает это автоматически).

Бот (main.py) не запускается отдельным процессом — он крутится прямо
внутри этого приложения (свой event loop в фоновом потоке), чтобы
собранный .exe был единственным, что нужно скачать и запустить: без
отдельного Python и pip-пакетов на машине пользователя. При первом
запуске бота, если не установлен Chromium для Playwright, он тихо
докачивается сам — прогресс показывается в отдельном маленьком окне.
"""
import asyncio
import base64
import json
import logging
import subprocess
import sys
import threading
from pathlib import Path
from typing import Optional

import webview
from dotenv import dotenv_values

APP_TITLE = "ZGRNK HH Agent"

if getattr(sys, "frozen", False):
    # PyInstaller-сборка: .env живёт рядом с .exe, а не во временной
    # папке распаковки (sys._MEIPASS), куда попадают только бандленные ресурсы.
    BASE_DIR = Path(sys.executable).resolve().parent
    _RESOURCE_DIR = Path(getattr(sys, "_MEIPASS", BASE_DIR))
else:
    BASE_DIR = Path(__file__).resolve().parent
    _RESOURCE_DIR = BASE_DIR

ENV_PATH = BASE_DIR / ".env"
ENV_EXAMPLE_PATH = BASE_DIR / ".env.example"
FRONTEND_DIST = _RESOURCE_DIR / "frontend" / "dist"
PROGRESS_HTML = _RESOURCE_DIR / "gui_assets" / "progress.html"

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
    "MY_NAME", "MY_GITHUB",
    "RESUME_PROFILES",
    "SEARCH_REGION_MOSCOW", "SEARCH_REGION_SPB", "SEARCH_REGION_REMOTE",
]

RESUME_PDF_PATH_NAME = "resume.pdf"
MAX_RESUME_PDF_SIZE = 15 * 1024 * 1024  # 15 МБ, с запасом


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


class GuiLogHandler(logging.Handler):
    """Разворачивает записи logging (hh_client, ai_analyzer, main, ...) в лог-панель GUI."""

    def __init__(self, push_fn):
        super().__init__()
        self.push_fn = push_fn
        self.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))

    def emit(self, record: logging.LogRecord) -> None:
        try:
            self.push_fn(self.format(record) + "\n")
        except Exception:
            self.handleError(record)


def _install_chromium(push_fn) -> None:
    """Качает браузер Chromium для Playwright, если его ещё нет. Стримит вывод в push_fn.

    Если браузер уже установлен, playwright сам быстро выходит без скачивания —
    поэтому эту функцию безопасно вызывать при каждом старте бота.
    """
    from playwright._impl._driver import compute_driver_executable, get_driver_env

    driver_executable, driver_cli = compute_driver_executable()
    creationflags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    proc = subprocess.Popen(
        [driver_executable, driver_cli, "install", "chromium"],
        env=get_driver_env(),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        creationflags=creationflags,
    )
    if proc.stdout is not None:
        for line in proc.stdout:
            push_fn(line)
    returncode = proc.wait()
    if returncode != 0:
        raise RuntimeError(f"playwright install chromium завершился с кодом {returncode}")


class Api:
    def __init__(self):
        self.bot_thread: Optional[threading.Thread] = None
        self.bot_loop: Optional[asyncio.AbstractEventLoop] = None
        self.stop_event: Optional[asyncio.Event] = None
        self._progress_window: Optional[webview.Window] = None
        self._setup_logging()

    # ---- вызывается фронтендом через window.pywebview.api.* ----

    def get_config(self):
        values = load_env_values()
        result = {key: values.get(key, "") for key in CONFIG_KEYS}
        result["running"] = self._is_running()
        return result

    def save_config(self, data):
        self._persist(data)
        return {"ok": True}

    def start_bot(self, data):
        if self._is_running():
            return {"ok": True, "already_running": True}

        self._persist(data)

        self.bot_thread = threading.Thread(target=self._bot_thread_main, daemon=True)
        self.bot_thread.start()
        return {"ok": True}

    def stop_bot(self):
        if not self._is_running():
            return {"ok": True}
        if self.bot_loop is not None and self.stop_event is not None:
            loop = self.bot_loop
            event = self.stop_event
            loop.call_soon_threadsafe(event.set)
        if self.bot_thread is not None:
            self.bot_thread.join(timeout=20)
        self._push_log("[бот остановлен]\n")
        self._push_status(False)
        return {"ok": True}

    def get_status(self):
        return {"running": self._is_running()}

    def import_resume_pdf(self, filename: str, base64_content: str):
        try:
            raw = base64.b64decode(base64_content)
        except Exception as e:
            return {"ok": False, "error": f"Повреждённый файл: {e}"}

        if len(raw) > MAX_RESUME_PDF_SIZE:
            return {"ok": False, "error": "Файл слишком большой (максимум 15 МБ)"}

        pdf_path = BASE_DIR / RESUME_PDF_PATH_NAME
        try:
            pdf_path.write_bytes(raw)
        except OSError as e:
            return {"ok": False, "error": f"Не удалось сохранить файл: {e}"}

        try:
            from pypdf import PdfReader

            reader = PdfReader(str(pdf_path))
            text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
        except Exception as e:
            return {"ok": False, "error": f"Не удалось прочитать PDF: {e}"}

        if not text:
            return {"ok": False, "error": "Не удалось извлечь текст (возможно, резюме — скан-изображение без текстового слоя)"}

        return {"ok": True, "text": text}

    def import_resumes_from_hh(self):
        if self._is_running():
            return {"ok": False, "error": "Сначала остановите бота — импорт использует тот же браузер"}

        try:
            from hh_client import fetch_hh_resumes

            resumes = asyncio.run(fetch_hh_resumes())
            return {"ok": True, "resumes": resumes}
        except Exception as e:
            return {"ok": False, "error": str(e)}

    # ---- внутреннее ----

    def _setup_logging(self):
        root = logging.getLogger()
        if root.handlers:
            return
        root.setLevel(logging.INFO)
        fmt = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")

        file_handler = logging.FileHandler(BASE_DIR / "agent.log", encoding="utf-8")
        file_handler.setFormatter(fmt)
        root.addHandler(file_handler)

        stream_handler = logging.StreamHandler()
        stream_handler.setFormatter(fmt)
        root.addHandler(stream_handler)

        root.addHandler(GuiLogHandler(self._push_log))

    def _is_running(self) -> bool:
        return self.bot_thread is not None and self.bot_thread.is_alive()

    def _persist(self, data: dict):
        values = load_env_values()
        for key in CONFIG_KEYS:
            values[key] = data.get(key) or ""
        write_env_values(values)

    def _bot_thread_main(self):
        try:
            self._open_progress_window()
            self._push_progress("Проверяю браузер Chromium для Playwright...\n")
            _install_chromium(self._push_progress)
            self._push_progress("Готово, запускаю агента...\n")
        except Exception as e:
            message = f"Не удалось установить Chromium: {e}\n"
            self._push_progress(message)
            self._push_log(message)
            self._push_status(False)
            return
        finally:
            self._close_progress_window()

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        self.bot_loop = loop
        self.stop_event = asyncio.Event()

        import main as main_module  # тяжёлый импорт (playwright/aiogram) — только когда реально нужен

        try:
            loop.run_until_complete(main_module.run_agent(self.stop_event))
        except Exception as e:
            self._push_log(f"[критическая ошибка бота: {e}]\n")
        finally:
            loop.close()
            self.bot_loop = None
            self.stop_event = None
            self._push_status(False)

    def _open_progress_window(self):
        self._progress_window = webview.create_window(
            f"{APP_TITLE} — установка",
            str(PROGRESS_HTML),
            width=440,
            height=320,
            resizable=False,
            background_color="#0D0D0D",
        )

    def _close_progress_window(self):
        window = self._progress_window
        self._progress_window = None
        if window is None:
            return
        try:
            window.destroy()
        except Exception:
            pass

    def _push_progress(self, line: str):
        window = self._progress_window
        if window is None:
            return
        try:
            window.evaluate_js(f"window.appendLine({json.dumps(line)})")
        except Exception:
            pass

    def _push_log(self, line: str):
        window = webview.windows[0] if webview.windows else None
        if window is None:
            return
        try:
            window.evaluate_js(f"window.appendLog({json.dumps(line)})")
        except Exception:
            pass

    def _push_status(self, running: bool):
        window = webview.windows[0] if webview.windows else None
        if window is None:
            return
        try:
            window.evaluate_js(f"window.setStatus({json.dumps(running)})")
        except Exception:
            pass


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
        APP_TITLE,
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
