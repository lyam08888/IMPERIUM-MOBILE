/**
 * IMPERIUM - 
 * TransformÃ© de C# vers JavaScript pour intÃ©gration complÃ¨te
 */

// Fonction principale pour 
function recruterTroupes(typeUnite, quantite) {
    try {
        console.log(' - DÃ©but');
        
        // VÃ©rifications prÃ©liminaires
        if (!window.gameEngine) {
            console.error('Moteur de jeu non initialisÃ©');
            showNotification('Erreur: Moteur de jeu non disponible', 'error');
            return false;
        }

        const gameState = gameEngine.getGameState();
        const player = gameState.player;

        if (!player) {
            showNotification('DonnÃ©es joueur non disponibles', 'error');
            return false;
        }

        // VÃ©rifications spÃ©cifiques Ã  la catÃ©gorie
        if (!gameState.military) {
            showNotification('SystÃ¨me militaire non disponible', 'error');
            return false;
        }
        
        if (!gameState.military.units) {
            showNotification('DonnÃ©es d''unitÃ©s militaires non disponibles', 'error');
            return false;
        }

        // Actions spÃ©cifiques
        // VÃ©rifier les paramÃ¨tres
        if (!typeUnite || !quantite) {
            showNotification('ParamÃ¨tres de recrutement manquants', 'error');
            return false;
        }
        
        // Calculer le coÃ»t
        const coutParUnite = gameState.military.unitCosts[typeUnite] || 50;
        const coutTotal = coutParUnite * quantite;
        
        if (gameState.resources.gold < coutTotal) {
            showNotification('Ressources insuffisantes pour le recrutement', 'warning');
            return false;
        }
        
        // Effectuer le recrutement
        gameState.resources.gold -= coutTotal;
        if (!gameState.military.units[typeUnite]) {
            gameState.military.units[typeUnite] = 0;
        }
        gameState.military.units[typeUnite] += quantite;
        
        console.log('Recrutement effectuÃ©:', quantite, typeUnite);
        
        // SuccÃ¨s
        console.log(' - TerminÃ© avec succÃ¨s');
        showNotification(' rÃ©ussie', 'success');
        
        // Sauvegarder l'Ã©tat si nÃ©cessaire
        if (gameEngine.saveSystem) {
            gameEngine.saveSystem.sauvegarderJeu('autosave', '');
        }
        
        // Mettre Ã  jour l'interface si nÃ©cessaire
        if (typeof updateGameUI === 'function') {
            updateGameUI();
        }
        
        return true;

    } catch (error) {
        console.error('Erreur lors de :', error);
        showNotification('Erreur: ' + error.message, 'error');
        return false;
    }
}

// Fonction d'interface utilisateur
function creerInterfaceRecruterTroupes() {
    const container = document.createElement('div');
    container.className = 'recrutertroupes-interface';
    
    container.innerHTML = `
        <div class="action-panel">
            <h3></h3>
            <div class="action-content">
                <p>Interface pour </p>
                <div class="action-details">
                    <!-- TODO: Ajouter les Ã©lÃ©ments d'interface spÃ©cifiques -->
                    <div class="info-section">
                        <p>FonctionnalitÃ©: </p>
                        <p>CatÃ©gorie: Militaire</p>
                    </div>
                </div>
            </div>
            <div class="action-buttons">
                <button class="btn primary" onclick="recruterTroupes(typeUnite, quantite)">
                    ExÃ©cuter
                </button>
                <button class="btn secondary" onclick="fermerInterface()">
                    Annuler
                </button>
            </div>
        </div>
    `;
    
    return container;
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
    window.recruterTroupes = recruterTroupes;
    window.creerInterfaceRecruterTroupes = creerInterfaceRecruterTroupes;
}

console.log('Module recruterTroupes chargÃ©');
