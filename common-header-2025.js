/**
 * 🏛️ IMPERIUM - Système de Header Commun 2025
 * Gestion centralisée de la barre du haut avec ressources et logs
 * Version moderne pour les jeux de 2025
 */

class ImperiumHeader2025 {
    constructor() {
        this.resources = {
            food: 4560,
            stone: 2340,
            iron: 8900,
            gold: 15200,
            wood: 3200,
            population: 1250,
            research: 67
        };
        
        this.maxResources = {
            food: 5000,
            stone: 3000,
            iron: 10000,
            gold: 20000,
            wood: 4000,
            population: 1500,
            research: 100
        };
        
        this.productionRates = {
            food: 10,
            stone: 5,
            iron: 8,
            gold: 15,
            wood: 7,
            research: 1
        };
        
        this.logs = [];
        this.maxLogs = 50;
        this.logPopupOpen = false;
        this.notificationsEnabled = true;
        
        this.init();
    }
    
    init() {
        this.createHeaderHTML();
        this.bindEvents();
        this.startResourceUpdates();
        this.loadFromStorage();
        this.createParticles();
    }
    
    createHeaderHTML() {
        // Vérifier si le header existe déjà
        let header = document.querySelector('.imperium-header-2025');
        if (header) return;
        
        // Créer le header
        header = document.createElement('header');
        header.className = 'imperium-header-2025';
        
        // Insérer au début du body ou avant le premier élément
        const firstElement = document.body.firstChild;
        if (firstElement) {
            document.body.insertBefore(header, firstElement);
        } else {
            document.body.appendChild(header);
        }
        
        header.innerHTML = `
            <div class="header-content-2025">
                <h1 class="imperium-logo-2025" id="imperium-logo">IMPERIUM</h1>
                
                <!-- Affichage des ressources -->
                <div id="resources-display-2025" class="resources-display-2025">
                    ${this.generateResourcesHTML()}
                </div>
                
                <!-- Informations du joueur et boutons -->
                <div class="player-info-2025">
                    <!-- Bouton de logs -->
                    <button class="player-avatar-2025" id="log-button-2025" title="Journal des événements">
                        <span>📜</span>
                        <span class="notification-badge-2025" id="log-count-2025" style="display: none;">0</span>
                    </button>
                    
                    <!-- Avatar et infos joueur -->
                    <div class="player-details-2025">
                        <div class="player-name-2025" id="player-name-2025">Marcus Aurelius</div>
                        <div class="player-level-2025" id="player-level-2025">Consul - Niv. 12</div>
                    </div>
                    
                    <!-- Bouton menu mobile -->
                    <button class="menu-button-2025" id="menu-button-2025">
                        <span>≡</span>
                    </button>
                </div>
            </div>
            
            <!-- Popup des logs -->
            <div class="glass-panel" id="log-popup-2025" style="display: none; position: absolute; top: 60px; right: 20px; width: 350px; max-height: 500px; z-index: 1001; padding: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0; color: var(--gold-primary);">📜 Journal des Événements</h3>
                    <button class="button-2025" id="log-popup-close-2025" style="padding: 5px 10px;">✕</button>
                </div>
                <div id="log-popup-content-2025" style="max-height: 350px; overflow-y: auto; margin-bottom: 1rem;">
                    <!-- Les logs seront injectés ici -->
                </div>
                <button class="button-2025" id="log-clear-btn-2025" style="width: 100%;">Effacer tout</button>
            </div>
        `;
        
        // Créer le conteneur de particules s'il n'existe pas
        if (!document.querySelector('.particles-2025')) {
            const particles = document.createElement('div');
            particles.className = 'particles-2025';
            document.body.appendChild(particles);
        }
    }
    
    generateResourcesHTML() {
        const resourceIcons = {
            food: '🍇',
            stone: '🏛️',
            iron: '⚔️',
            gold: '💰',
            wood: '🌲',
            population: '👥',
            research: '📚'
        };
        
        const resourceNames = {
            food: 'Nourriture',
            stone: 'Pierre',
            iron: 'Fer',
            gold: 'Or',
            wood: 'Bois',
            population: 'Population',
            research: 'Recherche'
        };
        
        return Object.keys(this.resources).map(type => {
            const isNearMax = this.resources[type] >= this.maxResources[type] * 0.9;
            const isFull = this.resources[type] >= this.maxResources[type];
            
            return `
                <div class="resource-item-2025" title="${resourceNames[type]}: ${this.formatNumber(this.resources[type])}/${this.formatNumber(this.maxResources[type])}">
                    <span class="resource-icon-2025">${resourceIcons[type]}</span>
                    <span class="resource-value-2025 ${isNearMax ? 'near-max' : ''} ${isFull ? 'full' : ''}" id="resource-${type}-2025">
                        ${this.formatNumber(this.resources[type])}
                    </span>
                    ${isFull ? '<span style="color: var(--error-red); font-size: 0.7rem;">MAX</span>' : ''}
                </div>
            `;
        }).join('');
    }
    
    bindEvents() {
        // Logo - retour à l'accueil
        const logo = document.getElementById('imperium-logo');
        if (logo) {
            logo.addEventListener('click', () => this.navigateToHome());
        }
        
        // Bouton de logs
        const logButton = document.getElementById('log-button-2025');
        const logPopup = document.getElementById('log-popup-2025');
        const logPopupClose = document.getElementById('log-popup-close-2025');
        const logClearBtn = document.getElementById('log-clear-btn-2025');
        
        if (logButton) {
            logButton.addEventListener('click', () => this.toggleLogPopup());
        }
        
        if (logPopupClose) {
            logPopupClose.addEventListener('click', () => this.closeLogPopup());
        }
        
        if (logClearBtn) {
            logClearBtn.addEventListener('click', () => this.clearLogs());
        }
        
        // Fermer le popup en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (this.logPopupOpen && 
                logPopup && !logPopup.contains(e.target) && 
                logButton && !logButton.contains(e.target)) {
                this.closeLogPopup();
            }
        });
        
        // Échapper pour fermer le popup
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.logPopupOpen) {
                this.closeLogPopup();
            }
        });
        
        // Bouton menu mobile
        const menuButton = document.getElementById('menu-button-2025');
        if (menuButton) {
            menuButton.addEventListener('click', () => this.toggleMobileMenu());
        }
    }
    
    // ===== NAVIGATION =====
    navigateToHome() {
        const currentPath = window.location.pathname;
        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
        
        if (currentDir.includes('/')) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
    }
    
    toggleMobileMenu() {
        // Implémenter l'ouverture/fermeture du menu mobile
        const sidebar = document.querySelector('.imperium-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
        }
    }
    
    // ===== GESTION DES RESSOURCES =====
    updateResources(newResources) {
        Object.assign(this.resources, newResources);
        this.refreshResourcesDisplay();
        this.saveToStorage();
    }
    
    addResource(resourceType, amount) {
        if (this.resources.hasOwnProperty(resourceType)) {
            const newAmount = Math.min(
                this.resources[resourceType] + amount,
                this.maxResources[resourceType]
            );
            const actualAdded = newAmount - this.resources[resourceType];
            
            this.resources[resourceType] = newAmount;
            this.refreshResourcesDisplay();
            
            if (actualAdded > 0) {
                this.addLog(`+${actualAdded} ${this.getResourceName(resourceType)}`, 'resource');
            }
            
            this.saveToStorage();
            return actualAdded;
        }
        return 0;
    }
    
    subtractResource(resourceType, amount) {
        if (this.resources.hasOwnProperty(resourceType)) {
            const oldValue = this.resources[resourceType];
            this.resources[resourceType] = Math.max(0, this.resources[resourceType] - amount);
            const actualSubtracted = oldValue - this.resources[resourceType];
            
            this.refreshResourcesDisplay();
            
            if (actualSubtracted > 0) {
                this.addLog(`-${actualSubtracted} ${this.getResourceName(resourceType)}`, 'resource');
            }
            
            this.saveToStorage();
            return actualSubtracted;
        }
        return 0;
    }
    
    refreshResourcesDisplay() {
        const container = document.getElementById('resources-display-2025');
        if (container) {
            container.innerHTML = this.generateResourcesHTML();
        }
        
        // Animation pour les valeurs qui ont changé
        Object.keys(this.resources).forEach(resourceType => {
            const element = document.getElementById(`resource-${resourceType}-2025`);
            if (element) {
                element.classList.add('resource-updated');
                setTimeout(() => element.classList.remove('resource-updated'), 1000);
            }
        });
    }
    
    startResourceUpdates() {
        // Production de ressources en temps réel
        setInterval(() => {
            let updated = false;
            
            Object.keys(this.productionRates).forEach(resourceType => {
                if (this.resources[resourceType] < this.maxResources[resourceType]) {
                    const rate = this.productionRates[resourceType];
                    const randomVariation = Math.random() * 0.4 + 0.8; // 80% à 120% du taux
                    const amount = Math.floor(rate * randomVariation);
                    
                    if (amount > 0) {
                        this.resources[resourceType] = Math.min(
                            this.resources[resourceType] + amount,
                            this.maxResources[resourceType]
                        );
                        updated = true;
                    }
                }
            });
            
            if (updated) {
                this.refreshResourcesDisplay();
                this.saveToStorage();
            }
        }, 30000); // Toutes les 30 secondes
    }
    
    // ===== GESTION DES LOGS =====
    addLog(message, type = 'info', timestamp = null) {
        const log = {
            id: Date.now() + Math.random(),
            message: message,
            type: type, // 'info', 'success', 'warning', 'error', 'resource', 'building', 'military'
            timestamp: timestamp || new Date(),
            read: false
        };
        
        this.logs.unshift(log);
        
        // Limiter le nombre de logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }
        
        this.updateLogCount();
        this.saveToStorage();
        
        // Notification visuelle
        if (this.notificationsEnabled) {
            this.showLogNotification(message, type);
        }
    }
    
    toggleLogPopup() {
        if (this.logPopupOpen) {
            this.closeLogPopup();
        } else {
            this.openLogPopup();
        }
    }
    
    openLogPopup() {
        const popup = document.getElementById('log-popup-2025');
        if (popup) {
            popup.style.display = 'block';
            this.logPopupOpen = true;
            this.refreshLogPopupContent();
            
            // Marquer tous les logs comme lus
            this.logs.forEach(log => log.read = true);
            this.updateLogCount();
            this.saveToStorage();
        }
    }
    
    closeLogPopup() {
        const popup = document.getElementById('log-popup-2025');
        if (popup) {
            popup.style.display = 'none';
            this.logPopupOpen = false;
        }
    }
    
    refreshLogPopupContent() {
        const content = document.getElementById('log-popup-content-2025');
        if (!content) return;
        
        if (this.logs.length === 0) {
            content.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted); font-style: italic;">Aucun événement récent</div>';
            return;
        }
        
        content.innerHTML = this.logs.map(log => `
            <div style="padding: 0.75rem; margin-bottom: 0.5rem; border-radius: var(--border-radius-sm); background: rgba(255,255,255,0.05); border-left: 3px solid ${this.getLogColor(log.type)}; ${!log.read ? 'background: rgba(255,215,0,0.1);' : ''}">
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem;">${this.formatLogTime(log.timestamp)}</div>
                <div style="color: var(--text-light);">${this.getLogIcon(log.type)} ${log.message}</div>
            </div>
        `).join('');
    }
    
    clearLogs() {
        if (confirm('Êtes-vous sûr de vouloir effacer tous les logs ?')) {
            this.logs = [];
            this.updateLogCount();
            this.refreshLogPopupContent();
            this.saveToStorage();
        }
    }
    
    updateLogCount() {
        const countElement = document.getElementById('log-count-2025');
        if (!countElement) return;
        
        const unreadCount = this.logs.filter(log => !log.read).length;
        
        countElement.textContent = unreadCount;
        countElement.style.display = unreadCount > 0 ? 'flex' : 'none';
        
        // Mettre à jour l'apparence du bouton
        const logButton = document.getElementById('log-button-2025');
        if (logButton) {
            logButton.classList.toggle('gold-glow', unreadCount > 0);
        }
    }
    
    showLogNotification(message, type) {
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = 'glass-panel';
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 1rem;
            z-index: 2000;
            max-width: 300px;
            border-left: 4px solid ${this.getLogColor(type)};
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                <span style="font-size: 1.2rem;">${this.getLogIcon(type)}</span>
                <div>
                    <div style="font-weight: bold; margin-bottom: 0.25rem; color: var(--gold-light);">${this.getLogTitle(type)}</div>
                    <div style="color: var(--text-light);">${message}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);
        
        // Suppression automatique
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    // ===== PARTICULES =====
    createParticles() {
        const container = document.querySelector('.particles-2025');
        if (!container) return;
        
        // Vider le conteneur
        container.innerHTML = '';
        
        // Créer les particules
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle-2025';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
            container.appendChild(particle);
        }
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
    
    formatLogTime(timestamp) {
        const now = new Date();
        const diff = now - new Date(timestamp);
        
        if (diff < 60000) { // Moins d'1 minute
            return 'À l\'instant';
        } else if (diff < 3600000) { // Moins d'1 heure
            return Math.floor(diff / 60000) + ' min';
        } else if (diff < 86400000) { // Moins d'1 jour
            return Math.floor(diff / 3600000) + ' h';
        } else {
            return new Date(timestamp).toLocaleDateString();
        }
    }
    
    getResourceName(resourceType) {
        const names = {
            food: 'Nourriture',
            stone: 'Pierre',
            iron: 'Fer',
            gold: 'Or',
            wood: 'Bois',
            population: 'Population',
            research: 'Recherche'
        };
        return names[resourceType] || resourceType;
    }
    
    getLogIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            resource: '📦',
            building: '🏗️',
            military: '⚔️',
            research: '📚',
            quest: '📜'
        };
        return icons[type] || 'ℹ️';
    }
    
    getLogTitle(type) {
        const titles = {
            info: 'Information',
            success: 'Succès',
            warning: 'Attention',
            error: 'Erreur',
            resource: 'Ressources',
            building: 'Construction',
            military: 'Militaire',
            research: 'Recherche',
            quest: 'Quête'
        };
        return titles[type] || 'Information';
    }
    
    getLogColor(type) {
        const colors = {
            info: '#1976D2',
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336',
            resource: '#9C27B0',
            building: '#FF5722',
            military: '#D32F2F',
            research: '#2196F3',
            quest: '#FFC107'
        };
        return colors[type] || '#1976D2';
    }
    
    // ===== SAUVEGARDE/CHARGEMENT =====
    saveToStorage() {
        try {
            localStorage.setItem('imperium_resources_2025', JSON.stringify(this.resources));
            localStorage.setItem('imperium_logs_2025', JSON.stringify(this.logs));
        } catch (e) {
            console.warn('Impossible de sauvegarder les données:', e);
        }
    }
    
    loadFromStorage() {
        try {
            // Charger les ressources
            const savedResources = localStorage.getItem('imperium_resources_2025');
            if (savedResources) {
                this.resources = {...this.resources, ...JSON.parse(savedResources)};
            }
            
            // Charger les logs
            const savedLogs = localStorage.getItem('imperium_logs_2025');
            if (savedLogs) {
                this.logs = JSON.parse(savedLogs);
            }
            
            this.refreshResourcesDisplay();
            this.updateLogCount();
        } catch (e) {
            console.warn('Impossible de charger les données:', e);
        }
    }
    
    // ===== API PUBLIQUE =====
    static getInstance() {
        if (!window.imperiumHeader2025) {
            window.imperiumHeader2025 = new ImperiumHeader2025();
        }
        return window.imperiumHeader2025;
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', function() {
    // Attendre un peu pour que les autres scripts se chargent
    setTimeout(() => {
        window.imperiumHeader2025 = ImperiumHeader2025.getInstance();
        
        // Ajouter quelques logs d'exemple au premier chargement
        if (window.imperiumHeader2025.logs.length === 0) {
            window.imperiumHeader2025.addLog('Bienvenue dans IMPERIUM 2025 !', 'success');
            window.imperiumHeader2025.addLog('Votre cité produit des ressources', 'info');
            window.imperiumHeader2025.addLog('Construction du Forum terminée', 'building');
        }
    }, 500);
});

// Fonctions utilitaires globales
window.addImperiumLog = function(message, type = 'info') {
    if (window.imperiumHeader2025) {
        window.imperiumHeader2025.addLog(message, type);
    }
};

window.updateImperiumResources = function(resources) {
    if (window.imperiumHeader2025) {
        window.imperiumHeader2025.updateResources(resources);
    }
};

window.addImperiumResource = function(resourceType, amount) {
    if (window.imperiumHeader2025) {
        return window.imperiumHeader2025.addResource(resourceType, amount);
    }
    return 0;
};

window.subtractImperiumResource = function(resourceType, amount) {
    if (window.imperiumHeader2025) {
        return window.imperiumHeader2025.subtractResource(resourceType, amount);
    }
    return 0;
};

window.getImperiumResources = function() {
    if (window.imperiumHeader2025) {
        return {...window.imperiumHeader2025.resources};
    }
    return {};
};

window.getImperiumResourceMax = function(resourceType) {
    if (window.imperiumHeader2025 && window.imperiumHeader2025.maxResources[resourceType]) {
        return window.imperiumHeader2025.maxResources[resourceType];
    }
    return 0;
};