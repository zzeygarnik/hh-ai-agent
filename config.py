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
MY_PET_PROJECT = os.getenv("MY_PET_PROJECT", "")  # опционально, пусто = не упоминать в письме

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
# Ключевые слова для поиска. По умолчанию — список ниже; можно переопределить через .env
# переменной SEARCH_QUERIES (запросы через запятую).
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
_search_queries_env = os.getenv("SEARCH_QUERIES", "")
SEARCH_QUERIES = (
    [q.strip() for q in _search_queries_env.split(",") if q.strip()]
    if _search_queries_env
    else _DEFAULT_SEARCH_QUERIES
)

# Название резюме, которое агент должен выбирать при отклике (должно в точности совпадать с тем, что написано на HH)
TARGET_RESUME_NAME = os.getenv("TARGET_RESUME_NAME", "Backend-разработчик")

# Резюме (для генерации сопроводительного письма). Опиши свой стек, проекты, пожелания максимально подробно.
MY_RESUME_SUMMARY = os.getenv("MY_RESUME_SUMMARY", """
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
""")
