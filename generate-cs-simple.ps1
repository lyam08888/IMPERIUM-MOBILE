# Script simplifié pour générer les fichiers .cs vides
param(
    [switch]$DryRun = $false
)

$projectRoot = "c:\Users\T.LAMARA\IMPERIUM"

# Liste des fichiers vides à traiter
$emptyFiles = @(
    "Navigation\Social\Messages\Nouveau message.cs",
    "Navigation\Social\Messages\Actualiser.cs", 
    "Navigation\Social\Messages\Supprimer.cs",
    "Navigation\Social\Messages\Tout marquer lu.cs",
    "Navigation\Developpement\Commerce\Evolution des prix.cs",
    "Navigation\Developpement\Commerce\Ordre du marché.cs",
    "Navigation\Developpement\Commerce\Placer l'ordre d'achat.cs",
    "Navigation\Developpement\Commerce\Placer l'ordre de vente.cs",
    "Navigation\Empire\Province\Attaquer.cs",
    "Navigation\Empire\Province\Détails.cs",
    "Navigation\Empire\Province\Gérer.cs",
    "Navigation\Social\Diplomatie\Foedus - Alliances Romaines\Description.cs",
    "Navigation\Social\Diplomatie\Foedus - Alliances Romaines\Nom de l'Alliance.cs"
)

# Fonction pour générer le contenu basique
function Generate-BasicContent {
    param(
        [string]$fileName,
        [string]$functionName,
        [string]$description
    )
    
    return @"
/**
 * IMPERIUM - $description
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Fonction principale pour $description
function $functionName() {
    try {
        console.log('$description - Début');
        
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

        // TODO: Implémenter la logique spécifique pour $description
        console.log('Exécution de: $description');
        
        // Simulation temporaire
        setTimeout(() => {
            console.log('$description - Terminé avec succès');
            showNotification('$description réussie', 'success');
            
            // Sauvegarder l'état si nécessaire
            if (gameEngine.saveSystem) {
                gameEngine.saveSystem.sauvegarderJeu('autosave', '$description');
            }
        }, 100);
        
        return true;

    } catch (error) {
        console.error('Erreur lors de ${description}:', error);
        showNotification('Erreur: ' + error.message, 'error');
        return false;
    }
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
    window.$functionName = $functionName;
}

console.log('Module $functionName chargé');
"@
}

# Fonction pour convertir le nom de fichier en nom de fonction
function Get-FunctionName {
    param([string]$fileName)
    
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
    
    # Mapping spécifique
    $mapping = @{
        "Nouveau message" = "creerNouveauMessage"
        "Actualiser" = "actualiserMessages"
        "Supprimer" = "supprimerMessage"
        "Tout marquer lu" = "marquerTousLus"
        "Evolution des prix" = "afficherEvolutionPrix"
        "Ordre du marché" = "gererOrdreMarche"
        "Placer l'ordre d'achat" = "placerOrdreAchat"
        "Placer l'ordre de vente" = "placerOrdreVente"
        "Attaquer" = "attaquerProvince"
        "Détails" = "afficherDetailsProvince"
        "Gérer" = "gererProvince"
        "Description" = "gererDescriptionAlliance"
        "Nom de l'Alliance" = "gererNomAlliance"
    }
    
    if ($mapping.ContainsKey($baseName)) {
        return $mapping[$baseName]
    }
    
    # Conversion générique
    $functionName = $baseName -replace '[^a-zA-Z0-9]', ''
    $functionName = $functionName.Substring(0,1).ToLower() + $functionName.Substring(1)
    return $functionName
}

# Traitement principal
Write-Host "Génération des fichiers .cs pour IMPERIUM" -ForegroundColor Cyan
Write-Host "Mode: $(if ($DryRun) { 'DRY RUN (simulation)' } else { 'PRODUCTION' })" -ForegroundColor Yellow

$generated = 0
$errors = 0

foreach ($relativePath in $emptyFiles) {
    $fullPath = Join-Path $projectRoot $relativePath
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($relativePath)
    $functionName = Get-FunctionName -fileName $fileName
    
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
        $newContent = Generate-BasicContent -fileName $fileName -functionName $functionName -description $fileName
        
        if ($DryRun) {
            Write-Host "   Contenu généré ($(($newContent -split "`n").Count) lignes)" -ForegroundColor Green
            Write-Host "   Fonction: $functionName" -ForegroundColor Cyan
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
    Write-Host "   .\generate-cs-simple.ps1" -ForegroundColor White
} else {
    Write-Host "`nGénération terminée!" -ForegroundColor Green
}