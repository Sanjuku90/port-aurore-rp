# Port-Aurore RP

Jeu de rôle 3D dans le navigateur (Three.js embarqué, aucune dépendance externe à installer) : 17 métiers avec gameplay dédié, grades et promotions, entreprises, justice, immobilier, téléphone, GPS avec itinéraire et carte aérienne 3D, élections municipales, courses de rue, renommée et défis du jour, transports en commun, salle de jeux (v17).

## Lancer en local
Le jeu est un site statique. Ouvre un terminal dans ce dossier :

```bash
npm start            # puis ouvre http://localhost:8080
# ou, sans Node :
python3 -m http.server 8080
```

Vérifier que tout est en ordre avant de publier :

```bash
npm run check
```

## Mettre le projet sur GitHub
1. Crée un dépôt vide sur github.com (par ex. `port-aurore-rp`), sans README.
2. Dans ce dossier :

```bash
git init
git add .
git commit -m "Port-Aurore RP v17"
git branch -M main
git remote add origin https://github.com/<ton-pseudo>/port-aurore-rp.git
git push -u origin main
```

À chaque `git push`, l’action **Vérification** (onglet *Actions*) contrôle la syntaxe des scripts.

## Déployer sur Render
**Option 1 · Blueprint (recommandé)**
1. Sur render.com : *New* → *Blueprint* → connecte ton compte GitHub et choisis le dépôt.
2. Render lit `render.yaml` et crée le site statique `port-aurore-rp`. Clique *Apply*.

**Option 2 · Manuel**
*New* → *Static Site* → choisis le dépôt, puis :
- Build Command : `node scripts/check.mjs`
- Publish Directory : `.`

Le site est en ligne sur `https://port-aurore-rp.onrender.com` (ou le nom choisi). Chaque push sur `main` redéploie automatiquement.

## Bonus · GitHub Pages
Le fichier `.nojekyll` est présent : *Settings* → *Pages* → *Deploy from a branch* → `main` / `(root)`.

## Structure
- `index.html` : point d’entrée
- `css/style.css` : interface
- `js/` : modules du jeu, chargés dans l’ordre défini par `index.html` (`js/lib/three.min.js` = moteur 3D)
- `CHANGELOG.md` : historique des versions
