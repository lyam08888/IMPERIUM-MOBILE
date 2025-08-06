# Script pour intégrer le système de liaison boutons-fonctions dans tous les fichiers HTML
param(
    [switch]$DryRun = $false
)

$projectRoot = "c:\Users\T.LAMARA\IMPERIUM"
$linkerScript = "link-buttons-to-functions.js"

# Trouver tous les fichiers HTML
$htmlFiles = Get-ChildItem -Path $projectRoot -Filter "*.html" -Recurse

Write-Host "Intégration du système de liaison boutons-fonctions" -ForegroundColor Cyan
Write-Host "Mode: $(if ($DryRun) { 'DRY RUN (simulation)' } else { 'PRODUCTION' })" -ForegroundColor Yellow
Write-Host "Fichiers HTML trouvés: $($htmlFiles.Count)" -ForegroundColor White

$processed = 0
$errors = 0

foreach ($htmlFile in $htmlFiles) {
    $relativePath = $htmlFile.FullName.Replace($projectRoot, "").TrimStart('\')
    Write-Host "`nTraitement: $relativePath" -ForegroundColor White
    
    try {
        # Lire le contenu du fichier
        $content = Get-Content $htmlFile.FullName -Raw -Encoding UTF8
        
        # Vérifier si le script est déjà inclus
        if ($content -match "link-buttons-to-functions\.js") {
            Write-Host "   Script déjà inclus - ignoré" -ForegroundColor Yellow
            continue
        }
        
        # Calculer le chemin relatif vers le script
        $depth = ($relativePath -split '\\').Count - 1
        $relativePath = "../" * $depth + $linkerScript
        
        # Trouver où insérer le script (avant la fermeture de </body> ou </html>)
        $scriptTag = "`n    <script src=`"$relativePath`"></script>"
        
        if ($content -match "</body>") {
            $newContent = $content -replace "</body>", "$scriptTag`n</body>"
        } elseif ($content -match "</html>") {
            $newContent = $content -replace "</html>", "$scriptTag`n</html>"
        } else {
            # Ajouter à la fin du fichier
            $newContent = $content + $scriptTag
        }
        
        if ($DryRun) {
            Write-Host "   Script serait ajouté avec le chemin: $relativePath" -ForegroundColor Green
        } else {
            # Écrire le fichier modifié
            Set-Content -Path $htmlFile.FullName -Value $newContent -Encoding UTF8
            Write-Host "   Script ajouté avec succès" -ForegroundColor Green
        }
        
        $processed++
        
    } catch {
        Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}

Write-Host "`n=== RÉSUMÉ ===" -ForegroundColor Cyan
Write-Host "Fichiers traités: $processed" -ForegroundColor Green
Write-Host "Erreurs: $errors" -ForegroundColor $(if ($errors -gt 0) { 'Red' } else { 'Green' })

if ($DryRun) {
    Write-Host "`nPour intégrer réellement le script, exécutez:" -ForegroundColor Yellow
    Write-Host "   .\integrate-button-linker.ps1" -ForegroundColor White
} else {
    Write-Host "`nIntégration terminée!" -ForegroundColor Green
    Write-Host "Le système de liaison boutons-fonctions est maintenant actif sur toutes les pages." -ForegroundColor Green
}