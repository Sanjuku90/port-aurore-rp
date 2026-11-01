'use strict';
/* v11 : terrains à bâtir, chantiers visibles et catalogue mobilier étendu. */
const LOTS11=[
  {id:'lot-nord-ouest',name:'Terrain des Docks',x:-192,z:-192,price:2400},
  {id:'lot-nord-est',name:'Terrain du Belvédère',x:192,z:-192,price:3200},
  {id:'lot-sud-ouest',name:'Terrain des Jardins',x:-192,z:160,price:2800},
  {id:'lot-sud-est',name:'Terrain de la Colline',x:192,z:160,price:3600}
];
const HOMES11=[
  {id:'maison',name:'Maison familiale',price:4200,color:0xd7c3a5,roof:0x8b5142,kind:'gable'},
  {id:'villa',name:'Villa contemporaine',price:6800,color:0xe6e5dd,roof:0x343a40,kind:'flat'},
  {id:'duplex',name:'Duplex urbain',price:5400,color:0xc88661,roof:0x4a5260,kind:'duplex'}
];
const homeTypes11=['Chaises & fauteuils','Tables & consoles','Armoires & rangements','Lampes & luminaires','Plantes & jardinières','Tapis & textiles','Miroirs & cadres','Accessoires déco','Étagères & bibliothèques','Objets du quotidien'];
const homeNames11=[
 ['Fauteuil club','Chaise cannée','Tabouret haut','Fauteuil lounge','Chaise de salle à manger'],
 ['Table basse ronde','Console d’entrée','Table d’appoint','Table gigogne','Bureau compact'],
 ['Commode 3 tiroirs','Buffet bas','Armoire vitrée','Meuble à chaussures','Petit secrétaire'],
 ['Lampe arc','Suspension en rotin','Lampe de bureau','Applique murale','Lampadaire trépied'],
 ['Ficus en pot','Palmier d’intérieur','Monstera','Jardinière longue','Bonsaï décoratif'],
 ['Tapis berbère','Tapis géométrique','Tapis rond tissé','Coussin velours','Plaid tricoté'],
 ['Miroir plein pied','Miroir rond laiton','Cadre paysage','Cadre abstrait','Horloge murale'],
 ['Vase céramique','Set de bougies','Sculpture moderne','Plateau décoratif','Panier tressé'],
 ['Étagère murale','Bibliothèque étroite','Étagère à plantes','Échelle décorative','Caisson de rangement'],
 ['Enceinte bluetooth','Ventilateur colonne','Machine à café','Lampe de lecture','Globe terrestre']
];
const HOME_FURN50=[];
for(let g=0;g<10;g++)for(let v=0;v<5;v++){const i=g*5+v;HOME_FURN50.push({id:'home50-'+i,name:homeNames11[g][v],group:g,variant:v,price:160+g*38+v*24,color:[0x8c5c42,0x57717b,0xc29958,0x61724c,0x9b6674][v]});}
HOME_FURN.push(...HOME_FURN50);
walletP58.lots=Array.isArray(walletP58.lots)?walletP58.lots:[];
walletP58.projects=Array.isArray(walletP58.projects)?walletP58.projects:[];
walletP58.furniture=Array.isArray(walletP58.furniture)?walletP58.furniture:[];
function pay11(amount,label){amount=Math.max(0,Math.round(amount));if(state.cash+state.bank<amount)return false;let left=amount,fromCash=Math.min(state.cash,left);if(fromCash){state.cash-=fromCash;left-=fromCash;}if(left)state.bank-=left;if(typeof econTxP58==='function')econTxP58(label,-amount,'Cash / Banque');saveProgress();return true;}
function lotOwned11(id){return walletP58.lots.includes(id);}
function constructionMat11(color,rough=.7,metal=.03){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});}
function constructionBox11(parent,w,h,d,x,y,z,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function showLots11(){if(!scene)return;LOTS11.forEach(p=>{const own=lotOwned11(p.id),ground=new THREE.Mesh(new THREE.BoxGeometry(15,.18,15),constructionMat11(own?0x9bb97b:0xcbbd91));ground.position.set(p.x,.25,p.z);ground.receiveShadow=true;scene.add(ground);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(15,.12,15)),new THREE.LineBasicMaterial({color:own?0x60bd76:0xffc44f}));edges.position.set(p.x,.4,p.z);scene.add(edges);if(!own){const sign=new THREE.Mesh(new THREE.BoxGeometry(1.35,1.2,.12),constructionMat11(0x203a43));sign.position.set(p.x-6.4,.9,p.z+5.8);scene.add(sign);}});walletP58.projects.forEach(syncProject11);}
function buildLandHome11(lot,style,project){
  const g=project.group,base=constructionMat11(style.color),trim=constructionMat11(0xf2eadc),dark=constructionMat11(0x34434a,.38,.22),glass=new THREE.MeshStandardMaterial({color:0x79b5c5,roughness:.18,metalness:.16,transparent:true,opacity:.76}),roof=constructionMat11(style.roof,.85);
  // Une façade simple mais lisible: entrée, baies, encadrements et toiture identifiable.
  constructionBox11(g,9,.35,8,0,.35,0,constructionMat11(0x777b7b));
  constructionBox11(g,8,3.5,7,0,2.25,0,base);
  constructionBox11(g,1.3,2.35,.16,0,1.55,3.58,dark);constructionBox11(g,.14,2.35,.18,0,1.55,3.67,constructionMat11(0xcba65e,.4,.35));
  [-2.45,2.45].forEach(x=>{constructionBox11(g,1.55,1.65,.14,x,2.2,3.59,glass);constructionBox11(g,1.7,.12,.22,x,2.2,3.66,trim);constructionBox11(g,.12,1.75,.22,x,2.2,3.66,trim);});
  [-2.5,0,2.5].forEach(x=>constructionBox11(g,.18,3.7,.18,x,2.2,3.66,trim));
  constructionBox11(g,9,.35,8,0,4.15,0,trim);
  if(style.kind==='gable'){
    const ridge=new THREE.Mesh(new THREE.ConeGeometry(6.1,2.3,4),roof);ridge.rotation.y=Math.PI/4;ridge.scale.set(1,.65,.85);ridge.position.set(0,5.25,0);ridge.castShadow=true;g.add(ridge);
    constructionBox11(g,.55,1.2,.55,3.2,5.05,1.5,constructionMat11(0x8e4e37));
  }else{
    constructionBox11(g,9,.28,8,0,4.48,0,roof);constructionBox11(g,8.2,.55,7.2,0,4.85,0,dark);
    if(style.kind==='duplex'){
      constructionBox11(g,5,2.7,6.2,0,6.4,-.1,base);constructionBox11(g,5.8,.22,6.8,0,5.05,0,dark);
      [-1.55,1.55].forEach(x=>constructionBox11(g,1.3,1.35,.12,x,6.3,3.08,glass));
      constructionBox11(g,5.2,.14,1.5,0,5.2,3.25,trim);
    }
  }
  constructionBox11(g,10,.22,.3,0,.5,4.1,constructionMat11(0xb8ae9c));
  project.complete=true;project.stage=4;project.time=0;project.group.userData.complete=true;
  boxes.push({x0:lot.x-4.4,x1:lot.x+4.4,z0:lot.z-3.8,z1:lot.z+3.8,big:true});
}
function createProject11(project){
  const lot=LOTS11.find(l=>l.id===project.lotId),style=HOMES11.find(h=>h.id===project.styleId);if(!lot||!style)return;
  const savedStage=Math.max(0,Math.min(4,project.stage||0)),savedTime=project.timer||0,savedComplete=!!project.complete;
  const g=new THREE.Group();g.position.set(lot.x,.2,lot.z);scene.add(g);project.group=g;project.stage=project.stage||0;project.time=project.time||0;
  const concrete=constructionMat11(0x777d7d),steel=constructionMat11(0x58646b,.4,.65),yellow=constructionMat11(0xf0b72e,.45,.45),hiVis=constructionMat11(0xff9e27),skin=constructionMat11(0x9b644a),dark=constructionMat11(0x25343c);
  constructionBox11(g,12,.12,12,0,.03,0,constructionMat11(0x827d70));
  // mini-grue, flèche pivotante, câble et crochet
  const mast=constructionBox11(g,.42,8,.42,-6,4,5,steel);mast.userData.mast=true;
  constructionBox11(g,5.7,.3,.34,-3.25,7.9,5,yellow);constructionBox11(g,1.1,.42,.7,-.3,7.9,5,dark);
  const cable=constructionBox11(g,.06,2,.06,-2.3,6.8,5,steel);cable.userData.cable=true;
  constructionBox11(g,.42,.22,.16,-2.3,5.75,5,yellow);
  constructionBox11(g,1.6,.45,1.6,-6,.35,5,steel);
  // Équipe en gilets et casques, reconnaissable même à petite échelle.
  [-4.6,-3.5].forEach((x,i)=>{constructionBox11(g,.34,.68,.24,x,.72,-4.6,hiVis);const head=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),skin);head.position.set(x,1.16,-4.6);g.add(head);constructionBox11(g,.38,.12,.3,x,1.31,-4.6,yellow);constructionBox11(g,.12,.48,.13,x+(i?-.23:.23),.66,-4.6,dark);});
  project.group=g;project.timer=savedTime;project.stage=0;project.renderedStage=0;project.complete=false;
  while(project.renderedStage<savedStage){project.renderedStage++;stageProject11(project,project.renderedStage);}
  if(savedComplete&&!project.complete){project.renderedStage=4;stageProject11(project,4);}
}
function stageProject11(project,stage){
  const lot=LOTS11.find(l=>l.id===project.lotId),style=HOMES11.find(h=>h.id===project.styleId),g=project.group;if(!lot||!style||!g)return;
  const stone=constructionMat11(0x909798),timber=constructionMat11(0xa9794c),wall=constructionMat11(style.color),glass=constructionMat11(0x6f9ea8,.3,.1),roof=constructionMat11(style.roof);
  if(stage===1){constructionBox11(g,9,.38,8,0,.32,0,stone);for(let x=-3.7;x<=3.71;x+=2.47)constructionBox11(g,.16,3.3,.16,x,2.1,-3,timber);}
  if(stage===2){constructionBox11(g,8.5,3.1,7,0,2.05,0,wall);[-2.5,0,2.5].forEach(x=>{constructionBox11(g,.16,3.4,.16,x,2,3.55,timber);});[-2.45,2.45].forEach(x=>constructionBox11(g,1.65,1.4,.12,x,2.15,3.61,glass));}
  if(stage===3){constructionBox11(g,9,.3,8,0,3.75,0,roof);if(style.kind==='gable'){const r=new THREE.Mesh(new THREE.ConeGeometry(6,2,4),roof);r.rotation.y=Math.PI/4;r.scale.set(1,.6,.85);r.position.set(0,4.8,0);g.add(r);}constructionBox11(g,1.3,2.3,.16,0,1.5,3.61,constructionMat11(0x35454c));}
  for(let side=0;side<4;side++){const x=side<2?(side===0?-5:5):0,z=side>=2?(side===2?-4.7:4.7):0,vertical=side<2;constructionBox11(g,vertical?.12:10,5,.12,x,2.6,z,steel);constructionBox11(g,vertical?.12:10,.12,.12,x,5.1,z,steel);}
  if(stage>=4)buildLandHome11(lot,style,project);
}
function syncProject11(project){if(!project.group){createProject11(project);return;}if(project.stage===0)return;while(project.renderedStage<project.stage){project.renderedStage=(project.renderedStage||0)+1;stageProject11(project,project.renderedStage);}}
function tickConstruction11(dt){if(!started)return;if(!Array.isArray(walletP58.projects))walletP58.projects=[];if(!Array.isArray(walletP58.lots))walletP58.lots=[];let changed=false;walletP58.projects.forEach(p=>{if(p.complete)return;p.timer=(p.timer||0)+dt;if(p.timer>=15){p.timer-=15;p.stage=Math.min(4,(p.stage||0)+1);p.renderedStage=p.stage;stageProject11(p,p.stage);changed=true;if(p.stage===4){toast('Chantier terminé : ta maison est prête !','good');saveProgress();}else toast('Chantier · étape '+p.stage+'/4 : '+['','fondations et structure','murs et menuiseries','toiture et finitions'][p.stage],'good');}});if(changed)saveEconomyP58();}
const _updateConstruction11=update;update=function(dt){_updateConstruction11(dt);tickConstruction11(dt);};
function buyLot11(lot){if(lotOwned11(lot.id)||!pay11(lot.price,'Achat terrain · '+lot.name)){toast('Il te faut '+fmt(lot.price)+' disponibles en cash et en banque.','warn');return;}walletP58.lots.push(lot.id);saveEconomyP58();toast(lot.name+' acheté. Choisis maintenant le bâtiment à construire.','good');showLots11();landPanel11();}
function chooseBuild11(lot){const opts=HOMES11.map(h=>({label:h.name+' · matériaux '+fmt(h.price),off:state.cash+state.bank<h.price,fn:()=>hireTeam11(lot,h)}));openPanel('Quel bâtiment construire ?','Une équipe et une grue restent sur le terrain pendant les travaux. Construction en quatre étapes visibles.',opts);}
function hireTeam11(lot,home){const existing=walletP58.projects.find(p=>p.lotId===lot.id);if(existing){toast('Un chantier est déjà prévu sur ce terrain.','warn');return;}const price=home.price+1450;if(!pay11(price,'Équipe, ingénieurs et grue · '+home.name)){toast('Fonds insuffisants pour le chantier et l’équipe.','warn');landPanel11();return;}const p={id:'project-'+Date.now(),lotId:lot.id,styleId:home.id,stage:0,renderedStage:0,timer:0,complete:false};walletP58.projects.push(p);createProject11(p);saveEconomyP58();toast('Ingénieurs, maçons et grue mobilisés. Le chantier démarre !','good');landPanel11();}
function landPanel11(){const opts=[];LOTS11.forEach(l=>{const own=lotOwned11(l.id),project=walletP58.projects.find(p=>p.lotId===l.id);if(!own)opts.push({label:'Acheter · '+l.name+' · '+fmt(l.price),off:state.cash+state.bank<l.price,fn:()=>buyLot11(l)});else if(project){const h=HOMES11.find(a=>a.id===project.styleId);opts.push({label:(project.complete?'✓ Terminé · ':'🚧 Étape '+project.stage+'/4 · ')+l.name+' · '+(h?h.name:'Maison'),off:true});}else opts.push({label:'Construire sur · '+l.name,fn:()=>chooseBuild11(l)});});openPanel('Terrains & chantiers','Achète une parcelle, choisis un bâtiment, puis engage ingénieurs, ouvriers et grue. Le chantier avance en direct par étapes.',opts);}
function constructionApp11(b){const intro=mk('div','bigc');intro.appendChild(mk('small',null,'Terrains, ingénieurs et construction'));intro.appendChild(mk('b',null,walletP58.projects.filter(p=>!p.complete).length+' chantier(s) en cours'));intro.appendChild(mk('span',null,'4 parcelles disponibles · équipe, échafaudages et grue visibles sur place'));b.appendChild(intro);b.appendChild(mk('button','pbtn hot','Gérer terrains et chantiers',()=>{closePanel();landPanel11();}));LOTS11.forEach(l=>{const p=walletP58.projects.find(x=>x.lotId===l.id),row=mk('div','prow');row.appendChild(mk('b',null,l.name));row.appendChild(mk('span',null,!lotOwned11(l.id)?'À vendre · '+fmt(l.price):p?(p.complete?'Maison terminée':('Construction '+p.stage+'/4')):'Terrain à toi · prêt à bâtir'));b.appendChild(row);});}
addPhoneAppP58('Chantier','🏗️','#f4c153,#8b5425',constructionApp11);
const _buildWorld11=buildWorld;buildWorld=function(){_buildWorld11();showLots11();};
const _buildHome11=buildHome7;buildHome7=function(R){_buildHome11(R);(walletP58.furniture||[]).forEach(id=>addHomeFurnitureP58(R,id));};
const _furnBase11=addHomeFurnitureP58;addHomeFurnitureP58=function(R,id){_furnBase11(R,id);if(!id||!id.startsWith('home50-')||!R||!R.G)return;R.furnBuilt11=R.furnBuilt11||[];if(R.furnBuilt11.includes(id))return;R.furnBuilt11.push(id);const item=HOME_FURN50.find(x=>x.id===id);if(!item)return;const n=+id.slice(7),g=item.group,v=item.variant,color=item.color,mat=constructionMat11(color),wood=constructionMat11([0x8c5c42,0xc69a67,0x51443b][v%3]),metal=constructionMat11(0x41484b,.38,.6),group=new THREE.Group();R.G.add(group);
 const box=(w,h,d,x,y,z,m)=>constructionBox11(group,w,h,d,x,y,z,m),cyl=(rt,rb,h,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,12),m);o.position.set(x,y,z);o.castShadow=true;group.add(o);return o;};
 if(g===0){box(.62,.16,.62,0,.62,0,mat);box(.62,.15,.18,0,.79,-.22,mat);[[-.23,-.22],[.23,-.22],[-.23,.22],[.23,.22]].forEach(p=>box(.07,.57,.07,p[0],.29,p[1],wood));if(v===0)box(.1,.55,.52,0,.3,.23,metal);}
 if(g===1){box(.75,.12,.55,0,.72,0,wood);[[-.29,-.2],[.29,-.2],[-.29,.2],[.29,.2]].forEach(p=>box(.07,.7,.07,p[0],.35,p[1],metal));if(v===0)cyl(.36,.36,.1,0,.8,0,mat);}
 if(g===2){box(.72,.95,.42,0,.68,0,wood);box(.66,.7,.04,0,.72,.23,mat);for(let y=.38;y<1.2;y+=.24)box(.65,.035,.03,0,y,.26,metal);box(.04,.8,.03,0,.7,.29,metal);}
 if(g===3){cyl(.035,.045,1.2,0,.62,0,metal);if(v===0){const shade=new THREE.Mesh(new THREE.ConeGeometry(.34,.36,16),mat);shade.position.y=1.34;group.add(shade);}else{cyl(.24,.1,.15,0,1.25,0,mat);}}
 if(g===4){cyl(.22,.16,.3,0,.16,0,wood);for(let k=0;k<5;k++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),mat);leaf.scale.set(.65,1.5,.65);leaf.position.set(Math.sin(k*1.2)*.12,.52+(k%2)*.08,Math.cos(k*1.2)*.12);group.add(leaf);}}
 if(g===5){const rug=new THREE.Mesh(new THREE.CircleGeometry(.52,24),mat);rug.rotation.x=-Math.PI/2;rug.scale.set(1.3,.8,1);rug.position.y=.04;group.add(rug);if(v>=3){box(.42,.08,.42,0,.12,0,wood);}}
 if(g===6){box(.66,.82,.06,0,1.35,0,wood);box(.52,.68,.025,0,1.35,.045,mat);if(v===0)cyl(.22,.22,.04,0,1.35,.07,metal);}
 if(g===7){cyl(.22,.18,.42,0,.35,0,mat);if(v===0){const vase=new THREE.Mesh(new THREE.ConeGeometry(.18,.38,12),wood);vase.position.y=.72;group.add(vase);}else{for(let k=0;k<3;k++){const candle=new THREE.Mesh(new THREE.CylinderGeometry(.055,.06,.3,8),wood);candle.position.set((k-1)*.14,.58,0);group.add(candle);}}}
 if(g===8){for(let y=.35;y<1.3;y+=.3)box(.72,.06,.28,0,y,0,wood);[[-.33,0],[.33,0]].forEach(p=>box(.05,1.3,.28,p[0],.68,0,metal));}
 if(g===9){box(.42,.5,.32,0,.45,0,mat);box(.34,.22,.04,0,.5,.18,metal);if(v===4){const globe=new THREE.Mesh(new THREE.SphereGeometry(.24,14,10),mat);globe.position.y=1.05;group.add(globe);}}
 // 50 emplacements compacts, répartis dans les pièces sans modifier les collisions.
 const col=n%10,row=Math.floor(n/10);group.position.set(-7.3+col*1.62,.18,-5.15+row*2.35);group.scale.setScalar(.78);};
function furniturePanelP58(){openPanel('Mobilier · 54 nouveautés','50 nouveaux articles, plus les 4 collections déjà présentes. Chaque achat est posé dans ton appartement.',HOME_FURN.map(x=>({label:(walletP58.furniture.includes(x.id)?'✓ ':'')+x.name+' · '+fmt(x.price),off:walletP58.furniture.includes(x.id)||state.cash<x.price,fn:()=>{if(!econDebitP58(x.price,'Mobilier · '+x.name,false))return;walletP58.furniture.push(x.id);const R=ROOMS.home;if(R)addHomeFurnitureP58(R,x.id);toast(x.name+' installé chez toi.','good');saveEconomyP58();furniturePanelP58();}})));}
// Correctif direct du bug d’achat par message : l’ancien handler dépensait sans vérifier le solde.
const _sendMsg11=sendMsg;sendMsg=function(n,t,k){if(k===2&&state.cash<15){toast('Pas assez de cash pour offrir le repas.','warn');return;}if(typeof blackout!=='undefined'&&blackout>0){toast('Pas de réseau.','warn');return;}if(k===2)state.cash-=15;(threads[n]=threads[n]||[]).push({me:1,t});phThread(n);setTimeout(()=>{const ok=k&&(cool[n]||0)<performance.now();if(ok)cool[n]=performance.now()+60000;threads[n].push({t:k===1?'Carrément ! RDV au Club Néon.':k===2?'Trop sympa, merci !':pick(REPLIES)});if(!$('#phone').hidden&&phThN===n)phThread(n);else unread[n]=(unread[n]||0)+1;if(ok){state.fun=Math.min(100,state.fun+(k===2?25:15));state.rep+=1;toast('Bon moment avec '+n+'. +humeur','good');}saveProgress();},1500);};
// Détails de façade dédiés aux lieux majeurs pour qu’on les reconnaisse sans lire l’enseigne.
function detailMajorBuilding11(x,z,w,d,kind){const g=new THREE.Group();scene.add(g);const front=z-d/2-.08;const paint=(c,m=.04)=>constructionMat11(c,.72,m),add=(ww,hh,dd,xx,yy,zz,c)=>constructionBox11(g,ww,hh,dd,xx,yy,zz,paint(c));
 if(kind==='bank'){add(w*.72,.55,.42,x,1.1,front,0x24365f);for(let i=-2;i<=2;i++)add(.42,5,.38,x+i*2.25,2.85,front,0xd1c6ad);add(w*.82,.38,.62,x,5.5,front,0x26356a);add(2.4,1.1,.1,x,4.35,front-.25,0x79b8c8);}
 if(kind==='shop'){add(w*.84,.62,.45,x,4.7,front,0x26784e);for(let i=-2;i<=2;i++)add(.14,2.1,.24,x+i*3.4,2.5,front,0xd9e6cf);add(7,.12,2.1,x,4.15,front-.55,0xe3bd64);}
 if(kind==='home'){for(let floor=0;floor<3;floor++)for(let i=-2;i<=2;i++){const xx=x+i*3.1;add(1.8,.14,.6,xx,3.2+floor*4,front-.18,0xd9cbb5);add(1.7,1.5,.1,xx,4+floor*4,front-.32,0x709cad);add(1.8,.12,.45,xx,3.23+floor*4,front-.48,0x43494a);}add(w*.72,.4,.7,x,1,front-.3,0xb35d40);}
 if(kind==='club'){add(w*.88,1,.5,x,3.5,front,0x24103f);add(w*.68,.22,.7,x,4.35,front-.45,0xff3cab);[-1,1].forEach(i=>add(.18,4,.18,x+i*w*.35,2.4,front-.25,0x8136a3));}
 if(kind==='hospital'){add(3,3.5,.45,x,5.5,front-.2,0xf0f3f3);add(.8,2.6,.55,x,5.5,front-.5,0xc73e41);add(2.5,.8,.55,x,5.5,front-.5,0xc73e41);add(w*.58,.4,.8,x,1.1,front-.4,0xdde7e9);}
 if(kind==='job'){add(w*.75,.22,.45,x,1.2,front-.2,0x253e5e);for(let i=-2;i<=2;i++)add(.12,4,.22,x+i*w*.15,2.8,front-.32,0x5b8790);add(w*.62,.25,.52,x,5,front-.2,0x1e4772);}
}
const _addBuilding11=addBuilding;addBuilding=function(cx,cz,w,d,h,mi,o){const body=_addBuilding11(cx,cz,w,d,h,mi,o);const targets=[[0,-14,'job'],[64,-10,'shop'],[-64,-10,'bank'],[-64,54,'home'],[64,54,'club'],[0,116,'hospital']];const t=targets.find(q=>Math.abs(q[0]-cx)<.1&&Math.abs(q[1]-cz)<.1);if(t)detailMajorBuilding11(cx,cz,w,d,t[2]);return body;};
const _resetConstruction11=resetProgress;resetProgress=function(){_resetConstruction11();walletP58.lots=[];walletP58.projects=[];walletP58.furniture=walletP58.furniture.filter(id=>!id.startsWith('home50-'));};
