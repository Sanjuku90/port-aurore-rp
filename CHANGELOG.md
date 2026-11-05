# v52 · Horizons (inscription instantanée, ciel, mer, terre, arène)
- Inscription instantanée : plus aucun e-mail de confirmation. Le compte est actif tout de suite (sauvegarde en ligne + cadeaux). Les anciens comptes « à confirmer » sont activés automatiquement.
- Mot de passe oublié : par e-mail si un fournisseur est configuré (facultatif), sinon l’admin génère un mot de passe temporaire depuis /admin.
- Aviation pilotable : Aéro-club (PAX et Solenne), formation + brevet + licence pro, vol 3D piloté (gaz, tangage, roulis, décrochage, atterrissage noté, crash), anneaux, 7 missions, 3 avions à acheter.
- Navigation maritime : permis bateau, 4 bateaux (yacht du Yacht Club compté), traversées réelles Port-Aurore ⇄ Solenne, 6 îles à explorer, navettes passagers, croisières VIP, régates en saisons.
- Agriculture & élevage : Domaine des Alizés, 5 cultures, champs extensibles, 5 améliorations, poules/chèvres/vaches, ouvriers, coopérative à prix saisonniers, commandes de restaurants.
- Arène : karting, bowling (nouveau mini-jeu), paintball, esport, équitation (cheval à acheter), cuisine pro + service en brigade ; ligues à 3 niveaux, rivaux, primes, trophées.
- Carrières à 5 rangs par secteur, notoriété, titres, trophées et appli téléphone « Aurore Horizons ».

# v51 · Vrais comptes, histoire principale, filière et famille
- Comptes joueur complets : confirmation obligatoire par e-mail (Resend ou Brevo), mot de passe oublié, changement de mot de passe, déconnexion de tous les appareils, suppression du compte, blocage après erreurs répétées.
- Sauvegarde en ligne multi-appareils : synchronisation automatique, chargement à la connexion sur un nouvel appareil, choix explicite en cas de conflit.
- Le panneau compte est maintenant visible dans le menu titre (il était masqué par le menu v27 en v50.1).
- Cadeaux admin réservés aux comptes confirmés ; la console affiche le statut de l’adresse et de la sauvegarde.
- Histoire principale « Les Lumières d’Aurore » : 3 chapitres, 9 missions, 3 fins, conséquences sur la vitalité des villes et titres.
- Filière cacao & café : plantation, chocolaterie, boutique, transport et fret, import/export, prix dynamiques, commandes d’entreprises.
- Vie de famille : couple, mariage, vie commune, enfants qui grandissent, école, anniversaires, héritier.
- Appli téléphone « Aurore Destin » et 12 succès.

# v50.1 · Comptes joueur et cadeaux admin
- Inscription et connexion par e-mail et mot de passe depuis le menu; mots de passe hachés côté serveur, sessions sécurisées par cookie HttpOnly.
- Cadeaux admin ciblés sur l’adresse exacte du compte, vérification du destinataire, montant limité et historique serveur. Le cadeau est réclamé dans le jeu puis crédité dans la sauvegarde locale.
- Nouveau serveur Node.js sans dépendances, limites de tentatives, stockage des comptes et des cadeaux sur disque persistant, console admin protégée par `ADMIN_KEY`.
- La progression reste locale; aucune synchronisation entre appareils. Vérification e-mail et récupération de mot de passe non configurées.

# v50 · Le monde vivant
- Alertes locales dynamiques dans Port-Aurore, Nouvelle-Aurore et Solenne : ravitaillement, mobilisation de quartier, panne d’infrastructure et scène culturelle.
- Bulletin intégré à Aurore Life, GPS vers un repère d’intervention, acceptation et résolution sur place. Les alertes expirent si personne n’intervient.
- Conséquences persistantes : la vitalité de chaque cité monte ou baisse, et influence les récompenses futures. Historique des interventions sauvegardé localement.
- Contrôle de syntaxe et de chargement ajouté pour le module v50. Architecture solo conservée; le multijoueur reste un chantier serveur distinct.

## v49 · Aurore OS (téléphone complet)
- 10 applis reliées au gameplay : Aurore Social, Bank, GPS, Immo, Jobs, Auto, Market, Services, Travel, Life.
- Notifications HUD avec boutons d'action (à pied et en voiture), appels entrants répondre/refuser, sonneries, mode silencieux.
- Verrouillage personnalisable (fond, horloge, message, code PIN), recherche d'applis et de lieux, icônes déplaçables (appui long), badges (messages, factures, livraisons).
- Réservations « payer → se déplacer → effet sur place » (table, médecin, contrôle technique, mairie, billets, réunions).
- Carte bancaire gelable, épargne avec intérêts, prêts, crypto AUC, impôts, Internet, assurances, cambriolages, locataires, domotique facturée.
- Mode conduite, mode vacances, économie de batterie, synchronisation par code PA49.

## v48 · Commandes tactiles et fluidité mobile
- Commandes de déplacement en joystick flottant: le joueur pose le pouce dans la zone gauche, le stick apparaît sous le doigt, avec deadzone et réponse progressive; capture du pointeur et reset à la pause, perte de focus ou annulation tactile.
- Cluster d’actions dédié au pouce droit: interaction, course, chat, téléphone, carte et commandes du véhicule; raccourcis Carte/Téléphone retirés du HUD supérieur en tactile pour supprimer les doublons visibles dans la capture.
- Caméra toujours orientable par glissement sur la surface de jeu; commandes et joystick respectent les zones sûres et s’adaptent au mode paysage.
- Optimisation mobile: rendu cinématique post-traité désactivé par défaut sur appareils tactiles (réactivable dans Graphismes), résolution de rendu abaissée et adaptative, pluie ramenée de 1 100 à 420 particules.
- Contrôle: syntaxe, présence des contrôles tactiles, ordre de chargement et version de cache vérifiés. Pas de navigateur mobile disponible ici: le rendu réel et le confort doivent encore être testés sur iPhone.

## v47 · Déploiement de la Métropole
- Déploiement réel des secteurs Platinum Heights, Aurore Grand Mall, Aurore Waterfront, Federal Boulevard, Diplomatic Quarter, Innovation City, University Heights, Nouvelle-Aurore Premium, Exhibition District, Corridor métropolitain, Emerald Coast, Solenne Marina, Pearl Island, Solenne Nature Reserve et Solenne International.
- Plus de 60 nouveaux ensembles visitables: résidences achetables ou louables, grand mall, hôtels, marina, terminal de croisière, aquarium, ambassades, ministères, centres de recherche, pôle médical, congrès, logistique, contrôle routier et services autoroutiers.
- Façades dédiées par famille (résidences, mall, resorts, terminaux, industrie, stations, parkings, villas); intérieurs à la demande réutilisant les systèmes v46.
- Transports jouables: métro M1 à Port-Aurore, métro M2 à Nouvelle-Aurore, navette touristique à Solenne, autocar A1 et ferry Port-Aurore–Solenne. L’A1 contourne la piste PAX par le sud; aucune route ne traverse l’océan.
- Ajout du centre de secours métropolitain, du dépôt de bus, de la centrale électrique, du traitement des eaux et du centre de recyclage, avec missions interactives.
- Extension des voies piétonnes et des terrains, voiries locales, gares et repères GPS. L’aéroport PAX existant est conservé et complété par fret, parking et hôtel.
- Vérification: syntaxe JavaScript, références de fichiers, ordre de chargement et marqueurs de couverture v47 contrôlés par `npm run check`. Le rendu et les parcours restent à valider dans un navigateur, notamment sur iPhone.

## v46 · Fondations métropolitaines
- Noyau de quartiers activables/désactivables, chargement progressif, déchargement, LOD à quatre niveaux, fenêtres instanciées, matériaux partagés et PNJ figés à distance.
- Intérieurs construits à l’entrée et détruits à la sortie; familles de salles prêtes pour bureaux, banques, hôtels, logements, commerces, santé, diplomatie, recherche, expositions et logistique.
- Économie, immobilier, entreprise, bourse, missions et application téléphone Métropole.
- Premier secteur construit: Aurore Business District, avec ses tours, centre financier, bourse, hôtel et centre de congrès.
- Correctif de sortie des intérieurs v44.

## v42
- Coupures de courant : rares (25 à 45 min) et courtes (18 à 28 s), réglables dans Pause (désactivées / rares / normales), jamais en intérieur.
- Carte 3D réparée.
- Nouvelle-Aurore : la ville se construit entièrement (bug bloquant corrigé), ~96 immeubles, trottoirs, passages piétons, lampadaires, arbres, voitures garées, passants, circulation.
- TGV : viaduc surélevé, vraies gares avec quais, nouveau train 3 voitures, caméra de trajet ; bus jaune.
- Hôtels : réception corrigée, chambres posées sur un vrai terrain (plus de vide au-dessus de la mer).
- Course organisée de l'agenda : démarre au Circuit des Docks ; GPS de la gare TGV corrigé.

# Changelog

## v45 · Lagune Noire (refonte visuelle)
- Rendu cinématique HDR : bloom en cascade (lampadaires, vitrines, néons et phares brillent la nuit), tonemapping ACES, étalonnage jour / heure dorée / nuit / intérieur, vignette, grain argentique, aberration chromatique, reflets d'environnement sur carrosseries et vitres.
- Effets de jeu : flou radial à haute vitesse, voile rouge et battement de cœur quand la santé est basse, flash et secousse caméra à l'impact.
- Nouvelle interface joueur : panneaux « lame » chanfreinés ambre sodium, nom en grand, jauges segmentées colorées, argent en grand avec gains/pertes animés, radar circulaire avec boussole et nom du quartier, compteur de vitesse analogique avec rapport engagé, invites de touche [E], notifications à icônes, bannières d'arrivée (Port-Aurore, Aéroport, Nouvelle-Aurore, Solenne, intérieurs).
- Correctif : le bouton Pause chevauchait Sac/Gestes, il rejoint maintenant le rail central.
- Écran titre, menu, créateur de personnage, pause, fenêtres, téléphone et commandes tactiles réhabillés (Anton + Chakra Petch).
- Mode photo : F2 masque l'interface. Paramètres › Graphismes : Rendu cinématique (Désactivé / Cinématique / Ultra), grain, effets de vitesse. « Performance » coupe tout le post-traitement.

## v44 · Métropole de la Lagune
- 36 nouveaux lieux emblématiques répartis entre Port-Aurore, Nouvelle-Aurore et Solenne, chacun avec façade, intérieur visitable, accueil et activité contextualisée.
- Marchandage de voitures d’occasion, balade équestre, snooker, examens avec diplômes sauvegardés, chorale, studio radio, entraînement, loisirs, santé, administration et hôtels.
- Application « Guide Lagune » : liste filtrée par carte et catégorie, distances et repères GPS; Taxi reste disponible dans Port-Aurore, TGV/bus et avion dans les autres cartes.
- 21 halls résidentiels visitables ajoutés pour densifier les quartiers; passants programmés fréquentent les lieux pendant la journée.
- Console `/admin` pour attribuer un cadeau en argent à la sauvegarde locale active. Le jeu reste solo, aucune base de comptes en ligne n’est présente.


## v43 · Saisons, routines et habitants mémorables
- Cycle tropical de quatre saisons jouant sur 28 jours de jeu : saison sèche, Harmattan, saison des pluies et saison des fêtes, avec ambiance visuelle légère et état affiché.
- À la maison : douche, brossage des dents et lessive avec cycle de lavage, usure quotidienne des vêtements et progression sauvegardée.
- Les habitants gardent des souvenirs de vos conversations; ils proposent une course quotidienne avec GPS, délai et récompense.
- Les systèmes existants de plage, secours, événements, animaux, contrats et immobilier restent en place.


## v41 · Vie quotidienne, événements et animaux
- Refuges animaliers, adoption et suivi des soins/activités des animaux de compagnie.
- Agenda d’événements jouables : concerts, festival, match, course, marché nocturne et fête nationale.
- Contrats chronométrés à livrer/intervenir, incluant transport VIP et liaison interurbaine TGV.
- Factures et réparations du logement, baux et loyers journaliers, soirées à domicile.

## v40.1 · Hôtellerie de luxe
- Hôtels de luxe sur Port-Aurore et Nouvelle-Aurore; l’Hôtel Lagon Bleu est promu Palace du Lagon Bleu à Solenne.
- Réceptionnistes, réservation de 24 h de jeu, chambres supérieures, Deluxe et suites présidentielles avec intérieurs accessibles.
- Minibar, room service, restauration, conciergerie, transferts, bagagerie, spa, piscine, hammam et massages.

## v40 · Nouvelle-Aurore
- Troisième ville et infrastructures publiques interactives, commerces, présidence nationale.
- TGV visible entre Port-Aurore et Nouvelle-Aurore; bus urbain parcouru physiquement dans la nouvelle ville.
- Mise en pause de la simulation des piétons et voitures éloignés.


## v40 · Nouvelle-Aurore
- Troisième ville avec infrastructures publiques, services interactifs et commerces reliés au portefeuille du joueur.
- Présidence interactive dans chacune des trois nations.
- TGV visible entre Port-Aurore et Nouvelle-Aurore; bus urbain parcouru physiquement dans la nouvelle ville.
- Simulation des piétons et voitures lointains mise en pause pour réduire le travail par image.

## v33
- Quartier automobile Aurore : concession Prestige complète, étage, atelier SAV, piste chronométrée, Aurore Moto, Occasion, Exclusive, 11 nouveaux modèles, voitures interactives, achat/crédit/reprise/location, garage sauvegardé, appli Véhicules, fluidité mobile.

# v31
- **Résidences du Belvédère** : 14 villas de luxe (piscine, haies, portail, voitures), poste de garde. 5 à louer (24 h) ou acheter, les autres habitées (rachat possible). Intérieur : salon, cuisine (cuisiner), chambre (dormir), TV, console, ordinateur.
- **Résidence Palmeraie** : 4 immeubles à balcons, appartements à louer ou acheter.
- **Aurore Motors** : showroom vitré avec cadres lumineux, podium, plateaux tournants, 10 modèles (occasion → supercar), couleurs, essai routier de 2 min, livraison au parking, voitures sauvegardées.
- **Les Palmiers** : vrai centre commercial intérieur, 9 boutiques + food court + café + distributeur, clients PNJ. Achats réels : sac, tenues portées, bijoux, appareils et meubles utilisables à la maison.
- **Entreprises** : Mama Adjo, étal du marché, food truck, Mode Aurore, Aurore Tech, Arcade Néon, Aurore Motors. Achat, recrutement (candidats notés), formation, licenciement, prix, stock, agrandissement, salaires, caisse, revente, app téléphone « Business ».
- **Ville vivante** : 52 habitants avec métier, domicile et emploi du temps (travail, courses, sport, sorties, retour à la maison). Ils fréquentent les commerces (et paient tes entreprises), réagissent aux voitures, discutent (E).
- **Parc sportif** : terrain de foot à 5, 2 terrains de basket street, tribunes avec supporters, food truck. **Matchs 3D jouables** au clavier ou à la manette : foot (coéquipier, gardiens, adversaires) et basket 1 contre 1 (dribble, tir, dunk, interception).
- Caserne avec portes rouges et camions, allée de palmiers du campus.
- Correctif : le module v30 plantait au chargement (sports et marché inactifs).

# Port-Aurore RP · v29 · les activités deviennent des mini-jeux
- Nouveau moteur de mini-jeux (22 types) : timing, rythme (avec battle contre un rival), course/esquive (jet-ski, kayak, tortue…), attrape, mémoire, quiz, marchandage, cadence, photo, mini-golf avec physique, billard, pêche à la ligne, blackjack, machine à sous, penalty, respiration, code, beach-volley, pronostic + match en direct, équilibre, stand de tir, cuisson.
- Écran d’intro avec les touches, compte à rebours, écran de résultat (étoiles, record sauvegardé, gains proportionnels au score). Clavier (flèches, ZQSD, Espace), souris et tactile. Le monde 3D est mis en pause pendant la partie.
- Solenne : jet-ski, parachute, bouée, ski nautique, baptême de plongée (photos = carnet d’espèces), kayak, paddle, surf (ramer, take-off, glisse), beach-volley, yoga (souffle + postures), mini-golf 3 ou 4 trous, phare (montée + panorama), sorties en mer (photos dauphins/baleines, pêche au gros avec revente), marché (marchandage), soirée séga, piscine, danse et battle au Corail, atelier cuisine de Ti Kaz (ingrédients, découpe, cuisson), quiz du musée et de la distillerie, repas et remise à l’eau des tortues, pollinisation de la vanille.
- Les achats simples (glaces, souvenirs, location) restent des menus ; le repos (transat, spa, cinéma) garde son fondu.

# Port-Aurore RP · v28 · la vraie vie
- Métiers réalistes (17 métiers) : chaque mission est une suite d’étapes avec interactions (E). Livreur : aller au restaurant, annoncer la commande, attendre la préparation, prendre le sac, livrer, le client paie (espèces avec monnaie à rendre, carte ou déjà payé) + pourboire. Taxi : faire monter le client, lancer le compteur, encaisser. Police : témoin, poursuite, menottes, garde à vue, PV. Ambulancier, pompier, bus, routier, mécanicien, pompiste, infirmier, pêcheur, docker, serveur, facteur, éboueur, gendarme et sécurité ont tous leur scénario.
- Liste d’étapes dans le HUD, barre de progression, temps forts « MAINTENANT ! », 6 restaurants, La Poste, point relais, criée, pièces auto et terrasse du Café Aurore construits en ville.
- Solenne agrandie (1 580 m) : Pointe des Alizés et Anse Créole, 7 bâtiments où entrer (hôtel, Ti Kaz, Le Corail, musée, centre des tortues, boutique, distillerie), 30+ activités, baignade dans le lagon, la piscine et le bassin de la cascade, snorkeling, tyrolienne, location de scooters.
- Appartement : mode Aménager pour déplacer, tourner, ranger les meubles (sauvegardé).
- Vol : caméra recalculée après le mouvement de l’avion (fin des saccades et de la caméra dans la carlingue), altitude réelle (36 000 ft), vitesse en km/h et nœuds, turbulences légères, caméra et brouillard remis à zéro après l’atterrissage.

# Port-Aurore RP · v27 · extension du quartier des Horizons
- Nouveau quartier connecté au boulevard nord : cinéma Aurore, Galerie du Port, campus, caserne, commissariat et musée maritime.
- Parvis paysager, arbres, bancs, lampadaires, arrêt de navette et routes supplémentaires pour relier le quartier au reste de la ville.
- Chaque bâtiment propose une activité jouable : séances de cinéma, restauration, shopping, ateliers, initiation aux premiers secours et visites du musée.
- Les nouveaux carrefours alimentent aussi les destinations des missions de métiers pour faire circuler les joueurs dans ce nouveau secteur.

# Port-Aurore RP · v27 · Horizons : carte agrandie, aéroports, vols et île de Solenne
- Carte agrandie : de 512 m à ~1 760 m de large. Zone aéroportuaire à l’ouest (autoroute A1), quartier pavillonnaire « Les Hauts-Jardins » au nord, Stade Aurore (match du jour) et zone d’activités à l’est, périphérique avec circulation, forêts, éoliennes, collines repoussées.
- Aéroport International de Port-Aurore (PAX) : terminal ouvert à visiter (portes coulissantes, comptoirs d’enregistrement, écrans des départs animés, contrôle de sûreté avec barrière, salle d’attente où s’asseoir, duty free, café, porte A1 avec passerelle), piste 36/18 balisée et éclairée la nuit, tour de contrôle, hangar, parkings, navettes. Des avions décollent et atterrissent en continu.
- Vol AA 274 / AA 275 : billet au comptoir (éco ou affaires, carte d’embarquement), sûreté, embarquement, puis vol complet suivi en direct : repoussage, roulage, décollage, montée, croisière au-dessus des nuages, descente, atterrissage et roulage jusqu’à la porte. Caméras Cinéma / Extérieure / Hublot / Cabine (V), carte de suivi type écran de bord (M), annonces du commandant, son des réacteurs, vitesse ×1/×2/×4, « Passer ».
- Nouvelle carte : Île de Solenne (SLN), aéroport, village créole, marché, Hôtel Lagon Bleu (nuit, piscine, spa), bar de plage, ponton (excursion, plongée), chapelle, phare, plage et lagon.
- Menu principal professionnel : écran titre, menu vertical sur fond cinématique (port, avenue, piste avec décollage, terminal, Solenne), aperçu de sauvegarde, paramètres à onglets (graphismes, caméra, audio, vol), écran de chargement avec astuces, créateur de personnage plein écran à onglets, pause repensée, appli téléphone « Vols ».

# Port-Aurore RP · v26 · trajets réels et livreur en personne
- Taxi, Prestige, okada (moto-taxi), keke et danfo : plus de téléportation. Le chauffeur part d’un carrefour, traverse la ville (feux, virages, circulation) et se gare au bord de la route à côté de toi.
- Le chauffeur t’envoie un message à la commande et à son arrivée, puis attend jusqu’à 2 min 30 (rappel au bout d’une minute). Approche-toi et appuie sur E pour monter.
- Trajet complet jusqu’à la destination : vue intérieure (siège passager, tableau de bord, GPS animé, compteur du taxi) ou extérieure avec V, regard libre en glissant, vitesse ×1/×2/×4, « Descendre ici ».
- Okada et keke : tu es assis derrière le chauffeur, la moto se penche dans les virages. Danfo : arrêt en route pour un passager.
- Livraison de repas : un livreur arrive en scooter, marche jusqu’à toi (ou jusqu’à l’entrée du bâtiment), t’écrit « je suis arrivé » et t’attend. E pour récupérer la commande. Suivi en direct dans l’appli Livraison.
- Messages : les chauffeurs et livreurs ont leur fil de discussion (réponses rapides), notification en haut de l’écran.

# Port-Aurore RP · v25 · téléphone réaliste + caméra
- Téléphone entièrement refait : coque titane avec boutons latéraux, Dynamic Island (notifications, appels, alertes du jeu), écran verrouillé avec Face ID, reflets du verre, barre d’état réelle (réseau, 5G/SOS, batterie qui se vide dans la journée).
- Écran d’accueil : widgets Météo et Banque, pages qui glissent, dock (Appels, Messages, Plan, Radio), icônes dessinées en SVG au lieu des emojis, ouverture/fermeture animée des applis, 5 fonds d’écran.
- Applis natives : Messages (bulles, « en train d’écrire », saisie libre), Banque (carte, actions, retraits, virements, relevé), Plan (carte + recherche + itinéraire), Photos + vrai Appareil photo avec viseur en direct et zoom, Appels avec écran d’appel, Contacts, Réglages, Livraison avec suivi, Radio façon lecteur musical. Toutes les autres applis reprennent le style natif.
- Caméra du jeu : suivi lissé, recentrage auto derrière le joueur, zoom molette/pincement, touche V (Proche/Normale/Éloignée, sauvegardé), champ de vision qui s’ouvre avec la vitesse, regard en avant en voiture, plan d’ouverture cinématique.
- Cartes 2D retirées (mini-carte du HUD et grande carte 2D). Sensibilité caméra réglable dans Pause (Faible → Très élevée, souris + manette), plus vive par défaut.
- Correctif : taper dans un champ du téléphone ne déclenche plus les raccourcis du jeu (T, E, M, Entrée).

# Port-Aurore RP · v24 · catalogue mobilier par pièce
- Nouveau catalogue mobilier : filtres par pièce (Salon, Chambre, Cuisine & repas, Salle de bain, Bureau, Chambre d’enfant, Entrée, Balcon & jardin), compteur d’articles par pièce, recherche, « Dans mon budget », « Masquer mes meubles » et tri (prix, nom).
- Fiches lisibles : couleur du meuble, collection, prix, état (Acheter / Chez toi / somme manquante). Achat payé en cash puis banque, installation immédiate dans l’appartement.
- Nouvelle appli téléphone « Mobilier » : ouvre le catalogue directement sur une pièce et affiche ta progression par pièce.
- Mobilier : 150 nouveaux articles répartis en 15 collections (assises, tables, rangement, luminaires, plantes, textiles, décoration murale, accessoires, étagères, électronique, cuisine, chambre, salle de bain, enfants et extérieur). Catalogue de l’appartement porté à 204 articles; chaque nouvel achat est installé dans le logement et sauvegardé.
- Déploiement : scripts et styles versionnés (?v=24) pour que les joueurs reçoivent la mise à jour sans cache périmé.

# Port-Aurore RP · v23 · nouveau système de chantier
- 9 terrains au front nord (4 petits, 4 moyens, 1 grand « Îlot Aurore »), chacun avec son repère jaune : approche-toi et appuie sur E, ou ouvre l’appli Chantier.
- 6 bâtiments : maison familiale, villa, duplex, commerce (vitrine, store, enseigne du locataire), entrepôt (charpente métallique, bardage, portes sectionnelles), immeuble à louer (5 ou 7 étages, balcons, hall).
- Équipe à engager : architecte, ingénieur structure, électricien, plombier (Junior / Confirmé / Expert) et 1 à 4 maçons. Bouton « Équipe standard » pour tout engager d’un coup.
- Engins loués et animés : grue à tour (rotation, chariot, levage de palettes, fers, benne à béton), pelleteuse (cycle de creusage), camion toupie (toupie qui tourne, coulage du radier).
- 6 phases visibles : plans, terrassement (fouille, déblais), fondations (ferraillage puis radier), gros œuvre étage par étage (poteaux, murs bruts, dalles, échafaudage), réseaux (les étages s’allument), façade et finitions du haut vers le bas.
- Chantier à l’arrêt s’il manque un métier ou un engin : le gestionnaire indique quoi engager. Les travaux avancent aussi pendant le sommeil.
- Une fois livré : arrivée des locataires, loyers versés en banque toutes les 6 h de jeu, qualité de l’architecte = loyer +12 % / +25 %.
- Les chantiers v11 sont repris automatiquement. Collines du nord repoussées : elles recouvraient une partie des terrains.

# Port-Aurore RP · v22 · bâtiments reconnaissables
- Chaque lieu important a sa propre architecture : hôpital (urgences, ambulance, héliport, croix lumineuse), banque néoclassique (colonnes, fronton, DAB), Pôle Emploi moderne, supermarché vitré (rayons visibles, chariots, étals), résidence à balcons (linge, paraboles, boîtes aux lettres), club à néons animés (videur, file, projecteurs la nuit).
- Bordure de ville : hôtel de police (voitures, lanterne bleue), gendarmerie (grille, portail), palais de justice à coupole, maison d'arrêt (miradors, barbelés, portail), showroom automobile, station-service à auvent et totem des prix, garage à rideaux métalliques et pont élévateur, auto-école avec voiture double commande. Mairie : beffroi à horloge et drapeaux.
- Parvis : parkings, aire de jeux, place arborée avec statue. Pharmacie, café et boutique déplacés dans des îlots dégagés (croix verte, terrasse, portant).
- Collines repoussées : mairie, commissariat, tribunal, gendarmerie, prison et casino ne sont plus enfouis.
- Terrains à bâtir déplacés au nord de la ville (ils chevauchaient le concessionnaire et la station). Correctif : les chantiers ne sont plus corrompus à la sauvegarde.

# Port-Aurore RP · v21 · showroom Auto Aurore
- Intérieur du concessionnaire entièrement refait : showroom marbre et bleu nuit, accents métalliques dorés, enseigne lumineuse, réception, éclairage d’exposition et plantes.
- Trois voitures sont exposées sur podiums : Berline Luxe, Toyota Compacte et Lambo Wedge. Approche-toi d’un modèle pour afficher son prix, ses performances, le permis requis et l’acheter si tu es éligible.
- Le comptoir ouvre le catalogue complet comme avant.
- Vérification de syntaxe réussie; rendu visuel en navigateur non vérifié ici.

## Voitures
- Remplacement des proportions dérivées par 10 profils de carrosserie dessinés séparément : berline longue, coupé bas, muscle car, compactes/hatchbacks et SUV carré.
- Détails distincts ajoutés à la géométrie : calandres et prises d’air, capot, ouïes arrière, roue de secours et barres de toit.
## Manette
- Correction des entrées : le stick et les boutons sont lus directement par les systèmes de mouvement/conduite, sans écraser les commandes clavier.
- Menu « Configurer la manette » dans Pause : réaffectation des boutons, permutations automatiques en cas de doublon, sauvegarde des réglages et réinitialisation.
- Stick gauche : déplacement/conduite, stick droit : caméra; croix pour les menus; RT/LT pour courir/freiner.
- Syntaxe vérifiée; pas de test visuel/audio possible ici, prévoir un essai dans le navigateur avec une manette.

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
