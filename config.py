import json
import os
from dotenv import load_dotenv

# Загружаем переменные окружения из .env файла
load_dotenv()

# Telegram
TG_BOT_TOKEN = os.getenv("TG_BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")
TG_USER_ID = os.getenv("TG_USER_ID", "YOUR_USER_ID_HERE")

# Провайдер LLM: "deepseek" (облако, платно по балансу) или "ollama" (локально, бесплатно)
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "deepseek")

# DeepSeek (облачный провайдер, OpenAI-совместимый API)
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"

# Ollama (локальная модель)
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3") # Укажите используемую модель

# Данные для писем и профиля (используются в сопроводительных письмах)
MY_NAME = os.getenv("MY_NAME", "Твоё Имя")
MY_GITHUB = os.getenv("MY_GITHUB", "")

# Регионы поиска — включаются флагами из .env (GUI пишет их чекбоксами).
# По умолчанию (флаги не заданы): СПБ + удалённка по всей РФ, как раньше.
def _flag(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in ("1", "true", "yes")

_REGION_DEFS = [
    ("SEARCH_REGION_MOSCOW", False, {"name": "Москва (любой график)", "params": "&area=1"}),
    ("SEARCH_REGION_SPB", True, {"name": "Санкт-Петербург (любой график)", "params": "&area=2"}),
    ("SEARCH_REGION_REMOTE", True, {"name": "Вся Россия (только удаленка)", "params": "&area=113&schedule=remote"}),
]
SEARCH_AREAS = [cfg for env_key, default, cfg in _REGION_DEFS if _flag(env_key, default)]
if not SEARCH_AREAS:
    SEARCH_AREAS = [_REGION_DEFS[1][2], _REGION_DEFS[2][2]]

# HH.ru настройки
# Ключевые слова для поиска по умолчанию (используются, если в профиле резюме
# не заданы свои queries).
_DEFAULT_SEARCH_QUERIES = [
    "Python backend",
    "Python разработчик",
    "FastAPI",
    "C++ разработчик",
    "Программист C++",
    "Фулстек Python",
    "Computer Vision",
    "Backend Developer",
    "Backend Python",
]

_DEFAULT_RESUME_SUMMARY = """
Я программист с опытом разработки на Python, C, C++.
Интересуюсь backend-разработкой, фулстек-задачами и Computer Vision.
Готов решать сложные задачи и быстро обучаюсь.
Не боюсь рутины, готов учить все что нужно для работы.
Владею инструментами ИИ и могу сам быстро обучить себя чему угодно.
Ищу удаленную работу, либо работу в офисе в Санкт-Петербурге.
Зарплата от 120 000 руб.
Готов проходить тестовые задания и собеседования.
Имею высшее образование по направлению "Информатика и вычислительная техника".
Мой стек: Python, C++, C, Docker, SQL, FastAPI, HTML, JS, PostgreSQL, Linux.
"""

_DEFAULT_PROFILES = [
    {
        "name": "Backend-разработчик",
        "queries": _DEFAULT_SEARCH_QUERIES,
        "summary": _DEFAULT_RESUME_SUMMARY,
    }
]

# Резюме-профили: агент ищет и откликается ОТДЕЛЬНО по каждому профилю, каждый
# со своим названием резюме на hh.ru, своими поисковыми запросами и своим
# текстом резюме для LLM (для случая, когда на hh.ru несколько резюме на
# разные позиции). Хранится в .env одной JSON-строкой (GUI пишет её сама).
def _load_resume_profiles() -> list:
    raw = os.getenv("RESUME_PROFILES", "")
    if not raw:
        return _DEFAULT_PROFILES
    try:
        parsed = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return _DEFAULT_PROFILES

    if not isinstance(parsed, list) or not parsed:
        return _DEFAULT_PROFILES

    profiles = []
    for p in parsed:
        if not isinstance(p, dict):
            continue
        queries = [q.strip() for q in p.get("queries", []) if isinstance(q, str) and q.strip()]
        profiles.append({
            "name": (p.get("name") or "").strip(),
            "queries": queries or _DEFAULT_SEARCH_QUERIES,
            "summary": p.get("summary") or _DEFAULT_RESUME_SUMMARY,
        })
    return profiles or _DEFAULT_PROFILES


RESUME_PROFILES = _load_resume_profiles()
