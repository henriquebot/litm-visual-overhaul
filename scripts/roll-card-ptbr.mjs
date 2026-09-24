const SYSTEM_ID = "mist-engine-fvtt";

const PT_BR = {
  titles: {
    quick: "Rolagem Rápida",
    detailed: "Rolagem Detalhada",
    reaction: "Rolagem de Reação",
    sacrifice: "Sacrifício",
    group: "Agindo em Conjunto"
  },

  labels: {
    positive: "Positivas",
    negative: "Negativas",
    power: "Poder",
    groupPower: "Poder do Grupo",
    critical: "Rolagem Crítica — Dois Seis",
    fumble: "Falha Crítica — Dois Uns",
    inverted: "invertido",
    invertedHint: "Invertida nesta rolagem (decisão do Narrador)"
  },

  results: {
    quick: {
      negative:
        "<p>O Narrador decide um desenvolvimento narrativo prejudicial ao Herói e pode conceder ou remover uma tag ou status de modo a dificultar o Herói.</p>",
      neutral:
        "<p>A ação se desenrola como esperado, ou melhor, alcançando seu objetivo ou superando um obstáculo. O Narrador também pode conceder a você uma tag ou status útil.</p><p>O Narrador decide um desenvolvimento narrativo prejudicial ao Herói e pode conceder ou remover uma tag ou status de modo a dificultar o Herói.</p>",
      positive:
        "<p>A ação se desenrola como esperado, ou melhor, alcançando seu objetivo ou superando um obstáculo. O Narrador também pode conceder a você uma tag ou status útil.</p>"
    },

    detailed: {
      negative:
        "<p>O Narrador decide um desenvolvimento narrativo prejudicial ao Herói e pode conceder ou remover uma tag ou status de modo a dificultar o Herói.</p>",
      neutral:
        "<p><strong>Sucesso</strong> (como em 10+) e <strong>Consequências</strong> como em uma Ação Simples.</p><p>A ação se desenrola como esperado, ou melhor, alcançando seu objetivo ou superando um obstáculo. O Narrador também pode conceder a você uma tag ou status útil.</p><p>O Narrador decide um desenvolvimento narrativo prejudicial ao Herói e pode conceder ou remover uma tag ou status de modo a dificultar o Herói.</p><p><strong>Gaste seu Poder:</strong></p><ul><li>Adicione ou arranhe uma tag (2 de Poder)</li><li>Adicione ou reduza um status (1 de Poder por nível)</li><li>Descubra um detalhe valioso (1 de Poder)</li></ul><p>Veja opções avançadas na página 154.</p>",
      positive:
        "<p><strong>Gaste seu Poder:</strong></p><ul><li>Adicione ou arranhe uma tag (2 de Poder)</li><li>Adicione ou reduza um status (1 de Poder por nível)</li><li>Descubra um detalhe valioso (1 de Poder)</li></ul><p>Veja opções avançadas na página 154.</p><p><strong>Sem Consequências.</strong></p>"
    },

    reaction: {
      negative: "<p>Sofra as Consequências como estão.</p>",
      neutral: "<p>Você tem sucesso e pode gastar PWR de Poder apenas para reduzir as Consequências.</p>",
      positive: "<p>Você tem sucesso e pode gastar PWR+1 de Poder em qualquer Efeito.</p>"
    }
  },

  sacrifice: {
    miracle: "Milagre",
    miracleText: "Você tem sucesso e seu Sacrifício é reduzido em um nível.",
    fate: "Destino",
    fateText: "Você tem sucesso, mas sofre por completo as Consequências do seu Sacrifício.",
    inVain: "Em Vão",
    inVainText: "Você sofre por completo as Consequências do seu Sacrifício, mas nada resulta disso — ou as coisas dão terrivelmente errado.",
    levels: {
      Negligible: "Insignificante",
      Painful: "Doloroso",
      Scarring: "Marcante",
      Grave: "Grave"
    }
  },

  group: {
    affectsAll: "O resultado afeta todo o grupo."
  },

  detailedSpend: {
    title: "Gaste Poder em Efeitos:",
    undo: "Desfazer",
    options: {
      tag: "Adicionar / arranhar / recuperar uma tag",
      status: "Conceder / reduzir um status (por nível)",
      discover: "Descobrir um detalhe valioso",
      feat: "Feito extra",
      singleUse: "Tag de uso único (último Poder)"
    }
  }
};

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function localized(key, fallback = "") {
  try {
    const value = game.i18n.localize(key);
    return value && value !== key ? value : fallback;
  } catch {
    return fallback;
  }
}

function detectType(message, card) {
  if (message?.getFlag?.(SYSTEM_ID, "detailedSpend")) return "detailed";
  if (card.querySelector(".group-result-tags")) return "group";

  const title = normalize(card.querySelector(".card-title")?.textContent);
  const quick = normalize(localized("MIST_ENGINE.ROLL_TYPES.quick", "Quick Roll"));
  const detailed = normalize(localized("MIST_ENGINE.ROLL_TYPES.detailed", "Detailed Roll"));
  const reaction = normalize(localized("MIST_ENGINE.ROLL_TYPES.reaction", "Reaction Roll"));
  const sacrifice = normalize(localized("MIST_ENGINE.SACRIFICE.Title", "Sacrifice"));
  const group = normalize(localized("MIST_ENGINE.COLLAB.GroupTitle", "Acting Together"));

  if ([quick, "Quick Roll", PT_BR.titles.quick].includes(title)) return "quick";
  if ([detailed, "Detailed Roll", PT_BR.titles.detailed].includes(title)) return "detailed";
  if ([reaction, "Reaction Roll", PT_BR.titles.reaction].includes(title)) return "reaction";
  if ([group, "Acting Together", PT_BR.titles.group].includes(title)) return "group";
  if (
    title.startsWith(sacrifice) ||
    title.startsWith("Sacrifice") ||
    title.startsWith(PT_BR.titles.sacrifice)
  ) return "sacrifice";

  return null;
}

function translateSelectedTagLabels(card) {
  const groups = card.querySelectorAll(".selected-tags");
  groups.forEach((group, index) => {
    const label = group.querySelector(".resource-label");
    if (!label) return;
    label.textContent = index === 0
      ? `${PT_BR.labels.positive}:`
      : `${PT_BR.labels.negative}:`;
  });

  card.querySelectorAll(".selected-tags .tag em").forEach(em => {
    const text = normalize(em.textContent).replace(/^\(|\)$/g, "");
    const source = normalize(localized("MIST_ENGINE.ROLL.InvertedChallengeSuffix", "inverted"));
    if (text === source || text === PT_BR.labels.inverted) {
      em.textContent = `(${PT_BR.labels.inverted})`;
    }
  });

  card.querySelectorAll(".selected-tags .tag[title]").forEach(tag => {
    const source = normalize(localized("MIST_ENGINE.ROLL.InvertedTagHint", "Inverted for this roll (Narrator's call)"));
    if (normalize(tag.title) === source) tag.title = PT_BR.labels.invertedHint;
  });
}

function translateCriticalFumble(card) {
  const critical = card.querySelector(".critical-roll");
  if (critical) critical.textContent = PT_BR.labels.critical;

  const fumble = card.querySelector(".fumble-roll");
  if (fumble) fumble.textContent = PT_BR.labels.fumble;
}

function replaceConsequenceCopy(block, html) {
  if (!block || !html) return;

  const heading = block.querySelector(":scope > .heading") ?? block.querySelector(".heading");
  const power = block.querySelector(":scope > .power-counter") ?? block.querySelector(".power-counter");
  if (!heading) return;

  let node = heading.nextSibling;
  while (node && node !== power) {
    const next = node.nextSibling;
    node.remove();
    node = next;
  }

  const template = document.createElement("template");
  template.innerHTML = html;

  if (power) power.before(template.content);
  else block.append(template.content);
}

function resultKey(block) {
  if (block.classList.contains("consequence-result-negative")) return "negative";
  if (block.classList.contains("consequence-result-neutral")) return "neutral";
  if (block.classList.contains("consequence-result-positive")) return "positive";
  return null;
}

function translatePowerCounter(counter, label = PT_BR.labels.power) {
  if (!counter) return;
  const text = normalize(counter.textContent);
  const colon = text.indexOf(":");
  const value = colon >= 0 ? text.slice(colon + 1).trim() : text.match(/-?\d+(?:\.\d+)?$/)?.[0];
  counter.textContent = value ? `${label}: ${value}` : label;
}

function translateStandardResult(card, type) {
  const table = PT_BR.results[type];
  if (!table) return;

  card.querySelectorAll(".consequence-container > div").forEach(block => {
    const key = resultKey(block);
    if (!key) return;
    replaceConsequenceCopy(block, table[key]);
    translatePowerCounter(block.querySelector(".power-counter"));
  });
}

function translateDetailedEntry(entry) {
  if (!entry) return "";
  if (entry.type === "status") {
    const tier = Number(entry.tier ?? entry.cost ?? 1);
    return `Status — ${tier} ${tier === 1 ? "nível" : "níveis"}`;
  }

  return PT_BR.detailedSpend.options[entry.type] ?? entry.label ?? "";
}

function replaceButtonLabel(button, label) {
  const cost = button.querySelector(".detailed-spend-cost");
  if (!cost) {
    button.textContent = label;
    return;
  }

  [...button.childNodes].forEach(node => {
    if (node !== cost) node.remove();
  });
  button.insertBefore(document.createTextNode(`${label} `), cost);
}

function replaceListEntryLabel(li, label) {
  const undo = li.querySelector(".detailed-spend-undo");
  const cost = li.querySelector(".detailed-spend-cost");
  [...li.childNodes].forEach(node => {
    if (node !== undo && node !== cost) node.remove();
  });

  const anchor = cost ?? null;
  li.insertBefore(document.createTextNode(` ${label} `), anchor);
  if (undo) undo.title = PT_BR.detailedSpend.undo;
}

function translateDetailedSpend(message, card) {
  const panel = card.querySelector(".detailed-spend");
  if (!panel) return;

  const header = panel.querySelector(".detailed-spend-header span:first-child");
  if (header) header.textContent = PT_BR.detailedSpend.title;

  panel.querySelectorAll("[data-spend-option]").forEach(button => {
    const label = PT_BR.detailedSpend.options[button.dataset.spendOption];
    if (label) replaceButtonLabel(button, label);
  });

  const data = message?.getFlag?.(SYSTEM_ID, "detailedSpend");
  const entries = data?.entries ?? [];
  panel.querySelectorAll(".detailed-spend-list li").forEach((li, index) => {
    replaceListEntryLabel(li, translateDetailedEntry(entries[index]));
  });
}

function translateLevelText(text) {
  let output = String(text ?? "");
  for (const [from, to] of Object.entries(PT_BR.sacrifice.levels)) {
    output = output.replaceAll(from, to);
  }
  return output;
}

function setHeadingLabel(heading, text) {
  if (!heading) return;
  const icon = heading.querySelector("i");
  const prefix = normalize(heading.textContent).match(/^(10\+|7-9|6-)/)?.[1] ?? "";
  heading.textContent = "";
  if (icon) heading.append(icon);
  heading.append(document.createTextNode(`${prefix}${prefix ? " " : ""}${text}`));
}

function translateSacrifice(card) {
  const title = card.querySelector(".card-title");
  if (title) {
    const raw = normalize(title.textContent);
    const level = raw.includes("—") ? raw.split("—").slice(1).join("—").trim() : "";
    title.textContent = level
      ? `${PT_BR.titles.sacrifice} — ${translateLevelText(level)}`
      : PT_BR.titles.sacrifice;
  }

  const positive = card.querySelector(".consequence-result-positive");
  if (positive) {
    setHeadingLabel(positive.querySelector(".heading"), PT_BR.sacrifice.miracle);
    const paragraphs = positive.querySelectorAll(":scope > p");
    if (paragraphs[0]) paragraphs[0].textContent = PT_BR.sacrifice.miracleText;
    const em = positive.querySelector("em");
    if (em) em.textContent = translateLevelText(em.textContent);
  }

  const neutral = card.querySelector(".consequence-result-neutral");
  if (neutral) {
    setHeadingLabel(neutral.querySelector(".heading"), PT_BR.sacrifice.fate);
    const paragraph = neutral.querySelector(":scope > p");
    if (paragraph) paragraph.textContent = PT_BR.sacrifice.fateText;
  }

  const negative = card.querySelector(".consequence-result-negative");
  if (negative) {
    setHeadingLabel(negative.querySelector(".heading"), PT_BR.sacrifice.inVain);
    const paragraph = negative.querySelector(":scope > p");
    if (paragraph) paragraph.textContent = PT_BR.sacrifice.inVainText;
  }
}

function translateGroup(card) {
  const title = card.querySelector(".card-title");
  if (title) title.textContent = PT_BR.titles.group;

  card.querySelectorAll(".power-counter").forEach(counter => {
    translatePowerCounter(counter, PT_BR.labels.groupPower);
  });

  const affects = card.querySelector(".group-affects-all em") ?? card.querySelector(".group-affects-all");
  if (affects) affects.textContent = PT_BR.group.affectsAll;
}

function translateTitle(card, type) {
  if (type === "sacrifice" || type === "group") return;
  const title = card.querySelector(".card-title");
  if (title && PT_BR.titles[type]) title.textContent = PT_BR.titles[type];
}

export function translateRollCardMessage(message, element) {
  const root = element instanceof HTMLElement ? element : element?.[0];
  if (!root) return false;

  const cards = root.matches?.(".roll-card")
    ? [root]
    : [...root.querySelectorAll(".roll-card")];

  let changed = false;

  for (const card of cards) {
    const type = detectType(message, card);
    if (!type) continue;

    translateTitle(card, type);
    translateSelectedTagLabels(card);
    translateCriticalFumble(card);

    if (type === "quick" || type === "detailed" || type === "reaction") {
      translateStandardResult(card, type);
    }

    if (type === "detailed") translateDetailedSpend(message, card);
    if (type === "sacrifice") translateSacrifice(card);
    if (type === "group") {
      translateStandardResult(card, "detailed");
      translateGroup(card);
    }

    card.dataset.litmVoTranslation = "pt-BR";
    changed = true;
  }

  return changed;
}
