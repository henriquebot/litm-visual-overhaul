import { translateRollCardMessage } from "./roll-card-ptbr.mjs";
import { setupAdvancedRollRules } from "./advanced-roll-rules.mjs";

const MODULE_ID = "litm-visual-overhaul";
const SYSTEM_ID = "mist-engine-fvtt";

const SETTINGS = {
  theme: "theme",
  accent: "accentColor",
  secondary: "secondaryColor",
  glow: "glowIntensity",
  sharpCards: "sharpCards",
  scanlines: "scanlines",
  denseUi: "denseUi",
  rollCardTranslation: "rollCardTranslation",
  advancedRollRules: "advancedRollRules"
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

  game.settings.register(MODULE_ID, SETTINGS.rollCardTranslation, {
    name: "LITMVO.Settings.RollCardTranslation.Name",
    hint: "LITMVO.Settings.RollCardTranslation.Hint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      off: "LITMVO.Settings.RollCardTranslation.Off",
      ptBR: "LITMVO.Settings.RollCardTranslation.PtBR"
    },
    default: "ptBR",
    requiresReload: true
  });

  game.settings.register(MODULE_ID, SETTINGS.advancedRollRules, {
    name: "LITMVO.Settings.AdvancedRollRules.Name",
    hint: "LITMVO.Settings.AdvancedRollRules.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: false
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


function elementFrom(candidate) {
  if (!candidate) return null;
  if (candidate instanceof HTMLElement) return candidate;
  if (candidate?.[0] instanceof HTMLElement) return candidate[0];
  return null;
}

function reinforceCharacterArtwork(app, html) {
  if (game.system.id !== SYSTEM_ID) return;
  if (!document.body.classList.contains("litm-vo-scifi")) return;

  const actor = app?.actor ?? app?.document;
  if (!actor || actor.documentName !== "Actor" || actor.type !== "character") return;

  const rootCandidate = elementFrom(app?.element) ?? elementFrom(html);
  if (!rootCandidate) return;

  const sheet = rootCandidate.matches?.(".mist-engine.sheet.actor.litm-character")
    ? rootCandidate
    : rootCandidate.querySelector?.(".mist-engine.sheet.actor.litm-character");

  if (!sheet || sheet.classList.contains("litm-compact")) return;

  const content = sheet.querySelector?.(".window-content");
  const background = actor.system?.customBackground;
  if (!content || !background) return;

  const cssUrl = `url(${JSON.stringify(String(background))})`;
  content.style.setProperty("background-image", cssUrl, "important");
  content.style.setProperty("background-size", "cover", "important");
  content.style.setProperty("background-position", "left top", "important");
  content.style.setProperty("background-repeat", "no-repeat", "important");
}


function syncCharacterEditModeClass(app, html) {
  if (game.system.id !== SYSTEM_ID) return;

  const rootCandidate = elementFrom(app?.element) ?? elementFrom(html);
  if (!rootCandidate) return;

  const sheet = rootCandidate.matches?.(".mist-engine.sheet.actor.litm-character")
    ? rootCandidate
    : rootCandidate.querySelector?.(".mist-engine.sheet.actor.litm-character");

  if (!sheet) return;

  const isEditMode = Boolean(
    sheet.querySelector(".sheet-header.edit-mode") ||
    sheet.querySelector("#character .right-side.edit-mode") ||
    sheet.querySelector(".themebooks-container.edit-mode")
  );

  sheet.classList.toggle("litm-vo-edit-mode", isEditMode);
}

function scheduleArtworkReinforcement(app, html) {
  requestAnimationFrame(() => reinforceCharacterArtwork(app, html));
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

Hooks.once("ready", async () => {
  if (game.system.id !== SYSTEM_ID) return;
  applyTheme();
  await setupAdvancedRollRules();
  console.log(`${MODULE_ID} | Visual theme applied.`);
});

Hooks.on("renderSettingsConfig", () => {
  if (game.system.id !== SYSTEM_ID) return;
  applyTheme();
});


Hooks.on("renderActorSheet", (app, html) => {
  syncCharacterEditModeClass(app, html);
  scheduleArtworkReinforcement(app, html);
});

Hooks.on("renderApplicationV2", (app, html) => {
  syncCharacterEditModeClass(app, html);
  scheduleArtworkReinforcement(app, html);
});

Hooks.on("renderChatMessageHTML", (message, element) => {
  if (game.system.id !== SYSTEM_ID) return;
  if (getSetting(SETTINGS.rollCardTranslation, "ptBR") !== "ptBR") return;

  try {
    translateRollCardMessage(message, element);
  } catch (error) {
    console.error(`${MODULE_ID} | Failed to translate roll card.`, error);
  }
});


/**
 * Development helper for rapid visual iteration.
 * Fetches the latest stylesheet from GitHub main and injects it after the
 * installed module CSS. This changes only the current browser session.
 */
async function reloadRemoteCss() {
  const url = `https://raw.githubusercontent.com/henriquebot/litm-visual-overhaul/main/styles/overhaul.css?t=${Date.now()}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`LiTM Visual Overhaul: CSS fetch failed (${response.status})`);

  const css = await response.text();
  let style = document.getElementById("litm-vo-live-css");
  if (!style) {
    style = document.createElement("style");
    style.id = "litm-vo-live-css";
    style.dataset.module = MODULE_ID;
    document.head.append(style);
  }

  style.textContent = css;
  applyTheme();
  ui.notifications?.info?.("LiTM Visual Overhaul: CSS atualizado do GitHub.");
  console.log(`${MODULE_ID} | Live CSS reloaded from GitHub.`);
  return true;
}

function clearRemoteCss() {
  document.getElementById("litm-vo-live-css")?.remove();
  applyTheme();
  ui.notifications?.info?.("LiTM Visual Overhaul: CSS ao vivo removido.");
}

globalThis.LiTMVO = Object.assign(globalThis.LiTMVO ?? {}, {
  applyTheme,
  reloadCSS: reloadRemoteCss,
  clearLiveCSS: clearRemoteCss,
  version: "dev"
});
