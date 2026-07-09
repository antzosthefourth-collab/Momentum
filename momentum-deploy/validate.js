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

  /* ---- 13 specific goal families — powerlifting + family retired (v6) ---- */
  T("13 goal families offered", $$("[data-goal]").length===13, `(${$$("[data-goal]").length})`);
  T("goal families are specific", !!$('[data-goal="muscle"]') && !!$('[data-goal="heart"]')
    && !!$('[data-goal="aesthetic"]') && !!$('[data-goal="return"]'));
  T("powerlifting + family goals removed", !$('[data-goal="power"]') && !$('[data-goal="family"]'));
  T("return-to-activity goal is self-explanatory", $("#onbBody").textContent.includes("Bounce back"));
  T("vague goals replaced", !$('[data-goal="strength"]') && !$('[data-goal="soccer"]') && !$('[data-goal="move"]'));
  for(const g of ["muscle","run","mobility","fat"]) click($(`[data-goal="${g}"]`));
  T("no running-focus question exists", !$('[data-run]'));
  click($("#onbNext"));                               // goals -> activities

  /* ---- "What activities do you do?" — 18 extracurricular activities (v6) ---- */
  T("activities step replaces sports step", $("#onbBody").textContent.includes("activities"));
  T("18 extracurricular activities offered", $$("[data-activity]").length===18, `(${$$("[data-activity]").length})`);
  T("gym modalities removed from activities", !$('[data-activity="kettlebells"]') && !$('[data-activity="dumbbells"]')
    && !$('[data-activity="barbell"]') && !$('[data-activity="machines"]') && !$('[data-activity="bodyweight"]')
    && !$('[data-activity="elliptical"]') && !$('[data-activity="family"]'));
  T("real activities still offered", !!$('[data-activity="hiit"]') && !!$('[data-activity="martial"]') && !!$('[data-activity="swimming"]'));
  click($('[data-activity="soccer"]')); click($('[data-activity="cycling"]'));
  T("per-activity comfort sliders appear", $$("[data-alevel]").length===8, `(${$$("[data-alevel]").length})`);
  click($('[data-alevel="soccer:1"]'));               // brand-new to soccer
  T("levels are independent per activity", w.eval(`onb.a.activities.cycling===3 && onb.a.activities.soccer===1`));
  click($("#onbNext"));                               // activities -> exp (lifting not derivable anymore)

  /* ---- lifting experience asked directly now that it's not an "activity" ---- */
  T("exp step asks lifting when goals need it", !!$('[data-track="lift"]'));
  T("cardio experience derived from activities — not asked", !$('[data-track="cardio"]'));
  click($('[data-track="lift"][data-exp="exp"]'));
  click($("#onbNext"));                               // exp -> areas

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
  const oeqSet = new Set($$("[data-oeq]").map(e=>e.dataset.oeq));   // jsdom selectors dislike "&" in values
  T("per-sport gear replaces Sports Gear", oeqSet.has("Pool Access") && oeqSet.has("Racquet & Paddle")
    && oeqSet.has("Bat & Glove") && oeqSet.has("Bike") && !oeqSet.has("Sports Gear"));
  for(const e of ["Barbell","Squat Rack","Bench","Kettlebells","Lat Pulldown","Cable Machine","Adjustable Dumbbells"]) click($(`[data-oeq="${e}"]`));
  click($("#onbNext"));                               // equip -> schedule (pref/life/windows steps retired)

  /* ---- v6: dead-weight steps removed ---- */
  T("gear-preference step removed", !$("[data-epref]"));
  T("life step removed (9-to-5 / 5-to-9 / motivation)", !$("[data-work]") && !$("[data-eve]") && !$("[data-motiv]"));
  T("windows step removed", !$("[data-owin]") && !$("[data-preset]"));
  T("schedule step follows gear directly", !!$('[data-odays="3"]'));

  /* ---- schedule + weekly target + daily boosters ---- */
  click($('[data-odays="3"]')); click($('[data-olen="45"]')); click($('[data-oweeks="6"]'));
  T("weekly consistency target asked", $$("[data-wktarget]").length===4);
  click($('[data-wktarget="4"]'));
  T("daily boosters DEFINED before asking", $("#onbBody").textContent.includes("What's a booster?"));
  T("daily boosters offered (multi-session days)", !!$('[data-oboost="1"]') && !!$('[data-oboost="2"]'));
  click($('[data-oboost="1"]'));
  click($("#onbNext"));                               // schedule -> mode

  /* ---- four coach modes ---- */
  T("four coach modes offered", $$("[data-mode]").length===4);
  T("recovery-first mode exists", !!$('[data-mode="recovery"]'));
  T("tech-comfort question removed", !$("[data-tech]"));
  click($('[data-mode="coach"]')); click($("#onbNext"));
  T("onboarding closes", !$("#onb").classList.contains("show"));

  /* ---- v6 Phase 4: forced (skippable) feature tour fires once, right after the forge ---- */
  T("feature tour fires after the forge", $("#tourOv").classList.contains("show"));
  T("tour walks Today first", $("#page-today").classList.contains("on") && $(".tourc-title").textContent.length>3);
  let tguard = 0;
  while($("#tourOv").classList.contains("show") && tguard++<10) click($("#tourNext"));
  T("tour completes and marks itself done", !$("#tourOv").classList.contains("show") && state().tutorialDone===1, `(${tguard} steps)`);
  T("tour can be replayed from More", !!$("#replayTour"));

  /* ---- profile captured the new answers ---- */
  const st = state();
  T("activities + levels saved on profile", st.profile.activities.soccer===1 && st.profile.activities.cycling===3);
  T("compat sports derived from activities", st.profile.sports.includes("soccer") && st.profile.sports.includes("cycling") && !st.profile.sports.includes("family"));
  T("sport gear auto-added (ball + bike)", st.profile.eq.includes("Soccer Ball") && st.profile.eq.includes("Bike"));
  T("lifting exp from the exp step, rest derived", st.profile.exps.lift==="exp" && st.profile.exps.sport==="new" && st.profile.exps.cardio==="some");
  T("lifestyle fields retired from profile", st.profile.work===undefined && st.profile.eve===undefined && st.profile.windows===undefined
    && st.profile.motiv===undefined && st.profile.tech===undefined && st.profile.eqPref===undefined);
  T("injury context saved", st.profile.areaInfo.ankle && st.profile.areaInfo.ankle.inj==="yes"
    && st.profile.areaInfo.ankle.mode==="rehab" && st.profile.areaInfo.ankle.stage==="mid");
  T("weekly target saved", st.profile.streakTol===4);
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
  T("no family day type in new plans", !st.plan.days.some(x=>x.acts.some(a=>a.type==="SP_family")));
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
  T("quick-add offers picked activities only", !!$('[data-qadd="SP_cycling"]') && !$('[data-qadd="SP_swimming"]') && !$('[data-qadd="SP_martial"]'));
  T("family activity fully retired from quick-add", !$('[data-qadd="SP_family"]'));

  /* ---- v6 Phase 3: Today's brief + inline movement checklists ---- */
  T("Today shows a plain-english brief", $("#tdBrief").textContent.includes("Today is") && $("#tdBrief").textContent.includes("week 1"));
  T("brief includes real minutes", /about \d+ minutes/.test($("#tdBrief").textContent));
  T("brief has a speak button", !!$("#briefSpeak"));
  T("today's workouts expand into inline checklists", $$("#tdActs [data-tcheck]").length>=3, `(${$$("#tdActs [data-tcheck]").length} moves)`);
  T("inline how cues on every move", $$("#tdActs [data-thow]").length === $$("#tdActs [data-tcheck]").length);
  click($$("#tdActs [data-thow]")[0]);
  T("how cue reveals coaching inline", $$("#tdActs .td-how")[0].style.display !== "none");
  const doneB4 = state().done;
  click($$("#tdActs [data-tcheck]")[0]);
  T("checking a move from Today credits it", state().done === doneB4+1 && !!state().session.actRef);
  click($$("#tdActs [data-tcheck]")[0]);
  T("unchecking from Today works too", state().done === doneB4);
  T("check-in + journal moved to the bottom", !!($("#habitList").compareDocumentPosition($("#checkinCard")) & 4)
    && !!($("#checkinCard").compareDocumentPosition($("#jrnText")) & 4));

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
  T("baseline habits are goal-driven, not lifestyle-driven", $$("[data-habit]").length>=4 && $$("[data-habit]").some(h=>/Stand \+ 2-min/i.test(h.textContent)));
  T("no orphaned lifestyle habits", !$$("[data-habit]").some(h=>/post-dinner|between meetings/i.test(h.textContent)));
  T("SKILL system icon is sport-neutral", w.eval(`SYS.skill.icon==="🎯"`));

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
  T("desk posture recipe targets neck/back/shoulder", state().session.items.filter(m=>m.b!=="warmup" && m.area).length>0 &&
    state().session.items.filter(m=>m.b!=="warmup" && m.area).every(m=>m.area.some(a=>["neck","back","shoulder","general"].includes(a))));
  w.eval(`applyRecipe("heart")`);
  T("heart-health recipe sticks to beginner moves", state().session.items.filter(m=>m.b==="main").every(m=>(m.lvl||1)<=1));

  /* ---- v6 Phase 2: conditioning engine ---- */
  T("zero-gear HIIT + family quick starts removed", w.eval(`!RECIPES.some(r=>r.id==="hiit20"||r.id==="fam")`));
  T("30/40-min KB HIIT quick starts exist", w.eval(`RECIPES.some(r=>r.id==="kb30") && RECIPES.some(r=>r.id==="kb40")`));
  T("conditioning focus offered on Train", w.eval(`FOCI.includes("Conditioning")`));
  T("conditioning builds a KB circuit when KB on hand", w.eval(`
    (function(){ const saved=S.sel.eq.slice(); if(!S.sel.eq.includes("Kettlebells")) S.sel.eq.push("Kettlebells");
      buildSession({focus:"Conditioning", time:20});
      const ok = S.session.flow && S.session.style==="kbflow";
      S.sel.eq=saved; return ok; })()`));
  T("conditioning falls back to bodyweight HIIT without KB", w.eval(`
    (function(){ const saved=S.sel.eq.slice(); S.sel.eq=S.sel.eq.filter(e=>e!=="Kettlebells");
      buildSession({focus:"Conditioning", time:20});
      const ok = S.session.flow && S.session.style==="hiit";
      S.sel.eq=saved; return ok; })()`));
  T("conditioning never prescribes sets×reps", w.eval(`
    buildSession({focus:"Conditioning", time:30});
    S.session.items.filter(m=>m.b!=="warmup").every(m=>/s on \\/ /.test(m.d))`));
  w.eval(`applyRecipe("kb30")`);
  T("30-min KB HIIT works 50s windows", state().session.flow.work===50 && state().session.flow.rest===25);
  w.eval(`applyRecipe("kb40")`);
  T("40-min KB HIIT works 60s windows (40s–1min brief)", state().session.flow.work===60 && state().session.flow.rest===30);
  T("longer KB HIIT stays kettlebell-first", state().session.items.filter(m=>m.b!=="warmup").every(m=>["Kettlebells","Bodyweight"].includes(m.eq)));
  T("circuit plan templates hydrate with the follow-along player", w.eval(`
    (function(){ const names = S.session.items.map(m=>m.n);
      buildSession({fromNames:names, style:"kbflow", time:30});
      return !!S.session.flow && S.session.flow.work===50; })()`));

  /* ---- v6 Phase 3: edit a session in place — no random rebuild required ---- */
  d.querySelectorAll(".nav button")[2].dispatchEvent(new w.Event("click",{bubbles:true}));
  click($$("#focusChips .chip").find(c=>c.dataset.f==="Strength"));
  click($("#buildBtn"));
  const names1 = state().session.items.map(m=>m.n);
  const mi1 = state().session.items.findIndex(m=>m.b==="main");
  T("session cards offer swap / choose / remove", !!$(`[data-swap="${mi1}"]`) && !!$(`[data-pick="${mi1}"]`) && !!$(`[data-rm="${mi1}"]`));
  click($(`[data-swap="${mi1}"]`));
  const names2 = state().session.items.map(m=>m.n);
  T("swap changes exactly one movement", names2.length===names1.length && names2[mi1]!==names1[mi1]
    && names2.filter((n,i)=>n!==names1[i]).length===1, `${names1[mi1]} -> ${names2[mi1]}`);
  click($(`[data-rm="${mi1}"]`));
  T("remove drops the movement", state().session.items.length===names2.length-1);
  click($('[data-addmove="main"]'));
  T("movement picker opens filtered to gear", $("#pickSheet").classList.contains("show") && $$("#pkBody [data-pickmove]").length>0,
    `(${$$("#pkBody [data-pickmove]").length} options)`);
  const pickName = $$("#pkBody [data-pickmove]")[0] ? $$("#pkBody [data-pickmove]")[0].dataset.pickmove : "";
  click($$("#pkBody [data-pickmove]")[0]);
  T("picked movement lands in the session", state().session.items.some(m=>m.n===pickName) && !$("#pickSheet").classList.contains("show"));
  /* plan-launched sessions write edits back to their slot */
  d.querySelectorAll(".nav button")[0].dispatchEvent(new w.Event("click",{bubbles:true}));
  const sBtn = $$("#tdActs [data-startact]")[0];
  const [spIdx, spAi] = sBtn.dataset.startact.split(":").map(Number);
  click(sBtn);
  const mi2 = state().session.items.findIndex(m=>m.b==="main" && !m.done);
  click($(`[data-swap="${mi2}"]`));
  const wroteBack = state().plan.days[spIdx].acts[spAi].names;
  T("train-tab edits save back to the plan slot", Array.isArray(wroteBack)
    && wroteBack.join("|")===state().session.items.map(m=>m.n).join("|"));

  /* ---- injury 'avoid' filters sessions ---- */
  T("avoid-mode area excluded from built sessions", w.eval(`
    S.profile.areaInfo.neck = {inj:"yes", mode:"avoid"};
    buildSession({focus:"Mobility", time:30});
    const ok = S.session.items.every(m=>!m.area || !m.area.includes("neck"));
    delete S.profile.areaInfo.neck; ok`));

  /* ---- machine + sport moves exist in the library ---- */
  T("machine movements in library", w.eval(`["Lat pulldown","Leg press","Smith machine squat","Machine chest press","Seated row machine"].every(n=>LIB.some(m=>m.n===n))`));
  T("sport movements in library", w.eval(`["Swim: steady laps","Outdoor ride: endurance","Wall rally drill","Ruck walk (loaded)","Sun salutation flow"].every(n=>LIB.some(m=>m.n===n))`));

  /* ---- Phase 4: planner 2.0 — drag & drop, act editor, locks, life rows ---- */
  d.querySelectorAll(".nav button")[3].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("SortableJS vendored inline", w.eval(`typeof Sortable==="function"`));
  click($("#arrangeBtn"));
  T("arrange mode renders 7 drag containers", $$("#planDays .arr-acts").length===7, `(${$$("#planDays .arr-acts").length})`);
  T("arrange shows draggable act chips with handles", $$("#planDays .arr-act .drag-h").length>=3);
  const dFrom = state().plan.days.findIndex(dd=>dd.acts.some(a=>!a.micro));
  const dTo = state().plan.days.findIndex(dd=>!dd.acts.some(a=>!a.micro));
  const aiF = state().plan.days[dFrom].acts.findIndex(a=>!a.micro);
  const movedType = state().plan.days[dFrom].acts[aiF].type;
  w.eval(`movePlanAct(${dFrom}, ${aiF}, ${dTo}, 0)`);
  T("drag core moves an act between days and persists", state().plan.days[dTo].acts[0].type===movedType);
  w.eval(`movePlanAct(${dTo}, 0, ${dFrom}, ${aiF})`);
  click($("#arrangeBtn"));

  /* act editor sheet */
  const editBtn = $("[data-actedit]");
  const [eIdx, eAi] = editBtn.dataset.actedit.split(":").map(Number);
  click(editBtn);
  T("act editor sheet opens", $("#actSheet").classList.contains("show"));
  T("act sheet offers type / duration / intensity / style", !!$("[data-astype]") && !!$('[data-astime="15"]') && !!$('[data-asint="easy"]'));
  click($('[data-astime="15"]'));
  T("duration override persists on the act", (state().plan.days[eIdx].acts[eAi].o||{}).time===15);
  click($("#asLock"));
  T("lock toggles from the sheet", state().plan.days[eIdx].acts[eAi].lock===true);
  const namesBefore = w.eval(`actNames(S.plan.days[${eIdx}].acts[${eAi}])`);
  click($('[data-asswap="0"]'));
  T("exercise swap changes exactly that movement", namesBefore.length>0 &&
    w.eval(`(S.plan.days[${eIdx}].acts[${eAi}].names||[])[0]`)!==namesBefore[0], `was ${namesBefore[0]}`);
  const cnt4 = state().plan.days[eIdx].acts.length;
  click($("#asDup"));
  T("duplicate adds a copy on the same day", state().plan.days[eIdx].acts.length===cnt4+1);
  click($("#asRebuild"));
  T("rebuild pins a fresh movement set to the slot", (state().plan.days[eIdx].acts[eAi].names||[]).length>0);
  click($("#asDone"));
  T("act sheet closes", !$("#actSheet").classList.contains("show"));

  /* locked acts survive a full regenerate */
  click($("#replanBtn")); click($("#cfYes"));
  T("locked act survives full regenerate", state().plan.days[eIdx].acts.some(a=>a.lock));

  /* whole-life plan rows */
  d.querySelectorAll(".nav button")[0].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("life rows offered in quick-add", !!$('[data-qadd="NUT"]') && !!$('[data-qadd="MIND"]') && !!$('[data-qadd="JRNL"]') && !!$('[data-qadd="SLP"]'));
  click($('[data-qadd="MIND"]'));
  const xpRB = state().sys.recharge;
  const lifeBtn = $$("#tdActs [data-actdone]").find(b=>{
    const [i2,a2] = b.dataset.actdone.split(":").map(Number);
    return state().plan.days[i2].acts[a2] && state().plan.days[i2].acts[a2].type==="MIND"; });
  T("life act renders one-tap Done on Today", !!lifeBtn);
  click(lifeBtn);
  T("life act completion grants system XP", state().sys.recharge > xpRB, `${xpRB} -> ${state().sys.recharge}`);
  T("life acts never offer a Start button", !$$("#tdActs [data-startact]").some(b=>{
    const [i3,a3] = b.dataset.startact.split(":").map(Number);
    const act3 = state().plan.days[i3].acts[a3];
    return act3 && ["NUT","SLP","MIND","JRNL"].includes(act3.type); }));

  /* add / remove still work */
  d.querySelectorAll(".nav button")[3].dispatchEvent(new w.Event("click",{bubbles:true}));
  const addBtn = $("[data-actadd]");
  const editIdx = +addBtn.dataset.actadd;
  const cBefore = state().plan.days[editIdx].acts.length;
  click(addBtn);
  T("add activity to a plan day", state().plan.days[editIdx].acts.length === cBefore+1);
  click($(`[data-actdel="${editIdx}:0"]`));
  if($("#confirmSheet").classList.contains("show")){
    T("deleting a completed/locked act asks first", true);
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

  /* ---- Phase 5: check-ins, adaptation, journal tagger, streak 2.0, armor ---- */
  d.querySelectorAll(".nav button")[0].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("check-in strip renders (energy/sleep/soreness)", $$("[data-ci]").length===9);
  click($('[data-ci="energy:1"]')); click($('[data-ci="sleep:2"]')); click($('[data-ci="sore:3"]'));
  T("check-ins persist per day", w.eval(`todayCI().energy===1 && todayCI().sore===3`));
  T("low check-in surfaces adaptation options", !!$("#adMVW") && !!$("#adMob") && !!$("#adRest"));
  click($('[data-qadd="MOT"]'));   // guarantee an undone act for MVW to credit
  click($("#adMVW"));
  const mvw = state().session;
  T("MVW builds a short beginner-level session", mvw.time<=15 && mvw.items.filter(m=>m.b==="main").every(m=>(m.lvl||1)<=1));
  T("MVW credits toward today's planned act", !!mvw.actRef);
  T("adaptation asks once, never nags", w.eval(`needsAdapt()===false`));
  w.eval(`S.checkins[dayKey()].adapted=0; save(); renderCheckin();`);
  const rchB = state().sys.recharge;
  click($("#adRest"));
  T("rest-with-credit grants recovery XP", state().sys.recharge > rchB && w.eval(`todayCI().rested===1`));

  const minB5 = state().minutes;
  w.eval(`saveJournal("Did a 25 minute kettlebell workout, mostly swings and presses. Felt tired but got it done.")`);
  const je = state().journal[0];
  T("journal saves with auto-tags", !!je && je.tags.includes("kettlebell") && je.tags.includes("25 min"));
  T("tagger reads duration, category, muscle scope, feel", je.dur===25 && je.tags.includes("strength/conditioning")
    && je.tags.includes("full body") && je.tags.includes("fatigue noted"));
  T("completed speech counts as unscheduled activity + streak", je.tags.includes("completed") && je.tags.includes("streak credit"));
  T("journal creates a logged done act on today", state().plan.days.some(dd=>dd.acts.some(a=>a.adhoc && /logged/.test(a.label||""))));
  T("journal minutes credit the day", state().minutes >= minB5+25);
  w.eval(`saveJournal("feeling good about tomorrow")`);
  T("reflections don't fake activity credit", !state().journal[0].tags.includes("streak credit"));
  T("journal list renders on Today", $$("#jrnList .card").length>=1);

  T("milestone grants a freeze + celebration", w.eval(`
    (function(){ const s={streak:S.streak,last:S.lastDay,s2:JSON.parse(JSON.stringify(S.streak2||{}))};
      const y=new Date(); y.setDate(y.getDate()-1);
      S.streak=6; S.lastDay=dayKey(y); S.streak2={freezes:0,best:6,milestones:[],comeback:0};
      touchStreak();
      const ok = S.streak===7 && S.streak2.freezes===1 && S.streak2.milestones.includes(7);
      S.streak=s.streak; S.lastDay=s.last; S.streak2=s.s2; save(); return ok; })()`));
  T("freeze silently bridges a one-day gap", w.eval(`
    (function(){ const s={streak:S.streak,last:S.lastDay,s2:JSON.parse(JSON.stringify(S.streak2||{}))};
      const y2=new Date(); y2.setDate(y2.getDate()-2);
      S.streak=9; S.lastDay=dayKey(y2); S.streak2={freezes:2,best:9,milestones:[],comeback:0};
      touchStreak();
      const ok = S.streak===10 && S.streak2.freezes===1;
      S.streak=s.streak; S.lastDay=s.last; S.streak2=s.s2; save(); return ok; })()`));
  T("no freeze → comeback remembered, never shamed", w.eval(`
    (function(){ const s={streak:S.streak,last:S.lastDay,s2:JSON.parse(JSON.stringify(S.streak2||{}))};
      const y3=new Date(); y3.setDate(y3.getDate()-3);
      S.streak=12; S.lastDay=dayKey(y3); S.streak2={freezes:0,best:12,milestones:[],comeback:0};
      touchStreak();
      const ok = S.streak===1 && S.streak2.comeback===12;
      S.streak=s.streak; S.lastDay=s.last; S.streak2=s.s2; save(); return ok; })()`));
  T("weekly consistency target comes from the interview", w.eval(`weekStats().target===4 && weekStats().hits>=1`));
  T("streak card renders with freezes + week dots", $("#streakCard").textContent.includes("streak") && $("#streakCard").textContent.includes("❄️"));
  T("armor shields fill from area-tagged work", w.eval(`
    (function(){ const b=(S.areaXP&&S.areaXP.ankle)||0;
      const mv = Object.assign({}, LIB.find(m=>m.n==="Tibialis raises"), {done:false});
      const sv = S.session; S.session = {time:5, focus:"Mobility", items:[mv]};
      toggleItem(0, true); const ok = ((S.areaXP&&S.areaXP.ankle)||0) > b;
      S.session = sv; save(); return ok; })()`));
  d.querySelectorAll(".nav button")[1].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("armor card renders per-area shields", $$("#armorCard .sys").length>=1);

  /* ---- v6 Phase 4: viking hero scene, look, rewards, saga ---- */
  T("hero scene renders with level + streak badges", !!$("#heroScene") && $("#hsLvl").textContent.length>0 && /🔥/.test($("#hsStreak").textContent));
  T("hero stage names the viking form", /Thrall|Shield-Carrier|Raider|Huscarl|Jarl|Saga-Born/.test($("#hsStage").textContent));
  T("custom art URL fields removed", !$("#artBanner") && !$("#artAvatar") && !$("#artBg") && !$("#saveArt"));
  T("legacy art settings scrubbed", state().settings.bannerUrl===undefined && state().settings.avatarUrl===undefined);
  T("look card offers habitats + companions", $$("[data-avhab]").length===4 && $$("[data-avpet]").length===4);
  T("locked looks stay locked", $$("[data-avhab]").filter(b=>b.disabled).length>=1 && $$("[data-avpet]").filter(b=>b.disabled).length>=1);
  T("reward rail shows gated unlocks with progress", $$("#rewardRail .rw").length>=3 && /level|streak/.test($("#rewardRail").textContent));
  T("saga card renders", !!$("#sagaCard") && $("#sagaCard").textContent.length>10);
  T("hero stage progression is level-driven", w.eval(`heroStage(1).n==="Thrall" && heroStage(12).n==="Huscarl" && heroStage(30).n==="Saga-Born"`));
  T("companions unlock on streaks", w.eval(`
    (function(){ const s2=S.streak2; S.streak2={best:15,freezes:0,milestones:[],comeback:0};
      const un = unlockedCompanions().map(c=>c.id);
      S.streak2=s2;
      return un.includes("slime") && un.includes("dragon") && !un.includes("wolf"); })()`));
  T("picking an unlocked companion persists", w.eval(`
    (function(){ const s2=S.streak2; S.streak2={best:10,freezes:0,milestones:[],comeback:0}; renderHero();
      const btn=[...document.querySelectorAll("[data-avpet]")].find(b=>b.dataset.avpet==="slime");
      btn.dispatchEvent(new Event("click",{bubbles:true}));
      const ok = S.avatar.companion==="slime";
      S.streak2=s2; renderHero(); return ok; })()`));
  /* ---- v6 Phase 5: ambience player + animated backdrops (jsdom-safe wiring) ---- */
  d.querySelectorAll(".nav button")[5].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("ambience chips render in More", $$("#ambChips [data-amb]").length===3);
  T("backdrop video feature fully removed", !$("#bgvChips") && !$("#bgVid") && state().settings.bgv===undefined);
  click($('[data-amb="fire"]'));
  T("ambience choice persists", state().settings.amb==="fire");
  click($('[data-amb="off"]'));
  T("ambience off persists", state().settings.amb==="off");
  d.querySelectorAll(".nav button")[2].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("Train music drawer includes ambience", !!$("#musicToggle") && (click($("#musicToggle")), $$("#musicDrawer [data-amb]").length===3));
  T("probeVid is defined and silent in jsdom", w.eval(`typeof probeVid==="function" && (probeVid(["x.webm"], ()=>{}), true)`));
  d.querySelectorAll(".nav button")[1].dispatchEvent(new w.Event("click",{bubbles:true}));
  T("level-up card reveals unlocks", w.eval(`
    (function(){ const xp=S.xp, sys=S.sys.strength;
      S.xp = 0; S.sys.strength = 0; grantXp("strength", need(1)+10);
      const msg = document.getElementById("luMsg").textContent;
      S.xp = xp; S.sys.strength = sys; document.getElementById("levelup").classList.remove("show"); save();
      return /Unlocked|Momentum/.test(msg); })()`));

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
  T("v4 profile migrates to v6 (goal families, activities, lifestyle cleanup)", w.eval(`
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
        && p.windows===undefined && p.work===undefined && p.eqPref===undefined
        && p.eq.includes("Bike") && p.eq.includes("Racquet & Paddle")
        && p.mode==="coach" && p.streakTol===4;
    })()`));
  T("v5 profile migrates to v6 (power+family goals, modality activities)", w.eval(`
    (function(){
      const v5 = { name:"V5", exps:{lift:"some",cardio:"some",sport:"some"},
        goals:["power","family","run"], sports:["family","running"],
        activities:{ kettlebells:4, family:3, running:2, elliptical:2 },
        areas:["ankle"], areaInfo:{}, runFocus:"both", eq:["Kettlebells","Sports Gear"], lifts:{}, caps:{},
        work:"wfh", eve:"family", motiv:"streaks", tech:"simple",
        windows:{main:"evening"}, eqPref:{Kettlebells:"love"}, days:3, len:30, weeks:6, boost:1, mode:"coach" };
      const saved = S.profile; S.profile = v5; migrateProfile();
      const p = S.profile; S.profile = saved;
      return p.goals.includes("stronger") && p.goals.includes("feel") && !p.goals.includes("power") && !p.goals.includes("family")
        && !p.activities.kettlebells && !p.activities.family && !p.activities.elliptical && p.activities.running===2
        && !p.sports.includes("family") && !p.eq.includes("Sports Gear")
        && p.work===undefined && p.eve===undefined && p.motiv===undefined && p.tech===undefined
        && p.windows===undefined && p.eqPref===undefined;
    })()`));

  console.log(`\n${pass} passed, ${fail} failed. Runtime errors: ${errs.length?errs.join("; "):"none"}`);
  if(fail || errs.length) process.exitCode = 1;
} catch(e){ console.log("HARNESS CRASH:", e.message, e.stack); process.exitCode = 1; } }, 300);
