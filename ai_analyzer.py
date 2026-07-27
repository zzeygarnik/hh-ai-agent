import asyncio
import logging
from typing import Optional

import aiohttp

from config import (
    DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL,
    DEEPSEEK_URL,
    LLM_PROVIDER,
    MY_GITHUB,
    MY_NAME,
    MY_PET_PROJECT,
    MY_RESUME_SUMMARY,
    OLLAMA_MODEL,
    OLLAMA_URL,
)

logger = logging.getLogger(__name__)

LLM_TIMEOUT = aiohttp.ClientTimeout(total=30)


async def _call_ollama(prompt: str) -> str:
    payload = {"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}
    async with aiohttp.ClientSession(timeout=LLM_TIMEOUT) as session:
        async with session.post(OLLAMA_URL, json=payload) as response:
            response.raise_for_status()
            data = await response.json()
            return data.get("response", "").strip()


async def _call_deepseek(prompt: str) -> str:
    headers = {"Authorization": f"Bearer {DEEPSEEK_API_KEY}"}
    payload = {
        "model": DEEPSEEK_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
    }
    async with aiohttp.ClientSession(timeout=LLM_TIMEOUT) as session:
        async with session.post(DEEPSEEK_URL, json=payload, headers=headers) as response:
            response.raise_for_status()
            data = await response.json()
            return data["choices"][0]["message"]["content"].strip()


async def _call_llm(prompt: str, retries: int = 2) -> str:
    """Дергает настроенного LLM-провайдера с retry на сетевые/rate-limit ошибки."""
    call = _call_deepseek if LLM_PROVIDER == "deepseek" else _call_ollama
    last_error: Optional[Exception] = None
    for attempt in range(retries + 1):
        try:
            return await call(prompt)
        except Exception as e:
            last_error = e
            logger.warning(
                f"Ошибка запроса к LLM ({LLM_PROVIDER}), попытка {attempt + 1}/{retries + 1}: {e}"
            )
            if attempt < retries:
                await asyncio.sleep(2 * (attempt + 1))
    raise last_error


def _identity_block() -> str:
    if MY_PET_PROJECT and MY_GITHUB:
        return (
            f"5. Обязательно упомяни мой пет-проект {MY_PET_PROJECT} и ВСЕГДА вставляй "
            f"ссылку на мой GitHub: {MY_GITHUB}"
        )
    if MY_GITHUB:
        return f"5. Если уместно, вставь ссылку на мой GitHub: {MY_GITHUB}"
    return "5. Про GitHub и пет-проекты не упоминай, их нет в профиле."


async def generate_cover_letter(vacancy_title: str, vacancy_description: str) -> str:
    prompt = f"""
Напиши сопроводительное письмо для отклика на вакансию.
Мой профиль:
{MY_RESUME_SUMMARY}

Вакансия: {vacancy_title}
Описание: {vacancy_description}

КРИТИЧЕСКИЕ ПРАВИЛА (СТРОГО СОБЛЮДАТЬ):
1. ПИСАТЬ СТРОГО ТОЛЬКО НА РУССКОМ ЯЗЫКЕ! Никакого английского текста.
2. Пиши развернуто, структурировано (3-4 абзаца).
3. Стиль: живой, профессиональный, уверенный.
4. Включай в письмо перечисление моего стека технологий, упоминание высшего образования и опыта работы с ИИ из моего профиля.
{_identity_block()}
6. Никаких подписей в начале письма! Только в самом конце.
7. Подпись строго: "{MY_NAME}". Никаких "С уважением".
8. ВЫВОДИ ТОЛЬКО ТЕКСТ ПИСЬМА БЕЗ КАВЫЧЕК. Твой ответ копируется автоматически! Строго запрещены любые вводные фразы (например, "Here is a sample...", "Вот письмо:"). Ни слова, кроме самого письма.
"""

    try:
        text = await _call_llm(prompt)
        # Жесткая очистка от частых галлюцинаций LLM
        text = text.replace('"', "").replace("'", "")
        if "Here is" in text or "Here's" in text:
            text = text.split("\n\n", 1)[-1]
        if "Note:" in text:
            text = text.split("Note:")[0].strip()
        return text.strip()
    except Exception as e:
        logger.error(f"Ошибка при обращении к LLM (письмо): {e}")
        return "Здравствуйте! Прошу рассмотреть мое резюме на эту вакансию. Буду рад обсудить детали на собеседовании."


async def is_vacancy_suitable(vacancy_title: str, vacancy_description: str) -> bool:
    prompt = f"""
Твоя задача — оценить, подходит ли вакансия под мои критерии поиска.
Мои требования и профиль (внимательно учти желаемую зарплату, локацию и стек технологий):
{MY_RESUME_SUMMARY}

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
        answer = (await _call_llm(prompt)).strip().upper()
        return "YES" in answer
    except Exception as e:
        logger.error(f"Ошибка при обращении к LLM (анализ): {e}")
        return False
