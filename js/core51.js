'use strict';
/* v51 · outils partagés : repères ancrés, GPS, paiements, sauvegardes et routage des interactions. */
(function(){
const C51=window.C51={};
const NA=-2150,SX=SOL27.x;
/* Coordonnées de secours si un repère n'est pas encore construit (quartiers streamés). */
const FALLBACK={
  job:{x:0,z:-5.5},shop:{x:64,z:-1.5},bank:{x:-64,z:-.5},home:{x:-64,z:63.5},club:{x:64,z:63.5},hospital:{x:0,z:125.5},
  mairie17:{x:-240,z:-120},race17:{x:240,z:150},'life41:events':{x:-30,z:210},
  'nat40:president':{x:NA-260,z:-237},'nat40:bank':{x:NA+120,z:-60.5},'nat40:industry':{x:NA+310,z:121},'nat40:port':{x:NA+120,z:120},
  'nat40:president:main':{x:360,z:141},'nat40:president:sol':{x:SX+18,z:227.5},'life41:pets:sol':{x:SX+360,z:230},'life41:events:sol':{x:SX-60,z:-95}
};
C51.day=()=>Math.floor(gameMin/1440);
C51.hour=()=>Math.floor(gameMin/60);
C51.load=(key,blank)=>{let v=blank();try{const o=JSON.parse(localStorage.getItem(key)||'null');if(o&&typeof o==='object')v=Object.assign(blank(),o);}catch(e){}return v;};
C51.store=(key,v)=>{try{localStorage.setItem(key,JSON.stringify(v));}catch(e){}};
C51.spot=id=>spots.find(s=>s&&s.id===id)||null;
function raw(id){
  if(typeof id==='string'&&id.startsWith('met:')){const b=window.MET46&&MET46.byKey&&MET46.byKey.get(id.slice(4));return b&&b.door?{x:b.door.x,z:b.door.z}:null;}
  const s=C51.spot(id);return s?{x:s.x,z:s.z}:(FALLBACK[id]||null);
}
C51.anchor=(id,dx=0,dz=0,alt)=>{const p=raw(id)||(alt?raw(alt):null)||{x:0,z:18};return {x:p.x+dx,z:p.z+dz};};
C51.where=x=>x<-6500?'solenne':x<-1550?'nouvelle':'port';
C51.cityName=id=>({port:'Port-Aurore',nouvelle:'Nouvelle-Aurore',solenne:'Solenne'})[id]||'Port-Aurore';
C51.afford=c=>state.cash+state.bank>=c;
C51.pay=(c,label)=>{c=Math.round(c);if(!c)return true;if(!C51.afford(c)){toast('Fonds insuffisants · '+fmt(c)+' nécessaires.','warn');return false;}takeMoney(c);if(typeof econTxP58==='function')econTxP58(label||'Paiement',-c,'Cash / Banque');saveProgress();return true;};
C51.earn=(c,label,toBank)=>{c=Math.round(c);if(!(c>0))return;if(toBank)state.bank+=c;else state.cash+=c;state.earned=(state.earned||0)+c;if(typeof econTxP58==='function')econTxP58(label||'Revenu',c,toBank?'Banque':'Cash');saveProgress();};
C51.rep=n=>{state.rep=Math.max(0,(state.rep||0)+n);};
C51.mood=n=>{state.fun=clamp((state.fun||0)+n,0,100);};
C51.gps=(x,z,l)=>{if(window.PH49&&PH49.go)PH49.go(x,z,l);else{wp={x,z,l};toast('GPS · '+l,'good');}};
C51.notify=(title,text,actions)=>{if(window.PH49&&PH49.notify)PH49.notify({app:'life',title,text,actions});else toast(title+' · '+text,'good');};
C51.journal=t=>{if(window.PH49&&PH49.journal)PH49.journal(t);};
C51.near=(p,r=7)=>!player.inside&&Math.hypot(player.x-p.x,player.z-p.z)<r;
const rels=()=>(typeof P3!=='undefined'&&P3&&P3.rel)?P3.rel:null;
C51.rel=n=>{const r=rels();return r&&r[n]!=null?r[n]:20;};
C51.bump=(n,v)=>{const r=rels();if(r)r[n]=clamp(C51.rel(n)+v,0,100);};
/* Repères dynamiques */
function dispose(s){[s.b,s.ring].forEach(o=>{if(!o)return;scene.remove(o);if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});}
C51.unmark=id=>{spots.filter(s=>s&&s.id===id).forEach(s=>{const i=spots.indexOf(s);if(i>=0)spots.splice(i,1);dispose(s);});};
C51.mark=(id,p,color,label,scale)=>{const s0=C51.spot(id);if(s0&&Math.hypot(s0.x-p.x,s0.z-p.z)<.1&&s0.label===label)return s0;C51.unmark(id);addSpot(p.x,p.z,id,color,label);const s=spots[spots.length-1];if(scale&&s.b){s.b.scale.set(scale,1,scale);if(s.ring)s.ring.scale.set(scale,1,scale);}return s;};
/* Interactions et horloge partagée */
const handlers={};C51.handle=(id,fn)=>{handlers[id]=fn;};
const _open=openSpot;openSpot=function(id){const h=handlers[id];if(h){try{h(id);}catch(e){console.warn('v51 spot',id,e);}return;}_open(id);};
const ready=[],tickers=[];let isReady=false;
C51.onReady=fn=>{if(isReady){try{fn();}catch(e){console.warn('v51 ready',e);}}else ready.push(fn);};
C51.every=(sec,fn)=>tickers.push({sec,fn,t:sec});
const _up=update;update=function(dt){_up(dt);if(!started)return;
  if(!isReady){isReady=true;ready.splice(0).forEach(f=>{try{f();}catch(e){console.warn('v51 ready',e);}});}
  for(const k of tickers){k.t+=dt;if(k.t>=k.sec){k.t=0;try{k.fn();}catch(e){console.warn('v51 tick',e);}}}};
const resetKeys=[];C51.resetKey=k=>resetKeys.push(k);
const _reset=resetProgress;resetProgress=function(){resetKeys.forEach(k=>{try{localStorage.removeItem(k);}catch(e){}});_reset();};
C51.ask=(q,def)=>{try{const v=window.prompt(q,def||'');return v==null?null:String(v).trim().slice(0,18);}catch(e){return def||null;}};
})();
