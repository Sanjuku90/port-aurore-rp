'use strict';
/* v52 · Navigation maritime avancée : permis bateau, flotte (semi-rigide, voilier, catamaran, yacht),
   traversées réelles Port-Aurore ⇄ Solenne, exploration de 6 îles et sites, transport de passagers,
   croisières VIP en yacht et championnat de régates. */
(function(){
if(!window.C52)return;
const K='pa-mer52';C51.resetKey(K);
const BOATS={
  zodiac:{n:'Semi-rigide Lagune',d:'4 places · rapide, idéal pour explorer',price:18000,rent:120,seats:4,speed:1.25,pay:1},
  voilier:{n:'Voilier Alizé 32',d:'6 places · régates et croisières',price:95000,rent:0,seats:6,speed:1,pay:1.4,regatta:true},
  cata:{n:'Catamaran Perle',d:'12 passagers · navettes touristiques',price:380000,seats:12,speed:1.05,pay:2.2},
  yacht:{n:'Yacht Riva Aurore 52',d:'10 invités · croisières VIP',price:850000,seats:10,speed:1.15,pay:3.5,vip:true}
};
const SITES=[
  {id:'perles',n:'Île aux Perles',d:'Une crique turquoise où dorment des huîtres perlières.',item:['perle-noire','Perle noire de la Lagune','⚫',1800]},
  {id:'tortues',n:'Récif des Tortues',d:'Le grand récif où les tortues vertes viennent se nourrir.',item:['carapace','Écaille de tortue fossile','🐢',900]},
  {id:'phare',n:'Îlot du Vieux Phare',d:'Un phare abandonné depuis 1922, gardé par les fous de Bassan.',item:['lanterne','Lanterne du gardien de 1922','🏮',1400]},
  {id:'dauphins',n:'Banc des Dauphins',d:'Un haut-fond où une famille de dauphins joue dans l’étrave.',item:['photo-dauphin','Photo rare · dauphin sauteur','📸',700]},
  {id:'epave',n:'Épave du Saint-Aurore',d:'Un trois-mâts coulé en 1874 avec sa cloche intacte.',item:['cloche','Cloche du Saint-Aurore','🔔',3500],need:'voilier'},
  {id:'grotte',n:'Grotte des Corsaires',d:'Une grotte marine accessible à marée basse, pleine de légendes.',item:['doublon','Doublon de corsaire','🪙',2600],need:'yacht'}
];
const REGATTAS=['Régate du Port','Trophée des Alizés','Grand Prix de Solenne'];
const blank=()=>({permit:0,own:{},sel:null,found:{},trips:0,pax:0,vip:0,reg:{season:0,pts:0,run:0},regWins:0});
let S=C51.load(K,blank);S.own=S.own||{};S.found=S.found||{};S.reg=Object.assign({season:0,pts:0,run:0},S.reg||{});
const save=()=>C51.store(K,S);
const metYacht=()=>{try{const M=window.MET46;const own=M&&M.S&&M.S.own;return own&&Object.keys(own).some(k=>k.startsWith('yacht#'));}catch(e){return false;}};
const owns=id=>!!S.own[id]||(id==='yacht'&&metYacht());
const best=()=>['yacht','cata','voilier','zodiac'].find(owns)||null;
const boat=()=>{const id=S.sel&&owns(S.sel)?S.sel:best();return id?Object.assign({id},BOATS[id]):null;};
const here=()=>C51.where(player.x)==='solenne'?'sol':'port';
/* ---------------- capitainerie ---------------- */
function harbor(){const B=boat();
  if(S.permit<2){
    if(S.permit===0)return C52.panel('⚓ École de navigation','Passe ton permis bateau : code maritime (QCM) puis épreuve pratique d’amarrage. Ensuite : traversées, exploration, passagers et régates.',[C52.b('S’inscrire au permis',()=>{S.permit=1;save();harbor();},450)]);
    return C52.panel('⚓ Permis bateau','Étape 1 : code maritime (QCM). Étape 2 : manœuvre d’amarrage au ponton.',[{label:'Passer le code maritime',fn:code}]);}
  const rows=[];
  rows.push({label:'⛵ Traverser vers '+(here()==='sol'?'Port-Aurore':'Solenne')+(B?'':' · location '+fmt(BOATS.zodiac.rent)),fn:()=>cross()});
  rows.push({label:'🧭 Explorer les îles ('+Object.keys(S.found).length+'/'+SITES.length+')',fn:explore});
  rows.push({label:'🧳 Navette de passagers'+(B?' · '+B.seats+' places':''),off:!B,fn:shuttle});
  rows.push({label:'🍾 Croisière VIP en yacht',off:!owns('yacht'),fn:vip});
  rows.push({label:'🏁 Régates · '+REGATTAS[S.reg.run%3]+' · saison '+(S.reg.season+1),off:!(owns('voilier')||owns('yacht')),fn:regatta});
  rows.push({label:'🛥️ Ponton · mes bateaux',fn:dock});
  C52.panel('⚓ Capitainerie · '+(here()==='sol'?'Solenne':'Port-Aurore'),C52.rankName('mer')+' · '+S.trips+' sorties · '+S.pax+' passagers transportés. Bateau : '+(B?B.n:'aucun (location possible du semi-rigide)')+'.',rows);}
function code(){C52.mg('quiz',{id:'mer52-code',title:'Code maritime',icon:'⚓',n:5,time:14,min:30,q:[
  ['Un bateau qui arrive par ta droite…',['A la priorité','Doit s’arrêter','Doit klaxonner','N’existe pas'],0],
  ['Bâbord, c’est…',['La gauche du bateau','La droite','L’arrière','L’ancre'],0],
  ['Le gilet de sauvetage est…',['Obligatoire à bord','Inutile','Réservé aux enfants','Interdit'],0],
  ['Une bouée rouge (zone A) se laisse…',['À bâbord en entrant au port','À tribord','Au centre','Peu importe'],0],
  ['Par grand vent, on…',['Réduit la toile et la vitesse','Accélère','Coupe la radio','Jette l’ancre au large'],0],
  ['Le canal 16 de la VHF sert…',['Aux appels de détresse','À la musique','Aux pêcheurs seuls','À la météo seulement'],0]],
  after:s=>{if(s<.6)return 'Il faut 3 bonnes réponses. Réessaie.';setTimeout(()=>C52.mg('timing',{id:'mer52-amarrage',title:'Épreuve d’amarrage',icon:'🪢',steps:['Approche','Point mort','Marche arrière','Pare-battages','Amarre avant','Amarre arrière'],rounds:6,min:30,
    after:t=>{if(t>=.5){S.permit=2;save();C52.xp('mer',40);C52.title('Plaisancier');return 'Permis bateau obtenu ! La capitainerie t’est ouverte.';}return 'Manœuvre ratée, recommence quand tu veux.';}}),400);return 'Code maritime validé !';}});}
function needBoat(fn){const B=boat();if(B)return fn(B);C52.panel('Location','Pas de bateau au ponton. Louer le semi-rigide pour cette sortie ?',[C52.b('Louer le semi-rigide',()=>fn(Object.assign({id:'zodiac',rented:true},BOATS.zodiac)),BOATS.zodiac.rent)]);}
/* traversée : le joueur arrive vraiment dans l'autre ville */
let pend=null;
function cross(){needBoat(B=>{const toSol=here()!=='sol';pend=null;
  C52.mg('runner',{id:'mer52-cross',title:'Traversée vers '+(toSol?'Solenne':'Port-Aurore'),icon:'⛵',intro:'Évite les bouées, les cargos et les récifs. Attrape les poissons volants pour garder le cap.',diff:.45,dur:Math.round(28/B.speed),min:Math.round(70/B.speed),
    after:s=>{S.trips++;save();C52.xp('mer',25*(.5+s));const dest=toSol?C51.anchor('met:solenne-boat-rental',0,7,'sol27:ponton'):C51.anchor('met:centre-nautique',0,7,'job');
      pend=()=>{(window.fade27||((a,c)=>c&&c()))(true,()=>{player.x=dest.x;player.z=dest.z;if(player.mesh)player.mesh.position.set(dest.x,0,dest.z);if(window.CAMX)CAMX.tgt=null;saveProgress();if(window.fade27)fade27(false);if(window.banner27)banner27(toSol?'Île de Solenne':'Port-Aurore','Arrivée par la mer · '+B.n);});};
      return s<.3?'Traversée agitée, mais tu es arrivé.':'Belle traversée !';},
    done:()=>{if(pend){const f=pend;pend=null;setTimeout(f,150);}}});});}
function explore(){needBoat(B=>{const open=SITES.filter(x=>!x.need||owns(x.need));
  C52.panel('🧭 Exploration','Choisis une destination. Chaque site cache une trouvaille pour ton musée privé.',open.map(x=>({label:(S.found[x.id]?'✓ ':'')+x.n,fn:()=>dive(x,B)})).concat(SITES.filter(x=>x.need&&!owns(x.need)).map(x=>({label:'🔒 '+x.n+' · '+BOATS[x.need].n+' requis',off:true}))));});}
function dive(x,B){
  const o={after:s=>{S.trips++;C52.xp('mer',20+20*s);let msg=x.d;if(s>=.45&&!S.found[x.id]){S.found[x.id]=1;if(window.MUSEE52)MUSEE52.add(x.item[0],x.item[1],x.item[2],'mer',x.item[3]);msg='Trouvaille : '+x.item[1]+' !';}
    else if(s>=.45){const g=Math.round(120+260*s);C51.earn(g,'Exploration · '+x.n);msg='Coquillages et souvenirs revendus · '+fmt(g)+'.';}
    else msg='Pas de trouvaille cette fois. Reviens tenter ta chance.';
    if(Object.keys(S.found).length>=SITES.length)C52.trophy('mer-explorateur','Grand explorateur de la Lagune','🧭','mer',5000);save();return msg;}};
  if(x.id==='dauphins')C52.mg('photo',Object.assign({id:'mer52-'+x.id,title:x.n,icon:'🐬',subjects:[['🐬',4,'Dauphin'],['🐟',1],['🐠',1],['🐋',5,'Baleine']],dur:22,min:60},o));
  else C52.mg('catch',Object.assign({id:'mer52-'+x.id,title:x.n,icon:'🤿',intro:x.d+' Récupère les trésors, évite les méduses.',good:['🐚','🦪','⭐','💎','🪙'],bad:['🪼','🦈'],basket:'🧺',dur:22,min:60},o));}
function shuttle(){const B=boat();if(!B)return;const n=Math.max(2,Math.round(B.seats*(.6+Math.random()*.4)));
  C52.mg('balance',{id:'mer52-navette',title:'Navette · '+n+' passagers',icon:'🧳',intro:'La houle se lève : garde le bateau stable pour le confort des passagers.',dur:22,min:50,
    after:s=>{const pay=Math.round(n*(28+40*s)*B.pay);C51.earn(pay,'Navette maritime');S.pax+=n;save();C52.xp('mer',15+20*s);C52.xp('affaires',5);return n+' passagers débarqués · '+fmt(pay)+(s>=.8?' · pourboires généreux':'');}});}
function vip(){const guests=C52.pick(['Marc Delorme et ses associés','une star de la chanson','la délégation de l’Ambassade internationale','un couple de jeunes mariés','des investisseurs de Pearl Island']);
  C52.mg('quiz',{id:'mer52-vip',title:'Croisière VIP',icon:'🍾',n:4,time:12,min:120,intro:'À bord : '+guests+'. Assure un service irréprochable.',q:[
    ['Un invité a le mal de mer :',['Cap sur une crique abritée','Accélérer','L’ignorer','Servir un repas lourd'],0],
    ['Coucher de soleil prévu à 18 h 20 :',['Mouiller face à l’ouest','Rentrer au port','Couper les lumières','Aller vers l’est'],0],
    ['Le champagne se sert…',['Frais, verre incliné','Chaud','Dans un gobelet','Avec des glaçons'],0],
    ['Un dauphin approche :',['Ralentir et prévenir les invités','Klaxonner','Le poursuivre','Ne rien dire'],0],
    ['Avant de partir, on vérifie…',['Météo, carburant, gilets','Seulement la musique','Rien','La couleur des coussins'],0]],
    after:s=>{const pay=Math.round(2500+7500*s);C51.earn(pay,'Croisière VIP',true);S.vip++;save();C52.fame(Math.round(4*s));C52.xp('mer',35*s+15);if(S.vip>=5)C52.title('Capitaine des stars');return 'Croisière avec '+guests+' · '+fmt(pay)+'.';}});}
function regatta(){const name=REGATTAS[S.reg.run%3];
  C52.mg('runner',{id:'mer52-regate',title:name,icon:'🏁',intro:'Prends le vent ! Évite les bouées et les autres voiliers, attrape les risées.',diff:.5+.12*S.reg.season,dur:30,min:90,
    after:s=>{const place=s>=.85?1:s>=.65?2:s>=.45?3:s>=.25?5:8;const pts=[0,10,7,5,0,3,0,0,1][place]||0;S.reg.pts+=pts;S.reg.run++;let msg=name+' : '+place+(place===1?'re':'e')+' place · +'+pts+' pts (total '+S.reg.pts+').';
      if(place===1){S.regWins++;C51.earn(1500,'Prime de régate');}
      if(S.reg.run%3===0){const champ=S.reg.pts>=24;msg+=champ?' 🏆 Champion de la saison !':' Saison terminée.';if(champ)C52.trophy('mer-regate-'+S.reg.season,'Coupe de la Lagune · saison '+(S.reg.season+1),'⛵','sport',6000);S.reg.season++;S.reg.pts=0;}
      save();C52.xp('mer',20+30*s);C52.xp('arene',10*s);return msg;}});}
function dock(){const rows=Object.keys(BOATS).map(id=>{const B=BOATS[id];if(owns(id))return {label:(boat()&&boat().id===id?'✓ ':'')+B.n+' · '+B.d,fn:()=>{S.sel=id;save();toast(B.n+' prêt au ponton.','good');}};
  return C52.b('Acheter '+B.n+' · '+B.d,()=>{S.own[id]=1;S.sel=id;save();C52.xp('mer',40);C51.journal('Achat d’un bateau : '+B.n+'.');toast(B.n+' livré à la marina.','good');},B.price,S.permit<2);});
  C52.panel('🛥️ Ponton','Ta flotte est disponible dans les deux marinas.'+(metYacht()?' Ton yacht acheté au Yacht Club est déjà compté.':''),rows.concat([{label:'← Capitainerie',fn:harbor}]));}
C52.venue('mer52:port',['met:centre-nautique',0,7,'job'],0x2fc6c9,'⚓ Capitainerie & école de navigation',harbor);
C52.venue('mer52:sol',['met:solenne-boat-rental',0,7,'sol27:ponton'],0x2fc6c9,'⚓ Capitainerie de Solenne',harbor);
C52.tab('mer','Mer',(b,UI)=>{const B=boat();UI.hero(b,'Navigation · '+C52.rankName('mer'),S.permit>=2?'Permis bateau ✓':'Pas de permis',S.trips+' sorties · '+S.pax+' passagers · '+S.regWins+' régate(s) gagnée(s)');
  UI.btn(b,'📍 Capitainerie de Port-Aurore',()=>C52.go('mer52:port'),true);UI.btn(b,'📍 Capitainerie de Solenne',()=>C52.go('mer52:sol'));
  UI.sec(b,'Îles et sites');const g=UI.grp(b);SITES.forEach(x=>UI.row(g,{title:(S.found[x.id]?'✓ ':'○ ')+x.n,sub:S.found[x.id]?x.item[1]:x.d,wrap:true}));
  UI.note(b,'Bateau actuel : '+(B?B.n:'aucun')+'.');},20);
window.MER52={get state(){return S;},owns,BOATS,SITES};
})();
