// Vérifie la syntaxe de tous les scripts du jeu et la présence des fichiers référencés par index.html.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
let bad = 0;
for (const f of readdirSync('js').filter(f => f.endsWith('.js'))) {
  try { execFileSync(process.execPath, ['--check', 'js/' + f], { stdio: 'pipe' }); }
  catch (e) { bad++; console.error('Erreur de syntaxe : js/' + f + '\n' + e.stderr); }
}
const html = readFileSync('index.html', 'utf8');
// v40 release guardrails: load dependencies before runtime hooks and keep all three hotel systems.
const nationAt = html.indexOf('src="js/nation40.js');
const hotelsAt = html.indexOf('src="js/hotels40.js');
const mainAt = html.indexOf('src="js/main.js');
const lifeAt = html.indexOf('src="js/life41.js');
if (nationAt < 0 || hotelsAt < 0 || lifeAt < 0 || mainAt < 0 || !(nationAt < hotelsAt && hotelsAt < lifeAt && lifeAt < mainAt)) {
  bad++; console.error('Ordre de chargement invalide : nation40 → hotels40 → life41 → main.');
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
  ['index.html',['id="joy-zone"','id="b-act"','id="b-chat"','id="b-phone"','id="b-map"','hud45.css?v=48','hud45.js?v=48','pause.js?v=48','main.js?v=48']],
  ['js/input.js',['joyZone.addEventListener(\'pointerdown\'','setPointerCapture','pointercancel','resetTouchControls','aria-pressed']],
  ['css/hud45.css',['v48 · commandes tactiles','html.ui45 .touch #joy-zone','right #map-btn','right #ph-btn','grid-template-columns:44px 44px 64px','#joy.active']],
  ['js/fx45.js',['mode:coarse?0:2']],
  ['js/main.js',['coarse?1.1:1.75']],
  ['js/phase2.js',['matches?420:1100']]
];
for(const [file,terms] of mobile){const src=readFileSync(file,'utf8');for(const term of terms)if(!src.includes(term)){bad++;console.error('Optimisation mobile manquante dans '+file+' : '+term);}}
for (const [, raw] of html.matchAll(/(?:src|href)="([^"#:]+)"/g)) { const p = raw.split('?')[0]; if (!existsSync(p)) { bad++; console.error('Fichier manquant : ' + p); } }
if (bad) { console.error(bad + ' problème(s).'); process.exit(1); }
console.log('Port-Aurore : tous les fichiers sont OK.');
