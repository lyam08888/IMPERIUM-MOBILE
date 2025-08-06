🏛️ IMPERIUM - Cahier des Charges
Jeu MMORTS en temps réel dans l'univers de la Rome Antique

1. Présentation Générale
Chaque joueur incarne un Patricien romain à la tête d'un oppidum (une ville fortifiée). L'objectif est de transformer cette modeste cité en un puissant empire.

Objectifs Principaux
Prospérité : Développer l'économie et les infrastructures de votre cité.

Expansion : Coloniser de nouvelles provinces pour acquérir des ressources rares.

Influence : Établir des réseaux commerciaux et des alliances diplomatiques.

Domination : Grimper au sommet du classement général pour devenir l'Empereur de Rome.

2. 🌍 Monde & Carte
Le monde d'Imperium est un vaste archipel composé de 500 îles, chacune pouvant accueillir entre 25 et 50 joueurs.

Spécificités des Îles
Chaque île est spécialisée dans la production d'une ressource rare (pierre, fer ou vin), ce qui rend le commerce et la conquête essentiels.

Vues du Jeu
Vue Locale : Gestion détaillée de votre île, de vos villes et de la production.

Vue Globale : Gestion stratégique de vos flottes, des routes commerciales et des campagnes militaires.

Colonisation
Pour coloniser une nouvelle province, vous aurez besoin d'un investissement conséquent en or, d'une partie de votre population et de navires de colonisation.

3. 📦 Ressources
Ressource

Utilisation Principale

Bois 🪵

Construction des bâtiments et des navires.

Pierre 🗿

Fortifications et bâtiments avancés.

Fer ⚔️

Armement des unités militaires.

Vin 🍇

Augmentation du bonheur et organisation de festivités.

Or 💰

Entretien de l'armée, commerce et accélérations.

Production & Stockage
Production Horaire : La production suit une formule précise, augmentant avec le niveau de vos bâtiments de production.

Production = Base * (1 + 0.1 * (Niveau - 1)) * BonusÎle * BonusAlliance

Capacité de Stockage : L'entrepôt détermine la quantité maximale de ressources que vous pouvez stocker.

Capacité = 500 * (Niveau_Entrepôt ^ 1.2)

4. 🏗️ Bâtiments
Les bâtiments sont répartis en 4 catégories principales :

Catégorie

Bâtiments

Centre-ville

Forum, Entrepôt, Taverne, Amphithéâtre.

Production

Camp de bûcherons, Carrière, Mine de fer, Vignoble, Monnaie impériale.

Recherche

Académie, Bibliothèque.

Militaire

Caserne, Chantier naval, Muraille.

(Les détails complets des coûts, temps et effets pour chaque bâtiment du niveau 1 à 20 seront spécifiés dans des tableaux dédiés.)

5. 🔬 Recherche (Arbre Technologique)
L'arbre de recherche est divisé en 4 branches pour spécialiser votre empire.

Branche

Technologies Clés et Effets

Urbanisme

Aqueducs (+15% croissance), Forums avancés (+1 file de construction).

Militaire

Phalanges (débloque Hastati), Légions (débloque Légionnaires), Machines de siège.

Économie

Routes commerciales (+1 route active), Banques (+10% production d'or).

Diplomatie

Espionnage (permet d'espionner), Pactes (alliances avancées).

6. 👨‍👩‍👧‍👦 Population & Bonheur
Population Maximale : Dépend du niveau de votre Forum.

PopulationMax = 50 + (25 * NiveauForum)

Bonheur : Un indicateur crucial pour la productivité de votre cité.

Bonheur = Base + (2 * Vin/10) + (5 * NiveauTaverne) + (10 * NiveauAmphithéâtre)

Un bonheur négatif entraîne une pénalité de productivité et des risques de révoltes.

7. ⚔️ Armée & Combat
Unités
Unité

Attaque

Défense

Vitesse

Coût (Fer/Or)

Velites

5

2

5

10 / 5

Hastati

10

6

3

20 / 10

Légionnaires

25

15

2

50 / 20

Equites

20

8

6

40 / 15

Balistes

50

5

1

100 / 50

Trirème

25

-

-

200 Bois / 100 Or

Quinquérème

50

-

-

400 Bois / 200 Or

Formule de Combat
Le combat est résolu automatiquement en se basant sur la puissance totale des armées.

Puissance = Σ(Unités * Attaque) + BonusTechnologie - DéfenseMuraille

Un rapport détaillé est fourni après chaque bataille.

8. 🤝 Diplomatie & Commerce
Alliances : Regroupez jusqu'à 50 joueurs pour obtenir des bonus d'entraide et coordonner des attaques.

Espionnage : Obtenez des informations sur vos ennemis, mais attention au risque d'échec.

Marché : Achetez et vendez des ressources avec d'autres joueurs.

Routes Commerciales : Utilisez vos navires marchands pour établir des flux de ressources constants entre vos villes ou celles de vos alliés.

9. 🏆 Événements & Classements
Classements : Mesurez votre puissance dans les domaines de la Construction, du Militaire, de la Recherche et des Alliances.

Événements Mondiaux : Participez à des événements réguliers comme les Jeux du Colisée pour gagner des bonus, ou survivez à des Révoltes si votre bonheur est trop bas.

10. 🛠️ Architecture Technique
Domaine

Technologies

Rôle

Front-end

React + HTML5 Canvas

Interface utilisateur, affichage de la carte et des combats.

Back-end

Node.js (REST API + WebSocket)

Logique du jeu, chat et mises à jour en temps réel.

Base de données

PostgreSQL

Stockage des données (Joueurs, Villes, Armées, etc.).

Exemple de Script (Production)
def calculate_production(level, base=10, island_bonus=0.2, alliance_bonus=0.1):
    """
    Calcule la production horaire d'une ressource.
    """
    level_multiplier = 1 + 0.1 * (level - 1)
    return base * level_multiplier * (1 + island_bonus) * (1 + alliance_bonus)

11. 💎 Monétisation (Free-to-Play)
Le jeu est free-to-play avec des achats optionnels conçus pour ne pas être "pay-to-win".

Accélérations : Réduction des temps de construction, recherche, etc.

Boosts : Augmentation temporaire de la production.

Cosmétiques : Skins pour les villes et les navires.

Pack VIP : Avantages de confort (files de construction multiples, rapports améliorés).

12. 🗺️ Roadmap de Développement
Phase 1 : Core Loop (gestion de la ville, ressources, timers).

Phase 2 : Carte multi-îles et système de colonisation.

Phase 3 : Implémentation des combats et de la diplomatie.

Phase 4 : Interface avancée, chat, classements et alliances.

Phase 5 : Lancement des événements et de la monétisation.
