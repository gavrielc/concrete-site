#!/usr/bin/env sh
# Free Astro dev ports (4321-4323) then start on 4321. Works with npm and yarn.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

for port in 4321 4322 4323; do
  if command -v lsof >/dev/null 2>&1; then
    pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
    if [ -n "$pids" ]; then
      echo "Stopping process(es) on port $port: $pids"
      kill -9 $pids 2>/dev/null || true
      sleep 0.5
    fi
  fi
done

ASTRO="$ROOT/node_modules/.bin/astro"
if [ ! -x "$ASTRO" ]; then
  echo "Astro not found. Run: npm install   (or: yarn install)" >&2
  exit 1
fi

echo ""
echo "  Local preview:  http://localhost:4321"
echo "  (strict port 4321 — if this fails, run dev:clean again)"
echo ""

exec "$ASTRO" dev
