#!/bin/bash

# Script d'installation et de mise à jour pour IMPERIUM-MOBILE
echo "🏛️ IMPERIUM - Script d'installation et de mise à jour"
echo "======================================================"

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installation en cours..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js est déjà installé."
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install jsdom

# Créer le répertoire de sauvegarde
echo "📁 Création du répertoire de sauvegarde..."
mkdir -p backups

# Exécuter le script d'analyse des boutons
echo "🔍 Analyse des boutons en cours..."
node analyze-buttons.js

# Exécuter le script de mise à jour des pages
echo "🔄 Mise à jour des pages en cours..."
node update-pages.js

# Remplacer l'index.html par la nouvelle version
echo "🏠 Mise à jour de la page d'accueil..."
cp -f index-2025.html index.html

# Démarrer un serveur HTTP pour tester
echo "🚀 Démarrage du serveur HTTP pour tester..."
echo "📱 Accédez à http://localhost:8000 pour voir le résultat."
python3 -m http.server 8000

echo "✅ Installation et mise à jour terminées !"