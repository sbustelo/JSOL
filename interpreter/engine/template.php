<?php declare(strict_types=1); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSOL REPL</title>
    <link rel="stylesheet" href="?core_asset=css/repl.css">
</head>
<body>

    <aside class="jsol-repl-sidebar">
        <h3>JSOL Files</h3>
        <ul class="jsol-repl-file-list">
            <?php foreach ($jsolFiles as $file): ?>
                <?php 
                    $isActive = ($file === $selectedFile) ? 'true' : 'false'; 
                    $relativePath = str_replace($runDir . '/', '', $file);
                ?>
                <li>
                    <a href="?file=<?= urlencode($file) ?>" class="jsol-repl-link" data-active="<?= $isActive ?>">
                        <?= htmlspecialchars($relativePath) ?>
                    </a>
                </li>
            <?php endforeach; ?>
        </ul>
    </aside>

    <main class="jsol-repl-main">
        <?php if ($selectedFile && $metadata['funcName']): ?>
            <h2>Function: <code><?= htmlspecialchars($metadata['funcName']) ?></code></h2>
            
            <?php if ($compilationResult && !$compilationResult['success']): ?>
                <div class="jsol-repl-error-log">
                    <strong>Compilation Error:</strong><br>
                    <?= htmlspecialchars($compilationResult['outputLog']) ?>
                </div>
            <?php endif; ?>
            
            <div class="jsol-repl-table-wrap">
                <table class="jsol-repl-grid" data-js-hook="repl-table">
                    <thead data-js-hook="repl-thead"></thead>
                    <tbody data-js-hook="repl-tbody"></tbody>
                </table>
            </div>

            <div class="jsol-repl-actions">
                <button type="button" class="jsol-repl-btn-add" data-js-hook="repl-add-row">
                    + Create new row <kbd>↵ Return</kbd>
                </button>
            </div>

            <?php if (trim($metadata['documentation']) !== ''): ?>
                <div class="jsol-repl-docs">
                    <?= htmlspecialchars(trim($metadata['documentation'])) ?>
                </div>
            <?php endif; ?>

            <!-- Frontend Templates (DOM Purity) -->
            <template data-tpl="th-input">
                <th data-type="input"><span data-node="name"></span><br><small>(INPUT)</small></th>
            </template>
            <template data-tpl="th-output">
                <th data-type="output"><span data-node="name"></span><br><small>(OUTPUT)</small></th>
            </template>
            <template data-tpl="td-input">
                <td><input type="text" class="jsol-repl-input" data-js-hook="repl-input"></td>
            </template>
            <template data-tpl="td-output">
                <td><span class="jsol-repl-output" data-js-hook="repl-output">-</span></td>
            </template>

            <!-- Metadata Transfer -->
            <script type="application/json" data-js-hook="metadata">
                <?= json_encode($metadata) ?>
            </script>

            <script src="?core_asset=js/repl.js"></script>
            <?php if ($compilationResult && $compilationResult['success']): ?>
                <script src="?asset=<?= urlencode($compilationResult['compiledFilename']) ?>"></script>
            <?php endif; ?>

        <?php else: ?>
            <div style="color: var(--jsol-text-muted); text-align: center; margin-top: 5rem;">
                <h2>Select a JSOL file to analyze</h2>
                <p>The REPL will automatically parse @contract metadata and build the UI.</p>
            </div>
        <?php endif; ?>
    </main>
</body>
</html>