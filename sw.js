/* ===== SERVICE WORKER POUR IMPERIUM MOBILE ===== */

const CACHE_NAME = 'imperium-mobile-v1.0.0';
const STATIC_CACHE_NAME = 'imperium-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'imperium-dynamic-v1.0.0';

// Fichiers à mettre en cache pour le fonctionnement hors ligne
const STATIC_FILES = [
    '/',
    '/index.html',
    '/mobile-styles.css',
    '/mobile-game-views.css',
    '/mobile-navigation.js',
    '/mobile-touch-handler.js',
    '/Navigation/common-styles.css',
    '/Navigation/common-navigation.js',
    '/manifest.json'
];

// Fichiers dynamiques (données de jeu, etc.)
const DYNAMIC_FILES = [
    '/Navigation/Empire/',
    '/Navigation/Militaire/',
    '/Navigation/Developpement/',
    '/Navigation/Social/',
    '/Navigation/Premium/'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installation');
    
    event.waitUntil(
        Promise.all([
            // Cache des fichiers statiques
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                console.log('📦 Cache statique créé');
                return cache.addAll(STATIC_FILES.map(url => new Request(url, {
                    cache: 'reload'
                })));
            }),
            
            // Cache dynamique
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                console.log('📦 Cache dynamique créé');
                return cache;
            })
        ]).then(() => {
            console.log('✅ Service Worker installé avec succès');
            // Forcer l'activation immédiate
            return self.skipWaiting();
        })
    );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activation');
    
    event.waitUntil(
        Promise.all([
            // Nettoyer les anciens caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME &&
                            cacheName.startsWith('imperium-')) {
                            console.log('🗑️ Suppression ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // Prendre le contrôle de tous les clients
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker activé');
        })
    );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Ignorer les requêtes non-HTTP
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Stratégie différente selon le type de ressource
    if (isStaticAsset(request)) {
        // Cache First pour les assets statiques
        event.respondWith(cacheFirst(request));
    } else if (isGameData(request)) {
        // Network First pour les données de jeu
        event.respondWith(networkFirst(request));
    } else if (isHTMLPage(request)) {
        // Stale While Revalidate pour les pages HTML
        event.respondWith(staleWhileRevalidate(request));
    } else {
        // Network Only pour le reste
        event.respondWith(fetch(request));
    }
});

// Stratégie Cache First
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('❌ Cache First failed:', error);
        return new Response('Ressource non disponible hors ligne', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Stratégie Network First
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('🔄 Network failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response(JSON.stringify({
            error: 'Données non disponibles hors ligne',
            offline: true
        }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Stratégie Stale While Revalidate
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // En cas d'erreur réseau, retourner la version cachée
        return cachedResponse;
    });
    
    // Retourner immédiatement la version cachée si disponible
    return cachedResponse || fetchPromise;
}

// Fonctions utilitaires pour identifier les types de requêtes
function isStaticAsset(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/);
}

function isGameData(request) {
    const url = new URL(request.url);
    return url.pathname.includes('/api/') || 
           url.pathname.includes('/data/') ||
           url.searchParams.has('gameData');
}

function isHTMLPage(request) {
    const url = new URL(request.url);
    return request.method === 'GET' && 
           (url.pathname.endsWith('.html') || 
            url.pathname.endsWith('/') ||
            !url.pathname.includes('.'));
}

// Gestion des messages depuis l'application
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'CACHE_GAME_STATE':
            cacheGameState(data).then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        default:
            console.log('📨 Message non reconnu:', type);
    }
});

// Fonctions utilitaires
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames.map(cacheName => {
            if (cacheName.startsWith('imperium-')) {
                return caches.delete(cacheName);
            }
        })
    );
}

async function cacheGameState(gameState) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = new Response(JSON.stringify(gameState), {
        headers: { 'Content-Type': 'application/json' }
    });
    return cache.put('/gameState', response);
}

// Gestion des notifications push (pour les futures fonctionnalités)
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: data.tag || 'imperium-notification',
        data: data.data,
        actions: [
            {
                action: 'open',
                title: 'Ouvrir le jeu',
                icon: '/icon-open.png'
            },
            {
                action: 'dismiss',
                title: 'Ignorer',
                icon: '/icon-dismiss.png'
            }
        ],
        vibrate: [200, 100, 200],
        requireInteraction: true
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                // Si une fenêtre est déjà ouverte, la focus
                for (const client of clientList) {
                    if (client.url.includes('imperium') && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Sinon, ouvrir une nouvelle fenêtre
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Synchroniser les données de jeu
        console.log('🔄 Synchronisation en arrière-plan');
        
        // Ici, vous pourriez synchroniser avec un serveur
        // Par exemple, sauvegarder l'état du jeu
        
        return Promise.resolve();
    } catch (error) {
        console.error('❌ Erreur de synchronisation:', error);
        throw error;
    }
}

console.log('🎮 Service Worker IMPERIUM chargé');