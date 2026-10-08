/**
 * Optional compatibility bridge for SC - Jump Scare 1.0.2.
 *
 * That module already supports GM playback through ScareTrigger.trigger()
 * when the GM's user ID is explicitly included in the "to" array. Its
 * automatic recipient resolution omits GMs, though, so we add the invoking
 * GM without changing SC - Jump Scare's files, payloads, sockets or player
 * targeting rules.
 *
 * Trigger Now, region behaviors and the public api.play()/playAdHoc() all
 * eventually call ScareTrigger.trigger(). Previews do not, and stay local.
 */
const OUR_MODULE = "litm-visual-overhaul";
const SCARE_MODULE = "sc-jump-scare";
const SETTING = "jumpScareShowGM";
const PATCH_MARKER = Symbol.for("litm-visual-overhaul.sc-jump-scare-show-gm");

function chosenRecipients(scare, options) {
  // An explicit selection (e.g. Trigger Now's player picker) takes priority.
  if (Array.isArray(options?.to)) return options.to;

  // "Everyone" means all connected players, matching SC - Jump Scare's
  // native semantics before adding the invoking GM.
  if (scare?.everyone) {
    return game.users.filter(user => user.active && !user.isGM).map(user => user.id);
  }

  return Array.isArray(scare?.targets) ? scare.targets : [];
}

/**
 * Install only on the GM client; always install while SC - Jump Scare is
 * active so the setting can be enabled or disabled without a page reload.
 */
export async function setupJumpScareGMIntegration() {
  if (!game.user?.isGM || !game.modules.get(SCARE_MODULE)?.active) return false;

  try {
    const { ScareTrigger } = await import("/modules/sc-jump-scare/scripts/services/ScareTrigger.js");
    if (typeof ScareTrigger?.trigger !== "function") {
      console.warn(`${OUR_MODULE} | SC - Jump Scare trigger API unavailable.`);
      return false;
    }
    if (ScareTrigger.trigger[PATCH_MARKER]) return true;

    const originalTrigger = ScareTrigger.trigger;
    function withGM(scare, options = {}) {
      if (!game.user?.isGM || !game.settings.get(OUR_MODULE, SETTING)) {
        return originalTrigger.call(this, scare, options);
      }

      const recipients = chosenRecipients(scare, options);
      const to = [...new Set([...recipients, game.user.id])];
      return originalTrigger.call(this, scare, { ...options, to });
    }

    Object.defineProperty(withGM, PATCH_MARKER, { value: true });
    ScareTrigger.trigger = withGM;
    console.log(`${OUR_MODULE} | Optional SC - Jump Scare GM playback bridge ready.`);
    return true;
  } catch (error) {
    console.error(`${OUR_MODULE} | Could not initialize SC - Jump Scare integration.`, error);
    return false;
  }
}

/**
 * Put SC - Jump Scare's overlay above VDO.Ninja and other Foundry panels.
 * Optional because SC - Jump Scare normally keeps the overlay below
 * Foundry windows for usability. The original Esc-to-stop handling remains.
 *
 * The selector comes from SC's own public module constants. The CSS-only
 * override affects only the overlay, never the VDO panel's z-index.
 * It is installed on every client with both modules active.
 */
export async function applyJumpScareOverlayPriority() {
  const styleId = "litm-vo-jump-scare-overlay-front";
  document.getElementById(styleId)?.remove();

  if (!game.modules.get(SCARE_MODULE)?.active ||
      !game.settings.get(OUR_MODULE, "jumpScareOverlayOnTop")) return false;

  try {
    const { OVERLAY_CLASS } = await import(
      "/modules/sc-jump-scare/scripts/constants/constants.js"
    );
    if (typeof OVERLAY_CLASS !== "string" || !OVERLAY_CLASS.trim()) {
      console.warn(`${OUR_MODULE} | SC - Jump Scare overlay class unavailable.`);
      return false;
    }

    // Recheck after the module import in case the setting was switched off.
    if (!game.settings.get(OUR_MODULE, "jumpScareOverlayOnTop")) return false;

    const selector = "." + CSS.escape(OVERLAY_CLASS.replace(/^\./, ""));
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `${selector} { z-index: 2147483000 !important; }`;
    document.head.append(style);
    console.log(`${OUR_MODULE} | Jump Scare overlay prioritized over Foundry panels.`);
    return true;
  } catch (error) {
    console.error(`${OUR_MODULE} | Could not prioritize Jump Scare overlay.`, error);
    return false;
  }
}
