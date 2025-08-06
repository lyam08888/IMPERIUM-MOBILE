# Script pour mettre à jour les pages HTML vides avec le nouveau template

# Configuration des pages
$pages = @(
    @{
        Path = "Navigation\Empire\Monde.html"
        Title = "Carte du Monde"
        Icon = "WORLD"
        Subtitle = "Explorez les territoires et conquérez de nouvelles terres"
        Description = "Explorez le vaste monde romain et planifiez vos conquêtes"
    },
    @{
        Path = "Navigation\Empire\Province.html"
        Title = "Gestion des Provinces"
        Icon = "ISLAND"
        Subtitle = "Administrez vos territoires conquis"
        Description = "Gérez vos provinces et optimisez leur développement"
    },
    @{
        Path = "Navigation\Social\Alliance.html"
        Title = "Alliances Romaines"
        Icon = "SWORD"
        Subtitle = "Forgez des alliances stratégiques"
        Description = "Créez et gérez vos alliances militaires et politiques"
    },
    @{
        Path = "Navigation\Developpement\Academie.html"
        Title = "Académie Romaine"
        Icon = "BOOK"
        Subtitle = "Développez vos connaissances et technologies"
        Description = "Recherchez de nouvelles technologies et formez vos citoyens"
    },
    @{
        Path = "Navigation\Developpement\Commerce.html"
        Title = "Commerce et Économie"
        Icon = "SCALE"
        Subtitle = "Gérez votre économie et vos échanges commerciaux"
        Description = "Développez votre réseau commercial et votre économie"
    },
    @{
        Path = "Navigation\Militaire\Légions.html"
        Title = "Légions Romaines"
        Icon = "LEGION"
        Subtitle = "Commandez vos armées et menez vos campagnes"
        Description = "Gérez vos légions et planifiez vos stratégies militaires"
    },
    @{
        Path = "Navigation\Militaire\Flotte.html"
        Title = "Flotte Navale"
        Icon = "SHIP"
        Subtitle = "Dominez les mers avec votre flotte"
        Description = "Construisez et gérez votre flotte navale"
    },
    @{
        Path = "Navigation\Militaire\Simulateur.html"
        Title = "Simulateur de Bataille"
        Icon = "BATTLE"
        Subtitle = "Testez vos stratégies militaires"
        Description = "Simulez vos batailles avant de les livrer"
    },
    @{
        Path = "Navigation\Premium\Premium.html"
        Title = "Services Premium"
        Icon = "CROWN"
        Subtitle = "Accédez aux fonctionnalités exclusives"
        Description = "Découvrez les avantages premium d'IMPERIUM"
    }
)

# Mapping des icônes
$iconMap = @{
    "WORLD" = "🌍"
    "ISLAND" = "🏝️"
    "SWORD" = "⚔️"
    "BOOK" = "📚"
    "SCALE" = "⚖️"
    "LEGION" = "⚔️"
    "SHIP" = "⛵"
    "BATTLE" = "⚔️"
    "CROWN" = "👑"
}

# Lire le template de base
$templatePath = "Navigation\template-base.html"
if (-not (Test-Path $templatePath)) {
    Write-Error "Template de base non trouvé: $templatePath"
    exit 1
}

$template = Get-Content $templatePath -Raw -Encoding UTF8

Write-Host "Mise à jour des pages HTML avec le nouveau template..." -ForegroundColor Yellow
Write-Host ""

foreach ($page in $pages) {
    $fullPath = $page.Path
    
    Write-Host "Traitement de: $($page.Title)" -ForegroundColor Cyan
    
    # Vérifier si le fichier existe
    if (-not (Test-Path $fullPath)) {
        Write-Host "   Fichier non trouvé: $fullPath" -ForegroundColor Yellow
        continue
    }
    
    # Créer le contenu personnalisé
    $customContent = $template
    $customContent = $customContent -replace '\[PAGE_TITLE\]', $page.Title
    $customContent = $customContent -replace '\[PAGE_ICON\]', $iconMap[$page.Icon]
    $customContent = $customContent -replace '\[PAGE_SUBTITLE\]', $page.Subtitle
    $customContent = $customContent -replace '\[PAGE_DESCRIPTION\]', $page.Description
    
    # Ajuster les chemins relatifs selon la profondeur du dossier
    $depth = ($page.Path -split '\\').Count - 2
    $relativePath = "../" * $depth
    
    # Corriger les chemins des ressources
    $customContent = $customContent -replace 'href="../common-styles.css"', "href=`"$($relativePath)common-styles.css`""
    $customContent = $customContent -replace 'src="../common-navigation.js"', "src=`"$($relativePath)common-navigation.js`""
    $customContent = $customContent -replace 'src="../game-engine.js"', "src=`"$($relativePath)game-engine.js`""
    $customContent = $customContent -replace 'src="../advanced-game-systems.js"', "src=`"$($relativePath)advanced-game-systems.js`""
    $customContent = $customContent -replace 'src="../save-system.js"', "src=`"$($relativePath)save-system.js`""
    $customContent = $customContent -replace 'src="../ui-manager.js"', "src=`"$($relativePath)ui-manager.js`""
    $customContent = $customContent -replace 'src="../global-console.js"', "src=`"$($relativePath)global-console.js`""
    
    try {
        # Sauvegarder le fichier avec l'encodage UTF-8
        $customContent | Out-File -FilePath $fullPath -Encoding UTF8 -Force
        Write-Host "   Mis à jour avec succès" -ForegroundColor Green
    }
    catch {
        Write-Host "   Erreur lors de la mise à jour: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Mise à jour terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "Résumé des améliorations:" -ForegroundColor Yellow
Write-Host "   • Design moderne et responsive" -ForegroundColor White
Write-Host "   • Navigation fonctionnelle" -ForegroundColor White
Write-Host "   • Animations fluides" -ForegroundColor White
Write-Host "   • Thème romain cohérent" -ForegroundColor White
Write-Host "   • Optimisation mobile" -ForegroundColor White
Write-Host ""
Write-Host "Vos pages sont maintenant prêtes !" -ForegroundColor Green