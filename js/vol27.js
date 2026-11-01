'use strict';
/* ==========================================================================
   v27 · AÉROPORTS ET VOLS
   Billetterie, sûreté, salle d'attente, café, duty free, embarquement,
   vol complet suivi en direct (repoussage, roulage, décollage, croisière,
   descente, atterrissage, roulage jusqu'à la porte), caméras multiples,
   carte de suivi type écran de bord, annonces, son des réacteurs.
   ========================================================================== */
(function(){
const LS='port-aurore-v27';
const FLIGHTS={pax:{code:'AA 274',from:'pax',to:'sol',fromN:'Port-Aurore',toN:'Solenne',fromC:'PAX',toC:'SLN',gate:'A1',dur:'1 h 05',km:1240,eco:180,biz:480,temp:'28 °C'},
  sol:{code:'AA 275',from:'sol',to:'pax',fromN:'Solenne',toN:'Port-Aurore',fromC:'SLN',toC:'PAX',gate:'1',dur:'1 h 10',km:1240,eco:180,biz:480,temp:'24 °C'}};
const S27=window.S27={ticket:null,seen:{},set:{flySpeed:1,view:'cine',ann:true}};
try{const o=JSON.parse(localStorage.getItem(LS)||'null');if(o){if(o.ticket&&FLIGHTS[o.ticket.from])S27.ticket=o.ticket;S27.seen=o.seen||{};}}catch(e){}
try{const o=JSON.parse(localStorage.getItem('port-aurore-set27')||'null');if(o)Object.assign(S27.set,o);}catch(e){}
function save27(){try{localStorage.setItem(LS,JSON.stringify({ticket:S27.ticket,seen:S27.seen}));}catch(e){}}
const here=()=>inSol27()?'sol':'pax';
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function pay27(c){if(state.cash+state.bank<c)return false;takeMoney(c);return true;}
const hhmm=m=>{m=Math.floor(m%1440);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};
/* ---------------- sons (carillon, bips, réacteurs) ---------------- */
function tone(f,t0,d,v,type){if(!actx||muted)return;try{const o=actx.createOscillator(),g=actx.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(0,actx.currentTime+t0);g.gain.linearRampToValueAtTime(v||.08,actx.currentTime+t0+.02);g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+t0+d);o.connect(g);g.connect(actx.destination);o.start(actx.currentTime+t0);o.stop(actx.currentTime+t0+d+.05);}catch(e){}}
const chime=()=>{tone(784,0,1.1,.07);tone(622,.45,1.4,.07);};
const beep=ok=>{tone(ok?1320:220,0,.18,.06,'square');if(ok)tone(1760,.16,.2,.05,'square');};
const JET={on:false};
function jetStart(){if(!actx||JET.on)return;try{const nb=actx.createBuffer(1,actx.sampleRate*2,actx.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const src=actx.createBufferSource();src.buffer=nb;src.loop=true;const bp=actx.createBiquadFilter();bp.type='lowpass';bp.frequency.value=400;const g=actx.createGain();g.gain.value=0;src.connect(bp);bp.connect(g);g.connect(actx.destination);src.start();
  const o=actx.createOscillator();o.type='sine';o.frequency.value=900;const og=actx.createGain();og.gain.value=0;o.connect(og);og.connect(actx.destination);o.start();Object.assign(JET,{on:true,src,bp,g,o,og});}catch(e){}}
function jetSet(th,inside){if(!JET.on)return;const k=muted||paused?0:1,t=actx.currentTime;JET.g.gain.setTargetAtTime((.02+.16*th)*(inside?.55:1)*k,t,.3);JET.bp.frequency.setTargetAtTime((inside?260:420)+th*(inside?500:1500),t,.4);JET.o.frequency.setTargetAtTime(700+th*1900,t,.5);JET.og.gain.setTargetAtTime(.006*th*k*(inside?.4:1),t,.4);}
function jetStop(){if(!JET.on)return;try{JET.src.stop();JET.o.stop();}catch(e){}JET.on=false;}

/* ---------------- avion du joueur, cabine ---------------- */
const FL=window.FL27={on:false,plane:null,cab:null,view:'cine',speed:1};
function buildCabin(G){const cy=G.userData.cy,C=new THREE.Group(),P=[],E=[],fy=cy-.85;mats27();
  const sh=new THREE.CylinderGeometry(1.94,1.94,25,28,1,true);sh.rotateX(Math.PI/2);const shell=new THREE.Mesh(sh,new THREE.MeshLambertMaterial({color:0xece9e2,side:THREE.BackSide}));shell.position.set(0,cy,.3);C.add(shell);
  P.push(pp(U27,0,fy,.3,0x22355a,3.75,.08,25));P.push(pp(U27,0,fy+.05,.3,0x6b7a90,.55,.02,25));
  [-1,1].forEach(s=>{P.push(pp(U27,s*1.32,cy+1.02,.3,0xf4f2ec,.78,.5,24.6));P.push(pp(U27,s*.94,cy+.8,.3,0xd9d6cf,.04,.06,24.6));P.push(pp(U27,s*1.05,cy+.72,.3,0x9aa3ad,.3,.04,24.6));});
  E.push(pp(U27,0,cy+1.86,.3,0xfff4dc,.42,.04,24));
  [-1,1].forEach(s=>{for(let z=-12;z<=12.6;z+=.95)if(Math.abs(z-9.2)>.6&&Math.abs(z+3)>.5)E.push(pp(U27,s*1.9,cy+.42,z,0xffffff,.03,.34,.24));});
  P.push(pp(U27,0,cy,12.6,0xd9d4c9,3.9,3.9,.12));E.push(pp(U27,0,cy+1.45,12.5,0x2ecc71,.6,.18,.04));P.push(pp(U27,0,cy,-12.2,0xd9d4c9,3.9,3.9,.12));
  const SX=[-1.52,-1.05,-.58,.58,1.05,1.52],rows=[];for(let z=11.2,r=1;z>-11.4;z-=.82,r++)rows.push({z,r});
  const scr=[];rows.forEach(({z})=>{SX.forEach(x=>{P.push(pp(U27,x,fy+.42,z,0x1e3a5f,.44,.14,.46));P.push(pp(U27,x,fy+.86,z-.25,0x1e3a5f,.44,.78,.1,-.12,0,0));P.push(pp(U27,x,fy+1.2,z-.29,0xf4f2ec,.4,.18,.11,-.12,0,0));scr.push([x,fy+.95,z-.33]);});
    [-1,1].forEach(s=>P.push(pp(U27,s*1.05,fy+.2,z,0x9aa3ad,1.5,.1,.1)));});
  const m=new THREE.Mesh(mergeParts(P),M27.vc);C.add(m);const em=new THREE.Mesh(mergeParts(E),new THREE.MeshBasicMaterial({vertexColors:true}));C.add(em);
  const ic=document.createElement('canvas');ic.width=256;ic.height=160;const it=new THREE.CanvasTexture(ic);FL.ifeC=ic;FL.ifeT=it;
  const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(.26,.17),new THREE.MeshBasicMaterial({map:it}),scr.length);scr.forEach((p,i)=>{dummy.position.set(p[0],p[1],p[2]);dummy.rotation.set(-.12,Math.PI,0);dummy.scale.set(1,1,1);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);});im.instanceMatrix.needsUpdate=true;C.add(im);
  const me={x:1.52,z:rows[14].z,row:15};const used=new Set([me.x+','+me.z,'1.52,'+rows[2].z]);
  for(let k=0;k<26;k++){const r=pick(rows),x=pick(SX),key=x+','+r.z;if(used.has(key))continue;used.add(key);const p=npc27();if(window.T26&&T26.sitPose)T26.sitPose(p,null);p.position.set(x,fy-.03,r.z+.04);C.add(p);}
  C.visible=false;G.add(C);return {g:C,win:em.material,me,fy,rows};}
function placePlane(){const id=here(),T=W27.terms[id];if(!T||!FL.plane)return;FL.plane.position.set(T.plane.p.x,0,T.plane.p.z);FL.plane.rotation.set(0,T.plane.h,0);FL.plane.userData.gear.visible=true;FL.plane.userData.gear.scale.y=1;}
/* ---------------- plan de vol ---------------- */
const X=SOL27.x;
function route(from){
  const out=from==='pax',T=W27.terms[from],P0=T.plane.p,h0=T.plane.h,h1=out?0:-Math.PI/2,Lp=40,N=120,push=[];let x=P0.x,z=P0.z,h=h0;
  for(let i=0;i<=N;i++){push.push({x,z,h});const ds=Lp/N;h+=(h1-h0)/N;x-=Math.sin(h)*ds;z-=Math.cos(h)*ds;}
  const E=push[push.length-1],f=[Math.sin(h1),Math.cos(h1)];
  const C=out?[
    [E.x,0,E.z,'push',3],[E.x+f[0]*12,0,E.z+f[1]*12,'taxi',9],[-532,0,25,'taxi',12],[-540,0,80,'taxi',13],[-552,0,128,'taxi',11],[-585,0,150,'taxi',11],[-650,0,150,'taxi',13],[-720,0,150,'taxi',11],[-748,0,140,'taxi',7],[-759,0,117,'lineup',5],[-760,0,95,'roll',4],
    [-760,0,40,'roll',22],[-760,0,-120,'roll',52],[-760,0,-280,'climb',76],[-760,22,-450,'climb',84],[-768,90,-700,'climb',92],[-830,190,-950,'climb',100],[-1100,320,-1120,'climb',115],[-1700,460,-1100,'climb',140],[-2600,520,-900,'cruise',175],
    [X+3900,520,-560,'descent',170],[X+3100,500,-400,'descent',140],[X+2200,330,-320,'descent',115],[X+1400,130,-302,'approach',92],[X+700,36,-300,'approach',80],[X+440,6,-300,'landing',74],[X+370,0,-300,'landing',70],
    [X+200,0,-300,'landing',40],[X-40,0,-300,'taxiin',12],[X-95,0,-291,'taxiin',9],[X-104,0,-270,'taxiin',8],[X-92,0,-257,'taxiin',8],[X-50,0,-254,'taxiin',9],[X-20,0,-252,'taxiin',7],[X-9,0,-242,'taxiin',5],[X-6,0,-225,'gate',0]]
  :[[E.x,0,E.z,'push',3],[E.x+f[0]*12,0,E.z+f[1]*12,'taxi',9],[X-60,0,-254,'taxi',12],[X-160,0,-256,'taxi',13],[X-250,0,-258,'taxi',10],[X-288,0,-268,'taxi',7],[X-296,0,-285,'lineup',5],[X-282,0,-298,'lineup',5],[X-255,0,-300,'roll',4],
    [X-200,0,-300,'roll',20],[X-40,0,-300,'roll',52],[X+150,0,-300,'climb',76],[X+420,24,-300,'climb',86],[X+1100,140,-330,'climb',100],[X+2200,340,-480,'climb',125],[X+3400,500,-720,'cruise',160],
    [-3000,520,-1350,'descent',175],[-2000,470,-1800,'descent',145],[-1300,330,-2100,'descent',120],[-930,220,-2050,'approach',100],[-790,160,-1750,'approach',90],[-762,70,-1150,'approach',80],[-760,10,-760,'landing',74],[-760,0,-680,'landing',70],
    [-760,0,-400,'landing',42],[-760,0,20,'taxiin',13],[-758,0,105,'taxiin',10],[-752,0,138,'taxiin',8],[-730,0,150,'taxiin',10],[-650,0,150,'taxiin',13],[-595,0,140,'taxiin',10],[-572,0,105,'taxiin',9],[-565,0,60,'taxiin',9],[-560,0,30,'taxiin',8],[-545,0,12,'taxiin',6],[-525,0,7,'taxiin',4],[W27.terms.pax.plane.p.x,0,W27.terms.pax.plane.p.z,'gate',0]];
  const curve=new THREE.CatmullRomCurve3(C.map(c=>new THREE.Vector3(c[0],c[1],c[2])),false,'centripetal');curve.arcLengthDivisions=8000;
  const L=curve.getLength(),S=curve.getSpacedPoints(8000);let j=0;const marks=C.map((c,i)=>{if(i===0)return 0;let best=1e9,bi=j;for(let k=j;k<S.length;k++){const d=Math.hypot(S[k].x-c[0],S[k].y-c[1],S[k].z-c[2]);if(d<best){best=d;bi=k;}if(k>j+2500)break;}j=bi;return bi/8000*L;});
  marks[marks.length-1]=L;
  return {from,to:out?'sol':'pax',push,Lp,curve,L,C,marks,P1:out?W27.terms.sol.plane:W27.terms.pax.plane};}
function profile(R,s){const M=R.marks,C=R.C;let i=0;while(i<M.length-2&&s>=M[i+1])i++;const t=clamp((s-M[i])/Math.max(1,M[i+1]-M[i]),0,1);return {v:lerp(C[i][4],C[i+1][4],t),ph:C[i][3],i};}
const PH={board:'Embarquement',push:'Repoussage',taxi:'Roulage',lineup:'Alignement piste',roll:'Décollage',climb:'Montée',cruise:'Croisière',descent:'Descente',approach:'Approche',landing:'Atterrissage',taxiin:'Roulage vers la porte',gate:'Arrivée à la porte'};
const ANN={board:f=>'Mesdames et messieurs, bienvenue à bord du vol '+f.code+' d’Aurore Airways à destination de '+f.toN+'. Merci d’attacher votre ceinture.',
  push:()=>'Personnel navigant, armement des toboggans et vérification de la porte opposée.',taxi:f=>'Nous roulons vers la piste. Durée de vol estimée : '+f.dur+'.',roll:()=>'PNC, prenez place pour le décollage.',
  climb:()=>'Nous montons vers notre altitude de croisière de 36 000 pieds.',cruise:()=>'Le service à bord commence. Profitez de la vue sur l’océan Aurore.',descent:f=>'Nous avons entamé notre descente vers '+f.toN+'. Il fait '+f.temp+' au sol.',
  approach:()=>'PNC, préparez la cabine pour l’atterrissage.',landing:f=>'Mesdames et messieurs, bienvenue à '+f.toN+' !',taxiin:()=>'Merci d’avoir choisi Aurore Airways. Restez assis jusqu’à l’arrêt complet de l’appareil.'};
/* ---------------- interface du vol ---------------- */
let UI=null;
function buildUI(){if(UI)return UI;const d=el('div');d.id='fl27';d.hidden=true;
  d.innerHTML=`<div class="fl-vignette"></div><div class="fl-hublot"><i></i></div>
  <section class="fl-card"><header><span class="fl-logo"></span><div><b id="fl-code">AA 274</b><small id="fl-route">Port-Aurore → Solenne</small></div><em id="fl-phase">Embarquement</em></header>
   <div class="fl-prog"><span id="fl-a">PAX</span><div class="fl-bar"><i id="fl-fill"></i><u id="fl-ic">✈</u></div><span id="fl-b">SLN</span></div>
   <div class="fl-stats"><div><small>Altitude</small><b id="fl-alt">0 ft</b></div><div><small>Vitesse</small><b id="fl-spd">0 km/h</b></div><div><small>Arrivée dans</small><b id="fl-eta">1 h 05</b></div><div><small>Restant</small><b id="fl-km">1 240 km</b></div></div></section>
  <canvas id="fl-map" width="560" height="360"></canvas>
  <div class="fl-sub" id="fl-sub"></div>
  <nav class="fl-ctrl"><div class="fl-views" id="fl-views"></div><div class="fl-sep"></div><div class="fl-spd" id="fl-speeds"></div><button id="fl-skip" title="Passer à la phase suivante">Passer ⏭</button></nav>
  <div class="fl-full" id="fl-full" hidden><canvas id="fl-bigmap" width="1600" height="900"></canvas><div class="fl-fullinfo" id="fl-fullinfo"></div></div>`;
  $('#app').appendChild(d);
  const V=[['cine','🎬','Cinéma'],['ext','🛩','Extérieur'],['hublot','◍','Hublot'],['cabine','💺','Cabine'],['carte','🗺','Carte du vol']];
  V.forEach(([k,i,l])=>{const b=el('button',null,'<i>'+i+'</i><span>'+l+'</span>');b.dataset.v=k;b.onclick=()=>setView(k);d.querySelector('#fl-views').appendChild(b);});
  [1,2,4].forEach(k=>{const b=el('button',null,'×'+k);b.dataset.s=k;b.onclick=()=>{FL.speed=k;S27.set.flySpeed=k;try{localStorage.setItem('port-aurore-set27',JSON.stringify(S27.set));}catch(e){}uiSync();};d.querySelector('#fl-speeds').appendChild(b);});
  d.querySelector('#fl-skip').onclick=skipPhase;d.querySelector('#fl-map').onclick=()=>setView(FL.view==='carte'?'cine':'carte');
  UI={d,code:d.querySelector('#fl-code'),route:d.querySelector('#fl-route'),phase:d.querySelector('#fl-phase'),fill:d.querySelector('#fl-fill'),ic:d.querySelector('#fl-ic'),alt:d.querySelector('#fl-alt'),spd:d.querySelector('#fl-spd'),eta:d.querySelector('#fl-eta'),km:d.querySelector('#fl-km'),map:d.querySelector('#fl-map'),big:d.querySelector('#fl-bigmap'),full:d.querySelector('#fl-full'),info:d.querySelector('#fl-fullinfo'),sub:d.querySelector('#fl-sub'),a:d.querySelector('#fl-a'),b:d.querySelector('#fl-b')};
  return UI;}
function uiSync(){if(!UI)return;UI.d.querySelectorAll('#fl-views button').forEach(b=>b.classList.toggle('on',b.dataset.v===FL.view));UI.d.querySelectorAll('#fl-speeds button').forEach(b=>b.classList.toggle('on',+b.dataset.s===FL.speed));
  UI.d.classList.toggle('v-hublot',FL.view==='hublot');UI.full.hidden=FL.view!=='carte';if(FL.cab)FL.cab.g.visible=FL.view==='cabine';}
function setView(k){FL.view=k;FL.shot=null;FL.yaw0=camYaw;S27.set.view=k;try{localStorage.setItem('port-aurore-set27',JSON.stringify(S27.set));}catch(e){}uiSync();}
function subtitle(t){if(!UI||!S27.set.ann)return;UI.sub.innerHTML='<i>🔊</i><span>'+esc(t)+'</span>';UI.sub.classList.remove('on');void UI.sub.offsetWidth;UI.sub.classList.add('on');clearTimeout(FL.subT);FL.subT=setTimeout(()=>UI.sub.classList.remove('on'),6500);}
/* carte de suivi (style écran de divertissement à bord) */
const MAPB={x0:X-700,x1:1100,z0:-2500,z1:600};
function drawMap(cv,mode){const g=cv.getContext('2d'),W=cv.width,H=cv.height,R=FL.R;
  const sx=W/(MAPB.x1-MAPB.x0),sz=H/(MAPB.z1-MAPB.z0),k=Math.min(sx,sz)*.92,ox=W/2-(MAPB.x0+MAPB.x1)/2*k,oz=H/2-(MAPB.z0+MAPB.z1)/2*k,PX=x=>ox+x*k,PZ=z=>oz+z*k;
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#061a33');gr.addColorStop(1,'#0b2d52');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(120,170,230,.12)';g.lineWidth=1;for(let i=1;i<12;i++){g.beginPath();g.moveTo(W*i/12,0);g.lineTo(W*i/12,H);g.stroke();}for(let i=1;i<8;i++){g.beginPath();g.moveTo(0,H*i/8);g.lineTo(W,H*i/8);g.stroke();}
  const land=(x0,x1,z0,z1,c)=>{g.fillStyle=c;const r=Math.min(x1-x0,z1-z0)*k*.25;g.beginPath();if(g.roundRect)g.roundRect(PX(x0),PZ(z0),(x1-x0)*k,(z1-z0)*k,r);else g.rect(PX(x0),PZ(z0),(x1-x0)*k,(z1-z0)*k);g.fill();};
  land(-1700,1700,-1700,216,'#2c5a3c');land(-1700,-800,216,1100,'#2c5a3c');land(800,1700,216,1100,'#2c5a3c');land(-256,256,-256,210,'#7c8a8f');
  land(X-500,X+500,-390,270,'#3d7a46');g.fillStyle='rgba(47,198,201,.55)';g.fillRect(PX(X-500),PZ(270),1000*k,90*k);
  const fs=Math.max(10,Math.round(W/42));g.font='600 '+Math.round(fs*.85)+'px Barlow, sans-serif';g.fillStyle='rgba(180,210,240,.4)';g.textAlign='center';g.fillText('O C É A N   A U R O R E',PX((X+256)/2),PZ(-1900));
  const pin=(x,z,n,c)=>{g.fillStyle='#f5c451';g.beginPath();g.arc(PX(x),PZ(z),fs*.32,0,7);g.fill();g.fillStyle='#fff';g.font='700 '+fs+'px Rajdhani, sans-serif';g.textAlign='center';g.fillText(n,PX(x),PZ(z)+fs*1.5);g.font='600 '+Math.round(fs*.75)+'px Barlow, sans-serif';g.fillStyle='rgba(255,255,255,.65)';g.fillText(c,PX(x),PZ(z)+fs*2.4);};
  pin(-560,0,'PORT-AURORE','PAX');pin(X,-200,'SOLENNE','SLN');
  if(!R)return;const S=FL.samples;if(S){g.lineCap='round';g.setLineDash([fs*.5,fs*.45]);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=Math.max(2,fs*.16);g.beginPath();S.forEach((p,i)=>i?g.lineTo(PX(p.x),PZ(p.z)):g.moveTo(PX(p.x),PZ(p.z)));g.stroke();g.setLineDash([]);
    const n=Math.floor(clamp(FL.s/R.L,0,1)*(S.length-1));g.strokeStyle='#f5c451';g.lineWidth=Math.max(3,fs*.24);g.beginPath();for(let i=0;i<=n;i++){const p=S[i];i?g.lineTo(PX(p.x),PZ(p.z)):g.moveTo(PX(p.x),PZ(p.z));}g.stroke();}
  const p=FL.plane.position,h=FL.plane.rotation.y;g.save();g.translate(PX(p.x),PZ(p.z));g.rotate(Math.PI-h);g.fillStyle='#ffffff';g.shadowColor='rgba(245,196,81,.9)';g.shadowBlur=fs;const a=fs*.9;
  g.beginPath();g.moveTo(0,-a);g.lineTo(a*.18,-a*.3);g.lineTo(a,a*.15);g.lineTo(a,a*.32);g.lineTo(a*.18,a*.05);g.lineTo(a*.14,a*.62);g.lineTo(a*.42,a*.85);g.lineTo(a*.42,a);g.lineTo(0,a*.86);g.lineTo(-a*.42,a);g.lineTo(-a*.42,a*.85);g.lineTo(-a*.14,a*.62);g.lineTo(-a*.18,a*.05);g.lineTo(-a,a*.32);g.lineTo(-a,a*.15);g.lineTo(-a*.18,-a*.3);g.closePath();g.fill();g.restore();
  if(mode==='ife'){g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,H-28,W,28);g.fillStyle='#fff';g.font='700 18px Rajdhani, sans-serif';g.textAlign='left';g.fillText(FL.f.code+' · '+UI.alt.textContent,8,H-9);g.textAlign='right';g.fillText(UI.eta.textContent,W-8,H-9);}}
/* ---------------- caméras ---------------- */
const V3=(x,y,z)=>new THREE.Vector3(x,y,z),UP=V3(0,1,0),tmpU=V3(0,1,0);
function planeUp(){return tmpU.set(0,1,0).applyQuaternion(FL.plane.quaternion);}
function L2W(x,y,z){return FL.plane.localToWorld(V3(x,y,z));}
const SHOTS={ground:['chase','lowside','apron','wheel'],roll:['runway','chase','lowside'],air:['wing','flyby','top','nose','chase','under'],land:['threshold','chase','flyby']};
function phaseGroup(ph){return ph==='roll'||ph==='lineup'?'roll':ph==='climb'||ph==='cruise'||ph==='descent'?'air':ph==='approach'||ph==='landing'?'land':'ground';}
function newShot(){const gp=phaseGroup(FL.ph),L=SHOTS[gp].filter(s=>s!==(FL.shot&&FL.shot.k));const k=pick(L),p=FL.plane.position,h=FL.plane.rotation.y,f=V3(Math.sin(h),0,Math.cos(h)),r=V3(Math.cos(h),0,-Math.sin(h));
  const S={k,t:0,dur:rand(6.5,9.5)};
  if(k==='lowside')S.pos=p.clone().addScaledVector(f,38).addScaledVector(r,pick([-1,1])*18).setY(1.5);
  else if(k==='apron'){S.pos=p.clone().addScaledVector(f,-30).addScaledVector(r,pick([-1,1])*45).setY(22);}
  else if(k==='runway'){S.pos=p.clone().addScaledVector(f,260+rand(0,80)).addScaledVector(r,pick([-1,1])*46).setY(3);}
  else if(k==='flyby'){const sp=FL.v*FL.speed;S.pos=p.clone().addScaledVector(f,clamp(sp*4.5,180,700)).addScaledVector(r,pick([-1,1])*rand(26,40)).add(V3(0,rand(-8,14),0));if(S.pos.y<2)S.pos.y=2;}
  else if(k==='threshold'){const R=FL.R,i=R.C.findIndex(c=>c[3]==='landing'),c=R.C[Math.min(R.C.length-1,i+1)];const tp=V3(c[0],0,c[2]);S.pos=tp.clone().addScaledVector(r,pick([-1,1])*55).setY(4);}
  FL.shot=S;}
function camFlight(dt){const G=FL.plane,cy=G.userData.cy,p=G.position;G.updateMatrixWorld(true);let pos,look,up=UP;
  if(FL.view==='hublot'){pos=L2W(2.16,cy+.36,FL.cab.me.z+.25);look=L2W(14,cy-2.7-(FL.look.p||0)*4,FL.cab.me.z+1+(FL.look.y||0)*12);up=planeUp().clone();}
  else if(FL.view==='cabine'){pos=L2W(.08+(FL.look.y||0)*.3,cy+.62,-10.6);look=L2W((FL.look.y||0)*6,cy+.1-(FL.look.p||0)*2,12);up=planeUp().clone();}
  else if(FL.view==='ext'){const d=46*CAMX.zoom,yaw=G.rotation.y+(camYaw-FL.yaw0)+Math.PI,cp=Math.cos(camPitch),sp=Math.sin(camPitch);pos=V3(p.x-Math.sin(yaw+Math.PI)*cp*d,p.y+cy+sp*d+2,p.z-Math.cos(yaw+Math.PI)*cp*d);if(pos.y<1.2)pos.y=1.2;look=V3(p.x,p.y+cy,p.z);}
  else{FL.shotT=(FL.shotT||0)+dt;if(!FL.shot||FL.shot.t>FL.shot.dur||FL.shot.ph!==phaseGroup(FL.ph)){newShot();FL.shot.ph=phaseGroup(FL.ph);}const S=FL.shot;S.t+=dt;
    if(S.pos){pos=S.pos;look=V3(p.x,p.y+cy,p.z);if(S.k==='flyby'&&pos.distanceTo(p)>900)FL.shot.t=99;if((S.k==='runway'||S.k==='lowside'||S.k==='threshold')&&pos.distanceTo(p)>520)FL.shot.t=99;}
    else if(S.k==='chase'){pos=L2W(0,cy+7,-40-Math.min(20,FL.v*.1));look=L2W(0,cy+1,10);}
    else if(S.k==='wing'){pos=L2W(20,cy+2.4,-12);look=L2W(0,cy,8);up=planeUp().clone();}
    else if(S.k==='top'){pos=L2W(-26,cy+16,-44);look=L2W(0,cy,6);}
    else if(S.k==='nose'){pos=L2W(-10,cy+.8,34);look=L2W(0,cy,-2);up=planeUp().clone();}
    else if(S.k==='under'){pos=L2W(6,cy-7,8);look=L2W(0,cy,-8);}
    else if(S.k==='wheel'){pos=L2W(-5.2,1.1,-6);look=L2W(-1,1.2,14);}
    else{pos=L2W(0,cy+8,-42);look=L2W(0,cy,10);}}
  camera.position.copy(pos);camera.up.copy(up);camera.lookAt(look);camera.updateMatrixWorld(true);
  const fov=FL.view==='hublot'?62:FL.view==='cabine'?70:(FL.shot&&FL.shot.pos&&FL.view==='cine')?clamp(1400/Math.max(30,pos.distanceTo(p)),12,55):55;FL.fov=(FL.fov||55)+(fov-(FL.fov||55))*Math.min(1,4*dt);camera.fov=FL.fov;camera.updateProjectionMatrix();if(window.CAMX)CAMX.fov=FL.fov;
  const alt=p.y;if(scene.fog){scene.fog.near=140+alt*1.8;scene.fog.far=430+alt*7.5;}const far=Math.max(460,430+alt*7.5+300);if(Math.abs(camera.far-far)>5){camera.far=far;camera.updateProjectionMatrix();}}
/* ---------------- nuages autour de l'avion ---------------- */
let CL=null;function clouds27(){if(CL)return CL;const t=glowTex([[0,'rgba(255,255,255,.95)'],[.45,'rgba(255,255,255,.45)'],[1,'rgba(255,255,255,0)']]);CL=[];for(let i=0;i<90;i++){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,opacity:.7}));const s=rand(140,320);m.scale.set(s,s*rand(.32,.5),1);m.visible=false;scene.add(m);CL.push(m);}return CL;}
function placeCloud(m,p,ahead){const h=FL.plane.rotation.y,f=ahead?rand(700,1500):rand(-1400,1400);m.position.set(p.x+Math.sin(h)*f+rand(-1300,1300)*(ahead?.8:1),Math.random()<.78?rand(190,360):rand(620,760),p.z+Math.cos(h)*f+rand(-1300,1300)*(ahead?.8:1));}
function tickClouds(on){const L=clouds27(),p=FL.plane?FL.plane.position:null,d=dayK27();L.forEach(m=>{m.visible=!!on&&p&&p.y>60;if(!m.visible)return;if(!m.userData.init){placeCloud(m,p,false);m.userData.init=1;}
  if(Math.hypot(m.position.x-p.x,m.position.z-p.z)>1700)placeCloud(m,p,true);m.material.opacity=(.12+.68*d)*clamp((p.y-60)/120,0,1);});}
/* ---------------- déroulé du vol ---------------- */
function startFlight(from){
  const f=FLIGHTS[from];if(!S27.ticket||S27.ticket.from!==from){toast('Il te faut un billet pour ce vol.','warn');return;}
  if(window.T26&&(T26.ride||T26.food)){toast('Termine ou annule ta course/livraison avant d’embarquer.','warn');return;}
  closePanel();fade(true,()=>{
    buildUI();FL.on=true;FL.f=f;FL.R=route(from);FL.samples=FL.R.curve.getSpacedPoints(400);FL.s=0;FL.sp=0;FL.ph='board';FL.pt=0;FL.boardT=6.5;FL.v=0;FL.speed=S27.set.flySpeed||1;FL.view=S27.set.view||'cine';FL.look={y:0,p:0};FL.yaw0=camYaw;FL.lastPh=null;FL.shot=null;FL.oldFar=camera.far;FL.gm0=gameMin;
    if(mission){mission=null;if(beam)beam.visible=false;}if(SIT.on)standUp();
    placePlane();FL.plane.userData.gear.visible=true;
    if(!FL.cab)FL.cab=buildCabin(FL.plane);{const r=FL.cab.rows[S27.ticket.cls==='biz'?2:14];FL.cab.me.z=r.z;FL.cab.me.row=r.r;}FL.me=makePlayerMesh();if(T26.sitPose)T26.sitPose(FL.me,null);FL.me.position.set(FL.cab.me.x,FL.cab.fy-.03,FL.cab.me.z+.04);FL.cab.g.add(FL.me);player.mesh.visible=false;
    FL.saveAt=W27.terms[from].spot.arr;
    $('#hud').hidden=true;UI.d.hidden=false;UI.code.textContent=f.code;UI.route.textContent=f.fromN+' → '+f.toN;UI.a.textContent=f.fromC;UI.b.textContent=f.toC;uiSync();
    jetStart();if(window.AMB27)AMB27.hide();
    FL.ph0h=null;FL.endT=0;FL.touch=false;FL.ending=false;gearK=1;FL.fov=55;
    fade(false);setTimeout(()=>{chime();subtitle(ANN.board(f));},900);
  });}
function skipPhase(){if(!FL.on)return;const R=FL.R;if(FL.ph==='board'){FL.boardT=0;return;}if(FL.ph==='push'&&FL.sp<R.Lp){FL.sp=R.Lp;return;}
  const i=R.C.findIndex((c,k)=>k>0&&R.marks[k]>FL.s+1&&c[3]!==FL.ph);if(i<0)return;fade(true,()=>{FL.s=Math.max(FL.s,R.marks[i]-(R.C[i][3]==='landing'?380:R.C[i][3]==='gate'?40:20));FL.shot=null;fade(false);},.25);}
let gearK=1;
function tickFlight(dt){const R=FL.R,G=FL.plane,f=FL.f,K=FL.speed;
  let ph,v=0;
  if(FL.ph==='board'){FL.boardT-=dt*K;ph='board';if(FL.boardT<=0){ph='push';}}
  else if(FL.sp<R.Lp){ph='push';}
  if(ph==='board'){}else if(ph==='push'||(FL.ph==='push'&&FL.sp<R.Lp)){FL.sp=Math.min(R.Lp,FL.sp+3.6*dt*K);v=3.6;const i=Math.min(R.push.length-1,Math.floor(FL.sp/R.Lp*(R.push.length-1))),q=R.push[i];G.position.set(q.x,0,q.z);G.rotation.set(0,q.h,0);ph='push';}
  else{const pr=profile(R,FL.s);v=Math.max(2,pr.v);FL.s=Math.min(R.L,FL.s+v*dt*K);ph=pr.ph;if(FL.s>=R.L-.2)ph='gate';
    const u=FL.s/R.L,P=R.curve.getPointAt(u),Tg=R.curve.getTangentAt(u);P.y=Math.max(0,P.y);const h=Math.atan2(Tg.x,Tg.z),pitch=Math.asin(clamp(Tg.y,-1,1));
    const dh=angDiff(FL.ph0h==null?h:FL.ph0h,h)/Math.max(dt,1e-4);FL.ph0h=h;FL.yr=(FL.yr||0)+(dh-(FL.yr||0))*Math.min(1,2*dt);
    let rot=0;const iL=R.C.findIndex(c=>c[3]==='climb'),sL=R.marks[iL];if(ph==='roll'&&FL.s>sL-70)rot=.13*clamp((FL.s-(sL-70))/70,0,1);if(ph==='climb'&&P.y<30)rot=.13*(1-P.y/30)+.02;
    const iT=R.C.findIndex(c=>c[3]==='landing')+1,sT=R.marks[iT];if((ph==='landing'||ph==='approach')&&FL.s<sT&&FL.s>sT-260)rot=.07*clamp((FL.s-(sT-260))/180,0,1);if(ph==='landing'&&FL.s>sT&&FL.s<sT+80)rot=.07*(1-(FL.s-sT)/80);
    const air=P.y>.5,bank=air?clamp(-FL.yr*1.6,-.55,.55):0;FL.bank=(FL.bank||0)+(bank-(FL.bank||0))*Math.min(1,2.5*dt);
    G.position.copy(P);G.rotation.order='YXZ';G.rotation.set(-(pitch+rot),h,FL.bank);
    if(FL.s>=R.L-.2){G.position.set(R.P1.p.x,0,R.P1.p.z);G.rotation.set(0,R.P1.h,0);}}
  if(ph!==FL.lastPh){FL.lastPh=ph;if(ANN[ph]){subtitle(ANN[ph](f));if(ph==='board'||ph==='roll'||ph==='approach'||ph==='landing')chime();}if(ph==='landing')FL.touch=false;}
  FL.ph=ph;FL.v=v;
  /* train d'atterrissage, feux */
  const gy=G.position.y,wantGear=!(gy>45&&(ph==='climb'||ph==='cruise'||ph==='descent'))&&!(ph==='approach'&&gy>170);gearK+=((wantGear?1:0)-gearK)*Math.min(1,1.2*dt*K);G.userData.gear.scale.y=Math.max(.02,gearK);G.userData.gear.visible=gearK>.05;
  G.userData.landOn=ph==='roll'||ph==='approach'||ph==='landing'||(ph==='climb'&&gy<300);tickPlaneLights27(G,performance.now()*.001,true);
  if(ph==='landing'&&!FL.touch&&gy<.05&&FL.s>R.marks[R.C.findIndex(c=>c[3]==='landing')]){FL.touch=true;CAMX.shake=.4;tone(70,0,.5,.12,'triangle');}
  /* temps, joueur, interface */
  const prog=ph==='board'?0:ph==='push'?FL.sp/R.Lp*.01:clamp(FL.s/R.L,0,1);gameMin+=dt*K*(ph==='cruise'||ph==='climb'||ph==='descent'?.9:.15);
  player.x=G.position.x;player.z=G.position.z;player.h=G.rotation.y;player.moving=0;
  FL.uiT=(FL.uiT||0)-dt;if(FL.uiT<=0){FL.uiT=.2;
    UI.phase.textContent=PH[ph]||'';UI.fill.style.width=(prog*100).toFixed(1)+'%';UI.ic.style.left=(prog*100).toFixed(1)+'%';
    const ft=Math.round(gy*70/50)*50;UI.alt.textContent=ft.toLocaleString('fr-FR')+' ft';UI.spd.textContent=Math.round(v*K>0?v*5.2:0)+' km/h';
    const remMin=Math.max(0,Math.round((1-prog)*(from(f)==='pax'?65:70)));UI.eta.textContent=ph==='gate'?'À la porte':remMin>=60?Math.floor(remMin/60)+' h '+String(remMin%60).padStart(2,'0'):remMin+' min';
    UI.km.textContent=Math.round((1-prog)*f.km).toLocaleString('fr-FR')+' km';
    FL.mapT=(FL.mapT||0)-1;if(FL.mapT<=0){FL.mapT=2;drawMap(UI.map,'hud');if(FL.view==='carte'){drawMap(UI.big,'full');UI.info.innerHTML=infoHtml(f,ph,prog);}if(FL.view==='cabine'&&FL.ifeC){drawMap(FL.ifeC,'ife');FL.ifeT.needsUpdate=true;}}}
  if(FL.cab){const d=dayK27();FL.cab.win.color.setRGB(.25+.7*d,.32+.62*d,.45+.55*d);}
  const th=ph==='roll'?.95:ph==='climb'?.8:ph==='cruise'?.6:ph==='descent'?.35:ph==='approach'?.45:ph==='landing'?(v>30?.9:.3):ph==='board'?.05:.22;jetSet(th,FL.view==='cabine'||FL.view==='hublot');
  if(ph==='gate'){FL.endT=(FL.endT||0)+dt;if(FL.endT>1.6&&!FL.ending){FL.ending=true;endFlight();}}else FL.endT=0;
}
const from=f=>f.from;
function infoHtml(f,ph,prog){const lt=hhmm(gameMin);return `<div><small>VOL</small><b>${f.code}</b><span>${esc(f.fromN)} → ${esc(f.toN)}</span></div><div><small>PHASE</small><b>${PH[ph]}</b></div><div><small>ALTITUDE</small><b>${UI.alt.textContent}</b></div><div><small>VITESSE SOL</small><b>${UI.spd.textContent}</b></div><div><small>HEURE LOCALE</small><b>${lt}</b></div><div><small>ARRIVÉE DANS</small><b>${UI.eta.textContent}</b></div><div><small>TEMPÉRATURE À DESTINATION</small><b>${f.temp}</b></div><div><small>PARCOURU</small><b>${Math.round(prog*100)} %</b></div>`;}
function endFlight(){const f=FL.f,to=f.to;fade(true,()=>{
  FL.on=false;FL.ending=false;jetStop();if(FL.me){FL.cab.g.remove(FL.me);FL.me=null;}player.mesh.visible=true;FL.cab.g.visible=false;UI.d.hidden=true;$('#hud').hidden=false;camera.up.set(0,1,0);camera.far=FL.oldFar||420;camera.updateProjectionMatrix();tickClouds(false);
  const T=W27.terms[to];player.x=T.spot.arr.x;player.z=T.spot.arr.z;player.h=T.spot.arrH;camYaw=T.spot.arrH;camPitch=.38;camT=1;if(window.CAMX)CAMX.tgt=null;
  S27.ticket=null;save27();updateGates(true);placePlane();
  const first=!S27.seen[to];S27.seen[to]=1;save27();saveProgress();
  setTimeout(()=>{banner(to==='sol'?'Île de Solenne':'Port-Aurore',to==='sol'?'Bienvenue · '+f.temp+' · heure locale '+hhmm(gameMin):'Retour à la maison · '+hhmm(gameMin));toast(to==='sol'?(first?'Bienvenue à Solenne ! Hôtel, marché, plage et bar t’attendent au sud de l’aéroport.':'De retour à Solenne.'):'Bienvenue à Port-Aurore. L’autoroute A1 te ramène en ville.','good');},700);
  fade(false);});}
/* fondu au noir */
let fadeEl=null;function fade(on,cb,dur){if(!fadeEl){fadeEl=el('div');fadeEl.id='fade27';$('#app').appendChild(fadeEl);}dur=dur||.6;fadeEl.style.transitionDuration=dur+'s';fadeEl.classList.toggle('on',!!on);if(cb)setTimeout(cb,dur*1000+40);}
window.fade27=fade;
/* bandeau de lieu (style jeux en monde ouvert) */
let banEl=null;function banner(t,s){if(!banEl){banEl=el('div');banEl.id='loc27';$('#app').appendChild(banEl);}banEl.innerHTML='<b>'+esc(t)+'</b><span>'+esc(s||'')+'</span>';banEl.classList.remove('on');void banEl.offsetWidth;banEl.classList.add('on');clearTimeout(banEl._t);banEl._t=setTimeout(()=>banEl.classList.remove('on'),4600);}
window.banner27=banner;
/* ---------------- sûreté : barrière ouverte avec un billet ---------------- */
function updateGates(force){Object.values(W27.terms).forEach(T=>{const lock=!(S27.ticket&&S27.ticket.from===T.id);if(!force&&T.secu.locked===lock)return;T.secu.locked=lock;const i=boxes.indexOf(T.secu.box);if(lock&&i<0)boxes.push(T.secu.box);if(!lock&&i>=0)boxes.splice(i,1);});}
function tickGates(dt){Object.values(W27.terms).forEach(T=>{if(!T.secu)return;const m=T.secu.mesh,tg=T.secu.locked?0:-1.95;m.position.z+=(tg-m.position.z)*Math.min(1,4*dt);m.material.color.setHex(T.secu.locked?0xb32d2d:0x2ecc71);});}
/* ---------------- s'asseoir ---------------- */
const SIT={on:false};
function sitDown(ap){const T=W27.terms[ap];let best=null,bd=1e9;T.seatsW.forEach(s=>{if(s.taken)return;const d=Math.hypot(s.x-player.x,s.z-player.z);if(d<bd){bd=d;best=s;}});if(!best)return;
  SIT.on=true;SIT.s=best;player.x=best.x;player.z=best.z;player.h=best.h;const m=player.mesh;m.position.set(best.x,.08,best.z);m.rotation.set(0,best.h,0);if(T26.sitPose)T26.sitPose(m,null);toast('Tu t’installes en salle d’attente. Bouge pour te lever.','');}
function standUp(){SIT.on=false;if(T26.unsit)T26.unsit(player.mesh);}
/* ---------------- billetterie (interface pro) ---------------- */
let BK=null;
function booking(ap){const f=FLIGHTS[ap];if(!BK){BK=el('div');BK.id='air27';BK.hidden=true;$('#app').appendChild(BK);BK.addEventListener('pointerdown',e=>e.stopPropagation());}
  panelOpen=true;for(const k in keys)keys[k]=false;BK.hidden=false;const tk=S27.ticket&&S27.ticket.from===ap?S27.ticket:null;let cls=tk?tk.cls:'eco';
  const draw=()=>{const price=cls==='biz'?f.biz:f.eco,seat=cls==='biz'?'3A':'15A',dep=hhmm(gameMin+20),can=state.cash+state.bank>=price;
    BK.innerHTML=`<div class="bk-wrap"><header class="bk-h"><div class="bk-brand"><span class="fl-logo"></span><div><b>AURORE AIRWAYS</b><small>Billetterie · ${ap==='pax'?'Aéroport International de Port-Aurore':'Aéroport de Solenne'}</small></div></div><button class="bk-x" data-a="close" aria-label="Fermer">✕</button></header>
    <div class="bk-body"><section class="bk-left"><div class="bk-kick">${tk?'TON BILLET':'PROCHAIN DÉPART'}</div>
      <div class="bk-flight"><div class="bk-city"><b>${f.fromC}</b><span>${esc(f.fromN)}</span></div><div class="bk-path"><i></i><em>✈</em><small>${f.dur} · ${f.km.toLocaleString('fr-FR')} km</small></div><div class="bk-city r"><b>${f.toC}</b><span>${esc(f.toN)}</span></div></div>
      <div class="bk-meta"><div><small>Vol</small><b>${f.code}</b></div><div><small>Départ</small><b>${tk?'Embarquement':dep}</b></div><div><small>Porte</small><b>${f.gate}</b></div><div><small>Appareil</small><b>A320</b></div></div>
      ${tk?'':`<div class="bk-kick">CLASSE</div><div class="bk-cls"><button data-c="eco" class="${cls==='eco'?'on':''}"><b>Économique</b><span>Siège hublot 15A · bagage cabine · collation</span><em>${fmt(f.eco)}</em></button><button data-c="biz" class="${cls==='biz'?'on':''}"><b>Affaires</b><span>Siège 3A · salon · repas chaud · priorité</span><em>${fmt(f.biz)}</em></button></div>`}
      <div class="bk-acts">${tk?`<button class="primary" data-a="route">Itinéraire vers la porte ${f.gate}</button><button data-a="refund">Annuler · remboursé ${fmt(Math.round((tk.cls==='biz'?f.biz:f.eco)*.8))}</button>`:`<button class="primary" data-a="buy" ${can?'':'disabled'}>Acheter · ${fmt(price)}</button><small class="bk-wallet">Cash ${fmt(state.cash)} · Banque ${fmt(state.bank)}${can?'':' · fonds insuffisants'}</small>`}</div></section>
     <section class="bk-pass ${tk?'ok':''}"><div class="bp-top"><span class="fl-logo"></span><b>CARTE D’EMBARQUEMENT</b><em>${cls==='biz'?'AFFAIRES':'ÉCO'}</em></div>
      <div class="bp-name"><small>Passager</small><b>${esc(state.name.toUpperCase())}</b></div>
      <div class="bp-row"><div><small>De</small><b>${f.fromC}</b></div><div><small>Vers</small><b>${f.toC}</b></div><div><small>Vol</small><b>${f.code}</b></div></div>
      <div class="bp-row"><div><small>Porte</small><b>${f.gate}</b></div><div><small>Siège</small><b>${tk?tk.seat:seat}</b></div><div><small>Groupe</small><b>${cls==='biz'?'1':'3'}</b></div></div>
      <div class="bp-cut"></div><div class="bp-bar"></div><small class="bp-hint">${tk?'Billet valide · passe le contrôle de sûreté':'Aperçu · non payé'}</small></section></div></div>`;
    BK.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{cls=b.dataset.c;draw();});
    BK.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;
      if(a==='close')closeBK();
      else if(a==='buy'){if(!pay27(price)){toast('Fonds insuffisants.','bad');return;}S27.ticket={from:ap,to:f.to,cls,seat,code:f.code};save27();updateGates();beep(true);toast('Billet '+f.code+' acheté. Passe le contrôle de sûreté puis rends-toi porte '+f.gate+'.','good');booking(ap);}
      else if(a==='refund'){const r=Math.round((tk.cls==='biz'?f.biz:f.eco)*.8);state.bank+=r;S27.ticket=null;save27();updateGates();toast('Billet annulé. '+fmt(r)+' remboursés sur ton compte.','warn');booking(ap);}
      else if(a==='route'){const g=W27.terms[ap].spot.gate;wp={x:g.x,z:g.z,l:'Porte '+f.gate};closeBK();toast('Repère placé sur la porte '+f.gate+'.','good');}});};
  draw();}
function closeBK(){if(BK)BK.hidden=true;panelOpen=false;}
const _cp27=closePanel;closePanel=function(){_cp27();if(BK&&!BK.hidden)BK.hidden=true;};
/* ---------------- lieux de l'aéroport et de Solenne ---------------- */
function air(id){const [k,a]=id.split('@'),ap=a||'pax',T=W27.terms[ap],f=FLIGHTS[ap],tk=S27.ticket&&S27.ticket.from===ap;
  if(k==='checkin')booking(ap);
  else if(k==='secu'){if(tk){beep(true);toast('Contrôle de sûreté : ✓ RAS. Rends-toi porte '+f.gate+'.','good');}else{beep(false);openPanel('Contrôle de sûreté','Accès réservé aux passagers munis d’une carte d’embarquement. Achète ton billet au comptoir Aurore Airways ('+fmt(f.eco)+' en éco).',[{label:'Aller au comptoir',fn:()=>{const c=T.spot.checkin;wp={x:c.x,z:c.z,l:'Comptoir Aurore Airways'};}}]);}}
  else if(k==='sortie'){const p=T.toW(T.spot.uS-5,0);player.x=p.x;player.z=p.z;player.h=T.spot.arrH;camYaw=T.spot.arrH;camT=1;toast('Retour au hall public.','');}
  else if(k==='wait')openPanel(ap==='pax'?'Salle d’attente · Porte A1':'Salle d’attente · Porte 1',(tk?'Ton vol '+f.code+' embarque porte '+f.gate+'. ':'Prochain départ : '+f.code+' vers '+f.toN+'. ')+'Énergie : '+Math.round(state.energy)+' / 100.',[
    {label:'S’asseoir',fn:()=>sitDown(ap)},{label:'Faire une petite sieste · 45 min',off:state.energy>=95,fn:()=>{sitDown(ap);state.energy=Math.min(100,state.energy+18);gameMin+=45;toast('Petite sieste en salle d’attente. +18 énergie','good');}}]);
  else if(k==='cafe'){const buy=(n,c,fn)=>({label:n+' · '+fmt(c),off:state.cash+state.bank<c,fn:()=>{if(!pay27(c))return;fn();toast(n+' : merci !','good');air(id);}});
    openPanel(ap==='pax'?'Café des Pistes':'Bar des Alizés','Vue sur les pistes. Faim '+Math.round(state.hunger)+' · Énergie '+Math.round(state.energy)+'.',[buy('Expresso',4,()=>{state.energy=Math.min(100,state.energy+16);}),buy('Croissant',6,()=>{state.hunger=Math.min(100,state.hunger+18);}),buy('Club sandwich',11,()=>{state.hunger=Math.min(100,state.hunger+40);}),buy(ap==='pax'?'Jus d’orange pressé':'Cocktail de fruits',5,()=>{if(state.thirst!=null)state.thirst=Math.min(100,state.thirst+30);state.fun=Math.min(100,state.fun+4);})]);}
  else if(k==='df'){const buy=(n,c,fu)=>({label:n+' · '+fmt(c),off:state.cash+state.bank<c,fn:()=>{if(!pay27(c))return;state.fun=Math.min(100,state.fun+fu);toast(n+' acheté. +'+fu+' humeur','good');}});
    openPanel(ap==='pax'?'Duty Free':'Boutique du Lagon','Hors taxes, avant l’embarquement.',[buy('Parfum « Aurore »',85,20),buy('Lunettes de soleil',40,12),buy('Chocolats du port',18,7),buy(ap==='pax'?'Mug Port-Aurore':'Collier de coquillages',12,5)]);}
  else if(k==='gate'){if(tk)openPanel('Porte '+f.gate+' · '+f.code,'Embarquement immédiat à destination de '+f.toN+'. Siège '+S27.ticket.seat+'. Durée de vol : '+f.dur+'.',[{label:'Embarquer',fn:()=>startFlight(ap)}]);
    else openPanel('Porte '+f.gate,'Seuls les passagers du vol '+f.code+' peuvent embarquer ici. Achète un billet au comptoir.',[]);}
  else if(k==='info')openPanel(ap==='pax'?'Information · PAX':'Office du tourisme','Vol '+f.code+' vers '+f.toN+' · '+f.dur+' · porte '+f.gate+'. 1) Achète ton billet au comptoir Aurore Airways. 2) Passe le contrôle de sûreté. 3) Attends en salle d’embarquement puis présente-toi à la porte. '+(ap==='sol'?'Au sud : village, marché, Hôtel Lagon Bleu, plage, bar Le Coquillage et ponton.':'Pendant le vol, choisis ta caméra (cinéma, extérieur, hublot, cabine) et suis le trajet en direct sur la carte.'),[{label:'Repère vers le comptoir',fn:()=>{const c=T.spot.checkin;wp={x:c.x,z:c.z,l:'Comptoir Aurore Airways'};}}]);}
function sol(k){const buy=(n,c,fn,msg)=>({label:n+(c?' · '+fmt(c):''),off:state.cash+state.bank<c,fn:()=>{if(c&&!pay27(c))return;fn();toast(msg||(n+' : merci !'),'good');}});
  if(k==='hotel')openPanel('Hôtel Lagon Bleu','Chambres vue mer, piscine à débordement et spa. Énergie '+Math.round(state.energy)+' · Santé '+Math.round(state.health)+'.',[
    buy('Chambre vue mer · jusqu’à 8 h',90,()=>{state.energy=100;state.fun=Math.min(100,state.fun+15);state.hunger=Math.max(0,state.hunger-20);gameMin=(Math.floor(gameMin/1440)+((gameMin%1440)>=480?1:0))*1440+480;},'Nuit de rêve au Lagon Bleu. Il est 8 h.'),
    buy('Piscine et transat',12,()=>{state.fun=Math.min(100,state.fun+22);state.energy=Math.max(0,state.energy-4);gameMin+=40;},'Plongeon à la piscine. +22 humeur'),buy('Spa et massage',45,()=>{state.health=100;state.fun=Math.min(100,state.fun+15);gameMin+=60;},'Massage aux huiles de coco. Santé au max.')]);
  else if(k==='marche')openPanel('Marché de Solenne','Fruits, poisson du jour et beignets. Faim '+Math.round(state.hunger)+'.',[buy('Mangue',3,()=>{state.hunger=Math.min(100,state.hunger+12);}),buy('Noix de coco fraîche',4,()=>{state.hunger=Math.min(100,state.hunger+6);if(state.thirst!=null)state.thirst=Math.min(100,state.thirst+35);}),buy('Beignets banane',5,()=>{state.hunger=Math.min(100,state.hunger+18);}),buy('Poisson grillé du lagon',12,()=>{state.hunger=Math.min(100,state.hunger+45);})]);
  else if(k==='bar')openPanel('Le Coquillage','Les pieds dans le sable. Humeur '+Math.round(state.fun)+'.',[buy('Cocktail du lagon',9,()=>{state.fun=Math.min(100,state.fun+18);}),buy('Jus de coco',5,()=>{if(state.thirst!=null)state.thirst=Math.min(100,state.thirst+30);state.fun=Math.min(100,state.fun+5);}),buy('Soirée sur la plage',25,()=>{state.fun=Math.min(100,state.fun+40);state.energy=Math.max(0,state.energy-10);gameMin+=90;state.rep+=1;},'Soirée mémorable sur la plage ! +40 humeur')]);
  else if(k==='ponton')openPanel('Ponton de Solenne','Excursions en bateau autour de l’île.',[buy('Tour de l’île · 1 h',40,()=>{fade(true,()=>{gameMin+=60;state.fun=Math.min(100,state.fun+35);fade(false);});},'Des dauphins ont suivi le bateau 🐬 +35 humeur'),buy('Plongée au récif · 2 h',65,()=>{fade(true,()=>{gameMin+=120;state.fun=Math.min(100,state.fun+50);state.energy=Math.max(0,state.energy-15);fade(false);});},'Tortues et poissons-perroquets au récif ! +50 humeur')]);
  else if(k==='chapelle')openPanel('Chapelle Sainte-Anne','Petite chapelle blanche face au lagon. Un moment de calme.',[buy('Se recueillir',0,()=>{state.fun=Math.min(100,state.fun+8);gameMin+=15;},'Moment de sérénité. +8 humeur')]);}
function zone(k){
  if(k==='stade'){const T=['Port-Aurore FC','Solenne Étoile','AS Littoral','Dockers United'],o=pick(T.slice(1));openPanel('Stade Aurore','Match du jour : Port-Aurore FC – '+o+'. 32 000 places, ambiance garantie.',[{label:'Billet tribune · '+fmt(15),off:state.cash+state.bank<15,fn:()=>{if(!pay27(15))return;fade(true,()=>{gameMin+=105;state.fun=Math.min(100,state.fun+30);state.rep+=1;const a=Math.floor(rand(0,4)),b=Math.floor(rand(0,3));fade(false);toast('Coup de sifflet final : Port-Aurore FC '+a+' – '+b+' '+o+'. +30 humeur','good');});}}]);return;}
  const activity=(label,cost,fn,msg)=>({label:label+(cost?' · '+fmt(cost):''),off:state.cash+state.bank<cost,fn:()=>{if(cost&&!pay27(cost))return;fn();toast(msg,'good');}});
  if(k==='cinema'){
    const film=pick(['Les Marées d’Aurore','Dernier Tram pour Solenne','Le Gardien du Phare','Une Nuit au Port']);
    openPanel('Cinéma Aurore','Six salles, séances toute la journée. À l’affiche : '+film+'.',[
      activity('Séance · '+film,18,()=>{gameMin+=115;state.fun=Math.min(100,state.fun+30);},'Séance terminée. +30 humeur'),
      activity('Pop-corn et soda',8,()=>{state.hunger=Math.min(100,state.hunger+12);if(state.thirst!=null)state.thirst=Math.min(100,state.thirst+14);},'Pause snack au cinéma.')
    ]);return;
  }
  if(k==='mall'){
    openPanel('Galerie du Port','Centre commercial du quartier : boutiques, restauration et services.',[
      activity('Déjeuner au food court',14,()=>{state.hunger=Math.min(100,state.hunger+35);state.fun=Math.min(100,state.fun+7);gameMin+=35;},'Déjeuner pris. +35 faim'),
      activity('Après-midi shopping',32,()=>{state.fun=Math.min(100,state.fun+22);gameMin+=55;},'Nouvelles boutiques découvertes. +22 humeur'),
      activity('Pause au café',6,()=>{state.energy=Math.min(100,state.energy+8);if(state.thirst!=null)state.thirst=Math.min(100,state.thirst+20);},'Petite pause, ça repart.')
    ]);return;
  }
  if(k==='campus'){
    openPanel('Campus Aurore','Bibliothèque, amphithéâtre et ateliers ouverts aux habitants.',[
      activity('Atelier de conduite responsable · 45 min',0,()=>{gameMin+=45;state.rep+=1;state.fun=Math.min(100,state.fun+8);},'Atelier terminé. Réputation +1'),
      activity('Étudier à la bibliothèque · 1 h',0,()=>{gameMin+=60;state.energy=Math.max(0,state.energy-4);state.rep+=1;},'Une heure productive. Réputation +1')
    ]);return;
  }
  if(k==='fire'){
    openPanel('Caserne 7','Les pompiers accueillent le public pour des initiations aux premiers secours.',[
      activity('Initiation aux premiers secours · 30 min',12,()=>{gameMin+=30;state.health=Math.min(100,state.health+12);state.rep+=1;},'Initiation réussie. Santé +12'),
      activity('Visite de la caserne',0,()=>{gameMin+=15;state.fun=Math.min(100,state.fun+5);},'Les véhicules de secours sont impressionnants.')
    ]);return;
  }
  if(k==='police'){
    openPanel('Commissariat Nord','Accueil du public et ateliers de prévention routière.',[
      activity('Atelier de prévention · 30 min',8,()=>{gameMin+=30;state.rep+=1;state.fun=Math.min(100,state.fun+5);},'Atelier terminé. Réputation +1'),
      activity('Déclarer un objet perdu',0,()=>{gameMin+=10;},'Déclaration enregistrée à l’accueil.')
    ]);return;
  }
  if(k==='museum'){
    openPanel('Musée maritime','L’histoire du port, des phares et des grandes traversées de Port-Aurore.',[
      activity('Entrée adulte',10,()=>{gameMin+=50;state.fun=Math.min(100,state.fun+18);},'Visite terminée. +18 humeur'),
      activity('Exposition temporaire · « Les routes du lagon »',16,()=>{gameMin+=70;state.fun=Math.min(100,state.fun+26);state.rep+=1;},'Belle découverte. Humeur +26, réputation +1')
    ]);
  }
}
const _os27=openSpot;openSpot=function(id){if(typeof id==='string'){if(id.startsWith('air27:')){air(id.slice(6));return;}if(id.startsWith('sol27:')){sol(id.slice(6));return;}if(id.startsWith('zone27:')){zone(id.slice(7));return;}}_os27(id);};
/* ---------------- trafic aérien d'ambiance (PAX) ---------------- */
const AMB=window.AMB27={p:null,st:'wait',t:8,kind:'takeoff',hide(){if(AMB.p)AMB.p.visible=false;AMB.st='wait';AMB.t=30;}};
function ambStart(kind){if(!AMB.p){AMB.p=makePlane27({livery:pick(['sahel','atlantic'])});scene.add(AMB.p);}AMB.kind=kind;AMB.s=0;AMB.st='go';AMB.p.visible=true;
  const C=kind==='takeoff'?[[-760,0,140,6],[-760,0,60,25],[-760,0,-150,60],[-760,0,-300,78],[-760,30,-480,85],[-780,140,-800,95],[-860,300,-1300,110],[-1000,420,-1900,130]]:[[-1000,380,-2300,130],[-860,240,-1700,100],[-765,100,-1150,82],[-760,10,-760,74],[-760,0,-680,70],[-760,0,-400,40],[-760,0,0,14],[-760,0,90,8]];
  AMB.C=C;AMB.curve=new THREE.CatmullRomCurve3(C.map(c=>new THREE.Vector3(c[0],c[1],c[2])),false,'centripetal');AMB.curve.arcLengthDivisions=2000;AMB.L=AMB.curve.getLength();
  const S=AMB.curve.getSpacedPoints(2000);AMB.M=C.map((c,i)=>{let b=0,bd=1e9;S.forEach((p,k)=>{const d=Math.hypot(p.x-c[0],p.y-c[1],p.z-c[2]);if(d<bd){bd=d;b=k;}});return b/2000*AMB.L;});}
AMB.start=ambStart;
function tickAmb(dt){if(FL.on||inSol27()&&started){if(AMB.p)AMB.p.visible=false;return;}
  if(AMB.st==='wait'){AMB.t-=dt;if(AMB.t<=0)ambStart(AMB.kind==='takeoff'?'landing':'takeoff');return;}
  AMB.s=Math.max(0,AMB.s||0);const C=AMB.C,M=AMB.M;let i=0;while(i<M.length-2&&AMB.s>=M[i+1])i++;const t=clamp((AMB.s-M[i])/Math.max(1,M[i+1]-M[i]),0,1),v=lerp(C[i][3],C[i+1][3],t);AMB.s+=v*dt;
  if(AMB.s>=AMB.L){AMB.p.visible=false;AMB.st='wait';AMB.t=rand(35,70);return;}
  const u=AMB.s/AMB.L,P=AMB.curve.getPointAt(u),Tg=AMB.curve.getTangentAt(u);P.y=Math.max(0,P.y);AMB.p.position.copy(P);AMB.p.rotation.order='YXZ';
  let rot=0;if(AMB.kind==='takeoff'&&P.y<30&&AMB.s>M[2]-60)rot=.12;if(AMB.kind==='landing'&&P.y<20&&P.y>.2)rot=.07;
  AMB.p.rotation.set(-(Math.asin(clamp(Tg.y,-1,1))+rot),Math.atan2(Tg.x,Tg.z),0);AMB.p.userData.gear.visible=P.y<60;AMB.p.userData.landOn=P.y<300;tickPlaneLights27(AMB.p,performance.now()*.001,true);}
/* ---------------- zones : bandeau à l'entrée ---------------- */
let zoneT=0,curZ=null;function tickZones(dt){zoneT-=dt;if(zoneT>0||!started||FL.on||player.inside)return;zoneT=.5;const z=W27.zones.find(q=>player.x>q.x0&&player.x<q.x1&&player.z>q.z0&&player.z<q.z1)||null;
  const id=z?z.id:(Math.abs(player.x)<262&&player.z>-262?'city':null);if(id!==curZ){const prev=curZ;curZ=id;if(prev===undefined)return;if(z)banner(z.n,z.s);else if(id==='city'&&prev)banner('Port-Aurore','Centre-ville');}}
/* ---------------- branchements ---------------- */
const _uP=updatePlayer;updatePlayer=function(dt){if(FL.on)return;if(SIT.on){const i=(panelOpen||chatOpen)?{x:0,z:0}:getInput();if(Math.hypot(i.x,i.z)>.3){standUp();_uP(dt);return;}const s=SIT.s,m=player.mesh;player.x=s.x;player.z=s.z;player.h=s.h;m.position.set(s.x,.08,s.z);m.rotation.set(0,s.h,0);player.moving=0;state.energy=Math.min(100,state.energy+.12*dt);return;}_uP(dt);};
const _uC=updateCamera;updateCamera=function(dt){_uC(dt);if(!started)return;if(FL.on){try{camFlight(dt);}catch(e){if(!FL.ce){FL.ce=1;console.warn('v27 cam',e);}}}};
const _uPr=updatePrompt;updatePrompt=function(){if(FL.on){if(promptKey!==''){promptKey='';$('#prompt').hidden=true;}nearSpot=null;nearCar=null;nearPed=null;return;}_uPr();
  if(!panelOpen&&!chatOpen&&nearSpot&&typeof nearSpot.id==='string'){const id=nearSpot.id;let t=null;const ap=id.includes('@sol')?'sol':'pax',tk=S27.ticket&&S27.ticket.from===ap;
    if(id.startsWith('air27:secu'))t=tk?'E · Contrôle de sûreté ✓ billet '+S27.ticket.code:'E · Contrôle de sûreté · billet requis';if(id.startsWith('air27:gate'))t=tk?'E · Embarquer · '+FLIGHTS[ap].code+' vers '+FLIGHTS[ap].toN:'E · Porte '+FLIGHTS[ap].gate+' · billet requis';
    if(t&&t!==promptKey){promptKey=t;const b=$('#prompt');b.hidden=false;b.textContent=t;}}};
const _int=interact;interact=function(){if(FL.on)return;if(SIT.on){standUp();return;}_int();};
const _upd=update;update=function(dt){_upd(dt);dt=Math.max(0,dt);try{if(FL.on)tickFlight(dt);tickClouds(FL.on);tickAmb(dt);tickGates(dt);tickZones(dt);if(FL.plane&&!FL.on)tickPlaneLights27(FL.plane,performance.now()*.001,false);}catch(e){if(!FL.err){FL.err=1;console.warn('v27 vol',e);}}};
if(typeof updateMission==='function'){const _um=updateMission;updateMission=function(dt){if(inSol27()||FL.on){if(mission){mission=null;if(beam)beam.visible=false;}return;}_um(dt);};}
const _obm=openBigMap;openBigMap=function(){if(FL.on){setView(FL.view==='carte'?'cine':'carte');return;}if(inSol27()&&started){toast('Le plan GPS couvre Port-Aurore. À Solenne, suis les panneaux : plage au sud, hôtel à l’est, marché à l’ouest.','warn');return;}_obm();};
const _tph=togglePhone;togglePhone=function(){if(FL.on){toast('Mode avion activé ✈️','');return;}_tph();};
const _phO=phOpen;phOpen=function(a){if(inSol27()&&a&&['Taxi','Transports','Livraison','Plan','Chantier','Boulot','Mobilier'].includes(a[0])){phApp=a;$('#ph-back').hidden=false;$('#ph-title').textContent=a[0];const b=$('#ph-body');b.className='pb';b.innerHTML='<div class="vols27-off"><b>Indisponible à Solenne</b><span>Ce service fonctionne à Port-Aurore. Rentre avec le vol AA 275 depuis l’aéroport de l’île.</span></div>';return;}_phO(a);};
const _sv=saveProgress;saveProgress=function(){if(FL.on&&FL.saveAt){const x=player.x,z=player.z,pi=player.inside;player.inside=null;player.x=FL.saveAt.x;player.z=FL.saveAt.z;_sv();player.x=x;player.z=z;player.inside=pi;}else _sv();save27();};
const _rs=respawn;respawn=function(){const was=inSol27();if(SIT.on)standUp();_rs();if(was){placePlane();toast('Rapatrié à l’hôpital de Port-Aurore.','bad');}};
const _rp=resetProgress;resetProgress=function(){try{localStorage.removeItem(LS);}catch(e){}_rp();};
const _rstP=restorePosition;restorePosition=function(){_rstP();placePlane();updateGates(true);curZ=undefined;};
/* touches pendant le vol */
addEventListener('keydown',e=>{if(!FL.on||paused)return;const k=(e.key||'').toLowerCase();if(k==='escape'||k==='p')return;
  if(k==='v'){const L=['cine','ext','hublot','cabine','carte'];setView(L[(L.indexOf(FL.view)+1)%L.length]);}else if(k==='m'){setView(FL.view==='carte'?'cine':'carte');}else if(k===' '){skipPhase();}
  else if(k==='1'||k==='2'||k==='4'){FL.speed=+k;uiSync();}
  e.stopImmediatePropagation();e.preventDefault();},true);
/* regard libre en hublot/cabine */
addEventListener('pointermove',e=>{if(!FL.on||!(e.buttons&1))return;if(FL.view==='hublot'||FL.view==='cabine'){FL.look.y=clamp(FL.look.y-(e.movementX||0)*.003,-1,1);FL.look.p=clamp(FL.look.p+(e.movementY||0)*.003,-1,1);}});
/* appli téléphone « Vols » */
function appVols(b){const ap=here(),f=FLIGHTS[ap],tk=S27.ticket;b.innerHTML=`<div class="vols27"><div class="v-hero"><span class="fl-logo"></span><div><b>Aurore Airways</b><small>${tk?'Billet '+tk.code:'Prochain vol depuis '+f.fromN}</small></div></div>
  <div class="v-pass"><div><b>${(tk?FLIGHTS[tk.from]:f).fromC}</b><small>${esc((tk?FLIGHTS[tk.from]:f).fromN)}</small></div><em>✈</em><div><b>${(tk?FLIGHTS[tk.from]:f).toC}</b><small>${esc((tk?FLIGHTS[tk.from]:f).toN)}</small></div></div>
  <div class="v-row"><span>Vol <b>${(tk?FLIGHTS[tk.from]:f).code}</b></span><span>Porte <b>${(tk?FLIGHTS[tk.from]:f).gate}</b></span><span>Siège <b>${tk?tk.seat:'—'}</b></span></div>
  <p>${tk?'Billet valide. Passe la sûreté puis présente-toi à la porte.':'Achète ton billet au comptoir Aurore Airways de l’aéroport ('+fmt(f.eco)+' en éco).'}</p><button class="v-go">${ap==='pax'?'Itinéraire vers l’aéroport':'Itinéraire vers l’aéroport de Solenne'}</button></div>`;
  b.querySelector('.v-go').onclick=()=>{const T=W27.terms[ap],p=T.toW(-4,0);wp={x:p.x,z:p.z,l:ap==='pax'?'Aéroport International':'Aéroport de Solenne'};toast('Itinéraire vers l’aéroport.','good');closePanel();};}
{const i=APPS.findIndex(a=>a[0]==='Vols');const A=['Vols','✈️','#0b1b3a,#f5c451',appVols];if(i>=0)APPS[i]=A;else APPS.splice(Math.min(6,APPS.length),0,A);}
CHANGELOG.unshift(['v27','Carte agrandie, aéroports de Port-Aurore et de Solenne, vols suivis en direct, nouvelle île, menu principal professionnel']);
/* création de l'avion du joueur une fois le monde construit */
const _bd=buildDecor;buildDecor=function(){_bd();try{FL.plane=makePlane27({livery:'aurore'});scene.add(FL.plane);placePlane();updateGates(true);ambStart('takeoff');AMB.s=0;}catch(e){console.warn('v27 avion',e);}};
})();
