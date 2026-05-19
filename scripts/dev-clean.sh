#!/usr/bin/env sh
# Free Astro dev ports (4321-4323) then start on 4321. Works with npm and yarn.
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

for port in 4321 4322 4323; do
  if command -v lsof >/dev/null 2>&1; then
    pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
    if [ -n "$pids" ]; then
      echo "Stopping process(es) on port $port: $pids"
      # shellcheck disable=SC2086
      kill -9 $pids 2>/dev/null || true
    fi
  fi
done

if command -v lsof >/dev/null 2>&1; then
  for port in 4321 4322 4323; do
    i=0
    while lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1 && [ "$i" -lt 20 ]; do
      sleep 0.25
      i=$((i + 1))
    done
  done
fi

ASTRO="$ROOT/node_modules/.bin/astro"
if [ ! -x "$ASTRO" ]; then
  echo "Astro not found. Run: $(install_hint)" >&2
  exit 1
fi

echo ""
echo "  Local preview:  http://localhost:4321"
echo "  (strict port 4321 — if this fails, run dev:clean again)"
echo ""

exec "$ASTRO" dev
