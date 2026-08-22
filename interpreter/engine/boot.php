<?php
declare(strict_types=1);

/**
 * JSOL v0.2.95 REPL Controller
 * Handles routing, file scanning, metadata parsing, and in-memory compilation.
 */

$interpreterCoreDir = dirname(__DIR__); // Points to /interpreter
$compilerPath = null;

// 1. Locate the JSOL Compiler index to find its directory
if (file_exists($interpreterCoreDir . '/jsol-compiler-php/index.php')) {
    $compilerPath = $interpreterCoreDir . '/jsol-compiler-php/index.php';
} else {
    $searchDir = $runDir; // Inherited from interpreter.php or host
    for ($i = 0; $i < 6; $i++) {
        if (file_exists($searchDir . '/jsol-compiler-php/index.php')) {
            $compilerPath = $searchDir . '/jsol-compiler-php/index.php';
            break;
        }
        $searchDir = dirname($searchDir);
    }
}

if ($compilerPath === null) {
    die("FATAL: Cannot locate jsol-compiler-php/index.php in the project tree or inside the interpreter directory.");
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
routeAssets($interpreterCoreDir, $tempBinDir, $compilerDir);

// 4. Scan for .jsol files in the current running directory with Jail Guard
$realRunDir = realpath($runDir);
if ($realRunDir === false) {
    die("FATAL: Invalid run directory.");
}

$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($realRunDir));
$jsolFiles = [];
foreach ($iterator as $file) {
    if ($file->isFile() && preg_match('/\.jsol(\.js)?$/', $file->getFilename())) {
        $pathname = $file->getPathname();
        if (strpos($pathname, '/jsol-compiler-') === false && strpos($pathname, '/_jsol-bin') === false && strpos($pathname, '/.jsol-bin') === false) {
            $relPath = ltrim(substr($pathname, strlen($realRunDir)), '/\\');
            $jsolFiles[] = $relPath;
        }
    }
}
sort($jsolFiles);

// 5. Parse and Compile selected file with Jail Guard validation
$selectedFile = null;
$selectedFileAbs = null;

if (isset($_GET['file']) && is_string($_GET['file']) && $_GET['file'] !== '') {
    $cleanReq = ltrim($_GET['file'], '/\\');
    if (strpos($cleanReq, '..') === false) {
        $candidateAbs = realpath($realRunDir . '/' . $cleanReq);
        if ($candidateAbs !== false && strpos($candidateAbs, $realRunDir) === 0) {
            if (preg_match('/\.jsol(\.js)?$/', $candidateAbs) && file_exists($candidateAbs)) {
                $selectedFileAbs = $candidateAbs;
                $selectedFile = ltrim(substr($candidateAbs, strlen($realRunDir)), '/\\');
            }
        }
    }
}

if ($selectedFile === null && count($jsolFiles) > 0) {
    $selectedFile = $jsolFiles[0];
    $selectedFileAbs = realpath($realRunDir . '/' . $selectedFile);
}

$metadata = ['funcName' => null, 'params' => [], 'contract' => [], 'documentation' => '', 'sourceCode' => ''];
$compilationResult = null;

if ($selectedFileAbs && file_exists($selectedFileAbs)) {
    $metadata = parseJsolMetadata($selectedFileAbs);
    $compilationResult = compileJsolInMemory($selectedFileAbs, $compilerDir, $tempBinDir, $metadata);
}

// 6. Render View or Return Control (Host Delegation)
if (defined('JSOL_REPL_STANDALONE') && JSOL_REPL_STANDALONE === true) {
    require_once $interpreterCoreDir . '/engine/standalone.php';
}