'use strict';
/* v30: quartier des villas, campus vivant, commerces complets et sports jouables. */
(function(){
const U=MG29._util;
const LUX=[0xe8dfca,0xf2eee5,0xcbbfa8,0x9baeb8],ROOF=[0x303b49,0x5c4035,0x394d5c];
function box(x,y,z,w,h,d,c,parent){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c,roughness:.76,metalness:.04}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;(parent||scene).add(m);return m;}
function facade(x,z,name,color,wide,deep){const w=wide||23,d=deep||18,h=9,g=new THREE.Group();
  box(x,h/2,z,w,h,d,color,g);box(x,h+.25,z,w+.5,.5,d+.5,pick(ROOF),g);box(x,h*.36,z+d/2+.05,w*.76,h*.37,.1,0x243b4b,g);
  for(let i=-2;i<=2;i++){box(x+i*w*.16,h*.68,z+d/2+.1,1.8,1.8,.12,0x75a9bc,g);box(x+i*w*.16,h*.68,z+d/2+.18,.08,1.9,.08,0xd8d0c1,g);}
  box(x,h*.26,z+d/2+.18,2.2,4,.3,0x433b34,g);
  const sg=sign27(name,w*.82,1.5,'#1b2d39','#f7efd9');sg.position.set(x,h*.84,z+d/2+.22);scene.add(sg);scene.add(g);
  col27(x-w/2,x+w/2,z-d/2,z+d/2,true);return g;
}
function villa(x,z,n,rent){const w=24,d=20,h=9.5,color=pick(LUX),roof=pick(ROOF),g=new THREE.Group();
  box(x,h/2,z,w,h,d,color,g);box(x,h+.25,z,w+1,.5,d+1,roof,g);box(x,h*.36,z+d/2+.06,w*.62,h*.34,.12,0x233c4b,g);
  for(let s of [-1,1]){box(x+s*7,h*.7,z+d/2+.1,3.2,2.2,.14,0x8ab5c4,g);box(x+s*7,h*.7,z+d/2+.18,.1,2.3,.08,0xf0e6d5,g);box(x+s*7,h*.58,z+d/2+.3,4,.12,1.2,0x785238,g);}
  box(x,h*.25,z+d/2+.2,2.1,4,.35,0x49382e,g);box(x,h*.5,z+d/2+.22,1.4,.18,.08,0xd7bd77,g);
  for(let s of [-1,1]){box(x+s*10,1.4,z+d/2+2,.18,2.8,.18,0x423b32,g);box(x+s*10,2.9,z+d/2+2,.8,.14,.8,0x405348,g);}
  const sg=sign27(rent?'VILLA À LOUER':n,9,1.1,rent?'#446b53':'#23384b','#ffffff');sg.position.set(x,2.6,z+d/2+2.4);scene.add(sg);
  col27(x-w/2,x+w/2,z-d/2,z+d/2,true);addSpot27(x,z+d/2+5,'zone30:villa'+n,0xd9bf77,rent?'Villa à louer · '+n:'Villa '+n,0.8);
}
function groundSport(x,z,w,d,c){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({color:c,roughness:.9}));m.rotation.x=-Math.PI/2;m.position.set(x,.11,z);m.receiveShadow=true;scene.add(m);}
function line(x,y,z,w,h,d,c){box(x,y,z,w,h,d,c);}
function richDistrict(){
 road27(180,-302,180,-486,10,{lamps:22});
 const s=sign27(['RÉSIDENCES DU BELVÉDÈRE','VILLAS · LOCATION · SERVICES'],15,3,'#213e36','#f2dfae');s.position.set(180,4,-315);scene.add(s);
 [[125,-365,'A'],[220,-365,'B'],[125,-425,'C'],[220,-425,'D']].forEach((p,i)=>villa(p[0],p[1],p[2],i===1||i===3));
 // résidents visibles dans les jardins
 for(let i=0;i<8;i++){const p=makePerson(pick(SHIRTS),pick(PANTS),pick(SKINS),pick(HAIRS),{style:pick(['court','afro','queue','chignon']),top:pick(['tee','long','veste']),bag:false});p.position.set(100+(i%4)*40,.1,-345-Math.floor(i/4)*64);p.rotation.y=rand(-Math.PI,Math.PI);scene.add(p);W30.people.push({m:p,ph:rand(0,6),x:p.position.x,z:p.position.z});}
 // marché et restaurant, des lieux actifs à deux pas des villas
 facade(135,-493,'MARCHÉ DE LA LAGUNE',0xd2a756,30,18);addSpot27(135,-480,'zone30:market',0xffc23d,'Marché de la Lagune');
 facade(220,-493,'CHEZ MAMA ADJO',0xb35c43,28,18);addSpot27(220,-480,'zone30:mama',0xff8f6b,'Chez Mama Adjo');
 // complexe de sport, terrains marqués et accessibles
 groundSport(160,-625,82,48,0x397b4c);line(160,.14,-625,.25,.02,48,0xe8e8dc);line(160,.14,-625,82,.02,.25,0xe8e8dc);line(160,.14,-625,.25,.02,28,0xe8e8dc);
 [-1,1].forEach(a=>{line(160+a*32,.14,-625,12,.02,21,0xe8e8dc);line(160+a*38,.14,-625,1,.02,9,0xe8e8dc);});
 groundSport(242,-625,38,30,0xc77848);line(242,.15,-625,38,.03,.35,0xf5f1e9);line(242,.15,-625,.35,.03,30,0xf5f1e9);line(242,.16,-610,5,.08,.2,0xf5f1e9);line(242,.16,-640,5,.08,.2,0xf5f1e9);
 groundSport(147,-700,32,22,0x3c8b89);for(let i=0;i<4;i++)line(147,.14,-708+i*5.3,30,.02,.12,0xe6f4ed);
 facade(225,-700,'CENTRE SPORTIF AURORE',0x447b79,32,18);
 [['football',160,-594],['basket',242,-601],['tennis',147,-684],['swim',180,-730],['gym',225,-716],['cycle',275,-700]].forEach(([k,x,z])=>addSpot27(x,z,'zone30:sport:'+k,0x56d8a5,({football:'Football à 5',basket:'Basket-ball',tennis:'Tennis',swim:'Natation',gym:'Musculation',cycle:'Cyclisme'})[k],.72));
 // Les Palmiers et la concession premium
 facade(120,-548,'LES PALMIERS',0x567f9a,30,18);addSpot27(120,-535,'zone30:palmiers',0x58d68d,'Les Palmiers · centre commercial');
 facade(260,-548,'AURORE MOTORS',0x35465c,30,18);addSpot27(260,-535,'zone30:motors',0x91c6ec,'Aurore Motors · concession');
 W27.zones.push({id:'belvedere',n:'Résidences du Belvédère',s:'Quartier des villas',x0:85,x1:300,z0:-465,z1:-315});
}
const W30={people:[],rents:loadRent()};function loadRent(){try{return JSON.parse(localStorage.getItem('pa-rent30')||'{}');}catch(e){return {};}}
function saveRent(){try{localStorage.setItem('pa-rent30',JSON.stringify(W30.rents));}catch(e){}}
/* v31 : le quartier v30 est remplacé par ville31.js */
function rebuildPlayer(){if(player.mesh)scene.remove(player.mesh);player.mesh=makePlayerMesh();scene.add(player.mesh);}
function affordable(cost){return state.cash+state.bank>=cost;}
function payment(cost){if(!affordable(cost)){toast('Fonds insuffisants.','bad');return false;}takeMoney(cost);return true;}
function chooseFood(name,cost,hunger,thirst){return {label:name+' · '+fmt(cost),off:!affordable(cost),fn:()=>{if(!payment(cost))return;state.hunger=Math.min(100,state.hunger+hunger);if(thirst&&state.thirst!=null)state.thirst=Math.min(100,state.thirst+thirst);toast('Bon appétit !','good');}};}
function menuFood(title,items){openPanel(title,'Produits frais du quartier. Faim : '+Math.round(state.hunger)+' / 100.',items);}
function market(){menuFood('Marché de la Lagune',[chooseFood('Bananes plantain',5,20),chooseFood('Poisson frais du jour',14,48),chooseFood('Panier de mangues',8,28),chooseFood('Eau de coco',4,6,35)]);}
function mama(){openPanel('Chez Mama Adjo','Cuisine du pays, recettes du jour et service à table.',[
 chooseFood('Riz sauce arachide',16,55),chooseFood('Poulet braisé + attiéké',22,65),chooseFood('Alloco et poisson',18,52),
 {label:'Faire un service en cuisine · mini-jeu',fn:()=>{const a=MG29.actChain('Service chez Mama Adjo',0,[{type:'catch',title:'Préparer les ingrédients',good:['🍅','🧅','🌶️','🐟'],bad:['🧴','🥾','📱'],basket:'🧺',dur:16},{type:'timing',title:'Cuisson parfaite',steps:['Poisson','Alloco','Sauce','Dressage'],rounds:4}],{id:'shift-mama30',title:'Service chez Mama Adjo',min:45,work:true,gain:{cash:38,fun:10,skill:['cuisine',8]}});a.fn();}}]);}
function rentVilla(id){const n=id.replace('zone30:villa',''),key='v'+n,old=W30.rents[key],active=old&&old>gameMin,canRent=n==='B'||n==='D';
 openPanel('Villa '+n+(active?' · accès actif':' · résidence du Belvédère'),active?'Ta location est active pour '+Math.ceil((old-gameMin)/60)+' h de jeu.':'Villa meublée, quartier sécurisé, accès pour une journée de jeu.',[
 active?{label:'Se reposer dans la villa',fn:()=>{state.energy=Math.min(100,state.energy+38);state.health=Math.min(100,state.health+10);state.fun=Math.min(100,state.fun+12);gameMin+=120;toast('Repos au Belvédère. Énergie +38, santé +10.','good');}}:
 canRent?{label:'Louer pour 24 h · '+fmt(60),off:!affordable(60),fn:()=>{if(!payment(60))return;W30.rents[key]=gameMin+1440;saveRent();state.energy=Math.min(100,state.energy+10);toast('Clé remise. La villa est à toi pour 24 h de jeu.','good');}}:
 {label:'Saluer les habitants',fn:()=>{state.fun=Math.min(100,state.fun+6);state.rep+=1;toast('Les voisins du Belvédère te souhaitent la bienvenue.','good');}},
 {label:'Visiter le quartier',fn:()=>{player.x=125;player.z=-348;camYaw=0;camT=1;toast('Bienvenue au Belvédère.','good');}}]);}
function marketPalmiers(){mallMain();}
function mallMain(){openPanel('Les Palmiers · centre commercial','Choisis ta boutique. Chaque enseigne a son propre service.',[
 {label:'Supermarché',fn:()=>openPanel('Supermarché','Courses et produits du quotidien.',[chooseFood('Panier de courses',24,75,20),chooseFood('Sandwich + boisson',10,32,22),chooseFood('Fruits frais',8,25,8)])},
 {label:'Magasin de vêtements',fn:()=>openPanel('Vêtements · Les Palmiers','Change ton haut. La tenue est appliquée tout de suite.',[0xd94f4f,0x4fb58a,0xe0b34a,0x2f3a4a].map((c,i)=>({label:['Chemise rouge','Polo vert','Veste dorée','Tenue urbaine'][i]+' · '+fmt(28),off:!affordable(28),fn:()=>{if(payment(28)){look.s=c;look.t=i===2?'veste':'tee';rebuildPlayer();toast('Nouvelle tenue équipée.','good');}}})))},
 {label:'Magasin de chaussures',fn:()=>openPanel('Chaussures · Les Palmiers','Choisis une paire et équipe-la.',[0x202124,0xf2f2ee,0x4a3a2a].map((c,i)=>({label:['Sneakers urbaines','Baskets blanches','Chaussures cuir'][i]+' · '+fmt(22),off:!affordable(22),fn:()=>{if(payment(22)){look.f=c;rebuildPlayer();toast('Chaussures équipées.','good');}}})))},
 {label:'Bijouterie',fn:()=>openPanel('Bijouterie','Petites pièces, gros style.',[{label:'Chaîne dorée · '+fmt(45),off:!affordable(45),fn:()=>{if(payment(45)){look.n=true;rebuildPlayer();state.fun=Math.min(100,state.fun+8);toast('Chaîne équipée.','good');}}},{label:'Boucles d’oreilles · '+fmt(32),off:!affordable(32),fn:()=>{if(payment(32)){look.e=true;rebuildPlayer();state.fun=Math.min(100,state.fun+6);}}}])},
 {label:'Magasin d’électronique',fn:()=>openPanel('Électronique','Accessoires et appareils pour les loisirs.',[{label:'Casque audio · '+fmt(35),off:!affordable(35),fn:()=>{if(payment(35)){state.fun=Math.min(100,state.fun+14);toast('Playlist lancée. Humeur +14.','good');}}},{label:'Console portable · '+fmt(80),off:!affordable(80),fn:()=>{if(payment(80)){state.fun=Math.min(100,state.fun+25);toast('Console achetée. Humeur +25.','good');}}}])},
 {label:'Magasin de meubles',fn:()=>openPanel('Maison & meubles','Un meuble acheté améliore ton confort à la maison.',[{label:'Fauteuil confortable · '+fmt(70),off:!affordable(70),fn:()=>{if(payment(70)){state.energy=Math.min(100,state.energy+18);toast('Fauteuil livré. Énergie +18.','good');}}},{label:'Canapé · '+fmt(120),off:!affordable(120),fn:()=>{if(payment(120)){state.fun=Math.min(100,state.fun+22);state.energy=Math.min(100,state.energy+10);toast('Canapé livré.','good');}}}])},
 {label:'Restaurant & fast-food',fn:()=>openPanel('Food court · Les Palmiers','Sur place ou à emporter.',[chooseFood('Burger Aurore',15,45,12),chooseFood('Poulet braisé',20,60),chooseFood('Salade lagunaire',13,36,10)])},
 {label:'Cinéma',fn:()=>openPanel('Cinéma des Palmiers','Choisis ta séance.',[{label:'Film du soir · '+fmt(18),off:!affordable(18),fn:()=>{if(payment(18)){gameMin+=110;state.fun=Math.min(100,state.fun+28);toast('Générique terminé. Humeur +28.','good');}}}])},
 {label:'Arcade',fn:()=>openPanel('Arcade des Palmiers','Défis rapides, commandes clavier ou manette.',[MG29.act('Basket arcade',5,'basketball',{id:'arcade-basket30',title:'Défi basket',min:15,replay:true,gain:{fun:14,rep:1}}),MG29.act('Course arcade',5,'runner',{id:'arcade-run30',title:'Course urbaine',min:15,replay:true,gain:{fun:12}})])}
 ]);}
function motors(){openPanel('Aurore Motors','Voitures au modèle détaillé. Une fois achetée, elle est garée devant la concession.',[
 ...[['Toyota citadine','toyota',180],['SUV familial','suv',320],['BMW Série 3','bmw',620],['Porsche 911','porsche',1050],['Coupé sportif','sport',480]].map(([n,t,c])=>({label:n+' · '+fmt(c),off:!affordable(c),fn:()=>{if(!payment(c))return;const v=addCar(290,-532,Math.PI/2,pick(CAR_COLORS),'parked',t);v.owned=true;toast(n+' livré devant la concession.','good');}})),
 {label:'Vendre le véhicule le plus proche',off:!cars.some(c=>c.kind==='parked'&&Math.hypot(c.x-player.x,c.z-player.z)<7),fn:()=>{let v=cars.filter(c=>c.kind==='parked'&&Math.hypot(c.x-player.x,c.z-player.z)<7).sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z))[0];if(v){const i=cars.indexOf(v);scene.remove(v.mesh);cars.splice(i,1);state.cash+=90;toast('Véhicule repris. +'+fmt(90),'good');}}}
]);}
function sports(k){const labels={football:'Football à 5',basket:'Basket-ball',tennis:'Tennis',swim:'Natation',gym:'Musculation',cycle:'Cyclisme'};
 if(k==='football')openPanel('Terrain de football à 5','Déplace-toi avec le stick gauche / ZQSD. Appuie sur A ou Espace pour frapper le ballon.',[MG29.act('Jouer un match',0,'football',{id:'sport-foot30',title:'Football à 5',duration:50,replay:true,gain:{fun:24,energy:-14,rep:1}})]);
 else if(k==='basket')openPanel('Terrain de basket','Déplace-toi avec le stick gauche / ZQSD. A ou Espace lance au panier. Approche-toi pour augmenter tes chances.',[MG29.act('Jouer un match',0,'basketball',{id:'sport-basket30',title:'Basket-ball',duration:45,replay:true,gain:{fun:22,energy:-12,rep:1}})]);
 else if(k==='tennis')openPanel('Court de tennis','Anticipe la balle et renvoie-la au bon moment.',[MG29.act('Jouer un set court',0,'tennis',{id:'sport-tennis30',title:'Tennis',duration:35,replay:true,gain:{fun:20,energy:-10}})]);
 else if(k==='swim')openPanel('Piscine municipale','Nage des longueurs au rythme demandé.',[MG29.act('Nager 10 longueurs',0,'balance',{id:'sport-swim30',title:'Natation · 10 longueurs',bgk:'water',who:'🏊',dur:25,min:30,gain:{fun:18,energy:-8,health:3}})]);
 else if(k==='gym')openPanel('Salle de musculation','Enchaîne les répétitions sans perdre le rythme.',[MG29.act('Séance de musculation',0,'timing',{id:'sport-gym30',title:'Musculation',steps:['Échauffement','Squat','Développé','Récupération'],rounds:4,min:35,gain:{fun:12,health:5,energy:-9}})]);
 else openPanel('Club cycliste','Une boucle cyclable balisée démarre au complexe.',[MG29.act('Boucle de 3 km',0,'runner',{id:'sport-cycle30',title:'Cyclisme · boucle de 3 km',kind:'cycle',good:['💧','⚡','🏁'],bad:['🚧','🕳️'],goodName:'Balises',need:10,dur:30,min:45,gain:{fun:20,energy:-10,health:3}})]);
}
function university(){openPanel('Complexe universitaire Aurore','Un bâtiment, de vrais services: cours, recherche, lecture et vie étudiante.',[
 {label:'Faculté de médecine · cours de premiers secours',fn:()=>openPanel('Faculté de médecine','Révise les bons gestes.',[MG29.act('Quiz de santé',0,'quiz',{id:'med-campus30',title:'Faculté de médecine',q:[['Que faire face à une brûlure légère ?',['Refroidir à l’eau','Mettre du beurre','Percer la cloque'],0],['Que faire pour une coupure qui saigne ?',['Comprimer et protéger','Laisser couler','Frotter fort'],0],['Un patient est déshydraté.',['Donner de l’eau','Le faire courir','Éviter de l’hydrater'],0]],n:3,min:30,gain:{rep:1,skill:['science',5]}})])},
 {label:'Faculté de droit · étude de cas',fn:()=>openPanel('Faculté de droit','Exerce ton jugement sur des situations du quotidien.',[MG29.act('Cas pratique',0,'quiz',{id:'law-campus30',title:'Faculté de droit',q:[['Un objet trouvé dans la rue.',['Le remettre aux objets trouvés','Le garder','Le jeter'],0],['Un témoin d’accident.',['Sécuriser et appeler les secours','Partir','Déplacer les blessés sans évaluer'],0],['Un contrat n’est pas clair.',['Demander une explication avant de signer','Signer vite','Ignorer les clauses'],0]],n:3,min:30,gain:{rep:1}})])},
 {label:'Faculté informatique · atelier logique',fn:()=>{const a=MG29.act('Atelier de programmation',0,'code',{id:'it-campus30',title:'Faculté informatique',n:5,min:40,gain:{rep:1,skill:['informatique',7]}});a.fn();}},
 {label:'Bibliothèque · étudier',fn:()=>{gameMin+=60;state.energy=Math.max(0,state.energy-3);state.rep+=1;toast('Session d’étude terminée. Réputation +1.','good');}},
 {label:'Résidence universitaire · se reposer',fn:()=>{state.energy=Math.min(100,state.energy+22);state.fun=Math.min(100,state.fun+8);gameMin+=90;toast('Pause à la résidence. Énergie +22.','good');}},
 {label:'Restaurant étudiant',fn:()=>menuFood('Restaurant étudiant',[chooseFood('Plat du jour',8,36),chooseFood('Formule étudiant',12,50,10)])},
 {label:'Terrain de sport',fn:()=>sports('football')}
]);}

const _up=update;update=function(dt){_up(dt);W30.people.forEach(q=>{q.ph+=dt*1.4;q.m.position.x=q.x+Math.sin(q.ph)*.8;q.m.position.z=q.z+Math.cos(q.ph*.7)*.6;animPerson(q.m,q.ph,.12,false);});};
const _open=openSpot;openSpot=function(id){if(typeof id==='string'){
 if(id==='zone27:campus'){university();return;}if(id==='zone27:mall'){if(window.V31&&V31.enterMall){V31.enterMall(nearSpot&&nearSpot.x,nearSpot&&nearSpot.z);return;}mallMain();return;}
 if(id.startsWith('zone30:villa')){rentVilla(id);return;}
 if(id==='zone30:market'){market();return;}if(id==='zone30:mama'){mama();return;}if(id==='zone30:palmiers'){mallMain();return;}if(id==='zone30:motors'){motors();return;}
 if(id.startsWith('zone30:sport:')){sports(id.slice(13));return;}
 }_open(id);};
// Mini-jeux pilotés avec déplacements, frappe/tir et lecture des commandes de manette.
MG29.DEF.football={name:'Football à 5',icon:'⚽',intro:'Déplace ton joueur, garde la balle proche puis frappe. Marque plus que l’équipe adverse.',help:['Stick gauche / flèches : bouger','A / Espace : frapper'],repeat:true,
 init(G,o){G.p={x:190,y:270};G.b={x:290,y:270,vx:0,vy:0};G.opp={x:620,y:270};G.score=[0,0];G.cd=0;G.duration=o.duration||50;G.w=84;},
 key(G,k){if(k==='A')this.kick(G);},tap(G,x,y){G.p.x=x;G.p.y=y;this.kick(G);},
 kick(G){if(G.cd>0)return;const dx=G.b.x-G.p.x,dy=G.b.y-G.p.y;if(Math.hypot(dx,dy)<78){const l=Math.hypot(840-G.b.x,270-G.b.y)||1;G.b.vx=dx/Math.max(1,Math.hypot(dx,dy))*220+Math.max(0,(840-G.b.x)/l)*480;G.b.vy=dy/Math.max(1,Math.hypot(dx,dy))*220+(270-G.b.y)/l*280;G.cd=.32;}},
 step(G,dt){let ax=(G.k.R?1:0)-(G.k.L?1:0),ay=(G.k.D?1:0)-(G.k.U?1:0);G.p.x=U.CL(G.p.x+ax*270*dt,80,880);G.p.y=U.CL(G.p.y+ay*270*dt,65,475);G.cd=Math.max(0,G.cd-dt);
 const d=Math.hypot(G.p.x-G.b.x,G.p.y-G.b.y);if(d<40){G.b.vx+=(G.p.x-G.b.x)*5*dt;G.b.vy+=(G.p.y-G.b.y)*5*dt;}G.opp.x+=U.CL(G.b.x-G.opp.x,-90*dt,90*dt);G.opp.y+=U.CL(G.b.y-G.opp.y,-90*dt,90*dt);
 G.b.x+=G.b.vx*dt;G.b.y+=G.b.vy*dt;G.b.vx*=Math.pow(.96,dt*60);G.b.vy*=Math.pow(.96,dt*60);if(G.b.y<65||G.b.y>475)G.b.vy*=-.8;
 if(G.b.x>850&&Math.abs(G.b.y-270)<82){G.score[0]++;G.b.x=450;G.b.y=270;G.b.vx=G.b.vy=0;U.sfx.ok();U.pop('BUT !',480,110,'#ffd24a');}if(G.b.x<110&&Math.abs(G.b.y-270)<82){G.score[1]++;G.b.x=450;G.b.y=270;G.b.vx=G.b.vy=0;U.sfx.bad();}
 if(G.t>=(G.o.duration||50))U.end(U.CL(.5+(G.score[0]-G.score[1])*.16+G.score[0]*.06,0,1));G.label='Toi '+G.score[0]+' - '+G.score[1]+' Adversaires · '+Math.ceil((G.o.duration||50)-G.t)+' s';},
 draw(G){U.bg('#277c45','#165632');U.cx.fillStyle='#2f914f';U.cx.fillRect(45,45,870,450);U.cx.strokeStyle='#fff';U.cx.lineWidth=3;U.cx.strokeRect(45,45,870,450);U.cx.beginPath();U.cx.moveTo(480,45);U.cx.lineTo(480,495);U.cx.stroke();U.cx.beginPath();U.cx.arc(480,270,65,0,7);U.cx.stroke();U.cx.strokeRect(45,185,120,170);U.cx.strokeRect(795,185,120,170);U.cx.fillStyle='#fff';U.cx.fillRect(40,232,10,76);U.cx.fillRect(910,232,10,76);U.emo('🏃',G.p.x,G.p.y,54);U.emo('🧍',G.opp.x,G.opp.y,52);U.emo('⚽',G.b.x,G.b.y,32);U.txt('PORT-AURORE',250,22,20,'#fff');U.txt('VISITEURS',710,22,20,'#fff');U.txt(G.score[0]+'  -  '+G.score[1],480,25,26,'#ffd24a');}};
MG29.DEF.basketball={name:'Basket-ball',icon:'🏀',intro:'Bouge dans le demi-terrain, aligne-toi vers le panier et appuie sur A pour tirer.',help:['Stick gauche / flèches : bouger','A / Espace : tirer'],repeat:true,
 init(G,o){G.p={x:250,y:285};G.ball={x:250,y:285};G.opp={x:580,y:270};G.score=0;G.miss=0;G.cd=0;G.duration=o.duration||45;},
 key(G,k){if(k==='A')this.shoot(G);},tap(G,x,y){G.p.x=x;G.p.y=y;this.shoot(G);},
 shoot(G){if(G.cd>0)return;G.cd=.55;const dist=Math.hypot(840-G.p.x,270-G.p.y),align=Math.abs(G.p.y-270);const chance=U.CL(.92-dist/1300-align/520,.12,.88);G.shot={x:G.p.x,y:G.p.y,t:0,ok:Math.random()<chance};if(G.shot.ok){G.score+=dist<250?2:3;U.sfx.ok();U.pop('PANIER !',G.p.x,G.p.y-30,'#ffd24a');}else{G.miss++;U.sfx.bad();U.pop('Raté',G.p.x,G.p.y-30,'#ff8a76');}},
 step(G,dt){G.p.x=U.CL(G.p.x+((G.k.R?1:0)-(G.k.L?1:0))*250*dt,90,750);G.p.y=U.CL(G.p.y+((G.k.D?1:0)-(G.k.U?1:0))*250*dt,85,455);G.ball.x=G.p.x+10;G.ball.y=G.p.y-3;G.opp.x+=U.CL(G.p.x+120-G.opp.x,-110*dt,110*dt);G.opp.y+=U.CL(G.p.y-G.opp.y,-110*dt,110*dt);G.cd=Math.max(0,G.cd-dt);if(G.shot){G.shot.t+=dt;if(G.shot.t>0.7)G.shot=null;}if(G.t>=G.duration)U.end(U.CL(G.score/18,0,1));G.label='Points '+G.score+' · tirs ratés '+G.miss+' · '+Math.ceil(G.duration-G.t)+' s';},
 draw(G){U.bg('#b87b4d','#754329');U.cx.fillStyle='#c68758';U.cx.fillRect(40,40,880,460);U.cx.strokeStyle='#fff';U.cx.lineWidth=3;U.cx.strokeRect(40,40,880,460);U.cx.beginPath();U.cx.arc(840,270,150,Math.PI/2,Math.PI*1.5);U.cx.stroke();U.cx.strokeRect(790,205,130,130);U.cx.strokeRect(900,245,18,50);U.cx.beginPath();U.cx.arc(900,270,24,0,7);U.cx.strokeStyle='#f4b842';U.cx.lineWidth=6;U.cx.stroke();U.cx.fillStyle='#fff';U.cx.fillRect(40,40,880,3);U.cx.fillRect(40,497,880,3);U.emo('🏃',G.p.x,G.p.y,56);U.emo('🧍',G.opp.x,G.opp.y,50);U.emo(G.shot?'🏀':'🏀',G.shot?840:G.ball.x,G.shot?270:G.ball.y,34);U.txt('SCORE '+G.score,480,26,24,'#fff');}};
MG29.DEF.tennis={name:'Tennis',icon:'🎾',intro:'Déplace-toi pour rejoindre la balle. Appuie sur A quand elle approche.',help:['Stick gauche / flèches : bouger','A / Espace : renvoyer'],repeat:true,
 init(G,o){G.px=480;G.ball={x:730,y:220,vx:-230,vy:130};G.hit=0;G.miss=0;G.cool=0;G.duration=o.duration||35;},
 key(G,k){if(k==='A')this.hitBall(G);},tap(G,x,y){G.px=x;this.hitBall(G);},hitBall(G){if(G.cool>0)return;G.cool=.25;if(G.ball.x<620&&Math.abs(G.ball.x-G.px)<85&&G.ball.y>130&&G.ball.y<440){G.ball.vx=260;G.ball.vy=(270-G.ball.y)*1.1;G.hit++;U.sfx.ok();U.pop('RENVOI !',G.px,350,'#7ee0a3');}},
 step(G,dt){G.px=U.CL(G.px+((G.k.R?1:0)-(G.k.L?1:0))*300*dt,90,850);G.ball.x+=G.ball.vx*dt;G.ball.y+=G.ball.vy*dt;if(G.ball.y<100||G.ball.y>465)G.ball.vy*=-1;if(G.ball.x>880){G.ball.x=880;G.ball.vx=-Math.abs(G.ball.vx);G.ball.vy=U.R(-140,140);}if(G.ball.x<70){G.miss++;G.ball.x=740;G.ball.y=U.R(150,420);G.ball.vx=-240;G.ball.vy=U.R(-140,140);}G.cool=Math.max(0,G.cool-dt);if(G.t>=G.duration)U.end(U.CL((G.hit-G.miss*.5)/18,0,1));G.label='Échanges '+G.hit+' · balles perdues '+G.miss;},
 draw(G){U.bg('#298d63','#176045');U.cx.fillStyle='#318f68';U.cx.fillRect(60,55,840,430);U.cx.strokeStyle='#f7f5e8';U.cx.lineWidth=3;U.cx.strokeRect(60,55,840,430);U.cx.beginPath();U.cx.moveTo(480,55);U.cx.lineTo(480,485);U.cx.moveTo(200,270);U.cx.lineTo(760,270);U.cx.stroke();U.cx.fillStyle='#f7f5e8';U.cx.fillRect(474,230,12,80);U.emo('🎾',G.ball.x,G.ball.y,32);U.emo('🏃',G.px,420,55);U.emo('🧍',790,130,50);U.txt('TENNIS',480,26,22,'#fff');}};
})();
