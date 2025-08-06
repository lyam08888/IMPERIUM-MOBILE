/**
 * 🏛️ IMPERIUM - Système de Sauvegarde Avancé
 * Sauvegarde complète avec compression, validation et versions multiples
 */

class ImperiumSaveSystem {
    constructor() {
        this.version = '1.0.0';
        this.maxSaves = 10;
        this.autoSaveInterval = 30000; // 30 secondes
        this.compressionEnabled = true;
        this.encryptionEnabled = false; // Pour une version future
        
        this.saveSlots = this.loadSaveSlots();
        this.currentSlot = 'autosave';
        
        this.startAutoSave();
    }
    
    // ===== SAUVEGARDE PRINCIPALE =====
    saveGame(slotName = null, description = '') {
        try {
            const saveData = this.createSaveData(description);
            const slot = slotName || this.currentSlot;
            
            // Valider les données avant sauvegarde
            if (!this.validateSaveData(saveData)) {
                throw new Error('Données de sauvegarde invalides');
            }
            
            // Compresser si activé
            let finalData = saveData;
            if (this.compressionEnabled) {
                finalData = this.compressData(saveData);
            }
            
            // Sauvegarder dans le localStorage
            const saveKey = `imperium_save_${slot}`;
            localStorage.setItem(saveKey, JSON.stringify(finalData));
            
            // Mettre à jour la liste des sauvegardes
            this.updateSaveSlots(slot, saveData.metadata);
            
            // Nettoyer les anciennes sauvegardes si nécessaire
            this.cleanupOldSaves();
            
            console.log(`✅ Jeu sauvegardé dans le slot: ${slot}`);
            
            return {
                success: true,
                slot: slot,
                timestamp: saveData.metadata.timestamp,
                size: JSON.stringify(finalData).length
            };
            
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // ===== CHARGEMENT PRINCIPAL =====
    loadGame(slotName = null) {
        try {
            const slot = slotName || this.currentSlot;
            const saveKey = `imperium_save_${slot}`;
            
            const savedData = localStorage.getItem(saveKey);
            if (!savedData) {
                throw new Error(`Aucune sauvegarde trouvée pour le slot: ${slot}`);
            }
            
            let saveData = JSON.parse(savedData);
            
            // Décompresser si nécessaire
            if (saveData.compressed) {
                saveData = this.decompressData(saveData);
            }
            
            // Valider les données chargées
            if (!this.validateSaveData(saveData)) {
                throw new Error('Données de sauvegarde corrompues');
            }
            
            // Vérifier la compatibilité de version
            if (!this.isVersionCompatible(saveData.metadata.version)) {
                console.warn('⚠️ Version de sauvegarde différente, tentative de migration...');
                saveData = this.migrateSaveData(saveData);
            }
            
            // Restaurer l'état du jeu
            this.restoreGameState(saveData);
            
            console.log(`✅ Jeu chargé depuis le slot: ${slot}`);
            
            return {
                success: true,
                slot: slot,
                metadata: saveData.metadata
            };
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // ===== CRÉATION DES DONNÉES DE SAUVEGARDE =====
    createSaveData(description = '') {
        const timestamp = Date.now();
        
        return {
            metadata: {
                version: this.version,
                timestamp: timestamp,
                description: description,
                playTime: gameState.totalPlayTime || 0,
                playerName: gameState.player.name,
                playerLevel: gameState.player.level,
                gameStarted: gameState.gameStarted || timestamp
            },
            
            // État principal du jeu
            gameState: {
                player: { ...gameState.player },
                resources: { ...gameState.resources },
                cities: JSON.parse(JSON.stringify(gameState.cities)),
                technologies: [...gameState.technologies],
                researchQueue: [...gameState.researchQueue],
                alliance: gameState.alliance ? { ...gameState.alliance } : null,
                diplomaticRelations: { ...gameState.diplomaticRelations },
                events: [...gameState.events],
                timers: { ...gameState.timers },
                lastUpdate: gameState.lastUpdate,
                totalPlayTime: gameState.totalPlayTime,
                gameStarted: gameState.gameStarted
            },
            
            // Systèmes avancés
            advancedSystems: {
                market: this.saveMarketData(),
                alliance: this.saveAllianceData(),
                worldEvents: this.saveWorldEventsData(),
                rankings: this.saveRankingsData()
            },
            
            // Statistiques et achievements
            statistics: {
                buildingsConstructed: gameState.statistics?.buildingsConstructed || 0,
                unitsRecruited: gameState.statistics?.unitsRecruited || 0,
                battlesWon: gameState.statistics?.battlesWon || 0,
                battlesLost: gameState.statistics?.battlesLost || 0,
                resourcesProduced: gameState.statistics?.resourcesProduced || {},
                technologiesResearched: gameState.statistics?.technologiesResearched || 0,
                tradingVolume: gameState.statistics?.tradingVolume || 0
            },
            
            // Préférences utilisateur
            settings: {
                autoSave: true,
                notifications: true,
                soundEnabled: true,
                language: 'fr',
                theme: 'roman'
            }
        };
    }
    
    // ===== SAUVEGARDE DES SYSTÈMES AVANCÉS =====
    saveMarketData() {
        if (typeof marketSystem === 'undefined') return null;
        
        return {
            orders: {
                buy: [...marketSystem.orders.buy],
                sell: [...marketSystem.orders.sell]
            },
            priceHistory: { ...marketSystem.priceHistory },
            basePrices: { ...marketSystem.basePrices }
        };
    }
    
    saveAllianceData() {
        if (typeof allianceSystem === 'undefined') return null;
        
        return {
            alliances: Array.from(allianceSystem.alliances.entries()),
            invitations: [...allianceSystem.invitations]
        };
    }
    
    saveWorldEventsData() {
        if (typeof worldEventsSystem === 'undefined') return null;
        
        return {
            activeEvents: [...worldEventsSystem.activeEvents],
            eventHistory: [...worldEventsSystem.eventHistory]
        };
    }
    
    saveRankingsData() {
        if (typeof rankingSystem === 'undefined') return null;
        
        return {
            rankings: { ...rankingSystem.rankings },
            lastUpdate: rankingSystem.lastUpdate
        };
    }
    
    // ===== RESTAURATION DE L'ÉTAT DU JEU =====
    restoreGameState(saveData) {
        // Restaurer l'état principal
        Object.assign(gameState, saveData.gameState);
        
        // Restaurer les systèmes avancés
        if (saveData.advancedSystems) {
            this.restoreAdvancedSystems(saveData.advancedSystems);
        }
        
        // Restaurer les statistiques
        if (saveData.statistics) {
            gameState.statistics = { ...saveData.statistics };
        }
        
        // Appliquer les préférences
        if (saveData.settings) {
            this.applySettings(saveData.settings);
        }
        
        // Redémarrer les timers et processus
        this.restartGameProcesses();
    }
    
    restoreAdvancedSystems(systemsData) {
        // Restaurer le marché
        if (systemsData.market && typeof marketSystem !== 'undefined') {
            marketSystem.orders = systemsData.market.orders;
            marketSystem.priceHistory = systemsData.market.priceHistory;
            marketSystem.basePrices = systemsData.market.basePrices;
        }
        
        // Restaurer les alliances
        if (systemsData.alliance && typeof allianceSystem !== 'undefined') {
            allianceSystem.alliances = new Map(systemsData.alliance.alliances);
            allianceSystem.invitations = systemsData.alliance.invitations;
        }
        
        // Restaurer les événements mondiaux
        if (systemsData.worldEvents && typeof worldEventsSystem !== 'undefined') {
            worldEventsSystem.activeEvents = systemsData.worldEvents.activeEvents;
            worldEventsSystem.eventHistory = systemsData.worldEvents.eventHistory;
        }
        
        // Restaurer les classements
        if (systemsData.rankings && typeof rankingSystem !== 'undefined') {
            rankingSystem.rankings = systemsData.rankings.rankings;
            rankingSystem.lastUpdate = systemsData.rankings.lastUpdate;
        }
    }
    
    applySettings(settings) {
        // Appliquer les préférences utilisateur
        if (settings.autoSave !== undefined) {
            this.autoSaveEnabled = settings.autoSave;
        }
        
        // Autres préférences peuvent être appliquées ici
    }
    
    restartGameProcesses() {
        // Redémarrer les processus qui dépendent de l'état du jeu
        if (typeof gameEngine !== 'undefined' && gameEngine.isRunning) {
            // Les boucles de jeu continuent automatiquement
            console.log('🔄 Processus de jeu redémarrés');
        }
    }
    
    // ===== VALIDATION DES DONNÉES =====
    validateSaveData(saveData) {
        // Vérifications de base
        if (!saveData || typeof saveData !== 'object') {
            return false;
        }
        
        if (!saveData.metadata || !saveData.gameState) {
            return false;
        }
        
        // Vérifier les champs essentiels
        const requiredFields = ['player', 'resources', 'cities'];
        for (const field of requiredFields) {
            if (!saveData.gameState[field]) {
                console.error(`Champ manquant dans la sauvegarde: ${field}`);
                return false;
            }
        }
        
        // Vérifier l'intégrité des ressources
        const resources = saveData.gameState.resources;
        for (const resource of Object.keys(RESOURCES_CONFIG)) {
            if (typeof resources[resource] !== 'number' || resources[resource] < 0) {
                console.error(`Ressource invalide: ${resource}`);
                return false;
            }
        }
        
        return true;
    }
    
    // ===== COMPRESSION DES DONNÉES =====
    compressData(data) {
        // Compression simple basée sur JSON
        const jsonString = JSON.stringify(data);
        
        // Pour une vraie compression, on pourrait utiliser une bibliothèque comme pako
        // Ici, on simule avec une compression basique
        return {
            compressed: true,
            data: this.simpleCompress(jsonString),
            originalSize: jsonString.length,
            compressedSize: this.simpleCompress(jsonString).length
        };
    }
    
    decompressData(compressedData) {
        if (!compressedData.compressed) {
            return compressedData;
        }
        
        const decompressed = this.simpleDecompress(compressedData.data);
        return JSON.parse(decompressed);
    }
    
    simpleCompress(str) {
        // Compression très basique - remplacer par une vraie compression
        return btoa(str);
    }
    
    simpleDecompress(str) {
        return atob(str);
    }
    
    // ===== GESTION DES VERSIONS =====
    isVersionCompatible(saveVersion) {
        // Pour l'instant, toutes les versions 1.x sont compatibles
        const currentMajor = parseInt(this.version.split('.')[0]);
        const saveMajor = parseInt(saveVersion.split('.')[0]);
        
        return currentMajor === saveMajor;
    }
    
    migrateSaveData(saveData) {
        // Migration des données entre versions
        const saveVersion = saveData.metadata.version;
        
        console.log(`🔄 Migration de la version ${saveVersion} vers ${this.version}`);
        
        // Ici, on ajouterait la logique de migration spécifique
        // Pour l'instant, on retourne les données telles quelles
        
        // Mettre à jour la version
        saveData.metadata.version = this.version;
        
        return saveData;
    }
    
    // ===== GESTION DES SLOTS DE SAUVEGARDE =====
    loadSaveSlots() {
        const slotsData = localStorage.getItem('imperium_save_slots');
        if (slotsData) {
            return JSON.parse(slotsData);
        }
        
        return {};
    }
    
    updateSaveSlots(slotName, metadata) {
        this.saveSlots[slotName] = {
            name: slotName,
            description: metadata.description,
            timestamp: metadata.timestamp,
            playerName: metadata.playerName,
            playerLevel: metadata.playerLevel,
            playTime: metadata.playTime
        };
        
        localStorage.setItem('imperium_save_slots', JSON.stringify(this.saveSlots));
    }
    
    getSaveSlots() {
        return { ...this.saveSlots };
    }
    
    deleteSave(slotName) {
        const saveKey = `imperium_save_${slotName}`;
        localStorage.removeItem(saveKey);
        
        delete this.saveSlots[slotName];
        localStorage.setItem('imperium_save_slots', JSON.stringify(this.saveSlots));
        
        return true;
    }
    
    cleanupOldSaves() {
        const slots = Object.keys(this.saveSlots);
        if (slots.length <= this.maxSaves) return;
        
        // Trier par timestamp et supprimer les plus anciennes
        const sortedSlots = slots
            .filter(slot => slot !== 'autosave') // Ne jamais supprimer l'autosave
            .sort((a, b) => this.saveSlots[a].timestamp - this.saveSlots[b].timestamp);
        
        const toDelete = sortedSlots.slice(0, sortedSlots.length - this.maxSaves + 1);
        
        toDelete.forEach(slot => {
            this.deleteSave(slot);
            console.log(`🗑️ Ancienne sauvegarde supprimée: ${slot}`);
        });
    }
    
    // ===== SAUVEGARDE AUTOMATIQUE =====
    startAutoSave() {
        if (this.autoSaveInterval > 0) {
            setInterval(() => {
                if (this.autoSaveEnabled && typeof gameState !== 'undefined') {
                    this.saveGame('autosave', 'Sauvegarde automatique');
                }
            }, this.autoSaveInterval);
        }
    }
    
    // ===== EXPORT/IMPORT =====
    exportSave(slotName) {
        const saveKey = `imperium_save_${slotName}`;
        const saveData = localStorage.getItem(saveKey);
        
        if (!saveData) {
            throw new Error('Sauvegarde non trouvée');
        }
        
        // Créer un blob pour le téléchargement
        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Créer un lien de téléchargement
        const a = document.createElement('a');
        a.href = url;
        a.download = `imperium_save_${slotName}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        return true;
    }
    
    importSave(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const saveData = JSON.parse(e.target.result);
                    
                    if (!this.validateSaveData(saveData)) {
                        reject(new Error('Fichier de sauvegarde invalide'));
                        return;
                    }
                    
                    // Générer un nom de slot unique
                    const slotName = `imported_${Date.now()}`;
                    
                    // Sauvegarder les données importées
                    localStorage.setItem(`imperium_save_${slotName}`, JSON.stringify(saveData));
                    this.updateSaveSlots(slotName, saveData.metadata);
                    
                    resolve({
                        success: true,
                        slotName: slotName,
                        metadata: saveData.metadata
                    });
                    
                } catch (error) {
                    reject(new Error('Erreur lors de l\'import: ' + error.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Erreur lors de la lecture du fichier'));
            };
            
            reader.readAsText(file);
        });
    }
    
    // ===== UTILITAIRES =====
    getStorageUsage() {
        let totalSize = 0;
        
        for (let key in localStorage) {
            if (key.startsWith('imperium_')) {
                totalSize += localStorage[key].length;
            }
        }
        
        return {
            totalSize: totalSize,
            formattedSize: this.formatBytes(totalSize),
            slotsCount: Object.keys(this.saveSlots).length
        };
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // ===== SAUVEGARDE RAPIDE =====
    quickSave() {
        const slotName = `quicksave_${Date.now()}`;
        return this.saveGame(slotName, 'Sauvegarde rapide');
    }
    
    quickLoad() {
        // Charger la sauvegarde la plus récente
        const slots = Object.keys(this.saveSlots);
        if (slots.length === 0) {
            throw new Error('Aucune sauvegarde disponible');
        }
        
        const mostRecent = slots.reduce((latest, current) => {
            return this.saveSlots[current].timestamp > this.saveSlots[latest].timestamp ? current : latest;
        });
        
        return this.loadGame(mostRecent);
    }
}

// Instance globale du système de sauvegarde
const saveSystem = new ImperiumSaveSystem();

// Intégration avec le moteur de jeu
if (typeof gameEngine !== 'undefined') {
    gameEngine.saveSystem = saveSystem;
    
    // Remplacer les méthodes de sauvegarde/chargement du moteur
    gameEngine.saveGame = () => saveSystem.saveGame();
    gameEngine.loadGame = () => saveSystem.loadGame();
}

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImperiumSaveSystem, saveSystem };
}