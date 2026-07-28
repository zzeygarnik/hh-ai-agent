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
# Пустой профиль-заглушка на случай, если RESUME_PROFILES в .env вообще не задан
# (например, запуск через CLI без единого захода в GUI). Раньше здесь лежал
# захардкоженный текст резюме с чужим стеком (Python/C/C++) — бот подставлял
# его молча в любой профиль с пустым summary/queries и реально откликался с
# ЧУЖИМИ данными. Теперь пустой профиль просто ничего не ищет (queries=[]),
# пока пользователь не заполнит его в настройках — см. предупреждение в
# hh_client.py::search_and_apply.
_DEFAULT_PROFILES = [
    {
        "name": "",
        "queries": [],
        "summary": "",
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
            "queries": queries,
            "summary": (p.get("summary") or "").strip(),
        })
    return profiles or _DEFAULT_PROFILES


RESUME_PROFILES = _load_resume_profiles()
