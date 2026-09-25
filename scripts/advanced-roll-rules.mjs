const MODULE_ID = "litm-visual-overhaul";
const SYSTEM_ID = "mist-engine-fvtt";
const SETTING_KEY = "advancedRollRules";
const FLAG_KEY = "advancedRollRules";

const tradeState = new WeakMap();
const PREPARED = Symbol("litm-vo-trade-prepared");

let DetailedSpend = null;
let installed = false;

function enabled() {
  try {
    return game.settings.get(MODULE_ID, SETTING_KEY) !== false;
  } catch {
    return true;
  }
}

function elementFrom(candidate) {
  if (!candidate) return null;
  if (candidate instanceof HTMLElement) return candidate;
  if (candidate?.[0] instanceof HTMLElement) return candidate[0];
  return null;
}

function localize(key, fallback) {
  try {
    const value = game.i18n.localize(key);
    return value && value !== key ? value : fallback;
  } catch {
    return fallback;
  }
}

function computePowerForForm(app, formValues) {
  if (!app?.computePowerAmount) return 1;

  const oldPositive = app.numModPositive;
  const oldNegative = app.numModNegative;
  const oldMight = app.mightScale;

  try {
    app.numModPositive = Math.max(0, Number(formValues?.numModPositive) || 0);
    app.numModNegative = Math.max(0, Number(formValues?.numModNegative) || 0);
    app.mightScale = Number(formValues?.mightScale) || 0;
    return Math.max(1, Number(app.computePowerAmount()) || 1);
  } finally {
    app.numModPositive = oldPositive;
    app.numModNegative = oldNegative;
    app.mightScale = oldMight;
  }
}

function normalizeTrade(app, trade, originalPower) {
  if (!enabled() || app?.rollType !== "detailed") return 0;
  if (trade === -1 && originalPower <= 2) return -1;
  if (trade === 1 && originalPower >= 2) return 1;
  return 0;
}

function prepareFormValues(app, formValues) {
  if (formValues?.[PREPARED]) return formValues;

  const originalPower = computePowerForForm(app, formValues);
  const selectedTrade = Number(tradeState.get(app) ?? 0);
  const tradePower = normalizeTrade(app, selectedTrade, originalPower);
  const prepared = {
    ...formValues,
    numModPositive: Math.max(0, Number(formValues?.numModPositive) || 0),
    numModNegative: Math.max(0, Number(formValues?.numModNegative) || 0),
    mightScale: Number(formValues?.mightScale) || 0
  };

  if (tradePower === -1) prepared.numModNegative += 1;
  if (tradePower === 1) prepared.numModPositive += 1;

  Object.defineProperty(prepared, PREPARED, {
    value: { tradePower, originalPower },
    enumerable: false,
    configurable: false
  });

  return prepared;
}

function findNewRollMessage(beforeIds, actorId) {
  const messages = [...(game.messages?.contents ?? [])].reverse();
  return messages.find(message => {
    if (beforeIds.has(message.id)) return false;
    if (actorId && message.speaker?.actor && message.speaker.actor !== actorId) return false;
    return Boolean(message.content?.includes?.("roll-card"));
  }) ?? null;
}

async function stampRollMessage(message, { type, tradePower, originalPower }) {
  if (!message) return;

  const rules = {
    version: 1,
    type,
    tradePower,
    originalPower,
    pushed: false
  };

  const update = {
    [`flags.${MODULE_ID}.${FLAG_KEY}`]: rules
  };

  if (type === "detailed" && DetailedSpend) {
    const current = message.getFlag(SYSTEM_ID, "detailedSpend");
    if (current) {
      const data = foundry.utils.deepClone(current);
      const succeeded = Number(data.consequenceResult) >= 0;

      if (succeeded && tradePower !== 0) {
        const spendPower = tradePower === -1
          ? originalPower + 1
          : Math.max(1, originalPower - 1);

        data.total = spendPower;
        data.numPowerTags = spendPower;
        rules.spendPower = spendPower;
        update[`flags.${SYSTEM_ID}.detailedSpend`] = data;
        update.content = await DetailedSpend.renderDetailedCard(data);
      }
    }
  }

  await message.update(update);
}

function currentBasePower(app) {
  try {
    return Math.max(1, Number(app.computePowerAmount()) || 1);
  } catch {
    return 1;
  }
}

function setText(el, text) {
  if (el) el.textContent = text;
}

function refreshTradeUi(app, root) {
  const box = root.querySelector(".litm-vo-trade-power");
  if (!box) return;

  const power = currentBasePower(app);
  let trade = Number(tradeState.get(app) ?? 0);

  const caution = box.querySelector('input[value="-1"]');
  const none = box.querySelector('input[value="0"]');
  const hedge = box.querySelector('input[value="1"]');

  const canCaution = power <= 2;
  const canHedge = power >= 2;

  if (caution) caution.disabled = !canCaution;
  if (hedge) hedge.disabled = !canHedge;

  box.querySelector('[data-trade-option="-1"]')?.classList.toggle("is-disabled", !canCaution);
  box.querySelector('[data-trade-option="1"]')?.classList.toggle("is-disabled", !canHedge);

  if ((trade === -1 && !canCaution) || (trade === 1 && !canHedge)) {
    trade = 0;
    tradeState.set(app, 0);
  }

  if (caution) caution.checked = trade === -1;
  if (none) none.checked = trade === 0;
  if (hedge) hedge.checked = trade === 1;

  const summary = box.querySelector(".litm-vo-trade-summary");
  if (!summary) return;

  if (trade === -1) {
    setText(
      summary,
      localize(
        "LITMVO.Rules.Trade.CautionSummary",
        "−1 to the roll; on a success, spend original Power +1."
      )
    );
  } else if (trade === 1) {
    setText(
      summary,
      localize(
        "LITMVO.Rules.Trade.HedgeSummary",
        "+1 to the roll; on a success, spend original Power −1."
      )
    );
  } else {
    setText(
      summary,
      localize("LITMVO.Rules.Trade.NoneSummary", "No Power trade selected.")
    );
  }

  const base = box.querySelector(".litm-vo-trade-base");
  if (base) {
    base.textContent = game.i18n.format("LITMVO.Rules.Trade.BasePower", { power });
  }
}

function createTradeOption(value, label, hint) {
  const option = document.createElement("label");
  option.className = "litm-vo-trade-option";
  option.dataset.tradeOption = String(value);
  option.title = hint;

  const input = document.createElement("input");
  input.type = "radio";
  input.name = "litm-vo-trade-power";
  input.value = String(value);

  const span = document.createElement("span");
  span.textContent = label;

  option.append(input, span);
  return option;
}

function injectTradePower(app, html) {
  if (!enabled()) return;
  if (app?.id !== "dice-roll-app" || app?.rollType !== "detailed") {
    if (app?.id === "dice-roll-app") tradeState.delete(app);
    return;
  }

  const root = elementFrom(app.element) ?? elementFrom(html);
  if (!root || root.querySelector(".litm-vo-trade-power")) return;

  const powerRow = root.querySelector(".power-label")?.closest(".mt-10");
  if (!powerRow) return;

  const box = document.createElement("fieldset");
  box.className = "litm-vo-trade-power";

  const legend = document.createElement("legend");
  legend.textContent = localize("LITMVO.Rules.Trade.Title", "Trade Power");

  const base = document.createElement("div");
  base.className = "litm-vo-trade-base";

  const options = document.createElement("div");
  options.className = "litm-vo-trade-options";
  options.append(
    createTradeOption(
      -1,
      localize("LITMVO.Rules.Trade.Caution", "Throw Caution to the Wind"),
      localize("LITMVO.Rules.Trade.CautionHint", "Final Power 2 or less: −1 to the roll; on success spend original Power +1.")
    ),
    createTradeOption(
      0,
      localize("LITMVO.Rules.Trade.None", "—"),
      localize("LITMVO.Rules.Trade.NoneHint", "Do not trade Power.")
    ),
    createTradeOption(
      1,
      localize("LITMVO.Rules.Trade.Hedge", "Hedge Your Risks"),
      localize("LITMVO.Rules.Trade.HedgeHint", "Final Power 2 or more: +1 to the roll; on success spend original Power −1.")
    )
  );

  const summary = document.createElement("div");
  summary.className = "litm-vo-trade-summary";

  box.append(legend, base, options, summary);
  powerRow.before(box);

  options.addEventListener("change", event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.name !== "litm-vo-trade-power") return;
    tradeState.set(app, Number(input.value) || 0);
    refreshTradeUi(app, root);
  });

  const refresh = () => requestAnimationFrame(() => refreshTradeUi(app, root));
  root.addEventListener("input", refresh, { passive: true });
  root.addEventListener("change", refresh, { passive: true });
  root.addEventListener("click", refresh, { passive: true });

  if (!tradeState.has(app)) tradeState.set(app, 0);
  refreshTradeUi(app, root);
}

function detectMessageType(message, card) {
  const rules = message.getFlag(MODULE_ID, FLAG_KEY);
  if (rules?.type) return rules.type;
  if (message.getFlag(SYSTEM_ID, "detailedSpend")) return "detailed";

  const title = String(card.querySelector(".card-title")?.textContent ?? "").trim();
  const quickTitles = new Set([
    "Quick Roll",
    "Rolagem Rápida",
    localize("MIST_ENGINE.ROLL_TYPES.quick", "Quick Roll")
  ]);
  const detailedTitles = new Set([
    "Detailed Roll",
    "Rolagem Detalhada",
    localize("MIST_ENGINE.ROLL_TYPES.detailed", "Detailed Roll")
  ]);

  if (quickTitles.has(title)) return "quick";
  if (detailedTitles.has(title)) return "detailed";
  return null;
}

function removeBetween(heading, stop) {
  if (!heading) return;
  let node = heading.nextSibling;
  while (node && node !== stop) {
    const next = node.nextSibling;
    node.remove();
    node = next;
  }
}

function applyPushedPresentation(card, type) {
  card.classList.add("litm-vo-pushed-roll");

  if (type === "quick") {
    const block = card.querySelector(".consequence-result-positive");
    if (!block) return;

    const heading = block.querySelector(":scope > .heading") ?? block.querySelector(".heading");
    const power = block.querySelector(":scope > .power-counter") ?? block.querySelector(".power-counter");
    removeBetween(heading, power);

    const result = document.createElement("p");
    result.className = "litm-vo-push-result";
    result.textContent = localize(
      "LITMVO.Rules.Push.QuickResult",
      "Great Success: the Narrator grants an extra benefit, and you accept Consequences."
    );

    if (power) power.before(result);
    else block.append(result);
  }

  if (type === "detailed") {
    const spend = card.querySelector(".detailed-spend");
    const existing = card.querySelector(".litm-vo-push-result");
    if (existing) return;

    const result = document.createElement("p");
    result.className = "litm-vo-push-result";
    result.textContent = localize(
      "LITMVO.Rules.Push.DetailedResult",
      "Push Your Luck: +1 Power to spend on effects, and you accept Consequences."
    );

    if (spend) spend.before(result);
    else card.querySelector(".consequence-container")?.after(result);
  }
}

async function confirmPush(type) {
  const key = type === "quick"
    ? "LITMVO.Rules.Push.ConfirmQuick"
    : "LITMVO.Rules.Push.ConfirmDetailed";

  return foundry.applications.api.DialogV2.confirm({
    window: {
      title: localize("LITMVO.Rules.Push.Title", "Push Your Luck")
    },
    content: `<p>${localize(key, type === "quick"
      ? "Accept Consequences to turn this 10+ into a Great Success?"
      : "Accept Consequences to gain +1 Power to spend on this Detailed result?")}</p>`,
    yes: {
      label: localize("LITMVO.Rules.Push.Confirm", "Push Your Luck"),
      icon: "fa-solid fa-arrow-up"
    },
    no: {
      label: localize("LITMVO.Rules.Push.Cancel", "Cancel"),
      icon: "fa-solid fa-xmark"
    }
  });
}

async function applyPush(message, type) {
  if (!message || (!message.isAuthor && !game.user.isGM)) return;

  const previous = foundry.utils.deepClone(
    message.getFlag(MODULE_ID, FLAG_KEY) ?? { version: 1, type, tradePower: 0, pushed: false }
  );
  if (previous.pushed) return;

  const confirmed = await confirmPush(type);
  if (!confirmed) return;

  previous.type = type;
  previous.pushed = true;
  previous.pushedAt = Date.now();

  const update = {
    [`flags.${MODULE_ID}.${FLAG_KEY}`]: previous
  };

  if (type === "detailed" && DetailedSpend) {
    const current = message.getFlag(SYSTEM_ID, "detailedSpend");
    if (!current || Number(current.consequenceResult) !== 1) return;

    const data = foundry.utils.deepClone(current);
    data.total = Math.max(0, Number(data.total) || 0) + 1;
    data.numPowerTags = Math.max(0, Number(data.numPowerTags) || 0) + 1;

    previous.spendPower = data.total;
    update[`flags.${SYSTEM_ID}.detailedSpend`] = data;
    update.content = await DetailedSpend.renderDetailedCard(data);
  }

  await message.update(update);
}

function injectPushYourLuck(message, element) {
  if (!enabled()) return;

  const root = elementFrom(element);
  if (!root) return;

  const card = root.matches?.(".roll-card") ? root : root.querySelector(".roll-card");
  if (!card) return;

  const type = detectMessageType(message, card);
  if (type !== "quick" && type !== "detailed") return;

  const detailedData = message.getFlag(SYSTEM_ID, "detailedSpend");
  const isTenPlus = type === "detailed"
    ? Number(detailedData?.consequenceResult) === 1
    : Boolean(card.querySelector(".consequence-result-positive"));

  if (!isTenPlus) return;

  const rules = message.getFlag(MODULE_ID, FLAG_KEY) ?? {};
  if (rules.pushed) {
    applyPushedPresentation(card, type);
    return;
  }

  if (!message.isAuthor && !game.user.isGM) return;
  if (card.querySelector(".litm-vo-push-button")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "litm-vo-push-button";
  button.innerHTML = `<i class="fa-solid fa-arrow-up"></i> <span>${localize("LITMVO.Rules.Push.Button", "Push Your Luck")}</span>`;

  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    applyPush(message, type).catch(error => {
      console.error(`${MODULE_ID} | Push Your Luck failed.`, error);
      ui.notifications?.error?.(localize("LITMVO.Rules.Error", "Advanced roll rule failed. Check the console."));
    });
  });

  card.append(button);
}

function patchDiceRollApp(DiceRollApp) {
  const proto = DiceRollApp?.prototype;
  if (!proto || proto.__litmVoAdvancedRulesPatched) return;

  const originalExecute = proto.executeRoll;
  const originalRequest = proto.requestGmConfirmation;
  const originalClose = proto._onClose;

  proto.executeRoll = async function(formValues) {
    if (!enabled()) return originalExecute.call(this, formValues);

    const prepared = prepareFormValues(this, formValues);
    const meta = prepared[PREPARED] ?? {
      tradePower: 0,
      originalPower: computePowerForForm(this, formValues)
    };

    const beforeIds = new Set((game.messages?.contents ?? []).map(message => message.id));
    const actorId = this.actor?.id ?? null;
    const type = this.rollType;

    const result = await originalExecute.call(this, prepared);

    try {
      const message = findNewRollMessage(beforeIds, actorId);
      if (message) {
        await stampRollMessage(message, {
          type,
          tradePower: meta.tradePower,
          originalPower: meta.originalPower
        });
      }
    } catch (error) {
      console.error(`${MODULE_ID} | Failed to stamp advanced roll data.`, error);
    } finally {
      tradeState.delete(this);
    }

    return result;
  };

  proto.requestGmConfirmation = function(formValues) {
    if (!enabled()) return originalRequest.call(this, formValues);

    const prepared = prepareFormValues(this, formValues);
    const oldPositive = this.numModPositive;
    const oldNegative = this.numModNegative;
    const oldMight = this.mightScale;

    try {
      this.numModPositive = prepared.numModPositive;
      this.numModNegative = prepared.numModNegative;
      this.mightScale = prepared.mightScale;
      return originalRequest.call(this, prepared);
    } finally {
      this.numModPositive = oldPositive;
      this.numModNegative = oldNegative;
      this.mightScale = oldMight;
    }
  };

  proto._onClose = function(options) {
    tradeState.delete(this);
    return originalClose.call(this, options);
  };

  Object.defineProperty(proto, "__litmVoAdvancedRulesPatched", {
    value: true,
    configurable: false,
    enumerable: false
  });
}

export async function setupAdvancedRollRules() {
  if (installed || game.system.id !== SYSTEM_ID) return;

  try {
    const [{ DiceRollApp }, detailedSpend] = await Promise.all([
      import("/systems/mist-engine-fvtt/module/apps/dice-roll-app.mjs"),
      import("/systems/mist-engine-fvtt/module/lib/detailed-spend.mjs")
    ]);

    DetailedSpend = detailedSpend;
    patchDiceRollApp(DiceRollApp);

    Hooks.on("renderApplicationV2", (app, html) => {
      try {
        injectTradePower(app, html);
      } catch (error) {
        console.error(`${MODULE_ID} | Failed to render Trade Power controls.`, error);
      }
    });

    Hooks.on("renderChatMessageHTML", (message, element) => {
      try {
        injectPushYourLuck(message, element);
      } catch (error) {
        console.error(`${MODULE_ID} | Failed to render Push Your Luck.`, error);
      }
    });

    installed = true;
    console.log(`${MODULE_ID} | Advanced roll rules (p.158) enabled.`);
  } catch (error) {
    console.error(`${MODULE_ID} | Could not initialize advanced roll rules.`, error);
  }
}
