'use strict';
/* ---------- v19 : manette (Xbox / PlayStation / compatibles, mapping standard du navigateur) ----------
   Stick gauche : marche et conduite · Stick droit : caméra · A : interagir · B : fermer
   X : klaxon · Y : téléphone · LB : sac à dos · RB : carte · Start : pause · RT : courir · LT : frein
   Croix directionnelle : naviguer dans les menus · A dans un menu : valider */
const GP19={x:0,y:0,btn:{},dpad:{u:false,d:false,l:false,r:false},run:false,brake:false,on:false,navT:0};
const gpDead=.18;
const gpDz=v=>Math.abs(v)<gpDead?0:(v-Math.sign(v)*gpDead)/(1-gpDead);
let gpFocus=-1;
function gpOverlay(){
  for(const sel of ['#pause','#panel','#start','#intro']){const el=document.querySelector(sel);if(el&&!el.hidden)return el;}
  return null;
}
function gpFocusables(root){return [...root.querySelectorAll('button,input,select')].filter(b=>!b.disabled&&b.offsetParent!==null);}
function gpMove(dir){
  const root=gpOverlay();if(!root)return;
  const list=gpFocusables(root);if(!list.length)return;
  gpFocus=(gpFocus+dir+list.length)%list.length;
  list.forEach((b,i)=>b.classList.toggle('gp-focus',i===gpFocus));
  list[gpFocus].scrollIntoView({block:'nearest'});
}
function gpPress(i){
  const menu=gpOverlay();
  if(menu){
    if(i===0){const list=gpFocusables(menu);const b=list[gpFocus]||list[0];if(b){b.click();gpFocus=-1;}return;}
    if(i===1||i===9){if(menu.id==='pause'){setPause(false);}else if(menu.id==='panel'){closePanel();}return;}
    return;
  }
  if(!started||chatOpen)return;
  if(paused){if(i===9||i===1)setPause(false);return;}
  if(i===0)interact();
  else if(i===1){if(panelOpen)closePanel();}
  else if(i===2){if(player.car)playerHonk();}
  else if(i===3){togglePhone();}
  else if(i===4){if(panelOpen)closePanel();else if(typeof sac==='function')sac();}
  else if(i===5){if(!panelOpen)openBigMap();}
  else if(i===9){setPause(true);}
}
function gpPoll(){
  const pads=(navigator.getGamepads?navigator.getGamepads():[])||[];
  let pad=null;for(const p of pads){if(p&&p.connected){pad=p;break;}}
  const now=performance.now();
  if(!pad){
    if(GP19.on){GP19.on=false;GP19.x=GP19.y=0;if(GP19.run)keys.shift=false;if(GP19.brake)keys[' ']=false;GP19.run=GP19.brake=false;}
    return;
  }
  GP19.on=true;
  const b=i=>!!(pad.buttons[i]&&pad.buttons[i].pressed);
  const bn={};for(let i=0;i<pad.buttons.length;i++)bn[i]=b(i);
  for(let i=0;i<pad.buttons.length;i++){if(bn[i]&&!GP19.btn[i])gpPress(i);}
  GP19.btn=bn;
  /* croix directionnelle : navigation dans les menus (répétition légère) */
  const dp={u:b(12),d:b(13),l:b(14),r:b(15)};
  const menuOpen=!!gpOverlay();
  if(menuOpen){
    const fresh=(k)=>dp[k]&&!GP19.dpad[k];
    if(fresh('u')||fresh('l'))gpMove(-1);else if(fresh('d')||fresh('r'))gpMove(1);
    else if((dp.u||dp.d)&&now>GP19.navT){gpMove(dp.u?-1:1);GP19.navT=now+260;}
  }else{gpFocus=-1;document.querySelectorAll('.gp-focus').forEach(x=>x.classList.remove('gp-focus'));}
  GP19.dpad=dp;
  /* sticks */
  const lx=gpDz(pad.axes[0]||0),ly=gpDz(pad.axes[1]||0);
  GP19.x=lx;GP19.y=ly;
  const rx=gpDz(pad.axes[2]||0),ry=gpDz(pad.axes[3]||0);
  if(rx||ry){camYaw-=rx*.035;camPitch=clamp(camPitch+ry*.025,.12,1.1);lastDrag=now;}
  /* gâchettes */
  const run=b(7),brake=b(6);
  if(run!==GP19.run){GP19.run=run;keys.shift=run;}
  if(brake!==GP19.brake){GP19.brake=brake;keys[' ']=brake;}
}
/* le mouvement et la conduite lisent aussi le stick gauche */
if(typeof getInput==='function'){
  const _gi19=getInput;
  getInput=function(){
    const r=_gi19();
    if(!GP19.on)return r;
    let x=r.x+GP19.x,z=r.z-GP19.y;
    const m=Math.hypot(x,z);if(m>1){x/=m;z/=m;}
    return {x,z};
  };
}
addEventListener('gamepadconnected',e=>{if(typeof toast==='function'&&started)toast('Manette connectée.','good');});
addEventListener('gamepaddisconnected',()=>{if(typeof toast==='function'&&started)toast('Manette déconnectée.','warn');});
(function gpLoop(){gpPoll();requestAnimationFrame(gpLoop);})();
