/* PATH: tools/contract-runner.js */
/* REEMPLAZAR ARCHIVO COMPLETO */
/**
 * JSOL Isomorphic Contract Runner (Batch Mode v0.2.96)
 * Parses @contract blocks from a directory, stages them in a flat folder, 
 * compiles EVERYTHING in a single pass, transpiles TS safely, and asserts parity.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
let sourceDir = '';
let sourceFile = '';

args.forEach(a => {
    if (a.startsWith('--source=')) sourceFile = a.substring(9).replace(/^["']|["']$/g, '');
    if (a.startsWith('--source-dir=')) sourceDir = a.substring(13).replace(/^["']|["']$/g, '');
});

let files = [];
if (sourceDir && fs.existsSync(sourceDir)) {
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
    files = walkSync(sourceDir);
} else if (sourceFile && fs.existsSync(sourceFile)) {
    files = [path.resolve(sourceFile)];
} else {
    console.error("❌ FATAL: Missing or invalid source arguments.");
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

const spawnOpts = { timeout: 30000, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' };

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
        console.error(`  ❌ [BUILD:${tg.id.toUpperCase()}] Failed:\n`, res.stderr || res.stdout);
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

for (const t of tests) {
    console.log(`\n📄 [VERIFYING] ${t.basename}`);
    const jsMod = require(path.join(outJs, `${t.basename}.js`));
    const tsMod = require(path.join(outTsOut, `${t.basename}.js`));

    for (let i = 0; i < t.cases.length; i++) {
        const c = t.cases[i];
        const inData = c.in || c;
        const expected = c.expect ? c.expect._result : undefined;
        const argsArray = t.params.map(p => inData[p] !== undefined ? inData[p] : null);

        // Run JS
        let jsRes; 
        try { jsRes = jsMod[t.funcName](...argsArray); } 
        catch(e) { console.error(`  ❌ [EXEC:JS] Error in case ${i}:`, e.message); process.exit(1); }

        // Run TS
        let tsRes; 
        try { tsRes = tsMod[t.funcName](...argsArray); } 
        catch(e) { console.error(`  ❌ [EXEC:TS] Error in case ${i}:`, e.message); process.exit(1); }

        // Run PHP
        const argsJsonPath = path.join(outPhp, 'args.json');
        fs.writeFileSync(argsJsonPath, JSON.stringify(argsArray));
        const phpRunner = `<?php
        declare(strict_types=1);
        require_once '${stdlibPhpPath}';
        require_once __DIR__ . '/${t.basename}.php';
        \$args = json_decode(file_get_contents(__DIR__ . '/args.json'), true);
        echo json_encode(${t.funcName}(...\$args));`;
        const runnerPath = path.join(outPhp, 'runner.php');
        fs.writeFileSync(runnerPath, phpRunner);
        
        const phpExe = spawnSync('php', [runnerPath], { cwd: outPhp, timeout: 5000, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
        if (phpExe.error && phpExe.error.code === 'ETIMEDOUT') { console.error(`  ❌ [EXEC:PHP] Timed out.`); process.exit(1); }
        if (phpExe.status !== 0) { console.error(`  ❌ [EXEC:PHP] Error:\n`, phpExe.stderr || phpExe.stdout); process.exit(1); }
        let phpRes; try { phpRes = JSON.parse(phpExe.stdout.trim()); } catch(e) { console.error(`  ❌ [EXEC:PHP] Parse error.\n${phpExe.stdout}`); process.exit(1); }

        // Run PY
        // FIX: El compilador de Python ELIMINA el $, NO LO REEMPLAZA POR _
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
        
        const pyExe = spawnSync('python3', [pyRunnerPath, JSON.stringify(argsArray)], { cwd: outPy, timeout: 5000, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
        if (pyExe.error && pyExe.error.code === 'ETIMEDOUT') { console.error(`  ❌ [EXEC:PY] Timed out.`); process.exit(1); }
        if (pyExe.status !== 0) { console.error(`  ❌ [EXEC:PY] Error:\n`, pyExe.stderr || pyExe.stdout); process.exit(1); }
        let pyRes; try { pyRes = JSON.parse(pyExe.stdout.trim()); } catch(e) { console.error(`  ❌ [EXEC:PY] Parse error.\n${pyExe.stdout}`); process.exit(1); }

        // Assert Parity
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
        totalCases++;
    }
}

console.log(`\n  🎉 RESULT: ${totalCases} test case(s) verified across ${tests.length} file(s). 100% ISOMORPHIC PARITY PASSED.`);
process.exit(0);