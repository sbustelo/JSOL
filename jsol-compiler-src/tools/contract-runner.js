/**
 * JSOL Isomorphic Contract Runner
 * Parses @contract blocks, compiles to JS/PHP/TS, transpiles TS, executes all three, and asserts parity.
 */

const fs = require('fs');
const path = require('path');
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

console.log(`\n📄 [RUNNING] ${fileName}`);

const sourceCode = fs.readFileSync(sourceFile, 'utf8');

// 1. Parse @contract metadata
const contractMatch = sourceCode.match(/\/\*\*[\s\*]*@contract\s*\n([\s\S]*?)\*\//);
if (!contractMatch) {
    console.log(`  ⏩ [SKIP] No @contract block found.`);
    process.exit(0);
}

let contractData;
try {
    const jsonStr = contractMatch[1].replace(/^\s*\*\s?/gm, '');
    contractData = JSON.parse(jsonStr);
} catch (e) {
    console.error(`  ❌ [FATAL] Invalid JSON in @contract block.`);
    process.exit(1);
}

if (!contractData.cases || contractData.cases.length === 0) {
    console.log(`  ⏩ [SKIP] Empty contract cases.`);
    process.exit(0);
}

// 2. Smart Function Signature Resolution
const sigMatches = [...sourceCode.matchAll(/const\s+(\$[a-zA-Z0-9_]+)\s*=\s*function\s*\(([^)]*)\)/g)];
if (!sigMatches || sigMatches.length === 0) {
    console.error(`  ❌ [FATAL] Could not parse function signature.`);
    process.exit(1);
}

const firstCase = contractData.cases[0] || {};
const inKeys = firstCase.in ? Object.keys(firstCase.in) : Object.keys(firstCase);
const contractKeys = inKeys.filter(k => k !== 'expect').map(k => k.startsWith('$') ? k : `$${k}`);

let selectedSig = sigMatches[sigMatches.length - 1]; // Default to main function (typically last)

for (const match of sigMatches) {
    const fnParams = match[2].split(',').map(s => s.trim()).filter(Boolean);
    if (fnParams.length > 0 && fnParams.every(p => contractKeys.includes(p))) {
        selectedSig = match;
        break;
    }
}

const funcName = selectedSig[1];
const params = selectedSig[2].split(',').map(s => s.trim()).filter(Boolean);

// 3. Setup temporary execution sandbox
const basename = path.basename(sourceFile, '.jsol.js');
const rootDir = path.resolve(__dirname, '../..');
const nodeCompilerPath = path.join(rootDir, 'jsol-compiler-node', 'index.js');
const phpCompilerPath = path.join(rootDir, 'jsol-compiler-php', 'index.php');

if (!fs.existsSync(nodeCompilerPath) || !fs.existsSync(phpCompilerPath)) {
	console.error("  ❌ [FATAL] Local compilers not found. Run bootstrapping first.");
	process.exit(1);
}

// 3B. Load JSOL Node Standard Library into Global Scope
const stdlibNodePath = path.join(rootDir, 'jsol-compiler-node', 'dist', 'stdlib', 'jsol-core.js');
if (fs.existsSync(stdlibNodePath)) {
	require(stdlibNodePath);
} else {
	console.error(`  ❌ [FATAL] JSOL Node Stdlib not found at: ${stdlibNodePath}`);
	process.exit(1);
}

const outBase = path.join(rootDir, '_test_bin', basename);
if (fs.existsSync(outBase)) fs.rmSync(outBase, { recursive: true, force: true });
const phpDir = path.join(outBase, 'php');
const pyDir = path.join(outBase, 'py');
fs.mkdirSync(path.join(outBase, 'js'), { recursive: true });
fs.mkdirSync(phpDir, { recursive: true });
fs.mkdirSync(path.join(outBase, 'ts'), { recursive: true });
fs.mkdirSync(pyDir, { recursive: true });

const jsExportSuffix = `; module.exports = { ${funcName}: ${funcName} };`;
const tsExportSuffix = `; declare var module: any; module.exports = { ${funcName}: ${funcName} };`;

const spawnOpts = { timeout: 10000, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' };

// 4. Compile JS Target
const resJS = spawnSync('node', [
    nodeCompilerPath, `--source=${sourceFile}`, `--out-dir=${path.join(outBase, 'js')}`, 
    `--targets=js`, `--js-suffix=${jsExportSuffix}`
], spawnOpts);
if (resJS.error && resJS.error.code === 'ETIMEDOUT') {
    console.error("  ❌ [BUILD:JS] Timed out after 10s.");
    process.exit(1);
}
if (resJS.status !== 0) {
    console.error("  ❌ [BUILD:JS] Failed:\n", resJS.stderr || resJS.stdout);
    process.exit(1);
}

// 5. Compile PHP Target
const resPHP = spawnSync('php', [
    phpCompilerPath, `--source=${sourceFile}`, `--out-dir=${phpDir}`, `--targets=php`
], { ...spawnOpts, cwd: phpDir });
if (resPHP.error && resPHP.error.code === 'ETIMEDOUT') {
    console.error("  ❌ [BUILD:PHP] Timed out after 10s.");
    process.exit(1);
}
if (resPHP.status !== 0) {
    console.error("  ❌ [BUILD:PHP] Failed:\n", resPHP.stderr || resPHP.stdout);
    process.exit(1);
}

// 6. Compile TS Target & Transpile to JS
const resTS = spawnSync('node', [
    nodeCompilerPath, `--source=${sourceFile}`, `--out-dir=${path.join(outBase, 'ts')}`, 
    `--targets=ts`, `--ts-suffix=${tsExportSuffix}`
], spawnOpts);
if (resTS.error && resTS.error.code === 'ETIMEDOUT') {
    console.error("  ❌ [BUILD:TS] Timed out after 10s.");
    process.exit(1);
}
if (resTS.status !== 0) {
    console.error("  ❌ [BUILD:TS] Failed:\n", resTS.stderr || resTS.stdout);
    process.exit(1);
}

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const resTsc = spawnSync(npxCmd, [
    'tsc', '--ignoreConfig', path.join(outBase, 'ts', `${basename}.ts`), 
    '--target', 'ES2022', '--module', 'CommonJS'
], spawnOpts);
if (resTsc.error && resTsc.error.code === 'ETIMEDOUT') {
    console.error("  ❌ [TRANSPILE:TS] Timed out after 10s.");
    process.exit(1);
}

if (resTsc.status !== 0) {
    console.error("  ❌ [TRANSPILE:TS] Failed:\n", resTsc.stdout || resTsc.stderr);
    process.exit(1);
}

const resPY = spawnSync('node', [
    nodeCompilerPath, `--source=${sourceFile}`, `--out-dir=${pyDir}`, 
    `--targets=py`
], spawnOpts);
if (resPY.error && resPY.error.code === 'ETIMEDOUT') {
    console.error("  ❌ [BUILD:PY] Timed out after 10s.");
    process.exit(1);
}
if (resPY.status !== 0) {
    console.error("  ❌ [BUILD:PY] Failed:\n", resPY.stderr || resPY.stdout);
    process.exit(1);
}

const stdlibPyPath = path.join(rootDir, 'jsol-compiler-py', 'dist', 'stdlib', 'jsol_core.py');
if (fs.existsSync(stdlibPyPath)) {
    fs.copyFileSync(stdlibPyPath, path.join(pyDir, 'jsol_core.py'));
}

console.log(`  🛠️  BUILD:  .js 🟢 • .php 🐘 • .ts 🟦 • .py 🐍`);


// 7. Execution and Assertion Loop
const jsMod = require(path.join(outBase, 'js', `${basename}.js`));
const tsMod = require(path.join(outBase, 'ts', `${basename}.js`));

const stdlibPhpPath = path.join(rootDir, 'jsol-compiler-php', 'dist', 'stdlib', 'jsol-core.php').replace(/\\/g, '/');

for (let i = 0; i < contractData.cases.length; i++) {
    const c = contractData.cases[i];
    const inData = c.in || c;
    const expected = c.expect ? c.expect._result : undefined;
    
    const argsArray = params.map(p => inData[p] !== undefined ? inData[p] : null);

    // 7A: Run Node JS
    let jsRes;
    try { jsRes = jsMod[funcName](...argsArray); } 
    catch(e) { console.error(`  ❌ [EXEC:JS] Error in case ${i}:`, e.message); process.exit(1); }

    // 7B: Run Node TS (Transpiled)
    let tsRes;
    try { tsRes = tsMod[funcName](...argsArray); } 
    catch(e) { console.error(`  ❌ [EXEC:TS] Error in case ${i}:`, e.message); process.exit(1); }

    // 7C: Run Native PHP
    const argsJsonPath = path.join(phpDir, 'args.json');
    fs.writeFileSync(argsJsonPath, JSON.stringify(argsArray));
    const phpRunner = `<?php
    declare(strict_types=1);
    require_once '${stdlibPhpPath}';
    require_once __DIR__ . '/${basename}.php';
    $args = json_decode(file_get_contents(__DIR__ . '/args.json'), true);
    echo json_encode(${funcName}(...$args));
    `;
    const runnerPath = path.join(phpDir, 'runner.php');
    fs.writeFileSync(runnerPath, phpRunner);
    
    const phpExe = spawnSync('php', [runnerPath], { cwd: phpDir, timeout: 5000, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
    if (phpExe.error && phpExe.error.code === 'ETIMEDOUT') {
        console.error(`  ❌ [EXEC:PHP] Timed out in case ${i}.`);
        process.exit(1);
    }
    if (phpExe.status !== 0) { 
        console.error(`  ❌ [EXEC:PHP] Error in case ${i}:\n`, phpExe.stderr || phpExe.stdout); 
        process.exit(1); 
    }
    
    let phpRes;
    try { phpRes = JSON.parse(phpExe.stdout.trim()); } 
    catch(e) { console.error(`  ❌ [EXEC:PHP] Return parse error in case ${i}. Got:\n${phpExe.stdout}`); process.exit(1); }

    
	
// 7D: Run Native Python
    const pythonFuncName = funcName.replace(/\$/g, '_');
    const pyDriver = `
import sys, json, importlib.util
spec = importlib.util.spec_from_file_location("${basename}", "${path.join(pyDir, `${basename}.py`).replace(/\\/g, '\\\\')}")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
fn = getattr(mod, "${pythonFuncName}")
args = json.loads(sys.argv[1])
result = fn(*args)
print(json.dumps(result))
`;
    const pyRunnerPath = path.join(pyDir, 'runner.py');
    fs.writeFileSync(pyRunnerPath, pyDriver);
    
    const pyExe = spawnSync('python3', [pyRunnerPath, JSON.stringify(argsArray)], { timeout: 5000, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
    if (pyExe.error && pyExe.error.code === 'ETIMEDOUT') {
        console.error(`  ❌ [EXEC:PY] Timed out in case ${i}.`);
        process.exit(1);
    }
    if (pyExe.status !== 0) { 
        console.error(`  ❌ [EXEC:PY] Error in case ${i}:\n`, pyExe.stderr || pyExe.stdout); 
        process.exit(1); 
    }
    
    let pyRes;
    try { pyRes = JSON.parse(pyExe.stdout.trim()); } 
    catch(e) { console.error(`  ❌ [EXEC:PY] Return parse error in case ${i}. Got:\n${pyExe.stdout}`); process.exit(1); }

    // 7E: Assert Parity
    const jsStr = JSON.stringify(jsRes);
    const tsStr = JSON.stringify(tsRes);
    const phpStr = JSON.stringify(phpRes);
    const pyStr = JSON.stringify(pyRes);

    if (jsStr !== phpStr || jsStr !== tsStr || jsStr !== pyStr) {
        console.error(`\n  ❌ [PARITY FAILURE] Case ${i}`);
        console.error(`       Input:    ${JSON.stringify(inData)}`);
        console.error(`       JS says:  ${jsStr}`);
        console.error(`       PHP says: ${phpStr}`);
        console.error(`       TS says:  ${tsStr}`);
        console.error(`       PY says:  ${pyStr}\n`);
        process.exit(1);
    }


    if (expected !== undefined) {
        const expStr = JSON.stringify(expected);
        if (jsStr !== expStr) {
            console.error(`\n  ❌ [CONTRACT FAILURE] Case ${i}`);
            console.error(`       Input:    ${JSON.stringify(inData)}`);
            console.error(`       Expected: ${expStr}`);
            console.error(`       Actual:   ${jsStr}\n`);
            process.exit(1);
        }
    }
}

console.log(`  ⚡ EXEC:   .js 🟢 • .php 🐘 • .ts 🟦 • .py 🐍 (${contractData.cases.length} case(s) verified)`);
console.log(`  🎉 RESULT: 100% ISOMORPHIC PARITY PASSED`);
process.exit(0);