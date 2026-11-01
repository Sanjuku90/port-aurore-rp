'use strict';
function startAudio(){
  try{
    actx=new (window.AudioContext||window.webkitAudioContext)();
    engOsc=actx.createOscillator();engOsc.type='sawtooth';engGain=actx.createGain();engGain.gain.value=0;
    const lp=actx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=360;
    engOsc.connect(lp);lp.connect(engGain);engGain.connect(actx.destination);engOsc.start();
    const nb=actx.createBuffer(1,actx.sampleRate*2,actx.sampleRate),nd=nb.getChannelData(0);let q=0;for(let i=0;i<nd.length;i++){q=(q+0.02*(Math.random()*2-1))/1.02;nd[i]=q*3.5;}
    const src=actx.createBufferSource();src.buffer=nb;src.loop=true;ambLp=actx.createBiquadFilter();ambLp.type='lowpass';ambLp.frequency.value=500;ambGain=actx.createGain();ambGain.gain.value=0;src.connect(ambLp);ambLp.connect(ambGain);ambGain.connect(actx.destination);src.start();
  }catch(e){engGain=null;}
}
