/**
 * 🏛️ IMPERIUM - Console Globale Flottante
 * Système de suivi en temps réel de toutes les actions du jeu
 */

class ImperiumGlobalConsole {
    constructor() {
        this.isVisible = false;
        this.activities = [];
        this.maxActivities = 50;
        this.updateInterval = 1000; // 1 seconde
        
        this.init();
        this.startTracking();
    }
    
    init() {
        this.createConsoleElement();
        this.createFloatingButton();
        this.setupEventListeners();
    }
    
    createFloatingButton() {
        const button = document.createElement('div');
        button.id = 'global-console-btn';
        button.className = 'global-console-btn';
        button.innerHTML = `
            <div class="console-btn-icon">📊</div>
            <div class="console-btn-badge" id="console-badge">0</div>
        `;
        
        // Styles pour le bouton flottant
        const style = document.createElement('style');
        style.textContent = `
            .global-console-btn {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 70px;
                height: 70px;
                background: linear-gradient(135deg, var(--roman-red, #8B0000), var(--roman-bronze, #CD7F32));
                border: 3px solid var(--roman-gold, #FFD700);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
                transition: all 0.3s ease;
                z-index: 10000;
                font-family: 'Times New Roman', serif;
            }
            
            .global-console-btn:hover {
                transform: translateY(-5px) scale(1.1);
                box-shadow: 0 15px 35px rgba(255, 215, 0, 0.6);
            }
            
            .console-btn-icon {
                font-size: 2rem;
                filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
            }
            
            .console-btn-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #dc2626;
                color: white;
                border-radius: 50%;
                width: 25px;
                height: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: bold;
                border: 2px solid var(--roman-gold, #FFD700);
            }
            
            .global-console {
                position: fixed;
                bottom: 120px;
                right: 30px;
                width: 450px;
                max-height: 600px;
                background: linear-gradient(135deg, 
                    rgba(139, 0, 0, 0.95) 0%, 
                    rgba(0, 0, 0, 0.9) 100%);
                border: 3px solid var(--roman-gold, #FFD700);
                border-radius: 1rem;
                backdrop-filter: blur(15px);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
                z-index: 9999;
                font-family: 'Times New Roman', serif;
                transform: translateX(500px);
                transition: transform 0.4s ease;
                overflow: hidden;
            }
            
            .global-console.visible {
                transform: translateX(0);
            }
            
            .console-header {
                background: linear-gradient(135deg, var(--roman-gold, #FFD700), var(--roman-bronze, #CD7F32));
                color: var(--roman-red, #8B0000);
                padding: 1rem;
                font-weight: bold;
                font-size: 1.2rem;
                text-align: center;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                border-bottom: 2px solid var(--roman-bronze, #CD7F32);
            }
            
            .console-tabs {
                display: flex;
                background: rgba(0, 0, 0, 0.3);
                border-bottom: 1px solid var(--roman-bronze, #CD7F32);
            }
            
            .console-tab {
                flex: 1;
                padding: 0.8rem;
                text-align: center;
                color: var(--roman-marble, #F8F8FF);
                cursor: pointer;
                transition: all 0.3s ease;
                border-right: 1px solid var(--roman-bronze, #CD7F32);
                font-size: 0.9rem;
            }
            
            .console-tab:last-child {
                border-right: none;
            }
            
            .console-tab:hover {
                background: rgba(255, 215, 0, 0.2);
            }
            
            .console-tab.active {
                background: rgba(255, 215, 0, 0.3);
                color: var(--roman-gold, #FFD700);
                font-weight: bold;
            }
            
            .console-content {
                height: 400px;
                overflow-y: auto;
                padding: 1rem;
            }
            
            .console-content::-webkit-scrollbar {
                width: 8px;
            }
            
            .console-content::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
            }
            
            .console-content::-webkit-scrollbar-thumb {
                background: var(--roman-gold, #FFD700);
                border-radius: 4px;
            }
            
            .activity-item {
                background: rgba(0, 0, 0, 0.3);
                border-left: 4px solid var(--roman-gold, #FFD700);
                border-radius: 0.5rem;
                padding: 1rem;
                margin-bottom: 0.8rem;
                transition: all 0.3s ease;
            }
            
            .activity-item:hover {
                background: rgba(255, 215, 0, 0.1);
                transform: translateX(5px);
            }
            
            .activity-item.construction {
                border-left-color: #22c55e;
            }
            
            .activity-item.research {
                border-left-color: #3b82f6;
            }
            
            .activity-item.military {
                border-left-color: #dc2626;
            }
            
            .activity-item.trade {
                border-left-color: #f59e0b;
            }
            
            .activity-item.event {
                border-left-color: #8b5cf6;
            }
            
            .activity-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            
            .activity-title {
                color: var(--roman-gold, #FFD700);
                font-weight: bold;
                font-size: 1rem;
            }
            
            .activity-time {
                color: var(--roman-marble, #F8F8FF);
                font-size: 0.8rem;
                opacity: 0.8;
            }
            
            .activity-description {
                color: var(--roman-marble, #F8F8FF);
                font-size: 0.9rem;
                line-height: 1.4;
                margin-bottom: 0.5rem;
            }
            
            .activity-progress {
                height: 6px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 3px;
                overflow: hidden;
                margin-top: 0.5rem;
            }
            
            .activity-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, var(--roman-gold, #FFD700), var(--roman-bronze, #CD7F32));
                width: 0%;
                transition: width 0.3s ease;
            }
            
            .activity-status {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.8rem;
                margin-top: 0.3rem;
            }
            
            .activity-eta {
                color: var(--roman-gold, #FFD700);
                font-weight: bold;
            }
            
            .activity-location {
                color: var(--roman-marble, #F8F8FF);
                opacity: 0.7;
            }
            
            .console-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                padding: 1rem;
                background: rgba(0, 0, 0, 0.2);
            }
            
            .console-stat {
                text-align: center;
            }
            
            .console-stat-value {
                color: var(--roman-gold, #FFD700);
                font-size: 1.5rem;
                font-weight: bold;
            }
            
            .console-stat-label {
                color: var(--roman-marble, #F8F8FF);
                font-size: 0.8rem;
                margin-top: 0.2rem;
            }
            
            .no-activities {
                text-align: center;
                color: var(--roman-marble, #F8F8FF);
                opacity: 0.6;
                padding: 2rem;
                font-style: italic;
            }
            
            @media (max-width: 768px) {
                .global-console {
                    width: calc(100vw - 60px);
                    right: 30px;
                    left: 30px;
                }
                
                .global-console-btn {
                    bottom: 20px;
                    right: 20px;
                    width: 60px;
                    height: 60px;
                }
                
                .console-btn-icon {
                    font-size: 1.5rem;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(button);
        
        button.addEventListener('click', () => this.toggleConsole());
    }
    
    createConsoleElement() {
        const console = document.createElement('div');
        console.id = 'global-console';
        console.className = 'global-console';
        console.innerHTML = `
            <div class="console-header">
                ⚜️ ACTA IMPERII ⚜️
                <div style="font-size: 0.8rem; margin-top: 0.3rem; opacity: 0.8;">
                    Console des Activités de l'Empire
                </div>
            </div>
            
            <div class="console-tabs">
                <div class="console-tab active" data-tab="all">🏛️ Tout</div>
                <div class="console-tab" data-tab="construction">🏗️ Construction</div>
                <div class="console-tab" data-tab="research">📚 Recherche</div>
                <div class="console-tab" data-tab="military">⚔️ Militaire</div>
                <div class="console-tab" data-tab="trade">💰 Commerce</div>
            </div>
            
            <div class="console-content" id="console-content">
                <!-- Contenu généré dynamiquement -->
            </div>
            
            <div class="console-stats">
                <div class="console-stat">
                    <div class="console-stat-value" id="active-tasks">0</div>
                    <div class="console-stat-label">Tâches Actives</div>
                </div>
                <div class="console-stat">
                    <div class="console-stat-value" id="completed-today">0</div>
                    <div class="console-stat-label">Complétées Aujourd'hui</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(console);
        
        // Gérer les onglets
        console.querySelectorAll('.console-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                console.querySelectorAll('.console-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentTab = tab.dataset.tab;
                this.updateConsoleContent();
            });
        });
        
        this.currentTab = 'all';
    }
    
    setupEventListeners() {
        // Écouter les événements du moteur de jeu
        if (typeof gameEngine !== 'undefined') {
            gameEngine.on('constructionStarted', (data) => {
                this.addActivity('construction', `🏗️ Construction: ${data.buildingName}`, 
                    `Niveau ${data.level} - ${data.location}`, data.duration, data.startTime);
            });
            
            gameEngine.on('constructionCompleted', (data) => {
                this.completeActivity('construction', data.buildingName);
                this.addActivity('construction', `✅ Terminé: ${data.buildingName}`, 
                    `Niveau ${data.level} construit avec succès!`, 0, Date.now(), true);
            });
            
            gameEngine.on('researchStarted', (data) => {
                this.addActivity('research', `📚 Recherche: ${data.technologyName}`, 
                    `Académie - Nouvelle technologie`, data.duration, data.startTime);
            });
            
            gameEngine.on('researchCompleted', (data) => {
                this.completeActivity('research', data.technologyName);
                this.addActivity('research', `🎓 Découverte: ${data.technologyName}`, 
                    `Technologie maîtrisée! Nouveaux bonus disponibles.`, 0, Date.now(), true);
            });
            
            gameEngine.on('unitRecruited', (data) => {
                this.addActivity('military', `⚔️ Recrutement: ${data.unitName}`, 
                    `${data.quantity} unités - Caserne`, data.duration, data.startTime);
            });
            
            gameEngine.on('tradeExecuted', (data) => {
                this.addActivity('trade', `💰 Transaction: ${data.resource}`, 
                    `${data.quantity} unités à ${data.price} or/unité`, 0, Date.now(), true);
            });
            
            gameEngine.on('worldEventStarted', (data) => {
                this.addActivity('event', `🌍 Événement: ${data.name}`, 
                    data.description, data.duration, data.startTime);
            });
        }
        
        // Fermer la console en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            const console = document.getElementById('global-console');
            const button = document.getElementById('global-console-btn');
            
            if (this.isVisible && !console.contains(e.target) && !button.contains(e.target)) {
                this.hideConsole();
            }
        });
        
        // Raccourci clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || (e.ctrlKey && e.key === '`')) {
                e.preventDefault();
                this.toggleConsole();
            }
        });
    }
    
    startTracking() {
        // Mise à jour périodique
        setInterval(() => {
            this.updateActivities();
            this.updateConsoleContent();
            this.updateBadge();
        }, this.updateInterval);
        
        // Ajouter quelques activités de démonstration au démarrage
        setTimeout(() => {
            this.addDemoActivities();
        }, 2000);
    }
    
    addActivity(type, title, description, duration = 0, startTime = Date.now(), completed = false) {
        const activity = {
            id: Date.now() + Math.random(),
            type: type,
            title: title,
            description: description,
            duration: duration,
            startTime: startTime,
            completed: completed,
            timestamp: Date.now()
        };
        
        this.activities.unshift(activity);
        
        // Limiter le nombre d'activités
        if (this.activities.length > this.maxActivities) {
            this.activities = this.activities.slice(0, this.maxActivities);
        }
        
        this.updateConsoleContent();
        this.updateBadge();
    }
    
    completeActivity(type, title) {
        const activity = this.activities.find(a => a.type === type && a.title.includes(title) && !a.completed);
        if (activity) {
            activity.completed = true;
            activity.completedAt = Date.now();
        }
    }
    
    updateActivities() {
        // Mettre à jour le progrès des activités en cours
        this.activities.forEach(activity => {
            if (!activity.completed && activity.duration > 0) {
                const elapsed = Date.now() - activity.startTime;
                const progress = Math.min(100, (elapsed / activity.duration) * 100);
                activity.progress = progress;
                
                // Marquer comme terminé si le temps est écoulé
                if (progress >= 100) {
                    activity.completed = true;
                    activity.completedAt = Date.now();
                }
            }
        });
    }
    
    updateConsoleContent() {
        const content = document.getElementById('console-content');
        if (!content) return;
        
        let filteredActivities = this.activities;
        
        if (this.currentTab !== 'all') {
            filteredActivities = this.activities.filter(a => a.type === this.currentTab);
        }
        
        if (filteredActivities.length === 0) {
            content.innerHTML = `
                <div class="no-activities">
                    🏛️ Aucune activité en cours<br>
                    <small>Votre empire est en paix...</small>
                </div>
            `;
            return;
        }
        
        content.innerHTML = filteredActivities.map(activity => {
            const timeAgo = this.formatTimeAgo(Date.now() - activity.timestamp);
            const progress = activity.progress || 0;
            const eta = activity.duration > 0 && !activity.completed ? 
                this.formatTime(activity.startTime + activity.duration - Date.now()) : '';
            
            return `
                <div class="activity-item ${activity.type} ${activity.completed ? 'completed' : ''}">
                    <div class="activity-header">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-time">${timeAgo}</div>
                    </div>
                    <div class="activity-description">${activity.description}</div>
                    ${activity.duration > 0 && !activity.completed ? `
                        <div class="activity-progress">
                            <div class="activity-progress-bar" style="width: ${progress}%"></div>
                        </div>
                        <div class="activity-status">
                            <div class="activity-eta">ETA: ${eta}</div>
                            <div class="activity-location">${Math.floor(progress)}% terminé</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        // Faire défiler vers le haut pour voir les nouvelles activités
        content.scrollTop = 0;
    }
    
    updateBadge() {
        const badge = document.getElementById('console-badge');
        if (!badge) return;
        
        const activeCount = this.activities.filter(a => !a.completed && a.duration > 0).length;
        badge.textContent = activeCount;
        badge.style.display = activeCount > 0 ? 'flex' : 'none';
        
        // Mettre à jour les statistiques
        const activeTasksEl = document.getElementById('active-tasks');
        const completedTodayEl = document.getElementById('completed-today');
        
        if (activeTasksEl) {
            activeTasksEl.textContent = activeCount;
        }
        
        if (completedTodayEl) {
            const today = new Date().toDateString();
            const completedToday = this.activities.filter(a => 
                a.completed && new Date(a.completedAt || a.timestamp).toDateString() === today
            ).length;
            completedTodayEl.textContent = completedToday;
        }
    }
    
    toggleConsole() {
        if (this.isVisible) {
            this.hideConsole();
        } else {
            this.showConsole();
        }
    }
    
    showConsole() {
        const console = document.getElementById('global-console');
        if (console) {
            console.classList.add('visible');
            this.isVisible = true;
            this.updateConsoleContent();
        }
    }
    
    hideConsole() {
        const console = document.getElementById('global-console');
        if (console) {
            console.classList.remove('visible');
            this.isVisible = false;
        }
    }
    
    addDemoActivities() {
        // Ajouter quelques activités de démonstration
        this.addActivity('construction', '🏛️ Construction: Forum', 
            'Niveau 2 - Centre-ville', 300000, Date.now() - 60000); // 5 min, commencé il y a 1 min
        
        this.addActivity('research', '📚 Recherche: Architecture', 
            'Académie - Amélioration des bâtiments', 600000, Date.now() - 120000); // 10 min, commencé il y a 2 min
        
        this.addActivity('military', '⚔️ Recrutement: Légionnaires', 
            '10 unités - Caserne', 180000, Date.now() - 30000); // 3 min, commencé il y a 30s
        
        this.addActivity('trade', '💰 Transaction: Bois', 
            '500 unités vendues à 2.5 or/unité', 0, Date.now() - 300000, true); // Terminé il y a 5 min
        
        this.addActivity('event', '🌍 Événement: Âge d\'Or', 
            'Bonus de production +50% pour tous les joueurs', 3600000, Date.now() - 600000); // 1h, commencé il y a 10 min
    }
    
    // Utilitaires
    formatTime(ms) {
        if (ms <= 0) return '0s';
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}j ${hours % 24}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    formatTimeAgo(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `il y a ${days}j`;
        } else if (hours > 0) {
            return `il y a ${hours}h`;
        } else if (minutes > 0) {
            return `il y a ${minutes}min`;
        } else {
            return `il y a ${seconds}s`;
        }
    }
}

// Initialiser la console globale
let globalConsole;

document.addEventListener('DOMContentLoaded', () => {
    // Attendre que les autres systèmes soient chargés
    setTimeout(() => {
        globalConsole = new ImperiumGlobalConsole();
        console.log('📊 Console globale IMPERIUM initialisée!');
    }, 1000);
});

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImperiumGlobalConsole };
}