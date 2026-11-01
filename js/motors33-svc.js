'use strict';
/* v33 · remise des clés, garage, service après-vente, occasions & annonces */
(function(){
const AM=window.AM,ST=AM.ST,byId=AM.byId,LINES=AM.LINES,COLS=AM.COLS,UI=AM.UI,h=AM.h,btn=AM.btn,row=AM.row,bar=AM.bar,sec=AM.sec,seg=AM.seg;
const W=()=>AM.W;
/* ---------------- remise des clés ---------------- */
function bow(c){const g=new THREE.Group(),m=sm(0xc8102e,.4,.1);const u=c.mesh.userData,top=(u.chassis?(CAR7[c.type]||CAR7.sedan).gh.roof:1.6)+.06;
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.12,.04,4.2),m));g.add(new THREE.Mesh(new THREE.BoxGeometry(2,.04,.12),m));[-1,1].forEach(s=>{const t=new THREE.Mesh(new THREE.TorusGeometry(.18,.05,8,16),m);t.position.set(s*.17,.14,0);t.rotation.set(0,Math.PI/2,s*.6);g.add(t);});
  g.position.set(0,top,0);(u.chassis||c.mesh).add(g);c.bow=g;}
function confetti(x,z){const n=160,p=new Float32Array(n*3),v=[],col=new Float32Array(n*3),pal=[[.78,.06,.18],[1,.82,.29],[1,1,1],[.17,.62,.9]];for(let i=0;i<n;i++){p.set([x,3,z],i*3);v.push([rand(-3,3),rand(4,8),rand(-3,3)]);col.set(pick(pal),i*3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));const pts=new THREE.Points(g,new THREE.PointsMaterial({size:.16,vertexColors:true}));scene.add(pts);
  let t=0;const step=()=>{t+=.016;for(let i=0;i<n;i++){v[i][1]-=9.8*.016;p[i*3]+=v[i][0]*.016;p[i*3+1]=Math.max(.05,p[i*3+1]+v[i][1]*.016);p[i*3+2]+=v[i][2]*.016;}g.attributes.position.needsUpdate=true;if(t<3.2)requestAnimationFrame(step);else{scene.remove(pts);g.dispose();}};step();}
AM.keys=function(){const q=ST.orders.find(o=>o.ready&&o.kind==='delivery');
  if(!q){const w=ST.orders.find(o=>o.kind==='delivery');AM.dialog('yao',w?'Votre '+AM.recOf(w.car).n+' est encore en préparation : '+w.steps[w.i]+'. Je vous préviens dès qu’elle est prête.':'Aucune voiture à remettre pour le moment. Passez voir nos conseillers au showroom !',[w?['Suivre la préparation',()=>AM.tracker()]:null,['D’accord',()=>UI.close(),'ghost']]);return;}
  const r=AM.recOf(q.car);ST.orders=ST.orders.filter(o=>o!==q);UI.close();
  V31.fadeDo(()=>{const b=r.line==='moto'?[-256,-718,Math.PI/2]:r.line==='exclusive'?[55,-718,Math.PI/2]:W().bays[0];const B=AM.freeBay([b].concat(W().bays));const c=AM.spawnRec(r,B[0],B[1],B[2]);if(!AM.isMoto(r.t))bow(c);
    player.x=B[0]-3.2;player.z=B[1]+2.4;player.h=Math.atan2(B[0]-player.x,B[1]-player.z);camYaw=player.h;r.hist.unshift([Math.round(gameMin),'Remise des clés · plaque '+r.plate]);AM.save();
    confetti(B[0],B[1]);try{tone(660,.15,'triangle',.08);tone(990,.2,'triangle',.07,.15);tone(1320,.3,'triangle',.06,.3);}catch(e){}
    const who=r.line==='moto'?'rachid':r.line==='exclusive'?'selom':'yao';AM.say(who,'Félicitations ! Voici les clés de votre '+r.n+'. Plaque '+r.plate+', carte grise à votre nom. Bonne route !',6);
    setTimeout(()=>AM.dialog(who,'Les clés de votre '+r.n+' sont à vous. Elle est enregistrée à votre nom avec la plaque '+r.plate+', visible dans votre garage et sur la carte.',[['Prendre le volant',()=>{UI.close();enterCar(c);}, 'hot'],['Voir la carte grise',()=>AM.docs(r)],['Merci !',()=>UI.close(),'ghost']],r.line),700);});};
AM.isMoto=t=>t==='scooter'||t==='motorcycle';
/* ---------------- garage ---------------- */
const STL={out:'En circulation',garage:'Au garage',atelier:'À l’atelier',order:'En préparation',ready:'Prête · clés à retirer'};
AM.garage=function(){const vs=AM.villaSpot();UI.open({line:'prestige',eye:'Mon garage Aurore · '+ST.cars.length+' véhicule(s)',title:'Mes véhicules',body:b=>{if(!ST.cars.length){b.appendChild(h('p','am-dim','Votre garage est vide. Aurore Motors, Aurore Moto et Aurore Occasion vous attendent !'));return;}
  ST.cars.forEach(r=>{const c=h('div','am-veh');const hd=h('div','am-vh');const sw=h('i');sw.style.background='#'+(r.mods.color!=null?r.mods.color:r.color).toString(16).padStart(6,'0');hd.appendChild(sw);const tt=h('div');tt.appendChild(h('b',null,r.n));tt.appendChild(h('span',null,r.plate+' · '+STL[r.st]+' · '+Math.round(r.km*10)/10+' km'));hd.appendChild(tt);c.appendChild(hd);
    const g=h('div','am-grid');const car=AM.carOf(r),near=car&&Math.hypot(car.x-12,car.z+672)<45,nearV=car&&vs&&Math.hypot(car.x-vs[0],car.z-vs[1])<40;
    if(r.st==='garage'){g.appendChild(btn('Sortir à l’atelier',()=>{const B=AM.freeBay();AM.spawnRec(r,B[0],B[1],B[2]);AM.save();wp={x:B[0],z:B[1],l:r.n};UI.close();toast(r.n+' sortie devant l’atelier.','good');}));if(vs)g.appendChild(btn('Sortir à ma villa',()=>{AM.spawnRec(r,vs[0],vs[1],vs[2]);AM.save();wp={x:vs[0],z:vs[1],l:r.n};UI.close();toast(r.n+' garée devant '+vs[3]+'.','good');}));}
    if(r.st==='out'){g.appendChild(btn('Localiser',()=>{wp={x:car?car.x:r.loc.x,z:car?car.z:r.loc.z,l:r.n};UI.close();toast('Repère placé sur '+r.n+'.','good');}));
      g.appendChild(btn(near||nearV?'Ranger au garage':'Rapatrier au garage · '+fmt(40),()=>{if(!(near||nearV)&&!AM.pay(40,'Rapatriement '+r.n))return;AM.despawn(r);r.st='garage';AM.save();AM.garage();}));}
    if(r.st==='ready')g.appendChild(btn('Recevoir les clés',()=>AM.keys(),'hot'));
    g.appendChild(btn('Documents',()=>AM.docs(r)));if(r.st==='out'||r.st==='garage')g.appendChild(btn('Atelier',()=>AM.sav(r.id)));c.appendChild(g);b.appendChild(c);});}});};
AM.docs=function(r){const cr=ST.credits.find(c=>c.car===r.id),ls=ST.leases.find(l=>l.car===r.id);
  UI.open({line:r.line,eye:'Documents du véhicule',title:'Carte grise · '+r.plate,body:b=>{const s=h('div','am-sum am-doc');[['Titulaire',r.owner],['Véhicule',r.n],['Immatriculation',r.plate],['N° de série',r.vin],['Mise en circulation',AM.day(r.date)],['Kilométrage',(Math.round(r.km*10)/10)+' km'],['Contrat',cr?'Crédit · '+cr.left+' échéances restantes':ls?'Location jusqu’au '+AM.day(ls.until):'Propriété pleine']].forEach(([k,v])=>s.appendChild(row(k,v)));b.appendChild(s);
    sec(b,'Garanties');const g=h('div','am-sum');[['maker','Garantie constructeur'],['engine','Garantie moteur'],['panne','Assurance panne'],['assist','Assistance routière']].forEach(([k,l])=>g.appendChild(row(l,(r.war[k]||0)>gameMin?'Valide jusqu’au '+AM.day(r.war[k]):'—',(r.war[k]||0)>gameMin?'good':'')));b.appendChild(g);
    sec(b,'État');b.appendChild(bar('Moteur',r.cond.eng));b.appendChild(bar('Huile',r.cond.oil));b.appendChild(bar('Pneus',r.cond.tir));b.appendChild(bar('Carrosserie',r.cond.body));b.appendChild(bar('Propreté',r.cond.clean));
    sec(b,'Historique');const H=h('div','am-sum');r.hist.slice(0,8).forEach(x=>H.appendChild(row(AM.day(x[0]),x[1])));b.appendChild(H);}});};
/* ---------------- service après-vente ---------------- */
const free=(r,k)=>(r.war[k]||0)>gameMin;
const SV={entretien:[['Vidange',40,{'cond.oil':'max'},12],['Révision complète',120,{'cond.oil':'max','cond.eng':20,'cond.tir':10},20],['Pneus neufs',160,{'cond.tir':'max'},14],['Réparation moteur',260,{'cond.eng':'max'},24,'engine'],['Diagnostic électronique',30,{'cond.eng':5},8],['Carrosserie et débosselage',90,{'cond.body':'max',dmg:1},16,'panne']],
  nettoyage:[['Lavage extérieur',15,{'cond.clean':40},6],['Nettoyage intérieur',20,{'cond.clean':25},8],['Polissage et lustrage',45,{'cond.clean':'max'},12],['Nettoyage des sièges',25,{'cond.clean':20},8]]};
AM.sav=function(rid,tab,o){o=o||{};const L=ST.cars.filter(r=>r.st==='out'||r.st==='garage');if(!L.length){AM.dialog('yao','Je n’ai aucun de vos véhicules disponible. Achetez-en un ou attendez la fin des travaux en cours.',[['Voir l’atelier',()=>AM.tracker()],['OK',()=>UI.close(),'ghost']]);return;}
  const r=AM.recOf(rid)||L[0];tab=tab||'entretien';const car=AM.carOf(r),far=r.st==='out'&&(!car||Math.hypot(car.x-12,car.z+672)>60);const pickup=far?25:0;o.mods=o.mods||{};
  const run=(label,cost,apply,secs)=>{if(!AM.pay(cost+pickup,label+' · '+r.n))return;AM.despawn(r);r.st='atelier';AM.order(r,'service',label,['Réception du véhicule','Diagnostic',label,'Essai et contrôle final','Terminé'],secs,{apply,deliver:!!o.deliver});AM.save();
    AM.say('yao','C’est parti pour : '+label.toLowerCase()+'. Suivez l’avancement sur l’écran de l’atelier.');UI.close();toast('🔧 '+r.n+' prise en charge à l’atelier.','good');};
  UI.open({line:'prestige',eye:'Service après-vente · Atelier Aurore',title:r.n+' · '+r.plate,body:b=>{
    if(L.length>1){const s=h('div','am-list am-row-sel');L.forEach(x=>s.appendChild(btn((x===r?'✓ ':'')+x.n+' · '+x.plate,()=>AM.sav(x.id,tab),x===r?'on':'')));b.appendChild(s);}
    b.appendChild(seg([['entretien','Entretien'],['perso','Personnalisation'],['nettoyage','Nettoyage'],['garanties','Garanties']],tab,v=>AM.sav(r.id,v)));
    if(far)b.appendChild(h('p','am-dim','Véhicule loin de l’atelier : prise en charge par dépanneuse ('+fmt(pickup)+').'));
    b.appendChild(seg([[0,'Récupérer à l’atelier'],[1,'Me la livrer ensuite']],o.deliver?1:0,v=>AM.sav(r.id,tab,Object.assign(o,{deliver:!!v}))));
    if(tab==='entretien'||tab==='nettoyage'){sec(b,'État actuel');b.appendChild(bar('Moteur',r.cond.eng));b.appendChild(bar('Huile',r.cond.oil));b.appendChild(bar('Pneus',r.cond.tir));b.appendChild(bar('Carrosserie',r.cond.body));b.appendChild(bar('Propreté',r.cond.clean));
      const l=h('div','am-list');SV[tab].forEach(([n,c,a,s,w])=>{const cost=w&&free(r,w)?0:c;l.appendChild(btn(n+' · '+(cost?fmt(cost):'pris en garantie'),()=>run(n,cost,a,s)));});b.appendChild(l);}
    if(tab==='perso'){const M=Object.assign({},r.mods,o.mods);const moto=AM.isMoto(r.t);
      sec(b,'Peinture');const sw=h('div','am-sw');COLS.forEach(([c,n])=>{const x=h('button','am-swc'+(M.color===c?' on':''));x.type='button';x.title=n;x.style.background='#'+c.toString(16).padStart(6,'0');x.onclick=()=>{o.mods.color=c;AM.sav(r.id,'perso',o);};sw.appendChild(x);});b.appendChild(sw);
      if(!moto){b.appendChild(seg(AMC.FIN.map((f,i)=>[i,f.n]),M.fin||0,v=>{o.mods.fin=v;AM.sav(r.id,'perso',o);}));
        sec(b,'Jantes');b.appendChild(seg(AMC.RIMS.map((f,i)=>[i,f.n]),M.rim||0,v=>{o.mods.rim=v;AM.sav(r.id,'perso',o);}));
        sec(b,'Vitres');b.appendChild(seg(AMC.TINTS.map((f,i)=>[i,f.n]),M.tint||0,v=>{o.mods.tint=v;AM.sav(r.id,'perso',o);}));
        sec(b,'Sellerie');b.appendChild(seg(AMC.SEATS.map((f,i)=>[i,f.n]),M.seat||0,v=>{o.mods.seat=v;AM.sav(r.id,'perso',o);}));
        sec(b,'Éclairage intérieur');b.appendChild(seg(AMC.AMBI.map((f,i)=>[i,f.n]),M.amb||0,v=>{o.mods.amb=v;AM.sav(r.id,'perso',o);}));
        sec(b,'Plaque personnalisée');const inp=h('input','am-in');inp.maxLength=8;inp.placeholder=r.mods.plate||r.plate;inp.value=o.mods.plate||'';inp.oninput=()=>{o.mods.plate=inp.value.toUpperCase().replace(/[^A-Z0-9 ]/g,'').slice(0,8);};inp.onkeydown=e=>e.stopPropagation();b.appendChild(inp);}
      const pr={color:(o.mods.fin||0)>0?380:220,fin:0,rim:180,tint:90,seat:150,amb:70,plate:60};let cost=0;const ch=[];Object.keys(o.mods).forEach(k=>{if(o.mods[k]!==''&&o.mods[k]!==r.mods[k]&&o.mods[k]!=null){if(k==='fin'&&o.mods.color==null&&o.mods.fin!==r.mods.fin){cost+=160;ch.push('finition');}else if(pr[k]){cost+=pr[k];ch.push(k);}}});
      const s=h('div','am-sum');s.appendChild(row('Modifications',ch.length?ch.length+' choix':'aucune'));s.appendChild(row('Total',fmt(cost),'total'));b.appendChild(s);
      b.appendChild(btn('Confier la personnalisation · '+fmt(cost+pickup),()=>{const a={};Object.keys(o.mods).forEach(k=>{if(o.mods[k]!==''&&o.mods[k]!=null)a['mods.'+k]=o.mods[k];});run('Personnalisation',cost,a,10+ch.length*5);},'hot',!ch.length||!AM.afford(cost+pickup)));}
    if(tab==='garanties'){const p=AM.priceOf(r);[['engine','Garantie moteur · 30 jours',Math.round(p*.04)],['panne','Assurance panne · 30 jours',Math.round(p*.03)],['assist','Assistance routière 24/7 · 30 jours',120],['maker','Extension constructeur · 60 jours',Math.round(p*.05)]].forEach(([k,n,c])=>{
      const x=h('div','am-veh');x.appendChild(row(n,free(r,k)?'Active · '+AM.day(r.war[k]):'Inactive',free(r,k)?'good':''));x.appendChild(btn((free(r,k)?'Prolonger · ':'Souscrire · ')+fmt(c),()=>{if(AM.pay(c,n+' · '+r.n)){r.war[k]=Math.max(r.war[k]||0,gameMin)+(k==='maker'?60:30)*1440;AM.save();AM.sav(r.id,'garanties');toast(n+' activée.','good');}},'',!AM.afford(c)));b.appendChild(x);});}
  }});};
/* ---------------- occasions ---------------- */
const NAMES=['Kofi A.','Awa D.','Jean-Marc L.','Fatou S.','Ibrahim T.','Sena K.','Paul M.','Aïcha B.'];
function genOcc(){const pool=['lumi','lagune','prestige','titan','coupe','atlas'].map(i=>({m:i})).concat(['honda','hyundai','toyota','ford','bmw','benz','porsche'].map(t=>({t})));
  const e=pick(pool),m=e.m?byId[e.m]:null,base=m?m.p:AM.priceOf({t:e.t}),km=Math.round(rand(8,160)),cond=Math.round(rand(55,95));
  return {id:'u'+(ST.seq++),m:m?m.id:null,t:m?m.t:e.t,n:m?m.n:AM.priceOf({t:e.t})&&({honda:'Honda Civic',hyundai:'Hyundai Tucson',toyota:'Toyota Land Cruiser',ford:'Ford Mustang GT',bmw:'BMW M5',benz:'Mercedes Classe S',porsche:'Porsche 911'})[e.t],color:pick(COLS)[0],km,cond,price:Math.round(base*Math.max(.38,.82-km/500)*(.55+.45*cond/100)/10)*10,year:2016+Math.floor(rand(0,9))};}
AM.refreshOcc=function(){while(ST.occ.length<6)ST.occ.push(genOcc());while(ST.p2p.length<4){const u=genOcc();u.seller=pick(NAMES);u.price=Math.round(u.price*rand(.88,1.05)/10)*10;ST.p2p.push(u);}AM.save();
  W().displays.filter(d=>d.occ).forEach(d=>{scene.remove(d.m);const i=AMC.extra.indexOf(d.m);if(i>=0)AMC.extra.splice(i,1);W().displays.splice(W().displays.indexOf(d),1);});
  W().spots.filter(s=>String(s.id).startsWith('am:show:o')).forEach(s=>{scene.remove(s.b);scene.remove(s.ring);spots.splice(spots.indexOf(s),1);});
  ST.occ.slice(0,W().occSlots.length).forEach((u,k)=>{const p=W().occSlots[k];const m=makeCar(u.color,u.t);try{applyType(m,u.t);}catch(e){}m.position.set(p[0],0,p[1]);m.rotation.y=p[2];scene.add(m);AMC.rig(m);(AMC.extra=AMC.extra||[]).push(m);
    const d={m,model:{n:u.n,line:'occasion'},color:u.color,x:p[0],z:p[1],line:'occasion',occ:u.id,slot:'o'+k};W().displays.push(d);
    const s=AM.spot(p[0],p[1]+(p[2]?-4.2:4.2),'am:show:o'+k,0x58d68d,u.n+' · '+fmt(u.price),{indoor:1});W().spots.push(s);});};
const _os=openSpot;openSpot=function(id){if(typeof id==='string'&&id.startsWith('am:show:o')){const d=W().displays.find(q=>q.slot===id.slice(8));if(d)AM.occSheet(d);return;}return _os(id);};
AM.occSheet=function(d){const u=ST.occ.find(x=>x.id===d.occ);if(!u)return;const st=d.m.userData.rig33&&d.m.userData.rig33.state;
  UI.open({line:'occasion',eye:'Aurore Occasion · garantie 15 jours',title:u.n,body:b=>{const t=h('div','am-price');t.appendChild(h('strong',null,fmt(u.price)));t.appendChild(h('span',null,u.year+' · '+u.km+' 000 km · état '+u.cond+' %'));b.appendChild(t);
    b.appendChild(bar('État général',u.cond));b.appendChild(h('p','am-dim','Contrôlée 80 points, carnet d’entretien, carte grise à votre nom. Reprise de votre véhicule possible.'));
    if(st){const g=h('div','am-grid');g.appendChild(btn((st.doors?'Fermer':'Ouvrir')+' les portières',()=>{st.doors=st.doors?0:1;AM.occSheet(d);}));g.appendChild(btn((st.hood?'Fermer':'Ouvrir')+' le capot',()=>{st.hood=st.hood?0:1;AM.occSheet(d);}));g.appendChild(btn('Tourner autour',()=>AM.view('orbit',d)));b.appendChild(g);}
  },actions:[{label:'Essai',fn:()=>AM.askTest({id:u.id,t:u.t,n:u.n,line:'occasion',col:[0]},null,u.color)},{label:'Acheter · '+fmt(u.price),cls:'hot',off:!AM.afford(u.price),fn:()=>{if(!AM.pay(u.price,'Achat occasion '+u.n))return;
    const r=AM.newRec(u.m?byId[u.m]:null,u.color,'occasion',u.t,'out');r.n=u.n;r.line='occasion';r.price=u.price;r.km=u.km;r.cond={eng:u.cond,oil:u.cond,tir:u.cond,body:u.cond,clean:u.cond};r.war={maker:Math.round(gameMin)+15*1440};r.hist=[[Math.round(gameMin),'Achat chez Aurore Occasion']];ST.cars.push(r);ST.bought++;ST.vip=1;
    ST.occ=ST.occ.filter(x=>x!==u);scene.remove(d.m);const p=[d.x,d.z,d.m.rotation.y];AM.refreshOcc();const c=AM.spawnRec(r,p[0],p[1],p[2]);AM.save();UI.close();
    AM.say('mamadou','Affaire conclue ! Voici les clés de la '+u.n+', plaque '+r.plate+'. Elle est contrôlée et garantie 15 jours.',6);toast('🔑 '+u.n+' · plaque '+r.plate,'good');}}]});};
AM.occasion=function(tab){tab=tab||'acheter';UI.open({line:'occasion',eye:'Aurore Occasion · Mamadou Sow',title:'Achat, vente et reprise',body:b=>{
  b.appendChild(AM.seg([['acheter','Sur le parc'],['p2p','Entre particuliers'],['vendre','Vendre ma voiture'],['annonces','Mes annonces ('+ST.ads.length+')']],tab,v=>AM.occasion(v)));
  if(tab==='acheter'){const l=h('div','am-list');ST.occ.forEach(u=>{const d=W().displays.find(q=>q.occ===u.id);l.appendChild(btn(u.n+' · '+u.year+' · '+u.km+' 000 km · '+fmt(u.price),()=>d?AM.occSheet(d):null));});b.appendChild(l);}
  if(tab==='p2p'){b.appendChild(h('p','am-dim','Annonces de particuliers. Transaction sécurisée par Aurore Occasion, livraison sur notre parc.'));const l=h('div','am-list');ST.p2p.forEach(u=>l.appendChild(btn(u.seller+' vend '+u.n+' · '+u.km+' 000 km · '+fmt(u.price),()=>{
      if(!AM.pay(u.price+40,'Achat entre particuliers '+u.n+' (frais 40)'))return;const r=AM.newRec(u.m?byId[u.m]:null,u.color,'occasion',u.t);r.n=u.n;r.line='occasion';r.price=u.price;r.km=u.km;r.cond={eng:u.cond,oil:u.cond,tir:u.cond,body:u.cond,clean:u.cond};r.war={};ST.cars.push(r);ST.p2p=ST.p2p.filter(x=>x!==u);
      AM.order(r,'service','Transfert depuis '+u.seller,['Signature électronique','Contrôle 80 points','Transfert de carte grise','Livraison sur le parc','Terminé'],25,{});r.st='atelier';AM.refreshOcc();AM.save();AM.say('mamadou','C’est signé avec '+u.seller+'. On contrôle la voiture et on vous la livre ici.');AM.occasion('p2p');},'',!AM.afford(u.price+40))));b.appendChild(l);}
  if(tab==='vendre'){const L=ST.cars.filter(r=>r.st==='out'||r.st==='garage');if(!L.length)b.appendChild(h('p','am-dim','Aucun véhicule disponible à la vente.'));
    L.forEach(r=>{const cr=ST.credits.find(c=>c.car===r.id),ls=ST.leases.find(l=>l.car===r.id),v=AM.value(r),offer=Math.round(v*.85),owed=cr?cr.monthly*cr.left:0;const x=h('div','am-veh');x.appendChild(row(r.n+' · '+r.plate,'Cote '+fmt(v)));
      if(ls){x.appendChild(h('p','am-dim','Véhicule en location : impossible à vendre.'));b.appendChild(x);return;}
      x.appendChild(btn('Vendre à Aurore Occasion · '+fmt(offer-owed)+(owed?' (crédit soldé)':''),()=>{if(offer-owed<0){toast('Le crédit restant dépasse l’offre.','bad');return;}AM.despawn(r);ST.cars=ST.cars.filter(q=>q!==r);if(cr)ST.credits=ST.credits.filter(q=>q!==cr);ST.ads=ST.ads.filter(a=>a.car!==r.id);AM.earn(offer-owed,'Vente '+r.n+' à Aurore Occasion');AM.save();AM.say('mamadou','Vendu ! '+fmt(offer-owed)+' virés sur votre compte.');AM.occasion('vendre');},'',offer-owed<0));
      if(!ST.ads.some(a=>a.car===r.id))x.appendChild(AM.seg([[1,'Annonce '+fmt(v)],[1.1,fmt(Math.round(v*1.1))],[1.25,fmt(Math.round(v*1.25))]],0,k=>{ST.ads.push({car:r.id,price:Math.round(v*k),since:Math.round(gameMin),offers:[]});AM.save();toast('Annonce publiée : '+r.n+'.','good');AM.occasion('annonces');}));b.appendChild(x);});}
  if(tab==='annonces'){if(!ST.ads.length)b.appendChild(h('p','am-dim','Aucune annonce. Publiez-en une depuis « Vendre ma voiture ».'));ST.ads.forEach(a=>{const r=AM.recOf(a.car);if(!r)return;const x=h('div','am-veh');x.appendChild(row(r.n,'Prix demandé '+fmt(a.price)));
    if(!a.offers.length)x.appendChild(h('p','am-dim','En attente d’acheteurs… les offres arrivent au fil des heures.'));a.offers.forEach(of=>{x.appendChild(btn(of.who+' propose '+fmt(of.p)+' · accepter',()=>{const cr=ST.credits.find(c=>c.car===r.id),owed=cr?cr.monthly*cr.left:0;if(of.p-owed<0){toast('L’offre ne couvre pas le crédit.','bad');return;}
      AM.despawn(r);ST.cars=ST.cars.filter(q=>q!==r);if(cr)ST.credits=ST.credits.filter(q=>q!==cr);ST.ads=ST.ads.filter(q=>q!==a);AM.earn(of.p-owed,'Vente '+r.n+' à '+of.who);AM.save();toast('Vendu à '+of.who+' : '+fmt(of.p-owed),'good');AM.occasion('annonces');},'hot'));});
    x.appendChild(btn('Retirer l’annonce',()=>{ST.ads=ST.ads.filter(q=>q!==a);AM.save();AM.occasion('annonces');},'ghost'));b.appendChild(x);});}}});};
let mk=0;AM.marketTick=function(){mk++;if(mk%20)return;ST.ads.forEach(a=>{const r=AM.recOf(a.car);if(!r)return;const v=AM.value(r),ratio=a.price/v;if(a.offers.length<3&&Math.random()<(ratio<1.05?.5:ratio<1.15?.3:.15)){const p=Math.round(a.price*rand(.86,1.0)/10)*10;a.offers.push({who:pick(NAMES),p});AM.note('💬 Nouvelle offre pour votre '+r.n+' : '+fmt(p)+' (appli Véhicules ou Aurore Occasion).');}});
  if(gameMin-(ST.occT||0)>2*1440){ST.occT=Math.round(gameMin);ST.p2p=ST.p2p.slice(2);AM.refreshOcc();}AM.save();};
})();
