'use strict';
/* Mini-chargeur GLB (sans dépendance) + voitures 3D détaillées :
   Volkswagen Golf GTI Mk1 (1976) · Honda NSX (2019) · BMW M4 GT3 EVO (2025).
   Les modèles sont chargés à la demande (assets/*.glb.js), mis en cache, puis clonés. */
(function(){
const G=window.GLB53={};
const CT={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
const NC={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
const MODERN=!!THREE.SRGBColorSpace;   /* r152+ : espaces colorimétriques gérés par le moteur */
const srgbOut=()=>{if(MODERN)return true;try{return renderer.outputEncoding===THREE.sRGBEncoding;}catch(e){return false;}};

function merge(list){ /* fusionne des géométries (déjà dans le même repère) */
  let nv=0,ni=0;list.forEach(g=>{nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;});
  const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2),I=new Uint32Array(ni);let vo=0,io=0;
  list.forEach(g=>{const c=g.attributes.position.count;P.set(g.attributes.position.array,vo*3);
    if(g.attributes.normal)N.set(g.attributes.normal.array,vo*3);if(g.attributes.uv)U.set(g.attributes.uv.array,vo*2);
    if(g.index){for(let k=0;k<g.index.count;k++)I[io+k]=g.index.array[k]+vo;io+=g.index.count;}else{for(let k=0;k<c;k++)I[io+k]=vo+k;io+=c;}vo+=c;});
  const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.BufferAttribute(P,3));o.setAttribute('normal',new THREE.BufferAttribute(N,3));
  o.setAttribute('uv',new THREE.BufferAttribute(U,2));o.setIndex(new THREE.BufferAttribute(I,1));return o;
}
function mergeBy(meshes,toLocal){ /* une géométrie fusionnée par matériau ; toLocal = matrice monde → repère cible */
  const by=new Map();
  meshes.forEach(o=>{const g=o.geometry.clone();g.applyMatrix4(toLocal?new THREE.Matrix4().multiplyMatrices(toLocal,o.matrixWorld):o.matrixWorld);
    if(!by.has(o.material))by.set(o.material,[]);by.get(o.material).push(g);});
  const grp=new THREE.Group();by.forEach((gs,mat)=>{const m=new THREE.Mesh(merge(gs),mat);m.castShadow=true;grp.add(m);});return grp;
}

/* opts : length (m, le long de z) · frontPlus (avant du modèle vers +z ?) · paint (RegExp des matériaux de carrosserie)
          wheelGroup (RegExp des nœuds « roue ») ou wheelMat (RegExp des matériaux, pièces regroupées par position)
          keepStatic (RegExp des matériaux qui restent fixes dans une roue : étriers…) */
G.parse=function(buf,opts){
  opts=opts||{};const dv=new DataView(buf);let off=12,J,bin;
  while(off<buf.byteLength){const len=dv.getUint32(off,true),ty=dv.getUint32(off+4,true),d=buf.slice(off+8,off+8+len);
    if(ty===0x4E4F534A)J=JSON.parse(new TextDecoder().decode(d));else if(ty===0x004E4942)bin=d;off+=8+len;}
  const acc=i=>{const a=J.accessors[i],v=J.bufferViews[a.bufferView],T=CT[a.componentType],n=NC[a.type],cs=T.BYTES_PER_ELEMENT;
    const base=(v.byteOffset||0)+(a.byteOffset||0),stride=v.byteStride||cs*n,out=new T(a.count*n);
    if(stride===cs*n&&base%cs===0)out.set(new T(bin,base,a.count*n));
    else{const b=new DataView(bin);for(let k=0;k<a.count;k++)for(let c=0;c<n;c++){const o=base+k*stride+c*cs;
      out[k*n+c]=T===Float32Array?b.getFloat32(o,true):T===Uint32Array?b.getUint32(o,true):T===Uint16Array?b.getUint16(o,true):T===Int16Array?b.getInt16(o,true):T===Int8Array?b.getInt8(o):b.getUint8(o);}}
    return out;};
  const sr=srgbOut(),texC={};
  const tex=(ti,color)=>{if(!ti)return null;const key=ti.index+'|'+color+'|'+JSON.stringify(ti.extensions||{});if(texC[key])return texC[key];
    const im=J.images[J.textures[ti.index].source],v=J.bufferViews[im.bufferView];
    const img=new Image(),t=new THREE.Texture(img);t.flipY=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;
    if(color){if(MODERN)t.colorSpace=THREE.SRGBColorSpace;else if(sr)t.encoding=THREE.sRGBEncoding;}
    img.onload=()=>{t.needsUpdate=true;};img.src=URL.createObjectURL(new Blob([new Uint8Array(bin,v.byteOffset||0,v.byteLength)],{type:im.mimeType}));
    const x=ti.extensions&&ti.extensions.KHR_texture_transform;if(x){if(x.offset)t.offset.set(x.offset[0],x.offset[1]);if(x.scale)t.repeat.set(x.scale[0],x.scale[1]);if(x.rotation)t.rotation=x.rotation;}
    return texC[key]=t;};
  const paintRe=opts.paint||/CarPaint_Max\d*$/;
  const mats=(J.materials||[]).map(m=>{const p=m.pbrMetallicRoughness||{},nm=m.name||'',bc=p.baseColorFactor||[1,1,1,1];
    const c=new THREE.Color(bc[0],bc[1],bc[2]);if(!sr)c.convertLinearToSRGB();
    const o={color:c,roughness:Math.max(.28,p.roughnessFactor==null?1:p.roughnessFactor),metalness:Math.min(.4,p.metallicFactor==null?0:p.metallicFactor),side:m.doubleSided?THREE.DoubleSide:THREE.FrontSide};
    if(p.baseColorTexture)o.map=tex(p.baseColorTexture,true);if(m.normalTexture)o.normalMap=tex(m.normalTexture,false);
    if(m.emissiveFactor&&(m.emissiveFactor[0]+m.emissiveFactor[1]+m.emissiveFactor[2])>0){o.emissive=new THREE.Color(m.emissiveFactor[0],m.emissiveFactor[1],m.emissiveFactor[2]);
      const es=m.extensions&&m.extensions.KHR_materials_emissive_strength;if(es&&es.emissiveStrength)o.emissiveIntensity=Math.min(3,es.emissiveStrength);}
    if(m.emissiveTexture)o.emissiveMap=tex(m.emissiveTexture,true);
    const glass=/glass/i.test(nm);if(glass||m.alphaMode==='BLEND'){o.transparent=true;o.opacity=glass?(/light/i.test(nm)?.55:.4):bc[3];o.depthWrite=false;if(glass&&!/light/i.test(nm)){o.color=new THREE.Color(0x1a2530);o.metalness=.2;o.roughness=.1;}}
    if(m.alphaMode==='MASK')o.alphaTest=m.alphaCutoff==null?.5:m.alphaCutoff;
    const mm=new THREE.MeshStandardMaterial(o);mm.name=nm;if(paintRe.test(nm))mm.userData.paint=1;return mm;});
  const def=new THREE.MeshStandardMaterial({color:0x888888});
  const root=new THREE.Group(),wheelNodes=[];
  const wgRe=opts.wheelGroup||(opts.wheelMat?null:/^group[1-4]$/);
  const build=(i,parent)=>{const n=J.nodes[i],o=new THREE.Group();o.name=n.name||'';
    if(n.matrix)o.matrix.fromArray(n.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale);
    else{if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);}
    parent.add(o);if(wgRe&&wgRe.test(o.name))wheelNodes.push(o);
    if(n.mesh!=null)J.meshes[n.mesh].primitives.forEach(p=>{if(p.mode!=null&&p.mode!==4)return;
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(acc(p.attributes.POSITION),3));
      if(p.attributes.NORMAL)g.setAttribute('normal',new THREE.BufferAttribute(acc(p.attributes.NORMAL),3));
      if(p.attributes.TEXCOORD_0)g.setAttribute('uv',new THREE.BufferAttribute(acc(p.attributes.TEXCOORD_0),2));
      if(p.indices!=null){let ix=acc(p.indices);if(ix instanceof Uint8Array)ix=new Uint16Array(ix);g.setIndex(new THREE.BufferAttribute(ix,1));}
      if(!p.attributes.NORMAL)g.computeVertexNormals();
      const m=new THREE.Mesh(g,p.material!=null?mats[p.material]:def);o.add(m);});
    (n.children||[]).forEach(c=>build(c,o));return o;};
  (J.scenes[J.scene||0].nodes).forEach(i=>build(i,root));
  /* repère du jeu : longueur le long de z, avant vers +z, sol à y=0, centré.
     L’orientation est « cuite » dans la géométrie (et non dans un nœud parent) : les pivots de roue gardent
     ainsi l’axe x comme essieu et tournent dans le bon sens, quelle que soit l’orientation d’origine. */
  const fix=new THREE.Group();fix.add(root);fix.updateMatrixWorld(true);
  let s=new THREE.Box3().setFromObject(fix).getSize(new THREE.Vector3());
  if(s.x>s.z)fix.rotation.y=Math.PI/2;
  if(opts.frontPlus===false)fix.rotation.y+=Math.PI;
  fix.updateMatrixWorld(true);
  const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o);});
  /* roues : un pivot par roue, au centre de la roue */
  let sets=[];
  if(wgRe)wheelNodes.forEach(w=>{const set=[];w.traverse(o=>{if(o.isMesh&&!(opts.keepStatic&&opts.keepStatic.test(o.material.name||'')))set.push(o);});if(set.length)sets.push(set);});
  else{const pcs=meshes.filter(o=>opts.wheelMat.test(o.material.name||'')).map(o=>({o,c:new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3())}));
    if(pcs.length){const bb=new THREE.Box3();pcs.forEach(p=>bb.expandByPoint(p.c));const mid=bb.getCenter(new THREE.Vector3()),q=[[],[],[],[]];
      pcs.forEach(p=>q[(p.c.x>mid.x?1:0)+(p.c.z>mid.z?2:0)].push(p.o));sets=q.filter(a=>a.length);}}
  const out=new THREE.Group(),body=new THREE.Group();out.add(body);
  const pivots=[],inWheel=new Set();
  sets.forEach(set=>{const b=new THREE.Box3();set.forEach(o=>b.expandByObject(o));if(b.isEmpty())return;
    const pv=new THREE.Group();pv.position.copy(b.getCenter(new THREE.Vector3()));pv.name='wheel53';body.add(pv);pv.updateMatrixWorld(true);
    const m=mergeBy(set,new THREE.Matrix4().copy(pv.matrixWorld).invert());m.children.slice().forEach(c=>pv.add(c));
    pivots.push(pv);set.forEach(o=>inWheel.add(o));});
  /* fusion des maillages statiques par matériau (peu d'appels de rendu) */
  body.add(mergeBy(meshes.filter(o=>!inWheel.has(o))));
  let b=new THREE.Box3().setFromObject(body);s=b.getSize(new THREE.Vector3());
  const c=b.getCenter(new THREE.Vector3()),k=(opts.length||4.15)/s.z;
  body.scale.setScalar(k);body.position.set(-c.x*k,-b.min.y*k,-c.z*k);
  out.userData.wheels=pivots;out.userData.size=s.clone().multiplyScalar(k);return out;
};

/* ---------- peinture : change la couleur de la carrosserie d’une instance ---------- */
G.paint=function(root,hex){root.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.paint){
  if(!o.userData.own53){o.material=o.material.clone();o.userData.own53=1;}o.material.color.setHex(hex);}});};

/* ---------- registre des modèles ---------- */
G.MODELS={
  golf76:{src:'assets/golf-gti-mk1.glb.js',g:'GOLF_GLB_B64',o:{length:4.1}},
  nsx19:{src:'assets/honda-nsx-2019.glb.js',g:'NSX_GLB_B64',o:{length:4.45,wheelMat:/3DWheel/,paint:/^NSXPaint_Material1$/}},
  m4gt3:{src:'assets/bmw-m4-gt3-evo.glb.js',g:'M4_GLB_B64',o:{length:4.75,wheelGroup:/^3DWheel (Front|Rear) [LR]$/,keepStatic:/Tire_Brake/,paint:/car_paint/i}}
};
const tpl={},pend={};
function b64buf(d){return new Promise((ok,ko)=>{
  const go=()=>{try{const s=atob(window[d.g]),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);window[d.g]=null;ok(u.buffer);}catch(e){ko(e);}};
  if(window[d.g])return go();const sc=document.createElement('script');sc.src=d.src;sc.onload=go;sc.onerror=()=>ko(new Error('chargement '+d.src));document.head.appendChild(sc);});}
G.load=function(id){const d=G.MODELS[id];if(!d)return Promise.reject(new Error('modèle inconnu : '+id));
  if(tpl[id])return Promise.resolve(tpl[id]);
  return pend[id]||(pend[id]=b64buf(d).then(b=>{const o=Object.assign({},d.o);if(id==='golf76')o.frontPlus=G.frontPlus;const t=G.parse(b,o);delete t.userData.wheels;return tpl[id]=t;}).catch(e=>{delete pend[id];throw e;}));};
G.make=function(id,color){return G.load(id).then(t=>{const c=t.clone(true);if(color!=null)G.paint(c,color);
  c.userData.wheels=[];c.traverse(o=>{if(o.name==='wheel53')c.userData.wheels.push(o);});return c;});};
/* compatibilité Golf (v53) */
G.golfTemplate=()=>G.load('golf76');
G.golf=color=>G.make('golf76',color);
})();
