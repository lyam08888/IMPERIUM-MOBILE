/**
 * 🏛️ IMPERIUM - Actions Rapides d'Alliance
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Classe principale pour les actions rapides d'alliance
class AllianceQuickActions {
    constructor() {
        this.cooldowns = new Map();
        this.actionHistory = [];
    }

    // Envoyer des ressources à un membre
    async envoyerRessources(memberId, ressources, message = '') {
        try {
            if (!this.verifierMembresAlliance(memberId)) {
                throw new Error('Ce joueur n\'est pas membre de votre alliance');
            }

            if (!this.verifierCooldown('send_resources', 5 * 60 * 1000)) { // 5 minutes
                throw new Error('Vous devez attendre avant d\'envoyer à nouveau des ressources');
            }

            const gameState = gameEngine.getGameState();
            const player = gameState.player;

            // Vérifier que le joueur a suffisamment de ressources
            for (const [type, amount] of Object.entries(ressources)) {
                if (player.resources[type] < amount) {
                    throw new Error(`Ressources insuffisantes: ${type}`);
                }
            }

            // Déduire les ressources du joueur
            for (const [type, amount] of Object.entries(ressources)) {
                player.resources[type] -= amount;
            }

            // Créer la transaction
            const transaction = {
                id: `trans_${Date.now()}`,
                type: 'resource_transfer',
                from: player.id,
                to: memberId,
                resources: ressources,
                message: message,
                timestamp: Date.now(),
                status: 'completed'
            };

            // Enregistrer dans l'historique de l'alliance
            this.enregistrerTransaction(transaction);

            // Envoyer un message au destinataire
            this.envoyerMessageRessources(memberId, ressources, message);

            // Mettre le cooldown
            this.setCooldown('send_resources');

            // Sauvegarder
            gameEngine.updateGameState();

            showNotification('✅ Ressources envoyées avec succès!', 'success');
            console.log('💰 Ressources envoyées:', transaction);

            return true;

        } catch (error) {
            console.error('❌ Erreur envoi ressources:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            return false;
        }
    }

    // Demander de l'aide à l'alliance
    async demanderAide(type, details = {}) {
        try {
            if (!this.verifierCooldown('request_help', 30 * 60 * 1000)) { // 30 minutes
                throw new Error('Vous devez attendre avant de demander de l\'aide à nouveau');
            }

            const gameState = gameEngine.getGameState();
            const player = gameState.player;
            const alliance = gameEngine.allianceSystem.alliances[player.alliance.id];

            if (!alliance) {
                throw new Error('Vous n\'êtes pas membre d\'une alliance');
            }

            // Créer la demande d'aide
            const helpRequest = {
                id: `help_${Date.now()}`,
                type: type,
                playerId: player.id,
                playerName: player.name,
                details: details,
                timestamp: Date.now(),
                status: 'active',
                responses: []
            };

            // Ajouter à la liste des demandes d'aide de l'alliance
            if (!alliance.helpRequests) {
                alliance.helpRequests = [];
            }
            alliance.helpRequests.unshift(helpRequest);

            // Limiter le nombre de demandes
            if (alliance.helpRequests.length > 50) {
                alliance.helpRequests = alliance.helpRequests.slice(0, 50);
            }

            // Notifier l'alliance
            this.notifierAllianceAide(alliance, helpRequest);

            // Mettre le cooldown
            this.setCooldown('request_help');

            // Sauvegarder
            gameEngine.allianceSystem.saveToStorage();

            showNotification('📢 Demande d\'aide envoyée à l\'alliance!', 'success');
            console.log('🆘 Demande d\'aide créée:', helpRequest);

            return true;

        } catch (error) {
            console.error('❌ Erreur demande aide:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            return false;
        }
    }

    // Répondre à une demande d'aide
    async repondreAide(helpRequestId, response, ressources = {}) {
        try {
            const gameState = gameEngine.getGameState();
            const player = gameState.player;
            const alliance = gameEngine.allianceSystem.alliances[player.alliance.id];

            if (!alliance || !alliance.helpRequests) {
                throw new Error('Demande d\'aide introuvable');
            }

            const helpRequest = alliance.helpRequests.find(req => req.id === helpRequestId);
            if (!helpRequest) {
                throw new Error('Demande d\'aide introuvable');
            }

            if (helpRequest.playerId === player.id) {
                throw new Error('Vous ne pouvez pas répondre à votre propre demande');
            }

            // Vérifier si le joueur a déjà répondu
            const existingResponse = helpRequest.responses.find(resp => resp.playerId === player.id);
            if (existingResponse) {
                throw new Error('Vous avez déjà répondu à cette demande');
            }

            // Si des ressources sont envoyées, les vérifier
            if (Object.keys(ressources).length > 0) {
                for (const [type, amount] of Object.entries(ressources)) {
                    if (player.resources[type] < amount) {
                        throw new Error(`Ressources insuffisantes: ${type}`);
                    }
                }

                // Déduire les ressources
                for (const [type, amount] of Object.entries(ressources)) {
                    player.resources[type] -= amount;
                }
            }

            // Ajouter la réponse
            helpRequest.responses.push({
                playerId: player.id,
                playerName: player.name,
                response: response,
                resources: ressources,
                timestamp: Date.now()
            });

            // Envoyer un message au demandeur
            this.envoyerMessageAideReponse(helpRequest.playerId, response, ressources);

            // Sauvegarder
            gameEngine.updateGameState();
            gameEngine.allianceSystem.saveToStorage();

            showNotification('✅ Réponse envoyée!', 'success');
            console.log('💬 Réponse à l\'aide envoyée');

            return true;

        } catch (error) {
            console.error('❌ Erreur réponse aide:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            return false;
        }
    }

    // Organiser un événement d'alliance
    async organiserEvenement(evenement) {
        try {
            if (!this.verifierPermissions('organize_events')) {
                throw new Error('Vous n\'avez pas les permissions pour organiser des événements');
            }

            if (!this.verifierCooldown('organize_event', 24 * 60 * 60 * 1000)) { // 24 heures
                throw new Error('Vous devez attendre avant d\'organiser un autre événement');
            }

            const gameState = gameEngine.getGameState();
            const player = gameState.player;
            const alliance = gameEngine.allianceSystem.alliances[player.alliance.id];

            // Créer l'événement
            const allianceEvent = {
                id: `event_${Date.now()}`,
                type: evenement.type,
                title: evenement.title,
                description: evenement.description,
                organizerId: player.id,
                organizerName: player.name,
                startTime: evenement.startTime,
                endTime: evenement.endTime,
                participants: [],
                rewards: evenement.rewards || {},
                requirements: evenement.requirements || {},
                status: 'scheduled',
                createdAt: Date.now()
            };

            // Ajouter à la liste des événements de l'alliance
            if (!alliance.events) {
                alliance.events = [];
            }
            alliance.events.unshift(allianceEvent);

            // Notifier l'alliance
            this.notifierAllianceEvenement(alliance, allianceEvent);

            // Mettre le cooldown
            this.setCooldown('organize_event');

            // Sauvegarder
            gameEngine.allianceSystem.saveToStorage();

            showNotification('🎉 Événement organisé avec succès!', 'success');
            console.log('🎊 Événement créé:', allianceEvent);

            return true;

        } catch (error) {
            console.error('❌ Erreur organisation événement:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            return false;
        }
    }

    // Participer à un événement
    async participerEvenement(eventId) {
        try {
            const gameState = gameEngine.getGameState();
            const player = gameState.player;
            const alliance = gameEngine.allianceSystem.alliances[player.alliance.id];

            const event = alliance.events.find(e => e.id === eventId);
            if (!event) {
                throw new Error('Événement introuvable');
            }

            if (event.status !== 'scheduled' && event.status !== 'active') {
                throw new Error('Cet événement n\'est plus disponible');
            }

            // Vérifier si déjà participant
            if (event.participants.some(p => p.playerId === player.id)) {
                throw new Error('Vous participez déjà à cet événement');
            }

            // Vérifier les prérequis
            if (event.requirements) {
                if (event.requirements.minLevel && player.level < event.requirements.minLevel) {
                    throw new Error(`Niveau minimum requis: ${event.requirements.minLevel}`);
                }
                
                if (event.requirements.resources) {
                    for (const [type, amount] of Object.entries(event.requirements.resources)) {
                        if (player.resources[type] < amount) {
                            throw new Error(`Ressources insuffisantes: ${type} (${amount} requis)`);
                        }
                    }
                }
            }

            // Déduire les ressources requises
            if (event.requirements.resources) {
                for (const [type, amount] of Object.entries(event.requirements.resources)) {
                    player.resources[type] -= amount;
                }
            }

            // Ajouter le participant
            event.participants.push({
                playerId: player.id,
                playerName: player.name,
                joinedAt: Date.now(),
                contribution: 0
            });

            // Sauvegarder
            gameEngine.updateGameState();
            gameEngine.allianceSystem.saveToStorage();

            showNotification('✅ Participation confirmée!', 'success');
            console.log('🎯 Participation à l\'événement confirmée');

            return true;

        } catch (error) {
            console.error('❌ Erreur participation événement:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            return false;
        }
    }

    // Vérifier les permissions
    verifierPermissions(action) {
        const gameState = gameEngine.getGameState();
        const player = gameState.player;
        
        if (!player.alliance) return false;
        
        const alliance = gameEngine.allianceSystem.alliances[player.alliance.id];
        if (!alliance) return false;
        
        const member = alliance.members[player.id];
        if (!member) return false;
        
        // Les fondateurs et officiers ont toutes les permissions
        if (member.role === 'Imperator' || member.role === 'Legatus') {
            return true;
        }
        
        // Permissions spécifiques par action
        const permissions = {
            'organize_events': ['Imperator', 'Legatus'],
            'manage_treasury': ['Imperator', 'Legatus'],
            'invite_members': ['Imperator', 'Legatus', 'Centurio'],
            'kick_members': ['Imperator', 'Legatus']
        };
        
        return permissions[action] && permissions[action].includes(member.role);
    }

    // Vérifier les cooldowns
    verifierCooldown(action, duration) {
        const lastAction = this.cooldowns.get(action);
        if (!lastAction) return true;
        
        return Date.now() - lastAction >= duration;
    }

    // Définir un cooldown
    setCooldown(action) {
        this.cooldowns.set(action, Date.now());
    }

    // Vérifier si un joueur est membre de l'alliance
    verifierMembresAlliance(memberId) {
        const gameState = gameEngine.getGameState();
        const player = gameState.player;
        
        if (!player.alliance) return false;
        
        const alliance = gameEngine.allianceSystem.alliances[player.alliance.id];
        return alliance && alliance.members[memberId];
    }

    // Enregistrer une transaction
    enregistrerTransaction(transaction) {
        const gameState = gameEngine.getGameState();
        const alliance = gameEngine.allianceSystem.alliances[gameState.player.alliance.id];
        
        if (!alliance.transactions) {
            alliance.transactions = [];
        }
        
        alliance.transactions.unshift(transaction);
        
        // Limiter l'historique
        if (alliance.transactions.length > 100) {
            alliance.transactions = alliance.transactions.slice(0, 100);
        }
    }

    // Envoyer un message pour les ressources
    envoyerMessageRessources(destinataireId, ressources, message) {
        if (!gameEngine.messageSystem) return;
        
        const gameState = gameEngine.getGameState();
        const ressourcesText = Object.entries(ressources)
            .map(([type, amount]) => `${amount} ${type}`)
            .join(', ');
        
        const messageObj = {
            id: `msg_${Date.now()}`,
            from: gameState.player.id,
            fromName: gameState.player.name,
            to: destinataireId,
            subject: '💰 Ressources reçues de votre alliance',
            content: `Vous avez reçu ${ressourcesText} de ${gameState.player.name}.\n\n${message ? `Message: ${message}` : ''}`,
            timestamp: Date.now(),
            read: false,
            type: 'alliance_resources'
        };
        
        gameEngine.messageSystem.messages.push(messageObj);
        gameEngine.messageSystem.saveToStorage();
    }

    // Envoyer un message de réponse à l'aide
    envoyerMessageAideReponse(destinataireId, response, ressources) {
        if (!gameEngine.messageSystem) return;
        
        const gameState = gameEngine.getGameState();
        let content = `${gameState.player.name} a répondu à votre demande d'aide:\n\n${response}`;
        
        if (Object.keys(ressources).length > 0) {
            const ressourcesText = Object.entries(ressources)
                .map(([type, amount]) => `${amount} ${type}`)
                .join(', ');
            content += `\n\nRessources envoyées: ${ressourcesText}`;
        }
        
        const messageObj = {
            id: `msg_${Date.now()}`,
            from: gameState.player.id,
            fromName: gameState.player.name,
            to: destinataireId,
            subject: '🆘 Réponse à votre demande d\'aide',
            content: content,
            timestamp: Date.now(),
            read: false,
            type: 'alliance_help'
        };
        
        gameEngine.messageSystem.messages.push(messageObj);
        gameEngine.messageSystem.saveToStorage();
    }

    // Notifier l'alliance d'une demande d'aide
    notifierAllianceAide(alliance, helpRequest) {
        if (!alliance.notifications) {
            alliance.notifications = [];
        }
        
        alliance.notifications.unshift({
            id: `notif_${Date.now()}`,
            type: 'help_request',
            title: 'Demande d\'Aide',
            message: `${helpRequest.playerName} demande de l'aide: ${helpRequest.type}`,
            timestamp: Date.now(),
            read: false,
            data: { helpRequestId: helpRequest.id }
        });
    }

    // Notifier l'alliance d'un événement
    notifierAllianceEvenement(alliance, event) {
        if (!alliance.notifications) {
            alliance.notifications = [];
        }
        
        alliance.notifications.unshift({
            id: `notif_${Date.now()}`,
            type: 'alliance_event',
            title: 'Nouvel Événement',
            message: `${event.organizerName} a organisé: ${event.title}`,
            timestamp: Date.now(),
            read: false,
            data: { eventId: event.id }
        });
    }

    // Interface des actions rapides
    creerInterfaceActionsRapides() {
        const container = document.createElement('div');
        container.className = 'quick-actions-interface';
        
        container.innerHTML = `
            <div class="quick-actions-panel">
                <h3>⚡ Actions Rapides</h3>
                
                <div class="actions-grid">
                    <button class="quick-action-btn" onclick="allianceQuickActions.ouvrirEnvoiRessources()">
                        💰 Envoyer Ressources
                    </button>
                    
                    <button class="quick-action-btn" onclick="allianceQuickActions.ouvrirDemandeAide()">
                        🆘 Demander Aide
                    </button>
                    
                    <button class="quick-action-btn" onclick="allianceQuickActions.ouvrirEvenements()">
                        🎉 Événements
                    </button>
                    
                    <button class="quick-action-btn" onclick="allianceQuickActions.ouvrirHistorique()">
                        📊 Historique
                    </button>
                </div>
                
                <div id="quick-actions-content" class="actions-content">
                    <!-- Contenu dynamique -->
                </div>
            </div>
        `;
        
        return container;
    }

    // Ouvrir l'interface d'envoi de ressources
    ouvrirEnvoiRessources() {
        const content = document.getElementById('quick-actions-content');
        if (!content) return;
        
        const gameState = gameEngine.getGameState();
        const alliance = gameEngine.allianceSystem.alliances[gameState.player.alliance.id];
        const membres = Object.values(alliance.members).filter(m => m.id !== gameState.player.id);
        
        content.innerHTML = `
            <div class="send-resources-form">
                <h4>💰 Envoyer des Ressources</h4>
                
                <div class="form-group">
                    <label>Destinataire:</label>
                    <select id="resource-recipient" class="form-input">
                        ${membres.map(member => 
                            `<option value="${member.id}">${member.name}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="resources-inputs">
                    <div class="resource-input">
                        <label>🪙 Or:</label>
                        <input type="number" id="send-gold" min="0" max="${gameState.player.resources.gold || 0}" value="0">
                        <small>Disponible: ${(gameState.player.resources.gold || 0).toLocaleString()}</small>
                    </div>
                    
                    <div class="resource-input">
                        <label>🌾 Nourriture:</label>
                        <input type="number" id="send-food" min="0" max="${gameState.player.resources.food || 0}" value="0">
                        <small>Disponible: ${(gameState.player.resources.food || 0).toLocaleString()}</small>
                    </div>
                    
                    <div class="resource-input">
                        <label>🪨 Pierre:</label>
                        <input type="number" id="send-stone" min="0" max="${gameState.player.resources.stone || 0}" value="0">
                        <small>Disponible: ${(gameState.player.resources.stone || 0).toLocaleString()}</small>
                    </div>
                    
                    <div class="resource-input">
                        <label>🪵 Bois:</label>
                        <input type="number" id="send-wood" min="0" max="${gameState.player.resources.wood || 0}" value="0">
                        <small>Disponible: ${(gameState.player.resources.wood || 0).toLocaleString()}</small>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Message (optionnel):</label>
                    <textarea id="send-message" class="form-input" placeholder="Message d'accompagnement..."></textarea>
                </div>
                
                <div class="form-actions">
                    <button class="quick-action-btn primary" onclick="allianceQuickActions.confirmerEnvoiRessources()">
                        💰 Envoyer
                    </button>
                    <button class="quick-action-btn secondary" onclick="allianceQuickActions.fermerContenu()">
                        ❌ Annuler
                    </button>
                </div>
            </div>
        `;
    }

    // Confirmer l'envoi de ressources
    confirmerEnvoiRessources() {
        const recipient = document.getElementById('resource-recipient').value;
        const message = document.getElementById('send-message').value;
        
        const ressources = {
            gold: parseInt(document.getElementById('send-gold').value) || 0,
            food: parseInt(document.getElementById('send-food').value) || 0,
            stone: parseInt(document.getElementById('send-stone').value) || 0,
            wood: parseInt(document.getElementById('send-wood').value) || 0
        };
        
        // Filtrer les ressources à 0
        Object.keys(ressources).forEach(key => {
            if (ressources[key] === 0) {
                delete ressources[key];
            }
        });
        
        if (Object.keys(ressources).length === 0) {
            showNotification('❌ Vous devez envoyer au moins une ressource', 'error');
            return;
        }
        
        this.envoyerRessources(recipient, ressources, message).then(success => {
            if (success) {
                this.fermerContenu();
            }
        });
    }

    // Fermer le contenu
    fermerContenu() {
        const content = document.getElementById('quick-actions-content');
        if (content) {
            content.innerHTML = '';
        }
    }
}

// Instance globale
window.allianceQuickActions = new AllianceQuickActions();

// Export des fonctions pour utilisation globale
if (typeof window !== 'undefined') {
    window.envoyerRessources = (memberId, ressources, message) => 
        allianceQuickActions.envoyerRessources(memberId, ressources, message);
    window.demanderAide = (type, details) => 
        allianceQuickActions.demanderAide(type, details);
    window.repondreAide = (helpRequestId, response, ressources) => 
        allianceQuickActions.repondreAide(helpRequestId, response, ressources);
    window.organiserEvenement = (evenement) => 
        allianceQuickActions.organiserEvenement(evenement);
    window.participerEvenement = (eventId) => 
        allianceQuickActions.participerEvenement(eventId);
}

console.log('⚡ Système d\'actions rapides d\'alliance chargé!');