# Momentum native wrapper — build steps
1. `npm run setup` (installs Capacitor, creates ios/, syncs ../momentum-deploy)
2. Xcode: open `ios/App/App.xcworkspace`
3. Add `ios-src/MomentumNativePlugin.swift` to the App target; register the plugin
   (Capacitor 6: it self-registers via CAPBridgedPlugin).
4. Copy `ios-src/native-bridge.js` into momentum-deploy/ and add
   `<script src="native-bridge.js" defer></script>` to index.html for the app build.
5. Capabilities: HealthKit · App Groups (`group.com.raddad.momentum`) · add
   `Info.plist.additions.xml` strings.
6. New target → Widget Extension → replace with `ios-src/MomentumWidget.swift`,
   add the same App Group. Install `capacitor-widgetsbridge-plugin` (the web app
   already calls it).
7. Archive → App Store Connect. Privacy label: Data Not Collected.
Full context: ../ROLLOUT.md

## Cloud builds (the decided path — Codemagic, free tier)
`codemagic.yaml` at repo root builds and ships to TestFlight on Codemagic's
hosted Macs (free: 500 macOS minutes/month). Setup once at codemagic.io:
connect the GitHub repo, add an App Store Connect API key as integration
`momentum_asc_key`, enable iOS code signing. Every push to main can then build.

## Widgets & Apple Watch
- `MomentumWidget.swift`: Home Screen (small/medium) + Lock Screen/StandBy
  (accessoryCircular/Rectangular/Inline). Reads app group `group.com.raddad.momentum`.
- `WatchBridge.swift` (iPhone target): relays the payload to the watch over
  WCSession — watch does not share the phone's app group.
- `MomentumWatchWidget.swift` (watchOS widget target): face complications
  (circular gauge with streak, corner, rectangular, inline).
- One-time target creation (widget ext + watch app + watch widget ext) happens
  in Xcode — MacinCloud hourly or any borrowed Mac, ~30 min — then the targets
  live in the committed pbxproj and Codemagic builds them forever after.
