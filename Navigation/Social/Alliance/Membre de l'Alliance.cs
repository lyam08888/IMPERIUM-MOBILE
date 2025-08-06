/**
 * 🏛️ IMPERIUM - Gestion des Membres d'Alliance
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Classe principale pour la gestion des membres d'alliance
class AllianceMemberSystem {
    constructor() {
        this.roles = {
            'Imperator': {
                name: 'Imperator',
                icon: '👑',
                color: '#FFD700',
                level: 4,
                permissions: ['all']
            },
            'Legatus': {
                name: 'Legatus',
                icon: '🏛️',
                color: '#CD7F32',
                level: 3,
                permissions: ['invite', 'kick', 'promote_demote', 'manage_treasury', 'declare_war']
            },
            'Centurio': {
                name: 'Centurio',
                icon: '⚔️',
                color: '#C0C0C0',
                level: 2,
                permissions: ['invite', 'manage_events']
            },
            'Civis': {
                name: 'Civis',
                icon: '🏺',
                color: '#F8F8FF',
                level: 1,
                permissions: ['chat', 'participate']
            }
        };
    }

    // Inviter un joueur dans l'alliance
    async inviterJoueur(playerName, message = '') {
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

            // Vérifier les permissions
            if (!this.verifierPermission(alliance, player.id, 'invite')) {
                throw new Error('Vous n\'avez pas les permissions pour inviter des joueurs');
            }

            // Vérifier que l'alliance n'est pas complète
            const nombreMembres = Object.keys(alliance.members).length;
            if (nombreMembres >= alliance.maxMembers) {
                throw new Error('L\'alliance est complète');
            }

            // Générer un ID de joueur cible (simulation)
            const targetPlayerId = `player_${playerName.toLowerCase()}`;

            // Vérifier que le joueur n'est pas déjà membre
            if (alliance.members[targetPlayerId]) {
                throw new Error('Ce joueur est déjà membre de l\'alliance');
            }

            // Vérifier qu'il n'y a pas déjà une invitation en attente
            const invitationExistante = gameEngine.allianceSystem.invitations.find(inv => 
                inv.allianceId === alliance.id && 
                inv.playerId === targetPlayerId && 
                inv.status === 'pending'
            );

            if (invitationExistante) {
                throw new Error('Une invitation est déjà en attente pour ce joueur');
            }

            // Créer l'invitation
            const invitation = {
                id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                allianceId: alliance.id,
                allianceName: alliance.name,
                playerId: targetPlayerId,
                playerName: playerName,
                invitedBy: player.id,
                invitedByName: player.name,
                message: message,
                createdAt: Date.now(),
                status: 'pending'
            };

            // Ajouter l'invitation
            gameEngine.allianceSystem.invitations.push(invitation);

            // Ajouter un événement
            allianceEventsSystem.ajouterEvenement(alliance.id, 'member_invited', 
                `${player.name} a invité ${playerName}`, 
                { invitedPlayer: playerName, playerId: player.id, playerName: player.name });

            // Sauvegarder
            gameEngine.allianceSystem.saveToStorage();

            showNotification(`✅ Invitation envoyée à ${playerName}`, 'success');
            console.log('📨 Invitation envoyée:', invitation);

            return true;

        } catch (error) {
            console.error('❌ Erreur invitation joueur:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            return false;
        }
    }

    // Exclure un membre de l'alliance
    async exclureMembre(memberId, raison = '') {
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

            // Vérifier les permissions
            if (!this.verifierPermission(alliance, player.id, 'kick')) {
                throw new Error('Vous n\'avez pas les permissions pour exclure des membres');
            }

            // Vérifier que le membre existe
            const membre = alliance.members[memberId];
            if (!membre) {
                throw new Error('Membre introuvable');
            }

            // Vérifier qu'on ne peut pas s'exclure soi-même
            if (memberId === player.id) {
                throw new Error('Vous ne pouvez pas vous exclure vous-même');
            }

            // Vérifier la hiérarchie (on ne peut pas exclure quelqu'un de rang supérieur ou égal)
            const playerRole = alliance.members[player.id].role;
            const targetRole = membre.role;

            if (this.roles[targetRole].level >= this.roles[playerRole].level) {
                throw new Error('Vous ne pouvez pas exclure ce membre (rang insuffisant)');
            }

            // Supprimer le membre
            delete alliance.members[memberId];

            // Ajouter un événement
            allianceEventsSystem.ajouterEvenement(alliance.id, 'member_kicked', 
                `${membre.name} a été exclu par ${player.name}${raison ? ` (${raison})` : ''}`, 
                { kickedPlayer: membre.name, kickedBy: player.name, reason: raison, playerId: player.id, playerName: player.name });

            // Envoyer un message au membre exclu
            this.envoyerMessageExclusion(memberId, alliance.name, player.name, raison);

            // Sauvegarder
            gameEngine.allianceSystem.saveToStorage();

            showNotification(`✅ ${membre.name} a été exclu de l'alliance`, 'success');
            console.log('🦵 Membre exclu:', membre);

            return true;

        } catch (error) {
            console.error('❌ Erreur exclusion membre:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            return false;
        }
    }

    // Promouvoir ou rétrograder un membre
    async changerRangMembre(memberId, nouveauRole) {
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

            // Vérifier les permissions
            if (!this.verifierPermission(alliance, player.id, 'promote_demote')) {
                throw new Error('Vous n\'avez pas les permissions pour changer les rangs');
            }

            // Vérifier que le membre existe
            const membre = alliance.members[memberId];
            if (!membre) {
                throw new Error('Membre introuvable');
            }

            // Vérifier que le nouveau rôle existe
            if (!this.roles[nouveauRole]) {
                throw new Error('Rôle invalide');
            }

            // Vérifier qu'on ne peut pas se changer son propre rang
            if (memberId === player.id) {
                throw new Error('Vous ne pouvez pas changer votre propre rang');
            }

            const playerRole = alliance.members[player.id].role;
            const ancienRole = membre.role;

            // Vérifier la hiérarchie
            if (this.roles[nouveauRole].level >= this.roles[playerRole].level) {
                throw new Error('Vous ne pouvez pas promouvoir à ce rang');
            }

            if (this.roles[ancienRole].level >= this.roles[playerRole].level) {
                throw new Error('Vous ne pouvez pas modifier le rang de ce membre');
            }

            // Changer le rôle
            membre.role = nouveauRole;
            membre.roleChangedAt = Date.now();
            membre.roleChangedBy = player.id;

            // Déterminer si c'est une promotion ou rétrogradation
            const estPromotion = this.roles[nouveauRole].level > this.roles[ancienRole].level;
            const action = estPromotion ? 'promu' : 'rétrogradé';

            // Ajouter un événement
            allianceEventsSystem.ajouterEvenement(alliance.id, 'member_role_changed', 
                `${membre.name} a été ${action} ${this.roles[nouveauRole].name} par ${player.name}`, 
                { 
                    targetPlayer: membre.name, 
                    oldRole: ancienRole, 
                    newRole: nouveauRole, 
                    changedBy: player.name,
                    playerId: player.id,
                    playerName: player.name
                });

            // Envoyer un message au membre
            this.envoyerMessageChangementRang(memberId, alliance.name, nouveauRole, estPromotion);

            // Sauvegarder
            gameEngine.allianceSystem.saveToStorage();

            showNotification(`✅ ${membre.name} ${action} ${this.roles[nouveauRole].name}`, 'success');
            console.log('📊 Rang changé:', { membre: membre.name, ancienRole, nouveauRole });

            return true;

        } catch (error) {
            console.error('❌ Erreur changement rang:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            return false;
        }
    }

    // Quitter l'alliance
    async quitterAlliance(raison = '') {
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

            // Vérifier si c'est le fondateur
            if (alliance.founderId === player.id) {
                // Le fondateur doit transférer le leadership ou dissoudre l'alliance
                const autresMembres = Object.keys(alliance.members).filter(id => id !== player.id);
                if (autresMembres.length > 0) {
                    throw new Error('En tant que fondateur, vous devez transférer le leadership avant de quitter');
                }
            }

            // Supprimer le joueur de l'alliance
            delete alliance.members[player.id];

            // Supprimer l'alliance du joueur
            delete player.alliance;

            // Ajouter un événement
            allianceEventsSystem.ajouterEvenement(alliance.id, 'member_left', 
                `${player.name} a quitté l'alliance${raison ? ` (${raison})` : ''}`, 
                { leftPlayer: player.name, reason: raison });

            // Si c'était le dernier membre, supprimer l'alliance
            if (Object.keys(alliance.members).length === 0) {
                delete gameEngine.allianceSystem.alliances[alliance.id];
                console.log('🏛️ Alliance dissoute (plus de membres)');
            }

            // Sauvegarder
            gameEngine.updateGameState();
            gameEngine.allianceSystem.saveToStorage();

            showNotification('✅ Vous avez quitté l\'alliance', 'success');
            console.log('🚪 Alliance quittée');

            // Rediriger vers la page de diplomatie
            setTimeout(() => {
                window.location.reload();
            }, 2000);

            return true;

        } catch (error) {
            console.error('❌ Erreur quitter alliance:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            return false;
        }
    }

    // Transférer le leadership
    async transfererLeadership(nouveauLeaderId) {
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

            // Vérifier que c'est le fondateur
            if (alliance.founderId !== player.id) {
                throw new Error('Seul le fondateur peut transférer le leadership');
            }

            // Vérifier que le nouveau leader existe
            const nouveauLeader = alliance.members[nouveauLeaderId];
            if (!nouveauLeader) {
                throw new Error('Membre introuvable');
            }

            // Transférer le leadership
            alliance.founderId = nouveauLeaderId;
            alliance.founderName = nouveauLeader.name;

            // Changer les rôles
            alliance.members[player.id].role = 'Legatus';
            alliance.members[nouveauLeaderId].role = 'Imperator';

            // Ajouter un événement
            allianceEventsSystem.ajouterEvenement(alliance.id, 'leadership_transferred', 
                `${player.name} a transféré le leadership à ${nouveauLeader.name}`, 
                { 
                    oldLeader: player.name, 
                    newLeader: nouveauLeader.name,
                    playerId: player.id,
                    playerName: player.name
                });

            // Envoyer un message au nouveau leader
            this.envoyerMessageNouveauLeader(nouveauLeaderId, alliance.name);

            // Sauvegarder
            gameEngine.allianceSystem.saveToStorage();

            showNotification(`✅ Leadership transféré à ${nouveauLeader.name}`, 'success');
            console.log('👑 Leadership transféré');

            return true;

        } catch (error) {
            console.error('❌ Erreur transfert leadership:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            return false;
        }
    }

    // Vérifier les permissions
    verifierPermission(alliance, playerId, permission) {
        const membre = alliance.members[playerId];
        if (!membre) return false;

        const role = this.roles[membre.role];
        if (!role) return false;

        return role.permissions.includes('all') || role.permissions.includes(permission);
    }

    // Obtenir les statistiques d'un membre
    obtenirStatistiquesMembre(alliance, memberId) {
        const membre = alliance.members[memberId];
        if (!membre) return null;

        const maintenant = Date.now();
        const anciennete = maintenant - membre.joinedAt;
        const derniereActivite = maintenant - membre.lastActive;

        return {
            nom: membre.name,
            role: membre.role,
            anciennete: Math.floor(anciennete / (24 * 60 * 60 * 1000)), // en jours
            derniereActivite: Math.floor(derniereActivite / (24 * 60 * 60 * 1000)), // en jours
            contribution: membre.contribution || { resources: 0, battles: 0, buildings: 0 },
            niveau: membre.level || 1,
            puissance: membre.power || 0
        };
    }

    // Interface de gestion des membres
    creerInterfaceMembres() {
        const container = document.createElement('div');
        container.className = 'alliance-members-interface';
        
        const gameState = gameEngine.getGameState();
        if (!gameState.player.alliance) {
            container.innerHTML = '<div class="no-alliance">Vous n\'êtes pas membre d\'une alliance</div>';
            return container;
        }

        const alliance = gameEngine.allianceSystem.alliances[gameState.player.alliance.id];
        const membres = Object.values(alliance.members);
        const playerRole = alliance.members[gameState.player.id].role;
        const peutInviter = this.verifierPermission(alliance, gameState.player.id, 'invite');
        
        container.innerHTML = `
            <div class="members-panel">
                <div class="members-header">
                    <h3>👥 Membres de l'Alliance (${membres.length}/${alliance.maxMembers})</h3>
                    <div class="members-controls">
                        ${peutInviter ? 
                            '<button class="members-btn primary" onclick="allianceMemberSystem.ouvrirInvitation()">➕ Inviter</button>' : ''
                        }
                        <button class="members-btn" onclick="allianceMemberSystem.actualiserMembres()">🔄</button>
                    </div>
                </div>
                
                <div class="members-stats">
                    <div class="stat-item">
                        <span class="stat-value">${this.compterMembresActifs(alliance)}</span>
                        <span class="stat-label">Actifs (7j)</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.compterMembresParRole(alliance, 'Imperator') + this.compterMembresParRole(alliance, 'Legatus')}</span>
                        <span class="stat-label">Dirigeants</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${Math.round(this.calculerNiveauMoyen(alliance))}</span>
                        <span class="stat-label">Niveau moyen</span>
                    </div>
                </div>
                
                <div class="members-list">
                    ${membres
                        .sort((a, b) => this.roles[b.role].level - this.roles[a.role].level || b.lastActive - a.lastActive)
                        .map(membre => this.creerElementMembre(membre, alliance, gameState.player.id))
                        .join('')
                    }
                </div>
            </div>
        `;
        
        return container;
    }

    // Créer un élément de membre
    creerElementMembre(membre, alliance, currentPlayerId) {
        const role = this.roles[membre.role];
        const stats = this.obtenirStatistiquesMembre(alliance, membre.id);
        const estSoi = membre.id === currentPlayerId;
        const peutGerer = this.verifierPermission(alliance, currentPlayerId, 'kick') && !estSoi;
        const peutChangerRang = this.verifierPermission(alliance, currentPlayerId, 'promote_demote') && !estSoi;
        
        const statutActivite = stats.derniereActivite <= 1 ? 'online' : 
                              stats.derniereActivite <= 7 ? 'recent' : 'offline';

        return `
            <div class="member-item ${estSoi ? 'current-player' : ''}" data-member-id="${membre.id}">
                <div class="member-info">
                    <div class="member-avatar" style="background-color: ${role.color}">
                        ${role.icon}
                    </div>
                    <div class="member-details">
                        <div class="member-name">
                            ${membre.name} ${estSoi ? '(Vous)' : ''}
                            <span class="member-status ${statutActivite}"></span>
                        </div>
                        <div class="member-role" style="color: ${role.color}">
                            ${role.name}
                        </div>
                        <div class="member-stats-mini">
                            <span>Niveau ${stats.niveau}</span>
                            <span>•</span>
                            <span>${stats.anciennete} jours</span>
                            <span>•</span>
                            <span>${stats.puissance.toLocaleString()} ⚔️</span>
                        </div>
                    </div>
                </div>
                
                <div class="member-contribution">
                    <div class="contribution-item">
                        <span class="contribution-icon">💰</span>
                        <span class="contribution-value">${stats.contribution.resources.toLocaleString()}</span>
                    </div>
                    <div class="contribution-item">
                        <span class="contribution-icon">⚔️</span>
                        <span class="contribution-value">${stats.contribution.battles}</span>
                    </div>
                    <div class="contribution-item">
                        <span class="contribution-icon">🏗️</span>
                        <span class="contribution-value">${stats.contribution.buildings}</span>
                    </div>
                </div>
                
                <div class="member-actions">
                    ${!estSoi ? `
                        <button class="member-action-btn" onclick="allianceMemberSystem.envoyerMessage('${membre.id}')">💬</button>
                        <button class="member-action-btn" onclick="allianceMemberSystem.voirProfil('${membre.id}')">👁️</button>
                    ` : ''}
                    
                    ${peutChangerRang ? `
                        <div class="role-selector">
                            <select onchange="allianceMemberSystem.changerRangMembre('${membre.id}', this.value)">
                                <option value="">Changer rang</option>
                                ${Object.entries(this.roles)
                                    .filter(([roleKey]) => roleKey !== membre.role && this.roles[roleKey].level < this.roles[alliance.members[currentPlayerId].role].level)
                                    .map(([roleKey, roleData]) => `<option value="${roleKey}">${roleData.name}</option>`)
                                    .join('')
                                }
                            </select>
                        </div>
                    ` : ''}
                    
                    ${peutGerer ? `
                        <button class="member-action-btn danger" onclick="allianceMemberSystem.confirmerExclusion('${membre.id}', '${membre.name}')">🦵</button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Compter les membres actifs
    compterMembresActifs(alliance) {
        const maintenant = Date.now();
        const uneSemaine = 7 * 24 * 60 * 60 * 1000;
        
        return Object.values(alliance.members).filter(membre => 
            maintenant - membre.lastActive < uneSemaine
        ).length;
    }

    // Compter les membres par rôle
    compterMembresParRole(alliance, role) {
        return Object.values(alliance.members).filter(membre => membre.role === role).length;
    }

    // Calculer le niveau moyen
    calculerNiveauMoyen(alliance) {
        const membres = Object.values(alliance.members);
        const totalNiveau = membres.reduce((sum, membre) => sum + (membre.level || 1), 0);
        return totalNiveau / membres.length;
    }

    // Envoyer un message d'exclusion
    envoyerMessageExclusion(playerId, allianceName, excludedBy, raison) {
        if (!gameEngine.messageSystem) return;
        
        const messageObj = {
            id: `msg_${Date.now()}`,
            from: 'system',
            fromName: 'Système d\'Alliance',
            to: playerId,
            subject: '🦵 Exclusion d\'alliance',
            content: `Vous avez été exclu de l'alliance "${allianceName}" par ${excludedBy}.${raison ? `\n\nRaison: ${raison}` : ''}`,
            timestamp: Date.now(),
            read: false,
            type: 'alliance_kick'
        };
        
        gameEngine.messageSystem.messages.push(messageObj);
        gameEngine.messageSystem.saveToStorage();
    }

    // Envoyer un message de changement de rang
    envoyerMessageChangementRang(playerId, allianceName, nouveauRole, estPromotion) {
        if (!gameEngine.messageSystem) return;
        
        const action = estPromotion ? 'promu' : 'rétrogradé';
        const roleData = this.roles[nouveauRole];
        
        const messageObj = {
            id: `msg_${Date.now()}`,
            from: 'system',
            fromName: 'Système d\'Alliance',
            to: playerId,
            subject: `📊 ${estPromotion ? 'Promotion' : 'Rétrogradation'} dans l'alliance`,
            content: `Vous avez été ${action} ${roleData.name} dans l'alliance "${allianceName}".`,
            timestamp: Date.now(),
            read: false,
            type: 'alliance_role_change'
        };
        
        gameEngine.messageSystem.messages.push(messageObj);
        gameEngine.messageSystem.saveToStorage();
    }

    // Envoyer un message au nouveau leader
    envoyerMessageNouveauLeader(playerId, allianceName) {
        if (!gameEngine.messageSystem) return;
        
        const messageObj = {
            id: `msg_${Date.now()}`,
            from: 'system',
            fromName: 'Système d\'Alliance',
            to: playerId,
            subject: '👑 Nouveau leadership',
            content: `Félicitations ! Vous êtes maintenant l'Imperator de l'alliance "${allianceName}". Vous avez maintenant accès à toutes les fonctions de gestion de l'alliance.`,
            timestamp: Date.now(),
            read: false,
            type: 'alliance_leadership'
        };
        
        gameEngine.messageSystem.messages.push(messageObj);
        gameEngine.messageSystem.saveToStorage();
    }

    // Ouvrir l'interface d'invitation
    ouvrirInvitation() {
        const modal = document.createElement('div');
        modal.className = 'invitation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>➕ Inviter un Joueur</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Nom du joueur:</label>
                        <input type="text" id="invite-player-name" class="form-input" placeholder="Nom du joueur à inviter">
                    </div>
                    <div class="form-group">
                        <label>Message d'invitation (optionnel):</label>
                        <textarea id="invite-message" class="form-input" placeholder="Message personnalisé..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="members-btn primary" onclick="allianceMemberSystem.confirmerInvitation()">📨 Envoyer</button>
                    <button class="members-btn secondary" onclick="this.parentElement.parentElement.parentElement.remove()">❌ Annuler</button>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 10000;
        `;
        
        document.body.appendChild(modal);
    }

    // Confirmer l'invitation
    confirmerInvitation() {
        const playerName = document.getElementById('invite-player-name').value.trim();
        const message = document.getElementById('invite-message').value.trim();
        
        if (!playerName) {
            showNotification('❌ Veuillez entrer un nom de joueur', 'error');
            return;
        }
        
        this.inviterJoueur(playerName, message).then(success => {
            if (success) {
                document.querySelector('.invitation-modal').remove();
            }
        });
    }

    // Confirmer l'exclusion
    confirmerExclusion(memberId, memberName) {
        const raison = prompt(`Raison de l'exclusion de ${memberName} (optionnel):`);
        if (raison !== null) { // null si annulé
            this.exclureMembre(memberId, raison);
        }
    }

    // Actualiser les membres
    actualiserMembres() {
        const container = document.querySelector('.alliance-members-interface');
        if (container) {
            const newInterface = this.creerInterfaceMembres();
            container.replaceWith(newInterface);
        }
        showNotification('👥 Liste des membres actualisée', 'info');
    }

    // Envoyer un message à un membre
    envoyerMessage(memberId) {
        showNotification('💬 Fonctionnalité de message en cours de développement', 'info');
    }

    // Voir le profil d'un membre
    voirProfil(memberId) {
        showNotification('👁️ Fonctionnalité de profil en cours de développement', 'info');
    }
}

// Instance globale
window.allianceMemberSystem = new AllianceMemberSystem();

// Export des fonctions pour utilisation globale
if (typeof window !== 'undefined') {
    window.inviterJoueur = (playerName, message) => allianceMemberSystem.inviterJoueur(playerName, message);
    window.exclureMembre = (memberId, raison) => allianceMemberSystem.exclureMembre(memberId, raison);
    window.changerRangMembre = (memberId, nouveauRole) => allianceMemberSystem.changerRangMembre(memberId, nouveauRole);
    window.quitterAlliance = (raison) => allianceMemberSystem.quitterAlliance(raison);
    window.transfererLeadership = (nouveauLeaderId) => allianceMemberSystem.transfererLeadership(nouveauLeaderId);
}

console.log('👥 Système de gestion des membres d\'alliance chargé!');