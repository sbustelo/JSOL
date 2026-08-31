/**
 * JSOL Bootstrapper
 * Generates the SSOT (Single Source of Truth) for the Linter and Dynamic Compiler.
 * Validates 100% strict parity between Domains and Targets (JS, PHP, TS, Python).
 */
const fs = require('fs');
const path = require('path');

console.log("[JSOL Bootstrapper] Starting SSOT generation...");

const rootDir = path.resolve(__dirname, '..');
const domainsDir = path.join(rootDir, 'domains');
const targetsDir = path.join(rootDir, 'targets');
const distDir = path.join(rootDir, 'dist');
const compilerDistDir = path.join(distDir, 'compiler');
const stdlibDistDir = path.join(distDir, 'stdlib');

// 1. Ensure dist/ structure exists
if (!fs.existsSync(compilerDistDir)) fs.mkdirSync(compilerDistDir, { recursive: true });
if (!fs.existsSync(stdlibDistDir)) fs.mkdirSync(stdlibDistDir, { recursive: true });

// 2. Read Domain Axis
const typesPath = path.join(domainsDir, 'core', 'types.json');
const primitivesPath = path.join(domainsDir, 'core', 'primitives.json');

if (!fs.existsSync(typesPath) || !fs.existsSync(primitivesPath)) {
    console.error("FATAL: Domain manifest files missing.");
    process.exit(1);
}

const typesMap = JSON.parse(fs.readFileSync(typesPath, 'utf8'));
const primitivesList = JSON.parse(fs.readFileSync(primitivesPath, 'utf8'));

// 3. Read Target Axis
const jsRulesPath = path.join(targetsDir, 'js', 'rules.json');
const phpRulesPath = path.join(targetsDir, 'php', 'rules.json');
const tsRulesPath = path.join(targetsDir, 'ts', 'rules.json');
const pyRulesPath = path.join(targetsDir, 'python', 'rules.json');

if (!fs.existsSync(jsRulesPath) || !fs.existsSync(phpRulesPath) || !fs.existsSync(tsRulesPath) || !fs.existsSync(pyRulesPath)) {
    console.error("FATAL: Target rules files missing.");
    process.exit(1);
}

const jsRules = JSON.parse(fs.readFileSync(jsRulesPath, 'utf8'));
const phpRules = JSON.parse(fs.readFileSync(phpRulesPath, 'utf8'));
const tsRules = JSON.parse(fs.readFileSync(tsRulesPath, 'utf8'));
const pythonRules = JSON.parse(fs.readFileSync(pyRulesPath, 'utf8'));

// Helper para verificar la presencia de una primitiva tanto en formato Array (Legacy) como en Objeto Operations (V0.2.97)
const hasPrimitive = (rulesObj, prim) => {
    if (Array.isArray(rulesObj)) {
        return rulesObj.some(r => r.id === prim);
    }
    if (rulesObj && rulesObj.operations) {
        return Object.prototype.hasOwnProperty.call(rulesObj.operations, prim);
    }
    return false;
};

// 4. CROSS-VALIDATION GATE
let validationFailed = false;

primitivesList.forEach(prim => {
    const inJs = hasPrimitive(jsRules, prim);
    const inPhp = hasPrimitive(phpRules, prim);
    const inTs = hasPrimitive(tsRules, prim);
    const inPy = hasPrimitive(pythonRules, prim);

    if (!inJs) { console.error(`[CROSS-VALIDATION ERROR] Primitive '${prim}' lacks a translation rule in JS target.`); validationFailed = true; }
    if (!inPhp) { console.error(`[CROSS-VALIDATION ERROR] Primitive '${prim}' lacks a translation rule in PHP target.`); validationFailed = true; }
    if (!inTs) { console.error(`[CROSS-VALIDATION ERROR] Primitive '${prim}' lacks a translation rule in TS target.`); validationFailed = true; }
    if (!inPy) { console.error(`[CROSS-VALIDATION ERROR] Primitive '${prim}' lacks a translation rule in Python target.`); validationFailed = true; }
});

if (validationFailed) {
    console.error("\n[FATAL] Cross-Validation Gate Failed. Asymmetrical targets detected. ABORTING.");
    process.exit(1);
}

console.log("[JSOL Bootstrapper] Cross-Validation Passed: 100% parity across targets.");

// 5. Assemble and export SSOT
const ssoT = {
    version: "0.2.97",
    types: typesMap,
    primitives: primitivesList,
    targets: {
        js: jsRules,
        php: phpRules,
        ts: tsRules,
        python: pythonRules
    }
};

const ssotDestPath = path.join(compilerDistDir, 'jsol-spec.json');
fs.writeFileSync(ssotDestPath, JSON.stringify(ssoT, null, 2), 'utf8');
console.log(`[JSOL Bootstrapper] Compiled SSOT written to ${ssotDestPath}`);

// 6. Copy Polyfills for Native Interpreter
const jsPolyfillSrc = path.join(domainsDir, 'core', 'polyfills.js');
const phpPolyfillSrc = path.join(domainsDir, 'core', 'polyfills.php');
const pyPolyfillSrc = path.join(domainsDir, 'core', 'polyfills.py');
const jsPolyfillDest = path.join(stdlibDistDir, 'jsol-core.js');
const phpPolyfillDest = path.join(stdlibDistDir, 'jsol-core.php');
const pyPolyfillDest = path.join(stdlibDistDir, 'jsol_core.py');

fs.copyFileSync(jsPolyfillSrc, jsPolyfillDest);
fs.copyFileSync(phpPolyfillSrc, phpPolyfillDest);
if (fs.existsSync(pyPolyfillSrc)) {
    fs.copyFileSync(pyPolyfillSrc, pyPolyfillDest);
}
console.log(`[JSOL Bootstrapper] Native Polyfills copied to dist/stdlib/`);