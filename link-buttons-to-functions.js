/**
 * 🏛️ IMPERIUM - Système de Liaison Boutons-Fonctions
 * Lie automatiquement les boutons HTML aux fonctions JavaScript correspondantes
 */

// Mapping des noms de boutons vers les fonctions
const BUTTON_FUNCTION_MAPPING = {
    // Messages
    'nouveau-message': 'creerNouveauMessage',
    'actualiser-messages': 'actualiserMessages',
    'supprimer-message': 'supprimerMessage',
    'marquer-tous-lus': 'marquerTousLus',
    
    // Commerce
    'evolution-prix': 'afficherEvolutionPrix',
    'ordre-marche': 'gererOrdreMarche',
    'ordre-achat': 'placerOrdreAchat',
    'ordre-vente': 'placerOrdreVente',
    
    // Empire - Monde
    'commerce-monde': 'gererCommerceMonde',
    'diplomatie-monde': 'gererDiplomatieMonde',
    'explorer-monde': 'explorerMonde',
    'gerer-monde': 'gererMonde',
    'nouvelle-expedition': 'creerNouvelleExpedition',
    'nouvelle-flotte': 'creerNouvelleFlotte',
    
    // Empire - Province
    'attaquer-province': 'attaquerProvince',
    'details-province': 'afficherDetailsProvince',
    'gerer-province': 'gererProvince',
    
    // Militaire - Flottes
    'ameliorer-port': 'ameliorerPort',
    'constructions-cours': 'afficherConstructionsEnCours',
    'construire-marchand': 'construireNavireMarchand',
    'galeres-guerre': 'gererGaleresGuerre',
    'gerer-routes': 'gererRoutesNavales',
    'navires-exploration': 'gererNaviresExploration',
    'expedition-navale': 'creerExpeditionNavale',
    'rapport-naval': 'afficherRapportNaval',
    
    // Militaire - Légions
    'defendre-cite': 'defenreCite',
    'entrainement-rapide': 'entrainementRapide',
    'nouvelle-campagne': 'creerNouvelleCampagne',
    'rapport-bataille': 'afficherRapportBataille',
    'recruter-troupes': 'recruterTroupes',
    
    // Diplomatie - Alliances
    'description-alliance': 'gererDescriptionAlliance',
    'nom-alliance': 'gererNomAlliance'
};

// Mapping des textes de boutons vers les fonctions
const TEXT_FUNCTION_MAPPING = {
    'Nouveau message': 'creerNouveauMessage',
    'Actualiser': 'actualiserMessages',
    'Supprimer': 'supprimerMessage',
    'Tout marquer lu': 'marquerTousLus',
    'Évolution des prix': 'afficherEvolutionPrix',
    'Ordre du marché': 'gererOrdreMarche',
    'Placer ordre d\'achat': 'placerOrdreAchat',
    'Placer ordre de vente': 'placerOrdreVente',
    'Explorer': 'explorerMonde',
    'Gérer': 'gererMonde',
    'Attaquer': 'attaquerProvince',
    'Détails': 'afficherDetailsProvince',
    'Recruter': 'recruterTroupes'
};

// Classe principale pour la liaison des boutons
class ButtonFunctionLinker {
    constructor() {
        this.linkedButtons = new Set();
        this.availableFunctions = new Set();
        this.init();
    }
    
    init() {
        console.log('🔗 Initialisation du système de liaison boutons-fonctions');
        this.scanAvailableFunctions();
        this.linkAllButtons();
        this.setupMutationObserver();
    }
    
    // Scanner les fonctions disponibles dans window
    scanAvailableFunctions() {
        Object.keys(BUTTON_FUNCTION_MAPPING).forEach(buttonId => {
            const functionName = BUTTON_FUNCTION_MAPPING[buttonId];
            if (typeof window[functionName] === 'function') {
                this.availableFunctions.add(functionName);
                console.log(`✅ Fonction disponible: ${functionName}`);
            } else {
                console.warn(`⚠️ Fonction manquante: ${functionName}`);
            }
        });
        
        Object.values(TEXT_FUNCTION_MAPPING).forEach(functionName => {
            if (typeof window[functionName] === 'function') {
                this.availableFunctions.add(functionName);
            }
        });
    }
    
    // Lier tous les boutons de la page
    linkAllButtons() {
        // Lier par ID
        Object.keys(BUTTON_FUNCTION_MAPPING).forEach(buttonId => {
            this.linkButtonById(buttonId);
        });
        
        // Lier par texte
        Object.keys(TEXT_FUNCTION_MAPPING).forEach(buttonText => {
            this.linkButtonByText(buttonText);
        });
        
        // Lier par attributs data
        this.linkButtonsByDataAttributes();
        
        // Lier par classes CSS
        this.linkButtonsByClasses();
    }
    
    // Lier un bouton par son ID
    linkButtonById(buttonId) {
        const button = document.getElementById(buttonId);
        if (button && !this.linkedButtons.has(buttonId)) {
            const functionName = BUTTON_FUNCTION_MAPPING[buttonId];
            if (this.availableFunctions.has(functionName)) {
                this.attachFunctionToButton(button, functionName, buttonId);
            }
        }
    }
    
    // Lier un bouton par son texte
    linkButtonByText(buttonText) {
        const buttons = Array.from(document.querySelectorAll('button, .btn, [role="button"]'));
        buttons.forEach(button => {
            if (button.textContent.trim().includes(buttonText)) {
                const functionName = TEXT_FUNCTION_MAPPING[buttonText];
                if (this.availableFunctions.has(functionName)) {
                    const buttonId = button.id || `btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    button.id = buttonId;
                    this.attachFunctionToButton(button, functionName, buttonId);
                }
            }
        });
    }
    
    // Lier les boutons par attributs data
    linkButtonsByDataAttributes() {
        const buttons = document.querySelectorAll('[data-action], [data-function]');
        buttons.forEach(button => {
            const action = button.getAttribute('data-action') || button.getAttribute('data-function');
            if (action && this.availableFunctions.has(action)) {
                const buttonId = button.id || `data-btn-${action}`;
                button.id = buttonId;
                this.attachFunctionToButton(button, action, buttonId);
            }
        });
    }
    
    // Lier les boutons par classes CSS
    linkButtonsByClasses() {
        const classMapping = {
            'message-btn': 'creerNouveauMessage',
            'refresh-btn': 'actualiserMessages',
            'delete-btn': 'supprimerMessage',
            'mark-read-btn': 'marquerTousLus',
            'explore-btn': 'explorerMonde',
            'recruit-btn': 'recruterTroupes'
        };
        
        Object.keys(classMapping).forEach(className => {
            const buttons = document.querySelectorAll(`.${className}`);
            buttons.forEach(button => {
                const functionName = classMapping[className];
                if (this.availableFunctions.has(functionName)) {
                    const buttonId = button.id || `class-btn-${className}`;
                    button.id = buttonId;
                    this.attachFunctionToButton(button, functionName, buttonId);
                }
            });
        });
    }
    
    // Attacher une fonction à un bouton
    attachFunctionToButton(button, functionName, buttonId) {
        if (this.linkedButtons.has(buttonId)) {
            return; // Déjà lié
        }
        
        // Supprimer les anciens event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Ajouter le nouvel event listener
        newButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            console.log(`🎯 Exécution de ${functionName} via bouton ${buttonId}`);
            
            try {
                // Appeler la fonction
                const result = window[functionName]();
                
                // Feedback visuel
                this.provideFeedback(newButton, result);
                
            } catch (error) {
                console.error(`❌ Erreur lors de l'exécution de ${functionName}:`, error);
                this.provideFeedback(newButton, false);
            }
        });
        
        // Marquer comme lié
        this.linkedButtons.add(buttonId);
        
        // Ajouter des attributs pour le debug
        newButton.setAttribute('data-linked-function', functionName);
        newButton.setAttribute('data-linked-id', buttonId);
        
        console.log(`🔗 Bouton lié: ${buttonId} → ${functionName}`);
    }
    
    // Fournir un feedback visuel
    provideFeedback(button, success) {
        const originalClass = button.className;
        
        if (success !== false) {
            button.classList.add('btn-success-flash');
            setTimeout(() => {
                button.classList.remove('btn-success-flash');
            }, 1000);
        } else {
            button.classList.add('btn-error-flash');
            setTimeout(() => {
                button.classList.remove('btn-error-flash');
            }, 1000);
        }
    }
    
    // Observer les changements DOM pour lier les nouveaux boutons
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Vérifier si c'est un bouton ou contient des boutons
                            if (node.matches('button, .btn, [role="button"]')) {
                                this.linkNewButton(node);
                            } else {
                                const buttons = node.querySelectorAll('button, .btn, [role="button"]');
                                buttons.forEach(button => this.linkNewButton(button));
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Lier un nouveau bouton détecté
    linkNewButton(button) {
        const buttonId = button.id;
        if (buttonId && BUTTON_FUNCTION_MAPPING[buttonId]) {
            this.linkButtonById(buttonId);
            return;
        }
        
        const buttonText = button.textContent.trim();
        Object.keys(TEXT_FUNCTION_MAPPING).forEach(text => {
            if (buttonText.includes(text)) {
                const functionName = TEXT_FUNCTION_MAPPING[text];
                if (this.availableFunctions.has(functionName)) {
                    const newButtonId = button.id || `new-btn-${Date.now()}`;
                    button.id = newButtonId;
                    this.attachFunctionToButton(button, functionName, newButtonId);
                }
            }
        });
    }
    
    // Méthode pour forcer la re-liaison de tous les boutons
    relinkAllButtons() {
        this.linkedButtons.clear();
        this.scanAvailableFunctions();
        this.linkAllButtons();
        console.log('🔄 Tous les boutons ont été re-liés');
    }
    
    // Méthode pour obtenir des statistiques
    getStats() {
        return {
            linkedButtons: this.linkedButtons.size,
            availableFunctions: this.availableFunctions.size,
            mappedButtons: Object.keys(BUTTON_FUNCTION_MAPPING).length,
            mappedTexts: Object.keys(TEXT_FUNCTION_MAPPING).length
        };
    }
}

// Styles CSS pour le feedback visuel
const feedbackStyles = `
    .btn-success-flash {
        background-color: #22c55e !important;
        transform: scale(1.05);
        transition: all 0.3s ease;
    }
    
    .btn-error-flash {
        background-color: #dc2626 !important;
        transform: scale(1.05);
        transition: all 0.3s ease;
    }
`;

// Injecter les styles
const styleSheet = document.createElement('style');
styleSheet.textContent = feedbackStyles;
document.head.appendChild(styleSheet);

// Initialiser le système quand le DOM est prêt
let buttonLinker;

function initButtonLinker() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            buttonLinker = new ButtonFunctionLinker();
        });
    } else {
        buttonLinker = new ButtonFunctionLinker();
    }
}

// Auto-initialisation
initButtonLinker();

// Export global
window.ButtonFunctionLinker = ButtonFunctionLinker;
window.buttonLinker = buttonLinker;

console.log('🔗 Système de liaison boutons-fonctions chargé');