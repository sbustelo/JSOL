<?php
/* PATH: interpreter/engine/action-downloads.php */
/* NUEVO ARCHIVO */
// JSOL v0.2.97 - Download Action Handler

declare(strict_types=1);

if (!isset($_GET['action']) || !$selectedFileAbs || !file_exists($selectedFileAbs) || !$compilationResult || !$compilationResult['success']) {
    return;
}

$baseName = preg_replace('/\.jsol(\.js)?$/', '', basename($selectedFileAbs));

// 6A. Individual Target Download
if ($_GET['action'] === 'download-target' && isset($_GET['target'])) {
    $target = $_GET['target'];
    if (isset($compilationResult['targets'][$target])) {
        $content = $compilationResult['targets'][$target];
        $downloadName = ($target === 'jsol') ? $baseName . '.jsol' : $baseName . '.' . $target;
        
        header('Content-Type: text/plain; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $downloadName . '"');
        header('Content-Length: ' . strlen($content));
        header('Pragma: no-cache');
        header('Expires: 0');
        echo $content;
        exit;
    }
}

// 6B. ZIP Download for all compiled targets
if ($_GET['action'] === 'download-all') {
    $zipFilename = sys_get_temp_dir() . '/' . $baseName . '-all-targets-' . time() . '.zip';
    $folderName = $baseName . '-JSOL-compiled';

    $zip = new ZipArchive();
    if ($zip->open($zipFilename, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {

        // Dynamically add all compiled targets from SSOT memory directly into a named folder
        foreach ($compilationResult['targets'] as $targetExt => $targetContent) {
            $targetFilename = ($targetExt === 'jsol') ? $baseName . '.jsol' : $baseName . '.' . $targetExt;
            $zip->addFromString($folderName . '/' . $targetFilename, $targetContent);
        }

        // Read README from physical file on disk
        $readmePath = null;
        if (file_exists($realRunDir . '/README.md')) {
            $readmePath = $realRunDir . '/README.md';
        } elseif (file_exists($interpreterCoreDir . '/README.md')) {
            $readmePath = $interpreterCoreDir . '/README.md';
        } elseif (file_exists($interpreterCoreDir . '/README.interpreter.md')) {
            $readmePath = $interpreterCoreDir . '/README.interpreter.md';
        } elseif (file_exists($interpreterCoreDir . '/export-zip-assets/README.md')) {
            $readmePath = $interpreterCoreDir . '/export-zip-assets/README.md';
        }

        if ($readmePath && file_exists($readmePath)) {
            $zip->addFromString($folderName . '/README.md', file_get_contents($readmePath));
        }

        $zip->close();

        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . $folderName . '.zip"');
        header('Content-Length: ' . filesize($zipFilename));
        header('Pragma: no-cache');
        header('Expires: 0');
        readfile($zipFilename);
        @unlink($zipFilename);
        exit;
    }
}