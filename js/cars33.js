'use strict';
/* ==========================================================================
   v33 · GAMME AURORE : carrosseries dessinées une par une + véhicules « vivants »
   - 11 nouvelles silhouettes (SUV de luxe, berline, GT électrique, supercar,
     hypercar, 4x4, citadine, limousines…)
   - Gréement à la demande (AMC.rig) : vraies portières, capot, coffre/hayon,
     baie moteur, clignotants, phares, rétroviseurs rabattables, sellerie,
     éclairage d'ambiance, jantes, vitres teintées, plaques et finitions.
   ========================================================================== */
(function(){
const AMC=window.AMC={};
const COARSE=matchMedia('(pointer: coarse)').matches;
/* ---------- profils : [z, demi-largeur, bas, haut] ---------- */
Object.assign(CAR7,{
  am_titan:{body:[[2.38,.55,.5,.78],[2.3,.88,.42,.92],[2.08,.97,.4,1.0],[1.6,.99,.4,1.04],[.9,1.0,.4,1.06],[0,1.0,.4,1.08],[-1,1.0,.41,1.1],[-1.8,.98,.42,1.11],[-2.2,.93,.45,1.08],[-2.34,.8,.5,1.0],[-2.38,.58,.56,.9]],
    gh:{zf:1.22,zws:.38,zrw:-1.5,zr:-2.14,belt:1.07,roof:1.66,w:.92,wt:.72,deck:1.1,rearGlass:true,pil:[-.32]},wh:{r:.41,x:.86,z:[1.45,-1.45],w:.3},ne:4.6,ng:3.4},
  am_prestige:{body:[[2.56,.5,.5,.68],[2.48,.82,.4,.82],[2.26,.94,.34,.92],[1.76,.98,.33,.97],[1.05,1.0,.33,1.0],[.25,1.0,.33,1.01],[-.6,1.0,.33,1.02],[-1.4,.99,.34,1.04],[-1.98,.95,.36,1.06],[-2.3,.88,.4,1.03],[-2.5,.74,.46,.93],[-2.55,.52,.52,.83]],
    gh:{zf:1.3,zws:.3,zrw:-.95,zr:-1.98,belt:.99,roof:1.5,w:.9,wt:.66,deck:1.04,rearGlass:false,pil:[-.32]},wh:{r:.37,x:.83,z:[1.56,-1.56],w:.26},ne:4.2,ng:3},
  am_volt:{body:[[2.45,.5,.36,.56],[2.36,.84,.3,.66],[2.1,.97,.28,.74],[1.5,1.0,.28,.8],[.8,1.01,.28,.83],[0,1.01,.28,.85],[-.8,1.01,.29,.88],[-1.5,.99,.3,.9],[-2.0,.94,.33,.88],[-2.3,.82,.38,.82],[-2.44,.56,.43,.72]],
    gh:{zf:1.05,zws:.05,zrw:-1.2,zr:-2.15,belt:.86,roof:1.33,w:.86,wt:.6,deck:.9,rearGlass:false,pil:[-.48]},wh:{r:.37,x:.86,z:[1.5,-1.48],w:.29},ne:4.6,ng:2.9},
  am_rosso:{body:[[2.32,.45,.34,.5],[2.2,.86,.26,.62],[1.95,1.02,.22,.7],[1.3,1.06,.22,.74],[.5,1.06,.22,.76],[-.3,1.07,.22,.8],[-1.1,1.07,.23,.86],[-1.7,1.04,.25,.88],[-2.05,.98,.29,.86],[-2.22,.84,.35,.8],[-2.27,.58,.41,.7]],
    gh:{zf:.62,zws:-.16,zrw:-.78,zr:-1.95,belt:.76,roof:1.17,w:.85,wt:.56,deck:.87,rearGlass:false,pil:[]},wh:{r:.37,x:.9,z:[1.4,-1.42],w:.32},ne:4.8,ng:2.8,sporty:true,twoTone:0x0d0e10},
  am_hyper:{body:[[2.3,.4,.3,.44],[2.15,.86,.24,.56],[1.85,1.05,.2,.64],[1.2,1.08,.2,.7],[.5,1.08,.2,.72],[-.3,1.09,.2,.76],[-1.1,1.09,.21,.84],[-1.7,1.06,.23,.88],[-2.05,1.0,.27,.86],[-2.22,.86,.33,.8],[-2.27,.6,.38,.7]],
    gh:{zf:.82,zws:.02,zrw:-.55,zr:-1.75,belt:.72,roof:1.1,w:.8,wt:.55,deck:.86,rearGlass:false,pil:[]},wh:{r:.37,x:.92,z:[1.38,-1.44],w:.33},ne:5,ng:2.6,sporty:true,twoTone:0x0b0c0e},
  am_atlas:{body:[[2.4,.82,.5,.86],[2.36,.95,.45,1.02],[2.2,.97,.44,1.08],[1.6,.98,.44,1.1],[0,.98,.44,1.12],[-1.6,.98,.44,1.13],[-2.2,.97,.45,1.13],[-2.36,.95,.47,1.1],[-2.4,.85,.52,1.02]],
    gh:{zf:1.5,zws:1.22,zrw:-2.08,zr:-2.3,belt:1.13,roof:1.98,w:.94,wt:.88,deck:1.13,rearGlass:true,pil:[.12,-1.15]},wh:{r:.43,x:.86,z:[1.5,-1.5],w:.31},ne:7,ng:7},
  am_lagune:{body:[[2.2,.55,.5,.76],[2.12,.86,.42,.9],[1.92,.93,.4,.97],[1.4,.95,.4,1.0],[.6,.96,.4,1.02],[-.3,.96,.41,1.04],[-1.2,.95,.42,1.06],[-1.8,.92,.44,1.06],[-2.1,.86,.48,1.02],[-2.2,.7,.53,.92]],
    gh:{zf:1.12,zws:.36,zrw:-1.6,zr:-2.04,belt:1.04,roof:1.62,w:.88,wt:.72,deck:1.06,rearGlass:true,pil:[-.3]},wh:{r:.38,x:.8,z:[1.32,-1.32],w:.26},ne:4.4,ng:3.6},
  am_lumi:{body:[[1.95,.5,.46,.66],[1.88,.78,.38,.8],[1.68,.86,.34,.88],[1.2,.88,.34,.92],[.5,.89,.34,.94],[-.3,.89,.35,.96],[-1.0,.88,.36,.98],[-1.55,.85,.38,.99],[-1.86,.79,.42,.96],[-1.94,.6,.48,.86]],
    gh:{zf:1.0,zws:.15,zrw:-1.4,zr:-1.86,belt:.96,roof:1.52,w:.78,wt:.64,deck:.98,rearGlass:true,pil:[-.55]},wh:{r:.33,x:.74,z:[1.2,-1.24],w:.22},ne:4.4,ng:3.8},
  am_sovereign:{body:[[2.75,.5,.5,.8],[2.68,.86,.42,.95],[2.45,.97,.38,1.04],[1.9,1.0,.37,1.08],[1.0,1.01,.37,1.1],[0,1.01,.37,1.11],[-1.0,1.01,.38,1.12],[-1.8,1.0,.39,1.13],[-2.35,.96,.42,1.12],[-2.62,.88,.46,1.06],[-2.75,.7,.5,.96],[-2.78,.5,.54,.86]],
    gh:{zf:1.45,zws:.42,zrw:-1.05,zr:-2.15,belt:1.1,roof:1.6,w:.92,wt:.7,deck:1.13,rearGlass:false,pil:[-.32]},wh:{r:.4,x:.86,z:[1.75,-1.62],w:.27},ne:5,ng:3.5},
  am_pullman:{body:[[3.3,.5,.5,.8],[3.22,.86,.42,.95],[3.0,.97,.38,1.04],[2.4,1.0,.37,1.08],[1.2,1.01,.37,1.1],[0,1.01,.37,1.11],[-1.2,1.01,.38,1.12],[-2.3,1.0,.39,1.13],[-2.9,.96,.42,1.12],[-3.17,.88,.46,1.06],[-3.3,.7,.5,.96],[-3.33,.5,.54,.86]],
    gh:{zf:2.0,zws:.98,zrw:-1.6,zr:-2.7,belt:1.1,roof:1.62,w:.92,wt:.7,deck:1.13,rearGlass:false,pil:[.25,-.95]},wh:{r:.4,x:.86,z:[2.25,-2.15],w:.27},ne:5,ng:3.5}
});
CAR7.am_coupe=Object.assign({},CAR7.porsche||CAR7.sport,{sporty:true});
/* vitesse max (m/s) et accélération en jeu */
const PERF={am_titan:[37,1.25],am_prestige:[35,1.15],am_volt:[45,1.6],am_rosso:[50,1.75],am_hyper:[54,1.9],am_atlas:[31,1.0],am_lagune:[29,1.0],am_lumi:[26,1.05],am_sovereign:[34,1.05],am_pullman:[29,.85],am_coupe:[44,1.5]};
Object.keys(PERF).forEach(t=>{CT[t]=[1,1,1,PERF[t][0],PERF[t][1]];});
const SND={am_titan:{f:42,k:3.6,w:'sawtooth',cut:520,cyl:8,burble:.55,sub:.5},am_prestige:{f:46,k:3.2,w:'sawtooth',cut:400,cyl:8,burble:.2,sub:.35},am_volt:{f:120,k:9,w:'sine',cut:1600,cyl:1,burble:0,sub:.05},
  am_rosso:{f:68,k:7,w:'sawtooth',cut:1150,cyl:8,burble:.4,sub:.4},am_hyper:{f:72,k:7.4,w:'sawtooth',cut:1300,cyl:12,burble:.35,sub:.45},am_atlas:{f:38,k:2.8,w:'square',cut:420,cyl:8,burble:.7,sub:.6},
  am_lagune:{f:44,k:3.3,w:'triangle',cut:360,cyl:4,burble:.12,sub:.15},am_lumi:{f:140,k:8,w:'sine',cut:1400,cyl:1,burble:0,sub:.02},am_sovereign:{f:40,k:2.6,w:'triangle',cut:300,cyl:12,burble:.05,sub:.3},
  am_pullman:{f:40,k:2.4,w:'triangle',cut:280,cyl:12,burble:.05,sub:.35},am_coupe:{f:56,k:5.4,w:'sawtooth',cut:820,cyl:6,burble:.5,sub:.4}};
if(typeof ENG19!=='undefined')Object.assign(ENG19,SND);
AMC.SND=SND;AMC.isAM=t=>!!PERF[t];
/* ---------- téléphones : peinture plus légère (sans vernis calculé) ---------- */
if(COARSE&&typeof paint7==='function'){const P={};paint7=function(c){if(P[c])return P[c];const w=new THREE.Color(c),l=(w.r+w.g+w.b)/3;const m=new THREE.MeshStandardMaterial({color:c,metalness:l>.6||l<.02?.15:.45,roughness:.3,envMapIntensity:1.2});m.userData.p4Paintable=true;return P[c]=m;};}
/* ---------- matériaux du gréement ---------- */
const MAT={dark:sm(0x0c0d10,.6,.05),bay:sm(0x1a1c20,.7,.2),carpet:sm(0x24262a,.95,0),eng:sm(0x2c2f34,.45,.6),engRed:sm(0xb3121e,.35,.3),alu:sm(0xc7ccd2,.25,.9),
  carbon:new THREE.MeshStandardMaterial({color:0x15171b,roughness:.35,metalness:.4}),led:new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff6e6,emissiveIntensity:1.6}),
  ledR:new THREE.MeshStandardMaterial({color:0x5a0606,emissive:0xff1a10,emissiveIntensity:.9}),gold:sm(0xc9a24a,.25,1),screen:new THREE.MeshStandardMaterial({color:0x0b1a2a,emissive:0x2e6fd1,emissiveIntensity:.9,roughness:.2})};
AMC.MAT=MAT;
try{CM7.glass.color.setHex(0x16222c);CM7.glass.envMapIntensity=.9;CM7.glass.opacity=.78;}catch(e){}
function hexTex(){return ctex('hex33',128,128,(g,W,H)=>{g.fillStyle='#08090b';g.fillRect(0,0,W,H);g.strokeStyle='#4b5058';g.lineWidth=3;const r=10;for(let y=0;y<H+r;y+=r*1.5)for(let x=0;x<W+r;x+=r*1.74){const ox=(Math.round(y/(r*1.5))%2)*r*.87;g.beginPath();for(let k=0;k<6;k++){const a=Math.PI/3*k+Math.PI/6;g.lineTo(x+ox+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8);}g.closePath();g.stroke();}});}
const HEXM=tm(rep(hexTex(),3),0xffffff,.5,.4);
/* ---------- surfaces qui épousent la carrosserie ---------- */
function sideGrid(S,ne,sd,zA,zB,y0,y1,off,wantSign,ny){
  ny=ny||8;const rows=S.filter(s=>s.z<=zA&&s.z>=zB);if(rows.length<2)return null;
  const p=[];rows.forEach(s=>{for(let k=0;k<=ny;k++){let y=y0+(y1-y0)*k/ny;y=Math.min(Math.max(y,s.b+.012),s.t-.012);const x=Math.max(0,surfX(s,y,ne));p.push(sd*(x+off),y,s.z);}});
  const ix=[];for(let i=0;i<rows.length-1;i++)for(let k=0;k<ny;k++){const a=i*(ny+1)+k,b=a+1,c=a+ny+1,d=c+1;ix.push(a,c,b,b,c,d);}
  let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();
  const n=g.attributes.normal;let sx=0;for(let i=0;i<n.count;i++)sx+=n.getX(i);
  if(Math.sign(sx)!==wantSign){for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t;}g.setIndex(ix);g.computeVertexNormals();}
  return g;
}
function topY(s,x,ne){const w=Math.max(.01,s.wt),c=Math.min(1,Math.abs(x)/w),cs=Math.pow(c,ne/2),sn=Math.sqrt(Math.max(0,1-cs*cs));return (s.t+s.b)/2+(s.t-s.b)/2*Math.pow(sn,2/ne);}
function topGrid(S,ne,zA,zB,xf,off){
  const rows=S.filter(s=>s.z<=zA&&s.z>=zB);if(rows.length<2)return null;const nx=12,p=[];
  rows.forEach(s=>{for(let k=0;k<=nx;k++){const x=(k/nx*2-1)*s.wt*xf;p.push(x,topY(s,x,ne)+off,s.z);}});
  const ix=[];for(let i=0;i<rows.length-1;i++)for(let k=0;k<nx;k++){const a=i*(nx+1)+k,b=a+1,c=a+nx+1,d=c+1;ix.push(a,b,c,b,d,c);}
  let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();
  const n=g.attributes.normal;let sy=0;for(let i=0;i<n.count;i++)sy+=n.getY(i);
  if(sy<0){for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t;}g.setIndex(ix);g.computeVertexNormals();}
  return g;
}
function rimGeo(rr,hw,n,style){
  const k='rim33'+rr+hw+n+style;if(GEO7[k])return GEO7[k];
  const sh=new THREE.Shape();sh.absarc(0,0,rr,0,Math.PI*2,false);const gap=style===2?.06:style===1?.09:.2,inn=style===3?.5:.36;
  for(let i=0;i<n;i++){const a0=i/n*Math.PI*2+gap,a1=(i+1)/n*Math.PI*2-gap,h=new THREE.Path();h.moveTo(Math.cos(a0)*rr*inn,Math.sin(a0)*rr*inn);h.absarc(0,0,rr*.84,a0+.03,a1-.03,false);h.lineTo(Math.cos(a1)*rr*inn,Math.sin(a1)*rr*inn);h.absarc(0,0,rr*inn,a1,a0,true);sh.holes.push(h);}
  return GEO7[k]=new THREE.ExtrudeGeometry(sh,{depth:.03,bevelEnabled:true,bevelThickness:.012,bevelSize:.008,bevelSegments:2,curveSegments:20}).rotateY(Math.PI/2).translate(hw*.55,0,0);
}
const RIMS=[{n:'Alu chromé 5 branches',sp:5,st:0,c:0xc9ced6,m:1,r:.22},{n:'Noir brillant 10 branches',sp:10,st:1,c:0x1c1d20,m:.6,r:.3},{n:'Or forgé multibranches',sp:14,st:2,c:0xc9a24a,m:1,r:.25},{n:'Bronze turbine',sp:7,st:3,c:0x7a5a3a,m:.9,r:.3},{n:'Titane aéro',sp:5,st:3,c:0x8a9098,m:.9,r:.28}];
const TINTS=[{n:'Vitrage d’origine',o:.55,c:0x2a3a48},{n:'Teinté 35 %',o:.82,c:0x141c24},{n:'Limousine (opaque)',o:.95,c:0x06080b}];
const SEATS=[{n:'Cuir noir',c:0x1f2023},{n:'Cuir cognac',c:0x7a4325},{n:'Cuir crème',c:0xe2d6bf},{n:'Alcantara rouge',c:0x8f1520},{n:'Cuir bleu nuit',c:0x1d2b4a}];
const AMBI=[{n:'Éteint',c:0},{n:'Blanc chaud',c:0xffe2b8},{n:'Bleu lagune',c:0x2fc6ff},{n:'Rouge Aurore',c:0xff2a3a},{n:'Violet néon',c:0xb44bff},{n:'Or',c:0xffc23d}];
const FIN=[{n:'Métallisé brillant'},{n:'Mat satiné'},{n:'Nacré irisé'}];
AMC.RIMS=RIMS;AMC.TINTS=TINTS;AMC.SEATS=SEATS;AMC.AMBI=AMBI;AMC.FIN=FIN;
function finishMat(c,f){if(!f)return paint7(c);const k='fin'+c+'_'+f;if(MT7[k])return MT7[k];let m;
  if(f===1)m=new THREE.MeshStandardMaterial({color:c,roughness:.62,metalness:.25});
  else m=COARSE?new THREE.MeshStandardMaterial({color:c,roughness:.22,metalness:.55}):new THREE.MeshPhysicalMaterial({color:c,roughness:.25,metalness:.5,clearcoat:1,clearcoatRoughness:.05,iridescence:.85,iridescenceIOR:1.4});
  m.userData.p4Paintable=true;return MT7[k]=m;}
/* ---------- détails propres à chaque modèle (ajoutés au châssis) ---------- */
function frontZ(S,ne,y){return edgeZ(S,0,y,ne,true);}
function backZ(S,ne,y){return edgeZ(S,0,y,ne,false);}
const EXTRA={
  am_titan(ch,C){const S=C.S,ne=C.D.ne,z=frontZ(S,ne,.66);M(ch,rbox(1.02,.4,.07,.06),M7.chrome,0,.66,z-.02,0,0,0,false);M(ch,new THREE.PlaneGeometry(.92,.32),HEXM,0,.66,z+.018,0,0,0,false);
    [-1,1].forEach(sd=>{M(ch,rbox(.3,.03,.04,.01),MAT.led,sd*.62,.84,frontZ(S,ne,.84)+.02,0,0,0,false);M(ch,rbox(.28,.12,.05,.02),HEXM,sd*.6,.42,frontZ(S,ne,.42)+.01,0,0,0,false);
      M(ch,rbox(.02,.05,.42,.01),M7.chrome,sd*(surfX(H7at(S,1.0),.8,ne)+.006),.8,1.0,0,0,0,false);[-.12,.12].forEach(o=>M(ch,new THREE.CylinderGeometry(.045,.045,.08,14).rotateX(Math.PI/2),M7.chrome,sd*.55+o,.42,backZ(S,ne,.42)-.01,0,0,0,false));});},
  am_prestige(ch,C){const S=C.S,ne=C.D.ne,z=frontZ(S,ne,.68);M(ch,rbox(.86,.3,.06,.05),M7.chrome,0,.68,z-.02,0,0,0,false);for(let i=0;i<5;i++)M(ch,new THREE.BoxGeometry(.8,.016,.02),CM7.trim,0,.58+i*.05,z+.015,0,0,0,false);
    M(ch,new THREE.TorusGeometry(.07,.008,6,20),M7.chrome,0,.68,z+.035,0,0,0,false);M(ch,rbox(1.4,.025,.03,.01),M7.chrome,0,.74,backZ(S,ne,.74)-.01,0,0,0,false);},
  am_volt(ch,C){const S=C.S,ne=C.D.ne;[-1,1].forEach(sd=>{const z=edgeZ(S,sd*.64,.62,ne,true);[[-.05,.03],[.05,.03],[-.05,-.03],[.05,-.03]].forEach(([a,b])=>M(ch,new THREE.SphereGeometry(.026,10,8),MAT.led,sd*.64+a,.62+b,z+.04,0,0,0,false));});
    const z=backZ(S,ne,.8);M(ch,rbox(1.7,.045,.04,.015),MAT.ledR,0,.8,z-.01,0,0,0,false);M(ch,rbox(1.0,.06,.06,.02),CM7.trim,0,.38,frontZ(S,ne,.38)-.01,0,0,0,false);},
  am_rosso(ch,C){const S=C.S,ne=C.D.ne,G=C.D.gh;M(ch,rbox(1.9,.04,.3,.015),MAT.carbon,0,.27,frontZ(S,ne,.3)-.12,0,0,0,false);
    [-1,1].forEach(sd=>{M(ch,rbox(.3,.03,.03,.01),MAT.led,sd*.66,.6,edgeZ(S,sd*.66,.6,ne,true)+.03,0,0,-sd*.12,false);M(ch,rbox(.2,.22,.5,.04),MAT.dark,sd*(C.D.wh.x+.06),.66,-.42,0,0,sd*.2,false);
      M(ch,rbox(.42,.03,.03,.01),MAT.ledR,sd*.55,.78,edgeZ(S,sd*.55,.78,ne,false)-.02,0,0,0,false);});
    M(ch,rbox(1.4,.035,.28,.012),MAT.carbon,0,G.deck+.06,backZ(S,ne,.8)+.25,0,0,0,true);M(ch,rbox(.08,.04,.04,.01),MAT.gold,0,.62,frontZ(S,ne,.62)+.02,0,0,0,false);},
  am_hyper(ch,C){const S=C.S,ne=C.D.ne,G=C.D.gh;M(ch,rbox(2.05,.04,.42,.015),MAT.carbon,0,.25,frontZ(S,ne,.28)-.18,0,0,0,false);
    [-1,1].forEach(sd=>{M(ch,rbox(.44,.025,.03,.01),MAT.led,sd*.62,.5,edgeZ(S,sd*.62,.5,ne,true)+.03,0,0,-sd*.18,false);M(ch,rbox(.06,.3,.22,.02),MAT.carbon,sd*.62,1.07,backZ(S,ne,.86)+.32,0,0,0,true);
      M(ch,rbox(.08,.18,.6,.03),MAT.dark,sd*(C.D.wh.x+.1),.55,-.55,0,0,sd*.25,false);});
    M(ch,rbox(1.95,.05,.36,.015),MAT.carbon,0,1.22,backZ(S,ne,.86)+.3,0,0,0,true);M(ch,rbox(1.9,.035,.035,.01),MAT.ledR,0,.82,backZ(S,ne,.82)-.01,0,0,0,false);
    M(ch,new THREE.CylinderGeometry(.08,.08,.1,16).rotateX(Math.PI/2),M7.chrome,0,.55,backZ(S,ne,.55)-.02,0,0,0,false);for(let i=-3;i<=3;i++)M(ch,new THREE.BoxGeometry(.015,.16,.3),MAT.carbon,i*.22,.32,backZ(S,ne,.34)+.1,0,0,0,false);},
  am_atlas(ch,C){const S=C.S,ne=C.D.ne,G=C.D.gh,z=frontZ(S,ne,.78);M(ch,rbox(.8,.34,.05,.03),CM7.trim,0,.78,z,0,0,0,false);for(let i=-3;i<=3;i++)M(ch,new THREE.BoxGeometry(.03,.3,.03),M7.chrome,i*.1,.78,z+.035,0,0,0,false);
    [-1,1].forEach(sd=>{const hz=edgeZ(S,sd*.66,.82,ne,true);M(ch,new THREE.CylinderGeometry(.13,.13,.06,20).rotateX(Math.PI/2),M7.chrome,sd*.66,.82,hz+.02,0,0,0,false);M(ch,new THREE.CylinderGeometry(.1,.1,.065,20).rotateX(Math.PI/2),MAT.led,sd*.66,.82,hz+.03,0,0,0,false);
      M(ch,rbox(.2,.06,1.8,.02),MAT.alu,sd*(C.D.wh.x+.02),.45,0,0,0,0,false);M(ch,tube([[sd*.72,G.roof+.03,G.zws-.1],[sd*.72,G.roof+.08,G.zws-.3],[sd*.72,G.roof+.08,G.zrw+.3],[sd*.72,G.roof+.03,G.zrw+.1]],.025,12,6),CM7.trim,0,0,0,0,0,0,false);});
    const rz=backZ(S,ne,.85)-.13;const sp=new THREE.Mesh(new THREE.TorusGeometry(.3,.09,10,26),CM7.rubber);sp.position.set(0,.88,rz);ch.add(sp);M(ch,new THREE.CylinderGeometry(.24,.24,.12,20).rotateX(Math.PI/2),MAT.dark,0,.88,rz,0,0,0,false);},
  am_lagune(ch,C){const S=C.S,ne=C.D.ne,G=C.D.gh,z=frontZ(S,ne,.66);M(ch,rbox(.9,.26,.06,.05),CM7.trim,0,.66,z-.01,0,0,0,false);M(ch,new THREE.PlaneGeometry(.82,.2),HEXM,0,.66,z+.025,0,0,0,false);
    [-.7,.7].forEach(x=>M(ch,tube([[x,G.roof+.02,G.zws-.05],[x,G.roof+.07,G.zws-.25],[x,G.roof+.07,G.zrw+.25],[x,G.roof+.02,G.zrw+.05]],.022,12,6),M7.steel,0,0,0,0,0,0,false));},
  am_lumi(ch,C){const S=C.S,ne=C.D.ne,z=frontZ(S,ne,.7);M(ch,rbox(1.3,.03,.03,.01),MAT.led,0,.74,z+.02,0,0,0,false);M(ch,rbox(.7,.18,.04,.04),paint7(0xf2f2f2),0,.56,frontZ(S,ne,.56)+.005,0,0,0,false);
    M(ch,rbox(1.4,.035,.03,.01),MAT.ledR,0,.86,backZ(S,ne,.86)-.01,0,0,0,false);},
  am_sovereign(ch,C){luxe(ch,C);},am_pullman(ch,C){luxe(ch,C);},
  am_coupe(ch,C){const S=C.S,ne=C.D.ne;M(ch,rbox(1.55,.035,.03,.01),MAT.ledR,0,.86,backZ(S,ne,.86)-.01,0,0,0,false);}
};
function luxe(ch,C){const S=C.S,ne=C.D.ne,G=C.D.gh,z=frontZ(S,ne,.74);
  M(ch,rbox(.6,.42,.12,.03),M7.chrome,0,.74,z-.02,0,0,0,false);for(let i=-6;i<=6;i++)M(ch,new THREE.BoxGeometry(.018,.36,.03),M7.chrome,i*.04,.74,z+.05,0,0,0,false);
  M(ch,rbox(.62,.05,.14,.02),M7.chrome,0,.97,z-.02,0,0,0,false);
  const fig=G7(ch,0,1.0,z-.02);M(fig,new THREE.CylinderGeometry(.012,.03,.1,8),M7.chrome,0,.05,0,0,0,0,false);M(fig,new THREE.SphereGeometry(.025,10,8),M7.chrome,0,.11,0,0,0,0,false);M(fig,new THREE.BoxGeometry(.012,.06,.08),M7.chrome,0,.09,-.04,.5,0,0,false);
  [-1,1].forEach(sd=>{M(ch,rbox(.36,.03,.04,.01),MAT.led,sd*.66,.82,edgeZ(S,sd*.66,.82,ne,true)+.02,0,0,0,false);});
  M(ch,rbox(1.6,.04,.04,.01),M7.chrome,0,.42,frontZ(S,ne,.42)+.005,0,0,0,false);
  ch.add(new THREE.Mesh(ribbonH(C.H,C.D.ng,G.roof-.06,.03,G.zws-.05,G.zrw+.05,.004),M7.chrome));}
const _mk=makeCar;
makeCar=function(color,type){
  const g=_mk(color,type),D=CAR7[type];if(!D||!g.userData.chassis)return g;
  const ch=g.userData.chassis,C=buildCarGeo(type);g.userData.type33=type;
  if(D.twoTone){const gh=ch.children[1];if(gh&&Array.isArray(gh.material)){gh.material=gh.material.slice();gh.material[0]=paint7(D.twoTone);}}
  if(EXTRA[type])try{EXTRA[type](ch,C);}catch(e){console.warn('extra33',type,e);}
  return g;
};
/* ---------- gréement à la demande ---------- */
function cutGlass(type,doors,G){
  const key='cut33'+type;if(GEO7[key])return GEO7[key];const base=buildCarGeo(type).gh,g=base.clone(),pos=g.attributes.position,idx=g.index.array,keep=[[],[],[]];
  base.groups.forEach(gr=>{for(let i=gr.start;i<gr.start+gr.count;i+=3){const a=idx[i],b=idx[i+1],c=idx[i+2],cx=(pos.getX(a)+pos.getX(b)+pos.getX(c))/3,cy=(pos.getY(a)+pos.getY(b)+pos.getY(c))/3,cz=(pos.getZ(a)+pos.getZ(b)+pos.getZ(c))/3;
    let drop=false;if(gr.materialIndex===1){if(Math.abs(cx)>G.wt*.55&&cy>G.belt&&doors.some(d=>cz<=d[0]+.01&&cz>=d[1]-.01))drop=true;if(G.rearGlass&&cz<G.zrw-.05&&Math.abs(cx)<G.wt*.8&&Math.abs(cx)<.75)drop=true;}
    if(!drop)keep[gr.materialIndex].push(a,b,c);}});
  const ix=[];g.clearGroups();keep.forEach((l,k)=>{g.addGroup(ix.length,l.length,k);ix.push(...l);});g.setIndex(ix);return GEO7[key]=g;
}
function doorRanges(type){const D=CAR7[type],G=D.gh,sp=isSporty7(type);const f1=sp?G.zrw-.12:(G.pil[0]!=null?G.pil[0]:G.zrw);const out=[[G.zf-.02,f1+.02,'av']];
  if(!sp&&G.pil.length){out.push([G.pil[0]-.02,(G.pil[1]!=null?G.pil[1]:G.zrw-.04),'ar']);}return out;}
AMC.rig=function(mesh){
  const u=mesh.userData;if(!u.chassis)return null;if(u.rig33)return u.rig33;
  const type=u.type33||Object.keys(CAR7).find(k=>GEO7[k]&&GEO7[k].body===u.chassis.children[0].geometry)||'sedan';
  const C=buildCarGeo(type),D=C.D,G=D.gh,S=C.S,H=C.H,ne=D.ne,ch=u.chassis,body=ch.children[0],gh=ch.children[1];
  const paint=Array.isArray(body.material)?body.material[0]:body.material;
  const R={type,doors:[],hood:null,trunk:null,ind:[],heads:[],mirrors:[],seats:[],ambient:[],plates:[],paintSlots:[],glass:[],rims:[],state:{doors:0,hood:0,trunk:0,lights:0,sig:0,mir:0}};
  /* vitres découpées pour laisser bouger portières et hayon */
  const DR=doorRanges(type);gh.geometry=cutGlass(type,DR,G);gh.material=gh.material.slice();R.glassMat=CM7.glass.clone();gh.material[1]=R.glassMat;
  R.paintSlots.push([body,0]);if(!D.twoTone)R.paintSlots.push([gh,0]);
  const jambMat=sm(0x16171a,.8,0);
  DR.forEach(([zA,zB,k],di)=>{[-1,1].forEach(sd=>{
    const suicide=(type==='am_sovereign'||type==='am_pullman')&&k==='ar';
    const hz=suicide?zB:zA,hs=H7at(S,hz),hx=sd*(surfX(hs,(G.belt+.44)/2,ne)+.006);
    const piv=G7(ch,hx,0,hz);const off=new THREE.Group();off.position.set(-hx,0,-hz);piv.add(off);
    const outer=sideGrid(S,ne,sd,zA,zB,.44,G.belt-.03,.006,sd);if(!outer)return;const om=new THREE.Mesh(outer,paint);om.castShadow=true;off.add(om);R.paintSlots.push([om,-1]);
    const inner=sideGrid(S,ne,sd,zA,zB,.46,G.belt-.05,-.04,-sd);if(inner){const im=new THREE.Mesh(inner,CM7.seat);off.add(im);R.seats.push(im);}
    const win=sideGrid(H,D.ng,sd,zA-.03,zB+.03,G.belt+.01,G.roof-.05,.003,sd,6);if(win){const wm=new THREE.Mesh(win,R.glassMat);off.add(wm);}
    const jamb=sideGrid(S,ne,sd,zA-.01,zB+.01,.46,G.belt-.05,.002,sd);let jm=null;if(jamb){jm=new THREE.Mesh(jamb,jambMat);jm.visible=false;ch.add(jm);}
    const hs2=H7at(S,(zA+zB)/2),hx2=surfX(hs2,G.belt-.11,ne);if(hx2>0)M(off,rbox(.03,.035,.17,.012),M7.chrome,sd*(hx2+.012),G.belt-.11,(zA+zB)/2-(suicide?-.2:.2),0,0,0,false);
    R.doors.push({piv,sd,jm,suicide,a:0,k});});});
  /* capot + baie moteur */
  const zF=S[0].z,zB=S[S.length-1].z;
  {const zA=zF-.16,zC=G.zf-.06,hood=topGrid(S,ne,zA,zC,.86,.007);if(hood){const piv=G7(ch,0,topY(H7at(S,zC),0,ne),zC),off=G7(piv,0,-topY(H7at(S,zC),0,ne),-zC),hm=new THREE.Mesh(hood,paint);hm.castShadow=true;off.add(hm);R.paintSlots.push([hm,-1]);
    const bay=G7(ch);bay.visible=false;const mid=(zA+zC)/2,ty=topY(H7at(S,mid),0,ne);const elec=AMC.SND[type]&&AMC.SND[type].cyl===1;
    M(bay,new THREE.BoxGeometry(1.5,.02,Math.abs(zA-zC)*.92),MAT.bay,0,ty+.002,mid,0,0,0,false);
    if(elec){M(bay,rbox(1.1,.14,.7,.03),MAT.eng,0,ty+.06,mid,0,0,0,false);M(bay,new THREE.PlaneGeometry(.5,.12),MAT.screen,0,ty+.135,mid,-Math.PI/2,0,0,false);}
    else{M(bay,rbox(.8,.2,.62,.05),MAT.eng,0,ty+.1,mid,0,0,0,false);M(bay,rbox(.6,.05,.4,.03),MAT.engRed,0,ty+.22,mid,0,0,0,false);[-.32,.32].forEach(x=>M(bay,new THREE.CylinderGeometry(.06,.06,.5,12).rotateX(Math.PI/2),MAT.alu,x,ty+.12,mid,0,0,0,false));}
    R.hood={piv,bay,a:0};}}
  /* coffre ou hayon */
  if(G.rearGlass){const top=G.roof-.03,y0=.62,zt=edgeZ(H,0,top-.02,D.ng,false),piv=G7(ch,0,top,zt),off=G7(piv,0,-top,-zt);const rows=[];for(let k=0;k<=10;k++){const y=y0+(top-y0)*k/10,src=y>G.belt?H:S,nn=y>G.belt?D.ng:ne;let s=null;for(let i=src.length-1;i>=0;i--){if(surfX(src[i],y,nn)>.2){s=src[i];break;}}if(!s)continue;rows.push({y,z:s.z-.012,w:Math.max(.2,surfX(s,y,nn)*.86),gl:y>G.belt+.04});}
    const mk=(arr,mat)=>{if(arr.length<2)return;const p=[],ix=[];arr.forEach(r=>{p.push(-r.w,r.y,r.z,r.w,r.y,r.z);});for(let i=0;i<arr.length-1;i++){const a=i*2;ix.push(a,a+2,a+1,a+1,a+2,a+3);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();
      if(g.attributes.normal.getZ(0)>0){for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t;}g.setIndex(ix);g.computeVertexNormals();}const m=new THREE.Mesh(g,mat);off.add(m);return m;};
    const lo=rows.filter(r=>!r.gl),hi=rows.filter(r=>r.gl);if(lo.length&&hi.length)hi.unshift(lo[lo.length-1]);const pm=mk(lo,paint);if(pm)R.paintSlots.push([pm,-1]);mk(hi,R.glassMat);
    const box=G7(ch);box.visible=false;M(box,new THREE.BoxGeometry(1.3,.02,.9),MAT.carpet,0,.66,zB+.55,0,0,0,false);R.trunk={piv,box,a:0,hatch:true};}
  else{const zA=G.zr-.04,zC=zB+.14,lid=topGrid(S,ne,zA,zC,.84,.007);if(lid){const y=topY(H7at(S,zA),0,ne),piv=G7(ch,0,y,zA),off=G7(piv,0,-y,-zA),lm=new THREE.Mesh(lid,paint);off.add(lm);R.paintSlots.push([lm,-1]);
    const box=G7(ch);box.visible=false;M(box,new THREE.BoxGeometry(1.3,.02,Math.abs(zA-zC)*.9),MAT.carpet,0,topY(H7at(S,(zA+zC)/2),0,ne)+.003,(zA+zC)/2,0,0,0,false);R.trunk={piv,box,a:0};}}
  /* clignotants, phares propres */
  const indM=new THREE.MeshStandardMaterial({color:0x6a3a00,emissive:0xff8a18,emissiveIntensity:0,roughness:.3});R.indMat=indM;
  [-1,1].forEach(sd=>{const fx=sd*(S[6].wb-.12),fz=edgeZ(S,fx+sd*.08,S[3].t-.16,ne,true),bx=sd*(S[S.length-8].wb-.1),bz=edgeZ(S,bx+sd*.08,S[S.length-4].t-.18,ne,false);
    const a=M(ch,rbox(.12,.05,.05,.015),indM,fx,S[3].t-.16,fz+.01,0,0,0,false),b=M(ch,rbox(.12,.05,.05,.015),indM,bx,S[S.length-4].t-.2,bz-.01,0,0,0,false);R.ind.push({m:a,sd},{m:b,sd});});
  R.headMat=CM7.head.clone();R.drl=MAT.led.clone();
  ch.traverse(o=>{if(!o.isMesh)return;if(o.material===CM7.head){o.material=R.headMat;R.heads.push(o);}else if(o.material===MAT.led){o.material=R.drl;}
    else if(o.material===CM7.seat){R.seats.push(o);}
    else if(o.geometry&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters&&Math.abs(o.geometry.parameters.width-.46)<.001)R.plates.push(o);});
  const mirrorParts=[];ch.children.forEach(o=>{if(o.isMesh&&Math.abs(o.position.z-(G.zf-.18))<.05&&Math.abs(o.position.y-(G.belt+.06))<.03&&(o.material===paint||o.material===M7.mirror))mirrorParts.push(o);});
  R.mirrors=[];[-1,1].forEach(sd=>{const parts=mirrorParts.filter(o=>Math.sign(o.position.x)===sd);if(!parts.length)return;const base=parts.find(o=>o.material===paint)||parts[0],pv=G7(ch,base.position.x-sd*.05,base.position.y,base.position.z);
    parts.forEach(o=>{ch.remove(o);o.position.x-=pv.position.x;o.position.y-=pv.position.y;o.position.z-=pv.position.z;pv.add(o);if(o.material===paint)R.paintSlots.push([o,-1]);});R.mirrors.push({pv,sd});});
  R.seatMat=CM7.seat.clone();R.seats.forEach(m=>m.material=R.seatMat);
  /* habitacle : écrans + bande d'ambiance */
  const dz=G.zf-.42;R.ambMat=new THREE.MeshBasicMaterial({color:0x000000});
  M(ch,new THREE.PlaneGeometry(.55,.14),MAT.screen,-.1,G.belt+.11,dz-.17,-.5,0,0,false);
  [-1,1].forEach(sd=>{R.ambient.push(M(ch,new THREE.BoxGeometry(.012,.012,1.2),R.ambMat,sd*.55,G.belt-.08,dz-.6,0,0,0,false));});
  R.ambient.push(M(ch,new THREE.BoxGeometry(1.3,.012,.012),R.ambMat,0,G.belt-.02,dz-.16,0,0,0,false));
  /* jantes */
  mesh.userData.wheels.forEach(rl=>{rl.traverse(o=>{if(o.isMesh&&o.material===CM7.rim&&o.geometry.type==='ExtrudeGeometry')R.rims.push(o);});});
  R.rimMat=CM7.rim.clone();mesh.userData.wheels.forEach(rl=>rl.traverse(o=>{if(o.isMesh&&o.material===CM7.rim)o.material=R.rimMat;}));
  R.paint=paint;u.rig33=R;return R;
};
/* ---------- commandes ---------- */
AMC.set=function(mesh,what,v){const R=AMC.rig(mesh);if(!R)return false;R.state[what]=v;return true;};
AMC.toggle=function(mesh,what){const R=AMC.rig(mesh);if(!R)return null;const s=R.state;
  if(what==='sig')s.sig=s.sig==='L'?0:'L';else if(what==='sigR')s.sig=s.sig==='R'?0:'R';else if(what==='haz')s.sig=s.sig==='H'?0:'H';else s[what]=s[what]?0:1;return s[what==='sigR'||what==='haz'?'sig':what];};
AMC.apply=function(mesh,mods){const R=AMC.rig(mesh);if(!R)return;mods=mods||{};
  if(mods.color!=null){const pm=finishMat(mods.color,mods.fin||0);R.paintSlots.forEach(([m,i])=>{if(i<0)m.material=pm;else{m.material=m.material.slice();m.material[i]=pm;}});R.paint=pm;}
  if(mods.rim!=null){const r=RIMS[mods.rim]||RIMS[0],W=CAR7[R.type].wh;R.rimMat.color.setHex(r.c);R.rimMat.metalness=r.m;R.rimMat.roughness=r.r;const geo=rimGeo(W.r*.64,W.w/2,r.sp,r.st);R.rims.forEach(m=>m.geometry=geo);}
  if(mods.tint!=null){const t=TINTS[mods.tint]||TINTS[0];R.glassMat.color.setHex(t.c);R.glassMat.opacity=t.o;}
  if(mods.seat!=null)R.seatMat.color.setHex((SEATS[mods.seat]||SEATS[0]).c);
  if(mods.amb!=null){const a=AMBI[mods.amb]||AMBI[0];R.ambMat.color.setHex(a.c||0x000000);}
  if(mods.plate){const pt=tm(plateTex(mods.plate),0xffffff,.4,0);R.plates.forEach(p=>p.material=pt);}
};
AMC.peek=function(mesh,on){const R=AMC.rig(mesh);if(!R)return;R.glassMat.opacity=on?.12:(R._op||R.glassMat.opacity);if(on)R._op=R._op||.55;};
let blink=0;
AMC.tick=function(dt){blink+=dt;const on=Math.floor(blink*2.6)%2===0;
  const upd=mesh=>{const R=mesh.userData.rig33;if(!R)return;const s=R.state,k=Math.min(1,dt*3.2);
    R.doors.forEach(d=>{d.a+=((s.doors?1.05:0)-d.a)*k;d.piv.rotation.y=d.suicide?d.sd*d.a:-d.sd*d.a;if(d.jm)d.jm.visible=d.a>.03;});
    if(R.hood){R.hood.a+=((s.hood?1:0)-R.hood.a)*k;R.hood.piv.rotation.x=-R.hood.a*.95;R.hood.bay.visible=R.hood.a>.03;}
    if(R.trunk){R.trunk.a+=((s.trunk?1:0)-R.trunk.a)*k;R.trunk.piv.rotation.x=R.trunk.a*(R.trunk.hatch?1.15:.9);R.trunk.box.visible=R.trunk.a>.03;}
    R.mirrors.forEach(m=>{const t=s.mir?m.sd*1.1:0;m.pv.rotation.y+=(t-m.pv.rotation.y)*k;});
    const offM=R._indOff||(R._indOff=new THREE.MeshStandardMaterial({color:0x6a3a00,roughness:.3}));R.indMat.emissiveIntensity=on?3.2:0;
    R.ind.forEach(i=>{const act=s.sig==='H'||(s.sig==='L'&&i.sd>0)||(s.sig==='R'&&i.sd<0);i.m.material=act?R.indMat:offM;});
    R.headMat.emissiveIntensity=s.lights?3.2:CM7.head.emissiveIntensity;R.drl.emissiveIntensity=s.lights||s.engine?2.2:1.2;
    if(s.engine){mesh.userData.chassis.position.y=Math.sin(blink*60)*.0025;}else mesh.userData.chassis.position.y=0;
  };
  cars.forEach(c=>upd(c.mesh));(AMC.extra||[]).forEach(upd);
};
})();
