/**
 * 🏛️ IMPERIUM - Générateur de Templates pour fichiers .cs
 * Génère automatiquement le contenu des fichiers .cs vides
 */

// Configuration des templates par catégorie
const TEMPLATES_CONFIG = {
    // Messages
    'Messages': {
        'Nouveau message': {
            functionName: 'creerNouveauMessage',
            description: 'Création d\'un nouveau message',
            icon: '✉️',
            actions: ['ouvrir interface', 'valider destinataire', 'envoyer message']
        },
        'Actualiser': {
            functionName: 'actualiserMessages',
            description: 'Actualisation de la liste des messages',
            icon: '🔄',
            actions: ['recharger messages', 'mettre à jour interface', 'vérifier nouveaux messages']
        },
        'Supprimer': {
            functionName: 'supprimerMessage',
            description: 'Suppression d\'un message',
            icon: '🗑️',
            actions: ['confirmer suppression', 'supprimer message', 'actualiser liste']
        },
        'Tout marquer lu': {
            functionName: 'marquerTousLus',
            description: 'Marquer tous les messages comme lus',
            icon: '✅',
            actions: ['marquer tous lus', 'actualiser compteurs', 'sauvegarder état']
        }
    },

    // Commerce
    'Commerce': {
        'Evolution des prix': {
            functionName: 'afficherEvolutionPrix',
            description: 'Affichage de l\'évolution des prix du marché',
            icon: '📈',
            actions: ['charger données prix', 'générer graphiques', 'afficher tendances']
        },
        'Ordre du marché': {
            functionName: 'gererOrdreMarche',
            description: 'Gestion des ordres de marché',
            icon: '📋',
            actions: ['afficher ordres actifs', 'permettre annulation', 'actualiser statuts']
        },
        'Placer l\'ordre d\'achat': {
            functionName: 'placerOrdreAchat',
            description: 'Placement d\'un ordre d\'achat',
            icon: '💰',
            actions: ['valider ressources', 'créer ordre achat', 'actualiser marché']
        },
        'Placer l\'ordre de vente': {
            functionName: 'placerOrdreVente',
            description: 'Placement d\'un ordre de vente',
            icon: '💸',
            actions: ['vérifier stock', 'créer ordre vente', 'actualiser marché']
        }
    },

    // Empire - Monde
    'Monde': {
        'Commerce': {
            functionName: 'gererCommerceMonde',
            description: 'Gestion du commerce mondial',
            icon: '🌍',
            actions: ['afficher routes commerciales', 'gérer caravanes', 'calculer profits']
        },
        'Diplomatie': {
            functionName: 'gererDiplomatieMonde',
            description: 'Gestion de la diplomatie mondiale',
            icon: '🤝',
            actions: ['afficher relations', 'négocier traités', 'gérer ambassades']
        },
        'Explorer': {
            functionName: 'explorerMonde',
            description: 'Exploration du monde',
            icon: '🗺️',
            actions: ['lancer exploration', 'découvrir territoires', 'cartographier régions']
        },
        'Gérer': {
            functionName: 'gererMonde',
            description: 'Gestion générale du monde',
            icon: '🏛️',
            actions: ['vue d\'ensemble', 'gérer territoires', 'coordonner actions']
        },
        'Nouvelle Expéridition': {
            functionName: 'creerNouvelleExpedition',
            description: 'Création d\'une nouvelle expédition',
            icon: '⛵',
            actions: ['planifier expédition', 'assigner ressources', 'lancer mission']
        },
        'Nouvelle Flotte': {
            functionName: 'creerNouvelleFlotte',
            description: 'Création d\'une nouvelle flotte',
            icon: '🚢',
            actions: ['concevoir flotte', 'assigner navires', 'définir mission']
        }
    },

    // Empire - Province
    'Province': {
        'Attaquer': {
            functionName: 'attaquerProvince',
            description: 'Attaque d\'une province',
            icon: '⚔️',
            actions: ['planifier attaque', 'déployer troupes', 'lancer bataille']
        },
        'Détails': {
            functionName: 'afficherDetailsProvince',
            description: 'Affichage des détails d\'une province',
            icon: '📊',
            actions: ['charger informations', 'afficher statistiques', 'montrer ressources']
        },
        'Gérer': {
            functionName: 'gererProvince',
            description: 'Gestion d\'une province',
            icon: '🏛️',
            actions: ['administrer province', 'gérer population', 'optimiser production']
        }
    },

    // Militaire - Flottes
    'Flottes': {
        'Améliorer Port': {
            functionName: 'ameliorerPort',
            description: 'Amélioration du port',
            icon: '🏗️',
            actions: ['planifier améliorations', 'calculer coûts', 'lancer construction']
        },
        'Construction en Cours': {
            functionName: 'afficherConstructionsEnCours',
            description: 'Affichage des constructions navales en cours',
            icon: '🔨',
            actions: ['lister constructions', 'afficher progression', 'gérer priorités']
        },
        'Construire Marchand': {
            functionName: 'construireNavireMarchand',
            description: 'Construction d\'un navire marchand',
            icon: '🛳️',
            actions: ['vérifier ressources', 'lancer construction', 'planifier livraison']
        },
        'Galères de Guerre': {
            functionName: 'gererGaleresGuerre',
            description: 'Gestion des galères de guerre',
            icon: '⚔️',
            actions: ['afficher flotte guerre', 'gérer équipages', 'planifier missions']
        },
        'Gérer Routes': {
            functionName: 'gererRoutesNavales',
            description: 'Gestion des routes navales',
            icon: '🗺️',
            actions: ['cartographier routes', 'optimiser trajets', 'sécuriser passages']
        },
        'Navires d\'Exploration': {
            functionName: 'gererNaviresExploration',
            description: 'Gestion des navires d\'exploration',
            icon: '🧭',
            actions: ['préparer exploration', 'équiper navires', 'définir objectifs']
        },
        'Nouvelle Expédition': {
            functionName: 'creerExpeditionNavale',
            description: 'Création d\'une expédition navale',
            icon: '⛵',
            actions: ['planifier expédition', 'sélectionner navires', 'définir itinéraire']
        },
        'Rapport Naval': {
            functionName: 'afficherRapportNaval',
            description: 'Affichage du rapport naval',
            icon: '📋',
            actions: ['compiler données', 'générer rapport', 'analyser performances']
        }
    },

    // Militaire - Légions
    'Légions': {
        'Défendre Cité': {
            functionName: 'defenreCite',
            description: 'Défense de la cité',
            icon: '🛡️',
            actions: ['positionner défenses', 'mobiliser troupes', 'coordonner défense']
        },
        'Entraînement Rapide': {
            functionName: 'entrainementRapide',
            description: 'Entraînement rapide des troupes',
            icon: '🏃',
            actions: ['sélectionner unités', 'lancer entraînement', 'améliorer compétences']
        },
        'Nouvelle Campagne': {
            functionName: 'creerNouvelleCampagne',
            description: 'Création d\'une nouvelle campagne militaire',
            icon: '🗡️',
            actions: ['planifier campagne', 'mobiliser légions', 'définir objectifs']
        },
        'Rapport de Bataille': {
            functionName: 'afficherRapportBataille',
            description: 'Affichage du rapport de bataille',
            icon: '📜',
            actions: ['analyser bataille', 'calculer pertes', 'générer rapport']
        },
        'Recruter': {
            functionName: 'recruterTroupes',
            description: 'Recrutement de nouvelles troupes',
            icon: '👥',
            actions: ['vérifier ressources', 'recruter soldats', 'former unités']
        }
    },

    // Diplomatie - Alliances
    'Foedus - Alliances Romaines': {
        'Description': {
            functionName: 'gererDescriptionAlliance',
            description: 'Gestion de la description d\'alliance',
            icon: '📝',
            actions: ['modifier description', 'valider contenu', 'sauvegarder changements']
        },
        'Nom de l\'Alliance': {
            functionName: 'gererNomAlliance',
            description: 'Gestion du nom d\'alliance',
            icon: '🏛️',
            actions: ['modifier nom', 'vérifier disponibilité', 'confirmer changement']
        }
    }
};

// Fonction pour générer le template d'un fichier
function generateTemplate(category, fileName, config) {
    const { functionName, description, icon, actions } = config;
    
    return `/**
 * 🏛️ IMPERIUM - ${description}
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Fonction principale pour ${description.toLowerCase()}
function ${functionName}(${getParametersForFunction(functionName)}) {
    try {
        console.log('${icon} ${description} - Début');
        
        // Vérifications préliminaires
        if (!window.gameEngine) {
            console.error('❌ Moteur de jeu non initialisé');
            showNotification('Erreur: Moteur de jeu non disponible', 'error');
            return false;
        }

        const gameState = gameEngine.getGameState();
        const player = gameState.player;

        // Vérifications spécifiques
        if (!verifierPrerequisFonction('${functionName}', gameState)) {
            return false;
        }

        ${generateActionSteps(actions)}

        // Succès
        console.log('✅ ${description} - Terminé avec succès');
        showNotification('${icon} ${description} réussie', 'success');
        
        // Sauvegarder l'état si nécessaire
        if (gameEngine.saveSystem) {
            gameEngine.saveSystem.sauvegarderJeu('autosave', '${description}');
        }
        
        return true;

    } catch (error) {
        console.error('❌ Erreur lors de ${description.toLowerCase()}:', error);
        showNotification(\`Erreur: \${error.message}\`, 'error');
        return false;
    }
}

// Fonction de vérification des prérequis
function verifierPrerequisFonction(functionName, gameState) {
    ${generatePrerequisiteChecks(category, functionName)}
}

${generateHelperFunctions(category, functionName, actions)}

// Fonction d'interface utilisateur
function creerInterface${functionName.charAt(0).toUpperCase() + functionName.slice(1)}() {
    const container = document.createElement('div');
    container.className = '${functionName.toLowerCase()}-interface';
    
    container.innerHTML = \`
        <div class="action-panel">
            <h3>${icon} ${description}</h3>
            <div class="action-content">
                ${generateUIContent(category, functionName)}
            </div>
            <div class="action-buttons">
                <button class="btn primary" onclick="${functionName}()">
                    ${icon} Exécuter
                </button>
                <button class="btn secondary" onclick="fermerInterface()">
                    ❌ Annuler
                </button>
            </div>
        </div>
    \`;
    
    return container;
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
    window.${functionName} = ${functionName};
    window.creerInterface${functionName.charAt(0).toUpperCase() + functionName.slice(1)} = creerInterface${functionName.charAt(0).toUpperCase() + functionName.slice(1)};
}

console.log('📜 Module ${functionName} chargé');`;
}

// Fonctions utilitaires pour la génération
function getParametersForFunction(functionName) {
    const paramMap = {
        'supprimerMessage': 'messageId',
        'attaquerProvince': 'provinceId',
        'afficherDetailsProvince': 'provinceId',
        'gererProvince': 'provinceId',
        'placerOrdreAchat': 'ressource, quantite, prix',
        'placerOrdreVente': 'ressource, quantite, prix',
        'recruterTroupes': 'typeUnite, quantite',
        'creerNouvelleExpedition': 'destination, objectif',
        'creerExpeditionNavale': 'destination, typeExpedition'
    };
    
    return paramMap[functionName] || '';
}

function generateActionSteps(actions) {
    return actions.map((action, index) => `
        // Étape ${index + 1}: ${action}
        console.log('🔄 ${action}...');
        if (!etape${index + 1}_${action.replace(/[^a-zA-Z0-9]/g, '')}()) {
            throw new Error('Échec lors de: ${action}');
        }`).join('');
}

function generatePrerequisiteChecks(category, functionName) {
    const checks = {
        'Messages': `
            if (!gameState.messageSystem) {
                showNotification('❌ Système de messages non disponible', 'error');
                return false;
            }`,
        'Commerce': `
            if (!gameState.marketSystem) {
                showNotification('❌ Système de marché non disponible', 'error');
                return false;
            }`,
        'Militaire': `
            if (!gameState.military) {
                showNotification('❌ Système militaire non disponible', 'error');
                return false;
            }`,
        'Diplomatie': `
            if (!gameState.allianceSystem) {
                showNotification('❌ Système d'alliance non disponible', 'error');
                return false;
            }`
    };
    
    return checks[category] || `
            // Vérifications génériques
            if (!player) {
                showNotification('❌ Données joueur non disponibles', 'error');
                return false;
            }`;
}

function generateHelperFunctions(category, functionName, actions) {
    return actions.map((action, index) => `
// Fonction helper pour: ${action}
function etape${index + 1}_${action.replace(/[^a-zA-Z0-9]/g, '')}() {
    try {
        // TODO: Implémenter ${action}
        console.log('⚙️ Exécution: ${action}');
        
        // Simulation temporaire
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('✅ ${action} - Terminé');
                resolve(true);
            }, 100);
        });
        
    } catch (error) {
        console.error('❌ Erreur ${action}:', error);
        return false;
    }
}`).join('');
}

function generateUIContent(category, functionName) {
    const uiTemplates = {
        'Messages': '<p>Interface de gestion des messages</p>',
        'Commerce': '<p>Interface de commerce et marché</p>',
        'Militaire': '<p>Interface militaire et stratégique</p>',
        'Diplomatie': '<p>Interface diplomatique et alliances</p>'
    };
    
    return uiTemplates[category] || '<p>Interface générique</p>';
}

// Export du générateur
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TEMPLATES_CONFIG, generateTemplate };
}

console.log('🏗️ Générateur de templates IMPERIUM chargé');