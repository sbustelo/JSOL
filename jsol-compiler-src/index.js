/**
 * JSOL CLI Host Runner (Node.js) - Isolated Files Architecture via VM Scope
 * v0.2.95
 */

// Handle dynamic requires conditionally to prevent throwing in browser environments
let fs = null, path = null, vm = null;
if (typeof process !== 'undefined' && typeof require !== 'undefined') {
    fs = require('fs');
    path = require('path');
    vm = require('vm');
    
    // Load dynamically generated SSOT Polyfills
    const polyfillPath = path.join(__dirname, 'dist', 'stdlib', 'jsol-core.js');
    if (fs.existsSync(polyfillPath)) {
        require(polyfillPath);
    } else {
        console.error("FATAL: dist/stdlib/jsol-core.js not found. Run bootstrapper first.");
        process.exit(1);
    }
}

// 2. Load and execute Compiled JSOL Engine Parts
if (vm && fs && path) {
    const context = vm.createContext(global);
	const parts = [
        'lexer.js',
        'linter.js',
        'cli-parser.js',
        'config-parser.js',
        'regex.js',
        'indenter.js',
        'js-compiler.js',
		'php-compiler.js',
        'python-compiler.js',
        'python-ternary.js',
        'python-brace-strip.js',
        'engine.js'
    ];

    let fullCode = "";
    for (let i = 0; i < parts.length; i++) {
        const partPath = path.join(__dirname, parts[i]);
        if (!fs.existsSync(partPath)) {
            console.error(`Fatal Error: Compiled engine part '${partPath}' not found. Run bootstrapping first.`);
            process.exit(1);
        }
        fullCode += fs.readFileSync(partPath, 'utf8') + "\n";
    }

    fullCode += `
    global.$mParseRawCliArgs = typeof $mParseRawCliArgs !== 'undefined' ? $mParseRawCliArgs : null;
    global.$mNormalizeTargetsConfig = typeof $mNormalizeTargetsConfig !== 'undefined' ? $mNormalizeTargetsConfig : null;
    global.$mExecuteCompilationPipeline = typeof $mExecuteCompilationPipeline !== 'undefined' ? $mExecuteCompilationPipeline : null;
    global.$mRegexMatch = typeof $mRegexMatch !== 'undefined' ? $mRegexMatch : null;
    global.$sRegexReplace = typeof $sRegexReplace !== 'undefined' ? $sRegexReplace : null;
    global.$mAuditStrictTyping = typeof $mAuditStrictTyping !== 'undefined' ? $mAuditStrictTyping : null;
    `;

    vm.runInContext(fullCode, context, { filename: 'jsol-engine.js' });

    // 3. Node CLI Execution Environment
    if (typeof process !== 'undefined' && process.argv) {
        const rawArgs = process.argv.slice(2);
        const cliOptions = context.$mParseRawCliArgs(rawArgs);

        const sourcePath = cliOptions.source && cliOptions.source.length > 0 
            ? cliOptions.source 
            : path.join(path.dirname(__dirname), 'example', 'sample.jsol.js');

        if (!fs.existsSync(sourcePath)) {
            console.error(`Error: Source file '${sourcePath}' does not exist.`);
            process.exit(1);
        }

        const targetsJsonPath = path.join(__dirname, 'targets.json');
        let rawConfig = null;
        if (fs.existsSync(targetsJsonPath)) {
            try { rawConfig = JSON.parse(fs.readFileSync(targetsJsonPath, 'utf8')); } 
            catch (e) { console.error("Warning: Failed to parse targets.json:", e.message); }
        }
        const targetsConfig = context.$mNormalizeTargetsConfig(rawConfig);

        // Load SSOT
        const ssotPath = path.join(__dirname, 'dist', 'compiler', 'jsol-spec.json');
        let ssotConfig = null;
        if (fs.existsSync(ssotPath)) {
            ssotConfig = JSON.parse(fs.readFileSync(ssotPath, 'utf8'));
        } else {
            console.error("FATAL: dist/compiler/jsol-spec.json not found. Run bootstrapper first.");
            process.exit(1);
        }

        const sourceCode = fs.readFileSync(sourcePath, 'utf8');
        const result = context.$mExecuteCompilationPipeline(sourceCode, targetsConfig, cliOptions, ssotConfig);

        if (result.success === false) {
            console.error("Compilation Failed with errors:");
            result.errors.forEach(err => console.error(` - ${err}`));
            process.exit(1);
        }

        // 4. Ensure output directory exists before writing
        const outDir = cliOptions.outDir && cliOptions.outDir.length > 0 ? cliOptions.outDir : path.dirname(sourcePath);
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

const baseName = path.basename(sourcePath).replace(/\.jsol(\.js)?$/, '');

		let targetsArg = ['js', 'php', 'ts', 'py'];
        if (cliOptions.targets && cliOptions.targets.length > 0) {
            targetsArg = cliOptions.targets.split(',').map(t => t.trim().toLowerCase());
        }

        console.log("JSOL Compilation Success:");

        if (targetsArg.includes('js')) {
            const targetJsFile = path.join(outDir, `${baseName}.js`);
            fs.writeFileSync(targetJsFile, result.js, 'utf8');
            console.log(` -> JS:  ${targetJsFile}`);
        }

        if (targetsArg.includes('php')) {
            const targetPhpFile = path.join(outDir, `${baseName}.php`);
            fs.writeFileSync(targetPhpFile, result.php, 'utf8');
            console.log(` -> PHP: ${targetPhpFile}`);
        }

		if (targetsArg.includes('ts')) {
            const targetTsFile = path.join(outDir, `${baseName}.ts`);
            fs.writeFileSync(targetTsFile, result.ts, 'utf8');
            console.log(` -> TS:  ${targetTsFile}`);
        }

        if (targetsArg.includes('py')) {
            const targetPyFile = path.join(outDir, `${baseName}.py`);
            fs.writeFileSync(targetPyFile, result.py, 'utf8');
            console.log(` -> PY:  ${targetPyFile}`);
        }
    }
} else if (typeof window !== 'undefined') {
    // 5. Browser Environment Fallback Binding
    window.JSOL_Compiler = {
        parseRawCliArgs: typeof $mParseRawCliArgs !== 'undefined' ? $mParseRawCliArgs : null,
        normalizeTargetsConfig: typeof $mNormalizeTargetsConfig !== 'undefined' ? $mNormalizeTargetsConfig : null,
        executeCompilationPipeline: typeof $mExecuteCompilationPipeline !== 'undefined' ? $mExecuteCompilationPipeline : null
    };
}