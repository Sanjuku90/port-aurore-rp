'use strict';
/* v49 · AURORE OS · les 10 applis Aurore, toutes reliées au gameplay */
(function(){
if(!window.PH49)return;
const X=PH49,P=X.P,UI=X.UI,save=X.save,day=X.day;
const re=()=>{if(typeof phApp!=='undefined'&&phApp)phOpen(phApp);};
const M=()=>X.MET(),A=()=>X.AMS();
P.life.bk=P.life.bk||[];P.home.dev=P.home.dev||{};P.home.ten=P.home.ten||{};P.bank.loan=P.bank.loan||null;P.auto.ins=P.auto.ins||{};P.auto.ct=P.auto.ct||{};
const rel=n=>(window.P3&&P3.rel&&P3.rel[n])||20,bump=(n,v)=>{if(window.P3&&P3.rel)P3.rel[n]=Math.max(0,Math.min(100,rel(n)+v));};
const LN=['Mensah','Diallo','Koffi','Traoré','Laurent','Adjovi','Moreau','Sow'];
const npc=i=>((typeof NAMES!=='undefined'&&NAMES[i%NAMES.length])||'Awa')+' '+LN[i%LN.length];
const nearSpot=re_=>{let b=null,bd=1e9;spots.forEach(s=>{if(re_.test(s.id)){const d=Math.hypot(s.x-player.x,s.z-player.z);if(d<bd){bd=d;b=s;}}});return b;};
const lost=()=>P.bank.net.due>0&&P.bank.net.since&&day()-P.bank.net.since>=3;
function netGate(b){if(!lost())return false;UI.empty(b,'Forfait Aurore Mobile suspendu','Règle ta facture Internet dans Aurore Bank pour retrouver le réseau.');UI.btn(b,'Ouvrir Aurore Bank',()=>X.openApp('Aurore Bank','pay'),true);return true;}
/* ---------- réservations : on paie, on se déplace, l'effet s'applique sur place ---------- */
const FX={table:()=>{state.hunger=Math.min(100,state.hunger+55);state.fun=Math.min(100,state.fun+10);},
  med:()=>{state.health=100;},ct:d=>{P.auto.ct[d.car]=day()+30;},admin:d=>{P.life.docs.push({n:d.doc,at:day()});},
  event:()=>{state.fun=Math.min(100,state.fun+30);state.rep+=1;},spa:()=>{state.energy=Math.min(100,state.energy+35);state.fun=Math.min(100,state.fun+15);},
  meet:()=>{const B=M()&&M().S.biz;if(B){B.cash=(B.cash||0)+300+B.level*400;M().save();}state.rep+=1;}};
function book(k,label,pl,at,cost,data){if(!pl)return toast('Lieu introuvable.','warn');if(cost&&!X.pay(cost,label))return;
  P.life.bk.push({id:P.seq++,k,l:label,p:pl.n,x:pl.x,z:pl.z,at,data:data||{},done:false});save();X.go(pl.x,pl.z,label,true);
  toast(label+' · réservé pour '+X.hhmm(at)+'. Rends-toi à '+pl.n+'.','good');}
/* ---------- icônes ---------- */
const S='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
const IC={'Aurore Social':['linear-gradient(160deg,#ff7a59,#d6249f 60%,#5b2bd6)',S+'<path d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z"/></svg>'],
 'Aurore Bank':['linear-gradient(160deg,#1e4fd8,#0a1a52)',S+'<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10h18M7 15h4"/></svg>'],
 'Aurore GPS':['linear-gradient(160deg,#34c759,#0a7d4a)',S+'<path d="M12 3l7 18-7-4-7 4z" fill="#fff"/></svg>'],
 'Aurore Immo':['linear-gradient(160deg,#ffb340,#c2410c)',S+'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>'],
 'Aurore Jobs':['linear-gradient(160deg,#a2794b,#4a2f14)',S+'<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5h6v2M3 12h18"/></svg>'],
 'Aurore Auto':['linear-gradient(160deg,#c8102e,#4a0610)',S+'<path d="M5 12l1.8-5h10.4L19 12"/><rect x="3" y="12" width="18" height="5" rx="1.5"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>'],
 'Aurore Market':['linear-gradient(160deg,#06c167,#035c33)',S+'<path d="M5.5 8h13l-1.2 12.5H6.7z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>'],
 'Aurore Services':['linear-gradient(160deg,#ff3b30,#8a0f2f)',S+'<circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/></svg>'],
 'Aurore Travel':['linear-gradient(160deg,#36c7d9,#0f5fa8)',S+'<path d="M2.5 13.5l19-6-3 4-7 1.5-2 5-2-.5 1-4.5-5 1z"/></svg>'],
 'Aurore Life':['linear-gradient(160deg,#ffd23f,#ff7a59 60%,#8a2be2)',S+'<path d="M12 3l2.3 5.6L20 9.3l-4.4 3.8L17 19l-5-3-5 3 1.4-5.9L4 9.3l5.7-.7z"/></svg>']};
Object.keys(IC).forEach(n=>{ICO25[n]=IC[n];if(typeof TINT25!=='undefined'){const c=IC[n][0].match(/#[0-9a-f]{6}/gi);TINT25[n]=[c[0],c[c.length-1]];}});
const reg=(n,fn)=>{RENDER25[n]={fn:b=>{const k=Object.keys(X.APPN).find(q=>X.APPN[q]===n);if(k)X.clearBadge(k);fn(b);}};if(!app25(n))APPS.push([n,'•','#333,#111',RENDER25[n].fn]);};
/* ================= 01 AURORE SOCIAL ================= */
reg('Aurore Social',b=>{if(netGate(b))return;const t=UI.tabs(b,'social',[['feed','Fil'],['story','Stories'],['friends','Amis'],['groups','Groupes'],['me','Profil']]);const So=P.social;
 if(t==='feed'){const f=UI.field(b,'Quoi de neuf à Port-Aurore ?','',null,true);
  UI.btn(b,'Publier'+(gallery.length?' (+ dernière photo)':''),()=>{const v=f.value.trim();if(!v&&!gallery.length)return;So.posts.unshift({id:P.seq++,me:1,who:state.name,t:v||'📷',img:gallery.length?gallery[gallery.length-1]:null,at:Math.floor(gameMin),likes:0,com:[]});P.life.stats.posts++;save();toast('Publié sur Aurore Social.','good');re();},true);
  if(!So.posts.length)UI.empty(b,'Fil vide','Publie ou attends les posts de la ville.');
  So.posts.slice(0,25).forEach(p=>{const g=UI.grp(b);UI.row(g,{lead:av25(p.who),title:p.who,sub:p.t+' · '+X.when(p.at),wrap:true,right:'♥ '+p.likes});
   if(p.img){const im=document.createElement('img');im.src=p.img;im.className='img49';g.appendChild(im);}
   (p.com||[]).slice(-2).forEach(c=>UI.row(g,{title:c.w,sub:c.t,wrap:true}));
   if(!p.me){UI.row(g,{title:p.liked?'♥ Aimé':'♡ J’aime',onClick:()=>{if(p.liked)return;p.liked=1;p.likes++;bump(p.who,1);save();re();},noChev:true});
    UI.row(g,{title:'💬 Commenter',onClick:()=>{p.com.push({w:state.name,t:pick(['Trop bien !','J’adore 🔥','On y va quand ?','Magnifique 😍'])});bump(p.who,2);save();re();},noChev:true});
    if(p.x!=null)UI.row(g,{title:'📍 Y aller · '+p.pl,onClick:()=>X.go(p.x,p.z,p.pl)});}});}
 else if(t==='story'){UI.btn(b,'Partager une story'+(gallery.length?' (dernière photo)':''),()=>{So.stories.unshift({id:P.seq++,who:state.name,t:pick(['Belle journée ☀️','En ville 🏙️','Vibes 🌴']),img:gallery[gallery.length-1]||null,at:Math.floor(gameMin)});save();re();},true);
  So.stories=So.stories.filter(s=>gameMin-s.at<1440);const g=UI.grp(b);if(!So.stories.length)UI.empty(b,'Aucune story','Les stories disparaissent après 24 h de jeu.');
  So.stories.forEach(s=>UI.row(g,{lead:av25(s.who),title:s.who+(So.seenStory[s.id]?'':' · nouveau'),sub:s.t+' · '+X.when(s.at),onClick:()=>{So.seenStory[s.id]=1;bump(s.who,1);save();toast('Story de '+s.who+' : '+s.t);re();}}));}
 else if(t==='friends'){const fr=state.friends||[];if(!fr.length)UI.empty(b,'Aucun ami','Parle aux habitants (E) pour te faire des amis.');
  fr.forEach(n=>{const g=UI.grp(b),on=(n.length+Math.floor(gameMin/60))%3!==0,bl=So.blocked[n];
   UI.row(g,{lead:av25(n),title:n,sub:(bl?'Bloqué':on?'🟢 En ligne':'⚪ Hors ligne')+' · relation '+Math.round(rel(n))+'/100',right:So.follow[n]?'Suivi':''});
   UI.chips(g,[['Message',()=>{X.openApp('Messages');setTimeout(()=>{unread[n]=0;phThread(n);},120);}],['Appeler',()=>X.incomingCall&&X.world(()=>{P.life.stats.calls++;bump(n,4);state.fun=Math.min(100,state.fun+6);toast('Appel avec '+n+' · +humeur','good');})],
    ['Vidéo',()=>{bump(n,6);state.fun=Math.min(100,state.fun+10);P.life.stats.calls++;save();toast('📹 Appel vidéo avec '+n+'. +relation','good');}],
    ['📍 Position',()=>{if(So.share&&So.share[n]===day())return toast('Déjà partagée aujourd’hui.');So.share=So.share||{};So.share[n]=day();(threads[n]=threads[n]||[]).push({me:1,t:'📍 Je suis ici, rejoins-moi !'});if(Math.random()<.5+rel(n)/200){X.addAppt(n,{n:'ta position',x:player.x,z:player.z},Math.floor(gameMin)+30);toast(n+' arrive !','good');}save();}],
    ['Localiser',()=>{if(rel(n)<40)return toast(n+' ne partage pas sa position (relation < 40).','warn');const pl=X.places().filter(p=>X.catOf(p)==='loisirs'||X.catOf(p)==='resto');const p=pl[(n.length*7+Math.floor(gameMin/120))%pl.length];if(!p)return;X.addAppt(n,p,Math.floor(gameMin)+60);X.go(p.x,p.z,n+' · '+p.n);}],
    [So.follow[n]?'Ne plus suivre':'Suivre',()=>{So.follow[n]=!So.follow[n];save();re();}],[bl?'Débloquer':'Bloquer',()=>{So.blocked[n]=!bl;save();re();}]]);});}
 else if(t==='groups'){const B=M()&&M().S.biz;if(B){const g=UI.grp(b);UI.row(g,{lead:UI.sq('#1d4f8a','💼'),title:'Chat pro · '+B.name,sub:B.staff+' collaborateurs · briefing quotidien = +revenus',onClick:()=>{if(P.jobs.brief===day())return toast('Briefing déjà fait aujourd’hui.');P.jobs.brief=day();save();toast('Briefing envoyé à l’équipe : bonus de trésorerie demain.','good');}});}
  const f=UI.field(b,'Nom du nouveau groupe');UI.btn(b,'Créer un groupe avec mes amis',()=>{const m=(state.friends||[]).slice(0,5);if(!m.length)return toast('Il faut des amis.','warn');So.groups.push({id:P.seq++,n:f.value.trim()||'Groupe '+(So.groups.length+1),m,msgs:[]});save();re();});
  So.groups.forEach(gr=>{const g=UI.grp(b);UI.row(g,{lead:UI.sq('#5856d6','👥'),title:gr.n,sub:gr.m.join(', ')+(gr.msgs.length?' · « '+gr.msgs[gr.msgs.length-1].t+' »':''),wrap:true});
   UI.chips(g,[['Proposer une sortie',()=>{const p=X.nearest('loisirs')||X.nearest('resto');if(!p)return;gr.msgs.push({w:state.name,t:'Sortie à '+p.n+' ?'});gr.msgs.push({w:gr.m[0],t:'Grave, j’arrive !'});X.addAppt(gr.m[0],p,Math.floor(gameMin)+90);gr.m.forEach(n=>bump(n,2));save();X.go(p.x,p.z,'Sortie · '+p.n,true);re();}],['Saluer',()=>{gr.msgs.push({w:state.name,t:'Salut tout le monde 👋'});gr.msgs.push({w:pick(gr.m),t:pick(['Yo !','Salut 😄','Ça dit quoi ?'])});save();re();}]]);});
  UI.sec(b,'Messages anonymes');const g2=UI.grp(b);if(!So.anon.length)UI.row(g2,{title:'Aucun message anonyme',sub:'Les bons plans anonymes donnent une récompense sur place.'});
  So.anon.slice(0,8).forEach(a=>UI.row(g2,{lead:UI.sq('#333','🕶️'),title:a.done?'✓ Récupéré':'Bon plan · '+fmt(a.r),sub:a.t,wrap:true,onClick:a.done||a.x==null?null:()=>X.go(a.x,a.z,'Bon plan anonyme')}));}
 else{const c=UI.hero(b,'Profil public',state.name,So.bio);c.prepend(av25(state.name));
  UI.chips(b,[['🟢 En ligne',()=>{So.status='online';save();re();},So.status==='online'],['⛔ Occupé',()=>{So.status='busy';save();re();},So.status==='busy'],['👻 Invisible',()=>{So.status='invisible';save();re();},So.status==='invisible']]);
  const f=UI.field(b,'Biographie',So.bio,v=>{So.bio=v.slice(0,120);save();toast('Bio mise à jour.','good');});UI.btn(b,'Enregistrer la bio',()=>{So.bio=f.value.slice(0,120);save();re();});
  const g=UI.grp(b);UI.row(g,{title:'Publications',right:String(So.posts.filter(p=>p.me).length)});UI.row(g,{title:'Abonnés',right:String(So.followers)});UI.row(g,{title:'Réputation',right:RANKS[rankOf()]+' · '+state.rep});
  UI.note(b,'Statut « Occupé » : les appels sont refusés automatiquement avec un message.');}});
/* ================= 02 AURORE BANK ================= */
reg('Aurore Bank',b=>{const t=UI.tabs(b,'bank',[['acc','Comptes'],['pay','Factures'],['send','Virements'],['save','Épargne'],['loan','Crédit'],['auc','Crypto']]);const B=P.bank;
 if(t==='acc'){const st=M()?M().stocks():null,stv=st?M().STOCKS.reduce((a,[k])=>a+(st.h[k]||0)*st.p[k],0):0;
  UI.hero(b,'Patrimoine total',fmt(Math.round(state.cash+state.bank+B.save+B.auc*B.aucP+stv)),'Banque '+fmt(state.bank)+' · Cash '+fmt(state.cash)+' · Épargne '+fmt(B.save));
  if(!B.card.n)B.card.n='4970 '+String(1000+Math.floor(Math.random()*9000))+' •••• '+String(1000+Math.floor(Math.random()*9000));
  const g=UI.grp(b);UI.row(g,{lead:UI.sq('#1e4fd8','💳'),title:'Carte virtuelle Aurore',sub:B.card.n+(B.card.frozen?' · GELÉE':' · active'),right:B.card.frozen?'Dégeler':'Geler',onClick:()=>{B.card.frozen=!B.card.frozen;save();re();}});
  const atm=nearSpot(/bank|atm/);const near=atm&&Math.hypot(atm.x-player.x,atm.z-player.z)<30;
  UI.row(g,{lead:UI.sq('#0a7d4a','🏧'),title:near?'Distributeur à proximité':'Distributeur le plus proche',sub:near?'Retrait / dépôt disponibles':(atm?atm.label+' · '+X.fm(Math.hypot(atm.x-player.x,atm.z-player.z)):''),onClick:near?null:()=>atm&&X.go(atm.x,atm.z,atm.label)});
  if(near)UI.chips(b,[['Retirer 50',()=>{if(state.bank<50)return;state.bank-=50;state.cash+=50;X.log('Retrait DAB',-50,'Banque');re();}],['Retirer 200',()=>{if(state.bank<200)return;state.bank-=200;state.cash+=200;X.log('Retrait DAB',-200,'Banque');re();}],['Déposer tout le cash',()=>{const c=state.cash;state.bank+=c;state.cash=0;X.log('Dépôt DAB',c,'Banque');re();}]]);
  const L=(walletP58.ledger||[]).slice().sort((a,c)=>c.time-a.time),wk=L.filter(l=>l.time>gameMin-7*1440),out=wk.filter(l=>l.amount<0).reduce((a,l)=>a-l.amount,0),inn=wk.filter(l=>l.amount>0).reduce((a,l)=>a+l.amount,0);
  UI.sec(b,'7 derniers jours · dépenses '+fmt(out)+' · revenus '+fmt(inn));UI.note(b,'Salaire : '+(state.job?fmt(ECON.salary[state.job]||0)+' / jour ('+JOBN[state.job]+')':'sans emploi'));
  const g2=UI.grp(b);L.slice(0,20).forEach(l=>UI.row(g2,{title:l.label,sub:l.account+' · '+X.when(l.time),right:(l.amount>0?'+':'')+fmt(l.amount),rcls:l.amount>0?'pos':''}));if(!L.length)UI.row(g2,{title:'Aucune opération'});}
 else if(t==='pay'){const due=walletP58.unpaidRent+walletP58.unpaidUtilities;const g=UI.grp(b);
  UI.row(g,{lead:UI.sq('#c2410c','🏠'),title:'Loyer, eau et électricité',sub:due?'Impayé':'À jour',right:fmt(due),onClick:due?()=>{if(!X.pay(due,'Loyer et charges'))return;walletP58.unpaidRent=0;walletP58.unpaidUtilities=0;saveEconomyP58();re();}:null});
  UI.row(g,{lead:UI.sq('#5856d6','📶'),title:'Internet · Aurore Mobile 5G',sub:B.net.due?'25 $ / semaine · coupure après 3 jours':'À jour',right:fmt(B.net.due),onClick:B.net.due?()=>{if(!X.pay(B.net.due,'Forfait Aurore Mobile'))return;B.net.due=0;B.net.since=0;save();re();}:null});
  UI.row(g,{lead:UI.sq('#333','🏛️'),title:'Impôts · 8 % des revenus hebdo',sub:'Calculés chaque semaine de jeu',right:fmt(B.tax.due),onClick:B.tax.due?()=>{if(!X.pay(B.tax.due,'Impôts'))return;B.tax.due=0;state.rep+=1;save();re();}:null});
  [['home','Assurance habitation','Indemnise les cambriolages',15],['health','Assurance santé','Ambulance gratuite, consultations à 10 $',12]].forEach(([k,n,s,p])=>UI.row(g,{lead:UI.sq('#0a7d4a','🛡️'),title:n,sub:s+' · '+fmt(p)+'/sem.',right:B.ins[k]?'✓ Active':'Souscrire',onClick:()=>{if(B.ins[k]){B.ins[k]=0;}else{if(!X.pay(p,n))return;B.ins[k]=day();}save();re();}}));
  let jf=[];try{jf=(JSON.parse(localStorage.getItem('port-aurore-justice-v1')||'{}').fines)||[];}catch(e){}
  UI.row(g,{lead:UI.sq('#8a0f2f','🚔'),title:'Amendes',sub:jf.length?jf.length+' contravention(s) · réglables au commissariat':'Aucune amende',right:fmt(jf.reduce((a,f)=>a+f.a,0)),onClick:jf.length?()=>{const a=app25('Justice');if(a)phOpen(a);}:null});
  UI.sec(b,'Payer par QR code');UI.btn(b,'📷 Scanner le QR du commerce le plus proche',()=>{const s=nearSpot(/shop|fuel|club|pharma|coiffeur|resto|market|cafe|df|bar/);if(!s||Math.hypot(s.x-player.x,s.z-player.z)>30)return toast('Aucun QR commerçant à moins de 30 m.','warn');X.world(()=>openSpot(s.id));});}
 else if(t==='send'){const fr=state.friends||[];if(!fr.length)UI.empty(b,'Aucun bénéficiaire','Fais-toi des amis pour leur envoyer de l’argent.');
  fr.forEach(n=>{const g=UI.grp(b);UI.row(g,{lead:av25(n),title:n,sub:'Relation '+Math.round(rel(n))});UI.chips(g,[10,50,200].map(a=>['Envoyer '+fmt(a),()=>{if(state.bank<a)return toast('Solde bancaire insuffisant.','warn');state.bank-=a;X.log('Virement à '+n,-a,'Banque');bump(n,Math.min(15,a/10));P.life.stats.transfers++;(threads[n]=threads[n]||[]).push({t:'Merci pour les '+fmt(a)+' 🙏'});unread[n]=(unread[n]||0)+1;save();toast('Virement envoyé à '+n+'.','good');re();}]).concat([['Demander',()=>{B.ask=B.ask||{};if(B.ask[n]===day())return toast('Déjà demandé aujourd’hui.');B.ask[n]=day();if(rel(n)>=50){const a=pick([20,40,80]);X.earn(a,'Virement reçu de '+n);bump(n,-5);X.notify({app:'bank',title:'Virement reçu · '+fmt(a),text:n+' t’a envoyé de l’argent.'});}else toast(n+' refuse (relation trop faible).','warn');save();}]]));});
  (B.debts||[]).forEach(d=>UI.note(b,d.n+' te doit '+fmt(d.a)+' (jour '+(d.due+1)+')'));}
 else if(t==='save'){UI.hero(b,'Livret Aurore · 0,5 %/jour',fmt(Math.round(B.save)),'Intérêts versés chaque jour de jeu');
  UI.chips(b,[[100,'+100'],[1000,'+1 000']].map(([a,l])=>[l,()=>{if(state.bank<a)return toast('Solde insuffisant.','warn');state.bank-=a;B.save+=a;X.log('Virement vers épargne',-a,'Banque');save();re();}]).concat([['Tout retirer',()=>{state.bank+=Math.round(B.save);X.log('Retrait épargne',Math.round(B.save),'Banque');B.save=0;save();re();}]]));}
 else if(t==='loan'){const lim=Math.round(300+(ECON.salary[state.job]||0)*12+rankOf()*800+(M()?Object.keys(M().S.own).length*2000:0));const L=B.loan;
  if(L){UI.hero(b,'Crédit en cours',fmt(L.left),'Mensualité auto : '+fmt(L.inst)+' / jour · retards '+(L.late||0));UI.btn(b,'Rembourser tout · '+fmt(L.left),()=>{if(!X.pay(L.left,'Remboursement anticipé'))return;B.loan=null;state.rep+=1;save();re();},true);}
  else{UI.hero(b,'Capacité d’emprunt',fmt(lim),'Frais 10 % · remboursé 10 %/jour');[250,1000,5000,lim].filter((v,i,a)=>v<=lim&&a.indexOf(v)===i).forEach(a=>UI.btn(b,'Emprunter '+fmt(a),()=>{B.loan={a,left:Math.round(a*1.1),inst:Math.ceil(a*0.11),late:0};X.earn(a,'Prêt Aurore Bank');save();re();}));}}
 else{if(!B.aucH||B.aucH.length<2)B.aucH=[42,42];const v=B.auc*B.aucP;UI.hero(b,'Aurore Coin (AUC)',fmt(B.aucP),'Portefeuille : '+B.auc+' AUC · '+fmt(Math.round(v)));b.appendChild(UI.spark(B.aucH,300,60,'#ffd23f'));
  UI.chips(b,[[1,'Acheter 1'],[10,'Acheter 10']].map(([q,l])=>[l,()=>{if(!X.pay(q*B.aucP,'Achat AUC'))return;B.auc+=q;save();re();}]).concat([['Tout vendre',()=>{if(!B.auc)return;X.earn(Math.round(B.auc*B.aucP),'Vente AUC');B.auc=0;save();re();}]]));UI.note(b,'Cours mis à jour chaque heure de jeu. Monnaie fictive, volatile.');}});
/* ================= 03 AURORE GPS ================= */
reg('Aurore GPS',b=>{const cat=P.tab.gpscat||'';const q=P.tab.gpsq||'';
 if(wp)UI.hero(b,'Itinéraire actif',wp.l,X.fm(Math.hypot(wp.x-player.x,wp.z-player.z))+' · guidage vocal '+(P.set.voice?'activé':'coupé'));
 if(wp)UI.chips(b,[['Arrêter',()=>{wp=null;re();}],[P.set.voice?'🔇 Voix':'🔊 Voix',()=>{P.set.voice=!P.set.voice;save();re();}],['Grande carte',()=>X.world(()=>openBigMap())]]);
 const sug=[];if(state.hunger<40)sug.push(['🍔 Tu as faim',X.nearest('resto')]);if(state.health<50)sug.push(['🏥 Santé basse',X.nearest('sante')]);if(state.energy<30)sug.push(['🏨 Fatigue',X.nearest('hotel')]);
 if(player.car&&player.car.fuel<25)sug.push(['⛽ Réservoir bas',X.nearest('fuel')]);if(state.cash<20)sug.push(['🏧 Peu de cash',X.nearest('bank')]);
 if(sug.length){UI.sec(b,'Suggestions intelligentes');const g=UI.grp(b);sug.forEach(([l,p])=>p&&UI.row(g,{title:l,sub:p.n+' · '+X.fm(X.dist(p)),onClick:()=>X.go(p.x,p.z,p.n)}));}
 const f=UI.field(b,'Rechercher une destination',q,v=>{P.tab.gpsq=v;re();});f.addEventListener('input',()=>{P.tab.gpsq=f.value;clearTimeout(f._t);f._t=setTimeout(re,500);});
 UI.chips(b,[['Tout',()=>{P.tab.gpscat='';re();},!cat]].concat(X.CATS.map(c=>[c[1],()=>{P.tab.gpscat=c[0];re();},cat===c[0]])));
 const n=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const L=X.places().filter(p=>(!cat||X.catOf(p)===cat)&&(!q||n(p.n).includes(n(q)))).sort((a,c)=>X.dist(a)-X.dist(c)).slice(0,30);
 const g=UI.grp(b);L.forEach(p=>{const d=X.dist(p);UI.row(g,{title:p.n,sub:X.fm(d)+' · ≈ '+Math.max(1,Math.round(d/(player.car?14:1.6)/60*2))+' min '+(player.car?'en voiture':'à pied'),onClick:()=>X.go(p.x,p.z,p.n)});});
 UI.sec(b,'Ma voiture');const g2=UI.grp(b);const own=cars.filter(c=>c.owned||c.am);if(!own.length)UI.row(g2,{title:'Aucun véhicule garé'});own.slice(0,4).forEach(c=>UI.row(g2,{lead:UI.sq('#c8102e','🚗'),title:(c.am&&A()?(A().cars.find(r=>r.id===c.am)||{}).n:null)||'Mon véhicule',sub:X.fm(Math.hypot(c.x-player.x,c.z-player.z)),onClick:()=>X.go(c.x,c.z,'Ma voiture')}));
 UI.sec(b,'Trafic en direct');const g3=UI.grp(b);(M()?M().districts:[]).slice(0,8).forEach(d=>{const k=cars.filter(c=>Math.abs(c.x-d.cx)<d.r&&Math.abs(c.z-d.cz)<d.r).length;UI.row(g3,{title:d.name,sub:k+' véhicules',right:k>8?'🔴 Dense':k>3?'🟠 Modéré':'🟢 Fluide'});});
 UI.sec(b,'Historique des trajets');const g4=UI.grp(b);if(!P.travel.trips.length)UI.row(g4,{title:'Aucun trajet'});P.travel.trips.slice(0,8).forEach(t=>UI.row(g4,{title:t.l,sub:t.k+' · '+X.when(t.at)+(t.min?' · '+t.min+' min':'')}));});
/* ================= 04 AURORE IMMO ================= */
function props(){const out=[];if(walletP58.homeOwned||walletP58.lease){const s=spots.find(x=>x.id==='home');out.push({k:'base',n:'Appartement Aurore',x:s?s.x:0,z:s?s.z:0,own:walletP58.homeOwned});}
 const m=M();if(m){Object.keys(m.S.own).concat(Object.keys(m.S.rent).filter(k=>m.S.rent[k]>gameMin)).forEach(k=>{const [bk,u]=k.split('#'),bd=m.byKey.get(bk);if(bd&&!out.some(o=>o.k===k))out.push({k,n:(m.UNITS[u]||{}).n+' · '+bd.name,x:bd.door.x,z:bd.door.z,own:!!m.S.own[k],u,b:bd});});}return out;}
reg('Aurore Immo',b=>{const t=UI.tabs(b,'immo',[['ads','Annonces'],['mine','Mes biens'],['smart','Maison connectée'],['svc','Services']]);const m=M();
 if(t==='ads'){const g=UI.grp(b);UI.row(g,{lead:UI.sq('#c2410c','🏠'),title:'Appartement Aurore · logement de base',sub:'Bail simple, loyer quotidien',onClick:()=>X.world(()=>openSpot('home'))});
  (m?m.blds.filter(x=>x.units):[]).forEach(bd=>{const U=bd.units.map(u=>m.UNITS[u]);UI.row(g,{lead:UI.sq('#8a2be2',bd.emoji||'🏢'),title:bd.name,sub:U.map(u=>u.n).join(', ')+' · dès '+fmt(Math.round(Math.min(...U.map(u=>u.buy))*m.mult(bd)))+' · '+X.fm(X.dist({x:bd.door.x,z:bd.door.z})),wrap:true,onClick:()=>X.world(()=>m.realty(bd,bd.units))});});
  UI.note(b,'Achat et location à distance : le bien est à toi immédiatement, les charges sont prélevées chaque jour.');}
 else if(t==='mine'){const L=props();if(!L.length)UI.empty(b,'Aucun bien','Achète ou loue dans l’onglet Annonces.');
  L.forEach(p=>{const g=UI.grp(b),tn=P.home.ten[p.k];UI.row(g,{title:p.n,sub:(p.own?'Propriétaire':'Locataire')+(tn?' · loué à '+tn.n+' '+fmt(tn.r)+'/jour':''),wrap:true,onClick:()=>X.go(p.x,p.z,p.n)});
   const ch=[['Itinéraire',()=>X.go(p.x,p.z,p.n)]];if(p.own&&p.u){const r=Math.round(m.UNITS[p.u].rent*m.mult(p.b)*.7);ch.push([tn?'Récupérer le bien':'Mettre en location · '+fmt(r)+'/j',()=>{if(tn)delete P.home.ten[p.k];else P.home.ten[p.k]={n:npc(P.seq++),r};save();re();}]);
    ch.push(['Clés : partager',()=>{const f=(state.friends||[])[0];if(!f)return toast('Aucun ami.','warn');P.home.keys=P.home.keys||{};P.home.keys[p.k]=f;bump(f,5);save();toast('Double des clés confié à '+f+'.','good');}]);}
   UI.chips(g,ch);});}
 else if(t==='smart'){const L=props();if(!L.length)UI.empty(b,'Aucun logement connecté');
  L.forEach(p=>{const d=P.home.dev[p.k]=P.home.dev[p.k]||{light:false,ac:false,temp:24,alarm:false,gate:false};const g=UI.grp(b);UI.row(g,{title:p.n,sub:'💡 '+(d.light?'allumé':'éteint')+' · ❄️ '+(d.ac?d.temp+' °C':'off')+' · 🚨 '+(d.alarm?'armée':'désarmée')+' · 🚪 portail '+(d.gate?'ouvert':'fermé'),wrap:true});
   const tg=k=>()=>{d[k]=!d[k];save();re();};UI.chips(g,[['💡 Lumières',tg('light'),d.light],['❄️ Clim',tg('ac'),d.ac],['−',()=>{d.temp=Math.max(17,d.temp-1);save();re();}],['+',()=>{d.temp=Math.min(30,d.temp+1);save();re();}],['🚨 Alarme',tg('alarm'),d.alarm],['🚪 Portail',tg('gate'),d.gate],['📹 Caméras',()=>toast((P.home.log&&P.home.log[p.k])||'Caméras · RAS, aucune activité suspecte.')]]);});
  UI.note(b,'Lumières et clim augmentent la facture d’énergie. Sans alarme, risque de cambriolage quand tu es loin.');}
 else{const g=UI.grp(b);[['🛋️','Décoration · commander des meubles',()=>{const a=app25('Mobilier');if(a)phOpen(a);}],['🔨','Travaux · rénovation (+15 % loyers)',()=>{const p=props().find(x=>x.own&&x.u);if(!p)return toast('Il faut un bien en propriété.','warn');if(!X.pay(1500,'Rénovation'))return;const tn=P.home.ten[p.k];if(tn)tn.r=Math.round(tn.r*1.15);save();toast('Travaux terminés : '+p.n,'good');}],
  ['🌿','Jardinage & piscine · entretien 60 $',()=>{if(!X.pay(60,'Entretien jardin/piscine'))return;state.fun=Math.min(100,state.fun+8);toast('Jardin et piscine entretenus.','good');}],
  ['🧹','Personnel de maison · ménage 35 $',()=>{if(!X.pay(35,'Ménage'))return;state.fun=Math.min(100,state.fun+10);state.energy=Math.min(100,state.energy+10);toast('Logement nettoyé. +humeur +énergie','good');}],
  ['🛎️','Conciergerie · courses livrées 25 $',()=>{if(!X.pay(25,'Conciergerie'))return;P3.inv.groc=(P3.inv.groc||0)+1;toast('Courses ajoutées à ton sac.','good');}],['📑','Contrats et logement (bail)',()=>X.world(()=>openSpot('life41:housing'))]].forEach(([e,l,f])=>UI.row(g,{lead:UI.sq('#c2410c',e),title:l,onClick:f}));}});
/* ================= 05 AURORE JOBS ================= */
function hire(j){if(j.lic&&!(state.license&&state.license[j.lic]))return 'Permis requis : '+VEHICLE_LICENSE[j.lic];if(rankOf()<j.rk)return 'Rang '+(j.rk+1)+' requis';
 state.job=j.id;mission=null;beam.visible=false;missionCd=2;JOBS12.spawnCo(j);saveProgress();return null;}
reg('Aurore Jobs',b=>{const t=UI.tabs(b,'jobs',[['offers','Offres'],['me','Mon emploi'],['biz','Business'],['cv','CV']]);const J=P.jobs;
 if(t==='offers'){const g=UI.grp(b);Object.values(JOBS12.J).forEach(j=>{const ap=J.apps.find(a=>a.id===j.id&&a.st==='wait');const lk=j.lic&&!(state.license&&state.license[j.lic])?VEHICLE_LICENSE[j.lic]:rankOf()<j.rk?'rang '+(j.rk+1):'';
  UI.row(g,{title:j.n+(state.job===j.id?' · ton poste':''),sub:fmt(ECON.salary[j.id])+' / jour'+(lk?' · requis : '+lk:'')+(ap?' · candidature en cours':''),onClick:state.job===j.id||ap?null:()=>{J.apps.push({id:j.id,at:Math.floor(gameMin),st:'wait'});save();toast('Candidature envoyée : réponse sous 30 min de jeu.','good');re();}});});
  UI.btn(b,'Contrats rapides (missions)',()=>X.world(()=>openSpot('life41:contracts')));
  if(M())UI.btn(b,'Mission express Métropole · livraison GPS',()=>{const f=M().blds.find(x=>x.hero)||M().blds[0];X.world(()=>M().mission('livraison',f,null,'Livraison express'));});}
 else if(t==='me'){if(!state.job){UI.empty(b,'Sans emploi','Postule dans l’onglet Offres.');return;}const j=JOBS12.J[state.job];
  UI.hero(b,'Mon emploi',JOBN[state.job],'Salaire '+fmt(ECON.salary[state.job])+' / jour · XP '+JOBS12.xpOf(state.job)+' · missions '+state.done);
  const h=Math.floor((gameMin%1440)/60),shift=h>=8&&h<18;
  UI.btn(b,J.clock?'Pointer la sortie ('+Math.round((gameMin-J.clock.t)/60)+' h)':'Pointer l’arrivée'+(shift?'':' · hors planning 8 h – 18 h'),()=>{if(!J.clock){J.clock={t:Math.floor(gameMin),d:state.done,ok:shift};}else{const hrs=Math.min(10,(gameMin-J.clock.t)/60),ms=state.done-J.clock.d,a=Math.round(hrs*(ECON.salary[state.job]/8)*(J.clock.ok?.3:.1)+ms*5);if(a>0)X.earn(a,'Prime de présence · '+j.n);J.pays.unshift({at:Math.floor(gameMin),h:Math.round(hrs*10)/10,m:ms,a});J.clock=null;toast('Pointage enregistré · prime '+fmt(a),'good');}save();re();},true);
  UI.btn(b,'Demander un congé demain',()=>{if(J.leave>=day())return toast('Congé déjà posé.');J.leave=day()+1;save();toast('Congé accepté pour demain : repos complet.','good');});
  UI.btn(b,'Démissionner',()=>{state.job=null;mission=null;beam.visible=false;JOBS12.fxClear();JOBS12.dropCo();saveProgress();re();});
  UI.sec(b,'Fiches de paie');const g=UI.grp(b);if(!J.pays.length)UI.row(g,{title:'Aucune fiche'});J.pays.slice(0,8).forEach(p=>UI.row(g,{title:fmt(p.a),sub:p.h+' h · '+p.m+' missions · '+X.when(p.at)}));}
 else if(t==='biz'){const Bz=M()&&M().S.biz;if(!Bz){UI.empty(b,'Aucune entreprise','Immatricule ta société pour 2 500 $.');UI.btn(b,'Créer mon entreprise',()=>X.world(()=>M().company(null)),true);return;}
  UI.hero(b,Bz.name,fmt(Bz.cash||0),'Trésorerie · '+Bz.staff+' employés · niveau '+Bz.level);if((Bz.hist||[]).length>1)b.appendChild(UI.spark(Bz.hist,300,50,'#06c167'));
  const g=UI.grp(b);UI.row(g,{title:'Encaisser sur mon compte',onClick:()=>{if(!(Bz.cash>0))return;X.earn(Bz.cash,'Dividendes '+Bz.name);Bz.cash=0;M().save();re();}});
  UI.row(g,{title:'Recruter · 1 500 $',onClick:()=>{if(!X.pay(1500,'Recrutement'))return;Bz.staff++;M().save();re();}});
  UI.row(g,{title:'Publicité 3 jours · 600 $ (+25 % CA)',sub:J.ad>day()?'Campagne active':'',onClick:()=>{if(!X.pay(600,'Publicité'))return;J.ad=day()+3;save();re();}});
  UI.row(g,{title:'Envoyer une facture client · '+fmt(500+Bz.level*800),onClick:()=>{J.invoices.push({c:npc(P.seq++)+' SA',a:500+Bz.level*800,at:Math.floor(gameMin),st:'wait'});save();toast('Facture envoyée.','good');re();}});
  UI.row(g,{title:'Organiser une réunion client',onClick:()=>{const bd=Bz.office?M().byKey.get(Bz.office):M().blds.find(x=>x.cat==='Affaires');if(bd)book('meet','Réunion client',{n:bd.name,x:bd.door.x,z:bd.door.z},Math.floor(gameMin)+60,0);}});
  UI.sec(b,'Factures');const g2=UI.grp(b);J.invoices.slice(-6).reverse().forEach(i=>UI.row(g2,{title:i.c,sub:i.st==='wait'?'En attente':i.st==='paid'?'Payée':'Refusée',right:fmt(i.a)}));}
 else{const c=UI.hero(b,'CV numérique',state.name,(state.job?JOBN[state.job]:'En recherche')+' · '+RANKS[rankOf()]);
  const g=UI.grp(b);UI.row(g,{title:'Permis',sub:Object.keys(state.license||{}).filter(k=>state.license[k]).map(k=>VEHICLE_LICENSE[k]).join(', ')||'Aucun'});UI.row(g,{title:'Diplômes',sub:(M()&&M().S.diplomas.join(', '))||'Aucun'});UI.row(g,{title:'Missions réalisées',right:String(state.done)});
  UI.btn(b,J.cvPub?'✓ CV visible des recruteurs':'Publier mon CV (appels de recruteurs)',()=>{J.cvPub=!J.cvPub;save();re();},!J.cvPub);}});
/* ================= 06 AURORE AUTO ================= */
reg('Aurore Auto',b=>{const t=UI.tabs(b,'auto',[['cars','Mes véhicules'],['care','Entretien'],['buy','Acheter / louer']]);const St=A();
 if(t==='cars'){if(!St||!St.cars.length){UI.empty(b,'Garage vide','Achète un véhicule dans l’onglet Acheter.');return;}
  St.cars.forEach(r=>{const c=AM.carOf(r),g=UI.grp(b),lk=P.auto.lock[r.id];UI.row(g,{lead:UI.sq('#c8102e','🚗'),title:r.n+' · '+r.plate,sub:'⛽ '+Math.round(c?c.fuel:r.fuel)+' % · '+Math.round(r.km)+' km · moteur '+Math.round(r.cond.eng)+' % · '+(r.st==='out'?'garée':r.st),wrap:true});
   UI.chips(g,[[lk?'🔓 Déverrouiller':'🔒 Verrouiller',()=>{P.auto.lock[r.id]=!lk;save();toast(lk?'Véhicule déverrouillé.':'Véhicule verrouillé.','good');re();}],['📍 Localiser',()=>{const p=c?{x:c.x,z:c.z}:r.loc;if(p)X.go(p.x,p.z,r.n);else toast('Véhicule au garage.');}],
    ['🔑 Démarrage à distance',()=>{if(!c)return toast('Le véhicule doit être garé dehors.','warn');P.auto.lock[r.id]=false;save();toast('Moteur démarré à distance, clim en route.','good');}],
    ['🅿️ Voiturier · 30 $',()=>{if(player.car)return toast('Descends de voiture.','warn');if(!X.pay(30,'Voiturier'))return;if(c)AM.despawn(r);AM.spawnRec(r,player.x+4,player.z+3,player.h||0);AM.save();toast('Ton '+r.n+' t’attend à côté.','good');}],
    ['Fiche & SAV',()=>X.world(()=>AM.sav(r.id))]]);});}
 else if(t==='care'){if(!St||!St.cars.length){UI.empty(b,'Aucun véhicule');return;}St.cars.forEach(r=>{const g=UI.grp(b),ct=P.auto.ct[r.id]!=null?P.auto.ct[r.id]:Math.floor(r.date/1440)+14,ins=P.auto.ins[r.id];
  UI.row(g,{title:r.n,sub:'Contrôle technique : '+(ct>day()?'valide jusqu’au jour '+(ct+1):'⚠️ à faire')+' · assurance '+(ins?'tous risques':'aucune'),wrap:true});
  UI.chips(g,[[ins?'Résilier assurance':'Assurer · 10 $/sem.',()=>{if(ins)delete P.auto.ins[r.id];else{if(!X.pay(10,'Assurance auto'))return;P.auto.ins[r.id]=day();}save();re();}],['RDV contrôle technique · 45 $',()=>{const s=spots.find(x=>x.id==='garage')||nearSpot(/garage/);book('ct','Contrôle technique '+r.n,s&&{n:s.label,x:s.x,z:s.z},Math.floor(gameMin)+60,45,{car:r.id});}],
   ['🛻 Dépannage'+(ins?' (gratuit)':' · 120 $'),()=>{if(!ins&&!X.pay(120,'Dépannage'))return;X.world(()=>AM.assist(r));}],['Papiers',()=>X.world(()=>AM.docs(r))]]);});}
 else{const g=UI.grp(b);Object.keys(AM.LINES).forEach(k=>UI.row(g,{lead:UI.sq(AM.LINES[k].c,'🚘'),title:AM.LINES[k].n,sub:AM.LINES[k].s,onClick:()=>X.world(()=>k==='occasion'?AM.occasion('acheter'):AM.catalog(k))}));
  UI.row(g,{lead:UI.sq('#2e9a6a','🏷️'),title:'Vendre mon véhicule · annonce',onClick:()=>X.world(()=>AM.occasion('vendre'))});UI.row(g,{lead:UI.sq('#555','🎨'),title:'Personnalisation & tuning',onClick:()=>X.world(()=>openSpot('garage'))});
  UI.row(g,{lead:UI.sq('#e0a800','🔑'),title:P.auto.rent&&P.auto.rent.until>gameMin?'Location active':'Louer une voiture 24 h · 90 $',sub:'Livrée à côté de toi',onClick:()=>{if(P.auto.rent&&P.auto.rent.until>gameMin)return;if(player.car||!X.pay(90,'Location de voiture'))return;const c=addCar(player.x+4,player.z+3,player.h||0,0xf2f2f0,'parked','sedan');c.kind='parked';c.owned=true;c.rent49=1;P.auto.rent={until:gameMin+1440};save();toast('Voiture de location livrée pour 24 h.','good');}});}});
/* ================= 07 AURORE MARKET ================= */
const CAT=[['🛒 Supermarché',[['water','Eau',3],['soda','Soda',4],['sand','Sandwich',9],['fruit','Fruits frais',6],['jus','Jus de bissap',4],['groc','Courses frigo',18],['riz','Sac de riz',14]]],
 ['💊 Pharmacie',[['pans','Pansements',8],['kit','Kit de soins',25],['meds','Médicaments',15]]],
 ['👕 Vêtements',[['@s:0xd94f4f','Chemise rouge',28],['@s:0x1f6fe0','Polo bleu',28],['@t:veste','Veste',60],['@p:0x2b3445','Jean brut',35]]],['👟 Chaussures',[['@f:0xf2f2ee','Baskets blanches',22],['@f:0x202124','Sneakers noires',22]]],
 ['💎 Bijouterie',[['@n:1','Chaîne dorée',45],['@g:1','Lunettes de soleil',30]]],['🌸 Parfumerie',[['@perf','Parfum Aurore (+relations 24 h)',40]]],['📱 Électronique',[['@pb','Batterie externe (+énergie)',35]]]];
function deliver(o){o.items.forEach(([k,n])=>{if(k[0]!=='@'){if(Object.values(P3.inv).reduce((a,v)=>a+v,0)<12)P3.inv[k]=(P3.inv[k]||0)+1;else state.cash+=0;return;}
 const [f,v]=k.slice(1).split(':');if(f==='perf'){P.market.perf=gameMin+1440;state.fun=Math.min(100,state.fun+8);}else if(f==='pb')state.energy=Math.min(100,state.energy+15);else{look[f]=f==='t'?v:f==='n'||f==='g'?true:parseInt(v);try{scene.remove(player.mesh);player.mesh=makePlayerMesh();scene.add(player.mesh);saveProgress();}catch(e){}}});
 o.done=true;P.market.hist.unshift(o);save();X.notify({app:'market',title:'Colis livré',text:o.items.map(i=>i[1]).join(', ')});}
reg('Aurore Market',b=>{if(netGate(b))return;const t=UI.tabs(b,'market',[['shop','Boutiques'],['cart','Panier ('+P.market.cart.length+')'],['orders','Commandes'],['ads','Annonces']]);const Mk=P.market;
 if(t==='shop'){CAT.forEach(([c,L])=>{UI.sec(b,c);const g=UI.grp(b);L.forEach(it=>UI.row(g,{title:it[1],sub:fmt(it[2]),right:Mk.fav.includes(it[0])?'★':'+',onClick:()=>{Mk.cart.push(it);save();toast(it[1]+' ajouté au panier.');re();}}));});
  UI.btn(b,'🛋️ Mobilier pour la maison',()=>{const a=app25('Mobilier');if(a)phOpen(a);});}
 else if(t==='cart'){const tot=Mk.cart.reduce((a,i)=>a+i[2],0);if(!Mk.cart.length){UI.empty(b,'Panier vide');return;}const g=UI.grp(b);Mk.cart.forEach((i,k)=>UI.row(g,{title:i[1],right:fmt(i[2]),onClick:()=>{Mk.cart.splice(k,1);save();re();}}));
  UI.note(b,'Touche un article pour le retirer.');[['Livraison standard · 30 min',0,30],['Express · 10 min · +8 $',8,10]].forEach(([l,x,eta])=>UI.btn(b,l+' · total '+fmt(tot+x),()=>{if(!X.pay(tot+x,'Aurore Market'))return;Mk.orders.push({id:P.seq++,items:Mk.cart.slice(),at:Math.floor(gameMin),eta:Math.floor(gameMin)+eta,done:false});Mk.cart=[];P.life.stats.orders++;save();toast('Commande validée.','good');re();},!x));}
 else if(t==='orders'){const g=UI.grp(b);const L=Mk.orders.filter(o=>!o.done).concat(Mk.hist.slice(0,10));if(!L.length)UI.row(g,{title:'Aucune commande'});L.forEach(o=>UI.row(g,{title:o.items.map(i=>i[1]).join(', '),wrap:true,sub:o.done?'Livré':'En route · arrivée '+X.hhmm(o.eta)}));}
 else{UI.note(b,'Vends les objets de ton sac à d’autres habitants. Un acheteur se manifeste dans l’heure.');const g=UI.grp(b);Object.keys(P3.inv).filter(k=>P3.inv[k]>0&&IT[k]).forEach(k=>UI.row(g,{title:IT[k][0]+' ×'+P3.inv[k],right:'Mettre en vente',onClick:()=>{Mk.ads.push({k,p:Math.round((walletP58.prices[k]||6)*.8),at:Math.floor(gameMin)});P3.inv[k]--;save();re();}}));
  Mk.ads.forEach(a=>UI.row(g,{title:'📢 '+(IT[a.k]||[a.k])[0],sub:'En vente · '+fmt(a.p)}));}});
/* ================= 08 AURORE SERVICES ================= */
reg('Aurore Services',b=>{const t=UI.tabs(b,'svc',[['sos','Urgences'],['health','Santé'],['move','Mobilité'],['out','Sortir']]);const ins=P.bank.ins;
 if(t==='sos'){UI.btn(b,'🆘 SOS · envoyer ma position aux secours',()=>{toast('Position transmise : '+Math.round(player.x)+', '+Math.round(player.z)+'.','good');if(state.health<40){state.health=Math.min(100,state.health+50);if(!ins.health)X.pay(80,'Ambulance');toast('🚑 Ambulance arrivée, premiers soins.','good');}else toast('🚓 Une patrouille passe dans le secteur.');},true);
  const g=UI.grp(b);[['🚑','Ambulance'+(ins.health?' (assuré)':' · 80 $'),()=>{if(!ins.health&&!X.pay(80,'Ambulance'))return;state.health=Math.min(100,state.health+50);gameMin+=20;toast('Soigné sur place. +50 santé','good');}],
  ['🚓','Police · signaler une infraction',()=>{state.rep+=1;toast('Signalement enregistré. Merci citoyen.','good');}],['🚒','Pompiers · signaler un incendie',()=>toast('🚒 Pompiers en route.','good')],
  ['📝','Déclaration de vol',()=>{if(ins.home){X.earn(60,'Indemnisation assurance');toast('Déclaration enregistrée, l’assurance verse 60 $.','good');}else toast('Déclaration enregistrée (pas d’assurance habitation).');}],
  ['🔎','Objets perdus',()=>{if(Math.random()<.3){P3.inv.water=(P3.inv.water||0)+1;toast('Un objet t’attendait : bouteille d’eau récupérée.','good');}else toast('Rien à ton nom pour l’instant.');}]].forEach(([e,l,f])=>UI.row(g,{lead:UI.sq('#ff3b30',e),title:l,onClick:f}));}
 else if(t==='health'){UI.hero(b,'Dossier médical',Math.round(state.health)+' % santé',ins.health?'Assurance santé active':'Sans assurance santé');const g=UI.grp(b);
  UI.row(g,{title:'Rendez-vous à l’hôpital · '+fmt(ins.health?10:40),sub:'Soins complets à l’arrivée',onClick:()=>{const s=nearSpot(/hospital/);book('med','Consultation médicale',s&&{n:s.label,x:s.x,z:s.z},Math.floor(gameMin)+45,ins.health?10:40);}});
  UI.row(g,{title:'Téléconsultation · 15 $',sub:'+10 santé et ordonnance (médicaments dans ton sac)',onClick:()=>{if(!X.pay(15,'Téléconsultation'))return;state.health=Math.min(100,state.health+10);P3.inv.meds=(P3.inv.meds||0)+1;toast('Ordonnance envoyée.','good');}});
  UI.row(g,{title:'Pharmacie la plus proche',onClick:()=>{const s=nearSpot(/pharma/);if(s)X.go(s.x,s.z,s.label);}});}
 else if(t==='move'){const g=UI.grp(b);UI.row(g,{lead:UI.sq('#e0a800','🚕'),title:'Taxi',onClick:()=>{const a=app25('Taxi');if(a)phOpen(a);}});
  UI.row(g,{lead:UI.sq('#111','🎩'),title:'Chauffeur privé VIP · 3× tarif, +humeur',onClick:()=>{const p=wp;if(!p)return toast('Choisis d’abord une destination dans Aurore GPS.','warn');const c=Math.round(15+Math.hypot(p.x-player.x,p.z-player.z)*.24);if(player.car||!X.pay(c,'Chauffeur VIP'))return;X.world(()=>{player.x=p.x;player.z=p.z+2;gameMin+=Math.hypot(p.x-player.x,p.z-player.z)/10;state.fun=Math.min(100,state.fun+10);toast('Déposé en limousine : '+p.l,'good');});}});
  UI.row(g,{lead:UI.sq('#c8102e','🛻'),title:'Dépanneuse / réparations',onClick:()=>X.openApp('Aurore Auto','care')});UI.row(g,{lead:UI.sq('#2e9a6a','🚇'),title:'Transports publics',onClick:()=>X.openApp('Aurore Travel','line')});}
 else{UI.sec(b,'Restaurants · réserver une table');const g=UI.grp(b);X.places().filter(p=>X.catOf(p)==='resto').sort((a,c)=>X.dist(a)-X.dist(c)).slice(0,6).forEach(p=>UI.row(g,{title:p.n,sub:X.fm(X.dist(p))+' · menu 22 $',onClick:()=>book('table','Table · '+p.n,p,Math.floor(gameMin)+45,22)}));
  UI.btn(b,'🍔 Livraison de repas',()=>{const a=app25('Livraison');if(a)phOpen(a);});
  UI.sec(b,'Billetterie & loisirs');const g2=UI.grp(b);X.places().filter(p=>/cin|stade|club|concert|arena|beach|plage|spa|gym/i.test(p.n+' '+p.id)).slice(0,8).forEach(p=>UI.row(g2,{title:p.n,sub:'Billet 25 $ · +30 humeur sur place',onClick:()=>book(/spa|gym/i.test(p.n)?'spa':'event','Billet · '+p.n,p,Math.floor(gameMin)+60,25)}));
  UI.btn(b,'🎉 Organiser une fête chez moi · 120 $',()=>{const h=props()[0];if(!h)return toast('Il te faut un logement.','warn');if(!X.pay(120,'Fête privée'))return;(state.friends||[]).slice(0,4).forEach(n=>X.addAppt(n,{n:h.n,x:h.x,z:h.z},Math.floor(gameMin)+120));toast('Invitations envoyées !','good');});}});
/* ================= 09 AURORE TRAVEL ================= */
const FLT={pax:{code:'AA 274',to:'sol',toN:'Solenne',eco:180,biz:480,gate:'A1'},sol:{code:'AA 275',to:'pax',toN:'Port-Aurore',eco:180,biz:480,gate:'1'}};
function gates(){try{Object.values(W27.terms).forEach(T=>{const lock=!(S27.ticket&&S27.ticket.from===T.id);T.secu.locked=lock;const i=boxes.indexOf(T.secu.box);if(lock&&i<0)boxes.push(T.secu.box);if(!lock&&i>=0)boxes.splice(i,1);});}catch(e){}}
reg('Aurore Travel',b=>{if(netGate(b))return;const t=UI.tabs(b,'travel',[['fly','Vols'],['line','Bateau & train'],['hotel','Hôtels'],['pass','Billets'],['guide','Guide']]);const m=M();
 if(t==='fly'){const ap=inSol27()?'sol':'pax',f=FLT[ap];UI.hero(b,'Prochain vol · '+f.code,(ap==='pax'?'Port-Aurore':'Solenne')+' → '+f.toN,'Départ toutes les 2 h · porte '+f.gate);
  if(S27.ticket)UI.note(b,'Billet actif : '+S27.ticket.code+' · siège '+S27.ticket.seat);
  else[['eco','Économique','15A'],['biz','Affaires','3A']].forEach(([c,n,seat])=>UI.btn(b,n+' · '+fmt(f[c]),()=>{if(!X.pay(f[c],'Vol '+f.code))return;S27.ticket={from:ap,to:f.to,cls:c,seat,code:f.code};try{localStorage.setItem('port-aurore-v27',JSON.stringify({ticket:S27.ticket,seen:S27.seen}));}catch(e){}gates();P.travel.trips.unshift({l:'Vol '+f.code+' → '+f.toN,at:Math.floor(gameMin),k:'Billet'});save();const s=spots.find(x=>x.id===(ap==='pax'?'air27:gate':'air27:gate@sol'));if(s)X.go(s.x,s.z,'Porte '+f.gate,true);toast('E-billet acheté : passe la sûreté puis porte '+f.gate+'.','good');re();},c==='eco'));
  UI.btn(b,'✈️ Jet privé immédiat · 2 500 $',()=>{if(player.car||!X.pay(2500,'Jet privé'))return;const s=spots.find(x=>x.id===(ap==='pax'?'air27:checkin@sol':'air27:checkin'));if(!s)return;X.world(()=>{player.x=s.x;player.z=s.z+4;gameMin+=60;state.rep+=2;toast('Atterrissage VIP à '+f.toN+'.','good');});});}
 else if(t==='line'){const g=UI.grp(b);Object.values(m?m.lines:{}).forEach(l=>UI.row(g,{lead:UI.sq('#0f5fa8',l.kind==='ferry'?'⛴️':l.kind==='metro'?'🚇':'🚌'),title:l.name,sub:l.stops.map(s=>s.n.replace(/^(Station|Arrêt|Gare routière A1 ·|Terminal)\s*/,'')).join(' › '),wrap:true,onClick:()=>{let s=l.stops[0];l.stops.forEach(q=>{if(Math.hypot(q.x-player.x,q.z-player.z)<Math.hypot(s.x-player.x,s.z-player.z))s=q;});X.go(s.x,s.z,s.n);}}));
  [['nat40:station:main','TGV · Gare de Port-Aurore'],['nat40:station:third','TGV · Gare de Nouvelle-Aurore']].forEach(([id,n])=>{const s=spots.find(x=>x.id===id);if(s)UI.row(g,{lead:UI.sq('#8a2be2','🚄'),title:n,onClick:()=>X.go(s.x,s.z,n)});});
  if(m)UI.btn(b,m.S.pass>m.day()?'✓ Pass Métropole actif':'Pass Métropole 7 jours · 200 $ (métro + cars)',()=>{if(m.S.pass>m.day()||!X.pay(200,'Pass Métropole'))return;m.S.pass=m.day()+7;m.save();re();},true);}
 else if(t==='hotel'){const vip=P.bank.vip?.9:1;(m?m.blds.filter(x=>x.tpl==='hotel'):[]).forEach(h=>{const st=m.S.notes&&m.S.notes['hotel:'+h.key],on=st&&st.until>gameMin,g=UI.grp(b);
  UI.row(g,{lead:UI.sq('#36c7d9','🏨'),title:h.name,sub:on?'Séjour actif · '+st.n:X.fm(X.dist({x:h.door.x,z:h.door.z})),onClick:()=>X.go(h.door.x,h.door.z,h.name)});
  if(on)UI.chips(g,[['🛎️ Room service · 25 $',()=>{if(!X.pay(25,'Room service'))return;state.hunger=Math.min(100,state.hunger+45);toast('Room service livré.','good');}],['💆 Spa · 45 $',()=>{if(!X.pay(45,'Spa'))return;X.FXspa&&0;state.energy=Math.min(100,state.energy+30);state.fun=Math.min(100,state.fun+12);toast('Soin réservé et effectué.','good');}]]);
  else UI.chips(g,[['sup','Supérieure',180],['dlx','Deluxe',420],['ste','Suite',950]].map(([k,n,p])=>{const c=Math.round(p*(h.price||1)*vip);return [n+' · '+fmt(c),()=>{if(!X.pay(c,'Hôtel '+h.name))return;m.S.notes=m.S.notes||{};m.S.notes['hotel:'+h.key]={k,n,until:gameMin+1440};m.save();toast('Réservé : '+n+' pour 24 h.','good');re();}];}));});}
 else if(t==='pass'){const g=UI.grp(b);if(S27.ticket)UI.row(g,{lead:UI.sq('#0f5fa8','🎫'),title:'Carte d’embarquement '+S27.ticket.code,sub:state.name.toUpperCase()+' · siège '+S27.ticket.seat+' · '+(S27.ticket.cls==='biz'?'Affaires':'Éco')});
  P.life.bk.filter(k=>!k.done).forEach(k=>UI.row(g,{lead:UI.sq('#ff7a59','🎟️'),title:k.l,sub:k.p+' · '+X.hhmm(k.at),onClick:()=>X.go(k.x,k.z,k.p)}));if(!g.children.length)UI.row(g,{title:'Aucun billet'});
  UI.sec(b,'Historique de voyage');const g2=UI.grp(b);P.travel.trips.filter(x=>x.k!=='GPS').slice(0,10).forEach(x=>UI.row(g2,{title:x.l,sub:X.when(x.at)}));}
 else{UI.btn(b,P.set.vacation?'✓ Mode vacances actif (désactiver)':'🌴 Activer le mode vacances',()=>{P.set.vacation=!P.set.vacation;save();re();},!P.set.vacation);UI.note(b,'Mode vacances : notifications de travail coupées, appels en réponse automatique.');
  const g=UI.grp(b);(m?m.districts:[]).forEach(d=>UI.row(g,{title:d.name,sub:({port:'Port-Aurore',third:'Nouvelle-Aurore',corr:'Corridor',sol:'Solenne'})[d.city]+' · '+X.fm(Math.hypot(d.cx-player.x,d.cz-player.z)),onClick:()=>X.go(d.cx,d.cz,d.name)}));}});
/* ================= 10 AURORE LIFE ================= */
const MISS=[['posts','Publier sur Aurore Social'],['transfers','Faire un virement'],['nav','Lancer un itinéraire GPS'],['orders','Commander sur Aurore Market'],['calls','Appeler un ami']];
function answer(q){q=q.toLowerCase();if(/faim|manger|resto/.test(q)){const p=X.nearest('resto');return ['Le plus proche : '+(p?p.n:'—')+'.',p];}if(/banque|argent|solde/.test(q))return ['Tu as '+fmt(state.cash)+' en cash et '+fmt(state.bank)+' en banque.',X.nearest('bank')];
 if(/travail|job|emploi/.test(q))return [state.job?'Tu es '+JOBN[state.job]+'.':'Tu es sans emploi : regarde Aurore Jobs.',null];if(/météo|temps|pluie/.test(q))return ['Météo : '+WX[wx.i][1]+'.',null];
 if(/hôtel|dormir|fatigu/.test(q)){const p=X.nearest('hotel');return ['Hôtel proche : '+(p?p.n:'—')+'.',p];}if(/heure/.test(q))return ['Il est '+X.hhmm(gameMin)+'.',null];
 const p=X.places().find(x=>q.length>3&&x.n.toLowerCase().includes(q.replace(/^(où est|ou est|aller à|aller a)\s*/,'')));return p?['Je t’y emmène : '+p.n+'.',p]:['Demande-moi : où manger, mon solde, la météo, un hôtel, ou un lieu.',null];}
reg('Aurore Life',b=>{const t=UI.tabs(b,'life',[['today','Aujourd’hui'],['news','Actu'],['agenda','Agenda'],['docs','Papiers'],['tools','Outils'],['stats','Stats']]);const Lf=P.life;
 if(t==='today'){const rw=Lf.reward,ok=rw.day!==day(),gain=20+Math.min(6,rw.streak)*10;UI.btn(b,ok?'🎁 Récompense du jour · '+fmt(gain)+' (série '+rw.streak+')':'✓ Récompense récupérée',()=>{if(!ok)return;rw.streak=rw.day===day()-1?rw.streak+1:1;rw.day=day();X.earn(gain,'Récompense quotidienne',true);save();re();},ok);
  if(Lf.missions.day!==day()){Lf.missions={day:day(),list:MISS.slice().sort(()=>Math.random()-.5).slice(0,3).map(([k,l])=>({k,l,b:Lf.stats[k],done:false}))};save();}
  UI.sec(b,'Missions téléphoniques');const g=UI.grp(b);Lf.missions.list.forEach(m=>{const can=Lf.stats[m.k]>m.b;UI.row(g,{title:m.l,sub:m.done?'Récompense reçue':can?'Terminée · touche pour 40 $':'À faire',onClick:can&&!m.done?()=>{m.done=true;X.earn(40,'Mission téléphone');state.rep+=1;save();re();}:null});});
  UI.sec(b,'Assistant Aurore');const f=UI.field(b,'Pose une question (ex : où manger ?)','',v=>ask(v));const out=mk('p','dim','');b.appendChild(out);
  const ask=v=>{const [r,p]=answer(v);out.textContent=r;X.speak(r);if(p)X.go(p.x,p.z,p.n,true);};UI.btn(b,'Demander',()=>ask(f.value));
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;UI.btn(b,'🎙️ Commande vocale',()=>{if(!SR)return toast('Reconnaissance vocale non disponible sur cet appareil.','warn');const r=new SR();r.lang='fr-FR';r.onresult=e=>{const v=e.results[0][0].transcript;f.value=v;ask(v);};r.start();});}
 else if(t==='news'){const m=M(),st=m&&m.stocks();const N=['☀️ Météo : '+WX[wx.i][1]+' sur la Métropole.','📈 Aurore Coin à '+fmt(P.bank.aucP)+(st?' · ABX '+fmt(st.p.ABX):''),'💼 Recrutement : '+Object.values(JOBS12.J).slice(day()%10,day()%10+3).map(j=>j.n).join(', ')+' recrutent.','🏠 Immobilier : nouvelles unités à '+(m?m.blds.filter(x=>x.units)[day()%10].name:'Platinum')+'.','🏛️ Gouvernement : '+(Lf.vote&&Lf.vote.d<day()?'résultats du vote, '+Lf.vote.c+' l’emporte.':'élection municipale en cours, vote dans Papiers.'),'⚽ Sport : le Stade Aurore accueille un match ce soir.'];
  const g=UI.grp(b);N.forEach(n=>UI.row(g,{title:n,wrap:true}));UI.btn(b,'🎧 Écouter le podcast de la ville',()=>X.speak('Bonjour Port-Aurore. '+N.join(' ').replace(/[^\p{L}\p{N}\s.,:'’-]/gu,''))); if(window.WORLD50){const world50=window.WORLD50,e=world50.active;UI.sec(b,'Le monde vivant');if(e){const city=e.city==='port'?'Port-Aurore':e.city==='nouvelle'?'Nouvelle-Aurore':'Solenne';UI.row(b,{title:e.icon+' '+e.title,sub:city+' · '+e.desc,wrap:true});UI.btn(b,e.accepted?'📍 Reprendre l’intervention':'🚨 Répondre à l’alerte',()=>{world50.accept();re();},true);}else UI.note(b,world50.forecast());}}
 else if(t==='agenda'){const g=UI.grp(b);const L=Lf.appts.filter(a=>!a.done).map(a=>({l:'Rendez-vous avec '+a.n,p:a.p,at:a.at,x:a.x,z:a.z})).concat(Lf.bk.filter(k=>!k.done).map(k=>({l:k.l,p:k.p,at:k.at,x:k.x,z:k.z}))).sort((a,c)=>a.at-c.at);
  if(!L.length)UI.row(g,{title:'Agenda libre',sub:'Réservations et rendez-vous apparaîtront ici.'});L.forEach(a=>UI.row(g,{title:a.l,sub:a.p+' · '+X.hhmm(a.at),onClick:()=>X.go(a.x,a.z,a.p)}));
  UI.sec(b,'Relations');const g2=UI.grp(b);(state.friends||[]).forEach(n=>{const r=rel(n);UI.row(g2,{lead:av25(n),title:n,right:r>=80?'Meilleur ami':r>=50?'Ami proche':r>=25?'Ami':'Connaissance',onClick:()=>{const p=X.nearest('resto');if(p){X.addAppt(n,p,Math.floor(gameMin)+90);X.go(p.x,p.z,'RDV · '+n,true);toast('Rendez-vous fixé avec '+n+' à '+p.n+'.','good');}}});});}
 else if(t==='docs'){const m=M(),g=UI.grp(b);let jr={};try{jr=JSON.parse(localStorage.getItem('port-aurore-justice-v1')||'{}');}catch(e){}
  [['🪪 Identité numérique',state.name+' · résident de Port-Aurore'],['🚗 Permis',Object.keys(state.license||{}).filter(k=>state.license[k]).map(k=>VEHICLE_LICENSE[k]).join(', ')||'Aucun'],['💼 Carte professionnelle',state.job?JOBN[state.job]:'—'],['🏠 Titres de propriété',m?Object.keys(m.S.own).length+' bien(s)':'0'],['⚖️ Casier judiciaire',(jr.rec||0)+' mention(s) · amendes '+(jr.fines||[]).length],['⭐ Carte VIP',P.bank.vip?'Membre · −10 % hôtels':'Débloquée au rang Respecté']].concat(Lf.docs.map(d=>['📄 '+d.n,'Délivré jour '+(d.at+1)])).forEach(([n,s])=>UI.row(g,{title:n,sub:s,wrap:true}));
  if(rankOf()>=3&&!P.bank.vip){P.bank.vip=1;save();}
  UI.sec(b,'Démarches à la mairie');const s=spots.find(x=>x.id==='mairie17');[['Licence commerciale',30],['Permis de construire',50],['Carte de résident',10]].forEach(([n,c])=>UI.btn(b,n+' · '+fmt(c)+' (RDV mairie)',()=>book('admin','RDV mairie · '+n,s&&{n:s.label,x:s.x,z:s.z},Math.floor(gameMin)+40,c,{doc:n})));
  const v=Lf.vote;UI.sec(b,'Élections');if(v&&v.d>=day()-6)UI.note(b,'A voté pour '+v.c+' (jour '+(v.d+1)+').');else UI.chips(b,['Liste Lagune Verte','Union Métropole','Port-Aurore Demain'].map(c=>[c,()=>{Lf.vote={c,d:day()};state.rep+=1;save();re();}]));}
 else if(t==='tools'){const g=UI.grp(b);UI.row(g,{title:'🔦 Lampe torche',right:Lf.torch?'ON':'OFF',onClick:()=>{X.setTorch(!Lf.torch);re();}});
  const deg=Math.round((((player.h||0)*180/Math.PI)%360+360)%360);UI.row(g,{title:'🧭 Boussole',right:deg+'° '+['S','SO','O','NO','N','NE','E','SE'][Math.round(deg/45)%8]});UI.row(g,{title:'🌤️ Météo',right:WX[wx.i][2]+' '+WX[wx.i][1]});
  UI.row(g,{title:'⏰ Réveil 07:00',right:Lf.alarms.some(a=>a.t===420&&a.on)?'Activé':'Ajouter',onClick:()=>{if(!Lf.alarms.some(a=>a.t===420))Lf.alarms.push({t:420,on:true,l:'Debout !'});save();re();}});
  UI.row(g,{title:'⏱️ Minuteur 1 min',right:Lf.timer?'En cours':'Lancer',onClick:()=>{Lf.timer=Date.now()+60000;save();re();}});
  const c=UI.field(b,'🧮 Calculatrice (ex : 12*8+5)');UI.btn(b,'Calculer · convertir $ → FCFA / €',()=>{const e=c.value.replace(/[^0-9+\-*/().]/g,'');try{const r=Function('return ('+e+')')();toast(e+' = '+r+' $ · '+Math.round(r*600)+' FCFA · '+(r*.92).toFixed(2)+' €');}catch(_){toast('Calcul invalide.','warn');}});
  const n=UI.field(b,'📝 Nouvelle note','',null,true);UI.btn(b,'Enregistrer la note',()=>{if(!n.value.trim())return;Lf.notes.unshift({t:n.value.trim(),at:Math.floor(gameMin)});save();re();});Lf.notes.slice(0,5).forEach(x=>UI.note(b,'• '+x.t));}
 else{const s=Lf.stats,L=walletP58.ledger||[];UI.hero(b,'Temps de jeu',Math.floor(s.play/3600)+' h '+Math.floor(s.play%3600/60)+' min',RANKS[rankOf()]+' · réputation '+state.rep);const g=UI.grp(b);
  [['Dépenses totales',fmt(-L.filter(l=>l.amount<0).reduce((a,l)=>a+l.amount,0))],['Gains totaux',fmt(state.earned||0)],['Missions',String(state.done)],['Appels',String(s.calls)],['Publications',String(s.posts)],['Itinéraires',String(s.nav)],['Commandes',String(s.orders)]].forEach(([a,c])=>UI.row(g,{title:a,right:c}));
  UI.sec(b,'Journal de vie');const j=UI.field(b,'Ajouter un moment important',null,v=>{X.journal(v,false);re();});const g2=UI.grp(b);Lf.journal.slice(0,12).forEach(e=>UI.row(g2,{title:e.t,sub:X.when(e.at),wrap:true}));}});
/* ---------- Réglages · Aurore OS ---------- */
{const r=RENDER25['Réglages'];const base=r&&r.fn;RENDER25['Réglages']={fn:b=>{if(base)base(b);const s=P.set;UI.sec(b,'Aurore OS');const g=UI.grp(b);
 UI.row(g,{title:'Sonnerie',right:X.RINGS[s.ring][0],onClick:()=>{s.ring=(s.ring+1)%X.RINGS.length;save();X.ring();re();}});
 [['silent','Mode silencieux'],['drive','Mode conduite'],['autoReply','Réponse auto en voiture'],['voice','Guidage vocal'],['vacation','Mode vacances']].forEach(([k,l])=>UI.row(g,{title:l,right:s[k]?'Oui':'Non',onClick:()=>{s[k]=!s[k];save();re();}}));
 UI.row(g,{title:'Économie de batterie',right:s.saver?'Oui':'Non',onClick:()=>{X.setSaver(!s.saver);re();}});
 UI.row(g,{title:'Code PIN',right:s.pin?'••••':'Aucun',onClick:()=>{if(s.pin){s.pin='';save();re();return;}const v=prompt('Nouveau code à 4 chiffres');if(/^\d{4}$/.test(v||'')){s.pin=v;save();re();}}});
 UI.row(g,{title:'Fond verrouillé',right:s.lockWall<0?'Comme l’accueil':(WALLN25[s.lockWall]||s.lockWall),onClick:()=>{s.lockWall=s.lockWall+1>=WALLS.length?-1:s.lockWall+1;save();re();}});
 UI.row(g,{title:'Style d’horloge',right:X.CLOCKS[s.lockClock],onClick:()=>{s.lockClock=(s.lockClock+1)%X.CLOCKS.length;save();re();}});
 const lm=UI.field(b,'Message d’écran verrouillé',s.lockMsg,v=>{s.lockMsg=v.slice(0,60);save();});lm.onchange=()=>{s.lockMsg=lm.value.slice(0,60);save();};
 UI.sec(b,'Notifications');const g2=UI.grp(b);Object.keys(X.APPN).forEach(k=>UI.row(g2,{title:X.APPN[k],right:s.mute[k]?'Coupées':'Actives',onClick:()=>{s.mute[k]=!s.mute[k];save();re();}}));
 UI.btn(b,'Réorganiser les icônes',()=>{phHome();X.enterEdit();});UI.btn(b,'Réinitialiser la disposition',()=>{P.order=null;save();toast('Disposition par défaut.','good');});
 UI.sec(b,'Synchronisation');UI.btn(b,'Copier mon code de sauvegarde',()=>{const c=X.exportCode();try{navigator.clipboard.writeText(c);toast('Code copié : colle-le sur ton autre appareil.','good');}catch(e){prompt('Code',c);}});
 const im=UI.field(b,'Coller un code PA49:…');UI.btn(b,'Importer et recharger',()=>{const n=X.importCode(im.value);if(n){toast(n+' sauvegardes importées.','good');setTimeout(()=>location.reload(),900);}else toast('Code invalide.','warn');});}};}
/* ---------- boucles reliées au gameplay ---------- */
let tk=0;
PH49.onTick=function(){tk++;
 P.life.bk.forEach(k=>{if(k.done)return;const near=Math.hypot(player.x-k.x,player.z-k.z)<16;if(near&&gameMin>=k.at-120){k.done=true;try{(FX[k.k]||(()=>{}))(k.data);}catch(e){}gameMin+=k.k==='event'?90:30;X.journal(k.l+' · '+k.p);X.notify({app:'life',title:'✓ '+k.l,text:'Réservation honorée à '+k.p+'.'});save();}
  else if(gameMin>k.at+240){k.done=true;X.notify({app:'life',title:'Réservation expirée',text:k.l});save();}});
 P.market.orders.forEach(o=>{if(!o.done&&gameMin>=o.eta)deliver(o);});P.market.orders=P.market.orders.filter(o=>!o.done);
 P.jobs.apps.forEach(a=>{if(a.st!=='wait'||gameMin<a.at+30)return;const j=JOBS12.J[a.id];const why=j.lic&&!(state.license&&state.license[j.lic])?'permis manquant':rankOf()<j.rk?'rang insuffisant':null;a.st=why?'no':'ok';save();
  X.notify(why?{app:'jobs',title:'Candidature refusée · '+j.n,text:'Motif : '+why+'.'}:{app:'jobs',title:'Candidature acceptée · '+j.n,text:'Signe ton contrat pour commencer.',actions:[['Signer',()=>{const e=hire(j);toast(e||'Contrat signé : tu es '+j.n+'.',e?'warn':'good');}]]});});
 P.jobs.invoices.forEach(i=>{if(i.st!=='wait'||gameMin<i.at+120)return;const Bz=M()&&M().S.biz;if(Math.random()<.85&&Bz){i.st='paid';Bz.cash=(Bz.cash||0)+i.a;M().save();X.notify({app:'jobs',title:'Facture payée · '+fmt(i.a),text:i.c});}else{i.st='no';X.notify({app:'jobs',title:'Facture refusée',text:i.c});}save();});
 if(P.auto.rent&&gameMin>P.auto.rent.until){const c=cars.find(x=>x.rent49);if(c&&player.car!==c){scene.remove(c.mesh);cars.splice(cars.indexOf(c),1);}P.auto.rent=null;X.notify({app:'auto',title:'Location terminée',text:'La voiture de location a été récupérée.'});save();}
 if(tk%20===0){const own=P.social.posts.filter(p=>p.me&&gameMin-p.at<360);own.forEach(p=>{if(Math.random()<.35+P.social.followers/400){p.likes++;if(p.likes%10===0)state.rep+=1;if(p.likes%3===1){const n=pick((state.friends||[]).concat([npc(p.likes)]));if(Math.random()<.3)p.com.push({w:n,t:pick(['Trop stylé !','🔥🔥','Où c’est ?'])});X.notify({app:'social',title:n+' a aimé ta publication',text:p.t.slice(0,50),sound:false});}if(Math.random()<.2)P.social.followers++;}});save();}};
PH49.onHour=function(){const B=P.bank,d=day();
 B.aucP=Math.max(2,Math.round(B.aucP*(1+(Math.random()-.48)*.09)*100)/100);B.aucH=(B.aucH||[]).concat([B.aucP]).slice(-24);
 const ps=X.places().filter(p=>X.catOf(p)==='loisirs'||X.catOf(p)==='resto');if(ps.length&&Math.random()<.6){const p=pick(ps),w=pick((state.friends||[]).concat([npc(Math.floor(gameMin))]));P.social.posts.unshift({id:P.seq++,who:w,t:pick(['Ambiance de folie à ','Je recommande ','Qui me rejoint à '])+p.n+' ?',at:Math.floor(gameMin),likes:Math.floor(Math.random()*40),com:[],x:p.x,z:p.z,pl:p.n});P.social.posts=P.social.posts.slice(0,60);if(Math.random()<.4)P.social.stories.unshift({id:P.seq++,who:w,t:'En direct de '+p.n,at:Math.floor(gameMin)});}
 if(Math.random()<.1){const p=pick(X.places().filter(q=>X.dist(q)>120&&X.dist(q)<1500));if(p){P.social.anon.unshift({t:'Psst… quelque chose t’attend près de '+p.n+'.',x:p.x,z:p.z,r:pick([25,40,60]),done:false,at:Math.floor(gameMin)});X.notify({app:'social',title:'Message anonyme',text:'Un bon plan t’attend.',actions:[['Y aller',()=>X.go(p.x,p.z,'Bon plan anonyme')]]});}}
 if(P.jobs.cvPub&&!state.job&&Math.random()<.08)X.incomingCall('Recruteur '+npc(d),'job');
 Object.keys(P.home.dev).forEach(k=>{const v=P.home.dev[k];P.home.bill=(P.home.bill||0)+(v.light?.5:0)+(v.ac?1:0);});
 const L=props(),far=L.length&&L.every(p=>Math.hypot(p.x-player.x,p.z-player.z)>200);if(far&&Math.random()<.03){const p=pick(L),dv=P.home.dev[p.k]||{};P.home.log=P.home.log||{};
  if(dv.alarm){P.home.log[p.k]='📹 Intrusion repoussée par l’alarme (jour '+(d+1)+').';X.notify({app:'immo',title:'🚨 Alarme déclenchée · '+p.n,text:'Intrus mis en fuite, police prévenue.'});}
  else{P.home.log[p.k]='📹 Cambriolage enregistré (jour '+(d+1)+').';if(B.ins.home)X.notify({app:'immo',title:'Cambriolage · '+p.n,text:'L’assurance couvre les dégâts.'});else{walletP58.unpaidUtilities+=80;saveEconomyP58();X.notify({app:'immo',title:'Cambriolage · '+p.n,text:'Réparations : 80 $ ajoutés à tes factures. Active l’alarme !',actions:[['Police',()=>{state.rep+=1;toast('Plainte déposée.','good');}]]});}}}
 if(wx.i===3&&P.lastWx!==3)X.notify({app:'life',title:'⛈️ Alerte météo',text:'Orage sur la Métropole : prudence sur la route.'});P.lastWx=wx.i;
 (B.debts||[]).forEach(x=>{if(!x.paid&&d>=x.due){x.paid=1;X.earn(x.a,'Remboursement de '+x.n);X.notify({app:'bank',title:'Reçu · '+fmt(x.a),text:x.n+' t’a remboursé.'});}});B.debts=(B.debts||[]).filter(x=>!x.paid);
 if(B.lastDay!==d){const first=B.lastDay<0;B.lastDay=d;if(!first)onDay(d);}save();};
function onDay(d){const B=P.bank;
 if(B.save>0){const i=Math.min(200,Math.round(B.save*.005));B.save+=i;}
 if(d%7===0){B.net.due+=25;if(!B.net.since)B.net.since=d;const inc=Math.max(0,(state.earned||0)-(B.tax.base||0));B.tax.due+=Math.round(inc*.08);B.tax.base=state.earned||0;
  const prem=(B.ins.home?15:0)+(B.ins.health?12:0)+Object.keys(P.auto.ins).length*10;if(prem)X.pay(prem,'Assurances hebdo');X.notify({app:'bank',title:'Nouvelles factures',text:'Internet, impôts et assurances de la semaine.',actions:[['Payer',()=>X.openApp('Aurore Bank','pay')]]});}
 if(B.loan){const L=B.loan,a=Math.min(L.inst,L.left);if(state.bank>=a){state.bank-=a;L.left-=a;X.log('Échéance prêt',-a,'Banque');if(L.left<=0){B.loan=null;state.rep+=1;}}else{L.late=(L.late||0)+1;state.rep=Math.max(0,state.rep-1);X.notify({app:'bank',title:'Échéance impayée',text:'Approvisionne ton compte.'});}}
 if(P.home.bill>=1){const c=Math.round(P.home.bill);P.home.bill=0;walletP58.unpaidUtilities+=c;saveEconomyP58();}
 Object.keys(P.home.ten).forEach(k=>{const t=P.home.ten[k];if(Math.random()<.9){X.earn(t.r,'Loyer de '+t.n);}else X.notify({app:'immo',title:'Loyer en retard',text:t.n+' paiera demain.'});});
 const Bz=M()&&M().S.biz;if(Bz){if(P.jobs.brief===d-1)Bz.cash=(Bz.cash||0)+60*Bz.staff;if(P.jobs.ad>=d)Bz.cash=(Bz.cash||0)+Math.round(Math.abs((Bz.hist||[0]).slice(-1)[0])*.25);M().save();}
 if(P.jobs.leave===d){state.energy=Math.min(100,state.energy+30);state.fun=Math.min(100,state.fun+20);X.notify({app:'jobs',title:'Jour de congé',text:'Repos complet : +énergie, +humeur.'});}
 X.notify({app:'life',title:'Nouvelle journée',text:'Ta récompense quotidienne t’attend.',actions:[['Récupérer',()=>X.openApp('Aurore Life','today')]]});}
/* les 10 applis Aurore passent en tête */
X.applyOrder();
/* le parfum renforce les relations */
if(window.P3){setInterval(()=>{if(P.market.perf>gameMin&&state.friends)state.friends.forEach(n=>{if(P3.rel[n]!=null&&Math.random()<.02)bump(n,1);});},4000);}
window.PH49A={book,props,hire,deliver,FX};
})();
