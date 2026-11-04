# Port-Aurore RP · v49 · Métropole des Trois Cités

Jeu de rôle 3D jouable dans le navigateur, construit en site statique avec Three.js embarqué. Pas de compilation front-end ni d’installation de dépendances nécessaires pour le déploiement.

## v48 · commandes mobiles

Commandes tactiles réorganisées en deux zones: joystick flottant sous le pouce gauche, glissement du pouce droit pour la caméra, et actions regroupées sous le pouce droit. Les boutons Carte/Téléphone ne sont plus dupliqués en haut et en bas. En mobile, le rendu cinématique est désactivé par défaut, le pixel ratio et les particules de pluie sont plafonnés pour réduire la charge GPU/CPU; les options graphiques restent réglables.

## v47 · Expansion urbaine

La v47 déploie les secteurs manquants autour de Port-Aurore, Nouvelle-Aurore et Solenne: Platinum Heights, Aurore Grand Mall, Aurore Waterfront, Federal Boulevard, Diplomatic Quarter, Innovation City, University Heights, Nouvelle-Aurore Premium, Exhibition District, Corridor métropolitain, Emerald Coast, Solenne Marina, Pearl Island, Solenne Nature Reserve et Solenne International.

Les gares et intérieurs sont visitables; les quartiers chargent progressivement avec le noyau v46. Le métro dessert les nouveaux pôles, l’autocar suit l’A1 en contournant la piste de PAX, une navette dessert Solenne et un ferry relie les deux rives. Le centre de secours, la centrale électrique, le traitement des eaux, le recyclage et le dépôt de bus ont leurs missions. L’aéroport, le port de commerce, les hôtels et les bâtiments publics déjà présents sont conservés, pas recréés.

`npm run check` valide la syntaxe, les fichiers référencés et l’ordre des modules. Ce contrôle ne remplace pas un essai visuel en navigateur ou sur iPhone: collisions, parcours et performances restent à tester avant publication.

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


## v30
- Commandes manette rétablies dans les menus et mini-jeux, avec stick analogique et actions A/B.
- Quartier du Belvédère: villas habitées, deux locations interactives, marché et restaurant Chez Mama Adjo.
- Complexe sportif jouable (football à 5, basket, tennis, natation, musculation, cyclisme), campus enrichi et centre commercial Les Palmiers.
- Aurore Motors: achat et reprise de voitures détaillées.


## v31 · Ville vivante
- **Résidences du Belvédère** : 14 villas de luxe (piscine, haies, portail, voitures), poste de garde. 5 à louer (24 h) ou acheter, les autres habitées (rachat possible). Intérieur : salon, cuisine (cuisiner), chambre (dormir), TV, console, ordinateur.
- **Résidence Palmeraie** : 4 immeubles à balcons, appartements à louer ou acheter.
- **Aurore Motors** : showroom vitré avec cadres lumineux, podium, plateaux tournants, 10 modèles (occasion → supercar), couleurs, essai routier de 2 min, livraison au parking, voitures sauvegardées.
- **Les Palmiers** : vrai centre commercial intérieur, 9 boutiques + food court + café + distributeur, clients PNJ. Achats réels : sac, tenues portées, bijoux, appareils et meubles utilisables à la maison.
- **Entreprises** : Mama Adjo, étal du marché, food truck, Mode Aurore, Aurore Tech, Arcade Néon, Aurore Motors. Achat, recrutement (candidats notés), formation, licenciement, prix, stock, agrandissement, salaires, caisse, revente, app téléphone « Business ».
- **Ville vivante** : 52 habitants avec métier, domicile et emploi du temps (travail, courses, sport, sorties, retour à la maison). Ils fréquentent les commerces (et paient tes entreprises), réagissent aux voitures, discutent (E).
- **Parc sportif** : terrain de foot à 5, 2 terrains de basket street, tribunes avec supporters, food truck. **Matchs 3D jouables** au clavier ou à la manette : foot (coéquipier, gardiens, adversaires) et basket 1 contre 1 (dribble, tir, dunk, interception).
- Caserne avec portes rouges et camions, allée de palmiers du campus.
- Correctif : le module v30 plantait au chargement (sports et marché inactifs).


## v32 · confort mobile, villas signature et conduite interactive
- Rendu tactile allégé automatiquement (résolution et ombres adaptées aux téléphones), commandes et panneaux adaptés aux encoches et au mode paysage.
- Quatre villas signature détaillées : Moderne, Prestige, Royale et Penthouse, avec capacités et équipements distincts dans leurs fiches.
- Concession : achat comptant ou financement avec acompte et deux échéances sauvegardées. Commandes de voiture depuis le bouton mobile « Véhicule » ou la touche V : portières, coffre, phares, clignotants, détresse, klaxon, caméra, peinture, jantes, vitres, réparations, lavage et radio.
- Accueil vocal et messages de chat du conseiller Aurore Motors.


## v33 · Quartier automobile Aurore
- **Aurore Motors Prestige** devient un vrai lieu : showroom vitré à portes automatiques, enseigne lumineuse, exposition extérieure, parking clients, places VIP avec tapis rouge, accueil (Ama), conseillers (Koffi, Nadia), espace de négociation, écran géant de suivi en direct, mezzanine.
- **Étage** (escalier vitré) : bureau des vendeurs, espace de négociation, bureau de financement, salon VIP (champagne, présentation privée, attente des commandes).
- **Atelier de livraison & SAV** (Yao) : pont élévateur, écran de suivi, borne de remise des clés avec confettis et ruban sur le toit.
- **11 nouvelles carrosseries** dessinées une par une : Titan X (SUV de luxe), Prestige S, Volt GT électrique, Rosso SF, Hyperion, Atlas 4x4, Coupé 9, Lagune, Lumi, Sovereign et Sovereign Pullman (portes antagonistes), plus éditions limitées à stock réel.
- **Voitures vivantes** : portières, capot (baie moteur), coffre/hayon, phares, clignotants, feux de détresse, rétroviseurs rabattables, caméra intérieure, sellerie, éclairage d’ambiance, jantes, vitres teintées, plaques, finitions métallisé/mat/nacré.
- **Showroom** : fiche technique, couleur exposée modifiable, vue 360°, regarder l’intérieur, s’asseoir au volant, démarrer et faire rugir le moteur, comparateur jusqu’à 3 modèles.
- **Essais** de 3 minutes sur la **piste d’essai chronométrée** (4 portiques, records par modèle).
- **Achat** : comptant, crédit (acompte + mensualités, 1 mois = 1 jour de jeu, retards et saisie), reprise, location longue durée avec option d’achat, garanties, remise négociée.
- **Après l’achat** : commande suivie étape par étape, plaque attribuée, carte grise à ton nom, garage sauvegardé (atelier ou villa), repère sur la carte, revente.
- **SAV** : entretien (vidange, révision, pneus, moteur, diagnostic, carrosserie), personnalisation, nettoyage, garanties, assistance routière. L’usure réduit la puissance.
- **Aurore Moto**, **Aurore Occasion** (parc, annonces entre particuliers, rachat, offres d’acheteurs) et **Aurore Exclusive** (carte VIP, limousines, séries limitées).
- **Appli téléphone « Véhicules »** : état, localisation, livraison, réparation, mensualités, documents, vente, suivi.
- **Clients et employés parlent** : accueil, conversations client ↔ conseiller, clients interpellables (E).
- **Fluidité mobile** : résolution adaptative selon les images par seconde, distance d’affichage réduite, peinture allégée, voitures lointaines masquées.
- Commandes : **C** commandes de bord · **L** phares · **X** détresse · bouton **🚘 Bord** sur mobile.


## v40 · Nouvelle-Aurore, TGV et bus parcourus
- Ajout d’une troisième ville avec palais présidentiel, hôpital, université, aéroport, gare TGV, centre commercial, marché, banque, commissariat, caserne, palais de justice, stade, port, zone industrielle, logements, centre culturel et station d’épuration.
- Les commerces, services publics et bâtiments principaux ont des interactions; les achats utilisent le même portefeuille et les mêmes besoins que le reste du jeu.
- Trois nations disposent chacune d’un président interactif : Port-Aurore, Solenne et Nouvelle-Aurore.
- TGV entre Port-Aurore et Nouvelle-Aurore, avec rame visible et déplacement progressif sur la voie. Solenne conserve sa liaison aérienne existante.
- Bus urbain dans Nouvelle-Aurore : embarquement à un arrêt, déplacement visible sur le trajet et arrivée progressive à l’arrêt choisi, sans téléportation.
- Optimisation initiale : mise en pause de la simulation des piétons et voitures lointains, avec reprise à proximité.

Le contrôle de build valide la syntaxe JavaScript et les références de fichiers. Les trajets et interactions doivent encore être testés en jeu sur navigateur, clavier/manette et mobile avant publication.


## v40.1 · Hôtels de luxe dans les trois nations
- Grand Hôtel Port-Aurore et Grand Palace Nouvelle-Aurore, avec réceptionniste, halls accessibles et façade hôtelière. L’Hôtel Lagon Bleu de Solenne devient le Palace du Lagon Bleu.
- À la réception, choix d’une chambre supérieure, Deluxe ou suite présidentielle; séjour de 24 heures de jeu avec expiration sauvegardée.
- Suites intérieures visitables avec lit king size, salon, télévision, salle de bain, minibar et service en chambre. Retour au hall sans sortie forcée de l’hôtel.
- Restaurant gastronomique, conciergerie, transfert aéroport, bagagerie, piscine, spa, hammam et massages interactifs.
- La version v40 comprend aussi la troisième ville, ses infrastructures, commerces, présidences nationales, TGV et bus parcourus. Les véhicules lointains sont mis en pause pour alléger la simulation.

Vérification exécutée : `node scripts/check.mjs` passe. Les parcours, réservations et interactions doivent être validés en navigateur avant publication.


## v41 · Vie quotidienne et contrats
- Refuge animalier dans Nouvelle-Aurore et Solenne : adoption d’un chien ou d’un chat, suivi qui accompagne le joueur à pied et monte en voiture, nourriture, toilette, promenade, dressage et garde pendant les déplacements.
- Agenda interactif : concert, festival, match, course organisée, marché nocturne (après 18 h) et fête nationale. Les matchs et concerts utilisent les mini-jeux existants.
- Contrats avec GPS et minuterie : livraison urgente, dépannage, transport VIP et trajet interurbain. Le contrat se valide par interaction à destination; le VIP exige une voiture.
- Gestion du logement : factures journalières, réparations, baux, revenus locatifs et soirées à domicile avec les amis.
- La base avait déjà baignade, activités de plage, beach-volley, pêche, météo pluie/orage/brouillard, alternance jour/nuit, douches, missions ambulance/pompier/police et transports. Ces systèmes sont conservés.

Le contrôle de build vérifie la syntaxe, les références de fichiers, l’ordre de chargement et les points d’entrée des nouveaux systèmes. Les interactions en navigateur restent à tester avant publication.


## v49 · Aurore OS
Téléphone complet : voir CHANGELOG. Fichiers : js/phone49-core.js, js/phone49-apps.js, css/phone49.css.
