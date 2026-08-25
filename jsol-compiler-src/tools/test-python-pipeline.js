/* PATH: tools/test-python-pipeline.js */
/* REEMPLAZAR ARCHIVO COMPLETO */
/**
 * JSOL Python Pipeline — Standalone Validator v0.2.96
 *
 * Chains the 5 not-yet-wired Python passes by hand, exactly in the order
 * they'd run inside $mExecuteCompilationPipeline once integrated.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
let sourceFile = '';
args.forEach(a => {
    if (a.startsWith('--source=')) {
        sourceFile = a.substring(9).replace(/^["']|["']$/g, '');
    }
});
if (!sourceFile || !fs.existsSync(sourceFile)) {
    console.error(`❌ FATAL: Missing or invalid --source argument: "${sourceFile}"`);
    process.exit(1);
}
sourceFile = path.resolve(sourceFile);
const fileName = path.basename(sourceFile);
const basename = path.basename(sourceFile, '.jsol.js');

console.log(`\n📄 [PYTHON PIPELINE TEST] ${fileName}`);

const srcRoot = path.resolve(__dirname, '..');
const distRoot = path.resolve(__dirname, '../..');

// --- 1. Compile the trusted JS baseline with the REAL deployed compiler ---
const nodeCompilerPath = path.join(distRoot, 'jsol-compiler-node', 'index.js');
if (!fs.existsSync(nodeCompilerPath)) {
    console.error(`❌ FATAL: ${nodeCompilerPath} not found. Run the build pipeline first.`);
    process.exit(1);
}
const outBase = path.join(distRoot, '_python_test_bin', basename);
if (fs.existsSync(outBase)) fs.rmSync(outBase, { recursive: true, force: true });
fs.mkdirSync(outBase, { recursive: true });

const rawSource = fs.readFileSync(sourceFile, 'utf8');
const earlyContractMatch = rawSource.match(/\/\*\*[\s\*]*@contract\s*\n([\s\S]*?)\*\//);
let parsedCases = [];
if (earlyContractMatch) {
    try {
        const jsonStr = earlyContractMatch[1].replace(/^\s*\*\s?/gm, '');
        parsedCases = JSON.parse(jsonStr).cases || [];
    } catch (e) {}
}

const sigMatches = [...rawSource.matchAll(/const\s+(\$[a-zA-Z0-9_]+)\s*=\s*function\s*\(([^)]*)\)/g)];
if (!sigMatches || sigMatches.length === 0) {
    console.error(`❌ FATAL: Could not parse function signature from ${fileName}.`);
    process.exit(1);
}

let selectedSig = sigMatches[sigMatches.length - 1]; 
if (parsedCases.length > 0) {
    const firstCase = parsedCases[0] || {};
    const inKeys = firstCase.in ? Object.keys(firstCase.in) : Object.keys(firstCase);
    const contractKeys = inKeys.filter(k => k !== 'expect').map(k => k.startsWith('$') ? k : `$${k}`);

    for (const match of sigMatches) {
        const fnParams = match[2].split(',').map(s => s.trim()).filter(Boolean);
        if (fnParams.length > 0 && fnParams.every(p => contractKeys.includes(p))) {
            selectedSig = match;
            break;
        }
    }
}

const funcName = selectedSig[1];
const params = selectedSig[2].split(',').map(s => s.trim()).filter(Boolean);
const jsExportSuffix = `; module.exports = { ${funcName}: ${funcName} };`;

const resBefore = spawnSync('node', [
    nodeCompilerPath, `--source=${sourceFile}`, `--out-dir=${outBase}`,
    `--targets=js`, `--js-suffix=${jsExportSuffix}`
], { encoding: 'utf8' });
if (resBefore.status !== 0) {
    console.error('❌ [BUILD:JS BASELINE] Failed:\n', resBefore.stderr || resBefore.stdout);
    process.exit(1);
}
const jsMod = require(path.join(outBase, `${basename}.js`));
console.log('  🛠️  JS baseline OK (real, deployed compiler)');

// --- 2. Load the raw, not-yet-wired Python pipeline modules ---
const polyfillPath = path.join(srcRoot, 'dist', 'stdlib', 'jsol-core.js');
require(polyfillPath);

const modulePaths = [
    'lexer.jsol',
    'js-compiler.jsol',
    'python-ternary.jsol',
    'python-compiler.jsol',
    'indenter.jsol',
    'python-brace-strip.jsol'
].map(f => path.join(srcRoot, f));

for (const p of modulePaths) {
    if (!fs.existsSync(p)) {
        console.error(`❌ FATAL: ${p} not found.`);
        process.exit(1);
    }
}

const context = vm.createContext(global);
const rawCode = modulePaths.map(p => fs.readFileSync(p, 'utf8')).join('\n') + `
    global.$mMaskSourceCode = typeof $mMaskSourceCode !== 'undefined' ? $mMaskSourceCode : null;
    global.$sUnmaskSourceCode = typeof $sUnmaskSourceCode !== 'undefined' ? $sUnmaskSourceCode : null;
    global.$sCompileToJS = typeof $sCompileToJS !== 'undefined' ? $sCompileToJS : null;
    global.$sConvertTernaries = typeof $sConvertTernaries !== 'undefined' ? $sConvertTernaries : null;
    global.$sConvertControlFlowToPython = typeof $sConvertControlFlowToPython !== 'undefined' ? $sConvertControlFlowToPython : null;
    global.$sIndentCode = typeof $sIndentCode !== 'undefined' ? $sIndentCode : null;
    global.$sStripPythonBraces = typeof $sStripPythonBraces !== 'undefined' ? $sStripPythonBraces : null;
    global.$aTranslateCommentTokensToPython = typeof $aTranslateCommentTokensToPython !== 'undefined' ? $aTranslateCommentTokensToPython : null;
    global.$sSanitizePythonIdentifiers = typeof $sSanitizePythonIdentifiers !== 'undefined' ? $sSanitizePythonIdentifiers : null;
`;
vm.runInContext(rawCode, context, { filename: 'python-pipeline-test-modules.js' });

const missing = ['$mMaskSourceCode', '$sUnmaskSourceCode', '$sCompileToJS', '$sConvertTernaries',
    '$sConvertControlFlowToPython', '$sIndentCode', '$sStripPythonBraces', '$aTranslateCommentTokensToPython', '$sSanitizePythonIdentifiers'].filter(n => !global[n]);
if (missing.length > 0) {
    console.error(`❌ FATAL: Failed to load: ${missing.join(', ')}`);
    process.exit(1);
}
console.log('  🛠️  Python pipeline modules loaded directly (no compilation needed)');


// --- 3. Run the chain by hand ---
const pythonRulesPath = path.join(srcRoot, 'targets', 'python', 'rules.json');
if (!fs.existsSync(pythonRulesPath)) {
    console.error(`❌ FATAL: ${pythonRulesPath} not found.`);
    process.exit(1);
}
const pythonRules = JSON.parse(fs.readFileSync(pythonRulesPath, 'utf8'));

const sourceCode = fs.readFileSync(sourceFile, 'utf8');
const masked = global.$mMaskSourceCode(sourceCode);
const compiledPy = global.$sCompileToJS(masked.maskedCode, '', '', pythonRules);
const ternaryPass = global.$sConvertTernaries(compiledPy);
const controlFlowPass = global.$sConvertControlFlowToPython(ternaryPass);
const sanitizedPass = global.$sSanitizePythonIdentifiers(controlFlowPass);
const indentedPass = global.$sIndentCode(sanitizedPass, '  ');
const bracesStripped = global.$sStripPythonBraces(indentedPass, '  ');
const translatedTokens = global.$aTranslateCommentTokensToPython(masked.tokens);
const finalPy = global.$sUnmaskSourceCode(bracesStripped, translatedTokens);

const pyOutPath = path.join(outBase, `${basename}.py`);
fs.writeFileSync(pyOutPath, finalPy, 'utf8');
console.log(`  🐍  Python output written: ${pyOutPath}`);


// --- 4. Copy jsol_core.py next to it so the import resolves ---
const jsolCorePyPath = path.join(srcRoot, 'dist', 'stdlib', 'jsol_core.py');
if (!fs.existsSync(jsolCorePyPath)) {
    console.error(`❌ FATAL: ${jsolCorePyPath} not found.`);
    process.exit(1);
}
fs.copyFileSync(jsolCorePyPath, path.join(outBase, 'jsol_core.py'));

// --- 5. Small Python driver: import the module, call the function, print JSON ---
// FIX: El compilador de Python ELIMINA el $, NO LO REEMPLAZA POR _
const pythonFuncName = funcName.replace(/\$/g, '');
const driverPath = path.join(outBase, '_driver.py');
const driverCode = `
import sys, json, importlib.util
spec = importlib.util.spec_from_file_location("${basename}", "${pyOutPath.replace(/\\/g, '\\\\')}")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
fn = getattr(mod, "${pythonFuncName}")
args = json.loads(sys.argv[1])
result = fn(*args)
print(json.dumps(result))
`;
fs.writeFileSync(driverPath, driverCode, 'utf8');

// --- 6. Parse @contract cases and run each through Python vs the JS baseline ---
const contractMatch = sourceCode.match(/\/\*\*[\s\*]*@contract\s*\n([\s\S]*?)\*\//);
if (!contractMatch) {
    console.log('  ⏩ [SKIP] No @contract block found — inspect the .py file manually.');
    process.exit(0);
}
let contractData;
try {
    contractData = JSON.parse(contractMatch[1].replace(/^\s*\*\s?/gm, ''));
} catch (e) {
    console.error('  ❌ [FATAL] Invalid JSON in @contract block.');
    process.exit(1);
}
if (!contractData.cases || contractData.cases.length === 0) {
    console.log('  ⏩ [SKIP] Empty contract cases.');
    process.exit(0);
}

let allPassed = true;
for (let i = 0; i < contractData.cases.length; i++) {
    const c = contractData.cases[i];
    const inData = c.in || c;
    const argsArray = params.map(p => (inData[p] !== undefined ? inData[p] : null));

    let jsRes;
    try {
        jsRes = jsMod[funcName](...argsArray);
    } catch (e) {
        console.error(`  ❌ [EXEC:JS] Error in case ${i}:`, e.message);
        allPassed = false;
        continue;
    }

    const pyRun = spawnSync('python3', [driverPath, JSON.stringify(argsArray)], { encoding: 'utf8' });
    if (pyRun.status !== 0) {
        console.error(`\n  ❌ [EXEC:PYTHON] Case ${i} crashed:`);
        console.error(pyRun.stderr);
        allPassed = false;
        continue;
    }

    let pyRes;
    try {
        pyRes = JSON.parse(pyRun.stdout.trim());
    } catch (e) {
        console.error(`  ❌ [PARSE:PYTHON] Case ${i}: could not parse output: ${pyRun.stdout}`);
        allPassed = false;
        continue;
    }

    if (JSON.stringify(jsRes) !== JSON.stringify(pyRes)) {
        console.error(`\n  ❌ [MISMATCH] Case ${i}`);
        console.error(`       Input:  ${JSON.stringify(inData)}`);
        console.error(`       JS:     ${JSON.stringify(jsRes)}`);
        console.error(`       Python: ${JSON.stringify(pyRes)}\n`);
        allPassed = false;
    }
}

if (allPassed) {
    console.log(`\n  🎉 RESULT: ${contractData.cases.length} case(s) — Python matches JS.\n`);
    process.exit(0);
} else {
    console.error(`\n  ❌ RESULT: Python pipeline has real bugs to fix before moving on.\n`);
    process.exit(1);
}