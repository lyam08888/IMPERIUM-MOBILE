/**
 * 🏛️ IMPERIUM - Script de mise à jour des pages
 * Ce script met à jour toutes les pages HTML pour ajouter les interactions aux boutons
 * et assurer que la barre supérieure commune est présente sur toutes les pages
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const rootDir = '.';
const backupDir = './backups';

// Compteurs
let pagesUpdated = 0;
let buttonsUpdated = 0;
let headerAdded = 0;

// Créer le répertoire de sauvegarde s'il n'existe pas
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Fonction pour mettre à jour un fichier HTML
async function updateHtmlFile(filePath) {
    try {
        console.log(`Traitement de ${filePath}...`);
        
        // Lire le contenu du fichier
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Créer une sauvegarde
        const backupPath = path.join(backupDir, path.basename(filePath));
        fs.writeFileSync(backupPath, content);
        
        // Analyser le HTML
        const dom = new JSDOM(content);
        const { document } = dom.window;
        
        // Vérifier si la page a déjà le header commun
        let hasCommonHeader = document.querySelector('.imperium-header-2025') !== null;
        
        // Vérifier si les scripts nécessaires sont inclus
        let hasCommonHeaderScript = false;
        let hasResourceUpdaterScript = false;
        let hasCommonInteractionsScript = false;
        
        // Vérifier les scripts existants
        document.querySelectorAll('script').forEach(script => {
            const src = script.getAttribute('src');
            if (src) {
                if (src.includes('common-header-2025.js')) hasCommonHeaderScript = true;
                if (src.includes('resource-updater.js')) hasResourceUpdaterScript = true;
                if (src.includes('common-interactions.js')) hasCommonInteractionsScript = true;
            }
        });
        
        // Ajouter les scripts manquants
        if (!hasCommonHeaderScript || !hasResourceUpdaterScript || !hasCommonInteractionsScript) {
            const head = document.querySelector('head');
            
            if (head) {
                if (!hasCommonHeaderScript) {
                    const script = document.createElement('script');
                    script.src = getRelativePath(filePath, 'common-header-2025.js');
                    head.appendChild(script);
                }
                
                if (!hasResourceUpdaterScript) {
                    const script = document.createElement('script');
                    script.src = getRelativePath(filePath, 'resource-updater.js');
                    head.appendChild(script);
                }
                
                if (!hasCommonInteractionsScript) {
                    const script = document.createElement('script');
                    script.src = getRelativePath(filePath, 'common-interactions.js');
                    head.appendChild(script);
                }
            }
        }
        
        // Ajouter le CSS moderne s'il n'est pas déjà inclus
        let hasModernCss = false;
        document.querySelectorAll('link').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes('mobile-2025.css')) hasModernCss = true;
        });
        
        if (!hasModernCss) {
            const head = document.querySelector('head');
            
            if (head) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = getRelativePath(filePath, 'mobile-2025.css');
                head.appendChild(link);
            }
        }
        
        // Mettre à jour les boutons et liens
        updateButtons(document, filePath);
        
        // Écrire le HTML mis à jour
        const updatedContent = dom.serialize();
        fs.writeFileSync(filePath, updatedContent);
        
        pagesUpdated++;
        console.log(`✅ ${filePath} mis à jour avec succès`);
    } catch (error) {
        console.error(`❌ Erreur lors de la mise à jour de ${filePath}:`, error);
    }
}

// Fonction pour mettre à jour les boutons et liens
function updateButtons(document, filePath) {
    // Trouver tous les boutons et liens
    const buttons = [...document.querySelectorAll('button, .button, .btn, [role="button"]')];
    const links = [...document.querySelectorAll('a')];
    const clickables = [...document.querySelectorAll('[onclick]')];
    
    // Combiner tous les éléments cliquables
    const allClickables = [...new Set([...buttons, ...links, ...clickables])];
    
    allClickables.forEach(element => {
        const hasOnClick = element.hasAttribute('onclick');
        const hasHref = element.hasAttribute('href');
        const hasEventListener = element.hasAttribute('data-action') || element.hasAttribute('data-function');
        
        // Si l'élément a déjà une action, ne pas le modifier
        if (hasEventListener || (hasOnClick && element.getAttribute('onclick').includes('handleAction'))) {
            return;
        }
        
        // Déterminer l'action en fonction du texte ou de la classe
        let action = determineAction(element);
        
        if (action) {
            // Supprimer l'attribut onclick existant s'il y en a un
            if (hasOnClick) {
                element.removeAttribute('onclick');
            }
            
            // Ajouter l'attribut data-action
            element.setAttribute('data-action', action.type);
            
            // Ajouter les paramètres si nécessaire
            if (action.params) {
                element.setAttribute('data-params', JSON.stringify(action.params));
            }
            
            buttonsUpdated++;
        }
    });
}

// Fonction pour déterminer l'action en fonction du texte ou de la classe
function determineAction(element) {
    const text = element.textContent.trim().toLowerCase();
    const className = element.className || '';
    const id = element.id || '';
    
    // Construire un objet d'action
    let action = null;
    
    // Actions de construction
    if (text.includes('construire') || text.includes('bâtir') || className.includes('build')) {
        const buildingType = getBuildingType(text, className, id);
        action = {
            type: 'build',
            params: {
                buildingType: buildingType || 'generic_building',
                cost: getResourceCost(buildingType),
                time: 5000
            }
        };
    }
    // Actions d'amélioration
    else if (text.includes('améliorer') || text.includes('upgrade')) {
        const buildingType = getBuildingType(text, className, id);
        action = {
            type: 'upgrade',
            params: {
                buildingType: buildingType || 'generic_building',
                cost: getResourceCost(buildingType, true),
                time: 8000
            }
        };
    }
    // Actions de recherche
    else if (text.includes('rechercher') || text.includes('recherche') || className.includes('research')) {
        const researchType = getResearchType(text, className, id);
        action = {
            type: 'research',
            params: {
                researchType: researchType || 'generic_research',
                cost: getResearchCost(researchType),
                time: 10000,
                benefits: getResearchBenefits(researchType)
            }
        };
    }
    // Actions d'entraînement
    else if (text.includes('entraîner') || text.includes('recruter') || className.includes('train')) {
        const unitType = getUnitType(text, className, id);
        action = {
            type: 'train',
            params: {
                unitType: unitType || 'generic_unit',
                count: 10,
                cost: getUnitCost(unitType),
                time: 5000
            }
        };
    }
    // Actions d'attaque
    else if (text.includes('attaquer') || className.includes('attack')) {
        action = {
            type: 'attack',
            params: {
                target: 'Ennemi',
                units: {
                    'legionnaire': 50,
                    'archer': 20
                },
                travelTime: 8000
            }
        };
    }
    // Actions de défense
    else if (text.includes('défendre') || className.includes('defend')) {
        action = {
            type: 'defend',
            params: {
                units: {
                    'legionnaire': 30,
                    'archer': 15
                }
            }
        };
    }
    // Actions d'achat
    else if (text.includes('acheter') || className.includes('buy')) {
        const resourceType = getResourceType(text, className, id);
        action = {
            type: 'buy',
            params: {
                resourceType: resourceType || 'wood',
                amount: 100,
                price: getResourcePrice(resourceType)
            }
        };
    }
    // Actions de vente
    else if (text.includes('vendre') || className.includes('sell')) {
        const resourceType = getResourceType(text, className, id);
        action = {
            type: 'sell',
            params: {
                resourceType: resourceType || 'wood',
                amount: 100,
                price: getResourcePrice(resourceType)
            }
        };
    }
    // Actions d'alliance
    else if (text.includes('alliance') || className.includes('alliance')) {
        action = {
            type: 'alliance',
            params: {
                faction: 'Rome',
                action: 'propose'
            }
        };
    }
    // Actions de traité
    else if (text.includes('traité') || className.includes('treaty')) {
        action = {
            type: 'treaty',
            params: {
                faction: 'Carthage',
                type: 'peace',
                duration: 86400000 // 1 jour
            }
        };
    }
    // Actions de guerre
    else if (text.includes('guerre') || className.includes('war')) {
        action = {
            type: 'war',
            params: {
                faction: 'Gaule',
                action: 'declare'
            }
        };
    }
    // Actions de collecte
    else if (text.includes('collecter') || className.includes('collect')) {
        const resourceType = getResourceType(text, className, id);
        action = {
            type: 'collect',
            params: {
                resourceType: resourceType || 'gold',
                amount: 100
            }
        };
    }
    // Actions de production
    else if (text.includes('produire') || className.includes('produce')) {
        action = {
            type: 'produce',
            params: {
                resources: {
                    'wood': 50,
                    'stone': 30
                },
                time: 5000
            }
        };
    }
    // Actions de navigation
    else if (element.tagName.toLowerCase() === 'a' || text.includes('aller') || text.includes('voir')) {
        const href = element.getAttribute('href');
        
        if (href && href !== '#') {
            // Laisser le lien fonctionner normalement
            return null;
        }
        
        // Déterminer la page cible
        let page = 'index';
        let section = null;
        
        if (text.includes('cité')) {
            page = 'cite';
            section = 'Empire';
        } else if (text.includes('monde')) {
            page = 'monde';
            section = 'Empire';
        } else if (text.includes('province')) {
            page = 'province';
            section = 'Empire';
        } else if (text.includes('académie')) {
            page = 'academie';
            section = 'Developpement';
        } else if (text.includes('commerce')) {
            page = 'commerce';
            section = 'Developpement';
        } else if (text.includes('légion')) {
            page = 'legions';
            section = 'Militaire';
        } else if (text.includes('flotte')) {
            page = 'flotte';
            section = 'Militaire';
        } else if (text.includes('simulateur')) {
            page = 'simulateur';
            section = 'Militaire';
        } else if (text.includes('diplomatie')) {
            page = 'diplomatie';
            section = 'Social';
        } else if (text.includes('alliance')) {
            page = 'alliance';
            section = 'Social';
        } else if (text.includes('message')) {
            page = 'messages';
            section = 'Social';
        } else if (text.includes('premium')) {
            page = 'premium';
            section = 'Premium';
        }
        
        action = {
            type: 'navigate',
            params: {
                page,
                section
            }
        };
    }
    // Actions d'interface
    else if (text.includes('ouvrir')) {
        action = {
            type: 'open',
            params: {
                elementId: 'popup-' + (id || 'default')
            }
        };
    }
    else if (text.includes('fermer')) {
        action = {
            type: 'close',
            params: {
                elementId: 'popup-' + (id || 'default')
            }
        };
    }
    else if (text.includes('basculer') || text.includes('toggle')) {
        action = {
            type: 'toggle',
            params: {
                elementId: id || 'toggle-element',
                className: 'active'
            }
        };
    }
    
    return action;
}

// Fonction pour obtenir le type de bâtiment
function getBuildingType(text, className, id) {
    text = text.toLowerCase();
    
    if (text.includes('forum')) return 'forum';
    if (text.includes('temple')) return 'temple';
    if (text.includes('marché')) return 'market';
    if (text.includes('caserne')) return 'barracks';
    if (text.includes('port')) return 'port';
    if (text.includes('muraille')) return 'wall';
    if (text.includes('aqueduc')) return 'aqueduct';
    if (text.includes('académie')) return 'academy';
    if (text.includes('ferme')) return 'farm';
    if (text.includes('mine')) return 'mine';
    if (text.includes('scierie')) return 'sawmill';
    if (text.includes('carrière')) return 'quarry';
    if (text.includes('entrepôt')) return 'warehouse';
    if (text.includes('théâtre')) return 'theater';
    if (text.includes('bains')) return 'baths';
    if (text.includes('colisée')) return 'colosseum';
    
    return 'generic_building';
}

// Fonction pour obtenir le type de recherche
function getResearchType(text, className, id) {
    text = text.toLowerCase();
    
    if (text.includes('agriculture')) return 'agriculture';
    if (text.includes('métallurgie')) return 'metallurgy';
    if (text.includes('architecture')) return 'architecture';
    if (text.includes('médecine')) return 'medicine';
    if (text.includes('tactique')) return 'tactics';
    if (text.includes('navigation')) return 'navigation';
    if (text.includes('commerce')) return 'commerce';
    if (text.includes('philosophie')) return 'philosophy';
    if (text.includes('ingénierie')) return 'engineering';
    if (text.includes('mathématiques')) return 'mathematics';
    if (text.includes('astronomie')) return 'astronomy';
    if (text.includes('alchimie')) return 'alchemy';
    if (text.includes('urbanisme')) return 'urbanism';
    if (text.includes('diplomatie')) return 'diplomacy';
    if (text.includes('militaire')) return 'military';
    if (text.includes('économie')) return 'economy';
    if (text.includes('aqueducs')) return 'aqueducts';
    if (text.includes('phalanges')) return 'phalanx';
    if (text.includes('siège')) return 'siege';
    if (text.includes('monnaie')) return 'currency';
    if (text.includes('routes')) return 'roads';
    
    return 'generic_research';
}

// Fonction pour obtenir le type d'unité
function getUnitType(text, className, id) {
    text = text.toLowerCase();
    
    if (text.includes('légionnaire')) return 'legionnaire';
    if (text.includes('archer')) return 'archer';
    if (text.includes('cavalier')) return 'cavalry';
    if (text.includes('catapulte')) return 'catapult';
    if (text.includes('bélier')) return 'ram';
    if (text.includes('trirème')) return 'trireme';
    if (text.includes('galère')) return 'galley';
    if (text.includes('navire')) return 'ship';
    if (text.includes('éclaireur')) return 'scout';
    if (text.includes('centurion')) return 'centurion';
    if (text.includes('prétoriens')) return 'praetorian';
    if (text.includes('hoplite')) return 'hoplite';
    
    return 'generic_unit';
}

// Fonction pour obtenir le type de ressource
function getResourceType(text, className, id) {
    text = text.toLowerCase();
    
    if (text.includes('bois')) return 'wood';
    if (text.includes('pierre')) return 'stone';
    if (text.includes('fer')) return 'iron';
    if (text.includes('or')) return 'gold';
    if (text.includes('nourriture')) return 'food';
    if (text.includes('population')) return 'population';
    if (text.includes('recherche')) return 'research';
    
    return 'generic_resource';
}

// Fonction pour obtenir le coût en ressources d'un bâtiment
function getResourceCost(buildingType, isUpgrade = false) {
    const baseCosts = {
        'forum': { wood: 100, stone: 200, gold: 50 },
        'temple': { wood: 150, stone: 300, gold: 100 },
        'market': { wood: 200, stone: 100, gold: 150 },
        'barracks': { wood: 300, stone: 200, gold: 100 },
        'port': { wood: 400, stone: 300, gold: 200 },
        'wall': { stone: 500, iron: 100 },
        'aqueduct': { stone: 300, iron: 50 },
        'academy': { wood: 200, stone: 300, gold: 150 },
        'farm': { wood: 100, stone: 50 },
        'mine': { wood: 150, stone: 100 },
        'sawmill': { wood: 50, stone: 100 },
        'quarry': { wood: 150, stone: 50 },
        'warehouse': { wood: 200, stone: 200 },
        'theater': { wood: 150, stone: 250, gold: 100 },
        'baths': { wood: 100, stone: 300, gold: 150 },
        'colosseum': { wood: 300, stone: 500, gold: 300 },
        'generic_building': { wood: 100, stone: 100, gold: 50 }
    };
    
    const cost = baseCosts[buildingType] || baseCosts['generic_building'];
    
    // Si c'est une amélioration, augmenter le coût
    if (isUpgrade) {
        Object.keys(cost).forEach(resource => {
            cost[resource] = Math.floor(cost[resource] * 1.5);
        });
    }
    
    return cost;
}

// Fonction pour obtenir le coût en ressources d'une recherche
function getResearchCost(researchType) {
    const baseCosts = {
        'agriculture': { food: 100, gold: 50, research: 20 },
        'metallurgy': { iron: 150, gold: 100, research: 30 },
        'architecture': { stone: 200, wood: 100, research: 40 },
        'medicine': { food: 150, gold: 150, research: 50 },
        'tactics': { gold: 200, research: 60 },
        'navigation': { wood: 300, gold: 150, research: 50 },
        'commerce': { gold: 300, research: 40 },
        'philosophy': { gold: 100, research: 80 },
        'engineering': { stone: 200, iron: 100, research: 60 },
        'mathematics': { gold: 100, research: 70 },
        'astronomy': { gold: 150, research: 80 },
        'alchemy': { gold: 200, iron: 100, research: 90 },
        'urbanism': { stone: 150, gold: 100, research: 50 },
        'diplomacy': { gold: 250, research: 60 },
        'military': { iron: 200, gold: 150, research: 70 },
        'economy': { gold: 300, research: 50 },
        'aqueducts': { stone: 100, research: 50 },
        'phalanx': { iron: 100, research: 60 },
        'siege': { iron: 200, research: 120 },
        'currency': { gold: 500, research: 70 },
        'roads': { wood: 200, gold: 300, research: 100 },
        'generic_research': { gold: 100, research: 50 }
    };
    
    return baseCosts[researchType] || baseCosts['generic_research'];
}

// Fonction pour obtenir les bénéfices d'une recherche
function getResearchBenefits(researchType) {
    const benefits = {
        'agriculture': {
            productionBoost: { food: 0.2 },
            maxResourceBoost: { food: 0.1 }
        },
        'metallurgy': {
            productionBoost: { iron: 0.2 }
        },
        'architecture': {
            unlockBuilding: ['temple', 'theater']
        },
        'medicine': {
            productionBoost: { population: 0.1 }
        },
        'tactics': {
            unlockUnit: ['centurion']
        },
        'navigation': {
            unlockUnit: ['trireme']
        },
        'commerce': {
            productionBoost: { gold: 0.15 }
        },
        'philosophy': {
            productionBoost: { research: 0.2 }
        },
        'engineering': {
            unlockBuilding: ['aqueduct', 'colosseum']
        },
        'mathematics': {
            productionBoost: { research: 0.1 }
        },
        'astronomy': {
            unlockBuilding: ['observatory']
        },
        'alchemy': {
            productionBoost: { gold: 0.1, iron: 0.1 }
        },
        'urbanism': {
            maxResourceBoost: { population: 0.2 }
        },
        'diplomacy': {
            unlockBuilding: ['embassy']
        },
        'military': {
            unlockUnit: ['praetorian']
        },
        'economy': {
            productionBoost: { gold: 0.2 }
        },
        'aqueducts': {
            productionBoost: { population: 0.15 }
        },
        'phalanx': {
            unlockUnit: ['hoplite']
        },
        'siege': {
            unlockUnit: ['catapult', 'ram']
        },
        'currency': {
            productionBoost: { gold: 0.25 }
        },
        'roads': {
            productionBoost: { gold: 0.1, food: 0.1, wood: 0.1, stone: 0.1, iron: 0.1 }
        },
        'generic_research': {
            productionBoost: { research: 0.1 }
        }
    };
    
    return benefits[researchType] || benefits['generic_research'];
}

// Fonction pour obtenir le coût en ressources d'une unité
function getUnitCost(unitType) {
    const baseCosts = {
        'legionnaire': { food: 50, iron: 30, gold: 20 },
        'archer': { food: 40, wood: 50, gold: 15 },
        'cavalry': { food: 80, iron: 40, gold: 30 },
        'catapult': { wood: 200, iron: 100, gold: 50 },
        'ram': { wood: 150, iron: 80, gold: 40 },
        'trireme': { wood: 300, iron: 100, gold: 80 },
        'galley': { wood: 200, iron: 50, gold: 60 },
        'ship': { wood: 250, iron: 80, gold: 70 },
        'scout': { food: 30, gold: 10 },
        'centurion': { food: 100, iron: 60, gold: 40 },
        'praetorian': { food: 120, iron: 80, gold: 60 },
        'hoplite': { food: 60, iron: 40, gold: 30 },
        'generic_unit': { food: 50, iron: 30, gold: 20 }
    };
    
    return baseCosts[unitType] || baseCosts['generic_unit'];
}

// Fonction pour obtenir le prix d'une ressource
function getResourcePrice(resourceType) {
    const basePrices = {
        'wood': 2,
        'stone': 3,
        'iron': 4,
        'food': 1,
        'research': 10,
        'generic_resource': 2
    };
    
    return basePrices[resourceType] || basePrices['generic_resource'];
}

// Fonction pour obtenir le chemin relatif
function getRelativePath(filePath, targetFile) {
    const depth = filePath.split('/').length - 1;
    let relativePath = '';
    
    for (let i = 0; i < depth - 1; i++) {
        relativePath += '../';
    }
    
    return relativePath + targetFile;
}

// Fonction pour parcourir récursivement les répertoires
async function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && file !== 'backups' && file !== 'node_modules') {
            await walkDir(filePath);
        } else if (file.endsWith('.html')) {
            await updateHtmlFile(filePath);
        }
    }
}

// Fonction principale
async function main() {
    console.log('Démarrage de la mise à jour des pages...');
    
    try {
        await walkDir(rootDir);
        
        console.log('\nMise à jour terminée!');
        console.log(`Pages mises à jour: ${pagesUpdated}`);
        console.log(`Boutons mis à jour: ${buttonsUpdated}`);
        console.log(`Headers ajoutés: ${headerAdded}`);
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
    }
}

// Exécuter le script
main();