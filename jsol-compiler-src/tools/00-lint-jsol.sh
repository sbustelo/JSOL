#!/bin/bash
# ============================================================================
# JSOL LINT + STAGE-TO-SRC v0.2.96
# ============================================================================
# Compiles every *.jsol file sitting in _staging/ against all four targets
# using the REAL, currently deployed compiler (jsol-compiler-node). This is
# NOT the self-hosting fixed-point suite (00-compile-verify-jsol.sh) — it's
# a fast correctness check for one or a few files before they ever touch
# jsol-compiler-src/.
#
# All-or-nothing: if every staged file compiles clean, you get the option to
# copy them into jsol-compiler-src/ (overwriting). If even one fails, nothing
# gets copied — same principle as the big self-hosting script.
#
# Usage:
#   bash tools/00-lint-jsol.sh              (uses _staging/ by default)
#   bash tools/00-lint-jsol.sh some/other/dir

cd "$(dirname "$0")/.."   # jsol-compiler-src/

STAGING_DIR="${1:-_staging}"
LINT_OUT="_lint_test"
NODE_COMPILER="../jsol-compiler-node/index.js"

echo "================================================================"
echo "JSOL Lint — Staging Directory: $STAGING_DIR"
echo "================================================================"

if [ ! -f "$NODE_COMPILER" ]; then
    echo "❌ FATAL: '$NODE_COMPILER' not found. Deploy at least once before linting."
    exit 1
fi

if [ ! -d "$STAGING_DIR" ]; then
    echo "❌ FATAL: '$STAGING_DIR' does not exist. Nothing to lint."
    echo "   Create it and drop the .jsol file(s) you want to validate there."
    exit 1
fi

shopt -s nullglob
STAGED_FILES=("$STAGING_DIR"/*.jsol)
shopt -u nullglob

if [ ${#STAGED_FILES[@]} -eq 0 ]; then
    echo "❌ Nothing to lint: no *.jsol files found in '$STAGING_DIR'."
    exit 1
fi

rm -rf "$LINT_OUT"
mkdir -p "$LINT_OUT"

PASSED=0
FAILED=0
FAILED_FILES=()

for f in "${STAGED_FILES[@]}"; do
    NAME=$(basename "$f")
    echo ""
    echo "📄 [LINT] $NAME"

    OUTPUT=$(node "$NODE_COMPILER" --source="$f" --out-dir="$LINT_OUT" --targets=js,php,ts,py 2>&1)
    STATUS=$?

    if [ $STATUS -eq 0 ]; then
        echo "  ✅ PASSED"
        PASSED=$((PASSED + 1))
    else
        echo "  ❌ FAILED"
        echo "$OUTPUT" | sed 's/^/       /'
        FAILED=$((FAILED + 1))
        FAILED_FILES+=("$NAME")
    fi
done

echo ""
echo "================================================================"
echo "Result: $PASSED passed, $FAILED failed (of ${#STAGED_FILES[@]} staged file(s))"
echo "================================================================"

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "❌ Not offering to copy — every staged file must pass first."
    echo "   Failed:"
    for name in "${FAILED_FILES[@]}"; do
        echo "     - $name"
    done
    rm -rf "$LINT_OUT"
    exit 1
fi

rm -rf "$LINT_OUT"

echo ""
read -p "? All $PASSED file(s) passed. Copy them to jsol-compiler-src/ now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    for f in "${STAGED_FILES[@]}"; do
        NAME=$(basename "$f")
        cp "$f" "./$NAME"
        echo "  -> copied $NAME"
    done
    echo "✅ Done. Staged files were NOT removed from '$STAGING_DIR' — clean it up yourself when ready."
else
    echo "  - Skipped. jsol-compiler-src/ left unchanged."
fi
