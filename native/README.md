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
