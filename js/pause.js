'use strict';
/* ---------- menu pause ---------- */
let paused=false;
function setPause(v){
  if(!started||v===paused)return;
  paused=v;$('#pause').hidden=!v;
  if(v){for(const k in keys)keys[k]=false;if(window.resetTouchControls)window.resetTouchControls();else joy.x=joy.y=0;closeChat();saveProgress();renderPause();try{if(actx&&actx.state==='running')actx.suspend();}catch(e){}}
  else{last=performance.now();try{if(actx&&actx.state==='suspended'&&!muted)actx.resume();}catch(e){}}
}
function renderPause(){
  const h=Math.floor(gameMin/60)%24,m=Math.floor(gameMin%60);
  $('#pz-info').textContent=state.name+' · '+fmt(state.cash)+' en poche · '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+' · Missions : '+state.done;
  const box=$('#pz-btns');box.innerHTML='';
  const add=(t,f,c)=>{const b=document.createElement('button');b.textContent=t;if(c)b.className=c;b.onclick=f;box.appendChild(b);};
  add('Reprendre',()=>setPause(false),'primary');
  add('Configurer la manette',()=>gpOpenRemap());
  add('Sauvegarder',()=>{saveProgress();toast('Partie sauvegardée.','good');});
  add(muted?'Son : coupé':'Son : activé',()=>{muted=!muted;renderPause();});
  add('Sensibilité caméra : '+camSensName(),()=>{camSens();renderPause();});
  add('Distance caméra : '+CAMX.PRE[CAMX.preset][0]+' (touche V)',()=>{camCycle();renderPause();});
  add('Quitter vers le menu',()=>{saveProgress();started=false;location.reload();},'ghost');
  add('Effacer la sauvegarde',()=>{if(confirm('Effacer toute la progression ?'))resetProgress();},'ghost');
}
function bindPause(){
  $('#pausebtn').addEventListener('click',()=>setPause(true));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(started&&!paused)setPause(true);else saveProgress();}});
  addEventListener('pagehide',saveProgress);
  addEventListener('contextmenu',e=>e.preventDefault());
}
