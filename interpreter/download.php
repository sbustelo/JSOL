<?php
/* PATH: interpreter/download.php */
/* REEMPLAZAR ARCHIVO COMPLETO */
declare(strict_types=1);

$file = $_GET['file'] ?? '';
$target = $_GET['target'] ?? '';

if (!is_string($file) || $file === '' || !is_string($target) || $target === '') {
    http_response_code(400);
    echo "Bad Request: Missing parameters.";
    exit;
}

$allowedTargets = ['jsol', 'js', 'php', 'ts', 'py'];
if (!in_array($target, $allowedTargets, true)) {
    http_response_code(400);
    echo "Bad Request: Invalid target specified.";
    exit;
}

$cleanFile = ltrim(str_replace('\\', '/', $file), '/');
if (strpos($cleanFile, '..') !== false) {
    http_response_code(400);
    echo "Bad Request: Directory traversal blocked.";
    exit;
}

$baseName = preg_replace('/\.jsol(\.js)?$/', '', basename($cleanFile));

$interpreterCoreDir = __DIR__;
$runDir = dirname(__DIR__);

if (isset($_GET['rundir']) && is_string($_GET['rundir'])) {
    $cand = realpath($_GET['rundir']);
    if ($cand !== false && is_dir($cand)) {
        $runDir = $cand;
    }
}

$tempBinDir = $runDir . '/_jsol-bin';
$filePath = null;
$downloadName = $baseName . '.' . $target;

if ($target === 'jsol') {
    // Buscar preservando los subdirectorios pasados en $file
    $candidatePath = realpath($runDir . '/' . $cleanFile);
    if ($candidatePath !== false && strpos($candidatePath, realpath($runDir)) === 0 && file_exists($candidatePath)) {
        $filePath = $candidatePath;
    }
} else {
    // Los compilados se vuelcan planos en _jsol-bin
    $candidatePath = realpath($tempBinDir . '/' . $baseName . '.' . $target);
    if ($candidatePath !== false && file_exists($candidatePath)) {
        $filePath = $candidatePath;
    }
}

if ($filePath === null || !file_exists($filePath)) {
    http_response_code(404);
    echo "File Not Found.";
    exit;
}

$content = file_get_contents($filePath);

header('Content-Type: text/plain; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $downloadName . '"');
header('Content-Length: ' . strlen($content));
header('Pragma: no-cache');
header('Expires: 0');

echo $content;
exit;