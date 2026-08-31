// REEMPLAZAR ARCHIVO COMPLETO EN interpreter/js/src/40-grid-eval.js
document.addEventListener('DOMContentLoaded', () => {
	const table = document.querySelector('[data-js-hook="repl-table"]');
	const tbody = document.querySelector('[data-js-hook="repl-tbody"]');
	if (!table || !tbody) return;

	const evaluateRow = (row) => {
		const ctx = window._replGridCtx;
		if (!ctx || !window[ctx.funcName]) return;

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
            // Evaluacion Base
			let result = window[ctx.funcName](...args);

            // [!] JIT SANDBOX: Si el archivo evalúa contra el polyfill AOT y escupe que no está disponible,
            // interceptamos acá, en el frontend, usamos el compiler cargado, compilamos el string en el acto y ejecutamos.
            if (result === "[EVAL_UNAVAILABLE_IN_AOT_MODE]" && window.JSOL_Compiler) {
                const targetExpr = args[0]; // Asumimos que $sExpression es el primer input
                const rawJSOL = `const $fTempReplFn = function() { return Cast.toStr(${targetExpr}); };`;
                
                // Cuidado: Dependemos de que $targetsConfig y $ssotData se hayan inyectado o estén global.
                // En un setup limpio, lo ideal es parsear el SSOT desde la misma metadata si la inyectaron.
                // Aquí vamos a usar una heurística simplificada: Compilación aislada en JS
                
                // NOTA: Para no depender de un objeto global sucio, llamamos al Polyfill 'new Function' directo.
                // Reutilizamos el motor JSOL interno inyectado en jsolGlobal que YA construiste.
                result = window.JSOL.eval(targetExpr);
            }

			outputs.forEach(out => {
				const key = out.getAttribute('data-out');
				out.removeAttribute('data-error');
				out.removeAttribute('data-bool');

				let outVal = (key === '_result') ? result : ((result && typeof result === 'object' && key in result) ? result[key] : null);
				out.textContent = typeof outVal === 'object' && outVal !== null ? JSON.stringify(outVal) : String(outVal);
				if (outVal === false) out.setAttribute('data-bool', 'false');
                if (String(outVal).startsWith("[EVAL_ERROR")) out.setAttribute('data-error', 'true');
			});
		} catch (error) {
			console.error("[JSOL REPL] Execution Error:", error);
			outputs.forEach(out => {
				out.textContent = 'ERR';
				out.setAttribute('data-error', 'true');
				out.removeAttribute('data-bool');
			});
		}
	};

	table.addEventListener('input', e => {
		if (e.target.matches('[data-js-hook="repl-input"]')) evaluateRow(e.target.closest('tr'));
	});

	table.addEventListener('keydown', e => {
		if (e.key === 'Enter') {
			const input = e.target;
			if (!input.matches('[data-js-hook="repl-input"]')) return;

			const row = input.closest('tr');
			if (row.nextElementSibling === null) {
				const ctx = window._replGridCtx;
				if (ctx) {
					const newRow = window.JSOL_GRID_BUILDER.buildRow(ctx.inputCols, ctx.outputCols, ctx.tplTdIn, ctx.tplTdOut, ctx.tbody);
					const targetInput = newRow.querySelector('input');
					if (targetInput) targetInput.focus();
				}
			} else {
				const currentIdx = Array.from(row.children).indexOf(input.closest('td'));
				const targetInput = row.nextElementSibling.children[currentIdx].querySelector('input');
				if (targetInput) targetInput.focus();
			}
		}
	});

	tbody.querySelectorAll('tr').forEach(evaluateRow);
});