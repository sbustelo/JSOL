/**
 * JSOL Isomorphic Contract Runner (Batch Mode v0.2.96)
 * Parses @contract blocks from a directory, stages them in a flat folder, 
 * compiles EVERYTHING in a single pass, transpiles TS safely, and asserts parity.
 *
 * COMMAND LINE ARGUMENTS:
 * 
 * --source=[path]      : Path to a specific .jsol or .jsol.js file to execute.
 *                        Example: --source='../examples/01-basics/digit-sum.jsol.js'
 * 
 * --source-dir=[path]  : Path to a directory. Scans recursively for all .jsol/.jsol.js files
 *                        excluding those starting with an underscore (_).
 *                        Example: --source-dir='../examples'
 * 
 * --no-bail            : Prevents the runner from aborting immediately upon encountering 
 *                        a failed test case or execution error. Accumulates all errors 
 *                        and reports them at the end.
 *                        Example: --no-bail
 * 
 * --filter=[string]    : Filters the execution to only run files whose basename includes
 *                        the specified string. Case-sensitive.
 *                        Example: --filter='Math'
 *
 * WORKFLOW:
 * 1. Staging: Copies relevant files to _test_bin/staging_src.
 * 2. Compilation: Uses the local jsol-compiler-node to compile to JS, PHP, TS, and PY.
 * 3. Transpilation: Compiles TS files to JS via tsc in an isolated sandbox.
 * 4. Execution Loop: Evaluates the @contract inputs across all 4 runtimes.
 * 5. Assertion: Validates 100% isomorphic parity (JS === PHP === TS === PY) and 
 *    correctness against the optional 'expect' field.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
let sourceDir = '';
let sourceFile = '';
let bailOnError = true;
let filterString = '';

args.forEach(a => {
    if (a.startsWith('--source=')) sourceFile = a.substring(9).replace(/^["']|["']$/g, '');
    if (a.startsWith('--source-dir=')) sourceDir = a.substring(13).replace(/^["']|["']$/g, '');
    if (a === '--no-bail') bailOnError = false;
    if (a.startsWith('--filter=')) filterString = a.substring(9).replace(/^["']|["']$/g, '');
});



let files = [];
if (sourceDir) {
    const resolvedDir = path.resolve(sourceDir);
    if (fs.existsSync(resolvedDir)) {
        const walkSync = function(dir, filelist) {
            const _files = fs.readdirSync(dir);
            filelist = filelist || [];
            _files.forEach(function(file) {
                if (fs.statSync(path.join(dir, file)).isDirectory()) {
                    filelist = walkSync(path.join(dir, file), filelist);
                } else if ((file.endsWith('.jsol') || file.endsWith('.jsol.js')) && !file.startsWith('_')) {
                    filelist.push(path.join(dir, file));
                }
            });
            return filelist;
        };
        files = walkSync(resolvedDir);
    } else {
        console.error(`❌ FATAL: Source directory does not exist. (Tried to resolve: '${resolvedDir}')`);
        process.exit(1);
    }
} else if (sourceFile) {
    const resolvedFile = path.resolve(sourceFile);
    if (fs.existsSync(resolvedFile)) {
        files = [resolvedFile];
    } else {
        console.error(`❌ FATAL: Source file does not exist. (Tried to resolve: '${resolvedFile}')`);
        process.exit(1);
    }
} else {
    console.error("❌ FATAL: Missing source arguments. Use --source=... or --source-dir=...");
    process.exit(1);
}


// 1. Setup Build Environment & Staging Area
const rootDir = path.resolve(__dirname, '../..');
const outBase = path.join(rootDir, '_test_bin');
if (fs.existsSync(outBase)) fs.rmSync(outBase, { recursive: true, force: true });

const stagingSrc = path.join(outBase, 'staging_src');
const outJs = path.join(outBase, 'js');
const outPhp = path.join(outBase, 'php');
const outTs = path.join(outBase, 'ts');
const outTsOut = path.join(outBase, 'ts_out');
const outPy = path.join(outBase, 'py');

[stagingSrc, outJs, outPhp, outTs, outTsOut, outPy].forEach(d => fs.mkdirSync(d, { recursive: true }));

// 2. Scan metadata and stage files
const tests = [];
for (const file of files) {
    const sourceCode = fs.readFileSync(file, 'utf8');
    const contractMatch = sourceCode.match(/\/\*\*[\s\*]*@contract\s*\n([\s\S]*?)\*\//);
    if (!contractMatch) continue;

    let contractData;
    try {
        contractData = JSON.parse(contractMatch[1].replace(/^\s*\*\s?/gm, ''));
    } catch (e) {
        console.error(`  ❌ [FATAL] Invalid JSON in @contract block for ${file}.`);
        process.exit(1);
    }

    if (!contractData.cases || contractData.cases.length === 0) continue;

    const sigMatches = [...sourceCode.matchAll(/const\s+(\$[a-zA-Z0-9_]+)\s*=\s*function\s*\(([^)]*)\)/g)];
    if (!sigMatches || sigMatches.length === 0) continue;

    const firstCase = contractData.cases[0] || {};
    const inKeys = firstCase.in ? Object.keys(firstCase.in) : Object.keys(firstCase);
    const contractKeys = inKeys.filter(k => k !== 'expect').map(k => k.startsWith('$') ? k : `$${k}`);

    let selectedSig = sigMatches[sigMatches.length - 1]; 
    for (const match of sigMatches) {
        const fnParams = match[2].split(',').map(s => s.trim()).filter(Boolean);
        if (fnParams.length > 0 && fnParams.every(p => contractKeys.includes(p))) {
            selectedSig = match;
            break;
        }
    }

    const stagedFileName = path.basename(file);
    
    // Filtro por nombre
    if (filterString && !stagedFileName.includes(filterString)) continue;

    const stagedPath = path.join(stagingSrc, stagedFileName);
    fs.copyFileSync(file, stagedPath);

    tests.push({
        file: stagedPath,
        basename: stagedFileName.replace(/\.jsol(\.js)?$/, ''),
        funcName: selectedSig[1],
        params: selectedSig[2].split(',').map(s => s.trim()).filter(Boolean),
        cases: contractData.cases
    });
}

if (tests.length === 0) {
    console.log(`  ⏩ [SKIP] No @contract blocks found to execute.`);
    process.exit(0);
}

console.log(`\n  🚀 Found ${tests.length} file(s) with contracts. Launching batch compiler...`);

const nodeCompilerPath = path.join(rootDir, 'jsol-compiler-node', 'index.js');
if (!fs.existsSync(nodeCompilerPath)) {
    console.error("  ❌ [FATAL] Local compilers not found. Run bootstrapping first.");
    process.exit(1);
}

const stdlibNodePath = path.join(rootDir, 'jsol-compiler-node', 'dist', 'stdlib', 'jsol-core.js');
if (fs.existsSync(stdlibNodePath)) { require(stdlibNodePath); }

const spawnOpts = { timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' };

// 3. Batch Compile from Staging Directory
const targets = [
    { id: 'js', dir: outJs },
    { id: 'php', dir: outPhp },
    { id: 'ts', dir: outTs },
    { id: 'py', dir: outPy }
];

for (const tg of targets) {
    const res = spawnSync('node', [
        nodeCompilerPath,
        `--source-dir=${stagingSrc}`,
        `--out-dir=${tg.dir}`,
        `--targets=${tg.id}`
    ], spawnOpts);
    if (res.status !== 0) {
        console.error(`  ❌ [BUILD:${tg.id.toUpperCase()}] Failed (Status: ${res.status}, Signal: ${res.signal}):\n`, res.stderr || res.stdout);
        if (res.error) console.error("  ❌ [SYSTEM ERROR]:", res.error);
        process.exit(1);
    }
}

// 4. Post-process modules (Export injections for JS & TS)
const tsFilesToCompile = [];
for (const t of tests) {
    const jsPath = path.join(outJs, `${t.basename}.js`);
    const tsPath = path.join(outTs, `${t.basename}.ts`);
    if (fs.existsSync(jsPath)) {
        fs.appendFileSync(jsPath, `\nmodule.exports = { ${t.funcName}: ${t.funcName} };`);
    }
    if (fs.existsSync(tsPath)) {
        fs.appendFileSync(tsPath, `\nexport { ${t.funcName} };\n`);
        tsFilesToCompile.push(tsPath.replace(/\\/g, '/'));
    }
}

// 5. Batch Transpile TS (Isolated Sandbox)
const tsConfig = {
    compilerOptions: {
        target: "ES2022",
        module: "CommonJS",
        rootDir: outTs.replace(/\\/g, '/'),
        outDir: outTsOut.replace(/\\/g, '/'),
        skipLibCheck: true,
        strict: false
    },
    files: tsFilesToCompile
};
const tsConfigPath = path.join(outBase, 'tsconfig-test.json');
fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2), 'utf8');

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const resTsc = spawnSync(npxCmd, [
    'tsc', '--project', tsConfigPath
], spawnOpts);

if (resTsc.status !== 0) {
    console.error("  ❌ [TRANSPILE:TS] Failed:\n", resTsc.stdout || resTsc.stderr);
    process.exit(1);
}

// 6. Setup Python Env
const stdlibPyPath = path.join(rootDir, 'jsol-compiler-py', 'dist', 'stdlib', 'jsol_core.py');
if (fs.existsSync(stdlibPyPath)) fs.copyFileSync(stdlibPyPath, path.join(outPy, 'jsol_core.py'));

const stdlibPhpPath = path.join(rootDir, 'jsol-compiler-php', 'dist', 'stdlib', 'jsol-core.php').replace(/\\/g, '/');

console.log(`  🛠️  BATCH BUILD: .js 🟢 • .php 🐘 • .ts 🟦 • .py 🐍`);
console.log(`  ⚡ EXECUTING CONTRACTS...`);

// 7. Execution Loop
let totalCases = 0;
let failedCases = 0;

const handleError = (msg) => {
    console.error(msg);
    failedCases++;
    if (bailOnError) process.exit(1);
};

for (const t of tests) {
    console.log(`\n📄 [VERIFYING] ${t.basename}`);
    const jsMod = require(path.join(outJs, `${t.basename}.js`));
    const tsMod = require(path.join(outTsOut, `${t.basename}.js`));

    for (let i = 0; i < t.cases.length; i++) {
        const c = t.cases[i];
        const inData = c.in || c;
        const expected = c.expect ? c.expect._result : undefined;
        const argsArray = t.params.map(p => inData[p] !== undefined ? inData[p] : null);

        const getArgs = () => JSON.parse(JSON.stringify(t.params.map(p => inData[p] !== undefined ? inData[p] : null)));

        // Run JS
        let jsRes; 
        try { jsRes = jsMod[t.funcName](...getArgs()); } 
        catch(e) { handleError(`  ❌ [EXEC:JS] Error in case ${i}: ${e.message}`); continue; }

        // Run TS
        let tsRes; 
        try { tsRes = tsMod[t.funcName](...getArgs()); } 
        catch(e) { handleError(`  ❌ [EXEC:TS] Error in case ${i}: ${e.message}`); continue; }

        // Run PHP
        const phpArgs = getArgs();
        const argsJsonPath = path.join(outPhp, 'args.json');
        fs.writeFileSync(argsJsonPath, JSON.stringify(phpArgs));
        const phpRunner = `<?php
        declare(strict_types=1);
        require_once '${stdlibPhpPath}';
        require_once __DIR__ . '/${t.basename}.php';
        \$args = json_decode(file_get_contents(__DIR__ . '/args.json'), true);
        echo json_encode(${t.funcName}(...\$args));`;
        const runnerPath = path.join(outPhp, 'runner.php');
        fs.writeFileSync(runnerPath, phpRunner);
        
        const phpExe = spawnSync('php', [runnerPath], { cwd: outPhp, timeout: 5000, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
        if (phpExe.error && phpExe.error.code === 'ETIMEDOUT') { handleError(`  ❌ [EXEC:PHP] Timed out.`); continue; }
        if (phpExe.status !== 0) { handleError(`  ❌ [EXEC:PHP] Error:\n${phpExe.stderr || phpExe.stdout}`); continue; }
        let phpRes; try { phpRes = JSON.parse(phpExe.stdout.trim()); } catch(e) { handleError(`  ❌ [EXEC:PHP] Parse error.\n${phpExe.stdout}`); continue; }

        // Run PY
        const pythonFuncName = t.funcName.replace(/\$/g, '');
        const pyDriver = `
import sys, json, importlib.util
spec = importlib.util.spec_from_file_location("${t.basename}", "${path.join(outPy, `${t.basename}.py`).replace(/\\/g, '\\\\')}")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
fn = getattr(mod, "${pythonFuncName}")
args = json.loads(sys.argv[1])
result = fn(*args)
print(json.dumps(result))
`;
        const pyRunnerPath = path.join(outPy, 'runner.py');
        fs.writeFileSync(pyRunnerPath, pyDriver);
        
		const pyExe = spawnSync('python3', [pyRunnerPath, JSON.stringify(getArgs())], { cwd: outPy, timeout: 5000, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
        if (pyExe.error && pyExe.error.code === 'ETIMEDOUT') { handleError(`  ❌ [EXEC:PY] Timed out.`); continue; }
        if (pyExe.status !== 0) { handleError(`  ❌ [EXEC:PY] Error:\n${pyExe.stderr || pyExe.stdout}`); continue; }
        let pyRes; try { pyRes = JSON.parse(pyExe.stdout.trim()); } catch(e) { handleError(`  ❌ [EXEC:PY] Parse error.\n${pyExe.stdout}`); continue; }

        // Assert Parity
        const jsStr = JSON.stringify(jsRes);
        const tsStr = JSON.stringify(tsRes);
        const phpStr = JSON.stringify(phpRes);
        const pyStr = JSON.stringify(pyRes);

        if (jsStr !== phpStr || jsStr !== tsStr || jsStr !== pyStr) {
            handleError(`\n  ❌ [PARITY FAILURE] Case ${i}\n       Input:    ${JSON.stringify(inData)}\n       JS says:  ${jsStr}\n       PHP says: ${phpStr}\n       TS says:  ${tsStr}\n       PY says:  ${pyStr}\n`);
            continue;
        }

        if (expected !== undefined) {
            const expStr = JSON.stringify(expected);
            if (jsStr !== expStr) {
                handleError(`\n  ❌ [CONTRACT FAILURE] Case ${i}\n       Input:    ${JSON.stringify(inData)}\n       Expected: ${expStr}\n       Actual:   ${jsStr}\n`);
                continue;
            }
        }
        totalCases++;
    }
}

if (failedCases > 0) {
    console.error(`\n  ❌ RESULT: ${failedCases} case(s) failed. ${totalCases} passed.`);
    process.exit(1);
}

console.log(`\n  🎉 RESULT: ${totalCases} test case(s) verified across ${tests.length} file(s). 100% ISOMORPHIC PARITY PASSED.`);
process.exit(0);