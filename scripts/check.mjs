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
for (const [file, terms] of [
  ['js/nation40.js', ['nat40:station:main', 'nat40:station:third', 'nat40:bus:', 'nat40:market', 'function tickTrip']],
  ['js/hotels40.js', ['hotel40:pax', 'hotel40:third', 'sol28hotel', 'Réceptionniste', 'Suite présidentielle', 'function toHotelLobby']],
  ['js/life41.js', ['function petShop', 'function eventBoard', 'function contractDesk', 'function tenantPanel', 'function completeContract', 'life41:events:third']]
]) {
  const src = readFileSync(file, 'utf8');
  for (const term of terms) if (!src.includes(term)) { bad++; console.error('Fonction v40 manquante dans ' + file + ' : ' + term); }
}
for (const [, raw] of html.matchAll(/(?:src|href)="([^"#:]+)"/g)) { const p = raw.split('?')[0]; if (!existsSync(p)) { bad++; console.error('Fichier manquant : ' + p); } }
if (bad) { console.error(bad + ' problème(s).'); process.exit(1); }
console.log('Port-Aurore : tous les fichiers sont OK.');
