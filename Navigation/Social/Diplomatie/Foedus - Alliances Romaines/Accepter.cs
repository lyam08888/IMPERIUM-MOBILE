/**
 * 🏛️ IMPERIUM - Fonction d'Acceptation d'Invitation d'Alliance
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Fonction principale pour accepter une invitation d'alliance
function accepterInvitationAlliance(invitationId) {
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

        // Trouver l'invitation
        const invitation = trouverInvitation(invitationId);
        if (!invitation) {
            showNotification('❌ Invitation introuvable', 'error');
            return false;
        }

        // Vérifier que l'invitation est encore valide
        if (!verifierValiditeInvitation(invitation)) {
            showNotification('❌ Cette invitation a expiré', 'error');
            supprimerInvitation(invitationId);
            return false;
        }

        // Récupérer l'alliance
        const alliance = gameEngine.allianceSystem.alliances[invitation.allianceId];
        if (!alliance) {
            showNotification('❌ Alliance introuvable', 'error');
            supprimerInvitation(invitationId);
            return false;
        }

        // Vérifier que l'alliance a encore de la place
        const nombreMembres = Object.keys(alliance.members).length;
        if (nombreMembres >= alliance.maxMembers) {
            showNotification('❌ Cette alliance est complète', 'error');
            supprimerInvitation(invitationId);
            return false;
        }

        // Accepter l'invitation
        ajouterJoueurAlliance(alliance.id, player.id, 'Civis');

        // Marquer l'invitation comme acceptée
        invitation.status = 'accepted';
        invitation.respondedAt = Date.now();

        // Supprimer l'invitation de la liste des invitations en attente
        supprimerInvitation(invitationId);

        // Notifier l'alliance
        notifierAllianceNouveauMembre(alliance, player);

        // Mettre à jour l'état du jeu
        gameEngine.updateGameState();

        // Sauvegarder automatiquement
        if (gameEngine.saveSystem) {
            gameEngine.saveSystem.saveGame('autosave', 'Alliance rejointe');
        }

        showNotification(`✅ Vous avez rejoint l'alliance "${alliance.name}"!`, 'success');
        
        // Rediriger vers la page d'alliance
        setTimeout(() => {
            window.location.href = '../Alliance.html';
        }, 2000);

        console.log('🤝 Alliance rejointe:', alliance);
        return true;

    } catch (error) {
        console.error('❌ Erreur lors de l\'acceptation:', error);
        showNotification(`Erreur lors de l'acceptation: ${error.message}`, 'error');
        return false;
    }
}

// Accepter toutes les invitations d'une alliance spécifique
function accepterToutesInvitationsAlliance(allianceId) {
    try {
        const invitations = obtenirInvitationsJoueur().filter(inv => 
            inv.allianceId === allianceId && inv.status === 'pending'
        );

        if (invitations.length === 0) {
            showNotification('❌ Aucune invitation de cette alliance', 'warning');
            return false;
        }

        // Accepter la première invitation valide
        for (const invitation of invitations) {
            if (accepterInvitationAlliance(invitation.id)) {
                // Supprimer les autres invitations de la même alliance
                invitations.forEach(inv => {
                    if (inv.id !== invitation.id) {
                        supprimerInvitation(inv.id);
                    }
                });
                return true;
            }
        }

        return false;

    } catch (error) {
        console.error('❌ Erreur lors de l\'acceptation multiple:', error);
        showNotification(`Erreur: ${error.message}`, 'error');
        return false;
    }
}

// Trouver une invitation par ID
function trouverInvitation(invitationId) {
    try {
        const invitations = gameEngine.allianceSystem.invitations || [];
        return invitations.find(inv => inv.id === invitationId);
    } catch (error) {
        console.error('❌ Erreur lors de la recherche d\'invitation:', error);
        return null;
    }
}

// Vérifier la validité d'une invitation
function verifierValiditeInvitation(invitation) {
    if (!invitation) return false;
    
    // Vérifier le statut
    if (invitation.status !== 'pending') return false;
    
    // Vérifier l'expiration (7 jours par défaut)
    const maintenant = Date.now();
    const expiration = invitation.createdAt + (7 * 24 * 60 * 60 * 1000); // 7 jours
    
    return maintenant < expiration;
}

// Obtenir toutes les invitations du joueur
function obtenirInvitationsJoueur() {
    try {
        const gameState = gameEngine.getGameState();
        const playerId = gameState.player.id;
        
        const invitations = gameEngine.allianceSystem.invitations || [];
        return invitations.filter(inv => inv.playerId === playerId);
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des invitations:', error);
        return [];
    }
}

// Supprimer une invitation
function supprimerInvitation(invitationId) {
    try {
        const invitations = gameEngine.allianceSystem.invitations || [];
        const index = invitations.findIndex(inv => inv.id === invitationId);
        
        if (index !== -1) {
            invitations.splice(index, 1);
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Erreur lors de la suppression d\'invitation:', error);
        return false;
    }
}

// Ajouter un joueur à l'alliance (réutilisé de Fonder l'Alliance.cs)
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
        message: `${gameState.player.name} a rejoint l'alliance`,
        timestamp: Date.now(),
        playerId: playerId
    });
}

// Notifier l'alliance du nouveau membre
function notifierAllianceNouveauMembre(alliance, player) {
    try {
        // Ajouter une notification dans le système de messages de l'alliance
        if (!alliance.notifications) {
            alliance.notifications = [];
        }

        alliance.notifications.unshift({
            id: `notif_${Date.now()}`,
            type: 'member_joined',
            title: 'Nouveau Membre',
            message: `${player.name} a rejoint l'alliance!`,
            timestamp: Date.now(),
            read: false
        });

        // Limiter le nombre de notifications
        if (alliance.notifications.length > 50) {
            alliance.notifications = alliance.notifications.slice(0, 50);
        }

    } catch (error) {
        console.error('❌ Erreur lors de la notification:', error);
    }
}

// Interface pour l'acceptation d'invitations
function creerInterfaceAcceptation(invitations = []) {
    const container = document.createElement('div');
    container.className = 'invitation-acceptance-interface';
    
    if (invitations.length === 0) {
        container.innerHTML = `
            <div class="no-invitations">
                <h3>📭 Aucune Invitation</h3>
                <p>Vous n'avez actuellement aucune invitation d'alliance en attente.</p>
            </div>
        `;
        return container;
    }

    container.innerHTML = `
        <div class="invitations-panel">
            <h3>📨 Invitations d'Alliance</h3>
            <div class="invitations-list" id="invitations-list">
                ${invitations.map(invitation => creerElementInvitation(invitation)).join('')}
            </div>
        </div>
    `;
    
    return container;
}

// Créer un élément d'invitation
function creerElementInvitation(invitation) {
    const alliance = gameEngine.allianceSystem.alliances[invitation.allianceId];
    const timeAgo = calculerTempsEcoule(invitation.createdAt);
    const expiresIn = calculerTempsExpiration(invitation.createdAt);
    
    return `
        <div class="invitation-item" data-invitation-id="${invitation.id}">
            <div class="invitation-header">
                <div class="alliance-info">
                    <div class="alliance-name">${alliance ? alliance.name : 'Alliance Inconnue'}</div>
                    ${alliance && alliance.tag ? `<div class="alliance-tag">[${alliance.tag}]</div>` : ''}
                </div>
                <div class="invitation-time">
                    <div class="time-sent">Reçue ${timeAgo}</div>
                    <div class="time-expires">Expire ${expiresIn}</div>
                </div>
            </div>
            
            <div class="invitation-content">
                <div class="invitation-message">${invitation.message || 'Invitation à rejoindre l\'alliance'}</div>
                ${alliance ? `
                    <div class="alliance-details">
                        <div class="alliance-members">👥 ${Object.keys(alliance.members || {}).length}/${alliance.maxMembers} membres</div>
                        <div class="alliance-level">⭐ Niveau ${alliance.level}</div>
                    </div>
                ` : ''}
            </div>
            
            <div class="invitation-actions">
                <button class="invitation-btn accept" onclick="accepterInvitationAlliance('${invitation.id}')">
                    ✅ Accepter
                </button>
                <button class="invitation-btn decline" onclick="refuserInvitationAlliance('${invitation.id}')">
                    ❌ Refuser
                </button>
                <button class="invitation-btn info" onclick="voirDetailsAlliance('${invitation.allianceId}')">
                    ℹ️ Détails
                </button>
            </div>
        </div>
    `;
}

// Calculer le temps écoulé depuis la création
function calculerTempsEcoule(timestamp) {
    const maintenant = Date.now();
    const difference = maintenant - timestamp;
    
    const minutes = Math.floor(difference / (1000 * 60));
    const heures = Math.floor(difference / (1000 * 60 * 60));
    const jours = Math.floor(difference / (1000 * 60 * 60 * 24));
    
    if (jours > 0) return `il y a ${jours} jour${jours > 1 ? 's' : ''}`;
    if (heures > 0) return `il y a ${heures} heure${heures > 1 ? 's' : ''}`;
    if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'à l\'instant';
}

// Calculer le temps avant expiration
function calculerTempsExpiration(timestamp) {
    const expiration = timestamp + (7 * 24 * 60 * 60 * 1000); // 7 jours
    const maintenant = Date.now();
    const difference = expiration - maintenant;
    
    if (difference <= 0) return 'Expirée';
    
    const jours = Math.floor(difference / (1000 * 60 * 60 * 24));
    const heures = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (jours > 0) return `dans ${jours} jour${jours > 1 ? 's' : ''}`;
    if (heures > 0) return `dans ${heures} heure${heures > 1 ? 's' : ''}`;
    return 'bientôt';
}

// Voir les détails d'une alliance
function voirDetailsAlliance(allianceId) {
    const alliance = gameEngine.allianceSystem.alliances[allianceId];
    
    if (!alliance) {
        showNotification('❌ Alliance introuvable', 'error');
        return;
    }

    // Créer une modale avec les détails
    const modal = document.createElement('div');
    modal.className = 'alliance-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🏛️ ${alliance.name}</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
            </div>
            <div class="modal-body">
                <div class="alliance-info">
                    ${alliance.tag ? `<div><strong>Tag:</strong> [${alliance.tag}]</div>` : ''}
                    <div><strong>Niveau:</strong> ${alliance.level}</div>
                    <div><strong>Membres:</strong> ${Object.keys(alliance.members || {}).length}/${alliance.maxMembers}</div>
                    <div><strong>Fondée le:</strong> ${new Date(alliance.createdAt).toLocaleDateString('fr-FR')}</div>
                    <div><strong>Description:</strong></div>
                    <p>${alliance.description || 'Aucune description'}</p>
                    
                    <div class="alliance-bonuses">
                        <h4>🎯 Bonus d'Alliance</h4>
                        <ul>
                            <li>Production: +${(alliance.bonuses.productionBonus * 100).toFixed(1)}%</li>
                            <li>Défense: +${(alliance.bonuses.defenseBonus * 100).toFixed(1)}%</li>
                            <li>Recherche: +${(alliance.bonuses.researchBonus * 100).toFixed(1)}%</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Styles pour la modale
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    document.body.appendChild(modal);
}

// Export des fonctions pour utilisation globale
if (typeof window !== 'undefined') {
    window.accepterInvitationAlliance = accepterInvitationAlliance;
    window.accepterToutesInvitationsAlliance = accepterToutesInvitationsAlliance;
    window.obtenirInvitationsJoueur = obtenirInvitationsJoueur;
    window.creerInterfaceAcceptation = creerInterfaceAcceptation;
    window.voirDetailsAlliance = voirDetailsAlliance;
    window.trouverInvitation = trouverInvitation;
    window.verifierValiditeInvitation = verifierValiditeInvitation;
}

console.log('✅ Système d\'acceptation d\'invitations d\'alliance chargé!');