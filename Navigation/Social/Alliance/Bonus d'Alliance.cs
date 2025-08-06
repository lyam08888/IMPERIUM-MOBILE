/**
 * 🏛️ IMPERIUM - Système de Bonus d'Alliance
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Classe principale pour les bonus d'alliance
class AllianceBonusSystem {
    constructor() {
        this.bonusTypes = {
            production: {
                name: 'Production',
                icon: '📈',
                description: 'Augmente la production de toutes les ressources',
                maxLevel: 10,
                baseCost: 1000,
                costMultiplier: 1.5
            },
            defense: {
                name: 'Défense',
                icon: '🛡️',
                description: 'Augmente la défense de tous les membres',
                maxLevel: 10,
                baseCost: 1200,
                costMultiplier: 1.6
            },
            research: {
                name: 'Recherche',
                icon: '🔬',
                description: 'Accélère la recherche technologique',
                maxLevel: 10,
                baseCost: 1500,
                costMultiplier: 1.7
            },
            military: {
                name: 'Militaire',
                icon: '⚔️',
                description: 'Améliore l\'efficacité des unités militaires',
                maxLevel: 10,
                baseCost: 1800,
                costMultiplier: 1.8
            },
            diplomacy: {
                name: 'Diplomatie',
                icon: '🤝',
                description: 'Réduit les coûts diplomatiques et améliore les relations',
                maxLevel: 5,
                baseCost: 2000,
                costMultiplier: 2.0
            },
            treasury: {
                name: 'Trésorerie',
                icon: '💰',
                description: 'Augmente la capacité de stockage de l\'alliance',
                maxLevel: 8,
                baseCost: 1000,
                costMultiplier: 1.4
            }
        };
    }

    // Calculer les bonus actuels d'une alliance
    calculerBonusAlliance(alliance) {
        const bonuses = {
            productionBonus: 0,
            defenseBonus: 0,
            researchBonus: 0,
            militaryBonus: 0,
            diplomacyBonus: 0,
            treasuryBonus: 0
        };

        if (!alliance.bonuses) {
            alliance.bonuses = {};
        }

        // Calculer chaque bonus
        for (const [type, config] of Object.entries(this.bonusTypes)) {
            const level = alliance.bonuses[type] || 0;
            const bonus = this.calculerBonusParNiveau(type, level);
            
            switch (type) {
                case 'production':
                    bonuses.productionBonus = bonus;
                    break;
                case 'defense':
                    bonuses.defenseBonus = bonus;
                    break;
                case 'research':
                    bonuses.researchBonus = bonus;
                    break;
                case 'military':
                    bonuses.militaryBonus = bonus;
                    break;
                case 'diplomacy':
                    bonuses.diplomacyBonus = bonus;
                    break;
                case 'treasury':
                    bonuses.treasuryBonus = bonus;
                    break;
            }
        }

        // Bonus basé sur le niveau de l'alliance
        const levelBonus = alliance.level * 0.01; // 1% par niveau
        bonuses.productionBonus += levelBonus;
        bonuses.defenseBonus += levelBonus;
        bonuses.researchBonus += levelBonus;

        // Bonus basé sur le nombre de membres actifs
        const activeMembers = this.compterMembresActifs(alliance);
        const memberBonus = Math.min(activeMembers * 0.005, 0.1); // Max 10%
        bonuses.productionBonus += memberBonus;

        return bonuses;
    }

    // Calculer le bonus par niveau
    calculerBonusParNiveau(type, level) {
        if (level <= 0) return 0;

        const baseBonus = {
            production: 0.05,    // 5% par niveau
            defense: 0.04,       // 4% par niveau
            research: 0.06,      // 6% par niveau
            military: 0.03,      // 3% par niveau
            diplomacy: 0.08,     // 8% par niveau
            treasury: 0.1        // 10% par niveau
        };

        return (baseBonus[type] || 0) * level;
    }

    // Compter les membres actifs
    compterMembresActifs(alliance) {
        if (!alliance.members) return 0;
        
        const maintenant = Date.now();
        const uneSemaine = 7 * 24 * 60 * 60 * 1000;
        
        return Object.values(alliance.members).filter(member => 
            maintenant - member.lastActive < uneSemaine
        ).length;
    }

    // Améliorer un bonus d'alliance
    async ameliorerBonus(bonusType) {
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
            if (!this.verifierPermissionsAmelioration(alliance, player.id)) {
                throw new Error('Vous n\'avez pas les permissions pour améliorer les bonus');
            }

            if (!this.bonusTypes[bonusType]) {
                throw new Error('Type de bonus invalide');
            }

            const config = this.bonusTypes[bonusType];
            const currentLevel = alliance.bonuses[bonusType] || 0;

            if (currentLevel >= config.maxLevel) {
                throw new Error(`Bonus ${config.name} déjà au niveau maximum`);
            }

            // Calculer le coût
            const cost = this.calculerCoutAmelioration(bonusType, currentLevel);
            
            // Vérifier les ressources de l'alliance
            if (!this.verifierRessourcesAlliance(alliance, cost)) {
                throw new Error('Ressources d\'alliance insuffisantes');
            }

            // Déduire les ressources
            this.deduireRessourcesAlliance(alliance, cost);

            // Améliorer le bonus
            if (!alliance.bonuses) {
                alliance.bonuses = {};
            }
            alliance.bonuses[bonusType] = currentLevel + 1;

            // Ajouter un événement
            this.ajouterEvenementAmelioration(alliance, bonusType, currentLevel + 1, player);

            // Recalculer les bonus
            alliance.calculatedBonuses = this.calculerBonusAlliance(alliance);

            // Sauvegarder
            gameEngine.allianceSystem.saveToStorage();

            showNotification(`✅ Bonus ${config.name} amélioré au niveau ${currentLevel + 1}!`, 'success');
            console.log(`📈 Bonus amélioré: ${bonusType} niveau ${currentLevel + 1}`);

            return true;

        } catch (error) {
            console.error('❌ Erreur amélioration bonus:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            return false;
        }
    }

    // Calculer le coût d'amélioration
    calculerCoutAmelioration(bonusType, currentLevel) {
        const config = this.bonusTypes[bonusType];
        const baseCost = config.baseCost;
        const multiplier = Math.pow(config.costMultiplier, currentLevel);
        
        return {
            gold: Math.floor(baseCost * multiplier),
            influence: Math.floor(baseCost * 0.5 * multiplier),
            experience: Math.floor(baseCost * 0.3 * multiplier)
        };
    }

    // Vérifier les permissions d'amélioration
    verifierPermissionsAmelioration(alliance, playerId) {
        const member = alliance.members[playerId];
        if (!member) return false;
        
        // Seuls les dirigeants peuvent améliorer les bonus
        return member.role === 'Imperator' || member.role === 'Legatus';
    }

    // Vérifier les ressources de l'alliance
    verifierRessourcesAlliance(alliance, cost) {
        if (!alliance.treasury) {
            alliance.treasury = { gold: 0, influence: 0, experience: 0 };
        }
        
        return alliance.treasury.gold >= cost.gold &&
               alliance.treasury.influence >= cost.influence &&
               alliance.treasury.experience >= cost.experience;
    }

    // Déduire les ressources de l'alliance
    deduireRessourcesAlliance(alliance, cost) {
        alliance.treasury.gold -= cost.gold;
        alliance.treasury.influence -= cost.influence;
        alliance.treasury.experience -= cost.experience;
    }

    // Ajouter un événement d'amélioration
    ajouterEvenementAmelioration(alliance, bonusType, newLevel, player) {
        if (!alliance.events) {
            alliance.events = [];
        }
        
        const config = this.bonusTypes[bonusType];
        
        alliance.events.unshift({
            id: `event_${Date.now()}`,
            type: 'bonus_upgrade',
            message: `${player.name} a amélioré le bonus ${config.name} au niveau ${newLevel}`,
            timestamp: Date.now(),
            playerId: player.id,
            data: {
                bonusType: bonusType,
                newLevel: newLevel,
                bonusName: config.name
            }
        });
    }

    // Appliquer les bonus au joueur
    appliquerBonusJoueur(player, alliance) {
        if (!alliance || !alliance.calculatedBonuses) return;
        
        const bonuses = alliance.calculatedBonuses;
        
        // Appliquer les bonus de production
        if (player.production) {
            Object.keys(player.production).forEach(resource => {
                player.production[resource] *= (1 + bonuses.productionBonus);
            });
        }
        
        // Appliquer les bonus de défense
        if (player.military && player.military.defense) {
            player.military.defense *= (1 + bonuses.defenseBonus);
        }
        
        // Appliquer les bonus de recherche
        if (player.research && player.research.speed) {
            player.research.speed *= (1 + bonuses.researchBonus);
        }
        
        // Appliquer les bonus militaires
        if (player.military && player.military.units) {
            Object.values(player.military.units).forEach(unit => {
                if (unit.attack) unit.attack *= (1 + bonuses.militaryBonus);
                if (unit.defense) unit.defense *= (1 + bonuses.militaryBonus);
            });
        }
    }

    // Interface de gestion des bonus
    creerInterfaceBonus(alliance) {
        const container = document.createElement('div');
        container.className = 'alliance-bonus-interface';
        
        const bonuses = this.calculerBonusAlliance(alliance);
        
        container.innerHTML = `
            <div class="bonus-panel">
                <h3>🎯 Bonus d'Alliance</h3>
                
                <div class="current-bonuses">
                    <h4>Bonus Actifs</h4>
                    <div class="bonus-grid">
                        <div class="bonus-item active">
                            <span class="bonus-icon">📈</span>
                            <span class="bonus-name">Production</span>
                            <span class="bonus-value">+${(bonuses.productionBonus * 100).toFixed(1)}%</span>
                        </div>
                        <div class="bonus-item active">
                            <span class="bonus-icon">🛡️</span>
                            <span class="bonus-name">Défense</span>
                            <span class="bonus-value">+${(bonuses.defenseBonus * 100).toFixed(1)}%</span>
                        </div>
                        <div class="bonus-item active">
                            <span class="bonus-icon">🔬</span>
                            <span class="bonus-name">Recherche</span>
                            <span class="bonus-value">+${(bonuses.researchBonus * 100).toFixed(1)}%</span>
                        </div>
                        <div class="bonus-item active">
                            <span class="bonus-icon">⚔️</span>
                            <span class="bonus-name">Militaire</span>
                            <span class="bonus-value">+${(bonuses.militaryBonus * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="bonus-upgrades">
                    <h4>Améliorations Disponibles</h4>
                    <div class="upgrades-list">
                        ${Object.entries(this.bonusTypes).map(([type, config]) => 
                            this.creerElementAmelioration(type, config, alliance)
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
        
        return container;
    }

    // Créer un élément d'amélioration
    creerElementAmelioration(type, config, alliance) {
        const currentLevel = alliance.bonuses[type] || 0;
        const cost = this.calculerCoutAmelioration(type, currentLevel);
        const canUpgrade = currentLevel < config.maxLevel && 
                          this.verifierRessourcesAlliance(alliance, cost);
        
        const gameState = gameEngine.getGameState();
        const hasPermission = this.verifierPermissionsAmelioration(alliance, gameState.player.id);
        
        return `
            <div class="upgrade-item ${canUpgrade && hasPermission ? 'available' : 'unavailable'}">
                <div class="upgrade-header">
                    <span class="upgrade-icon">${config.icon}</span>
                    <div class="upgrade-info">
                        <div class="upgrade-name">${config.name}</div>
                        <div class="upgrade-level">Niveau ${currentLevel}/${config.maxLevel}</div>
                    </div>
                    <div class="upgrade-bonus">
                        +${(this.calculerBonusParNiveau(type, currentLevel + 1) * 100).toFixed(1)}%
                    </div>
                </div>
                
                <div class="upgrade-description">
                    ${config.description}
                </div>
                
                <div class="upgrade-cost">
                    <div class="cost-item">
                        <span class="cost-icon">🪙</span>
                        <span class="cost-amount">${cost.gold.toLocaleString()}</span>
                    </div>
                    <div class="cost-item">
                        <span class="cost-icon">⭐</span>
                        <span class="cost-amount">${cost.influence.toLocaleString()}</span>
                    </div>
                    <div class="cost-item">
                        <span class="cost-icon">🎓</span>
                        <span class="cost-amount">${cost.experience.toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="upgrade-actions">
                    ${currentLevel >= config.maxLevel ? 
                        '<span class="max-level">Niveau Maximum</span>' :
                        !hasPermission ?
                        '<span class="no-permission">Permissions insuffisantes</span>' :
                        !canUpgrade ?
                        '<span class="insufficient-resources">Ressources insuffisantes</span>' :
                        `<button class="upgrade-btn" onclick="allianceBonusSystem.ameliorerBonus('${type}')">
                            🔧 Améliorer
                        </button>`
                    }
                </div>
            </div>
        `;
    }

    // Obtenir un résumé des bonus pour l'affichage
    obtenirResumeBonus(alliance) {
        const bonuses = this.calculerBonusAlliance(alliance);
        
        return {
            production: `+${(bonuses.productionBonus * 100).toFixed(1)}%`,
            defense: `+${(bonuses.defenseBonus * 100).toFixed(1)}%`,
            research: `+${(bonuses.researchBonus * 100).toFixed(1)}%`,
            military: `+${(bonuses.militaryBonus * 100).toFixed(1)}%`,
            diplomacy: `+${(bonuses.diplomacyBonus * 100).toFixed(1)}%`,
            treasury: `+${(bonuses.treasuryBonus * 100).toFixed(1)}%`
        };
    }

    // Calculer la contribution d'un membre aux bonus
    calculerContributionMembre(alliance, memberId) {
        const member = alliance.members[memberId];
        if (!member) return 0;
        
        // Contribution basée sur les donations, participation aux événements, etc.
        let contribution = 0;
        
        // Contribution des ressources
        if (member.contribution && member.contribution.resources) {
            contribution += member.contribution.resources * 0.1;
        }
        
        // Contribution des événements
        if (member.contribution && member.contribution.events) {
            contribution += member.contribution.events * 0.2;
        }
        
        // Bonus pour l'ancienneté
        const anciennete = Date.now() - member.joinedAt;
        const joursAnciennete = anciennete / (24 * 60 * 60 * 1000);
        contribution += Math.min(joursAnciennete * 0.5, 50);
        
        return Math.floor(contribution);
    }
}

// Instance globale
window.allianceBonusSystem = new AllianceBonusSystem();

// Export des fonctions pour utilisation globale
if (typeof window !== 'undefined') {
    window.ameliorerBonus = (bonusType) => allianceBonusSystem.ameliorerBonus(bonusType);
    window.calculerBonusAlliance = (alliance) => allianceBonusSystem.calculerBonusAlliance(alliance);
    window.appliquerBonusJoueur = (player, alliance) => allianceBonusSystem.appliquerBonusJoueur(player, alliance);
}

console.log('🎯 Système de bonus d\'alliance chargé!');