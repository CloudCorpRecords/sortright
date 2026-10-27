# Demo Video Script — SortRight (target 2:30, max 3:00)

**Format:** screen recording of the live app at http://localhost:4317 (start it with `npm start`).
Voiceover or captions throughout. No face cam needed.

---

**[0:00–0:20] The hook**
*Screen: a kitchen counter / the app home page.*
> "Quick test. Pizza box — recycling, right? It's cardboard. Wrong. Grease kills paper
> recycling, and that one wrong item can get a whole load sent to landfill. Most sorting
> mistakes aren't about the material — they're about the *condition*. So we built SortRight."

**[0:20–0:45] The classic trap**
*Screen: type "pizza box", show the verdict card.*
> "Search any item. Pizza box: **Compost**. Not because cardboard is compostable — because
> grease destroys paper recycling but compost microbes love it. And if the lid is clean,
> SortRight tells you to tear it off and recycle just that part. Every verdict explains
> itself like this — no black box."

**[0:45–1:25] The condition layer (the core mechanic)**
*Screen: search "glass jar" → Recycling. Tick "Is it broken?" → verdict flips to Landfill with the warning note. Then "aerosol can" → tick "still contains product" → Special Drop-off.*
> "Here's the part no other sorter does. A glass jar is recycling — until it's broken. Then
> it's a hazard to the people sorting, and the verdict changes, live, with the reason.
> Same with this aerosol can: empty, it's recyclable steel; still spraying, it's hazardous
> waste. SortRight asks the follow-up question *before* you toss, not after the load is
> rejected."

**[1:25–1:50] The greatest hits of wishcycling**
*Screen: quick-fire — "plastic bag" (Special Drop-off, tangler warning), "coffee cup" (Landfill, plastic lining), "batteries" (Special, fire risk). Tap resin #6.*
> "Plastic bags jam the machines — store drop-off, never curbside. Coffee cups have a
> plastic lining — landfill, despite being 'paper'. Batteries start fires in trucks —
> drop-off, always. And the number in the triangle? Number 6 means landfill, symbol or not.
> SortRight has a plain-English answer for all seven codes."

**[1:50–2:15] Nothing dead-ends + impact**
*Screen: material fallback — pick "Plastic film", tick soiled → flips to Landfill. Pan to session stats.*
> "Item not in the database? Pick what it's made of and the same rule engine answers.
> And up top, your session keeps score: items sorted, items kept out of landfill, and
> wishcycles caught — the mistakes you *didn't* make."

**[2:15–2:30] Close**
*Screen: browse grid scrolling; end on the home page / a bin with a printed QR (optional prop).*
> "SortRight runs on zero dependencies, works from a QR code on the bin itself —
> `?item=pizza+box` goes straight to the verdict — and the whole database is open source
> under MIT. The right bin isn't trivia. It's the difference between recycling that works
> and recycling that gets landfilled. SortRight. Built for Arbiter Hacks, Rethinking Waste."

---

**Recording checklist**
- [ ] Server running (`npm start`), browser at 1200px wide, zoom 110%
- [ ] Rehearse the three searches so typing looks confident (or use the quick chips)
- [ ] Captions on (auto-caption in YouTube is fine after a proofread pass)
- [ ] Total runtime ≤ 3:00 — the rules cap it; 2:30 is the target
- [ ] Upload public or unlisted to YouTube/Vimeo; link goes in the Devpost form
