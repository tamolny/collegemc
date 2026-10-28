#!/usr/bin/env bash
# Serve the site locally: ./start.sh [--share] [port]
#   --share  also open a Cloudflare quick tunnel and print a public https URL
set -euo pipefail
cd "$(dirname "$0")"

SHARE=0
if [[ "${1:-}" == "--share" ]]; then SHARE=1; shift; fi
PORT="${1:-8080}"
while (echo >"/dev/tcp/127.0.0.1/$PORT") 2>/dev/null; do
  echo "Port $PORT is in use, trying $((PORT + 1))"
  PORT=$((PORT + 1))
done
URL="http://localhost:$PORT/"

if [[ $SHARE == 0 ]]; then
  echo "CollegeMC site -> $URL  (Ctrl+C to stop)"
  ( sleep 1; xdg-open "$URL" >/dev/null 2>&1 || true ) &
  exec python3 -m http.server "$PORT" --bind 127.0.0.1
fi

command -v cloudflared >/dev/null || { echo "cloudflared is not installed"; exit 1; }
trap 'kill $(jobs -p) 2>/dev/null' EXIT
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
echo "CollegeMC site -> $URL"
echo "Starting Cloudflare tunnel..."
cloudflared tunnel --no-autoupdate --url "http://localhost:$PORT" 2>&1 |
  while IFS= read -r line; do
    if [[ $line =~ (https://[a-z0-9-]+\.trycloudflare\.com) ]]; then
      echo
      echo "Share this link: ${BASH_REMATCH[1]}"
      echo "(Ctrl+C to stop - the link dies when you do)"
    fi
  done
