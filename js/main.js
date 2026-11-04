'use strict';
/* ---------- démarrage ---------- */
function init(){
  const cv=$('#gl');
  const coarse=matchMedia('(pointer: coarse)').matches;
  renderer=new THREE.WebGLRenderer({canvas:cv,antialias:!coarse,powerPreference:'high-performance'});
  if(window.FX45)FX45.attach(renderer);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,coarse?1.1:1.75));
  renderer.shadowMap.enabled=!coarse;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x8cc4f0);scene.fog=new THREE.Fog(0x8cc4f0,90,300);
  camera=new THREE.PerspectiveCamera(60,1,0.3,420);
  hemi=new THREE.HemisphereLight(0xcfe6ff,0x4a4a52,0.9);scene.add(hemi);
  sun=new THREE.DirectionalLight(0xfff2d6,0.9);sun.position.set(80,120,40);scene.add(sun);scene.add(sun.target);
  sun.castShadow=true;const ss=coarse?512:2048;sun.shadow.mapSize.set(ss,ss);
  const sc=sun.shadow.camera;sc.left=-60;sc.right=60;sc.top=60;sc.bottom=-60;sc.near=20;sc.far=320;sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.4;
  sky=new THREE.Mesh(new THREE.SphereGeometry(320,24,14),new THREE.ShaderMaterial({
    uniforms:{top:{value:new THREE.Color(0x3d7fd0)},hor:{value:new THREE.Color(0x9ccdf2)}},
    vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform vec3 top;uniform vec3 hor;varying vec3 vP;void main(){float t=pow(clamp(vP.y,0.0,1.0),0.55);gl_FragColor=vec4(mix(hor,top,t),1.0);}',
    side:THREE.BackSide,depthWrite:false}));
  sky.renderOrder=-10;sky.frustumCulled=false;scene.add(sky);
  const sg=new Float32Array(900);
  for(let i=0;i<300;i++){const th=rand(0,Math.PI*2),y=Math.pow(Math.random(),0.7)*0.95+0.05,r=Math.sqrt(1-y*y);sg[i*3]=Math.cos(th)*r*300;sg[i*3+1]=y*300;sg[i*3+2]=Math.sin(th)*r*300;}
  const sgeo=new THREE.BufferGeometry();sgeo.setAttribute('position',new THREE.BufferAttribute(sg,3));
  stars=new THREE.Points(sgeo,new THREE.PointsMaterial({color:0xffffff,size:1.8,sizeAttenuation:false,transparent:true,opacity:0,depthWrite:false,fog:false}));
  stars.renderOrder=-9;stars.frustumCulled=false;scene.add(stars);
  sunSp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex([[0,'rgba(255,248,214,1)'],[0.12,'rgba(255,240,190,0.95)'],[0.3,'rgba(255,200,120,0.35)'],[1,'rgba(255,180,100,0)']]),transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending}));
  sunSp.scale.set(90,90,1);scene.add(sunSp);
  moonSp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex([[0,'rgba(240,245,255,1)'],[0.18,'rgba(224,234,255,0.9)'],[0.3,'rgba(160,190,255,0.25)'],[1,'rgba(120,150,255,0)']]),transparent:true,depthWrite:false,fog:false}));
  moonSp.scale.set(40,40,1);scene.add(moonSp);
  headSpot=new THREE.SpotLight(0xfff0d0,0,60,0.6,0.5,1);scene.add(headSpot);scene.add(headSpot.target);
  function resize(){const a=$('#app'),w=a.clientWidth,h=a.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  addEventListener('resize',resize);resize();
  loadProgress();buildWorld();buildPort();buildPhase2();buildDecor();bindLook();bindPhone();setupInput();
  const go=$('#go');go.disabled=false;go.textContent='Entrer en ville';bindStartMenu();
  last=performance.now();requestAnimationFrame(loop);
}
const fontReady=(document.fonts&&document.fonts.load)?document.fonts.load('700 40px Rajdhani').catch(()=>{}):Promise.resolve();
Promise.race([fontReady,new Promise(r=>setTimeout(r,1500))]).then(init);
