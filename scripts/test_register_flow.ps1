$dir = "C:\Users\Deniz\Desktop\Projeler\soruevimkpss"
Set-Location $dir

# Start dev server
$psi = New-object System.Diagnostics.ProcessStartInfo
$psi.FileName = "npm.cmd"
$psi.Arguments = "run dev"
$psi.WorkingDirectory = $dir
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true
$proc = [System.Diagnostics.Process]::Start($psi)

Start-Sleep -Seconds 20

try {
    # Get the kayit page and find action URL
    $html = Invoke-WebRequest -Uri "http://localhost:3000/kayit" -UseBasicParsing
    Write-Output "KAYIT PAGE: $($html.StatusCode)"

    if ($html.Content -match 'action="([^"]+)"') {
        $actionUrl = $matches[1]
        Write-Output "ACTION: $actionUrl"
        
        # Submit registration
        $uniqueEmail = "test-" + (Get-Date -Format "yyyyMMddHHmmss") + "@test.com"
        $body = @{name="Test User"; email=$uniqueEmail; password="Test12345"}
        
        try {
            $result = Invoke-WebRequest -Uri "http://localhost:3000$actionUrl" -Method POST -Body $body -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop
            Write-Output "REGISTER RESPONSE: $($result.StatusCode)"
            Write-Output "HEADERS: $($result.Headers | Out-String)"
        } catch {
            Write-Output "REGISTER ERROR: $($_.Exception.Message)"
            if ($_.Exception.Response) {
                Write-Output "STATUS: $($_.Exception.Response.StatusCode.value__)"
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                Write-Output "BODY: $($reader.ReadToEnd())"
                $reader.Close()
            }
        }
    }
} catch {
    Write-Output "FETCH ERROR: $($_.Exception.Message)"
}

# Read server output
Start-Sleep -Seconds 3
$proc.Kill()
$stdout = $proc.StandardOutput.ReadToEnd()
$stderr = $proc.StandardError.ReadToEnd()
Write-Output "=== STDOUT ==="
Write-Output $stdout
Write-Output "=== STDERR ==="
Write-Output $stderr
