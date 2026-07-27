import asyncio
import logging
import re
from typing import Optional

import aiohttp

from config import (
    DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL,
    DEEPSEEK_URL,
    LLM_PROVIDER,
    MY_GITHUB,
    MY_NAME,
    MY_RESUME_SUMMARY,
    OLLAMA_MODEL,
    OLLAMA_URL,
)

logger = logging.getLogger(__name__)

LLM_TIMEOUT = aiohttp.ClientTimeout(total=30)

_MULTI_RESUME_HINT = (
    "Профиль кандидата может содержать текст НЕСКОЛЬКИХ разных резюме (например, разные "
    "специализации), разделённых заголовками вида \"--- имя_файла ---\". В этом случае не "
    "смешивай факты между ними бессистемно — выбирай и используй те данные, которые больше "
    "всего релевантны конкретной вакансии."
)

SYSTEM_COVER_LETTER = (
    "Ты — помощник, который пишет сопроводительные письма на русском языке от первого "
    "лица кандидата. Выводи ТОЛЬКО финальный текст письма, без вводных фраз, кавычек, "
    "markdown-разметки (никаких **, #, -, нумерованных списков) и мета-комментариев о "
    "своей работе. Используй только факты из профиля кандидата и текста вакансии, "
    "ничего не выдумывай: если данных для конкретной детали нет — не упоминай её. "
    + _MULTI_RESUME_HINT
)

SYSTEM_VACANCY_FILTER = (
    "Ты — строгий классификатор вакансий. Отвечай ровно одним словом: YES или NO. "
    "Никаких пояснений, знаков препинания, markdown или дополнительного текста. "
    + _MULTI_RESUME_HINT
)


async def _call_ollama(
    prompt: str,
    *,
    system: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: Optional[int] = None,
) -> str:
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": temperature},
    }
    if system:
        payload["system"] = system
    if max_tokens:
        payload["options"]["num_predict"] = max_tokens
    async with aiohttp.ClientSession(timeout=LLM_TIMEOUT) as session:
        async with session.post(OLLAMA_URL, json=payload) as response:
            response.raise_for_status()
            data = await response.json()
            return data.get("response", "").strip()


async def _call_deepseek(
    prompt: str,
    *,
    system: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: Optional[int] = None,
) -> str:
    headers = {"Authorization": f"Bearer {DEEPSEEK_API_KEY}"}
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    payload = {
        "model": DEEPSEEK_MODEL,
        "messages": messages,
        "stream": False,
        "temperature": temperature,
    }
    if max_tokens:
        payload["max_tokens"] = max_tokens
    async with aiohttp.ClientSession(timeout=LLM_TIMEOUT) as session:
        async with session.post(DEEPSEEK_URL, json=payload, headers=headers) as response:
            response.raise_for_status()
            data = await response.json()
            return data["choices"][0]["message"]["content"].strip()


async def _call_llm(
    prompt: str,
    *,
    system: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: Optional[int] = None,
    retries: int = 2,
) -> str:
    """Дергает настроенного LLM-провайдера с retry на сетевые/rate-limit ошибки."""
    call = _call_deepseek if LLM_PROVIDER == "deepseek" else _call_ollama
    last_error: Optional[Exception] = None
    for attempt in range(retries + 1):
        try:
            return await call(prompt, system=system, temperature=temperature, max_tokens=max_tokens)
        except Exception as e:
            last_error = e
            logger.warning(
                f"Ошибка запроса к LLM ({LLM_PROVIDER}), попытка {attempt + 1}/{retries + 1}: {e}"
            )
            if attempt < retries:
                await asyncio.sleep(2 * (attempt + 1))
    raise last_error


def _identity_block() -> str:
    if MY_GITHUB:
        return f"5. Если уместно, вставь ссылку на мой GitHub: {MY_GITHUB}"
    return "5. Про GitHub не упоминай, ссылки нет в профиле."


_MULTI_RESUME_MARKER = re.compile(r"^---\s.+\s---\s*$", re.MULTILINE)


def _resume_context_note() -> str:
    if not _MULTI_RESUME_MARKER.search(MY_RESUME_SUMMARY):
        return ""
    return (
        "\n[Это несколько разных резюме, разделённых заголовками ---. Не путай факты между "
        "ними — используй только то, что относится к текущей вакансии.]"
    )


def _clean_cover_letter(text: str) -> str:
    # Жесткая очистка от частых галлюцинаций и форматирования, которое модель
    # иногда добавляет вопреки системному промпту.
    text = text.replace('"', "").replace("'", "")
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)  # **bold** -> bold
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)  # ## Заголовки
    text = re.sub(r"^```\w*\n?|```$", "", text, flags=re.MULTILINE)
    if "Here is" in text or "Here's" in text:
        text = text.split("\n\n", 1)[-1]
    if "Note:" in text:
        text = text.split("Note:")[0].strip()
    return text.strip()


async def generate_cover_letter(vacancy_title: str, vacancy_description: str) -> str:
    prompt = f"""
Напиши сопроводительное письмо для отклика на вакансию.
Мой профиль:
{MY_RESUME_SUMMARY}
{_resume_context_note()}

Вакансия: {vacancy_title}
Описание: {vacancy_description}

КРИТИЧЕСКИЕ ПРАВИЛА (СТРОГО СОБЛЮДАТЬ):
1. ПИСАТЬ СТРОГО ТОЛЬКО НА РУССКОМ ЯЗЫКЕ! Никакого английского текста.
2. Пиши развернуто, структурировано (3-4 абзаца).
3. Стиль: живой, профессиональный, уверенный. Никакого markdown (**, #, списков) — только обычный текст.
4. Включай в письмо перечисление моего стека технологий, упоминание высшего образования и опыта работы с ИИ из моего профиля — но только то, что реально есть в профиле выше, ничего не придумывай от себя.
{_identity_block()}
6. Никаких подписей в начале письма! Только в самом конце.
7. Подпись строго: "{MY_NAME}". Никаких "С уважением".
8. ВЫВОДИ ТОЛЬКО ТЕКСТ ПИСЬМА БЕЗ КАВЫЧЕК. Твой ответ копируется автоматически! Строго запрещены любые вводные фразы (например, "Here is a sample...", "Вот письмо:"). Ни слова, кроме самого письма.
"""

    try:
        text = await _call_llm(prompt, system=SYSTEM_COVER_LETTER, temperature=0.6, max_tokens=900)
        return _clean_cover_letter(text)
    except Exception as e:
        logger.error(f"Ошибка при обращении к LLM (письмо): {e}")
        return "Здравствуйте! Прошу рассмотреть мое резюме на эту вакансию. Буду рад обсудить детали на собеседовании."


async def is_vacancy_suitable(vacancy_title: str, vacancy_description: str) -> bool:
    prompt = f"""
Твоя задача — оценить, подходит ли вакансия под мои критерии поиска.
Мои требования и профиль (внимательно учти желаемую зарплату, локацию и стек технологий):
{MY_RESUME_SUMMARY}
{_resume_context_note()}

Также мне СТРОГО НЕ подходят (отклоняй сразу, отвечая NO):
- Вакансии уровня Senior (Сеньор), Lead или Архитектор.
- Вакансии, где требуется опыт работы более 3 лет (у меня от 1 до 3 лет опыта).
- Вакансии из других сфер: менеджеры, аналитики, HR, маркетологи, дизайнеры, преподаватели, риелторы, продавцы, слесари, инженеры по эксплуатации и техподдержка.
- Любые вакансии, которые НЕ связаны напрямую с написанием кода и разработкой ПО (Backend, Fullstack, C++, Python, Computer Vision). Если вакансия не про программирование — сразу пиши NO.

Вакансия:
Название: {vacancy_title}
Описание: {vacancy_description}

Если вакансия подходит под мои критерии, ответь ТОЛЬКО одним словом: YES.
Если не подходит, ответь ТОЛЬКО одним словом: NO.
"""

    try:
        answer = await _call_llm(prompt, system=SYSTEM_VACANCY_FILTER, temperature=0.0, max_tokens=5)
        return "YES" in answer.strip().upper()
    except Exception as e:
        logger.error(f"Ошибка при обращении к LLM (анализ): {e}")
        return False
