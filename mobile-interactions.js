/* ===== IMPERIUM - INTERACTIONS MOBILE AMÉLIORÉES ===== */

class EnhancedMobileInteractions {
    constructor() {
        this.isMobile = this.detectMobile();
        this.touchStartTime = 0;
        this.touchStartPos = { x: 0, y: 0 };
        this.longPressTimer = null;
        this.longPressDelay = 500;
        this.swipeThreshold = 50;
        this.tapThreshold = 10;
        this.doubleTapDelay = 300;
        this.lastTap = 0;
        this.hapticSupported = 'vibrate' in navigator;
        
        if (this.isMobile) {
            this.init();
        }
    }

    detectMobile() {
        return window.innerWidth <= 768 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    init() {
        this.setupTouchEvents();
        this.setupSwipeNavigation();
        this.setupPullToRefresh();
        this.optimizeScrolling();
        this.preventDefaultBehaviors();
        this.setupHapticFeedback();
        console.log('🔥 Interactions mobiles améliorées initialisées');
    }

    setupTouchEvents() {
        // Améliorer tous les éléments interactifs
        const interactiveElements = document.querySelectorAll(
            'button, .mobile-tab, .building-card, .building-plot, .stat-card, .resource-item, .player-avatar'
        );

        interactiveElements.forEach(element => {
            this.enhanceElement(element);
        });

        // Observer pour les nouveaux éléments
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        const newInteractives = node.querySelectorAll ? 
                            node.querySelectorAll('button, .mobile-tab, .building-card, .building-plot, .stat-card') : [];
                        newInteractives.forEach(el => this.enhanceElement(el));
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    enhanceElement(element) {
        if (element.dataset.enhanced) return;
        element.dataset.enhanced = 'true';

        // Styles CSS pour les interactions
        element.style.cursor = 'pointer';
        element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        element.style.userSelect = 'none';
        element.style.webkitUserSelect = 'none';

        // Événements tactiles
        element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: true });

        // Effet ripple
        this.addRippleEffect(element);
    }

    addRippleEffect(element) {
        element.style.position = 'relative';
        element.style.overflow = 'hidden';

        element.addEventListener('touchstart', (e) => {
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.touches[0].clientX - rect.left - size / 2;
            const y = e.touches[0].clientY - rect.top - size / 2;

            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(217, 119, 6, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 1;
            `;

            element.appendChild(ripple);

            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });

        // Ajouter l'animation CSS si elle n'existe pas
        if (!document.querySelector('#ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    handleTouchStart(event) {
        const element = event.currentTarget;
        const touch = event.touches[0];
        
        this.touchStartTime = Date.now();
        this.touchStartPos = { x: touch.clientX, y: touch.clientY };
        
        // Effet visuel immédiat
        this.addTouchFeedback(element);
        
        // Timer pour appui long
        this.longPressTimer = setTimeout(() => {
            this.handleLongPress(element, event);
        }, this.longPressDelay);

        // Vibration légère
        this.vibrate(10);
    }

    handleTouchMove(event) {
        const touch = event.touches[0];
        const deltaX = Math.abs(touch.clientX - this.touchStartPos.x);
        const deltaY = Math.abs(touch.clientY - this.touchStartPos.y);
        
        if (deltaX > this.tapThreshold || deltaY > this.tapThreshold) {
            this.clearLongPressTimer();
            this.removeTouchFeedback();
        }
    }

    handleTouchEnd(event) {
        const element = event.currentTarget;
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - this.touchStartTime;
        const touch = event.changedTouches[0];
        const deltaX = Math.abs(touch.clientX - this.touchStartPos.x);
        const deltaY = Math.abs(touch.clientY - this.touchStartPos.y);
        
        this.clearLongPressTimer();
        this.removeTouchFeedback();
        
        // Vérifier si c'est un tap valide
        if (deltaX < this.tapThreshold && deltaY < this.tapThreshold && touchDuration < 500) {
            // Vérifier double tap
            if (touchEndTime - this.lastTap < this.doubleTapDelay) {
                this.handleDoubleTap(element, event);
                this.lastTap = 0; // Reset pour éviter triple tap
            } else {
                setTimeout(() => {
                    if (touchEndTime === this.lastTap) {
                        this.handleTap(element, event);
                    }
                }, this.doubleTapDelay);
                this.lastTap = touchEndTime;
            }
            
            // Vibration de confirmation
            this.vibrate(30);
        }
    }

    handleTouchCancel(event) {
        this.clearLongPressTimer();
        this.removeTouchFeedback();
    }

    handleTap(element, event) {
        // Animation de tap
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);

        // Logique spécifique par type d'élément
        if (element.classList.contains('mobile-tab')) {
            this.handleTabTap(element);
        } else if (element.classList.contains('building-card') || element.classList.contains('building-plot')) {
            this.handleBuildingTap(element);
        } else if (element.classList.contains('stat-card') || element.classList.contains('resource-item')) {
            this.handleResourceTap(element);
        } else if (element.tagName === 'BUTTON') {
            // Laisser le comportement par défaut du bouton
            return;
        }
    }

    handleDoubleTap(element, event) {
        event.preventDefault(); // Empêcher le zoom
        
        // Animation plus prononcée
        element.style.transform = 'scale(0.9)';
        setTimeout(() => {
            element.style.transform = 'scale(1.05)';
            setTimeout(() => {
                element.style.transform = '';
            }, 100);
        }, 100);

        // Vibration double
        this.vibrate([30, 50, 30]);

        // Logique spécifique pour double tap
        if (element.classList.contains('building-card')) {
            this.handleBuildingDoubleTap(element);
        } else if (element.classList.contains('resource-item')) {
            this.handleResourceDoubleTap(element);
        }
    }

    handleLongPress(element, event) {
        // Animation d'appui long
        element.style.transform = 'scale(1.05)';
        setTimeout(() => {
            element.style.transform = '';
        }, 300);

        // Vibration forte
        this.vibrate(100);

        // Menu contextuel ou info détaillée
        if (element.classList.contains('building-card')) {
            this.showBuildingDetails(element);
        } else if (element.classList.contains('stat-card')) {
            this.showStatDetails(element);
        }
    }

    // Méthodes spécifiques pour les différents éléments
    handleTabTap(element) {
        const tabId = element.dataset.tab;
        if (tabId && window.mobileNav) {
            window.mobileNav.switchTab(tabId);
        }
    }

    handleBuildingTap(element) {
        // Effet de sélection
        element.style.borderColor = 'var(--gold-light)';
        element.style.boxShadow = '0 0 20px rgba(217, 119, 6, 0.4)';
        
        setTimeout(() => {
            element.style.borderColor = '';
            element.style.boxShadow = '';
        }, 1000);

        console.log('Bâtiment sélectionné:', element.querySelector('.building-name')?.textContent);
    }

    handleBuildingDoubleTap(element) {
        // Action rapide (ex: amélioration)
        this.showQuickAction(element, 'Amélioration rapide!');
    }

    handleResourceTap(element) {
        // Effet de highlight
        const value = element.querySelector('.resource-value, .stat-value');
        if (value) {
            value.style.color = 'var(--success-green)';
            value.style.transform = 'scale(1.2)';
            setTimeout(() => {
                value.style.color = '';
                value.style.transform = '';
            }, 800);
        }
    }

    handleResourceDoubleTap(element) {
        this.showQuickAction(element, 'Info ressource');
    }

    // Méthodes utilitaires
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

    showQuickAction(element, message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary));
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            z-index: 3000;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            animation: toastShow 2s ease-out forwards;
        `;

        document.body.appendChild(toast);

        if (!document.querySelector('#toast-animation')) {
            const style = document.createElement('style');
            style.id = 'toast-animation';
            style.textContent = `
                @keyframes toastShow {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 2000);
    }

    showBuildingDetails(element) {
        const name = element.querySelector('.building-name')?.textContent || 'Bâtiment';
        const level = element.querySelector('.building-level')?.textContent || 'N/A';
        
        this.showQuickAction(element, `${name} - ${level}`);
    }

    showStatDetails(element) {
        const label = element.querySelector('.stat-label')?.textContent || 'Statistique';
        const value = element.querySelector('.stat-value')?.textContent || '0';
        
        this.showQuickAction(element, `${label}: ${value}`);
    }

    // Navigation par swipe
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

            if (diffY > diffX) {
                isScrolling = true;
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY || isScrolling) return;

            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > this.swipeThreshold) {
                if (diffX > 0) {
                    this.swipeLeft();
                } else {
                    this.swipeRight();
                }
            }

            startX = 0;
            startY = 0;
        }, { passive: true });
    }

    swipeLeft() {
        // Onglet suivant
        if (window.mobileNav) {
            window.mobileNav.switchToNextTab();
        }
        this.vibrate(20);
    }

    swipeRight() {
        // Onglet précédent
        if (window.mobileNav) {
            window.mobileNav.switchToPreviousTab();
        }
        this.vibrate(20);
    }

    // Pull to refresh
    setupPullToRefresh() {
        let startY = 0;
        let pullDistance = 0;
        const pullThreshold = 80;
        let isPulling = false;

        document.addEventListener('touchstart', (e) => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            if (scrollTop === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            pullDistance = e.touches[0].clientY - startY;
            
            if (pullDistance > 0) {
                this.showPullIndicator(pullDistance, pullThreshold);
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (isPulling && pullDistance > pullThreshold) {
                this.triggerRefresh();
            }
            this.hidePullIndicator();
            isPulling = false;
            pullDistance = 0;
        }, { passive: true });
    }

    showPullIndicator(distance, threshold) {
        let indicator = document.querySelector('#pull-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'pull-indicator';
            indicator.innerHTML = '↓ Tirer pour actualiser';
            indicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary));
                color: white;
                text-align: center;
                padding: 1rem;
                font-weight: 600;
                z-index: 2500;
                transform: translateY(-100%);
                transition: transform 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }

        const progress = Math.min(distance / threshold, 1);
        indicator.style.transform = `translateY(${Math.max(progress * 100 - 100, -100)}%)`;
        
        if (progress >= 1) {
            indicator.innerHTML = '↻ Relâcher pour actualiser';
            this.vibrate(50);
        } else {
            indicator.innerHTML = '↓ Tirer pour actualiser';
        }
    }

    hidePullIndicator() {
        const indicator = document.querySelector('#pull-indicator');
        if (indicator) {
            indicator.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 300);
        }
    }

    triggerRefresh() {
        this.vibrate(100);
        this.showQuickAction(document.body, 'Actualisation...');
        
        // Simuler l'actualisation
        setTimeout(() => {
            if (typeof updateAllUI === 'function') {
                updateAllUI();
            }
            location.reload();
        }, 1000);
    }

    // Optimisations diverses
    optimizeScrolling() {
        document.querySelectorAll('.view-container').forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.overflowScrolling = 'touch';
        });
    }

    preventDefaultBehaviors() {
        // Empêcher le zoom sur double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });

        // Empêcher la sélection de texte
        document.addEventListener('selectstart', (e) => {
            if (!e.target.matches('input, textarea')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    setupHapticFeedback() {
        this.hapticSupported = 'vibrate' in navigator;
    }

    vibrate(pattern) {
        if (this.hapticSupported && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }
}

// Initialisation automatique
let enhancedMobileInteractions;

document.addEventListener('DOMContentLoaded', () => {
    enhancedMobileInteractions = new EnhancedMobileInteractions();
});

// Export pour utilisation globale
if (typeof window !== 'undefined') {
    window.enhancedMobileInteractions = enhancedMobileInteractions;
}