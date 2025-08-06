/**
 * 🏛️ IMPERIUM - Système de Sauvegarde Avancé
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Classe principale de sauvegarde
class ImperiumSaveSystem {
    constructor() {
        this.saveSlots = 10;
        this.autoSaveInterval = 5 * 60 * 1000; // 5 minutes
        this.compressionEnabled = true;
        this.encryptionEnabled = false;
        this.autoSaveTimer = null;
        this.lastSaveTime = 0;
    }

    // Initialiser le système de sauvegarde
    init() {
        this.startAutoSave();
        this.loadSavesList();
        console.log('💾 Système de sauvegarde initialisé');
    }

    // Sauvegarder le jeu
    async sauvegarderJeu(slotName = 'autosave', description = '') {
        try {
            const gameState = this.collectGameState();
            const saveData = this.prepareSaveData(gameState, description);
            
            // Compression si activée
            if (this.compressionEnabled) {
                saveData.compressed = true;
                saveData.data = this.compressData(saveData.data);
            }

            // Sauvegarde locale
            await this.saveToLocalStorage(slotName, saveData);
            
            // Sauvegarde dans IndexedDB pour les gros fichiers
            if (this.getSaveSize(saveData) > 5 * 1024 * 1024) { // 5MB
                await this.saveToIndexedDB(slotName, saveData);
            }

            this.lastSaveTime = Date.now();
            
            showNotification(`💾 Jeu sauvegardé: ${slotName}`, 'success');
            console.log(`💾 Sauvegarde réussie: ${slotName}`);
            
            return true;

        } catch (error) {
            console.error('❌ Erreur de sauvegarde:', error);
            showNotification(`Erreur de sauvegarde: ${error.message}`, 'error');
            return false;
        }
    }

    // Collecter l'état du jeu
    collectGameState() {
        const gameState = gameEngine.getGameState();
        
        return {
            // Données du joueur
            player: {
                ...gameState.player,
                lastSaved: Date.now()
            },
            
            // Système d'alliance
            alliances: gameEngine.allianceSystem ? {
                alliances: gameEngine.allianceSystem.alliances,
                invitations: gameEngine.allianceSystem.invitations
            } : null,
            
            // Système de messages
            messages: gameEngine.messageSystem ? {
                messages: gameEngine.messageSystem.messages,
                folders: gameEngine.messageSystem.folders
            } : null,
            
            // Données de la ville
            city: gameState.city || {},
            
            // Recherches
            research: gameState.research || {},
            
            // Armée
            military: gameState.military || {},
            
            // Économie
            economy: gameState.economy || {},
            
            // Événements
            events: gameState.events || [],
            
            // Statistiques
            statistics: gameState.statistics || {},
            
            // Paramètres
            settings: gameState.settings || {}
        };
    }

    // Préparer les données de sauvegarde
    prepareSaveData(gameState, description) {
        return {
            version: '1.0.0',
            timestamp: Date.now(),
            description: description,
            playerName: gameState.player.name,
            playerLevel: gameState.player.level,
            gameTime: gameState.gameTime || 0,
            compressed: false,
            checksum: this.calculateChecksum(gameState),
            data: gameState
        };
    }

    // Calculer une somme de contrôle
    calculateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    // Compresser les données
    compressData(data) {
        try {
            const jsonString = JSON.stringify(data);
            // Simulation de compression (en réalité, on utiliserait une vraie lib de compression)
            return btoa(jsonString);
        } catch (error) {
            console.warn('⚠️ Compression échouée, sauvegarde sans compression');
            return data;
        }
    }

    // Décompresser les données
    decompressData(compressedData) {
        try {
            const jsonString = atob(compressedData);
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('❌ Erreur de décompression:', error);
            throw new Error('Données corrompues');
        }
    }

    // Sauvegarder dans localStorage
    async saveToLocalStorage(slotName, saveData) {
        try {
            const key = `imperium_save_${slotName}`;
            localStorage.setItem(key, JSON.stringify(saveData));
            
            // Mettre à jour la liste des sauvegardes
            this.updateSavesList(slotName, saveData);
            
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                throw new Error('Espace de stockage insuffisant');
            }
            throw error;
        }
    }

    // Sauvegarder dans IndexedDB
    async saveToIndexedDB(slotName, saveData) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ImperiumSaves', 1);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['saves'], 'readwrite');
                const store = transaction.objectStore('saves');
                
                store.put({
                    id: slotName,
                    data: saveData,
                    timestamp: Date.now()
                });
                
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            };
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('saves')) {
                    db.createObjectStore('saves', { keyPath: 'id' });
                }
            };
        });
    }

    // Mettre à jour la liste des sauvegardes
    updateSavesList(slotName, saveData) {
        let savesList = JSON.parse(localStorage.getItem('imperium_saves_list') || '{}');
        
        savesList[slotName] = {
            name: slotName,
            description: saveData.description,
            timestamp: saveData.timestamp,
            playerName: saveData.playerName,
            playerLevel: saveData.playerLevel,
            size: this.getSaveSize(saveData)
        };
        
        localStorage.setItem('imperium_saves_list', JSON.stringify(savesList));
    }

    // Obtenir la taille d'une sauvegarde
    getSaveSize(saveData) {
        return new Blob([JSON.stringify(saveData)]).size;
    }

    // Charger la liste des sauvegardes
    loadSavesList() {
        try {
            const savesList = JSON.parse(localStorage.getItem('imperium_saves_list') || '{}');
            return Object.values(savesList).sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error('❌ Erreur lors du chargement de la liste:', error);
            return [];
        }
    }

    // Supprimer une sauvegarde
    async supprimerSauvegarde(slotName) {
        try {
            // Supprimer de localStorage
            localStorage.removeItem(`imperium_save_${slotName}`);
            
            // Supprimer de IndexedDB
            await this.deleteFromIndexedDB(slotName);
            
            // Mettre à jour la liste
            let savesList = JSON.parse(localStorage.getItem('imperium_saves_list') || '{}');
            delete savesList[slotName];
            localStorage.setItem('imperium_saves_list', JSON.stringify(savesList));
            
            showNotification(`🗑️ Sauvegarde supprimée: ${slotName}`, 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
            showNotification(`Erreur de suppression: ${error.message}`, 'error');
            return false;
        }
    }

    // Supprimer de IndexedDB
    async deleteFromIndexedDB(slotName) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ImperiumSaves', 1);
            
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['saves'], 'readwrite');
                const store = transaction.objectStore('saves');
                
                store.delete(slotName);
                
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            };
            
            request.onerror = () => resolve(); // Ignore les erreurs pour IndexedDB
        });
    }

    // Démarrer la sauvegarde automatique
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            this.sauvegarderJeu('autosave', 'Sauvegarde automatique');
        }, this.autoSaveInterval);
        
        console.log('🔄 Sauvegarde automatique activée');
    }

    // Arrêter la sauvegarde automatique
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
        console.log('⏹️ Sauvegarde automatique désactivée');
    }

    // Exporter une sauvegarde
    async exporterSauvegarde(slotName) {
        try {
            const saveData = await this.loadFromStorage(slotName);
            if (!saveData) {
                throw new Error('Sauvegarde introuvable');
            }
            
            const exportData = {
                ...saveData,
                exportedAt: Date.now(),
                exportVersion: '1.0.0'
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `imperium_save_${slotName}_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification(`📤 Sauvegarde exportée: ${slotName}`, 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Erreur d\'exportation:', error);
            showNotification(`Erreur d'exportation: ${error.message}`, 'error');
            return false;
        }
    }

    // Charger depuis le stockage
    async loadFromStorage(slotName) {
        try {
            // Essayer localStorage d'abord
            const localData = localStorage.getItem(`imperium_save_${slotName}`);
            if (localData) {
                return JSON.parse(localData);
            }
            
            // Essayer IndexedDB
            return await this.loadFromIndexedDB(slotName);
            
        } catch (error) {
            console.error('❌ Erreur de chargement:', error);
            return null;
        }
    }

    // Charger depuis IndexedDB
    async loadFromIndexedDB(slotName) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ImperiumSaves', 1);
            
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['saves'], 'readonly');
                const store = transaction.objectStore('saves');
                const getRequest = store.get(slotName);
                
                getRequest.onsuccess = () => {
                    resolve(getRequest.result ? getRequest.result.data : null);
                };
                
                getRequest.onerror = () => resolve(null);
            };
            
            request.onerror = () => resolve(null);
        });
    }

    // Interface de gestion des sauvegardes
    creerInterfaceSauvegarde() {
        const container = document.createElement('div');
        container.className = 'save-management-interface';
        
        const savesList = this.loadSavesList();
        
        container.innerHTML = `
            <div class="save-panel">
                <h3>💾 Gestion des Sauvegardes</h3>
                
                <div class="save-actions">
                    <button class="save-btn primary" onclick="imperiumSaveSystem.sauvegarderJeu('quicksave', 'Sauvegarde rapide')">
                        💾 Sauvegarde Rapide
                    </button>
                    <button class="save-btn" onclick="imperiumSaveSystem.ouvrirDialogueNouvellesSauvegarde()">
                        📝 Nouvelle Sauvegarde
                    </button>
                    <button class="save-btn secondary" onclick="imperiumSaveSystem.actualiserListeSauvegardes()">
                        🔄 Actualiser
                    </button>
                </div>
                
                <div class="saves-list">
                    ${savesList.length === 0 ? 
                        '<div class="no-saves">Aucune sauvegarde trouvée</div>' :
                        savesList.map(save => this.creerElementSauvegarde(save)).join('')
                    }
                </div>
            </div>
        `;
        
        return container;
    }

    // Créer un élément de sauvegarde
    creerElementSauvegarde(save) {
        const date = new Date(save.timestamp).toLocaleString('fr-FR');
        const size = this.formatFileSize(save.size);
        
        return `
            <div class="save-item" data-save-name="${save.name}">
                <div class="save-info">
                    <div class="save-name">${save.name}</div>
                    <div class="save-description">${save.description || 'Aucune description'}</div>
                    <div class="save-details">
                        <span class="save-player">${save.playerName} - Niveau ${save.playerLevel}</span>
                        <span class="save-date">${date}</span>
                        <span class="save-size">${size}</span>
                    </div>
                </div>
                <div class="save-actions">
                    <button class="save-btn small" onclick="imperiumSaveSystem.exporterSauvegarde('${save.name}')">
                        📤 Exporter
                    </button>
                    <button class="save-btn small danger" onclick="imperiumSaveSystem.confirmerSuppression('${save.name}')">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `;
    }

    // Formater la taille de fichier
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Actualiser la liste des sauvegardes
    actualiserListeSauvegardes() {
        const interface = document.querySelector('.save-management-interface');
        if (interface) {
            const newInterface = this.creerInterfaceSauvegarde();
            interface.replaceWith(newInterface);
        }
    }

    // Confirmer la suppression
    confirmerSuppression(slotName) {
        if (confirm(`Êtes-vous sûr de vouloir supprimer la sauvegarde "${slotName}" ?\n\nCette action est irréversible.`)) {
            this.supprimerSauvegarde(slotName).then(() => {
                this.actualiserListeSauvegardes();
            });
        }
    }
}

// Instance globale
window.imperiumSaveSystem = new ImperiumSaveSystem();

// Export des fonctions pour utilisation globale
if (typeof window !== 'undefined') {
    window.sauvegarderJeu = (slot, desc) => imperiumSaveSystem.sauvegarderJeu(slot, desc);
    window.supprimerSauvegarde = (slot) => imperiumSaveSystem.supprimerSauvegarde(slot);
    window.exporterSauvegarde = (slot) => imperiumSaveSystem.exporterSauvegarde(slot);
}

console.log('💾 Système de sauvegarde IMPERIUM chargé!');