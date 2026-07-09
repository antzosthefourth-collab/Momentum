# MOMENTUM v5 — "Personal Fitness OS" Master Plan

## Context

Momentum v4.0 (shipped this session, live on main at `c1c2eb6`) restructured onboarding and added a smart library. The owner now wants a step-change: an app that feels like a **personal fitness operating system** — premium iOS design, coaching psychology, sports science, and adaptive planning — acting as three experts at once (iOS design lead, master life coach, sports scientist). This plan turns that brief into six shippable phases.

**Decisions locked with owner:**
1. **Stay single-file** (`momentum-deploy/index.html` + `validate.js` harness). *Vite migration trigger noted below.*
2. **Higgsfield credits: images-first** (40 credits, free plan — test-one-then-batch procedure, ~10-credit reserve).
3. **Audio: synthesized Web Audio SFX engine** (zero credits, zero file weight, offline).
4. **Release: phase-by-phase pushes to main**, each gated on full harness + browser walkthrough.

---

## 1. Audit of current app (first-hand — I authored v4.0)

**Works well — preserve:** single `S` state object in localStorage + widget bridge; interview → pre-built plan templates (weekly repetition = real progression); stacked days; guided player; quad rings; body-areas/injury flow ("body armor" — owner's favorite); weighted move picks from favorites/ranks/usage; 6 themes with glass panels; 94-check jsdom harness; raw.githack + Capacitor deploy pipeline.

**Problems to fix:**
- **Too dark / low emotional warmth**: `--dim` (#8A8F9E) and `--faint` text fail comfortable readability on glass; panels are near-black; nothing outside onboarding feels warm or alive.
- **Zero audio**; `buzz()` uses `navigator.vibrate` which is a **no-op on iOS Safari/WKWebView** (haptics currently don't exist on the target platform).
- **Plan feels random**: template contents aren't editable; **Regenerate wipes everything including completed/locked work with no confirmation** (real destructive-action bug today); no locks, no per-exercise swap, no intensity/duration/muscle controls.
- **Equipment access = preference** (owning kettlebells ≠ wanting them daily).
- **Binary coach/flex mode**; no recovery-aware adaptation.
- **Library filters shallow** (gear OR view, no combinations; no difficulty/duration/pattern; coarse muscle groups — "arms" not biceps/triceps).
- **No "why this exercise"** explanations.
- **Today has no journaling, check-ins, or reflection**; unscheduled logging exists but is buried in quick-add chips.
- **Streak is invisible psychology**: day-granular counter with no freezes, milestones, weekly view, comeback mechanics, or celebrations.
- Plan tab is workouts-only — no nutrition/sleep/mindfulness/family rows.

## 2. Research findings (sources at bottom)

- **Liquid Glass (iOS 26)**: glass belongs on *navigation/controls*, content gets the stage; warmth + readability beat spectacle. Our glass panels already align; the fix is **surface luminance + text contrast + warm neutrals**, not more effects.
- **Streak science (Duolingo — 600+ experiments)**: loss aversion works only with slack. Freezes are **granted automatically before they're needed** (cap 2–3), framed as refills not rewards; 7-day streak → 3.6× course completion; the moment a streak breaks is peak churn risk → build **recovery/comeback mechanics**, never shame.
- **Follow-along structure (Juice & Toya pattern)**: 2 blocks × 8 moves; 20s work / 5s side-switch / 15s between moves / 30s between blocks; a visible **easier-modification demonstrator** at all times. This maps perfectly onto our guided player as a timed circuit mode with per-move "easier/harder" cue lines.
- **Drag & drop**: SortableJS (MIT, ~44KB min, touch-native with `delayOnTouchOnly`) is the vendorable standard. Native HTML5 DnD is broken on mobile — don't use it.
- **Confetti**: canvas-confetti (MIT, ~10KB) for milestone moments; keep CSS confetti for small wins.

## 3. Product architecture (data model v5)

All state stays in `S` (schema-versioned: `S.v = 5`, `migrateV5()` upgrades v4 profiles losslessly). New/changed structures:

```
profile: {
  goals[]            // 15 goal families (see §4)
  activities{ key: {level:0-3} }   // 26 activities, per-activity comfort (replaces sports[]+exps)
  eqAccess[]         // what you CAN use (expanded list)
  eqPref{ item: "love"|"ok"|"rare"|"avoid" }   // separate from access
  windows{ main, secondary, mobility, family, booster }  // multi time-windows
  mode: "coach"|"hybrid"|"companion"|"recovery"
  lifeMode[]         // parent | manual-labor | desk | shift | travel-ready
  motivStyle, streakTol, techComfort
  areaInfo (kept), lifts/caps (kept)
}
plan.days[].acts[]: { type, title, done, lock, micro, src:"gen"|"user", tpl, why }
plan.templates[tpl]: { label, names[], micro, style, locked? }  // + per-act name overrides
S.journal[]  : { d, txt, tags[], meta{dur, act, feel, adhoc} }
S.checkins{} : { date: {energy, sleep, soreness} }
S.streak     : { cur, best, freezes, weekTarget, weekHits, milestones[], comeback }
LIB moves gain: mgFine[], pattern, lvl(1-3), intensity, recov, whyBits[], mod{easy, hard}
```

Derived compat: `exps.lift/cardio/sport` computed from activity levels so the v4 builder keeps working during transition.

**Vite migration trigger (owner-approved note):** move to a Vite build when ANY of: index.html > ~9k lines, a 3rd vendored library is needed, or collaborative dev starts. Until then: single file, section banner comments, vendored libs at bottom of `<script>` with license headers.

---

## 4. Phase plan (each phase = harness green → browser walkthrough → push to main)

### PHASE 1 — Warmth, Sound & Safety (quick wins; ~1 session)
1. **Color/readability pass** on all 6 themes: raise panel luminance (~+6-8% L), warm the dark neutrals (charcoal → warm graphite), bump `--dim`/`--faint` contrast to WCAG-comfortable, brighten accent glows, refine Daylight into a true premium light theme. Type scale polish (slightly larger body, tighter display).
2. **SFX engine** (`sfx.js` section, Web Audio, all synthesized): `tap`, `select`, `advance` (filtered-noise whoosh), `complete` (triad arp), `fanfare` (5-note streak/milestone), `tick` (forge steps), existing `beep` folded in. First-gesture audio unlock; master toggle + volume in More; default subtle; respects reduced-motion users via separate setting.
3. **Haptics fix**: `buzz()` upgraded to Capacitor Haptics plugin when present (`window.Capacitor.Plugins.Haptics.impact`), `navigator.vibrate` fallback — real haptics on the iOS build for the first time.
4. **canvas-confetti vendored**; big-moment bursts (plan forge, milestones, PBs); CSS confetti stays for small wins.
5. **Destructive-action protection** (bug fix): Regenerate / Redo-interview / act-delete on completed or user-built content → confirmation sheet; regenerate **merges**: completed + locked acts always preserved.
- *Harness adds:* sfx object + toggle persists; confirm gate blocks overwrite; regenerate preserves done acts. (~+10 checks)

### PHASE 2 — Onboarding 2.0: the life interview
1. **Goal families** (replaces 7 goals): Build muscle, Get stronger, Improve heart health, Improve running, Lose fat, Improve mobility, Functional fitness, Athletic performance, Aesthetic physique, Powerlifting, General health, Feel better day-to-day, Return to activity, Family activity, Sport-specific — grouped grid UI (Strength / Engine / Life buckets), multi-select.
2. **"What activities do you do?"** (renamed from "What do you play?"): 26 activities (running, walking, hiking, swimming, cycling, pickleball, tennis, soccer, basketball, baseball/softball, golf, skateboarding, mobility, yoga, kettlebells, dumbbells, barbell lifting, machines, bodyweight, HIIT, rowing, elliptical, stair climber, martial arts, family movement). **Each selected activity expands a 4-step comfort slider** (New → Learning → Comfortable → Advanced) — same progressive-disclosure pattern as the injury panel.
3. **Equipment access vs preference**: step A = access grid (expanded: adjustable DBs, TRX, yoga mat, foam roller, stair climber, sports gear added); step B = preference chips per owned item (Love / OK / Rarely / Avoid). Preference feeds `wPick` weighting (love ×1.5, rare ×0.5, avoid ×0.15 — never zero, so "only X available" still builds).
4. **Time windows**: multi-window step with named windows (main workout / secondary activity / mobility / family / booster) + one-tap life presets: *Parent schedule, WFH midday, Manual labor recovery, Shift worker, Early bird + family evenings*.
5. **Coach modes (4)**: Full Coach / Guided Hybrid (workouts planned, activities user-run) / Flexible Companion (daily suggestions) / **Recovery-First** (adapts to check-ins — wired in Phase 5).
6. Motivation style + streak tolerance + tech comfort → 3 chips folded into existing 5-to-9 and coaching steps (no new steps; interview stays ≤ 12 steps with disclosure).
7. `migrateV5()` maps v4 profiles (sports→activities at "Comfortable", exps→levels, eq→access with "ok" pref).
- *Harness adds:* full new walkthrough, per-activity levels persist, pref weighting affects `moveScore`, presets fill windows, migration. (~+15 checks)

### PHASE 3 — Library 2.0 + "Why" engine + follow-along sessions
1. **Metadata enrichment of every LIB move** + ~40 new movements: fine muscle groups (chest, back, shoulders, biceps, triceps, forearms, core, glutes, quads, hamstrings, calves, hips, ankles, neck/traps, full body, mobility/recovery), movement pattern (hinge/squat/push/pull/carry/rotation/locomotion), difficulty 1–3, intensity, recovery impact, beginner-friendly flag, easier/harder modification lines. New moves concentrate on: **single-kettlebell full-body/no-repeat/chest-shoulder-triceps sets, HIIT circuits, adjustable-DB work, TRX, stair climber, martial-arts conditioning, family movement**.
2. **Training styles**: hypertrophy / strength / powerlifting / functional / kettlebell flow / HIIT / zone-2 / intervals / mobility / recovery / sports performance / core / balance — a `style` axis on sessions that changes set-rep-rest prescriptions and player pacing.
3. **Follow-along session format** (Juice & Toya-inspired, original content): sessions get block structure — warmup → circuit A (timed rounds: 20s on/10s off or 40/20) → rest 30s → circuit B → finisher → cooldown. Guided player upgrade: **auto-advancing circuit mode** with big countdown, "next up" strip, per-move easier/harder cue, halfway/last-round callouts (SFX), pause anytime. 15/20/30/45-min variants.
4. **`whyFor(move, profile)` explanation engine**: template-composed from metadata — *"Kettlebell swings train hip power and conditioning in one move — a fit for your heart-health goal and your love of short kettlebell sessions."* Shown in exercise detail + player + plan act sheet. Clean language, no academia.
5. **Filter system**: combinable filters (muscle × equipment × style × duration × difficulty × pattern × goal) as stacked chip rows + active-filter pills; views from v4 kept.
6. **Smart autofill recipes**: named one-tap builders — "Only kettlebells", "30-min lunch workouts", "3 lifts + 2 family walks", "Build chest & arms", "Heart health beginner", "Manual labor recovery", "Desk posture plan", "Soccer conditioning", "Running comeback", "Low-equipment fat loss", "Dad schedule", "Travel week" — each is a declarative recipe `{goals, style, eq, time, days, windows}` feeding the existing generator.
- *Harness adds:* filter combos return sane sets, why-text nonempty for every move, circuit session structure + player walkthrough in timed mode, each recipe builds a valid plan/session. (~+15 checks)

### PHASE 4 — Planner 2.0: drag-and-drop whole-life plan
1. **Vendored SortableJS**; week board: acts draggable between days (long-press on touch, handle icon), reorder within day; drop updates `plan.days` + saves.
2. **Act sheet** (bottom-sheet editor on any act): change training style / equipment pool / muscle focus / duration / intensity; **swap individual exercises** from a filtered library picker; duplicate act; move to week; **lock** toggle; per-act regenerate; delete (confirm if done/user-built). Every generated act shows its "why".
3. **Regenerate 2.0**: only unlocked + incomplete acts; pre-flight summary sheet ("Keeps 3 locked, 6 completed, rebuilds 9").
4. **Whole-life plan rows**: plannable non-training acts — mobility, walk, family activity, nutrition focus, sleep target, mindfulness/breathing, journaling prompt, rest — as first-class `acts` with their own icons/XP mapped to existing FUEL/RECHARGE/ARMOR systems (unifies habits and plan; habits remain the daily checklist view of these).
5. Windows drive default placement (main-window slots first, boosters in booster window; labels shown on day rows).
- *Harness adds:* programmatic drag (Sortable API events) moves an act and persists; locks survive regenerate; exercise swap persists into template override; life acts grant correct system XP; confirm sheets gate destructive paths. (~+15 checks)

### PHASE 5 — Today 2.0 + Accountability engine
1. **Daily check-in strip** (3 taps: energy / sleep / soreness) → **Recovery-First adaptation**: low scores surface "Adapt today?" sheet — swap to MVW ("minimum viable workout": 10-min version of today's session), mobility swap, or rest-with-credit. Never auto-overwrites; user confirms.
2. **Journal + voice notes**: typed entry with one-tap start; voice = iOS keyboard dictation (real, zero-dependency) + optional MediaRecorder audio clip attached to the entry (labeled "Audio clip — stored on device"); **rule-based metadata tagger** (real, offline): duration regex ("25 minute"→25min), activity keywords matched against LIB+activities ("kettlebell", "swings"→kettlebell/full-body/strength-conditioning), feel words ("tired","strong")→fatigue/energy tags, auto date + adhoc-completion + streak credit. Tagged entries create ad-hoc done acts (existing pattern reused from freestyle logging).
3. **Streak 2.0** (guilt-free by design): current + best streak; **freezes auto-granted at milestones** (start with 1, cap 3, granted at 7/30/100-day marks, consumed silently with a gentle "streak protected" note); **partial credit** — any habit, booster, journal, or check-in maintains a streak; full workouts grow weekly consistency; **weekly consistency target** (from streak tolerance answer: 3–6 days) is the headline metric, not the raw streak; **comeback streak** ("Day 2 of your comeback — that's the hard part") after a break; milestone celebrations (confetti + fanfare at 7/14/30/50/100 + PBs); **weekly recap card** (Sunday: sessions, minutes, systems grown, PBs, best moment from journal); badges only for meaningful firsts (first week complete, first comeback, first 100).
4. **Armor progress visual**: body-areas card where each trained area fills its shield segment from ARMOR XP by area — extends the beloved body-armor concept into visible progress.
5. Today layout: check-in strip → today's acts (with MVW chip) → quick-add + journal/voice buttons → rings → habits → streak/recap cards. Family-activity suggestion appears when family window is set.
- *Harness adds:* tagger unit cases (the exact example from the brief must produce the specified tags), freeze grant/consume, partial credit maintains streak, MVW builds a ≤12-min session, recap renders, adaptation never overwrites without confirm. (~+20 checks)

### PHASE 6 — Higgsfield asset pass + premium polish
1. **Credit procedure** (40 total, free plan; exact per-image cost unverified): generate **1 test image** (Recraft/Seedream, 9:16) → check `balance` delta → recompute batch. Hard budget: ≤30 spent, ≥10 reserve. Priority order:
   - 5 theme backdrops 9:16 (steel/turf/night/retro/daylight — `BG_ART` slots already exist and are empty) — ~10 credits
   - 2 body-armor progression visuals (shield/figure concept art for the armor card) — ~4
   - 2 milestone celebration stills (recap/100-day) — ~4
   - 1 refreshed hero/welcome key art — ~2
   - Remainder reserved; **no video** (CSS motion carries animation; multi-MB video hurts the offline single-file app).
2. Ship images beside index.html (probeImg local→CDN fallback pattern already exists).
3. **Final polish**: accessibility pass (contrast audit per theme, 44px tap targets, focus states, `prefers-reduced-motion` + separate sound toggle), empty states for every new surface, performance audit (devtools trace; animation only on transform/opacity), Capacitor notes update in WIDGETS.md (Haptics plugin install line).

---

## 5. Sound / music / haptic strategy (summary)
- **SFX**: synthesized Web Audio only (owner-approved). Palette: sub-2ms tap ticks (pentatonic-pitched by context), soft select thock, noise-swept whoosh for step transitions, warm triad arp on completion, 5-note fanfare for milestones, countdown beeps (existing), forge ticks. Master volume + off switch; subtle by default.
- **Music**: keep Spotify/YouTube embeds (existing); add a "focus mode" hint in player linking user's saved playlist.
- **Haptics**: Capacitor Haptics (impact light/medium, success notification) with web vibrate fallback; tied to the same events as SFX.

## 6. Tools / repos / HF (deliverable 13)
- **Vendored (MIT, inline with license headers)**: SortableJS (~44KB), canvas-confetti (~10KB). No other runtime deps.
- **Hugging Face**: *deliberately deferred.* The voice/tagging need is met honestly on-device by dictation + the rule-based tagger. Whisper-tiny via transformers.js (~40MB) is flagged in HANDOFF as a labeled future enhancement if real audio transcription is wanted; not Phase 1–6.
- **MCPs used during build**: Chrome DevTools (walkthrough/screenshots/perf), Higgsfield (images, Phase 6), Web research done.
- **Figma**: skipped — single-file app iterates faster in-browser; design decisions documented in HANDOFF.

## 7. Risks (deliverable 15)
1. **Regenerate/merge logic** (locks + completed + user edits) is the highest-complexity change → mitigate with exhaustive harness cases before UI.
2. **Drag-and-drop vs scroll** on touch → SortableJS `delayOnTouchOnly:150ms` + explicit drag handles.
3. **iOS audio unlock** — Web Audio needs a user gesture; unlock on first tap (standard pattern).
4. **Single-file growth** (~1.9k → ~6-8k lines) → section banners, harness after every edit, Vite trigger documented.
5. **Migration** of live v4 profiles → `migrateV5()` with harness fixture of a real v4 state blob.
6. **Credit cost uncertainty** → test-one-then-batch, hard ceiling.
7. **Interview length creep** → cap 12 steps, progressive disclosure, "smart defaults + skip" on every step.

## 8. Quick wins (deliverable 16 — all in Phase 1)
Contrast/warmth pass · confirm-before-overwrite bug fix · SFX + real haptics on iOS · canvas-confetti moments · streak freezes (can land early) · MVW chip · autofill recipes are cheap once metadata exists.

## 9. Verification (every phase)
1. `node validate.js` green (grows ~94 → ~170 checks across phases; every new mechanic gets failable checks, including the brief's exact voice-note tagging example).
2. DevTools MCP browser walkthrough at 390×844: screenshot key screens, exercise new interactions (drag, sheets, player circuit mode, check-ins), console clean.
3. Push phase commit to main; live raw.githack URL re-verified (marker string check).
4. HANDOFF.md updated per phase.

## Sources
- [Apple Newsroom — Liquid Glass](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/) · [iOS 26 design guidelines](https://www.learnui.design/blog/ios-design-guidelines-templates.html) · [Liquid Glass usability](https://letsdev.de/en/blog/ios-26-in-detail-liquid-glass-ui-between-usability-and-accessibility.php)
- [Duolingo streak research](https://blog.duolingo.com/how-duolingo-streak-builds-habit/) · [Streak mechanics teardown](https://duolingo.deconstructoroffun.com/mechanics/streaks) · [Freeze psychology](https://www.justanotherpm.com/blog/the-psychology-behind-duolingos-streak-feature)
- [Juice & Toya 20-min KB structure](https://www.coachweb.com/workouts/kettlebell-workouts/build-upper-body-muscle-in-20-minutes-with-one-kettlebell) · [J&T Kettlebell programs](https://my.playbookapp.io/juice-toya/programs/Kettlebell-Workouts/3001)
- [SortableJS](https://github.com/SortableJS/Sortable)
