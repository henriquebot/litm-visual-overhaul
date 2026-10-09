/**
 * Keep Jump Scare overlays in the visible game region next to RPGUP VDO.Ninja.
 * Recalculate while the Foundry window is moved, resized or closed.
 */
const OUR_MODULE = "litm-visual-overhaul";
const SC_MODULE = "sc-jump-scare";
const STYLE_ID = "litm-vo-jump-scare-overlay-front";
const ROOT_VAR = "--litm-vo-sc-jump-scare-left";
let controller = null;

function findVdoPanel() {
  return [...document.querySelectorAll(".application, .window-app")]
    .find(el => /RPGUP\s+VDO\.Ninja/i.test(
      el.querySelector(".window-title, .window-header")?.textContent ?? ""
    )) ?? null;
}

function eligible(panel, boardLeft) {
  if (!panel || !panel.isConnected || panel.classList.contains("minimized")) return false;
  const style = getComputedStyle(panel);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const box = panel.getBoundingClientRect();
  if (box.height < 60 || box.width < 40 || box.right <= boardLeft) return false;
  // Ignore VDO windows moved entirely to the right of the screen.
  return box.left <= Math.max(boardLeft + 64, window.innerWidth * 0.18);
}

function stopTracking() {
  if (controller) {
    controller.disconnected = true;
    controller.mutation.disconnect();
    controller.attributes.disconnect();
    controller.sizes.disconnect();
    if (controller.frame !== null) cancelAnimationFrame(controller.frame);
    window.removeEventListener("resize", controller.requestUpdate);
    controller = null;
  }
  document.getElementById(STYLE_ID)?.remove();
  document.documentElement.style.removeProperty(ROOT_VAR);
}

export async function applyJumpScareOverlayPriority() {
  stopTracking();
  if (!game.modules.get(SC_MODULE)?.active ||
      !game.settings.get(OUR_MODULE, "jumpScareOverlayOnTop")) return false;

  try {
    const { OVERLAY_CLASS } = await import(
      "/modules/sc-jump-scare/scripts/constants/constants.js"
    );
    if (typeof OVERLAY_CLASS !== "string" || !OVERLAY_CLASS.trim()) return false;
    if (!game.settings.get(OUR_MODULE, "jumpScareOverlayOnTop")) return false;

    const selector = "." + CSS.escape(OVERLAY_CLASS.replace(/^\./, ""));
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      selector + " {",
      "  z-index: 2147483000 !important;",
      "  left: var(" + ROOT_VAR + ", 0px) !important;",
      "  right: 0 !important;",
      "  width: calc(100vw - var(" + ROOT_VAR + ", 0px)) !important;",
      "}"
    ].join("\n");
    document.head.append(style);

    const state = {
      disconnected: false,
      frame: null,
      panel: null,
      board: null,
      mutation: null,
      attributes: null,
      sizes: null,
      requestUpdate: null
    };

    function refresh() {
      state.frame = null;
      if (state.disconnected) return;
      const board = document.querySelector("#board");
      const boardLeft = Math.max(0, board?.getBoundingClientRect().left ?? 0);
      const panel = findVdoPanel();

      if (panel !== state.panel || board !== state.board) {
        state.sizes.disconnect();
        state.attributes.disconnect();
        if (panel) {
          state.sizes.observe(panel);
          state.attributes.observe(panel, {
            attributes: true, attributeFilter: ["style", "class"]
          });
        }
        if (board) state.sizes.observe(board);
        state.panel = panel;
        state.board = board;
      }

      let left = boardLeft;
      if (game.settings.get(OUR_MODULE, "jumpScareRespectVdoBounds") &&
          eligible(panel, boardLeft)) {
        left = Math.max(left, panel.getBoundingClientRect().right);
      }
      const next = String(Math.ceil(Math.max(0, Math.min(window.innerWidth, left)))) + "px";
      if (document.documentElement.style.getPropertyValue(ROOT_VAR) !== next) {
        document.documentElement.style.setProperty(ROOT_VAR, next);
      }
    }

    state.requestUpdate = () => {
      if (!state.disconnected && state.frame === null) {
        state.frame = requestAnimationFrame(refresh);
      }
    };
    state.sizes = new ResizeObserver(state.requestUpdate);
    state.attributes = new MutationObserver(state.requestUpdate);
    state.mutation = new MutationObserver(state.requestUpdate);
    state.mutation.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", state.requestUpdate, { passive: true });
    controller = state;
    refresh();
    console.log(OUR_MODULE + " | Jump Scare overlay tracks VDO.Ninja bounds.");
    return true;
  } catch (error) {
    stopTracking();
    console.error(OUR_MODULE + " | Failed to configure Jump Scare overlay.", error);
    return false;
  }
}
