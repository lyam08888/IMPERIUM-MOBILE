# 🏛️ IMPERIUM - Cahier des Charges Détaillé
**Jeu MMORTS en temps réel dans l'univers de la Rome Antique**

## Présentation Générale
Chaque joueur incarne un **Patricien romain**, membre de l'aristocratie, à qui le Sénat a confié la gestion d'un **oppidum** (ville fortifiée).  
**Objectif :** transformer cette cité en un puissant empire grâce à la **stratégie**, la **diplomatie** et la **puissance militaire**.

### Objectifs Principaux
- **Prospérité** : développer une économie robuste (ressources, infrastructures, bonheur).  
- **Expansion** : coloniser de nouvelles provinces pour accéder à des ressources rares.  
- **Influence** : tisser des alliances et routes commerciales complexes.  
- **Domination** : atteindre le sommet du classement général pour obtenir le titre d’**Imperator**.

## 🌍 Monde & Carte
- **Archipel de 500 îles** générées procéduralement.  
- **25 à 50 joueurs par île** pour favoriser l’interaction locale.  
- **Spécialisation des îles** : chaque île produit une ressource rare (pierre, fer, vin) avec un bonus jusqu’à 30%.  

### Vues du Jeu
- **Vue Locale** : gestion détaillée de votre cité (bâtiments, production, citoyens).  
- **Vue Globale** : carte stratégique (flottes, routes commerciales, campagnes militaires).  

### Colonisation
- Nécessite un **navire de colonisation**, des **citoyens volontaires** et une **somme d’or** conséquente.

## 📦 Ressources
| Ressource | Utilisation |
|-----------|-------------|
| **Bois 🪵** | Bâtiments, navires, machines de siège |
| **Pierre 🗿** | Bâtiments avancés, fortifications |
| **Fer ⚔️** | Armement, outils avancés |
| **Vin 🍇** | Bonheur (Taverne, Amphithéâtre) |
| **Or 💰** | Commerce, entretien armées, espionnage, accélérations |

**Production horaire :**  
Production = Base * (1 + 0.1 * (Niveau - 1)) * (1 + BonusÎle) * (1 + BonusAlliance)

**Stockage :** 
Capacité = 500 * (Niveau_Entrepôt ^ 1.2)
## 🏗️ Bâtiments
**Catégories :**
- **Centre-ville** : Forum (population max), Entrepôt (stockage), Taverne (bonheur), Amphithéâtre (événements).  
- **Production** : Camp de bûcherons, Carrière, Mine de fer, Vignoble, Monnaie impériale.  
- **Recherche** : Académie (technologies), Bibliothèque (recherche accélérée).  
- **Militaire** : Caserne, Chantier naval, Muraille.

*(Les détails complets des niveaux 1 à 20 sont prévus dans les tableaux dédiés.)*

## 🔬 Recherche (Arbre Technologique)
**Urbanisme :** Aqueducs, Architecture en béton, Forums avancés  
**Militaire :** Phalanges, Légions, Balistique  
**Économie :** Routes commerciales, Monnayage, Cartographie  
**Diplomatie :** Espionnage, Pactes fédératifs, Ambassades  

## 👨‍👩‍👧‍👦 Population & Bonheur
- **PopulationMax :**
- 50 + (25 * NiveauForum)

- **Bonheur :** influencé par vin, loisirs, impôts, pertes au combat.
- Bonheur = Base + BonusBâtiments - MalusÉvénements
- **Bonheur négatif** : -10% productivité, risque de révoltes.

## ⚔️ Armée & Combat
| Unité          | Attaque | Défense | Vitesse | Coût (Fer/Or) | Temps |
|----------------|---------|---------|---------|---------------|-------|
| **Velites**    | 5       | 2       | 5       | 10 / 5        | 30s   |
| **Hastati**    | 10      | 6       | 3       | 20 / 10       | 2min  |
| **Légionnaires** | 25    | 15      | 2       | 50 / 20       | 5min  |
| **Equites**    | 20      | 8       | 6       | 40 / 15       | 4min  |
| **Balistes**   | 50      | 5       | 1       | 100 / 50      | 10min |
| **Trirème**    | 25      | -       | -       | 200 Bois / 100 Or | 10min |
| **Quinquérème** | 50     | -       | -       | 400 Bois / 200 Or | 20min |

**Formule de Combat :**  
Puissance = Σ(Unité * Attaque * Moral) + BonusTechnologie - (DéfenseMuraille + BonusDéfense)

## 🤝 Diplomatie & Commerce
- **Alliances** : jusqu’à 50 joueurs, bonus de production et défense commune.  
- **Espionnage** : missions contre ressources, risques d’échec.  
- **Marché** : ordres d’achat/vente avec taxe impériale.  
- **Routes commerciales** : flux automatisés entre villes/alliés.  

## 🏆 Événements & Classements
- **Classements :** Général, Économique, Militaire, Recherche, Pillage.  
- **Événements dynamiques :** Invasions barbares, Jeux du Colisée (PvP), Crises économiques.

## 🛠️ Architecture Technique
**Front-end :** React, Zustand, HTML5 Canvas  
**Back-end :** Node.js, Express.js, WebSocket  
**Base de données :** PostgreSQL (schéma optimisé pour forte charge)

**Exemple de Script (Combat) :**
```python
def calculate_combat_outcome(attacker_army, defender_army, technologies, wall_level):
    attacker_power = sum(unit.attack * unit.count for unit in attacker_army) * technologies.attack_bonus
    defender_defense = sum(unit.defense * unit.count for unit in defender_army) * technologies.defense_bonus
    wall_bonus = wall_level * 100
    damage = attacker_power - (defender_defense + wall_bonus)
    return {"losses_attacker": ..., "losses_defender": ..., "looted_resources": ...}

💎 Monétisation
Accélérations : réduction des temps.

Boosts : +25% production 24h.

Cosmétiques : skins uniques, avatars.

Pack VIP : +1 file de construction, rapports d’espionnage détaillés.

🗺️ Roadmap de Développement
Phase 1 : Core loop (ville, ressources, timers).

Phase 2 : Carte multi-îles, colonisation, navires.

Phase 3 : Combats, diplomatie, alliances.

Phase 4 : Interface avancée, chat, classements, marché.

Phase 5 : Événements mondiaux, boutique, bêta ouverte.




