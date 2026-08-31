<?php
declare(strict_types=1);

// 1. Agrupar archivos por directorio para renderizar estructura de árbol
$groupedFiles = [];
foreach ($jsolFiles as $file) {
    $dir = dirname($file);
    if ($dir === '.') {
        $dir = '/'; // Raíz
    }
    $groupedFiles[$dir][] = [
        'path' => $file,
        'name' => basename($file)
    ];
}
ksort($groupedFiles);
?>

<aside class="jsol-repl-sidebar">
    <h3>JSOL Files</h3>

    <select class="jsol-repl-mobile-select" data-js-hook="repl-mobile-select" onchange="if(this.value) window.location.href=this.value;">
        <?php foreach ($groupedFiles as $folder => $files): ?>
            <?php if ($folder === '/'): ?>
                <?php foreach ($files as $f): ?>
                    <option value="?file=<?= urlencode($f['path']) ?>" <?= ($f['path'] === $selectedFile) ? 'selected' : '' ?>>
                        <?= htmlspecialchars($f['name']) ?>
                    </option>
                <?php endforeach; ?>
            <?php else: ?>
                <optgroup label="<?= htmlspecialchars($folder) ?>">
                    <?php foreach ($files as $f): ?>
                        <option value="?file=<?= urlencode($f['path']) ?>" <?= ($f['path'] === $selectedFile) ? 'selected' : '' ?>>
                            <?= htmlspecialchars($f['name']) ?>
                        </option>
                    <?php endforeach; ?>
                </optgroup>
            <?php endif; ?>
        <?php endforeach; ?>
    </select>

    <ul class="jsol-repl-file-list jsol-repl-desktop-list" data-js-hook="repl-desktop-list">
        <?php foreach ($groupedFiles as $folder => $files): ?>
            <?php if ($folder === '/'): ?>
                <?php foreach ($files as $f): ?>
                    <li>
                        <a href="?file=<?= urlencode($f['path']) ?>#repl" class="jsol-repl-link" data-active="<?= ($f['path'] === $selectedFile) ? 'true' : 'false' ?>" data-js-hook="repl-file-link">
                            <?= htmlspecialchars($f['name']) ?>
                        </a>
                    </li>
                <?php endforeach; ?>
            <?php else: ?>
                <?php
                    // Auto-abrir la carpeta si el archivo seleccionado está adentro
                    $isOpen = false;
                    foreach ($files as $f) {
                        if ($f['path'] === $selectedFile) {
                            $isOpen = true;
                            break;
                        }
                    }
                ?>
                <li>
                    <details class="jsol-repl-folder" <?= $isOpen ? 'open' : '' ?>>
                        <summary class="jsol-repl-folder-summary">
                            <svg class="jsol-repl-folder-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            <span><?= htmlspecialchars($folder) ?></span>
                        </summary>
                        <ul class="jsol-repl-sublist">
                            <?php foreach ($files as $f): ?>
                                <li>
                                    <a href="?file=<?= urlencode($f['path']) ?>#repl" class="jsol-repl-link" data-active="<?= ($f['path'] === $selectedFile) ? 'true' : 'false' ?>" data-js-hook="repl-file-link">
                                        <?= htmlspecialchars($f['name']) ?>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </details>
                </li>
            <?php endif; ?>
        <?php endforeach; ?>
    </ul>
</aside>