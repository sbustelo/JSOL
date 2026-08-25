/* PATH: interpreter/js/src/20-actions.js */
/* REEMPLAZAR ARCHIVO COMPLETO */

document.addEventListener('DOMContentLoaded', () => {
    const getCurrentFile = () => {
        const urlParams = new URLSearchParams(window.location.search);
        let f = urlParams.get('file');
        if (!f) {
            const activeLink = document.querySelector('.jsol-repl-link[data-active="true"]');
            if (activeLink) {
                const href = activeLink.getAttribute('href');
                if (href) {
                    const m = href.match(/\?file=([^#&]+)/);
                    if (m) f = decodeURIComponent(m[1]);
                }
            }
        }
        return f;
    };

    if (window.j0?.bus) {
        window.j0.bus.on('repl:download-all', () => {
            const currentFile = getCurrentFile();
            if (currentFile) {
                // Ruteo seguro a través del index del host app -> boot.php
                window.location.href = `?file=${encodeURIComponent(currentFile)}&action=download-all`;
            } else {
                console.error('[j0:REPL] Error: No active file found for download.');
            }
        });

        window.j0.bus.on('repl:download-target', (payload) => {
            const target = payload.target || 'jsol';
            const currentFile = getCurrentFile();
            if (currentFile) {
                // Ruteo seguro a través del index del host app -> boot.php
                window.location.href = `?file=${encodeURIComponent(currentFile)}&action=download-target&target=${encodeURIComponent(target)}`;
            } else {
                console.error('[j0:REPL] Error: No active file found for download.');
            }
        });

        window.j0.bus.on('repl:copy-target', (payload) => {
            const target = payload.target || 'jsol';
            const codeNode = document.querySelector(`[data-js-code-pane="${target}"]`);
            if (!codeNode) return;

            const text = codeNode.textContent;
            const trigger = payload.trigger;
            let originalHtml = '';
            if (trigger) originalHtml = trigger.innerHTML;

            const onSuccess = () => {
                if (trigger) {
                    trigger.innerHTML = '<span style="font-size:0.75rem; font-weight:bold; padding: 0 2px;">Copied!</span>';
                    setTimeout(() => { trigger.innerHTML = originalHtml; }, 1500);
                }
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(onSuccess).catch(err => {
                    console.error('[j0:REPL] Clipboard API failed', err);
                });
            } else {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.top = '-9999px';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                try {
                    document.execCommand('copy');
                    onSuccess();
                } catch (err) {
                    console.error('[j0:REPL] Fallback copy failed', err);
                }
                document.body.removeChild(ta);
            }
        });
    }
});