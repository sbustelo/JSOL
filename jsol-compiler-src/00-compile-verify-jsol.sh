#!/bin/bash
# ============================================================================
# SELF-HOSTING FIXED-POINT VERIFICATION SUITE v0.2.96
# ============================================================================

# Forzar el directorio de trabajo a jsol-compiler-src independientemente de donde se ejecute
cd "$(dirname "$0")"

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

on_error() {
    log ""
    log "❌ FATAL: Fixed-point verification failed. This version of jsol-compiler-src CANNOT be considered stable. Correct all errors and divergence issues before distributing or releasing."
    log "Full log available at: $LOG_FILE"
    exit 1
}

trap on_error ERR

log "================================================================"
log "JSOL Self-Hosting Verification Suite."
log "This script executes all steps to compile JSOL source files using the seed engine,"
log "syncing the SSOT, and validating Code Point / Fixed-Point parity across generations."
log "Started: $(date)"
log "Log file: $LOG_FILE"
log "================================================================"
log ""

# ============================================================================
# 0. BOOTSTRAP & SEED PREPARATION
# ============================================================================

log "================================================================"
log "0. BOOTSTRAP & SEED PREPARATION"
log "================================================================"
log "  - Running Bootstrapper (SSOT Generation)..."
node tools/bootstrap.js 2>&1 | tee -a "$LOG_FILE"

log "  - Preparing temporary _seed_engine from existing distributions..."
rm -rf _seed_engine
mkdir -p _seed_engine/node _seed_engine/php _seed_engine/py

if [ ! -d "../jsol-compiler-node" ] || [ ! -d "../jsol-compiler-php" ] || [ ! -d "../jsol-compiler-py" ]; then
    log "  ❌ FATAL: Base distributions (jsol-compiler-node/php/py) not found in parent directory. Cannot bootstrap."
    exit 1
fi

cp -r ../jsol-compiler-node/* _seed_engine/node/
cp -r ../jsol-compiler-php/* _seed_engine/php/
cp -r ../jsol-compiler-py/* _seed_engine/py/

log "  - Syncing new SSOT to _seed_engine..."
rm -rf _seed_engine/node/dist _seed_engine/php/dist _seed_engine/py/dist
cp -r dist _seed_engine/node/
cp -r dist _seed_engine/php/
cp -r dist _seed_engine/py/
log ""

# ============================================================================
# A. COMPILE TO GENERATION 3
# ============================================================================

log "================================================================"
log "A. COMPILE TO GENERATION 3"
log "================================================================"
log ""

log "A.1 Creating temporary directories..."
find . -name ".DS_Store" -type f -delete || true
rm -rf _build_node_gen3 _build_php_gen3 _build_py_gen3
mkdir -p _build_node_gen3 _build_php_gen3 _build_py_gen3
log ""





log "A.2 Compiling with Node engine (seed)..."
log_only "  - Compiling directory: ."
node _seed_engine/node/index.js --source-dir="." --out-dir="_build_node_gen3" >> "$LOG_FILE" 2>&1
log ""

log "A.3 Compiling with PHP engine (seed)..."
log_only "  - Compiling directory: ."
php _seed_engine/php/index.php --source-dir="." --out-dir="_build_php_gen3" >> "$LOG_FILE" 2>&1
log ""

log "A.4 Compiling with Python engine (seed)..."
log_only "  - Compiling directory: ."
python3 _seed_engine/py/index.py --source-dir="." --out-dir="_build_py_gen3" >> "$LOG_FILE" 2>&1
log ""




log "A.5 Copying static orchestrator files..."
cp index.js index.py targets.json _build_node_gen3/
cp index.php index_ui.php  index.py targets.json _build_php_gen3/
cp index.py targets.json _build_py_gen3/
cp -r dist _build_node_gen3/
cp -r dist _build_php_gen3/
cp -r dist _build_py_gen3/

# ============================================================================
# B. COMPILE TO GENERATION 4
# ============================================================================

log "================================================================"
log "B. COMPILE TO GENERATION 4"
log "================================================================"
log ""

log "B.1 Creating temporary directories for Generation 4..."
rm -rf _build_node_gen4 _build_php_gen4 _build_py_gen4
mkdir -p _build_node_gen4 _build_php_gen4 _build_py_gen4
log ""


log "B.2 Compiling with Generation 3 Node orchestrator..."
log_only "  - Compiling directory: ."
node _build_node_gen3/index.js --source-dir="." --out-dir="_build_node_gen4" >> "$LOG_FILE" 2>&1
log ""

log "B.3 Compiling with Generation 3 PHP orchestrator..."
log_only "  - Compiling directory: ."
php _build_php_gen3/index.php --source-dir="." --out-dir="_build_php_gen4" >> "$LOG_FILE" 2>&1
log ""

log "B.4 Compiling with Generation 3 Python orchestrator..."
log_only "  - Compiling directory: ."
python3 _build_py_gen3/index.py --source-dir="." --out-dir="_build_py_gen4" >> "$LOG_FILE" 2>&1
log ""



log "B.5 Copying static orchestrator files for Generation 4..."
cp index.js index.py targets.json _build_node_gen4/
cp index.php index_ui.php  index.py targets.json _build_php_gen4/
cp index.py targets.json _build_py_gen4/
cp -r dist _build_node_gen4/
cp -r dist _build_php_gen4/
cp -r dist _build_py_gen4/
log ""

# ============================================================================
# C. FIXED-POINT VERIFICATION
# ============================================================================

log "================================================================"
log "C. FIXED-POINT VERIFICATION"
log "================================================================"
log ""

check_diff() {
    local name="$1"
    local dir1="$2"
    local dir2="$3"
    
    log "  Running diff: $name ($dir1 vs $dir2)..."
    set +e
    local diff_raw=$(diff -r "$dir1" "$dir2" 2>&1)
    local diff_exit=$?
    
    # Filter out extensions to evaluate only logical integrity if needed.
    # Ignoring .js/.php/.ts for isomorphic comparison only.
    if [[ "$name" == *"Isomorphic"* ]]; then
		local diff_filtered=$(echo "$diff_raw" | grep -v "\.js$" | grep -v "\.php$" | grep -v "\.ts$" | grep -v "\.py$" 2>&1)
    else
        local diff_filtered="$diff_raw"
    fi
    set -e

    log_only "--- RAW DIFF START ($name) ---"
    log_only "$diff_raw"
    log_only "--- RAW DIFF END ($name) ---"
    
    if [ -z "$diff_filtered" ]; then
        log "  ✅ PASSED: $name"
    else
        log "  ❌ FAILED: $name"
        log ""
        log "  ===== DIFF OUTPUT ===== "
        log "$diff_filtered"
        log "  ================================ "
        log ""
        log "  Full log available at: $LOG_FILE"
        on_error
    fi
    log ""
}

check_diff "Temporal fixed-point Node (Gen 3 vs Gen 4)" "_build_node_gen3" "_build_node_gen4"
check_diff "Temporal fixed-point PHP (Gen 3 vs Gen 4)" "_build_php_gen3" "_build_php_gen4"
check_diff "Temporal fixed-point Python (Gen 3 vs Gen 4)" "_build_py_gen3" "_build_py_gen4"
check_diff "Isomorphic fixed-point (Node Gen 4 vs PHP Gen 4)" "_build_node_gen4" "_build_php_gen4"

log "================================================================"
log "D. TYPESCRIPT VALIDATION"
log "================================================================"
log ""

# Desactivar el trap temporalmente para evitar que el script aborte
# ciegamente si npx tsc falla, garantizando la recolección del output.
trap - ERR
set +e
ts_output=$(npx tsc --noEmit --skipLibCheck --ignoreConfig _build_node_gen4/*.ts 2>&1)
ts_exit=$?
set -e
# Reactivar el trap
trap on_error ERR

log_only "--- TS VALIDATION OUTPUT START ---"
log_only "$ts_output"
log_only "--- TS VALIDATION OUTPUT END ---"

if [ $ts_exit -eq 0 ]; then
    log "  ✅ PASSED: TypeScript Strict Validation (0 Errors)"
else
    log "  ❌ FAILED: TypeScript compilation errors found."
    log ""
    log "  ===== TSC OUTPUT ===== "
    log "$ts_output"
    log "  ====================== "
    log ""
    log "  Full log available at: $LOG_FILE"
    on_error
fi
log ""

# ============================================================================
# E. DEPLOYMENT PROMPT
# ============================================================================

log "================================================================"
log "✅⚡ SUCCESS: NIHIL OBSTAT QUOMINUS GITHUBITUR! 🏛️🚀🎉"
log "All verification steps passed. No issues found that prevent considering this version stable."
log "Senior developer criteria is required to confirm full completeness and approve publication under your responsibility."
log ""
log "****"
log "\"A computer can never be held accountable, therefore a computer must never make a management decision\""
log "– IBM Training Manual, 1979"
log "****"
log "================================================================"
log "The JSOL compiler system is stable and isomorphic."
log ""

# Interactive prompt to deploy
read -p "? Deployment ready. Do you want to overwrite public distributions (jsol-compiler-node, php, ts) with Gen 4? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "  - Deploying isolated distributions to root directories..."

    rm -rf ../jsol-compiler-node ../jsol-compiler-php ../jsol-compiler-ts ../jsol-compiler-py
    mkdir -p ../jsol-compiler-node ../jsol-compiler-php ../jsol-compiler-ts ../jsol-compiler-py

    cp _build_node_gen4/*.js ../jsol-compiler-node/
    cp _build_node_gen4/index.js _build_node_gen4/targets.json ../jsol-compiler-node/
    cp -r _build_node_gen4/dist ../jsol-compiler-node/

    cp _build_php_gen4/*.php ../jsol-compiler-php/
    cp _build_php_gen4/index.php _build_php_gen4/index_ui.php  _build_php_gen4/targets.json ../jsol-compiler-php/
    cp -r _build_php_gen4/dist ../jsol-compiler-php/

    cp _build_node_gen4/*.ts ../jsol-compiler-ts/
    cp _build_node_gen4/targets.json ../jsol-compiler-ts/
    cp -r _build_node_gen4/dist ../jsol-compiler-ts/

    cp _build_py_gen4/*.py ../jsol-compiler-py/
    cp _build_py_gen4/index.py ../jsol-compiler-py/
    cp _build_py_gen4/targets.json ../jsol-compiler-py/
    cp -r _build_py_gen4/dist ../jsol-compiler-py/

    log "  ✅ PASSED: Deployment successful."
else
    log "  - Deployment skipped by user. Distributions remain unchanged."
fi

# Cleanup
rm -rf _seed_engine _build_node_gen3 _build_php_gen3 _build_node_gen4 _build_php_gen4 _build_py_gen3 _build_py_gen4

log ""
log "Full log saved to: $LOG_FILE"
log "Completed: $(date)"
log "================================================================"