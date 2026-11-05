'use strict';
/* v51 · Applique une sauvegarde cloud choisie AVANT le chargement des modules du jeu. */
(function(){try{
  const raw=sessionStorage.getItem('pa-cloud51-pending');if(!raw)return;sessionStorage.removeItem('pa-cloud51-pending');
  const p=JSON.parse(raw);if(!p||!p.data||typeof p.data!=='object')return;
  const OWN=/^(pa-|port-aurore)/,KEEP=/^(pa-account5\d-inbox|pa-cloud51|pa-admin)/,del=[];
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(OWN.test(k)&&!KEEP.test(k))del.push(k);}
  del.forEach(k=>localStorage.removeItem(k));
  Object.keys(p.data).forEach(k=>{if(OWN.test(k)&&!KEEP.test(k)&&typeof p.data[k]==='string')localStorage.setItem(k,p.data[k]);});
  localStorage.setItem('pa-cloud51',JSON.stringify(p.link||{}));window.CLOUD51_APPLIED=true;
}catch(e){console.warn('Sauvegarde cloud non appliquée',e);}})();
