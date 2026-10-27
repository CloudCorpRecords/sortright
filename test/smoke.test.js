"use strict";
/* Smoke tests for the exact classifier the UI ships.
 * Run: npm test
 */
const test = require("node:test");
const assert = require("node:assert");
const SR = require("../src/classifier.js");

const byName = (n) => {
  const hits = SR.searchItems(n, 1);
  assert.ok(hits.length, `no item found for query "${n}"`);
  return hits[0];
};
const binOf = (n, conds = {}) => SR.classifyItem(byName(n), conds).bin;

test("database is substantial and every item is well-formed", () => {
  assert.ok(SR.ITEMS.length >= 30, `expected >=30 items, got ${SR.ITEMS.length}`);
  for (const item of SR.ITEMS) {
    assert.ok(item.name && item.material && item.reason.length > 30, `malformed item: ${item.name}`);
    assert.ok(SR.BINS[item.bin], `unknown bin ${item.bin} on ${item.name}`);
    for (const c of item.conditions || []) assert.ok(SR.BINS[c.yesBin], `bad condition bin on ${item.name}`);
  }
});

test("headline verdicts", () => {
  assert.strictEqual(binOf("plastic water bottle"), "recycle");
  assert.strictEqual(binOf("aluminum can"), "recycle");
  assert.strictEqual(binOf("pizza box"), "compost");
  assert.strictEqual(binOf("food scraps"), "compost");
  assert.strictEqual(binOf("plastic bag"), "special");       // store drop-off, NOT curbside
  assert.strictEqual(binOf("batteries"), "special");
  assert.strictEqual(binOf("old phone"), "special");
  assert.strictEqual(binOf("coffee cup"), "landfill");        // lined cup — the famous trap
  assert.strictEqual(binOf("styrofoam"), "landfill");
  assert.strictEqual(binOf("chip bag"), "landfill");
  assert.strictEqual(binOf("clothing"), "reuse");
});

test("conditions flip verdicts (the anti-wishcycling layer)", () => {
  assert.strictEqual(binOf("glass jar"), "recycle");
  assert.strictEqual(binOf("glass jar", { broken: true }), "landfill");
  assert.strictEqual(binOf("cardboard box"), "recycle");
  assert.strictEqual(binOf("cardboard box", { soiled: true }), "compost");
  assert.strictEqual(binOf("aluminum foil"), "recycle");
  assert.strictEqual(binOf("aluminum foil", { soiled: true }), "landfill");
  assert.strictEqual(binOf("aerosol can"), "recycle");
  assert.strictEqual(binOf("aerosol can", { full: true }), "special");
  assert.strictEqual(binOf("plastic bag", { soiled: true }), "landfill");
  assert.strictEqual(binOf("ceramic mug"), "reuse");
  assert.strictEqual(binOf("ceramic mug", { broken: true }), "landfill");
  const v = SR.classifyItem(byName("glass jar"), { broken: true });
  assert.strictEqual(v.changed, true);
  assert.ok(v.notes.length >= 1, "flipped verdict must carry an explanation note");
});

test("resin codes 1-7 all resolve with correct bins", () => {
  assert.strictEqual(SR.classifyResin(1).bin, "recycle");
  assert.strictEqual(SR.classifyResin(2).bin, "recycle");
  assert.strictEqual(SR.classifyResin(3).bin, "landfill");
  assert.strictEqual(SR.classifyResin(4).bin, "special");
  assert.strictEqual(SR.classifyResin(5).bin, "recycle");
  assert.strictEqual(SR.classifyResin(6).bin, "landfill");
  assert.strictEqual(SR.classifyResin(7).bin, "landfill");
  assert.strictEqual(SR.classifyResin(9), null);
});

test("material fallback heuristics", () => {
  assert.strictEqual(SR.classifyMaterial("rigid-plastic", {}).bin, "recycle");
  assert.strictEqual(SR.classifyMaterial("rigid-plastic", { soiled: true }).bin, "landfill");
  assert.strictEqual(SR.classifyMaterial("plastic-film", {}).bin, "special");
  assert.strictEqual(SR.classifyMaterial("plastic-film", { soiled: true }).bin, "landfill");
  assert.strictEqual(SR.classifyMaterial("glass", { broken: true }).bin, "landfill");
  assert.strictEqual(SR.classifyMaterial("electronic", {}).bin, "special");
  assert.strictEqual(SR.classifyMaterial("food", {}).bin, "compost");
  assert.strictEqual(SR.classifyMaterial("nonsense", {}), null);
});

test("search finds items by alias and partial words", () => {
  assert.strictEqual(byName("pet bottle").name, "Plastic water bottle");
  assert.strictEqual(byName("amazon box").name, "Cardboard box");
  assert.strictEqual(byName("banana peel").name, "Food scraps");
  assert.ok(SR.searchItems("", 5).length === 0);
});
