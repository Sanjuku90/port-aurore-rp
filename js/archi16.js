'use strict';
/* ---------- v16 : architecture variée, intégration au sol, lumière ----------
   - Façades : 7 familles (haussmannien, volets, brique à arcs, bandeaux modernes, mur-rideau, trame art déco, tôle industrielle)
   - Silhouettes : pans coupés, angles arrondis, socles + tours, gradins, maisons mitoyennes de hauteurs différentes
   - Toits : mansardes avec lucarnes, croupes, pignons, sheds, voûtes, terrasses à acrotère
   - Reliefs : soubassement, bandeau, corniche, balcons filants en fer forgé, bow-windows, cheminées
   - Intégration : occlusion au pied des murs, ombres de contact (arbres, mobilier, voitures, passants), enseignes et auvents montés
   - Les façades sont regroupées par matériau : moins d'appels de dessin qu'avant malgré plus de détails. */
const A16={batch:new Map(),rails:[],foot:[],blobs:[],furn:[],F:[],ready:false,dyn:null,y0:0.16};

/* ----- utilitaires ----- */
function srand16(s){s=(Math.floor(s)%2147483646)+1;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};}
const rpick16=(R,a)=>a[Math.floor(R()*a.length)];
/* occlusion ambiante au pied des volumes (assombrit le bas des murs et des objets) */
function aoPatch16(m,lo,span){
  m.onBeforeCompile=sh=>{
    sh.vertexShader='varying float vWY16;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 wp16=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nwp16=instanceMatrix*wp16;\n#endif\nvWY16=(modelMatrix*wp16).y;');
    sh.fragmentShader='varying float vWY16;\n'+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb*=mix('+lo.toFixed(2)+',1.0,smoothstep(0.12,'+span.toFixed(2)+',vWY16));');
  };
  m.customProgramCacheKey=()=>'ao16_'+lo+'_'+span;
  return m;
}

/* ----- palettes (ville portuaire française) ----- */
const FAM16={
  hauss:{bases:['#e6d9bf','#dccbab','#efe5d2','#d3c19f','#e9dcc6'],wk:'stone',fh:3.6,gf:'arcade'},
  shutter:{bases:['#ead9b6','#dc9a72','#f1e8d6','#cbd5c1','#e8c977','#bcd2da','#e7b9a5','#f3efe4'],acc:['#5c7a8a','#7a3b2e','#3f6b4f','#2f4f6f','#9c9a7f','#f4f1ea','#3a5f7f','#8a5a2b'],wk:'plaster',fh:3.3,gf:'house'},
  brick:{bases:['#9a4a35','#80402f','#b0603f','#74493b','#a8553c'],wk:'brick',fh:3.8,gf:'boutique'},
  ribbon:{bases:['#ebe7df','#d9d4c9','#c9d0d3','#e2ddd0'],wk:'plaster',fh:3.6,gf:'glass'},
  curtain:{bases:['#2f5b78','#365f5a','#5a4e44','#3d4e6b','#41606e'],wk:'glass',fh:3.8,gf:'glass'},
  grid:{bases:['#d6cbb5','#bdb5a6','#a4a9ad','#dccfb8','#c7b79a'],wk:'stone',fh:3.8,gf:'arcade'},
  indus:{bases:['#8a949c','#6f7f8f','#b98a5a','#56705f','#9b4338','#c5c0b2'],wk:'metal',fh:4.4,gf:'garage'}
};
const SHOPC16=['#2f4a3a','#5a2228','#22324a','#1f2226','#6b4a2a','#2c4f5c','#7a2f3a'];

/* ----- textures de façade : 4 travées x 8 étages, fenêtres jamais coupées ----- */
function facTex16(fam,F,lit,em,seed){
  const R=srand16(seed),c=document.createElement('canvas');c.width=256;c.height=512;const g=c.getContext('2d');
  if(em){g.fillStyle='#000';g.fillRect(0,0,256,512);}else wallBase(g,{c:F.c,k:F.wk},256,512);
  const glass=(x,y,w,h,on)=>{const gr=g.createLinearGradient(x,y,x+w*0.6,y+h);gr.addColorStop(0,on?'#b4c8d6':'#a6bccd');gr.addColorStop(0.45,on?'#6d879d':'#4a6278');gr.addColorStop(1,'#2a3846');g.fillStyle=gr;g.fillRect(x,y,w,h);};
  for(let r=0;r<8;r++)for(let k=0;k<4;k++){
    const on=lit[r*4+k],cur=R(),lc=rpick16(R,LITC),st=R();
    if(fam==='hauss'){
      const x=k*64+19,y=r*64+9,w=26,h=44;
      if(em){if(on){g.fillStyle=lc;g.fillRect(x,y,w,h);if(cur<0.4){g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(x,y,7,h);g.fillRect(x+w-7,y,7,h);}g.fillStyle='#000';g.fillRect(x+12,y,2,h);g.fillRect(x,y+13,w,2);g.fillRect(x,y+h-13,w,1);for(let i=0;i<w;i+=3)g.fillRect(x+i,y+h-12,1,12);}continue;}
      if(k===0){g.fillStyle='rgba(255,255,255,0.22)';g.fillRect(0,r*64+59,256,3);g.fillStyle='rgba(0,0,0,0.16)';g.fillRect(0,r*64+62,256,2);}
      g.fillStyle='rgba(255,250,238,0.5)';g.fillRect(x-4,y-5,w+8,h+6);
      g.fillStyle='rgba(0,0,0,0.12)';g.fillRect(x-4,y-5,w+8,2);
      g.fillStyle='rgba(255,252,244,0.75)';g.fillRect(x+w/2-4,y-8,8,7);
      if(r%4===1){g.fillStyle='rgba(255,250,238,0.6)';g.beginPath();g.moveTo(x-6,y-6);g.lineTo(x+w/2,y-14);g.lineTo(x+w+6,y-6);g.fill();}
      glass(x,y,w,h,on);
      if(cur<0.45){g.fillStyle='rgba(240,234,220,0.55)';g.fillRect(x,y,6,h);g.fillRect(x+w-6,y,6,h);}
      g.fillStyle='#efe9dc';g.fillRect(x+12,y,2,h);g.fillRect(x,y+13,w,2);
      g.fillStyle='rgba(30,32,35,0.9)';g.fillRect(x-1,y+h-13,w+2,2);g.fillRect(x-1,y+h-2,w+2,2);for(let i=1;i<w;i+=3)g.fillRect(x+i,y+h-12,1,10);
      g.fillStyle='rgba(255,252,244,0.8)';g.fillRect(x-5,y+h,w+10,3);g.fillStyle='rgba(0,0,0,0.22)';g.fillRect(x-5,y+h+3,w+10,2);
    }else if(fam==='shutter'){
      const x=k*64+20,y=r*64+13,w=24,h=34,closed=st<0.2;
      if(em){if(on&&!closed){g.fillStyle=lc;g.fillRect(x,y,w,h);g.fillStyle='#000';g.fillRect(x+11,y,2,h);g.fillRect(x,y+15,w,2);}else if(on){g.fillStyle='rgba(255,200,120,0.5)';for(let i=2;i<h;i+=4)g.fillRect(x+2,y+i,w-4,1);}continue;}
      g.fillStyle='rgba(0,0,0,0.14)';g.fillRect(x-2,y-3,w+4,3);
      glass(x,y,w,h,on);
      g.fillStyle='#f4efe4';g.fillRect(x+11,y,2,h);g.fillRect(x,y+15,w,2);g.fillRect(x-1,y,1,h);g.fillRect(x+w,y,1,h);
      if(cur<0.35){g.fillStyle='rgba(245,240,228,0.75)';g.fillRect(x+1,y+1,w-2,9);}
      const sc=F.a,sl=(sx,sw)=>{g.fillStyle=sc;g.fillRect(sx,y-1,sw,h+2);g.fillStyle='rgba(0,0,0,0.2)';for(let i=1;i<h+2;i+=3)g.fillRect(sx,y-1+i,sw,1);g.fillStyle='rgba(255,255,255,0.15)';g.fillRect(sx,y-1,1,h+2);};
      if(closed){sl(x,12);sl(x+12,12);g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(x+11,y-1,2,h+2);}
      else if(st<0.88){sl(x-12,11);sl(x+w+1,11);}
      g.fillStyle='rgba(255,255,255,0.8)';g.fillRect(x-3,y+h,w+6,3);g.fillStyle='rgba(0,0,0,0.25)';g.fillRect(x-3,y+h+3,w+6,2);
      if(st>0.82&&st<0.88){g.fillStyle='#4b8a43';g.fillRect(x-1,y+h-6,w+2,6);g.fillStyle=rpick16(R,['#d94f4f','#f2c200','#e47fb0']);for(let i=0;i<4;i++)g.fillRect(x+2+i*6,y+h-8,3,3);}else R();
    }else if(fam==='brick'){
      const x=k*64+18,y=r*64+20,w=28,h=32,rr=14;
      const path=()=>{g.beginPath();g.moveTo(x,y+h);g.lineTo(x,y);g.arc(x+rr,y,rr,Math.PI,0);g.lineTo(x+w,y+h);g.closePath();};
      if(em){if(on){g.fillStyle=lc;path();g.fill();g.fillStyle='#000';g.fillRect(x+13,y-rr,2,h+rr);g.fillRect(x,y,w,2);}continue;}
      g.strokeStyle='#e4dac7';g.lineWidth=5;g.beginPath();g.arc(x+rr,y,rr+2.5,Math.PI,0);g.stroke();
      g.fillStyle='#efe6d4';g.fillRect(x+rr-3,y-rr-6,6,7);
      const gr=g.createLinearGradient(x,y-rr,x+18,y+h);gr.addColorStop(0,on?'#b0c4d2':'#9fb5c6');gr.addColorStop(0.5,on?'#647f96':'#435a6e');gr.addColorStop(1,'#283643');g.fillStyle=gr;path();g.fill();
      if(cur<0.3){g.fillStyle='rgba(236,228,210,0.6)';g.fillRect(x+1,y-4,8,h+4);g.fillRect(x+w-9,y-4,8,h+4);}
      g.fillStyle='#e9e2d4';g.fillRect(x+13,y-rr,2,h+rr);g.fillRect(x,y,w,2);g.fillRect(x,y+16,w,1);
      g.fillStyle='#e4dac7';g.fillRect(x-4,y+h,w+8,4);g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(x-4,y+h+4,w+8,2);
      if(k===0&&r%2===0){g.fillStyle='rgba(60,30,20,0.25)';g.fillRect(0,r*64+60,256,4);}
    }else if(fam==='ribbon'){
      const y=r*64+16,h=30,x=k*64,seg=st<0.5;
      if(em){if(on){g.fillStyle=lc;g.fillRect(x,y,64,h);g.fillStyle='#000';g.fillRect(x,y,2,h);g.fillRect(x+31,y,2,h);if(seg){g.fillStyle='rgba(0,0,0,0.4)';for(let i=0;i<14;i+=3)g.fillRect(x,y+i,64,1);}}continue;}
      g.fillStyle='rgba(0,0,0,0.22)';g.fillRect(x,y-3,64,3);
      const gr=g.createLinearGradient(x,y,x+64,y+h);gr.addColorStop(0,'#b9cbd7');gr.addColorStop(0.35,on?'#6e8aa0':'#56708a');gr.addColorStop(1,'#2d3b4a');g.fillStyle=gr;g.fillRect(x,y,64,h);
      if(cur<0.25){g.fillStyle='rgba(255,255,255,0.18)';g.beginPath();g.moveTo(x+18,y);g.lineTo(x+34,y);g.lineTo(x+20,y+h);g.lineTo(x+4,y+h);g.fill();}
      if(seg){g.fillStyle='rgba(232,228,216,0.8)';g.fillRect(x+2,y,62,12);g.fillStyle='rgba(0,0,0,0.12)';for(let i=1;i<12;i+=2)g.fillRect(x+2,y+i,62,1);}
      g.fillStyle='#2a3036';g.fillRect(x,y,2,h);g.fillRect(x+31,y,2,h);
      g.fillStyle='rgba(255,255,255,0.35)';g.fillRect(x,y+h,64,2);
    }else if(fam==='curtain'){
      const x=k*64,y=r*64;
      if(em){if(on){g.fillStyle=lc;g.fillRect(x,y+2,31,46);if(st<0.7)g.fillRect(x+33,y+2,31,46);g.fillStyle='#000';g.fillRect(x+31,y,2,48);}continue;}
      const base=new THREE.Color(F.c),hi='#'+base.clone().lerp(new THREE.Color(0xc9dbe8),0.55).getHexString(),lo='#'+base.clone().multiplyScalar(0.55).getHexString();
      const gr=g.createLinearGradient(x,y,x+20,y+48);gr.addColorStop(0,hi);gr.addColorStop(0.55,F.c);gr.addColorStop(1,lo);g.fillStyle=gr;g.fillRect(x,y,64,48);
      if(on){g.fillStyle='rgba(255,236,200,0.08)';g.fillRect(x+2,y+30,60,18);}
      if(cur<0.3){g.fillStyle='rgba(255,255,255,0.14)';g.beginPath();g.moveTo(x+8,y);g.lineTo(x+22,y);g.lineTo(x+6,y+48);g.lineTo(x-8,y+48);g.fill();}
      g.fillStyle=lo;g.fillRect(x,y+48,64,16);g.fillStyle='rgba(255,255,255,0.08)';g.fillRect(x,y+48,64,1);
      g.fillStyle='#b8c2ca';g.fillRect(x,y,2,64);g.fillRect(x+31,y,1,48);g.fillRect(x,y+47,64,2);
    }else if(fam==='grid'){
      const x=k*64+9,y=r*64+9,w=46,h=40;
      if(em){if(on){g.fillStyle=lc;g.fillRect(x,y,w,h);g.fillStyle='#000';g.fillRect(x+15,y,2,h);g.fillRect(x+30,y,2,h);}continue;}
      glass(x,y,w,h,on);
      g.fillStyle='rgba(0,0,0,0.42)';g.fillRect(x,y,w,5);g.fillStyle='rgba(0,0,0,0.25)';g.fillRect(x,y,4,h);
      g.fillStyle='rgba(255,255,255,0.22)';g.fillRect(x+w-2,y,2,h);g.fillRect(x,y+h-2,w,2);
      g.fillStyle='#d6d8d4';g.fillRect(x+15,y,2,h);g.fillRect(x+30,y,2,h);
      if(cur<0.3){g.fillStyle='rgba(235,230,215,0.7)';g.fillRect(x+2,y+5,12,h-7);}
      g.fillStyle='rgba(0,0,0,0.1)';g.fillRect(k*64+1,r*64,3,64);g.fillStyle='rgba(255,255,255,0.18)';g.fillRect(k*64+4,r*64,1,64);
      if(k===0){g.fillStyle='rgba(0,0,0,0.12)';g.fillRect(0,r*64+52,256,1);g.fillRect(0,r*64+56,256,1);}
    }else{ /* indus */
      const y=r*64+8;
      if(r%2===0){
        if(em){if(on){g.fillStyle=lc;for(let i=0;i<4;i++)g.fillRect(k*64+4+i*15,y,12,14);}continue;}
        for(let i=0;i<4;i++){const xx=k*64+4+i*15;g.fillStyle='#2b3844';g.fillRect(xx,y,12,14);g.fillStyle='rgba(255,255,255,0.28)';g.fillRect(xx,y,12,2);g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(xx,y+14,12,2);}
      }else if(!em&&k===0){g.fillStyle='rgba(0,0,0,0.18)';g.fillRect(0,r*64+62,256,2);}
    }
  }
  if(!em&&fam!=='curtain'){ /* coulures et patine verticale */
    for(let i=0;i<40;i++){const x=R()*256,y=R()*512,l=20+R()*90;const gr=g.createLinearGradient(0,y,0,y+l);gr.addColorStop(0,'rgba(40,35,30,0.10)');gr.addColorStop(1,'rgba(40,35,30,0)');g.fillStyle=gr;g.fillRect(x,y,2+R()*4,l);}
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;
}
/* rez-de-chaussée : 4 travées */
function gfTex16(kind,F,em,seed){
  const R=srand16(seed),c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');
  const sc=F.sc||'#2f4a3a';
  if(em){g.fillStyle='#000';g.fillRect(0,0,256,64);}else{wallBase(g,{c:F.gc||F.c,k:kind==='arcade'?'plaster':F.wk==='glass'?'plaster':F.wk},256,64);}
  for(let k=0;k<4;k++){
    const x=k*64,lc=rpick16(R,['#ffcf7a','#ffe0a8','#fff0d0','#ffd59a']),door=R()<0.3,dis=[R(),R(),R()];
    if(kind==='arcade'){
      if(em){g.fillStyle=lc;g.fillRect(x+12,18,40,46);continue;}
      if(k===0){g.fillStyle='rgba(0,0,0,0.13)';for(let y=8;y<64;y+=9)g.fillRect(0,y,256,2);}
      g.fillStyle=sc;g.beginPath();g.moveTo(x+7,64);g.lineTo(x+7,16);g.quadraticCurveTo(x+7,8,x+15,8);g.lineTo(x+49,8);g.quadraticCurveTo(x+57,8,x+57,16);g.lineTo(x+57,64);g.fill();
      g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(x+7,8,50,2);
      const gr=g.createLinearGradient(x,18,x+30,64);gr.addColorStop(0,'#7891a7');gr.addColorStop(0.5,'#33475a');gr.addColorStop(1,'#222c36');g.fillStyle=gr;g.fillRect(x+12,18,40,46);
      for(let i=0;i<3;i++){g.fillStyle=['#b5382f','#e0b34a','#3b8f56','#e8e2d6','#2f6db5'][Math.floor(dis[i]*5)];g.globalAlpha=0.6;g.fillRect(x+15+i*12,46+dis[i]*6,8,18);g.globalAlpha=1;}
      g.fillStyle=sc;g.fillRect(x+12,26,40,2);g.fillRect(x+31,18,2,46);
      g.fillStyle='rgba(255,255,255,0.14)';g.beginPath();g.moveTo(x+18,18);g.lineTo(x+26,18);g.lineTo(x+16,64);g.lineTo(x+8+4,64);g.fill();
    }else if(kind==='boutique'){
      if(em){g.fillStyle=lc;g.fillRect(x+6,20,52,44);continue;}
      g.fillStyle=sc;g.fillRect(x,4,64,12);g.fillStyle='rgba(255,255,255,0.18)';g.fillRect(x,4,64,1);g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(x,15,64,2);
      g.fillStyle=sc;g.fillRect(x+3,17,58,47);
      const gr=g.createLinearGradient(x,20,x+30,64);gr.addColorStop(0,'#7d96ab');gr.addColorStop(0.5,'#36495b');gr.addColorStop(1,'#243039');g.fillStyle=gr;g.fillRect(x+6,20,52,door?44:36);
      if(!door){g.fillStyle=sc;g.fillRect(x+6,56,52,8);}
      for(let i=0;i<3;i++){g.fillStyle=['#c0392b','#f2c200','#4fb58a','#f4f1ea','#7b4bb3'][Math.floor(dis[i]*5)];g.globalAlpha=0.6;g.fillRect(x+10+i*16,40+dis[i]*6,10,14);g.globalAlpha=1;}
      g.fillStyle=sc;g.fillRect(x+31,20,2,44);
    }else if(kind==='glass'){
      if(em){g.fillStyle=lc;g.fillRect(x+2,8,60,56);continue;}
      g.fillStyle='#2a3036';g.fillRect(x,4,64,4);
      const gr=g.createLinearGradient(x,8,x+40,64);gr.addColorStop(0,'#a3b8c8');gr.addColorStop(0.4,'#4e667b');gr.addColorStop(1,'#26323d');g.fillStyle=gr;g.fillRect(x,8,64,56);
      g.fillStyle='rgba(255,240,210,0.12)';g.fillRect(x,30,64,34);
      for(let i=0;i<2;i++){g.fillStyle='rgba(30,30,30,0.5)';g.fillRect(x+12+i*28+dis[i]*6,46,6,18);}
      g.fillStyle='#30373e';g.fillRect(x,8,2,56);g.fillRect(x+32,8,1,56);g.fillRect(x,28,64,1);
    }else if(kind==='garage'){
      if(em){if(k%2===0){g.fillStyle=lc;g.fillRect(x+46,22,12,10);}continue;}
      g.fillStyle='#8c9399';g.fillRect(x+4,8,40,56);g.fillStyle='rgba(0,0,0,0.22)';for(let y=10;y<64;y+=4)g.fillRect(x+4,y,40,1);
      g.fillStyle='#e0b400';g.fillRect(x+2,6,2,58);g.fillRect(x+44,6,2,58);g.fillStyle='rgba(0,0,0,0.4)';g.fillRect(x+4,8,40,3);
      g.fillStyle='#2f3d4a';g.fillRect(x+46,22,12,10);
    }else{ /* house : fenêtres à volets en rez-de-chaussée */
      const xx=x+20,y=18,w=24,h=34;
      if(em){if(dis[0]<0.6){g.fillStyle=lc;g.fillRect(xx,y,w,h);g.fillStyle='#000';g.fillRect(xx+11,y,2,h);}continue;}
      const gr=g.createLinearGradient(xx,y,xx+16,y+h);gr.addColorStop(0,'#a6bccd');gr.addColorStop(0.5,'#4a6278');gr.addColorStop(1,'#2a3846');g.fillStyle=gr;g.fillRect(xx,y,w,h);
      g.fillStyle='#f4efe4';g.fillRect(xx+11,y,2,h);g.fillRect(xx,y+15,w,2);
      g.fillStyle=F.a||'#5c7a8a';g.fillRect(xx-12,y-1,11,h+2);g.fillRect(xx+w+1,y-1,11,h+2);g.fillStyle='rgba(0,0,0,0.2)';for(let i=1;i<h+2;i+=3){g.fillRect(xx-12,y-1+i,11,1);g.fillRect(xx+w+1,y-1+i,11,1);}
      g.fillStyle='rgba(0,0,0,0.18)';g.fillRect(x,56,64,8);
    }
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;
}
/* matériaux : chaque famille décline plusieurs teintes ; les vitres s'allument la nuit */
function famMats16(fam,count){
  if(A16.F[fam])return A16.F[fam];
  const P=FAM16[fam],out=[];
  for(let i=0;i<count;i++){
    const seed=(fam.length*977+i*131+7)*13,R=srand16(seed);
    const F={c:P.bases[i%P.bases.length],wk:P.wk,a:P.acc?P.acc[(i*3+1)%P.acc.length]:'#5c7a8a',sc:SHOPC16[(i*2+fam.length)%SHOPC16.length]};
    if(fam==='curtain'||fam==='ribbon'||fam==='grid')F.gc=fam==='grid'?P.bases[i%P.bases.length]:'#c9c6bf';
    if(fam==='hauss')F.gc=P.bases[i%P.bases.length];
    const lit=[];for(let k=0;k<32;k++)lit.push(R()<0.42);
    const o={map:facTex16(fam,F,lit,false,seed),emissiveMap:facTex16(fam,F,lit,true,seed),emissive:new THREE.Color(0xffd89a),emissiveIntensity:0};
    const wall=fam==='curtain'?new THREE.MeshStandardMaterial(Object.assign(o,{roughness:0.16,metalness:0.55})):new THREE.MeshLambertMaterial(o);
    const gfk=P.gf,gm=new THREE.MeshLambertMaterial({map:gfTex16(gfk,F,false,seed+1),emissiveMap:gfTex16(gfk,F,true,seed+1),emissive:new THREE.Color(0xffd89a),emissiveIntensity:0});
    aoPatch16(wall,0.6,4.5);aoPatch16(gm,0.58,3.6);
    wallMats.push(wall);shopMats.push(gm);
    out.push({wall,gf:gm,F,fh:P.fh,col:hexOf(F.c),acc:hexOf(F.a),sc:hexOf(F.sc)});
  }
  A16.F[fam]=out;return out;
}

/* ----- géométrie : polygones d'emprise ----- */
function area16(p){let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return a/2;}
function edges16(p){
  const s=area16(p)>0?1:-1,E=[];
  for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],tx=b[0]-a[0],tz=b[1]-a[1],l=Math.hypot(tx,tz)||1e-6;E.push({a,b,len:l,t:[tx/l,tz/l],n:[s*tz/l,-s*tx/l],i});}
  return E;
}
function offset16(p,d){
  const E=edges16(p),n=p.length;
  return p.map((v,i)=>{const e1=E[(i-1+n)%n],e2=E[i];let mx=e1.n[0]+e2.n[0],mz=e1.n[1]+e2.n[1];const ml=Math.hypot(mx,mz)||1;mx/=ml;mz/=ml;const k=d/Math.max(0.35,mx*e2.n[0]+mz*e2.n[1]);return[v[0]+mx*k,v[1]+mz*k];});
}
/* rectangle à angles traités : cut[i] = [type,taille] par coin (ordre : -x-z, +x-z, +x+z, -x+z) */
function shape16(w,d,corners){
  const C=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]],pts=[],sharp=[];
  C.forEach((P,i)=>{
    const ty=corners&&corners[i]?corners[i][0]:'n',c=corners&&corners[i]?corners[i][1]:0;
    if(ty==='n'||c<=0){pts.push(P);sharp.push(true);return;}
    const Pp=C[(i+3)%4],Pn=C[(i+1)%4],u1=[Math.sign(Pp[0]-P[0]),Math.sign(Pp[1]-P[1])],u2=[Math.sign(Pn[0]-P[0]),Math.sign(Pn[1]-P[1])];
    if(ty==='c'){pts.push([P[0]+u1[0]*c,P[1]+u1[1]*c]);sharp.push(true);pts.push([P[0]+u2[0]*c,P[1]+u2[1]*c]);sharp.push(true);}
    else{const Cc=[P[0]+(u1[0]+u2[0])*c,P[1]+(u1[1]+u2[1])*c],N=6;
      for(let k=0;k<=N;k++){const t=k/N*Math.PI/2;pts.push([Cc[0]-c*(u2[0]*Math.cos(t)+u1[0]*Math.sin(t)),Cc[1]-c*(u2[1]*Math.cos(t)+u1[1]*Math.sin(t))]);sharp.push(k===0||k===N?false:false);}
    }
  });
  return{pts,sharp};
}
const tr16=(p,x,z)=>p.map(v=>[v[0]+x,v[1]+z]);

/* murs texturés : u en travées entières par façade, v en étages */
function walls16(pts,sharp,yA,yB,vBase,vSpan,ground,ou){
  const n=pts.length,E=edges16(pts),pos=[],nor=[],uv=[];
  const vn=pts.map((v,i)=>{if(sharp[i])return null;const a=E[(i-1+n)%n].n,b=E[i].n,l=Math.hypot(a[0]+b[0],a[1]+b[1])||1;return[(a[0]+b[0])/l,(a[1]+b[1])/l];});
  let start=sharp.indexOf(true);if(start<0)start=0;
  const U=new Array(n+1);
  for(let s=0;s<n;){ /* tronçons entre angles vifs */
    let e=s,L=0;do{L+=E[(start+e)%n].len;e++;}while(e<n&&!sharp[(start+e)%n]);
    const bays=Math.max(1,Math.round(L/4)),k=bays/L/4;let acc=0;
    for(let q=s;q<e;q++){U[q]=[ou+acc*k,ou+(acc+E[(start+q)%n].len)*k];acc+=E[(start+q)%n].len;}
    s=e;
  }
  const v=y=>ground?(y-yA)/(yB-yA):(y-vBase)/vSpan;
  for(let q=0;q<n;q++){
    const i=(start+q)%n,e=E[i],j=(i+1)%n,a=pts[i],b=pts[j];
    const na=sharp[i]?e.n:vn[i],nb=sharp[j]?e.n:vn[j],[u0,u1]=U[q];
    const P=[[a[0],yA,a[1],na,u0,v(yA)],[b[0],yA,b[1],nb,u1,v(yA)],[b[0],yB,b[1],nb,u1,v(yB)],[a[0],yB,a[1],na,u0,v(yB)]];
    const s=area16(pts)>0;
    const ord=s?[0,2,1,0,3,2]:[0,1,2,0,2,3];
    ord.forEach(k=>{const p=P[k];pos.push(p[0],p[1],p[2]);nor.push(p[3][0],0,p[3][1]);uv.push(p[4],p[5]);});
  }
  return{pos,nor,uv};
}
function addWalls16(mat,W){(A16.batch.get(mat)||A16.batch.set(mat,[]).get(mat)).push(W);}
function fixWind16(g,ref){ /* oriente chaque triangle vers l'extérieur */
  const p=g.attributes.position;
  for(let i=0;i<p.count;i+=3){
    const ax=p.getX(i),ay=p.getY(i),az=p.getZ(i),bx=p.getX(i+1)-ax,by=p.getY(i+1)-ay,bz=p.getZ(i+1)-az,cx=p.getX(i+2)-ax,cy=p.getY(i+2)-ay,cz=p.getZ(i+2)-az;
    const nx=by*cz-bz*cy,ny=bz*cx-bx*cz,nz=bx*cy-by*cx,r=ref(ax+(bx+cx)/3,ay+(by+cy)/3,az+(bz+cz)/3,i);
    if(nx*r[0]+ny*r[1]+nz*r[2]<0){const X=p.getX(i+1),Y=p.getY(i+1),Z=p.getZ(i+1);p.setXYZ(i+1,p.getX(i+2),p.getY(i+2),p.getZ(i+2));p.setXYZ(i+2,X,Y,Z);}
  }
  g.computeVertexNormals();return g;
}
function triGeo16(arr){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));return g;}
/* dalle pleine (bandeau, corniche, socle) */
function prism16(p,yA,yB,c){
  const sh=new THREE.Shape(p.map(v=>new THREE.Vector2(v[0],-v[1])));
  const g=new THREE.ExtrudeGeometry(sh,{depth:yB-yA,bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);g.translate(0,yA,0);
  DECO.push({g,m:new THREE.Matrix4(),c});
}
/* acrotère : anneau creux */
function ring16(p,oo,oi,yA,yB,c){
  const O=offset16(p,oo),I=offset16(p,-oi),sh=new THREE.Shape(O.map(v=>new THREE.Vector2(v[0],-v[1])));
  sh.holes.push(new THREE.Path(I.map(v=>new THREE.Vector2(v[0],-v[1]))));
  const g=new THREE.ExtrudeGeometry(sh,{depth:yB-yA,bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);g.translate(0,yA,0);
  DECO.push({g,m:new THREE.Matrix4(),c});
}
function cap16(p,y,c){
  const tri=THREE.ShapeUtils.triangulateShape(p.map(v=>new THREE.Vector2(v[0],v[1])),[]),a=[];
  tri.forEach(t=>t.forEach(k=>a.push(p[k][0],y,p[k][1])));
  DECO.push({g:fixWind16(triGeo16(a),()=>[0,1,0]),m:new THREE.Matrix4(),c});
}
/* toit en pente entre deux contours de même nombre de sommets */
function loft16(pA,yA,pB,yB,c,capC){
  const E=edges16(pA),a=[];
  for(let i=0;i<pA.length;i++){const j=(i+1)%pA.length;a.push(pA[i][0],yA,pA[i][1],pA[j][0],yA,pA[j][1],pB[j][0],yB,pB[j][1],pA[i][0],yA,pA[i][1],pB[j][0],yB,pB[j][1],pB[i][0],yB,pB[i][1]);}
  const g=triGeo16(a);
  fixWind16(g,(x,y,z,i)=>{const e=E[Math.floor(i/6)];return[e.n[0],0.6,e.n[1]];});
  DECO.push({g,m:new THREE.Matrix4(),c});
  if(capC!=null)cap16(pB,yB,capC);
}
/* boîte orientée le long d'une arête */
function along16(e,t,off,y,len,h,dep,c){
  const x=e.a[0]+e.t[0]*t+e.n[0]*off,z=e.a[1]+e.t[1]*t+e.n[1]*off;
  DECO.push(pp(UBX,x,y,z,c,len,h,dep,0,Math.atan2(-e.t[1],e.t[0]),0));
}
/* balcon filant : dalle + garde-corps en fer forgé (texture instanciée) */
function balcony16(e,y,dep,slabC,from,to){
  const L=(to==null?e.len:to)-(from||0);if(L<1.2)return;const mid=(from||0)+L/2;
  along16(e,mid,dep/2,y,L,0.16,dep,slabC);
  along16(e,mid,dep*0.5,y-0.13,L-0.1,0.1,dep*0.7,shade(slabC,0.8));
  const n=Math.max(1,Math.round(L/1.2));
  for(let k=0;k<n;k++){const t=(from||0)+(k+0.5)*L/n;A16.rails.push({x:e.a[0]+e.t[0]*t+e.n[0]*(dep-0.03),y:y+0.55,z:e.a[1]+e.t[1]*t+e.n[1]*(dep-0.03),ry:Math.atan2(-e.t[1],e.t[0]),w:L/n});}
  [0,1].forEach(s=>{const t=(from||0)+(s?L-0.03:0.03);A16.rails.push({x:e.a[0]+e.t[0]*t+e.n[0]*dep/2,y:y+0.55,z:e.a[1]+e.t[1]*t+e.n[1]*dep/2,ry:Math.atan2(-e.t[1],e.t[0])+Math.PI/2,w:dep});});
}
function chimney16(x,y,z,c,R){
  const w=0.6+R()*0.5,d=0.9+R()*0.8,h=1.2+R()*1.2;
  DECO.push(pp(UBX,x,y+h/2,z,c,w,h,d));DECO.push(pp(UBX,x,y+h+0.06,z,0xd8d0c0,w+0.14,0.12,d+0.14));
  const n=Math.max(1,Math.round(d/0.4));for(let k=0;k<n;k++)DECO.push(pp(cyl(0.09,0.11,0.35,6),x,y+h+0.3,z-d/2+(k+0.5)*d/n,0xb5603f));
}
function hvac16(x,y,z,R){
  const w=1.2+R()*1.6,d=1.2+R()*1.4,h=0.7+R()*0.8;
  DECO.push(pp(UBX,x,y+h/2,z,pick([0x9ba1a8,0xb4b9bf,0x858c93]),w,h,d));
  if(R()<0.6)DECO.push(pp(cyl(w*0.32,w*0.32,0.12,12),x,y+h+0.06,z,0x5a6068));
}
function watertank16(x,y,z){
  [[-0.7,-0.7],[0.7,-0.7],[-0.7,0.7],[0.7,0.7]].forEach(q=>dbox(x+q[0],y+1,z+q[1],0.12,2,0.12,0x3a3f47));
  DECO.push(pp(cyl(1.1,1.1,2.2,12),x,y+3.1,z,0x8a6a4a));DECO.push(pp(new THREE.ConeGeometry(1.15,0.7,12),x,y+4.55,z,0x5a4636));
  for(let k=0;k<3;k++)DECO.push(pp(cyl(1.12,1.12,0.06,12),x,y+2.3+k*0.7,z,0x2e3338));
}
/* point d'intérieur pour les équipements de toit */
function inside16(p,R,m){
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;p.forEach(v=>{x0=Math.min(x0,v[0]);x1=Math.max(x1,v[0]);z0=Math.min(z0,v[1]);z1=Math.max(z1,v[1]);});
  return[lerp(x0+m,x1-m,R()),lerp(z0+m,z1-m,R())];
}

/* ----- toits ----- */
function roofFlat16(p,y,R,o){
  o=o||{};const pc=o.parapet||0x8d8a84,rc=o.roofC||pick([0x6d7177,0x77736c,0x5f646a]);
  cap16(offset16(p,-0.05),y+0.02,rc);
  ring16(p,0.12,0.32,y,y+(o.ph||0.85),pc);
  prism16(offset16(p,0.2),y+(o.ph||0.85),y+(o.ph||0.85)+0.12,shade(pc,1.08));
  const n=o.units==null?1+Math.floor(R()*3):o.units;
  for(let k=0;k<n;k++){const q=inside16(p,R,3);hvac16(q[0],y,q[1],R);}
  if(o.tank&&R()<0.7){const q=inside16(p,R,3.5);watertank16(q[0],y,q[1]);}
  if(o.stair&&R()<0.6){const q=inside16(p,R,3.5);DECO.push(pp(UBX,q[0],y+1.4,q[1],shade(pc,0.95),2.6,2.8,3.2));DECO.push(pp(UBX,q[0],y+2.85,q[1],shade(pc,0.8),2.9,0.12,3.5));}
  if(o.solar){for(let k=0;k<3;k++){const q=inside16(p,R,3);DECO.push(pp(UBX,q[0],y+0.6,q[1],0x1f2f4a,3.2,0.08,1.6,-0.35,0,0));DECO.push(pp(UBX,q[0],y+0.3,q[1],0x8a9099,0.1,0.5,0.1));}}
}
function roofMansard16(p,y,R,o){
  const zinc=o.roofC||pick([0x5d6873,0x4f5862,0x65707b,0x56606a]),A=offset16(p,0.3),B=offset16(p,-1.3),Cc=offset16(p,-2.6);
  /* corniche moulurée */
  prism16(offset16(p,0.16),y-0.55,y-0.25,shade(o.wc,1.06));
  prism16(offset16(p,0.42),y-0.25,y+0.05,shade(o.wc,1.1));
  loft16(A,y+0.05,B,y+3.0,zinc);loft16(B,y+3.0,Cc,y+3.7,shade(zinc,0.9),shade(zinc,0.85));
  /* lucarnes */
  edges16(p).forEach(e=>{
    if(e.len<3.5)return;const bays=Math.max(1,Math.round(e.len/4)),step=e.len/bays;
    for(let k=0;k<bays;k++){
      if(bays>2&&k%2===1&&R()<0.5)continue;
      const t=(k+0.5)*step,off=-0.25;
      along16(e,t,off-0.55,y+1.95,1.25,1.8,1.3,0xe9e4da);
      along16(e,t,off+0.06,y+1.85,0.8,1.1,0.06,0x34495e);
      along16(e,t,off+0.1,y+1.85,0.06,1.1,0.04,0xf4efe4);
      const x=e.a[0]+e.t[0]*t+e.n[0]*(off-0.5),z=e.a[1]+e.t[1]*t+e.n[1]*(off-0.5),ry=Math.atan2(-e.t[1],e.t[0]);
      DECO.push(ppE(new THREE.ConeGeometry(0.95,0.75,4,1),x,y+3.2,z,zinc,1,1,1.05,0,ry+Math.PI/4,0));
    }
  });
  const n=1+Math.floor(R()*3);for(let k=0;k<n;k++){const q=inside16(Cc,R,1.2);chimney16(q[0],y+3.0,q[1],pick([0xb5603f,0xa4492f,0xd8cfc0]),R);}
}
function roofHip16(p,w,d,y,R,o){
  const rc=o.roofC||pick([0xb5603f,0xa4492f,0xc06a45,0x8a3d2b,0x5f6b75]),A=offset16(p,0.55),k=Math.min(w,d)/2-0.25,B=offset16(p,-k);
  const hr=Math.min(w,d)*(0.28+R()*0.1);
  DECO.push(pp(UBX,0,0,0,0,0,0,0));DECO.pop();
  prism16(offset16(p,0.1),y-0.25,y,shade(o.wc,1.08));
  loft16(A,y,B,y+hr,rc,shade(rc,0.9));
  const n=R()<0.7?1+Math.floor(R()*2):0;for(let q=0;q<n;q++){const c=inside16(p,R,Math.min(w,d)/3);chimney16(c[0],y+hr*0.45,c[1],o.wc,R);}
}
function roofGable16(cx,cz,w,d,y,R,o){
  const hr=Math.min(w,d)*(0.3+R()*0.12),rc=o.roofC||pick([0xa4492f,0x8a3d2b,0xb5603f,0x5f6b75,0xc06a45]);
  DECO.push({g:gableGeo(w,d,hr,0.55),m:new THREE.Matrix4().makeTranslation(cx,y,cz),c:rc});
  DECO.push({g:gableEnds(w,d,hr),m:new THREE.Matrix4().makeTranslation(cx,y,cz),c:o.wc});
  /* rives et faîtage */
  const along=w>=d,L=(along?w:d)+1.1;
  DECO.push(pp(UBX,cx,y+hr+0.06,cz,shade(rc,0.75),along?L:0.3,0.14,along?0.3:L));
  if(R()<0.75){const c=along?[cx+rand(-w/4,w/4),cz+rand(-d/6,d/6)]:[cx+rand(-w/6,w/6),cz+rand(-d/4,d/4)];chimney16(c[0],y+hr*0.5,c[1],o.wc,R);}
  if(o.ridgeWin){const t=[cx,cz+(along?d/2-0.2:0)];}
}
function roofSaw16(cx,cz,w,d,y,R,o){
  const n=Math.max(2,Math.round(w/5)),tw=w/n,ht=2.2,rc=o.roofC||0x8f969c;
  for(let k=0;k<n;k++){
    const xa=cx-w/2+k*tw,xb=xa+tw,sh=new THREE.Shape([new THREE.Vector2(xa,0),new THREE.Vector2(xb,0),new THREE.Vector2(xb,ht)]);
    const g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false});g.translate(0,y,cz-d/2);DECO.push({g,m:new THREE.Matrix4(),c:k%2?rc:shade(rc,0.94)});
    DECO.push(pp(UBX,xb-0.04,y+ht/2+0.1,cz,0x3c5468,0.06,ht*0.75,d-0.6));
  }
  ring16(tr16(polyR16(w,d),cx,cz),0.1,0.2,y-0.1,y+0.35,shade(o.wc,0.85));
}
function roofBarrel16(cx,cz,w,d,y,R,o){
  const N=14,hb=Math.min(d*0.24,4),rc=o.roofC||pick([0x8f969c,0x6a737b,0x9a5a3a]),a=[];
  for(let i=0;i<N;i++){const t0=i/N*Math.PI,t1=(i+1)/N*Math.PI,z0=cz-Math.cos(t0)*d/2*1.02,z1=cz-Math.cos(t1)*d/2*1.02,y0=y+Math.sin(t0)*hb,y1=y+Math.sin(t1)*hb,x0=cx-w/2-0.3,x1=cx+w/2+0.3;
    a.push(x0,y0,z0,x1,y0,z0,x1,y1,z1,x0,y0,z0,x1,y1,z1,x0,y1,z1);}
  DECO.push({g:fixWind16(triGeo16(a),(x,yy,z)=>[0,yy-y+0.01,z-cz]),m:new THREE.Matrix4(),c:rc});
  [-1,1].forEach(s=>{const b=[];for(let i=0;i<N;i++){const t0=i/N*Math.PI,t1=(i+1)/N*Math.PI;b.push(cx+s*w/2,y,cz,cx+s*w/2,y+Math.sin(t0)*hb,cz-Math.cos(t0)*d/2,cx+s*w/2,y+Math.sin(t1)*hb,cz-Math.cos(t1)*d/2);}
    DECO.push({g:fixWind16(triGeo16(b),()=>[s,0,0]),m:new THREE.Matrix4(),c:o.wc});
    DECO.push(pp(UBX,cx+s*(w/2+0.03),y+hb*0.45,cz,0x3c5468,0.06,hb*0.55,d*0.45));});
  for(let k=1;k<Math.round(w/4);k++)DECO.push(pp(UBX,cx-w/2+k*w/Math.round(w/4),y+hb+0.02,cz,shade(rc,0.8),0.08,0.06,0.5));
}
const polyR16=(w,d)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]];

/* ----- volume complet : rdc + étages ----- */
function volume16(pts,sharp,yA,yB,M,o){
  const y0=A16.y0,gfTop=y0+GF,ou=o.ou||0,vSpan=8*M.fh;
  if(yA<=y0+0.01&&o.gf!==false){
    addWalls16(M.gf,walls16(pts,sharp,y0,gfTop,0,1,true,ou));
    addWalls16(M.wall,walls16(pts,sharp,gfTop,yB,gfTop,vSpan,false,ou));
  }else addWalls16(M.wall,walls16(pts,sharp,yA,yB,gfTop,vSpan,false,ou));
}
function foot16(pts,big,extra){
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;pts.forEach(v=>{x0=Math.min(x0,v[0]);x1=Math.max(x1,v[0]);z0=Math.min(z0,v[1]);z1=Math.max(z1,v[1]);});
  const b=Object.assign({x0,x1,z0,z1,big:big!==false},extra||{});boxes.push(b);return b;
}
/* soubassement + bandeau de rez-de-chaussée */
function base16(p,M,o){
  const y0=A16.y0;
  prism16(offset16(p,0.07),y0,y0+0.42,o.plinth||shade(M.col,0.68));
  if(o.band!==false)prism16(offset16(p,o.bandOut||0.18),y0+GF-0.12,y0+GF+0.2,o.bandC||(M.F.wk==='glass'?0x2a3440:shade(M.col,0.86)));
  A16.foot.push(p);
}

/* ----- archétypes ----- */
const ARCH16={
  /* immeuble haussmannien : pan coupé, balcons filants aux 2e et dernier étages, corniche, mansarde à lucarnes */
  hauss(cx,cz,w,d,h,o,R){
    const M=rpick16(R,famMats16('hauss',5)),fh=M.fh,n=clamp(Math.round((h-GF)/fh),2,6),top=A16.y0+GF+n*fh;
    const cor=[null,null,null,null];if(o.corner!=null)cor[o.corner]=['c',2.4+R()*0.8];if(R()<0.3)cor[(o.corner+2)%4]=['c',2.2];
    const S=shape16(w,d,cor),p=tr16(S.pts,cx,cz);
    volume16(p,S.sharp,A16.y0,top,M,{ou:o.ou});base16(p,M,{bandOut:0.22});
    const E=edges16(p);
    [1,n].forEach(f=>{if(f<1)return;const y=A16.y0+GF+f*fh-fh+0.05;E.forEach(e=>{if(e.len>2)balcony16(e,y,0.7,shade(M.col,1.05),0.15,e.len-0.15);});});
    /* bandeau intermédiaire au 1er étage */
    prism16(offset16(p,0.1),A16.y0+GF+fh-0.06,A16.y0+GF+fh+0.08,shade(M.col,1.08));
    /* bow-window occasionnel en façade arrière */
    roofMansard16(p,top,R,{wc:M.col});
    return foot16(p,true,{fw:w-(cor[2]||cor[3]?3:0.5),arch:'hauss',top:top+3.7});
  },
  /* immeuble de briques : arcs, chaînages d'angle, toit-terrasse avec château d'eau */
  brick(cx,cz,w,d,h,o,R){
    const M=rpick16(R,famMats16('brick',5)),fh=M.fh,n=clamp(Math.round((h-GF)/fh),2,7),top=A16.y0+GF+n*fh;
    const p=tr16(polyR16(w,d),cx,cz),sharp=[1,1,1,1];
    volume16(p,sharp,A16.y0,top,M,{ou:o.ou});base16(p,M,{plinth:0x6b625a,bandC:0xd8cfbd});
    const stone=0xe0d6c3;
    p.forEach(v=>{for(let y=A16.y0+GF+0.3;y<top-0.4;y+=1.1){const sx=Math.sign(v[0]-cx),sz=Math.sign(v[1]-cz),big=Math.round((y-GF)/1.1)%2;
      DECO.push(pp(UBX,v[0]-sx*(big?0.45:0.3)+sx*0.04,y,v[1]-sz*0.04+sz*0.04,stone,big?0.98:0.68,0.5,0.12));
      DECO.push(pp(UBX,v[0]+sx*0.04,y,v[1]-sz*(big?0.3:0.45)+sz*0.04,stone,0.12,0.5,big?0.68:0.98));}});
    for(let f=1;f<n;f+=2)prism16(offset16(p,0.06),A16.y0+GF+f*fh-0.1,A16.y0+GF+f*fh+0.05,0xd8cfbd);
    /* corniche en briques en encorbellement */
    ring16(p,0.14,0.3,top-0.5,top-0.2,shade(M.col,0.9));ring16(p,0.28,0.3,top-0.2,top,shade(M.col,0.82));
    roofFlat16(p,top,R,{parapet:shade(M.col,0.92),tank:true,stair:true,ph:0.7});
    return foot16(p,true,{fw:w-0.5,arch:'brick',top});
  },
  /* moderne à bandeaux : angle arrondi « paquebot », dalles débordantes, terrasse */
  ribbon(cx,cz,w,d,h,o,R){
    const M=rpick16(R,famMats16('ribbon',4)),fh=M.fh,n=clamp(Math.round((h-GF)/fh),2,12),top=A16.y0+GF+n*fh;
    const cor=[null,null,null,null];if(o.corner!=null)cor[o.corner]=['r',Math.min(4.5,Math.min(w,d)*0.3)];if(R()<0.5)cor[(o.corner+1)%4]=['r',2.5];
    const S=shape16(w,d,cor),p=tr16(S.pts,cx,cz);
    volume16(p,S.sharp,A16.y0,top,M,{ou:o.ou});base16(p,M,{band:false,plinth:0x4b5056});
    /* dalles en saillie à chaque étage : lignes horizontales qui cassent la boîte */
    for(let f=1;f<=n;f++){const y=A16.y0+GF+f*fh-0.02;if(f%2===0||f===n)prism16(offset16(p,f===n?0.6:0.32),y-0.1,y+0.1,0xeceae4);}
    prism16(offset16(p,0.5),A16.y0+GF-0.1,A16.y0+GF+0.25,0x30373e);
    roofFlat16(p,top,R,{parapet:0xe6e2da,ph:0.6,solar:R()<0.5,units:1});
    return foot16(p,true,{fw:w-(cor[2]||cor[3]?5:0.5),arch:'ribbon',top});
  },
  /* tour : socle en trame + fût en mur-rideau (arrondi ou à pans), couronnement */
  tower(cx,cz,w,d,h,o,R){
    const Mp=rpick16(R,famMats16('grid',5)),Mt=rpick16(R,famMats16('curtain',5)),podN=2+Math.floor(R()*2),podTop=A16.y0+GF+podN*Mp.fh;
    const pPod=tr16(polyR16(w,d),cx,cz);volume16(pPod,[1,1,1,1],A16.y0,podTop,Mp,{ou:o.ou});base16(pPod,Mp,{plinth:0x3d4248});
    roofFlat16(pPod,podTop,R,{parapet:shade(Mp.col,0.95),units:0,ph:1.0});
    const tw=Math.max(9,Math.round(w*0.74)),td=Math.max(9,Math.round(d*0.74)),style=R(),ox=(R()-0.5)*(w-tw)*0.6,oz=-(d-td)*0.3;
    const cor=style<0.45?[['r',3.2],['r',3.2],['r',3.2],['r',3.2]]:style<0.8?[['c',2.2],['c',2.2],['c',2.2],['c',2.2]]:null;
    const S=shape16(tw,td,cor),p=tr16(S.pts,cx+ox,cz+oz),top=podTop+Math.max(4,Math.round((h-(podTop-A16.y0))/Mt.fh))*Mt.fh;
    volume16(p,S.sharp,podTop,top,Mt,{ou:o.ou,gf:false});
    /* ailettes verticales sur les tours à pans */
    if(cor&&cor[0][0]==='c'){edges16(p).forEach(e=>{if(e.len<6)return;const k=Math.round(e.len/4);for(let i=1;i<k;i++)along16(e,i*e.len/k,0.18,(podTop+top)/2,0.12,top-podTop,0.36,0xc9d1d6);});}
    prism16(offset16(p,0.15),podTop,podTop+0.5,0x2a3440);
    /* couronnement */
    const crown=R();
    if(crown<0.4){ring16(p,0.05,0.2,top,top+2.6,0xcfd6db);cap16(offset16(p,-0.1),top+0.05,0x5f646a);for(let k=0;k<2;k++){const q=inside16(p,R,3);hvac16(q[0],top,q[1],R);}}
    else if(crown<0.75){const p2=offset16(p,-1.6);volume16(p2,S.sharp,top,top+Mt.fh*2,Mt,{ou:o.ou,gf:false});roofFlat16(p2,top+Mt.fh*2,R,{parapet:0xcfd6db,units:1,ph:0.5});cap16(offset16(p,-0.05),top+0.02,0x5f646a);ring16(p,0.05,0.2,top,top+1.0,0xcfd6db);}
    else{ring16(p,0.05,0.2,top,top+1.2,0xcfd6db);cap16(offset16(p,-0.1),top+0.05,0x5f646a);const c=[cx+ox,cz+oz];DECO.push(pp(cyl(0.12,0.3,9,8),c[0],top+5.5,c[1],0xb4b9bf));DECO.push(pp(sph(0.35,8,6),c[0],top+10.1,c[1],0xd94f4f));}
    foot16(p,true,{sub:true});
    return foot16(pPod,true,{fw:w-0.5,arch:'tower',top});
  },
  /* tour art déco : gradins successifs, pilastres, flèche */
  deco(cx,cz,w,d,h,o,R){
    const M=rpick16(R,famMats16('grid',5)),fh=M.fh,cor=[['c',1.6],['c',1.6],['c',1.6],['c',1.6]];
    let tw=w,td=d,yb=A16.y0,first=null,lvl=0;const total=h;
    while(lvl<4&&tw>=7&&td>=7){
      const S=shape16(tw,td,lvl?cor:null),p=tr16(S.pts,cx,cz),nf=lvl===0?Math.max(3,Math.round(total*0.45/fh)):Math.max(2,Math.round(total*(0.22-lvl*0.04)/fh));
      const yt=(lvl===0?A16.y0+GF:yb)+nf*fh;
      volume16(p,S.sharp,yb,yt,M,{ou:o.ou});
      if(lvl===0){base16(p,M,{plinth:0x5b5852,bandC:shade(M.col,0.8)});first=p;}
      ring16(p,0.25,0.3,yt-0.35,yt,shade(M.col,1.1));
      cap16(offset16(p,-0.05),yt+0.01,0x6d7177);
      /* pilastres */
      edges16(p).forEach(e=>{if(e.len<6)return;const k=Math.round(e.len/4);for(let i=1;i<k;i+=lvl?1:2)along16(e,i*e.len/k,0.12,(yb+(lvl?0:GF)+yt)/2+(lvl?0:A16.y0),0.45,yt-yb-(lvl?0.4:GF+0.4),0.24,shade(M.col,1.12));});
      if(lvl)foot16(p,true,{sub:true});
      yb=yt;tw-=4.2;td-=4.2;lvl++;
    }
    DECO.push(pp(cyl(0.05,0.6,6,8),cx,yb+3,cz,0xd9cfa8));DECO.push(pp(UBX,cx,yb+0.4,cz,shade(M.col,1.1),2.2,0.8,2.2));
    return foot16(first,true,{fw:w-0.5,arch:'deco',top:yb});
  },
  /* pavillon / petit immeuble : volets, toit à croupes ou pignon, cheminées */
  house(cx,cz,w,d,h,o,R){
    const M=rpick16(R,famMats16('shutter',8)),fh=M.fh,n=clamp(Math.round((h-GF)/fh),1,6),top=A16.y0+GF+n*fh;
    const p=tr16(polyR16(w,d),cx,cz);
    addWalls16(M.wall,walls16(p,[1,1,1,1],A16.y0,top,A16.y0+GF-fh,8*fh,false,o.ou||0));
    prism16(offset16(p,0.06),A16.y0,A16.y0+0.5,shade(M.col,0.7));A16.foot.push(p);
    if(n>=2)prism16(offset16(p,0.08),A16.y0+GF-0.15,A16.y0+GF+0.05,shade(M.col,1.1));
    /* balcons ou jardinières en façade */
    const E=edges16(p);
    if(n>=2&&R()<0.6){const e=E[2],f=1+Math.floor(R()*(n-1));const y=A16.y0+GF+(f-1)*fh+0.05;const b=Math.round(e.len/4);for(let k=0;k<b;k++)if(R()<0.6)balcony16(e,y,0.8,0xd8d0c0,k*e.len/b+0.6,(k+1)*e.len/b-0.6);}
    /* chaînages d'angle clairs */
    p.forEach(v=>{const sx=Math.sign(v[0]-cx),sz=Math.sign(v[1]-cz);DECO.push(pp(UBX,v[0]+sx*0.02-sx*0.2,(A16.y0+top)/2,v[1]+sz*0.02-sz*0.2,shade(M.col,1.12),0.46,top-A16.y0-0.5,0.46));});
    const rk=o.roof||(R()<0.5?'hip':'gable'),ro={wc:shade(M.col,1.02),roofC:o.roofC};
    if(rk==='hip')roofHip16(p,w,d,top,R,ro);else{prism16(offset16(p,0.1),top-0.22,top,shade(M.col,1.08));roofGable16(cx,cz,w,d,top,R,ro);}
    return foot16(p,true,{fw:w-1,arch:'house',top:top+Math.min(w,d)*0.35,gfHouse:true});
  },
  /* entrepôt : tôle, sheds ou voûte, quai de chargement */
  warehouse(cx,cz,w,d,h,o,R){
    const M=rpick16(R,famMats16('indus',6)),top=A16.y0+clamp(h,8,12);
    const p=tr16(polyR16(w,d),cx,cz);
    volume16(p,[1,1,1,1],A16.y0,top,M,{ou:o.ou});
    prism16(offset16(p,0.06),A16.y0,A16.y0+0.6,0x7a7c7e);A16.foot.push(p);
    const rk=R();if(rk<0.45)roofSaw16(cx,cz,w,d,top,R,{wc:M.col});else if(rk<0.8)roofBarrel16(cx,cz,w,d,top,R,{wc:M.col});else roofFlat16(p,top,R,{parapet:shade(M.col,0.9),units:2,ph:0.6});
    /* auvent de quai sur la façade */
    DECO.push(pp(UBX,cx,A16.y0+GF+0.6,cz+d/2+1.2,0x5f666d,w*0.8,0.12,2.4,-0.12,0,0));
    for(let k=-1;k<=1;k+=2)DECO.push(pp(UBX,cx+k*w*0.38,A16.y0+GF+0.15,cz+d/2+1.1,0x3a3f47,0.08,0.08,2.2,0.5,0,0));
    return foot16(p,true,{fw:w-0.5,arch:'warehouse',top});
  }
};

/* ----- remplacement des générateurs ----- */
const _lotBuilding16=lotBuilding,_addBuilding16=addBuilding;
let seed16=1;
lotBuilding=function(cx,cz,w,d,h){
  const D=distAt(cx,cz),R=srand16(++seed16*7919+Math.floor(Math.random()*1e6));
  const bx=Math.round(cx/64)*64,bz=Math.round(cz/64)*64,sx=Math.sign(cx-bx)||1,sz=Math.sign(cz-bz)||1;
  /* coin extérieur du lot (vers le carrefour) : 0 -x-z, 1 +x-z, 2 +x+z, 3 -x+z */
  const corner=sx<0?(sz<0?0:3):(sz<0?1:2);
  const ou=Math.floor(R()*4)/4;
  const one=(arch,x,ww,hh,opt)=>ARCH16[arch](x,cz,ww,d,hh,Object.assign({ou:Math.floor(R()*4)/4},opt||{}),R);
  /* découpe en parcelles mitoyennes */
  const split=(arches,k,hb,hv,opt)=>{
    const parts=[];let left=w;for(let i=0;i<k;i++){const r=i===k-1?left:Math.max(6,Math.round(w/k+(R()-0.5)*3));parts.push(r);left-=r;}
    if(left!==0)parts[parts.length-1]+=left;
    let x=cx-w/2;
    parts.forEach((pw,i)=>{const isC=(sx<0&&i===0)||(sx>0&&i===k-1);one(rpick16(R,arches),x+pw/2,pw,hb+(R()-0.5)*hv,Object.assign({corner:isC?corner:null},opt||{}));x+=pw;});
  };
  if(D.id==='hauts'){
    if(h<=20){if(R()<0.65)split(['house'],w>=17?3:2,rand(7,11.5),4);else one('house',cx,w,Math.min(h,14),{});}
    else if(R()<0.5)one('hauss',cx,w,Math.min(h,22),{corner});else one('house',cx,w,clamp(h,14,22),{roof:'hip'});
  }else if(D.id==='port'){
    const r=R();
    if(h<=20&&r<0.42)one('warehouse',cx,w,h,{});
    else if(h<=20&&r<0.75)split(['house'],w>=16?3:2,rand(7,12),5,{roof:'gable'});
    else one(R()<0.7?'brick':'ribbon',cx,w,h,{corner});
  }else{
    if(h>30){const r=R();one(r<0.5?'tower':r<0.78?'deco':'ribbon',cx,w,h,{corner});}
    else{const r=R();
      if(r<0.3&&w>=15)split(['hauss','hauss','brick'],2,h,8,{});
      else one(r<0.65?'hauss':r<0.82?'brick':'ribbon',cx,w,h,{corner});}
  }
};
/* bâtiments repères (Pôle Emploi, banque…) : on garde leur dessin, avec soubassement, corniche et acrotère */
addBuilding=function(cx,cz,w,d,h,mi,o){
  const r=_addBuilding16(cx,cz,w,d,h,mi,o);
  const S=STY[mi%STY.length],wc=hexOf(S.c),hh=Math.max(8,Math.round(h/4)*4),p=tr16(polyR16(w,d),cx,cz);
  prism16(offset16(p,0.08),A16.y0,A16.y0+0.42,shade(wc,0.62));
  if(!(o&&o.roof==='gable'))ring16(p,0.3,0.25,A16.y0+hh-0.35,A16.y0+hh+0.05,shade(wc,1.1));
  A16.foot.push(p);
  return r;
};

/* ----- enseignes : caisson avec épaisseur, plus de stickers collés ----- */
const _addSign16=addSign;
addSign=function(text,cx,frontZ,y,w,h,bg,fg){
  dbox(cx,y,frontZ+0.11,w+0.24,h+0.2,0.2,shade(hexOf(bg),0.55));
  _addSign16(text,cx,frontZ+0.14,y,w,h,bg,fg);
  dbox(cx,y+h/2+0.16,frontZ+0.3,w*0.9,0.06,0.18,0x2e3338);
};
/* ----- devantures : stores bannes rayés, portes avec encadrement et marche, appliques ----- */
function awningGeo16(){
  const a=[],uv=[],q=(P,U)=>{[0,1,2,0,2,3].forEach(k=>{a.push(...P[k]);uv.push(...U[k]);});};
  q([[-0.5,0,0],[0.5,0,0],[0.5,-0.55,1.5],[-0.5,-0.55,1.5]],[[0,1],[1,1],[1,0.3],[0,0.3]]);
  q([[-0.5,-0.55,1.5],[0.5,-0.55,1.5],[0.5,-0.85,1.52],[-0.5,-0.85,1.52]],[[0,0.3],[1,0.3],[1,0],[0,0]]);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
buildFronts=function(){
  const bl=boxes.filter(b=>b.big&&!b.sub&&b.x0>-200&&b.x1<200&&b.z1<200&&b.z0>-200),aw=[],dr=[],fr=[],st=[],lp=[];
  const tc=document.createElement('canvas');tc.width=128;tc.height=32;const g=tc.getContext('2d');
  for(let i=0;i<16;i++){g.fillStyle=i%2?'#ffffff':'#d9d4c8';g.fillRect(i*8,0,8,32);}
  g.fillStyle='rgba(0,0,0,0.18)';g.fillRect(0,0,128,3);
  for(let i=0;i<16;i++){g.fillStyle=i%2?'#ffffff':'#d9d4c8';g.beginPath();g.arc(i*8+4,30,4,0,Math.PI);g.fill();}
  const tex=new THREE.CanvasTexture(tc);tex.wrapS=THREE.RepeatWrapping;tex.repeat.set(1.5,1);
  const awMat=aoPatch16(new THREE.MeshLambertMaterial({map:tex,side:THREE.DoubleSide}),1,1);
  const AWC=[0xc0392b,0x2e6fd1,0x2e9a6a,0xe0a526,0x7b4bb3,0x2f4a3a,0x7a2f3a,0x22324a];
  bl.forEach(b=>{
    const w=b.x1-b.x0,cx=(b.x0+b.x1)/2,fw=b.fw||w;
    if(w<6||(b.z1-b.z0)<6)return;
    const special=spots.some(s=>Math.hypot(s.x-cx,s.z-b.z1)<9),house=b.gfHouse||b.arch==='warehouse';
    const dx=cx+(special?4.5:0)+(house&&!special?(Math.random()<0.5?-1:1)*Math.min(3,w/4):0);
    if(!house&&b.arch!=='tower'&&Math.random()<0.85){const aw_=Math.min(9,fw*0.62,w-1.5);if(aw_>2.5)aw.push({x:cx,z:b.z1+0.02,w:aw_,c:pick(AWC)});}
    dr.push({x:dx,y:1.28+0.16,z:b.z1+0.05,sx:1.5,sy:2.5,sz:0.1,c:0x2a2f36});
    fr.push({x:dx,y:1.38+0.16,z:b.z1+0.06,sx:1.9,sy:2.8,sz:0.12,c:b.arch==='brick'?0xe0d6c3:b.arch==='house'?0xf2ede2:0x3a3f47});
    st.push({x:dx,y:0.22,z:b.z1+0.35,sx:2.1,sy:0.12,sz:0.6,c:0x9a9890});
    lp.push({x:dx+1.3,y:3.0,z:b.z1+0.14,sx:0.18,sy:0.32,sz:0.18,c:0xffe2a8});lp.push({x:dx-1.3,y:3.0,z:b.z1+0.14,sx:0.18,sy:0.32,sz:0.18,c:0xffe2a8});
    if(!special&&!house&&Math.random()<0.5){
      const D=distAt(cx,b.z1);
      addSign(pick(D.shops),cx,b.z1,4.9,Math.min(9,fw*0.6,w-1.5),1.3,pick(['#2b3445','#5a2d2d','#2d4a3a','#4a3d5a','#1f2226','#6b4a2a']),'#ffffff');
    }else if(!special&&!house&&Math.random()<0.6){ /* enseigne drapeau perpendiculaire */
      const D=distAt(cx,b.z1),ex=b.x1-1.2;
      dbox(ex,5.3,b.z1+0.55,0.08,0.08,1.1,0x2e3338);
      const c=document.createElement('canvas');c.width=128;c.height=128;const q=c.getContext('2d');q.fillStyle=pick(['#2b3445','#7a2f3a','#2f4a3a','#e0a526']);q.fillRect(0,0,128,128);q.strokeStyle='#f4efe4';q.lineWidth=6;q.strokeRect(6,6,116,116);q.fillStyle='#fff';q.font='700 30px Rajdhani, Arial Narrow, sans-serif';q.textAlign='center';q.textBaseline='middle';
      const t=pick(D.shops).split(' ');t.slice(0,2).forEach((s,i,arr)=>q.fillText(s.slice(0,9),64,64+(i-(arr.length-1)/2)*32));
      const m=new THREE.Mesh(new THREE.BoxGeometry(0.1,1.1,1.1),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c)}));m.position.set(ex,4.6,b.z1+0.7);m.castShadow=true;scene.add(m);
    }
  });
  if(aw.length){
    const im=new THREE.InstancedMesh(awningGeo16(),awMat,aw.length);
    aw.forEach((a,i)=>{dummy.position.set(a.x,3.9,a.z);dummy.rotation.set(0,0,0);dummy.scale.set(a.w,1,1);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);im.setColorAt(i,_ic.setHex(a.c));});
    im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;im.castShadow=true;im.receiveShadow=true;scene.add(im);
    aw.forEach(a=>{[-1,1].forEach(s=>DECO.push(pp(UBX,a.x+s*(a.w/2-0.1),3.62,a.z+0.75,0x2e3338,0.05,0.05,1.55,0.35,0,0)));});
  }
  inst(lamb(0xffffff),fr);inst(lamb(0xffffff),dr);inst(lamb(0xffffff),st);
  const lm=new THREE.MeshBasicMaterial({color:0xffe2a8});A16.sconce=lm;inst(lm,lp);
  /* commerces visitables (inchangé) */
  const COM=[[2,0,-1,'cafe','CAFÉ AURORE','#6b3f2a',0xc9a26b,'Café Aurore'],[-2,0,1,'boutique','BOUTIQUE MODE','#7b4bb3',0xc79bff,'Boutique Mode'],[0,1,-1,'pharma','PHARMACIE','#1f7a4d',0x58d68d,'Pharmacie']];
  COM.forEach(([i,j,a,id,txt,bg,col,label])=>{
    const cx=i*BLOCK+a*11,cz=j*BLOCK+11,b=bl.find(q=>Math.abs((q.x0+q.x1)/2-cx)<1.5&&Math.abs((q.z0+q.z1)/2-cz)<1.5)||bl.find(q=>cx>q.x0&&cx<q.x1&&Math.abs((q.z0+q.z1)/2-cz)<2.5)||bl.filter(q=>q.z1>j*BLOCK+5&&Math.abs((q.x0+q.x1)/2-cx)<9).sort((p,q)=>Math.abs((p.x0+p.x1)/2-cx)-Math.abs((q.x0+q.x1)/2-cx))[0];
    if(!b)return;
    addSign(txt,(b.x0+b.x1)/2,b.z1,5.8,Math.min(9,b.x1-b.x0-1),1.8,bg,'#ffffff');
    addSpot((b.x0+b.x1)/2,b.z1+2.3,id,col,label);spots[spots.length-1].door=true;
  });
};

/* ----- ombres de contact & occlusion au sol ----- */
function blobTex16(soft){
  const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(0,0,0,'+(soft?0.55:0.7)+')');gr.addColorStop(0.5,'rgba(0,0,0,'+(soft?0.3:0.42)+')');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(c);
}
function edgeTex16(){
  const c=document.createElement('canvas');c.width=4;c.height=64;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,64);
  gr.addColorStop(0,'rgba(0,0,0,0.5)');gr.addColorStop(0.35,'rgba(0,0,0,0.22)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,4,64);
  return new THREE.CanvasTexture(c);
}
const onBlock16=(x,z)=>Math.abs(x-Math.round(x/64)*64)<25.2&&Math.abs(z-Math.round(z/64)*64)<25.2;
function blobMat16(t){return new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,fog:true});}
function buildGrounding16(){
  /* bande d'occlusion au pied des immeubles */
  const pos=[],uv=[],W=1.7;
  A16.foot.forEach(p=>{const O=offset16(p,W),E=edges16(p);
    E.forEach((e,i)=>{const j=(i+1)%p.length,a=p[i],b=p[j],c=O[j],d=O[i],y=0.181;
      const s=area16(p)>0;const tri=s?[[a,0],[c,1],[b,0],[a,0],[d,1],[c,1]]:[[a,0],[b,0],[c,1],[a,0],[c,1],[d,1]];
      tri.forEach(([v,t])=>{pos.push(v[0],y,v[1]);uv.push(0.5,1-t);});});});
  if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    const m=new THREE.Mesh(g,blobMat16(edgeTex16()));m.renderOrder=1;scene.add(m);}
  /* ombres de contact statiques : arbres, lampadaires, mobilier */
  const L=A16.blobs,tex=blobTex16(true);
  if(L.length){const geo=new THREE.PlaneGeometry(1,1);geo.rotateX(-Math.PI/2);const im=new THREE.InstancedMesh(geo,blobMat16(tex),L.length);
    L.forEach((b,i)=>{dummy.position.set(b.x,onBlock16(b.x,b.z)?0.183:0.03,b.z);dummy.rotation.set(0,b.ry||0,0);dummy.scale.set(b.sx,1,b.sz);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);});
    im.instanceMatrix.needsUpdate=true;im.renderOrder=1;scene.add(im);}
  /* ombres dynamiques : voitures, passants, joueur */
  const geo=new THREE.PlaneGeometry(1,1);geo.rotateX(-Math.PI/2);
  A16.dyn=new THREE.InstancedMesh(geo,blobMat16(blobTex16(false)),400);A16.dyn.count=0;A16.dyn.frustumCulled=false;A16.dyn.renderOrder=1;scene.add(A16.dyn);
  /* garde-corps en fer forgé */
  if(A16.rails.length){
    const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d');g.fillStyle='#22262a';
    g.fillRect(0,0,128,5);g.fillRect(0,58,128,4);for(let x=2;x<128;x+=8)g.fillRect(x,5,2,53);
    g.strokeStyle='#22262a';g.lineWidth=2;for(let x=0;x<128;x+=32){g.beginPath();g.arc(x+16,22,9,0,Math.PI*2);g.stroke();g.beginPath();g.moveTo(x,58);g.quadraticCurveTo(x+16,34,x+32,58);g.stroke();}
    const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;
    const m=aoPatch16(new THREE.MeshLambertMaterial({map:t,alphaTest:0.5,side:THREE.DoubleSide,transparent:false}),1,1);
    const geoR=new THREE.PlaneGeometry(1,1.0);const im=new THREE.InstancedMesh(geoR,m,A16.rails.length);
    /* l'alpha vient du canevas : fond transparent */
    A16.rails.forEach((r,i)=>{dummy.position.set(r.x,r.y,r.z);dummy.rotation.set(0,r.ry,0);dummy.scale.set(r.w,1,1);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);});
    im.instanceMatrix.needsUpdate=true;im.castShadow=true;scene.add(im);
  }
}
function updateGrounding16(){
  const D=A16.dyn;if(!D)return;let n=0;const cam=camera.position;
  const put=(x,z,sx,sz,ry)=>{if(n>=400)return;dummy.position.set(x,onBlock16(x,z)?0.186:0.035,z);dummy.rotation.set(0,ry,0);dummy.scale.set(sx,1,sz);dummy.updateMatrix();D.setMatrixAt(n++,dummy.matrix);};
  for(let i=0;i<cars.length;i++){const c=cars[i],m=c.mesh;if(!m||!m.visible||m.parent!==scene)continue;if(Math.abs(c.x-cam.x)>140||Math.abs(c.z-cam.z)>140)continue;
    if(!c._bb16){const bb=new THREE.Box3(),r=m.rotation.y;m.rotation.y=0;m.updateMatrixWorld(true);bb.setFromObject(m);m.rotation.y=r;m.updateMatrixWorld(true);c._bb16=[clamp(bb.max.x-bb.min.x,1.4,4)+0.7,clamp(bb.max.z-bb.min.z,2.5,14)+0.9];}
    put(m.position.x,m.position.z,c._bb16[0],c._bb16[1],m.rotation.y);}
  for(let i=0;i<peds.length;i++){const p=peds[i];if(!p.mesh.visible)continue;put(p.mesh.position.x,p.mesh.position.z,1.15,1.15,0);}
  if(player.mesh&&player.mesh.visible&&!player.car&&!player.inside)put(player.mesh.position.x,player.mesh.position.z,1.2,1.2,0);
  D.count=n;D.instanceMatrix.needsUpdate=true;
}
/* collecte des objets posés au sol */
const _plantTrees16=plantTrees;plantTrees=function(list){
  list.concat(EXTRA_TREES).forEach(t=>{const s=(t.s||1)*(t.park?1.25:1);A16.blobs.push({x:t.x,z:t.z,sx:3.6*s,sz:3.6*s});A16.blobs.push({x:t.x,z:t.z,sx:1.1,sz:1.1});});
  return _plantTrees16(list);
};
const _buildLamps16=buildLamps;buildLamps=function(l){l.forEach(p=>A16.blobs.push({x:p.x,z:p.z,sx:0.9,sz:0.9}));return _buildLamps16(l);};
const _addFurn16=addFurn;addFurn=function(k,x,z,ry,noBox){const d=PK&&PK[k];if(d){const sw=Math.abs(Math.sin(ry||0))>0.5;A16.blobs.push({x,z,sx:(sw?d[2]:d[0])+0.6,sz:(sw?d[0]:d[2])+0.6});}return _addFurn16(k,x,z,ry,noBox);};

/* ----- assemblage final ----- */
function mergeBatch16(list){
  let n=0;list.forEach(w=>n+=w.pos.length);
  const P=new Float32Array(n),N=new Float32Array(n),U=new Float32Array(n/3*2);let o=0,ou=0;
  list.forEach(w=>{P.set(w.pos,o);N.set(w.nor,o);U.set(w.uv,ou);o+=w.pos.length;ou+=w.uv.length;});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setAttribute('uv',new THREE.BufferAttribute(U,2));
  g.computeBoundingSphere();return g;
}
function flush16(){
  A16.batch.forEach((list,mat)=>{if(!list.length)return;const m=new THREE.Mesh(mergeBatch16(list),mat);m.castShadow=true;m.receiveShadow=true;scene.add(m);list.length=0;});
}
const _buildDecor16=buildDecor;buildDecor=function(){
  flush16();
  aoPatch16(decoMat,0.66,1.3);aoPatch16(vcLamb,0.7,1.2);
  _buildDecor16();
  buildGrounding16();
};
/* ----- lumière et atmosphère ----- */
C_DAY.setHex(0xb7d3e6);T_DAY.setHex(0x4f86c4);C_DAWN.setHex(0xe9a27a);SUNW.setHex(0xfff0d8);
const _buildWorld16=buildWorld;buildWorld=function(){
  _buildWorld16();
  renderer.toneMappingExposure=1.08;
  if(scene.fog){scene.fog.near=70;scene.fog.far=330;}
  hemi.groundColor.setHex(0x6b5f52);
  sun.shadow.bias=-0.00035;sun.shadow.normalBias=0.06;
  const sc=sun.shadow.camera;sc.left=-75;sc.right=75;sc.top=75;sc.bottom=-75;sc.updateProjectionMatrix();
};
const _updateDecor16=updateDecor;updateDecor=function(dt){
  _updateDecor16(dt);updateGrounding16();
  if(A16.sconce){const h=(gameMin/60)%24,s=Math.sin((h-6)/12*Math.PI),n=s>0?1-clamp(s*1.4,0,1):1,on=n>0.35&&!(blackout>0);A16.sconce.color.setRGB(on?1:0.55,on?0.88:0.53,on?0.62:0.5);}
};
