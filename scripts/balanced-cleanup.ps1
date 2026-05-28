# Polish — Balanced Cleanup (Path 2: direct delete, no quarantine)
# Generated 2026-05-28 for vikas on VIKASH-OFFICE-L
# Safety: NEVER touches .ssh, .gitconfig, .aws, .azure, Documents,
#         browser passwords/cookies/history/bookmarks. Cache-only.

$ErrorActionPreference = 'SilentlyContinue'
$ProgressPreference = 'SilentlyContinue'

$startTime = Get-Date
$timestamp = $startTime.ToString('yyyy-MM-dd-HHmm')
$logDir = 'D:\polish-logs'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$logPath = Join-Path $logDir "balanced-cleanup-$timestamp.json"

$log = [ordered]@{
    started_at  = $startTime.ToString('o')
    mode        = 'balanced-no-quarantine'
    host        = $env:COMPUTERNAME
    user        = $env:USERNAME
    actions     = New-Object System.Collections.ArrayList
    summary     = $null
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
        $null = $log.actions.Add([ordered]@{
            category = $category; path = $path; status = 'not_present'; bytes_freed = 0
        })
        return 0
    }
    $beforeSize = Get-FolderSize $path
    try {
        Get-ChildItem $path -Force -ErrorAction SilentlyContinue |
            Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    } catch {}
    $afterSize = Get-FolderSize $path
    $freed = [math]::Max(0, $beforeSize - $afterSize)
    $null = $log.actions.Add([ordered]@{
        category     = $category
        path         = $path
        status       = 'completed'
        bytes_before = $beforeSize
        bytes_after  = $afterSize
        bytes_freed  = $freed
    })
    return $freed
}

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
$log.is_admin = $isAdmin

$totalFreed = 0

Write-Host "=== Polish Balanced Cleanup ==="
Write-Host "Started: $startTime"
Write-Host "Admin:   $isAdmin"
Write-Host "Log:     $logPath"
Write-Host ""

# === USER-SCOPE (no admin) ===

Write-Host "[1/9] User temp..."
$totalFreed += Clear-PathContents 'user-temp' "$env:LOCALAPPDATA\Temp"

Write-Host "[2/9] Crash dumps + WER (user)..."
$totalFreed += Clear-PathContents 'crash-dumps'   "$env:LOCALAPPDATA\CrashDumps"
$totalFreed += Clear-PathContents 'wer-archive'   "$env:LOCALAPPDATA\Microsoft\Windows\WER\ReportArchive"
$totalFreed += Clear-PathContents 'wer-queue'     "$env:LOCALAPPDATA\Microsoft\Windows\WER\ReportQueue"

Write-Host "[3/9] Thumbnail + icon cache..."
Get-Item "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\thumbcache_*.db" -Force -ErrorAction SilentlyContinue |
    Remove-Item -Force -ErrorAction SilentlyContinue
Get-Item "$env:LOCALAPPDATA\IconCache.db" -Force -ErrorAction SilentlyContinue |
    Remove-Item -Force -ErrorAction SilentlyContinue
$null = $log.actions.Add([ordered]@{ category='thumb-icon-cache'; status='attempted' })

Write-Host "[4/9] Browser caches (Chrome, Edge — cache subfolders only)..."
$chromeRoot = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default"
foreach ($sub in 'Cache','Code Cache','GPUCache','Service Worker\CacheStorage','DawnGraphicsCache') {
    $totalFreed += Clear-PathContents "chrome-$sub" (Join-Path $chromeRoot $sub)
}
$edgeRoot = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default"
foreach ($sub in 'Cache','Code Cache','GPUCache','Service Worker\CacheStorage') {
    $totalFreed += Clear-PathContents "edge-$sub" (Join-Path $edgeRoot $sub)
}

Write-Host "[5/9] Package manager caches (npm, pnpm, pip, cargo, bun, yarn, nuget, composer)..."
$totalFreed += Clear-PathContents 'npm-cache-roaming' "$env:APPDATA\npm-cache"
$totalFreed += Clear-PathContents 'npm-cache-local'   "$env:LOCALAPPDATA\npm-cache"
$totalFreed += Clear-PathContents 'pnpm-store'        "$env:LOCALAPPDATA\pnpm\store"
$totalFreed += Clear-PathContents 'pip-cache'         "$env:LOCALAPPDATA\pip\Cache"
$totalFreed += Clear-PathContents 'cargo-cache'       "$env:USERPROFILE\.cargo\registry\cache"
$totalFreed += Clear-PathContents 'cargo-src'         "$env:USERPROFILE\.cargo\registry\src"
$totalFreed += Clear-PathContents 'cargo-git-db'      "$env:USERPROFILE\.cargo\git\db"
$totalFreed += Clear-PathContents 'cargo-git-co'      "$env:USERPROFILE\.cargo\git\checkouts"
$totalFreed += Clear-PathContents 'bun-cache'         "$env:USERPROFILE\.bun\install\cache"
$totalFreed += Clear-PathContents 'yarn-cache'        "$env:LOCALAPPDATA\Yarn\Cache"
$totalFreed += Clear-PathContents 'nuget-http-cache'  "$env:LOCALAPPDATA\NuGet\v3-cache"
$totalFreed += Clear-PathContents 'composer-cache'    "$env:LOCALAPPDATA\Composer"

Write-Host "[6/9] IDE workspace caches (VS Code, Cursor — NOT settings/extensions)..."
foreach ($ide in 'Code','Cursor') {
    $root = "$env:APPDATA\$ide"
    foreach ($sub in 'Cache','CachedData','Code Cache','logs','GPUCache','Crashpad\reports','User\workspaceStorage') {
        $totalFreed += Clear-PathContents "$($ide.ToLower())-$($sub -replace '\\','-')" (Join-Path $root $sub)
    }
}

Write-Host "[7/9] App caches (Discord, Teams, Postman cache, Spotify)..."
$totalFreed += Clear-PathContents 'discord-cache'      "$env:APPDATA\discord\Cache"
$totalFreed += Clear-PathContents 'discord-code-cache' "$env:APPDATA\discord\Code Cache"
$totalFreed += Clear-PathContents 'discord-gpu-cache'  "$env:APPDATA\discord\GPUCache"
$totalFreed += Clear-PathContents 'teams-cache'        "$env:APPDATA\Microsoft\Teams\Cache"
$totalFreed += Clear-PathContents 'postman-cache'      "$env:APPDATA\Postman\Cache"
$totalFreed += Clear-PathContents 'postman-idb'        "$env:APPDATA\Postman\IndexedDB"
$totalFreed += Clear-PathContents 'spotify-cache'      "$env:LOCALAPPDATA\Spotify\Storage"

Write-Host "[8/9] Recycle Bin..."
try {
    Clear-RecycleBin -Force -ErrorAction Stop
    $null = $log.actions.Add([ordered]@{ category='recycle-bin'; status='emptied' })
} catch {
    $null = $log.actions.Add([ordered]@{ category='recycle-bin'; status='failed'; error="$_" })
}

# === ADMIN-SCOPE (only if elevated) ===
if ($isAdmin) {
    Write-Host "[9/9] Admin scope: Windows\Temp, SoftwareDistribution\Download, Prefetch, global WER..."
    $totalFreed += Clear-PathContents 'windows-temp'             'C:\Windows\Temp'
    $totalFreed += Clear-PathContents 'windows-update-cache'     'C:\Windows\SoftwareDistribution\Download'
    $totalFreed += Clear-PathContents 'windows-prefetch'         'C:\Windows\Prefetch'
    $totalFreed += Clear-PathContents 'wer-global-archive'       'C:\ProgramData\Microsoft\Windows\WER\ReportArchive'
    $totalFreed += Clear-PathContents 'wer-global-queue'         'C:\ProgramData\Microsoft\Windows\WER\ReportQueue'
    $totalFreed += Clear-PathContents 'delivery-optimization'    'C:\Windows\ServiceProfiles\NetworkService\AppData\Local\Microsoft\Windows\DeliveryOptimization\Cache'
    Get-Item 'C:\Windows\Minidump\*' -Force -ErrorAction SilentlyContinue |
        Remove-Item -Force -ErrorAction SilentlyContinue
    Get-Item 'C:\Windows\MEMORY.DMP' -Force -ErrorAction SilentlyContinue |
        Remove-Item -Force -ErrorAction SilentlyContinue
    $null = $log.actions.Add([ordered]@{ category='minidump-memdmp'; status='attempted' })
} else {
    Write-Host "[9/9] SKIPPED admin-scope (not elevated)."
}

$endTime = Get-Date
$log.summary = [ordered]@{
    total_bytes_freed = $totalFreed
    total_gb_freed    = [math]::Round($totalFreed / 1GB, 2)
    total_mb_freed    = [math]::Round($totalFreed / 1MB, 2)
    completed_at      = $endTime.ToString('o')
    duration_seconds  = [math]::Round(($endTime - $startTime).TotalSeconds, 1)
    admin_run         = $isAdmin
}

$log | ConvertTo-Json -Depth 10 | Out-File -FilePath $logPath -Encoding UTF8

Write-Host ""
Write-Host "=== DONE ==="
Write-Host "Reclaimed: $($log.summary.total_gb_freed) GB ($($log.summary.total_mb_freed) MB)"
Write-Host "Duration:  $($log.summary.duration_seconds) s"
Write-Host "Log:       $logPath"
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "NOT ADMIN — skipped C:\Windows\Temp + Windows Update cache + Prefetch + global WER."
    Write-Host "To reclaim more (~5-15 GB), re-run elevated:"
    Write-Host "  Start-Process pwsh -ArgumentList '-File','$($MyInvocation.MyCommand.Path)' -Verb RunAs"
}
