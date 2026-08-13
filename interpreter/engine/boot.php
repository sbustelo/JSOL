<?php
declare(strict_types=1);

/**
 * JSOL REPL Controller
 * Handles routing, file scanning, metadata parsing, and in-memory compilation.
 */

$interpreterCoreDir = dirname(__DIR__); // Points to /interpreter
$compilerPath = null;
$searchDir = $runDir; // Inherited from interpreter.php

// 1. Locate the JSOL Compiler index to find its directory
for ($i = 0; $i < 6; $i++) {
    if (file_exists($searchDir . '/jsol-compiler-php/index.php')) {
        $compilerPath = $searchDir . '/jsol-compiler-php/index.php';
        break;
    }
    $searchDir = dirname($searchDir);
}

if ($compilerPath === null) {
    die("FATAL: Cannot locate jsol-compiler-php/index.php in the project tree.");
}

$compilerDir = dirname($compilerPath);

$binDirName = $tempBinDirName ?? '_jsol-bin';
$tempBinDir = $runDir . '/' . $binDirName;
if (!is_dir($tempBinDir)) {
    mkdir($tempBinDir, 0777, true);
}

// 2. Load Engine Dependencies
require_once $interpreterCoreDir . '/engine/asset-router.php';
require_once $interpreterCoreDir . '/engine/compiler-bridge.php';

// 3. Handle HTTP Asset Requests (Stops execution if it's an asset call)
routeAssets($interpreterCoreDir, $tempBinDir);

// 4. Scan for .jsol files in the current running directory
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($runDir));
$jsolFiles = [];
foreach ($iterator as $file) {
    if ($file->isFile() && preg_match('/\.jsol(\.js)?$/', $file->getFilename())) {
        if (strpos($file->getPathname(), '/jsol-compiler-') === false && strpos($file->getPathname(), '/.jsol-bin') === false) {
            $jsolFiles[] = $file->getPathname();
        }
    }
}
sort($jsolFiles);

// 5. Parse and Compile selected file in-memory
$selectedFile = $_GET['file'] ?? ($jsolFiles[0] ?? null);
$metadata = ['funcName' => null, 'params' => [], 'contract' => [], 'documentation' => ''];
$compilationResult = null;

if ($selectedFile && in_array($selectedFile, $jsolFiles)) {
    $metadata = parseJsolMetadata($selectedFile);
    $compilationResult = compileJsolInMemory($selectedFile, $compilerDir, $tempBinDir, $metadata);
}

// 6. Render View (Outputs calculation delegated entirely to frontend SSOT)
require_once $interpreterCoreDir . '/engine/template.php';
