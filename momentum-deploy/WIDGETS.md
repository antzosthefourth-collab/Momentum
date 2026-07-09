# MOMENTUM — App Store & Home Screen Widgets (handoff)

## 1. App Store path (your known pipeline)
Same route as Glissé: **Capacitor + Codemagic**, no Mac needed for the app itself.

```bash
npm init -y && npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/haptics
npx cap init Momentum com.raddad.momentum --web-dir=www
mkdir www && cp index.html *.png www/
npx cap add ios
```
**v5 note:** `@capacitor/haptics` powers real taptic feedback — `buzz()` in index.html
already detects `Capacitor.Plugins.Haptics` and uses impact styles; web falls back to
`navigator.vibrate`. Copy ALL png assets into `www/` (theme backdrops load local-first).
Push to GitHub → Codemagic iOS workflow → TestFlight. The app is fully offline
(localStorage), so no backend, no privacy-nutrition surprises beyond "data not
collected." Embedded Spotify/YouTube iframes require adding those domains to
`allowNavigation` in `capacitor.config.json` if you want them inside the app shell.

## 2. Widget bridge — ALREADY WIRED in index.html
Every save, timer start/stop, habit check, and plan change calls `pushWidgets()`,
which writes a JSON payload to:
- `localStorage["momentum_widgets"]` (web fallback / debugging)
- Shared App Group storage via `WidgetsBridgePlugin` when running in Capacitor,
  group id **`group.com.raddad.momentum`**, then reloads widget timelines.

Payload shape:
```json
{
  "updated": 1720000000000,
  "hero":   { "name":"Tony", "lvl":7, "tier":"Consistent", "pct":42, "streak":12 },
  "today":  { "week":2, "type":"RUNF", "title":"Speed run", "icon":"⚡", "done":false, "note":"…" },
  "systems":[ { "key":"strength", "name":"STRENGTH", "lvl":5, "pct":63 }, … 6 total ],
  "timer":  { "label":"REST", "endsAt": 1720000090000 },
  "habits": { "done":3, "total":6 }
}
```
Install the JS side when you Capacitor-ize: `npm i capacitor-widgetsbridge-plugin`.
The app already guards for its absence, so nothing breaks on the web.

## 3. Native side — the honest part
iOS Home Screen widgets are **WidgetKit (Swift)** — they cannot be HTML. You need
a small widget-extension target added to the Xcode project, sharing the App Group.
Codemagic builds it fine once it exists; *adding* the target is the one step that
realistically wants Xcode (options: MacinCloud hourly rental once, a friend's Mac
for 30 minutes, or scripted pbxproj editing — rental is the sane one).

Minimal widget reading the shared payload (today + levels):

```swift
import WidgetKit
import SwiftUI

struct MoData: Decodable {
  struct Hero: Decodable { let name:String; let lvl:Int; let tier:String; let streak:Int }
  struct Today: Decodable { let title:String; let icon:String; let done:Bool }
  struct Sys: Decodable { let name:String; let lvl:Int; let pct:Int }
  let hero:Hero; let today:Today?; let systems:[Sys]
}
func load() -> MoData? {
  guard let ud = UserDefaults(suiteName:"group.com.raddad.momentum"),
        let raw = ud.string(forKey:"momentum_widgets"),
        let d = raw.data(using:.utf8) else { return nil }
  return try? JSONDecoder().decode(MoData.self, from:d)
}

struct Entry: TimelineEntry { let date = Date(); let data: MoData? }
struct Provider: TimelineProvider {
  func placeholder(in _: Context) -> Entry { Entry(data:load()) }
  func getSnapshot(in _: Context, completion: @escaping (Entry)->()) { completion(Entry(data:load())) }
  func getTimeline(in _: Context, completion: @escaping (Timeline<Entry>)->()) {
    completion(Timeline(entries:[Entry(data:load())], policy:.after(.now.addingTimeInterval(1800))))
  }
}

struct MoWidgetView: View {
  let e: Entry
  var body: some View {
    VStack(alignment:.leading, spacing:4) {
      if let t = e.data?.today {
        Text("TODAY").font(.caption2).foregroundStyle(.orange)
        Text("\(t.icon) \(t.title)\(t.done ? " ✓" : "")").font(.headline)
      }
      if let h = e.data?.hero {
        Text("LVL \(h.lvl) · \(h.tier) · 🔥\(h.streak)d").font(.caption)
      }
    }.containerBackground(.black, for: .widget)
  }
}

@main struct MoWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind:"MomentumToday", provider:Provider()) { MoWidgetView(e:$0) }
      .configurationDisplayName("Today's Session")
      .supportedFamilies([.systemSmall, .systemMedium])
  }
}
```
A second widget for the six system levels is the same pattern over `systems`
(medium/large family, six mini progress bars).

## 4. Timers on the Lock Screen (later)
A live countdown widget needs **ActivityKit (Live Activities)** — more native code
than the static widgets above. The payload already ships `timer.endsAt` exactly so
a Live Activity can render `Text(timerInterval:)` natively when you get there.
Sequence it: TestFlight the app first → static widgets → Live Activities.

## 5. Checklist
- [ ] Capacitor init + `www/index.html`
- [ ] `capacitor-widgetsbridge-plugin` installed
- [ ] App Group `group.com.raddad.momentum` enabled on app + widget targets (Apple Developer portal)
- [ ] Widget extension target added (one Mac session)
- [ ] Codemagic workflow includes both targets
