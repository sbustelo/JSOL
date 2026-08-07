<?php
/**
 * JSOL CLI Host Runner (PHP) - Isolated Files Architecture
 */

declare(strict_types=1);

// Provide JSOL Native Bridge for PHP
class JSOL {
    public static function dict(...$args) {
        $obj = [];
        for ($i = 0; $i < count($args); $i += 2) {
            if (array_key_exists($i + 1, $args)) {
                $obj[$args[$i]] = $args[$i + 1];
            }
        }
        return $obj;
    }
}

// 1. Load Compiled JSOL Engine Parts (Order Matters)
$parts = [
    'lexer.php',
    'linter.php',
    'cli-parser.php',
    'config-parser.php',
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

// 2. Parse CLI Arguments using Compiled JSOL Module
$cliOptions = $parseRawCliArgs($argv);
$sourcePath = strlen($cliOptions['source']) > 0 ? $cliOptions['source'] : dirname(__DIR__) . '/example/sample.jsol.js';

if (!file_exists($sourcePath)) {
    fwrite(STDERR, "Error: Source file '{$sourcePath}' does not exist.\n");
    exit(1);
}

// 3. Read Raw Targets Config & Normalize via Compiled JSOL Module
$targetsJsonPath = __DIR__ . '/targets.json';
$rawConfig = file_exists($targetsJsonPath) ? json_decode(file_get_contents($targetsJsonPath), true) : null;
$targetsConfig = $normalizeTargetsConfig($rawConfig);

// 4. Read Source & Execute JSOL Engine Pipeline
$sourceCode = file_get_contents($sourcePath);
$result = $executeCompilationPipeline($sourceCode, $targetsConfig, $cliOptions);

if ($result['success'] === false) {
    fwrite(STDERR, "Compilation Failed with errors:\n" . implode("\n", $result['errors']) . "\n");
    exit(1);
}

// 5. Pure I/O Disk Write - Stripping dual extension
$outDir = strlen($cliOptions['outDir']) > 0 ? $cliOptions['outDir'] : dirname($sourcePath);
$baseName = preg_replace('/\.jsol(\.js)?$/', '', basename($sourcePath));

$targetJsFile = $outDir . '/' . $baseName . '.js';
$targetPhpFile = $outDir . '/' . $baseName . '.php';

file_put_contents($targetJsFile, $result['js']);
file_put_contents($targetPhpFile, $result['php']);

// SAPI Check for CLI vs Browser output
$isCli = (php_sapi_name() === 'cli');
$nl = $isCli ? "\n" : "<br>\n";

echo "JSOL Compilation Success:{$nl}";
echo " -> JS:  {$targetJsFile}{$nl}";
echo " -> PHP: {$targetPhpFile}{$nl}";
?>