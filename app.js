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

// -------------------- constants --------------------
const PLANS = {
  free:{name:'Free',price:0,goalLimit:3,ai:5},
  pro:{name:'Pro',price:3,goalLimit:-1,ai:50,highlight:true},
  premium:{name:'Premium',price:5,goalLimit:-1,ai:-1},
  business:{name:'Business',price:10,goalLimit:-1,ai:-1},
};
const PLAN_ORDER=['free','pro','premium','business'];
const PLAN_FEATURES={
  free:['Expense tracking','Basic analytics','Up to 3 goals','5 AI messages/day','Money personality'],
  pro:['Unlimited goals','AI Assistant Lite','Spending predictions','Budget suggestions','Extra charts','50 AI messages/day'],
  premium:['Everything in Pro','Advanced AI Coach','Future forecasting','Premium reports','AI insights','Unlimited AI'],
  business:['Revenue tracking','Expense tracking','Profit calculations','Team management','Business analytics','Tax reports'],
};

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
  {key:'save100',title:'Save €100 Challenge',desc:'Put aside €100 in two weeks.',emoji:'💰',xp:100},
  {key:'nodelivery',title:'No Delivery Week',desc:'No food delivery for 7 days.',emoji:'🍳',xp:60},
  {key:'nocoffee',title:'No Coffee Week',desc:'Skip the café for a week.',emoji:'☕',xp:50},
  {key:'noimpulse',title:'No Impulse-Buy',desc:'No non-essentials for 10 days.',emoji:'🛑',xp:80},
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
  if(!SESSION) return null;
  let { data } = await sb.from('profiles').select('*').eq('id',SESSION.user.id).maybeSingle();
  if(!data){ // safety: create if trigger didn't
    await sb.from('profiles').insert({id:SESSION.user.id,email:SESSION.user.email});
    ({data}=await sb.from('profiles').select('*').eq('id',SESSION.user.id).maybeSingle());
  }
  ME=data; return data;
}
const getGoals=async()=>(await sb.from('goals').select('*').order('created_at',{ascending:false})).data||[];
const getExpenses=async()=>(await sb.from('expenses').select('*').order('spent_at',{ascending:false}).limit(1000)).data||[];

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

// -------------------- icons --------------------
const LOGO='<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" stroke-linejoin="round"/><path d="M12 7v5l3.5 2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const brand=(href='#home')=>`<a href="${href}" class="flex items-center gap-2"><span class="flex h-9 w-9 items-center justify-center rounded-xl text-white" style="background:linear-gradient(135deg,#4f46e5,#8b5cf6)">${LOGO}</span><span class="text-xl font-extrabold">Goal<span class="gtext">ify</span></span></a>`;

// ============================================================
// VIEWS — LANDING
// ============================================================
function landing(){
  return `<header class="fixed inset-x-0 top-0 z-40 px-4 py-4"><div class="mx-auto max-w-7xl"><div class="glass-strong flex items-center justify-between rounded-2xl px-4 py-3">${brand()}
    <nav class="hidden gap-8 md:flex text-sm text-slate-300"><a href="#home" data-scroll="feat" class="hover:text-white">Features</a><a href="#home" data-scroll="pricing" class="hover:text-white">Pricing</a><a href="#home" data-scroll="faq" class="hover:text-white">FAQ</a></nav>
    <div class="flex items-center gap-3">${SESSION?`<a href="#app/dashboard" class="btn btn-primary !py-2 !px-4 text-sm">Open app</a>`:`<a href="#login" class="text-sm text-slate-300 hover:text-white">Log in</a><a href="#signup" class="btn btn-primary !py-2 !px-4 text-sm">Get started</a>`}</div>
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
        <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"><a href="#signup" class="btn btn-primary">Start for free →</a><a href="#login" class="btn btn-ghost">Log in</a></div>
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
      <div class="mt-14 grid gap-6 lg:grid-cols-4">${PLAN_ORDER.map(id=>{const p=PLANS[id];return `<div class="relative flex flex-col rounded-2xl p-6 ${p.highlight?'glass-strong':'glass'}" ${p.highlight?'style="box-shadow:0 0 40px -10px rgba(99,102,241,.5)"':''}>${p.highlight?'<span class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-white" style="background:linear-gradient(90deg,#3b82f6,#8b5cf6)">Most popular</span>':''}<h3 class="text-lg font-semibold">${p.name}</h3><div class="mt-2 flex items-baseline gap-1"><span class="text-4xl font-extrabold">€${p.price}</span><span class="text-sm text-slate-400">/mo</span></div><a href="#signup" class="btn ${p.highlight?'btn-primary':'btn-ghost'} mt-5 w-full text-sm">Get started</a><ul class="mt-5 space-y-2 text-sm text-slate-400">${PLAN_FEATURES[id].map(f=>`<li class="flex gap-2"><span class="text-accent-purple">✓</span>${f}</li>`).join('')}</ul></div>`;}).join('')}</div>
    </section>
    <section id="sec-faq" class="py-20 mx-auto max-w-3xl px-4">
      <div class="text-center"><p class="text-sm font-semibold uppercase tracking-widest gtext">FAQ</p><h2 class="mt-3 text-4xl font-bold sm:text-5xl">Questions, answered</h2></div>
      <div class="mt-10 space-y-3">${[['Is Goalify really free?','Yes — the Free plan includes expense tracking, analytics, your money personality and up to 3 goals, forever.'],['How do students get Pro free?','Submit your university and student email under Student Verification. Once an admin approves it, your plan upgrades to Pro automatically.'],['Is my data secure?','Auth and data are powered by Supabase with row-level security, so only you (and admins) can access your data.'],['How does the AI work?','A secure server function calls a real AI model using your financial context, with per-plan daily limits.']].map((f,i)=>`<div class="glass rounded-2xl overflow-hidden"><button class="flex w-full items-center justify-between px-6 py-5 text-left font-medium" data-action="faq" data-i="${i}">${f[0]}<span id="fi-${i}">+</span></button><div id="fa-${i}" class="hidden px-6 pb-5 text-sm text-slate-400">${f[1]}</div></div>`).join('')}</div>
    </section>
    <section class="py-20 mx-auto max-w-5xl px-4"><div class="rounded-3xl p-12 sm:p-16 text-center" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)"><h2 class="text-4xl font-bold sm:text-5xl text-white">Turn every euro into progress</h2><a href="#signup" class="btn mt-8 bg-white text-indigo-700 hover:scale-105">Start for free →</a></div></section>
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
    <form id="signupForm" class="mt-6 space-y-3">
      <div class="grid grid-cols-2 gap-3"><div><label class="label">First name</label><input name="first_name" class="input" required></div><div><label class="label">Last name</label><input name="last_name" class="input" required></div></div>
      <div><label class="label">Username</label><input name="username" class="input" required></div>
      <div><label class="label">Email</label><input name="email" type="email" class="input" required></div>
      <div class="grid grid-cols-2 gap-3"><div><label class="label">Password</label><div class="relative"><input id="spw" name="password" type="password" class="input !pr-10" data-action="pwStr" minlength="8" required><button type="button" data-action="togglePw" data-target="spw" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" tabindex="-1">${EYE_ON}</button></div><div class="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden"><div id="pwStrFill" class="h-full rounded-full transition-all duration-300" style="width:0%"></div></div><p id="pwStrText" class="mt-0.5 text-[10px] text-slate-500 h-3"></p></div><div><label class="label">Confirm</label><div class="relative"><input id="spw2" name="confirm" type="password" class="input !pr-10" required><button type="button" data-action="togglePw" data-target="spw2" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" tabindex="-1">${EYE_ON}</button></div></div></div>
      <div class="grid grid-cols-2 gap-3"><div><label class="label">Date of birth</label><input name="dob" type="date" class="input" required></div><div><label class="label">Country</label><input name="country" list="countryList" class="input" placeholder="Search…" required><datalist id="countryList">${COUNTRIES.map(c=>`<option value="${c}">`).join('')}</datalist></div></div>
      <label class="flex items-start gap-2 text-xs text-slate-400"><input type="checkbox" name="tos" class="mt-0.5" required> I accept the <a href="#" class="text-accent-purple">Terms of Service</a> and <a href="#" class="text-accent-purple">Privacy Policy</a></label>
      <label class="flex items-start gap-2 text-xs text-slate-400"><input type="checkbox" name="marketing" class="mt-0.5"> Send me product tips (optional)</label>
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
  // save profile
  await sb.from('profiles').update({
    monthly_income:income, monthly_savings:savings, budget:QA.budget,
    goals_text:[...QA.goals], habits:[...QA.habits], personality:persona,
    student_status:QA.student, employment:QA.employment, onboarded:true, updated_at:new Date().toISOString()
  }).eq('id',SESSION.user.id);
  // seed real expenses for this month from the budget (their own data)
  const rows=QUIZ_CATS.filter(c=>(+QA.budget[c]||0)>0).map(c=>({user_id:SESSION.user.id,amount:+QA.budget[c],category:c,source:'quiz',spent_at:todayISO()}));
  if(rows.length) await sb.from('expenses').insert(rows);
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
const NAV=[['dashboard','Dashboard','📊'],['goals','Goals','🎯'],['analytics','Analytics','📈'],['simulator','Future Simulator','🔮'],['ai','AI Coach','✨'],['challenges','Challenges','🏆'],['student','Student Verify','🎓'],['settings','Settings','⚙️']];
function shell(route,inner){
  const isAdmin=ME?.role==='admin';
  return `<div class="min-h-screen"><aside class="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-[#0b0f1d]/80 backdrop-blur-xl lg:flex">
    <div class="px-5 py-6">${brand('#app/dashboard')}</div>
    <nav class="flex-1 space-y-1 px-3 overflow-y-auto">${NAV.map(n=>`<a href="#app/${n[0]}" class="nav-link ${route===n[0]?'active':''} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${route===n[0]?'text-white':'text-slate-400 hover:text-white hover:bg-white/5'}"><span>${n[2]}</span>${n[1]}</a>`).join('')}
    ${isAdmin?`<a href="#admin" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-amber-300 hover:bg-white/5"><span>🛡️</span>Admin Portal</a>`:''}</nav>
    ${ME?.plan==='free'?`<div class="mx-3 mb-3 rounded-xl p-4" style="background:linear-gradient(135deg,rgba(79,70,229,.2),rgba(124,58,237,.2));border:1px solid rgba(255,255,255,.1)"><p class="text-sm font-semibold">Unlock Pro</p><p class="mt-1 text-xs text-slate-400">Verify student status for free Pro.</p><a href="#app/student" class="btn btn-primary mt-3 w-full !py-2 text-xs">Verify now</a></div>`:''}
    <div class="border-t border-white/10 p-3"><div class="flex items-center gap-3 px-2 py-2"><span class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white" style="background:linear-gradient(135deg,#4f46e5,#8b5cf6)">${ini(ME)}</span><div class="min-w-0"><p class="truncate text-sm font-medium">${esc(ME?.first_name||'You')}</p><p class="text-xs text-slate-400">${PLANS[ME?.plan||'free'].name} plan</p></div></div><button class="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/5 hover:text-white" data-action="logout">Sign out</button></div>
  </aside>
  <div class="lg:pl-64"><div class="flex items-center justify-between border-b border-white/10 px-4 py-3 lg:hidden">${brand('#app/dashboard')}<select onchange="location.hash='#app/'+this.value" class="input !w-auto !py-1.5 text-sm">${NAV.map(n=>`<option value="${n[0]}" ${route===n[0]?'selected':''}>${n[1]}</option>`).join('')}</select></div><main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">${inner}</main></div></div>`;
}
function statCard(label,val,sub,emoji){return `<div class="glass rounded-2xl p-5 anim"><div class="flex items-center justify-between"><span class="text-sm text-slate-400">${label}</span><span>${emoji}</span></div><p class="mt-3 text-2xl font-bold">${val}</p>${sub?`<p class="mt-1 text-xs text-slate-400">${sub}</p>`:''}</div>`;}
function ring(score,label,sub){const r=58,c=2*Math.PI*r,off=c-(score/100)*c,gid='g'+label.replace(/\W/g,'');return `<div class="flex flex-col items-center"><div class="relative" style="width:140px;height:140px"><svg width="140" height="140" style="transform:rotate(-90deg)"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><circle cx="70" cy="70" r="${r}" stroke="rgba(255,255,255,.08)" stroke-width="8" fill="none"/><circle cx="70" cy="70" r="${r}" stroke="url(#${gid})" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" style="transition:stroke-dashoffset 1s ease"/></svg><div class="absolute inset-0 flex flex-col items-center justify-center"><span class="text-3xl font-extrabold">${score}</span><span class="text-xs text-slate-400">${sub||''}</span></div></div><p class="mt-2 text-sm font-medium text-slate-400">${label}</p></div>`;}

let GOALS=[],EXPENSES=[],AIUSED=0;

function dashboardView(){
  const plan=ME.plan,s=snapshot(ME,EXPENSES),g=goalifyScore(s,GOALS,ME.xp),h=healthScore(s);
  const persona=ME.personality?PERSONAS[ME.personality]:null;
  const active=GOALS.filter(x=>!x.completed).slice(0,3);
  const has=(p)=>PLAN_ORDER.indexOf(plan)>=PLAN_ORDER.indexOf(p);
  let blocks=`<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    ${statCard('Monthly income',fmt(s.income),'','💶')}${statCard('Monthly spending',fmt(s.spending),'','📉')}${statCard('Leftover',fmt(s.leftover),s.leftover>=0?'On track':'Over budget','🐖')}
    ${statCard('Savings rate',s.savingsRate+'%','','📊')}${statCard('Active goals',GOALS.filter(x=>!x.completed).length,'','🎯')}${statCard('Level',levelFromXp(ME.xp).level,(ME.xp||0)+' XP','⭐')}
  </div>
  <div class="grid gap-6 lg:grid-cols-3"><div class="glass rounded-2xl p-6 flex items-center justify-center">${ring(g,'Goalify Score','/100')}</div><div class="glass rounded-2xl p-6 flex items-center justify-center">${ring(h.v,'Money Health',h.r)}</div>
    <div class="glass-strong rounded-2xl p-6 flex flex-col"><div class="mb-3 flex items-center gap-2 font-semibold">✨ AI Insights ${!has('premium')?'<span class="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-400">Premium</span>':''}</div>${has('premium')?`<ul class="flex-1 space-y-3 text-sm text-slate-400" id="aiInsights"><li>Generating…</li></ul>`:`<p class="flex-1 text-sm text-slate-400">Upgrade to Premium for AI-generated insights on your spending and goals.</p>`}<a href="#app/ai" class="mt-4 text-sm font-medium text-accent-purple hover:underline">Open AI Coach →</a></div></div>
  <div class="glass rounded-2xl p-6"><div class="mb-4 flex items-center justify-between"><h3 class="font-semibold">Spending</h3><div class="flex gap-1 rounded-xl bg-white/5 p-1 text-xs">${['daily','weekly','monthly','yearly','fiveyear'].map((t,i)=>`<button data-action="tf" data-tf="${t}" class="rounded-lg px-3 py-1.5 ${i===2?'text-white':'text-slate-400'}" style="${i===2?'background:linear-gradient(90deg,#3b82f6,#8b5cf6)':''}">${t==='fiveyear'?'5-Year':t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div></div><canvas id="spendChart" height="100"></canvas></div>
  <div class="grid gap-6 lg:grid-cols-2"><div class="glass rounded-2xl p-6"><h3 class="font-semibold mb-4">Spending by category</h3><canvas id="catChart" height="180"></canvas></div>
    <div class="glass rounded-2xl p-6"><div class="mb-4 flex items-center justify-between"><h3 class="font-semibold">Goal progress</h3><a href="#app/goals" class="text-sm text-accent-purple hover:underline">View all</a></div>${active.length?active.map(gg=>{const p=pct(gg.saved_amount,gg.target_amount);return `<div class="mb-4"><div class="mb-1 flex justify-between text-sm"><span>${gg.emoji||'🎯'} ${esc(gg.name)}</span><span class="text-slate-400">${fmt(gg.saved_amount)} / ${fmt(gg.target_amount)}</span></div><div class="h-2.5 rounded-full bg-white/10 overflow-hidden"><div class="progress-fill h-full rounded-full" style="width:${p}%;background:linear-gradient(90deg,#3b82f6,#8b5cf6)"></div></div></div>`;}).join(''):`<p class="py-8 text-center text-sm text-slate-400">No active goals. <a href="#app/goals" class="text-accent-purple hover:underline">Create one</a>.</p>`}</div></div>`;
  // PRO+ predictions
  if(has('pro')){const proj=s.spending*12;blocks+=`<div class="glass rounded-2xl p-6"><div class="mb-1 flex items-center gap-2 font-semibold">🔮 Predictions <span class="rounded-full bg-accent-purple/20 px-2 py-0.5 text-[10px] text-accent-violet">Pro</span></div><p class="text-sm text-slate-400">At your current pace you'll spend about <b class="text-white">${fmt(proj)}</b> this year and save <b class="text-white">${fmt(Math.max(0,s.leftover*12))}</b>. ${s.savingsRate<20?'Raising your savings rate to 20% would add '+fmt(Math.max(0,(s.income*0.2-s.leftover)*12))+'/yr.':'Great pace — keep it up!'}</p></div>`;}
  // BUSINESS
  if(plan==='business'){const rev=s.income,profit=s.income-s.spending;blocks+=`<div class="grid gap-4 sm:grid-cols-3"><div class="glass rounded-2xl p-5"><p class="text-sm text-slate-400">Revenue</p><p class="mt-2 text-2xl font-bold text-emerald-400">${fmt(rev)}</p></div><div class="glass rounded-2xl p-5"><p class="text-sm text-slate-400">Expenses</p><p class="mt-2 text-2xl font-bold text-orange-400">${fmt(s.spending)}</p></div><div class="glass rounded-2xl p-5"><p class="text-sm text-slate-400">Profit</p><p class="mt-2 text-2xl font-bold gtext">${fmt(profit)}</p></div></div><div class="glass rounded-2xl p-6"><div class="mb-2 font-semibold">🧾 Tax estimate (illustrative)</div><p class="text-sm text-slate-400">Estimated set-aside at 20%: <b class="text-white">${fmt(Math.max(0,profit*0.2))}</b>. Connect your accountant's rate in Settings.</p></div>`;}
  return `<div class="space-y-6"><div class="flex flex-wrap items-end justify-between gap-3"><div><h1 class="text-3xl font-bold">Welcome back${ME.first_name?', '+esc(ME.first_name):''} 👋</h1><p class="mt-1 text-sm text-slate-400">${persona?`You're a ${persona.name} ${persona.emoji} on the ${PLANS[plan].name} plan.`:`${PLANS[plan].name} plan`}</p></div><a href="#app/goals" class="btn btn-primary !py-2.5 text-sm">+ New goal</a></div>${blocks}</div>`;
}

function goalsView(){
  const limit=PLANS[ME.plan].goalLimit, active=GOALS.filter(g=>!g.completed).length, atLimit=limit!==-1&&active>=limit;
  return `<div class="space-y-6"><div class="flex flex-wrap items-end justify-between gap-3"><div><h1 class="text-3xl font-bold">Goals</h1><p class="mt-1 text-sm text-slate-400">${limit===-1?'Unlimited goals.':active+' / '+limit+' goals used (Free plan).'}</p></div><button class="btn btn-primary !py-2.5 text-sm" data-action="newGoal" ${atLimit?'disabled':''}>+ New goal</button></div>
  ${atLimit?`<div class="glass rounded-2xl p-5 flex items-center justify-between gap-4" style="border:1px solid rgba(168,85,247,.3)"><p class="text-sm text-slate-400">🔒 Free plan limit of ${limit} goals reached. Verify student status or upgrade for unlimited.</p><a href="#app/student" class="btn btn-primary !py-2 text-sm shrink-0">Unlock</a></div>`:''}
  ${GOALS.length===0?`<div class="glass rounded-2xl p-16 text-center"><div class="text-5xl">🎯</div><h3 class="mt-4 text-lg font-semibold">No goals yet</h3><p class="mt-1 text-sm text-slate-400">Create your first goal — a phone, a trip, an emergency fund.</p><button class="btn btn-primary mt-5 text-sm" data-action="newGoal">+ Create a goal</button></div>`:
  `<div class="grid gap-5 md:grid-cols-2">${GOALS.map(g=>{const p=pct(g.saved_amount,g.target_amount);return `<div class="glass rounded-2xl overflow-hidden anim">${g.image_url?`<img src="${esc(g.image_url)}" class="h-32 w-full object-cover">`:''}<div class="p-6"><div class="flex items-start justify-between"><div class="flex items-center gap-3"><span class="text-3xl">${g.emoji||'🎯'}</span><div><h3 class="font-semibold">${esc(g.name)}</h3><span class="text-xs ${g.completed?'text-emerald-400':'text-slate-400'}">${g.completed?'✓ Completed':'In progress'}</span></div></div><button data-action="delGoal" data-id="${g.id}" class="text-slate-400 hover:text-red-400">🗑</button></div>
  <div class="mt-4"><div class="mb-1 flex justify-between text-sm"><span class="font-medium">${fmt(g.saved_amount)}</span><span class="text-slate-400">of ${fmt(g.target_amount)}</span></div><div class="h-2.5 rounded-full bg-white/10 overflow-hidden"><div class="progress-fill h-full rounded-full" style="width:${p}%;background:linear-gradient(90deg,#3b82f6,#8b5cf6)"></div></div><p class="mt-1 text-right text-xs text-slate-400">${p}%</p></div>
  ${g.completed?'':`<div class="mt-4 flex gap-2"><input type="number" class="input" placeholder="Amount" id="c-${g.id}"><button class="btn btn-primary !px-4 !py-2 text-sm shrink-0" data-action="contrib" data-id="${g.id}">Add</button></div>`}</div></div>`;}).join('')}</div>`}</div>`;
}

function analyticsView(){
  return `<div class="space-y-6"><div><h1 class="text-3xl font-bold">Analytics</h1><p class="mt-1 text-sm text-slate-400">Track expenses and explore spending across every timeframe.</p></div>
  <div class="glass rounded-2xl p-6"><div class="mb-4 flex items-center justify-between"><h3 class="font-semibold">Spending</h3><div class="flex gap-1 rounded-xl bg-white/5 p-1 text-xs">${['daily','weekly','monthly','yearly','fiveyear'].map((t,i)=>`<button data-action="tf" data-tf="${t}" class="rounded-lg px-3 py-1.5 ${i===2?'text-white':'text-slate-400'}" style="${i===2?'background:linear-gradient(90deg,#3b82f6,#8b5cf6)':''}">${t==='fiveyear'?'5-Year':t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div></div><canvas id="spendChart" height="90"></canvas></div>
  <div class="grid gap-6 lg:grid-cols-3"><div class="glass rounded-2xl p-6 h-fit"><h3 class="font-semibold">Add expense</h3><form id="expForm" class="mt-4 space-y-3"><div><label class="label">Amount (€)</label><input name="amount" type="number" step="0.01" class="input" required></div><div><label class="label">Category</label><select name="category" class="input">${Object.keys(CATS).map(c=>`<option value="${c}">${CATS[c].e} ${CATS[c].l}</option>`).join('')}</select></div><div><label class="label">Merchant</label><input name="merchant" class="input" placeholder="optional"></div><div><label class="label">Date</label><input name="date" type="date" class="input" value="${todayISO()}"></div><button class="btn btn-primary w-full text-sm">+ Add expense</button></form></div>
  <div class="glass rounded-2xl p-6 lg:col-span-2"><h3 class="font-semibold">Recent transactions</h3>${EXPENSES.length===0?`<p class="py-12 text-center text-sm text-slate-400">No transactions yet.</p>`:`<div class="mt-4 divide-y divide-white/5 max-h-[60vh] overflow-y-auto">${EXPENSES.slice(0,50).map(e=>{const m=CATS[e.category]||CATS.other,inc=e.category==='income';return `<div class="flex items-center gap-3 py-3"><span class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-lg">${m.e}</span><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">${esc(e.merchant||m.l)}</p><p class="text-xs text-slate-400">${m.l} · ${e.spent_at}</p></div><span class="text-sm font-semibold ${inc?'text-emerald-400':''}">${inc?'+':'-'}${fmt(e.amount)}</span><button data-action="delExp" data-id="${e.id}" class="text-slate-400 hover:text-red-400">🗑</button></div>`;}).join('')}</div>`}</div></div></div>`;
}

function simulatorView(){
  return `<div class="space-y-6"><div><h1 class="text-3xl font-bold">Future Simulator</h1><p class="mt-1 text-sm text-slate-400">Model your savings, goal dates and growth.</p></div>
  <div class="grid gap-6 lg:grid-cols-3"><div class="glass rounded-2xl p-6 h-fit space-y-5"><h3 class="font-semibold">Your inputs</h3>
  ${[['simIncome','Monthly income',Math.round(ME.monthly_income)||2000,0,10000,50],['simExp','Monthly expenses',Math.round(snapshot(ME,EXPENSES).spending)||1400,0,10000,50],['simGoal','Savings goal',10000,500,100000,500]].map(x=>`<div><div class="mb-1 flex justify-between text-sm"><span class="text-slate-400">${x[1]}</span><span id="${x[0]}V" class="font-medium"></span></div><input id="${x[0]}" type="range" min="${x[3]}" max="${x[4]}" step="${x[5]}" value="${x[2]}" class="w-full" style="accent-color:#8b5cf6" data-action="sim"></div>`).join('')}
  <div><div class="mb-1 flex justify-between text-sm"><span class="text-slate-400">Annual growth</span><span id="simRateV" class="font-medium">2%</span></div><input id="simRate" type="range" min="0" max="10" step="0.5" value="2" class="w-full" style="accent-color:#8b5cf6" data-action="sim"></div></div>
  <div class="lg:col-span-2 space-y-6"><div class="grid gap-4 sm:grid-cols-3"><div class="glass rounded-2xl p-5"><p class="text-sm text-slate-400">Monthly savings</p><p id="simSave" class="mt-2 text-2xl font-bold text-emerald-400"></p></div><div class="glass rounded-2xl p-5"><p class="text-sm text-slate-400">Goal reached in</p><p id="simMonths" class="mt-2 text-2xl font-bold"></p></div><div class="glass rounded-2xl p-5"><p class="text-sm text-slate-400">In 5 years</p><p id="sim5y" class="mt-2 text-2xl font-bold gtext"></p></div></div><div class="glass rounded-2xl p-6"><h3 class="font-semibold mb-4">5-year projection</h3><canvas id="simChart" height="110"></canvas></div></div></div></div>`;
}

function aiView(){
  const plan=ME.plan,limit=PLANS[plan].ai;
  return `<div class="space-y-6"><div class="flex flex-wrap items-end justify-between gap-3"><div><h1 class="text-3xl font-bold">AI Coach</h1><p class="mt-1 text-sm text-slate-400">Real AI financial coaching.</p></div><div class="text-sm text-slate-400">Today: <span id="aiCount">${AIUSED}</span>${limit===-1?' · Unlimited':' / '+limit+' messages'}</div></div>
  <div class="glass-strong rounded-2xl p-6 flex flex-col" style="height:64vh"><div class="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 font-semibold">✨ ${plan==='free'?'AI Assistant':plan==='pro'?'AI Assistant Lite':'AI Financial Coach'}</div>
  <div id="chatLog" class="flex-1 space-y-4 overflow-y-auto pr-1"></div>
  <div class="mt-3 flex flex-wrap gap-2">${['How can I save more?','Where am I overspending?','Build me a savings plan','Roast my spending'].map(s=>`<button class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:text-white" data-action="ask" data-q="${esc(s)}">${s}</button>`).join('')}</div>
  <form id="chatForm" class="mt-3 flex items-center gap-2 glass rounded-xl px-3 py-2"><input id="chatInput" class="flex-1 bg-transparent text-sm outline-none" placeholder="Ask your AI coach…"><button class="btn btn-primary !p-2">→</button></form></div></div>`;
}

function challengesView(){
  const {level,inLvl}=levelFromXp(ME.xp);
  const activeKeys=JSON.parse(localStorage.getItem('goalify_chal_'+SESSION.user.id)||'[]');
  return `<div class="space-y-6"><div><h1 class="text-3xl font-bold">Challenges</h1><p class="mt-1 text-sm text-slate-400">Build habits, earn real XP, level up.</p></div>
  <div class="glass-strong rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4"><div class="flex items-center gap-4"><span class="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-extrabold text-white" style="background:linear-gradient(135deg,#4f46e5,#8b5cf6)">${level}</span><div><p class="font-semibold">Level ${level}</p><p class="text-sm text-slate-400">${ME.xp||0} XP total</p></div></div><div class="w-full sm:w-64"><div class="mb-1 flex justify-between text-xs text-slate-400"><span>${inLvl} XP</span><span>100 XP</span></div><div class="h-2.5 rounded-full bg-white/10 overflow-hidden"><div class="progress-fill h-full rounded-full" style="width:${inLvl}%;background:linear-gradient(90deg,#3b82f6,#8b5cf6)"></div></div></div></div>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">${CHALLENGES.map(t=>{const joined=activeKeys.includes(t.key);return `<div class="glass rounded-2xl p-6 flex flex-col"><div class="text-3xl">${t.emoji}</div><h3 class="mt-3 font-semibold">${t.title}</h3><p class="mt-1 flex-1 text-sm text-slate-400">${t.desc}</p><div class="mt-3 text-xs text-accent-violet">+${t.xp} XP</div>${joined?`<button class="btn btn-primary mt-3 w-full !py-2 text-sm" data-action="doneChal" data-key="${t.key}" data-xp="${t.xp}">✓ Complete (+${t.xp} XP)</button>`:`<button class="btn btn-ghost mt-3 w-full !py-2 text-sm" data-action="startChal" data-key="${t.key}">Start</button>`}</div>`;}).join('')}</div></div>`;
}

function studentView(){
  return `<div class="space-y-6 max-w-2xl"><div><h1 class="text-3xl font-bold">Student Verification</h1><p class="mt-1 text-sm text-slate-400">Verify your student status to unlock Pro for free.</p></div>
  ${ME.plan==='pro'&&ME.student_status&&ME.student_status!=='no'?'':''}
  <div id="svStatus"></div>
  <div class="glass rounded-2xl p-6"><form id="svForm" class="space-y-4"><div><label class="label">University / Institution</label><input name="university" class="input" required></div><div><label class="label">Student email</label><input name="student_email" type="email" class="input" placeholder="you@university.edu" required></div><div><label class="label">Student document (optional)</label><input name="document" type="file" accept="image/*,application/pdf" class="input"></div><button class="btn btn-primary text-sm">Submit for verification</button></form></div>
  <p class="text-xs text-slate-500">An admin reviews requests. On approval your plan upgrades to Pro automatically.</p></div>`;
}

function settingsView(){
  const p=ME;
  return `<div class="space-y-6"><div><h1 class="text-3xl font-bold">Settings</h1><p class="mt-1 text-sm text-slate-400">Manage your account and preferences.</p></div>
  <div class="glass rounded-2xl p-6"><h2 class="text-xl font-bold">Profile</h2><form id="profForm" class="mt-4 grid gap-4 sm:grid-cols-2"><div><label class="label">First name</label><input name="first_name" class="input" value="${esc(p.first_name||'')}"></div><div><label class="label">Last name</label><input name="last_name" class="input" value="${esc(p.last_name||'')}"></div><div><label class="label">Username</label><input name="username" class="input" value="${esc(p.username||'')}"></div><div><label class="label">Country</label><input name="country" list="countryList2" class="input" value="${esc(p.country||'')}"><datalist id="countryList2">${COUNTRIES.map(c=>`<option value="${c}">`).join('')}</datalist></div><div><label class="label">Monthly income (€)</label><input name="monthly_income" type="number" class="input" value="${p.monthly_income||0}"></div><div><label class="label">Currency</label><select name="currency" class="input">${['EUR','USD','GBP'].map(c=>`<option ${p.currency===c?'selected':''}>${c}</option>`).join('')}</select></div><div class="sm:col-span-2"><button class="btn btn-primary text-sm">Save profile</button></div></form></div>
  <div class="glass rounded-2xl p-6"><h2 class="text-xl font-bold">Security · Password</h2><form id="pwForm" class="mt-4 grid gap-4 sm:grid-cols-2"><div><label class="label">New password</label><input name="password" type="password" class="input" minlength="8"></div><div><label class="label">Confirm</label><input name="confirm" type="password" class="input"></div><div class="sm:col-span-2"><button class="btn btn-primary text-sm">Update password</button></div></form></div>
  <div class="glass rounded-2xl p-6"><h2 class="text-xl font-bold">Notifications</h2><div class="mt-4 space-y-3">${[['weekly','Weekly AI reports'],['alerts','Budget alerts'],['goals','Goal updates'],['news','Product news']].map(n=>`<label class="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm"><span>${n[1]}</span><input type="checkbox" data-notif="${n[0]}" ${p.notification_prefs?.[n[0]]?'checked':''}></label>`).join('')}<button class="btn btn-primary text-sm" data-action="saveNotif">Save preferences</button></div></div>
  <div class="grid gap-6 sm:grid-cols-2"><div class="glass rounded-2xl p-6"><h2 class="text-xl font-bold">Subscription</h2><p class="mt-1 text-sm text-slate-400">Current: <b class="text-white">${PLANS[p.plan].name}</b></p>${p.plan==='free'?`<a href="#app/student" class="btn btn-primary mt-4 text-sm">Unlock Pro (students)</a>`:`<p class="mt-3 text-sm text-emerald-400">You have ${PLANS[p.plan].name} access.</p>`}</div>
  <div class="glass rounded-2xl p-6"><h2 class="text-xl font-bold">Language & Theme</h2><div class="mt-4 space-y-3"><select class="input" data-action="lang"><option value="en">English</option><option value="de">Deutsch</option><option value="es">Español</option><option value="fr">Français</option><option value="sq">Shqip</option></select><p class="text-sm text-slate-400">Theme: Dark (premium default).</p></div></div></div>
  <div class="glass rounded-2xl p-6"><h2 class="text-xl font-bold">Privacy & Data</h2><div class="mt-4 flex flex-wrap gap-2"><button class="btn btn-ghost text-sm" data-action="export">⬇ Export my data</button><button class="btn btn-ghost text-sm" data-action="connected">🔗 Connected accounts</button><a href="mailto:support@goalify.app" class="btn btn-ghost text-sm">🛟 Support Center</a></div></div>
  <div class="glass rounded-2xl p-6" style="border:1px solid rgba(239,68,68,.3)"><h2 class="text-xl font-bold text-red-300">Delete account</h2><p class="mt-1 text-sm text-slate-400">Permanently delete your data. This cannot be undone.</p><button class="btn mt-4 text-sm" style="background:rgba(239,68,68,.9);color:#fff" data-action="delAcct">Delete my data</button></div></div>`;
}

// ============================================================
// ADMIN
// ============================================================
async function adminView(){
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
function series(tf){const spend=EXPENSES.filter(isSpend),now=new Date(),out=[];const sum=(a,b)=>spend.filter(e=>{const d=new Date(e.spent_at);return d>=a&&d<=b;}).reduce((s,e)=>s+Number(e.amount),0);
  if(tf==='daily'){for(let i=13;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);const k=d.toISOString().slice(0,10);out.push([d.toLocaleDateString('en-IE',{day:'numeric',month:'short'}),spend.filter(e=>e.spent_at===k).reduce((s,e)=>s+Number(e.amount),0)]);}}
  else if(tf==='weekly'){for(let i=11;i>=0;i--){const e=new Date(now);e.setDate(now.getDate()-i*7);const s=new Date(e);s.setDate(e.getDate()-6);out.push(['W'+(12-i),sum(s,e)]);}}
  else if(tf==='monthly'){for(let i=11;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1),e=new Date(now.getFullYear(),now.getMonth()-i+1,0);out.push([d.toLocaleDateString('en-IE',{month:'short'}),sum(d,e)]);}}
  else if(tf==='yearly'){for(let i=4;i>=0;i--){const y=now.getFullYear()-i;out.push([''+y,spend.filter(e=>new Date(e.spent_at).getFullYear()===y).reduce((s,e)=>s+Number(e.amount),0)]);}}
  else{const months=new Set(spend.map(e=>e.spent_at.slice(0,7)));const avg=spend.length?spend.reduce((s,e)=>s+Number(e.amount),0)/Math.max(1,months.size):0;for(let i=0;i<=5;i++)out.push([i===0?'Now':'Y+'+i,Math.round(avg*12*i)]);}
  return out;}
function chartOpts(){return {responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.parsed.y)}}},scales:{x:{grid:{display:false},ticks:{color:'#64748b',font:{size:11}}},y:{grid:{color:'rgba(255,255,255,.06)'},ticks:{color:'#64748b',font:{size:11}}}}};}
function drawSpend(tf){const el=$('#spendChart');if(!el)return;const data=series(tf),ctx=el.getContext('2d');const g=ctx.createLinearGradient(0,0,0,260);g.addColorStop(0,'rgba(139,92,246,.5)');g.addColorStop(1,'rgba(59,130,246,.02)');if(charts.spend)charts.spend.destroy();charts.spend=new Chart(ctx,{type:'line',data:{labels:data.map(d=>d[0]),datasets:[{data:data.map(d=>d[1]),borderColor:'#a855f7',backgroundColor:g,fill:true,tension:.4,pointRadius:0,borderWidth:2.5}]},options:chartOpts()});}
function drawCat(){const el=$('#catChart');if(!el)return;const now=new Date(),m=new Date(now.getFullYear(),now.getMonth(),1),map={};EXPENSES.filter(e=>isSpend(e)&&new Date(e.spent_at)>=m).forEach(e=>map[e.category]=(map[e.category]||0)+Number(e.amount));const keys=Object.keys(map);if(!keys.length){el.insertAdjacentHTML('afterend','<p class="py-8 text-center text-sm text-slate-400">No spending this month yet.</p>');el.style.display='none';return;}charts.cat=new Chart(el,{type:'doughnut',data:{labels:keys.map(k=>(CATS[k]||CATS.other).l),datasets:[{data:keys.map(k=>map[k]),backgroundColor:keys.map(k=>(CATS[k]||CATS.other).c),borderWidth:0}]},options:{plugins:{legend:{position:'right',labels:{color:'#94a3b8',font:{size:11},boxWidth:12}}},cutout:'62%'}});}
function runSim(){const inc=+($('#simIncome')?.value||0),exp=+($('#simExp')?.value||0),goal=+($('#simGoal')?.value||0),rate=+($('#simRate')?.value||0);
  if($('#simIncomeV'))$('#simIncomeV').textContent=fmt(inc);if($('#simExpV'))$('#simExpV').textContent=fmt(exp);if($('#simGoalV'))$('#simGoalV').textContent=fmt(goal);if($('#simRateV'))$('#simRateV').textContent=rate+'%';
  const monthly=Math.max(0,inc-exp),mr=rate/100/12;let bal=0;const pts=[];for(let m=0;m<=60;m++){pts.push(Math.round(bal));bal=bal*(1+mr)+monthly;}
  let months=null,b=0;for(let m=1;m<=600;m++){b=b*(1+mr)+monthly;if(b>=goal){months=m;break;}}
  if($('#simSave'))$('#simSave').textContent=fmt(monthly);if($('#simMonths'))$('#simMonths').textContent=months?months+' mo':'—';if($('#sim5y'))$('#sim5y').textContent=fmt(pts[pts.length-1]);
  const el=$('#simChart');if(el){if(charts.sim)charts.sim.destroy();charts.sim=new Chart(el,{type:'line',data:{labels:pts.map((_,i)=>i%12===0?(i===0?'Now':'Y'+i/12):''),datasets:[{data:pts,borderColor:'#a855f7',backgroundColor:'rgba(139,92,246,.1)',fill:true,tension:.3,pointRadius:0,borderWidth:2.5}]},options:chartOpts()});}}

// ============================================================
// AI
// ============================================================
let chat=[];
function renderChat(){const log=$('#chatLog');if(!log)return;log.innerHTML=chat.map(m=>`<div class="flex ${m.role==='user'?'justify-end':'justify-start'}"><div class="max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${m.role==='user'?'text-white':'glass'}" style="${m.role==='user'?'background:linear-gradient(135deg,#4f46e5,#8b5cf6)':''}">${esc(m.text)}</div></div>`).join('');log.scrollTop=log.scrollHeight;}
async function sendChat(q,mode='coach'){
  chat.push({role:'user',text:q});renderChat();
  chat.push({role:'ai',text:'…'});renderChat();
  try{
    const {data,error}=await sb.functions.invoke('ai',{body:{messages:chat.filter(m=>m.text!=='…').map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text})),mode}});
    chat.pop();
    if(error){ let msg='AI request failed.'; try{msg=(await error.context.json()).error||msg;}catch(e){} chat.push({role:'ai',text:msg}); }
    else { chat.push({role:'ai',text:data.reply}); if(data.used!=null&&$('#aiCount'))$('#aiCount').textContent=data.used; }
  }catch(e){ chat.pop(); chat.push({role:'ai',text:'Network error talking to the AI service.'}); }
  renderChat();
}
async function loadAiInsights(){
  const el=$('#aiInsights');if(!el)return;
  try{const {data,error}=await sb.functions.invoke('ai',{body:{mode:'report',messages:[{role:'user',content:'Give me 3 short insights about my finances as bullet lines.'}]}});
    if(error){el.innerHTML='<li class="text-slate-500">AI not configured yet.</li>';return;}
    el.innerHTML=(data.reply||'').split('\n').filter(x=>x.trim()).slice(0,4).map(t=>`<li class="flex gap-2"><span class="mt-1 h-1.5 w-1.5 rounded-full bg-accent-purple shrink-0"></span>${esc(t.replace(/^[-*•\d.\s]+/,''))}</li>`).join('')||'<li>All good!</li>';
  }catch(e){el.innerHTML='<li class="text-slate-500">AI unavailable.</li>';}
}

// ============================================================
// ROUTER
// ============================================================
async function render(){
  destroyCharts();
  const root=$('#root');
  const hash=location.hash.replace(/^#/,'')||'home';

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
  if(hash==='login'){root.innerHTML=loginView();return;}
  if(hash==='signup'){root.innerHTML=signupView();return;}
  if(hash==='forgot'){root.innerHTML=forgotView();return;}
  if(hash==='reset'){root.innerHTML=resetView();return;}
  if(hash.startsWith('verify')){root.innerHTML=verifyView(decodeURIComponent(hash.split(':')[1]||''));return;}
  // need session below
  if(!SESSION){location.hash='#login';return;}
  if(!ME) await loadProfile();
  if(hash==='admin'){ if(ME?.role!=='admin'){toast('Admins only',' err');location.hash='#app/dashboard';return;} root.innerHTML=await adminView(); window.scrollTo(0,0); return; }
  if(hash==='quiz'){ QSTEP=0; root.innerHTML=quizView(); renderQuiz(); return; }
  if(hash.startsWith('app/')){
    if(!ME.onboarded){location.hash='#quiz';return;}
    const route=hash.split('/')[1]||'dashboard';
    [GOALS,EXPENSES]=await Promise.all([getGoals(),getExpenses()]);
    const {data:u}=await sb.from('ai_usage').select('count').eq('user_id',SESSION.user.id).eq('day',todayISO()).maybeSingle();
    AIUSED=u?.count||0;
    const views={dashboard:dashboardView,goals:goalsView,analytics:analyticsView,simulator:simulatorView,ai:aiView,challenges:challengesView,student:studentView,settings:settingsView};
    root.innerHTML=shell(route,(views[route]||dashboardView)());
    window.scrollTo(0,0);
    if(route==='dashboard'){drawSpend('monthly');drawCat();if(ME.plan==='premium'||ME.plan==='business')loadAiInsights();}
    if(route==='analytics'){drawSpend('monthly');}
    if(route==='simulator'){runSim();}
    if(route==='ai'){chat=[{role:'ai',text:"Hi! I'm your AI coach. Ask me about saving, spending, or a plan."}];renderChat();}
    if(route==='student'){renderSVStatus();}
    return;
  }
  location.hash='#home';
}
async function renderSVStatus(){const el=$('#svStatus');if(!el)return;const {data}=await sb.from('student_verifications').select('*').order('created_at',{ascending:false}).limit(1);const v=data?.[0];if(v){const c=v.status==='approved'?'text-emerald-400':v.status==='rejected'?'text-red-400':'text-amber-300';el.innerHTML=`<div class="glass rounded-2xl p-5"><p class="text-sm">Latest request: <b class="${c}">${v.status}</b> · ${esc(v.university)}</p></div>`;}}

// ============================================================
// EVENTS
// ============================================================
document.addEventListener('click',async(e)=>{
  const sc=e.target.closest('[data-scroll]'); if(sc){const id=sc.getAttribute('data-scroll');const el=document.getElementById('sec-'+id);if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'});}return;}
  const a=e.target.closest('[data-action]'); if(!a)return;
  const act=a.getAttribute('data-action');
  try{
    if(act==='togglePw'){const inp=document.getElementById(a.getAttribute('data-target'));if(inp){const show=inp.type==='password';inp.type=show?'text':'password';a.innerHTML=show?EYE_OFF:EYE_ON;}}
    else if(act==='resendVerify'){const em=a.getAttribute('data-email');if(em){const {error}=await sb.auth.resend({email:em,type:'signup'});if(error)toast(error.message,'err');else toast('Confirmation email resent — check your inbox!');}}
    else if(act==='faq'){const i=a.getAttribute('data-i');$('#fa-'+i).classList.toggle('hidden');$('#fi-'+i).textContent=$('#fa-'+i).classList.contains('hidden')?'+':'−';}
    else if(act==='logout'){await sb.auth.signOut();ME=null;location.hash='#home';}
    else if(act==='newGoal'){openGoalModal();}
    else if(act==='delGoal'){await sb.from('goals').delete().eq('id',a.getAttribute('data-id'));toast('Goal deleted');render();}
    else if(act==='contrib'){const id=a.getAttribute('data-id');const amt=+$('#c-'+id).value;if(amt){const g=GOALS.find(x=>x.id===id);const ns=Math.max(0,Number(g.saved_amount)+amt);const done=ns>=g.target_amount;await sb.from('goals').update({saved_amount:ns,completed:done}).eq('id',id);if(done){await sb.rpc('award_xp',{p_amount:100});toast('🎉 Goal completed! +100 XP');}render();}}
    else if(act==='delExp'){await sb.from('expenses').delete().eq('id',a.getAttribute('data-id'));render();}
    else if(act==='tf'){a.parentElement.querySelectorAll('button').forEach(b=>{b.style.background='';b.classList.remove('text-white');b.classList.add('text-slate-400');});a.style.background='linear-gradient(90deg,#3b82f6,#8b5cf6)';a.classList.add('text-white');a.classList.remove('text-slate-400');drawSpend(a.getAttribute('data-tf'));}
    else if(act==='ask'){const q=a.getAttribute('data-q');sendChat(q,q.toLowerCase().includes('roast')?'roast':'coach');}
    else if(act==='startChal'){const k=a.getAttribute('data-key');const key='goalify_chal_'+SESSION.user.id;const arr=JSON.parse(localStorage.getItem(key)||'[]');if(!arr.includes(k))arr.push(k);localStorage.setItem(key,JSON.stringify(arr));render();}
    else if(act==='doneChal'){const k=a.getAttribute('data-key'),xp=+a.getAttribute('data-xp');const key='goalify_chal_'+SESSION.user.id;const arr=JSON.parse(localStorage.getItem(key)||'[]').filter(x=>x!==k);localStorage.setItem(key,JSON.stringify(arr));await sb.rpc('award_xp',{p_amount:xp});await loadProfile();toast('+'+xp+' XP!');render();}
    else if(act==='export'){const [{data:g},{data:x}]=await Promise.all([sb.from('goals').select('*'),sb.from('expenses').select('*')]);const blob=new Blob([JSON.stringify({profile:ME,goals:g,expenses:x},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const el=document.createElement('a');el.href=u;el.download='goalify-data.json';el.click();URL.revokeObjectURL(u);}
    else if(act==='connected'){toast('Connected accounts coming soon');}
    else if(act==='saveNotif'){const prefs={};document.querySelectorAll('[data-notif]').forEach(i=>prefs[i.getAttribute('data-notif')]=i.checked);await sb.from('profiles').update({notification_prefs:prefs}).eq('id',SESSION.user.id);toast('Preferences saved');}
    else if(act==='lang'){toast('Language preference saved');}
    else if(act==='delAcct'){if(confirm('Delete all your data? This cannot be undone.')){await sb.from('goals').delete().eq('user_id',SESSION.user.id);await sb.from('expenses').delete().eq('user_id',SESSION.user.id);await sb.from('profiles').delete().eq('id',SESSION.user.id);await sb.auth.signOut();toast('Account data deleted');location.hash='#home';}}
    else if(act==='qback'){captureQuizStep();QSTEP=Math.max(0,QSTEP-1);renderQuiz();}
    else if(act==='qnext'){captureQuizStep();QSTEP++;renderQuiz();}
    else if(act==='qradio'){QA[a.getAttribute('data-field')]=a.getAttribute('data-val');QSTEP++;renderQuiz();}
    else if(act==='qchip'){const f=a.getAttribute('data-field'),v=a.getAttribute('data-val');QA[f].has(v)?QA[f].delete(v):QA[f].add(v);renderQuiz();}
    else if(act==='approveSV'){await sb.rpc('approve_student',{p_id:a.getAttribute('data-id')});toast('Approved → Pro');render();}
    else if(act==='rejectSV'){await sb.rpc('reject_student',{p_id:a.getAttribute('data-id')});toast('Rejected');render();}
  }catch(err){toast(err.message||'Something went wrong','err');}
});
document.addEventListener('change',async(e)=>{
  const a=e.target.closest('[data-action="setPlan"]'); if(a){try{await sb.rpc('admin_set_plan',{p_user:a.getAttribute('data-id'),p_plan:a.value});toast('Plan updated');}catch(err){toast(err.message,'err');}}
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
      if(!fd.get('tos'))return toast('Please accept the Terms','err');
      const {score}=pwStrength(fd.get('password'));
      if(score<4)return toast('Password too weak — add uppercase, a number, and a symbol','err');
      const btn=$('#signupBtn');btn.disabled=true;btn.textContent='Creating…';
      const {data,error}=await sb.auth.signUp({email:fd.get('email'),password:fd.get('password'),options:{emailRedirectTo:location.origin+location.pathname,data:{first_name:fd.get('first_name'),last_name:fd.get('last_name'),username:fd.get('username'),dob:fd.get('dob'),country:fd.get('country'),tos_accepted:true,marketing_optin:!!fd.get('marketing')}}});
      btn.disabled=false;btn.textContent='Create account';
      if(error)return toast(error.message,'err');
      if(data.session){location.hash='#quiz';} else {location.hash='#verify:'+encodeURIComponent(fd.get('email'));}
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
    else if(f.id==='expForm'){const fd=new FormData(f);await sb.from('expenses').insert({user_id:SESSION.user.id,amount:+fd.get('amount'),category:fd.get('category'),merchant:fd.get('merchant'),spent_at:fd.get('date')||todayISO()});toast('Expense added');render();}
    else if(f.id==='profForm'){const fd=new FormData(f);await sb.from('profiles').update({first_name:fd.get('first_name'),last_name:fd.get('last_name'),username:fd.get('username'),country:fd.get('country'),monthly_income:+fd.get('monthly_income')||0,currency:fd.get('currency')}).eq('id',SESSION.user.id);await loadProfile();toast('Profile saved');render();}
    else if(f.id==='pwForm'){const fd=new FormData(f);if(!fd.get('password'))return;if(fd.get('password')!==fd.get('confirm'))return toast('Passwords do not match','err');const {error}=await sb.auth.updateUser({password:fd.get('password')});if(error)return toast(error.message,'err');toast('Password updated');f.reset();}
    else if(f.id==='chatForm'){const inp=$('#chatInput');const v=inp.value.trim();if(v){inp.value='';sendChat(v);}}
    else if(f.id==='svForm'){
      const fd=new FormData(f);const file=fd.get('document');let docUrl=null;
      if(file&&file.size){const path=SESSION.user.id+'/'+Date.now()+'_'+file.name.replace(/[^\w.]/g,'_');const {error:upErr}=await sb.storage.from('documents').upload(path,file);if(!upErr)docUrl=path;}
      const {error}=await sb.from('student_verifications').insert({user_id:SESSION.user.id,university:fd.get('university'),student_email:fd.get('student_email'),document_url:docUrl});
      if(error)return toast(error.message,'err');toast('Submitted! An admin will review it.');render();
    }
  }catch(err){toast(err.message||'Error','err');}
});

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
    const limit=PLANS[ME.plan].goalLimit,active=GOALS.filter(g=>!g.completed).length;
    if(!name||!target){$('#gmErr').textContent='Enter a name and target.';return;}
    if(limit!==-1&&active>=limit){$('#gmErr').textContent='Free plan limit reached.';return;}
    $('#gmSave').disabled=true;$('#gmSave').textContent='Saving…';
    let imgUrl=null;
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
  SESSION=session; ME=null;
  if(event==='PASSWORD_RECOVERY'){location.hash='#reset';return;}
  if(event==='SIGNED_IN'){ await loadProfile(); location.hash = ME && ME.onboarded ? '#app/dashboard' : '#quiz'; return; }
  if(event==='SIGNED_OUT'){ render(); return; }
  render();
});
window.addEventListener('hashchange',render);
(async()=>{ const {data}=await sb.auth.getSession(); SESSION=data.session; if(SESSION) await loadProfile(); render(); })();
