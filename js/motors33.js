'use strict';
/* ==========================================================================
   v33 · AURORE MOTORS : le système de concession complet
   Catalogue & fiches · comparateur · essais chronométrés · achat comptant,
   crédit, reprise, location longue durée · négociation · remise des clés
   avec plaque · garage sauvegardé · SAV (entretien, personnalisation,
   nettoyage, garanties) · occasions & annonces · VIP · appli « Véhicules ».
   ========================================================================== */
(function(){
const AM=window.AM=window.AM||{};const W=()=>AM.W;
/* ---------------- catalogue ---------------- */
const LINES=AM.LINES={prestige:{n:'Aurore Motors Prestige',s:'Berlines de luxe, SUV haut de gamme et supercars',c:'#c8102e',staff:'koffi'},moto:{n:'Aurore Moto',s:'Motos sportives, scooters et motos de luxe',c:'#ff6a13',staff:'rachid'},
  occasion:{n:'Aurore Occasion',s:'Véhicules d’occasion, reprise et annonces',c:'#2e9a6a',staff:'mamadou'},exclusive:{n:'Aurore Exclusive',s:'Limousines, éditions limitées et véhicules VIP',c:'#c9a24a',staff:'selom'}};
const COLS=AM.COLS=[[0x0d0e10,'Noir obsidienne'],[0xf2f2f0,'Blanc nacré'],[0x8a9096,'Gris titane'],[0x1f4f8a,'Bleu lagune'],[0xc0141c,'Rouge Aurore'],[0x1f6fe0,'Bleu électrique'],[0x2b4a3a,'Vert impérial'],[0xd9b44a,'Or sable'],[0x3a1f2a,'Bordeaux'],[0x5a5f66,'Graphite']];
const C=i=>COLS[i][0];
const MODELS=AM.MODELS=[
 {id:'lumi',t:'am_lumi',n:'Aurore Lumi',line:'prestige',g:'Citadine électrique',seats:4,p:1600,vmax:150,acc:9.8,ch:136,tr:'Traction',cof:320,en:'Électrique · 320 km',col:[1,5,4,7,2],desc:'La citadine silencieuse de Port-Aurore : se gare partout, recharge en 30 min.'},
 {id:'lagune',t:'am_lagune',n:'Aurore Lagune',line:'prestige',g:'SUV compact hybride',seats:5,p:3200,vmax:190,acc:8.6,ch:180,tr:'Traction',cof:470,en:'Hybride · 5,1 L/100',col:[6,1,3,9,0],desc:'Le SUV familial : grand coffre, conduite haute, consommation sage.'},
 {id:'prestige',t:'am_prestige',n:'Aurore Prestige S',line:'prestige',g:'Berline de luxe',seats:5,p:7200,vmax:250,acc:5.4,ch:435,tr:'Propulsion',cof:550,en:'Essence V8 · 9,4 L/100',col:[2,0,3,1,9],desc:'Sièges massants, suspension pilotée, silence de cathédrale.'},
 {id:'titan',t:'am_titan',n:'Aurore Titan X',line:'prestige',g:'SUV de luxe',seats:5,p:8500,vmax:220,acc:7.0,ch:400,tr:'Intégrale',cof:500,en:'Essence V8 · 11 L/100',col:[0,1,2,3,4],desc:'Le SUV signature : calandre alvéolée, V8 rageur et transmission intégrale.'},
 {id:'atlas',t:'am_atlas',n:'Aurore Atlas',line:'prestige',g:'4x4 de prestige',seats:7,p:9400,vmax:210,acc:6.1,ch:422,tr:'Intégrale 4x4',cof:640,en:'Essence V8 · 13 L/100',col:[9,0,6,1,7],desc:'Le baroudeur de luxe : trois différentiels, roue de secours, 7 places.'},
 {id:'coupe',t:'am_coupe',n:'Aurore Coupé 9',line:'prestige',g:'Sportive 2+2',seats:4,p:8800,vmax:293,acc:3.9,ch:450,tr:'Propulsion',cof:132,en:'Essence 6 cyl. à plat',col:[7,4,1,0,5],desc:'La sportive de tous les jours, légendaire sur la piste d’essai.'},
 {id:'volt',t:'am_volt',n:'Aurore Volt GT',line:'prestige',g:'GT électrique',seats:4,p:9900,vmax:260,acc:3.2,ch:612,tr:'Intégrale',cof:407,en:'Électrique · 500 km',col:[1,2,5,0,3],desc:'Deux moteurs électriques, 0 à 100 en 3,2 s, recharge ultra-rapide.'},
 {id:'rosso',t:'am_rosso',n:'Aurore Rosso SF',line:'prestige',g:'Supercar hybride',seats:2,p:18500,vmax:340,acc:2.5,ch:1000,tr:'Intégrale',cof:74,en:'Hybride V8 · 1 000 ch',col:[4,7,1,0,5],desc:'Trois moteurs électriques et un V8 : la supercar la plus rapide de la ville.'},
 {id:'hyper',t:'am_hyper',n:'Aurore Hyperion',line:'prestige',g:'Hypercar',seats:2,p:28000,vmax:380,acc:2.2,ch:1200,tr:'Propulsion',cof:50,en:'V12 atmosphérique',col:[5,4,1,0,7],desc:'Carbone, aileron actif et V12 : l’Hyperion est l’arme absolue.'},
 {id:'sovereign',t:'am_sovereign',n:'Aurore Sovereign',line:'exclusive',g:'Limousine de prestige',seats:5,p:22000,vmax:250,acc:4.8,ch:571,tr:'Intégrale',cof:507,en:'V12 biturbo',col:[0,9,1,8,3],desc:'Calandre Panthéon, portes antagonistes et ciel étoilé : l’ultime limousine.'},
 {id:'pullman',t:'am_pullman',n:'Aurore Sovereign Pullman',line:'exclusive',g:'Limousine VIP allongée',seats:7,p:34000,vmax:230,acc:6.4,ch:571,tr:'Intégrale',cof:420,en:'V12 biturbo',col:[0,8,9,1],stock:2,desc:'Version allongée de 6,6 m pour chefs d’État et grandes occasions.'},
 {id:'hypernuit',t:'am_hyper',n:'Aurore Hyperion Édition Nuit',line:'exclusive',g:'Édition limitée · 1/5',seats:2,p:39000,vmax:390,acc:2.1,ch:1250,tr:'Propulsion',cof:50,en:'V12 atmosphérique',col:[0,7],stock:3,top:56,rim:2,desc:'Cinq exemplaires dans le monde, jantes or forgé, carbone teinté nuit.'},
 {id:'rossoa',t:'am_rosso',n:'Aurore Rosso SF Assetto',line:'exclusive',g:'Série rare · piste',seats:2,p:26000,vmax:345,acc:2.4,ch:1030,tr:'Intégrale',cof:74,en:'Hybride V8',col:[7,4,1],stock:4,top:52,rim:1,desc:'Pack piste, aérodynamique en carbone, sellerie Alcantara.'},
 {id:'urbano',t:'scooter',n:'Aurore Urbano 125',line:'moto',g:'Scooter urbain',seats:2,p:450,vmax:95,acc:9.0,ch:12,tr:'Courroie',cof:30,en:'Essence · 2,4 L/100',col:[1,4,3,0],top:17,moto:1,desc:'Le scooter qui se faufile partout dans Port-Aurore.'},
 {id:'strada',t:'scooter',n:'Aurore Strada 300',line:'moto',g:'Maxi-scooter',seats:2,p:900,vmax:140,acc:6.8,ch:28,tr:'Courroie',cof:45,en:'Essence · 3,2 L/100',col:[2,0,6],top:23,moto:1,desc:'Confort de grand tourisme, double coffre sous la selle.'},
 {id:'corsa',t:'motorcycle',n:'Aurore Corsa 1000',line:'moto',g:'Moto sportive',seats:2,p:3900,vmax:299,acc:2.9,ch:214,tr:'Chaîne',cof:0,en:'4 cylindres 1 000 cm³',col:[4,0,5],top:46,moto:1,desc:'Le missile du boulevard : électronique de course, 214 ch.'},
 {id:'imperiale',t:'motorcycle',n:'Aurore Impériale 1800',line:'moto',g:'Moto de luxe · routière',seats:2,p:6200,vmax:210,acc:4.6,ch:126,tr:'Cardan',cof:110,en:'Bicylindre 1 800 cm³',col:[0,8,7],top:38,moto:1,desc:'Valises, sono, selle chauffante : le grand voyage en majesté.'}];
const OLD={honda:['Honda Civic',950],hyundai:['Hyundai Tucson',1300],toyota:['Toyota Land Cruiser',3800],ford:['Ford Mustang GT',4200],bmw:['BMW M5',5200],benz:['Mercedes Classe S',5800],jeep:['Mercedes Classe G',7200],porsche:['Porsche 911',6500],lambo:['Lamborghini Huracán',9500],ferrari:['Ferrari F8',9800],sedan:['Berline',2200],suv:['SUV',2800],sport:['Sportive',4400]};
const byId=AM.byId={};MODELS.forEach(m=>byId[m.id]=m);
AM.priceOf=r=>{const m=byId[r.m];return m?m.p:(OLD[r.t]?OLD[r.t][1]:2500);};
/* ---------------- état sauvegardé ---------------- */
const KEY='pa-auto33';
const fresh=()=>({v:1,seq:1,cars:[],credits:[],leases:[],orders:[],tx:[],deals:{},ads:[],occ:[],p2p:[],laps:{},vip:0,bought:0,stock:{},cmp:[],occT:0});
let ST;try{ST=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){ST=null;}if(!ST||ST.v!==1)ST=fresh();AM.ST=ST;
const save=AM.save=()=>{try{localStorage.setItem(KEY,JSON.stringify(ST));}catch(e){}};
/* reprise des voitures v31 */
try{if(window.V31&&V31.cars&&V31.cars.length){V31.cars.forEach(c=>{const m=MODELS.find(q=>q.t===c.type);ST.cars.push(newRec(m||null,c.color,'cash',c.type,'garage'));});V31.cars.length=0;V31.saveCars();save();}}catch(e){}
const _rf=window.resetFleetP4;window.resetFleetP4=function(){try{_rf&&_rf();}catch(e){}cars.filter(c=>c.am).forEach(c=>{scene.remove(c.mesh);cars.splice(cars.indexOf(c),1);});Object.keys(ST).forEach(k=>delete ST[k]);Object.assign(ST,fresh());save();};
/* ---------------- utilitaires ---------------- */
const afford=c=>state.cash+state.bank>=c;
const pay=(c,label)=>{c=Math.round(c);if(c<=0)return true;if(!afford(c)){toast('Fonds insuffisants ('+fmt(c)+').','bad');return false;}takeMoney(c);tx(-c,label||'Paiement Aurore');return true;};
const earn=(c,label)=>{c=Math.round(c);state.bank+=c;tx(c,label);};
function tx(a,label){ST.tx.unshift({t:Math.round(gameMin),a:Math.round(a),l:label});ST.tx.length=Math.min(ST.tx.length,60);save();}
AM.pay=pay;AM.afford=afford;AM.earn=earn;
const day=t=>{t=t==null?gameMin:t;const d=Math.floor(t/1440)+1,m=Math.floor(t%1440);return 'J'+d+' · '+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};AM.day=day;
const plateN=()=>{let p;do{p=String(1000+Math.floor(Math.random()*9000))+' AM';}while(ST.cars.some(r=>r.plate===p));return p;};
function newRec(m,color,mode,type,st){const r={id:'v'+(ST.seq++),m:m?m.id:null,t:m?m.t:type,n:m?m.n:(OLD[type]?OLD[type][0]:'Véhicule'),line:m?m.line:'occasion',color,plate:plateN(),owner:state.name||'Alex Martin',mode,price:m?m.p:(OLD[type]?OLD[type][1]:2500),date:Math.round(gameMin),km:0,
  cond:{eng:100,oil:100,tir:100,body:100,clean:100},mods:{color,fin:0,rim:m&&m.rim||0,tint:m&&m.line==='exclusive'?2:0,seat:0,amb:0},war:{maker:Math.round(gameMin)+60*1440},st:st||'order',loc:null,fuel:100,dmg:0,vin:'AUR'+Math.random().toString(36).slice(2,10).toUpperCase(),hist:[[Math.round(gameMin),'Mise en circulation']]};return r;}
AM.newRec=newRec;
const recOf=id=>ST.cars.find(r=>r.id===id);const carOf=r=>cars.find(c=>c.am===r.id);AM.recOf=recOf;AM.carOf=carOf;
const condAvg=r=>(r.cond.eng+r.cond.oil+r.cond.tir+r.cond.body+r.cond.clean)/5;
AM.value=r=>{const base=AM.priceOf(r),age=(gameMin-r.date)/1440;return Math.round(base*.85*Math.max(.35,1-r.km/450-age*.004)*(.6+.4*condAvg(r)/100));};
const isMoto=t=>t==='scooter'||t==='motorcycle';
/* ---------------- véhicules dans le monde ---------------- */
function spawnRec(r,x,z,h){const c=addCar(x,z,h,r.mods.color!=null?r.mods.color:r.color,'parked',r.t);c.kind='parked';c.owned=true;c.owner='player';c.am=r.id;c.fuel=r.fuel!=null?r.fuel:100;c.damage=r.dmg||0;
  const m=byId[r.m];if(m&&m.top)c.top=m.top;c.baseTop=c.top;
  if(c.mesh.userData.chassis){try{AMC.rig(c.mesh);AMC.apply(c.mesh,Object.assign({},r.mods,{plate:r.mods.plate||r.plate}));}catch(e){console.warn(e);}}
  r.st='out';r.loc={x,z,h};c.lx=x;c.lz=z;return c;}
AM.spawnRec=spawnRec;
function despawn(r){const c=carOf(r);if(!c)return;if(player.car===c)exitCar();scene.remove(c.mesh);const i=cars.indexOf(c);if(i>=0)cars.splice(i,1);}
AM.despawn=despawn;
function freeBay(list){list=list||W().bays;for(const b of list){if(!cars.some(c=>Math.hypot(c.x-b[0],c.z-b[1])<3.4))return b;}return list[list.length-1];}
AM.freeBay=freeBay;
function nearRoad(x,z){let best=null,bd=1e9;(NODES||[]).forEach(n=>{const d=Math.hypot(n.x-x,n.z-z);if(d>8&&d<bd){bd=d;best=n;}});return best?[best.x+3,best.z+3,0]:[x+4,z,0];}
function villaSpot(){try{const v=(V31.villas||[]).find(v=>V31.access(v.id)&&V31.res[v.id]&&V31.res[v.id].own);return v?[v.x,v.z+4,v.h||0,v.name]:null;}catch(e){return null;}}
AM.villaSpot=villaSpot;
/* ---------------- commandes et suivi ---------------- */
const DELIV=['Commande validée','Préparation esthétique','Contrôle qualité 120 points','Immatriculation','Prête · remise des clés'];
function order(r,kind,label,steps,secs,o){const q=Object.assign({id:'o'+(ST.seq++),car:r.id,kind,label,steps,i:0,t:0,d:secs,ready:false,start:Math.round(gameMin)},o||{});ST.orders.push(q);save();return q;}
AM.order=order;
function orderTick(dt){ST.orders.forEach(q=>{if(q.ready)return;q.t+=dt;const per=q.d/(q.steps.length-1);const ni=Math.min(q.steps.length-1,Math.floor(q.t/per));if(ni!==q.i){q.i=ni;if(ni<q.steps.length-1)AM.note('🔧 '+recLabel(q.car)+' · '+q.steps[ni]);}
  if(q.t>=q.d){q.ready=true;q.i=q.steps.length-1;finishOrder(q);}});}
function recLabel(id){const r=recOf(id);return r?r.n:'Véhicule';}
function finishOrder(q){const r=recOf(q.car);if(!r){ST.orders=ST.orders.filter(x=>x!==q);return;}
  if(q.kind==='delivery'){r.st='ready';AM.note('🔑 '+r.n+' est prête ! Rendez-vous à l’atelier Aurore pour la remise des clés.','good',true);}
  else{if(q.apply)applyService(r,q.apply);r.hist.unshift([Math.round(gameMin),q.label]);ST.orders=ST.orders.filter(x=>x!==q);
    if(q.deliver){const p=nearRoad(player.x,player.z);spawnRec(r,p[0],p[1],p[2]);wp={x:p[0],z:p[1],l:r.n};AM.note('🚚 '+r.n+' vous a été livrée à proximité (repère placé).','good',true);}
    else{const b=freeBay();spawnRec(r,b[0],b[1],b[2]);AM.note('✅ '+q.label+' terminé : '+r.n+' vous attend devant l’atelier.','good',true);}}
  save();}
AM.finishOrder=finishOrder;
AM.note=function(t,k,big){toast(t,k||'');addChat('Aurore Motors',t);try{tone(880,.12,'sine',.06);tone(1320,.16,'sine',.05,.1);}catch(e){}};
/* ---------------- crédits & locations ---------------- */
function financeTick(){
  ST.credits.forEach(cr=>{if(cr.left<=0||gameMin<cr.due)return;const amt=Math.round(cr.monthly+(cr.late||0));
    if(afford(amt)){takeMoney(amt);tx(-amt,'Mensualité '+cr.label);cr.left--;cr.late=0;cr.due+=1440;cr.missed=0;AM.note('💳 Mensualité '+cr.label+' prélevée : '+fmt(amt)+(cr.left?' · reste '+cr.left:' · crédit soldé !'),cr.left?'':'good');}
    else{cr.missed=(cr.missed||0)+1;cr.late=Math.round(cr.monthly*.05*cr.missed);cr.due+=240;AM.note('⚠️ Mensualité impayée ('+fmt(amt)+'). Frais de retard. Incident '+cr.missed+'/3.','warn');
      if(cr.missed>=3){const r=recOf(cr.car);if(r){despawn(r);ST.cars=ST.cars.filter(x=>x!==r);AM.note('🚫 '+r.n+' a été saisie par Aurore Finance après 3 impayés.','bad');}cr.left=0;}}});
  ST.credits=ST.credits.filter(c=>c.left>0);
  ST.leases.forEach(l=>{const r=recOf(l.car);if(!r){l.done=1;return;}
    if(gameMin>=l.until){if(player.car&&player.car.am===r.id&&Math.abs(player.car.v)>1)return;despawn(r);ST.cars=ST.cars.filter(x=>x!==r);l.done=1;AM.note('🔁 Fin de location : '+r.n+' retourne chez Aurore Motors.','warn');return;}
    if(gameMin>=l.due){if(afford(l.daily)){takeMoney(l.daily);tx(-l.daily,'Loyer '+r.n);}else AM.note('⚠️ Loyer de location impayé ('+fmt(l.daily)+').','warn');l.due+=1440;}});
  ST.leases=ST.leases.filter(l=>!l.done);
}
/* ---------------- entretien : usure & effets ---------------- */
function applyService(r,a){Object.keys(a).forEach(k=>{if(k.startsWith('cond.')){const f=k.slice(5);r.cond[f]=Math.min(100,a[k]==='max'?100:r.cond[f]+a[k]);}else if(k.startsWith('mods.'))r.mods[k.slice(5)]=a[k];else if(k.startsWith('war.'))r.war[k.slice(4)]=Math.max(r.war[k.slice(4)]||0,gameMin)+a[k]*1440;else if(k==='dmg')r.dmg=0;});}
AM.applyService=applyService;
let wearT=0,saveT=0,warnT={};
function wearTick(dt){wearT+=dt;if(wearT<1)return;wearT=0;
  ST.cars.forEach(r=>{if(r.st!=='out')return;const c=carOf(r);if(!c)return;const d=Math.hypot(c.x-(c.lx??c.x),c.z-(c.lz??c.z));c.lx=c.x;c.lz=c.z;if(d>60)return;
    if(d>0){r.km+=d/1000;r.cond.oil=Math.max(0,r.cond.oil-d/650);r.cond.tir=Math.max(0,r.cond.tir-d/900);r.cond.clean=Math.max(0,r.cond.clean-d/500);if(r.cond.oil<8)r.cond.eng=Math.max(0,r.cond.eng-d/120);}
    r.dmg=c.damage||0;r.cond.body=Math.max(0,100-(c.damage||0));r.fuel=c.fuel;r.loc={x:c.x,z:c.z,h:c.h};
    const weak=r.cond.eng<30||r.cond.oil<6||r.cond.tir<10;c.top=(c.baseTop||c.top)*(weak?.68:1);
    if(weak&&player.car===c&&(!warnT[r.id]||warnT[r.id]<performance.now())){warnT[r.id]=performance.now()+60000;AM.note('🛠️ '+r.n+' : entretien nécessaire (huile '+Math.round(r.cond.oil)+' %, pneus '+Math.round(r.cond.tir)+' %, moteur '+Math.round(r.cond.eng)+' %). Puissance réduite.','warn');}});
  saveT+=1;if(saveT>=5){saveT=0;save();}}
/* ---------------- boucle principale ---------------- */
let finT=0,scrT=0,occT=0;
AM.tick=function(dt){
  try{AMC.tick(dt);cars.forEach(c=>{if(c.bow&&(Math.abs(c.v)>1.5||(player.car===c&&AM.cockpit))){c.bow.parent.remove(c.bow);c.bow=null;}});}catch(e){}
  try{AM.tickWorld&&AM.tickWorld(dt);}catch(e){}
  try{orderTick(dt);wearTick(dt);finT+=dt;if(finT>1){finT=0;financeTick();AM.marketTick&&AM.marketTick();}}catch(e){console.warn('am fin',e);}
  try{AM.tickTest&&AM.tickTest(dt);AM.tickLap&&AM.tickLap(dt);AM.tickAmbient&&AM.tickAmbient(dt);AM.tickHud&&AM.tickHud(dt);}catch(e){console.warn('am tick',e);}
  scrT+=dt;if(scrT>.5){scrT=0;try{(W().screens||[]).forEach(S=>{if(S.m.visible!==false){S.draw(S.g,S.c.width,S.c.height);S.t.needsUpdate=true;}});}catch(e){}}
};
const _up=update;update=function(dt){_up(dt);if(!started)return;AM.tick(dt);};
/* ---------------- construction ---------------- */
const _bd=buildDecor;buildDecor=function(){_bd();try{AM.buildWorld();AM.placeDisplays();AM.spawnSaved();}catch(e){console.warn('am33 build',e);}};
AM.spawnSaved=function(){ST.cars.forEach(r=>{if(r.st==='out'&&r.loc){spawnRec(r,r.loc.x,r.loc.z,r.loc.h||0);}else if(r.st==='atelier'){/* reprend la commande */}});
  ST.orders.forEach(q=>{const r=recOf(q.car);if(r&&q.kind!=='delivery')r.st='atelier';});};
})();
