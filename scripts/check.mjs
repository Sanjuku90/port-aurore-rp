// Vérifie la syntaxe de tous les scripts du jeu et la présence des fichiers référencés par index.html.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
let bad = 0;
for (const f of readdirSync('js').filter(f => f.endsWith('.js'))) {
  try { execFileSync(process.execPath, ['--check', 'js/' + f], { stdio: 'pipe' }); }
  catch (e) { bad++; console.error('Erreur de syntaxe : js/' + f + '\n' + e.stderr); }
}
const html = readFileSync('index.html', 'utf8');
for (const [, p] of html.matchAll(/(?:src|href)="([^"#:]+)"/g)) if (!existsSync(p)) { bad++; console.error('Fichier manquant : ' + p); }
if (bad) { console.error(bad + ' problème(s).'); process.exit(1); }
console.log('Port-Aurore : tous les fichiers sont OK.');
