'use strict';
/* ---------- besoins, chat, interface ---------- */
function needs(dt){
  /* v55 : besoins 3× plus lents ; la faim ou la fatigue usent la santé très doucement et ne peuvent plus la faire tomber sous 12 */
  state.hunger=Math.max(0,state.hunger-0.04*dt);state.energy=Math.max(0,state.energy-0.025*dt);state.fun=Math.max(0,state.fun-0.02*dt);
  if(state.hunger<=0||state.energy<=0){if(state.health>12)state.health=Math.max(12,state.health-0.05*dt);}
  else if(state.hunger>25&&(state.thirst==null||state.thirst>15)&&state.health<100)state.health=Math.min(100,state.health+0.25*dt);
  if(state.health<=0)respawn();
}
function respawn(){
  if(player.car)exitCar();
  const fee=Math.min(50,state.cash+state.bank);takeMoney(fee);
  state.health=60;state.hunger=50;state.energy=Math.max(state.energy,50);mission=null;beam.visible=false;missionCd=4;
  player.x=0;player.z=127;player.h=Math.PI;camYaw=Math.PI;
  toast('Tu as été soigné à l’hôpital. Frais : '+fmt(fee),'bad');
}
function toast(msg,kind){
  const d=document.createElement('div');d.className='toast '+(kind||'');d.textContent=msg;
  const box=$('#toasts');box.appendChild(d);while(box.children.length>3)box.removeChild(box.firstChild);
  setTimeout(()=>d.remove(),3600);
}
function addChat(name,text,me){
  const d=document.createElement('div');
  if(me==='me'){d.className='me';d.textContent='* '+name+' '+text;}
  else{const b=document.createElement('b');b.textContent=name+' : ';d.appendChild(b);d.appendChild(document.createTextNode(text));}
  const box=$('#chatlog');box.appendChild(d);while(box.children.length>5)box.removeChild(box.firstChild);
  setTimeout(()=>d.remove(),16000);
}
function openChat(){if(!started||panelOpen)return;for(const k in keys)keys[k]=false;chatOpen=true;$('#chatbar').hidden=false;$('#chatin').value='';$('#chatin').focus();}
function closeChat(){chatOpen=false;$('#chatbar').hidden=true;$('#chatin').blur();}
function sendChat(txt){
  txt=txt.trim();if(!txt)return;
  const vec=new THREE.Vector3();
  const holder={get position(){return vec.set(player.x,player.car?0.7:0.1,player.z);}};
  if(/^\/me\s/i.test(txt)){const a=txt.slice(4);addChat(state.name,a,'me');say(holder,'* '+a,5);}
  else if(/^\/do\s/i.test(txt)){const a=txt.slice(4);addChat(state.name,a+' (do)','me');say(holder,'* '+a,5);}
  else{addChat(state.name,txt);say(holder,txt,5);}
  let best=null,bd=28;peds.forEach(p=>{const d=Math.hypot(p.x-player.x,p.z-player.z);if(d<bd){bd=d;best=p;}});
  if(best&&Math.random()<0.5){const r=pick(REPLIES);setTimeout(()=>{addChat(best.name,r);say(best.mesh,r,4);},1200+Math.random()*1200);}
}
function updateBubbles(){
  const now=performance.now();
  for(let i=bubbles.length-1;i>=0;i--){
    const b=bubbles[i];
    if(now>b.until){scene.remove(b.sp);b.sp.material.map.dispose();b.sp.material.dispose();bubbles.splice(i,1);continue;}
    const p=b.target.position;b.sp.position.set(p.x,p.y+2.5,p.z);
  }
}

