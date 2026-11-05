'use strict';
/* v51 · Appli « Aurore Destin » : histoire, filière, famille et palmarès (succès + titres). */
(function(){
const K='pa-ach51';C51.resetKey(K);
let A=C51.load(K,()=>({got:{}}));const save=()=>C51.store(K,A);
const ES=()=>window.ECO51&&ECO51.state,FS=()=>window.FAMILY51&&FAMILY51.state,SS=()=>window.STORY51&&STORY51.state;
const ACH=[
 ['story1','Enquêteur','Terminer le premier chapitre de l’histoire',()=>SS()&&SS().step>=3,1],
 ['story','Les Lumières d’Aurore','Terminer l’histoire principale',()=>SS()&&SS().done,5],
 ['farm','Planteur','Acheter la plantation de Solenne',()=>ES()&&ES().farm.owned,1],
 ['chain','Filière complète','Posséder plantation, chocolaterie et boutique',()=>ES()&&ES().farm.owned&&ES().factory.owned&&ES().shop.owned,4],
 ['sold','Mille délices','Vendre 1 000 produits',()=>ES()&&ES().stats.sold>=1000,4],
 ['contract','Partenaire de confiance','Honorer 5 contrats d’entreprise',()=>ES()&&ES().stats.contracts>=5,3],
 ['love','Coup de foudre','Être en couple',()=>FS()&&FS().partner&&FS().partner.stage!=='date',1],
 ['wed','Jeunes mariés','Se marier à la mairie',()=>FS()&&FS().partner&&FS().partner.stage==='marie',3],
 ['parent','Parent','Accueillir un enfant',()=>FS()&&FS().kids.length>0,2],
 ['heir','Héritage','Désigner un héritier',()=>FS()&&!!FS().heir,2],
 ['citizen','Citoyen modèle','Résoudre 10 alertes locales',()=>window.WORLD50&&WORLD50.completed>=10,3],
 ['rich','Millionnaire','Posséder 1 000 000 $ en cash et en banque',()=>state.cash+state.bank>=1e6,5]
];
function check(){let n=0;ACH.forEach(([id,name,,test,rep])=>{if(A.got[id])return;let ok=false;try{ok=!!test();}catch(e){}if(ok){A.got[id]=Math.floor(gameMin);n++;C51.rep(rep);C51.notify('🏆 Succès débloqué · '+name,'+'+rep+' réputation');C51.journal('Succès : '+name+'.');}});if(n)save();}
function titles(){const t=[];const S=SS();if(S&&S.title)t.push(S.title);const E=ES();if(E&&E.farm.owned&&E.factory.owned&&E.shop.owned)t.push('Baron du cacao');const F=FS();if(F&&F.kids.length)t.push('Chef de famille');if(window.WORLD50&&WORLD50.completed>=10)t.push('Héros de quartier');if(rankOf()>=4)t.push('Légende des trois cités');return t;}
C51.every(4,check);
const NAME='Aurore Destin';
const STAGES={date:'Rendez-vous',couple:'En couple',fiance:'Fiancé(e)s',marie:'Marié(e)s'};
function render(b){const X=window.PH49;if(!X||!X.UI){b.textContent='Aurore OS indisponible.';return;}const UI=X.UI,go=fn=>X.world(fn);
 const t=UI.tabs(b,'destin51',[['story','Histoire'],['biz','Filière'],['fam','Famille'],['pal','Palmarès']]);
 if(t==='story'){const S=SS(),c=window.STORY51&&STORY51.current();
  if(!S){UI.empty(b,'Histoire indisponible','');return;}
  UI.hero(b,'Les Lumières d’Aurore',S.done?'Terminée':('Chapitre '+(c?c.ch:1)+' · '+(c?c.title:'')),S.done?'Fin : '+STORY51.endings[S.ending].title:(c?c.hint:''));
  if(!S.done)UI.btn(b,'📍 GPS vers l’objectif',()=>STORY51.gps(),true);
  UI.btn(b,'Ouvrir la mission',()=>go(STORY51.open));
  UI.sec(b,'Choix et souvenirs');const g=UI.grp(b);if(!S.log.length)UI.row(g,{title:'Aucun souvenir pour l’instant',sub:'Rejoins Inès Kaboré à Aurore Info.'});S.log.slice(0,8).forEach(l=>UI.row(g,{title:l.t,wrap:true}));}
 else if(t==='biz'){const E=ES();if(!E){UI.empty(b,'Filière indisponible','');return;}
  UI.hero(b,'Filière cacao & café',fmt(E.stats.revenue)+' de chiffre d’affaires',E.stats.sold+' produits vendus · '+E.stats.made+' fabriqués · '+E.stats.harvest+' récoltés');
  const g=UI.grp(b);[['farm','🌿 Plantation · Solenne',E.farm.owned?'Entrepôt : cacao '+E.farm.stock.cacao+' · café '+E.farm.stock.cafe:'À vendre · 1 500 $'],['factory','🏭 Chocolaterie · Nouvelle-Aurore',E.factory.owned?'Chocolat '+E.factory.out.chocolat+' · café torréfié '+E.factory.out.torref+' · '+E.factory.queue.length+' fournée(s)':'À vendre · 4 000 $'],['shop','🛍️ Aurore Délices · Port-Aurore',E.shop.owned?'Rayons : '+E.shop.stock.chocolat+' 🍫 · '+E.shop.stock.torref+' ☕ · caisse '+fmt(E.shop.till):'À vendre · 2 500 $']].forEach(([k,n,s])=>{const p=ECO51.site(k);UI.row(g,{title:n,sub:s,wrap:true,onClick:()=>X.go(p.x,p.z,n.replace(/^\S+\s/,''))});});
  UI.note(b,'Cargaison : '+ECO51.cargo()+' · capacité '+ECO51.cap()+' (120 en voiture). Touche un site pour lancer le GPS.');
  if(E.contract)UI.note(b,'📦 Commande de '+E.contract.c+' : '+E.contract.q+' '+ECO51.FIN[E.contract.k].n.toLowerCase()+' · '+fmt(E.contract.r)+'.');
  UI.note(b,'Prix boutique · chocolat '+fmt(ECO51.unitPrice('chocolat'))+' · café '+fmt(ECO51.unitPrice('torref'))+'. Plus tu vends, plus la demande baisse ; elle remonte avec le temps.');}
 else if(t==='fam'){const F=FS();if(!F){UI.empty(b,'Famille indisponible','');return;}const p=F.partner;
  UI.hero(b,'Ma famille',p?p.name:'Célibataire',p?(STAGES[p.stage]+' · relation '+Math.round(C51.rel(p.name))+'/100'):'Invite un ami proche à un rendez-vous');
  UI.btn(b,'Gérer ma famille',()=>go(FAMILY51.open),true);
  const o=FAMILY51.office();UI.btn(b,'📍 Bureau de la famille (mariages)',()=>X.go(o.x,o.z,'Bureau de la famille'));
  const g=UI.grp(b);F.kids.forEach(k=>UI.row(g,{title:'👶 '+k.name,sub:FAMILY51.phase(k)+' · '+FAMILY51.age(k)+' an(s) · attention '+Math.round(k.care)+'/100'}));if(!F.kids.length)UI.row(g,{title:'Pas encore d’enfant'});
  if(F.heir)UI.note(b,'Héritier désigné : '+F.heir+'.');}
 else{check();const T=titles();UI.hero(b,'Palmarès',Object.keys(A.got).length+' / '+ACH.length+' succès',T.length?'Titres : '+T.join(' · '):'Aucun titre pour l’instant');
  const g=UI.grp(b);ACH.forEach(([id,name,desc])=>UI.row(g,{title:(A.got[id]?'🏆 ':'🔒 ')+name,sub:desc,wrap:true}));}}
function register(){if(typeof APPS==='undefined'||typeof RENDER25==='undefined')return;
 if(typeof ICO25!=='undefined')ICO25[NAME]=['linear-gradient(160deg,#ff9f43,#c2185b 55%,#4527a0)','<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20c4-1 6-4 8-8s4-7 8-8"/><circle cx="12" cy="12" r="2.5" fill="#fff"/><path d="M4 4h5M15 20h5"/></svg>'];
 if(typeof TINT25!=='undefined')TINT25[NAME]=['#ff9f43','#4527a0'];
 RENDER25[NAME]={fn:render};if(!APPS.some(a=>a[0]===NAME))APPS.push([NAME,'✦','#ff9f43,#4527a0',render]);}
register();
window.HUB51={titles,check,ACH:ACH.map(a=>a[0])};
})();
