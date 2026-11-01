'use strict';
/* ==========================================================================
   v29 · MINI-JEUX
   Moteur commun : écran d'intro (règles + touches), compte à rebours, partie,
   écran de résultat (étoiles, record, gains proportionnels au score).
   21 types de jeux réutilisables : timing, rythme, course, attrape, mémoire,
   quiz, marchandage, cadence, photo, mini-golf, billard, pêche, blackjack,
   machine à sous, penalty, respiration, code, volley, pronostic, équilibre, tir.
   Clavier (flèches / ZQSD / Espace), souris et tactile.
   ========================================================================== */
const MG29=(function(){
const W=960,H=540;
let root,cv,cx,introEl,resEl,hudEl,titleEl,subEl,hintEl,G=null,raf=0,last=0,actx=null;
const BEST=(()=>{try{return JSON.parse(localStorage.getItem('port-aurore-mg29')||'{}');}catch(e){return {};}})();
const saveBest=()=>{try{localStorage.setItem('port-aurore-mg29',JSON.stringify(BEST));}catch(e){}};
const R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),CL=(v,a,b)=>Math.max(a,Math.min(b,v)),PK=a=>a[Math.floor(Math.random()*a.length)];
const SH=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
/* ---------------- son (WebAudio, synthétisé) ---------------- */
function au(){if(!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){actx=null;}}if(actx&&actx.state==='suspended')actx.resume();return actx;}
function tone(f,d,type,vol,when){const A=au();if(!A)return;const t=(when||A.currentTime),o=A.createOscillator(),g=A.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(vol||.12,t);g.gain.exponentialRampToValueAtTime(.0001,t+(d||.15));o.connect(g);g.connect(A.destination);o.start(t);o.stop(t+(d||.15)+.02);}
function kick(when){const A=au();if(!A)return;const t=when||A.currentTime,o=A.createOscillator(),g=A.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(40,t+.14);g.gain.setValueAtTime(.35,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(A.destination);o.start(t);o.stop(t+.2);}
function hat(when,v){const A=au();if(!A)return;const t=when||A.currentTime,n=A.createBufferSource(),b=A.createBuffer(1,A.sampleRate*.05,A.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);n.buffer=b;const f=A.createBiquadFilter();f.type='highpass';f.frequency.value=6000;const g=A.createGain();g.gain.value=v||.08;n.connect(f);f.connect(g);g.connect(A.destination);n.start(t);}
const sfx={ok:()=>{tone(660,.08,'triangle',.1);tone(990,.12,'triangle',.08,(au()||{currentTime:0}).currentTime+.07);},bad:()=>tone(160,.22,'sawtooth',.07),tick:()=>tone(880,.05,'square',.04),go:()=>tone(1320,.25,'triangle',.1),coin:()=>{tone(1200,.06,'square',.05);tone(1600,.1,'square',.05,(au()||{currentTime:0}).currentTime+.06);}};
/* ---------------- dessin ---------------- */
function rr(x,y,w,h,r){cx.beginPath();if(cx.roundRect)cx.roundRect(x,y,w,h,r);else cx.rect(x,y,w,h);}
function txt(t,x,y,sz,col,al,wt,font){cx.font=(wt||700)+' '+sz+'px '+(font||'Rajdhani, "Arial Narrow", sans-serif');cx.fillStyle=col||'#fff';cx.textAlign=al||'center';cx.textBaseline='middle';cx.fillText(t,x,y);}
function emo(e,x,y,sz){cx.font=sz+'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle='#fff';cx.fillText(e,x,y);}
function grad(a,b,y0,y1){const g=cx.createLinearGradient(0,y0||0,0,y1||H);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function bg(a,b){cx.fillStyle=grad(a,b);cx.fillRect(0,0,W,H);}
function bar(x,y,w,h,k,c,back){rr(x,y,w,h,h/2);cx.fillStyle=back||'rgba(255,255,255,.12)';cx.fill();if(k>0){rr(x,y,Math.max(h,w*CL(k,0,1)),h,h/2);cx.fillStyle=c||'#7ee0a3';cx.fill();}}
function btn(x,y,w,h,label,on,col){rr(x,y,w,h,14);cx.fillStyle=on?(col||'#ff7a59'):'rgba(255,255,255,.1)';cx.fill();cx.strokeStyle='rgba(255,255,255,.25)';cx.lineWidth=2;cx.stroke();txt(label,x+w/2,y+h/2+1,Math.min(26,h*.45),on?'#2a1200':'#fff');return {x,y,w,h};}
const inB=(b,x,y)=>b&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h;
function pop(t,x,y,c){G.pops.push({t,x,y,c:c||'#fff',a:1});}
function drawPops(dt){G.pops=G.pops.filter(p=>p.a>0);G.pops.forEach(p=>{p.y-=40*dt;p.a-=dt*1.1;cx.globalAlpha=CL(p.a,0,1);txt(p.t,p.x,p.y,30,p.c);cx.globalAlpha=1;});}
/* ---------------- interface DOM ---------------- */
function ensure(){if(root)return;root=document.createElement('div');root.id='mg29';root.hidden=true;
  root.innerHTML='<div class="mg-card"><header><div class="mg-t"><b></b><span></span></div><div class="mg-hud"></div><button type="button" class="mg-x" title="Abandonner">✕</button></header><div class="mg-stage"><canvas width="'+W+'" height="'+H+'"></canvas><div class="mg-intro"></div><div class="mg-res" hidden></div></div><footer></footer></div>';
  (document.getElementById('app')||document.body).appendChild(root);
  cv=root.querySelector('canvas');cx=cv.getContext('2d');introEl=root.querySelector('.mg-intro');resEl=root.querySelector('.mg-res');hudEl=root.querySelector('.mg-hud');titleEl=root.querySelector('.mg-t b');subEl=root.querySelector('.mg-t span');hintEl=root.querySelector('footer');
  root.querySelector('.mg-x').onclick=()=>{if(G&&G.phase==='play'){G.quit=true;end(0,true);}else close();};
  const pos=e=>{const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};};
  cv.addEventListener('pointerdown',e=>{e.preventDefault();au();if(!G||G.phase!=='play')return;cv.setPointerCapture(e.pointerId);const p=pos(e);G.ptr={x:p.x,y:p.y,down:true,x0:p.x,y0:p.y};G.def.tap&&G.def.tap(G,p.x,p.y);});
  cv.addEventListener('pointermove',e=>{if(!G||G.phase!=='play')return;const p=pos(e);G.ptr.x=p.x;G.ptr.y=p.y;G.ptr.moved=true;G.def.drag&&G.ptr.down&&G.def.drag(G,p.x,p.y);});
  const up=e=>{if(!G||G.phase!=='play')return;const p=pos(e);G.ptr.down=false;G.def.release&&G.def.release(G,p.x,p.y);};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  addEventListener('keydown',e=>{if(!G||root.hidden)return;const k=e.key.toLowerCase();e.stopImmediatePropagation();if(k===' '||k.startsWith('arrow')||k==='enter')e.preventDefault();
    if(e.repeat)return;
    if(G.phase==='intro'){if(k===' '||k==='enter'||k==='e')begin();else if(k==='escape'){G.cancel=true;close();}return;}
    if(G.phase==='res'){if(k===' '||k==='enter'||k==='e'||k==='escape')finish();else if(k==='r'&&G.canReplay)replay();return;}
    if(k==='escape'){G.quit=true;end(0,true);return;}
    const n=norm(k);G.k[n]=true;if(G.phase==='play'&&G.def.key)G.def.key(G,n);},true);
  addEventListener('keyup',e=>{if(!G||root.hidden)return;G.k[norm(e.key.toLowerCase())]=false;},true);
}
function norm(k){if(k==='arrowleft'||k==='q'||k==='a')return 'L';if(k==='arrowright'||k==='d')return 'R';if(k==='arrowup'||k==='z'||k==='w')return 'U';if(k==='arrowdown'||k==='s')return 'D';if(k===' '||k==='enter')return 'A';return k;}
function setHud(h){if(G&&h!==G._h){G._h=h;hudEl.innerHTML=h;}}
/* ---------------- cycle d'une partie ---------------- */
let rPatched=false;function patchRender(){if(rPatched||typeof renderer==='undefined'||!renderer)return;rPatched=true;const r0=renderer.render.bind(renderer);renderer.render=function(s,c){if(G&&root&&!root.hidden)return;r0(s,c);};}
function play(type,o){ensure();patchRender();o=o||{};const def=DEF[type];if(!def){console.warn('mini-jeu inconnu',type);o.done&&o.done(.5);return;}
  if(G)stop();if(typeof closePanel==='function'&&typeof panelOpen!=='undefined'&&panelOpen)closePanel();
  G={type,def,o:o||{},phase:'intro',k:{},ptr:{x:W/2,y:H/2,down:false},pops:[],t:0,score:0,label:'',col:o.color||def.color||'#ff7a59'};
  try{for(const k in keys)keys[k]=false;}catch(e){}
  if(typeof paused!=='undefined'){G.wasPaused=paused;paused=true;}
  root.style.setProperty('--mg',G.col);titleEl.textContent=o.title||def.name;subEl.textContent=o.sub||'';hintEl.textContent=(o.help||def.help||[]).join('   ·   ');setHud('');
  const bk=BEST[o.id||type];
  introEl.innerHTML='<div class="mg-ic">'+(o.icon||def.icon||'🎮')+'</div><h3>'+(o.title||def.name)+'</h3><p>'+(o.intro||def.intro||'')+'</p><ul>'+(o.help||def.help||[]).map(h=>'<li>'+h+'</li>').join('')+'</ul>'+(bk!=null?'<small>Ton record : '+Math.round(bk*100)+' %</small>':'')+'<div class="mg-row"><button type="button" class="primary mg-go">Jouer · Espace</button><button type="button" class="ghost mg-no">Plus tard</button></div>';
  introEl.hidden=false;resEl.hidden=true;root.hidden=false;
  if(type==='result'){introEl.hidden=true;G.phase='play';bg('#16202c','#0b1017');end(o.score||0);return;}
  introEl.querySelector('.mg-go').onclick=()=>{au();begin();};introEl.querySelector('.mg-no').onclick=()=>{G.cancel=true;close();};
  drawIntroBg();}
function drawIntroBg(){if(!G)return;try{G.def.init(G,G.o);G.def.draw(G,0);}catch(e){bg('#1a2230','#0b1017');}cx.fillStyle='rgba(6,10,16,.55)';cx.fillRect(0,0,W,H);}
function begin(){if(!G||G.phase!=='intro')return;introEl.hidden=true;G.k={};G.pops=[];G.t=0;G.score=0;G.cd=3.2;G.phase='count';G.def.init(G,G.o);last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);}
function frame(now){if(!G)return;const dt=Math.min(.05,(now-last)/1000);last=now;tick(dt);
  if(G&&(G.phase==='count'||G.phase==='play'))raf=requestAnimationFrame(frame);}
function tick(dt){if(!G)return;
  try{
    if(G.phase==='count'){const c0=Math.ceil(G.cd);G.cd-=dt;const c1=Math.ceil(G.cd);if(c1!==c0&&c1>0)sfx.tick();
      G.def.draw(G,0);cx.fillStyle='rgba(6,10,16,.45)';cx.fillRect(0,0,W,H);const n=Math.ceil(G.cd);const k=G.cd-Math.floor(G.cd);
      txt(n>0?String(n):'GO !',W/2,H/2,110+40*k,n>0?'#fff':G.col);if(G.cd<=-.35){G.phase='play';sfx.go();}}
    else if(G.phase==='play'){G.t+=dt;G.def.step(G,dt);if(G&&!G.noDraw){G.def.draw(G,dt);drawPops(dt);}setHud(G.label||'');}
  }catch(e){console.warn('mini-jeu',G.type,e);end(.5);}}
function end(s,quit){if(!G||G.phase==='res')return;G.phase='res';cancelAnimationFrame(raf);s=CL(s||0,0,1);G.final=s;
  const o=G.o,id=o.id||G.type;let rec=false;if(!quit){if(BEST[id]==null||s>BEST[id]){rec=BEST[id]!=null&&s>0;BEST[id]=s;saveBest();}}
  const st=quit?0:s>=.85?3:s>=.6?2:s>=.3?1:0;let lines=[];
  if(!quit){try{lines=reward(o,s)||[];}catch(e){console.warn(e);}}
  G.canReplay=!quit&&!!o.replay;
  resEl.innerHTML='<div class="mg-stars">'+[0,1,2].map(i=>'<i class="'+(i<st?'on':'')+'">★</i>').join('')+'</div><h3>'+(quit?'Partie abandonnée':(o.verdict?o.verdict(s,G):verdict(s)))+'</h3>'+(quit?'':'<div class="mg-pct">'+Math.round(s*100)+' %'+(rec?' <em>Nouveau record !</em>':'')+'</div>')+
    (G.resNote?'<p>'+G.resNote+'</p>':'')+'<ul>'+lines.map(l=>'<li>'+l+'</li>').join('')+'</ul><div class="mg-row">'+(G.canReplay?'<button type="button" class="ghost mg-re">Rejouer · R</button>':'')+'<button type="button" class="primary mg-ok">Continuer · Espace</button></div>';
  resEl.hidden=false;resEl.querySelector('.mg-ok').onclick=finish;const re=resEl.querySelector('.mg-re');if(re)re.onclick=replay;
  if(!quit)(s>=.6?sfx.ok:s<.3?sfx.bad:sfx.tick)();}
function verdict(s){return s>=.95?'Parfait !':s>=.85?'Excellent !':s>=.6?'Bien joué':s>=.3?'Pas mal':'Raté… on retente ?';}
function reward(o,s){const L=[],g=o.gain||{};const k=.35+.65*s;
  const add=(key,v,lab,unit)=>{if(!v)return;v=Math.round(v);if(!v)return;if(key==='cash'){state.cash+=v;if(state.earned!=null&&o.work)state.earned+=v;L.push((v>0?'+':'')+fmt(v)+' '+lab);return;}
    if(key==='rep'){state.rep=(state.rep||0)+v;L.push((v>0?'+':'')+v+' '+lab);return;}
    state[key]=CL((state[key]||0)+v,0,100);L.push((v>0?'+':'')+v+' '+lab+(unit||''));};
  add('fun',g.fun?g.fun*k:0,'humeur');add('energy',g.energy?(g.energy>0?g.energy*k:g.energy):0,'énergie');add('health',g.health?g.health*k:0,'santé');add('hunger',g.hunger?g.hunger:0,'faim');
  if(g.thirst&&state.thirst!=null)add('thirst',g.thirst,'soif');
  if(g.rep){const r=s>=.6?g.rep:s>=.3?Math.floor(g.rep/2):0;add('rep',r,'réputation');}
  if(g.cash){add('cash',g.cash*(g.cashMin!=null?Math.max(g.cashMin,s):s),o.work?'de salaire':'');}
  if(g.skill&&typeof gainSk==='function'){try{gainSk(g.skill[0],Math.round(g.skill[1]*k));L.push('Compétence '+g.skill[0]+' +'+Math.round(g.skill[1]*k));}catch(e){}}
  if(o.min){try{gameMin+=o.min;}catch(e){}}
  if(o.after){const r=o.after(s,G);if(r)L.unshift(r);}
  if(o.msg)L.unshift(typeof o.msg==='function'?o.msg(s):o.msg);
  return L;}
function replay(){if(!G)return;const t=G.type,o=G.o;if(o.cost&&!payMG(o.cost))return;G=null;play(t,o);begin();}
function finish(){const o=G&&G.o,s=G?G.final:0;close();if(o&&o.done)try{o.done(s);}catch(e){console.warn(e);}}
function stop(){cancelAnimationFrame(raf);}
function close(){stop();if(root)root.hidden=true;if(G&&typeof paused!=='undefined')paused=!!G.wasPaused;const c=G&&G.cancel&&G.o&&G.o.cost;G=null;if(c){state.cash+=c;toast('Remboursé : '+fmt(c),'');}}
function payMG(c){if(!c)return true;if(state.cash+state.bank<c){toast('Fonds insuffisants.','bad');return false;}if(typeof takeMoney==='function')takeMoney(c);else state.cash-=c;return true;}
/* bouton de panneau prêt à l'emploi : paie, puis lance le mini-jeu */
function act(label,cost,type,o){o=Object.assign({},o||{});o.cost=cost||0;return {label:'🎮 '+label+(cost?' · '+fmt(cost):''),off:state.cash+state.bank<(cost||0),fn:()=>{if(!payMG(cost))return;setTimeout(()=>play(type,o),60);}};}
/* enchaînement de plusieurs épreuves (ex. cuisine : couper, cuire, dresser) */
function chain(list,o){let i=0,sum=0;const next=s=>{if(i>0)sum+=s;if(i>=list.length){const avg=sum/list.length;const f=Object.assign({},o,{done:o.done});play('result',Object.assign(f,{score:avg}));return;}
  const step=Object.assign({},list[i]);step.sub=(o.title||'')+' · étape '+(i+1)+'/'+list.length;step.done=s=>{if(s==null)return;next(s);};step.gain=null;step.min=0;step.cost=i===0?o.cost:0;step.replay=false;i++;play(step.type,step);};next(0);}
function actChain(label,cost,list,o){o=Object.assign({},o||{});o.cost=cost||0;return {label:'🎮 '+label+(cost?' · '+fmt(cost):''),off:state.cash+state.bank<(cost||0),fn:()=>{if(!payMG(cost))return;setTimeout(()=>chain(list,o),60);}};}

/* ======================================================================
   DÉFINITIONS DES JEUX
   ====================================================================== */
const DEF={};
/* résultat d'un enchaînement */
DEF.result={name:'Résultat',init(G,o){G.label='';},step(G){end(G.o.score);},draw(){bg('#16202c','#0b1017');}};
/* ---------- 1. TIMING : arrête le curseur dans la zone ---------- */
DEF.timing={name:'Timing',icon:'🎯',intro:'Arrête le curseur au bon moment. La zone verte rétrécit à chaque essai.',help:['Espace / clic : valider'],
  init(G,o){G.n=o.rounds||5;G.i=0;G.q=[];G.x=0;G.v=1;G.fl=0;G.spd=(o.speed||1)*(.75+.25*(o.diff||.5));this.zone(G);},
  zone(G){const o=G.o,w=CL(.28-G.i*.035*(1+(o.diff||.5)),.07,.3);G.zw=w;G.zc=R(w/2+.05,1-w/2-.05);G.lab=(o.steps&&o.steps[G.i%o.steps.length])||('Essai '+(G.i+1));},
  step(G,dt){if(G.wait>0){G.wait-=dt;if(G.wait<=0){G.i++;if(G.i>=G.n){end(G.q.reduce((a,b)=>a+b,0)/G.n);return;}this.zone(G);}return;}
    const s=G.spd*(1+G.i*.12)*(G.o.wobble?1+.5*Math.sin(G.t*3):1);G.x+=G.v*s*dt;if(G.x>1){G.x=1;G.v=-1;}if(G.x<0){G.x=0;G.v=1;}G.label='Essai '+Math.min(G.n,G.i+1)+'/'+G.n+' · '+Math.round(G.q.reduce((a,b)=>a+b,0)/Math.max(1,G.q.length)*100)+' %';},
  key(G,k){if(k==='A')this.hit(G);},tap(G){this.hit(G);},
  hit(G){if(G.wait>0)return;const d=Math.abs(G.x-G.zc),hw=G.zw/2;let q=0;if(d<=hw){q=d<hw*.3?1:1-(d-hw*.3)/(hw*.7)*.5;}G.q.push(q);G.wait=.8;G.fl=1;G.last=q;
    if(q>=.95){pop('PARFAIT !',W/2,170,'#ffd24a');sfx.ok();}else if(q>0){pop(q>.75?'Très bien':'Bien',W/2,170,'#7ee0a3');sfx.ok();}else{pop('Raté',W/2,170,'#ff7b6b');sfx.bad();}},
  draw(G,dt){const o=G.o;bg(o.bg1||'#1b2a3a',o.bg2||'#0c131c');
    emo(o.icon||'🎯',W/2,110+(G.wait>0?-10*Math.sin(G.wait*8):0),84);txt(G.lab||'',W/2,215,30,'#e9eff6');
    const x0=110,w=W-220,y=300;rr(x0,y,w,46,23);cx.fillStyle='rgba(255,255,255,.1)';cx.fill();
    rr(x0+(G.zc-G.zw/2)*w,y,G.zw*w,46,12);cx.fillStyle='rgba(126,224,163,.55)';cx.fill();rr(x0+(G.zc-G.zw*.15)*w,y,G.zw*.3*w,46,8);cx.fillStyle='#ffd24a';cx.fill();
    const nx=x0+G.x*w;cx.fillStyle='#fff';cx.fillRect(nx-4,y-16,8,78);cx.beginPath();cx.moveTo(nx-12,y-22);cx.lineTo(nx+12,y-22);cx.lineTo(nx,y-6);cx.fill();
    for(let i=0;i<G.n;i++){cx.beginPath();cx.arc(W/2-(G.n-1)*22+i*44,420,14,0,7);cx.fillStyle=i<G.q.length?(G.q[i]>=.95?'#ffd24a':G.q[i]>0?'#7ee0a3':'#ff7b6b'):'rgba(255,255,255,.15)';cx.fill();}
    txt('Espace ou clic pour valider',W/2,480,22,'rgba(233,239,246,.6)',null,500);}};
/* ---------- 2. RYTHME : notes qui tombent ---------- */
const LCOL=['#ff6b8b','#6cc6ff','#7ee0a3','#ffc15a'],LARR=['◀','▼','▲','▶'];
DEF.rhythm={name:'Rythme',icon:'🎵',intro:'Appuie quand la note touche la ligne. Enchaîne les combos !',help:['← ↓ ↑ → (ou F G H J)','Toucher les colonnes'],
  init(G,o){G.L=o.lanes||4;G.bpm=o.bpm||112;G.dur=o.dur||30;G.notes=[];G.spb=60/G.bpm;G.sp=360;G.hitY=440;G.combo=0;G.max=0;G.per=0;G.good=0;G.miss=0;G.flash=[0,0,0,0];G.beat=-1;G.rv=o.rival?R(.55,.8)*(.85+.3*(o.diff||.5)):0;
    const den=.45+.4*(o.diff||.5);for(let t=2;t<G.dur-.5;t+=G.spb/2){const onBeat=Math.round(t/G.spb*2)%2===0;if(Math.random()<(onBeat?den:den*.45)){G.notes.push({t,l:RI(0,G.L-1),st:0});if(Math.random()<.08*(o.diff||.5))G.notes.push({t,l:RI(0,G.L-1),st:0});}}
    G.total=G.notes.length;G.t0=null;},
  lane(G,k){const m=G.L===2?{L:0,R:1,f:0,j:1,D:0,U:1}:G.L===3?{L:0,D:1,U:1,R:2,f:0,g:1,h:1,j:2}:{L:0,f:0,D:1,g:1,U:2,h:2,R:3,j:3};return m[k];},
  key(G,k){const l=this.lane(G,k);if(l!=null)this.hit(G,l);},
  tap(G,x,y){const lw=Math.min(130,600/G.L),x0=W/2-lw*G.L/2;const l=Math.floor((x-x0)/lw);if(l>=0&&l<G.L)this.hit(G,l);},
  hit(G,l){G.flash[l]=1;let best=null,bd=9;G.notes.forEach(n=>{if(n.st||n.l!==l)return;const d=Math.abs(n.t-G.t);if(d<bd){bd=d;best=n;}});
    if(best&&bd<.16){best.st=1;const p=bd<.06;if(p)G.per++;else G.good++;G.combo++;G.max=Math.max(G.max,G.combo);pop(p?'PARFAIT':'BIEN',this.lx(G,l),G.hitY-60,p?'#ffd24a':'#7ee0a3');tone([523,587,659,784][l]*(p?2:1),.12,'triangle',.07);}
    else{G.combo=0;tone(110,.08,'square',.03);}},
  lx(G,l){const lw=Math.min(130,600/G.L);return W/2-lw*G.L/2+lw*(l+.5);},
  step(G,dt){const A=au();const b=Math.floor(G.t/G.spb);if(b!==G.beat){G.beat=b;if(A){kick();if(b%2)hat(A.currentTime+G.spb/2,.05);}}
    G.notes.forEach(n=>{if(!n.st&&G.t-n.t>.18){n.st=2;G.miss++;G.combo=0;}});G.flash=G.flash.map(f=>Math.max(0,f-dt*4));
    const sc=(G.per+G.good*.6)/Math.max(1,G.total);G.label='Combo x'+G.combo+' · '+Math.round(sc*100)+' %'+(G.rv?' · Rival '+Math.round(G.rv*100)+' %':'');
    if(G.t>G.dur){let s=sc;if(G.o.rival){G.resNote=s>=G.rv?'Tu remportes la battle face à '+(G.o.rivalName||'ton rival')+' !':(G.o.rivalName||'Ton rival')+' l’emporte cette fois.';if(s>=G.rv)s=Math.max(s,.62);else s=Math.min(s,.55);}end(s);}},
  draw(G){const o=G.o,pulse=Math.max(0,1-(G.t%G.spb)/G.spb);bg(o.bg1||'#2a1240',o.bg2||'#0b0716');
    for(let i=0;i<14;i++){cx.globalAlpha=.06+.08*pulse;cx.fillStyle=LCOL[i%4];cx.beginPath();cx.arc((i*173+G.t*30)%W,(i*97)%H,40+60*pulse,0,7);cx.fill();}cx.globalAlpha=1;
    emo(o.icon||'🎵',90,90,60);if(o.rival){emo(o.rivalIcon||'😎',W-90,90,60);txt(o.rivalName||'Rival',W-90,140,20,'#fff');}
    const lw=Math.min(130,600/G.L),x0=W/2-lw*G.L/2;
    for(let l=0;l<G.L;l++){const x=x0+l*lw;cx.fillStyle='rgba(255,255,255,'+(.04+.12*G.flash[l])+')';cx.fillRect(x+4,0,lw-8,H);
      cx.beginPath();cx.arc(x+lw/2,G.hitY,lw*.36,0,7);cx.strokeStyle=LCOL[l];cx.lineWidth=4+6*G.flash[l];cx.stroke();txt(LARR[G.L===2?[0,3][l]:G.L===3?[0,1,3][l]:l],x+lw/2,G.hitY+1,26,LCOL[l]);}
    G.notes.forEach(n=>{if(n.st===1)return;const y=G.hitY-(n.t-G.t)*G.sp;if(y<-40||y>H+40)return;const x=x0+n.l*lw+lw/2;cx.globalAlpha=n.st===2?.25:1;cx.beginPath();cx.arc(x,y,lw*.3,0,7);cx.fillStyle=LCOL[n.l];cx.fill();cx.strokeStyle='#fff';cx.lineWidth=3;cx.stroke();cx.globalAlpha=1;});
    bar(W/2-200,24,400,10,G.t/G.dur,G.col);if(G.combo>4)txt(G.combo+' COMBO',W/2,H-30,30+pulse*8,'#ffd24a');}};
/* ---------- 3. COURSE : esquive et collecte (jet-ski, cheval, scooter…) ---------- */
function rider(kind,x,y,t){cx.save();cx.translate(x,y);const s=Math.sin(t*10);
  if(kind==='jetski'||kind==='boat'){cx.fillStyle='rgba(255,255,255,.5)';cx.beginPath();cx.moveTo(-26,30);cx.lineTo(-40-6*s,70);cx.lineTo(40+6*s,70);cx.lineTo(26,30);cx.fill();
    cx.fillStyle=kind==='boat'?'#f4f1ea':'#ff5f5f';rr(-24,-40,48,80,kind==='boat'?10:20);cx.fill();cx.fillStyle='#1f2a3a';rr(-14,-14,28,30,8);cx.fill();emo('🧑',0,-2,30);}
  else if(kind==='kayak'){cx.fillStyle='#ffc23d';cx.beginPath();cx.ellipse(0,0,14,46,0,0,7);cx.fill();emo('🧑',0,0,26);cx.strokeStyle='#333';cx.lineWidth=4;cx.beginPath();cx.moveTo(-34,-10*s);cx.lineTo(34,10*s);cx.stroke();}
  else if(kind==='horse'){emo('🐎',0,0,70);}
  else if(kind==='car'){cx.fillStyle='#d94f4f';rr(-24,-44,48,88,12);cx.fill();cx.fillStyle='#bfe3ff';rr(-18,-24,36,20,5);cx.fill();rr(-18,14,36,14,5);cx.fill();cx.fillStyle='#111';[[-26,-26],[22,-26],[-26,18],[22,18]].forEach(([a,b])=>cx.fillRect(a,b,4,14));}
  else if(kind==='scooter'){cx.fillStyle='#58d68d';rr(-10,-36,20,72,10);cx.fill();emo('🧑',0,0,30);}
  else if(kind==='swim'){emo('🏊',0,0,56);cx.strokeStyle='rgba(255,255,255,.6)';cx.lineWidth=3;cx.beginPath();cx.arc(0,30,20+5*s,0,Math.PI);cx.stroke();}
  else emo(/^[a-z]+$/.test(kind)?'🏃':kind,0,0,60);cx.restore();}
DEF.runner={name:'Course',icon:'🏁',intro:'Esquive les obstacles, attrape les bonus. 3 vies.',help:['← → ou Q D : se déplacer','Glisser le doigt'],repeat:true,
  init(G,o){G.px=W/2;G.vx=0;G.obj=[];G.lives=3;G.got=0;G.dur=o.dur||32;G.sp=260*(.8+.4*(o.diff||.5));G.sT=0;G.inv=0;G.off=0;G.need=o.need||14;},
  step(G,dt){const o=G.o;let ax=(G.k.R?1:0)-(G.k.L?1:0);if(G.ptr.down)ax=CL((G.ptr.x-G.px)/60,-1,1);G.vx+=(ax*620-G.vx)*Math.min(1,dt*8);G.px=CL(G.px+G.vx*dt,150,W-150);
    const sp=G.sp*(1+G.t/G.dur*.7);G.off+=sp*dt;G.sT-=dt;if(G.sT<=0){G.sT=R(.32,.62)/(1+G.t/G.dur);const good=Math.random()<.42;G.obj.push({x:R(170,W-170),y:-40,g:good,e:good?PK(o.good||['⭐','🪙']):PK(o.bad||['🪨','🛢️']),r:good?22:28,w:R(-1,1)});}
    G.inv-=dt;G.obj.forEach(b=>{b.y+=sp*dt;if(o.drift)b.x+=Math.sin(G.t*2+b.w*5)*40*dt;
      if(!b.hit&&Math.abs(b.x-G.px)<b.r+22&&Math.abs(b.y-400)<b.r+30){b.hit=1;if(b.g){G.got++;sfx.coin();pop('+1',b.x,b.y,'#ffd24a');}else if(G.inv<=0){G.lives--;G.inv=1.2;sfx.bad();pop('Aïe !',G.px,340,'#ff7b6b');if(G.lives<=0){end(CL(G.got/G.need*.7+G.t/G.dur*.3,0,1)*.6);}}}});
    G.obj=G.obj.filter(b=>b.y<H+60&&!(b.hit&&b.g));G.label='❤️'.repeat(Math.max(0,G.lives))+' · '+(o.goodName||'Bonus')+' '+G.got+'/'+G.need+' · '+Math.max(0,Math.ceil(G.dur-G.t))+' s';
    if(G.t>=G.dur)end(CL(G.got/G.need*.75+.25*(G.lives/3),0,1));},
  draw(G){const o=G.o,t=G.t,k=o.bgk||'water';
    if(k==='water'){bg('#2fb8c9','#1f6f9c');cx.strokeStyle='rgba(255,255,255,.25)';cx.lineWidth=3;for(let i=0;i<14;i++){const y=(i*60+G.off)%(H+60)-30;cx.beginPath();for(let x=0;x<=W;x+=40)cx.lineTo(x,y+Math.sin(x*.02+i)*8);cx.stroke();}}
    else if(k==='sand'){bg('#f2dfa6','#e0c27e');cx.fillStyle='#3fb6c9';cx.fillRect(0,0,110,H);cx.fillStyle='rgba(255,255,255,.5)';cx.fillRect(108,0,6,H);for(let i=0;i<30;i++){cx.fillStyle='rgba(160,120,60,.25)';const y=(i*41+G.off)%H;cx.fillRect(160+(i*137)%640,y,8,4);}}
    else if(k==='forest'){bg('#3f6b3a','#2a4a2a');cx.fillStyle='#b98a5a';cx.fillRect(140,0,W-280,H);for(let i=0;i<20;i++){const y=(i*70+G.off)%(H+80)-40;emo('🌴',60,y,54);emo('🌳',W-60,(y+35)%H,54);}}
    else{bg('#3b4048','#2a2e35');cx.fillStyle='#6b7078';cx.fillRect(130,0,10,H);cx.fillRect(W-140,0,10,H);cx.fillStyle='#f4f4f4';for(let i=0;i<10;i++){const y=(i*80+G.off)%(H+80)-40;cx.fillRect(W/2-4,y,8,40);}}
    G.obj.forEach(b=>{if(b.hit&&!b.g)cx.globalAlpha=.3;emo(b.e,b.x,b.y,b.r*2);cx.globalAlpha=1;});
    if(G.inv>0&&Math.floor(G.inv*10)%2)cx.globalAlpha=.4;rider(o.ride||'run',G.px,400,t);cx.globalAlpha=1;bar(W/2-200,20,400,10,G.t/G.dur,G.col);}};
/* ---------- 4. ATTRAPE : panier en bas, objets qui tombent ---------- */
DEF.catch={name:'Attrape',icon:'🧺',intro:'Attrape ce qu’il faut, évite le reste.',help:['← → : déplacer','Glisser le doigt'],repeat:true,
  init(G,o){G.px=W/2;G.it=[];G.ok=0;G.spawned=0;G.badc=0;G.dur=o.dur||28;G.sT=0;},
  step(G,dt){const o=G.o;let ax=(G.k.R?1:0)-(G.k.L?1:0);if(G.ptr.down||G.ptr.moved)G.px+=CL(G.ptr.x-G.px,-900*dt,900*dt);G.px=CL(G.px+ax*560*dt,70,W-70);
    G.sT-=dt;if(G.sT<=0){G.sT=R(.45,.8)/(1+G.t/G.dur*.8);const g=Math.random()<.7;if(g)G.spawned++;G.it.push({x:R(80,W-80),y:-30,v:R(150,230)*(1+G.t/G.dur*.6)*(.85+.3*(o.diff||.5)),g,e:g?PK(o.good||['🍎']):PK(o.bad||['💣']),r:R(-2,2)});}
    G.it.forEach(b=>{b.y+=b.v*dt;if(!b.done&&b.y>430&&b.y<470&&Math.abs(b.x-G.px)<62){b.done=1;if(b.g){G.ok++;sfx.coin();pop('+1',b.x,410,'#7ee0a3');}else{G.badc++;sfx.bad();pop('Oups',b.x,410,'#ff7b6b');}}});
    G.it=G.it.filter(b=>!b.done&&b.y<H+40);const sc=CL((G.ok-G.badc*1.5)/Math.max(6,G.spawned),0,1);G.label=(o.goodName||'Attrapés')+' '+G.ok+' · erreurs '+G.badc+' · '+Math.max(0,Math.ceil(G.dur-G.t))+' s';if(G.t>=G.dur)end(CL(sc*1.1,0,1));},
  draw(G){const o=G.o;bg(o.bg1||'#bfe7ff',o.bg2||'#eaf6ff');cx.fillStyle=o.ground||'#e6d3a0';cx.fillRect(0,470,W,70);
    G.it.forEach(b=>{cx.save();cx.translate(b.x,b.y);cx.rotate(Math.sin(G.t*2+b.r)*.3);emo(b.e,0,0,46);cx.restore();});
    emo(o.basket||'🧺',G.px,452,74);if(o.who)emo(o.who,G.px+52,430,40);bar(W/2-200,20,400,10,G.t/G.dur,G.col);}};
/* ---------- 5. MÉMOIRE (Simon) ---------- */
DEF.simon={name:'Mémoire',icon:'🧠',intro:'Regarde la séquence, puis reproduis-la. Elle s’allonge à chaque niveau.',help:['1 2 3 4 ou flèches','Cliquer les cases'],
  init(G,o){G.pads=o.pads||[['🔴','Rouge'],['🔵','Bleu'],['🟢','Vert'],['🟡','Jaune']];G.max=o.max||7;G.seq=[RI(0,3),RI(0,3)];G.lvl=0;G.show=0;G.si=0;G.inp=0;G.mode='show';G.lit=-1;G.lt=0;G.wait=.6;},
  rect(i){const w=300,h=150,x=W/2-w-10+(i%2)*(w+20),y=120+Math.floor(i/2)*(h+20);return {x,y,w,h};},
  step(G,dt){G.lt-=dt;if(G.lt<=0)G.lit=-1;G.label='Niveau '+(G.lvl+1)+'/'+G.max+' · '+(G.mode==='show'?'Regarde…':'À toi !');
    if(G.mode==='show'){G.wait-=dt;if(G.wait<=0){if(G.si<G.seq.length){const p=G.seq[G.si++];G.lit=p;G.lt=.42;tone([392,494,587,698][p],.3,'sine',.12);G.wait=Math.max(.32,.62-G.lvl*.04);}else{G.mode='in';G.inp=0;}}}},
  press(G,i){if(G.mode!=='in')return;G.lit=i;G.lt=.2;if(G.seq[G.inp]===i){tone([392,494,587,698][i],.2,'sine',.12);G.inp++;if(G.inp>=G.seq.length){G.lvl++;pop('Bravo !',W/2,90,'#7ee0a3');if(G.lvl>=G.max){end(1);return;}G.seq.push(RI(0,3));G.mode='show';G.si=0;G.wait=.9;}}
    else{sfx.bad();pop('Erreur',W/2,90,'#ff7b6b');end(G.lvl/G.max);}},
  key(G,k){const m={'1':0,'2':1,'3':2,'4':3,L:0,U:1,D:2,R:3};if(m[k]!=null)this.press(G,m[k]);},
  tap(G,x,y){for(let i=0;i<4;i++)if(inB(this.rect(i),x,y))this.press(G,i);},
  draw(G){bg(G.o.bg1||'#1e2a3a',G.o.bg2||'#0c131c');txt(G.mode==='show'?'Mémorise la séquence':'Reproduis-la · '+G.inp+'/'+G.seq.length,W/2,70,32,'#e9eff6');
    for(let i=0;i<4;i++){const r=this.rect(i),on=G.lit===i;rr(r.x,r.y,r.w,r.h,22);cx.fillStyle=on?LCOL[i]:'rgba(255,255,255,.08)';cx.fill();cx.lineWidth=4;cx.strokeStyle=LCOL[i];cx.stroke();
      emo(G.pads[i][0],r.x+70,r.y+r.h/2,on?76:62);txt(G.pads[i][1],r.x+r.w/2+50,r.y+r.h/2,28,on?'#111':'#fff');txt(String(i+1),r.x+r.w-22,r.y+22,20,'rgba(255,255,255,.5)');}}};
/* ---------- 6. QUIZ ---------- */
DEF.quiz={name:'Quiz',icon:'❓',intro:'Réponds avant la fin du chrono.',help:['1 2 3 4 ou cliquer'],
  init(G,o){G.qs=SH(o.q||[]).slice(0,o.n||5).map(q=>{const c=q[1][q[2]],a=SH(q[1].slice());return {t:q[0],a,c:a.indexOf(c)};});G.i=0;G.ok=0;G.tl=o.time||12;G.qt=0;G.ans=-1;G.wait=0;},
  rect(i){return {x:W/2-410+(i%2)*420,y:250+Math.floor(i/2)*110,w:400,h:94};},
  step(G,dt){const q=G.qs[G.i];if(!q){end(0);return;}if(G.wait>0){G.wait-=dt;if(G.wait<=0){G.i++;G.qt=0;G.ans=-1;if(G.i>=G.qs.length){end(G.ok/G.qs.length);}}return;}
    G.qt+=dt;if(G.qt>=G.tl){G.ans=-2;G.wait=1.4;sfx.bad();}G.label='Question '+(G.i+1)+'/'+G.qs.length+' · '+G.ok+' bonne'+(G.ok>1?'s':'');},
  pick(G,i){if(G.wait>0||!G.qs[G.i]||i>=G.qs[G.i].a.length)return;G.ans=i;G.wait=1.3;if(i===G.qs[G.i].c){G.ok++;sfx.ok();}else sfx.bad();},
  key(G,k){const m={'1':0,'2':1,'3':2,'4':3};if(m[k]!=null)this.pick(G,m[k]);},tap(G,x,y){for(let i=0;i<4;i++)if(inB(this.rect(i),x,y))this.pick(G,i);},
  draw(G){bg(G.o.bg1||'#22304a',G.o.bg2||'#0e1522');const q=G.qs[G.i];if(!q)return;emo(G.o.icon||'❓',W/2,62,50);
    wrap(q.t,W/2,150,W-140,34);bar(W/2-300,212,600,10,1-G.qt/G.tl,G.qt>G.tl*.7?'#ff7b6b':G.col);
    q.a.forEach((a,i)=>{const r=this.rect(i);let c='rgba(255,255,255,.08)';if(G.wait>0){if(i===q.c)c='rgba(126,224,163,.85)';else if(i===G.ans)c='rgba(255,123,107,.85)';}
      rr(r.x,r.y,r.w,r.h,16);cx.fillStyle=c;cx.fill();cx.strokeStyle='rgba(255,255,255,.2)';cx.lineWidth=2;cx.stroke();txt(String(i+1),r.x+30,r.y+r.h/2,24,'rgba(255,255,255,.5)');wrap(a,r.x+r.w/2+14,r.y+r.h/2,r.w-80,24,'#fff',600);});}};
function wrap(t,x,y,mw,sz,col,wt){cx.font=(wt||700)+' '+sz+'px Rajdhani, "Arial Narrow", sans-serif';const ws=String(t).split(' '),L=[];let cur='';ws.forEach(w=>{const n=cur?cur+' '+w:w;if(cx.measureText(n).width>mw&&cur){L.push(cur);cur=w;}else cur=n;});if(cur)L.push(cur);
  L.forEach((l,i)=>txt(l,x,y+(i-(L.length-1)/2)*sz*1.15,sz,col||'#fff',null,wt));}
/* ---------- 7. MARCHANDAGE ---------- */
DEF.haggle={name:'Marchandage',icon:'🤝',intro:'Fais ton offre. Trop bas, le vendeur s’agace. Trop haut, tu paies trop cher.',help:['← → : ajuster l’offre','Espace : proposer'],repeat:true,
  init(G,o){G.P=o.price||40;G.sell=!!o.sell;G.min=G.sell?G.P*R(1.18,1.4):G.P*R(.58,.75);G.ask=G.sell?G.P*R(1.5,1.7):G.P;G.off=G.sell?G.P*1.8:G.P*.5;G.pat=o.patience||4;G.mood=1;G.say=o.open||(G.sell?'Je te le prends à '+fmt(Math.round(G.P))+', pas plus.':'Pour toi, '+fmt(Math.round(G.P))+'. Prix d’ami !');G.deal=null;G.r=0;},
  step(G,dt){if(G.endIn!=null){G.endIn-=dt;if(G.endIn<=0)end(G.endS);return;}const st=G.P*.6*dt;if(G.k.R)G.off+=st;if(G.k.L)G.off-=st;G.off=CL(G.off,G.P*.2,G.P*2.2);G.label=(G.sell?'Tu vends · ':'Tu achètes · ')+'patience '+'●'.repeat(G.pat)+'○'.repeat(Math.max(0,(G.o.patience||4)-G.pat));},
  key(G,k){if(k==='A')this.prop(G);},
  tap(G,x,y){if(inB(G.bP,x,y))this.prop(G);else if(inB(G.bM,x,y))G.off-=G.P*.05;else if(inB(G.bA,x,y))G.off+=G.P*.05;else if(y>300&&y<360)G.off=CL(G.P*.2+(x-120)/(W-240)*G.P*2,G.P*.2,G.P*2.2);},
  drag(G,x,y){if(y>280&&y<380)G.off=CL(G.P*.2+(x-120)/(W-240)*G.P*2,G.P*.2,G.P*2.2);},
  prop(G){if(G.deal||G.endIn!=null)return;const off=Math.round(G.off),ok=G.sell?off<=G.min*1.02:off>=G.min*.98;G.r++;
    if(ok){G.deal=off;G.say=PK(['Marché conclu !','Allez, d’accord. Tu es dur en affaires !','Tope là !']);sfx.ok();
      const best=G.sell?G.P*1.45:G.P*.6,sc=G.sell?CL((off-G.P)/(best-G.P),0,1):CL((G.P-off)/(G.P-best),0,1);G.resNote=(G.sell?'Vendu ':'Acheté ')+fmt(off)+(G.sell?'':' au lieu de '+fmt(Math.round(G.P)))+'.';G.o.onDeal&&G.o.onDeal(off);G.endIn=.9;G.endS=.35+.65*sc;return;}
    const far=G.sell?off/G.min:G.min/off;G.pat-=far>1.35?2:1;G.mood=Math.max(0,G.pat/(G.o.patience||4));sfx.bad();
    if(G.pat<=0){G.say='Non, non. Va voir ailleurs !';G.resNote='Le vendeur a refusé de traiter.';G.o.onDeal&&G.o.onDeal(null);G.endIn=.9;G.endS=0;return;}
    G.min=G.sell?G.min*R(1.01,1.05):G.min*R(.96,.99);const cnt=G.sell?Math.round(Math.max(G.min,off*.82)):Math.round(Math.min(G.ask,Math.max(G.min*1.08,(off+G.ask)/2)));G.ask=cnt;
    G.say=PK(far>1.35?['Tu rigoles ?','Tu veux me ruiner ?','Sérieusement ?']:['Fais un effort…','On se rapproche.','Hmm, presque.'])+' '+(G.sell?'Je monte à ':'Disons ')+fmt(cnt)+'.';},
  draw(G){const o=G.o;bg(o.bg1||'#5a3a24',o.bg2||'#24160d');emo(o.seller||'🧕',180,170,120);emo(G.mood>.6?'😊':G.mood>.3?'😐':'😠',250,100,44);
    rr(310,90,560,120,20);cx.fillStyle='#fff';cx.fill();cx.beginPath();cx.moveTo(310,150);cx.lineTo(282,170);cx.lineTo(316,170);cx.fill();wrap(G.say,590,150,520,28,'#2a1a10',600);
    emo(o.item||'👕',W-110,250,64);txt(o.itemName||'Article',W-110,300,20,'#ffe9c7');
    const x0=120,w=W-240,k=(G.off-G.P*.2)/(G.P*2);rr(x0,322,w,16,8);cx.fillStyle='rgba(255,255,255,.18)';cx.fill();cx.beginPath();cx.arc(x0+k*w,330,18,0,7);cx.fillStyle=G.col;cx.fill();
    txt('Ton offre : '+fmt(Math.round(G.off)),W/2,385,40,'#fff');
    G.bM=btn(W/2-330,430,120,64,'−',false);G.bP=btn(W/2-180,430,360,64,G.deal?'Accord !':'Proposer · Espace',!G.deal,G.col);G.bA=btn(W/2+210,430,120,64,'+',false);}};
/* ---------- 8. CADENCE : alterner ← → pour avancer ---------- */
DEF.mash={name:'Cadence',icon:'💪',intro:'Alterne gauche et droite le plus vite possible pour remplir la jauge avant la fin.',help:['Alterner ← et →','Toucher les deux boutons'],
  init(G,o){G.p=0;G.lastK=null;G.dur=o.dur||14;G.need=o.need||1;G.rate=0;G.anim=0;},
  push(G,s){if(G.lastK===s)return;G.lastK=s;G.p+=.028*(1.15-.3*(G.o.diff||.5));G.rate=Math.min(1,G.rate+.18);G.anim+=1;if(Math.random()<.4)sfx.tick();},
  key(G,k){if(k==='L')this.push(G,'L');if(k==='R')this.push(G,'R');},
  tap(G,x){this.push(G,x<W/2?'L':'R');},
  step(G,dt){G.p=Math.max(0,G.p-dt*(G.o.drain||.04));G.rate=Math.max(0,G.rate-dt*1.2);G.label=Math.round(G.p*100)+' % · '+Math.max(0,Math.ceil(G.dur-G.t))+' s';
    if(G.p>=1){end(CL(.7+.3*(1-G.t/G.dur),0,1));}else if(G.t>=G.dur)end(G.p*.7);},
  draw(G){const o=G.o,th=o.theme||'run';bg(o.bg1||'#203048',o.bg2||'#0c131c');const p=CL(G.p,0,1);
    if(th==='climb'){for(let i=0;i<12;i++){cx.fillStyle=i%2?'#e9e2d4':'#c9c2b4';cx.fillRect(380,460-i*36,200,30);}emo('🧗',480,450-p*400+Math.sin(G.anim)*4,60);emo(o.top||'🗼',480,40,50);}
    else if(th==='row'){cx.fillStyle='#2fb8c9';cx.fillRect(0,300,W,240);emo(o.icon||'🚣',120+p*700,320+Math.sin(G.anim)*4,80);emo('🏁',860,300,50);}
    else if(th==='lift'){const y=380-p*190;cx.fillStyle='#ccc';cx.fillRect(330,y,300,10);[330,630].forEach(x=>{cx.fillStyle='#333';rr(x-22,y-40,44,90,8);cx.fill();});emo('🏋️',480,410,110);}
    else{cx.fillStyle='#c0563a';cx.fillRect(0,380,W,60);const of=(G.anim*14)%120;for(let i=0;i<10;i++){cx.fillStyle='#fff';cx.fillRect(i*120-of,408,60,4);}emo(o.icon||'🏃',200+p*560,360+Math.abs(Math.sin(G.anim*1.5))*-10,80);}
    bar(160,486,W-320,22,p,G.col);G.bl=btn(40,470,100,56,'◀',G.lastK!=='L');G.br=btn(W-140,470,100,56,'▶',G.lastK!=='R');}};
/* ---------- 9. PHOTO : cadrer les sujets ---------- */
DEF.photo={name:'Photo',icon:'📸',intro:'Cadre le sujet au centre du viseur et déclenche. Les espèces rares valent plus de points.',help:['Souris / flèches : viser','Clic / Espace : photographier'],repeat:true,
  init(G,o){G.sub=(o.subjects||[['🐟',1],['🐠',1],['🐢',3],['🐬',4]]).map((s,i)=>({e:s[0],v:s[1],n:s[2]||'',x:R(100,W-100),y:R(110,H-110),a:R(0,6),sp:R(.4,1.1)/(s[1]>2?1.5:1),sz:s[1]>2?64:46,ph:i}));
    for(let i=0;i<(o.extra||5);i++){const s=PK(G.sub);G.sub.push(Object.assign({},s,{x:R(100,W-100),y:R(110,H-110),a:R(0,6),ph:G.sub.length}));}
    G.cx=W/2;G.cy=H/2;G.shots=[];G.n=o.shots||5;G.dur=o.dur||30;G.fl=0;G.maxV=Math.max(...G.sub.map(s=>s.v));},
  step(G,dt){const sp=380*dt;if(G.k.L)G.cx-=sp;if(G.k.R)G.cx+=sp;if(G.k.U)G.cy-=sp;if(G.k.D)G.cy+=sp;if(G.ptr.moved){G.cx=G.ptr.x;G.cy=G.ptr.y;G.ptr.moved=false;}G.cx=CL(G.cx,60,W-60);G.cy=CL(G.cy,60,H-60);
    G.sub.forEach(s=>{s.a+=dt*s.sp;s.x+=Math.cos(s.a+s.ph)*70*s.sp*dt*(G.o.fast||1);s.y+=Math.sin(s.a*1.3+s.ph)*45*s.sp*dt*(G.o.fast||1);if(s.x<50||s.x>W-50)s.a+=Math.PI;s.x=CL(s.x,50,W-50);s.y=CL(s.y,90,H-60);});G.fl=Math.max(0,G.fl-dt*3);
    G.label='Photos '+G.shots.length+'/'+G.n+' · '+Math.max(0,Math.ceil(G.dur-G.t))+' s';if(G.t>=G.dur||G.shots.length>=G.n)this.fin(G);},
  fin(G){if(G.ended)return;G.ended=1;const sum=G.shots.reduce((a,b)=>a+b.q,0),best=G.shots.slice().sort((a,b)=>b.q-a.q)[0];G.resNote=best&&best.e?'Plus belle photo : '+best.e+' '+(best.n||''):'';end(CL(sum/(G.n*Math.min(3,G.maxV))*1.15,0,1));},
  shoot(G){if(G.shots.length>=G.n)return;G.fl=1;tone(2200,.05,'square',.05);let best=null,bq=0;G.sub.forEach(s=>{const d=Math.hypot(s.x-G.cx,s.y-G.cy);if(d<80){const q=(1-d/80)*Math.min(3,s.v)*(G.shots.some(z=>z.e===s.e)?.6:1);if(q>bq){bq=q;best=s;}}});
    G.shots.push({q:bq,e:best?best.e:'',n:best?best.n:''});pop(best?(bq>1.5?'Superbe !':'Jolie photo'):'Flou…',G.cx,G.cy-90,best?'#ffd24a':'#ff7b6b');},
  key(G,k){if(k==='A')this.shoot(G);},tap(G,x,y){G.cx=x;G.cy=y;this.shoot(G);},
  draw(G){const o=G.o,k=o.bgk||'reef';
    if(k==='reef'){bg('#2fb8c9','#0f4f7a');for(let i=0;i<9;i++)emo(PK2(['🪸','🪨','🌿'],i),i*120+40,H-30,60);}else if(k==='forest'){bg('#7fbf6a','#2a4a2a');for(let i=0;i<8;i++)emo(i%2?'🌳':'🌴',i*130+50,H-60,110);}
    else if(k==='sky'){bg('#ffb36b','#ff7a8a');cx.fillStyle='#2f6f9c';cx.fillRect(0,H*.62,W,H);}else{bg('#9fd8ff','#2e6fd1');cx.fillStyle='#1f6f9c';cx.fillRect(0,H*.45,W,H);}
    G.sub.forEach(s=>{cx.save();cx.translate(s.x,s.y);if(Math.cos(s.a+s.ph)<0)cx.scale(-1,1);emo(s.e,0,0,s.sz);cx.restore();});
    cx.strokeStyle='#fff';cx.lineWidth=3;cx.beginPath();cx.arc(G.cx,G.cy,80,0,7);cx.stroke();cx.beginPath();cx.moveTo(G.cx-100,G.cy);cx.lineTo(G.cx-60,G.cy);cx.moveTo(G.cx+60,G.cy);cx.lineTo(G.cx+100,G.cy);cx.moveTo(G.cx,G.cy-100);cx.lineTo(G.cx,G.cy-60);cx.moveTo(G.cx,G.cy+60);cx.lineTo(G.cx,G.cy+100);cx.stroke();
    G.shots.forEach((s,i)=>{rr(20+i*74,20,64,64,8);cx.fillStyle='#f4f1ea';cx.fill();emo(s.e||'🌫️',52+i*74,50,36);});
    if(G.fl>0){cx.fillStyle='rgba(255,255,255,'+G.fl*.8+')';cx.fillRect(0,0,W,H);}}};
function PK2(a,i){return a[i%a.length];}
/* ---------- 10. MINI-GOLF / GOLF (physique) ---------- */
const HOLES=[{par:2,b:[150,120,810,330],s:[220,330],h:[740,330],w:[[440,220,30,230]]},{par:3,b:[150,100,810,360],s:[210,400],h:[740,170],w:[[330,250,330,30],[600,100,30,120]],mill:[480,330]},{par:3,b:[150,100,810,360],s:[210,170],h:[740,400],w:[[300,100,30,230],[560,230,30,230]]},{par:2,b:[150,140,810,280],s:[210,280],h:[760,280],w:[[400,140,40,90],[400,330,40,90],[600,230,40,100]]}];
DEF.putt={name:'Golf',icon:'⛳',intro:'Tire en arrière depuis la balle pour viser et doser la puissance. Atteins le trou en un minimum de coups.',help:['Glisser depuis la balle puis relâcher','Clavier : ← → viser, Espace maintenu = puissance'],repeat:true,
  init(G,o){G.hs=SH(HOLES.slice()).slice(0,o.holes||3);G.hi=0;G.str=[];this.load(G);},
  load(G){const h=G.hs[G.hi];G.h=h;G.bx=h.s[0];G.by=h.s[1];G.vx=G.vy=0;G.n=0;G.ang=Math.atan2(h.h[1]-h.s[1],h.h[0]-h.s[0]);G.pow=0;G.aim=null;G.sunk=0;},
  moving(G){return Math.hypot(G.vx,G.vy)>4;},
  shot(G,a,p){if(this.moving(G)||G.sunk)return;G.vx=Math.cos(a)*p*900;G.vy=Math.sin(a)*p*900;G.n++;tone(300,.06,'triangle',.08);},
  tap(G,x,y){if(!this.moving(G)&&Math.hypot(x-G.bx,y-G.by)<90)G.aim={x,y};},
  drag(G,x,y){if(G.aim){G.aim.x=x;G.aim.y=y;}},
  release(G,x,y){if(!G.aim)return;const dx=G.bx-x,dy=G.by-y,l=Math.hypot(dx,dy);G.aim=null;if(l>12)this.shot(G,Math.atan2(dy,dx),CL(l/220,0,1));},
  key(G,k){if(k==='A'&&!this.moving(G))G.charge=true;},
  step(G,dt){const h=G.h;if(G.k.L)G.ang-=dt*2;if(G.k.R)G.ang+=dt*2;if(G.charge){if(G.k.A)G.pow=Math.min(1,G.pow+dt*.8);else{this.shot(G,G.ang,Math.max(.05,G.pow));G.pow=0;G.charge=false;}}
    if(G.sunk){G.sunk-=dt;if(G.sunk<=0){G.str.push(G.n);G.hi++;if(G.hi>=G.hs.length){const par=G.hs.reduce((a,b)=>a+b.par,0),tot=G.str.reduce((a,b)=>a+b,0);G.resNote=tot+' coups pour un par de '+par+'.';end(CL(1-(tot-par)/(par*1.6),0,1)*(tot<=par?1:.92));}else this.load(G);}return;}
    const steps=4;for(let s=0;s<steps;s++){const d=dt/steps;G.bx+=G.vx*d;G.by+=G.vy*d;const f=Math.pow(.38,d);G.vx*=f;G.vy*=f;const r=9,B=h.b;
      if(G.bx<B[0]+r){G.bx=B[0]+r;G.vx=Math.abs(G.vx)*.8;}if(G.bx>B[2]-r){G.bx=B[2]-r;G.vx=-Math.abs(G.vx)*.8;}if(G.by<B[1]+r){G.by=B[1]+r;G.vy=Math.abs(G.vy)*.8;}if(G.by>B[1]+B[3]-r){G.by=B[1]+B[3]-r;G.vy=-Math.abs(G.vy)*.8;}
      const walls=h.w.slice();if(h.mill){const a=G.t*1.6,L=70;walls.push([h.mill[0]+Math.cos(a)*L/2-8,h.mill[1]+Math.sin(a)*L/2-8,16,16]);walls.push([h.mill[0]-Math.cos(a)*L/2-8,h.mill[1]-Math.sin(a)*L/2-8,16,16]);}
      walls.forEach(w=>{const nx=CL(G.bx,w[0],w[0]+w[2]),ny=CL(G.by,w[1],w[1]+w[3]),dx=G.bx-nx,dy=G.by-ny,dd=Math.hypot(dx,dy);if(dd<r&&dd>0){const ux=dx/dd,uy=dy/dd;G.bx=nx+ux*r;G.by=ny+uy*r;const vn=G.vx*ux+G.vy*uy;if(vn<0){G.vx-=1.8*vn*ux;G.vy-=1.8*vn*uy;tone(500,.03,'square',.03);}}else if(dd===0){G.vx*=-1;G.vy*=-1;}});
      const hd=Math.hypot(G.bx-h.h[0],G.by-h.h[1]),v=Math.hypot(G.vx,G.vy);if(hd<14&&v<520){G.sunk=1.1;G.vx=G.vy=0;G.bx=h.h[0];G.by=h.h[1];sfx.ok();pop(G.n===1?'TROU EN UN !':G.n<=h.par?'Dans le trou !':'Enfin !',W/2,70,'#ffd24a');break;}}
    if(G.n>=7&&!this.moving(G)&&!G.sunk){G.sunk=.8;G.n=8;pop('Coup max',W/2,70,'#ff7b6b');}
    G.label='Trou '+(G.hi+1)+'/'+G.hs.length+' · par '+h.par+' · coups '+G.n;},
  draw(G){const h=G.h,B=h.b,o=G.o;bg(o.bg1||'#6fb86a',o.bg2||'#3f7a3f');rr(B[0]-14,B[1]-14,B[2]-B[0]+28,B[3]+28,24);cx.fillStyle='#8a5a3a';cx.fill();rr(B[0],B[1],B[2]-B[0],B[3],16);cx.fillStyle=o.green||'#58c95c';cx.fill();
    for(let i=0;i<8;i++){cx.fillStyle='rgba(255,255,255,.04)';cx.fillRect(B[0],B[1]+i*B[3]/8,B[2]-B[0],B[3]/16);}
    h.w.forEach(w=>{rr(w[0],w[1],w[2],w[3],6);cx.fillStyle='#8a5a3a';cx.fill();});
    if(h.mill){const a=G.t*1.6;cx.save();cx.translate(h.mill[0],h.mill[1]);cx.rotate(a);cx.fillStyle='#ff6b6b';cx.fillRect(-35,-6,70,12);cx.restore();cx.beginPath();cx.arc(h.mill[0],h.mill[1],8,0,7);cx.fillStyle='#fff';cx.fill();}
    cx.beginPath();cx.arc(h.h[0],h.h[1],14,0,7);cx.fillStyle='#14231a';cx.fill();cx.fillStyle='#fff';cx.fillRect(h.h[0]-1,h.h[1]-60,3,60);cx.fillStyle='#ff3b30';cx.beginPath();cx.moveTo(h.h[0]+2,h.h[1]-60);cx.lineTo(h.h[0]+30,h.h[1]-50);cx.lineTo(h.h[0]+2,h.h[1]-40);cx.fill();
    if(!G.sunk){cx.beginPath();cx.arc(G.bx+3,G.by+3,9,0,7);cx.fillStyle='rgba(0,0,0,.25)';cx.fill();cx.beginPath();cx.arc(G.bx,G.by,9,0,7);cx.fillStyle='#fff';cx.fill();}
    if(!this.moving(G)&&!G.sunk){let a=G.ang,p=G.pow;if(G.aim){const dx=G.bx-G.aim.x,dy=G.by-G.aim.y;a=Math.atan2(dy,dx);p=CL(Math.hypot(dx,dy)/220,0,1);}
      cx.setLineDash([8,8]);cx.strokeStyle='rgba(255,255,255,.8)';cx.lineWidth=3;cx.beginPath();cx.moveTo(G.bx,G.by);cx.lineTo(G.bx+Math.cos(a)*(40+p*160),G.by+Math.sin(a)*(40+p*160));cx.stroke();cx.setLineDash([]);bar(W/2-150,500,300,14,p,p>.8?'#ff7b6b':G.col);}}};
/* ---------- 11. BILLARD ---------- */
DEF.pool={name:'Billard',icon:'🎱',intro:'Envoie les billes de couleur dans les poches. 10 coups. Attention à ne pas rentrer la blanche !',help:['Glisser depuis la blanche puis relâcher','Clavier : ← → viser, Espace maintenu = puissance'],repeat:true,
  init(G,o){G.T=[130,90,830,450];G.pk=[[130,90],[480,82],[830,90],[130,450],[480,458],[830,450]];G.b=[{x:300,y:270,c:'#fff',cue:1}];const cs=['#ffd23f','#2e6fd1','#e0523e','#7b4bb3','#ff8a2a','#2e9a6a','#8a1f2a'];let k=0;
    for(let r=0;r<4&&k<7;r++)for(let j=0;j<=r&&k<7;j++){G.b.push({x:600+r*21,y:270-r*12+j*24,c:cs[k++]});}G.b.forEach(b=>{b.vx=0;b.vy=0;});G.shots=0;G.max=o.shots||10;G.pot=0;G.foul=0;G.ang=0;G.pow=0;G.aim=null;},
  cue(G){return G.b[0];},moving(G){return G.b.some(b=>!b.in&&Math.hypot(b.vx,b.vy)>3);},
  shot(G,a,p){if(this.moving(G))return;const c=this.cue(G);c.vx=Math.cos(a)*p*1300;c.vy=Math.sin(a)*p*1300;G.shots++;tone(220,.05,'triangle',.1);},
  tap(G,x,y){const c=this.cue(G);if(!this.moving(G)&&Math.hypot(x-c.x,y-c.y)<100)G.aim={x,y};},drag(G,x,y){if(G.aim){G.aim.x=x;G.aim.y=y;}},
  release(G,x,y){if(!G.aim)return;const c=this.cue(G),dx=c.x-x,dy=c.y-y,l=Math.hypot(dx,dy);G.aim=null;if(l>12)this.shot(G,Math.atan2(dy,dx),CL(l/220,0,1));},
  key(G,k){if(k==='A'&&!this.moving(G))G.charge=true;},
  step(G,dt){if(G.k.L)G.ang-=dt*1.6;if(G.k.R)G.ang+=dt*1.6;if(G.charge){if(G.k.A)G.pow=Math.min(1,G.pow+dt*.8);else{this.shot(G,G.ang,Math.max(.05,G.pow));G.pow=0;G.charge=false;}}
    const T=G.T,r=11,S=6;for(let s=0;s<S;s++){const d=dt/S;G.b.forEach(b=>{if(b.in)return;b.x+=b.vx*d;b.y+=b.vy*d;const f=Math.pow(.5,d);b.vx*=f;b.vy*=f;
      if(b.x<T[0]+r){b.x=T[0]+r;b.vx=Math.abs(b.vx)*.85;}if(b.x>T[2]-r){b.x=T[2]-r;b.vx=-Math.abs(b.vx)*.85;}if(b.y<T[1]+r){b.y=T[1]+r;b.vy=Math.abs(b.vy)*.85;}if(b.y>T[3]-r){b.y=T[3]-r;b.vy=-Math.abs(b.vy)*.85;}
      G.pk.forEach(p=>{if(!b.in&&Math.hypot(b.x-p[0],b.y-p[1])<22){b.in=1;b.vx=b.vy=0;if(b.cue){G.foul++;pop('Blanche rentrée !',W/2,60,'#ff7b6b');sfx.bad();}else{G.pot++;pop('Bien joué !',p[0],p[1]-30,'#ffd24a');sfx.ok();}}});});
      for(let i=0;i<G.b.length;i++)for(let j=i+1;j<G.b.length;j++){const a=G.b[i],c=G.b[j];if(a.in||c.in)continue;const dx=c.x-a.x,dy=c.y-a.y,dd=Math.hypot(dx,dy);if(dd<2*r&&dd>0){const nx=dx/dd,ny=dy/dd,ov=(2*r-dd)/2;a.x-=nx*ov;a.y-=ny*ov;c.x+=nx*ov;c.y+=ny*ov;const p=(a.vx-c.vx)*nx+(a.vy-c.vy)*ny;if(p>0){a.vx-=p*nx;a.vy-=p*ny;c.vx+=p*nx;c.vy+=p*ny;if(p>60)tone(900,.02,'square',.02);}}}}
    const c=this.cue(G);if(c.in&&!this.moving(G)){c.in=0;c.x=300;c.y=270;c.vx=c.vy=0;}
    const left=G.b.filter(b=>!b.cue&&!b.in).length;G.label='Billes '+G.pot+'/7 · coups '+G.shots+'/'+G.max+(G.foul?' · fautes '+G.foul:'');
    if(!this.moving(G)&&(left===0||G.shots>=G.max)){if(!G.endT)G.endT=.6;G.endT-=dt;if(G.endT<=0)end(CL((G.pot-G.foul*.7)/7*1.25,0,1));}},
  draw(G){const T=G.T;bg('#3a2418','#1a0f0a');rr(T[0]-26,T[1]-26,T[2]-T[0]+52,T[3]-T[1]+52,22);cx.fillStyle='#6b3a1e';cx.fill();rr(T[0],T[1],T[2]-T[0],T[3]-T[1],8);cx.fillStyle='#1f7a4a';cx.fill();
    G.pk.forEach(p=>{cx.beginPath();cx.arc(p[0],p[1],20,0,7);cx.fillStyle='#0b0b0b';cx.fill();});
    G.b.forEach(b=>{if(b.in)return;cx.beginPath();cx.arc(b.x+2,b.y+3,11,0,7);cx.fillStyle='rgba(0,0,0,.3)';cx.fill();cx.beginPath();cx.arc(b.x,b.y,11,0,7);cx.fillStyle=b.c;cx.fill();cx.beginPath();cx.arc(b.x-3,b.y-4,3,0,7);cx.fillStyle='rgba(255,255,255,.7)';cx.fill();});
    const c=this.cue(G);if(!this.moving(G)){let a=G.ang,p=G.pow;if(G.aim){const dx=c.x-G.aim.x,dy=c.y-G.aim.y;a=Math.atan2(dy,dx);p=CL(Math.hypot(dx,dy)/220,0,1);}
      cx.setLineDash([6,8]);cx.strokeStyle='rgba(255,255,255,.6)';cx.lineWidth=2;cx.beginPath();cx.moveTo(c.x,c.y);cx.lineTo(c.x+Math.cos(a)*400,c.y+Math.sin(a)*400);cx.stroke();cx.setLineDash([]);
      cx.strokeStyle='#d9b38a';cx.lineWidth=7;cx.beginPath();cx.moveTo(c.x-Math.cos(a)*(20+p*60),c.y-Math.sin(a)*(20+p*60));cx.lineTo(c.x-Math.cos(a)*(260+p*60),c.y-Math.sin(a)*(260+p*60));cx.stroke();bar(W/2-150,505,300,14,p,G.col);}}};
/* ---------- 12. PÊCHE : garde le poisson dans la zone ---------- */
DEF.fish={name:'Pêche',icon:'🎣',intro:'Maintiens Espace (ou appuie) pour faire monter la zone verte et garder le poisson dedans jusqu’à remplir la jauge.',help:['Espace maintenu / appui long : monter','Relâcher : descendre'],repeat:true,
  init(G,o){G.list=SH(o.fishes||[['🐟','Vivaneau',1],['🐠','Perroquet',1.2],['🐡','Poisson-globe',1.4]]).slice(0,o.count||3);G.i=0;G.got=[];this.load(G);},
  load(G){const f=G.list[G.i];G.f=f;G.fy=.5;G.ft=.5;G.zy=.4;G.zv=0;G.prog=.3;G.zh=CL(.24-(f[2]-1)*.05-(G.o.diff||.5)*.04,.12,.28);G.wait=0;},
  step(G,dt){if(G.wait>0){G.wait-=dt;if(G.wait<=0){G.i++;if(G.i>=G.list.length){G.resNote=G.got.length?'Prises : '+G.got.join(', '):'Aucune prise.';end(G.got.length/G.list.length);return;}this.load(G);}return;}
    const f=G.f,lv=f[2];if(Math.random()<dt*(1.2+lv*.9))G.ft=R(.05,.95);G.fy+=(G.ft-G.fy)*dt*(1.4+lv*.9);
    const up=G.k.A||G.k.U||G.ptr.down;G.zv+=(up?2.6:-2.2)*dt;G.zv*=Math.pow(.25,dt);G.zy=CL(G.zy+G.zv*dt,0,1-G.zh);if(G.zy<=0||G.zy>=1-G.zh)G.zv*=-.3;
    const inZ=G.fy>=G.zy&&G.fy<=G.zy+G.zh;G.prog=CL(G.prog+(inZ?.22:-.16*lv)*dt,0,1);
    if(G.prog>=1){G.got.push(f[0]+' '+f[1]);G.wait=1.2;sfx.ok();pop('Attrapé : '+f[1]+' !',W/2,80,'#ffd24a');if(G.o.onCatch)G.o.onCatch(f);}
    else if(G.prog<=0){G.wait=1.2;sfx.bad();pop('Il s’est échappé…',W/2,80,'#ff7b6b');}
    G.label='Poisson '+(G.i+1)+'/'+G.list.length+' · '+f[1];},
  draw(G){bg(G.o.bg1||'#5fb8e0',G.o.bg2||'#0f3f6a');cx.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<6;i++){cx.beginPath();cx.ellipse(150+i*120,(G.t*30+i*90)%H,60,8,0,0,7);cx.fill();}
    emo('🚣',220,110,90);cx.strokeStyle='rgba(255,255,255,.7)';cx.lineWidth=2;cx.beginPath();cx.moveTo(262,80);cx.quadraticCurveTo(500,60+Math.sin(G.t*5)*20,560,90+G.fy*380);cx.stroke();emo(G.f?G.f[0]:'🐟',560,90+G.fy*380,40);
    const x=700,y=60,h=420;rr(x,y,70,h,16);cx.fillStyle='rgba(0,0,0,.35)';cx.fill();rr(x+6,y+(1-G.zy-G.zh)*h,58,G.zh*h,10);cx.fillStyle='rgba(126,224,163,.8)';cx.fill();emo(G.f?G.f[0]:'🐟',x+35,y+(1-G.fy)*h,36);
    rr(x+90,y,22,h,11);cx.fillStyle='rgba(0,0,0,.35)';cx.fill();rr(x+90,y+(1-G.prog)*h,22,G.prog*h,11);cx.fillStyle=G.prog>.3?'#ffd24a':'#ff7b6b';cx.fill();}};
/* ---------- 13. BLACKJACK (mises réelles) ---------- */
const SU=['♠','♥','♦','♣'],RK=['A','2','3','4','5','6','7','8','9','10','V','D','R'];
function deck(){const d=[];for(let n=0;n<4;n++)SU.forEach(s=>RK.forEach((r,i)=>d.push({s,r,v:i===0?11:Math.min(10,i+1)})));return SH(d);}
function hv(h){let v=h.reduce((a,c)=>a+c.v,0),a=h.filter(c=>c.r==='A').length;while(v>21&&a>0){v-=10;a--;}return v;}
DEF.cards21={name:'Blackjack',icon:'🃏',intro:'Approche-toi de 21 sans dépasser. Le croupier tire jusqu’à 17. Mise débitée à chaque main.',help:['1 : tirer · 2 : rester · 3 : doubler','Espace : main suivante'],
  init(G,o){G.bet=o.bet||10;G.hands=o.hands||5;G.h=0;G.net=0;G.win=0;G.d=deck();G.st='bet';G.msg='Espace ou « Distribuer » pour commencer';},
  deal(G){if(G.st!=='bet'&&G.st!=='done')return;if(G.h>=G.hands){end(CL(.5+G.net/(G.bet*G.hands*1.2),0,1));return;}if(state.cash+state.bank<G.bet){G.msg='Plus assez d’argent pour miser.';end(CL(.5+G.net/(G.bet*G.hands*1.2),0,1));return;}
    if(typeof takeMoney==='function')takeMoney(G.bet);else state.cash-=G.bet;G.cur=G.bet;G.h++;if(G.d.length<15)G.d=deck();G.P=[G.d.pop(),G.d.pop()];G.D=[G.d.pop(),G.d.pop()];G.st='play';G.msg='À toi : tirer ou rester ?';tone(700,.05,'triangle',.06);
    if(hv(G.P)===21)this.stand(G,true);},
  hit(G){if(G.st!=='play')return;G.P.push(G.d.pop());tone(700,.05,'triangle',.06);if(hv(G.P)>21)this.settle(G,-1,'Tu dépasses 21…');else if(hv(G.P)===21)this.stand(G);},
  dbl(G){if(G.st!=='play'||G.P.length!==2||state.cash+state.bank<G.cur)return;if(typeof takeMoney==='function')takeMoney(G.cur);else state.cash-=G.cur;G.cur*=2;G.P.push(G.d.pop());if(hv(G.P)>21)this.settle(G,-1,'Tu dépasses 21…');else this.stand(G);},
  stand(G,bj){while(hv(G.D)<17)G.D.push(G.d.pop());const p=hv(G.P),d=hv(G.D);if(bj&&G.P.length===2&&d!==21)this.settle(G,1.5,'BLACKJACK !');else if(d>21||p>d)this.settle(G,1,'Gagné !');else if(p===d)this.settle(G,0,'Égalité, mise rendue.');else this.settle(G,-1,'Le croupier gagne.');},
  settle(G,k,m){G.st='done';G.msg=m+' Espace : main suivante';let back=0;if(k>0)back=G.cur+G.cur*k;else if(k===0)back=G.cur;state.cash+=Math.round(back);G.net+=Math.round(back)-G.cur;if(k>0){G.win++;sfx.coin();}else if(k<0)sfx.bad();
    G.resNote='Bilan : '+(G.net>=0?'+':'')+fmt(G.net)+' sur '+G.h+' main'+(G.h>1?'s':'')+'.';},
  key(G,k){if(k==='A')this.deal(G);else if(k==='1')this.hit(G);else if(k==='2'&&G.st==='play')this.stand(G);else if(k==='3')this.dbl(G);},
  tap(G,x,y){if(inB(G.b1,x,y))this.hit(G);else if(inB(G.b2,x,y)&&G.st==='play')this.stand(G);else if(inB(G.b3,x,y))this.dbl(G);else if(inB(G.b0,x,y))this.deal(G);},
  step(G){G.label='Main '+G.h+'/'+G.hands+' · mise '+fmt(G.cur||G.bet)+' · bilan '+(G.net>=0?'+':'')+fmt(G.net);},
  card(c,x,y,hid){rr(x,y,84,118,10);cx.fillStyle=hid?'#8a1f2a':'#fbf8f2';cx.fill();cx.strokeStyle='rgba(0,0,0,.3)';cx.lineWidth=2;cx.stroke();if(hid){txt('✦',x+42,y+59,40,'#f5c451');return;}const red=c.s==='♥'||c.s==='♦';txt(c.r,x+20,y+20,26,red?'#c0392b':'#111');txt(c.s,x+42,y+66,46,red?'#c0392b':'#111');},
  draw(G){bg('#1f6a45','#0c3a24');rr(60,40,W-120,H-80,200);cx.strokeStyle='rgba(245,196,81,.35)';cx.lineWidth=4;cx.stroke();
    if(G.D){txt('Croupier'+(G.st==='play'?'':' · '+hv(G.D)),W/2,70,24,'#f5c451');G.D.forEach((c,i)=>this.card(c,W/2-G.D.length*46+i*92,90,G.st==='play'&&i===1));
      txt('Toi · '+hv(G.P),W/2,262,24,'#f5c451');G.P.forEach((c,i)=>this.card(c,W/2-G.P.length*46+i*92,282,false));}
    txt(G.msg,W/2,425,24,'#fff',null,600);
    if(G.st==='play'){G.b1=btn(W/2-330,455,200,60,'1 · Tirer',true,G.col);G.b2=btn(W/2-100,455,200,60,'2 · Rester',true,'#7ee0a3');G.b3=btn(W/2+130,455,200,60,'3 · Doubler',G.P.length===2,'#ffc15a');G.b0=null;}
    else{G.b0=btn(W/2-150,455,300,60,G.h>=G.hands?'Terminer':'Distribuer · '+fmt(G.bet),true,G.col);G.b1=G.b2=G.b3=null;}}};
/* ---------- 14. MACHINE À SOUS ---------- */
const SYM=[['🍒',2],['🍋',3],['🔔',5],['🍀',8],['💎',15],['7️⃣',30]];
DEF.slots={name:'Machine à sous',icon:'🎰',intro:'Lance les rouleaux et arrête-les un par un (Espace). 3 symboles identiques = jackpot.',help:['Espace / clic : lancer puis arrêter chaque rouleau'],
  init(G,o){G.bet=o.bet||5;G.spins=o.spins||8;G.n=0;G.net=0;G.r=[0,1,2].map(()=>({i:RI(0,5),off:0,on:false}));G.st='idle';G.msg='Espace : lancer ('+fmt(G.bet)+')';G.stopI=0;},
  act(G){if(G.st==='idle'){if(G.n>=G.spins){end(CL(.5+G.net/(G.bet*G.spins),0,1));return;}if(state.cash+state.bank<G.bet){end(CL(.5+G.net/(G.bet*G.spins),0,1));return;}
      if(typeof takeMoney==='function')takeMoney(G.bet);else state.cash-=G.bet;G.n++;G.r.forEach(r=>r.on=true);G.st='spin';G.stopI=0;G.msg='Espace : arrêter le rouleau 1';G.auto=2.4;}
    else if(G.st==='spin'){const r=G.r[G.stopI];r.on=false;r.i=Math.round(r.i)%6;tone(500+G.stopI*120,.08,'square',.05);G.stopI++;if(G.stopI>=3)this.pay(G);else G.msg='Espace : arrêter le rouleau '+(G.stopI+1);}},
  pay(G){G.st='idle';const s=G.r.map(r=>SYM[(Math.round(r.i)%6+6)%6]);let w=0;if(s[0][0]===s[1][0]&&s[1][0]===s[2][0])w=G.bet*s[0][1];else if(s.filter(x=>x[0]==='🍒').length===2)w=G.bet*2;else if(s[0][0]===s[1][0]||s[1][0]===s[2][0])w=Math.round(G.bet*.5);
    state.cash+=w;G.net+=w-G.bet;G.msg=(w>G.bet?'Gagné '+fmt(w)+' !':w?'Petit gain : '+fmt(w):'Perdu.')+'  Espace : relancer';if(w>G.bet){sfx.coin();pop('+'+fmt(w),W/2,120,'#ffd24a');}G.resNote='Bilan : '+(G.net>=0?'+':'')+fmt(G.net)+' en '+G.n+' tours.';},
  key(G,k){if(k==='A')this.act(G);},tap(G){this.act(G);},
  step(G,dt){G.r.forEach((r,i)=>{if(r.on)r.i=(r.i+dt*(14+i*3))%6;});if(G.st==='spin'){G.auto-=dt;if(G.auto<=0){G.auto=.7;this.act(G);}}G.label='Tour '+G.n+'/'+G.spins+' · bilan '+(G.net>=0?'+':'')+fmt(G.net);},
  draw(G){bg('#3a0f2a','#12040d');rr(200,80,560,330,30);cx.fillStyle='#c0392b';cx.fill();rr(230,140,500,200,18);cx.fillStyle='#fbf8f2';cx.fill();txt('★ JACKPOT ★',W/2,112,34,'#ffd24a');
    G.r.forEach((r,i)=>{const x=310+i*170;cx.save();cx.beginPath();cx.rect(x-75,145,150,190);cx.clip();for(let k=-1;k<=1;k++){const v=r.i+k,idx=((Math.floor(v)%6)+6)%6,fr=v-Math.floor(v);emo(SYM[idx][0],x,240-(k-fr)*0+(-k+fr)*-0+(k*-70)+fr*70,r.on?70:80);}cx.restore();if(i<2){cx.fillStyle='#ddd';cx.fillRect(x+82,150,4,180);}});
    cx.strokeStyle='#ffd24a';cx.lineWidth=4;cx.beginPath();cx.moveTo(230,240);cx.lineTo(730,240);cx.stroke();txt(G.msg,W/2,450,26,'#fff',null,600);
    SYM.forEach((s,i)=>{emo(s[0],120+i*145,505,28);txt('×'+s[1],160+i*145,505,20,'#ffd24a');});}};
/* ---------- 15. PENALTY ---------- */
DEF.penalty={name:'Tirs au but',icon:'⚽',intro:'Stoppe le viseur horizontal, puis vertical, puis la puissance. Le gardien plonge !',help:['Espace / clic : valider chaque étape'],
  init(G,o){G.n=o.shots||5;G.i=0;G.goals=0;G.ph=0;G.ax=0;G.ay=0;G.pw=0;G.v=1;G.anim=0;G.res=[];},
  key(G,k){if(k==='A')this.nx(G);},tap(G){this.nx(G);},
  nx(G){if(G.anim>0)return;sfx.tick();if(G.ph<2){G.ph++;G.v=1;return;}const tx=G.ax,ty=G.ay,pw=G.pw;const kd=Math.random()<.5+(G.o.diff||.5)*.2?tx+R(-.25,.25):R(-1,1);G.kx=CL(kd,-1,1);G.bx=tx;G.by=ty;
    const miss=pw>.93||Math.abs(tx)>.97||ty>.95,saved=!miss&&Math.abs(G.kx-tx)<(.32-.15*pw)&&ty<.85;G.out=miss?'À côté !':saved?'Arrêt du gardien !':'BUT !';if(!miss&&!saved){G.goals++;sfx.ok();}else sfx.bad();G.res.push(!miss&&!saved);G.anim=1.6;},
  step(G,dt){const s=dt*(1.5+(G.o.diff||.5));if(G.anim>0){G.anim-=dt;if(G.anim<=0){G.i++;G.ph=0;G.ax=0;G.ay=0;G.pw=0;if(G.i>=G.n){end(G.goals/G.n);}}}
    else if(G.ph===0){G.ax+=G.v*s*1.4;if(Math.abs(G.ax)>1){G.ax=Math.sign(G.ax);G.v*=-1;}}else if(G.ph===1){G.ay+=G.v*s;if(G.ay>1||G.ay<0){G.ay=CL(G.ay,0,1);G.v*=-1;}}else{G.pw+=G.v*s*1.2;if(G.pw>1||G.pw<0){G.pw=CL(G.pw,0,1);G.v*=-1;}}
    G.label='Tir '+Math.min(G.n,G.i+1)+'/'+G.n+' · buts '+G.goals;},
  draw(G){bg('#5fa65c','#2e6b34');cx.fillStyle='#3a8f3e';for(let i=0;i<6;i++)cx.fillRect(0,300+i*40,W,20);const gx=230,gy=90,gw=500,gh=200;
    cx.strokeStyle='#fff';cx.lineWidth=10;cx.beginPath();cx.moveTo(gx,gy+gh);cx.lineTo(gx,gy);cx.lineTo(gx+gw,gy);cx.lineTo(gx+gw,gy+gh);cx.stroke();cx.strokeStyle='rgba(255,255,255,.25)';cx.lineWidth=1;for(let i=1;i<20;i++){cx.beginPath();cx.moveTo(gx+i*25,gy);cx.lineTo(gx+i*25,gy+gh);cx.stroke();}for(let i=1;i<8;i++){cx.beginPath();cx.moveTo(gx,gy+i*25);cx.lineTo(gx+gw,gy+i*25);cx.stroke();}
    const k=G.anim>0?1-Math.max(0,G.anim-1)/.6:0,kx=gx+gw/2+(G.anim>0?G.kx*gw/2*Math.min(1,k*1.6):Math.sin(G.t*3)*30);emo('🧤',kx,gy+gh-60,70);emo('🧍',kx,gy+gh-20,90);
    const tx=gx+gw/2+G.ax*gw/2,ty=gy+gh-G.ay*gh;
    if(G.anim>0){const p=Math.min(1,(1.6-G.anim)/.5),bx=W/2+(gx+gw/2+G.bx*gw/2*1.05-W/2)*p,by=470+(gy+gh-G.by*gh-470)*p;emo('⚽',bx,by,46-16*p);if(G.anim<1.2)txt(G.out,W/2,60,54,G.out==='BUT !'?'#ffd24a':'#ff7b6b');}
    else{emo('⚽',W/2,470,46);cx.strokeStyle='#ffd24a';cx.lineWidth=3;cx.beginPath();cx.arc(tx,G.ph>=1?ty:gy+gh/2,20,0,7);cx.stroke();if(G.ph===0){cx.fillStyle='rgba(255,210,74,.5)';cx.fillRect(tx-2,gy,4,gh);}if(G.ph===1){cx.fillStyle='rgba(255,210,74,.5)';cx.fillRect(gx,ty-2,gw,4);}
      txt(['Vise : gauche / droite','Hauteur','Puissance'][G.ph],W/2,330,30,'#fff');if(G.ph===2)bar(W/2-160,360,320,18,G.pw,G.pw>.93?'#ff7b6b':G.col);}
    G.res.forEach((r,i)=>{cx.beginPath();cx.arc(40+i*36,500,12,0,7);cx.fillStyle=r?'#7ee0a3':'#ff7b6b';cx.fill();});}};
/* ---------- 16. RESPIRATION ---------- */
DEF.breath={name:'Respiration',icon:'🌬️',intro:'Maintiens Espace (ou le doigt) pendant que le cercle grandit, relâche quand il rétrécit.',help:['Maintenir : inspirer · relâcher : expirer'],
  init(G,o){G.cyc=o.cycles||4;G.per=o.period||8;G.good=0;G.tot=0;},
  step(G,dt){const ph=(G.t%G.per)/G.per,inh=ph<.5,hold=G.k.A||G.ptr.down;G.tot+=dt;if(hold===inh)G.good+=dt;G.inh=inh;G.ok=hold===inh;
    G.label='Cycle '+Math.min(G.cyc,Math.floor(G.t/G.per)+1)+'/'+G.cyc+' · synchro '+Math.round(G.good/Math.max(.1,G.tot)*100)+' %';if(G.t>=G.cyc*G.per)end(CL((G.good/G.tot-.35)/.6,0,1));},
  draw(G){bg(G.o.bg1||'#2a3f5a',G.o.bg2||'#141f2e');const ph=(G.t%G.per)/G.per,k=ph<.5?ph*2:2-ph*2,r=70+k*150;
    cx.beginPath();cx.arc(W/2,H/2,240,0,7);cx.strokeStyle='rgba(255,255,255,.12)';cx.lineWidth=2;cx.stroke();cx.beginPath();cx.arc(W/2,H/2,r,0,7);const g=cx.createRadialGradient(W/2,H/2,10,W/2,H/2,r);g.addColorStop(0,'rgba(159,224,216,.9)');g.addColorStop(1,'rgba(108,198,255,.25)');cx.fillStyle=g;cx.fill();
    cx.beginPath();cx.arc(W/2,H/2,r+6,0,7);cx.strokeStyle=G.ok?'#7ee0a3':'#ff7b6b';cx.lineWidth=5;cx.stroke();txt(G.inh?'Inspire…':'Expire…',W/2,H/2,48,'#fff');txt(G.ok?'Bien synchronisé':(G.inh?'Maintiens appuyé':'Relâche'),W/2,H/2+60,24,G.ok?'#7ee0a3':'#ffc15a',null,600);}};
/* ---------- 17. CODE : compléter le programme ---------- */
const CODE=[['function total(prix, qte) {','  return prix ___ qte;','}',['*','+','=>'],0],['const fruits = ["mangue", "coco"];','fruits.___("ananas");','',['push','pop','map'],0],['if (age ___ 18) {','  voter();','}',['>=','=>','=<'],0],['for (let i = 0; i ___ 10; i++) {','  log(i);','}',['<','=','>'],0],['<a ___="https://port-aurore.app">','  Accueil','</a>',['href','src','link'],0],['const user = await fetch(url).___();','','',['json','parse','text2'],0],['let prix = 100;','prix ___ 20; // 80','',['-=','=-','--'],0],['.bouton {','  color: ___;','}',['#ff7a59','ff7a59','rgb()'],0],['const pair = n ___ 2 === 0;','','',['%','/','//'],0],['users.___(u => u.actif)','','',['filter','find2','each'],0],['console.___("Bonjour");','','',['log','print','echo'],0],['<img ___="logo.png" alt="Logo">','','',['src','href','img'],0],['def bonjour(nom):','    ___ "Salut " + nom','',['return','yield2','give'],0],['SELECT * ___ clients','WHERE ville = "Lagune";','',['FROM','IN','OF'],0]];
DEF.code={name:'Code',icon:'💻',intro:'Choisis le bon morceau de code pour chaque ligne. Vite et juste !',help:['1 2 3 ou cliquer'],
  init(G,o){G.q=SH(CODE.slice()).slice(0,o.n||6).map(c=>{const a=SH(c[3].slice());return {l:[c[0],c[1],c[2]],a,c:a.indexOf(c[3][c[4]])};});G.i=0;G.ok=0;G.dur=o.dur||45;G.wait=0;G.ans=-1;},
  rect(i){return {x:W/2-450+i*305,y:420,w:290,h:80};},
  pick(G,i){if(G.wait>0)return;G.ans=i;G.wait=.8;if(i===G.q[G.i].c){G.ok++;sfx.ok();}else sfx.bad();},
  key(G,k){const m={'1':0,'2':1,'3':2};if(m[k]!=null)this.pick(G,m[k]);},tap(G,x,y){for(let i=0;i<3;i++)if(inB(this.rect(i),x,y))this.pick(G,i);},
  step(G,dt){if(G.wait>0){G.wait-=dt;if(G.wait<=0){G.i++;G.ans=-1;if(G.i>=G.q.length)end(CL(G.ok/G.q.length*(1-Math.max(0,G.t-G.dur*.6)/G.dur*.3),0,1));}}if(G.t>=G.dur&&G.phase==='play')end(G.ok/G.q.length*.8);G.label='Ligne '+Math.min(G.q.length,G.i+1)+'/'+G.q.length+' · '+G.ok+' juste'+(G.ok>1?'s':'')+' · '+Math.max(0,Math.ceil(G.dur-G.t))+' s';},
  draw(G){bg('#141a22','#0b0f15');const q=G.q[G.i];if(!q)return;rr(80,60,W-160,320,16);cx.fillStyle='#1d2430';cx.fill();['#ff5f57','#ffbd2e','#28c840'].forEach((c,i)=>{cx.beginPath();cx.arc(110+i*24,86,7,0,7);cx.fillStyle=c;cx.fill();});
    q.l.forEach((l,i)=>{if(!l)return;const s=l.replace('___',G.wait>0?q.a[q.c]:'▢▢▢');txt(String(i+1),120,150+i*56,22,'#4a5566','left',500,'ui-monospace, Menlo, monospace');txt(s,160,150+i*56,26,'#cfe3ff','left',500,'ui-monospace, Menlo, monospace');});
    q.a.forEach((a,i)=>{const r=this.rect(i);let c='rgba(255,255,255,.08)';if(G.wait>0){if(i===q.c)c='rgba(126,224,163,.8)';else if(i===G.ans)c='rgba(255,123,107,.8)';}rr(r.x,r.y,r.w,r.h,14);cx.fillStyle=c;cx.fill();cx.strokeStyle='rgba(255,255,255,.2)';cx.stroke();txt((i+1)+'   '+a,r.x+r.w/2,r.y+r.h/2,26,'#fff',null,600,'ui-monospace, Menlo, monospace');});}};
/* ---------- 18. VOLLEY / FOOT DE PLAGE ---------- */
DEF.volley={name:'Beach-volley',icon:'🏐',intro:'Place-toi sous le ballon (son ombre) et frappe au bon moment. Premier à 5 points.',help:['← → : se déplacer','Espace / clic : frapper'],repeat:true,
  init(G,o){G.px=240;G.me=0;G.op=0;G.to=o.to||5;this.serve(G,1);},
  serve(G,side){G.dec=null;G.bx=side>0?720:240;G.by=120;G.bvx=side>0?-R(220,300):R(220,300);G.bvy=-R(200,320);G.side=side;G.hitCd=0;G.wait=0;},
  step(G,dt){if(G.wait>0){G.wait-=dt;if(G.wait<=0){if(G.me>=G.to||G.op>=G.to){end(G.me>=G.to?CL(.6+.4*(1-G.op/G.to),0,1):G.me/G.to*.55);return;}this.serve(G,G.lastW>0?-1:1);}return;}
    let ax=(G.k.R?1:0)-(G.k.L?1:0);if(G.ptr.down)ax=CL((G.ptr.x-G.px)/40,-1,1);G.px=CL(G.px+ax*420*dt,80,440);G.hitCd-=dt;
    G.bvy+=520*dt;G.bx+=G.bvx*dt;G.by+=G.bvy*dt;if(G.bx<40||G.bx>W-40)G.bvx*=-1;
    if(G.bx<W/2)G.dec=null;if(G.bx>W/2&&G.bvx>0&&G.by>250&&G.bvy>0){if(G.dec==null)G.dec=Math.random()<CL(.8-.07*G.me-(G.o.diff||.5)*.15,.35,.9);if(G.dec){G.dec=null;G.bvx=-R(230,330);G.bvy=-R(380,470);tone(400,.05,'triangle',.06);}}
    if(G.by>460){this.pt(G,G.bx<W/2?-1:1);}
    G.label='Toi '+G.me+' · '+G.op+' Adversaires · premier à '+G.to;},
  pt(G,w){if(G.wait>0)return;if(w>0){G.me++;sfx.ok();pop('Point !',W/2,90,'#7ee0a3');}else{G.op++;sfx.bad();pop('Point adverse',W/2,90,'#ff7b6b');}G.lastW=w;G.wait=1.1;G.by=460;},
  hit(G){if(G.hitCd>0||G.wait>0)return;G.hitCd=.35;const d=Math.abs(G.bx-G.px);if(G.bx<W/2&&d<70&&G.by>300&&G.by<450){G.bvx=R(240,340)+(G.bx-G.px)*2;G.bvy=-R(380,480);sfx.ok();pop(G.by>390?'Manchette':'Smash !',G.px,300,'#ffd24a');}},
  key(G,k){if(k==='A'||k==='U')this.hit(G);},tap(G){this.hit(G);},
  draw(G){bg('#8fd8ff','#c9ecff');cx.fillStyle='#2fb8c9';cx.fillRect(0,180,W,40);cx.fillStyle='#f2dfa6';cx.fillRect(0,220,W,H);cx.fillStyle='#fff';cx.fillRect(W/2-3,260,6,220);cx.fillStyle='rgba(255,255,255,.7)';for(let y=260;y<330;y+=10)cx.fillRect(W/2-60,y,120,2);
    cx.beginPath();cx.ellipse(G.bx,470,20,6,0,0,7);cx.fillStyle='rgba(0,0,0,.2)';cx.fill();emo('🏐',G.bx,G.by,40);emo(G.o.me||'🏃',G.px,440,72);emo('🧍',720+Math.sin(G.t*2)*60,440,72);
    G.hb=btn(W-170,20,150,50,'Frapper',true,G.col);}};
/* ---------- 19. PRONOSTIC + MATCH EN DIRECT ---------- */
DEF.predict={name:'Pronostic',icon:'📺',intro:'Choisis ton score, puis suis le match. Appuie sur Espace pour encourager ton équipe pendant les temps forts !',help:['1–6 : choisir le score','Espace : encourager'],
  init(G,o){G.home=o.home||'Aurore FC';G.away=o.away||'Lagune United';G.opts=[[1,0],[2,1],[1,1],[0,0],[0,1],[1,2]];G.pick=null;G.min=0;G.sc=[0,0];G.ev=[];G.hype=0;G.cheer=0;},
  key(G,k){const n=parseInt(k,10);if(!G.pick&&n>=1&&n<=6)G.pick=G.opts[n-1];else if(G.pick&&k==='A'){G.hype=Math.min(1,G.hype+.12);G.cheer++;if(Math.random()<.3)tone(R(300,500),.06,'sawtooth',.03);}},
  tap(G,x,y){if(!G.pick){for(let i=0;i<6;i++){const b={x:120+(i%3)*250,y:200+Math.floor(i/3)*120,w:220,h:90};if(inB(b,x,y))G.pick=G.opts[i];}}else this.key(G,'A');},
  step(G,dt){if(!G.pick){G.label='Choisis ton pronostic';return;}const sp=4.2;const m0=Math.floor(G.min);G.min+=dt*sp;G.hype=Math.max(0,G.hype-dt*.25);
    if(Math.floor(G.min)!==m0&&G.min<=90){const p=.013*(1+G.hype*.8);if(Math.random()<p){G.sc[0]++;G.ev.unshift(Math.floor(G.min)+'′ BUT '+G.home+' ! '+G.sc[0]+'-'+G.sc[1]);sfx.ok();}else if(Math.random()<.012){G.sc[1]++;G.ev.unshift(Math.floor(G.min)+'′ but '+G.away+'… '+G.sc[0]+'-'+G.sc[1]);sfx.bad();}else if(Math.random()<.03)G.ev.unshift(Math.floor(G.min)+'′ '+PK(['Occasion franche !','Carton jaune.','Arrêt du gardien !','Corner.','Frappe sur le poteau !']));G.ev.length=Math.min(G.ev.length,6);}
    G.label=G.home+' '+G.sc[0]+' - '+G.sc[1]+' '+G.away+' · '+Math.min(90,Math.floor(G.min))+'′';
    if(G.min>=92){const ex=G.sc[0]===G.pick[0]&&G.sc[1]===G.pick[1],sg=Math.sign(G.sc[0]-G.sc[1])===Math.sign(G.pick[0]-G.pick[1]);G.resNote='Score final '+G.sc[0]+'-'+G.sc[1]+' · ton prono '+G.pick[0]+'-'+G.pick[1]+(ex?' : score exact !':sg?' : bon vainqueur.':'.');end(ex?1:sg?.62:.25+Math.min(.1,G.cheer/200));}},
  draw(G){bg('#1d2a3a','#0b1017');if(!G.pick){txt('Ton pronostic : '+G.home+' – '+G.away,W/2,120,34,'#fff');G.opts.forEach((s,i)=>btn(120+(i%3)*250,200+Math.floor(i/3)*120,220,90,(i+1)+' · '+s[0]+' - '+s[1],true,G.col));return;}
    rr(130,40,700,240,16);cx.fillStyle='#2e7d3a';cx.fill();cx.strokeStyle='#fff';cx.lineWidth=3;cx.strokeRect(150,55,660,210);cx.beginPath();cx.moveTo(480,55);cx.lineTo(480,265);cx.stroke();cx.beginPath();cx.arc(480,160,40,0,7);cx.stroke();
    const bx=480+Math.sin(G.t*1.3)*250,by=160+Math.cos(G.t*1.9)*80;emo('⚽',bx,by,26);for(let i=0;i<5;i++){emo('🔵',300+Math.sin(G.t+i)*120,90+i*40,18);emo('🔴',660+Math.cos(G.t+i)*120,90+i*40,18);}
    txt(G.home+'  '+G.sc[0]+' - '+G.sc[1]+'  '+G.away,W/2,310,36,'#fff');txt(Math.min(90,Math.floor(G.min))+'′',W/2,345,24,'#ffd24a');
    G.ev.forEach((e,i)=>txt(e,W/2,385+i*24,20,i?'rgba(233,239,246,.6)':'#fff','center',600));bar(60,500,W-120,14,G.hype,'#ffd24a');txt('Ambiance · Espace pour encourager',W/2,480,18,'rgba(255,255,255,.7)',null,600);}};
/* ---------- 20. ÉQUILIBRE (passerelle, paddle, ski nautique) ---------- */
DEF.balance={name:'Équilibre',icon:'🧘',intro:'Garde l’aiguille dans la zone verte en compensant à gauche et à droite.',help:['← → : compenser','Toucher à gauche / à droite'],repeat:true,
  init(G,o){G.a=0;G.v=0;G.dur=o.dur||25;G.ok=0;G.falls=0;G.fall=0;},
  step(G,dt){if(G.fall>0){G.fall-=dt;if(G.fall<=0){G.a=0;G.v=0;}return;}const d=(G.o.diff||.5);G.v+=(Math.sin(G.t*1.7)*.8+Math.sin(G.t*3.1+1)*.6+(Math.random()-.5)*2)*dt*(1.4+d)+G.a*dt*1.6;
    let ax=(G.k.R?1:0)-(G.k.L?1:0);if(G.ptr.down)ax=G.ptr.x<W/2?-1:1;G.v+=ax*dt*3.2;G.v*=Math.pow(.6,dt);G.a+=G.v*dt;if(Math.abs(G.a)<.35)G.ok+=dt;
    if(Math.abs(G.a)>1){G.falls++;G.fall=1;sfx.bad();pop(G.o.fallTxt||'Plouf !',W/2,120,'#ff7b6b');}G.label='Équilibre '+Math.round(G.ok/Math.max(.1,G.t)*100)+' % · chutes '+G.falls+' · '+Math.max(0,Math.ceil(G.dur-G.t))+' s';
    if(G.t>=G.dur)end(CL(G.ok/G.dur*1.15-G.falls*.12,0,1));},
  draw(G){const o=G.o;bg(o.bg1||'#8fd8ff',o.bg2||'#2fb8c9');if(o.bgk==='forest'){bg('#3f6b3a','#1f3a20');for(let i=0;i<10;i++)emo('🌳',i*100+40,H-40-(i%3)*30,100);}
    cx.save();cx.translate(W/2,360);cx.rotate(G.a*.6);if(o.bgk==='forest'){cx.fillStyle='#8a5a3a';cx.fillRect(-300,20,600,14);cx.strokeStyle='#ddd';cx.lineWidth=3;cx.beginPath();cx.moveTo(-300,-60);cx.lineTo(300,-60);cx.stroke();}else{cx.fillStyle='#fff';rr(-90,20,180,16,8);cx.fill();}
    emo(G.fall>0?'💦':(o.who||'🏄'),0,-30,110);cx.restore();
    const x0=W/2-300;rr(x0,470,600,26,13);cx.fillStyle='rgba(0,0,0,.25)';cx.fill();rr(W/2-105,470,210,26,13);cx.fillStyle='rgba(126,224,163,.8)';cx.fill();cx.fillStyle='#fff';cx.fillRect(W/2+CL(G.a,-1,1)*300-4,462,8,42);bar(W/2-200,20,400,10,G.t/G.dur,G.col);}};
/* ---------- 21. TIR : cibles ---------- */
DEF.tir={name:'Stand de tir',icon:'🎯',intro:'Touche les cibles avant qu’elles disparaissent. Évite les civils !',help:['Souris / flèches : viser','Clic / Espace : tirer'],repeat:true,
  init(G,o){G.cx=W/2;G.cy=H/2;G.tg=[];G.hit=0;G.miss=0;G.civ=0;G.sT=.5;G.dur=o.dur||25;G.spawned=0;},
  step(G,dt){const sp=420*dt;if(G.k.L)G.cx-=sp;if(G.k.R)G.cx+=sp;if(G.k.U)G.cy-=sp;if(G.k.D)G.cy+=sp;if(G.ptr.moved){G.cx=G.ptr.x;G.cy=G.ptr.y;G.ptr.moved=false;}
    G.sT-=dt;if(G.sT<=0){G.sT=R(.5,.9);const civ=Math.random()<.18;if(!civ)G.spawned++;G.tg.push({x:R(100,W-100),y:R(110,H-110),t:0,life:R(1.3,2)*(1.2-.4*(G.o.diff||.5)),civ});}
    G.tg.forEach(t=>t.t+=dt);G.tg=G.tg.filter(t=>t.t<t.life&&!t.dead);G.label='Touchées '+G.hit+'/'+G.spawned+(G.civ?' · erreurs '+G.civ:'')+' · '+Math.max(0,Math.ceil(G.dur-G.t))+' s';
    if(G.t>=G.dur)end(CL((G.hit-G.civ*2-G.miss*.2)/Math.max(5,G.spawned),0,1));},
  fire(G){tone(180,.06,'square',.06);let hit=null;G.tg.forEach(t=>{if(Math.hypot(t.x-G.cx,t.y-G.cy)<40)hit=t;});if(hit){hit.dead=1;if(hit.civ){G.civ++;pop('Civil !',hit.x,hit.y-50,'#ff7b6b');sfx.bad();}else{G.hit++;pop('Touché',hit.x,hit.y-50,'#7ee0a3');}}else G.miss++;},
  key(G,k){if(k==='A')this.fire(G);},tap(G,x,y){G.cx=x;G.cy=y;this.fire(G);},
  draw(G){bg('#3a4048','#1f2328');for(let i=0;i<6;i++){cx.fillStyle='rgba(255,255,255,.04)';cx.fillRect(0,80+i*80,W,40);}
    G.tg.forEach(t=>{const k=Math.min(1,t.t*6,(t.life-t.t)*6);cx.save();cx.translate(t.x,t.y);cx.scale(1,k);if(t.civ)emo('🧑‍💼',0,0,70);else{[36,26,16,7].forEach((r,i)=>{cx.beginPath();cx.arc(0,0,r,0,7);cx.fillStyle=i%2?'#fff':'#e0523e';cx.fill();});}cx.restore();});
    cx.strokeStyle='#7ee0a3';cx.lineWidth=3;cx.beginPath();cx.arc(G.cx,G.cy,28,0,7);cx.moveTo(G.cx-44,G.cy);cx.lineTo(G.cx+44,G.cy);cx.moveTo(G.cx,G.cy-44);cx.lineTo(G.cx,G.cy+44);cx.stroke();bar(W/2-200,20,400,10,G.t/G.dur,G.col);}};
/* ---------- 22. CUISINE : remue dans le bon sens ---------- */
DEF.stir={name:'Cuisson',icon:'🍲',intro:'Fais tourner la cuillère en rond (souris/doigt ou flèches dans l’ordre ↑ → ↓ ←) pour garder la cuisson dans la zone idéale.',help:['Tourner avec la souris ou ↑ → ↓ ←'],repeat:true,
  init(G,o){G.heat=.5;G.ang=0;G.la=null;G.ok=0;G.dur=o.dur||18;G.seq=['U','R','D','L'];G.si=0;},
  key(G,k){if(k===G.seq[G.si]){G.si=(G.si+1)%4;G.ang+=Math.PI/2;G.heat=Math.max(0,G.heat-.035);}},
  drag(G,x,y){const a=Math.atan2(y-300,x-W/2);if(G.la!=null){let d=a-G.la;if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;G.ang+=Math.abs(d);G.heat=Math.max(0,G.heat-Math.abs(d)*.022);}G.la=a;},
  release(G){G.la=null;},
  step(G,dt){G.heat=CL(G.heat+dt*(.09+.05*(G.o.diff||.5))*(1+Math.sin(G.t*.8)*.4),0,1);const ok=G.heat>.3&&G.heat<.7;if(ok)G.ok+=dt;if(G.heat>=1){pop('Ça brûle !',W/2,80,'#ff7b6b');G.heat=.75;G.ok=Math.max(0,G.ok-1.5);sfx.bad();}
    G.label='Cuisson idéale '+Math.round(G.ok/Math.max(.1,G.t)*100)+' % · '+Math.max(0,Math.ceil(G.dur-G.t))+' s';if(G.t>=G.dur)end(CL(G.ok/G.dur*1.15,0,1));},
  draw(G){bg('#5a2a1a','#24110a');cx.beginPath();cx.ellipse(W/2,320,230,120,0,0,7);cx.fillStyle='#333';cx.fill();cx.beginPath();cx.ellipse(W/2,305,200,98,0,0,7);cx.fillStyle=G.o.pot||'#c0632a';cx.fill();
    for(let i=0;i<8;i++){const a=G.t*2+i;emo(PK2(G.o.items||['🧅','🍅','🌶️','🥕'],i),W/2+Math.cos(a+i)*120,305+Math.sin(a+i)*50,30);}
    cx.save();cx.translate(W/2+Math.cos(G.ang)*90,300+Math.sin(G.ang)*40);cx.rotate(-.6);cx.fillStyle='#b98a5a';cx.fillRect(-6,-150,12,150);cx.beginPath();cx.ellipse(0,0,20,12,0,0,7);cx.fill();cx.restore();
    if(G.heat>.6)for(let i=0;i<5;i++)emo('💨',W/2-120+i*60,170-((G.t*60+i*30)%60),30);
    const x0=W/2-280;rr(x0,470,560,24,12);const g=cx.createLinearGradient(x0,0,x0+560,0);g.addColorStop(0,'#6cc6ff');g.addColorStop(.5,'#7ee0a3');g.addColorStop(1,'#ff5f57');cx.fillStyle=g;cx.fill();
    cx.strokeStyle='#fff';cx.lineWidth=2;cx.strokeRect(x0+.3*560,470,.4*560,24);cx.fillStyle='#fff';cx.fillRect(x0+G.heat*560-4,460,8,44);txt('Feu',x0-30,482,20,'#fff');}};
return {play,act,chain,actChain,pay:payMG,DEF,best:BEST,end:(s)=>end(s),_util:{W,H,CL,R,bg,txt,emo,sfx,pop,get cx(){return cx;}},get active(){return !!G;},get _g(){return G;},_sim(sec,fn){let i=0;for(let t=0;t<sec&&G&&(G.phase==='count'||G.phase==='play');t+=1/60){G.noDraw=(i++%30)!==0;tick(1/60);if(fn&&G)fn(G,t);}if(G)G.noDraw=false;return G&&G.phase;}};
})();
window.MG29=MG29;
