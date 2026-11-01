# Port-Aurore RP v12
- 16 métiers (livreur, taxi, policier, ambulancier, pompier, chauffeur de bus, routier, mécanicien, pompiste, infirmier, pêcheur, docker, serveur, facteur, éboueur, agent de sécurité), chacun avec ses missions, son temps sur place, son salaire et ses exigences (permis, rang).
- 5 grades par métier (Apprenti, Junior, Confirmé, Senior, grade max propre au métier) : XP à chaque mission, promotion automatique avec prime, salaire x1 à x2,1 et gains de mission majorés.
- Uniformes : gilet, casque et badge aux couleurs du métier, visibles sur le personnage.
- Véhicule professionnel livré à l’embauche (taxi, police, ambulance, pompiers, bus, camion, scooter) et obligatoire pour les missions concernées.
- Stationnement : parkings payants au-delà d’1 h, amende de 40 $ pour stationnement gênant sur la chaussée.
- Personnalisation : 12 teintes, néons, aileron, barre LED (sauvegardés).
- 8 entreprises achetables (4 nouvelles : garage, restaurant, transports, station-service).

# v13
- Police et gendarmerie (17e métier), arrestations réelles (proximité d’une patrouille, ou recherche trop longue), amendes (excès de vitesse, mandat à 300 $), prison avec cellule, travail, avocat et caution, tribunal (contestation, réhabilitation).
- 5 organisations (3 gangs fictifs, un syndicat, une chambre de commerce) avec rangs et rivalités ; 6 missions criminelles fictives en argent sale (saisi à l’arrestation).
- Réputation : notoriété criminelle (5 niveaux) et réputation par organisation.
- 7 événements de ville aléatoires qui modifient gains, risques et bénéfices.
- Gestion d’entreprise : employés, stock, et prix des produits qui influencent désormais les bénéfices.
- Nouvelles applis : Justice, Organisations, Gestion. Lieux : commissariat et tribunal à l’ouest, gendarmerie et prison à l’est.


## Vérification v13 et améliorations incluses
- Le pack comptait déjà 17 métiers (16 v12 + gendarme), avec 3 missions nommées par métier, salaire journalier, 5 grades, XP, primes de promotion, uniforme coloré et véhicule pour les métiers concernés.
- Il compte 8 entreprises achetables au total : 4 initiales + garage, restaurant, transports et station-service.
- Correction : le Pôle Emploi annonçait encore 16 métiers; il affiche maintenant 17 et les salaires sont ajustés au grade courant.
- L’application Emploi affiche désormais le salaire de chacun des métiers, pas seulement trois postes. Le panneau de carrière indique progression XP, seuil de promotion, missions du métier et description.
- Brief des missions amélioré avec activité, prime estimée et rappel du véhicule requis; ajout de détails visuels aux uniformes de terrain et de sécurité.
- Validation réalisée : fichiers JavaScript vérifiés pour la syntaxe.


# v14
- Chaque métier a désormais sa propre mécanique (tournées, poursuites, incendies, triage, pêche, diagnostics, mémoire). Détails dans CHANGELOG.md.
- Test automatisé : une mission de chacun des 17 métiers lancée et terminée sans erreur.


# v18 · Personnage et accessoires
- Modèle du personnage enrichi : finitions des vêtements, visage et chaussures, sac à dos détaillé.
- Création du personnage : réglages visuels du sac à dos, collier, boucles d’oreilles et montre, en plus des options déjà présentes.
- Les accessoires sont rendus dans l’aperçu et dans le jeu; les choix restent sauvegardés.
- Vérification de syntaxe réussie avec scripts/check.mjs.


# v19 · Voitures
- 10 modèles de marques ajoutés (Benz, Lambo, Ford, Toyota, Ferrari, Porsche, BMW, Honda, Jeep, Hyundai) : proportions tuées par modèle, achetables et dans la circulation.
- Feux de jour et diffuseur arrière ajoutés; contrôle de syntaxe réussi.
- Rendu non vérifié visuellement dans l’environnement de build : à tester dans le navigateur.
