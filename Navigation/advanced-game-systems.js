/**
 * 🏛️ IMPERIUM - Systèmes de Jeu Avancés
 * Implémentation complète de tous les systèmes complexes du README
 */

// ===== SYSTÈME DE COMBAT AVANCÉ =====
class CombatSystem {
    static calculateCombatOutcome(attackerArmy, defenderArmy, defenderCity, technologies = {}) {
        // Calcul de la puissance d'attaque selon la formule du README
        let attackerPower = 0;
        attackerArmy.forEach(unit => {
            const unitConfig = UNITS_CONFIG[unit.type];
            const moral = 100; // Moral de base pour l'attaquant
            attackerPower += unit.count * unitConfig.attack * (moral / 100);
        });
        
        // Bonus technologiques d'attaque
        const attackBonus = technologies.attackBonus || 0;
        attackerPower *= (1 + attackBonus);
        
        // Calcul de la défense
        let defenderPower = 0;
        defenderArmy.forEach(unit => {
            const unitConfig = UNITS_CONFIG[unit.type];
            const moral = defenderCity.happiness; // Moral basé sur le bonheur
            defenderPower += unit.count * unitConfig.defense * (moral / 100);
        });
        
        // Bonus technologiques de défense
        const defenseBonus = technologies.defenseBonus || 0;
        defenderPower *= (1 + defenseBonus);
        
        // Bonus des murailles
        const wallLevel = defenderCity.buildings.wall ? defenderCity.buildings.wall.level : 0;
        const wallBonus = wallLevel * 100;
        defenderPower += wallBonus;
        
        // Résolution du combat
        const powerRatio = attackerPower / Math.max(defenderPower, 1);
        const victory = powerRatio > 1;
        
        // Calcul des pertes (formule complexe)
        const attackerLossRate = this.calculateLossRate(powerRatio, false);
        const defenderLossRate = this.calculateLossRate(powerRatio, true);
        
        const result = {
            victory: victory,
            powerRatio: powerRatio,
            attackerPower: attackerPower,
            defenderPower: defenderPower,
            attackerLosses: {},
            defenderLosses: {},
            lootedResources: {},
            wallDamage: 0,
            battleReport: []
        };
        
        // Calcul des pertes par type d'unité
        attackerArmy.forEach(unit => {
            const baseLosses = Math.floor(unit.count * attackerLossRate);
            const randomFactor = 0.8 + (Math.random() * 0.4); // ±20% aléatoire
            result.attackerLosses[unit.type] = Math.min(unit.count, Math.floor(baseLosses * randomFactor));
        });
        
        defenderArmy.forEach(unit => {
            const baseLosses = Math.floor(unit.count * defenderLossRate);
            const randomFactor = 0.8 + (Math.random() * 0.4);
            result.defenderLosses[unit.type] = Math.min(unit.count, Math.floor(baseLosses * randomFactor));
        });
        
        // Pillage en cas de victoire
        if (victory) {
            result.lootedResources = this.calculateLoot(defenderCity, powerRatio);
            result.wallDamage = this.calculateWallDamage(attackerArmy, wallLevel, technologies);
        }
        
        // Génération du rapport de bataille
        result.battleReport = this.generateBattleReport(result, attackerArmy, defenderArmy);
        
        return result;
    }
    
    static calculateLossRate(powerRatio, isDefender) {
        if (isDefender) {
            // Le défenseur perd plus si l'attaquant est plus fort
            return Math.min(0.9, Math.max(0.1, powerRatio * 0.4));
        } else {
            // L'attaquant perd toujours quelque chose
            return Math.min(0.8, Math.max(0.2, 1 / powerRatio * 0.3));
        }
    }
    
    static calculateLoot(defenderCity, powerRatio) {
        const loot = {};
        const lootPercentage = Math.min(0.4, powerRatio * 0.15); // Max 40% de pillage
        
        Object.keys(RESOURCES_CONFIG).forEach(resource => {
            const available = gameState.resources[resource] || 0;
            const capacity = gameEngine.calculateStorageCapacity('main')[resource] || 0;
            const unprotected = Math.max(0, available - (capacity * 0.5)); // 50% protégé par l'entrepôt
            
            loot[resource] = Math.floor(unprotected * lootPercentage);
        });
        
        return loot;
    }
    
    static calculateWallDamage(attackerArmy, wallLevel, technologies) {
        let siegePower = 0;
        
        attackerArmy.forEach(unit => {
            const unitConfig = UNITS_CONFIG[unit.type];
            if (unitConfig.type === 'siege') {
                siegePower += unit.count * unitConfig.attack;
            }
        });
        
        // Bonus de balistique
        const siegeBonus = technologies.siegeBonus || 0;
        siegePower *= (1 + siegeBonus);
        
        // Dégâts aux murailles (max 3 niveaux par attaque)
        const wallDamage = Math.min(3, Math.floor(siegePower / (wallLevel * 50 + 100)));
        return wallDamage;
    }
    
    static generateBattleReport(result, attackerArmy, defenderArmy) {
        const report = [];
        
        report.push(`⚔️ RAPPORT DE BATAILLE`);
        report.push(`Résultat: ${result.victory ? '🏆 VICTOIRE' : '💀 DÉFAITE'}`);
        report.push(`Ratio de puissance: ${result.powerRatio.toFixed(2)}`);
        report.push(``);
        
        report.push(`👥 FORCES EN PRÉSENCE:`);
        report.push(`Attaquant: ${attackerArmy.map(u => `${u.count} ${UNITS_CONFIG[u.type].name}`).join(', ')}`);
        report.push(`Défenseur: ${defenderArmy.map(u => `${u.count} ${UNITS_CONFIG[u.type].name}`).join(', ')}`);
        report.push(``);
        
        report.push(`💀 PERTES:`);
        Object.keys(result.attackerLosses).forEach(unitType => {
            if (result.attackerLosses[unitType] > 0) {
                report.push(`Attaquant: -${result.attackerLosses[unitType]} ${UNITS_CONFIG[unitType].name}`);
            }
        });
        Object.keys(result.defenderLosses).forEach(unitType => {
            if (result.defenderLosses[unitType] > 0) {
                report.push(`Défenseur: -${result.defenderLosses[unitType]} ${UNITS_CONFIG[unitType].name}`);
            }
        });
        
        if (result.victory && Object.keys(result.lootedResources).length > 0) {
            report.push(``);
            report.push(`💰 BUTIN:`);
            Object.keys(result.lootedResources).forEach(resource => {
                if (result.lootedResources[resource] > 0) {
                    report.push(`+${result.lootedResources[resource]} ${RESOURCES_CONFIG[resource].name}`);
                }
            });
        }
        
        if (result.wallDamage > 0) {
            report.push(``);
            report.push(`🏰 DÉGÂTS AUX FORTIFICATIONS:`);
            report.push(`Muraille endommagée: -${result.wallDamage} niveaux`);
        }
        
        return report;
    }
}

// ===== SYSTÈME D'ESPIONNAGE =====
class EspionageSystem {
    static performEspionageMission(targetCityId, missionType, spyCount = 1) {
        const missions = {
            'scout': { cost: 100, successRate: 0.8, info: 'basic' },
            'resources': { cost: 200, successRate: 0.6, info: 'resources' },
            'military': { cost: 300, successRate: 0.5, info: 'military' },
            'sabotage': { cost: 500, successRate: 0.3, info: 'sabotage' }
        };
        
        const mission = missions[missionType];
        if (!mission) throw new Error('Type de mission inconnu');
        
        const totalCost = mission.cost * spyCount;
        if (!gameEngine.canAfford({ gold: totalCost })) {
            throw new Error('Or insuffisant pour la mission');
        }
        
        // Déduire le coût
        gameEngine.spendResources({ gold: totalCost });
        
        // Calculer le succès
        const baseSuccessRate = mission.successRate;
        const spyBonus = Math.min(0.3, spyCount * 0.1); // Bonus pour plusieurs espions
        const finalSuccessRate = Math.min(0.9, baseSuccessRate + spyBonus);
        
        const success = Math.random() < finalSuccessRate;
        
        const result = {
            success: success,
            missionType: missionType,
            cost: totalCost,
            spyCount: spyCount,
            information: null,
            detected: false
        };
        
        if (success) {
            result.information = this.gatherInformation(targetCityId, mission.info);
        } else {
            // Risque de détection en cas d'échec
            result.detected = Math.random() < 0.4;
        }
        
        return result;
    }
    
    static gatherInformation(targetCityId, infoType) {
        // Simuler les informations d'une cité cible
        const targetCity = this.generateTargetCityData(targetCityId);
        
        switch (infoType) {
            case 'basic':
                return {
                    cityName: targetCity.name,
                    population: targetCity.population,
                    happiness: targetCity.happiness,
                    forumLevel: targetCity.buildings.forum?.level || 0
                };
                
            case 'resources':
                return {
                    resources: { ...targetCity.resources },
                    production: targetCity.production,
                    storageCapacity: targetCity.storageCapacity
                };
                
            case 'military':
                return {
                    units: { ...targetCity.units },
                    navy: { ...targetCity.navy },
                    wallLevel: targetCity.buildings.wall?.level || 0,
                    defenseBonus: targetCity.defenseBonus
                };
                
            case 'sabotage':
                // Sabotage réussi - réduire la production temporairement
                return {
                    sabotageEffect: 'Production réduite de 25% pendant 6 heures',
                    duration: 6 * 3600 * 1000 // 6 heures en millisecondes
                };
                
            default:
                return {};
        }
    }
    
    static generateTargetCityData(cityId) {
        // Générer des données simulées pour une cité cible
        return {
            name: `Cité ${cityId}`,
            population: 50 + Math.floor(Math.random() * 200),
            happiness: 30 + Math.floor(Math.random() * 70),
            buildings: {
                forum: { level: 1 + Math.floor(Math.random() * 10) },
                wall: { level: Math.floor(Math.random() * 8) }
            },
            resources: {
                wood: Math.floor(Math.random() * 5000),
                stone: Math.floor(Math.random() * 3000),
                iron: Math.floor(Math.random() * 2000),
                wine: Math.floor(Math.random() * 1000),
                gold: Math.floor(Math.random() * 10000)
            },
            units: {
                velites: Math.floor(Math.random() * 50),
                hastati: Math.floor(Math.random() * 30),
                legionnaires: Math.floor(Math.random() * 20),
                equites: Math.floor(Math.random() * 15),
                balistes: Math.floor(Math.random() * 5)
            },
            navy: {
                trireme: Math.floor(Math.random() * 10),
                quinquereme: Math.floor(Math.random() * 5),
                merchant_ship: Math.floor(Math.random() * 8)
            }
        };
    }
}

// ===== SYSTÈME DE MARCHÉ =====
class MarketSystem {
    constructor() {
        this.orders = {
            buy: [],
            sell: []
        };
        this.priceHistory = {};
        this.taxRate = 0.05; // 5% de taxe impériale
        
        this.initializePrices();
    }
    
    initializePrices() {
        // Prix de base pour chaque ressource
        this.basePrices = {
            wood: 2,
            stone: 3,
            iron: 5,
            wine: 4,
            gold: 1 // L'or est la référence
        };
        
        // Initialiser l'historique des prix
        Object.keys(this.basePrices).forEach(resource => {
            this.priceHistory[resource] = [this.basePrices[resource]];
        });
    }
    
    placeBuyOrder(resource, quantity, maxPrice, playerId = 'player') {
        const order = {
            id: Date.now() + Math.random(),
            type: 'buy',
            resource: resource,
            quantity: quantity,
            price: maxPrice,
            playerId: playerId,
            timestamp: Date.now()
        };
        
        // Vérifier si le joueur peut payer
        const totalCost = quantity * maxPrice;
        if (!gameEngine.canAfford({ gold: totalCost })) {
            throw new Error('Or insuffisant pour cet ordre d\'achat');
        }
        
        // Réserver l'or
        gameEngine.spendResources({ gold: totalCost });
        order.reservedGold = totalCost;
        
        this.orders.buy.push(order);
        this.matchOrders();
        
        return order;
    }
    
    placeSellOrder(resource, quantity, minPrice, playerId = 'player') {
        const order = {
            id: Date.now() + Math.random(),
            type: 'sell',
            resource: resource,
            quantity: quantity,
            price: minPrice,
            playerId: playerId,
            timestamp: Date.now()
        };
        
        // Vérifier si le joueur a les ressources
        if (!gameEngine.canAfford({ [resource]: quantity })) {
            throw new Error(`${RESOURCES_CONFIG[resource].name} insuffisant`);
        }
        
        // Réserver les ressources
        gameEngine.spendResources({ [resource]: quantity });
        order.reservedResource = { [resource]: quantity };
        
        this.orders.sell.push(order);
        this.matchOrders();
        
        return order;
    }
    
    matchOrders() {
        Object.keys(RESOURCES_CONFIG).forEach(resource => {
            if (resource === 'gold') return; // L'or n'est pas échangeable
            
            const buyOrders = this.orders.buy
                .filter(o => o.resource === resource)
                .sort((a, b) => b.price - a.price); // Prix décroissant
                
            const sellOrders = this.orders.sell
                .filter(o => o.resource === resource)
                .sort((a, b) => a.price - b.price); // Prix croissant
            
            let i = 0, j = 0;
            while (i < buyOrders.length && j < sellOrders.length) {
                const buyOrder = buyOrders[i];
                const sellOrder = sellOrders[j];
                
                if (buyOrder.price >= sellOrder.price) {
                    // Transaction possible
                    const tradePrice = (buyOrder.price + sellOrder.price) / 2;
                    const tradeQuantity = Math.min(buyOrder.quantity, sellOrder.quantity);
                    
                    this.executeTrade(buyOrder, sellOrder, tradeQuantity, tradePrice);
                    
                    // Mettre à jour les quantités
                    buyOrder.quantity -= tradeQuantity;
                    sellOrder.quantity -= tradeQuantity;
                    
                    // Supprimer les ordres complétés
                    if (buyOrder.quantity === 0) {
                        this.orders.buy = this.orders.buy.filter(o => o.id !== buyOrder.id);
                        i++;
                    }
                    if (sellOrder.quantity === 0) {
                        this.orders.sell = this.orders.sell.filter(o => o.id !== sellOrder.id);
                        j++;
                    }
                } else {
                    break; // Plus de correspondances possibles
                }
            }
        });
    }
    
    executeTrade(buyOrder, sellOrder, quantity, price) {
        const totalValue = quantity * price;
        const tax = totalValue * this.taxRate;
        const sellerReceives = totalValue - tax;
        
        // Le vendeur reçoit l'or (moins la taxe)
        if (sellOrder.playerId === 'player') {
            gameState.resources.gold += sellerReceives;
        }
        
        // L'acheteur reçoit les ressources
        if (buyOrder.playerId === 'player') {
            gameState.resources[buyOrder.resource] += quantity;
            
            // Rembourser la différence si le prix était plus bas
            const priceDifference = (buyOrder.price - price) * quantity;
            if (priceDifference > 0) {
                gameState.resources.gold += priceDifference;
            }
        }
        
        // Mettre à jour l'historique des prix
        this.updatePriceHistory(buyOrder.resource, price);
        
        // Émettre un événement de transaction
        gameEngine.emit('tradeExecuted', {
            resource: buyOrder.resource,
            quantity: quantity,
            price: price,
            tax: tax,
            buyer: buyOrder.playerId,
            seller: sellOrder.playerId
        });
    }
    
    updatePriceHistory(resource, price) {
        if (!this.priceHistory[resource]) {
            this.priceHistory[resource] = [];
        }
        
        this.priceHistory[resource].push(price);
        
        // Garder seulement les 100 derniers prix
        if (this.priceHistory[resource].length > 100) {
            this.priceHistory[resource].shift();
        }
    }
    
    getCurrentPrice(resource) {
        const history = this.priceHistory[resource];
        if (!history || history.length === 0) {
            return this.basePrices[resource];
        }
        
        // Prix moyen des 10 dernières transactions
        const recentPrices = history.slice(-10);
        return recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
    }
    
    getMarketData() {
        const data = {};
        
        Object.keys(RESOURCES_CONFIG).forEach(resource => {
            if (resource === 'gold') return;
            
            const buyOrders = this.orders.buy.filter(o => o.resource === resource);
            const sellOrders = this.orders.sell.filter(o => o.resource === resource);
            
            data[resource] = {
                currentPrice: this.getCurrentPrice(resource),
                buyOrders: buyOrders.length,
                sellOrders: sellOrders.length,
                highestBuy: buyOrders.length > 0 ? Math.max(...buyOrders.map(o => o.price)) : 0,
                lowestSell: sellOrders.length > 0 ? Math.min(...sellOrders.map(o => o.price)) : 0,
                priceHistory: [...this.priceHistory[resource]]
            };
        });
        
        return data;
    }
    
    cancelOrder(orderId, playerId = 'player') {
        let order = this.orders.buy.find(o => o.id === orderId && o.playerId === playerId);
        let orderType = 'buy';
        
        if (!order) {
            order = this.orders.sell.find(o => o.id === orderId && o.playerId === playerId);
            orderType = 'sell';
        }
        
        if (!order) {
            throw new Error('Ordre non trouvé');
        }
        
        // Rembourser les ressources réservées
        if (orderType === 'buy' && order.reservedGold) {
            gameState.resources.gold += order.reservedGold;
        } else if (orderType === 'sell' && order.reservedResource) {
            Object.keys(order.reservedResource).forEach(resource => {
                gameState.resources[resource] += order.reservedResource[resource];
            });
        }
        
        // Supprimer l'ordre
        this.orders[orderType] = this.orders[orderType].filter(o => o.id !== orderId);
        
        return true;
    }
}

// ===== SYSTÈME D'ALLIANCES =====
class AllianceSystem {
    constructor() {
        this.alliances = new Map();
        this.invitations = [];
        this.maxMembers = 50;
    }
    
    createAlliance(name, description, founderId = 'player') {
        const allianceId = Date.now().toString();
        
        const alliance = {
            id: allianceId,
            name: name,
            description: description,
            founderId: founderId,
            members: [founderId],
            treasury: { gold: 0, wood: 0, stone: 0, iron: 0, wine: 0 },
            level: 1,
            experience: 0,
            bonuses: {
                production: 0.05, // 5% de base
                defense: 0.1,
                research: 0.05
            },
            buildings: {},
            wars: [],
            diplomacy: {},
            createdAt: Date.now()
        };
        
        this.alliances.set(allianceId, alliance);
        
        // Mettre à jour l'état du joueur
        if (founderId === 'player') {
            gameState.player.alliance = {
                id: allianceId,
                name: name,
                role: 'leader',
                joinedAt: Date.now()
            };
        }
        
        return alliance;
    }
    
    invitePlayer(allianceId, playerId, inviterId = 'player') {
        const alliance = this.alliances.get(allianceId);
        if (!alliance) throw new Error('Alliance non trouvée');
        
        if (alliance.members.length >= this.maxMembers) {
            throw new Error('Alliance pleine');
        }
        
        if (alliance.members.includes(playerId)) {
            throw new Error('Joueur déjà membre');
        }
        
        // Vérifier les permissions
        if (!this.hasPermission(allianceId, inviterId, 'invite')) {
            throw new Error('Permissions insuffisantes');
        }
        
        const invitation = {
            id: Date.now(),
            allianceId: allianceId,
            allianceName: alliance.name,
            playerId: playerId,
            inviterId: inviterId,
            timestamp: Date.now(),
            status: 'pending'
        };
        
        this.invitations.push(invitation);
        return invitation;
    }
    
    acceptInvitation(invitationId, playerId = 'player') {
        const invitation = this.invitations.find(i => i.id === invitationId && i.playerId === playerId);
        if (!invitation) throw new Error('Invitation non trouvée');
        
        const alliance = this.alliances.get(invitation.allianceId);
        if (!alliance) throw new Error('Alliance non trouvée');
        
        if (alliance.members.length >= this.maxMembers) {
            throw new Error('Alliance pleine');
        }
        
        // Ajouter le joueur à l'alliance
        alliance.members.push(playerId);
        invitation.status = 'accepted';
        
        // Mettre à jour l'état du joueur
        if (playerId === 'player') {
            gameState.player.alliance = {
                id: alliance.id,
                name: alliance.name,
                role: 'member',
                joinedAt: Date.now()
            };
        }
        
        // Ajouter de l'expérience à l'alliance
        this.addAllianceExperience(invitation.allianceId, 100);
        
        return alliance;
    }
    
    leaveAlliance(allianceId, playerId = 'player') {
        const alliance = this.alliances.get(allianceId);
        if (!alliance) throw new Error('Alliance non trouvée');
        
        if (!alliance.members.includes(playerId)) {
            throw new Error('Joueur non membre');
        }
        
        // Le fondateur ne peut pas quitter (il doit transférer le leadership)
        if (alliance.founderId === playerId && alliance.members.length > 1) {
            throw new Error('Le leader doit transférer le leadership avant de quitter');
        }
        
        // Retirer le joueur
        alliance.members = alliance.members.filter(id => id !== playerId);
        
        // Si c'était le dernier membre, dissoudre l'alliance
        if (alliance.members.length === 0) {
            this.alliances.delete(allianceId);
        }
        
        // Mettre à jour l'état du joueur
        if (playerId === 'player') {
            gameState.player.alliance = null;
        }
        
        return true;
    }
    
    contributeToTreasury(allianceId, resources, playerId = 'player') {
        const alliance = this.alliances.get(allianceId);
        if (!alliance) throw new Error('Alliance non trouvée');
        
        if (!alliance.members.includes(playerId)) {
            throw new Error('Joueur non membre');
        }
        
        // Vérifier si le joueur a les ressources
        if (!gameEngine.canAfford(resources)) {
            throw new Error('Ressources insuffisantes');
        }
        
        // Déduire les ressources du joueur
        gameEngine.spendResources(resources);
        
        // Ajouter à la trésorerie d'alliance
        Object.keys(resources).forEach(resource => {
            alliance.treasury[resource] = (alliance.treasury[resource] || 0) + resources[resource];
        });
        
        // Ajouter de l'expérience
        const totalValue = Object.keys(resources).reduce((sum, resource) => {
            return sum + (resources[resource] * (RESOURCES_CONFIG[resource] ? 1 : 0));
        }, 0);
        
        this.addAllianceExperience(allianceId, Math.floor(totalValue / 100));
        
        return alliance.treasury;
    }
    
    addAllianceExperience(allianceId, exp) {
        const alliance = this.alliances.get(allianceId);
        if (!alliance) return;
        
        alliance.experience += exp;
        
        // Vérifier si l'alliance peut monter de niveau
        const requiredExp = alliance.level * 1000;
        if (alliance.experience >= requiredExp) {
            alliance.level++;
            alliance.experience -= requiredExp;
            
            // Améliorer les bonus
            alliance.bonuses.production += 0.01; // +1% par niveau
            alliance.bonuses.defense += 0.02;    // +2% par niveau
            alliance.bonuses.research += 0.01;   // +1% par niveau
            
            gameEngine.emit('allianceLevelUp', { alliance, newLevel: alliance.level });
        }
    }
    
    hasPermission(allianceId, playerId, action) {
        const alliance = this.alliances.get(allianceId);
        if (!alliance) return false;
        
        // Le fondateur a tous les droits
        if (alliance.founderId === playerId) return true;
        
        // Pour l'instant, système simple : seul le leader peut inviter
        if (action === 'invite') {
            return alliance.founderId === playerId;
        }
        
        return false;
    }
    
    getAllianceData(allianceId) {
        return this.alliances.get(allianceId);
    }
    
    getPlayerAlliance(playerId = 'player') {
        for (const [id, alliance] of this.alliances) {
            if (alliance.members.includes(playerId)) {
                return alliance;
            }
        }
        return null;
    }
}

// ===== SYSTÈME D'ÉVÉNEMENTS MONDIAUX =====
class WorldEventsSystem {
    constructor() {
        this.activeEvents = [];
        this.eventHistory = [];
        this.eventTypes = {
            'barbarian_invasion': {
                name: 'Invasion Barbare',
                description: 'Des tribus barbares attaquent les îles!',
                duration: 24 * 3600 * 1000, // 24 heures
                effects: { defenseBonus: -0.2 },
                rewards: { gold: 5000, iron: 1000 }
            },
            'economic_crisis': {
                name: 'Crise Économique',
                description: 'Les prix du marché fluctuent violemment!',
                duration: 12 * 3600 * 1000, // 12 heures
                effects: { marketVolatility: 2.0 },
                rewards: { gold: 2000 }
            },
            'colosseum_games': {
                name: 'Jeux du Colisée',
                description: 'Tournoi PvP avec des récompenses exceptionnelles!',
                duration: 48 * 3600 * 1000, // 48 heures
                effects: { pvpRewards: 2.0 },
                rewards: { gold: 10000, wine: 500 }
            },
            'golden_age': {
                name: 'Âge d\'Or',
                description: 'Période de prospérité pour tous!',
                duration: 6 * 3600 * 1000, // 6 heures
                effects: { productionBonus: 0.5 },
                rewards: { gold: 3000 }
            }
        };
    }
    
    startRandomEvent() {
        const eventTypeKeys = Object.keys(this.eventTypes);
        const randomType = eventTypeKeys[Math.floor(Math.random() * eventTypeKeys.length)];
        
        return this.startEvent(randomType);
    }
    
    startEvent(eventType) {
        const eventConfig = this.eventTypes[eventType];
        if (!eventConfig) throw new Error('Type d\'événement inconnu');
        
        const event = {
            id: Date.now(),
            type: eventType,
            name: eventConfig.name,
            description: eventConfig.description,
            startTime: Date.now(),
            endTime: Date.now() + eventConfig.duration,
            effects: { ...eventConfig.effects },
            rewards: { ...eventConfig.rewards },
            participants: [],
            completed: false
        };
        
        this.activeEvents.push(event);
        
        // Appliquer les effets
        this.applyEventEffects(event);
        
        gameEngine.emit('worldEventStarted', event);
        
        return event;
    }
    
    applyEventEffects(event) {
        // Les effets sont appliqués globalement
        if (event.effects.productionBonus) {
            // Bonus de production temporaire
            gameState.temporaryEffects = gameState.temporaryEffects || {};
            gameState.temporaryEffects.productionBonus = event.effects.productionBonus;
        }
        
        if (event.effects.defenseBonus) {
            gameState.temporaryEffects = gameState.temporaryEffects || {};
            gameState.temporaryEffects.defenseBonus = event.effects.defenseBonus;
        }
    }
    
    participateInEvent(eventId, playerId = 'player') {
        const event = this.activeEvents.find(e => e.id === eventId);
        if (!event) throw new Error('Événement non trouvé');
        
        if (event.participants.includes(playerId)) {
            throw new Error('Déjà participant');
        }
        
        event.participants.push(playerId);
        
        gameEngine.emit('eventParticipation', { event, playerId });
        
        return event;
    }
    
    completeEvent(eventId) {
        const eventIndex = this.activeEvents.findIndex(e => e.id === eventId);
        if (eventIndex === -1) return;
        
        const event = this.activeEvents[eventIndex];
        event.completed = true;
        
        // Distribuer les récompenses aux participants
        event.participants.forEach(playerId => {
            if (playerId === 'player') {
                Object.keys(event.rewards).forEach(resource => {
                    gameState.resources[resource] = (gameState.resources[resource] || 0) + event.rewards[resource];
                });
            }
        });
        
        // Retirer les effets temporaires
        this.removeEventEffects(event);
        
        // Déplacer vers l'historique
        this.eventHistory.push(event);
        this.activeEvents.splice(eventIndex, 1);
        
        gameEngine.emit('worldEventCompleted', event);
        
        return event;
    }
    
    removeEventEffects(event) {
        if (gameState.temporaryEffects) {
            if (event.effects.productionBonus) {
                delete gameState.temporaryEffects.productionBonus;
            }
            if (event.effects.defenseBonus) {
                delete gameState.temporaryEffects.defenseBonus;
            }
        }
    }
    
    updateEvents() {
        const now = Date.now();
        
        // Vérifier les événements expirés
        this.activeEvents.forEach(event => {
            if (now >= event.endTime && !event.completed) {
                this.completeEvent(event.id);
            }
        });
        
        // Déclencher de nouveaux événements aléatoirement
        if (Math.random() < 0.001 && this.activeEvents.length < 2) { // 0.1% de chance par seconde
            this.startRandomEvent();
        }
    }
    
    getActiveEvents() {
        return [...this.activeEvents];
    }
    
    getEventHistory() {
        return [...this.eventHistory];
    }
}

// ===== SYSTÈME DE CLASSEMENTS =====
class RankingSystem {
    constructor() {
        this.rankings = {
            general: [],
            economic: [],
            military: [],
            research: [],
            pillage: []
        };
        
        this.updateInterval = 5 * 60 * 1000; // Mise à jour toutes les 5 minutes
        this.lastUpdate = 0;
    }
    
    calculatePlayerScore(playerId = 'player') {
        const scores = {
            general: 0,
            economic: 0,
            military: 0,
            research: 0,
            pillage: 0
        };
        
        // Score économique
        Object.keys(gameState.resources).forEach(resource => {
            scores.economic += gameState.resources[resource] * (RESOURCES_CONFIG[resource] ? 1 : 0);
        });
        
        // Score militaire
        Object.keys(gameState.cities).forEach(cityId => {
            const city = gameState.cities[cityId];
            Object.keys(city.units || {}).forEach(unitType => {
                const unitConfig = UNITS_CONFIG[unitType];
                if (unitConfig) {
                    scores.military += city.units[unitType] * (unitConfig.attack + unitConfig.defense);
                }
            });
            
            Object.keys(city.navy || {}).forEach(unitType => {
                const unitConfig = UNITS_CONFIG[unitType];
                if (unitConfig) {
                    scores.military += city.navy[unitType] * unitConfig.attack;
                }
            });
        });
        
        // Score de recherche
        scores.research = gameState.technologies.length * 1000;
        
        // Score de pillage (simulé)
        scores.pillage = gameState.player.totalPillaged || 0;
        
        // Score général (combinaison de tous)
        scores.general = scores.economic * 0.3 + scores.military * 0.4 + scores.research * 0.2 + scores.pillage * 0.1;
        
        return scores;
    }
    
    updateRankings() {
        const now = Date.now();
        if (now - this.lastUpdate < this.updateInterval) return;
        
        // Générer des données simulées pour d'autres joueurs
        const players = this.generateSimulatedPlayers();
        
        // Ajouter le joueur réel
        const playerScores = this.calculatePlayerScore('player');
        players.push({
            id: 'player',
            name: gameState.player.name,
            level: gameState.player.level,
            alliance: gameState.player.alliance?.name || 'Aucune',
            scores: playerScores
        });
        
        // Trier par chaque catégorie
        Object.keys(this.rankings).forEach(category => {
            this.rankings[category] = players
                .sort((a, b) => b.scores[category] - a.scores[category])
                .map((player, index) => ({
                    rank: index + 1,
                    ...player,
                    score: Math.floor(player.scores[category])
                }));
        });
        
        this.lastUpdate = now;
        gameEngine.emit('rankingsUpdated', this.rankings);
    }
    
    generateSimulatedPlayers() {
        const players = [];
        const names = [
            'Caesar Augustus', 'Marcus Aurelius', 'Trajan', 'Hadrian', 'Diocletian',
            'Constantine', 'Vespasian', 'Titus', 'Nerva', 'Antoninus Pius',
            'Lucius Verus', 'Commodus', 'Septimius Severus', 'Caracalla', 'Geta'
        ];
        
        const alliances = ['SPQR', 'Legio XIII', 'Aquila', 'Praetorian', 'Centurion'];
        
        for (let i = 0; i < 50; i++) {
            const baseScore = 10000 + Math.random() * 90000;
            const variation = 0.5 + Math.random();
            
            players.push({
                id: `player_${i}`,
                name: names[Math.floor(Math.random() * names.length)] + ` ${i + 1}`,
                level: 1 + Math.floor(Math.random() * 20),
                alliance: Math.random() > 0.3 ? alliances[Math.floor(Math.random() * alliances.length)] : 'Aucune',
                scores: {
                    general: baseScore * variation,
                    economic: baseScore * 0.8 * variation,
                    military: baseScore * 1.2 * variation,
                    research: baseScore * 0.6 * variation,
                    pillage: baseScore * 0.4 * variation
                }
            });
        }
        
        return players;
    }
    
    getRanking(category) {
        this.updateRankings();
        return this.rankings[category] || [];
    }
    
    getPlayerRank(playerId = 'player', category = 'general') {
        const ranking = this.getRanking(category);
        const playerEntry = ranking.find(entry => entry.id === playerId);
        return playerEntry ? playerEntry.rank : null;
    }
}

// ===== INITIALISATION DES SYSTÈMES AVANCÉS =====
const marketSystem = new MarketSystem();
const allianceSystem = new AllianceSystem();
const worldEventsSystem = new WorldEventsSystem();
const rankingSystem = new RankingSystem();

// Intégration avec le moteur de jeu principal
if (typeof gameEngine !== 'undefined') {
    // Ajouter les systèmes au moteur de jeu
    gameEngine.marketSystem = marketSystem;
    gameEngine.allianceSystem = allianceSystem;
    gameEngine.worldEventsSystem = worldEventsSystem;
    gameEngine.rankingSystem = rankingSystem;
    gameEngine.combatSystem = CombatSystem;
    gameEngine.espionageSystem = EspionageSystem;
    
    // Mise à jour périodique des événements
    gameEngine.on('gameUpdated', () => {
        worldEventsSystem.updateEvents();
    });
}

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CombatSystem,
        EspionageSystem,
        MarketSystem,
        AllianceSystem,
        WorldEventsSystem,
        RankingSystem,
        marketSystem,
        allianceSystem,
        worldEventsSystem,
        rankingSystem
    };
}