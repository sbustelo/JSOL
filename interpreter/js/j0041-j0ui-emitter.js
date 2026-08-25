/* PATH: ./src/0020-j0ui-system--public-web/j0041-j0ui-emitter.js */
(function () {
    'use strict';

    const _emit = (trigger, context, e) => {
        // [!] ESCUDO ANTI-PIERCING (NIVEL OS):
        // Anula el click sintético fantasma de 300ms en Safari/Android.
        if (e.type === 'touchend' && e.cancelable) {
            e.preventDefault();
        }

        const now = Date.now();
        const lastEmit = parseInt(trigger.getAttribute('data-j0-last-emit') || '0', 10);
        if (now - lastEmit < 50) return; 
        trigger.setAttribute('data-j0-last-emit', now.toString());

        if (trigger.classList.contains('is-disabled') || trigger.hasAttribute('disabled')) {
            if (window.j0?.logger) window.j0.logger.warn(`[j0ui:Emitter] Ignorado por is-disabled: "${trigger.getAttribute('data-j0-action')}"`);
            return;
        }

        const action = trigger.getAttribute('data-j0-action');
        if (!action) return;

        let payload = { trigger, originalEvent: e };
        const raw = trigger.getAttribute('data-j0-payload');
        if (raw) {
            try { Object.assign(payload, JSON.parse(raw)); }
            catch (err) {
                if (window.j0?.logger) window.j0.logger.warn(`[j0ui:Emitter] payload JSON inválido en "${action}":`, raw);
            }
        }

        window.j0.bus.emit(action, payload);
        if (window.j0?.logger) window.j0.logger.log(`[j0ui:Emitter] → "${action}"`, payload);
    };

    window.j0.DOM.delegate(document, 'touchend', '[data-j0-action]', null, _emit);
    window.j0.DOM.delegate(document, 'click', '[data-j0-action]', null, _emit);
})();