Write-Host "Building frontend..." -ForegroundColor Cyan
Set-Location Frontend
npm run build

Write-Host "Removing old public folder..." -ForegroundColor Cyan
Set-Location ..
if (Test-Path "Backend\src\public") {
    Remove-Item -Recurse -Force "Backend\src\public"
}

Write-Host "Copying new build..." -ForegroundColor Cyan
Copy-Item -Recurse "Frontend\dist" "Backend\src\public"

Write-Host "Done! Frontend updated in Backend/src/public" -ForegroundColor Green