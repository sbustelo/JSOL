/**
 * JSOL CLI Host Runner (Node.js) - Isolated Files Architecture via VM Scope
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 1. Inject JSOL runtime wrappers into global context
global.JSOL = {
    dict: function(...args) {
        const obj = {};
        for (let i = 0; i < args.length; i += 2) {
            obj[args[i]] = args[i + 1];
        }
        return obj;
    },
    count: function(arr) { return arr ? arr.length : 0; },
    len: function(str) { return str ? str.length : 0; }
};

const context = vm.createContext(global);
const parts = [
    'lexer.js',
    'linter.js',
    'cli-parser.js',
    'config-parser.js',
    'js-compiler.js',
    'php-compiler.js',
    'engine.js'
];

// 2. Load and concatenate Compiled JSOL Engine Parts
let fullCode = "";
for (let i = 0; i < parts.length; i++) {
    const partPath = path.join(__dirname, parts[i]);
    if (!fs.existsSync(partPath)) {
        console.error(`Fatal Error: Compiled engine part '${partPath}' not found. Run bootstrapping first.`);
        process.exit(1);
    }
    fullCode += fs.readFileSync(partPath, 'utf8') + "\n";
}

// 2.5 Bridge block-scoped consts to the VM context global
fullCode += `
global.$parseRawCliArgs = typeof $parseRawCliArgs !== 'undefined' ? $parseRawCliArgs : null;
global.$normalizeTargetsConfig = typeof $normalizeTargetsConfig !== 'undefined' ? $normalizeTargetsConfig : null;
global.$executeCompilationPipeline = typeof $executeCompilationPipeline !== 'undefined' ? $executeCompilationPipeline : null;
`;

vm.runInContext(fullCode, context, { filename: 'jsol-engine.js' });

// 3. Parse CLI Arguments using Compiled JSOL Module (Pulled from VM context)
const rawArgs = process.argv.slice(2);
const cliOptions = context.$parseRawCliArgs(rawArgs);

const sourcePath = cliOptions.source && cliOptions.source.length > 0 
    ? cliOptions.source 
    : path.join(path.dirname(__dirname), 'example', 'sample.jsol.js');

if (!fs.existsSync(sourcePath)) {
    console.error(`Error: Source file '${sourcePath}' does not exist.`);
    process.exit(1);
}

// 4. Read Raw Targets Config & Normalize via Compiled JSOL Module
const targetsJsonPath = path.join(__dirname, 'targets.json');
let rawConfig = null;

if (fs.existsSync(targetsJsonPath)) {
    try {
        rawConfig = JSON.parse(fs.readFileSync(targetsJsonPath, 'utf8'));
    } catch (e) {
        console.error("Warning: Failed to parse targets.json:", e.message);
    }
}

const targetsConfig = context.$normalizeTargetsConfig(rawConfig);

// 5. Read Source & Execute JSOL Engine Pipeline
const sourceCode = fs.readFileSync(sourcePath, 'utf8');
const result = context.$executeCompilationPipeline(sourceCode, targetsConfig, cliOptions);

if (result.success === false) {
    console.error("Compilation Failed with errors:");
    result.errors.forEach(err => console.error(` - ${err}`));
    process.exit(1);
}

// 6. Pure I/O Disk Write - Stripping dual extension
const outDir = cliOptions.outDir && cliOptions.outDir.length > 0 ? cliOptions.outDir : path.dirname(sourcePath);
const baseName = path.basename(sourcePath).replace(/\.jsol(\.js)?$/, '');

const targetJsFile = path.join(outDir, `${baseName}.js`);
const targetPhpFile = path.join(outDir, `${baseName}.php`);

fs.writeFileSync(targetJsFile, result.js, 'utf8');
fs.writeFileSync(targetPhpFile, result.php, 'utf8');

console.log("JSOL Compilation Success:");
console.log(` -> JS:  ${targetJsFile}`);
console.log(` -> PHP: ${targetPhpFile}`);