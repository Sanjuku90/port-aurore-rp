# Port-Aurore RP · v29 · mini-jeux

Jeu de rôle 3D jouable dans le navigateur, construit en site statique avec Three.js embarqué. Pas de compilation front-end ni d’installation de dépendances nécessaires pour le déploiement.

## Lancer et vérifier en local

```bash
python3 -m http.server 8080
```

Ouvre ensuite http://localhost:8080. Avec Node.js 18 ou plus récent, vérifie les scripts et les fichiers utilisés par la page :

```bash
npm run check
```

## Déployer sur Render (recommandé : Blueprint)

Le fichier `render.yaml` est prêt à créer un **Static Site**. Render publie le dossier racine après avoir exécuté `npm run check`.

1. Mets le contenu de ce dossier dans un dépôt GitHub et pousse la branche `main`.
2. Dans Render, choisis **New → Blueprint** et connecte le dépôt.
3. Vérifie la configuration lue depuis `render.yaml`, puis clique **Apply**.
4. Attends la fin du premier déploiement, puis ouvre l’URL `.onrender.com` indiquée sur la page du service.
5. Teste le menu de démarrage, le chargement de la ville, la sauvegarde locale, les intérieurs et les commandes. Le jeu stocke la progression dans le navigateur de chaque joueur (`localStorage`).

Chaque push sur la branche suivie par Render lance un nouveau déploiement automatiquement. Les previews de pull request sont activées dans le Blueprint.

## Déploiement manuel (Static Site)

Si tu ne veux pas utiliser le Blueprint, crée un Static Site Render relié au même dépôt :

- **Branch** : `main`
- **Build Command** : `npm run check`
- **Publish Directory** : `.`

Ne configure pas de Start Command, de base de données, de secret ou de serveur Node : ce projet est servi comme un site statique.

## Dépannage rapide

- Si le build échoue, ouvre les logs Render : `scripts/check.mjs` indique les scripts en erreur ou les fichiers statiques manquants.
- Si la page est blanche, vérifie que `index.html`, `css/` et `js/` sont bien à la racine publiée, et consulte la console du navigateur.
- Les polices sont chargées depuis Google Fonts; si elles ne sont pas accessibles, le jeu conserve les polices de secours.
- Les sauvegardes sont locales au navigateur et ne sont pas partagées entre appareils.

## Autres fichiers

- `render.yaml` : Blueprint Render avec vérification au build et en-têtes de cache adaptés.
- `.github/workflows/check.yml` : vérification de syntaxe à chaque push et pull request.
- `scripts/check.mjs` : validation des scripts et des chemins référencés par `index.html`.
- `js/lib/three.min.js` : moteur 3D embarqué, aucune dépendance CDN pour le jeu.
