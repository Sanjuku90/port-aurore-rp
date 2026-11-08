'use strict';
/* ==========================================================================
   v54 · CONDUITE + COMMANDES « ARCADE » + INTERFACE ALLÉGÉE
   1. Vraie mécanique : vitesses et régime, adhérence latérale limitée,
      drift au frein à main, nitro (se recharge en dérapant), poids des
      véhicules (moto, scooter, bus, camion, sportives), roulis, collisions.
   2. Commandes tactiles à la Asphalt Nitro : flèches de direction à gauche
      (on peut glisser d'une flèche à l'autre), NITRO / FREIN / DRIFT à droite,
      accélération automatique (désactivable), klaxon, vue, sortir.
   3. Interface à pied : nom, métier, rang et barres de besoins masqués ;
      une fine pastille de santé + icônes qui n'apparaissent qu'en cas d'alerte.
      Toucher la pastille ou l'argent affiche le détail quelques secondes.
   ========================================================================== */
(function(){
const q=s=>document.querySelector(s);
const cl=(v,a,b)=>v<a?a:v>b?b:v;
const touch=matchMedia('(pointer: coarse)').matches||('ontouchstart' in window);
const D=window.DRV54={touch,armed:false,auto:false,fovB:0,
  in:{gas:0,brake:0,left:0,right:0,hb:0,nitro:0},
  st:{thr:0,brk:0,steer:0,gear:1,rpm:0,drift:false,nit:1,nitOn:false}};

/* ---------------- classes de véhicules ---------------- */
const K={
  car:  {L:2.7,lock:.56,lockHi:.075,grip:16,acc:11,brake:21,heavy:0,name:'car'},
  sport:{L:2.6,lock:.58,lockHi:.085,grip:19.5,acc:15,brake:25,heavy:0,name:'sport'},
  bus:  {L:5.6,lock:.42,lockHi:.06,grip:11,acc:6.5,brake:13,heavy:1,name:'bus'},
  truck:{L:4.8,lock:.46,lockHi:.065,grip:12,acc:8,brake:14,heavy:1,name:'truck'},
  moto: {L:1.45,lock:.72,lockHi:.12,grip:17.5,acc:12,brake:19,heavy:0,lean:1,name:'moto'},
  scoot:{L:1.25,lock:.78,lockHi:.13,grip:15,acc:8,brake:15,heavy:0,lean:1,name:'scoot'}
};
function klass(c){const t=String(c.type||'sedan');
  if(t==='bus')return K.bus;if(t==='truck'||t==='firetruck')return K.truck;
  if(t==='motorcycle')return K.moto;if(t==='scooter')return K.scoot;
  if(/sport|lambo|ferrari|porsche|bmw|gt|nsx|m4|hyper|volt|rosso/i.test(t)||(c.top||27)>=34)return K.sport;
  return K.car;}

/* ---------------- lecture des commandes ---------------- */
function readInput(){
  const k=typeof keys!=='undefined'?keys:{},I=D.in;
  const gp=(typeof GP19!=='undefined'&&GP19.on)?GP19:null;
  let gas=(k.z||k.w||k.arrowup)?1:0,brake=(k.s||k.arrowdown)?1:0;
  let left=(k.q||k.a||k.arrowleft)?1:0,right=(k.d||k.arrowright)?1:0;
  let hb=k[' ']?1:0,nitro=k.shift?1:0,ax=0;
  if(typeof joy!=='undefined'&&Math.abs(joy.x)>.05)ax+=joy.x;
  if(typeof joy!=='undefined'){if(joy.y<-.2)gas=Math.max(gas,-joy.y);else if(joy.y>.2)brake=Math.max(brake,joy.y);}
  if(gp){ax+=gp.x;if(gp.y<-.15)gas=Math.max(gas,-gp.y);else if(gp.y>.15)brake=Math.max(brake,gp.y);
    if(gp.dpad.l)left=1;if(gp.dpad.r)right=1;if(gp.dpad.u)gas=1;if(gp.dpad.d)brake=1;if(gp.brake)hb=1;if(gp.run)nitro=1;}
  /* tactile */
  if(I.gas)gas=1;if(I.brake)brake=1;if(I.left)left=1;if(I.right)right=1;if(I.hb)hb=1;if(I.nitro)nitro=1;
  if(D.auto&&touch&&D.armed&&!brake&&!(gas>0))gas=1;
  const dig=right-left,steerIn=Math.abs(ax)>.05?cl(ax,-1,1):dig;
  return {gas:cl(gas,0,1),brake:cl(brake,0,1),steer:steerIn,analog:Math.abs(ax)>.05,hb,nitro};
}

/* ---------------- physique ---------------- */
function seed(c){c.vx=Math.sin(c.h)*c.v;c.vz=Math.cos(c.h)*c.v;c._pv=c.v;}
D.onEnter=function(c){D.armed=!touch||!D.auto;c.v=0;c.vx=0;c.vz=0;c._pv=0;c.yaw=0;c.stS=0;c.shiftT=0;if(c.nit==null)c.nit=1;c.rl=0;
  try{c.mesh.rotation.order='YXZ';}catch(e){}};
D.onExit=function(c){try{c.mesh.rotation.z=0;}catch(e){}c.vx=c.vz=0;c.nitOn=false;D.in.gas=D.in.brake=D.in.left=D.in.right=D.in.hb=D.in.nitro=0;D.armed=false;screech(0);};

D.step=function(c,dt){
  const blocked=(typeof panelOpen!=='undefined'&&panelOpen)||(typeof chatOpen!=='undefined'&&chatOpen);
  const I=blocked?{gas:0,brake:1,steer:0,analog:false,hb:0,nitro:0}:readInput(),K_=klass(c);
  if(c.vx===undefined||Math.abs(c.v-(c._pv||0))>.6)seed(c);
  if(c.nit==null)c.nit=1;
  const top=c.top||27,acc=c.acc||1;
  let fx=Math.sin(c.h),fz=Math.cos(c.h),rx=-Math.cos(c.h),rz=Math.sin(c.h);
  let fwd=c.vx*fx+c.vz*fz,lat=c.vx*rx+c.vz*rz;
  const sp=Math.abs(fwd),sf=cl(sp/top,0,1.4);
  /* accélération auto : à l'arrêt au frein, la voiture reste immobile jusqu'au prochain appui sur une commande */
  if(touch&&D.auto&&I.brake>.5&&sp<.4)D.armed=false;

  /* --- nitro : consomme la jauge, se recharge en dérapant --- */
  const wantN=I.nitro&&I.gas>.1&&fwd>3&&!c.nitLock&&c.nit>0;
  c.nitOn=!!wantN;
  if(c.nitOn){c.nit=Math.max(0,c.nit-dt*.3);if(c.nit<=0){c.nitLock=true;c.nitOn=false;if(typeof toast==='function')toast('Nitro vide : elle se recharge.','warn');}}
  else{const slide=Math.abs(lat)>2&&sp>9;c.nit=Math.min(1,c.nit+dt*(slide?.2:.045));if(c.nitLock&&c.nit>.3)c.nitLock=false;}
  const topEff=top*(c.nitOn?1.3:1);

  /* --- boîte de vitesses (6 rapports) : couple fort en bas, coupure à la montée --- */
  const gi=Math.min(5,Math.floor(cl(sp/topEff,0,.999)*6));
  if(gi>(c.g0||0)&&fwd>0){c.shiftT=.13;}
  c.g0=gi;c.shiftT=Math.max(0,(c.shiftT||0)-dt);
  const gFrac=cl(sp/topEff*6-gi,0,1),rpmT=fwd<-.3?cl(.3+sp/8*.5,.3,.8):(.28+.72*gFrac);
  c.rpm=(c.rpm||.3)+(Math.max(rpmT,I.gas>.1?rpmT:.2)-(c.rpm||.3))*Math.min(1,9*dt);c.gear=fwd<-.3?0:gi+1;
  const gMul=1.38-.12*gi,cut=c.shiftT>0?.25:1;

  /* --- longitudinal --- */
  let a=0;
  if(I.gas>.02){
    if(fwd<-.5)a=K_.brake*I.gas;
    else{const lim=1-Math.pow(cl(fwd/topEff,0,1),K_.heavy?2.2:3);a=K_.acc*acc*gMul*cut*I.gas*Math.max(0,lim)*(c.nitOn?1.9:1);
      if(fwd<4)a*=.85+fwd*.04;}
  }
  if(I.brake>.02){
    if(fwd>.5)a-=K_.brake*I.brake;
    else if(I.gas<.1){a-=5.5*I.brake*(fwd>-6?1:0);}
  }
  if(I.gas<.05&&I.brake<.05)a-=Math.sign(fwd)*(2.4+Math.abs(fwd)*.08);
  if(I.hb&&sp>.5)a-=Math.sign(fwd)*8;
  fwd+=a*dt;
  if(I.gas<.05&&I.brake<.05&&Math.abs(fwd)<.25&&a!==0&&Math.sign(a)!==Math.sign(fwd)){fwd=0;}
  fwd=Math.max(fwd,-6);
  if(fwd>topEff*1.01)fwd-=(fwd-topEff)*1.4*dt;   /* fin du nitro : la vitesse retombe en douceur */

  /* --- direction : progressive au clavier / boutons, directe à la manette --- */
  let s=c.stS||0,t=I.steer;
  if(I.analog)s=t;else{const rate=(Math.sign(t)!==Math.sign(s)&&s!==0)||t===0?(t===0?5.2:7.5):3.4;
    s+=cl(t-s,-rate*dt,rate*dt);}
  c.stS=s;
  const lock=K_.lock+(K_.lockHi-K_.lock)*Math.pow(cl(sf,0,1),.8);
  const hbk=I.hb&&sp>6?1:0;
  let yawT=fwd/K_.L*Math.tan(s*lock)*(1+.3*hbk);
  const grip0=K_.grip*(1-.8*hbk)*(1-.35*I.brake*cl(sf*1.3,0,1)*(sp>12?1:0));
  const yMax=hbk?1.5:Math.max(.25,K_.grip*.92/Math.max(sp,3));
  yawT=cl(yawT,-yMax,yMax);
  if(!hbk&&Math.abs(lat)>1.4)yawT+=cl(lat/Math.max(sp,5),-.8,.8)*1.15;   /* contre-braquage assisté */
  c.yaw=(c.yaw||0)+(yawT-(c.yaw||0))*Math.min(1,(K_.heavy?6:11)*dt);
  c.h-=c.yaw*dt;

  /* --- on garde la vitesse monde, on la reprojette sur le nouveau cap --- */
  const wx=fwd*fx+lat*rx,wz=fwd*fz+lat*rz;
  fx=Math.sin(c.h);fz=Math.cos(c.h);rx=-Math.cos(c.h);rz=Math.sin(c.h);
  fwd=wx*fx+wz*fz;lat=wx*rx+wz*rz;
  const spd0=Math.hypot(fwd,lat),gr=grip0*dt,rem=Math.min(Math.abs(lat),gr);
  lat-=Math.sign(lat)*rem;
  const drift=Math.abs(lat)>1.6&&spd0>8;
  let spd1=Math.hypot(fwd,lat);
  if(spd1>0.001){const keep=Math.min(spd0,spd1+rem*.96)*(drift?1-.22*dt:1);   /* le grip réaligne la vitesse sans la perdre */
    fwd=Math.sign(fwd||1)*Math.sqrt(Math.max(0,keep*keep-lat*lat));}
  lat*=Math.exp(-.7*dt);
  c.vx=fwd*fx+lat*rx;c.vz=fwd*fz+lat*rz;

  /* --- déplacement et collisions --- */
  const pre=Math.hypot(c.vx,c.vz);
  c.x+=c.vx*dt;c.z+=c.vz*dt;
  const hit=collideCarWorld(c);
  if(hit>0){
    c.vx*=.7;c.vz*=.7;c.yaw*=.6;if(c.nitOn)c.nit=Math.max(0,c.nit-.15);
    if(impactCd<=0&&pre>9){impactCd=.6;const dmg=(pre-8)*1.1;state.health=Math.max(0,state.health-dmg);toast('Collision. −'+Math.round(dmg)+' de santé','bad');
      if(window.HUD45&&HUD45.shake)HUD45.shake(Math.min(.8,pre/30));}
  }
  c.v=c.vx*Math.sin(c.h)+c.vz*Math.cos(c.h);c._pv=c.v;c.spd=Math.hypot(c.vx,c.vz);
  const speed=Math.abs(c.v);
  peds.forEach(p=>{
    if(speed>3&&Math.hypot(p.x-c.x,p.z-c.z)<1.7&&p.stun<=0){
      p.stun=2.5;p.wait=0;
      if(fineCd<=0){fineCd=5;const f=Math.min(60,state.cash+state.bank);takeMoney(f);toast('Piéton percuté. Amende '+fmt(f),'bad');say(p.mesh,'Hé ! Regardez où vous allez !',3);}
    }
  });

  /* --- visuel : roulis de caisse (ou inclinaison pour les deux-roues) --- */
  const latAcc=(c.yaw||0)*c.v;
  const rollT=K_.lean?cl(latAcc*.013,-.55,.55):cl(-latAcc*.0024,-.07,.07);
  c.rl=(c.rl||0)+(rollT-(c.rl||0))*Math.min(1,7*dt);
  try{c.mesh.rotation.z=c.rl;}catch(e){}

  /* --- état pour l'interface et les sons --- */
  const S=D.st;S.thr=I.gas;S.brk=I.brake;S.steer=s;S.gear=c.gear;S.rpm=c.rpm;S.drift=drift;S.nit=c.nit;S.nitOn=c.nitOn;
  screech(drift?cl((Math.abs(lat)-1)/5,0,1):0);
  D.fovB+=((c.nitOn?9:0)-D.fovB)*Math.min(1,4*dt);
  if(c.nitOn&&window.HUD45&&HUD45.shake)HUD45.shake(.12);
};

/* ---------------- son : régime moteur réel + crissement de pneus ---------------- */
(function(){
  if(typeof engineUpdate19!=='function')return;
  const _e=engineUpdate19;
  engineUpdate19=function(){
    _e();
    try{const c=player.car;if(!c||c.rpm==null||typeof engOsc==='undefined'||!engOsc)return;
      const p=eng19P(c.type),t=actx.currentTime,spEq=c.rpm*(c.top||27)*.85+(c.nitOn?3:0),hz=p.f+spEq*p.k;
      engOsc.frequency.setTargetAtTime(hz,t,.06);
      if(e19&&e19.sub)e19.sub.frequency.setTargetAtTime(hz*.5,t,.06);
      if(e19&&e19.bur)e19.bur.frequency.setTargetAtTime(hz*2,t,.06);
    }catch(e){}
  };
})();
let SC=null;
function screech(k){
  try{
    if(typeof actx==='undefined'||!actx)return;
    if(!SC){if(k<=0)return;
      const len=actx.sampleRate*1,buf=actx.createBuffer(1,len,actx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
      const src=actx.createBufferSource();src.buffer=buf;src.loop=true;
      const bp=actx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1700;bp.Q.value=3.5;
      const g=actx.createGain();g.gain.value=0;src.connect(bp);bp.connect(g);g.connect(actx.destination);src.start();SC={g,bp};}
    SC.g.gain.setTargetAtTime((typeof muted!=='undefined'&&muted)?0:k*.05,actx.currentTime,.06);
    SC.bp.frequency.setTargetAtTime(1500+k*500,actx.currentTime,.1);
  }catch(e){}
}

/* ---------------- caméra : le nitro ouvre le champ de vision ---------------- */
(function(){
  if(typeof updateCamera!=='function')return;
  const _uc=updateCamera;
  updateCamera=function(dt){_uc(dt);
    if(!started||!player.car||(window.AM&&AM.V))return;
    if(Math.abs(D.fovB)>.05&&typeof CAMX!=='undefined'){camera.fov=CAMX.fov+D.fovB;camera.updateProjectionMatrix();}
  };
})();

/* ---------------- interface tactile (d'après la maquette) ---------------- */
const IC='fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const SV={
  L:'<svg viewBox="0 0 24 24"><path d="M17 4v16L5 12z" fill="currentColor"/></svg>',
  R:'<svg viewBox="0 0 24 24"><path d="M7 4v16l12-8z" fill="currentColor"/></svg>',
  brake:'<svg viewBox="0 0 48 48"><path d="M8 8h32l-5 32H13z" fill="currentColor" opacity=".92"/><path d="M15 18h18M16 25h16M17 32h14" stroke="#1b2030" stroke-width="3.4" stroke-linecap="round" fill="none"/></svg>',
  gas:'<svg viewBox="0 0 48 64"><g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22l16-14 16 14"/><path d="M8 38l16-14 16 14"/><path d="M8 54l16-14 16 14"/></g></svg>',
  bag:'<svg viewBox="0 0 24 24" '+IC+'><path d="M9 6V5a3 3 0 0 1 6 0v1"/><rect x="5" y="6" width="14" height="15" rx="4"/><path d="M9 13h6M9 17h6"/></svg>',
  phone:'<svg viewBox="0 0 24 24" '+IC+'><rect x="7" y="2.5" width="10" height="19" rx="2.8"/><path d="M10.8 18.6h2.4"/></svg>',
  pump:'<svg viewBox="0 0 24 24" '+IC+'><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M4 21h12"/><path d="M8 8h4"/><path d="M15 9h2.5a1.5 1.5 0 0 1 1.5 1.5V16a1.5 1.5 0 0 0 3 0V9l-3-3"/></svg>',
  exit:'<svg viewBox="0 0 24 24" '+IC+'><path d="M2.5 12h8M6 8l-4 4 4 4"/><path d="M13 9l1.6-3h4.8L21 9v8h-8z"/><path d="M13 12.5h8"/></svg>'
};
function el(t,id,cls,html){const e=document.createElement(t);if(id)e.id=id;if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function arc(r,a0,a1){const p=a=>[60+Math.sin(a)*r,60-Math.cos(a)*r],A=p(a0),B=p(a1);return 'M'+A[0].toFixed(2)+' '+A[1].toFixed(2)+'A'+r+' '+r+' 0 '+((a1-a0)>Math.PI?1:0)+' 1 '+B[0].toFixed(2)+' '+B[1].toFixed(2);}
function arc2(r,a0,a1){const p=a=>[60+Math.sin(a)*r,60-Math.cos(a)*r],A=p(a0),B=p(a1);return 'M'+A[0].toFixed(2)+' '+A[1].toFixed(2)+'A'+r+' '+r+' 0 '+((a1-a0)>Math.PI?1:0)+' 1 '+B[0].toFixed(2)+' '+B[1].toFixed(2);}
function ticks(){let t='';for(let i=0;i<=8;i++){const a=-1.95+3.9*i/8,r0=i%4===0?36:39,r1=44;t+='<line x1="'+(60+Math.sin(a)*r0).toFixed(1)+'" y1="'+(60-Math.cos(a)*r0).toFixed(1)+'" x2="'+(60+Math.sin(a)*r1).toFixed(1)+'" y2="'+(60-Math.cos(a)*r1).toFixed(1)+'"/>';}return t;}
function holdBtn(b,key,alt){let id=null,lastUp=0;
  b.addEventListener('pointerdown',e=>{if(id!==null)return;e.preventDefault();e.stopPropagation();id=e.pointerId;try{b.setPointerCapture(id);}catch(_){}
    D.in[key]=1;D.armed=true;b.classList.add('on');if(alt&&performance.now()-lastUp<330){D.in[alt]=1;b.classList.add('alt');}});
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,e=>{if(e.pointerId===id){id=null;D.in[key]=0;if(alt)D.in[alt]=0;b.classList.remove('on','alt');lastUp=performance.now();}}));}
function tap(b,fn){b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fn();});}
function buildDriveUI(){
  const hud=q('#hud');if(!hud||q('#drv54'))return;
  const box=el('div','drv54',null,
    '<div id="d54-steer" aria-label="Direction"><div class="d54-ar" id="d54-l">'+SV.L+'</div><div class="d54-ar" id="d54-r">'+SV.R+'</div></div>'+
    '<div id="d54-mini"><button type="button" id="d54-bag" class="g54 sq" aria-label="Inventaire">'+SV.bag+'</button></div>'+
    '<button type="button" id="d54-exit" class="g54 rd" aria-label="Sortir">'+SV.exit+'<span>Sortir</span></button>'+
    '<div id="d54-dial"><svg viewBox="0 0 120 94" aria-hidden="true"><path class="tr" pathLength="100" d="'+arc2(46,-1.95,1.95)+'"/><path class="fl" id="d54-fl" pathLength="100" d="'+arc2(46,-1.95,1.95)+'"/><g class="tk">'+ticks()+'</g></svg>'+
      '<em id="d54-gr">N</em><div class="rd"><b id="d54-sp">0</b><small>KM/H</small></div><div class="fu">'+SV.pump+'<i id="d54-fu"><u></u><u></u><u></u><u></u></i></div><s id="d54-nt"></s></div>'+
    '<div id="d54-pedals"><button type="button" id="d54-brake" class="g54 pedal" aria-label="Frein">'+SV.brake+'</button><button type="button" id="d54-gas" class="g54 pedal" aria-label="Accélérer">'+SV.gas+'</button></div>');
  hud.appendChild(box);
  const st=q('#d54-steer'),aL=q('#d54-l'),aR=q('#d54-r');let sid=null;
  const side=x=>{const r=st.getBoundingClientRect(),l=x<r.left+r.width/2;D.in.left=l?1:0;D.in.right=l?0:1;aL.classList.toggle('on',l);aR.classList.toggle('on',!l);};
  const clr=()=>{sid=null;D.in.left=D.in.right=0;aL.classList.remove('on');aR.classList.remove('on');};
  st.addEventListener('pointerdown',e=>{if(sid!==null)return;e.preventDefault();sid=e.pointerId;try{st.setPointerCapture(sid);}catch(_){}D.armed=true;side(e.clientX);});
  st.addEventListener('pointermove',e=>{if(e.pointerId===sid)side(e.clientX);});
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>st.addEventListener(ev,e=>{if(e.pointerId===sid)clr();}));
  holdBtn(q('#d54-gas'),'gas','nitro');holdBtn(q('#d54-brake'),'brake','hb');
  tap(q('#d54-exit'),()=>{if(typeof interact==='function')interact();});
  tap(q('#d54-bag'),()=>{if(typeof sac==='function')sac();});
  tap(q('#d54-dial'),()=>{if(typeof playerHonk==='function')playerHonk();});
  const _r=window.resetTouchControls;
  window.resetTouchControls=function(){if(_r)_r();clr();for(const k in D.in)D.in[k]=0;document.querySelectorAll('#d54-pedals .pedal').forEach(b=>b.classList.remove('on','alt'));};
}

/* ---------------- interface à pied (d'après la maquette) ---------------- */
function buildLightHud(){
  const hud=q('#hud'),stats=q('#stats');if(!hud||!stats||q('#v54-pill'))return;
  const pill=el('div','v54-pill',null,'<span class="v54-h">❤</span><i class="v54-bar"><u id="v54-hp"></u></i><span id="v54-al"></span>');
  stats.insertBefore(pill,stats.firstChild);
  let tm=0;const app=q('#app');
  const expand=()=>{app.classList.add('x54');clearTimeout(tm);tm=setTimeout(()=>app.classList.remove('x54'),6000);};
  const toggle=()=>{if(app.classList.contains('x54')){app.classList.remove('x54');clearTimeout(tm);}else expand();};
  stats.addEventListener('pointerdown',e=>e.stopPropagation());stats.addEventListener('click',toggle);
  hud.appendChild(el('div','v54-top',null,'<span class="cash">$</span><b id="v54-cash">$0</b><i class="sep"></i><span id="v54-ic">☀️</span><b id="v54-time">10:00</b>'));
  hud.appendChild(el('div','v54-bt',null,'<button type="button" id="v54-bag" class="g54 sq big">'+SV.bag+'<span>Inventaire</span></button><button type="button" id="v54-ph" class="g54 sq big">'+SV.phone+'<span>Téléphone</span></button>'));
  hud.appendChild(el('div','v54-wx',null,'<b id="v54-wt">Clair</b><em>›</em>'));
  q('#v54-top').addEventListener('click',toggle);
  tap(q('#v54-bag'),()=>{if(typeof sac==='function')sac();});
  tap(q('#v54-ph'),()=>{if(typeof togglePhone==='function')togglePhone();});
  const rd=q('#h45-radar');if(rd)rd.addEventListener('click',()=>{if(typeof openBigMap==='function')openBigMap();});
}
/* ---------------- bidons d'essence : on les utilise n'importe où, au volant ou près du véhicule ---------------- */
function bidonTarget(){if(player.car)return player.car;let b=null,bd=9;cars.forEach(c=>{if(c.kind==='npc'||c.service&&c.kind==='npc')return;const d=Math.hypot(c.x-player.x,c.z-player.z);if(d<bd){bd=d;b=c;}});return b;}
if(typeof useItem==='function'){const _use=useItem;
  useItem=function(k){
    if(k!=='bidon')return _use(k);
    if(!P3.inv.bidon)return;const c=bidonTarget();
    if(!c){toast('Rapproche-toi de ton véhicule pour utiliser le bidon.','warn');return;}
    if((c.fuel==null?100:c.fuel)>=95){toast('Le réservoir est déjà plein.','warn');return;}
    P3.inv.bidon--;if(!P3.inv.bidon)delete P3.inv.bidon;
    c.fuel=Math.min(100,(c.fuel||0)+40);toast('Bidon versé : carburant '+Math.round(c.fuel)+' %.','good');
    if(typeof saveProgress==='function')saveProgress();
  };}
let fuelWarn=0;
const ALERTS=[['health',40,'❤️'],['hunger',28,'🍔'],['thirst',25,'💧'],['energy',22,'⚡'],['fun',15,'🙂']];
let lastAl='',nitT=0;
const txt=s=>{const e=q(s);return e?e.textContent.trim():'';};
function tick(){
  requestAnimationFrame(tick);
  if(typeof started==='undefined'||!started||typeof state==='undefined')return;
  const app=q('#app');if(!app)return;
  if(touch){buildDriveUI();}buildLightHud();
  const driving=!!player.car&&!(window.AM&&AM.V);
  app.classList.toggle('driving54',driving);
  /* à pied sur mobile : pousser le joystick à fond = courir (plus de bouton Courir) */
  if(touch&&!driving&&typeof running!=='undefined'&&typeof joy!=='undefined')running=joy.id!==null&&Math.hypot(joy.x,joy.y)>.93;
  const rd=q('#h45-radar');
  if(rd&&touch){let nb=q('#v54-n');if(!nb){nb=el('b','v54-n',null,'N');rd.appendChild(nb);}
    const th=(typeof camYaw==='number'?camYaw:0)-Math.PI,sx=Math.sin(th),cy=-Math.cos(th),k=driving?1/Math.max(Math.abs(sx),Math.abs(cy),.001):1;
    nb.style.left=(50+cl(sx*k,-1,1)*50).toFixed(1)+'%';nb.style.top=(50+cl(cy*k,-1,1)*50).toFixed(1)+'%';}
  const now=performance.now();if(now-nitT<100)return;nitT=now;
  const hp=q('#v54-hp');if(hp){hp.style.width=Math.round(cl(state.health,0,100))+'%';hp.classList.toggle('low',state.health<35);}
  let al='';ALERTS.forEach(([k,lim,ic])=>{const v=state[k];if(typeof v==='number'&&v<lim)al+='<b>'+ic+'</b>';});
  if(al!==lastAl){lastAl=al;const e=q('#v54-al');if(e)e.innerHTML=al;}
  app.classList.toggle('alert54',!!al);
  /* pastille argent + heure + météo */
  const cash=q('#v54-cash');if(cash)cash.textContent=txt('#h-cash')||('$'+Math.round(state.cash));
  const clk=txt('#clock'),tm=q('#v54-time');if(tm&&clk)tm.textContent=clk;
  const hr=parseInt(clk,10),ic=q('#v54-ic');if(ic&&!isNaN(hr))ic.textContent=(hr<6||hr>=20)?'🌙':'☀️';
  const wt=q('#v54-wt'),w=txt('#wx');if(wt&&w)wt.textContent=w;
  /* compteur de conduite */
  if(driving&&player.car){const c=player.car,kmh=(c.spd!=null?c.spd:Math.abs(c.v||0))*3.6,max=(c.top||27)*3.6*1.35;
    const sp=q('#d54-sp');if(sp)sp.textContent=Math.round(kmh);
    const gr=q('#d54-gr');if(gr)gr.textContent=c.v<-.3?'R':kmh<2?'N':'D'+(c.gear||1);
    const fl=q('#d54-fl');if(fl)fl.style.strokeDasharray=(cl(kmh/max,0,1)*100).toFixed(1)+' 100';
    const fu=q('#d54-fu');if(fu){const n=Math.ceil(cl(c.fuel==null?100:c.fuel,0,100)/25);[...fu.children].forEach((u,i)=>u.classList.toggle('on',i<n));fu.classList.toggle('low',(c.fuel==null?100:c.fuel)<20);}
    if((c.fuel==null?100:c.fuel)<15&&now>fuelWarn){fuelWarn=now+45000;toast('Carburant bas : station-service, ou bidon dans le sac 🎒.','warn');}
    const nt=q('#d54-nt');if(nt){nt.style.width=Math.round((c.nit==null?1:c.nit)*100)+'%';nt.classList.toggle('boost',!!c.nitOn);}}
}
requestAnimationFrame(tick);
})();
