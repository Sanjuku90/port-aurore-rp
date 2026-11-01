'use strict';
/* v33 · interface Aurore Motors : fiches, comparateur, achat, dialogues, bureaux */
(function(){
const AM=window.AM,ST=AM.ST,byId=AM.byId,LINES=AM.LINES,COLS=AM.COLS;
const h=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;};
const btn=(label,fn,cls,off)=>{const b=h('button','am-b'+(cls?' '+cls:''),label);b.type='button';b.disabled=!!off;b.onclick=e=>{e.stopPropagation();fn&&fn();};return b;};
const hex=c=>'#'+c.toString(16).padStart(6,'0');
/* ---------------- coque de l'interface ---------------- */
const root=h('div');root.id='am33';root.hidden=true;root.innerHTML='<div class="am-scrim"></div><section class="am-sheet" role="dialog" aria-modal="true"><header class="am-hd"><div class="am-tt"><small class="am-eye"></small><h2 class="am-title"></h2></div><button type="button" class="am-x" aria-label="Fermer">✕</button></header><div class="am-body"></div><footer class="am-ft"></footer></section>';
(document.getElementById('hud')||document.body).appendChild(root);
const $s=q=>root.querySelector(q);
const UI=AM.UI={stack:[]};
UI.open=function(o){UI.cur=o;root.hidden=false;panelOpen=true;const sh=$s('.am-sheet');sh.style.setProperty('--am',LINES[o.line||'prestige'].c);sh.dataset.line=o.line||'prestige';
  $s('.am-eye').textContent=o.eye||LINES[o.line||'prestige'].n;$s('.am-title').textContent=o.title||'';const b=$s('.am-body');b.innerHTML='';b.scrollTop=0;if(o.body)o.body(b);
  const f=$s('.am-ft');f.innerHTML='';(o.actions||[]).forEach(a=>{if(a)f.appendChild(btn(a.label,a.fn,a.cls||'',a.off));});f.hidden=!(o.actions&&o.actions.length);};
UI.close=function(keep){root.hidden=true;panelOpen=false;if(!keep&&AM.engineStop)AM.engineStop();if(UI.onClose){const f=UI.onClose;UI.onClose=null;f();}};
UI.refresh=()=>{if(UI.cur&&!root.hidden)UI.open(UI.cur);};
$s('.am-x').onclick=()=>UI.close();$s('.am-scrim').onclick=()=>UI.close();
const _cp=closePanel;closePanel=function(){_cp();if(!root.hidden)UI.close();};
/* blocs réutilisables */
const row=(k,v,cls)=>{const r=h('div','am-row'+(cls?' '+cls:''));r.appendChild(h('span',null,k));r.appendChild(h('b',null,v));return r;};
const bar=(label,v,warnAt)=>{const r=h('div','am-bar');r.appendChild(h('span',null,label));const i=h('i');const u=h('u');u.style.width=Math.max(0,Math.min(100,v))+'%';if(v<(warnAt||25))u.className='low';i.appendChild(u);r.appendChild(i);r.appendChild(h('em',null,Math.round(v)+' %'));return r;};
const sec=(b,t)=>b.appendChild(h('h3','am-sec',t));
const seg=(opts,cur,fn)=>{const s=h('div','am-seg');opts.forEach(([v,l])=>{const x=btn(l,()=>fn(v),v===cur?'on':'');x.setAttribute('aria-pressed',v===cur);s.appendChild(x);});return s;};
const swatches=(list,cur,fn)=>{const s=h('div','am-sw');list.forEach(ci=>{const c=COLS[ci],x=h('button','am-swc'+(c[0]===cur?' on':''));x.type='button';x.title=c[1];x.setAttribute('aria-label',c[1]);x.style.background=hex(c[0]);x.onclick=()=>fn(c[0]);s.appendChild(x);});return s;};
AM.h=h;AM.btn=btn;AM.row=row;AM.bar=bar;AM.sec=sec;AM.seg=seg;
/* ---------------- dialogues ---------------- */
AM.say=function(key,text,secs){const s=AM.W.staff[key];if(s){say(s.m,text,secs||4.5);s.face=performance.now()*.001+6;}addChat(s?s.name.split(' ')[0]:'Aurore Motors',text);};
AM.dialog=function(key,text,choices,line){const s=AM.W.staff[key]||{name:'Aurore Motors',role:''};AM.say(key,text);
  UI.open({line:line||(s.line)||'prestige',eye:s.role,title:s.name,body:b=>{const c=h('div','am-dlg');const av=h('div','am-av',s.name.split(' ').map(w=>w[0]).join('').slice(0,2));c.appendChild(av);c.appendChild(h('p','am-bub',text));b.appendChild(c);
    const l=h('div','am-choices');choices.forEach(ch=>{if(ch)l.appendChild(btn(ch[0],ch[1],ch[2]||'',ch[3]));});b.appendChild(l);}});};
/* ---------------- catalogue ---------------- */
AM.catalog=function(line){const L=LINES[line],list=AM.MODELS.filter(m=>m.line===line);
  UI.open({line,eye:L.s,title:L.n,body:b=>{const g=h('div','am-cards');list.forEach(m=>{const c=h('button','am-card');c.type='button';const left=AM.stockLeft(m);
      const top=h('div','am-ct');top.appendChild(h('small',null,m.g));top.appendChild(h('b',null,m.n));c.appendChild(top);
      const sp=h('div','am-cs');sp.appendChild(h('span',null,m.vmax+' km/h'));sp.appendChild(h('span',null,m.ch+' ch'));sp.appendChild(h('span',null,m.seats+' pl.'));c.appendChild(sp);
      const pr=h('div','am-cp');pr.appendChild(h('strong',null,fmt(AM.netPrice(m))));if(left!=null)pr.appendChild(h('em',null,left?left+' en stock':'Épuisé'));c.appendChild(pr);
      c.onclick=()=>AM.sheet(m.id);g.appendChild(c);});b.appendChild(g);
    if(ST.cmp.length)b.appendChild(btn('Comparer '+ST.cmp.length+' modèle(s)',()=>AM.compare(),'ghost'));}});};
AM.stockLeft=m=>m.stock==null?null:Math.max(0,m.stock-(ST.stock[m.id]||0));
AM.deal=m=>{const d=ST.deals[m.id];return d&&d.until>gameMin?d.pct:0;};
AM.netPrice=m=>Math.round(m.p*(1-AM.deal(m)/100));
/* ---------------- fiche technique ---------------- */
AM.sheet=function(id,disp){const m=byId[id];if(!m)return;const d=disp||AM.W.displays.find(q=>q.model===m);const st=d&&d.m.userData.rig33?d.m.userData.rig33.state:null;const left=AM.stockLeft(m),deal=AM.deal(m);
  UI.open({line:m.line,eye:LINES[m.line].n+' · '+m.g+' · '+m.seats+' places',title:m.n,body:b=>{
    const top=h('div','am-price');top.appendChild(h('strong',null,fmt(AM.netPrice(m))));const sub=h('span',null,left===0?'Édition épuisée':deal?'Remise négociée −'+deal+' % appliquée':'Disponible à l’achat'+(left!=null?' · '+left+' exemplaire(s)':''));top.appendChild(sub);
    top.appendChild(h('em',null,'ou dès '+fmt(Math.ceil(AM.netPrice(m)*.75*1.05/10))+' × 10 échéances'));b.appendChild(top);
    b.appendChild(h('p','am-desc',m.desc));
    const sp=h('div','am-specs');[['Vitesse maximale',m.vmax+' km/h'],['0 à 100 km/h',m.acc.toFixed(1).replace('.',',')+' s'],['Puissance',m.ch+' ch'],['Transmission',m.tr],['Coffre',m.cof?m.cof+' L':'—'],['Énergie',m.en]].forEach(([k,v])=>sp.appendChild(row(k,v)));b.appendChild(sp);
    if(d&&!m.moto){sec(b,'Teinte exposée');b.appendChild(swatches(m.col,d.color,c=>{AM.recolorDisplay(d,c);AM.sheet(id,d);}));}
    if(d){sec(b,'Découvrir le véhicule');const g=h('div','am-grid');
      if(st){g.appendChild(btn((st.doors?'Fermer':'Ouvrir')+' les portières',()=>{st.doors=st.doors?0:1;AM.sheet(id,d);},st.doors?'on':''));
        g.appendChild(btn((st.hood?'Fermer':'Ouvrir')+' le capot',()=>{st.hood=st.hood?0:1;AM.sheet(id,d);},st.hood?'on':''));
        g.appendChild(btn((st.trunk?'Fermer':'Ouvrir')+' le coffre',()=>{st.trunk=st.trunk?0:1;AM.sheet(id,d);},st.trunk?'on':''));}
      g.appendChild(btn('Tourner autour · 360°',()=>AM.view('orbit',d)));if(st)g.appendChild(btn('Regarder l’intérieur',()=>AM.view('inside',d)));if(st)g.appendChild(btn('S’asseoir au volant',()=>AM.view('seat',d)));
      g.appendChild(btn(AM.engineOn?'Couper le moteur':'Démarrer le moteur',()=>{AM.engineToggle(m,d);AM.sheet(id,d);},AM.engineOn?'on':''));
      b.appendChild(g);}
    const inC=ST.cmp.includes(id);b.appendChild(btn(inC?'✓ Dans le comparateur':'+ Ajouter au comparateur',()=>{if(inC)ST.cmp=ST.cmp.filter(x=>x!==id);else{ST.cmp.push(id);if(ST.cmp.length>3)ST.cmp.shift();}AM.save();AM.sheet(id,d);},'ghost'));
    if(ST.cmp.length>1)b.appendChild(btn('Voir la comparaison ('+ST.cmp.length+')',()=>AM.compare(),'ghost'));
  },actions:[{label:'Faire un essai',fn:()=>AM.askTest(m,d),off:!!AM.testDrive},{label:left===0?'Épuisé':'Acheter',fn:()=>AM.buy(m.id,d?d.color:COLS[m.col[0]][0]),cls:'hot',off:left===0}]});};
/* ---------------- comparateur ---------------- */
AM.compare=function(){const L=ST.cmp.map(i=>byId[i]).filter(Boolean);if(!L.length){toast('Ajoute des modèles au comparateur depuis leur fiche.','warn');return;}
  const rows=[['Prix',m=>AM.netPrice(m),fmt,'min'],['Vitesse max',m=>m.vmax,v=>v+' km/h','max'],['0 à 100',m=>m.acc,v=>v.toFixed(1).replace('.',',')+' s','min'],['Puissance',m=>m.ch,v=>v+' ch','max'],['Coffre',m=>m.cof,v=>v?v+' L':'—','max'],['Places',m=>m.seats,v=>v,'max'],['Transmission',m=>m.tr,v=>v,null]];
  UI.open({line:L[0].line,eye:'Comparateur',title:L.length+' modèles côte à côte',body:b=>{const t=h('div','am-cmp');t.style.setProperty('--n',L.length);t.appendChild(h('span'));L.forEach(m=>{const x=btn(m.n,()=>AM.sheet(m.id),'am-cmph');t.appendChild(x);});
    rows.forEach(([k,f,fm,best])=>{t.appendChild(h('span','am-cmpk',k));const vals=L.map(f);const bv=best==='max'?Math.max(...vals):best==='min'?Math.min(...vals):null;L.forEach((m,i)=>t.appendChild(h('b',best&&vals[i]===bv&&L.length>1?'best':'',fm(vals[i]))));});b.appendChild(t);
    b.appendChild(btn('Vider le comparateur',()=>{ST.cmp=[];AM.save();UI.close();},'ghost'));}});};
/* ---------------- achat ---------------- */
const ADDONS=[['engine','Garantie moteur · 30 jours',m=>Math.round(m.p*.04)],['panne','Assurance panne · 30 jours',m=>Math.round(m.p*.03)],['assist','Assistance routière 24/7 · 30 jours',()=>120]];
AM.buy=function(id,color,o){const m=byId[id];if(!m)return;o=Object.assign({mode:'cash',down:25,n:10,trade:null,lease:7,add:{},color},o||{});const deal=AM.deal(m);
  const tradeRec=o.trade?AM.recOf(o.trade):null,tradeV=tradeRec?AM.value(tradeRec):0,add=ADDONS.filter(a=>o.add[a[0]]).reduce((s,a)=>s+a[2](m),0),base=AM.netPrice(m);
  const financed=Math.max(0,base-tradeV),downAmt=Math.round(financed*o.down/100),loan=financed-downAmt,interest=Math.round(loan*.005*o.n),monthly=Math.ceil((loan+interest)/o.n);
  const leaseDaily=Math.round(m.p*(o.lease===7?.012:.008)),leaseDep=Math.round(m.p*.1);
  const now=o.mode==='cash'?financed+add:o.mode==='credit'?downAmt+add:leaseDep+leaseDaily+add;
  const mine=ST.cars.filter(r=>r.st!=='order'&&!ST.credits.some(c=>c.car===r.id)&&!ST.leases.some(l=>l.car===r.id));
  UI.open({line:m.line,eye:'Bon de commande · '+LINES[m.line].n,title:m.n,body:b=>{
    sec(b,'Teinte');b.appendChild(swatches(m.col,o.color,c=>AM.buy(id,c,Object.assign(o,{color:c}))));
    sec(b,'Mode de paiement');b.appendChild(seg([['cash','Comptant'],['credit','Crédit auto'],['lease','Location LD']],o.mode,v=>AM.buy(id,o.color,Object.assign(o,{mode:v}))));
    if(o.mode==='credit'){sec(b,'Acompte');b.appendChild(seg([[20,'20 %'],[25,'25 %'],[40,'40 %']],o.down,v=>AM.buy(id,o.color,Object.assign(o,{down:v}))));sec(b,'Durée (1 mois = 1 jour de jeu)');b.appendChild(seg([[6,'6 mois'],[10,'10 mois'],[24,'24 mois']],o.n,v=>AM.buy(id,o.color,Object.assign(o,{n:v}))));}
    if(o.mode==='lease'){sec(b,'Durée de location');b.appendChild(seg([[7,'7 jours'],[30,'30 jours']],o.lease,v=>AM.buy(id,o.color,Object.assign(o,{lease:v}))));}
    if(o.mode!=='lease'){sec(b,'Reprise de mon véhicule');if(!mine.length)b.appendChild(h('p','am-dim','Aucun véhicule libre de crédit à faire reprendre.'));else{const s=h('div','am-list');mine.forEach(r=>s.appendChild(btn((o.trade===r.id?'✓ ':'')+r.n+' · '+r.plate+' · estimée '+fmt(AM.value(r)),()=>AM.buy(id,o.color,Object.assign(o,{trade:o.trade===r.id?null:r.id})),o.trade===r.id?'on':'')));b.appendChild(s);}}
    sec(b,'Garanties et services');const s=h('div','am-list');ADDONS.forEach(a=>s.appendChild(btn((o.add[a[0]]?'✓ ':'+ ')+a[1]+' · '+fmt(a[2](m)),()=>{o.add[a[0]]=!o.add[a[0]];AM.buy(id,o.color,o);},o.add[a[0]]?'on':'')));b.appendChild(s);
    b.appendChild(h('p','am-dim','Inclus : garantie constructeur 60 jours, plaque d’immatriculation, carte grise à votre nom, préparation et livraison à l’atelier.'));
    const sum=h('div','am-sum');sum.appendChild(row('Prix catalogue',fmt(m.p)));if(deal)sum.appendChild(row('Remise négociée','−'+deal+' %','good'));if(tradeV)sum.appendChild(row('Reprise '+tradeRec.n,'−'+fmt(tradeV),'good'));if(add)sum.appendChild(row('Garanties',fmt(add)));
    if(o.mode==='credit'){sum.appendChild(row('Acompte ('+o.down+' %)',fmt(downAmt)));sum.appendChild(row('Mensualités',o.n+' × '+fmt(monthly)));sum.appendChild(row('Coût du crédit',fmt(interest)));}
    if(o.mode==='lease'){sum.appendChild(row('Dépôt de garantie',fmt(leaseDep)));sum.appendChild(row('Loyer',fmt(leaseDaily)+' / jour · '+o.lease+' jours'));sum.appendChild(row('Option d’achat en fin de contrat',fmt(Math.round(m.p*.55))));}
    sum.appendChild(row('À payer aujourd’hui',fmt(now),'total'));sum.appendChild(row('Votre solde',fmt(state.cash+state.bank),afford(now)?'':'bad'));b.appendChild(sum);
  },actions:[{label:'Retour à la fiche',fn:()=>AM.sheet(id),cls:'ghost'},{label:'Signer · '+fmt(now),cls:'hot',off:!AM.afford(now),fn:()=>AM.sign(m,o,{now,downAmt,loan,interest,monthly,leaseDaily,tradeRec,add})}]});};
const afford=AM.afford;
AM.sign=function(m,o,q){if(!AM.pay(q.now,'Achat '+m.n+(o.mode==='credit'?' · acompte':o.mode==='lease'?' · location':'')))return;
  if(q.tradeRec){AM.despawn(q.tradeRec);ST.cars=ST.cars.filter(r=>r!==q.tradeRec);}
  const r=AM.newRec(m,o.color,o.mode);ADDONS.forEach(a=>{if(o.add[a[0]])r.war[a[0]]=Math.round(gameMin)+30*1440;});r.hist=[[Math.round(gameMin),'Achat '+({cash:'comptant',credit:'à crédit',lease:'location longue durée'})[o.mode]+' chez '+LINES[m.line].n]];
  ST.cars.push(r);if(m.stock!=null)ST.stock[m.id]=(ST.stock[m.id]||0)+1;delete ST.deals[m.id];
  if(o.mode==='credit')ST.credits.push({id:'c'+(ST.seq++),car:r.id,label:m.n,monthly:q.monthly,left:o.n,n:o.n,due:Math.round(gameMin)+1440,total:q.loan+q.interest});
  if(o.mode==='lease')ST.leases.push({id:'l'+(ST.seq++),car:r.id,daily:q.leaseDaily,until:Math.round(gameMin)+o.lease*1440,due:Math.round(gameMin)+1440,option:Math.round(m.p*.55)});
  ST.bought++;if(ST.bought>=1)ST.vip=1;state.rep+=m.p>8000?3:1;
  AM.order(r,'delivery','Livraison '+m.n,['Commande validée','Préparation esthétique','Contrôle qualité 120 points','Immatriculation · '+r.plate,'Prête · remise des clés'],m.moto?30:60);
  try{window.V31&&V31.biz&&V31.biz.carSold&&V31.biz.carSold({p:m.p,n:m.n,t:m.t});}catch(e){}
  AM.save();if(typeof saveProgress==='function')saveProgress();
  const who=LINES[m.line].staff;AM.dialog(who,'Félicitations ! Votre '+m.n+' est commandée. Plaque '+r.plate+'. Suivez la préparation en direct sur l’écran du showroom ou dans l’appli Véhicules, puis venez chercher les clés à l’atelier.',[['Suivre ma commande',()=>AM.tracker()],['Attendre au salon VIP',()=>{UI.close();AM.goVip();}],['Parfait, merci !',()=>UI.close(),'ghost']],m.line);};
/* ---------------- suivi des commandes ---------------- */
AM.tracker=function(){UI.open({line:'prestige',eye:'Suivi en direct',title:'Mes commandes Aurore',body:b=>{if(!ST.orders.length){b.appendChild(h('p','am-dim','Aucune commande en cours.'));return;}
  ST.orders.forEach(q=>{const r=AM.recOf(q.car);const c=h('div','am-track');c.appendChild(h('b',null,q.label+(r?' · '+r.plate:'')));const st=h('ol','am-steps');q.steps.forEach((s,i)=>{const li=h('li',i<q.i||q.ready?'done':i===q.i?'now':'',s);st.appendChild(li);});c.appendChild(st);
    const p=Math.min(100,q.t/q.d*100);c.appendChild(bar(q.ready?'Prête':'Avancement',p,0));if(q.ready&&q.kind==='delivery')c.appendChild(btn('Aller à la remise des clés',()=>{UI.close();wp={x:12,z:-667,l:'Remise des clés · Atelier Aurore'};toast('Repère placé sur l’atelier Aurore.','good');},'hot'));b.appendChild(c);});
  setTimeout(()=>{if(UI.cur&&UI.cur.title==='Mes commandes Aurore'&&!root.hidden)AM.tracker();},1000);}});};
})();
