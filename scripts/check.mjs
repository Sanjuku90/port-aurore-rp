// Vérifie la syntaxe de tous les scripts du jeu et la présence des fichiers référencés par index.html.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
let bad = 0;
for (const f of readdirSync('js').filter(f => f.endsWith('.js'))) {
  try { execFileSync(process.execPath, ['--check', 'js/' + f], { stdio: 'pipe' }); }
  catch (e) { bad++; console.error('Erreur de syntaxe : js/' + f + '\n' + e.stderr); }
}
try { execFileSync(process.execPath, ['--check', 'server.js'], { stdio: 'pipe' }); }
catch (e) { bad++; console.error('Erreur de syntaxe : server.js\n' + e.stderr); }
const html = readFileSync('index.html', 'utf8');
// v40 release guardrails: load dependencies before runtime hooks and keep all three hotel systems.
const nationAt = html.indexOf('src="js/nation40.js');
const hotelsAt = html.indexOf('src="js/hotels40.js');
const mainAt = html.indexOf('src="js/main.js');
const lifeAt = html.indexOf('src="js/life41.js');
const phoneCoreAt = html.indexOf('src="js/phone49-core.js');
const phoneAppsAt = html.indexOf('src="js/phone49-apps.js');
const world50At = html.indexOf('src="js/world50.js');
const account50At = html.indexOf('src="js/account51.js');
if (nationAt < 0 || hotelsAt < 0 || lifeAt < 0 || phoneCoreAt < 0 || phoneAppsAt < 0 || world50At < 0 || account50At < 0 || mainAt < 0 || !(nationAt < hotelsAt && hotelsAt < lifeAt && lifeAt < phoneCoreAt && phoneCoreAt < phoneAppsAt && phoneAppsAt < world50At && world50At < account50At && account50At < mainAt)) {
  bad++; console.error('Ordre de chargement invalide : nation40 → hotels40 → life41 → Aurore OS → world50 → account51 → main.');
}
const m46=html.indexOf('src="js/metro46-core.js'),r46=html.indexOf('src="js/metro46-rooms.js'),p46=html.indexOf('src="js/metro46-port.js'),e47=html.indexOf('src="js/metro47-expansion.js');
if(m46<0||r46<0||p46<0||e47<0||!(lifeAt<m46&&m46<r46&&r46<p46&&p46<e47&&e47<mainAt)){bad++;console.error('Ordre v46/v47 invalide : noyau → intérieurs → Port-Aurore → expansion → main.');}
for (const [file, terms] of [
  ['js/metro46-core.js', ['function lodTick','walkOK','MET.rideStart','MET.realty','R.sp=[]']],
  ['js/metro46-rooms.js', ['MET.openRoom','function disposeRoom','T.reslobby','T.mall0']],
  ['js/nation40.js', ['nat40:station:main', 'nat40:station:third', 'nat40:bus:', 'nat40:market', 'function tickTrip']],
  ['js/hotels40.js', ['hotel40:pax', 'hotel40:third', 'sol28hotel', 'Réceptionniste', 'Suite présidentielle', 'function toHotelLobby']],
  ['js/life41.js', ['function petShop', 'function eventBoard', 'function contractDesk', 'function tenantPanel', 'function completeContract', 'life41:events:third']]
]) {
  const src = readFileSync(file, 'utf8');
  for (const term of terms) if (!src.includes(term)) { bad++; console.error('Fonction v40 manquante dans ' + file + ' : ' + term); }
}
const exp=readFileSync('js/metro47-expansion.js','utf8');
for(const term of ['Platinum Heights','Aurore Grand Mall','Aurore Waterfront','Federal Boulevard','Diplomatic Quarter','Innovation City','University Heights','Exhibition District','Corridor métropolitain','Emerald Coast','Pearl Island','Solenne Nature Reserve','Solenne International','metropolitan-emergency-center','metropolitan-power-plant','metropolitan-water-treatment','metropolitan-recycling-center',"id:'metro-port'","id:'metro-nouvelle'","id:'a1-coach'","id:'ferry'"]) {
  if(!exp.includes(term)){bad++;console.error('Élément v47 manquant : '+term);}
}
const mobile=[
  ['index.html',['id="joy-zone"','id="b-act"','id="b-chat"','id="b-phone"','id="b-map"','hud45.css?v=48','hud45.js?v=48','pause.js?v=48','main.js?v=50']],
  ['js/input.js',['joyZone.addEventListener(\'pointerdown\'','setPointerCapture','pointercancel','resetTouchControls','aria-pressed']],
  ['css/hud45.css',['v48 · commandes tactiles','html.ui45 .touch #joy-zone','right #map-btn','right #ph-btn','grid-template-columns:44px 44px 64px','#joy.active']],
  ['js/fx45.js',['mode:coarse?0:2']],
  ['js/main.js',['coarse?1.1:1.75']],
  ['js/menu27.js',["TOUCH_GFX=matchMedia('(pointer: coarse)').matches",'if(TOUCH_GFX)GFX.q=0;','sun.castShadow=!TOUCH_GFX&&q>0','GFX_QUALITIES=TOUCH_GFX?[QN[0]]:QN']],
  ['js/perf33.js',['MAX=Math.min(dpr,1.0),MIN=.65;let pr=Math.min(dpr,.9)']],
  ['js/fx45.js',["if(coarse)S.mode=0;",'S.mode=coarse?0:Math.max',"MN=coarse?['Désactivé']"]],
  ['index.html',['menu27.js?v=52.1','perf33.js?v=52.1','fx45.js?v=52.1']],
  ['js/phase2.js',['matches?420:1100']]
];
for(const [file,terms] of mobile){const src=readFileSync(file,'utf8');for(const term of terms)if(!src.includes(term)){bad++;console.error('Optimisation mobile manquante dans '+file+' : '+term);}}
for (const [, raw] of html.matchAll(/(?:src|href)="([^"#:]+)"/g)) { const p = raw.split('?')[0]; if (!existsSync(p)) { bad++; console.error('Fichier manquant : ' + p); } }
if (bad) { console.error(bad + ' problème(s).'); process.exit(1); }
const w50=readFileSync('js/world50.js', 'utf8');
for (const term of ['world50:active','function spawn','function finish','function expire','window.WORLD50']) { if (!w50.includes(term)) { bad++; console.error('Fonction v50 manquante dans js/world50.js : ' + term); } }
const a51=readFileSync('js/account51.js','utf8'),api51=readFileSync('server.js','utf8'),admin51=readFileSync('admin/index.html','utf8');
const order51=['world50','core51','story51','eco51','family51','hub51','account51','main'].map(n=>html.indexOf('src="js/'+n+'.js'));
if(order51.some(i=>i<0)||order51.some((v,i)=>i&&v<order51[i-1])){bad++;console.error('Ordre v51 invalide : world50 → core51 → story51 → eco51 → family51 → hub51 → account51 → main.');}
const boot=html.indexOf('src="js/cloudboot51.js'),three=html.indexOf('src="js/lib/three.min.js');if(boot<0||boot>three){bad++;console.error('cloudboot51.js doit être chargé avant tous les modules du jeu.');}
for(const term of ['giftIds','/api/gifts/claim','/api/gifts/ack','/api/save','/api/password/forgot','/api/password/reset','pa-cloud51-pending','window.ACCOUNT50','acc51-dock'])if(!a51.includes(term)){bad++;console.error('Élément de compte v51 manquant : '+term);}
for(const term of ["'POST /api/register'","'POST /api/login'","'POST /api/admin/temp-password'","'POST /api/password/forgot'","'POST /api/password/reset'","'POST /api/password/change'","'POST /api/account/delete'","'GET /api/save'","'PUT /api/save'","'POST /api/admin/gift'",'scrypt','HttpOnly','timingSafeEqual'])if(!api51.includes(term)){bad++;console.error('Route ou sécurité serveur manquante : '+term);}
for(const term of ['id="admin-key"','/api/admin/verify','/api/admin/lookup','/api/admin/gift','temp-password'])if(!admin51.includes(term)){bad++;console.error('Fonction admin manquante : '+term);}
for(const id of ['account-status','account-badge','account-open','account-panel'])if(!html.includes('id="'+id+'"')){bad++;console.error('Élément de compte absent dans index.html : '+id);}
for(const [file,terms] of [['js/story51.js',['STEPS','ENDINGS','story51:hub','window.STORY51']],['js/eco51.js',['eco51:farm','eco51:factory','eco51:shop','function hourTick','window.ECO51']],['js/family51.js',['function wedding','function addKid','family51:office','window.FAMILY51']],['js/hub51.js',['Aurore Destin','ACH','RENDER25']]]){const src=readFileSync(file,'utf8');for(const t of terms)if(!src.includes(t)){bad++;console.error('Élément v51 manquant dans '+file+' : '+t);}}
if (bad) { console.error(bad + ' problème(s).'); process.exit(1); }
console.log('Port-Aurore : tous les fichiers sont OK.');
