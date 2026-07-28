import os
import asyncio
import logging
import random
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from playwright_stealth import Stealth
import database
from ai_analyzer import is_vacancy_suitable, generate_cover_letter
from config import RESUME_PROFILES, SEARCH_AREAS

logger = logging.getLogger(__name__)

STATE_FILE = os.path.join(os.path.dirname(__file__), "state.json")
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"


async def fetch_hh_resumes() -> list:
    """Тянет список резюме соискателя прямо с hh.ru (название + полный текст страницы)
    через уже сохранённую сессию (state.json). Нужна для автозаполнения резюме-профилей
    в GUI, чтобы не копировать текст резюме руками.

    Селекторы для списка резюме намеренно не завязаны на конкретные data-qa атрибуты
    (их точность на приватной странице "Мои резюме" не проверялась вживую) — вместо
    этого ищем любые ссылки на /resume/, что устойчивее к изменениям вёрстки. Текст
    резюме берётся как весь видимый текст страницы — тоже грубо, зато не ломается от
    смены разметки; пользователь может подчистить лишнее в GUI после импорта.
    """
    if not os.path.exists(STATE_FILE):
        logger.error("Импорт резюме: нет сохранённой сессии hh.ru (state.json).")
        raise RuntimeError(
            "Нет сохранённой сессии hh.ru. Сначала один раз запустите бота и войдите в аккаунт."
        )

    logger.info("Импорт резюме с hh.ru: запускаю браузер...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            context = await browser.new_context(storage_state=STATE_FILE, user_agent=USER_AGENT)
            page = await context.new_page()
            await Stealth().apply_stealth_async(page)

            logger.info("Открываю страницу 'Мои резюме' на hh.ru...")
            try:
                await page.goto("https://hh.ru/applicant/resumes", timeout=30000)
                # Не ждём networkidle: на этой странице чат-виджет и аналитика держат
                # сеть занятой постоянно, поэтому networkidle почти всегда упирается
                # в дефолтный таймаут молча. Ждём конкретно появления ссылки на резюме.
                await page.locator('a[href*="/resume/"]').first.wait_for(state="attached", timeout=20000)
            except PlaywrightTimeoutError:
                logger.warning("За 20 секунд резюме на странице не появились (нет резюме либо сессия истекла).")

            anchors = await page.locator('a[href*="/resume/"]').all()
            seen = set()
            resume_links = []
            for a in anchors:
                href = await a.get_attribute("href")
                title = (await a.inner_text()).strip()
                if not href or not title:
                    continue
                if href.startswith("/"):
                    href = f"https://hh.ru{href}"
                href = href.split("?")[0]
                if href in seen:
                    continue
                seen.add(href)
                resume_links.append({"name": title, "url": href})

            if not resume_links:
                logger.error("Импорт резюме: на странице 'Мои резюме' ссылок не найдено.")
                raise RuntimeError(
                    "Не нашёл резюме на hh.ru. Проверьте, что они опубликованы и видны в личном кабинете."
                )

            logger.info(f"Найдено резюме на hh.ru: {len(resume_links)}")

            results = []
            for link in resume_links:
                logger.info(f"Читаю резюме: {link['name']}...")
                detail_page = await context.new_page()
                await Stealth().apply_stealth_async(detail_page)
                summary = ""
                try:
                    await detail_page.goto(link["url"], timeout=30000)
                    await detail_page.wait_for_load_state("domcontentloaded", timeout=20000)
                    await asyncio.sleep(1.5)
                    container = detail_page.locator("main").first
                    if await container.count() == 0:
                        container = detail_page.locator("body").first
                    summary = (await container.inner_text()).strip()
                    logger.info(f"Резюме прочитано: {link['name']} ({len(summary)} симв.)")
                except Exception as e:
                    logger.warning(f"Не удалось прочитать резюме {link['name']}: {e}")
                finally:
                    await detail_page.close()
                results.append({"name": link["name"], "summary": summary})

            logger.info(f"Импорт с hh.ru завершён: обработано резюме — {len(results)}")
            return results
        finally:
            await browser.close()


class HHClient:
    def __init__(self):
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None

    async def start(self):
        self.playwright = await async_playwright().start()
        # Запуск в headless=False для того, чтобы в первый раз пользователь мог войти (ввести смс/пароль),
        # либо полностью headless, если state.json существует.
        headless = os.path.exists(STATE_FILE)
        self.browser = await self.playwright.chromium.launch(headless=headless)

        if os.path.exists(STATE_FILE):
            self.context = await self.browser.new_context(storage_state=STATE_FILE, user_agent=USER_AGENT)
        else:
            self.context = await self.browser.new_context(user_agent=USER_AGENT)

        self.page = await self.context.new_page()
        await Stealth().apply_stealth_async(self.page)

    async def login_if_needed(self):
        logger.info("Переходим на HH.ru для проверки авторизации...")
        await self.page.goto("https://hh.ru/")
        await asyncio.sleep(3)

        # Ждем, пока страница реально прогрузится, чтобы не ловить "пустой" экран
        await self.page.wait_for_load_state('networkidle')
        await asyncio.sleep(2)

        # Ищем любую ссылку или кнопку с текстом "Войти"
        login_link = self.page.locator('a:has-text("Войти")')
        login_button = self.page.locator('button:has-text("Войти")')

        if not await login_link.count() and not await login_button.count():
            logger.info("Уже авторизованы (кнопка 'Войти' не найдена).")
            return True

        if os.path.exists(STATE_FILE):
            os.remove(STATE_FILE)
            logger.warning("Файл сессии (state.json) недействителен. Я его удалил.")
            logger.warning("Перезапустите бота — откроется окно браузера для повторного входа.")
            return False

        logger.info("=========================================")
        logger.info("НУЖНА АВТОРИЗАЦИЯ")
        logger.info("Откройте видимое окно браузера и войдите в свой аккаунт HH.ru.")
        logger.info("Ничего нажимать здесь не нужно — бот сам определит, когда вход выполнен.")
        logger.info("=========================================")

        try:
            # Опрашиваем страницу, пока кнопка "Войти" не исчезнет (значит, юзер залогинился
            # в открытом окне). Без input() — в упакованном .exe (--windowed) консоли нет,
            # так что ждать нажатия Enter там было бы нечем.
            max_wait_seconds = 600  # 10 минут на ручной вход
            poll_interval = 3
            waited = 0
            logged_in = False
            while waited < max_wait_seconds:
                await asyncio.sleep(poll_interval)
                waited += poll_interval
                if not await login_link.count() and not await login_button.count():
                    logged_in = True
                    break

            if not logged_in:
                logger.error("Не дождались входа в аккаунт (10 минут). Попробуйте перезапустить бота.")
                return False

            logger.info("Сохраняем сессию...")
            await asyncio.sleep(2)  # На всякий случай даем странице загрузиться
            await self.context.storage_state(path=STATE_FILE)
            logger.info("Авторизация успешна, состояние сохранено!")
            return True
        except Exception as e:
            logger.error(f"Произошла ошибка при сохранении авторизации: {e}")
            return False

    async def search_and_apply(self, send_notification_func):
        logger.info("Начинаем поиск вакансий...")
        for profile in RESUME_PROFILES:
            name = profile["name"] or "(без названия)"
            if not profile["queries"] or not profile["summary"].strip():
                logger.warning(
                    f"Резюме-профиль '{name}' пропущен: не заполнены поисковые запросы "
                    "или текст резюме. Откройте настройки и заполните профиль."
                )
                continue
            logger.info(f"Резюме-профиль: {name}")
            await self._search_and_apply_for_profile(profile, send_notification_func)

    async def _search_and_apply_for_profile(self, profile, send_notification_func):
        resume_name = profile["name"]
        resume_summary = profile["summary"]

        for query in profile["queries"]:
            logger.info(f"Поиск по запросу: {query}")

            for area in SEARCH_AREAS:
                logger.info(f"Режим: {area['name']}")
                url = f"https://hh.ru/search/vacancy?text={query}&order_by=publication_time&experience=noExperience&experience=between1And3{area['params']}"
                await self.page.goto(url)
                await asyncio.sleep(3)
                page_num = 1
                while True:
                    logger.info(f"Парсим страницу {page_num} по запросу '{query}' ({area['name']})...")
                    vacancies = await self.page.locator('a[data-qa="serp-item__title"]').all()

                    # Собираем ссылки заранее, чтобы избежать ошибки Detached Node при долгом парсинге
                    links_to_process = []
                    for v in vacancies:
                        href = await v.get_attribute("href")
                        title = await v.inner_text()
                        if href:
                            links_to_process.append((title, href))

                    for title, href in links_to_process:
                        # Парсим ID вакансии из URL (https://hh.ru/vacancy/123456?...)
                        job_id = None
                        if "vacancy/" in href:
                            job_id = href.split("vacancy/")[1].split("?")[0]

                        if not job_id or database.is_job_applied(job_id):
                            continue

                        logger.info(f"Открываем вакансию: {title}")
                        page = await self.context.new_page()
                        await Stealth().apply_stealth_async(page)
                        try:
                            await page.goto(href)
                            await asyncio.sleep(2)

                            desc_loc = page.locator('div[data-qa="vacancy-description"]')
                            # Если описания нет - возможно капча. Запускаем цикл решения.
                            while not await desc_loc.is_visible():
                                logger.warning(f"Описание не найдено. Возможно, вылезла капча: {title}")
                                import tg_bot

                                try:
                                    # Делаем скриншот видимой области (без full_page, чтобы не триггерить ресайз окна)
                                    await page.screenshot(path="captcha.png")
                                    await tg_bot.send_captcha_request("captcha.png", f"🚨 <b>Подозрение на капчу!</b>\nБот застрял на вакансии <i>{title}</i>.\n\nПожалуйста, введите текст с картинки прямо в этот чат (если там два слова, введите через пробел):")

                                    logger.info("Ожидаем ввод капчи из Telegram...")
                                    # Ожидание снятия блокировки (когда юзер введет текст)
                                    await tg_bot.captcha_event.wait()

                                    # Вводим текст
                                    solution = tg_bot.captcha_solution
                                    logger.info(f"Вводим решение: {solution}")

                                    input_field = page.locator('input[type="text"]').first
                                    if await input_field.is_visible():
                                        await input_field.click()
                                        await asyncio.sleep(random.uniform(0.5, 1.2))

                                        for char in solution:
                                            if char == " ":
                                                await asyncio.sleep(random.uniform(0.6, 1.5)) # Медленный пробел между словами
                                            await input_field.type(char, delay=random.randint(150, 400)) # Человечный ввод

                                        await asyncio.sleep(random.uniform(1.0, 2.5))
                                        await input_field.press('Enter')
                                        await asyncio.sleep(5) # Ждем прогрузки после ввода
                                    else:
                                        # Если поля ввода нет (возможно это галочка Cloudflare или вы уже решили её в другом браузере)
                                        # Просто обновляем страницу, чтобы проверить, не снят ли бан по IP
                                        logger.info("Поле ввода не найдено. Обновляем страницу...")
                                        await page.reload()
                                        await asyncio.sleep(4)

                                    # Проверяем, появилось ли описание
                                    desc_loc = page.locator('div[data-qa="vacancy-description"]')
                                    if await desc_loc.is_visible():
                                        try:
                                            await send_notification_func("✅ Капча успешно пройдена! Бот продолжает работу.")
                                        except Exception as notify_err:
                                            logger.warning(f"Не удалось отправить уведомление об успешной капче: {notify_err}")
                                        logger.info("Капча пройдена!")
                                        break # Выходим из цикла решения капчи
                                    else:
                                        try:
                                            await send_notification_func("❌ Капча решена неверно (или появилась новая). Пробуем еще раз!")
                                        except Exception as notify_err:
                                            logger.warning(f"Не удалось отправить уведомление о неудачной капче: {notify_err}")
                                        logger.warning("Капча не пройдена. Повторная попытка...")
                                        # Цикл while начнется заново: сделает новый скриншот и попросит ввод

                                except Exception as e:
                                    logger.error(f"Ошибка при обработке капчи: {e}")
                                    break # В случае системной ошибки выходим, чтобы не зациклиться
                            description = await desc_loc.inner_text()

                            # Базовый жесткий фильтр по названию, чтобы не пускать ИИ на очевидные сеньорские позиции, стажировки или неайтишные профессии
                            title_lower = title.lower()
                            stop_words = [
                                "senior", "сеньор", "lead", "лид", "architect", "архитектор", "руководитель", "главный",
                                "стажер", "intern", "trainee", "стажировка", "менеджер", "manager", "дизайнер", "designer",
                                "hr", "аналитик", "analyst", "преподаватель", "педагог", "маркетолог", "продаж", "1с", "1c",
                                "слесарь", "диспетчер", "ассистент", "риелтор", "учитель"
                            ]
                            if any(word in title_lower for word in stop_words):
                                logger.info(f"Пропускаем (Неподходящий грейд/профессия): {title}")
                                continue

                            # Анализ ИИ
                            if await is_vacancy_suitable(title, description, resume_summary):
                                logger.info(f"Вакансия подходит: {title}")

                                cover_letter = await generate_cover_letter(title, description, resume_summary)

                                # Пробуем откликнуться
                                apply_btn = page.locator('a[data-qa="vacancy-response-link-top"]').first
                                if await apply_btn.is_visible():
                                    # Имитируем поведение человека перед откликом
                                    await page.mouse.move(random.randint(100, 700), random.randint(100, 500))
                                    await page.mouse.wheel(0, random.randint(200, 600))
                                    await asyncio.sleep(random.uniform(0.8, 1.5))
                                    await page.mouse.wheel(0, random.randint(-200, 100))
                                    await asyncio.sleep(random.uniform(0.5, 1.0))

                                    await apply_btn.click()
                                    # Даем время на открытие попапа ИЛИ загрузку новой страницы отклика
                                    await asyncio.sleep(3)

                                    # Шаг 0: Выбор нужного резюме (если их несколько)
                                    try:
                                        if resume_name:
                                            resume_dropdown = page.locator('[data-qa*="resume-select"], [data-qa*="resume-selector"], [data-qa="vacancy-response-resume-selector"]').first
                                            if await resume_dropdown.is_visible():
                                                await resume_dropdown.click()
                                                await asyncio.sleep(1)
                                                # Кликаем по нужному резюме из выпадающего списка
                                                target_resume_btn = page.locator(f'text="{resume_name}"').first
                                                if await target_resume_btn.is_visible():
                                                    await target_resume_btn.click()
                                                    await asyncio.sleep(1)
                                    except Exception as e:
                                        logger.warning(f"Ошибка при выборе резюме: {e}")

                                    # Шаг 1: Ищем кнопку "Написать/Добавить сопроводительное" (если поле изначально скрыто)
                                    toggle_btn = page.locator('[data-qa*="letter-toggle"]').or_(
                                        page.locator('text="Написать сопроводительное"')
                                    ).or_(
                                        page.locator('text="Добавить сопроводительное"')
                                    ).first
                                    if await toggle_btn.is_visible():
                                        try:
                                            await toggle_btn.click()
                                            await asyncio.sleep(1)
                                        except Exception as e:
                                            logger.warning(f"Не удалось раскрыть поле сопроводительного письма: {e}")

                                    # Шаг 2: Ищем ЛЮБОЕ многострочное поле (textarea) и ждем его появления (до 3 сек)
                                    letter_sent = False
                                    try:
                                        letter_textarea = page.locator('textarea').first
                                        await letter_textarea.wait_for(state="visible", timeout=3000)
                                        await letter_textarea.fill(cover_letter)
                                        letter_sent = True
                                    except Exception as e:
                                        logger.warning(f"Не удалось найти видимое поле (textarea) для письма: {title} ({e})")

                                    # Шаг 3: Отправка отклика (ищем любую видимую кнопку отправки)
                                    submit_btn = page.locator('button[data-qa*="vacancy-response-submit"]:visible').first
                                    if await submit_btn.is_visible():
                                        await submit_btn.click() # РЕАЛЬНЫЙ ОТКЛИК
                                        await asyncio.sleep(2)

                                        database.add_applied_job(job_id, title, href)

                                        import html
                                        safe_cover_letter = html.escape(cover_letter)

                                        if letter_sent:
                                            await send_notification_func(f"✅ Успешный отклик: <a href='{href}'>{title}</a>\n\n<b>Письмо:</b>\n<i>{safe_cover_letter}</i>")
                                        else:
                                            await send_notification_func(f"✅ Отклик без письма: <a href='{href}'>{title}</a>\n\n<i>(Работодатель отключил возможность отправки писем для этой вакансии)</i>")
                                        logger.info(f"Отклик отправлен: {title}")
                                else:
                                    logger.info(f"Кнопка отклика не найдена (возможно, уже откликались): {title}")
                                    database.add_applied_job(job_id, title, href)
                            else:
                                logger.info(f"ИИ отклонил: {title}")
                                database.add_applied_job(job_id, title, href) # Добавляем, чтобы больше не анализировать

                        except Exception as e:
                            logger.error(f"Ошибка при обработке вакансии {title}: {e}")
                        finally:
                            await page.close()

                    # После того как все вакансии на странице обработаны, проверяем кнопку "Дальше"
                    next_btn = self.page.locator('a[data-qa="pager-next"]')
                    if await next_btn.count() > 0 and await next_btn.is_visible():
                        logger.info("Переходим на следующую страницу...")
                        await next_btn.click()
                        await asyncio.sleep(4)
                        page_num += 1
                    else:
                        logger.info("Больше страниц нет, переходим к следующему запросу.")
                        break

    async def check_chats(self, send_notification_func):
        logger.info("Проверка новых сообщений в чатах HH...")
        await self.page.goto("https://hh.ru/applicant/negotiations")
        await asyncio.sleep(3)

        # Находим список откликов с бейджем непрочитанных сообщений (надежный поиск через filter(has=...))
        chat_cards = await self.page.locator('div[data-qa="negotiations-item"]').filter(has=self.page.locator('span[data-qa="negotiations-item-badge"]')).all()

        for chat_card in chat_cards:

            title_loc = chat_card.locator('a[data-qa="negotiations-item-vacancy-link"]')
            title = await title_loc.inner_text() if await title_loc.is_visible() else "Неизвестно"

            # Переходим в чат
            chat_link = await title_loc.get_attribute("href")
            if chat_link:
                chat_page = await self.context.new_page()
                await Stealth().apply_stealth_async(chat_page)
                await chat_page.goto(f"https://hh.ru{chat_link}")
                await asyncio.sleep(3)

                # Получаем последнее сообщение
                messages = await chat_page.locator('div[data-qa="chat-message-text"]').all()
                if messages:
                    last_msg = await messages[-1].inner_text()
                    msg_id = f"{chat_link}_{len(messages)}" # Примитивный ID

                    if not database.is_message_processed(msg_id):
                        database.add_processed_message(msg_id, chat_link, last_msg)
                        logger.info(f"Новое сообщение от работодателя: {title}")
                        await send_notification_func(f"🔔 <b>Новое сообщение от работодателя!</b>\nВакансия: {title}\n\n<i>{last_msg}</i>\n<a href='https://hh.ru{chat_link}'>Перейти к чату</a>")

                await chat_page.close()

    async def stop(self):
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
