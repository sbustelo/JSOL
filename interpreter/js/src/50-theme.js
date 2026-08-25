// REEMPLAZAR ARCHIVO COMPLETO EN interpreter/js/src/50-theme.js

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
				targetElem.scrollIntoView({ behavior: 'smooth' });
			}
		});
	});
});