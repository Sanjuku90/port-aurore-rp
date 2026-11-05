'use strict';
/* v51 · Histoire principale « Les Lumières d'Aurore » : 3 chapitres, 9 missions, personnages récurrents,
   choix qui changent la fin, la vitalité des villes et le titre du joueur. */
(function(){
const K='pa-story51';C51.resetKey(K);
const blank=()=>({step:0,path:null,flags:{},evidence:0,log:[],done:false,ending:null,title:null,accepted:false});
let S=C51.load(K,blank);const save=()=>C51.store(K,S);
const HUB=['job',-14,16];
const reward=(cash,rep,label)=>{if(cash)C51.earn(cash,label||'Mission · histoire');if(rep)C51.rep(rep);};
const remember=t=>{S.log.unshift({t,at:Math.floor(gameMin)});S.log=S.log.slice(0,20);C51.journal(t);};
const W=()=>window.WORLD50;
const vit=(id,d)=>{if(W()&&W().adjust)W().adjust(id,d);};
const STEPS=[
 {ch:1,title:'Une journaliste inquiète',place:'Rédaction d’Aurore Info · place centrale',at:HUB,hub:true,
  hint:'Rejoins Inès Kaboré à la rédaction d’Aurore Info, près du Pôle Emploi.',
  talk:()=>({who:'Inès Kaboré · Aurore Info',text:'« Les coupures de courant ne sont pas des accidents. Chaque fois, un camion sans logo quitte le port juste avant. J’ai besoin de quelqu’un de neuf, que personne ne soupçonne. Commence par les docks : demande Kofi. »',
   choices:[{label:'J’accepte l’enquête',go:()=>{S.accepted=true;remember('Enquête acceptée avec Inès Kaboré.');}},{label:'Pas maintenant',stay:true}]})},
 {ch:1,title:'Le témoin des docks',place:'Quai des Docks · Port-Aurore',at:['life41:events',7,-5],
  hint:'Trouve Kofi Mensah sur le quai des Docks, au sud du centre.',
  talk:()=>({who:'Kofi Mensah · docker',text:'« Tous les mardis, des camions de Delorme Groupe chargent des câbles haute tension au quai 4. Le lendemain, le quartier saute. Je peux te donner leurs immatriculations… mais j’ai une famille à nourrir. »',
   choices:[{label:'Lui offrir 50 $ pour la liste',cost:50,go:()=>{S.flags.kofiPaid=1;remember('Kofi a remis la liste des immatriculations.');}},
    {label:'Promettre de le protéger',go:()=>{S.flags.kofiTrust=1;C51.rep(1);remember('Promesse faite à Kofi : le protéger.');}}]})},
 {ch:1,title:'Les archives de la mairie',place:'Mairie de Port-Aurore',at:['mairie17',8,7],
  hint:'Consulte les permis aux archives de la mairie.',
  talk:()=>({who:'Mme Adjoa Traoré · archives',text:'« Un seul dossier porte ces immatriculations : le « Projet Lagune ». Privatisation du réseau électrique et du port, au profit de Delorme Groupe. Il attend la signature fédérale à Nouvelle-Aurore. »',
   choices:[{label:'Photographier le dossier · +120 $',go:()=>{reward(120,1);remember('Découverte du Projet Lagune.');}}]})},
 {ch:2,title:'Le cabinet fédéral',place:'Palais fédéral · Nouvelle-Aurore',at:['nat40:president',9,6],
  hint:'Prends le TGV jusqu’à Nouvelle-Aurore et rejoins le Palais fédéral.',
  talk:()=>({who:'Samuel Adjovi · cabinet de la présidente N’Dour',text:'« La présidente doit signer le Projet Lagune dans trois jours. Sans preuve solide, elle signera : Delorme promet des emplois. Suivez l’argent, la Banque fédérale publie ses registres. »',
   choices:[{label:'Obtenir une accréditation · +80 $',go:()=>{reward(80,1);remember('Accréditation fédérale obtenue.');}}]})},
 {ch:2,title:'Suivre l’argent',place:'Banque fédérale · Nouvelle-Aurore',at:['nat40:bank',9,5],
  hint:'Épluche les registres publics de la Banque fédérale.',
  talk:()=>({who:'Analyste de la Banque fédérale',text:()=>'« Delorme Groupe vire chaque mois des fonds à « Lagune Énergie », la société qui entretient… le réseau de Port-Aurore. Ils provoquent les pannes, puis se font payer les réparations. »'+(S.flags.kofiPaid?' Les immatriculations de Kofi correspondent aux camions de Lagune Énergie.':''),
   choices:[{label:'Copier les relevés · +150 $',go:()=>{S.evidence+=S.flags.kofiPaid?2:1;reward(150,1);remember('Preuves bancaires contre Lagune Énergie.');}}]})},
 {ch:2,title:'Face à Marc Delorme',place:'Aurore Exchange · quartier d’affaires',at:['met:aurore-exchange',0,8,'bank'],
  hint:'Marc Delorme t’attend devant Aurore Exchange. Ce rendez-vous change tout.',
  talk:()=>({who:'Marc Delorme · Delorme Groupe',text:'« Tu es doué. Rejoins-moi : 25 % de Lagune Énergie, un siège au conseil et 5 000 $ tout de suite. Ou continue à jouer les héros… mais les héros n’ont pas de courant. »',
   choices:[{label:'Refuser et garder les preuves',go:()=>{S.path='verite';C51.rep(3);remember('Offre de Delorme refusée.');}},
    {label:'Accepter l’association · +5 000 $',go:()=>{S.path='ambition';C51.earn(5000,'Prime d’associé · Delorme Groupe',true);remember('Associé de Marc Delorme.');}}]})},
 {ch:3,title:'Le président de Solenne',place:'Palais de Solenne',at:['nat40:president:sol',9,6],
  hint:'Prends l’avion pour Solenne et rencontre le président Élias Morel.',
  talk:()=>S.path==='ambition'?({who:'Président Élias Morel',text:'« Ton associé exige les terrains de la réserve naturelle pour une centrale. Je n’ai pas le choix… sauf si toi, tu me dis de résister. »',
   choices:[{label:'Lui faire signer l’accord',go:()=>{C51.rep(-2);remember('Accord de Solenne signé pour Delorme.');}},
    {label:'Se retourner contre Delorme · rendre 2 500 $',cost:2500,go:()=>{S.path='verite';S.flags.turned=1;C51.rep(4);remember('Volte-face : tu quittes Delorme Groupe.');}}]})
   :({who:'Président Élias Morel',text:'« Lagune Énergie veut bâtir une centrale au cœur de la réserve naturelle. Si tu documentes le site, je bloque le permis. »',
   choices:[{label:'Promettre de documenter la réserve',go:()=>{C51.rep(1);remember('Alliance avec le président Morel.');}}]})},
 {ch:3,title:'La réserve naturelle',place:'Réserve naturelle de Solenne',at:['met:nature-reserve-center',0,8,'life41:events:sol'],
  hint:'Rejoins la garde Nadia Sow au centre de la réserve naturelle.',
  talk:()=>S.path==='ambition'?({who:'Nadia Sow · garde de la réserve',text:'« Les géomètres de Delorme plantent leurs piquets au milieu des nids de tortues. Tu supervises, paraît-il. »',
   choices:[{label:'Superviser les relevés · +1 500 $',go:()=>{C51.earn(1500,'Relevés · Lagune Énergie',true);remember('Relevés de la centrale supervisés.');}}]})
   :({who:'Nadia Sow · garde de la réserve',text:'« Les piquets des géomètres sont plantés au milieu des nids de tortues vertes. Photographie tout : ce sera la preuve décisive. »',
   choices:[{label:'Photographier les piquets et les nids',go:()=>{S.evidence+=1;C51.mood(10);remember('Photos de la réserve menacée.');}}]})},
 {ch:3,title:'Le grand final',place:'Rédaction d’Aurore Info · place centrale',at:HUB,hub:true,
  hint:'Reviens à Port-Aurore : Inès t’attend pour décider de l’avenir des trois cités.',
  talk:()=>S.path==='ambition'?({who:'Inès Kaboré · Aurore Info',text:'« Alors c’est vrai… Tu as choisi Delorme. Demain, Lagune Énergie inaugure sa centrale. Port-Aurore aura du courant, Solenne perdra sa réserve. »',
   choices:[{label:'Inaugurer Lagune Énergie · +8 000 $',go:()=>finish('ambition')}]})
   :({who:'Inès Kaboré · Aurore Info',text:()=>'« Nous avons '+S.evidence+' preuve(s) solide(s). Publions-les, ou remettons le dossier à la présidente Diallo pour une enquête discrète. »',
   choices:[{label:'Publier le scandale dans Aurore Info',go:()=>finish('publie')},{label:'Remettre le dossier à la présidente Diallo',go:()=>finish('discret')}]})}
];
const ENDINGS={
 publie:{title:'Lanceur d’alerte',text:'Le scandale fait la une. Marc Delorme est arrêté, le réseau électrique redevient public et la réserve de Solenne est protégée. Les trois cités te reconnaissent.',cash:2500,rep:10,v:{port:12,nouvelle:12,solenne:12}},
 discret:{title:'Conseiller de la Présidente',text:'La présidente Diallo démantèle Lagune Énergie sans bruit. Le réseau est sécurisé, Port-Aurore te confie une mission permanente de conseil.',cash:4000,rep:7,v:{port:10,nouvelle:5,solenne:8}},
 ambition:{title:'Magnat de la Lagune',text:'Lagune Énergie inaugure sa centrale. Port-Aurore prospère, Solenne perd sa réserve et beaucoup te regardent de travers. Ta fortune, elle, explose.',cash:8000,rep:2,v:{port:10,nouvelle:3,solenne:-15}}
};
function finish(kind){const E=ENDINGS[kind];S.done=true;S.ending=kind;S.title=E.title;C51.earn(E.cash,'Final · Les Lumières d’Aurore',true);C51.rep(E.rep);Object.keys(E.v).forEach(k=>vit(k,E.v[k]));if(S.flags.kofiTrust&&kind!=='ambition')C51.rep(2);remember('Final de l’histoire : '+E.title+'.');save();
 setTimeout(()=>openPanel('Épilogue · '+E.title,E.text+(S.flags.kofiTrust?(kind==='ambition'?' Kofi a perdu son emploi aux docks et ne te parle plus.':' Kofi est devenu chef d’équipe au port et te salue à chaque passage.'):'')+' Titre débloqué : « '+E.title+' ».',[{label:'Terminer',fn:()=>{}}]),120);}
const cur=()=>STEPS[S.step]||null;
const posOf=st=>C51.anchor(st.at[0],st.at[1],st.at[2],st.at[3]);
function syncMarkers(){
  C51.mark('story51:hub',C51.anchor(HUB[0],HUB[1],HUB[2]),0xffd23f,S.done?'📰 Aurore Info · épilogue':'📰 Aurore Info · histoire principale',1.1);
  const st=cur();if(!st||S.done||st.hub||(S.step===0)){C51.unmark('story51:obj');return;}
  C51.mark('story51:obj',posOf(st),0xffd23f,'★ '+st.title,1.15);
}
function advance(){S.step++;save();syncMarkers();const st=cur();if(st&&!S.done){const p=st.hub?C51.anchor(HUB[0],HUB[1],HUB[2]):posOf(st);C51.gps(p.x,p.z,st.title);C51.notify('★ Chapitre '+st.ch+' · '+st.title,st.hint,[['Itinéraire',()=>C51.gps(p.x,p.z,st.title)]]);}}
function talk(){const st=cur();if(!st)return;const T=st.talk(),text=typeof T.text==='function'?T.text():T.text;
  openPanel('Chapitre '+st.ch+' · '+st.title,T.who+' — '+text,T.choices.map(c=>({label:c.label+(c.cost?' · '+fmt(c.cost):''),off:!!c.cost&&!C51.afford(c.cost),fn:()=>{if(c.stay)return;if(c.cost&&!C51.pay(c.cost,'Histoire · '+st.title))return;c.go();if(S.done){syncMarkers();return;}advance();}})));}
function summary(){const st=cur();
  if(S.done){const E=ENDINGS[S.ending];openPanel('Les Lumières d’Aurore · terminée','Fin obtenue : « '+E.title+' ». '+E.text+' Un nouveau chapitre arrivera dans une prochaine version.',[{label:'Relire mon parcours',fn:()=>openPanel('Mon parcours',S.log.map(l=>'• '+l.t).join('  ')||'Aucun souvenir.',[{label:'Fermer',fn:()=>{}}])}]);return;}
  if(st.hub){talk();return;}
  const p=posOf(st);openPanel('Chapitre '+st.ch+' · '+st.title,'Objectif : '+st.hint+' Lieu : '+st.place+'.',[{label:'Lancer le GPS',fn:()=>C51.gps(p.x,p.z,st.title)}]);}
C51.handle('story51:hub',()=>summary());
C51.handle('story51:obj',()=>{const st=cur();if(st&&!st.hub)talk();});
C51.onReady(()=>{syncMarkers();if(!S.accepted&&S.step===0)setTimeout(()=>C51.notify('📰 Aurore Info cherche un enquêteur','Inès Kaboré t’attend près du Pôle Emploi pour une histoire qui va secouer les trois cités.',[['Y aller',()=>{const p=C51.anchor(HUB[0],HUB[1],HUB[2]);C51.gps(p.x,p.z,'Aurore Info');}]]),9000);});
C51.every(5,syncMarkers);
window.STORY51={get state(){return S;},steps:STEPS.length,current:()=>{const st=cur();return st?{ch:st.ch,title:st.title,hint:st.hint,place:st.place}:null;},
  gps:()=>{const st=cur();if(!st||S.done)return;const p=st.hub?C51.anchor(HUB[0],HUB[1],HUB[2]):posOf(st);C51.gps(p.x,p.z,st.title);},open:summary,get title(){return S.title;},endings:ENDINGS};
})();
