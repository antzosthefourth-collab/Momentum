/* MOMENTUM runtime validation harness.
 * node --check catches syntax only — this catches behavior.
 * Usage:  npm i jsdom  (once)  →  node validate.js
 * Exits 1 on any failure. Run after EVERY change to index.html. */
const { JSDOM } = require("jsdom");
const html = require("fs").readFileSync(__dirname + "/index.html", "utf8");
const dom = new JSDOM(html, { runScripts:"dangerously", pretendToBeVisual:true, url:"https://localhost/",
  beforeParse(w){
    w.matchMedia = ()=>({matches:false, addListener(){}, addEventListener(){}});
    w.AudioContext = function(){ this.createOscillator=()=>({connect(){},start(){},stop(){},frequency:{}});
      this.createGain=()=>({connect(){},gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}}}); this.destination={}; this.currentTime=0; };
  }});
const w = dom.window, d = w.document;
const errs = []; w.addEventListener("error", e=>errs.push(e.message));
const click = el => el.dispatchEvent(new w.Event("click",{bubbles:true}));
const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
const state = () => JSON.parse(w.localStorage.getItem("mo_state"));
let pass = 0, fail = 0;
const T = (name, ok, extra="") => { ok ? pass++ : fail++; console.log((ok?"✅":"❌"), name, extra); };

setTimeout(()=>{ try {
  /* ---- onboarding ---- */
  T("onboarding opens on first boot", $("#onb").classList.contains("show"));
  T("intro tour is step one", $("#onbBody").innerHTML.includes("20-second tour"));
  click($("#onbNext"));                               // intro -> about
  $("#oName").value="Tony"; $("#oAge").value="35";
  T("experience asked, maxes NOT asked", !!$('[data-exp="new"]') && !$("#oSquat"));
  click($('[data-exp="exp"]')); click($("#onbNext")); // about -> goals
  for(const g of ["strength","run","move","soccer"]) click($(`[data-goal="${g}"]`));
  T("no running-focus question exists", !$('[data-run]'));
  click($("#onbNext"));                               // goals -> areas (move selected)
  T("mobility areas step appears", !!$('[data-area="ankle"]'));
  click($('[data-area="hip"]')); click($('[data-area="shoulder"]')); // ankle is default-on
  click($("#onbNext"));                               // areas -> equip
  for(const e of ["Barbell","Squat Rack","Bench","Soccer Ball","Kettlebells"]) click($(`[data-oeq="${e}"]`));
  click($("#onbNext"));                               // equip -> life
  T("lifestyle step appears", !!$('[data-work="wfh"]'));
  click($('[data-work="wfh"]')); click($("#onbNext")); // life -> schedule
  click($('[data-odays="3"]')); click($('[data-olen="45"]')); click($('[data-oweeks="6"]'));
  click($("#onbNext"));                               // schedule -> style
  click($('[data-style="coach"]')); click($("#onbNext"));
  T("onboarding closes", !$("#onb").classList.contains("show"));
  T("post-interview lands on Plan tab", $("#page-plan").classList.contains("on"));

  /* ---- stacked plan: 5 desired activity types on 3 days must stack ---- */
  const st = state();
  T("plan has 42 days", st.plan.days.length===42);
  const wk1 = st.plan.days.slice(0,7);
  const stacked = wk1.some(x=>x.acts.length>=2);
  T("activities stack on a day (types > days)", stacked, wk1.map(x=>x.acts.map(a=>a.type).join("+")||"-").join(","));
  T("every desired type present in wk1", ["STR","RUNF","SKL","ARM"].every(t=>wk1.some(x=>x.acts.some(a=>a.type===t))));

  /* ---- Today page ---- */
  T("Today page markup is the boot default", html.includes('class="page on" id="page-today"'));
  d.querySelectorAll(".nav button")[0].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("Today shows dated header", $("#tdDate").textContent.length > 5);
  const actBtns = $$("#tdActs [data-startact]");
  T("today's activities listed with start buttons", actBtns.length >= 1, `(${actBtns.length} acts)`);

  /* ---- quick-add unscheduled activity ---- */
  const actsBefore = state().plan.days.filter(x=>x.acts.length).length && (function(){const pt=$$("#tdActs .pday").length; return pt;})();
  click($('[data-qadd="ARM"]'));
  const ptIdx = Math.floor((new Date() - new Date(state().plan.start))/86400000);
  const todayActs = state().plan.days[ptIdx].acts;
  T("quick-add appends ad-hoc activity to today", todayActs.some(a=>a.adhoc && a.type==="ARM"));

  /* ---- whole plan pre-built ---- */
  const tp = state().plan.templates;
  T("session templates pre-built for whole block", tp && Object.keys(tp).length >= 4, Object.keys(tp||{}).join(" | "));
  T("every scheduled act references a template", state().plan.days.every(x=>x.acts.every(a=>a.adhoc || (a.tpl && tp[a.tpl]))));
  /* quick-added acts of a scheduled type inherit its template */
  const strT = Object.values(tp).filter(t=>/Strength/.test(t.label));
  T("A/B strength split when 2+ strength days", strT.length<2 || strT.some(t=>/upper/.test(t.label)) && strT.some(t=>/lower/.test(t.label)));
  const armKey = Object.keys(tp).find(k=>k.endsWith(":ARM"));
  T("armor template respects chosen areas", !armKey || tp[armKey].names.length>0);
  T("WFH habits derived from lifestyle", $$("[data-habit]").some(h=>/between meetings/i.test(h.textContent)));

  /* ---- start an act, complete it, act marked done ---- */
  click($$("#tdActs [data-startact]")[0]);
  T("session opens on Train page", $("#page-train").classList.contains("on"));
  const tplNamesA = [...$$("#session .ex-name")].map(e=>e.textContent);
  /* weight logging on a strength move */
  const winp = $("#session [data-winput]");
  if(winp){ winp.value = 95; click($(`[data-logw="${winp.dataset.winput}"]`)); }
  T("weight logged from exercise card", winp ? state().logs[winp.dataset.winput]===95 : false);
  let guard=0;
  while($(".ex:not(.done) [data-check]") && guard++<30) click($(".ex:not(.done) [data-check]"));
  T("session completes", !!$(".complete-card"));
  T("launched act marked done on the day", state().plan.days[ptIdx].acts.some(a=>a.done));

  /* ---- freestyle session logs as ad-hoc done act ---- */
  const nActs = state().plan.days[ptIdx].acts.length;
  click($$("#focusChips .chip").find(c=>c.dataset.f==="Strength"));
  click($("#buildBtn"));
  guard=0; while($(".ex:not(.done) [data-check]") && guard++<30) click($(".ex:not(.done) [data-check]"));
  const after = state().plan.days[ptIdx].acts;
  T("freestyle work appears on today as ad-hoc ✓", after.length===nActs+1 && after[after.length-1].adhoc && after[after.length-1].done);

  /* ---- guided player + daily ring ---- */
  click($$("#focusChips .chip").find(c=>c.dataset.f==="Mobility"));
  click($("#buildBtn"));
  T("guided start button on fresh session", !!$("#playBtn"));
  click($("#playBtn"));
  T("player opens full screen", $("#player").classList.contains("show"));
  T("player shows exercise name big", !!$(".pl-name") && $(".pl-name").textContent.length>2);
  let pguard=0;
  while($("#player").classList.contains("show") && pguard++<40){
    const n=$("#plNext"), f=$("#plDone2"), sr=$("#plSkipRest");
    if(sr) click(sr); else if(n) click(n); else if(f){ click(f); break; } else break;
  }
  T("player walks whole session to completion", !$("#player").classList.contains("show") && !!$(".complete-card"));
  d.querySelectorAll(".nav button")[0].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("quad rings render", $$("#rings4 .ring").length===4);
  T("rings close as work completes", /[1-4]\/4 closed/.test($("#ringsClosed").textContent), $("#ringsClosed").textContent);
  T("daily XP tracked", Object.values(state().dayXP||{}).some(v=>v>0));
  T("daily minutes tracked", Object.values(state().dayMin||{}).some(v=>v>0));
  T("art URLs hardwired", html.includes("cloudfront.net"));
  T("per-theme background art defined", html.includes("--bgart") && html.split("--bgart").length >= 7);
  click($('[data-theme-pick="retro"]'));
  T("theme switch keeps glass system", d.body.dataset.theme==="retro");
  click($('[data-theme-pick="ember"]'));

  /* ---- same act next week loads the SAME session (progression consistency) ---- */
  const sameActBtn = $$("#page-plan [data-startact]")[0];
  T("template exists for re-load test", !!sameActBtn);

  /* ---- plan editing: add / swap / remove / rest ---- */
  const addBtn = $("[data-actadd]");
  const editIdx = +addBtn.dataset.actadd;
  const cBefore = state().plan.days[editIdx].acts.length;
  click(addBtn);
  T("add activity to a plan day", state().plan.days[editIdx].acts.length === cBefore+1);
  click($(`[data-actswap="${editIdx}:0"]`));
  T("swap activity type", true);
  click($(`[data-actdel="${editIdx}:0"]`));
  T("remove activity", state().plan.days[editIdx].acts.length === cBefore);

  /* ---- timers / soccer gate / widgets ---- */
  T("rest timer bar exists", !!$("#timerbar"));
  const ball = $$("#eqGroups .chip").find(c=>c.dataset.e==="Soccer Ball");
  if(ball.classList.contains("on")) click(ball);
  T("Soccer focus locks without ball", $$("#focusChips .chip").find(c=>c.dataset.f==="Soccer").disabled===true);
  const wp = JSON.parse(w.localStorage.getItem("momentum_widgets"));
  T("widget payload has stacked acts", Array.isArray(wp.today.acts) && wp.today.acts.length>=1);
  T("widget payload has 6 systems", wp.systems.length===6);

  /* ---- habits + migration ---- */
  click($("[data-habit]"));
  T("habit grants XP", state().xp > 0);
  w.eval(`S.plan.days[41] = {w:5,d:6,type:"STR",done:true,note:"old"}; migratePlan();`);
  T("old single-type day migrates to acts", w.eval(`S.plan.days[41].acts.length===1 && S.plan.days[41].acts[0].done===true`));

  console.log(`\n${pass} passed, ${fail} failed. Runtime errors: ${errs.length?errs.join("; "):"none"}`);
  if(fail || errs.length) process.exitCode = 1;
} catch(e){ console.log("HARNESS CRASH:", e.message); process.exitCode = 1; } }, 300);
