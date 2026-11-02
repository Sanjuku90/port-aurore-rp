'use strict';
/* v43 · saisons tropicales, routines domestiques, mémoire des habitants et petites courses. */
(function(){
const KEY='port-aurore-life43';
const blank=()=>({hygiene:82,clothes:78,washUntil:0,lastDay:Math.floor(gameMin/1440),memories:{},requests:{},job:null});
let D=blank();try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&typeof s==='object')D=Object.assign(blank(),s);}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(D));}catch(e){}};
const clamp43=(v,a,b)=>Math.max(a,Math.min(b,v));
const SEASONS=[['Saison sèche','Poussière dorée et soirées chaudes',0xd9a74a],['Harmattan','Brume chaude venue du nord',0xc8ae8b],['Saison des pluies','Averses et air frais',0x75a9d2],['Saison des fêtes','Fleurs, musique et lumières',0xe78eb0]];
const day=()=>Math.floor(gameMin/1440),season=()=>Math.floor(day()/7)%4;
const fx={points:null,geo:null,mat:null,seed:0,ui:null,uiT:0};
function buildFx(){
 const N=74,a=new Float32Array(N*3);for(let i=0;i<N;i++){a[i*3]=(Math.random()-.5)*34;a[i*3+1]=Math.random()*15;a[i*3+2]=(Math.random()-.5)*34;}
 fx.geo=new THREE.BufferGeometry();fx.geo.setAttribute('position',new THREE.BufferAttribute(a,3));fx.mat=new THREE.PointsMaterial({color:SEASONS[0][2],size:.11,transparent:true,opacity:.55,depthWrite:false});fx.points=new THREE.Points(fx.geo,fx.mat);fx.points.frustumCulled=false;fx.points.visible=false;scene.add(fx.points);
 fx.ui=document.createElement('div');fx.ui.id='life43-card';fx.ui.innerHTML='<b></b><span></span>';document.body.appendChild(fx.ui);
 const st=document.createElement('style');st.textContent='#life43-card{position:fixed;left:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);z-index:8;pointer-events:none;padding:8px 11px;border-radius:12px;background:rgba(18,24,34,.78);color:#fff;font:600 12px Barlow,Arial,sans-serif;backdrop-filter:blur(8px);box-shadow:0 4px 18px #0004;max-width:min(245px,55vw)}#life43-card b,#life43-card span{display:block}#life43-card span{opacity:.78;font-weight:400;margin-top:2px}';document.head.appendChild(st);
}
function status(){if(!fx.ui)return;const s=SEASONS[season()];fx.ui.querySelector('b').textContent='🌤 '+s[0]+' · jour '+(day()%28+1);let t='Hygiène '+Math.round(D.hygiene)+'% · vêtements '+Math.round(D.clothes)+'%';if(D.washUntil)t+=' · lessive en cours';if(D.job)t+=' · course: '+D.job.title+' ('+Math.max(0,Math.ceil(D.job.deadline-gameMin))+' min)';fx.ui.querySelector('span').textContent=t;fx.mat.color.setHex(s[2]);}
function homeRoutine(){
 const R=ROOMS&&ROOMS.home;if(!R||!R.ints)return;
 if(!R.ints.some(i=>i.label==='Lessive · hygiène'))R.int(7.25,-3.5,'Lessive · hygiène',laundry,{r:1.5});
 if(!R.ints.some(i=>i.label==='Routine salle de bain'))R.int(-.55,-2.35,'Routine salle de bain',routine,{r:1.5});
}
function routine(){openPanel('Routine salle de bain','Hygiène actuelle : '+Math.round(D.hygiene)+'%. Prends une douche ou brosse-toi les dents pour garder la forme.',[
 {label:'Prendre une douche · 8 min',fn:()=>{gameMin+=8;D.hygiene=100;state.fun=Math.min(100,state.fun+3);save();toast('Douche terminée. Tu es frais !','good');}},
 {label:'Se brosser les dents · 3 min',fn:()=>{gameMin+=3;D.hygiene=Math.min(100,D.hygiene+18);state.health=Math.min(100,state.health+1);save();toast('Dents propres.','good');}}
 ]);}
function laundry(){if(D.washUntil>gameMin){openPanel('Buanderie','La machine tourne encore. Fin dans environ '+Math.ceil(D.washUntil-gameMin)+' minutes de jeu.',[{label:'Annuler le cycle',fn:()=>{D.washUntil=0;save();toast('Cycle interrompu.','warn');}}]);return;}
 openPanel('Buanderie','État des vêtements : '+Math.round(D.clothes)+'%. Lance une lessive quand ils sont sales.',[
 {label:'Lancer une lessive · $4 · 45 min',off:state.cash<4||D.clothes>95,fn:()=>{state.cash-=4;D.washUntil=gameMin+45;save();toast('Lessive lancée. Reviens dans 45 minutes de jeu.','good');}},
 {label:'Étendre le linge · gratuit',off:D.clothes<90,fn:()=>{D.clothes=100;save();toast('Le linge est propre et sec.','good');}}
 ]);}
function conversation(p){
 const n=p.name||'Habitant';const h=D.memories[n]||{score:0,lines:[],lastDay:-1};D.memories[n]=h;
 p.h=Math.atan2(player.x-p.x,player.z-p.z);p.wait=5;
 const lines=['Le marché du port est plus calme le matin.','La route près du stade est embouteillée avant les matchs.','J’ai vu un concert annoncé sur la plage cette semaine.','Le quartier a besoin de bras pour quelques livraisons.','La météo change vite sur la côte, prends une veste.'];
 const opts=[
  {label:'Parler du quartier',fn:()=>{const line=lines[(day()+n.length+h.lines.length)%lines.length];h.lines.push(line);h.lines=h.lines.slice(-5);h.score++;say(p.mesh,line,5);addChat(n,line);save();toast(n+' se souviendra de cette conversation.','good');}},
  {label:'Demander comment ça va',fn:()=>{const line=h.lines.length?'Tu m’avais parlé de « '+h.lines[h.lines.length-1]+' »… ça avance ?':'Ça va, merci de demander ! On ne prend pas assez le temps de se parler.';h.score++;say(p.mesh,line,5);addChat(n,line);save();}},
  {label:'Proposer un coup de main',off:!!D.job||h.lastDay===day(),fn:()=>offerRequest(p,h)},
  {label:'Inviter à danser',off:!state.friends.includes(n),fn:()=>{state.fun=Math.min(100,state.fun+7);h.score++;say(p.mesh,'Avec plaisir, ça va nous changer les idées !',4);save();toast('Vous partagez une danse.','good');}}
 ];
 openPanel(n,'Relation : '+(state.friends.includes(n)?'ami':'connaissance')+' · souvenirs partagés : '+h.lines.length+'.',opts);
}
function offerRequest(p,h){
 const local=(spots||[]).filter(n=>Math.hypot(n.x-player.x,n.z-player.z)>35&&Math.hypot(n.x-player.x,n.z-player.z)<170);const roads=(NODES||[]).filter(n=>Math.hypot(n.x-player.x,n.z-player.z)>40&&Math.hypot(n.x-player.x,n.z-player.z)<150);const pool=local.length?local:roads;if(!pool.length){toast('Aucune course disponible dans ce quartier.','warn');return;}
 const dst=pool[Math.floor(Math.random()*pool.length)],reward=25+Math.floor(Math.random()*26),title='Courses pour '+(p.name||'un habitant');D.job={title,reward,deadline:gameMin+360,x:dst.x,z:dst.z,name:p.name||'Habitant'};h.lastDay=day();wp={x:dst.x,z:dst.z,l:title};save();toast((p.name||'Un habitant')+' te confie une petite course. Suis le GPS !','good');
}
function finishRequest(){const j=D.job;if(!j||Math.hypot(player.x-j.x,player.z-j.z)>6)return false;state.cash+=j.reward;state.earned=(state.earned||0)+j.reward;state.done=(state.done||0)+1;state.rep=(state.rep||0)+1;const h=D.memories[j.name];if(h)h.score++;D.job=null;wp=null;save();saveProgress();toast('Course terminée · +'+fmt(j.reward),'good');return true;}
function tick43(dt){
 const d=day(),elapsed=Math.max(0,d-(D.lastDay==null?d:D.lastDay));if(elapsed){D.hygiene=Math.max(0,D.hygiene-elapsed*12);D.clothes=Math.max(0,D.clothes-elapsed*9);D.lastDay=d;save();}
 if(D.washUntil&&gameMin>=D.washUntil){D.washUntil=0;D.clothes=100;save();toast('Lessive terminée. Tes vêtements sont propres !','good');}
 if(D.job&&gameMin>=D.job.deadline){toast('La course de '+D.job.name+' a expiré.','warn');D.job=null;wp=null;save();}
 if(fx.points&&started){fx.points.visible=!player.inside&&season()!==2;fx.points.position.set(camera.position.x,camera.position.y-2,camera.position.z);const a=fx.geo.attributes.position.array,s=season();for(let i=0;i<a.length;i+=3){a[i+1]-=dt*(s===2?2:0.45);a[i]+=Math.sin(performance.now()*.0004+i)*dt*.12;if(a[i+1]<-2){a[i+1]=12+Math.random()*5;a[i]=(Math.random()-.5)*34;a[i+2]=(Math.random()-.5)*34;}}fx.geo.attributes.position.needsUpdate=true;}
 fx.uiT-=dt;if(fx.uiT<=0){fx.uiT=.5;status();}
}
const _bd=buildDecor;buildDecor=function(){_bd();try{buildFx();homeRoutine();}catch(e){console.warn('life43 build',e);}};
const _up=update;update=function(dt){_up(dt);try{tick43(dt);}catch(e){console.warn('life43 update',e);}};
const _bf=befriend;befriend=function(p){conversation(p);};
const _ip=interact;interact=function(){if(D.job&&finishRequest())return;_ip();};
const _reset=resetProgress;resetProgress=function(){try{localStorage.removeItem(KEY);}catch(e){}D=blank();_reset();};
const _pr=updatePrompt;updatePrompt=function(){_pr();if(!D.job||!started||panelOpen||chatOpen)return;if(Math.hypot(player.x-D.job.x,player.z-D.job.z)<6){const el=document.querySelector('#prompt');if(el){el.hidden=false;el.textContent='E · Terminer la course pour '+D.job.name;}}};
window.LIFE43={get season(){return SEASONS[season()][0];},get hygiene(){return D.hygiene;},get clothes(){return D.clothes;},get request(){return D.job;}};
})();
