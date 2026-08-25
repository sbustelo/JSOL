<?php
/* PATH: interpreter/export-zip.php */
/* REEMPLAZAR ARCHIVO COMPLETO */
declare(strict_types=1);

$interpreterCoreDir = __DIR__;
$runDir = dirname(__DIR__);

if (!isset($_GET['file']) || !is_string($_GET['file']) || $_GET['file'] === '') {
    http_response_code(400);
    echo "Bad Request: Missing file parameter.";
    exit;
}

$cleanReq = ltrim(str_replace('\\', '/', $_GET['file']), '/');
if (strpos($cleanReq, '..') !== false) {
    http_response_code(400);
    echo "Bad Request: Directory traversal blocked.";
    exit;
}

$baseName = preg_replace('/\.jsol(\.js)?$/', '', basename($cleanReq));
$folderName = $baseName . '-JSOL-compiled';

$tempBinDir = $runDir . '/_jsol-bin';
$exportAssetsDir = $interpreterCoreDir . '/export-zip-assets';

$zipFilename = sys_get_temp_dir() . '/' . $baseName . '-JSOL-compiled-' . time() . '.zip';
$downloadZipName = $baseName . '-JSOL-compiled.zip';

$zip = new ZipArchive();
if ($zip->open($zipFilename, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
    http_response_code(500);
    echo "Error creating ZIP archive.";
    exit;
}

// 1. Añadir archivo original .jsol
$rawJsolPath = realpath($runDir . '/' . $cleanReq);
if ($rawJsolPath !== false && strpos($rawJsolPath, realpath($runDir)) === 0 && file_exists($rawJsolPath)) {
    $zip->addFile($rawJsolPath, $folderName . '/' . basename($cleanReq));
}

// 2. Añadir targets compilados
$targetExts = ['js', 'php', 'ts', 'py'];
foreach ($targetExts as $ext) {
    $targetPath = realpath($tempBinDir . '/' . $baseName . '.' . $ext);
    if ($targetPath !== false && file_exists($targetPath)) {
        $zip->addFile($targetPath, $folderName . '/' . $baseName . '.' . $ext);
    }
}

// 3. Añadir assets fijos
if (is_dir($exportAssetsDir)) {
    $files = scandir($exportAssetsDir);
    if ($files !== false) {
        foreach ($files as $f) {
            if ($f === '.' || $f === '..' || str_starts_with($f, '.') || str_starts_with($f, '_')) continue;
            $fullPath = $exportAssetsDir . '/' . $f;
            if (is_file($fullPath)) {
                $zip->addFile($fullPath, $folderName . '/' . $f);
            }
        }
    }
}

$zip->close();

header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $downloadZipName . '"');
header('Content-Length: ' . filesize($zipFilename));
header('Pragma: no-cache');
header('Expires: 0');

readfile($zipFilename);
@unlink($zipFilename);
exit;