/* PATH: interpreter/js/j0010-bus.js */
/* NUEVO ARCHIVO */
/* V1.0.0 - j0 Micro EventBus Polyfill (Standalone REPL) */
(function() {
    'use strict';
    window.j0 = window.j0 || {};
    
    if (!window.j0.bus) {
        const _listeners = {};
        
        window.j0.bus = {
            on(event, callback) {
                if (!_listeners[event]) _listeners[event] = [];
                _listeners[event].push(callback);
            },
            emit(event, payload) {
                if (_listeners[event]) {
                    _listeners[event].forEach(cb => {
                        try { cb(payload); } catch (e) { console.error(`[j0.bus] Error in listener for ${event}:`, e); }
                    });
                }
            }
        };
    }
})();