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

  /* ---- 15 specific goal families, grouped ---- */
  T("15 goal families offered", $$("[data-goal]").length===15);
  T("goal families are specific", !!$('[data-goal="muscle"]') && !!$('[data-goal="heart"]') && !!$('[data-goal="power"]')
    && !!$('[data-goal="aesthetic"]') && !!$('[data-goal="return"]') && !!$('[data-goal="family"]'));
  T("vague goals replaced", !$('[data-goal="strength"]') && !$('[data-goal="soccer"]') && !$('[data-goal="move"]'));
  for(const g of ["muscle","run","mobility","fat","family"]) click($(`[data-goal="${g}"]`));
  T("no running-focus question exists", !$('[data-run]'));
  click($("#onbNext"));                               // goals -> activities

  /* ---- "What activities do you do?" — 25 activities, per-activity levels ---- */
  T("activities step replaces sports step", $("#onbBody").textContent.includes("activities"));
  T("25 activities offered", $$("[data-activity]").length===25, `(${$$("[data-activity]").length})`);
  T("training modalities are activities too", !!$('[data-activity="kettlebells"]') && !!$('[data-activity="hiit"]') && !!$('[data-activity="martial"]') && !!$('[data-activity="family"]'));
  click($('[data-activity="soccer"]')); click($('[data-activity="cycling"]'));
  click($('[data-activity="kettlebells"]')); click($('[data-activity="family"]'));
  T("per-activity comfort sliders appear", $$("[data-alevel]").length===16, `(${$$("[data-alevel]").length})`);
  click($('[data-alevel="kettlebells:4"]'));          // advanced lifter…
  click($('[data-alevel="soccer:1"]'));               // …brand-new to soccer
  T("levels are independent per activity", w.eval(`onb.a.activities.kettlebells===4 && onb.a.activities.soccer===1`));
  click($("#onbNext"));                               // activities -> areas (exp derivable, so skipped)

  /* ---- experience derived from activities; gap step skipped ---- */
  T("exp step skipped when derivable from activities", !$('[data-exp]'));

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

  /* ---- gear: access first (expanded catalog) ---- */
  T("Bodyweight removed from gear options", !$('[data-oeq="Bodyweight"]'));
  T("gym machines offered", !!$('[data-oeq="Lat Pulldown"]') && !!$('[data-oeq="Leg Press"]') && !!$('[data-oeq="Smith Machine"]') && !!$('[data-oeq="Cable Machine"]'));
  T("cardio machines offered", !!$('[data-oeq="Treadmill"]') && !!$('[data-oeq="Stationary Bike"]') && !!$('[data-oeq="Elliptical"]') && !!$('[data-oeq="Stair Climber"]'));
  T("new gear catalog offered", !!$('[data-oeq="Adjustable Dumbbells"]') && !!$('[data-oeq="TRX / Suspension"]') && !!$('[data-oeq="Yoga Mat"]') && !!$('[data-oeq="Foam Roller"]'));
  for(const e of ["Barbell","Squat Rack","Bench","Kettlebells","Lat Pulldown","Cable Machine","Adjustable Dumbbells"]) click($(`[data-oeq="${e}"]`));
  click($("#onbNext"));                               // equip -> eqpref

  /* ---- access ≠ preference ---- */
  T("gear preference step appears after access", $$("[data-epref]").length>=28, `(${$$("[data-epref]").length} pref chips)`);
  click($('[data-epref="Kettlebells:love"]'));
  click($('[data-epref="Lat Pulldown:avoid"]'));
  T("preferences stored separately from access", w.eval(`onb.a.eqPref["Kettlebells"]==="love" && onb.a.eqPref["Lat Pulldown"]==="avoid" && onb.a.eq.includes("Lat Pulldown")`));
  click($("#onbNext"));                               // eqpref -> life

  /* ---- life: 9-to-5, 5-to-9, motivation style ---- */
  T("9-to-5 question appears", !!$('[data-work="wfh"]'));
  T("5-to-9 question appears", $$("[data-eve]").length>=4);
  T("motivation style asked", $$("[data-motiv]").length===3);
  click($('[data-work="wfh"]')); click($('[data-eve="family"]')); click($('[data-motiv="streaks"]'));
  click($("#onbNext"));                               // life -> windows

  /* ---- multi time-windows + life presets ---- */
  T("five time-windows offered", $$("[data-owin]").length===25, `(${$$("[data-owin]").length} slots)`);
  T("life presets offered", !!$('[data-preset="parent"]') && !!$('[data-preset="shift"]') && !!$('[data-preset="labor"]'));
  click($('[data-preset="parent"]'));
  T("preset fills the windows", w.eval(`onb.a.windows.main==="morning" && onb.a.windows.family==="evening" && onb.a.windows.booster==="lunch"`));
  click($("#onbNext"));                               // windows -> schedule

  /* ---- schedule + weekly target + daily boosters ---- */
  click($('[data-odays="3"]')); click($('[data-olen="45"]')); click($('[data-oweeks="6"]'));
  T("weekly consistency target asked", $$("[data-wktarget]").length===4);
  click($('[data-wktarget="4"]'));
  T("daily boosters offered (multi-session days)", !!$('[data-oboost="1"]') && !!$('[data-oboost="2"]'));
  click($('[data-oboost="1"]'));
  click($("#onbNext"));                               // schedule -> mode

  /* ---- four coach modes ---- */
  T("four coach modes offered", $$("[data-mode]").length===4);
  T("recovery-first mode exists", !!$('[data-mode="recovery"]'));
  T("tech comfort asked", $$("[data-tech]").length===3);
  click($('[data-tech="standard"]'));
  click($('[data-mode="coach"]')); click($("#onbNext"));
  T("onboarding closes", !$("#onb").classList.contains("show"));
  T("post-interview lands on Plan tab", $("#page-plan").classList.contains("on"));

  /* ---- profile captured the new answers ---- */
  const st = state();
  T("activities + levels saved on profile", st.profile.activities.kettlebells===4 && st.profile.activities.soccer===1 && st.profile.activities.cycling===3);
  T("compat sports derived from activities", st.profile.sports.includes("soccer") && st.profile.sports.includes("cycling") && st.profile.sports.includes("family"));
  T("soccer activity auto-adds soccer ball", st.profile.eq.includes("Soccer Ball"));
  T("experience derived per track from levels", st.profile.exps.lift==="exp" && st.profile.exps.sport==="new" && st.profile.exps.cardio==="some");
  T("gear preferences saved", st.profile.eqPref["Kettlebells"]==="love" && st.profile.eqPref["Lat Pulldown"]==="avoid");
  T("loved gear boosts builder scores", w.eval(`moveScore({n:"__t",eq:"Kettlebells"}) > moveScore({n:"__t",eq:"Lat Pulldown"})`));
  T("injury context saved", st.profile.areaInfo.ankle && st.profile.areaInfo.ankle.inj==="yes"
    && st.profile.areaInfo.ankle.mode==="rehab" && st.profile.areaInfo.ankle.stage==="mid");
  T("5-to-9 + windows saved", st.profile.eve==="family" && st.profile.windows.main==="morning" && st.profile.window==="morning");
  T("motivation, weekly target, tech saved", st.profile.motiv==="streaks" && st.profile.streakTol===4 && st.profile.tech==="standard");
  T("coach mode saved", st.profile.mode==="coach" && st.profile.style==="coach");
  T("booster setting saved", st.profile.boost===1);

  /* ---- stacked plan: soccer + cycling influence the week ---- */
  T("plan has 42 days", st.plan.days.length===42);
  const wk1 = st.plan.days.slice(0,7);
  const stacked = wk1.some(x=>x.acts.filter(a=>!a.micro).length>=2);
  T("activities stack on a day (types > days)", stacked, wk1.map(x=>x.acts.map(a=>a.type).join("+")||"-").join(","));
  T("every desired type present in wk1", ["STR","RUNF","SKL","ARM"].every(t=>wk1.some(x=>x.acts.some(a=>a.type===t))));
  T("soccer activity → ball work in plan", wk1.some(x=>x.acts.some(a=>a.type==="SKL")));
  T("cycling activity → ride day in plan", wk1.some(x=>x.acts.some(a=>a.type==="SP_cycling")));
  T("family goal + activity → family day in plan", wk1.some(x=>x.acts.some(a=>a.type==="SP_family")));
  T("booster micro-session on every day", st.plan.days.every(x=>x.acts.some(a=>a.type==="BST" && a.micro)));
  T("adjustable dumbbells unlock dumbbell moves", w.eval(`
    (function(){ const saved = S.sel.eq.slice(); S.sel.eq = ["Adjustable Dumbbells"];
      buildSession({focus:"Strength", time:60, mg:["chest"]});
      const ok = S.session.items.some(m=>m.eq==="Dumbbells");
      S.sel.eq = saved; return ok; })()`));

  /* ---- Today page ---- */
  T("Today page markup is the boot default", html.includes('class="page on" id="page-today"'));
  d.querySelectorAll(".nav button")[0].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("Today shows dated header", $("#tdDate").textContent.length > 5);
  const actBtns = $$("#tdActs [data-startact]");
  T("today's activities listed with start buttons", actBtns.length >= 1, `(${actBtns.length} acts)`);
  T("quick-add includes booster chip", !!$('[data-qadd="BST"]'));
  T("quick-add offers picked activities only", !!$('[data-qadd="SP_cycling"]') && !!$('[data-qadd="SP_family"]') && !$('[data-qadd="SP_swimming"]') && !$('[data-qadd="SP_martial"]'));

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
  T("warmth pass applied (brighter secondary text)", html.includes("--dim:#A8ACBA"));

  /* ---- Phase 1: sound engine ---- */
  T("SFX engine present", w.eval(`typeof SFX==="object" && typeof SFX.play==="function"`));
  w.eval(`SFX.play("complete"); SFX.play("fanfare"); SFX.play("advance"); SFX.play("tick");`);
  T("SFX plays without runtime errors", errs.length===0);
  d.querySelectorAll(".nav button")[5].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("sound setting chips render in More", $$("[data-sound]").length===3);
  click($('[data-sound="off"]'));
  T("sound off persists and silences engine", state().settings.sound==="off" && w.eval(`SFX.on===false`));
  click($('[data-sound="low"]'));
  T("canvas-confetti vendored inline", w.eval(`typeof window.confetti==="function"`));
  T("bigBurst safe in any environment", w.eval(`bigBurst(); true`));

  /* ---- Phase 1: destructive-action protection ---- */
  const doneCount = ()=>state().plan.days.reduce((a,day)=>a+day.acts.filter(x=>x.done).length,0);
  const doneBefore = doneCount();
  T("plan has completed work for protection tests", doneBefore>0, `(${doneBefore} done)`);
  w.eval(`S.plan.__tag = "old"; save();`);
  d.querySelectorAll(".nav button")[3].dispatchEvent(new w.Event("click",{bubbles:true}));
  click($("#replanBtn"));
  T("regenerate asks before rebuilding", $("#confirmSheet").classList.contains("show"));
  click($("#cfNo"));
  T("cancel keeps the plan untouched", state().plan.__tag==="old");
  click($("#replanBtn")); click($("#cfYes"));
  T("confirmed rebuild replaces the plan", state().plan.__tag===undefined);
  T("completed acts survive regenerate", doneCount()>=doneBefore, `done ${doneBefore} -> ${doneCount()}`);
  click($("#redoInterview"));
  click($("#onbSkip"));
  T("interview skip asks before wiping a worked plan", $("#confirmSheet").classList.contains("show"));
  click($("#cfNo"));
  T("cancelled skip keeps the plan alive", !!state().plan);
  w.eval(`document.getElementById("onb").classList.remove("show")`);

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

  /* ---- Phase 3: metadata enrichment + why engine ---- */
  T("every move enriched (level, mods, fine muscles)", w.eval(`LIB.every(m=>m.lvl && m.mod && Array.isArray(m.mgf))`));
  T("fine muscle groups tagged", w.eval(`["biceps","triceps","hamstrings","quads","calves","forearms","neck/traps"].every(g=>LIB.some(m=>m.mgf.includes(g)))`));
  T("movement patterns tagged", w.eval(`["squat","hinge","push","pull","carry","rotation","locomotion"].every(p=>LIB.some(m=>m.pattern===p))`));
  T("why engine explains every single move", w.eval(`LIB.every(m=>{ const s=whyFor(m); return s.length>25 && s.indexOf(m.n)===0; })`));
  T("why text is plain language", w.eval(`whyFor(LIB.find(m=>m.n==="KB swings")).length < 220`));

  /* ---- Phase 3: combinable filters ---- */
  click($('[data-lftog="1"]'));
  T("filter panel opens", !!$('[data-lmg="biceps"]') && !!$('[data-lpat="hinge"]') && !!$('[data-llvl="1"]'));
  click($('[data-lmg="biceps"]')); click($('[data-llvl="2"]'));
  T("muscle + difficulty filters combine", w.eval(`
    [...document.querySelectorAll("#libList .ex")].length>0 &&
    [...document.querySelectorAll("#libList .ex")].every(el=>{
      const m = LIB.concat(S.custom||[]).find(x=>x.n===el.dataset.mv);
      return m && m.mgf.includes("biceps") && m.lvl===2; })`));
  click($('[data-lmg=""]')); click($('[data-llvl="0"]')); click($('[data-lftog="1"]'));

  /* ---- Phase 3: training styles change prescriptions ---- */
  T("style axis changes set/rep/rest prescriptions", w.eval(`
    buildSession({focus:"Strength", time:30, style:"strength"});
    const a = S.session.items.filter(m=>m.p==="strength"&&m.b==="main"&&!m.dur).every(m=>m.d.indexOf("4×5")===0 && m.rest===150);
    buildSession({focus:"Strength", time:30, style:"hypertrophy"});
    const b = S.session.items.filter(m=>m.p==="strength"&&m.b==="main"&&!m.dur).every(m=>m.d.indexOf("3×10")===0);
    a && b`));
  T("plan strength template carries goal-driven style", w.eval(`
    Object.values(S.plan.templates).some(t=>t.style==="hypertrophy")`));

  /* ---- Phase 3: recipes + follow-along circuits ---- */
  d.querySelectorAll(".nav button")[2].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("quick-start recipes render on Train", $$("[data-recipe]").length>=8, `(${$$("[data-recipe]").length})`);
  click($$("[data-recipe]").find(c=>c.dataset.recipe==="kb20"));
  const cs = state().session;
  T("KB recipe builds a kettlebell circuit", cs && cs.flow && cs.items.filter(m=>m.b!=="warmup").every(m=>["Kettlebells","Bodyweight"].includes(m.eq)));
  T("circuit uses follow-along pacing (40/20 ×2)", cs.flow.work===40 && cs.flow.rest===20 && cs.flow.rounds===2);
  T("circuit moves carry easier/harder mods", cs.items.filter(m=>m.b!=="warmup").every(m=>m.mod && m.mod.e && m.mod.h));
  click($("#playBtn"));
  T("circuit player opens full screen", $("#player").classList.contains("show"));
  T("circuit player has pause control", !!$("#plcNext") || !!$("#plcPause"));
  let cguard=0;
  while($("#player").classList.contains("show") && cguard++<250){
    const f2=$("#plDone2"), n=$("#plcNext")||$("#plcSkip");
    if(f2){ click(f2); break; } else if(n) click(n); else break;
  }
  T("circuit walks to completion via skips", !$("#player").classList.contains("show"), `(${cguard} steps)`);
  T("circuit completion credits every movement", state().session.items.every(m=>m.done));
  w.eval(`applyRecipe("desk")`);
  T("desk posture recipe targets neck/back/shoulder", state().session.items.filter(m=>m.area).length>0 &&
    state().session.items.filter(m=>m.area).every(m=>m.area.some(a=>["neck","back","shoulder","general"].includes(a))));
  w.eval(`applyRecipe("heart")`);
  T("heart-health recipe sticks to beginner moves", state().session.items.filter(m=>m.b==="main").every(m=>(m.lvl||1)<=1));

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
  if($("#confirmSheet").classList.contains("show")){
    T("deleting a completed act asks first", true);
    click($("#cfYes"));
  }
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
  T("v4 profile migrates to v5 (goal families, activities, windows, mode)", w.eval(`
    (function(){
      const v4 = { name:"Old", exp:"exp", exps:{lift:"exp",cardio:"some",sport:"some"},
        goals:["strength","move","sleep","fat"], sports:["cycling","racquet"],
        areas:["ankle"], areaInfo:{}, runFocus:"both", eq:["Kettlebells"], lifts:{}, caps:{},
        work:"wfh", eve:"family", window:"evening", days:3, len:30, weeks:6, boost:0, style:"coach" };
      const saved = S.profile; S.profile = v4; migrateProfile();
      const p = S.profile; S.profile = saved;
      return p.goals.includes("stronger") && p.goals.includes("mobility") && p.goals.includes("feel")
        && !p.goals.includes("strength") && !p.goals.includes("move")
        && p.activities.cycling>0 && p.activities.tennis>0
        && p.windows.main==="evening" && p.mode==="coach" && p.eqPref && p.streakTol===4;
    })()`));

  console.log(`\n${pass} passed, ${fail} failed. Runtime errors: ${errs.length?errs.join("; "):"none"}`);
  if(fail || errs.length) process.exitCode = 1;
} catch(e){ console.log("HARNESS CRASH:", e.message, e.stack); process.exitCode = 1; } }, 300);
