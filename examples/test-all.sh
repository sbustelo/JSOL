#!/bin/bash
# ============================================================================
# JSOL Portable Test Proxy
# Searches upwards for jsol-compiler-src/tools/test-runner.sh and delegates.
# ============================================================================

cd "$(dirname "$0")"

RUNNER_PATH=""
SEARCH_DIR="$PWD"

for i in 1 2 3 4 5 6; do
    if [ -f "$SEARCH_DIR/jsol-compiler-src/tools/test-runner.sh" ]; then
        RUNNER_PATH="$SEARCH_DIR/jsol-compiler-src/tools/test-runner.sh"
        break
    fi
    if [ "$(basename "$SEARCH_DIR")" = "tools" ] && [ -f "$SEARCH_DIR/test-runner.sh" ]; then
        RUNNER_PATH="$SEARCH_DIR/test-runner.sh"
        break
    fi
    SEARCH_DIR=$(dirname "$SEARCH_DIR")
done

if [ -z "$RUNNER_PATH" ]; then
    echo "❌ FATAL: Cannot locate jsol-compiler-src/tools/test-runner.sh in the project tree."
    exit 1
fi

exec bash "$RUNNER_PATH" "$PWD"