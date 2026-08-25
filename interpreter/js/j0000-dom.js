/* PATH: interpreter/js/j0000-dom.js */
/* REEMPLAZAR ARCHIVO COMPLETO */
/* V4.1.7 - j0 Universal DOM Bridge (Purgado de lógica de Userland) */
(function() {
    // FIX: Inicialización segura del namespace antes de inyectar propiedades
    window.j0 = window.j0 || {};
    
    window.j0.DOM = {
        
        find(contextEl, selector, isRequired = true) {
            if (!contextEl) return null;

            let el = contextEl.querySelector(selector);
            
            if (!el) {
                let altSelector = selector.includes('j0-id') ? selector.replace(/j0-id/g, 'j0-ref') : selector.replace(/j0-ref/g, 'j0-id');
                el = contextEl.querySelector(altSelector);
                
                if (!el) {
                    let legacySelector = altSelector.replace(/j0-id|j0-ref/g, 'k1j-');
                    el = contextEl.querySelector(legacySelector);
                    if (!el) {
                        legacySelector = altSelector.replace(/j0-id|j0-ref/g, '∂-');
                        el = contextEl.querySelector(legacySelector);
                    }
                }
            }
            
            if (!el && isRequired && window.j0.debugMode) {
                if (window.j0.logger) window.j0.logger.warn(`[j0:DOM] Missing required element: '${selector}'`, { contextClass: contextEl.className });
            }
            
            return el;
        },

        delegate(rootElement, eventType, triggerSelector, contextSelector, callback) {
            rootElement.addEventListener(eventType, (e) => {
                let trigger = e.target.closest(triggerSelector);
                
                if (!trigger) {
                    let altTrigger = triggerSelector.includes('j0-id') ? triggerSelector.replace(/j0-id/g, 'j0-ref') : triggerSelector.replace(/j0-ref/g, 'j0-id');
                    trigger = e.target.closest(altTrigger);
                }

                if (!trigger) return;
                
                let context = document;
                if (contextSelector) {
                    context = trigger.closest(contextSelector);
                    if (!context) {
                        let altContext = contextSelector.includes('j0-id') ? contextSelector.replace(/j0-id/g, 'j0-ref') : contextSelector.replace(/j0-ref/g, 'j0-id');
                        context = trigger.closest(altContext);
                    }
                }
                
                callback(trigger, context, e);
            });
        }
    };

    // window.K1 = window.K1 || {}; window.K1.DOM = window.j0.DOM;
    // window.dx = window.dx || {}; window.dx.DOM = window.j0.DOM;
})();