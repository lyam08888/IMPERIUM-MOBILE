# Script pour analyser les fichiers .cs et identifier ceux qui sont vides
$projectRoot = "c:\Users\T.LAMARA\IMPERIUM"
$emptyFiles = @()
$nonEmptyFiles = @()

# Obtenir tous les fichiers .cs
$csFiles = Get-ChildItem -Path $projectRoot -Filter "*.cs" -Recurse

Write-Host "Analyse de $($csFiles.Count) fichiers .cs..." -ForegroundColor Yellow

foreach ($file in $csFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    
    if ([string]::IsNullOrWhiteSpace($content)) {
        $emptyFiles += $file
        Write-Host "VIDE: $($file.FullName)" -ForegroundColor Red
    } else {
        $nonEmptyFiles += $file
        Write-Host "CONTENU: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`n=== RÉSUMÉ ===" -ForegroundColor Cyan
Write-Host "Fichiers vides: $($emptyFiles.Count)" -ForegroundColor Red
Write-Host "Fichiers avec contenu: $($nonEmptyFiles.Count)" -ForegroundColor Green

Write-Host "`n=== FICHIERS VIDES À CONFIGURER ===" -ForegroundColor Yellow
foreach ($file in $emptyFiles) {
    $relativePath = $file.FullName.Replace($projectRoot, "").TrimStart('\')
    Write-Host "- $relativePath" -ForegroundColor Red
}