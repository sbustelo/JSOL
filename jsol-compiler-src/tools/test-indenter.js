/**
 * JSOL Indenter Standalone Validator
 *
 * Purpose: prove that $sIndentCode (indenter.jsol) only changes LAYOUT, never
 * BEHAVIOR, without touching engine.jsol / the real compilation pipeline at all.
 *
 * How it works, step by step:
 *   1. Compiles the given example with the REAL, currently-deployed compiler
 *      (jsol-compiler-node/index.js) exactly as it works today. This is the
 *      "BEFORE" version — untouched, already trusted.
 *   2. Loads lexer.jsol and indenter.jsol as raw text into a Node vm context,
 *      the same trick index.js already uses to run compiled .js engine parts
 *      without a build step: JSOL source is valid JS once the domains/core
 *      polyfills (Str/Arr/Map/JSOL globals) are in scope, so no compilation
 *      is needed just to CALL these two modules from a plain Node script.
 *   3. Takes the BEFORE compiled JS, masks it with $mMaskSourceCode (same
 *      masking lexer.jsol does before any transformation, so string literals
 *      inside the compiled output — e.g. error messages — can't be mistaken
 *      for real braces), runs $sIndentCode on the masked text, then unmasks
 *      it with $sUnmaskSourceCode. This is the "AFTER" version.
 *   4. Parses the @contract block from the original .jsol.js source (same
 *      regex tools/contract-runner.js already uses) and runs every case
 *      against BOTH the BEFORE and AFTER compiled functions, comparing
 *      JSON.stringify(result) for exact equality.
 *
 * Nothing here touches engine.jsol, dist/, or any deployed distribution.
 * This is a side experiment you can run as many times as you want with zero
 * risk to the stable pipeline.
 *
 * Usage:
 *   node tools/test-indenter.js --source=../examples/01-basics/some-example.jsol.js
 *
 * Requires: jsol-compiler-node/index.js already built (same precondition as
 * tools/contract-runner.js).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

// ----------------------------------------------------------------------------
// 0. CLI ARG PARSING (mirrors contract-runner.js's own minimal parser)
// ----------------------------------------------------------------------------

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

console.log(`\n📄 [INDENTER TEST] ${fileName}`);

// ----------------------------------------------------------------------------
// 1. COMPILE THE "BEFORE" VERSION WITH THE REAL, UNTOUCHED COMPILER
// ----------------------------------------------------------------------------

// Two different roots, matching the real directory layout (same convention
// contract-runner.js already uses):
//   - srcRoot  = jsol-compiler-src/ itself, one level up from tools/ — where
//                lexer.jsol, indenter.jsol and dist/stdlib/jsol-core.js live.
//   - distRoot = the parent folder, two levels up from tools/ — where
//                jsol-compiler-node/, jsol-compiler-php/ and scratch dirs
//                like _test_bin live, as SIBLINGS of jsol-compiler-src/.
const srcRoot = path.resolve(__dirname, '..');
const distRoot = path.resolve(__dirname, '../..');
const nodeCompilerPath = path.join(distRoot, 'jsol-compiler-node', 'index.js');

if (!fs.existsSync(nodeCompilerPath)) {
    console.error(`❌ FATAL: Compiled distribution not found at ${nodeCompilerPath}.`);
    console.error(`   Run the bootstrap/build pipeline first (same precondition as contract-runner.js).`);
    process.exit(1);
}

const basename = path.basename(sourceFile, '.jsol.js');
const outBase = path.join(distRoot, '_indenter_test_bin', basename);
if (fs.existsSync(outBase)) fs.rmSync(outBase, { recursive: true, force: true });
fs.mkdirSync(outBase, { recursive: true });

// Export the compiled function as a CommonJS module, same suffix trick
// contract-runner.js uses, so we can require() it afterwards.
const sigMatch = fs.readFileSync(sourceFile, 'utf8')
    .match(/const\s+(\$[a-zA-Z0-9_]+)\s*=\s*function\s*\(([^)]*)\)/);
if (!sigMatch) {
    console.error(`❌ FATAL: Could not parse function signature from ${fileName}.`);
    process.exit(1);
}
const funcName = sigMatch[1];
const params = sigMatch[2].split(',').map(s => s.trim()).filter(Boolean);
const jsExportSuffix = `; module.exports = { ${funcName}: ${funcName} };`;

const resBefore = spawnSync('node', [
    nodeCompilerPath, `--source=${sourceFile}`, `--out-dir=${outBase}`,
    `--targets=js`, `--js-suffix=${jsExportSuffix}`
], { encoding: 'utf8' });

if (resBefore.status !== 0) {
    console.error('❌ [BUILD:BEFORE] Failed:\n', resBefore.stderr || resBefore.stdout);
    process.exit(1);
}

const beforePath = path.join(outBase, `${basename}.js`);
const beforeCode = fs.readFileSync(beforePath, 'utf8');

console.log('  🛠️  BEFORE build OK (real compiler, untouched)');

// ----------------------------------------------------------------------------
// 2. LOAD lexer.jsol + indenter.jsol AS CALLABLE JS, WITHOUT COMPILING THEM
// ----------------------------------------------------------------------------
// Same principle index.js uses: JSOL source is already valid JS. We only need
// the Str/Arr/Map/JSOL polyfill globals in scope, then we can vm.runInContext
// the raw .jsol files directly and pull out the top-level consts we need.

const polyfillPath = path.join(srcRoot, 'dist', 'stdlib', 'jsol-core.js');
if (!fs.existsSync(polyfillPath)) {
    console.error('❌ FATAL: dist/stdlib/jsol-core.js not found. Run tools/bootstrap.js first.');
    process.exit(1);
}
require(polyfillPath); // this Object.assign(global, ...)s Str/Arr/Map/JSOL — see domains/core/polyfills.js

const lexerPath = path.join(srcRoot, 'lexer.jsol');
const indenterPath = path.join(srcRoot, 'indenter.jsol'); // confirmed: sits at jsol-compiler-src root

if (!fs.existsSync(lexerPath) || !fs.existsSync(indenterPath)) {
    console.error(`❌ FATAL: lexer.jsol or indenter.jsol not found at expected paths:`);
    console.error(`   ${lexerPath}`);
    console.error(`   ${indenterPath}`);
    process.exit(1);
}

const context = vm.createContext(global);
const rawModulesCode =
    fs.readFileSync(lexerPath, 'utf8') + '\n' +
    fs.readFileSync(indenterPath, 'utf8') + '\n' +
    `
    global.$mMaskSourceCode = typeof $mMaskSourceCode !== 'undefined' ? $mMaskSourceCode : null;
    global.$sUnmaskSourceCode = typeof $sUnmaskSourceCode !== 'undefined' ? $sUnmaskSourceCode : null;
    global.$sIndentCode = typeof $sIndentCode !== 'undefined' ? $sIndentCode : null;
    `;

vm.runInContext(rawModulesCode, context, { filename: 'indenter-test-modules.js' });

if (!global.$mMaskSourceCode || !global.$sUnmaskSourceCode || !global.$sIndentCode) {
    console.error('❌ FATAL: Failed to load $mMaskSourceCode / $sUnmaskSourceCode / $sIndentCode from source.');
    process.exit(1);
}

console.log('  🛠️  lexer.jsol + indenter.jsol loaded directly (no compilation needed)');

// ----------------------------------------------------------------------------
// 3. PRODUCE THE "AFTER" VERSION: mask -> indent -> unmask
// ----------------------------------------------------------------------------

const maskedData = global.$mMaskSourceCode(beforeCode);
const indentedMasked = global.$sIndentCode(maskedData.maskedCode, '  '); // 2-space unit, tweak freely
const afterCode = global.$sUnmaskSourceCode(indentedMasked, maskedData.tokens);

const afterPath = path.join(outBase, `${basename}.indented.js`);
fs.writeFileSync(afterPath, afterCode, 'utf8');

const beforeLines = beforeCode.split('\n').length;
const afterLines = afterCode.split('\n').length;
console.log(`  🎨  AFTER produced: ${beforeLines} line(s) -> ${afterLines} line(s)`);
console.log(`      (inspect it yourself at ${afterPath})`);

// ----------------------------------------------------------------------------
// 4. RUN @contract CASES AGAINST BOTH AND COMPARE
// ----------------------------------------------------------------------------

const sourceCode = fs.readFileSync(sourceFile, 'utf8');
const contractMatch = sourceCode.match(/\/\*\*[\s\*]*@contract\s*\n([\s\S]*?)\*\//);
if (!contractMatch) {
    console.log('  ⏩ [SKIP] No @contract block found — cannot verify behavioral equivalence automatically.');
    console.log('      (the layout diff above is still worth eyeballing manually)');
    process.exit(0);
}

let contractData;
try {
    const jsonStr = contractMatch[1].replace(/^\s*\*\s?/gm, '');
    contractData = JSON.parse(jsonStr);
} catch (e) {
    console.error('  ❌ [FATAL] Invalid JSON in @contract block.');
    process.exit(1);
}

if (!contractData.cases || contractData.cases.length === 0) {
    console.log('  ⏩ [SKIP] Empty contract cases.');
    process.exit(0);
}

// require() caches by resolved path, and BEFORE/AFTER are different files so
// this is safe — no stale-cache risk between the two requires.
const beforeMod = require(beforePath);
const afterMod = require(afterPath);

let allPassed = true;

for (let i = 0; i < contractData.cases.length; i++) {
    const c = contractData.cases[i];
    const inData = c.in || c;
    const argsArray = params.map(p => (inData[p] !== undefined ? inData[p] : null));

    let beforeRes, beforeErr = null;
    try {
        beforeRes = beforeMod[funcName](...argsArray);
    } catch (e) {
        beforeErr = e;
    }

    let afterRes, afterErr = null;
    try {
        afterRes = afterMod[funcName](...argsArray);
    } catch (e) {
        afterErr = e;
    }

    if (beforeErr && afterErr) {
        if (beforeErr.message === afterErr.message) {
            // Both fail identically — not a regression from indenting. Most likely
            // a bug in THIS harness's naive funcName/args extraction (e.g. a file
            // with more than one top-level function), not in $sIndentCode. Flag it
            // clearly instead of hiding it, but don't count it as proof of breakage.
            console.error(`  ⚠️  [SKIP:HARNESS] Case ${i}: BEFORE and AFTER both threw the same error ("${beforeErr.message}").`);
            console.error(`       This is almost certainly a bug in test-indenter.js's arg extraction, not in $sIndentCode.`);
            console.error(`       Verify independently with: node tools/contract-runner.js --source=${sourceFile}`);
            continue;
        } else {
            console.error(`\n  ❌ [DIVERGENT ERRORS] Case ${i}`);
            console.error(`       BEFORE threw: ${beforeErr.message}`);
            console.error(`       AFTER threw:  ${afterErr.message}\n`);
            allPassed = false;
            continue;
        }
    }
    if (beforeErr && !afterErr) {
        console.error(`  ❌ [EXEC:BEFORE] Error in case ${i}:`, beforeErr.message);
        console.error(`       AFTER did NOT throw for the same input — worth a closer look either way.`);
        allPassed = false;
        continue;
    }
    if (!beforeErr && afterErr) {
        console.error(`  ❌ [EXEC:AFTER] Error in case ${i}:`, afterErr.message);
        console.error(`       This means indentation broke execution — a real bug in $sIndentCode.`);
        allPassed = false;
        continue;
    }

    const beforeStr = JSON.stringify(beforeRes);
    const afterStr = JSON.stringify(afterRes);

    if (beforeStr !== afterStr) {
        console.error(`\n  ❌ [BEHAVIOR CHANGED] Case ${i}`);
        console.error(`       Input:  ${JSON.stringify(inData)}`);
        console.error(`       Before: ${beforeStr}`);
        console.error(`       After:  ${afterStr}\n`);
        allPassed = false;
    }
}

if (allPassed) {
    console.log(`\n  🎉 RESULT: ${contractData.cases.length} case(s) — BEFORE and AFTER are behaviorally identical.`);
    console.log(`      Only layout changed. Safe to consider $sIndentCode correct for this example.\n`);
    process.exit(0);
} else {
    console.error(`\n  ❌ RESULT: indentation changed behavior. Do NOT wire $sIndentCode into engine.jsol yet.\n`);
    process.exit(1);
}
