# SafeRide Frontend Startup Script

Write-Host "Starting SafeRide Frontend..." -ForegroundColor Green

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the development server
Write-Host "Starting Vite dev server on http://localhost:3000" -ForegroundColor Cyan
npm run dev
