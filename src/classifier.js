/*
 * SortRight classifier — the sorting brain.
 * Works in the browser (window.SortRight) and in Node (module.exports)
 * so the exact logic the UI shows is the logic the tests exercise.
 *
 * Model: every item has a baseline bin. Real-world conditions
 * (greasy, broken, still full, food-soiled...) can MOVE the verdict —
 * that conditional layer is what stops "wishcycling", the contamination
 * that sends whole recycling loads to landfill.
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.SortRight = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const BINS = {
    recycle: { label: "Curbside Recycling", icon: "♻️", color: "#1d6fd1", short: "Recycle" },
    compost: { label: "Compost / Organics", icon: "🌱", color: "#2e8b3a", short: "Compost" },
    landfill: { label: "Landfill Trash", icon: "🗑️", color: "#5b6470", short: "Landfill" },
    special: { label: "Special Drop-off", icon: "⚠️", color: "#d97706", short: "Drop-off" },
    reuse: { label: "Reuse / Donate", icon: "🔁", color: "#7c3aed", short: "Reuse" },
  };

  // condition helper
  const Q = (key, prompt, yesBin, yesNote) => ({ key, prompt, yesBin, yesNote });

  const ITEMS = [
    // ---- Plastics ----
    { name: "Plastic water bottle", aliases: ["pet bottle", "water bottle", "soda bottle", "plastic bottle", "#1"], material: "Rigid plastic (#1 PET)", bin: "recycle",
      reason: "PET #1 is the most widely accepted curbside plastic. Empty it, keep the cap on (modern facilities sort caps), and never bag it.",
      tip: "Wishcycle trap: bottles go in LOOSE, never inside a plastic bag.",
      conditions: [Q("crushed", "Is it a bottle from a deposit state with the label intact?", "recycle", "Keep the deposit label readable — it's worth cash back at a redemption center instead.")] },
    { name: "Milk jug", aliases: ["hdpe jug", "gallon jug", "#2"], material: "Rigid plastic (#2 HDPE)", bin: "recycle",
      reason: "HDPE #2 is high-value recycling. Rinse, cap on, loose in the bin.",
      tip: "Opaque HDPE (detergent bottles) is #2 too — same verdict." },
    { name: "Detergent bottle", aliases: ["laundry bottle", "shampoo bottle"], material: "Rigid plastic (#2 HDPE)", bin: "recycle",
      reason: "HDPE #2, accepted almost everywhere. Empty completely; a quick rinse helps the sorter.", tip: "Pumps contain metal springs — remove pump tops and landfill those." },
    { name: "Yogurt tub", aliases: ["plastic tub", "sour cream tub", "#5", "pp tub"], material: "Rigid plastic (#5 PP)", bin: "recycle",
      reason: "PP #5 tubs are accepted by most curbside programs when clean. Scrape out food first — food residue is contamination.",
      tip: "Foil lids are too small to sort — landfill the lid, recycle the tub.",
      conditions: [Q("soiled", "Is there food stuck in it you can't rinse out?", "landfill", "Un-rinsable food residue contaminates the load. If it truly won't rinse, landfill beats wishcycling.")] },
    { name: "Plastic takeout container", aliases: ["clamshell", "deli container", "to go box"], material: "Rigid plastic (#1/#5)", bin: "recycle",
      reason: "Rigid clamshells (#1 or #5) are curbside-accepted in most cities when rinsed. Check the number — #6 foam is different.",
      tip: "Black plastic containers are invisible to optical sorters in many plants and often end up landfilled despite the symbol.",
      conditions: [Q("soiled", "Is it greasy with food you can't rinse off?", "landfill", "Grease-soaked plastic can't be processed cleanly. Landfill it rather than contaminate clean recycling.")] },
    { name: "Plastic grocery bag", aliases: ["plastic bag", "shopping bag", "film plastic", "bag"], material: "Plastic film", bin: "special",
      reason: "Plastic bags are the #1 tangler — they jam sorting machines and shut down lines. Never curbside. Clean, dry bags go to store drop-off bins (grocery/Target/Walmart).",
      tip: "One bag in the curbside bin can get the whole bag of recycling landfilled at the plant.",
      conditions: [Q("soiled", "Is it wet, dirty, or food-stained?", "landfill", "Store drop-off only accepts clean, dry film. Dirty film goes to landfill.")] },
    { name: "Plastic wrap / cling film", aliases: ["cling wrap", "saran wrap", "plastic film wrap"], material: "Plastic film", bin: "landfill",
      reason: "Cling film is too thin and clingy for any recycling stream, including store drop-off in most programs.",
      tip: "Switch to a lidded container or beeswax wrap and this item disappears." },
    { name: "Bubble mailer", aliases: ["amazon mailer", "padded envelope", "poly mailer"], material: "Plastic film + bubble layer", bin: "special",
      reason: "All-plastic bubble mailers go to store drop-off film bins (remove the label). Paper mailers with plastic bubble lining are mixed-material and landfill.",
      tip: "If it tears like paper, it's mixed — landfill. If it stretches like plastic, store drop-off." },
    { name: "Styrofoam / foam packaging", aliases: ["eps", "polystyrene", "#6", "foam peanuts", "foam tray"], material: "Expanded foam (#6 PS)", bin: "landfill",
      reason: "EPS foam #6 has almost no curbside market — it's 95% air and costs more to ship than it's worth. A few cities run foam drop-off densifiers; without one, it's landfill.",
      tip: "Foam peanuts can often be returned to shipping stores for reuse — better than landfill." },
    { name: "Plastic utensils", aliases: ["plastic fork", "plastic knife", "cutlery", "plastic straw", "straw"], material: "Small rigid plastic (#5/#6)", bin: "landfill",
      reason: "Utensils and straws fall through sorting screens — anything smaller than a credit card is landfill regardless of resin.",
      tip: "Size rule of thumb: smaller than a credit card = landfill, always." },
    { name: "Chip bag", aliases: ["snack bag", "candy wrapper", "foil wrapper", "granola bar wrapper"], material: "Metalized plastic film", bin: "landfill",
      reason: "Chip bags and wrappers are plastic fused with metal foil — inseparable, so unrecyclable in curbside and film streams.",
      tip: "Shiny inside = metallized = landfill. Some brands run mail-in programs (TerraCycle)." },
    { name: "Coffee cup (disposable)", aliases: ["paper cup", "takeaway cup", "starbucks cup"], material: "Paper + plastic lining", bin: "landfill",
      reason: "The plastic lining that makes the cup waterproof makes it unrecyclable in nearly every curbside program.",
      tip: "The cardboard sleeve IS recyclable, and the plastic lid usually isn't. Separate them." },
    { name: "Prescription bottle", aliases: ["pill bottle", "medicine bottle"], material: "Small rigid plastic (#5)", bin: "special",
      reason: "Pill bottles are usually too small for curbside sorters. Many pharmacies take them back, and mail-in programs recycle them. Peel the label (personal data) first.",
      tip: "Expired medicine itself goes to a drug take-back — never flush, never trash loose pills.",
      conditions: [Q("hasMeds", "Are there still pills inside?", "special", "Take the whole bottle to a pharmacy/drug take-back kiosk — meds and bottle handled together.")] },
    { name: "Toothbrush", aliases: ["plastic toothbrush"], material: "Mixed plastic + nylon", bin: "landfill",
      reason: "Mixed materials fused together can't be separated by sorters. Oral-care mail-in programs exist but curbside is landfill.",
      tip: "Bamboo-handled brushes: snap off the head (landfill), compost the handle." },
    { name: "Garden hose", aliases: ["hose"], material: "Flexible PVC / rubber", bin: "landfill",
      reason: "Hoses are classic tanglers at sorting plants and are not accepted curbside despite being 'plastic'. Cut up and landfill.",
      tip: "Tanglers (hoses, cords, bags, lights) are the top cause of plant shutdowns." },

    // ---- Glass & metal ----
    { name: "Glass jar", aliases: ["glass bottle", "jam jar", "pickle jar"], material: "Glass", bin: "recycle",
      reason: "Container glass is endlessly recyclable. Rinse, labels can stay, remove metal lids and recycle those loose if larger than a credit card.",
      tip: "Only container glass (jars/bottles) — drinking glasses and Pyrex melt at different temperatures and ruin batches.",
      conditions: [Q("broken", "Is it broken?", "landfill", "Broken loose glass endangers sorters. Box it, label 'broken glass', landfill — or check for a glass-only drop-off that accepts cullet.")] },
    { name: "Aluminum can", aliases: ["soda can", "beer can", "tin can", "steel can", "soup can"], material: "Metal (aluminum/steel)", bin: "recycle",
      reason: "Metal cans are the recycling success story — aluminum cans are routinely back on shelves in ~60 days. Empty, rinse, don't crush flat (sorters read shape).",
      tip: "Leave steel can lids attached or tucked inside so they don't become loose sharps." },
    { name: "Aluminum foil", aliases: ["tin foil", "foil tray", "pie tin"], material: "Aluminum", bin: "recycle",
      reason: "Clean foil is recyclable — rinse it and ball small pieces into one ball at least 2 inches wide so sorters can grab it.",
      tip: "Foil with baked-on food is contamination — that version is landfill.",
      conditions: [Q("soiled", "Is it covered in baked-on food or grease?", "landfill", "Food-caked foil can't be cleaned in processing. Landfill it.")] },
    { name: "Aerosol can", aliases: ["spray can", "hair spray"], material: "Steel + propellant", bin: "recycle",
      reason: "Fully empty aerosol cans are recyclable steel. Remove the plastic cap (landfill) and never puncture.",
      tip: "If it still sprays or sloshes, it's pressurized hazardous waste — see the condition.",
      conditions: [Q("full", "Does it still contain product or propellant?", "special", "Part-full aerosols are household hazardous waste. Take to an HHW facility, never the curbside bin.")] },
    { name: "Paint can", aliases: ["paint", "leftover paint"], material: "Paint (latex/oil)", bin: "special",
      reason: "Liquid paint is never curbside. Many states run PaintCare drop-offs; dried-out latex can sometimes be landfilled per local rules — check yours.",
      tip: "Mix leftover latex with kitty litter to dry it only if your city allows dried-paint landfill." },

    // ---- Paper & cardboard ----
    { name: "Cardboard box", aliases: ["shipping box", "amazon box", "corrugated cardboard"], material: "Corrugated cardboard", bin: "recycle",
      reason: "Clean, dry, flattened cardboard is prime recycling. Remove tape/plastic air pillows (pillows go to store film drop-off).",
      tip: "Wet cardboard loses fiber strength and is usually rejected at the plant.",
      conditions: [
        Q("soiled", "Is it greasy or food-soiled?", "compost", "Food-soiled cardboard can't be recycled but composts beautifully — tear it up for the organics bin."),
        Q("wet", "Is it soaked through?", "compost", "Soggy cardboard is rejected by paper mills; compost it instead if your program accepts it.")] },
    { name: "Pizza box", aliases: ["pizza cardboard"], material: "Cardboard + grease", bin: "compost",
      reason: "The classic ruling: grease destroys paper recycling, but compost microbes love it. Compost the greasy box; if the lid is genuinely clean, tear it off and recycle that part.",
      tip: "This single item is the most common recycling mistake in America." },
    { name: "Newspaper / office paper", aliases: ["paper", "junk mail", "magazine", "flyer", "envelope"], material: "Paper", bin: "recycle",
      reason: "Clean dry paper is recyclable — including junk mail and magazines. Remove plastic windows only if your city asks (most don't).",
      tip: "Shredded paper is different — fibers are too short. See the shredded condition.",
      conditions: [Q("shredded", "Has it been shredded?", "compost", "Shredded fibers fall through sorters. Compost it, or bag it for a paper drop-off that accepts shred.")] },
    { name: "Paper towel / napkin", aliases: ["tissue", "napkin", "paper towel"], material: "Paper (used)", bin: "compost",
      reason: "Used paper towels and napkins have fibers too short to recycle and carry food/organic residue — compost is their best stream.",
      tip: "Used with chemical cleaners? That flips it to landfill.",
      conditions: [Q("chemical", "Was it used with chemical cleaners or solvents?", "landfill", "Chemically contaminated paper doesn't belong in compost. Landfill it.")] },
    { name: "Egg carton (paper)", aliases: ["cardboard egg carton"], material: "Molded paper pulp", bin: "compost",
      reason: "Molded pulp is already at the end of the paper fiber chain — composting is the standard best route (many cities also accept it curbside; compost never hurts).",
      tip: "Foam or clear-plastic egg cartons are different items — check those separately." },
    { name: "Hardcover book", aliases: ["book", "textbook"], material: "Paper + bound cover", bin: "reuse",
      reason: "A readable book's best stream is another reader — donate or use a little free library.",
      tip: "Damaged beyond reading? Remove the hard cover (landfill) and the pages can be recycled.",
      conditions: [Q("damaged", "Is it water-damaged or falling apart?", "recycle", "Remove and landfill the hard cover/spine, then recycle the paper pages.")] },

    // ---- Organics ----
    { name: "Food scraps", aliases: ["banana peel", "leftovers", "vegetable peelings", "food waste", "apple core"], material: "Organic", bin: "compost",
      reason: "Food in landfill generates methane; food in compost becomes soil. All fruit/veg scraps, coffee grounds, eggshells, and stale bread belong in organics.",
      tip: "Meat/bones depend on your program — industrial composters take them, backyard piles usually shouldn't." },
    { name: "Coffee grounds & filter", aliases: ["coffee filter", "tea bag", "tea leaves"], material: "Organic + paper", bin: "compost",
      reason: "Grounds, paper filters, and tea leaves are all compostable (remove staples from tea bags; synthetic 'silk' tea bags are landfill).",
      tip: "Coffee pods are a different story — landfill unless the brand runs a return program." },
    { name: "Cooking oil", aliases: ["fryer oil", "grease", "used oil"], material: "Liquid fat", bin: "special",
      reason: "Never pour oil down the drain (fatbergs + pipe damage) and never loose in trash. Seal in a container for an HHW/cooking-oil drop-off, or solidify small amounts for landfill per local rules.",
      tip: "Many cities collect used cooking oil for biodiesel after holidays." },

    // ---- Special / hazardous / e-waste ----
    { name: "AA / household batteries", aliases: ["battery", "batteries", "alkaline", "lithium battery"], material: "Battery chemistry", bin: "special",
      reason: "Batteries are a top cause of fires in collection trucks and plants — never curbside, never trash for lithium. Tape terminals and take to a battery drop-off (hardware stores, HHW).",
      tip: "A swollen or damaged lithium battery is urgent HHW — store it in sand/non-flammable container until drop-off.",
      conditions: [Q("swollen", "Is a lithium battery swollen, hot, or damaged?", "special", "URGENT: isolate it away from flammables and take it to HHW as soon as possible. Do not mail it, do not trash it.")] },
    { name: "Old phone / electronics", aliases: ["e-waste", "laptop", "tablet", "computer", "electronics", "cables", "charger cord"], material: "E-waste", bin: "special",
      reason: "Electronics contain recoverable metals and toxic components. Wipe data, then use an e-waste drop-off or retailer take-back (Best Buy, Apple trade-in, city events).",
      tip: "Cords and cables go with electronics, NOT curbside — they're tanglers." },
    { name: "CFL / LED light bulb", aliases: ["light bulb", "fluorescent tube", "cfl"], material: "Bulb (contains electronics/mercury in CFL)", bin: "special",
      reason: "CFLs contain mercury and LEDs contain circuit boards — both are e-waste/HHW drop-off items, not trash or glass recycling.",
      tip: "Plain old incandescent bulbs are the exception: landfill those.",
      conditions: [Q("incandescent", "Is it a plain incandescent/halogen bulb?", "landfill", "Incandescent and halogen bulbs have no hazardous content and no recycling market — landfill.")] },
    { name: "Printer cartridge", aliases: ["ink cartridge", "toner"], material: "Plastic + ink residue", bin: "special",
      reason: "Office-supply stores take cartridges back free, and manufacturers include return labels — the remanufacturing loop actually works for these.",
      tip: "Don't throw toner in curbside; residue contaminates and cartridges often survive to be refilled." },
    { name: "Expired medicine", aliases: ["old pills", "expired drugs", "medicine"], material: "Pharmaceutical", bin: "special",
      reason: "Drug take-back kiosks (pharmacies, police stations, DEA events) incinerate meds safely. Trash/ flushing pollutes water and risks misuse.",
      tip: "If no take-back exists, FDA advises mixing pills with coffee grounds in a sealed bag for trash — take-back is always first choice." },
    { name: "Motor oil", aliases: ["engine oil"], material: "Hazardous liquid", bin: "special",
      reason: "One quart can contaminate thousands of gallons of water. Auto-parts stores accept used motor oil free for re-refining.",
      tip: "Never mix motor oil with other fluids — mixed oil often can't be accepted." },
    { name: "Christmas lights", aliases: ["string lights", "holiday lights"], material: "Wire + bulbs (tangler)", bin: "special",
      reason: "String lights strangle sorting machinery. Hardware stores run holiday light recycling (copper recovery) every season.",
      tip: "Working lights? Donate them — reuse beats materials recovery." },

    // ---- Reuse-first ----
    { name: "Clothing / textiles", aliases: ["clothes", "shirt", "fabric", "towels", "bedding"], material: "Textile", bin: "reuse",
      reason: "Wearable clothing's highest value is being worn — donate. Even worn-out textiles have a stream: textile-recycling bins turn them into insulation and rags.",
      tip: "'Too worn to donate' does NOT mean landfill — textile recyclers take stained/torn items (clean & dry).",
      conditions: [Q("ruined", "Is it stained, torn, or single-shoe worn out?", "special", "Textile recycling drop-off (not the thrift store): unwearable textiles become insulation, rags, and fiber fill.")] },
    { name: "Ceramic mug", aliases: ["mug", "plate", "ceramic dish"], material: "Ceramic", bin: "reuse",
      reason: "Intact ceramics donate well and garage-sale easily. Ceramic is NOT glass — never put it in glass recycling (different melting point, ruins batches).",
      tip: "Broken ceramic has no recycling stream at all.",
      conditions: [Q("broken", "Is it chipped or broken?", "landfill", "Broken ceramic goes to landfill, wrapped if sharp. It can sometimes be crushed as drainage aggregate in pots.")] },

    // ---- Landfill regulars people wishcycle ----
    { name: "Disposable diaper", aliases: ["diaper", "nappy"], material: "Mixed absorbent plastic/paper", bin: "landfill",
      reason: "Diapers are inseparable mixed material with biological waste — landfill, always, despite the paper content.",
      tip: "No mainstream compost stream accepts diapers; 'flushable' wipes are landfill too and never actually flush-safe." },
    { name: "Disposable mask / gloves", aliases: ["face mask", "nitrile gloves", "latex gloves", "ppe"], material: "Nonwoven plastic", bin: "landfill",
      reason: "PPE is landfill. Cut mask ear loops first so wildlife doesn't get tangled.",
      tip: "Masks in recycling bins are treated as contamination and can get loads rejected." },
    { name: "Razor (disposable)", aliases: ["razor blade", "disposable razor"], material: "Plastic + steel blade", bin: "special",
      reason: "Loose blades injure sanitation workers. Use a sharps container or blade bank, then HHW/sharps drop-off.",
      tip: "Safety-razor blades go in a metal blade bank — when full, the whole metal bank is recyclable steel in many areas." },
  ];

  // Resin code lookup (#1–#7)
  const RESIN = {
    1: { name: "PET", bin: "recycle", note: "Bottles and jars — the most recyclable plastic. Curbside yes." },
    2: { name: "HDPE", bin: "recycle", note: "Milk jugs, detergent bottles. Curbside yes, high value." },
    3: { name: "PVC", bin: "landfill", note: "Pipes, blister packs. Almost never curbside; a PVC item can contaminate a PET batch." },
    4: { name: "LDPE", bin: "special", note: "Bags and film — store drop-off when clean and dry; rigid #4 tubs vary by city." },
    5: { name: "PP", bin: "recycle", note: "Tubs, caps, straws material. Rigid #5 increasingly accepted curbside; small pieces still landfill by size." },
    6: { name: "PS", bin: "landfill", note: "Styrofoam and many utensils. No practical curbside market." },
    7: { name: "Other / mixed", bin: "landfill", note: "Catch-all for mixed and bioplastics. 'Compostable' #7 PLA needs an industrial composter — check for a certified-compostable label, otherwise landfill." },
  };

  // Fallback material heuristic for items not in the database.
  const MATERIAL_RULES = {
    "rigid-plastic": (soiled) => soiled
      ? { bin: "landfill", why: "Rigid plastic that can't be rinsed clean contaminates the stream." }
      : { bin: "recycle", why: "Clean rigid plastic (#1, #2, #5) is curbside-accepted in most programs. Check the resin code." },
    "plastic-film": (soiled) => soiled
      ? { bin: "landfill", why: "Dirty film can't be accepted by store drop-off." }
      : { bin: "special", why: "Clean dry film goes to store drop-off bins, never curbside (tangler)." },
    glass: (soiled, broken) => broken
      ? { bin: "landfill", why: "Broken loose glass endangers sorters; box and landfill unless a glass drop-off takes cullet." }
      : { bin: "recycle", why: "Container glass recycles endlessly. (Drinking glasses/Pyrex are NOT container glass — landfill.)" },
    metal: () => ({ bin: "recycle", why: "Cans and clean metal are high-value curbside. Aerosols must be fully empty." }),
    paper: (soiled) => soiled
      ? { bin: "compost", why: "Food-soiled paper can't be recycled, but it composts." }
      : { bin: "recycle", why: "Clean dry paper and cardboard are core recyclables." },
    food: () => ({ bin: "compost", why: "Organics belong in compost — in landfill they generate methane." }),
    wood: () => ({ bin: "compost", why: "Untreated wood and cork can be composted or mulched; painted/pressure-treated wood is landfill or HHW per local rules." }),
    textile: () => ({ bin: "reuse", why: "Donate wearable textiles; worn-out ones go to textile recycling, not landfill." }),
    electronic: () => ({ bin: "special", why: "Anything with a battery, plug, or circuit board is e-waste drop-off." }),
    chemical: () => ({ bin: "special", why: "Paints, solvents, pesticides, and oils are household hazardous waste." }),
  };

  function normalize(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9# ]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function searchItems(query, limit = 6) {
    const q = normalize(query);
    if (!q) return [];
    const scored = [];
    for (const item of ITEMS) {
      const names = [item.name, ...(item.aliases || [])].map(normalize);
      let score = -1;
      for (const n of names) {
        if (n === q) score = Math.max(score, 100);
        else if (n.startsWith(q)) score = Math.max(score, 80);
        else if (n.includes(q)) score = Math.max(score, 60);
        else if (q.split(" ").some((w) => w.length > 2 && n.includes(w))) score = Math.max(score, 30);
      }
      if (score >= 0) scored.push({ item, score });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.item);
  }

  function classifyItem(item, active = {}) {
    let bin = item.bin;
    const notes = [];
    for (const c of item.conditions || []) {
      if (active[c.key]) {
        bin = c.yesBin;
        notes.push(c.yesNote);
      }
    }
    return { item, bin, binMeta: BINS[bin], reason: item.reason, tip: item.tip || "", notes, changed: bin !== item.bin };
  }

  function classifyResin(code) {
    const r = RESIN[Number(code)];
    if (!r) return null;
    return { code: Number(code), ...r, binMeta: BINS[r.bin] };
  }

  function classifyMaterial(material, opts = {}) {
    const rule = MATERIAL_RULES[material];
    if (!rule) return null;
    const out = rule(!!opts.soiled, !!opts.broken);
    return { ...out, binMeta: BINS[out.bin] };
  }

  return { BINS, ITEMS, RESIN, searchItems, classifyItem, classifyResin, classifyMaterial, normalize };
});
