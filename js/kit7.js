'use strict';
/* ---------- v7 : kit de modélisation (formes arrondies, tissus, bois, marbre, reflets) ---------- */
const TX7={},GE7={},MT7={},ENV7={out:null,inn:null};
const hx7=(h,k)=>{k=k==null?1:k;const r=clamp(((h>>16)&255)*k,0,255)|0,g=clamp(((h>>8)&255)*k,0,255)|0,b=clamp((h&255)*k,0,255)|0;return 'rgb('+r+','+g+','+b+')';};
function ctex(key,w,h,draw){
  if(TX7[key])return TX7[key];
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;TX7[key]=t;return t;
}
function rep(t,rx,ry){const k=t.clone();k.repeat.set(rx,ry==null?rx:ry);k.needsUpdate=true;return k;}
function grain(g,W,H,n,a){for(let i=0;i<n;i++){const v=Math.random();g.fillStyle=v<.5?'rgba(0,0,0,'+(v*a)+')':'rgba(255,255,255,'+((v-.5)*a)+')';g.fillRect(Math.random()*W,Math.random()*H,2,2);}}
/* parquet : lames décalées, veinage, joints */
function woodTex(base,var_){return ctex('wood'+base+(var_||''),512,512,(g,W,H)=>{
  for(let r=0;r<8;r++){let x=-Math.random()*280;
    while(x<W){const L=180+Math.random()*240,k=.84+Math.random()*.28;g.fillStyle=hx7(base,k);g.fillRect(x,r*64,L,64);
      for(let i=0;i<16;i++){g.strokeStyle='rgba(50,25,8,'+(.04+Math.random()*.09)+')';g.lineWidth=.6+Math.random()*1.6;g.beginPath();
        const y0=r*64+Math.random()*64,a=Math.random()*6,f=.006+Math.random()*.02;for(let xx=x;xx<=x+L;xx+=6)g.lineTo(xx,y0+Math.sin(xx*f+a)*2.5);g.stroke();}
      if(Math.random()<.35){g.fillStyle='rgba(60,30,10,.18)';g.beginPath();g.ellipse(x+Math.random()*L,r*64+20+Math.random()*24,9,4,0,0,7);g.fill();}
      g.fillStyle='rgba(25,12,2,.55)';g.fillRect(x,r*64,2,64);x+=L;}
    g.fillStyle='rgba(25,12,2,.55)';g.fillRect(0,r*64,W,2);g.fillStyle='rgba(255,255,255,.06)';g.fillRect(0,r*64+2,W,2);}
});}
/* carrelage : joints, variations, damier optionnel */
function tileTex7(a,b,grout,n,check){return ctex('tile'+a+b+grout+n+check,512,512,(g,W,H)=>{
  const s=W/n;g.fillStyle=hx7(grout);g.fillRect(0,0,W,H);
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const c=check&&((i+j)%2)?b:a,k=.94+Math.random()*.1;g.fillStyle=hx7(c,k);g.fillRect(i*s+2,j*s+2,s-4,s-4);
    const gr=g.createLinearGradient(i*s,j*s,i*s+s,j*s+s);gr.addColorStop(0,'rgba(255,255,255,.10)');gr.addColorStop(1,'rgba(0,0,0,.06)');g.fillStyle=gr;g.fillRect(i*s+2,j*s+2,s-4,s-4);}
  grain(g,W,H,1500,.05);
});}
/* marbre : fond laiteux et veines */
function marbleTex(base,vein){return ctex('marble'+base+vein,512,512,(g,W,H)=>{
  g.fillStyle=hx7(base);g.fillRect(0,0,W,H);grain(g,W,H,4000,.06);
  for(let v=0;v<9;v++){let x=Math.random()*W,y=0;g.strokeStyle=hx7(vein,1)+'';g.globalAlpha=.12+Math.random()*.25;g.lineWidth=.6+Math.random()*2.2;g.beginPath();g.moveTo(x,y);
    while(y<H){x+=(Math.random()-.5)*26;y+=8+Math.random()*12;g.lineTo(x,y);}g.stroke();}
  g.globalAlpha=1;g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=2;for(let i=0;i<=2;i++){g.beginPath();g.moveTo(i*256,0);g.lineTo(i*256,H);g.moveTo(0,i*256);g.lineTo(W,i*256);g.stroke();}
});}
/* tissu : trame fine */
function fabricTex(base){return ctex('fab'+base,256,256,(g,W,H)=>{
  g.fillStyle=hx7(base);g.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=3){g.fillStyle='rgba(0,0,0,'+(.03+Math.random()*.05)+')';g.fillRect(0,y,W,1);}
  for(let x=0;x<W;x+=3){g.fillStyle='rgba(255,255,255,'+(.02+Math.random()*.04)+')';g.fillRect(x,0,1,H);}
  grain(g,W,H,1800,.07);
});}
/* enduit mural */
function plasterTex(base,stripe){return ctex('pl'+base+stripe,256,256,(g,W,H)=>{
  g.fillStyle=hx7(base);g.fillRect(0,0,W,H);grain(g,W,H,3000,.045);
  if(stripe){for(let x=0;x<W;x+=32){g.fillStyle='rgba(255,255,255,.07)';g.fillRect(x,0,14,H);}}
});}
function concreteTex(base){return ctex('cc'+base,512,512,(g,W,H)=>{g.fillStyle=hx7(base);g.fillRect(0,0,W,H);grain(g,W,H,9000,.09);
  for(let i=0;i<40;i++){g.fillStyle='rgba(0,0,0,'+(Math.random()*.05)+')';g.beginPath();g.ellipse(Math.random()*W,Math.random()*H,10+Math.random()*60,6+Math.random()*30,Math.random()*3,0,7);g.fill();}});}
/* tapis : bordure + motif */
function rugTex(a,b,c,kind){return ctex('rug'+a+b+c+kind,512,512,(g,W,H)=>{
  g.fillStyle=hx7(a);g.fillRect(0,0,W,H);g.strokeStyle=hx7(b);g.lineWidth=18;g.strokeRect(22,22,W-44,H-44);g.strokeStyle=hx7(c);g.lineWidth=5;g.strokeRect(46,46,W-92,H-92);
  g.fillStyle=hx7(b);
  if(kind===1){for(let i=0;i<6;i++)for(let j=0;j<6;j++){const x=96+i*64,y=96+j*64;g.save();g.translate(x,y);g.rotate(Math.PI/4);g.fillRect(-12,-12,24,24);g.restore();}}
  else{for(let i=0;i<10;i++){g.globalAlpha=.5;g.fillStyle=hx7(i%2?b:c);g.beginPath();g.arc(W/2,H/2,190-i*18,0,7);g.fill();}g.globalAlpha=1;}
  grain(g,W,H,9000,.12);
});}
/* tableaux */
function artTex(v){return ctex('art'+v,256,320,(g,W,H)=>{
  if(v===0){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#f7b267');gr.addColorStop(.55,'#f4845f');gr.addColorStop(.56,'#2a6f97');gr.addColorStop(1,'#013a63');g.fillStyle=gr;g.fillRect(0,0,W,H);
    g.fillStyle='#ffe8a3';g.beginPath();g.arc(W*.62,H*.47,34,0,7);g.fill();g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<12;i++)g.fillRect(W*.62-40+Math.random()*80,H*.6+i*8,30+Math.random()*30,2);}
  else if(v===1){g.fillStyle='#efe6d8';g.fillRect(0,0,W,H);[['#d1495b',30,40,120,140],['#00798c',110,120,120,150],['#edae49',40,190,90,90],['#30638e',150,40,70,70]].forEach(a=>{g.fillStyle=a[0];g.fillRect(a[1],a[2],a[3],a[4]);});g.strokeStyle='#1d1d1d';g.lineWidth=5;g.strokeRect(30,40,200,240);}
  else if(v===2){g.fillStyle='#e9efe6';g.fillRect(0,0,W,H);for(let i=0;i<9;i++){g.strokeStyle='#3c6e47';g.lineWidth=3;const a=-1.2+i*.3;g.beginPath();g.moveTo(W/2,H-30);g.quadraticCurveTo(W/2+Math.cos(a)*40,H/2,W/2+Math.cos(a)*100,60+Math.abs(i-4)*20);g.stroke();
      g.fillStyle=i%2?'#5c946e':'#80b192';g.beginPath();g.ellipse(W/2+Math.cos(a)*100,60+Math.abs(i-4)*20,16,30,a,0,7);g.fill();}}
  else{g.fillStyle='#22223b';g.fillRect(0,0,W,H);for(let i=0;i<5;i++){g.strokeStyle=['#f2e9e4','#c9ada7','#9a8c98','#4a4e69','#f2cc8f'][i];g.lineWidth=10;g.beginPath();g.arc(W/2,H/2,20+i*22,i,i+3.6);g.stroke();}}
  grain(g,W,H,2500,.08);
});}
/* ----- géométries ----- */
function rbox(w,h,d,r,s){
  const key='rb'+[w,h,d,r,s].map(v=>(+v||0).toFixed(3)).join(',');if(GE7[key])return GE7[key];
  s=s||3;r=Math.max(.002,Math.min(r,w/2-1e-3,h/2-1e-3,d/2-1e-3));
  const n=2*s+1,g=new THREE.BoxGeometry(1,1,1,n,n,n),p=g.attributes.position,nr=g.attributes.normal,A=[w/2,h/2,d/2],v=new THREE.Vector3();
  const map=(u,a)=>{const i=Math.round((u+.5)*n);return i<=s?-a+r*(i/s):(a-r)+r*((i-s-1)/s);};
  for(let i=0;i<p.count;i++){
    const q=[map(p.getX(i),A[0]),map(p.getY(i),A[1]),map(p.getZ(i),A[2])],c=q.map((u,k)=>clamp(u,-(A[k]-r),A[k]-r));
    v.set(q[0]-c[0],q[1]-c[1],q[2]-c[2]);const L=v.length();
    if(L>1e-6){v.multiplyScalar(1/L);p.setXYZ(i,c[0]+v.x*r,c[1]+v.y*r,c[2]+v.z*r);nr.setXYZ(i,v.x,v.y,v.z);}else p.setXYZ(i,q[0],q[1],q[2]);
  }
  g.computeBoundingSphere();GE7[key]=g;return g;
}
/* coussin : boîte arrondie bombée */
function cushion(w,h,d,r,b){
  const key='cu'+[w,h,d,r,b].join(',');if(GE7[key])return GE7[key];
  const g=rbox(w,h,d,r,4).clone(),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i)/(w/2),z=p.getZ(i)/(d/2),y=p.getY(i);const f=Math.max(0,1-x*x)*Math.max(0,1-z*z);p.setY(i,y+(y>0?b:-b*.4)*f);}
  g.computeVertexNormals();GE7[key]=g;return g;
}
const lth=(pts,seg)=>new THREE.LatheGeometry(pts.map(a=>new THREE.Vector2(a[0],a[1])),seg||28);
const tube=(pts,r,seg,rs)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(a=>new THREE.Vector3(a[0],a[1],a[2]))),seg||24,r,rs||8,false);
/* drap / couette qui tombe sur les côtés */
function drape(W,L,hang,foot,r,wr){
  const nu=28,nv=24,uMax=W/2+hang,vMax=L+foot,g=new THREE.PlaneGeometry(1,1,nu,nv),p=g.attributes.position;r=r||.06;
  const bend=(e)=>{if(e<=0)return [e,0];const q=Math.PI*r/2;if(e<q){const a=e/r;return [r*Math.sin(a),-r*(1-Math.cos(a))];}return [r,-r-(e-q)];};
  for(let i=0;i<p.count;i++){
    const u=p.getX(i)*2*uMax,v=(p.getY(i)+.5)*vMax,eu=Math.abs(u)-W/2,ev=v-L;
    const bu=bend(eu),bv=bend(ev);let x=(eu>0?Math.sign(u)*(W/2+bu[0]):u),z=(ev>0?L+bv[0]:v),y=Math.min(bu[1],bv[1]);
    y+=(wr||.012)*Math.sin(u*9+v*2.3)*Math.cos(v*5.1)*(1+(eu>0?2:0));
    p.setXYZ(i,x,y,-z);
  }
  g.computeVertexNormals();return g;
}
/* ----- matières ----- */
function sm(c,r,m,o){
  const key=c+'|'+r+'|'+m+(o?'|'+(o.k||''):'');if(!o||o.k){if(MT7[key])return MT7[key];}
  const oo=Object.assign({},o||{});delete oo.k;const mt=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:r==null?.6:r,metalness:m||0},oo));
  if(!o||o.k)MT7[key]=mt;return mt;
}
const tm=(t,c,r,m,o)=>new THREE.MeshStandardMaterial(Object.assign({map:t,color:c==null?0xffffff:c,roughness:r==null?.7:r,metalness:m||0},o||{}));
const M7={
  chrome:sm(0xd8dde3,.12,1),steel:sm(0xb8bec6,.32,.9),black:sm(0x17181a,.5,0),blackG:sm(0x0c0d0f,.18,.2),white:sm(0xf3f1ec,.45,0),ceramic:sm(0xfbfbf8,.12,0),
  glass:new THREE.MeshPhysicalMaterial({color:0xdfeef5,roughness:.04,metalness:0,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false}),
  mirror:sm(0xe8eef2,.02,1),screenOff:sm(0x08090b,.12,.4),plastic:sm(0x2a2c30,.55,0)
};
/* ombre de contact douce sous les meubles */
const SHADOWT=()=>ctex('shadow',128,128,(g)=>{const gr=g.createRadialGradient(64,64,4,64,64,64);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(.6,'rgba(0,0,0,.25)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);});
let SHM7=null;
function contact(parent,x,z,w,d,y){
  if(!SHM7)SHM7=new THREE.MeshBasicMaterial({map:SHADOWT(),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),SHM7);m.rotation.x=-Math.PI/2;m.position.set(x,(y||0)+.012,z);m.renderOrder=1;parent.add(m);return m;
}
/* ajout rapide de pièces */
function M(parent,geo,mat,x,y,z,rx,ry,rz,cast){
  const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.rotation.set(rx||0,ry||0,rz||0);
  m.castShadow=cast!==false;m.receiveShadow=true;parent.add(m);return m;
}
const G7=(parent,x,y,z,ry)=>{const g=new THREE.Group();g.position.set(x||0,y||0,z||0);g.rotation.y=ry||0;if(parent)parent.add(g);return g;};
/* ----- reflets (environnement) ----- */
function envScene(top,mid,bot,panels){
  const s=new THREE.Scene(),g=new THREE.SphereGeometry(50,48,24),p=g.attributes.position,col=[];
  const ct=new THREE.Color(top),cm=new THREE.Color(mid),cb=new THREE.Color(bot),t=new THREE.Color();
  for(let i=0;i<p.count;i++){const y=p.getY(i)/50;if(y>0)t.copy(cm).lerp(ct,Math.pow(y,.5));else t.copy(cm).lerp(cb,Math.pow(-y,.35));col.push(t.r,t.g,t.b);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  s.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
  panels.forEach(a=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(a[3],a[4]),new THREE.MeshBasicMaterial({color:new THREE.Color(a[5]).multiplyScalar(a[6]),side:THREE.DoubleSide}));m.position.set(a[0],a[1],a[2]);m.lookAt(0,0,0);s.add(m);});
  return s;
}
function buildEnv7(){
  const pm=new THREE.PMREMGenerator(renderer);
  ENV7.out=pm.fromScene(envScene(0x4f86c9,0xdbe6ee,0x34363a,[[10,42,12,26,26,0xfff6e0,5],[-40,8,-10,40,10,0xffffff,1.4],[30,6,30,30,6,0xcfe3ff,1.2]]),.02).texture;
  ENV7.inn=pm.fromScene(envScene(0xf3ead8,0xcdb79a,0x5b4632,[[0,40,0,22,22,0xfff1d6,3.2],[40,10,0,20,14,0xdfeeff,2],[-30,12,20,16,10,0xffe2b8,1.6]]),.02).texture;
  pm.dispose();scene.environment=ENV7.out;
}
