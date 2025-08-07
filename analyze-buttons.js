/**
 * 🏛️ IMPERIUM - Analyseur de boutons
 * Ce script analyse toutes les pages HTML et identifie les boutons non fonctionnels
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const rootDir = '.';
const outputFile = 'buttons-analysis.json';

// Résultats
const results = {
    totalPages: 0,
    totalButtons: 0,
    functionalButtons: 0,
    nonFunctionalButtons: 0,
    pagesMissingHeader: [],
    buttonsByPage: {}
};

// Fonction pour analyser un fichier HTML
async function analyzeHtmlFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const dom = new JSDOM(content);
        const document = dom.window.document;
        
        // Vérifier si la page a le header commun
        const hasCommonHeader = document.querySelector('.imperium-header-2025') !== null;
        
        if (!hasCommonHeader) {
            results.pagesMissingHeader.push(filePath);
        }
        
        // Trouver tous les boutons et liens
        const buttons = [...document.querySelectorAll('button, .button, .btn, [role="button"]')];
        const links = [...document.querySelectorAll('a')];
        const clickables = [...document.querySelectorAll('[onclick]')];
        
        // Combiner tous les éléments cliquables
        const allClickables = [...new Set([...buttons, ...links, ...clickables])];
        
        // Analyser chaque élément cliquable
        const pageResults = {
            path: filePath,
            totalButtons: allClickables.length,
            functionalButtons: 0,
            nonFunctionalButtons: 0,
            buttons: []
        };
        
        allClickables.forEach(element => {
            const hasOnClick = element.hasAttribute('onclick');
            const hasHref = element.hasAttribute('href') && element.getAttribute('href') !== '#';
            const hasEventListener = element.hasAttribute('data-action') || element.hasAttribute('data-function');
            
            const isFunctional = hasOnClick || hasHref || hasEventListener;
            
            pageResults.buttons.push({
                type: element.tagName.toLowerCase(),
                text: element.textContent.trim(),
                id: element.id || null,
                class: element.className || null,
                isFunctional: isFunctional,
                action: hasOnClick ? element.getAttribute('onclick') : 
                       hasHref ? element.getAttribute('href') : 
                       hasEventListener ? element.getAttribute('data-action') || element.getAttribute('data-function') : null
            });
            
            if (isFunctional) {
                pageResults.functionalButtons++;
                results.functionalButtons++;
            } else {
                pageResults.nonFunctionalButtons++;
                results.nonFunctionalButtons++;
            }
        });
        
        results.buttonsByPage[filePath] = pageResults;
        results.totalButtons += pageResults.totalButtons;
        results.totalPages++;
        
        console.log(`Analysé: ${filePath} - ${pageResults.totalButtons} boutons (${pageResults.functionalButtons} fonctionnels, ${pageResults.nonFunctionalButtons} non fonctionnels)`);
    } catch (error) {
        console.error(`Erreur lors de l'analyse de ${filePath}:`, error);
    }
}

// Fonction pour parcourir récursivement les répertoires
async function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            await walkDir(filePath);
        } else if (file.endsWith('.html')) {
            await analyzeHtmlFile(filePath);
        }
    }
}

// Fonction principale
async function main() {
    console.log('Démarrage de l\'analyse des boutons...');
    
    try {
        await walkDir(rootDir);
        
        // Écrire les résultats dans un fichier JSON
        fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
        
        console.log('\nAnalyse terminée!');
        console.log(`Pages analysées: ${results.totalPages}`);
        console.log(`Boutons totaux: ${results.totalButtons}`);
        console.log(`Boutons fonctionnels: ${results.functionalButtons}`);
        console.log(`Boutons non fonctionnels: ${results.nonFunctionalButtons}`);
        console.log(`Pages sans header commun: ${results.pagesMissingHeader.length}`);
        console.log(`Résultats détaillés écrits dans: ${outputFile}`);
    } catch (error) {
        console.error('Erreur lors de l\'analyse:', error);
    }
}

// Exécuter le script
main();