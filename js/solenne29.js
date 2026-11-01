'use strict';
/* ==========================================================================
   v29 · SOLENNE : LES ACTIVITÉS DEVIENNENT DES MINI-JEUX
   Les achats (glaces, souvenirs, location) restent des menus. Tout ce qui se
   « fait » (jet-ski, surf, plongée, danse, golf, cuisine, pêche…) se joue.
   ========================================================================== */
(function(){
const M=MG29,S=()=>window.S28||{seen:{}};
const save=()=>{const s=S();try{localStorage.setItem('port-aurore-sol28',JSON.stringify({mask:!!s.mask,seen:s.seen||{}}));}catch(e){}};
const REEF=[['🐠','Poisson-perroquet',2],['🐟','Poisson-clown',1],['🐢','Tortue verte',3],['🦈','Raie léopard',3],['🐡','Chirurgien bleu',1],['🐠','Poisson-papillon',1]];
const reefSub=REEF.map(r=>[r[0],r[2],r[1]]);
const solPanel=(t,txt,b)=>openPanel(t,txt,b);
const QZ_SOL=[['Sous quel nom Solenne apparaît-elle sur les cartes de 1712 ?',['L’île aux Perles','L’île Vanille','La Pointe Bleue','L’île du Phare'],0],
  ['Quel bâtiment est resté debout après le cyclone de 1948 ?',['Le phare','La chapelle','Le marché','L’hôtel'],0],
  ['Comment arrivèrent les premiers habitants ?',['En pirogue','À la nage','En ferry','En avion'],0],
  ['Quelles musiques rythment les fêtes de l’île ?',['Le maloya et le séga','Le jazz et le blues','Le rock','La valse'],0],
  ['Qu’a-t-on inventé à Solenne pour la vanille ?',['La pollinisation à la main','Le séchage au four','La vanille bleue','Le sirop de vanille'],0],
  ['Combien de marches mènent au sommet du phare ?',['147','58','312','90'],0],
  ['Quelle tortue soigne le centre de l’Anse Créole ?',['La tortue verte','La tortue géante','La tortue d’eau douce','La tortue luth des glaces'],0]];
const QZ_CANNE=[['De quelle plante tire-t-on le rhum agricole ?',['La canne à sucre','La betterave','Le maïs','La vanille'],0],
  ['Combien de temps une gousse de vanille sèche-t-elle environ ?',['Plusieurs mois','Une heure','Une journée','Dix ans'],0],
  ['Où vieillit-on les spiritueux de la distillerie ?',['En fûts de chêne','En bouteilles plastiques','Au congélateur','Dans des jarres de sable'],0],
  ['La fleur de vanille est une…',['Orchidée','Rose','Tulipe','Marguerite'],0],
  ['Le jus de canne fraîchement pressé s’appelle…',['Le vesou','Le sirop d’érable','Le lait de coco','Le punch'],0]];
const nautic=()=>solPanel('Nautic Center','Sports nautiques sur le lagon, gilet fourni. Énergie '+Math.round(state.energy)+'.',[
  M.act('Jet-ski · 20 min',35,'runner',{id:'sol-jet',title:'Jet-ski sur le lagon',icon:'🚤',intro:'Slalome entre les bouées et les rochers, ramasse les étoiles.',ride:'jetski',bgk:'water',good:['⭐','🪙'],bad:['🪨','🛟','🚣'],goodName:'Étoiles',min:20,replay:true,gain:{fun:30,energy:-6}}),
  M.act('Parachute ascensionnel',55,'balance',{id:'sol-para',title:'Parachute ascensionnel',icon:'🪂',intro:'Le vent tourne ! Garde la voile stable au-dessus du lagon.',who:'🪂',fallTxt:'Rafale !',dur:22,min:25,gain:{fun:36}}),
  M.act('Bouée tractée',25,'balance',{id:'sol-bouee',title:'Bouée tractée',icon:'🛟',intro:'Accroche-toi : le bateau zigzague pour te faire tomber.',who:'🤪',fallTxt:'Plouf !',diff:.8,dur:20,min:15,gain:{fun:24,energy:-5}}),
  M.act('Ski nautique (initiation)',40,'balance',{id:'sol-ski',title:'Ski nautique',icon:'🎿',intro:'Reste debout derrière le bateau.',who:'⛷️',min:30,gain:{fun:26,energy:-12}})]);
const plongee=()=>{const s=S(),n=REEF.filter(r=>s.seen&&s.seen['f_'+r[1]]).length;solPanel('Club de plongée Les Tortues','Masque et tuba pour nager au-dessus du récif, ou baptême avec un moniteur.',[
  s.mask?{label:'Masque et tuba ✓ (déjà loués)',off:true}:{label:'Louer masque et tuba · '+fmt(8),off:state.cash+state.bank<8,fn:()=>{if(!M.pay(8))return;s.mask=true;save();toast('Masque loué ! Nage au-dessus des récifs pour observer les poissons.','good');}},
  M.act('Baptême de plongée · 45 min',70,'photo',{id:'sol-bapteme',title:'Baptême de plongée',icon:'🤿',intro:'À 8 m sous l’eau, photographie un maximum d’espèces. Les tortues et les raies valent plus.',bgk:'reef',subjects:reefSub,shots:6,dur:35,min:45,gain:{fun:45,energy:-10},after:(sc,G)=>{let k=0;(G.shots||[]).forEach(p=>{const r=REEF.find(q=>q[0]===p.e);if(r&&!s.seen['f_'+r[1]]){s.seen['f_'+r[1]]=1;k++;}});save();return k?k+' espèce(s) ajoutée(s) au carnet':'';}}),
  {label:'Carnet d’observation · '+n+'/'+REEF.length+' espèces',off:true}]);};
const kayak=()=>solPanel('Kayak & Paddle','Tour de l’îlot aux oiseaux ou balade dans la mangrove.',[
  M.act('Kayak dans la mangrove',15,'runner',{id:'sol-kayak',title:'Kayak dans la mangrove',icon:'🛶',intro:'Évite les racines et les crocodiles en bois flotté, collecte les plumes de héron.',ride:'kayak',bgk:'water',good:['🪶','🐚'],bad:['🪵','🐊','🪨'],goodName:'Trouvailles',need:10,min:60,gain:{fun:22,energy:-10}}),
  M.act('Paddle au coucher du soleil',18,'balance',{id:'sol-paddle',title:'Paddle au coucher du soleil',icon:'🏄',bg1:'#ffb36b',bg2:'#ff7a8a',intro:'Le lagon ondule : garde l’équilibre sur ta planche.',who:'🧍',min:45,gain:{fun:26}})]);
const surf=()=>solPanel('École de surf','Cours sur la vague de la passe, planche et lycra fournis.',[
  M.actChain('Cours débutant · 1 h 30',40,[{type:'mash',theme:'row',icon:'🏄',title:'Rame vers la vague',intro:'Alterne gauche/droite pour ramer jusqu’au pic.',dur:12},{type:'timing',icon:'🌊',title:'Le take-off',intro:'Lève-toi pile quand la vague te porte.',steps:['Vague 1 · lève-toi','Vague 2 · lève-toi','Vague 3 · lève-toi'],rounds:3},{type:'balance',who:'🏄',title:'Glisse !',intro:'Reste sur la vague le plus longtemps possible.',dur:18}],{id:'sol-surf',title:'Cours de surf',min:90,gain:{fun:32,energy:-18,skill:['forme',15]}}),
  M.act('Session libre · 1 h',12,'balance',{id:'sol-surf2',title:'Session de surf',icon:'🏄',who:'🏄',diff:.75,min:60,gain:{fun:16,energy:-12}})]);
const volley=()=>solPanel('Beach-volley','Une équipe cherche un quatrième joueur.',[M.act('Jouer un match',0,'volley',{id:'sol-volley',title:'Beach-volley',min:20,replay:true,gain:{fun:25,energy:-12,rep:1}})]);
const yoga=()=>solPanel('Yoga sur la plage','Séance face au lagon avec Maëlle.',[
  M.actChain('Séance d’une heure',10,[{type:'breath',title:'Respiration',intro:'Synchronise ton souffle avec Maëlle.',cycles:3},{type:'simon',title:'Enchaînement de postures',intro:'Maëlle montre l’enchaînement, reproduis-le.',pads:[['🧘','Lotus'],['🤸','Pont'],['🙆','Arbre'],['🙇','Enfant']],max:6}],{id:'sol-yoga',title:'Yoga au lever du soleil',min:60,gain:{energy:20,fun:12,health:8}})]);
const golf=()=>solPanel('Mini-golf des Alizés','Parcours entre cocotiers et moulins miniatures.',[M.act('Partie de 3 trous',8,'putt',{id:'sol-golf',title:'Mini-golf des Alizés',holes:3,min:30,replay:true,gain:{fun:18}}),M.act('Grand parcours (4 trous)',12,'putt',{id:'sol-golf4',title:'Mini-golf · grand parcours',holes:4,min:45,gain:{fun:24,rep:1}})]);
const phare=()=>solPanel('Phare de Solenne','147 marches jusqu’à la lanterne. Vue à 360° sur l’île et le lagon.',[
  M.actChain('Monter au sommet',5,[{type:'mash',theme:'climb',top:'🗼',title:'147 marches',intro:'Grimpe l’escalier en colimaçon sans t’arrêter.',dur:16,drain:.03},{type:'photo',bgk:'sea',title:'Panorama',intro:'Depuis la lanterne, photographie le lagon : dauphins, voiliers, frégates.',subjects:[['⛵',1,'Voilier'],['🐬',3,'Dauphin'],['🦅',2,'Frégate'],['🛥️',1,'Vedette']],shots:4,dur:22}],{id:'sol-phare',title:'Phare de Solenne',min:30,gain:{fun:18,energy:-6}})]);
const ponton=()=>solPanel('Ponton de Solenne','Sorties en mer autour de l’île.',[
  M.act('Tour de l’île · 1 h',40,'photo',{id:'sol-tour',title:'Tour de l’île',icon:'🐬',bgk:'sea',intro:'Les dauphins suivent le bateau : immortalise-les !',subjects:[['🐬',3,'Dauphin'],['🐦',1,'Fou de Bassan'],['⛵',1,'Voilier'],['🐢',2,'Tortue']],shots:5,dur:28,min:60,gain:{fun:35}}),
  M.act('Plongée au récif · 2 h',65,'photo',{id:'sol-recif',title:'Plongée au récif',icon:'🤿',bgk:'reef',subjects:reefSub,shots:6,dur:35,min:120,gain:{fun:50,energy:-15}}),
  M.act('Observation des baleines · 3 h',90,'photo',{id:'sol-baleine',title:'Observation des baleines',icon:'🐋',bgk:'sea',intro:'Une baleine à bosse et son petit approchent. Une seule chance pour la photo parfaite…',subjects:[['🐋',4,'Baleine à bosse'],['🐳',3,'Baleineau'],['🐬',2,'Dauphin'],['🐦',1,'Puffin']],extra:2,shots:4,dur:30,fast:.7,min:180,gain:{fun:60}}),
  M.act('Pêche au gros · 4 h',120,'fish',{id:'sol-gros',title:'Pêche au gros',icon:'🎣',intro:'Thon, daurade, marlin… Garde la tension sans casser la ligne.',fishes:[['🐟','Thon jaune',1.5],['🐠','Daurade coryphène',1.3],['🗡️','Marlin bleu',2],['🐡','Bonite',1.1]],count:3,min:240,gain:{fun:40},onCatch:f=>{const v={'Thon jaune':140,'Daurade coryphène':90,'Bonite':45,'Marlin bleu':0}[f[1]]||0;if(v){state.cash+=v;toast(f[1]+' revendu '+fmt(v)+' au port.','good');}else toast('Marlin relâché, photo souvenir !','good');}})]);
const marche=()=>solPanel('Marché de Solenne','Fruits, poisson du jour et beignets. Faim '+Math.round(state.hunger)+'. Ici, on marchande !',[
  {label:'Mangue · '+fmt(3),off:state.cash+state.bank<3,fn:()=>{if(M.pay(3)){state.hunger=Math.min(100,state.hunger+12);toast('Mangue juteuse.','good');}}},
  {label:'Beignets banane · '+fmt(5),off:state.cash+state.bank<5,fn:()=>{if(M.pay(5)){state.hunger=Math.min(100,state.hunger+18);toast('Bien chauds !','good');}}},
  {label:'🎮 Marchander un panier de fruits (~'+fmt(30)+')',fn:()=>M.play('haggle',{id:'sol-panier',title:'Panier de fruits',seller:'👵🏾',item:'🧺',itemName:'Panier garni',price:30,min:10,onDeal:p=>{if(p!=null&&M.pay(p)){state.hunger=Math.min(100,state.hunger+50);if(state.thirst!=null)state.thirst=Math.min(100,state.thirst+20);}},gain:{fun:8}})},
  {label:'🎮 Marchander un poisson du lagon (~'+fmt(24)+')',fn:()=>M.play('haggle',{id:'sol-poisson',title:'Poisson du jour',seller:'👨🏿',item:'🐟',itemName:'Carangue grillée',price:24,min:10,onDeal:p=>{if(p!=null&&M.pay(p))state.hunger=Math.min(100,state.hunger+45);},gain:{fun:6}})}]);
const bar=()=>solPanel('Le Coquillage','Les pieds dans le sable. Humeur '+Math.round(state.fun)+'.',[
  {label:'Cocktail du lagon · '+fmt(9),off:state.cash+state.bank<9,fn:()=>{if(M.pay(9)){state.fun=Math.min(100,state.fun+18);toast('Santé ! +18 humeur','good');}}},
  {label:'Jus de coco · '+fmt(5),off:state.cash+state.bank<5,fn:()=>{if(M.pay(5)){if(state.thirst!=null)state.thirst=Math.min(100,state.thirst+30);state.fun=Math.min(100,state.fun+5);toast('Rafraîchissant.','good');}}},
  M.act('Soirée séga sur la plage',25,'rhythm',{id:'sol-sega',title:'Soirée séga',icon:'🥁',intro:'Les ravanes et le kayamb lancent le séga : suis le rythme !',lanes:3,bpm:104,dur:32,bg1:'#3a1a0a',bg2:'#120804',min:90,gain:{fun:40,energy:-10,rep:1}})]);
const hotel=()=>solPanel('Hôtel Lagon Bleu','Chambres vue mer, piscine à débordement et spa. Énergie '+Math.round(state.energy)+' · Santé '+Math.round(state.health)+'.',[
  {label:'Chambre vue mer · jusqu’à 8 h · '+fmt(90),off:state.cash+state.bank<90,fn:()=>{if(!M.pay(90))return;state.energy=100;state.fun=Math.min(100,state.fun+15);state.hunger=Math.max(0,state.hunger-20);gameMin=(Math.floor(gameMin/1440)+((gameMin%1440)>=480?1:0))*1440+480;toast('Nuit de rêve au Lagon Bleu. Il est 8 h.','good');}},
  M.act('Longueurs dans la piscine',12,'mash',{id:'sol-piscine',title:'Piscine à débordement',theme:'row',icon:'🏊',intro:'Fais tes longueurs : alterne les bras le plus vite possible.',dur:14,min:40,gain:{fun:22,energy:-6,health:6}}),
  {label:'Spa et massage · '+fmt(45),off:state.cash+state.bank<45,fn:()=>{if(!M.pay(45))return;window.fade27&&fade27(true,()=>{gameMin+=60;state.health=100;state.fun=Math.min(100,state.fun+15);fade27(false);toast('Massage aux huiles de coco. Santé au max.','good');});}}]);
const MAP={nautic,plongee,kayak,surf,volley,yoga,golf,phare};
const MAP27={ponton,marche,bar,hotel};
const _os=openSpot;openSpot=function(id){if(typeof id==='string'){if(id.startsWith('sol28:')&&MAP[id.slice(6)]){MAP[id.slice(6)]();return;}if(id.startsWith('sol27:')&&MAP27[id.slice(6)]){MAP27[id.slice(6)]();return;}}_os(id);};
/* intérieurs : on remplace les actions « fondu » par des mini-jeux */
function patchRooms(){const R=k=>(typeof ROOMS!=='undefined'&&ROOMS[k])||null,set=(room,lab,fn)=>{const r=R(room);if(!r)return;r.ints.forEach(it=>{if(it.label&&it.label.indexOf(lab)===0)it.fn=fn;});};
  set('sol28corail','Danser',()=>M.play('rhythm',{id:'sol-corail',title:'Piste du Corail',icon:'🪩',intro:'Le DJ envoie du shatta : danse sur les flèches !',bpm:124,dur:30,min:30,gain:{fun:24,energy:-8,rep:1}}));
  const co=R('sol28corail');if(co)co.int(.2,3.8,'Battle de danse',()=>M.play('rhythm',{id:'sol-battle',title:'Battle de danse',icon:'🕺',intro:'Un danseur te défie au centre de la piste. Fais mieux que lui !',rival:true,rivalName:'Kenzo',rivalIcon:'🕺',bpm:128,dur:28,diff:.7,min:20,gain:{fun:20,rep:2}}));
  set('sol28tikaz','Cours de cuisine',()=>{const b=M.actChain('Atelier cuisine',35,[{type:'catch',title:'Les ingrédients',intro:'Attrape les bons ingrédients du rougail, pas les intrus.',good:['🍅','🧅','🌶️','🧄','🌭'],bad:['🧦','🪳','🥾'],basket:'🥘',dur:20},{type:'timing',icon:'🔪',title:'Couper',intro:'Coupe au bon moment pour des morceaux réguliers.',steps:['Tomates','Oignons','Piments','Saucisses'],rounds:4},{type:'stir',title:'Mijoter',intro:'Fais revenir sans brûler !',items:['🍅','🧅','🌶️','🌭'],dur:16}],{id:'sol-cuisine',title:'Atelier rougail saucisse',min:90,gain:{fun:25,hunger:40,skill:['commerce',10]}});b.fn();});
  set('sol28musee','Visite guidée',()=>{const b=M.act('Visite guidée',8,'quiz',{id:'sol-musee',title:'Quiz de la conteuse',icon:'📜',intro:'La conteuse raconte l’histoire de Solenne, puis te pose ses questions. Lis bien les vitrines avant !',q:QZ_SOL,n:5,min:30,gain:{fun:16,rep:1}});b.fn();});
  set('sol28tortues','Nourrir',()=>{const b=M.act('Nourrir les tortues',6,'catch',{id:'sol-tortues',title:'Repas des tortues',icon:'🐢',intro:'Récupère salade de mer et calamars pour les tortues. Pas de plastique !',good:['🥬','🦑','🦐'],bad:['🛍️','🥤','🧴'],basket:'🪣',who:'🐢',bg1:'#9fe0d8',bg2:'#e8f6f4',ground:'#2fc6c9',dur:22,min:15,gain:{fun:14}});b.fn();});
  set('sol28tortues','Relâcher',()=>M.play('runner',{id:'sol-relache',title:'Retour au récif',icon:'🐢',intro:'Guide Nalu jusqu’au récif : évite filets et sacs plastique, avale les méduses.',ride:'🐢',bgk:'water',good:['🪼','🦐'],bad:['🕸️','🛍️','🪝'],goodName:'Méduses',need:10,dur:28,min:40,gain:{fun:26,rep:1}}));
  set('sol28distil','Visite et dégustation',()=>openPanel('Distillerie','Visite des chais, de la colonne à distiller et des serres de vanille.',[
    M.act('Visite guidée (quiz)',10,'quiz',{id:'sol-distil',title:'Les secrets de la canne',icon:'🌾',q:QZ_CANNE,n:5,min:45,gain:{fun:14}}),
    {label:'Dégustation de sirops et punchs · '+fmt(12),off:state.cash+state.bank<12,fn:()=>{if(M.pay(12)){state.fun=Math.min(100,state.fun+12);toast('Arômes de vanille et de coco !','good');}}},
    M.act('Atelier pollinisation de la vanille',20,'timing',{id:'sol-vanille',title:'Pollinisation de la vanille',icon:'🌼',intro:'Geste de précision : la fleur ne s’ouvre qu’une matinée.',steps:['Ouvre la fleur','Soulève la languette','Presse le pollen','Referme délicatement'],rounds:4,diff:.7,min:60,gain:{fun:20}})]));
}
const _bd=buildDecor;buildDecor=function(){_bd();try{patchRooms();}catch(e){console.warn('v29 Solenne',e);}};
})();
