const modeClasses = ["mode-system", "mode-dark", "mode-light"];
const themeClasses = [
  "theme-nexora-dark",
  "theme-aurora",
  "theme-solar-flare",
  "theme-arctic",
  "theme-sakura",
  "theme-matrix"
];
const fontClasses = ["font-outfit", "font-inter", "font-jetbrains"];
const densityClasses = ["density-comfortable", "density-normal", "density-compact"];

const themePresets = [
  { id: "nexora-dark", label: "NEXORA Dark", preview: "linear-gradient(135deg,#080810,#121734)", accent: "#6c63ff" },
  { id: "aurora", label: "Aurora", preview: "linear-gradient(135deg,#0a1218,#244a35)", accent: "#58ff96" },
  { id: "solar-flare", label: "Solar Flare", preview: "linear-gradient(135deg,#24110a,#6e230f)", accent: "#ff7b32" },
  { id: "arctic", label: "Arctic", preview: "linear-gradient(135deg,#0d1b2b,#2a475f)", accent: "#66d7ff" },
  { id: "sakura", label: "Sakura", preview: "linear-gradient(135deg,#ffd8ef,#d9c9ff)", accent: "#ff5fa2" },
  { id: "matrix", label: "Matrix", preview: "linear-gradient(135deg,#030703,#0f200f)", accent: "#39ff14" }
];

let transitionTimer = null;

function withTransition(callback) {
  document.body.classList.add("theme-transition");
  callback();
  clearTimeout(transitionTimer);
  transitionTimer = window.setTimeout(() => document.body.classList.remove("theme-transition"), 400);
}

export function getThemePresets() {
  return themePresets.slice();
}

export function applyVisualSettings(settings) {
  if (!settings) {
    return;
  }

  withTransition(() => {
    document.body.classList.remove(...modeClasses);
    document.body.classList.add(`mode-${settings.mode || "system"}`);

    document.body.classList.remove(...themeClasses);
    document.body.classList.add(`theme-${settings.theme || "nexora-dark"}`);

    document.body.classList.remove(...fontClasses);
    document.body.classList.add(`font-${settings.font || "outfit"}`);

    document.body.classList.remove(...densityClasses);
    document.body.classList.add(`density-${settings.density || "normal"}`);

    if (settings.accentColor) {
      document.documentElement.style.setProperty("--accent", settings.accentColor);
    }

    if (settings.zoom) {
      document.documentElement.style.setProperty("--page-zoom", String(settings.zoom / 100));
    }

    if (settings.fontSize) {
      document.documentElement.style.setProperty("--ui-font-size", `${settings.fontSize}px`);
    }
  });
}

export function setAccentColor(color) {
  document.documentElement.style.setProperty("--accent", color);
}

export function setZoom(zoom) {
  document.documentElement.style.setProperty("--page-zoom", String(zoom / 100));
}

export function setFontSize(sizePx) {
  document.documentElement.style.setProperty("--ui-font-size", `${sizePx}px`);
}
