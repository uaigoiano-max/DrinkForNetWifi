#!/bin/sh
# Optional OpenWrt smoke test. It skips cleanly when Lua is not installed.
set -eu

if ! command -v lua >/dev/null 2>&1 || ! command -v sha256sum >/dev/null 2>&1; then
    echo "SKIP: lua and sha256sum are required for the OpenWrt smoke test"
    exit 0
fi

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
STATE="$ROOT/tests/.drinkfornet-state"
rm -rf "$STATE"
mkdir -p "$STATE"
export DRINKFORNET_STATE_DIR="$STATE"
export DRINKFORNET_DB="$STATE/vouchers.tsv"
export DRINKFORNET_AUDIT="$STATE/audit.log"
CORE="$ROOT/openwrt/usr/libexec/drinkfornet-core.lua"

generated=$(lua "$CORE" generate 1)
token=$(printf '%s\n' "$generated" | awk -F '\t' '{ print $1 }')
test -n "$token"
lua "$CORE" activate "$token" >/dev/null
if lua "$CORE" activate "$token" >/dev/null 2>&1; then
    echo "FAIL: voucher was reusable" >&2
    exit 1
fi
if lua "$CORE" activate "DFN-INVALID" >/dev/null 2>&1; then
    echo "FAIL: invalid voucher was accepted" >&2
    exit 1
fi
grep -q 'ACTIVE' "$STATE/vouchers.tsv"
test -s "$STATE/audit.log"
rm -rf "$STATE"
echo "OpenWrt core smoke test passed"
