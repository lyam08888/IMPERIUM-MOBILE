/* ===== SYSTÈME DE NAVIGATION MOBILE POUR IMPERIUM ===== */

class MobileNavigation {
    constructor() {
        this.isMobile = this.detectMobile();
        this.currentTab = 'empire';
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.swipeThreshold = 50;
        this.isInitialized = false;
        
        // Configuration des onglets mobiles
        this.tabs = [
            {
                id: 'empire',
                icon: '🏛️',
                label: 'Empire',
                views: ['city', 'province', 'world']
            },
            {
                id: 'military',
                icon: '⚔️',
                label: 'Militaire',
                views: ['legions', 'fleets', 'simulator']
            },
            {
                id: 'development',
                icon: '📚',
                label: 'Développement',
                views: ['academy', 'commerce']
            },
            {
                id: 'social',
                icon: '👥',
                label: 'Social',
                views: ['alliance', 'diplomacy', 'messages']
            },
            {
                id: 'premium',
                icon: '💎',
                label: 'Premium',
                views: ['premium']
            }
        ];

        this.init();
    }

    detectMobile() {
        return window.innerWidth <= 768 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    init() {
        if (this.isMobile && !this.isInitialized) {
            this.createMobileInterface();
            this.setupEventListeners();
            this.setupSwipeNavigation();
            this.optimizeTouchInteractions();
            this.isInitialized = true;
            console.log('🔥 Interface mobile initialisée');
        }
    }

    createMobileInterface() {
        // Créer la barre d'onglets mobile
        this.createMobileTabs();
        
        // Adapter l'interface existante
        this.adaptExistingInterface();
        
        // Créer les conteneurs de notification mobile
        this.createMobileNotifications();
    }

    createMobileTabs() {
        // Supprimer les onglets existants s'ils existent
        const existingTabs = document.querySelector('.mobile-tabs');
        if (existingTabs) {
            existingTabs.remove();
        }

        // Créer la nouvelle barre d'onglets
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'mobile-tabs';
        
        this.tabs.forEach(tab => {
            const tabElement = document.createElement('div');
            tabElement.className = `mobile-tab ${tab.id === this.currentTab ? 'active' : ''}`;
            tabElement.dataset.tab = tab.id;
            
            // Ajouter badge de notification si nécessaire
            const notificationBadge = this.getNotificationCount(tab.id);
            const badgeHTML = notificationBadge > 0 ? 
                `<span class="notification-badge">${notificationBadge > 99 ? '99+' : notificationBadge}</span>` : '';
            
            tabElement.innerHTML = `
                <div class="mobile-tab-icon">${tab.icon}</div>
                <div class="mobile-tab-label">${tab.label}</div>
                ${badgeHTML}
            `;
            
            tabElement.addEventListener('click', () => this.switchTab(tab.id));
            tabsContainer.appendChild(tabElement);
        });

        document.body.appendChild(tabsContainer);
    }

    adaptExistingInterface() {
        // Ajouter les classes CSS mobiles
        document.body.classList.add('mobile-interface');
        
        // Adapter le header
        const header = document.querySelector('.imperium-header');
        if (header) {
            header.classList.add('mobile-header');
        }

        // Adapter le body
        const body = document.querySelector('.imperium-body');
        if (body) {
            body.classList.add('mobile-body');
        }

        // Cacher la sidebar sur mobile
        const sidebar = document.querySelector('.imperium-sidebar');
        if (sidebar) {
            sidebar.style.display = 'none';
        }

        // Adapter les vues
        const viewContainers = document.querySelectorAll('.view-container');
        viewContainers.forEach(container => {
            container.classList.add('mobile-view');
        });
    }

    createMobileNotifications() {
        // Créer le conteneur de notifications mobile s'il n'existe pas
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        notificationContainer.classList.add('mobile-notifications');
    }

    switchTab(tabId) {
        if (tabId === this.currentTab) return;

        // Mettre à jour l'onglet actif
        document.querySelectorAll('.mobile-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Changer la vue selon l'onglet
        const tab = this.tabs.find(t => t.id === tabId);
        if (tab && tab.views.length > 0) {
            // Utiliser la première vue de l'onglet par défaut
            const defaultView = tab.views[0];
            this.switchView(defaultView);
        }

        this.currentTab = tabId;
        
        // Vibration tactile si supportée
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        // Animation de feedback
        this.animateTabSwitch(activeTab);
    }

    switchView(viewName) {
        // Utiliser la fonction existante de changement de vue
        if (typeof switchView === 'function') {
            switchView(viewName);
        } else {
            console.warn(`Vue ${viewName} non trouvée`);
        }
    }

    animateTabSwitch(tabElement) {
        if (!tabElement) return;
        
        tabElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            tabElement.style.transform = 'scale(1)';
        }, 150);
    }

    setupEventListeners() {
        // Écouter les changements d'orientation
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });

        // Écouter les changements de taille d'écran
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = this.detectMobile();
            
            if (wasMobile !== this.isMobile) {
                if (this.isMobile) {
                    this.init();
                } else {
                    this.destroyMobileInterface();
                }
            }
        });

        // Prévenir le zoom sur double-tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Améliorer les performances de scroll
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });
    }

    setupSwipeNavigation() {
        let startX = 0;
        let startY = 0;
        let isScrolling = false;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isScrolling = false;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;

            const diffX = Math.abs(e.touches[0].clientX - startX);
            const diffY = Math.abs(e.touches[0].clientY - startY);

            // Déterminer si c'est un scroll vertical
            if (diffY > diffX) {
                isScrolling = true;
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY || isScrolling) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Vérifier si c'est un swipe horizontal
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.swipeThreshold) {
                if (diffX > 0) {
                    // Swipe vers la gauche - onglet suivant
                    this.switchToNextTab();
                } else {
                    // Swipe vers la droite - onglet précédent
                    this.switchToPreviousTab();
                }
            }

            startX = 0;
            startY = 0;
        }, { passive: true });
    }

    switchToNextTab() {
        const currentIndex = this.tabs.findIndex(tab => tab.id === this.currentTab);
        const nextIndex = (currentIndex + 1) % this.tabs.length;
        this.switchTab(this.tabs[nextIndex].id);
    }

    switchToPreviousTab() {
        const currentIndex = this.tabs.findIndex(tab => tab.id === this.currentTab);
        const prevIndex = currentIndex === 0 ? this.tabs.length - 1 : currentIndex - 1;
        this.switchTab(this.tabs[prevIndex].id);
    }

    optimizeTouchInteractions() {
        // Améliorer les interactions tactiles pour tous les éléments cliquables
        const clickableElements = document.querySelectorAll('button, .btn, .nav-item a, .feature-card, .building-card, .unit-card');
        
        clickableElements.forEach(element => {
            // Ajouter des effets de feedback tactile
            element.addEventListener('touchstart', () => {
                element.style.transform = 'scale(0.98)';
                element.style.opacity = '0.8';
            }, { passive: true });

            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                    element.style.opacity = '1';
                }, 100);
            }, { passive: true });

            element.addEventListener('touchcancel', () => {
                element.style.transform = 'scale(1)';
                element.style.opacity = '1';
            }, { passive: true });
        });
    }

    handleOrientationChange() {
        // Réajuster l'interface après changement d'orientation
        setTimeout(() => {
            this.createMobileTabs();
            this.optimizeTouchInteractions();
        }, 300);
    }

    getNotificationCount(tabId) {
        // Logique pour obtenir le nombre de notifications par onglet
        // À adapter selon votre système de notifications
        switch (tabId) {
            case 'military':
                return this.getMilitaryNotifications();
            case 'social':
                return this.getSocialNotifications();
            case 'development':
                return this.getDevelopmentNotifications();
            default:
                return 0;
        }
    }

    getMilitaryNotifications() {
        // Exemple : compter les unités prêtes, batailles terminées, etc.
        return 0;
    }

    getSocialNotifications() {
        // Exemple : nouveaux messages, invitations d'alliance, etc.
        return 0;
    }

    getDevelopmentNotifications() {
        // Exemple : recherches terminées, constructions finies, etc.
        return 0;
    }

    showMobileNotification(message, type = 'info', duration = 3000) {
        const container = document.querySelector('.notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification mobile-notification ${type}`;
        notification.textContent = message;

        // Ajouter l'icône selon le type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        if (icons[type]) {
            notification.innerHTML = `<span class="notification-icon">${icons[type]}</span> ${message}`;
        }

        container.appendChild(notification);

        // Animation d'entrée
        notification.style.transform = 'translateY(-100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 10);

        // Suppression automatique
        setTimeout(() => {
            notification.style.transform = 'translateY(-100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);

        // Vibration pour les notifications importantes
        if (type === 'error' || type === 'warning') {
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
        }
    }

    destroyMobileInterface() {
        // Nettoyer l'interface mobile si on passe en desktop
        const mobileTabs = document.querySelector('.mobile-tabs');
        if (mobileTabs) {
            mobileTabs.remove();
        }

        document.body.classList.remove('mobile-interface');
        
        const sidebar = document.querySelector('.imperium-sidebar');
        if (sidebar) {
            sidebar.style.display = '';
        }

        this.isInitialized = false;
    }

    // Méthodes utilitaires pour l'intégration avec le jeu existant
    updateTabBadge(tabId, count) {
        const tab = document.querySelector(`[data-tab="${tabId}"]`);
        if (!tab) return;

        let badge = tab.querySelector('.notification-badge');
        
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'notification-badge';
                tab.appendChild(badge);
            }
            badge.textContent = count > 99 ? '99+' : count.toString();
        } else if (badge) {
            badge.remove();
        }
    }

    getCurrentTab() {
        return this.currentTab;
    }

    isMobileDevice() {
        return this.isMobile;
    }
}

// Initialisation automatique
let mobileNav;

document.addEventListener('DOMContentLoaded', () => {
    mobileNav = new MobileNavigation();
});

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileNavigation;
}

// Fonctions globales pour compatibilité
function showMobileNotification(message, type, duration) {
    if (mobileNav && mobileNav.isMobileDevice()) {
        mobileNav.showMobileNotification(message, type, duration);
    }
}

function updateMobileTabBadge(tabId, count) {
    if (mobileNav) {
        mobileNav.updateTabBadge(tabId, count);
    }
}

function switchMobileTab(tabId) {
    if (mobileNav) {
        mobileNav.switchTab(tabId);
    }
}