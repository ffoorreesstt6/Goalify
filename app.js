// ============================================================
// GOALIFY — production SPA on real Supabase (auth + DB + storage + AI edge fn)
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://jcskgasaocfueneyahrk.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impjc2tnYXNhb2NmdWVuZXlhaHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTY5MzIsImV4cCI6MjA5NzM5MjkzMn0.nviM9OmKZkFKlb-CvXhzoIqyK8JOJ1G9hYw2khZIm6c";

// remember-me aware storage: localStorage if remembered, else sessionStorage
const REMEMBER = "goalify_remember";
const storage = {
  getItem: (k) => localStorage.getItem(k) ?? sessionStorage.getItem(k),
  setItem: (k, v) => { (localStorage.getItem(REMEMBER) === "1" ? localStorage : sessionStorage).setItem(k, v); },
  removeItem: (k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); },
};
const sb = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage },
});

// ============================================================
// DEMO MODE — set to false when auth is ready
// ============================================================
const DEMO_MODE = true;
// Use the real OpenAI-backed Edge Function (key stays on Supabase, never here).
// If the function isn't deployed yet, the app gracefully falls back to sample replies.
const USE_REAL_AI = true;
const _m = new Date(), _mo = _m.toISOString().slice(0,7);
const DEMO_ME = {
  id:'demo', first_name:'Forest', last_name:'', email:'demo@goalify.app',
  plan:'premium', role:'user', personality:'goal_chaser', onboarded:false,
  monthly_income:3500, monthly_savings:700, xp:0, currency:'EUR',
  budget:{groceries:420,restaurants:250,shopping:180,entertainment:120,subscriptions:60,transportation:90},
  notification_prefs:{weekly:true,alerts:true,goals:true,news:false}, theme:'dark', language:'en',
  coach_mode:'fun', savings_mode:'fun', theme_color:'blue', avatar_url:null
};
const DEMO_GOALS = [
  {id:'g1',user_id:'demo',name:'Emergency Fund',emoji:'🛡️',image_url:null,target_amount:5000,saved_amount:2100,monthly_contribution:300,completed:false,status:'active',created_at:'2024-01-01',missions:[
    {id:'m1',goal_id:'g1',title:'Transfer €75 to savings',cadence:'weekly',perWeek:1,difficulty:'easy',status:'active'},
    {id:'m2',goal_id:'g1',title:'A no-spend day',cadence:'daily',perWeek:5,difficulty:'medium',status:'active'},
  ]},
  {id:'g2',user_id:'demo',name:'New MacBook Pro',emoji:'💻',image_url:null,target_amount:2499,saved_amount:850,monthly_contribution:200,completed:false,status:'active',created_at:'2024-02-01',missions:[
    {id:'m3',goal_id:'g2',title:'Skip takeaway lunch',cadence:'daily',perWeek:5,difficulty:'medium',status:'active'},
    {id:'m4',goal_id:'g2',title:'Sell one unused item',cadence:'weekly',perWeek:1,difficulty:'hard',status:'active'},
  ]},
  {id:'g3',user_id:'demo',name:'Summer Trip 🇬🇷',emoji:'✈️',image_url:null,target_amount:1500,saved_amount:1500,monthly_contribution:0,completed:true,status:'completed',created_at:'2024-03-01',missions:[]},
];
const DEMO_EXPENSES = [
  {id:'e1',user_id:'demo',amount:420,category:'groceries',merchant:'Lidl',spent_at:`${_mo}-02`},
  {id:'e2',user_id:'demo',amount:85,category:'restaurants',merchant:'Sushi House',spent_at:`${_mo}-04`},
  {id:'e3',user_id:'demo',amount:120,category:'shopping',merchant:'Zara',spent_at:`${_mo}-06`},
  {id:'e4',user_id:'demo',amount:9.99,category:'subscriptions',merchant:'Netflix',spent_at:`${_mo}-01`},
  {id:'e5',user_id:'demo',amount:65,category:'transportation',merchant:'Bus Pass',spent_at:`${_mo}-01`},
  {id:'e6',user_id:'demo',amount:110,category:'restaurants',merchant:'Various',spent_at:`${_mo}-10`},
  {id:'e7',user_id:'demo',amount:180,category:'shopping',merchant:'Online',spent_at:`${_mo}-12`},
  {id:'e8',user_id:'demo',amount:45,category:'entertainment',merchant:'Cinema',spent_at:`${_mo}-14`},
  {id:'e9',user_id:'demo',amount:12.99,category:'subscriptions',merchant:'Spotify',spent_at:`${_mo}-01`},
  {id:'e10',user_id:'demo',amount:90,category:'transportation',merchant:'Fuel',spent_at:`${_mo}-08`},
  {id:'e11',user_id:'demo',amount:55,category:'fastfood',merchant:'McDonald\'s',spent_at:`${_mo}-09`},
  {id:'e12',user_id:'demo',amount:38,category:'entertainment',merchant:'Bowling',spent_at:`${_mo}-16`},
];

// -------------------- constants --------------------
const PLANS = {
  free:{name:'Free',price:0,goalLimit:3,ai:5},
  pro:{name:'Pro',price:3,goalLimit:-1,ai:50,highlight:true},
  premium:{name:'Premium',price:5,goalLimit:-1,ai:-1},
  business:{name:'Business',price:10,goalLimit:-1,ai:-1},
};
const PLAN_ORDER=['free','pro','premium','business'];
// ⚠️ DEMO-ONLY: these live in client code and are readable in page source.
// Move to server-side (edge function / DB) validation before launch.
const PROMO_CODES={'FORESTPRO2026-FP2-PRP':'pro','FORESTPREMIUM2026-FP6-PP':'premium','FORESTBUSINESS2026-FB2-BP':'business'};
const ADMIN_CODE='ADMINFOREST2010-AF2-ADM';
function isDemoAdmin(){return localStorage.getItem('goalify_admin')==='1';}
const PLAN_FEATURES={
  free:['Up to 3 goals (archive, no delete)','Basic goal tracking','Basic profile & sharing','Follow / unfollow people','Simple, distraction-free'],
  pro:['Unlimited goals','Advanced analytics & insights','Future Simulator','Focused pro dashboard','One signature red theme'],
  premium:['Everything in Pro','Full social: feed, reactions, memories','Themes, banners & chat wallpapers','AI coach & smart reminders','Weekly & monthly reports','Streaks, challenges & badges'],
  business:['A complete business OS','Companies, employees & assets','Invoices, payments & taxes','Cash flow, net worth & reports','Executive gold interface','No games — pure operations'],
};
// ── central capability map: the single source of truth for plan gating ──
function caps(plan){
  return {
    goalLimit: plan==='free'?3:-1,
    canDelete: plan!=='free',
    themes: plan==='premium'?'full':plan==='pro'?'red':plan==='business'?'business':'none',
    customization: plan==='premium',           // banners, chat wallpapers, profile styling
    social: plan==='premium'?'full':(plan==='free'||plan==='pro')?'follow':'none',
    gamify: plan==='premium',                   // XP, streaks, missions, challenges, badges
    analytics: PLAN_ORDER.indexOf(plan)>=PLAN_ORDER.indexOf('pro'),
    ai: plan==='premium',
    reports: plan==='premium',
  };
}
function planNav(plan){
  const c=caps(plan);
  const nav=[['dashboard','Dashboard','📊'],['goals','Goals','🎯']];
  if(c.analytics){nav.push(['analytics','Analytics','📈'],['simulator','Future Simulator','🔮']);}
  if(c.ai)nav.push(['ai','AI Coach','✨']);
  if(c.gamify)nav.push(['challenges','Challenges','🏆']);
  if(c.social!=='none')nav.push(['social','Social','👥']);
  nav.push(['plans','Plans','💳']);
  if(plan==='free')nav.push(['student','Student Verify','🎓']);
  nav.push(['settings','Settings','⚙️']);
  return nav;
}


const CATS={
  groceries:{l:'Groceries',c:'#22c55e',e:'🛒'}, gas:{l:'Gas/Fuel',c:'#f59e0b',e:'⛽'}, shopping:{l:'Shopping',c:'#ec4899',e:'🛍️'},
  restaurants:{l:'Restaurants',c:'#fb923c',e:'🍽️'}, fastfood:{l:'Fast Food',c:'#f97316',e:'🍔'}, cigarettes:{l:'Cigarettes',c:'#a3a3a3',e:'🚬'},
  entertainment:{l:'Entertainment',c:'#a855f7',e:'🎬'}, subscriptions:{l:'Subscriptions',c:'#6366f1',e:'🔁'}, transportation:{l:'Transportation',c:'#3b82f6',e:'🚌'},
  rent:{l:'Rent',c:'#8b5cf6',e:'🏠'}, utilities:{l:'Utilities',c:'#06b6d4',e:'💡'}, education:{l:'Education',c:'#eab308',e:'📚'},
  other:{l:'Other',c:'#94a3b8',e:'📦'}, income:{l:'Income',c:'#4ade80',e:'💵'}, savings:{l:'Savings',c:'#10b981',e:'💰'},
};
const QUIZ_CATS=['groceries','gas','shopping','restaurants','fastfood','cigarettes','entertainment','subscriptions','transportation','rent','utilities','education','other'];

const PERSONAS={
  saver:{name:'The Saver',emoji:'🛡️',desc:'Disciplined and security-focused. Money in the bank gives you peace of mind.',recs:['Put idle cash to work','Set a stretch goal beyond your emergency fund','Automate a small monthly investment']},
  goal_chaser:{name:'The Goal Chaser',emoji:'🎯',desc:'You thrive on targets. A clear goal keeps you motivated.',recs:['Focus on your top 2 goals','Use streaks to stay consistent','Celebrate milestones']},
  student_budgeter:{name:'The Student Budgeter',emoji:'🎓',desc:'Making the most of a tight budget. Every euro counts.',recs:['Verify your student status to unlock Pro free','Build a €100 buffer first','Track subscriptions — they add up']},
  lifestyle_spender:{name:'The Lifestyle Spender',emoji:'✨',desc:'You value experiences and quality.',recs:['Set a guilt-free fun budget','Automate savings before spending','Try a no-delivery week']},
  impulse_buyer:{name:'The Impulse Buyer',emoji:'⚡',desc:'You buy in the moment. Fun, but it can sting later.',recs:['Use a 24-hour rule on non-essentials','Try a no-impulse challenge','Turn on budget alerts']},
  future_investor:{name:'The Future Investor',emoji:'📈',desc:'You think long-term. Growing wealth is your game.',recs:['Keep 3 months of expenses liquid','Use the Future Simulator','Diversify your goals across horizons']},
};

const COUNTRIES=["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Brazzaville)","Congo (Kinshasa)","Costa Rica","Côte d'Ivoire","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];

const CHALLENGES=[
  {key:'cook1',title:'Cook At Home Today',desc:'Cook all your meals today.',emoji:'🍳',days:1,xp:15},
  {key:'nospend1',title:'No-Spend Day',desc:'Spend €0 for 24 hours.',emoji:'🛑',days:1,xp:20},
  {key:'nocoffee7',title:'No Coffee Week',desc:'Skip the café for 7 days.',emoji:'☕',days:7,xp:60},
  {key:'nodelivery7',title:'No Delivery Week',desc:'No food delivery for 7 days.',emoji:'🥡',days:7,xp:60},
  {key:'save100_14',title:'Save €100 in 14 Days',desc:'Stash €100 over two weeks.',emoji:'💰',days:14,xp:150},
  {key:'noimpulse14',title:'No Impulse-Buy',desc:'No non-essentials for 14 days.',emoji:'🧊',days:14,xp:120},
];

// -------------------- AI coach personalities --------------------
const COACH_MODES={
  chill:{name:'Chill Coach',emoji:'😌',desc:'Soft, supportive tone'},
  fun:{name:'Fun Coach',emoji:'🎉',desc:'Upbeat & motivational'},
  strict:{name:'Strict Coach',emoji:'🎯',desc:'Direct, no fluff'},
  roast:{name:'Roast Mode',emoji:'🔥',desc:'Light humor, keeps it real'},
};
// -------------------- savings strategy modes --------------------
const SAVINGS_MODES={
  chill:{name:'Chill',emoji:'🌿',cut:0.10,desc:'Small cuts, low pressure'},
  fun:{name:'Fun',emoji:'🎈',cut:0.20,desc:'Balanced optimization'},
  hard:{name:'Hard',emoji:'🔥',cut:0.35,desc:'Aggressive savings'},
  extreme:{name:'Extreme',emoji:'⚡',cut:0.50,desc:'Maximum optimization'},
};
// categories that can realistically be reduced
const REDUCIBLE=['restaurants','fastfood','shopping','entertainment','subscriptions','cigarettes','gas'];
// -------------------- badges --------------------
const BADGES=[
  {key:'starter',name:'Goal Starter',emoji:'🚀',desc:'Created your first goal'},
  {key:'saver7',name:'7-Day Saver',emoji:'🔥',desc:'7-day check-in streak'},
  {key:'cutter',name:'Expense Cutter',emoji:'✂️',desc:'Completed a savings challenge'},
  {key:'finisher',name:'Goal Finisher',emoji:'🎯',desc:'Completed a goal'},
  {key:'leveled',name:'Level Up',emoji:'⭐',desc:'Reached level 5'},
  {key:'consistency',name:'Consistency Master',emoji:'🏆',desc:'30-day streak'},
];

// -------------------- helpers --------------------
const $=(s,el=document)=>el.querySelector(s);
const esc=(s)=>(s==null?'':String(s)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=(n,cur=(ME?.currency||'EUR'))=>new Intl.NumberFormat('en-IE',{style:'currency',currency:cur,maximumFractionDigits:(Math.abs(n||0)%1===0?0:2)}).format(n||0);
const pct=(a,b)=>b?Math.min(100,Math.round(a/b*100)):0;
const todayISO=()=>new Date().toISOString().slice(0,10);
const ini=(p)=>((p?.first_name||p?.email||'U')[0]+(p?.last_name?.[0]||'')).toUpperCase();
function toast(msg,type='ok'){ const c=type==='err'?'background:rgba(239,68,68,.95)':'background:rgba(16,185,129,.95)'; const el=document.getElementById('toast'); el.innerHTML=`<div class="toast text-white anim" style="${c}">${esc(msg)}</div>`; setTimeout(()=>{el.innerHTML='';},3200); }
function levelFromXp(xp){return {level:Math.floor((xp||0)/100)+1,inLvl:(xp||0)%100};}
function pwStrength(v){let s=0,h=[];if(v.length>=8)s++;else h.push('8+ chars');if(/[A-Z]/.test(v))s++;else h.push('uppercase');if(/[a-z]/.test(v))s++;else h.push('lowercase');if(/\d/.test(v))s++;else h.push('number');if(/[^A-Za-z0-9]/.test(v))s++;else h.push('symbol');return{score:s,hints:h};}
function updatePwStr(v){const fill=$('#pwStrFill'),text=$('#pwStrText');if(!fill)return;const {score,hints}=pwStrength(v);const colors=['','#ef4444','#f97316','#eab308','#22c55e','#10b981'];const labels=['','Weak','Fair','Good','Strong','Very strong'];fill.style.width=score*20+'%';fill.style.background=colors[score]||'transparent';text.textContent=v?(labels[score]+(hints.length&&score<5?' · needs: '+hints.slice(0,2).join(', '):'')):'';}
const EYE_ON=`<svg viewBox="0 0 24 24" class="h-4 w-4 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF=`<svg viewBox="0 0 24 24" class="h-4 w-4 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

let ME=null;        // current profile
let SESSION=null;   // current session
let charts={};
function destroyCharts(){Object.values(charts).forEach(c=>{try{c.destroy()}catch(e){}});charts={};}

// -------------------- data layer --------------------
async function loadProfile(){
  if(DEMO_MODE){ME=DEMO_ME;return DEMO_ME;}
  if(!SESSION) return null;
  let { data } = await sb.from('profiles').select('*').eq('id',SESSION.user.id).maybeSingle();
  if(!data){ // safety: create if trigger didn't
    await sb.from('profiles').insert({id:SESSION.user.id,email:SESSION.user.email});
    ({data}=await sb.from('profiles').select('*').eq('id',SESSION.user.id).maybeSingle());
  }
  ME=data; return data;
}
const getGoals=async()=>DEMO_MODE?DEMO_GOALS:(await sb.from('goals').select('*').order('created_at',{ascending:false})).data||[];
const getExpenses=async()=>DEMO_MODE?DEMO_EXPENSES:(await sb.from('expenses').select('*').order('spent_at',{ascending:false}).limit(1000)).data||[];

// -------------------- scoring --------------------
function snapshot(profile,expenses){
  const now=new Date(),mStart=new Date(now.getFullYear(),now.getMonth(),1);
  const spend=expenses.filter(e=>e.category!=='income'&&e.category!=='savings'&&new Date(e.spent_at)>=mStart).reduce((s,e)=>s+Number(e.amount),0);
  const income=Number(profile.monthly_income)||0;
  const leftover=income-spend;
  const savingsRate=income>0?Math.max(0,Math.round(leftover/income*100)):0;
  return {income,spending:spend,leftover,savingsRate};
}
function goalifyScore(s,goals,xp){
  const goalAvg=goals.length?goals.reduce((a,g)=>a+Math.min(100,g.saved_amount/Math.max(1,g.target_amount)*100),0)/goals.length:0;
  const sav=Math.min(40,s.savingsRate/100*40), gc=Math.min(25,goalAvg*.25);
  const sp=s.income>0?Math.min(20,Math.max(0,(1-s.spending/s.income)*20)):10;
  return Math.round(sav+gc+sp+Math.min(15,(xp||0)/300*15));
}
function healthScore(s){let v=50;v+=Math.min(30,s.savingsRate*.6);v+=s.leftover>0?10:-15;v=Math.max(0,Math.min(100,Math.round(v)));
  return {v,r:v>=80?'Excellent':v>=60?'Good':v>=40?'Fair':'Needs work'};}

// -------------------- behaviour engine (all math in code, never invented) --------------------
function uid(){return DEMO_MODE?'demo':(SESSION?.user?.id||'anon');}
function savingsMode(){return SAVINGS_MODES[ME?.savings_mode||'fun'];}
function coachMode(){return COACH_MODES[ME?.coach_mode||'fun'];}
function monthCatSpend(){const now=new Date(),m=new Date(now.getFullYear(),now.getMonth(),1),map={};EXPENSES.filter(e=>e.category!=='income'&&e.category!=='savings'&&new Date(e.spent_at)>=m).forEach(e=>{map[e.category]=(map[e.category]||0)+Number(e.amount);});return map;}
function topGoal(){return GOALS.filter(g=>!g.completed).sort((a,b)=>(b.target_amount-b.saved_amount)-(a.target_amount-a.saved_amount))[0]||null;}
// what to cut: each item = {cat, spend, save, impact} — driven by the active savings mode
function whatToReduce(){
  const map=monthCatSpend(), cut=savingsMode().cut, g=topGoal();
  return REDUCIBLE.filter(c=>map[c]>0).map(c=>{
    const save=Math.round(map[c]*cut*100)/100; let impact='';
    if(g&&save>0){
      const remaining=Math.max(0,g.target_amount-g.saved_amount);
      const base=Math.max(0,Number(g.monthly_contribution)||0);
      if(base>0){const dn=Math.max(0,Math.round((remaining/base-remaining/(base+save))*30));if(dn>0)impact=`reach “${g.name}” ${dn} days sooner`;}
      else{impact=`covers “${g.name}” in ~${Math.ceil(remaining/save)} mo`;}
    }
    return {cat:c,spend:map[c],save,impact};
  }).filter(x=>x.save>0).sort((a,b)=>b.save-a.save).slice(0,5);
}
// streaks (daily check-in) — stored locally
function streakState(){try{return JSON.parse(localStorage.getItem('goalify_streak_'+uid()))||{count:0,last:null};}catch(e){return{count:0,last:null};}}
function setStreakState(s){localStorage.setItem('goalify_streak_'+uid(),JSON.stringify(s));}
function doCheckIn(){const s=streakState(),t=todayISO();if(s.last===t)return{...s,already:true};const y=new Date(Date.now()-864e5).toISOString().slice(0,10);s.count=(s.last===y?s.count+1:1);s.last=t;setStreakState(s);return{...s,already:false};}
// challenges v2 — proof-based, XP only after admin approval (no instant complete / no farming)
function chalState(){try{return JSON.parse(localStorage.getItem('goalify_chalv2_'+uid()))||[];}catch(e){return[];}}
function setChalState(a){localStorage.setItem('goalify_chalv2_'+uid(),JSON.stringify(a));}
function joinedChal(key){return chalState().find(c=>c.key===key);}
function chalDayNum(c){return Math.min((CHALLENGES.find(x=>x.key===c.key)||{days:1}).days,Math.floor((Date.now()-new Date(c.start))/864e5)+1);}
function completedChals(){return chalState().filter(c=>c.status==='approved').map(c=>c.key);}
function earnedBadges(){const s=streakState(),lvl=levelFromXp(ME?.xp).level,done=completedChals(),set=new Set();
  if(GOALS.length>0)set.add('starter');
  if(s.count>=7)set.add('saver7');
  if(done.length>0)set.add('cutter');
  if(GOALS.some(g=>g.completed))set.add('finisher');
  if(lvl>=5)set.add('leveled');
  if(s.count>=30)set.add('consistency');
  if(allMissions().some(m=>missionStreak(m.id)>=7))set.add('saver7');
  return set;}

// ============================================================
// MISSIONS ENGINE — Goals → Missions → Check-ins
// ============================================================
const DIFF={easy:{xp:5,label:'Easy',c:'#22c55e'},medium:{xp:10,label:'Medium',c:'#f59e0b'},hard:{xp:20,label:'Hard',c:'#ef4444'}};
const GOAL_LEVELS=[[0,'Beginner','🌱'],[150,'Consistent','⚡'],[400,'Advanced','🚀'],[800,'Elite','👑']];
function mlogs(){try{return JSON.parse(localStorage.getItem('goalify_mlog_'+uid()))||{};}catch(e){return{};}}
function setMlogs(o){localStorage.setItem('goalify_mlog_'+uid(),JSON.stringify(o));}
function missionLog(id){return mlogs()[id]||{};}
function isDoneToday(id){return !!missionLog(id)[todayISO()];}
function weekStartISO(d=new Date()){const x=new Date(d);x.setDate(x.getDate()-((x.getDay()+6)%7));return x.toISOString().slice(0,10);} // Monday
function doneThisWeek(id){const ws=weekStartISO(),log=missionLog(id);return Object.keys(log).filter(k=>k>=ws).length;}
function missionStreak(id){const log=missionLog(id);let n=0,d=new Date();if(!log[todayISO()])d.setDate(d.getDate()-1);for(;;){const k=d.toISOString().slice(0,10);if(log[k]){n++;d.setDate(d.getDate()-1);}else break;}return n;}
function missionBest(id){const days=Object.keys(missionLog(id)).sort();let best=0,run=0,prev=null;days.forEach(k=>{run=prev&&(new Date(k)-new Date(prev))/864e5===1?run+1:1;best=Math.max(best,run);prev=k;});return best;}
function streakHealth(n){if(n>=7)return{label:'Strong',c:'#22c55e',e:'🔥'};if(n>=3)return{label:'Stable',c:'#3b82f6',e:'💪'};if(n>=1)return{label:'Weak',c:'#f59e0b',e:'⚠️'};return{label:'Critical',c:'#ef4444',e:'❗'};}
function allMissions(){return GOALS.flatMap(g=>(g.missions||[]).map(m=>({...m,goal:g})));}
function missionTarget(m){return m.cadence==='daily'?(m.perWeek||5):(m.perWeek||1);}
function missionDueToday(m){if(m.status!=='active')return false;return m.cadence==='daily'?!isDoneToday(m.id):doneThisWeek(m.id)<missionTarget(m);}
function checkInMission(id){const o=mlogs();o[id]=o[id]||{};o[id][todayISO()]=true;setMlogs(o);}
function uncheckMission(id){const o=mlogs();if(o[id])delete o[id][todayISO()];setMlogs(o);}
function goalXp(g){return (g.missions||[]).reduce((s,m)=>s+Object.keys(missionLog(m.id)).length*(DIFF[m.difficulty]?.xp||5),0);}
function goalLevel(g){const xp=goalXp(g);let lvl=GOAL_LEVELS[0],idx=0;GOAL_LEVELS.forEach((L,i)=>{if(xp>=L[0]){lvl=L;idx=i;}});const next=GOAL_LEVELS[idx+1];return {idx:idx+1,name:lvl[1],emoji:lvl[2],xp,next:next?next[0]:null,prev:lvl[0]};}
function goalProgress(g){const money=g.target_amount?pct(g.saved_amount,g.target_amount):null,ms=g.missions||[];let cons=null;
  if(ms.length)cons=Math.round(ms.reduce((s,m)=>s+Math.min(1,doneThisWeek(m.id)/Math.max(1,missionTarget(m))),0)/ms.length*100);
  if(money!=null&&cons!=null)return Math.round(money*0.6+cons*0.4);
  return money!=null?money:(cons!=null?cons:0);}
function userStreak(){const ms=allMissions();return ms.length?Math.max(0,...ms.map(m=>missionStreak(m.id))):0;}
function weekCheckins(){const ws=weekStartISO();return allMissions().reduce((s,m)=>s+Object.keys(missionLog(m.id)).filter(k=>k>=ws).length,0);}
// AI behaviour engine — finds failure patterns from real check-in logs
function behaviourReport(){
  const ms=allMissions().filter(m=>m.status==='active'&&m.cadence==='daily');
  const miss=[0,0,0,0,0,0,0],tot=[0,0,0,0,0,0,0],today=new Date();
  ms.forEach(m=>{const log=missionLog(m.id);for(let i=1;i<=21;i++){const d=new Date(today);d.setDate(today.getDate()-i);const k=d.toISOString().slice(0,10),dow=d.getDay();tot[dow]++;if(!log[k])miss[dow]++;}});
  let worst=null,wr=0;for(let i=0;i<7;i++)if(tot[i]>=2){const r=miss[i]/tot[i];if(r>wr){wr=r;worst=i;}}
  const DOW=['Sundays','Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays'];
  const suggestions=[];
  allMissions().filter(m=>m.status==='active').forEach(m=>{const rate=doneThisWeek(m.id)/Math.max(1,missionTarget(m));
    if(rate>=1&&m.difficulty!=='hard')suggestions.push({type:'up',m});
    else if(rate<0.4&&missionStreak(m.id)===0)suggestions.push({type:'down',m});});
  return {worstDay:worst!=null&&wr>=0.4?DOW[worst]:null,worstRate:Math.round(wr*100),suggestions:suggestions.slice(0,3)};
}
// shareable weekly progress card (PNG export via canvas) — viral growth loop
function makeShareCard(){
  const us=userStreak(),wk=weekCheckins(),g=topGoal(),prog=g?goalProgress(g):0;
  const W=1080,H=1080,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const cs=getComputedStyle(document.documentElement);const a2=(cs.getPropertyValue('--accent2')||'#8b5cf6').trim(),a1=(cs.getPropertyValue('--accent1')||'#4f46e5').trim();
  const grd=x.createLinearGradient(0,0,W,H);grd.addColorStop(0,'#0b0f1d');grd.addColorStop(1,'#11162b');x.fillStyle=grd;x.fillRect(0,0,W,H);
  const glow=x.createRadialGradient(W*0.78,H*0.22,0,W*0.78,H*0.22,720);glow.addColorStop(0,a2+'66');glow.addColorStop(1,'transparent');x.fillStyle=glow;x.fillRect(0,0,W,H);
  x.textAlign='left';x.fillStyle='#fff';x.font='bold 56px Inter,sans-serif';x.fillText('Goalify',90,150);
  x.font='600 38px Inter,sans-serif';x.fillStyle='#cbd5e1';x.fillText('My week',90,210);
  x.textAlign='center';x.fillStyle='#fff';x.font='bold 300px Inter,sans-serif';x.fillText(String(us),W/2,560);
  x.font='600 52px Inter,sans-serif';x.fillStyle=a2;x.fillText('🔥 day streak',W/2,650);
  x.fillStyle='#fff';x.font='bold 60px Inter,sans-serif';x.fillText(wk+' check-ins this week',W/2,800);
  if(g){x.font='600 44px Inter,sans-serif';x.fillStyle='#cbd5e1';x.fillText(g.emoji+' '+g.name+' — '+prog+'%',W/2,880);}
  x.font='600 40px Inter,sans-serif';x.fillStyle=a2;x.fillText('Chase your goals → goalify.app',W/2,1000);
  const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='goalify-week.png';a.click();
}
function weeklyReportText(){
  const wk=weekCheckins(),us=userStreak(),r=behaviourReport();
  const parts=[`This week you logged ${wk} check-in${wk===1?'':'s'} with a best streak of ${us} day${us===1?'':'s'}.`];
  if(r.worstDay)parts.push(`Heads-up: ${r.worstDay} is when you slip most (${r.worstRate}% skipped).`);
  if(r.suggestions[0]){const s=r.suggestions[0];parts.push(s.type==='up'?`“${s.m.title}” is going great — time to level it up.`:`Ease off “${s.m.title}” to rebuild the habit.`);}
  else parts.push('Keep those streaks alive! 🔥');
  return parts.join(' ');
}
function seedDemoMissions(){
  if(localStorage.getItem('goalify_mlog_demo'))return;
  const o={},today=new Date(),add=(id,d)=>{o[id]=o[id]||{};o[id][d.toISOString().slice(0,10)]=true;};
  // m3: solid 8-day streak (Strong). m2: weekday-only (misses weekends -> AI detects). m1/m4 weekly.
  for(let i=0;i<=8;i++){const d=new Date(today);d.setDate(today.getDate()-i);add('m3',d);}
  for(let i=0;i<=20;i++){const d=new Date(today);d.setDate(today.getDate()-i);const dow=d.getDay();if(dow!==0&&dow!==6)add('m2',d);}
  add('m1',new Date(weekStartISO()));add('m1',new Date(Date.now()-7*864e5));
  add('m4',new Date(Date.now()-9*864e5));
  setMlogs(o);
}
// theme
function applyTheme(mode,color){const r=document.documentElement;if(mode){r.classList.toggle('light',mode==='light');localStorage.setItem('goalify_theme',mode);if(ME)ME.theme=mode;}if(color){r.setAttribute('data-accent',color);localStorage.setItem('goalify_color',color);if(ME)ME.theme_color=color;}}
function applyBg(bg){document.documentElement.setAttribute('data-bg',bg||'none');localStorage.setItem('goalify_bg',bg||'none');if(ME)ME.bg=bg;}
function loadTheme(){applyTheme(localStorage.getItem('goalify_theme')||'dark',localStorage.getItem('goalify_color')||'blue');applyBg(localStorage.getItem('goalify_bg')||'none');}
// Enforce per-plan theme rules without overwriting Premium's saved prefs.
function enforcePlanTheme(plan){
  const r=document.documentElement,c=caps(plan);
  if(plan==='business')return; // gold executive handled via data-biz
  if(c.themes==='full'){ applyTheme(localStorage.getItem('goalify_theme')||'dark',localStorage.getItem('goalify_color')||'blue'); applyBg(localStorage.getItem('goalify_bg')||'none'); }
  else if(c.themes==='red'){ r.classList.remove('light'); r.setAttribute('data-accent','red'); r.setAttribute('data-bg','none'); }
  else { r.classList.remove('light'); r.setAttribute('data-accent','blue'); r.setAttribute('data-bg','none'); }
}
// avatar (with badge ring)
function avatarHTML(size=36){
  const b=[...earnedBadges()],badge=b.length?BADGES.find(x=>x.key===b[b.length-1]):null;
  const inner=ME?.avatar_url?`<img src="${esc(ME.avatar_url)}" class="h-full w-full object-cover">`:ini(ME);
  return `<span class="relative inline-flex shrink-0"><span class="flex items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white" style="width:${size}px;height:${size}px;background:linear-gradient(135deg,var(--accent1),var(--accent2))">${inner}</span>${badge?`<span class="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px]" style="background:var(--bg);border:1px solid var(--border)" title="${esc(badge.name)}">${badge.emoji}</span>`:''}</span>`;
}
// grounded demo AI reply (uses real computed numbers, adapts to coach mode)
function demoCoachReply(q,mode){
  const s=snapshot(ME,EXPENSES),cm=ME.coach_mode||'fun',wr=whatToReduce(),top=wr[0],cutPct=Math.round(savingsMode().cut*100);
  const roasting=(mode==='roast'||cm==='roast');
  const tone=roasting?'Alright, real talk 🔥 ':{chill:'No pressure 🌿 ',fun:'Love the energy! 🎉 ',strict:'',roast:'Alright, real talk 🔥 '}[cm]||'';
  // behaviour / progress questions -> use real mission data
  if(/doing|week|progress|streak|habit|mission/i.test(q)){return tone+weeklyReportText();}
  if(roasting){
    if(top){const m=CATS[top.cat]||CATS.other;return `${tone}You dropped ${fmt(top.spend)} on ${m.l} this month. Trim ${cutPct}% and that's ${fmt(top.save)} back in your pocket${top.impact?' — '+top.impact:''}. You'll get there… eventually. 😏`;}
    return `${tone}Your spending's actually fine. Don't let it go to your head.`;
  }
  if(top){const m=CATS[top.cat]||CATS.other;return `${tone}Your savings rate is ${s.savingsRate}%. Biggest easy win: cut ${m.l} by ${cutPct}% to save ${fmt(top.save)}/mo${top.impact?' and '+top.impact:''}. Want me to turn that into a weekly plan?`;}
  return `${tone}You're spending ${fmt(s.spending)} of ${fmt(s.income)} — a ${s.savingsRate}% savings rate. Add a goal and I'll build a plan around it.`;
}

// -------------------- icons --------------------
const LOGO='<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" stroke-linejoin="round"/><path d="M12 7v5l3.5 2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const brand=(href='#home')=>`<a href="${href}" class="flex items-center gap-2"><span class="flex h-9 w-9 items-center justify-center rounded-xl text-white" style="background:linear-gradient(135deg,#4f46e5,#8b5cf6)">${LOGO}</span><span class="text-xl font-extrabold">Goal<span class="gtext">ify</span></span></a>`;
// subscription badge (none for Free)
function planBadge(plan,size='xs'){const map={pro:['PRO','#3b82f6'],premium:['PREMIUM','#a855f7'],business:['BUSINESS','#f59e0b']};const b=map[plan];if(!b)return '';return `<span class="rounded-full px-2 py-0.5 font-bold text-white text-${size}" style="background:${b[1]};letter-spacing:.04em">${b[0]}</span>`;}

// ============================================================
// VIEWS — OAUTH AUTH
// ============================================================
function authView(){
  return `<div class="relative flex min-h-screen items-center justify-center px-4 py-12">
    <div class="orb animate-float" style="top:8%;left:8%;width:380px;height:380px;background:radial-gradient(circle,rgba(59,130,246,.4),transparent 70%)"></div>
    <div class="orb animate-float" style="bottom:8%;right:8%;width:420px;height:420px;background:radial-gradient(circle,rgba(168,85,247,.4),transparent 70%);animation-delay:2s"></div>
    <div class="absolute left-6 top-6">${brand()}</div>
    <div class="w-full max-w-sm anim">
      <div class="glass-strong rounded-2xl p-8">
        <div class="text-center mb-8">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white" style="background:linear-gradient(135deg,#4f46e5,#8b5cf6)">${LOGO}</div>
          <h1 class="mt-4 text-2xl font-bold">Welcome to Goalify</h1>
          <p class="mt-1.5 text-sm text-slate-400">Sign in to start tracking your goals.</p>
        </div>
        <div class="space-y-3">
          <button data-action="oauth" data-provider="google" class="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium hover:bg-white/10 transition-all">
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
          <button data-action="oauth" data-provider="apple" class="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-medium text-black hover:bg-white/90 transition-all">
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            Continue with Apple
          </button>
          <button data-action="oauth" data-provider="github" class="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium hover:bg-white/10 transition-all">
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            Continue with GitHub
          </button>
        </div>
        <p class="mt-6 text-center text-xs text-slate-500">By continuing you agree to our <a href="#" class="text-accent-purple hover:underline">Terms</a> & <a href="#" class="text-accent-purple hover:underline">Privacy Policy</a>.</p>
      </div>
    </div>
  </div>`;
}

// ============================================================
// VIEWS — LANDING
// ============================================================
function landing(){
  const cta=DEMO_MODE?'#quiz':'#signup';
  const loginHref=DEMO_MODE?'#quiz':'#login';
  return `<header class="fixed inset-x-0 top-0 z-40 px-4 py-4"><div class="mx-auto max-w-7xl"><div class="glass-strong flex items-center justify-between rounded-2xl px-4 py-3">${brand()}
    <nav class="hidden gap-8 md:flex text-sm text-slate-300"><a href="#home" data-scroll="feat" class="hover:text-white">Features</a><a href="#home" data-scroll="pricing" class="hover:text-white">Pricing</a><a href="#home" data-scroll="faq" class="hover:text-white">FAQ</a></nav>
    <div class="flex items-center gap-3">${DEMO_MODE?`<a href="#quiz" class="btn btn-primary !py-2 !px-4 text-sm">Get started →</a>`:SESSION?`<a href="#app/dashboard" class="btn btn-primary !py-2 !px-4 text-sm">Open app</a>`:`<a href="#login" class="text-sm text-slate-300 hover:text-white">Log in</a><a href="#signup" class="btn btn-primary !py-2 !px-4 text-sm">Get started</a>`}</div>
  </div></div></header>
  <main>
    <section class="relative overflow-hidden pt-40 pb-24">
      <div class="orb animate-float" style="top:-10%;left:5%;width:460px;height:460px;background:radial-gradient(circle,rgba(59,130,246,.45),transparent 70%)"></div>
      <div class="orb animate-float" style="top:15%;right:-5%;width:520px;height:520px;background:radial-gradient(circle,rgba(168,85,247,.4),transparent 70%);animation-delay:2s"></div>
      <div class="absolute inset-0 grid-bg opacity-60"></div>
      <div class="relative mx-auto max-w-4xl px-4 text-center">
        <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">✨ AI-powered financial coaching</div>
        <h1 class="text-5xl font-extrabold leading-tight sm:text-6xl md:text-7xl">Turn Every Euro<br>Into <span class="gtext">Progress.</span></h1>
        <p class="mx-auto mt-6 max-w-2xl text-lg text-slate-400">Track spending, reach goals faster, and receive AI-powered financial coaching — all in one beautifully simple platform.</p>
        <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"><a href="${cta}" class="btn btn-primary">Start for free →</a><a href="${loginHref}" class="btn btn-ghost">Log in</a></div>
        <p class="mt-4 text-sm text-slate-500">No credit card required · Students get Pro free</p>
      </div>
    </section>
    <section id="sec-feat" class="py-20 mx-auto max-w-7xl px-4">
      <div class="mx-auto max-w-2xl text-center"><p class="text-sm font-semibold uppercase tracking-widest gtext">Features</p><h2 class="mt-3 text-4xl font-bold sm:text-5xl">Everything you need to <span class="gtext">win with money</span></h2></div>
      <div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      ${[['🧠','AI Financial Coach','Real AI that analyzes your spending and builds savings strategies.'],['🎯','Goal Tracking','Goals with images, progress bars and completion estimates.'],['📊','Deep Analytics','Daily, weekly, monthly, yearly & 5-year projections.'],['🎓','Student = Pro Free','Verify your student status to unlock Pro at no cost.'],['🏆','Challenges & XP','Build habits, earn XP and level up.'],['🛡️','Bank-grade Security','Supabase Auth, row-level security, encrypted storage.']].map(f=>`<div class="glass rounded-2xl p-6 hover:-translate-y-1 transition"><div class="text-3xl">${f[0]}</div><h3 class="mt-4 text-lg font-semibold">${f[1]}</h3><p class="mt-2 text-sm text-slate-400">${f[2]}</p></div>`).join('')}
      </div>
    </section>
    <section id="sec-pricing" class="py-20 mx-auto max-w-7xl px-4">
      <div class="mx-auto max-w-2xl text-center"><p class="text-sm font-semibold uppercase tracking-widest gtext">Pricing</p><h2 class="mt-3 text-4xl font-bold sm:text-5xl">Simple, honest pricing</h2></div>
      <div class="mt-14 grid gap-6 lg:grid-cols-4">${PLAN_ORDER.map(id=>{const p=PLANS[id];return `<div class="relative flex flex-col rounded-2xl p-6 ${p.highlight?'glass-strong':'glass'}" ${p.highlight?'style="box-shadow:0 0 40px -10px rgba(99,102,241,.5)"':''}>${p.highlight?'<span class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-white" style="background:linear-gradient(90deg,#3b82f6,#8b5cf6)">Most popular</span>':''}<h3 class="text-lg font-semibold">${p.name}</h3><div class="mt-2 flex items-baseline gap-1"><span class="text-4xl font-extrabold">€${p.price}</span><span class="text-sm text-slate-400">/mo</span></div><a href="${cta}" class="btn ${p.highlight?'btn-primary':'btn-ghost'} mt-5 w-full text-sm">Get started</a><ul class="mt-5 space-y-2 text-sm text-slate-400">${PLAN_FEATURES[id].map(f=>`<li class="flex gap-2"><span class="text-accent-purple">✓</span>${f}</li>`).join('')}</ul></div>`;}).join('')}</div>
    </section>
    <section id="sec-faq" class="py-20 mx-auto max-w-3xl px-4">
      <div class="text-center"><p class="text-sm font-semibold uppercase tracking-widest gtext">FAQ</p><h2 class="mt-3 text-4xl font-bold sm:text-5xl">Questions, answered</h2></div>
      <div class="mt-10 space-y-3">${[['Is Goalify really free?','Yes — the Free plan includes expense tracking, analytics, your money personality and up to 3 goals, forever.'],['How do students get Pro free?','Submit your university and student email under Student Verification. Once an admin approves it, your plan upgrades to Pro automatically.'],['Is my data secure?','Auth and data are powered by Supabase with row-level security, so only you (and admins) can access your data.'],['How does the AI work?','A secure server function calls a real AI model using your financial context, with per-plan daily limits.']].map((f,i)=>`<div class="glass rounded-2xl overflow-hidden"><button class="flex w-full items-center justify-between px-6 py-5 text-left font-medium" data-action="faq" data-i="${i}">${f[0]}<span id="fi-${i}">+</span></button><div id="fa-${i}" class="hidden px-6 pb-5 text-sm text-slate-400">${f[1]}</div></div>`).join('')}</div>
    </section>
    <section class="py-20 mx-auto max-w-5xl px-4"><div class="rounded-3xl p-12 sm:p-16 text-center" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)"><h2 class="text-4xl font-bold sm:text-5xl text-white">Turn every euro into progress</h2><a href="${cta}" class="btn mt-8 bg-white text-indigo-700 hover:scale-105">Start for free →</a></div></section>
    <footer class="border-t border-white/10 py-12 mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">© ${new Date().getFullYear()} Goalify. All rights reserved.</footer>
  </main>`;
}

// ============================================================
// VIEWS — AUTH
// ============================================================
function authWrap(inner){
  return `<div class="relative flex min-h-screen items-center justify-center px-4 py-12">
    <div class="orb animate-float" style="top:8%;left:8%;width:380px;height:380px;background:radial-gradient(circle,rgba(59,130,246,.4),transparent 70%)"></div>
    <div class="orb animate-float" style="bottom:8%;right:8%;width:420px;height:420px;background:radial-gradient(circle,rgba(168,85,247,.4),transparent 70%);animation-delay:2s"></div>
    <div class="absolute left-6 top-6">${brand()}</div>
    <div class="w-full max-w-md anim">${inner}</div></div>`;
}
function loginView(){
  return authWrap(`<div class="glass-strong rounded-2xl p-7"><h1 class="text-2xl font-bold">Welcome back</h1><p class="mt-1 text-sm text-slate-400">Log in to your Goalify account.</p>
    <form id="loginForm" class="mt-6 space-y-4">
      <div><label class="label">Email</label><input name="email" type="email" class="input" required></div>
      <div><label class="label">Password</label><div class="relative"><input id="lpw" name="password" type="password" class="input !pr-10" required><button type="button" data-action="togglePw" data-target="lpw" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" tabindex="-1">${EYE_ON}</button></div></div>
      <div class="flex items-center justify-between text-sm"><label class="flex items-center gap-2 text-slate-400"><input type="checkbox" name="remember" checked> Remember me</label><a href="#forgot" class="text-accent-purple hover:underline">Forgot password?</a></div>
      <button class="btn btn-primary w-full" id="loginBtn">Log in</button>
    </form>
    <p class="mt-6 text-center text-sm text-slate-400">No account? <a href="#signup" class="text-accent-purple hover:underline">Sign up</a></p></div>`);
}
function signupView(){
  return authWrap(`<div class="glass-strong rounded-2xl p-7"><h1 class="text-2xl font-bold">Create your account</h1><p class="mt-1 text-sm text-slate-400">Start free. No credit card required.</p>
    <form id="signupForm" class="mt-6 space-y-4">
      <div class="grid grid-cols-2 gap-3"><div><label class="label">First name</label><input name="first_name" class="input" required></div><div><label class="label">Last name</label><input name="last_name" class="input"></div></div>
      <div><label class="label">Email</label><input name="email" type="email" class="input" required></div>
      <div><label class="label">Password</label><div class="relative"><input id="spw" name="password" type="password" class="input !pr-10" data-action="pwStr" minlength="8" required><button type="button" data-action="togglePw" data-target="spw" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" tabindex="-1">${EYE_ON}</button></div><div class="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden"><div id="pwStrFill" class="h-full rounded-full transition-all duration-300" style="width:0%"></div></div><p id="pwStrText" class="mt-0.5 text-[10px] text-slate-500 h-3"></p></div>
      <div><label class="label">Confirm password</label><div class="relative"><input id="spw2" name="confirm" type="password" class="input !pr-10" required><button type="button" data-action="togglePw" data-target="spw2" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" tabindex="-1">${EYE_ON}</button></div></div>
      <button class="btn btn-primary w-full" id="signupBtn">Create account</button>
    </form>
    <p class="mt-5 text-center text-sm text-slate-400">Have an account? <a href="#login" class="text-accent-purple hover:underline">Log in</a></p></div>`);
}
function forgotView(){
  return authWrap(`<div class="glass-strong rounded-2xl p-7"><h1 class="text-2xl font-bold">Reset your password</h1><p class="mt-1 text-sm text-slate-400">We'll email you a reset link.</p>
    <form id="forgotForm" class="mt-6 space-y-4"><div><label class="label">Email</label><input name="email" type="email" class="input" required></div><button class="btn btn-primary w-full">Send reset link</button></form>
    <p class="mt-6 text-center text-sm text-slate-400"><a href="#login" class="text-accent-purple hover:underline">Back to login</a></p></div>`);
}
function resetView(){
  return authWrap(`<div class="glass-strong rounded-2xl p-7"><h1 class="text-2xl font-bold">Set a new password</h1>
    <form id="resetForm" class="mt-6 space-y-4"><div><label class="label">New password</label><div class="relative"><input id="rpw" name="password" type="password" class="input !pr-10" data-action="pwStr" minlength="8" required><button type="button" data-action="togglePw" data-target="rpw" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" tabindex="-1">${EYE_ON}</button></div><div class="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden"><div id="pwStrFill" class="h-full rounded-full transition-all duration-300" style="width:0%"></div></div><p id="pwStrText" class="mt-0.5 text-[10px] text-slate-500 h-3"></p></div><div><label class="label">Confirm</label><div class="relative"><input id="rpw2" name="confirm" type="password" class="input !pr-10" required><button type="button" data-action="togglePw" data-target="rpw2" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" tabindex="-1">${EYE_ON}</button></div></div><button class="btn btn-primary w-full">Update password</button></form></div>`);
}
function verifyView(email){
  return authWrap(`<div class="glass-strong rounded-2xl p-7 text-center">
    <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-4xl" style="background:linear-gradient(135deg,rgba(79,70,229,.3),rgba(139,92,246,.3))">📧</div>
    <h1 class="text-2xl font-bold">Check your email</h1>
    <p class="mt-3 text-sm text-slate-400">We sent a confirmation link to<br><b class="text-white">${esc(email||'your email')}</b></p>
    <div class="mt-5 glass rounded-xl p-4 text-left text-sm text-slate-300 space-y-2.5">
      <p class="flex items-center gap-2"><span class="text-accent-purple">1</span> Open the email from Goalify / Supabase</p>
      <p class="flex items-center gap-2"><span class="text-accent-purple">2</span> Click <b>"Confirm your email address"</b></p>
      <p class="flex items-center gap-2"><span class="text-accent-purple">3</span> You'll be redirected back automatically</p>
    </div>
    <p class="mt-5 text-sm text-slate-400">Didn't get it? <button type="button" class="text-accent-purple hover:underline" data-action="resendVerify" data-email="${esc(email||'')}">Resend email</button></p>
    <a href="#login" class="btn btn-ghost mt-4 w-full text-sm">Back to login</a>
  </div>`);
}

// ============================================================
// QUIZ
// ============================================================
const Q_STUDENT=[['no','No, not a student'],['fulltime','Yes, full-time'],['parttime','Yes, part-time']];
const Q_EMPLOY=[['fulltime','Employed full-time'],['parttime','Employed part-time'],['selfemployed','Self-employed'],['unemployed','Not working'],['student','Student']];
const Q_GOALS=[['emergency','Emergency fund'],['purchase','Big purchase'],['invest','Invest & grow'],['debt','Pay off debt'],['travel','Travel'],['control','Stop overspending']];
const Q_HABITS=[['plan','I plan purchases'],['impulse','I buy on impulse'],['experiences','I spend on experiences'],['track','I track everything'],['subscriptions','I have many subscriptions'],['cash','I prefer saving']];

let QSTEP=0; const QA={income:0,savings:0,budget:{},goals:new Set(),habits:new Set()};
const QSTEPS=['student','employment','income','savings','goals','habits','budget'];

function computePersona(){
  const t={saver:0,goal_chaser:0,student_budgeter:0,lifestyle_spender:0,impulse_buyer:0,future_investor:0};
  if(QA.student==='fulltime'||QA.student==='parttime') t.student_budgeter+=3;
  const spend=Object.values(QA.budget).reduce((a,b)=>a+(+b||0),0);
  const rate=QA.income>0?(QA.income-spend)/QA.income:0;
  if(rate>=.2){t.saver+=3;t.future_investor+=2;} else if(rate<=0){t.impulse_buyer+=2;}
  QA.goals.forEach(g=>{ if(g==='invest')t.future_investor+=3; if(g==='purchase')t.goal_chaser+=3; if(g==='emergency')t.saver+=2; if(g==='control')t.impulse_buyer+=2; if(g==='travel')t.lifestyle_spender+=2; });
  QA.habits.forEach(h=>{ if(h==='impulse')t.impulse_buyer+=3; if(h==='experiences')t.lifestyle_spender+=3; if(h==='plan')t.saver+=2; if(h==='track')t.goal_chaser+=1; if(h==='cash')t.saver+=2; });
  let best='goal_chaser',bs=-1; for(const k in t) if(t[k]>bs){bs=t[k];best=k;} return best;
}

function quizView(){
  return `<div class="relative flex min-h-screen items-center justify-center px-4 py-12"><div class="orb animate-float" style="top:6%;left:8%;width:400px;height:400px;background:radial-gradient(circle,rgba(99,102,241,.4),transparent 70%)"></div><div class="w-full max-w-2xl" id="qInner"></div></div>`;
}
function renderQuiz(){
  const inner=$('#qInner'); if(!inner) return;
  if(QSTEP>=QSTEPS.length){ return finishQuiz(inner); }
  const key=QSTEPS[QSTEP], prog=Math.round(QSTEP/QSTEPS.length*100);
  let body='';
  if(key==='student') body=radioStep('Are you currently a student?',Q_STUDENT,'student');
  else if(key==='employment') body=radioStep('What is your employment status?',Q_EMPLOY,'employment');
  else if(key==='income') body=numberStep('What is your monthly income?','income','e.g. 2000');
  else if(key==='savings') body=numberStep('How much do you save per month?','savings','e.g. 400');
  else if(key==='goals') body=chipStep('What are your financial goals?',Q_GOALS,'goals');
  else if(key==='habits') body=chipStep('Which describe your money habits?',Q_HABITS,'habits');
  else if(key==='budget') body=budgetStep();
  inner.innerHTML=`<div class="mb-8"><div class="mb-2 flex justify-between text-sm text-slate-400"><span>Step ${QSTEP+1} of ${QSTEPS.length}</span><span>${prog}%</span></div><div class="h-2 rounded-full bg-white/10 overflow-hidden"><div class="progress-fill h-full rounded-full" style="width:${prog}%;background:linear-gradient(90deg,#3b82f6,#8b5cf6)"></div></div></div><div class="glass-strong rounded-2xl p-7 anim">${body}<div class="mt-6 flex justify-between">${QSTEP>0?'<button class="text-sm text-slate-400" data-action="qback">← Back</button>':'<span></span>'}${(key==='income'||key==='savings'||key==='goals'||key==='habits'||key==='budget')?'<button class="btn btn-primary text-sm" data-action="qnext">Continue →</button>':''}</div></div>`;
}
function radioStep(q,opts,field){return `<h2 class="text-2xl font-bold">${q}</h2><div class="mt-6 space-y-3">${opts.map(o=>`<button data-action="qradio" data-field="${field}" data-val="${o[0]}" class="flex w-full items-center justify-between rounded-xl border ${QA[field]===o[0]?'border-accent-purple bg-accent-purple/10':'border-white/10 bg-white/5'} px-5 py-4 text-left text-sm hover:bg-white/10">${o[1]} ${QA[field]===o[0]?'<span class="text-accent-purple">✓</span>':''}</button>`).join('')}</div>`;}
function numberStep(q,field,ph){return `<h2 class="text-2xl font-bold">${q}</h2><div class="mt-6"><div class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4"><span class="text-slate-400">€</span><input id="qnum" type="number" min="0" class="w-full bg-transparent py-4 outline-none" placeholder="${ph}" value="${QA[field]||''}"></div></div>`;}
function chipStep(q,opts,field){return `<h2 class="text-2xl font-bold">${q}</h2><p class="mt-1 text-sm text-slate-400">Select all that apply.</p><div class="mt-6 flex flex-wrap gap-2">${opts.map(o=>`<button data-action="qchip" data-field="${field}" data-val="${o[0]}" class="rounded-xl border ${QA[field].has(o[0])?'border-accent-purple bg-accent-purple/10':'border-white/10 bg-white/5'} px-4 py-2.5 text-sm hover:bg-white/10">${o[1]}</button>`).join('')}</div>`;}
function budgetStep(){return `<h2 class="text-2xl font-bold">Your monthly spending</h2><p class="mt-1 text-sm text-slate-400">Enter what you spend per category (leave 0 if none).</p><div class="mt-6 grid gap-3 sm:grid-cols-2 max-h-[50vh] overflow-y-auto pr-1">${QUIZ_CATS.map(c=>`<div class="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2"><span class="text-lg">${CATS[c].e}</span><span class="flex-1 text-sm">${CATS[c].l}</span><span class="text-slate-400">€</span><input type="number" min="0" data-budget="${c}" class="w-20 bg-transparent text-right outline-none" value="${QA.budget[c]||''}" placeholder="0"></div>`).join('')}</div>`;}

function captureQuizStep(){
  const key=QSTEPS[QSTEP];
  if(key==='income'){ const v=$('#qnum'); if(v) QA.income=+v.value||0; }
  if(key==='savings'){ const v=$('#qnum'); if(v) QA.savings=+v.value||0; }
  if(key==='budget'){ document.querySelectorAll('[data-budget]').forEach(i=>{QA.budget[i.getAttribute('data-budget')]=+i.value||0;}); }
}
async function finishQuiz(inner){
  inner.innerHTML=`<div class="glass-strong rounded-2xl p-10 text-center"><div class="animate-float text-5xl">🧮</div><p class="mt-4 text-slate-400">Analyzing your finances…</p></div>`;
  const spend=Object.values(QA.budget).reduce((a,b)=>a+(+b||0),0);
  const income=QA.income;
  const savings=QA.savings||Math.max(0,income-spend);
  const rate=income>0?Math.max(0,Math.round((income-spend)/income*100)):0;
  const persona=computePersona();
  if(DEMO_MODE){
    // In demo mode, just update the in-memory DEMO_ME object
    Object.assign(DEMO_ME,{monthly_income:income,monthly_savings:savings,budget:QA.budget,personality:persona,onboarded:true});
  } else {
  // save profile
  await sb.from('profiles').update({
    monthly_income:income, monthly_savings:savings, budget:QA.budget,
    goals_text:[...QA.goals], habits:[...QA.habits], personality:persona,
    student_status:QA.student, employment:QA.employment, onboarded:true, updated_at:new Date().toISOString()
  }).eq('id',SESSION.user.id);
  // seed real expenses for this month from the budget (their own data)
  const rows=QUIZ_CATS.filter(c=>(+QA.budget[c]||0)>0).map(c=>({user_id:SESSION.user.id,amount:+QA.budget[c],category:c,source:'quiz',spent_at:todayISO()}));
  if(rows.length) await sb.from('expenses').insert(rows);
  }
  await loadProfile();
  const p=PERSONAS[persona];
  inner.innerHTML=`<div class="glass-strong rounded-2xl p-7 text-center anim">
    <div class="text-6xl">${p.emoji}</div>
    <p class="mt-3 text-sm font-semibold uppercase tracking-widest gtext">Your money personality</p>
    <h2 class="mt-2 text-3xl font-bold">${p.name}</h2>
    <p class="mx-auto mt-3 max-w-md text-sm text-slate-400">${p.desc}</p>
    <div class="mt-5 grid grid-cols-3 gap-3 text-center">
      <div class="glass rounded-xl p-3"><p class="text-xs text-slate-400">Income</p><p class="font-bold">${fmt(income)}</p></div>
      <div class="glass rounded-xl p-3"><p class="text-xs text-slate-400">Spending</p><p class="font-bold">${fmt(spend)}</p></div>
      <div class="glass rounded-xl p-3"><p class="text-xs text-slate-400">Savings rate</p><p class="font-bold gtext">${rate}%</p></div>
    </div>
    <div class="mt-4 glass rounded-xl p-4 text-left"><h3 class="mb-2 text-sm font-semibold">✨ Recommendations</h3><ul class="space-y-1.5 text-sm text-slate-400">${p.recs.map(r=>`<li class="flex gap-2"><span class="text-accent-purple">✓</span>${r}</li>`).join('')}</ul></div>
    <button class="btn btn-primary mt-6 w-full" onclick="location.hash='#app/dashboard'">Go to dashboard →</button>
  </div>`;
}

// ============================================================
// APP SHELL
// ============================================================
const NAV=[['dashboard','Dashboard','📊'],['goals','Goals','🎯'],['analytics','Analytics','📈'],['simulator','Future Simulator','🔮'],['ai','AI Coach','✨'],['challenges','Challenges','🏆'],['squad','Squad','👥'],['plans','Plans','💳'],['student','Student Verify','🎓'],['settings','Settings','⚙️']];
function shell(route,inner){
  const isAdmin=ME?.role==='admin';const NAV=planNav(ME?.plan||'free');const c=caps(ME?.plan||'free');
  const themePicker = c.themes==='full' ? `<div class="mx-3 mt-2 mb-1 rounded-2xl px-3 py-3" style="background:var(--glass);border:1px solid var(--border)">
      <div class="mb-2 flex items-center justify-between">
        <p class="text-[10px] uppercase tracking-widest font-semibold" style="color:var(--muted)">Theme</p>
        ${(()=>{const m=localStorage.getItem('goalify_theme')||'dark';return `<button data-action="setTheme" data-mode="${m==='dark'?'light':'dark'}" class="rounded-lg px-2 py-0.5 text-[10px] hover:bg-white/10 transition" style="color:var(--muted)">${m==='dark'?'☀️ Light':'🌙 Dark'}</button>`;})()}
      </div>
      <div class="flex flex-wrap gap-2">${[['blue','#6366f1'],['green','#22c55e'],['yellow','#eab308'],['orange','#f97316'],['pink','#ec4899'],['red','#ef4444'],['grey','#6b7280']].map(([name,hex])=>{const active=(localStorage.getItem('goalify_color')||'blue')===name;return `<button data-action="setColor" data-color="${name}" title="${name[0].toUpperCase()+name.slice(1)}" class="h-6 w-6 rounded-full transition-all hover:scale-110 shrink-0" style="background:${hex};${active?'outline:2px solid rgba(255,255,255,.7);outline-offset:2px;transform:scale(1.15)':'opacity:.75'}"></button>`;}).join('')}</div>
    </div>` : '';
  return `<div class="min-h-screen"><aside class="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-[#0b0f1d]/80 backdrop-blur-xl lg:flex">
    <div class="px-5 py-6">${brand('#app/dashboard')}</div>
    <nav class="flex-1 space-y-1 px-3 overflow-y-auto">${NAV.map(n=>`<a href="#app/${n[0]}" class="nav-link ${route===n[0]?'active':''} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${route===n[0]?'text-white':'text-slate-400 hover:text-white hover:bg-white/5'}"><span>${n[2]}</span>${n[1]}</a>`).join('')}
    ${isAdmin?`<a href="#admin" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-amber-300 hover:bg-white/5"><span>🛡️</span>Admin Portal</a>`:''}</nav>
    ${themePicker}
    ${ME?.plan==='free'?`<div class="mx-3 mb-3 rounded-xl p-4" style="background:linear-gradient(135deg,rgba(79,70,229,.2),rgba(124,58,237,.2));border:1px solid rgba(255,255,255,.1)"><p class="text-sm font-semibold">Unlock Pro</p><p class="mt-1 text-xs text-slate-400">Verify student status for free Pro.</p><a href="#app/student" class="btn btn-primary mt-3 w-full !py-2 text-xs">Verify now</a></div>`:''}
    <div class="border-t border-white/10 p-3"><div class="flex items-center gap-3 px-2 py-2">${avatarHTML(36)}<div class="min-w-0"><p class="truncate text-sm font-medium">${esc(ME?.first_name||'You')} ${planBadge(ME?.plan)}</p><p class="text-xs text-slate-400">${PLANS[ME?.plan||'free'].name} plan</p></div></div><button class="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/5 hover:text-white" data-action="logout">Sign out</button></div>
  </aside>
  <div class="lg:pl-64"><div class="flex items-center justify-between border-b border-white/10 px-4 py-3 lg:hidden">${brand('#app/dashboard')}<select onchange="location.hash='#app/'+this.value" class="input !w-auto !py-1.5 text-sm">${NAV.map(n=>`<option value="${n[0]}" ${route===n[0]?'selected':''}>${n[1]}</option>`).join('')}</select></div><main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">${inner}</main></div></div>`;
}
function statCard(label,val,sub,emoji){return `<div class="glass rounded-2xl p-5 anim"><div class="flex items-center justify-between"><span class="text-sm text-slate-400">${label}</span><span>${emoji}</span></div><p class="mt-3 text-2xl font-bold">${val}</p>${sub?`<p class="mt-1 text-xs text-slate-400">${sub}</p>`:''}</div>`;}
function ring(score,label,sub){const r=58,c=2*Math.PI*r,off=c-(score/100)*c,gid='g'+label.replace(/\W/g,'');return `<div class="flex flex-col items-center"><div class="relative" style="width:140px;height:140px"><svg width="140" height="140" style="transform:rotate(-90deg)"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><circle cx="70" cy="70" r="${r}" stroke="rgba(255,255,255,.08)" stroke-width="8" fill="none"/><circle cx="70" cy="70" r="${r}" stroke="url(#${gid})" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" style="transition:stroke-dashoffset 1s ease"/></svg><div class="absolute inset-0 flex flex-col items-center justify-center"><span class="text-3xl font-extrabold">${score}</span><span class="text-xs text-slate-400">${sub||''}</span></div></div><p class="mt-2 text-sm font-medium text-slate-400">${label}</p></div>`;}

let GOALS=[],EXPENSES=[],AIUSED=0;

// ---- minimal dashboard building blocks ----
function goalOverviewHTML(){
  const g=topGoal();
  if(!g) return `<div class="glass-strong rounded-2xl p-6"><div class="flex flex-wrap items-center justify-between gap-4"><div><h2 class="text-lg font-semibold">No active goal yet</h2><p class="text-sm" style="color:var(--muted)">Set a goal and Goalify shows exactly what to cut to reach it faster.</p></div><a href="#app/goals" class="btn btn-primary !py-2.5 text-sm">+ Create a goal</a></div></div>`;
  const p=pct(g.saved_amount,g.target_amount),remaining=Math.max(0,g.target_amount-g.saved_amount);
  const base=Math.max(0,Number(g.monthly_contribution)||0),months=base>0?Math.ceil(remaining/base):null;
  const daysLeft=months!=null?months*30:null,perDay=daysLeft?remaining/daysLeft:null;
  return `<div class="glass-strong rounded-2xl p-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3"><span class="text-3xl">${g.emoji||'🎯'}</span><div><p class="text-[11px] uppercase tracking-widest" style="color:var(--muted)">Top goal</p><h2 class="text-xl font-bold">${esc(g.name)}</h2></div></div>
      <div class="text-right"><p class="text-2xl font-extrabold gtext">${p}%</p><p class="text-xs" style="color:var(--muted)">${fmt(g.saved_amount)} / ${fmt(g.target_amount)}</p></div>
    </div>
    <div class="mt-4 h-3 overflow-hidden rounded-full" style="background:var(--glass)"><div class="progress-fill h-full rounded-full" style="width:${p}%;background:linear-gradient(90deg,var(--accent1),var(--accent2))"></div></div>
    <div class="mt-4 grid grid-cols-3 gap-3 text-center">
      <div class="rounded-xl p-3" style="background:var(--glass)"><p class="text-xs" style="color:var(--muted)">Still needed</p><p class="font-bold">${fmt(remaining)}</p></div>
      <div class="rounded-xl p-3" style="background:var(--glass)"><p class="text-xs" style="color:var(--muted)">Time left</p><p class="font-bold">${daysLeft!=null?daysLeft+' days':'—'}</p></div>
      <div class="rounded-xl p-3" style="background:var(--glass)"><p class="text-xs" style="color:var(--muted)">Per day</p><p class="font-bold">${perDay!=null?fmt(perDay):'set a plan'}</p></div>
    </div>
  </div>`;
}
function whatToReduceHTML(){
  const items=whatToReduce(),sm=savingsMode(),cur=ME.savings_mode||'fun';
  return `<div class="glass rounded-2xl p-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 class="font-semibold">✂️ What to reduce</h3><p class="text-xs" style="color:var(--muted)">This month · ${sm.emoji} ${sm.name} mode (${Math.round(sm.cut*100)}% cuts)</p></div>
      <div class="flex gap-1 rounded-xl p-1 text-xs" style="background:var(--glass)">${Object.keys(SAVINGS_MODES).map(k=>`<button data-action="setSavingsMode" data-mode="${k}" class="rounded-lg px-2.5 py-1.5 ${cur===k?'text-white':''}" title="${SAVINGS_MODES[k].name}" style="${cur===k?'background:linear-gradient(90deg,var(--accent1),var(--accent2))':'color:var(--muted)'}">${SAVINGS_MODES[k].emoji}</button>`).join('')}</div>
    </div>
    ${items.length?`<div class="space-y-3">${items.map(it=>{const m=CATS[it.cat]||CATS.other;return `<div class="flex items-center gap-3 rounded-xl p-3" style="background:var(--glass)"><span class="flex h-10 w-10 items-center justify-center rounded-lg text-lg" style="background:var(--glass)">${m.e}</span><div class="min-w-0 flex-1"><p class="text-sm font-medium">${m.l}</p><p class="text-xs" style="color:var(--muted)">Now ${fmt(it.spend)}/mo${it.impact?' · '+it.impact:''}</p></div><div class="text-right"><p class="text-sm font-bold text-emerald-400">save ${fmt(it.save)}</p><p class="text-[11px]" style="color:var(--muted)">per month</p></div></div>`;}).join('')}<div class="rounded-xl p-3 text-center text-sm" style="background:var(--glass)">Total potential: <b class="text-emerald-400">${fmt(items.reduce((a,i)=>a+i.save,0))}/mo</b></div></div>`:`<p class="py-8 text-center text-sm" style="color:var(--muted)">Add some expenses and Goalify will show exactly where to cut.</p>`}
  </div>`;
}

function todayMissionsHTML(){
  const due=allMissions().filter(missionDueToday);
  const doneToday=allMissions().filter(m=>m.cadence==='daily'&&isDoneToday(m.id)).length;
  return `<div class="glass-strong rounded-2xl p-6">
    <div class="mb-4 flex items-center justify-between"><h3 class="font-semibold">✅ Today's missions</h3><span class="text-xs" style="color:var(--muted)">${doneToday} done today</span></div>
    ${due.length?`<div class="space-y-2">${due.map(m=>{const d=DIFF[m.difficulty]||DIFF.easy,st=missionStreak(m.id),h=streakHealth(st);return `<div class="flex items-center gap-3 rounded-xl p-3" style="background:var(--glass)"><button data-action="checkin" data-id="${m.id}" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition" title="Check in" style="background:var(--glass);color:var(--muted);border:1px solid var(--border)">+</button><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">${esc(m.title)}</p><p class="text-[11px]" style="color:var(--muted)">${esc(m.goal.name)} · <span style="color:${d.c}">${d.label}</span> · +${d.xp} XP</p></div><span class="text-sm font-bold" style="color:${h.c}">${h.e} ${st}</span></div>`;}).join('')}</div>`:`<p class="py-6 text-center text-sm" style="color:var(--muted)">🎉 All caught up for today — nice work!</p>`}
    <a href="#app/goals" class="mt-3 block text-center text-sm font-medium text-accent-purple hover:underline">Manage missions →</a>
  </div>`;
}
function weeklySummaryHTML(){
  const wk=weekCheckins(),us=userStreak(),h=streakHealth(us),goalsActive=GOALS.filter(g=>!g.completed).length;
  return `<div class="glass rounded-2xl p-6"><h3 class="mb-4 font-semibold">📅 This week</h3>
    <div class="grid grid-cols-3 gap-3 text-center">
      <div class="rounded-xl p-3" style="background:var(--glass)"><p class="text-2xl font-extrabold">${wk}</p><p class="text-[11px]" style="color:var(--muted)">check-ins</p></div>
      <div class="rounded-xl p-3" style="background:var(--glass)"><p class="text-2xl font-extrabold" style="color:${h.c}">${us}</p><p class="text-[11px]" style="color:var(--muted)">best streak</p></div>
      <div class="rounded-xl p-3" style="background:var(--glass)"><p class="text-2xl font-extrabold">${goalsActive}</p><p class="text-[11px]" style="color:var(--muted)">active goals</p></div>
    </div>
    <div class="mt-3 rounded-xl p-3 text-center text-sm" style="background:var(--glass)">Streak health: <b style="color:${h.c}">${h.e} ${h.label}</b></div>
    <button class="btn btn-ghost mt-3 w-full !py-2 text-sm" data-action="shareCard">📤 Share weekly progress</button>
  </div>`;
}
function behaviourCardHTML(){
  const has=PLAN_ORDER.indexOf(ME.plan)>=PLAN_ORDER.indexOf('pro');
  if(!has)return `<div class="glass rounded-2xl p-6"><div class="flex items-center justify-between"><h3 class="font-semibold">🧠 AI behaviour coach</h3><span class="rounded-full px-2 py-0.5 text-[10px]" style="background:var(--glass);color:var(--muted)">Pro</span></div><p class="mt-2 text-sm" style="color:var(--muted)">Goalify spots when you tend to slip and adjusts mission difficulty automatically.</p><a href="#app/plans" class="btn btn-primary mt-3 text-sm">Unlock Pro</a></div>`;
  const r=behaviourReport(),lines=[];
  if(r.worstDay)lines.push(`You miss most on <b>${r.worstDay}</b> (${r.worstRate}% skipped) — plan a lighter mission that day.`);
  r.suggestions.forEach(s=>{const m=s.m;lines.push(s.type==='up'?`🔼 You're crushing “${esc(m.title)}” — bump it to ${m.difficulty==='easy'?'Medium':'Hard'} for more XP.`:`🔽 “${esc(m.title)}” is slipping — ease it off to rebuild momentum.`);});
  if(!lines.length)lines.push('Consistent across the board — keep those streaks alive! 🔥');
  return `<div class="glass-strong rounded-2xl p-6"><div class="mb-3 flex items-center gap-2 font-semibold">🧠 AI behaviour coach</div><ul class="space-y-2 text-sm" style="color:var(--muted)">${lines.slice(0,3).map(t=>`<li class="flex gap-2"><span class="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style="background:var(--accent2)"></span><span>${t}</span></li>`).join('')}</ul><a href="#app/ai" class="mt-3 block text-sm font-medium text-accent-purple hover:underline">Open AI coach →</a></div>`;
}

function dashboardView(){
  const plan=ME.plan,s=snapshot(ME,EXPENSES),g=goalifyScore(s,GOALS,ME.xp),h=healthScore(s);const c=caps(plan);
  const persona=ME.personality?PERSONAS[ME.personality]:null;
  const active=GOALS.filter(x=>!x.completed).slice(0,3);
  const tier=plan==='free'?'Simple starter':plan==='pro'?'Focused productivity':'Social productivity';
  const header=`<div class="flex flex-wrap items-end justify-between gap-3"><div><h1 class="text-3xl font-bold">Welcome back${ME.first_name?', '+esc(ME.first_name):''} 👋</h1><p class="mt-1 text-sm text-slate-400">${PLANS[plan].name} · ${tier}${persona?` · ${persona.name} ${persona.emoji}`:''}</p></div><a href="#app/goals" class="btn btn-primary !py-2.5 text-sm">+ New goal</a></div>`;
  const statsGrid=`<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    ${statCard('Monthly income',fmt(s.income),'','💶')}${statCard('Monthly spending',fmt(s.spending),'','📉')}${statCard('Leftover',fmt(s.leftover),s.leftover>=0?'On track':'Over budget','🐖')}
    ${statCard('Savings rate',s.savingsRate+'%','','📊')}${statCard('Active goals',GOALS.filter(x=>!x.completed).length,'','🎯')}${c.gamify?statCard('Level',levelFromXp(ME.xp).level,(ME.xp||0)+' XP','⭐'):statCard('Goals completed',GOALS.filter(x=>x.completed).length,'all-time','✅')}
  </div>`;
  const thirdCard = c.ai
   ? `<div class="glass-strong rounded-2xl p-6 flex flex-col"><div class="mb-3 flex items-center gap-2 font-semibold">✨ AI Insights</div><ul class="flex-1 space-y-3 text-sm text-slate-400" id="aiInsights"><li>Generating…</li></ul><a href="#app/ai" class="mt-4 text-sm font-medium text-accent-purple hover:underline">Open AI Coach →</a></div>`
   : c.analytics
   ? `<div class="glass-strong rounded-2xl p-6 flex flex-col"><div class="mb-3 flex items-center gap-2 font-semibold">🔮 Forecast</div><p class="flex-1 text-sm text-slate-400">At this pace you'll save <b class="text-white">${fmt(Math.max(0,s.leftover*12))}</b> this year. ${s.savingsRate<20?'Lifting your savings rate to 20% adds '+fmt(Math.max(0,(s.income*0.2-s.leftover)*12))+'/yr.':'Strong savings rate — keep going!'}</p><a href="#app/simulator" class="mt-4 text-sm font-medium text-accent-purple hover:underline">Open Simulator →</a></div>`
   : `<div class="glass-strong rounded-2xl p-6 flex flex-col"><div class="mb-3 flex items-center gap-2 font-semibold">🚀 Grow with Goalify</div><p class="flex-1 text-sm text-slate-400">Free covers up to 3 goals and the basics. Upgrade to <b class="text-white">Pro</b> for advanced analytics and the Future Simulator, or <b class="text-white">Premium</b> for social, themes and AI.</p><a href="#app/plans" class="mt-4 text-sm font-medium text-accent-purple hover:underline">See plans →</a></div>`;
  const rings=`<div class="grid gap-6 lg:grid-cols-3"><div class="glass rounded-2xl p-6 flex items-center justify-center">${ring(g,'Goalify Score','/100')}</div><div class="glass rounded-2xl p-6 flex items-center justify-center">${ring(h.v,'Money Health',h.r)}</div>${thirdCard}</div>`;
  const gamifyRow=c.gamify?`<div class="grid gap-6 lg:grid-cols-2">${todayMissionsHTML()}<div class="space-y-6">${weeklySummaryHTML()}${behaviourCardHTML()}</div></div>`:'';
  const overview=`<div class="grid gap-6 lg:grid-cols-2">${goalOverviewHTML()}${whatToReduceHTML()}</div>`;
  let analytics='';
  if(c.analytics){
    analytics=`<div class="glass rounded-2xl p-4 sm:p-6"><div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><h3 class="font-semibold">Spending</h3><div class="grid grid-cols-3 gap-1 rounded-xl p-1 text-xs sm:flex" style="background:var(--glass)">${[['month','1 Month'],['year','1 Year'],['five','5 Years']].map((t,i)=>`<button data-action="tf" data-tf="${t[0]}" class="rounded-lg px-2.5 py-1.5 text-center ${i===1?'text-white':''}" style="${i===1?'background:linear-gradient(90deg,var(--accent1),var(--accent2))':'color:var(--muted)'}">${t[1]}</button>`).join('')}</div></div><div style="height:200px;max-height:40vh"><canvas id="spendChart"></canvas></div></div>
    <div class="grid gap-6 lg:grid-cols-2"><div class="glass rounded-2xl p-6"><h3 class="font-semibold mb-4">Spending by category</h3><canvas id="catChart" height="180"></canvas></div>
    <div class="glass rounded-2xl p-6"><div class="mb-4 flex items-center justify-between"><h3 class="font-semibold">Goal progress</h3><a href="#app/goals" class="text-sm text-accent-purple hover:underline">View all</a></div>${active.length?active.map(gg=>{const p=pct(gg.saved_amount,gg.target_amount);return `<div class="mb-4"><div class="mb-1 flex justify-between text-sm"><span>${gg.emoji||'🎯'} ${esc(gg.name)}</span><span class="text-slate-400">${fmt(gg.saved_amount)} / ${fmt(gg.target_amount)}</span></div><div class="h-2.5 rounded-full bg-white/10 overflow-hidden"><div class="progress-fill h-full rounded-full" style="width:${p}%;background:linear-gradient(90deg,var(--accent1),var(--accent2))"></div></div></div>`;}).join(''):`<p class="py-8 text-center text-sm text-slate-400">No active goals.</p>`}</div></div>
    <div class="glass rounded-2xl p-6"><div class="mb-1 flex items-center gap-2 font-semibold">🔮 Predictions</div><p class="text-sm text-slate-400">At your current pace you'll spend about <b class="text-white">${fmt(s.spending*12)}</b> this year and save <b class="text-white">${fmt(Math.max(0,s.leftover*12))}</b>.</p></div>`;
  }
  return `<div class="space-y-6">${header}${gamifyRow}${statsGrid}${rings}${overview}${analytics}</div>`;
}

function missionRow(m){
  const d=DIFF[m.difficulty]||DIFF.easy,done=isDoneToday(m.id),streak=missionStreak(m.id),h=streakHealth(streak);
  const tw=doneThisWeek(m.id),tgt=missionTarget(m),paused=m.status==='paused';
  return `<div class="rounded-xl p-3" style="background:var(--glass);${paused?'opacity:.55':''}">
    <div class="flex items-center gap-3">
      <button data-action="checkin" data-id="${m.id}" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition" title="${done?'Undo today':'Check in'}" style="${done?'background:linear-gradient(135deg,var(--accent1),var(--accent2));color:#fff':'background:var(--glass);color:var(--muted);border:1px solid var(--border)'}">${done?'✓':'+'}</button>
      <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium ${paused?'line-through':''}">${esc(m.title)}</p>
        <p class="text-[11px]" style="color:var(--muted)">${m.cadence==='daily'?'Daily':'Weekly'} · ${tw}/${tgt} this week · <span style="color:${d.c}">${d.label}</span> · +${d.xp} XP</p></div>
      <div class="text-right"><p class="text-sm font-bold" style="color:${h.c}">${h.e} ${streak}</p><p class="text-[10px]" style="color:var(--muted)">${h.label}</p></div>
      <div class="flex flex-col gap-1">
        <button data-action="pauseMission" data-id="${m.id}" class="text-xs" style="color:var(--muted)" title="${paused?'Resume':'Pause'}">${paused?'▶':'⏸'}</button>
        <button data-action="delMission" data-id="${m.id}" class="text-xs text-slate-400 hover:text-red-400" title="Delete">🗑</button>
      </div>
    </div></div>`;
}
function goalCard(g){
  const prog=goalProgress(g),lvl=goalLevel(g),ms=g.missions||[];const c=caps(ME.plan);
  const canAddMission=true;
  const canDelete=c.canDelete; // Free plan: archive only, no delete
  const archived = g.status==='archived';
  const missionsBlock = c.gamify ? `<div class="mt-4"><div class="mb-2 flex items-center justify-between"><p class="text-xs font-semibold uppercase tracking-wide" style="color:var(--muted)">Missions (${ms.length})</p><span class="text-[11px]" style="color:var(--muted)">${lvl.xp} XP${lvl.next?` · ${lvl.next-lvl.xp} to Lv.${lvl.idx+1}`:' · max'}</span></div>
      <div class="space-y-2">${ms.length?ms.map(missionRow).join(''):`<p class="rounded-xl p-3 text-center text-xs" style="background:var(--glass);color:var(--muted)">No missions yet — add the weekly actions that drive this goal.</p>`}</div>
      <button class="btn btn-ghost mt-2 w-full !py-2 text-sm" data-action="newMission" data-goal="${g.id}">+ Add mission</button>
    </div>` : '';
  return `<div class="glass rounded-2xl overflow-hidden anim" style="${archived?'opacity:.6':''}">${g.image_url?`<img src="${esc(g.image_url)}" class="h-28 w-full object-cover">`:''}
  <div class="p-5">
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-3"><span class="text-3xl">${g.emoji||'🎯'}</span><div><h3 class="font-semibold leading-tight">${esc(g.name)}</h3><span class="text-xs ${g.completed?'text-emerald-400':''}" style="${g.completed?'':'color:var(--muted)'}">${g.completed?'✓ Completed':archived?'📦 Archived':'Active'}</span></div></div>
      <div class="flex items-center gap-2">${c.gamify?`<span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" style="background:var(--glass)">${lvl.emoji} Lv.${lvl.idx}</span>`:''}
      <button data-action="archiveGoal" data-id="${g.id}" class="text-sm" style="color:var(--muted)" title="${archived?'Restore':'Archive'}">${archived?'♻️':'📦'}</button>
      ${canDelete?`<button data-action="delGoal" data-id="${g.id}" class="text-slate-400 hover:text-red-400" title="Delete">🗑</button>`:''}</div>
    </div>
    <div class="mt-4"><div class="mb-1 flex justify-between text-xs" style="color:var(--muted)"><span>Goal progress</span><span>${prog}%</span></div><div class="h-2.5 overflow-hidden rounded-full" style="background:var(--glass)"><div class="progress-fill h-full rounded-full" style="width:${prog}%;background:linear-gradient(90deg,var(--accent1),var(--accent2))"></div></div></div>
    ${g.target_amount?`<div class="mt-3 flex items-center gap-2"><input type="number" class="input !py-1.5 text-sm" placeholder="Add €" id="c-${g.id}"><button class="btn btn-primary !px-3 !py-1.5 text-sm shrink-0" data-action="contrib" data-id="${g.id}">Save</button><span class="text-xs shrink-0" style="color:var(--muted)">${fmt(g.saved_amount)}/${fmt(g.target_amount)}</span></div>`:''}
    ${missionsBlock}
  </div></div>`;
}
function goalsView(){
  const limit=PLANS[ME.plan].goalLimit, total=GOALS.length, atLimit=limit!==-1&&total>=limit;
  return `<div class="space-y-6"><div class="flex flex-wrap items-end justify-between gap-3"><div><h1 class="text-3xl font-bold">Goals</h1><p class="mt-1 text-sm text-slate-400">Long-term goals, broken into weekly missions you check in on. ${limit===-1?'Unlimited goals.':total+' / '+limit+' goals used (Free — archived goals still count).'}</p></div><button class="btn btn-primary !py-2.5 text-sm" data-action="newGoal" ${atLimit?'disabled':''}>+ New goal</button></div>
  ${atLimit?`<div class="glass rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4" style="border:1px solid var(--accent2)"><div><p class="text-sm font-semibold">🔒 You've used all ${limit} Free goals</p><p class="mt-0.5 text-sm text-slate-400">Upgrade for <b>unlimited goals & missions</b>, AI insights and more.</p></div><a href="#app/plans" class="btn btn-primary !py-2 text-sm shrink-0">Upgrade</a></div>`:''}
  ${GOALS.length===0?`<div class="glass rounded-2xl p-16 text-center"><div class="text-5xl">🎯</div><h3 class="mt-4 text-lg font-semibold">No goals yet</h3><p class="mt-1 text-sm text-slate-400">Create your first goal, then add missions that drive it.</p><button class="btn btn-primary mt-5 text-sm" data-action="newGoal">+ Create a goal</button></div>`:
  `<div class="grid gap-5 lg:grid-cols-2">${GOALS.map(goalCard).join('')}</div>`}</div>`;
}

function analyticsView(){
  return `<div class="space-y-5"><div><h1 class="text-3xl font-bold">Analytics</h1><p class="mt-1 text-sm text-slate-400">Track expenses and explore spending across every timeframe.</p></div>
  <div class="glass rounded-2xl p-4 sm:p-5"><div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><h3 class="font-semibold">Spending</h3><div class="grid grid-cols-3 gap-1 rounded-xl p-1 text-xs sm:flex" style="background:var(--glass)">${[['month','1 Month'],['year','1 Year'],['five','5 Years']].map((t,i)=>`<button data-action="tf" data-tf="${t[0]}" class="rounded-lg px-2.5 py-1.5 text-center ${i===1?'text-white':''}" style="${i===1?'background:linear-gradient(90deg,var(--accent1),var(--accent2))':'color:var(--muted)'}">${t[1]}</button>`).join('')}</div></div><div style="height:200px;max-height:42vh"><canvas id="spendChart"></canvas></div></div>
  <div class="grid gap-5 lg:grid-cols-3"><div class="glass rounded-2xl p-5 h-fit"><h3 class="font-semibold">Add expense</h3><form id="expForm" class="mt-3 space-y-2.5"><div><label class="label">Amount (€)</label><input name="amount" type="number" step="0.01" class="input" required></div><div><label class="label">Category</label><select name="category" class="input">${Object.keys(CATS).map(c=>`<option value="${c}">${CATS[c].e} ${CATS[c].l}</option>`).join('')}</select></div><div><label class="label">Merchant</label><input name="merchant" class="input" placeholder="optional"></div><div><label class="label">Date</label><input name="date" type="date" class="input" value="${todayISO()}"></div><button class="btn btn-primary w-full text-sm">+ Add expense</button></form></div>
  <div class="glass rounded-2xl p-5 lg:col-span-2"><h3 class="font-semibold">Recent transactions</h3>${EXPENSES.length===0?`<p class="py-10 text-center text-sm text-slate-400">No transactions yet.</p>`:`<div class="mt-3 divide-y divide-white/5 max-h-[340px] overflow-y-auto pr-1">${EXPENSES.slice(0,50).map(e=>{const m=CATS[e.category]||CATS.other,inc=e.category==='income';return `<div class="flex items-center gap-3 py-2.5"><span class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-lg">${m.e}</span><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">${esc(e.merchant||m.l)}</p><p class="text-xs text-slate-400">${m.l} · ${e.spent_at}</p></div><span class="text-sm font-semibold ${inc?'text-emerald-400':''}">${inc?'+':'-'}${fmt(e.amount)}</span><button data-action="delExp" data-id="${e.id}" class="text-slate-400 hover:text-red-400">🗑</button></div>`;}).join('')}</div>`}</div></div></div>`;
}

function simulatorView(){
  return `<div class="space-y-6"><div><h1 class="text-3xl font-bold">Future Simulator</h1><p class="mt-1 text-sm text-slate-400">Model your savings, goal dates and growth.</p></div>
  <div class="grid gap-6 lg:grid-cols-3"><div class="glass rounded-2xl p-6 h-fit space-y-5"><h3 class="font-semibold">Your inputs</h3>
  ${[['simIncome','Monthly income',Math.round(ME.monthly_income)||2000,0,10000,50],['simExp','Monthly expenses',Math.round(snapshot(ME,EXPENSES).spending)||1400,0,10000,50],['simGoal','Savings goal',10000,500,100000,500]].map(x=>`<div><div class="mb-1 flex justify-between text-sm"><span class="text-slate-400">${x[1]}</span><span id="${x[0]}V" class="font-medium"></span></div><input id="${x[0]}" type="range" min="${x[3]}" max="${x[4]}" step="${x[5]}" value="${x[2]}" class="w-full" style="accent-color:#8b5cf6" data-action="sim"></div>`).join('')}
  <div><div class="mb-1 flex justify-between text-sm"><span class="text-slate-400">Annual growth</span><span id="simRateV" class="font-medium">2%</span></div><input id="simRate" type="range" min="0" max="10" step="0.5" value="2" class="w-full" style="accent-color:#8b5cf6" data-action="sim"></div></div>
  <div class="lg:col-span-2 space-y-5"><div class="grid gap-4 sm:grid-cols-3"><div class="glass rounded-2xl p-5"><p class="text-sm text-slate-400">Monthly savings</p><p id="simSave" class="mt-2 text-2xl font-bold text-emerald-400"></p></div><div class="glass rounded-2xl p-5"><p class="text-sm text-slate-400">Goal reached in</p><p id="simMonths" class="mt-2 text-2xl font-bold"></p></div><div class="glass rounded-2xl p-5"><p class="text-sm text-slate-400">In 5 years</p><p id="sim5y" class="mt-2 text-2xl font-bold gtext"></p></div></div>
  <div class="glass rounded-2xl p-4 sm:p-5"><h3 class="font-semibold mb-3">5-year projection</h3><div style="height:200px;max-height:38vh"><canvas id="simChart"></canvas></div></div>
  <div id="simInsight" class="glass-strong rounded-2xl p-5 text-sm"></div>
  <div class="glass rounded-2xl p-5"><h3 class="font-semibold mb-3">🏁 Milestones on the way</h3><div id="simMilestones" class="grid gap-3 sm:grid-cols-2"></div></div>
  <div class="glass rounded-2xl p-5"><h3 class="font-semibold mb-3">⚡ Try a scenario</h3><div class="flex flex-wrap gap-2">${[['Cut €100/mo more','cut100'],['Save aggressively','aggressive'],['Invest at 7%','invest'],['Reset','reset']].map(s=>`<button class="rounded-full px-3 py-1.5 text-xs" style="background:var(--glass);color:var(--muted)" data-action="simPreset" data-preset="${s[1]}">${s[0]}</button>`).join('')}</div></div>
  </div></div></div>`;
}

function aiView(){
  const plan=ME.plan,limit=PLANS[plan].ai,cm=ME.coach_mode||'fun';
  return `<div class="space-y-6"><div class="flex flex-wrap items-end justify-between gap-3"><div><h1 class="text-3xl font-bold">AI Coach</h1><p class="mt-1 text-sm text-slate-400">Real AI financial coaching.</p></div><div class="text-sm text-slate-400">Today: <span id="aiCount">${AIUSED}</span>${limit===-1?' · Unlimited':' / '+limit+' messages'}</div></div>
  ${behaviourCardHTML()}
  <div class="glass rounded-2xl p-4"><p class="mb-2 text-xs font-medium" style="color:var(--muted)">Coach personality</p><div class="flex flex-wrap gap-2">${Object.keys(COACH_MODES).map(k=>{const c=COACH_MODES[k],on=cm===k;return `<button data-action="setCoachMode" data-mode="${k}" class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${on?'text-white':''}" style="${on?'background:linear-gradient(135deg,var(--accent1),var(--accent2))':'background:var(--glass);color:var(--muted)'}"><span>${c.emoji}</span>${c.name}</button>`;}).join('')}</div></div>
  <div class="glass-strong rounded-2xl p-6 flex flex-col" style="height:56vh"><div class="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 font-semibold">${COACH_MODES[cm].emoji} ${COACH_MODES[cm].name} <span class="text-xs font-normal" style="color:var(--muted)">· ${COACH_MODES[cm].desc}</span></div>
  <div id="chatLog" class="flex-1 space-y-4 overflow-y-auto pr-1"></div>
  <div class="mt-3 flex flex-wrap gap-2">${['How am I doing this week?','How can I save more?','Where am I overspending?','Roast my spending'].map(s=>`<button class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:text-white" data-action="ask" data-q="${esc(s)}">${s}</button>`).join('')}</div>
  <form id="chatForm" class="mt-3 flex items-center gap-2 glass rounded-xl px-3 py-2"><input id="chatInput" class="flex-1 bg-transparent text-sm outline-none" placeholder="Ask your AI coach…"><button class="btn btn-primary !p-2">→</button></form></div></div>`;
}

let CHAL_FILTER=0; // 0=all, 1, 7, 14
function activeChalCard(c){
  const def=CHALLENGES.find(x=>x.key===c.key);if(!def)return '';
  const day=chalDayNum(c),proofs=c.proofs||[],done=proofs.length,ready=day>=def.days&&done>=def.days;
  const status=c.status;
  let badge='',action='';
  if(status==='approved'){badge='<span class="text-emerald-400">✓ Approved · +'+def.xp+' XP</span>';}
  else if(status==='rejected'){badge='<span class="text-red-400">✗ Rejected — no XP</span>';}
  else if(status==='pending'){badge='<span class="text-amber-300">⏳ Awaiting admin review</span>';action=`<span class="text-xs" style="color:var(--muted)">Proof submitted — XP is granted only after approval.</span>`;}
  else{badge=`<span style="color:var(--muted)">Day ${day} of ${def.days} · ${done} proof${done===1?'':'s'} logged</span>`;
    action=`<div class="mt-3 flex flex-wrap gap-2"><button class="btn btn-ghost !py-2 text-sm" data-action="proofChal" data-key="${c.key}">+ Log today's proof</button>${ready?`<button class="btn btn-primary !py-2 text-sm" data-action="reviewChal" data-key="${c.key}">Submit for review</button>`:''}<button class="btn btn-ghost !py-2 text-sm" data-action="leaveChal" data-key="${c.key}">Leave</button></div>`;}
  const last=proofs.slice(-2).reverse();
  return `<div class="glass rounded-2xl p-5"><div class="flex items-start justify-between gap-2"><div class="flex items-center gap-3"><span class="text-2xl">${def.emoji}</span><div><h4 class="font-semibold leading-tight">${def.title}</h4><p class="text-[11px]" style="color:var(--muted)">${def.days}-day challenge · +${def.xp} XP</p></div></div><span class="text-xs">${badge}</span></div>
    <div class="mt-3 h-2 overflow-hidden rounded-full" style="background:var(--glass)"><div class="h-full rounded-full" style="width:${Math.min(100,Math.round(done/def.days*100))}%;background:linear-gradient(90deg,var(--accent1),var(--accent2))"></div></div>
    ${last.length?`<div class="mt-3 space-y-1">${last.map(p=>`<p class="rounded-lg p-2 text-xs" style="background:var(--glass);color:var(--muted)">📝 ${esc(p.day)}: ${esc(p.note||'')}${p.saved?` · saved €${esc(String(p.saved))}`:''}</p>`).join('')}</div>`:''}
    ${action}</div>`;
}
function challengesView(){
  const {level,inLvl}=levelFromXp(ME.xp);
  const st=streakState(),earned=earnedBadges(),checkedToday=st.last===todayISO();
  const joined=chalState(),joinedKeys=joined.map(c=>c.key);
  const cats=CHALLENGES.filter(t=>!CHAL_FILTER||t.days===CHAL_FILTER);
  const filters=[[0,'All'],[1,'1 day'],[7,'7 days'],[14,'14 days']];
  return `<div class="space-y-6"><div><h1 class="text-3xl font-bold">Challenges</h1><p class="mt-1 text-sm text-slate-400">Real challenges with proof — XP is granted only after your evidence is reviewed. No instant completion.</p></div>
  <div class="grid gap-6 lg:grid-cols-2">
    <div class="glass-strong rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4"><div class="flex items-center gap-4"><span class="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-extrabold text-white" style="background:linear-gradient(135deg,var(--accent1),var(--accent2))">${level}</span><div><p class="font-semibold">Level ${level}</p><p class="text-sm text-slate-400">${ME.xp||0} XP total</p></div></div><div class="w-full sm:w-56"><div class="mb-1 flex justify-between text-xs text-slate-400"><span>${inLvl} XP</span><span>100 XP</span></div><div class="h-2.5 overflow-hidden rounded-full" style="background:var(--glass)"><div class="progress-fill h-full rounded-full" style="width:${inLvl}%;background:linear-gradient(90deg,var(--accent1),var(--accent2))"></div></div></div></div>
    <div class="glass-strong rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4"><div class="flex items-center gap-4"><span class="text-4xl">🔥</span><div><p class="text-2xl font-extrabold">${st.count} day${st.count===1?'':'s'}</p><p class="text-sm text-slate-400">Check-in streak</p></div></div><button class="btn ${checkedToday?'btn-ghost':'btn-primary'} !py-2.5 text-sm" data-action="checkIn" ${checkedToday?'disabled':''}>${checkedToday?'✓ Checked in today':'Check in (+10 XP)'}</button></div>
  </div>
  <div class="glass rounded-2xl p-6"><div class="mb-4 flex items-center justify-between"><h3 class="font-semibold">🏅 Badges</h3><span class="text-xs" style="color:var(--muted)">${earned.size} / ${BADGES.length} earned</span></div>
    <div class="grid gap-4 grid-cols-3 sm:grid-cols-6">${BADGES.map(b=>{const on=earned.has(b.key);return `<div class="flex flex-col items-center text-center" title="${esc(b.desc)}"><span class="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${on?'':'grayscale'}" style="background:var(--glass);${on?'box-shadow:0 0 0 2px var(--accent2)':'opacity:.45'}">${b.emoji}</span><p class="mt-2 text-[11px] font-medium ${on?'':'opacity-50'}">${b.name}</p></div>`;}).join('')}</div></div>
  ${joined.length?`<div><h3 class="mb-3 font-semibold">Your active challenges</h3><div class="grid gap-4 md:grid-cols-2">${joined.map(activeChalCard).join('')}</div></div>`:''}
  <div><div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><h3 class="font-semibold">Challenge catalog</h3><div class="grid grid-cols-4 gap-1 rounded-xl p-1 text-xs sm:flex" style="background:var(--glass)">${filters.map(f=>`<button data-action="chalFilter" data-d="${f[0]}" class="rounded-lg px-2.5 py-1.5 text-center ${CHAL_FILTER===f[0]?'text-white':''}" style="${CHAL_FILTER===f[0]?'background:linear-gradient(90deg,var(--accent1),var(--accent2))':'color:var(--muted)'}">${f[1]}</button>`).join('')}</div></div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${cats.map(t=>{const isJoined=joinedKeys.includes(t.key);return `<div class="glass rounded-2xl p-5 flex flex-col"><div class="flex items-center justify-between"><span class="text-3xl">${t.emoji}</span><span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" style="background:var(--glass);color:var(--muted)">${t.days} day${t.days>1?'s':''}</span></div><h3 class="mt-3 font-semibold">${t.title}</h3><p class="mt-1 flex-1 text-sm text-slate-400">${t.desc}</p><div class="mt-3 text-xs text-accent-violet">+${t.xp} XP on approval</div><button class="btn ${isJoined?'btn-ghost':'btn-primary'} mt-3 w-full !py-2 text-sm" data-action="joinChal" data-key="${t.key}" ${isJoined?'disabled':''}>${isJoined?'In progress':'Start challenge'}</button></div>`;}).join('')}</div></div></div>`;
}

function studentView(){
  return `<div class="space-y-6 max-w-2xl"><div><h1 class="text-3xl font-bold">Student Verification</h1><p class="mt-1 text-sm text-slate-400">Verify your student status to unlock <b class="text-white">Pro free for 2 years</b>. All fields are required.</p></div>
  <div id="svStatus"></div>
  <div class="glass rounded-2xl p-6"><form id="svForm" class="space-y-4"><div><label class="label">University / Institution *</label><input name="university" class="input" required></div><div><label class="label">Student email *</label><input name="student_email" type="email" class="input" placeholder="you@university.edu" required></div><div><label class="label">Proof document * (student ID or enrolment letter)</label><input name="document" type="file" accept="image/*,application/pdf" class="input" required></div><button class="btn btn-primary text-sm">Submit for verification</button></form></div>
  <p class="text-xs text-slate-500">An admin reviews every request. On approval your plan upgrades to Pro for 2 years automatically.</p></div>`;
}

function socialView(){
  const c=caps(ME.plan);const full=c.social==='full';
  const completed=GOALS.filter(g=>g.completed);
  const me=`<div class="glass-strong rounded-2xl p-6"><div class="flex items-center gap-4"><span class="inline-flex h-16 w-16 overflow-hidden rounded-full">${avatarHTML(64)}</span><div class="flex-1 min-w-0"><div class="flex items-center gap-2"><h2 class="text-xl font-bold truncate">${esc(ME.first_name||'You')} ${esc(ME.last_name||'')}</h2>${planBadge(ME.plan)}</div><p class="text-sm" style="color:var(--muted)">@${esc(ME.username||(ME.first_name||'you').toLowerCase())}</p></div></div>
    <div class="mt-4 grid grid-cols-3 gap-3 text-center">${[['Followers',0],['Following',0],['Shared',completed.length]].map(x=>`<div class="rounded-xl p-3" style="background:var(--glass)"><p class="text-2xl font-extrabold">${x[1]}</p><p class="text-[11px]" style="color:var(--muted)">${x[0]}</p></div>`).join('')}</div></div>`;
  const find=`<div class="glass rounded-2xl p-6"><h3 class="font-semibold mb-2">Find people</h3><div class="flex gap-2"><input class="input" placeholder="Search by username…" id="findUser"><button class="btn btn-primary shrink-0" data-action="findUser">Search</button></div><p class="mt-3 text-sm text-center py-6" style="color:var(--muted)">No profiles to show yet. Real people appear here once accounts go live — no placeholder users.</p></div>`;
  const shared = completed.length?`<div class="glass rounded-2xl p-6"><h3 class="font-semibold mb-4">🏆 Your achievement cards</h3><div class="grid gap-3 sm:grid-cols-2">${completed.map(g=>`<div class="rounded-2xl p-5 text-center" style="background:linear-gradient(135deg,var(--accent1),var(--accent2))"><div class="text-3xl">${g.emoji||'🎯'}</div><p class="mt-2 font-bold text-white">${esc(g.name)}</p><p class="text-xs text-white/80">${fmt(g.target_amount)} reached 🎉</p><button class="btn !bg-white/20 !text-white mt-3 !py-1.5 text-xs" data-action="shareCard">📤 Share</button></div>`).join('')}</div></div>`:`<div class="glass rounded-2xl p-6"><h3 class="font-semibold mb-2">🏆 Achievement cards</h3><p class="text-sm text-center py-6" style="color:var(--muted)">Complete a goal to unlock a shareable achievement card.</p></div>`;
  if(!full){
    return `<div class="space-y-6"><div><h1 class="text-3xl font-bold">Social</h1><p class="mt-1 text-sm text-slate-400">Follow people and share your wins. Upgrade to Premium for the full feed, reactions and goal memories.</p></div>${me}${find}${shared}
    <a href="#app/plans" class="block glass rounded-2xl p-5 text-center text-sm" style="border:1px solid var(--border)">✨ <b>Premium</b> unlocks the social feed, reactions, profile banners and goal memories. <span class="text-accent-purple">See plans →</span></a></div>`;
  }
  const feed=`<div class="glass rounded-2xl p-6"><h3 class="font-semibold mb-2">📰 Feed</h3><p class="text-sm text-center py-10" style="color:var(--muted)">Your feed is empty. When people you follow share goals, their updates show here — with reactions. No fake posts.</p></div>`;
  const memories=`<div class="glass rounded-2xl p-6"><h3 class="font-semibold mb-4">🧠 Goal memories <span class="text-[10px] align-middle rounded-full px-2 py-0.5" style="background:var(--glass);color:var(--muted)">progress history</span></h3>${GOALS.length?`<div class="space-y-3">${GOALS.slice(0,6).map(g=>{const p=pct(g.saved_amount,g.target_amount);return `<div class="flex items-center gap-3"><span class="text-xl">${g.emoji||'🎯'}</span><div class="flex-1"><div class="flex justify-between text-sm"><span>${esc(g.name)}</span><span style="color:var(--muted)">${p}%</span></div><div class="h-2 rounded-full mt-1" style="background:var(--glass)"><div class="h-full rounded-full" style="width:${p}%;background:linear-gradient(90deg,var(--accent1),var(--accent2))"></div></div></div></div>`;}).join('')}</div>`:`<p class="text-sm text-center py-6" style="color:var(--muted)">Your progress history builds here as you work toward goals.</p>`}</div>`;
  return `<div class="space-y-6"><div><h1 class="text-3xl font-bold">Social</h1><p class="mt-1 text-sm text-slate-400">Your network, feed, achievement cards and goal memories.</p></div>${me}<div class="grid gap-6 lg:grid-cols-2">${feed}${find}</div>${shared}${memories}</div>`;
}

function plansView(){
  const cur=ME.plan;
  return `<div class="space-y-6"><div><h1 class="text-3xl font-bold">Plans</h1><p class="mt-1 text-sm text-slate-400">Pick the plan that fits your goals. You're currently on <b class="text-white">${PLANS[cur].name}</b>.</p></div>
  <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">${PLAN_ORDER.map(id=>{const p=PLANS[id],isCur=id===cur,hl=p.highlight;
    return `<div class="relative flex flex-col rounded-2xl p-6 ${hl?'glass-strong':'glass'}" style="${isCur?'box-shadow:0 0 0 2px var(--accent2)':(hl?'box-shadow:0 0 40px -10px rgba(99,102,241,.4)':'')}">
      ${isCur?`<span class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-white" style="background:linear-gradient(90deg,var(--accent1),var(--accent2))">Your plan</span>`:(hl?`<span class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-white" style="background:linear-gradient(90deg,var(--accent1),var(--accent2))">Most popular</span>`:'')}
      <h3 class="text-lg font-semibold">${p.name}</h3>
      <div class="mt-2 flex items-baseline gap-1"><span class="text-4xl font-extrabold">€${p.price}</span><span class="text-sm text-slate-400">/mo</span></div>
      <p class="mt-1 text-xs text-slate-400">${p.ai===-1?'Unlimited AI':p.ai+' AI msgs/day'} · ${p.goalLimit===-1?'Unlimited goals':p.goalLimit+' goals'}</p>
      <ul class="mt-4 flex-1 space-y-2 text-sm text-slate-400">${PLAN_FEATURES[id].map(f=>`<li class="flex gap-2"><span class="text-accent-purple">✓</span>${f}</li>`).join('')}</ul>
      ${isCur?`<button class="btn btn-ghost mt-5 w-full text-sm" disabled>Current plan</button>`:`<button class="btn ${hl?'btn-primary':'btn-ghost'} mt-5 w-full text-sm" data-action="demoPlan" data-plan="${id}">${PLAN_ORDER.indexOf(id)>PLAN_ORDER.indexOf(cur)?'Upgrade':'Switch'} to ${p.name}</button>`}
    </div>`;}).join('')}</div>
  ${DEMO_MODE?`<p class="text-xs text-slate-500">Demo: switching plans here lets you preview how each tier looks (e.g. Appearance customization is Pro and up). No payment is taken.</p>`:`<p class="text-xs text-slate-500">Students can unlock Pro for free via <a href="#app/student" class="text-accent-purple hover:underline">Student Verification</a>.</p>`}
  </div>`;
}

function settingsView(){
  const p=ME;
  const curMode=localStorage.getItem('goalify_theme')||'dark',curColor=localStorage.getItem('goalify_color')||'blue',curBg=localStorage.getItem('goalify_bg')||'none';
  const COLORS=[['blue','Blue','#6366f1'],['red','Red','#ef4444'],['green','Green','#22c55e'],['pink','Pink','#ec4899'],['orange','Orange','#f97316'],['yellow','Yellow','#eab308'],['grey','Grey','#6b7280']];
  const BGS=[['none','Plain','#0b0f1d'],['aurora','Aurora','🌌'],['mesh','Mesh','🪩'],['glow','Glow','💡'],['grid','Grid','▦'],['dots','Dots','⋯']];
  const themes=caps(p.plan).themes;
  const appearance = themes==='business'
   ? `<div class="biz-card p-6"><h2 class="text-xl font-bold">🎨 Appearance</h2><p class="mt-1 text-sm" style="color:var(--muted)">Business uses a fixed executive gold theme — no customization, by design.</p></div>`
   : themes==='red'
   ? `<div class="glass rounded-2xl p-6"><div class="flex items-center justify-between"><h2 class="text-xl font-bold">🎨 Appearance</h2><span class="rounded-full px-2.5 py-1 text-[10px] font-medium" style="background:var(--glass);color:var(--muted)">Pro</span></div><div class="mt-4 flex items-center gap-3"><span class="h-10 w-10 rounded-full" style="background:#ef4444;box-shadow:0 0 0 3px var(--bg),0 0 0 5px #ef4444"></span><div><p class="text-sm font-semibold">Signature Red</p><p class="text-sm" style="color:var(--muted)">Pro ships with one focused theme. Full theme + wallpaper customization is a Premium feature.</p></div></div><a href="#app/plans" class="btn btn-ghost mt-4 text-sm">Compare with Premium</a></div>`
   : themes==='none'
   ? `<div class="glass rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4" style="border:1px solid var(--border)"><div><h2 class="text-xl font-bold">🎨 Appearance <span class="ml-1 align-middle text-base">🔒</span></h2><p class="mt-1 text-sm text-slate-400">Free keeps things simple — themes, wallpapers and customization start on Pro & Premium.</p></div><a href="#app/plans" class="btn btn-primary text-sm shrink-0">See plans</a></div>`
   : `<div class="glass rounded-2xl p-6"><div class="flex items-center justify-between"><h2 class="text-xl font-bold">🎨 Appearance</h2><span class="rounded-full px-2.5 py-1 text-[10px] font-medium" style="background:var(--glass);color:var(--muted)">${PLANS[p.plan].name}</span></div>
    <div class="mt-4"><p class="label">Mode</p><div class="flex gap-2">${[['dark','🌙 Dark'],['light','☀️ Light']].map(m=>`<button data-action="setTheme" data-mode="${m[0]}" class="rounded-xl px-4 py-2.5 text-sm ${curMode===m[0]?'text-white':''}" style="${curMode===m[0]?'background:linear-gradient(135deg,var(--accent1),var(--accent2))':'background:var(--glass);color:var(--muted)'}">${m[1]}</button>`).join('')}</div></div>
    <div class="mt-5"><p class="label">Theme color</p><div class="flex flex-wrap gap-3">${COLORS.map(c=>`<button data-action="setColor" data-color="${c[0]}" title="${c[1]}" class="h-10 w-10 rounded-full transition" style="background:${c[2]};${curColor===c[0]?'box-shadow:0 0 0 3px var(--bg),0 0 0 5px '+c[2]:''}"></button>`).join('')}</div></div>
    <div class="mt-5"><p class="label">Background design</p><div class="grid grid-cols-3 gap-3 sm:grid-cols-6">${BGS.map(b=>{const on=curBg===b[0];return `<button data-action="setBg" data-bg="${b[0]}" class="flex flex-col items-center gap-1 rounded-xl p-3 text-xs transition" style="background:var(--glass);${on?'box-shadow:0 0 0 2px var(--accent2)':''}"><span class="text-xl">${b[2].startsWith('#')?'⬛':b[2]}</span><span class="${on?'font-semibold':''}" style="${on?'':'color:var(--muted)'}">${b[1]}</span></button>`;}).join('')}</div></div>
  </div>`;
  return `<div class="space-y-6"><div><h1 class="text-3xl font-bold">Settings</h1><p class="mt-1 text-sm text-slate-400">Manage your account and preferences.</p></div>
  ${appearance}
  <div class="glass rounded-2xl p-6"><h2 class="text-xl font-bold">Profile</h2>
    <div class="mt-4 flex items-center gap-4"><span class="inline-flex h-16 w-16 overflow-hidden rounded-full">${avatarHTML(64)}</span><div><label class="btn btn-ghost text-sm cursor-pointer">📷 Upload photo<input id="avatarInput" type="file" accept="image/*" class="hidden"></label>${p.avatar_url?'<button class="btn btn-ghost text-sm ml-2" data-action="rmAvatar">Remove</button>':''}</div></div>
    <form id="profForm" class="mt-5 grid gap-4 sm:grid-cols-2"><div><label class="label">First name</label><input name="first_name" class="input" value="${esc(p.first_name||'')}"></div><div><label class="label">Last name</label><input name="last_name" class="input" value="${esc(p.last_name||'')}"></div><div><label class="label">Username</label><input name="username" class="input" value="${esc(p.username||'')}"></div><div><label class="label">Country</label><input name="country" list="countryList2" class="input" value="${esc(p.country||'')}"><datalist id="countryList2">${COUNTRIES.map(c=>`<option value="${c}">`).join('')}</datalist></div><div><label class="label">Monthly income (€)</label><input name="monthly_income" type="number" class="input" value="${p.monthly_income||0}"></div><div><label class="label">Currency</label><select name="currency" class="input">${['EUR','USD','GBP'].map(c=>`<option ${p.currency===c?'selected':''}>${c}</option>`).join('')}</select></div><div class="sm:col-span-2"><button class="btn btn-primary text-sm">Save profile</button></div></form></div>
  <div class="grid gap-6 sm:grid-cols-2">
    <div class="glass rounded-2xl p-6"><h2 class="text-xl font-bold">💪 Savings strategy</h2><p class="mt-1 text-sm text-slate-400">Controls how aggressive your cut suggestions are.</p><div class="mt-4 grid grid-cols-2 gap-2">${Object.keys(SAVINGS_MODES).map(k=>{const m=SAVINGS_MODES[k],on=(p.savings_mode||'fun')===k;return `<button data-action="setSavingsMode" data-mode="${k}" class="rounded-xl p-3 text-left text-sm ${on?'text-white':''}" style="${on?'background:linear-gradient(135deg,var(--accent1),var(--accent2))':'background:var(--glass);color:var(--muted)'}"><div class="font-semibold">${m.emoji} ${m.name}</div><div class="text-xs opacity-80">${Math.round(m.cut*100)}% · ${m.desc}</div></button>`;}).join('')}</div></div>
    <div class="glass rounded-2xl p-6"><h2 class="text-xl font-bold">✨ AI coach personality</h2><p class="mt-1 text-sm text-slate-400">How your coach talks to you.</p><div class="mt-4 grid grid-cols-2 gap-2">${Object.keys(COACH_MODES).map(k=>{const m=COACH_MODES[k],on=(p.coach_mode||'fun')===k;return `<button data-action="setCoachMode" data-mode="${k}" class="rounded-xl p-3 text-left text-sm ${on?'text-white':''}" style="${on?'background:linear-gradient(135deg,var(--accent1),var(--accent2))':'background:var(--glass);color:var(--muted)'}"><div class="font-semibold">${m.emoji} ${m.name}</div><div class="text-xs opacity-80">${m.desc}</div></button>`;}).join('')}</div></div>
  </div>
  <div class="glass rounded-2xl p-6"><h2 class="text-xl font-bold">Security · Password</h2><form id="pwForm" class="mt-4 grid gap-4 sm:grid-cols-2"><div><label class="label">New password</label><input name="password" type="password" class="input" minlength="8"></div><div><label class="label">Confirm</label><input name="confirm" type="password" class="input"></div><div class="sm:col-span-2"><button class="btn btn-primary text-sm">Update password</button></div></form></div>
  <div class="glass rounded-2xl p-6"><h2 class="text-xl font-bold">Notifications</h2><div class="mt-4 space-y-3">${[['weekly','Weekly AI reports'],['alerts','Budget alerts'],['goals','Goal updates'],['news','Product news']].map(n=>`<label class="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm"><span>${n[1]}</span><input type="checkbox" data-notif="${n[0]}" ${p.notification_prefs?.[n[0]]?'checked':''}></label>`).join('')}<button class="btn btn-primary text-sm" data-action="saveNotif">Save preferences</button></div></div>
  <div class="grid gap-6 sm:grid-cols-2">
    <div class="glass rounded-2xl p-6"><h2 class="text-xl font-bold">Subscription</h2><p class="mt-1 text-sm text-slate-400">Current: <b class="text-white">${PLANS[p.plan].name}</b> ${planBadge(p.plan)}</p>${p.plan!=='free'?`<p class="mt-3 text-sm text-emerald-400">You have ${PLANS[p.plan].name} access.</p>`:`<a href="#app/plans" class="btn btn-primary mt-4 text-sm">See plans</a>`}</div>
    <div class="glass rounded-2xl p-6"><h2 class="text-xl font-bold">🎟️ Redeem a code</h2><p class="mt-1 text-sm text-slate-400">Have a promo code? Activate your plan instantly.</p><div class="mt-4 flex gap-2"><input id="promoInput" class="input" placeholder="ENTER-CODE-HERE" style="text-transform:uppercase"><button class="btn btn-primary text-sm shrink-0" data-action="redeemPromo">Redeem</button></div></div>
  </div>
  <div class="glass rounded-2xl p-6"><h2 class="text-xl font-bold">Privacy & Data</h2><div class="mt-4 flex flex-wrap gap-2"><button class="btn btn-ghost text-sm" data-action="export">⬇ Export my data</button><a href="mailto:support@goalify.app" class="btn btn-ghost text-sm">🛟 Support Center</a></div></div>
  <div class="glass rounded-2xl p-6"><div class="flex items-center justify-between"><h2 class="text-xl font-bold">🛡️ Admin access</h2>${isDemoAdmin()?'<span class="rounded-full px-2 py-0.5 text-[10px] font-medium text-amber-300" style="background:rgba(245,158,11,.15)">Signed in</span>':''}</div>${isDemoAdmin()?`<p class="mt-1 text-sm text-slate-400">You're signed in as admin.</p><div class="mt-3 flex gap-2"><a href="#admin" class="btn btn-primary text-sm">Open admin dashboard</a><button class="btn btn-ghost text-sm" data-action="adminLogout">Sign out admin</button></div>`:`<p class="mt-1 text-sm text-slate-400">Enter the admin access code to open the admin dashboard.</p><div class="mt-3 flex gap-2"><input id="adminInput" type="password" class="input" placeholder="Access code"><button class="btn btn-primary text-sm shrink-0" data-action="adminLogin">Enter</button></div>`}</div>
  <div class="glass rounded-2xl p-6" style="border:1px solid rgba(239,68,68,.3)"><h2 class="text-xl font-bold text-red-300">Delete account</h2><p class="mt-1 text-sm text-slate-400">Permanently delete your data. This cannot be undone.</p><button class="btn mt-4 text-sm" style="background:rgba(239,68,68,.9);color:#fff" data-action="delAcct">Delete my data</button></div></div>`;
}

// ============================================================
// ADMIN
// ============================================================
function adminDemoView(){
  const codes=Object.entries(PROMO_CODES),used=JSON.parse(localStorage.getItem('goalify_promo_used')||'[]');
  const pendingChals=chalState().filter(c=>c.status==='pending');
  return `<div class="mx-auto max-w-6xl px-4 py-8"><div class="mb-8 flex items-center justify-between"><div class="flex items-center gap-3">${brand('#admin')}<span class="rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-medium text-amber-300">Admin</span></div><div class="flex items-center gap-3 text-sm"><a href="#app/dashboard" class="text-slate-400 hover:text-white">← App</a><button class="btn btn-ghost !py-2 text-sm" data-action="adminLogout">Sign out admin</button></div></div>
  <div class="glass rounded-2xl p-5 mb-6" style="border:1px solid var(--accent2)"><p class="text-sm">⚠️ <b>Demo admin.</b> Real users, subscriptions and verification requests appear here once the Supabase backend is live and people sign up. The data below reads your local demo state.</p></div>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">${statCard('Users',1,'demo','👥')}${statCard('Your plan',PLANS[ME.plan].name,'','💳')}${statCard('Pending challenges',pendingChals.length,'','⚔️')}${statCard('Promo codes',codes.length,'','🎟️')}</div>
  <div class="mt-6 glass rounded-2xl p-6"><h3 class="mb-4 font-semibold">🎟️ Promo codes</h3><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/10 text-left text-xs" style="color:var(--muted)"><th class="pb-2">Code</th><th class="pb-2">Grants</th><th class="pb-2">Status</th></tr></thead><tbody>${codes.map(([code,plan])=>`<tr class="border-b border-white/5"><td class="py-3 font-mono text-xs">${code}</td><td class="py-3">${PLANS[plan].name} ${planBadge(plan)}</td><td class="py-3">${used.includes(code)?'<span class="text-amber-300">used</span>':'<span class="text-emerald-400">active</span>'}</td></tr>`).join('')}</tbody></table></div><p class="mt-3 text-xs text-slate-500">At launch, codes are created/disabled in the database — not hardcoded here.</p></div>
  <div class="mt-6 glass rounded-2xl p-6"><h3 class="mb-4 font-semibold">⚔️ Challenge submissions to review</h3>${pendingChals.length===0?'<p class="py-6 text-center text-sm" style="color:var(--muted)">No submissions awaiting review.</p>':`<div class="space-y-3">${pendingChals.map(c=>{const def=CHALLENGES.find(x=>x.key===c.key)||{title:c.key,xp:0};return `<div class="rounded-xl p-4" style="background:var(--glass)"><div class="flex flex-wrap items-center justify-between gap-2"><div><p class="text-sm font-medium">${def.title}</p><p class="text-xs" style="color:var(--muted)">${(c.proofs||[]).length} proof entries · +${def.xp} XP on approval</p></div><div class="flex gap-2"><button class="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-white" data-action="approveChal" data-key="${c.key}">Approve</button><button class="rounded-lg border border-white/10 px-3 py-1.5 text-xs" data-action="rejectChal" data-key="${c.key}">Reject</button></div></div>${(c.proofs||[]).slice(-3).map(p=>`<p class="mt-2 rounded-lg p-2 text-xs" style="background:var(--glass);color:var(--muted)">📝 ${esc(p.day)}: ${esc(p.note||p.explanation||'')}${p.saved?` · €${esc(String(p.saved))}`:''}</p>`).join('')}</div>`;}).join('')}</div>`}</div>
  <div class="mt-6 glass rounded-2xl p-6"><h3 class="mb-4 font-semibold">🎓 Student verifications</h3><p class="py-6 text-center text-sm" style="color:var(--muted)">Verification requests appear here once the backend is live.</p></div>
  </div>`;
}
async function adminView(){
  if(DEMO_MODE||isDemoAdmin()) return adminDemoView();
  const [{data:users},{data:pending}]=await Promise.all([
    sb.from('profiles').select('id,first_name,last_name,email,plan,role,created_at').order('created_at',{ascending:false}),
    sb.from('student_verifications').select('*').eq('status','pending'),
  ]);
  const {count:aiCount}=await sb.from('ai_usage').select('id',{count:'exact',head:true});
  const list=users||[]; const mrr=list.reduce((a,u)=>a+(PLANS[u.plan]?.price||0),0);
  const counts=PLAN_ORDER.reduce((o,p)=>{o[p]=list.filter(u=>u.plan===p).length;return o;},{});
  return `<div class="mx-auto max-w-6xl px-4 py-8"><div class="mb-8 flex items-center justify-between"><div class="flex items-center gap-3">${brand('#admin')}<span class="rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-medium text-amber-300">Admin</span></div><div class="flex items-center gap-3 text-sm"><a href="#app/dashboard" class="text-slate-400 hover:text-white">← App</a><button class="btn btn-ghost !py-2 text-sm" data-action="logout">Sign out</button></div></div>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">${statCard('Total users',list.length,'','👥')}${statCard('MRR',fmt(mrr),'','📈')}${statCard('AI calls',aiCount||0,'','✨')}${statCard('Pending students',(pending||[]).length,'','🎓')}</div>
  <div class="mt-6 glass rounded-2xl p-6"><h3 class="mb-4 font-semibold">Plan distribution</h3>${PLAN_ORDER.map(id=>{const n=counts[id]||0,p=list.length?Math.round(n/list.length*100):0;return `<div class="mb-3"><div class="mb-1 flex justify-between text-sm"><span>${PLANS[id].name}</span><span class="text-slate-400">${n} (${p}%)</span></div><div class="h-2 rounded-full bg-white/10 overflow-hidden"><div class="h-full rounded-full" style="width:${p}%;background:linear-gradient(90deg,#3b82f6,#8b5cf6)"></div></div></div>`;}).join('')}</div>
  <div class="mt-6 glass rounded-2xl p-6"><h3 class="mb-4 font-semibold">🎓 Student verification requests</h3>${(pending||[]).length===0?'<p class="py-6 text-center text-sm text-slate-400">No pending requests.</p>':`<div class="space-y-3">${pending.map(v=>`<div class="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3"><div><p class="text-sm font-medium">${esc(v.university)}</p><p class="text-xs text-slate-400">${esc(v.student_email)} ${v.document_url?`· <a href="${esc(v.document_url)}" target="_blank" class="text-accent-purple">document</a>`:''}</p></div><div class="flex gap-2"><button class="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-white" data-action="approveSV" data-id="${v.id}">Approve → Pro</button><button class="rounded-lg border border-white/10 px-3 py-1.5 text-xs" data-action="rejectSV" data-id="${v.id}">Reject</button></div></div>`).join('')}</div>`}</div>
  <div class="mt-6 glass rounded-2xl p-6"><h3 class="mb-4 font-semibold">Users (${list.length})</h3><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/10 text-left text-xs text-slate-400"><th class="pb-2">User</th><th class="pb-2">Joined</th><th class="pb-2">Role</th><th class="pb-2">Plan</th></tr></thead><tbody>${list.map(u=>`<tr class="border-b border-white/5"><td class="py-3"><p class="font-medium">${esc((u.first_name||'')+' '+(u.last_name||''))||'—'}</p><p class="text-xs text-slate-400">${esc(u.email)}</p></td><td class="py-3 text-slate-400">${(u.created_at||'').slice(0,10)}</td><td class="py-3">${u.role==='admin'?'<span class="text-amber-300">admin</span>':'user'}</td><td class="py-3"><select data-action="setPlan" data-id="${u.id}" class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs">${PLAN_ORDER.map(pp=>`<option value="${pp}" ${u.plan===pp?'selected':''}>${PLANS[pp].name}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div></div></div>`;
}

// ============================================================
// CHARTS
// ============================================================
const isSpend=(e)=>e.category!=='income'&&e.category!=='savings';
// timeframes: 'month' (last 30 days), 'year' (12 months), 'five' (5 years)
function series(tf){const spend=EXPENSES.filter(isSpend),now=new Date(),out=[];
  if(tf==='month'||tf==='daily'){for(let i=29;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);const k=d.toISOString().slice(0,10);out.push([(i%5===0)?d.toLocaleDateString('en-IE',{day:'numeric',month:'short'}):'',spend.filter(e=>e.spent_at===k).reduce((s,e)=>s+Number(e.amount),0)]);}}
  else if(tf==='five'||tf==='yearly'){for(let i=4;i>=0;i--){const y=now.getFullYear()-i;out.push([''+y,spend.filter(e=>new Date(e.spent_at).getFullYear()===y).reduce((s,e)=>s+Number(e.amount),0)]);}}
  else{for(let i=11;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1),e=new Date(now.getFullYear(),now.getMonth()-i+1,0);out.push([d.toLocaleDateString('en-IE',{month:'short'}),spend.filter(x=>{const dd=new Date(x.spent_at);return dd>=d&&dd<=e;}).reduce((s,x)=>s+Number(x.amount),0)]);}}
  return out;}
// light animation, no constant motion
function chartOpts(){return {responsive:true,maintainAspectRatio:false,animation:{duration:300},resizeDelay:150,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.parsed.y)}}},scales:{x:{grid:{display:false},ticks:{color:'#64748b',font:{size:10},maxRotation:0,autoSkip:true}},y:{grid:{color:'rgba(128,128,128,.10)'},ticks:{color:'#64748b',font:{size:10}}}}};}
function drawSpend(tf){const el=$('#spendChart');if(!el)return;const data=series(tf),ctx=el.getContext('2d');const g=ctx.createLinearGradient(0,0,0,260);g.addColorStop(0,'rgba(139,92,246,.5)');g.addColorStop(1,'rgba(59,130,246,.02)');if(charts.spend)charts.spend.destroy();charts.spend=new Chart(ctx,{type:'line',data:{labels:data.map(d=>d[0]),datasets:[{data:data.map(d=>d[1]),borderColor:'#a855f7',backgroundColor:g,fill:true,tension:.4,pointRadius:0,borderWidth:2.5}]},options:chartOpts()});}
function drawCat(){const el=$('#catChart');if(!el)return;const now=new Date(),m=new Date(now.getFullYear(),now.getMonth(),1),map={};EXPENSES.filter(e=>isSpend(e)&&new Date(e.spent_at)>=m).forEach(e=>map[e.category]=(map[e.category]||0)+Number(e.amount));const keys=Object.keys(map);if(!keys.length){el.insertAdjacentHTML('afterend','<p class="py-8 text-center text-sm text-slate-400">No spending this month yet.</p>');el.style.display='none';return;}charts.cat=new Chart(el,{type:'doughnut',data:{labels:keys.map(k=>(CATS[k]||CATS.other).l),datasets:[{data:keys.map(k=>map[k]),backgroundColor:keys.map(k=>(CATS[k]||CATS.other).c),borderWidth:0}]},options:{plugins:{legend:{position:'right',labels:{color:'#94a3b8',font:{size:11},boxWidth:12}}},cutout:'62%'}});}
function runSim(){const inc=+($('#simIncome')?.value||0),exp=+($('#simExp')?.value||0),goal=+($('#simGoal')?.value||0),rate=+($('#simRate')?.value||0);
  if($('#simIncomeV'))$('#simIncomeV').textContent=fmt(inc);if($('#simExpV'))$('#simExpV').textContent=fmt(exp);if($('#simGoalV'))$('#simGoalV').textContent=fmt(goal);if($('#simRateV'))$('#simRateV').textContent=rate+'%';
  const monthly=Math.max(0,inc-exp),mr=rate/100/12;let bal=0;const pts=[];for(let m=0;m<=60;m++){pts.push(Math.round(bal));bal=bal*(1+mr)+monthly;}
  let months=null,b=0;for(let m=1;m<=600;m++){b=b*(1+mr)+monthly;if(b>=goal){months=m;break;}}
  if($('#simSave'))$('#simSave').textContent=fmt(monthly);if($('#simMonths'))$('#simMonths').textContent=months?(months<12?months+' mo':Math.floor(months/12)+'y '+(months%12)+'m'):'—';if($('#sim5y'))$('#sim5y').textContent=fmt(pts[pts.length-1]);
  const el=$('#simChart');if(el){if(charts.sim)charts.sim.destroy();charts.sim=new Chart(el,{type:'line',data:{labels:pts.map((_,i)=>i%12===0?(i===0?'Now':'Y'+i/12):''),datasets:[{data:pts,borderColor:'#a855f7',backgroundColor:'rgba(139,92,246,.1)',fill:true,tension:.3,pointRadius:0,borderWidth:2.5}]},options:chartOpts()});}
  // live insight
  const ins=$('#simInsight');if(ins){const fiveY=pts[pts.length-1],growth=fiveY-monthly*60;
    if(monthly<=0)ins.innerHTML='💡 Your expenses meet or exceed your income — trim spending to start building savings.';
    else ins.innerHTML=`💡 Saving <b class="text-emerald-400">${fmt(monthly)}/mo</b> reaches your <b>${fmt(goal)}</b> goal ${months?`in <b>${months<12?months+' months':Math.floor(months/12)+'y '+(months%12)+'m'}</b>`:'eventually'}. Over 5 years you'd have <b class="gtext">${fmt(fiveY)}</b>${rate>0?` — ${fmt(growth)} of it from ${rate}% growth 📈`:''}.`;
  }
  // milestones
  const mil=$('#simMilestones');if(mil){const marks=[1000,5000,10000,25000,50000].filter(x=>x<=Math.max(goal,fiveYMax(pts)));if(goal&&!marks.includes(goal))marks.push(goal);marks.sort((a,b)=>a-b);
    const monthsTo=(t)=>{let bb=0;for(let m=1;m<=600;m++){bb=bb*(1+mr)+monthly;if(bb>=t)return m;}return null;};
    mil.innerHTML=marks.slice(0,6).map(t=>{const mo=monthsTo(t);const lbl=mo?(mo<12?mo+' mo':Math.floor(mo/12)+'y '+(mo%12)+'m'):'—';const isGoal=t===goal;return `<div class="flex items-center gap-3 rounded-xl p-3" style="background:var(--glass);${isGoal?'box-shadow:0 0 0 1px var(--accent2)':''}"><span class="text-xl">${isGoal?'🎯':t>=25000?'🏆':t>=10000?'💎':'⭐'}</span><div class="min-w-0 flex-1"><p class="text-sm font-semibold">${fmt(t)}${isGoal?' · your goal':''}</p><p class="text-[11px]" style="color:var(--muted)">${mo?'in '+lbl:'out of range'}</p></div></div>`;}).join('')||'<p class="text-sm" style="color:var(--muted)">Increase your monthly saving to unlock milestones.</p>';
  }}
function fiveYMax(pts){return pts[pts.length-1]||0;}
function simPreset(p){const inc=$('#simIncome'),exp=$('#simExp'),goal=$('#simGoal'),rate=$('#simRate');if(!inc)return;
  if(p==='cut100'){exp.value=Math.max(0,+exp.value-100);}
  else if(p==='aggressive'){exp.value=Math.round(+inc.value*0.5);}
  else if(p==='invest'){rate.value=7;}
  else if(p==='reset'){inc.value=Math.round(ME.monthly_income)||2000;exp.value=Math.round(snapshot(ME,EXPENSES).spending)||1400;goal.value=10000;rate.value=2;}
  runSim();}

// ============================================================
// AI
// ============================================================
let chat=[];
function renderChat(){const log=$('#chatLog');if(!log)return;log.innerHTML=chat.map(m=>`<div class="flex ${m.role==='user'?'justify-end':'justify-start'}"><div class="max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${m.role==='user'?'text-white':'glass'}" style="${m.role==='user'?'background:linear-gradient(135deg,#4f46e5,#8b5cf6)':''}">${esc(m.text)}</div></div>`).join('');log.scrollTop=log.scrollHeight;}
// real financial context sent to the AI (real numbers, never invented)
function aiContext(){return {income:ME.monthly_income,savings:ME.monthly_savings,personality:ME.personality,budget:monthCatSpend()};}
// call the secure edge function; throws on any failure so callers can fall back
async function aiInvoke(messages,mode){
  const apiMode=(mode==='roast'||ME.coach_mode==='roast')?'roast':(mode==='report'?'report':(ME.plan==='pro'?'lite':'coach'));
  const {data,error}=await sb.functions.invoke('ai',{body:{messages,mode:apiMode,tone:ME.coach_mode||'fun',context:aiContext()}});
  if(error){let msg='AI request failed.';try{msg=(await error.context.json()).error||msg;}catch(e){}throw new Error(msg);}
  if(!data||!data.reply)throw new Error('No reply');
  return data;
}
async function sendChat(q,mode='coach'){
  chat.push({role:'user',text:q});renderChat();
  chat.push({role:'ai',text:'…'});renderChat();
  if(USE_REAL_AI){
    try{
      const msgs=chat.filter(m=>m.text!=='…').map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text}));
      const data=await aiInvoke(msgs,mode);
      chat.pop();chat.push({role:'ai',text:data.reply});
      if(data.used!=null&&$('#aiCount'))$('#aiCount').textContent=data.used;
      renderChat();return;
    }catch(e){
      chat.pop();
      if(DEMO_MODE){chat.push({role:'ai',text:demoCoachReply(q,mode)});renderChat();return;}
      chat.push({role:'ai',text:e.message||'AI service unavailable.'});renderChat();return;
    }
  }
  // sample-reply mode (USE_REAL_AI off)
  await new Promise(r=>setTimeout(r,700));chat.pop();chat.push({role:'ai',text:demoCoachReply(q,mode)});renderChat();
}
async function loadAiInsights(){
  const el=$('#aiInsights');if(!el)return;
  if(USE_REAL_AI){
    try{
      const data=await aiInvoke([{role:'user',content:'Give me 3 short insights about my finances as bullet lines.'}],'report');
      el.innerHTML=(data.reply||'').split('\n').filter(x=>x.trim()).slice(0,4).map(t=>`<li class="flex gap-2"><span class="mt-1 h-1.5 w-1.5 rounded-full bg-accent-purple shrink-0"></span>${esc(t.replace(/^[-*•\d.\s]+/,''))}</li>`).join('')||'<li>All good!</li>';
      return;
    }catch(e){/* fall through to sample insights */}
  }
  const wr=whatToReduce(),s=snapshot(ME,EXPENSES),tips=[`Your savings rate is ${s.savingsRate}% this month.`];
  if(wr[0]){const m=CATS[wr[0].cat]||CATS.other;tips.push(`Biggest cut: ${m.l} — save ${fmt(wr[0].save)}/mo.`);}
  const g=topGoal();if(g)tips.push(`You're ${pct(g.saved_amount,g.target_amount)}% toward “${esc(g.name)}”.`);
  tips.push('Check in today to keep your streak alive.');
  el.innerHTML=tips.slice(0,4).map(t=>`<li class="flex gap-2"><span class="mt-1 h-1.5 w-1.5 rounded-full bg-accent-purple shrink-0"></span>${t}</li>`).join('');
}

// ============================================================
// ROUTER
// ============================================================
async function render(){
  destroyCharts();
  document.documentElement.removeAttribute('data-biz');
  const root=$('#root');
  const hash=location.hash.replace(/^#/,'')||'home';

  // In demo mode, block any auth-related hash immediately
  if(DEMO_MODE && (hash==='login'||hash==='signup'||hash==='forgot'||hash==='verify'||hash.startsWith('access_token')||hash.startsWith('error='))){
    location.hash='#quiz'; return;
  }

  // ── Supabase auth callback (email confirmation / password reset / magic link) ──
  // The hash will contain access_token=... when Supabase redirects back after email confirm.
  if(hash.startsWith('access_token=')||hash.includes('&access_token=')){
    if(hash.includes('type=recovery')){location.hash='#reset';return;}
    // Show a spinner — onAuthStateChange SIGNED_IN will redirect once the session is ready.
    root.innerHTML=`<div class="flex min-h-screen flex-col items-center justify-center gap-4">
      <div class="animate-float text-5xl">✨</div>
      <p class="text-slate-300 font-medium">Verifying your account…</p>
      <p class="text-sm text-slate-500">You'll be redirected in a moment.</p>
    </div>`;
    return;
  }
  // Supabase error callback (e.g. expired link)
  if(hash.startsWith('error=')||hash.includes('error_description=')){
    const raw=hash.match(/error_description=([^&]*)/)?.[1]||'Link+expired+or+already+used.';
    const msg=decodeURIComponent(raw.replace(/\+/g,' '));
    root.innerHTML=authWrap(`<div class="glass-strong rounded-2xl p-7 text-center">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style="background:rgba(239,68,68,.15)">⚠️</div>
      <h1 class="text-2xl font-bold">Link expired</h1>
      <p class="mt-3 text-sm text-slate-400">${esc(msg)}</p>
      <p class="mt-2 text-sm text-slate-400">Please sign up again or request a new link.</p>
      <a href="#signup" class="btn btn-primary mt-6 w-full">Sign up again</a>
      <a href="#login" class="btn btn-ghost mt-2 w-full text-sm">Back to login</a>
    </div>`);
    return;
  }

  // public routes
  if(hash==='home'){root.innerHTML=landing();window.scrollTo(0,0);return;}
  if(hash==='login'){
    if(DEMO_MODE){location.hash='#quiz';return;}
    root.innerHTML=loginView();return;
  }
  if(hash==='signup'){
    if(DEMO_MODE){location.hash='#quiz';return;}
    root.innerHTML=signupView();return;
  }
  if(hash==='reset'){root.innerHTML=resetView();return;}
  // need session below
  if(!DEMO_MODE && !SESSION){location.hash='#login';return;}
  if(!ME) await loadProfile();
  if(hash==='admin'){ if(ME?.role!=='admin'&&!isDemoAdmin()){toast('Admins only','err');location.hash='#app/settings';return;} root.innerHTML=await adminView(); window.scrollTo(0,0); return; }
  if(hash==='quiz'){ QSTEP=0; root.innerHTML=quizView(); renderQuiz(); return; }
  if(hash.startsWith('app/')){
    if(!ME?.onboarded){location.hash='#quiz';return;}
    const route=hash.split('/')[1]||'dashboard';
    [GOALS,EXPENSES]=await Promise.all([getGoals(),getExpenses()]);
    if(DEMO_MODE){AIUSED=0;} else {
    const {data:u}=await sb.from('ai_usage').select('count').eq('user_id',SESSION.user.id).eq('day',todayISO()).maybeSingle();
    AIUSED=u?.count||0;}
    // ── BUSINESS PLAN → entirely separate Business OS ──
    if(ME.plan==='business'){
      document.documentElement.setAttribute('data-biz','1');document.documentElement.classList.remove('light');
      const bviews={dashboard:bizDashboard,companies:bizCompanies,cashflow:bizCashflow,networth:bizNetworth,properties:bizProperties,employees:bizEmployees,payments:bizPayments,invoices:bizInvoices,clients:bizClients,investments:bizInvestments,vehicles:bizVehicles,inventory:bizInventory,taxes:bizTaxes,calendar:bizCalendar,goals:bizGoals,ai:bizAi,team:bizTeam,marketplace:bizMarketplace,profile:bizProfile,reports:bizReports,settings:settingsView,plans:plansView};
      root.innerHTML=bizShell(route,(bviews[route]||bizDashboard)());
      window.scrollTo(0,0);
      bizAfterRender(route);
      return;
    }
    enforcePlanTheme(ME.plan);
    const c=caps(ME.plan);
    // plan-gated routes fall back to dashboard if not allowed for this plan
    const allowed=new Set(planNav(ME.plan).map(n=>n[0]));
    const route2=(allowed.has(route)||route==='student')?route:'dashboard';
    const views={dashboard:dashboardView,goals:goalsView,analytics:analyticsView,simulator:simulatorView,ai:aiView,challenges:challengesView,social:socialView,plans:plansView,student:studentView,settings:settingsView};
    root.innerHTML=shell(route2,(views[route2]||dashboardView)());
    window.scrollTo(0,0);
    if(route2==='dashboard'){drawSpend('year');drawCat();if(c.ai)loadAiInsights();}
    if(route2==='analytics'){drawSpend('year');}
    if(route2==='simulator'){runSim();}
    if(route2==='ai'){chat=[{role:'ai',text:"Hi! I'm your AI coach. Ask me about saving, spending, or a plan."}];renderChat();}
    if(route2==='student'){renderSVStatus();}
    return;
  }
  location.hash='#home';
}
async function renderSVStatus(){const el=$('#svStatus');if(!el)return;if(DEMO_MODE){el.innerHTML='<div class="glass rounded-2xl p-5 text-sm text-slate-400">Student verification is not available in demo mode.</div>';return;}const {data}=await sb.from('student_verifications').select('*').order('created_at',{ascending:false}).limit(1);const v=data?.[0];if(v){const c=v.status==='approved'?'text-emerald-400':v.status==='rejected'?'text-red-400':'text-amber-300';el.innerHTML=`<div class="glass rounded-2xl p-5"><p class="text-sm">Latest request: <b class="${c}">${v.status}</b> · ${esc(v.university)}</p></div>`;}}

// ============================================================
// ███ BUSINESS OS — a separate product for the Business plan ███
// Multi-company operating system: dashboard, properties, employees,
// payments, invoices, CRM, investments, fleet, inventory, taxes,
// calendar, cash flow, net worth, AI advisor, team, marketplace.
// All data persists in localStorage (demo). Distinct gold theme.
// ============================================================
const BIZ_NAV=[['dashboard','Executive','📊'],['companies','Companies','🏢'],['cashflow','Cash Flow','💸'],['networth','Net Worth','💎'],['properties','Properties','🏗️'],['employees','Employees','👔'],['payments','Payments','💳'],['invoices','Invoices','🧾'],['clients','Clients','🤝'],['investments','Investments','📈'],['vehicles','Fleet','🚗'],['inventory','Inventory','📦'],['taxes','Tax Center','🏛️'],['calendar','Calendar','📅'],['goals','Goals','🎯'],['ai','AI Advisor','🤖'],['team','Team','👥'],['marketplace','Marketplace','🌐'],['profile','Profile','🪪'],['reports','Reports','📄'],['settings','Settings','⚙️']];

const BIZ_SPECS={
 businesses:{title:'Company',required:['name'],fields:[{key:'name',label:'Company name',type:'text',wide:true},{key:'logo',label:'Logo (emoji)',type:'text',default:'🏢'},{key:'industry',label:'Industry',type:'select',options:['Restaurant','Construction','Real Estate','Retail','Online Store','Services','Other']},{key:'founded',label:'Founded (year)',type:'number',default:new Date().getFullYear()},{key:'cash',label:'Cash balance',type:'number'},{key:'revenue',label:'Core sales / mo',type:'number'}]},
 properties:{title:'Property',required:['name'],fields:[{key:'name',label:'Name',type:'text',wide:true},{key:'kind',label:'Type',type:'select',options:['Apartment','Office','Shop','Warehouse','Building','Land']},{key:'occupancy',label:'Status',type:'select',options:['occupied','vacant']},{key:'price',label:'Purchase price',type:'number'},{key:'value',label:'Current value',type:'number'},{key:'rent',label:'Rent / mo',type:'number'},{key:'expenses',label:'Expenses / mo',type:'number'},{key:'notes',label:'Notes',type:'textarea',wide:true}]},
 employees:{title:'Employee',required:['name'],fields:[{key:'name',label:'Name',type:'text'},{key:'position',label:'Position',type:'text'},{key:'salary',label:'Salary / mo',type:'number'},{key:'hired',label:'Hire date',type:'date'},{key:'status',label:'Status',type:'select',options:['active','on leave','former']},{key:'notes',label:'Notes',type:'textarea',wide:true}]},
 payments:{title:'Payment',required:['name'],fields:[{key:'name',label:'Name',type:'text',wide:true},{key:'type',label:'Type',type:'select',options:['Salary','Rent','Tax','Bill','Invoice','Loan']},{key:'amount',label:'Amount',type:'number'},{key:'due',label:'Due date',type:'date'},{key:'status',label:'Status',type:'select',options:['paid','pending','overdue']},{key:'recurring',label:'Recurring',type:'select',options:['yes','no']}]},
 invoices:{title:'Invoice',required:['client'],fields:[{key:'client',label:'Client',type:'text'},{key:'desc',label:'Description',type:'text'},{key:'amount',label:'Amount',type:'number'},{key:'due',label:'Due date',type:'date'},{key:'status',label:'Status',type:'select',options:['unpaid','paid']}]},
 clients:{title:'Client',required:['name'],fields:[{key:'name',label:'Name',type:'text'},{key:'company',label:'Company',type:'text'},{key:'phone',label:'Phone',type:'text'},{key:'email',label:'Email',type:'text'},{key:'value',label:'Contract value',type:'number'},{key:'notes',label:'Notes',type:'textarea',wide:true}]},
 investments:{title:'Investment',required:['name'],fields:[{key:'name',label:'Name',type:'text'},{key:'type',label:'Type',type:'select',options:['Real estate','Stocks','Crypto','Business','Vehicle','Equipment']},{key:'invested',label:'Invested',type:'number'},{key:'value',label:'Current value',type:'number'}]},
 vehicles:{title:'Vehicle',required:['name'],fields:[{key:'name',label:'Name',type:'text'},{key:'type',label:'Type',type:'select',options:['Car','Truck','Van','Boat']},{key:'value',label:'Value',type:'number'},{key:'monthly',label:'Running cost / mo',type:'number'},{key:'notes',label:'Notes',type:'textarea',wide:true}]},
 inventory:{title:'Warehouse',required:['name'],fields:[{key:'name',label:'Name',type:'text',wide:true},{key:'capacity',label:'Capacity (units)',type:'number'},{key:'used',label:'Used (units)',type:'number'},{key:'value',label:'Stock value',type:'number'},{key:'notes',label:'Notes',type:'text',wide:true}]},
 taxes:{title:'Tax',required:['name'],fields:[{key:'name',label:'Name',type:'text',wide:true},{key:'period',label:'Period',type:'select',options:['Monthly','Quarterly','Annual']},{key:'amount',label:'Amount',type:'number'},{key:'due',label:'Due date',type:'date'},{key:'status',label:'Status',type:'select',options:['pending','paid']}]},
 events:{title:'Event',required:['title'],fields:[{key:'title',label:'Title',type:'text',wide:true},{key:'date',label:'Date',type:'date'},{key:'type',label:'Type',type:'select',options:['Meeting','Tax','Salary','Payment','Deadline']}]},
 goals:{title:'Goal',required:['title'],fields:[{key:'title',label:'Title',type:'text',wide:true},{key:'kind',label:'Type',type:'select',options:['Revenue','Property','Hiring','Equipment','Expansion']},{key:'target',label:'Target',type:'number'},{key:'current',label:'Current',type:'number'}]},
 team:{title:'Member',required:['name'],fields:[{key:'name',label:'Name',type:'text'},{key:'email',label:'Email',type:'text'},{key:'role',label:'Role',type:'select',options:['Read only','Editor','Manager','Full access']}]},
};

function defaultBiz(){
  const d=(off)=>{const x=new Date();x.setDate(x.getDate()+off);return x.toISOString().slice(0,10);};
  const mk=(biz,pfx,arr)=>arr.map((r,i)=>({id:pfx+'_'+biz+'_'+i,biz,...r}));
  const businesses=[
    {id:'b1',name:'Lumen Bistro',logo:'🍽️',industry:'Restaurant',founded:2019,cash:48000,revenue:45000},
    {id:'b2',name:'Apex Construction',logo:'🏗️',industry:'Construction',founded:2016,cash:215000,revenue:60000},
    {id:'b3',name:'Nova Realty',logo:'🏢',industry:'Real Estate',founded:2021,cash:95000,revenue:6000},
  ];
  return {active:'b1',businesses,
    properties:[
      ...mk('b1','prop',[{name:'Bistro Building',kind:'Building',occupancy:'occupied',price:620000,value:735000,rent:0,expenses:2200,notes:'Owner-occupied premises'},{name:'Upstairs Apartment',kind:'Apartment',occupancy:'occupied',price:140000,value:182000,rent:1100,expenses:160,notes:'Let to tenant'}]),
      ...mk('b2','prop',[{name:'Equipment Yard',kind:'Warehouse',occupancy:'occupied',price:300000,value:345000,rent:0,expenses:1200,notes:''},{name:'Spec House #4',kind:'Building',occupancy:'vacant',price:280000,value:410000,rent:0,expenses:800,notes:'For sale'}]),
      ...mk('b3','prop',[{name:'Apt 12B',kind:'Apartment',occupancy:'occupied',price:185000,value:232000,rent:1450,expenses:200,notes:''},{name:'Office Suite 3',kind:'Office',occupancy:'occupied',price:390000,value:480000,rent:3200,expenses:400,notes:''},{name:'Retail Unit A',kind:'Shop',occupancy:'vacant',price:260000,value:310000,rent:2100,expenses:300,notes:'Seeking tenant'},{name:'Warehouse North',kind:'Warehouse',occupancy:'occupied',price:420000,value:540000,rent:4100,expenses:600,notes:''}]),
    ],
    employees:[
      ...mk('b1','emp',[{name:'Marco Rossi',position:'Head Chef',salary:3200,hired:'2019-06-01',status:'active'},{name:'Lena Fischer',position:'Sous Chef',salary:2400,hired:'2020-03-15',status:'active'},{name:'Tom Byrne',position:'Manager',salary:2800,hired:'2019-09-01',status:'active'},{name:'Aoife Walsh',position:'Waiter',salary:1900,hired:'2022-01-10',status:'active'},{name:'Pavel Novak',position:'Dishwasher',salary:1700,hired:'2023-05-20',status:'on leave'}]),
      ...mk('b2','emp',[{name:'John Doyle',position:'Site Manager',salary:4200,hired:'2016-04-01',status:'active'},{name:'Sean Murphy',position:'Foreman',salary:3100,hired:'2018-07-12',status:'active'},{name:'Karl Weber',position:'Laborer',salary:2600,hired:'2021-02-01',status:'active'}]),
      ...mk('b3','emp',[{name:'Grace Lynch',position:'Property Manager',salary:2900,hired:'2021-03-01',status:'active'},{name:'Eoin Kelly',position:'Leasing Agent',salary:2200,hired:'2022-08-15',status:'active'}]),
    ],
    payments:[
      ...mk('b1','pay',[{name:'Gas & Electric',type:'Bill',amount:900,due:d(8),status:'pending',recurring:'yes'},{name:'Building Loan',type:'Loan',amount:3100,due:d(20),status:'paid',recurring:'yes'},{name:'Metro Supplies',type:'Bill',amount:5200,due:d(-3),status:'overdue',recurring:'yes'},{name:'Ingredients & stock',type:'Bill',amount:8400,due:d(6),status:'pending',recurring:'yes'}]),
      ...mk('b2','pay',[{name:'Plant Lease',type:'Loan',amount:6200,due:d(15),status:'paid',recurring:'yes'},{name:'Insurance',type:'Bill',amount:2400,due:d(2),status:'pending',recurring:'yes'}]),
      ...mk('b3','pay',[{name:'Portfolio Mortgage',type:'Loan',amount:9800,due:d(10),status:'paid',recurring:'yes'}]),
    ],
    invoices:[
      ...mk('b1','inv',[{client:'TechCorp',desc:'Office party catering',amount:1800,due:d(-10),status:'paid'},{client:'Garcia Family',desc:'Wedding catering',amount:4200,due:d(-5),status:'unpaid'},{client:'City Hall',desc:'Civic event',amount:2600,due:d(18),status:'unpaid'},{client:'Lumen Corp',desc:'Corporate lunch',amount:950,due:d(-20),status:'paid'}]),
      ...mk('b2','inv',[{client:'Riverside Dev',desc:'Phase 1 build',amount:85000,due:d(-15),status:'paid'},{client:'Doyle Family',desc:'Home extension',amount:22000,due:d(7),status:'unpaid'}]),
      ...mk('b3','inv',[{client:'Suite 3 Tenant',desc:'Monthly rent',amount:3200,due:d(-2),status:'paid'},{client:'Apt 12B Tenant',desc:'Late rent',amount:1450,due:d(-8),status:'unpaid'}]),
    ],
    clients:[
      ...mk('b1','cli',[{name:'Sarah Chen',company:'TechCorp',phone:'+353 1 555 0100',email:'sarah@techcorp.io',value:1800,notes:'Repeat catering client'},{name:'Maria Garcia',company:'',phone:'+353 87 555 2244',email:'m.garcia@email.com',value:4200,notes:'Wedding in June'},{name:'City Hall Events',company:'Municipality',phone:'+353 1 555 0199',email:'events@cityhall.gov',value:2600,notes:''}]),
      ...mk('b2','cli',[{name:'Riverside Dev',company:'Riverside Holdings',phone:'+353 1 555 7700',email:'build@riverside.dev',value:85000,notes:'Large multi-phase contract'},{name:'Pat Doyle',company:'',phone:'+353 86 555 1212',email:'pat.doyle@email.com',value:22000,notes:'Home extension'}]),
      ...mk('b3','cli',[{name:'Lawson & Co',company:'Lawson & Co',phone:'+353 1 555 3030',email:'office@lawson.co',value:38400,notes:'12-month office lease'}]),
    ],
    investments:[
      ...mk('b1','ivst',[{name:'S&P 500 ETF',type:'Stocks',invested:20000,value:24500},{name:'Bitcoin',type:'Crypto',invested:8000,value:6900}]),
      ...mk('b2','ivst',[{name:'Commercial Plot',type:'Real estate',invested:150000,value:195000}]),
      ...mk('b3','ivst',[{name:'REIT Fund',type:'Stocks',invested:60000,value:71000}]),
    ],
    vehicles:[
      ...mk('b1','veh',[{name:'Delivery Van',type:'Van',value:28000,monthly:650,notes:''},{name:"Owner's Car",type:'Car',value:35000,monthly:480,notes:''}]),
      ...mk('b2','veh',[{name:'CAT Excavator',type:'Truck',value:120000,monthly:1800,notes:'Heavy plant'},{name:'Flatbed Truck',type:'Truck',value:65000,monthly:1100,notes:''}]),
      ...mk('b3','veh',[{name:'Company Car',type:'Car',value:42000,monthly:520,notes:''}]),
    ],
    inventory:[
      ...mk('b1','wh',[{name:'Main Storeroom',capacity:1000,used:920,value:18000,notes:'Fresh + frozen'},{name:'Dry Goods',capacity:500,used:300,value:6000,notes:''}]),
      ...mk('b2','wh',[{name:'Materials Depot',capacity:5000,used:3200,value:88000,notes:'Cement, steel, timber'}]),
      ...mk('b3','wh',[]),
    ],
    taxes:[
      ...mk('b1','tax',[{name:'Quarterly VAT',period:'Quarterly',amount:4200,due:d(12),status:'pending'},{name:'Payroll Tax',period:'Monthly',amount:1800,due:d(5),status:'pending'},{name:'Income Tax',period:'Annual',amount:12000,due:d(120),status:'pending'}]),
      ...mk('b2','tax',[{name:'Corporation Tax',period:'Annual',amount:45000,due:d(90),status:'pending'}]),
      ...mk('b3','tax',[{name:'Property Tax',period:'Annual',amount:8800,due:d(60),status:'pending'}]),
    ],
    events:[
      ...mk('b1','ev',[{title:'Supplier meeting — Metro',date:d(3),type:'Meeting'},{title:'Wedding event — Garcia',date:d(14),type:'Deadline'},{title:'Staff review',date:d(21),type:'Meeting'}]),
      ...mk('b2','ev',[{title:'Site inspection — Riverside',date:d(4),type:'Meeting'}]),
      ...mk('b3','ev',[{title:'Viewing — Retail Unit A',date:d(6),type:'Meeting'}]),
    ],
    goals:[
      ...mk('b1','goal',[{title:'Open second location',kind:'Expansion',target:150000,current:48000},{title:'Reach €30k monthly revenue',kind:'Revenue',target:30000,current:8500},{title:'Buy new combi oven',kind:'Equipment',target:9000,current:3500}]),
      ...mk('b2','goal',[{title:'Win €500k contract',kind:'Revenue',target:500000,current:107000}]),
      ...mk('b3','goal',[{title:'Acquire 5th property',kind:'Property',target:300000,current:95000}]),
    ],
    team:[
      ...mk('b1','team',[{name:'Anna Schmidt',email:'anna@lumenbistro.com',role:'Manager'},{name:'David Kim (Accountant)',email:'david@accountancy.io',role:'Read only'}]),
      ...mk('b2','team',[]),
      ...mk('b3','team',[]),
    ],
  };
}
function bizStore(){let s;try{s=JSON.parse(localStorage.getItem('goalify_biz'));}catch(e){}if(!s||!s.businesses||!s.businesses.length){s=defaultBiz();localStorage.setItem('goalify_biz',JSON.stringify(s));}return s;}
function setBizStore(s){localStorage.setItem('goalify_biz',JSON.stringify(s));}
function bizActive(){const s=bizStore();return s.businesses.find(b=>b.id===s.active)||s.businesses[0];}
function bizRecs(coll){const s=bizStore();return (s[coll]||[]).filter(r=>r.biz===s.active);}
function daysTo(d){return Math.round((new Date(d)-new Date())/86400000);}

function bizMetrics(){
  const b=bizActive();const cash=+b?.cash||0;
  const core=+b?.revenue||0;
  const revInv=bizRecs('invoices').filter(i=>i.status==='paid').reduce((a,i)=>a+(+i.amount||0),0);
  const revRent=bizRecs('properties').filter(p=>p.occupancy==='occupied').reduce((a,p)=>a+(+p.rent||0),0);
  const revenue=core+revInv+revRent;
  const sal=bizRecs('employees').filter(e=>e.status==='active').reduce((a,e)=>a+(+e.salary||0),0);
  const recPay=bizRecs('payments').filter(p=>p.recurring==='yes').reduce((a,p)=>a+(+p.amount||0),0);
  const pExp=bizRecs('properties').reduce((a,p)=>a+(+p.expenses||0),0);
  const vExp=bizRecs('vehicles').reduce((a,v)=>a+(+v.monthly||0),0);
  const expenses=sal+recPay+pExp+vExp;
  const profit=revenue-expenses;
  const taxMonthly=bizRecs('taxes').filter(t=>t.status==='pending').reduce((a,t)=>a+((+t.amount||0)/(t.period==='Annual'?12:t.period==='Quarterly'?3:1)),0);
  const net=profit-taxMonthly;
  const propVal=bizRecs('properties').reduce((a,p)=>a+(+p.value||0),0);
  const invVal=bizRecs('investments').reduce((a,i)=>a+(+i.value||0),0);
  const vehVal=bizRecs('vehicles').reduce((a,v)=>a+(+v.value||0),0);
  const stockVal=bizRecs('inventory').reduce((a,w)=>a+(+w.value||0),0);
  const netWorth=cash+propVal+invVal+vehVal+stockVal;
  const outInv=bizRecs('invoices').filter(i=>i.status==='unpaid').reduce((a,i)=>a+(+i.amount||0),0);
  const outPay=bizRecs('payments').filter(p=>p.status==='pending'||p.status==='overdue').reduce((a,p)=>a+(+p.amount||0),0);
  const outstanding=outInv+outPay;
  const props=bizRecs('properties');
  const occ=props.length?props.filter(p=>p.occupancy==='occupied').length/props.length:1;
  const overdue=bizRecs('payments').filter(p=>p.status==='overdue').length;
  const margin=revenue>0?profit/revenue:0;
  const runway=expenses>0?cash/expenses:12;
  const health=Math.max(0,Math.min(100,Math.round(40*Math.max(0,Math.min(1,(margin+0.2)/0.6))+25*occ+20*Math.max(0,Math.min(1,runway/6))+15*Math.max(0,1-overdue*0.25))));
  return {b,cash,revenue,expenses,profit,net,taxMonthly,netWorth,propVal,invVal,vehVal,stockVal,outstanding,occ,overdue,margin,runway,health,empCount:bizRecs('employees').filter(e=>e.status==='active').length,propCount:props.length};
}
function bizAlerts(){
  const a=[];const today=todayISO();
  bizRecs('payments').filter(p=>p.status==='overdue').forEach(p=>a.push({icon:'⚠️',tone:'#ef4444',text:`Payment overdue: ${esc(p.name)} — ${fmt(p.amount)}`,href:'#app/payments'}));
  bizRecs('invoices').filter(i=>i.status==='unpaid'&&i.due&&i.due<today).forEach(i=>a.push({icon:'🧾',tone:'#ef4444',text:`Invoice overdue: ${esc(i.client)} — ${fmt(i.amount)}`,href:'#app/invoices'}));
  bizRecs('taxes').filter(t=>t.status==='pending').forEach(t=>{const soon=t.due&&daysTo(t.due)<=14;a.push({icon:'🏛️',tone:soon?'#ef4444':'#f59e0b',text:`Tax ${soon?'due soon':'upcoming'}${t.due?' ('+t.due+')':''}: ${esc(t.name)} — ${fmt(t.amount)}`,href:'#app/taxes'});});
  bizRecs('properties').filter(p=>p.occupancy==='vacant').forEach(p=>a.push({icon:'🏚️',tone:'#f59e0b',text:`${esc(p.name)} is vacant — ${fmt(p.rent||0)}/mo potential income lost`,href:'#app/properties'}));
  bizRecs('inventory').filter(w=>w.capacity&&w.used/w.capacity>=0.9).forEach(w=>a.push({icon:'📦',tone:'#ef4444',text:`${esc(w.name)} at ${Math.round(w.used/w.capacity*100)}% capacity`,href:'#app/inventory'}));
  return a;
}
function bizInsights(){
  const m=bizMetrics();const out=[];
  out.push(m.profit>=0?{i:'📈',t:`Operating profit is ${fmt(m.profit)}/mo — a ${Math.round(m.margin*100)}% margin.`}:{i:'📉',t:`Running at a loss of ${fmt(-m.profit)}/mo — expenses exceed revenue.`});
  const sal=bizRecs('employees').filter(e=>e.status==='active').reduce((a,e)=>a+(+e.salary||0),0);
  if(m.expenses>0)out.push({i:'👔',t:`Salaries are ${Math.round(sal/m.expenses*100)}% of monthly expenses (${fmt(sal)}).`});
  const vac=bizRecs('properties').filter(p=>p.occupancy==='vacant');
  if(vac.length)out.push({i:'🏚️',t:`${vac.length} propert${vac.length>1?'ies are':'y is'} vacant — ${fmt(vac.reduce((a,p)=>a+(+p.rent||0),0))}/mo of income left on the table.`});
  if(bizRecs('investments').length){const gain=bizRecs('investments').reduce((a,i)=>a+((+i.value||0)-(+i.invested||0)),0);out.push({i:gain>=0?'💎':'⚠️',t:`Investments are ${gain>=0?'up':'down'} ${fmt(Math.abs(gain))} versus cost basis.`});}
  const full=bizRecs('inventory').filter(w=>w.capacity&&w.used/w.capacity>=0.9);
  if(full.length)out.push({i:'📦',t:`${esc(full[0].name)} is ${Math.round(full[0].used/full[0].capacity*100)}% full — plan storage or fulfilment.`});
  out.push({i:'🏦',t:`At current burn, cash covers ${m.runway>=12?'12+':m.runway.toFixed(1)} months of expenses.`});
  return out;
}
function bizAchievements(){
  const m=bizMetrics();const s=bizStore();
  return [{e:'🏢',name:'First Company',got:s.businesses.length>=1},{e:'🏘️',name:'First Property',got:m.propCount>=1},{e:'👔',name:'10 Employees',got:m.empCount>=10},{e:'🚗',name:'First Vehicle',got:bizRecs('vehicles').length>=1},{e:'💎',name:'First Investment',got:bizRecs('investments').length>=1},{e:'💰',name:'€100k Revenue',got:m.revenue>=100000},{e:'🏦',name:'€1M Net Worth',got:m.netWorth>=1000000},{e:'🌍',name:'Multi-Company',got:s.businesses.length>=2}];
}

// ---------- render helpers ----------
function statusColor(s){return ({paid:'#22c55e',occupied:'#22c55e',active:'#22c55e',unpaid:'#f59e0b',pending:'#f59e0b',vacant:'#ef4444',overdue:'#ef4444',former:'#94a3b8','on leave':'#a78bfa'})[s]||'#94a3b8';}
function bizTag(text,color){return `<span class="biz-tag" style="background:${color}22;color:${color}">${esc(text)}</span>`;}
function bizStat(label,val,sub,emoji,tone){const style=tone&&tone!=='gold'?`style="color:${tone}"`:'';return `<div class="biz-card biz-kpi p-5"><div class="flex items-center justify-between"><span class="text-[11px] uppercase tracking-wider" style="color:var(--muted)">${label}</span><span class="text-lg">${emoji}</span></div><p class="mt-2 text-2xl font-extrabold ${tone==='gold'?'gold-text':''}" ${style}>${val}</p>${sub?`<p class="mt-1 text-[11px]" style="color:var(--muted)">${esc(sub)}</p>`:''}</div>`;}
function bizPanel(title,body,actions){return `<div class="biz-card p-5"><div class="mb-4 flex items-center justify-between gap-3"><h3 class="font-semibold">${title}</h3><div class="flex gap-2">${actions||''}</div></div>${body}</div>`;}
function bizHead(title,emoji,sub){return `<div class="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 class="text-2xl font-bold flex items-center gap-2"><span>${emoji}</span><span class="gold-text">${title}</span></h1>${sub?`<p class="mt-1 text-sm" style="color:var(--muted)">${sub}</p>`:''}</div><span class="biz-pill">Business</span></div>`;}
function bizEmpty(msg){return `<p class="py-10 text-center text-sm" style="color:var(--muted)">${msg}</p>`;}
function addBtn(coll,label){return `<button class="btn btn-primary !py-1.5 !px-3 text-xs" data-action="bizAdd" data-coll="${coll}">+ ${label}</button>`;}
function rowActions(coll,id){return `<button class="text-xs px-1.5 py-1 rounded hover:bg-white/10" data-action="bizEdit" data-coll="${coll}" data-id="${id}" title="Edit">✏️</button><button class="text-xs px-1.5 py-1 rounded hover:bg-white/10" data-action="bizDel" data-coll="${coll}" data-id="${id}" title="Delete">🗑</button>`;}
function tableWrap(headers,rowsHTML){return `<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-[11px] uppercase tracking-wider" style="color:var(--muted)">${headers.map(h=>`<th class="pb-2 font-medium pr-3">${h}</th>`).join('')}</tr></thead><tbody>${rowsHTML}</tbody></table></div>`;}

// ---------- charts ----------
function lastMonths(n){const out=[],dt=new Date();for(let i=n-1;i>=0;i--){out.push(new Date(dt.getFullYear(),dt.getMonth()-i,1).toLocaleString('en',{month:'short'}));}return out;}
function bizSeries(base,n=6){return Array.from({length:n},(_,i)=>{const t=i/(n-1);const wave=1+0.05*Math.sin(i*1.7);return Math.round(base*(0.78+0.22*t)*wave);});}
function bizChartOpts(){return {responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#a39b86',boxWidth:12}}},scales:{x:{ticks:{color:'#a39b86'},grid:{color:'rgba(212,175,55,.08)'}},y:{ticks:{color:'#a39b86'},grid:{color:'rgba(212,175,55,.08)'}}}};}
function drawBizRevExp(id){const el=document.getElementById(id);if(!el)return;const m=bizMetrics();charts[id]=new Chart(el,{type:'bar',data:{labels:lastMonths(6),datasets:[{label:'Revenue',data:bizSeries(m.revenue),backgroundColor:'#d4af37',borderRadius:5},{label:'Expenses',data:bizSeries(m.expenses),backgroundColor:'rgba(239,68,68,.55)',borderRadius:5}]},options:bizChartOpts()});}
function drawBizCashflow(id){const el=document.getElementById(id);if(!el)return;const m=bizMetrics();charts[id]=new Chart(el,{type:'line',data:{labels:lastMonths(6),datasets:[{label:'Money in',data:bizSeries(m.revenue),borderColor:'#d4af37',backgroundColor:'rgba(212,175,55,.12)',fill:true,tension:.35},{label:'Money out',data:bizSeries(m.expenses),borderColor:'#ef4444',backgroundColor:'rgba(239,68,68,.08)',fill:true,tension:.35}]},options:bizChartOpts()});}
function drawBizDonut(id){const el=document.getElementById(id);if(!el)return;const m=bizMetrics();charts[id]=new Chart(el,{type:'doughnut',data:{labels:['Cash','Property','Investments','Fleet','Inventory'],datasets:[{data:[m.cash,m.propVal,m.invVal,m.vehVal,m.stockVal],backgroundColor:['#d4af37','#b8860b','#f3d97c','#8a6d1f','#5c4a14'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{position:'bottom',labels:{color:'#a39b86',boxWidth:12}}}}});}
function bizAfterRender(route){if(route==='dashboard'){drawBizRevExp('bizRevExp');drawBizDonut('bizAssets');}if(route==='cashflow'){drawBizCashflow('bizCash');}if(route==='networth'){drawBizDonut('nwDonut');}}

// ---------- shell ----------
function bizShell(route,inner){
  const s=bizStore();const b=s.businesses.find(x=>x.id===s.active)||s.businesses[0];
  const navLinks=BIZ_NAV.map(n=>`<a href="#app/${n[0]}" class="nav-link ${route===n[0]?'active':''} flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${route===n[0]?'text-white':''}" style="${route===n[0]?'':'color:var(--muted)'}"><span>${n[2]}</span>${n[1]}</a>`).join('');
  const switcher=s.businesses.length>1?`<select id="bizSwitch" class="input !py-1.5 mt-2 text-xs">${s.businesses.map(x=>`<option value="${x.id}" ${x.id===s.active?'selected':''}>${x.logo} ${esc(x.name)}</option>`).join('')}</select>`:'';
  return `<div class="min-h-screen"><aside class="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r lg:flex">
    <div class="px-5 pt-5 pb-3"><a href="#app/dashboard" class="flex items-center gap-2"><span class="text-2xl">⬢</span><div><p class="font-extrabold gold-text leading-none text-lg">GOALIFY</p><p class="text-[9px] tracking-[.25em] mt-0.5" style="color:var(--muted)">BUSINESS OS</p></div></a></div>
    <div class="mx-3 mb-2 biz-card p-3"><p class="text-[9px] uppercase tracking-widest mb-1.5" style="color:var(--muted)">Active company</p><div class="flex items-center gap-2"><span class="text-xl">${b?.logo||'🏢'}</span><div class="min-w-0"><p class="truncate text-sm font-bold">${esc(b?.name||'—')}</p><p class="text-[10px]" style="color:var(--muted)">${esc(b?.industry||'')}</p></div></div>${switcher}</div>
    <nav class="flex-1 space-y-0.5 px-3 overflow-y-auto">${navLinks}</nav>
    <div class="border-t p-3" style="border-color:var(--border)"><div class="flex items-center gap-3 px-2 py-1.5">${avatarHTML(36)}<div class="min-w-0"><p class="truncate text-sm font-medium">${esc(ME?.first_name||'You')} ${planBadge('business')}</p><p class="text-xs" style="color:var(--muted)">Owner</p></div></div><a href="#app/plans" class="block rounded-lg px-3 py-1.5 text-left text-xs hover:bg-white/5" style="color:var(--muted)">Switch plan</a><button class="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5" style="color:var(--muted)" data-action="logout">Sign out</button></div>
  </aside>
  <div class="lg:pl-64"><div class="flex items-center justify-between border-b px-4 py-3 lg:hidden" style="border-color:var(--border)"><a href="#app/dashboard" class="font-extrabold gold-text">GOALIFY</a><div class="flex gap-2">${s.businesses.length>1?`<select id="bizSwitch" class="input !w-auto !py-1.5 text-xs">${s.businesses.map(x=>`<option value="${x.id}" ${x.id===s.active?'selected':''}>${x.logo}</option>`).join('')}</select>`:''}<select onchange="location.hash='#app/'+this.value" class="input !w-auto !py-1.5 text-sm">${BIZ_NAV.map(n=>`<option value="${n[0]}" ${route===n[0]?'selected':''}>${n[1]}</option>`).join('')}</select></div></div><main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">${inner}</main></div></div>`;
}

// ---------- views ----------
function bizDashboard(){
  const m=bizMetrics();const al=bizAlerts();const ins=bizInsights();const b=bizActive();
  const header=`<div class="mb-6 flex flex-wrap items-end justify-between gap-3"><div class="flex items-center gap-3"><span class="text-4xl">${b?.logo||'🏢'}</span><div><div class="flex items-center gap-2"><h1 class="text-2xl font-bold gold-text">${esc(b?.name||'Your Company')}</h1><span class="biz-pill">Business</span></div><p class="text-sm mt-0.5" style="color:var(--muted)">${esc(b?.industry||'')} · Founded ${esc(b?.founded||'—')} · ${m.empCount} staff</p></div></div><a href="#app/reports" class="btn btn-primary !py-2 text-sm">📄 Export report</a></div>`;
  const k=`<div class="grid gap-3 grid-cols-2 lg:grid-cols-5 mb-5">${bizStat('Total revenue',fmt(m.revenue),'this month','💰','gold')}${bizStat('Monthly profit',fmt(m.profit),Math.round(m.margin*100)+'% margin','📈',m.profit>=0?'#22c55e':'#ef4444')}${bizStat('Expenses',fmt(m.expenses),'this month','📉')}${bizStat('Net income',fmt(m.net),'after tax set-aside','🧮',m.net>=0?'#22c55e':'#ef4444')}${bizStat('Cash balance',fmt(m.cash),'available','🏦')}${bizStat('Outstanding',fmt(m.outstanding),'unpaid in/out','⏳','#f59e0b')}${bizStat('Employees',m.empCount,'active staff','👔')}${bizStat('Properties',m.propCount,fmt(m.propVal),'🏠')}${bizStat('Investments',fmt(m.invVal),'current value','💎','gold')}${bizStat('Health score',m.health+'/100',m.health>=75?'Strong':m.health>=50?'Stable':'At risk','❤️',m.health>=75?'#22c55e':m.health>=50?'#f59e0b':'#ef4444')}</div>`;
  const alerts=al.length?`<div class="biz-card p-4 mb-5"><p class="text-xs uppercase tracking-wider mb-2" style="color:var(--muted)">⚡ Smart alerts</p><div class="space-y-1.5">${al.slice(0,5).map(x=>`<a href="${x.href}" class="flex items-center gap-2 text-sm hover:underline"><span>${x.icon}</span><span style="color:${x.tone}">${x.text}</span></a>`).join('')}</div></div>`:'';
  const chartsRow=`<div class="grid gap-4 lg:grid-cols-3 mb-5"><div class="biz-card p-5 lg:col-span-2"><h3 class="font-semibold mb-3">Revenue vs Expenses</h3><div style="height:240px"><canvas id="bizRevExp"></canvas></div></div><div class="biz-card p-5"><h3 class="font-semibold mb-3">Asset allocation</h3><div style="height:240px"><canvas id="bizAssets"></canvas></div></div></div>`;
  const u=bizRecs('invoices').filter(i=>i.status==='unpaid');
  const ai=`<div class="grid gap-4 lg:grid-cols-2 mb-5"><div class="biz-card p-5"><h3 class="font-semibold mb-3">🤖 AI advisor</h3><ul class="space-y-2 text-sm" style="color:var(--muted)">${ins.slice(0,4).map(x=>`<li class="flex gap-2"><span>${x.i}</span><span>${x.t}</span></li>`).join('')}</ul><a href="#app/ai" class="mt-3 inline-block text-sm gold-text font-medium">Full analysis →</a></div><div class="biz-card p-5"><h3 class="font-semibold mb-3">Quick actions</h3><div class="grid grid-cols-2 gap-2">${[['invoices','🧾 New invoice'],['payments','💳 New payment'],['employees','👔 Add employee'],['properties','🏠 Add property']].map(q=>`<button class="btn btn-ghost !py-2 text-xs" data-action="bizAdd" data-coll="${q[0]}">${q[1]}</button>`).join('')}</div><div class="biz-divider my-4"></div><h3 class="font-semibold mb-2 text-sm">Outstanding invoices</h3>${u.length?u.slice(0,3).map(i=>`<div class="flex justify-between text-sm py-1"><span>${esc(i.client)}</span><span class="font-semibold" style="color:#f59e0b">${fmt(i.amount)}</span></div>`).join(''):'<p class="text-xs" style="color:var(--muted)">All invoices paid 🎉</p>'}</div></div>`;
  return header+k+alerts+chartsRow+ai;
}
function bizCompanies(){
  const s=bizStore();
  const cards=s.businesses.map(b=>{const act=b.id===s.active;const rc=k=>(s[k]||[]).filter(r=>r.biz===b.id).length;
    return `<div class="biz-card p-5 ${act?'biz-ring':''}"><div class="flex items-center justify-between"><div class="flex items-center gap-3"><span class="text-3xl">${b.logo||'🏢'}</span><div><p class="font-bold">${esc(b.name)} ${act?'<span class="biz-pill ml-1">Active</span>':''}</p><p class="text-xs" style="color:var(--muted)">${esc(b.industry||'')} · ${esc(b.founded||'')}</p></div></div><div class="flex"><button class="text-xs px-1.5 py-1 rounded hover:bg-white/10" data-action="bizEditCompany" data-id="${b.id}">✏️</button>${s.businesses.length>1?`<button class="text-xs px-1.5 py-1 rounded hover:bg-white/10" data-action="bizDelCompany" data-id="${b.id}">🗑</button>`:''}</div></div><div class="grid grid-cols-4 gap-2 mt-4 text-center text-xs">${[['Cash',fmt(b.cash||0)],['Staff',rc('employees')],['Property',rc('properties')],['Invoices',rc('invoices')]].map(x=>`<div class="rounded-lg p-2" style="background:var(--glass)"><p class="font-bold text-sm">${x[1]}</p><p style="color:var(--muted)">${x[0]}</p></div>`).join('')}</div>${!act?`<button class="btn btn-primary w-full mt-3 !py-2 text-sm" data-action="bizSwitchBtn" data-id="${b.id}">Switch to this company</button>`:''}</div>`;
  }).join('');
  return bizHead('Companies','🏢','Run multiple businesses from one workspace')+`<div class="grid gap-4 lg:grid-cols-2">${cards}</div><div class="mt-4 flex gap-2"><button class="btn btn-ghost" data-action="bizAddCompany">+ Add a company</button><button class="btn btn-ghost text-xs" data-action="bizReset">↺ Reset demo data</button></div>`;
}
function bizCashflow(){
  const m=bizMetrics();
  const pred=m.profit>=0?`At your current pace you'll add about ${fmt(m.profit*12)} to cash over the next 12 months.`:`At your current pace you'll burn about ${fmt(-m.profit*12)} over the next 12 months — act on expenses.`;
  return bizHead('Cash Flow Analytics','💸','Money in vs money out, with a forward projection')+`<div class="grid gap-3 sm:grid-cols-4 mb-5">${bizStat('Money in',fmt(m.revenue),'monthly','⬆️','#22c55e')}${bizStat('Money out',fmt(m.expenses),'monthly','⬇️','#ef4444')}${bizStat('Net flow',fmt(m.profit),'monthly','🔁',m.profit>=0?'#22c55e':'#ef4444')}${bizStat('Cash on hand',fmt(m.cash),'','🏦','gold')}</div>`+bizPanel('6-month trend',`<div style="height:280px"><canvas id="bizCash"></canvas></div>`)+`<div class="biz-card p-5 mt-4"><h3 class="font-semibold mb-2">🔮 Projection</h3><p class="text-sm" style="color:var(--muted)">${pred}</p></div>`;
}
function bizNetworth(){
  const m=bizMetrics();const rows=[['Cash',m.cash],['Property',m.propVal],['Investments',m.invVal],['Fleet',m.vehVal],['Inventory',m.stockVal]];
  return bizHead('Net Worth','💎','Total business value across all assets')+`<div class="biz-card p-6 mb-5 text-center"><p class="text-xs uppercase tracking-widest" style="color:var(--muted)">Total business value</p><p class="text-4xl font-extrabold gold-text mt-1">${fmt(m.netWorth)}</p></div><div class="grid gap-4 lg:grid-cols-2"><div class="biz-card p-5"><h3 class="font-semibold mb-3">Asset breakdown</h3><div style="height:260px"><canvas id="nwDonut"></canvas></div></div><div class="biz-card p-5"><h3 class="font-semibold mb-3">Holdings</h3>${tableWrap(['Asset','Value','Share'],rows.map(r=>`<tr class="biz-tr"><td class="py-2.5">${r[0]}</td><td>${fmt(r[1])}</td><td>${m.netWorth?Math.round(r[1]/m.netWorth*100):0}%</td></tr>`).join(''))}</div></div>`;
}
function bizProperties(){
  const recs=bizRecs('properties');const total=recs.reduce((a,p)=>a+(+p.value||0),0);const rent=recs.filter(p=>p.occupancy==='occupied').reduce((a,p)=>a+(+p.rent||0),0);
  const body=recs.length?tableWrap(['Property','Type','Value','Rent/mo','Status',''],recs.map(p=>`<tr class="biz-tr"><td class="py-2.5 font-medium">${esc(p.name)}</td><td>${esc(p.kind||'')}</td><td>${fmt(p.value)}</td><td>${fmt(p.rent||0)}</td><td>${bizTag(p.occupancy,statusColor(p.occupancy))}</td><td class="text-right whitespace-nowrap">${rowActions('properties',p.id)}</td></tr>`).join('')):bizEmpty('No properties yet. Add buildings, apartments, offices, shops, warehouses or land.');
  return bizHead('Property Management','🏗️','Buildings, rentals and land — value and occupancy')+`<div class="grid gap-4 sm:grid-cols-3 mb-5">${bizStat('Portfolio value',fmt(total),recs.length+' properties','🏠','gold')}${bizStat('Monthly rent',fmt(rent),'from occupied units','💶')}${bizStat('Occupancy',recs.length?Math.round(recs.filter(p=>p.occupancy==='occupied').length/recs.length*100)+'%':'—','','📊')}</div>`+bizPanel('Properties',body,addBtn('properties','Property'));
}
function bizEmployees(){
  const recs=bizRecs('employees');const payroll=recs.filter(e=>e.status==='active').reduce((a,e)=>a+(+e.salary||0),0);
  const body=recs.length?tableWrap(['Name','Position','Salary/mo','Hired','Status',''],recs.map(e=>`<tr class="biz-tr"><td class="py-2.5 font-medium">${esc(e.name)}</td><td>${esc(e.position||'')}</td><td>${fmt(e.salary)}</td><td>${esc(e.hired||'')}</td><td>${bizTag(e.status,statusColor(e.status))}</td><td class="text-right">${rowActions('employees',e.id)}</td></tr>`).join('')):bizEmpty('Add your team — track salaries and status.');
  return bizHead('Employees','👔','Team, salaries and payroll')+`<div class="grid gap-3 sm:grid-cols-3 mb-5">${bizStat('Monthly payroll',fmt(payroll),'active staff','💵','gold')}${bizStat('Headcount',recs.filter(e=>e.status==='active').length,'active','🧑‍💼')}${bizStat('Annual cost',fmt(payroll*12),'projected','📆')}</div>`+bizPanel('Staff',body,addBtn('employees','Employee'));
}
function bizPayments(){
  const recs=bizRecs('payments');const pending=recs.filter(p=>p.status!=='paid').reduce((a,p)=>a+(+p.amount||0),0);const overdue=recs.filter(p=>p.status==='overdue').length;
  const body=recs.length?tableWrap(['Name','Type','Amount','Due','Status',''],recs.map(p=>`<tr class="biz-tr"><td class="py-2.5 font-medium">${esc(p.name)}</td><td>${esc(p.type||'')}</td><td>${fmt(p.amount)}</td><td>${esc(p.due||'')}</td><td>${bizTag(p.status,statusColor(p.status))}</td><td class="text-right whitespace-nowrap">${p.status!=='paid'?`<button class="text-xs px-1.5 py-1 rounded hover:bg-white/10" data-action="bizPaid" data-coll="payments" data-id="${p.id}" title="Mark paid">✅</button>`:''}${rowActions('payments',p.id)}</td></tr>`).join('')):bizEmpty('Track salaries, rent, taxes, bills, invoices and loans.');
  return bizHead('Payments','💳','Salaries, rent, taxes, bills, loans')+`<div class="grid gap-3 sm:grid-cols-2 mb-5">${bizStat('Pending / overdue',fmt(pending),recs.filter(p=>p.status!=='paid').length+' to pay','⏳','#f59e0b')}${bizStat('Overdue items',overdue,'need attention','⚠️',overdue?'#ef4444':'#22c55e')}</div>`+bizPanel('Scheduled payments',body,addBtn('payments','Payment'));
}
function bizInvoices(){
  const recs=bizRecs('invoices');const unpaid=recs.filter(i=>i.status==='unpaid').reduce((a,i)=>a+(+i.amount||0),0);const paid=recs.filter(i=>i.status==='paid').reduce((a,i)=>a+(+i.amount||0),0);
  const body=recs.length?tableWrap(['Client','Description','Amount','Due','Status',''],recs.map(i=>`<tr class="biz-tr"><td class="py-2.5 font-medium">${esc(i.client)}</td><td style="color:var(--muted)">${esc(i.desc||'')}</td><td>${fmt(i.amount)}</td><td>${esc(i.due||'')}</td><td>${bizTag(i.status,statusColor(i.status))}</td><td class="text-right whitespace-nowrap">${i.status==='unpaid'?`<button class="text-xs px-1.5 py-1 rounded hover:bg-white/10" data-action="bizPaid" data-coll="invoices" data-id="${i.id}" title="Mark paid">✅</button>`:''}${rowActions('invoices',i.id)}</td></tr>`).join('')):bizEmpty('Create invoices and track who has paid.');
  return bizHead('Invoices','🧾','Create invoices, track payments')+`<div class="grid gap-3 sm:grid-cols-2 mb-5">${bizStat('Unpaid invoices',fmt(unpaid),recs.filter(i=>i.status==='unpaid').length+' open','⏳','#f59e0b')}${bizStat('Collected',fmt(paid),'paid to date','✅','#22c55e')}</div>`+bizPanel('Invoices',body,addBtn('invoices','Invoice'));
}
function bizClients(){
  const recs=bizRecs('clients');
  const body=recs.length?`<div class="grid gap-3 sm:grid-cols-2">${recs.map(c=>`<div class="biz-card p-4"><div class="flex justify-between"><div><p class="font-bold">${esc(c.name)}</p>${c.company?`<p class="text-xs" style="color:var(--muted)">${esc(c.company)}</p>`:''}</div><div>${rowActions('clients',c.id)}</div></div><div class="mt-2 text-sm space-y-0.5" style="color:var(--muted)">${c.phone?`<p>📞 ${esc(c.phone)}</p>`:''}${c.email?`<p>✉️ ${esc(c.email)}</p>`:''}${c.value?`<p>💼 ${fmt(c.value)} contract</p>`:''}${c.notes?`<p>📝 ${esc(c.notes)}</p>`:''}</div></div>`).join('')}</div>`:bizEmpty('Build your CRM — clients, contacts, contracts and notes.');
  return bizHead('Clients (CRM)','🤝','Contacts, contracts and relationships')+bizPanel('Clients',body,addBtn('clients','Client'));
}
function bizInvestments(){
  const recs=bizRecs('investments');const inv=recs.reduce((a,i)=>a+(+i.invested||0),0),val=recs.reduce((a,i)=>a+(+i.value||0),0),g=val-inv;
  const body=recs.length?tableWrap(['Investment','Type','Invested','Value','Profit/Loss',''],recs.map(i=>{const gg=(+i.value||0)-(+i.invested||0);return `<tr class="biz-tr"><td class="py-2.5 font-medium">${esc(i.name)}</td><td>${esc(i.type||'')}</td><td>${fmt(i.invested)}</td><td>${fmt(i.value)}</td><td style="color:${gg>=0?'#22c55e':'#ef4444'}">${gg>=0?'+':''}${fmt(gg)}</td><td class="text-right">${rowActions('investments',i.id)}</td></tr>`;}).join('')):bizEmpty('Track real estate, stocks, crypto, businesses, vehicles and equipment.');
  return bizHead('Investment Center','📈','Holdings and performance')+`<div class="grid gap-3 sm:grid-cols-3 mb-5">${bizStat('Invested',fmt(inv),'cost basis','💵')}${bizStat('Current value',fmt(val),'','💎','gold')}${bizStat('Total P/L',(g>=0?'+':'')+fmt(g),g>=0?'in profit':'in loss','📊',g>=0?'#22c55e':'#ef4444')}</div>`+bizPanel('Portfolio',body,addBtn('investments','Investment'));
}
function bizVehicles(){
  const recs=bizRecs('vehicles');const val=recs.reduce((a,v)=>a+(+v.value||0),0),run=recs.reduce((a,v)=>a+(+v.monthly||0),0);
  const body=recs.length?tableWrap(['Vehicle','Type','Value','Running/mo',''],recs.map(v=>`<tr class="biz-tr"><td class="py-2.5 font-medium">${esc(v.name)}</td><td>${esc(v.type||'')}</td><td>${fmt(v.value)}</td><td>${fmt(v.monthly||0)}</td><td class="text-right">${rowActions('vehicles',v.id)}</td></tr>`).join('')):bizEmpty('Track cars, trucks, vans and boats with running costs.');
  return bizHead('Fleet','🚗','Vehicles, maintenance, fuel and insurance')+`<div class="grid gap-3 sm:grid-cols-2 mb-5">${bizStat('Fleet value',fmt(val),recs.length+' vehicles','🚙','gold')}${bizStat('Running cost',fmt(run),'per month','⛽','#f59e0b')}</div>`+bizPanel('Vehicles',body,addBtn('vehicles','Vehicle'));
}
function bizInventory(){
  const recs=bizRecs('inventory');const val=recs.reduce((a,w)=>a+(+w.value||0),0);
  const body=recs.length?recs.map(w=>{const p=w.capacity?Math.round((+w.used||0)/w.capacity*100):0;const col=p>=90?'#ef4444':p>=70?'#f59e0b':'#22c55e';return `<div class="mb-4"><div class="flex justify-between text-sm mb-1"><span class="font-medium">${esc(w.name)} ${w.notes?`<span style="color:var(--muted)">· ${esc(w.notes)}</span>`:''}</span><span style="color:${col}">${p}% full · ${fmt(w.value)}</span></div><div class="h-2.5 rounded-full" style="background:var(--glass)"><div class="h-full rounded-full" style="width:${p}%;background:${col}"></div></div><div class="flex justify-between items-center mt-1"><span class="text-[11px]" style="color:var(--muted)">${w.used||0} / ${w.capacity||0} units</span><span>${rowActions('inventory',w.id)}</span></div></div>`;}).join(''):bizEmpty('Add warehouses — track capacity, stock and value.');
  return bizHead('Inventory & Warehouse','📦','Capacity, stock levels and value')+`<div class="grid gap-3 sm:grid-cols-2 mb-5">${bizStat('Inventory value',fmt(val),recs.length+' locations','📦','gold')}${bizStat('Capacity alerts',recs.filter(w=>w.capacity&&w.used/w.capacity>=0.9).length,'near full','⚠️',recs.some(w=>w.capacity&&w.used/w.capacity>=0.9)?'#ef4444':'#22c55e')}</div>`+bizPanel('Warehouses',body,addBtn('inventory','Warehouse'));
}
function bizTaxes(){
  const recs=bizRecs('taxes');const due=recs.filter(t=>t.status==='pending').reduce((a,t)=>a+(+t.amount||0),0);
  const next=recs.filter(t=>t.status==='pending'&&t.due).sort((a,b)=>a.due.localeCompare(b.due))[0];
  const body=recs.length?tableWrap(['Tax','Period','Amount','Due','Status',''],recs.map(t=>`<tr class="biz-tr"><td class="py-2.5 font-medium">${esc(t.name)}</td><td>${esc(t.period||'')}</td><td>${fmt(t.amount)}</td><td>${esc(t.due||'')}</td><td>${bizTag(t.status,statusColor(t.status))}</td><td class="text-right whitespace-nowrap">${t.status==='pending'?`<button class="text-xs px-1.5 py-1 rounded hover:bg-white/10" data-action="bizPaid" data-coll="taxes" data-id="${t.id}" title="Mark paid">✅</button>`:''}${rowActions('taxes',t.id)}</td></tr>`).join('')):bizEmpty('Track monthly, quarterly and annual taxes with deadlines.');
  return bizHead('Tax Center','🏛️','Deadlines, amounts and what is due')+`<div class="grid gap-3 sm:grid-cols-2 mb-5">${bizStat('Taxes due',fmt(due),recs.filter(t=>t.status==='pending').length+' pending','🧾','#f59e0b')}${bizStat('Next deadline',next?next.due:'—',next?next.name:'all clear','⏰',next?'#ef4444':'#22c55e')}</div>`+bizPanel('Tax obligations',body,addBtn('taxes','Tax'));
}
function bizCalendar(){
  const ev=bizRecs('events').map(e=>({date:e.date,title:e.title,type:e.type,id:e.id}));
  bizRecs('taxes').filter(t=>t.due&&t.status==='pending').forEach(t=>ev.push({date:t.due,title:t.name+' due',type:'Tax'}));
  bizRecs('payments').filter(p=>p.due&&p.status!=='paid').forEach(p=>ev.push({date:p.due,title:p.name,type:'Payment'}));
  bizRecs('invoices').filter(i=>i.due&&i.status==='unpaid').forEach(i=>ev.push({date:i.due,title:'Invoice: '+i.client,type:'Deadline'}));
  ev.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  const tc={Meeting:'#a78bfa',Tax:'#ef4444',Salary:'#22c55e',Payment:'#f59e0b',Deadline:'#d4af37'};
  const body=ev.length?ev.map(e=>`<div class="flex items-center gap-3 biz-tr py-2.5"><div class="text-center w-12 shrink-0"><p class="text-[10px]" style="color:var(--muted)">${e.date?new Date(e.date).toLocaleString('en',{month:'short'}):''}</p><p class="text-lg font-bold">${e.date?new Date(e.date).getDate():'—'}</p></div><div class="flex-1 min-w-0"><p class="text-sm font-medium truncate">${esc(e.title)}</p><span class="biz-tag" style="background:${(tc[e.type]||'#94a3b8')}22;color:${tc[e.type]||'#94a3b8'}">${esc(e.type)}</span></div>${e.id?`<div>${rowActions('events',e.id)}</div>`:''}</div>`).join(''):bizEmpty('No events. Add meetings, deadlines and key dates.');
  return bizHead('Business Calendar','📅','Meetings, tax dates, salary runs, deadlines')+bizPanel('Upcoming',body,addBtn('events','Event'));
}
function bizGoals(){
  const recs=bizRecs('goals');const ach=bizAchievements();
  const body=recs.length?recs.map(g=>{const p=g.target?Math.min(100,Math.round((+g.current||0)/g.target*100)):0;return `<div class="mb-4"><div class="flex justify-between text-sm mb-1"><span class="font-medium">${esc(g.title)} ${bizTag(g.kind||'Goal','#d4af37')}</span><span style="color:var(--muted)">${fmt(g.current||0)} / ${fmt(g.target)}</span></div><div class="h-2.5 rounded-full" style="background:var(--glass)"><div class="h-full rounded-full" style="width:${p}%;background:linear-gradient(90deg,#b8860b,#f3d97c)"></div></div><div class="text-right mt-1">${rowActions('goals',g.id)}</div></div>`;}).join(''):bizEmpty('Set targets: revenue, hiring, new location, equipment.');
  const grid=`<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">${ach.map(a=>`<div class="biz-card p-4 text-center ${a.got?'':'opacity-40'}"><div class="text-3xl">${a.e}</div><p class="text-xs mt-2 ${a.got?'gold-text font-semibold':''}">${a.name}</p><p class="text-[10px] mt-1" style="color:${a.got?'#22c55e':'var(--muted)'}">${a.got?'Unlocked':'Locked'}</p></div>`).join('')}</div>`;
  return bizHead('Goals & Achievements','🎯','Grow with targets and unlock milestones')+bizPanel('Business goals',body,addBtn('goals','Goal'))+`<div class="mt-5"><h3 class="font-semibold mb-3">🏅 Achievements</h3>${grid}</div>`;
}
function bizAi(){
  const ins=bizInsights();const al=bizAlerts();const m=bizMetrics();
  const summary=`Your company is ${m.health>=75?'in strong shape':m.health>=50?'stable':'under pressure'} with a health score of ${m.health}/100. Monthly revenue is ${fmt(m.revenue)} against ${fmt(m.expenses)} in expenses, for a ${m.profit>=0?'profit':'loss'} of ${fmt(Math.abs(m.profit))}. Net worth stands at ${fmt(m.netWorth)}.`;
  return bizHead('AI Business Advisor','🤖','Grounded analysis from your real numbers')+`<div class="biz-card p-5 mb-4"><h3 class="font-semibold mb-2">Executive summary</h3><p class="text-sm" style="color:var(--muted)">${summary}</p></div><div class="grid gap-4 lg:grid-cols-2"><div class="biz-card p-5"><h3 class="font-semibold mb-3">📊 Insights</h3><ul class="space-y-2.5 text-sm" style="color:var(--muted)">${ins.map(x=>`<li class="flex gap-2"><span>${x.i}</span><span>${x.t}</span></li>`).join('')}</ul></div><div class="biz-card p-5"><h3 class="font-semibold mb-3">⚡ Action items</h3>${al.length?`<ul class="space-y-2.5 text-sm">${al.map(x=>`<li class="flex gap-2"><span>${x.icon}</span><span style="color:${x.tone}">${x.text}</span></li>`).join('')}</ul>`:'<p class="text-sm" style="color:var(--muted)">No urgent issues. Everything looks healthy. ✅</p>'}</div></div>`;
}
function bizTeam(){
  const recs=bizRecs('team');
  const body=`<div class="flex items-center gap-3 biz-tr py-3"><span class="text-2xl">👑</span><div class="flex-1"><p class="text-sm font-medium">${esc(ME?.first_name||'You')} (Owner)</p><p class="text-xs" style="color:var(--muted)">${esc(ME?.email||'')}</p></div>${bizTag('Full access','#d4af37')}</div>`+recs.map(t=>`<div class="flex items-center gap-3 biz-tr py-3"><span class="text-2xl">👤</span><div class="flex-1"><p class="text-sm font-medium">${esc(t.name)}</p><p class="text-xs" style="color:var(--muted)">${esc(t.email||'')}</p></div>${bizTag(t.role||'Read only','#a78bfa')}<div class="ml-2">${rowActions('team',t.id)}</div></div>`).join('');
  return bizHead('Team Accounts','👥','Invite accountants, managers and staff with roles')+bizPanel('Members',body,addBtn('team','Member'))+`<div class="biz-card p-4 mt-4 text-xs" style="color:var(--muted)">Roles: <b>Read only</b> can view, <b>Editor</b> can add/edit records, <b>Manager</b> can manage finances, <b>Full access</b> can do everything. Live invitations activate with real accounts.</div>`;
}
function bizMarketplace(){
  const listings=[{e:'🤝',t:'Find business partners',d:'Connect with founders in your industry looking to collaborate.'},{e:'👔',t:'Hire talent',d:'Post roles and reach verified professionals on Goalify Business.'},{e:'🛠️',t:'Offer your services',d:'List what your company does and get discovered by other businesses.'},{e:'📦',t:'Sell products',d:'Move surplus inventory or list your catalogue to other companies.'},{e:'🌐',t:'Network',d:'Join industry circles and grow your professional network.'},{e:'📣',t:'Promote your brand',d:'Feature your company to the Goalify Business community.'}];
  return bizHead('Business Marketplace','🌐','Find partners, talent, services and customers')+`<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${listings.map(l=>`<div class="biz-card p-5"><div class="text-3xl">${l.e}</div><h3 class="font-semibold mt-3">${l.t}</h3><p class="text-sm mt-1" style="color:var(--muted)">${l.d}</p><button class="btn btn-ghost mt-4 w-full !py-2 text-sm" data-action="bizInvite">Explore</button></div>`).join('')}</div><div class="biz-card p-4 mt-4 text-xs" style="color:var(--muted)">The marketplace connects Goalify Business accounts. Live matching activates when you go online with real accounts.</div>`;
}
function bizProfile(){
  const m=bizMetrics();const b=bizActive();const years=b?.founded?Math.max(0,new Date().getFullYear()-(+b.founded)):0;
  const idRows=[['Company',esc(b?.name||'')],['Industry',esc(b?.industry||'')],['Founded',esc(b?.founded||'—')],['Years active',years],['Plan','BUSINESS'],['Status','Verified ✔']];
  return bizHead('Business Profile','🪪','Your company at a glance')+
  `<div class="biz-card p-6 mb-5"><div class="flex flex-wrap items-center gap-4"><span class="text-5xl">${b?.logo||'🏢'}</span><div><div class="flex items-center gap-2 flex-wrap"><h2 class="text-2xl font-bold gold-text">${esc(b?.name||'Your Company')}</h2><span class="biz-tag" style="background:#22c55e22;color:#22c55e">✔ Verified Business</span></div><p class="text-sm mt-1" style="color:var(--muted)">${esc(b?.industry||'')} · Est. ${esc(b?.founded||'—')} · ${years} year${years===1?'':'s'} active</p></div><a href="#app/companies" class="btn btn-ghost !py-2 text-sm ml-auto">Edit details</a></div></div>
  <div class="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-5">${bizStat('Employees',m.empCount,'active','👔')}${bizStat('Properties',m.propCount,fmt(m.propVal),'🏠')}${bizStat('Total assets',fmt(m.netWorth),'net worth','💎','gold')}${bizStat('Monthly revenue',fmt(m.revenue),'','💰','gold')}</div>
  <div class="grid gap-4 lg:grid-cols-2"><div class="biz-card p-5"><h3 class="font-semibold mb-3">Identity</h3>${tableWrap(['Field','Value'],idRows.map(r=>`<tr class="biz-tr"><td class="py-2.5" style="color:var(--muted)">${r[0]}</td><td class="font-medium">${r[1]}</td></tr>`).join(''))}</div>
  <div class="biz-card p-5"><h3 class="font-semibold mb-3">Achievements</h3><div class="grid grid-cols-4 gap-3">${bizAchievements().map(a=>`<div class="text-center ${a.got?'':'opacity-30'}"><div class="text-2xl">${a.e}</div><p class="text-[9px] mt-1" style="color:var(--muted)">${a.name}</p></div>`).join('')}</div><a href="#app/goals" class="text-sm gold-text mt-4 inline-block">View all →</a></div></div>`;
}
function bizReports(){
  const sets=[['summary','Financial summary'],['invoices','Invoices'],['payments','Payments'],['employees','Employees'],['properties','Properties'],['investments','Investments'],['vehicles','Fleet'],['inventory','Inventory'],['taxes','Taxes'],['clients','Clients']];
  return bizHead('Reports & Export','📄','Download CSV reports or print a PDF')+bizPanel('Export data',`<div class="grid gap-2 sm:grid-cols-2">${sets.map(s=>`<button class="btn btn-ghost !py-2.5 text-sm" data-action="bizExport" data-coll="${s[0]}" style="justify-content:space-between"><span>${s[1]}</span><span>⬇️ CSV</span></button>`).join('')}</div>`)+`<div class="biz-card p-5 mt-4"><h3 class="font-semibold mb-2">📑 PDF report</h3><p class="text-sm mb-3" style="color:var(--muted)">Generate a printable financial overview (use your browser's "Save as PDF").</p><button class="btn btn-primary !py-2 text-sm" data-action="bizPrint">🖨️ Print / Save as PDF</button></div>`;
}

// ---------- actions ----------
function bizSwitchTo(id){const s=bizStore();if(!s.businesses.find(b=>b.id===id))return;s.active=id;setBizStore(s);toast('Switched company');location.hash='#app/dashboard';render();}
function bizDelete(coll,id){const s=bizStore();if(s[coll])s[coll]=s[coll].filter(r=>r.id!==id);setBizStore(s);toast('Deleted');render();}
function bizMarkPaid(coll,id){const s=bizStore();const r=(s[coll]||[]).find(x=>x.id===id);if(r)r.status='paid';setBizStore(s);toast('Marked as paid ✓');render();}
function bizDeleteCompany(id){const s=bizStore();if(s.businesses.length<=1){toast('You need at least one company','err');return;}if(!confirm('Delete this company and all its records?'))return;s.businesses=s.businesses.filter(b=>b.id!==id);['properties','employees','payments','invoices','clients','investments','vehicles','inventory','taxes','events','goals','team'].forEach(k=>{if(s[k])s[k]=s[k].filter(r=>r.biz!==id);});if(s.active===id)s.active=s.businesses[0].id;setBizStore(s);toast('Company removed');render();}
function bizExportCSV(coll){
  let rows,name;
  if(coll==='summary'){const m=bizMetrics();rows=[{Metric:'Revenue (monthly)',Value:m.revenue},{Metric:'Expenses (monthly)',Value:m.expenses},{Metric:'Profit (monthly)',Value:m.profit},{Metric:'Net income (monthly)',Value:m.net},{Metric:'Cash',Value:m.cash},{Metric:'Outstanding',Value:m.outstanding},{Metric:'Net worth',Value:m.netWorth},{Metric:'Employees',Value:m.empCount},{Metric:'Properties',Value:m.propCount},{Metric:'Health score',Value:m.health}];name='financial-summary';}
  else {rows=bizRecs(coll).map(({biz,id,...r})=>r);name=coll;}
  if(!rows.length){toast('Nothing to export','err');return;}
  const keys=[...new Set(rows.flatMap(r=>Object.keys(r)))];
  const csv=[keys.join(','),...rows.map(r=>keys.map(k=>JSON.stringify(r[k]??'')).join(','))].join('\n');
  const blob=new Blob([csv],{type:'text/csv'});const u=URL.createObjectURL(blob);const el=document.createElement('a');el.href=u;el.download='goalify-'+name+'.csv';el.click();URL.revokeObjectURL(u);toast('Exported '+name+'.csv 📄');
}
function openBizForm(coll,id){
  const spec=BIZ_SPECS[coll];if(!spec)return;
  const s=bizStore();const isCompany=coll==='businesses';
  const list=isCompany?s.businesses:(s[coll]||[]);
  const rec=id?list.find(r=>r.id===id):null;
  const m=document.getElementById('modal');
  const fieldHTML=spec.fields.map(f=>{const v=rec?(rec[f.key]??''):(f.default??'');const wrap=f.wide?'col-span-2':'';
    if(f.type==='select')return `<div class="${wrap}"><label class="label">${f.label}</label><select data-f="${f.key}" class="input">${f.options.map(o=>`<option value="${o}" ${String(v)===String(o)?'selected':''}>${o[0].toUpperCase()+o.slice(1)}</option>`).join('')}</select></div>`;
    if(f.type==='textarea')return `<div class="${wrap}"><label class="label">${f.label}</label><textarea data-f="${f.key}" class="input" rows="2">${esc(v)}</textarea></div>`;
    return `<div class="${wrap}"><label class="label">${f.label}</label><input data-f="${f.key}" type="${f.type}" class="input" value="${esc(v)}"></div>`;
  }).join('');
  m.innerHTML=`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" id="bfBack"><div class="w-full max-w-lg biz-card p-6 anim" style="max-height:88vh;overflow-y:auto"><div class="flex items-center justify-between"><h2 class="text-xl font-bold">${id?'Edit ':'New '}${spec.title}</h2><button id="bfX" style="color:var(--muted)">✕</button></div><div class="mt-4 grid grid-cols-2 gap-3">${fieldHTML}</div><button id="bfSave" class="btn btn-primary mt-5 w-full">${id?'Save changes':'Create'}</button></div></div>`;
  const close=()=>m.innerHTML='';
  $('#bfBack').addEventListener('click',e=>{if(e.target.id==='bfBack')close();});
  $('#bfX').addEventListener('click',close);
  $('#bfSave').addEventListener('click',()=>{
    const vals={};
    m.querySelectorAll('[data-f]').forEach(el=>{const k=el.getAttribute('data-f');const fd=spec.fields.find(x=>x.key===k);let val=el.value;if(fd.type==='number')val=Number(val)||0;vals[k]=typeof val==='string'?val.trim():val;});
    if(spec.required&&spec.required.some(k=>vals[k]===''||vals[k]==null)){toast('Please fill required fields','err');return;}
    const st=bizStore();
    if(isCompany){if(rec){const t=st.businesses.find(b=>b.id===id);Object.assign(t,vals);}else{const nb={id:'b'+Date.now(),...vals};st.businesses.push(nb);st.active=nb.id;}}
    else{st[coll]=st[coll]||[];if(rec){const t=st[coll].find(r=>r.id===id);Object.assign(t,vals);}else{st[coll].push({id:coll[0]+Date.now(),biz:st.active,...vals});}}
    setBizStore(st);close();toast((id?'Updated':'Added')+' ✓');render();
  });
}

// ============================================================
// EVENTS
// ============================================================
document.addEventListener('click',async(e)=>{
  const sc=e.target.closest('[data-scroll]'); if(sc){const id=sc.getAttribute('data-scroll');const el=document.getElementById('sec-'+id);if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'});}return;}
  const a=e.target.closest('[data-action]'); if(!a)return;
  const act=a.getAttribute('data-action');
  try{
    if(act==='oauth'){
      const provider=a.getAttribute('data-provider');
      const redirectTo=location.protocol==='file:'?undefined:location.origin+(location.pathname==='/'?'':location.pathname);
      const {error}=await sb.auth.signInWithOAuth({provider,options:{redirectTo}});
      if(error)toast(error.message,'err');
    }
    else if(act==='togglePw'){const inp=document.getElementById(a.getAttribute('data-target'));if(inp){const show=inp.type==='password';inp.type=show?'text':'password';a.innerHTML=show?EYE_OFF:EYE_ON;}}
    else if(act==='resendVerify'){const em=a.getAttribute('data-email');if(em){const {error}=await sb.auth.resend({email:em,type:'signup'});if(error)toast(error.message,'err');else toast('Confirmation email resent — check your inbox!');}}
    else if(act==='faq'){const i=a.getAttribute('data-i');$('#fa-'+i).classList.toggle('hidden');$('#fi-'+i).textContent=$('#fa-'+i).classList.contains('hidden')?'+':'−';}
    else if(act==='logout'){if(!DEMO_MODE){await sb.auth.signOut();}ME=null;location.hash='#home';}
    else if(act==='newGoal'){openGoalModal();}
    else if(act==='newMission'){openMissionModal(a.getAttribute('data-goal'));}
    else if(act==='checkin'){const id=a.getAttribute('data-id');const m=allMissions().find(x=>x.id===id);if(!m)return;if(isDoneToday(id)){uncheckMission(id);toast('Check-in undone');}else{checkInMission(id);const xp=DIFF[m.difficulty]?.xp||5;if(DEMO_MODE)DEMO_ME.xp=(DEMO_ME.xp||0)+xp;else await sb.rpc('award_xp',{p_amount:xp}).catch(()=>{});const st=missionStreak(id);toast('✓ '+(st>1?st+'-day streak! ':'')+'+'+xp+' XP');}await loadProfile();render();}
    else if(act==='pauseMission'){const id=a.getAttribute('data-id');for(const g of GOALS){const m=(g.missions||[]).find(x=>x.id===id);if(m){m.status=m.status==='paused'?'active':'paused';break;}}render();}
    else if(act==='delMission'){const id=a.getAttribute('data-id');for(const g of GOALS){const i=(g.missions||[]).findIndex(x=>x.id===id);if(i>-1){g.missions.splice(i,1);break;}}const o=mlogs();delete o[id];setMlogs(o);toast('Mission removed');render();}
    else if(act==='archiveGoal'){const gid=a.getAttribute('data-id');const g=GOALS.find(x=>x.id===gid);if(!g)return;const ns=g.status==='archived'?'active':'archived';g.status=ns;if(!DEMO_MODE){await sb.from('goals').update({status:ns}).eq('id',gid);}toast(ns==='archived'?'Goal archived 📦':'Goal restored ♻️');render();}
    else if(act==='delGoal'){if(ME.plan==='free'){toast('Free plan: archive goals instead of deleting. Upgrade to delete.','err');return;}const gid=a.getAttribute('data-id');if(DEMO_MODE){const idx=DEMO_GOALS.findIndex(g=>g.id===gid);if(idx>-1)DEMO_GOALS.splice(idx,1);toast('Goal deleted');render();}else{await sb.from('goals').delete().eq('id',gid);toast('Goal deleted');render();}}
    else if(act==='contrib'){const id=a.getAttribute('data-id');const amt=+$('#c-'+id).value;if(amt){const g=GOALS.find(x=>x.id===id);const ns=Math.max(0,Number(g.saved_amount)+amt);const done=ns>=g.target_amount;if(DEMO_MODE){g.saved_amount=ns;g.completed=done;if(done){DEMO_ME.xp=(DEMO_ME.xp||0)+100;toast('🎉 Goal completed! +100 XP (demo)');}else toast('Progress saved (demo)');render();}else{await sb.from('goals').update({saved_amount:ns,completed:done}).eq('id',id);if(done){await sb.rpc('award_xp',{p_amount:100});toast('🎉 Goal completed! +100 XP');}render();}}}
    else if(act==='delExp'){const eid=a.getAttribute('data-id');if(DEMO_MODE){const idx=DEMO_EXPENSES.findIndex(x=>x.id===eid);if(idx>-1)DEMO_EXPENSES.splice(idx,1);render();}else{await sb.from('expenses').delete().eq('id',eid);render();}}
    else if(act==='tf'){a.parentElement.querySelectorAll('button').forEach(b=>{b.style.background='';b.style.color='var(--muted)';b.classList.remove('text-white');});a.style.background='linear-gradient(90deg,var(--accent1),var(--accent2))';a.style.color='';a.classList.add('text-white');drawSpend(a.getAttribute('data-tf'));}
    else if(act==='ask'){const q=a.getAttribute('data-q');sendChat(q,q.toLowerCase().includes('roast')?'roast':'coach');}
    else if(act==='setSavingsMode'){const m=a.getAttribute('data-mode');ME.savings_mode=m;if(!DEMO_MODE){await sb.from('profiles').update({savings_mode:m}).eq('id',SESSION.user.id);}toast(SAVINGS_MODES[m].emoji+' '+SAVINGS_MODES[m].name+' mode');render();}
    else if(act==='setCoachMode'){const m=a.getAttribute('data-mode');ME.coach_mode=m;if(!DEMO_MODE){await sb.from('profiles').update({coach_mode:m}).eq('id',SESSION.user.id);}toast(COACH_MODES[m].emoji+' '+COACH_MODES[m].name);render();}
    else if(act==='setTheme'){applyTheme(a.getAttribute('data-mode'),null);if(!DEMO_MODE){await sb.from('profiles').update({theme:ME.theme}).eq('id',SESSION.user.id);}render();}
    else if(act==='setColor'){applyTheme(null,a.getAttribute('data-color'));if(!DEMO_MODE){await sb.from('profiles').update({theme_color:ME.theme_color}).eq('id',SESSION.user.id);}render();}
    else if(act==='setBg'){applyBg(a.getAttribute('data-bg'));if(!DEMO_MODE){await sb.from('profiles').update({bg:ME.bg}).eq('id',SESSION.user.id);}render();}
    else if(act==='demoPlan'){const pl=a.getAttribute('data-plan');if(DEMO_MODE){DEMO_ME.plan=pl;ME.plan=pl;toast('Now previewing '+PLANS[pl].name+' plan (demo)');render();}else{toast('Upgrades are handled by an admin or via student verification.');}}
    else if(act==='redeemPromo'){const code=($('#promoInput')?.value||'').trim().toUpperCase();if(!code)return toast('Enter a code','err');const plan=PROMO_CODES[code];if(!plan)return toast('Invalid or expired code','err');const used=JSON.parse(localStorage.getItem('goalify_promo_used')||'[]');if(used.includes(code))return toast('This code has already been used','err');used.push(code);localStorage.setItem('goalify_promo_used',JSON.stringify(used));if(DEMO_MODE){DEMO_ME.plan=plan;ME.plan=plan;}else{await sb.from('profiles').update({plan}).eq('id',SESSION.user.id);await loadProfile();}toast('🎉 '+PLANS[plan].name+' plan activated!');render();}
    else if(act==='adminLogin'){const code=($('#adminInput')?.value||'').trim();if(code!==ADMIN_CODE)return toast('Incorrect access code','err');localStorage.setItem('goalify_admin','1');toast('🛡️ Admin access granted');location.hash='#admin';}
    else if(act==='adminLogout'){localStorage.removeItem('goalify_admin');toast('Admin signed out');render();}
    else if(act==='simPreset'){simPreset(a.getAttribute('data-preset'));}
    else if(act==='bizAdd'){openBizForm(a.getAttribute('data-coll'));}
    else if(act==='bizEdit'){openBizForm(a.getAttribute('data-coll'),a.getAttribute('data-id'));}
    else if(act==='bizDel'){bizDelete(a.getAttribute('data-coll'),a.getAttribute('data-id'));}
    else if(act==='bizPaid'){bizMarkPaid(a.getAttribute('data-coll'),a.getAttribute('data-id'));}
    else if(act==='bizAddCompany'){openBizForm('businesses');}
    else if(act==='bizEditCompany'){openBizForm('businesses',a.getAttribute('data-id'));}
    else if(act==='bizDelCompany'){bizDeleteCompany(a.getAttribute('data-id'));}
    else if(act==='bizSwitchBtn'){bizSwitchTo(a.getAttribute('data-id'));}
    else if(act==='bizExport'){bizExportCSV(a.getAttribute('data-coll'));}
    else if(act==='bizPrint'){window.print();}
    else if(act==='bizInvite'){toast('Live networking activates with real accounts (demo).');}
    else if(act==='bizReset'){if(confirm('Reset all business demo data?')){localStorage.removeItem('goalify_biz');toast('Business data reset');render();}}
    else if(act==='shareCard'){try{makeShareCard();toast('Progress card downloaded 📤');}catch(e){toast('Could not generate card','err');}}
    else if(act==='support'){toast('👏 You sent support to '+a.getAttribute('data-name')+'!');}
    else if(act==='joinChallenge'){toast('⚔️ You joined the weekly challenge!');}
    else if(act==='copyInvite'){const link=location.origin+location.pathname+'#invite';try{await navigator.clipboard.writeText(link);toast('🔗 Invite link copied!');}catch(e){toast('Invite link: '+link);}}
    else if(act==='findUser'){toast('No matching profiles yet — live once accounts are enabled.');}
    else if(act==='checkIn'){const r=doCheckIn();if(r.already){toast('Already checked in today ✓');}else{if(DEMO_MODE)DEMO_ME.xp=(DEMO_ME.xp||0)+10;else await sb.rpc('award_xp',{p_amount:10}).catch(()=>{});await loadProfile();toast('🔥 '+r.count+'-day streak! +10 XP');}render();}
    else if(act==='chalFilter'){CHAL_FILTER=+a.getAttribute('data-d');render();}
    else if(act==='joinChal'){const k=a.getAttribute('data-key');const arr=chalState();if(!arr.find(c=>c.key===k)){arr.push({key:k,start:todayISO(),proofs:[],status:'active'});setChalState(arr);}toast('Challenge started — log proof daily 💪');render();}
    else if(act==='proofChal'){openProofModal(a.getAttribute('data-key'));}
    else if(act==='reviewChal'){const k=a.getAttribute('data-key');const arr=chalState();const c=arr.find(x=>x.key===k);if(c){c.status='pending';setChalState(arr);}toast('Submitted for review — XP is granted after approval ⏳');render();}
    else if(act==='leaveChal'){const k=a.getAttribute('data-key');setChalState(chalState().filter(c=>c.key!==k));toast('Left challenge');render();}
    else if(act==='export'){let g=GOALS,x=EXPENSES;if(!DEMO_MODE){[{data:g},{data:x}]=await Promise.all([sb.from('goals').select('*'),sb.from('expenses').select('*')]);}const blob=new Blob([JSON.stringify({profile:ME,goals:g,expenses:x},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const el=document.createElement('a');el.href=u;el.download='goalify-data.json';el.click();URL.revokeObjectURL(u);}
    else if(act==='rmAvatar'){ME.avatar_url=null;localStorage.removeItem('goalify_avatar_'+uid());if(!DEMO_MODE){await sb.from('profiles').update({avatar_url:null}).eq('id',SESSION.user.id);}toast('Photo removed');render();}
    else if(act==='saveNotif'){const prefs={};document.querySelectorAll('[data-notif]').forEach(i=>prefs[i.getAttribute('data-notif')]=i.checked);if(DEMO_MODE){DEMO_ME.notification_prefs=prefs;toast('Preferences saved (demo)');}else{await sb.from('profiles').update({notification_prefs:prefs}).eq('id',SESSION.user.id);toast('Preferences saved');}}
    else if(act==='delAcct'){if(DEMO_MODE){toast('Account deletion is disabled in demo mode','err');return;}if(confirm('Delete all your data? This cannot be undone.')){await sb.from('goals').delete().eq('user_id',SESSION.user.id);await sb.from('expenses').delete().eq('user_id',SESSION.user.id);await sb.from('profiles').delete().eq('id',SESSION.user.id);await sb.auth.signOut();toast('Account data deleted');location.hash='#home';}}
    else if(act==='qback'){captureQuizStep();QSTEP=Math.max(0,QSTEP-1);renderQuiz();}
    else if(act==='qnext'){captureQuizStep();QSTEP++;renderQuiz();}
    else if(act==='qradio'){QA[a.getAttribute('data-field')]=a.getAttribute('data-val');QSTEP++;renderQuiz();}
    else if(act==='qchip'){const f=a.getAttribute('data-field'),v=a.getAttribute('data-val');QA[f].has(v)?QA[f].delete(v):QA[f].add(v);renderQuiz();}
    else if(act==='approveChal'){const k=a.getAttribute('data-key');const arr=chalState();const c=arr.find(x=>x.key===k);if(c){c.status='approved';setChalState(arr);const def=CHALLENGES.find(x=>x.key===k);const xp=def?.xp||0;if(DEMO_MODE)DEMO_ME.xp=(DEMO_ME.xp||0)+xp;else await sb.rpc('award_xp',{p_amount:xp}).catch(()=>{});await loadProfile();toast('✓ Approved — +'+xp+' XP granted');}render();}
    else if(act==='rejectChal'){const k=a.getAttribute('data-key');const arr=chalState();const c=arr.find(x=>x.key===k);if(c){c.status='rejected';setChalState(arr);}toast('Submission rejected — no XP');render();}
    else if(act==='approveSV'){await sb.rpc('approve_student',{p_id:a.getAttribute('data-id')});toast('Approved → Pro');render();}
    else if(act==='rejectSV'){await sb.rpc('reject_student',{p_id:a.getAttribute('data-id')});toast('Rejected');render();}
  }catch(err){toast(err.message||'Something went wrong','err');}
});
document.addEventListener('change',async(e)=>{
  if(e.target.id==='bizSwitch'){bizSwitchTo(e.target.value);return;}
  const a=e.target.closest('[data-action="setPlan"]'); if(a){try{await sb.rpc('admin_set_plan',{p_user:a.getAttribute('data-id'),p_plan:a.value});toast('Plan updated');}catch(err){toast(err.message,'err');}}
  if(e.target.id==='avatarInput'){
    const file=e.target.files&&e.target.files[0]; if(!file)return;
    if(file.size>2*1024*1024){toast('Image too large (max 2MB)','err');return;}
    const reader=new FileReader();
    reader.onload=async()=>{const url=reader.result;ME.avatar_url=url;
      if(DEMO_MODE){localStorage.setItem('goalify_avatar_'+uid(),url);}
      else{try{await sb.from('profiles').update({avatar_url:url}).eq('id',SESSION.user.id);}catch(err){}}
      toast('Photo updated');render();};
    reader.readAsDataURL(file);
  }
});
document.addEventListener('input',e=>{
  if(e.target.closest('[data-action="sim"]'))runSim();
  if(e.target.getAttribute('data-action')==='pwStr')updatePwStr(e.target.value);
});

document.addEventListener('submit',async(e)=>{
  const f=e.target; e.preventDefault();
  try{
    if(f.id==='signupForm'){
      const fd=new FormData(f);
      if(fd.get('password')!==fd.get('confirm'))return toast('Passwords do not match','err');
      const {score}=pwStrength(fd.get('password'));
      if(score<3)return toast('Password too weak — needs 8+ chars, a number, and a letter','err');
      const btn=$('#signupBtn');btn.disabled=true;btn.textContent='Creating…';
      const {data,error}=await sb.auth.signUp({email:fd.get('email'),password:fd.get('password'),options:{data:{first_name:fd.get('first_name'),last_name:fd.get('last_name')}}});
      btn.disabled=false;btn.textContent='Create account';
      if(error)return toast(error.message,'err');
      if(data.session){location.hash='#quiz';}
      else{toast('Account created! Log in to continue.');location.hash='#login';}
    }
    else if(f.id==='loginForm'){
      const fd=new FormData(f);
      if(fd.get('remember'))localStorage.setItem(REMEMBER,'1');else localStorage.removeItem(REMEMBER);
      const btn=$('#loginBtn');btn.disabled=true;btn.textContent='Logging in…';
      const {error}=await sb.auth.signInWithPassword({email:fd.get('email'),password:fd.get('password')});
      btn.disabled=false;btn.textContent='Log in';
      if(error)return toast(error.message,'err');
      // onAuthStateChange handles redirect
    }
    else if(f.id==='forgotForm'){const fd=new FormData(f);const {error}=await sb.auth.resetPasswordForEmail(fd.get('email'),{redirectTo:location.origin+location.pathname+'#reset'});if(error)return toast(error.message,'err');toast('Reset link sent — check your email.');}
    else if(f.id==='resetForm'){const fd=new FormData(f);if(fd.get('password')!==fd.get('confirm'))return toast('Passwords do not match','err');const {error}=await sb.auth.updateUser({password:fd.get('password')});if(error)return toast(error.message,'err');toast('Password updated');location.hash='#app/dashboard';}
    else if(f.id==='expForm'){const fd=new FormData(f);if(DEMO_MODE){const exp={id:'e'+Date.now(),user_id:'demo',amount:+fd.get('amount'),category:fd.get('category'),merchant:fd.get('merchant'),spent_at:fd.get('date')||todayISO()};DEMO_EXPENSES.unshift(exp);toast('Expense added (demo)');render();}else{await sb.from('expenses').insert({user_id:SESSION.user.id,amount:+fd.get('amount'),category:fd.get('category'),merchant:fd.get('merchant'),spent_at:fd.get('date')||todayISO()});toast('Expense added');render();}}
    else if(f.id==='profForm'){const fd=new FormData(f);if(DEMO_MODE){Object.assign(DEMO_ME,{first_name:fd.get('first_name'),last_name:fd.get('last_name'),username:fd.get('username'),country:fd.get('country'),monthly_income:+fd.get('monthly_income')||0,currency:fd.get('currency')});toast('Profile saved (demo)');render();}else{await sb.from('profiles').update({first_name:fd.get('first_name'),last_name:fd.get('last_name'),username:fd.get('username'),country:fd.get('country'),monthly_income:+fd.get('monthly_income')||0,currency:fd.get('currency')}).eq('id',SESSION.user.id);await loadProfile();toast('Profile saved');render();}}
    else if(f.id==='pwForm'){if(DEMO_MODE){toast('Password change is not available in demo mode','err');return;}const fd=new FormData(f);if(!fd.get('password'))return;if(fd.get('password')!==fd.get('confirm'))return toast('Passwords do not match','err');const {error}=await sb.auth.updateUser({password:fd.get('password')});if(error)return toast(error.message,'err');toast('Password updated');f.reset();}
    else if(f.id==='chatForm'){const inp=$('#chatInput');const v=inp.value.trim();if(v){inp.value='';sendChat(v);}}
    else if(f.id==='svForm'){
      if(DEMO_MODE){toast('Student verification is not available in demo mode','err');return;}
      const fd=new FormData(f);const file=fd.get('document');let docUrl=null;
      if(file&&file.size){const path=SESSION.user.id+'/'+Date.now()+'_'+file.name.replace(/[^\w.]/g,'_');const {error:upErr}=await sb.storage.from('documents').upload(path,file);if(!upErr)docUrl=path;}
      const {error}=await sb.from('student_verifications').insert({user_id:SESSION.user.id,university:fd.get('university'),student_email:fd.get('student_email'),document_url:docUrl});
      if(error)return toast(error.message,'err');toast('Submitted! An admin will review it.');render();
    }
  }catch(err){toast(err.message||'Error','err');}
});

// mission modal
function openMissionModal(goalId){
  const g=GOALS.find(x=>x.id===goalId);if(!g){toast('Goal not found','err');return;}
  const m=document.getElementById('modal');
  m.innerHTML=`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" id="mmBack"><div class="w-full max-w-md glass-strong rounded-2xl p-6 anim"><div class="flex items-center justify-between"><h2 class="text-xl font-bold">New mission</h2><button id="mmX" class="text-slate-400">✕</button></div>
    <p class="mt-1 text-sm" style="color:var(--muted)">Drives goal: <b>${esc(g.name)}</b></p>
    <div class="mt-4 space-y-3">
      <div><label class="label">Mission</label><input id="mmTitle" class="input" placeholder="e.g. Workout 3× per week"></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="label">Cadence</label><select id="mmCad" class="input"><option value="daily">Daily</option><option value="weekly">Weekly</option></select></div>
        <div><label class="label">Target / week</label><input id="mmTarget" type="number" class="input" value="5" min="1" max="7"></div>
      </div>
      <div><label class="label">Difficulty</label><select id="mmDiff" class="input"><option value="easy">Easy · +5 XP</option><option value="medium" selected>Medium · +10 XP</option><option value="hard">Hard · +20 XP</option></select></div>
      <p id="mmErr" class="text-sm text-red-300"></p>
      <button id="mmSave" class="btn btn-primary w-full">Add mission</button>
    </div></div></div>`;
  const close=()=>m.innerHTML='';
  $('#mmBack').addEventListener('click',e=>{if(e.target.id==='mmBack')close();});
  $('#mmX').addEventListener('click',close);
  $('#mmSave').addEventListener('click',()=>{
    const title=$('#mmTitle').value.trim();if(!title){$('#mmErr').textContent='Enter a mission name.';return;}
    const cad=$('#mmCad').value;
    g.missions=g.missions||[];
    g.missions.push({id:'m'+Date.now(),goal_id:goalId,title,cadence:cad,perWeek:+$('#mmTarget').value||(cad==='daily'?5:1),difficulty:$('#mmDiff').value,status:'active'});
    close();toast('Mission added 🎯');render();
  });
}

// challenge proof modal
function openProofModal(key){
  const def=CHALLENGES.find(x=>x.key===key);if(!def){toast('Challenge not found','err');return;}
  const m=document.getElementById('modal');
  m.innerHTML=`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" id="pfBack"><div class="w-full max-w-md glass-strong rounded-2xl p-6 anim"><div class="flex items-center justify-between"><h2 class="text-xl font-bold">${def.emoji} Log proof</h2><button id="pfX" class="text-slate-400">✕</button></div>
    <p class="mt-1 text-sm" style="color:var(--muted)">${def.title} — your evidence is reviewed before XP is granted.</p>
    <div class="mt-4 space-y-3">
      <div><label class="label">What did you do today?</label><input id="pfNote" class="input" placeholder="e.g. Skipped my usual coffee"></div>
      <div class="grid grid-cols-2 gap-3"><div><label class="label">Amount saved (€)</label><input id="pfSaved" type="number" class="input" placeholder="5"></div><div><label class="label">Expense reduced</label><input id="pfReduced" class="input" placeholder="Coffee"></div></div>
      <div><label class="label">Short explanation</label><textarea id="pfExpl" class="input" rows="2" placeholder="I saved €5 today by not buying coffee."></textarea></div>
      <p id="pfErr" class="text-sm text-red-300"></p>
      <button id="pfSave" class="btn btn-primary w-full">Submit proof</button>
    </div></div></div>`;
  const close=()=>m.innerHTML='';
  $('#pfBack').addEventListener('click',e=>{if(e.target.id==='pfBack')close();});
  $('#pfX').addEventListener('click',close);
  $('#pfSave').addEventListener('click',()=>{
    const note=$('#pfNote').value.trim()||$('#pfExpl').value.trim();
    if(!note){$('#pfErr').textContent='Add a note or explanation as proof.';return;}
    const arr=chalState(),c=arr.find(x=>x.key===key);if(!c){close();return;}
    const today=todayISO();
    if((c.proofs||[]).some(p=>p.day===today)){$('#pfErr').textContent='You already logged proof today.';return;}
    c.proofs=c.proofs||[];c.proofs.push({day:today,note,saved:+$('#pfSaved').value||0,reduced:$('#pfReduced').value.trim(),explanation:$('#pfExpl').value.trim()});
    setChalState(arr);close();toast('Proof logged ✅');render();
  });
}

// goal modal
function openGoalModal(){
  const EMO=['🎯','📱','💻','🚗','✈️','🏠','🛡️','🎓','💍','🎮','🏝️','💰'];let emo='🎯',file=null;
  const m=document.getElementById('modal');
  m.innerHTML=`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" id="gmBack"><div class="w-full max-w-md glass-strong rounded-2xl p-6 anim" id="gmCard"><div class="flex items-center justify-between"><h2 class="text-xl font-bold">New goal</h2><button id="gmX" class="text-slate-400">✕</button></div><div class="mt-5 space-y-4"><div><span class="label">Icon</span><div id="gmEmo" class="flex flex-wrap gap-2">${EMO.map((x,i)=>`<button data-e="${x}" class="flex h-9 w-9 items-center justify-center rounded-lg text-lg ${i===0?'ring-1 ring-accent-purple bg-accent-purple/20':'bg-white/5'}">${x}</button>`).join('')}</div></div><div><label class="label">Goal name</label><input id="gmName" class="input" placeholder="e.g. New MacBook"></div><div class="grid grid-cols-2 gap-3"><div><label class="label">Target (€)</label><input id="gmTarget" type="number" class="input" placeholder="1200"></div><div><label class="label">Monthly (€)</label><input id="gmMonthly" type="number" class="input" placeholder="150"></div></div><div><label class="label">Goal image (optional)</label><input id="gmImg" type="file" accept="image/*" class="input"></div><p id="gmErr" class="text-sm text-red-300"></p><button id="gmSave" class="btn btn-primary w-full">Create goal</button></div></div></div>`;
  const close=()=>m.innerHTML='';
  $('#gmBack').addEventListener('click',e=>{if(e.target.id==='gmBack')close();});
  $('#gmX').addEventListener('click',close);
  $('#gmImg').addEventListener('change',e=>file=e.target.files[0]);
  $('#gmEmo').addEventListener('click',e=>{const b=e.target.closest('[data-e]');if(!b)return;emo=b.getAttribute('data-e');m.querySelectorAll('#gmEmo button').forEach(x=>x.className='flex h-9 w-9 items-center justify-center rounded-lg text-lg bg-white/5');b.className='flex h-9 w-9 items-center justify-center rounded-lg text-lg ring-1 ring-accent-purple bg-accent-purple/20';});
  $('#gmSave').addEventListener('click',async()=>{
    const name=$('#gmName').value.trim(),target=+$('#gmTarget').value,monthly=+$('#gmMonthly').value||0;
    const limit=PLANS[ME.plan].goalLimit,total=GOALS.length;
    if(!name||!target){$('#gmErr').textContent='Enter a name and target.';return;}
    if(limit!==-1&&total>=limit){$('#gmErr').innerHTML='Free plan allows '+limit+' goals (archived included). <a href="#app/plans" class="text-accent-purple underline">Upgrade</a> for unlimited.';return;}
    $('#gmSave').disabled=true;$('#gmSave').textContent='Saving…';
    let imgUrl=null;
    if(DEMO_MODE){
      const newGoal={id:'g'+Date.now(),user_id:'demo',name,emoji:emo,target_amount:target,saved_amount:0,monthly_contribution:monthly,completed:false,status:'active',created_at:new Date().toISOString(),image_url:null,missions:[]};
      DEMO_GOALS.unshift(newGoal);close();toast('Goal created');render();return;
    }
    if(file){const path=SESSION.user.id+'/'+Date.now()+'_'+file.name.replace(/[^\w.]/g,'_');const {error:upErr}=await sb.storage.from('goal-images').upload(path,file);if(!upErr){imgUrl=sb.storage.from('goal-images').getPublicUrl(path).data.publicUrl;}}
    const {error}=await sb.from('goals').insert({user_id:SESSION.user.id,name,emoji:emo,target_amount:target,monthly_contribution:monthly,image_url:imgUrl});
    if(error){$('#gmErr').textContent=error.message;$('#gmSave').disabled=false;$('#gmSave').textContent='Create goal';return;}
    close();toast('Goal created');render();
  });
}

// ============================================================
// INIT
// ============================================================
sb.auth.onAuthStateChange(async (event,session)=>{
  if(DEMO_MODE) return; // demo mode ignores all real auth events
  SESSION=session; ME=null;
  if(event==='PASSWORD_RECOVERY'){location.hash='#reset';return;}
  if(event==='SIGNED_IN'){ await loadProfile(); location.hash = ME && ME.onboarded ? '#app/dashboard' : '#quiz'; return; }
  if(event==='SIGNED_OUT'){ render(); return; }
  render();
});
window.addEventListener('hashchange',render);
loadTheme();
(async()=>{
  if(DEMO_MODE){
    // Wipe any real Supabase session from storage so the SDK stops making auth/DB calls
    const key='sb-jcskgasaocfueneyahrk-auth-token';
    localStorage.removeItem(key); sessionStorage.removeItem(key);
    localStorage.removeItem(REMEMBER);
    SESSION=null; ME=DEMO_ME;
    // restore saved avatar; seed a streak so badges feel alive in the demo
    ME.avatar_url=localStorage.getItem('goalify_avatar_demo')||null;
    seedDemoMissions();
    if(!localStorage.getItem('goalify_bg'))localStorage.setItem('goalify_bg','aurora');
    applyTheme(ME.theme||'dark',ME.theme_color||'blue');applyBg(localStorage.getItem('goalify_bg'));
    render(); return;
  }
  const {data}=await sb.auth.getSession(); SESSION=data.session; if(SESSION) await loadProfile(); render();
})();
