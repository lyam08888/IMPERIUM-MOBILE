# Script pour générer tous les fichiers .cs vides restants
param(
    [switch]$DryRun = $false
)

$projectRoot = "c:\Users\T.LAMARA\IMPERIUM"

# Configuration complète des fichiers restants
$fileConfigs = @{
    # Commerce
    "Navigation\Developpement\Commerce\Ordre du marché.cs" = @{
        functionName = "gererOrdreMarche"
        description = "Gestion des ordres de marché"
        category = "Commerce"
    }
    
    # Empire - Monde
    "Navigation\Empire\Monde\Commerce.cs" = @{
        functionName = "gererCommerceMonde"
        description = "Gestion du commerce mondial"
        category = "Empire"
    }
    
    "Navigation\Empire\Monde\Diplomatie.cs" = @{
        functionName = "gererDiplomatieMonde"
        description = "Gestion de la diplomatie mondiale"
        category = "Empire"
    }
    
    "Navigation\Empire\Monde\Explorer.cs" = @{
        functionName = "explorerMonde"
        description = "Exploration du monde"
        category = "Empire"
    }
    
    "Navigation\Empire\Monde\Gérer.cs" = @{
        functionName = "gererMonde"
        description = "Gestion générale du monde"
        category = "Empire"
    }
    
    "Navigation\Empire\Monde\Nouvelle Expéridition.cs" = @{
        functionName = "creerNouvelleExpedition"
        description = "Création d'une nouvelle expédition"
        category = "Empire"
    }
    
    "Navigation\Empire\Monde\Nouvelle Flotte.cs" = @{
        functionName = "creerNouvelleFlotte"
        description = "Création d'une nouvelle flotte"
        category = "Empire"
    }
    
    # Empire - Province
    "Navigation\Empire\Province\Détails.cs" = @{
        functionName = "afficherDetailsProvince"
        description = "Affichage des détails d'une province"
        category = "Empire"
        parameters = "provinceId"
    }
    
    "Navigation\Empire\Province\Gérer.cs" = @{
        functionName = "gererProvince"
        description = "Gestion d'une province"
        category = "Empire"
        parameters = "provinceId"
    }
    
    # Militaire - Flottes
    "Navigation\Militaire\Flottes\Améliorer Port.cs" = @{
        functionName = "ameliorerPort"
        description = "Amélioration du port"
        category = "Militaire"
    }
    
    "Navigation\Militaire\Flottes\Construction en Cours.cs" = @{
        functionName = "afficherConstructionsEnCours"
        description = "Affichage des constructions navales en cours"
        category = "Militaire"
    }
    
    "Navigation\Militaire\Flottes\Construire Marchand.cs" = @{
        functionName = "construireNavireMarchand"
        description = "Construction d'un navire marchand"
        category = "Militaire"
    }
    
    "Navigation\Militaire\Flottes\Galères de Guerre.cs" = @{
        functionName = "gererGaleresGuerre"
        description = "Gestion des galères de guerre"
        category = "Militaire"
    }
    
    "Navigation\Militaire\Flottes\Gérer Routes.cs" = @{
        functionName = "gererRoutesNavales"
        description = "Gestion des routes navales"
        category = "Militaire"
    }
    
    "Navigation\Militaire\Flottes\Navires d'Exploration.cs" = @{
        functionName = "gererNaviresExploration"
        description = "Gestion des navires d'exploration"
        category = "Militaire"
    }
    
    "Navigation\Militaire\Flottes\Nouvelle Expédition.cs" = @{
        functionName = "creerExpeditionNavale"
        description = "Création d'une expédition navale"
        category = "Militaire"
    }
    
    "Navigation\Militaire\Flottes\Rapport Naval.cs" = @{
        functionName = "afficherRapportNaval"
        description = "Affichage du rapport naval"
        category = "Militaire"
    }
    
    # Militaire - Légions
    "Navigation\Militaire\Légions\Défendre Cité.cs" = @{
        functionName = "defenreCite"
        description = "Défense de la cité"
        category = "Militaire"
    }
    
    "Navigation\Militaire\Légions\Entraînement Rapide.cs" = @{
        functionName = "entrainementRapide"
        description = "Entraînement rapide des troupes"
        category = "Militaire"
    }
    
    "Navigation\Militaire\Légions\Nouvelle Campagne.cs" = @{
        functionName = "creerNouvelleCampagne"
        description = "Création d'une nouvelle campagne militaire"
        category = "Militaire"
    }
    
    "Navigation\Militaire\Légions\Rapport de Bataille.cs" = @{
        functionName = "afficherRapportBataille"
        description = "Affichage du rapport de bataille"
        category = "Militaire"
    }
    
    "Navigation\Militaire\Légions\Recruter.cs" = @{
        functionName = "recruterTroupes"
        description = "Recrutement de nouvelles troupes"
        category = "Militaire"
        parameters = "typeUnite, quantite"
    }
}

# Fonction pour générer le contenu avancé
function Generate-AdvancedContent {
    param(
        [hashtable]$config,
        [string]$fileName
    )
    
    $parameters = if ($config.parameters) { $config.parameters } else { "" }
    $category = $config.category
    
    # Vérifications spécifiques selon la catégorie
    $categoryChecks = switch ($category) {
        "Commerce" { @"
        if (!gameState.marketSystem) {
            showNotification('Système de marché non disponible', 'error');
            return false;
        }
        
        if (!gameState.resources) {
            showNotification('Données de ressources non disponibles', 'error');
            return false;
        }
"@ }
        "Empire" { @"
        if (!gameState.empire) {
            showNotification('Système d''empire non disponible', 'error');
            return false;
        }
        
        if (!gameState.territories) {
            showNotification('Données territoriales non disponibles', 'error');
            return false;
        }
"@ }
        "Militaire" { @"
        if (!gameState.military) {
            showNotification('Système militaire non disponible', 'error');
            return false;
        }
        
        if (!gameState.military.units) {
            showNotification('Données d''unités militaires non disponibles', 'error');
            return false;
        }
"@ }
        default { @"
        // Vérifications génériques
        if (!player) {
            showNotification('Données joueur non disponibles', 'error');
            return false;
        }
"@ }
    }
    
    # Actions spécifiques selon le type de fonction
    $specificActions = switch ($config.functionName) {
        "gererOrdreMarche" { @"
        // Charger les ordres de marché actifs
        const ordresActifs = gameState.marketSystem.getActiveOrders(player.id);
        console.log('Ordres actifs trouvés:', ordresActifs.length);
        
        // Mettre à jour l'interface
        if (typeof updateMarketOrdersUI === 'function') {
            updateMarketOrdersUI(ordresActifs);
        }
"@ }
        "explorerMonde" { @"
        // Vérifier les ressources nécessaires pour l'exploration
        const coutExploration = 100; // Or nécessaire
        if (gameState.resources.gold < coutExploration) {
            showNotification('Or insuffisant pour l''exploration', 'warning');
            return false;
        }
        
        // Lancer l'exploration
        gameState.resources.gold -= coutExploration;
        console.log('Exploration lancée');
"@ }
        "recruterTroupes" { @"
        // Vérifier les paramètres
        if (!typeUnite || !quantite) {
            showNotification('Paramètres de recrutement manquants', 'error');
            return false;
        }
        
        // Calculer le coût
        const coutParUnite = gameState.military.unitCosts[typeUnite] || 50;
        const coutTotal = coutParUnite * quantite;
        
        if (gameState.resources.gold < coutTotal) {
            showNotification('Ressources insuffisantes pour le recrutement', 'warning');
            return false;
        }
        
        // Effectuer le recrutement
        gameState.resources.gold -= coutTotal;
        if (!gameState.military.units[typeUnite]) {
            gameState.military.units[typeUnite] = 0;
        }
        gameState.military.units[typeUnite] += quantite;
        
        console.log('Recrutement effectué:', quantite, typeUnite);
"@ }
        default { @"
        // Logique générique pour ${config.description}
        console.log('Exécution de: ${config.description}');
        
        // TODO: Implémenter la logique spécifique
        // Simulation temporaire
        await new Promise(resolve => setTimeout(resolve, 200));
"@ }
    }
    
    return @"
/**
 * IMPERIUM - ${config.description}
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Fonction principale pour ${config.description}
function $($config.functionName)($parameters) {
    try {
        console.log('${config.description} - Début');
        
        // Vérifications préliminaires
        if (!window.gameEngine) {
            console.error('Moteur de jeu non initialisé');
            showNotification('Erreur: Moteur de jeu non disponible', 'error');
            return false;
        }

        const gameState = gameEngine.getGameState();
        const player = gameState.player;

        if (!player) {
            showNotification('Données joueur non disponibles', 'error');
            return false;
        }

        // Vérifications spécifiques à la catégorie
$categoryChecks

        // Actions spécifiques
$specificActions
        
        // Succès
        console.log('${config.description} - Terminé avec succès');
        showNotification('${config.description} réussie', 'success');
        
        // Sauvegarder l'état si nécessaire
        if (gameEngine.saveSystem) {
            gameEngine.saveSystem.sauvegarderJeu('autosave', '${config.description}');
        }
        
        // Mettre à jour l'interface si nécessaire
        if (typeof updateGameUI === 'function') {
            updateGameUI();
        }
        
        return true;

    } catch (error) {
        console.error('Erreur lors de ${config.description}:', error);
        showNotification('Erreur: ' + error.message, 'error');
        return false;
    }
}

// Fonction d'interface utilisateur
function creerInterface$($config.functionName.Substring(0,1).ToUpper() + $config.functionName.Substring(1))() {
    const container = document.createElement('div');
    container.className = '$($config.functionName.ToLower())-interface';
    
    container.innerHTML = ``
        <div class="action-panel">
            <h3>${config.description}</h3>
            <div class="action-content">
                <p>Interface pour ${config.description.ToLower()}</p>
                <div class="action-details">
                    <!-- TODO: Ajouter les éléments d'interface spécifiques -->
                    <div class="info-section">
                        <p>Fonctionnalité: ${config.description}</p>
                        <p>Catégorie: $category</p>
                    </div>
                </div>
            </div>
            <div class="action-buttons">
                <button class="btn primary" onclick="$($config.functionName)($parameters)">
                    Exécuter
                </button>
                <button class="btn secondary" onclick="fermerInterface()">
                    Annuler
                </button>
            </div>
        </div>
    ``;
    
    return container;
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
    window.$($config.functionName) = $($config.functionName);
    window.creerInterface$($config.functionName.Substring(0,1).ToUpper() + $config.functionName.Substring(1)) = creerInterface$($config.functionName.Substring(0,1).ToUpper() + $config.functionName.Substring(1));
}

console.log('Module $($config.functionName) chargé');
"@
}

# Traitement principal
Write-Host "Génération des fichiers .cs restants pour IMPERIUM" -ForegroundColor Cyan
Write-Host "Mode: $(if ($DryRun) { 'DRY RUN (simulation)' } else { 'PRODUCTION' })" -ForegroundColor Yellow

$generated = 0
$errors = 0

foreach ($relativePath in $fileConfigs.Keys) {
    $fullPath = Join-Path $projectRoot $relativePath
    $config = $fileConfigs[$relativePath]
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($relativePath)
    
    Write-Host "`nTraitement: $relativePath" -ForegroundColor White
    
    try {
        # Vérifier si le fichier existe et est vide
        if (Test-Path $fullPath) {
            $content = Get-Content $fullPath -Raw -ErrorAction SilentlyContinue
            if (![string]::IsNullOrWhiteSpace($content)) {
                Write-Host "   Fichier non vide - ignoré" -ForegroundColor Yellow
                continue
            }
        }
        
        # Générer le contenu
        $newContent = Generate-AdvancedContent -config $config -fileName $fileName
        
        if ($DryRun) {
            Write-Host "   Contenu généré ($(($newContent -split "`n").Count) lignes)" -ForegroundColor Green
            Write-Host "   Fonction: $($config.functionName)" -ForegroundColor Cyan
            Write-Host "   Catégorie: $($config.category)" -ForegroundColor Cyan
        } else {
            # Créer le répertoire si nécessaire
            $directory = Split-Path $fullPath -Parent
            if (!(Test-Path $directory)) {
                New-Item -ItemType Directory -Path $directory -Force | Out-Null
            }
            
            # Écrire le fichier
            Set-Content -Path $fullPath -Value $newContent -Encoding UTF8
            Write-Host "   Fichier généré avec succès" -ForegroundColor Green
        }
        
        $generated++
        
    } catch {
        Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}

Write-Host "`n=== RÉSUMÉ ===" -ForegroundColor Cyan
Write-Host "Fichiers traités: $generated" -ForegroundColor Green
Write-Host "Erreurs: $errors" -ForegroundColor $(if ($errors -gt 0) { 'Red' } else { 'Green' })

if ($DryRun) {
    Write-Host "`nPour générer réellement les fichiers, exécutez:" -ForegroundColor Yellow
    Write-Host "   .\generate-remaining-cs.ps1" -ForegroundColor White
} else {
    Write-Host "`nGénération terminée!" -ForegroundColor Green
}