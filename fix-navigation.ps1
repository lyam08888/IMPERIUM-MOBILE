# Script pour corriger la navigation dans tous les fichiers HTML
Write-Host "Correction de la navigation dans les fichiers HTML..." -ForegroundColor Yellow

# Liste des fichiers HTML à corriger
$filesToFix = @(
    "Navigation\Developpement\Commerce.html",
    "Navigation\Militaire\Legions.html", 
    "Navigation\Militaire\Flotte.html",
    "Navigation\Militaire\Simulateur.html",
    "Navigation\Social\Alliance.html",
    "Navigation\Social\Diplomatie.html", 
    "Navigation\Social\Messsages.html",
    "Navigation\Premium\Premium.html"
)

foreach ($file in $filesToFix) {
    $fullPath = "c:\Users\Montoya\IMPERIUM\$file"
    
    if (Test-Path $fullPath) {
        Write-Host "Correction de $file..." -ForegroundColor Cyan
        
        # Lire le contenu du fichier
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        
        # Ajouter l'inclusion du script common-navigation.js si elle n'existe pas
        if ($content -notmatch "common-navigation\.js") {
            $iconLine = '<link rel="icon"'
            if ($content -match $iconLine) {
                $lines = $content -split "`n"
                for ($i = 0; $i -lt $lines.Length; $i++) {
                    if ($lines[$i] -match $iconLine) {
                        # Insérer après la ligne icon
                        $lines = $lines[0..$i] + "    " + "    <!-- Scripts de navigation communs -->" + "    <script src=`"../common-navigation.js`"></script>" + $lines[($i+1)..($lines.Length-1)]
                        break
                    }
                }
                $content = $lines -join "`n"
                Write-Host "  Script common-navigation.js ajouté" -ForegroundColor Green
            }
        }
        
        # Sauvegarder le fichier modifié
        $content | Out-File $fullPath -Encoding UTF8 -NoNewline
        Write-Host "  Fichier sauvegardé" -ForegroundColor Green
    }
}

Write-Host "Correction terminée!" -ForegroundColor Green