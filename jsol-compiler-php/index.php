<?php
/**
 * JSOL CLI Host Runner (PHP) - Isolated Files Architecture
 * v0.2.94
 */

declare(strict_types=1);

// Load dynamically generated SSOT Polyfills
$polyfillPath = __DIR__ . '/dist/stdlib/jsol-core.php';
if (!file_exists($polyfillPath)) {
    fwrite(STDERR, "FATAL: dist/stdlib/jsol-core.php not found. Run bootstrapper first.\n");
    exit(1);
}
require_once $polyfillPath;

// 1. Load Compiled JSOL Engine Parts (Order Matters)
$parts = [
    'lexer.php',
    'linter.php',
    'cli-parser.php',
    'config-parser.php',
    'regex.php',
    'js-compiler.php',
    'php-compiler.php',
    'engine.php'
];
foreach ($parts as $part) {
    $path = __DIR__ . '/' . $part;
    if (!file_exists($path)) {
        fwrite(STDERR, "Fatal Error: Compiled engine part '{$path}' not found. Run bootstrapping first.\n");
        exit(1);
    }
    require_once $path;
}

// 2. Environment SAPI Check - Isolate CLI from Web
if (php_sapi_name() !== 'cli') {
    require __DIR__ . '/ui.php';
    exit;
}

// 3. Parse CLI Arguments using Compiled JSOL Module
$cliOptions = $mParseRawCliArgs($argv);
$sourcePath = strlen($cliOptions['source']) > 0 ? $cliOptions['source'] : dirname(__DIR__) . '/example/sample.jsol.js';

if (!file_exists($sourcePath)) {
    fwrite(STDERR, "Error: Source file '{$sourcePath}' does not exist.\n");
    exit(1);
}

// 4. Read Raw Targets Config & Normalize via Compiled JSOL Module
$targetsJsonPath = __DIR__ . '/targets.json';
$rawConfig = file_exists($targetsJsonPath) ? json_decode(file_get_contents($targetsJsonPath), true) : null;
$targetsConfig = $mNormalizeTargetsConfig($rawConfig);

// 5. Load Compiled SSOT
$ssotPath = __DIR__ . '/dist/compiler/jsol-spec.json';
if (!file_exists($ssotPath)) {
    fwrite(STDERR, "FATAL: dist/compiler/jsol-spec.json not found. Run bootstrapper first.\n");
    exit(1);
}
$ssotConfig = json_decode(file_get_contents($ssotPath), true);

// 6. Read Source & Execute JSOL Engine Pipeline
$sourceCode = file_get_contents($sourcePath);
$result = $mExecuteCompilationPipeline($sourceCode, $targetsConfig, $cliOptions, $ssotConfig);

if ($result['success'] === false) {
    fwrite(STDERR, "Compilation Failed with errors:\n" . implode("\n", $result['errors']) . "\n");
    exit(1);
}

// 7. Ensure output directory exists before writing
$outDir = strlen($cliOptions['outDir']) > 0 ? $cliOptions['outDir'] : dirname($sourcePath);
if (!is_dir($outDir)) {
    mkdir($outDir, 0777, true);
}

$baseName = preg_replace('/\.jsol(\.js)?$/', '', basename($sourcePath));

$targetsArg = ['js', 'php', 'ts'];
if (!empty($cliOptions['targets']) && trim($cliOptions['targets']) !== '') {
    $targetsArg = array_map('trim', array_map('strtolower', explode(',', $cliOptions['targets'])));
}

echo "JSOL Compilation Success:\n";

if (in_array('js', $targetsArg, true)) {
    $targetJsFile = $outDir . '/' . $baseName . '.js';
    file_put_contents($targetJsFile, $result['js']);
    echo " -> JS:  {$targetJsFile}\n";
}

if (in_array('php', $targetsArg, true)) {
    $targetPhpFile = $outDir . '/' . $baseName . '.php';
    file_put_contents($targetPhpFile, $result['php']);
    echo " -> PHP: {$targetPhpFile}\n";
}

if (in_array('ts', $targetsArg, true)) {
    $targetTsFile = $outDir . '/' . $baseName . '.ts';
    file_put_contents($targetTsFile, $result['ts']);
    echo " -> TS:  {$targetTsFile}\n";
}
?>