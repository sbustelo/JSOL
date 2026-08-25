<?php
/* PATH: interpreter/engine/bits/tabs.php */
/* REEMPLAZAR ARCHIVO COMPLETO */
declare(strict_types=1); ?>

<div class="j0ui-tabs-row" data-j0-tab-group="repl-views">
    <?php if ($hasDocs): ?>
        <button type="button" class="j0ui-tab-item j0ui-active" data-j0-target="docs">
            <span class="j0ui-tab-label">Description</span>
        </button>
    <?php endif; ?>

    <button type="button" class="j0ui-tab-item <?= !$hasDocs ? 'j0ui-active' : '' ?>" data-j0-target="jsol">
        <span class="j0ui-tab-label">JSOL Source</span>
    </button>
    <button type="button" class="j0ui-tab-item" data-j0-target="js">
        <span class="j0ui-tab-label">JavaScript</span>
    </button>
    <button type="button" class="j0ui-tab-item" data-j0-target="php">
        <span class="j0ui-tab-label">PHP</span>
    </button>
    <button type="button" class="j0ui-tab-item" data-j0-target="ts">
        <span class="j0ui-tab-label">TypeScript</span>
    </button>
    <button type="button" class="j0ui-tab-item" data-j0-target="py">
        <span class="j0ui-tab-label">Python</span>
    </button>

    <?php /* [!] REPL MVP: Menú de overflow [...] deshabilitado. Se usa el scroll horizontal nativo de j0ui.
    <button type="button" class="j0ui-tabs-overflow-btn" aria-label="More tabs">
        <span>•••</span>
    </button>
    */ ?>

    <div class="j0ui-toolbar-spacer"></div>

    <button type="button" class="j0ui-toolbar-btn has-label" data-j0-action="repl:download-all">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Download All (.zip)</span>
    </button>
</div>