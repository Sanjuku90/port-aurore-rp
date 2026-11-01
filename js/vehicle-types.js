'use strict';
/* ---------- voitures, sons, radio, taxi ---------- */
let ambGain=null,ambLp=null,hgm=null,tgm=null,radioN=-1,radioT=null,radioStep=0;
const CT={sedan:[1,1,1,27,1],suv:[1.06,1.2,1.06,25,0.9],sport:[1.06,0.84,1.03,34,1.35],danfo:[1.1,1.4,1.25,21,0.8],taxi:[1,1,1,27,1],benz:[1,1,1,29,1.0],lambo:[1,1,1,44,1.5],ford:[1,1,1,38,1.4],toyota:[1,1,1,25,1.0],ferrari:[1,1,1,46,1.55],porsche:[1,1,1,40,1.45],bmw:[1,1,1,31,1.1],honda:[1,1,1,24,1.0],jeep:[1,1,1,24,0.85],hyundai:[1,1,1,25,1.0]};
function applyType(g,t){
  const k=CT[t];g.children[0].scale.set(k[0],k[1],k[2]);g.children[1].scale.set(k[0],k[1],k[2]);
  g.userData.wheels.forEach(w=>{w.position.x*=k[0];w.position.z*=k[2];});
  if(!hgm){
    const mat=(a,b)=>new THREE.SpriteMaterial({map:glowTex([[0,a],[0.35,b],[1,'rgba(255,200,100,0)']]),transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,opacity:0});
    hgm=mat('rgba(255,246,210,1)','rgba(255,230,160,.5)');tgm=mat('rgba(255,60,40,1)','rgba(255,40,30,.45)');
  }
  [[hgm,2.45,3.4],[tgm,-2.45,2.8]].forEach(a=>{const s=new THREE.Sprite(a[0]);s.position.set(0,0.78*k[1],a[1]*k[2]);s.scale.set(a[2],1.1,1);g.add(s);});
}
function tone(f,d,ty,v,w){
  if(!actx||muted)return;
  const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+(w||0);
  o.type=ty||'sine';o.frequency.value=f;g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v||0.1,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+d+0.05);
}
const honk=v=>{tone(392,0.3,'square',v);tone(466,0.3,'square',v*0.8);};
function playerHonk(){honk(0.1);peds.forEach(p=>{if(p.stun<=0&&Math.hypot(p.x-player.x,p.z-player.z)<10)p.stun=1.2;});}
function ambUpdate(){
  if(!ambGain)return;
  let cn=0,pn=0;
  cars.forEach(c=>{if(c!==player.car&&Math.abs(c.v)>2&&Math.hypot(c.x-player.x,c.z-player.z)<45)cn++;});
  peds.forEach(p=>{if(Math.hypot(p.x-player.x,p.z-player.z)<22)pn++;});
  ambGain.gain.setTargetAtTime(muted?0:clamp(cn*0.014+pn*0.004,0.01,0.16),actx.currentTime,0.3);
  ambLp.frequency.setTargetAtTime(300+cn*40,actx.currentTime,0.3);
}
const STATIONS=[
  {n:'Lagoon FM · Lo-fi',bpm:78,w:'triangle',sc:[0,3,7,10,12,15],pat:[0,2,4,2,5,3,4,1]},
  {n:'Port Beats · Afro',bpm:104,w:'square',sc:[0,2,4,7,9,12],pat:[0,0,3,2,4,2,5,3]},
  {n:'Néon Rock · Synthé',bpm:124,w:'sawtooth',sc:[0,3,5,7,10,12],pat:[0,3,5,3,4,2,1,2]}];
function radioPlay(i){
  clearInterval(radioT);radioN=i;if(i<0)return;
  const s=STATIONS[i],ms=60000/s.bpm/2;radioStep=0;
  radioT=setInterval(()=>{
    const base=[110,98,87,98][Math.floor(radioStep/8)%4],n=s.sc[s.pat[radioStep%8]];
    tone(base*2*Math.pow(2,n/12),ms/1000*1.6,s.w,0.05);
    if(radioStep%4===0)tone(base,ms/1000*3,'sine',0.09);
    radioStep++;
  },ms);
}
function appRadio(b){
  const c=mk('div','bigc');c.appendChild(mk('small',null,'En écoute'));const t=mk('b',null,radioN<0?'Silence':STATIONS[radioN].n);t.style.fontSize='20px';c.appendChild(t);b.appendChild(c);
  STATIONS.forEach((s,i)=>b.appendChild(mk('button','pbtn'+(i===radioN?' hot':''),(i===radioN?'▶ ':'')+s.n,()=>{radioPlay(i);phOpen(phApp);})));
  b.appendChild(mk('button','pbtn','Couper la radio',()=>{radioPlay(-1);phOpen(phApp);}));
}
function appTaxi(b){
  b.appendChild(mk('p','dim','Un taxi te dépose devant le lieu choisi. Tarif selon la distance.'));
  spots.forEach(s=>{
    const d=Math.hypot(s.x-player.x,s.z-player.z),p=Math.round(5+d*0.08);
    const x=mk('button','prow',null,()=>{
      if(blackout>0){toast('Pas de réseau.','warn');return;}
      if(player.car){toast('Descends de ta voiture d’abord.','warn');return;}
      state.cash-=p;player.x=s.x;player.z=s.z+2;gameMin+=d/8;closePanel();toast('Taxi : tu es arrivé à '+s.label+'.','good');
    });
    x.appendChild(mk('b',null,s.label));x.appendChild(mk('span',null,fmt(p)+' · '+Math.round(d)+' m'));x.disabled=state.cash<p;b.appendChild(x);
  });
}
APPS.splice(6,0,['Radio','📻','#ffd54a,#ff7a59',appRadio],['Taxi','🚕','#ffe066,#e0a526',appTaxi]);
const VERSION='v23',CHANGELOG=[['v11','Façades typées, achat de terrains, chantiers avec ingénieurs et grue, 50 nouveaux meubles'],['v10','Téléphone complet, appels, contacts, réseaux, annonces, immobilier, factures, virements et salaires'],['v9','Phase 4 transports, ville agrandie et carte GPS repensée'],['v8','Menu de démarrage, guide débutant, création de personnage et PNJ intérieurs'],['v7','Vrai appartement, intérieurs visitables et voitures détaillées'],['v1','Ville 3D, métiers, rangs, besoins, club, météo, téléphone et PNJ']];
function befriend(p){
  if((p.talkAt||0)>performance.now())return;p.talkAt=performance.now()+8000;
  p.h=Math.atan2(player.x-p.x,player.z-p.z);p.wait=4;
  const t=pick(LINES);say(p.mesh,t,4);addChat(p.name,t);
  if(state.friends.indexOf(p.name)<0){state.friends.push(p.name);state.rep+=1;state.fun=Math.min(100,state.fun+15);toast('Nouvel ami : '+p.name+' · +15 humeur','good');}
  else{state.fun=Math.min(100,state.fun+5);toast('Tu discutes avec '+p.name+'. +5 humeur');}
}
function bindLook(){
  if(typeof look.y!=='string'||HAIR_STYLES.indexOf(look.y)<0)look.y='court';
  if(typeof look.h!=='number')look.h=0x1a1410;if(typeof look.t!=='string'||TOPS.indexOf(look.t)<0)look.t='tee';
  const prev=$('#look-prev');let pr=null,pc=null,pm=null,prS=null;
  function preview(){
    if(!prev)return;
    if(!pr){pr=new THREE.WebGLRenderer({canvas:prev,antialias:true,alpha:true});pr.setPixelRatio(Math.min(2,devicePixelRatio||1));pc=new THREE.PerspectiveCamera(30,1,0.1,20);pc.position.set(0,1.3,4.6);pc.lookAt(0,1.0,0);
      prS=new THREE.Scene();const sc=prS;sc.add(new THREE.HemisphereLight(0xffffff,0x445566,0.9));const dl=new THREE.DirectionalLight(0xfff2d6,0.8);dl.position.set(2,3,4);sc.add(dl);      const loopP=()=>{if($('#start').hidden){pr.dispose&&pr.dispose();return;}if(pm){pm.rotation.y+=0.012;animPerson(pm,performance.now()*0.004,0,false);}pr.render(prS,pc);requestAnimationFrame(loopP);};requestAnimationFrame(loopP);}
    if(pm)prS.remove(pm);pm=makePlayerMesh();pm.rotation.y=pm.rotation.y||0.5;prS.add(pm);
  }
  document.querySelectorAll('.look').forEach(row=>{
    const key=row.dataset.k;
    row.querySelectorAll('button').forEach(b=>{
      const v=b.dataset.c!=null?parseInt(b.dataset.c,16):(['g','b','bag','n','e','w'].includes(key)?b.dataset.v==='true':b.dataset.v);
      b.classList.toggle('on',look[key]===v);
      b.onclick=()=>{look[key]=v;row.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));preview();};
    });
  });
  try{preview();}catch(e){}
}
function buildPort(){
  sea=new THREE.Mesh(new THREE.PlaneGeometry(1600,520),new THREE.MeshPhongMaterial({color:0x1f6f9c,specular:0xbfe3ff,shininess:80,transparent:true,opacity:0.94}));
  sea.rotation.x=-Math.PI/2;sea.position.set(0,0,476);scene.add(sea);
  const quay=new THREE.Mesh(new THREE.BoxGeometry(560,0.5,10),lamb(0x7d8288));quay.position.set(0,0.1,220);quay.receiveShadow=true;scene.add(quay);
  wpBeam=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,60,20,1,true),new THREE.MeshBasicMaterial({color:0x6cc6ff,transparent:true,opacity:0.35,depthWrite:false,fog:false,side:THREE.DoubleSide}));wpBeam.position.y=30;wpBeam.visible=false;scene.add(wpBeam);
  const ct=glowTex([[0,'rgba(255,255,255,.6)'],[0.5,'rgba(255,255,255,.2)'],[1,'rgba(255,255,255,0)']]);
  for(let i=0;i<16;i++){const c=new THREE.Sprite(new THREE.SpriteMaterial({map:ct,transparent:true,depthWrite:false,fog:false}));c.scale.set(rand(80,150),rand(24,40),1);c.position.set(rand(-300,300),rand(110,170),rand(-300,300));scene.add(c);clouds.push(c);}
}
