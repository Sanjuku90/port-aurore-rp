'use strict';
/* ---------- v12 : métiers, grades, XP, uniformes, véhicules pro, stationnement, personnalisation ---------- */
(function(){
const JK='port-aurore-jobs-v1',PK='port-aurore-style-v1',GRX=[0,100,300,700,1500],GM=[1,1.2,1.45,1.75,2.1],GN=['Apprenti','Junior','Confirmé','Senior'];
// id, nom, salaire/j, rang requis, permis, véhicule pro, couleur véhicule, couleur uniforme, couleur casque, grade max, tâches, message, base, $/m, secondes sur place
const JD=[
['livreur','Livreur',22,0,0,0,0,0xe0a526,0xe0a526,'Directeur logistique','Repas chaud;Colis express;Courses du quartier','Commande récupérée.',18,.3,0],
['taxi','Taxi',30,0,'auto','taxi',0xf5c400,0x333a46,0xf5c400,'Chef de flotte','Client à l’aéroport;Client pressé;Touriste au port','Client à bord.',22,.4,0],
['police','Policier',38,1,'service','police',0xf4f4f0,0x1d3f7a,0x16294d,'Commissaire','Cambriolage au port;Bagarre devant le club;Tapage nocturne','Suspect menotté.',30,.45,4],
['ambulancier','Ambulancier',40,1,'service','ambulance',0xf4f4f0,0xd7352c,0xffffff,'Médecin-chef','Malaise en ville;Accident rue du Phare;Transfert hôpital','Patient pris en charge.',34,.5,3],
['pompier','Pompier',42,1,'service','firetruck',0xc82d25,0xe0a526,0xc82d25,'Capitaine','Feu d’entrepôt;Chat dans un arbre;Fuite de gaz','Lance déployée.',36,.5,6],
['bus','Chauffeur de bus',34,0,'pro','bus',0x2e9a6a,0x1f7a52,0x1f7a52,'Chef de ligne','Ligne du centre;Ligne du port;Ligne des Hauts','Voyageurs à bord.',28,.35,2],
['routier','Routier',36,0,'pro','truck',0xe0a526,0x3b5b8a,0xe0a526,'Chef de convoi','Palettes pour le port;Fret frigorifique;Matériaux de chantier','Cargaison chargée.',32,.4,3],
['mecanicien','Mécanicien',28,0,0,0,0,0x2e6fd1,0x2e6fd1,'Chef d’atelier','Vidange chez un client;Changement de pneus;Diagnostic moteur','Pièces récupérées.',24,.2,6],
['pompiste','Pompiste',20,0,0,0,0,0x27754d,0x27754d,'Gérant de station','Plein pour un client;Contrôle des pompes;Livraison de carburant','Bidons chargés.',14,.15,4],
['infirmier','Infirmier',32,0,0,0,0,0x38b6a5,0xffffff,'Cadre de santé','Prise de sang;Pansement à domicile;Vaccination','Matériel de soin prêt.',26,.22,5],
['pecheur','Pêcheur',21,0,0,0,0,0x2d5a7b,0xe8d27a,'Patron de pêche','Relevé des filets;Pêche au large;Vente à la criée','Prise remontée.',16,.2,7],
['docker','Docker',26,0,0,0,0,0xe0732b,0xf5c400,'Chef de quai','Déchargement de conteneur;Arrimage;Pointage des palettes','Conteneur sécurisé.',20,.25,5],
['serveur','Serveur',20,0,0,0,0,0xf2f2ee,0x222222,'Maître d’hôtel','Table 4 du café;Commande en terrasse;Service du soir','Commande prise.',14,.2,3],
['facteur','Facteur',25,0,'moto','scooter',0x3d7be0,0xf2c200,0x2e6fd1,'Chef de centre','Lettres du quartier;Colis recommandé;Tournée du matin','Sacoche remplie.',20,.3,1],
['eboueur','Éboueur',29,0,'pro','truck',0x2e9a6a,0x2e9a6a,0xe0a526,'Chef de voirie','Collecte des bacs;Encombrants;Nettoyage du marché','Bacs chargés.',24,.3,4],
['gendarme','Gendarme',39,1,'service','police',0x22427a,0x233a66,0x15233f,'Colonel','Fugitif en fuite;Contrôle routier;Cambriolage rural','Suspect interpellé.',31,.45,4],
['securite','Agent de sécurité',27,0,0,0,0,0x222831,0x222831,'Chef de la sécurité','Ronde du club;Contrôle à la banque;Surveillance du port','Ronde commencée.',20,.22,5]];
const J={};let jx={},fst={},coDone=false;
const JINFO={
  livreur:'Livraisons de repas, colis et courses dans les quartiers.', taxi:'Prise en charge de clients et trajets à la demande.', police:'Interventions urbaines et sécurisation des appels radio.', ambulancier:'Prise en charge et transport de patients.', pompier:'Interventions de secours et sécurisation des zones.', bus:'Transport de voyageurs sur les lignes de la ville.', routier:'Acheminement de fret et de matériaux.', mecanicien:'Entretien et dépannage de véhicules.', pompiste:'Service en station et contrôle des pompes.', infirmier:'Soins de proximité et visites à domicile.', pecheur:'Relevé des filets et vente de la pêche.', docker:'Manutention, arrimage et contrôle du fret portuaire.', serveur:'Prise de commande et service en salle.', facteur:'Distribution de lettres et colis recommandés.', eboueur:'Collecte et nettoyage des espaces publics.', gendarme:'Patrouilles, contrôles routiers et interventions rurales.', securite:'Rondes et contrôle des accès aux sites sensibles.'
};
try{jx=JSON.parse(localStorage.getItem(JK)||'{}')||{};}catch(e){}
try{fst=JSON.parse(localStorage.getItem(PK)||'{}')||{};}catch(e){}
const xpOf=id=>jx[id]||0,gradeOf=id=>{let g=0;GRX.forEach((t,i)=>{if(xpOf(id)>=t)g=i;});return g;},gname=id=>g4(id),g4=id=>{const g=gradeOf(id);return g<4?GN[g]:J[id].top;};
const sv=(k,o)=>{try{localStorage.setItem(k,JSON.stringify(o));}catch(e){}};
function syncSal(){JD.forEach(r=>{ECON.salary[r[0]]=Math.round(r[2]*GM[gradeOf(r[0])]);});}
JD.forEach(r=>{const j={id:r[0],n:r[1],sal:r[2],rk:r[3],lic:r[4],v:r[5],vc:r[6],uni:r[7],hat:r[8],top:r[9],tasks:r[10].split(';'),msg:r[11],base:r[12],k:r[13],w:r[14]};J[j.id]=j;TXT[j.id]=[j.msg+' ','Mission réussie. ','Mission en retard. '];Object.defineProperty(JOBN,j.id,{get:()=>j.n+' · '+gname(j.id),configurable:true,enumerable:true});});
syncSal();
function gainXp(id,n){const g0=gradeOf(id);jx[id]=xpOf(id)+n;sv(JK,jx);const g=gradeOf(id);syncSal();if(g>g0){const b=60*g;state.cash+=b;toast('Promotion ! '+J[id].n+' · '+gname(id)+' · prime '+fmt(b)+' · salaire '+fmt(ECON.salary[id])+'/j','good');}else toast('+'+n+' XP '+J[id].n,'good');}
// véhicules professionnels
function dropCo(){for(let i=cars.length-1;i>=0;i--){const c=cars[i];if(c.company){if(player.car===c)exitCar();scene.remove(c.mesh);cars.splice(i,1);}}}
function spawnCo(j){dropCo();if(!j.v)return;const c=addCar(player.x+5,player.z,player.h||0,j.vc,'parked',j.v);c.kind='parked';c.company=true;c.fuel=100;toast('Véhicule de service livré : '+j.n+'.','good');}
function hire(j){
  if(j.lic&&!(state.license&&state.license[j.lic])){toast('Permis requis : '+VEHICLE_LICENSE[j.lic],'warn');return;}
  if(rankOf()<j.rk){toast('Rang '+(j.rk+1)+' requis.','warn');return;}
  state.job=j.id;mission=null;beam.visible=false;missionCd=2;spawnCo(j);closePanel();toast('Tu es '+j.n.toLowerCase()+' ('+gname(j.id)+'). Uniforme enfilé.','good');saveProgress();
}
// Pôle Emploi
const _os=openSpot;
openSpot=function(id){
  if(id!=='job')return _os(id);
  const list=()=>openPanel('Pôle Emploi','17 métiers · missions dédiées · 5 grades · promotions automatiques. Le salaire affiché tient compte de ton grade actuel.',JD.map(r=>{const j=J[r[0]],lk=(j.lic&&!(state.license&&state.license[j.lic]))?' · '+VEHICLE_LICENSE[j.lic]:rankOf()<j.rk?' · rang '+(j.rk+1):'';return{label:j.n+' · '+gname(j.id)+' · '+fmt(ECON.salary[j.id])+'/jour'+lk,off:state.job===j.id||!!lk,fn:()=>hire(j)};}));
  if(!state.job||!J[state.job]){list();return;}
  const j=J[state.job],nx=GRX[gradeOf(j.id)+1];
  openPanel('Pôle Emploi',j.n+' · '+gname(j.id)+' · XP '+xpOf(j.id)+(nx?' / '+nx+' avant promotion':' · grade maximum')+' · salaire '+fmt(ECON.salary[j.id])+'/jour · missions totales '+state.done+'.\n'+JINFO[j.id]+' Missions : '+j.tasks.join(' / ')+'.',[
    {label:'Annuler la mission en cours',off:!mission,fn:()=>{mission=null;beam.visible=false;missionCd=4;toast('Mission annulée.','warn');}},
    {label:'Changer de métier',fn:list},
    {label:'Démissionner',fn:()=>{state.job=null;mission=null;beam.visible=false;fxClear();dropCo();closePanel();toast('Tu as quitté ton emploi.','warn');}}]);
};
// ---------- v14 : gameplay propre à chaque métier ----------
const STYLE={livreur:'route',facteur:'route',eboueur:'route',bus:'route',taxi:'ride',routier:'cargo',police:'chase',gendarme:'chase',ambulancier:'medic',pompier:'fire',docker:'shuttle',pecheur:'fish',mecanicien:'quiz',infirmier:'quiz',pompiste:'quiz',serveur:'quiz',securite:'quiz'};
const ROUTE={livreur:{n:3,stop:0,lbl:'Client'},facteur:{n:4,stop:1,lbl:'Boîte aux lettres'},eboueur:{n:5,stop:2,lbl:'Bac'},bus:{n:4,stop:3,lbl:'Arrêt'}};
const QUIZ={
 mecanicien:[['Le moteur fume et la température grimpe.','Remplacer le liquide de refroidissement',['Changer les pneus','Recharger la batterie']],['La voiture tire à droite au freinage.','Changer les plaquettes de frein',['Faire la vidange','Changer les essuie-glaces']],['Le démarreur cliquette, rien ne s’allume.','Recharger la batterie',['Remplacer le pot d’échappement','Gonfler les pneus']],['Frottement métallique dans chaque virage.','Contrôler les roulements de roue',['Refaire la peinture','Changer une ampoule']]],
 infirmier:[['Coupure profonde à la main, ça saigne beaucoup.','Compresser et poser un pansement',['Donner un sirop','Mettre de la glace sur la tête']],['Patient diabétique, tremblant et en sueur.','Donner du sucre et mesurer la glycémie',['Le faire courir','Injecter de l’insuline sans mesurer']],['Brûlure légère sur l’avant-bras.','Refroidir à l’eau tiède 15 minutes',['Mettre du beurre','Percer les cloques']],['Forte fièvre chez un enfant.','Prendre la température et hydrater',['Le couvrir de couvertures','Lui donner un café']]],
 pompiste:[['Citadine essence, client pressé.','Sans plomb 95',['Gazole','GPL']],['Camion de livraison.','Gazole',['Sans plomb 98','Borne électrique']],['Sportive haut de gamme.','Sans plomb 98',['Gazole','Huile moteur']],['Véhicule électrique de service.','Borne électrique',['Gazole','Sans plomb 95']]],
 securite:[['Une personne sans badge veut entrer.','Contrôler l’identité et appeler le responsable',['La laisser passer','La plaquer au sol']],['Alarme incendie déclenchée.','Évacuer calmement les lieux',['Couper l’alarme et continuer','Fermer toutes les issues']],['Bagarre à l’entrée.','Séparer, sécuriser, prévenir la police',['Filmer la scène','Rejoindre la bagarre']],['Sac abandonné près du guichet.','Périmètre de sécurité et alerte',['Ouvrir le sac','Le jeter à la poubelle']]]};
const MENU=['Café','Thé','Jus d’orange','Croissant','Sandwich','Salade','Poisson braisé','Pizza','Tarte','Eau gazeuse'];
const FISH=[['Sardine',14],['Daurade',26],['Bar',38],['Thon',60],['Vieille botte',1]];
let fx=[],fxOwner=null;
const mt3=(c,e)=>new THREE.MeshStandardMaterial({color:c,emissive:e||0,emissiveIntensity:e?.6:0,roughness:.6});
function fxAdd(o,par){(par||scene).add(o);fx.push(o);fxOwner=mission;return o;}
function fxDel(o){if(o&&o.parent)o.parent.remove(o);fx=fx.filter(q=>q!==o);}
function fxClear(){fx.forEach(o=>{if(o.parent)o.parent.remove(o);});fx=[];fxOwner=null;}
function suspectMesh(x,z){const g=new THREE.Group(),b=new THREE.Mesh(new THREE.CylinderGeometry(.33,.3,1.6,10),mt3(0x8b1e1e,0x3a0000));b.position.y=.8;g.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.27,10,8),mt3(0x2b2b2b));h.position.y=1.85;g.add(h);g.position.set(x,0,z);return fxAdd(g);}
function flameMesh(x,z){const f=new THREE.Mesh(new THREE.ConeGeometry(1,2.6,10),new THREE.MeshBasicMaterial({color:0xff6a1a,transparent:true,opacity:.85}));f.position.set(x,1.3,z);return fxAdd(f);}
function crateMesh(){if(!player.mesh)return null;const b=new THREE.Mesh(new THREE.BoxGeometry(.8,.55,.6),mt3(0xe0732b));b.position.set(0,2.35,0);return fxAdd(b,player.mesh);}
const dTo=t=>Math.hypot(player.x-t.x,player.z-t.z),near=(t,r)=>dTo(t)<(r||4),spd=()=>player.car?Math.abs(player.car.v):0;
const inCo=j=>!j.v||(player.car&&player.car.type===j.v);
const nodeNear=(o,a,b)=>{const c=NODES.filter(n=>{const d=Math.hypot(n.x-o.x,n.z-o.z);return d>a&&d<b;});return pick(c.length?c:NODES);};
const hosp=()=>{const h=spots.find(s=>s.id==='hospital');return h?{x:h.x,z:h.z}:{x:0,z:127};};
const clk=s=>s<0?'En retard':Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
const stars=q=>q>=1.15?'★★★':q>=.85?'★★☆':'★☆☆';
const needCo=j=>{if(inCo(j))return true;if(fineCd<=0){fineCd=3;toast('Prends ton véhicule de service ('+j.n+').','warn');}return false;};
const shuf=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
function finish(q,msg){
  const m=mission,j=J[m.kind];q=clamp(q,.2,1.5);const pay=Math.max(5,Math.round(m.pay*q));
  state.cash+=pay;state.earned+=pay;state.done++;const r0=rankOf();state.rep+=q>=.85?2:1;
  toast((msg?msg+' · ':'')+'+'+fmt(pay)+' · '+stars(q),q>=.85?'good':'warn');
  if(rankOf()>r0)toast('Nouveau rang : '+RANKS[rankOf()]+' !','good');
  gainXp(j.id,Math.round(4+12*Math.min(q,1.3)));mission=null;beam.visible=false;missionCd=3;fxClear();
}
function onHit(){const m=mission;if(!m)return;
  if(m.st==='ride'||m.kind==='bus'){m.comfort=Math.max(0,m.comfort-18);toast('Choc ! Confort passager '+Math.round(m.comfort)+' %','bad');}
  else if(m.st==='cargo'&&m.stage==='deliver'){m.integ=Math.max(0,m.integ-15);toast('Choc ! Cargaison '+Math.round(m.integ)+' %','bad');}
  else if(m.st==='medic'&&m.stage==='deliver'){m.cond=Math.max(0,m.cond-10);toast('Choc ! État du patient '+Math.round(m.cond)+' %','bad');}}
const _cw=collideCarWorld;collideCarWorld=function(c){const h=_cw(c);if(h>0&&mission&&c===player.car&&Math.abs(c.v)>5&&(mission.hitCd||0)<=0){mission.hitCd=1;onHit();}return h;};
// création
newMission=function(){
  const j=J[state.job];if(!j)return;fxClear();
  const st=STYLE[j.id]||'route',f=j.v?1:.6,a=nodeNear(player,20,140*f);
  const m={kind:j.id,st,stage:'pickup',pickup:a,drop:a,tgt:a,resto:pick(j.tasks),addr:Math.floor(rand(2,98))+' '+pick(STREETS),time:0,limit:0,wk:0,hitCd:0,ui:null};
  let dist=110,brief='';
  if(st==='route'){const R=ROUTE[j.id];m.stops=[a];let p=a;dist=dTo(a);for(let i=1;i<R.n;i++){const q=nodeNear(p,35*f,90*f);dist+=Math.hypot(q.x-p.x,q.z-p.z);m.stops.push(q);p=q;}m.ix=0;m.stage='deliver';m.limit=Math.round(dist/(j.v?8:4.2)+22*R.n);m.comfort=100;brief=R.n+' arrêts'+(R.stop?' · arrêt complet '+R.stop+' s':'');}
  else if(st==='ride'){m.b=nodeNear(a,70,190);dist=Math.hypot(m.b.x-a.x,m.b.z-a.z);m.comfort=100;m.cli=pick([['pressé',.7,1.3],['touriste',1.3,1],['habitué',1,1.1]]);brief='Client '+m.cli[0];}
  else if(st==='cargo'){m.b=nodeNear(a,90,220);dist=Math.hypot(m.b.x-a.x,m.b.z-a.z);m.integ=100;brief='Cargaison fragile : évite les chocs';}
  else if(st==='chase'){dist=140;brief='Suspect en fuite : rattrape-le';}
  else if(st==='medic'){dist=dTo(a)+Math.hypot(hosp().x-a.x,hosp().z-a.z);m.cond=Math.round(rand(55,85));brief='Patient instable : vite à l’hôpital';}
  else if(st==='fire'){dist=150;brief='3 foyers à éteindre à pied';}
  else if(st==='shuttle'){m.b=nodeNear(a,25,60);m.n=3;m.ix=0;m.carry=0;dist=150;m.limit=150;m.stage='deliver';brief='3 conteneurs à déplacer';}
  else if(st==='fish'){m.b=nodeNear(a,50,140);m.casts=3;m.catch=[];dist=60;brief='3 lancers, appuie sur E quand ça mord';}
  else if(st==='quiz'){dist=dTo(a)+40;if(j.id==='serveur'){const o=shuf(MENU).slice(0,3);m.ord=o;m.b=nodeNear(a,15,45);brief='Retiens bien la commande';}else{m.qz=pick(QUIZ[j.id]);brief='Diagnostic sur place';}}
  m.pay=Math.round((j.base+dist*j.k)*GM[gradeOf(j.id)]);mission=m;
  toast(j.n+' · '+m.resto+' · '+brief+' · ~'+fmt(m.pay),'warn');
};
// déroulement
const STEP={
 route(m,j,dt){const R=ROUTE[j.id];m.time+=dt;m.tgt=m.stops[m.ix];
  m.ui=[R.lbl+' '+(m.ix+1)+'/'+R.n,m.resto+(j.id==='bus'?' · confort '+Math.round(m.comfort)+' %':''),clk(m.limit-m.time)];
  if(!near(m.tgt,j.id==='bus'?5:4)){m.wk=0;return;}if(!needCo(j))return;
  if(R.stop){if(player.car&&spd()>1.2){if(fineCd<=0){fineCd=2;toast('Arrête-toi complètement.','warn');}m.wk=0;return;}m.wk+=dt;m.ui[2]='Arrêt '+Math.ceil(R.stop-m.wk)+' s';if(m.wk<R.stop)return;}
  m.wk=0;m.ix++;if(m.ix<R.n){toast(R.lbl+' validé ('+m.ix+'/'+R.n+').','good');return;}
  const late=m.time>m.limit;finish((late?.7:1.2)*(j.id==='bus'?.6+.4*m.comfort/100:1),late?'Tournée finie en retard':'Tournée bouclée');},
 ride(m,j,dt){
  if(m.stage==='pickup'){m.tgt=m.pickup;m.ui=['Client '+m.cli[0],m.resto,'Pas de chrono'];if(!near(m.tgt,5))return;if(!needCo(j))return;if(spd()>2)return;
   m.stage='deliver';m.tgt=m.b;m.time=0;m.limit=Math.round(Math.hypot(m.b.x-m.pickup.x,m.b.z-m.pickup.z)/9*m.cli[1]+30);toast('Client à bord. Direction '+m.addr+'. Conduis en douceur.','good');return;}
  m.time+=dt;m.tgt=m.b;const c=player.car;if(c&&Math.abs(c.v)>(c.top||27)*.85){m.comfort=Math.max(0,m.comfort-(m.cli[0]==='touriste'?9:5)*dt);if(fineCd<=0){fineCd=4;toast('Le client s’agrippe au siège…','warn');}}
  m.ui=['Déposer le client',m.addr+' · confort '+Math.round(m.comfort)+' %',clk(m.limit-m.time)];
  if(!near(m.tgt,5)||!needCo(j)||spd()>2)return;const late=m.time>m.limit;
  finish((late?.6:1)*(.45+.85*m.comfort/100)*m.cli[2],late?'Client déposé en retard':'Client déposé, pourboire inclus');},
 cargo(m,j,dt){
  if(m.stage==='pickup'){m.tgt=m.pickup;m.ui=['Chargement',m.resto,'Pas de chrono'];if(!near(m.tgt,5)){m.wk=0;return;}if(!needCo(j)||spd()>1.2)return;m.wk+=dt;m.ui[2]='Chargement '+Math.ceil(j.w-m.wk)+' s';if(m.wk<j.w)return;
   m.stage='deliver';m.time=0;m.tgt=m.b;m.limit=Math.round(Math.hypot(m.b.x-m.pickup.x,m.b.z-m.pickup.z)/8+40);toast('Cargaison chargée. Évite les chocs !','good');return;}
  m.time+=dt;m.tgt=m.b;m.ui=['Livrer la cargaison',m.addr+' · intégrité '+Math.round(m.integ)+' %',clk(m.limit-m.time)];
  if(!near(m.tgt,5)||!needCo(j)||spd()>1.5)return;const late=m.time>m.limit;finish((late?.65:1.15)*(.35+.65*m.integ/100),m.integ>80?'Livraison impeccable':'Cargaison abîmée');},
 chase(m,j,dt){
  if(m.stage==='pickup'){m.tgt=m.pickup;m.ui=['Se rendre sur place',m.resto,'Alerte radio'];if(dTo(m.tgt)>22)return;
   const s={x:m.pickup.x+rand(-6,6),z:m.pickup.z+rand(-6,6),v:rand(6,8.5),n:null};s.mesh=suspectMesh(s.x,s.z);m.sus=s;m.stage='chase';m.time=0;m.grab=0;m.lost=0;toast('Le suspect prend la fuite !','bad');return;}
  const s=m.sus;m.time+=dt;
  if(!s.n||Math.hypot(s.n.x-s.x,s.n.z-s.z)<1.5){const c=[0,1,2,3].map(()=>nodeNear(s,25,70));s.n=c.sort((a,b)=>Math.hypot(b.x-player.x,b.z-player.z)-Math.hypot(a.x-player.x,a.z-player.z))[0];}
  const v=s.v*(m.time>45?.6:1)*(m.grab>0?.4:1),dx=s.n.x-s.x,dz=s.n.z-s.z,dd=Math.hypot(dx,dz)||1;s.x+=dx/dd*v*dt;s.z+=dz/dd*v*dt;
  s.mesh.position.set(s.x,0,s.z);s.mesh.rotation.y=Math.atan2(dx,dz);m.tgt=s;const d=dTo(s);
  m.ui=['Poursuite',d<6?'Interpellation… '+Math.min(100,Math.round(m.grab/2.5*100))+' %':'Suspect à '+Math.round(d)+' m',d>90?'Perdu dans '+Math.ceil(15-m.lost)+' s':Math.round(m.time)+' s'];
  if(d<6&&spd()<6){m.grab+=dt;if(m.grab>=2.5)finish(clamp(1.35-m.time/150,.75,1.35),'Suspect interpellé');return;}
  m.grab=Math.max(0,m.grab-dt*.5);
  if(d>90){m.lost+=dt;if(m.lost>15)finish(.3,'Suspect perdu');}else m.lost=0;},
 medic(m,j,dt){
  if(m.stage==='pickup'){m.tgt=m.pickup;m.cond=Math.max(0,m.cond-.25*dt);m.ui=['Rejoindre le patient',m.resto+' · état '+Math.round(m.cond)+' %','Urgence'];
   if(!near(m.tgt,5)){m.wk=0;return;}if(!needCo(j))return;m.wk+=dt;m.ui[2]='Soins '+Math.ceil(j.w-m.wk)+' s';if(m.wk<j.w)return;
   m.stage='deliver';m.tgt=hosp();m.cond=Math.min(100,m.cond+10);toast('Patient stabilisé. Direction l’hôpital !','good');return;}
  m.cond-=.6*dt;m.tgt=hosp();m.ui=['Transport à l’hôpital','État du patient '+Math.max(0,Math.round(m.cond))+' %',m.cond<25?'Critique':'Stable'];
  if(m.cond<=0){finish(.25,'Patient arrivé en état critique');return;}
  if(near(m.tgt,8)&&needCo(j))finish(.5+.9*m.cond/100,'Patient admis aux urgences');},
 fire(m,j,dt){
  if(m.stage==='pickup'){m.tgt=m.pickup;m.ui=['Feu signalé',m.resto,'Fonce !'];if(!near(m.tgt,15))return;if(!needCo(j))return;
   m.stage='fight';m.time=0;m.fl=[0,1,2].map(i=>{const a=i*2.1+rand(0,.6),x=m.pickup.x+Math.cos(a)*7,z=m.pickup.z+Math.sin(a)*7;return{x,z,hp:70,mesh:flameMesh(x,z)};});toast('Descends et approche-toi des flammes avec la lance.','warn');return;}
  m.time+=dt;const live=m.fl.filter(f=>f.hp>0);const t=performance.now()*.01;
  live.forEach(f=>{f.hp=Math.min(100,f.hp+2*dt);if(!player.car&&near(f,3.5))f.hp-=32*dt;const s=Math.max(.15,f.hp/100);f.mesh.scale.set(s,s*(1+.12*Math.sin(t+f.x)),s);if(f.hp<=0){fxDel(f.mesh);toast('Foyer éteint !','good');}});
  const rest=m.fl.filter(f=>f.hp>0);m.ui=['Incendie','Foyers restants : '+rest.length+'/3'+(player.car&&near(m.pickup,20)?' · descends du camion':''),clk(150-m.time)];
  if(!rest.length){finish(clamp(1.4-m.time/110,.7,1.4),'Incendie maîtrisé');return;}
  m.tgt=rest.sort((a,b)=>dTo(a)-dTo(b))[0];if(m.time>150)finish(.4,'Le feu s’est propagé');},
 shuttle(m,j,dt){m.time+=dt;m.tgt=m.carry?m.b:m.pickup;
  m.ui=[m.carry?'Déposer le conteneur':'Accrocher un conteneur','Conteneurs '+m.ix+'/'+m.n,clk(m.limit-m.time)];
  if(!near(m.tgt,4)){m.wk=0;return;}if(player.car){if(fineCd<=0){fineCd=3;toast('Le travail de quai se fait à pied.','warn');}return;}
  m.wk+=dt;m.ui[2]=(m.carry?'Dépose ':'Arrimage ')+Math.ceil(2-m.wk)+' s';if(m.wk<2)return;m.wk=0;
  if(!m.carry){m.carry=1;m.box=crateMesh();toast('Conteneur accroché.','good');return;}
  m.carry=0;fxDel(m.box);m.ix++;if(m.ix<m.n){toast('Conteneur déposé ('+m.ix+'/'+m.n+').','good');return;}
  finish(m.time>m.limit?.7:1.25,'Quai dégagé');},
 fish(m,j,dt){
  if(m.stage==='pickup'){m.tgt=m.pickup;m.ui=['Coin de pêche',m.resto,'Pas de chrono'];if(!near(m.tgt,5))return;if(player.car){if(fineCd<=0){fineCd=3;toast('Descends pour pêcher.','warn');}return;}m.stage='fishing';m.wait=rand(2,5);m.bite=0;toast('Ligne à l’eau… attends que ça morde.');return;}
  if(m.stage==='fishing'){m.tgt=m.pickup;m.ui=['Pêche','Lancers restants : '+m.casts+' · prises '+m.catch.length,m.bite>0?'ÇA MORD : E !':'Patience…'];
   if(!near(m.tgt,7)){m.ui[2]='Reviens au coin de pêche';return;}
   if(m.bite>0){m.bite-=dt;if(m.bite<=0){m.casts--;toast('Raté, le poisson s’est décroché.','warn');m.wait=rand(2,5);}}
   else{m.wait-=dt;if(m.wait<=0){m.bite=1.3;toast('Ça mord ! Appuie sur E !','good');}}
   if(m.casts<=0){if(!m.catch.length){finish(.3,'Aucune prise aujourd’hui');return;}m.stage='deliver';m.tgt=m.b;toast('Direction la criée pour vendre ta pêche.','good');}return;}
  m.tgt=m.b;const val=m.catch.reduce((s,f)=>s+f[1],0);m.ui=['Vente à la criée',m.catch.map(f=>f[0]).join(', '),'Valeur ~'+fmt(val)];
  if(near(m.tgt,5)){m.pay=Math.round((j.base+val)*GM[gradeOf(j.id)]);finish(.8+.15*m.catch.length,'Pêche vendue');}},
 quiz(m,j,dt){const sv=j.id==='serveur';
  if(m.stage==='pickup'){m.tgt=m.pickup;m.ui=[sv?'Prendre la commande':'Intervention',m.resto,'Sur place'];if(!near(m.tgt,4)){m.wk=0;return;}if(player.car){if(fineCd<=0){fineCd=3;toast('Descends du véhicule.','warn');}return;}
   m.wk+=dt;m.ui[2]=(sv?'Commande ':'Diagnostic ')+Math.ceil(j.w-m.wk)+' s';if(m.wk<j.w)return;
   if(sv){m.stage='deliver';m.tgt=m.b;m.time=0;m.show=8;toast('Commande : '+m.ord.join(' + ')+'. Retiens-la !','warn');return;}
   m.stage='ask';m.asked=0;}
  if(sv&&m.stage==='deliver'){m.time+=dt;m.show-=dt;m.tgt=m.b;m.ui=['Passer au comptoir',m.show>0?m.ord.join(' + '):'Commande à retenir…',Math.round(m.time)+' s'];if(!near(m.tgt,4))return;m.stage='ask';m.asked=0;}
  if(m.stage!=='ask')return;m.ui=['Choisis la bonne réponse',sv?'Quelle était la commande ?':m.qz[0],'Réfléchis'];
  const tgt=sv?m.b:m.pickup;if(!near(tgt,6)){m.asked=0;return;}if(m.asked||panelOpen)return;m.asked=1;
  let ok,opts;if(sv){ok=m.ord.join(' + ');const alt=()=>{const o=m.ord.slice();o[Math.floor(rand(0,o.length))]=pick(MENU.filter(x=>!o.includes(x)));return o.join(' + ');};opts=shuf([ok,alt(),alt()]);}else{ok=m.qz[1];opts=shuf([ok].concat(m.qz[2]));}
  const mm=m;openPanel(j.n,sv?'Le client attend sa commande. Qu’est-ce qu’il a demandé ?':m.qz[0],opts.map(o=>({label:o,fn:()=>{if(mission!==mm)return;o===ok?finish(1.3,sv?'Commande parfaite':'Bon diagnostic'):finish(.5,'Mauvais choix · réponse : '+ok);}})));}
};
updateMission=function(dt){
  if(!state.job){mission=null;beam.visible=false;fxClear();return;}
  if(fxOwner&&fxOwner!==mission)fxClear();
  if(!mission){beam.visible=false;missionCd-=dt;if(missionCd<=0)newMission();return;}
  const m=mission,j=J[m.kind];if(!j||!STEP[m.st]){mission=null;return;}
  m.hitCd=(m.hitCd||0)-dt;STEP[m.st](m,j,dt);
  if(mission!==m)return;const t=m.tgt||m.pickup;m.pickup=m.drop=t;
  beam.visible=true;beam.position.x=t.x;beam.position.z=t.z;beam.material.color.setHex(m.st==='chase'&&m.stage==='chase'||m.st==='fire'&&m.stage==='fight'?0xff4d4d:m.stage==='pickup'?0xffb84d:0x58d68d);
};
const _it14=interact;interact=function(){const m=mission;if(m&&m.st==='fish'&&m.stage==='fishing'&&near(m.pickup,7)&&!player.car&&!panelOpen){
  if(m.bite>0){const f=pick(FISH);m.catch.push(f);m.bite=0;m.casts--;m.wait=rand(2,5);toast('Prise : '+f[0]+' (~'+fmt(f[1])+')','good');}else{m.wait=rand(2,5);toast('Trop tôt, le poisson a fui.','warn');}return;}
  _it14();};
const _uh14=updateHud;updateHud=function(){_uh14();if(mission&&mission.ui){$('#m-title').textContent=mission.ui[0];$('#m-text').textContent=mission.ui[1];$('#m-time').textContent=mission.ui[2];$('#m-pay').textContent=fmt(mission.pay);}};
// uniformes
function uniform(){
  const m=player.mesh;if(!m)return;const k=state.job||'';if(m.userData.uj===k)return;m.userData.uj=k;
  if(m.userData.un){m.remove(m.userData.un);m.userData.un=null;}
  const j=J[k];if(!j)return;
  const g=new THREE.Group(),mt=c=>new THREE.MeshStandardMaterial({color:c,roughness:.7});
  const vest=new THREE.Mesh(new THREE.CylinderGeometry(.285,.23,.5,14),mt(j.uni));vest.position.y=1.33;vest.scale.z=.64;g.add(vest);
  const hat=new THREE.Mesh(new THREE.CylinderGeometry(.2,.22,.1,14),mt(j.hat));hat.position.y=1.98;g.add(hat);
  const bd=new THREE.Mesh(new THREE.BoxGeometry(.09,.09,.02),mt(0xffffff));bd.position.set(.12,1.45,.2);g.add(bd);
  if(['livreur','routier','docker','facteur','eboueur','pompier'].includes(k)){const stripe=new THREE.Mesh(new THREE.BoxGeometry(.43,.045,.012),mt(0xf4d03f));stripe.position.set(0,1.28,.188);g.add(stripe);}
  if(['police','gendarme','securite'].includes(k)){const tab=new THREE.Mesh(new THREE.BoxGeometry(.14,.035,.025),mt(j.hat));tab.position.set(-.17,1.55,.16);g.add(tab);}
  m.add(g);m.userData.un=g;
}
// stationnement
const inLot=c=>LOTS.some(l=>Math.abs(c.x-l[0])<l[2]/2&&Math.abs(c.z-l[1])<l[3]/2)||spots.some(s=>Math.hypot(s.x-c.x,s.z-c.z)<16);
const onRoad=c=>roadC.some(v=>Math.abs(c.x-v)<5||Math.abs(c.z-v)<5);
const _ex=exitCar;exitCar=function(){const c=player.car;_ex();if(c&&!player.car&&(c.owned||c.company))c.pk={t:gameMin,lot:inLot(c),road:onRoad(c),f:0};};
const _en=enterCar;enterCar=function(c){if(c&&c.pk){const m=gameMin-c.pk.t;if(c.pk.lot&&m>60){const fee=Math.min(30,Math.ceil(m/60)*2);if(state.cash>=fee){state.cash-=fee;toast('Ticket de parking : '+fmt(fee),'warn');}}c.pk=null;}_en(c);};
// personnalisation esthétique
function applyStyle(c,id){
  const s=fst[id];if(!c||!c.mesh)return;(c.mesh.userData.sx||[]).forEach(o=>c.mesh.remove(o));const L=c.mesh.userData.sx=[];if(!s)return;
  const add=(geo,mat,x,y,z)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);c.mesh.add(o);L.push(o);};
  if(s.neon)add(new THREE.BoxGeometry(1.7,.03,3.8),new THREE.MeshBasicMaterial({color:s.neon,transparent:true,opacity:.75}),0,.12,0);
  if(s.wing)add(new THREE.BoxGeometry(1.7,.07,.38),new THREE.MeshStandardMaterial({color:0x15171b}),0,1.38,-2.05);
  if(s.bar)add(new THREE.BoxGeometry(1.1,.08,.16),new THREE.MeshBasicMaterial({color:0xffffff}),0,1.62,.2);
}
const _sp=spawnFleetVehicle;spawnFleetVehicle=function(id){const c=_sp(id);applyStyle(c,id);return c;};
openPaintShopP4=function(){
  const C=[[0xf4f1ea,'Blanc'],[0x202329,'Noir'],[0xc0392b,'Rouge'],[0x2e6fd1,'Bleu'],[0x2e9a6a,'Vert'],[0xe0a526,'Jaune'],[0x7b4bb3,'Violet'],[0xe8742a,'Orange'],[0xff7fb0,'Rose'],[0x9aa3ad,'Gris'],[0x4a2a1a,'Marron'],[0x16c2c9,'Turquoise']];
  openPanel('Personnalisation','Choisis un véhicule : peinture (12 teintes), néons, aileron, barre LED.',[...new Set(fleetOwned)].map(id=>{const v=FLEET_CATALOG.find(q=>q.id===id);return{label:v.label,fn:()=>{
    const s=fst[id]=fst[id]||{},done=()=>{sv(PK,fst);cars.filter(c=>c.owned&&c.type===id).forEach(c=>applyStyle(c,id));saveProgress();openPaintShopP4();};
    const tg=(l,p,k,val)=>({label:(s[k]===val?'Retirer ':'')+l+(s[k]===val?'':' · '+fmt(p)),off:s[k]!==val&&state.cash<p,fn:()=>{if(s[k]===val)delete s[k];else{state.cash-=p;s[k]=val;}done();}});
    openPanel('Personnalisation · '+v.label,'Tout est sauvegardé et s’applique aux exemplaires sortis.',C.map(([c,n])=>({label:'Peinture '+n,fn:()=>{paintFleet(id,c);openGarageP4();}})).concat([tg('Néon bleu',200,'neon',0x2b9bff),tg('Néon rose',200,'neon',0xff3fb4),tg('Néon vert',200,'neon',0x3dff7a),tg('Aileron',150,'wing',1),tg('Barre LED de toit',120,'bar',1)]));
  }};}));
};
// entreprises supplémentaires
ECON.businesses.push({id:'garage',name:'Garage Aurore',price:19000,income:52},{id:'resto',name:'Restaurant Chez Mamadou',price:21000,income:58},{id:'transport',name:'Aurore Transports',price:26500,income:70},{id:'fuelco',name:'Station Aurora Fuel',price:32000,income:84});
// boucle, reprise de partie, réinitialisation
const _up=update;update=function(dt){
  _up(dt);uniform();
  if(started&&!coDone){coDone=true;const j=J[state.job];if(j&&j.v&&!cars.some(c=>c.company))spawnCo(j);}
  cars.forEach(c=>{const p=c.pk;if(p&&p.road&&!p.lot&&!p.f&&gameMin-p.t>30&&Math.hypot(c.x-player.x,c.z-player.z)>15){p.f=1;if(state.bank>=40)state.bank-=40;else state.cash=Math.max(0,state.cash-40);toast('Amende : stationnement gênant · '+fmt(40),'bad');}});
};
const _rs=resetProgress;resetProgress=function(){_rs();fxClear();jx={};fst={};sv(JK,jx);sv(PK,fst);syncSal();dropCo();};
})();
