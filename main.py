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

async def agent_loop():
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
        while True:
            try:
                # Ищем вакансии и откликаемся
                await client.search_and_apply(send_notification)

                # Проверяем чаты
                await client.check_chats(send_notification)
            except Exception as e:
                logger.error(f"Ошибка в основном цикле агента: {e}", exc_info=True)

            # Ждем 30 минут перед следующим запуском
            logger.info("Ожидание 30 минут...")
            await asyncio.sleep(1800)
    finally:
        await client.stop()

async def main():
    # Инициализация БД
    init_db()
    logger.info("Инициализация завершена.")

    # Запускаем бота и логику агента параллельно
    bot_task = asyncio.create_task(start_bot())
    agent_task = asyncio.create_task(agent_loop())

    await asyncio.gather(bot_task, agent_task)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Остановка работы.")
