'use strict';
/* ===== Port-Aurore v25 · téléphone réaliste (écran d'accueil, icônes, applis natives) ===== */
const P25={pages:null,lastClose:-1e9,sent:{},order:null,bankMode:null,contact:null,mapQ:'',viewer:null,cam:false,call:null,islT:0};
const h25=(html)=>{const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstChild;};
const esc25=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const app25=n=>APPS.find(a=>a[0]===n);
const G='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">';
const F='<svg viewBox="0 0 24 24" fill="currentColor">';
/* glyphes partagés */
const SV={
  chev:'<svg viewBox="0 0 13 21" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 2L2.5 10.5l8 8.5"/></svg>',
  phone:F+'<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>',
  bubble:F+'<path d="M12 3.2c-5.1 0-9.2 3.4-9.2 7.6 0 2.4 1.3 4.5 3.4 5.9-.2 1.5-.9 2.7-2 3.6 2.1 0 3.9-.7 5.2-1.9.8.2 1.7.3 2.6.3 5.1 0 9.2-3.4 9.2-7.6S17.1 3.2 12 3.2z"/></svg>',
  search:G+'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>',
  plus:G+'<path d="M12 5v14M5 12h14"/></svg>',
  up:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 11.5L12 5.5l6 6"/></svg>',
  arrowIn:G+'<path d="M12 4v12M6.5 10.5L12 16l5.5-5.5M5 20h14"/></svg>',
  arrowOut:G+'<path d="M12 20V8M6.5 13.5L12 8l5.5 5.5M5 4h14"/></svg>',
  send:G+'<path d="M4 12h12M11 6l6 6-6 6"/><path d="M20 5v14"/></svg>',
  doc:G+'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>',
  pin:F+'<path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>',
  nav:F+'<path d="M21 3L3 10.5l7.5 3 3 7.5z"/></svg>',
  cam:G+'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.6"/></svg>',
  flip:G+'<path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2"/><path d="M20 4v4h-4M4 20v-4h4"/></svg>',
  bolt:F+'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
  play:F+'<path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>',
  pause:F+'<rect x="5.5" y="4" width="4.5" height="16" rx="1.2"/><rect x="14" y="4" width="4.5" height="16" rx="1.2"/></svg>',
  next:F+'<path d="M3 6.5v11a.8.8 0 0 0 1.2.7L12 13v4.5a.8.8 0 0 0 1.2.7l9-5.5a.8.8 0 0 0 0-1.4l-9-5.5A.8.8 0 0 0 12 6.5V11L4.2 5.8A.8.8 0 0 0 3 6.5z"/></svg>',
  prev:F+'<path d="M21 6.5v11a.8.8 0 0 1-1.2.7L12 13v4.5a.8.8 0 0 1-1.2.7l-9-5.5a.8.8 0 0 1 0-1.4l9-5.5A.8.8 0 0 1 12 6.5V11l7.8-5.2a.8.8 0 0 1 1.2.7z"/></svg>',
  mute:G+'<path d="M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3z"/><path d="M6 11a6 6 0 0 0 12 0M12 17v3"/></svg>',
  pad:F+'<circle cx="6" cy="5" r="1.8"/><circle cx="12" cy="5" r="1.8"/><circle cx="18" cy="5" r="1.8"/><circle cx="6" cy="11" r="1.8"/><circle cx="12" cy="11" r="1.8"/><circle cx="18" cy="11" r="1.8"/><circle cx="6" cy="17" r="1.8"/><circle cx="12" cy="17" r="1.8"/><circle cx="18" cy="17" r="1.8"/><circle cx="12" cy="22" r="1.5"/></svg>',
  spk:G+'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  video:G+'<rect x="3" y="6.5" width="12.5" height="11" rx="2.5"/><path d="M15.5 10.5l5-3v9l-5-3"/></svg>',
  person:F+'<circle cx="12" cy="8" r="4.2"/><path d="M3.5 21c.8-4.4 4.2-7 8.5-7s7.7 2.6 8.5 7z"/></svg>',
  lockO:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 11V7.5a4 4 0 0 1 8 0"/></svg>',
  lockC:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/></svg>',
  torch:G+'<path d="M8 3h8v4l-2 3v11h-4V10L8 7z"/><path d="M12 13v2"/></svg>',
  gear:F+'<path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8zm8.6 4.6l1.9 1.5-1.9 3.3-2.3-.8a7.6 7.6 0 0 1-2 1.2L15.9 21h-3.8l-.4-2.6a7.6 7.6 0 0 1-2-1.2l-2.3.8-1.9-3.3 1.9-1.5a7.7 7.7 0 0 1 0-2.4L5.5 9.3l1.9-3.3 2.3.8a7.6 7.6 0 0 1 2-1.2L12.1 3h3.8l.4 2.6a7.6 7.6 0 0 1 2 1.2l2.3-.8 1.9 3.3-1.9 1.5a7.7 7.7 0 0 1 0 2.4z" transform="translate(-2 0)"/></svg>',
  sound:F+'<path d="M3 9v6h4l5 4V5L7 9z"/><path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  battery:F+'<rect x="2" y="7" width="17" height="10" rx="2.5"/><rect x="20" y="10" width="2" height="4" rx="1"/></svg>',
  antenna:F+'<rect x="3" y="15" width="3" height="5" rx="1"/><rect x="8" y="11" width="3" height="9" rx="1"/><rect x="13" y="7" width="3" height="13" rx="1"/><rect x="18" y="3" width="3" height="17" rx="1"/></svg>',
  info:F+'<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>',
  spark:F+'<path d="M12 2l2.3 6.2L21 9l-5.2 4.3L17.5 20 12 16.4 6.5 20l1.7-6.7L3 9l6.7-.8z"/></svg>',
  card:G+'<rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path d="M2.5 10h19M6 15h4"/></svg>',
};
/* icônes d'applis : fond + glyphe (ou illustration pleine) */
const ICO25={
  'Messages':['linear-gradient(180deg,#6af27e,#0bc12d)',SV.bubble],
  'Appels':['linear-gradient(180deg,#6af27e,#0bc12d)',SV.phone],
  'Banque':['linear-gradient(160deg,#25418f,#0a1433)',G+'<path d="M3 9.5L12 4l9 5.5"/><path d="M5 10v8M9.7 10v8M14.3 10v8M19 10v8M3 20.5h18"/></svg>'],
  'Plan':['#e8efe1','<svg class="full" viewBox="0 0 60 60"><rect width="60" height="60" fill="#e6eedd"/><path d="M0 40L60 14" stroke="#fff" stroke-width="9"/><path d="M0 40L60 14" stroke="#f7d36b" stroke-width="5"/><path d="M22 0L40 60" stroke="#fff" stroke-width="7"/><rect x="38" y="34" width="22" height="26" fill="#b9dca8"/><rect x="0" y="0" width="16" height="22" fill="#a9d1f0"/><path d="M14 52L28 30L44 22" stroke="#2f7cf6" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="44" cy="20" r="7.5" fill="#ff3b30"/><circle cx="44" cy="20" r="3" fill="#fff"/></svg>'],
  'Photos':['#fff','<svg class="full" viewBox="0 0 60 60"><rect width="60" height="60" fill="#fff"/>'+[['#fdba2b',0],['#f78f1e',45],['#ef4b5c',90],['#c45ab3',135],['#7b6ccf',180],['#3a9ee5',225],['#3fc1b0',270],['#9ad34f',315]].map(([c,r])=>`<ellipse cx="30" cy="18.5" rx="6.6" ry="11.5" fill="${c}" opacity=".88" transform="rotate(${r} 30 30)" style="mix-blend-mode:multiply"/>`).join('')+'</svg>'],
  'Boulot':['linear-gradient(180deg,#b38a5a,#7a5531)',G+'<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7V5.2A1.7 1.7 0 0 1 10.2 3.5h3.6a1.7 1.7 0 0 1 1.7 1.7V7M3 12.5h18"/></svg>'],
  'Livraison':['linear-gradient(180deg,#ff6a3d,#e8261d)',G+'<path d="M5.5 8h13l-1.2 12.5H6.7z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>'],
  'Radio':['linear-gradient(180deg,#ff6b7d,#fa2350)',F+'<path d="M9 17.3V6.2c0-.5.3-.9.8-1l9-2.1c.6-.1 1.2.3 1.2 1v11.1h-.1a3 3 0 1 1-2-2.8V7.3l-7 1.6v9.6a3 3 0 1 1-1.9-1.2z"/></svg>'],
  'Taxi':['linear-gradient(180deg,#ffe14d,#f7b500)','<svg viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4h4l.6 2.5"/><path d="M5 12l1.8-5a1.5 1.5 0 0 1 1.4-1h7.6a1.5 1.5 0 0 1 1.4 1L19 12"/><rect x="3" y="12" width="18" height="5.5" rx="2"/><path d="M5.5 17.5v2M18.5 17.5v2"/><circle cx="7" cy="14.8" r=".9" fill="#1c1c1e"/><circle cx="17" cy="14.8" r=".9" fill="#1c1c1e"/></svg>'],
  'Réglages':['linear-gradient(180deg,#a8a8ad,#6e6e73)','<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><circle cx="12" cy="12" r="6.3" stroke-width="2.6"/><circle cx="12" cy="12" r="2.2" fill="#fff"/>'+Array.from({length:12},(_,i)=>`<rect x="11" y="1.6" width="2" height="3.4" rx=".6" fill="#fff" stroke="none" transform="rotate(${i*30} 12 12)"/>`).join('')+'</svg>'],
  'Contacts':['linear-gradient(180deg,#d8d8dc,#a7a7ad)','<svg viewBox="0 0 24 24" fill="#7b7b81"><circle cx="12" cy="8.5" r="4"/><path d="M4 20.5c.9-4.2 4.1-6.5 8-6.5s7.1 2.3 8 6.5z"/></svg>'],
  'Annonces':['linear-gradient(180deg,#ffb340,#ff7a00)',G+'<path d="M3.5 10v4h3l8 4.5V5.5l-8 4.5z" fill="#fff"/><path d="M18 9a4 4 0 0 1 0 6M7 14l1.5 5.5"/></svg>'],
  'Réseaux':['radial-gradient(circle at 30% 107%,#fdf497 0%,#fd5949 45%,#d6249f 60%,#285aeb 95%)',G+'<rect x="4" y="4" width="16" height="16" rx="4.8"/><circle cx="12" cy="12" r="3.8"/><circle cx="17" cy="7" r=".9" fill="#fff"/></svg>'],
  'Immobilier':['linear-gradient(180deg,#5ac8fa,#0a7aff)',F+'<path d="M12 3.2l9 7.2v9.6a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1v-9.6z"/></svg>'],
  'Entreprises':['linear-gradient(180deg,#46d36c,#1e9b43)',G+'<path d="M4 9.5L5.6 4h12.8L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5 12v8.5h14V12M10 20.5V15h4v5.5"/></svg>'],
  'Emploi':['linear-gradient(180deg,#7d7aff,#3a37c4)',G+'<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/><circle cx="10.5" cy="9" r="1.8" fill="#fff"/><path d="M7.3 13.6a3.6 3.6 0 0 1 6.4 0"/></svg>'],
  'Compte':['linear-gradient(180deg,#2bb3c0,#0f6576)',G+'<path d="M5.5 4h11a2.5 2.5 0 0 1 2.5 2.5V20H8a2.5 2.5 0 0 1-2.5-2.5z"/><path d="M5.5 17.5A2.5 2.5 0 0 1 8 15h11M9.5 8h5.5M9.5 11h4"/></svg>'],
  'Factures':['linear-gradient(180deg,#ff6482,#d81b50)',G+'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 15.5h3.5"/></svg>'],
  'Chantier':['linear-gradient(180deg,#ffcf3f,#f39c12)','<svg viewBox="0 0 24 24" fill="#2b1d00"><path d="M3 17h18v2.2H3z"/><path d="M4.5 16a7.5 7.5 0 0 1 15 0z"/><rect x="10" y="5.5" width="4" height="5" rx="1" fill="#ffcf3f" stroke="#2b1d00" stroke-width="1.6"/></svg>'],
  'Justice':['linear-gradient(180deg,#4a5d86,#1f2840)',G+'<path d="M12 4v16M8 20.5h8M5 7h14M12 4.5l-1 2.5h2z"/><path d="M5 7l-2.5 6a2.5 2.5 0 0 0 5 0zM19 7l-2.5 6a2.5 2.5 0 0 0 5 0z"/></svg>'],
  'Organisations':['linear-gradient(180deg,#3a3a3c,#0c0c0d)',F+'<path d="M2 9.5c3-1 6.5-1.2 10-.2 3.5-1 7-.8 10 .2-.3 3.7-2.2 6-5.2 6-2.2 0-3.6-1.4-4.8-3.5-1.2 2.1-2.6 3.5-4.8 3.5-3 0-4.9-2.3-5.2-6z"/></svg>'],
  'Gestion':['linear-gradient(180deg,#34c759,#1a7f37)',F+'<rect x="4" y="12" width="3.6" height="8" rx="1"/><rect x="10.2" y="7.5" width="3.6" height="12.5" rx="1"/><rect x="16.4" y="3.5" width="3.6" height="16.5" rx="1"/></svg>'],
  'Ma Vie':['linear-gradient(180deg,#ffd60a,#ff9f0a)',SV.spark],
  'Mairie':['linear-gradient(180deg,#f2ede2,#c9c0ad)','<svg viewBox="0 0 24 24" fill="none" stroke="#3a3528" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5v4M12 2.8h3.5v2H12" /><path d="M3.5 10.5L12 6.5l8.5 4M5.5 11v7.5M9.8 11v7.5M14.2 11v7.5M18.5 11v7.5M3 20.5h18"/></svg>'],
  'Transports':['linear-gradient(180deg,#30d158,#0e8a4a)',G+'<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M5 10.5h14M8 18v2.5M16 18v2.5M9.5 6h5"/><circle cx="8.5" cy="14.2" r=".9" fill="#fff"/><circle cx="15.5" cy="14.2" r=".9" fill="#fff"/></svg>'],
  'Mobilier':['linear-gradient(180deg,#d9a066,#8b5a2b)',G+'<path d="M5.5 10.5V8a2.5 2.5 0 0 1 2.5-2.5h8A2.5 2.5 0 0 1 18.5 8v2.5"/><path d="M3 12.5a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0V18H3z"/><path d="M5 18v2M19 18v2"/></svg>'],
};
const TINT25={'Messages':['#34c759','#0b9b2b'],'Appels':['#34c759','#0b9b2b'],'Banque':['#1e4fd8','#0a1a52'],'Plan':['#007aff','#0040a0'],'Photos':['#007aff','#5856d6'],'Boulot':['#a2794b','#5e3f1f'],'Livraison':['#06c167','#03804a'],'Radio':['#ff375f','#b0123a'],'Taxi':['#e0a800','#8a6400','#000'],'Réglages':['#007aff','#4b4b52'],'Contacts':['#007aff','#4b4b52'],'Annonces':['#ff8a00','#c24a00'],'Réseaux':['#d6249f','#5a2bd6'],'Immobilier':['#0a84ff','#0a3f8f'],'Entreprises':['#1f9d4c','#0f5c2a'],'Emploi':['#4f4cd8','#25236b'],'Compte':['#128a99','#0a4a57'],'Factures':['#e5194f','#8a0f2f'],'Chantier':['#e08a00','#7a4a00'],'Justice':['#3b4f7d','#1a2238'],'Organisations':['#8e8e93','#2c2c2e'],'Gestion':['#1f9d4c','#0f5c2a'],'Ma Vie':['#ff9500','#c25400'],'Mairie':['#8a7a52','#4a4030'],'Transports':['#16a34a','#0b5e2b'],'Mobilier':['#a86b35','#5c3517']};
const DARK25=new Set(['Radio','Organisations']);
const DOCK25=['Appels','Messages','Plan','Radio'];
function icon25(a){const s=ICO25[a[0]],i=document.createElement('i');i.className='ico';
  if(s){i.style.background=s[0];i.innerHTML=s[1];if(!/class="full"/.test(s[1]))i.style.color=a[0]==='Taxi'?'#1c1c1e':'#fff';}
  else{i.style.background='linear-gradient(180deg,'+a[2]+')';i.textContent=a[1];}
  return i;}
/* fonds d'écran */
WALLS.length=0;WALLS.push(
  'radial-gradient(70% 45% at 18% 12%,#ffb36b 0%,transparent 70%),radial-gradient(60% 50% at 88% 34%,#ff4f8b 0%,transparent 70%),radial-gradient(80% 55% at 40% 92%,#5a2bd6 0%,transparent 72%),linear-gradient(170deg,#ff7a59,#7a2bd1 55%,#1b0b3d)',
  'radial-gradient(70% 50% at 80% 10%,#9ff3ff 0%,transparent 70%),radial-gradient(70% 55% at 10% 60%,#1b9fe0 0%,transparent 72%),radial-gradient(80% 50% at 70% 100%,#0a3d6b 0%,transparent 70%),linear-gradient(180deg,#36c7d9,#0f5fa8 60%,#06223e)',
  'radial-gradient(60% 40% at 50% 0%,#5b6270 0%,transparent 70%),radial-gradient(70% 50% at 100% 80%,#2a2e36 0%,transparent 70%),linear-gradient(180deg,#30343c,#0b0c0f)',
  'radial-gradient(3px 3px at 22% 64%,#ffd27a,transparent),radial-gradient(2px 2px at 64% 70%,#ffe3a3,transparent),radial-gradient(2px 2px at 80% 61%,#ffc35c,transparent),radial-gradient(70% 40% at 50% 78%,#c96a2c 0%,transparent 70%),linear-gradient(180deg,#0b1430 0%,#1b2a5c 55%,#d07a3a 82%,#2a1a20 100%)',
  'radial-gradient(70% 50% at 20% 20%,#fff1d6 0%,transparent 70%),radial-gradient(70% 60% at 90% 70%,#f2b58f 0%,transparent 70%),linear-gradient(180deg,#f7dcc0,#d99b7a 70%,#9c5d4d)'
);
const WALLN25=['Aurore','Lagon','Graphite','Port de nuit','Sable'];
if(wallN>=WALLS.length)wallN=0;
applyWall=function(){const w=$('#ph-wall');if(w)w.style.background=WALLS[wallN]||WALLS[0];if(typeof savePhoneP58==='function')savePhoneP58();};
/* état du téléphone */
function clockTxt25(){const c=$('#clock');return c?c.textContent:'10:00';}
function bat25(){const t=((gameMin%1440)+1440)%1440;return Math.max(5,Math.round(100-((t-420+1440)%1440)/1440*80));}
function noNet25(){return typeof blackout!=='undefined'&&blackout>0;}
function sbIcons25(){
  const off=noNet25(),b=bat25(),bars=[5,8.5,12,15.5].map((hh,i)=>`<rect x="${i*5}" y="${16-hh}" width="3.4" height="${hh}" rx="1" fill="currentColor" opacity="${off?(i?0.3:1):1}"/>`).join('');
  return `<svg width="19" height="16" viewBox="0 0 19 16">${bars}</svg>`+(off?'<span class="sos">SOS</span>':'<span class="net">5G</span>')+
   `<svg width="28" height="14" viewBox="0 0 28 14"><rect x=".7" y=".7" width="23.6" height="12.6" rx="3.8" fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="1.2"/><rect x="2.4" y="2.4" width="${Math.max(2,20.2*b/100)}" height="9.2" rx="2.2" fill="${b<=20?'#ff3b30':'currentColor'}"/><path d="M25.8 4.8v4.4c.9-.3 1.5-1.2 1.5-2.2s-.6-1.9-1.5-2.2z" fill="currentColor" fill-opacity=".45"/></svg>`;}
function status25(){const t=$('#ph-time');if(t)t.textContent=clockTxt25();const r=$('#ph-sbr');if(r){const k=noNet25()+':'+bat25();if(r.dataset.k!==k){r.dataset.k=k;r.innerHTML=sbIcons25();}}
  const lk=$('#ph-lock');if(lk&&!lk.hidden){const bt=lk.querySelector('.big');if(bt)bt.textContent=clockTxt25();}}
phoneStatusP58=status25;
function avColor25(n){let h=0;for(const c of String(n))h=(h*31+c.charCodeAt(0))>>>0;const g=[['#f9a8a8','#e45d5d'],['#a8d8f9','#3d8fe0'],['#b6e3a6','#4caf50'],['#f6cf8e','#e6922e'],['#d3b6f2','#8d5ad8'],['#9fe3dc','#25a59a'],['#f4b4d6','#d6478f']];const p=g[h%g.length];return 'linear-gradient(180deg,'+p[0]+','+p[1]+')';}
function initials25(n){const p=String(n).trim().split(/\s+/);return((p[0]||'?')[0]+(p[1]?p[1][0]:'')).toUpperCase();}
function av25(n,cls){const d=mk('div','av'+(cls?' '+cls:''),initials25(n));d.style.background=avColor25(n);return d;}
function tone25(t){const s=$('#ph-scr');if(s)s.dataset.tone=t;}
function hm25(min){const t=Math.floor(((min%1440)+1440)%1440);return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');}
function day25(min){return Math.floor(min/1440)+1;}
/* ===== construction du téléphone ===== */
function build25(){
  const ph=$('#phone');if(!ph||ph.dataset.v25)return;ph.dataset.v25='1';
  ph.innerHTML=`<div class="ph" id="ph-dev"><i class="ph-key ph-act"></i><i class="ph-key ph-vu"></i><i class="ph-key ph-vd"></i><i class="ph-key ph-pw"></i><div class="ph-glass"><div class="scr" id="ph-scr" data-tone="home">
   <div class="ph-wall" id="ph-wall"></div>
   <div class="sb"><span id="ph-time">10:00</span><span class="sb-r" id="ph-sbr"></span><span id="ph-net" hidden></span></div>
   <div class="island" id="ph-island"><div class="isl-c" id="ph-islc"></div><i class="cam-l"></i></div>
   <div class="homev" id="ph-homev"><div class="pages" id="ph-pages"></div><div class="dots" id="ph-dots"></div><div class="dock" id="ph-dock"></div></div>
   <div class="appv" id="ph-appv" hidden><div class="hd"><button id="ph-back" type="button">${SV.chev}<span>Accueil</span></button><span id="ph-title"></span></div><div id="ph-body" class="pb"></div></div>
   <div class="lock" id="ph-lock" hidden></div>
   <button id="ph-home" type="button" aria-label="Accueil"></button><div class="glare"></div></div></div></div>`;
  $('#ph-home').onclick=()=>{if(P25.call)return;if(phApp||P25.cam)phHome();else closePanel();};
  $('#ph-back').onclick=()=>back25();
  $('#ph-body').addEventListener('scroll',e=>{$('#ph-appv').classList.toggle('scrolled',e.target.scrollTop>30);},{passive:true});
  ph.addEventListener('keydown',e=>{const t=e.target;if(t&&/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)&&e.key!=='Escape')e.stopPropagation();});
  ph.addEventListener('keyup',e=>{const t=e.target;if(t&&/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName))e.stopPropagation();});
  ph.addEventListener('pointerdown',e=>{if(e.target.id==='phone')closePanel();});
  addEventListener('resize',fit25);fit25();applyWall();status25();
  setInterval(()=>{if(!ph.hidden){status25();tick25();}},1000);
}
function fit25(){const ph=$('#ph-dev');if(!ph)return;const s=Math.min(1.12,(innerHeight-24)/784,(innerWidth-16)/372);ph.style.setProperty('--phs',Math.max(.45,s).toFixed(3));}
function back25(){if(P25.viewer!=null){P25.viewer=null;phOpen(app25('Photos'));return;}
  if(phThN){const a=P25.threadFrom==='Contacts'?app25('Contacts'):app25('Messages');phThN=null;phOpen(a,'slide');return;}
  if(phApp&&phApp[0]==='Contacts'&&P25.contact){P25.contact=null;phOpen(phApp,'slide');return;}
  phHome();}
/* ===== accueil ===== */
function wxWidget25(){
  const t=((gameMin%1440)+1440)%1440,hr=t/60,night=hr<6.5||hr>=20,w=(typeof wx!=='undefined'&&typeof WX!=='undefined')?WX[wx.i]:null,i=w?wx.i:0;
  const temp=Math.round(22+6*Math.cos((hr-15)/24*Math.PI*2)-i*2),hi=Math.round(28-i*2),lo=Math.round(16-i);
  const cond=i===0?(night?'Dégagé':'Ensoleillé'):w[1];
  const ico=i===0?(night?'<svg class="wxi" viewBox="0 0 24 24" fill="#fff"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>':'<svg class="wxi" viewBox="0 0 24 24" fill="#ffd60a"><circle cx="12" cy="12" r="5"/>'+Array.from({length:8},(_,k)=>`<rect x="11.1" y="1" width="1.8" height="3.6" rx=".9" transform="rotate(${k*45} 12 12)"/>`).join('')+'</svg>')
    :i===1?'<svg class="wxi" viewBox="0 0 24 24"><circle cx="9" cy="8" r="4" fill="#ffd60a"/><path d="M7 19a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.4 1.5A3.3 3.3 0 0 1 17 19z" fill="#fff"/></svg>'
    :'<svg class="wxi" viewBox="0 0 24 24"><path d="M7 15a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.4 1.5A3.3 3.3 0 0 1 17 15z" fill="#fff"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3" stroke="#9ad7ff" stroke-width="1.8" stroke-linecap="round"/>'+(i===3?'<path d="M13 15l-2 3h2.5l-1.5 3" stroke="#ffd60a" stroke-width="1.6" fill="none"/>':'')+'</svg>';
  const d=mk('button','wdg wx'+(night?' night':'')+(i>=2?' rain':''));d.type='button';
  d.innerHTML=`<small>Port-Aurore ${SV.nav.replace('<svg','<svg width="10" height="10"')}</small><div class="tmp">${temp}°</div>${ico}<div class="cnd">${esc25(cond)}</div><div class="hl">Max. ${hi}° Min. ${lo}°</div>`;
  d.onclick=()=>toast(cond+' sur Port-Aurore, '+temp+'°.');return d;}
function walWidget25(){
  const d=mk('button','wdg wal');d.type='button';const l=(typeof walletP58!=='undefined'&&walletP58.ledger&&walletP58.ledger[0])||null;
  d.innerHTML=`<small><i></i>Banque</small><b>${fmt(state.bank)}</b><span>Espèces ${fmt(state.cash)}</span><em>${l?esc25(l.label)+' · <span class="'+((+l.amount)>0?'pos':'')+'">'+((+l.amount)>0?'+':'')+fmt(+l.amount||0)+'</span>':'Aucune opération récente'}</em>`;
  d.onclick=e=>phOpen(app25('Banque'),null,d);return d;}
function appIcon25(a){const bt=mk('button','ic');bt.type='button';bt.dataset.app=a[0];bt.appendChild(icon25(a));bt.appendChild(mk('span',null,a[0]));
  const n=a[0]==='Messages'?totalUnread():0;if(n)bt.appendChild(mk('b','badge',n>99?'99+':n));
  if(a[0]==='Factures'&&typeof walletP58!=='undefined'&&(walletP58.unpaidRent+walletP58.unpaidUtilities)>0)bt.appendChild(mk('b','badge','1'));
  bt.onclick=()=>phOpen(a,null,bt);return bt;}
phHome=function(){
  build25();const was=phApp||P25.cam;phApp=null;phThN=null;P25.contact=null;P25.viewer=null;camOff25();
  const s=$('#ph-scr'),v=$('#ph-appv');s.classList.remove('inapp');tone25('home');
  if(was&&!v.hidden){v.classList.remove('opening','slide');v.classList.add('closing');setTimeout(()=>{if(!phApp){v.hidden=true;v.classList.remove('closing');}},290);}else v.hidden=true;
  const pg=$('#ph-pages'),keep=pg.scrollLeft;pg.innerHTML='';
  const list=APPS.filter(a=>!DOCK25.includes(a[0])&&!(window.HIDE53&&HIDE53(a[0])));
  const p1=mk('div','page');p1.appendChild(wxWidget25());p1.appendChild(walWidget25());list.slice(0,16).forEach(a=>p1.appendChild(appIcon25(a)));pg.appendChild(p1);
  for(let i=16;i<list.length;i+=24){const p=mk('div','page');list.slice(i,i+24).forEach(a=>p.appendChild(appIcon25(a)));pg.appendChild(p);}
  const dots=$('#ph-dots');dots.innerHTML='';[...pg.children].forEach((_,i)=>dots.appendChild(mk('i',i?'':'on')));
  pg.onscroll=()=>{const k=Math.round(pg.scrollLeft/pg.clientWidth);[...dots.children].forEach((d,i)=>d.classList.toggle('on',i===k));};
  pg.scrollLeft=keep;pg.onscroll();
  const dk=$('#ph-dock');dk.innerHTML='';DOCK25.forEach(n=>{const a=app25(n);if(a)dk.appendChild(appIcon25(a));});
  status25();
};
/* ===== écran verrouillé ===== */
function lock25(){
  const lk=$('#ph-lock'),dn=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'][day25(gameMin)%7];
  const notes=[];Object.keys(unread).forEach(n=>{if(unread[n]>0){const t=threads[n]||[];notes.push([n,t.length?t[t.length-1].t:'Nouveau message',unread[n]]);}});
  lk.innerHTML=`<div class="lk">${SV.lockC}</div><div class="day">${dn} · jour ${day25(gameMin)}</div><div class="big">${clockTxt25()}</div><div class="notifs"></div><div class="lbtns"><i>${SV.torch.replace('<svg','<svg width="22" height="22"')}</i><i>${SV.cam.replace('<svg','<svg width="22" height="22"')}</i></div>`;
  const nf=lk.querySelector('.notifs');notes.slice(0,3).forEach(([n,t,c])=>{const d=mk('div','nt');d.appendChild(icon25(app25('Messages')||['Messages']));const x=mk('div');x.innerHTML=`<b>${esc25(n)}${c>1?' ('+c+')':''}<small>maintenant</small></b><span>${esc25(t)}</span>`;d.appendChild(x);nf.appendChild(d);});
  lk.classList.remove('go');lk.hidden=false;$('#ph-scr').classList.add('locked');
  const go=()=>{if(lk.hidden||lk.classList.contains('go'))return;lk.querySelector('.lk').innerHTML=SV.lockO;setTimeout(()=>{lk.classList.add('go');$('#ph-scr').classList.remove('locked');setTimeout(()=>{lk.hidden=true;},480);},notes.length?650:260);};
  lk.onclick=go;setTimeout(go,notes.length?1100:520);}
/* ===== ouverture / fermeture ===== */
togglePhone=function(){
  const ph=$('#phone');if(!ph.hidden){closePanel();return;}if(!started||panelOpen||chatOpen)return;
  build25();panelOpen=true;ph.hidden=false;const d=$('#ph-dev');d.style.animation='none';void d.offsetWidth;d.style.animation='';
  phHome();if(performance.now()-P25.lastClose>45000)lock25();else{$('#ph-lock').hidden=true;$('#ph-scr').classList.remove('locked');}};
{const _cp25=closePanel;closePanel=function(){const ph=$('#phone');if(ph&&!ph.hidden){P25.lastClose=performance.now();camOff25();const lt=P25.lastToast;P25.lastToast=null;_cp25();if(lt&&performance.now()-lt.t<2500&&P25.rawToast)P25.rawToast(lt.msg,lt.kind);const is=$('#ph-island');if(is)is.classList.remove('big');return;}_cp25();};}
phOpen=function(a,how,fromEl){
  if(!a)return;build25();const v=$('#ph-appv'),s=$('#ph-scr'),b=$('#ph-body'),same=phApp===a&&!v.hidden&&!how;
  const keep=same?b.scrollTop:0;phApp=a;if(!how||how!=='thread')phThN=null;
  const tn=TINT25[a[0]]||[a[2].split(',')[0],a[2].split(',')[1]];s.style.setProperty('--tint',tn[0]);s.style.setProperty('--tint2',tn[1]);s.style.setProperty('--tint-on',tn[2]||'#fff');
  s.classList.add('inapp');s.classList.remove('camm');tone25(DARK25.has(a[0])?'dark':'light');
  v.classList.remove('closing','thr','notitle','scrolled');
  if(!same){v.classList.remove('opening','slide');void v.offsetWidth;
    if(how==='slide')v.classList.add('slide');
    else{const src=fromEl||document.querySelector('#ph-homev .ic[data-app="'+CSS.escape(a[0])+'"]');if(src&&v.hidden){const r=src.getBoundingClientRect(),q=s.getBoundingClientRect(),k=q.width/s.offsetWidth;v.style.transformOrigin=((r.left+r.width/2-q.left)/k)+'px '+((r.top+r.height/2-q.top)/k)+'px';}else v.style.transformOrigin='50% 50%';v.classList.add('opening');}}
  v.hidden=false;$('#ph-back').hidden=false;$('#ph-back').querySelector('span').textContent='Accueil';$('#ph-title').textContent=a[0];
  v.querySelectorAll('.fab').forEach(x=>x.remove());b.innerHTML='';b.className='pb';
  const r=RENDER25[a[0]];
  if(!(r&&r.noTitle))b.appendChild(mk('h1','ph-lt',a[0]));else v.classList.add('notitle');
  try{(r&&r.fn?r.fn:a[3])(b);}catch(e){console.warn('appli',a[0],e);b.appendChild(mk('p','dim','Cette appli a rencontré un souci.'));}
  b.scrollTop=keep;
};
function tick25(){if(phApp&&phApp[0]==='Livraison'&&P25.order&&performance.now()>P25.order.end+300){P25.order=null;phOpen(phApp);}}
/* ===== île dynamique ===== */
function island25(html,ms){const is=$('#ph-island'),c=$('#ph-islc');if(!is)return;c.innerHTML=html;is.classList.remove('call');is.classList.add('big');clearTimeout(P25.islT);P25.islT=setTimeout(()=>{is.classList.remove('big');if(P25.call)islandCall25();},ms||3600);}
function islandCall25(){const is=$('#ph-island'),c=$('#ph-islc');if(!is)return;if(!P25.call){is.classList.remove('call');c.innerHTML='';return;}const sec=Math.floor((performance.now()-P25.call.t0)/1000);c.innerHTML=SV.phone.replace('<svg','<svg width="16" height="16" style="color:#30d158"')+'<b>'+String(Math.floor(sec/60)).padStart(1,'0')+':'+String(sec%60).padStart(2,'0')+'</b>';is.classList.add('call');}
/* ===== rendus d'applis ===== */
const RENDER25={};
function grp25(b){const g=mk('div','grp');b.appendChild(g);return g;}
function row25(g,o){const r=mk(o.onClick?'button':'div','row');if(o.onClick){r.type='button';r.onclick=o.onClick;}if(o.disabled)r.disabled=true;
  if(o.lead)r.appendChild(o.lead);const tx=mk('div','tx');tx.appendChild(mk('b',null,o.title));if(o.sub!=null){const s=mk('span',o.wrap?'wrap':null,o.sub);tx.appendChild(s);}r.appendChild(tx);
  if(o.right!=null){const rt=mk('span','rt'+(o.rcls?' '+o.rcls:''));if(typeof o.right==='string')rt.textContent=o.right;else rt.appendChild(o.right);r.appendChild(rt);}
  if(o.onClick&&!o.noChev)r.appendChild(mk('i','chev'));g.appendChild(r);return r;}
function sq25(bg,svg){const s=mk('i','sq');s.style.background=bg;s.innerHTML=svg;return s;}
function srch25(ph,val,on){const d=mk('label','srch');d.innerHTML=SV.search.replace('<svg','<svg width="18" height="18"');const i=document.createElement('input');i.placeholder=ph;i.value=val||'';i.oninput=()=>on(i.value);d.appendChild(i);return [d,i];}
/* --- Messages --- */
function stamp25(n){(threads[n]||[]).forEach(m=>{if(m.at==null)m.at=Math.floor(gameMin);});}
function rel25(min){if(min==null)return '';const dd=day25(gameMin)-day25(min);return dd<=0?hm25(min):dd===1?'Hier':'Jour '+day25(min);}
appMsg=function(b){
  const [s]=srch25('Rechercher','',q=>{[...b.querySelectorAll('.msg-row')].forEach(r=>r.hidden=!r.dataset.n.toLowerCase().includes(q.toLowerCase()));});b.appendChild(s);
  if(!state.friends.length){b.appendChild(h25(`<div class="empty">${SV.bubble.replace('<svg','<svg style="color:#c7c7cc"')}<b>Aucune conversation</b>Parle aux habitants (touche E) pour te faire des amis, ils apparaîtront ici.</div>`));return;}
  const list=state.friends.slice().sort((x,y)=>{const a=(threads[x]||[]).slice(-1)[0],c=(threads[y]||[]).slice(-1)[0];return((c&&c.at)||-1)-((a&&a.at)||-1);});
  list.forEach(n=>{stamp25(n);const t=threads[n]||[],l=t[t.length-1],u=unread[n]||0,r=mk('button','msg-row'+(u?' unr':''));r.type='button';r.dataset.n=n;
    r.appendChild(av25(n));const tx=mk('div','tx');tx.innerHTML=`<b>${esc25(n)}<small>${l?rel25(l.at):''} ›</small></b><span>${l?(l.me?'Toi : ':'')+esc25(l.t):'Nouveau contact · dis bonjour !'}</span>`;r.appendChild(tx);
    r.onclick=()=>{unread[n]=0;P25.threadFrom='Messages';phThread(n);};b.appendChild(r);});
};
RENDER25['Messages']={fn:b=>appMsg(b)};
phThread=function(n){
  build25();const a=app25('Messages')||APPS[0],v=$('#ph-appv'),s=$('#ph-scr'),b=$('#ph-body'),fresh=phThN!==n||v.hidden;
  if(phApp!==a||v.hidden||phThN!==n){s.style.setProperty('--tint','#007aff');}
  phApp=a;phThN=n;unread[n]=0;s.classList.add('inapp');tone25('light');
  v.classList.remove('closing','opening','scrolled');if(fresh){v.classList.remove('slide');void v.offsetWidth;v.classList.add('slide');}
  v.classList.add('thr');v.hidden=false;$('#ph-back').hidden=false;$('#ph-back').querySelector('span').textContent='';
  const tt=$('#ph-title');tt.innerHTML='';const hd=mk('div','thr-hd');hd.appendChild(av25(n));hd.appendChild(mk('span',null,n+' ›'));tt.appendChild(hd);
  stamp25(n);const t=threads[n]||[],prevLen=+(b.dataset.len||0),sameThread=b.dataset.th===n;
  $('#ph-appv').querySelectorAll('.fab').forEach(x=>x.remove());b.innerHTML='';b.className='pb thread';b.dataset.th=n;b.dataset.len=t.length;
  b.appendChild(mk('div','stamp',t.length?'Aujourd’hui '+hm25(t[0].at):'iMessage · '+n));
  t.forEach((m,i)=>{const nx=t[i+1],tail=!nx||!!nx.me!==!!m.me,x=mk('div','bub'+(m.me?' me':'')+(tail?' tail':'')+(sameThread&&i>=prevLen?' new':''),m.t);b.appendChild(x);});
  const last=t[t.length-1];
  if(last&&last.me&&performance.now()-(P25.sent[n]||0)<1700)b.appendChild(h25('<div class="bub tail typing"><i></i><i></i><i></i></div>'));
  else if(last&&last.me)b.appendChild(mk('div','dlv','Distribué'));
  const c=mk('div','compose'),ch=mk('div','chips');
  [['Salut, ça va ?',0],['On sort au Club Néon ?',1],['Je t’offre le resto · '+fmt(15),2]].forEach(([q,k])=>{const x=mk('button','chip',q,()=>sendMsg(n,q,k));x.type='button';if(k===2)x.disabled=state.cash<15;ch.appendChild(x);});
  c.appendChild(ch);const bar=mk('div','bar-in'),pl=mk('button','plus');pl.type='button';pl.innerHTML=SV.plus.replace('<svg','<svg width="18" height="18"');pl.onclick=()=>ch.scrollTo({left:0,behavior:'smooth'});bar.appendChild(pl);
  const w=mk('div','inw'),inp=document.createElement('input');inp.placeholder='iMessage';inp.maxLength=120;const sd=mk('button','send');sd.type='button';sd.innerHTML=SV.up.replace('<svg','<svg width="16" height="16"');sd.disabled=true;
  inp.oninput=()=>{sd.disabled=!inp.value.trim();};const go=()=>{const q=inp.value.trim();if(!q)return;sendMsg(n,q,0);};sd.onclick=go;inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go();}};
  w.appendChild(inp);w.appendChild(sd);bar.appendChild(w);c.appendChild(bar);b.appendChild(c);
  b.scrollTop=b.scrollHeight;requestAnimationFrame(()=>{b.scrollTop=b.scrollHeight;});
  if(typeof savePhoneP58==='function')savePhoneP58();
};
{const _sm25=sendMsg;sendMsg=function(n,t,k){P25.sent[n]=performance.now();_sm25(n,t,k);const th=threads[n];if(th)th.forEach(m=>{if(m.at==null)m.at=Math.floor(gameMin);});
  setTimeout(()=>{const th2=threads[n];if(th2)th2.forEach(m=>{if(m.at==null)m.at=Math.floor(gameMin);});if(!$('#phone').hidden&&phThN===n)phThread(n);},1750);};}
{const _in25=incoming;incoming=function(n){_in25(n);const t=(threads[n]||[]).slice(-1)[0];if(t&&t.at==null)t.at=Math.floor(gameMin);
  if(!$('#phone').hidden){if(phThN===n){unread[n]=0;phThread(n);return;}const d=document.createElement('div');d.appendChild(av25(n));
    island25(d.innerHTML+`<div class="isl-t"><b>${esc25(n)}</b><span>${esc25(t?t.t:'')}</span></div>`,3800);if(!phApp)phHome();}};}
/* --- Banque --- */
function cardNo25(){let h=7;for(const c of String(state.name))h=(h*33+c.charCodeAt(0))%10000;return String(h).padStart(4,'0');}
function txIcon25(l){l=String(l).toLowerCase();return /salaire|mission|paie|prime/.test(l)?'💼':/dépôt/.test(l)?'⬇️':/retrait/.test(l)?'🏧':/virement/.test(l)?'↗️':/livraison|resto|menu/.test(l)?'🍔':/loyer|appartement|bail|immobil/.test(l)?'🏠':/factur|charges|eau|électr|impay/.test(l)?'🧾':/mobilier/.test(l)?'🛋️':/entreprise|stock|embauche/.test(l)?'🏪':/voiture|essence|garage|taxi/.test(l)?'🚗':/amende|caution/.test(l)?'⚖️':/médic|urgence|hôpital/.test(l)?'🩺':'💳';}
function bank25(b){
  const W=typeof walletP58!=='undefined'?walletP58:{ledger:[],unpaidRent:0,unpaidUtilities:0},tx=(l,a,acc)=>{if(typeof econTxP58==='function')econTxP58(l,a,acc);},re=()=>phOpen(app25('Banque'));
  const card=h25(`<div class="bk-card"><div class="bk-top"><span>BANQUE AURORE</span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><path d="M8 7.5a6.5 6.5 0 0 1 0 9M11.5 5a10 10 0 0 1 0 14M15 3a13 13 0 0 1 0 18"/></svg></div><div class="chip-c"></div><div class="num">•••• •••• •••• ${cardNo25()}</div><div class="bk-bot"><span>${esc25(state.name)}<br><small style="opacity:.7">Débit · exp 09/29</small></span><span class="nw">AURORA</span></div></div>`);
  b.appendChild(card);
  b.appendChild(h25(`<div class="bk-bal"><small>Solde disponible</small><b>${fmt(state.bank)}</b><span>Espèces sur toi · ${fmt(state.cash)}</span></div>`));
  const due=(W.unpaidRent||0)+(W.unpaidUtilities||0),acts=mk('div','acts');
  const A=(id,label,svg,fn,off,dot)=>{const x=mk('button','act'+(P25.bankMode===id?' on':''));x.type='button';x.innerHTML=`<i>${svg}</i>${label}`+(dot?'<span class="dot"></span>':'');x.disabled=!!off;x.onclick=fn;acts.appendChild(x);};
  A('dep','Déposer',SV.arrowIn,()=>{if(noNet25()){toast('Pas de réseau.','warn');return;}if(state.cash>0){const n=state.cash;state.cash=0;if(typeof econCreditP58==='function')econCreditP58(n,'Dépôt espèces',true);else state.bank+=n;toast('Dépôt de '+fmt(n)+' effectué.','good');re();}},state.cash<=0);
  A('ret','Retirer',SV.arrowOut,()=>{P25.bankMode=P25.bankMode==='ret'?null:'ret';re();},state.bank<20);
  A('vir','Virement',SV.send,()=>{P25.bankMode=P25.bankMode==='vir'?null:'vir';re();},!state.bank);
  A('fac','Factures',SV.doc,()=>{closePanel();if(typeof propertyPanelP58==='function')propertyPanelP58();},false,due>0);
  b.appendChild(acts);
  if(P25.bankMode==='ret'){const sh=mk('div','sheet25');sh.appendChild(mk('h4',null,'Retrait au distributeur'));const sg=mk('div','seg');
    [20,50,200,500].forEach(n=>{const x=mk('button',null,fmt(n),()=>{if(noNet25()){toast('Pas de réseau.','warn');return;}if(state.bank<n)return;state.bank-=n;state.cash+=n;tx('Retrait espèces',-n,'Banque');toast('Retrait de '+fmt(n)+'.','good');P25.bankMode=null;re();});x.type='button';x.disabled=state.bank<n;sg.appendChild(x);});sh.appendChild(sg);b.appendChild(sh);}
  if(P25.bankMode==='vir'){const sh=mk('div','sheet25');sh.appendChild(mk('h4',null,'Virement instantané'));const fr=state.friends||[];
    if(!fr.length)sh.appendChild(mk('p','dim','Ajoute des amis pour leur envoyer de l’argent.'));
    else{const sel=document.createElement('select');sel.className='ph-select';fr.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});const inp=document.createElement('input');inp.className='ph-input';inp.type='number';inp.min='1';inp.max=String(Math.floor(state.bank));inp.placeholder='Montant ($)';inp.inputMode='numeric';
      const go=mk('button','pbtn hot','Envoyer',()=>{const n=Math.floor(+inp.value),to=sel.value;if(noNet25()){toast('Pas de réseau.','warn');return;}if(!n||n<1||n>state.bank){toast('Solde insuffisant ou montant invalide.','warn');return;}state.bank-=n;tx('Virement envoyé à '+to,-n,'Banque');toast('Virement de '+fmt(n)+' envoyé à '+to+'.','good');P25.bankMode=null;re();});go.type='button';
      sh.appendChild(sel);sh.appendChild(inp);sh.appendChild(go);}
    b.appendChild(sh);}
  if(due>0){const g=grp25(b);row25(g,{lead:sq25('#ff3b30',SV.doc),title:'Impayés à régler',sub:'Loyer et charges en retard',right:fmt(due),rcls:'neg',onClick:()=>{closePanel();if(typeof propertyPanelP58==='function')propertyPanelP58();}});}
  b.appendChild(mk('div','sec','Transactions'));
  const L=(W.ledger||[]).slice(0,20);
  if(!L.length)b.appendChild(mk('p','dim','Tes dépôts, virements, salaires et factures apparaîtront ici.'));
  else{const g=grp25(b);g.style.setProperty('--sep','68px');L.forEach(t=>{const a=+t.amount||0,ic=mk('i','ci',txIcon25(t.label));row25(g,{lead:ic,title:t.label,sub:(t.account||'')+(t.time!=null&&typeof econFmtTimeP58==='function'?' · '+econFmtTimeP58(t.time):''),right:(a>0?'+':a<0?'−':'')+fmt(Math.abs(a)),rcls:a>0?'pos':'neg'});});}
}
RENDER25['Banque']={fn:bank25};RENDER25['Compte']={fn:bank25};
/* --- Plan --- */
function plan25(b){
  b.className='pb map25';const mp=mk('div','mp'),cv=document.createElement('canvas'),S=660;cv.width=S;cv.height=S;mp.appendChild(cv);
  try{if(typeof drawProMap==='function')drawProMap(cv.getContext('2d'),S,false);}catch(e){}
  let listEl;const [sr,inp]=srch25('Rechercher un lieu',P25.mapQ,q=>{P25.mapQ=q;fill();});mp.appendChild(sr);
  const lc=mk('button','loc');lc.type='button';lc.innerHTML=SV.nav.replace('<svg','<svg width="20" height="20"');lc.onclick=()=>{P25.mapQ='';phOpen(phApp);};mp.appendChild(lc);
  b.appendChild(mp);const sh=mk('div','mp-sheet');sh.appendChild(mk('i','grab'));b.appendChild(sh);
  if(wp){const d=Math.round(Math.hypot(wp.x-player.x,wp.z-player.z)),r=mk('div','route');r.innerHTML=`<svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M12 3l7 7-1.4 1.4L13 6.8V21h-2V6.8l-4.6 4.6L5 10z"/></svg><div class="tx"><b>${d} m</b><span>vers ${esc25(wp.l||'repère')} · ${Math.max(1,Math.round(d/80))} min à pied</span></div>`;const x=mk('button',null,'Fin',()=>{wp=null;phOpen(phApp);});x.type='button';r.appendChild(x);sh.appendChild(r);}
  sh.appendChild(mk('div','sec','Lieux à proximité'));listEl=grp25(sh);listEl.style.setProperty('--sep','60px');
  function fill(){listEl.innerHTML='';const q=(P25.mapQ||'').toLowerCase().trim();
    spots.filter(s=>s.label&&(!q||s.label.toLowerCase().includes(q))).map(s=>[s,Math.hypot(s.x-player.x,s.z-player.z)]).sort((a,c)=>a[1]-c[1]).slice(0,q?40:25).forEach(([s,d])=>{
      const pin=mk('i','pin');pin.style.background='#'+(s.color||0x007aff).toString(16).padStart(6,'0');pin.innerHTML=SV.pin.replace('currentColor','#fff');
      row25(listEl,{lead:pin,title:s.label,sub:Math.round(d)+' m · '+Math.max(1,Math.round(d/80))+' min à pied'+(wp&&wp.l===s.label?' · itinéraire actif':''),onClick:()=>{wp={x:s.x,z:s.z,l:s.label};toast('GPS vers '+s.label,'good');phOpen(phApp);}});});
    if(!listEl.children.length)listEl.appendChild(mk('div','row','Aucun lieu trouvé.'));}
  fill();
}
RENDER25['Plan']={fn:plan25,noTitle:true};
/* --- Photos + appareil photo --- */
function vfDraw25(){const v=P25.vf;if(!P25.cam||!v||!v.isConnected||typeof renderer==='undefined')return;const src=renderer.domElement,W=v.clientWidth,H=v.clientHeight;if(!W||!H)return;const d=Math.min(2,devicePixelRatio||1);if(v.width!==Math.round(W*d)){v.width=Math.round(W*d);v.height=Math.round(H*d);}
  const sw=src.width,sh=src.height,ar=W/H;let cw=sh*ar,ch=sh;if(cw>sw){cw=sw;ch=sw/ar;}const z=P25.zoom||1;cw/=z;ch/=z;if(z<1){cw=Math.min(sw,cw);ch=Math.min(sh,ch);}
  try{v.getContext('2d').drawImage(src,(sw-cw)/2,(sh-ch)/2,cw,ch,0,0,v.width,v.height);}catch(e){}}
function hookRender25(){if(typeof renderer==='undefined'||!renderer||renderer.__p25)return;const r=renderer.render.bind(renderer);renderer.render=function(a,b){r(a,b);if(P25.cam)vfDraw25();};renderer.__p25=1;}
function camOff25(){if(!P25.cam)return;P25.cam=false;P25.vf=null;const ph=$('#phone'),s=$('#ph-scr');if(ph)ph.classList.remove('cam');if(s)s.classList.remove('camm');}
function photos25(b){
  if(P25.viewer!=null&&gallery[P25.viewer]){const v=mk('div','viewer'),im=document.createElement('img');im.src=gallery[P25.viewer];v.appendChild(im);const x=mk('button',null,'‹ Photothèque',()=>{P25.viewer=null;phOpen(phApp);});x.type='button';v.appendChild(x);b.appendChild(v);tone25('dark');return;}
  const t=b.querySelector('.ph-lt');if(t)t.innerHTML='Photothèque<small>'+(gallery.length?gallery.length+' photo'+(gallery.length>1?'s':''):'Aucune photo')+'</small>';
  if(!gallery.length)b.appendChild(h25(`<div class="empty">${SV.cam.replace('<svg','<svg style="color:#c7c7cc"')}<b>Pas encore de photos</b>Cadre la ville et appuie sur le déclencheur. Tes clichés apparaîtront ici.</div>`));
  else{const g=mk('div','pgrid');gallery.forEach((u,i)=>{const x=mk('button');x.type='button';const im=document.createElement('img');im.src=u;im.alt='Photo '+(i+1);x.appendChild(im);x.onclick=()=>{P25.viewer=i;phOpen(phApp);};g.appendChild(x);});b.appendChild(g);}
  const f=mk('button','fab');f.type='button';f.innerHTML=SV.cam+'Appareil photo';f.onclick=()=>camera25();$('#ph-appv').appendChild(f);
}
function camera25(){
  const ph=$('#phone'),s=$('#ph-scr'),b=$('#ph-body'),v=$('#ph-appv');P25.cam=true;ph.classList.add('cam');s.classList.add('camm');tone25('dark');
  v.querySelectorAll('.fab').forEach(x=>x.remove());b.innerHTML='';b.className='pb';
  const c=h25(`<div class="cam25"><div class="ct">${SV.bolt.replace('<svg','<svg width="20" height="20"')}<span>HD</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/></svg></div><div class="vf"><canvas class="vfc"></canvas><div class="zoom"><i data-z=".6">.5</i><i data-z="1" class="on">1×</i><i data-z="2">2</i></div></div><div class="cb"><div class="modes"><span>VIDÉO</span><b>PHOTO</b><span>PORTRAIT</span><span>PANO</span></div><div class="ctrl"><button class="thumb" type="button" aria-label="Photothèque"></button><button class="shut" type="button" aria-label="Prendre une photo"></button><button class="flip" type="button" aria-label="Retourner">${SV.flip.replace('<svg','<svg width="22" height="22"')}</button></div></div></div>`);
  b.appendChild(c);P25.vf=c.querySelector('.vfc');P25.zoom=1;c.querySelectorAll('.zoom i').forEach(z=>z.onclick=()=>{P25.zoom=+z.dataset.z;c.querySelectorAll('.zoom i').forEach(q=>{q.classList.toggle('on',q===z);q.textContent=q.dataset.z==='.6'?'.5':q.dataset.z==='1'?'1':'2';});z.textContent=z.textContent+'×';});const th=c.querySelector('.thumb'),setT=()=>{th.style.backgroundImage=gallery[0]?'url('+gallery[0]+')':'none';};setT();
  th.onclick=()=>{camOff25();phOpen(app25('Photos'),'slide');};
  c.querySelector('.flip').onclick=()=>toast('Selfie : ton personnage sourit !');
  c.querySelector('.shut').onclick=()=>{shotReq=true;state.fun=Math.min(100,state.fun+3);const f=mk('div','flash');s.appendChild(f);setTimeout(()=>f.remove(),400);tone(1800,0.04,'square',0.04);setTimeout(setT,120);setTimeout(setT,400);};
}
appPhoto=function(b){photos25(b);};
RENDER25['Photos']={fn:photos25};
/* --- Réglages --- */
appSet=function(b){
  const p=mk('div','prof');p.appendChild(av25(state.name));const x=mk('div');x.innerHTML=`<b>${esc25(state.name)}</b><span>Compte Aurore · ${state.friends.length} ami${state.friends.length>1?'s':''} · ${fmt(state.cash+state.bank)}</span>`;p.appendChild(x);b.appendChild(p);
  b.appendChild(mk('div','sec','Fond d’écran'));const w=mk('div','walls25');w.style.borderRadius='12px';
  WALLS.forEach((g,i)=>{const t=mk('button',i===wallN?'on':'');t.type='button';t.style.background=g;t.title=WALLN25[i]||'';t.onclick=()=>{wallN=i;applyWall();phOpen(phApp);};w.appendChild(t);});b.appendChild(w);
  const g1=grp25(b);g1.style.setProperty('--sep','60px');const sw=mk('button','sw'+(muted?'':' on'));sw.type='button';sw.setAttribute('role','switch');sw.setAttribute('aria-checked',String(!muted));sw.onclick=()=>{muted=!muted;phOpen(phApp);};
  row25(g1,{lead:sq25('#ff3b30',SV.sound),title:'Sons et vibrations',right:sw});
  row25(g1,{lead:sq25('#34c759',SV.battery),title:'Batterie',right:bat25()+' %'});
  row25(g1,{lead:sq25('#34c759',SV.antenna),title:'Réseau mobile',right:noNet25()?'Pas de service':'Aurore 5G'});
  row25(g1,{lead:sq25('#007aff',SV.person),title:'Contacts',right:String(state.friends.length),onClick:()=>phOpen(app25('Contacts'),'slide')});
  const g2=grp25(b);g2.style.setProperty('--sep','60px');
  row25(g2,{lead:sq25('#8e8e93',SV.info),title:'Version du jeu',right:'v25'});
  b.appendChild(mk('div','sec','Nouveautés'));const g3=grp25(b);
  CHANGELOG.slice(0,8).forEach(l=>row25(g3,{title:l[0],sub:l[1],wrap:true}));
};
RENDER25['Réglages']={fn:b=>appSet(b)};
/* --- Livraison --- */
const FOOD25=[['Tacos du Port','sand',35,'🌮','linear-gradient(135deg,#ffcf70,#ff8a3d)','4,7','10–15 min'],['Pizza Aurore','menu',55,'🍕','linear-gradient(135deg,#ff9b8a,#d8322b)','4,8','15–20 min'],['Poisson braisé','fish',45,'🐟','linear-gradient(135deg,#8fe3ff,#2a8bd6)','4,6','20–25 min']];
appFood=function(b){
  b.appendChild(h25(`<div class="addr"><small>Livrer à</small><b>${typeof walletP58!=='undefined'&&(walletP58.homeOwned||walletP58.lease)?'Appartement Aurore':'Ta position'} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg></b></div>`));
  if(P25.order){const o=P25.order,now=performance.now(),p=Math.min(100,(now-o.t0)/(o.end-o.t0)*100),left=Math.max(0,Math.ceil((o.end-now)/1000));
    const tr=h25(`<div class="track"><span>Commande en cours · ${esc25(o.name)}</span><b>${left>0?'Arrivée dans '+left+' s':'Livrée !'}</b><div class="pg"><i style="--from:${p.toFixed(1)}%;animation-duration:${Math.max(.1,(o.end-now)/1000)}s"></i></div><div class="steps"><span>Préparation</span><span>En route</span><span>Livrée</span></div></div>`);b.appendChild(tr);}
  b.appendChild(mk('div','sec','Restaurants à Port-Aurore'));
  FOOD25.forEach(([name,id,food,emo,bg,rate,eta])=>{const pr=(typeof walletP58!=='undefined'&&walletP58.prices&&walletP58.prices[id]!=null?walletP58.prices[id]:{sand:9,menu:14,fish:12}[id])+4;
    const c=h25(`<div class="resto"><div class="hero" style="background:${bg}">${emo}<span class="eta">${eta}</span></div><div class="bd"><div class="tx"><b>${name}</b><span>★ ${rate} · frais ${fmt(4)} inclus · +${food} faim</span></div></div></div>`);
    const x=mk('button',null,'Commander · '+fmt(pr),()=>{if(noNet25()){toast('Pas de réseau.','warn');return;}if(state.cash<pr){toast('Pas assez de cash.','warn');return;}if(P25.order){toast('Une commande est déjà en route.','warn');return;}
      state.cash-=pr;if(typeof econTxP58==='function')econTxP58('Livraison · '+name,-pr,'Cash');toast('Commande envoyée : '+name,'good');P25.order={name,t0:performance.now(),end:performance.now()+7000};phOpen(phApp);
      setTimeout(()=>{state.hunger=Math.min(100,state.hunger+food);toast(name+' livré. +'+food+' de faim','good');if(!$('#phone').hidden)island25(`<span style="font-size:28px">${emo}</span><div class="isl-t"><b>Livraison</b><span>${esc25(name)} est arrivé !</span></div>`,3000);},7000);});
    x.type='button';x.disabled=state.cash<pr||!!P25.order;c.querySelector('.bd').appendChild(x);b.appendChild(c);});
  b.appendChild(mk('p','dim','Paiement en espèces à la commande. Prix alignés sur la Supérette du Port.'));
};
RENDER25['Livraison']={fn:b=>appFood(b)};
/* --- Radio --- */
const ART25=['linear-gradient(135deg,#ff6b6b,#7b2ff7)','linear-gradient(135deg,#00c6ff,#0045d6)','linear-gradient(135deg,#f7971e,#ffd200)','linear-gradient(135deg,#11998e,#38ef7d)','linear-gradient(135deg,#fc466b,#3f5efb)','linear-gradient(135deg,#232526,#8e9eab)'];
appRadio=function(b){
  if(typeof STATIONS==='undefined'){b.appendChild(mk('p','dim','Radio indisponible.'));return;}
  const on=radioN>=0,i=on?radioN:0,st=STATIONS[i],fq=k=>(88.4+k*2.6).toFixed(1).replace('.',',');
  const np=h25(`<div class="np"><div class="art${on?'':' off'}" style="background:${ART25[i%ART25.length]}">${esc25(initials25(st.n))}<small>${fq(i)} FM</small></div><b>${esc25(st.n)}</b><span><span class="eq${on?'':' off'}"><i></i><i></i><i></i><i></i></span>${on?'En direct':'En pause'} · ${st.bpm} BPM</span></div>`);b.appendChild(np);
  const tr=mk('div','tr'),B=(cls,svg,fn)=>{const x=mk('button',cls);x.type='button';x.innerHTML=svg;x.onclick=fn;tr.appendChild(x);};
  B('sk',SV.prev,()=>{radioPlay((i-1+STATIONS.length)%STATIONS.length);phOpen(phApp);});
  B('pp',on?SV.pause:SV.play,()=>{radioPlay(on?-1:i);phOpen(phApp);});
  B('sk',SV.next,()=>{radioPlay((i+1)%STATIONS.length);phOpen(phApp);});b.appendChild(tr);
  b.appendChild(mk('div','sec','Stations'));const g=grp25(b);g.style.setProperty('--sep','68px');
  STATIONS.forEach((s,k)=>{const art=mk('i','sq');art.style.cssText='width:40px;height:40px;border-radius:8px;font:700 14px var(--pf);color:#fff;background:'+ART25[k%ART25.length];art.textContent=initials25(s.n);
    row25(g,{lead:art,title:s.n,sub:fq(k)+' FM · '+s.bpm+' BPM',right:k===radioN?h25('<span class="eq"><i></i><i></i><i></i><i></i></span>'):'',onClick:()=>{radioPlay(k);phOpen(phApp);},noChev:true});});
};
RENDER25['Radio']={fn:b=>appRadio(b)};
/* --- Appels + écran d'appel --- */
const SERV25=[['Urgences','112 · secours médicaux','#ff3b30'],['Commissariat','17 · police de Port-Aurore','#0a84ff'],['Taxi','Réserver une course','#ffcc00'],['Agence Aurore','Agence immobilière','#5856d6'],['Auto-école','Leçons et permis','#ff9500']];
function callScreen25(name){
  build25();const s=$('#ph-scr');const old=s.querySelector('.call25');if(old)old.remove();
  const c=mk('div','call25');c.appendChild(av25(name));c.appendChild(mk('b',null,name));const st=mk('span',null,'appel en cours…');c.appendChild(st);
  c.appendChild(h25(`<div class="kp"><i>${SV.mute}silence</i><i>${SV.pad}clavier</i><i>${SV.spk}haut-parleur</i><i>${SV.plus}ajouter</i><i>${SV.video}FaceTime</i><i>${SV.person}contacts</i></div>`));
  const hg=mk('button','hang');hg.type='button';hg.innerHTML=SV.phone.replace('currentColor','#fff');c.appendChild(hg);s.appendChild(c);
  P25.call={t0:performance.now()+900,name};const tk=setInterval(()=>{if(!P25.call){clearInterval(tk);return;}const sec=Math.floor((performance.now()-P25.call.t0)/1000);if(sec>=0)st.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');},250);
  const end=()=>{if(!c.isConnected)return;clearInterval(tk);P25.call=null;islandCall25();c.classList.add('end');setTimeout(()=>c.remove(),340);};hg.onclick=end;setTimeout(end,3400);}
if(typeof callContactP58==='function'){const _cc25=callContactP58;callContactP58=function(name){
  if(['Taxi','Agence Aurore','Auto-école'].includes(name)){_cc25(name);return;}
  if(noNet25()){toast('Réseau indisponible pendant la coupure.','warn');return;}
  if(!$('#phone').hidden)callScreen25(name);_cc25(name);};}
function calls25(b){
  const fr=state.friends||[];b.appendChild(mk('div','sec','Favoris'));
  if(fr.length){const g=grp25(b);g.style.setProperty('--sep','70px');fr.forEach(n=>row25(g,{lead:av25(n),title:n,sub:'mobile',right:h25(`<span style="color:var(--tint)">${SV.phone.replace('<svg','<svg width="20" height="20"')}</span>`),onClick:()=>callContactP58(n),noChev:true}));}
  else b.appendChild(mk('p','dim','Tes amis apparaîtront ici.'));
  b.appendChild(mk('div','sec','Services'));const g2=grp25(b);g2.style.setProperty('--sep','62px');
  SERV25.forEach(([n,sub,c])=>row25(g2,{lead:sq25(c,SV.phone),title:n,sub,onClick:()=>callContactP58(n)}));
  const rc=(typeof walletP58!=='undefined'&&walletP58.calls||[]).slice(-10).reverse();
  if(rc.length){b.appendChild(mk('div','sec','Récents'));const g3=grp25(b);rc.forEach(c=>row25(g3,{title:c.name,sub:c.result,wrap:true,right:c.time!=null?rel25(c.time):''}));}
}
RENDER25['Appels']={fn:calls25};
/* --- Contacts --- */
function contacts25(b){
  const fr=state.friends||[];
  if(P25.contact){const n=P25.contact,srv=SERV25.find(s=>s[0]===n),c=mk('div','ccard');c.appendChild(av25(n,'l'));c.appendChild(mk('b',null,n));c.appendChild(mk('span',null,srv?srv[1]:'Ami · Port-Aurore'));b.querySelector('.ph-lt').remove();b.appendChild(c);
    const ac=mk('div','cacts'),A=(l,svg,fn,off)=>{const x=mk('button');x.type='button';x.innerHTML=svg+l;x.onclick=fn;x.disabled=!!off;ac.appendChild(x);};
    A('message',SV.bubble,()=>{if(!threads[n])threads[n]=[];P25.threadFrom='Contacts';phThread(n);},!fr.includes(n));A('appeler',SV.phone,()=>callContactP58(n));A('virement',SV.card,()=>{P25.bankMode='vir';phOpen(app25('Banque'),'slide');},!fr.includes(n));b.appendChild(ac);
    const g=grp25(b);row25(g,{title:'mobile',sub:'06 '+String(Math.abs(n.length*7919+n.charCodeAt(0)*31)%100).padStart(2,'0')+' 42 '+String(n.charCodeAt(n.length-1)%100).padStart(2,'0')+' 18'});
    $('#ph-back').querySelector('span').textContent='Contacts';return;}
  let q='';const [s]=srch25('Rechercher','',v=>{q=v.toLowerCase();fill();});b.appendChild(s);
  const card=mk('div','prof');card.appendChild(av25(state.name));const x=mk('div');x.innerHTML=`<b>${esc25(state.name)}</b><span>Ma fiche</span>`;card.appendChild(x);b.appendChild(card);
  const box=mk('div');box.style.cssText='display:flex;flex-direction:column;gap:8px';b.appendChild(box);
  function fill(){box.innerHTML='';const all=[...new Set([...fr,...SERV25.map(s=>s[0])])].filter(n=>n.toLowerCase().includes(q)).sort((a,c)=>a.localeCompare(c,'fr'));
    const g=grp25(box);g.style.setProperty('--sep','68px');let L='';all.forEach(n=>{const l=n[0].toUpperCase();if(l!==L){L=l;g.appendChild(mk('div','letter',l));}
      const r=row25(g,{lead:av25(n,'s'),title:n,sub:fr.includes(n)?null:'Service public',onClick:()=>{P25.contact=n;phOpen(phApp,'slide');}});});
    if(!all.length)box.appendChild(mk('p','dim','Aucun contact trouvé.'));}
  fill();
}
RENDER25['Contacts']={fn:contacts25};
/* ===== branchements ===== */
APPS.forEach(a=>{if(a[0]==='Messages')a[3]=appMsg;if(a[0]==='Photos')a[3]=appPhoto;if(a[0]==='Réglages')a[3]=appSet;if(a[0]==='Livraison')a[3]=appFood;if(a[0]==='Radio')a[3]=appRadio;});
{const _bp25=bindPhone;bindPhone=function(){build25();hookRender25();try{_bp25();}catch(e){console.warn('v25 phone',e);}
  $('#ph-btn').onclick=togglePhone;const bp=$('#b-phone');if(bp)bp.onclick=togglePhone;const s=document.querySelector('.intro h1 span');if(s)s.textContent='JEU DE RÔLE · v25';
  $('#ph-home').onclick=()=>{if(P25.call)return;if(phApp||P25.cam)phHome();else closePanel();};$('#ph-back').onclick=()=>back25();applyWall();};}
if(typeof gpOverlay==='function'){const _go25=gpOverlay;gpOverlay=function(){const r=_go25();if(r)return r;const p=document.getElementById('phone');return p&&!p.hidden?p:null;};}
CHANGELOG.unshift(['v25','Téléphone réaliste : coque titane, Dynamic Island, écran verrouillé, widgets, icônes dessinées et applis natives (Messages, Banque, Plan, Photos, Appels…)']);

/* notifications du jeu affichées dans l'île dynamique quand le téléphone est ouvert */
if(typeof toast==='function'){const _t25=toast;P25.rawToast=_t25;toast=function(msg,kind){const ph=document.getElementById('phone');
  if(ph&&!ph.hidden&&!P25.call&&typeof msg==='string'&&!/^📱/.test(msg)){const col=kind==='warn'?'#ff9f0a':kind==='good'?'#30d158':'#0a84ff',ic=kind==='warn'?'!':kind==='good'?'✓':'i';
    island25(`<span style="flex:none;width:34px;height:34px;border-radius:50%;background:${col};display:flex;align-items:center;justify-content:center;font:700 17px var(--pf);color:#fff">${ic}</span><div class="isl-t"><b>Port-Aurore</b><span>${esc25(msg)}</span></div>`,2600);P25.lastToast={msg,kind,t:performance.now()};return;}
  return _t25(msg,kind);};}

/* v25 : plus de carte 2D, la touche M ouvre la carte 3D si elle existe */
if(typeof openBigMap==='function'){openBigMap=function(){if(typeof M3!=='undefined'&&M3.on){closePanel();return;}if(!started||panelOpen||(typeof paused!=='undefined'&&paused))return;m3On();};}
