// Inject after Capacitor loads (e.g. in a <script> appended by cap sync, or
// add to momentum-deploy as native-bridge.js and reference from index.html in
// the iOS build only). Maps the plugin onto the app's expected contract.
(function(){
  const P = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.MomentumNative;
  if(!P) return;
  window.MomentumNative = {
    health: () => P.health(),
    place:  () => P.place().then(r => (r && r.name) ? r : null)
  };
})();
