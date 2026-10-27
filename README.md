# SortRight — Which bin does it *actually* go in?

**Track:** Arbiter Hacks V1 · Theme Track — *Rethinking Waste*
**Deadline:** Sunday, December 20, 2026, 9:00 PM PT (event end, Dec 21 12:00 AM EST — no separate submission time is stated on the Devpost overview or rules; rechecked firsthand Oct 26, 2026)

A recyclable-or-not sorter that asks the follow-up question every other sorting tool skips:
**greasy? broken? still full?** — because that's what changes the answer.

## The problem

Contamination is recycling's silent killer. When non-recyclables ("wishcycled" items people
*hope* are recyclable — greasy pizza boxes, plastic bags, coffee cups, batteries) get into the
curbside stream, sorting plants reject whole loads. US recycling contamination averages roughly
1 in 4 items by many municipal estimates, and a single lithium battery can start a fire in a
collection truck. The failure mode isn't ignorance of materials — most people know a pizza box is
cardboard. The failure is **conditions**: the same box is recyclable clean, compostable greasy,
and a contaminant in the wrong stream. Lookup tools that answer by material alone teach the
wrong verdict for exactly the items people get wrong most.

## What SortRight does

- **Search any household item** (41-item curated database with aliases — try "pizza box",
  "batteries", "amazon box", "banana peel") and get a verdict across five streams:
  ♻️ Curbside Recycling · 🌱 Compost / Organics · 🗑️ Landfill · ⚠️ Special Drop-off · 🔁 Reuse / Donate.
- **The condition layer (the differentiator):** many items ask a follow-up —
  *"Is it broken?"* (glass jar: recycle → landfill), *"Is it greasy?"* (cardboard box:
  recycle → compost; aluminum foil: recycle → landfill), *"Does it still spray?"*
  (aerosol can: recycle → hazardous drop-off). Changing the answer re-computes the verdict
  live, with an explanation of *why it moved*.
- **The why, every time:** each verdict explains the reasoning and names the specific
  wishcycle trap for that item — no black-box labels.
- **Resin-code lookup:** tap #1–#7 for what the triangle on the bottom actually means
  (including why #3/#6/#7 are landfill despite the ♻ symbol).
- **Material fallback:** item not in the database? Pick what it's made of (+ soiled/broken
  toggles) and the same rule engine answers — nothing dead-ends.
- **Session impact tally:** items sorted, items kept out of landfill, and "wishcycles
  caught" (verdicts a condition flipped) — the user's personal contamination score.
- **Shareable deep links:** `/?item=pizza+box` opens straight on a verdict — built for
  fridge-door QR codes and apartment-bin signage.
- **Browse grid** of the full database, so the tool teaches even without a search.

## How it works

- `src/classifier.js` — the entire sorting brain as one dependency-free module
  (UMD: runs in the browser *and* in Node, so the shipped UI and the test suite exercise
  the exact same logic). Data model: baseline bin per item + condition rules that can
  move the verdict, each carrying its own explanation note.
- `public/` — the web UI (search with live suggestions, verdict card, resin row,
  material fallback, session stats, browse grid). No build step, no framework.
- `server.js` — a 30-line zero-dependency Node static server.
- `test/smoke.test.js` — Node's built-in test runner; asserts headline verdicts,
  every condition flip, all seven resin codes, fallback heuristics, and search aliases.

## Run it

```bash
npm start          # → http://localhost:4317  (PORT env overrides)
# or: node server.js
```

No install step — zero dependencies. Node ≥ 18.

## Test it

```bash
npm test           # 6 suites, all passing
```

Verified end-to-end: server returns 200 for the page, stylesheet, UI script, and
classifier; headless-browser render confirms search, verdict cards, condition toggles,
and stats all live (see `screenshots/`).

## Rules basis

Verdicts reflect common US curbside program rules (EPA guidance patterns + typical
municipal rules: no film plastic curbside, no tanglers, empty-and-dry containers,
batteries/e-waste/paint/oil to HHW, food-soiled paper to compost). Local programs vary;
the UI says so and judges should read verdicts as "mainstream US curbside," which is
exactly the deployment target for signage/QR use.

## What's next

- City-profile switcher (load a municipality's actual accepted list — SF, NYC, Austin…).
- Photo mode: on-device image classification feeding the same condition engine.
- Printable bin-side cheat sheets generated from the database (the QR deep-link target).

## License

MIT — see `LICENSE`.

## Build Disclosure

Build Disclosure: AI-built. Built by AI agents (Tree / Muse fleet) directed by Rene Turcios during the hackathon period; Rene set the direction and reviewed; agents designed, coded, and tested.
