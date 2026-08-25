#!/bin/bash
# ============================================================================
# JSOL QA Test Runner Controller (Batch Mode)
# ============================================================================

cd "$(dirname "$0")"

set -e

TARGET_DIR="${1:-../../examples}"
TARGET_DIR=$(cd "$TARGET_DIR" 2>/dev/null && pwd || echo "$TARGET_DIR")

echo "================================================================"
echo "JSOL QA Test Runner Controller (Batch Mode)"
echo "Target Directory: $TARGET_DIR"
echo "================================================================"

# Preflight check for compiled distributions
NODE_COMPILER="../../jsol-compiler-node/index.js"
PHP_COMPILER="../../jsol-compiler-php/index.php"

if [ ! -f "$NODE_COMPILER" ] || [ ! -f "$PHP_COMPILER" ]; then
    echo "❌ FATAL: Preflight check failed. Compilers not found."
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

node contract-runner.js --source-dir="$TARGET_DIR"

echo "================================================================"
rm -rf "../../_test_bin"
exit 0