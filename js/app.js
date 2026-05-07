
import { applyI18n, getLanguageOptions, setLanguage } from "./i18n.js";
import {
  clearAllData,
  exportStateJson,
  getState,
  getTabsSession,
  importStateJson,
  initSettingsStore,
  isIncognitoSession,
  saveTabsSession,
  setIncognitoSession,
  subscribeState,
  updateState
} from "./settings.js";
import {
  addBookmark,
  addHistoryEntry,
  addOrUpdateShortcut,
  clearBookmarks,
  clearHistory,
  getAddressAutocomplete,
  getRecentVisited,
  isBookmarked,
  removeBookmark,
  removeShortcut,
  renderBookmarksList,
  renderHistoryList
} from "./history.js";
import { applyVisualSettings, getThemePresets } from "./themes.js";
import { createNotifier, createLoadingController, installRipples, spinOnce } from "./notifications.js";
import { initParticles } from "./particles.js";
import { initThreeScene } from "./three-scene.js";
import { initKeyboardShortcuts, initZoomByWheel } from "./shortcuts.js";
import {
  buildClockTicks,
  createClockController,
  getCountryOptions,
  getDefaultTimeZoneForCountry,
  getLanguageForCountry,
  getTimeZoneOptions
} from "./clock.js";
import { applyWallpaper, createWallpaperController } from "./wallpaper.js";
import { TabManager } from "./tabs.js";

const SEARCH_ENGINES = {
  google: "https://www.google.com/search?q=",
  bing: "https://www.bing.com/search?q=",
  duckduckgo: "https://duckduckgo.com/?q=",
  brave: "https://search.brave.com/search?q=",
  ecosia: "https://www.ecosia.org/search?q="
};

function $(id) {
  return document.getElementById(id);
}

const elements = {
  appShell: $("appShell"),
  viewport: $("viewport"),
  wallpaperLayer: $("wallpaperLayer"),
  wallpaperOverlay: $("wallpaperOverlay"),
  particleCanvas: $("particleCanvas"),
  tabsContainer: $("tabsContainer"),
  tabWorkspace: $("tabWorkspace"),
  homePage: $("homePage"),
  addressForm: $("addressForm"),
  addressInput: $("addressInput"),
  addressAutocomplete: $("addressAutocomplete"),
  lockIndicator: $("lockIndicator"),
  goBtn: $("goBtn"),
  backBtn: $("backBtn"),
  forwardBtn: $("forwardBtn"),
  refreshBtn: $("refreshBtn"),
  homeBtn: $("homeBtn"),
  newTabBtn: $("newTabBtn"),
  bookmarkToggleBtn: $("bookmarkToggleBtn"),
  shareBtn: $("shareBtn"),
  readerBtn: $("readerBtn"),
  pipBtn: $("pipBtn"),
  findBtn: $("findBtn"),
  menuToggleBtn: $("menuToggleBtn"),
  loadingBar: $("loadingBar"),
  quickAccessGrid: $("quickAccessGrid"),
  addShortcutBtn: $("addShortcutBtn"),
  recentVisitedRow: $("recentVisitedRow"),
  homeSearchForm: $("homeSearchForm"),
  homeSearchInput: $("homeSearchInput"),
  threeSceneContainer: $("threeSceneContainer"),
  threeFallback: $("threeFallback"),
  digitalClock: $("digitalClock"),
  fullDate: $("fullDate"),
  clockZoneLabel: $("clockZoneLabel"),
  hourHand: $("hourHand"),
  minuteHand: $("minuteHand"),
  secondHand: $("secondHand"),
  clockTicks: $("clockTicks"),
  worldClocks: $("worldClocks"),
  settingsDrawer: $("settingsDrawer"),
  closeSettingsBtn: $("closeSettingsBtn"),
  settingsTabs: Array.from(document.querySelectorAll(".settings-tab")),
  settingsPanels: Array.from(document.querySelectorAll(".settings-panel")),
  languageSelect: $("languageSelect"),
  countrySelect: $("countrySelect"),
  timeZoneSelect: $("timeZoneSelect"),
  worldClockAddSelect: $("worldClockAddSelect"),
  addWorldClockBtn: $("addWorldClockBtn"),
  worldClockList: $("worldClockList"),
  startupModeSelect: $("startupModeSelect"),
  startupUrlInput: $("startupUrlInput"),
  searchEngineSelect: $("searchEngineSelect"),
  themeCardGrid: $("themeCardGrid"),
  modeSelect: $("modeSelect"),
  accentColorInput: $("accentColorInput"),
  accentQuickPicks: $("accentQuickPicks"),
  fontSelect: $("fontSelect"),
  fontSizeRange: $("fontSizeRange"),
  densitySelect: $("densitySelect"),
  chooseWallpaperBtn: $("chooseWallpaperBtn"),
  removeWallpaperBtn: $("removeWallpaperBtn"),
  wallpaperInput: $("wallpaperInput"),
  wallpaperPresetGrid: $("wallpaperPresetGrid"),
  wallpaperPreview: $("wallpaperPreview"),
  wallpaperDimRange: $("wallpaperDimRange"),
  wallpaperBlurRange: $("wallpaperBlurRange"),
  wallpaperFitSelect: $("wallpaperFitSelect"),
  adBlockToggle: $("adBlockToggle"),
  trackerToggle: $("trackerToggle"),
  incognitoToggle: $("incognitoToggle"),
  clearHistoryBtn: $("clearHistoryBtn"),
  clearBookmarksBtn: $("clearBookmarksBtn"),
  exportDataBtn: $("exportDataBtn"),
  importDataBtn: $("importDataBtn"),
  importDataInput: $("importDataInput"),
  historyList: $("historyList"),
  bookmarksList: $("bookmarksList"),
  zoomRange: $("zoomRange"),
  devtoolsToggle: $("devtoolsToggle"),
  extensionsList: $("extensionsList"),
  resetSettingsBtn: $("resetSettingsBtn"),
  devtoolsPanel: $("devtoolsPanel"),
  closeDevtoolsBtn: $("closeDevtoolsBtn"),
  devTabs: Array.from(document.querySelectorAll(".dev-tab")),
  devPanes: {
    elements: $("dev-elements"),
    console: $("dev-console"),
    network: $("dev-network"),
    storage: $("dev-storage")
  },
  readerOverlay: $("readerOverlay"),
  readerContent: $("readerContent"),
  closeReaderBtn: $("closeReaderBtn"),
  pipWindow: $("pipWindow"),
  pipFrame: $("pipFrame"),
  pipDragHandle: $("pipDragHandle"),
  closePipBtn: $("closePipBtn"),
  findBar: $("findBar"),
  findInput: $("findInput"),
  findPrevBtn: $("findPrevBtn"),
  findNextBtn: $("findNextBtn"),
  closeFindBtn: $("closeFindBtn"),
  contextMenu: $("contextMenu"),
  shortcutContextMenu: $("shortcutContextMenu"),
  toastContainer: $("toastContainer"),
  incognitoBanner: $("incognitoBanner")
};

const stateApi = {
  getState,
  updateState,
  isIncognito: isIncognitoSession
};

const notifier = createNotifier(elements.toastContainer);
const loading = createLoadingController(elements.loadingBar);

let tabManager = null;
let clockController = null;
let threeController = null;
let wallpaperController = null;
let autocompleteIndex = -1;
let autocompleteData = [];
let shortcutContextTarget = null;

function refreshIcons() {
  try {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  } catch (error) {
    console.error("lucide error", error);
  }
}

function getSettings() {
  return getState().settings;
}

function updateSettings(mutator) {
  updateState((draft) => {
    mutator(draft.settings);
  });
}

function isLikelyUrl(input) {
  const value = String(input || "").trim();
  if (!value) {
    return false;
  }
  const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.+)?$/i;
  return urlRegex.test(value);
}

function normalizeUrl(input) {
  const raw = String(input || "").trim();
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  return `https://${raw}`;
}

function resolveInputToNavigation(input) {
  const raw = String(input || "").trim();
  if (!raw) {
    return { url: "about:home", directUrl: false, title: "Nowa karta" };
  }

  if (raw === "about:home" || raw === "home" || raw === "newtab") {
    return { url: "about:home", directUrl: false, title: "Nowa karta" };
  }

  if (isLikelyUrl(raw)) {
    const url = normalizeUrl(raw);
    return { url, directUrl: true, title: url };
  }

  const engine = getSettings().searchEngine || "google";
  const base = SEARCH_ENGINES[engine] || SEARCH_ENGINES.google;
  return { url: `${base}${encodeURIComponent(raw)}`, directUrl: false, title: raw };
}

function updateLockIndicator(url) {
  elements.lockIndicator.classList.remove("lock-secure", "lock-insecure", "lock-none");
  if (!url || url === "about:home") {
    elements.lockIndicator.classList.add("lock-none");
    return;
  }
  if (/^https:\/\//i.test(url)) {
    elements.lockIndicator.classList.add("lock-secure");
    return;
  }
  if (/^http:\/\//i.test(url)) {
    elements.lockIndicator.classList.add("lock-insecure");
    return;
  }
  elements.lockIndicator.classList.add("lock-none");
}

function setAddressValue(value) {
  elements.addressInput.value = value || "";
}
function renderAutocomplete(list) {
  elements.addressAutocomplete.innerHTML = "";
  autocompleteData = list;
  autocompleteIndex = -1;

  if (!list.length) {
    elements.addressAutocomplete.classList.add("hidden");
    return;
  }

  list.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "autocomplete-item";
    li.setAttribute("role", "option");
    li.dataset.index = String(index);

    const title = document.createElement("strong");
    title.textContent = item.title;

    const url = document.createElement("small");
    url.textContent = item.url;

    li.append(title, url);
    li.addEventListener("mousedown", (event) => {
      event.preventDefault();
      elements.addressInput.value = item.url;
      elements.addressAutocomplete.classList.add("hidden");
      navigateCurrentInput(item.url);
    });

    elements.addressAutocomplete.appendChild(li);
  });

  elements.addressAutocomplete.classList.remove("hidden");
}

function updateAutocompleteHighlight() {
  const nodes = Array.from(elements.addressAutocomplete.querySelectorAll(".autocomplete-item"));
  nodes.forEach((node) => node.classList.remove("active"));
  if (autocompleteIndex >= 0 && nodes[autocompleteIndex]) {
    nodes[autocompleteIndex].classList.add("active");
  }
}

function hideAutocomplete() {
  elements.addressAutocomplete.classList.add("hidden");
}

function openExternal(url, message) {
  try {
    window.open(url, "_blank", "noopener,noreferrer");
    notifier.warning(message || "Otwarto URL w nowej karcie systemowej.");
  } catch (error) {
    notifier.error(`Nie mozna otworzyc URL: ${error.message}`);
  }
}

function navigateCurrentInput(forcedInput = null) {
  const input = forcedInput || elements.addressInput.value;
  const nav = resolveInputToNavigation(input);
  tabManager.navigateActive(nav);
}

function refreshBookmarkButton() {
  const state = getState();
  const active = tabManager.getActiveTab();
  const isMarked = active?.url ? isBookmarked(state, active.url) : false;
  elements.bookmarkToggleBtn.classList.toggle("bookmarked", Boolean(isMarked));
}

function toggleBookmarkForActive() {
  const active = tabManager.getActiveTab();
  if (!active || !active.url || active.url === "about:home") {
    notifier.warning("Brak strony do dodania do zakladek.");
    return;
  }

  const state = getState();
  if (isBookmarked(state, active.url)) {
    const existing = state.bookmarks.find((item) => item.url === active.url);
    if (existing) {
      removeBookmark(stateApi, existing.id);
      notifier.info("Usunieto zakladke.");
    }
  } else {
    addBookmark(stateApi, { title: active.title, url: active.url });
    notifier.success("Dodano zakladke.");
  }

  refreshBookmarkButton();
}

function fillLanguageSelect() {
  elements.languageSelect.innerHTML = "";
  getLanguageOptions().forEach((option) => {
    const node = document.createElement("option");
    node.value = option.code;
    node.textContent = option.label;
    elements.languageSelect.appendChild(node);
  });
}

function fillCountrySelect() {
  const options = getCountryOptions();
  elements.countrySelect.innerHTML = "";
  options.forEach((option) => {
    const node = document.createElement("option");
    node.value = option.code;
    node.textContent = option.label;
    elements.countrySelect.appendChild(node);
  });
}

function fillTimeZoneSelects() {
  const zones = getTimeZoneOptions();
  elements.timeZoneSelect.innerHTML = "";
  elements.worldClockAddSelect.innerHTML = "";

  zones.forEach((zone) => {
    const optionMain = document.createElement("option");
    optionMain.value = zone;
    optionMain.textContent = zone;
    elements.timeZoneSelect.appendChild(optionMain);

    const optionWorld = document.createElement("option");
    optionWorld.value = zone;
    optionWorld.textContent = zone;
    elements.worldClockAddSelect.appendChild(optionWorld);
  });
}

function renderThemeCards() {
  elements.themeCardGrid.innerHTML = "";
  const selectedTheme = getSettings().theme;

  getThemePresets().forEach((theme) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `theme-card ${theme.id === selectedTheme ? "active" : ""}`;
    card.dataset.theme = theme.id;

    const preview = document.createElement("div");
    preview.className = "theme-preview";
    preview.style.background = theme.preview;

    const title = document.createElement("strong");
    title.textContent = theme.label;

    card.append(preview, title);
    card.addEventListener("click", () => {
      updateSettings((settings) => {
        settings.theme = theme.id;
      });
    });

    elements.themeCardGrid.appendChild(card);
  });
}

function renderAccentQuickPicks() {
  const colors = ["#6c63ff", "#00f5ff", "#58ff96", "#ff62c7", "#ff7b32", "#66d7ff", "#ff5fa2", "#39ff14"];
  elements.accentQuickPicks.innerHTML = "";

  colors.forEach((color) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "accent-pick";
    btn.style.background = color;
    btn.addEventListener("click", () => {
      updateSettings((settings) => {
        settings.accentColor = color;
      });
    });
    elements.accentQuickPicks.appendChild(btn);
  });
}
function renderWorldClockList() {
  const worldClocks = getSettings().worldClocks || [];
  elements.worldClockList.innerHTML = "";

  if (!worldClocks.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Brak dodatkowych stref.";
    elements.worldClockList.appendChild(empty);
    return;
  }

  worldClocks.forEach((zone) => {
    const row = document.createElement("div");
    row.className = "list-row";

    const label = document.createElement("span");
    label.textContent = zone;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "icon-btn tiny";
    removeBtn.textContent = "x";
    removeBtn.addEventListener("click", () => {
      updateSettings((settings) => {
        settings.worldClocks = settings.worldClocks.filter((item) => item !== zone);
      });
    });

    row.append(label, removeBtn);
    elements.worldClockList.appendChild(row);
  });
}

function renderExtensionsList() {
  const { extensions } = getState();
  elements.extensionsList.innerHTML = "";

  extensions.forEach((ext) => {
    const row = document.createElement("div");
    row.className = "list-row";

    const label = document.createElement("span");
    label.textContent = ext.name;

    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = Boolean(ext.enabled);
    toggle.addEventListener("change", () => {
      updateState((draft) => {
        const item = draft.extensions.find((entry) => entry.id === ext.id);
        if (item) {
          item.enabled = toggle.checked;
        }
      });
    });

    row.append(label, toggle);
    elements.extensionsList.appendChild(row);
  });
}

function renderQuickAccess() {
  const state = getState();
  elements.quickAccessGrid.innerHTML = "";

  (state.shortcuts || []).slice(0, 8).forEach((shortcut) => {
    const card = document.createElement("article");
    card.className = "quick-card";
    card.dataset.shortcutId = shortcut.id;

    const icon = document.createElement("img");
    icon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(shortcut.url)}&sz=32`;
    icon.alt = "";

    const title = document.createElement("strong");
    title.textContent = shortcut.title;

    const url = document.createElement("small");
    url.textContent = shortcut.url.replace(/^https?:\/\//i, "");

    card.append(icon, title, url);
    card.addEventListener("click", () => tabManager.navigateActive({ url: shortcut.url, directUrl: true, title: shortcut.title }));

    card.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      shortcutContextTarget = shortcut;
      elements.shortcutContextMenu.classList.remove("hidden");
      elements.shortcutContextMenu.style.left = `${event.clientX}px`;
      elements.shortcutContextMenu.style.top = `${event.clientY}px`;
    });

    elements.quickAccessGrid.appendChild(card);
  });
}

function renderRecentVisited() {
  const state = getState();
  const recent = getRecentVisited(state, 16);
  elements.recentVisitedRow.innerHTML = "";

  if (!recent.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Brak odwiedzonych stron.";
    elements.recentVisitedRow.appendChild(empty);
    return;
  }

  recent.forEach((item) => {
    const card = document.createElement("article");
    card.className = "recent-card";

    const top = document.createElement("div");
    top.className = "top";

    const icon = document.createElement("img");
    icon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(item.url)}&sz=32`;
    icon.alt = "";

    const title = document.createElement("strong");
    title.textContent = item.title;

    top.append(icon, title);

    const url = document.createElement("small");
    url.textContent = item.url;

    card.append(top, url);
    card.addEventListener("click", () => tabManager.navigateActive({ url: item.url, directUrl: true, title: item.title }));

    elements.recentVisitedRow.appendChild(card);
  });
}

function renderStateViews() {
  const state = getState();
  const settings = state.settings;

  setLanguage(settings.language);
  applyI18n(document);
  applyVisualSettings(settings);
  applyWallpaper(settings, elements);

  elements.languageSelect.value = settings.language;
  elements.countrySelect.value = settings.country;
  elements.timeZoneSelect.value = settings.timeZone;
  elements.startupModeSelect.value = settings.startupMode;
  elements.startupUrlInput.value = settings.startupUrl || "";
  elements.searchEngineSelect.value = settings.searchEngine;
  elements.modeSelect.value = settings.mode;
  elements.accentColorInput.value = settings.accentColor;
  elements.fontSelect.value = settings.font;
  elements.fontSizeRange.value = String(settings.fontSize);
  elements.densitySelect.value = settings.density;
  elements.adBlockToggle.checked = Boolean(settings.adBlock);
  elements.trackerToggle.checked = Boolean(settings.trackerBlock);
  elements.incognitoToggle.checked = isIncognitoSession();
  elements.zoomRange.value = String(settings.zoom);
  elements.devtoolsToggle.checked = Boolean(settings.devtoolsEnabled);

  wallpaperController?.syncControls();
  renderThemeCards();
  renderWorldClockList();
  renderExtensionsList();
  renderQuickAccess();
  renderRecentVisited();
  renderHistoryList(elements.historyList, state, (url) => tabManager.navigateActive({ url, directUrl: true, title: url }));
  renderBookmarksList(elements.bookmarksList, state, (url) => tabManager.navigateActive({ url, directUrl: true, title: url }), (bookmarkId) => removeBookmark(stateApi, bookmarkId));
  refreshBookmarkButton();
  refreshIcons();
}

function syncIncognitoBanner() {
  elements.incognitoBanner.classList.toggle("hidden", !isIncognitoSession());
  document.body.classList.toggle("incognito-ui", isIncognitoSession());
}

function openSettings(tab = "general") {
  elements.settingsDrawer.classList.add("open");
  elements.settingsDrawer.setAttribute("aria-hidden", "false");

  elements.settingsTabs.forEach((button) => {
    const active = button.dataset.settingsTab === tab;
    button.classList.toggle("active", active);
  });

  elements.settingsPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.tab === tab);
  });

  elements.menuToggleBtn.classList.add("is-open");
}

function closeSettings() {
  elements.settingsDrawer.classList.remove("open");
  elements.settingsDrawer.setAttribute("aria-hidden", "true");
  elements.menuToggleBtn.classList.remove("is-open");
}

function toggleDevtools(forceValue = null) {
  const current = elements.devtoolsPanel.classList.contains("open");
  const next = forceValue === null ? !current : Boolean(forceValue);

  elements.devtoolsPanel.classList.toggle("open", next);
  elements.devtoolsPanel.setAttribute("aria-hidden", String(!next));
}

function appendNetworkLog(entry) {
  try {
    const tbody = elements.devPanes.network.querySelector("tbody");
    const row = document.createElement("tr");
    row.innerHTML = `<td>${entry.request}</td><td>${entry.status}</td><td>${entry.type}</td><td>${entry.time}</td>`;
    tbody.prepend(row);
    while (tbody.children.length > 30) {
      tbody.lastElementChild.remove();
    }
  } catch (error) {
    console.error("network log error", error);
  }
}
function setupDevtoolsTabs() {
  elements.devTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      elements.devTabs.forEach((node) => node.classList.remove("active"));
      tab.classList.add("active");

      Object.values(elements.devPanes).forEach((pane) => pane.classList.remove("active"));
      const target = elements.devPanes[tab.dataset.devtab];
      target?.classList.add("active");
    });
  });
}

function openReaderMode() {
  const active = tabManager.getActiveTab();
  if (!active || active.url === "about:home") {
    notifier.warning("Reader mode jest dostepny po otwarciu strony.");
    return;
  }

  const host = (() => {
    try {
      return new URL(active.url).hostname;
    } catch {
      return active.url;
    }
  })();

  elements.readerContent.innerHTML = `
    <h1>${active.title || host}</h1>
    <p>Reader Mode upraszcza widok artykulu i usuwa rozpraszacze.</p>
    <p>Dla stron cross-origin NEXORA nie moze odczytywac tresci iframe bezposrednio (zasady bezpieczenstwa przegladarki).</p>
    <h2>Adres</h2>
    <p>${active.url}</p>
    <h2>Host</h2>
    <p>${host}</p>
    <p>Jesli strona blokuje osadzanie, uzyj opcji otwarcia poza NEXORA.</p>
  `;

  elements.readerOverlay.classList.remove("hidden");
  elements.readerOverlay.setAttribute("aria-hidden", "false");
}

function openPictureInPicture() {
  const active = tabManager.getActiveTab();
  if (!active || active.url === "about:home") {
    notifier.warning("Najpierw otworz strone, aby uruchomic PiP.");
    return;
  }

  elements.pipFrame.src = active.url;
  elements.pipWindow.classList.remove("hidden");
  elements.pipWindow.setAttribute("aria-hidden", "false");
}

function closePictureInPicture() {
  elements.pipFrame.src = "about:blank";
  elements.pipWindow.classList.add("hidden");
  elements.pipWindow.setAttribute("aria-hidden", "true");
}

function setupPipDrag() {
  let drag = false;
  let dx = 0;
  let dy = 0;

  elements.pipDragHandle.addEventListener("mousedown", (event) => {
    drag = true;
    const rect = elements.pipWindow.getBoundingClientRect();
    dx = event.clientX - rect.left;
    dy = event.clientY - rect.top;
  });

  window.addEventListener("mousemove", (event) => {
    if (!drag) {
      return;
    }
    elements.pipWindow.style.left = `${event.clientX - dx}px`;
    elements.pipWindow.style.top = `${event.clientY - dy}px`;
    elements.pipWindow.style.right = "auto";
    elements.pipWindow.style.bottom = "auto";
  });

  window.addEventListener("mouseup", () => {
    drag = false;
  });
}

function showFindBar() {
  elements.findBar.classList.remove("hidden");
  elements.findBar.setAttribute("aria-hidden", "false");
  elements.findInput.focus();
}

function hideFindBar() {
  elements.findBar.classList.add("hidden");
  elements.findBar.setAttribute("aria-hidden", "true");
}

function setupTypingPlaceholder() {
  const phrases = [
    "Wpisz adres lub wyszukaj...",
    "https://example.com",
    "Szukaj: futurystyczny design",
    "youtube.com"
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let direction = 1;

  setInterval(() => {
    if (document.activeElement === elements.addressInput || elements.addressInput.value.trim()) {
      return;
    }

    const phrase = phrases[phraseIndex];
    charIndex += direction;

    if (charIndex >= phrase.length + 4) {
      direction = -1;
    }

    if (charIndex <= 0) {
      direction = 1;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }

    const text = phrase.slice(0, Math.max(0, Math.min(charIndex, phrase.length)));
    elements.addressInput.placeholder = text || "Wpisz adres lub wyszukaj...";
  }, 120);
}

function setupContextMenus() {
  window.addEventListener("contextmenu", (event) => {
    if (event.target.closest(".quick-card")) {
      return;
    }

    event.preventDefault();
    elements.contextMenu.classList.remove("hidden");
    elements.contextMenu.style.left = `${event.clientX}px`;
    elements.contextMenu.style.top = `${event.clientY}px`;
    elements.shortcutContextMenu.classList.add("hidden");
  });

  window.addEventListener("click", () => {
    elements.contextMenu.classList.add("hidden");
    elements.shortcutContextMenu.classList.add("hidden");
  });

  elements.contextMenu.addEventListener("click", async (event) => {
    const action = event.target.dataset.action;
    const active = tabManager.getActiveTab();

    try {
      if (action === "new-tab") tabManager.createTab({ url: "about:home", activate: true });
      if (action === "reload") tabManager.reloadActive();
      if (action === "reader") openReaderMode();
      if (action === "copy-link" && active?.url) {
        await navigator.clipboard.writeText(active.url);
        notifier.success("Skopiowano URL.");
      }
    } catch (error) {
      notifier.error(`Blad menu: ${error.message}`);
    }
  });

  elements.shortcutContextMenu.addEventListener("click", (event) => {
    const action = event.target.dataset.shortcutAction;
    const target = shortcutContextTarget;
    if (!target) return;

    if (action === "open") tabManager.navigateActive({ url: target.url, directUrl: true, title: target.title });
    if (action === "edit") {
      const title = window.prompt("Nowa nazwa skrotu:", target.title) || target.title;
      const url = window.prompt("Nowy URL:", target.url) || target.url;
      addOrUpdateShortcut(stateApi, { id: target.id, title, url });
    }
    if (action === "remove") removeShortcut(stateApi, target.id);

    shortcutContextTarget = null;
    elements.shortcutContextMenu.classList.add("hidden");
  });
}

function setupSwipeTabs() {
  let startX = 0;
  let startY = 0;

  elements.viewport?.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  });

  elements.viewport?.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    if (Math.abs(dx) < 60 || Math.abs(dy) > 50) return;

    const tabs = tabManager.getTabsSnapshot();
    if (tabs.length < 2) return;

    const active = tabManager.getActiveTab();
    const index = tabs.findIndex((item) => item.id === active.id);

    if (dx < 0) {
      const next = tabs[index + 1] || tabs[0];
      tabManager.activateTab(next.id);
    } else {
      const prev = tabs[index - 1] || tabs[tabs.length - 1];
      tabManager.activateTab(prev.id);
    }
  });
}
function setupSettingsEvents() {
  elements.settingsTabs.forEach((button) => {
    button.addEventListener("click", () => openSettings(button.dataset.settingsTab));
  });

  elements.closeSettingsBtn.addEventListener("click", closeSettings);
  elements.menuToggleBtn.addEventListener("click", () => {
    const opened = elements.settingsDrawer.classList.contains("open");
    if (opened) closeSettings();
    else openSettings("general");
  });

  elements.languageSelect.addEventListener("change", (event) => updateSettings((settings) => { settings.language = event.target.value; }));

  elements.countrySelect.addEventListener("change", (event) => {
    const country = event.target.value;
    const suggestedZone = getDefaultTimeZoneForCountry(country);
    updateSettings((settings) => {
      settings.country = country;
      settings.timeZone = suggestedZone;
      settings.language = getLanguageForCountry(country);
    });
  });

  elements.timeZoneSelect.addEventListener("change", (event) => updateSettings((settings) => { settings.timeZone = event.target.value; }));

  elements.addWorldClockBtn.addEventListener("click", () => {
    const zone = elements.worldClockAddSelect.value;
    updateSettings((settings) => {
      if (!settings.worldClocks.includes(zone)) settings.worldClocks.push(zone);
      settings.worldClocks = settings.worldClocks.slice(0, 4);
    });
  });

  elements.startupModeSelect.addEventListener("change", (event) => updateSettings((settings) => { settings.startupMode = event.target.value; }));
  elements.startupUrlInput.addEventListener("input", (event) => updateSettings((settings) => { settings.startupUrl = event.target.value.trim(); }));
  elements.searchEngineSelect.addEventListener("change", (event) => updateSettings((settings) => { settings.searchEngine = event.target.value; }));
  elements.modeSelect.addEventListener("change", (event) => updateSettings((settings) => { settings.mode = event.target.value; }));
  elements.accentColorInput.addEventListener("input", (event) => updateSettings((settings) => { settings.accentColor = event.target.value; }));
  elements.fontSelect.addEventListener("change", (event) => updateSettings((settings) => { settings.font = event.target.value; }));
  elements.fontSizeRange.addEventListener("input", (event) => updateSettings((settings) => { settings.fontSize = Number(event.target.value); }));
  elements.densitySelect.addEventListener("change", (event) => updateSettings((settings) => { settings.density = event.target.value; }));
  elements.adBlockToggle.addEventListener("change", (event) => updateSettings((settings) => { settings.adBlock = Boolean(event.target.checked); }));
  elements.trackerToggle.addEventListener("change", (event) => updateSettings((settings) => { settings.trackerBlock = Boolean(event.target.checked); }));

  elements.incognitoToggle.addEventListener("change", (event) => {
    const enabled = Boolean(event.target.checked);
    setIncognitoSession(enabled);
    syncIncognitoBanner();
    notifier.info(enabled ? "Tryb incognito wlaczony." : "Tryb incognito wylaczony.");
  });

  elements.clearHistoryBtn.addEventListener("click", () => {
    if (window.confirm("Czy na pewno wyczyscic historie?")) {
      clearHistory(stateApi);
      notifier.success("Historia wyczyszczona.");
    }
  });

  elements.clearBookmarksBtn.addEventListener("click", () => {
    if (window.confirm("Czy na pewno wyczyscic zakladki?")) {
      clearBookmarks(stateApi);
      notifier.success("Zakladki wyczyszczone.");
    }
  });

  elements.exportDataBtn.addEventListener("click", () => {
    const blob = new Blob([exportStateJson()], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "nexora-data.json";
    link.click();
    URL.revokeObjectURL(href);
  });

  elements.importDataBtn.addEventListener("click", () => elements.importDataInput.click());
  elements.importDataInput.addEventListener("change", async () => {
    const file = elements.importDataInput.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importStateJson(text);
      notifier.success("Import danych zakonczony.");
    } catch (error) {
      notifier.error(`Import nieudany: ${error.message}`);
    } finally {
      elements.importDataInput.value = "";
    }
  });

  elements.zoomRange.addEventListener("input", (event) => updateSettings((settings) => { settings.zoom = Number(event.target.value); }));

  elements.devtoolsToggle.addEventListener("change", (event) => {
    const enabled = Boolean(event.target.checked);
    updateSettings((settings) => { settings.devtoolsEnabled = enabled; });
    toggleDevtools(enabled);
  });

  elements.resetSettingsBtn.addEventListener("click", () => {
    if (!window.confirm("Przywrocic ustawienia domyslne?")) return;
    clearAllData();
    notifier.success("Przywrocono ustawienia domyslne.");
  });
}

function setupToolbarEvents() {
  elements.addressForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hideAutocomplete();
    navigateCurrentInput();
  });

  elements.addressInput.addEventListener("input", () => {
    const list = getAddressAutocomplete(getState(), elements.addressInput.value, 8);
    renderAutocomplete(list);
  });

  elements.addressInput.addEventListener("keydown", (event) => {
    if (elements.addressAutocomplete.classList.contains("hidden")) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      autocompleteIndex = Math.min(autocompleteIndex + 1, autocompleteData.length - 1);
      updateAutocompleteHighlight();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      autocompleteIndex = Math.max(autocompleteIndex - 1, 0);
      updateAutocompleteHighlight();
    }

    if (event.key === "Enter" && autocompleteIndex >= 0 && autocompleteData[autocompleteIndex]) {
      event.preventDefault();
      elements.addressInput.value = autocompleteData[autocompleteIndex].url;
      hideAutocomplete();
      navigateCurrentInput(autocompleteData[autocompleteIndex].url);
    }

    if (event.key === "Escape") hideAutocomplete();
  });

  elements.addressInput.addEventListener("blur", () => setTimeout(() => hideAutocomplete(), 120));
  elements.backBtn.addEventListener("click", () => tabManager.goBack());
  elements.forwardBtn.addEventListener("click", () => tabManager.goForward());
  elements.refreshBtn.addEventListener("click", () => { spinOnce(elements.refreshBtn); tabManager.reloadActive(); });
  elements.homeBtn.addEventListener("click", () => tabManager.openHome());
  elements.newTabBtn.addEventListener("click", () => tabManager.createTab({ url: "about:home", activate: true }));
  elements.bookmarkToggleBtn.addEventListener("click", () => toggleBookmarkForActive());

  elements.shareBtn.addEventListener("click", async () => {
    const active = tabManager.getActiveTab();
    if (!active?.url || active.url === "about:home") {
      notifier.warning("Brak URL do udostepnienia.");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({ title: active.title, url: active.url });
        notifier.success("Udostepniono link.");
      } else {
        await navigator.clipboard.writeText(active.url);
        notifier.success("Skopiowano link do schowka.");
      }
    } catch (error) {
      notifier.error(`Nie udalo sie udostepnic: ${error.message}`);
    }
  });

  elements.readerBtn.addEventListener("click", () => openReaderMode());
  elements.pipBtn.addEventListener("click", () => openPictureInPicture());
  elements.findBtn.addEventListener("click", () => showFindBar());

  elements.homeSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = elements.homeSearchInput.value.trim();
    if (!query) return;
    tabManager.navigateActive(resolveInputToNavigation(query));
  });

  elements.addShortcutBtn.addEventListener("click", () => {
    const title = window.prompt("Nazwa skrotu:");
    const url = window.prompt("Adres URL skrotu:");
    if (!url) return;
    addOrUpdateShortcut(stateApi, { title: title || url, url: normalizeUrl(url) });
  });
}
function setupAdvancedWidgets() {
  setupDevtoolsTabs();
  elements.closeDevtoolsBtn.addEventListener("click", () => toggleDevtools(false));

  elements.closeReaderBtn.addEventListener("click", () => {
    elements.readerOverlay.classList.add("hidden");
    elements.readerOverlay.setAttribute("aria-hidden", "true");
  });

  elements.readerOverlay.addEventListener("click", (event) => {
    if (event.target === elements.readerOverlay) {
      elements.readerOverlay.classList.add("hidden");
      elements.readerOverlay.setAttribute("aria-hidden", "true");
    }
  });

  elements.closePipBtn.addEventListener("click", closePictureInPicture);
  setupPipDrag();

  elements.closeFindBtn.addEventListener("click", hideFindBar);
  elements.findPrevBtn.addEventListener("click", () => notifier.info(`Szukaj wstecz: ${elements.findInput.value || ""}`));
  elements.findNextBtn.addEventListener("click", () => notifier.info(`Szukaj dalej: ${elements.findInput.value || ""}`));

  setupContextMenus();
  setupSwipeTabs();
}

function setupShortcuts() {
  initKeyboardShortcuts({
    newTab: () => tabManager.createTab({ url: "about:home", activate: true }),
    closeTab: () => tabManager.closeActiveTab(),
    focusAddress: () => { elements.addressInput.focus(); elements.addressInput.select(); },
    toggleBookmark: () => toggleBookmarkForActive(),
    openHistory: () => openSettings("privacy"),
    openFind: () => showFindBar(),
    toggleIncognito: () => {
      const next = !isIncognitoSession();
      setIncognitoSession(next);
      syncIncognitoBanner();
      elements.incognitoToggle.checked = next;
      notifier.info(next ? "Tryb incognito wlaczony." : "Tryb incognito wylaczony.");
    },
    nextTab: () => tabManager.nextTab(),
    toggleFullscreen: async () => {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
      else await document.exitFullscreen?.();
    }
  });

  initZoomByWheel(document, (delta) => {
    updateSettings((settings) => {
      settings.zoom = Math.max(50, Math.min(200, settings.zoom + delta));
    });
  });
}

function setupTabManager() {
  tabManager = new TabManager({
    tabsContainer: elements.tabsContainer,
    workspace: elements.tabWorkspace,
    homePage: elements.homePage,
    maxTabs: 15,
    onNotify: (message, type = "info") => notifier.raw(message, type),
    onStateChange: (state) => {
      const active = state.activeTab;
      const url = active?.url || "";
      setAddressValue(url === "about:home" ? "" : url);
      updateLockIndicator(url);
      saveTabsSession(state.tabs);
      refreshBookmarkButton();
    },
    onLoadingStart: () => loading.start(),
    onLoadingEnd: () => loading.stop(),
    onVisit: (entry) => addHistoryEntry(stateApi, entry),
    onOpenExternal: (url, message) => openExternal(url, message),
    onNetworkLog: appendNetworkLog,
    isAdBlockEnabled: () => Boolean(getSettings().adBlock)
  });

  const settings = getSettings();
  const savedTabs = getTabsSession();

  if (savedTabs.length) {
    tabManager.restoreTabs(savedTabs);
  } else if (settings.startupMode === "custom" && settings.startupUrl) {
    tabManager.createTab({ url: settings.startupUrl, activate: true, title: settings.startupUrl });
  } else {
    tabManager.createTab({ url: "about:home", activate: true });
  }
}

function setupLiveSubscriptions() {
  subscribeState(() => {
    renderStateViews();
    clockController?.renderWorld(getSettings().worldClocks || []);
  });
}

function setupWallpaperModule() {
  wallpaperController = createWallpaperController({ elements, getSettings, updateSettings, notify: notifier });
  wallpaperController.bind();
}

function setupClockModule() {
  buildClockTicks(elements.clockTicks);
  clockController = createClockController({
    digitalClock: elements.digitalClock,
    fullDate: elements.fullDate,
    zoneLabel: elements.clockZoneLabel,
    hourHand: elements.hourHand,
    minuteHand: elements.minuteHand,
    secondHand: elements.secondHand,
    worldClocksContainer: elements.worldClocks
  });

  clockController.start(getSettings);
}

function setupThemeAndLists() {
  fillLanguageSelect();
  fillCountrySelect();
  fillTimeZoneSelects();
  renderAccentQuickPicks();
}

function setupHomeActions() {
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideFindBar();
      elements.readerOverlay.classList.add("hidden");
      elements.readerOverlay.setAttribute("aria-hidden", "true");
      elements.contextMenu.classList.add("hidden");
      elements.shortcutContextMenu.classList.add("hidden");
    }

    if (event.key === "F12") {
      event.preventDefault();
      toggleDevtools();
    }
  });
}

function setupMenuShortcuts() {
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#addressForm")) hideAutocomplete();
  });

  elements.contextMenu.addEventListener("click", () => elements.contextMenu.classList.add("hidden"));
}

function run() {
  initSettingsStore();
  setupThemeAndLists();
  setupTabManager();
  setupWallpaperModule();
  setupClockModule();

  applyVisualSettings(getSettings());
  applyWallpaper(getSettings(), elements);

  installRipples(document);
  initParticles(elements.particleCanvas);
  threeController = initThreeScene(elements.threeSceneContainer, elements.threeFallback);

  setupToolbarEvents();
  setupSettingsEvents();
  setupAdvancedWidgets();
  setupShortcuts();
  setupHomeActions();
  setupMenuShortcuts();
  setupTypingPlaceholder();
  setupLiveSubscriptions();

  refreshIcons();
  renderStateViews();
  syncIncognitoBanner();

  elements.readerOverlay.setAttribute("aria-hidden", "true");
  elements.tabsContainer.addEventListener("dblclick", () => openPictureInPicture());
  document.querySelector(".brand-block")?.addEventListener("click", () => tabManager.openHome());

  toggleDevtools(Boolean(getSettings().devtoolsEnabled));
}

run();
