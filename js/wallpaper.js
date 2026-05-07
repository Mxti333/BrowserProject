const MAX_WALLPAPER_BYTES = 2 * 1024 * 1024;

export const wallpaperPresets = [
  { id: "preset-1", label: "Nebula", value: "linear-gradient(135deg,#16182f 0%,#2b1d52 45%,#102744 100%)", type: "gradient" },
  { id: "preset-2", label: "Aurora", value: "linear-gradient(145deg,#0b1e1b 0%,#1f4037 42%,#485563 100%)", type: "gradient" },
  { id: "preset-3", label: "Solar", value: "linear-gradient(140deg,#2b0f0f 0%,#5a1a0f 45%,#8f3f16 100%)", type: "gradient" },
  { id: "preset-4", label: "Arctic", value: "linear-gradient(140deg,#11243a 0%,#2d4f71 45%,#6ea9d5 100%)", type: "gradient" },
  { id: "preset-5", label: "Sakura", value: "linear-gradient(140deg,#f7dde8 0%,#e7d4ff 50%,#f3b9dd 100%)", type: "gradient" },
  { id: "preset-6", label: "Matrix", value: "linear-gradient(140deg,#030703 0%,#0a1a0a 50%,#113211 100%)", type: "gradient" }
];

function estimateDataUrlBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function compressDataUrl(dataUrl, targetBytes = MAX_WALLPAPER_BYTES) {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const maxWidth = 1920;
  const scale = Math.min(1, maxWidth / img.width);
  canvas.width = Math.max(1, Math.floor(img.width * scale));
  canvas.height = Math.max(1, Math.floor(img.height * scale));

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let quality = 0.88;
  let output = canvas.toDataURL("image/jpeg", quality);

  while (estimateDataUrlBytes(output) > targetBytes && quality > 0.35) {
    quality -= 0.1;
    output = canvas.toDataURL("image/jpeg", quality);
  }

  return output;
}

export function applyWallpaper(settings, elements) {
  const wallpaper = settings.wallpaper || {};
  const layer = elements.wallpaperLayer;
  const overlay = elements.wallpaperOverlay;
  const preview = elements.wallpaperPreview;

  if (!layer || !overlay) {
    return;
  }

  const source = wallpaper.source || "";
  const type = wallpaper.type || "none";

  layer.style.backgroundImage = source ? (type === "gradient" ? source : `url(${source})`) : "none";
  layer.style.backgroundRepeat = wallpaper.fit === "tile" ? "repeat" : "no-repeat";
  layer.style.backgroundSize = wallpaper.fit === "tile" ? "auto" : wallpaper.fit || "cover";
  layer.style.backgroundPosition = "center";

  const dimValue = Number(wallpaper.dim ?? 28);
  const blurValue = Number(wallpaper.blur ?? 0);

  document.documentElement.style.setProperty("--wallpaper-dim", String(dimValue / 100));
  document.documentElement.style.setProperty("--wallpaper-blur", `${blurValue}px`);

  if (preview) {
    preview.style.backgroundImage = source ? (type === "gradient" ? source : `url(${source})`) : "linear-gradient(135deg,#191a31,#10162c)";
    preview.style.backgroundRepeat = wallpaper.fit === "tile" ? "repeat" : "no-repeat";
    preview.style.backgroundSize = wallpaper.fit === "tile" ? "auto" : wallpaper.fit || "cover";
    preview.style.filter = `brightness(${1 - dimValue / 100}) blur(${Math.max(0, blurValue * 0.25)}px)`;
  }
}

export function createWallpaperController(options) {
  const {
    elements,
    getSettings,
    updateSettings,
    notify
  } = options;

  function renderPresetButtons() {
    if (!elements.wallpaperPresetGrid) {
      return;
    }

    elements.wallpaperPresetGrid.innerHTML = "";
    wallpaperPresets.forEach((preset) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "wallpaper-preset";
      btn.title = preset.label;
      btn.style.background = preset.value;
      btn.addEventListener("click", () => {
        updateSettings((settings) => {
          settings.wallpaper.source = preset.value;
          settings.wallpaper.type = "gradient";
        });
      });
      elements.wallpaperPresetGrid.appendChild(btn);
    });
  }

  async function setWallpaperFromFile(file) {
    if (!file) {
      return;
    }

    try {
      let dataUrl = await fileToDataUrl(file);

      if (estimateDataUrlBytes(dataUrl) > MAX_WALLPAPER_BYTES) {
        notify.warning("Tapeta jest duza. Trwa kompresja...");
        dataUrl = await compressDataUrl(dataUrl, MAX_WALLPAPER_BYTES);
      }

      if (estimateDataUrlBytes(dataUrl) > MAX_WALLPAPER_BYTES) {
        notify.warning("Tapeta nadal przekracza 2MB po kompresji.");
      }

      updateSettings((settings) => {
        settings.wallpaper.source = dataUrl;
        settings.wallpaper.type = "image";
      });
      notify.success("Tapeta ustawiona.");
    } catch (error) {
      notify.error(`Nie mozna wczytac tapety: ${error.message}`);
    }
  }

  function bind() {
    renderPresetButtons();

    elements.chooseWallpaperBtn?.addEventListener("click", () => {
      elements.wallpaperInput?.click();
    });

    elements.wallpaperInput?.addEventListener("change", async () => {
      await setWallpaperFromFile(elements.wallpaperInput.files?.[0]);
      elements.wallpaperInput.value = "";
    });

    elements.removeWallpaperBtn?.addEventListener("click", () => {
      updateSettings((settings) => {
        settings.wallpaper = {
          source: "",
          type: "none",
          dim: 28,
          blur: 0,
          fit: "cover"
        };
      });
      notify.info("Tapeta usunieta.");
    });

    elements.wallpaperDimRange?.addEventListener("input", (event) => {
      const value = Number(event.target.value);
      updateSettings((settings) => {
        settings.wallpaper.dim = value;
      });
    });

    elements.wallpaperBlurRange?.addEventListener("input", (event) => {
      const value = Number(event.target.value);
      updateSettings((settings) => {
        settings.wallpaper.blur = value;
      });
    });

    elements.wallpaperFitSelect?.addEventListener("change", (event) => {
      const value = String(event.target.value);
      updateSettings((settings) => {
        settings.wallpaper.fit = value;
      });
    });
  }

  function syncControls() {
    const settings = getSettings();
    const wallpaper = settings.wallpaper || {};
    if (elements.wallpaperDimRange) elements.wallpaperDimRange.value = String(wallpaper.dim ?? 28);
    if (elements.wallpaperBlurRange) elements.wallpaperBlurRange.value = String(wallpaper.blur ?? 0);
    if (elements.wallpaperFitSelect) elements.wallpaperFitSelect.value = wallpaper.fit || "cover";
  }

  return { bind, syncControls, apply: () => applyWallpaper(getSettings(), elements) };
}
