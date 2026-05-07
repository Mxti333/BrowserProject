function createId() {
  return `tab-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function truncate(text, max = 20) {
  const value = String(text || "").trim();
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max - 3)}...`;
}

function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return url;
  }
}

function faviconFor(url) {
  if (!/^https?:\/\//i.test(url)) {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' rx='7' fill='%236C63FF'/%3E%3Ctext x='16' y='21' text-anchor='middle' font-size='13' fill='white'%3EN%3C/text%3E%3C/svg%3E";
  }

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=32`;
}

export class TabManager {
  constructor(options) {
    this.tabsContainer = options.tabsContainer;
    this.workspace = options.workspace;
    this.homePage = options.homePage;
    this.maxTabs = options.maxTabs || 15;

    this.onNotify = options.onNotify || (() => {});
    this.onStateChange = options.onStateChange || (() => {});
    this.onLoadingStart = options.onLoadingStart || (() => {});
    this.onLoadingEnd = options.onLoadingEnd || (() => {});
    this.onVisit = options.onVisit || (() => {});
    this.onOpenExternal = options.onOpenExternal || (() => {});
    this.onNetworkLog = options.onNetworkLog || (() => {});
    this.isAdBlockEnabled = options.isAdBlockEnabled || (() => true);

    this.tabs = [];
    this.activeTabId = null;
    this.draggedTabId = null;
  }

  getActiveTab() {
    return this.tabs.find((tab) => tab.id === this.activeTabId) || null;
  }

  getTabsSnapshot() {
    return this.tabs.map((tab) => ({
      id: tab.id,
      title: tab.title,
      url: tab.url,
      history: tab.history.slice(),
      historyIndex: tab.historyIndex
    }));
  }

  restoreTabs(savedTabs = []) {
    if (!Array.isArray(savedTabs) || !savedTabs.length) {
      this.createTab({ url: "about:home", activate: true });
      return;
    }

    savedTabs.slice(0, this.maxTabs).forEach((snapshot, index) => {
      const tab = this.createTab({
        url: snapshot.url || "about:home",
        activate: false,
        title: snapshot.title || "Nowa karta"
      });

      tab.history = Array.isArray(snapshot.history) && snapshot.history.length ? snapshot.history : [tab.url];
      tab.historyIndex = Number.isInteger(snapshot.historyIndex) ? snapshot.historyIndex : tab.history.length - 1;

      if (index === savedTabs.length - 1) {
        this.activateTab(tab.id);
      }
    });

    if (!this.activeTabId && this.tabs[0]) {
      this.activateTab(this.tabs[0].id);
    }
  }

  createTab(options = {}) {
    if (this.tabs.length >= this.maxTabs) {
      this.onNotify("Osiagnieto limit 15 kart.", "warning");
      return null;
    }

    const tab = {
      id: createId(),
      title: options.title || "Nowa karta",
      url: options.url || "about:home",
      history: [options.url || "about:home"],
      historyIndex: 0,
      button: null,
      view: null,
      iframe: null,
      status: null,
      skeleton: null,
      fallbackTimer: null,
      isDirectUrl: false
    };

    tab.button = this.#buildTabButton(tab);
    this.tabs.push(tab);
    this.tabsContainer.appendChild(tab.button);

    if (tab.url !== "about:home") {
      this.#ensureTabView(tab);
      this.#loadIntoIframe(tab, tab.url, { directUrl: false });
    }

    if (options.activate !== false) {
      this.activateTab(tab.id);
    } else {
      this.#emitState();
    }

    return tab;
  }

  closeTab(tabId) {
    const index = this.tabs.findIndex((tab) => tab.id === tabId);
    if (index < 0) {
      return;
    }

    const tab = this.tabs[index];
    tab.button.classList.add("closing");

    clearTimeout(tab.fallbackTimer);

    setTimeout(() => {
      tab.button.remove();
      tab.view?.remove();
    }, 190);

    this.tabs.splice(index, 1);

    if (!this.tabs.length) {
      this.createTab({ url: "about:home", activate: true });
      return;
    }

    if (this.activeTabId === tabId) {
      const next = this.tabs[index] || this.tabs[index - 1] || this.tabs[0];
      this.activateTab(next.id);
    } else {
      this.#emitState();
    }
  }

  closeActiveTab() {
    const active = this.getActiveTab();
    if (active) {
      this.closeTab(active.id);
    }
  }

  nextTab() {
    if (this.tabs.length < 2) {
      return;
    }

    const currentIndex = this.tabs.findIndex((tab) => tab.id === this.activeTabId);
    const nextIndex = currentIndex >= this.tabs.length - 1 ? 0 : currentIndex + 1;
    this.activateTab(this.tabs[nextIndex].id);
  }

  activateTab(tabId) {
    const tab = this.tabs.find((item) => item.id === tabId);
    if (!tab) {
      return;
    }

    this.activeTabId = tab.id;

    this.tabs.forEach((item) => {
      item.button.classList.toggle("active", item.id === tab.id);
      if (item.view) {
        item.view.classList.toggle("active", item.id === tab.id);
      }
    });

    const isHome = tab.url === "about:home";
    this.homePage.classList.toggle("active-view", isHome);
    this.workspace.style.pointerEvents = isHome ? "none" : "auto";
    this.#emitState();
  }

  openHome() {
    const active = this.getActiveTab();
    if (!active) {
      return;
    }
    this.navigateActive({ url: "about:home", directUrl: false, fromHistoryButtons: false });
  }

  navigateActive({ url, directUrl, title = "" , fromHistoryButtons = false }) {
    const active = this.getActiveTab();
    if (!active) {
      return;
    }

    active.url = url;
    active.isDirectUrl = Boolean(directUrl);

    if (!fromHistoryButtons) {
      active.history = active.history.slice(0, active.historyIndex + 1);
      active.history.push(url);
      active.historyIndex = active.history.length - 1;
    }

    if (url === "about:home") {
      active.title = "Nowa karta";
      this.#syncTabButton(active);
      this.activateTab(active.id);
      return;
    }

    this.#ensureTabView(active);
    active.title = title || hostnameFromUrl(url);
    this.#syncTabButton(active);
    this.#loadIntoIframe(active, url, { directUrl: Boolean(directUrl) });
    this.activateTab(active.id);
  }

  goBack() {
    const active = this.getActiveTab();
    if (!active) {
      return;
    }

    if (active.iframe) {
      try {
        active.iframe.contentWindow.history.back();
      } catch {
        // fallback do historii lokalnej
      }
    }

    if (active.historyIndex > 0) {
      active.historyIndex -= 1;
      const targetUrl = active.history[active.historyIndex];
      this.navigateActive({ url: targetUrl, directUrl: active.isDirectUrl, fromHistoryButtons: true });
    }
  }

  goForward() {
    const active = this.getActiveTab();
    if (!active) {
      return;
    }

    if (active.iframe) {
      try {
        active.iframe.contentWindow.history.forward();
      } catch {
        // fallback do historii lokalnej
      }
    }

    if (active.historyIndex < active.history.length - 1) {
      active.historyIndex += 1;
      const targetUrl = active.history[active.historyIndex];
      this.navigateActive({ url: targetUrl, directUrl: active.isDirectUrl, fromHistoryButtons: true });
    }
  }

  reloadActive() {
    const active = this.getActiveTab();
    if (!active) {
      return;
    }

    if (active.url === "about:home") {
      this.onNotify("Strona glowna odswiezona.", "info");
      return;
    }

    this.#loadIntoIframe(active, active.url, { directUrl: active.isDirectUrl, isReload: true });
  }

  #buildTabButton(tab) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab-item entering";
    button.draggable = true;

    const favicon = document.createElement("img");
    favicon.className = "tab-favicon";
    favicon.alt = "";

    const title = document.createElement("span");
    title.className = "tab-title";

    const close = document.createElement("button");
    close.type = "button";
    close.className = "tab-close";
    close.textContent = "x";
    close.addEventListener("click", (event) => {
      event.stopPropagation();
      this.closeTab(tab.id);
    });

    button.append(favicon, title, close);
    button.addEventListener("click", () => this.activateTab(tab.id));

    button.addEventListener("dragstart", () => {
      this.draggedTabId = tab.id;
      button.classList.add("dragging");
    });

    button.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (!this.draggedTabId || this.draggedTabId === tab.id) {
        return;
      }
      button.classList.add("drop-target");
    });

    button.addEventListener("dragleave", () => {
      button.classList.remove("drop-target");
    });

    button.addEventListener("drop", (event) => {
      event.preventDefault();
      button.classList.remove("drop-target");
      this.#reorderTabs(this.draggedTabId, tab.id);
    });

    button.addEventListener("dragend", () => {
      button.classList.remove("dragging");
      this.tabsContainer.querySelectorAll(".tab-item").forEach((item) => item.classList.remove("drop-target"));
      this.draggedTabId = null;
    });

    this.#syncTabButton(tab, button);
    return button;
  }

  #syncTabButton(tab, sourceButton = null) {
    const button = sourceButton || tab.button;
    if (!button) {
      return;
    }

    const titleNode = button.querySelector(".tab-title");
    const faviconNode = button.querySelector(".tab-favicon");

    titleNode.textContent = truncate(tab.title || hostnameFromUrl(tab.url) || "Nowa karta", 20);
    faviconNode.src = faviconFor(tab.url);
  }

  #ensureTabView(tab) {
    if (tab.view) {
      return;
    }

    const view = document.createElement("article");
    view.className = "tab-view";

    const shell = document.createElement("div");
    shell.className = "page-shell";

    const iframe = document.createElement("iframe");
    iframe.className = "page-iframe";
    iframe.sandbox = "allow-scripts allow-same-origin allow-forms allow-popups";

    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-loader";

    const status = document.createElement("div");
    status.className = "frame-status";

    const statusText = document.createElement("span");
    statusText.textContent = "Ladowanie...";

    const openExternalButton = document.createElement("button");
    openExternalButton.type = "button";
    openExternalButton.textContent = "Otworz poza NEXORA";
    openExternalButton.addEventListener("click", () => {
      this.onOpenExternal(tab.url, "Otwarto URL poza aplikacja.");
    });

    status.append(statusText, openExternalButton);
    shell.append(iframe, skeleton, status);

    if (this.isAdBlockEnabled()) {
      const adBadge = document.createElement("div");
      adBadge.className = "frame-adblock";
      adBadge.textContent = "AdBlock aktywny";
      shell.appendChild(adBadge);
    }
    view.appendChild(shell);
    this.workspace.appendChild(view);

    tab.view = view;
    tab.iframe = iframe;
    tab.status = statusText;
    tab.skeleton = skeleton;

    iframe.addEventListener("load", () => {
      clearTimeout(tab.fallbackTimer);
      tab.skeleton.classList.add("hidden");
      tab.status.textContent = `Zaladowano: ${hostnameFromUrl(tab.url)}`;
      this.onLoadingEnd();
      this.onVisit({ url: tab.url, title: tab.title });
      this.onNetworkLog({ request: tab.url, status: "200", type: "frame", time: `${Math.floor(Math.random() * 30) + 12} ms` });
    });

    iframe.addEventListener("error", () => {
      clearTimeout(tab.fallbackTimer);
      tab.skeleton.classList.add("hidden");
      tab.status.textContent = "Blad iframe";
      this.onLoadingEnd();
      this.#fallbackOpenExternal(tab);
    });
  }

  #fallbackOpenExternal(tab) {
    if (!tab.url || tab.url === "about:home") {
      return;
    }

    this.onOpenExternal(tab.url, "Ta strona nie zezwala na wyswietlanie w ramce. Otwarto w nowej karcie.");
    this.onNetworkLog({ request: tab.url, status: "blocked", type: "frame", time: "--" });
  }

  #loadIntoIframe(tab, url, options = {}) {
    if (!tab.iframe) {
      return;
    }

    tab.title = tab.title || hostnameFromUrl(url);
    this.#syncTabButton(tab);

    this.onLoadingStart();
    tab.skeleton.classList.remove("hidden");
    tab.status.textContent = "Ladowanie...";
    clearTimeout(tab.fallbackTimer);

    tab.fallbackTimer = window.setTimeout(() => {
      tab.skeleton.classList.add("hidden");
      tab.status.textContent = "Strona zablokowala iframe.";
      this.onLoadingEnd();
      this.#fallbackOpenExternal(tab);
    }, 6500);

    try {
      if (options.isReload) {
        tab.iframe.src = "about:blank";
      }

      tab.iframe.src = url;
    } catch (error) {
      clearTimeout(tab.fallbackTimer);
      tab.skeleton.classList.add("hidden");
      tab.status.textContent = "Blad nawigacji";
      this.onLoadingEnd();
      this.onNotify(`Nie mozna zaladowac URL: ${error.message}`, "error");
      this.#fallbackOpenExternal(tab);
    }
  }

  #reorderTabs(draggedId, targetId) {
    if (!draggedId || draggedId === targetId) {
      return;
    }

    const from = this.tabs.findIndex((tab) => tab.id === draggedId);
    const to = this.tabs.findIndex((tab) => tab.id === targetId);

    if (from < 0 || to < 0) {
      return;
    }

    const [moved] = this.tabs.splice(from, 1);
    this.tabs.splice(to, 0, moved);

    const fragment = document.createDocumentFragment();
    this.tabs.forEach((tab) => fragment.appendChild(tab.button));
    this.tabsContainer.appendChild(fragment);

    this.#emitState();
  }

  #emitState() {
    const active = this.getActiveTab();

    this.onStateChange({
      activeTab: active
        ? {
            id: active.id,
            title: active.title,
            url: active.url,
            historyIndex: active.historyIndex,
            historyLength: active.history.length
          }
        : null,
      tabs: this.getTabsSnapshot()
    });
  }
}
