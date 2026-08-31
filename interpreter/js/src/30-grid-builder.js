window.JSOL_GRID_BUILDER = {
	getAttr: function(paramName) {
		const prefix = paramName.substring(1, 2);
		let type = 'text', step = '', ph = '...';

		if (prefix === 's') { ph = 'string...'; }
		else if (['n', 'c', 'p'].includes(prefix)) { type = 'number'; step = 'any'; ph = '0.00'; }
		else if (['q', 'i'].includes(prefix)) { type = 'number'; step = '1'; ph = '0'; }
		else if (prefix === 'b') { ph = 'true/false'; }
		else if (['a', 'm', 'd'].includes(prefix)) { ph = '[] or {}'; }

		return { type, step, ph, prefix };
	},

	buildRow: function(inputCols, outputCols, tplTdIn, tplTdOut, tbody, inData = {}) {
		const tr = document.createElement('tr');
		inputCols.forEach(col => {
			const clone = tplTdIn.cloneNode(true);
			const input = clone.querySelector('input');
			const attr = window.JSOL_GRID_BUILDER.getAttr(col);

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
	}
};

document.addEventListener('DOMContentLoaded', () => {
	const metaNode = document.querySelector('[data-js-hook="metadata"]');
	if (!metaNode) return;

	const metadata = JSON.parse(metaNode.textContent);
	const funcName = metadata.funcName;
	const inputCols = metadata.params || [];
	const contractCases = metadata.contract || [];

	const table = document.querySelector('[data-js-hook="repl-table"]');
	const thead = document.querySelector('[data-js-hook="repl-thead"]');
	const tbody = document.querySelector('[data-js-hook="repl-tbody"]');

	if (!window[funcName]) return;

	let outputCols = ['_result'];
	let detectionSuccess = false;

	// CAPA 1: Detección por Contrato (SSOT)
	if (contractCases.length > 0) {
		const firstCase = contractCases[0];
		if (firstCase && typeof firstCase === 'object' && firstCase.expect && typeof firstCase.expect === 'object') {
			const keys = Object.keys(firstCase.expect);
			if (keys.length > 0) {
				outputCols = keys;
				detectionSuccess = true;
			}
		}
	}

	// CAPA 2: Detección por Dry-Run (Telemetría en memoria)
	if (!detectionSuccess && contractCases.length > 0) {
		try {
			const firstCase = contractCases[0];
			const inData = (firstCase && typeof firstCase === 'object' && firstCase.in) ? firstCase.in : firstCase;
			const args = inputCols.map(col => {
				if (inData[col] !== undefined) return inData[col];
				const attr = window.JSOL_GRID_BUILDER.getAttr(col);
				if (attr.type === 'number') return 0;
				if (attr.prefix === 'b') return false;
				if (['a', 'm', 'd'].includes(attr.prefix)) return {};
				return "";
			});
			
			const dryRunResult = window[funcName](...args);
			
			if (dryRunResult && typeof dryRunResult === 'object' && !Array.isArray(dryRunResult)) {
				const keys = Object.keys(dryRunResult);
				if (keys.length > 0) {
					outputCols = keys;
					detectionSuccess = true;
				}
			}
		} catch (e) {
			// Falla de Dry-Run silenciosa, pasar al fallback
		}
	}

	// CAPA 3: Fallback Regex Estático (Legacy)
	if (!detectionSuccess) {
		const fnStr = window[funcName].toString();
		const dictMatch = fnStr.match(/return\s+(?:window\.)?JSOL\.dict\(([\s\S]*?)\);?/);

		if (dictMatch) {
			const argsStr = dictMatch[1];
			let args = [], current = '', inStr = false, strQuote = '', pCount = 0, bCount = 0, cCount = 0;
			for (let i = 0; i < argsStr.length; i++) {
				const ch = argsStr[i], prev = i > 0 ? argsStr[i - 1] : '';
				if ((ch === '"' || ch === "'") && prev !== '\\') {
					if (!inStr) { inStr = true; strQuote = ch; }
					else if (ch === strQuote) { inStr = false; }
				}
				if (!inStr) {
					if (ch === '(') pCount++; else if (ch === ')') pCount--;
					else if (ch === '[') bCount++; else if (ch === ']') bCount--;
					else if (ch === '{') cCount++; else if (ch === '}') cCount--;
				}
				if (ch === ',' && !inStr && pCount === 0 && bCount === 0 && cCount === 0) {
					args.push(current.trim()); current = '';
				} else { current += ch; }
			}
			if (current.trim() !== '') args.push(current.trim());
			if (args.length >= 2) {
				outputCols = [];
				for (let i = 0; i < args.length; i += 2) outputCols.push(args[i].replace(/^["']|["']$/g, ''));
			}
		}
	}

	const tplThIn = document.querySelector('[data-tpl="th-input"]').content;
	const tplThOut = document.querySelector('[data-tpl="th-output"]').content;
	const tplTdIn = document.querySelector('[data-tpl="td-input"]').content;
	const tplTdOut = document.querySelector('[data-tpl="td-output"]').content;

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

	window._replGridCtx = { inputCols, outputCols, tplTdIn, tplTdOut, tbody, funcName };

	if (contractCases.length > 0) {
		contractCases.forEach(c => {
			const inData = (c && typeof c === 'object' && c.in) ? c.in : c;
			window.JSOL_GRID_BUILDER.buildRow(inputCols, outputCols, tplTdIn, tplTdOut, tbody, inData);
		});
	} else {
		window.JSOL_GRID_BUILDER.buildRow(inputCols, outputCols, tplTdIn, tplTdOut, tbody);
	}
	window.JSOL_GRID_BUILDER.buildRow(inputCols, outputCols, tplTdIn, tplTdOut, tbody);

	const btnAdd = document.querySelector('[data-js-hook="repl-add-row"]');
	if (btnAdd) {
		btnAdd.addEventListener('click', () => {
			const newRow = window.JSOL_GRID_BUILDER.buildRow(inputCols, outputCols, tplTdIn, tplTdOut, tbody);
			const firstInput = newRow.querySelector('input');
			if (firstInput) firstInput.focus();
		});
	}
});