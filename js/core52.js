'use strict';
/* v52 · Socle commun « Horizons » : carrières et réputation par secteur, notoriété, trophées,
   lieux v52 (repères + interactions), mini-jeux, tâches quotidiennes et appli « Aurore Horizons ». */
(function(){
if(!window.C51){console.warn('core52 : C51 absent');return;}
const C52=window.C52={};
const K='pa-core52';C51.resetKey(K);
const blank=()=>({xp:{},fame:0,trophies:[],titles:[],days:{},stats:{},seen:{}});
let S=C51.load(K,blank);['xp','days','stats','seen'].forEach(k=>{if(!S[k]||typeof S[k]!=='object'||Array.isArray(S[k]))S[k]={};});
['trophies','titles'].forEach(k=>{if(!Array.isArray(S[k]))S[k]=[];});
const save=()=>C51.store(K,S);C52.save=save;
Object.defineProperty(C52,'state',{get:()=>S});
/* ---------------- carrières ---------------- */
const CAREERS={
  ciel:{n:'Aviation',icon:'✈️',ranks:['Élève pilote','Pilote privé','Pilote professionnel','Commandant de bord','Légende du ciel']},
  mer:{n:'Navigation',icon:'⛵',ranks:['Moussaillon','Plaisancier','Skipper','Capitaine','Amiral de la Lagune']},
  terre:{n:'Agriculture',icon:'🌾',ranks:['Jardinier','Fermier','Exploitant','Agro-entrepreneur','Grand domaine']},
  arene:{n:'Sport & loisirs',icon:'🏅',ranks:['Amateur','Compétiteur','Champion régional','Champion national','Légende sportive']},
  scene:{n:'Arts & médias',icon:'🎤',ranks:['Inconnu','Talent local','Artiste confirmé','Star','Icône des trois cités']},
  affaires:{n:'Affaires',icon:'💼',ranks:['Indépendant','Gérant','Entrepreneur','Magnat','Empire Aurore']},
  ville:{n:'Urbanisme',icon:'🏙️',ranks:['Citoyen','Mécène','Bâtisseur','Visionnaire','Père fondateur']},
  musee:{n:'Collection',icon:'🏛️',ranks:['Curieux','Collectionneur','Connaisseur','Conservateur','Mécène des arts']}
};
const TH=[0,120,350,800,1600];
C52.CAREERS=CAREERS;
C52.rank=id=>{const x=S.xp[id]||0;let r=0;TH.forEach((t,i)=>{if(x>=t)r=i;});return r;};
C52.rankName=id=>CAREERS[id]?CAREERS[id].ranks[C52.rank(id)]:'';
C52.progress=id=>{const x=S.xp[id]||0,r=C52.rank(id);if(r>=TH.length-1)return 1;return (x-TH[r])/(TH[r+1]-TH[r]);};
C52.xp=(id,n)=>{if(!CAREERS[id]||!(n>0))return;const r0=C52.rank(id);S.xp[id]=(S.xp[id]||0)+Math.round(n);const r1=C52.rank(id);save();
  if(r1>r0){C51.rep(2+r1);C51.notify(CAREERS[id].icon+' Promotion · '+CAREERS[id].n,'Tu es maintenant « '+CAREERS[id].ranks[r1]+' ».');C51.journal('Promotion '+CAREERS[id].n+' : '+CAREERS[id].ranks[r1]+'.');if(r1>=4)C52.title(CAREERS[id].ranks[r1]);}};
/* ---------------- notoriété, titres, trophées ---------------- */
C52.fame=n=>{if(n==null)return S.fame;S.fame=clamp((S.fame||0)+n,0,1000);save();return S.fame;};
C52.title=t=>{if(!t||S.titles.includes(t))return;S.titles.push(t);save();C51.notify('🎖️ Nouveau titre','« '+t+' »');};
C52.trophy=(id,name,icon,cat,value)=>{if(S.trophies.some(t=>t.id===id))return false;S.trophies.push({id,name,icon:icon||'🏆',cat:cat||'sport',value:value||500,at:Math.floor(gameMin)});save();C51.notify((icon||'🏆')+' Trophée gagné','« '+name+' » rejoint ta collection.');C51.journal('Trophée : '+name+'.');return true;};
C52.has=id=>S.trophies.some(t=>t.id===id);
C52.stat=(k,n)=>{if(n==null)return S.stats[k]||0;S.stats[k]=(S.stats[k]||0)+n;save();return S.stats[k];};
C52.best=(k,v,lower)=>{const cur=S.stats[k];if(cur==null||(lower?v<cur:v>cur)){S.stats[k]=v;save();return true;}return false;};
/* ---------------- quotidien ---------------- */
const daily=[];C52.daily=(key,fn)=>daily.push({key,fn});
C51.every(6,()=>{const d=C51.day();daily.forEach(({key,fn})=>{const last=S.days[key];if(last==null){S.days[key]=d;save();return;}if(d>last){const n=Math.min(7,d-last);S.days[key]=d;save();try{fn(n,d);}catch(e){console.warn('v52 daily',key,e);}}});});
/* ---------------- lieux v52 ---------------- */
const venues=[];
C52.venue=(id,at,color,label,fn,scale)=>{venues.push({id,at,color,label,scale:scale||1});C51.handle(id,()=>{try{fn(id);}catch(e){console.warn('v52 lieu',id,e);toast('Ce lieu est momentanément indisponible.','warn');}});};
C52.pos=id=>{const v=venues.find(x=>x.id===id);if(!v)return {x:0,z:18};const a=typeof v.at==='function'?v.at():v.at;return C51.anchor(a[0],a[1]||0,a[2]||0,a[3]);};
C52.go=id=>{const v=venues.find(x=>x.id===id);if(!v)return;const p=C52.pos(id);C51.gps(p.x,p.z,v.label.replace(/^\S+\s/,''));};
C52.venues=()=>venues.map(v=>({id:v.id,label:v.label}));
function syncVenues(){venues.forEach(v=>{const lab=typeof v.label==='function'?v.label():v.label;try{C51.mark(v.id,C52.pos(v.id),v.color,lab,v.scale);}catch(e){}});}
C51.onReady(syncVenues);C51.every(7,syncVenues);
/* ---------------- mini-jeux et panneaux ---------------- */
C52.mg=(type,o)=>{if(window.MG29&&MG29.DEF&&MG29.DEF[type]){MG29.play(type,o);return;}const s=.55+Math.random()*.35;if(o&&o.after){const r=o.after(s);if(r)toast(r,'good');}if(o&&o.done)o.done(s);};
C52.panel=(title,text,btns)=>openPanel(title,text,(btns||[]).filter(Boolean));
C52.b=(label,fn,cost,off)=>({label:label+(cost?' · '+fmt(cost):''),off:!!off||(!!cost&&!C51.afford(cost)),fn:()=>{if(cost&&!C51.pay(cost,label))return;fn();}});
C52.pick=a=>a[Math.floor(Math.random()*a.length)];
C52.stars=s=>s>=.85?3:s>=.6?2:s>=.3?1:0;
/* ---------------- appli « Aurore Horizons » ---------------- */
const tabs=[];C52.tab=(key,label,fn,order)=>{tabs.push({key,label,fn,order:order||50});tabs.sort((a,b)=>a.order-b.order);};
const NAME='Aurore Horizons';
function render(b){const X=window.PH49;if(!X||!X.UI){b.textContent='Aurore OS indisponible.';return;}const UI=X.UI;
  if(!tabs.length){UI.empty(b,'Chargement…','');return;}
  const cur=UI.tabs(b,'horizons52',tabs.map(t=>[t.key,t.label]));const t=tabs.find(x=>x.key===cur)||tabs[0];
  try{t.fn(b,UI,X);}catch(e){console.warn('Horizons',e);UI.empty(b,'Onglet indisponible','Réessaie dans un instant.');}}
function register(){if(typeof APPS==='undefined'||typeof RENDER25==='undefined')return;
  if(typeof ICO25!=='undefined')ICO25[NAME]=['linear-gradient(160deg,#21d4fd,#2152ff 55%,#0b1b3a)','<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17h20"/><path d="M5 17a7 7 0 0 1 14 0"/><path d="M12 4v3M4.9 7.9l2 2M19.1 7.9l-2 2"/></svg>'];
  if(typeof TINT25!=='undefined')TINT25[NAME]=['#21d4fd','#2152ff'];
  RENDER25[NAME]={fn:render};if(!APPS.some(a=>a[0]===NAME))APPS.push([NAME,'☀','#21d4fd,#2152ff',render]);}
register();
C52.app=NAME;
C52.openApp=()=>{if(window.PH49&&PH49.openApp)PH49.openApp(NAME);};
})();
