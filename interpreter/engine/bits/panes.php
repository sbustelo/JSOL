<?php
/* PATH: interpreter/engine/bits/panes.php */
/* REEMPLAZAR ARCHIVO COMPLETO */
declare(strict_types=1); ?>

<div class="j0ui-pane-group" data-j0-pane-group="repl-views" data-comments-visible="false">
    <?php if ($hasDocs): ?>
        <div class="j0ui-tab-pane j0ui-active" data-j0-panel="docs">
            <div class="jsol-repl-docs" data-js-hook="repl-docs" data-raw-doc="<?= htmlspecialchars(trim($metadata['documentation'])) ?>">
            </div>
        </div>
    <?php endif; ?>

    <?php 
    $targets = [
        'jsol' => ['lang' => 'javascript', 'ext' => 'jsol', 'code' => $compilationResult['targets']['jsol'] ?? $metadata['sourceCode'] ?? ''],
        'js'   => ['lang' => 'javascript', 'ext' => 'js',   'code' => $compilationResult['targets']['js'] ?? ''],
        'php'  => ['lang' => 'php',        'ext' => 'php',  'code' => $compilationResult['targets']['php'] ?? ''],
        'ts'   => ['lang' => 'typescript', 'ext' => 'ts',   'code' => $compilationResult['targets']['ts'] ?? ''],
        'py'   => ['lang' => 'python',     'ext' => 'py',   'code' => $compilationResult['targets']['py'] ?? '']
    ];
    ?>

    <?php foreach ($targets as $key => $target): ?>
        <div class="j0ui-tab-pane <?= (!$hasDocs && $key === 'jsol') ? 'j0ui-active' : '' ?>" data-j0-panel="<?= $key ?>">
            <div class="j0ui-code-pane-wrapper">
                <div class="j0ui-code-actions-floating">
                    <button type="button" class="j0ui-toolbar-btn has-label" data-j0-action="repl:toggle-comments" title="Show Comments">
                        <svg data-js-hook="icon-comments-on" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        <svg data-js-hook="icon-comments-off" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        <span>Show comments</span>
                    </button>
                    <button type="button" class="j0ui-btn-icon" data-j0-action="repl:copy-target" data-j0-payload='{"target":"<?= $key ?>"}' title="Copy code">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                    <button type="button" class="j0ui-btn-icon" data-j0-action="repl:download-target" data-j0-payload='{"target":"<?= $key ?>"}' title="Download .<?= $target['ext'] ?>">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                </div>
                <pre class="jsol-repl-source-code"><code class="language-<?= $target['lang'] ?>" data-js-code-pane="<?= $key ?>"><?= htmlspecialchars($target['code']) ?></code></pre>
            </div>
        </div>
    <?php endforeach; ?>
</div>