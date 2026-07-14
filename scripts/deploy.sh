#!/usr/bin/env bash
#
# One-command deploy: git pull, install deps if the lockfile changed,
# apply pending migrations, build, restart pm2, then health-check.
#
# Any failing step aborts the script immediately (set -e) — in particular,
# pm2 is only restarted if `npm run build` succeeded, since the restart
# step is ordered after it and nothing here catches/ignores a failure.
#
# Usage: ./scripts/deploy.sh

set -euo pipefail

APP_DIR="/opt/yapinci-commerce"
PM2_APP="yapinci"
HEALTH_URL="http://localhost:3000/"
HEALTH_RETRIES=10
HEALTH_DELAY_SECONDS=2
REQUIRED_BRANCH="main"

CURRENT_STEP="startup"

log() {
  printf '\n\033[1;34m==>\033[0m %s\n' "$1"
}

fail() {
  printf '\n\033[1;31mFAILED:\033[0m %s\n' "$1" >&2
  exit 1
}

on_exit() {
  local code=$?
  if [[ $code -ne 0 ]]; then
    printf '\n\033[1;31mDEPLOY FAILED\033[0m during step: %s (exit code %s)\n' "$CURRENT_STEP" "$code" >&2
    printf 'pm2 was not touched unless the failure happened at or after the "pm2 restart" step.\n' >&2
  fi
}
trap on_exit EXIT

cd "$APP_DIR" || fail "Could not cd into $APP_DIR"

CURRENT_STEP="preflight checks"
log "Preflight checks"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH" != "$REQUIRED_BRANCH" ]]; then
  fail "On branch '$BRANCH', expected '$REQUIRED_BRANCH'. Switch branches before deploying."
fi
if [[ -n "$(git status --porcelain)" ]]; then
  fail "Working tree has uncommitted changes. Commit, stash, or discard them before deploying."
fi

CURRENT_STEP="git pull"
log "git pull --ff-only"
LOCKFILE_BEFORE="$(sha256sum package-lock.json | awk '{print $1}')"
git pull --ff-only

CURRENT_STEP="npm install"
LOCKFILE_AFTER="$(sha256sum package-lock.json | awk '{print $1}')"
if [[ "$LOCKFILE_BEFORE" != "$LOCKFILE_AFTER" || ! -d node_modules ]]; then
  log "Dependencies changed (or node_modules missing) — npm install"
  npm install
else
  log "package-lock.json unchanged — skipping npm install"
fi

CURRENT_STEP="prisma migrate deploy"
log "prisma migrate deploy"
npx prisma migrate deploy

CURRENT_STEP="npm run build"
log "npm run build"
npm run build

CURRENT_STEP="pm2 restart"
log "pm2 restart $PM2_APP --update-env"
pm2 restart "$PM2_APP" --update-env

CURRENT_STEP="health check"
log "Health check: waiting for $HEALTH_URL to return 200"
healthy=false
for attempt in $(seq 1 "$HEALTH_RETRIES"); do
  status="$(curl -s -o /dev/null -w '%{http_code}' "$HEALTH_URL" || echo "000")"
  if [[ "$status" == "200" ]]; then
    healthy=true
    break
  fi
  log "Attempt $attempt/$HEALTH_RETRIES: got HTTP $status, retrying in ${HEALTH_DELAY_SECONDS}s"
  sleep "$HEALTH_DELAY_SECONDS"
done

if [[ "$healthy" != "true" ]]; then
  fail "$HEALTH_URL did not return 200 after $HEALTH_RETRIES attempts. Code was deployed and pm2 was restarted — check 'pm2 logs $PM2_APP'."
fi

CURRENT_STEP="done"
log "Deploy successful — $HEALTH_URL is healthy."
