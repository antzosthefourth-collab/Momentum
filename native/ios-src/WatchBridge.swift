// WatchBridge.swift — iPhone side. Relays the widget payload to Apple Watch.
// Instantiate once in AppDelegate: `WatchBridge.shared.start()`.
// Watch app groups are NOT shared with the phone, so the payload hops over
// WCSession whenever the web app updates it.
import WatchConnectivity

class WatchBridge: NSObject, WCSessionDelegate {
    static let shared = WatchBridge()
    func start() {
        guard WCSession.isSupported() else { return }
        WCSession.default.delegate = self
        WCSession.default.activate()
        // observe the app-group value the web app writes via WidgetsBridgePlugin
        NotificationCenter.default.addObserver(forName: UserDefaults.didChangeNotification,
                                               object: nil, queue: .main) { _ in self.push() }
        push()
    }
    func push() {
        guard WCSession.default.activationState == .activated,
              let s = UserDefaults(suiteName: "group.com.raddad.momentum")?.string(forKey: "momentum_widgets")
        else { return }
        try? WCSession.default.updateApplicationContext(["momentum_widgets": s])
    }
    func session(_ s: WCSession, activationDidCompleteWith st: WCSessionActivationState, error: Error?) { push() }
    func sessionDidBecomeInactive(_ s: WCSession) {}
    func sessionDidDeactivate(_ s: WCSession) {}
}

// ---- Watch side (watchOS app target) ----
// class PhoneListener: NSObject, WCSessionDelegate — on
// didReceiveApplicationContext, write the JSON string into the WATCH app
// group (group.com.raddad.momentum.watch) and call
// WidgetCenter.shared.reloadAllTimelines(). MomentumWatchWidget.swift reads it.
