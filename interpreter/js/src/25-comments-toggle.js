/* PATH: interpreter/js/src/25-comments-toggle.js */
/* V2.1.0 - Motor de colapso de brechas estructurales */

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
            
            let html = codeEl.innerHTML;
            
            // 1. Capturar el salto de línea y la indentación previa a un comentario.
            // Esto ancla el espacio estructural al comentario para que, al ocultarse ambos,
            // la siguiente instrucción suba y ocupe el lugar exacto.
            html = html.replace(/(\n[ \t]*)(<span class="token [^>]*?comment[^>]*>)/g, '<span class="j0ui-comment-gap">$1</span>$2');
            
            // 2. Colapsar líneas en blanco múltiples generales que hayan quedado huérfanas
            html = html.replace(/\n([ \t\r]*\n)+/g, '\n<span class="j0ui-blank-line">$1</span>');
            
            codeEl.innerHTML = html;
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
        const savedPref = window.j0.vfs.get('fs_repl_show_comments', 'false');
        const isVisible = savedPref === 'true';
        
        paneGroup.setAttribute('data-comments-visible', isVisible ? 'true' : 'false');
        updateIcons(isVisible);
    }
});