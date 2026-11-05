'use strict';
/* v50 · Le monde vivant : alertes locales, missions citoyennes et conséquences durables. */
(function(){
const KEY='port-aurore-world50',MARK='world50:active';
const blank=()=>({active:null,nextAt:Math.floor(gameMin+100),vitality:{port:50,nouvelle:50,solenne:50},history:[],completed:0,missed:0});
let W=blank();
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&typeof saved==='object')W=Object.assign(blank(),saved);}catch(e){}
W.vitality=Object.assign({port:50,nouvelle:50,solenne:50},W.vitality||{});
W.history=Array.isArray(W.history)?W.history.slice(0,12):[];
if(!Number.isFinite(W.nextAt))W.nextAt=Math.floor(gameMin+100);
const clamp50=(n,a,b)=>Math.max(a,Math.min(b,n));
const CITIES=[
 {id:'port',name:'Port-Aurore',test:s=>s.x>-1500&&s.x<1800,fallback:()=>({x:-30,z:210})},
 {id:'nouvelle',name:'Nouvelle-Aurore',test:s=>s.x>=-2800&&s.x<=-1550,fallback:()=>{const c=window.NATION40&&NATION40.thirdCity||{x:-2150,z:0};return{x:c.x-70,z:c.z-61};}},
 {id:'solenne',name:'Solenne',test:s=>s.x<-6500&&s.x>-10000,fallback:()=>({x:SOL27.x-60,z:-95})}
];
const EVENTS=[
 {id:'supply',icon:'📦',title:'Ravitaillement urgent',desc:'Un commerce local manque de produits essentiels. Un coup de main remet les livraisons en route.',reward:58,rep:2,fun:3,impact:7,track:'commerce'},
 {id:'cleanup',icon:'♻️',title:'Opération quartier propre',desc:'Les habitants se mobilisent pour remettre une place en état avant le prochain marché.',reward:42,rep:2,fun:8,impact:6,track:'cadre de vie'},
 {id:'repair',icon:'🛠️',title:'Panne d’infrastructure',desc:'Une installation de quartier est à l’arrêt. L’équipe locale a besoin d’un renfort sur place.',reward:72,rep:3,fun:0,impact:8,track:'services'},
 {id:'culture',icon:'🎭',title:'Scène ouverte improvisée',desc:'Des artistes montent un spectacle de dernière minute. Aide à lancer la soirée et fais vivre le quartier.',reward:35,rep:2,fun:18,impact:6,track:'culture'}
];
function save(){try{localStorage.setItem(KEY,JSON.stringify(W));}catch(e){}}
const cityById=id=>CITIES.find(c=>c.id===id)||CITIES[0];
function pointFor(city){
 const pool=(spots||[]).filter(s=>s&&s.id&&s.id!==MARK&&!s.int&&!/^life41:(events|pets|contracts|housing)/.test(String(s.id))&&city.test(s));
 if(pool.length){const s=pick(pool);return{x:s.x+rand(5,9),z:s.z+rand(-6,6)};}
 return city.fallback();
}
function removeMarker(){
 const L=(spots||[]).filter(s=>s&&s.id===MARK);
 L.forEach(s=>{const i=spots.indexOf(s);if(i>=0)spots.splice(i,1);[s.b,s.ring].forEach(o=>{if(!o)return;scene.remove(o);if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose();}});});
}
function ensureMarker(){
 const e=W.active;if(!e||typeof scene==='undefined')return;
 const old=(spots||[]).find(s=>s.id===MARK);
 if(old&&Math.hypot(old.x-e.x,old.z-e.z)<.1)return;
 removeMarker();addSpot(e.x,e.z,MARK,0xff6b58,e.icon+' '+e.title);
 const s=spots[spots.length-1];if(s.b){s.b.scale.set(1.25,1,1.25);s.b.position.y=4.8;}if(s.ring){s.ring.scale.set(1.25,1,1.25);}
}
function vitality(id){return clamp50(Number(W.vitality[id])||50,0,100);}
function selectCity(){
 const low=Math.min(...CITIES.map(c=>vitality(c.id))),pool=CITIES.filter(c=>vitality(c.id)<=low+12);
 return pick(pool.length?pool:CITIES);
}
function notifyEvent(e){
 const c=cityById(e.city);
 toast('Alerte à '+c.name+' : '+e.title+'. Consulte Aurore Life.','warn');
 if(window.PH49&&PH49.notify)PH49.notify({app:'life',title:e.icon+' '+e.title,text:c.name+' · '+e.desc,actions:[['Répondre',()=>accept()]]});
}
function spawn(){
 const c=selectCity(),kind=pick(EVENTS),p=pointFor(c);
 W.active={id:kind.id,icon:kind.icon,title:kind.title,desc:kind.desc,reward:kind.reward,rep:kind.rep,fun:kind.fun,impact:kind.impact,track:kind.track,city:c.id,x:p.x,z:p.z,at:Math.floor(gameMin),endAt:Math.floor(gameMin+300),accepted:false};
 W.nextAt=0;ensureMarker();save();if(started)notifyEvent(W.active);
}
function record(e,result){
 const c=cityById(e.city),score=vitality(e.city);
 W.history.unshift({title:e.title,city:c.name,result,at:Math.floor(gameMin),track:e.track});W.history=W.history.slice(0,12);
}
function finish(){
 const e=W.active;if(!e)return;
 if(Math.hypot(player.x-e.x,player.z-e.z)>6){toast('Rapproche-toi du point d’intervention.','warn');return;}
 const before=vitality(e.city),bonus=Math.floor(before/20)*4,pay=e.reward+bonus;
 state.cash+=pay;state.earned=(state.earned||0)+pay;state.rep+=e.rep;state.fun=clamp50(state.fun+e.fun,0,100);
 W.vitality[e.city]=clamp50(before+e.impact,0,100);W.completed=(W.completed||0)+1;
 record(e,'Résolue');W.active=null;W.nextAt=Math.floor(gameMin+rand(150,230));removeMarker();save();saveProgress();
 toast(e.title+' résolue à '+cName(e.city)+' · +'+fmt(pay)+' · vitalité locale '+before+' → '+W.vitality[e.city]+'/100.','good');
 if(window.PH49&&PH49.journal)PH49.journal('Intervention à '+cName(e.city)+' : '+e.title+' · +'+fmt(pay)+'.');
}
function cName(id){return cityById(id).name;}
function expire(){
 const e=W.active;if(!e)return;
 const before=vitality(e.city);W.vitality[e.city]=clamp50(before-5,0,100);W.missed=(W.missed||0)+1;
 record(e,'Manquée');W.active=null;W.nextAt=Math.floor(gameMin+rand(90,150));removeMarker();save();
 if(started)toast('L’alerte '+e.title+' est retombée sans renfort. '+cName(e.city)+' perd un peu de vitalité.','warn');
}
function accept(){
 const e=W.active;if(!e)return false;
 if(gameMin>=e.endAt){expire();toast('Cette alerte a expiré.','warn');return false;}
 e.accepted=true;save();
 if(window.PH49&&PH49.go)PH49.go(e.x,e.z,e.title+' · '+cName(e.city));else wp={x:e.x,z:e.z,l:e.title+' · '+cName(e.city)};
 toast('Intervention acceptée · suis le GPS jusqu’au repère rouge.','good');return true;
}
function eventPanel(){
 const e=W.active;if(!e)return;
 const c=cityById(e.city),left=Math.max(0,Math.ceil((e.endAt-gameMin)/60)),score=vitality(e.city);
 if(!e.accepted){openPanel(e.icon+' '+e.title,e.desc+' '+c.name+' · vitalité '+score+'/100 · alerte dans '+left+' min de jeu. Une intervention réussie améliore durablement le quartier et augmente les récompenses futures.',[
  {label:'Prendre en charge · '+fmt(e.reward)+' + bonus',fn:()=>accept()},
  {label:'Consulter le bulletin Aurore Life',fn:()=>{if(window.PH49)PH49.openApp('Aurore Life','news');}}
 ]);return;}
 openPanel('Intervention · '+c.name,e.desc+' Le point rouge est le lieu d’action. Réussir augmente la vitalité locale ('+score+'/100), ce qui améliore les futures récompenses.',[
  {label:'Terminer l’intervention · '+fmt(e.reward+Math.floor(score/20)*4),fn:finish},
  {label:'GPS · Reprendre l’itinéraire',fn:()=>{if(window.PH49)PH49.go(e.x,e.z,e.title+' · '+c.name);else wp={x:e.x,z:e.z,l:e.title};}}
 ]);
}
function cityPulse(){
 const parts=CITIES.map(c=>c.name+' '+vitality(c.id)+'/100');
 return W.active?W.active.icon+' '+W.active.title+' à '+cName(W.active.city)+' · '+Math.max(0,Math.ceil((W.active.endAt-gameMin)/60))+' min restantes.':
  'Prochaine alerte bientôt · vitalité locale : '+parts.join(' · ')+'.';
}
let tick50=0;
const _up50=update;update=function(dt){_up50(dt);if(!started)return;tick50+=dt;if(tick50<1)return;tick50=0;
 if(W.active){ensureMarker();if(gameMin>=W.active.endAt)expire();}
 else if(!W.nextAt||gameMin>=W.nextAt)spawn();};
const _bd50=buildDecor;buildDecor=function(){_bd50();try{ensureMarker();}catch(e){console.warn('world50 marker',e);}};
const _open50=openSpot;openSpot=function(id){if(id===MARK){eventPanel();return;}_open50(id);};
window.WORLD50={adjust(id,delta){if(!W.vitality||!(id in W.vitality))return;W.vitality[id]=clamp50((Number(W.vitality[id])||50)+Number(delta||0),0,100);save();},get active(){return W.active;},get completed(){return W.completed||0;},get missed(){return W.missed||0;},vitality,accept,forecast:cityPulse,history:()=>W.history.slice(),navigate:()=>{if(W.active)return accept();}};
})();
