/**
 * 🏛️ IMPERIUM - Système d'interactions communes
 * Ce script gère toutes les interactions communes à toutes les pages
 */

class ImperiumInteractions {
    constructor() {
        this.gameState = {
            resources: {},
            buildings: {},
            research: {},
            military: {},
            diplomacy: {},
            quests: {},
            achievements: {}
        };
        
        this.actionHandlers = {
            // Fonctions de construction
            'build': this.handleBuild.bind(this),
            'upgrade': this.handleUpgrade.bind(this),
            'demolish': this.handleDemolish.bind(this),
            
            // Fonctions de recherche
            'research': this.handleResearch.bind(this),
            
            // Fonctions militaires
            'train': this.handleTrain.bind(this),
            'attack': this.handleAttack.bind(this),
            'defend': this.handleDefend.bind(this),
            
            // Fonctions de commerce
            'buy': this.handleBuy.bind(this),
            'sell': this.handleSell.bind(this),
            'trade': this.handleTrade.bind(this),
            
            // Fonctions de diplomatie
            'alliance': this.handleAlliance.bind(this),
            'treaty': this.handleTreaty.bind(this),
            'war': this.handleWar.bind(this),
            
            // Fonctions de navigation
            'navigate': this.handleNavigate.bind(this),
            
            // Fonctions de ressources
            'collect': this.handleCollect.bind(this),
            'produce': this.handleProduce.bind(this),
            
            // Fonctions d'interface
            'toggle': this.handleToggle.bind(this),
            'open': this.handleOpen.bind(this),
            'close': this.handleClose.bind(this)
        };
        
        this.init();
    }
    
    init() {
        this.loadGameState();
        this.bindButtons();
        this.setupEventListeners();
    }
    
    loadGameState() {
        try {
            const savedState = localStorage.getItem('imperium_game_state');
            if (savedState) {
                this.gameState = JSON.parse(savedState);
            }
        } catch (e) {
            console.warn('Impossible de charger l\'état du jeu:', e);
        }
    }
    
    saveGameState() {
        try {
            localStorage.setItem('imperium_game_state', JSON.stringify(this.gameState));
        } catch (e) {
            console.warn('Impossible de sauvegarder l\'état du jeu:', e);
        }
    }
    
    bindButtons() {
        // Lier tous les boutons avec data-action
        document.querySelectorAll('[data-action]').forEach(element => {
            const action = element.getAttribute('data-action');
            const params = element.getAttribute('data-params');
            
            element.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAction(action, params ? JSON.parse(params) : {});
            });
        });
        
        // Lier tous les boutons avec onclick qui utilisent handleAction
        document.querySelectorAll('[onclick*="handleAction"]').forEach(element => {
            const onclickAttr = element.getAttribute('onclick');
            element.removeAttribute('onclick');
            
            // Extraire l'action et les paramètres
            const match = onclickAttr.match(/handleAction\(['"]([^'"]+)['"](?:,\s*([^)]+))?\)/);
            if (match) {
                const action = match[1];
                const params = match[2] ? eval(`(${match[2]})`) : {};
                
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleAction(action, params);
                });
            }
        });
    }
    
    setupEventListeners() {
        // Écouter les événements personnalisés
        document.addEventListener('imperium:resourceUpdate', (e) => {
            if (window.imperiumHeader2025) {
                window.imperiumHeader2025.updateResources(e.detail);
            }
        });
        
        document.addEventListener('imperium:notification', (e) => {
            this.showNotification(e.detail.message, e.detail.type);
        });
        
        document.addEventListener('imperium:gameStateUpdate', (e) => {
            Object.assign(this.gameState, e.detail);
            this.saveGameState();
        });
    }
    
    handleAction(action, params = {}) {
        console.log(`Action: ${action}`, params);
        
        // Vérifier si l'action existe
        if (this.actionHandlers[action]) {
            return this.actionHandlers[action](params);
        } else {
            console.warn(`Action non reconnue: ${action}`);
            this.showNotification(`Action non reconnue: ${action}`, 'error');
            return false;
        }
    }
    
    // ===== HANDLERS D'ACTIONS =====
    
    // Construction
    handleBuild(params) {
        const { buildingType, cost, time } = params;
        
        // Vérifier si les ressources sont suffisantes
        if (!this.checkResources(cost)) {
            this.showNotification('Ressources insuffisantes pour construire', 'error');
            return false;
        }
        
        // Soustraire les ressources
        this.subtractResources(cost);
        
        // Ajouter le bâtiment à l'état du jeu
        if (!this.gameState.buildings[buildingType]) {
            this.gameState.buildings[buildingType] = { level: 0, count: 0 };
        }
        
        this.gameState.buildings[buildingType].count++;
        
        // Sauvegarder l'état
        this.saveGameState();
        
        // Notification
        this.showNotification(`Construction de ${buildingType} commencée`, 'success');
        
        // Si le header est disponible, ajouter un log
        if (window.imperiumHeader2025) {
            window.imperiumHeader2025.addLog(`Construction de ${buildingType} commencée`, 'building');
        }
        
        // Simuler le temps de construction
        setTimeout(() => {
            this.showNotification(`${buildingType} construction terminée!`, 'success');
            
            // Mettre à jour l'interface si nécessaire
            document.dispatchEvent(new CustomEvent('imperium:buildingComplete', {
                detail: { buildingType }
            }));
            
            if (window.imperiumHeader2025) {
                window.imperiumHeader2025.addLog(`${buildingType} construction terminée!`, 'building');
            }
        }, time || 3000);
        
        return true;
    }
    
    handleUpgrade(params) {
        const { buildingType, cost, time } = params;
        
        // Vérifier si le bâtiment existe
        if (!this.gameState.buildings[buildingType] || this.gameState.buildings[buildingType].count === 0) {
            this.showNotification(`Vous n'avez pas de ${buildingType} à améliorer`, 'error');
            return false;
        }
        
        // Vérifier si les ressources sont suffisantes
        if (!this.checkResources(cost)) {
            this.showNotification('Ressources insuffisantes pour améliorer', 'error');
            return false;
        }
        
        // Soustraire les ressources
        this.subtractResources(cost);
        
        // Augmenter le niveau du bâtiment
        this.gameState.buildings[buildingType].level++;
        
        // Sauvegarder l'état
        this.saveGameState();
        
        // Notification
        this.showNotification(`Amélioration de ${buildingType} commencée`, 'success');
        
        // Si le header est disponible, ajouter un log
        if (window.imperiumHeader2025) {
            window.imperiumHeader2025.addLog(`Amélioration de ${buildingType} commencée`, 'building');
        }
        
        // Simuler le temps d'amélioration
        setTimeout(() => {
            this.showNotification(`${buildingType} amélioration terminée!`, 'success');
            
            // Mettre à jour l'interface si nécessaire
            document.dispatchEvent(new CustomEvent('imperium:upgradeComplete', {
                detail: { buildingType }
            }));
            
            if (window.imperiumHeader2025) {
                window.imperiumHeader2025.addLog(`${buildingType} amélioration terminée!`, 'building');
            }
        }, time || 3000);
        
        return true;
    }
    
    handleDemolish(params) {
        const { buildingType } = params;
        
        // Vérifier si le bâtiment existe
        if (!this.gameState.buildings[buildingType] || this.gameState.buildings[buildingType].count === 0) {
            this.showNotification(`Vous n'avez pas de ${buildingType} à démolir`, 'error');
            return false;
        }
        
        // Diminuer le nombre de bâtiments
        this.gameState.buildings[buildingType].count--;
        
        // Si plus aucun bâtiment, réinitialiser le niveau
        if (this.gameState.buildings[buildingType].count === 0) {
            this.gameState.buildings[buildingType].level = 0;
        }
        
        // Sauvegarder l'état
        this.saveGameState();
        
        // Notification
        this.showNotification(`${buildingType} démoli avec succès`, 'success');
        
        // Si le header est disponible, ajouter un log
        if (window.imperiumHeader2025) {
            window.imperiumHeader2025.addLog(`${buildingType} démoli`, 'building');
        }
        
        // Mettre à jour l'interface si nécessaire
        document.dispatchEvent(new CustomEvent('imperium:demolishComplete', {
            detail: { buildingType }
        }));
        
        return true;
    }
    
    // Recherche
    handleResearch(params) {
        const { researchType, cost, time, benefits } = params;
        
        // Vérifier si la recherche est déjà terminée
        if (this.gameState.research[researchType] && this.gameState.research[researchType].completed) {
            this.showNotification(`${researchType} a déjà été recherché`, 'error');
            return false;
        }
        
        // Vérifier si les ressources sont suffisantes
        if (!this.checkResources(cost)) {
            this.showNotification('Ressources insuffisantes pour la recherche', 'error');
            return false;
        }
        
        // Soustraire les ressources
        this.subtractResources(cost);
        
        // Ajouter la recherche à l'état du jeu
        this.gameState.research[researchType] = { 
            inProgress: true,
            completed: false,
            startTime: Date.now(),
            endTime: Date.now() + (time || 10000),
            benefits: benefits || {}
        };
        
        // Sauvegarder l'état
        this.saveGameState();
        
        // Notification
        this.showNotification(`Recherche de ${researchType} commencée`, 'success');
        
        // Si le header est disponible, ajouter un log
        if (window.imperiumHeader2025) {
            window.imperiumHeader2025.addLog(`Recherche de ${researchType} commencée`, 'research');
        }
        
        // Simuler le temps de recherche
        setTimeout(() => {
            // Marquer la recherche comme terminée
            this.gameState.research[researchType].inProgress = false;
            this.gameState.research[researchType].completed = true;
            this.saveGameState();
            
            this.showNotification(`${researchType} recherche terminée!`, 'success');
            
            // Mettre à jour l'interface si nécessaire
            document.dispatchEvent(new CustomEvent('imperium:researchComplete', {
                detail: { researchType, benefits }
            }));
            
            if (window.imperiumHeader2025) {
                window.imperiumHeader2025.addLog(`${researchType} recherche terminée!`, 'research');
            }
            
            // Appliquer les bénéfices de la recherche
            this.applyResearchBenefits(researchType, benefits);
        }, time || 10000);
        
        return true;
    }
    
    applyResearchBenefits(researchType, benefits) {
        if (!benefits) return;
        
        // Appliquer les bénéfices selon leur type
        if (benefits.productionBoost) {
            // Augmenter les taux de production
            Object.entries(benefits.productionBoost).forEach(([resourceType, boost]) => {
                if (window.resourceUpdater && window.resourceUpdater.productionRates[resourceType]) {
                    window.resourceUpdater.productionRates[resourceType] *= (1 + boost);
                    window.resourceUpdater.saveToStorage();
                }
            });
        }
        
        if (benefits.maxResourceBoost) {
            // Augmenter les capacités maximales
            Object.entries(benefits.maxResourceBoost).forEach(([resourceType, boost]) => {
                if (window.resourceUpdater && window.resourceUpdater.maxResources[resourceType]) {
                    window.resourceUpdater.maxResources[resourceType] *= (1 + boost);
                    window.resourceUpdater.saveToStorage();
                }
            });
        }
        
        if (benefits.unlockBuilding) {
            // Débloquer de nouveaux bâtiments
            benefits.unlockBuilding.forEach(buildingType => {
                document.dispatchEvent(new CustomEvent('imperium:buildingUnlocked', {
                    detail: { buildingType }
                }));
            });
        }
        
        if (benefits.unlockUnit) {
            // Débloquer de nouvelles unités
            benefits.unlockUnit.forEach(unitType => {
                document.dispatchEvent(new CustomEvent('imperium:unitUnlocked', {
                    detail: { unitType }
                }));
            });
        }
    }
    
    // Militaire
    handleTrain(params) {
        const { unitType, count, cost, time } = params;
        
        // Vérifier si les ressources sont suffisantes
        if (!this.checkResources(cost)) {
            this.showNotification('Ressources insuffisantes pour l\'entraînement', 'error');
            return false;
        }
        
        // Soustraire les ressources
        this.subtractResources(cost);
        
        // Ajouter les unités à l'état du jeu
        if (!this.gameState.military[unitType]) {
            this.gameState.military[unitType] = { count: 0 };
        }
        
        // Sauvegarder l'état
        this.saveGameState();
        
        // Notification
        this.showNotification(`Entraînement de ${count} ${unitType} commencé`, 'success');
        
        // Si le header est disponible, ajouter un log
        if (window.imperiumHeader2025) {
            window.imperiumHeader2025.addLog(`Entraînement de ${count} ${unitType} commencé`, 'military');
        }
        
        // Simuler le temps d'entraînement
        setTimeout(() => {
            // Ajouter les unités
            this.gameState.military[unitType].count += count;
            this.saveGameState();
            
            this.showNotification(`${count} ${unitType} entraînement terminé!`, 'success');
            
            // Mettre à jour l'interface si nécessaire
            document.dispatchEvent(new CustomEvent('imperium:trainingComplete', {
                detail: { unitType, count }
            }));
            
            if (window.imperiumHeader2025) {
                window.imperiumHeader2025.addLog(`${count} ${unitType} entraînement terminé!`, 'military');
            }
        }, time || 5000);
        
        return true;
    }
    
    handleAttack(params) {
        const { target, units } = params;
        
        // Vérifier si les unités sont disponibles
        for (const [unitType, count] of Object.entries(units)) {
            if (!this.gameState.military[unitType] || this.gameState.military[unitType].count < count) {
                this.showNotification(`Pas assez de ${unitType} pour attaquer`, 'error');
                return false;
            }
        }
        
        // Soustraire les unités (elles sont en mission)
        for (const [unitType, count] of Object.entries(units)) {
            this.gameState.military[unitType].count -= count;
        }
        
        // Sauvegarder l'état
        this.saveGameState();
        
        // Notification
        this.showNotification(`Attaque contre ${target} lancée`, 'success');
        
        // Si le header est disponible, ajouter un log
        if (window.imperiumHeader2025) {
            window.imperiumHeader2025.addLog(`Attaque contre ${target} lancée`, 'military');
        }
        
        // Simuler le temps de voyage et de combat
        const travelTime = params.travelTime || 10000;
        setTimeout(() => {
            // Simuler le résultat du combat
            const victory = Math.random() > 0.3; // 70% de chance de victoire
            
            if (victory) {
                // Gains de ressources
                const loot = {
                    gold: Math.floor(Math.random() * 1000) + 500,
                    food: Math.floor(Math.random() * 500) + 200,
                    wood: Math.floor(Math.random() * 300) + 100
                };
                
                // Ajouter les ressources
                this.addResources(loot);
                
                // Retourner une partie des unités (pertes)
                const returnedUnits = {};
                for (const [unitType, count] of Object.entries(units)) {
                    const losses = Math.floor(count * (Math.random() * 0.3)); // 0-30% de pertes
                    returnedUnits[unitType] = count - losses;
                    this.gameState.military[unitType].count += returnedUnits[unitType];
                }
                
                this.saveGameState();
                
                this.showNotification(`Victoire contre ${target}! Butin récupéré.`, 'success');
                
                // Mettre à jour l'interface si nécessaire
                document.dispatchEvent(new CustomEvent('imperium:battleComplete', {
                    detail: { target, victory, loot, returnedUnits }
                }));
                
                if (window.imperiumHeader2025) {
                    window.imperiumHeader2025.addLog(`Victoire contre ${target}! Butin: ${loot.gold} or, ${loot.food} nourriture.`, 'military');
                }
            } else {
                // Défaite - retourner moins d'unités
                const returnedUnits = {};
                for (const [unitType, count] of Object.entries(units)) {
                    const losses = Math.floor(count * (0.5 + Math.random() * 0.3)); // 50-80% de pertes
                    returnedUnits[unitType] = count - losses;
                    this.gameState.military[unitType].count += returnedUnits[unitType];
                }
                
                this.saveGameState();
                
                this.showNotification(`Défaite contre ${target}! Vos troupes ont subi de lourdes pertes.`, 'error');
                
                // Mettre à jour l'interface si nécessaire
                document.dispatchEvent(new CustomEvent('imperium:battleComplete', {
                    detail: { target, victory, loot: null, returnedUnits }
                }));
                
                if (window.imperiumHeader2025) {
                    window.imperiumHeader2025.addLog(`Défaite contre ${target}! Lourdes pertes.`, 'military');
                }
            }
        }, travelTime);
        
        return true;
    }
    
    handleDefend(params) {
        const { units } = params;
        
        // Vérifier si les unités sont disponibles
        for (const [unitType, count] of Object.entries(units)) {
            if (!this.gameState.military[unitType] || this.gameState.military[unitType].count < count) {
                this.showNotification(`Pas assez de ${unitType} pour défendre`, 'error');
                return false;
            }
        }
        
        // Assigner les unités à la défense
        if (!this.gameState.defense) {
            this.gameState.defense = {};
        }
        
        for (const [unitType, count] of Object.entries(units)) {
            this.gameState.military[unitType].count -= count;
            
            if (!this.gameState.defense[unitType]) {
                this.gameState.defense[unitType] = 0;
            }
            
            this.gameState.defense[unitType] += count;
        }
        
        // Sauvegarder l'état
        this.saveGameState();
        
        // Notification
        this.showNotification(`Défenses renforcées avec succès`, 'success');
        
        // Si le header est disponible, ajouter un log
        if (window.imperiumHeader2025) {
            window.imperiumHeader2025.addLog(`Défenses renforcées avec de nouvelles troupes`, 'military');
        }
        
        // Mettre à jour l'interface si nécessaire
        document.dispatchEvent(new CustomEvent('imperium:defenseUpdated', {
            detail: { defense: this.gameState.defense }
        }));
        
        return true;
    }
    
    // Commerce
    handleBuy(params) {
        const { resourceType, amount, price } = params;
        
        // Vérifier si l'or est suffisant
        if (!this.checkResources({ gold: price * amount })) {
            this.showNotification('Or insuffisant pour cet achat', 'error');
            return false;
        }
        
        // Soustraire l'or
        this.subtractResources({ gold: price * amount });
        
        // Ajouter la ressource
        const resources = {};
        resources[resourceType] = amount;
        this.addResources(resources);
        
        // Notification
        this.showNotification(`Achat de ${amount} ${resourceType} pour ${price * amount} or`, 'success');
        
        // Si le header est disponible, ajouter un log
        if (window.imperiumHeader2025) {
            window.imperiumHeader2025.addLog(`Achat de ${amount} ${resourceType} pour ${price * amount} or`, 'commerce');
        }
        
        return true;
    }
    
    handleSell(params) {
        const { resourceType, amount, price } = params;
        
        // Vérifier si la ressource est suffisante
        const resources = {};
        resources[resourceType] = amount;
        
        if (!this.checkResources(resources)) {
            this.showNotification(`${resourceType} insuffisant pour cette vente`, 'error');
            return false;
        }
        
        // Soustraire la ressource
        this.subtractResources(resources);
        
        // Ajouter l'or
        this.addResources({ gold: price * amount });
        
        // Notification
        this.showNotification(`Vente de ${amount} ${resourceType} pour ${price * amount} or`, 'success');
        
        // Si le header est disponible, ajouter un log
        if (window.imperiumHeader2025) {
            window.imperiumHeader2025.addLog(`Vente de ${amount} ${resourceType} pour ${price * amount} or`, 'commerce');
        }
        
        return true;
    }
    
    handleTrade(params) {
        const { offer, request } = params;
        
        // Vérifier si les ressources offertes sont suffisantes
        if (!this.checkResources(offer)) {
            this.showNotification('Ressources insuffisantes pour cet échange', 'error');
            return false;
        }
        
        // Soustraire les ressources offertes
        this.subtractResources(offer);
        
        // Ajouter les ressources demandées
        this.addResources(request);
        
        // Notification
        this.showNotification(`Échange commercial effectué avec succès`, 'success');
        
        // Si le header est disponible, ajouter un log
        if (window.imperiumHeader2025) {
            window.imperiumHeader2025.addLog(`Échange commercial effectué`, 'commerce');
        }
        
        return true;
    }
    
    // Diplomatie
    handleAlliance(params) {
        const { faction, action } = params;
        
        if (action === 'propose') {
            // Proposer une alliance
            if (!this.gameState.diplomacy) {
                this.gameState.diplomacy = { alliances: [], wars: [], treaties: [] };
            }
            
            this.gameState.diplomacy.pendingAlliances = this.gameState.diplomacy.pendingAlliances || [];
            this.gameState.diplomacy.pendingAlliances.push(faction);
            
            this.saveGameState();
            
            this.showNotification(`Alliance proposée à ${faction}`, 'success');
            
            if (window.imperiumHeader2025) {
                window.imperiumHeader2025.addLog(`Alliance proposée à ${faction}`, 'diplomacy');
            }
        } else if (action === 'accept') {
            // Accepter une alliance
            if (!this.gameState.diplomacy) {
                this.gameState.diplomacy = { alliances: [], wars: [], treaties: [] };
            }
            
            this.gameState.diplomacy.alliances = this.gameState.diplomacy.alliances || [];
            this.gameState.diplomacy.alliances.push(faction);
            
            // Retirer des guerres si applicable
            if (this.gameState.diplomacy.wars && this.gameState.diplomacy.wars.includes(faction)) {
                this.gameState.diplomacy.wars = this.gameState.diplomacy.wars.filter(f => f !== faction);
            }
            
            this.saveGameState();
            
            this.showNotification(`Alliance avec ${faction} établie`, 'success');
            
            if (window.imperiumHeader2025) {
                window.imperiumHeader2025.addLog(`Alliance avec ${faction} établie`, 'diplomacy');
            }
        } else if (action === 'break') {
            // Rompre une alliance
            if (!this.gameState.diplomacy || !this.gameState.diplomacy.alliances) {
                return false;
            }
            
            this.gameState.diplomacy.alliances = this.gameState.diplomacy.alliances.filter(f => f !== faction);
            this.saveGameState();
            
            this.showNotification(`Alliance avec ${faction} rompue`, 'warning');
            
            if (window.imperiumHeader2025) {
                window.imperiumHeader2025.addLog(`Alliance avec ${faction} rompue`, 'diplomacy');
            }
        }
        
        return true;
    }
    
    handleTreaty(params) {
        const { faction, type, duration } = params;
        
        if (!this.gameState.diplomacy) {
            this.gameState.diplomacy = { alliances: [], wars: [], treaties: [] };
        }
        
        this.gameState.diplomacy.treaties = this.gameState.diplomacy.treaties || [];
        
        const treaty = {
            faction,
            type,
            startTime: Date.now(),
            endTime: Date.now() + (duration || 86400000) // Défaut: 1 jour
        };
        
        this.gameState.diplomacy.treaties.push(treaty);
        this.saveGameState();
        
        this.showNotification(`Traité de ${type} signé avec ${faction}`, 'success');
        
        if (window.imperiumHeader2025) {
            window.imperiumHeader2025.addLog(`Traité de ${type} signé avec ${faction}`, 'diplomacy');
        }
        
        return true;
    }
    
    handleWar(params) {
        const { faction, action } = params;
        
        if (action === 'declare') {
            // Déclarer la guerre
            if (!this.gameState.diplomacy) {
                this.gameState.diplomacy = { alliances: [], wars: [], treaties: [] };
            }
            
            this.gameState.diplomacy.wars = this.gameState.diplomacy.wars || [];
            
            // Vérifier si déjà en guerre
            if (this.gameState.diplomacy.wars.includes(faction)) {
                this.showNotification(`Vous êtes déjà en guerre avec ${faction}`, 'error');
                return false;
            }
            
            // Retirer des alliances si applicable
            if (this.gameState.diplomacy.alliances && this.gameState.diplomacy.alliances.includes(faction)) {
                this.gameState.diplomacy.alliances = this.gameState.diplomacy.alliances.filter(f => f !== faction);
            }
            
            this.gameState.diplomacy.wars.push(faction);
            this.saveGameState();
            
            this.showNotification(`Guerre déclarée contre ${faction}!`, 'warning');
            
            if (window.imperiumHeader2025) {
                window.imperiumHeader2025.addLog(`Guerre déclarée contre ${faction}!`, 'diplomacy');
            }
        } else if (action === 'peace') {
            // Proposer la paix
            if (!this.gameState.diplomacy || !this.gameState.diplomacy.wars) {
                return false;
            }
            
            // Vérifier si en guerre
            if (!this.gameState.diplomacy.wars.includes(faction)) {
                this.showNotification(`Vous n'êtes pas en guerre avec ${faction}`, 'error');
                return false;
            }
            
            this.gameState.diplomacy.pendingPeace = this.gameState.diplomacy.pendingPeace || [];
            this.gameState.diplomacy.pendingPeace.push(faction);
            
            this.saveGameState();
            
            this.showNotification(`Proposition de paix envoyée à ${faction}`, 'success');
            
            if (window.imperiumHeader2025) {
                window.imperiumHeader2025.addLog(`Proposition de paix envoyée à ${faction}`, 'diplomacy');
            }
        }
        
        return true;
    }
    
    // Navigation
    handleNavigate(params) {
        const { page, section } = params;
        
        let url;
        
        if (section) {
            url = `${section}/${page}.html`;
        } else {
            url = `${page}.html`;
        }
        
        // Vérifier si l'URL est relative au répertoire actuel
        const currentPath = window.location.pathname;
        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
        
        if (currentDir.includes('/')) {
            // Remonter d'un niveau
            url = '../' + url;
        }
        
        window.location.href = url;
        return true;
    }
    
    // Ressources
    handleCollect(params) {
        const { resourceType, amount } = params;
        
        const resources = {};
        resources[resourceType] = amount;
        
        this.addResources(resources);
        
        this.showNotification(`${amount} ${resourceType} collecté`, 'success');
        
        if (window.imperiumHeader2025) {
            window.imperiumHeader2025.addLog(`${amount} ${resourceType} collecté`, 'resource');
        }
        
        return true;
    }
    
    handleProduce(params) {
        const { resources, time } = params;
        
        // Vérifier si les bâtiments nécessaires existent
        if (params.requiredBuilding) {
            const { buildingType, level } = params.requiredBuilding;
            
            if (!this.gameState.buildings[buildingType] || 
                this.gameState.buildings[buildingType].count === 0 ||
                this.gameState.buildings[buildingType].level < level) {
                
                this.showNotification(`${buildingType} de niveau ${level} requis`, 'error');
                return false;
            }
        }
        
        // Vérifier si les ressources requises sont disponibles
        if (params.cost && !this.checkResources(params.cost)) {
            this.showNotification('Ressources insuffisantes pour la production', 'error');
            return false;
        }
        
        // Soustraire les ressources requises
        if (params.cost) {
            this.subtractResources(params.cost);
        }
        
        // Notification
        this.showNotification(`Production commencée`, 'success');
        
        // Simuler le temps de production
        setTimeout(() => {
            // Ajouter les ressources produites
            this.addResources(resources);
            
            this.showNotification(`Production terminée!`, 'success');
            
            if (window.imperiumHeader2025) {
                const resourcesList = Object.entries(resources)
                    .map(([type, amount]) => `${amount} ${type}`)
                    .join(', ');
                
                window.imperiumHeader2025.addLog(`Production terminée: ${resourcesList}`, 'resource');
            }
        }, time || 5000);
        
        return true;
    }
    
    // Interface
    handleToggle(params) {
        const { elementId, className } = params;
        
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Élément avec ID ${elementId} non trouvé`);
            return false;
        }
        
        element.classList.toggle(className || 'active');
        return true;
    }
    
    handleOpen(params) {
        const { elementId } = params;
        
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Élément avec ID ${elementId} non trouvé`);
            return false;
        }
        
        element.style.display = 'block';
        return true;
    }
    
    handleClose(params) {
        const { elementId } = params;
        
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Élément avec ID ${elementId} non trouvé`);
            return false;
        }
        
        element.style.display = 'none';
        return true;
    }
    
    // ===== UTILITAIRES =====
    
    checkResources(cost) {
        if (!cost) return true;
        
        // Obtenir les ressources actuelles
        const currentResources = window.imperiumHeader2025 ? 
            window.imperiumHeader2025.resources : 
            (window.resourceUpdater ? window.resourceUpdater.resources : {});
        
        // Vérifier chaque ressource
        for (const [resourceType, amount] of Object.entries(cost)) {
            if (!currentResources[resourceType] || currentResources[resourceType] < amount) {
                return false;
            }
        }
        
        return true;
    }
    
    addResources(resources) {
        if (!resources) return;
        
        // Mettre à jour les ressources via le header ou le resourceUpdater
        if (window.imperiumHeader2025) {
            for (const [resourceType, amount] of Object.entries(resources)) {
                window.imperiumHeader2025.addResource(resourceType, amount);
            }
        } else if (window.resourceUpdater) {
            for (const [resourceType, amount] of Object.entries(resources)) {
                if (window.resourceUpdater.resources[resourceType] !== undefined) {
                    window.resourceUpdater.resources[resourceType] += amount;
                    
                    // Limiter à la capacité maximale
                    if (window.resourceUpdater.maxResources[resourceType]) {
                        window.resourceUpdater.resources[resourceType] = Math.min(
                            window.resourceUpdater.resources[resourceType],
                            window.resourceUpdater.maxResources[resourceType]
                        );
                    }
                }
            }
            
            window.resourceUpdater.saveToStorage();
        }
        
        // Déclencher un événement pour mettre à jour l'interface
        document.dispatchEvent(new CustomEvent('imperium:resourceUpdate', {
            detail: resources
        }));
    }
    
    subtractResources(cost) {
        if (!cost) return;
        
        // Mettre à jour les ressources via le header ou le resourceUpdater
        if (window.imperiumHeader2025) {
            for (const [resourceType, amount] of Object.entries(cost)) {
                window.imperiumHeader2025.subtractResource(resourceType, amount);
            }
        } else if (window.resourceUpdater) {
            for (const [resourceType, amount] of Object.entries(cost)) {
                if (window.resourceUpdater.resources[resourceType] !== undefined) {
                    window.resourceUpdater.resources[resourceType] = Math.max(
                        0,
                        window.resourceUpdater.resources[resourceType] - amount
                    );
                }
            }
            
            window.resourceUpdater.saveToStorage();
        }
        
        // Déclencher un événement pour mettre à jour l'interface
        document.dispatchEvent(new CustomEvent('imperium:resourceUpdate', {
            detail: cost
        }));
    }
    
    showNotification(message, type = 'info') {
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">${this.getNotificationIcon(type)}</div>
            <div class="notification-content">${message}</div>
        `;
        
        // Ajouter au DOM
        const container = document.querySelector('.notifications-container') || document.body;
        container.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Supprimer après un délai
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
        
        // Ajouter au journal si disponible
        if (window.imperiumHeader2025) {
            window.imperiumHeader2025.addLog(message, type);
        }
    }
    
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'resource': return '📦';
            case 'building': return '🏗️';
            case 'military': return '⚔️';
            case 'research': return '📚';
            case 'diplomacy': return '🤝';
            case 'commerce': return '💰';
            default: return 'ℹ️';
        }
    }
    
    getResourceName(resourceType) {
        const resourceNames = {
            food: 'Nourriture',
            stone: 'Pierre',
            iron: 'Fer',
            gold: 'Or',
            wood: 'Bois',
            population: 'Population',
            research: 'Recherche'
        };
        
        return resourceNames[resourceType] || resourceType;
    }
}

// Initialiser le système d'interactions
document.addEventListener('DOMContentLoaded', function() {
    window.imperiumInteractions = new ImperiumInteractions();
    
    // Ajouter les styles de notification
    const style = document.createElement('style');
    style.textContent = `
        .notifications-container {
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 300px;
        }
        
        .notification {
            background: rgba(0, 0, 0, 0.8);
            border-radius: 8px;
            padding: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .notification-icon {
            font-size: 1.5rem;
        }
        
        .notification-content {
            color: white;
            font-size: 0.9rem;
        }
        
        .notification-success {
            border-left: 4px solid #22c55e;
        }
        
        .notification-error {
            border-left: 4px solid #ef4444;
        }
        
        .notification-warning {
            border-left: 4px solid #f59e0b;
        }
        
        .notification-info {
            border-left: 4px solid #3b82f6;
        }
        
        .notification-resource {
            border-left: 4px solid #8b5cf6;
        }
        
        .notification-building {
            border-left: 4px solid #ec4899;
        }
        
        .notification-military {
            border-left: 4px solid #b91c1c;
        }
        
        .notification-research {
            border-left: 4px solid #0ea5e9;
        }
        
        .notification-diplomacy {
            border-left: 4px solid #10b981;
        }
        
        .notification-commerce {
            border-left: 4px solid #f59e0b;
        }
    `;
    document.head.appendChild(style);
    
    // Créer le conteneur de notifications s'il n'existe pas
    if (!document.querySelector('.notifications-container')) {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
});

// Fonction globale pour gérer les actions
window.handleAction = function(action, params = {}) {
    if (window.imperiumInteractions) {
        return window.imperiumInteractions.handleAction(action, params);
    } else {
        console.warn('Le système d\'interactions n\'est pas initialisé');
        return false;
    }
};