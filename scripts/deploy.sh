#!/usr/bin/env bash
#
# One-command deploy: git pull, install deps if the lockfile changed,
# apply pending migrations, build, reload pm2, then health-check.
#
# Any failing step aborts the script immediately (set -e) — in particular,
# pm2 is only reloaded if `npm run build` succeeded, since that step is
# ordered after it and nothing here catches/ignores a failure.
#
# pm2 runs the app via ecosystem.config.js, which execs the `next` binary
# directly (no `npm start` / `sh -c` wrapper in between). That matters for
# this script: it lets the health check below confirm the process holding
# port 3000 really is pm2's tracked pid, and it means a `pm2 startOrReload`
# reaches the real server process directly instead of relying on a wrapper
# to relay the signal — see ecosystem.config.js for why that wrapper chain
# used to let a killed deploy leave an orphaned server behind.
#
# Usage: ./scripts/deploy.sh

set -euo pipefail

APP_DIR="/opt/yapinci-commerce"
PM2_APP="yapinci"
PORT=3000
HEALTH_URL="http://localhost:${PORT}/api/health"
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
    printf 'pm2 was not touched unless the failure happened at or after the "pm2 startOrReload" step.\n' >&2
  fi
}
trap on_exit EXIT

# Prints the pid of whatever process is listening on $PORT, or nothing if
# the port is free. Requires root (or CAP_NET_ADMIN) to see the pid via ss,
# which is the case for the user this script normally runs as.
port_holder_pid() {
  ss -tlnp 2>/dev/null | grep ":${PORT} " | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2
}

# Prints pm2's currently tracked pid for $PM2_APP, or nothing if pm2 has
# no such app (not yet started, or a name mismatch).
pm2_tracked_pid() {
  pm2 jlist 2>/dev/null | python3 -c "
import json, sys
try:
    procs = json.load(sys.stdin)
except Exception:
    sys.exit(0)
for p in procs:
    if p.get('name') == '$PM2_APP':
        pid = p.get('pid')
        if pid:
            print(pid)
        break
"
}

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

PORT_PID="$(port_holder_pid || true)"
PM2_PID="$(pm2_tracked_pid || true)"
if [[ -n "$PORT_PID" && "$PORT_PID" != "$PM2_PID" ]]; then
  fail "Port $PORT is held by pid $PORT_PID, which is not pm2's tracked pid for '$PM2_APP' (${PM2_PID:-none}). \
This looks like an orphaned server process from a previous deploy — a restart won't replace it, it'll just fail \
to bind and pm2 will crash-loop while the orphan keeps silently serving stale code. Investigate and stop pid \
$PORT_PID manually (e.g. 'ps -p $PORT_PID -o pid,ppid,cmd' then 'kill $PORT_PID') before deploying again."
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

CURRENT_STEP="pm2 startOrReload"
GIT_COMMIT="$(git rev-parse HEAD)"
export GIT_COMMIT
log "pm2 startOrReload ecosystem.config.js --update-env (commit ${GIT_COMMIT})"
pm2 startOrReload ecosystem.config.js --update-env

CURRENT_STEP="health check"
log "Health check: waiting for $HEALTH_URL to report commit $GIT_COMMIT"
healthy=false
for attempt in $(seq 1 "$HEALTH_RETRIES"); do
  body="$(curl -s "$HEALTH_URL" 2>/dev/null)" || body=""
  reported_commit="$(printf '%s' "$body" | python3 -c "
import json, sys
try:
    print(json.load(sys.stdin).get('commit') or '')
except Exception:
    print('')
" 2>/dev/null)"

  if [[ "$reported_commit" == "$GIT_COMMIT" ]]; then
    healthy=true
    break
  fi
  log "Attempt $attempt/$HEALTH_RETRIES: /api/health reported commit '${reported_commit:-<unreachable>}', want $GIT_COMMIT, retrying in ${HEALTH_DELAY_SECONDS}s"
  sleep "$HEALTH_DELAY_SECONDS"
done

if [[ "$healthy" != "true" ]]; then
  fail "$HEALTH_URL never reported commit $GIT_COMMIT after $HEALTH_RETRIES attempts. Code was built and pm2 was \
told to reload — check 'pm2 logs $PM2_APP' and whether another process is holding port $PORT (a 200 response \
alone does not prove the new build is what's serving it)."
fi

CURRENT_STEP="port ownership check"
FINAL_PORT_PID="$(port_holder_pid || true)"
FINAL_PM2_PID="$(pm2_tracked_pid || true)"
if [[ -z "$FINAL_PORT_PID" || "$FINAL_PORT_PID" != "$FINAL_PM2_PID" ]]; then
  fail "The health check passed, but the process holding port $PORT (${FINAL_PORT_PID:-none}) does not match \
pm2's tracked pid for '$PM2_APP' (${FINAL_PM2_PID:-none}). Investigate before trusting this deploy."
fi

CURRENT_STEP="done"
log "Deploy successful — commit $GIT_COMMIT is live and owned by pm2 (pid $FINAL_PM2_PID)."
