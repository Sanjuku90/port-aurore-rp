'use strict';
/* ---------- v23 : nouveau système de chantier ----------
   - 9 terrains au front nord (petits, moyens, grands), 6 bâtiments : maison, villa, duplex, commerce, entrepôt, immeuble à louer.
   - Équipe à engager : architecte, ingénieur structure, maçons (1 à 4), électricien, plombier, chacun avec 3 niveaux.
   - Engins à louer et animés : grue à tour (rotation, chariot, levage de charges), pelleteuse (cycle de creusage), camion toupie (toupie qui tourne, coulage).
   - 6 phases visibles : plans, terrassement, fondations, gros œuvre étage par étage, réseaux, façade et finitions (du haut vers le bas).
   - Une fois livré : arrivée des locataires, loyers versés en banque toutes les 6 h de jeu.
   Remplace l'affichage et la logique des chantiers v11 (construction.js garde le mobilier et pay11). */

const SIZE23={
  S:{label:'Petit',w:16,d:16,k:1},
  M:{label:'Moyen',w:26,d:18,k:1.6},
  L:{label:'Grand',w:36,d:18,k:2.3}
};
/* les identifiants des 4 terrains v11 sont conservés pour reprendre les anciennes sauvegardes */
const LOTS23=[
  {id:'lot-remparts',name:'Terrain des Remparts',x:-224,z:-242,size:'M',price:4600},
  {id:'lot-nord-ouest',name:'Terrain des Docks',x:-160,z:-242,size:'M',price:3900},
  {id:'lot-sud-ouest',name:'Terrain des Jardins',x:-96,z:-242,size:'S',price:2800},
  {id:'lot-tilleuls',name:'Terrain des Tilleuls',x:-34,z:-242,size:'S',price:3100},
  {id:'lot-aurore',name:'Îlot Aurore',x:0,z:-242,size:'L',price:9500},
  {id:'lot-marche',name:'Terrain du Marché',x:34,z:-242,size:'S',price:3300},
  {id:'lot-sud-est',name:'Terrain de la Colline',x:96,z:-242,size:'S',price:3600},
  {id:'lot-nord-est',name:'Terrain du Belvédère',x:160,z:-242,size:'M',price:4200},
  {id:'lot-levant',name:'Terrain du Levant',x:224,z:-242,size:'M',price:4800}
];
const TYPES23=[
  {id:'maison',name:'Maison familiale',cat:'Maison',icon:'🏡',sizes:['S','M'],cost:4200,floors:1,fh:3.3,roof:'gable',wall:0xd7c3a5,roofC:0x8b5142,units:1,rent:{S:220,M:290},fw:{S:[9,8],M:[12,9]},
    blurb:'Toit à deux pans, cheminée, jardin.'},
  {id:'villa',name:'Villa contemporaine',cat:'Maison',icon:'🏠',sizes:['S','M'],cost:6800,floors:2,fh:3.1,roof:'flat',villa:true,wall:0xe9e7df,roofC:0x343a40,units:1,rent:{S:340,M:440},fw:{S:[10,9],M:[14,10]},
    blurb:'Deux niveaux, grandes baies, toit-terrasse.'},
  {id:'duplex',name:'Duplex urbain',cat:'Maison',icon:'🏘️',sizes:['S','M'],cost:5400,floors:2,fh:3.1,roof:'flat',wall:0xc88661,roofC:0x4a5260,units:2,rent:{S:300,M:380},fw:{S:[10,9],M:[13,10]},
    blurb:'Deux logements superposés à louer.'},
  {id:'commerce',name:'Commerce',cat:'Commerce',icon:'🏪',sizes:['S','M'],cost:7500,floors:2,fh:3.1,shop:true,roof:'flat',wall:0xe8d9bd,roofC:0x3b4148,units:1,rent:{S:420,M:650},fw:{S:[12,10],M:[20,12]},
    blurb:'Vitrine, store banne et enseigne du locataire.'},
  {id:'entrepot',name:'Entrepôt',cat:'Entrepôt',icon:'🏭',sizes:['M','L'],cost:6500,warehouse:true,H:7.2,wall:0xa9b4bd,roofC:0x6f7b85,units:1,rent:{M:560,L:820},fw:{M:[20,12],L:[30,13]},
    blurb:'Charpente métallique, bardage, portes sectionnelles.'},
  {id:'immeuble',name:'Immeuble à louer',cat:'Immeuble',icon:'🏢',sizes:['M','L'],cost:11000,floors:{M:5,L:7},fh:3.1,roof:'flat',balcony:true,wall:0xd9c9b0,roofC:0x3b4148,units:{M:10,L:14},rent:{M:750,L:1050},fw:{M:[20,12],L:[28,12]},
    blurb:'Logements avec balcons, hall d’entrée, toit technique.'}
];
const ROLES23=[
  {id:'architecte',name:'Architecte',icon:'📐',shirt:0x2f5e9e,helmet:0xf4f4f4,tiers:[700,1300,2200]},
  {id:'ingenieur',name:'Ingénieur structure',icon:'🧮',shirt:0xeeeeea,helmet:0xffffff,tiers:[650,1150,1900]},
  {id:'electricien',name:'Électricien',icon:'⚡',shirt:0xf0c419,helmet:0x2b6cd1,tiers:[420,780,1250]},
  {id:'plombier',name:'Plombier',icon:'🔧',shirt:0x2a77c9,helmet:0x2b6cd1,tiers:[420,780,1250]}
];
const MASON23={price:380,max:4,shirt:0xff8a1f,helmet:0xffc107};
const TIER23=['Junior','Confirmé','Expert'],SKILL23=[1,1.4,1.9],QUAL23=[1,1.12,1.25];
const ENG23=[
  {id:'pelleteuse',name:'Pelleteuse',icon:'🚜',price:650,leave:3,use:'Terrassement'},
  {id:'toupie',name:'Camion toupie',icon:'🚛',price:780,leave:4,use:'Fondations'},
  {id:'grue',name:'Grue à tour',icon:'🏗️',price:1500,leave:6,use:'Gros œuvre'}
];
const PH23=[
  {id:'plans',name:'Plans & permis',short:'Plans',t:14,need:['architecte']},
  {id:'terrassement',name:'Terrassement',short:'Terrass.',t:20,need:['ingenieur','pelleteuse']},
  {id:'fondations',name:'Fondations',short:'Fondations',t:20,need:['macon','toupie']},
  {id:'structure',name:'Gros œuvre',short:'Gros œuvre',t:42,need:['macon','ingenieur','grue']},
  {id:'reseaux',name:'Électricité & plomberie',short:'Réseaux',t:26,need:['electricien','plombier']},
  {id:'finitions',name:'Façade & finitions',short:'Finitions',t:30,need:['macon','architecte']}
];
const SURN23=['Mensah','Diallo','Laurent','Kouassi','Moreau','Traoré','Bernard','Amegah','Petit','Agbeko','Fontaine','Sow','Girard','Adjovi','Lefèvre','Koné'];
const SHOPS23=['Boulangerie Lumière','Épicerie du Phare','Salon Aurore','Pharmacie des Docks','Café des Tilleuls','Librairie Marée','Optique du Port','Fleurs & Sel'];
const DEPOTS23=['Logistique du Port','Transports Mouette','Stock & Co','Frigo Atlantique','Aurore Fret','Docks Express'];

const type23=id=>TYPES23.find(t=>t.id===id)||TYPES23[0];
const lot23=id=>LOTS23.find(l=>l.id===id);
const val23=(v,size)=>(v&&typeof v==='object')?v[size]:v;
const engDef23=id=>ENG23.find(e=>e.id===id);
const roleDef23=id=>ROLES23.find(r=>r.id===id);
const price23=(base,s)=>Math.round(base*SIZE23[s.size].k/10)*10;
const matCost23=(t,size)=>Math.round(t.cost*SIZE23[size].k/10)*10;
const units23=s=>val23(type23(s.type).units,s.size)||1;
const floors23=s=>{const t=type23(s.type);return t.warehouse?1:val23(t.floors,s.size)||1;};

/* ===== état sauvegardé (dans l'économie v5-8) ===== */
function ensure23(){
  if(!walletP58.ch23||typeof walletP58.ch23!=='object')walletP58.ch23={sites:[],nextRent:0,nextTen:0,rentTotal:0};
  const D=walletP58.ch23;
  if(!Array.isArray(D.sites))D.sites=[];
  if(!Array.isArray(walletP58.lots))walletP58.lots=[];
  if(!Array.isArray(walletP58.projects))walletP58.projects=[];
  if(!D.nextRent)D.nextRent=gameMin+360;
  if(!D.nextTen)D.nextTen=gameMin+60;
  /* reprise des chantiers v11 : l'équipe et la grue étaient déjà payées */
  if(walletP58.projects.length){
    walletP58.projects.forEach(p=>{
      if(!p||D.sites.some(s=>s.lotId===p.lotId)||!lot23(p.lotId))return;
      const st=type23(p.styleId).id,s=newSite23(p.lotId,st);
      s.crew={architecte:0,ingenieur:0,electricien:0,plombier:0,macons:2};s.eng={pelleteuse:1,toupie:1,grue:1};
      s.names={architecte:nm23(),ingenieur:nm23(),electricien:nm23(),plombier:nm23()};s.mnames=[nm23(),nm23()];
      if(p.complete){s.phase=6;s.prog=0;s.done=true;s.eng={pelleteuse:2,toupie:2,grue:2};}
      else{s.phase=Math.min(5,[0,3,4,5][Math.max(0,Math.min(3,p.stage||0))]);}
      D.sites.push(s);
    });
    walletP58.projects=[];
  }
  D.sites.forEach(s=>{
    s.crew=Object.assign({architecte:-1,ingenieur:-1,electricien:-1,plombier:-1,macons:0},s.crew||{});
    s.eng=Object.assign({pelleteuse:0,toupie:0,grue:0},s.eng||{});
    s.names=s.names||{};s.mnames=Array.isArray(s.mnames)?s.mnames:[];s.tl=Array.isArray(s.tl)?s.tl:[];
    if(!(s.phase>=0))s.phase=0;if(!(s.prog>=0))s.prog=0;if(!(s.earned>=0))s.earned=0;if(!(s.tenants>=0))s.tenants=0;
    if(!s.size){const l=lot23(s.lotId);s.size=l?l.size:'S';}
  });
  return D;
}
function nm23(){return pick(NAMES)+' '+pick(SURN23);}
function newSite23(lotId,typeId){const l=lot23(lotId);return{id:'site-'+Date.now().toString(36)+Math.floor(Math.random()*1e4),lotId,type:typeId,size:l?l.size:'S',phase:0,prog:0,
  crew:{architecte:-1,ingenieur:-1,electricien:-1,plombier:-1,macons:0},eng:{pelleteuse:0,toupie:0,grue:0},names:{},mnames:[],done:false,tenants:0,tl:[],earned:0,start:Math.floor(gameMin)};}
const site23=lotId=>(walletP58.ch23&&walletP58.ch23.sites||[]).find(s=>s.lotId===lotId);

/* ===== rythme des travaux ===== */
function work23(s,ph){
  const t=type23(s.type),k=Math.pow(SIZE23[s.size].k,0.8);let f=1;
  if(ph===3)f=t.warehouse?1.3:Math.max(0.8,floors23(s)/2);
  if(ph===5&&t.shop)f=1.2;
  if(ph===4&&floors23(s)>2)f=1+floors23(s)*0.08;
  return PH23[ph].t*k*f;
}
function missing23(s,ph){
  const out=[];if(ph>5)return out;
  PH23[ph].need.forEach(n=>{
    if(n==='macon'){if(!(s.crew.macons>0))out.push('maçon');}
    else if(engDef23(n)){if(s.eng[n]!==1)out.push(engDef23(n).name.toLowerCase());}
    else if(!(s.crew[n]>=0))out.push(roleDef23(n).name.toLowerCase());
  });
  return out;
}
function rate23(s,ph){
  if(missing23(s,ph).length)return 0;
  const sk=r=>s.crew[r]>=0?SKILL23[s.crew[r]]:0,m=s.crew.macons||0,A=sk('architecte'),E=sk('ingenieur'),El=sk('electricien'),Pl=sk('plombier');
  switch(ph){
    case 0:return 0.75*A+0.2*E;
    case 1:return 0.7+0.3*E;
    case 2:return (0.45+0.25*m)*(E?0.85+0.15*E:0.85);
    case 3:return (0.35+0.28*m)*Math.sqrt(E);
    case 4:return (El+Pl)/2.4;
    case 5:return (0.4+0.22*m)*(0.75+0.25*A);
  }
  return 0;
}
/* estimation du temps restant (s) avec l'équipe actuelle; null si une phase future est sans équipe */
function eta23(s){
  if(s.done)return 0;let t=0,ok=true;
  for(let ph=s.phase;ph<6;ph++){const r=rate23(s,ph),w=work23(s,ph)*(ph===s.phase?1-s.prog:1);if(r>0)t+=w/r;else{ok=false;t+=w;}}
  return{t,ok};
}
function pct23(s){if(s.done)return 100;let tot=0,done=0;for(let ph=0;ph<6;ph++){const w=work23(s,ph);tot+=w;if(ph<s.phase)done+=w;else if(ph===s.phase)done+=w*s.prog;}return Math.min(99,Math.floor(done/tot*100));}
function rentDay23(s){const t=type23(s.type),q=QUAL23[Math.max(0,s.crew.architecte)]||1;return Math.round(val23(t.rent,s.size)*q*(s.tenants/units23(s)));}
function rentMax23(s){const t=type23(s.type),q=QUAL23[Math.max(0,s.crew.architecte)]||1;return Math.round(val23(t.rent,s.size)*q);}
function totalRent23(){return (walletP58.ch23?walletP58.ch23.sites:[]).reduce((a,s)=>a+(s.done?rentDay23(s):0),0);}
const funds23=()=>state.cash+state.bank;
const mins23=sec=>{sec=Math.max(0,Math.round(sec));const m=Math.floor(sec/60),r=sec%60;return m?m+' min '+String(r).padStart(2,'0'):r+' s';};

/* ===== avancement (appelé chaque image) ===== */
function advance23(s,sec){
  let guard=0;
  while(sec>0&&!s.done&&guard++<12){
    const ph=s.phase,r=rate23(s,ph);
    if(r<=0){s.idle=(s.idle||0)+sec;if(s.idle>18&&s.warned!==ph){s.warned=ph;const l=lot23(s.lotId);toast('Chantier à l’arrêt ('+(l?l.name:'')+') : il manque '+missing23(s,ph).join(', ')+'.','warn');}return;}
    s.idle=0;const w=work23(s,ph),need=(1-s.prog)*w/r;
    if(sec<need){s.prog+=sec*r/w;return;}
    sec-=need;s.prog=0;s.phase++;phaseDone23(s,ph);
  }
}
function phaseDone23(s,ph){
  const l=lot23(s.lotId),n=l?l.name:'chantier';
  ENG23.forEach(e=>{if(s.eng[e.id]===1&&s.phase>=e.leave){s.eng[e.id]=2;}});
  if(s.phase>=6){
    s.done=true;s.phase=6;s.prog=0;ENG23.forEach(e=>{if(s.eng[e.id])s.eng[e.id]=2;});
    toast('🎉 '+type23(s.type).name+' livré sur le '+n+' ! Les premiers locataires visitent.','good');
    if(typeof econTxP58==='function')econTxP58('Livraison · '+type23(s.type).name,0,'Chantier');
  }else toast('Chantier '+n+' · '+PH23[ph].name+' terminé. Suite : '+PH23[s.phase].name.toLowerCase()+'.','good');
  saveEconomyP58();
}
let lastMin23=null;
function tick23(dt){
  if(!started)return;const D=ensure23();
  /* temps sauté (sommeil, taxi…) : les équipes travaillent aussi pendant ce temps */
  let extra=0;if(lastMin23!=null){const gap=gameMin-lastMin23-dt*0.4;if(gap>5)extra=Math.min(900,gap/0.4);}lastMin23=gameMin;
  let active=0;
  D.sites.forEach(s=>{if(s.done)return;const before=s.phase;advance23(s,dt+extra);if(!s.done)active++;});
  if(extra>60&&active)toast('Pendant ton absence, les chantiers ont avancé.','good');
  /* locataires (chaque heure de jeu) */
  let g=0;
  while(gameMin>=D.nextTen&&g++<30){
    D.nextTen+=60;
    D.sites.forEach(s=>{
      if(!s.done)return;const u=units23(s);
      for(let i=s.tenants;i<u;i++){if(Math.random()<0.4){s.tenants++;s.tl.push(tenantName23(s));if(s.tenants===1)toast('Premier locataire au '+(lot23(s.lotId)||{}).name+' : '+s.tl[s.tl.length-1]+'.','good');else if(s.tenants===u)toast((lot23(s.lotId)||{}).name+' : complet, '+u+'/'+u+' loué'+(u>1?'s':'')+'.','good');}}
    });
  }
  /* loyers (toutes les 6 h de jeu, versés en banque) */
  g=0;
  while(gameMin>=D.nextRent&&g++<12){
    D.nextRent+=360;let tot=0,n=0;
    D.sites.forEach(s=>{if(!s.done)return;const a=Math.round(rentDay23(s)/4);if(a>0){s.earned+=a;tot+=a;n++;}});
    if(tot>0){econCreditP58(tot,'Loyers · '+n+' bâtiment'+(n>1?'s':''),true);D.rentTotal=(D.rentTotal||0)+tot;toast('Loyers encaissés : +'+fmt(tot)+' en banque.','good');}
  }
}
function tenantName23(s){const t=type23(s.type);
  if(t.shop)return pick(SHOPS23.filter(n=>!s.tl.includes(n)))||pick(SHOPS23);
  if(t.warehouse)return pick(DEPOTS23);
  if(t.id==='maison'||t.id==='villa')return 'Famille '+pick(SURN23);
  return pick(NAMES)+' '+pick(SURN23);}

/* ===== actions du joueur ===== */
function buyLot23(l){
  if(walletP58.lots.includes(l.id))return;
  if(!pay11(l.price,'Achat terrain · '+l.name)){toast('Il te faut '+fmt(l.price)+' (cash + banque).','warn');return;}
  walletP58.lots.push(l.id);saveEconomyP58();toast(l.name+' acheté. Choisis le bâtiment à construire.','good');refreshLot23(l.id);
}
function startSite23(l,t){
  if(site23(l.id))return;const c=matCost23(t,l.size);
  if(!pay11(c,'Matériaux · '+t.name)){toast('Fonds insuffisants pour les matériaux ('+fmt(c)+').','warn');return;}
  const s=newSite23(l.id,t.id);ensure23().sites.push(s);saveEconomyP58();refreshLot23(l.id);
  toast('Projet lancé : engage un·e architecte pour démarrer les plans.','good');return s;
}
function hireRole23(s,rid,tier){
  if(s.crew[rid]>=0||s.done)return;const r=roleDef23(rid),p=price23(r.tiers[tier],s);
  if(!pay11(p,'Contrat · '+r.name+' '+TIER23[tier])){toast('Fonds insuffisants ('+fmt(p)+').','warn');return false;}
  s.crew[rid]=tier;s.names[rid]=nm23();saveEconomyP58();rebuildCrew23(s);toast(s.names[rid]+' rejoint le chantier ('+r.name.toLowerCase()+').','good');return true;
}
function hireMason23(s){
  if(s.crew.macons>=MASON23.max||s.done)return;const p=price23(MASON23.price,s);
  if(!pay11(p,'Contrat · maçon')){toast('Fonds insuffisants ('+fmt(p)+').','warn');return false;}
  s.crew.macons++;s.mnames.push(nm23());saveEconomyP58();rebuildCrew23(s);toast(s.mnames[s.mnames.length-1]+' arrive avec sa truelle.','good');return true;
}
function rentEng23(s,id){
  const e=engDef23(id);if(s.eng[id]||s.done||s.phase>=e.leave)return;const p=price23(e.price,s);
  if(!pay11(p,'Location · '+e.name)){toast('Fonds insuffisants ('+fmt(p)+').','warn');return false;}
  s.eng[id]=1;saveEconomyP58();rebuildEng23(s);toast(e.name+' livrée sur le chantier.','good');return true;
}
/* équipe standard : ce qui manque, au niveau confirmé, + 2 maçons et les engins encore utiles */
function teamPlan23(s){
  const items=[];
  ROLES23.forEach(r=>{if(!(s.crew[r.id]>=0))items.push({k:'role',id:r.id,tier:1,p:price23(r.tiers[1],s)});});
  for(let i=s.crew.macons;i<2;i++)items.push({k:'mason',p:price23(MASON23.price,s)});
  ENG23.forEach(e=>{if(!s.eng[e.id]&&s.phase<e.leave)items.push({k:'eng',id:e.id,p:price23(e.price,s)});});
  return items;
}
function hireTeam23(s){
  const items=teamPlan23(s),tot=items.reduce((a,b)=>a+b.p,0);
  if(!items.length)return;if(funds23()<tot){toast('Il faut '+fmt(tot)+' pour l’équipe complète.','warn');return;}
  items.forEach(it=>{if(it.k==='role')hireRole23(s,it.id,it.tier);else if(it.k==='mason')hireMason23(s);else rentEng23(s,it.id);});
}

/* ===================== 3D : outils ===================== */
const Y23=0.22;               /* dessus du sol des terrains */
const SLAB23=0.45;            /* épaisseur du radier */
const MC23={};
function mat23(c,o){const k=c+'|'+(o?JSON.stringify(o):'');if(!MC23[k])MC23[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.82,metalness:.04},o||{}));return MC23[k];}
const VC23={};
function vmat23(tint,o){const k=tint+'|'+(o?JSON.stringify(o):'');if(!VC23[k])VC23[k]=new THREE.MeshStandardMaterial(Object.assign({vertexColors:true,color:tint,roughness:.8,metalness:.05},o||{}));return VC23[k];}
function bx23(par,w,h,d,x,y,z,m,ry){const o=new THREE.Mesh(UBX,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(ry)o.rotation.y=ry;o.castShadow=true;o.receiveShadow=true;par.add(o);return o;}
function cy23(par,r,h,x,y,z,m,seg,r2){const o=new THREE.Mesh(new THREE.CylinderGeometry(r2==null?r:r2,r,h,seg||12),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;par.add(o);return o;}
/* géométrie fusionnée à couleurs de sommets (un seul appel de dessin) */
function MG23(){this.p=[];}
MG23.prototype.b=function(w,h,d,x,y,z,c,rx,ry,rz){if(w<=0.001||h<=0.001||d<=0.001)return this;this.p.push(pp(UBX,x,y,z,c==null?0xffffff:c,w,h,d,rx||0,ry||0,rz||0));return this;};
MG23.prototype.c=function(r,h,x,y,z,c,seg,rx,rz,r2){this.p.push(pp(new THREE.CylinderGeometry(r2==null?r:r2,r,h,seg||8),x,y,z,c==null?0xffffff:c,1,1,1,rx||0,0,rz||0));return this;};
/* barre entre deux points (treillis de grue, haubans) */
MG23.prototype.bar=function(a,b,t,c){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz);if(L<1e-4)return this;
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx/L,dy/L,dz/L));
  const m=new THREE.Matrix4().compose(new THREE.Vector3((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),q,new THREE.Vector3(t,L,t));this.p.push({g:UBX,m,c:c==null?0xffffff:c});return this;};
MG23.prototype.mesh=function(m,par,shadow){if(!this.p.length)return null;const o=new THREE.Mesh(mergeParts(this.p),m);o.castShadow=shadow!==false;o.receiveShadow=true;o.userData.own23=true;if(par)par.add(o);return o;};
function prism23(w,h,d){/* toit à deux pans : faîtage selon x */
  const s=new THREE.Shape();s.moveTo(-d/2,0);s.lineTo(d/2,0);s.lineTo(0,h);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:w,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(-w/2,0,0);g.computeVertexNormals();return g;}
function canvasTex23(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
function board23(par,lines,w,h,x,y,z,o){
  o=o||{};const tex=canvasTex23(512,Math.round(512*h/w),(g,W,H)=>{
    g.fillStyle=o.bg||'#f4f1e8';g.fillRect(0,0,W,H);
    if(o.band){g.fillStyle=o.band;g.fillRect(0,0,W,H*0.26);}
    let yy=o.band?H*0.13:H*0.16;
    lines.forEach((l,i)=>{const big=i===0;g.fillStyle=big&&o.band?(o.bandFg||'#111'):(o.fg||'#1d2228');
      g.font=(big?'700 ':'600 ')+Math.round(H*(big?0.15:0.095))+'px Rajdhani, Arial Narrow, sans-serif';g.textAlign='center';g.textBaseline='middle';
      g.fillText(l,W/2,yy);yy+=big?H*(o.band?0.26:0.24):H*0.14;});
    g.strokeStyle=o.edge||'rgba(0,0,0,.35)';g.lineWidth=6;g.strokeRect(3,3,W-6,H-6);
  });
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.7}));m.position.set(x,y,z);par.add(m);
  m.material.userData.own23=true;bx23(par,w+0.1,h+0.1,0.06,x,y,z-0.04,mat23(0x30363c));
  return m;
}
let ribTex23=null,shutTex23=null,awnTex23=null;
function texRibs23(){if(!ribTex23){ribTex23=canvasTex23(256,256,(g,W,H)=>{g.fillStyle='#e8ecef';g.fillRect(0,0,W,H);for(let i=0;i<16;i++){const x=i*W/16;const gr=g.createLinearGradient(x,0,x+W/16,0);gr.addColorStop(0,'#c9cfd4');gr.addColorStop(.35,'#ffffff');gr.addColorStop(.7,'#b6bdc3');gr.addColorStop(1,'#d5dadf');g.fillStyle=gr;g.fillRect(x,0,W/16,H);}});}return ribTex23;}
function texShutter23(){if(!shutTex23){shutTex23=canvasTex23(128,256,(g,W,H)=>{g.fillStyle='#b9c0c6';g.fillRect(0,0,W,H);for(let y=0;y<H;y+=16){g.fillStyle='#8f979e';g.fillRect(0,y,W,3);g.fillStyle='#d3d8dc';g.fillRect(0,y+3,W,2);}g.fillStyle='#ffc23d';g.fillRect(0,H-14,W,14);});}return shutTex23;}
function texAwning23(){if(!awnTex23){awnTex23=canvasTex23(256,64,(g,W,H)=>{for(let i=0;i<8;i++){g.fillStyle=i%2?'#f4efe4':'#1f6f6a';g.fillRect(i*W/8,0,W/8,H);}});awnTex23.wrapS=THREE.RepeatWrapping;}return awnTex23;}
function disposeTree23(o){if(!o)return;o.traverse(c=>{if(c.isMesh){if(c.geometry&&c.geometry!==UBX)c.geometry.dispose();const m=c.material;if(m&&m.userData&&m.userData.own23){if(m.map)m.map.dispose();m.dispose();}}});if(o.parent)o.parent.remove(o);}

/* ===================== terrains ===================== */
const RT23={lots:{},sites:{}};
function lotLocal23(l){const S=SIZE23[l.size];return{W:S.w,D:S.d,hw:S.w/2,hd:S.d/2};}
function buildLot23(l){
  const old=RT23.lots[l.id];if(old){disposeTree23(old.g);}
  const own=walletP58.lots.includes(l.id),s=site23(l.id),{W,D,hw,hd}=lotLocal23(l),g=new THREE.Group();g.position.set(l.x,0,l.z);scene.add(g);
  const ground=bx23(g,W,0.2,D,0,Y23-0.1,0,mat23(s?0x8a7f6b:own?0x9aa070:0xc9b98d));ground.castShadow=false;
  const curb=new MG23();[[W+0.5,0.3,0.25,0,0.15,hd+0.12],[W+0.5,0.3,0.25,0,0.15,-hd-0.12],[0.25,0.3,D,hw+0.12,0.15,0],[0.25,0.3,D,-hw-0.12,0.15,0]].forEach(a=>curb.b(...a,0xb8bcc0));curb.mesh(vmat23(0xffffff),g,false);
  if(!s){
    /* bornes de géomètre aux angles */
    const st=new MG23();[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>{st.b(0.12,0.9,0.12,a*(hw-0.4),Y23+0.45,b*(hd-0.4),0xf1f1ee);st.b(0.14,0.18,0.14,a*(hw-0.4),Y23+0.82,b*(hd-0.4),own?0x4fb58a:0xff6b2b);});st.mesh(vmat23(0xffffff),g);
    const sz=SIZE23[l.size];
    board23(g,own?['TERRAIN PRIVÉ',l.name,'Propriété de '+state.name]:['À VENDRE',l.name,sz.label+' · '+sz.w+' × '+sz.d+' m · '+fmt(l.price)],3.4,2.1,hw-3.2,2.1,hd-0.6,{band:own?'#4fb58a':'#ffc23d',bandFg:'#14181c'});
    const posts=new MG23();[-1.2,1.2].forEach(dx=>posts.b(0.1,2.6,0.1,hw-3.2+dx,1.3,hd-0.68,0x5a6168));posts.mesh(vmat23(0xffffff),g);
  }
  RT23.lots[l.id]={g};
}
function spotFor23(l){const {hw,hd}=lotLocal23(l);return{x:l.x-hw+1.6,z:l.z+hd+1.7};}
function spotLabel23(l){const s=site23(l.id);if(!walletP58.lots.includes(l.id))return 'Terrain à vendre · '+l.name;if(!s)return 'Mon terrain · '+l.name;if(s.done)return type23(s.type).name+' · '+l.name;return 'Chantier · '+l.name;}
function refreshLot23(id){
  const l=lot23(id);if(!l||!scene)return;buildLot23(l);
  const sp=spots.find(q=>q.id==='lot23:'+id);if(sp)sp.label=spotLabel23(l);
  const s=site23(id);if(s){if(!RT23.sites[s.id])buildSite23(s);}
  if(typeof refreshUI23==='function')refreshUI23(true);
}

/* ===================== bâtiment : plan et pièces ===================== */
const RAW23=0xa3a19a,CONC23=0x8f9394,GLASS23=new THREE.MeshStandardMaterial({color:0x86b8c8,roughness:.12,metalness:.35,transparent:true,opacity:.72});
const CORE_D23=new THREE.MeshStandardMaterial({color:0x2a2f36,roughness:1});
const CORE_L23=new THREE.MeshStandardMaterial({color:0x3a3228,emissive:0xffc977,emissiveIntensity:.15,roughness:1});
function plan23(s){
  const t=type23(s.type),[w,d]=t.fw[s.size],l=lot23(s.lotId),{hw,hd}=lotLocal23(l);
  const P={t,w,d,bz:1.0,base:Y23+SLAB23,hw,hd};
  if(t.warehouse){P.n=1;P.H=t.H;P.ridge=1.4;P.nb=Math.max(3,Math.round(w/5));P.bw=w/P.nb;P.top=P.base+P.H+P.ridge;return P;}
  P.n=floors23(s);P.fh=[];P.y0=[];let y=P.base;
  for(let k=0;k<P.n;k++){const h=t.shop&&k===0?4.2:t.fh;P.fh.push(h);P.y0.push(y);y+=h;}
  P.top=y;return P;
}
/* murs d'un étage (coordonnées locales de l'étage, y=0 au plancher) */
function floorParts23(P,k){
  const t=P.t,T=0.25,H=P.fh[k]-0.26,W=new MG23(),G=new MG23(),F=new MG23(),C=new MG23(),w=P.w,d=P.d;
  const sides=[{L:w,ax:'x',p:d/2-T/2,out:1,front:true},{L:w,ax:'x',p:-d/2+T/2,out:-1},{L:d-2*T,ax:'z',p:w/2-T/2,out:1},{L:d-2*T,ax:'z',p:-w/2+T/2,out:-1}];
  const seg=(sd,a,b,y0,y1,M,c,th)=>{if(b-a<0.01||y1-y0<0.01)return;const m=(a+b)/2,th2=th||T;
    if(sd.ax==='x')M.b(b-a,y1-y0,th2,m,(y0+y1)/2,sd.p,c);else M.b(th2,y1-y0,b-a,sd.p,(y0+y1)/2,m,c);};
  const off=(sd,u,y,o,ww,hh,dd,M,c)=>{if(sd.ax==='x')M.b(ww,hh,dd,u,y,sd.p+sd.out*o,c);else M.b(dd,hh,ww,sd.p+sd.out*o,y,u,c);};
  sides.forEach((sd,si)=>{
    const n=Math.max(1,Math.round(sd.L/2.7)),bw=sd.L/n;
    for(let i=0;i<=n;i++){const u=-sd.L/2+bw*i;if(sd.ax==='x')C.b(.38,H,.38,u,H/2,sd.p,CONC23);else if(i>0&&i<n)C.b(.38,H,.38,sd.p,H/2,u,CONC23);}
    for(let i=0;i<n;i++){
      const c=-sd.L/2+bw*(i+.5);let ww=Math.min(1.5,bw*.55),sill=.9,oh=Math.min(1.45,H-1.25),door=false,shop=false;
      if(t.villa&&sd.front){ww=bw*.72;sill=.25;oh=H-.6;}
      if(t.shop&&k===0&&sd.front){ww=bw*.84;sill=.3;oh=H-.75;shop=true;}
      else if(k===0&&sd.front&&i===Math.floor(n/2)&&!t.shop){ww=t.id==='immeuble'?1.9:1.25;sill=0;oh=2.35;door=true;}
      if(t.shop&&k===0&&sd.front&&i===Math.floor(n/2)){/* porte vitrée de la boutique */}
      const a=c-ww/2,b=c+ww/2,u0=c-bw/2,u1=c+bw/2;
      seg(sd,u0,a,0,H,W,0xffffff);seg(sd,b,u1,0,H,W,0xffffff);seg(sd,a,b,0,sill,W,0xffffff);seg(sd,a,b,sill+oh,H,W,0xffffff);
      if(door){seg(sd,a+.06,b-.06,0,oh-.06,F,t.id==='immeuble'?0x2b3a44:0x5a3b28,.1);off(sd,c,oh+.05,.12,ww+.3,.12,.3,F,0xf2eadc);}
      else{seg(sd,a,b,sill,sill+oh,G,0xffffff,.06);
        off(sd,c,sill-.04,.12,ww+.2,.08,.34,F,0xf2eadc);off(sd,c,sill+oh+.04,.06,ww+.12,.08,.2,F,0xf2eadc);
        if(!shop&&!t.villa){off(sd,c,sill+oh/2,.05,.05,oh,.08,F,0xf2eadc);}
        if(t.id==='maison'&&sd.front&&k===0){[-1,1].forEach(q=>off(sd,c+q*(ww/2+.32),sill+oh/2,.16,.55,oh+.1,.06,F,0x3f6b5a));}
      }
      if(t.balcony&&sd.front&&k>0&&i%2===0){off(sd,c,.07,.6,bw*.86,.14,1.2,F,0xd8d4cc);seg(sd,c-bw*.43,c+bw*.43,.15,1.1,G,0xffffff,.05);
        if(sd.ax==='x'){G.p[G.p.length-1].m.premultiply(new THREE.Matrix4().makeTranslation(0,0,1.17));}
        off(sd,c,1.12,1.18,bw*.88,.06,.08,F,0x3a3f45);}
    }
  });
  /* noyau intérieur sombre : fait lire les ouvertures comme des fenêtres */
  C.b(w-2*T-.08,0.02,d-2*T-.08,0,0.01,0,0x55585a);
  return{W,G,F,C,H,core:[w-2*T-.1,H-.05,d-2*T-.1]};
}
function scaffParts23(P,k){
  const S=new MG23(),h=P.fh[k],w=P.w,d=P.d,tube=0x9aa1a8,wood=0xc49a5c;
  const runs=[{ax:'x',L:w+2.2,p:d/2+1.0,pi:d/2+.35},{ax:'z',L:d+1.2,p:w/2+1.0,pi:w/2+.35},{ax:'z',L:d+1.2,p:-w/2-1.0,pi:-w/2-.35}];
  runs.forEach(r=>{const n=Math.max(2,Math.round(r.L/2.2));
    for(let i=0;i<=n;i++){const u=-r.L/2+r.L*i/n;[r.p,r.pi].forEach(pp2=>{if(r.ax==='x')S.b(.06,h,.06,u,h/2,pp2,tube);else S.b(.06,h,.06,pp2,h/2,u,tube);});}
    [0.12,1.05,h-.05].forEach(y=>[r.p,r.pi].forEach(pp2=>{if(r.ax==='x')S.b(r.L,.05,.05,0,y,pp2,tube);else S.b(.05,.05,r.L,pp2,y,0,tube);}));
    const pm=(r.p+r.pi)/2;if(r.ax==='x'){S.b(r.L,.05,.6,0,.06,pm,wood);S.b(r.L,.15,.03,0,.13,r.p+.02,0xff8a1f);}else{S.b(.6,.05,r.L,pm,.06,0,wood);S.b(.03,.15,r.L,r.p+.02*Math.sign(r.p),.13,0,0xff8a1f);}
    /* diagonales */
    for(let i=0;i<n;i+=2){const u0=-r.L/2+r.L*i/n,u1=-r.L/2+r.L*(i+1)/n;if(r.ax==='x')S.bar([u0,0.1,r.p+.04],[u1,h-.1,r.p+.04],.04,tube);else S.bar([r.p+.04*Math.sign(r.p),0.1,u0],[r.p+.04*Math.sign(r.p),h-.1,u1],.04,tube);}
  });
  return S;
}
function roofParts23(P){
  const t=P.t,R=new MG23(),w=P.w,d=P.d,top=P.top-P.base;
  if(t.roof==='gable'){return null;}
  R.b(w+.3,.55,.22,0,top+.27,d/2+.04,0xe9e3d6).b(w+.3,.55,.22,0,top+.27,-d/2-.04,0xe9e3d6).b(.22,.55,d,w/2+.04,top+.27,0,0xe9e3d6).b(.22,.55,d,-w/2-.04,top+.27,0,0xe9e3d6);
  R.b(w-.2,.06,d-.2,0,top+.03,0,0x4b5056);
  if(t.villa){R.b(w*.55,2.4,d*.5,-w*.18,top+1.2,-d*.12,0xe9e7df);R.b(w*.6,.22,d*.6,-w*.18,top+2.5,-d*.12,0x343a40);R.b(w*.35,1.0,.05,w*.22,top+1.0,d/2-.1,0xbfe0ea);}
  else{
    R.b(1.6,.9,1,w/2-2,top+.45,-d/2+1.6,0xb8bec4).b(1.6,.9,1,w/2-4,top+.45,-d/2+1.6,0xb8bec4);
    if(t.id==='immeuble'){R.b(3.2,2.6,3,-w/2+3,top+1.3,-d/2+2.2,0xd2c7b3).b(3.4,.2,3.2,-w/2+3,top+2.7,-d/2+2.2,0x3b4148);R.c(1,1.8,w/2-3,top+1.6,d/2-2.5,0x8a96a0,12);R.b(.12,1.2,.12,w/2-3,top+.6,d/2-2.5,0x5a6168);}
  }
  return R;
}
/* ===================== entrepôt ===================== */
function frameParts23(P,i){
  const x=-P.w/2+i*P.bw,M=new MG23(),R=new MG23(),H=P.H,hd=P.d/2,ang=Math.atan2(P.ridge,hd),L=Math.hypot(hd,P.ridge)+.2,c=0x2f6fb0;
  M.b(.32,H,.45,x,H/2,hd-.22,c).b(.32,H,.45,x,H/2,-hd+.22,c);
  R.b(.28,.42,L,x,H+P.ridge/2,hd/2,c,ang,0,0).b(.28,.42,L,x,H+P.ridge/2,-hd/2,c,-ang,0,0);
  return{M,R};
}
function bayParts23(P,i){
  const x0=-P.w/2+i*P.bw,xc=x0+P.bw/2,S=new MG23(),H=P.H,hd=P.d/2,ang=Math.atan2(P.ridge,hd),st=0x7d8790;
  [1.6,3.6,5.6].forEach(y=>{S.b(P.bw,.12,.12,xc,y,hd-.22,st).b(P.bw,.12,.12,xc,y,-hd+.22,st);});
  [.2,.5,.8].forEach(f=>{const z=hd*f,y=H+P.ridge*(1-f)+.25;S.b(P.bw,.12,.12,xc,y,z,st).b(P.bw,.12,.12,xc,y,-z,st);});
  S.bar([x0,.3,hd-.22],[x0+P.bw,H-.3,hd-.22],.07,st);
  return S;
}
function cladBay23(P,i,par,wallM,roofM,shutM){
  const x0=-P.w/2+i*P.bw,xc=x0+P.bw/2,H=P.H,hd=P.d/2,ang=Math.atan2(P.ridge,hd),L=Math.hypot(hd,P.ridge)+.35,g=new THREE.Group(),bw=P.bw;
  const door=i%2===0&&i<P.nb;
  const mk=(w,h,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,.12),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;};
  if(door){const dw=Math.min(3.8,bw-1.2),dh=4.3;mk((bw-dw)/2,H,x0+(bw-dw)/4,H/2,hd,wallM);mk((bw-dw)/2,H,x0+bw-(bw-dw)/4,H/2,hd,wallM);mk(dw,H-dh,xc,dh+(H-dh)/2,hd,wallM);
    const sh=new THREE.Mesh(new THREE.BoxGeometry(dw,dh,.08),shutM);sh.position.set(xc,dh/2,hd+.02);g.add(sh);
    const fr=new MG23();fr.b(dw+.3,.2,.3,xc,dh+.1,hd+.1,0xffc23d).b(.15,dh,.25,xc-dw/2-.07,dh/2,hd+.08,0xffc23d).b(.15,dh,.25,xc+dw/2+.07,dh/2,hd+.08,0xffc23d);
    fr.c(.12,1,xc-dw/2-.5,.5,hd+.9,0xffc23d,10).c(.12,1,xc+dw/2+.5,.5,hd+.9,0xffc23d,10);fr.mesh(vmat23(0xffffff),g);
  }else mk(bw,H,xc,H/2,hd,wallM);
  mk(bw,H,xc,H/2,-hd,wallM);
  [1,-1].forEach(sg=>{const o=new THREE.Mesh(new THREE.BoxGeometry(bw+.02,.12,L),roofM);o.position.set(xc,H+P.ridge/2+.12,sg*hd/2);o.rotation.x=sg*ang;o.castShadow=true;o.receiveShadow=true;g.add(o);});
  const band=new MG23();band.b(bw,.5,.16,xc,H-.25,hd+.04,0x2f6fb0).b(bw,.5,.16,xc,H-.25,-hd-.04,0x2f6fb0);band.mesh(vmat23(0xffffff),g);
  par.add(g);return g;
}
function gableEnds23(P,par,wallM){
  const g=new THREE.Group(),H=P.H;
  [-1,1].forEach(sg=>{const x=sg*P.w/2;const o=new THREE.Mesh(new THREE.BoxGeometry(.12,H,P.d),wallM);o.position.set(x,H/2,0);o.castShadow=true;g.add(o);
    const tri=new THREE.Mesh(prism23(.12,P.ridge,P.d),wallM);tri.position.set(x,H,0);g.add(tri);});
  const off=new MG23(),ax=-P.w/2-1.3,az=P.d/2-2.4;off.b(2.4,3.2,4,ax,1.6,az,0xe8ecef).b(2.6,.2,4.2,ax,3.3,az,0x2f6fb0).b(.06,1.1,2.6,ax-1.22,1.9,az,0x9cc4d4).b(1,2.1,.06,ax,1.05,az+2.02,0x2b3a44);
  off.mesh(vmat23(0xffffff),g);par.add(g);return g;
}

/* ===================== chantier : construction de la scène ===================== */
function clipMat23(base){const m=base.clone();m.userData.own23=true;const pl=new THREE.Plane(new THREE.Vector3(0,-1,0),0);m.clippingPlanes=[pl];m.clipShadows=true;return{m,pl};}
function buildSite23(s){
  disposeSite23(s.id);
  const l=lot23(s.lotId);if(!l)return;const P=plan23(s),{W,D,hw,hd}=lotLocal23(l),t=P.t;
  const g=new THREE.Group();g.position.set(l.x,0,l.z);scene.add(g);
  const R={s,P,g,l,floors:[],t:0,dirty:true,vis:true};RT23.sites[s.id]=R;
  const B=new THREE.Group();B.position.set(0,0,P.bz);g.add(B);R.B=B;
  const fw=P.w+0.4,fd=P.d+0.4;
  /* terrassement : fouille, déblais */
  R.earth=bx23(B,fw+1.2,0.04,fd+1.2,0,Y23+0.02,0,mat23(0x6b4f36,{roughness:1}));R.earth.castShadow=false;
  R.pit=bx23(B,fw,0.05,fd,0,Y23+0.04,0,mat23(0x3f2e22,{roughness:1}));R.pit.castShadow=false;
  R.pile=new THREE.Mesh(new THREE.ConeGeometry(2.4,2.2,9),mat23(0x7a5a3c,{roughness:1}));R.pile.position.set(hw-2.6,Y23,-0.5-P.bz);R.pile.castShadow=true;g.add(R.pile);
  const stk=new MG23();[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>stk.b(.08,.8,.08,a*fw/2,Y23+.4,b*fd/2,0xf1f1ee));
  stk.b(fw,.02,.02,0,Y23+.6,fd/2,0xff3b30).b(fw,.02,.02,0,Y23+.6,-fd/2,0xff3b30).b(.02,.02,fd,fw/2,Y23+.6,0,0xff3b30).b(.02,.02,fd,-fw/2,Y23+.6,0,0xff3b30);R.stakes=stk.mesh(vmat23(0xffffff),B,false);
  /* fondations : ferraillage puis radier */
  const rb=new MG23();for(let x=-fw/2+.3;x<=fw/2-.3;x+=.6)rb.b(.04,.04,fd-.4,x,Y23+.25,0,0x8a4b2a);for(let z=-fd/2+.3;z<=fd/2-.3;z+=.6)rb.b(fw-.4,.04,.04,0,Y23+.29,z,0x8a4b2a);
  R.rebar=rb.mesh(vmat23(0xffffff,{metalness:.4}),B,false);
  R.slab=bx23(B,fw,SLAB23,fd,0,Y23+SLAB23/2,0,mat23(0x9ea2a2));
  if(t.warehouse)buildWarehouse23(R);else buildFloors23(R);
  buildSiteProps23(R);buildEng23(R);rebuildCrew23(s);
  /* collision : clôture pendant les travaux, emprise une fois livré */
  R.box={x0:0,x1:0,z0:0,z1:0,big:true,ch23:true};boxes.push(R.box);setBox23(R);
  apply23(R,true);return R;
}
function setBox23(R){const l=R.l,{hw,hd}=lotLocal23(l),P=R.P,b=R.box;
  if(R.s.done){b.x0=l.x-P.w/2-.2;b.x1=l.x+P.w/2+.2;b.z0=l.z+P.bz-P.d/2-.2;b.z1=l.z+P.bz+P.d/2+(P.t.balcony?1.2:.2);}
  else{b.x0=l.x-hw+.2;b.x1=l.x+hw-.2;b.z0=l.z-hd+.2;b.z1=l.z+hd-.25;}}
function disposeSite23(id){const R=RT23.sites[id];if(!R)return;(R.workers||[]).forEach(w=>disposeTree23(w.mesh));disposeTree23(R.g);const i=boxes.indexOf(R.box);if(i>=0)boxes.splice(i,1);delete RT23.sites[id];}
function buildFloors23(R){
  const P=R.P,t=P.t,B=R.B,wallFinal=mat23(t.wall,{roughness:.9}),raw=mat23(RAW23,{roughness:.95});
  for(let k=0;k<P.n;k++){
    const y0=P.y0[k],fp=floorParts23(P,k),F={k,y0,H:fp.H};
    const cm=clipMat23(vmat23(0xffffff));F.pc=cm.pl;F.cols=fp.C.mesh(cm.m,B);F.cols.position.y=y0;
    const wr=clipMat23(raw);F.pw=wr.pl;F.wallRaw=wr.m;F.wallFinal=wallFinal;
    const wm=new THREE.Mesh(mergeParts(fp.W.p),wr.m);wm.castShadow=true;wm.receiveShadow=true;wm.position.y=y0;B.add(wm);F.walls=wm;
    F.core=bx23(B,fp.core[0],fp.core[1],fp.core[2],0,y0+fp.core[1]/2,0,CORE_D23);F.core.castShadow=false;
    F.glass=fp.G.mesh(GLASS23,B,false);if(F.glass)F.glass.position.y=y0;
    F.fin=fp.F.mesh(vmat23(0xffffff),B);if(F.fin)F.fin.position.y=y0;
    F.slab=bx23(B,P.w+.3,.26,P.d+.3,0,y0+P.fh[k]-.13,0,mat23(0x9ea2a2));
    F.scaff=scaffParts23(P,k).mesh(vmat23(0xffffff,{metalness:.3}),B);F.scaff.position.y=y0;
    R.floors.push(F);
  }
  const top=P.top-P.base;
  if(t.roof==='gable'){
    const rf=new THREE.Mesh(prism23(P.w+1.0,2.3,P.d+1.0),mat23(t.roofC,{roughness:.85}));rf.position.set(0,P.top,0);rf.castShadow=true;B.add(rf);
    const ex=new MG23();ex.b(.6,1.6,.6,P.w/2-2,P.top+1.4,-P.d/4,0x8e4e37).b(.75,.15,.75,P.w/2-2,P.top+2.25,-P.d/4,0x5a3b28);
    ex.b(P.w+1.1,.18,.3,0,P.top+.05,P.d/2+.5,0xf2eadc).b(P.w+1.1,.18,.3,0,P.top+.05,-P.d/2-.5,0xf2eadc);
    const rg=ex.mesh(vmat23(0xffffff),B);R.roof=[rf,rg];
  }else{const rp=roofParts23(P);const m=rp.mesh(vmat23(0xffffff),B);m.position.y=P.base;R.roof=[m];}
  /* finitions extérieures livrées */
  const X=new MG23(),fz=P.d/2;
  if(t.shop){/* store banne + soubassement */}
  if(t.id==='immeuble'){X.b(3.2,.2,1.8,0,P.base+2.6,fz+.9,0x3b4148).b(.1,2.5,.1,-1.5,P.base+1.25,fz+1.7,0x3b4148).b(.1,2.5,.1,1.5,P.base+1.25,fz+1.7,0x3b4148);}
  if(t.id==='maison'||t.id==='villa'){X.b(1.4,.06,R.l?lotLocal23(R.l).hd-P.bz-fz:2,0,Y23+.03,fz+(lotLocal23(R.l).hd-P.bz-fz)/2,0xcfc6b4);
    for(let x=-P.w/2-1;x<=P.w/2+1;x+=1.3){if(Math.abs(x)<1.2)continue;X.b(.9,.7,.9,x,Y23+.35,fz+1.2,0x4f7a43);}}
  if(t.id==='duplex'){X.b(1.2,.15,1.2,P.w/2-1.2,P.base+P.fh[0]+.08,fz+.55,0xd8d4cc);X.b(.06,1,1.2,P.w/2-1.8,P.base+P.fh[0]+.6,fz+.55,0x3a3f45);}
  R.extras=X.mesh(vmat23(0xffffff),B);
  if(t.shop){
    const aw=new THREE.Mesh(new THREE.BoxGeometry(P.w*.9,.08,1.6),new THREE.MeshStandardMaterial({map:texAwning23(),roughness:.9}));aw.material.map.repeat.set(P.w/4,1);
    aw.position.set(0,P.base+3.55,fz+.8);aw.rotation.x=.22;aw.castShadow=true;B.add(aw);R.awning=aw;
    R.signY=P.base+P.fh[0]-.3;
  }
  if(t.id==='immeuble')R.signY=P.base+3.0;
}
function buildWarehouse23(R){
  const P=R.P,B=R.B;R.frames=[];R.bays=[];R.clad=[];
  const W=new THREE.Group();W.position.y=P.base;B.add(W);R.W=W;
  const wallM=new THREE.MeshStandardMaterial({map:texRibs23(),color:P.t.wall,roughness:.55,metalness:.35}),roofM=new THREE.MeshStandardMaterial({map:texRibs23(),color:P.t.roofC,roughness:.6,metalness:.3}),shutM=new THREE.MeshStandardMaterial({map:texShutter23(),roughness:.5,metalness:.4});
  for(let i=0;i<=P.nb;i++){const fp=frameParts23(P,i),f={cols:fp.M.mesh(vmat23(0xffffff,{metalness:.5,roughness:.5}),W),raft:fp.R.mesh(vmat23(0xffffff,{metalness:.5,roughness:.5}),W)};R.frames.push(f);}
  for(let i=0;i<P.nb;i++){R.bays.push(bayParts23(P,i).mesh(vmat23(0xffffff,{metalness:.4}),W));R.clad.push(cladBay23(P,i,W,wallM,roofM,shutM));}
  R.gables=gableEnds23(P,W,wallM);
  /* réseaux : chemins de câbles, éclairage, armoire électrique, descentes d'eau */
  const E=new MG23();E.b(P.w-1,.08,.3,0,4.6,P.d/2+.25,0x3a3f45);for(let i=0;i<P.nb;i++){const x=-P.w/2+P.bw*(i+.5);E.b(.5,.22,.3,x,P.H-1.1,P.d/2+.3,0x2a2e33);}
  E.b(.9,1.5,.4,P.w/2-1.2,.75,P.d/2+.3,0x9aa1a8);[-1,1].forEach(sg=>E.b(.14,P.H,.14,sg*(P.w/2-.2),P.H/2,P.d/2+.18,0x6f7b85));
  R.elec=E.mesh(vmat23(0xffffff),W);
  R.lamps=[];for(let i=0;i<P.nb;i++){const x=-P.w/2+P.bw*(i+.5);const lm=bx23(W,.42,.08,.2,x,P.H-1.24,P.d/2+.42,CORE_D23);lm.castShadow=false;R.lamps.push(lm);}
  R.roof=[];R.signY=P.base+P.H-1.2;
}
function buildSiteProps23(R){
  const g=R.g,l=R.l,{W,D,hw,hd}=lotLocal23(l),P=R.P;
  /* clôture Heras avec portail à gauche, côté repère */
  const F=new MG23(),N=new MG23(),gate0=-hw+0.4,gate1=-hw+3.4;
  const run=(ax,a,b,p)=>{const L=b-a,n=Math.max(1,Math.round(L/3.4));for(let i=0;i<n;i++){const u0=a+L*i/n,u1=a+L*(i+1)/n,m=(u0+u1)/2;
      if(ax==='x'&&p>0&&m>gate0&&m<gate1)continue;
      if(ax==='x'){F.b(.06,2,.06,u0,Y23+1,p,0xb7bdc2).b(.5,.16,.22,u0,Y23+.08,p,0x2b6cd1);N.b(u1-u0-.06,1.9,.03,m,Y23+1.02,p,0xffffff);}
      else{F.b(.06,2,.06,p,Y23+1,u0,0xb7bdc2).b(.22,.16,.5,p,Y23+.08,u0,0x2b6cd1);N.b(.03,1.9,u1-u0-.06,p,Y23+1.02,m,0xffffff);}}};
  run('x',-hw,hw,hd-.1);run('x',-hw,hw,-hd+.1);run('z',-hd,hd,hw-.1);run('z',-hd,hd,-hw+.1);
  const fg=new THREE.Group();g.add(fg);F.mesh(vmat23(0xffffff,{metalness:.4}),fg);
  const net=new THREE.MeshStandardMaterial({color:0xdfe6ea,transparent:true,opacity:.28,roughness:.6,metalness:.2,depthWrite:false,side:THREE.DoubleSide});net.userData.own23=true;
  N.mesh(net,fg,false);R.fence=fg;
  /* bâche publicitaire sur la clôture avant */
  const bt=canvasTex23(1024,128,(c,w,h)=>{c.fillStyle='#14181c';c.fillRect(0,0,w,h);c.fillStyle='#ffc23d';for(let i=-2;i<40;i++){c.beginPath();c.moveTo(i*32,h);c.lineTo(i*32+16,h);c.lineTo(i*32+40,h-18);c.lineTo(i*32+24,h-18);c.fill();}
    c.fillStyle='#ffc23d';c.font='700 58px Rajdhani, Arial Narrow, sans-serif';c.textBaseline='middle';c.fillText('CHANTIER EN COURS',28,52);c.fillStyle='#f4f1e8';c.font='600 40px Rajdhani, Arial Narrow, sans-serif';c.textAlign='right';c.fillText(P.t.name.toUpperCase()+' · '+l.name.toUpperCase(),w-28,52);});
  const ban=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(W-5,16),1.6),new THREE.MeshStandardMaterial({map:bt,roughness:.8}));ban.material.userData.own23=true;ban.position.set(2,Y23+1.05,hd-.05);fg.add(ban);
  /* base vie : bungalow de chantier, toilettes, table de plans */
  const C=new MG23(),cx=hw-2.6,cz=-hd+1.4;
  C.b(4.2,2.5,2,cx,Y23+1.35,cz,0x2b6cb0).b(4.3,.12,2.1,cx,Y23+2.66,cz,0xe8ecef).b(4.3,.12,2.1,cx,Y23+.06,cz,0xe8ecef);
  C.b(1.4,.8,.04,cx-.9,Y23+1.6,cz+1.02,0x9cc4d4).b(.8,1.9,.04,cx+1.2,Y23+1.05,cz+1.02,0xe8ecef);
  C.b(1,2.2,1,cx-2.8,Y23+1.1,cz,0x2f8a4f).b(1.4,.08,.8,cx-1.2,Y23+.95,cz+2.2,0xc49a5c).b(.06,.9,.06,cx-1.8,Y23+.5,cz+2.2,0x5a6168).b(.06,.9,.06,cx-.6,Y23+.5,cz+2.2,0x5a6168).b(1.1,.02,.6,cx-1.2,Y23+1.0,cz+2.2,0xd8ecf8);
  R.cabin=C.mesh(vmat23(0xffffff),g);R.planTable={x:cx-1.2,z:cz+2.2};
  /* aire de stockage devant la clôture : palettes de parpaings, fers, tourets */
  const Y=new MG23(),yx=-hw+5.4,yz=hd+2.3;R.yard={x:yx,z:yz};
  [[0,0],[1.3,0],[0,1.2]].forEach(([a,b])=>{Y.b(1.1,.15,1.1,yx+a,.08,yz+b-.6,0xb08a5a).b(1,.7,1,yx+a,.5,yz+b-.6,0x9ea2a2);});
  Y.b(3,.25,.6,yx+2.6,.13,yz,0x8a4b2a).b(3,.25,.6,yx+2.6,.38,yz,0x8a4b2a);
  R.yardMesh=Y.mesh(vmat23(0xffffff),g);
  const S=new MG23();S.c(.6,.5,0,0,0,0x7a5a3c,14,Math.PI/2).c(.35,.52,0,0,0,0x2a2e33,12,Math.PI/2);[[1.4,-1],[2.6,-1]].forEach(()=>{});
  R.spools=new THREE.Group();g.add(R.spools);[[hw-4.8,hd-2],[hw-3.6,hd-2]].forEach(([x,z])=>{const m=S.mesh(vmat23(0xffffff),null);m.position.set(x,Y23+.6,z);R.spools.add(m);});
  const pipes=new MG23();for(let i=0;i<5;i++)pipes.c(.09,3,hw-6.2+i*.2,Y23+.1+(i%2)*.17,hd-3.4,0xe8ecef,8,0,Math.PI/2);R.spools.add(pipes.mesh(vmat23(0xffffff),null));
  /* panneau de permis de construire */
  R.boardAt={x:-hw+3.6,z:hd+.9};permitBoard23(R);
  /* panneau « à louer » après livraison */
  R.forRent=null;
}
function permitBoard23(R){
  if(R.permit)disposeTree23(R.permit);const s=R.s,P=R.P,g=new THREE.Group();R.g.add(g);R.permit=g;
  const done=s.done;if(done&&s.tenants>=units23(s))return;
  const lines=done?['À LOUER',P.t.name,(units23(s)-s.tenants)+' / '+units23(s)+' disponible'+(units23(s)-s.tenants>1?'s':''),'Contact : '+state.name]:
    ['PERMIS DE CONSTRUIRE',P.t.name+' · '+R.l.name,'Maître d’ouvrage : '+state.name,'Architecte : '+(s.names.architecte||'à désigner'),'Ingénieur : '+(s.names.ingenieur||'à désigner')];
  board23(g,lines,2.6,done?1.7:2.1,R.boardAt.x,2.1,R.boardAt.z,{band:done?'#4fb58a':'#ffc23d',bandFg:'#14181c'});
  const p=new MG23();[-1,1].forEach(dx=>p.b(.09,2.9,.09,R.boardAt.x+dx*1.05,1.45,R.boardAt.z-.08,0x5a6168));p.mesh(vmat23(0xffffff),g);
}
function shopSign23(R){
  if(R.sign)disposeTree23(R.sign);if(!R.s.done||R.signY==null)return;const s=R.s,P=R.P,t=P.t;
  let text=t.shop?(s.tl[0]||'LOCAL À LOUER'):t.warehouse?(s.tl[0]||'ENTREPÔT À LOUER'):'RÉSIDENCE '+R.l.name.replace(/^(Terrain|Îlot) (des |du |de la )?/,'').toUpperCase();
  const g=new THREE.Group();R.B.add(g);R.sign=g;const w=t.warehouse?Math.min(10,P.w*.45):t.shop?Math.min(8,P.w*.6):4.4,h=t.warehouse?1.1:.75;
  const bg=t.shop?'#1f6f6a':t.warehouse?'#2f6fb0':'#3b4148';
  const tex=canvasTex23(1024,Math.round(1024*h/w),(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle='#ffffff';c.font='700 '+Math.round(H*.62)+'px Rajdhani, Arial Narrow, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text.toUpperCase(),W/2,H/2+4,W*.92);});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.6,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.25}));m.material.userData.own23=true;
  const z=P.d/2+(t.warehouse?.3:.2);m.position.set(t.warehouse?P.w/6:0,R.signY+(t.warehouse?0:0),z);g.add(m);
}

/* ===================== engins ===================== */
const YEL23=0xf2b705,ORA23=0xe8731a;
function rebuildEng23(s){const R=RT23.sites[s.id];if(R){buildEng23(R);R.dirty=true;}permitRefresh23(s);}
function permitRefresh23(s){const R=RT23.sites[s.id];if(R)permitBoard23(R);}
function buildEng23(R){
  const s=R.s;
  ['crane','exc','truck'].forEach(k=>{if(R[k]){disposeTree23(R[k].g);R[k]=null;}});
  if(s.eng.grue===1)R.crane=makeCrane23(R);
  if(s.eng.pelleteuse===1)R.exc=makeExc23(R);
  if(s.eng.toupie===1)R.truck=makeTruck23(R);
}
/* --- grue à tour : mât en treillis, flèche, contre-flèche, chariot, câble, crochet --- */
function lattice23(M,L,sec,c,vertical){
  /* treillis carré le long de y (mât) ; sec = côté */
  const h=sec/2,n=Math.max(1,Math.round(L/sec));
  [[-h,-h],[h,-h],[h,h],[-h,h]].forEach(([x,z])=>M.b(.1,L,.1,x,L/2,z,c));
  for(let i=0;i<=n;i++){const y=L*i/n;M.b(sec,.07,.07,0,y,-h,c).b(sec,.07,.07,0,y,h,c).b(.07,.07,sec,-h,y,0,c).b(.07,.07,sec,h,y,0,c);
    if(i<n){const y1=L*(i+1)/n;M.bar([-h,y,-h],[h,y1,-h],.05,c).bar([h,y,h],[-h,y1,h],.05,c).bar([-h,y,h],[-h,y1,-h],.05,c).bar([h,y,-h],[h,y1,h],.05,c);}}
}
function makeCrane23(R){
  const P=R.P,{hw,hd}=lotLocal23(R.l),mx=-hw+1.5,mz=-hd+1.5,H=Math.max(14,P.top+6.5);
  const g=new THREE.Group();g.position.set(mx,0,mz);R.g.add(g);
  /* portée : coins du bâtiment et aire de stockage */
  const pts=[[-P.w/2,P.bz-P.d/2],[P.w/2,P.bz-P.d/2],[P.w/2,P.bz+P.d/2],[-P.w/2,P.bz+P.d/2],[R.yard.x,R.yard.z]];
  const J=Math.max(12,Math.ceil(Math.max(...pts.map(([x,z])=>Math.hypot(x-mx,z-mz)))+1.5)),CJ=Math.max(5,J*.32);
  const M=new MG23();
  M.b(2.6,.9,2.6,0,Y23+.45,0,0x9ea2a2).b(2.2,.5,.8,0,Y23+1.15,-.7,0x8f9394).b(2.2,.5,.8,0,Y23+1.15,.7,0x8f9394);
  lattice23(M,H-1.2,1.3,YEL23);
  const mast=M.mesh(vmat23(0xffffff,{metalness:.35,roughness:.55}),g);mast.position.y=0;
  mast.geometry.translate(0,0,0);
  /* partie tournante */
  const S=new THREE.Group();S.position.y=H;g.add(S);
  const T=new MG23();
  T.c(1,.5,0,-.15,0,0x3a3f45,16);
  /* cabine */
  T.b(1.4,1.5,1.3,.9,-.9,1.0,0xf4f4f0).b(.05,.9,1.1,1.62,-.8,1.0,0x2a3a48).b(1.2,.05,1.1,.9,-.1,1.0,0xf2b705);
  /* pylône (porte-flèche) */
  const ph=4.2;T.bar([-.6,.1,-.6],[0,ph,0],.12,YEL23).bar([.6,.1,-.6],[0,ph,0],.12,YEL23).bar([.6,.1,.6],[0,ph,0],.12,YEL23).bar([-.6,.1,.6],[0,ph,0],.12,YEL23);
  /* flèche triangulaire le long de +x */
  const jt=.95,n=Math.round(J/1.6);
  T.b(J,.1,.1,J/2+.6,.15,-.45,YEL23).b(J,.1,.1,J/2+.6,.15,.45,YEL23).b(J,.1,.1,J/2+.6,jt,0,YEL23);
  for(let i=0;i<=n;i++){const x=.6+J*i/n;T.b(.07,.07,.9,x,.15,0,YEL23);if(i<n){const x1=.6+J*(i+1)/n;T.bar([x,.15,-.45],[x1,jt,0],.05,YEL23).bar([x,.15,.45],[x1,jt,0],.05,YEL23);}}
  /* contre-flèche + lests */
  T.b(CJ,.14,.12,-CJ/2-.4,.3,-.4,YEL23).b(CJ,.14,.12,-CJ/2-.4,.3,.4,YEL23);for(let i=0;i<=4;i++)T.b(.1,.08,.8,-.4-CJ*i/4,.3,0,YEL23);
  T.b(1.6,2.2,1.4,-CJ+.4,-.55,0,0x9ea2a2).b(1.3,1.1,1.1,-CJ*.55,.95,0,0x5a6168);
  T.b(CJ-1,.06,.9,-CJ/2,.42,0,0x7d8790);
  /* haubans */
  T.bar([0,ph,0],[J*.62,jt,0],.05,0x3a3f45).bar([0,ph,0],[J*.98,jt,0],.04,0x3a3f45).bar([0,ph,0],[-CJ+.4,.4,0],.05,0x3a3f45);
  T.mesh(vmat23(0xffffff,{metalness:.35,roughness:.55}),S);
  /* enseigne de grue */
  const sg=canvasTex23(512,96,(c,w,h)=>{c.fillStyle='#14181c';c.fillRect(0,0,w,h);c.fillStyle='#ffc23d';c.font='700 64px Rajdhani, Arial Narrow, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('AURORE BTP',w/2,h/2+3);});
  const sm=new THREE.MeshStandardMaterial({map:sg,roughness:.7,side:THREE.DoubleSide});sm.userData.own23=true;
  const pl=new THREE.Mesh(new THREE.PlaneGeometry(J*.32,J*.06),sm);pl.position.set(J*.45,jt+.38,0);S.add(pl);
  /* chariot, câble, moufle, charge */
  const trol=new THREE.Group();S.add(trol);bx23(trol,.9,.35,1.0,0,.05,0,mat23(0x3a3f45,{metalness:.5}));
  const cable=bx23(trol,.04,1,.04,0,0,0,mat23(0x22262a,{metalness:.6}));cable.castShadow=false;
  const hook=new THREE.Group();trol.add(hook);bx23(hook,.45,.55,.3,0,0,0,mat23(YEL23));const hk=new THREE.Mesh(new THREE.TorusGeometry(.16,.05,6,12,Math.PI*1.4),mat23(0x3a3f45,{metalness:.6}));hk.position.y=-.42;hk.rotation.z=Math.PI*.8;hook.add(hk);
  const loads=new THREE.Group();hook.add(loads);
  const L1=new MG23();L1.b(1.2,.14,1.2,0,-1.25,0,0xb08a5a).b(1.1,.8,1.1,0,-.8,0,0xa8a39a);[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].forEach(([a,b])=>L1.bar([a,-.4,b],[0,-.15,0],.03,0x22262a));
  const L2=new MG23();L2.b(4.2,.3,.25,0,-.9,0,0x8a4b2a).b(4.2,.3,.25,0,-.9,.3,0x8a4b2a).bar([-1.8,-.75,.15],[0,-.15,0],.03,0x22262a).bar([1.8,-.75,.15],[0,-.15,0],.03,0x22262a);
  const L3=new MG23();L3.c(.55,1.1,0,-.95,0,0x9ea2a2,12,0,0,.25).bar([-.5,-.4,0],[0,-.15,0],.03,0x22262a).bar([.5,-.4,0],[0,-.15,0],.03,0x22262a);
  const L4=new MG23();L4.b(2.4,.08,1.2,0,-.9,0,0xc8a165).b(2.4,.08,1.2,0,-.8,0,0xd6b27a).bar([-1.1,-.75,-.5],[0,-.15,0],.03,0x22262a).bar([1.1,-.75,.5],[0,-.15,0],.03,0x22262a);
  const LD=[L1,L2,L3,L4].map(m=>{const o=m.mesh(vmat23(0xffffff),loads);o.visible=false;return o;});
  return{g,S,trol,cable,hook,loads:LD,H,J,mx,mz,ang:Math.atan2(-(P.bz-mz),0-mx),r:J*.5,hy:H-4,st:0,wait:0,li:0,carry:false};
}
function animCrane23(R,C,dt,active){
  const P=R.P;
  if(active){
    if(C.st===0){const y=R.yard,dx=y.x-C.mx,dz=y.z-C.mz;C.ta=Math.atan2(-dz,dx);C.tr=Math.hypot(dx,dz);C.th=C.H-3;if(near23(C))C.st=1;}
    else if(C.st===1){C.th=Y23+1.7;if(near23(C)){C.st=2;C.wait=1.1;}}
    else if(C.st===2){C.wait-=dt;if(C.wait<=0){C.li=(C.li+1)%4;C.loads.forEach((m,i)=>m.visible=i===C.li);C.st=3;}}
    else if(C.st===3){C.th=C.H-3;if(near23(C)){C.st=4;const top=workTop23(R),x=rand(-P.w/2+1,P.w/2-1),z=P.bz+rand(-P.d/2+1,P.d/2-1),dx=x-C.mx,dz=z-C.mz;C.dta=Math.atan2(-dz,dx);C.dtr=Math.hypot(dx,dz);C.dth=Math.min(C.H-3,top+1.6);}}
    else if(C.st===4){C.ta=C.dta;C.tr=C.dtr;C.th=C.H-3;if(near23(C))C.st=5;}
    else if(C.st===5){C.th=C.dth;if(near23(C)){C.st=6;C.wait=1.3;}}
    else if(C.st===6){C.wait-=dt;if(C.wait<=0){C.loads.forEach(m=>m.visible=false);C.st=7;}}
    else if(C.st===7){C.th=C.H-3;if(near23(C))C.st=0;}
  }else{C.th=C.H-3;}
  if(C.ta!=null){const d=angDiff(C.ang,C.ta);C.ang+=clamp(d,-.32*dt,.32*dt);}
  if(C.tr!=null)C.r+=clamp(C.tr-C.r,-2.2*dt,2.2*dt);
  C.hy+=clamp(C.th-C.hy,-2.4*dt,2.4*dt);
  C.r=clamp(C.r,1.8,C.J+.4);
  C.S.rotation.y=C.ang;C.trol.position.set(C.r,0,0);
  const len=Math.max(.3,C.H-C.hy-.2);C.cable.scale.y=len;C.cable.position.y=-len/2;C.hook.position.y=-len-.1;
  /* léger balancement de la charge */
  C.hook.rotation.z=Math.sin(performance.now()*.0014)*.025;
}
function near23(C){return Math.abs(angDiff(C.ang,C.ta==null?C.ang:C.ta))<.02&&Math.abs((C.tr==null?C.r:C.tr)-C.r)<.08&&Math.abs(C.th-C.hy)<.08;}
/* --- pelleteuse : chenilles, tourelle, flèche, balancier, godet --- */
function makeExc23(R){
  const g=new THREE.Group();R.g.add(g);
  const U=new MG23();
  [-1,1].forEach(sg=>{U.b(3.6,.75,.7,0,.42,sg*1.05,0x2a2e33);U.c(.38,.7,-1.8,.42,sg*1.05,0x2a2e33,12,Math.PI/2).c(.38,.7,1.8,.42,sg*1.05,0x2a2e33,12,Math.PI/2);
    for(let i=0;i<5;i++)U.c(.16,.74,-1.3+i*.65,.3,sg*1.05,0x5a6168,10,Math.PI/2);});
  U.b(1.4,.4,1.4,0,.95,0,0x3a3f45);
  U.mesh(vmat23(0xffffff,{roughness:.7}),g);
  const up=new THREE.Group();up.position.y=1.15;g.add(up);
  const T=new MG23();T.b(3.0,1.0,2.2,-.3,.5,0,ORA23).b(1.1,.9,2.0,-1.55,.45,0,0x3a3f45).b(1.2,1.4,1.0,.55,1.7,.55,ORA23).b(.06,1.0,.9,1.16,1.75,.55,0x2a3a48).b(1.1,.06,.06,.55,2.42,.55,0x2a2e33).b(.06,.9,.06,-1.4,1.4,-.6,0x2a2e33);
  T.mesh(vmat23(0xffffff,{roughness:.6}),up);
  const boom=new THREE.Group();boom.position.set(1.0,.9,-.2);up.add(boom);
  const BM=new MG23();BM.b(3.4,.45,.4,1.7,0,0,ORA23).b(.5,.3,.3,.9,.35,0,0x3a3f45);BM.mesh(vmat23(0xffffff),boom);
  const stick=new THREE.Group();stick.position.set(3.4,0,0);boom.add(stick);
  const SM=new MG23();SM.b(2.4,.32,.32,1.2,0,0,ORA23);SM.mesh(vmat23(0xffffff),stick);
  const bucket=new THREE.Group();bucket.position.set(2.4,0,0);stick.add(bucket);
  const KM=new MG23();KM.b(.7,.6,.9,.35,-.2,0,0x3a3f45).b(.1,.12,.9,.72,-.52,0,0x8f9394);for(let i=0;i<4;i++)KM.b(.18,.08,.08,.82,-.55,-.33+i*.22,0xb7bdc2);KM.mesh(vmat23(0xffffff),bucket);
  const dirt=new THREE.Mesh(new THREE.SphereGeometry(.32,7,5),mat23(0x6b4f36,{roughness:1}));dirt.position.set(.35,-.15,0);dirt.visible=false;bucket.add(dirt);
  return{g,up,boom,stick,bucket,dirt,t:Math.random()*6};
}
const EXK23=[[0,.55,-1.6,-.6],[0,-.12,-1.0,-.2],[0,-.32,-1.25,-1.8],[0,.62,-1.7,-1.95],[1.75,.62,-1.4,-1.95],[1.75,.4,-.9,.35],[0,.55,-1.6,-.6]],EXT23=[0,1.4,2.4,3.4,4.8,5.6,6.6];
function animExc23(R,X,dt,active){
  const P=R.P,{hw,hd}=lotLocal23(R.l);
  /* position : dans la fouille pendant le terrassement, garée à l'avant droit sinon */
  const digging=R.s.phase===1&&active;
  const px=digging?P.w/2-2.2:hw-2.6,pz=digging?P.bz+.6:hd-2.8,ry=digging?Math.PI:Math.PI*.5;
  X.g.position.set(px,Y23,pz);X.g.rotation.y=ry;
  let k=[0,.75,-1.9,-1.2];
  if(digging){X.t=(X.t+dt)%6.6;let i=0;while(i<EXT23.length-2&&X.t>EXT23[i+1])i++;const f=(X.t-EXT23[i])/(EXT23[i+1]-EXT23[i]),e=f*f*(3-2*f);k=EXK23[i].map((v,j)=>lerp(v,EXK23[i+1][j],e));X.dirt.visible=X.t>2.3&&X.t<5.4;}
  else X.dirt.visible=false;
  X.up.rotation.y=k[0];X.boom.rotation.z=k[1];X.stick.rotation.z=k[2];X.bucket.rotation.z=k[3];
}
/* --- camion toupie : cabine, châssis, 3 essieux, toupie qui tourne, goulotte --- */
function makeTruck23(R){
  const {hw,hd}=lotLocal23(R.l),g=new THREE.Group();g.position.set(hw*.42,0,hd+2.7);R.g.add(g);
  const M=new MG23();
  M.b(7.4,.35,2.1,0,.95,0,0x2a2e33).b(2,1.9,2.3,2.9,2.0,0,0xf4f4f0).b(.06,.9,2.0,3.92,2.45,0,0x2a3a48).b(.08,.4,2.3,3.95,1.15,0,0x3a3f45).b(1.6,.08,2.3,2.9,3.0,0,0xffc23d);
  M.b(.5,.12,.08,3.96,1.5,-.8,0xfff4c2).b(.5,.12,.08,3.96,1.5,.8,0xfff4c2);
  [[2.8,1],[-.9,1],[-2.3,1]].forEach(([x])=>[-1,1].forEach(sg=>M.c(.5,.4,x,.5,sg*1.05,0x1c1e22,14,Math.PI/2).c(.26,.42,x,.5,sg*1.05,0xb7bdc2,10,Math.PI/2)));
  M.b(.6,1.4,.6,-3.2,1.8,.7,0x3a3f45).b(.5,.12,1.6,-3.6,2.4,0,0x3a3f45);
  M.mesh(vmat23(0xffffff,{roughness:.6}),g);
  const tilt=new THREE.Group();tilt.position.set(-.8,2.45,0);tilt.rotation.z=.2;g.add(tilt);const drum=new THREE.Group();tilt.add(drum);
  const D=new MG23();D.c(1.05,3.2,0,0,0,0xff8a1f,16,0,Math.PI/2,1.05).c(1.05,1.2,2.2,0,0,0xff8a1f,16,0,-Math.PI/2,.35).c(1.05,.8,-2.0,0,0,0xff8a1f,16,0,Math.PI/2,.6);
  for(let i=0;i<3;i++){const a=i*2.1;D.b(3.4,.14,.2,0,Math.cos(a)*1.05,Math.sin(a)*1.05,0xf4f4f0,a,0,0);}
  const dm=D.mesh(vmat23(0xffffff),drum);
  const chute=bx23(g,2.4,.12,.55,-3.9,1.6,-1.0,mat23(0x5a6168,{metalness:.5}));chute.rotation.set(0,Math.PI*.42,-.35);
  const pour=cy23(g,.12,1,-4.3,1,-2.1,mat23(0x8f9394,{roughness:1}),8);pour.visible=false;pour.castShadow=false;
  return{g,drum,pour,spin:0};
}
function animTruck23(R,K,dt,active){
  const pouring=R.s.phase===2&&active;K.spin+=dt*(pouring?2.6:.8);K.drum.rotation.x=K.spin;
  K.pour.visible=pouring;if(pouring){const L=1.6+Math.sin(performance.now()*.01)*.05;K.pour.scale.y=L;K.pour.position.y=1.5-L/2;}
}

/* ===================== équipe visible ===================== */
let helmetGeo23=null;
function makeWorker23(shirt,helmet,role){
  const m=makePerson(shirt,role==='architecte'?0x2b3445:0x3a4250,pick(SKINS),pick(HAIRS),{style:'ras',top:role==='architecte'||role==='ingenieur'?'long':'tee',bottom:'pantalon',bag:false,shoe:0x3a2a1c,glasses:role==='ingenieur'&&Math.random()<.5});
  const bb=new THREE.Box3().setFromObject(m),top=bb.max.y;
  if(!helmetGeo23)helmetGeo23=new THREE.SphereGeometry(.17,12,8,0,Math.PI*2,0,Math.PI/2);
  const h=new THREE.Mesh(helmetGeo23,mat23(helmet,{roughness:.4}));h.position.y=top-.12;h.scale.set(1.08,1,1.15);m.add(h);
  const brim=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.025,14),mat23(helmet,{roughness:.4}));brim.position.set(0,top-.11,.04);m.add(brim);
  if(role!=='architecte'){const vest=new THREE.Mesh(new THREE.BoxGeometry(.42,.06,.3),mat23(0xd8ff3a,{emissive:0x334400,roughness:.5}));vest.position.y=top*.66;m.add(vest);}
  m.traverse(o=>{if(o.isMesh)o.castShadow=false;});m.children[0].castShadow=true;
  scene.add(m);return m;
}
function rebuildCrew23(s){
  const R=RT23.sites[s.id];if(!R)return;
  (R.workers||[]).forEach(w=>disposeTree23(w.mesh));R.workers=[];
  if(s.done){permitBoard23(R);return;}
  ROLES23.forEach(r=>{if(s.crew[r.id]>=0)R.workers.push(newW23(R,r.id,makeWorker23(r.shirt,r.helmet,r.id)));});
  for(let i=0;i<s.crew.macons;i++)R.workers.push(newW23(R,'macon',makeWorker23(MASON23.shirt,MASON23.helmet,'macon')));
  permitBoard23(R);
}
function newW23(R,role,mesh){const {hw,hd}=lotLocal23(R.l),p=R.planTable;const w={role,mesh,x:p.x+rand(-1.5,1.5),z:p.z+rand(0,1.2),y:Y23,tx:0,tz:0,ty:Y23,wait:rand(0,2),work:0,ph:rand(0,6),h:0,lvl:-9};w.tx=w.x;w.tz=w.z;return w;}
/* hauteur de travail actuelle (dessus de la dernière dalle coulée) */
function workTop23(R){
  const s=R.s,P=R.P;if(s.phase<2)return Y23;if(s.phase===2)return Y23+SLAB23*Math.min(1,s.prog*1.2);
  if(P.t.warehouse)return s.phase===3?P.base:P.base+P.H;
  if(s.phase===3){const F=s.prog*P.n,k=Math.min(P.n-1,Math.floor(F));return P.y0[k];}
  return P.top;
}
function activeRoles23(s){if(s.done)return[];if(rate23(s,s.phase)<=0)return[];return[['architecte','ingenieur'],['ingenieur'],['macon','ingenieur'],['macon','ingenieur'],['electricien','plombier'],['macon','architecte']][s.phase]||[];}
/* choisit une nouvelle cible (x, z locaux au terrain, y absolu) */
function target23(R,w,act){
  const s=R.s,P=R.P,{hw,hd}=lotLocal23(R.l),bz=P.bz;
  if(!act){const p=R.planTable;return[p.x+rand(-2,1),p.z+rand(-.4,1.2),Y23];}
  const inside=(m)=>[rand(-P.w/2+m,P.w/2-m),bz+rand(-P.d/2+m,P.d/2-m)];
  const ph=s.phase;
  if(ph===0){const p=R.planTable;return[p.x+rand(-.9,.9),p.z+(w.role==='architecte'?-.7:.7),Y23];}
  if(ph===1){return[rand(-P.w/2,P.w/2),bz+P.d/2+1.2,Y23];}
  if(ph===2){if(w.role==='ingenieur')return[rand(-P.w/2,P.w/2),bz+P.d/2+1.4,Y23];const [x,z]=inside(1);return[x,z,workTop23(R)];}
  if(ph===3){if(w.role==='ingenieur')return[rand(-P.w/2,P.w/2),bz+P.d/2+1.6,Y23];
    if(P.t.warehouse){const [x,z]=inside(1.5);return[x,z,P.base];}
    const F=s.prog*P.n,k=Math.min(P.n-1,Math.floor(F)),[x,z]=inside(1.2);return[x,z,P.y0[k]];}
  if(ph===4){if(P.t.warehouse)return[rand(-P.w/2+1,P.w/2-1),bz+P.d/2+.8,P.base];
    const k=Math.floor(Math.random()*Math.min(P.n,Math.max(1,Math.ceil(s.prog*P.n+.01)))),x=rand(-P.w/2+1.2,P.w/2-1.2);return[x,bz+P.d/2-.9,P.y0[k]];}
  if(ph===5){if(w.role==='architecte')return[rand(-P.w/2,P.w/2),bz+P.d/2+(P.t.warehouse?1.6:2.6),Y23];
    if(P.t.warehouse)return[rand(-P.w/2+1,P.w/2-1),bz+P.d/2+1,P.base];
    const Fi=s.prog*(P.n+1),u=Math.min(P.n,Math.max(1,Math.floor(Fi)+1)),k=clamp(P.n-u,0,P.n-1);return[rand(-P.w/2,P.w/2),bz+P.d/2+.68,P.y0[k]+.12];}
  return[w.x,w.z,Y23];
}
function animWorkers23(R,dt,near){
  const s=R.s,act=activeRoles23(s),T=performance.now()*.001;
  R.workers.forEach(w=>{
    const a=act.includes(w.role);
    if(w.wait>0){w.wait-=dt;}
    const dx=w.tx-w.x,dz=w.tz-w.z,d=Math.hypot(dx,dz);
    if(w.wait<=0&&d<.15){const t=target23(R,w,a);
      if(Math.abs(t[2]-w.y)>.3){w.x=t[0];w.z=t[1];}/* change de niveau : il a pris l'échelle */
      w.tx=t[0];w.tz=t[1];w.y=t[2];w.wait=a?rand(2.5,6):rand(3,8);w.work=a?w.wait:0;}
    else if(d>=.15){const st=Math.min(d,1.25*dt);w.x+=dx/d*st;w.z+=dz/d*st;w.h+=angDiff(w.h,Math.atan2(dx,dz))*Math.min(1,8*dt);w.ph+=st*3.4;}
    if(!near){w.mesh.visible=false;return;}
    w.mesh.visible=true;w.mesh.position.set(R.l.x+w.x,w.y+.02,R.l.z+w.z);w.mesh.rotation.y=w.h;
    if(d>=.15)animPerson(w.mesh,w.ph,.6);
    else{animPerson(w.mesh,w.ph,0);const u=w.mesh.userData;
      if(a&&w.work>0&&u.armR){/* coups de marteau, truelle, clé */u.armR.rotation.x=-1.25+Math.sin(T*(w.role==='macon'?9:6)+w.ph)*.45;u.armL.rotation.x=-.35;}
      if(w.wait>0&&!a&&u.armR&&Math.sin(T*.7+w.ph)>.6){u.armR.rotation.x=-.5;}}
  });
}

/* ===================== avancement -> scène ===================== */
const cl01=v=>v<0?0:v>1?1:v;
function apply23(R,force){
  const s=R.s,P=R.P,ph=s.done?6:s.phase,p=s.done?1:s.prog;
  const key=ph+'|'+(Math.round(p*400))+'|'+s.tenants+'|'+s.done;if(!force&&key===R.key)return;R.key=key;
  const done=s.done;
  /* terrassement */
  const tE=ph===1?p:ph>1?1:0;
  R.earth.visible=ph>=1&&ph<=2;R.earth.scale.set((P.w+1.6)*Math.max(.05,tE),1,(P.d+1.6)*Math.max(.05,tE));
  R.pit.visible=ph===1;R.pit.scale.set((P.w+.4)*Math.max(.05,tE),1,(P.d+.4)*Math.max(.05,tE));
  R.pile.visible=ph>=1&&ph<=2;const ps=ph===1?.25+.75*p:ph===2?1-.6*p:0;R.pile.scale.set(ps,ps,ps);R.pile.position.y=Y23+1.1*ps;
  R.stakes.visible=(ph===0&&p>.25)||ph===1;
  /* fondations */
  R.rebar.visible=ph===2&&p<.75;const sl=ph===2?cl01((p-.3)/.7):ph>2?1:0;R.slab.visible=sl>0;R.slab.scale.y=SLAB23*Math.max(.04,sl);R.slab.position.y=Y23+SLAB23*Math.max(.04,sl)/2;
  if(P.t.warehouse)applyWarehouse23(R,ph,p);else applyFloors23(R,ph,p);
  /* base vie */
  R.fence.visible=!done;R.cabin.visible=!done;R.yardMesh.visible=!done&&ph>=2;R.spools.visible=ph===4||(ph===5&&p<.4);
  R.stakes.visible=R.stakes.visible&&!done;
  if(R.done!==done){R.done=done;setBox23(R);rebuildCrew23(s);shopSign23(R);}
  if(R.tn!==s.tenants){R.tn=s.tenants;permitBoard23(R);shopSign23(R);}
}
function applyFloors23(R,ph,p){
  const s=R.s,P=R.P,n=P.n,done=s.done;
  const F=ph===3?p*n:ph>3?n:0,Lt=ph===4?p*n:ph>4?n:0,Fi=ph===5?p*(n+1):ph>5?n+1:0;
  R.floors.forEach(f=>{
    const k=f.k,fr=cl01(F-k),cTop=f.y0+f.H*cl01(fr/.35),wTop=f.y0+f.H*cl01((fr-.3)/.5);
    f.cols.visible=fr>0;f.pc.constant=cTop+.001;
    f.walls.visible=fr>.3;f.pw.constant=wTop+.001;
    f.slab.visible=fr>=.85;f.core.visible=fr>=.82;
    const fin=Fi>=n-k+1;
    f.walls.material=fin?f.wallFinal:f.wallRaw;if(f.glass)f.glass.visible=fin;if(f.fin)f.fin.visible=fin;
    f.core.material=(Lt>=k+.6&&(!done||s.tenants>0))?CORE_L23:CORE_D23;
    f.scaff.visible=!done&&fr>.15&&!fin;
  });
  const roofOn=Fi>=1;R.roof.forEach(m=>m.visible=roofOn);
  if(R.extras)R.extras.visible=done;if(R.awning)R.awning.visible=done;
}
function applyWarehouse23(R,ph,p){
  const s=R.s,P=R.P,nb=P.nb,done=s.done;
  const F=ph===3?p*(nb+1.5):ph>3?nb+1.5:0,Lt=ph===4?p*nb:ph>4?nb:0,Fi=ph===5?p*(nb+1):ph>5?nb+1:0;
  R.frames.forEach((f,i)=>{const fr=cl01((F-i)/.8);f.cols.visible=fr>0;f.cols.scale.y=Math.max(.02,cl01(fr/.6));f.raft.visible=fr>=.75;});
  R.bays.forEach((b,i)=>{b.visible=F>=i+1.4;});
  R.elec.visible=ph>=4;R.lamps.forEach((l,i)=>{l.visible=ph>=4;l.material=Lt>=i+.6?CORE_L23:CORE_D23;});
  R.clad.forEach((c,i)=>{c.visible=Fi>=i+1;});R.gables.visible=Fi>=nb+.5||done;
}
/* animations et ambiance : chaque image */
let litT23=0;
function anim23(dt){
  if(!scene)return;
  const hr=(gameMin%1440)/60,night=hr<6.5||hr>19;CORE_L23.emissiveIntensity=night?1.1:.18;
  const cx=camera.position.x,cz=camera.position.z;
  Object.values(RT23.sites).forEach(R=>{
    const s=R.s;apply23(R);
    const near=Math.hypot(R.l.x-cx,R.l.z-cz)<170;R.g.visible=true;
    const working=!s.done&&rate23(s,s.phase)>0;
    if(R.crane)animCrane23(R,R.crane,dt,working&&(s.phase===3||s.phase===5));
    if(R.exc&&near)animExc23(R,R.exc,dt,working);
    if(R.truck&&near)animTruck23(R,R.truck,dt,working);
    if(R.workers)animWorkers23(R,dt,near);
  });
}

/* ===================== interface : gestionnaire de chantiers ===================== */
const UI23={view:'lots',lot:null,live:[],t:0};
function el23(tag,cls,txt,fn){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;if(fn)e.onclick=fn;return e;}
function uiEnsure23(){
  if(document.getElementById('ch23'))return;
  const d=el23('div');d.id='ch23';d.hidden=true;
  d.innerHTML='<div class="c23" role="dialog" aria-label="Chantiers"><header class="c23-h"><div class="c23-ht"><small id="c23-k">CHANTIERS · FRONT NORD</small><h2 id="c23-t">Terrains</h2></div><div class="c23-hm"><span id="c23-funds"></span><button class="c23-x" type="button" aria-label="Fermer">✕</button></div></header><div id="c23-plan" class="c23-plan"></div><div id="c23-b" class="c23-b"></div></div>';
  $('#app').appendChild(d);d.querySelector('.c23-x').onclick=()=>closePanel();
  d.addEventListener('pointerdown',e=>{if(e.target===d)closePanel();});
}
function openCh23(lotId){
  uiEnsure23();if(typeof closePanel==='function')closePanel();
  panelOpen=true;UI23.lot=lotId||null;UI23.view=lotId?'lot':'lots';$('#ch23').hidden=false;renderCh23();
}
function goCh23(view,lot){UI23.view=view;UI23.lot=lot||UI23.lot;renderCh23();const b=$('#c23-b');if(b)b.scrollTop=0;}
function refreshUI23(full){const d=document.getElementById('ch23');if(!d||d.hidden)return;if(full)renderCh23();else UI23.live.forEach(f=>f());}
function statusOf23(l){
  const own=walletP58.lots.includes(l.id),s=site23(l.id);
  if(!own)return{k:'sale',txt:'À vendre · '+fmt(l.price)};
  if(!s)return{k:'free',txt:'Prêt à bâtir'};
  if(s.done)return{k:'done',txt:s.tenants+'/'+units23(s)+' loué'+(units23(s)>1?'s':'')+' · '+fmt(rentDay23(s))+'/j'};
  const r=rate23(s,s.phase);return{k:r>0?'work':'stop',txt:PH23[s.phase].short+' · '+pct23(s)+' %'};
}
function renderPlan23(){
  const pl=$('#c23-plan');pl.innerHTML='';
  const strip=el23('div','c23-strip');
  LOTS23.forEach(l=>{const st=statusOf23(l),s=site23(l.id),b=el23('button','c23-lot k-'+st.k+(UI23.lot===l.id&&UI23.view!=='lots'?' on':''),null,()=>goCh23('lot',l.id));b.type='button';
    b.style.flexGrow=SIZE23[l.size].w;b.title=l.name;
    const fill=el23('i');fill.style.height=(s?(s.done?100:pct23(s)):0)+'%';b.appendChild(fill);
    b.appendChild(el23('b',null,s?type23(s.type).icon:l.size));strip.appendChild(b);});
  pl.appendChild(strip);
  const leg=el23('div','c23-leg');leg.appendChild(el23('span',null,'◀ Ouest'));leg.appendChild(el23('span',null,'Front nord · 9 terrains'));leg.appendChild(el23('span',null,'Est ▶'));pl.appendChild(leg);
}
function renderCh23(){
  const b=$('#c23-b');if(!b)return;b.innerHTML='';UI23.live=[];ensure23();
  $('#c23-funds').textContent='Disponible '+fmt(funds23());
  renderPlan23();
  if(UI23.view==='lots')viewLots23(b);
  else{const l=lot23(UI23.lot);if(!l){UI23.view='lots';viewLots23(b);return;}const s=site23(l.id);
    if(!walletP58.lots.includes(l.id))viewBuy23(b,l);else if(!s)viewTypes23(b,l);else viewSite23(b,l,s);}
}
function stat23(par,label,value,cls){const d=el23('div','c23-stat'+(cls?' '+cls:''));d.appendChild(el23('small',null,label));const v=el23('b',null,value);d.appendChild(v);par.appendChild(d);return v;}
function viewLots23(b){
  $('#c23-k').textContent='CHANTIERS · FRONT NORD';$('#c23-t').textContent='Terrains & chantiers';
  const D=ensure23(),act=D.sites.filter(s=>!s.done),dn=D.sites.filter(s=>s.done);
  const row=el23('div','c23-stats');stat23(row,'En travaux',String(act.length));stat23(row,'Bâtiments livrés',String(dn.length));stat23(row,'Loyers / jour',fmt(totalRent23()),'hot');stat23(row,'Loyers encaissés',fmt(D.rentTotal||0));b.appendChild(row);
  const grid=el23('div','c23-grid');
  LOTS23.forEach(l=>{const st=statusOf23(l),s=site23(l.id),sz=SIZE23[l.size],c=el23('button','c23-card k-'+st.k,null,()=>goCh23('lot',l.id));c.type='button';
    const top=el23('div','c23-ct');top.appendChild(el23('b',null,l.name));top.appendChild(el23('em','c23-sz',sz.label+' · '+sz.w+'×'+sz.d+' m'));c.appendChild(top);
    c.appendChild(el23('span','c23-cs',s?type23(s.type).icon+' '+type23(s.type).name:st.k==='sale'?'Parcelle nue':'Aucun projet'));
    const bar=el23('div','c23-bar'+(st.k==='work'?' run':''));const f=el23('i');f.style.width=(s?(s.done?100:pct23(s)):0)+'%';bar.appendChild(f);c.appendChild(bar);
    const ft=el23('span','c23-cf',st.txt);c.appendChild(ft);
    if(s&&!s.done)UI23.live.push(()=>{f.style.width=pct23(s)+'%';ft.textContent=statusOf23(l).txt;});
    grid.appendChild(c);});
  b.appendChild(grid);
}
function back23(b){const x=el23('button','c23-back','‹ Tous les terrains',()=>goCh23('lots'));x.type='button';b.appendChild(x);}
function goto23(l){const sp=spotFor23(l);if(typeof setDest==='function')setDest(sp.x,sp.z,l.name);else{wp={x:sp.x,z:sp.z,l:l.name};toast('Itinéraire vers '+l.name,'good');}closePanel();}
function viewBuy23(b,l){
  const sz=SIZE23[l.size];$('#c23-k').textContent='TERRAIN À VENDRE · '+sz.label.toUpperCase();$('#c23-t').textContent=l.name;back23(b);
  const row=el23('div','c23-stats');stat23(row,'Surface',sz.w+' × '+sz.d+' m');stat23(row,'Prix',fmt(l.price),'hot');stat23(row,'Bâtiments possibles',String(TYPES23.filter(t=>t.sizes.includes(l.size)).length));b.appendChild(row);
  const ok=TYPES23.filter(t=>t.sizes.includes(l.size));const p=el23('p','c23-note','Constructible : '+ok.map(t=>t.name.toLowerCase()).join(', ')+'.');b.appendChild(p);
  const acts=el23('div','c23-acts');const buy=el23('button','c23-btn hot','Acheter le terrain · '+fmt(l.price),()=>{buyLot23(l);goCh23('lot',l.id);});buy.type='button';buy.disabled=funds23()<l.price;acts.appendChild(buy);
  const go=el23('button','c23-btn','📍 Y aller',()=>goto23(l));go.type='button';acts.appendChild(go);b.appendChild(acts);
  if(funds23()<l.price)b.appendChild(el23('p','c23-warn','Il te manque '+fmt(l.price-funds23())+'.'));
}
function viewTypes23(b,l){
  const sz=SIZE23[l.size];$('#c23-k').textContent='TON TERRAIN · '+sz.label.toUpperCase()+' · '+sz.w+'×'+sz.d+' M';$('#c23-t').textContent='Que construire ?';back23(b);
  const grid=el23('div','c23-types');
  TYPES23.forEach(t=>{const fits=t.sizes.includes(l.size),c=matCost23(t,l.size),fake={type:t.id,size:l.size,crew:{architecte:1}},units=val23(t.units,l.size),fl=t.warehouse?1:val23(t.floors,l.size);
    const card=el23('div','c23-type'+(fits?'':' off'));
    const h=el23('div','c23-tt');h.appendChild(el23('i',null,t.icon));const hh=el23('div');hh.appendChild(el23('b',null,t.name));hh.appendChild(el23('small',null,t.blurb));h.appendChild(hh);card.appendChild(h);
    if(fits){const facts=el23('div','c23-facts');[['Niveaux',fl===1&&t.warehouse?'7 m sous ferme':String(fl)],['Lots',String(units)],['Loyer max',fmt(val23(t.rent,l.size)*QUAL23[1])+'/j'],['Durée',Math.round(PH23.reduce((a,_,i)=>a+work23(fake,i),0)/60)+' min env.']].forEach(([k,v])=>{const d=el23('span');d.appendChild(el23('small',null,k));d.appendChild(el23('b',null,v));facts.appendChild(d);});card.appendChild(facts);
      const go=el23('button','c23-btn hot','Matériaux · '+fmt(c),()=>{const s=startSite23(l,t);if(s)goCh23('lot',l.id);});go.type='button';go.disabled=funds23()<c;card.appendChild(go);}
    else card.appendChild(el23('p','c23-note',t.sizes.includes('L')?'Il faut un terrain moyen ou grand.':'Réservé aux petits et moyens terrains.'));
    grid.appendChild(card);});
  b.appendChild(grid);
}
function viewSite23(b,l,s){
  const t=type23(s.type),sz=SIZE23[l.size];$('#c23-k').textContent=(s.done?'BÂTIMENT LIVRÉ':'CHANTIER')+' · '+l.name.toUpperCase();$('#c23-t').textContent=t.icon+' '+t.name;back23(b);
  /* progression */
  const hero=el23('div','c23-hero'+(s.done?' done':''));
  const pc=el23('b','c23-pct',(s.done?100:pct23(s))+' %');hero.appendChild(pc);
  const txt=el23('div','c23-ht2');const st=el23('strong');const sub=el23('span');txt.appendChild(st);txt.appendChild(sub);hero.appendChild(txt);
  const bar=el23('div','c23-bar big');const bf=el23('i');bar.appendChild(bf);hero.appendChild(bar);b.appendChild(hero);
  const steps=el23('ol','c23-steps');const stepEls=PH23.map((ph,i)=>{const li=el23('li');li.appendChild(el23('span',null,ph.short));const mini=el23('i');li.appendChild(mini);steps.appendChild(li);return{li,mini};});
  const liv=el23('li');liv.appendChild(el23('span',null,'Livré'));steps.appendChild(liv);b.appendChild(steps);
  const upd=()=>{const p=s.done?100:pct23(s),r=rate23(s,s.phase);pc.textContent=p+' %';bf.style.width=p+'%';bar.classList.toggle('run',!s.done&&r>0);
    if(s.done){st.textContent='Livré · '+s.tenants+'/'+units23(s)+' loué'+(units23(s)>1?'s':'');sub.textContent='Loyers : '+fmt(rentDay23(s))+' / jour (max '+fmt(rentMax23(s))+') · encaissé '+fmt(s.earned);}
    else if(r>0){const e=eta23(s);st.textContent=PH23[s.phase].name+' · '+Math.floor(s.prog*100)+' %';sub.textContent='Livraison '+(e.ok?'dans ≈ ':'≥ ')+mins23(e.t)+(e.ok?'':' · équipe incomplète pour la suite');}
    else{st.textContent=PH23[s.phase].name+' · à l’arrêt';sub.textContent='Il manque : '+missing23(s,s.phase).join(', ');}
    hero.classList.toggle('stop',!s.done&&r<=0);
    stepEls.forEach((e,i)=>{e.li.className=s.done||i<s.phase?'ok':i===s.phase?(r>0?'now':'now stop'):'';e.mini.style.width=(s.done||i<s.phase?100:i===s.phase?s.prog*100:0)+'%';});liv.className=s.done?'ok':'';};
  upd();UI23.live.push(upd);
  if(!s.done){
    const plan=teamPlan23(s),tot=plan.reduce((a,x)=>a+x.p,0);
    if(plan.length){const q=el23('div','c23-quick');const qq=el23('div');qq.appendChild(el23('b',null,'Équipe standard'));qq.appendChild(el23('small',null,'Tout ce qui manque, niveau confirmé, 2 maçons et les engins'));q.appendChild(qq);
      const qb=el23('button','c23-btn hot',fmt(tot),()=>{hireTeam23(s);renderCh23();});qb.type='button';qb.disabled=funds23()<tot;q.appendChild(qb);b.appendChild(q);}
    const need=PH23[s.phase].need;
    /* équipe */
    b.appendChild(el23('h3','c23-sec','Équipe'));
    const crew=el23('div','c23-crew');
    ROLES23.forEach(r=>{const row=el23('div','c23-row'+(need.includes(r.id)&&!(s.crew[r.id]>=0)?' need':''));
      const lab=el23('div','c23-rl');lab.appendChild(el23('i',null,r.icon));const ll=el23('div');ll.appendChild(el23('b',null,r.name));
      ll.appendChild(el23('small',null,s.crew[r.id]>=0?s.names[r.id]+' · '+TIER23[s.crew[r.id]]:need.includes(r.id)?'Requis maintenant':usedIn23(r.id)));lab.appendChild(ll);row.appendChild(lab);
      const ac=el23('div','c23-ra');
      if(s.crew[r.id]>=0)ac.appendChild(el23('span','c23-ok','✓ Engagé'));
      else TIER23.forEach((tn,i)=>{const p=price23(r.tiers[i],s),x=el23('button','c23-tier',null,()=>{if(hireRole23(s,r.id,i))renderCh23();});x.type='button';x.appendChild(el23('small',null,tn+' ×'+SKILL23[i]));x.appendChild(el23('b',null,fmt(p)));x.disabled=funds23()<p;ac.appendChild(x);});
      row.appendChild(ac);crew.appendChild(row);});
    const mr=el23('div','c23-row'+(need.includes('macon')&&!s.crew.macons?' need':''));const ml=el23('div','c23-rl');ml.appendChild(el23('i',null,'🧱'));const mm=el23('div');mm.appendChild(el23('b',null,'Maçons · '+s.crew.macons+'/'+MASON23.max));
    mm.appendChild(el23('small',null,s.mnames.length?s.mnames.join(', '):'Fondations, gros œuvre, façades'));ml.appendChild(mm);mr.appendChild(ml);
    const ma=el23('div','c23-ra');const dots=el23('span','c23-dots');for(let i=0;i<MASON23.max;i++)dots.appendChild(el23('i',i<s.crew.macons?'on':''));ma.appendChild(dots);
    if(s.crew.macons<MASON23.max){const p=price23(MASON23.price,s),x=el23('button','c23-tier',null,()=>{if(hireMason23(s))renderCh23();});x.type='button';x.appendChild(el23('small',null,'+1 maçon'));x.appendChild(el23('b',null,fmt(p)));x.disabled=funds23()<p;ma.appendChild(x);}
    mr.appendChild(ma);crew.appendChild(mr);b.appendChild(crew);
    /* engins */
    b.appendChild(el23('h3','c23-sec','Engins'));
    const eng=el23('div','c23-crew');
    ENG23.forEach(e=>{const st=s.eng[e.id],row=el23('div','c23-row'+(need.includes(e.id)&&st!==1?' need':''));const lab=el23('div','c23-rl');lab.appendChild(el23('i',null,e.icon));const ll=el23('div');ll.appendChild(el23('b',null,e.name));
      ll.appendChild(el23('small',null,st===1?'Sur le chantier · restituée après '+PH23[e.leave-1].name.toLowerCase():st===2||s.phase>=e.leave?'Plus nécessaire':need.includes(e.id)?'Requis maintenant':'Pour : '+e.use.toLowerCase()));lab.appendChild(ll);row.appendChild(lab);
      const ac=el23('div','c23-ra');
      if(st===1)ac.appendChild(el23('span','c23-ok','✓ Sur place'));else if(st===2||s.phase>=e.leave)ac.appendChild(el23('span','c23-mute','—'));
      else{const p=price23(e.price,s),x=el23('button','c23-tier',null,()=>{if(rentEng23(s,e.id))renderCh23();});x.type='button';x.appendChild(el23('small',null,'Location'));x.appendChild(el23('b',null,fmt(p)));x.disabled=funds23()<p;ac.appendChild(x);}
      row.appendChild(ac);eng.appendChild(row);});
    b.appendChild(eng);
  }else{
    b.appendChild(el23('h3','c23-sec','Locataires'));
    const row=el23('div','c23-stats');stat23(row,'Occupation',s.tenants+' / '+units23(s));stat23(row,'Loyer / jour',fmt(rentDay23(s)),'hot');stat23(row,'Qualité archi.',(s.crew.architecte>=0?TIER23[s.crew.architecte]:'—')+' · ×'+(QUAL23[Math.max(0,s.crew.architecte)]||1));stat23(row,'Encaissé',fmt(s.earned));b.appendChild(row);
    const tl=el23('div','c23-ten');if(!s.tl.length)tl.appendChild(el23('p','c23-note','Visites en cours… les premiers locataires arrivent dans l’heure (jeu).'));
    s.tl.forEach((n,i)=>{const c=el23('span',null,n);tl.appendChild(c);});b.appendChild(tl);
    b.appendChild(el23('p','c23-note','Loyers versés en banque toutes les 6 h de jeu.'));
  }
  const acts=el23('div','c23-acts');const go=el23('button','c23-btn','📍 Y aller',()=>goto23(l));go.type='button';acts.appendChild(go);b.appendChild(acts);
}
function usedIn23(rid){return PH23.filter(p=>p.need.includes(rid)).map(p=>p.short).join(', ');}
/* application téléphone */
function appCh23(b){
  const D=ensure23(),c=mk('div','bigc');c.appendChild(mk('small',null,'Chantiers · front nord'));c.appendChild(mk('b',null,fmt(totalRent23())+' / jour'));
  c.appendChild(mk('span',null,D.sites.filter(s=>!s.done).length+' en travaux · '+D.sites.filter(s=>s.done).length+' livré(s) · '+walletP58.lots.length+'/9 terrains'));b.appendChild(c);
  b.appendChild(mk('button','pbtn hot','Ouvrir le gestionnaire',()=>openCh23()));
  LOTS23.forEach(l=>{if(!walletP58.lots.includes(l.id))return;const st=statusOf23(l),r=mk('button','prow',null,()=>openCh23(l.id));r.appendChild(mk('b',null,l.name));r.appendChild(mk('span',null,st.txt));b.appendChild(r);});
  if(!walletP58.lots.length)b.appendChild(mk('p','dim','Aucun terrain. 9 parcelles à vendre au nord de la ville.'));
}

/* ===================== branchements ===================== */
/* v11 : ancien affichage et ancienne logique neutralisés (le mobilier reste dans construction.js) */
showLots11=function(){};tickConstruction11=function(){};
/* collines du nord repoussées hors du carré de la ville : elles recouvraient les terrains */
buildHills=function(){
  const inSq=(x,z)=>Math.abs(x)<268&&z>-268&&z<215;
  for(let i=0;i<30;i++){
    const a=-Math.PI*0.06-i/29*Math.PI*1.12,sx=rand(50,85),sy=rand(18,44),sz=rand(26,40);let r=rand(318,352);
    const c=Math.cos(a),sn=Math.sin(a),tx=-sn,tz=c;
    for(let g=0;g<40;g++){let hit=false;for(let k=0;k<16&&!hit;k++){const th=k/16*Math.PI*2,x=Math.cos(a)*r+tx*Math.cos(th)*sx+c*Math.sin(th)*sz,z=Math.sin(a)*r*1.02+tz*Math.cos(th)*sx+sn*Math.sin(th)*sz;if(inSq(x,z))hit=true;}if(!hit)break;r+=5;}
    let geo=new THREE.IcosahedronGeometry(1,1);if(geo.index)geo=geo.toNonIndexed();const p=geo.attributes.position;
    for(let k=0;k<p.count;k++){const y=p.getY(k);p.setY(k,y<0?y*0.1:y*(1+0.12*Math.sin(p.getX(k)*4+i)));}
    geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,lamb(pick([0x4f7a55,0x5d7f5a,0x58775a,0x6b8a6e])));m.scale.set(sx,sy,sz);m.rotation.y=a+Math.PI/2;m.position.set(Math.cos(a)*r,-2,Math.sin(a)*r*1.02);scene.add(m);
  }
};
function initWorld23(){
  ensure23();if(renderer)renderer.localClippingEnabled=true;
  LOTS23.forEach(l=>{buildLot23(l);const sp=spotFor23(l);addSpot(sp.x,sp.z,'lot23:'+l.id,0xffc23d,spotLabel23(l));const q=spots[spots.length-1];if(q&&q.b){q.b.scale.set(.6,.55,.6);q.b.position.y=2.4;}});
  walletP58.ch23.sites.forEach(s=>{try{buildSite23(s);}catch(e){console.warn('v23 chantier',e);}});
}
function resetWorld23(){Object.keys(RT23.sites).forEach(disposeSite23);if(!scene)return;ensure23();LOTS23.forEach(l=>{buildLot23(l);const sp=spots.find(q=>q.id==='lot23:'+l.id);if(sp)sp.label=spotLabel23(l);});walletP58.ch23.sites.forEach(s=>buildSite23(s));lastMin23=null;}
const _bw23=buildWorld;buildWorld=function(){_bw23();try{initWorld23();}catch(e){console.warn('v23',e);}};
const _rp23=resetPhase58;resetPhase58=function(){_rp23();ensure23();try{resetWorld23();}catch(e){console.warn('v23 reset',e);}};
const _os23=openSpot;openSpot=function(id){if(typeof id==='string'&&id.startsWith('lot23:')){openCh23(id.slice(6));return;}_os23(id);};
const _cp23=closePanel;closePanel=function(){_cp23();const d=document.getElementById('ch23');if(d&&!d.hidden){d.hidden=true;panelOpen=false;}};
const _up23=update;update=function(dt){_up23(dt);try{tick23(dt);anim23(dt);}catch(e){if(!window.__e23){window.__e23=1;console.warn('v23',e);}}UI23.t-=dt;if(UI23.t<=0){UI23.t=.35;refreshUI23(false);const f=document.getElementById('c23-funds');if(f)f.textContent='Disponible '+fmt(funds23());}};
if(typeof gpOverlay==='function'){const _gpo23=gpOverlay;gpOverlay=function(){const e=document.getElementById('ch23');if(e&&!e.hidden)return e;return _gpo23();};}
if(typeof gpPress==='function'){const _gpp23=gpPress;gpPress=function(a){const e=document.getElementById('ch23');if(e&&!e.hidden&&(a==='cancel'||a==='pause')){closePanel();return;}_gpp23(a);};}
{const i=APPS.findIndex(a=>a[0]==='Chantier');const app=['Chantier','🏗️','#ffc23d,#8b5425',appCh23];if(i>=0)APPS[i]=app;else APPS.push(app);}
CHANGELOG.unshift(['v23','Nouveau système de chantier : 9 terrains, immeuble, commerce, entrepôt, équipe à engager, grue à tour, pelleteuse, toupie, loyers']);
{const _bph23=bindPhone;bindPhone=function(){_bph23();const s=document.querySelector('.intro h1 span');if(s)s.textContent='JEU DE RÔLE · v23';};}
{const _as23=appSet;appSet=function(b){_as23(b);b.querySelectorAll('.bigc b').forEach(x=>{if(x.textContent==='v17'||x.textContent===VERSION)x.textContent='v23';});};}
