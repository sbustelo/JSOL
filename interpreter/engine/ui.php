<?php
/* PATH: interpreter/engine/ui.php */
/* REEMPLAZAR ARCHIVO COMPLETO */
// JSOL v0.3.02

declare(strict_types=1);

$hasDocs = trim($metadata['documentation'] ?? '') !== '';
$bitsDir = __DIR__ . '/bits';
?>

<?php require $bitsDir . '/assets.php'; ?>
<?php require $bitsDir . '/sidebar.php'; ?>

<main class="jsol-repl-main" id="repl" data-js-hook="repl-main">
    <?php if ($selectedFile && $metadata['funcName']): ?>
        <h2>Function: <code><?= htmlspecialchars($metadata['funcName']) ?></code></h2>
        
        <?php if ($compilationResult && !$compilationResult['success']): ?>
            <div class="jsol-repl-error-log">
                <strong>Compilation Error:</strong><br>
                <?= htmlspecialchars($compilationResult['outputLog']) ?>
            </div>
        <?php endif; ?>
        
        <?php require $bitsDir . '/grid.php'; ?>
        <?php require $bitsDir . '/tabs.php'; ?>
        <?php require $bitsDir . '/panes.php'; ?>

    <?php else: ?>
        <div style="color: var(--jsol-text-muted, #888); text-align: center; margin-top: 5rem;">
            <h2>Select a JSOL file to analyze</h2>
            <p>The REPL will automatically parse @contract metadata and build the UI.</p>
        </div>
    <?php endif; ?>
</main>