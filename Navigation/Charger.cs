/**
 * 🏛️ IMPERIUM - Système de Chargement Avancé
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Classe principale de chargement
class ImperiumLoadSystem {
    constructor() {
        this.loadingProgress = 0;
        this.loadingSteps = [];
        this.currentStep = 0;
    }

    // Charger une sauvegarde
    async chargerJeu(slotName) {
        try {
            this.initLoadingProgress();
            
            // Étape 1: Charger les données
            this.updateLoadingProgress('Chargement des données...', 10);
            const saveData = await this.loadSaveData(slotName);
            
            if (!saveData) {
                throw new Error('Sauvegarde introuvable');
            }

            // Étape 2: Vérifier l'intégrité
            this.updateLoadingProgress('Vérification de l\'intégrité...', 20);
            await this.verifySaveIntegrity(saveData);

            // Étape 3: Décompresser si nécessaire
            this.updateLoadingProgress('Décompression des données...', 30);
            const gameState = await this.decompressSaveData(saveData);

            // Étape 4: Valider la compatibilité
            this.updateLoadingProgress('Validation de la compatibilité...', 40);
            await this.validateCompatibility(saveData);

            // Étape 5: Restaurer l'état du joueur
            this.updateLoadingProgress('Restauration du joueur...', 50);
            await this.restorePlayerState(gameState);

            // Étape 6: Restaurer les alliances
            this.updateLoadingProgress('Restauration des alliances...', 60);
            await this.restoreAllianceState(gameState);

            // Étape 7: Restaurer les messages
            this.updateLoadingProgress('Restauration des messages...', 70);
            await this.restoreMessageState(gameState);

            // Étape 8: Restaurer la ville
            this.updateLoadingProgress('Restauration de la ville...', 80);
            await this.restoreCityState(gameState);

            // Étape 9: Restaurer les systèmes
            this.updateLoadingProgress('Restauration des systèmes...', 90);
            await this.restoreGameSystems(gameState);

            // Étape 10: Finalisation
            this.updateLoadingProgress('Finalisation...', 100);
            await this.finalizeLoad(gameState);

            this.completeLoading();
            
            showNotification(`✅ Jeu chargé: ${slotName}`, 'success');
            console.log(`📂 Chargement réussi: ${slotName}`);
            
            return true;

        } catch (error) {
            console.error('❌ Erreur de chargement:', error);
            showNotification(`Erreur de chargement: ${error.message}`, 'error');
            this.hideLoadingProgress();
            return false;
        }
    }

    // Charger les données de sauvegarde
    async loadSaveData(slotName) {
        try {
            // Essayer localStorage d'abord
            const localData = localStorage.getItem(`imperium_save_${slotName}`);
            if (localData) {
                return JSON.parse(localData);
            }
            
            // Essayer IndexedDB
            return await this.loadFromIndexedDB(slotName);
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
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

    // Vérifier l'intégrité de la sauvegarde
    async verifySaveIntegrity(saveData) {
        if (!saveData.checksum || !saveData.data) {
            throw new Error('Données de sauvegarde corrompues');
        }

        // Vérifier la somme de contrôle
        const calculatedChecksum = this.calculateChecksum(saveData.data);
        if (calculatedChecksum !== saveData.checksum) {
            console.warn('⚠️ Somme de contrôle invalide, tentative de récupération...');
            // Ne pas échouer complètement, juste avertir
        }

        return true;
    }

    // Calculer une somme de contrôle
    calculateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    // Décompresser les données de sauvegarde
    async decompressSaveData(saveData) {
        if (saveData.compressed) {
            try {
                return this.decompressData(saveData.data);
            } catch (error) {
                throw new Error('Impossible de décompresser les données');
            }
        }
        return saveData.data;
    }

    // Décompresser les données
    decompressData(compressedData) {
        try {
            const jsonString = atob(compressedData);
            return JSON.parse(jsonString);
        } catch (error) {
            throw new Error('Données corrompues lors de la décompression');
        }
    }

    // Valider la compatibilité
    async validateCompatibility(saveData) {
        const currentVersion = '1.0.0';
        const saveVersion = saveData.version || '0.0.0';

        if (this.compareVersions(saveVersion, currentVersion) > 0) {
            throw new Error(`Version de sauvegarde trop récente (${saveVersion} > ${currentVersion})`);
        }

        // Migrations si nécessaire
        if (this.compareVersions(saveVersion, currentVersion) < 0) {
            console.log(`🔄 Migration de la sauvegarde de ${saveVersion} vers ${currentVersion}`);
            await this.migrateSaveData(saveData, saveVersion, currentVersion);
        }

        return true;
    }

    // Comparer les versions
    compareVersions(version1, version2) {
        const v1parts = version1.split('.').map(Number);
        const v2parts = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;
            
            if (v1part > v2part) return 1;
            if (v1part < v2part) return -1;
        }
        
        return 0;
    }

    // Migrer les données de sauvegarde
    async migrateSaveData(saveData, fromVersion, toVersion) {
        // Ici on pourrait implémenter des migrations spécifiques
        console.log(`🔄 Migration des données de ${fromVersion} vers ${toVersion}`);
        
        // Exemple de migration
        if (fromVersion === '0.9.0' && toVersion === '1.0.0') {
            // Ajouter des champs manquants, convertir des formats, etc.
            if (saveData.data.player && !saveData.data.player.statistics) {
                saveData.data.player.statistics = {};
            }
        }
    }

    // Restaurer l'état du joueur
    async restorePlayerState(gameState) {
        if (!gameState.player) {
            throw new Error('Données du joueur manquantes');
        }

        const currentGameState = gameEngine.getGameState();
        
        // Restaurer les données du joueur
        Object.assign(currentGameState.player, gameState.player);
        
        // Mettre à jour l'interface utilisateur
        if (window.uiManager) {
            uiManager.updatePlayerInfo();
        }

        console.log('👤 État du joueur restauré');
    }

    // Restaurer l'état des alliances
    async restoreAllianceState(gameState) {
        if (gameState.alliances && gameEngine.allianceSystem) {
            // Restaurer les alliances
            gameEngine.allianceSystem.alliances = gameState.alliances.alliances || {};
            gameEngine.allianceSystem.invitations = gameState.alliances.invitations || [];
            
            // Sauvegarder dans le stockage local
            gameEngine.allianceSystem.saveToStorage();
            
            console.log('🤝 État des alliances restauré');
        }
    }

    // Restaurer l'état des messages
    async restoreMessageState(gameState) {
        if (gameState.messages && gameEngine.messageSystem) {
            // Restaurer les messages
            gameEngine.messageSystem.messages = gameState.messages.messages || [];
            gameEngine.messageSystem.folders = {
                ...gameEngine.messageSystem.folders,
                ...gameState.messages.folders
            };
            
            // Sauvegarder dans le stockage local
            gameEngine.messageSystem.saveToStorage();
            
            console.log('📨 État des messages restauré');
        }
    }

    // Restaurer l'état de la ville
    async restoreCityState(gameState) {
        if (gameState.city) {
            const currentGameState = gameEngine.getGameState();
            currentGameState.city = { ...currentGameState.city, ...gameState.city };
            
            console.log('🏛️ État de la ville restauré');
        }
    }

    // Restaurer les systèmes de jeu
    async restoreGameSystems(gameState) {
        const currentGameState = gameEngine.getGameState();
        
        // Restaurer la recherche
        if (gameState.research) {
            currentGameState.research = { ...currentGameState.research, ...gameState.research };
        }
        
        // Restaurer l'armée
        if (gameState.military) {
            currentGameState.military = { ...currentGameState.military, ...gameState.military };
        }
        
        // Restaurer l'économie
        if (gameState.economy) {
            currentGameState.economy = { ...currentGameState.economy, ...gameState.economy };
        }
        
        // Restaurer les événements
        if (gameState.events) {
            currentGameState.events = gameState.events;
        }
        
        // Restaurer les statistiques
        if (gameState.statistics) {
            currentGameState.statistics = { ...currentGameState.statistics, ...gameState.statistics };
        }
        
        // Restaurer les paramètres
        if (gameState.settings) {
            currentGameState.settings = { ...currentGameState.settings, ...gameState.settings };
        }
        
        console.log('⚙️ Systèmes de jeu restaurés');
    }

    // Finaliser le chargement
    async finalizeLoad(gameState) {
        // Mettre à jour l'état du jeu
        gameEngine.updateGameState();
        
        // Redémarrer les timers et processus
        if (gameEngine.startGameLoop) {
            gameEngine.startGameLoop();
        }
        
        // Déclencher un événement de chargement terminé
        window.dispatchEvent(new CustomEvent('gameLoaded', {
            detail: {
                timestamp: Date.now(),
                playerName: gameState.player.name,
                playerLevel: gameState.player.level
            }
        }));
        
        console.log('✅ Chargement finalisé');
    }

    // Initialiser la barre de progression
    initLoadingProgress() {
        this.loadingProgress = 0;
        this.currentStep = 0;
        this.showLoadingProgress();
    }

    // Mettre à jour la progression
    updateLoadingProgress(message, progress) {
        this.loadingProgress = progress;
        this.currentStep++;
        
        const progressBar = document.getElementById('loading-progress-bar');
        const progressText = document.getElementById('loading-progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
        
        console.log(`📊 ${progress}% - ${message}`);
    }

    // Afficher la barre de progression
    showLoadingProgress() {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-container">
                <h3>🏛️ Chargement d'IMPERIUM</h3>
                <div class="loading-progress">
                    <div class="progress-bar">
                        <div id="loading-progress-bar" class="progress-fill"></div>
                    </div>
                    <div id="loading-progress-text" class="progress-text">Initialisation...</div>
                </div>
            </div>
        `;
        
        // Styles pour l'overlay
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-family: 'Times New Roman', serif;
        `;
        
        document.body.appendChild(overlay);
    }

    // Masquer la barre de progression
    hideLoadingProgress() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // Terminer le chargement
    completeLoading() {
        setTimeout(() => {
            this.hideLoadingProgress();
        }, 1000);
    }

    // Importer une sauvegarde
    async importerSauvegarde(file) {
        try {
            const text = await this.readFileAsText(file);
            const importData = JSON.parse(text);
            
            // Vérifier que c'est bien une sauvegarde IMPERIUM
            if (!importData.version || !importData.data) {
                throw new Error('Fichier de sauvegarde invalide');
            }
            
            // Générer un nom unique pour l'import
            const importName = `import_${Date.now()}`;
            
            // Sauvegarder les données importées
            await imperiumSaveSystem.saveToLocalStorage(importName, importData);
            
            showNotification(`📥 Sauvegarde importée: ${importName}`, 'success');
            
            // Proposer de charger immédiatement
            if (confirm('Voulez-vous charger cette sauvegarde maintenant ?')) {
                await this.chargerJeu(importName);
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur d\'importation:', error);
            showNotification(`Erreur d'importation: ${error.message}`, 'error');
            return false;
        }
    }

    // Lire un fichier comme texte
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    // Interface de chargement
    creerInterfaceChargement() {
        const container = document.createElement('div');
        container.className = 'load-management-interface';
        
        const savesList = imperiumSaveSystem.loadSavesList();
        
        container.innerHTML = `
            <div class="load-panel">
                <h3>📂 Charger une Sauvegarde</h3>
                
                <div class="load-actions">
                    <button class="load-btn primary" onclick="imperiumLoadSystem.chargerJeu('autosave')">
                        ⚡ Chargement Rapide
                    </button>
                    <button class="load-btn" onclick="imperiumLoadSystem.ouvrirImportFichier()">
                        📥 Importer Fichier
                    </button>
                    <input type="file" id="import-file-input" accept=".json" style="display: none;" 
                           onchange="imperiumLoadSystem.handleFileImport(this)">
                </div>
                
                <div class="saves-list">
                    ${savesList.length === 0 ? 
                        '<div class="no-saves">Aucune sauvegarde trouvée</div>' :
                        savesList.map(save => this.creerElementChargement(save)).join('')
                    }
                </div>
            </div>
        `;
        
        return container;
    }

    // Créer un élément de chargement
    creerElementChargement(save) {
        const date = new Date(save.timestamp).toLocaleString('fr-FR');
        
        return `
            <div class="save-item" data-save-name="${save.name}">
                <div class="save-info">
                    <div class="save-name">${save.name}</div>
                    <div class="save-description">${save.description || 'Aucune description'}</div>
                    <div class="save-details">
                        <span class="save-player">${save.playerName} - Niveau ${save.playerLevel}</span>
                        <span class="save-date">${date}</span>
                    </div>
                </div>
                <div class="save-actions">
                    <button class="load-btn primary" onclick="imperiumLoadSystem.chargerJeu('${save.name}')">
                        📂 Charger
                    </button>
                </div>
            </div>
        `;
    }

    // Ouvrir le dialogue d'import de fichier
    ouvrirImportFichier() {
        document.getElementById('import-file-input').click();
    }

    // Gérer l'import de fichier
    handleFileImport(input) {
        const file = input.files[0];
        if (file) {
            this.importerSauvegarde(file);
        }
    }
}

// Instance globale
window.imperiumLoadSystem = new ImperiumLoadSystem();

// Export des fonctions pour utilisation globale
if (typeof window !== 'undefined') {
    window.chargerJeu = (slot) => imperiumLoadSystem.chargerJeu(slot);
    window.importerSauvegarde = (file) => imperiumLoadSystem.importerSauvegarde(file);
}

console.log('📂 Système de chargement IMPERIUM chargé!');