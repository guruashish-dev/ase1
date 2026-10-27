[CmdletBinding()]
param(
    [switch]$NoInstall,
    [switch]$NoLaunch,
    [switch]$NoPull,
    [switch]$Rebuild
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Write-Info([string]$Msg) { Write-Host "[aisoc] $Msg" -ForegroundColor Cyan }
function Write-Ok([string]$Msg)   { Write-Host "[aisoc] $Msg" -ForegroundColor Green }
function Write-Warn([string]$Msg)  { Write-Warning "[aisoc] $Msg" }
function Fail([string]$Msg, [int]$Code = 1) {
    Write-Host "[aisoc] $Msg" -ForegroundColor Red
    exit $Code
}

function Test-Command([string]$Name) {
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Ensure-NodeAndPnpm {
    if (-not (Test-Command node)) {
        Fail "node is not installed. Install Node.js 20+ and rerun this script." 1
    }

    $nodeMajor = (& node --version).Trim().TrimStart('v').Split('.')[0]
    if ([int]$nodeMajor -lt 20) {
        Fail "Node.js 20 or newer is required. Found $(& node --version)." 1
    }

    if (-not (Test-Command pnpm)) {
        Write-Info "Enabling pnpm via corepack..."
        & corepack enable | Out-Null
        & corepack prepare pnpm@8.15.1 --activate | Out-Null
    }

    if (-not (Test-Command pnpm)) {
        Fail "pnpm is still not available on PATH after corepack activation." 1
    }
}

function Ensure-Docker {
    if (-not (Test-Command docker)) {
        Fail "docker is not installed. Install Docker Desktop and rerun this script." 1
    }

    & docker version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Fail "Docker is installed but the daemon is not running. Start Docker Desktop and rerun." 2
    }
}

function Ensure-Workspace {
    if (-not (Test-Path '.env') -and (Test-Path '.env.example')) {
        Copy-Item '.env.example' '.env'
        Write-Ok "Created .env from .env.example"
    }

    Write-Info "Installing workspace dependencies..."
    & pnpm install
    if ($LASTEXITCODE -ne 0) {
        Fail "pnpm install failed." 3
    }
}

function Start-Demo {
    if ($NoLaunch) {
        Write-Ok "Setup complete. Run 'pnpm aisoc:demo' when you are ready."
        return
    }

    $args = @('aisoc:demo')
    if ($NoPull) { $args += '--no-pull' }
    if ($Rebuild) { $args += '--rebuild' }

    Write-Info "Starting the demo stack..."
    & pnpm @args
    if ($LASTEXITCODE -ne 0) {
        Fail "pnpm aisoc:demo failed." 4
    }
}

Write-Host ''
Write-Host 'AiSOC Windows bootstrap' -ForegroundColor Green
Write-Host ''

if (-not (Test-Path 'package.json')) {
    Fail "Run this from the repo root." 1
}

if (-not $NoInstall) {
    Ensure-Docker
    Ensure-NodeAndPnpm
} else {
    if (-not (Test-Command pnpm)) {
        Fail "pnpm is missing and -NoInstall was provided." 1
    }
}

Ensure-Workspace
Start-Demo

