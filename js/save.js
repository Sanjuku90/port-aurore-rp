'use strict';
function saveProgress(){
  if(!started)return;
  try{localStorage.setItem('port-aurore-rp',JSON.stringify({v:2,name:state.name,cash:state.cash,bank:state.bank,done:state.done,earned:state.earned,job:state.job,rep:state.rep,friends:state.friends,energy:state.energy,fun:state.fun,health:state.health,hunger:state.hunger,look:look,gameMin:gameMin,x:(player.inside?player.outside:player).x,z:(player.inside?player.outside:player).z,h:player.h,yaw:camYaw}));}catch(e){}
}
let savedPos=null;
function loadProgress(){
  try{
    const s=JSON.parse(localStorage.getItem('port-aurore-rp')||'null');if(!s||typeof s!=='object')return;
    const n=(v,d,a,b)=>(typeof v==='number'&&isFinite(v))?clamp(v,a,b):d;
    state.cash=n(s.cash,150,0,1e9);state.bank=n(s.bank,0,0,1e9);state.done=n(s.done,0,0,1e7);state.earned=n(s.earned,0,0,1e10);
    state.job=s.job===true?'livreur':(JOBN[s.job]?s.job:null);state.rep=n(s.rep,0,0,1e5);state.friends=Array.isArray(s.friends)?s.friends.filter(f=>typeof f==='string').slice(0,50):[];
    state.energy=n(s.energy,90,0,100);state.fun=n(s.fun,70,0,100);state.health=n(s.health,100,1,100);state.hunger=n(s.hunger,80,0,100);
    if(s.look&&typeof s.look.s==='number'&&typeof s.look.k==='number')look=s.look;
    gameMin=n(s.gameMin,10*60,0,1e7);
    if(typeof s.x==='number'&&typeof s.z==='number')savedPos={x:clamp(s.x,-252,252),z:clamp(s.z,-252,207),h:n(s.h,Math.PI,-99,99),yaw:n(s.yaw,Math.PI,-99,99)};
    const p=(typeof s.name==='string'?s.name:'').split(' ');if(p[0])$('#fn').value=p[0];if(p[1])$('#ln').value=p.slice(1).join(' ');
  }catch(e){}
}
function restorePosition(){
  if(savedPos){player.x=savedPos.x;player.z=savedPos.z;player.h=savedPos.h;camYaw=savedPos.yaw;const t={x:player.x,z:player.z};if(pushAABB(t,0.45)>0){player.x=0;player.z=18;}}
  else camYaw=Math.PI;
  camT=1;
}
function resetProgress(){try{localStorage.removeItem('port-aurore-rp');}catch(e){}started=false;location.reload();}

