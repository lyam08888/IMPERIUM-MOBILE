# Script pour générer automatiquement tous les fichiers .cs vides
param(
    [switch]$DryRun = $false
)

$projectRoot = "c:\Users\T.LAMARA\IMPERIUM"

# Mapping des fichiers vers leurs configurations
$fileConfigs = @{
    # Messages
    "Navigation\Social\Messages\Nouveau message.cs" = @{
        category = "Messages"
        name = "Nouveau message"
        functionName = "creerNouveauMessage"
        description = "Création d'un nouveau message"
        icon = "✉️"
        actions = @("ouvrir interface", "valider destinataire", "envoyer message")
    }
    
    "Navigation\Social\Messages\Actualiser.cs" = @{
        category = "Messages"
        name = "Actualiser"
        functionName = "actualiserMessages"
        description = "Actualisation de la liste des messages"
        icon = "🔄"
        actions = @("recharger messages", "mettre à jour interface", "vérifier nouveaux messages")
    }
    
    "Navigation\Social\Messages\Supprimer.cs" = @{
        category = "Messages"
        name = "Supprimer"
        functionName = "supprimerMessage"
        description = "Suppression d'un message"
        icon = "🗑️"
        actions = @("confirmer suppression", "supprimer message", "actualiser liste")
        parameters = "messageId"
    }
    
    "Navigation\Social\Messages\Tout marquer lu.cs" = @{
        category = "Messages"
        name = "Tout marquer lu"
        functionName = "marquerTousLus"
        description = "Marquer tous les messages comme lus"
        icon = "✅"
        actions = @("marquer tous lus", "actualiser compteurs", "sauvegarder état")
    }
    
    # Commerce
    "Navigation\Developpement\Commerce\Evolution des prix.cs" = @{
        category = "Commerce"
        name = "Evolution des prix"
        functionName = "afficherEvolutionPrix"
        description = "Affichage de l'évolution des prix du marché"
        icon = "📈"
        actions = @("charger données prix", "générer graphiques", "afficher tendances")
    }
    
    "Navigation\Developpement\Commerce\Ordre du marché.cs" = @{
        category = "Commerce"
        name = "Ordre du marché"
        functionName = "gererOrdreMarche"
        description = "Gestion des ordres de marché"
        icon = "📋"
        actions = @("afficher ordres actifs", "permettre annulation", "actualiser statuts")
    }
    
    "Navigation\Developpement\Commerce\Placer l'ordre d'achat.cs" = @{
        category = "Commerce"
        name = "Placer l'ordre d'achat"
        functionName = "placerOrdreAchat"
        description = "Placement d'un ordre d'achat"
        icon = "💰"
        actions = @("valider ressources", "créer ordre achat", "actualiser marché")
        parameters = "ressource, quantite, prix"
    }
    
    "Navigation\Developpement\Commerce\Placer l'ordre de vente.cs" = @{
        category = "Commerce"
        name = "Placer l'ordre de vente"
        functionName = "placerOrdreVente"
        description = "Placement d'un ordre de vente"
        icon = "💸"
        actions = @("vérifier stock", "créer ordre vente", "actualiser marché")
        parameters = "ressource, quantite, prix"
    }
    
    # Empire - Province
    "Navigation\Empire\Province\Attaquer.cs" = @{
        category = "Militaire"
        name = "Attaquer"
        functionName = "attaquerProvince"
        description = "Attaque d'une province"
        icon = "⚔️"
        actions = @("planifier attaque", "déployer troupes", "lancer bataille")
        parameters = "provinceId"
    }
    
    "Navigation\Empire\Province\Détails.cs" = @{
        category = "Empire"
        name = "Détails"
        functionName = "afficherDetailsProvince"
        description = "Affichage des détails d'une province"
        icon = "📊"
        actions = @("charger informations", "afficher statistiques", "montrer ressources")
        parameters = "provinceId"
    }
    
    "Navigation\Empire\Province\Gérer.cs" = @{
        category = "Empire"
        name = "Gérer"
        functionName = "gererProvince"
        description = "Gestion d'une province"
        icon = "🏛️"
        actions = @("administrer province", "gérer population", "optimiser production")
        parameters = "provinceId"
    }
}

# Fonction pour générer le contenu d'un fichier
function Generate-FileContent {
    param(
        [hashtable]$config
    )
    
    $parameters = if ($config.parameters) { $config.parameters } else { "" }
    $actionsJs = ($config.actions | ForEach-Object { "'$_'" }) -join ", "
    
    $content = @"
/**
 * 🏛️ IMPERIUM - $($config.description)
 * Transformé de C# vers JavaScript pour intégration complète
 */

// Fonction principale pour $($config.description.ToLower())
function $($config.functionName)($parameters) {
    try {
        console.log('$($config.icon) $($config.description) - Début');
        
        // Vérifications préliminaires
        if (!window.gameEngine) {
            console.error('❌ Moteur de jeu non initialisé');
            showNotification('Erreur: Moteur de jeu non disponible', 'error');
            return false;
        }

        const gameState = gameEngine.getGameState();
        const player = gameState.player;

        // Vérifications spécifiques
        if (!verifierPrerequisFonction('$($config.functionName)', gameState)) {
            return false;
        }

"@

    # Ajouter les étapes d'action
    for ($i = 0; $i -lt $config.actions.Count; $i++) {
        $action = $config.actions[$i]
        $stepNum = $i + 1
        $cleanAction = $action -replace '[^a-zA-Z0-9]', ''
        
        $content += @"

        // Étape $stepNum : $action
        console.log('🔄 $action...');
        if (!etape$($stepNum)_$cleanAction()) {
            throw new Error('Échec lors de: $action');
        }
"@
    }

    $content += @"

        // Succès
        console.log('✅ $($config.description) - Terminé avec succès');
        showNotification('$($config.icon) $($config.description) réussie', 'success');
        
        // Sauvegarder l'état si nécessaire
        if (gameEngine.saveSystem) {
            gameEngine.saveSystem.sauvegarderJeu('autosave', '$($config.description)');
        }
        
        return true;

    } catch (error) {
        console.error('❌ Erreur lors de $($config.description.ToLower()):', error);
        showNotification(`Erreur: `${error.message}`, 'error');
        return false;
    }
}

// Fonction de vérification des prérequis
function verifierPrerequisFonction(functionName, gameState) {
"@

    # Ajouter les vérifications spécifiques selon la catégorie
    switch ($config.category) {
        "Messages" {
            $content += @"
    if (!gameState.messageSystem) {
        showNotification('❌ Système de messages non disponible', 'error');
        return false;
    }
"@
        }
        "Commerce" {
            $content += @"
    if (!gameState.marketSystem) {
        showNotification('❌ Système de marché non disponible', 'error');
        return false;
    }
"@
        }
        "Militaire" {
            $content += @"
    if (!gameState.military) {
        showNotification('❌ Système militaire non disponible', 'error');
        return false;
    }
"@
        }
        "Empire" {
            $content += @"
    if (!gameState.empire) {
        showNotification('❌ Système d'empire non disponible', 'error');
        return false;
    }
"@
        }
        default {
            $content += @"
    // Vérifications génériques
    if (!player) {
        showNotification('❌ Données joueur non disponibles', 'error');
        return false;
    }
"@
        }
    }

    $content += @"
    return true;
}

"@

    # Ajouter les fonctions helper
    for ($i = 0; $i -lt $config.actions.Count; $i++) {
        $action = $config.actions[$i]
        $stepNum = $i + 1
        $cleanAction = $action -replace '[^a-zA-Z0-9]', ''
        
        $content += @"
// Fonction helper pour: $action
function etape$($stepNum)_$cleanAction() {
    try {
        console.log('⚙️ Exécution: $action');
        
        // TODO: Implémenter $action
        // Simulation temporaire - remplacer par la vraie logique
        
        console.log('✅ $action - Terminé');
        return true;
        
    } catch (error) {
        console.error('❌ Erreur $action:', error);
        return false;
    }
}

"@
    }

    # Ajouter l'interface utilisateur
    $content += @"
// Fonction d'interface utilisateur
function creerInterface$($config.functionName.Substring(0,1).ToUpper() + $config.functionName.Substring(1))() {
    const container = document.createElement('div');
    container.className = '$($config.functionName.ToLower())-interface';
    
    container.innerHTML = ``
        <div class="action-panel">
            <h3>$($config.icon) $($config.description)</h3>
            <div class="action-content">
                <p>Interface pour $($config.description.ToLower())</p>
                <!-- TODO: Ajouter les éléments d'interface spécifiques -->
            </div>
            <div class="action-buttons">
                <button class="btn primary" onclick="$($config.functionName)()">
                    $($config.icon) Exécuter
                </button>
                <button class="btn secondary" onclick="fermerInterface()">
                    ❌ Annuler
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

console.log('📜 Module $($config.functionName) chargé');
"@

    return $content
}

# Traitement principal
Write-Host "🏗️ Génération des fichiers .cs pour IMPERIUM" -ForegroundColor Cyan
Write-Host "Mode: $(if ($DryRun) { 'DRY RUN (simulation)' } else { 'PRODUCTION' })" -ForegroundColor Yellow

$generated = 0
$errors = 0

foreach ($relativePath in $fileConfigs.Keys) {
    $fullPath = Join-Path $projectRoot $relativePath
    $config = $fileConfigs[$relativePath]
    
    Write-Host "`n📝 Traitement: $relativePath" -ForegroundColor White
    
    try {
        # Vérifier si le fichier existe et est vide
        if (Test-Path $fullPath) {
            $content = Get-Content $fullPath -Raw -ErrorAction SilentlyContinue
            if (![string]::IsNullOrWhiteSpace($content)) {
                Write-Host "   ⚠️ Fichier non vide - ignoré" -ForegroundColor Yellow
                continue
            }
        }
        
        # Générer le contenu
        $newContent = Generate-FileContent -config $config
        
        if ($DryRun) {
            Write-Host "   ✅ Contenu généré ($(($newContent -split "`n").Count) lignes)" -ForegroundColor Green
            Write-Host "   📋 Fonction: $($config.functionName)" -ForegroundColor Cyan
            Write-Host "   🎯 Actions: $($config.actions -join ', ')" -ForegroundColor Cyan
        } else {
            # Créer le répertoire si nécessaire
            $directory = Split-Path $fullPath -Parent
            if (!(Test-Path $directory)) {
                New-Item -ItemType Directory -Path $directory -Force | Out-Null
            }
            
            # Écrire le fichier
            Set-Content -Path $fullPath -Value $newContent -Encoding UTF8
            Write-Host "   ✅ Fichier généré avec succès" -ForegroundColor Green
        }
        
        $generated++
        
    } catch {
        Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}

Write-Host "`n=== RÉSUMÉ ===" -ForegroundColor Cyan
Write-Host "Fichiers traités: $generated" -ForegroundColor Green
Write-Host "Erreurs: $errors" -ForegroundColor $(if ($errors -gt 0) { 'Red' } else { 'Green' })

if ($DryRun) {
    Write-Host "`n💡 Pour générer réellement les fichiers, exécutez:" -ForegroundColor Yellow
    Write-Host "   .\generate-all-cs-files.ps1" -ForegroundColor White
} else {
    Write-Host "`n🎉 Génération terminée!" -ForegroundColor Green
}