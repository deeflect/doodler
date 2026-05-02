#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
ZIP_PATH="$DIST_DIR/doodler-extension.zip"
TMP_ZIP="$(mktemp -t doodler-extension.XXXXXX.zip)"
rm -f "$TMP_ZIP"

cleanup() {
  if [[ -f "$TMP_ZIP" ]]; then
    rm -f "$TMP_ZIP"
  fi
}
trap cleanup EXIT

cd "$ROOT_DIR"
mkdir -p "$DIST_DIR"

zip -qr "$TMP_ZIP" \
  manifest.json \
  popup.html \
  src \
  assets/icons \
  assets/icons-generated

mv "$TMP_ZIP" "$ZIP_PATH"
echo "$ZIP_PATH"
