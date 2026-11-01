'use strict';
/* ---------- v7 : vraies voitures (coque lissée, passages de roue, vitrage, jantes alu) ---------- */
const CAR7={
  sedan:{body:[[2.31,.52,.47,.63],[2.25,.8,.36,.76],[2.06,.89,.32,.84],[1.6,.92,.31,.89],[1,.93,.31,.92],[.3,.94,.31,.935],[-.6,.94,.31,.95],[-1.3,.93,.31,.97],[-1.85,.91,.32,.985],[-2.15,.85,.37,.97],[-2.28,.7,.44,.9],[-2.32,.5,.5,.8]],
    gh:{zf:1.08,zws:.22,zrw:-.72,zr:-1.72,belt:.915,roof:1.42,w:.85,wt:.64,deck:.975,rearGlass:false,pil:[-.22]},wh:{r:.34,x:.79,z:[1.36,-1.36],w:.23},ne:4.2,ng:3},
  sport:{body:[[2.22,.52,.4,.55],[2.15,.84,.3,.65],[1.9,.93,.28,.71],[1.3,.95,.28,.76],[.6,.97,.28,.8],[-.3,.98,.28,.82],[-1.1,.99,.28,.86],[-1.7,.97,.29,.87],[-2.05,.9,.33,.85],[-2.2,.7,.4,.79],[-2.24,.5,.46,.72]],
    gh:{zf:.72,zws:-.12,zrw:-.62,zr:-1.9,belt:.8,roof:1.19,w:.84,wt:.58,deck:.87,rearGlass:false,pil:[]},wh:{r:.35,x:.81,z:[1.33,-1.3],w:.28},ne:4.6,ng:2.8},
  suv:{body:[[2.36,.6,.52,.8],[2.28,.86,.42,.94],[2.05,.94,.4,1.02],[1.5,.96,.4,1.06],[.8,.97,.4,1.08],[0,.97,.4,1.1],[-1,.97,.4,1.11],[-1.8,.96,.41,1.12],[-2.2,.92,.44,1.1],[-2.33,.8,.5,1.05],[-2.37,.6,.56,.98]],
    gh:{zf:1.22,zws:.45,zrw:-1.95,zr:-2.22,belt:1.08,roof:1.83,w:.92,wt:.79,deck:1.1,rearGlass:true,pil:[-.18,-1.25]},wh:{r:.4,x:.82,z:[1.42,-1.42],w:.27},ne:5,ng:4},
  danfo:{body:[[2.33,.6,.5,.86],[2.26,.88,.42,1],[2.1,.95,.4,1.08],[1.6,.97,.4,1.12],[0,.97,.4,1.14],[-1.6,.97,.4,1.14],[-2.15,.96,.42,1.14],[-2.3,.9,.46,1.12],[-2.35,.7,.52,1.05]],
    gh:{zf:2.02,zws:1.38,zrw:-2.16,zr:-2.32,belt:1.12,roof:2.15,w:.96,wt:.87,deck:1.14,rearGlass:true,pil:[.9,0,-.9,-1.7]},wh:{r:.37,x:.82,z:[1.55,-1.5],w:.25},ne:6,ng:5}
};
CAR7.taxi=CAR7.sedan;
const sstep=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
function cr(p0,p1,p2,p3,t){const t2=t*t,t3=t2*t;return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);}
function sampleBody(D){
  const C=D.body,out=[],z0=C[0][0],z1=C[C.length-1][0],N=96,W=D.wh;
  for(let i=0;i<=N;i++){
    const z=z0+(z1-z0)*i/N;let k=0;while(k<C.length-2&&C[k+1][0]>z)k++;
    const t=(C[k][0]-z)/(C[k][0]-C[k+1][0]),g=a=>cr(C[Math.max(0,k-1)][a],C[k][a],C[k+1][a],C[Math.min(C.length-1,k+2)][a],t);
    let w=g(1),b=g(2),tp=g(3);
    W.z.forEach(zw=>{const R=W.r+.09,dz=Math.abs(z-zw);if(dz<R){const ay=W.r+Math.sqrt(R*R-dz*dz)-.02;b=Math.max(b,ay);tp=Math.max(tp,ay+.07);}});
    out.push({z,wb:w*.985,wt:w*.95,b,t:tp});
  }
  return out;
}
function sampleGH(D){
  const G=D.gh,out=[],N=60;
  for(let i=0;i<=N;i++){
    const z=G.zf+(G.zr-G.zf)*i/N;let t;
    if(z>G.zws)t=G.belt+(G.roof-G.belt)*sstep((G.zf-z)/(G.zf-G.zws))*.98+.0;
    else if(z>G.zrw)t=G.roof+.015*Math.sin(Math.PI*(z-G.zrw)/(G.zws-G.zrw));
    else t=G.roof-(G.roof-G.deck)*sstep((G.zrw-z)/(G.zrw-G.zr));
    t=Math.max(t,G.belt+.004);out.push({z,wb:G.w,wt:G.wt,b:G.belt-.05,t});
  }
  out[0].t=out[0].b+.004;out[out.length-1].t=Math.max(out[out.length-1].b+.004,G.deck-.02);return out;
}
const se=(v,n)=>Math.sign(v)*Math.pow(Math.abs(v),2/n);
function loft(S,M,ne,cls,ng){
  const pos=[],G=[];for(let i=0;i<ng;i++)G.push([]);
  S.forEach(s=>{const mid=(s.t+s.b)/2,hh=(s.t-s.b)/2;for(let j=0;j<M;j++){const th=j/M*Math.PI*2,cx=se(Math.cos(th),ne),sy=se(Math.sin(th),ne),w=s.wb+(s.wt-s.wb)*(sy+1)/2;pos.push(cx*w,mid+hh*sy,s.z);}});
  for(let i=0;i<S.length-1;i++)for(let j=0;j<M;j++){
    const a=i*M+j,b=i*M+(j+1)%M,c=(i+1)*M+j,d=(i+1)*M+(j+1)%M,th=(j+.5)/M*Math.PI*2;
    G[cls(th,(S[i].z+S[i+1].z)/2,(pos[a*3+1]+pos[d*3+1])/2)].push(a,c,b,b,c,d);
  }
  [[0,1],[S.length-1,-1]].forEach(([i,sg])=>{const s=S[i],ci=pos.length/3;pos.push(0,(s.t+s.b)/2,s.z);for(let j=0;j<M;j++){const a=i*M+j,b=i*M+(j+1)%M;G[cls(j/M*6.283,s.z,(s.t+s.b)/2)].push(...(sg>0?[ci,a,b]:[ci,b,a]));}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  const idx=[];G.forEach((l,k)=>{g.addGroup(idx.length,l.length,k);idx.push(...l);});g.setIndex(idx);g.computeVertexNormals();return g;
}
function surfX(s,y,ne){if(y<s.b||y>s.t)return -1;const mid=(s.t+s.b)/2,hh=(s.t-s.b)/2,sy=(y-mid)/hh,w=s.wb+(s.wt-s.wb)*(sy+1)/2;return Math.pow(Math.max(0,1-Math.pow(Math.abs(sy),ne)),1/ne)*w;}
function edgeZ(S,x,y,ne,front){const L=front?S:S.slice().reverse();for(const s of L){const sx=surfX(s,y,ne);if(sx>=Math.abs(x))return s.z;}return 0;}
/* ruban qui épouse la carrosserie (filets, bandes, joints de portes) */
function ribbonH(S,ne,y,h,z0,z1,off){
  const p=[],ix=[];let prev=-1;
  [-1,1].forEach(sd=>{S.forEach(s=>{if(s.z>z0||s.z<z1){prev=-1;return;}const x1=surfX(s,y-h/2,ne),x2=surfX(s,y+h/2,ne);if(x1<0||x2<0){prev=-1;return;}
    const k=p.length/3;p.push(sd*(x1+off),y-h/2,s.z,sd*(x2+off),y+h/2,s.z);if(prev>=0)ix.push(...(sd>0?[prev,k,prev+1,prev+1,k,k+1]:[prev,prev+1,k,prev+1,k+1,k]));prev=k;});prev=-1;});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();return g;
}
function ribbonV(S,ne,z,y0,y1,w,off){
  let s=S[0];S.forEach(q=>{if(Math.abs(q.z-z)<Math.abs(s.z-z))s=q;});
  const p=[],ix=[];[-1,1].forEach(sd=>{let prev=-1;for(let y=y0;y<=y1+1e-4;y+=(y1-y0)/8){const x=surfX(s,y,ne);if(x<0){prev=-1;continue;}const k=p.length/3;p.push(sd*(x+off),y,s.z+w/2,sd*(x+off),y,s.z-w/2);if(prev>=0)ix.push(...(sd>0?[prev,prev+1,k,prev+1,k+1,k]:[prev,k,prev+1,prev+1,k,k+1]));prev=k;}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();return g;
}
const PAINT7={};
function paint7(c){if(PAINT7[c])return PAINT7[c];const w=new THREE.Color(c),l=(w.r+w.g+w.b)/3;
  const m=new THREE.MeshPhysicalMaterial({color:c,metalness:l>.6||l<.02?.15:.45,roughness:.32,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:1.15});m.userData.p4Paintable=true;return PAINT7[c]=m;}
const CM7={glass:new THREE.MeshPhysicalMaterial({color:0x223240,metalness:.2,roughness:.04,transparent:true,opacity:.72,envMapIntensity:1.6}),
  trim:sm(0x101113,.55,.1),rubber:sm(0x151515,.88,0),rim:sm(0xc9ced6,.22,1),rimD:sm(0x3a3d42,.35,.9),disc:sm(0x8c8f94,.4,.9),caliper:sm(0xb3261e,.4,.2),
  seat:sm(0x2a2b2e,.85,0),lens:new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.02,metalness:0,transparent:true,opacity:.35,envMapIntensity:2}),
  head:new THREE.MeshStandardMaterial({color:0xf2f2ea,emissive:0xfff3d0,emissiveIntensity:.15,roughness:.2,metalness:.6}),
  rev:new THREE.MeshStandardMaterial({color:0xf2f2f2,emissive:0xffffff,emissiveIntensity:0,roughness:.3})};
const GEO7={};
function plateTex(txt){return ctex('plate'+txt,256,64,(g,W,H)=>{g.fillStyle='#f4f4ee';g.fillRect(0,0,W,H);g.fillStyle='#1f4fa8';g.fillRect(0,0,26,H);g.fillStyle='#ffd34a';g.font='700 14px sans-serif';g.fillText('PA',3,40);
  g.fillStyle='#16181c';g.font='700 40px Rajdhani, Arial Narrow, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,W/2+12,H/2+2);g.strokeStyle='#16181c';g.lineWidth=3;g.strokeRect(1.5,1.5,W-3,H-3);});}
function wheel7(r,w,sport){
  const k='wh'+r+w+sport;if(GEO7[k])return GEO7[k];
  const hw=w/2,ri=r*.66,rr=r*.64;
  const tire=lth([[ri,-hw*.92],[r-.05,-hw],[r-.012,-hw+.025],[r,-hw+.06],[r,hw-.06],[r-.012,hw-.025],[r-.05,hw],[ri,hw*.92]],32).rotateZ(Math.PI/2);
  const sh=new THREE.Shape();sh.absarc(0,0,rr,0,Math.PI*2,false);
  const n=sport?10:5;for(let i=0;i<n;i++){const a0=i/n*Math.PI*2+(sport?.1:.2),a1=(i+1)/n*Math.PI*2-(sport?.1:.2),h=new THREE.Path();
    h.moveTo(Math.cos(a0)*rr*.36,Math.sin(a0)*rr*.36);h.absarc(0,0,rr*.84,a0+.05,a1-.05,false);h.lineTo(Math.cos(a1)*rr*.36,Math.sin(a1)*rr*.36);h.absarc(0,0,rr*.36,a1,a0,true);sh.holes.push(h);}
  const rim=new THREE.ExtrudeGeometry(sh,{depth:.03,bevelEnabled:true,bevelThickness:.012,bevelSize:.008,bevelSegments:2,curveSegments:24}).rotateY(Math.PI/2).translate(hw*.55,0,0);
  const lip=new THREE.TorusGeometry(rr*.98,.014,8,40).rotateY(Math.PI/2).translate(hw*.62,0,0);
  const barrel=new THREE.CylinderGeometry(rr*.96,rr*.96,w*.8,28,1,true).rotateZ(Math.PI/2);
  const hub=new THREE.CylinderGeometry(rr*.2,rr*.22,.06,16).rotateZ(Math.PI/2).translate(hw*.6,0,0);
  const disc=new THREE.CylinderGeometry(rr*.78,rr*.78,.025,28).rotateZ(Math.PI/2).translate(hw*.1,0,0);
  const cal=new THREE.BoxGeometry(.06,rr*.5,rr*.32).translate(hw*.2,rr*.42,-rr*.25);
  return GEO7[k]={tire,rim,lip,barrel,hub,disc,cal};
}
function buildCarGeo(type){
  if(GEO7[type])return GEO7[type];
  const D=CAR7[type]||CAR7.sedan,G=D.gh,S=sampleBody(D),H=sampleGH(D);
  const body=loft(S,40,D.ne,(th,z,y)=>(Math.sin(th)<-.2||y<.42)?1:0,2);
  const bpz=G.pil;
  const gh=loft(H,36,D.ng,(th,z,y)=>{
    const c=Math.abs(Math.cos(th)),s=Math.sin(th);
    if(s<-.1)return 2;
    if(y<G.belt+.035)return 2;
    if(c<.5){if(z>G.zws+.02||z<G.zrw-.02)return (c>.42&&z>G.zws)?0:1;return 0;}
    if(c<.6&&z<=G.zws+.02&&z>=G.zrw-.02)return 2;
    if(z>G.zws-.04)return (Math.abs(z-G.zws)<.06||z>G.zf-.08)?0:1;
    if(z<G.zrw+.02)return G.rearGlass?(z<G.zr+.12?0:1):0;
    if(bpz.some(p=>Math.abs(z-p)<.05))return 2;
    if(y>G.roof-.06)return 0;
    return 1;
  },3);
  return GEO7[type]={D,S,H,body,gh};
}
let NPLATE=0;
makeCar=function(color,type){
  type=CAR7[type]?type:'sedan';
  const C=buildCarGeo(type),D=C.D,G=D.gh,S=C.S,ne=D.ne,bpz=G.pil,g=new THREE.Group(),ch=new THREE.Group();g.add(ch);
  const paint=paint7(color);
  const body=new THREE.Mesh(C.body,[paint,CM7.trim]);body.castShadow=true;body.receiveShadow=true;ch.add(body);
  const gh=new THREE.Mesh(C.gh,[paint,CM7.glass,CM7.trim]);gh.castShadow=true;ch.add(gh);
  const zF=S[0].z,zB=S[S.length-1].z,frontY=S[3].t-.1;
  /* plancher et habitacle */
  M(ch,new THREE.BoxGeometry(1.1,.36,zF-zB-.5),CM7.trim,0,.48,(zF+zB)/2,0,0,0,false);
  const seatZ=[(G.zws+G.zrw)/2+.25,(G.zws+G.zrw)/2-.55];
  [.36,-.36].forEach(x=>{M(ch,rbox(.44,.12,.46,.05),CM7.seat,x,G.belt-.33,seatZ[0],0,0,0,false);M(ch,rbox(.44,.58,.12,.05),CM7.seat,x,G.belt-.02,seatZ[0]-.26,-.18,0,0,false);
    if(type!=='sport'){M(ch,rbox(.44,.12,.46,.05),CM7.seat,x,G.belt-.33,seatZ[1],0,0,0,false);M(ch,rbox(.44,.52,.12,.05),CM7.seat,x,G.belt-.05,seatZ[1]-.26,-.15,0,0,false);}});
  M(ch,rbox(1.6,.16,.36,.06),CM7.trim,0,G.belt+.02,G.zf-.42,0,0,0,false);
  M(ch,new THREE.TorusGeometry(.17,.025,8,24),CM7.trim,.36,G.belt+.08,G.zf-.62,-.35,0,0,false);
  /* phares, feux, calandre */
  const rev=CM7.rev.clone(),tail=new THREE.MeshStandardMaterial({color:0x7a0a08,emissive:0xff1a10,emissiveIntensity:.35,roughness:.25,metalness:.2});
  [-1,1].forEach(sd=>{
    const hx=sd*(S[6].wb-.27),hy=frontY,hz=edgeZ(S,hx+sd*.15,hy,ne,true);
    M(ch,rbox(.44,.15,.2,.06),CM7.trim,hx,hy,hz-.04,0,0,0,false);
    M(ch,rbox(.36,.11,.06,.04),M7.chrome,hx,hy,hz+.03,0,0,0,false);
    [-.08,.08].forEach(o=>M(ch,new THREE.CylinderGeometry(.042,.042,.04,16).rotateX(Math.PI/2),CM7.head,hx+o,hy+.005,hz+.055,0,0,0,false));
    M(ch,rbox(.4,.022,.03,.01),CM7.head,hx,hy-.062,hz+.05,0,0,0,false);
    M(ch,rbox(.46,.16,.12,.06),CM7.lens,hx,hy,hz+.02,0,0,0,false);
    const ty=S[S.length-4].t-.1,tx=sd*(S[S.length-8].wb-.25),tz=edgeZ(S,tx+sd*.14,ty,ne,false);
    M(ch,rbox(.42,.14,.16,.05),CM7.trim,tx,ty,tz+.02,0,0,0,false);M(ch,rbox(.38,.11,.06,.04),tail,tx,ty,tz-.06,0,0,0,false);
    M(ch,rbox(.1,.03,.04,.012),rev,tx-sd*.1,ty-.04,tz-.08,0,0,0,false);
    /* rétroviseur */
    const ms=H7at(C.H,G.zf-.18),mx=sd*(surfX(ms,G.belt+.02,D.ng)+.1);
    M(ch,rbox(.12,.12,.2,.04),paint,mx,G.belt+.06,G.zf-.18,0,0,0,true);M(ch,new THREE.BoxGeometry(.01,.09,.15),M7.mirror,mx+sd*.06,G.belt+.06,G.zf-.18,0,0,0,false);
    /* poignées */
    [G.zws-.25,G.zws-.95].forEach((z,i)=>{if(type==='sport'&&i)return;const s=H7at(S,z),x=surfX(s,G.belt-.11,ne);if(x>0)M(ch,rbox(.03,.035,.17,.012),M7.chrome,sd*(x+.004),G.belt-.11,z,0,0,0,false);});
  });
    const gy=S[2].t*.5+.24,gz=edgeZ(S,0,gy,ne,true);
  M(ch,rbox(.82,.17,.08,.04),CM7.trim,0,gy,gz-.02,0,0,0,false);for(let i=0;i<3;i++)M(ch,new THREE.BoxGeometry(.76,.012,.02),M7.chrome,0,gy-.05+i*.05,gz+.01,0,0,0,false);
  const ly=.4,lz=edgeZ(S,0,ly,ne,true);M(ch,rbox(1.25,.1,.06,.03),CM7.trim,0,ly,lz-.01,0,0,0,false);
  const plate=tm(plateTex((100+(NPLATE++*37)%900)+' AU'),0xffffff,.4,0);
  const py=.5,pzF=edgeZ(S,0,py,ne,true),pzB=edgeZ(S,0,py+.05,ne,false);
  M(ch,new THREE.PlaneGeometry(.46,.12),plate,0,py,pzF+.012,0,0,0,false);M(ch,new THREE.PlaneGeometry(.46,.12),plate,0,py+.05,pzB-.012,0,Math.PI,0,false);
  M(ch,new THREE.CylinderGeometry(.04,.04,.14,12).rotateX(Math.PI/2),M7.chrome,-.55,.36,zB+.02,0,0,0,false);
  /* filets, joints de portes */
  ch.add(new THREE.Mesh(ribbonH(S,ne,G.belt-.025,.02,G.zf+.05,G.zr,.003),M7.chrome));
  const seams=[G.zf-.02,(type==='sport'?G.zrw-.15:bpz.length?bpz[0]:G.zrw)];if(type!=='sport'&&type!=='danfo')seams.push(G.zrw-.05);
  seams.forEach(z=>ch.add(new THREE.Mesh(ribbonV(S,ne,z,.44,G.belt-.04,.008,.002),CM7.trim)));
  /* options par type */
  if(type==='taxi'){M(ch,rbox(.62,.16,.3,.05),M7.white,0,G.roof+.09,(G.zws+G.zrw)/2,0,0,0,true);
    const tt=tm(ctex('taxis',256,64,(x,W,H)=>{x.fillStyle='#ffd400';x.fillRect(0,0,W,H);x.fillStyle='#111';x.font='700 44px Rajdhani, Arial Narrow, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('TAXI',W/2,H/2+2);}),0xffffff,.4,0,{emissive:0x664400,emissiveIntensity:.4});
    [1,-1].forEach(s=>M(ch,new THREE.PlaneGeometry(.56,.13),tt,0,G.roof+.09,(G.zws+G.zrw)/2+s*.152,0,s>0?0:Math.PI,0,false));
    ch.add(new THREE.Mesh(ribbonH(S,ne,.7,.07,zF-.3,zB+.3,.003),CM7.trim));}
  if(type==='danfo'){[.62,.98].forEach(y=>ch.add(new THREE.Mesh(ribbonH(S,ne,y,.07,zF-.2,zB+.1,.003),CM7.trim)));
    [-.7,.7].forEach(x=>M(ch,tube([[x,G.roof+.12,1.2],[x,G.roof+.12,-1.9]],.025,4,6),CM7.trim,0,0,0,0,0,0,false));
    for(let z=1.1;z>-1.9;z-=.5)M(ch,new THREE.BoxGeometry(1.44,.03,.04),CM7.trim,0,G.roof+.12,z,0,0,0,false);}
  if(type==='sport'){M(ch,rbox(1.5,.04,.32,.015),CM7.trim,0,G.deck+.24,zB+.3,0,0,0,true);[-.55,.55].forEach(x=>M(ch,new THREE.BoxGeometry(.04,.22,.12),CM7.trim,x,G.deck+.12,zB+.32,0,0,0,false));}
  if(type==='suv'){[-.68,.68].forEach(x=>M(ch,tube([[x,G.roof+.02,G.zws-.05],[x,G.roof+.07,G.zws-.25],[x,G.roof+.07,G.zrw+.25],[x,G.roof+.02,G.zrw+.05]],.022,12,6),M7.steel,0,0,0,0,0,0,false));}
  /* roues : pivot de direction + rotation */
  const W=D.wh,WG=wheel7(W.r,W.w,type==='sport');g.userData.wheels=[];g.userData.steer=[];
  [[1,W.z[0]],[-1,W.z[0]],[1,W.z[1]],[-1,W.z[1]]].forEach(([sd,z],i)=>{
    const st=G7(g,sd*W.x,W.r,z),rl=G7(st),inner=G7(rl,0,0,0,sd>0?0:Math.PI);
    M(inner,WG.tire,CM7.rubber);M(inner,WG.rim,CM7.rim);M(inner,WG.lip,CM7.rim,0,0,0,0,0,0,false);M(inner,WG.barrel,CM7.rimD,0,0,0,0,0,0,false);M(inner,WG.hub,CM7.rimD,0,0,0,0,0,0,false);
    const br=G7(st,0,0,0,sd>0?0:Math.PI);M(br,WG.disc,CM7.disc,0,0,0,0,0,0,false);M(br,WG.cal,type==='sport'?CM7.caliper:CM7.rimD,0,0,0,0,0,0,false);
    g.userData.wheels.push(rl);if(i<2)g.userData.steer.push(st);
  });
  g.userData.chassis=ch;g.userData.tail=tail;g.userData.rev=rev;g.userData.frontZ=zF;g.userData.backZ=zB;g.userData.lightY=frontY;
  return g;
};
function H7at(S,z){let s=S[0];S.forEach(q=>{if(Math.abs(q.z-z)<Math.abs(s.z-z))s=q;});return s;}
applyType=function(g,t){
  if(!hgm){const mat=(a,b)=>new THREE.SpriteMaterial({map:glowTex([[0,a],[.35,b],[1,'rgba(255,200,100,0)']]),transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,opacity:0});
    hgm=mat('rgba(255,246,210,1)','rgba(255,230,160,.5)');tgm=mat('rgba(255,60,40,1)','rgba(255,40,30,.45)');}
  const u=g.userData;[[hgm,u.frontZ+.15,2.6],[tgm,u.backZ-.15,2.0]].forEach(a=>{const s=new THREE.Sprite(a[0]);s.position.set(0,u.lightY,a[1]);s.scale.set(a[2],.8,1);u.chassis.add(s);});
};
/* suspension, direction, feux stop */
const CAR7S={n:0};
function updateCars7(dt){
  const h=(gameMin/60)%24,s=Math.sin((h-6)/12*Math.PI),day=s>0?clamp(s*1.4,0,1):0,night=1-day;
  CM7.head.emissiveIntensity=.15+night*2.4*(1-wx.k.dark*0)+wx.k.dark*.8;
  const inp=player.car&&!panelOpen&&!chatOpen?getInput():{x:0,z:0};
  cars.forEach(c=>{
    const u=c.mesh.userData;if(!u.chassis)return;
    const vis=Math.abs(c.x-camera.position.x)<170&&Math.abs(c.z-camera.position.z)<170;c.mesh.visible=vis&&!(player.inside);if(!vis)return;
    const yr=angDiff(c.ph7==null?c.h:c.ph7,c.h)/Math.max(dt,1e-3);c.ph7=c.h;
    const acc=(c.v-(c.pv7==null?c.v:c.pv7))/Math.max(dt,1e-3);c.pv7=c.v;
    c.roll7=(c.roll7||0)+(clamp(-c.v*yr*.006,-.05,.05)-(c.roll7||0))*Math.min(1,6*dt);
    u.chassis.rotation.set(c.mesh.rotation.x*1.2,0,c.roll7);c.mesh.rotation.x=0;
    const steer=c===player.car?-inp.x*.5:clamp(yr*.5,-.5,.5);
    u.steer.forEach(st=>{st.rotation.y+=(steer-st.rotation.y)*Math.min(1,8*dt);});
    const braking=(acc<-3&&Math.abs(c.v)>.3)||(c===player.car&&(keys[' ']||(inp.z<-.05&&c.v>.5)))||(c.kind==='npc'&&c.v<.5);
    u.tail.emissiveIntensity=braking?2.6:.25+night*.9;u.rev.emissiveIntensity=c.v<-.3?2:0;
  });
}
