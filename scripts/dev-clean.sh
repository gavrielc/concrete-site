#!/usr/bin/env sh
# Free Astro dev ports (4321-4323) then start on 4321.
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

install_hint() {
  if [ -f "$ROOT/yarn.lock" ] && command -v yarn >/dev/null 2>&1; then
    echo "yarn install"
  else
    echo "npm install"
  fi
}

stop_port() {
  port="$1"
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"

  if [ -z "$pids" ]; then
    return 0
  fi

  echo "Stopping process(es) on port $port: $pids"

  # Try graceful shutdown first.
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true

  i=0
  while lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1 && [ "$i" -lt 12 ]; do
    sleep 0.25
    i=$((i + 1))
  done

  if lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    stubborn="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [ -n "$stubborn" ]; then
      echo "Force-stopping process(es) on port $port: $stubborn"
      # shellcheck disable=SC2086
      kill -9 $stubborn 2>/dev/null || true
    fi
  fi
}

if command -v lsof >/dev/null 2>&1; then
  for port in 4321 4322 4323; do
    stop_port "$port"
  done
fi

ASTRO="$ROOT/node_modules/.bin/astro"
if [ ! -x "$ASTRO" ]; then
  echo "Astro not found. Run: $(install_hint)" >&2
  exit 1
fi

echo ""
echo "  Local preview:  http://localhost:4321"
echo "  (strict port 4321; cleanup of 4321-4323 is automatic)"
echo ""

exec "$ASTRO" dev --host --port 4321 --strictPort
