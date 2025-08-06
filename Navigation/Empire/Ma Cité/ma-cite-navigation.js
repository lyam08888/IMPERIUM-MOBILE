/**
 * 🏛️ IMPERIUM - Navigation pour Ma Cité
 * Navigation spécifique aux pages de Ma Cité avec header commun
 */

class MaCiteNavigation {
    constructor() {
        this.currentPage = this.getCurrentPageName();
        this.pages = {
            'ma-cite-romaine': {
                title: 'Ma Cité Romaine',
                file: 'Ma Cité Romaine.html',
                icon: '🏛️',
                description: 'Vue d\'ensemble de votre cité'
            },
            'batiments': {
                title: 'Bâtiments',
                file: 'Bâtiments.html',
                icon: '🏗️',
                description: 'Gérer les bâtiments de la cité'
            },
            'citoyens': {
                title: 'Citoyens',
                file: 'Citoyens.html',
                icon: '👥',
                description: 'Population et citoyens'
            },
            'production-par-heure': {
                title: 'Production par Heure',
                file: 'Production par Heure.html',
                icon: '⚡',
                description: 'Statistiques de production'
            },
            'entrepots': {
                title: 'Entrepôts',
                file: 'Entrepôts.html',
                icon: '📦',
                description: 'Stockage des ressources'
            },
            'bonheur': {
                title: 'Bonheur',
                file: 'Bonheur.html',
                icon: '😊',
                description: 'Moral de la population'
            },
            'statistiques-de-la-cite': {
                title: 'Statistiques',
                file: 'Statistiques de la Cité.html',
                icon: '📊',
                description: 'Statistiques détaillées'
            },
            'construction-en-cours': {
                title: 'Construction en Cours',
                file: 'Construction en Cours.html',
                icon: '🚧',
                description: 'Projets en construction'
            },
            'actions-rapides': {
                title: 'Actions Rapides',
                file: 'Actions Rapides.html',
                icon: '⚡',
                description: 'Actions rapides'
            },
            'collecter-impots': {
                title: 'Collecter Impôts',
                file: 'Collecter Impôts.html',
                icon: '💰',
                description: 'Collecte des taxes'
            },
            'recruter-soldats': {
                title: 'Recruter Soldats',
                file: 'Recruter Soldats.html',
                icon: '⚔️',
                description: 'Recrutement militaire'
            },
            'puissance-militaire': {
                title: 'Puissance Militaire',
                file: 'Puissance Militaire.html',
                icon: '🛡️',
                description: 'Forces militaires'
            },
            'organiser-festival': {
                title: 'Organiser Festival',
                file: 'Organiser Festival.html',
                icon: '🎭',
                description: 'Événements et festivals'
            },
            'booster-production': {
                title: 'Booster Production',
                file: 'Booster Production.html',
                icon: '🚀',
                description: 'Améliorer la production'
            }
        };
        
        this.init();
    }
    
    init() {
        this.createNavigationMenu();
        this.bindEvents();
        this.updateActiveNavigation();
        this.addBreadcrumb();
    }
    
    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        // Convertir le nom de fichier en clé
        for (const [key, config] of Object.entries(this.pages)) {
            if (config.file === filename) {
                return key;
            }
        }
        
        return 'ma-cite-romaine'; // Par défaut
    }
    
    createNavigationMenu() {
        // Créer ou mettre à jour le menu de navigation pour Ma Cité
        let navContainer = document.querySelector('.ma-cite-navigation');
        
        if (!navContainer) {
            navContainer = document.createElement('nav');
            navContainer.className = 'ma-cite-navigation';
            
            // Insérer après le header
            const header = document.querySelector('.imperium-header');
            if (header) {
                header.insertAdjacentElement('afterend', navContainer);
            } else {
                document.body.insertBefore(navContainer, document.body.firstChild);
            }
        }
        
        navContainer.innerHTML = `
            <div class="ma-cite-nav-content">
                <div class="ma-cite-nav-header">
                    <h2 class="ma-cite-nav-title">
                        <span class="nav-icon">🏛️</span>
                        Ma Cité Romaine
                    </h2>
                    <button class="nav-toggle" id="ma-cite-nav-toggle">
                        <span class="nav-toggle-icon">☰</span>
                    </button>
                </div>
                
                <div class="ma-cite-nav-menu" id="ma-cite-nav-menu">
                    <div class="nav-sections">
                        <!-- Section Gestion -->
                        <div class="nav-section">
                            <h3 class="nav-section-title">Gestion</h3>
                            <div class="nav-items">
                                ${this.createNavItem('ma-cite-romaine')}
                                ${this.createNavItem('batiments')}
                                ${this.createNavItem('citoyens')}
                                ${this.createNavItem('entrepots')}
                            </div>
                        </div>
                        
                        <!-- Section Production -->
                        <div class="nav-section">
                            <h3 class="nav-section-title">Production</h3>
                            <div class="nav-items">
                                ${this.createNavItem('production-par-heure')}
                                ${this.createNavItem('construction-en-cours')}
                                ${this.createNavItem('booster-production')}
                            </div>
                        </div>
                        
                        <!-- Section Social -->
                        <div class="nav-section">
                            <h3 class="nav-section-title">Social</h3>
                            <div class="nav-items">
                                ${this.createNavItem('bonheur')}
                                ${this.createNavItem('organiser-festival')}
                                ${this.createNavItem('collecter-impots')}
                            </div>
                        </div>
                        
                        <!-- Section Militaire -->
                        <div class="nav-section">
                            <h3 class="nav-section-title">Militaire</h3>
                            <div class="nav-items">
                                ${this.createNavItem('recruter-soldats')}
                                ${this.createNavItem('puissance-militaire')}
                            </div>
                        </div>
                        
                        <!-- Section Outils -->
                        <div class="nav-section">
                            <h3 class="nav-section-title">Outils</h3>
                            <div class="nav-items">
                                ${this.createNavItem('statistiques-de-la-cite')}
                                ${this.createNavItem('actions-rapides')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    createNavItem(pageKey) {
        const page = this.pages[pageKey];
        if (!page) return '';
        
        const isActive = pageKey === this.currentPage;
        
        return `
            <a href="${page.file}" 
               class="nav-item ${isActive ? 'active' : ''}" 
               data-page="${pageKey}"
               title="${page.description}">
                <span class="nav-item-icon">${page.icon}</span>
                <span class="nav-item-text">${page.title}</span>
                ${isActive ? '<span class="nav-item-indicator"></span>' : ''}
            </a>
        `;
    }
    
    bindEvents() {
        // Toggle du menu mobile
        const navToggle = document.getElementById('ma-cite-nav-toggle');
        const navMenu = document.getElementById('ma-cite-nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('open');
                navToggle.classList.toggle('active');
            });
        }
        
        // Gestion des clics sur les éléments de navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const pageKey = navItem.dataset.page;
                
                if (pageKey && pageKey !== this.currentPage) {
                    this.navigateToPage(pageKey);
                }
            }
        });
        
        // Fermer le menu mobile en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.ma-cite-navigation')) {
                navMenu?.classList.remove('open');
                navToggle?.classList.remove('active');
            }
        });
    }
    
    navigateToPage(pageKey) {
        const page = this.pages[pageKey];
        if (!page) return;
        
        // Ajouter un log de navigation
        if (window.addImperiumLog) {
            window.addImperiumLog(`Navigation vers ${page.title}`, 'info');
        }
        
        // Naviguer vers la page
        window.location.href = page.file;
    }
    
    updateActiveNavigation() {
        // Mettre à jour l'élément actif
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            const indicator = item.querySelector('.nav-item-indicator');
            if (indicator) indicator.remove();
        });
        
        const activeItem = document.querySelector(`[data-page="${this.currentPage}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            activeItem.insertAdjacentHTML('beforeend', '<span class="nav-item-indicator"></span>');
        }
    }
    
    addBreadcrumb() {
        // Ajouter un fil d'Ariane
        let breadcrumb = document.querySelector('.ma-cite-breadcrumb');
        
        if (!breadcrumb) {
            breadcrumb = document.createElement('div');
            breadcrumb.className = 'ma-cite-breadcrumb';
            
            const navContainer = document.querySelector('.ma-cite-navigation');
            if (navContainer) {
                navContainer.insertAdjacentElement('afterend', breadcrumb);
            }
        }
        
        const currentPage = this.pages[this.currentPage];
        
        breadcrumb.innerHTML = `
            <div class="breadcrumb-content">
                <a href="../../../index.html" class="breadcrumb-item">
                    <span class="breadcrumb-icon">🏛️</span>
                    IMPERIUM
                </a>
                <span class="breadcrumb-separator">›</span>
                <a href="../Cite.html" class="breadcrumb-item">
                    <span class="breadcrumb-icon">🏛️</span>
                    Empire
                </a>
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-item current">
                    <span class="breadcrumb-icon">${currentPage.icon}</span>
                    ${currentPage.title}
                </span>
            </div>
        `;
    }
    
    // Méthodes utilitaires
    static getInstance() {
        if (!window.maCiteNavigation) {
            window.maCiteNavigation = new MaCiteNavigation();
        }
        return window.maCiteNavigation;
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', function() {
    // Attendre que le header commun soit chargé
    setTimeout(() => {
        window.maCiteNavigation = MaCiteNavigation.getInstance();
    }, 600);
});

// Fonction utilitaire globale
window.navigateToMaCitePage = function(pageKey) {
    if (window.maCiteNavigation) {
        window.maCiteNavigation.navigateToPage(pageKey);
    }
};