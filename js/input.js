'use strict';
/* ---------- entrées ---------- */
function setupInput(){
  const touch=matchMedia('(pointer: coarse)').matches||('ontouchstart' in window);
  if(touch)$('#app').classList.add('touch');
  addEventListener('keydown',e=>{
    if(chatOpen)return;
    const k=e.key.toLowerCase();keys[k]=true;
    if(k===' '||k.indexOf('arrow')===0)e.preventDefault();
    if(!started)return;
    if(paused){if(k==='escape'||k==='p')setPause(false);return;}
    if(k==='escape'||k==='p'){if(panelOpen)closePanel();else setPause(true);return;}
    if(k==='e')interact();else if(k==='m')openBigMap();else if(k==='t')togglePhone();else if(k==='h'&&player.car)playerHonk();
    else if(k==='enter'){e.preventDefault();openChat();}
    else if(k==='escape'&&panelOpen)closePanel();
  });
  addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
  addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
  const ci=$('#chatin');
  ci.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')closeChat();});
  ci.addEventListener('keyup',e=>e.stopPropagation());
  $('#chatbar').addEventListener('submit',e=>{e.preventDefault();sendChat(ci.value);closeChat();});
  $('#prompt').addEventListener('click',interact);
  $('#b-act').addEventListener('click',interact);
  $('#b-chat').addEventListener('click',()=>{chatOpen?closeChat():openChat();});
  $('#b-run').addEventListener('click',e=>{running=!running;e.currentTarget.classList.toggle('on',running);});
  const joyEl=$('#joy'),knob=$('#knob');
  function moveJoy(e){
    const r=joyEl.getBoundingClientRect(),R=r.width/2;
    let dx=e.clientX-(r.left+R),dy=e.clientY-(r.top+R);const l=Math.hypot(dx,dy);
    if(l>R*0.85){dx*=R*0.85/l;dy*=R*0.85/l;}
    joy.x=dx/(R*0.85);joy.y=dy/(R*0.85);knob.style.transform='translate('+dx+'px,'+dy+'px)';
  }
  joyEl.addEventListener('pointerdown',e=>{joy.id=e.pointerId;joyEl.setPointerCapture(e.pointerId);moveJoy(e);});
  joyEl.addEventListener('pointermove',e=>{if(e.pointerId===joy.id)moveJoy(e);});
  const endJoy=e=>{if(e.pointerId===joy.id){joy.id=null;joy.x=joy.y=0;knob.style.transform='translate(0,0)';}};
  joyEl.addEventListener('pointerup',endJoy);joyEl.addEventListener('pointercancel',endJoy);
  const cv=$('#gl');let drag=null;
  cv.addEventListener('pointerdown',e=>{if(drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId);});
  cv.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    camYaw-=(e.clientX-drag.x)*0.006*CAMX.sens;camPitch=clamp(camPitch+(e.clientY-drag.y)*0.0042*CAMX.sens,0.12,1.1);
    drag.x=e.clientX;drag.y=e.clientY;lastDrag=performance.now();
  });
  const endDrag=e=>{if(drag&&e.pointerId===drag.id)drag=null;};
  cv.addEventListener('pointerup',endDrag);cv.addEventListener('pointercancel',endDrag);
}
