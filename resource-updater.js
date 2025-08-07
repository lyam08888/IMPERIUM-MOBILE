/**
 * 🏛️ IMPERIUM - Système de mise à jour des ressources en temps réel
 * Ce script permet de synchroniser les ressources entre les différentes pages
 */

class ResourceUpdater {
    constructor() {
        this.resources = {};
        this.maxResources = {};
        this.productionRates = {};
        this.lastUpdate = Date.now();
        this.updateInterval = 5000; // 5 secondes
        
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.startPeriodicUpdates();
        this.setupStorageListener();
    }
    
    loadFromStorage() {
        try {
            // Charger les ressources
            const savedResources = localStorage.getItem('imperium_resources_2025');
            if (savedResources) {
                this.resources = JSON.parse(savedResources);
            }
            
            // Charger les taux max
            const savedMaxResources = localStorage.getItem('imperium_max_resources_2025');
            if (savedMaxResources) {
                this.maxResources = JSON.parse(savedMaxResources);
            }
            
            // Charger les taux de production
            const savedProductionRates = localStorage.getItem('imperium_production_rates_2025');
            if (savedProductionRates) {
                this.productionRates = JSON.parse(savedProductionRates);
            }
            
            // Charger la dernière mise à jour
            const savedLastUpdate = localStorage.getItem('imperium_last_update_2025');
            if (savedLastUpdate) {
                this.lastUpdate = parseInt(savedLastUpdate);
            }
        } catch (e) {
            console.warn('Impossible de charger les données de ressources:', e);
        }
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('imperium_resources_2025', JSON.stringify(this.resources));
            localStorage.setItem('imperium_max_resources_2025', JSON.stringify(this.maxResources));
            localStorage.setItem('imperium_production_rates_2025', JSON.stringify(this.productionRates));
            localStorage.setItem('imperium_last_update_2025', this.lastUpdate.toString());
        } catch (e) {
            console.warn('Impossible de sauvegarder les données de ressources:', e);
        }
    }
    
    startPeriodicUpdates() {
        // Mettre à jour les ressources en fonction du temps écoulé depuis la dernière mise à jour
        setInterval(() => {
            const now = Date.now();
            const elapsedSeconds = (now - this.lastUpdate) / 1000;
            
            if (elapsedSeconds > 0) {
                this.updateResourcesBasedOnTime(elapsedSeconds);
                this.lastUpdate = now;
                this.saveToStorage();
                
                // Mettre à jour l'affichage si le header est disponible
                if (window.imperiumHeader2025) {
                    window.imperiumHeader2025.updateResources(this.resources);
                }
            }
        }, this.updateInterval);
    }
    
    updateResourcesBasedOnTime(elapsedSeconds) {
        // Calculer la production pour chaque ressource
        Object.keys(this.productionRates || {}).forEach(resourceType => {
            if (this.resources[resourceType] < this.maxResources[resourceType]) {
                const rate = this.productionRates[resourceType];
                const production = (rate * elapsedSeconds) / 60; // Taux par minute
                
                // Ajouter la production
                this.resources[resourceType] = Math.min(
                    (this.resources[resourceType] || 0) + production,
                    this.maxResources[resourceType] || Infinity
                );
            }
        });
    }
    
    setupStorageListener() {
        // Écouter les changements de stockage pour synchroniser entre les onglets
        window.addEventListener('storage', (event) => {
            if (event.key === 'imperium_resources_2025') {
                try {
                    const newResources = JSON.parse(event.newValue);
                    this.resources = newResources;
                    
                    // Mettre à jour l'affichage si le header est disponible
                    if (window.imperiumHeader2025) {
                        window.imperiumHeader2025.updateResources(this.resources);
                    }
                } catch (e) {
                    console.warn('Erreur lors de la synchronisation des ressources:', e);
                }
            }
        });
    }
}

// Initialiser le système de mise à jour des ressources
document.addEventListener('DOMContentLoaded', function() {
    window.resourceUpdater = new ResourceUpdater();
});