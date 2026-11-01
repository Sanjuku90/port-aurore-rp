'use strict';
/* ---------- phase 5 + 8 : économie, immobilier et smartphone de vie ---------- */
const ECON_KEY='port-aurore-economy-v1';
const ECON={rent:18,utilities:6,day:1440,salary:{livreur:22,taxi:30,police:38},businesses:[
  {id:'cafe',name:'Café Aurore',price:8500,income:28},
  {id:'shop',name:'Supérette du Port',price:14000,income:42},
  {id:'boutique',name:'Boutique Mode',price:11500,income:34},
  {id:'pharma',name:'Pharmacie Aurore',price:16500,income:46}
]};
let walletP58={businesses:[],homeOwned:false,lease:true,nextBill:gameMin+ECON.day,unpaidRent:0,unpaidUtilities:0,furniture:[],ledger:[],posts:[],prices:{water:2,soda:3,sand:8,menu:15,fish:12},lastDay:Math.floor(gameMin/ECON.day),nextId:1};
function saveEconomyP58(){try{localStorage.setItem(ECON_KEY,JSON.stringify(walletP58,(k,v)=>k==='group'?undefined:v));}catch(e){}}
function resetPhase58(){walletP58={businesses:[],homeOwned:false,lease:true,nextBill:gameMin+ECON.day,unpaidRent:0,unpaidUtilities:0,furniture:[],ledger:[],posts:[],prices:{water:2,soda:3,sand:8,menu:15,fish:12},lots:[],projects:[],lastDay:Math.floor(gameMin/ECON.day),nextId:1};try{localStorage.removeItem(ECON_KEY);}catch(e){}}
try{const e=JSON.parse(localStorage.getItem(ECON_KEY)||'null');if(e&&typeof e==='object')walletP58=Object.assign(walletP58,e);}catch(e){}
walletP58.businesses=Array.isArray(walletP58.businesses)?walletP58.businesses:[];walletP58.furniture=Array.isArray(walletP58.furniture)?walletP58.furniture:[];walletP58.ledger=Array.isArray(walletP58.ledger)?walletP58.ledger.slice(-80):[];walletP58.posts=Array.isArray(walletP58.posts)?walletP58.posts.slice(-30):[];walletP58.prices=Object.assign({water:2,soda:3,sand:8,menu:15,fish:12},walletP58.prices||{});
function econTxP58(label,amount,account){walletP58.ledger.unshift({label,amount,account:account||'Cash',time:Math.floor(gameMin),id:walletP58.nextId++});walletP58.ledger=walletP58.ledger.slice(0,80);saveEconomyP58();}
function econDebitP58(amount,label,fromBank){amount=Math.max(0,Math.round(amount));const src=fromBank?'bank':'cash';if(state[src]<amount)return false;state[src]-=amount;econTxP58(label,-amount,fromBank?'Banque':'Cash');saveProgress();return true;}
function econCreditP58(amount,label,toBank){amount=Math.max(0,Math.round(amount));const dst=toBank?'bank':'cash';state[dst]+=amount;econTxP58(label,amount,toBank?'Banque':'Cash');saveProgress();}
function econFmtTimeP58(minute){const d=Math.floor(minute/1440)+1,t=Math.floor(minute%1440);return 'Jour '+d+' · '+String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');}
function econDailyP58(){
  if(!started)return;
  let guard=0;
  while(gameMin>=walletP58.nextBill&&guard++<5){
    walletP58.nextBill+=ECON.day;
    if(state.job){const wage=ECON.salary[state.job]||20;econCreditP58(wage,'Salaire · '+(JOBN[state.job]||state.job),true);}
    walletP58.businesses.forEach(id=>{const b=ECON.businesses.find(x=>x.id===id);if(b)econCreditP58(b.income,'Bénéfice · '+b.name,true);});
    if(walletP58.lease&&!walletP58.homeOwned){const bill=ECON.rent+ECON.utilities;if(state.bank+state.cash>=bill){const b=Math.min(state.bank,bill);if(b)econDebitP58(b,'Loyer · appartement',true);const left=bill-b;if(left)econDebitP58(left,'Loyer · appartement',false);walletP58.unpaidRent=0;walletP58.unpaidUtilities=0;}else{walletP58.unpaidRent+=ECON.rent;walletP58.unpaidUtilities+=ECON.utilities;econTxP58('Factures en attente',-bill,'Échu');toast('Loyer ou factures en attente. Régle-les depuis Immobilier.','warn');}}
    else if(walletP58.homeOwned){if(state.bank+state.cash>=ECON.utilities){const b=Math.min(state.bank,ECON.utilities);if(b)econDebitP58(b,'Électricité et eau',true);if(ECON.utilities-b)econDebitP58(ECON.utilities-b,'Électricité et eau',false);}else{walletP58.unpaidUtilities+=ECON.utilities;toast('Facture d’électricité/eau en attente.','warn');}}
    if(Math.floor(walletP58.nextBill/ECON.day)%7===0&&state.bank>0)econCreditP58(Math.max(1,Math.floor(state.bank*.002)),'Intérêts du compte',true);
    toast('Comptabilité du jour mise à jour.','good');
  }
  saveEconomyP58();
}
const _updateP58=update;update=function(dt){const prev=state.done;_updateP58(dt);if(walletP58.lastEarned==null)walletP58.lastEarned=state.earned;if(state.done>prev){const earned=Math.max(0,state.earned-walletP58.lastEarned);econTxP58('Salaire de mission · '+state.name,earned,'Cash');walletP58.lastEarned=state.earned;}econDailyP58();};
const _saveP58=saveProgress;saveProgress=function(){_saveP58();saveEconomyP58();};
const _resetP58=resetProgress;resetProgress=function(){resetPhase58();_resetP58();};
const _newP58=typeof resetFleetP4==='function'?resetFleetP4:null;
/* achats et améliorations de l’appartement : extras visibles, ajoutés aux intérieurs v7. */
const HOME_FURN=[
  {id:'rug',name:'Tapis et coussins',price:180,color:0x4e8a87},
  {id:'lamp',name:'Lampe d’ambiance',price:240,color:0xe8bd71},
  {id:'plant',name:'Plantes et décoration',price:320,color:0x4b8a59},
  {id:'art',name:'Tableaux et déco murale',price:450,color:0xb8835b}
];
function addHomeFurnitureP58(R,id){
  if(!R||!R.G||R.furn58&&R.furn58.includes(id))return;
  R.furn58=R.furn58||[];R.furn58.push(id);const g=new THREE.Group();R.G.add(g);
  const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.72,metalness:.04});
  if(id==='rug'){const rug=new THREE.Mesh(new THREE.CircleGeometry(1.05,32),mat(0x527d8a));rug.rotation.x=-Math.PI/2;rug.position.set(-1.5,.028,2.1);g.add(rug);for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.42,.16,.42),mat([0xd6ba8e,0x6b8295,0xb78d6d][i]));p.position.set(-2.3+i*.7,.22,2.2);g.add(p);}}
  if(id==='lamp'){const stem=new THREE.Mesh(new THREE.CylinderGeometry(.035,.06,1.35,10),mat(0x34343a));stem.position.set(1.4,.68,2.8);g.add(stem);const shade=new THREE.Mesh(new THREE.ConeGeometry(.27,.32,16),mat(0xffd890));shade.position.set(1.4,1.48,2.8);g.add(shade);}
  if(id==='plant'){const pot=new THREE.Mesh(new THREE.CylinderGeometry(.18,.14,.32,12),mat(0x9a684c));pot.position.set(7.8,.17,2.1);g.add(pot);for(let i=0;i<5;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),mat(0x4a8750));leaf.scale.set(.55,1.6,.45);leaf.position.set(7.8+Math.cos(i*1.25)*.2,.55+i%2*.12,2.1+Math.sin(i*1.25)*.2);g.add(leaf);}}
  if(id==='art'){for(let i=0;i<3;i++){const frame=new THREE.Mesh(new THREE.BoxGeometry(.72,.82,.07),mat(0x79573c));frame.position.set(-.8+i*.95,1.95,6.37);g.add(frame);const art=new THREE.Mesh(new THREE.PlaneGeometry(.58,.66),mat([0x74a3a0,0xd6aa66,0x7970a0][i]));art.position.set(-.8+i*.95,1.95,6.32);g.add(art);}}
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
}
const _buildHome58=buildHome7;buildHome7=function(R){_buildHome58(R);(walletP58.furniture||[]).forEach(id=>addHomeFurnitureP58(R,id));};
const _enterInterior58=enterInterior;enterInterior=function(s){if(s&&s.id==='home'&&!walletP58.lease&&!walletP58.homeOwned){toast('Ton bail est suspendu. Loue ou achète un logement dans l’appli Immobilier.','warn');return;}_enterInterior58(s);};
function propertyPanelP58(){
  const owned=walletP58.homeOwned,leased=walletP58.lease,opts=[];
  if(!owned&&!leased)opts.push({label:'Louer · '+fmt(80)+' dépôt',off:state.cash<80,fn:()=>{if(!econDebitP58(80,'Dépôt de garantie · logement',false))return;walletP58.lease=true;walletP58.unpaidRent=0;walletP58.unpaidUtilities=0;walletP58.nextBill=gameMin+ECON.day;toast('Bail signé : appartement disponible.','good');saveEconomyP58();}});
  if(!owned&&leased)opts.push({label:'Acheter l’appartement · '+fmt(4800),off:state.cash<4800,fn:()=>{if(!econDebitP58(4800,'Achat · appartement',false))return;walletP58.homeOwned=true;walletP58.lease=false;toast('Appartement acheté. Plus de loyer, factures à ta charge.','good');saveEconomyP58();}});
  if(owned)opts.push({label:'Vendre l’appartement · +'+fmt(3200),fn:()=>{walletP58.homeOwned=false;walletP58.lease=false;econCreditP58(3200,'Vente · appartement',false);toast('Appartement vendu.','good');}});
  if(leased&&!owned)opts.push({label:'Résilier le bail',fn:()=>{walletP58.lease=false;walletP58.unpaidRent=0;walletP58.unpaidUtilities=0;toast('Bail résilié.','');saveEconomyP58();}});
  if(walletP58.unpaidRent||walletP58.unpaidUtilities){const due=walletP58.unpaidRent+walletP58.unpaidUtilities;opts.push({label:'Régler les impayés · '+fmt(due),off:state.cash+state.bank<due,fn:()=>{let rem=due,bank=Math.min(rem,state.bank);if(bank){econDebitP58(bank,'Règlement des impayés',true);rem-=bank;}if(rem)econDebitP58(rem,'Règlement des impayés',false);walletP58.unpaidRent=0;walletP58.unpaidUtilities=0;toast('Factures régularisées.','good');}});}
  opts.push({label:'Voir / acheter du mobilier',fn:()=>furniturePanelP58()});
  openPanel('Immobilier · Appartement Aurore',`${owned?'Propriétaire':leased?'Locataire':'Sans logement'} · loyer ${leased&&!owned?fmt(ECON.rent):fmt(0)}/jour · charges ${fmt(ECON.utilities)}/jour · impayés ${fmt(walletP58.unpaidRent+walletP58.unpaidUtilities)}.`,opts);
}
function furniturePanelP58(){openPanel('Mobilier et décoration','Ces objets apparaissent dans ton appartement.',HOME_FURN.map(x=>({label:(walletP58.furniture.includes(x.id)?'✓ ':'')+x.name+' · '+fmt(x.price),off:walletP58.furniture.includes(x.id)||state.cash<x.price,fn:()=>{if(!econDebitP58(x.price,'Mobilier · '+x.name,false))return;walletP58.furniture.push(x.id);const R=ROOMS.home;if(R){addHomeFurnitureP58(R,x.id);toast(x.name+' installé chez toi.','good');}else toast('Mobilier acheté, il sera installé à la prochaine entrée chez toi.','good');saveEconomyP58();}})) );}
const _openSpot58=openSpot;openSpot=function(id){if(id==='home'){propertyPanelP58();return;}_openSpot58(id);};
/* Banque avec virements, paiements de factures et relevé. */
function bankApp58(b){
  const card=mk('div','bigc');card.appendChild(mk('small',null,'Compte courant'));card.appendChild(mk('b',null,fmt(state.bank)));card.appendChild(mk('span',null,'Cash disponible : '+fmt(state.cash)));b.appendChild(card);
  const add=(label,fn,off)=>{const x=mk('button','pbtn',label,fn);x.disabled=!!off;b.appendChild(x);};
  add('Déposer tout le cash · '+fmt(state.cash),()=>{if(state.cash>0){const n=state.cash;state.cash=0;econCreditP58(n,'Dépôt espèces',true);phOpen(findAppP58('Banque'));}},state.cash<=0);
  [50,200].forEach(n=>add('Retirer '+fmt(n),()=>{if(state.bank>=n){state.bank-=n;state.cash+=n;econTxP58('Retrait espèces',-n,'Banque');phOpen(findAppP58('Banque'));}},state.bank<n));
  add('Paiement carte · convertir 50 en cash',()=>{if(econDebitP58(50,'Retrait carte',true)){state.cash+=50;phOpen(findAppP58('Banque'));}},state.bank<50);
  const fr=state.friends||[];if(fr.length){const sel=document.createElement('select');sel.className='ph-select';fr.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});const inp=document.createElement('input');inp.className='ph-input';inp.type='number';inp.min='1';inp.max=String(state.bank);inp.placeholder='Montant du virement';b.appendChild(sel);b.appendChild(inp);add('Envoyer le virement',()=>{const n=Math.floor(+inp.value),to=sel.value;if(!n||n>state.bank){toast('Solde insuffisant ou montant invalide.','warn');return;}state.bank-=n;econTxP58('Virement envoyé à '+to,-n,'Banque');say({position:{x:player.x,y:1,z:player.z}},'Virement reçu : '+fmt(n),4);toast('Virement envoyé à '+to+'.','good');phOpen(findAppP58('Banque'));},!state.bank);}
  add('Régler loyer et factures',()=>{closePanel();propertyPanelP58();},!(walletP58.unpaidRent+walletP58.unpaidUtilities));
  b.appendChild(mk('small',null,'Activité récente'));
  walletP58.ledger.slice(0,12).forEach(t=>{const row=mk('div','prow');row.appendChild(mk('b',null,t.label));row.appendChild(mk('span',null,(t.amount>0?'+':'')+fmt(t.amount)+' · '+t.account+' · '+econFmtTimeP58(t.time)));b.appendChild(row);});
  if(!walletP58.ledger.length)b.appendChild(mk('p','dim','Tes dépôts, virements, salaires et factures apparaîtront ici.'));
}
function findAppP58(name){return APPS.find(a=>a[0]===name);}
const bankAppObjP58=findAppP58('Banque');if(bankAppObjP58)bankAppObjP58[3]=bankApp58;
/* Réseau social local fictif, annonces et contacts/appels. */
function contactAppP58(b){
  const names=[...new Set([...(state.friends||[]),'Commissariat','Urgences','Auto-école','Agence Aurore'])];
  names.forEach(n=>{const row=mk('div','prow');row.appendChild(mk('b',null,n));row.appendChild(mk('span',null,state.friends.includes(n)?'Contact enregistré':'Service public'));
    const actions=mk('div','contact-actions');
    actions.appendChild(mk('button','pbtn','📞 Appeler',()=>callContactP58(n)));
    if(state.friends.includes(n))actions.appendChild(mk('button','pbtn','💬 Message',()=>{if(!threads[n])threads[n]=[];phThread(n);}));
    row.appendChild(actions);b.appendChild(row);
  });
}
function callAppP58(b){
  b.appendChild(mk('p','dim','Appels de rôle simulés dans le jeu, sans connexion réelle.'));
  const opts=[...(state.friends||[]).map(n=>[n,'📞 Appeler '+n]),['Commissariat','🚓 Commissariat'],['Urgences','🚑 Urgences'],['Taxi','🚕 Réserver un taxi'],['Agence Aurore','🏠 Agence immobilière']];
  opts.forEach(([name,label])=>b.appendChild(mk('button','pbtn',label,()=>callContactP58(name))));
  (walletP58.calls||[]).slice(-8).reverse().forEach(c=>b.appendChild(mk('div','prow',c.name+' · '+c.result)));
}
function callContactP58(name){
  if(name==='Taxi'){const a=findAppP58('Taxi');if(a)phOpen(a);return;}
  if(name==='Agence Aurore'){closePanel();propertyPanelP58();return;}
  if(name==='Urgences'){if(state.cash+state.bank<80){toast('Intervention médicale : $80 requis.','warn');return;}let due=80;if(state.cash>=due)state.cash-=due;else{due-=state.cash;state.cash=0;state.bank-=due;}econTxP58('Intervention médicale',-80,'Urgences');state.health=Math.min(100,state.health+45);state.thirst=Math.min(100,state.thirst+10);toast('Les secours arrivent. +45 santé.','good');recordCallP58(name,'Intervention terminée');phHome();return;}
  if(name==='Commissariat'){toast('La police a enregistré ton appel.','good');recordCallP58(name,'Signalement enregistré');phHome();return;}
  if(name==='Auto-école'){if(typeof openSpot==='function'){closePanel();openSpot('drivingschool');}return;}
  if(blackout>0){toast('Réseau indisponible pendant la coupure.','warn');return;}
  if(!walletP58.calls)walletP58.calls=[];toast('Appel en cours : '+name+'…');setTimeout(()=>{const result=pick(['Vous convenez d’un rendez-vous au Café Aurore.','La personne te donne des nouvelles du quartier.','Pas de réponse, rappelle un peu plus tard.']);recordCallP58(name,result);state.fun=Math.min(100,state.fun+3);toast('Appel terminé : '+result,'good');if(!$('#phone').hidden)phHome();},1200);
}
function recordCallP58(name,result){walletP58.calls=walletP58.calls||[];walletP58.calls.push({name,result,time:Math.floor(gameMin)});walletP58.calls=walletP58.calls.slice(-30);saveEconomyP58();}
function announcementsAppP58(b){
  b.appendChild(mk('p','dim','Offres et petites annonces locales, générées pour le mode solo.'));
  const rows=[['Emploi','Livreur recherché · salaire par mission, bonus quotidien '+fmt(ECON.salary.livreur),()=>{closePanel();openSpot('job');}],['Immobilier','Appartement meublé à louer · '+fmt(ECON.rent)+' par jour',()=>{closePanel();propertyPanelP58();}],['Transport','Véhicules disponibles au concessionnaire Aurora',()=>{closePanel();openSpot('dealership');}],['Loisirs','Soirée au Club Néon · samedi, entrée libre avant 21 h',()=>{wp={x:64,z:64,l:'Club Néon'};toast('Itinéraire vers le Club Néon ajouté.','good');phOpen(findAppP58('Plan'));}]];
  rows.forEach(([title,txt,fn])=>{const r=mk('button','prow',null,fn);r.appendChild(mk('b',null,title));r.appendChild(mk('span',null,txt));b.appendChild(r);});
  walletP58.posts.slice(0,12).forEach(p=>{const r=mk('div','prow');r.appendChild(mk('b',null,p.author+' · '+p.title));r.appendChild(mk('span',null,p.text));b.appendChild(r);});
}
function socialAppP58(b){
  const inp=document.createElement('input');inp.className='ph-input';inp.maxLength=100;inp.placeholder='Quoi de neuf à Port-Aurore ?';b.appendChild(inp);
  b.appendChild(mk('button','pbtn hot','Publier',()=>{const txt=inp.value.trim();if(!txt)return;walletP58.posts.unshift({author:state.name,title:'Journal de Port-Aurore',text:txt,time:Math.floor(gameMin),likes:0});walletP58.posts=walletP58.posts.slice(0,30);econTxP58('Publication sociale','0','Réseau');toast('Publication partagée.','good');phOpen(findAppP58('Réseaux'));}));
  walletP58.posts.forEach((p,i)=>{const row=mk('div','prow');row.appendChild(mk('b',null,p.author+' · '+econFmtTimeP58(p.time)));row.appendChild(mk('span',null,p.text));row.appendChild(mk('button','pbtn','♥ '+(p.likes||0),()=>{p.likes=(p.likes||0)+1;toast('J’aime ajouté.','good');phOpen(findAppP58('Réseaux'));}));b.appendChild(row);});
  if(!walletP58.posts.length)b.appendChild(mk('p','dim','Le fil est calme. Publie ton premier message.'));
}
function employmentAppP58(b){
  b.appendChild(mk('p','dim','Postes, salaires journaliers et suivi des missions. Les missions restent la meilleure source de revenu.'));
  Object.keys(JOBN).forEach(id=>b.appendChild(mk('div','prow',(JOBN[id]||id)+' · salaire/jour '+fmt(ECON.salary[id]||0))));
  b.appendChild(mk('button','pbtn hot','Chercher un emploi',()=>{closePanel();openSpot('job');}));
  b.appendChild(mk('div','prow','Progression · '+state.done+' missions · '+fmt(state.earned)+' gagnés'));
}
function propertyAppP58(b){
  const card=mk('div','bigc');card.appendChild(mk('small',null,'Appartement Aurore'));card.appendChild(mk('b',null,walletP58.homeOwned?'Propriétaire':walletP58.lease?'Bail actif':'Sans logement'));card.appendChild(mk('span',null,'Loyer '+fmt(walletP58.homeOwned?0:ECON.rent)+' / jour · Charges '+fmt(ECON.utilities)+' / jour'));b.appendChild(card);
  b.appendChild(mk('div','prow','Impayés · '+fmt(walletP58.unpaidRent+walletP58.unpaidUtilities)));
  b.appendChild(mk('button','pbtn hot','Gérer le logement',()=>{closePanel();propertyPanelP58();}));
  b.appendChild(mk('button','pbtn','Aller chez moi',()=>{const h=spots.find(s=>s.id==='home');if(h){wp={x:h.x,z:h.z,l:'Appartement'};closePanel();toast('GPS vers ton appartement activé.','good');}}));
}
function businessesAppP58(b){
  const c=mk('div','bigc');c.appendChild(mk('small',null,'Entreprises détenues'));c.appendChild(mk('b',null,String(walletP58.businesses.length)));c.appendChild(mk('span',null,'Revenus journaliers déposés automatiquement en banque.'));b.appendChild(c);
  ECON.businesses.forEach(x=>{const owned=walletP58.businesses.includes(x.id),row=mk('div','prow');row.appendChild(mk('b',null,x.name));row.appendChild(mk('span',null,owned?'À toi · bénéfice '+fmt(x.income)+'/jour':'À vendre · '+fmt(x.price)+' · bénéfice '+fmt(x.income)+'/jour'));row.appendChild(mk('button','pbtn',owned?'Géré':'Acheter',()=>{if(owned)return;if(!econDebitP58(x.price,'Achat entreprise · '+x.name,false)){toast('Cash insuffisant pour cette entreprise.','warn');return;}walletP58.businesses.push(x.id);saveEconomyP58();toast(x.name+' rejoint ton portefeuille.','good');phOpen(findAppP58('Entreprises'));}));row.lastChild.disabled=!owned&&state.cash<x.price;b.appendChild(row);});
  if(walletP58.businesses.includes('shop')){
    b.appendChild(mk('small',null,'Prix publics · Supérette du Port'));
    [['water','Eau'],['soda','Soda'],['sand','Sandwich'],['menu','Menu complet'],['fish','Poisson grillé']].forEach(([id,label])=>{
      const row=mk('div','prow');row.appendChild(mk('b',null,label+' · '+fmt(walletP58.prices[id])));
      row.appendChild(mk('button','pbtn','− $1',()=>{walletP58.prices[id]=Math.max(1,walletP58.prices[id]-1);saveEconomyP58();phOpen(findAppP58('Entreprises'));}));
      row.appendChild(mk('button','pbtn','+ $1',()=>{walletP58.prices[id]=Math.min(40,walletP58.prices[id]+1);saveEconomyP58();phOpen(findAppP58('Entreprises'));}));b.appendChild(row);
    });
  }
}
function accountAppP58(b){
  const obj=findAppP58('Banque');if(obj)bankApp58(b);
}
function addPhoneAppP58(title,icon,grad,fn){APPS.push([title,icon,grad,fn]);}
addPhoneAppP58('Contacts','👥','#39c5bb,#116c74',contactAppP58);
addPhoneAppP58('Appels','📞','#46ce81,#137445',callAppP58);
addPhoneAppP58('Annonces','📣','#ffc45b,#995a14',announcementsAppP58);
addPhoneAppP58('Réseaux','✨','#f06acb,#7140b2',socialAppP58);
addPhoneAppP58('Immobilier','🏠','#81caff,#315a9a',propertyAppP58);
addPhoneAppP58('Entreprises','🏪','#e6b85c,#765523',businessesAppP58);
addPhoneAppP58('Emploi','🧰','#8ad3ff,#1d4f8a',employmentAppP58);
addPhoneAppP58('Compte','📒','#79a8d5,#3b4c63',accountAppP58);
const deliveryAppP58=APPS.find(a=>a[0]==='Miam');if(deliveryAppP58){deliveryAppP58[0]='Livraison';deliveryAppP58[3]=appFood;}

const _superetteP58=superette;superette=function(){market('Supérette','Prix affichés par la boutique. Soif '+Math.round(state.thirst)+' · Faim '+Math.round(state.hunger)+'.', [['water',walletP58.prices.water],['soda',walletP58.prices.soda],['sand',walletP58.prices.sand],['menu',walletP58.prices.menu],['fish',walletP58.prices.fish]],superette);};
const _foodAppP58=appFood;appFood=function(b){
  b.appendChild(mk('p','dim','Livraison à domicile · frais de service '+fmt(4)+'. Prix selon la Supérette du Port.'));
  [['Tacos du Port','sand',35],['Pizza Aurore','menu',55],['Poisson braisé','fish',45]].forEach(([name,id,food])=>{const price=walletP58.prices[id]+4,x=mk('button','pbtn',name+' · '+fmt(price),()=>{if(blackout>0){toast('Pas de réseau.','warn');return;}if(state.cash<price)return;state.cash-=price;econTxP58('Livraison · '+name,-price,'Cash');toast('Commande envoyée : '+name,'good');phOpen(findAppP58('Livraison'));setTimeout(()=>{state.hunger=Math.min(100,state.hunger+food);toast(name+' livré. +'+food+' de faim','good');},7000);});x.disabled=state.cash<price;b.appendChild(x);});
};
function billsAppP58(b){
  const rent=walletP58.homeOwned?0:walletP58.lease?ECON.rent:0,charges=walletP58.homeOwned||walletP58.lease?ECON.utilities:0;
  b.appendChild(mk('div','bigc','',null));const c=b.lastChild;c.appendChild(mk('small',null,'Prochaine échéance'));c.appendChild(mk('b',null,econFmtTimeP58(walletP58.nextBill)));c.appendChild(mk('span',null,'Loyer '+fmt(rent)+' · eau/électricité '+fmt(charges)+' · impayés '+fmt(walletP58.unpaidRent+walletP58.unpaidUtilities)));
  b.appendChild(mk('button','pbtn hot','Régler les impayés',()=>{closePanel();propertyPanelP58();}));
  b.appendChild(mk('p','dim','Salaire journalier déposé en banque : '+fmt(ECON.salary[state.job]||0)+(state.job?' · '+(JOBN[state.job]||state.job):' · aucun emploi actif')));
  walletP58.ledger.slice(0,15).forEach(t=>{const r=mk('div','prow');r.appendChild(mk('b',null,t.label));r.appendChild(mk('span',null,(t.amount>0?'+':'')+fmt(t.amount)+' · '+t.account+' · '+econFmtTimeP58(t.time)));b.appendChild(r);});
}
addPhoneAppP58('Factures','🧾','#e9bd66,#775022',billsAppP58);
/* Phone status bar, controls mobiles et raccourcis. */
function phoneStatusP58(){const time=$('#ph-time');if(time)time.textContent=$('#clock').textContent;const net=$('#ph-net');if(net)net.textContent=blackout>0?'🚫 Pas de réseau':'▂▄▆ 4G';}
const PHONE_KEY_P58='port-aurore-phone-v1';
try{const p=JSON.parse(localStorage.getItem(PHONE_KEY_P58)||'null');if(p&&typeof p==='object'){Object.assign(threads,p.threads||{});Object.assign(unread,p.unread||{});wallN=clamp(+p.wall||0,0,WALLS.length-1);}}catch(e){}
function savePhoneP58(){try{localStorage.setItem(PHONE_KEY_P58,JSON.stringify({threads,unread,wall:wallN}));}catch(e){}}
function resetPhoneP58(){Object.keys(threads).forEach(k=>delete threads[k]);Object.keys(unread).forEach(k=>delete unread[k]);wallN=0;try{localStorage.removeItem(PHONE_KEY_P58);}catch(e){}if(typeof applyWall==='function')applyWall();}
const _sendMsgP58=sendMsg;sendMsg=function(...args){_sendMsgP58(...args);savePhoneP58();setTimeout(savePhoneP58,1700);};
const _incomingP58=incoming;incoming=function(...args){_incomingP58(...args);savePhoneP58();};
const _applyWallP58=applyWall;applyWall=function(){_applyWallP58();savePhoneP58();};
const _phThreadP58=phThread;phThread=function(n){_phThreadP58(n);savePhoneP58();};
const _updateHudP58=updateHud;updateHud=function(){_updateHudP58();if(!$('#phone').hidden)phoneStatusP58();};
const _phHomeP58=phHome;phHome=function(){_phHomeP58();const b=$('#ph-body');if(!b)return;const top=mk('div','phone-welcome');top.appendChild(mk('small',null,econFmtTimeP58(gameMin)));top.appendChild(mk('b',null,state.name));top.appendChild(mk('span',null,'Cash '+fmt(state.cash)+' · Banque '+fmt(state.bank)));b.prepend(top);};
const _setupInputP58=setupInput;setupInput=function(){_setupInputP58();const map=$('#b-map'),phone=$('#b-phone');if(map)map.onclick=()=>openBigMap();if(phone)phone.onclick=togglePhone;};
/* Le téléphone tactile est un vrai raccourci, sans action automatique au chargement. */
