'use strict';
/* ---------- utilitaires 3D ---------- */
const lamb=c=>new THREE.MeshLambertMaterial({color:c});
/* styles de façade : enduit, brique, verre, tôle */
const STY=[
  {c:'#c9bfae',k:'plaster'},{c:'#9fb0bf',k:'plaster'},{c:'#a5583f',k:'brick'},{c:'#c3a07e',k:'plaster'},{c:'#a9b89c',k:'plaster'},{c:'#7d4a3a',k:'brick'},
  {c:'#36506b',k:'glass'},{c:'#3f6470',k:'glass'},{c:'#8a949c',k:'metal'},{c:'#b98a5a',k:'metal'},
  {c:'#e6eaec',k:'plaster'},{c:'#2a2238',k:'plaster'},{c:'#d4cab6',k:'stone'},{c:'#d8b8a0',k:'plaster'},{c:'#6f7f8f',k:'metal'}
];
const shopMats=[];
function wallBase(g,S,W,H){
  g.fillStyle=S.c;g.fillRect(0,0,W,H);
  if(S.k==='brick'){
    for(let y=0;y<H;y+=8){const off=(y/8)%2?8:0;
      for(let x=-16;x<W;x+=16){const v=Math.random();g.fillStyle=v<0.5?'rgba(0,0,0,'+(v*0.16)+')':'rgba(255,255,255,'+((v-0.5)*0.12)+')';g.fillRect(x+off,y,15,7);}
      g.fillStyle='rgba(40,25,20,0.35)';g.fillRect(0,y+7,W,1);
      for(let x=-16;x<W;x+=16){g.fillRect(x+off+15,y,1,7);}
    }
  }else if(S.k==='metal'){
    for(let x=0;x<W;x+=8){const gr=g.createLinearGradient(x,0,x+8,0);gr.addColorStop(0,'rgba(255,255,255,0.16)');gr.addColorStop(0.5,'rgba(0,0,0,0.05)');gr.addColorStop(1,'rgba(0,0,0,0.22)');g.fillStyle=gr;g.fillRect(x,0,8,H);}
  }else if(S.k==='stone'){
    for(let y=0;y<H;y+=16){g.fillStyle='rgba(0,0,0,0.12)';g.fillRect(0,y,W,1);for(let x=(y/16)%2?0:24;x<W;x+=48)g.fillRect(x,y,1,16);}
    for(let i=0;i<1400;i++){g.fillStyle='rgba(0,0,0,'+(Math.random()*0.06)+')';g.fillRect(Math.random()*W,Math.random()*H,2,2);}
  }else{
    for(let i=0;i<2200;i++){const v=Math.random();g.fillStyle=v<0.5?'rgba(0,0,0,'+(v*0.1)+')':'rgba(255,255,255,'+((v-0.5)*0.1)+')';g.fillRect(Math.random()*W,Math.random()*H,2,2);}
    for(let y=0;y<H;y+=64){g.fillStyle='rgba(0,0,0,0.05)';g.fillRect(0,y+40,W,24);}
  }
}
const LITC=['#ffd48a','#ffc56b','#ffe2b0','#ffd9a0','#cfe3ff','#ffcf7a'];
function winTex(S,lit,emissive){
  if(typeof S==='string')S={c:S,k:'plaster'};
  const c=document.createElement('canvas');c.width=256;c.height=512;const g=c.getContext('2d');
  if(emissive){g.fillStyle='#000';g.fillRect(0,0,256,512);}else wallBase(g,S,256,512);
  if(S.k==='glass'){
    for(let r=0;r<8;r++)for(let k=0;k<4;k++){
      const x=k*64,y=r*64,on=lit[r*4+k];
      if(emissive){if(on){g.fillStyle=pick(['#e4ecff','#fff1d0','#d6e6ff']);g.fillRect(x,y,64,48);}}
      else{const gr=g.createLinearGradient(x,y,x+40,y+48);gr.addColorStop(0,'#a9c4d8');gr.addColorStop(0.45,on?'#5f7f99':'#4b6680');gr.addColorStop(1,S.c);g.fillStyle=gr;g.fillRect(x,y,64,48);
        if(Math.random()<0.25){g.fillStyle='rgba(255,255,255,0.12)';g.beginPath();g.moveTo(x+10,y);g.lineTo(x+26,y);g.lineTo(x+6,y+48);g.lineTo(x-10,y+48);g.fill();}}
      g.fillStyle=emissive?'#000':'rgba(20,28,36,0.85)';g.fillRect(x,y+48,64,16);
      g.fillStyle=emissive?'#000':'#c7d0d8';g.fillRect(x,y,2,64);g.fillRect(x+32,y,1,48);g.fillRect(x,y+47,64,2);
    }
  }else if(S.k==='metal'){
    for(let k=0;k<8;k++){const x=k*32+6,y=6*64+18,on=lit[k];
      if(emissive){if(on){g.fillStyle='#ffcf7a';g.fillRect(x,y,20,10);}}
      else{g.fillStyle='#2f3d4a';g.fillRect(x,y,20,10);g.fillStyle='rgba(255,255,255,0.25)';g.fillRect(x,y,20,2);}
    }
    if(!emissive){g.fillStyle='rgba(0,0,0,0.25)';for(let r=0;r<8;r++)g.fillRect(0,r*64+62,256,2);}
  }else{
    const frame=S.k==='brick'?'#e8e2d6':S.k==='stone'?'#f0eadc':'rgba(255,255,255,0.55)';
    for(let r=0;r<8;r++)for(let k=0;k<4;k++){
      const x=k*64+12,y=r*64+12,on=lit[r*4+k],cur=Math.random(),cc=pick(['#d9c7a3','#c98b7a','#8fa6c2','#e8e0d0','#a3b58f']);
      if(emissive){
        if(on){g.fillStyle=pick(LITC);g.fillRect(x,y,40,40);
          if(cur<0.35){g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(x,y,11,40);g.fillRect(x+29,y,11,40);}
          else if(cur<0.5){g.fillStyle='rgba(0,0,0,0.25)';for(let b=0;b<6;b++)g.fillRect(x,y+b*5,40,2);}
          g.fillStyle='#000';g.fillRect(x+19,y,2,40);g.fillRect(x,y+14,40,2);}
        continue;
      }
      if(S.k==='brick'){g.fillStyle='rgba(60,40,30,0.55)';g.fillRect(x-4,y-8,48,6);}
      g.fillStyle=frame;g.fillRect(x-3,y-3,46,46);
      const gr=g.createLinearGradient(x,y,x,y+40);gr.addColorStop(0,on?'#a8bfd2':'#9db4c7');gr.addColorStop(0.5,on?'#647f99':'#3f566c');gr.addColorStop(1,on?'#4a6178':'#2a3a4a');
      g.fillStyle=gr;g.fillRect(x,y,40,40);
      if(cur<0.3){g.fillStyle=cc;g.fillRect(x,y,10,40);g.fillRect(x+30,y,10,40);g.fillStyle='rgba(0,0,0,0.15)';g.fillRect(x+9,y,1,40);g.fillRect(x+30,y,1,40);}
      else if(cur<0.45){g.fillStyle='rgba(235,230,215,0.85)';g.fillRect(x,y,40,18);g.fillStyle='rgba(0,0,0,0.12)';for(let b=0;b<6;b++)g.fillRect(x,y+b*3,40,1);}
      else if(cur<0.55){g.fillStyle='rgba(60,90,50,0.9)';g.fillRect(x+4,y+30,32,10);g.fillStyle='#d94f4f';g.fillRect(x+8,y+29,4,4);g.fillStyle='#e0b34a';g.fillRect(x+22,y+28,4,4);}
      g.fillStyle=frame;g.fillRect(x+19,y,2,40);g.fillRect(x,y+14,40,2);
      g.fillStyle='rgba(255,255,255,0.18)';g.fillRect(x+2,y+2,16,3);
      g.fillStyle=S.k==='brick'?'#e8e2d6':'rgba(255,255,255,0.7)';g.fillRect(x-6,y+42,52,4);g.fillStyle='rgba(0,0,0,0.25)';g.fillRect(x-6,y+46,52,3);
    }
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
}
/* rez-de-chaussée : vitrines (ou portes roulantes pour les entrepôts) */
function shopTex(S,emissive){
  const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');
  if(emissive){g.fillStyle='#000';g.fillRect(0,0,256,64);}else wallBase(g,S,256,64);
  for(let k=0;k<4;k++){
    const x=k*64;
    if(S.k==='metal'){
      if(emissive){if(k%3===0){g.fillStyle='#ffcf7a';g.fillRect(x+44,22,12,10);}continue;}
      g.fillStyle='#8c9399';g.fillRect(x+6,10,40,54);g.fillStyle='rgba(0,0,0,0.22)';for(let y=12;y<64;y+=4)g.fillRect(x+6,y,40,1);
      g.fillStyle='#e0b400';g.fillRect(x+4,8,2,56);g.fillRect(x+46,8,2,56);
      g.fillStyle='#2f3d4a';g.fillRect(x+44,22,12,10);
      continue;
    }
    if(emissive){g.fillStyle=pick(['#ffcf7a','#ffe0a8','#fff0d0']);g.fillRect(x+6,18,52,44);g.fillStyle='rgba(0,0,0,0.5)';for(let i=0;i<3;i++)g.fillRect(x+10+i*16,42,10,20);g.fillStyle='#000';g.fillRect(x+31,18,2,44);continue;}
    g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(0,0,256,12);g.fillStyle='rgba(255,255,255,0.12)';g.fillRect(0,12,256,2);
    g.fillStyle='#1d2329';g.fillRect(x+4,16,56,48);
    const gr=g.createLinearGradient(x,18,x+30,62);gr.addColorStop(0,'#6f8aa3');gr.addColorStop(0.5,'#33475a');gr.addColorStop(1,'#26333f');g.fillStyle=gr;g.fillRect(x+6,18,52,44);
    const AW=['#b5382f','#2f6db5','#3b8f56','#d19a2e','#7a4aa8','#e8e2d6'];
    for(let i=0;i<3;i++){g.fillStyle=pick(AW);g.globalAlpha=0.55;g.fillRect(x+10+i*16,44+Math.random()*6,10,18);g.globalAlpha=1;}
    g.fillStyle='rgba(255,255,255,0.16)';g.beginPath();g.moveTo(x+14,18);g.lineTo(x+24,18);g.lineTo(x+12,62);g.lineTo(x+2+4,62);g.fill();
    g.fillStyle='#1d2329';g.fillRect(x+31,18,2,44);
    g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(x,62,64,2);
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
}
function makeWallMats(){
  STY.forEach(S=>{
    const lit=[];for(let i=0;i<32;i++)lit.push(Math.random()<0.42);
    const o={map:winTex(S,lit,false),emissiveMap:winTex(S,lit,true),emissive:new THREE.Color(0xffd89a),emissiveIntensity:0};
    wallMats.push(S.k==='glass'?new THREE.MeshPhongMaterial(Object.assign(o,{specular:0x5a6878,shininess:70})):new THREE.MeshLambertMaterial(o));
    shopMats.push(new THREE.MeshLambertMaterial({map:shopTex(S,false),emissiveMap:shopTex(S,true),emissive:new THREE.Color(0xffd89a),emissiveIntensity:0}));
  });
}
function noiseTex(base,amp,rep){
  const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
  g.fillStyle=base;g.fillRect(0,0,128,128);
  for(let i=0;i<900;i++){const v=Math.floor(rand(-amp,amp));g.fillStyle=v>0?'rgba(255,255,255,'+(v/90)+')':'rgba(0,0,0,'+(-v/90)+')';g.fillRect(Math.random()*128,Math.random()*128,2,2);}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=4;return t;
}
function tileTex(base){
  const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
  for(let a=0;a<2;a++)for(let b=0;b<2;b++){const v=Math.floor(rand(-10,10));g.fillStyle=base;g.fillRect(a*64,b*64,64,64);g.fillStyle=v>0?'rgba(255,255,255,'+(v/100)+')':'rgba(0,0,0,'+(-v/100)+')';g.fillRect(a*64,b*64,64,64);}
  g.fillStyle='rgba(0,0,0,0.28)';g.fillRect(0,0,128,2);g.fillRect(0,64,128,2);g.fillRect(0,0,2,128);g.fillRect(64,0,2,128);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6.25,6.25);t.anisotropy=4;return t;
}
function glowTex(stops){
  const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);
  stops.forEach(s=>gr.addColorStop(s[0],s[1]));g.fillStyle=gr;g.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(c);
}
function bGeo(w,h,d,y0,ground){
  const g=new THREE.BoxGeometry(w,h,d);g.translate(0,h/2+(y0||0),0);
  const uv=g.attributes.uv,ou=Math.floor(Math.random()*4)/4;
  for(let f=0;f<6;f++)for(let i=0;i<4;i++){
    const k=f*4+i;let u=uv.getX(k),v=uv.getY(k);
    if(f===2||f===3){u=0.01;v=0.01;}
    else if(f<2){u=u*d/16+ou;v=ground?v:v*h/32;}
    else{u=u*w/16+ou;v=ground?v:v*h/32;}
    uv.setXY(k,u,v);
  }
  uv.needsUpdate=true;g.userData.ou=ou;return g;
}
const DECO=[];const GF=4;
const UBX=new THREE.BoxGeometry(1,1,1);
function dbox(x,y,z,w,h,d,c,ry){DECO.push(pp(UBX,x,y,z,c,w,h,d,0,ry||0,0));}
function hexOf(css){return parseInt(css.slice(1),16);}
/* toit à deux pans */
function gableGeo(w,d,hr,ov){
  const along=w>=d,L=(along?w:d)/2+ov,Wd=(along?d:w)/2+ov,p=[];
  const V=(a,y,b)=>along?[a,y,b]:[b,y,a];
  const tri=(A,B,C)=>p.push(...A,...B,...C);
  const A1=V(-L,0,-Wd),A2=V(L,0,-Wd),B1=V(-L,0,Wd),B2=V(L,0,Wd),R1=V(-L,hr,0),R2=V(L,hr,0);
  if(along){tri(A1,R1,R2);tri(A1,R2,A2);tri(B1,B2,R2);tri(B1,R2,R1);}
  else{tri(A1,R2,R1);tri(A1,A2,R2);tri(B1,R1,R2);tri(B1,R2,B2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.computeVertexNormals();return g;
}
function gableEnds(w,d,hr){
  const along=w>=d,L=(along?w:d)/2,Wd=(along?d:w)/2,p=[];
  const V=(a,y,b)=>along?[a,y,b]:[b,y,a];
  [-1,1].forEach(s=>{const a=V(s*L,0,-Wd),b=V(s*L,0,Wd),r=V(s*L,hr,0);if(along===(s>0))p.push(...a,...r,...b);else p.push(...a,...b,...r);});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.computeVertexNormals();return g;
}
function addBuilding(cx,cz,w,d,h,mi,o){
  o=o||{};h=Math.max(8,Math.round(h/4)*4);
  const S=STY[mi%STY.length],wc=hexOf(S.c),dark=shade(wc,0.72),y0=0.16;
  const gm=new THREE.Mesh(bGeo(w,GF,d,0,true),shopMats[mi%shopMats.length]);gm.position.set(cx,y0,cz);gm.castShadow=true;gm.receiveShadow=true;scene.add(gm);
  let top=h,tw=w,td=d,body;
  const setback=o.setback!==false&&h>=32&&w>=14&&d>=14&&Math.random()<0.75;
  if(setback){
    const hp=Math.random()<0.5?12:16;
    body=new THREE.Mesh(bGeo(w,hp-GF,d,GF),wallMats[mi%wallMats.length]);body.position.set(cx,y0,cz);body.castShadow=body.receiveShadow=true;scene.add(body);
    roofs.push({x:cx,y:hp+y0,z:cz,w:w,d:d,units:false});
    tw=Math.round(w*0.72);td=Math.round(d*0.72);
    const tm=new THREE.Mesh(bGeo(tw,h-hp,td,hp),wallMats[(o.towerMi!=null?o.towerMi:mi)%wallMats.length]);tm.position.set(cx,y0,cz);tm.castShadow=tm.receiveShadow=true;scene.add(tm);
    if(h>44){dbox(cx,h+y0+3.5,cz,0.25,7,0.25,0x9ba1a8);dbox(cx,h+y0+7.2,cz,0.5,0.5,0.5,0xd94f4f);}
  }else{
    body=new THREE.Mesh(bGeo(w,h-GF,d,GF),wallMats[mi%wallMats.length]);body.position.set(cx,y0,cz);body.castShadow=body.receiveShadow=true;scene.add(body);
  }
  /* bandeau entre commerce et étages */
  dbox(cx,GF+y0,cz,w+0.36,0.32,d+0.36,S.k==='glass'?0x2a3440:dark);
  /* balcons */
  if(o.balcony&&S.k!=='glass'&&S.k!=='metal'){
    const ou=body.geometry.userData.ou,rc=shade(wc,1.12);
    [[1,0],[-1,Math.PI]].forEach(([sd,ry])=>{
      for(let fy=GF+4;fy<(setback?16:h)-1;fy+=4){
        for(let t=((2-ou*16)%4+4)%4;t<w;t+=8){
          if(t<1.5||t>w-1.5||Math.random()<0.25)continue;
          const lx=sd>0?cx-w/2+t:cx+w/2-t,z=cz+sd*(d/2+0.5);
          dbox(lx,fy+y0+0.55,z,2.8,0.16,1.0,0xbdb7ab);
          dbox(lx,fy+y0+1.05,z+sd*0.48,2.8,0.85,0.06,rc);
          dbox(lx-1.37,fy+y0+1.05,z,0.06,0.85,1.0,rc);dbox(lx+1.37,fy+y0+1.05,z,0.06,0.85,1.0,rc);
          dbox(lx,fy+y0+1.5,z+sd*0.5,2.9,0.06,0.1,0x3a3f47);
        }
      }
    });
  }
  /* toit */
  if(o.roof==='gable'&&!setback){
    const hr=Math.min(w,d)*0.32,rc=o.roofC||pick([0xa4492f,0x8a3d2b,0xb5603f,0x5f6b75]);
    DECO.push({g:gableGeo(w,d,hr,0.5),m:new THREE.Matrix4().makeTranslation(cx,h+y0,cz),c:rc});
    DECO.push({g:gableEnds(w,d,hr),m:new THREE.Matrix4().makeTranslation(cx,h+y0,cz),c:wc});
    if(Math.random()<0.6)dbox(cx+rand(-w/4,w/4),h+y0+hr*0.7,cz+rand(-1,1),0.7,hr*0.9,0.7,0x6b4a3a);
  }else{
    roofs.push({x:cx,y:h+y0,z:cz,w:tw,d:td});
    if(Math.random()<0.35&&tw>=10){const tx=cx+rand(-tw/2+2.5,tw/2-2.5),tz=cz+rand(-td/2+2.5,td/2-2.5),ry=h+y0+0.5;
      [[-0.7,-0.7],[0.7,-0.7],[-0.7,0.7],[0.7,0.7]].forEach(q=>dbox(tx+q[0],ry+1,tz+q[1],0.12,2,0.12,0x3a3f47));
      DECO.push(pp(cyl(1.1,1.1,2.2,12),tx,ry+3.1,tz,0x8a6a4a));DECO.push(pp(new THREE.ConeGeometry(1.15,0.7,12),tx,ry+4.55,tz,0x5a4636));}
    if(Math.random()<0.4){const ax=cx+rand(-tw/2+1,tw/2-1),az=cz+rand(-td/2+1,td/2-1);dbox(ax,h+y0+2.5,az,0.08,4,0.08,0x9ba1a8);dbox(ax,h+y0+3.6,az,1.2,0.05,0.05,0x9ba1a8);}
    if(Math.random()<0.5){dbox(cx+rand(-tw/2+2,tw/2-2),h+y0+1.2,cz+rand(-td/2+2,td/2-2),2.2,1.6,2.2,shade(wc,0.9));}
  }
  boxes.push({x0:cx-w/2,x1:cx+w/2,z0:cz-d/2,z1:cz+d/2,big:true});
  return body;
}
function addSign(text,cx,frontZ,y,w,h,bg,fg){
  const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);const g=c.getContext('2d');
  g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);g.fillStyle=fg;
  g.font='700 '+Math.round(c.height*0.58)+'px Rajdhani, Arial Narrow, sans-serif';
  g.textAlign='center';g.textBaseline='middle';g.fillText(text,c.width/2,c.height/2+3);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}));
  m.position.set(cx,y,frontZ+0.08);scene.add(m);
}
function addSpot(x,z,id,color,label){
  const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.3,depthWrite:false,fog:false,side:THREE.DoubleSide});
  const b=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,8,24,1,true),mat);b.position.set(x,4.2,z);scene.add(b);
  const ring=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.7,0.1,28),new THREE.MeshBasicMaterial({color,fog:false}));ring.position.set(x,0.22,z);scene.add(ring);
  spots.push({x,z,id,color,label,b,ring});
}
function makeBubble(text){
  const words=text.split(' '),lines=[];let cur='';
  words.forEach(w=>{if((cur+' '+w).trim().length>24){lines.push(cur.trim());cur=w;}else cur+=' '+w;});
  if(cur.trim())lines.push(cur.trim());
  const c=document.createElement('canvas');const fs=26,pad=16;const g0=c.getContext('2d');g0.font='500 '+fs+'px Barlow, system-ui, sans-serif';
  let mw=0;lines.forEach(l=>mw=Math.max(mw,g0.measureText(l).width));
  c.width=Math.ceil(mw+pad*2);c.height=lines.length*(fs+6)+pad*1.6;
  const g=c.getContext('2d');g.fillStyle='rgba(10,16,24,0.82)';g.beginPath();
  if(g.roundRect)g.roundRect(0,0,c.width,c.height,14);else g.rect(0,0,c.width,c.height);g.fill();
  g.font='500 '+fs+'px Barlow, system-ui, sans-serif';g.fillStyle='#fff';g.textBaseline='top';
  lines.forEach((l,i)=>g.fillText(l,pad,pad*0.8+i*(fs+6)));
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));
  s.scale.set(c.width/70,c.height/70,1);s.renderOrder=10;scene.add(s);return s;
}
function say(target,text,secs){
  const sp=makeBubble(text);bubbles.push({sp,target,until:performance.now()+(secs||5)*1000});
}

/* ---------- géométrie fusionnée ---------- */
function part(g,x,y,z,c){return {g:g,m:new THREE.Matrix4().makeTranslation(x,y,z),c:c};}
function mergeParts(parts){
  const gs=parts.map(p=>{const g=p.g.index?p.g.toNonIndexed():p.g.clone();g.applyMatrix4(p.m);return g;});
  let n=0;gs.forEach(g=>{n+=g.attributes.position.count;});
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
  gs.forEach((g,i)=>{
    const cnt=g.attributes.position.count,c=new THREE.Color(parts[i].c);
    pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);
    for(let k=0;k<cnt;k++){col[(o+k)*3]=c.r;col[(o+k)*3+1]=c.g;col[(o+k)*3+2]=c.b;}
    o+=cnt;
  });
  const out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.BufferAttribute(pos,3));
  out.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  out.setAttribute('color',new THREE.BufferAttribute(col,3));
  return out;
}
const vcLamb=new THREE.MeshLambertMaterial({vertexColors:true});
const carPaint=new THREE.MeshPhongMaterial({vertexColors:true,shininess:90,specular:0x666666});
const lightsMat=new THREE.MeshBasicMaterial({vertexColors:true});
function castAll(g){g.traverse(o=>{if(o.isMesh)o.castShadow=true;});}

