'use strict';
/* ---------- v13 : justice, gangs, événements de ville et gestion d’entreprises ---------- */
(function(){
const K='port-aurore-justice-v1';
let S={heat:0,inf:0,rep:{},org:null,jail:0,rec:0,fines:[],dirty:0,arr:0,biz:{},lawyer:0};
try{S=Object.assign(S,JSON.parse(localStorage.getItem(K)||'{}'));}catch(e){}
const sv=()=>{try{localStorage.setItem(K,JSON.stringify(S));}catch(e){}};
const PR={x:240,z:40},INF=['Inconnu','Suspect','Fiché','Redouté','Légende du crime'],INX=[0,10,25,50,90],RK=['Recrue','Membre','Lieutenant','Bras droit','Chef'],RX=[0,15,40,80,150],COPS=['police','gendarme'];
const ORG=[['marees','Les Marées','gang','neon'],['neon','Néon Crew','gang','marees'],['forges','Les Forges','gang',''],['syndicat','Syndicat des Dockers','legal',''],['chambre','Chambre de Commerce','legal','']];
// nom, base, chaleur, secondes sur place
const CR=[['Contrefaçons à écouler (fictif)',38,1,3],['Racket à la criée (fictif)',46,1,4],['Cambriolage de villa (fictif)',58,2,6],['Vol de voiture de luxe (fictif)',64,2,5],['Livraison de marchandise volée (fictif)',52,1,2],['Sabotage du générateur (fictif)',70,2,6]];
const EV=[['Festival du port',120,{biz:1.4},'les commerces font recette.'],['Vague de cambriolages',130,{crime:1.3,heat:1.5,police:1.5,gendarme:1.5},'police et gangs sont mobilisés.'],['Grève des transports',100,{bus:1.4,taxi:1.4,routier:1.2},'les chauffeurs sont très demandés.'],['Accident sur la route du Phare',90,{ambulancier:1.5,pompier:1.5},'les secours sont appelés.'],['Contrôles renforcés',110,{arrest:2},'barrages de police, sois discret.'],['Braquage à la banque',90,{police:1.6,gendarme:1.6,heat:1.3},'alerte générale.'],['Concert au Club Néon',100,{fun:1},'l’ambiance monte en ville.']];
let ev=null,evT=rand(60,100),hot=0,jt=0,sc=0,pen=0;
const lv=(v,t)=>{let g=0;t.forEach((x,i)=>{if(v>=x)g=i;});return g;};
const em=k=>(ev&&ev.m[k])||1,org=id=>ORG.find(o=>o[0]===id),orgRk=id=>lv(S.rep[id]||0,RX);
const polNear=r=>cars.some(c=>c.type==='police'&&!c.company&&!c.owned&&Math.hypot(c.x-player.x,c.z-player.z)<r);
const fineTot=()=>S.fines.reduce((a,f)=>a+f.a,0),pay=(a,l)=>pay11(a,l);
const bz=id=>(S.biz[id]=S.biz[id]||{staff:0,stock:100});
function fine(l,a){S.fines.push({l,a});sv();toast(l+' : amende de '+fmt(a)+'. À régler au commissariat.','bad');}
function addHeat(n){S.heat=Math.min(5,S.heat+n*em('heat'));hot=0;toast('Recherché ★'+Math.ceil(S.heat),'warn');sv();}
function clearHc(){for(let i=cars.length-1;i>=0;i--)if(cars[i].hc){scene.remove(cars[i].mesh);cars.splice(i,1);}}
// arrestation, prison, justice
function arrest(){
  if(player.car)exitCar();
  const t=Math.min(150,20+25*Math.ceil(S.heat)+10*S.rec),c=Math.min(state.cash,S.dirty);
  S.jail=t;S.rec++;S.lawyer=0;state.cash-=c;S.dirty=0;S.heat=0;hot=0;state.rep=Math.max(0,state.rep-5);clearHc();
  player.x=PR.x;player.z=PR.z;mission=null;beam.visible=false;closePanel();
  toast('Arrêté ! Prison : '+t+' s.'+(c?' '+fmt(c)+' d’argent sale saisis.':''),'bad');sv();saveProgress();
}
// missions criminelles fictives
function startCrime(c){
  if(!S.org||org(S.org)[2]!=='gang'){toast('Rejoins d’abord un gang.','warn');return;}
  if(mission||S.jail>0||COPS.includes(state.job)){toast('Impossible maintenant.','warn');return;}
  let n=NODES.filter(q=>{const d=Math.hypot(q.x-player.x,q.z-player.z);return d>20&&d<120;});if(!n.length)n=NODES;const a=pick(n);
  let m=NODES.filter(q=>{const d=Math.hypot(q.x-a.x,q.z-a.z);return d>50&&d<150;});if(!m.length)m=NODES;const b=pick(m),d=Math.hypot(b.x-a.x,b.z-a.z);
  mission={kind:'crime',stage:'pickup',pickup:a,drop:b,resto:c[0],addr:Math.floor(rand(2,98))+' '+pick(STREETS),pay:Math.round((c[1]+d*.3)*(1+.1*orgRk(S.org))*em('crime')*(1+.1*lv(S.inf,INX))),time:0,limit:Math.round(d/6+40+c[3]),wk:0,cr:c};
  toast('Mission : '+c[0],'warn');closePanel();
}
function crimeStep(dt){
  const m=mission,t=m.stage==='pickup'?m.pickup:m.drop;
  beam.visible=true;beam.position.x=t.x;beam.position.z=t.z;beam.material.color.setHex(m.stage==='pickup'?0xff5a5a:0x9b59ff);
  if(m.stage==='deliver')m.time+=dt;
  if(Math.hypot(player.x-t.x,player.z-t.z)>=4){m.wk=0;return;}
  if(m.stage==='pickup'){m.wk+=dt;if(m.wk<m.cr[3])return;m.stage='deliver';m.time=0;addHeat(m.cr[2]);toast('Fais vite : direction '+m.addr+'.','warn');return;}
  const late=m.time>m.limit,p=Math.round(m.pay*(late?.6:1.25)),o=S.org,rv=org(o)[3];
  state.cash+=p;state.earned+=p;S.dirty+=p;S.inf+=4;S.rep[o]=(S.rep[o]||0)+5;if(rv)S.rep[rv]=Math.max(0,(S.rep[rv]||0)-2);
  if(m.cr[0].indexOf('Sabotage')===0){blackout=rand(20,30);toast('Coupure de courant dans le quartier !','warn');}
  toast('Mission terminée : '+fmt(p)+' d’argent sale · '+RK[orgRk(o)],'good');addHeat(1);mission=null;beam.visible=false;sv();
}
const _um=updateMission;updateMission=function(dt){
  if(mission&&mission.kind==='crime'){crimeStep(dt);return;}
  const d0=state.done,j=state.job;_um(dt);
  if(state.done>d0){
    if(COPS.includes(j)){S.arr++;state.cash+=20;S.heat=Math.max(0,S.heat-.5);toast('Arrestation validée · prime '+fmt(20),'good');}
    if(S.org&&org(S.org)[2]==='legal')S.rep[S.org]=(S.rep[S.org]||0)+1;sv();
  }
};
const _nm=newMission;newMission=function(){_nm();if(mission&&mission.kind!=='crime')mission.pay=Math.round(mission.pay*em(mission.kind));};
// entreprises : prix, employés, stock, événements, organisations
function priceF(){const D={water:2,soda:3,sand:8,menu:15,fish:12};let r=0,n=0;for(const k in D){r+=(walletP58.prices[k]||D[k])/D[k];n++;}r/=n;return r*Math.max(.2,1.6-.6*r);}
const _cr=econCreditP58;econCreditP58=function(a,l,t){
  if(typeof l==='string'&&l.indexOf('Bénéfice')===0){const b=ECON.businesses.find(x=>l.indexOf(x.name)>0);if(b){const z=bz(b.id);a=Math.max(0,Math.round(a*priceF()*(1+.15*z.staff)*(z.stock>0?1:.3)*em('biz')*(S.org==='chambre'?1.1:1))-8*z.staff);z.stock=Math.max(0,z.stock-34);sv();}}
  else if(typeof l==='string'&&l.indexOf('Salaire')===0&&S.org==='syndicat')a=Math.round(a*1.1);
  return _cr(a,l,t);
};
// lieux : commissariat, gendarmerie, tribunal, prison
const _bp=buildPhase2;buildPhase2=function(){_bp();
  [['comm13',-240,-40,0x2d4f9a,'Commissariat'],['court13',-240,60,0x7a6a4a,'Tribunal'],['gend13',240,-80,0x22427a,'Gendarmerie']].forEach(([id,x,z,c,l])=>{
    addSpot(x,z,id,c,l);});
  addSpot(PR.x,PR.z,'prison13',0x888e96,'Prison');/* v22 : architecture dans batiments22.js */
};
const _os=openSpot;openSpot=function(id){
  if(id==='comm13'||id==='gend13'){const t=fineTot();openPanel(id==='comm13'?'Commissariat':'Gendarmerie','Casier : '+S.rec+' condamnation(s) · Recherché : '+(S.heat>0?'★'.repeat(Math.ceil(S.heat)):'non')+' · Amendes dues : '+fmt(t)+'.',[
    {label:'Payer toutes les amendes · '+fmt(t),off:!t||state.cash+state.bank<t,fn:()=>{if(pay(t,'Amendes')){S.fines=[];sv();toast('Amendes réglées.','good');closePanel();}}},
    {label:'Se rendre (peine réduite de moitié)',off:S.heat<=0,fn:()=>{arrest();S.jail=Math.round(S.jail/2);}},
    {label:'Rejoindre les forces de l’ordre',fn:()=>{closePanel();openSpot('job');}}]);return;}
  if(id==='court13'){openPanel('Tribunal','Justice de Port-Aurore. Casier : '+S.rec+' · Amendes : '+fmt(fineTot())+'.',[
    {label:'Contester une amende · avocat $60',off:!S.fines.length||state.cash+state.bank<60,fn:()=>{if(!pay(60,'Avocat'))return;const f=S.fines[0];if(Math.random()<.5){S.fines.shift();toast('Le juge annule : '+f.l,'good');}else toast('Contestation rejetée.','warn');sv();openSpot('court13');}},
    {label:'Réhabilitation (efface le casier) · $300',off:S.rec<1||S.inf>=50||state.cash+state.bank<300,fn:()=>{if(pay(300,'Réhabilitation')){S.rec=0;S.inf=Math.max(0,S.inf-20);sv();toast('Casier effacé.','good');closePanel();}}}]);return;}
  if(id==='prison13'){
    if(S.jail<=0){openPanel('Prison','Aucun détenu. Reste dans le droit chemin.',[{label:'Fermer',fn:closePanel}]);return;}
    const j=Math.ceil(S.jail);openPanel('Prison','Peine restante : '+j+' s.',[
      {label:'Travailler à la buanderie (−10 s, +$5)',fn:()=>{S.jail=Math.max(1,S.jail-10);state.cash+=5;openSpot('prison13');}},
      {label:'Avocat · $150 (peine −50 %)',off:S.lawyer||state.cash+state.bank<150,fn:()=>{if(pay(150,'Avocat')){S.jail=Math.ceil(S.jail/2);S.lawyer=1;openSpot('prison13');}}},
      {label:'Payer la caution · '+fmt(j*4),off:state.cash+state.bank<j*4,fn:()=>{if(pay(j*4,'Caution')){S.jail=.1;closePanel();}}}]);return;}
  _os(id);
};
// applis téléphone
const mkb=(b,t,f)=>b.appendChild(mk('button','pbtn',t,f)),rf=()=>phOpen(phApp);
function appJustice(b){
  const c=mk('div','bigc');c.appendChild(mk('small',null,'Recherché'));c.appendChild(mk('b',null,S.heat>0?'★'.repeat(Math.ceil(S.heat)):'Aucune recherche'));
  c.appendChild(mk('span',null,'Notoriété : '+INF[lv(S.inf,INX)]+' ('+Math.round(S.inf)+') · Casier : '+S.rec+' · Arrestations : '+S.arr));b.appendChild(c);
  if(S.jail>0)b.appendChild(mk('div','prow','En prison : '+Math.ceil(S.jail)+' s'));
  if(ev)b.appendChild(mk('div','prow','Événement : '+ev.n+' · '+Math.ceil(ev.t)+' s'));
  S.fines.forEach((f,i)=>{const x=mk('button','prow',null,()=>{if(pay(f.a,f.l)){S.fines.splice(i,1);sv();rf();}});x.appendChild(mk('b',null,f.l));x.appendChild(mk('span',null,fmt(f.a)+' · payer'));b.appendChild(x);});
  if(!S.fines.length)b.appendChild(mk('p','dim','Aucune amende. Commissariat et tribunal à l’ouest, gendarmerie et prison à l’est.'));
}
function appOrgs(b){
  b.appendChild(mk('p','dim','Une organisation à la fois. Les gangs proposent des missions criminelles fictives : argent sale, risque d’arrestation.'));
  ORG.forEach(o=>{const mine=S.org===o[0],r=S.rep[o[0]]||0,x=mk('button','prow'+(mine?' hot':''),null,()=>{if(mine){S.rep[o[0]]=Math.floor(r/2);S.org=null;}else{if(o[2]==='legal'&&!pay(100,'Cotisation'))return;S.org=o[0];}sv();rf();});
    x.appendChild(mk('b',null,o[1]+(o[2]==='gang'?' · gang':'')));x.appendChild(mk('span',null,(mine?'Quitter · ':'Rejoindre · ')+RK[orgRk(o[0])]+' ('+r+')'));b.appendChild(x);});
  if(S.org&&org(S.org)[2]==='gang'){b.appendChild(mk('p','dim','Missions :'));CR.forEach(c=>{const q=mk('button','pbtn',c[0]+' · ~'+fmt(c[1]),()=>startCrime(c));q.disabled=!!mission;b.appendChild(q);});}
  else if(S.org==='syndicat')b.appendChild(mk('p','dim','Avantage : salaires +10 %.'));
  else if(S.org==='chambre')b.appendChild(mk('p','dim','Avantage : bénéfices des entreprises +10 %.'));
}
function appGest(b){
  const own=walletP58.businesses;if(!own.length){b.appendChild(mk('p','dim','Achète une entreprise (appli Entreprises) pour la gérer.'));return;}
  b.appendChild(mk('p','dim','Demande liée à tes prix : ×'+priceF().toFixed(2)+'. Employé : +15 % de bénéfice, 8 $/jour. Sans stock : ventes ×0,3.'));
  own.forEach(id=>{const e=ECON.businesses.find(x=>x.id===id);if(!e)return;const z=bz(id);b.appendChild(mk('div','prow',e.name+' · employés '+z.staff+'/3 · stock '+z.stock+' %'));
    mkb(b,'Embaucher · $500',()=>{if(z.staff<3&&pay(500,'Embauche')){z.staff++;sv();rf();}});
    mkb(b,'Licencier',()=>{if(z.staff>0){z.staff--;sv();rf();}});
    mkb(b,'Réapprovisionner · $120',()=>{if(z.stock<100&&pay(120,'Stock')){z.stock=100;sv();rf();}});});
}
APPS.push(['Justice','⚖️','#5b6b8c,#2d3752',appJustice],['Organisations','🕶️','#555a66,#15181d',appOrgs],['Gestion','🏪','#58d68d,#27754d',appGest]);
// boucle : prison, recherche, arrestations, amendes, événements
const _u=update;update=function(dt){
  _u(dt);if(!started)return;
  if(S.jail>0){
    S.jail-=dt;if(player.car)exitCar();if(Math.hypot(player.x-PR.x,player.z-PR.z)>9){player.x=PR.x;player.z=PR.z;}
    if((jt-=dt)<=0){jt=12;toast('Prison : '+Math.ceil(S.jail)+' s restantes.');}
    if(S.jail<=0){S.jail=0;player.x=PR.x;player.z=PR.z+22;sv();toast('Libéré. Reste dans le droit chemin.','good');}
    return;
  }
  if(S.heat>0){
    hot+=dt;S.heat=Math.max(0,S.heat-dt/(45+10*lv(S.inf,INX)));
    if(S.heat>=2&&cars.filter(c=>c.hc).length<3&&(pen-=dt)<=0){pen=18;const f=NODES.filter(q=>{const d=Math.hypot(q.x-player.x,q.z-player.z);return d>45&&d<95;}),n=pick(f.length?f:NODES),c=p4service(n.x,n.z,'police');c.hc=true;}
    if(polNear(28)&&Math.random()<dt*.25*Math.ceil(S.heat)*em('arrest'))arrest();else if(hot>40&&S.heat>=3)arrest();
  }else if(cars.some(c=>c.hc))clearHc();
  if(fineTot()>=300&&S.heat<1){S.heat=1;toast('Mandat : amendes impayées.','warn');}
  if(player.car&&(sc-=dt)<=0&&Math.abs(player.car.v)>player.car.top*.95&&polNear(35)&&!(player.car.company&&COPS.includes(state.job))){sc=25;fine('Excès de vitesse',60);}
  evT-=dt;
  if(ev){ev.t-=dt;if(ev.m.fun)state.fun=Math.min(100,state.fun+dt*.2);if(ev.t<=0){ev=null;evT=rand(90,170);}}
  else if(evT<=0){const e=pick(EV);ev={n:e[0],t:e[1],m:e[2]};toast('Événement : '+e[0]+' — '+e[3],'warn');}
};
const _rs=resetProgress;resetProgress=function(){_rs();S={heat:0,inf:0,rep:{},org:null,jail:0,rec:0,fines:[],dirty:0,arr:0,biz:{},lawyer:0};ev=null;clearHc();sv();};
})();
