/**
 * 🏛️ IMPERIUM - Système de Header Commun
 * Gestion centralisée de la barre du haut avec ressources et logs
 */

class ImperiumCommonHeader {
    constructor() {
        this.resources = {
            food: 4560,
            stone: 2340,
            iron: 8900,
            gold: 15200,
            wood: 3200,
            population: 1250
        };
        
        this.logs = [];
        this.maxLogs = 50;
        this.logPopupOpen = false;
        
        this.init();
    }
    
    init() {
        this.createHeaderHTML();
        this.bindEvents();
        this.startResourceUpdates();
        this.loadLogs();
    }
    
    createHeaderHTML() {
        // Vérifier si le header existe déjà
        let header = document.querySelector('.imperium-header');
        if (!header) {
            header = document.createElement('header');
            header.className = 'imperium-header';
            document.body.insertBefore(header, document.body.firstChild);
        }
        
        header.innerHTML = `
            <div class="header-content">
                <h1 class="imperium-logo" onclick="navigateToHome()">IMPERIUM</h1>
                
                <!-- Affichage des ressources -->
                <div id="resources-display" class="resources-display">
                    <div class="resource-item" title="Nourriture">
                        <span class="resource-icon">🍇</span>
                        <span class="resource-value" id="resource-food">${this.formatNumber(this.resources.food)}</span>
                    </div>
                    <div class="resource-item" title="Pierre">
                        <span class="resource-icon">🏛️</span>
                        <span class="resource-value" id="resource-stone">${this.formatNumber(this.resources.stone)}</span>
                    </div>
                    <div class="resource-item" title="Fer">
                        <span class="resource-icon">⚔️</span>
                        <span class="resource-value" id="resource-iron">${this.formatNumber(this.resources.iron)}</span>
                    </div>
                    <div class="resource-item" title="Or">
                        <span class="resource-icon">💰</span>
                        <span class="resource-value" id="resource-gold">${this.formatNumber(this.resources.gold)}</span>
                    </div>
                    <div class="resource-item" title="Bois">
                        <span class="resource-icon">🌲</span>
                        <span class="resource-value" id="resource-wood">${this.formatNumber(this.resources.wood)}</span>
                    </div>
                    <div class="resource-item" title="Population">
                        <span class="resource-icon">👥</span>
                        <span class="resource-value" id="resource-population">${this.formatNumber(this.resources.population)}</span>
                    </div>
                </div>
                
                <!-- Informations du joueur et boutons -->
                <div class="player-info">
                    <!-- Bouton de logs -->
                    <button class="log-button" id="log-button" title="Journal des événements">
                        <span class="log-icon">📜</span>
                        <span class="log-count" id="log-count">${this.logs.length}</span>
                    </button>
                    
                    <!-- Avatar et infos joueur -->
                    <div class="player-avatar" id="player-avatar">M</div>
                    <div class="player-details">
                        <div class="player-name" id="player-name">Marcus Aurelius</div>
                        <div class="player-level" id="player-title-level">Consul - Niv. 12</div>
                    </div>
                </div>
            </div>
            
            <!-- Popup des logs -->
            <div class="log-popup" id="log-popup" style="display: none;">
                <div class="log-popup-header">
                    <h3>📜 Journal des Événements</h3>
                    <button class="log-popup-close" id="log-popup-close">✕</button>
                </div>
                <div class="log-popup-content" id="log-popup-content">
                    <!-- Les logs seront injectés ici -->
                </div>
                <div class="log-popup-footer">
                    <button class="log-clear-btn" id="log-clear-btn">Effacer tout</button>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // Bouton de logs
        const logButton = document.getElementById('log-button');
        const logPopup = document.getElementById('log-popup');
        const logPopupClose = document.getElementById('log-popup-close');
        const logClearBtn = document.getElementById('log-clear-btn');
        
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
            if (this.logPopupOpen && !logPopup.contains(e.target) && !logButton.contains(e.target)) {
                this.closeLogPopup();
            }
        });
        
        // Échapper pour fermer le popup
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.logPopupOpen) {
                this.closeLogPopup();
            }
        });
    }
    
    // ===== GESTION DES RESSOURCES =====
    updateResources(newResources) {
        Object.assign(this.resources, newResources);
        this.refreshResourcesDisplay();
    }
    
    addResource(resourceType, amount) {
        if (this.resources.hasOwnProperty(resourceType)) {
            this.resources[resourceType] += amount;
            this.refreshResourcesDisplay();
            this.addLog(`+${amount} ${this.getResourceName(resourceType)}`, 'resource');
        }
    }
    
    subtractResource(resourceType, amount) {
        if (this.resources.hasOwnProperty(resourceType)) {
            this.resources[resourceType] = Math.max(0, this.resources[resourceType] - amount);
            this.refreshResourcesDisplay();
            this.addLog(`-${amount} ${this.getResourceName(resourceType)}`, 'resource');
        }
    }
    
    refreshResourcesDisplay() {
        Object.keys(this.resources).forEach(resourceType => {
            const element = document.getElementById(`resource-${resourceType}`);
            if (element) {
                element.textContent = this.formatNumber(this.resources[resourceType]);
                
                // Animation de changement
                element.classList.add('resource-updated');
                setTimeout(() => element.classList.remove('resource-updated'), 1000);
            }
        });
    }
    
    startResourceUpdates() {
        // Simulation de production de ressources
        setInterval(() => {
            this.resources.food += Math.floor(Math.random() * 10) + 5;
            this.resources.gold += Math.floor(Math.random() * 20) + 10;
            this.resources.stone += Math.floor(Math.random() * 5) + 2;
            this.resources.iron += Math.floor(Math.random() * 8) + 3;
            this.resources.wood += Math.floor(Math.random() * 6) + 4;
            
            this.refreshResourcesDisplay();
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
        this.saveLogs();
        
        // Notification visuelle
        this.showLogNotification(message, type);
    }
    
    toggleLogPopup() {
        const popup = document.getElementById('log-popup');
        if (this.logPopupOpen) {
            this.closeLogPopup();
        } else {
            this.openLogPopup();
        }
    }
    
    openLogPopup() {
        const popup = document.getElementById('log-popup');
        popup.style.display = 'block';
        this.logPopupOpen = true;
        this.refreshLogPopupContent();
        
        // Marquer tous les logs comme lus
        this.logs.forEach(log => log.read = true);
        this.updateLogCount();
    }
    
    closeLogPopup() {
        const popup = document.getElementById('log-popup');
        popup.style.display = 'none';
        this.logPopupOpen = false;
    }
    
    refreshLogPopupContent() {
        const content = document.getElementById('log-popup-content');
        if (!content) return;
        
        if (this.logs.length === 0) {
            content.innerHTML = '<div class="log-empty">Aucun événement récent</div>';
            return;
        }
        
        content.innerHTML = this.logs.map(log => `
            <div class="log-entry log-${log.type} ${log.read ? '' : 'log-unread'}">
                <div class="log-time">${this.formatLogTime(log.timestamp)}</div>
                <div class="log-message">${this.getLogIcon(log.type)} ${log.message}</div>
            </div>
        `).join('');
    }
    
    clearLogs() {
        if (confirm('Êtes-vous sûr de vouloir effacer tous les logs ?')) {
            this.logs = [];
            this.updateLogCount();
            this.refreshLogPopupContent();
            this.saveLogs();
        }
    }
    
    updateLogCount() {
        const countElement = document.getElementById('log-count');
        const unreadCount = this.logs.filter(log => !log.read).length;
        
        if (countElement) {
            countElement.textContent = unreadCount;
            countElement.style.display = unreadCount > 0 ? 'block' : 'none';
        }
        
        // Mettre à jour l'apparence du bouton
        const logButton = document.getElementById('log-button');
        if (logButton) {
            logButton.classList.toggle('has-unread', unreadCount > 0);
        }
    }
    
    showLogNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `log-notification log-notification-${type}`;
        notification.innerHTML = `
            <span class="log-notification-icon">${this.getLogIcon(type)}</span>
            <span class="log-notification-message">${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Suppression automatique
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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
        const diff = now - timestamp;
        
        if (diff < 60000) { // Moins d'1 minute
            return 'À l\'instant';
        } else if (diff < 3600000) { // Moins d'1 heure
            return Math.floor(diff / 60000) + 'min';
        } else if (diff < 86400000) { // Moins d'1 jour
            return Math.floor(diff / 3600000) + 'h';
        } else {
            return timestamp.toLocaleDateString();
        }
    }
    
    getResourceName(resourceType) {
        const names = {
            food: 'Nourriture',
            stone: 'Pierre',
            iron: 'Fer',
            gold: 'Or',
            wood: 'Bois',
            population: 'Population'
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
            military: '⚔️'
        };
        return icons[type] || 'ℹ️';
    }
    
    // ===== SAUVEGARDE/CHARGEMENT =====
    saveLogs() {
        try {
            localStorage.setItem('imperium_logs', JSON.stringify(this.logs));
        } catch (e) {
            console.warn('Impossible de sauvegarder les logs:', e);
        }
    }
    
    loadLogs() {
        try {
            const saved = localStorage.getItem('imperium_logs');
            if (saved) {
                this.logs = JSON.parse(saved).map(log => ({
                    ...log,
                    timestamp: new Date(log.timestamp)
                }));
                this.updateLogCount();
            }
        } catch (e) {
            console.warn('Impossible de charger les logs:', e);
            this.logs = [];
        }
    }
    
    // ===== API PUBLIQUE =====
    // Méthodes pour que les autres scripts puissent interagir avec le header
    static getInstance() {
        if (!window.imperiumHeader) {
            window.imperiumHeader = new ImperiumCommonHeader();
        }
        return window.imperiumHeader;
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', function() {
    // Attendre un peu pour que les autres scripts se chargent
    setTimeout(() => {
        window.imperiumHeader = ImperiumCommonHeader.getInstance();
        
        // Ajouter quelques logs d'exemple au premier chargement
        if (window.imperiumHeader.logs.length === 0) {
            window.imperiumHeader.addLog('Bienvenue dans IMPERIUM !', 'success');
            window.imperiumHeader.addLog('Votre cité produit des ressources', 'info');
            window.imperiumHeader.addLog('Construction du Forum terminée', 'building');
        }
    }, 500);
});

// Fonctions utilitaires globales
window.addImperiumLog = function(message, type = 'info') {
    if (window.imperiumHeader) {
        window.imperiumHeader.addLog(message, type);
    }
};

window.updateImperiumResources = function(resources) {
    if (window.imperiumHeader) {
        window.imperiumHeader.updateResources(resources);
    }
};

window.addImperiumResource = function(resourceType, amount) {
    if (window.imperiumHeader) {
        window.imperiumHeader.addResource(resourceType, amount);
    }
};