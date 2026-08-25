/* PATH: interpreter/js/src/25-comments-toggle.js */
/* REEMPLAZAR ARCHIVO COMPLETO */

document.addEventListener('DOMContentLoaded', () => {
    const paneGroup = document.querySelector('[data-j0-pane-group="repl-views"]');
    if (!paneGroup) return;

    const updateIcons = (isVisible) => {
        document.querySelectorAll('[data-j0-action="repl:toggle-comments"]').forEach(btn => {
            const onIcon = btn.querySelector('[data-js-hook="icon-comments-on"]');
            const offIcon = btn.querySelector('[data-js-hook="icon-comments-off"]');
            const labelSpan = btn.querySelector('span');
            
            if (onIcon) onIcon.style.display = isVisible ? 'block' : 'none';
            if (offIcon) offIcon.style.display = isVisible ? 'none' : 'block';
            
            const text = isVisible ? 'Hide Comments' : 'Show comments';
            btn.title = text;
            if (labelSpan) labelSpan.textContent = text;
        });
    };

    const cleanupCommentGaps = () => {
        document.querySelectorAll('code[class*="language-"]').forEach(codeEl => {
            if (codeEl.hasAttribute('data-gaps-cleaned')) return;
            codeEl.setAttribute('data-gaps-cleaned', 'true');
            
            // Regex: Busca 1 salto de línea (\n), seguido de 1 o más saltos de línea adicionales (con o sin espacios)
            // Reemplaza dejando el primer \n intacto (para que la línea baje) y envuelve el exceso en el span colapsable.
            codeEl.innerHTML = codeEl.innerHTML.replace(/\n([ \t\r]*\n)+/g, '\n<span class="j0ui-blank-line">$1</span>');
        });
    };

    const checkPrism = setInterval(() => {
        const firstCode = document.querySelector('code[class*="language-"]');
        if (firstCode && firstCode.querySelector('.token')) {
            clearInterval(checkPrism);
            cleanupCommentGaps();
        }
    }, 100);

    if (window.j0?.bus) {
        window.j0.bus.on('repl:toggle-comments', () => {
            const current = paneGroup.getAttribute('data-comments-visible') !== 'false';
            const next = !current;
            
            paneGroup.setAttribute('data-comments-visible', next ? 'true' : 'false');
            updateIcons(next);

            if (window.j0?.vfs) {
                window.j0.vfs.set('fs_repl_show_comments', next ? 'true' : 'false');
            }
        });
    }

    if (window.j0?.vfs) {
        // Fallback inicial cambiado a 'false'
        const savedPref = window.j0.vfs.get('fs_repl_show_comments', 'false');
        const isVisible = savedPref === 'true';
        
        paneGroup.setAttribute('data-comments-visible', isVisible ? 'true' : 'false');
        updateIcons(isVisible);
    }
});