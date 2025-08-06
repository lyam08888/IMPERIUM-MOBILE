/**
 * 🏛️ IMPERIUM - Chargeur de Systèmes Avancés
 * Charge et intègre tous les systèmes transformés de C# vers JavaScript
 */

class ImperiumSystemsLoader {
    constructor() {
        this.loadedSystems = new Set();
        this.loadingPromises = new Map();
        this.systemsPath = './';
    }

    // Charger un script de manière asynchrone
    async loadScript(scriptPath, systemName) {
        if (this.loadedSystems.has(systemName)) {
            return true;
        }

        if (this.loadingPromises.has(systemName)) {
            return this.loadingPromises.get(systemName);
        }

        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.async = true;
            
            script.onload = () => {
                this.loadedSystems.add(systemName);
                console.log(`✅ Système ${systemName} chargé`);
                resolve(true);
            };
            
            script.onerror = () => {
                console.error(`❌ Erreur lors du chargement de ${systemName}`);
                reject(new Error(`Impossible de charger ${systemName}`));
            };
            
            document.head.appendChild(script);
        });

        this.loadingPromises.set(systemName, promise);
        return promise;
    }

    // Charger tous les systèmes de base
    async loadCoreSystems() {
        const coreSystems = [
            { path: 'Sauvegarder.cs', name: 'SaveSystem' },
            { path: 'Charger.cs', name: 'LoadSystem' }
        ];

        try {
            await Promise.all(
                coreSystems.map(system => 
                    this.loadScript(system.path, system.name)
                )
            );
            console.log('🎮 Systèmes de base chargés');
            return true;
        } catch (error) {
            console.error('❌ Erreur lors du chargement des systèmes de base:', error);
            return false;
        }
    }

    // Charger tous les systèmes d'alliance
    async loadAllianceSystems() {
        const allianceSystems = [
            { path: 'Social/Diplomatie/Foedus - Alliances Romaines/Fonder l\'Alliance.cs', name: 'AllianceCreation' },
            { path: 'Social/Diplomatie/Foedus - Alliances Romaines/Accepter.cs', name: 'AllianceAccept' },
            { path: 'Social/Diplomatie/Foedus - Alliances Romaines/Refuser.cs', name: 'AllianceDecline' },
            { path: 'Social/Diplomatie/Foedus - Alliances Romaines/Chercher des Alliances.cs', name: 'AllianceSearch' },
            { path: 'Social/Alliance/Actions Rapides.cs', name: 'AllianceQuickActions' },
            { path: 'Social/Alliance/Bonus d\'Alliance.cs', name: 'AllianceBonuses' },
            { path: 'Social/Alliance/Chat de l\'Alliance.cs', name: 'AllianceChat' },
            { path: 'Social/Alliance/Evenements Récents.cs', name: 'AllianceEvents' },
            { path: 'Social/Alliance/Membre de l\'Alliance.cs', name: 'AllianceMembers' }
        ];

        try {
            // Charger les systèmes un par un pour éviter les erreurs de dépendance
            for (const system of allianceSystems) {
                try {
                    await this.loadScript(system.path, system.name);
                } catch (error) {
                    console.warn(`⚠️ Impossible de charger ${system.name}: ${error.message}`);
                    // Continuer même si un système ne se charge pas
                }
            }
            console.log('🤝 Systèmes d\'alliance chargés');
            return true;
        } catch (error) {
            console.error('❌ Erreur lors du chargement des systèmes d\'alliance:', error);
            return false;
        }
    }

    // Charger tous les systèmes de messages
    async loadMessageSystems() {
        const messageSystems = [
            { path: 'Social/Messages/Actualiser.cs', name: 'MessageRefresh' },
            { path: 'Social/Messages/Nouveau message.cs', name: 'MessageNew' },
            { path: 'Social/Messages/Supprimer.cs', name: 'MessageDelete' },
            { path: 'Social/Messages/Tout marquer lu.cs', name: 'MessageMarkRead' }
        ];

        try {
            await Promise.all(
                messageSystems.map(system => 
                    this.loadScript(system.path, system.name)
                )
            );
            console.log('📨 Systèmes de messages chargés');
            return true;
        } catch (error) {
            console.error('❌ Erreur lors du chargement des systèmes de messages:', error);
            return false;
        }
    }

    // Charger tous les systèmes
    async loadAllSystems() {
        try {
            console.log('🚀 Début du chargement des systèmes IMPERIUM...');
            
            // Charger les systèmes dans l'ordre de dépendance
            await this.loadCoreSystems();
            await this.loadMessageSystems();
            await this.loadAllianceSystems();
            
            // Initialiser les systèmes après chargement
            this.initializeSystems();
            
            console.log('✅ Tous les systèmes IMPERIUM sont chargés et initialisés!');
            return true;
            
        } catch (error) {
            console.error('❌ Erreur critique lors du chargement des systèmes:', error);
            return false;
        }
    }

    // Initialiser les systèmes après chargement
    initializeSystems() {
        // Vérifier que le moteur de jeu est disponible
        if (!window.gameEngine) {
            console.warn('⚠️ Moteur de jeu non disponible, initialisation différée');
            return;
        }

        // Initialiser le système d'alliance s'il n'existe pas
        if (!gameEngine.allianceSystem) {
            gameEngine.allianceSystem = new AllianceSystem();
        }

        // Initialiser le système de messages s'il n'existe pas
        if (!gameEngine.messageSystem) {
            gameEngine.messageSystem = new MessageSystem();
        }

        // Déclencher un événement personnalisé
        window.dispatchEvent(new CustomEvent('imperiumSystemsLoaded', {
            detail: {
                loadedSystems: Array.from(this.loadedSystems),
                timestamp: Date.now()
            }
        }));
    }

    // Vérifier si un système est chargé
    isSystemLoaded(systemName) {
        return this.loadedSystems.has(systemName);
    }

    // Obtenir la liste des systèmes chargés
    getLoadedSystems() {
        return Array.from(this.loadedSystems);
    }
}

// Système d'alliance de base (si pas déjà défini)
class AllianceSystem {
    constructor() {
        this.alliances = {};
        this.invitations = [];
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        // Charger les données sauvegardées
        this.loadFromStorage();
        
        this.initialized = true;
        console.log('🤝 Système d\'alliance initialisé');
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('imperium_alliances');
            if (saved) {
                const data = JSON.parse(saved);
                this.alliances = data.alliances || {};
                this.invitations = data.invitations || [];
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des alliances:', error);
        }
    }

    saveToStorage() {
        try {
            const data = {
                alliances: this.alliances,
                invitations: this.invitations,
                timestamp: Date.now()
            };
            localStorage.setItem('imperium_alliances', JSON.stringify(data));
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde des alliances:', error);
        }
    }
}

// Système de messages de base (si pas déjà défini)
class MessageSystem {
    constructor() {
        this.messages = [];
        this.folders = {
            inbox: { name: 'Boîte de réception', messages: [] },
            sent: { name: 'Messages envoyés', messages: [] },
            diplomatic: { name: 'Messages diplomatiques', messages: [] },
            battle: { name: 'Rapports de bataille', messages: [] },
            announcements: { name: 'Annonces', messages: [] }
        };
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        // Charger les données sauvegardées
        this.loadFromStorage();
        
        this.initialized = true;
        console.log('📨 Système de messages initialisé');
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('imperium_messages');
            if (saved) {
                const data = JSON.parse(saved);
                this.messages = data.messages || [];
                this.folders = { ...this.folders, ...data.folders };
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des messages:', error);
        }
    }

    saveToStorage() {
        try {
            const data = {
                messages: this.messages,
                folders: this.folders,
                timestamp: Date.now()
            };
            localStorage.setItem('imperium_messages', JSON.stringify(data));
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde des messages:', error);
        }
    }
}

// Créer une instance globale du chargeur
window.imperiumSystemsLoader = new ImperiumSystemsLoader();

// Auto-initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🏛️ IMPERIUM Systems Loader - Initialisation...');
    
    // Attendre que le moteur de jeu soit disponible
    let attempts = 0;
    const maxAttempts = 50; // 5 secondes max
    
    const waitForGameEngine = () => {
        return new Promise((resolve) => {
            const checkEngine = () => {
                if (window.gameEngine || attempts >= maxAttempts) {
                    resolve();
                } else {
                    attempts++;
                    setTimeout(checkEngine, 100);
                }
            };
            checkEngine();
        });
    };
    
    await waitForGameEngine();
    
    if (window.gameEngine) {
        // Charger tous les systèmes
        await imperiumSystemsLoader.loadAllSystems();
    } else {
        console.warn('⚠️ Moteur de jeu non trouvé, chargement des systèmes sans intégration');
        await imperiumSystemsLoader.loadAllSystems();
    }
});

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImperiumSystemsLoader, AllianceSystem, MessageSystem };
}

console.log('🏛️ IMPERIUM Systems Loader chargé!');