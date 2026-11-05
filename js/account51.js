'use strict';
/* v51 · Vrai compte joueur : inscription avec confirmation par e-mail, connexion, mot de passe oublié,
   changement de mot de passe, suppression, sauvegarde cloud multi-appareils et réception des cadeaux admin. */
(function(){
const $=s=>document.querySelector(s);
const OWN=/^(pa-|port-aurore)/,SKIP=/^(pa-account5\d-inbox|pa-cloud51|pa-admin)/,LINK='pa-cloud51',INBOX='pa-account50-inbox:';
const box=$('#account-panel'),status=$('#account-status'),badge=$('#account-badge'),toggle=$('#account-open');
let account=null,available=false,devMail=false,view='login',resetToken=null,cloud={state:'idle',server:null,blocked:false},busy=false,msg={t:'',k:''};
const safe=(s,d)=>{try{return JSON.parse(s)??d;}catch(e){return d;}};
const giftIds=new Set((safe(localStorage.getItem('port-aurore-rp'),{})||{}).accountGiftIds||[]);
const link=()=>safe(localStorage.getItem(LINK),{})||{};
const setLink=v=>{try{localStorage.setItem(LINK,JSON.stringify(v));}catch(e){}};
const device=()=>((navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||'Appareil')+(matchMedia('(pointer: coarse)').matches?' · tactile':'');
const ago=iso=>{const m=Math.round((Date.now()-new Date(iso).getTime())/6e4);return m<1?'à l’instant':m<60?'il y a '+m+' min':m<1440?'il y a '+Math.round(m/60)+' h':'le '+new Date(iso).toLocaleDateString('fr-FR');};
async function api(url,body,method){const r=await fetch(url,{method:method||(body===undefined?'GET':'POST'),credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const v=await r.json().catch(()=>({error:'Le serveur de comptes ne répond pas.'}));if(!r.ok){const e=new Error(v.error||'Erreur serveur.');e.status=r.status;e.data=v;throw e;}return v;}
/* ---------------- sauvegarde locale ⇄ cloud ---------------- */
function collect(){const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(OWN.test(k)&&!SKIP.test(k)){const v=localStorage.getItem(k);if(v!=null&&v.length<1.5e6)o[k]=v;}}return o;}
function hash(o){const s=Object.keys(o).sort().map(k=>k+'\u0001'+o[k]).join('\u0002');let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36)+':'+s.length;}
function applyCloud(save){try{sessionStorage.setItem('pa-cloud51-pending',JSON.stringify({data:save.data,link:{email:account.email,rev:save.rev,hash:hash(save.data),at:save.updatedAt}}));}catch(e){say('Sauvegarde trop volumineuse pour ce navigateur.','error');return;}location.reload();}
async function upload(force){
  if(!account||!account.verified||cloud.blocked)return false;
  if(typeof started!=='undefined'&&started){try{saveProgress();}catch(e){}}
  const data=collect();if(!data['port-aurore-rp'])return false;const h=hash(data),L=link();
  if(!force&&L.email===account.email&&L.hash===h)return true;
  try{const v=await api('/api/save',{data,rev:L.email===account.email?L.rev:-1,force:!!force,device:device()},'PUT');setLink({email:account.email,rev:v.rev,hash:h,at:v.updatedAt});account.cloud={rev:v.rev,updatedAt:v.updatedAt};cloud.state='ok';paintStatus();return true;}
  catch(e){if(e.status===409){cloud.blocked=true;cloud.state='conflict';cloud.server=e.data;paintStatus();if(typeof started!=='undefined'&&started)toast('Ta sauvegarde en ligne a été modifiée sur un autre appareil. Reviens au menu pour choisir laquelle garder.','warn');else{view='conflict';render();}}else{cloud.state='error';paintStatus();}return false;}}
async function reconcile(){
  if(!account||!account.verified)return;cloud.state='check';paintStatus();
  let server;try{server=(await api('/api/save')).save;}catch(e){cloud.state='error';paintStatus();return;}
  const local=collect(),hasLocal=!!local['port-aurore-rp'],L=link();cloud.server=server;
  if(!server){if(hasLocal)await upload(true);else{cloud.state='empty';paintStatus();}return;}
  if(L.email===account.email&&L.rev===server.rev){cloud.state='ok';paintStatus();return;}
  const untouched=L.email===account.email&&L.hash===hash(local);
  if(!hasLocal||untouched){if(typeof started!=='undefined'&&started){cloud.blocked=true;cloud.state='conflict';paintStatus();return;}say('Chargement de ta sauvegarde en ligne…','ok');applyCloud(server);return;}
  cloud.blocked=true;cloud.state='conflict';view='conflict';box.hidden=false;openDock(true);render();paintStatus();}
/* ---------------- cadeaux ---------------- */
const inboxKey=()=>INBOX+(account?account.email:'anonyme');
const inbox=()=>{const v=safe(localStorage.getItem(inboxKey()),[]);return Array.isArray(v)?v:[];};
function keep(items){const all=inbox(),seen=new Set(all.map(g=>g.id));items.forEach(g=>{if(g&&typeof g.id==='string'&&!seen.has(g.id)){all.push(g);seen.add(g.id);}});try{localStorage.setItem(inboxKey(),JSON.stringify(all.slice(-100)));}catch(e){}}
async function processInbox(){if(!account||typeof started==='undefined'||!started)return;const ack=[];
  for(const g of inbox()){if(giftIds.has(g.id)){ack.push(g.id);continue;}if(!['cash','bank'].includes(g.destination)||!(g.amount>=1)){ack.push(g.id);continue;}
    state[g.destination]=Math.min(1e9,(Number(state[g.destination])||0)+g.amount);state.earned=(Number(state.earned)||0)+g.amount;giftIds.add(g.id);saveProgress();
    toast('🎁 Cadeau reçu · '+fmt(g.amount)+' sur '+(g.destination==='bank'?'ton compte bancaire':'ton cash')+(g.note?' · '+g.note:''),'good');ack.push(g.id);}
  if(ack.length){try{await api('/api/gifts/ack',{ids:ack});const done=new Set(ack);localStorage.setItem(inboxKey(),JSON.stringify(inbox().filter(g=>!done.has(g.id))));upload(false);}catch(e){}}}
async function pollGifts(){if(!account||!account.verified)return;try{keep((await api('/api/gifts/claim',{})).gifts||[]);await processInbox();}catch(e){}}
/* ---------------- interface ---------------- */
function el(tag,props,kids){const e=document.createElement(tag);Object.entries(props||{}).forEach(([k,v])=>{if(k==='text')e.textContent=v;else if(k==='on')Object.entries(v).forEach(([ev,fn])=>e.addEventListener(ev,fn));else if(v!==false&&v!=null)e.setAttribute(k,v===true?'':v);});(kids||[]).forEach(c=>c&&e.appendChild(c));return e;}
function field(id,labelText,type,auto,ph){const i=el('input',{id,type,autocomplete:auto,placeholder:ph||'',maxlength:type==='email'?254:128});['keydown','keyup','keypress'].forEach(ev=>i.addEventListener(ev,e=>{e.stopPropagation();if(ev==='keydown'&&e.key==='Enter'){const b=box.querySelector('button.primary');if(b)b.click();}}));return [el('label',{for:id,text:labelText}),i];}
const val=id=>{const e=document.getElementById(id);return e?e.value:'';};
function btn(text,fn,cls){return el('button',{type:'button',class:cls||'',text,on:{click:async e=>{if(busy)return;busy=true;e.currentTarget.disabled=true;try{await fn();}catch(err){say(err.message,'error');}finally{busy=false;render();}}}});}
function say(t,k){msg={t,k:k||''};const m=box.querySelector('.account-msg');if(m){m.textContent=t;m.className='account-msg '+(k||'');}}
function tabs(){return el('div',{class:'account-tabs',role:'tablist'},[['login','Connexion'],['register','Créer un compte'],['forgot','Mot de passe oublié']].map(([k,t])=>el('button',{type:'button',role:'tab','aria-selected':String(view===k),class:view===k?'on':'',text:t,on:{click:()=>{view=k;msg={t:'',k:''};render();}}})));}
let paintStatus=function(){
  if(!available){status.textContent='Comptes indisponibles ici : lance le jeu avec son serveur (npm start).';toggle.textContent='Compte indisponible';toggle.disabled=true;badge.hidden=true;return;}
  toggle.disabled=false;
  if(!account){status.textContent='Crée ton compte pour sauvegarder ta partie en ligne, la retrouver sur tous tes appareils et recevoir les cadeaux.';toggle.textContent=box.hidden?'Se connecter / créer un compte':'Masquer';badge.hidden=true;return;}
  badge.hidden=false;badge.textContent='✓ Connecté';badge.className='account-badge '+(account.verified?'ok':'warn');
  const c=account.cloud,cs={check:'synchronisation…',error:'synchro impossible pour le moment',conflict:'⚠ deux sauvegardes différentes, choisis laquelle garder',empty:'prête (lance une partie pour la remplir)'}[cloud.state];
  status.textContent=account.email+' · '+(!account.verified?'confirme ton adresse e-mail pour activer la sauvegarde en ligne et les cadeaux.':'sauvegarde en ligne : '+(cs||(c?'à jour '+ago(c.updatedAt):'active')));
  toggle.textContent=box.hidden?'Gérer mon compte':'Masquer';};
function render(){paintStatus();box.replaceChildren();if(!available)return;const kids=[];
  if(view==='reset'){kids.push(el('h3',{text:'Nouveau mot de passe'}),...field('acc-pw','Nouveau mot de passe · 10 caractères minimum','password','new-password'),...field('acc-pw2','Confirme le mot de passe','password','new-password'),
    el('div',{class:'account-actions'},[btn('Enregistrer et me connecter',async()=>{if(val('acc-pw')!==val('acc-pw2'))throw new Error('Les deux mots de passe ne sont pas identiques.');const v=await api('/api/password/reset',{token:resetToken,password:val('acc-pw')});account=v.account;resetToken=null;view='manage';say('Mot de passe modifié. Tu es connecté.','ok');await reconcile();},'primary')]));}
  else if(view==='conflict'&&account){const s=cloud.server||{},L=link();kids.push(el('h3',{text:'Deux sauvegardes différentes'}),el('p',{class:'account-note',text:'Ton compte contient une partie enregistrée '+(s.updatedAt?ago(s.updatedAt):'récemment')+', différente de celle de cet appareil'+(L.at?' (dernière synchro '+ago(L.at)+')':'')+'. Laquelle veux-tu garder ?'}),
    el('div',{class:'account-actions stack'},[btn('☁️ Charger la partie de mon compte',async()=>{const v=await api('/api/save');if(!v.save)throw new Error('Aucune sauvegarde en ligne.');applyCloud(v.save);},'primary'),btn('📱 Garder celle de cet appareil (remplace le compte)',async()=>{cloud.blocked=false;if(await upload(true)){view='manage';say('Sauvegarde de cet appareil envoyée sur ton compte.','ok');}})]));}
  else if(!account){kids.push(tabs());
    if(view==='register')kids.push(...field('acc-email','Adresse e-mail','email','username','toi@exemple.com'),...field('acc-pw','Mot de passe · 10 caractères minimum','password','new-password'),...field('acc-pw2','Confirme le mot de passe','password','new-password'),
      el('div',{class:'account-actions'},[btn('Créer mon compte',async()=>{if(val('acc-pw')!==val('acc-pw2'))throw new Error('Les deux mots de passe ne sont pas identiques.');const v=await api('/api/register',{email:val('acc-email'),password:val('acc-pw')});account=v.account;account.verified=true;view='manage';cloud={state:'idle',server:null,blocked:false};say('Compte créé ✓ Tu es connecté, la sauvegarde en ligne et les cadeaux sont actifs.','ok');await reconcile();pollGifts();},'primary')]),
      el('small',{class:'account-note',text:'Ton adresse sert à te connecter, récupérer ton mot de passe et recevoir les cadeaux de l’admin. Elle n’est jamais affichée aux autres joueurs.'}));
    else if(view==='forgot')kids.push(...field('acc-email','Adresse e-mail du compte','email','username','toi@exemple.com'),el('div',{class:'account-actions'},[btn('Recevoir un lien de réinitialisation',async()=>{const v=await api('/api/password/forgot',{email:val('acc-email')}).catch(e=>{if(e.status===503)throw new Error(e.message);throw e;});say(v.devMail?'Mode local : si ce compte existe, le lien est affiché dans la console du serveur.':'Si un compte existe pour cette adresse, un lien valable 30 minutes vient d’être envoyé.','ok');},'primary')]));
    else kids.push(...field('acc-email','Adresse e-mail','email','username','toi@exemple.com'),...field('acc-pw','Mot de passe','password','current-password'),el('div',{class:'account-actions'},[btn('Se connecter',async()=>{const v=await api('/api/login',{email:val('acc-email'),password:val('acc-pw')});account=v.account;view='manage';cloud={state:'idle',server:null,blocked:false};say('Connexion réussie.','ok');await reconcile();pollGifts();},'primary')]));}
  else{const a=account;
    kids.push(el('div',{class:'account-actions'},[btn('☁️ Synchroniser maintenant',async()=>{cloud.blocked=false;if(await upload(true))say('Partie sauvegardée en ligne.','ok');},'primary')]));
    kids.push(el('details',{class:'account-more'},[el('summary',{text:'Sécurité du compte'}),...field('acc-cur','Mot de passe actuel','password','current-password'),...field('acc-pw','Nouveau mot de passe · 10 caractères minimum','password','new-password'),
      el('div',{class:'account-actions'},[btn('Changer le mot de passe',async()=>{await api('/api/password/change',{current:val('acc-cur'),password:val('acc-pw')});say('Mot de passe modifié. Tes autres appareils ont été déconnectés.','ok');}),btn('Déconnecter tous mes appareils',async()=>{await api('/api/logout-all',{});account=null;view='login';say('Tous les appareils sont déconnectés.','ok');})]),
      el('div',{class:'account-actions'},[btn('Supprimer mon compte',async()=>{const pw=val('acc-cur');if(!pw)throw new Error('Saisis ton mot de passe actuel pour supprimer le compte.');if(!confirm('Supprimer définitivement ton compte, ta sauvegarde en ligne et tes cadeaux en attente ?'))return;await api('/api/account/delete',{password:pw});localStorage.removeItem(LINK);account=null;view='register';say('Compte supprimé. Ta partie reste sur cet appareil.','ok');},'danger')])]),
      el('div',{class:'account-actions'},[btn('Se déconnecter',async()=>{await upload(false);await api('/api/logout',{});account=null;view='login';say('Déconnecté.','ok');})]));}
  kids.push(el('p',{class:'account-msg '+msg.k,role:'status',text:msg.t}));
  box.replaceChildren(...kids);}
async function refresh(){try{const h=await api('/api/health');available=!!h.account;devMail=!!h.devMail;const v=await api('/api/me');account=v.account;if(account)account.verified=true;if(account&&view!=='reset'&&view!=='conflict')view='manage';}catch(e){available=false;account=null;}render();if(account&&account.verified){await reconcile();pollGifts();}}
async function fromLink(){const q=new URLSearchParams(location.search),vt=q.get('verify'),rt=q.get('reset');if(!vt&&!rt)return;history.replaceState(null,'',location.pathname);box.hidden=false;openDock(true);
  if(rt){resetToken=rt;view='reset';say('Choisis ton nouveau mot de passe.','ok');}
  if(vt){try{const v=await api('/api/verify',{token:vt});say('Adresse '+v.email+' confirmée ✓ Sauvegarde en ligne et cadeaux activés.','ok');}catch(e){say(e.message,'error');}}}
toggle.addEventListener('click',()=>{if(!available)return;box.hidden=!box.hidden;if(!account&&view==='manage')view='login';render();});
/* Le menu titre v27 masque l'ancien menu : le compte y est intégré comme un panneau dédié. */
let dock=null,chip=null;
function openDock(on){if(!dock)return;dock.hidden=!on;if(on){box.hidden=false;if(!account&&view==='manage')view='login';render();const f=box.querySelector('input');if(f)setTimeout(()=>f.focus({preventScroll:true}),60);}}
(function mount(){const main=document.getElementById('pm-main'),sec=document.querySelector('.account-box');if(!main||!sec)return;
  dock=el('div',{id:'acc51-dock',class:'acc51-dock',role:'dialog','aria-label':'Mon compte Port-Aurore'});dock.hidden=true;
  const close=el('button',{type:'button',class:'acc51-close','aria-label':'Fermer',text:'×',on:{click:()=>openDock(false)}});
  ['keydown','keyup'].forEach(ev=>dock.addEventListener(ev,e=>{e.stopPropagation();if(ev==='keydown'&&e.key==='Escape')openDock(false);}));
  dock.appendChild(close);dock.appendChild(sec);main.appendChild(dock);toggle.hidden=true;
  const chips=main.querySelector('.pm-chips');chip=el('button',{type:'button',class:'pm-chip acc51-chip',text:'👤 Mon compte',on:{click:()=>openDock(dock.hidden)}});if(chips)chips.prepend(chip);else main.appendChild(chip);})();
const _paint=paintStatus;paintStatus=function(){_paint();if(chip)chip.textContent=!available?'👤 Compte hors ligne':!account?'👤 Se connecter':(account.verified?'✓ ':'⚠ ')+account.email.split('@')[0];};
/* ---------------- boucle de jeu ---------------- */
let giftT=0,syncT=0;const _u=update;update=function(dt){_u(dt);if(!started)return;giftT-=dt;syncT-=dt;if(giftT<=0){giftT=3;processInbox();}if(syncT<=0){syncT=60;upload(false);}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)upload(false);});
setInterval(pollGifts,25000);
window.ACCOUNT50=window.ACCOUNT51={giftIds:()=>Array.from(giftIds),get account(){return account;},sync:()=>upload(true)};
(async()=>{await fromLink();await refresh();if(window.CLOUD51_APPLIED)say('Partie en ligne chargée ✓','ok');})();
})();
