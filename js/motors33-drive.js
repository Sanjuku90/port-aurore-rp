'use strict';
/* v33 · essais, piste chronométrée, vues 360°/intérieur/volant, moteur, commandes, HUD, écrans, téléphone */
(function(){
const AM=window.AM,ST=AM.ST,byId=AM.byId,LINES=AM.LINES,COLS=AM.COLS,UI=AM.UI,h=AM.h,btn=AM.btn,row=AM.row,bar=AM.bar,sec=AM.sec;
const W=()=>AM.W;const COARSE=matchMedia('(pointer: coarse)').matches;
const mmss=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
/* ---------------- HUD ---------------- */
const hud=document.createElement('div');hud.id='am33hud';(document.getElementById('hud')||document.body).appendChild(hud);
const vbar=document.createElement('div');vbar.id='am33bar';vbar.hidden=true;(document.getElementById('hud')||document.body).appendChild(vbar);
let hudT=0;AM.tickHud=function(dt){hudT-=dt;if(hudT>0)return;hudT=.25;const P=[];const T=AM.testDrive;
  if(T)P.push('<b>🏁 Essai · '+T.n+'</b><span>'+mmss(Math.max(0,T.t))+'</span><em>'+(T.t<30?'Retour à la concession':'Piste d’essai derrière le showroom')+'</em>');
  const L=AM.lap;if(L&&L.on)P.push('<b>⏱️ Tour en cours</b><span>'+L.time.toFixed(1).replace('.',',')+' s</span><em>Point '+L.next+'/4</em>');
  const q=ST.orders.find(o=>!o.ready);if(q&&started&&!AM.testDrive)P.push('<b>🔧 '+q.label+'</b><span>'+Math.round(Math.min(100,q.t/q.d*100))+' %</span><em>'+q.steps[q.i]+'</em>');
  const rd=ST.orders.find(o=>o.ready&&o.kind==='delivery');if(rd&&!q)P.push('<b>🔑 Voiture prête</b><span>Atelier Aurore</span><em>Remise des clés</em>');
  const html=P.map(p=>'<div class="am-pill">'+p+'</div>').join('');if(hud.innerHTML!==html)hud.innerHTML=html;};
/* ---------------- essais routiers ---------------- */
const ORIG={prestige:[-40,-648,Math.PI/2,-40,-650],moto:[-262,-716,Math.PI/2,-262,-720],occasion:[-195,-716,Math.PI/2,-177,-744],exclusive:[55,-716,Math.PI/2,55,-718]};
AM.askTest=function(m,d,color){if(AM.testDrive){toast('Un essai est déjà en cours.','warn');return;}if(player.car){toast('Descends d’abord de ton véhicule.','warn');return;}
  const who=LINES[m.line].staff,col=color!=null?color:d?d.color:COLS[(m.col||[0])[0]][0];
  AM.dialog(who,pick(['Excellent choix ! Je vous prépare la '+m.n+' devant l’entrée. Vous avez 3 minutes : la piste d’essai est juste derrière.','Avec plaisir. Permis vérifié, la '+m.n+' vous attend dehors, plein fait. 3 minutes, et ramenez-la-moi entière !']),[
    ['C’est parti !',()=>{UI.close();AM.startTest(m,col);},'hot'],['Pas maintenant',()=>UI.close(),'ghost']],m.line);};
AM.startTest=function(m,col){const o=ORIG[m.line]||ORIG.prestige;V31.fadeDo(()=>{const c=addCar(o[0],o[1],o[2],col,'parked',m.t);c.fuel=100;c.test33=true;if(m.top)c.top=m.top;if(c.mesh.userData.chassis){AMC.rig(c.mesh);AMC.apply(c.mesh,{plate:'ESSAI',rim:m.rim||0});}
  AM.testDrive={c,m,n:m.n,t:180,o,line:m.line};enterCar(c);wp={x:-90,z:-719,l:'Piste d’essai Aurore'};toast('Essai de la '+m.n+' : 3 minutes. Repère placé sur la piste.','good');});};
function endTest(early){const T=AM.testDrive;if(!T)return;AM.testDrive=null;const back=()=>{if(player.car===T.c){T.c.v=0;exitCar();}scene.remove(T.c.mesh);const i=cars.indexOf(T.c);if(i>=0)cars.splice(i,1);};
  const near=Math.hypot(player.x-T.o[3],player.z-T.o[4])<30;
  if(!near)V31.fadeDo(()=>{back();player.x=T.o[3];player.z=T.o[4]+3;});else back();
  wp=null;const who=LINES[T.line].staff;const L=ST.laps[T.m.id];
  setTimeout(()=>AM.dialog(who,(early?'Déjà de retour ? ':'L’essai est terminé ! ')+'Alors, cette '+T.n+', convaincu ?'+(L?' Votre meilleur tour : '+L.toFixed(1).replace('.',',')+' s.':''),[
    T.m.p?['Je l’achète',()=>AM.buy(T.m.id,T.c.paint||COLS[(T.m.col||[0])[0]][0]),'hot']:null,T.m.p?['Négocier le prix',()=>AM.negotiate(T.m.id)]:null,['Je vais réfléchir',()=>UI.close(),'ghost']],T.line),near?300:800);}
AM.tickTest=function(dt){const T=AM.testDrive;if(!T)return;T.t-=dt;
  if(player.car!==T.c&&Math.hypot(player.x-T.o[3],player.z-T.o[4])<30){endTest(true);return;}
  if(T.t<=0)endTest(false);};
/* ---------------- piste chronométrée ---------------- */
AM.lap={on:false,next:0,time:0};
AM.tickLap=function(dt){const c=player.car,L=AM.lap;if(!c){L.on=false;return;}const TR=AM.TRACK;if(!TR)return;const cp=TR.cps;
  if(L.on)L.time+=dt;const p=cp[L.on?L.next%4:0],d=Math.hypot(c.x-p[0],c.z-p[1]);
  if(!L.on){if(d<5.5&&Math.abs(c.v)>3){L.on=true;L.next=1;L.time=0;toast('⏱️ Chrono lancé !','');}return;}
  if(L.time>120){L.on=false;return;}
  if(d<7){if(L.next%4===0){const id=(AM.testDrive&&AM.testDrive.m.id)||(c.am&&AM.recOf(c.am)&&AM.recOf(c.am).m)||c.type,best=ST.laps[id];const t=L.time;
      if(!best||t<best){ST.laps[id]=t;AM.save();toast('🏆 Nouveau record '+((byId[id]&&byId[id].n)||'')+' : '+t.toFixed(2).replace('.',',')+' s','good');}else toast('Tour bouclé : '+t.toFixed(2).replace('.',',')+' s (record '+best.toFixed(2).replace('.',',')+' s)','');
      L.next=1;L.time=0;}else L.next++;}};
AM.trackInfo=function(){UI.open({line:'prestige',eye:'Piste d’essai Aurore',title:'Records du tour',body:b=>{b.appendChild(h('p','am-desc','Franchissez la ligne de départ en roulant : le chrono démarre seul. Passez les 4 portiques pour valider le tour. Ouverte à tous vos véhicules et aux essais.'));
  const k=Object.keys(ST.laps).sort((a,b)=>ST.laps[a]-ST.laps[b]);if(!k.length)b.appendChild(h('p','am-dim','Aucun record pour l’instant.'));const s=h('div','am-sum');k.slice(0,10).forEach((id,i)=>s.appendChild(row((i+1)+'. '+((byId[id]&&byId[id].n)||id),ST.laps[id].toFixed(2).replace('.',',')+' s',i===0?'good':'')));b.appendChild(s);}});};
/* ---------------- son moteur de démonstration ---------------- */
let EN=null;AM.engineOn=false;
function actxGet(){try{if(typeof actx!=='undefined'&&actx)return actx;}catch(e){}window.__amA=window.__amA||new (window.AudioContext||window.webkitAudioContext)();return window.__amA;}
AM.engineToggle=function(m,d){if(AM.engineOn){AM.engineStop();return;}const A=actxGet();if(A.state==='suspended')A.resume();const P=(window.ENG19&&ENG19[m.t])||(AMC.SND[m.t])||{f:44,w:'sawtooth',cut:500,cyl:6,burble:.3,sub:.3};
  const g=A.createGain(),lp=A.createBiquadFilter(),o1=A.createOscillator(),o2=A.createOscillator(),lfo=A.createOscillator(),lg=A.createGain();lp.type='lowpass';lp.frequency.value=P.cut;o1.type=P.w;o2.type='sine';
  const t=A.currentTime,elec=P.cyl===1;o1.frequency.setValueAtTime(P.f*(elec?1:.6),t);o1.frequency.linearRampToValueAtTime(P.f*2.6,t+.55);o1.frequency.linearRampToValueAtTime(P.f*3.4,t+1.2);o1.frequency.linearRampToValueAtTime(P.f*1.05,t+2.2);
  o2.frequency.value=P.f/2;lfo.frequency.value=elec?0:Math.max(6,P.cyl*3.2);lg.gain.value=P.burble*.04;lfo.connect(lg);lg.connect(g.gain);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(elec?.04:.09,t+.15);o1.connect(lp);o2.connect(lp);lp.connect(g);g.connect(A.destination);[o1,o2,lfo].forEach(o=>o.start());
  EN={g,os:[o1,o2,lfo],A,d};AM.engineOn=true;if(d&&d.m.userData.rig33){d.m.userData.rig33.state.engine=1;d.m.userData.rig33.state.lights=1;}
  AM.say(LINES[m.line].staff,elec?'Écoutez ce silence… et sentez le couple instantané.':pick(['Écoutez-moi cette sonorité !','Le moteur se réveille… quelle musique !']),3);};
AM.engineRev=function(){if(!EN)return;const t=EN.A.currentTime,o=EN.os[0],f=o.frequency.value;o.frequency.cancelScheduledValues(t);o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*3,t+.35);o.frequency.linearRampToValueAtTime(f,t+1.3);};
AM.engineStop=function(){if(!EN)return;const t=EN.A.currentTime;EN.g.gain.cancelScheduledValues(t);EN.g.gain.setValueAtTime(EN.g.gain.value,t);EN.g.gain.linearRampToValueAtTime(0,t+.4);const os=EN.os;setTimeout(()=>os.forEach(o=>{try{o.stop();}catch(e){}}),500);
  if(EN.d&&EN.d.m.userData.rig33){EN.d.m.userData.rig33.state.engine=0;EN.d.m.userData.rig33.state.lights=0;}EN=null;AM.engineOn=false;};
/* ---------------- vues d'inspection ---------------- */
AM.view=function(mode,d){UI.close(true);const R=d.m.userData.rig33,G=(CAR7[d.model.t]||CAR7.sedan).gh;AM.V={mode,d,yaw0:camYaw,t:performance.now(),last:camYaw};
  if(mode==='inside'&&R){AMC.peek(d.m,true);R.state.doors=1;}if(mode==='seat'){player.mesh.visible=false;if(R)R.state.doors=0;}
  if(mode==='orbit')camYaw=Math.atan2(player.x-d.m.position.x,player.z-d.m.position.z)+Math.PI;
  const bts=[['↩︎ Quitter la vue',AM.unview,'hot']];if(!d.moto)bts.unshift(['Portières',()=>{if(R)R.state.doors=R.state.doors?0:1;}]);bts.unshift([AM.engineOn?'Couper':'Moteur',()=>{AM.engineToggle(d.model,d);AM.view(mode,d);}]);if(AM.engineOn)bts.unshift(['Accélérer',AM.engineRev]);
  if(mode!=='seat'&&R)bts.unshift(['Capot',()=>{R.state.hood=R.state.hood?0:1;}]);
  vbar.innerHTML='<small>'+({orbit:'Vue 360° · glisse pour tourner',inside:'Habitacle · glisse pour regarder',seat:'Au volant · glisse pour regarder'})[mode]+'</small>';const row_=document.createElement('div');bts.forEach(b=>row_.appendChild(btn(b[0],b[1],b[2]||'')));vbar.appendChild(row_);vbar.hidden=false;};
AM.unview=function(){const V=AM.V;if(!V)return;const R=V.d.m.userData.rig33;if(R){AMC.peek(V.d.m,false);}player.mesh.visible=!player.car;AM.V=null;vbar.hidden=true;camYaw=V.yaw0;if(V.d.model)AM.sheet&&(V.d.occ?AM.occSheet(V.d):AM.sheet(V.d.model.id,V.d));};
const _upl=updatePlayer;updatePlayer=function(dt){if(AM.V)return;_upl(dt);};
const v3=new THREE.Vector3(),v4=new THREE.Vector3();
const _uc=updateCamera;updateCamera=function(dt){_uc(dt);if(!started)return;const V=AM.V;
  if(V){const m=V.d.m,G=(CAR7[V.d.model.t]||CAR7.sedan).gh,c=m.position;m.updateMatrixWorld();
    if(V.mode==='orbit'){if(performance.now()-lastDrag>2500)camYaw+=dt*.3;const r=6.8*CAMX.zoom,p=Math.max(.12,Math.min(.9,camPitch));camera.position.set(c.x-Math.sin(camYaw)*Math.cos(p)*r,c.y+.9+Math.sin(p)*r,c.z-Math.cos(camYaw)*Math.cos(p)*r);camera.lookAt(c.x,c.y+.7,c.z);}
    else if(V.mode==='inside'){const r=2.6,a=camYaw;v3.set(0,G.belt+.15,(G.zws+G.zrw)/2);m.localToWorld(v3);camera.position.set(v3.x-Math.sin(a)*r,v3.y+.55,v3.z-Math.cos(a)*r);camera.lookAt(v3);}
    else{const off=Math.max(-1.3,Math.min(1.3,camYaw-V.yaw0));const sz=(G.zws+G.zrw)/2+.25;v3.set(.36,G.belt+.34,sz-.05);m.localToWorld(v3);v4.set(.36+Math.sin(off)*4,G.belt+.25-(camPitch-.5)*2,sz+Math.cos(off)*4);m.localToWorld(v4);camera.position.copy(v3);camera.lookAt(v4);}
    if(Math.abs(camera.fov-60)>.1){camera.fov=60;camera.updateProjectionMatrix();}return;}
  if(AM.cockpit&&player.car&&player.car.mesh.userData.chassis){const c=player.car,m=c.mesh,G=(CAR7[c.type]||CAR7.sedan).gh;m.updateMatrixWorld();const sz=(G.zws+G.zrw)/2+.25;v3.set(.36,G.belt+.34,sz-.05);m.localToWorld(v3);const off=Math.max(-1,Math.min(1,angDiff(c.h,camYaw)));v4.set(.36+Math.sin(-off)*5,G.belt+.2,sz+Math.cos(off)*5);m.localToWorld(v4);camera.position.copy(v3);camera.lookAt(v4);}
};
addEventListener('keydown',e=>{if(e.key==='Escape'&&AM.V){e.stopImmediatePropagation();AM.unview();}},true);
/* ---------------- commandes du véhicule ---------------- */
AM.controls=function(){const c=player.car||cars.filter(q=>q.am&&Math.hypot(q.x-player.x,q.z-player.z)<6)[0];if(!c){toast('Monte dans ta voiture (ou approche-toi) pour ses commandes.','warn');return;}
  const R=c.mesh.userData.chassis?AMC.rig(c.mesh):null,s=R?R.state:{},r=c.am?AM.recOf(c.am):null;
  const T=(k,l)=>btn(l,()=>{s[k]=s[k]?0:1;AM.controls();},s[k]?'on':'');
  UI.open({line:r?r.line:'prestige',eye:'Commandes de bord'+(r?' · '+r.plate:''),title:r?r.n:'Véhicule',body:b=>{const g=h('div','am-grid');
    if(R){g.appendChild(T('doors','Portières'));g.appendChild(T('trunk','Coffre'));g.appendChild(T('hood','Capot'));g.appendChild(T('lights','Phares'));
      g.appendChild(btn('Clignotant gauche',()=>{s.sig=s.sig==='L'?0:'L';AM.controls();},s.sig==='L'?'on':''));g.appendChild(btn('Clignotant droit',()=>{s.sig=s.sig==='R'?0:'R';AM.controls();},s.sig==='R'?'on':''));
      g.appendChild(btn('Feux de détresse',()=>{s.sig=s.sig==='H'?0:'H';AM.controls();},s.sig==='H'?'on':''));g.appendChild(T('mir','Rabattre les rétros'));}
    g.appendChild(btn('Klaxon',()=>{if(typeof playerHonk==='function')playerHonk();}));
    if(R&&player.car===c)g.appendChild(btn(AM.cockpit?'Caméra extérieure':'Caméra intérieure',()=>{AM.cockpit=!AM.cockpit;AM.controls();},AM.cockpit?'on':''));
    g.appendChild(btn('Radio Lagoon FM',()=>{if(typeof radioPlay==='function')radioPlay(radioN===0?-1:0);AM.controls();},typeof radioN!=='undefined'&&radioN===0?'on':''));b.appendChild(g);
    if(r){sec(b,'État');b.appendChild(bar('Carburant',c.fuel||0,15));b.appendChild(bar('Huile',r.cond.oil));b.appendChild(bar('Pneus',r.cond.tir));b.appendChild(bar('Moteur',r.cond.eng));
      const g2=h('div','am-grid');g2.appendChild(btn('Documents',()=>AM.docs(r)));g2.appendChild(btn('Atelier & personnalisation',()=>AM.sav(r.id)));if((r.war.assist||0)>gameMin)g2.appendChild(btn('Appeler l’assistance',()=>AM.assist(r)));b.appendChild(g2);}}});};
AM.assist=function(r){UI.close();AM.note('📞 Assistance Aurore : un dépanneur arrive. Votre '+r.n+' est prise en charge gratuitement.','good');AM.despawn(r);r.st='atelier';AM.order(r,'service','Dépannage et réparation',['Appel reçu','Dépanneuse en route','Réparation','Contrôle','Terminé'],25,{apply:{'cond.eng':'max','cond.body':'max',dmg:1,'cond.tir':30},deliver:true});AM.save();};
addEventListener('keydown',e=>{if(!started||paused||chatOpen||(e.target&&/^(INPUT|TEXTAREA)$/.test(e.target.tagName)))return;const k=e.key.toLowerCase();
  if(player.car&&!panelOpen&&player.car.mesh.userData.rig33){const s=player.car.mesh.userData.rig33.state;if(k==='l'){s.lights=s.lights?0:1;toast(s.lights?'Phares allumés':'Phares éteints');}else if(k==='x'){s.sig=s.sig==='H'?0:'H';}}});
/* v54 : bouton « Bord » et touche C retirés (capot, portières… ne sont plus accessibles en jeu) */
/* ---------------- conversations d'ambiance ---------------- */
const CONV=[['Elle consomme combien, la Titan X ?','Environ 11 litres, mais quel confort sur le boulevard !'],['Je peux l’essayer cet après-midi ?','Bien sûr, la piste d’essai est juste derrière le showroom.'],['Le crédit sur 10 mois, c’est possible ?','Oui, dès 20 % d’acompte. Mme Diallo vous reçoit à l’étage.'],
  ['La Volt GT se recharge en combien de temps ?','Vingt minutes sur nos bornes rapides.'],['Vous reprenez ma vieille berline ?','Avec plaisir, Aurore Occasion vous fait une offre sur place.'],['Cette Hyperion, c’est un rêve…','Il ne reste que quelques exemplaires de l’Édition Nuit chez Aurore Exclusive.'],
  ['Il y a un parking pour les clients ?','Juste à gauche du bâtiment, et des places VIP devant l’entrée.'],['La Prestige S a des sièges massants ?','Massants, ventilés et chauffants, à l’avant comme à l’arrière.']];
let ambT=6,inShow=false;AM.tickAmbient=function(dt){const inside=player.x>-76&&player.x<-4&&player.z>-695&&player.z<-653&&!player.inside;
  if(inside&&!inShow){AM.say('ama',pick(['Bienvenue chez Aurore Motors ! N’hésitez pas si vous avez une question.','Bonjour ! Prenez votre temps, nos conseillers sont à votre écoute.']),4);}inShow=inside;
  if(!inside)return;ambT-=dt;if(ambT>0)return;ambT=rand(11,17);const c=pick(W().clients),cv=pick(CONV),s=W().staff[Math.random()<.5?'koffi':'nadia'];if(!c||!s)return;say(c.m,cv[0],4);setTimeout(()=>say(s.m,cv[1],4.5),2200);};
const CLINES=['Vous aussi, vous craquez pour la Rosso SF ?','Je viens pour la Titan X, ma femme veut un SUV.','Mon cousin a pris une Lumi, il ne paie presque plus d’essence !','J’attends mon conseiller pour mon crédit.','L’essai sur la piste, c’est génial, faites-le !','Les places VIP devant, c’est pour les clients fidèles.'];
const nearClient=()=>{if(player.car||player.inside)return null;let b=null,bd=2.2;W().clients.forEach(c=>{if(!c.m.visible)return;const d=Math.hypot(c.m.position.x-player.x,c.m.position.z-player.z);if(d<bd){bd=d;b=c;}});return b;};
const _int=interact;interact=function(){if(AM.V){AM.unview();return;}if(started&&!paused&&!panelOpen&&!chatOpen&&!nearSpot&&!nearCar){const c=nearClient();if(c){c.w=5;c.m.rotation.y=Math.atan2(player.x-c.m.position.x,player.z-c.m.position.z);const t=pick(CLINES);say(c.m,t,4);addChat('Client',t);return;}}_int();};
const _upr=updatePrompt;updatePrompt=function(){_upr();if(!started||panelOpen||promptKey)return;const c=nearClient();if(c){promptKey='E · Parler au client';const p=$('#prompt');p.hidden=false;p.textContent=promptKey;}};
/* ---------------- écrans de suivi ---------------- */
function frame(g,W_,H_,title,accent){g.fillStyle='#0b0d11';g.fillRect(0,0,W_,H_);g.fillStyle=accent;g.fillRect(0,0,W_,H_*.16);g.fillStyle='#fff';g.font='700 '+Math.round(H_*.1)+'px Rajdhani, Arial Narrow, sans-serif';g.textBaseline='middle';g.fillText(title,W_*.025,H_*.085);
  g.textAlign='right';g.fillText(AM.day(),W_*.975,H_*.085);g.textAlign='left';}
AM.drawBoard=function(g,Wd,Hd){frame(g,Wd,Hd,'AURORE MOTORS · SUIVI EN DIRECT','#c8102e');const y0=Hd*.24,lh=Hd*.13;g.font='600 '+Math.round(Hd*.075)+'px Barlow, system-ui, sans-serif';
  g.fillStyle='#9fb0c0';g.fillText('COMMANDES & ATELIER',Wd*.025,y0);g.fillText('RECORDS PISTE',Wd*.62,y0);
  const O=ST.orders.slice(0,5);if(!O.length){g.fillStyle='#ccd6e0';g.fillText('Aucune commande en cours · essais sur la piste ouverts',Wd*.025,y0+lh);}
  O.forEach((q,i)=>{const y=y0+lh*(i+1),p=Math.min(1,q.t/q.d);g.fillStyle='#fff';g.fillText((q.label.length>26?q.label.slice(0,25)+'…':q.label),Wd*.025,y);g.fillStyle='#2a2f37';g.fillRect(Wd*.33,y-lh*.18,Wd*.2,lh*.36);g.fillStyle=q.ready?'#58d68d':'#c8102e';g.fillRect(Wd*.33,y-lh*.18,Wd*.2*p,lh*.36);
    g.fillStyle='#9fb0c0';g.fillText(q.ready?'PRÊTE':Math.round(p*100)+' %',Wd*.54,y);});
  Object.keys(ST.laps).sort((a,b)=>ST.laps[a]-ST.laps[b]).slice(0,5).forEach((id,i)=>{const y=y0+lh*(i+1);g.fillStyle=i?'#fff':'#ffd24a';g.fillText((i+1)+'. '+((byId[id]&&byId[id].n)||id),Wd*.62,y);g.textAlign='right';g.fillText(ST.laps[id].toFixed(2).replace('.',',')+' s',Wd*.975,y);g.textAlign='left';});
  if(!Object.keys(ST.laps).length){g.fillStyle='#ccd6e0';g.fillText('Signez le premier record !',Wd*.62,y0+lh);}};
AM.drawShop=function(g,Wd,Hd){frame(g,Wd,Hd,'ATELIER · SUIVI','#2e4a6a');const y0=Hd*.3,lh=Hd*.17;g.font='600 '+Math.round(Hd*.085)+'px Barlow, system-ui, sans-serif';const O=ST.orders.slice(0,4);
  if(!O.length){g.fillStyle='#ccd6e0';g.fillText('Atelier disponible · sans rendez-vous',Wd*.04,y0);return;}
  O.forEach((q,i)=>{const y=y0+lh*i;g.fillStyle='#fff';g.fillText(q.label.slice(0,22),Wd*.04,y);g.fillStyle='#9fb0c0';g.fillText(q.steps[q.i],Wd*.04,y+lh*.42);g.fillStyle='#2a2f37';g.fillRect(Wd*.62,y-lh*.15,Wd*.34,lh*.3);g.fillStyle=q.ready?'#58d68d':'#6cc6ff';g.fillRect(Wd*.62,y-lh*.15,Wd*.34*Math.min(1,q.t/q.d),lh*.3);});};
let vipK=0;AM.drawVip=function(g,Wd,Hd){vipK++;const L=AM.MODELS.filter(m=>m.line==='exclusive'||m.p>9000),m=L[Math.floor(vipK/8)%L.length];g.fillStyle='#0b0c0e';g.fillRect(0,0,Wd,Hd);const gr=g.createLinearGradient(0,0,Wd,Hd);gr.addColorStop(0,'rgba(201,162,74,.35)');gr.addColorStop(1,'rgba(201,162,74,0)');g.fillStyle=gr;g.fillRect(0,0,Wd,Hd);
  g.fillStyle='#c9a24a';g.font='600 '+Math.round(Hd*.09)+'px Barlow, sans-serif';g.fillText('AURORE EXCLUSIVE',Wd*.06,Hd*.18);g.fillStyle='#fff';g.font='700 '+Math.round(Hd*.17)+'px Rajdhani, Arial Narrow, sans-serif';g.fillText(m.n,Wd*.06,Hd*.48);
  g.font='500 '+Math.round(Hd*.08)+'px Barlow, sans-serif';g.fillStyle='#e6dcc3';g.fillText(m.ch+' ch · '+m.vmax+' km/h · 0-100 en '+m.acc.toFixed(1).replace('.',',')+' s',Wd*.06,Hd*.66);g.fillText(fmt(m.p),Wd*.06,Hd*.82);};
/* ---------------- application téléphone « Véhicules » ---------------- */
const STL={out:'En circulation',garage:'Au garage',atelier:'À l’atelier',order:'En préparation',ready:'Prête · clés à retirer'};
function ovl(fn){closePanel();setTimeout(fn,30);}
function appVeh(b){const c=mk('div','bigc');c.appendChild(mk('small',null,'Aurore Motors · mon espace'));c.appendChild(mk('b',null,ST.cars.length+' véhicule'+(ST.cars.length>1?'s':'')));
  const cr=ST.credits[0];c.appendChild(mk('span',null,cr?'Prochaine mensualité '+fmt(cr.monthly)+' · '+AM.day(cr.due):ST.orders.length?ST.orders.length+' commande(s) en cours':'Aucune échéance à venir'));b.appendChild(c);
  ST.cars.forEach(r=>{const x=mk('button','prow',null,()=>phOpen(['Véhicules','🚘','#c8102e,#15171a',bb=>appVehCar(bb,r)]));x.appendChild(mk('b',null,r.n));x.appendChild(mk('span',null,r.plate+' · '+STL[r.st]+' · carburant '+Math.round(r.fuel||0)+' %'));b.appendChild(x);});
  if(!ST.cars.length)b.appendChild(mk('p','dim','Aucun véhicule. Passe chez Aurore Motors, Aurore Moto ou Aurore Occasion.'));
  b.appendChild(mk('small',null,'Services'));
  [['Suivi des commandes ('+ST.orders.length+')',()=>ovl(AM.tracker)],['Mensualités et contrats ('+(ST.credits.length+ST.leases.length)+')',()=>ovl(AM.financeOffice)],['Mes annonces et offres ('+ST.ads.reduce((s,a)=>s+a.offers.length,0)+')',()=>ovl(()=>AM.occasion('annonces'))],['Records de la piste',()=>ovl(AM.trackInfo)],['Concessions Aurore · GPS',()=>ovl(AM.network)]].forEach(([l,f])=>{const x=mk('button','prow',null,f);x.appendChild(mk('b',null,l));b.appendChild(x);});}
function appVehCar(b,r){const car=AM.carOf(r);const c=mk('div','bigc');c.appendChild(mk('small',null,r.plate+' · '+STL[r.st]));c.appendChild(mk('b',null,r.n));c.appendChild(mk('span',null,Math.round(r.km*10)/10+' km · cote '+fmt(AM.value(r))));b.appendChild(c);
  [['Moteur',r.cond.eng],['Huile',r.cond.oil],['Pneus',r.cond.tir],['Carrosserie',r.cond.body],['Propreté',r.cond.clean]].forEach(([k,v])=>{const x=mk('div','prow');x.appendChild(mk('b',null,k+' · '+Math.round(v)+' %'));const vb=mk('div','v17bar');const i=mk('i');i.style.width=v+'%';i.style.display='block';i.style.height='100%';vb.appendChild(i);x.appendChild(vb);b.appendChild(x);});
  const A=(l,f,off)=>{const x=mk('button','pbtn',l,f);x.disabled=!!off;b.appendChild(x);};
  if(r.st==='out')A('📍 Localiser sur la carte',()=>{wp={x:car?car.x:r.loc.x,z:car?car.z:r.loc.z,l:r.n};closePanel();toast('Repère placé sur '+r.n+'.','good');});
  if(r.st==='garage'||r.st==='out')A('🚚 Me la livrer ici · '+fmt(35),()=>{if(!AM.pay(35,'Livraison '+r.n))return;AM.despawn(r);r.st='atelier';AM.order(r,'service','Livraison à domicile',['Préparation','Chargement','En route','Arrivée','Terminé'],20,{deliver:true});AM.save();closePanel();toast('Livraison en route (20 s).','good');},!AM.afford(35));
  if(r.st==='garage'||r.st==='out')A('🔧 Commander une réparation',()=>ovl(()=>AM.sav(r.id)));
  if(r.st==='ready')A('🔑 Aller chercher les clés',()=>{wp={x:12,z:-667,l:'Remise des clés'};closePanel();});
  const cr=ST.credits.find(q=>q.car===r.id);if(cr)A('💳 Payer la mensualité · '+fmt(cr.monthly),()=>{if(AM.pay(cr.monthly,'Mensualité '+cr.label)){cr.left--;cr.due+=1440;ST.credits=ST.credits.filter(q=>q.left>0);AM.save();phOpen(['Véhicules','🚘','#c8102e,#15171a',bb=>appVehCar(bb,r)]);}},!AM.afford(cr.monthly));
  if((r.war.assist||0)>gameMin&&r.st==='out')A('📞 Appeler l’assistance routière',()=>AM.assist(r));
  A('📄 Documents',()=>ovl(()=>AM.docs(r)));A('💰 Vendre ce véhicule',()=>ovl(()=>AM.occasion('vendre')));}
try{const i=APPS.findIndex(a=>a[0]==='Véhicules');const A=['Véhicules','🚘','#c8102e,#15171a',appVeh];if(i>=0)APPS[i]=A;else APPS.splice(Math.min(4,APPS.length),0,A);}catch(e){}
})();
