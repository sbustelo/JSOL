<?php
declare(strict_types=1);

/**
 * JSOL Visual REPL Interpreter (Minimal Bootstrapper)
 * Portable file: Can be copied anywhere within the project.
 */

define('JSOL_REPL_STANDALONE', true);

$runDir = __DIR__;
$tempBinDirName = '_jsol-bin';
$engineBootPath = null;
$searchDir = $runDir;

// Locate the /interpreter/engine/boot.php controller
for ($i = 0; $i < 6; $i++) {
    if (file_exists($searchDir . '/interpreter/engine/boot.php')) {
        $engineBootPath = $searchDir . '/interpreter/engine/boot.php';
        break;
    }
    // Edge case: if we are inside the /interpreter directory already
    if (basename($searchDir) === 'interpreter' && file_exists($searchDir . '/engine/boot.php')) {
        $engineBootPath = $searchDir . '/engine/boot.php';
        break;
    }
    $searchDir = dirname($searchDir);
}

if ($engineBootPath === null) {
    die("FATAL: Cannot locate /interpreter/engine/boot.php. Make sure the interpreter directory exists in the project tree.");
}

// Delegate all execution to the Engine
require_once $engineBootPath;