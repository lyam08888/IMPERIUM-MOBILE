/**
 * 🏛️ IMPERIUM - Fonction de Fondation d'Alliance
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Fonction principale pour fonder une alliance
function fonderAlliance(nomAlliance, description = '', tagAlliance = '') {
    try {
        // Vérifications préliminaires
        if (!window.gameEngine || !window.gameEngine.allianceSystem) {
            console.error('❌ Système d\'alliance non initialisé');
            showNotification('Erreur: Système d\'alliance non disponible', 'error');
            return false;
        }

        const gameState = gameEngine.getGameState();
        const player = gameState.player;

        // Vérifier que le joueur n'est pas déjà dans une alliance
        if (player.alliance && player.alliance.id) {
            showNotification('❌ Vous êtes déjà membre d\'une alliance', 'warning');
            return false;
        }

        // Validation des paramètres
        if (!nomAlliance || nomAlliance.trim() === '') {
            showNotification('❌ Le nom de l\'alliance est requis', 'warning');
            return false;
        }

        // Nettoyer et valider le nom
        const cleanName = nomAlliance.trim().substring(0, 50);
        const cleanTag = tagAlliance.trim().substring(0, 6).toUpperCase();
        const cleanDescription = description.trim().substring(0, 500);

        // Vérifier que le nom n'est pas déjà pris
        if (verifierNomAllianceExiste(cleanName)) {
            showNotification('❌ Ce nom d\'alliance est déjà utilisé', 'error');
            return false;
        }

        // Vérifier que le tag n'est pas déjà pris (si fourni)
        if (cleanTag && verifierTagAllianceExiste(cleanTag)) {
            showNotification('❌ Ce tag d\'alliance est déjà utilisé', 'error');
            return false;
        }

        // Vérifier les ressources nécessaires pour fonder une alliance
        const coutFondation = {
            gold: 10000,
            wood: 5000,
            stone: 5000,
            iron: 2000
        };

        if (!verifierRessourcesSuffisantes(player.resources, coutFondation)) {
            showNotification('❌ Ressources insuffisantes pour fonder une alliance', 'error');
            afficherCoutFondation(coutFondation);
            return false;
        }

        // Créer l'alliance
        const nouvelleAlliance = creerNouvelleAlliance(cleanName, cleanDescription, cleanTag, player);

        // Déduire les ressources
        deduireRessources(player.resources, coutFondation);

        // Ajouter le joueur comme fondateur
        ajouterJoueurAlliance(nouvelleAlliance.id, player.id, 'Imperator');

        // Mettre à jour l'état du jeu
        gameEngine.updateGameState();

        // Sauvegarder automatiquement
        if (gameEngine.saveSystem) {
            gameEngine.saveSystem.saveGame('autosave', 'Alliance fondée');
        }

        showNotification(`✅ Alliance "${cleanName}" fondée avec succès!`, 'success');
        
        // Rediriger vers la page d'alliance
        setTimeout(() => {
            window.location.href = '../Alliance.html';
        }, 2000);

        console.log('🏛️ Alliance fondée:', nouvelleAlliance);
        return true;

    } catch (error) {
        console.error('❌ Erreur lors de la fondation:', error);
        showNotification(`Erreur lors de la fondation: ${error.message}`, 'error');
        return false;
    }
}

// Vérifier si un nom d'alliance existe déjà
function verifierNomAllianceExiste(nom) {
    try {
        const alliances = gameEngine.allianceSystem.alliances;
        return Object.values(alliances).some(alliance => 
            alliance.name.toLowerCase() === nom.toLowerCase()
        );
    } catch (error) {
        console.error('❌ Erreur lors de la vérification du nom:', error);
        return false;
    }
}

// Vérifier si un tag d'alliance existe déjà
function verifierTagAllianceExiste(tag) {
    try {
        if (!tag) return false;
        const alliances = gameEngine.allianceSystem.alliances;
        return Object.values(alliances).some(alliance => 
            alliance.tag && alliance.tag.toLowerCase() === tag.toLowerCase()
        );
    } catch (error) {
        console.error('❌ Erreur lors de la vérification du tag:', error);
        return false;
    }
}

// Vérifier si le joueur a suffisamment de ressources
function verifierRessourcesSuffisantes(ressourcesJoueur, coutRequis) {
    for (const [ressource, quantite] of Object.entries(coutRequis)) {
        if (!ressourcesJoueur[ressource] || ressourcesJoueur[ressource] < quantite) {
            return false;
        }
    }
    return true;
}

// Afficher le coût de fondation
function afficherCoutFondation(cout) {
    const coutText = Object.entries(cout)
        .map(([res, amount]) => `${res}: ${amount}`)
        .join(', ');
    
    showNotification(`💰 Coût de fondation: ${coutText}`, 'info');
}

// Créer une nouvelle alliance
function creerNouvelleAlliance(nom, description, tag, fondateur) {
    const allianceId = `alliance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const nouvelleAlliance = {
        id: allianceId,
        name: nom,
        description: description,
        tag: tag,
        founderId: fondateur.id,
        founderName: fondateur.name,
        createdAt: Date.now(),
        level: 1,
        experience: 0,
        members: {},
        maxMembers: 10, // Niveau 1 = 10 membres max
        treasury: {
            gold: 0,
            wood: 0,
            stone: 0,
            iron: 0,
            food: 0
        },
        bonuses: {
            productionBonus: 0.05, // 5% de bonus de production niveau 1
            defenseBonus: 0.02,    // 2% de bonus de défense niveau 1
            researchBonus: 0.03    // 3% de bonus de recherche niveau 1
        },
        diplomacy: {
            wars: [],
            allies: [],
            nonAggressionPacts: []
        },
        events: [],
        settings: {
            joinPolicy: 'request', // 'open', 'request', 'invite'
            language: 'fr',
            timezone: 'Europe/Paris'
        }
    };

    // Ajouter l'alliance au système
    gameEngine.allianceSystem.alliances[allianceId] = nouvelleAlliance;
    
    return nouvelleAlliance;
}

// Déduire les ressources du joueur
function deduireRessources(ressourcesJoueur, cout) {
    for (const [ressource, quantite] of Object.entries(cout)) {
        ressourcesJoueur[ressource] -= quantite;
    }
}

// Ajouter un joueur à l'alliance
function ajouterJoueurAlliance(allianceId, playerId, role = 'Civis') {
    const alliance = gameEngine.allianceSystem.alliances[allianceId];
    const gameState = gameEngine.getGameState();
    
    if (!alliance) {
        throw new Error('Alliance introuvable');
    }

    // Ajouter le membre à l'alliance
    alliance.members[playerId] = {
        id: playerId,
        name: gameState.player.name,
        role: role,
        joinedAt: Date.now(),
        contribution: {
            resources: 0,
            battles: 0,
            buildings: 0
        },
        lastActive: Date.now()
    };

    // Mettre à jour les informations du joueur
    gameState.player.alliance = {
        id: allianceId,
        name: alliance.name,
        role: role,
        joinedAt: Date.now()
    };

    // Ajouter un événement à l'alliance
    alliance.events.unshift({
        id: `event_${Date.now()}`,
        type: 'member_joined',
        message: `${gameState.player.name} a ${role === 'Imperator' ? 'fondé' : 'rejoint'} l'alliance`,
        timestamp: Date.now(),
        playerId: playerId
    });
}

// Interface pour la fondation d'alliance
function creerInterfaceFondation() {
    const container = document.createElement('div');
    container.className = 'alliance-creation-interface';
    container.innerHTML = `
        <div class="creation-panel">
            <h3>🏛️ Fonder une Alliance</h3>
            
            <form id="alliance-creation-form" onsubmit="return soumettreFormulaireFondation(event)">
                <div class="form-group">
                    <label class="form-label" for="alliance-name">Nom de l'Alliance *</label>
                    <input type="text" id="alliance-name" class="form-input" 
                           placeholder="Ex: Legio Romana" maxlength="50" required>
                    <small class="form-help">Maximum 50 caractères</small>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="alliance-tag">Tag (Optionnel)</label>
                    <input type="text" id="alliance-tag" class="form-input" 
                           placeholder="Ex: SPQR" maxlength="6" style="text-transform: uppercase;">
                    <small class="form-help">Maximum 6 caractères, sera affiché en majuscules</small>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="alliance-description">Description</label>
                    <textarea id="alliance-description" class="form-input form-textarea" 
                              placeholder="Décrivez votre alliance, ses objectifs, sa philosophie..." 
                              maxlength="500" rows="4"></textarea>
                    <small class="form-help">Maximum 500 caractères</small>
                </div>
                
                <div class="cost-display">
                    <h4>💰 Coût de Fondation</h4>
                    <div class="cost-resources">
                        <div class="cost-item">
                            <span class="resource-icon">🏛️</span>
                            <span>10,000 Or</span>
                        </div>
                        <div class="cost-item">
                            <span class="resource-icon">🌳</span>
                            <span>5,000 Bois</span>
                        </div>
                        <div class="cost-item">
                            <span class="resource-icon">🗿</span>
                            <span>5,000 Pierre</span>
                        </div>
                        <div class="cost-item">
                            <span class="resource-icon">⚔️</span>
                            <span>2,000 Fer</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="alliance-btn primary">
                        🏛️ Fonder l'Alliance
                    </button>
                    <button type="button" class="alliance-btn secondary" onclick="annulerFondation()">
                        ❌ Annuler
                    </button>
                </div>
            </form>
        </div>
    `;
    
    return container;
}

// Soumettre le formulaire de fondation
function soumettreFormulaireFondation(event) {
    event.preventDefault();
    
    const nom = document.getElementById('alliance-name').value;
    const tag = document.getElementById('alliance-tag').value;
    const description = document.getElementById('alliance-description').value;
    
    return fonderAlliance(nom, description, tag);
}

// Annuler la fondation
function annulerFondation() {
    if (confirm('Êtes-vous sûr de vouloir annuler la fondation de l\'alliance ?')) {
        window.history.back();
    }
}

// Valider le nom d'alliance en temps réel
function validerNomAlliance(input) {
    const nom = input.value.trim();
    const feedback = document.getElementById('name-feedback');
    
    if (!feedback) return;
    
    if (nom.length === 0) {
        feedback.textContent = '';
        return;
    }
    
    if (nom.length < 3) {
        feedback.textContent = '❌ Le nom doit contenir au moins 3 caractères';
        feedback.className = 'form-feedback error';
        return;
    }
    
    if (verifierNomAllianceExiste(nom)) {
        feedback.textContent = '❌ Ce nom est déjà utilisé';
        feedback.className = 'form-feedback error';
        return;
    }
    
    feedback.textContent = '✅ Nom disponible';
    feedback.className = 'form-feedback success';
}

// Export des fonctions pour utilisation globale
if (typeof window !== 'undefined') {
    window.fonderAlliance = fonderAlliance;
    window.verifierNomAllianceExiste = verifierNomAllianceExiste;
    window.verifierTagAllianceExiste = verifierTagAllianceExiste;
    window.creerInterfaceFondation = creerInterfaceFondation;
    window.soumettreFormulaireFondation = soumettreFormulaireFondation;
    window.annulerFondation = annulerFondation;
    window.validerNomAlliance = validerNomAlliance;
}

console.log('🏛️ Système de fondation d\'alliance chargé!');