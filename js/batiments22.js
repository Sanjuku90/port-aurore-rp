'use strict';
/* ---------- v22 : bâtiments repères reconnaissables ----------
   Chaque lieu important a désormais une architecture propre à sa fonction :
   hôpital (urgences, héliport, croix lumineuse), banque néoclassique, supermarché vitré avec chariots,
   résidence à balcons, club à néons, hôtel de police, gendarmerie, palais de justice à coupole,
   maison d'arrêt à miradors, showroom automobile, station-service à auvent, garage à rideaux métalliques,
   auto-école avec voiture double commande. Les pièces fixes sont fusionnées dans le décor (peu d'appels de dessin). */
const B22={win:[],glass:[],neon:[],metal:[],anim:[],M:null,muted:new Set(),built:{}};
function mats22(){
  if(B22.M)return B22.M;
  const M={};
  M.win=new THREE.MeshPhongMaterial({vertexColors:true,specular:0x9aaabb,shininess:90,emissive:0xffd49a,emissiveIntensity:0});wallMats.push(M.win);
  M.glass=new THREE.MeshPhongMaterial({vertexColors:true,specular:0xc8d8e8,shininess:120,transparent:true,opacity:0.42,depthWrite:false,emissive:0xffe6bc,emissiveIntensity:0,side:THREE.DoubleSide});shopMats.push(M.glass);
  M.neon=new THREE.MeshBasicMaterial({vertexColors:true});
  M.metal=new THREE.MeshPhongMaterial({vertexColors:true,specular:0x777777,shininess:70});
  B22.M=M;return M;
}
/* kit : repère local (façade principale vers +z), posé en (x0,z0) avec une rotation r */
function K22(x0,z0,r,y){
  this.x0=x0;this.z0=z0;this.r=r||0;this.y=y==null?0.16:y;
  this.W=new THREE.Matrix4().makeTranslation(x0,0,z0).multiply(new THREE.Matrix4().makeRotationY(this.r));
}
K22.prototype.p=function(key,geo,x,y,z,c,sx,sy,sz,rx,ry,rz){
  const P=pp(geo,x,y+this.y,z,c,sx,sy,sz,rx,ry,rz);P.m.premultiply(this.W);
  if(!key||key==='s')DECO.push(P);else B22[key].push(P);return P;
};
/* boîte posée au sol local : y0 = bas */
K22.prototype.b=function(x,y0,z,w,h,d,c,key,ry){return this.p(key,UBX,x,y0+h/2,z,c,w,h,d,0,ry||0,0);};
K22.prototype.cy=function(x,y0,z,r,h,c,key,seg,r2){return this.p(key,new THREE.CylinderGeometry(r2==null?r:r2,r,h,seg||14),x,y0+h/2,z,c);};
K22.prototype.w=function(x,z){const c=Math.cos(this.r),s=Math.sin(this.r);return[this.x0+x*c+z*s,this.z0-x*s+z*c];};
/* collision (boîte locale -> AABB monde) */
K22.prototype.col=function(x0,x1,z0,z1,big){
  const P=[this.w(x0,z0),this.w(x1,z0),this.w(x0,z1),this.w(x1,z1)];
  const b={x0:Math.min(...P.map(p=>p[0])),x1:Math.max(...P.map(p=>p[0])),z0:Math.min(...P.map(p=>p[1])),z1:Math.max(...P.map(p=>p[1])),big:big!==false,sub:true,lm22:true};
  boxes.push(b);return b;
};
K22.prototype.place=function(o,x,y,z,ry){const q=this.w(x,z);o.position.set(q[0],y+this.y,q[1]);o.rotation.y=this.r+(ry||0);scene.add(o);return o;};
/* façades : f (avant +z), b (arrière), l (gauche -x), r (droite +x) */
function face22(B,f,u,n){
  if(f==='f')return[B.cx-B.w/2+u,B.cz+B.d/2+n,0];
  if(f==='b')return[B.cx+B.w/2-u,B.cz-B.d/2-n,Math.PI];
  if(f==='l')return[B.cx-B.w/2-n,B.cz-B.d/2+u,-Math.PI/2];
  return[B.cx+B.w/2+n,B.cz+B.d/2-u,Math.PI/2];
}
const flen22=(B,f)=>f==='f'||f==='b'?B.w:B.d;
/* boîte collée à une façade : u le long, n0 décalage vers l'extérieur, dn épaisseur */
K22.prototype.fb=function(B,f,u,y0,n0,wu,h,dn,c,key){const q=face22(B,f,u,n0+dn/2);return this.p(key,UBX,q[0],y0+h/2,q[1],c,wu,h,dn,0,q[2],0);};
/* rangée de fenêtres : encadrement, vitre, meneau, appui */
K22.prototype.wins=function(B,f,o){
  const L=flen22(B,f),cols=o.cols||Math.max(1,Math.floor((L-(o.margin||1.2)*2)/(o.pitch||3))),pitch=(L-(o.margin||1.2)*2)/cols;
  const ww=o.ww||Math.min(pitch*0.6,1.6),wh=o.wh||1.6,fc=o.frame==null?0xf2efe8:o.frame,gk=o.gk||'win',gc=o.gc||0x3b5a74;
  for(let r=0;r<(o.rows||1);r++){
    const y=(o.y0||1)+r*(o.fh||3.2);
    for(let k=0;k<cols;k++){
      if(o.skip&&o.skip(k,r))continue;
      const u=(o.margin||1.2)+(k+0.5)*pitch;
      this.fb(B,f,u,y-0.08,0,ww+0.2,wh+0.16,0.07,fc);
      this.fb(B,f,u,y,0.07,ww,wh,0.03,(k+r)%3===0?shade(gc,1.18):gc,gk);
      if(o.mull!==false){this.fb(B,f,u,y,0.1,0.06,wh,0.03,fc);if(wh>1.3)this.fb(B,f,u,y+wh*0.62,0.1,ww,0.05,0.03,fc);}
      if(o.sill!==false)this.fb(B,f,u,y-0.16,0,ww+0.4,0.1,0.22,o.sillC||0xe8e2d6);
      if(o.shut)[-1,1].forEach(s=>this.fb(B,f,u+s*(ww/2+0.3),y,0.02,0.52,wh,0.06,o.shut));
      if(o.rail)this.fb(B,f,u,y+0.05,0.1,ww+0.1,0.06,0.04,0x2a2e33);
    }
  }
};
/* bande vitrée continue (immeubles modernes) */
K22.prototype.ribbon=function(B,f,y,h,o){o=o||{};const L=flen22(B,f),m=o.m==null?0.6:o.m,u0=o.u0==null?m:o.u0,u1=o.u1==null?L-m:o.u1,Lw=u1-u0,uc=(u0+u1)/2;
  this.fb(B,f,uc,y,0.03,Lw,h,0.04,o.gc||0x355a78,o.gk||'win');
  const n=Math.max(2,Math.round(Lw/(o.pitch||1.6)));for(let k=0;k<=n;k++)this.fb(B,f,u0+k*Lw/n,y,0.06,0.07,h,0.04,o.mc||0xd8dde0);
  this.fb(B,f,uc,y-0.06,0.05,Lw+0.1,0.08,0.06,o.mc||0xd8dde0);this.fb(B,f,uc,y+h-0.02,0.05,Lw+0.1,0.08,0.06,o.mc||0xd8dde0);};
/* enseigne peinte sur toile (canevas) */
function signTex22(text,w,h,o){
  const c=document.createElement('canvas');c.width=o.res||512;c.height=Math.max(32,Math.round(c.width*h/w));const g=c.getContext('2d');
  if(o.bg){g.fillStyle=o.bg;g.fillRect(0,0,c.width,c.height);}
  if(o.border){g.strokeStyle=o.border;g.lineWidth=Math.max(3,c.height*0.06);g.strokeRect(g.lineWidth,g.lineWidth,c.width-g.lineWidth*2,c.height-g.lineWidth*2);}
  if(o.draw)o.draw(g,c.width,c.height);
  if(text){const lines=String(text).split('\n'),fs=Math.round(c.height*(o.fs||0.6)/lines.length);
    g.font=(o.weight||700)+' '+fs+'px '+(o.font||'Rajdhani, "Arial Narrow", sans-serif');g.textAlign='center';g.textBaseline='middle';
    if(o.track)g.letterSpacing=o.track+'px';
    lines.forEach((t,i)=>{const y=c.height/2+(i-(lines.length-1)/2)*fs*1.08+fs*0.04;
      if(o.shadow){g.fillStyle=o.shadow;g.fillText(t,c.width/2+2,y+2);}g.fillStyle=o.fg||'#fff';g.fillText(t,c.width/2,y,c.width*0.94);});}
  const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t;
}
K22.prototype.sign=function(text,x,y,z,w,h,o){o=o||{};
  const mat=o.lit===false?new THREE.MeshLambertMaterial({map:signTex22(text,w,h,o),transparent:!o.bg,alphaTest:o.bg?0:0.3}):new THREE.MeshBasicMaterial({map:signTex22(text,w,h,o),transparent:!o.bg,alphaTest:o.bg?0:0.3});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);this.place(m,x,y,z,o.ry||0);
  if(o.back){const m2=m.clone();m2.rotation.y+=Math.PI;const q=this.w(x-Math.sin(o.ry||0)*0.02,z-Math.cos(o.ry||0)*0.02);m2.position.set(q[0],y+this.y,q[1]);scene.add(m2);}
  return m;
};
/* caisson lumineux : boîtier + face imprimée */
K22.prototype.box22=function(text,x,y,z,w,h,o){o=o||{};this.b(x,y-h/2-0.06,z-0.15,w+0.16,h+0.12,0.3,o.case||0x2a2e33);return this.sign(text,x,y,z+0.011,w,h,o);};
K22.prototype.flag=function(x,z,kind,h){h=h||8;this.cy(x,0,z,0.07,h,0xdfe3e6,'metal',8,0.05);this.cy(x,0,z,0.22,0.3,0x8a9099);this.p('metal',sph(0.1,8,6),x,h+0.05,z,0xd1a54a);
  const g=new THREE.PlaneGeometry(1.9,1.2,10,4);g.translate(0.95,0,0);const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:flagTex(kind),side:THREE.DoubleSide}));
  this.place(m,x+0.07,h-0.75,z,0);FX.flags.push({m,base:g.attributes.position.array.slice(),ph:rand(0,6)});this.col(x-0.2,x+0.2,z-0.2,z+0.2,false);};
K22.prototype.person=function(x,z,ry,shirt,pants,o){const p=makePerson(shirt,pants||0x2b3445,pick(SKINS),pick(HAIRS),Object.assign({bag:false},o||{}));this.place(p,x,-0.06,z,ry);return p;};
K22.prototype.car=function(x,z,ry,color,type){const m=makeCar(color,type||'sedan');try{applyType(m,type||'sedan');}catch(e){}m.rotation.order='YXZ';this.place(m,x,-0.16,z,ry);return m;};
K22.prototype.lamp=function(x,z,h){h=h||4.2;this.cy(x,0,z,0.07,h,0x23272c,'metal',8,0.05);this.b(x,h,z+0.25,0.12,0.08,0.6,0x23272c);this.b(x,h-0.12,z+0.5,0.36,0.14,0.36,0xfff0c8,'neon');};
K22.prototype.bench=function(x,z,ry){const S=Math.sin(ry||0),C=Math.cos(ry||0),P=(u,v)=>[x+u*C+v*S,z-u*S+v*C];
  [-0.7,0.7].forEach(u=>{const q=P(u,0);this.b(q[0],0,q[1],0.08,0.45,0.45,0x2a2e33,null,ry);});
  let q=P(0,0);this.b(q[0],0.42,q[1],1.7,0.06,0.45,0x9a6a3e,null,ry);q=P(0,-0.22);this.b(q[0],0.5,q[1],1.7,0.38,0.05,0x9a6a3e,null,ry);};
K22.prototype.bollards=function(x0,x1,z,n){for(let i=0;i<n;i++){const x=x0+(x1-x0)*i/(n-1);this.cy(x,0,z,0.13,0.9,0x3a3f46,'metal',10);this.cy(x,0.72,z,0.135,0.08,0xd8dde0,'metal',10);}};
K22.prototype.planter=function(x,z,w,d){this.b(x,0,z,w,0.55,d,0x8d8a84);this.b(x,0.5,z,w-0.2,0.08,d-0.2,0x4a3a2a);
  const n=Math.max(2,Math.round(w/0.8));for(let i=0;i<n;i++)this.p(null,sph(0.36,7,5),x-w/2+0.4+i*(w-0.8)/Math.max(1,n-1),0.85,z+rand(-0.1,0.1),pick([0x3f7a3a,0x4f8a44,0x356b35]),1,0.8,1);};
/* acrotère + équipements de toit */
K22.prototype.roof=function(B,y,o){o=o||{};const pc=o.pc||0xd8d4cc,ph=o.ph||0.8,t=0.28;
  this.b(B.cx,y,B.cz,B.w-0.3,0.05,B.d-0.3,o.rc||0x6d7177);
  [[0,B.d/2-t/2,B.w,t],[0,-B.d/2+t/2,B.w,t],[-B.w/2+t/2,0,t,B.d],[B.w/2-t/2,0,t,B.d]].forEach(q=>{this.b(B.cx+q[0],y,B.cz+q[1],q[2],ph,q[3],pc);this.b(B.cx+q[0],y+ph,B.cz+q[1],q[2]+(q[2]>t?0.2:0.16),0.1,q[3]+(q[3]>t?0.2:0.16),shade(pc,1.08));});
  const n=o.units==null?2:o.units;for(let k=0;k<n;k++){const x=B.cx+(o.ux||0)+(k-(n-1)/2)*Math.min(4,B.w/(n+1)),z=B.cz-B.d*0.18;this.b(x,y,z,1.8,1.1,1.5,0x9ba1a8);this.cy(x,y+1.1,z,0.55,0.12,0x5a6068,null,12);}
};
const WHITE22=0xeef0ee,STONE22=0xe4dac6,DARK22=0x2a2e33;

/* ================= HÔPITAL ================= */
function hospital22(x,z){
  const K=new K22(x,z,0),B={cx:0,cz:-1,w:34,d:14},gf=4.2,fh=3.4,n=4,top=gf+fh*n;
  K.b(0,0,-1,34,top,14,WHITE22);K.b(0,0,-1,34.3,0.55,14.3,0x8d9196);
  /* étages : bandeaux vitrés, allèges bleues, brise-soleil verticaux */
  ['f','b'].forEach(f=>{for(let i=0;i<n;i++){const y=gf+i*fh+0.85;K.ribbon(B,f,y,1.75,{m:1,pitch:1.7});K.fb(B,f,17,y-0.55,0.02,33,0.3,0.05,0x4f93b3);}});
  ['l','r'].forEach(f=>K.wins(B,f,{rows:n,y0:gf+0.85,fh,ww:1.3,wh:1.75,pitch:2.6,frame:0xdfe5e8,sill:false}));
  for(let k=0;k<=10;k++)K.fb(B,'f',0.6+k*3.28,gf,0,0.18,fh*n-0.2,0.45,0xf6f7f5);
  K.b(0,top-0.05,-1,34.6,0.35,14.6,0xdfe3e2);
  /* rez-de-chaussée : hall vitré, portes coulissantes, vitrages latéraux */
  K.fb(B,'f',17,0.55,0.02,12,3.2,0.05,0x6a8ea6,'glass');for(let k=0;k<=6;k++)K.fb(B,'f',11+k*2,0.55,0.06,0.09,3.2,0.06,0xc9d0d4,'metal');
  K.fb(B,'f',17,3.72,0.02,12.2,0.14,0.1,0xc9d0d4,'metal');
  [-0.8,0.8].forEach(dx=>K.fb(B,'f',17+dx,0.55,0.12,1.5,2.5,0.04,0x9fc0d4,'glass'));
  K.wins(B,'f',{cols:3,y0:1.1,ww:1.9,wh:1.9,margin:1.2,pitch:3,frame:0xdfe5e8,skip:(k)=>false});
  for(let k=0;k<3;k++)K.fb(B,'f',24.6+k*2.9,1.1,0.02,1.9,1.9,0.06,0x3b5a74,'win');
  /* auvent d'entrée avec enseigne */
  K.b(0,3.9,8.15,13,0.38,4.4,0xf3f4f2);K.b(0,3.85,8.15,12.6,0.05,4.0,0xfff6dc,'neon');
  [-5.9,5.9].forEach(dx=>{K.cy(dx,0,10,0.16,3.9,0xc9d0d4,'metal',12);K.col(dx-0.2,dx+0.2,9.8,10.2,false);});
  K.sign('HÔPITAL',0,4.09,10.36,7,0.34,{bg:'#f3f4f2',fg:'#1d5a8a',fs:0.92,res:512});
  K.sign('CENTRE HOSPITALIER AURORE',0,top-1.25,6.06,22,1.25,{fg:'#1d5a8a',lit:false,fs:0.85,res:1024});
  /* croix rouge lumineuse (façade + toit) */
  const cross=(cx,cy,cz,s)=>{K.b(cx,cy-s*0.62,cz-0.12,s*1.25,s*1.25,0.24,0xf6f6f4);K.b(cx,cy-s*0.5,cz+0.02,s*0.34,s,0.08,0xe0262b,'neon');K.b(cx,cy-s*0.17,cz+0.02,s,s*0.34,0.08,0xe0262b,'neon');};
  cross(-13.5,13.6,6.2,2.4);
  /* aile des urgences */
  const U={cx:21,cz:0,w:8,d:12};K.b(21,0,0,8,5.2,12,0xe9ecea);K.b(21,5.2,0,8.3,0.3,12.3,0xd8dcda);
  K.fb(U,'f',4,3.7,0.02,8,1.2,0.12,0xd2262b);K.sign('URGENCES',21,4.3,6.16,6.4,0.95,{fg:'#ffffff',fs:0.92});
  K.fb(U,'f',4,0.3,0.02,3.4,2.9,0.05,0x6a8ea6,'glass');K.fb(U,'f',4,0.3,0.06,0.08,2.9,0.06,0xc9d0d4,'metal');
  K.wins(U,'r',{rows:1,y0:1.4,ww:1.4,wh:1.6,pitch:2.8,frame:0xdfe5e8});
  K.b(21,4.1,9.6,8.4,0.32,7.2,0xd2262b);K.b(21,4.06,9.6,8,0.05,6.8,0xfff6dc,'neon');
  [[17.3,12.9],[24.7,12.9]].forEach(q=>{K.cy(q[0],0,q[1],0.16,4.1,0xc9d0d4,'metal',12);K.col(q[0]-0.2,q[0]+0.2,q[1]-0.2,q[1]+0.2,false);});
  K.b(21,0,9.4,7.6,0.02,6.4,0xe9c23a);for(let i=0;i<5;i++)K.b(18.3+i*1.4,0.02,9.4,0.3,0.02,6,0xf4f1ea);
  const amb=K.car(21,9.2,Math.PI,0xf4f4f0,'ambulance');K.col(19.9,22.1,6.8,11.6);
  /* héliport sur le toit */
  K.cy(-6,top,-1,5.2,0.14,0x3d4248,null,32);K.cy(-6,top+0.14,-1,4.6,0.02,0xf2c200,null,32);K.cy(-6,top+0.15,-1,4.25,0.02,0x3d4248,null,32);
  K.b(-7.1,top+0.17,-1,0.5,0.02,3.4,0xf4f4f0);K.b(-4.9,top+0.17,-1,0.5,0.02,3.4,0xf4f4f0);K.b(-6,top+0.17,-1,2.2,0.02,0.5,0xf4f4f0);
  [0,1,2,3,4,5,6,7].forEach(i=>{const a=i/8*Math.PI*2;K.b(-6+Math.cos(a)*5,top+0.14,-1+Math.sin(a)*5,0.25,0.18,0.25,0x7cff8a,'neon');});
  K.cy(-12.6,top,4.6,0.05,3,0xd8dde0,'metal',6);K.p('s',new THREE.ConeGeometry(0.28,1.3,10,1,true),-12.0,top+2.75,4.6,0xff7a1a,1,1,1,0,0,-Math.PI/2);
  K.roof({cx:9,cz:-1,w:16,d:14},top+0.3,{units:3,ph:0.6});
  [[-16.8,-7.8],[16.8,-7.8],[-16.8,5.8],[16.8,5.8]].forEach(q=>K.b(q[0],top+0.3,q[1],0.18,0.18,0.18,0xff3030,'neon'));
  /* abords : panneau H, parking, bancs, jardinières, potelets */
  K.cy(-15,0,10.5,0.07,3.2,0x9aa1a8,'metal',8);K.b(-15,2.5,10.55,1.1,1.1,0.06,0x1e5fae);K.sign('H',-15,3.05,10.6,1,1,{fg:'#ffffff',fs:0.9});
  K.cy(-10.5,0,10.5,0.07,3.2,0x9aa1a8,'metal',8);K.b(-10.5,2.4,10.55,0.9,0.9,0.06,0x1e5fae);K.sign('P',-10.5,2.85,10.6,0.8,0.8,{fg:'#ffffff',fs:0.9});
  K.bench(-8.5,7.6,Math.PI);K.bench(8.5,7.6,Math.PI);K.planter(-11.5,7.2,4,1.1);K.planter(11.5,7.2,4,1.1);
  K.bollards(-6.5,6.5,10.6,6);
  K.col(-17,17,-8,6);K.col(17,25,-6,6);
  K.person(-2.2,8.7,0.4,0x8fd1c9,0x8fd1c9,{top:'long',bottom:'pantalon'});K.person(9.8,8.9,-2.6,0xf2f2ee,0x2b3445,{top:'long'});
}


/* drapeaux : tricolore, ville, Europe */
function flagTex22(k){
  if(k==='city')return flagTex(0);
  const c=document.createElement('canvas');c.width=128;c.height=80;const g=c.getContext('2d');
  if(k==='eu'){g.fillStyle='#1f3f99';g.fillRect(0,0,128,80);g.fillStyle='#ffd23f';for(let i=0;i<12;i++){const a=i/12*Math.PI*2;g.beginPath();g.arc(64+Math.cos(a)*24,40+Math.sin(a)*24,3.2,0,7);g.fill();}}
  else{g.fillStyle='#1f3f99';g.fillRect(0,0,43,80);g.fillStyle='#f4f4f0';g.fillRect(43,0,42,80);g.fillStyle='#d6283a';g.fillRect(85,0,43,80);}
  return new THREE.CanvasTexture(c);
}
K22.prototype.flag=function(x,z,kind,h){h=h||8;this.cy(x,0,z,0.07,h,0xdfe3e6,'metal',8,0.05);this.cy(x,0,z,0.22,0.3,0x8a9099);this.p('metal',sph(0.1,8,6),x,h+0.05,z,0xd1a54a);
  const g=new THREE.PlaneGeometry(1.9,1.2,10,4);g.translate(0.95,0,0);const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:flagTex22(kind),side:THREE.DoubleSide}));
  this.place(m,x+0.07,h-0.75,z,0);FX.flags.push({m,base:g.attributes.position.array.slice(),ph:rand(0,6)});this.col(x-0.2,x+0.2,z-0.2,z+0.2,false);};
/* vitrine : intérieur peint (rayonnages, présentoirs) visible derrière la vitre, allumé la nuit */
function shopTex22(kind,w,h){
  const c=document.createElement('canvas');c.width=512;c.height=Math.max(64,Math.round(512*h/w));const g=c.getContext('2d'),W=c.width,H=c.height;
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,kind==='pharma'?'#e9f3ee':'#f1efe6');gr.addColorStop(1,kind==='pharma'?'#bcd3c6':'#c9c4b4');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.fillStyle='rgba(255,255,240,0.9)';for(let x=20;x<W;x+=90)g.fillRect(x,6,60,5);
  const shelves=kind==='market'||kind==='pharma'||kind==='kiosk';
  if(shelves){for(let x=10;x<W;x+=W/5){g.fillStyle='#8f969c';g.fillRect(x,H*0.22,W/5-22,H*0.7);
    for(let r=0;r<4;r++){const y=H*0.25+r*H*0.16;g.fillStyle='#6b7177';g.fillRect(x,y+H*0.12,W/5-22,3);
      for(let k=0;k<9;k++){g.fillStyle=pick(kind==='pharma'?['#2e9a6a','#f4f4f0','#5aa9ff','#e74c3c','#f2c200']:['#d94f4f','#f2c200','#4fb58a','#2e6fd1','#ef7a3a','#f4f1ea','#8a5fc9','#c0392b']);g.fillRect(x+3+k*((W/5-28)/9),y+H*0.02,(W/5-28)/9-2,H*0.1);}}}}
  else if(kind==='cars'){g.fillStyle='#dfe3e6';g.fillRect(0,H*0.8,W,H*0.2);}
  else{for(let k=0;k<6;k++){const x=30+k*80;g.fillStyle='#2b2f36';g.fillRect(x+30,H*0.25,4,H*0.6);g.fillStyle=pick(['#c0392b','#2e6fd1','#f4f1ea','#7b4bb3','#e0a526']);g.fillRect(x+12,H*0.32,40,H*0.35);}}
  g.fillStyle='rgba(30,50,70,0.18)';g.fillRect(0,0,W,H);
  g.fillStyle='rgba(255,255,255,0.28)';g.beginPath();g.moveTo(W*0.1,0);g.lineTo(W*0.25,0);g.lineTo(W*0.12,H);g.lineTo(-W*0.03,H);g.fill();
  g.beginPath();g.moveTo(W*0.55,0);g.lineTo(W*0.62,0);g.lineTo(W*0.5,H);g.lineTo(W*0.43,H);g.fill();
  const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t;
}
K22.prototype.vitrine=function(kind,x,y0,z,w,h,ry){const t=shopTex22(kind,w,h),m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:0}));shopMats.push(m.material);this.place(m,x,y0+h/2,z,ry||0);return m;};

/* ================= TEMPLE (banque, tribunal) ================= */
function temple22(K,o){
  const W=o.w,D=o.d,cz=o.cz,stone=o.stone,front=cz+D/2,pod=o.pod||1.2,colH=o.colH||8.2,ncol=o.ncol||6;
  K.b(0,0,cz,W+1,pod,D+0.6,shade(stone,0.88));K.b(0,pod-0.12,cz,W+1.2,0.14,D+0.8,shade(stone,0.95));
  const nst=5,sd=0.45;for(let i=0;i<nst;i++)K.b(0,0,front+0.3+(i+0.5)*sd,o.stairW||W*0.75,pod-i*pod/nst,sd,shade(stone,i%2?0.93:0.97));
  const bodyF=front-2.6,top=pod+colH+1.35;
  K.b(0,pod,cz-1.3,W,top-pod+0.6,D-2.6,stone);
  for(let y=pod+0.6;y<pod+4.2;y+=0.62)K.b(0,y,bodyF+0.02,W-0.1,0.06,0.06,shade(stone,0.78));
  const span=W*0.72,cols=[];for(let i=0;i<ncol;i++)cols.push(-span/2+i*span/(ncol-1));
  cols.forEach(x=>{K.b(x,pod,front-1.1,1.15,0.38,1.15,shade(stone,1.03));K.cy(x,pod+0.38,front-1.1,0.45,colH-0.38,shade(stone,1.04),null,18,0.38);
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2;K.b(x+Math.cos(a)*0.4,pod+0.45,front-1.1+Math.sin(a)*0.4,0.06,colH-0.6,0.06,shade(stone,0.86),null,-a);}
    K.cy(x,pod+colH-0.32,front-1.1,0.38,0.32,shade(stone,1.04),null,18,0.56);K.b(x,pod+colH,front-1.1,1.25,0.3,1.25,shade(stone,1.06));});
  const ey=pod+colH+0.3;
  K.b(0,ey,front-1.35,span+2.4,0.75,2.9,shade(stone,1.02));K.b(0,ey+0.75,front-1.35,span+2.6,0.9,2.95,stone);
  K.b(0,ey+1.65,front-1.35,span+3.2,0.32,3.4,shade(stone,1.08));
  K.sign(o.title,0,ey+1.2,front+0.12,span*0.9,0.7,{fg:o.gold||'#a8822e',lit:false,font:'Georgia, "Times New Roman", serif',fs:0.82,res:1024,track:3});
  /* fronton */
  const pw=(span+3.2)/2,ph=o.pedH||2.6,sh=new THREE.Shape();sh.moveTo(-pw,0);sh.lineTo(pw,0);sh.lineTo(0,ph);sh.lineTo(-pw,0);
  const pg=new THREE.ExtrudeGeometry(sh,{depth:3.2,bevelEnabled:false});K.p('s',pg,0,ey+1.97,front-2.95,shade(stone,1.02));
  const L=Math.hypot(pw,ph),ang=Math.atan2(ph,pw);
  [-1,1].forEach(sg=>K.p('s',UBX,sg*pw/2,ey+1.97+ph/2+0.12,front-1.3,shade(stone,1.1),L+0.5,0.3,3.5,0,0,-sg*ang));
  if(o.emblem)o.emblem(ey+1.97,front+0.27,ph);
  /* portes en bronze, fenêtres grillagées */
  K.b(0,pod,bodyF+0.02,3.4,5.4,0.2,shade(stone,1.1));K.b(-0.6,pod,bodyF+0.14,1.15,4.4,0.1,0x5a4024,'metal');K.b(0.6,pod,bodyF+0.14,1.15,4.4,0.1,0x5a4024,'metal');
  K.b(0,pod+4.5,bodyF+0.14,2.4,0.75,0.08,0x34495e,'win');[-0.12,0.12].forEach(dx=>K.b(dx*3,pod+2.0,bodyF+0.2,0.08,0.35,0.06,0xc9a13c,'metal'));
  [-1,1].forEach(sg=>[span*0.34,span*0.62].forEach(dx=>{const x=sg*dx;if(Math.abs(x)>W/2-0.8)return;K.b(x,pod+1.0,bodyF+0.02,1.5,3.6,0.12,shade(stone,1.1));K.b(x,pod+1.15,bodyF+0.1,1.2,3.3,0.05,0x34495e,'win');for(let k=0;k<5;k++)K.b(x-0.48+k*0.24,pod+1.15,bodyF+0.15,0.04,3.3,0.04,0x22262a,'metal');}));
  const sideB={cx:0,cz:cz-1.3,w:W,d:D-2.6};['l','r'].forEach(f=>K.wins(sideB,f,{rows:2,y0:pod+1.4,fh:4.2,ww:1.3,wh:2.6,pitch:3,frame:shade(stone,1.1),sillC:shade(stone,1.12),rail:true}));
  /* balustrade de toit */
  for(let x=-W/2+0.6;x<=W/2-0.6;x+=0.5){K.cy(x,top+0.6,cz+D/2-2.9,0.09,0.75,shade(stone,1.06),null,8,0.12);}
  K.b(0,top+1.35,cz+D/2-2.9,W,0.14,0.4,shade(stone,1.08));
  [-1,1].forEach(sg=>{const x=sg*((o.stairW||W*0.75)/2+0.5);K.b(x,0,front+1.6,0.7,1.2,0.7,shade(stone,0.92));K.cy(x,1.2,front+1.6,0.06,2.0,0x1c1e21,'metal',8);K.b(x,3.1,front+1.6,0.42,0.6,0.42,0x1c1e21,'metal');K.b(x,3.17,front+1.6,0.3,0.45,0.3,0xffe2a8,'neon');});
  K.col(-W/2-0.5,W/2+0.5,cz-D/2-0.3,front+0.3);K.col(-(o.stairW||W*0.75)/2,(o.stairW||W*0.75)/2,front+0.3,front+0.3+nst*sd-0.9);
  return{top,ey,front};
}
/* ================= BANQUE ================= */
function bank22(x,z){
  const K=new K22(x,z,0);
  const T=temple22(K,{w:24,d:14,cz:-1,stone:STONE22,title:'BANQUE DE PORT-AURORE',emblem:(y,zf,ph)=>{K.cy(0,y+ph*0.28,zf-0.05,0.7,0.12,0xc9a13c,'metal',24);K.sign('$',0,y+ph*0.35,zf+0.1,0.9,0.9,{fg:'#6b4f12',lit:false,fs:0.9});}});
  /* distributeurs */
  [9.6,10.9].forEach((dx,i)=>{K.b(dx,0.2,6.62,1.0,1.9,0.12,0x2c3138);K.b(dx,1.25,6.69,0.55,0.4,0.03,0x5ab3ff,'neon');K.b(dx,0.95,6.7,0.4,0.18,0.06,0x9aa1a8,'metal');});
  K.sign('DAB · 24/24',10.25,2.45,6.7,2.4,0.4,{bg:'#1f3d6e',fg:'#ffffff',fs:0.8});
  K.bollards(-9,9,8.9,7);K.person(10.3,7.9,Math.PI,0x2b3445,0x1c1c1c,{top:'veste'});
}
/* ================= PÔLE EMPLOI ================= */
function job22(x,z){
  const K=new K22(x,z,0),B={cx:0,cz:-1,w:26,d:12},gf=4.2,top=8.4,blue=0x1d4f8a;
  K.b(0,0,-1,26,top,12,0xf2f2ef);K.b(0,0,-1,26.2,0.4,12.2,0x6f7378);
  K.ribbon(B,'f',0.4,3.5,{m:0.4,pitch:2,gc:0x2f5573,mc:0x2a3340});
  for(let k=0;k<7;k++)K.fb(B,'f',2+k*3.7,0.4,0.05,0.22,3.9,0.5,blue);
  K.fb(B,'f',13,3.9,0,26,0.35,0.6,0x2a3340);
  K.ribbon(B,'f',5.0,2.3,{u0:13.2,u1:25.4,pitch:1.5,gc:0x2f5573,mc:0x2a3340});K.fb(B,'f',13,7.6,0.02,26,0.25,0.06,0x1d4f8a);
  ['l','r','b'].forEach(f=>K.wins(B,f,{rows:2,y0:1.2,fh:4.1,ww:1.4,wh:1.7,pitch:3,frame:0x2a3340,sill:false}));
  /* cube bleu signalétique */
  K.b(-8.5,4.25,5.6,8,4.6,1.5,blue);K.b(-8.5,4.25,6.36,7.6,0.08,0.02,0xf2c200,'neon');
  K.sign('PÔLE EMPLOI',-8.5,7.3,6.38,7,1.3,{fg:'#ffffff',fs:0.78});K.sign('Accueil · Offres · Conseillers',-8.5,5.6,6.38,6.6,0.6,{fg:'#cfe0f5',fs:0.75,weight:600});
  K.b(4,3.85,7.1,9,0.25,2.6,0xf2f2ef);K.b(4,3.82,7.1,8.6,0.04,2.2,0xfff6dc,'neon');
  K.fb(B,'f',17,0.4,0.1,2.6,2.8,0.05,0x8fb3cc,'glass');K.sign('ENTRÉE',4,3.45,5.18,1.6,0.32,{bg:'#1d4f8a',fg:'#ffffff',fs:0.8});
  /* tableau d'offres, file d'attente, vélos, banc */
  K.b(10.5,0,7.6,0.12,2.2,0.12,DARK22);K.b(13,0,7.6,0.12,2.2,0.12,DARK22);
  K.sign('',11.75,1.55,7.68,2.6,1.4,{bg:'#f2efe6',border:'#1d4f8a',draw:(g,W,H)=>{for(let i=0;i<10;i++){g.fillStyle=pick(['#ffffff','#ffe9a8','#d7ecff','#ffd6d6']);const x=12+(i%5)*98,y=16+Math.floor(i/5)*(H/2-8);g.fillRect(x,y,84,H/2-26);g.fillStyle='#55606a';for(let l=0;l<4;l++)g.fillRect(x+8,y+12+l*14,60,4);}}});
  for(let i=0;i<5;i++){K.cy(-1.6+i*1.4,0,8.4,0.04,1.0,0x9aa1a8,'metal',8);K.cy(-1.6+i*1.4,0,8.4,0.16,0.05,0x3a3f46,null,10);if(i<4)K.b(-0.9+i*1.4,0.88,8.4,1.4,0.06,0.02,blue);}
  for(let i=0;i<4;i++){K.p('metal',new THREE.TorusGeometry(0.4,0.03,6,14,Math.PI),-10.5+i*0.8,0,8.6,0x9aa1a8,1,1,1,0,Math.PI/2,0);}
  K.bench(8,8.8,Math.PI);K.planter(-3.5,6.8,2.4,0.9);
  K.roof(B,top,{units:2,pc:0xe6e6e2,ph:0.6,ux:4});
  K.col(-13,13,-7,5);K.col(-12.5,-4.5,5,6.4);
}
/* chariot de supermarché */
function cart22(K,x,z,ry,red){
  const S=Math.sin(ry),C=Math.cos(ry),P=(u,v)=>[x+u*C+v*S,z-u*S+v*C],g=0xb9c0c6;
  let q=P(0,0);K.b(q[0],0.45,q[1],0.55,0.04,0.85,g,'metal',ry);
  [[-0.27,0],[0.27,0]].forEach(o=>{q=P(o[0],o[1]);K.b(q[0],0.45,q[1],0.03,0.5,0.85,g,'metal',ry);});
  q=P(0,0.42);K.b(q[0],0.45,q[1],0.55,0.5,0.03,g,'metal',ry);q=P(0,-0.42);K.b(q[0],0.45,q[1],0.55,0.5,0.03,g,'metal',ry);
  q=P(0,0.5);K.b(q[0],1.0,q[1],0.6,0.06,0.06,red||0xd2262b,'metal',ry);
  [[-0.22,-0.35],[0.22,-0.35],[-0.22,0.35],[0.22,0.35]].forEach(o=>{q=P(o[0],o[1]);K.b(q[0],0.05,q[1],0.03,0.4,0.03,g,'metal',ry);K.cy(q[0],0,q[1],0.06,0.06,0x22262a,null,8);});
}
/* ================= SUPERMARCHÉ ================= */
function shop22(x,z){
  const K=new K22(x,z,0),B={cx:0,cz:-3,w:30,d:16},h=6.6,green=0x1f7a4d;
  K.b(0,0,-3,30,h,16,0xd9dcdc);K.b(0,0,-3,30.2,0.35,16.2,0x75797d);
  ['l','r','b'].forEach(f=>{const L=flen22(B,f);for(let y=1.2;y<h;y+=1.2)K.fb(B,f,L/2,y,0,L,0.05,0.03,0xbfc3c5);});
  /* vitrine pleine hauteur avec rayonnages visibles */
  K.vitrine('market',-3,0.35,5.03,20,3.9);
  for(let k=0;k<=10;k++)K.fb(B,'f',2+k*2,0.35,0.04,0.12,3.95,0.1,0x4a5056,'metal');
  K.fb(B,'f',12,4.25,0,20.4,0.16,0.14,0x4a5056,'metal');
  K.vitrine('market',11.5,0.35,5.01,4,3.4);K.fb(B,'f',26.5,0.35,0.02,4,3.4,0.04,0x9fc0d4,'glass');K.fb(B,'f',26.5,3.75,0.0,4.4,0.5,0.12,0x4a5056,'metal');
  [-0.85,0.85].forEach(dx=>K.fb(B,'f',26.5+dx,0.35,0.07,1.6,3.3,0.03,0xb8d3e3,'glass'));
  K.b(11.5,0,6.2,3,0.03,1.6,0x9b2a2a);K.sign('ENTRÉE · SORTIE',11.5,4.0,5.17,3.6,0.4,{bg:'#1f7a4d',fg:'#ffffff',fs:0.78});
  /* bandeau vert + liseré rouge */
  K.fb(B,'f',15,4.55,0,30.4,2.05,0.5,green);K.fb(B,'f',15,4.55,0.5,30.4,0.18,0.04,0xe23b2e,'neon');
  K.sign('SUPÉRETTE AURORE',-2,5.7,5.53,15,1.5,{fg:'#ffffff',fs:0.8});
  K.cy(9.8,5.0,5.5,0.8,0.12,0xf2c200,'neon',24);K.p('neon',new THREE.CylinderGeometry(0.8,0.8,0.12,24),9.8,5.7,5.56,0xf2c200,1,1,1,Math.PI/2,0,0);
  K.sign('7/7',9.8,5.7,5.63,1.2,0.9,{fg:'#1f4f2f',fs:0.75});
  K.b(0,4.3,6.0,30,0.15,2.0,0xeceeed);
  /* affiches promo collées */
  [[-11,'PROMO\n-30 %','#e23b2e'],[-5.5,'FRUITS &\nLÉGUMES','#f2c200'],[2.5,'2 ACHETÉS\n1 OFFERT','#e23b2e']].forEach(([px,t,c])=>K.sign(t,px,2.6,5.12,1.6,1.1,{bg:c,fg:c==='#f2c200'?'#1f4f2f':'#ffffff',fs:0.75}));
  /* étals, congélateur, abri chariots, bouteilles de gaz */
  [-9.5,-6].forEach(cx=>{K.b(cx,0,6.6,2.6,0.75,1.1,0x8a6440);K.b(cx,0.75,6.6,2.6,0.05,1.1,0x6b4a2e);for(let i=0;i<14;i++)K.p(null,sph(0.15,6,5),cx+rand(-1.1,1.1),0.9,6.6+rand(-0.4,0.4),pick([0xd94f4f,0xf2c200,0x4fb58a,0xef7a3a,0x9b3d8f]));K.col(cx-1.3,cx+1.3,6.05,7.15,false);});
  K.b(-13.5,0,6.4,1.8,0.9,0.9,0xf4f6f6);K.b(-13.5,0.9,6.4,1.8,0.08,0.9,0x9fc0d4,'glass');K.sign('GLACES',-13.5,0.55,6.86,1.4,0.5,{bg:'#2e6fd1',fg:'#ffffff',fs:0.8});K.col(-14.4,-12.6,5.95,6.85,false);
  const sx=4.2,sz=8.6;[[-1.6,-1],[1.6,-1],[-1.6,1],[1.6,1]].forEach(o=>K.cy(sx+o[0],0,sz+o[1]*0.9,0.05,2.3,0x9aa1a8,'metal',8));
  K.b(sx,2.3,sz,3.6,0.1,2.2,0x1f7a4d);K.sign('CHARIOTS',sx,2.62,sz+1.12,2.2,0.42,{bg:'#1f7a4d',fg:'#ffffff',fs:0.8});
  for(let i=0;i<5;i++)cart22(K,sx-1.1+i*0.35,sz+0.15,Math.PI/2);cart22(K,sx+2.6,sz+0.4,0.7);
  K.col(sx-1.8,sx+1.8,sz-1.1,sz+1.1,false);
  K.b(15.8,0,2,0.9,1.4,1.6,0x9aa1a8,'metal');for(let i=0;i<4;i++)K.cy(15.8,0.05,1.5+i*0.33,0.15,0.7,i%2?0x2e6fd1:0xc9c9c9,'metal',10);
  K.roof(B,h,{units:3,pc:0xc9cccc,ph:0.7});
  K.col(-15,15,-11,5.2);
}


/* ================= RÉSIDENCE (appartements) ================= */
function home22(x,z){
  const K=new K22(x,z,0),B={cx:0,cz:-1,w:24,d:12},gf=3.6,fh=3,n=6,top=gf+fh*n,wall=0xead6b6;
  K.b(0,0,-1,24,top,12,wall);K.b(0,0,-1,24.2,gf,12.2,0xc2b092);
  for(let y=0.6;y<gf;y+=0.6)K.fb(B,'f',12,y,0.1,24.2,0.05,0.03,0xa8987c);
  for(let i=1;i<=n;i++)K.b(0,gf+i*fh-0.12,-1,24.3,0.16,12.3,0xf3ead8);
  const bays=[2.5,7.3,16.7,21.5];
  for(let r=0;r<n;r++){const y=gf+r*fh;
    bays.forEach((u,k)=>{
      K.fb(B,'f',u,y+0.1,0,1.9,2.25,0.06,0xf4efe4);K.fb(B,'f',u,y+0.15,0.06,1.6,2.1,0.03,(k+r)%3?0x3b5a74:0x4b6a84,'win');K.fb(B,'f',u,y+0.15,0.09,0.06,2.1,0.03,0xf4efe4);
      K.fb(B,'f',u,y+0.02,0,2.8,0.16,1.25,0xe2dccf);
      for(let j=0;j<9;j++)K.fb(B,'f',u-1.3+j*0.325,y+0.18,1.18,0.035,0.95,0.035,0x30353a,'metal');K.fb(B,'f',u,y+1.12,1.15,2.8,0.06,0.09,0x30353a,'metal');
      [-1,1].forEach(sg=>K.fb(B,'f',u+sg*1.38,y+0.18,0.05,0.04,0.95,1.15,0x30353a,'metal'));
      const R=(r*7+k*13)%10;
      if(R<3){[0,1,2].forEach(j=>K.fb(B,'f',u-0.7+j*0.7,y+0.9,0.6,0.38,0.45,0.02,pick([0xd94f4f,0xf4f1ea,0x2e6fd1,0xe0b34a,0x4fb58a])));K.fb(B,'f',u,y+1.32,0.6,2.2,0.02,0.02,0xdddddd);}
      else if(R<6){K.fb(B,'f',u-0.9,y+0.18,0.4,0.4,0.35,0.35,0xa4492f);const q=face22(B,'f',u-0.9,0.6);K.p(null,sph(0.32,7,5),q[0],y+0.75,q[1],0x3f7a3a);}
      else if(R<7){const q=face22(B,'f',u+0.8,0.45);K.p('metal',new THREE.CylinderGeometry(0.42,0.42,0.06,16),q[0],y+1.9,q[1],0xe8e8e4,1,1,1,Math.PI/2.4,0,0);}
      if(R%4===1)K.fb(B,'f',u+1.05,y+2.45,0,0.75,0.45,0.35,0xdcdedd);
    });
    if(r>=0)[11.3,12.7].forEach(u=>{K.fb(B,'f',u,y+0.9,0,0.9,1.3,0.06,0xf4efe4);K.fb(B,'f',u,y+0.95,0.05,0.7,1.2,0.03,0x3b5a74,'win');});
  }
  ['l','r'].forEach(f=>K.wins(B,f,{rows:n,y0:gf+0.8,fh,ww:1.2,wh:1.5,pitch:3,shut:0x7a8f6a}));
  K.wins(B,'b',{rows:n,y0:gf+0.8,fh,ww:1.2,wh:1.5,pitch:3});
  /* hall d'entrée */
  K.fb(B,'f',12,0,0.02,3.2,3.0,0.06,0x8fb3cc,'glass');K.fb(B,'f',12,0,0.08,0.08,3.0,0.05,0x30353a,'metal');
  K.fb(B,'f',12,3.05,0,4.2,0.2,1.8,0x30353a);K.sign('RÉSIDENCE AURORE',0,3.4,5.05,6,0.55,{fg:'#4a2c6d',lit:false,fs:0.85});
  K.sign('12',2.3,2.3,5.03,0.5,0.5,{bg:'#1d4f8a',fg:'#ffffff',border:'#ffffff',fs:0.7});
  K.b(2.3,1.2,5.02,0.3,0.55,0.05,0x9aa1a8,'metal');K.b(2.3,1.45,5.06,0.18,0.12,0.02,0x5ab3ff,'neon');
  for(let i=0;i<6;i++)K.b(-3.2+(i%3)*0.42,0.9+Math.floor(i/3)*0.36,5.04,0.38,0.3,0.12,0xb8902c,'metal');
  [[5.5,0x2f7d3a],[6.3,0xe0b400],[7.1,0x2f7d3a]].forEach(([bx,c])=>{K.b(bx,0,6.0,0.65,1.05,0.7,c);K.b(bx,1.05,6.0,0.7,0.08,0.75,shade(c,0.8));});K.col(5.1,7.5,5.6,6.4,false);
  K.planter(-6.5,6.0,3.2,0.9);
  K.roof(B,top,{units:1,pc:0xe9dcc4});
  const tx=-6,tz=-3;[[-0.7,-0.7],[0.7,-0.7],[-0.7,0.7],[0.7,0.7]].forEach(q=>K.b(tx+q[0],top,tz+q[1],0.12,2,0.12,0x3a3f47));K.cy(tx,top+2,tz,1.1,2.2,0x8a6a4a);K.p(null,new THREE.ConeGeometry(1.15,0.7,12),tx,top+4.55,tz,0x5a4636);
  for(let i=0;i<3;i++){K.cy(4+i*2.5,top,-4,0.04,2.5+i,0x9aa1a8,'metal',6);K.b(4+i*2.5,top+1.8+i,-4,1.2,0.04,0.04,0x9aa1a8,'metal');}
  K.col(-12,12,-7,5);
}
/* ================= CLUB NÉON ================= */
function club22(x,z){
  const K=new K22(x,z,0),B={cx:0,cz:-1,w:24,d:12},h=9.5;
  K.b(0,0,-1,24,h,12,0x17161d);
  for(let k=0;k<=24;k+=1.2)K.fb(B,'f',k,0.5,0,0.08,h-0.8,0.12,0x2a2833,'metal');
  K.fb(B,'f',12,0,0,24.2,0.5,0.25,0x0f0f14);K.fb(B,'f',12,h-0.3,0,24.4,0.4,0.3,0x0f0f14);
  /* néons animés (contour et entrée) */
  const tube=(col)=>{const m=new THREE.MeshBasicMaterial({color:col});return m;},mp=tube(0xff3fbf),mb=tube(0x3fb5ff);
  const neonBox=(mat,lx,y,lz,w,hh,d)=>{const q=K.w(lx,lz),o=new THREE.Mesh(UBX,mat);o.position.set(q[0],y+K.y,q[1]);o.scale.set(w,hh,d);o.rotation.y=K.r;scene.add(o);return o;};
  neonBox(mp,0,h-0.55,5.2,23.6,0.12,0.12);neonBox(mb,0,0.75,5.2,23.6,0.1,0.1);neonBox(mp,-11.8,5,5.2,0.12,8.5,0.12);neonBox(mp,11.8,5,5.2,0.12,8.5,0.12);
  for(let i=0;i<5;i++)neonBox(i%2?mb:mp,-9+i*0.5,4.8,5.15,0.08,3.6-i*0.4,0.08);for(let i=0;i<5;i++)neonBox(i%2?mp:mb,9-i*0.5,4.8,5.15,0.08,3.6-i*0.4,0.08);
  /* enseigne néon en lettres lumineuses */
  const sg=K.sign('CLUB NÉON',0,6.4,5.2,12,2.2,{fg:'#ffd3f3',shadow:null,fs:0.82,draw:(g,W,H)=>{g.shadowColor='#ff3fbf';g.shadowBlur=26;}});
  sg.material.transparent=true;sg.material.alphaTest=0;sg.material.needsUpdate=true;sg.material.blending=THREE.AdditiveBlending;sg.material.depthWrite=false;
  /* entrée : porte, tapis rouge, cordons */
  K.fb(B,'f',12,0.5,0.01,3,3.1,0.04,0x2a0a1e);K.fb(B,'f',12,3.6,0,4.2,0.35,1.3,0x0f0f14);K.fb(B,'f',12,3.55,1.0,3.8,0.06,0.06,0xff3fbf,'neon');
  K.b(0,0,7.0,2.2,0.03,4,0xa3122e);
  [-1.6,1.6].forEach(dx=>{for(let i=0;i<4;i++){K.cy(dx,0,5.6+i*1.1,0.04,1.0,0xd8b04c,'metal',8);K.p('metal',sph(0.07,8,6),dx,1.03,5.6+i*1.1,0xd8b04c);K.cy(dx,0,5.6+i*1.1,0.15,0.05,0xd8b04c,'metal',10);}K.b(dx,0.82,7.25,0.05,0.05,3.3,0xb3122e);});
  K.person(2.3,6.0,Math.PI*0.15,0x111111,0x111111,{top:'veste',jacket:0x111111,glasses:true,style:'ras'});
  [[-2.4,6.6],[-2.6,7.6],[-2.3,8.6]].forEach((q,i)=>K.person(q[0],q[1],i*0.6-0.4,pick(SHIRTS),pick(PANTS)));
  /* affiches */
  [[-6.5,'SAMEDI\nDJ AURORA','#ff3fbf'],[6.5,'AFRO · HOUSE\nVENDREDI','#3fb5ff']].forEach(([px,t,c])=>K.sign(t,px,2.2,5.13,1.6,2.2,{bg:'#14121a',fg:c,border:c,fs:0.55}));
  K.roof(B,h,{units:2,pc:0x24232c,ph:0.6});
  /* projecteurs de toit (faisceaux la nuit) */
  const beams=[];[-7,7].forEach((dx,i)=>{K.cy(dx,h+0.6,-3,0.5,0.6,0x3a3f46,'metal',12);
    const g=new THREE.ConeGeometry(2.2,46,16,1,true);g.translate(0,23,0);const bm=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:i?0x7fd0ff:0xff8fe0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
    const q=K.w(dx,-3);bm.position.set(q[0],h+1.4,q[1]);scene.add(bm);beams.push(bm);});
  B22.anim.push(T=>{const hh=(gameMin/60)%24,sn=Math.sin((hh-6)/12*Math.PI),night=sn>0?1-clamp(sn*1.4,0,1):1,on=blackout>0?0:1;
    const k=(0.65+0.35*Math.sin(T*3.1))*on,k2=(0.65+0.35*Math.sin(T*3.1+2))*on;mp.color.setRGB(k,0.25*k,0.75*k);mb.color.setRGB(0.25*k2,0.7*k2,k2);sg.material.opacity=on?0.75+0.25*Math.sin(T*6)*Math.sin(T*1.3):0.15;
    beams.forEach((b,i)=>{b.material.opacity=night*0.11*on;b.rotation.set(0.35*Math.sin(T*0.6+i*2),0,0.35*Math.cos(T*0.5+i*1.7));});});
  K.col(-12,12,-7,5);
}


/* dalle de parvis hors des îlots (les lieux en bordure sont posés sur la chaussée) */
function slab22(K,x0,x1,z0,z1,c){K.b((x0+x1)/2,-0.16,(z0+z1)/2,x1-x0,0.16,z1-z0,c||0xa9a59c);K.b((x0+x1)/2,-0.16,z1,x1-x0+0.3,0.2,0.3,0xb8bcc0);}
function tree22(K,x,z,s){s=s||1;K.cy(x,0,z,0.16*s,2.4*s,0x6b4a2e,null,7,0.11*s);
  [[0,3.2,0,1.5],[0.7,2.8,0.3,1.0],[-0.6,2.9,-0.3,1.1],[0.1,3.9,-0.2,0.9]].forEach(q=>{let g=new THREE.IcosahedronGeometry(1,0);K.p(null,g,x+q[0]*s,q[1]*s,z+q[2]*s,pick([0x3f7a3a,0x4a8a44,0x356b35,0x5a8f4a]),q[3]*s,q[3]*s*0.85,q[3]*s);});
  A16.blobs.push({x:K.w(x,z)[0],z:K.w(x,z)[1],sx:3.6*s,sz:3.6*s});K.col(x-0.25,x+0.25,z-0.25,z+0.25,false);}
/* ================= HÔTEL DE POLICE ================= */
function police22(x,z){
  const K=new K22(x,z,0),B={cx:0,cz:0,w:18,d:11},gf=4,fh=3.3,top=gf+fh*2,navy=0x1f3a6e;
  slab22(K,-12,12,-7,12);
  K.b(0,0,0,18,top,11,0xf2f2ee);K.b(0,0,0,18.2,gf,11.2,navy);K.b(0,gf-0.15,0,18.4,0.3,11.4,0xe9e9e4);
  K.wins(B,'f',{rows:2,y0:gf+0.8,fh,ww:1.5,wh:1.7,pitch:3,frame:0xdfe3e6});
  ['l','r','b'].forEach(f=>K.wins(B,f,{rows:2,y0:gf+0.8,fh,ww:1.3,wh:1.7,pitch:3,frame:0xdfe3e6}));
  K.wins(B,'f',{cols:4,y0:1.0,ww:1.4,wh:1.6,margin:0.8,pitch:3,frame:0x16294d,skip:(k)=>k===1||k===2,rail:false});
  for(let k of [1.9,16.1])for(let i=0;i<6;i++)K.fb(B,'f',k-0.6+i*0.24,1.0,0.12,0.04,1.6,0.04,0x9aa1a8,'metal');
  K.fb(B,'f',9,0.15,0.02,3.2,3.0,0.05,0x8fb3cc,'glass');K.fb(B,'f',9,0.15,0.07,0.08,3.0,0.05,0x9aa1a8,'metal');
  K.b(0,3.55,6.4,6,0.25,2,0xe9e9e4);
  K.box22('POLICE',0,9.1,5.75,6.4,1.6,{bg:'#1f3a6e',fg:'#ffffff',fs:0.85,case:0x16294d});
  K.sign('HÔTEL DE POLICE',0,4.8,5.53,7,0.55,{fg:'#1f3a6e',lit:false,fs:0.9});
  K.fb(B,'f',9,top-0.6,0.02,18,0.18,0.05,0xd6283a);K.fb(B,'f',9,top-0.42,0.02,18,0.18,0.05,0xf4f4f0);K.fb(B,'f',9,top-0.24,0.02,18,0.18,0.05,0x1f3f99);
  /* lanterne bleue « POLICE » */
  K.b(2.2,2.7,5.7,0.08,0.08,0.5,0x22262a,'metal');K.b(2.2,2.35,6.0,0.5,0.55,0.5,0x2f7dff,'neon');K.sign('POLICE',2.2,2.62,6.26,0.48,0.16,{bg:'#2f7dff',fg:'#ffffff',fs:0.9,res:256});
  [[-9.1,5.6],[9.1,5.6]].forEach(q=>{K.b(q[0],top-1.2,q[1],0.25,0.25,0.35,0x22262a,'metal');K.b(q[0],top-1.45,q[1]+0.2,0.08,0.3,0.08,0x22262a,'metal');});
  K.flag(-10.5,7.5,'fr',9);K.flag(10.5,7.5,'eu',9);
  K.car(-5.5,9.5,Math.PI/2,0xf4f4f0,'police');K.car(5.5,9.5,-Math.PI/2,0xf4f4f0,'police');K.col(-7.9,-3.1,8.4,10.6);K.col(3.1,7.9,8.4,10.6);
  K.bollards(-2.5,2.5,6.9,4);
  K.b(-12.6,0,3,0.8,1.0,0.8,0xd6283a);K.b(-12.6,0.85,3,0.7,0.1,5.5,0xf4f4f0);for(let i=0;i<4;i++)K.b(-12.6,0.86,1+i*1.3,0.72,0.1,0.5,0xd6283a);
  K.roof(B,top,{units:2,pc:0xe6e6e2,ph:0.6});
  K.cy(5,top,-2,0.05,5,0x9aa1a8,'metal',6);K.b(5,top+4,-2,1.4,0.05,0.05,0x9aa1a8,'metal');
  K.col(-9,9,-5.5,5.5);
}
/* ================= GENDARMERIE ================= */
function gend22(x,z){
  const K=new K22(x,z,0),B={cx:0,cz:0,w:20,d:11},fh=3.4,top=fh*3+0.6,wall=0xebdfc3,blue=0x1f3a7a;
  slab22(K,-13,13,-7,13);
  K.b(0,0,0,20,top,11,wall);K.b(0,0,0,20.2,0.6,11.2,0xb7a98a);
  for(let i=1;i<3;i++)K.b(0,i*fh+0.3,0,20.3,0.14,11.3,0xf5efe0);
  K.wins(B,'f',{rows:3,y0:1.2,fh,ww:1.2,wh:1.7,pitch:2.9,frame:0xf4efe4,shut:blue,skip:(k,r)=>r===0&&(k===3||k===2)});
  ['l','r','b'].forEach(f=>K.wins(B,f,{rows:3,y0:1.2,fh,ww:1.2,wh:1.7,pitch:2.9,shut:blue}));
  K.fb(B,'f',10,0.6,0.02,2.6,2.8,0.06,blue);K.fb(B,'f',10,0.6,0.08,0.06,2.8,0.04,0xd8b04c,'metal');
  K.b(0,3.4,6.1,4,0.2,1.4,0x2a2e33);
  K.box22('GENDARMERIE NATIONALE',0,4.6,5.75,10,1.1,{bg:'#1f3a7a',fg:'#ffffff',fs:0.8,case:0x16294d});
  const roofG=gableGeo(20,11,3.2,0.5);K.p(null,roofG,0,top,0,0x4f5862);K.p(null,gableEnds(20,11,3.2),0,top,0,wall);
  /* grille d'enceinte avec portail ouvert */
  for(let xx=-12.5;xx<=12.5;xx+=0.18){if(Math.abs(xx)<3.2)continue;K.b(xx,0,10.8,0.04,1.9,0.04,0x1c1e21,'metal');}
  [-1,1].forEach(sg=>{K.b(sg*7.85,1.75,10.8,9.3,0.06,0.06,0x1c1e21,'metal');K.b(sg*7.85,0.3,10.8,9.3,0.06,0.06,0x1c1e21,'metal');K.b(sg*3.4,0,10.8,0.5,2.3,0.5,0xd9cdb5);K.col(sg>0?3.2:-12.6,sg>0?12.6:-3.2,10.6,11.0,false);});
  K.b(4.9,0,11.6,3.2,1.9,0.05,0x1c1e21,'metal');
  K.flag(-11.5,6,'fr',9);
  K.car(-6,7.8,Math.PI/2,0x1f3a7a,'police');K.col(-8.4,-3.6,6.7,8.9);
  K.col(-10,10,-5.5,5.5);
}
/* ================= PALAIS DE JUSTICE ================= */
function court22(x,z){
  const K=new K22(x,z,0),stone=0xe8e0cf;
  slab22(K,-12,12,-9,14);
  const T=temple22(K,{w:18,d:13,cz:-1,stone,title:'PALAIS DE JUSTICE',ncol:6,colH:8.6,pod:1.5,stairW:13,gold:'#3a3a3a',emblem:(y,zf,ph)=>{
    K.sign('',0,y+ph*0.42,zf+0.08,2.4,1.5,{draw:(g,W,H)=>{g.strokeStyle='#b8892c';g.fillStyle='#b8892c';g.lineWidth=10;g.beginPath();g.moveTo(W/2,H*0.12);g.lineTo(W/2,H*0.88);g.moveTo(W*0.2,H*0.25);g.lineTo(W*0.8,H*0.25);g.moveTo(W*0.36,H*0.88);g.lineTo(W*0.64,H*0.88);g.stroke();
      [[0.2],[0.8]].forEach(([px])=>{g.beginPath();g.moveTo(W*px,H*0.25);g.lineTo(W*(px-0.1),H*0.6);g.moveTo(W*px,H*0.25);g.lineTo(W*(px+0.1),H*0.6);g.stroke();g.beginPath();g.arc(W*px,H*0.6,W*0.1,0,Math.PI);g.fill();});}});}});
  /* coupole */
  const dy=T.top+1.5;K.cy(0,T.top+0.6,-2,3.4,2.2,stone,null,24);K.b(0,T.top+2.8,-2,7.2,0.25,7.2,shade(stone,1.06));
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;K.b(Math.cos(a)*3.42,T.top+1.0,-2+Math.sin(a)*3.42,0.5,1.3,0.12,0x34495e,'win',-a+Math.PI/2);}
  K.p(null,new THREE.SphereGeometry(3.3,24,12,0,Math.PI*2,0,Math.PI/2),0,T.top+2.9,-2,0x5d6873);
  K.cy(0,T.top+6.1,-2,0.5,1.2,stone,null,12);K.p(null,new THREE.ConeGeometry(0.6,0.8,12),0,T.top+7.7,-2,0x5d6873);K.cy(0,T.top+8.1,-2,0.05,1.2,0xc9a13c,'metal',6);
  K.flag(-9.8,7.6,'fr',10);K.flag(9.8,7.6,'eu',10);
  K.sign('LIBERTÉ · ÉGALITÉ · FRATERNITÉ',0,7.75,T.front-2.6+0.14,9,0.42,{fg:'#4a4a4a',lit:false,font:'Georgia, serif',fs:0.8,res:1024});
}
/* ================= MAISON D'ARRÊT ================= */
function prison22(x,z){
  const K=new K22(x,z,0),wc=0xaeaca3,H=6,X=14,Z=13;
  slab22(K,-X-3,X+3,-Z-3,Z+6,0x9c998f);
  const wall=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2,ry=Math.atan2(-(z1-z0),x1-x0);
    K.b(cx,0,cz,L,H,0.6,wc,null,ry);K.b(cx,H,cz,L+0.2,0.25,0.9,shade(wc,1.08),null,ry);
    const n=Math.floor(L/3);for(let i=1;i<n;i++){const t=i/n;K.b(x0+(x1-x0)*t,0.3,z0+(z1-z0)*t,0.66,H-0.6,0.66,shade(wc,0.93),null,ry);}
    const m=Math.floor(L/0.7);for(let i=0;i<m;i++){const t=(i+0.5)/m;K.p('metal',new THREE.TorusGeometry(0.32,0.025,4,10),x0+(x1-x0)*t,H+0.65,z0+(z1-z0)*t,0x8a9099,1,1,1,0,ry+Math.PI/2+0.3,0);}
    for(let i=0;i<m;i+=3){const t=(i+0.5)/m;K.b(x0+(x1-x0)*t,H+0.2,z0+(z1-z0)*t,0.05,0.9,0.05,0x5a6068,'metal',ry);}
    const b=K.col(Math.min(x0,x1)-0.3,Math.max(x0,x1)+0.3,Math.min(z0,z1)-0.3,Math.max(z0,z1)+0.3);return b;};
  wall(-X,-Z,X,-Z);wall(-X,-Z,-X,Z);wall(X,-Z,X,Z);wall(-X,Z,-3.4,Z);wall(3.4,Z,X,Z);
  /* poste d'entrée et portail coulissant (ouvert le jour) */
  K.b(-5.2,0,Z+1.6,3.6,4.2,3.2,0xc9c6bc);K.b(5.2,0,Z+1.6,3.6,4.2,3.2,0xc9c6bc);K.b(0,4.2,Z+1.6,14,0.5,3.4,0x6f747b);
  K.fb({cx:-5.2,cz:Z+1.6,w:3.6,d:3.2},'f',1.8,1.2,0,2,1.2,0.05,0x34495e,'win');K.fb({cx:5.2,cz:Z+1.6,w:3.6,d:3.2},'f',1.8,1.2,0,2,1.2,0.05,0x34495e,'win');
  K.box22("MAISON D'ARRÊT DE PORT-AURORE",0,5.3,Z+3.4,12,0.9,{bg:'#3a3f46',fg:'#f2f2ee',fs:0.75,case:0x2a2e33});
  K.b(-6.2,0,Z+0.1,5.6,3.8,0.25,0x5d646b,'metal');for(let i=0;i<8;i++)K.b(-8.6+i*0.7,0.2,Z+0.25,0.06,3.4,0.06,0x454b52,'metal');
  K.col(-7.1,-3.3,Z+0.1,Z+3.2);K.col(3.3,7.1,Z+0.1,Z+3.2);
  /* miradors */
  [[-X,-Z],[X,-Z],[-X,Z],[X,Z]].forEach(([tx,tz])=>{K.b(tx,0,tz,1.8,8,1.8,0xb9b6ad);K.b(tx,8,tz,3.2,0.3,3.2,0x8d8a84);
    K.b(tx,8.3,tz,3,2,3,0x9a978f);['f','b','l','r'].forEach(f=>K.fb({cx:tx,cz:tz,w:3,d:3},f,1.5,8.8,0,2.4,1.1,0.05,0x34495e,'win'));
    K.b(tx,10.3,tz,3.8,0.3,3.8,0x5d646b);const ix=-Math.sign(tx)*1.9,iz=-Math.sign(tz)*1.9;K.b(tx+ix*0.9,9.5,tz+iz*0.9,0.5,0.4,0.5,0xfff2b0,'neon');});
  /* bâtiment de détention : fentes à barreaux */
  const D={cx:0,cz:-8.2,w:20,d:7};K.b(0,0,-8.2,20,10,7,0xc9c6bc);K.b(0,10,-8.2,20.3,0.35,7.3,0x8d8a84);
  for(let r=0;r<3;r++)for(let k=0;k<12;k++){const u=1+k*1.64;K.fb(D,'f',u,1.4+r*3,0,0.38,1.4,0.05,0x23272c);for(let i=0;i<3;i++)K.fb(D,'f',u-0.12+i*0.12,1.4+r*3,0.06,0.03,1.4,0.03,0x8a9099,'metal');}
  K.col(-10,10,-11.7,-4.7);
  /* cour : panier de basket */
  K.cy(9.5,0,4,0.08,3.2,0x5a6068,'metal',8);K.b(9.5,2.9,4.4,1.2,0.8,0.06,0xf4f4f0);K.p('metal',new THREE.TorusGeometry(0.23,0.02,6,14),9.5,2.95,4.75,0xe0562a,1,1,1,Math.PI/2,0,0);
}


/* ================= CONCESSIONNAIRE ================= */
function dealer22(x,z){
  const K=new K22(x,z,0),B={cx:0,cz:-1,w:30,d:16},h=7.4,steel=0x3a4049;
  K.b(0,0,-1,30.4,0.22,16.4,0xdfe3e6);
  K.b(0,0,-8.75,30,h,0.5,0x17304a);K.sign('AUTO AURORE',0,5.2,-8.48,10,1.6,{fg:'#ffffff',fs:0.8});
  ['f','l','r'].forEach(f=>{K.fb(B,f,flen22(B,f)/2,0.22,-0.05,flen22(B,f)-0.2,h-0.2,0.04,0x8fb3cc,'glass');const L=flen22(B,f);for(let u=0;u<=L+0.01;u+=3)K.fb(B,f,u,0.22,-0.02,0.18,h-0.2,0.18,steel,'metal');K.fb(B,f,L/2,3.6,-0.02,L,0.14,0.14,steel,'metal');});
  K.b(0,h,-1,32.4,0.9,18.4,0xf2f4f5);K.b(0,h+0.9,-1,32.4,0.06,18.4,0xd8dcde);K.b(0,h-0.05,-1,30,0.05,16,0xffffff,'neon');
  K.fb(B,'f',15,h,1.2,32.4,0.9,0.04,0x17699a);K.sign('AUTO AURORE · VÉHICULES NEUFS & OCCASION',0,h+0.45,8.26,22,0.75,{fg:'#ffffff',fs:0.8,res:1024});
  K.fb(B,'f',15,0.22,0.02,4,3.2,0.05,0x17304a);K.fb(B,'f',15,0.22,0.07,0.06,3.2,0.04,0xc9d0d4,'metal');
  /* voitures exposées en vitrine */
  [[-9,-3,0xc0392b,'ferrari'],[0,-4,0xe8e8e8,'benz'],[9,-3,0xe0a526,'lambo']].forEach(([cx,cz,c,t],i)=>{K.cy(cx,0.22,cz,2.6,0.18,0xf4f4f0,null,32);K.cy(cx,0.4,cz,2.65,0.03,0x17699a,'neon',32);K.car(cx,cz,0.6-i*0.6,c,t).position.y=0.6;});
  K.b(-11,0.22,4,2.4,1.1,0.8,0xf4f4f0);K.b(-11,1.32,4,2.5,0.06,0.9,0x17304a);
  /* parc extérieur : voitures, prix, drapeaux, totem */
  [[-10,11.5,0x2e6fd1,'bmw','24 900 $'],[10,11.5,0x2b2b2b,'porsche','58 500 $'],[-4.5,14.5,0x2e9a6a,'jeep','31 200 $']].forEach(([cx,cz,c,t,pr],i)=>{K.car(cx,cz,Math.PI/2+(i-1)*0.4,c,t);K.col(cx-2.3,cx+2.3,cz-1.2,cz+1.2);K.cy(cx+2.6,0,cz+1.4,0.04,1.1,0x9aa1a8,'metal',6);K.sign(pr,cx+2.6,1.3,cz+1.42,1.2,0.42,{bg:'#f2c200',fg:'#1c1c1c',fs:0.8,back:true});});
  [-14,-7,7,14].forEach((fx,i)=>{K.cy(fx,0,17.8,0.04,4.8,0xd8dde0,'metal',6);K.sign(i%2?'OFFRES':'AUTO\nAURORE',fx+0.42,3.4,17.8,0.8,2.6,{bg:i%2?'#f2c200':'#17699a',fg:i%2?'#17304a':'#ffffff',fs:0.4,ry:Math.PI/2,back:true});});
  K.b(14,0,9.5,1.6,8,0.6,0xf2f4f5);K.b(14,7.2,9.5,1.7,0.8,0.65,0x17699a);K.sign('AUTO\nAURORE',14,5.5,9.82,1.4,2.2,{bg:'#17304a',fg:'#ffffff',fs:0.42});K.sign('ATELIER\nREPRISE\nCRÉDIT',14,2.5,9.82,1.4,2.4,{bg:'#f2f4f5',fg:'#17304a',fs:0.6});K.col(13.2,14.8,9.2,9.8,false);
  K.col(-15,15,-9,7);
}
/* ================= STATION-SERVICE ================= */
function fuel22(x,z){
  const K=new K22(x,z,0),green=0x1f8a55;
  K.b(0,0,4,30,0.04,26,0xc8c9c4);
  /* boutique */
  const S={cx:0,cz:-8,w:16,d:9};K.b(0,0,-8,16,4.4,9,0xf2f4f5);K.vitrine('kiosk',-1.5,0.3,-3.48,11,3.1);
  for(let u=0;u<=11;u+=2.2)K.fb(S,'f',2.5+u,0.3,0.03,0.12,3.15,0.08,0x3a4049,'metal');
  K.fb(S,'f',13.6,0.3,0.03,2.4,3.1,0.05,0x9fc0d4,'glass');
  K.fb(S,'f',8,3.5,0,16.3,1.0,0.35,green);K.sign('BOUTIQUE 24/24 · CAFÉ · LAVAGE',0,4.0,-3.13,12,0.75,{fg:'#ffffff',fs:0.8,res:1024});
  K.roof(S,4.4,{units:1,pc:0xe6e8e9,ph:0.5});K.col(-8,8,-12.5,-3.5);
  /* auvent */
  [[-7,1.5],[7,1.5],[-7,10.5],[7,10.5]].forEach(q=>{K.b(q[0],0,q[1],0.55,5.2,0.55,0xf2f4f5);K.b(q[0],0,q[1],0.6,1.0,0.6,green);K.col(q[0]-0.3,q[0]+0.3,q[1]-0.3,q[1]+0.3,false);});
  K.b(0,5.2,6,23,1.25,13,0xf6f7f7);K.b(0,5.15,6,22.6,0.05,12.6,0xfdfdf8,'neon');
  ['f','b','l','r'].forEach(f=>K.fb({cx:0,cz:6,w:23,d:13},f,flen22({cx:0,cz:6,w:23,d:13},f)/2,5.55,0.01,flen22({cx:0,cz:6,w:23,d:13},f),0.32,0.04,green,'neon'));
  K.sign('AURORA FUEL',-5,5.95,12.55,7,0.62,{fg:'#1f8a55',fs:0.9});K.sign('AURORA FUEL',5,5.95,-0.55,7,0.62,{fg:'#1f8a55',fs:0.9,ry:Math.PI});
  /* îlots et pompes */
  [-3.6,3.6].forEach(ix=>{K.b(ix,0,6,1.3,0.22,7.2,0xd9b43a);K.b(ix,0.22,6,1.1,0.03,7,0x9a9a92);
    [3.8,8.2].forEach(pz=>{K.b(ix,0.25,pz,0.9,1.95,0.6,0xf6f7f7);K.b(ix,2.2,pz,0.95,0.3,0.65,green);
      [1,-1].forEach(sg=>{K.b(ix,1.45,pz+sg*0.31,0.5,0.32,0.02,0x5affb0,'neon');[0xffffff,0x2e9a6a,0xf2c200].forEach((nc,k)=>{K.b(ix-0.3+k*0.3,0.85,pz+sg*0.33,0.12,0.3,0.08,nc);});});
      K.p('metal',new THREE.TorusGeometry(0.42,0.03,6,16,Math.PI),ix+0.48,1.2,pz,0x1c1e21,1,1,1,0,0,-Math.PI/2);});
    K.b(ix,0.22,2.2,0.5,0.9,0.3,0xd2262b);K.col(ix-0.7,ix+0.7,2.4,9.6,false);});
  /* totem des prix */
  K.b(13,0,13,2.2,7.5,0.6,0xf6f7f7);K.b(13,6.4,13,2.3,1.1,0.65,green);K.sign('AURORA',13,6.95,13.33,2.0,0.7,{fg:'#ffffff',fs:0.75});
  K.sign('',13,3.9,13.32,2.0,4.2,{bg:'#14181c',draw:(g,W,H)=>{const rows=[['SP95-E10','1,84'],['SP98','1,95'],['GAZOLE','1,76'],['GPL','0,99']];g.textBaseline='middle';
    rows.forEach((r,i)=>{const y=H*(0.14+i*0.24);g.fillStyle='#f4f4f0';g.font='700 '+Math.round(H*0.065)+'px Rajdhani, sans-serif';g.textAlign='left';g.fillText(r[0],W*0.08,y);g.fillStyle='#ffb020';g.font='700 '+Math.round(H*0.11)+'px "Courier New", monospace';g.textAlign='right';g.fillText(r[1],W*0.93,y+H*0.07);});}});
  K.col(11.9,14.1,12.7,13.3,false);
  K.b(-11.5,0,-1,0.8,1.5,0.6,0x2e6fd1);K.sign('AIR · EAU',-11.5,1.75,-0.69,0.8,0.3,{bg:'#2e6fd1',fg:'#ffffff',fs:0.8});
  K.car(-3.6+2.4,4.8,0,0x9aa3ad,'hyundai');K.col(-2.2,0.4,2.6,7.0);
}
/* rideau métallique (fermé) */
function shutter22(K,x,y0,z,w,h){K.b(x,y0,z,w,h,0.08,0x9aa1a8,'metal');for(let y=y0+0.15;y<y0+h;y+=0.18)K.b(x,y,z+0.045,w,0.04,0.02,0x7a8189,'metal');K.b(x,y0+h,z+0.12,w+0.3,0.45,0.3,0x5a6068);}
/* ================= GARAGE ================= */
function garage22(x,z){
  const K=new K22(x,z,Math.PI),B={cx:0,cz:-1,w:26,d:14},h=6.8,clad=0x6f8293;
  K.b(0,0,-8,26,h,0.3,clad);K.b(-12.85,0,-1,0.3,h,14,clad);K.b(12.85,0,-1,0.3,h,14,clad);K.b(0,h-0.1,-1,26.4,0.35,14.4,0x5a6068);
  K.b(0,0,-1,25.4,0.04,13.4,0x8a8d8f);
  const fz=5.85,doors=[-7.5,0,7.5];K.b(-11.5,0,fz,3,h,0.3,clad);K.b(11.5,0,fz,3,h,0.3,clad);[-3.75,3.75].forEach(px=>K.b(px,0,fz,3.5,h,0.3,clad));
  doors.forEach(dx=>K.b(dx,4.4,fz,4,h-4.4,0.3,clad));
  for(let u=-12.8;u<=12.8;u+=0.4)K.b(u,0.2,fz+0.17,0.06,h-0.4,0.05,shade(clad,0.82));
  shutter22(K,-7.5,0,fz+0.1,4,4.4);shutter22(K,7.5,0,fz+0.1,4,4.4);
  K.b(0,4.4,fz+0.25,4.3,0.45,0.35,0x5a6068);
  /* atelier ouvert : pont élévateur, voiture levée, établi, panneau d'outils */
  [-1.4,1.4].forEach(dx=>{K.b(dx,0,2,0.35,3.6,0.35,0xd2262b);K.b(dx,1.55,2,0.2,0.12,2.2,0x3a3f46);});
  const lifted=K.car(0,2,0,0x2e6fd1,'toyota');lifted.position.y+=1.65;
  K.b(0,0,-7.4,4.5,0.95,0.8,0x6b4a2e);K.b(0,0.95,-7.4,4.6,0.08,0.85,0x8a6440);K.b(0,1.6,-7.75,4.2,1.6,0.05,0x2a2e33);
  for(let i=0;i<14;i++)K.b(-1.9+(i%7)*0.62,1.8+Math.floor(i/7)*0.7,-7.7,0.08,0.45,0.04,pick([0xd2262b,0xf2c200,0x9aa1a8,0x2e6fd1]),'metal');
  K.b(0,h-0.5,0,6,0.08,0.4,0xfdfdf8,'neon');
  K.b(-4.6,0,-6,0.9,1.1,0.7,0xd2262b);K.cy(4.5,0,-6.5,0.35,1.0,0x2e6fd1,null,12);K.cy(5.4,0,-6.5,0.35,1.0,0xd2262b,null,12);
  /* enseigne et abords */
  K.b(0,h,fz,26,1.3,0.4,0xf2f4f5);K.sign('GARAGE AURORE · MÉCANIQUE · PNEUS · CARROSSERIE',0,h+0.65,fz+0.22,24,0.95,{fg:'#24344a',fs:0.8,res:1024});
  const tyres=(tx,tz,n)=>{for(let i=0;i<n;i++){K.p(null,new THREE.TorusGeometry(0.32,0.14,6,14),tx,0.14+i*0.27,tz,0x1c1c1c,1,1,1,Math.PI/2,0,0);}K.col(tx-0.5,tx+0.5,tz-0.5,tz+0.5,false);};
  tyres(-11.5,7.4,5);tyres(-10.4,7.6,4);tyres(-11,8.6,3);
  [[10.6,7.4,0x2e6fd1],[11.5,7.6,0xd2262b],[11.0,8.5,0x2e6fd1]].forEach(([dx,dz,c])=>{K.cy(dx,0,dz,0.32,0.95,c,null,12);K.cy(dx,0.95,dz,0.33,0.04,shade(c,0.7),null,12);});K.col(10.1,12,7,9,false);
  K.car(-7.5,11,0.15,0xc0392b,'sedan');K.col(-8.7,-6.3,8.7,13.3);
  K.cy(13.5,0,7,0.06,3.6,0x9aa1a8,'metal',8);K.sign('PNEUS\nVIDANGE',13.5,3.0,7.07,1.4,1.2,{bg:'#f2c200',fg:'#24344a',fs:0.7,back:true});
  K.col(-13,13,-8.15,-7.85);K.col(-13,-12.7,-8,6);K.col(12.7,13,-8,6);K.col(-13,-9.75,5.7,6);K.col(-5.5,-2,5.7,6);K.col(2,5.5,5.7,6);K.col(9.75,13,5.7,6);K.col(-9.5,-5.5,5.7,6);K.col(5.5,9.5,5.7,6);
  K.col(-1.7,-1.1,1.8,2.2,false);K.col(1.1,1.7,1.8,2.2,false);
}
/* ================= AUTO-ÉCOLE ================= */
function school22(x,z){
  const K=new K22(x,z,Math.PI),B={cx:0,cz:2,w:16,d:10},gf=3.8,fh=3.2,top=gf+fh,wall=0xf1e6cf;
  K.b(0,0,2,16,top,10,wall);K.b(0,0,2,16.2,0.5,10.2,0xb9ab8c);
  K.vitrine('office',-2.5,0.5,7.03,8,2.6);for(let u=0;u<=8;u+=2)K.fb(B,'f',2+u,0.5,0.03,0.1,2.7,0.08,0x2a2e33,'metal');
  K.fb(B,'f',13,0.5,0.02,2,2.8,0.05,0x8fb3cc,'glass');
  K.fb(B,'f',8,3.0,0,16.3,0.85,0.4,0xd2262b);K.sign('AUTO-ÉCOLE AURORE · PERMIS B · MOTO · POIDS LOURD',0,3.43,7.42,15,0.62,{fg:'#ffffff',fs:0.8,res:1024});
  K.wins(B,'f',{rows:1,y0:gf+0.6,fh,ww:1.2,wh:1.7,pitch:3,shut:0x3a5f7f});['l','r','b'].forEach(f=>K.wins(B,f,{rows:2,y0:1.2,fh:3.3,ww:1.2,wh:1.6,pitch:3,shut:0x3a5f7f}));
  K.p(null,gableGeo(16,10,3,0.5),0,top,2,0xb5603f);K.p(null,gableEnds(16,10,3),0,top,2,wall);
  /* voiture double commande avec bandeau de toit */
  const car=K.car(-5,12,Math.PI/2,0xf4f4f0,'honda');K.col(-7.3,-2.7,10.9,13.1);
  K.b(-5,1.62,12,0.5,0.45,1.5,0xf4f4f0);K.sign('AUTO-ÉCOLE',-4.74,1.85,12,1.4,0.36,{bg:'#ffffff',fg:'#d2262b',fs:0.8,ry:Math.PI/2,back:true});
  /* plateau : plots, panneaux */
  for(let i=0;i<8;i++){const cx=4+(i%4)*2.2,cz=12+Math.floor(i/4)*5;K.p(null,new THREE.ConeGeometry(0.25,0.7,10),cx,0.35,cz,0xff6a1a);K.cy(cx,0.42,cz,0.17,0.08,0xf4f4f0,null,10);}
  K.cy(12.5,0,10,0.04,2.4,0x9aa1a8,'metal',6);K.p(null,new THREE.CylinderGeometry(0.42,0.42,0.05,8),12.5,2.4,10.05,0xd2262b,1,1,1,Math.PI/2,0,0);K.sign('STOP',12.5,2.4,10.09,0.6,0.25,{fg:'#ffffff',fs:0.95,res:256});
  K.cy(12.5,0,15,0.04,2.4,0x9aa1a8,'metal',6);K.p(null,new THREE.CylinderGeometry(0.5,0.5,0.05,3),12.5,2.3,15.05,0xd2262b,1,1,1,Math.PI/2,0,Math.PI);K.p(null,new THREE.CylinderGeometry(0.33,0.33,0.06,3),12.5,2.31,15.07,0xf4f4f0,1,1,1,Math.PI/2,0,Math.PI);
  K.col(-8,8,-3,7);
}
/* ================= MAIRIE : beffroi à horloge et drapeaux ================= */
function mairieExtra22(L){
  const K=new K22(L.x,L.z,0,0),y=8.6;
  K.b(0,y,-11,3.6,4.2,3.6,0xe8e2d4);K.b(0,y+4.2,-11,4,0.3,4,0xd8d0c0);
  K.sign('',0,y+2.6,-9.18,2.2,2.2,{draw:(g,W,H)=>{g.fillStyle='#f6f1e4';g.beginPath();g.arc(W/2,H/2,W*0.46,0,7);g.fill();g.strokeStyle='#2b3445';g.lineWidth=W*0.03;g.stroke();g.lineCap='round';
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;g.beginPath();g.moveTo(W/2+Math.cos(a)*W*0.36,H/2+Math.sin(a)*W*0.36);g.lineTo(W/2+Math.cos(a)*W*0.42,H/2+Math.sin(a)*W*0.42);g.stroke();}
    g.lineWidth=W*0.035;g.beginPath();g.moveTo(W/2,H/2);g.lineTo(W/2,H*0.2);g.stroke();g.beginPath();g.moveTo(W/2,H/2);g.lineTo(W*0.7,H*0.56);g.stroke();},lit:false});
  K.cy(0,y+4.5,-11,1.3,1.6,0xe8e2d4,null,12);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;K.b(Math.cos(a)*1.32,y+4.8,-11+Math.sin(a)*1.32,0.4,1.0,0.1,0x2b3445,null,-a+Math.PI/2);}
  K.p(null,new THREE.SphereGeometry(1.4,16,8,0,Math.PI*2,0,Math.PI/2),0,y+6.1,-11,0x4a5a6a);K.cy(0,y+7.4,-11,0.04,1.8,0xc9a13c,'metal',6);
  K.flag(-8.6,-1.6,'fr',7.5);K.flag(8.6,-1.6,'eu',7.5);
  K.sign('LIBERTÉ · ÉGALITÉ · FRATERNITÉ',0,6.0,-3.24,9,0.4,{fg:'#2b3445',lit:false,font:'Georgia, serif',fs:0.8,res:1024});
}


/* ================= PARVIS DES ÎLOTS REPÈRES ================= */
const CARTYPES22=['sedan','suv','toyota','honda','hyundai','benz','bmw','jeep','sedan','ford'];
function parking22(K,cx,cz,w,d,fill){
  K.b(cx,0,cz,w,0.02,d,0x3b3f45);
  const bw=2.7,bd=5.2,nb=Math.floor((w-1)/bw),x0=cx-nb*bw/2;
  [[cz-d/2+bd/2+0.4,0],[cz+d/2-bd/2-0.4,Math.PI]].forEach(([rz,ry])=>{
    for(let k=0;k<=nb;k++)K.b(x0+k*bw,0.02,rz,0.12,0.01,bd,0xf0f0e6);
    K.b(cx,0.02,rz+(ry?-1:1)*bd/2,nb*bw,0.01,0.12,0xf0f0e6);
    for(let k=0;k<nb;k++){if(Math.random()>(fill||0.55))continue;const x=x0+(k+0.5)*bw;K.car(x,rz,ry+rand(-0.04,0.04),pick(CAR_COLORS),pick(CARTYPES22));K.col(x-1.05,x+1.05,rz-2.2,rz+2.2);}
  });
  for(let k=0;k<3;k++)K.b(cx-1.6+k*1.6,0.02,cz,0.9,0.01,0.25,0xf0f0e6);
}
function playground22(K,x,z){
  K.b(x,0,z,9,0.03,7,0x4f8a50);K.b(x+2,0.03,z,3.4,0.06,3.4,0xe5cf98);
  [-1,1].forEach(s=>{K.b(x-2.2+s*1.4,0,z-1.5,0.1,2.4,0.1,0xd2262b,'metal');K.b(x-2.2+s*1.4,0,z+0.5,0.1,2.4,0.1,0xd2262b,'metal');});
  K.b(x-2.2,2.35,z-0.5,3,0.1,0.1,0xd2262b,'metal');[-0.6,0.6].forEach(dx=>{K.b(x-2.2+dx,0.95,z-0.5,0.02,1.4,0.02,0x9aa1a8,'metal');K.b(x-2.2+dx,0.55,z-0.5,0.5,0.06,0.25,0xf2c200);});
  K.b(x+2.6,0,z-2.6,0.9,1.8,0.9,0x2e6fd1);K.p(null,UBX,x+2.6,1.0,z-1.2,0xf2c200,0.8,0.08,2.6,-0.6,0,0);
  K.col(x-3.8,x-0.6,z-1.7,z+0.7,false);K.col(x+2.1,x+3.1,z-3.1,z-2.1,false);
}
function forecourt22(key,cx,cz){
  const K=new K22(cx,cz,0);
  if(key==='0,2'){parking22(K,-2,15,42,18,0.6);[-21,-15,-9].forEach(x=>tree22(K,x,2.6,0.9));K.planter(10,2.5,5,1);K.sign('P',23,3.2,4.0,0.9,0.9,{bg:'#1e5fae',fg:'#ffffff',fs:0.85,back:true});K.cy(23,0,4,0.06,2.8,0x9aa1a8,'metal',8);}
  else if(key==='1,0'){parking22(K,0,14,46,18,0.65);[-20,20].forEach(x=>tree22(K,x,2.6,0.9));K.b(0,0,4.2,46,0.12,0.4,0x9a9a92);}
  else if(key==='1,1'){parking22(K,0,15,46,16,0.5);K.cy(-19,0,3,0.06,2.6,0x9aa1a8,'metal',8);K.sign('TAXI',-19,2.6,3.05,1.2,0.5,{bg:'#f5c400',fg:'#1c1c1c',fs:0.8,back:true});tree22(K,19,3,0.9);}
  else if(key==='-1,0'){
    K.b(0,0,12,46,0.02,22,0xcfc6b2);for(let x=-21;x<=21;x+=3)K.b(x,0.02,12,0.08,0.01,22,0xb9ae96);
    K.b(0,0,13,2.4,1.4,2.4,0xd9cdb5);K.b(0,1.4,13,2.0,0.25,2.0,0xc9bda4);K.person(0,13,Math.PI,0x7a6a3a,0x7a6a3a,{top:'veste',jacket:0x6e5a2a}).position.y=1.7+0.16;
    K.col(-1.2,1.2,11.8,14.2,false);
    [[-14,7],[14,7],[-14,18],[14,18],[-7,21],[7,21]].forEach(q=>tree22(K,q[0],q[1],1));
    K.bench(-7,9,0);K.bench(7,9,0);K.bench(-7,17,Math.PI);K.bench(7,17,Math.PI);
    [[-20,4],[20,4],[-20,20],[20,20]].forEach(q=>K.lamp(q[0],q[1]));
  }
  else if(key==='-1,1'){
    K.b(-11,0,13,24,0.03,20,0x4f8a50);playground22(K,-12,12);
    [[-21,5],[-21,21],[-4,21],[-3,5]].forEach(q=>tree22(K,q[0],q[1],1));K.bench(-12,20,Math.PI);K.bench(-17,5,0);
    parking22(K,12,14,22,18,0.6);
  }
}
/* ================= COMMERCES DE RUE : croix de pharmacie, terrasse de café, portant ================= */
function shopsExtra22(){
  spots.forEach(sp=>{
    if(!['pharma','cafe','boutique'].includes(sp.id))return;
    const fz=sp.z-2.3,K=new K22(sp.x,fz,0);
    if(sp.id==='pharma'){
      const bx=4.8;K.b(bx,4.9,0.45,0.08,0.08,0.9,DARK22,'metal');
      const g=new THREE.Group(),m=new THREE.MeshBasicMaterial({color:0x22e07a});
      [[0.42,1.3],[1.3,0.42]].forEach(([w,h])=>{const c=new THREE.Mesh(new THREE.BoxGeometry(0.12,h,w),m);g.add(c);});
      const frame=new THREE.Mesh(new THREE.BoxGeometry(0.1,1.5,1.5),new THREE.MeshLambertMaterial({color:0xf4f4f0}));frame.position.x=-0.02;g.add(frame);
      K.place(g,bx,4.4,1.0,0);B22.anim.push(T=>{const k=0.55+0.45*Math.abs(Math.sin(T*1.6));m.color.setRGB(0.13*k,0.88*k,0.48*k);});
    }else if(sp.id==='cafe'){
      [-6.2,-3.4,3.4,6.2].forEach((tx,i)=>{const tz=1.6;K.cy(tx,0,tz,0.05,0.75,DARK22,'metal',8);K.cy(tx,0.75,tz,0.38,0.04,0xe8e2d6,null,16);
        [-0.65,0.65].forEach(dx=>{K.b(tx+dx,0,tz,0.4,0.45,0.4,0x6b3f2a);K.b(tx+dx+(dx>0?0.18:-0.18),0.45,tz,0.05,0.45,0.4,0x6b3f2a);});
        K.cy(tx,0.8,tz,0.03,1.6,0xdcdcdc,'metal',6);K.p(null,new THREE.ConeGeometry(1.3,0.45,10),tx,2.5,tz,i%2?0xf4efe4:0x6b3f2a);
        K.col(tx-0.9,tx+0.9,tz-0.3,tz+0.3,false);});
      K.b(-1.6,0,0.5,0.6,1.0,0.05,0x2a2e33);K.sign('MENU\nCafé 2 $\nCroissant 3 $',-1.6,0.75,0.53,0.55,0.8,{bg:'#1f2a24',fg:'#f4efe4',fs:0.5,res:256});
    }else{
      K.b(-5,0,0.9,1.8,0.05,0.5,0x9aa1a8,'metal');[-0.85,0.85].forEach(dx=>K.b(-5+dx,0,0.9,0.05,1.6,0.05,0x9aa1a8,'metal'));K.b(-5,1.55,0.9,1.8,0.05,0.05,0x9aa1a8,'metal');
      for(let i=0;i<6;i++)K.b(-5.7+i*0.28,0.6,0.9,0.22,0.9,0.45,pick([0xc0392b,0x2e6fd1,0xf4f1ea,0x7b4bb3,0xe0a526,0x1c1c1c]));
      K.b(4.6,0,0.8,0.7,1.0,0.5,0x2a2e33);K.sign('SOLDES\n-50 %',4.6,0.6,1.06,0.6,0.7,{bg:'#d2262b',fg:'#ffffff',fs:0.6,res:256});
      K.col(-6,-4,0.6,1.2,false);
    }
  });
}
const _buildFronts22=buildFronts;buildFronts=function(){_buildFronts22();try{shopsExtra22();}catch(e){console.warn('v22 commerces',e);}};
/* lieux en bordure de ville et coins d'îlots */
const _buildPhase2_22=buildPhase2;buildPhase2=function(){_buildPhase2_22();mats22();
  const L=[[police22,-240,-48],[gend22,240,-88],[court22,-240,50],[prison22,240,40],[dealer22,-192,-192],[fuel22,192,-192],[garage22,-192,128],[school22,192,128]];
  L.forEach(([f,x,z])=>{try{f(x,z);}catch(e){console.warn('v22',f.name,e);}});
  try{mairieExtra22({x:-240,z:-120});}catch(e){console.warn('v22 mairie',e);}
};

/* ================= interception des générateurs ================= */
const LM22_POS=[[0,-14,'job'],[64,-10,'shop'],[-64,-10,'bank'],[-64,54,'home'],[64,54,'club'],[0,116,'hospital']];
const LM22_SIGNS=['PÔLE EMPLOI','SUPÉRETTE','BANQUE','APPARTS','CLUB NÉON','HÔPITAL'];
const LM22_FN={hospital:hospital22,bank:bank22,job:job22,shop:shop22,home:home22,club:club22};
const _addBuilding22=addBuilding;
addBuilding=function(cx,cz,w,d,h,mi,o){
  const t=LM22_POS.find(q=>Math.abs(q[0]-cx)<0.1&&Math.abs(q[1]-cz)<0.1);
  if(t&&LM22_FN[t[2]]){mats22();try{LM22_FN[t[2]](cx,cz);B22.built[t[2]]=1;}catch(e){console.warn('v22',t[2],e);return _addBuilding22(cx,cz,w,d,h,mi,o);}return null;}
  return _addBuilding22(cx,cz,w,d,h,mi,o);
};
const _addSign22=addSign;
addSign=function(text,cx,frontZ,y,w,h,bg,fg){
  const k=LM22_SIGNS.indexOf(text);if(k>=0&&B22.built[LM22_POS[k][2]])return;
  return _addSign22(text,cx,frontZ,y,w,h,bg,fg);
};
/* les anciens ajouts (colonnes de banque, croix, néons collés) sont remplacés */
buildLandmarks=function(){};
/* collines repoussées : les lieux en bordure de ville (mairie, police, tribunal…) redeviennent visibles */
buildHills=function(){
  for(let i=0;i<30;i++){
    const a=-Math.PI*0.06-i/29*Math.PI*1.12,r=rand(318,352),x=Math.cos(a)*r,z=Math.sin(a)*r*1.02;
    let g=new THREE.IcosahedronGeometry(1,1);if(g.index)g=g.toNonIndexed();const p=g.attributes.position;
    for(let k=0;k<p.count;k++){const y=p.getY(k);p.setY(k,y<0?y*0.1:y*(1+0.12*Math.sin(p.getX(k)*4+i)));}
    g.computeVertexNormals();
    const m=new THREE.Mesh(g,lamb(pick([0x4f7a55,0x5d7f5a,0x58775a,0x6b8a6e])));m.scale.set(rand(50,85),rand(18,44),rand(26,40));m.rotation.y=a+Math.PI/2;m.position.set(x,-2,z);scene.add(m);
  }
};
function flush22(){
  const M=mats22();
  ['win','glass','neon','metal'].forEach(k=>{if(!B22[k].length)return;const m=new THREE.Mesh(mergeParts(B22[k]),M[k]);m.castShadow=k!=='glass'&&k!=='neon';m.receiveShadow=k!=='neon';if(k==='glass')m.renderOrder=2;scene.add(m);B22[k].length=0;});
}
const _buildDecor22=buildDecor;buildDecor=function(){flush22();_buildDecor22();};
const _updateDecor22=updateDecor;updateDecor=function(dt){_updateDecor22(dt);const T=performance.now()*0.001;for(let i=0;i<B22.anim.length;i++)B22.anim[i](T,dt);};
