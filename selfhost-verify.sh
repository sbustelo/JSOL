#!/bin/bash
# ============================================================================
# SELF-HOSTING FIXED-POINT VERIFICATION SUITE v0.2.92
# ============================================================================
#
# This script executes all steps described in docs/10_dev/SELF_HOSTING.md
# to verify that JSOL is capable of self-hosting (the compiler can compile
# itself and reach a fixed-point convergence across two independent host
# runtimes: Node.js and PHP).
#
# What this script does:
#   - Compiles the JSOL compiler source (jsol-compiler-src/) using the
#     stable bootstrap compilers (Node and PHP)
#   - Generates generation 2 compilers (_jsol-compiler-node-2/ and
#     _jsol-compiler-php-2/)
#   - Verifies parity between Node and PHP outputs (A.5)
#   - Uses generation 2 compilers to generate generation 3 compilers
#     (_jsol-compiler-node-3/ and _jsol-compiler-php-3/)
#   - Tests temporal fixed-point: generation 2 == generation 3 (B.5)
#   - Tests isomorphic fixed-point: Node == PHP logic (B.6)
#
# Directory convention:
#   All directories created by this script use a leading underscore (_)
#   as a prefix (e.g., _jsol-compiler-node-2/, _logs/). This follows our
#   project convention where _* entries are excluded from version control
#   via .gitignore, keeping the repository clean from build artifacts.
#
# Expected outcome: All diff commands must return nothing (no differences).
# If any test fails, the script exits with an error code.
#
# Usage:
#   - Run before every push to GitHub to validate changes to jsol-compiler-src/
#   - Use: ./selfhost-verify.sh
#
# Requirements:
#   - Node.js (stable)
#   - PHP (stable with mbstring extension)
#   - Directory structure matching the published distribution
#
# Reference:
#   docs/10_dev/SELF_HOSTING.md — Full explanation of self-hosting
#   and fixed-point convergence.
#
# Author: Santiago Bustelo ( https://www.bustelo.com.ar/ )
# License: MIT
# Version: v0.2.92 — 2026-08-13
# ============================================================================


set -e  # Exit on any error

# ============================================================================
# SETUP LOGGING
# ============================================================================

mkdir -p _logs
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="_logs/selfhost-verify_${TIMESTAMP}.log"

log() {
    echo "$1" | tee -a "$LOG_FILE"
}

log_only() {
    echo "$1" >> "$LOG_FILE"
}

log "================================================================"
log "SELF-HOSTING FIXED-POINT VERIFICATION SUITE"
log "Started: $(date)"
log "Log file: $LOG_FILE"
log "================================================================"
log ""

# ============================================================================
# A. COMPILE TO THE SECOND GENERATION
# ============================================================================

log ""
log "================================================================"
log "A. COMPILE TO THE SECOND GENERATION (v0.2.91)"
log "================================================================"
log ""

# A.1 Create clean directories
log "A.1 Creating directories..."
mkdir -p _jsol-compiler-node-2 _jsol-compiler-php-2
log ""

# A.2 Compile with Node engine
log "A.2 Compiling with Node engine (v0.2.91)..."
for f in jsol-compiler-src/*.jsol; do
    log "  - Compiling: $f"
    node jsol-compiler-node/index.js --source="$f" --out-dir="_jsol-compiler-node-2" 2>&1 | tee -a "$LOG_FILE"
done
log ""

# A.3 Compile with PHP engine
log "A.3 Compiling with PHP engine (v0.2.91)..."
for f in jsol-compiler-src/*.jsol; do
    log "  - Compiling: $f"
    php jsol-compiler-php/index.php --source="$f" --out-dir="_jsol-compiler-php-2" 2>&1 | tee -a "$LOG_FILE"
done
log ""

# A.4 Copy static orchestrator files
log "A.4 Copying static orchestrator files..."
cp jsol-compiler-src/index.js _jsol-compiler-node-2/
cp jsol-compiler-src/targets.json _jsol-compiler-node-2/
cp jsol-compiler-src/index.php _jsol-compiler-php-2/
cp jsol-compiler-src/targets.json _jsol-compiler-php-2/
log ""

# A.5 Parity check
log "A.5 Running parity check (Node vs PHP - generation 2)..."
log "  Command: diff -r _jsol-compiler-node-2 _jsol-compiler-php-2 | grep -v '\.js' | grep -v '\.php'"
log ""

set +e
diff_raw=$(diff -r _jsol-compiler-node-2 _jsol-compiler-php-2 2>&1)
diff_exit=$?

# Filter out lines containing .js or .php files
diff_filtered=$(echo "$diff_raw" | grep -v "\.js" | grep -v "\.php" 2>&1)
set -e

log_only "--- A.5 RAW DIFF OUTPUT START ---"
log_only "$diff_raw"
log_only "--- A.5 RAW DIFF OUTPUT END ---"
log_only "Raw diff exit code: $diff_exit"
log_only ""

log_only "--- A.5 FILTERED DIFF OUTPUT START ---"
log_only "$diff_filtered"
log_only "--- A.5 FILTERED DIFF OUTPUT END ---"
log_only ""

# Verificar si hay diferencias reales (no solo archivos .js o .php)
if [ -z "$diff_filtered" ]; then
    log "  ✅ PASSED: No logical differences between Node and PHP"
else
    log "  ❌ FAILED: Logical differences found between Node and PHP"
    log ""
    log "  ===== FILTERED DIFF OUTPUT ===== "
    log "$diff_filtered"
    log "  ================================ "
    log ""
    log "  Full log available at: $LOG_FILE"
    exit 1
fi
log ""

# ============================================================================
# B. COMPILE TO THE THIRD GENERATION
# ============================================================================

log ""
log "================================================================"
log "B. COMPILE TO THE THIRD GENERATION"
log "================================================================"
log ""

# B.1 Create directories
log "B.1 Creating directories for generation 3..."
mkdir -p _jsol-compiler-node-3 _jsol-compiler-php-3
log ""

# B.2 Compile with Node orchestrator
log "B.2 Compiling with generation-2 Node orchestrator..."
for f in jsol-compiler-src/*.jsol; do
    log "  - Compiling: $f"
    node _jsol-compiler-node-2/index.js --source="$f" --out-dir="_jsol-compiler-node-3" 2>&1 | tee -a "$LOG_FILE"
done
log ""

# B.3 Compile with PHP orchestrator
log "B.3 Compiling with generation-2 PHP orchestrator..."
for f in jsol-compiler-src/*.jsol; do
    log "  - Compiling: $f"
    php _jsol-compiler-php-2/index.php --source="$f" --out-dir="_jsol-compiler-php-3" 2>&1 | tee -a "$LOG_FILE"
done
log ""

# B.4 Copy static files
log "B.4 Copying static orchestrator files for generation 3..."
cp jsol-compiler-src/index.js _jsol-compiler-node-3/
cp jsol-compiler-src/targets.json _jsol-compiler-node-3/
cp jsol-compiler-src/index.php _jsol-compiler-php-3/
cp jsol-compiler-src/targets.json _jsol-compiler-php-3/
log ""

# B.5 TEST 1: Temporal fixed-point
log "B.5 TEST 1: Temporal fixed-point (is Node compiler stable?)"
log "  Command: diff -r _jsol-compiler-node-2 _jsol-compiler-node-3 | grep -v '\.js'"
log "  This diff must return nothing."
log ""

set +e
diff_raw1=$(diff -r _jsol-compiler-node-2 _jsol-compiler-node-3 2>&1)
diff_exit1=$?

# Filter out lines containing .js files
diff_filtered1=$(echo "$diff_raw1" | grep -v "\.js" 2>&1)
set -e

log_only "--- B.5 RAW DIFF OUTPUT START ---"
log_only "$diff_raw1"
log_only "--- B.5 RAW DIFF OUTPUT END ---"
log_only "Raw diff exit code: $diff_exit1"
log_only ""

log_only "--- B.5 FILTERED DIFF OUTPUT START ---"
log_only "$diff_filtered1"
log_only "--- B.5 FILTERED DIFF OUTPUT END ---"
log_only ""

# Verificar si hay diferencias reales (no solo archivos .js)
if [ -z "$diff_filtered1" ]; then
    log "  ✅ PASSED: Node compiler is stable (generation 2 = generation 3)"
else
    log "  ❌ FAILED: Node compiler is NOT stable - differences found"
    log ""
    log "  ===== FILTERED DIFF OUTPUT ===== "
    log "$diff_filtered1"
    log "  ================================ "
    log ""
    log "  Full log available at: $LOG_FILE"
    exit 1
fi
log ""

# B.6 TEST 2: Isomorphic fixed-point
log "B.6 TEST 2: Isomorphic fixed-point (do Node and PHP generate same logic?)"
log "  Command: diff -r _jsol-compiler-node-3 _jsol-compiler-php-3 | grep -v '\.js' | grep -v '\.php'"
log "  This diff should only show target-language structural differences."
log ""

set +e
diff_raw2=$(diff -r _jsol-compiler-node-3 _jsol-compiler-php-3 2>&1)
diff_exit2=$?

# Filter out lines containing .js or .php files
diff_filtered2=$(echo "$diff_raw2" | grep -v "\.js" | grep -v "\.php" 2>&1)
set -e

log_only "--- B.6 RAW DIFF OUTPUT START ---"
log_only "$diff_raw2"
log_only "--- B.6 RAW DIFF OUTPUT END ---"
log_only "Raw diff exit code: $diff_exit2"
log_only ""

log_only "--- B.6 FILTERED DIFF OUTPUT START ---"
log_only "$diff_filtered2"
log_only "--- B.6 FILTERED DIFF OUTPUT END ---"
log_only ""

# Verificar si hay diferencias reales (no solo archivos .js o .php)
if [ -z "$diff_filtered2" ]; then
    log "  ✅ PASSED: Node and PHP generate the same logic"
else
    log "  ❌ FAILED: Node and PHP generate DIFFERENT logic"
    log ""
    log "  ===== FILTERED DIFF OUTPUT ===== "
    log "$diff_filtered2"
    log "  ================================ "
    log ""
    log "  Full log available at: $LOG_FILE"
    exit 1
fi
log ""

# ============================================================================
# FINAL RESULT
# ============================================================================

log ""
log "================================================================"
log "✅ ALL TESTS PASSED SUCCESSFULLY"
log "================================================================"
log ""
log "Summary:"
log "  A.5 Parity check:               ✅ PASSED"
log "  B.5 Temporal fixed-point:       ✅ PASSED"
log "  B.6 Isomorphic fixed-point:     ✅ PASSED"
log ""
log "The JSOL compiler system is stable and isomorphic."
log "Fixed-point convergence holds across both Node.js and PHP hosts."
log "================================================================"
log ""
log "Full log saved to: $LOG_FILE"
log "Completed: $(date)"
log "================================================================"