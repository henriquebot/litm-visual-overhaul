const MODULE_ID = "litm-visual-overhaul";
const SYSTEM_ID = "mist-engine-fvtt";

const SETTINGS = {
  theme: "theme",
  accent: "accentColor",
  secondary: "secondaryColor",
  glow: "glowIntensity",
  sharpCards: "sharpCards",
  scanlines: "scanlines",
  denseUi: "denseUi"
};

function registerSettings() {
  game.settings.register(MODULE_ID, SETTINGS.theme, {
    name: "LITMVO.Settings.Theme.Name",
    hint: "LITMVO.Settings.Theme.Hint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      official: "LITMVO.Settings.Theme.Official",
      scifi: "LITMVO.Settings.Theme.Scifi"
    },
    default: "scifi",
    requiresReload: false,
    onChange: applyTheme
  });

  game.settings.register(MODULE_ID, SETTINGS.accent, {
    name: "LITMVO.Settings.Accent.Name",
    hint: "LITMVO.Settings.Accent.Hint",
    scope: "world",
    config: true,
    type: String,
    default: "#4de1ff",
    requiresReload: false,
    onChange: applyTheme
  });

  game.settings.register(MODULE_ID, SETTINGS.secondary, {
    name: "LITMVO.Settings.Secondary.Name",
    hint: "LITMVO.Settings.Secondary.Hint",
    scope: "world",
    config: true,
    type: String,
    default: "#c45cff",
    requiresReload: false,
    onChange: applyTheme
  });

  game.settings.register(MODULE_ID, SETTINGS.glow, {
    name: "LITMVO.Settings.Glow.Name",
    hint: "LITMVO.Settings.Glow.Hint",
    scope: "world",
    config: true,
    type: Number,
    range: { min: 0, max: 100, step: 5 },
    default: 45,
    requiresReload: false,
    onChange: applyTheme
  });

  game.settings.register(MODULE_ID, SETTINGS.sharpCards, {
    name: "LITMVO.Settings.SharpCards.Name",
    hint: "LITMVO.Settings.SharpCards.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: false,
    onChange: applyTheme
  });

  game.settings.register(MODULE_ID, SETTINGS.scanlines, {
    name: "LITMVO.Settings.Scanlines.Name",
    hint: "LITMVO.Settings.Scanlines.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: false,
    onChange: applyTheme
  });

  game.settings.register(MODULE_ID, SETTINGS.denseUi, {
    name: "LITMVO.Settings.DenseUi.Name",
    hint: "LITMVO.Settings.DenseUi.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: false,
    onChange: applyTheme
  });
}

function getSetting(key, fallback) {
  try {
    return game.settings.get(MODULE_ID, key);
  } catch {
    return fallback;
  }
}

function normalizeHex(value, fallback) {
  const input = String(value ?? "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(input)) return input;
  if (/^#[0-9a-fA-F]{3}$/.test(input)) {
    return "#" + [...input.slice(1)].map(c => c + c).join("");
  }
  return fallback;
}

function hexToRgb(hex) {
  const value = normalizeHex(hex, "#4de1ff").slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16)
  };
}

export function applyTheme() {
  if (game.system.id !== SYSTEM_ID) return;

  const body = document.body;
  if (!body) return;

  const theme = getSetting(SETTINGS.theme, "scifi");
  const accent = normalizeHex(getSetting(SETTINGS.accent, "#4de1ff"), "#4de1ff");
  const secondary = normalizeHex(getSetting(SETTINGS.secondary, "#c45cff"), "#c45cff");
  const glow = Math.max(0, Math.min(100, Number(getSetting(SETTINGS.glow, 45)))) / 100;
  const sharpCards = Boolean(getSetting(SETTINGS.sharpCards, true));
  const scanlines = Boolean(getSetting(SETTINGS.scanlines, false));
  const denseUi = Boolean(getSetting(SETTINGS.denseUi, false));

  const a = hexToRgb(accent);
  const s = hexToRgb(secondary);

  body.classList.remove(
    "litm-vo-official",
    "litm-vo-scifi",
    "litm-vo-sharp-cards",
    "litm-vo-scanlines",
    "litm-vo-dense"
  );

  body.classList.add(theme === "official" ? "litm-vo-official" : "litm-vo-scifi");
  if (sharpCards) body.classList.add("litm-vo-sharp-cards");
  if (scanlines) body.classList.add("litm-vo-scanlines");
  if (denseUi) body.classList.add("litm-vo-dense");

  body.dataset.litmVoTheme = theme;

  const root = document.documentElement;
  root.style.setProperty("--litm-vo-accent", accent);
  root.style.setProperty("--litm-vo-secondary", secondary);
  root.style.setProperty("--litm-vo-accent-rgb", `${a.r} ${a.g} ${a.b}`);
  root.style.setProperty("--litm-vo-secondary-rgb", `${s.r} ${s.g} ${s.b}`);
  root.style.setProperty("--litm-vo-glow", String(glow));
  root.style.setProperty("--litm-vo-card-radius", sharpCards ? "2px" : "10px");
}

Hooks.once("init", () => {
  if (game.system.id !== SYSTEM_ID) {
    console.warn(`${MODULE_ID} | This module is intended for ${SYSTEM_ID}.`);
    return;
  }

  registerSettings();
  console.log(`${MODULE_ID} | Settings registered.`);
});

Hooks.once("ready", () => {
  if (game.system.id !== SYSTEM_ID) return;
  applyTheme();
  console.log(`${MODULE_ID} | Visual theme applied.`);
});

Hooks.on("renderSettingsConfig", () => {
  if (game.system.id !== SYSTEM_ID) return;
  applyTheme();
});
