<?php
/* PATH: interpreter/engine/bits/styles.php */
/* REEMPLAZAR ARCHIVO COMPLETO */
declare(strict_types=1); ?>

<style>
    .j0ui-tab-pane { display: none; }
    .j0ui-tab-pane.j0ui-active { display: block; }

    .j0ui-tabs-row {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        border-bottom: 1px solid var(--jsol-border, #333);
        margin-top: 1rem;
        padding-bottom: 0;
        overflow-x: auto;
    }

    .j0ui-tab-item {
        background: transparent;
        border: 1px solid transparent;
        border-bottom: none;
        color: var(--jsol-text-muted, #888);
        padding: 0.5rem 0.85rem;
        border-radius: 6px 6px 0 0;
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
        transition: background 0.15s ease, color 0.15s ease;
    }

    .j0ui-tab-item:hover {
        color: var(--jsol-text, #fff);
        background: var(--jsol-surface-hover, rgba(255,255,255,0.05));
    }

    .j0ui-tab-item.j0ui-active {
        color: var(--jsol-accent, #3b82f6);
        background: var(--jsol-surface, #1e1e1e);
        border-color: var(--jsol-border, #333);
        border-bottom-color: var(--jsol-surface, #1e1e1e);
    }

    .j0ui-toolbar-spacer {
        flex: 1;
    }

    .j0ui-code-pane-wrapper {
        position: relative;
        margin-top: 0.5rem;
    }

    .j0ui-code-actions-floating {
        position: absolute;
        top: 0.5rem;
        right: 0.75rem;
        z-index: 5;
        display: flex;
        gap: 0.5rem;
    }

    .j0ui-btn-icon, .j0ui-toolbar-btn {
        background: var(--jsol-surface-btn, #2a2a2a);
        color: var(--jsol-text, #e0e0e0);
        border: 1px solid var(--jsol-border, #444);
        border-radius: 4px;
        padding: 0.35rem 0.6rem;
        font-size: 0.75rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
    }

    .j0ui-btn-icon:hover, .j0ui-toolbar-btn:hover {
        background: var(--jsol-surface-btn-hover, #3a3a3a);
        color: #fff;
    }

    .jsol-repl-source-code {
        position: relative;
        margin: 0;
        padding: 1rem;
        background: var(--jsol-surface, #181818);
        border: 1px solid var(--jsol-border, #2a2a2a);
        border-radius: 6px;
        overflow-x: auto;
        max-height: 600px;
        overflow-y: auto;
    }
</style>