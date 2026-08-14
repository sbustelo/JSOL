<?php
/**
 * JSOL CLI Host Runner (PHP) - Isolated Files Architecture
 * v0.2.93
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
    public static function use(...$args) {}
    public static function strIndexOf($haystack, $needle) {
        $r = strpos($haystack, $needle);
        return $r === false ? -1 : $r;
    }
    public static function arrIndexOf($arr, $item) {
        $r = array_search($item, $arr, true);
        return $r === false ? -1 : $r;
    }
}

class Str {
    public static function indexOf($h, $n) { $r = strpos($h, $n); return $r === false ? -1 : $r; }
    public static function len($s) { return mb_strlen($s, "UTF-8"); }
    public static function sub($s, $start, $len) { return mb_substr($s, $start, $len, "UTF-8"); }
    public static function char($s, $idx) { return mb_ord(mb_substr($s, $idx, 1, "UTF-8")); }
    public static function fromChar($c) { return mb_chr($c, "UTF-8"); }
    public static function replace($s, $search, $replace) { return str_replace($search, $replace, $s); }
}

class Arr {
    public static function count($a) { return count($a); }
    public static function push(&$a, $i) { $a[] = $i; return $a; }
}

class Map {
    public static function create(...$args) { return JSOL::dict(...$args); }
    public static function has($obj, $key) { return isset($obj[$key]); }
}

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

// 5. Read Source & Execute JSOL Engine Pipeline
$sourceCode = file_get_contents($sourcePath);
$result = $mExecuteCompilationPipeline($sourceCode, $targetsConfig, $cliOptions);

if ($result['success'] === false) {
    fwrite(STDERR, "Compilation Failed with errors:\n" . implode("\n", $result['errors']) . "\n");
    exit(1);
}

// 6. Pure I/O Disk Write - Stripping dual extension
$outDir = strlen($cliOptions['outDir']) > 0 ? $cliOptions['outDir'] : dirname($sourcePath);
$baseName = preg_replace('/\.jsol(\.js)?$/', '', basename($sourcePath));

$targetJsFile = $outDir . '/' . $baseName . '.js';
$targetPhpFile = $outDir . '/' . $baseName . '.php';

file_put_contents($targetJsFile, $result['js']);
file_put_contents($targetPhpFile, $result['php']);

echo "JSOL Compilation Success:\n";
echo " -> JS:  {$targetJsFile}\n";
echo " -> PHP: {$targetPhpFile}\n";
?>