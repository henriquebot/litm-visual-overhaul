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
      const invoke = () => {
        if (!game.user?.isGM || !game.settings.get(OUR_MODULE, SETTING)) {
          return originalTrigger.call(this, scare, options);
        }
        const recipients = chosenRecipients(scare, options);
        const to = [...new Set([...recipients, game.user.id])];
        return originalTrigger.call(this, scare, { ...options, to });
      };
      return game.settings.get(OUR_MODULE, "jumpScareHideTriggerToast")
        ? callWithoutTriggerToast(invoke)
        : invoke();
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


// SC Jump Scare 1.0.2 fires a synchronous confirmation via ui.notifications.info.
// Filter ONLY localized sent-confirmation messages during that call, leaving
// warnings, errors, and unrelated Foundry notifications untouched.
function triggerToastMatchers() {
  const markers = {
    name: "RPGUP_SCARE_NAME_37451",
    count: "987654321",
    optedOut: "876543210"
  };
  const escape = value => [...String(value)]
    .map(c => ".*+?^$()[]{}|\\".includes(c) ? "\\" + c : c)
    .join("");
  return ["JUMPSCARE.Notify.fired", "JUMPSCARE.Notify.firedWithOptOut"]
    .map(key => {
      try {
        const sample = game.i18n.format(key, markers);
        if (!sample.includes(markers.name) || !sample.includes(markers.count)) return null;
        const expression = escape(sample)
          .replace(escape(markers.name), "[\\s\\S]+?")
          .replace(escape(markers.count), "\\d+")
          .replace(escape(markers.optedOut), "\\d+");
        return new RegExp("^" + expression + "$");
      } catch {
        return null;
      }
    }).filter(Boolean);
}

function callWithoutTriggerToast(callback) {
  const notifications = globalThis.ui?.notifications;
  if (!notifications || typeof notifications.info !== "function") return callback();
  const patterns = triggerToastMatchers();
  if (!patterns.length) return callback();

  const originalInfo = notifications.info;
  const filteredInfo = function (message, ...args) {
    if (typeof message === "string" && patterns.some(pattern => pattern.test(message))) {
      return undefined;
    }
    return originalInfo.call(this, message, ...args);
  };

  notifications.info = filteredInfo;
  try {
    return callback();
  } finally {
    if (notifications.info === filteredInfo) notifications.info = originalInfo;
  }
}
