import { AgentSettings } from '../types';

export function generateExportHtml(settings: AgentSettings): string {
  const tagsHtml = settings.searchTags.map(tag => `
                            <div class="bg-surface-variant text-on-surface px-3 py-1 rounded-md text-label-sm flex items-center gap-1">
                                ${escapeHtml(tag)}
                                <span class="material-symbols-outlined text-[14px] cursor-pointer hover:text-primary remove-tag-btn" data-tag="${escapeHtml(tag)}">close</span>
                            </div>`).join('');

  return `<!DOCTYPE html>
<html lang="ru" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZGRNK HH Agent - Конфигурация</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    <script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "secondary": "#ffb68d",
                        "primary-fixed": "#ffdbcd",
                        "outline-variant": "#5a4137",
                        "on-tertiary-container": "#003550",
                        "primary-container": "#ff6b1a",
                        "on-error-container": "#ffdad6",
                        "on-surface-variant": "#e2bfb2",
                        "on-secondary": "#532200",
                        "primary-fixed-dim": "#ffb596",
                        "on-error": "#690005",
                        "on-tertiary-fixed-variant": "#004b70",
                        "tertiary-fixed": "#cae6ff",
                        "outline": "#a98a7e",
                        "inverse-surface": "#e5e2e1",
                        "surface-raised": "#1E1E1E",
                        "on-primary": "#581e00",
                        "surface-container-lowest": "#0e0e0e",
                        "surface-tint": "#ffb596",
                        "on-tertiary": "#00344f",
                        "border-subtle": "#2A2A2A",
                        "surface-container": "#20201f",
                        "surface": "#131313",
                        "tertiary-fixed-dim": "#8dcdff",
                        "on-primary-container": "#591e00",
                        "bg-deep": "#0D0D0D",
                        "inverse-primary": "#a43e00",
                        "on-secondary-fixed-variant": "#763300",
                        "on-secondary-fixed": "#331200",
                        "surface-dim": "#131313",
                        "status-pulse": "#FF6B1A",
                        "on-secondary-container": "#ffe7dc",
                        "error-container": "#93000a",
                        "secondary-container": "#ae4f00",
                        "background": "#131313",
                        "surface-container-high": "#2a2a2a",
                        "inverse-on-surface": "#313030",
                        "surface-container-highest": "#353535",
                        "on-tertiary-fixed": "#001e30",
                        "surface-variant": "#353535",
                        "secondary-fixed": "#ffdbc9",
                        "on-primary-fixed": "#360f00",
                        "secondary-fixed-dim": "#ffb68d",
                        "on-surface": "#e5e2e1",
                        "primary": "#ffb596",
                        "tertiary": "#8dcdff",
                        "surface-bright": "#393939",
                        "surface-container-low": "#1c1b1b",
                        "on-background": "#e5e2e1",
                        "error": "#ffb4ab",
                        "text-muted": "#888888",
                        "tertiary-container": "#00a2eb",
                        "on-primary-fixed-variant": "#7d2d00"
                    },
                    borderRadius: {
                        "DEFAULT": "10px",
                        "lg": "10px",
                        "xl": "10px",
                        "full": "9999px"
                    },
                    spacing: {
                        "unit": "4px",
                        "container-max": "1440px",
                        "gutter": "16px",
                        "margin-mobile": "16px",
                        "margin-desktop": "32px"
                    },
                    fontFamily: {
                        "headline-md": ["Inter", "sans-serif"],
                        "body-lg": ["Inter", "sans-serif"],
                        "label-sm": ["Inter", "sans-serif"],
                        "headline-lg": ["Inter", "sans-serif"],
                        "body-md": ["Inter", "sans-serif"],
                        "mono-code": ["JetBrains Mono", "monospace"]
                    },
                    fontSize: {
                        "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                        "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
                        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "mono-code": ["13px", { "lineHeight": "20px", "fontWeight": "400" }]
                    }
                }
            }
        }
    </script>
    <style>
        .input-glow:focus-within {
            border-color: #FF6B1A !important;
            box-shadow: 0 0 0 1px #FF6B1A !important;
        }
        .segment-active {
            background-color: #2A2A2A !important;
            color: #e5e2e1 !important;
        }
        .scroll-hidden::-webkit-scrollbar {
            display: none;
        }
        .scroll-hidden {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
</head>
<body class="bg-bg-deep text-on-background font-body-md min-h-screen flex selection:bg-primary-container selection:text-white">
    <!-- SideNavBar -->
    <nav class="bg-surface-container font-body-md text-body-md w-[280px] h-screen fixed left-0 top-0 border-r border-outline-variant z-50 flex flex-col py-gutter">
        <div class="px-6 mb-8 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-surface-raised border border-border-subtle flex items-center justify-center text-primary">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
            </div>
            <div>
                <h1 class="font-headline-md text-headline-md font-bold text-primary">ZGRNK HH Agent</h1>
                <p class="font-label-sm text-label-sm text-text-muted mt-1">v1.0.4</p>
            </div>
        </div>
        <div class="flex flex-col gap-2 mt-4 px-2">
            <!-- Active Tab: Настройки -->
            <a href="#" class="flex items-center gap-3 px-4 py-3 text-primary bg-surface-container-high border-r-2 border-primary rounded-lg transition-colors duration-200">
                <span class="material-symbols-outlined">settings</span>
                <span class="font-body-md text-body-md">Настройки</span>
            </a>
            <!-- Inactive Tab: Логи и запуск -->
            <a href="#" class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-colors duration-200 cursor-pointer">
                <span class="material-symbols-outlined">terminal</span>
                <span class="font-body-md text-body-md">Логи и запуск</span>
            </a>
        </div>
        <div class="mt-auto px-6 mb-4">
            <button id="btn-toggle-bot" class="w-full bg-primary-container text-white font-body-md text-body-md font-medium py-3 rounded-lg hover:bg-opacity-90 transition-opacity flex items-center justify-center gap-2">
                <span class="material-symbols-outlined">play_arrow</span>
                Запустить бота
            </button>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="ml-[280px] flex-1 flex flex-col min-h-screen relative">
        <!-- TopNavBar -->
        <header class="h-16 w-full sticky top-0 z-40 bg-bg-deep border-b border-border-subtle flex items-center justify-between px-margin-desktop backdrop-blur-md bg-opacity-90">
            <h2 class="font-headline-md text-headline-md text-on-surface">Конфигурация агента</h2>
            <div class="flex items-center gap-2 text-label-sm text-text-muted">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Система готова к запуску</span>
            </div>
        </header>

        <div class="flex-1 p-margin-desktop max-w-4xl mx-auto w-full pb-32">
            <div class="grid grid-cols-1 gap-8">
                <!-- Section 1: Telegram -->
                <section class="bg-surface-raised border border-border-subtle rounded-xl p-6">
                    <h3 class="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">send</span>
                        Telegram Настройки
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="flex flex-col gap-2">
                            <label class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Bot Token</label>
                            <div class="relative flex items-center input-glow rounded-lg border border-border-subtle bg-surface px-3 py-2 transition-all">
                                <span class="material-symbols-outlined text-text-muted mr-2">key</span>
                                <input type="password" id="input-bot-token" value="${escapeHtml(settings.botToken)}" class="w-full bg-transparent border-none focus:ring-0 text-on-surface font-mono-code text-mono-code p-0" placeholder="Введите токен">
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">User ID (Admin)</label>
                            <div class="relative flex items-center input-glow rounded-lg border border-border-subtle bg-surface px-3 py-2 transition-all">
                                <span class="material-symbols-outlined text-text-muted mr-2">person</span>
                                <input type="text" id="input-admin-id" value="${escapeHtml(settings.adminUserId)}" class="w-full bg-transparent border-none focus:ring-0 text-on-surface font-mono-code text-mono-code p-0" placeholder="Telegram ID">
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Section 2: LLM провайдер -->
                <section class="bg-surface-raised border border-border-subtle rounded-xl p-6">
                    <h3 class="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">psychology</span>
                        LLM Провайдер
                    </h3>
                    <!-- Segmented Control -->
                    <div class="bg-surface p-1 rounded-lg border border-border-subtle flex gap-1 w-full md:w-96 mb-6">
                        <button type="button" id="btn-provider-deepseek" class="flex-1 py-2 text-center rounded-md font-label-sm text-label-sm ${settings.llmProvider === 'deepseek' ? 'segment-active text-on-surface' : 'text-text-muted hover:text-on-surface'} transition-colors shadow-sm">
                            DeepSeek (облако)
                        </button>
                        <button type="button" id="btn-provider-ollama" class="flex-1 py-2 text-center rounded-md font-label-sm text-label-sm ${settings.llmProvider === 'ollama' ? 'segment-active text-on-surface' : 'text-text-muted hover:text-on-surface'} transition-colors">
                            Ollama (локально)
                        </button>
                    </div>

                    <!-- DeepSeek Fields -->
                    <div id="deepseek-fields" class="flex flex-col gap-2 ${settings.llmProvider === 'deepseek' ? '' : 'hidden'}">
                        <label class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">DeepSeek API Key</label>
                        <div class="relative flex items-center input-glow rounded-lg border border-border-subtle bg-surface px-3 py-2 transition-all">
                            <span class="material-symbols-outlined text-text-muted mr-2">vpn_key</span>
                            <input type="password" id="input-deepseek-key" value="${escapeHtml(settings.deepseekApiKey)}" class="w-full bg-transparent border-none focus:ring-0 text-on-surface font-mono-code text-mono-code p-0" placeholder="sk-xxxxxxxxxxxxxxx">
                        </div>
                    </div>

                    <!-- Ollama Fields -->
                    <div id="ollama-fields" class="flex flex-col gap-4 ${settings.llmProvider === 'ollama' ? '' : 'hidden'}">
                        <div class="flex flex-col gap-2">
                            <label class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Ollama Server Host</label>
                            <div class="relative flex items-center input-glow rounded-lg border border-border-subtle bg-surface px-3 py-2 transition-all">
                                <span class="material-symbols-outlined text-text-muted mr-2">dns</span>
                                <input type="text" id="input-ollama-url" value="${escapeHtml(settings.ollamaUrl)}" class="w-full bg-transparent border-none focus:ring-0 text-on-surface font-mono-code text-mono-code p-0" placeholder="http://localhost:11434">
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Ollama Model</label>
                            <div class="relative flex items-center input-glow rounded-lg border border-border-subtle bg-surface px-3 py-2 transition-all">
                                <span class="material-symbols-outlined text-text-muted mr-2">memory</span>
                                <input type="text" id="input-ollama-model" value="${escapeHtml(settings.ollamaModel)}" class="w-full bg-transparent border-none focus:ring-0 text-on-surface font-mono-code text-mono-code p-0" placeholder="llama3:latest">
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Section 3: Профиль Кандидата -->
                <section class="bg-surface-raised border border-border-subtle rounded-xl p-6">
                    <h3 class="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">badge</span>
                        Профиль Кандидата
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="flex flex-col gap-2">
                            <label class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Имя (для сопроводительных)</label>
                            <input type="text" id="input-candidate-name" value="${escapeHtml(settings.candidateName)}" class="input-glow rounded-lg border border-border-subtle bg-surface px-4 py-2 text-on-surface focus:ring-0 w-full" placeholder="Александр Сергеевич">
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Ссылка на GitHub</label>
                            <input type="url" id="input-github-url" value="${escapeHtml(settings.githubUrl)}" class="input-glow rounded-lg border border-border-subtle bg-surface px-4 py-2 text-on-surface focus:ring-0 w-full" placeholder="https://github.com/username">
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Основной Пет-проект</label>
                            <input type="text" id="input-pet-project" value="${escapeHtml(settings.mainProjectUrl)}" class="input-glow rounded-lg border border-border-subtle bg-surface px-4 py-2 text-on-surface focus:ring-0 w-full" placeholder="URL или название">
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Название резюме (hh.ru)</label>
                            <input type="text" id="input-resume-title" value="${escapeHtml(settings.resumeTitle)}" class="input-glow rounded-lg border border-border-subtle bg-surface px-4 py-2 text-on-surface focus:ring-0 w-full" placeholder="Frontend Developer (React)">
                        </div>
                    </div>
                </section>

                <!-- Section 4: Параметры Поиска -->
                <section class="bg-surface-raised border border-border-subtle rounded-xl p-6">
                    <h3 class="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">search</span>
                        Параметры Поиска
                    </h3>
                    <div class="mb-6 flex flex-col gap-2">
                        <label class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Поисковые запросы (теги)</label>
                        <div id="tags-container" class="min-h-[48px] input-glow rounded-lg border border-border-subtle bg-surface p-2 flex flex-wrap gap-2 items-center">
                            ${tagsHtml}
                            <input type="text" id="input-new-tag" placeholder="Добавить..." class="bg-transparent border-none focus:ring-0 text-on-surface w-32 p-1 text-body-md">
                        </div>
                    </div>
                    <div class="flex flex-col gap-3">
                        <label class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider mb-1">Регионы поиска</label>
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" id="check-moscow" ${settings.regions.moscow ? 'checked' : ''} class="w-5 h-5 rounded bg-surface border-border-subtle text-primary-container focus:ring-primary-container focus:ring-offset-bg-deep cursor-pointer">
                            <span class="text-on-surface group-hover:text-primary transition-colors">Москва</span>
                        </label>
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" id="check-spb" ${settings.regions.spb ? 'checked' : ''} class="w-5 h-5 rounded bg-surface border-border-subtle text-primary-container focus:ring-primary-container focus:ring-offset-bg-deep cursor-pointer">
                            <span class="text-on-surface group-hover:text-primary transition-colors">Санкт-Петербург</span>
                        </label>
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" id="check-remote" ${settings.regions.remote ? 'checked' : ''} class="w-5 h-5 rounded bg-surface border-border-subtle text-primary-container focus:ring-primary-container focus:ring-offset-bg-deep cursor-pointer">
                            <span class="text-on-surface group-hover:text-primary transition-colors">Удаленная работа</span>
                        </label>
                    </div>
                </section>

                <!-- Section 5: Резюме & Шаблон -->
                <section class="bg-surface-raised border border-border-subtle rounded-xl p-6">
                    <h3 class="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">description</span>
                        Шаблон сопроводительного письма (Контекст)
                    </h3>
                    <div class="flex flex-col gap-2">
                        <label class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider flex justify-between">
                            <span>Базовый текст резюме (LLM будет адаптировать его)</span>
                            <span class="material-symbols-outlined text-[16px] cursor-help" title="Этот текст будет отправлен в LLM для персонализации сопроводительного письма">info</span>
                        </label>
                        <textarea id="textarea-cover-letter" rows="6" class="input-glow rounded-lg border border-border-subtle bg-surface px-4 py-3 text-on-surface focus:ring-0 w-full font-body-md resize-y" placeholder="Опишите ваш опыт, ключевые навыки и достижения...">${escapeHtml(settings.coverLetterTemplate)}</textarea>
                    </div>
                </section>
            </div>
        </div>

        <!-- Sticky Footer -->
        <div class="fixed bottom-0 right-0 w-[calc(100%-280px)] bg-bg-deep/80 backdrop-blur-xl border-t border-border-subtle p-4 z-40">
            <div class="max-w-4xl mx-auto flex justify-end gap-4 items-center">
                <span class="text-text-muted text-label-sm mr-auto flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-status-pulse animate-pulse"></span>
                    Конфигурация изменена
                </span>
                <button type="button" id="btn-cancel" class="px-6 py-2 rounded-lg border border-border-subtle text-on-surface hover:bg-surface-variant transition-colors font-body-md font-medium">
                    Отмена
                </button>
                <button type="button" id="btn-save" class="px-6 py-2 rounded-lg bg-primary-container text-white hover:bg-opacity-90 transition-all shadow-lg font-body-md font-medium">
                    Сохранить
                </button>
            </div>
        </div>
    </main>

    <script>
        // Interactive state handlers for vanilla standalone HTML
        document.addEventListener('DOMContentLoaded', () => {
            const btnDeepseek = document.getElementById('btn-provider-deepseek');
            const btnOllama = document.getElementById('btn-provider-ollama');
            const deepseekFields = document.getElementById('deepseek-fields');
            const ollamaFields = document.getElementById('ollama-fields');

            btnDeepseek.addEventListener('click', () => {
                btnDeepseek.classList.add('segment-active', 'text-on-surface');
                btnDeepseek.classList.remove('text-text-muted');
                btnOllama.classList.remove('segment-active', 'text-on-surface');
                btnOllama.classList.add('text-text-muted');
                deepseekFields.classList.remove('hidden');
                ollamaFields.classList.add('hidden');
            });

            btnOllama.addEventListener('click', () => {
                btnOllama.classList.add('segment-active', 'text-on-surface');
                btnOllama.classList.remove('text-text-muted');
                btnDeepseek.classList.remove('segment-active', 'text-on-surface');
                btnDeepseek.classList.add('text-text-muted');
                ollamaFields.classList.remove('hidden');
                deepseekFields.classList.add('hidden');
            });

            // Save toast feedback
            document.getElementById('btn-save').addEventListener('click', () => {
                alert('Конфигурация ZGRNK HH Agent успешно сохранена!');
            });
        });
    </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
