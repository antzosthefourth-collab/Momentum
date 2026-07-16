// MomentumNativePlugin.swift — Capacitor plugin fulfilling the window.MomentumNative
// contract (see ROLLOUT.md). Drop into the iOS app target, register per Capacitor docs.
import Capacitor
import HealthKit
import CoreLocation

@objc(MomentumNativePlugin)
public class MomentumNativePlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    public let identifier = "MomentumNativePlugin"
    public let jsName = "MomentumNative"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "health", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "place",  returnType: CAPPluginReturnPromise)
    ]
    let store = HKHealthStore()
    let loc = CLLocationManager()
    var placeCall: CAPPluginCall?

    @objc func health(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else { call.resolve([:]); return }
        let steps = HKQuantityType(.stepCount), dist = HKQuantityType(.distanceWalkingRunning)
        let daylight = HKQuantityType(.timeInDaylight)
        let sleep = HKCategoryType(.sleepAnalysis)
        store.requestAuthorization(toShare: [], read: [steps, dist, daylight, sleep]) { ok, _ in
            let cal = Calendar.current
            let start = cal.startOfDay(for: Date())
            let pred = HKQuery.predicateForSamples(withStart: start, end: Date())
            let group = DispatchGroup()
            var out: [String: Double] = [:]
            func sum(_ t: HKQuantityType, _ unit: HKUnit, _ key: String, scale: Double = 1) {
                group.enter()
                let q = HKStatisticsQuery(quantityType: t, quantitySamplePredicate: pred, options: .cumulativeSum) { _, r, _ in
                    out[key] = (r?.sumQuantity()?.doubleValue(for: unit) ?? 0) * scale; group.leave()
                }
                self.store.execute(q)
            }
            sum(steps, .count(), "steps")
            sum(dist, .mile(), "dist")
            sum(daylight, .minute(), "daylight")
            group.enter()  // sleep: sum asleep intervals that ENDED today (counts last night)
            let sq = HKSampleQuery(sampleType: sleep,
                predicate: HKQuery.predicateForSamples(withStart: cal.date(byAdding: .hour, value: -18, to: start), end: Date()),
                limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, _ in
                let secs = (samples as? [HKCategorySample] ?? [])
                    .filter { HKCategoryValueSleepAnalysis.allAsleepValues.map(\.rawValue).contains($0.value) }
                    .reduce(0.0) { $0 + $1.endDate.timeIntervalSince($1.startDate) }
                out["sleepH"] = (secs / 3600 * 10).rounded() / 10; group.leave()
            }
            self.store.execute(sq)
            group.notify(queue: .main) { call.resolve(out.mapValues { $0 as Any }) }
        }
    }

    @objc func place(_ call: CAPPluginCall) {
        placeCall = call
        loc.delegate = self
        loc.desiredAccuracy = kCLLocationAccuracyHundredMeters
        if loc.authorizationStatus == .notDetermined { loc.requestWhenInUseAuthorization() }
        loc.requestLocation()
    }
    public func locationManager(_ m: CLLocationManager, didUpdateLocations locs: [CLLocation]) {
        guard let l = locs.last, let call = placeCall else { return }
        CLGeocoder().reverseGeocodeLocation(l) { marks, _ in
            // ask-don't-guess: only a NAMED point of interest counts; else null
            if let name = marks?.first?.areasOfInterest?.first ?? marks?.first?.name,
               marks?.first?.areasOfInterest?.first != nil {
                call.resolve(["name": name, "kind": "poi"])
            } else { call.resolve([:]) }
            self.placeCall = nil
        }
    }
    public func locationManager(_ m: CLLocationManager, didFailWithError e: Error) {
        placeCall?.resolve([:]); placeCall = nil
    }
}
