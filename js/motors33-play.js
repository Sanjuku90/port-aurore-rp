'use strict';
/* v33 · Aurore Motors : vitrines, personnel, essais, atelier, garage, occasions, VIP, téléphone */
(function(){
const AM=window.AM,ST=AM.ST,byId=AM.byId,LINES=AM.LINES,COLS=AM.COLS,UI=AM.UI,h=AM.h,btn=AM.btn,row=AM.row,bar=AM.bar,sec=AM.sec,seg=AM.seg;
const W=()=>AM.W;
/* ---------------- vitrines + points d'interaction ---------------- */
AM.placeDisplays=function(){const D=AM.display,S=AM.spot;
  const pods=[['hyper',-67,.5],['rosso',-56,.35],['volt',-45,.2],['coupe',-34,.05],['titan',-23,-.1]];
  pods.forEach(([id,x,ry])=>{const m=byId[id],d=D(m,COLS[m.col[0]][0],x,.7,-685,ry);S(x,-677,'am:show:'+d.slot,0xffffff,m.n+' · fiche & essai',{indoor:1});});
  [['prestige',-65,-666,.25],['atlas',-45,-666,.18]].forEach(([id,x,z,sp])=>{const m=byId[id],d=D(m,COLS[m.col[0]][0],x,.4,z,0,{spin:sp});S(x+4.6,z+4.2,'am:show:'+d.slot,0xffffff,m.n+' · fiche & essai',{indoor:1});});
  [['lagune',0],['lumi',1],['titan',2]].forEach(([id,k])=>{const m=byId[id],o=W().outdoor[k],d=D(m,COLS[m.col[k===2?3:1]][0],o[0],.36,o[1],o[2]);S(o[0],o[1]-4.6,'am:show:'+d.slot,0xffffff,m.n+' · exposition extérieure',{indoor:1});});
  const E=W().ex;[['sovereign',0],['hypernuit',1],['pullman',2],['rossoa',3]].forEach(([id,k])=>{const m=byId[id],p=W().exPods[k],d=D(m,COLS[m.col[0]][0],p[0],.45,p[1],p[2],{mods:{rim:m.rim||0,tint:2,seat:id==='rossoa'?3:2}});S(p[0]+(k===3?-4.5:0),p[1]+(k===3?0:5),'am:show:'+d.slot,0xc9a24a,m.n,{indoor:1});});
  W().motoPods.forEach((p,k)=>{const m=byId[['urbano','strada','corsa','imperiale'][k]];const g=specialVehicleMesh(m.t,COLS[m.col[0]][0]);g.position.set(p[0],.42,p[1]);g.rotation.y=p[2];scene.add(g);
    const d={m:g,model:m,color:COLS[m.col[0]][0],x:p[0],z:p[1],y:.42,ry:p[2],line:'moto',slot:W().displays.length,moto:1};W().displays.push(d);S(p[0],p[1]+4,'am:show:'+d.slot,0xff6a13,m.n,{indoor:1});});
  AM.refreshOcc();
  // personnel, accès et services
  S(-24,-661.6,'am:accueil',0xff5a5a,'Accueil Aurore Motors · Ama',{indoor:1,s:.6});
  S(-40,-668.8,'am:staff:koffi',0xff5a5a,'Parler à Koffi · conseiller commercial',{indoor:1});S(-53,-658.6,'am:staff:nadia',0xff5a5a,'Parler à Nadia · conseillère',{indoor:1});
  S(-11.6,-657.4,'am:stairs',0x6cc6ff,'Étage · bureaux, financement, salon VIP',{indoor:1,s:.6});S(-31,-663.2,'am:nego',0xff5a5a,'Espace de négociation',{indoor:1});
  S(6,-672.6,'am:sav',0x6cc6ff,'Service après-vente · Yao',{s:.6});S(12,-666.6,'am:keys',0xffd24a,'Remise des clés',{s:.6});S(18.5,-672.6,'am:garage',0x6cc6ff,'Mon garage Aurore',{s:.6});
  S(-262,-720,'am:moto',0xff6a13,'Aurore Moto · catalogue',{s:.7});S(-250,-725.8,'am:staff:rachid',0xff6a13,'Parler à Rachid · Aurore Moto',{indoor:1});
  S(-177,-744.4,'am:occ',0x58d68d,'Aurore Occasion · Mamadou',{s:.7});S(55,-717.6,'am:excl',0xc9a24a,'Aurore Exclusive · conciergerie',{s:.7});S(-90,-719,'am:track',0xff5a5a,'Piste d’essai · chronos',{s:.6});
  const st=W().staff;const fix=(k,x,z,hh)=>{const s=st[k];if(!s)return;s.x=x;s.z=z;s.h=hh;s.m.position.set(x,s.m.position.y,z);s.m.rotation.y=hh;};
  fix('mamadou',-178,-745.6,0);fix('selom',58.5,-720.2,0);fix('rachid',-250,-728,0);
  Object.values(st).forEach(s=>s.line=s.key==='rachid'?'moto':s.key==='mamadou'?'occasion':s.key==='selom'?'exclusive':'prestige');
  try{Object.assign(POI,{'am:accueil':['🚗','Commerces'],'am:sav':['🔧','Services'],'am:moto':['🏍️','Commerces'],'am:occ':['🚙','Commerces'],'am:excl':['💎','Commerces'],'am:track':['🏁','Loisirs']});}catch(e){}
  try{spots.forEach(s=>{if(s.id==='am:accueil')s.label='Aurore Motors Prestige';});}catch(e){}
};
/* ---------------- routage des interactions ---------------- */
const _os=openSpot;openSpot=function(id){
  if(typeof id!=='string'||!id.startsWith('am:'))return _os(id);const a=id.split(':');
  if(a[1]==='show'){const d=W().displays[+a[2]];if(!d)return;if(d.line==='exclusive'&&!ST.vip){AM.talk('selom');return;}if(d.occ)return AM.occSheet(d);return AM.sheet(d.model.id,d);}
  if(a[1]==='staff')return AM.talk(a[2]);
  ({accueil:()=>AM.talk('ama'),stairs:()=>enterInterior({id:'am33',x:-11.6,z:-656}),nego:()=>AM.negotiate(),sav:()=>AM.talk('yao'),keys:()=>AM.keys(),garage:()=>AM.garage(),moto:()=>AM.catalog('moto'),occ:()=>AM.talk('mamadou'),excl:()=>AM.talk('selom'),track:()=>AM.trackInfo()}[a[1]]||(()=>{}))();};
/* ---------------- personnel ---------------- */
const ready=()=>ST.orders.filter(q=>q.ready&&q.kind==='delivery');
AM.talk=function(key){const s=W().staff[key];if(!s)return;const D=AM.dialog;
  if(key==='ama')D(key,pick(['Bienvenue chez Aurore Motors ! Je suis Ama. Que puis-je faire pour vous ?','Bonjour et bienvenue ! Un café pendant que vous découvrez la gamme ?']),[
    ['Découvrir toute la gamme Prestige',()=>AM.catalog('prestige')],ready().length?['Je viens chercher ma voiture',()=>AM.keys(),'hot']:null,['Suivre mes commandes ('+ST.orders.length+')',()=>AM.tracker()],
    ['Où sont les bureaux et le salon VIP ?',()=>D(key,'À l’étage : prenez l’escalier vitré au fond à droite. Bureau des vendeurs, financement, négociation et salon VIP.',[['Monter à l’étage',()=>{UI.close();enterInterior({id:'am33',x:-11.6,z:-656});}],['Merci',()=>UI.close(),'ghost']])],
    ['Prendre rendez-vous à l’atelier',()=>AM.sav()],['Les autres concessions Aurore',()=>AM.network()]]);
  else if(key==='koffi'||key==='nadia')D(key,pick(['Je suis '+s.name.split(' ')[0]+', conseiller'+(key==='nadia'?'ère':'')+'. Un modèle vous fait de l’œil ?','Ravi de vous voir ! On regarde ensemble la voiture de vos rêves ?']),[
    ['Me conseiller selon mon budget',()=>AM.advise(key)],['Faire un essai routier',()=>AM.pickModel('prestige','Quel modèle voulez-vous essayer ?',m=>AM.askTest(m))],['Comparer des modèles',()=>AM.pickModel('prestige','Ajoutez des modèles au comparateur',m=>{if(!ST.cmp.includes(m.id))ST.cmp.push(m.id);if(ST.cmp.length>3)ST.cmp.shift();AM.save();AM.compare();})],
    ['Négocier un prix',()=>AM.negotiate()],['Reprendre mon ancien véhicule',()=>AM.talk('mamadou')]]);
  else if(key==='yao'){const rd=ready();D(key,rd.length?'Votre '+AM.recOf(rd[0].car).n+' est prête, briquée et immatriculée. On fait la remise des clés ?':'Atelier Aurore, Yao à votre service. Entretien, personnalisation, nettoyage, garanties : on s’occupe de tout.',[
    rd.length?['Recevoir les clés',()=>AM.keys(),'hot']:null,['Service après-vente',()=>AM.sav()],['Mon garage',()=>AM.garage()],['Suivre l’atelier ('+ST.orders.length+')',()=>AM.tracker()]]);}
  else if(key==='rachid')D(key,'Salut ! Ici c’est Aurore Moto : scooters pour la ville, sportives pour le boulevard, routières de luxe. On t’en sort une pour un essai ?',[['Voir les motos',()=>AM.catalog('moto')],['Essayer une moto',()=>AM.pickModel('moto','Quelle moto veux-tu essayer ?',m=>AM.askTest(m))]],'moto');
  else if(key==='mamadou')AM.occasion();
  else if(key==='selom'){if(!ST.vip)D(key,'Aurore Exclusive reçoit uniquement sur rendez-vous, pour nos clients et les titulaires de la carte Exclusive.',[['Obtenir la carte Aurore Exclusive · '+fmt(500),()=>{if(AM.pay(500,'Carte Aurore Exclusive')){ST.vip=1;AM.save();AM.talk('selom');}},'hot',!AM.afford(500)],['Je reviendrai après mon premier achat',()=>UI.close(),'ghost']],'exclusive');
    else D(key,pick(['Bienvenue dans le cercle Exclusive. Limousines, séries limitées : tout est préparé pour vous.','Ravi de vous revoir. Une coupe de champagne pendant la présentation ?']),[['Voir la collection Exclusive',()=>AM.catalog('exclusive')],['Essai privé',()=>AM.pickModel('exclusive','Quel modèle pour votre essai privé ?',m=>AM.askTest(m))],['Présentation au salon VIP',()=>{UI.close();AM.goVip();}]],'exclusive');}
};
AM.pickModel=function(line,title,fn){UI.open({line,eye:LINES[line].n,title,body:b=>{const l=h('div','am-list');AM.MODELS.filter(m=>m.line===line).forEach(m=>l.appendChild(btn(m.n+' · '+m.g+' · '+fmt(AM.netPrice(m)),()=>fn(m))));b.appendChild(l);}});};
AM.advise=function(key){const total=state.cash+state.bank;AM.dialog(key,'Vous disposez de '+fmt(total)+'. Plutôt quel usage ?',[
  ['La ville, économique',()=>rec(['lumi','lagune'])],['La famille et le confort',()=>rec(['lagune','prestige','atlas'])],['Le prestige',()=>rec(['prestige','titan','volt'])],['La vitesse pure',()=>rec(['coupe','rosso','hyper'])]]);
  function rec(ids){const L=ids.map(i=>byId[i]),ok=L.filter(m=>AM.netPrice(m)<=total||AM.netPrice(m)*.25<=total);
    AM.dialog(key,(ok.length?'Je vous recommande la '+ok[0].n+(ok[1]?' ou la '+ok[1].n:'')+'. ':'Pour ce profil, la '+L[0].n+' est idéale, avec un crédit adapté. ')+'Voulez-vous voir la fiche ?',L.map(m=>[m.n+' · '+fmt(AM.netPrice(m)),()=>AM.sheet(m.id)]));}};
AM.network=function(){UI.open({line:'prestige',eye:'Réseau Aurore à Port-Aurore',title:'Nos 4 concessions',body:b=>{[['prestige',-40,-650],['moto',-262,-720],['occasion',-177,-744],['exclusive',55,-718]].forEach(([k,x,z])=>{const c=h('div','am-net');c.style.setProperty('--am',LINES[k].c);c.appendChild(h('b',null,LINES[k].n));c.appendChild(h('span',null,LINES[k].s));
  c.appendChild(btn('Itinéraire GPS',()=>{wp={x,z,l:LINES[k].n};UI.close();toast('Itinéraire vers '+LINES[k].n,'good');}));b.appendChild(c);});
  const t=h('div','am-net');t.appendChild(h('b',null,'Piste d’essai Aurore'));t.appendChild(h('span',null,'Derrière le showroom, sur le boulevard Aurore'));t.appendChild(btn('Itinéraire GPS',()=>{wp={x:-90,z:-719,l:'Piste d’essai'};UI.close();}));b.appendChild(t);}});};
/* ---------------- négociation ---------------- */
AM.negotiate=function(mid){if(!mid)return AM.pickModel('prestige','Quel véhicule voulez-vous négocier ?',m=>AM.negotiate(m.id));const m=byId[mid];let pct=Math.min(2,Math.floor((state.rep||0)/25)),mood=0,round=0,gift='';
  const who=m.line==='exclusive'?'selom':m.line==='moto'?'rachid':'koffi';
  const R=[[['Je suis prêt à signer aujourd’hui.',2,'Ah, voilà qui change tout !'],['J’ai vu moins cher ailleurs.',Math.random()<.6?3:1,'Hum… Je peux faire un geste.'],['C’est votre meilleur prix ?',1,'On peut toujours discuter.']],
    [['Je prends aussi les garanties.',2,'Excellent choix, je fais un effort.'],['Je paierai comptant.',2,'Le comptant, ça se récompense.'],['Sans remise, je pars.',Math.random()<.45?4:-2,'']],
    [['Ajoutez un lavage et des tapis ?',1,'Lavage et tapis offerts, c’est noté.','gift'],['Je suis un client fidèle.',ST.bought?3:0,ST.bought?'C’est vrai, vous êtes de la maison !':'Je ne trouve pas d’achat à votre nom…'],['Marché conclu.',0,'Parfait !']]];
  const step=()=>{if(round>=3){pct=Math.max(0,Math.min(10,pct));AM.dialog(who,'Dernière offre pour la '+m.n+' : −'+pct+' %, soit '+fmt(Math.round(m.p*(1-pct/100)))+' au lieu de '+fmt(m.p)+'. Valable 24 h.'+(gift?' Lavage et tapis offerts.':''),[
      ['Accepter l’offre',()=>{ST.deals[m.id]={pct,until:Math.round(gameMin)+1440};AM.save();AM.buy(m.id,COLS[m.col[0]][0]);},'hot'],['Réfléchir',()=>{ST.deals[m.id]={pct,until:Math.round(gameMin)+1440};AM.save();UI.close();toast('Offre gardée 24 h : −'+pct+' % sur '+m.n+'.','good');},'ghost']],m.line);return;}
    const opts=R[round];AM.dialog(who,round===0?'Parlons de la '+m.n+'. Affichée '+fmt(m.p)+'. Qu’est-ce qui vous ferait signer ?':pick(['Je vous écoute.','Et sinon ?','Allez, convainquez-moi.']),opts.map(o=>[o[0],()=>{pct+=o[1];if(o[3])gift=1;round++;const l=o[2]||(o[1]>0?'Bon… d’accord, vous êtes dur en affaires.':'Là, vous me vexez un peu.');AM.say(who,l);step();}]),m.line);};
  step();};
/* ---------------- bureau de financement ---------------- */
AM.financeOffice=function(){UI.open({line:'prestige',eye:'Aurore Finance · Mme Diallo',title:'Bureau de financement',body:b=>{
  sec(b,'Crédits en cours');if(!ST.credits.length)b.appendChild(h('p','am-dim','Aucun crédit en cours.'));
  ST.credits.forEach(c=>{const x=h('div','am-track');x.appendChild(h('b',null,c.label));x.appendChild(row('Mensualité',fmt(c.monthly)+(c.late?' + retard '+fmt(c.late):'')));x.appendChild(row('Restant',c.left+' / '+c.n+' · '+fmt(c.monthly*c.left)));x.appendChild(row('Prochaine échéance',AM.day(c.due)));
    const g=h('div','am-grid');g.appendChild(btn('Payer une mensualité',()=>{if(AM.pay(c.monthly+(c.late||0),'Mensualité '+c.label)){c.left--;c.late=0;c.missed=0;c.due+=1440;ST.credits=ST.credits.filter(q=>q.left>0);AM.save();AM.financeOffice();}},'',!AM.afford(c.monthly)));
    g.appendChild(btn('Solder le crédit · '+fmt(c.monthly*c.left),()=>{if(AM.pay(c.monthly*c.left,'Remboursement anticipé '+c.label)){c.left=0;ST.credits=ST.credits.filter(q=>q.left>0);AM.save();toast('Crédit soldé. La voiture est entièrement à vous !','good');AM.financeOffice();}},'',!AM.afford(c.monthly*c.left)));x.appendChild(g);b.appendChild(x);});
  sec(b,'Locations longue durée');if(!ST.leases.length)b.appendChild(h('p','am-dim','Aucune location.'));
  ST.leases.forEach(l=>{const r=AM.recOf(l.car);if(!r)return;const x=h('div','am-track');x.appendChild(h('b',null,r.n+' · '+r.plate));x.appendChild(row('Loyer',fmt(l.daily)+' / jour'));x.appendChild(row('Fin du contrat',AM.day(l.until)));
    x.appendChild(btn('Lever l’option d’achat · '+fmt(l.option),()=>{if(AM.pay(l.option,'Option d’achat '+r.n)){r.mode='cash';ST.leases=ST.leases.filter(q=>q!==l);AM.save();toast(r.n+' vous appartient désormais.','good');AM.financeOffice();}},'',!AM.afford(l.option)));
    x.appendChild(btn('Prolonger de 7 jours',()=>{l.until+=7*1440;AM.save();AM.financeOffice();},'ghost'));b.appendChild(x);});
  sec(b,'Historique des transactions');if(!ST.tx.length)b.appendChild(h('p','am-dim','Aucune transaction.'));const L=h('div','am-sum');ST.tx.slice(0,12).forEach(t=>L.appendChild(row(AM.day(t.t)+' · '+t.l,(t.a>0?'+':'')+fmt(t.a),t.a>0?'good':'')));b.appendChild(L);
},actions:[{label:'Simuler un crédit',fn:()=>AM.pickModel('prestige','Simulation de crédit',m=>AM.buy(m.id,COLS[m.col[0]][0],{mode:'credit'}))}]});};
/* ---------------- salon VIP ---------------- */
AM.goVip=function(){enterInterior({id:'am33',x:-11.6,z:-656});setTimeout(()=>{if(player.inside===W().mez){player.x=W().mez.rx+9.5;player.z=W().mez.rz-1.4;}},50);};
AM.vipLounge=function(){if(!ST.vip){AM.dialog('selom','Le salon VIP est réservé aux clients Aurore et aux titulaires de la carte Exclusive.',[['Prendre la carte Exclusive · '+fmt(500),()=>{if(AM.pay(500,'Carte Aurore Exclusive')){ST.vip=1;AM.save();AM.vipLounge();}},'hot',!AM.afford(500)],['Plus tard',()=>UI.close(),'ghost']],'exclusive');return;}
  const wait=ST.orders.filter(q=>!q.ready);
  UI.open({line:'exclusive',eye:'Salon VIP · Aurore Motors',title:'Installez-vous',body:b=>{b.appendChild(h('p','am-desc','Fauteuils en cuir, champagne, vue sur le showroom. Votre conseiller vous tient informé de l’avancement de vos commandes.'));
    const g=h('div','am-list');
    g.appendChild(btn('🥂 Coupe de champagne (offerte)',()=>{state.fun=Math.min(100,state.fun+10);toast('Santé ! +10 humeur','good');}));
    g.appendChild(btn('☕ Café et mignardises (offerts)',()=>{state.energy=Math.min(100,state.energy+10);state.hunger=Math.min(100,state.hunger+10);toast('+10 énergie, +10 faim','good');}));
    g.appendChild(btn(wait.length?'⏳ Patienter pendant la préparation ('+wait.length+')':'⏳ Aucune préparation en cours',()=>{V31.fadeDo(()=>{wait.forEach(q=>{q.t=q.d;});gameMin+=45;});UI.close();},'',!wait.length));
    g.appendChild(btn('💎 Présentation privée Aurore Exclusive',()=>AM.catalog('exclusive')));g.appendChild(btn('📄 Mes documents et contrats',()=>AM.garage()));b.appendChild(g);}});};
})();
