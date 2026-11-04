'use strict';
/* v33 · fluidité mobile : résolution adaptative, distance d'affichage réduite, culling des voitures lointaines */
(function(){
const COARSE=matchMedia('(pointer: coarse)').matches||('ontouchstart' in window);
if(!COARSE)return;
const dpr=window.devicePixelRatio||1,MAX=Math.min(dpr,1.2),MIN=.65;let pr=Math.min(dpr,1.05),last=performance.now(),acc=0,n=0,lastAdj=0;
function apply(){if(typeof renderer==='undefined'||!renderer)return;if(Math.abs(renderer.getPixelRatio()-pr)>.01){renderer.setPixelRatio(pr);dispatchEvent(new Event('resize'));}}
function frame(t){const dt=t-last;last=t;if(dt>0&&dt<250){acc+=dt;n++;}
  if(t-lastAdj>2000&&n>20){const fps=1000/(acc/n);if(fps<40&&pr>MIN){pr=Math.max(MIN,pr-.12);apply();}else if(fps>56&&pr<MAX){pr=Math.min(MAX,pr+.06);apply();}acc=0;n=0;lastAdj=t;}
  else if(typeof renderer!=='undefined'&&renderer&&Math.abs(renderer.getPixelRatio()-pr)>.01&&t-lastAdj>500)apply();
  requestAnimationFrame(frame);}
requestAnimationFrame(frame);
const t0=setInterval(()=>{if(typeof camera!=='undefined'&&camera){camera.far=320;camera.updateProjectionMatrix();clearInterval(t0);}},500);
if(typeof updateCars7==='function'){const _u=updateCars7;updateCars7=function(dt){_u(dt);if(typeof camera==='undefined')return;const cx=camera.position.x,cz=camera.position.z;cars.forEach(c=>{if(c!==player.car&&c.mesh.visible&&(Math.abs(c.x-cx)>120||Math.abs(c.z-cz)>120))c.mesh.visible=false;});};}
})();
