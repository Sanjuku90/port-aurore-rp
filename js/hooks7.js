'use strict';
/* ---------- v7 : branchements (reflets, lumière, boucle) ---------- */
const _bw7=buildWorld;buildWorld=function(){buildEnv7();_bw7();
  /* asphalte plus fin */
  const at=ctex('asph',512,512,(g,W,H)=>{g.fillStyle='#34373c';g.fillRect(0,0,W,H);for(let i=0;i<26000;i++){const v=Math.random();g.fillStyle=v<.5?'rgba(0,0,0,'+(v*.22)+')':'rgba(255,255,255,'+((v-.5)*.1)+')';g.fillRect(Math.random()*W,Math.random()*H,1,1);}
    for(let i=0;i<30;i++){g.fillStyle='rgba(0,0,0,'+(Math.random()*.06)+')';g.beginPath();g.ellipse(Math.random()*W,Math.random()*H,20+Math.random()*80,10+Math.random()*40,Math.random()*3,0,7);g.fill();}});
  scene.children.forEach(o=>{if(o.isMesh&&o.geometry.parameters&&o.geometry.parameters.width===560&&o.geometry.type==='PlaneGeometry'){o.material.map=rep(at,120);o.material.needsUpdate=true;}});
};
const _ud7=updateDecor;updateDecor=function(dt){
  _ud7(dt);
  const h=(gameMin/60)%24,s=Math.sin((h-6)/12*Math.PI),day=s>0?clamp(s*1.4,0,1):0;
  sun.intensity*=1.55;hemi.intensity=hemi.intensity*1.2+(1-day)*.32;headSpot.intensity*=40;
  scene.environmentIntensity=.12+.88*day*(1-wx.k.dark*.5);
  updateCars7(dt);
  if(typeof updateLife7==='function')updateLife7(dt,day);
};
const _uc7=updateCamera;updateCamera=function(dt){_uc7(dt);if(window.CAMO){camera.position.set(...CAMO.p);camera.lookAt(...CAMO.t);}};
