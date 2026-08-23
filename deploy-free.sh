#!/bin/bash
set -euo pipefail

ENV_FILE=".env"
COMPOSE_FILE="docker-compose.free.yml"

# ── Colors ──────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}==> $1${NC}"; }
ok()    { echo -e "${GREEN}  ✓ $1${NC}"; }
warn()  { echo -e "${YELLOW}  ! $1${NC}"; }
fail()  { echo -e "${RED}  ✗ $1${NC}"; exit 1; }

# ── Pre-flight checks ───────────────────────────────────
info "Running pre-flight checks..."

[ -f "$ENV_FILE" ]          || fail "$ENV_FILE not found. Run: cp .env.prod.example .env"
[ -f "$COMPOSE_FILE" ]      || fail "$COMPOSE_FILE not found."
command -v docker >/dev/null || fail "Docker is not installed."

if ! docker info >/dev/null 2>&1; then
    fail "Docker daemon is not running. Start it with: sudo systemctl start docker"
fi

ok "All pre-flight checks passed."

# ── Pull latest code ────────────────────────────────────
info "Pulling latest code..."
git pull --ff-only 2>/dev/null && ok "Code updated." || warn "Could not pull (not a git repo or no remote). Continuing."

# ── Build and start ─────────────────────────────────────
info "Building and starting free-tier backend stack..."
docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" up -d --build

ok "Containers started."

# ── Wait for health ─────────────────────────────────────
info "Waiting for services to become healthy (max 60s)..."
HEALTHY=0
for i in $(seq 1 12); do
    sleep 5
    UNHEALTHY=$(docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null \
        | grep -c '"Health":"unhealthy"' || true)
    TOTAL=$(docker compose -f "$COMPOSE_FILE" ps -q | wc -l)
    RUNNING=$(docker compose -f "$COMPOSE_FILE" ps --filter "status=running" -q | wc -l)

    if [ "$RUNNING" -eq "$TOTAL" ]; then
        HEALTHY=1
        ok "All $TOTAL containers are running."
        break
    fi
    warn "Waiting... ($RUNNING/$TOTAL containers up, ${i}x5s elapsed)"
done

if [ "$HEALTHY" -eq 0 ]; then
    warn "Not all containers are healthy yet. Check logs:"
    echo "  docker compose -f $COMPOSE_FILE logs -f"
fi

# ── Summary ─────────────────────────────────────────────
echo ""
info "Deployment Summary"
echo "  ┌──────────────────────────────────────────────┐"
echo "  │  Compose file:  $COMPOSE_FILE                "
echo "  │  Env file:      $ENV_FILE                    "
echo "  │  Containers:    $(docker compose -f "$COMPOSE_FILE" ps -q | wc -l) running      "
echo "  └──────────────────────────────────────────────┘"
echo ""
echo "  Check status:  docker compose -f $COMPOSE_FILE ps"
echo "  View logs:     docker compose -f $COMPOSE_FILE logs -f"
echo "  Stop:          docker compose -f $COMPOSE_FILE down"
echo ""
