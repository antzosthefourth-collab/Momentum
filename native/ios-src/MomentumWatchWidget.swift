// MomentumWatchWidget.swift — WidgetKit extension for the WATCH APP target.
// Complications: circular / rectangular / corner / inline on watch faces.
// Reads the payload relayed by WatchBridge into the watch's own app group.
import WidgetKit
import SwiftUI

struct WPayload: Decodable {
    struct Hero: Decodable { let lvl: Int; let streak: Int; let pct: Int }
    struct Habits: Decodable { let done: Int; let total: Int }
    let hero: Hero; let habits: Habits?
}
func wLoad() -> WPayload? {
    guard let ud = UserDefaults(suiteName: "group.com.raddad.momentum.watch"),
          let s = ud.string(forKey: "momentum_widgets"), let d = s.data(using: .utf8)
    else { return nil }
    return try? JSONDecoder().decode(WPayload.self, from: d)
}
struct WEntry: TimelineEntry { let date: Date; let p: WPayload? }
struct WProvider: TimelineProvider {
    func placeholder(in: Context) -> WEntry { WEntry(date: .now, p: nil) }
    func getSnapshot(in: Context, completion: @escaping (WEntry) -> Void) { completion(WEntry(date: .now, p: wLoad())) }
    func getTimeline(in: Context, completion: @escaping (Timeline<WEntry>) -> Void) {
        completion(Timeline(entries: [WEntry(date: .now, p: wLoad())], policy: .after(.now.addingTimeInterval(1800))))
    }
}
struct WView: View {
    let entry: WEntry
    @Environment(\.widgetFamily) var family
    var body: some View {
        let streak = entry.p?.hero.streak ?? 0, lvl = entry.p?.hero.lvl ?? 1
        switch family {
        case .accessoryCircular:
            Gauge(value: Double(entry.p?.hero.pct ?? 0), in: 0...100) { Text("🔥\(streak)") }
                .gaugeStyle(.accessoryCircularCapacity)
        case .accessoryCorner:
            Text("🔥\(streak)").widgetCurvesContent().widgetLabel("LVL \(lvl)")
        case .accessoryInline:
            Text("🔥 \(streak) · LVL \(lvl)")
        default:
            VStack(alignment: .leading) {
                Text("🔥 \(streak)-day streak").font(.headline)
                Text("LVL \(lvl)" + ((entry.p?.habits).map { " · habits \($0.done)/\($0.total)" } ?? "")).font(.caption2)
            }
        }
    }
}
@main
struct MomentumWatchWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "MomentumWatchWidget", provider: WProvider()) {
            WView(entry: $0).containerBackground(.black, for: .widget)
        }
        .configurationDisplayName("Momentum")
        .description("Streak and level on your wrist.")
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryCorner, .accessoryInline])
    }
}
