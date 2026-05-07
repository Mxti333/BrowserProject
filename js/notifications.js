export function createNotifier(container) {
  function show(message, type = "info", duration = 4000) {
    if (!container) {
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(10px)";
      window.setTimeout(() => toast.remove(), 220);
    }, duration);
  }

  return {
    info: (message, duration) => show(message, "info", duration),
    success: (message, duration) => show(message, "success", duration),
    warning: (message, duration) => show(message, "warning", duration),
    error: (message, duration) => show(message, "error", duration),
    raw: show
  };
}

export function installRipples(root = document) {
  root.addEventListener("click", (event) => {
    const target = event.target.closest(".icon-btn, .action-btn, .tab-item, .quick-card");
    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

    target.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
}

export function createLoadingController(progressBar) {
  let timer = null;

  function start() {
    if (!progressBar) {
      return;
    }

    clearInterval(timer);
    progressBar.classList.add("loading");
    progressBar.style.width = "7%";

    timer = window.setInterval(() => {
      const current = Number.parseFloat(progressBar.style.width || "0");
      const next = Math.min(current + Math.random() * 12, 88);
      progressBar.style.width = `${next}%`;
    }, 150);
  }

  function stop() {
    if (!progressBar) {
      return;
    }

    clearInterval(timer);
    progressBar.style.width = "100%";
    window.setTimeout(() => {
      progressBar.classList.remove("loading");
      progressBar.style.width = "0%";
    }, 250);
  }

  return { start, stop };
}

export function spinOnce(element, className = "spin-once") {
  if (!element) {
    return;
  }
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), 450);
}
