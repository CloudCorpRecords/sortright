# Devpost Submission Copy — Arbiter Hacks V1 (Theme Track: Rethinking Waste)

**Project name:** SortRight
**Track:** Theme Track — Rethinking Waste (one track only, per rules)
**Tagline:** Which bin does it *actually* go in? The sorter that asks "greasy? broken? still full?" before it answers.

---

## Elevator pitch (short description)

SortRight is a recyclable-or-not sorter for the items people actually get wrong. Search any
household item and it returns one of five streams — curbside recycling, compost, landfill,
special drop-off, or reuse/donate — but unlike material-only lookup tools, SortRight asks the
follow-up question that changes the answer: a glass jar is recycling until it's broken, a
cardboard box is recycling until it's greasy (then it's compost), an aerosol can is recycling
until it still sprays (then it's hazardous waste). Every verdict explains why, names the
wishcycle trap, and a session tally shows how many items you kept out of landfill and how many
wishcycles you caught.

## The waste problem we targeted — and how we'd measure success (Theme Track paragraph)

The problem is contamination, not apathy: people wishcycle items they hope are recyclable —
greasy pizza boxes, plastic bags, lined coffee cups, batteries — and sorting plants reject
contaminated loads wholesale, while lithium batteries start fires in trucks and facilities.
Most mistakes happen on items whose correct bin depends on their *condition*, which is the one
thing existing lookup tools don't ask about. We'd measure SortRight by (1) verdict accuracy
against municipal accepted-lists on a fixed benchmark set of tricky items (the test suite is
the seed of that benchmark), (2) "wishcycles caught" per session — verdicts flipped by a
condition, i.e. contamination events intercepted, and (3) diversion: share of checked items
routed anywhere other than landfill. A building or campus pilot would compare bin-contamination
audits before and after posting SortRight QR deep links at the bins.

## What it does (full description)

- **Item search** across a 41-item database of the most-confused household items, with
  aliases ("amazon box", "pet bottle", "banana peel") and live suggestions.
- **Five-stream verdicts** — ♻️ Curbside Recycling, 🌱 Compost / Organics, 🗑️ Landfill,
  ⚠️ Special Drop-off, 🔁 Reuse / Donate — each with the reasoning and the specific trap.
- **The condition layer:** follow-up toggles (greasy? broken? still full? food-soiled?
  swollen battery?) recompute the verdict live and explain why it moved. This is the core
  mechanic and the thing that maps to how contamination actually happens.
- **Resin-code lookup (#1–#7):** what the number in the triangle really means for curbside.
- **Material fallback:** unknown items are answered by material + condition heuristics —
  the same rules the database uses — so the tool never dead-ends.
- **Session impact tally:** items sorted / kept out of landfill / wishcycles caught.
- **Deep links** (`/?item=pizza+box`) designed for QR codes on real bins.

## How we built it

- One dependency-free classifier module (`src/classifier.js`, UMD) holds the whole rule
  engine: baseline bin per item + condition rules with explanation notes. It runs identically
  in the browser and in Node, so the test suite tests the exact code judges use.
- Vanilla HTML/CSS/JS front end (`public/`) — no framework, no build step — served by a
  30-line zero-dependency Node server (`server.js`).
- Tests use Node's built-in runner: headline verdicts, every condition flip, all seven resin
  codes, fallback heuristics, and search aliases (6 suites, all passing). The app was also
  smoke-tested live over HTTP and in a headless browser (screenshots in the repo).

## Challenges

The interesting design problem was honesty: US curbside rules vary by city, so SortRight
encodes mainstream US rules, says so in the UI, and always gives the *reason* — a user whose
city differs can override the label and still keep the logic. The second problem was modeling:
a flat item→bin table can't express "recycle unless greasy," so the data model treats
conditions as first-class rules that move verdicts.

## What we'd do next

City-profile switcher with real municipal accepted-lists; on-device photo classification
feeding the same condition engine; printable bin-side cheat sheets generated from the
database, targeted by the QR deep links.

## Built with

Node.js · vanilla JavaScript / HTML / CSS · Node built-in test runner · zero runtime dependencies

## Links / media to attach at submission

- Public repo: https://github.com/CloudCorpRecords/sortright
- Demo video (2–3 min, YouTube/Vimeo): *(parent to add — script in DEMO.md)*
- Screenshots: `screenshots/home.png`, `screenshots/verdict-pizza-box.png`, `screenshots/verdict-plastic-bag.png`

## Build Disclosure

Build Disclosure: AI-built. Built by AI agents (Tree / Muse fleet) directed by Rene Turcios during the hackathon period; Rene set the direction and reviewed; agents designed, coded, and tested.
