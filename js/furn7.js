'use strict';
/* ---------- v7 : mobilier modélisé (face avant = +z, posé au sol) ---------- */
const legT=(g,x,z,h,m,r)=>M(g,new THREE.CylinderGeometry(r||.025,(r||.025)*.6,h,10),m,x,h/2,z);
const F7={
  sofa(c,w,acc){w=w||2.2;const g=G7(),f=FAB(c),wd=WOOD(0x5a3a24);
    M(g,rbox(w,.3,.92,.06),f,0,.27,0);M(g,rbox(w-.1,.5,.24,.09),f,0,.62,-.34);
    [-1,1].forEach(s=>M(g,rbox(.2,.58,.92,.08),f,s*(w/2-.1),.37,0));
    const n=w>1.4?3:1,cw=(w-.42)/n;for(let i=0;i<n;i++){M(g,cushion(cw-.02,.16,.66,.06,.035),f,-w/2+.21+cw*(i+.5),.5,.1);M(g,cushion(cw-.03,.46,.18,.07,.03),f,-w/2+.21+cw*(i+.5),.78,-.24,-.16,0,0);}
    if(acc!==false){M(g,cushion(.4,.4,.13,.06,.03),FAB(acc||0xe0b34a),-w/2+.45,.76,-.12,-.25,.3,.1);if(w>1.4)M(g,cushion(.38,.38,.13,.06,.03),FAB(0xf2efe6),w/2-.45,.75,-.12,-.25,-.35,-.1);}
    [-1,1].forEach(s=>[-1,1].forEach(t=>legT(g,s*(w/2-.1),t*.36,.12,wd,.03)));contact(g,0,0,w+.5,1.4);return g;},
  coffeeTable(){const g=G7(),wd=WOOD(0xb0814f);M(g,rbox(1.2,.05,.62,.02),wd,0,.42,0);M(g,rbox(1.1,.03,.52,.01),wd,0,.14,0);[-1,1].forEach(s=>[-1,1].forEach(t=>legT(g,s*.52,t*.24,.42,M7.black,.018)));
    M(g,rbox(.32,.02,.24,.005),sm(0x2e6fd1,.7,0),-.28,.455,.05,0,.2,0);M(g,rbox(.3,.02,.22,.005),sm(0xd94f4f,.7,0),-.26,.475,.04,0,-.15,0);
    M(g,lth([[0,0],[.04,0],[.045,.09],[.04,.095]],18),M7.ceramic,.3,.445,-.05);M(g,lth([[0,0],[.09,0],[.12,.05],[.13,.06]],22),sm(0x3c6e47,.3,0),.08,.445,.1);
    [[.05,.11],[.11,.07],[.07,.06]].forEach((p,i)=>M(g,new THREE.SphereGeometry(.03,12,10),sm([0xd94f4f,0xe0b34a,0x8fbf4a][i],.4,0),p[0],.5,p[1]));contact(g,0,0,1.5,.9);return g;},
  tvUnit(w){w=w||2;const g=G7(),wd=WOOD(0x7a5136);M(g,rbox(w,.42,.42,.02),wd,0,.27,0);
    for(let i=0;i<3;i++){M(g,new THREE.BoxGeometry(.006,.36,.01),M7.black,-w/2+w/3*(i+1)*(i<2?1:0)+(i==2?-w/2+.01:0),.27,.211,0,0,0,false);M(g,rbox(.12,.015,.02,.006),M7.steel,-w/2+w/3*(i+.5),.4,.22,0,0,0,false);}
    [-1,1].forEach(s=>legT(g,s*(w/2-.08),0,.06,M7.black,.03));contact(g,0,0,w+.3,.8);return g;},
  tv(w){w=w||1.5;const g=G7(),h=w*.5625;M(g,rbox(w+.04,h+.04,.05,.01),M7.blackG,0,0,0);
    const cv=document.createElement('canvas');cv.width=320;cv.height=180;const t=new THREE.CanvasTexture(cv);
    const scr=M(g,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,color:0x000000}),0,0,.027,0,0,0,false);
    g.userData.tv={cv,t,scr,ch:0};return g;},
  bookshelf(w,h){w=w||1.6;h=h||2;const g=G7(),wd=WOOD(0xe8dcc6),n=5;M(g,new THREE.BoxGeometry(w,h,.03),wd,0,h/2,-.17);
    [-1,1].forEach(s=>M(g,new THREE.BoxGeometry(.03,h,.36),wd,s*w/2,h/2,0));
    for(let r=0;r<=n;r++){const y=.04+r*(h-.06)/n;M(g,new THREE.BoxGeometry(w,.03,.36),wd,0,y,0);
      if(r<n){let x=-w/2+.05;while(x<w/2-.12){if(Math.random()<.12){M(g,lth([[0,0],[.05,0],[.07,.1],[.04,.2],[.03,.22]],16),sm(pick([0x2e6fd1,0xe8e0d0,0x3c6e47]),.25,0),x+.06,y+.015,0);x+=.16;continue;}
        const bw=.025+Math.random()*.035,bh=(h/n-.06)*(.62+Math.random()*.32),c=pick([0x8a2f2f,0x2f4f8a,0x2f6a4a,0xc9a26b,0x1f1f24,0xe0b34a,0x6a3f8a,0xd8d0c0]);
        M(g,rbox(bw,bh,.22,.004),sm(c,.7,0),x+bw/2,y+.015+bh/2,.02,0,0,Math.random()<.08?.12:0);x+=bw+.004;}}}
    contact(g,0,0,w+.3,.7);return g;},
  bed(w,l,c){w=w||1.7;l=l||2.1;const g=G7(),wd=WOOD(0x8a5a3a),f=FAB(c||0x4a6fa5);
    M(g,rbox(w+.1,.28,l,.04),wd,0,.2,0);M(g,rbox(w+.2,1.15,.12,.04),wd,0,.58,-l/2-.02);M(g,rbox(w+.02,.75,.08,.05),FAB(0xc9b8a0),0,.85,-l/2+.06);
    for(let i=0;i<4;i++)for(let j=0;j<2;j++)M(g,new THREE.SphereGeometry(.018,8,6),FAB(0xb5a38a),-w/2+.25+i*(w-.5)/3,.7+j*.28,-l/2+.105,0,0,0,false);
    M(g,rbox(w-.04,.24,l-.08,.07),sm(0xf6f5f0,.9,0),0,.46,.02);
    [-1,1].forEach(s=>M(g,cushion(w/2-.14,.14,.42,.07,.05),FAB(0xffffff),s*(w/4),.65,-l/2+.34,-.25,0,0));
    M(g,cushion(w*.42,.14,.36,.06,.04),FAB(0xe0b34a),0,.66,-l/2+.66,-.35,0,0);
    const dv=G7(g,0,.58,-l/2+.78),dg=drape(w+.0,l-.72,.32,.3,.07).rotateY(Math.PI);
    M(dv,dg,new THREE.MeshStandardMaterial({map:f.map,roughness:.95,side:THREE.DoubleSide}),0,0,0);
    M(dv,rbox(w+.06,.07,.22,.035),FAB(0xf3efe6),0,.03,.09);
    g.userData.duvet={g:dv,z0:-l/2+.78,len:l-.72};
    [-1,1].forEach(s=>[-1,1].forEach(t=>legT(g,s*(w/2-.02),t*(l/2-.06),.08,M7.black,.03)));contact(g,0,0,w+.7,l+.6);return g;},
  nightstand(){const g=G7(),wd=WOOD(0x8a5a3a);M(g,rbox(.5,.5,.42,.02),wd,0,.31,0);[.21,.39].forEach(y=>{M(g,new THREE.BoxGeometry(.46,.006,.01),M7.black,0,y+.08,.212,0,0,0,false);M(g,new THREE.SphereGeometry(.018,10,8),M7.chrome,0,y,.22,0,0,0,false);});
    [-1,1].forEach(s=>[-1,1].forEach(t=>legT(g,s*.2,t*.16,.06,M7.black,.015)));
    const L=F7.lamp();L.position.set(.04,.56,-.02);g.add(L);g.userData.lamp=L.userData.lamp;contact(g,0,0,.8,.7);return g;},
  lamp(){const g=G7(),sh=new THREE.MeshStandardMaterial({color:0xf3ead8,emissive:0xffd9a0,emissiveIntensity:0,roughness:.9,side:THREE.DoubleSide});
    M(g,lth([[0,0],[.08,0],[.09,.02],[.05,.08],[.06,.16],[.035,.24],[.012,.25],[.012,.3]],24),sm(0x3c6e47,.25,.1),0,0,0);
    M(g,lth([[.17,.28],[.11,.48]],28),sh,0,0,0,0,0,0,false);M(g,new THREE.SphereGeometry(.04,12,10),new THREE.MeshBasicMaterial({color:0xfff2d6}),0,.36,0,0,0,0,false);g.userData.lamp=sh;return g;},
  floorLamp(){const g=G7(),sh=new THREE.MeshStandardMaterial({color:0xf3ead8,emissive:0xffd9a0,emissiveIntensity:.0,roughness:.9,side:THREE.DoubleSide});
    M(g,lth([[0,0],[.16,0],[.16,.02],[.03,.04]],24),M7.black,0,0,0);M(g,new THREE.CylinderGeometry(.012,.012,1.5,8),M7.black,0,.78,0);M(g,lth([[.24,1.36],[.17,1.66]],28),sh,0,0,0,0,0,0,false);g.userData.lamp=sh;contact(g,0,0,.5,.5);return g;},
  pendant(c){const g=G7();M(g,new THREE.CylinderGeometry(.004,.004,.7,4),M7.black,0,-.35,0,0,0,0,false);
    const sh=new THREE.MeshStandardMaterial({color:c||0x22262c,roughness:.4,metalness:.6,side:THREE.DoubleSide,emissive:0x000000});M(g,lth([[.01,-.68],[.06,-.7],[.2,-.86],[.22,-.9]],28),sh,0,0,0,0,0,0,false);
    M(g,new THREE.SphereGeometry(.05,14,10),new THREE.MeshBasicMaterial({color:0xfff2d6}),0,-.84,0,0,0,0,false);return g;},
  wardrobe(w,h){w=w||1.8;h=h||2.25;const g=G7(),wd=WOOD(0xe9e2d4),dk=WOOD(0x8a5a3a);M(g,rbox(w,h,.6,.02),wd,0,h/2,-.03);
    M(g,new THREE.BoxGeometry(w-.06,h-.08,.02),sm(0x3a3430,.9,0),0,h/2,.24,0,0,0,false);
    M(g,new THREE.CylinderGeometry(.012,.012,w-.1,8).rotateZ(Math.PI/2),M7.steel,0,h-.32,.05,0,0,0,false);
    for(let i=0;i<9;i++){const x=-w/2+.15+i*(w-.3)/8,c=pick([0xd94f4f,0x2e6fd1,0xf2efe6,0x2f3a4a,0xe0b34a,0x4fb58a,0x8a5fc9]);M(g,rbox(.05,.85,.42,.02),FAB(c),x,h-.78,.05,0,0,0,false);}
    const doors=[];[-1,1].forEach(s=>{const hg=G7(g,s*(w/2-.005),0,.29);M(hg,rbox(w/2-.01,h-.04,.03,.008),wd,-s*(w/4-.005),h/2,0);M(hg,rbox(.02,.5,.025,.008),M7.steel,-s*(w/2-.07),h/2,.03,0,0,0,false);hg.userData.s=s;doors.push(hg);});
    g.userData.doors=doors;contact(g,0,.0,w+.3,.9);return g;},
  desk(w){w=w||1.3;const g=G7(),wd=WOOD(0xc89f6d);M(g,rbox(w,.04,.62,.01),wd,0,.74,0);[-1,1].forEach(s=>[-1,1].forEach(t=>legT(g,s*(w/2-.05),t*.26,.74,M7.black,.018)));
    M(g,rbox(.4,.1,.35,.01),WOOD(0xe8dcc6),w/2-.25,.62,.0);contact(g,0,0,w+.3,.9);return g;},
  laptop(){const g=G7();M(g,rbox(.34,.018,.24,.006),M7.steel,0,.009,0);M(g,new THREE.PlaneGeometry(.3,.15),sm(0x1a1c20,.6,0),0,.019,.02,-Math.PI/2,0,0,false);
    const sg=G7(g,0,.018,-.115);sg.rotation.x=-.25;M(sg,rbox(.34,.23,.012,.006),M7.steel,0,.115,0);
    const cv=document.createElement('canvas');cv.width=256;cv.height=160;const t=new THREE.CanvasTexture(cv);const sc=M(sg,new THREE.PlaneGeometry(.31,.19),new THREE.MeshBasicMaterial({map:t,color:0x111111}),0,.118,.007,0,0,0,false);
    g.userData.scr={cv,t,sc};return g;},
  officeChair(c){const g=G7(),f=FAB(c||0x2f3a4a);M(g,cushion(.5,.08,.48,.04,.02),f,0,.48,0);M(g,cushion(.46,.55,.07,.04,.02),f,0,.86,-.24,-.1,0,0);
    M(g,new THREE.BoxGeometry(.04,.3,.04),M7.black,0,.65,-.24);M(g,new THREE.CylinderGeometry(.025,.03,.38,10),M7.steel,0,.25,0);
    for(let i=0;i<5;i++){const a=i/5*6.283;M(g,new THREE.BoxGeometry(.04,.03,.3).translate(0,0,.15),M7.black,0,.07,0,0,a,0);M(g,new THREE.SphereGeometry(.03,8,6),M7.black,Math.sin(a)*.29,.03,Math.cos(a)*.29,0,0,0,false);}
    contact(g,0,0,.7,.7);return g;},
  chair(c,wc){const g=G7(),wd=WOOD(wc||0x8a5a3a);M(g,rbox(.44,.05,.44,.02),wd,0,.46,0);if(c)M(g,cushion(.4,.04,.4,.02,.015),FAB(c),0,.5,0);
    [-1,1].forEach(s=>[-1,1].forEach(t=>legT(g,s*.19,t*.19,.46,wd,.02)));[-1,1].forEach(s=>M(g,new THREE.CylinderGeometry(.018,.02,.5,8),wd,s*.19,.73,-.2));
    M(g,rbox(.42,.14,.03,.012),wd,0,.88,-.21,-.06,0,0);M(g,rbox(.4,.05,.025,.01),wd,0,.66,-.2);contact(g,0,0,.6,.6);return g;},
  stool(){const g=G7();M(g,new THREE.CylinderGeometry(.19,.17,.06,20),FAB(0x2f3a4a),0,.74,0);M(g,new THREE.CylinderGeometry(.05,.05,.04,10),M7.black,0,.7,0);
    for(let i=0;i<4;i++){const a=i/4*6.283+.78;M(g,new THREE.CylinderGeometry(.013,.013,.74,6),M7.black,Math.sin(a)*.13,.37,Math.cos(a)*.13,Math.cos(a)*.1,0,-Math.sin(a)*.1);}
    M(g,new THREE.TorusGeometry(.15,.01,6,20).rotateX(Math.PI/2),M7.black,0,.28,0);contact(g,0,0,.5,.5);return g;},
  table(w,d,c){const g=G7(),wd=WOOD(c||0xa87a4f);M(g,rbox(w,.05,d,.025),wd,0,.75,0);[-1,1].forEach(s=>[-1,1].forEach(t=>legT(g,s*(w/2-.08),t*(d/2-.08),.75,wd,.03)));contact(g,0,0,w+.4,d+.4);return g;},
  roundTable(r,c){const g=G7();M(g,new THREE.CylinderGeometry(r,r,.04,32),WOOD(c||0xd8c8b0),0,.75,0);M(g,new THREE.CylinderGeometry(.035,.035,.73,10),M7.black,0,.37,0);M(g,new THREE.CylinderGeometry(.24,.26,.03,24),M7.black,0,.015,0);contact(g,0,0,r*2+.4,r*2+.4);return g;},
  rug(w,d,t){const g=G7();M(g,new THREE.PlaneGeometry(w,d),tm(t,0xffffff,.98,0),0,.012,0,-Math.PI/2,0,0,false);return g;},
  art(v,w,h){const g=G7();M(g,rbox(w+.08,h+.08,.04,.01),sm(0x1e1e1e,.5,0),0,0,0,0,0,0,false);M(g,new THREE.PlaneGeometry(w,h),tm(artTex(v),0xffffff,.8,0),0,0,.022,0,0,0,false);return g;},
  plant(k,s){s=s||1;const g=G7(),pot=k===1?sm(0xb5603f,.8,0):sm(0xf2efe8,.35,0);
    M(g,lth([[0,0],[.13,0],[.16,.3],[.17,.32],[.15,.32]].map(p=>[p[0]*s,p[1]*s]),24),pot,0,0,0);M(g,new THREE.CircleGeometry(.145*s,20),sm(0x3b2a1e,1,0),0,.3*s,0,-Math.PI/2,0,0,false);
    const lm=[sm(0x3f8a3a,.6,0),sm(0x2f6f35,.6,0),sm(0x5aa04a,.6,0)];
    const n=k===2?14:9;for(let i=0;i<n;i++){const a=i/n*6.283+Math.random()*.4,tilt=.25+Math.random()*.5,len=(k===2?.55:.38)*s*(0.8+Math.random()*.4);
      const lf=G7(g,0,.3*s,0,a);const L=M(lf,new THREE.SphereGeometry(1,10,8),pick(lm),0,len*.95,len*.35*tilt,tilt,0,0,false);L.scale.set(k===2?.035*s:.12*s,len,.018*s);L.castShadow=true;}
    contact(g,0,0,.6*s,.6*s);return g;},
  counter(len,top){const g=G7(),body=sm(0xf3f1ec,.4,0),tp=tm(rep(marbleTex(top||0xe9e6e0,0x8a8a8a),1,.3),0xffffff,.25,0);
    M(g,new THREE.BoxGeometry(len,.1,.55),M7.black,0,.05,-.03);M(g,new THREE.BoxGeometry(len,.78,.6),body,0,.49,-.02);
    const n=Math.max(1,Math.round(len/.6));for(let i=0;i<n;i++){const x=-len/2+len/n*(i+.5);M(g,rbox(len/n-.012,.74,.02,.006),body,x,.5,.29,0,0,0,false);M(g,rbox(.14,.016,.02,.007),M7.steel,x,.8,.31,0,0,0,false);}
    M(g,rbox(len+.02,.04,.64,.008),tp,0,.9,0);return g;},
  upper(len){const g=G7(),body=sm(0xf3f1ec,.4,0);M(g,new THREE.BoxGeometry(len,.7,.34),body,0,0,0);const n=Math.max(1,Math.round(len/.6));
    for(let i=0;i<n;i++){const x=-len/2+len/n*(i+.5);M(g,rbox(len/n-.012,.68,.02,.006),body,x,0,.18,0,0,0,false);M(g,rbox(.14,.016,.02,.007),M7.steel,x,-.28,.2,0,0,0,false);}return g;},
  sinkTop(){const g=G7();M(g,rbox(.6,.02,.42,.03),M7.steel,0,.925,0);M(g,new THREE.BoxGeometry(.54,.01,.36),sm(0x5a5f66,.3,.9),0,.93,0,0,0,0,false);
    M(g,new THREE.CylinderGeometry(.025,.03,.08,12),M7.chrome,0,.97,-.25);M(g,tube([[0,1,-.25],[0,1.22,-.24],[0,1.26,-.15],[0,1.15,-.08]],.016,16,8),M7.chrome,0,0,0,0,0,0,false);
    M(g,rbox(.12,.02,.02,.01),M7.chrome,.08,1.02,-.25,0,0,0,false);
    const water=M(g,new THREE.CylinderGeometry(.008,.012,.21,8),new THREE.MeshStandardMaterial({color:0xbfe6ff,transparent:true,opacity:.6,roughness:.05}),0,1.04,-.08,0,0,0,false);water.visible=false;g.userData.water=water;return g;},
  stove(){const g=G7();M(g,rbox(.6,.012,.55,.005),M7.blackG,0,.928,0);const burn=[];
    [[-.14,-.12],[.14,-.12],[-.14,.12],[.14,.12]].forEach(p=>{const m=new THREE.MeshStandardMaterial({color:0x2a0805,emissive:0xff3a10,emissiveIntensity:0,roughness:.3});burn.push(m);M(g,new THREE.TorusGeometry(.08,.008,6,28).rotateX(Math.PI/2),m,p[0],.936,p[1],0,0,0,false);});
    M(g,rbox(.56,.4,.02,.01),M7.blackG,0,.48,.305,0,0,0,false);M(g,new THREE.CylinderGeometry(.012,.012,.5,8).rotateZ(Math.PI/2),M7.steel,0,.74,.33,0,0,0,false);
    for(let i=0;i<4;i++)M(g,new THREE.CylinderGeometry(.02,.02,.03,12).rotateX(Math.PI/2),M7.steel,-.21+i*.14,.83,.32,0,0,0,false);
    const pan=G7(g,-.14,.94,.12);M(pan,lth([[0,0],[.13,0],[.14,.05],[.135,.055]],24),M7.black,0,0,0);M(pan,new THREE.CylinderGeometry(.012,.012,.22,8).rotateZ(Math.PI/2),M7.black,.24,.04,0,0,0,0,false);
    const food=M(pan,new THREE.CylinderGeometry(.1,.1,.02,16),sm(0xc8823a,.6,0),0,.02,0,0,0,0,false);food.visible=false;pan.userData.food=food;
    g.userData.burn=burn;g.userData.pan=pan;return g;},
  hood(){const g=G7();M(g,lth([[.0,0],[.42,0],[.42,.04],[.14,.3],[.14,.32]],4),M7.steel,0,0,0,0,Math.PI/4,0).scale.set(1,1,.75);M(g,new THREE.BoxGeometry(.24,.8,.24),M7.steel,0,.7,0);return g;},
  fridge(){const g=G7(),b=sm(0xdfe3e6,.25,.6);M(g,rbox(.74,1.9,.68,.04),b,0,.95,0);M(g,new THREE.BoxGeometry(.66,1.75,.02),sm(0xf6f6f6,.6,0),0,.95,.33,0,0,0,false);
    const lt=M(g,new THREE.PlaneGeometry(.6,1.6),new THREE.MeshBasicMaterial({color:0xeef6ff}),0,.95,.335,0,0,0,false);
    for(let i=0;i<4;i++){M(g,new THREE.BoxGeometry(.64,.01,.5),M7.glass,0,.45+i*.38,.1,0,0,0,false);for(let j=0;j<4;j++)if(Math.random()<.7)M(g,i%2?lth([[0,0],[.03,0],[.03,.16],[.012,.22]],12):rbox(.12,.1,.1,.02),sm(pick([0xd94f4f,0x4fb58a,0xe0b34a,0xf2f2f2,0x2e6fd1]),.4,0),-.22+j*.15,.46+i*.38,.12,0,0,0,false);}
    const hg=G7(g,.37,0,.34);M(hg,rbox(.74,1.88,.05,.02),b,-.37,.95,0);M(hg,rbox(.03,.6,.04,.015),M7.steel,-.68,1.15,.05);M(hg,new THREE.BoxGeometry(.72,.006,.01),sm(0x888888,.5,.5),-.37,1.32,.027,0,0,0,false);
    g.userData.door=hg;g.userData.light=lt;contact(g,0,0,1,1);return g;},
  coffeeMachine(){const g=G7();M(g,rbox(.24,.34,.3,.03),M7.black,0,.17,0);M(g,rbox(.2,.06,.22,.02),M7.steel,0,.31,.02);M(g,new THREE.CylinderGeometry(.045,.04,.09,16),M7.ceramic,0,.07,.08);return g;},
  kettle(){const g=G7();M(g,lth([[0,0],[.08,0],[.09,.06],[.07,.18],[.03,.2],[0,.2]],20),M7.steel,0,0,0);M(g,new THREE.TorusGeometry(.06,.01,6,16,Math.PI),M7.black,0,.2,0,0,Math.PI/2,0,false);return g;},
  microwave(){const g=G7();M(g,rbox(.48,.28,.36,.02),M7.steel,0,.14,0);M(g,new THREE.PlaneGeometry(.3,.2),M7.blackG,-.05,.14,.181,0,0,0,false);M(g,new THREE.PlaneGeometry(.08,.2),sm(0x111111,.4,0),.17,.14,.181,0,0,0,false);return g;},
  fruitBowl(){const g=G7();M(g,lth([[0,0],[.06,0],[.15,.07],[.16,.08]],24),M7.ceramic,0,0,0);[[0,.06,0,0xd94f4f],[.06,.06,.03,0xe0b34a],[-.05,.07,.04,0x8fbf4a],[.02,.09,-.05,0xe07a2a]].forEach(p=>M(g,new THREE.SphereGeometry(.045,12,10),sm(p[3],.45,0),p[0],p[1],p[2],0,0,0,false));return g;},
  plate(){const g=G7();M(g,lth([[0,0],[.1,0],[.13,.015],[.14,.02]],24),M7.ceramic,0,0,0);M(g,new THREE.CylinderGeometry(.08,.09,.03,16),sm(0xc8823a,.6,0),0,.025,0,0,0,0,false);M(g,new THREE.SphereGeometry(.03,10,8),sm(0x4f9a3c,.6,0),.04,.05,.02,0,0,0,false);return g;},
  toilet(){const g=G7();M(g,lth([[0,0],[.13,0],[.12,.18],[.19,.36],[.2,.4],[.0,.4]],28),M7.ceramic,0,0,.05).scale.set(1,1,1.25);
    M(g,new THREE.TorusGeometry(.17,.025,8,28).rotateX(Math.PI/2),M7.ceramic,0,.42,.07).scale.set(1,1,1.2);M(g,rbox(.42,.42,.2,.04),M7.ceramic,0,.62,-.2);M(g,new THREE.CylinderGeometry(.03,.03,.01,12),M7.chrome,0,.835,-.2,0,0,0,false);contact(g,0,0,.6,.8);return g;},
  vanity(){const g=G7(),wd=WOOD(0x8a6a4a);M(g,rbox(.8,.5,.46,.02),wd,0,.55,0);M(g,rbox(.84,.03,.5,.01),tm(rep(marbleTex(0xf2f0ea,0x9a9a9a),1,.3),0xffffff,.2,0),0,.815,0);
    M(g,lth([[0,0],[.08,0],[.2,.06],[.22,.12],[.21,.12]],28),M7.ceramic,0,.83,.02);
    M(g,new THREE.CylinderGeometry(.02,.02,.12,10),M7.chrome,0,.9,-.18);M(g,tube([[0,.96,-.18],[0,.98,-.1]],.012,6,6),M7.chrome,0,0,0,0,0,0,false);
    const w=M(g,new THREE.CylinderGeometry(.005,.008,.13,8),new THREE.MeshStandardMaterial({color:0xbfe6ff,transparent:true,opacity:.6,roughness:.05}),0,.91,-.09,0,0,0,false);w.visible=false;g.userData.water=w;
    M(g,rbox(.7,.9,.03,.02),sm(0x2a2a2a,.4,.3),0,1.55,-.22,0,0,0,false);M(g,new THREE.PlaneGeometry(.64,.84),M7.mirror,0,1.55,-.2,0,0,0,false);contact(g,0,0,1,.7);return g;},
  shower(w,d){const g=G7(),fm=M7.chrome;M(g,rbox(w,.06,d,.02),M7.ceramic,0,.03,0);M(g,new THREE.CircleGeometry(.04,16),M7.steel,0,.065,0,-Math.PI/2,0,0,false);
    [[0,1.0,d/2,w,2,0],[w/2,1.0,0,d,2,Math.PI/2]].forEach(p=>{const m=M(g,new THREE.PlaneGeometry(p[3],p[4]),M7.glass,p[0],p[1]+.06,p[2],0,p[5],0,false);m.renderOrder=3;});
    M(g,new THREE.BoxGeometry(.03,2,.03),fm,w/2,1.06,d/2);M(g,new THREE.BoxGeometry(w,.03,.03),fm,0,2.06,d/2);M(g,new THREE.BoxGeometry(.03,.03,d),fm,w/2,2.06,0);
    M(g,new THREE.CylinderGeometry(.012,.012,1.2,8),fm,-w/2+.08,1.4,-d/2+.06);M(g,tube([[-w/2+.08,2.0,-d/2+.06],[-w/2+.1,2.1,-d/2+.2],[-w/2+.15,2.05,-d/2+.35]],.014,10,6),fm,0,0,0,0,0,0,false);
    M(g,new THREE.CylinderGeometry(.09,.06,.03,20),fm,-w/2+.15,2.03,-d/2+.36,0,0,0,false);
    const N=260,pos=new Float32Array(N*6),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const drops=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xcfefff,transparent:true,opacity:.55}));drops.visible=false;drops.frustumCulled=false;g.add(drops);
    g.userData.drops={m:drops,N,base:Array.from({length:N},()=>[(Math.random()-.5)*.35,Math.random()*2,(Math.random()-.5)*.35]),hx:-w/2+.15,hz:-d/2+.36};return g;},
  towel(c){const g=G7();M(g,new THREE.CylinderGeometry(.012,.012,.6,8).rotateZ(Math.PI/2),M7.chrome,0,1.25,.04,0,0,0,false);const d=drape(.5,.0,.0,.55,.03,.006).rotateY(Math.PI);M(g,d,new THREE.MeshStandardMaterial({map:FAB(c||0xf2efe6).map,roughness:1,side:THREE.DoubleSide}),0,1.26,.04,0,0,0);return g;},
  sideboard(w){const g=G7(),wd=WOOD(0x6b4a33);M(g,rbox(w,.6,.42,.02),wd,0,.4,0);for(let i=0;i<3;i++){M(g,rbox(w/3-.02,.54,.02,.005),wd,-w/2+w/3*(i+.5),.4,.21,0,0,0,false);M(g,new THREE.SphereGeometry(.016,8,6),M7.chrome,-w/2+w/3*(i+.5),.5,.23,0,0,0,false);}
    [-1,1].forEach(s=>[-1,1].forEach(t=>legT(g,s*(w/2-.06),t*.15,.1,M7.black,.02)));contact(g,0,0,w+.3,.7);return g;},
  radio(){const g=G7();M(g,rbox(.36,.2,.14,.03),WOOD(0x8a5a3a),0,.1,0);M(g,new THREE.CircleGeometry(.065,24),sm(0x1a1a1a,.9,0),-.08,.1,.071,0,0,0,false);
    const dial=new THREE.MeshStandardMaterial({color:0x222,emissive:0xffa040,emissiveIntensity:0});M(g,new THREE.PlaneGeometry(.12,.04),dial,.09,.13,.071,0,0,0,false);M(g,new THREE.CylinderGeometry(.018,.018,.02,12).rotateX(Math.PI/2),M7.chrome,.09,.06,.075,0,0,0,false);g.userData.dial=dial;return g;},
  shelfUnit(w,h,cs,kind){/* rayonnage de magasin, produits fusionnés */
    w=w||3;h=h||1.9;const g=G7(),n=5,P=[];M(g,new THREE.BoxGeometry(w,h,.04),sm(0xdfe3e6,.5,.3),0,h/2,-.02);[-1,1].forEach(s=>M(g,new THREE.BoxGeometry(.05,h,.5),sm(0x9aa3ad,.4,.6),s*w/2,h/2,.22));
    for(let r=0;r<n;r++){const y=.12+r*(h-.15)/n;M(g,new THREE.BoxGeometry(w,.03,.48),sm(0xeceff1,.4,.2),0,y,.22,0,0,0,false);M(g,new THREE.BoxGeometry(w,.06,.01),sm(cs[r%cs.length],.5,0),0,y,.465,0,0,0,false);
      let x=-w/2+.06;while(x<w/2-.1){const c=cs[Math.floor(Math.random()*cs.length)];if(kind==='bottle'||(kind!=='box'&&Math.random()<.35)){P.push(part(lth([[0,0],[.035,0],[.035,.17],[.012,.23],[.012,.26]],10),x+.035,y+.015,.25,c));x+=.085;}
        else{const bw=.09+Math.random()*.1,bh=.14+Math.random()*.16;for(let d=0;d<2;d++)P.push(part(new THREE.BoxGeometry(bw,bh,.14),x+bw/2,y+.015+bh/2,.33-d*.16,c));x+=bw+.012;}}}
    const mm=new THREE.Mesh(mergeParts(P),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.45}));mm.castShadow=true;g.add(mm);contact(g,0,.2,w+.3,.9);return g;},
  drinkFridge(w){const g=G7(),P=[];M(g,rbox(w,2.1,.7,.03),sm(0x2b2f36,.4,.4),0,1.05,0);M(g,new THREE.PlaneGeometry(w-.1,1.9),new THREE.MeshBasicMaterial({color:0xdff0ff}),0,1.05,-.3,0,0,0,false);
    for(let r=0;r<5;r++){const y=.2+r*.38;for(let i=0;i<w/.09-1;i++)P.push(part(lth([[0,0],[.032,0],[.032,.2],[.012,.26],[.012,.28]],10),-w/2+.1+i*.09,y,-.05,pick([0xd94f4f,0x4fb58a,0xe0b34a,0x2e6fd1,0xf2f2f2,0xff8a3a])));}
    const mm=new THREE.Mesh(mergeParts(P),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.25,emissive:0x222222}));g.add(mm);
    for(let i=0;i<Math.round(w/.7);i++){const x=-w/2+(i+.5)*w/Math.round(w/.7);M(g,new THREE.PlaneGeometry(w/Math.round(w/.7)-.04,1.9),M7.glass,x,1.05,.355,0,0,0,false).renderOrder=3;M(g,rbox(.03,.6,.03,.01),M7.steel,x+w/Math.round(w/.7)/2-.08,1.1,.38,0,0,0,false);}
    return g;},
  till(){const g=G7();M(g,rbox(1.6,.95,.6,.03),sm(0x2e6e4a,.5,0),0,.475,0);M(g,rbox(1.64,.04,.64,.01),sm(0x1a1c20,.3,.2),0,.97,0);M(g,new THREE.BoxGeometry(1,.01,.4),sm(0x101010,.8,0),-.25,.995,0,0,0,0,false);
    M(g,rbox(.32,.1,.28,.02),M7.black,.5,1.04,0);const sc=G7(g,.5,1.1,-.1);sc.rotation.x=-.3;M(sc,rbox(.3,.2,.03,.01),M7.black,0,.12,0);M(sc,new THREE.PlaneGeometry(.26,.16),new THREE.MeshBasicMaterial({color:0x5ad1ff}),0,.12,.017,0,0,0,false);return g;},
  atm(){const g=G7();M(g,rbox(.8,1.7,.6,.04),sm(0x3a4658,.35,.6),0,.85,0);M(g,rbox(.62,.5,.1,.03),M7.blackG,0,1.32,.28);M(g,new THREE.PlaneGeometry(.42,.3),new THREE.MeshBasicMaterial({color:0x4aa3ff}),0,1.34,.335,-.1,0,0,false);
    M(g,rbox(.4,.04,.22,.01),M7.steel,0,1.0,.36,.3,0,0);for(let i=0;i<3;i++)for(let j=0;j<4;j++)M(g,rbox(.05,.012,.04,.005),sm(0xdddddd,.5,0),-.08+i*.08,1.02,.3+j*.045,.3,0,0,false);M(g,new THREE.BoxGeometry(.3,.02,.04),M7.black,0,.78,.31,0,0,0,false);contact(g,0,0,1.1,.9);return g;},
  vault(){const g=G7();M(g,new THREE.CylinderGeometry(1.05,1.05,.2,40).rotateX(Math.PI/2),M7.steel,0,1.25,0);M(g,new THREE.TorusGeometry(1.05,.06,10,40),sm(0x8c8f94,.3,.9),0,1.25,.1);
    M(g,new THREE.CylinderGeometry(.16,.16,.1,20).rotateX(Math.PI/2),M7.chrome,0,1.25,.15);for(let i=0;i<3;i++)M(g,new THREE.CylinderGeometry(.03,.03,.9,10),M7.chrome,0,1.25,.22,0,0,i*Math.PI/3);
    for(let i=0;i<10;i++){const a=i/10*6.283;M(g,new THREE.CylinderGeometry(.04,.04,.06,10).rotateX(Math.PI/2),M7.chrome,Math.cos(a)*.9,1.25+Math.sin(a)*.9,.12,0,0,0,false);}return g;},
  hbed(){const g=G7(),st=M7.steel;M(g,rbox(1.0,.1,2.1,.03),sm(0xdfe5e8,.4,.4),0,.55,0);[-1,1].forEach(s=>[-1,1].forEach(t=>{M(g,new THREE.CylinderGeometry(.025,.025,.5,8),st,s*.45,.28,t*.98);M(g,new THREE.SphereGeometry(.04,8,6),M7.black,s*.45,.04,t*.98);}));
    M(g,rbox(.94,.18,2,.06),sm(0xf2f5f7,.9,0),0,.69,0);M(g,cushion(.6,.12,.38,.05,.04),FAB(0xffffff),0,.83,-.78);
    const dv=G7(g,0,.78,-.45);M(dv,drape(.94,1.4,.22,.25,.06).rotateY(Math.PI),new THREE.MeshStandardMaterial({map:FAB(0x8ec5e8).map,roughness:.95,side:THREE.DoubleSide}),0,0,0);
    M(g,rbox(1.0,.7,.06,.03),sm(0xdfe5e8,.4,.4),0,.85,-1.05);[-1,1].forEach(s=>M(g,tube([[s*.52,.85,-.5],[s*.52,.95,-.3],[s*.52,.95,.4],[s*.52,.85,.6]],.015,12,6),st,0,0,0,0,0,0,false));
    g.userData.duvet={g:dv,z0:-.45,len:1.4};contact(g,0,0,1.4,2.5);return g;},
  ivStand(){const g=G7();M(g,new THREE.CylinderGeometry(.012,.012,1.9,8),M7.steel,0,.95,0);for(let i=0;i<5;i++){const a=i/5*6.283;M(g,new THREE.BoxGeometry(.3,.02,.03).translate(.15,0,0),M7.steel,0,.06,0,0,a,0,false);}
    M(g,rbox(.14,.24,.05,.03),new THREE.MeshStandardMaterial({color:0xe8f6ff,transparent:true,opacity:.7,roughness:.1}),.06,1.7,0);return g;},
  monitor(){const g=G7();M(g,rbox(.4,.3,.12,.02),M7.black,0,0,0);const cv=document.createElement('canvas');cv.width=200;cv.height=140;const t=new THREE.CanvasTexture(cv);
    M(g,new THREE.PlaneGeometry(.34,.24),new THREE.MeshBasicMaterial({map:t}),0,0,.061,0,0,0,false);g.userData.ecg={cv,t,x:0};return g;},
  espresso(){const g=G7();M(g,rbox(.8,.48,.5,.04),M7.chrome,0,.24,0);M(g,rbox(.8,.08,.5,.02),M7.black,0,.52,0);[-.2,.2].forEach(x=>{M(g,new THREE.CylinderGeometry(.05,.05,.08,14),M7.black,x,.2,.27);M(g,new THREE.CylinderGeometry(.04,.035,.07,14),M7.ceramic,x,.04,.24);});
    for(let i=0;i<6;i++)M(g,new THREE.CylinderGeometry(.04,.035,.07,14),M7.ceramic,-.3+i*.12,.6,-.1,0,0,0,false);return g;},
  pastryCase(w){const g=G7(),P=[];M(g,rbox(w,.95,.7,.03),WOOD(0x6b3f2a),0,.475,0);M(g,new THREE.BoxGeometry(w-.06,.02,.6),sm(0xf2efe8,.4,0),0,.97,0);
    for(let i=0;i<w/.14-1;i++)for(let j=0;j<2;j++)P.push(part(j?new THREE.TorusGeometry(.04,.022,8,14).rotateX(Math.PI/2):new THREE.SphereGeometry(.05,10,8).scale(1,.6,1.4),-w/2+.12+i*.14,1.0+j*.2,(j?-.1:.12),pick([0xc8823a,0xe0b06a,0x8a4a2a,0xf2d9a0])));
    M(g,new THREE.BoxGeometry(w-.06,.02,.5),M7.glass,0,1.18,-.05,0,0,0,false);g.add(new THREE.Mesh(mergeParts(P),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6})));
    const gl=M(g,new THREE.PlaneGeometry(w-.04,.42),M7.glass,0,1.18,.33,-.3,0,0,false);gl.renderOrder=3;return g;},
  rack(w){const g=G7();M(g,tube([[-w/2,0,0],[-w/2,1.55,0],[w/2,1.55,0],[w/2,0,0]],.016,24,6),M7.chrome,0,0,0,0,0,0,false);[-1,1].forEach(s=>M(g,new THREE.BoxGeometry(.04,.03,.5),M7.chrome,s*w/2,.015,0));
    const n=Math.floor(w/.12);for(let i=0;i<n;i++){const x=-w/2+.1+i*(w-.2)/(n-1),c=pick([0xd94f4f,0x3d7be0,0xe0b34a,0x4fb58a,0x8a5fc9,0xf2f2ee,0x2f3a4a,0xff8fb1]);
      M(g,new THREE.TorusGeometry(.02,.004,4,10),M7.chrome,x,1.57,0,0,Math.PI/2,0,false);const cl=M(g,cushion(.03,.75,.44,.015,.01),FAB(c),x,1.15,0,0,0,(Math.random()-.5)*.04);cl.castShadow=true;}
    contact(g,0,0,w+.3,.7);return g;},
  mannequin(look7){const p=makePerson(look7[0],look7[1],0xe8e0d8,0xe8e0d8,{style:'chauve',top:look7[2],bottom:look7[3],bag:false,glasses:false,beard:false,shoe:0x1c1c1c,jacket:look7[4]||0x2b3445});
    p.position.y=.08;const g=G7();g.add(p);M(g,new THREE.CylinderGeometry(.25,.28,.08,24),M7.black,0,.04,0);contact(g,0,0,.8,.8);return g;},
  cabin(c){const g=G7(),wd=WOOD(0xe9e2d4);M(g,new THREE.BoxGeometry(.05,2.3,1.3),wd,-.65,1.15,0);M(g,new THREE.BoxGeometry(.05,2.3,1.3),wd,.65,1.15,0);M(g,new THREE.BoxGeometry(1.35,.05,1.3),wd,0,2.3,0);
    M(g,new THREE.BoxGeometry(1.3,2.3,.05),wd,0,1.15,-.65);const cg=new THREE.PlaneGeometry(1.25,1.95,20,2),p=cg.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*24)*.03);cg.computeVertexNormals();
    M(g,cg,new THREE.MeshStandardMaterial({map:FAB(c).map,roughness:.95,side:THREE.DoubleSide}),0,1.2,.62);M(g,new THREE.PlaneGeometry(.5,1.4),M7.mirror,0,1.3,-.62,0,0,0,false);return g;},
  waterCooler(){const g=G7();M(g,rbox(.36,1.0,.36,.03),M7.white,0,.5,0);M(g,lth([[0,0],[.13,0],[.14,.05],[.14,.32],[.06,.4],[.05,.44]],20),new THREE.MeshPhysicalMaterial({color:0x6fb8ff,transparent:true,opacity:.55,roughness:.05}),0,1.0,0);
    M(g,rbox(.06,.05,.05,.01),sm(0x2e6fd1,.4,0),-.06,.78,.19,0,0,0,false);M(g,rbox(.06,.05,.05,.01),sm(0xd94f4f,.4,0),.06,.78,.19,0,0,0,false);return g;},
  djBooth(){const g=G7();M(g,rbox(2,1.0,.8,.03),sm(0x15151a,.4,.3),0,.5,0);M(g,new THREE.BoxGeometry(2.02,.05,.82),sm(0xff5fd2,.3,0,{emissive:0xff5fd2,emissiveIntensity:1.5,k:'djl'}),0,.6,0,0,0,0,false);
    const decks=[];[-.55,.55].forEach(x=>{M(g,rbox(.5,.06,.45,.02),M7.plastic,x,1.03,0);const d=M(g,new THREE.CylinderGeometry(.17,.17,.02,28),sm(0x111111,.3,0),x,1.07,0);M(d,new THREE.BoxGeometry(.04,.025,.12),sm(0xe0e0e0,.4,0),0,.005,.08,0,0,0,false);decks.push(d);});
    M(g,rbox(.4,.08,.4,.02),M7.plastic,0,1.04,0);for(let i=0;i<6;i++)M(g,new THREE.CylinderGeometry(.015,.015,.02,8),sm(0x5aa9ff,.3,0,{emissive:0x5aa9ff,emissiveIntensity:2,k:'dot'}),-.12+i*.05,1.09,-.1,0,0,0,false);g.userData.decks=decks;return g;},
  bar(w){const g=G7(),P=[];M(g,rbox(w,1.05,.7,.03),sm(0x2a1a3a,.4,.2),0,.525,0);M(g,rbox(w+.1,.05,.8,.01),sm(0x111114,.15,.4),0,1.07,0);
    M(g,new THREE.BoxGeometry(w,.03,.03),sm(0x5aa9ff,.3,0,{emissive:0x5aa9ff,emissiveIntensity:2.5,k:'barl'}),0,.12,.36,0,0,0,false);
    const sh=G7(g,0,0,-1.1);M(sh,new THREE.BoxGeometry(w,2.2,.05),sm(0x15151a,.4,0),0,1.3,-.2);M(sh,new THREE.PlaneGeometry(w-.1,1.9),new THREE.MeshBasicMaterial({color:0x6a2a8a}),0,1.4,-.17,0,0,0,false);
    for(let r=0;r<3;r++){M(sh,new THREE.BoxGeometry(w-.1,.03,.3),M7.glass,0,.9+r*.5,-.05,0,0,0,false);for(let i=0;i<w/.13-1;i++)P.push(part(lth([[0,0],[.04,0],[.04,.18],[.015,.26],[.015,.3]],10),-w/2+.15+i*.13,.92+r*.5,-.05,pick([0x3a8a3a,0x8a5a2a,0xe0e0e0,0x2a3a8a,0xc0392b,0xe0b34a])));}
    sh.add(new THREE.Mesh(mergeParts(P),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.1,metalness:.1,emissive:0x222233})));return g;},
  gymMat(){const g=G7();M(g,rbox(.8,.02,1.8,.01),sm(0x2e6f9c,.9,0),0,.01,0,0,0,0,false);
    [-.55,.55].forEach(x=>{const d=G7(g,x,.07,.75,0);M(d,new THREE.CylinderGeometry(.015,.015,.32,8).rotateZ(Math.PI/2),M7.steel);[-.13,.13].forEach(o=>M(d,new THREE.CylinderGeometry(.06,.06,.05,16).rotateZ(Math.PI/2),M7.black,o,0,0));});
    M(g,new THREE.SphereGeometry(.28,24,16),sm(0xd94f4f,.5,0),.65,.28,-.6);return g;},
  guitar(){const g=G7();const body=new THREE.Shape();body.absellipse(0,0,.17,.2,0,Math.PI*2);const bg=new THREE.ExtrudeGeometry(body,{depth:.08,bevelEnabled:true,bevelSize:.01,bevelThickness:.01,bevelSegments:2});
    const gu=G7(g,0,.05,0);gu.rotation.x=-.25;M(gu,bg,WOOD(0xc8823a),0,.32,-.04);M(gu,new THREE.CylinderGeometry(.045,.045,.01,20).rotateX(Math.PI/2),M7.black,0,.34,.06,0,0,0,false);M(gu,new THREE.CircleGeometry(.12,24),sm(0x5a2a10,.6,0),0,.18,.06,0,0,0,false);
    M(gu,rbox(.05,.62,.03,.01),WOOD(0x3a2a20),0,.82,.02);M(gu,rbox(.08,.14,.03,.01),M7.black,0,1.18,.02);for(let i=0;i<6;i++)M(gu,new THREE.CylinderGeometry(.002,.002,.95,3),M7.chrome,-.015+i*.006,.72,.055,0,0,0,false);
    M(g,new THREE.BoxGeometry(.3,.04,.25),M7.black,0,.02,0);M(g,new THREE.CylinderGeometry(.012,.012,.6,6),M7.black,0,.3,-.12,-.3,0,0);g.userData.gu=gu;return g;},
  posterTex(lines,bg,fg){return ctex('pst'+lines.join('|'),256,360,(g,W,H)=>{g.fillStyle=bg;g.fillRect(0,0,W,H);g.fillStyle=fg;g.textAlign='center';g.font='700 34px Rajdhani, Arial Narrow, sans-serif';lines.forEach((l,i)=>{g.font=(i?'500 22px':'700 36px')+' Barlow, sans-serif';g.fillText(l,W/2,70+i*48);});});}
};
