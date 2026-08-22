<?php
// JSOL v0.2.95

declare(strict_types=1);

function routeAssets(string $coreDir, string $tempBinDir, string $compilerDir = ''): void {
    // 1. Serve compiled JSOL files
    if (isset($_GET['asset'])) {
        $assetPath = realpath($tempBinDir . '/' . basename($_GET['asset']));
        if ($assetPath && strpos($assetPath, realpath($tempBinDir)) === 0 && file_exists($assetPath)) {
            header('Content-Type: application/javascript');
            echo file_get_contents($assetPath);
            exit;
        }
        header("HTTP/1.0 404 Not Found");
        echo "/* Error 404: Compiled asset not found. Compilation might have failed. */";
        exit;
    }

    // 2. Serve internal Interpreter Assets (CSS/JS/stdlib)
    if (isset($_GET['core_asset'])) {
        $requestedAsset = $_GET['core_asset'];
        $coreAssetPath = realpath($coreDir . '/' . $requestedAsset);
        
        if (!$coreAssetPath && $compilerDir !== '') {
            $coreAssetPath = realpath($compilerDir . '/dist/' . $requestedAsset);
        }
        
        if ($coreAssetPath && file_exists($coreAssetPath)) {
            $ext = pathinfo($coreAssetPath, PATHINFO_EXTENSION);
            $mime = 'text/plain';
            if ($ext === 'css') $mime = 'text/css';
            if ($ext === 'js') $mime = 'application/javascript';
            
            header("Content-Type: $mime");
            echo file_get_contents($coreAssetPath);
            exit;
        }
        header("HTTP/1.0 404 Not Found");
        exit;
    }
}