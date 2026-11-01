'use strict';
/* ---------- v7 : architecture intérieure (murs percés, portes, fenêtres, plafonds, éclairage) ---------- */
const WALLS7=[],DOORS7=[],INT7=[],ANIM7=[];
let VIEW7=null;
function grainTex(base){return ctex('grain'+base,256,256,(g,W,H)=>{g.fillStyle=hx7(base);g.fillRect(0,0,W,H);
  for(let i=0;i<70;i++){g.strokeStyle='rgba(60,30,10,'+(.03+Math.random()*.08)+')';g.lineWidth=.5+Math.random()*1.5;g.beginPath();const y0=Math.random()*H,a=Math.random()*6,f=.01+Math.random()*.03;for(let x=0;x<=W;x+=4)g.lineTo(x,y0+Math.sin(x*f+a)*3);g.stroke();}
  grain(g,W,H,1200,.05);});}
const WOOD=c=>MT7['wd'+c]||(MT7['wd'+c]=tm(grainTex(c),0xffffff,.55,0));
const FAB=c=>MT7['fb'+c]||(MT7['fb'+c]=tm(rep(fabricTex(c),2),0xffffff,.92,0));
function viewTex(){return ctex('view',512,256,(g,W,H)=>{
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#7fb3e6');gr.addColorStop(.62,'#dbeaf5');gr.addColorStop(.63,'#9aa7b0');gr.addColorStop(1,'#59636b');g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=0;i<22;i++){const x=i*26+Math.random()*10,w=18+Math.random()*26,h=40+Math.random()*110;g.fillStyle=['#b8c2cc','#a4adb6','#c9bfae','#9fb0bf','#d4cab6'][i%5];g.fillRect(x,H*.63-h,w,h);
    g.fillStyle='rgba(255,255,255,.45)';for(let y=H*.63-h+6;y<H*.63-6;y+=10)for(let xx=x+3;xx<x+w-4;xx+=7)g.fillRect(xx,y,3,5);}
  for(let i=0;i<14;i++){g.fillStyle='#4f7d4a';g.beginPath();g.arc(Math.random()*W,H*.64,10+Math.random()*16,0,7);g.fill();}
  g.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<5;i++){g.beginPath();g.ellipse(Math.random()*W,20+Math.random()*50,40,10,0,0,7);g.fill();}
});}
/* UV en mètres pour les boîtes (carrelage, enduit sans étirement) */
function worldUV(g,ox){const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;ox=ox||0;
  for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i));if(ay>.5)uv.setXY(i,p.getX(i)+ox,p.getZ(i));else if(ax>.5)uv.setXY(i,p.getZ(i),p.getY(i));else uv.setXY(i,p.getX(i)+ox,p.getY(i));}uv.needsUpdate=true;return g;}
function roomCtx(id,rx,rz,H){
  const G=new THREE.Group();G.position.set(rx,0,rz);G.visible=false;scene.add(G);
  const R={id,rx,rz,G,H,walls:[],doors:[],ints:[],lights:[],anims:[],b:null};
  R.col=(x,z,w,d)=>boxes.push({x0:rx+x-w/2,x1:rx+x+w/2,z0:rz+z-d/2,z1:rz+z+d/2,big:false,room:id});
  R.place=(o,x,z,ry,cw,cd,y)=>{o.position.set(x,y||0,z);o.rotation.y=ry||0;G.add(o);if(cw){const q=Math.abs(Math.sin(ry||0))>.5;R.col(x,z,q?cd:cw,q?cw:cd);}return o;};
  R.int=(x,z,label,fn,o)=>{const it=Object.assign({room:id,x:rx+x,z:rz+z,label,fn,r:1.25},o||{});R.ints.push(it);return it;};
  R.light=(x,y,z,i,c,grp)=>{R.lights.push({x:rx+x,y,z:rz+z,i,c:c||0xffe2b8,grp:grp||'main'});};
  R.floor=(x0,z0,x1,z1,mat,tile)=>{const w=x1-x0,d=z1-z0,g=new THREE.PlaneGeometry(w,d);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/tile,uv.getY(i)*d/tile);
    const m=M(G,g,mat,(x0+x1)/2,.005,(z0+z1)/2,-Math.PI/2,0,0,false);m.receiveShadow=true;return m;};
  R.ceil=(x0,z0,x1,z1,mat)=>{const m=M(G,new THREE.PlaneGeometry(x1-x0,z1-z0),mat||sm(0xf4f1ea,.9,0),(x0+x1)/2,H,(z0+z1)/2,Math.PI/2,0,0,false);m.castShadow=false;return m;};
  /* mur : ops = [{t,w,k:'door'|'window',y0,y1,out,curt}] ; mats = [côté +z local, côté -z local] */
  R.wall=(x0,z0,x1,z1,mA,mB,ops,o)=>{
    o=o||{};const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(-(z1-z0),x1-x0),th=o.th||.14,g=G7(G,x0,0,z0,ry),edge=mA;
    const mats=[edge,edge,edge,edge,mA,mB||mA];
    const piece=(a,b,y0,y1)=>{if(b-a<.01||y1-y0<.01)return;const geo=worldUV(new THREE.BoxGeometry(b-a,y1-y0,th).translate((a+b)/2,(y0+y1)/2,0),0);
      const m=M(g,geo,mats,0,0,0,0,0,0,true);m.castShadow=true;
      if(y0<.5){const c=Math.cos(ry),s=-Math.sin(ry),ax=x0+c*a,az=z0+s*a,bx=x0+c*b,bz=z0+s*b;
        boxes.push({x0:rx+Math.min(ax,bx)-th/2,x1:rx+Math.max(ax,bx)+th/2,z0:rz+Math.min(az,bz)-th/2,z1:rz+Math.max(az,bz)+th/2,big:false,room:id});
        if(!o.nobase)[1,-1].forEach(sd=>M(g,new THREE.BoxGeometry(b-a,.1,.018).translate((a+b)/2,.05,sd*(th/2+.009)),M7.white,0,0,0,0,0,0,false));}};
    ops=(ops||[]).slice().sort((p,q)=>p.t-q.t);let cur=0;
    ops.forEach(op=>{const a=op.t-op.w/2,b=op.t+op.w/2;piece(cur,a,0,H);cur=b;
      if(op.k==='door'){piece(a,b,2.12,H);R.doorAt(g,ry,x0,z0,op,th);}
      else{piece(a,b,0,op.y0);piece(a,b,op.y1,H);R.windowAt(g,op,th);}});
    piece(cur,L,0,H);
    R.walls.push({g,x0:rx+x0,z0:rz+z0,x1:rx+x1,z1:rz+z1,cut:0});return g;
  };
  R.windowAt=(g,op,th)=>{const w=op.w,h=op.y1-op.y0,yc=(op.y0+op.y1)/2,fm=sm(0xf2f0ea,.4,0),out=op.out||-1;
    [[w+.06,.07,0,op.y1],[w+.06,.07,0,op.y0],[.07,h,-w/2,yc],[.07,h,w/2,yc],[.045,h,0,yc]].forEach(b=>M(g,rbox(b[0],b[1],th+.04,.015),fm,op.t+b[2],b[3],0,0,0,0,false));
    M(g,new THREE.BoxGeometry(w+.2,.04,.24),sm(0xe9e4da,.3,0),op.t,op.y0-.01,-out*.12,0,0,0,false);
    const gl=M(g,new THREE.PlaneGeometry(w,h),M7.glass,op.t,yc,0,0,0,0,false);gl.renderOrder=3;
    if(op.curt){const cm=FAB(op.curt);const rod=M(g,new THREE.CylinderGeometry(.015,.015,w+.7,8).rotateZ(Math.PI/2),M7.steel,op.t,op.y1+.18,-out*.16,0,0,0,false);
      const cur=[];[-1,1].forEach(sd=>{const pv=G7(g,op.t+sd*(w/2+.32),0,-out*.18);const cg=new THREE.PlaneGeometry(.62,op.y1-op.y0+.55,18,4),p=cg.attributes.position;
        for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*30)*.035);cg.translate(-sd*.31,(op.y1+op.y0)/2-.1,0);cg.computeVertexNormals();
        const m=new THREE.Mesh(cg,new THREE.MeshStandardMaterial({map:cm.map,roughness:.95,side:THREE.DoubleSide}));m.castShadow=true;pv.add(m);pv.userData.sd=sd;cur.push(pv);});
      op.curtains=cur;cur.forEach(c=>{c.userData.full=(w/2+.32)/.62;c.scale.x=.5;});(R.curt=R.curt||[]).push(...cur);}
  };
  R.doorAt=(g,ry,x0,z0,op,th)=>{const w=op.w,fm=op.frame||sm(0xf2f0ea,.4,0);
    [[.08,2.16,-w/2-.0],[.08,2.16,w/2],[w+.16,.08,0]].forEach((b,i)=>M(g,rbox(b[0],b[1],th+.05,.012),fm,op.t+b[2],i<2?1.08:2.16,0,0,0,0,false));
    if(op.open===false)return;
    const hinge=G7(g,op.t-w/2+.03,0,0),leaf=M(hinge,rbox(w-.06,2.06,.045,.01),op.leaf||sm(0xf4f2ee,.45,0),(w-.06)/2,1.04,0);
    [.03,-.03].forEach(z=>{M(hinge,new THREE.CylinderGeometry(.022,.022,.03,10).rotateX(Math.PI/2),M7.chrome,w-.18,1.02,z*1.2,0,0,0,false);M(hinge,rbox(.14,.022,.03,.01),M7.chrome,w-.24,1.02,z*1.9,0,0,0,false);});
    if(op.panels)[[.55],[1.5]].forEach(a=>M(hinge,rbox(w-.3,.7,.06,.01),op.leaf||sm(0xf4f2ee,.45,0),(w-.06)/2,a[0],0,0,0,0,false));
    const c=Math.cos(ry),s=-Math.sin(ry);
    DOORS7.push({room:id,hinge,x:rx+x0+c*op.t,z:rz+z0+s*op.t,o:0,dir:op.dir||1});
  };
  return R;
}
/* ----- rig de lumières intérieures (partagé) ----- */
const RIG7={pts:[],spot:null,on:{main:true,bed:false,tv:false,lamp:true},room:null};
function buildRig7(){
  for(let i=0;i<4;i++){const l=new THREE.PointLight(0xffe2b8,0,14,2);scene.add(l);RIG7.pts.push(l);}
  const s=new THREE.SpotLight(0xfff0dc,0,22,1.25,.85,1.6);s.castShadow=true;s.shadow.mapSize.set(1024,1024);s.shadow.bias=-.0008;s.shadow.normalBias=.03;s.shadow.camera.near=.3;s.shadow.camera.far=14;
  scene.add(s);scene.add(s.target);RIG7.spot=s;
}
function rigUpdate7(dt){
  const R=RIG7.room,pts=RIG7.pts;
  if(!R){pts.forEach(l=>l.intensity=0);RIG7.spot.intensity=0;return;}
  const t=performance.now()*.001;
  R.lights.slice(0,4).forEach((L,i)=>{const l=pts[i];l.position.set(L.x,L.y,L.z);l.color.setHex(L.c);
    let k=(RIG7.on[L.grp]===false||RIG7.pw===0)?0:L.i;if(L.grp==='tv'&&RIG7.on.tv)k=L.i*(.75+.25*Math.sin(t*7)+.15*Math.sin(t*17));
    if(R.id==='club'&&L.grp==='main')k=L.i*(.6+.4*Math.sin(t*3+i*1.7));
    l.intensity+=(k-l.intensity)*Math.min(1,10*dt);});
  for(let i=R.lights.length;i<4;i++)pts[i].intensity=0;
  const S=RIG7.spot,on=RIG7.on.main?R.spotI:R.spotI*.06;S.position.set(R.rx+R.spot[0],R.H-.05,R.rz+R.spot[1]);S.target.position.set(R.rx+R.spot[0],0,R.rz+R.spot[1]+.01);S.target.updateMatrixWorld();
  S.intensity+=(on-S.intensity)*Math.min(1,10*dt);
}
/* murs qui s'abaissent quand ils cachent le joueur (vue en coupe) */
function segX(ax,az,bx,bz,cx,cz,dx,dz){const d=(bx-ax)*(dz-cz)-(bz-az)*(dx-cx);if(Math.abs(d)<1e-9)return false;const u=((cx-ax)*(dz-cz)-(cz-az)*(dx-cx))/d,v=((cx-ax)*(bz-az)-(cz-az)*(bx-ax))/d;return u>0&&u<1&&v>-.02&&v<1.02;}
function cutUpdate7(dt){
  const R=RIG7.room;if(!R)return;const cx=camera.position.x,cz=camera.position.z,px=player.x,pz=player.z;
  R.walls.forEach(w=>{const hit=camera.position.y<R.H+3&&segX(cx,cz,px,pz,w.x0,w.z0,w.x1,w.z1);w.cut+=((hit?1:0)-w.cut)*Math.min(1,9*dt);const s=1-w.cut*.93;w.g.scale.y=s;w.g.visible=s>.02;});
  DOORS7.forEach(d=>{if(d.room!==R.id)return;const near=Math.hypot(player.x-d.x,player.z-d.z)<1.7;d.o+=((near?1:0)-d.o)*Math.min(1,5*dt);d.hinge.rotation.y=-d.dir*d.o*1.45;});
}
