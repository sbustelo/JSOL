#!/bin/bash
# ============================================================================
# JSOL QA Test Runner Controller
# ============================================================================

cd "$(dirname "$0")"

set -e

TARGET_DIR="${1:-../../examples}"
TARGET_DIR=$(cd "$TARGET_DIR" 2>/dev/null && pwd || echo "$TARGET_DIR")

echo "================================================================"
echo "JSOL QA Test Runner Controller"
echo "Target Directory: $TARGET_DIR"
echo "================================================================"

# Preflight check for compiled distributions
NODE_COMPILER="../../jsol-compiler-node/index.js"
PHP_COMPILER="../../jsol-compiler-php/index.php"

if [ ! -f "$NODE_COMPILER" ]; then
    echo "❌ FATAL: Preflight check failed. '$NODE_COMPILER' not found."
    echo "Run bootstrapper/build pipeline first."
    exit 1
fi

if [ ! -f "$PHP_COMPILER" ]; then
    echo "❌ FATAL: Preflight check failed. '$PHP_COMPILER' not found."
    echo "Run bootstrapper/build pipeline first."
    exit 1
fi

if [ ! -f "contract-runner.js" ]; then
    echo "❌ FATAL: 'contract-runner.js' not found in tools directory."
    exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ FATAL: Target directory '$TARGET_DIR' does not exist."
    exit 1
fi

TOTAL=0
PASSED=0
FAILED=0

echo "Starting contract tests..."
echo ""

while IFS= read -r -d '' file; do
    TOTAL=$((TOTAL + 1))
    set +e
    node contract-runner.js --source="$file"
    EXIT_CODE=$?
    set -e
    
    if [ $EXIT_CODE -ne 0 ]; then
        FAILED=$((FAILED + 1))
    else
        PASSED=$((PASSED + 1))
    fi
done < <(find "$TARGET_DIR" -type f -name "*.jsol.js" -print0 | sort -z)

echo ""
echo "================================================================"
if [ $FAILED -gt 0 ]; then
    echo "❌ TEST SUITE FAILED. Passed: $PASSED | Failed: $FAILED | Total: $TOTAL"
    exit 1
else
    echo "✅ TEST SUITE PASSED. All $TOTAL contracts executed with isomorphic parity."
    rm -rf "../../_test_bin"
    exit 0
fi