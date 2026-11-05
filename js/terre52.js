'use strict';
/* v52 · Agriculture et élevage : Domaine des Alizés (Solenne), 5 cultures, champs extensibles,
   améliorations (irrigation, serre, tracteur, silo, label bio), poulailler, chèvrerie, étable,
   coopérative à prix variables selon la saison, contrats de restaurants et ouvriers agricoles. */
(function(){
if(!window.C52)return;
const K='pa-terre52';C51.resetKey(K);
const CROPS={
  mais:{n:'Maïs',icon:'🌽',grow:120,yield:14,seed:5,price:6},
  tomate:{n:'Tomates',icon:'🍅',grow:180,yield:18,seed:7,price:8},
  manioc:{n:'Manioc',icon:'🥔',grow:300,yield:20,seed:6,price:7},
  ananas:{n:'Ananas',icon:'🍍',grow:480,yield:10,seed:30,price:24},
  vanille:{n:'Vanille',icon:'🌿',grow:720,yield:4,seed:80,price:95}
};
const ANIMALS={
  poule:{n:'Poules',icon:'🐔',price:60,feed:2,out:'oeufs',per:3,max:40},
  chevre:{n:'Chèvres',icon:'🐐',price:450,feed:8,out:'lait',per:2,max:12},
  vache:{n:'Vaches',icon:'🐄',price:1800,feed:20,out:'fromage',per:2,max:8}
};
const PROD={oeufs:{n:'Œufs',icon:'🥚',price:2},lait:{n:'Lait de chèvre',icon:'🥛',price:6},fromage:{n:'Fromage fermier',icon:'🧀',price:18}};
const UP={irrigation:{n:'Irrigation goutte-à-goutte',d:'Cultures 25 % plus rapides',price:6000},serre:{n:'Serres tropicales',d:'Rendement +30 %',price:9000},tracteur:{n:'Tracteur Aurore T5',d:'Récolte tout et replante seul',price:15000},silo:{n:'Silo et chambre froide',d:'Stockage 250 → 800',price:7000},bio:{n:'Label Bio Lagune',d:'Prix de vente +25 %',price:5000}};
const CLIENTS=['Ti Kaz','Le Corail','Palace du Lagon Bleu','Restaurants des Docks','Grand Hôtel Waterfront','Chez Mama Adjo','Cantine de l’université'];
const blank=()=>({owned:false,fields:[null,null,null,null,null,null],up:{},stock:{},animals:{poule:0,chevre:0,vache:0},care:60,workers:0,contract:null,market:{},stats:{harvest:0,sold:0,revenue:0,contracts:0}});
let S=C51.load(K,blank);S.up=S.up||{};S.stock=S.stock||{};S.animals=Object.assign({poule:0,chevre:0,vache:0},S.animals||{});S.stats=Object.assign(blank().stats,S.stats||{});S.market=S.market||{};if(!Array.isArray(S.fields))S.fields=blank().fields;
const save=()=>C51.store(K,S);
const n0=v=>Math.max(0,Math.floor(Number(v)||0));
const cap=()=>S.up.silo?800:250;
const used=()=>Object.values(S.stock).reduce((a,b)=>a+n0(b),0);
const nameOf=k=>(CROPS[k]||PROD[k]).icon+' '+(CROPS[k]||PROD[k]).n;
const season=()=>{try{const d=C51.day()%28;return d<7?'sèche':d<14?'harmattan':d<21?'pluies':'fêtes';}catch(e){return 'sèche';}};
function price(k){const base=(CROPS[k]||PROD[k]).price,m=S.market[k]||1;const sb=season()==='fêtes'?1.15:season()==='harmattan'?1.1:season()==='pluies'?.92:1;return Math.round(base*m*sb*(S.up.bio?1.25:1)*10)/10;}
const hm=m=>{m=Math.max(0,Math.round(m));return m>=60?Math.floor(m/60)+' h '+String(m%60).padStart(2,'0'):m+' min';};
function growTime(c){return CROPS[c].grow*(S.up.irrigation?.75:1);}
function fieldTxt(f,i){if(!f)return 'C'+(i+1)+' en jachère';const l=f.at-gameMin;return 'C'+(i+1)+' '+CROPS[f.c].icon+(l<=0?' prêt':' '+hm(l));}
function plant(c){const free=S.fields.map((f,i)=>f?-1:i).filter(i=>i>=0);if(!free.length)return toast('Aucun champ libre.','warn');if(!C51.pay(CROPS[c].seed*free.length,'Semences · '+CROPS[c].n))return;
  free.forEach(i=>{S.fields[i]={c,at:gameMin+growTime(c)};});save();toast(free.length+' champ(s) semé(s) · '+CROPS[c].n+' · récolte dans '+hm(growTime(c))+'.','good');}
function harvest(bonus,replant){let got=0,lost=0;S.fields.forEach((f,i)=>{if(!f||f.at>gameMin)return;const y=Math.round(CROPS[f.c].yield*(S.up.serre?1.3:1)*(bonus||1));const room=cap()-used();const q=Math.min(room,y);lost+=y-q;S.stock[f.c]=n0(S.stock[f.c])+q;got+=q;S.stats.harvest+=q;
  S.fields[i]=replant&&C51.afford(CROPS[f.c].seed)?(takeMoney(CROPS[f.c].seed),{c:f.c,at:gameMin+growTime(f.c)}):null;});save();if(got)C52.xp('terre',got*.6);return {got,lost};}
function ready(){return S.fields.filter(f=>f&&f.at<=gameMin).length;}
/* ---------------- domaine ---------------- */
function farm(){
  if(!S.owned)return C52.panel('🌾 Domaine des Alizés','Une exploitation de 6 champs, un poulailler, une chèvrerie et une étable, au pied des collines de Solenne. Cultive, élève, vends à la coopérative et honore les commandes des restaurants.',[C52.b('Acheter le domaine',()=>{S.owned=true;save();C51.journal('Achat du Domaine des Alizés.');C52.xp('terre',30);farm();},12000)]);
  const r=ready();
  C52.panel('🌾 Domaine des Alizés',S.fields.map(fieldTxt).join(' · ')+'. Entrepôt '+used()+'/'+cap()+' : '+(Object.keys(S.stock).filter(k=>n0(S.stock[k])).map(k=>nameOf(k)+' ×'+n0(S.stock[k])).join(' · ')||'vide')+'. Saison : '+season()+'.',[
    {label:'🧺 Récolte manuelle · '+r+' champ(s) prêt(s) (+20 %)',off:!r,fn:()=>C52.mg('catch',{id:'terre52-recolte',title:'Récolte',icon:'🧺',intro:'Attrape les produits mûrs, évite les cailloux et les insectes.',good:['🌽','🍅','🍍','🥔','🌿'],bad:['🪨','🐛','🦗'],basket:'🧺',dur:18,min:40,after:s=>{const h=harvest(1+.2*s,!!S.up.tracteur);return '+'+h.got+' produits récoltés'+(h.lost?' · '+h.lost+' perdus (entrepôt plein)':'')+'.';}})},
    {label:'⚡ Récolte rapide',off:!r,fn:()=>{const h=harvest(1,!!S.up.tracteur);toast('+'+h.got+' récoltés'+(h.lost?' · '+h.lost+' perdus':''),'good');farm();}},
    {label:'🌱 Semer…',off:!S.fields.some(f=>!f),fn:sow},
    {label:'🐔 Animaux ('+(S.animals.poule+S.animals.chevre+S.animals.vache)+')',fn:barn},
    {label:'🛠️ Améliorations & agrandissement',fn:upgrades},
    {label:'👩‍🌾 Ouvriers · '+S.workers+' (90 $/jour)',fn:()=>C52.panel('Ouvriers agricoles','Chaque ouvrier récolte et replante 2 champs prêts par heure de jeu. Salaire : 90 $ par jour.',[C52.b('Embaucher un ouvrier',()=>{S.workers=Math.min(6,S.workers+1);save();farm();}),{label:'Licencier un ouvrier',off:!S.workers,fn:()=>{S.workers--;save();farm();}}])}]);}
function sow(){C52.panel('🌱 Semer','Tous les champs libres seront semés. Prix des semences par champ :',Object.keys(CROPS).map(c=>({label:CROPS[c].icon+' '+CROPS[c].n+' · '+hm(growTime(c))+' · '+fmt(CROPS[c].seed)+'/champ · vente ~'+fmt(price(c)),fn:()=>{plant(c);farm();}})));}
function barn(){const A=S.animals;C52.panel('🐔 Élevage','Production chaque matin si les bêtes sont nourries (aliment débité automatiquement). Bien-être : '+Math.round(S.care)+'/100 (plus il est haut, plus la production augmente).',
  Object.keys(ANIMALS).map(a=>{const X=ANIMALS[a];return C52.b('Acheter '+X.icon+' '+X.n.toLowerCase().replace(/s$/,'')+' ('+A[a]+'/'+X.max+')',()=>{A[a]++;save();barn();},X.price,A[a]>=X.max);}).concat([
  {label:'🧑‍🌾 Soigner les animaux',off:!(A.poule+A.chevre+A.vache),fn:()=>C52.mg('mash',{id:'terre52-soins',title:'Soins aux animaux',icon:'🐐',intro:'Brossage, eau fraîche, paille propre : alterne vite !',dur:12,min:30,after:s=>{S.care=clamp(S.care+25*s+5,0,100);save();C52.xp('terre',8);return 'Bien-être des animaux : '+Math.round(S.care)+'/100.';}})},
  {label:'← Domaine',fn:farm}]));}
function upgrades(){const rows=Object.keys(UP).map(k=>S.up[k]?{label:'✓ '+UP[k].n,off:true}:C52.b(UP[k].n+' · '+UP[k].d,()=>{S.up[k]=1;save();C52.xp('terre',50);C52.xp('affaires',20);upgrades();},UP[k].price));
  const n=S.fields.length;rows.push(C52.b('Agrandir · +3 champs ('+n+' → '+(n+3)+')',()=>{S.fields.push(null,null,null);save();C52.xp('terre',40);if(S.fields.length>=12)C52.title('Grand exploitant');upgrades();},n*5000,n>=15));
  rows.push({label:'← Domaine',fn:farm});C52.panel('🛠️ Améliorations',S.fields.length+' champs · '+Object.keys(S.up).length+'/5 améliorations.',rows);}
/* ---------------- coopérative ---------------- */
function coop(){const keysIn=Object.keys(S.stock).filter(k=>n0(S.stock[k])>0);const C=S.contract;
  const rows=keysIn.map(k=>({label:'Vendre '+nameOf(k)+' ×'+n0(S.stock[k])+' · '+fmt(price(k))+' /u',fn:()=>{const q=n0(S.stock[k]),v=Math.round(q*price(k));S.stock[k]=0;S.market[k]=Math.max(.6,(S.market[k]||1)-q/400);S.stats.sold+=q;S.stats.revenue+=v;save();C51.earn(v,'Coopérative · '+(CROPS[k]||PROD[k]).n);C52.xp('terre',q*.2);C52.xp('affaires',q*.1);toast(q+' vendus · '+fmt(v),'good');coop();}}));
  if(C){const have=n0(S.stock[C.k]);rows.unshift({label:'📦 Livrer '+C.c+' · '+C.q+' '+nameOf(C.k)+' · '+fmt(C.r)+(have<C.q?' (tu as '+have+')':''),off:have<C.q,fn:()=>{S.stock[C.k]-=C.q;C51.earn(C.r,'Contrat · '+C.c,true);S.stats.contracts++;S.contract=null;save();C52.xp('terre',30);C52.xp('affaires',20);if(S.stats.contracts>=10)C52.trophy('terre-contrats','Fournisseur officiel des trois cités','🧺','affaires',3000);toast('Contrat honoré · '+fmt(C.r),'good');coop();}});}
  C52.panel('🧺 Coopérative agricole','Prix du jour (saison '+season()+'). Vendre beaucoup d’un coup fait baisser le cours, qui remonte chaque jour.'+(C?' Commande en cours de '+C.c+', à livrer avant le jour '+(C.until+1)+'.':' Pas de commande en ce moment.'),rows.length?rows:[{label:'Rien à vendre pour l’instant',off:true}]);}
/* ---------------- temps ---------------- */
C51.every(25,()=>{if(!S.owned)return;const h=Math.floor(gameMin/60);if(S.lastH==null)S.lastH=h;if(h>S.lastH){const n=Math.min(6,h-S.lastH);S.lastH=h;if(S.workers){let todo=S.workers*2*n;S.fields.forEach((f,i)=>{if(todo<=0||!f||f.at>gameMin)return;todo--;const y=Math.round(CROPS[f.c].yield*(S.up.serre?1.3:1)*.9);const q=Math.min(cap()-used(),y);S.stock[f.c]=n0(S.stock[f.c])+q;S.stats.harvest+=q;S.fields[i]=C51.afford(CROPS[f.c].seed)?(takeMoney(CROPS[f.c].seed),{c:f.c,at:gameMin+growTime(f.c)}):null;});}save();}});
C52.daily('terre52',(n)=>{if(!S.owned)return;const A=S.animals;let feed=0,made=[];
  Object.keys(ANIMALS).forEach(a=>{const X=ANIMALS[a];if(!A[a])return;feed+=A[a]*X.feed*n;const q=Math.round(A[a]*X.per*n*(.6+S.care/125));const room=cap()-used();const g=Math.min(room,q);S.stock[X.out]=n0(S.stock[X.out])+g;if(g)made.push(PROD[X.out].icon+' '+g);});
  if(feed)takeMoney(Math.min(feed,state.cash+state.bank));if(S.workers)takeMoney(Math.min(90*S.workers*n,state.cash+state.bank));
  S.care=clamp(S.care-8*n,10,100);Object.keys(S.market).forEach(k=>{S.market[k]=Math.min(1.25,S.market[k]+.12*n);});
  ['mais','tomate','ananas','vanille','manioc'].forEach(k=>{if(Math.random()<.3)S.market[k]=clamp((S.market[k]||1)*(.9+Math.random()*.25),.6,1.3);});
  if(S.contract&&C51.day()>S.contract.until){C51.notify('🧺 Commande expirée',S.contract.c+' s’est fourni ailleurs.');S.contract=null;}
  if(!S.contract&&Math.random()<.7){const pool=Object.keys(CROPS).concat(Object.keys(PROD).filter(p=>Object.keys(ANIMALS).some(a=>A[a]&&ANIMALS[a].out===p)));const k=C52.pick(pool);const q=k==='vanille'?6+Math.floor(Math.random()*6):20+Math.floor(Math.random()*40);const c=C52.pick(CLIENTS);
    S.contract={c,k,q,r:Math.round(q*(CROPS[k]||PROD[k]).price*1.6),until:C51.day()+2};C51.notify('🧺 Nouvelle commande',c+' veut '+q+' '+nameOf(k).toLowerCase()+' sous 2 jours.');}
  save();if(made.length)C51.notify('🐔 Production du matin',made.join(' · ')+(feed?' · aliment '+fmt(feed):''));});
C52.venue('terre52:farm',['life41:pets:sol',18,9],0x8bc34a,'🌾 Domaine des Alizés · ferme & élevage',farm);
C52.venue('terre52:coop',['nat40:market',8,-6,'shop'],0xcddc39,'🧺 Coopérative agricole & marché de gros',coop);
C52.tab('terre','Terre',(b,UI)=>{UI.hero(b,'Agriculture · '+C52.rankName('terre'),S.owned?S.fields.length+' champs · '+ready()+' prêt(s)':'Pas de domaine',S.stats.harvest+' récoltés · '+S.stats.sold+' vendus · '+fmt(S.stats.revenue));
  UI.btn(b,'📍 Domaine des Alizés (Solenne)',()=>C52.go('terre52:farm'),true);UI.btn(b,'📍 Coopérative (Nouvelle-Aurore)',()=>C52.go('terre52:coop'));
  if(S.owned){const g=UI.grp(b);S.fields.forEach((f,i)=>UI.row(g,{title:fieldTxt(f,i)}));const A=S.animals;UI.note(b,'Élevage : '+A.poule+' 🐔 · '+A.chevre+' 🐐 · '+A.vache+' 🐄 · bien-être '+Math.round(S.care)+'/100.');}
  if(S.contract)UI.note(b,'📦 '+S.contract.c+' : '+S.contract.q+' '+nameOf(S.contract.k).toLowerCase()+' · '+fmt(S.contract.r)+'.');},30);
window.TERRE52={get state(){return S;},farm,coop,price};
})();
