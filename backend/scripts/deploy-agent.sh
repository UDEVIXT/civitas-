#!/bin/bash
set -e

WORK_DIR="/var/www/civitas-/backend"
ENV_FILE="/etc/deploy-agent/secrets.env"
LOG="/var/log/deploy-agent.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG
}

log "Nuevo deploy detectado"

if [ -f "$ENV_FILE" ]; then
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
else
  log "ERROR: No existe $ENV_FILE"
  exit 1
fi

# Actualizar código
cd $WORK_DIR
git fetch "https://${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git" $GITHUB_BRANCH >> $LOG 2>&1
git reset --hard FETCH_HEAD >> $LOG 2>&1

# Reconstruir contenedor
docker compose down >> $LOG 2>&1
docker compose up -d --build >> $LOG 2>&1

log "Deploy exitoso"
