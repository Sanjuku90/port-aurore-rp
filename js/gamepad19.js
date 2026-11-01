'use strict';
/* Manette standard (Gamepad API): sticks, gâchettes, raccourcis et remappage sauvegardé. */
const GP19={x:0,y:0,btn:{},dpad:{u:false,d:false,l:false,r:false},run:false,brake:false,on:false,navT:0,capture:null,bind:{
  interact:0,cancel:1,horn:2,phone:3,inventory:4,map:5,brake:6,run:7,pause:9
}};
const GP19_DEFAULTS={interact:0,cancel:1,horn:2,phone:3,inventory:4,map:5,brake:6,run:7,pause:9};
const GP19_LABELS={interact:'Interagir / valider',cancel:'Retour / fermer',horn:'Klaxon',phone:'Téléphone',inventory:'Sac à dos',map:'Carte',brake:'Frein',run:'Courir',pause:'Pause'};
const gpDead=.18,gpDz=v=>Math.abs(v)<gpDead?0:(v-Math.sign(v)*gpDead)/(1-gpDead);
let gpFocus=-1;
try{const q=JSON.parse(localStorage.getItem('port-aurore-gamepad-v1')||'{}');for(const k in GP19_DEFAULTS)if(Number.isInteger(q[k])&&q[k]>=0&&q[k]<32)GP19.bind[k]=q[k];}catch(e){}
function gpSave(){try{localStorage.setItem('port-aurore-gamepad-v1',JSON.stringify(GP19.bind));}catch(e){}}
function gpButton(pad,n){const b=pad.buttons&&pad.buttons[n];return !!(b&&(b.pressed||b.value>.55));}
function gpOverlay(){for(const sel of ['#gp-remap','#pause','#panel','#start','#intro']){const el=document.querySelector(sel);if(el&&!el.hidden)return el;}return null;}
function gpFocusables(root){return [...root.querySelectorAll('button,input,select')].filter(b=>!b.disabled&&b.offsetParent!==null);}
function gpMove(dir){const root=gpOverlay();if(!root)return;const list=gpFocusables(root);if(!list.length)return;gpFocus=(gpFocus+dir+list.length)%list.length;list.forEach((b,i)=>b.classList.toggle('gp-focus',i===gpFocus));list[gpFocus].scrollIntoView({block:'nearest'});}
function gpPress(action){
  const menu=gpOverlay();
  if(menu){
    if(menu.id==='gp-remap'){if(action==='interact'){const list=gpFocusables(menu);const b=list[gpFocus]||list[0];if(b)b.click();gpFocus=-1;}else if(action==='cancel'){GP19.capture=null;menu.hidden=true;}return;}
    if(action==='interact'){const list=gpFocusables(menu);const b=list[gpFocus]||list[0];if(b){b.click();gpFocus=-1;}return;}
    if(action==='cancel'||action==='pause'){if(menu.id==='pause')setPause(false);else if(menu.id==='panel')closePanel();else if(menu.id==='start'&&typeof show==='function')show('menu');return;}
    return;
  }
  if(!started||chatOpen)return;
  if(paused){if(action==='cancel'||action==='pause')setPause(false);return;}
  if(action==='interact')interact();
  else if(action==='cancel'&&panelOpen)closePanel();
  else if(action==='horn'&&player.car)playerHonk();
  else if(action==='phone')togglePhone();
  else if(action==='inventory'){if(panelOpen)closePanel();else if(typeof sac==='function')sac();}
  else if(action==='map'&&!panelOpen)openBigMap();
  else if(action==='pause')setPause(true);
}
function gpOpenRemap(){
  let box=document.getElementById('gp-remap');
  if(!box){
    box=document.createElement('div');box.id='gp-remap';box.className='gp-remap-overlay';
    box.innerHTML='<section class="gp-remap-card" role="dialog" aria-modal="true" aria-labelledby="gp-remap-title"><button class="gp-remap-close" type="button" aria-label="Fermer">×</button><h2 id="gp-remap-title">Configurer la manette</h2><p id="gp-remap-status">Sélectionne une action, puis appuie sur le bouton voulu.</p><div class="gp-remap-list"></div><div class="gp-remap-foot"><button type="button" class="gp-remap-reset">Réinitialiser</button><button type="button" class="gp-remap-done">Terminé</button></div></section>';
    document.body.appendChild(box);
    box.querySelector('.gp-remap-close').onclick=()=>{GP19.capture=null;box.hidden=true;};
    box.querySelector('.gp-remap-done').onclick=()=>{GP19.capture=null;box.hidden=true;};
    box.querySelector('.gp-remap-reset').onclick=()=>{GP19.bind=Object.assign({},GP19_DEFAULTS);gpSave();gpRenderRemap();};
  }
  box.hidden=false;gpRenderRemap();
  const choices=gpFocusables(box);gpFocus=Math.min(1,choices.length-1);choices.forEach((b,i)=>b.classList.toggle('gp-focus',i===gpFocus));
}
function gpRenderRemap(){
  const box=document.getElementById('gp-remap');if(!box)return;
  const list=box.querySelector('.gp-remap-list');list.innerHTML='';
  Object.keys(GP19_LABELS).forEach(k=>{const row=document.createElement('div');row.className='gp-remap-row';
    const name=document.createElement('span');name.textContent=GP19_LABELS[k];
    const btn=document.createElement('button');btn.type='button';btn.className='gp-bind'+(GP19.capture===k?' waiting':'');btn.textContent=GP19.capture===k?'Appuie sur un bouton…':'Bouton '+(GP19.bind[k]+1);btn.onclick=()=>{GP19.capture=k;document.getElementById('gp-remap-status').textContent='Appuie sur le bouton de la manette à affecter à « '+GP19_LABELS[k]+' ». Échap annule.';gpRenderRemap();};
    row.append(name,btn);list.appendChild(row);
  });
  if(!GP19.capture)document.getElementById('gp-remap-status').textContent=GP19.on?'Manette connectée. Clique une action puis presse le bouton voulu.':'Connecte une manette, clique une action puis presse le bouton voulu.';
}
function gpAssign(k,n){const old=GP19.bind[k];for(const other in GP19.bind)if(other!==k&&GP19.bind[other]===n)GP19.bind[other]=old;GP19.bind[k]=n;GP19.capture=null;gpSave();gpRenderRemap();}
addEventListener('keydown',e=>{if(e.key==='Escape'&&GP19.capture){GP19.capture=null;gpRenderRemap();e.stopPropagation();}},true);
function gpPoll(){
  let pads=[];try{pads=navigator.getGamepads?navigator.getGamepads():[];}catch(e){}
  let pad=null;for(const p of pads||[])if(p&&p.connected){pad=p;break;}
  const now=performance.now();
  if(!pad){if(GP19.on){GP19.on=false;GP19.x=GP19.y=0;GP19.run=GP19.brake=false;}return;}
  const wasOn=GP19.on;GP19.on=true;
  if(!wasOn&&document.getElementById('gp-remap')&&!document.getElementById('gp-remap').hidden)gpRenderRemap();
  const bn={};for(let i=0;i<(pad.buttons||[]).length;i++)bn[i]=gpButton(pad,i);
  if(GP19.capture){
    let found=-1;for(let i=0;i<32;i++)if(bn[i]&&!GP19.btn[i]){found=i;break;}
    if(found>=0)gpAssign(GP19.capture,found);
  }else{
    for(const action in GP19.bind){const n=GP19.bind[action];if(bn[n]&&!GP19.btn[n])gpPress(action);}
  }
  GP19.btn=bn;
  const dp={u:gpButton(pad,12),d:gpButton(pad,13),l:gpButton(pad,14),r:gpButton(pad,15)},menu=!!gpOverlay();
  if(menu){const fresh=k=>dp[k]&&!GP19.dpad[k];if(fresh('u')||fresh('l'))gpMove(-1);else if(fresh('d')||fresh('r'))gpMove(1);else if((dp.u||dp.d)&&now>GP19.navT){gpMove(dp.u?-1:1);GP19.navT=now+300;}}
  else{gpFocus=-1;document.querySelectorAll('.gp-focus').forEach(x=>x.classList.remove('gp-focus'));}
  GP19.dpad=dp;
  GP19.x=gpDz(pad.axes&&pad.axes[0]||0);GP19.y=gpDz(pad.axes&&pad.axes[1]||0);
  const rx=gpDz(pad.axes&&pad.axes[2]||0),ry=gpDz(pad.axes&&pad.axes[3]||0);
  if(rx||ry){camYaw-=rx*.035*CAMX.sens;camPitch=clamp(camPitch+ry*.025*CAMX.sens,.12,1.1);lastDrag=now;}
  GP19.run=gpButton(pad,GP19.bind.run);GP19.brake=gpButton(pad,GP19.bind.brake);
}
addEventListener('gamepadconnected',()=>{if(typeof toast==='function'&&started)toast('Manette connectée.','good');gpRenderRemap();});
addEventListener('gamepaddisconnected',()=>{if(typeof toast==='function'&&started)toast('Manette déconnectée.','warn');gpRenderRemap();});
(function gpLoop(){gpPoll();requestAnimationFrame(gpLoop);})();
