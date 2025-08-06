/**
 * 🏛️ IMPERIUM - Chat d'Alliance
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Classe principale pour le chat d'alliance
class AllianceChatSystem {
    constructor() {
        this.maxMessages = 100;
        this.messageHistory = [];
        this.typingUsers = new Set();
        this.lastMessageTime = 0;
        this.chatCooldown = 2000; // 2 secondes entre les messages
    }

    // Envoyer un message dans le chat d'alliance
    async envoyerMessage(contenu, type = 'normal') {
        try {
            const gameState = gameEngine.getGameState();
            const player = gameState.player;

            if (!player.alliance) {
                throw new Error('Vous n\'êtes pas membre d\'une alliance');
            }

            const alliance = gameEngine.allianceSystem.alliances[player.alliance.id];
            if (!alliance) {
                throw new Error('Alliance introuvable');
            }

            // Vérifier le cooldown
            const maintenant = Date.now();
            if (maintenant - this.lastMessageTime < this.chatCooldown) {
                throw new Error('Vous envoyez des messages trop rapidement');
            }

            // Valider le contenu
            contenu = contenu.trim();
            if (!contenu) {
                throw new Error('Le message ne peut pas être vide');
            }

            if (contenu.length > 500) {
                throw new Error('Le message est trop long (max 500 caractères)');
            }

            // Filtrer le contenu (basique)
            contenu = this.filtrerContenu(contenu);

            // Créer le message
            const message = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                playerId: player.id,
                playerName: player.name,
                playerRole: this.obtenirRoleJoueur(alliance, player.id),
                contenu: contenu,
                type: type,
                timestamp: maintenant,
                edited: false,
                reactions: {}
            };

            // Ajouter le message au chat de l'alliance
            if (!alliance.chat) {
                alliance.chat = [];
            }

            alliance.chat.push(message);

            // Limiter l'historique
            if (alliance.chat.length > this.maxMessages) {
                alliance.chat = alliance.chat.slice(-this.maxMessages);
            }

            // Mettre à jour le timestamp du dernier message
            this.lastMessageTime = maintenant;

            // Sauvegarder
            gameEngine.allianceSystem.saveToStorage();

            // Mettre à jour l'interface
            this.mettreAJourInterfaceChat();

            console.log('💬 Message envoyé au chat d\'alliance');
            return true;

        } catch (error) {
            console.error('❌ Erreur envoi message chat:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            return false;
        }
    }

    // Obtenir le rôle d'un joueur
    obtenirRoleJoueur(alliance, playerId) {
        const member = alliance.members[playerId];
        return member ? member.role : 'Inconnu';
    }

    // Filtrer le contenu (censure basique)
    filtrerContenu(contenu) {
        // Liste de mots à filtrer (exemple basique)
        const motsInterdits = ['spam', 'hack', 'cheat'];
        
        let contenuFiltre = contenu;
        motsInterdits.forEach(mot => {
            const regex = new RegExp(mot, 'gi');
            contenuFiltre = contenuFiltre.replace(regex, '*'.repeat(mot.length));
        });
        
        return contenuFiltre;
    }

    // Modifier un message
    async modifierMessage(messageId, nouveauContenu) {
        try {
            const gameState = gameEngine.getGameState();
            const player = gameState.player;
            const alliance = gameEngine.allianceSystem.alliances[player.alliance.id];

            if (!alliance || !alliance.chat) {
                throw new Error('Chat d\'alliance introuvable');
            }

            const message = alliance.chat.find(msg => msg.id === messageId);
            if (!message) {
                throw new Error('Message introuvable');
            }

            // Vérifier que c'est le bon joueur ou un modérateur
            if (message.playerId !== player.id && !this.estModerateur(alliance, player.id)) {
                throw new Error('Vous ne pouvez pas modifier ce message');
            }

            // Vérifier le délai de modification (5 minutes)
            const delaiModification = 5 * 60 * 1000;
            if (Date.now() - message.timestamp > delaiModification) {
                throw new Error('Délai de modification dépassé');
            }

            // Valider le nouveau contenu
            nouveauContenu = nouveauContenu.trim();
            if (!nouveauContenu) {
                throw new Error('Le message ne peut pas être vide');
            }

            nouveauContenu = this.filtrerContenu(nouveauContenu);

            // Modifier le message
            message.contenu = nouveauContenu;
            message.edited = true;
            message.editedAt = Date.now();

            // Sauvegarder
            gameEngine.allianceSystem.saveToStorage();

            // Mettre à jour l'interface
            this.mettreAJourInterfaceChat();

            return true;

        } catch (error) {
            console.error('❌ Erreur modification message:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            return false;
        }
    }

    // Supprimer un message
    async supprimerMessage(messageId) {
        try {
            const gameState = gameEngine.getGameState();
            const player = gameState.player;
            const alliance = gameEngine.allianceSystem.alliances[player.alliance.id];

            if (!alliance || !alliance.chat) {
                throw new Error('Chat d\'alliance introuvable');
            }

            const messageIndex = alliance.chat.findIndex(msg => msg.id === messageId);
            if (messageIndex === -1) {
                throw new Error('Message introuvable');
            }

            const message = alliance.chat[messageIndex];

            // Vérifier les permissions
            if (message.playerId !== player.id && !this.estModerateur(alliance, player.id)) {
                throw new Error('Vous ne pouvez pas supprimer ce message');
            }

            // Supprimer le message
            alliance.chat.splice(messageIndex, 1);

            // Sauvegarder
            gameEngine.allianceSystem.saveToStorage();

            // Mettre à jour l'interface
            this.mettreAJourInterfaceChat();

            return true;

        } catch (error) {
            console.error('❌ Erreur suppression message:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            return false;
        }
    }

    // Ajouter une réaction à un message
    async ajouterReaction(messageId, emoji) {
        try {
            const gameState = gameEngine.getGameState();
            const player = gameState.player;
            const alliance = gameEngine.allianceSystem.alliances[player.alliance.id];

            if (!alliance || !alliance.chat) {
                throw new Error('Chat d\'alliance introuvable');
            }

            const message = alliance.chat.find(msg => msg.id === messageId);
            if (!message) {
                throw new Error('Message introuvable');
            }

            // Initialiser les réactions si nécessaire
            if (!message.reactions) {
                message.reactions = {};
            }

            if (!message.reactions[emoji]) {
                message.reactions[emoji] = [];
            }

            // Vérifier si le joueur a déjà réagi avec cet emoji
            const dejaReagi = message.reactions[emoji].includes(player.id);
            
            if (dejaReagi) {
                // Retirer la réaction
                message.reactions[emoji] = message.reactions[emoji].filter(id => id !== player.id);
                if (message.reactions[emoji].length === 0) {
                    delete message.reactions[emoji];
                }
            } else {
                // Ajouter la réaction
                message.reactions[emoji].push(player.id);
            }

            // Sauvegarder
            gameEngine.allianceSystem.saveToStorage();

            // Mettre à jour l'interface
            this.mettreAJourInterfaceChat();

            return true;

        } catch (error) {
            console.error('❌ Erreur réaction message:', error);
            return false;
        }
    }

    // Vérifier si un joueur est modérateur
    estModerateur(alliance, playerId) {
        const member = alliance.members[playerId];
        return member && (member.role === 'Imperator' || member.role === 'Legatus');
    }

    // Obtenir l'historique du chat
    obtenirHistoriqueChat(allianceId, limite = 50) {
        const alliance = gameEngine.allianceSystem.alliances[allianceId];
        if (!alliance || !alliance.chat) {
            return [];
        }

        return alliance.chat.slice(-limite).reverse();
    }

    // Interface du chat d'alliance
    creerInterfaceChat() {
        const container = document.createElement('div');
        container.className = 'alliance-chat-interface';
        container.id = 'alliance-chat-container';
        
        container.innerHTML = `
            <div class="chat-panel">
                <div class="chat-header">
                    <h3>💬 Chat d'Alliance</h3>
                    <div class="chat-controls">
                        <button class="chat-btn" onclick="allianceChatSystem.actualiserChat()">🔄</button>
                        <button class="chat-btn" onclick="allianceChatSystem.effacerChat()">🗑️</button>
                    </div>
                </div>
                
                <div class="chat-messages" id="chat-messages">
                    <!-- Messages générés dynamiquement -->
                </div>
                
                <div class="chat-typing" id="chat-typing" style="display: none;">
                    <span class="typing-indicator">Quelqu'un est en train d'écrire...</span>
                </div>
                
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <textarea id="chat-input" class="chat-input" 
                                  placeholder="Tapez votre message..." 
                                  maxlength="500" rows="2"
                                  onkeydown="allianceChatSystem.gererToucheClavier(event)"
                                  oninput="allianceChatSystem.gererSaisie()"></textarea>
                        <button class="chat-send-btn" onclick="allianceChatSystem.envoyerMessageInterface()">
                            📤
                        </button>
                    </div>
                    <div class="chat-input-info">
                        <span id="char-count">0/500</span>
                        <div class="chat-emojis">
                            <button class="emoji-btn" onclick="allianceChatSystem.ajouterEmoji('👍')">👍</button>
                            <button class="emoji-btn" onclick="allianceChatSystem.ajouterEmoji('❤️')">❤️</button>
                            <button class="emoji-btn" onclick="allianceChatSystem.ajouterEmoji('😂')">😂</button>
                            <button class="emoji-btn" onclick="allianceChatSystem.ajouterEmoji('⚔️')">⚔️</button>
                            <button class="emoji-btn" onclick="allianceChatSystem.ajouterEmoji('🏛️')">🏛️</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Charger les messages
        setTimeout(() => {
            this.chargerMessages();
        }, 100);
        
        return container;
    }

    // Charger les messages dans l'interface
    chargerMessages() {
        const gameState = gameEngine.getGameState();
        if (!gameState.player.alliance) return;
        
        const messages = this.obtenirHistoriqueChat(gameState.player.alliance.id);
        const container = document.getElementById('chat-messages');
        
        if (!container) return;
        
        container.innerHTML = messages.map(message => this.creerElementMessage(message)).join('');
        
        // Faire défiler vers le bas
        container.scrollTop = container.scrollHeight;
    }

    // Créer un élément de message
    creerElementMessage(message) {
        const date = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const roleColors = {
            'Imperator': '#FFD700',
            'Legatus': '#CD7F32',
            'Centurio': '#C0C0C0',
            'Civis': '#F8F8FF'
        };
        
        const roleColor = roleColors[message.playerRole] || '#F8F8FF';
        
        const reactions = message.reactions ? 
            Object.entries(message.reactions)
                .filter(([emoji, users]) => users.length > 0)
                .map(([emoji, users]) => 
                    `<span class="message-reaction" onclick="allianceChatSystem.ajouterReaction('${message.id}', '${emoji}')">
                        ${emoji} ${users.length}
                    </span>`
                ).join('') : '';
        
        return `
            <div class="chat-message" data-message-id="${message.id}">
                <div class="message-header">
                    <span class="message-author" style="color: ${roleColor}">
                        ${message.playerName}
                    </span>
                    <span class="message-role">[${message.playerRole}]</span>
                    <span class="message-time">${date}</span>
                    ${message.edited ? '<span class="message-edited">(modifié)</span>' : ''}
                </div>
                <div class="message-content">
                    ${this.formaterContenuMessage(message.contenu)}
                </div>
                ${reactions ? `<div class="message-reactions">${reactions}</div>` : ''}
                <div class="message-actions">
                    <button class="message-action-btn" onclick="allianceChatSystem.ajouterReaction('${message.id}', '👍')">👍</button>
                    <button class="message-action-btn" onclick="allianceChatSystem.ajouterReaction('${message.id}', '❤️')">❤️</button>
                    ${this.peutModifierMessage(message) ? 
                        `<button class="message-action-btn" onclick="allianceChatSystem.modifierMessageInterface('${message.id}')">✏️</button>` : ''
                    }
                    ${this.peutSupprimerMessage(message) ? 
                        `<button class="message-action-btn danger" onclick="allianceChatSystem.supprimerMessage('${message.id}')">🗑️</button>` : ''
                    }
                </div>
            </div>
        `;
    }

    // Formater le contenu du message
    formaterContenuMessage(contenu) {
        // Remplacer les liens
        contenu = contenu.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Remplacer les mentions (exemple: @joueur)
        contenu = contenu.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
        
        // Remplacer les sauts de ligne
        contenu = contenu.replace(/\n/g, '<br>');
        
        return contenu;
    }

    // Vérifier si on peut modifier un message
    peutModifierMessage(message) {
        const gameState = gameEngine.getGameState();
        const player = gameState.player;
        
        if (message.playerId !== player.id) return false;
        
        const delaiModification = 5 * 60 * 1000; // 5 minutes
        return Date.now() - message.timestamp <= delaiModification;
    }

    // Vérifier si on peut supprimer un message
    peutSupprimerMessage(message) {
        const gameState = gameEngine.getGameState();
        const player = gameState.player;
        const alliance = gameEngine.allianceSystem.alliances[player.alliance.id];
        
        return message.playerId === player.id || this.estModerateur(alliance, player.id);
    }

    // Envoyer un message depuis l'interface
    envoyerMessageInterface() {
        const input = document.getElementById('chat-input');
        if (!input) return;
        
        const contenu = input.value.trim();
        if (!contenu) return;
        
        this.envoyerMessage(contenu).then(success => {
            if (success) {
                input.value = '';
                this.mettreAJourCompteurCaracteres();
            }
        });
    }

    // Gérer les touches du clavier
    gererToucheClavier(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.envoyerMessageInterface();
        }
    }

    // Gérer la saisie
    gererSaisie() {
        this.mettreAJourCompteurCaracteres();
        // Ici on pourrait ajouter la logique "en train d'écrire"
    }

    // Mettre à jour le compteur de caractères
    mettreAJourCompteurCaracteres() {
        const input = document.getElementById('chat-input');
        const counter = document.getElementById('char-count');
        
        if (input && counter) {
            const length = input.value.length;
            counter.textContent = `${length}/500`;
            counter.style.color = length > 450 ? '#ff4444' : '#ffffff';
        }
    }

    // Ajouter un emoji
    ajouterEmoji(emoji) {
        const input = document.getElementById('chat-input');
        if (input) {
            input.value += emoji;
            input.focus();
            this.mettreAJourCompteurCaracteres();
        }
    }

    // Actualiser le chat
    actualiserChat() {
        this.chargerMessages();
        showNotification('💬 Chat actualisé', 'info');
    }

    // Effacer le chat (pour les modérateurs)
    effacerChat() {
        const gameState = gameEngine.getGameState();
        const player = gameState.player;
        const alliance = gameEngine.allianceSystem.alliances[player.alliance.id];
        
        if (!this.estModerateur(alliance, player.id)) {
            showNotification('❌ Permissions insuffisantes', 'error');
            return;
        }
        
        if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique du chat ?')) {
            alliance.chat = [];
            gameEngine.allianceSystem.saveToStorage();
            this.chargerMessages();
            showNotification('🗑️ Chat effacé', 'success');
        }
    }

    // Mettre à jour l'interface du chat
    mettreAJourInterfaceChat() {
        // Recharger les messages si l'interface est visible
        if (document.getElementById('chat-messages')) {
            this.chargerMessages();
        }
    }
}

// Instance globale
window.allianceChatSystem = new AllianceChatSystem();

// Export des fonctions pour utilisation globale
if (typeof window !== 'undefined') {
    window.envoyerMessageChat = (contenu, type) => allianceChatSystem.envoyerMessage(contenu, type);
    window.modifierMessageChat = (messageId, contenu) => allianceChatSystem.modifierMessage(messageId, contenu);
    window.supprimerMessageChat = (messageId) => allianceChatSystem.supprimerMessage(messageId);
    window.ajouterReactionChat = (messageId, emoji) => allianceChatSystem.ajouterReaction(messageId, emoji);
}

console.log('💬 Système de chat d\'alliance chargé!');