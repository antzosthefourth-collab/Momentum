# MOMENTUM — Session Handoff
*Training + life OS · single-file web app → iOS via Capacitor · **v22.8 LIVE** · July 19, 2026*

## ⚡ START HERE — state of the world
**Live URL (canonical):** https://antzosthefourth-collab.github.io/Momentum/momentum-deploy/
Everything is on `main`; working copy in-session was `/root/momentum/index.html`, deployed copy is `momentum-deploy/index.html` in this repo. Deploy = commit + push to main (Pages auto-publishes, ~1 min). **The app self-updates now** — versioned SW cache, update-check on every open, More → 🔄 Update app for stubborn caches, version stamp under More → App version. Never debug a user report without first confirming their stamp matches the latest release.

**Owner context:** Tony (ant.zos.thefourth@gmail.com). Tokens in `/root/.secrets/github-momentum` (fine-grained PAT for this repo, **expires ~2026-07-23** — renew or the deploy loop dies). One-shot push URL only, mask output, never persist credentials. Higgsfield MCP connected (~28 credits) for character art.

## Version history this arc (v22.3 → v22.8)
- **v22.3** — plan self-heals: coach profile + no plan → auto-`makePlan` on boot (survey can't end in an empty Plan tab).
- **v22.4** — stale-proofing: `APP_VERSION` stamp, SW `no-cache` doc revalidation, controllerchange auto-reload-once, Update-app button.
- **v22.5** — owlbear background-free cutouts (`hero-owl-*-cut.png`, rembg/u2net local pipeline): Today corner + composed previews + variant thumbnails use cutouts; Stats hero keeps the full painted scene. Multi-select training styles: rep schemes split across mains heavy→volume (`applyStyle` takes an array, `STYLE_ORDER`), circuit+rep = "+ HIIT Finish" 3-move burst, names like "Strength + Hypertrophy Day".
- **v22.6** — **lifter shorthand in the journal** (GymNote+ takeaway, see `gymnote-review.md` in session workspace): `parseSetNotes` (deterministic, on-device) reads `bench 225 - 8,8,6`, `3x5 @ 315`, `60kg x5/5/4`, bodyweight lists; inline confirm sheet (`openSetConfirm`); `S.aliases` learns nickname→library-move forever; writes `S.setLog` + PR + XP.
- **v22.7** — **inline set tracking on Today**: `.td-setrow` under every set-based movement in expanded workouts (weight + per-set reps, prefilled today, ghosted last time), realtime debounced save (`commitTodayRow`), PR fires live. `＋ Add exercise` chip inside expanded workouts (`openExAdd`). **Split persistence**: `persistActEdit` writes add/remove/swap/reorder back to `S.plan.templates[tpl].names` — future same-split days inherit. Glass polish: sec-labels = frosted pills, single crisp shadows replace triple halos.
- **v22.8** — "Your numbers" removed from More (set tracking feeds `S.profile.lifts`/`S.logs` automatically; interview still seeds day-one loads). QA pass: debounce flush-on-row-switch + commit-on-blur (no lost entries), best + ~e1RM (Epley) insight line in set rows, `enterkeyhint` on grid inputs, hero nameplate scrim (white ink over gradient — readable on any scene art), `go()` hardened against unknown page ids.

## Architecture pointers (index.html, single file)
State `S` → localStorage `mo_state`; `save()` also pushes widgets. Key ledgers: `S.setLog[move]=[{d,t,sets:[{w,r}]}]` (30-entry cap, today-replace semantics), `S.logs` (last weight), `S.aliases` (shorthand dialect), `S.plan.templates` (split truth — edits persist here), `S.daySys` (Life Score baseline). Page ids: `today, home(=Stats/hero), train, plan, mem, lib, more`. Render chain on Today is per-card try/catch with visible "⚠️ This card hit an error" diagnostics — a screenshot names the broken renderer.

**Test loop used all session (keep it):** syntax-check every edit (`node -e` per `<script>` block via `new Function`), then Playwright headless (`/opt/pw-browsers/chromium_headless_shell-1194/...`, seed state via `addInitScript`, `python3 -m http.server 8899`) — behavior asserts + screenshots before every deploy.

## Next steps (ordered)
1. **Ship execution (owner-gated):** Apple Developer account → Codemagic (free mac_mini_m2 tier, `codemagic.yaml` ready, needs `momentum_asc_key` integration) → one Xcode session for widget/watch targets. See `ROLLOUT.md`, `native/README.md`, `WIDGETS.md`. Renew/revoke the PAT (expires ~07-23).
2. **Strength analytics on Stats** (data already in `S.setLog`): e1RM trend line per lift, combined weight+reps chart, weekly hard-sets-per-muscle bar vs the 12–20 band — then feed the gap back into plan suggestions ("Chest at 9 sets — Thursday adds 4").
3. **Backlog import**: paste-box in More reusing `parseSetNotes` + date recognition ("Monday", "6/12") to mint historical sessions/memories — warms Life Score baseline for new users.
4. **CSV/TXT export** beside the JSON backup (data-ownership story).
5. **Owlbear cub emotes** via Higgsfield (tap hoot / complete / epic Silver-Eye glow, ~6 credits, model-sheet expression panel as reference); species treatment for viking/buddy/rose later ("good to leave for now" per owner).
6. **Optional UX candy:** auto-check a movement when all its set cells are filled (deliberately skipped — decide with owner); voice notes → `parseSetNotes` (already works via keyboard mic, worth advertising in the tour).
