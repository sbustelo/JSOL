// REEMPLAZAR ARCHIVO COMPLETO EN interpreter/js/src/10-docs.js

document.addEventListener('DOMContentLoaded', () => {
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
});