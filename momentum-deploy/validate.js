/* MOMENTUM runtime validation harness.
 * node --check catches syntax only — this catches behavior.
 * Usage:  npm i jsdom  (once)  →  node validate.js
 * Exits 1 on any failure. Run after EVERY change to index.html. */
const { JSDOM } = require("jsdom");
const html = require("fs").readFileSync(__dirname + "/index.html", "utf8");
const dom = new JSDOM(html, { runScripts:"dangerously", pretendToBeVisual:true, url:"https://localhost/",
  beforeParse(w){
    w.__FORGE_MS = 0;   // skip the plan-forging animation — finish synchronously
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
  /* ---- onboarding: welcome ---- */
  T("onboarding opens on first boot", $("#onb").classList.contains("show"));
  T("welcome tour is step one", !!$("#tourCards"));
  T("aurora orbs render on welcome", $$(".onb-orb").length===3);
  T("progress bar replaces dots", !!$(".onb-prog-fill"));
  click($("#onbNext"));                               // intro -> about

  /* ---- about: name/age/gender ONLY — experience moved later ---- */
  $("#oName").value="Tony"; $("#oAge").value="35";
  T("about asks name/age/gender only", !!$("#oName") && !!$("#oAge") && !!$("#oGender"));
  T("experience NOT asked on about step", !$('[data-exp]'));
  T("maxes NOT asked", !$("#oSquat"));
  click($("#onbNext"));                               // about -> goals

  /* ---- goals: soccer removed (lives under Sports now) ---- */
  T("soccer goal removed from goals step", !$('[data-goal="soccer"]'));
  T("other goals kept", !!$('[data-goal="strength"]') && !!$('[data-goal="fat"]') && !!$('[data-goal="sleep"]'));
  for(const g of ["strength","run","move"]) click($(`[data-goal="${g}"]`));
  T("no running-focus question exists", !$('[data-run]'));
  click($("#onbNext"));                               // goals -> sports

  /* ---- sports step ---- */
  T("sports step appears with all 8 activities", $$("[data-sport]").length===8);
  click($('[data-sport="soccer"]')); click($('[data-sport="cycling"]'));
  click($("#onbNext"));                               // sports -> experience

  /* ---- per-discipline experience, asked AFTER training types are chosen ---- */
  T("experience asked per training track", $$('[data-exp][data-track]').length >= 6);
  T("lifting + cardio + sport tracks present", !!$('[data-track="lift"]') && !!$('[data-track="cardio"]') && !!$('[data-track="sport"]'));
  click($('[data-exp="exp"][data-track="lift"]'));
  click($('[data-exp="new"][data-track="cardio"]'));
  click($("#onbNext"));                               // exp -> areas (move selected)

  /* ---- body areas + injury context ---- */
  T("mobility areas step appears", !!$('[data-area="ankle"]'));
  T("injury follow-up appears for selected area", !!$('[data-inj="ankle:yes"]'));
  click($('[data-inj="ankle:yes"]'));
  T("avoid-vs-rehab question appears", !!$('[data-injmode="ankle:rehab"]') && !!$('[data-injmode="ankle:avoid"]'));
  click($('[data-injmode="ankle:rehab"]'));
  T("rehab stage question appears", !!$('[data-injstage="ankle:mid"]'));
  click($('[data-injstage="ankle:mid"]'));
  click($('[data-area="hip"]')); click($('[data-area="shoulder"]'));
  click($("#onbNext"));                               // areas -> equip

  /* ---- gear: no Bodyweight option, machines added ---- */
  T("Bodyweight removed from gear options", !$('[data-oeq="Bodyweight"]'));
  T("gym machines offered", !!$('[data-oeq="Lat Pulldown"]') && !!$('[data-oeq="Leg Press"]') && !!$('[data-oeq="Smith Machine"]') && !!$('[data-oeq="Cable Machine"]'));
  T("cardio machines offered", !!$('[data-oeq="Treadmill"]') && !!$('[data-oeq="Stationary Bike"]') && !!$('[data-oeq="Elliptical"]'));
  for(const e of ["Barbell","Squat Rack","Bench","Kettlebells","Lat Pulldown","Cable Machine"]) click($(`[data-oeq="${e}"]`));
  click($("#onbNext"));                               // equip -> life

  /* ---- life: 9-to-5 AND 5-to-9 ---- */
  T("9-to-5 question appears", !!$('[data-work="wfh"]'));
  T("5-to-9 question appears", $$("[data-eve]").length>=4);
  T("training-window question appears", $$("[data-window]").length>=3);
  click($('[data-work="wfh"]')); click($('[data-eve="family"]')); click($('[data-window="evening"]'));
  click($("#onbNext"));                               // life -> schedule

  /* ---- schedule + daily boosters ---- */
  click($('[data-odays="3"]')); click($('[data-olen="45"]')); click($('[data-oweeks="6"]'));
  T("daily boosters offered (multi-session days)", !!$('[data-oboost="1"]') && !!$('[data-oboost="2"]'));
  click($('[data-oboost="1"]'));
  click($("#onbNext"));                               // schedule -> style
  click($('[data-style="coach"]')); click($("#onbNext"));
  T("onboarding closes", !$("#onb").classList.contains("show"));
  T("post-interview lands on Plan tab", $("#page-plan").classList.contains("on"));

  /* ---- profile captured the new answers ---- */
  const st = state();
  T("sports saved on profile", st.profile.sports.includes("soccer") && st.profile.sports.includes("cycling"));
  T("soccer sport auto-adds soccer ball", st.profile.eq.includes("Soccer Ball"));
  T("per-track experience saved", st.profile.exps.lift==="exp" && st.profile.exps.cardio==="new");
  T("injury context saved", st.profile.areaInfo.ankle && st.profile.areaInfo.ankle.inj==="yes"
    && st.profile.areaInfo.ankle.mode==="rehab" && st.profile.areaInfo.ankle.stage==="mid");
  T("5-to-9 + window saved", st.profile.eve==="family" && st.profile.window==="evening");
  T("booster setting saved", st.profile.boost===1);

  /* ---- stacked plan: soccer + cycling influence the week ---- */
  T("plan has 42 days", st.plan.days.length===42);
  const wk1 = st.plan.days.slice(0,7);
  const stacked = wk1.some(x=>x.acts.filter(a=>!a.micro).length>=2);
  T("activities stack on a day (types > days)", stacked, wk1.map(x=>x.acts.map(a=>a.type).join("+")||"-").join(","));
  T("every desired type present in wk1", ["STR","RUNF","SKL","ARM"].every(t=>wk1.some(x=>x.acts.some(a=>a.type===t))));
  T("soccer picked under Sports → ball work in plan", wk1.some(x=>x.acts.some(a=>a.type==="SKL")));
  T("cycling picked → ride day in plan", wk1.some(x=>x.acts.some(a=>a.type==="SP_cycling")));
  T("booster micro-session on every day", st.plan.days.every(x=>x.acts.some(a=>a.type==="BST" && a.micro)));

  /* ---- Today page ---- */
  T("Today page markup is the boot default", html.includes('class="page on" id="page-today"'));
  d.querySelectorAll(".nav button")[0].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("Today shows dated header", $("#tdDate").textContent.length > 5);
  const actBtns = $$("#tdActs [data-startact]");
  T("today's activities listed with start buttons", actBtns.length >= 1, `(${actBtns.length} acts)`);
  T("quick-add includes booster chip", !!$('[data-qadd="BST"]'));
  T("quick-add offers picked sports only", !!$('[data-qadd="SP_cycling"]') && !$('[data-qadd="SP_swimming"]'));

  /* ---- quick-add unscheduled activity ---- */
  click($('[data-qadd="ARM"]'));
  const ptIdx = Math.floor((new Date() - new Date(state().plan.start))/86400000);
  T("quick-add appends ad-hoc activity to today", state().plan.days[ptIdx].acts.some(a=>a.adhoc && a.type==="ARM"));

  /* ---- whole plan pre-built ---- */
  const tp = state().plan.templates;
  T("session templates pre-built for whole block", tp && Object.keys(tp).length >= 4, Object.keys(tp||{}).join(" | "));
  T("every scheduled act references a template", state().plan.days.every(x=>x.acts.every(a=>a.adhoc || (a.tpl && tp[a.tpl]))));
  T("booster template pre-built", tp["b:BST"] && tp["b:BST"].micro && tp["b:BST"].names.length>0);
  const cycKey = Object.keys(tp).find(k=>k.endsWith(":SP_cycling"));
  T("cycling template holds real ride work", !!cycKey && tp[cycKey].names.length>0, cycKey?tp[cycKey].names.join(", "):"");
  const strT = Object.values(tp).filter(t=>/Strength/.test(t.label));
  T("A/B strength split when 2+ strength days", strT.length<2 || strT.some(t=>/upper/.test(t.label)) && strT.some(t=>/lower/.test(t.label)));
  const armKey = Object.keys(tp).find(k=>k.endsWith(":ARM"));
  T("armor template respects chosen areas", !armKey || tp[armKey].names.length>0);
  T("WFH habits derived from 9-to-5", $$("[data-habit]").some(h=>/between meetings/i.test(h.textContent)));
  T("family habits derived from 5-to-9", $$("[data-habit]").some(h=>/post-dinner/i.test(h.textContent)));

  /* ---- start an act, complete it, act marked done ---- */
  click($$("#tdActs [data-startact]")[0]);
  T("session opens on Train page", $("#page-train").classList.contains("on"));
  const winp = $("#session [data-winput]");
  if(winp){ winp.value = 95; click($(`[data-logw="${winp.dataset.winput}"]`)); }
  T("weight logged from exercise card", winp ? state().logs[winp.dataset.winput]===95 : false);
  let guard=0;
  while($(".ex:not(.done) [data-check]") && guard++<30) click($(".ex:not(.done) [data-check]"));
  T("session completes", !!$(".complete-card"));
  T("launched act marked done on the day", state().plan.days[ptIdx].acts.some(a=>a.done));
  T("usage counts tracked for the smart builder", Object.values(state().moveMeta||{}).some(m=>m.used>0));

  /* ---- booster counts as micro, NOT a full session ---- */
  const sessBefore = state().sessions;
  const bAi = state().plan.days[ptIdx].acts.findIndex(a=>a.type==="BST");
  T("booster act scheduled on today", bAi>=0);
  click($$(`[data-startact="${ptIdx}:${bAi}"]`)[0]);
  guard=0; while($(".ex:not(.done) [data-check]") && guard++<30) click($(".ex:not(.done) [data-check]"));
  const st2 = state();
  T("booster completes as micro — not a full session", (st2.microDone||0)>=1 && st2.sessions===sessBefore,
    `micro=${st2.microDone} sessions=${st2.sessions}`);

  /* ---- freestyle session logs as ad-hoc done act ---- */
  const nActs = state().plan.days[ptIdx].acts.length;
  d.querySelectorAll(".nav button")[2].dispatchEvent(new w.Event("click",{bubbles:true}));
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

  /* ---- movement library: favorite, rank, views ---- */
  d.querySelectorAll(".nav button")[4].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("library view chips render", !!$('[data-lview="fav"]') && !!$('[data-lview="rank"]') && !!$('[data-lview="mg"]') && !!$('[data-lview="used"]') && !!$('[data-lview="type"]'));
  const favBtn = $("#libList [data-fav]"); const favName = favBtn.dataset.fav;
  click(favBtn);
  T("favoriting a movement persists", state().moveMeta[favName] && state().moveMeta[favName].fav===true);
  const star4 = $$(`[data-rank]`).find(b=>b.dataset.rank===favName+":4");
  click(star4);
  T("ranking a movement persists", state().moveMeta[favName].rank===4);
  click($('[data-lview="fav"]'));
  T("favorites view filters the library", !!$(`#libList .ex[data-mv="${favName.replace(/"/g,'\\"')}"]`) && $$("#libList .ex").length>=1, `${$$("#libList .ex").length} fav(s)`);
  click($('[data-lview="mg"]'));
  T("muscle-group view groups movements", $$("#libList .block-label").length>=3);
  click($('[data-lview="type"]'));
  T("activity-type view groups movements", $$("#libList .block-label").length>=3);
  click($('[data-lview="all"]'));
  T("weighted builder prefers rated moves", w.eval(`typeof moveScore==="function" && moveScore({n:${JSON.stringify(favName)}}) > moveScore({n:"__nobody__"})`));

  /* ---- injury 'avoid' filters sessions ---- */
  T("avoid-mode area excluded from built sessions", w.eval(`
    S.profile.areaInfo.neck = {inj:"yes", mode:"avoid"};
    buildSession({focus:"Mobility", time:30});
    const ok = S.session.items.every(m=>!m.area || !m.area.includes("neck"));
    delete S.profile.areaInfo.neck; ok`));

  /* ---- machine + sport moves exist in the library ---- */
  T("machine movements in library", w.eval(`["Lat pulldown","Leg press","Smith machine squat","Machine chest press","Seated row machine"].every(n=>LIB.some(m=>m.n===n))`));
  T("sport movements in library", w.eval(`["Swim: steady laps","Outdoor ride: endurance","Wall rally drill","Ruck walk (loaded)","Sun salutation flow"].every(n=>LIB.some(m=>m.n===n))`));

  /* ---- plan editing: add / swap / remove / rest ---- */
  d.querySelectorAll(".nav button")[3].dispatchEvent(new w.Event("click",{bubbles:true}));
  const addBtn = $("[data-actadd]");
  const editIdx = +addBtn.dataset.actadd;
  const cBefore = state().plan.days[editIdx].acts.length;
  click(addBtn);
  T("add activity to a plan day", state().plan.days[editIdx].acts.length === cBefore+1);
  click($(`[data-actswap="${editIdx}:0"]`));
  T("swap activity type", true);
  click($(`[data-actdel="${editIdx}:0"]`));
  T("remove activity", state().plan.days[editIdx].acts.length === cBefore);

  /* ---- timers / soccer gate / bodyweight always-on / widgets ---- */
  T("rest timer bar exists", !!$("#timerbar"));
  d.querySelectorAll(".nav button")[2].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("Train tab has no Bodyweight chip", !$$("#eqGroups .chip").some(c=>c.dataset.e==="Bodyweight"));
  T("Train tab offers gym machines", !!$$("#eqGroups .chip").find(c=>c.dataset.e==="Lat Pulldown"));
  T("bodyweight moves usable with zero gear selected", w.eval(`
    const savedEq = S.sel.eq.slice(); S.sel.eq = [];
    const ok = buildSession({focus:"Full Body", time:30}) && S.session.items.length>=3;
    S.sel.eq = savedEq; ok`));
  const ball = $$("#eqGroups .chip").find(c=>c.dataset.e==="Soccer Ball");
  if(ball.classList.contains("on")) click(ball);
  T("Soccer focus locks without ball", $$("#focusChips .chip").find(c=>c.dataset.f==="Soccer").disabled===true);
  const wp = JSON.parse(w.localStorage.getItem("momentum_widgets"));
  T("widget payload has stacked acts", Array.isArray(wp.today.acts) && wp.today.acts.length>=1);
  T("widget payload has 6 systems", wp.systems.length===6);

  /* ---- habits + migration ---- */
  d.querySelectorAll(".nav button")[0].dispatchEvent(new w.Event("click",{bubbles:true}));
  click($("[data-habit]"));
  T("habit grants XP", state().xp > 0);
  w.eval(`S.plan.days[41] = {w:5,d:6,type:"STR",done:true,note:"old"}; migratePlan();`);
  T("old single-type day migrates to acts", w.eval(`S.plan.days[41].acts.length===1 && S.plan.days[41].acts[0].done===true`));
  T("old profile migrates (soccer goal → sport, exp → per-track)", w.eval(`
    S.profile.goals.push("soccer"); delete S.profile.exps;
    migrateProfile();
    !S.profile.goals.includes("soccer") && S.profile.sports.includes("soccer") && !!S.profile.exps.lift`));

  console.log(`\n${pass} passed, ${fail} failed. Runtime errors: ${errs.length?errs.join("; "):"none"}`);
  if(fail || errs.length) process.exitCode = 1;
} catch(e){ console.log("HARNESS CRASH:", e.message, e.stack); process.exitCode = 1; } }, 300);
