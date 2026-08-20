#!/bin/bash
# ============================================================================
# JSOL Indenter — Full Suite Runner
# Runs tools/test-indenter.js against every *.jsol.js under a target directory
# (default: ../../examples), same discovery pattern as tools/test-runner.sh.
# Does NOT touch engine.jsol or any deployed distribution — this only proves
# whether $sIndentCode is safe to wire in, it doesn't wire it in.
# ============================================================================

cd "$(dirname "$0")"

set -e

TARGET_DIR="${1:-../../examples}"
TARGET_DIR=$(cd "$TARGET_DIR" 2>/dev/null && pwd || echo "$TARGET_DIR")

echo "================================================================"
echo "JSOL Indenter — Full Suite Runner"
echo "Target Directory: $TARGET_DIR"
echo "================================================================"

# Preflight checks, same spirit as test-runner.sh
NODE_COMPILER="../../jsol-compiler-node/index.js"
if [ ! -f "$NODE_COMPILER" ]; then
    echo "❌ FATAL: Preflight check failed. '$NODE_COMPILER' not found."
    echo "Run bootstrapper/build pipeline first."
    exit 1
fi

if [ ! -f "test-indenter.js" ]; then
    echo "❌ FATAL: 'test-indenter.js' not found in tools directory."
    exit 1
fi

if [ ! -f "../lexer.jsol" ] || [ ! -f "../indenter.jsol" ]; then
    echo "❌ FATAL: lexer.jsol or indenter.jsol not found at jsol-compiler-src root."
    exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ FATAL: Target directory '$TARGET_DIR' does not exist."
    exit 1
fi

TOTAL=0
PASSED=0
FAILED=0
FAILED_FILES=()

echo "Starting indenter tests..."
echo ""

while IFS= read -r -d '' file; do
    TOTAL=$((TOTAL + 1))
    set +e
    node test-indenter.js --source="$file"
    EXIT_CODE=$?
    set -e

    if [ $EXIT_CODE -ne 0 ]; then
        FAILED=$((FAILED + 1))
        FAILED_FILES+=("$file")
    else
        PASSED=$((PASSED + 1))
    fi
done < <(find "$TARGET_DIR" -type f -name "*.jsol.js" -print0 | sort -z)

echo ""
echo "================================================================"
if [ $FAILED -gt 0 ]; then
    echo "❌ INDENTER SUITE FAILED. Passed: $PASSED | Failed: $FAILED | Total: $TOTAL"
    echo ""
    echo "Files with behavior changes or execution errors after indenting:"
    for f in "${FAILED_FILES[@]}"; do
        echo "  - $f"
    done
    exit 1
else
    echo "✅ INDENTER SUITE PASSED. All $TOTAL example(s) — layout changed, behavior identical."
    rm -rf "../../_indenter_test_bin"
    exit 0
fi
