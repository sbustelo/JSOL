<?php

/**
 * JSOL CLI Host Runner (PHP) - Isolated Files Architecture
 * v0.2.95
 */

declare(strict_types=1);

// Load dynamically generated SSOT Polyfills
$polyfillPath = __DIR__ . '/dist/stdlib/jsol-core.php';
if (!file_exists($polyfillPath)) {
	fwrite(STDERR, "FATAL: dist/stdlib/jsol-core.php not found. Run bootstrapper first.\n");
	exit(1);
}
require_once $polyfillPath;

// 1. Load Compiled JSOL Engine Parts (dynamic — every *.php file next to
// this one is loaded, except index.php itself and ui.php (the web UI, not
// a compiler part). Load order doesn't matter: every part only DEFINES
// functions at load time, nothing calls anything cross-file until the CLI
// execution below runs, by which point every part is already loaded.
$excluded = ['index.php', 'ui.php'];
$parts = array_values(array_filter(scandir(__DIR__), function ($f) {
	if (!str_ends_with($f, '.php')) {
		return false;
	}
	if ($f === 'index.php') {
		return false;
	}
	if (str_contains($f, '_')) {
		return false;
	}
	if (!is_file(__DIR__ . '/' . $f)) {
		return false;
	}
	return true;
}));
sort($parts);

if (empty($parts)) {
	fwrite(STDERR, "Fatal Error: No compiler parts (*.php) found next to index.php. Run bootstrapping first.\n");
	exit(1);
}

foreach ($parts as $part) {
	require_once __DIR__ . '/' . $part;
}


// 2. Environment SAPI Check - Isolate CLI from Web
if (php_sapi_name() !== 'cli') {
	require __DIR__ . '/index_ui.php';
	exit;
}


// 3. Parse CLI Arguments using Compiled JSOL Module
$cliOptions = $mParseRawCliArgs($argv);
$sourcePath = strlen($cliOptions['source']) > 0 ? $cliOptions['source'] : '';
$sourceDir = strlen($cliOptions['sourceDir']) > 0 ? $cliOptions['sourceDir'] : '';

if (strlen($sourceDir) === 0 && strlen($sourcePath) > 0 && is_dir($sourcePath)) {
	$sourceDir = $sourcePath;
	$sourcePath = '';
}

if (strlen($sourcePath) === 0 && strlen($sourceDir) === 0) {
	$sourcePath = dirname(__DIR__) . '/example/sample.jsol.js';
}

$filesToCompile = [];
if (strlen($sourceDir) > 0) {
	if (!is_dir($sourceDir)) {
		fwrite(STDERR, "Error: Source directory '{$sourceDir}' does not exist.\n");
		exit(1);
	}
	$scanned = scandir($sourceDir);
	foreach ($scanned as $f) {
		if (str_ends_with($f, '.jsol') || str_ends_with($f, '.jsol.js')) {
			if (!str_starts_with($f, '_')) {
				$filesToCompile[] = rtrim($sourceDir, '/\\') . '/' . $f;
			}
		}
	}
} else if (file_exists($sourcePath)) {
	$filesToCompile[] = $sourcePath;
} else {
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

// 6. Execute Compilation Pipeline in Batch
foreach ($filesToCompile as $filePath) {
	$sourceCode = file_get_contents($filePath);
	$result = $mExecuteCompilationPipeline($sourceCode, $targetsConfig, $cliOptions, $ssotConfig);

	if ($result['success'] === false) {
		fwrite(STDERR, "Compilation Failed for {$filePath} with errors:\n" . implode("\n", $result['errors']) . "\n");
		exit(1);
	}

	$outDir = strlen($cliOptions['outDir']) > 0 ? $cliOptions['outDir'] : dirname($filePath);
	if (!is_dir($outDir)) {
		mkdir($outDir, 0777, true);
	}

	$baseName = preg_replace('/\.jsol(\.js)?$/', '', basename($filePath));

	$targetsArg = ['js', 'php', 'ts', 'py'];
	if (!empty($cliOptions['targets']) && trim($cliOptions['targets']) !== '') {
		$targetsArg = array_map('trim', array_map('strtolower', explode(',', $cliOptions['targets'])));
	}

	echo "JSOL Compilation Success ({$baseName}):\n";

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

	if (in_array('py', $targetsArg, true)) {
		$targetPyFile = $outDir . '/' . $baseName . '.py';
		file_put_contents($targetPyFile, $result['py']);
		echo " -> PY:  {$targetPyFile}\n";
	}
}
