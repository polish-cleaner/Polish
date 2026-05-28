# Polish — Admin Cleanup Pass 2 (elevated)
# Items: Uninstall VS Community 2026 Insiders, compact Docker WSL2 VHDX
# Safety: VS Stable preserved. Docker IMAGES/VOLUMES preserved (compact only frees deleted blocks).

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

$startTime = Get-Date
$timestamp = $startTime.ToString('yyyy-MM-dd-HHmm')
$logPath = "D:\polish-logs\admin-cleanup-pass2-$timestamp.json"

New-Item -ItemType Directory -Path 'D:\polish-logs' -Force | Out-Null

$log = [ordered]@{
    started_at = $startTime.ToString('o')
    actions    = New-Object System.Collections.ArrayList
    summary    = $null
}

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    "{`"error`": `"not_admin`"}" | Out-File -FilePath $logPath -Encoding UTF8
    exit 1
}

$cFreeStart = (Get-PSDrive C).Free
Write-Host "=== Polish Admin Cleanup Pass 2 ===" -ForegroundColor Cyan
Write-Host "Started: $startTime"
Write-Host "C: free at start: $([math]::Round($cFreeStart/1GB,2)) GB"
Write-Host ""

# === Step 1: Uninstall VS Community 2026 Insiders ===
Write-Host "[1/2] Uninstalling VS Community 2026 Insiders (may take 5-15 min)..." -ForegroundColor Yellow
$vsBefore = (Get-PSDrive C).Free
$vsResult = $null
try {
    $vsResult = & winget uninstall --id Microsoft.VisualStudio.Community.Insiders -e --silent --disable-interactivity --accept-source-agreements 2>&1 | Out-String
    Write-Host $vsResult
} catch {
    Write-Host "winget call failed: $_" -ForegroundColor Red
    $vsResult = "ERROR: $_"
}
$vsAfter = (Get-PSDrive C).Free
$vsFreed = [math]::Max(0, $vsAfter - $vsBefore)
$null = $log.actions.Add([ordered]@{
    category    = 'vs-insiders-uninstall'
    bytes_freed = $vsFreed
    status      = 'completed'
    output_tail = ($vsResult -split "`n" | Select-Object -Last 10 | Out-String).Trim()
})
Write-Host "VS Insiders freed: $([math]::Round($vsFreed/1GB,2)) GB" -ForegroundColor Green

# === Step 2: Compact Docker WSL2 VHDX ===
Write-Host ""
Write-Host "[2/2] Compacting Docker WSL2 VHDX (preserves data, shrinks file)..." -ForegroundColor Yellow

$vhdx = "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx"
if (-not (Test-Path $vhdx)) {
    Write-Host "VHDX not found, skipping." -ForegroundColor Yellow
    $null = $log.actions.Add([ordered]@{ category='docker-vhdx-compact'; status='not_present' })
} else {
    $vhdxBefore = (Get-Item $vhdx -Force).Length

    # Stop Docker Desktop if running
    Get-Process 'Docker Desktop','com.docker.backend','docker','dockerd' -ErrorAction SilentlyContinue |
        Stop-Process -Force -ErrorAction SilentlyContinue

    # Stop Docker service if running
    Stop-Service com.docker.service -Force -ErrorAction SilentlyContinue

    # Shutdown all WSL distros (closes VHDX handles)
    Write-Host "  wsl --shutdown..."
    wsl --shutdown 2>&1 | Out-Null
    Start-Sleep -Seconds 5

    # Build diskpart script
    $diskpartScript = @"
select vdisk file="$vhdx"
attach vdisk readonly
compact vdisk
detach vdisk
exit
"@
    $diskpartFile = "$env:TEMP\polish-compact-docker.dsk"
    $diskpartScript | Out-File -FilePath $diskpartFile -Encoding ASCII

    Write-Host "  Running diskpart compact (may take 5-10 min)..."
    $dpOut = & diskpart /s $diskpartFile 2>&1 | Out-String
    Remove-Item $diskpartFile -Force -ErrorAction SilentlyContinue

    $vhdxAfter = if (Test-Path $vhdx) { (Get-Item $vhdx -Force).Length } else { 0 }
    $vhdxFreed = [math]::Max(0, $vhdxBefore - $vhdxAfter)

    $null = $log.actions.Add([ordered]@{
        category     = 'docker-vhdx-compact'
        path         = $vhdx
        bytes_before = $vhdxBefore
        bytes_after  = $vhdxAfter
        bytes_freed  = $vhdxFreed
        status       = 'completed'
        diskpart_out = ($dpOut -split "`n" | Select-Object -Last 15 | Out-String).Trim()
    })
    Write-Host "VHDX compacted: $([math]::Round($vhdxBefore/1GB,2)) GB -> $([math]::Round($vhdxAfter/1GB,2)) GB ($([math]::Round($vhdxFreed/1GB,2)) GB freed)" -ForegroundColor Green
}

# === Done ===
$endTime = Get-Date
$cFreeEnd = (Get-PSDrive C).Free
$totalFreed = [math]::Max(0, $cFreeEnd - $cFreeStart)

$log.summary = [ordered]@{
    c_free_before_gb  = [math]::Round($cFreeStart/1GB, 2)
    c_free_after_gb   = [math]::Round($cFreeEnd/1GB, 2)
    total_gb_freed    = [math]::Round($totalFreed/1GB, 2)
    completed_at      = $endTime.ToString('o')
    duration_seconds  = [math]::Round(($endTime - $startTime).TotalSeconds, 1)
}

$log | ConvertTo-Json -Depth 10 | Out-File -FilePath $logPath -Encoding UTF8

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "C: $([math]::Round($cFreeStart/1GB,2)) GB -> $([math]::Round($cFreeEnd/1GB,2)) GB (freed $([math]::Round($totalFreed/1GB,2)) GB)"
Write-Host "Duration: $($log.summary.duration_seconds) s"
Write-Host "Log: $logPath"
Start-Sleep -Seconds 8
