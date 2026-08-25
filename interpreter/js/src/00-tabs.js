// REEMPLAZAR ARCHIVO COMPLETO EN interpreter/js/src/00-tabs.js

// --- GESTIÓN EXPLICITA DE ACTIVACIÓN Y OCULTAMIENTO DE PESTAÑAS (j0ui Standard) ---
function j0_activate_tab(groupName, targetId) {
	const tabGroup = document.querySelector(`[data-j0-tab-group="${groupName}"]`);
	const paneGroup = document.querySelector(`[data-j0-pane-group="${groupName}"]`);
	if (!tabGroup || !paneGroup) return;

	let targetTab = tabGroup.querySelector(`[data-j0-target="${targetId}"]`);
	if (!targetTab) {
		targetTab = tabGroup.querySelector('[data-j0-target]');
	}
	if (!targetTab) return;

	const actualTarget = targetTab.getAttribute('data-j0-target');

	tabGroup.querySelectorAll('[data-j0-target]').forEach(btn => {
		btn.classList.toggle('j0ui-active', btn === targetTab);
	});

	paneGroup.querySelectorAll('[data-j0-panel]').forEach(pane => {
		const isMatch = pane.getAttribute('data-j0-panel') === actualTarget;
		pane.classList.toggle('j0ui-active', isMatch);
		pane.style.display = isMatch ? 'block' : 'none';
	});

	if (window.j0?.vfs) {
		window.j0.vfs.set('fs_repl_active_tab', actualTarget);
	}
}

function j0_tabs_check_overflow(row) {
	if (!row) return;
	const hasOverflow = row.scrollWidth > row.clientWidth + 2;
	row.classList.toggle('has-overflow', hasOverflow);

	if (!hasOverflow) return;

	const items = Array.from(row.querySelectorAll('.j0ui-tab-item'));
	const rowRect = row.getBoundingClientRect();

	const hidden = items.filter(item => {
		const rect = item.getBoundingClientRect();
		return rect.right > rowRect.right - 40;
	});

	const btn = row.querySelector('.j0ui-tabs-overflow-btn');
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
		const label = item.querySelector('.j0ui-tab-label')?.textContent || item.textContent.trim();
		const panel = item.dataset.j0Target || item.getAttribute('data-j0-target');
		return `<div class="j0ui-menu-item j0ui-tabs-overflow-item${item.classList.contains('j0ui-active') ? ' is-checked' : ''}"
                     data-overflow-target="${panel || ''}">
                    <span class="j0ui-menu-check">✓</span>
                    <span class="j0ui-menu-item-label">${label}</span>
                </div>`;
	}).join('');

	menu.querySelectorAll('.j0ui-tabs-overflow-item').forEach(item => {
		item.addEventListener('click', () => {
			const targetId = item.dataset.overflowTarget;
			if (!targetId) return;
			j0_activate_tab('repl-views', targetId);
			menu.style.display = 'none';
		});
	});
}

document.addEventListener('DOMContentLoaded', () => {
	const tabGroup = document.querySelector('[data-j0-tab-group="repl-views"]');
	if (tabGroup) {
		const savedTab = window.j0?.vfs ? window.j0.vfs.get('fs_repl_active_tab', 'docs') : 'docs';
		j0_activate_tab('repl-views', savedTab);
	}

	document.addEventListener('click', (e) => {
		const tabItem = e.target.closest('[data-j0-target]');
		if (tabItem) {
			const group = tabItem.closest('[data-j0-tab-group]');
			if (group) {
				const groupName = group.getAttribute('data-j0-tab-group');
				const target = tabItem.getAttribute('data-j0-target');
				j0_activate_tab(groupName, target);
			}
		}
	});

	const tabRows = document.querySelectorAll('.j0ui-tabs-row');
	tabRows.forEach(j0_tabs_check_overflow);
	window.addEventListener('resize', () => {
		tabRows.forEach(j0_tabs_check_overflow);
	});
});