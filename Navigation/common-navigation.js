
// Configuration des pages et navigation
const NAVIGATION_CONFIG = {
    // Empire
    'index': { 
        title: 'Accueil', 
        file: 'index.html', 
        section: 'Empire',
        icon: '🏛️'
    },
    'cite': { 
        title: 'Ma Cité', 
        file: 'Empire/Cite.html', 
        section: 'Empire',
        icon: '🏛️'
    },
    'monde': { 
        title: 'Monde', 
        file: 'Empire/Monde.html', 
        section: 'Empire',
        icon: '🌍'
    },
    'province': { 
        title: 'Province', 
        file: 'Empire/Province.html', 
        section: 'Empire',
        icon: '🏝️'
    },
    
    // Développement
    'academie': { 
        title: 'Académie', 
        file: 'Developpement/Academie.html', 
        section: 'Développement',
        icon: '📚'
    },
    'commerce': { 
        title: 'Commerce', 
        file: 'Developpement/Commerce.html', 
        section: 'Développement',
        icon: '⚖️'
    },
    
    // Militaire
    'legions': { 
        title: 'Légions', 
        file: 'Militaire/Légions.html', 
        section: 'Militaire',
        icon: '⚔️'
    },
    'flotte': { 
        title: 'Flotte', 
        file: 'Militaire/Flotte.html', 
        section: 'Militaire',
        icon: '🚢'
    },
    'simulateur': { 
        title: 'Simulateur', 
        file: 'Militaire/Simulateur.html', 
        section: 'Militaire',
        icon: '💥'
    },
    
    // Social
    'diplomatie': { 
        title: 'Diplomatie', 
        file: 'Social/Diplomatie.html', 
        section: 'Social',
        icon: '🤝'
    },
    'alliance': { 
        title: 'Alliance', 
        file: 'Social/Alliance.html', 
        section: 'Social',
        icon: '🛡️'
    },
    'messages': { 
        title: 'Messages', 
        file: 'Social/Messsages.html', 
        section: 'Social',
        icon: '✉️'
    },
    
    // Premium
    'premium': { 
        title: 'Premium', 
        file: 'Premium/Premium.html', 
        section: 'Premium',
        icon: '👑'
    }
};

// Fonction pour créer les particules d'arrière-plan
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Fonction pour obtenir la page actuelle
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    for (const [key, config] of Object.entries(NAVIGATION_CONFIG)) {
        if (config.file === filename || 
            config.file.endsWith('/' + filename) ||
            (filename === 'index.html' && key === 'index')) {
            return key;
        }
    }
    
    return 'index'; // Par défaut
}

// Fonction pour naviguer vers une page
function navigateTo(pageKey) {
    const config = NAVIGATION_CONFIG[pageKey];
    if (!config) {
        console.error('Page non trouvée:', pageKey);
        return;
    }
    
    let url = config.file;
    const currentPath = window.location.pathname;
    const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
    
    if (currentDir.includes('/')) {
        if (config.file === 'index.html') {
            url = '../index.html';
        } else if (!config.file.includes('/')) {
            url = '../' + config.file;
        } else {
            url = '../' + config.file;
        }
    }
    
    window.location.href = url;
}

// Fonction pour naviguer vers l'accueil (logo IMPERIUM)
function navigateToHome() {
    const currentPath = window.location.pathname;
    const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
    
    if (currentDir.includes('/')) {
        window.location.href = '../index.html';
    } else {
        window.location.href = 'index.html';
    }
}

// Fonction pour mettre à jour la navigation active
function updateActiveNavigation() {
    const currentPage = getCurrentPage();
    const navLinks = document.querySelectorAll('.nav-item a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const pageKey = link.getAttribute('data-page');
        if (pageKey === currentPage) {
            link.classList.add('active');
        }
    });
}

// Fonction pour générer le HTML de navigation
function generateNavigationHTML() {
    const sections = {};
    
    Object.entries(NAVIGATION_CONFIG).forEach(([key, config]) => {
        if (key === 'index') return;
        
        if (!sections[config.section]) {
            sections[config.section] = [];
        }
        sections[config.section].push({ key, ...config });
    });
    
    let html = '';
    Object.entries(sections).forEach(([sectionName, pages]) => {
        html += `
            <div class="nav-section">
                <h2 class="nav-title">${sectionName}</h2>
                <ul class="nav-list">`;
        
        pages.forEach(page => {
            html += `
                    <li class="nav-item">
                        <a href="#" data-page="${page.key}" onclick="navigateTo('${page.key}'); return false;">
                            <span class="nav-icon">${page.icon}</span> ${page.title}
                        </a>
                    </li>`;
        });
        
        html += `
                </ul>
            </div>`;
    });
    
    return html;
}

// Fonction pour initialiser la navigation
function initializeNavigation() {
    createParticles();
    
    const sidebar = document.querySelector('.imperium-sidebar');
    if (sidebar) {
        sidebar.innerHTML = generateNavigationHTML();
    }
    
    updateActiveNavigation();
    
    const logo = document.querySelector('.imperium-logo');
    if (logo) {
        logo.addEventListener('click', navigateToHome);
    }
    
    const currentPage = getCurrentPage();
    const config = NAVIGATION_CONFIG[currentPage];
    if (config && config.title !== 'Accueil') {
        document.title = `IMPERIUM - ${config.title}`;
    }

    updateResourcesDisplay();
    updatePlayerInfo();
}

// Fonction utilitaire pour les ressources
function updateResourcesDisplay() {
    const resourcesDisplay = document.querySelector('.resources-display');
    if (resourcesDisplay) {
        resourcesDisplay.innerHTML = `
            <div class="resource-item">
                <span class="resource-icon">🌲</span>
                <span class="resource-value">1,250</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">🪨</span>
                <span class="resource-value">890</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">🍇</span>
                <span class="resource-value">456</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">⛏️</span>
                <span class="resource-value">234</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">💰</span>
                <span class="resource-value">1,890</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">📚</span>
                <span class="resource-value">67</span>
            </div>
        `;
    }
}

// Fonction utilitaire pour les informations du joueur
function updatePlayerInfo() {
    const playerName = document.querySelector('.player-name');
    const playerLevel = document.querySelector('.player-level');
    const playerAvatar = document.querySelector('.player-avatar');
    
    if (playerName) playerName.textContent = 'Marcus Aurelius';
    if (playerLevel) playerLevel.textContent = 'Citoyen - Niv. 1';
    if (playerAvatar) playerAvatar.textContent = 'M';
}

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initializeNavigation);

// Mettre à jour les ressources et les informations du joueur périodiquement
setInterval(() => {
    updateResourcesDisplay();
    updatePlayerInfo();
}, 5000); // Toutes les 5 secondes
