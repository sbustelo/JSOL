/**
 * JSOL CLI Host Runner (Node.js) - Isolated Files Architecture via VM Scope
 v0.2.93
 */

// Handle dynamic requires conditionally to prevent throwing in browser environments
let fs = null, path = null, vm = null;
if (typeof process !== 'undefined' && typeof require !== 'undefined') {
    fs = require('fs');
    path = require('path');
    vm = require('vm');
}

// 1. Inject JSOL runtime wrappers into global context
const jsolGlobal = {
    JSOL: {
        dict: function(...args) {
            const obj = {};
            for (let i = 0; i < args.length; i += 2) {
                obj[args[i]] = args[i + 1];
            }
            return obj;
        },
        count: function(arr) { return arr ? arr.length : 0; },
        len: function(str) { return str ? str.length : 0; },
        use: function() {}
    },
    Str: {
        indexOf: function(h, n) { return h.indexOf(n); },
        len: function(s) { return s.length; },
        sub: function(s, start, len) { return s.substring(start, start + len); },
        char: function(s, idx) { return s.charCodeAt(idx); },
        fromChar: function(c) { return String.fromCharCode(c); },
        replace: function(s, search, replace) { return s.split(search).join(replace); }
    },
    Arr: {
        count: function(a) { return a.length; },
        push: function(a, i) { a.push(i); return a; },
        pop: function(a) { return a.pop(); },
        shift: function(a) { return a.shift(); },
        indexOf: function(a, i) { return a.indexOf(i); },
        join: function(a, d) { return a.join(d); },
        slice: function(a, s, e) { return a.slice(s, e); }
    },
    Map: {
        create: function(...args) { return jsolGlobal.JSOL.dict(...args); },
        has: function(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); },
        keys: function(obj) { return Object.keys(obj); }
    }
};

if (typeof global !== 'undefined') {
    Object.assign(global, jsolGlobal);
} else if (typeof window !== 'undefined') {
    Object.assign(window, jsolGlobal);
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
        'js-compiler.js',
        'php-compiler.js',
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
            try {
                rawConfig = JSON.parse(fs.readFileSync(targetsJsonPath, 'utf8'));
            } catch (e) {
                console.error("Warning: Failed to parse targets.json:", e.message);
            }
        }

        const targetsConfig = context.$mNormalizeTargetsConfig(rawConfig);

        const sourceCode = fs.readFileSync(sourcePath, 'utf8');
        const result = context.$mExecuteCompilationPipeline(sourceCode, targetsConfig, cliOptions);

        if (result.success === false) {
            console.error("Compilation Failed with errors:");
            result.errors.forEach(err => console.error(` - ${err}`));
            process.exit(1);
        }

        const outDir = cliOptions.outDir && cliOptions.outDir.length > 0 ? cliOptions.outDir : path.dirname(sourcePath);
        const baseName = path.basename(sourcePath).replace(/\.jsol(\.js)?$/, '');

        const targetJsFile = path.join(outDir, `${baseName}.js`);
        const targetPhpFile = path.join(outDir, `${baseName}.php`);

        fs.writeFileSync(targetJsFile, result.js, 'utf8');
        fs.writeFileSync(targetPhpFile, result.php, 'utf8');

        console.log("JSOL Compilation Success:");
        console.log(` -> JS:  ${targetJsFile}`);
        console.log(` -> PHP: ${targetPhpFile}`);
    }
} else if (typeof window !== 'undefined') {
    // 4. Browser Environment Fallback Binding
    window.JSOL_Compiler = {
        parseRawCliArgs: typeof $mParseRawCliArgs !== 'undefined' ? $mParseRawCliArgs : null,
        normalizeTargetsConfig: typeof $mNormalizeTargetsConfig !== 'undefined' ? $mNormalizeTargetsConfig : null,
        executeCompilationPipeline: typeof $mExecuteCompilationPipeline !== 'undefined' ? $mExecuteCompilationPipeline : null
    };
}