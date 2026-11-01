# Port-Aurore RP · v19 · voitures refaites
## Manette
- Prise en charge des manettes (Xbox, PlayStation et compatibles) : stick gauche pour marcher et conduire, stick droit pour la caméra.
- A interagir, B fermer, X klaxon, Y téléphone, LB sac à dos, RB carte, Start pause, RT courir, LT frein.
- Croix directionnelle pour naviguer dans les menus et les panneaux, A pour valider.

## Sons
- Chaque modèle a son moteur : timbre, grave, grondement et cadence des cylindres (4 cylindres, V8 rugissant, moteur plat, moto, bus diesel…).
- Le son suit la vitesse et la montée des régimes de la voiture conduite.
- Les voitures de la circulation restent sur le son générique.

## Voitures
- 10 nouveaux modèles achetables au concessionnaire : Benz Berline Luxe, Lambo Wedge, Ford Muscle, Toyota Compacte, Ferrari Rouge GT, Porsche Coupé, BMW Sport Sedan, Honda Citadine, Jeep Tout-Terrain, Hyundai Familiale.
- Chaque modèle a ses proportions (longueur, largeur, hauteur, garde au sol, roues) et apparaît aussi dans la circulation.
- Rendu : feux de jour LED sur les phares, bas de caisse et diffuseur arrière sur les sportives.
- Les sportives gardent jantes, étriers et aileron de la v7.

# Port-Aurore RP · v18 · personnage et accessoires
- Personnage amélioré : vêtements avec coutures, boutons et poches; visage, chaussures et sac à dos plus détaillés.
- Accessoires visibles et personnalisables dès la création : lunettes, barbe, sac à dos, collier, boucles d’oreilles et montre.
- Les choix du personnage sont conservés dans la sauvegarde et visibles dans l’aperçu 3D.

# Port-Aurore RP · v17 · la ville vit avec toi
Inspiré de Lagos Life et de OneState RP. Ajouts co-conçus avec ClickUp Brain.
- Départ dans la vie au moment de créer le perso : Héritier ($4 500 + berline + permis B, mais XP −25 %), Standard, ou Débrouillard ($60 + micro-crédit de $300 remboursé $30/jour, missions +10 %, XP +25 %).
- Compétences (Conduite, Technique, Charisme, Commerce, Forme), niveaux 1 à 10 : études à la Bibliothèque (ouest) et XP à chaque mission. Bonus de paie, de bénéfices, besoins qui baissent moins vite.
- Élection municipale tous les 2 jours de jeu : 3 candidats avec leur politique (paie, salaires, bénéfices, prix des transports), sondage en direct, vote en personne à la Mairie, campagne ($100). Le programme du gagnant s’applique à toute la ville.
- Renommée niveaux 1 à 50 avec titres et primes, et 3 défis du jour (missions, km en voiture, études, course, transports, vote…).
- Appli Transports : danfo, keke et okada, prix au km, embouteillages aux heures de pointe (7h-9h30, 17h-19h30), petite chute possible en okada.
- Circuit des Docks (est du port) : 3 courses de rue en voiture, portiques, compte à rebours, faux départ, médailles or/argent/bronze, records.
- Le Trèfle (nord-est) : machine à sous animée (3 mises, retour ~97 %) et bar.
- Nouvelles applis : Ma Vie, Mairie, Transports. HUD : renommée, défis, maire, go-slow.

# Port-Aurore RP · v15 · GPS, carte aérienne et déploiement
- GPS avec vrai itinéraire calculé sur les rues (plus court chemin), tracé sur la mini-carte, sur le plan 2D et au sol en 3D avec chevrons animés.
- Guidage dans le HUD : prochaine direction (à gauche, à droite, demi-tour), distance restante et temps estimé à pied ou en voiture.
- Itinéraire automatique vers l’objectif de mission en cours (orange ou vert), en plus du repère GPS (bleu).
- Nouvelle carte aérienne 3D (touche M ou bouton Carte) : vue plongeante sur la ville en direct, icônes des lieux, noms des quartiers, filtres (Emploi, Commerces, Services, Loisirs, Maison), zoom, déplacement au doigt, pincer pour zoomer, recentrage. Touche une icône ou un point pour tracer l’itinéraire. Le plan 2D reste accessible.
- Correctif important : créer un nouveau personnage figeait le jeu (données de chantier et de prix effacées). Réparé.
- Déploiement : README, render.yaml (site statique Render), package.json, vérification automatique GitHub Actions, .gitignore, .nojekyll.

# Port-Aurore RP · v14 · un vrai gameplay par métier
- Livreur, facteur, éboueur, chauffeur de bus : tournées à plusieurs arrêts (3 à 5), arrêt complet obligatoire pour facteur, éboueur et bus, confort des voyageurs pour le bus.
- Taxi : 3 profils de clients (pressé, touriste, habitué), jauge de confort (chocs, vitesse excessive) qui fait varier le pourboire.
- Routier : chargement au dépôt puis jauge d’intégrité de la cargaison, chaque choc abîme le fret.
- Police et gendarmerie : vraie poursuite, le suspect fuit dans les rues, rapproche-toi pour l’interpeller, il s’échappe si tu le perds 15 s.
- Ambulancier : état du patient qui baisse en continu, stabilisation sur place puis course jusqu’à l’hôpital.
- Pompier : 3 foyers visibles qui grandissent, à éteindre à pied avec la lance, chrono avant propagation.
- Docker : 3 conteneurs à transporter à pied entre le quai et la zone de stockage (caisse visible sur le personnage).
- Pêcheur : 3 lancers, appuie sur E quand ça mord, puis vente des prises à la criée selon leur valeur.
- Mécanicien, infirmier, pompiste, agent de sécurité : diagnostic sur place avec choix de la bonne intervention.
- Serveur : mémorise la commande, puis retrouve-la au comptoir.
- Note de mission (1 à 3 étoiles) qui module la paie et l’XP. Panneau de mission adapté à chaque métier.

# Port-Aurore RP · v13.1
- Audit carrière : 17 métiers présents, 8 entreprises, missions nommées, salaires, grades, XP/promotions, uniformes et véhicules professionnels.
- Correction du compte métier affiché au Pôle Emploi (17, au lieu de 16) et salaires basés sur le grade actuel.
- L’application Emploi détaille maintenant les salaires des 17 métiers; le Pôle Emploi affiche missions, description et progression avant promotion.
- Briefs de mission clarifiés; petits détails visuels ajoutés aux uniformes.
- Voir NOTES_v12.md pour le périmètre complet et l’audit.

# Port-Aurore RP · v12
Voir NOTES_v12.md : 16 métiers, grades, XP, uniformes, véhicules pro, stationnement, personnalisation, 4 entreprises.

# Port-Aurore RP · v10

## Phase 5 · Économie et immobilier
- Compte bancaire enrichi : dépôts, retraits, virements aux amis, paiements et relevé des opérations.
- Salaires journaliers par métier et bénéfices déposés automatiquement pour les entreprises possédées; les missions restent rémunérées à la livraison.
- Appartement à louer ou acheter, loyer, électricité/eau, impayés, paiements et décoration achetable qui apparaît dans l’intérieur.
- Quatre entreprises à acquérir et suivre : café, supérette, boutique et pharmacie.

## Phase 8 · Téléphone et services numériques
- Nouveaux contacts, appels simulés, urgences, annonces, réseau social fictif, immobilier, entreprises et emploi.
- Les applis existantes restent accessibles : messages, banque, GPS, taxi, livraison, photos et réglages.
- Fil d’actualité persistant, publications et mentions J’aime, notifications d’appel, statut réseau lié aux coupures.

## Mobile
- Commandes tactiles dédiées pour téléphone et carte, boutons plus lisibles, espaces tactiles agrandis et optimisation paysage.

# Port-Aurore RP · v9

## Phase 4 · Véhicules et transports
- Ajout de motos, scooters, bus urbains, camions de livraison et véhicules de service (police, ambulance, pompiers) en plus des modèles existants.
- Concessionnaire avec achat et revente, garage personnel pour sortir/ranger ses véhicules et personnalisation de peinture.
- Station-service : plein, réparation et révision. Le carburant diminue à l’usage.
- Auto-école : examen pratique sans collision, permis auto, moto, poids lourd et service. Les permis débloquent les achats concernés.
- Véhicules de service et transports ajoutés à la circulation. Parkings indiqués sur la carte.

## Ville et carte
- Extension des quartiers vers l’est, l’ouest et le nord, nouveaux axes routiers et davantage de façades, bâtiments et circulation.
- Carte GPS redessinée : quartiers colorés, rues hiérarchisées, empreintes de bâtiments, parkings, lieux d’intérêt, repère GPS et légende. Mini-carte recentrée et zoomée sur le joueur.

# Port-Aurore RP · v8

## Accueil et création de personnage
- Nouveau menu d’accueil avec reprise de partie, création de personnage et guide intégré pour les débutants.
- Créateur enrichi : teint, couleurs, coiffures, hauts, bas, lunettes et barbe, avec aperçu 3D.
- Le guide explique les premières étapes, les lieux utiles et les commandes clavier.

## Vie dans les bâtiments
- Clients visibles dans les commerces et files d’attente à la supérette et à la banque.
- Clients assis au café et personnes en attente au Pôle Emploi et à l’hôpital.
- Danseurs animés sur la piste du Club Néon.

# Port-Aurore RP · v7

## Ton appartement, un vrai chez-toi
- Appartement complet de 4 pièces : chambre, salle de bain, cuisine ouverte et grand salon, avec vraies portes qui s'ouvrent quand tu approches.
- Murs percés de vraies fenêtres (cadres, vitres, rideaux), plafonds, plinthes, parquet, carrelage, damier en cuisine.
- Vue en coupe : les murs qui te cachent s'abaissent tout seuls, comme dans les Sims.
- Plus de 25 objets utilisables, sans menu pour les actions :
  - Lit : ton perso marche jusqu'au lit, s'assoit, s'allonge sous la couette, des « Z » s'envolent et le temps accélère jusqu'au matin (ou jusqu'à ce que tu te lèves avec E).
  - Canapé, fauteuil, chaises, tabourets : il s'assoit vraiment ; la télé allumée remonte l'humeur.
  - Télé à 3 chaînes animées (infos, foot, dessins animés), radio, lampes de chevet, lampadaire, interrupteur, rideaux.
  - Cuisine : frigo qui s'ouvre (portions de nourriture), plaque de cuisson avec poêle, flamme et vapeur, puis repas servi à table que tu manges assis.
  - Évier, machine à café, douche avec eau qui coule, toilettes, lavabo, miroir (coiffure), garde-robe qui s'ouvre (vêtements gratuits), ordinateur (banque en ligne, jeux), livres, plante à arroser, tapis de sport, guitare.
- Supérette : nouvelles « Courses pour le frigo ».

## Vrais intérieurs partout
- Pôle Emploi, Supérette, Banque, Club Néon, Hôpital, Café Aurore, Boutique Mode et Pharmacie entièrement refaits : rayonnages remplis de produits, frigos à boissons éclairés, guichets vitrés, coffre-fort, distributeurs, piste de danse LED animée, platines DJ, faisceaux lumineux, lits d'hôpital avec moniteurs cardiaques animés, vitrine à viennoiseries, machine à espresso, portants de vêtements, mannequins, cabines d'essayage.
- Chaque lieu a ses actions : s'asseoir, danser, boire un verre au bar, se faire soigner allongé, distributeur…
- Éclairage intérieur réel (lampes, ombres, reflets), qui suit le jour, la nuit et les coupures de courant.

## Vraies voitures
- Nouvelle carrosserie lissée d'un seul tenant : capot, pare-brise incliné, toit, lunette, vrais passages de roues.
- Vitres teintées avec reflets, montants, joints de portes, poignées chromées, rétroviseurs, plaques d'immatriculation.
- Peinture métallisée vernie qui reflète le ciel, phares avec optiques et feux de jour, feux arrière.
- Jantes alliage à branches, pneus arrondis, disques et étriers de frein.
- Habitacle visible : sièges, tableau de bord, volant.
- Les roues avant braquent, la caisse penche dans les virages, feux stop quand tu freines, feux de recul.
- Berline, taxi, SUV, sportive et danfo ont chacun leur propre silhouette.

## Moteur
- Moteur 3D embarqué dans le projet (plus besoin d'Internet pour le charger), couleurs plus justes, reflets du ciel.
- Asphalte plus fin, nuit un peu plus lisible.

# Port-Aurore RP · v6

- Correctif : la Phase 3 (v5) ne se chargeait pas à cause de deux noms déjà pris (SKINS, PANTS). Réparé.
- Voitures : carrosserie arrondie extrudée (capot, pare-brise, toit, lunette), vitres teintées, montants, passages de roues, jupes latérales, phares et feux avec barre, roues à 5 branches. Berline, taxi, SUV (barres de toit), sportive (aileron), danfo.
- Intérieurs : sols carrelés ou en parquet, murs avec soubassement, fenêtres, tableaux, mobilier détaillé par lieu (bureaux et écrans à Pôle Emploi, rayons et frigos à la supérette, guichet vitré, DAB et coffre à la banque, lit, canapé, TV et cuisine à l’appartement, DJ, bar, boule à facettes au club, lits et rideaux à l’hôpital, tables et vitrine au café, portants, mannequins et cabines à la boutique, rayons à la pharmacie).

# Port-Aurore RP · v5 (phase 3 : personnage et vie quotidienne)

- Salon de coiffure (repère rose) : coiffure, couleur de cheveux, barbe, teint, lunettes.
- Boutique Mode : couleur et type de haut, bas (pantalon, short, jupe) et sa couleur, chaussures, sac à dos.
- Sac à dos (touche I) : 12 objets, nourriture, boissons, soins.
- Supérette et pharmacie : achats rangés dans le sac.
- Soif ajoutée aux besoins ; la déshydratation fait perdre de la santé.
- Maladie : la pluie prolongée dehors rend malade ; médicaments ou hôpital pour guérir.
- Repos : s’asseoir fait regagner de l’énergie ; alertes de soif et d’épuisement.
- Gestes (touche G) : saluer, danser, s’asseoir, applaudir.
- Habitants : menu de relation (discuter, saluer, offrir un verre, danser, nouvelles) avec 4 niveaux.

# v4

## Personnages
- Silhouettes arrondies : torse effilé, épaules, bassin, ceinture, mains, chaussures avec semelle.
- Visages : yeux, sourcils, nez, bouche, oreilles ; lunettes et barbes aléatoires.
- 8 coiffures (court, long, chignon, afro, queue, ras, casquette, chauve).
- 5 tenues (t-shirt, manches longues, veste, sweat à capuche) + pantalon, short ou jupe, sacs à dos.
- Genoux articulés : vraie foulée en marche et en course.
- Habitants de tailles variées, palettes de couleurs élargies.
- Création de perso : aperçu 3D qui tourne, choix cheveux / coiffure / tenue (sauvegardés).
- Optimisation : les habitants lointains ne sont plus dessinés.

## Bâtiments
- Nouvelles façades : enduit, brique, pierre, verre, tôle ondulée (rideaux, stores, jardinières, rebords).
- Rez-de-chaussée séparé : vitrines (portes roulantes pour les entrepôts), éclairées la nuit.
- Tours à gradins en verre dans le centre, toits à deux pans dans Les Hauts, entrepôts au port.
- Balcons, châteaux d’eau, antennes, cages d’escalier sur les toits.
- Banque à colonnes, croix et héliport de l’hôpital, néons du Club, étals de fruits à la supérette.

## Décor
- Arbres détaillés : feuillus, flamboyants, sapins (Les Hauts), palmiers (Port).
- Lampadaires à crosse, bordures de trottoir, fosses d’arbres.
- Place : fontaine à étages avec jets d’eau animés, bancs, jardinières, drapeaux qui flottent.
- Parc : allées, bassin avec nénuphars, massifs de fleurs, kiosque, bancs.
- Mobilier urbain modélisé (bancs, abribus, poubelles, boîtes aux lettres, bollards, caisses, barils, haies).
- Port : conteneurs empilés, 3 grues portiques, quai avec bollards et pneus, jetée et phare avec faisceau tournant la nuit.
- Bateaux amarrés qui tanguent, voiliers au large, cargo, mouettes.
- Mer et bassins avec vagues animées, herbe texturée, collines à l’horizon.

## Véhicules
- Calandre, plaques, rétroviseurs, joints de portières, poignées, passages de roues, bas de caisse.

Gameplay, sauvegardes et contrôles inchangés.

# v16 · Architecture et intégration
## Bâtiments
- 7 familles de façades : haussmannien (pierre, fenêtres à la française, garde-corps), volets colorés, brique à arcs, bandeaux modernes, mur-rideau réfléchissant, trame art déco, tôle industrielle. Plusieurs teintes par famille.
- Fenêtres alignées en travées entières : plus de fenêtres coupées aux angles.
- Silhouettes : pans coupés sur les angles de rue, angles arrondis « paquebot », socles + tours, tours art déco à gradins, maisons mitoyennes de hauteurs différentes.
- Toits : mansardes en zinc avec lucarnes et cheminées, croupes et pignons en tuiles, sheds et voûtes pour les entrepôts, terrasses avec acrotère, château d'eau, clim, panneaux solaires.
- Reliefs : soubassement, bandeau, corniches, balcons filants en fer forgé, dalles en saillie, pilastres, chaînages d'angle, ailettes.
## Intégration des objets
- Occlusion au pied des murs et des objets, bande d'ombre au sol le long des immeubles.
- Ombres de contact sous arbres, lampadaires, mobilier, voitures, passants et joueur.
- Enseignes en caisson avec rampe, enseignes drapeau, stores bannes rayés avec bras, portes encadrées avec marche et appliques allumées la nuit.
- Ombres portées mieux collées aux objets (biais corrigé), zone d'ombre élargie.
## Lumière
- Ciel moins saturé avec brume d'horizon, rebond de lumière chaud au sol, exposition ajustée.
- Façades regroupées par matériau : moins d'appels de dessin malgré plus de détails.
