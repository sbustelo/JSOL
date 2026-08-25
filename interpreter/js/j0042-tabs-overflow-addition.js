/* PATH: interpreter/js/j0042-tabs-overflow-addition.js */
/* REEMPLAZAR ARCHIVO COMPLETO */

/* =============================================================================
   ADICIÓN a j0042-j0ui-switcher.js
   Tabs overflow: detecta cuando los tabs no entran y muestra el botón …
   con un dropdown de los tabs ocultos.
   ============================================================================= */

/* ─── OVERFLOW DETECTION ─────────────────────────────────────────────────────── */

function j0_tabs_check_overflow(row) {
    const hasOverflow = row.scrollWidth > row.clientWidth + 2; // +2 px de tolerancia
    row.classList.toggle('has-overflow', hasOverflow);

    if (!hasOverflow) return;

    // Construir la lista de tabs ocultos para el dropdown
    const items   = Array.from(row.querySelectorAll('.j0ui-tab-item'));
    const rowRect = row.getBoundingClientRect();

    const hidden = items.filter(item => {
        const rect = item.getBoundingClientRect();
        return rect.right > rowRect.right - 40; // 40px = ancho aprox del botón …
    });

    // Actualizar el menú del botón …
    const btn  = row.querySelector('.j0ui-tabs-overflow-btn');
    if (!btn) return;

    let menu = btn._overflowMenu;
    if (!menu) {
        menu = document.createElement('div');
        menu.className = 'j0ui-dropdown-menu j0ui-tabs-overflow-menu';
        btn.appendChild(menu);
        btn._overflowMenu = menu;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menu.style.display === 'block';
            menu.style.display = isOpen ? 'none' : 'block';
        });

        document.addEventListener('click', () => { menu.style.display = 'none'; });
    }

    menu.innerHTML = hidden.map(item => {
        const label = item.querySelector('.j0ui-tab-label')?.textContent
                   || item.textContent.trim();
        const panel = item.dataset.j0Target || item.getAttribute('data-j0-target');
        return `<div class="j0ui-menu-item j0ui-tabs-overflow-item${item.classList.contains('j0ui-active') ? ' is-checked' : ''}"
                     data-overflow-target="${panel || ''}">
                    <span class="j0ui-menu-check">✓</span>
                    <span class="j0ui-menu-item-label">${label}</span>
                </div>`;
    }).join('');

    // Click en item del overflow → activa el tab correspondiente
    menu.querySelectorAll('.j0ui-tabs-overflow-item').forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.dataset.overflowTarget;
            if (!targetId) return;
            const tab = row.querySelector(`[data-j0-target="${targetId}"]`);
            if (tab) {
                tab.click();
                tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
            menu.style.display = 'none';
        });
    });
}

/* [!] REPL MVP: Ejecución deshabilitada. Se delega al scroll horizontal nativo.
// Aplicar a todos los tab rows al boot
document.querySelectorAll('.j0ui-tabs-row').forEach(j0_tabs_check_overflow);

// Re-evaluar en resize
window.addEventListener('resize', () => {
    document.querySelectorAll('.j0ui-tabs-row').forEach(j0_tabs_check_overflow);
});

// Re-evaluar cuando se monta un nuevo componente
if (window.j0?.bus) {
    window.j0.bus.on('module:mounted', () => {
        document.querySelectorAll('.j0ui-tabs-row').forEach(j0_tabs_check_overflow);
    });
}
*/