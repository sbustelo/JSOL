<?php
// REEMPLAZAR ARCHIVO COMPLETO EN interpreter/j0-mini/discover.php
/* PATH: ./interpreter/j0-mini/discover.php */
/* V4.1.2 - Dev Loader with Unified Linter & Shadowing Support */

$_j0d_host = $_SERVER['HTTP_HOST'] ?? '';
$_j0d_addr = $_SERVER['REMOTE_ADDR'] ?? '';
$_j0d_local = in_array($_j0d_addr, ['127.0.0.1', '::1'])
    || strpos($_j0d_host, 'localhost') !== false
    || strpos($_j0d_host, '.test')     !== false
    || strpos($_j0d_host, '.local')    !== false
    || preg_match('/^192\.168\./', $_j0d_host);

if (!$_j0d_local) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(403);
    die(json_encode(['success' => false, 'error' => 'Discover API is strictly restricted to local development environments.']));
}
unset($_j0d_host, $_j0d_addr, $_j0d_local);

if (!defined('J0_EXEC')) define('J0_EXEC', true);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$basePhysPath = realpath(dirname(__DIR__));
$dirsParam = $_GET['dirs'] ?? 'js/src';
$directoriesRaw = array_filter(explode(',', $dirsParam));
$callerPath = rtrim($_GET['caller'] ?? '/', '/');

$output = [];
$bases = [];

foreach ($directoriesRaw as $dir) {
    $cleanDir = trim($dir);
    $targetPhysPath = realpath($basePhysPath . '/' . $cleanDir);

    if (!$targetPhysPath || !is_dir($targetPhysPath)) continue;

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($targetPhysPath, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($iterator as $item) {
        if (!$item->isFile()) continue;

        $itemPhysPath = str_replace('\\', '/', $item->getPathname());
        $filename = $item->getFilename();
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if (!in_array($ext, ['js', 'css', 'html', 'json'])) continue;

        $relPath = ltrim(substr($itemPhysPath, strlen($basePhysPath)), '/');
        $webPath = preg_replace('#/+#', '/', $callerPath . '/' . $relPath);

        $output[$cleanDir]['assets'][] = $webPath;
    }
    
    if (isset($output[$cleanDir]['assets'])) {
        sort($output[$cleanDir]['assets'], SORT_NATURAL);
    }
}

echo json_encode([
    'success' => true,
    'timestamp' => time(),
    'structure' => $output
]);