'use strict';
/* v51 · Filière économique reliée : plantation (Solenne) → chocolaterie (Nouvelle-Aurore) → boutique (Port-Aurore).
   Stocks, transport physique ou fret, import/export, prix variables selon l'offre et la demande, contrats d'entreprises. */
(function(){
const K='pa-eco51';C51.resetKey(K);
const RAW={cacao:{n:'Cacao',icon:'🫘',grow:360,yield:12,seed:24,coop:7},cafe:{n:'Café vert',icon:'🌱',grow:240,yield:9,seed:18,coop:6}};
const FIN={chocolat:{n:'Tablettes de chocolat',icon:'🍫',from:'cacao',inQ:5,outQ:4,time:45,price:16},torref:{n:'Café torréfié',icon:'☕',from:'cafe',inQ:4,outQ:3,time:30,price:13}};
const COST={farm:1500,factory:4000,shop:2500,hand:40,factoryDay:60,shopDay:30};
const TIER={bas:{n:'Prix bas',p:.8,d:1.6},normal:{n:'Prix normal',p:1,d:1},premium:{n:'Premium',p:1.4,d:.55}};
const CLIENTS=['Grand Hôtel Port-Aurore','Palace du Lagon Bleu','Grand Palace Nouvelle-Aurore','Café Lumière','Aurore Grand Mall','Yacht Club Aurore'];
const SITE={farm:['life41:pets:sol',-9,7],factory:['nat40:industry',10,3],shop:['shop',9,2]};
const blank=()=>({farm:{owned:false,plots:[null,null,null,null],hand:false,stock:{cacao:0,cafe:0}},
  factory:{owned:false,raw:{cacao:0,cafe:0},out:{chocolat:0,torref:0},queue:[]},
  shop:{owned:false,stock:{chocolat:0,torref:0},tier:'normal',till:0},
  cargo:{},freight:[],contract:null,demand:{chocolat:1,torref:1},intl:{cacao:8,cafe:7,chocolat:19,torref:15},
  lastDay:Math.floor(gameMin/1440),lastHour:Math.floor(gameMin/60),stats:{harvest:0,made:0,sold:0,revenue:0,contracts:0},vitSold:0});
let E=C51.load(K,blank);const save=()=>C51.store(K,E);
['farm','factory','shop','stats','intl','demand'].forEach(k=>{E[k]=Object.assign(blank()[k],E[k]||{});});
const n0=v=>Math.max(0,Math.floor(Number(v)||0));
const cap=()=>player.car?120:30;
const cargoUsed=()=>Object.values(E.cargo).reduce((a,b)=>a+n0(b),0);
const label=k=>(RAW[k]||FIN[k]).icon+' '+(RAW[k]||FIN[k]).n;
const list=o=>Object.keys(o).filter(k=>n0(o[k])>0).map(k=>label(k)+' ×'+n0(o[k])).join(' · ')||'vide';
const site=k=>C51.anchor(SITE[k][0],SITE[k][1],SITE[k][2]);
const hm=m=>{m=Math.max(0,Math.round(m));return m>=60?Math.floor(m/60)+' h '+String(m%60).padStart(2,'0'):m+' min';};
const unitPrice=k=>Math.round(FIN[k].price*TIER[E.shop.tier].p*E.demand[k]*10)/10;
function load(from,keys){let room=cap()-cargoUsed(),moved=0;for(const k of keys){const q=Math.min(room,n0(from[k]));if(q>0){from[k]-=q;E.cargo[k]=n0(E.cargo[k])+q;room-=q;moved+=q;}}save();toast(moved?moved+' unité(s) chargée(s) · '+cargoUsed()+'/'+cap()+(player.car?' (véhicule)':' (à pied · 120 en voiture)'):'Rien à charger ou cargaison pleine.',moved?'good':'warn');}
function unload(to,keys){let moved=0;for(const k of keys){const q=n0(E.cargo[k]);if(q){to[k]=n0(to[k])+q;E.cargo[k]=0;moved+=q;}}save();toast(moved?moved+' unité(s) déchargée(s).':'Ta cargaison ne contient rien d’utile ici.',moved?'good':'warn');}
/* ---------------- plantation ---------------- */
function plotText(p,i){if(!p)return 'P'+(i+1)+' libre';const left=p.readyAt-gameMin;return 'P'+(i+1)+' '+RAW[p.crop].icon+(left<=0?' prête':' '+hm(left));}
function plant(crop){const free=E.farm.plots.map((p,i)=>p?-1:i).filter(i=>i>=0);if(!free.length)return toast('Aucune parcelle libre.','warn');const c=RAW[crop].seed*free.length;if(!C51.pay(c,'Semences · '+RAW[crop].n))return;free.forEach(i=>{E.farm.plots[i]={crop,readyAt:gameMin+RAW[crop].grow};});save();toast(free.length+' parcelle(s) plantée(s) en '+RAW[crop].n.toLowerCase()+'. Récolte dans '+hm(RAW[crop].grow)+'.','good');}
function harvest(auto){let got=0;E.farm.plots.forEach((p,i)=>{if(p&&p.readyAt<=gameMin){E.farm.stock[p.crop]+=RAW[p.crop].yield;got+=RAW[p.crop].yield;E.stats.harvest+=RAW[p.crop].yield;E.farm.plots[i]=auto&&C51.afford(RAW[p.crop].seed)?(takeMoney(RAW[p.crop].seed),{crop:p.crop,readyAt:gameMin+RAW[p.crop].grow}):null;}});save();return got;}
function farmPanel(){const F=E.farm;
 if(!F.owned)return openPanel('🌿 Plantation Aurore · Solenne','Quatre parcelles de cacao et de café sous les cocotiers. Récolte, puis vends à la coopérative ou transforme à la chocolaterie de Nouvelle-Aurore pour gagner beaucoup plus.',[{label:'Acheter la plantation · '+fmt(COST.farm),off:!C51.afford(COST.farm),fn:()=>{if(!C51.pay(COST.farm,'Achat · plantation'))return;F.owned=true;save();C51.journal('Achat de la Plantation Aurore à Solenne.');toast('Plantation achetée ! Plante tes premières parcelles.','good');farmPanel();}}]);
 const ready=F.plots.filter(p=>p&&p.readyAt<=gameMin).length,free=F.plots.filter(p=>!p).length;
 openPanel('🌿 Plantation Aurore','Parcelles : '+F.plots.map(plotText).join(' · ')+'. Entrepôt : '+list(F.stock)+'. Cargaison : '+list(E.cargo)+' ('+cargoUsed()+'/'+cap()+'). Ouvrier agricole : '+(F.hand?'embauché, récolte et replante seul':'aucun')+'.',[
  {label:'Récolter · '+ready+' parcelle(s) prête(s)',off:!ready,fn:()=>{const g=harvest(false);toast('Récolte : +'+g+' unités.','good');farmPanel();}},
  {label:'Planter les '+free+' parcelle(s) libre(s) en cacao · '+fmt(RAW.cacao.seed*free),off:!free,fn:()=>{plant('cacao');farmPanel();}},
  {label:'Planter en café · '+fmt(RAW.cafe.seed*free),off:!free,fn:()=>{plant('cafe');farmPanel();}},
  {label:'Charger la récolte dans ma cargaison',off:!(F.stock.cacao+F.stock.cafe),fn:()=>{load(F.stock,['cacao','cafe']);farmPanel();}},
  {label:'Fret maritime vers la chocolaterie · 2 $/u · 3 h',off:!E.factory.owned||!(F.stock.cacao+F.stock.cafe),fn:()=>{const q=F.stock.cacao+F.stock.cafe;if(!C51.pay(q*2,'Fret maritime'))return;E.freight.push({to:'factory',items:{cacao:F.stock.cacao,cafe:F.stock.cafe},at:gameMin+180});F.stock.cacao=F.stock.cafe=0;save();toast('Conteneur en route vers Nouvelle-Aurore · arrivée dans 3 h.','good');}},
  {label:'Vendre à la coopérative · cacao '+fmt(RAW.cacao.coop)+' · café '+fmt(RAW.cafe.coop),off:!(F.stock.cacao+F.stock.cafe),fn:()=>{const v=F.stock.cacao*RAW.cacao.coop+F.stock.cafe*RAW.cafe.coop;F.stock.cacao=F.stock.cafe=0;save();C51.earn(v,'Coopérative de Solenne');toast('Vendu à la coopérative · +'+fmt(v),'good');}},
  F.hand?{label:'Licencier l’ouvrier agricole',fn:()=>{F.hand=false;save();farmPanel();}}:{label:'Embaucher un ouvrier agricole · '+fmt(COST.hand)+'/jour',fn:()=>{F.hand=true;save();toast('Ouvrier embauché : il récolte et replante automatiquement.','good');farmPanel();}}]);}
/* ---------------- chocolaterie ---------------- */
function produce(k){const f=FIN[k],R=E.factory.raw,batches=Math.min(10,Math.floor(n0(R[f.from])/f.inQ));if(!batches)return toast('Pas assez de '+RAW[f.from].n.toLowerCase()+' ('+f.inQ+' par fournée).','warn');R[f.from]-=batches*f.inQ;const last=E.factory.queue.reduce((m,q)=>Math.max(m,q.at),gameMin);E.factory.queue.push({k,q:batches*f.outQ,at:last+f.time+15*(batches-1)});save();toast(batches+' fournée(s) lancée(s) · '+batches*f.outQ+' '+f.n.toLowerCase()+'.','good');}
function factoryPanel(){const P=E.factory;
 if(!P.owned)return openPanel('🏭 Chocolaterie de Nouvelle-Aurore','Transforme le cacao en tablettes et torréfie le café. Les produits finis valent deux à trois fois la matière première.',[{label:'Acheter la chocolaterie · '+fmt(COST.factory),off:!C51.afford(COST.factory),fn:()=>{if(!C51.pay(COST.factory,'Achat · chocolaterie'))return;P.owned=true;save();C51.journal('Achat de la Chocolaterie de Nouvelle-Aurore.');toast('Chocolaterie achetée. Charges : '+fmt(COST.factoryDay)+'/jour.','good');factoryPanel();}}]);
 const q=P.queue.map(x=>FIN[x.k].icon+' ×'+x.q+' dans '+hm(x.at-gameMin)).join(' · ')||'aucune';
 openPanel('🏭 Chocolaterie','Matières : '+list(P.raw)+'. Produits finis : '+list(P.out)+'. Production en cours : '+q+'. Cours mondial : cacao '+fmt(E.intl.cacao)+' · café '+fmt(E.intl.cafe)+' · chocolat '+fmt(E.intl.chocolat)+' · café torréfié '+fmt(E.intl.torref)+'.',[
  {label:'Décharger ma cargaison (matières premières)',off:!(n0(E.cargo.cacao)+n0(E.cargo.cafe)),fn:()=>{unload(P.raw,['cacao','cafe']);factoryPanel();}},
  {label:'Produire du chocolat · 5 cacao → 4 tablettes',fn:()=>{produce('chocolat');factoryPanel();}},
  {label:'Torréfier du café · 4 café → 3 sachets',fn:()=>{produce('torref');factoryPanel();}},
  {label:'Importer 20 cacao · '+fmt(E.intl.cacao*20),off:!C51.afford(E.intl.cacao*20),fn:()=>{if(!C51.pay(E.intl.cacao*20,'Import · cacao'))return;P.raw.cacao+=20;E.intl.cacao=Math.round(E.intl.cacao*1.05*10)/10;save();factoryPanel();}},
  {label:'Importer 20 café · '+fmt(E.intl.cafe*20),off:!C51.afford(E.intl.cafe*20),fn:()=>{if(!C51.pay(E.intl.cafe*20,'Import · café'))return;P.raw.cafe+=20;E.intl.cafe=Math.round(E.intl.cafe*1.05*10)/10;save();factoryPanel();}},
  {label:'Charger les produits finis dans ma cargaison',off:!(P.out.chocolat+P.out.torref),fn:()=>{load(P.out,['chocolat','torref']);factoryPanel();}},
  {label:'Camion vers la boutique de Port-Aurore · 3 $/u · 2 h',off:!E.shop.owned||!(P.out.chocolat+P.out.torref),fn:()=>{const q=P.out.chocolat+P.out.torref;if(!C51.pay(q*3,'Transport routier'))return;E.freight.push({to:'shop',items:{chocolat:P.out.chocolat,torref:P.out.torref},at:gameMin+120});P.out.chocolat=P.out.torref=0;save();toast('Camion parti vers Port-Aurore · arrivée dans 2 h.','good');}},
  {label:'Exporter un conteneur de 40 produits finis',off:P.out.chocolat+P.out.torref<40,fn:()=>{let left=40,v=0;['chocolat','torref'].forEach(k=>{const q=Math.min(left,P.out[k]);P.out[k]-=q;left-=q;v+=q*E.intl[k];E.intl[k]=Math.round(E.intl[k]*.94*10)/10;});save();C51.earn(v,'Export · port de Nouvelle-Aurore',true);E.stats.sold+=40;E.stats.revenue+=v;save();toast('Conteneur exporté · +'+fmt(v)+' en banque.','good');}},
  {label:'Vendre en gros à la centrale d’achat (60 %)',off:!(P.out.chocolat+P.out.torref),fn:()=>{let v=0,q=0;['chocolat','torref'].forEach(k=>{v+=P.out[k]*FIN[k].price*.6;q+=P.out[k];P.out[k]=0;});save();E.stats.sold+=q;E.stats.revenue+=v;C51.earn(v,'Vente en gros');toast(q+' produits vendus en gros · +'+fmt(v),'good');}}]);}
/* ---------------- boutique ---------------- */
function deliverContract(){const C=E.contract;if(!C)return;const from=n0(E.shop.stock[C.k])>=C.q?E.shop.stock:n0(E.cargo[C.k])>=C.q?E.cargo:null;if(!from)return toast('Il te faut '+C.q+' '+FIN[C.k].n.toLowerCase()+' en rayon ou dans ta cargaison.','warn');from[C.k]-=C.q;E.contract=null;E.stats.contracts++;E.stats.sold+=C.q;E.stats.revenue+=C.r;save();C51.earn(C.r,'Contrat · '+C.c,true);C51.rep(2);C51.journal('Contrat honoré pour '+C.c+'.');toast('Commande livrée à '+C.c+' · +'+fmt(C.r)+' en banque.','good');}
function shopPanel(){const B=E.shop;
 if(!B.owned)return openPanel('🛍️ Aurore Délices · Port-Aurore','Une boutique de chocolats et de cafés fins sur l’avenue commerçante. Les ventes dépendent de ton prix, du stock et de l’attractivité du quartier.',[{label:'Acheter la boutique · '+fmt(COST.shop),off:!C51.afford(COST.shop),fn:()=>{if(!C51.pay(COST.shop,'Achat · boutique'))return;B.owned=true;save();C51.journal('Ouverture de la boutique Aurore Délices.');toast('Aurore Délices est à toi. Remplis les rayons !','good');shopPanel();}}]);
 const C=E.contract,vit=window.WORLD50?WORLD50.vitality('port'):50;
 openPanel('🛍️ Aurore Délices','Rayons : '+list(B.stock)+'. Prix : '+TIER[B.tier].n+' · chocolat '+fmt(unitPrice('chocolat'))+' · café '+fmt(unitPrice('torref'))+'. Caisse : '+fmt(B.till)+'. Vitalité du quartier : '+vit+'/100. Ouvert de 8 h à 22 h.'+(C?' Commande de '+C.c+' : '+C.q+' '+FIN[C.k].n.toLowerCase()+' avant '+hm(C.until-gameMin)+' · '+fmt(C.r)+'.':''),[
  {label:'Mettre ma cargaison en rayon',off:!(n0(E.cargo.chocolat)+n0(E.cargo.torref)),fn:()=>{unload(B.stock,['chocolat','torref']);shopPanel();}},
  {label:'Changer de positionnement · actuel : '+TIER[B.tier].n,fn:()=>{const ks=Object.keys(TIER);B.tier=ks[(ks.indexOf(B.tier)+1)%ks.length];save();shopPanel();}},
  {label:'Encaisser la caisse · '+fmt(B.till),off:B.till<1,fn:()=>{const v=Math.round(B.till);B.till=0;save();C51.earn(v,'Recette · Aurore Délices',true);toast('Recette versée en banque · +'+fmt(v),'good');}},
  {label:C?'Livrer la commande de '+C.c:'Aucune commande d’entreprise pour l’instant',off:!C,fn:deliverContract}]);}
/* ---------------- simulation ---------------- */
function hourTick(h){const B=E.shop,hr=h%24;
 Object.keys(E.demand).forEach(k=>{E.demand[k]=Math.min(1.15,E.demand[k]+.025);});
 Object.keys(E.intl).forEach(k=>{const base={cacao:8,cafe:7,chocolat:19,torref:15}[k];E.intl[k]=Math.round(clamp(E.intl[k]*(1+(Math.random()-.5)*.05)+(base-E.intl[k])*.03,base*.6,base*1.6)*10)/10;});
 if(!B.owned||hr<8||hr>=22)return;
 const vit=window.WORLD50?WORLD50.vitality('port'):50;
 Object.keys(FIN).forEach(k=>{const s=n0(B.stock[k]);if(!s)return;const want=4*(.6+vit/100)*TIER[B.tier].d*E.demand[k],q=Math.min(s,Math.floor(want+Math.random()));if(!q)return;const v=q*unitPrice(k);B.stock[k]-=q;B.till+=v;E.demand[k]=Math.max(.45,E.demand[k]-.015*q);E.stats.sold+=q;E.stats.revenue+=v;E.vitSold+=q;});
 if(E.vitSold>=60&&window.WORLD50&&WORLD50.adjust){E.vitSold-=60;WORLD50.adjust('port',1);}}
function dayTick(){let cost=0;if(E.farm.owned&&E.farm.hand)cost+=COST.hand;if(E.factory.owned)cost+=COST.factoryDay;if(E.shop.owned)cost+=COST.shopDay;
 if(cost){const fromTill=Math.min(E.shop.till,cost);E.shop.till-=fromTill;const rest=cost-fromTill;if(rest)takeMoney(Math.min(rest,state.cash+state.bank));if(typeof econTxP58==='function')econTxP58('Charges · filière cacao',-cost,'Entreprise');}
 if(E.shop.owned&&!E.contract&&Math.random()<.7){const k=pick(Object.keys(FIN)),q=12+4*Math.floor(Math.random()*7),c=pick(CLIENTS);E.contract={c,k,q,r:Math.round(q*FIN[k].price*1.55),until:gameMin+2*1440};C51.notify('📦 Nouvelle commande · '+c,q+' '+FIN[k].n.toLowerCase()+' sous 2 jours · '+fmt(E.contract.r)+'.');}}
function tick(){const now=gameMin,h=Math.floor(now/60),d=Math.floor(now/1440);let changed=false;
 if(h>E.lastHour){for(let x=Math.max(E.lastHour+1,h-48);x<=h;x++)hourTick(x);E.lastHour=h;changed=true;}
 if(d>E.lastDay){for(let x=0;x<Math.min(7,d-E.lastDay);x++)dayTick();E.lastDay=d;changed=true;}
 if(E.farm.owned&&E.farm.hand&&E.farm.plots.some(p=>p&&p.readyAt<=now)){harvest(true);changed=true;}
 const done=E.factory.queue.filter(q=>q.at<=now);if(done.length){done.forEach(q=>{E.factory.out[q.k]=n0(E.factory.out[q.k])+q.q;E.stats.made+=q.q;});E.factory.queue=E.factory.queue.filter(q=>q.at>now);C51.notify('🏭 Production terminée',done.map(q=>FIN[q.k].icon+' ×'+q.q).join(' · ')+' prêts à la chocolaterie.');changed=true;}
 const arr=E.freight.filter(f=>f.at<=now);if(arr.length){arr.forEach(f=>{const to=f.to==='factory'?E.factory.raw:E.shop.stock;Object.keys(f.items).forEach(k=>{to[k]=n0(to[k])+n0(f.items[k]);});C51.notify(f.to==='factory'?'🚢 Fret arrivé à la chocolaterie':'🚚 Livraison arrivée en boutique',list(f.items));});E.freight=E.freight.filter(f=>f.at>now);changed=true;}
 if(E.contract&&now>E.contract.until){C51.notify('Commande expirée',E.contract.c+' s’est tourné vers un concurrent.');C51.rep(-1);E.contract=null;changed=true;}
 if(changed)save();}
function marks(){C51.mark('eco51:farm',site('farm'),0x7fc96a,E.farm.owned?'🌿 Ma plantation · cacao & café':'🌿 Plantation à vendre · cacao & café');
 C51.mark('eco51:factory',site('factory'),0xc58b4b,E.factory.owned?'🏭 Ma chocolaterie':'🏭 Chocolaterie à vendre');
 C51.mark('eco51:shop',site('shop'),0xe86fa0,E.shop.owned?'🛍️ Ma boutique Aurore Délices':'🛍️ Boutique Aurore Délices à vendre');}
C51.handle('eco51:farm',farmPanel);C51.handle('eco51:factory',factoryPanel);C51.handle('eco51:shop',shopPanel);
C51.onReady(()=>{marks();tick();});C51.every(2,tick);C51.every(6,marks);
window.ECO51={get state(){return E;},site,open:{farm:farmPanel,factory:factoryPanel,shop:shopPanel},cargo:()=>list(E.cargo),cap,FIN,RAW,unitPrice,_tick:tick};
})();
