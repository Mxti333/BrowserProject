let progressTimer = null;

export function startLoadingProgress(progressBar) {
  if (!progressBar) {
    return;
  }

  clearInterval(progressTimer);
  progressBar.classList.add("loading");
  progressBar.style.width = "6%";

  progressTimer = setInterval(() => {
    const current = Number.parseFloat(progressBar.style.width) || 0;
    const next = Math.min(current + Math.random() * 14, 88);
    progressBar.style.width = `${next}%`;
  }, 160);
}

export function stopLoadingProgress(progressBar) {
  if (!progressBar) {
    return;
  }

  clearInterval(progressTimer);
  progressBar.style.width = "100%";

  window.setTimeout(() => {
    progressBar.classList.remove("loading");
    progressBar.style.width = "0%";
  }, 260);
}

export function showToast(container, message, type = "info", duration = 3200) {
  if (!container) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(8px)";
    window.setTimeout(() => toast.remove(), 220);
  }, duration);
}

export function installRipples(root = document) {
  root.addEventListener("click", (event) => {
    const target = event.target.closest(".icon-btn, .action-btn, .tab-item");
    if (!target) {
      return;
    }

    const circle = document.createElement("span");
    circle.className = "ripple";
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.left = `${event.clientX - rect.left - size / 2}px`;
    circle.style.top = `${event.clientY - rect.top - size / 2}px`;
    target.appendChild(circle);

    circle.addEventListener("animationend", () => {
      circle.remove();
    });
  });
}

export function spinElement(element, durationMs = 420) {
  if (!element) {
    return;
  }
  element.classList.add("spin-once");
  window.setTimeout(() => element.classList.remove("spin-once"), durationMs);
}
