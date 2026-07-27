const CONFIG_KEYS = [
  "TG_BOT_TOKEN", "TG_USER_ID",
  "DEEPSEEK_API_KEY", "DEEPSEEK_MODEL",
  "OLLAMA_URL", "OLLAMA_MODEL",
  "MY_NAME", "MY_GITHUB", "MY_PET_PROJECT",
  "TARGET_RESUME_NAME", "SEARCH_QUERIES", "MY_RESUME_SUMMARY",
];

let selectedProvider = "deepseek";

function api() {
  return window.pywebview.api;
}

function setProviderUI(provider) {
  selectedProvider = provider;
  document.querySelectorAll("#provider-toggle .seg-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === provider);
  });
  document.getElementById("deepseek-fields").classList.toggle("hidden", provider !== "deepseek");
  document.getElementById("ollama-fields").classList.toggle("hidden", provider !== "ollama");
}

function collectForm() {
  const data = {};
  for (const key of CONFIG_KEYS) {
    data[key] = document.getElementById(key).value;
  }
  data["LLM_PROVIDER"] = selectedProvider;
  return data;
}

function fillForm(cfg) {
  for (const key of CONFIG_KEYS) {
    const el = document.getElementById(key);
    if (el) el.value = cfg[key] || "";
  }
  setProviderUI(cfg["LLM_PROVIDER"] || "deepseek");
}

window.appendLog = function (line) {
  const box = document.getElementById("log-box");
  box.textContent += line;
  box.scrollTop = box.scrollHeight;
};

window.setStatus = function (running) {
  const pill = document.getElementById("status-pill");
  const startBtn = document.getElementById("start-btn");
  const stopBtn = document.getElementById("stop-btn");
  pill.classList.toggle("running", running);
  pill.classList.toggle("stopped", !running);
  pill.innerHTML = running
    ? '<span class="dot"></span> Работает'
    : '<span class="dot"></span> Остановлен';
  startBtn.disabled = running;
  stopBtn.disabled = !running;
};

function initTabs() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });
}

function initProviderToggle() {
  document.querySelectorAll("#provider-toggle .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => setProviderUI(btn.dataset.value));
  });
}

async function init() {
  initTabs();
  initProviderToggle();

  const cfg = await api().get_config();
  fillForm(cfg);
  window.setStatus(!!cfg.running);

  document.getElementById("save-btn").addEventListener("click", async () => {
    const res = await api().save_config(collectForm());
    const status = document.getElementById("save-status");
    status.textContent = res.ok ? "✅ Сохранено" : "❌ Ошибка сохранения";
    setTimeout(() => (status.textContent = ""), 3000);
  });

  document.getElementById("start-btn").addEventListener("click", async () => {
    const res = await api().start_bot(collectForm());
    if (!res.ok) {
      alert("Не удалось запустить бота: " + (res.error || "неизвестная ошибка"));
      return;
    }
    window.setStatus(true);
  });

  document.getElementById("stop-btn").addEventListener("click", async () => {
    await api().stop_bot();
    window.setStatus(false);
  });
}

window.addEventListener("pywebviewready", init);
