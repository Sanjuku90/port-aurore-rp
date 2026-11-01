'use strict';
/* v24 : catalogue mobilier filtrable par pièce, avec recherche, budget, tri et accès depuis le téléphone. */
const ROOMS24=[
  {id:'all',name:'Toutes',icon:'🏠'},
  {id:'salon',name:'Salon',icon:'🛋️'},
  {id:'chambre',name:'Chambre',icon:'🛏️'},
  {id:'cuisine',name:'Cuisine & repas',icon:'🍳'},
  {id:'sdb',name:'Salle de bain',icon:'🛁'},
  {id:'bureau',name:'Bureau',icon:'💻'},
  {id:'enfant',name:'Chambre d’enfant',icon:'🧸'},
  {id:'entree',name:'Entrée',icon:'🚪'},
  {id:'exterieur',name:'Balcon & jardin',icon:'🌿'}
];
const COLL150_24=['Sièges & canapés','Tables','Rangements','Luminaires','Plantes','Tapis & textiles','Miroirs & cadres','Objets déco','Étagères','Objets connectés','Électroménager','Chambre','Salle de bain','Enfant','Jardin & balcon'];
const FIXED150_24={10:'cuisine',11:'chambre',12:'sdb',13:'enfant',14:'exterieur'};
const ROOM_RULES24=[
  ['exterieur',/balcon|jardin|patio|terrasse|solaire|parasol|chaise longue|barbecue|balançoire/i],
  ['sdb',/serviette|lavabo|bain|douche|savon|pharmacie|miroir lumineux|linge|fougère/i],
  ['cuisine',/cuisine|espresso|machine à café|à manger|bistrot|four|vaisselle|pain|mixeur|grille-pain|cave à vin|robot|bouilloire|distributeur|réfrigérateur|aromatiques|centre de table|desserte|tabouret haut|horloge|plateau|chaise en métal|table pliante/i],
  ['entree',/entrée|chaussures|clés|portemanteau|paillasson|couloir|console|panier en osier|panier tressé|miroir soleil/i],
  ['bureau',/bureau|secrétaire|porte-revues|globe|lampe de lecture|lecture led|casier|bibliothèque|caisson/i],
  ['chambre',/chevet|\blit\b|commode|armoire|coiffeuse|bijoux|réveil|paravent|couverture|valet|plein pied|arche|moustiquaire|coffre de rangement|lampe tactile|guirlande|ventilateur|purificateur|champignon|plaid/i]
];
function roomOf24(x){
  if(x.id.startsWith('home150-')&&FIXED150_24[x.group])return FIXED150_24[x.group];
  for(const [room,re] of ROOM_RULES24)if(re.test(x.name))return room;
  return 'salon';
}
function collectionOf24(x){
  if(x.id.startsWith('home150-'))return COLL150_24[x.group]||'Collection 2024';
  if(x.id.startsWith('home50-'))return (typeof homeTypes11!=='undefined'&&homeTypes11[x.group])||'Nouveautés';
  return 'Collection d’origine';
}
HOME_FURN.forEach(x=>{x.room=x.room||roomOf24(x);x.collection=x.collection||collectionOf24(x);});
const CAT24={room:'all',q:'',budget:false,hideOwned:false,sort:0};
const SORTS24=[['Catalogue',null],['Prix croissant',(a,b)=>a.price-b.price],['Prix décroissant',(a,b)=>b.price-a.price],['Nom A → Z',(a,b)=>a.name.localeCompare(b.name,'fr')]];
const owned24=x=>(walletP58.furniture||[]).includes(x.id);
const funds24=()=>Math.max(0,(state.cash||0)+(state.bank||0));
const hex24=c=>'#'+(c>>>0).toString(16).padStart(6,'0').slice(-6);
function el24(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
function matches24(x,ignoreRoom){
  if(!ignoreRoom&&CAT24.room!=='all'&&x.room!==CAT24.room)return false;
  if(CAT24.hideOwned&&owned24(x))return false;
  if(CAT24.budget&&!owned24(x)&&x.price>funds24())return false;
  if(CAT24.q){const q=CAT24.q.toLowerCase();if(!(x.name+' '+x.collection).toLowerCase().includes(q))return false;}
  return true;
}
function buy24(x){
  if(owned24(x))return;
  if(!pay11(x.price,'Mobilier · '+x.name)){toast('Il te manque '+fmt(x.price-funds24())+' pour '+x.name+'.','warn');renderCat24();return;}
  walletP58.furniture.push(x.id);
  const R=ROOMS.home;if(R)addHomeFurnitureP58(R,x.id);
  saveEconomyP58();toast(x.name+' installé chez toi.','good');renderCat24();
}
function renderCat24(){
  const box=$('#pn-btns'),sheet=document.querySelector('#panel .sheet');if(!box||!sheet)return;
  const scroll=sheet.scrollTop,focusSearch=document.activeElement&&document.activeElement.id==='cat24-q';
  box.innerHTML='';
  const ownedN=HOME_FURN.filter(owned24).length;
  $('#pn-text').textContent=HOME_FURN.length+' articles · '+ownedN+' chez toi · budget '+fmt(funds24())+' (cash + banque)';

  const rooms=el24('div','cat24-rooms');
  ROOMS24.forEach(r=>{
    const n=HOME_FURN.filter(x=>(r.id==='all'||x.room===r.id)&&matches24(x,true)).length;
    const b=el24('button','cat24-room'+(CAT24.room===r.id?' on':''));b.type='button';b.setAttribute('aria-pressed',CAT24.room===r.id);
    b.appendChild(el24('span','cat24-ri',r.icon));b.appendChild(el24('span',null,r.name));b.appendChild(el24('small',null,String(n)));
    b.onclick=()=>{CAT24.room=r.id;renderCat24();sheet.scrollTop=0;};rooms.appendChild(b);
  });
  box.appendChild(rooms);

  const tools=el24('div','cat24-tools');
  const q=el24('input','cat24-q');q.id='cat24-q';q.type='search';q.placeholder='Chercher un meuble…';q.value=CAT24.q;q.setAttribute('aria-label','Chercher un meuble');
  q.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')closePanel();if(e.key==='Enter')q.blur();});
  q.addEventListener('keyup',e=>e.stopPropagation());
  q.oninput=()=>{CAT24.q=q.value.trim();renderCat24();};
  tools.appendChild(q);
  const tog=(label,key)=>{const b=el24('button','cat24-tog'+(CAT24[key]?' on':''),label);b.type='button';b.setAttribute('aria-pressed',!!CAT24[key]);b.onclick=()=>{CAT24[key]=!CAT24[key];renderCat24();};return b;};
  tools.appendChild(tog('Dans mon budget','budget'));
  tools.appendChild(tog('Masquer mes meubles','hideOwned'));
  const s=el24('button','cat24-tog','Tri : '+SORTS24[CAT24.sort][0]);s.type='button';s.onclick=()=>{CAT24.sort=(CAT24.sort+1)%SORTS24.length;renderCat24();};
  tools.appendChild(s);
  box.appendChild(tools);

  let list=HOME_FURN.filter(x=>matches24(x));
  const cmp=SORTS24[CAT24.sort][1];if(cmp)list=list.slice().sort(cmp);
  const room=ROOMS24.find(r=>r.id===CAT24.room);
  box.appendChild(el24('div','cat24-count',(room.id==='all'?'Toute la maison':room.icon+' '+room.name)+' · '+list.length+' article'+(list.length>1?'s':'')));

  if(!list.length){
    const empty=el24('div','cat24-empty');empty.appendChild(el24('b',null,'Rien ici avec ces filtres.'));
    const r=el24('button','primary','Réinitialiser les filtres');r.type='button';r.onclick=()=>{Object.assign(CAT24,{room:'all',q:'',budget:false,hideOwned:false,sort:0});renderCat24();};
    empty.appendChild(r);box.appendChild(empty);
  }else{
    const grid=el24('div','cat24-grid');
    list.forEach(x=>{
      const own=owned24(x),miss=Math.max(0,x.price-funds24());
      const c=el24('button','cat24-card'+(own?' own':''));c.type='button';c.disabled=own||miss>0;
      const sw=el24('span','cat24-sw',(ROOMS24.find(r=>r.id===x.room)||ROOMS24[0]).icon);sw.style.background=hex24(x.color||0x8c5c42);
      const tx=el24('span','cat24-tx');tx.appendChild(el24('b',null,x.name));tx.appendChild(el24('small',null,x.collection));
      const ft=el24('span','cat24-ft');ft.appendChild(el24('strong',null,fmt(x.price)));
      ft.appendChild(el24('em',null,own?'✓ Chez toi':miss>0?'Manque '+fmt(miss):'Acheter'));
      c.appendChild(sw);c.appendChild(tx);c.appendChild(ft);
      c.setAttribute('aria-label',x.name+', '+fmt(x.price)+(own?', déjà chez toi':miss>0?', fonds insuffisants':''));
      c.onclick=()=>buy24(x);grid.appendChild(c);
    });
    box.appendChild(grid);
  }
  const close=el24('button','ghost cat24-close','Fermer');close.type='button';close.onclick=closePanel;box.appendChild(close);
  sheet.scrollTop=scroll;
  if(focusSearch){const n=$('#cat24-q');if(n){n.focus();n.setSelectionRange(n.value.length,n.value.length);}}
}
const _openPanel24=openPanel;openPanel=function(t,x,b){const s=document.querySelector('#panel .sheet');if(s)s.classList.remove('cat24');return _openPanel24(t,x,b);};
function furniturePanelP58(room){
  if(room&&ROOMS24.some(r=>r.id===room))CAT24.room=room;
  openPanel('Catalogue mobilier','',[]);
  const s=document.querySelector('#panel .sheet');if(s){s.classList.add('cat24');s.scrollTop=0;}
  renderCat24();
}
addPhoneAppP58('Mobilier','🛋️','#d9a066,#6b3f2a',function(b){
  const card=mk('div','bigc');card.appendChild(mk('small',null,'Catalogue maison'));card.appendChild(mk('b',null,HOME_FURN.filter(owned24).length+' / '+HOME_FURN.length+' meubles'));card.appendChild(mk('span',null,'Filtre par pièce, cherche, achète : livré direct chez toi.'));b.appendChild(card);
  b.appendChild(mk('button','pbtn hot','Ouvrir le catalogue',()=>{closePanel();furniturePanelP58();}));
  ROOMS24.slice(1).forEach(r=>{const n=HOME_FURN.filter(x=>x.room===r.id).length,o=HOME_FURN.filter(x=>x.room===r.id&&owned24(x)).length;b.appendChild(mk('button','pbtn',r.icon+' '+r.name+' · '+o+'/'+n,()=>{closePanel();furniturePanelP58(r.id);}));});
});
CHANGELOG.unshift(['v24','Catalogue mobilier : filtres par pièce, recherche, budget, tri, appli Mobilier · 150 nouveaux meubles']);
{const _as24=appSet;appSet=function(b){_as24(b);b.querySelectorAll('.bigc b').forEach(x=>{if(/^v\d+$/.test(x.textContent))x.textContent='v24';});};}
{const _bph24=bindPhone;bindPhone=function(){_bph24();const s=document.querySelector('.intro h1 span');if(s)s.textContent='JEU DE RÔLE · v24';};}
