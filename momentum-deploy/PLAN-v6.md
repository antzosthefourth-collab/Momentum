# MOMENTUM v6 — "Main Character" (owner feedback pass + Viking hero system)
*Approved direction July 9 2026. Feedback source: owner review of v5.0. Phase 7 backlog
(window-aware scheduling, per-set tracking + heat-strip, voice transcription, TestFlight,
backup/export) begins AFTER this program ships.*

## Why
v5.0 shipped all six planned phases, but the owner's review found the app drifted from
what made Ankle Armor loved: **instant daily digestibility**. Plus: the interview asks
questions with no output, quick starts hold things that should be activity types,
conditioning builds like strength, sessions aren't editable without a random rebuild,
and there's no reward fantasy. v6 fixes the feedback list and adds a TaskCoach-inspired
Viking hero/avatar system with real unlocks, tutorial, and generated art/music/video.

## Owner decisions (locked)
- Avatar art direction: **Viking athlete** — scrawny → epic armored Viking. Companions:
  slime + cute dragon (+wolf). Habitats: longhouse gym → fjord grounds → mountain arena.
- Video: level-up celebration + hero ambient loop + theme backdrops. **Free-first
  sourcing**: Gemini nanobanana / Hugging Face / GPT accounts via Chrome before
  Higgsfield credits (39.28 remain). Always compress; static webp fallback.
- Interview: **remove life (9-5/5-9/motivation) AND windows steps entirely**, remove
  tech-comfort, remove gear-preference step. Windows return as an in-app setting when
  Phase 7 scheduling ships.

---

## Phase 1 — Interview 3.0 (trim, clarify, gate, migrate)
- GOALS: remove `power` (Powerlifting) + `family`. Reword `return` → clear "bounce back
  after a break/injury" copy. 13 goal families remain.
- ACTIVITIES: remove exercise modalities — kettlebells, dumbbells, barbell, machines,
  bodyweight, elliptical, family. Extracurricular only (18 remain). TRACK_ACTS: lift
  track no longer derivable → exp step asks lifting experience whenever lift goals picked.
- GEAR: remove "Sports Gear"; add per-sport gear (Pool access, Racquet & court, Bike,
  Golf clubs, Skateboard, Gloves & pads, Bat & glove, Hoop). Auto-add when the matching
  activity is selected (Soccer-Ball pattern). Retag sport library moves accordingly.
- REMOVE steps: eqpref (love/OK/rarely/avoid), life (work/eve/motiv), windows, tech.
  moveScore drops eqPref weighting. habitSet: goal-derived + universal defaults only.
- Boosters: definition card at the ask ("what's a booster?" + example) — never assume.
- SKILL system: icon ⚽ → 🎯, sub "Sport skills · Drills". Stats row + SKL day type +
  Train focus gated on actually selecting a skill sport (not just owning a ball).
- `migrateProfile` v6: goals power→stronger, family→feel; strip removed activities,
  eqPref/work/eve/motiv/windows/tech; legacy SP_family plans keep rendering via a
  hidden DTYPES shim.
- validate.js: rewrite walkthrough for new step list + checks for every removal,
  sport-gear auto-add, booster explainer, v5→v6 migration fixture.

## Phase 2 — Conditioning engine (separate from strength) + KB HIIT
- Conditioning (MOT) builds **circuits/intervals, never 3×10**: distinct pool
  (locomotion, HIIT bodyweight, KB conditioning, carries, cardio machines),
  gear-adaptive (KB present → KB flavor; else bodyweight).
- HIIT is an **activity type** (adapts to gear), not a zero-gear quick start. Remove
  `hiit20` + `fam` recipes. Quick starts stay gear-gated and lean.
- 30/40-min KB HIIT sessions: work intervals 40–60s, blocks scale with time budget.
  Style axis split: strength styles vs conditioning formats, shown contextually.
- validate: conditioning ≠ strength prescriptions; 40-min KB HIIT structure; gear
  adaptation; removed recipes gone.

## Phase 3 — Today 2.1 (Ankle-Armor digestibility) + Train editability
- **Today's Brief**: dated plain-English paragraph of today's plan (acts, minutes,
  coach note) + Speak button (speechSynthesis). The Ankle Armor "audible brief".
- Acts render as **expandable checklists on Today**: movements + inline prescriptions
  + per-move check-off + "how" (easier/harder cues) + demo link. Zero navigation to
  see today's workout.
- Reorder Today: header → brief → today's plan → rings → streak → quick-add → habits →
  **check-in (bottom)** → **journal (bottom)**.
- Train tab per-exercise editing without random rebuild: ⟳ swap, pick-from-list
  (block/gear-filtered), ✕ remove, + add per block; "save to plan" writes back to the
  act's template.
- validate: brief mentions today's acts; Today check-off credits XP; targeted swap
  changes exactly one move; add/remove/picker respect gear.

## Phase 4 — Viking hero, avatar & rewards + forced tutorial
- `S.avatar` {look per category, unlocked[]}: **Habitats / Outfits / Weapons & gear /
  Companions**. Unlocks driven by total level, system levels, streak milestones.
- Stats hero scene: layered habitat + Viking stage art + companion + level badge +
  streak flame. "Next rewards" rail (XP-needed bars, roast-tier item names, guilt-free
  tone). "Lock in your look" selectors. Trophy/milestone gallery.
- Level-up card shows newly unlocked reward; companions evolve (2 stages each).
- **Forced (skippable) tutorial** right after the forge: 6 coach-mark steps — Today
  brief/checklist, check-in, Plan arrange, Train quick starts, Library filters, Stats
  hero/rewards. Replay from More. `S.tutorialDone`.
- Remove custom art URL fields (banner/avatar/bg) from More + settings migration.
- validate: defaults, unlock thresholds, look persistence, tutorial fires once,
  URL inputs gone.

## Phase 5 — Generated assets (free-first) + ambient audio player
- Images (~25, ship `_min.webp`): Viking stages ×6, habitats ×4, companions 3×2,
  reward thumbnails, level-up art. Sources: nanobanana/HF first, Higgsfield soul_2
  (0.12/img) for hero pieces.
- Audio: 2–3 seamless **lofi Viking ambient loops** (HF MusicGen/Stable Audio or
  Higgsfield) + new ambient player (Train + More), volume tied to Sound setting.
- Video (free-first, compressed, lazy-loaded, webp fallback): level-up clip, hero
  scene loop, theme backdrops.
- validate: asset references, player controls, jsdom-safe fallbacks.

## Workflow (unchanged, hard rules)
- `node validate.js` after EVERY index.html edit; exit 1 = stop and fix.
- Push per completed phase to GitHub main via scratch clone; update HANDOFF.md.
- Windows-emoji gotcha: no glyphs that tofu on Windows Chrome.

## Phase 7 queue (after v6)
Window-aware scheduling (windows editor lives in-app now, not interview) · per-set
tracking + history heat-strip · voice transcription · TestFlight build · mo_state
backup/export.
