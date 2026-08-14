<?php declare(strict_types=1); ?>
<aside class="jsol-repl-sidebar">
    <h3>JSOL Files</h3>

    <!-- Selector desplegable para dispositivos móviles -->
    <select class="jsol-repl-mobile-select" data-js-hook="repl-mobile-select" onchange="if(this.value) window.location.href=this.value;">
        <?php foreach ($jsolFiles as $file): ?>
            <?php 
                $isSelected = ($file === $selectedFile) ? 'selected' : ''; 
            ?>
            <option value="?file=<?= urlencode($file) ?>#interpreter" <?= $isSelected ?>>
                <?= htmlspecialchars($file) ?>
            </option>
        <?php endforeach; ?>
    </select>

    <!-- Lista vertical tradicional para escritorio -->
    <ul class="jsol-repl-file-list jsol-repl-desktop-list" data-js-hook="repl-desktop-list">
        <?php foreach ($jsolFiles as $file): ?>
            <?php 
                $isActive = ($file === $selectedFile) ? 'true' : 'false'; 
                $relativePath = $file;
            ?>
            <li>
                <a href="?file=<?= urlencode($file) ?>#interpreter" class="jsol-repl-link" data-active="<?= $isActive ?>" data-js-hook="repl-file-link">
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
            <details class="jsol-repl-details" open>
                <summary class="jsol-repl-summary">📖 Documentation</summary>
                <div class="jsol-repl-docs">
                    <?= htmlspecialchars(trim($metadata['documentation'])) ?>
                </div>
            </details>
        <?php endif; ?>

        <?php if (!empty($metadata['sourceCode'])): ?>
            <details class="jsol-repl-details">
                <summary class="jsol-repl-summary">📄 View Raw JSOL Source Code</summary>
                <pre class="jsol-repl-source-code"><code><?= htmlspecialchars($metadata['sourceCode']) ?></code></pre>
            </details>
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

        <!-- Internal JS Dependencies -->
        <script src="?core_asset=js/repl.js"></script>
        <?php if ($compilationResult && $compilationResult['success']): ?>
            <!-- Compiled Target Algorithm -->
            <script src="?asset=<?= urlencode($compilationResult['compiledFilename']) ?>"></script>
        <?php endif; ?>

    <?php else: ?>
        <div style="color: var(--jsol-text-muted); text-align: center; margin-top: 5rem;">
            <h2>Select a JSOL file to analyze</h2>
            <p>The REPL will automatically parse @contract metadata and build the UI.</p>
        </div>
    <?php endif; ?>
</main>