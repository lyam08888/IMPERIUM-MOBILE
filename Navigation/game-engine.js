/**
 * 🏛️ IMPERIUM - Moteur de Jeu Complet
 * Toutes les formules et mécaniques du README implémentées
 */

// ===== CONFIGURATION GLOBALE =====
const GAME_CONFIG = {
    version: '1.0.0',
    updateInterval: 1000, // Mise à jour chaque seconde pour un jeu fluide
    saveInterval: 30000, // Sauvegarde automatique toutes les 30 secondes
    maxIslands: 500,
    playersPerIsland: { min: 25, max: 50 },
    maxAllianceMembers: 50
};

// ===== FORMULES EXACTES DU README =====
const FORMULAS = {
    // Production = Base * (1 + 0.1 * (Niveau - 1)) * (1 + BonusÎle) * (1 + BonusAlliance)
    production: (base, level, islandBonus = 0, allianceBonus = 0) => {
        return base * (1 + 0.1 * (level - 1)) * (1 + islandBonus) * (1 + allianceBonus);
    },
    
    // Capacité = 500 * (Niveau_Entrepôt ^ 1.2)
    storageCapacity: (warehouseLevel) => {
        return Math.floor(500 * Math.pow(warehouseLevel, 1.2));
    },
    
    // PopulationMax = 50 + (25 * NiveauForum)
    populationMax: (forumLevel) => {
        return 50 + (25 * forumLevel);
    },
    
    // Bonheur = Base + BonusBâtiments - MalusÉvénements
    happiness: (base, buildingBonus, eventMalus) => {
        return Math.max(0, Math.min(100, base + buildingBonus - eventMalus));
    },
    
    // Puissance = Σ(Unités * Attaque * Moral) + BonusTechnologie - (DéfenseMuraille + BonusDéfense)
    combatPower: (units, moral, techBonus, wallDefense = 0, defenseBonus = 0) => {
        let totalPower = 0;
        units.forEach(unit => {
            totalPower += unit.count * unit.attack * (moral / 100);
        });
        return Math.max(0, totalPower + techBonus - wallDefense - defenseBonus);
    }
};

// ===== CONFIGURATION DES RESSOURCES =====
const RESOURCES_CONFIG = {
    wood: { name: 'Lignum (Bois)', icon: '🌳', description: 'Bâtiments de base, navires, machines de siège' },
    stone: { name: 'Lapis (Pierre)', icon: '🏔️', description: 'Bâtiments avancés, fortifications' },
    iron: { name: 'Ferrum (Fer)', icon: '⚒️', description: 'Armement, armures, outils avancés' },
    wine: { name: 'Vinum (Vin)', icon: '🍷', description: 'Bonheur, festivités, commerce de luxe' },
    gold: { name: 'Aurum (Or)', icon: '🪙', description: 'Entretien, commerce, espionnage, corruption' },
    research: { name: 'Scientia (Savoir)', icon: '📜', description: 'Technologies et innovations' }
};

// ===== CONFIGURATION COMPLÈTE DES BÂTIMENTS =====
const BUILDINGS_CONFIG = {
    // Centre-ville
    forum: {
        name: 'Forum Romanum', icon: '🏛️', category: 'center',
        description: 'Cœur administratif de la cité. Augmente la population maximale.',
        maxLevel: 20,
        costs: level => ({ stone: 100 * level * 1.5, gold: 50 * level * 1.2 }),
        buildTime: level => 300 + (level * 60), // 5min + 1min par niveau
        effects: level => ({ populationMax: 25 * level }),
        requirements: level => level === 1 ? {} : { forum: level - 1 }
    },
    
    warehouse: {
        name: 'Horrea (Entrepôts)', icon: '🏪', category: 'center',
        description: 'Stockage sécurisé des ressources. Protège contre le pillage.',
        maxLevel: 20,
        costs: level => ({ wood: 80 * level * 1.3, stone: 40 * level * 1.2 }),
        buildTime: level => 180 + (level * 30),
        effects: level => ({ storageCapacity: FORMULAS.storageCapacity(level) }),
        requirements: level => level === 1 ? {} : { warehouse: level - 1 }
    },
    
    tavern: {
        name: 'Taberna (Taverne)', icon: '🍷', category: 'center',
        description: 'Lieu de détente. Augmente le bonheur des citoyens.',
        maxLevel: 15,
        costs: level => ({ wood: 60 * level * 1.2, wine: 20 * level }),
        buildTime: level => 120 + (level * 20),
        effects: level => ({ happiness: 5 * level }),
        requirements: level => level === 1 ? { forum: 2 } : { tavern: level - 1 }
    },
    
    amphitheater: {
        name: 'Amphitheatrum', icon: '🏟️', category: 'center',
        description: 'Jeux et spectacles. Bonheur et événements culturels.',
        maxLevel: 10,
        costs: level => ({ stone: 200 * level * 1.8, gold: 100 * level * 1.5 }),
        buildTime: level => 600 + (level * 120),
        effects: level => ({ happiness: 10 * level, culturalEvents: level }),
        requirements: level => level === 1 ? { forum: 5, tavern: 3 } : { amphitheater: level - 1 }
    },
    
    // Production
    lumbercamp: {
        name: 'Silva (Forêt)', icon: '🌲', category: 'production',
        description: 'Exploitation forestière. Produit du bois.',
        maxLevel: 20,
        costs: level => ({ wood: 50 * level, gold: 25 * level }),
        buildTime: level => 90 + (level * 15),
        effects: level => ({ production: { wood: 10 } }),
        requirements: level => level === 1 ? {} : { lumbercamp: level - 1 }
    },
    
    quarry: {
        name: 'Lapicidina (Carrière)', icon: '⛏️', category: 'production',
        description: 'Extraction de pierre. Produit de la pierre.',
        maxLevel: 20,
        costs: level => ({ wood: 40 * level, iron: 20 * level }),
        buildTime: level => 120 + (level * 20),
        effects: level => ({ production: { stone: 8 } }),
        requirements: level => level === 1 ? { forum: 2 } : { quarry: level - 1 }
    },
    
    ironmine: {
        name: 'Mine de Fer', icon: '⛏️', category: 'production',
        description: 'Extraction de minerai. Produit du fer.',
        maxLevel: 20,
        costs: level => ({ wood: 60 * level, stone: 30 * level }),
        buildTime: level => 150 + (level * 25),
        effects: level => ({ production: { iron: 6 } }),
        requirements: level => level === 1 ? { forum: 3 } : { ironmine: level - 1 }
    },
    
    vineyard: {
        name: 'Vignoble', icon: '🍇', category: 'production',
        description: 'Culture de la vigne. Produit du vin.',
        maxLevel: 20,
        costs: level => ({ wood: 45 * level, gold: 30 * level }),
        buildTime: level => 180 + (level * 30),
        effects: level => ({ production: { wine: 4 } }),
        requirements: level => level === 1 ? { forum: 2 } : { vineyard: level - 1 }
    },
    
    mint: {
        name: 'Moneta (Monnaie)', icon: '🪙', category: 'production',
        description: 'Frappe de monnaies. Produit de l\'or.',
        maxLevel: 15,
        costs: level => ({ stone: 80 * level * 1.4, iron: 40 * level }),
        buildTime: level => 240 + (level * 40),
        effects: level => ({ production: { gold: 5 } }),
        requirements: level => level === 1 ? { forum: 4 } : { mint: level - 1 }
    },
    
    // Recherche
    academy: {
        name: 'Academia (Académie)', icon: '🎓', category: 'research',
        description: 'Centre de recherche. Débloque les technologies.',
        maxLevel: 15,
        costs: level => ({ stone: 150 * level * 1.6, gold: 100 * level * 1.4 }),
        buildTime: level => 480 + (level * 80),
        effects: level => ({ researchEnabled: true, researchSpeed: 1 + (level * 0.1) }),
        requirements: level => level === 1 ? { forum: 3 } : { academy: level - 1 }
    },
    
    library: {
        name: 'Bibliotheca', icon: '📜', category: 'research',
        description: 'Conservation du savoir. Accélère la recherche.',
        maxLevel: 10,
        costs: level => ({ wood: 100 * level * 1.3, stone: 60 * level }),
        buildTime: level => 300 + (level * 50),
        effects: level => ({ researchSpeed: 0.2 * level }),
        requirements: level => level === 1 ? { academy: 2 } : { library: level - 1 }
    },
    
    // Militaire
    barracks: {
        name: 'Castra (Caserne)', icon: '🏺', category: 'military',
        description: 'Recrutement des légions terrestres.',
        maxLevel: 15,
        costs: level => ({ wood: 120 * level * 1.4, iron: 80 * level * 1.2 }),
        buildTime: level => 360 + (level * 60),
        effects: level => ({ militaryEnabled: true, recruitmentSpeed: 1 + (level * 0.15) }),
        requirements: level => level === 1 ? { forum: 3 } : { barracks: level - 1 }
    },
    
    shipyard: {
        name: 'Chantier Naval', icon: '🚢', category: 'military',
        description: 'Construction de navires militaires et marchands.',
        maxLevel: 12,
        costs: level => ({ wood: 200 * level * 1.5, iron: 100 * level }),
        buildTime: level => 480 + (level * 80),
        effects: level => ({ navalEnabled: true, shipBuildSpeed: 1 + (level * 0.2) }),
        requirements: level => level === 1 ? { forum: 4 } : { shipyard: level - 1 }
    },
    
    wall: {
        name: 'Muraille', icon: '🛡️', category: 'military',
        description: 'Fortifications défensives de la cité.',
        maxLevel: 20,
        costs: level => ({ stone: 150 * level * 1.8, iron: 75 * level * 1.3 }),
        buildTime: level => 600 + (level * 100),
        effects: level => ({ defense: 100 * level }),
        requirements: level => level === 1 ? { forum: 2 } : { wall: level - 1 }
    }
};

// ===== ARBRE TECHNOLOGIQUE COMPLET =====
const TECH_TREE = {
    urbanisme: {
        name: 'Urbanisme', icon: '🏛️', description: 'Développement urbain et infrastructure',
        techs: {
            aqueducs: {
                name: 'Aqueducs', cost: { research: 250, gold: 500 },
                description: '+15% croissance population, +10% bonheur',
                effects: { populationGrowth: 0.15, happiness: 10 },
                requirements: { academy: 2 }
            },
            concrete: {
                name: 'Architecture en Béton', cost: { research: 400, stone: 200 },
                description: '-10% coût en pierre pour tous les bâtiments',
                effects: { stoneCostReduction: 0.1 },
                requirements: { aqueducs: true }
            },
            advanced_forums: {
                name: 'Forums Avancés', cost: { research: 600, gold: 1000 },
                description: '+1 file de construction simultanée',
                effects: { buildingQueues: 1 },
                requirements: { concrete: true, forum: 8 }
            }
        }
    },
    
    militaire: {
        name: 'Art Militaire', icon: '⚔️', description: 'Tactiques et unités militaires',
        techs: {
            phalanges: {
                name: 'Formations en Phalange', cost: { research: 300, iron: 150 },
                description: 'Débloque les Hastati, +20% défense',
                effects: { unitsUnlocked: ['hastati'], defenseBonus: 0.2 },
                requirements: { barracks: 2 }
            },
            legions: {
                name: 'Légions', cost: { research: 500, iron: 300, gold: 400 },
                description: 'Débloque les Légionnaires, +15% attaque',
                effects: { unitsUnlocked: ['legionnaires'], attackBonus: 0.15 },
                requirements: { phalanges: true, barracks: 5 }
            },
            ballistics: {
                name: 'Balistique', cost: { research: 450, wood: 200, iron: 100 },
                description: 'Améliore les machines de siège, +50% dégâts aux murailles',
                effects: { siegeBonus: 0.5 },
                requirements: { phalanges: true }
            }
        }
    },
    
    economie: {
        name: 'Économie', icon: '💰', description: 'Commerce et prospérité',
        techs: {
            trade_routes: {
                name: 'Routes Commerciales', cost: { research: 200, gold: 300 },
                description: '+1 route commerciale active, +25% revenus commerciaux',
                effects: { tradeRoutes: 1, tradeBonus: 0.25 },
                requirements: { forum: 3 }
            },
            coinage: {
                name: 'Monnayage', cost: { research: 350, gold: 200 },
                description: '+10% production d\'or',
                effects: { goldProductionBonus: 0.1 },
                requirements: { mint: 3 }
            },
            cartography: {
                name: 'Cartographie', cost: { research: 400, gold: 500 },
                description: '-25% temps de trajet des navires',
                effects: { navalSpeedBonus: 0.25 },
                requirements: { trade_routes: true, shipyard: 2 }
            }
        }
    },
    
    diplomatie: {
        name: 'Diplomatie', icon: '🤝', description: 'Relations et espionnage',
        techs: {
            espionage: {
                name: 'Espionnage', cost: { research: 350, gold: 400 },
                description: 'Permet les missions d\'espionnage',
                effects: { espionageEnabled: true },
                requirements: { academy: 3 }
            },
            federative_pacts: {
                name: 'Pactes Fédératifs', cost: { research: 500, gold: 800 },
                description: '+5% bonus d\'alliance, +10 membres max',
                effects: { allianceBonusIncrease: 0.05, allianceMembersBonus: 10 },
                requirements: { espionage: true }
            },
            embassies: {
                name: 'Ambassades', cost: { research: 600, stone: 300, gold: 1000 },
                description: '-50% corruption dans les colonies',
                effects: { corruptionReduction: 0.5 },
                requirements: { federative_pacts: true }
            }
        }
    }
};

// ===== CONFIGURATION DES UNITÉS =====
const UNITS_CONFIG = {
    // Unités terrestres
    velites: {
        name: 'Velites', icon: '🏃‍♂️', type: 'land',
        attack: 5, defense: 2, speed: 5,
        cost: { iron: 10, gold: 5 },
        recruitTime: 30, // 30 secondes
        description: 'Troupes légères, rapides mais fragiles'
    },
    hastati: {
        name: 'Hastati', icon: '🛡️', type: 'land',
        attack: 10, defense: 6, speed: 3,
        cost: { iron: 20, gold: 10 },
        recruitTime: 120, // 2 minutes
        description: 'Infanterie lourde, équilibrée',
        requirements: { tech: 'phalanges' }
    },
    legionnaires: {
        name: 'Legionarii', icon: '🏛️', type: 'land',
        attack: 25, defense: 15, speed: 2,
        cost: { iron: 50, gold: 20 },
        recruitTime: 300, // 5 minutes
        description: 'Élite de l\'armée romaine',
        requirements: { tech: 'legions' }
    },
    equites: {
        name: 'Equites', icon: '🐎', type: 'land',
        attack: 20, defense: 8, speed: 6,
        cost: { iron: 40, gold: 15 },
        recruitTime: 240, // 4 minutes
        description: 'Cavalerie rapide et mobile'
    },
    balistes: {
        name: 'Ballistae', icon: '🏹', type: 'siege',
        attack: 50, defense: 5, speed: 1,
        cost: { wood: 100, gold: 50 },
        recruitTime: 600, // 10 minutes
        description: 'Machines de siège dévastatrices'
    },
    
    // Unités navales
    trireme: {
        name: 'Trirème', icon: '⛵', type: 'naval',
        attack: 25, defense: 10, speed: 4,
        cost: { wood: 200, gold: 100 },
        recruitTime: 600, // 10 minutes
        description: 'Navire de guerre standard'
    },
    quinquereme: {
        name: 'Quinquérème', icon: '🚢', type: 'naval',
        attack: 50, defense: 20, speed: 3,
        cost: { wood: 400, gold: 200 },
        recruitTime: 1200, // 20 minutes
        description: 'Navire de guerre lourd'
    },
    merchant_ship: {
        name: 'Navire Marchand', icon: '🛳️', type: 'trade',
        attack: 5, defense: 5, speed: 3,
        cost: { wood: 150, gold: 75 },
        recruitTime: 480, // 8 minutes
        description: 'Transport de ressources et colonisation',
        cargoCapacity: 1000
    }
};

// ===== ÉTAT DU JEU GLOBAL =====
let gameState = {
    // Informations joueur
    player: {
        name: 'Marcus Aurelius',
        level: 1,
        xp: 0,
        title: 'Patricien',
        rank: 999,
        alliance: null
    },
    
    // Ressources
    resources: {
        wood: 1000,
        stone: 500,
        iron: 200,
        wine: 100,
        gold: 2000,
        research: 0
    },
    
    // Bâtiments (par ville)
    cities: {
        main: {
            name: 'Roma Nova',
            islandId: 'roma_island',
            population: 75,
            happiness: 60,
            buildings: {
                forum: { level: 1, x: 2, y: 2 },
                warehouse: { level: 1, x: 1, y: 1 },
                lumbercamp: { level: 1, x: 0, y: 0 }
            },
            buildingQueue: [],
            units: {
                velites: 10,
                hastati: 0,
                legionnaires: 0,
                equites: 5,
                balistes: 0
            },
            navy: {
                trireme: 2,
                quinquereme: 0,
                merchant_ship: 1
            }
        }
    },
    
    // Technologies recherchées
    technologies: [],
    researchQueue: [],
    
    // Alliances et diplomatie
    alliance: null,
    diplomaticRelations: {},
    
    // Événements et timers
    events: [],
    timers: {},
    
    // Métadonnées
    lastUpdate: Date.now(),
    gameStarted: Date.now(),
    totalPlayTime: 0
};

// ===== MOTEUR DE JEU PRINCIPAL =====
class ImperiumGameEngine {
    constructor() {
        this.isRunning = false;
        this.updateInterval = null;
        this.saveInterval = null;
        this.eventHandlers = {};
    }
    
    // Initialisation du jeu
    init() {
        console.log('🏛️ Initialisation d\'IMPERIUM...');
        this.loadGame();
        this.startGameLoops();
        this.bindEvents();
        this.isRunning = true;
        this.emit('gameInitialized', gameState);
    }
    
    // Boucles de jeu
    startGameLoops() {
        // Boucle principale de mise à jour
        this.updateInterval = setInterval(() => {
            this.update();
        }, GAME_CONFIG.updateInterval);
        
        // Sauvegarde automatique
        this.saveInterval = setInterval(() => {
            this.saveGame();
        }, GAME_CONFIG.saveInterval);
    }
    
    // Mise à jour principale du jeu
    update() {
        const now = Date.now();
        const deltaTime = (now - gameState.lastUpdate) / 1000; // en secondes
        
        // Mettre à jour chaque ville
        Object.keys(gameState.cities).forEach(cityId => {
            this.updateCity(cityId, deltaTime);
        });
        
        // Mettre à jour la recherche
        this.updateResearch(deltaTime);
        
        // Mettre à jour les timers
        this.updateTimers(deltaTime);
        
        // Mettre à jour les événements
        this.updateEvents(deltaTime);
        
        gameState.lastUpdate = now;
        gameState.totalPlayTime += deltaTime;
        
        this.emit('gameUpdated', { deltaTime, gameState });
    }
    
    // Mise à jour d'une ville
    updateCity(cityId, deltaTime) {
        const city = gameState.cities[cityId];
        if (!city) return;
        
        // 1. Calculer la production
        const production = this.calculateProduction(cityId);
        const capacity = this.calculateStorageCapacity(cityId);
        
        // 2. Ajouter les ressources produites
        Object.keys(production).forEach(resource => {
            if (production[resource] > 0) {
                const produced = production[resource] * (deltaTime / 3600); // par heure
                const current = gameState.resources[resource] || 0;
                const maxCapacity = capacity[resource] || Infinity;
                
                gameState.resources[resource] = Math.min(current + produced, maxCapacity);
            }
        });
        
        // 3. Mettre à jour la population
        this.updatePopulation(cityId, deltaTime);
        
        // 4. Mettre à jour le bonheur
        city.happiness = this.calculateHappiness(cityId);
        
        // 5. Traiter les files de construction
        this.processBuildingQueue(cityId, deltaTime);
        
        // 6. Traiter le recrutement
        this.processRecruitment(cityId, deltaTime);
    }
    
    // Calcul de la production selon la formule du README
    calculateProduction(cityId) {
        const city = gameState.cities[cityId];
        const production = { wood: 0, stone: 0, iron: 0, wine: 0, gold: 0, research: 0 };
        
        // Bonus d'île (simulé pour l'instant)
        const islandBonus = this.getIslandBonus(city.islandId);
        
        // Bonus d'alliance
        const allianceBonus = gameState.alliance ? 0.1 : 0;
        
        // Bonus de bonheur (malus si bonheur < 50)
        const happinessMultiplier = city.happiness >= 50 ? 1 : 0.9;
        
        // Calculer pour chaque bâtiment de production
        Object.keys(city.buildings).forEach(buildingType => {
            const building = city.buildings[buildingType];
            const config = BUILDINGS_CONFIG[buildingType];
            
            if (config && config.effects && config.effects(building.level).production) {
                const buildingProduction = config.effects(building.level).production;
                
                Object.keys(buildingProduction).forEach(resource => {
                    const base = buildingProduction[resource];
                    const resourceIslandBonus = islandBonus[resource] || 0;
                    
                    production[resource] += FORMULAS.production(
                        base, 
                        building.level, 
                        resourceIslandBonus, 
                        allianceBonus
                    ) * happinessMultiplier;
                });
            }
        });
        
        return production;
    }
    
    // Calcul de la capacité de stockage
    calculateStorageCapacity(cityId) {
        const city = gameState.cities[cityId];
        const capacity = {};
        
        // Capacité de base
        Object.keys(RESOURCES_CONFIG).forEach(resource => {
            capacity[resource] = 1000; // Capacité de base
        });
        
        // Bonus des entrepôts
        if (city.buildings.warehouse) {
            const warehouseLevel = city.buildings.warehouse.level;
            const warehouseCapacity = FORMULAS.storageCapacity(warehouseLevel);
            
            Object.keys(capacity).forEach(resource => {
                capacity[resource] += warehouseCapacity;
            });
        }
        
        return capacity;
    }
    
    // Calcul du bonheur selon la formule
    calculateHappiness(cityId) {
        const city = gameState.cities[cityId];
        let happiness = 50; // Base
        
        // Bonus des bâtiments
        let buildingBonus = 0;
        Object.keys(city.buildings).forEach(buildingType => {
            const building = city.buildings[buildingType];
            const config = BUILDINGS_CONFIG[buildingType];
            
            if (config && config.effects && config.effects(building.level).happiness) {
                buildingBonus += config.effects(building.level).happiness;
            }
        });
        
        // Malus de surpopulation
        const maxPop = this.calculateMaxPopulation(cityId);
        const popRatio = city.population / maxPop;
        let eventMalus = 0;
        
        if (popRatio > 0.9) {
            eventMalus += (popRatio - 0.9) * 100;
        }
        
        // Bonus des technologies
        if (gameState.technologies.includes('aqueducs')) {
            buildingBonus += 10;
        }
        
        return FORMULAS.happiness(happiness, buildingBonus, eventMalus);
    }
    
    // Calcul de la population maximale
    calculateMaxPopulation(cityId) {
        const city = gameState.cities[cityId];
        const forumLevel = city.buildings.forum ? city.buildings.forum.level : 0;
        return FORMULAS.populationMax(forumLevel);
    }
    
    // Mise à jour de la population
    updatePopulation(cityId, deltaTime) {
        const city = gameState.cities[cityId];
        const maxPop = this.calculateMaxPopulation(cityId);
        
        if (city.population < maxPop && city.happiness > 30) {
            // Croissance basée sur le bonheur
            const growthRate = (city.happiness / 100) * 0.5; // 0.5% par point de bonheur par heure
            const growthBonus = gameState.technologies.includes('aqueducs') ? 1.15 : 1;
            
            const growth = city.population * growthRate * growthBonus * (deltaTime / 3600);
            city.population = Math.min(city.population + growth, maxPop);
        }
    }
    
    // Construction de bâtiments
    buildBuilding(cityId, buildingType, x, y) {
        const city = gameState.cities[cityId];
        const config = BUILDINGS_CONFIG[buildingType];
        
        if (!config) {
            throw new Error(`Bâtiment inconnu: ${buildingType}`);
        }
        
        // Vérifier les prérequis
        const level = city.buildings[buildingType] ? city.buildings[buildingType].level + 1 : 1;
        const requirements = config.requirements(level);
        
        if (!this.checkRequirements(cityId, requirements)) {
            throw new Error('Prérequis non satisfaits');
        }
        
        // Vérifier les coûts
        const costs = config.costs(level);
        if (!this.canAfford(costs)) {
            throw new Error('Ressources insuffisantes');
        }
        
        // Déduire les coûts
        this.spendResources(costs);
        
        // Ajouter à la file de construction
        const buildTime = config.buildTime(level);
        city.buildingQueue.push({
            type: buildingType,
            level: level,
            x: x,
            y: y,
            startTime: Date.now(),
            endTime: Date.now() + (buildTime * 1000),
            totalTime: buildTime
        });
        
        this.emit('buildingStarted', { cityId, buildingType, level, buildTime });
        return true;
    }
    
    // Traitement de la file de construction
    processBuildingQueue(cityId, deltaTime) {
        const city = gameState.cities[cityId];
        const now = Date.now();
        
        city.buildingQueue = city.buildingQueue.filter(building => {
            if (now >= building.endTime) {
                // Construction terminée
                city.buildings[building.type] = {
                    level: building.level,
                    x: building.x,
                    y: building.y
                };
                
                this.emit('buildingCompleted', { cityId, building });
                return false; // Retirer de la file
            }
            return true; // Garder dans la file
        });
    }
    
    // Recherche de technologies
    startResearch(techBranch, techId) {
        const tech = TECH_TREE[techBranch]?.techs[techId];
        if (!tech) {
            throw new Error(`Technologie inconnue: ${techBranch}.${techId}`);
        }
        
        // Vérifier les prérequis
        if (!this.checkRequirements('main', tech.requirements)) {
            throw new Error('Prérequis non satisfaits pour la recherche');
        }
        
        // Vérifier les coûts
        if (!this.canAfford(tech.cost)) {
            throw new Error('Ressources insuffisantes pour la recherche');
        }
        
        // Déduire les coûts
        this.spendResources(tech.cost);
        
        // Calculer le temps de recherche
        const baseTime = tech.cost.research * 10; // 10 secondes par point de recherche
        const researchSpeed = this.calculateResearchSpeed();
        const researchTime = baseTime / researchSpeed;
        
        // Ajouter à la file de recherche
        gameState.researchQueue.push({
            branch: techBranch,
            id: techId,
            name: tech.name,
            startTime: Date.now(),
            endTime: Date.now() + (researchTime * 1000),
            totalTime: researchTime
        });
        
        this.emit('researchStarted', { techBranch, techId, researchTime });
        return true;
    }
    
    // Calcul de la vitesse de recherche
    calculateResearchSpeed() {
        let speed = 1;
        
        // Bonus des bâtiments
        Object.keys(gameState.cities).forEach(cityId => {
            const city = gameState.cities[cityId];
            
            if (city.buildings.academy) {
                const academyLevel = city.buildings.academy.level;
                speed += academyLevel * 0.1;
            }
            
            if (city.buildings.library) {
                const libraryLevel = city.buildings.library.level;
                speed += libraryLevel * 0.2;
            }
        });
        
        return speed;
    }
    
    // Mise à jour de la recherche
    updateResearch(deltaTime) {
        const now = Date.now();
        
        gameState.researchQueue = gameState.researchQueue.filter(research => {
            if (now >= research.endTime) {
                // Recherche terminée
                const techKey = `${research.branch}.${research.id}`;
                gameState.technologies.push(techKey);
                
                // Appliquer les effets de la technologie
                this.applyTechEffects(research.branch, research.id);
                
                this.emit('researchCompleted', research);
                return false; // Retirer de la file
            }
            return true; // Garder dans la file
        });
    }
    
    // Application des effets des technologies
    applyTechEffects(techBranch, techId) {
        const tech = TECH_TREE[techBranch]?.techs[techId];
        if (!tech || !tech.effects) return;
        
        // Les effets sont appliqués automatiquement via les calculs
        // Certains effets spéciaux peuvent nécessiter une logique particulière
        
        if (tech.effects.unitsUnlocked) {
            // Débloquer de nouvelles unités
            tech.effects.unitsUnlocked.forEach(unitType => {
                this.emit('unitUnlocked', { unitType });
            });
        }
    }
    
    // Recrutement d'unités
    recruitUnit(cityId, unitType, quantity = 1) {
        const city = gameState.cities[cityId];
        const config = UNITS_CONFIG[unitType];
        
        if (!config) {
            throw new Error(`Unité inconnue: ${unitType}`);
        }
        
        // Vérifier les prérequis
        if (config.requirements && !this.checkRequirements(cityId, config.requirements)) {
            throw new Error('Prérequis non satisfaits pour le recrutement');
        }
        
        // Calculer les coûts totaux
        const totalCosts = {};
        Object.keys(config.cost).forEach(resource => {
            totalCosts[resource] = config.cost[resource] * quantity;
        });
        
        // Vérifier les coûts
        if (!this.canAfford(totalCosts)) {
            throw new Error('Ressources insuffisantes pour le recrutement');
        }
        
        // Déduire les coûts
        this.spendResources(totalCosts);
        
        // Calculer le temps de recrutement
        const recruitSpeed = this.calculateRecruitmentSpeed(cityId);
        const totalTime = (config.recruitTime * quantity) / recruitSpeed;
        
        // Ajouter à la file de recrutement
        if (!city.recruitmentQueue) city.recruitmentQueue = [];
        
        city.recruitmentQueue.push({
            unitType: unitType,
            quantity: quantity,
            startTime: Date.now(),
            endTime: Date.now() + (totalTime * 1000),
            totalTime: totalTime
        });
        
        this.emit('recruitmentStarted', { cityId, unitType, quantity, totalTime });
        return true;
    }
    
    // Calcul de la vitesse de recrutement
    calculateRecruitmentSpeed(cityId) {
        const city = gameState.cities[cityId];
        let speed = 1;
        
        // Bonus des bâtiments
        if (city.buildings.barracks) {
            const barracksLevel = city.buildings.barracks.level;
            speed += barracksLevel * 0.15;
        }
        
        if (city.buildings.shipyard) {
            const shipyardLevel = city.buildings.shipyard.level;
            speed += shipyardLevel * 0.2;
        }
        
        return speed;
    }
    
    // Traitement du recrutement
    processRecruitment(cityId, deltaTime) {
        const city = gameState.cities[cityId];
        if (!city.recruitmentQueue) return;
        
        const now = Date.now();
        
        city.recruitmentQueue = city.recruitmentQueue.filter(recruitment => {
            if (now >= recruitment.endTime) {
                // Recrutement terminé
                const unitType = recruitment.unitType;
                const config = UNITS_CONFIG[unitType];
                
                if (config.type === 'naval') {
                    city.navy[unitType] = (city.navy[unitType] || 0) + recruitment.quantity;
                } else {
                    city.units[unitType] = (city.units[unitType] || 0) + recruitment.quantity;
                }
                
                this.emit('recruitmentCompleted', { cityId, recruitment });
                return false; // Retirer de la file
            }
            return true; // Garder dans la file
        });
    }
    
    // Combat
    calculateCombatOutcome(attackerArmy, defenderArmy, defenderCityId) {
        const defenderCity = gameState.cities[defenderCityId];
        
        // Calculer la puissance d'attaque
        const attackerMoral = 100; // Moral de base pour l'attaquant
        const attackerTechBonus = this.calculateTechBonus('attack');
        const attackerPower = FORMULAS.combatPower(attackerArmy, attackerMoral, attackerTechBonus);
        
        // Calculer la défense
        const defenderMoral = defenderCity.happiness;
        const defenderTechBonus = this.calculateTechBonus('defense');
        const wallDefense = defenderCity.buildings.wall ? 
            BUILDINGS_CONFIG.wall.effects(defenderCity.buildings.wall.level).defense : 0;
        
        const defenderPower = FORMULAS.combatPower(defenderArmy, defenderMoral, defenderTechBonus, wallDefense);
        
        // Résoudre le combat
        const powerRatio = attackerPower / Math.max(defenderPower, 1);
        
        let result = {
            victory: powerRatio > 1,
            attackerLosses: {},
            defenderLosses: {},
            lootedResources: {},
            damageToWalls: 0
        };
        
        // Calculer les pertes (simplifié)
        const attackerLossRate = Math.min(0.8, 1 / powerRatio);
        const defenderLossRate = Math.min(0.9, powerRatio * 0.5);
        
        // Appliquer les pertes
        attackerArmy.forEach(unit => {
            const losses = Math.floor(unit.count * attackerLossRate * (0.5 + Math.random() * 0.5));
            result.attackerLosses[unit.type] = losses;
        });
        
        defenderArmy.forEach(unit => {
            const losses = Math.floor(unit.count * defenderLossRate * (0.5 + Math.random() * 0.5));
            result.defenderLosses[unit.type] = losses;
        });
        
        // Pillage en cas de victoire
        if (result.victory) {
            const lootPercentage = Math.min(0.3, powerRatio * 0.1);
            Object.keys(gameState.resources).forEach(resource => {
                const available = gameState.resources[resource];
                const looted = Math.floor(available * lootPercentage);
                result.lootedResources[resource] = looted;
            });
        }
        
        return result;
    }
    
    // Calcul des bonus technologiques
    calculateTechBonus(type) {
        let bonus = 0;
        
        gameState.technologies.forEach(techKey => {
            const [branch, techId] = techKey.split('.');
            const tech = TECH_TREE[branch]?.techs[techId];
            
            if (tech && tech.effects) {
                if (type === 'attack' && tech.effects.attackBonus) {
                    bonus += tech.effects.attackBonus;
                }
                if (type === 'defense' && tech.effects.defenseBonus) {
                    bonus += tech.effects.defenseBonus;
                }
            }
        });
        
        return bonus;
    }
    
    // Utilitaires
    canAfford(costs) {
        return Object.keys(costs).every(resource => {
            return (gameState.resources[resource] || 0) >= costs[resource];
        });
    }
    
    spendResources(costs) {
        Object.keys(costs).forEach(resource => {
            gameState.resources[resource] = (gameState.resources[resource] || 0) - costs[resource];
        });
    }
    
    checkRequirements(cityId, requirements) {
        if (!requirements) return true;
        
        const city = gameState.cities[cityId];
        
        // Vérifier les bâtiments requis
        return Object.keys(requirements).every(req => {
            if (req === 'tech') {
                return gameState.technologies.includes(requirements[req]);
            } else {
                const building = city.buildings[req];
                return building && building.level >= requirements[req];
            }
        });
    }
    
    getIslandBonus(islandId) {
        // Simulé pour l'instant - à remplacer par la vraie logique d'îles
        const bonuses = {
            roma_island: { gold: 0.3 }, // Rome: +30% or
            sicilia_island: { wine: 0.25 }, // Sicile: +25% vin
            corsica_island: { stone: 0.25 } // Corse: +25% pierre
        };
        
        return bonuses[islandId] || {};
    }
    
    // Gestion des événements
    on(event, callback) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(callback);
    }
    
    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(callback => callback(data));
        }
    }
    
    // Sauvegarde et chargement
    saveGame() {
        try {
            const saveData = {
                gameState: gameState,
                timestamp: Date.now(),
                version: GAME_CONFIG.version
            };
            
            localStorage.setItem('imperium_save', JSON.stringify(saveData));
            this.emit('gameSaved', saveData);
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            return false;
        }
    }
    
    loadGame() {
        try {
            const saveData = localStorage.getItem('imperium_save');
            if (saveData) {
                const parsed = JSON.parse(saveData);
                
                // Vérifier la version
                if (parsed.version === GAME_CONFIG.version) {
                    gameState = { ...gameState, ...parsed.gameState };
                    this.emit('gameLoaded', parsed);
                    return true;
                } else {
                    console.warn('Version de sauvegarde incompatible');
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
        }
        
        return false;
    }
    
    // Arrêt du jeu
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }
        this.isRunning = false;
        this.emit('gameStopped');
    }
    
    // Méthodes d'accès aux données
    getGameState() {
        return { ...gameState };
    }
    
    getCity(cityId) {
        return gameState.cities[cityId];
    }
    
    getResources() {
        return { ...gameState.resources };
    }
    
    getTechnologies() {
        return [...gameState.technologies];
    }
    
    bindEvents() {
        // Sauvegarder avant de fermer la page
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
    }
}

// Instance globale du moteur de jeu
const gameEngine = new ImperiumGameEngine();

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        gameEngine, 
        gameState, 
        BUILDINGS_CONFIG, 
        UNITS_CONFIG, 
        TECH_TREE, 
        RESOURCES_CONFIG,
        FORMULAS 
    };
}