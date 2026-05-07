export function initKeyboardShortcuts(actions) {
  function handler(event) {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;

    if (ctrl && key === "t") {
      event.preventDefault();
      actions.newTab?.();
      return;
    }

    if (ctrl && key === "w") {
      event.preventDefault();
      actions.closeTab?.();
      return;
    }

    if (ctrl && key === "l") {
      event.preventDefault();
      actions.focusAddress?.();
      return;
    }

    if (ctrl && key === "d") {
      event.preventDefault();
      actions.toggleBookmark?.();
      return;
    }

    if (ctrl && key === "h") {
      event.preventDefault();
      actions.openHistory?.();
      return;
    }

    if (ctrl && key === "f") {
      event.preventDefault();
      actions.openFind?.();
      return;
    }

    if (ctrl && shift && key === "n") {
      event.preventDefault();
      actions.toggleIncognito?.();
      return;
    }

    if (ctrl && key === "tab") {
      event.preventDefault();
      actions.nextTab?.();
      return;
    }

    if (key === "f11") {
      event.preventDefault();
      actions.toggleFullscreen?.();
    }
  }

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}

export function initZoomByWheel(target, onZoomDelta) {
  const handleWheel = (event) => {
    if (!(event.ctrlKey || event.metaKey)) {
      return;
    }
    event.preventDefault();
    onZoomDelta?.(event.deltaY < 0 ? 10 : -10);
  };

  target.addEventListener("wheel", handleWheel, { passive: false });
  return () => target.removeEventListener("wheel", handleWheel);
}
