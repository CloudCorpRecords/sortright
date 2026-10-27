"use strict";
/* SortRight UI — all verdicts come from src/classifier.js (window.SortRight). */
const SR = window.SortRight;
const $ = (id) => document.getElementById(id);

const session = { total: 0, diverted: 0, saved: 0, counted: new Set() };

function pill(bin) {
  const m = SR.BINS[bin];
  return `<span class="pill" style="background:${m.color}">${m.icon} ${m.label}</span>`;
}

function updateStats(itemName, verdict) {
  if (!session.counted.has(itemName + "|" + verdict.bin)) {
    session.counted.add(itemName + "|" + verdict.bin);
    session.total += 1;
    if (verdict.bin !== "landfill") session.diverted += 1;
    if (verdict.changed) session.saved += 1;
  }
  $("stTotal").textContent = session.total;
  $("stDiverted").textContent = session.diverted;
  $("stSaved").textContent = session.saved;
}

let currentItem = null;

function renderResult(item, activeConds) {
  currentItem = item;
  const v = SR.classifyItem(item, activeConds);
  const el = $("result");
  el.hidden = false;
  const condHtml = (item.conditions && item.conditions.length)
    ? `<div class="conds"><p>Before you toss it — does any of this apply?</p>${item.conditions.map((c) =>
        `<label class="cond"><input type="checkbox" data-cond="${c.key}" ${activeConds[c.key] ? "checked" : ""}> ${c.prompt}</label>`).join("")}</div>`
    : "";
  el.innerHTML = `
    <div class="verdict" style="background:${v.binMeta.color}">
      <div class="itemname">${item.name} · ${item.material}</div>
      <div class="binlabel">${v.binMeta.icon} ${v.binMeta.label}</div>
      ${v.changed ? `<div>⚡ A condition you selected changed this verdict from the item's usual bin.</div>` : ""}
    </div>
    <div class="body">
      <p class="reason">${v.reason}</p>
      ${v.notes.map((n) => `<div class="note">⚠️ ${n}</div>`).join("")}
      ${condHtml}
      ${v.tip ? `<div class="tip">💡 ${v.tip}</div>` : ""}
    </div>`;
  el.querySelectorAll("[data-cond]").forEach((cb) => {
    cb.addEventListener("change", () => {
      const next = { ...activeConds };
      next[cb.dataset.cond] = cb.checked;
      renderResult(item, next);
    });
  });
  updateStats(item.name, v);
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function selectItem(item) {
  $("q").value = item.name;
  $("suggest").hidden = true;
  renderResult(item, {});
}

// Search + suggestions
$("q").addEventListener("input", () => {
  const q = $("q").value;
  const hits = SR.searchItems(q, 6);
  const box = $("suggest");
  if (!hits.length) { box.hidden = true; return; }
  box.innerHTML = hits.map((h, i) =>
    `<button data-i="${i}"><span>${h.name}</span><span class="mat">${h.material}</span></button>`).join("");
  box.hidden = false;
  box.querySelectorAll("button").forEach((b) =>
    b.addEventListener("click", () => selectItem(hits[Number(b.dataset.i)])));
});
$("q").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const hits = SR.searchItems($("q").value, 1);
    if (hits.length) selectItem(hits[0]);
  }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".searchbox")) $("suggest").hidden = true;
});

// Quick chips (deliberately the tricky ones)
["Pizza box", "Plastic bag", "Batteries", "Coffee cup", "Glass jar", "Aluminum foil"].forEach((name) => {
  const found = SR.searchItems(name, 1)[0];
  if (!found) return;
  const b = document.createElement("button");
  b.className = "chip"; b.textContent = found.name;
  b.addEventListener("click", () => selectItem(found));
  $("quickChips").appendChild(b);
});

// Resin codes
for (let code = 1; code <= 7; code++) {
  const b = document.createElement("button");
  b.className = "resinbtn"; b.textContent = "#" + code;
  b.addEventListener("click", () => {
    const r = SR.classifyResin(code);
    $("resinOut").innerHTML = `${pill(r.bin)} &nbsp;<strong>#${r.code} ${r.name}:</strong> ${r.note}`;
  });
  $("resinRow").appendChild(b);
}

// Material fallback
const MATERIALS = [
  ["rigid-plastic", "Rigid plastic"], ["plastic-film", "Plastic film / bag"], ["glass", "Glass"],
  ["metal", "Metal"], ["paper", "Paper / cardboard"], ["food", "Food / organics"],
  ["wood", "Wood / cork"], ["textile", "Textile"], ["electronic", "Has battery / plug / circuit"],
  ["chemical", "Chemical / paint / oil"],
];
let activeMat = null;
function renderMat() {
  if (!activeMat) return;
  const out = SR.classifyMaterial(activeMat, { soiled: $("matSoiled").checked, broken: $("matBroken").checked });
  if (out) $("matOut").innerHTML = `${pill(out.bin)} &nbsp;${out.why}`;
}
MATERIALS.forEach(([key, label]) => {
  const b = document.createElement("button");
  b.className = "matbtn"; b.textContent = label;
  b.addEventListener("click", () => {
    activeMat = key;
    document.querySelectorAll(".matbtn").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    renderMat();
  });
  $("matGrid").appendChild(b);
});
$("matSoiled").addEventListener("change", renderMat);
$("matBroken").addEventListener("change", renderMat);

// Shareable deep link: ?item=pizza+box opens straight on that verdict
const deep = new URLSearchParams(location.search).get("item");
if (deep) {
  const hit = SR.searchItems(deep, 1)[0];
  if (hit) selectItem(hit);
}

// Browse grid
$("dbCount").textContent = SR.ITEMS.length;
$("browse").innerHTML = SR.ITEMS.map((item, i) =>
  `<div class="card" data-i="${i}"><div class="nm"><span class="dot" style="background:${SR.BINS[item.bin].color}"></span>${item.name}</div>
   <div>${pill(item.bin)}</div><div class="mt">${item.material}</div></div>`).join("");
$("browse").querySelectorAll(".card").forEach((c) =>
  c.addEventListener("click", () => selectItem(SR.ITEMS[Number(c.dataset.i)])));
