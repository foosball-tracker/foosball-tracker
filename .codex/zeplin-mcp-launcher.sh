#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SECRETS_FILE="$SCRIPT_DIR/secrets.env"
if [ ! -f "$SECRETS_FILE" ]; then
  echo "Missing $SECRETS_FILE" >&2
  exit 1
fi
set -a
. "$SECRETS_FILE"
set +a
if [ -z "${ZEPLIN_ACCESS_TOKEN:-}" ]; then
  echo "ZEPLIN_ACCESS_TOKEN is missing in $SECRETS_FILE" >&2
  exit 1
fi
exec npx -y @zeplin/mcp-server@latest

