'use strict';
/* v42 · coupures de courant rares et courtes + réglage dans le menu pause (Désactivées / Rares / Normales). */
(function(){
const C=window.CUTS42={mode:'rare'};try{const m=localStorage.getItem('pa-cuts42');if(m==='off'||m==='rare'||m==='freq')C.mode=m;}catch(e){}
window.nextCut42=()=>C.mode==='freq'?rand(700,1100):rand(1500,2700);
cutCd=nextCut42();
const N={off:'désactivées',rare:'rares',freq:'normales'};
const _rp=renderPause;renderPause=function(){_rp();try{const box=$('#pz-btns');if(!box)return;const b=document.createElement('button');b.textContent='Coupures de courant : '+N[C.mode];
 b.onclick=()=>{C.mode=C.mode==='rare'?'off':C.mode==='off'?'freq':'rare';try{localStorage.setItem('pa-cuts42',C.mode);}catch(e){}if(C.mode==='off'&&blackout>0)blackout=0.01;cutCd=nextCut42();renderPause();};
 const ref=[...box.children].find(x=>/Quitter/.test(x.textContent));box.insertBefore(b,ref||null);}catch(e){}};
})();
