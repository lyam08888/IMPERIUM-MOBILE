/**
 * 🏛️ IMPERIUM - Fonction de Recherche d'Alliances
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Fonction principale pour chercher des alliances
function chercherAlliances(criteres = {}) {
    try {
        // Vérifications préliminaires
        if (!window.gameEngine || !window.gameEngine.allianceSystem) {
            console.error('❌ Système d\'alliance non initialisé');
            showNotification('Erreur: Système d\'alliance non disponible', 'error');
            return [];
        }

        const alliances = gameEngine.allianceSystem.alliances;
        const gameState = gameEngine.getGameState();
        const player = gameState.player;

        // Filtrer les alliances selon les critères
        let resultats = Object.values(alliances).filter(alliance => {
            // Exclure l'alliance du joueur s'il en a une
            if (player.alliance && player.alliance.id === alliance.id) {
                return false;
            }

            // Filtrer par nom
            if (criteres.nom && !alliance.name.toLowerCase().includes(criteres.nom.toLowerCase())) {
                return false;
            }

            // Filtrer par tag
            if (criteres.tag && (!alliance.tag || !alliance.tag.toLowerCase().includes(criteres.tag.toLowerCase()))) {
                return false;
            }

            // Filtrer par niveau minimum
            if (criteres.niveauMin && alliance.level < criteres.niveauMin) {
                return false;
            }

            // Filtrer par niveau maximum
            if (criteres.niveauMax && alliance.level > criteres.niveauMax) {
                return false;
            }

            // Filtrer par nombre de membres minimum
            if (criteres.membresMin && Object.keys(alliance.members).length < criteres.membresMin) {
                return false;
            }

            // Filtrer par nombre de membres maximum
            if (criteres.membresMax && Object.keys(alliance.members).length > criteres.membresMax) {
                return false;
            }

            // Filtrer par politique d'adhésion
            if (criteres.politiqueAdhesion && alliance.settings.joinPolicy !== criteres.politiqueAdhesion) {
                return false;
            }

            // Filtrer par langue
            if (criteres.langue && alliance.settings.language !== criteres.langue) {
                return false;
            }

            // Filtrer les alliances complètes si demandé
            if (criteres.excludeCompletes && Object.keys(alliance.members).length >= alliance.maxMembers) {
                return false;
            }

            return true;
        });

        // Trier les résultats
        if (criteres.tri) {
            resultats = trierAlliances(resultats, criteres.tri, criteres.ordreDesc);
        }

        // Limiter le nombre de résultats
        if (criteres.limite && criteres.limite > 0) {
            resultats = resultats.slice(0, criteres.limite);
        }

        console.log(`🔍 ${resultats.length} alliance(s) trouvée(s)`);
        return resultats;

    } catch (error) {
        console.error('❌ Erreur lors de la recherche:', error);
        showNotification(`Erreur de recherche: ${error.message}`, 'error');
        return [];
    }
}

// Recherche rapide par nom
function rechercheRapide(terme) {
    return chercherAlliances({
        nom: terme,
        excludeCompletes: true,
        limite: 10,
        tri: 'niveau',
        ordreDesc: true
    });
}

// Recherche d'alliances recommandées pour le joueur
function obtenirAlliancesRecommandees() {
    try {
        const gameState = gameEngine.getGameState();
        const player = gameState.player;

        // Critères basés sur le niveau du joueur
        const criteres = {
            niveauMin: Math.max(1, player.level - 5),
            niveauMax: player.level + 10,
            excludeCompletes: true,
            politiqueAdhesion: 'open', // Priorité aux alliances ouvertes
            limite: 5,
            tri: 'activite',
            ordreDesc: true
        };

        const recommandees = chercherAlliances(criteres);

        // Si pas assez de résultats, élargir les critères
        if (recommandees.length < 3) {
            delete criteres.politiqueAdhesion;
            criteres.limite = 10;
            return chercherAlliances(criteres);
        }

        return recommandees;

    } catch (error) {
        console.error('❌ Erreur lors de la recherche de recommandations:', error);
        return [];
    }
}

// Trier les alliances selon différents critères
function trierAlliances(alliances, critere, desc = false) {
    const sorted = [...alliances].sort((a, b) => {
        let valeurA, valeurB;

        switch (critere) {
            case 'nom':
                valeurA = a.name.toLowerCase();
                valeurB = b.name.toLowerCase();
                return desc ? valeurB.localeCompare(valeurA) : valeurA.localeCompare(valeurB);

            case 'niveau':
                valeurA = a.level;
                valeurB = b.level;
                break;

            case 'membres':
                valeurA = Object.keys(a.members).length;
                valeurB = Object.keys(b.members).length;
                break;

            case 'creation':
                valeurA = a.createdAt;
                valeurB = b.createdAt;
                break;

            case 'activite':
                valeurA = calculerScoreActivite(a);
                valeurB = calculerScoreActivite(b);
                break;

            case 'puissance':
                valeurA = calculerPuissanceAlliance(a);
                valeurB = calculerPuissanceAlliance(b);
                break;

            default:
                return 0;
        }

        if (desc) {
            return valeurB - valeurA;
        } else {
            return valeurA - valeurB;
        }
    });

    return sorted;
}

// Calculer le score d'activité d'une alliance
function calculerScoreActivite(alliance) {
    let score = 0;
    const maintenant = Date.now();
    const unJour = 24 * 60 * 60 * 1000;

    // Points pour les événements récents
    alliance.events.forEach(event => {
        const age = maintenant - event.timestamp;
        if (age < unJour) score += 10;
        else if (age < 7 * unJour) score += 5;
        else if (age < 30 * unJour) score += 1;
    });

    // Points pour les membres actifs
    Object.values(alliance.members).forEach(member => {
        const age = maintenant - member.lastActive;
        if (age < unJour) score += 5;
        else if (age < 7 * unJour) score += 2;
    });

    return score;
}

// Calculer la puissance totale d'une alliance
function calculerPuissanceAlliance(alliance) {
    let puissance = 0;

    // Puissance basée sur le niveau
    puissance += alliance.level * 1000;

    // Puissance basée sur le nombre de membres
    puissance += Object.keys(alliance.members).length * 500;

    // Puissance basée sur l'expérience
    puissance += alliance.experience;

    return puissance;
}

// Interface de recherche d'alliances
function creerInterfaceRecherche() {
    const container = document.createElement('div');
    container.className = 'alliance-search-interface';
    container.innerHTML = `
        <div class="search-panel">
            <h3>🔍 Rechercher des Alliances</h3>
            
            <form id="alliance-search-form" onsubmit="return effectuerRecherche(event)">
                <div class="search-filters">
                    <div class="filter-row">
                        <div class="form-group">
                            <label class="form-label" for="search-name">Nom de l'Alliance</label>
                            <input type="text" id="search-name" class="form-input" 
                                   placeholder="Rechercher par nom...">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="search-tag">Tag</label>
                            <input type="text" id="search-tag" class="form-input" 
                                   placeholder="Ex: SPQR" maxlength="6">
                        </div>
                    </div>
                    
                    <div class="filter-row">
                        <div class="form-group">
                            <label class="form-label" for="search-level-min">Niveau Min</label>
                            <input type="number" id="search-level-min" class="form-input" 
                                   min="1" max="100" placeholder="1">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="search-level-max">Niveau Max</label>
                            <input type="number" id="search-level-max" class="form-input" 
                                   min="1" max="100" placeholder="100">
                        </div>
                    </div>
                    
                    <div class="filter-row">
                        <div class="form-group">
                            <label class="form-label" for="search-members-min">Membres Min</label>
                            <input type="number" id="search-members-min" class="form-input" 
                                   min="1" placeholder="1">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="search-members-max">Membres Max</label>
                            <input type="number" id="search-members-max" class="form-input" 
                                   min="1" placeholder="50">
                        </div>
                    </div>
                    
                    <div class="filter-row">
                        <div class="form-group">
                            <label class="form-label" for="search-join-policy">Politique d'Adhésion</label>
                            <select id="search-join-policy" class="form-input">
                                <option value="">Toutes</option>
                                <option value="open">Ouverte</option>
                                <option value="request">Sur demande</option>
                                <option value="invite">Sur invitation</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="search-sort">Trier par</label>
                            <select id="search-sort" class="form-input">
                                <option value="niveau">Niveau</option>
                                <option value="nom">Nom</option>
                                <option value="membres">Nombre de membres</option>
                                <option value="activite">Activité</option>
                                <option value="puissance">Puissance</option>
                                <option value="creation">Date de création</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="filter-options">
                        <label class="checkbox-label">
                            <input type="checkbox" id="search-exclude-full" checked>
                            Exclure les alliances complètes
                        </label>
                        
                        <label class="checkbox-label">
                            <input type="checkbox" id="search-desc-order">
                            Ordre décroissant
                        </label>
                    </div>
                </div>
                
                <div class="search-actions">
                    <button type="submit" class="alliance-btn primary">
                        🔍 Rechercher
                    </button>
                    <button type="button" class="alliance-btn secondary" onclick="reinitialiserRecherche()">
                        🔄 Réinitialiser
                    </button>
                    <button type="button" class="alliance-btn" onclick="afficherRecommandations()">
                        ⭐ Recommandations
                    </button>
                </div>
            </form>
            
            <div id="search-results" class="search-results">
                <!-- Résultats générés dynamiquement -->
            </div>
        </div>
    `;
    
    return container;
}

// Effectuer la recherche depuis le formulaire
function effectuerRecherche(event) {
    event.preventDefault();
    
    const criteres = {
        nom: document.getElementById('search-name').value.trim(),
        tag: document.getElementById('search-tag').value.trim(),
        niveauMin: parseInt(document.getElementById('search-level-min').value) || undefined,
        niveauMax: parseInt(document.getElementById('search-level-max').value) || undefined,
        membresMin: parseInt(document.getElementById('search-members-min').value) || undefined,
        membresMax: parseInt(document.getElementById('search-members-max').value) || undefined,
        politiqueAdhesion: document.getElementById('search-join-policy').value || undefined,
        tri: document.getElementById('search-sort').value,
        ordreDesc: document.getElementById('search-desc-order').checked,
        excludeCompletes: document.getElementById('search-exclude-full').checked,
        limite: 20
    };

    const resultats = chercherAlliances(criteres);
    afficherResultatsRecherche(resultats);
    
    return false;
}

// Afficher les résultats de recherche
function afficherResultatsRecherche(alliances) {
    const container = document.getElementById('search-results');
    if (!container) return;

    if (alliances.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h4>🔍 Aucun Résultat</h4>
                <p>Aucune alliance ne correspond à vos critères de recherche.</p>
                <p>Essayez d'élargir vos critères ou consultez nos recommandations.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="results-header">
            <h4>📋 Résultats de Recherche (${alliances.length})</h4>
        </div>
        <div class="results-list">
            ${alliances.map(alliance => creerElementResultat(alliance)).join('')}
        </div>
    `;
}

// Créer un élément de résultat
function creerElementResultat(alliance) {
    const nombreMembres = Object.keys(alliance.members).length;
    const scoreActivite = calculerScoreActivite(alliance);
    const puissance = calculerPuissanceAlliance(alliance);
    
    const politiqueTexte = {
        'open': '🟢 Ouverte',
        'request': '🟡 Sur demande',
        'invite': '🔴 Sur invitation'
    };

    return `
        <div class="alliance-result" data-alliance-id="${alliance.id}">
            <div class="alliance-header">
                <div class="alliance-name-section">
                    <div class="alliance-name">${alliance.name}</div>
                    ${alliance.tag ? `<div class="alliance-tag">[${alliance.tag}]</div>` : ''}
                </div>
                <div class="alliance-level">Niveau ${alliance.level}</div>
            </div>
            
            <div class="alliance-stats">
                <div class="stat-item">
                    <span class="stat-label">Membres:</span>
                    <span class="stat-value">${nombreMembres}/${alliance.maxMembers}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Politique:</span>
                    <span class="stat-value">${politiqueTexte[alliance.settings.joinPolicy] || 'Inconnue'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Activité:</span>
                    <span class="stat-value">${scoreActivite} pts</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Puissance:</span>
                    <span class="stat-value">${puissance.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="alliance-description">
                ${alliance.description || 'Aucune description disponible'}
            </div>
            
            <div class="alliance-bonuses">
                <div class="bonus-item">Production: +${(alliance.bonuses.productionBonus * 100).toFixed(1)}%</div>
                <div class="bonus-item">Défense: +${(alliance.bonuses.defenseBonus * 100).toFixed(1)}%</div>
                <div class="bonus-item">Recherche: +${(alliance.bonuses.researchBonus * 100).toFixed(1)}%</div>
            </div>
            
            <div class="alliance-actions">
                <button class="alliance-btn primary" onclick="demanderAdhesion('${alliance.id}')">
                    📝 Demander à Rejoindre
                </button>
                <button class="alliance-btn secondary" onclick="voirDetailsAlliance('${alliance.id}')">
                    👁️ Voir Détails
                </button>
                <button class="alliance-btn" onclick="contacterAlliance('${alliance.id}')">
                    💬 Contacter
                </button>
            </div>
        </div>
    `;
}

// Réinitialiser le formulaire de recherche
function reinitialiserRecherche() {
    document.getElementById('alliance-search-form').reset();
    document.getElementById('search-results').innerHTML = '';
}

// Afficher les recommandations
function afficherRecommandations() {
    const recommandations = obtenirAlliancesRecommandees();
    afficherResultatsRecherche(recommandations);
    
    // Mettre à jour le titre
    const header = document.querySelector('.results-header h4');
    if (header) {
        header.textContent = `⭐ Alliances Recommandées (${recommandations.length})`;
    }
}

// Demander à rejoindre une alliance
function demanderAdhesion(allianceId) {
    // Cette fonction sera implémentée dans un autre fichier
    console.log('Demande d\'adhésion pour l\'alliance:', allianceId);
    showNotification('Fonctionnalité en cours de développement', 'info');
}

// Contacter une alliance
function contacterAlliance(allianceId) {
    // Cette fonction sera implémentée dans le système de messages
    console.log('Contacter l\'alliance:', allianceId);
    showNotification('Fonctionnalité en cours de développement', 'info');
}

// Export des fonctions pour utilisation globale
if (typeof window !== 'undefined') {
    window.chercherAlliances = chercherAlliances;
    window.rechercheRapide = rechercheRapide;
    window.obtenirAlliancesRecommandees = obtenirAlliancesRecommandees;
    window.creerInterfaceRecherche = creerInterfaceRecherche;
    window.effectuerRecherche = effectuerRecherche;
    window.afficherResultatsRecherche = afficherResultatsRecherche;
    window.reinitialiserRecherche = reinitialiserRecherche;
    window.afficherRecommandations = afficherRecommandations;
    window.demanderAdhesion = demanderAdhesion;
    window.contacterAlliance = contacterAlliance;
}

console.log('🔍 Système de recherche d\'alliances chargé!');