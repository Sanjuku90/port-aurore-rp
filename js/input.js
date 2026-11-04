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
  addEventListener('blur',()=>{for(const k in keys)keys[k]=false;if(window.resetTouchControls)window.resetTouchControls();});
  const ci=$('#chatin');
  ci.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')closeChat();});
  ci.addEventListener('keyup',e=>e.stopPropagation());
  $('#chatbar').addEventListener('submit',e=>{e.preventDefault();sendChat(ci.value);closeChat();});
  $('#prompt').addEventListener('click',interact);
  $('#b-act').addEventListener('click',interact);
  $('#b-chat').addEventListener('click',()=>{chatOpen?closeChat():openChat();});
  const runBtn=$('#b-run');
  const setRun=v=>{running=!!v;runBtn.classList.toggle('on',running);runBtn.setAttribute('aria-pressed',String(running));};
  runBtn.addEventListener('click',()=>setRun(!running));
  const joyZone=$('#joy-zone'),joyEl=$('#joy'),knob=$('#knob');
  function moveJoy(e){
    const r=joyEl.getBoundingClientRect(),R=r.width/2;
    let dx=e.clientX-(r.left+R),dy=e.clientY-(r.top+R);
    const l=Math.hypot(dx,dy),limit=R*.78,mag=Math.min(1,l/limit),dead=.12,dirX=l?dx/l:0,dirY=l?dy/l:0;
    if(l>limit){dx*=limit/l;dy*=limit/l;}
    const out=mag<=dead?0:Math.pow((mag-dead)/(1-dead),1.1);
    joy.x=dirX*out;joy.y=dirY*out;
    knob.style.transform='translate('+dx+'px,'+dy+'px)';
  }
  const beginJoy=e=>{
    if(!touch||joy.id!==null||e.button>0)return;
    e.preventDefault();
    const b=joyZone.getBoundingClientRect(),R=joyEl.offsetWidth/2;
    const cx=clamp(e.clientX-b.left,R+6,b.width-R-6),cy=clamp(e.clientY-b.top,R+6,b.height-R-6);
    joyEl.style.left=(cx-R)+'px';joyEl.style.top=(cy-R)+'px';joyEl.style.bottom='auto';joyEl.classList.add('active');
    joy.id=e.pointerId;joyZone.setPointerCapture(e.pointerId);moveJoy(e);
  };
  joyZone.addEventListener('pointerdown',beginJoy);
  joyZone.addEventListener('pointermove',e=>{if(e.pointerId===joy.id)moveJoy(e);});
  const endJoy=e=>{if(e.pointerId===joy.id){joy.id=null;joy.x=joy.y=0;knob.style.transform='translate(0,0)';joyEl.style.left='18px';joyEl.style.top='auto';joyEl.style.bottom='18px';joyEl.classList.remove('active');}};
  joyZone.addEventListener('pointerup',endJoy);joyZone.addEventListener('pointercancel',endJoy);joyZone.addEventListener('lostpointercapture',endJoy);
  window.resetTouchControls=()=>{
    if(joy.id!==null){try{joyZone.releasePointerCapture(joy.id);}catch(_){}joy.id=null;}
    joy.x=joy.y=0;knob.style.transform='translate(0,0)';joyEl.style.left='18px';joyEl.style.top='auto';joyEl.style.bottom='18px';joyEl.classList.remove('active');setRun(false);
  };
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
