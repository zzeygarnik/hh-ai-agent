import { LogEntry, BotSettings, BotStats } from '../types';

export function generateExportHtml(
  logs: LogEntry[],
  stats: BotStats,
  settings: BotSettings,
  status: 'stopped' | 'running'
): string {
  const isRunning = status === 'running';

  const logsHtml = logs
    .map((log) => {
      let levelBadge = '';
      if (log.level === 'INFO') {
        levelBadge = `<span class="text-[#8dcdff] ml-2">INFO:</span>`;
      } else if (log.level === 'WARN') {
        levelBadge = `<span class="text-[#ff6b1a] ml-2 font-medium">WARN:</span>`;
      } else if (log.level === 'ERROR') {
        levelBadge = `<span class="text-[#ffb4ab] ml-2 font-semibold">ERROR:</span>`;
      }

      let messageText = log.message;
      if (log.level === 'ERROR') {
        messageText = `<span class="text-[#ffdad6] ml-2 bg-[#93000a]/20 px-1 rounded">${log.message}</span>`;
      } else if (log.level === 'WARN') {
        messageText = `<span class="text-[#ffb596] ml-2">${log.message}</span>`;
      } else if (log.level === 'INFO') {
        messageText = `<span class="text-[#e5e2e1] ml-2">${log.message}</span>`;
      } else {
        messageText = `<span class="text-[#e5e2e1]">${log.message}</span>`;
      }

      return `<div class="flex mb-1 ${log.level === 'SYS' ? 'opacity-80' : ''}">
  <span class="text-[#888888] w-24 shrink-0">[${log.timestamp}]</span>
  ${levelBadge}
  ${messageText}
</div>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html class="dark" lang="ru">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>ZGRNK HH Agent - Логи и запуск</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
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
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "unit": "4px",
                        "container-max": "1440px",
                        "gutter": "16px",
                        "margin-mobile": "16px",
                        "margin-desktop": "32px"
                    },
                    "fontFamily": {
                        "headline-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "label-sm": ["Inter"],
                        "headline-lg": ["Inter"],
                        "body-md": ["Inter"],
                        "mono-code": ["JetBrains Mono"]
                    },
                    "fontSize": {
                        "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                        "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
                        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "mono-code": ["13px", { "lineHeight": "20px", "fontWeight": "400" }]
                    }
                },
            },
        }
    </script>
    <style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        
        .pulse-indicator {
            box-shadow: 0 0 0 0 rgba(255, 107, 26, 0.7);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 107, 26, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(255, 107, 26, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 107, 26, 0); }
        }

        /* Custom Scrollbar for Terminal */
        .terminal-scroll::-webkit-scrollbar { width: 8px; }
        .terminal-scroll::-webkit-scrollbar-track { background: #000000; }
        .terminal-scroll::-webkit-scrollbar-thumb { background: #353535; border-radius: 4px; }
        .terminal-scroll::-webkit-scrollbar-thumb:hover { background: #5a4137; }
    </style>
</head>
<body class="bg-bg-deep text-on-surface font-body-md antialiased h-screen overflow-hidden flex">
<!-- SideNavBar -->
<nav class="w-[280px] shrink-0 h-screen bg-surface-container border-r border-outline-variant z-50 flex flex-col py-gutter">
<!-- Header -->
<div class="px-6 mb-8 flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-surface-raised border border-border-subtle flex items-center justify-center shrink-0">
<span class="font-headline-md text-headline-md font-bold text-primary">Z</span>
</div>
<div>
<h1 class="font-headline-md text-headline-md font-bold text-primary text-lg leading-tight">ZGRNK HH Agent</h1>
<p class="font-label-sm text-label-sm text-text-muted">v1.0.4 Premium</p>
</div>
</div>
<!-- Navigation Tabs -->
<div class="flex-1 px-2 space-y-1">
<!-- Настройки -->
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200 rounded-lg cursor-pointer active:scale-95 group" href="#">
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface transition-colors">settings</span>
<span class="font-body-md text-body-md">Настройки</span>
</a>
<!-- Логи и запуск (Active) -->
<a class="flex items-center gap-3 px-4 py-3 text-primary bg-surface-container-high border-r-2 border-primary rounded-l-lg cursor-pointer active:scale-95" href="#">
<span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">terminal</span>
<span class="font-body-md text-body-md font-semibold">Логи и запуск</span>
</a>
</div>
<!-- Bottom CTA -->
<div class="px-4 mt-auto">
<button class="w-full bg-primary-container text-[#0D0D0D] hover:bg-surface-tint font-label-sm text-label-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95">
<span class="material-symbols-outlined text-sm">${isRunning ? 'stop' : 'play_arrow'}</span>
                ${isRunning ? 'Остановить бота' : 'Запустить бота'}
            </button>
</div>
</nav>
<!-- Main Wrapper -->
<div class="flex-1 flex flex-col h-screen overflow-hidden relative">
<!-- TopNavBar -->
<header class="h-16 shrink-0 w-full z-40 bg-bg-deep border-b border-outline-variant flex items-center justify-between px-margin-desktop">
<div class="flex items-center">
<h2 class="font-body-lg text-body-lg font-medium text-on-surface">Рабочая панель</h2>
</div>
<div class="flex items-center gap-4">
<button class="text-on-surface-variant hover:text-primary transition-all scale-98 active:scale-95 w-10 h-10 rounded-full hover:bg-surface-variant flex items-center justify-center">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-all scale-98 active:scale-95 w-10 h-10 rounded-full hover:bg-surface-variant flex items-center justify-center">
<span class="material-symbols-outlined">account_circle</span>
</button>
</div>
</header>
<!-- Main Canvas -->
<main class="flex-1 overflow-y-auto p-margin-desktop">
<div class="max-w-container-max mx-auto space-y-8">
<!-- Top Section: Status & Actions -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
<!-- Status Card -->
<div class="lg:col-span-1 bg-surface-raised border border-border-subtle rounded-xl p-6 flex flex-col justify-center shadow-lg relative overflow-hidden group">
<div class="absolute inset-0 bg-gradient-to-br from-surface-variant/20 to-transparent pointer-events-none"></div>
<div class="relative z-10 flex items-center justify-between">
<div>
<p class="font-label-sm text-label-sm text-text-muted mb-1 uppercase tracking-wider">Текущий статус</p>
<div class="flex items-center gap-3 mt-2">
<div class="w-3 h-3 rounded-full ${isRunning ? 'bg-[#ff6b1a] pulse-indicator border border-[#ffb596]' : 'bg-surface-variant border border-outline'}"></div>
<h3 class="font-headline-lg text-headline-lg ${isRunning ? 'text-[#ffb596]' : 'text-on-surface-variant'}">${isRunning ? 'Запущен' : 'Остановлен'}</h3>
</div>
</div>
</div>
</div>
<!-- Action Buttons -->
<div class="lg:col-span-2 bg-surface-raised border border-border-subtle rounded-xl p-6 flex items-center justify-end gap-4 shadow-lg">
<button class="px-6 py-3 rounded-lg border border-border-subtle text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-variant hover:text-on-surface transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">stop</span>
                            Остановить
                        </button>
<button class="px-8 py-3 rounded-lg bg-primary-container text-bg-deep font-label-sm text-label-sm hover:bg-surface-tint hover:shadow-[0_0_15px_rgba(255,107,26,0.4)] transition-all flex items-center gap-2 font-semibold">
<span class="material-symbols-outlined text-[18px]">play_arrow</span>
                            Запустить бота
                        </button>
</div>
</div>
<!-- Stats Row (Bento Style) -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<div class="bg-surface-raised border border-border-subtle rounded-xl p-5 hover:border-outline-variant transition-colors group">
<div class="flex items-center justify-between mb-4">
<span class="font-label-sm text-label-sm text-text-muted">Откликов сегодня</span>
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">send</span>
</div>
<div class="font-headline-lg text-headline-lg text-on-surface">${stats.appliedToday}</div>
</div>
<div class="bg-surface-raised border border-border-subtle rounded-xl p-5 hover:border-outline-variant transition-colors group">
<div class="flex items-center justify-between mb-4">
<span class="font-label-sm text-label-sm text-text-muted">В очереди</span>
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">pending_actions</span>
</div>
<div class="font-headline-lg text-headline-lg text-on-surface">${stats.inQueue}</div>
</div>
<div class="bg-surface-raised border border-border-subtle rounded-xl p-5 hover:border-outline-variant transition-colors group">
<div class="flex items-center justify-between mb-4">
<span class="font-label-sm text-label-sm text-text-muted">Последний запуск</span>
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">history</span>
</div>
<div class="font-body-lg text-body-lg text-on-surface mt-2">${stats.lastRunTime}</div>
</div>
</div>
<!-- Terminal Log Panel -->
<div class="bg-[#000000] border border-border-subtle rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col h-[400px]">
<!-- Terminal Header -->
<div class="bg-surface-raised border-b border-border-subtle px-4 py-2 flex items-center justify-between select-none">
<div class="flex gap-2">
<div class="w-3 h-3 rounded-full bg-error-container border border-error/50"></div>
<div class="w-3 h-3 rounded-full bg-secondary-container border border-secondary/50"></div>
<div class="w-3 h-3 rounded-full bg-surface-variant border border-outline/50"></div>
</div>
<span class="font-mono-code text-mono-code text-text-muted text-[11px]">zgrnk_agent_process.log</span>
<button class="text-text-muted hover:text-on-surface transition-colors" title="Clear Logs">
<span class="material-symbols-outlined text-[16px]">delete_sweep</span>
</button>
</div>
<!-- Terminal Output -->
<div class="flex-1 p-4 font-mono-code text-mono-code overflow-y-auto terminal-scroll leading-relaxed">
${logsHtml}
<div class="flex mb-1 mt-4">
<span class="text-primary-container animate-pulse">_</span>
</div>
</div>
</div>
</div>
</main>
</div>
</body>
</html>`;
}
