/* ===== GESTIONNAIRE D'INTERACTIONS TACTILES POUR MOBILE ===== */

class MobileTouchHandler {
    constructor() {
        this.isEnabled = this.isMobileDevice();
        this.touchStartTime = 0;
        this.touchStartPos = { x: 0, y: 0 };
        this.longPressTimer = null;
        this.longPressDelay = 500; // 500ms pour un appui long
        this.swipeThreshold = 50;
        this.tapThreshold = 10;
        this.doubleTapDelay = 300;
        this.lastTap = 0;
        
        if (this.isEnabled) {
            this.init();
        }
    }

    isMobileDevice() {
        return window.innerWidth <= 768 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    init() {
        this.setupTouchEvents();
        this.setupHapticFeedback();
        this.setupPullToRefresh();
        this.optimizeScrolling();
        this.preventDefaultBehaviors();
        console.log('🔥 Gestionnaire tactile mobile initialisé');
    }

    setupTouchEvents() {
        // Gestionnaire global pour tous les éléments tactiles
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: true });

        // Améliorer les boutons et éléments interactifs
        this.enhanceInteractiveElements();
    }

    handleTouchStart(event) {
        const touch = event.touches[0];
        this.touchStartTime = Date.now();
        this.touchStartPos = { x: touch.clientX, y: touch.clientY };
        
        const target = event.target.closest('.touch-interactive, button, .btn, .nav-item a, .building-card, .unit-card, .feature-card, .mobile-tab');
        
        if (target) {
            // Effet visuel immédiat
            this.addTouchFeedback(target);
            
            // Démarrer le timer pour l'appui long
            this.longPressTimer = setTimeout(() => {
                this.handleLongPress(target, event);
            }, this.longPressDelay);
        }
    }

    handleTouchMove(event) {
        const touch = event.touches[0];
        const deltaX = Math.abs(touch.clientX - this.touchStartPos.x);
        const deltaY = Math.abs(touch.clientY - this.touchStartPos.y);
        
        // Si l'utilisateur bouge trop, annuler l'appui long
        if (deltaX > this.tapThreshold || deltaY > this.tapThreshold) {
            this.clearLongPressTimer();
            this.removeTouchFeedback();
        }

        // Gérer le scroll personnalisé si nécessaire
        this.handleCustomScroll(event);
    }

    handleTouchEnd(event) {
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - this.touchStartTime;
        const touch = event.changedTouches[0];
        const deltaX = Math.abs(touch.clientX - this.touchStartPos.x);
        const deltaY = Math.abs(touch.clientY - this.touchStartPos.y);
        
        this.clearLongPressTimer();
        this.removeTouchFeedback();
        
        const target = event.target.closest('.touch-interactive, button, .btn, .nav-item a, .building-card, .unit-card, .feature-card, .mobile-tab');
        
        if (target && deltaX < this.tapThreshold && deltaY < this.tapThreshold) {
            // C'est un tap
            if (touchDuration < 200) {
                this.handleTap(target, event);
            }
            
            // Vérifier le double tap
            if (touchEndTime - this.lastTap < this.doubleTapDelay) {
                this.handleDoubleTap(target, event);
            }
            this.lastTap = touchEndTime;
        }

        // Gérer les swipes
        if (deltaX > this.swipeThreshold || deltaY > this.swipeThreshold) {
            this.handleSwipe(deltaX, deltaY, touch.clientX - this.touchStartPos.x, touch.clientY - this.touchStartPos.y, event);
        }
    }

    handleTouchCancel(event) {
        this.clearLongPressTimer();
        this.removeTouchFeedback();
    }

    handleTap(target, event) {
        // Feedback haptique léger
        this.vibrate(50);
        
        // Ajouter une classe d'animation
        target.classList.add('tap-animation');
        setTimeout(() => target.classList.remove('tap-animation'), 200);
        
        // Émettre un événement personnalisé
        target.dispatchEvent(new CustomEvent('mobileTap', { 
            detail: { originalEvent: event, target: target }
        }));
    }

    handleDoubleTap(target, event) {
        // Feedback haptique plus fort
        this.vibrate([50, 50, 50]);
        
        // Ajouter une classe d'animation
        target.classList.add('double-tap-animation');
        setTimeout(() => target.classList.remove('double-tap-animation'), 300);
        
        // Émettre un événement personnalisé
        target.dispatchEvent(new CustomEvent('mobileDoubleTap', { 
            detail: { originalEvent: event, target: target }
        }));
        
        // Empêcher le zoom sur double tap
        event.preventDefault();
    }

    handleLongPress(target, event) {
        // Feedback haptique fort
        this.vibrate(100);
        
        // Ajouter une classe d'animation
        target.classList.add('long-press-animation');
        setTimeout(() => target.classList.remove('long-press-animation'), 500);
        
        // Émettre un événement personnalisé
        target.dispatchEvent(new CustomEvent('mobileLongPress', { 
            detail: { originalEvent: event, target: target }
        }));
    }

    handleSwipe(deltaX, deltaY, directionX, directionY, event) {
        let swipeDirection = '';
        
        if (Math.abs(directionX) > Math.abs(directionY)) {
            // Swipe horizontal
            swipeDirection = directionX > 0 ? 'right' : 'left';
        } else {
            // Swipe vertical
            swipeDirection = directionY > 0 ? 'down' : 'up';
        }
        
        // Feedback haptique
        this.vibrate(30);
        
        // Émettre un événement personnalisé
        document.dispatchEvent(new CustomEvent('mobileSwipe', {
            detail: {
                direction: swipeDirection,
                deltaX: deltaX,
                deltaY: deltaY,
                originalEvent: event
            }
        }));
    }

    addTouchFeedback(element) {
        element.classList.add('touch-active');
        element.style.transform = 'scale(0.98)';
        element.style.opacity = '0.8';
    }

    removeTouchFeedback() {
        document.querySelectorAll('.touch-active').forEach(element => {
            element.classList.remove('touch-active');
            element.style.transform = '';
            element.style.opacity = '';
        });
    }

    clearLongPressTimer() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    enhanceInteractiveElements() {
        // Améliorer tous les éléments interactifs
        const interactiveSelectors = [
            'button', '.btn', '.nav-item a', '.building-card', 
            '.unit-card', '.feature-card', '.mobile-tab',
            '.resource-card', '.trade-offer', '.research-item'
        ];
        
        interactiveSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                if (!element.classList.contains('touch-enhanced')) {
                    this.enhanceElement(element);
                }
            });
        });
    }

    enhanceElement(element) {
        element.classList.add('touch-enhanced');
        
        // Ajouter les styles CSS pour les animations
        if (!document.querySelector('#mobile-touch-styles')) {
            const style = document.createElement('style');
            style.id = 'mobile-touch-styles';
            style.textContent = `
                .touch-enhanced {
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                
                .tap-animation {
                    animation: tapPulse 0.2s ease;
                }
                
                .double-tap-animation {
                    animation: doubleTapPulse 0.3s ease;
                }
                
                .long-press-animation {
                    animation: longPressPulse 0.5s ease;
                }
                
                @keyframes tapPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(0.95); }
                    100% { transform: scale(1); }
                }
                
                @keyframes doubleTapPulse {
                    0%, 100% { transform: scale(1); }
                    25% { transform: scale(0.95); }
                    50% { transform: scale(1.05); }
                    75% { transform: scale(0.95); }
                }
                
                @keyframes longPressPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                .touch-ripple {
                    position: relative;
                    overflow: hidden;
                }
                
                .touch-ripple::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(217, 119, 6, 0.3);
                    transform: translate(-50%, -50%);
                    transition: width 0.3s ease, height 0.3s ease;
                }
                
                .touch-ripple.ripple-active::before {
                    width: 200px;
                    height: 200px;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Ajouter l'effet ripple
        element.classList.add('touch-ripple');
        
        // Écouter les événements personnalisés
        element.addEventListener('mobileTap', this.handleElementTap.bind(this));
        element.addEventListener('mobileDoubleTap', this.handleElementDoubleTap.bind(this));
        element.addEventListener('mobileLongPress', this.handleElementLongPress.bind(this));
    }

    handleElementTap(event) {
        const element = event.target;
        
        // Effet ripple
        element.classList.add('ripple-active');
        setTimeout(() => element.classList.remove('ripple-active'), 300);
        
        // Logique spécifique selon le type d'élément
        if (element.classList.contains('building-card')) {
            this.handleBuildingTap(element);
        } else if (element.classList.contains('unit-card')) {
            this.handleUnitTap(element);
        } else if (element.classList.contains('mobile-tab')) {
            this.handleTabTap(element);
        }
    }

    handleElementDoubleTap(event) {
        const element = event.target;
        
        // Logique pour double tap (ex: zoom, action rapide)
        if (element.classList.contains('building-card')) {
            this.handleBuildingDoubleTap(element);
        } else if (element.classList.contains('resource-card')) {
            this.handleResourceDoubleTap(element);
        }
    }

    handleElementLongPress(event) {
        const element = event.target;
        
        // Logique pour appui long (ex: menu contextuel, info détaillée)
        if (element.classList.contains('building-card')) {
            this.showBuildingContextMenu(element);
        } else if (element.classList.contains('unit-card')) {
            this.showUnitContextMenu(element);
        }
    }

    // Méthodes spécifiques pour les différents éléments
    handleBuildingTap(element) {
        // Ouvrir les détails du bâtiment
        console.log('Tap sur bâtiment:', element);
    }

    handleBuildingDoubleTap(element) {
        // Action rapide (ex: améliorer)
        console.log('Double tap sur bâtiment:', element);
    }

    handleUnitTap(element) {
        // Sélectionner l'unité
        console.log('Tap sur unité:', element);
    }

    handleTabTap(element) {
        // Changer d'onglet
        const tabId = element.dataset.tab;
        if (tabId && window.mobileNav) {
            window.mobileNav.switchTab(tabId);
        }
    }

    handleResourceDoubleTap(element) {
        // Afficher les détails de production
        console.log('Double tap sur ressource:', element);
    }

    showBuildingContextMenu(element) {
        // Afficher un menu contextuel pour le bâtiment
        console.log('Menu contextuel bâtiment:', element);
        this.showContextMenu(element, [
            { label: 'Améliorer', action: () => console.log('Améliorer') },
            { label: 'Détails', action: () => console.log('Détails') },
            { label: 'Annuler', action: () => console.log('Annuler') }
        ]);
    }

    showUnitContextMenu(element) {
        // Afficher un menu contextuel pour l'unité
        console.log('Menu contextuel unité:', element);
        this.showContextMenu(element, [
            { label: 'Déplacer', action: () => console.log('Déplacer') },
            { label: 'Attaquer', action: () => console.log('Attaquer') },
            { label: 'Dissoudre', action: () => console.log('Dissoudre') },
            { label: 'Annuler', action: () => console.log('Annuler') }
        ]);
    }

    showContextMenu(element, options) {
        // Créer et afficher un menu contextuel
        const existingMenu = document.querySelector('.mobile-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menu = document.createElement('div');
        menu.className = 'mobile-context-menu';
        menu.style.cssText = `
            position: fixed;
            background: var(--dark-marble);
            border: 1px solid var(--border-gold);
            border-radius: 12px;
            padding: 8px 0;
            z-index: 3000;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
            min-width: 150px;
        `;

        options.forEach(option => {
            const item = document.createElement('div');
            item.className = 'context-menu-item';
            item.textContent = option.label;
            item.style.cssText = `
                padding: 12px 16px;
                color: var(--text-light);
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
            `;
            
            item.addEventListener('touchend', (e) => {
                e.preventDefault();
                option.action();
                menu.remove();
                this.vibrate(30);
            });

            item.addEventListener('touchstart', () => {
                item.style.background = 'rgba(217, 119, 6, 0.2)';
            });

            item.addEventListener('touchcancel', () => {
                item.style.background = '';
            });

            menu.appendChild(item);
        });

        // Positionner le menu
        const rect = element.getBoundingClientRect();
        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.bottom + 10}px`;

        document.body.appendChild(menu);

        // Fermer le menu si on touche ailleurs
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('touchstart', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('touchstart', closeMenu);
        }, 100);
    }

    setupHapticFeedback() {
        // Configuration du feedback haptique
        this.hapticSupported = 'vibrate' in navigator;
    }

    vibrate(pattern) {
        if (this.hapticSupported && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    setupPullToRefresh() {
        let startY = 0;
        let pullDistance = 0;
        const pullThreshold = 100;
        let isPulling = false;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            pullDistance = e.touches[0].clientY - startY;
            
            if (pullDistance > 0 && window.scrollY === 0) {
                // Afficher l'indicateur de pull-to-refresh
                this.showPullToRefreshIndicator(pullDistance, pullThreshold);
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (isPulling && pullDistance > pullThreshold) {
                this.triggerRefresh();
            }
            this.hidePullToRefreshIndicator();
            isPulling = false;
            pullDistance = 0;
        }, { passive: true });
    }

    showPullToRefreshIndicator(distance, threshold) {
        let indicator = document.querySelector('.pull-to-refresh-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'pull-to-refresh-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                background: var(--gold-primary);
                color: white;
                padding: 8px 16px;
                border-radius: 0 0 12px 12px;
                font-size: 14px;
                z-index: 2000;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }

        const progress = Math.min(distance / threshold, 1);
        indicator.style.opacity = progress;
        indicator.style.transform = `translateX(-50%) translateY(${Math.min(distance * 0.5, 50)}px)`;
        
        if (progress >= 1) {
            indicator.textContent = '↻ Relâcher pour actualiser';
            this.vibrate(50);
        } else {
            indicator.textContent = '↓ Tirer pour actualiser';
        }
    }

    hidePullToRefreshIndicator() {
        const indicator = document.querySelector('.pull-to-refresh-indicator');
        if (indicator) {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateX(-50%) translateY(-50px)';
            setTimeout(() => indicator.remove(), 300);
        }
    }

    triggerRefresh() {
        // Déclencher l'actualisation
        this.vibrate(100);
        
        // Émettre un événement personnalisé
        document.dispatchEvent(new CustomEvent('mobileRefresh'));
        
        // Afficher une notification
        if (window.mobileNav) {
            window.mobileNav.showMobileNotification('Actualisation...', 'info', 2000);
        }
        
        // Actualiser les données du jeu
        if (typeof updateAllUI === 'function') {
            updateAllUI();
        }
    }

    optimizeScrolling() {
        // Améliorer les performances de scroll
        const scrollElements = document.querySelectorAll('.view-container, .mobile-modal-content');
        
        scrollElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.overflowScrolling = 'touch';
        });
    }

    preventDefaultBehaviors() {
        // Empêcher le zoom sur double tap
        document.addEventListener('touchend', (event) => {
            const now = Date.now();
            if (now - this.lastTap <= this.doubleTapDelay) {
                event.preventDefault();
            }
        }, { passive: false });

        // Empêcher le menu contextuel par défaut
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        }, { passive: false });

        // Empêcher la sélection de texte accidentelle
        document.addEventListener('selectstart', (event) => {
            if (!event.target.matches('input, textarea')) {
                event.preventDefault();
            }
        }, { passive: false });
    }

    handleCustomScroll(event) {
        // Gérer le scroll personnalisé si nécessaire
        // Par exemple, pour les listes infinies ou le parallax
    }

    // Méthodes publiques pour l'intégration
    addTouchListener(element, eventType, callback) {
        if (this.isEnabled) {
            element.addEventListener(`mobile${eventType}`, callback);
        }
    }

    removeTouchListener(element, eventType, callback) {
        if (this.isEnabled) {
            element.removeEventListener(`mobile${eventType}`, callback);
        }
    }

    isTouch() {
        return this.isEnabled;
    }
}

// Initialisation automatique
let mobileTouchHandler;

document.addEventListener('DOMContentLoaded', () => {
    mobileTouchHandler = new MobileTouchHandler();
});

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileTouchHandler;
}

// Fonctions globales pour compatibilité
function addMobileTouchListener(element, eventType, callback) {
    if (mobileTouchHandler) {
        mobileTouchHandler.addTouchListener(element, eventType, callback);
    }
}

function isMobileTouch() {
    return mobileTouchHandler ? mobileTouchHandler.isTouch() : false;
}