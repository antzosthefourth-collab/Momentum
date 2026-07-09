# MOMENTUM — Session Handoff
*Training + life OS · single-file web app → iOS via Capacitor · v6-in-progress · July 2026*

## v6 program — IN PROGRESS (see `PLAN-v6.md`) — owner feedback pass, July 9
1 ✅ Interview 3.0 (13 goals, 18 extracurricular activities, per-sport gear w/ auto-add,
eqpref/life/windows/tech steps REMOVED, booster definition card, SKILL 🎯 gated on
picking soccer, v4/v5→v6 migrations) · 2 ✅ Conditioning engine (MOT builds gear-adaptive
circuits — kbflow with KB else HIIT — never sets×reps; `circuitTiming` scales work
40s→50s→60s by session length; kb30/kb40 recipes; hiit20+fam quick starts removed;
hiit is an activity → MOT day; circuit templates hydrate with flow) · 3 ✅ Today 2.1
(`todayBrief()` plain-english + `speakBrief()`; acts expand into inline `actMoveList`
checklists with per-move check-off crediting via `ensureActSession`+`toggleItem`; how
cues + demo inline; check-in & journal moved to page bottom) + Train in-session editing
(swap/choose/remove/add per exercise, `#pickSheet`, edits write back to plan slot via
`syncActNames`) · 4 ✅ Viking hero (HERO_STAGES/HABITATS/COMPANIONS/GEAR_REWARDS;
`#heroScene` layered art w/ probeImg fallback; look selectors; `nextRewards()` rail
with roast-tier names; saga trophy card; level-ups reveal unlocks; 6-step forced
skippable tour `runTour()` after forge + ↻ replay in More; custom art URL fields
REMOVED, settings scrubbed) · 5 ✅ generated assets: 6 hero stages `hero-N_min.png`
(transparent cutouts, 525×700), 4 habitats `hab-N_min.webp`, 6 companions
`pet-{slime,dragon,wolf}-{1,2}_min.png` (400×400 cutouts) — all soul_2 + Higgsfield
bg-remover, resized via System.Drawing; 3 seedance videos `bgv-ember.mp4` (9:16
animated backdrop), `hero-loop.mp4` (hero scene), `lu-burst.mp4` (level-up) wired
through `probeVid` w/ static fallbacks + More toggles; lofi viking ambience via
ACE-Step (victor/ace-step-jam space) + `playAmbience()` player (More + Train drawer).
banner.png/avatar.png deleted (orphaned). **validate.js: 236 checks.**
**Higgsfield: 7.36 credits remain.**

## v6.1 — UX audit polish + music (July 9, same day)
- Full end-user audit in real Chrome (fresh interview → tour → every tab). All flows
  verified working; findings fixed: blur diet (backdrop-filter only on large glass —
  chips/inputs render translucent, ~5x fewer compositor layers), **full-screen
  animated backdrop REMOVED** (video under glass = battery sink; static art is the
  design), hero/level-up videos gated to visibility, Today checked-boxes get accent
  fill, open "how" panels survive re-renders, `#tdSub` reads "Week N of M" (coach
  note lives only in the brief), `.btn` nowrap, movement picker gained live search.
- **Ambience shipped**: `amb-viking-1.mp3` (Fire & Frost) + `amb-viking-2.mp3`
  (Long Night) — 60s seamless loops, 821KB each, PROCEDURALLY synthesized
  (scratch Node DSP: loop-safe drone partials/heartbeat/fire-crackle/vinyl-hiss +
  lamejs MP3; script preserved in session scratchpad `music/synth.mjs`). ACE-Step
  (victor/ace-step-jam) produced one lovely track ("Frostfire Focus") but its
  download path re-encodes video in-browser and the account's ZeroGPU quota
  exhausted — swap in ACE tracks later if wanted (route documented in memory).
- Tab-visibility gotcha for future auditing: background Chrome tabs stop rAF +
  CDP screenshots (looks like a freeze; it isn't — app measured 132fps). Owner decisions: Viking athlete art direction; video in
level-up + hero loop + theme backdrops (free-first: nanobanana/HF/GPT before
Higgsfield's 39.28 credits); windows return in-app at Phase-7 scheduling.

## v5 program — ALL SIX PHASES SHIPPED ✅ (see `PLAN-v5.md` in this folder)
1 ✅ Warmth/Sound/Safety (527b7f6) · 2 ✅ Onboarding 2.0 (ebeb2ce) · 3 ✅ Library 2.0 +
follow-along (d3dab94) · 4 ✅ Drag-drop planner (67aec11) · 5 ✅ Today 2.0 + Streak 2.0
(b3c1d11) · 6 ✅ Higgsfield art + polish (9b87b9e).
**Vite migration trigger:** move to a build when index.html >~9k lines OR a 3rd vendored lib OR team >1.
**Workflow (unchanged):** every edit → `node validate.js` (needs `npm i jsdom` once) — 187 checks.
**Natural Phase 7 candidates:** window-aware scheduling (place sessions at their time windows),
per-set tracking / history heat-strip (v3 backlog below), whisper-tiny voice transcription,
TestFlight build (WIDGETS.md — now incl. @capacitor/haptics), backup/export of mo_state.
**Higgsfield: 39.28 credits remain** (images cost 0.12 each on soul_2; ship _min.webp).

## New in v5 Phase 6 (Higgsfield art + polish) — v5.0 COMPLETE
- **6 generated images, 0.72 credits total spent (39.28 of 40 remain)** — soul_2 at
  0.12/image, shipped as compressed `_min.webp` (~90–250KB each vs 3MB PNGs):
  `bg-steel/turf/night/retro/daylight.webp` fill the previously empty `BG_ART` slots
  (local-first, CDN fallback), `lu-burst.webp` backs the level-up card (probeImg wired
  in `applyArt`). Every theme now has a photo backdrop behind the glass.
- Focus-visible outlines on all interactive elements; WIDGETS.md updated
  (`@capacitor/haptics`, copy *.png+*.webp into www/).
- Deliberately NOT spent: video (multi-MB payload in an offline single-file app),
  armor concept art (shields are already data-driven UI). ~39 credits banked for
  future art passes.
- Final: **187 harness checks**, all six phases browser-verified.

## New in v5 Phase 5 (Today 2.0 — check-ins, journal, Streak 2.0, armor shields)
- **Daily check-in strip** (energy/sleep/soreness, 3 taps → `S.checkins[day]`). Low scores
  (or Recovery-First mode at moderate scores) surface the **Adapt card**: 🌿 Minimum
  viable workout (15-min maxLvl-1 session crediting today's planned act via actRef),
  🛡️ mobility swap, 🌙 rest-with-credit (recharge XP + streak). Never auto-overwrites;
  asks once per day (`adapted`/`rested` flags).
- **Journal & voice notes** (typed or iOS keyboard dictation): `tagJournal()` rule-based
  tagger extracts duration, activity, category, muscle scope, effort/feel; completed
  statements append a done "(logged)" act, credit minutes + streak + system XP
  (`saveJournal`). Reflective notes store without fake credit. `S.journal[]`.
- **Streak 2.0** (`S.streak2 {freezes,best,milestones,comeback}`): freezes auto-granted
  at 7/14/30/50/100 milestones (cap 3, fanfare + confetti), silently bridge a one-day
  gap; comeback remembered and celebrated, never shamed; weekly consistency target from
  interview (`streakTol`) is the headline metric — streak card shows week dots, freezes,
  minutes. Partial credit was already structural (any habit/booster/journal touch).
- **Armor shields**: `S.areaXP[area]` accrues from area-tagged completed moves;
  per-area shield bars on Stats (`#armorCard`) with rehab/protected labels.
- validate.js: **187 checks** including the brief's exact voice-note example.

## New in v5 Phase 4 (Planner 2.0 — drag & drop, act editor, whole-life plan)
- **SortableJS v1.15.6 vendored** (2nd vendored lib — one more triggers the Vite note).
  Plan → 🖐 Arrange: 7 day containers per week, act chips drag between days
  (long-press on touch, ⠿ handle). Core is `movePlanAct(from, ai, to, pos)` — harness
  calls it directly. Sortables destroyed/rebuilt per render (`sortables[]`).
- **Act editor sheet** (✎ on any plan act → `openActSheet`): change type (incl. life
  rows), duration/intensity/style/muscle-focus overrides (`act.o = {time,intn,style,mg}`),
  per-exercise ⟳ swap (pins `act.names`), 🎲 rebuild slot, 🔒 lock, ⧉ duplicate, ✕ delete
  (confirm when done/locked). `startact` honors `act.names` + `act.o`.
- **Whole-life plan rows**: NUT/SLP/MIND/JRNL day types (`DTYPES[x].life` = system) —
  one-tap Done grants FUEL/RECHARGE XP + streak credit, in quick-add for everyone.
- **Regenerate 2.0**: pre-flight summary counts ("Keeps N completed and M locked —
  rebuilds K"); locked acts survive regeneration (merge from Phase 1 handles both).
- Old ⟳ type-cycling swap removed in favor of the editor sheet.
- validate.js: **166 checks** (drag persistence, overrides, swap, lock-survives-regen,
  life-act XP, duplicate).

## New in v5 Phase 3 (Library 2.0 · why engine · follow-along circuits)
- **Every move enriched**: `m.mgf` (16 fine muscle groups incl. biceps/triceps/quads/
  hamstrings/calves/forearms/neck-traps), `m.pattern` (squat/hinge/push/pull/carry/
  rotation/locomotion), `m.lvl` (1–3 difficulty), `m.mod` {easier, harder} coaching cues.
  Maps: FINE_MAP/FINE_DERIVE, PATTERN_MAP, LVL_MAP, MOD_MAP (+genericMod fallback).
  +25 new moves (KB clean/push press/thruster/carries/windmill…, HIIT bodyweight, core).
- **`whyFor(move, profile)`** — every exercise explains itself in plain language
  (muscles → goal fit → gear preference → favorite). Shown in Train cards, Library
  detail, both player modes.
- **Training styles** (`STYLES`): hypertrophy 3×10–12/75s · strength 4×5/150s ·
  power 5×3/180s · functional 3×8/90s change prescriptions via `applyStyle`; plan STR
  templates auto-pick style from goal family and persist it (`template.style`).
- **Follow-along circuits** (Juice&Toya-style pacing, original content): `hiit`/`kbflow`
  styles build `session.flow` {40s work / 20s off, blocks of 4 × 2 rounds, 30s block
  rest}; time budget sets block count; `noRepeat` recipe = single round. **Circuit player
  mode**: auto-advancing clock, halfway + 3-2-1 ticks, block/round eyebrow, easier/harder
  cues on every screen, pause/skip. `window.__CIRC_TICK_MS` overrides tick for tests.
- **Smart autofill recipes** (`RECIPES`, Train → Quick starts): 20-min KB full body,
  15-min one-KB, 20-min no-repeat KB, KB chest·sho·tris, functional KB, 20-min BW HIIT,
  desk posture reset, heart-health starter (maxLvl 1), problem-areas mobility, soccer
  conditioning, running comeback, family activity. Gated by owned gear.
- **Combinable library filters**: ⚙ Filters panel (fine muscle × pattern × difficulty)
  stacks with gear filter, search and views.
- Builder additions: `opts.eqOnly`, `opts.maxLvl`, `opts.style`, Strength style selector
  on Train (`S.sel.style`).
- validate.js: **150 checks**.

## New in v5 Phase 2 (Onboarding 2.0 — the life interview)
- **15 goal families** replace the 7 vague goals, grouped Strength & physique / Engine &
  performance / Life & wellbeing. Internal keys: muscle stronger power aesthetic functional
  heart run fat athletic sportgoal health feel mobility return family. Legacy keys map via
  `migrateProfile()` (strength→stronger, move→mobility, eat/account→health, sleep→feel).
- **"What activities do you do?"** — 25 activities (`ACTIVITIES`), each with its own 4-step
  comfort level (`profile.activities = {key: 1–4}`). `ACT_DAY` maps activities → plan day
  types; 7 new SPORT_DAYS (walking, baseball, golf, skate, martial, rowing, family) + 17 new
  library moves (TRX, stair climber, foam roller, walking, family movement, etc.).
- **Experience is now DERIVED from activity levels** (`derivedExps`); the exp step only
  appears for goal tracks with no activity evidence (`missingTracks`).
- **Equipment access ≠ preference**: access grid (+ Adjustable Dumbbells, TRX, Yoga Mat,
  Foam Roller, Stair Climber, Sports Gear) then per-item Love/OK/Rarely/Avoid
  (`profile.eqPref`) → weighted in `moveScore` (×1.5 / ×0.5 / ×0.15). Adjustable Dumbbells
  satisfy Dumbbells moves in `eqOk`.
- **Five time-windows** (main/secondary/mobility/family/booster) with one-tap life presets
  (parent, WFH, manual labor, shift, early bird) → `profile.windows`.
- **Four coach modes**: coach / hybrid / companion / recovery (`profile.mode`; companion
  maps to legacy style:"flex"). Recovery-mode adaptation wires up in Phase 5.
- **Motivation style, weekly consistency target (streakTol 3–6), tech comfort** captured
  (`profile.motiv/streakTol/tech`) — consumed by the Phase 5 streak engine.
- validate.js: **131 checks** including the full new walkthrough, level independence,
  preference weighting, preset windows, v4→v5 migration fixture.

## New in v5 Phase 1 (warmth, sound & safety)
- **Warmth/readability pass** on all 6 themes: panels lifted ~+8% luminance and warmed,
  `--dim`/`--faint` secondary text brightened to comfortable contrast, stronger bg-art glows,
  Daylight refined (warm paper bg, darker secondary text). Body type 15→15.5px.
- **SFX engine** (`SFX` object, all Web Audio synthesized, zero files): tap/select/advance/back/
  done/complete/fanfare/tick/beep. Settings → Sound: Off / Subtle / Full (`S.settings.sound`).
  First-gesture unlock; every call try/caught (harness-safe). Old `beep()` delegates to it.
- **Real haptics**: `buzz()` now uses Capacitor Haptics plugin when wrapped
  (`npm i @capacitor/haptics` at Capacitor time), vibrate fallback on web.
- **canvas-confetti v1.9.3 vendored inline** (MIT, before main script). `bigBurst(opts)` fires
  theme-colored bursts on: session complete, level-up, plan forge. CSS confetti kept for forge.
- **Destructive-action protection**: `askConfirm()` bottom sheet (`#confirmSheet`) gates
  Regenerate / Start-blank / interview finish / deleting completed acts. `regeneratePlan()`
  MERGES: done+locked acts (and their templates) always survive. `planHasWork()` is the guard.
  Acts now honor a `lock` flag in merges (UI for locks arrives in Phase 4).
- validate.js: **109 checks** (sound persistence, confetti vendored, confirm gates,
  done-acts-survive-regenerate, cancelled-skip keeps plan).

## New in v4.0 (onboarding overhaul + smart library)
**Interview restructured (owner review, July 8):**
- **Experience moved AFTER training-type selection** and split per discipline:
  lifting / cardio / sport tracks (`profile.exps.{lift,cardio,sport}`), asked only
  for tracks the user actually picked. `buildSession` volume + plan notes key off
  the right track. Legacy `profile.exp` kept as fallback; `migrateProfile()` upgrades.
- **About step = name/age/gender only.**
- **Soccer removed from goals** — lives in the new **Sports step** (soccer, running,
  cycling, swimming, basketball, tennis/pickleball, hiking, yoga). Each sport
  registers a day type (`SP_*` via `SPORT_DAYS`) with sport-tagged library moves;
  soccer → SKL ball work and auto-adds the Soccer Ball. Sports genuinely shape
  `weekTypes()`.
- **Injury context on body areas**: per selected area — injury? avoid-or-rehab?
  rehab stage? (`profile.areaInfo`). `avoid` areas are filtered out of every built
  session; `rehab` areas get booster priority + "pain-free range" plan notes.
- **Gear**: Bodyweight removed as an option (always available in `buildSession`);
  added Bench Press Machine, Lat Pulldown, Cable Machine, Leg Press, Row Machine,
  Smith Machine (+11 machine movements with mg tags).
- **Life step**: 9-to-5 (work) + **5-to-9** (`profile.eve`) + realistic training
  window (`profile.window`). New eve-derived habits; window lands in plan notes.
- **Multi-session days**: "Daily boosters" (`profile.boost` 0–2) — ~12-min
  mobility/rehab micro-sessions on every day incl. rest days. Tracked as
  `S.microDone`, NOT `S.sessions`; half completion bonus; `micro:true` on acts,
  templates and sessions.
- **Movement library 2.0**: ♥ favorites, ★ 1–5 rankings, usage counts
  (`S.moveMeta[name] = {fav, rank, used, last}`), views: All / Favorites /
  My ranking / Most used / Muscle group / Activity type. `wPick()` (weighted by
  `moveScore()`) replaces `pickRandom` in the builder → favorites/ratings/frequency
  bias every generated session and future plans.
- **GO HAM visual pass on onboarding**: animated aurora + drifting orbs, gradient
  progress bar with step meta, gradient-border selection cards with check pips,
  staggered step-entry reveals, shimmer CTA, per-track experience cards,
  plan-forging interlude (progress ring + step cascade + confetti burst),
  `navigator.vibrate` micro-haptics. All pure CSS/JS, `prefers-reduced-motion`
  respected. `window.__FORGE_MS` overrides forge duration (harness sets 0).
- validate.js now **94 checks** including the full new interview walkthrough,
  injury flow, booster accounting, library fav/rank views, avoid-filtering and
  profile migration.

## Project folder
```
momentum/
├── index.html    ← the entire app (HTML+CSS+JS, ~1150 lines)
├── validate.js   ← runtime harness, 23 checks — run after EVERY edit
├── WIDGETS.md    ← App Store + WidgetKit path, Swift widget code
└── HANDOFF.md    ← this file
```
**Workflow rule (hard-won on Glissé):** `node --check` catches syntax only.
Every change goes through `node validate.js` (needs `npm i jsdom` once). It
boots the app in jsdom, runs the full interview, generates a plan, completes
sessions, and exits 1 on any regression.

## v3.2.1 hotfix — art loading
- Project folder now SHIPS the three PNGs (banner.png, avatar.png,
  bg-ember.png). Deploy the whole folder — art loads locally, no CDN needed.
- Self-healing loader: `probeImg()` tries custom URL → local file → CDN and
  applies the first that actually loads. Images stay hidden until loaded.
- Fixed iOS Safari bug: `background-attachment: fixed` (broken on iOS) removed
  from the photo backdrop — the fixed pseudo-element handles it.
- Heads-up: the Claude.ai chat preview blocks external images by design; judge
  art on the deployed githack URL or in the Capacitor build, not the preview.

## New in v3.2 (aesthetic pass)
- **Atmospheric backgrounds**: every theme now has full-screen layered-gradient
  art behind frosted-glass panels (backdrop blur + film-grain overlay). Ember
  additionally loads a Higgsfield editorial silk/ember photo backdrop
  (`BG_ART.ember`); other themes have empty slots ready for photos — Higgsfield
  workspace ran out of credits mid-batch, top up and generate 9:16 pieces per
  theme, or leave the CSS art (it's fast and battery-friendly).
- **Quad daily rings** (TaskCoach-style): MOVES / XP / TIME / HABITS with
  targets, "n to go" microcopy and "x/4 closed" counter. Daily XP and minutes
  now tracked per-date (S.dayXP / S.dayMin).
- Background photo URL override in More → Custom art. 46 harness checks.

## New in v3.1 (video-inspo pass)
- **Guided player**: full-screen one-exercise-at-a-time mode (▶ START GUIDED on
  any session). Big work timers for timed moves, automatic rest screens with
  countdown/+15s/skip between weighted moves, next-up preview, XP summary
  finish screen. Checklist mode still available underneath.
- **Daily progress ring** on Today: scheduled activities + habits combined into
  one completion percentage, Apple-rings style.
- **Art hardwired**: both MOMENTUM pieces now load from Higgsfield CDN URLs in
  `ART` (override in More, or swap to local files for the App Store bundle —
  bundle locally before shipping, CDN links can expire).
- Item-completion logic factored into `toggleItem(i, fromPlayer)` — shared by
  checklist and player. validate.js now 41 checks incl. full player walkthrough.

## New in v3.0
- **Whole plan pre-built.** `makePlan` now generates a session template for every
  activity slot (`plan.templates`, keyed `slot:TYPE`). The same template repeats
  weekly so users progress on the same movements (block periodization); acts
  reference it via `act.tpl`. No daily Build Session needed. Quick-added and
  swapped acts inherit a matching template when one exists.
- **A/B strength split** when 2+ strength days (upper/lower bias via `mg` tags).
- **Interview lightened + intro tour**: 20-second feature tour first; experience
  level asked; maxes and running-focus questions REMOVED. Weights get logged
  in-flow: every strength card has a "Weight used" input → powers "Last time:
  95 lb, nudge to 100" hints (barbell lifts also backfill profile.lifts).
- **Mobility areas**: interview asks where the body needs work (ankle/knee/hip/
  back/shoulder/neck/general); ARM templates filter by area; Train tab shows
  area chips on Mobility focus and muscle-group chips on Strength focus.
- **Lifestyle-aware habits**: WFH → stand/move between meetings + hip flexor
  stretch; on-feet → legs-up recovery; physical job → post-work stretch;
  kids → floor play. New armor moves cover shoulders, neck, low back, desk breaks.
- **Nav flow**: fresh interview → Plan tab (see the block); every reopen → Today.
- **6 themes** (added Night, Retro) + custom banner/avatar URL fields in More;
  ART defaults to `banner.jpg`/`avatar.jpg` beside the file.

## What exists (carried from v2)
- **Interview → plan**: goals, run focus (faster/longer/both), full home-gym
  equipment incl. machines, working weights, schedule → 4/6/8-week plan.
- **Stacked days**: a day holds multiple activities (`day.acts[]`) — run AND
  lift on the same day. Distribution is family-aware (two runs never share a
  day when avoidable). Final week auto-deloads.
- **Today page** (landing tab): date-driven, auto-advances from `plan.start`;
  lists today's activities with Start buttons; quick-add chips append
  unscheduled activities; finishing any freestyle session logs itself onto the
  day as an ad-hoc ✓. Habits live here too.
- **Six Systems** w/ XP + levels: STRENGTH, MOTOR, ARMOR (mobility·rehab),
  SKILL (soccer-ball-gated), FUEL, RECHARGE. Tiers Rookie→Peak.
- Rest timers (auto after weighted sets), work timers for timed holds/intervals,
  load suggestions from working weights, ~70-move library + custom moves,
  media vault (YouTube embeds; IG/TikTok/FB links) w/ tag-matching to sessions,
  4 themes, Spotify/YouTube music, widget payload bridge (see WIDGETS.md).

## Architecture cheatsheet
- All state in one object `S`, persisted to `localStorage["mo_state"]`
  (in-memory fallback keeps Claude.ai preview working). `save()` also calls
  `pushWidgets()` → `localStorage["momentum_widgets"]` + Capacitor App Group.
- Plan day: `{w, d, acts:[{type, done, adhoc?}], note}`. `migratePlan()`
  upgrades any old `{type, done}` days — keep it until all devices migrate.
- Session: `S.session.actRef = {idx, ai}` links a session to the plan act it
  came from; no ref ⇒ completion appends an ad-hoc act to today.
- `DTYPES` maps plan activity types → Train-tab focus (`__runfast`/`__runlong`
  are special run builders that respect week/equipment).
- Art: paste URLs/filenames into `ART = {banner, avatar}` at the top of the
  script. New MOMENTUM-branded pieces (sunrise-runner banner + athlete avatar)
  were generated this session — download from chat, drop beside index.html.

## Deploy
Same as ankle-armor: commit to `docs/momentum/index.html`, serve via
raw.githack. App Store path in WIDGETS.md (Capacitor + Codemagic; one Mac
session needed only for the widget extension target).

## Next steps — recommended order
1. **Drop in the art** (banner.jpg/avatar.jpg from chat) **+ TestFlight build.** Fastest visible win. Capacitor init per
   WIDGETS.md; ship without widgets first.
2. **Per-set tracking.** Weight-per-exercise logging exists now; upgrade to
   tap-per-set with rest timer between sets → "beat last time: 3×10 @ 40 lb".
3. **History log.** Append completed sessions to `S.history[]` (date, focus,
   items, minutes) and render a simple calendar heat strip on Stats. Widget
   payload can then include "last 7 days" dots.
4. **Plan intelligence v2.** Use age/gender + goal mix for starting-volume
   presets; auto-progress running duration/intervals per week (data model
   already carries week index — prescriptions are still static text).
5. **Real video library.** The `video:""` slot exists on every move; start by
   attaching your own media-vault entries to specific movements (tag = move
   name), then curated defaults.
6. **Widgets** (after TestFlight): static Today + Levels widgets from
   WIDGETS.md, then ActivityKit Live Activity for the rest timer.
7. **Backup/restore.** Export/import `mo_state` as JSON from More — cheap
   insurance before App Store users exist.

## Known limits / honest notes
- Spotify/YouTube iframes: blocked in Claude.ai preview CSP; work on githack
  and in Capacitor (add domains to `allowNavigation`).
- Streak is day-granular and forgiving by design (any XP touch counts).
- `weekTypes` caps at `days×2` activities/week — bump the cap if you want
  triple-stacked days.
- No cloud sync; everything is on-device by design for v1.

## v3 session notes
- validate.js now runs 35 checks including the full new interview path.
- Owner's Drive inspo video couldn't be reviewed (video content); fold in its
  key ideas verbally next session.
- Rad Dad Ankle Armor lineage: ankle defaults on in mobility areas; ankle moves
  carried over 1:1; ease-of-use bar = that app.
