/**
 * 🏛️ IMPERIUM - Événements Récents d'Alliance
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Classe principale pour les événements récents d'alliance
class AllianceEventsSystem {
    constructor() {
        this.maxEvents = 200;
        this.eventTypes = {
            member_joined: {
                icon: '👥',
                color: '#22c55e',
                title: 'Nouveau Membre'
            },
            member_left: {
                icon: '🚪',
                color: '#f59e0b',
                title: 'Membre Parti'
            },
            member_kicked: {
                icon: '🦵',
                color: '#ef4444',
                title: 'Membre Exclu'
            },
            bonus_upgrade: {
                icon: '📈',
                color: '#3b82f6',
                title: 'Bonus Amélioré'
            },
            alliance_war: {
                icon: '⚔️',
                color: '#dc2626',
                title: 'Guerre Déclarée'
            },
            alliance_peace: {
                icon: '🕊️',
                color: '#10b981',
                title: 'Paix Signée'
            },
            resource_donation: {
                icon: '💰',
                color: '#f59e0b',
                title: 'Don de Ressources'
            },
            event_created: {
                icon: '🎉',
                color: '#8b5cf6',
                title: 'Événement Organisé'
            },
            achievement: {
                icon: '🏆',
                color: '#fbbf24',
                title: 'Succès Débloqué'
            },
            alliance_level_up: {
                icon: '⭐',
                color: '#06b6d4',
                title: 'Niveau Supérieur'
            }
        };
    }

    // Ajouter un événement
    ajouterEvenement(allianceId, type, message, data = {}) {
        try {
            const alliance = gameEngine.allianceSystem.alliances[allianceId];
            if (!alliance) {
                console.error('Alliance introuvable pour l\'événement');
                return false;
            }

            // Créer l'événement
            const evenement = {
                id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: type,
                message: message,
                timestamp: Date.now(),
                data: data,
                playerId: data.playerId || null,
                playerName: data.playerName || null
            };

            // Initialiser la liste des événements si nécessaire
            if (!alliance.events) {
                alliance.events = [];
            }

            // Ajouter l'événement
            alliance.events.unshift(evenement);

            // Limiter le nombre d'événements
            if (alliance.events.length > this.maxEvents) {
                alliance.events = alliance.events.slice(0, this.maxEvents);
            }

            // Sauvegarder
            gameEngine.allianceSystem.saveToStorage();

            // Mettre à jour l'interface si elle est visible
            this.mettreAJourInterfaceEvenements();

            console.log('📅 Événement ajouté:', evenement);
            return true;

        } catch (error) {
            console.error('❌ Erreur ajout événement:', error);
            return false;
        }
    }

    // Obtenir les événements récents
    obtenirEvenementsRecents(allianceId, limite = 50, filtre = null) {
        const alliance = gameEngine.allianceSystem.alliances[allianceId];
        if (!alliance || !alliance.events) {
            return [];
        }

        let evenements = alliance.events;

        // Appliquer le filtre si spécifié
        if (filtre) {
            if (filtre.type) {
                evenements = evenements.filter(event => event.type === filtre.type);
            }
            if (filtre.playerId) {
                evenements = evenements.filter(event => event.playerId === filtre.playerId);
            }
            if (filtre.dateDebut) {
                evenements = evenements.filter(event => event.timestamp >= filtre.dateDebut);
            }
            if (filtre.dateFin) {
                evenements = evenements.filter(event => event.timestamp <= filtre.dateFin);
            }
        }

        return evenements.slice(0, limite);
    }

    // Obtenir les statistiques des événements
    obtenirStatistiquesEvenements(allianceId, periode = 7) { // 7 jours par défaut
        const alliance = gameEngine.allianceSystem.alliances[allianceId];
        if (!alliance || !alliance.events) {
            return {};
        }

        const maintenant = Date.now();
        const periodeMs = periode * 24 * 60 * 60 * 1000;
        const dateDebut = maintenant - periodeMs;

        const evenementsRecents = alliance.events.filter(event => 
            event.timestamp >= dateDebut
        );

        const statistiques = {
            total: evenementsRecents.length,
            parType: {},
            parJour: {},
            membresActifs: new Set()
        };

        // Compter par type
        evenementsRecents.forEach(event => {
            if (!statistiques.parType[event.type]) {
                statistiques.parType[event.type] = 0;
            }
            statistiques.parType[event.type]++;

            // Compter les membres actifs
            if (event.playerId) {
                statistiques.membresActifs.add(event.playerId);
            }

            // Compter par jour
            const jour = new Date(event.timestamp).toDateString();
            if (!statistiques.parJour[jour]) {
                statistiques.parJour[jour] = 0;
            }
            statistiques.parJour[jour]++;
        });

        statistiques.membresActifs = statistiques.membresActifs.size;

        return statistiques;
    }

    // Nettoyer les anciens événements
    nettoyerAncienEvenements(allianceId, ageMaxJours = 30) {
        try {
            const alliance = gameEngine.allianceSystem.alliances[allianceId];
            if (!alliance || !alliance.events) {
                return 0;
            }

            const maintenant = Date.now();
            const ageMaxMs = ageMaxJours * 24 * 60 * 60 * 1000;
            const dateLimit = maintenant - ageMaxMs;

            const nombreAvant = alliance.events.length;
            alliance.events = alliance.events.filter(event => 
                event.timestamp >= dateLimit
            );
            const nombreApres = alliance.events.length;

            const nombreSupprimes = nombreAvant - nombreApres;

            if (nombreSupprimes > 0) {
                gameEngine.allianceSystem.saveToStorage();
                console.log(`🧹 ${nombreSupprimes} anciens événements supprimés`);
            }

            return nombreSupprimes;

        } catch (error) {
            console.error('❌ Erreur nettoyage événements:', error);
            return 0;
        }
    }

    // Interface des événements récents
    creerInterfaceEvenements() {
        const container = document.createElement('div');
        container.className = 'alliance-events-interface';
        container.id = 'alliance-events-container';
        
        const gameState = gameEngine.getGameState();
        if (!gameState.player.alliance) {
            container.innerHTML = '<div class="no-alliance">Vous n\'êtes pas membre d\'une alliance</div>';
            return container;
        }

        const allianceId = gameState.player.alliance.id;
        const evenements = this.obtenirEvenementsRecents(allianceId, 30);
        const statistiques = this.obtenirStatistiquesEvenements(allianceId);
        
        container.innerHTML = `
            <div class="events-panel">
                <div class="events-header">
                    <h3>📅 Événements Récents</h3>
                    <div class="events-controls">
                        <select id="events-filter" onchange="allianceEventsSystem.appliquerFiltre()">
                            <option value="">Tous les événements</option>
                            <option value="member_joined">Nouveaux membres</option>
                            <option value="member_left">Départs</option>
                            <option value="bonus_upgrade">Améliorations</option>
                            <option value="resource_donation">Donations</option>
                            <option value="alliance_war">Guerres</option>
                            <option value="achievement">Succès</option>
                        </select>
                        <button class="events-btn" onclick="allianceEventsSystem.actualiserEvenements()">🔄</button>
                    </div>
                </div>
                
                <div class="events-stats">
                    <div class="stat-item">
                        <span class="stat-value">${statistiques.total}</span>
                        <span class="stat-label">Cette semaine</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${statistiques.membresActifs}</span>
                        <span class="stat-label">Membres actifs</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${Object.keys(statistiques.parType).length}</span>
                        <span class="stat-label">Types d'événements</span>
                    </div>
                </div>
                
                <div class="events-list" id="events-list">
                    ${evenements.length === 0 ? 
                        '<div class="no-events">Aucun événement récent</div>' :
                        evenements.map(event => this.creerElementEvenement(event)).join('')
                    }
                </div>
                
                <div class="events-actions">
                    <button class="events-btn" onclick="allianceEventsSystem.chargerPlusEvenements()">
                        📜 Charger Plus
                    </button>
                    <button class="events-btn secondary" onclick="allianceEventsSystem.exporterEvenements()">
                        📤 Exporter
                    </button>
                </div>
            </div>
        `;
        
        return container;
    }

    // Créer un élément d'événement
    creerElementEvenement(evenement) {
        const config = this.eventTypes[evenement.type] || {
            icon: '📋',
            color: '#6b7280',
            title: 'Événement'
        };

        const date = new Date(evenement.timestamp);
        const dateFormatee = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const heureFormatee = date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const tempsEcoule = this.calculerTempsEcoule(evenement.timestamp);

        return `
            <div class="event-item" data-event-type="${evenement.type}">
                <div class="event-icon" style="background-color: ${config.color}">
                    ${config.icon}
                </div>
                <div class="event-content">
                    <div class="event-header">
                        <span class="event-title">${config.title}</span>
                        <span class="event-time" title="${dateFormatee} à ${heureFormatee}">
                            ${tempsEcoule}
                        </span>
                    </div>
                    <div class="event-message">
                        ${this.formaterMessageEvenement(evenement)}
                    </div>
                    ${evenement.data && Object.keys(evenement.data).length > 0 ? 
                        `<div class="event-details">
                            ${this.creerDetailsEvenement(evenement)}
                        </div>` : ''
                    }
                </div>
            </div>
        `;
    }

    // Formater le message d'un événement
    formaterMessageEvenement(evenement) {
        let message = evenement.message;

        // Remplacer les mentions de joueurs
        if (evenement.playerName) {
            message = message.replace(evenement.playerName, 
                `<span class="player-mention">${evenement.playerName}</span>`);
        }

        // Ajouter des liens pour certains types d'événements
        if (evenement.type === 'bonus_upgrade' && evenement.data.bonusType) {
            message += ` <a href="#" onclick="allianceEventsSystem.voirBonus('${evenement.data.bonusType}')" class="event-link">Voir les bonus</a>`;
        }

        return message;
    }

    // Créer les détails d'un événement
    creerDetailsEvenement(evenement) {
        const data = evenement.data;
        let details = [];

        switch (evenement.type) {
            case 'bonus_upgrade':
                if (data.bonusType && data.newLevel) {
                    details.push(`Bonus: ${data.bonusName || data.bonusType}`);
                    details.push(`Nouveau niveau: ${data.newLevel}`);
                }
                break;

            case 'resource_donation':
                if (data.resources) {
                    const ressources = Object.entries(data.resources)
                        .map(([type, amount]) => `${amount.toLocaleString()} ${type}`)
                        .join(', ');
                    details.push(`Ressources: ${ressources}`);
                }
                break;

            case 'alliance_war':
                if (data.targetAlliance) {
                    details.push(`Cible: ${data.targetAlliance}`);
                }
                if (data.reason) {
                    details.push(`Raison: ${data.reason}`);
                }
                break;

            case 'achievement':
                if (data.achievementName) {
                    details.push(`Succès: ${data.achievementName}`);
                }
                if (data.reward) {
                    details.push(`Récompense: ${data.reward}`);
                }
                break;
        }

        return details.map(detail => `<div class="event-detail">${detail}</div>`).join('');
    }

    // Calculer le temps écoulé
    calculerTempsEcoule(timestamp) {
        const maintenant = Date.now();
        const difference = maintenant - timestamp;

        const minutes = Math.floor(difference / (1000 * 60));
        const heures = Math.floor(difference / (1000 * 60 * 60));
        const jours = Math.floor(difference / (1000 * 60 * 60 * 24));

        if (jours > 0) {
            return `il y a ${jours} jour${jours > 1 ? 's' : ''}`;
        } else if (heures > 0) {
            return `il y a ${heures} heure${heures > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
            return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
            return 'à l\'instant';
        }
    }

    // Appliquer un filtre
    appliquerFiltre() {
        const filtre = document.getElementById('events-filter').value;
        const gameState = gameEngine.getGameState();
        
        if (!gameState.player.alliance) return;

        const evenements = this.obtenirEvenementsRecents(
            gameState.player.alliance.id, 
            30, 
            filtre ? { type: filtre } : null
        );

        const container = document.getElementById('events-list');
        if (container) {
            container.innerHTML = evenements.length === 0 ? 
                '<div class="no-events">Aucun événement trouvé</div>' :
                evenements.map(event => this.creerElementEvenement(event)).join('');
        }
    }

    // Actualiser les événements
    actualiserEvenements() {
        const container = document.getElementById('alliance-events-container');
        if (container) {
            const newInterface = this.creerInterfaceEvenements();
            container.replaceWith(newInterface);
        }
        showNotification('📅 Événements actualisés', 'info');
    }

    // Charger plus d'événements
    chargerPlusEvenements() {
        // Ici on pourrait implémenter une pagination
        showNotification('📜 Fonctionnalité en cours de développement', 'info');
    }

    // Exporter les événements
    exporterEvenements() {
        const gameState = gameEngine.getGameState();
        if (!gameState.player.alliance) return;

        const evenements = this.obtenirEvenementsRecents(gameState.player.alliance.id, 100);
        const alliance = gameEngine.allianceSystem.alliances[gameState.player.alliance.id];

        const exportData = {
            alliance: alliance.name,
            exportDate: new Date().toISOString(),
            events: evenements.map(event => ({
                type: event.type,
                message: event.message,
                timestamp: new Date(event.timestamp).toISOString(),
                playerName: event.playerName,
                data: event.data
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evenements_${alliance.name}_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('📤 Événements exportés', 'success');
    }

    // Voir les bonus (lien depuis un événement)
    voirBonus(bonusType) {
        // Rediriger vers la section des bonus
        showNotification(`🎯 Affichage des bonus ${bonusType}`, 'info');
    }

    // Mettre à jour l'interface des événements
    mettreAJourInterfaceEvenements() {
        // Recharger l'interface si elle est visible
        if (document.getElementById('alliance-events-container')) {
            this.actualiserEvenements();
        }
    }

    // Événements prédéfinis pour faciliter l'utilisation
    evenementMembreRejoint(allianceId, playerName, playerId) {
        this.ajouterEvenement(allianceId, 'member_joined', 
            `${playerName} a rejoint l'alliance`, 
            { playerId, playerName });
    }

    evenementMembreParti(allianceId, playerName, playerId) {
        this.ajouterEvenement(allianceId, 'member_left', 
            `${playerName} a quitté l'alliance`, 
            { playerId, playerName });
    }

    evenementBonusAmeliore(allianceId, bonusType, newLevel, playerName, playerId) {
        this.ajouterEvenement(allianceId, 'bonus_upgrade', 
            `${playerName} a amélioré un bonus d'alliance`, 
            { bonusType, newLevel, playerId, playerName });
    }

    evenementDonRessources(allianceId, resources, playerName, playerId) {
        const total = Object.values(resources).reduce((sum, amount) => sum + amount, 0);
        this.ajouterEvenement(allianceId, 'resource_donation', 
            `${playerName} a fait un don de ressources`, 
            { resources, total, playerId, playerName });
    }
}

// Instance globale
window.allianceEventsSystem = new AllianceEventsSystem();

// Export des fonctions pour utilisation globale
if (typeof window !== 'undefined') {
    window.ajouterEvenementAlliance = (allianceId, type, message, data) => 
        allianceEventsSystem.ajouterEvenement(allianceId, type, message, data);
    window.obtenirEvenementsAlliance = (allianceId, limite, filtre) => 
        allianceEventsSystem.obtenirEvenementsRecents(allianceId, limite, filtre);
}

console.log('📅 Système d\'événements d\'alliance chargé!');