import asyncio
import logging
from database import init_db
from tg_bot import start_bot, send_notification
from hh_client import HHClient

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    handlers=[
        logging.FileHandler("agent.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

async def agent_loop(stop_event: asyncio.Event):
    client = HHClient()
    await client.start()

    # Первая авторизация
    logged_in = await client.login_if_needed()
    if not logged_in:
        logger.error("Не удалось авторизоваться. Завершение работы.")
        await client.stop()
        return

    await send_notification("🤖 ИИ-агент успешно запущен и начал работу!")

    try:
        while not stop_event.is_set():
            try:
                # Ищем вакансии и откликаемся
                await client.search_and_apply(send_notification)

                # Проверяем чаты
                await client.check_chats(send_notification)
            except Exception as e:
                logger.error(f"Ошибка в основном цикле агента: {e}", exc_info=True)

            # Ждем 30 минут перед следующим запуском (или пока не попросят остановиться)
            logger.info("Ожидание 30 минут...")
            try:
                await asyncio.wait_for(stop_event.wait(), timeout=1800)
            except asyncio.TimeoutError:
                pass
    finally:
        await client.stop()

async def run_agent(stop_event: asyncio.Event):
    """Точка входа для запуска из GUI (gui_app.py) и из CLI (`python main.py`).

    stop_event — сигнал остановки: устанавливается снаружи (GUI) либо
    никогда не устанавливается при обычном CLI-запуске (Ctrl+C).
    """
    init_db()
    logger.info("Инициализация завершена.")

    bot_task = asyncio.create_task(start_bot())
    agent_task = asyncio.create_task(agent_loop(stop_event))

    await stop_event.wait()

    bot_task.cancel()
    agent_task.cancel()
    await asyncio.gather(bot_task, agent_task, return_exceptions=True)

if __name__ == "__main__":
    async def _standalone():
        stop_event = asyncio.Event()
        await run_agent(stop_event)

    try:
        asyncio.run(_standalone())
    except KeyboardInterrupt:
        logger.info("Остановка работы.")
