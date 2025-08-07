/**
 * 🏛️ IMPERIUM - Script de mise à jour de toutes les pages
 * Ce script permet d'ajouter la barre supérieure commune à toutes les pages
 */

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = __dirname;
const excludeDirs = ['.git', '.vscode', 'node_modules'];
const htmlExtension = '.html';

// Chemins relatifs pour les ressources
function getRelativePath(filePath) {
    const depth = filePath.split(path.sep).length - rootDir.split(path.sep).length;
    return depth > 1 ? '../'.repeat(depth - 1) : './';
}

// Fonction pour mettre à jour un fichier HTML
function updateHtmlFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const relativePath = getRelativePath(filePath);
        
        // Vérifier si le fichier a déjà été mis à jour
        if (content.includes('mobile-2025.css') || content.includes('common-header-2025.js')) {
            console.log(`Le fichier ${filePath} a déjà été mis à jour.`);
            return;
        }
        
        // Mettre à jour les liens CSS et JS
        content = content.replace(
            /<head>[\s\S]*?<\/head>/i,
            (match) => {
                // Ajouter les nouveaux styles et scripts
                match = match.replace(
                    '</head>',
                    `    <link rel="stylesheet" href="${relativePath}mobile-2025.css">\n    <script src="${relativePath}common-header-2025.js"></script>\n    <script src="${relativePath}resource-updater.js"></script>\n</head>`
                );
                
                // Remplacer les anciens scripts si nécessaire
                match = match.replace(
                    `<script src="${relativePath}Navigation/common-header.js"></script>`,
                    `<!-- <script src="${relativePath}Navigation/common-header.js"></script> -->`
                );
                
                return match;
            }
        );
        
        // Sauvegarder le fichier mis à jour
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fichier mis à jour : ${filePath}`);
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de ${filePath}:`, error);
    }
}

// Fonction récursive pour parcourir les répertoires
function processDirectory(directory) {
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
        // Ignorer les répertoires exclus
        if (excludeDirs.includes(item)) continue;
        
        const itemPath = path.join(directory, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
            processDirectory(itemPath);
        } else if (stats.isFile() && item.endsWith(htmlExtension)) {
            updateHtmlFile(itemPath);
        }
    }
}

// Exécuter le script
console.log('Début de la mise à jour des pages...');
processDirectory(rootDir);
console.log('Mise à jour terminée !');