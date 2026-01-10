# Keep-Alive Service for Finance Blog (PowerShell)
# Pings the server every 5 minutes to keep it awake
# Run this in PowerShell to keep your site always responsive

param(
    [string]$URL = "http://localhost:5000/api/health",
    [int]$IntervalSeconds = 300  # 5 minutes
)

Write-Host ""
Write-Host "============================================================"
Write-Host "  🔄 Website Keep-Alive Service Started"
Write-Host "============================================================"
Write-Host "  URL: $URL"
Write-Host "  Interval: $IntervalSeconds seconds ($(($IntervalSeconds / 60)) minutes)"
Write-Host "  Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "============================================================"
Write-Host ""

$pingCount = 0
$successCount = 0
$failureCount = 0

while ($true) {
    try {
        $response = Invoke-WebRequest -Uri $URL -TimeoutSec 10 -ErrorAction Stop
        $successCount++
        $pingCount++
        
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ✅ Ping #$pingCount successful - Status: $($response.StatusCode)"
        
    } catch {
        $failureCount++
        $pingCount++
        
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ❌ Ping #$pingCount failed - Error: $($_.Exception.Message)"
    }
    
    # Display summary every 12 pings (1 hour)
    if ($pingCount % 12 -eq 0) {
        Write-Host ""
        Write-Host "📊 Summary - Total Pings: $pingCount | Success: $successCount | Failed: $failureCount"
        Write-Host ""
    }
    
    # Wait for the specified interval
    Start-Sleep -Seconds $IntervalSeconds
}
