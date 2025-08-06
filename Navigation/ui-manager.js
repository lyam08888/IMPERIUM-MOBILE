/**
 * 🏛️ IMPERIUM - Gestionnaire d'Interface Utilisateur
 * Interface complète pour le moteur de jeu
 */

class ImperiumUIManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentView = 'city';
        this.notifications = [];
        this.modals = {};
        this.timers = {};
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupNotificationSystem();
        this.setupModals();
        this.startUIUpdates();
        
        // Écouter les événements du moteur de jeu
        this.gameEngine.on('gameInitialized', (data) => this.onGameInitialized(data));
        this.gameEngine.on('gameUpdated', (data) => this.onGameUpdated(data));
        this.gameEngine.on('buildingStarted', (data) => this.onBuildingStarted(data));
        this.gameEngine.on('buildingCompleted', (data) => this.onBuildingCompleted(data));
        this.gameEngine.on('researchStarted', (data) => this.onResearchStarted(data));
        this.gameEngine.on('researchCompleted', (data) => this.onResearchCompleted(data));
        this.gameEngine.on('recruitmentStarted', (data) => this.onRecruitmentStarted(data));
        this.gameEngine.on('recruitmentCompleted', (data) => this.onRecruitmentCompleted(data));
        this.gameEngine.on('gameSaved', (data) => this.onGameSaved(data));
        this.gameEngine.on('gameLoaded', (data) => this.onGameLoaded(data));
    }
    
    // ===== GESTION DES ÉVÉNEMENTS =====
    bindEvents() {
        // Boutons de sauvegarde/chargement
        document.addEventListener('click', (e) => {
            if (e.target.id === 'save-btn') {
                this.saveGame();
            } else if (e.target.id === 'load-btn') {
                this.loadGame();
            }
        });
        
        // Gestion des clics sur les bâtiments
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('building-slot')) {
                this.handleBuildingClick(e.target);
            }
        });
        
        // Gestion des clics sur les technologies
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tech-item')) {
                this.handleTechClick(e.target);
            }
        });
        
        // Gestion des clics sur les unités
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('unit-recruit-btn')) {
                this.handleUnitRecruitment(e.target);
            }
        });
        
        // Fermeture des modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            } else if (e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
        });
    }
    
    // ===== MISE À JOUR DE L'INTERFACE =====
    startUIUpdates() {
        setInterval(() => {
            this.updateResourcesDisplay();
            this.updatePlayerInfo();
            this.updateTimers();
            this.updateQueues();
        }, 1000);
    }
    
    updateResourcesDisplay() {
        const resources = this.gameEngine.getResources();
        const resourcesDisplay = document.getElementById('resources-display');
        
        if (resourcesDisplay) {
            resourcesDisplay.innerHTML = Object.keys(resources).map(resource => {
                const config = RESOURCES_CONFIG[resource];
                const amount = Math.floor(resources[resource]);
                return `
                    <div class="resource-item" title="${config.description}">
                        <span class="resource-icon">${config.icon}</span>
                        <span class="resource-amount">${this.formatNumber(amount)}</span>
                    </div>
                `;
            }).join('');
        }
    }
    
    updatePlayerInfo() {
        const gameState = this.gameEngine.getGameState();
        const player = gameState.player;
        
        // Nom du joueur
        const playerNameEl = document.getElementById('player-name');
        if (playerNameEl) {
            playerNameEl.textContent = player.name;
        }
        
        // Titre et niveau
        const playerTitleEl = document.getElementById('player-title-level');
        if (playerTitleEl) {
            playerTitleEl.textContent = `${player.title} - Niveau ${player.level}`;
        }
        
        // Avatar
        const playerAvatarEl = document.getElementById('player-avatar');
        if (playerAvatarEl) {
            playerAvatarEl.textContent = player.name.charAt(0);
        }
    }
    
    updateTimers() {
        const gameState = this.gameEngine.getGameState();
        
        // Mettre à jour les timers de construction
        Object.keys(gameState.cities).forEach(cityId => {
            const city = gameState.cities[cityId];
            if (city.buildingQueue) {
                this.updateBuildingQueue(cityId, city.buildingQueue);
            }
            if (city.recruitmentQueue) {
                this.updateRecruitmentQueue(cityId, city.recruitmentQueue);
            }
        });
        
        // Mettre à jour les timers de recherche
        if (gameState.researchQueue) {
            this.updateResearchQueue(gameState.researchQueue);
        }
    }
    
    updateBuildingQueue(cityId, queue) {
        const container = document.getElementById(`building-queue-${cityId}`);
        if (!container) return;
        
        if (queue.length === 0) {
            container.innerHTML = '<p class="queue-empty">Aucune construction en cours</p>';
            return;
        }
        
        container.innerHTML = queue.map(building => {
            const progress = this.calculateProgress(building.startTime, building.endTime);
            const remaining = this.formatTime((building.endTime - Date.now()) / 1000);
            
            return `
                <div class="queue-item">
                    <div class="queue-icon">${BUILDINGS_CONFIG[building.type].icon}</div>
                    <div class="queue-info">
                        <div class="queue-name">${BUILDINGS_CONFIG[building.type].name} Niv. ${building.level}</div>
                        <div class="timer-progress">
                            <div class="timer-progress-bar" style="width: ${progress}%"></div>
                        </div>
                        <div class="timer-remaining">${remaining}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateRecruitmentQueue(cityId, queue) {
        const container = document.getElementById(`recruitment-queue-${cityId}`);
        if (!container) return;
        
        if (queue.length === 0) {
            container.innerHTML = '<p class="queue-empty">Aucun recrutement en cours</p>';
            return;
        }
        
        container.innerHTML = queue.map(recruitment => {
            const progress = this.calculateProgress(recruitment.startTime, recruitment.endTime);
            const remaining = this.formatTime((recruitment.endTime - Date.now()) / 1000);
            
            return `
                <div class="queue-item">
                    <div class="queue-icon">${UNITS_CONFIG[recruitment.unitType].icon}</div>
                    <div class="queue-info">
                        <div class="queue-name">${recruitment.quantity}x ${UNITS_CONFIG[recruitment.unitType].name}</div>
                        <div class="timer-progress">
                            <div class="timer-progress-bar" style="width: ${progress}%"></div>
                        </div>
                        <div class="timer-remaining">${remaining}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateResearchQueue(queue) {
        const container = document.getElementById('research-queue');
        if (!container) return;
        
        if (queue.length === 0) {
            container.innerHTML = '<p class="queue-empty">Aucune recherche en cours</p>';
            return;
        }
        
        container.innerHTML = queue.map(research => {
            const progress = this.calculateProgress(research.startTime, research.endTime);
            const remaining = this.formatTime((research.endTime - Date.now()) / 1000);
            
            return `
                <div class="queue-item">
                    <div class="queue-icon">📚</div>
                    <div class="queue-info">
                        <div class="queue-name">${research.name}</div>
                        <div class="timer-progress">
                            <div class="timer-progress-bar" style="width: ${progress}%"></div>
                        </div>
                        <div class="timer-remaining">${remaining}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateQueues() {
        const gameState = this.gameEngine.getGameState();
        
        // Afficher les files d'attente dans l'interface
        Object.keys(gameState.cities).forEach(cityId => {
            const city = gameState.cities[cityId];
            
            // File de construction
            if (city.buildingQueue && city.buildingQueue.length > 0) {
                this.updateBuildingQueue(cityId, city.buildingQueue);
            }
            
            // File de recrutement
            if (city.recruitmentQueue && city.recruitmentQueue.length > 0) {
                this.updateRecruitmentQueue(cityId, city.recruitmentQueue);
            }
        });
        
        // File de recherche
        if (gameState.researchQueue && gameState.researchQueue.length > 0) {
            this.updateResearchQueue(gameState.researchQueue);
        }
    }
    
    // ===== GESTION DES BÂTIMENTS =====
    handleBuildingClick(element) {
        const buildingType = element.dataset.building;
        const x = parseInt(element.dataset.x);
        const y = parseInt(element.dataset.y);
        
        if (buildingType) {
            // Améliorer un bâtiment existant
            this.showBuildingUpgradeModal(buildingType, x, y);
        } else {
            // Construire un nouveau bâtiment
            this.showBuildingSelectionModal(x, y);
        }
    }
    
    showBuildingSelectionModal(x, y) {
        const availableBuildings = this.getAvailableBuildings();
        
        const modalContent = `
            <h3 class="modal-title">Choisir un Bâtiment</h3>
            <div class="modal-body">
                <div class="building-selection-grid">
                    ${availableBuildings.map(building => `
                        <div class="building-option" data-building="${building.type}">
                            <div class="building-icon">${building.config.icon}</div>
                            <div class="building-name">${building.config.name}</div>
                            <div class="building-cost">
                                ${Object.keys(building.cost).map(resource => 
                                    `<span class="cost-item">${RESOURCES_CONFIG[resource].icon} ${building.cost[resource]}</span>`
                                ).join(' ')}
                            </div>
                            <div class="building-time">⏱️ ${this.formatTime(building.buildTime)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn secondary modal-close">Annuler</button>
            </div>
        `;
        
        this.showModal(modalContent);
        
        // Gérer la sélection
        document.querySelectorAll('.building-option').forEach(option => {
            option.addEventListener('click', () => {
                const buildingType = option.dataset.building;
                this.buildBuilding(buildingType, x, y);
                this.closeModal();
            });
        });
    }
    
    showBuildingUpgradeModal(buildingType, x, y) {
        const gameState = this.gameEngine.getGameState();
        const city = gameState.cities.main;
        const building = city.buildings[buildingType];
        const config = BUILDINGS_CONFIG[buildingType];
        
        const nextLevel = building.level + 1;
        const cost = config.costs(nextLevel);
        const buildTime = config.buildTime(nextLevel);
        const canAfford = this.gameEngine.canAfford(cost);
        const canUpgrade = nextLevel <= config.maxLevel;
        
        const modalContent = `
            <h3 class="modal-title">Améliorer ${config.name}</h3>
            <div class="modal-body">
                <div class="building-upgrade-info">
                    <div class="current-level">Niveau actuel: ${building.level}</div>
                    <div class="next-level">Niveau suivant: ${nextLevel}</div>
                    
                    ${canUpgrade ? `
                        <div class="upgrade-cost">
                            <h4>Coût:</h4>
                            ${Object.keys(cost).map(resource => 
                                `<span class="cost-item ${canAfford ? '' : 'insufficient'}">${RESOURCES_CONFIG[resource].icon} ${cost[resource]}</span>`
                            ).join(' ')}
                        </div>
                        <div class="upgrade-time">⏱️ Temps: ${this.formatTime(buildTime)}</div>
                        
                        <div class="upgrade-effects">
                            <h4>Effets:</h4>
                            <p>${config.description}</p>
                        </div>
                    ` : `
                        <p class="max-level">Bâtiment au niveau maximum!</p>
                    `}
                </div>
            </div>
            <div class="modal-actions">
                ${canUpgrade && canAfford ? 
                    `<button class="modal-btn primary" id="confirm-upgrade">Améliorer</button>` : 
                    ''
                }
                <button class="modal-btn secondary modal-close">Fermer</button>
            </div>
        `;
        
        this.showModal(modalContent);
        
        // Gérer la confirmation
        const confirmBtn = document.getElementById('confirm-upgrade');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.buildBuilding(buildingType, x, y);
                this.closeModal();
            });
        }
    }
    
    buildBuilding(buildingType, x, y) {
        try {
            this.gameEngine.buildBuilding('main', buildingType, x, y);
        } catch (error) {
            this.showNotification('Erreur', error.message, 'error');
        }
    }
    
    getAvailableBuildings() {
        const gameState = this.gameEngine.getGameState();
        const city = gameState.cities.main;
        const available = [];
        
        Object.keys(BUILDINGS_CONFIG).forEach(buildingType => {
            const config = BUILDINGS_CONFIG[buildingType];
            const currentBuilding = city.buildings[buildingType];
            const level = currentBuilding ? currentBuilding.level + 1 : 1;
            
            if (level <= config.maxLevel) {
                const requirements = config.requirements(level);
                if (this.gameEngine.checkRequirements('main', requirements)) {
                    available.push({
                        type: buildingType,
                        config: config,
                        cost: config.costs(level),
                        buildTime: config.buildTime(level)
                    });
                }
            }
        });
        
        return available;
    }
    
    // ===== GESTION DES TECHNOLOGIES =====
    handleTechClick(element) {
        const techBranch = element.dataset.branch;
        const techId = element.dataset.tech;
        
        if (element.classList.contains('locked') || element.classList.contains('researched')) {
            return;
        }
        
        this.showTechResearchModal(techBranch, techId);
    }
    
    showTechResearchModal(techBranch, techId) {
        const tech = TECH_TREE[techBranch].techs[techId];
        const canAfford = this.gameEngine.canAfford(tech.cost);
        
        const modalContent = `
            <h3 class="modal-title">Rechercher ${tech.name}</h3>
            <div class="modal-body">
                <div class="tech-research-info">
                    <p class="tech-description">${tech.description}</p>
                    
                    <div class="research-cost">
                        <h4>Coût:</h4>
                        ${Object.keys(tech.cost).map(resource => 
                            `<span class="cost-item ${canAfford ? '' : 'insufficient'}">${RESOURCES_CONFIG[resource].icon} ${tech.cost[resource]}</span>`
                        ).join(' ')}
                    </div>
                    
                    <div class="research-time">
                        ⏱️ Temps estimé: ${this.formatTime(tech.cost.research * 10 / this.gameEngine.calculateResearchSpeed())}
                    </div>
                    
                    <div class="research-effects">
                        <h4>Effets:</h4>
                        <ul>
                            ${Object.keys(tech.effects).map(effect => 
                                `<li>${this.formatTechEffect(effect, tech.effects[effect])}</li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                ${canAfford ? 
                    `<button class="modal-btn primary" id="confirm-research">Rechercher</button>` : 
                    ''
                }
                <button class="modal-btn secondary modal-close">Fermer</button>
            </div>
        `;
        
        this.showModal(modalContent);
        
        // Gérer la confirmation
        const confirmBtn = document.getElementById('confirm-research');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.startResearch(techBranch, techId);
                this.closeModal();
            });
        }
    }
    
    startResearch(techBranch, techId) {
        try {
            this.gameEngine.startResearch(techBranch, techId);
        } catch (error) {
            this.showNotification('Erreur', error.message, 'error');
        }
    }
    
    formatTechEffect(effect, value) {
        const effects = {
            populationGrowth: `+${(value * 100)}% croissance de population`,
            happiness: `+${value} bonheur`,
            stoneCostReduction: `-${(value * 100)}% coût en pierre`,
            buildingQueues: `+${value} file de construction`,
            unitsUnlocked: `Débloque: ${value.join(', ')}`,
            defenseBonus: `+${(value * 100)}% défense`,
            attackBonus: `+${(value * 100)}% attaque`,
            tradeRoutes: `+${value} route commerciale`,
            tradeBonus: `+${(value * 100)}% revenus commerciaux`,
            goldProductionBonus: `+${(value * 100)}% production d'or`,
            navalSpeedBonus: `-${(value * 100)}% temps de trajet naval`,
            espionageEnabled: 'Débloque l\'espionnage',
            allianceBonusIncrease: `+${(value * 100)}% bonus d'alliance`,
            corruptionReduction: `-${(value * 100)}% corruption`
        };
        
        return effects[effect] || `${effect}: ${value}`;
    }
    
    // ===== GESTION DU RECRUTEMENT =====
    handleUnitRecruitment(element) {
        const unitType = element.dataset.unit;
        const quantity = parseInt(element.parentElement.querySelector('.unit-quantity').value) || 1;
        
        this.recruitUnit(unitType, quantity);
    }
    
    recruitUnit(unitType, quantity) {
        try {
            this.gameEngine.recruitUnit('main', unitType, quantity);
            this.showNotification('Recrutement', `${quantity}x ${UNITS_CONFIG[unitType].name} en formation`, 'success');
        } catch (error) {
            this.showNotification('Erreur', error.message, 'error');
        }
    }
    
    // ===== SYSTÈME DE NOTIFICATIONS =====
    setupNotificationSystem() {
        // Créer le conteneur de notifications s'il n'existe pas
        if (!document.getElementById('notifications-container')) {
            const container = document.createElement('div');
            container.id = 'notifications-container';
            container.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 1001;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
    }
    
    showNotification(title, message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now(),
            title,
            message,
            type,
            timestamp: new Date()
        };
        
        this.notifications.push(notification);
        this.renderNotification(notification);
        
        // Auto-suppression
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);
    }
    
    renderNotification(notification) {
        const container = document.getElementById('notifications-container');
        const element = document.createElement('div');
        element.className = `notification ${notification.type}`;
        element.id = `notification-${notification.id}`;
        
        element.innerHTML = `
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">${notification.timestamp.toLocaleTimeString()}</div>
        `;
        
        container.appendChild(element);
        
        // Animation d'entrée
        setTimeout(() => {
            element.style.transform = 'translateX(0)';
        }, 10);
    }
    
    removeNotification(id) {
        const element = document.getElementById(`notification-${id}`);
        if (element) {
            element.style.transform = 'translateX(100%)';
            setTimeout(() => {
                element.remove();
            }, 300);
        }
        
        this.notifications = this.notifications.filter(n => n.id !== id);
    }
    
    // ===== SYSTÈME DE MODALES =====
    setupModals() {
        // Créer l'overlay de modale s'il n'existe pas
        if (!document.getElementById('modal-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'modal-overlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }
    }
    
    showModal(content) {
        const overlay = document.getElementById('modal-overlay');
        overlay.innerHTML = `<div class="modal-content">${content}</div>`;
        overlay.classList.add('active');
    }
    
    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.innerHTML = '';
        }, 300);
    }
    
    // ===== SAUVEGARDE ET CHARGEMENT =====
    saveGame() {
        const success = this.gameEngine.saveGame();
        if (success) {
            this.showNotification('Sauvegarde', 'Jeu sauvegardé avec succès', 'success');
        } else {
            this.showNotification('Erreur', 'Échec de la sauvegarde', 'error');
        }
    }
    
    loadGame() {
        const success = this.gameEngine.loadGame();
        if (success) {
            this.showNotification('Chargement', 'Jeu chargé avec succès', 'success');
            this.refreshUI();
        } else {
            this.showNotification('Information', 'Aucune sauvegarde trouvée', 'info');
        }
    }
    
    refreshUI() {
        this.updateResourcesDisplay();
        this.updatePlayerInfo();
        this.updateQueues();
    }
    
    // ===== ÉVÉNEMENTS DU MOTEUR DE JEU =====
    onGameInitialized(data) {
        this.showNotification('IMPERIUM', 'Jeu initialisé avec succès', 'success');
        this.refreshUI();
    }
    
    onGameUpdated(data) {
        // Mise à jour silencieuse
    }
    
    onBuildingStarted(data) {
        const config = BUILDINGS_CONFIG[data.buildingType];
        this.showNotification(
            'Construction', 
            `${config.name} niveau ${data.level} en construction`, 
            'info'
        );
    }
    
    onBuildingCompleted(data) {
        const config = BUILDINGS_CONFIG[data.building.type];
        this.showNotification(
            'Construction terminée', 
            `${config.name} niveau ${data.building.level} terminé!`, 
            'success'
        );
    }
    
    onResearchStarted(data) {
        const tech = TECH_TREE[data.techBranch].techs[data.techId];
        this.showNotification(
            'Recherche', 
            `Recherche de ${tech.name} commencée`, 
            'info'
        );
    }
    
    onResearchCompleted(data) {
        this.showNotification(
            'Recherche terminée', 
            `${data.name} recherché avec succès!`, 
            'success'
        );
    }
    
    onRecruitmentStarted(data) {
        const unit = UNITS_CONFIG[data.unitType];
        this.showNotification(
            'Recrutement', 
            `${data.quantity}x ${unit.name} en formation`, 
            'info'
        );
    }
    
    onRecruitmentCompleted(data) {
        const unit = UNITS_CONFIG[data.recruitment.unitType];
        this.showNotification(
            'Recrutement terminé', 
            `${data.recruitment.quantity}x ${unit.name} prêts au combat!`, 
            'success'
        );
    }
    
    onGameSaved(data) {
        // Notification déjà gérée dans saveGame()
    }
    
    onGameLoaded(data) {
        // Notification déjà gérée dans loadGame()
    }
    
    // ===== UTILITAIRES =====
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    formatTime(seconds) {
        if (seconds < 60) {
            return `${Math.floor(seconds)}s`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}m ${secs}s`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
    }
    
    calculateProgress(startTime, endTime) {
        const now = Date.now();
        const total = endTime - startTime;
        const elapsed = now - startTime;
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
    }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImperiumUIManager;
}