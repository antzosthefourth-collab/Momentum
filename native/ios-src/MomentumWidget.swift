// MomentumWidget.swift — WidgetKit extension. Reads the JSON the web app already
// writes via WidgetsBridgePlugin into the app group (group.com.raddad.momentum).
import WidgetKit
import SwiftUI

struct Payload: Decodable {
    struct Hero: Decodable { let name: String; let lvl: Int; let tier: String; let pct: Int; let streak: Int }
    struct Habits: Decodable { let done: Int; let total: Int }
    let hero: Hero; let habits: Habits?
}
func loadPayload() -> Payload? {
    guard let ud = UserDefaults(suiteName: "group.com.raddad.momentum"),
          let s = ud.string(forKey: "momentum_widgets"),
          let d = s.data(using: .utf8) else { return nil }
    return try? JSONDecoder().decode(Payload.self, from: d)
}
struct Entry: TimelineEntry { let date: Date; let p: Payload? }
struct Provider: TimelineProvider {
    func placeholder(in: Context) -> Entry { Entry(date: .now, p: nil) }
    func getSnapshot(in: Context, completion: @escaping (Entry) -> Void) { completion(Entry(date: .now, p: loadPayload())) }
    func getTimeline(in: Context, completion: @escaping (Timeline<Entry>) -> Void) {
        completion(Timeline(entries: [Entry(date: .now, p: loadPayload())],
                            policy: .after(.now.addingTimeInterval(1800))))
    }
}
struct MomentumWidgetView: View {
    let entry: Entry
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if let p = entry.p {
                Text("🔥 \(p.hero.streak)").font(.system(.title2, design: .monospaced)).bold()
                Text("LVL \(p.hero.lvl) · \(p.hero.tier)").font(.caption)
                ProgressView(value: Double(p.hero.pct) / 100)
                if let h = p.habits { Text("habits \(h.done)/\(h.total)").font(.caption2).opacity(0.7) }
            } else { Text("Open Momentum").font(.caption) }
        }
        .padding()
        .containerBackground(Color(red: 0.07, green: 0.06, blue: 0.08), for: .widget)
        .foregroundStyle(.white)
    }
}
@main
struct MomentumWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "MomentumWidget", provider: Provider()) { MomentumWidgetView(entry: $0) }
            .configurationDisplayName("Momentum")
            .description("Streak, level and habits at a glance.")
            .supportedFamilies([.systemSmall, .systemMedium])
    }
}
