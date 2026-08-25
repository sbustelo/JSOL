<?php
/* PATH: interpreter/engine/bits/sidebar.php */
/* REEMPLAZAR ARCHIVO COMPLETO */
declare(strict_types=1); ?>

<aside class="jsol-repl-sidebar">
    <h3>JSOL Files</h3>

    <select class="jsol-repl-mobile-select" data-js-hook="repl-mobile-select" onchange="if(this.value) window.location.href=this.value;">
        <?php foreach ($jsolFiles as $file): ?>
            <option value="?file=<?= urlencode($file) ?>" <?= ($file === $selectedFile) ? 'selected' : '' ?>>
                <?= htmlspecialchars($file) ?>
            </option>
        <?php endforeach; ?>
    </select>

    <ul class="jsol-repl-file-list jsol-repl-desktop-list" data-js-hook="repl-desktop-list">
        <?php foreach ($jsolFiles as $file): ?>
            <li>
                <a href="?file=<?= urlencode($file) ?>#repl" class="jsol-repl-link" data-active="<?= ($file === $selectedFile) ? 'true' : 'false' ?>" data-js-hook="repl-file-link">
                    <?= htmlspecialchars($file) ?>
                </a>
            </li>
        <?php endforeach; ?>
    </ul>
</aside>