'use strict';
/* ---------- v19 : sons moteur propres à chaque modèle (voiture du joueur) ----------
   f = régime au ralenti (Hz), k = montée avec la vitesse, w = timbre, cut = coupure du filtre,
   cyl = nombre de cylindres (cadence des pulsations), burble = grondement, sub = corps grave */
const ENG19={
  sedan:{f:44,k:3.4,w:'triangle',cut:360,cyl:4,burble:.12,sub:.2},
  suv:{f:40,k:3.0,w:'sawtooth',cut:420,cyl:6,burble:.3,sub:.35},
  sport:{f:58,k:5.8,w:'sawtooth',cut:820,cyl:6,burble:.4,sub:.4},
  danfo:{f:34,k:2.4,w:'square',cut:260,cyl:6,burble:.7,sub:.6},
  taxi:{f:44,k:3.4,w:'triangle',cut:360,cyl:4,burble:.12,sub:.2},
  benz:{f:48,k:3.4,w:'sawtooth',cut:420,cyl:6,burble:.15,sub:.3},
  lambo:{f:62,k:6.2,w:'sawtooth',cut:900,cyl:10,burble:.45,sub:.5},
  ford:{f:46,k:4.5,w:'square',cut:600,cyl:8,burble:.8,sub:.6},
  toyota:{f:40,k:3.0,w:'triangle',cut:300,cyl:4,burble:.1,sub:.1},
  ferrari:{f:66,k:6.8,w:'sawtooth',cut:1100,cyl:12,burble:.35,sub:.4},
  porsche:{f:54,k:5.2,w:'sawtooth',cut:800,cyl:6,burble:.5,sub:.4},
  bmw:{f:52,k:4.2,w:'sawtooth',cut:620,cyl:6,burble:.2,sub:.3},
  honda:{f:44,k:3.8,w:'triangle',cut:360,cyl:4,burble:.1,sub:.1},
  jeep:{f:36,k:2.6,w:'square',cut:380,cyl:6,burble:.6,sub:.5},
  hyundai:{f:42,k:3.2,w:'triangle',cut:340,cyl:4,burble:.12,sub:.1},
  motorcycle:{f:70,k:8,w:'sawtooth',cut:900,cyl:2,burble:.9,sub:.2},
  scooter:{f:80,k:7,w:'square',cut:700,cyl:1,burble:.5,sub:.1},
  bus:{f:32,k:2.2,w:'square',cut:240,cyl:6,burble:.8,sub:.7},
  truck:{f:32,k:2.2,w:'square',cut:240,cyl:6,burble:.8,sub:.7},
  police:{f:44,k:4.4,w:'sawtooth',cut:700,cyl:8,burble:.5,sub:.5},
  ambulance:{f:40,k:3.8,w:'sawtooth',cut:520,cyl:6,burble:.4,sub:.4},
  firetruck:{f:34,k:2.4,w:'square',cut:260,cyl:8,burble:.8,sub:.7}
};
const eng19P=t=>ENG19[t]||ENG19.sedan;
let e19={sub:null,subG:null,bur:null,burLp:null,burG:null,lfo:null,lfoG:null};
const _startAudio19=startAudio;
startAudio=function(){
  _startAudio19();
  if(!actx||!engGain)return;
  try{
    e19.sub=actx.createOscillator();e19.sub.type='sine';e19.subG=actx.createGain();e19.subG.gain.value=0;
    e19.sub.connect(e19.subG);e19.subG.connect(engGain);e19.sub.start();
    e19.bur=actx.createOscillator();e19.bur.type='square';e19.burLp=actx.createBiquadFilter();e19.burLp.type='lowpass';e19.burLp.frequency.value=400;
    e19.burG=actx.createGain();e19.burG.gain.value=.5;
    e19.bur.connect(e19.burLp);e19.burLp.connect(e19.burG);e19.burG.connect(engGain);e19.bur.start();
    e19.lfo=actx.createOscillator();e19.lfo.type='sine';e19.lfoG=actx.createGain();e19.lfoG.gain.value=0;
    e19.lfo.connect(e19.lfoG);e19.lfoG.connect(e19.burG.gain);e19.lfo.start();
  }catch(e){}
};
/* appelé à chaque image : règle le son selon la voiture conduite */
function engineUpdate19(){
  const c=player.car,p=eng19P(c?c.type:'sedan'),sp=c?Math.abs(c.v):0,t=actx.currentTime;
  const target=c?Math.min(1,0.25+sp/20)*0.05*(muted?0:1):0;
  engGain.gain.setTargetAtTime(target,t,0.08);
  const hz=p.f+sp*p.k;
  engOsc.type=p.w;engOsc.frequency.setTargetAtTime(hz,t,0.08);
  if(engLp)engLp.frequency.setTargetAtTime(p.cut+sp*30,t,0.1);
  if(e19.sub){e19.sub.frequency.setTargetAtTime(hz*.5,t,0.08);e19.subG.gain.setTargetAtTime(p.sub*.6,t,0.1);}
  if(e19.bur){e19.bur.frequency.setTargetAtTime(hz*2,t,0.08);e19.burLp.frequency.setTargetAtTime(p.cut,t,0.1);
    e19.lfo.frequency.setTargetAtTime(Math.max(2,hz*p.cyl/8),t,0.08);e19.lfoG.gain.setTargetAtTime(p.burble*.5,t,0.1);}
}
