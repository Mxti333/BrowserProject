function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function shortUrl(url) {
  return String(url).replace(/^https?:\/\//i, "");
}

export function addHistoryEntry(stateApi, entry) {
  const { getState, updateState, isIncognito } = stateApi;
  if (isIncognito()) {
    return;
  }

  const url = entry?.url;
  if (!url || url === "about:home") {
    return;
  }

  updateState((draft) => {
    draft.history.unshift({
      id: createId("hs"),
      title: entry.title || shortUrl(url),
      url,
      visitedAt: new Date().toISOString()
    });
    draft.history = draft.history.slice(0, 500);
  });
}

export function clearHistory(stateApi) {
  stateApi.updateState((draft) => {
    draft.history = [];
  });
}

export function getRecentVisited(state, limit = 14) {
  const unique = new Map();
  (state.history || []).forEach((item) => {
    if (!unique.has(item.url)) {
      unique.set(item.url, item);
    }
  });
  return Array.from(unique.values()).slice(0, limit);
}

export function addBookmark(stateApi, bookmark) {
  const title = bookmark?.title?.trim();
  const url = bookmark?.url?.trim();

  if (!url) {
    throw new Error("Brak URL zakladki");
  }

  stateApi.updateState((draft) => {
    if (draft.bookmarks.some((item) => item.url === url)) {
      return;
    }

    draft.bookmarks.unshift({
      id: createId("bm"),
      title: title || shortUrl(url),
      url
    });
  });
}

export function removeBookmark(stateApi, bookmarkId) {
  stateApi.updateState((draft) => {
    draft.bookmarks = draft.bookmarks.filter((item) => item.id !== bookmarkId);
  });
}

export function clearBookmarks(stateApi) {
  stateApi.updateState((draft) => {
    draft.bookmarks = [];
  });
}

export function isBookmarked(state, url) {
  return (state.bookmarks || []).some((item) => item.url === url);
}

export function addOrUpdateShortcut(stateApi, shortcut) {
  stateApi.updateState((draft) => {
    const index = draft.shortcuts.findIndex((item) => item.id === shortcut.id);
    if (index >= 0) {
      draft.shortcuts[index] = { ...draft.shortcuts[index], ...shortcut };
      return;
    }

    draft.shortcuts.unshift({
      id: shortcut.id || createId("sc"),
      title: shortcut.title || shortUrl(shortcut.url || ""),
      url: shortcut.url
    });

    if (draft.shortcuts.length > 8) {
      draft.shortcuts = draft.shortcuts.slice(0, 8);
    }
  });
}

export function removeShortcut(stateApi, shortcutId) {
  stateApi.updateState((draft) => {
    draft.shortcuts = draft.shortcuts.filter((item) => item.id !== shortcutId);
  });
}

export function getAddressAutocomplete(state, query = "", limit = 7) {
  const q = query.trim().toLowerCase();
  const pool = [...(state.bookmarks || []), ...(state.history || [])];
  const map = new Map();

  pool.forEach((item) => {
    if (item?.url && !map.has(item.url)) {
      map.set(item.url, {
        title: item.title || shortUrl(item.url),
        url: item.url
      });
    }
  });

  const list = Array.from(map.values());
  if (!q) {
    return list.slice(0, limit);
  }

  return list
    .filter((item) => item.url.toLowerCase().includes(q) || item.title.toLowerCase().includes(q))
    .slice(0, limit);
}

export function renderHistoryList(container, state, onOpen) {
  if (!container) {
    return;
  }

  container.innerHTML = "";
  const items = (state.history || []).slice(0, 40);

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Historia jest pusta.";
    container.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "list-row";

    const link = document.createElement("button");
    link.className = "action-btn subtle";
    link.type = "button";
    link.textContent = item.title;
    link.title = item.url;
    link.addEventListener("click", () => onOpen(item.url));

    const meta = document.createElement("small");
    meta.textContent = new Date(item.visitedAt).toLocaleTimeString();

    row.append(link, meta);
    container.appendChild(row);
  });
}

export function renderBookmarksList(container, state, onOpen, onRemove) {
  if (!container) {
    return;
  }

  container.innerHTML = "";
  const items = state.bookmarks || [];

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Brak zakladek.";
    container.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "list-row";

    const openBtn = document.createElement("button");
    openBtn.className = "action-btn subtle";
    openBtn.type = "button";
    openBtn.textContent = item.title;
    openBtn.addEventListener("click", () => onOpen(item.url));

    const removeBtn = document.createElement("button");
    removeBtn.className = "icon-btn tiny";
    removeBtn.type = "button";
    removeBtn.textContent = "x";
    removeBtn.addEventListener("click", () => onRemove(item.id));

    row.append(openBtn, removeBtn);
    container.appendChild(row);
  });
}
