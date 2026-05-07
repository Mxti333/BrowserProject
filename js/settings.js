const STORAGE_KEY = "nexora.browser.v2";

export const DEFAULT_STATE = {
  settings: {
    language: "pl",
    country: "PL",
    timeZone: "Europe/Warsaw",
    worldClocks: ["America/New_York", "Asia/Tokyo"],
    mode: "system",
    theme: "nexora-dark",
    accentColor: "#6c63ff",
    font: "outfit",
    fontSize: 16,
    density: "normal",
    searchEngine: "google",
    startupMode: "nexora",
    startupUrl: "",
    zoom: 100,
    adBlock: true,
    trackerBlock: true,
    devtoolsEnabled: false,
    notifications: true,
    wallpaper: {
      source: "",
      type: "none",
      dim: 28,
      blur: 0,
      fit: "cover"
    }
  },
  history: [],
  bookmarks: [],
  shortcuts: [
    { id: "sc1", title: "GitHub", url: "https://github.com" },
    { id: "sc2", title: "YouTube", url: "https://youtube.com" },
    { id: "sc3", title: "Wikipedia", url: "https://wikipedia.org" },
    { id: "sc4", title: "OpenAI", url: "https://openai.com" },
    { id: "sc5", title: "MDN", url: "https://developer.mozilla.org" },
    { id: "sc6", title: "BBC", url: "https://bbc.com" },
    { id: "sc7", title: "Reddit", url: "https://reddit.com" },
    { id: "sc8", title: "Ecosia", url: "https://ecosia.org" }
  ],
  extensions: [
    { id: "ext-1", name: "NEXORA Ad Shield", enabled: true },
    { id: "ext-2", name: "Translator Pulse", enabled: false },
    { id: "ext-3", name: "Cookie Cleaner", enabled: true },
    { id: "ext-4", name: "Dark Reader Plus", enabled: false },
    { id: "ext-5", name: "Media Turbo", enabled: true }
  ],
  session: {
    tabs: []
  }
};

let state = null;
let incognitoSession = false;
const listeners = new Set();
let saveTimer = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeDeep(target, source) {
  if (!source || typeof source !== "object") {
    return target;
  }

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (Array.isArray(sourceValue)) {
      target[key] = clone(sourceValue);
      return;
    }

    if (sourceValue && typeof sourceValue === "object") {
      target[key] = mergeDeep(targetValue && typeof targetValue === "object" ? targetValue : {}, sourceValue);
      return;
    }

    target[key] = sourceValue;
  });

  return target;
}

function emit() {
  const snapshot = getState();
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error("settings listener error", error);
    }
  });
}

function persistNow() {
  if (incognitoSession) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("localStorage save error", error);
  }
}

function persistDebounced() {
  if (incognitoSession) {
    return;
  }

  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    persistNow();
  }, 300);
}

export function initSettingsStore() {
  if (state) {
    return getState();
  }

  state = clone(DEFAULT_STATE);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = mergeDeep(state, parsed);
    }
  } catch (error) {
    console.warn("Cannot parse stored state", error);
  }

  return getState();
}

export function getState() {
  if (!state) {
    initSettingsStore();
  }
  return clone(state);
}

export function updateState(mutator, options = {}) {
  if (!state) {
    initSettingsStore();
  }

  try {
    mutator(state);
    emit();

    if (options.persist !== false) {
      persistDebounced();
    }
  } catch (error) {
    console.error("update state error", error);
  }
}

export function subscribeState(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setIncognitoSession(enabled) {
  incognitoSession = Boolean(enabled);
  if (!incognitoSession) {
    persistDebounced();
  }
}

export function isIncognitoSession() {
  return incognitoSession;
}

export function saveTabsSession(tabsSnapshot) {
  updateState((draft) => {
    draft.session.tabs = clone(tabsSnapshot);
  });
}

export function getTabsSession() {
  return getState().session.tabs || [];
}

export function clearAllData() {
  state = clone(DEFAULT_STATE);
  emit();
  persistNow();
}

export function exportStateJson() {
  return JSON.stringify(getState(), null, 2);
}

export function importStateJson(rawJson) {
  const parsed = JSON.parse(rawJson);
  state = mergeDeep(clone(DEFAULT_STATE), parsed);
  emit();
  persistNow();
  return getState();
}
