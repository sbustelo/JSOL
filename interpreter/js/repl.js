// REEMPLAZAR ARCHIVO COMPLETO EN interpreter/js/repl.js

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

// --- DETECCIÓN Y ADICIÓN DE OVERFLOW PARA TABS (j0ui Standard) ---
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
	// Persistir y Restaurar la Posición de Scroll de la Barra Lateral
	const sidebar = document.querySelector('.jsol-repl-sidebar');
	if (sidebar) {
		const savedScroll = sessionStorage.getItem('jsol_sidebar_scroll');
		if (savedScroll !== null) {
			sidebar.scrollTop = parseInt(savedScroll, 10);
		}
		sidebar.addEventListener('scroll', () => {
			sessionStorage.setItem('jsol_sidebar_scroll', sidebar.scrollTop);
		});
	}

	// Renderizado Markdown para el bloque de Documentación mediante marked.js
	const docsNode = document.querySelector('[data-js-hook="repl-docs"]');
	if (docsNode) {
		const rawDoc = docsNode.getAttribute('data-raw-doc');
		if (rawDoc) {
			if (typeof window.marked !== 'undefined' && typeof window.marked.parse === 'function') {
				docsNode.innerHTML = window.marked.parse(rawDoc);
			} else {
				docsNode.textContent = rawDoc;
			}
		}
	}

	// Restauración y Activación de Tab mediante j0.vfs
	const tabGroup = document.querySelector('[data-j0-tab-group="repl-views"]');
	if (tabGroup) {
		const savedTab = window.j0?.vfs ? window.j0.vfs.get('fs_repl_active_tab', 'docs') : 'docs';
		j0_activate_tab('repl-views', savedTab);
	}

	// Listener Global para Conmutación de Pestañas
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

	// Delegación de eventos del bus para Acciones REPL
	if (window.j0?.bus) {
		window.j0.bus.on('repl:download-all', () => {
			const urlParams = new URLSearchParams(window.location.search);
			const currentFile = urlParams.get('file');
			if (currentFile) {
				window.location.href = `export-zip.php?file=${encodeURIComponent(currentFile)}`;
			}
		});

		window.j0.bus.on('repl:download-target', (payload) => {
			const target = payload.target || 'jsol';
			const urlParams = new URLSearchParams(window.location.search);
			const currentFile = urlParams.get('file') || '';
			window.location.href = `download.php?file=${encodeURIComponent(currentFile)}&target=${encodeURIComponent(target)}`;
		});

		window.j0.bus.on('repl:copy-target', (payload) => {
			const target = payload.target || 'jsol';
			const codeNode = document.querySelector(`[data-js-code-pane="${target}"]`);
			if (!codeNode) return;

			navigator.clipboard.writeText(codeNode.textContent).then(() => {
				const trigger = payload.trigger;
				if (trigger) {
					const origText = trigger.textContent;
					trigger.textContent = 'Copied!';
					setTimeout(() => { trigger.textContent = origText; }, 1500);
				}
			});
		});
	}

	// Monitoreo de Overflow para Pestañas
	const tabRows = document.querySelectorAll('.j0ui-tabs-row');
	tabRows.forEach(j0_tabs_check_overflow);
	window.addEventListener('resize', () => {
		tabRows.forEach(j0_tabs_check_overflow);
	});

	const metaNode = document.querySelector('[data-js-hook="metadata"]');
	if (!metaNode) return;

	const metadata = JSON.parse(metaNode.textContent);
	const funcName = metadata.funcName;
	const inputCols = metadata.params || [];
	const contractCases = metadata.contract || [];

	const table = document.querySelector('[data-js-hook="repl-table"]');
	const thead = document.querySelector('[data-js-hook="repl-thead"]');
	const tbody = document.querySelector('[data-js-hook="repl-tbody"]');

	if (!window[funcName]) {
		console.error(`Compiled function ${funcName} not found in scope.`);
		return;
	}

	// SSOT: Read return signature
	let outputCols = ['_result'];
	const fnStr = window[funcName].toString();
	const dictMatch = fnStr.match(/return\s+(?:window\.)?JSOL\.dict\(([\s\S]*?)\);?/);

	if (dictMatch) {
		const argsStr = dictMatch[1];
		let args = [];
		let current = '';
		let inStr = false;
		let strQuote = '';
		let pCount = 0, bCount = 0, cCount = 0;

		for (let i = 0; i < argsStr.length; i++) {
			const ch = argsStr[i];
			const prev = i > 0 ? argsStr[i - 1] : '';
			if ((ch === '"' || ch === "'") && prev !== '\\') {
				if (!inStr) { inStr = true; strQuote = ch; }
				else if (ch === strQuote) { inStr = false; }
			}
			if (!inStr) {
				if (ch === '(') pCount++;
				else if (ch === ')') pCount--;
				else if (ch === '[') bCount++;
				else if (ch === ']') bCount--;
				else if (ch === '{') cCount++;
				else if (ch === '}') cCount--;
			}
			if (ch === ',' && !inStr && pCount === 0 && bCount === 0 && cCount === 0) {
				args.push(current.trim());
				current = '';
			} else {
				current += ch;
			}
		}
		if (current.trim() !== '') args.push(current.trim());

		if (args.length >= 2) {
			outputCols = [];
			for (let i = 0; i < args.length; i += 2) {
				const keyStr = args[i].replace(/^["']|["']$/g, '');
				outputCols.push(keyStr);
			}
		}
	}

	// DOM Templates
	const tplThIn = document.querySelector('[data-tpl="th-input"]').content;
	const tplThOut = document.querySelector('[data-tpl="th-output"]').content;
	const tplTdIn = document.querySelector('[data-tpl="td-input"]').content;
	const tplTdOut = document.querySelector('[data-tpl="td-output"]').content;

	const getAttr = (paramName) => {
		const prefix = paramName.substring(1, 2);
		let type = 'text', step = '', ph = '...';

		if (prefix === 's') { ph = 'string...'; }
		else if (['n', 'c', 'p'].includes(prefix)) { type = 'number'; step = 'any'; ph = '0.00'; }
		else if (['q', 'i'].includes(prefix)) { type = 'number'; step = '1'; ph = '0'; }
		else if (prefix === 'b') { ph = 'true/false'; }
		else if (['a', 'm'].includes(prefix)) { ph = '[] or {}'; }

		return { type, step, ph, prefix };
	};

	// 1. Build Header
	const trHead = document.createElement('tr');
	inputCols.forEach(col => {
		const clone = tplThIn.cloneNode(true);
		clone.querySelector('[data-node="name"]').textContent = col;
		trHead.appendChild(clone);
	});
	outputCols.forEach(col => {
		const clone = tplThOut.cloneNode(true);
		clone.querySelector('[data-node="name"]').textContent = col;
		trHead.appendChild(clone);
	});
	thead.appendChild(trHead);

	// 2. Build Rows function
	const buildRow = (inData = {}) => {
		const tr = document.createElement('tr');
		inputCols.forEach(col => {
			const clone = tplTdIn.cloneNode(true);
			const input = clone.querySelector('input');
			const attr = getAttr(col);

			input.type = attr.type;
			if (attr.step) input.step = attr.step;
			input.placeholder = attr.ph;
			input.setAttribute('data-prefix', attr.prefix);
			input.setAttribute('data-param', col);

			if (inData[col] !== undefined) {
				const val = inData[col];
				input.value = typeof val === 'boolean' ? (val ? 'true' : 'false') : (typeof val === 'object' ? JSON.stringify(val) : String(val));
			}
			tr.appendChild(clone);
		});

		outputCols.forEach(col => {
			const clone = tplTdOut.cloneNode(true);
			const span = clone.querySelector('span');
			span.setAttribute('data-out', col);
			tr.appendChild(clone);
		});
		tbody.appendChild(tr);
		return tr;
	};

	// 3. Initialize Data Rows
	if (contractCases.length > 0) {
		contractCases.forEach(c => {
			const inData = (c && typeof c === 'object' && c.in) ? c.in : c;
			buildRow(inData);
		});
	} else {
		buildRow();
	}
	buildRow();

	// 4. Reactive Evaluation
	const evaluateRow = (row) => {
		const inputs = row.querySelectorAll('[data-js-hook="repl-input"]');
		const outputs = row.querySelectorAll('[data-js-hook="repl-output"]');

		let hasEmptyOrInvalid = false;
		let hasAnyData = false;
		const args = [];

		inputs.forEach(input => {
			const val = input.value.trim();
			const prefix = input.getAttribute('data-prefix');

			if (val !== '') hasAnyData = true;
			if (val === '') { hasEmptyOrInvalid = true; args.push(null); return; }

			let parsed = val;

			if (prefix === 's') {
				parsed = String(val);
			} else if (['n', 'c', 'p', 'q', 'i'].includes(prefix)) {
				parsed = Number(val);
				if (isNaN(parsed)) hasEmptyOrInvalid = true;
			} else if (prefix === 'b') {
				if (val === 'true') parsed = true;
				else if (val === 'false') parsed = false;
				else hasEmptyOrInvalid = true;
			} else if (['a', 'm'].includes(prefix)) {
				try { parsed = JSON.parse(val); } catch (e) { hasEmptyOrInvalid = true; }
			}
			args.push(parsed);
		});

		if (!hasAnyData || hasEmptyOrInvalid) {
			outputs.forEach(out => {
				out.textContent = '-';
				out.removeAttribute('data-error');
				out.removeAttribute('data-bool');
			});
			return;
		}

		try {
			const result = window[funcName](...args);

			outputs.forEach(out => {
				const key = out.getAttribute('data-out');
				out.removeAttribute('data-error');
				out.removeAttribute('data-bool');

				let outVal;
				if (key === '_result') {
					outVal = result;
				} else {
					outVal = (result && typeof result === 'object' && key in result) ? result[key] : null;
				}

				out.textContent = typeof outVal === 'object' && outVal !== null ? JSON.stringify(outVal) : String(outVal);
				if (outVal === false) out.setAttribute('data-bool', 'false');
			});
		} catch (error) {
			outputs.forEach(out => {
				out.textContent = 'ERR';
				out.setAttribute('data-error', 'true');
				out.removeAttribute('data-bool');
			});
		}
	};

	// 5. Events
	const btnAdd = document.querySelector('[data-js-hook="repl-add-row"]');
	if (btnAdd) {
		btnAdd.addEventListener('click', () => {
			const newRow = buildRow();
			const firstInput = newRow.querySelector('input');
			if (firstInput) firstInput.focus();
		});
	}

	table.addEventListener('input', e => {
		if (e.target.matches('[data-js-hook="repl-input"]')) evaluateRow(e.target.closest('tr'));
	});

	table.addEventListener('keydown', e => {
		if (e.key === 'Enter') {
			const input = e.target;
			if (!input.matches('[data-js-hook="repl-input"]')) return;

			const row = input.closest('tr');
			if (row.nextElementSibling === null) {
				const newRow = buildRow();
				const targetInput = newRow.querySelector('input');
				if (targetInput) targetInput.focus();
			} else {
				const currentIdx = Array.from(row.children).indexOf(input.closest('td'));
				const targetInput = row.nextElementSibling.children[currentIdx].querySelector('input');
				if (targetInput) targetInput.focus();
			}
		}
	});

	tbody.querySelectorAll('tr').forEach(evaluateRow);
});

document.addEventListener('DOMContentLoaded', () => {
	const savedGlobalTheme = localStorage.getItem('jsol_global_theme') || 'dark';
	document.documentElement.setAttribute('data-theme', savedGlobalTheme);

	const globalSwitches = document.querySelectorAll('[data-j0-action="ui:toggle-theme"]');
	globalSwitches.forEach(sw => {
		sw.addEventListener('click', () => {
			const html = document.documentElement;
			const currentTheme = html.getAttribute('data-theme') || 'dark';
			const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

			html.setAttribute('data-theme', newTheme);
			localStorage.setItem('jsol_global_theme', newTheme);
		});
	});

	const widgetFrame = document.querySelector('[data-js-hook="repl-frame"]');
	const widgetToggle = document.querySelector('[data-js-hook="widget-theme-toggle"]');

	if (widgetFrame) {
		const savedWidgetTheme = localStorage.getItem('jsol_widget_theme') || 'dark';
		widgetFrame.setAttribute('data-theme', savedWidgetTheme);

		if (widgetToggle) {
			widgetToggle.addEventListener('click', () => {
				const currentTheme = widgetFrame.getAttribute('data-theme') || 'dark';
				const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

				widgetFrame.setAttribute('data-theme', newTheme);
				localStorage.setItem('jsol_widget_theme', newTheme);
			});
		}
	}

	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', (e) => {
			const href = anchor.getAttribute('href');
			if (href === '#' || href.length <= 1) return;

			const targetElem = document.querySelector(href);
			if (targetElem) {
				e.preventDefault();
				targetElem.scrollIntoView({
					behavior: 'smooth'
				});
			}
		});
	});
});