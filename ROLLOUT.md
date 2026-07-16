# Momentum — App Rollout Guide (v18)

## What ships today (no app store needed)
The deployed site is now a full **PWA**: on iPhone, Safari → Share → **Add to Home
Screen** installs Momentum with its own icon, standalone full-screen chrome, and
**complete offline support** (service worker `sw.js`: app shell network-first so
updates land, art/audio cache-first). All data stays in on-device storage as before.

## iOS wrapper (Capacitor) — for HealthKit + location
The web app already speaks to native through two seams:

1. **Widgets:** `pushWidgets()` writes `momentum_widgets` JSON via
   `WidgetsBridgePlugin` (group `group.com.raddad.momentum`). Already wired.
2. **`window.MomentumNative` (v18 contract):** if the wrapper injects this object,
   the app auto-syncs — no other JS changes needed:
   ```js
   window.MomentumNative = {
     // Today's numbers from HealthKit. Called on launch + every foreground.
     health: async () => ({ steps: 8412, sleepH: 7.4, daylight: 35, dist: 2.1 }),
     // Current significant place (gym, trail), or null. Used to auto-create
     // Place memories when a session completes.
     place: async () => ({ name: "IronWorks Gym", kind: "gym" })
   };
   ```
   XP crediting, caps, and the "Synced from Apple Health" UI all run app-side.

### Wrapper steps
1. `npm i @capacitor/core @capacitor/cli && npx cap init Momentum com.raddad.momentum`
2. Point `webDir` at `momentum-deploy/`, `npx cap add ios`.
3. HealthKit: add capability + `NSHealthShareUsageDescription`. Read types:
   stepCount, distanceWalkingRunning, sleepAnalysis, timeInDaylight, activeEnergy.
   Implement `MomentumNative.health` in a tiny WKScriptMessageHandler shim or use
   `capacitor-health`; map to `{steps, sleepH, daylight, dist}`.
4. Location: `@capacitor/geolocation` + `NSLocationWhenInUseUsageDescription`;
   reverse-geocode significant stops (visit monitoring) → `MomentumNative.place`.
   Ask-don't-guess: only named POIs, else null.
5. Voices: the HD (Kokoro) voices work in WKWebView unchanged (WASM). Device-voice
   picker will list AVSpeechSynthesis voices exposed to the webview.

### App Store checklist
- Privacy nutrition label: **Data Not Collected** (no server, no analytics —
  matches the in-app Private-by-design screen). Health data never leaves device.
- Screenshots: Today (rings+life score), Train (session), Stats (hero scene),
  Memories, More (privacy card).
- Icons already generated: `icon-512.png` (maskable), `apple-touch-icon.png`.
- Review notes: offline-first single-page app; no account; purchases: none.

### Emotes/art pipeline
See `momentum-deploy/HANDOFF.md` (v15 section) — blocked on Higgsfield credits.
