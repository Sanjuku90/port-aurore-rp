'use strict';
/* ==========================================================================
   v45 · RENDU CINÉMATIQUE « LAGUNE NOIRE »
   Rendu HDR (demi-flottant + MSAA), bloom physique en cascade (lampadaires,
   vitrines, néons et phares qui brillent vraiment la nuit), étalonnage
   jour / heure dorée / nuit / intérieur, vignette, aberration chromatique,
   grain argentique, flou radial de vitesse, voile de blessure, reflets
   d'environnement (IBL) sur la carrosserie et les vitres.
   Mode « Désactivé » = rendu d'origine, aucune passe supplémentaire.
   ========================================================================== */
const FX45=(function(){
  const LS='port-aurore-fx45';
  const coarse=matchMedia('(pointer: coarse)').matches;
  const S={mode:coarse?0:2,grain:1,motion:1,ca:1};
  try{const o=JSON.parse(localStorage.getItem(LS)||'null');if(o&&typeof o==='object')Object.assign(S,o);}
  catch(e){}
  const save=()=>{try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){}};
  let R=null,R0=null,failed=false,ready=false;
  let rtScene=null,mips=[],W=0,H=0,samples=-1,levels=0;
  let qScene,qCam,quad,mBright,mDown,mUp,mComp;
  let env=null,envTried=false;
  const st={hurt:0,flash:0,speed:0,t:0,lastHp:null,grade:null};
  const V2=()=>new THREE.Vector2();
  const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
  /* ---------- shaders ---------- */
  const FS_BRIGHT=`uniform sampler2D tSrc;uniform vec2 uTexel;uniform float uThr,uKnee;varying vec2 vUv;
    vec3 k(vec3 c){return c/(1.0+max(c.r,max(c.g,c.b))*0.25);}
    void main(){vec2 o=uTexel;
      vec3 a=texture2D(tSrc,vUv+vec2(-o.x,-o.y)).rgb,b=texture2D(tSrc,vUv+vec2(o.x,-o.y)).rgb,c=texture2D(tSrc,vUv+vec2(-o.x,o.y)).rgb,d=texture2D(tSrc,vUv+vec2(o.x,o.y)).rgb;
      vec3 col=(k(a)+k(b)+k(c)+k(d))*0.25;col=col/(1.0-min(0.95,max(col.r,max(col.g,col.b))*0.25));
      float br=max(col.r,max(col.g,col.b));float rq=clamp(br-uThr+uKnee,0.0,2.0*uKnee);rq=rq*rq/(4.0*uKnee+1e-4);
      float w=max(rq,br-uThr)/max(br,1e-4);gl_FragColor=vec4(min(col*w,vec3(24.0)),1.0);}`;
  const FS_DOWN=`uniform sampler2D tSrc;uniform vec2 uTexel;varying vec2 vUv;
    void main(){vec2 o=uTexel;vec3 s=texture2D(tSrc,vUv).rgb*4.0;
      s+=texture2D(tSrc,vUv-o).rgb;s+=texture2D(tSrc,vUv+o).rgb;s+=texture2D(tSrc,vUv+vec2(o.x,-o.y)).rgb;s+=texture2D(tSrc,vUv-vec2(o.x,-o.y)).rgb;
      gl_FragColor=vec4(s*0.125,1.0);}`;
  const FS_UP=`uniform sampler2D tSrc;uniform vec2 uTexel;uniform float uGain;varying vec2 vUv;
    void main(){vec2 o=uTexel;vec3 s=vec3(0.0);
      s+=texture2D(tSrc,vUv+vec2(-o.x*2.0,0.0)).rgb;s+=texture2D(tSrc,vUv+vec2(o.x*2.0,0.0)).rgb;s+=texture2D(tSrc,vUv+vec2(0.0,-o.y*2.0)).rgb;s+=texture2D(tSrc,vUv+vec2(0.0,o.y*2.0)).rgb;
      s+=texture2D(tSrc,vUv+vec2(-o.x,o.y)).rgb*2.0;s+=texture2D(tSrc,vUv+vec2(o.x,o.y)).rgb*2.0;s+=texture2D(tSrc,vUv+vec2(-o.x,-o.y)).rgb*2.0;s+=texture2D(tSrc,vUv+vec2(o.x,-o.y)).rgb*2.0;
      gl_FragColor=vec4(s/12.0*uGain,1.0);}`;
  const FS_COMP=`uniform sampler2D tScene,tBloom;uniform vec2 uRes;uniform float uBloom,uTime,uVig,uGrain,uCA,uSpeed,uHurt,uFlash,uSat,uCon,uExpo,uAnam;
    uniform vec3 uShadow,uHigh,uBloomTint;varying vec2 vUv;
    float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
    void main(){vec2 uv=vUv,d=uv-0.5;float asp=uRes.x/uRes.y;float r=length(d*vec2(asp,1.0));
      vec2 off=d*uCA*(0.0006+0.0032*r*r);
      vec3 col=vec3(texture2D(tScene,uv-off).r,texture2D(tScene,uv).g,texture2D(tScene,uv+off).b);
      if(uSpeed>0.002){float m=smoothstep(0.12,0.62,r)*uSpeed;vec3 acc=col;
        for(int i=1;i<7;i++){float t=float(i)/7.0;acc+=texture2D(tScene,uv-d*t*m*0.085).rgb;}col=acc/7.0;}
      vec3 bl=texture2D(tBloom,uv).rgb;
      vec3 an=vec3(0.0);if(uAnam>0.001){for(int i=-3;i<=3;i++){float fi=float(i);an+=texture2D(tBloom,uv+vec2(fi*0.022,0.0)).rgb*(1.0-abs(fi)/4.0);}an*=uAnam*0.35*vec3(0.55,0.75,1.25);}
      col=col*uExpo+(bl*uBloomTint+an)*uBloom;
      gl_FragColor=vec4(col,1.0);
      #include <tonemapping_fragment>
      vec3 c=gl_FragColor.rgb;float l=dot(c,vec3(0.2126,0.7152,0.0722));
      c=mix(vec3(l),c,uSat);
      c*=mix(uShadow,uHigh,smoothstep(0.02,0.55,l));
      gl_FragColor=vec4(max(c,0.0),1.0);
      #include <colorspace_fragment>
      c=gl_FragColor.rgb;
      c=clamp((c-0.5)*uCon+0.5,0.0,1.0);
      c=mix(c,c*c*(3.0-2.0*c),0.18*uCon-0.18);
      float v=smoothstep(1.05,0.32,r*(0.9+uVig*0.35));c*=mix(1.0,v,uVig);
      float e=smoothstep(0.25,0.95,r);c=mix(c,vec3(0.42,0.0,0.05)+c*0.35,clamp(uHurt*e*0.9,0.0,0.85));
      c+=vec3(1.0,0.92,0.85)*uFlash*0.35*(0.4+e);
      float n=h21(uv*uRes+fract(uTime*7.31)*vec2(91.7,37.3))-0.5;c+=n*uGrain*(0.85-0.5*l);
      c+=(h21(uv*uRes.yx+uTime)-0.5)/255.0;
      gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}`;
  function mat(fs,u,extra){return new THREE.ShaderMaterial(Object.assign({uniforms:u,vertexShader:VS,fragmentShader:fs,depthTest:false,depthWrite:false,toneMapped:false},extra||{}));}
  function setup(){
    qScene=new THREE.Scene();qCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),null);quad.frustumCulled=false;qScene.add(quad);
    mBright=mat(FS_BRIGHT,{tSrc:{value:null},uTexel:{value:V2()},uThr:{value:1.2},uKnee:{value:0.5}});
    mDown=mat(FS_DOWN,{tSrc:{value:null},uTexel:{value:V2()}});
    mUp=mat(FS_UP,{tSrc:{value:null},uTexel:{value:V2()},uGain:{value:1}},{blending:THREE.AdditiveBlending,transparent:true});
    mComp=mat(FS_COMP,{tScene:{value:null},tBloom:{value:null},uRes:{value:V2()},uBloom:{value:0.3},uTime:{value:0},uVig:{value:0.5},uGrain:{value:0.03},uCA:{value:1},
      uSpeed:{value:0},uHurt:{value:0},uFlash:{value:0},uSat:{value:1.1},uCon:{value:1.06},uExpo:{value:1},uAnam:{value:0},
      uShadow:{value:new THREE.Vector3(1,1,1)},uHigh:{value:new THREE.Vector3(1,1,1)},uBloomTint:{value:new THREE.Vector3(1,1,1)}});
    mComp.toneMapped=true;ready=true;
  }
  function disposeTargets(){if(rtScene)rtScene.dispose();mips.forEach(m=>m.dispose());rtScene=null;mips=[];}
  function ensureTargets(){
    const v=R.getDrawingBufferSize(V2()),w=Math.max(1,v.x|0),h=Math.max(1,v.y|0);
    const sm=S.mode===2?4:(coarse?0:2),lv=S.mode===2?6:4;
    if(w===W&&h===H&&sm===samples&&lv===levels&&rtScene)return;
    disposeTargets();W=w;H=h;samples=sm;levels=lv;
    rtScene=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,samples:sm,depthBuffer:true});
    rtScene.texture.minFilter=rtScene.texture.magFilter=THREE.LinearFilter;rtScene.texture.generateMipmaps=false;
    let mw=Math.max(1,w>>1),mh=Math.max(1,h>>1);if(coarse&&S.mode<2){mw=Math.max(1,w>>2);mh=Math.max(1,h>>2);}
    for(let i=0;i<lv;i++){const t=new THREE.WebGLRenderTarget(mw,mh,{type:THREE.HalfFloatType,depthBuffer:false});t.texture.generateMipmaps=false;t.texture.minFilter=t.texture.magFilter=THREE.LinearFilter;mips.push(t);mw=Math.max(1,mw>>1);mh=Math.max(1,mh>>1);}
  }
  function pass(m,target,clear){quad.material=m;R.setRenderTarget(target);if(clear)R.clear(true,false,false);R0(qScene,qCam);}
  /* ---------- reflets d'environnement : ciel de lagune en studio ---------- */
  function buildEnv(){envTried=true;try{
      const es=new THREE.Scene();
      const g=new THREE.SphereGeometry(50,32,16),m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,toneMapped:false,
        vertexShader:'varying vec3 p;void main(){p=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader:'varying vec3 p;void main(){float y=p.y;vec3 top=vec3(0.32,0.52,0.95),hor=vec3(1.25,1.0,0.78),gr=vec3(0.07,0.065,0.06);vec3 c=y>0.0?mix(hor,top,pow(y,0.5)):mix(hor*0.45,gr,pow(-y,0.4));gl_FragColor=vec4(c,1.0);}'});
      es.add(new THREE.Mesh(g,m));
      const pm=new THREE.MeshBasicMaterial({color:new THREE.Color(6,5.6,5)});
      [[0,40,0,60,1.2],[30,18,-28,14,8],[-34,14,20,10,6],[10,10,40,30,3]].forEach(([x,y,z,w,h])=>{const q=new THREE.Mesh(new THREE.PlaneGeometry(w,h),pm);q.position.set(x,y,z);q.lookAt(0,0,0);es.add(q);});
      const gen=new THREE.PMREMGenerator(R);env=gen.fromScene(es,0.035).texture;gen.dispose();g.dispose();m.dispose();
    }catch(e){env=null;console.warn('fx45 env',e);}}
  /* ---------- étalonnage selon l'heure, le lieu et la météo ---------- */
  const G={day:{sat:1.16,con:1.12,sh:[0.93,0.99,1.08],hi:[1.05,1.0,0.93],bloom:0.2,thr:1.45,vig:0.5,expo:0.86,tint:[1,0.96,0.9],env:0.38,anam:0},
    gold:{sat:1.24,con:1.12,sh:[0.88,0.93,1.1],hi:[1.15,0.99,0.8],bloom:0.45,thr:1.0,vig:0.58,expo:0.92,tint:[1.15,0.92,0.7],env:0.32,anam:0.2},
    night:{sat:1.22,con:1.16,sh:[0.74,0.9,1.2],hi:[1.16,0.98,0.8],bloom:1.5,thr:0.36,vig:0.75,expo:0.8,tint:[1.05,0.85,0.75],env:0.12,anam:0.55},
    inside:{sat:1.1,con:1.06,sh:[0.96,0.98,1.04],hi:[1.06,1.0,0.92],bloom:0.24,thr:1.1,vig:0.5,expo:1.0,tint:[1.05,0.95,0.85],env:0.3,anam:0.1}};
  const mix3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  function blendG(a,b,t){const o={};for(const k in a)o[k]=Array.isArray(a[k])?mix3(a[k],b[k],t):a[k]+(b[k]-a[k])*t;return o;}
  function targetGrade(){
    const gm=typeof gameMin==='number'?gameMin:600,h=(gm/60)%24,a=(h-6)/12*Math.PI,s=Math.sin(a),d=s>0?Math.min(1,s*1.4):0;
    let g=d<0.5?blendG(G.night,G.gold,Math.min(1,d/0.25)):blendG(G.gold,G.day,Math.min(1,(d-0.5)/0.4));
    if(d>=0.25&&d<0.5)g=G.gold;
    if(typeof player!=='undefined'&&player&&player.inside)g=blendG(g,G.inside,0.75);
    if(typeof blackout!=='undefined'&&blackout>0){g=Object.assign({},g);g.sat*=0.62;g.bloom*=0.35;g.expo*=0.9;}
    return g;
  }
  function stepGrade(dt){const t=targetGrade();if(!st.grade){st.grade=t;return t;}const k=1-Math.exp(-dt*2.5);st.grade=blendG(st.grade,t,k);return st.grade;}
  /* ---------- pipeline principal ---------- */
  function render(sc,cam){
    if(!ready)setup();ensureTargets();
    const now=performance.now()/1000,dt=Math.min(0.1,Math.max(0.001,now-(st.t||now)));st.t=now;
    const g=stepGrade(dt);
    if(!envTried&&S.mode>0)buildEnv();
    if(env&&sc.environment!==env&&!sc.environment)sc.environment=env;
    if(env&&sc.environment===env&&'environmentIntensity' in sc)sc.environmentIntensity=g.env;
    /* état du joueur : vitesse et blessures */
    let spd=0;try{if(typeof player!=='undefined'&&player.car)spd=Math.abs(player.car.v||0);}catch(e){}
    const sT=S.motion?Math.max(0,Math.min(1,(spd-19)/26)):0;st.speed+=(sT-st.speed)*Math.min(1,dt*3);
    let hp=100;try{if(typeof state!=='undefined'&&typeof started!=='undefined'&&started)hp=state.health;}catch(e){}
    if(st.lastHp!=null&&hp<st.lastHp-1.5)hit(Math.min(1,(st.lastHp-hp)/25));st.lastHp=hp;
    const low=hp<35?(35-hp)/35:0,beat=low?0.55+0.45*Math.pow(Math.max(0,Math.sin(now*(4+low*3))),6):0;
    st.flash=Math.max(0,st.flash-dt*2.4);st.hurt+=((low*beat*0.9+st.flash*0.8)-st.hurt)*Math.min(1,dt*10);
    /* 1 · scène en HDR */
    const prevT=R.getRenderTarget(),ac=R.autoClear;
    R.setRenderTarget(rtScene);R0(sc,cam);
    R.autoClear=false;
    /* 2 · bloom : seuil puis cascade descendante / montante */
    mBright.uniforms.tSrc.value=rtScene.texture;mBright.uniforms.uTexel.value.set(1/W,1/H);mBright.uniforms.uThr.value=g.thr;mBright.uniforms.uKnee.value=g.thr*0.5;
    pass(mBright,mips[0],true);
    for(let i=1;i<mips.length;i++){mDown.uniforms.tSrc.value=mips[i-1].texture;mDown.uniforms.uTexel.value.set(1/mips[i-1].width,1/mips[i-1].height);pass(mDown,mips[i],true);}
    for(let i=mips.length-1;i>0;i--){mUp.uniforms.tSrc.value=mips[i].texture;mUp.uniforms.uTexel.value.set(0.5/mips[i].width,0.5/mips[i].height);mUp.uniforms.uGain.value=1.0;pass(mUp,mips[i-1],false);}
    /* 3 · composition, tonemapping ACES, étalonnage, effets d'objectif */
    const u=mComp.uniforms;u.tScene.value=rtScene.texture;u.tBloom.value=mips[0].texture;u.uRes.value.set(W,H);u.uTime.value=now%1000;
    u.uBloom.value=g.bloom*(S.mode===2?1:0.85)/Math.max(1,mips.length*0.55);u.uVig.value=g.vig;u.uGrain.value=S.grain?(S.mode===2?0.045:0.03):0;u.uCA.value=S.ca?(1+st.speed*2.5+st.hurt*2):0;
    u.uSpeed.value=st.speed;u.uHurt.value=st.hurt;u.uFlash.value=st.flash;u.uSat.value=g.sat;u.uCon.value=g.con;u.uExpo.value=g.expo;u.uAnam.value=S.mode===2?g.anam:0;
    u.uShadow.value.set(...g.sh);u.uHigh.value.set(...g.hi);u.uBloomTint.value.set(...g.tint);
    R.autoClear=ac;pass(mComp,prevT,false);
  }
  function active(sc,cam){return S.mode>0&&!failed&&typeof scene!=='undefined'&&sc===scene&&cam===camera&&R.getRenderTarget()===null&&!(R.xr&&R.xr.isPresenting);}
  function attach(r){
    if(!r||r.__fx45)return;R=r;R0=r.render.bind(r);r.__fx45=1;
    r.render=function(sc,cam){
      if(!active(sc,cam)){if(env&&sc&&sc.environment===env&&S.mode===0)sc.environment=null;return R0(sc,cam);}
      try{render(sc,cam);}catch(e){failed=true;console.warn('fx45 désactivé',e);try{R.setRenderTarget(null);R.autoClear=true;}catch(_){ }R0(sc,cam);}
    };
  }
  function hit(k){st.flash=Math.max(st.flash,0.35+0.65*(k||0.5));if(window.HUD45&&HUD45.shake)HUD45.shake(0.12+0.3*(k||0.5));}
  function setMode(m){S.mode=Math.max(0,Math.min(2,m|0));save();if(S.mode===0){disposeTargets();W=H=0;if(env&&typeof scene!=='undefined'&&scene.environment===env)scene.environment=null;}document.documentElement.dataset.fx45=S.mode;}
  document.documentElement.dataset.fx45=S.mode;
  const MN=['Désactivé','Cinématique','Ultra cinématique'],OO=['Activé','Coupé'];
  function rows(opt){return [
    opt('Rendu cinématique','Bloom HDR, étalonnage, reflets',()=>S.mode,MN,n=>setMode(n)),
    opt('Grain de film','Texture argentique',()=>S.grain?0:1,OO,n=>{S.grain=n?0:1;save();}),
    opt('Effets de vitesse','Flou radial et aberration',()=>S.motion?0:1,OO,n=>{S.motion=n?0:1;S.ca=n?0:1;save();})];}
  return {attach,hit,setMode,rows,get mode(){return S.mode;},S};
})();
window.FX45=FX45;
