/**
 * 🏛️ IMPERIUM - Fonction de Refus d'Invitation d'Alliance
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Fonction principale pour refuser une invitation d'alliance
function refuserInvitationAlliance(invitationId, raison = '') {
    try {
        // Vérifications préliminaires
        if (!window.gameEngine || !window.gameEngine.allianceSystem) {
            console.error('❌ Système d\'alliance non initialisé');
            showNotification('Erreur: Système d\'alliance non disponible', 'error');
            return false;
        }

        // Trouver l'invitation
        const invitation = trouverInvitation(invitationId);
        if (!invitation) {
            showNotification('❌ Invitation introuvable', 'error');
            return false;
        }

        // Récupérer l'alliance pour la notification
        const alliance = gameEngine.allianceSystem.alliances[invitation.allianceId];
        const gameState = gameEngine.getGameState();
        const player = gameState.player;

        // Marquer l'invitation comme refusée
        invitation.status = 'declined';
        invitation.respondedAt = Date.now();
        invitation.declineReason = raison;

        // Notifier l'alliance du refus
        if (alliance) {
            notifierAllianceRefus(alliance, player, raison);
        }

        // Supprimer l'invitation de la liste des invitations en attente
        supprimerInvitation(invitationId);

        // Mettre à jour l'état du jeu
        gameEngine.updateGameState();

        // Sauvegarder automatiquement
        if (gameEngine.saveSystem) {
            gameEngine.saveSystem.saveGame('autosave', 'Invitation refusée');
        }

        const allianceName = alliance ? alliance.name : 'l\'alliance';
        showNotification(`✅ Invitation de ${allianceName} refusée`, 'success');
        
        // Mettre à jour l'interface des invitations
        if (typeof updateInvitationsInterface === 'function') {
            updateInvitationsInterface();
        }

        console.log('❌ Invitation refusée:', invitation);
        return true;

    } catch (error) {
        console.error('❌ Erreur lors du refus:', error);
        showNotification(`Erreur lors du refus: ${error.message}`, 'error');
        return false;
    }
}

// Refuser toutes les invitations en attente
function refuserToutesInvitations(raison = 'Refus en masse') {
    try {
        const invitations = obtenirInvitationsJoueur().filter(inv => inv.status === 'pending');

        if (invitations.length === 0) {
            showNotification('❌ Aucune invitation en attente', 'warning');
            return false;
        }

        let refusees = 0;
        invitations.forEach(invitation => {
            if (refuserInvitationAlliance(invitation.id, raison)) {
                refusees++;
            }
        });

        showNotification(`✅ ${refusees} invitation${refusees > 1 ? 's' : ''} refusée${refusees > 1 ? 's' : ''}`, 'success');
        return refusees > 0;

    } catch (error) {
        console.error('❌ Erreur lors du refus multiple:', error);
        showNotification(`Erreur: ${error.message}`, 'error');
        return false;
    }
}

// Refuser toutes les invitations d'une alliance spécifique
function refuserToutesInvitationsAlliance(allianceId, raison = '') {
    try {
        const invitations = obtenirInvitationsJoueur().filter(inv => 
            inv.allianceId === allianceId && inv.status === 'pending'
        );

        if (invitations.length === 0) {
            showNotification('❌ Aucune invitation de cette alliance', 'warning');
            return false;
        }

        let refusees = 0;
        invitations.forEach(invitation => {
            if (refuserInvitationAlliance(invitation.id, raison)) {
                refusees++;
            }
        });

        const alliance = gameEngine.allianceSystem.alliances[allianceId];
        const allianceName = alliance ? alliance.name : 'cette alliance';
        
        showNotification(`✅ ${refusees} invitation${refusees > 1 ? 's' : ''} de ${allianceName} refusée${refusees > 1 ? 's' : ''}`, 'success');
        return refusees > 0;

    } catch (error) {
        console.error('❌ Erreur lors du refus multiple:', error);
        showNotification(`Erreur: ${error.message}`, 'error');
        return false;
    }
}

// Trouver une invitation par ID (réutilisé d'Accepter.cs)
function trouverInvitation(invitationId) {
    try {
        const invitations = gameEngine.allianceSystem.invitations || [];
        return invitations.find(inv => inv.id === invitationId);
    } catch (error) {
        console.error('❌ Erreur lors de la recherche d\'invitation:', error);
        return null;
    }
}

// Obtenir toutes les invitations du joueur (réutilisé d'Accepter.cs)
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

// Supprimer une invitation (réutilisé d'Accepter.cs)
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

// Notifier l'alliance du refus
function notifierAllianceRefus(alliance, player, raison) {
    try {
        // Ajouter une notification dans le système de messages de l'alliance
        if (!alliance.notifications) {
            alliance.notifications = [];
        }

        let message = `${player.name} a refusé l'invitation`;
        if (raison && raison.trim() !== '') {
            message += ` (Raison: ${raison})`;
        }

        alliance.notifications.unshift({
            id: `notif_${Date.now()}`,
            type: 'invitation_declined',
            title: 'Invitation Refusée',
            message: message,
            timestamp: Date.now(),
            read: false,
            playerId: player.id,
            playerName: player.name
        });

        // Ajouter un événement à l'alliance
        alliance.events.unshift({
            id: `event_${Date.now()}`,
            type: 'invitation_declined',
            message: message,
            timestamp: Date.now(),
            playerId: player.id
        });

        // Limiter le nombre de notifications
        if (alliance.notifications.length > 50) {
            alliance.notifications = alliance.notifications.slice(0, 50);
        }

        // Limiter le nombre d'événements
        if (alliance.events.length > 100) {
            alliance.events = alliance.events.slice(0, 100);
        }

    } catch (error) {
        console.error('❌ Erreur lors de la notification de refus:', error);
    }
}

// Interface pour le refus d'invitations avec raison
function creerInterfaceRefus(invitationId) {
    const invitation = trouverInvitation(invitationId);
    if (!invitation) {
        showNotification('❌ Invitation introuvable', 'error');
        return null;
    }

    const alliance = gameEngine.allianceSystem.alliances[invitation.allianceId];
    const allianceName = alliance ? alliance.name : 'Alliance Inconnue';

    const modal = document.createElement('div');
    modal.className = 'decline-invitation-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>❌ Refuser l'Invitation</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
            </div>
            <div class="modal-body">
                <p>Êtes-vous sûr de vouloir refuser l'invitation de <strong>${allianceName}</strong> ?</p>
                
                <div class="form-group">
                    <label class="form-label" for="decline-reason">Raison (optionnelle)</label>
                    <textarea id="decline-reason" class="form-input form-textarea" 
                              placeholder="Expliquez pourquoi vous refusez cette invitation..." 
                              maxlength="200" rows="3"></textarea>
                    <small class="form-help">Cette raison sera communiquée à l'alliance</small>
                </div>
            </div>
            <div class="modal-footer">
                <button class="invitation-btn decline" onclick="confirmerRefus('${invitationId}')">
                    ❌ Confirmer le Refus
                </button>
                <button class="invitation-btn secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                    🔙 Annuler
                </button>
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
    
    return modal;
}

// Confirmer le refus avec raison
function confirmerRefus(invitationId) {
    const reasonTextarea = document.getElementById('decline-reason');
    const raison = reasonTextarea ? reasonTextarea.value.trim() : '';
    
    if (refuserInvitationAlliance(invitationId, raison)) {
        // Fermer la modale
        const modal = document.querySelector('.decline-invitation-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// Refuser avec interface modale
function refuserAvecRaison(invitationId) {
    const modal = creerInterfaceRefus(invitationId);
    if (modal) {
        document.body.appendChild(modal);
    }
}

// Interface pour le refus en masse
function creerInterfaceRefusMasse() {
    const invitations = obtenirInvitationsJoueur().filter(inv => inv.status === 'pending');
    
    if (invitations.length === 0) {
        showNotification('❌ Aucune invitation en attente', 'warning');
        return null;
    }

    const modal = document.createElement('div');
    modal.className = 'mass-decline-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>❌ Refuser Toutes les Invitations</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
            </div>
            <div class="modal-body">
                <p>Vous avez <strong>${invitations.length}</strong> invitation${invitations.length > 1 ? 's' : ''} en attente.</p>
                <p>Êtes-vous sûr de vouloir toutes les refuser ?</p>
                
                <div class="invitations-preview">
                    ${invitations.slice(0, 5).map(inv => {
                        const alliance = gameEngine.allianceSystem.alliances[inv.allianceId];
                        return `<div class="invitation-preview">${alliance ? alliance.name : 'Alliance Inconnue'}</div>`;
                    }).join('')}
                    ${invitations.length > 5 ? `<div class="more-invitations">... et ${invitations.length - 5} autre${invitations.length - 5 > 1 ? 's' : ''}</div>` : ''}
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="mass-decline-reason">Raison commune (optionnelle)</label>
                    <textarea id="mass-decline-reason" class="form-input form-textarea" 
                              placeholder="Raison qui sera envoyée à toutes les alliances..." 
                              maxlength="200" rows="3"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="invitation-btn decline" onclick="confirmerRefusMasse()">
                    ❌ Refuser Toutes
                </button>
                <button class="invitation-btn secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                    🔙 Annuler
                </button>
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
    
    return modal;
}

// Confirmer le refus en masse
function confirmerRefusMasse() {
    const reasonTextarea = document.getElementById('mass-decline-reason');
    const raison = reasonTextarea ? reasonTextarea.value.trim() : 'Refus en masse';
    
    if (refuserToutesInvitations(raison)) {
        // Fermer la modale
        const modal = document.querySelector('.mass-decline-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// Ouvrir l'interface de refus en masse
function ouvrirRefusMasse() {
    const modal = creerInterfaceRefusMasse();
    if (modal) {
        document.body.appendChild(modal);
    }
}

// Mettre à jour l'interface des invitations
function updateInvitationsInterface() {
    // Recharger la liste des invitations
    const container = document.getElementById('invitations-list');
    if (container) {
        const invitations = obtenirInvitationsJoueur().filter(inv => inv.status === 'pending');
        
        if (invitations.length === 0) {
            container.innerHTML = '<div class="no-invitations">Aucune invitation en attente</div>';
        } else {
            container.innerHTML = invitations.map(invitation => creerElementInvitation(invitation)).join('');
        }
    }
    
    // Mettre à jour les compteurs
    const counter = document.getElementById('invitations-counter');
    if (counter) {
        const pendingCount = obtenirInvitationsJoueur().filter(inv => inv.status === 'pending').length;
        counter.textContent = pendingCount;
        counter.style.display = pendingCount > 0 ? 'inline' : 'none';
    }
}

// Créer un élément d'invitation (réutilisé d'Accepter.cs avec modifications)
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
                <button class="invitation-btn decline" onclick="refuserAvecRaison('${invitation.id}')">
                    ❌ Refuser
                </button>
                <button class="invitation-btn info" onclick="voirDetailsAlliance('${invitation.allianceId}')">
                    ℹ️ Détails
                </button>
            </div>
        </div>
    `;
}

// Fonctions utilitaires (réutilisées d'Accepter.cs)
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

// Export des fonctions pour utilisation globale
if (typeof window !== 'undefined') {
    window.refuserInvitationAlliance = refuserInvitationAlliance;
    window.refuserToutesInvitations = refuserToutesInvitations;
    window.refuserToutesInvitationsAlliance = refuserToutesInvitationsAlliance;
    window.refuserAvecRaison = refuserAvecRaison;
    window.ouvrirRefusMasse = ouvrirRefusMasse;
    window.confirmerRefus = confirmerRefus;
    window.confirmerRefusMasse = confirmerRefusMasse;
    window.updateInvitationsInterface = updateInvitationsInterface;
}

console.log('❌ Système de refus d\'invitations d\'alliance chargé!');