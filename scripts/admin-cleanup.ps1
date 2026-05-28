# Polish — Admin Cleanup (elevated, Path 2 continuation)
# Items: Windows\Temp, SoftwareDistribution\Download, Prefetch, global WER,
#        minidumps, MEMORY.DMP, hibernation off, DISM ResetBase

$ErrorActionPreference = 'SilentlyContinue'
$ProgressPreference = 'SilentlyContinue'

$startTime = Get-Date
$timestamp = $startTime.ToString('yyyy-MM-dd-HHmm')
$logPath = "D:\polish-logs\admin-cleanup-$timestamp.json"

New-Item -ItemType Directory -Path 'D:\polish-logs' -Force | Out-Null

$log = [ordered]@{
    started_at = $startTime.ToString('o')
    actions    = New-Object System.Collections.ArrayList
    summary    = $null
}

function Get-FolderSize([string]$path) {
    if (-not (Test-Path $path)) { return 0 }
    try {
        $sum = (Get-ChildItem $path -Recurse -File -Force -ErrorAction SilentlyContinue |
                Measure-Object Length -Sum -ErrorAction SilentlyContinue).Sum
        if ($null -eq $sum) { 0 } else { $sum }
    } catch { 0 }
}

function Clear-PathContents([string]$category, [string]$path) {
    if (-not (Test-Path $path)) {
        $null = $log.actions.Add([ordered]@{ category=$category; path=$path; status='not_present'; bytes_freed=0 })
        return 0
    }
    $before = Get-FolderSize $path
    try {
        Get-ChildItem $path -Force -ErrorAction SilentlyContinue |
            Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    } catch {}
    $after = Get-FolderSize $path
    $freed = [math]::Max(0, $before - $after)
    $null = $log.actions.Add([ordered]@{
        category=$category; path=$path; status='completed'
        bytes_before=$before; bytes_after=$after; bytes_freed=$freed
    })
    return $freed
}

# Confirm elevated
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: not elevated. Run via Start-Process -Verb RunAs." -ForegroundColor Red
    "{`"error`": `"not_admin`"}" | Out-File -FilePath $logPath -Encoding UTF8
    exit 1
}

$totalFreed = 0

Write-Host "=== Polish Admin Cleanup ===" -ForegroundColor Cyan
Write-Host "Started: $startTime"
Write-Host ""

Write-Host "[1/4] System temp + Windows Update cache + Prefetch + global WER..." -ForegroundColor Yellow
$totalFreed += Clear-PathContents 'windows-temp'             'C:\Windows\Temp'
$totalFreed += Clear-PathContents 'windows-update-cache'     'C:\Windows\SoftwareDistribution\Download'
$totalFreed += Clear-PathContents 'windows-prefetch'         'C:\Windows\Prefetch'
$totalFreed += Clear-PathContents 'wer-global-archive'       'C:\ProgramData\Microsoft\Windows\WER\ReportArchive'
$totalFreed += Clear-PathContents 'wer-global-queue'         'C:\ProgramData\Microsoft\Windows\WER\ReportQueue'
$totalFreed += Clear-PathContents 'delivery-optimization'    'C:\Windows\ServiceProfiles\NetworkService\AppData\Local\Microsoft\Windows\DeliveryOptimization\Cache'
$beforeDumps = (Get-FolderSize 'C:\Windows\Minidump') + (if (Test-Path 'C:\Windows\MEMORY.DMP') { (Get-Item 'C:\Windows\MEMORY.DMP' -Force).Length } else { 0 })
Get-Item 'C:\Windows\Minidump\*' -Force -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
Get-Item 'C:\Windows\MEMORY.DMP' -Force -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
$totalFreed += $beforeDumps
$null = $log.actions.Add([ordered]@{ category='minidump+memdmp'; bytes_freed=$beforeDumps; status='completed' })

Write-Host "[2/4] Disabling hibernation (frees hiberfil.sys, disables Fast Boot)..." -ForegroundColor Yellow
$hibBefore = if (Test-Path 'C:\hiberfil.sys') { (Get-Item 'C:\hiberfil.sys' -Force).Length } else { 0 }
powercfg /h off
$hibAfter = if (Test-Path 'C:\hiberfil.sys') { (Get-Item 'C:\hiberfil.sys' -Force).Length } else { 0 }
$hibFreed = [math]::Max(0, $hibBefore - $hibAfter)
$totalFreed += $hibFreed
$null = $log.actions.Add([ordered]@{ category='hibernation-off'; bytes_freed=$hibFreed; status='completed'; reversible='powercfg /h on' })

Write-Host "[3/4] DISM /StartComponentCleanup /ResetBase (irreversible, may take 5-20 min)..." -ForegroundColor Yellow
$cFreeBeforeDism = (Get-PSDrive C).Free
$dismOutput = DISM.exe /Online /Cleanup-Image /StartComponentCleanup /ResetBase 2>&1 | Out-String
$cFreeAfterDism = (Get-PSDrive C).Free
$dismFreed = [math]::Max(0, $cFreeAfterDism - $cFreeBeforeDism)
$totalFreed += $dismFreed
$null = $log.actions.Add([ordered]@{
    category='dism-resetbase'; bytes_freed=$dismFreed; status='completed'
    irreversible=$true
    last_line=($dismOutput -split "`n" | Select-Object -Last 5 | Out-String).Trim()
})

Write-Host "[4/4] Final disk check..." -ForegroundColor Yellow
$cFinal = (Get-PSDrive C).Free

$endTime = Get-Date
$log.summary = [ordered]@{
    total_bytes_freed = $totalFreed
    total_gb_freed    = [math]::Round($totalFreed / 1GB, 2)
    c_drive_free_gb   = [math]::Round($cFinal / 1GB, 2)
    completed_at      = $endTime.ToString('o')
    duration_seconds  = [math]::Round(($endTime - $startTime).TotalSeconds, 1)
}

$log | ConvertTo-Json -Depth 10 | Out-File -FilePath $logPath -Encoding UTF8

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "Reclaimed: $($log.summary.total_gb_freed) GB"
Write-Host "C: free now: $($log.summary.c_drive_free_gb) GB"
Write-Host "Duration: $($log.summary.duration_seconds) s"
Write-Host "Log: $logPath"
Start-Sleep -Seconds 5
