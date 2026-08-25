<?php
/* PATH: interpreter/engine/bits/assets.php */
/* REEMPLAZAR ARCHIVO COMPLETO */
declare(strict_types=1);

$basePath = dirname(__DIR__, 2);

// Orden estricto de carga para evitar dependencias huérfanas
$targetDirs = ['css', 'js/vendor', 'stdlib', 'js', 'js/src'];

foreach ($targetDirs as $dir) {
    $fullPath = $basePath . '/' . $dir;
    if (!is_dir($fullPath)) continue;

    $files = scandir($fullPath);
    if ($files === false) continue;
    
    natcasesort($files);
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..' || str_starts_with($file, '_') || str_starts_with($file, '.')) continue;
        if ($file === 'repl.js') continue; // Prevenir doble ejecución del viejo monolítico
        
        $filePath = $fullPath . '/' . $file;
        if (!is_file($filePath)) continue;

        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        $relPath = $dir . '/' . $file;

        if ($ext === 'css') {
            echo '<link rel="stylesheet" href="?core_asset=' . urlencode($relPath) . '">' . PHP_EOL;
        } elseif ($ext === 'js') {
            echo '<script src="?core_asset=' . urlencode($relPath) . '"></script>' . PHP_EOL;
        }
    }
}
?>

<template data-tpl="th-input"><th data-type="input"><span data-node="name"></span><br><small>(INPUT)</small></th></template>
<template data-tpl="th-output"><th data-type="output"><span data-node="name"></span><br><small>(OUTPUT)</small></th></template>
<template data-tpl="td-input"><td><input type="text" class="jsol-repl-input" data-js-hook="repl-input"></td></template>
<template data-tpl="td-output"><td><span class="jsol-repl-output" data-js-hook="repl-output">-</span></td></template>

<script type="application/json" data-js-hook="metadata">
    <?= json_encode($metadata ?? []) ?>
</script>

<?php if (isset($compilationResult) && $compilationResult['success']): ?>
    <script src="?asset=<?= urlencode($compilationResult['compiledFilename']) ?>"></script>
<?php endif; ?>