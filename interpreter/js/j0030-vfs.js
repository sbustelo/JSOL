/**
 * J0 VFS — Virtual File System (Capa de Persistencia Orquestada)
 *
 * PERFILES DE PERSISTENCIA:
 * - 'local-cache' (Default): Ultra rápido, exclusivo del cliente.
 * - 'ui-sync': LocalStorage + Micro-Cookie densa para SSR (Cero FOUC).
 */

(function () {
    'use strict';

    window.j0      = window.j0      || {};
    window.j0.vfs  = window.j0.vfs  || {};

    // -------------------------------------------------------------------------
    // MOTOR DE PERFIL: UI-SYNC (MICRO-PAYLOAD COOKIE)
    // -------------------------------------------------------------------------
    
    // Diccionario de compresión (Key de 1 letra, valores de 1 letra)
    const UI_MAP = {
        'fs-theme': { key: 't', encode: v => v === 'light' ? 'l' : 'd', decode: v => v === 'l' ? 'light' : 'dark' }
        // Futuro: 'fs-sidebar': { key: 's', encode: v => v === 'open' ? 'o' : 'c', decode: ... }
    };

    window.j0.vfs._readUiCookie = function() {
        const match = document.cookie.match(new RegExp('(^| )j0_ui=([^;]+)'));
        if (!match) return {};
        const str = decodeURIComponent(match[2]);
        const obj = {};
        str.split('|').forEach(part => {
            const [k, v] = part.split(':');
            for (const [vfsKey, def] of Object.entries(UI_MAP)) {
                if (def.key === k) obj[vfsKey] = def.decode(v);
            }
        });
        return obj;
    };

    window.j0.vfs._writeUiCookie = function() {
        const parts = [];
        for (const [vfsKey, def] of Object.entries(UI_MAP)) {
            const val = localStorage.getItem(vfsKey); 
            if (val !== null && val !== 'night') {
                parts.push(`${def.key}:${def.encode(val)}`);
            }
        }
        const cookieVal = parts.join('|');
        const base = window.j0.basePath || '/';
        document.cookie = `j0_ui=${encodeURIComponent(cookieVal)}; path=${base}; max-age=31536000; SameSite=Lax`;
    };

    // Reconciliación: La Cookie manda sobre el LocalStorage en caso de amnesia o limpieza parcial
    window.j0.vfs._reconcileUiSync = function() {
        const cookieState = window.j0.vfs._readUiCookie();
        for (const [vfsKey, val] of Object.entries(cookieState)) {
            const currentLs = localStorage.getItem(vfsKey);
            if (currentLs !== val) {
                localStorage.setItem(vfsKey, val);
            }
        }
    };

    // BOOT INMEDIATO: Conciliamos el estado en el instante que el JS se parsea
    window.j0.vfs._reconcileUiSync();

    // -------------------------------------------------------------------------
    // API PUBLICA VFS
    // -------------------------------------------------------------------------

    window.j0.vfs.get = function (key, defaultValue = null, maxAgeMs = 0) {
        try {
            if (maxAgeMs > 0) {
                const shadowTime = localStorage.getItem('__j0t_' + key);
                if (shadowTime) {
                    const age = Date.now() - parseInt(shadowTime, 10);
                    if (age > maxAgeMs) {
                        window.j0.vfs.remove(key);
                        return defaultValue;
                    }
                }
            }
            const val = localStorage.getItem(key);
            return val !== null ? val : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    };

    window.j0.vfs.set = function (key, value, options = {}) {
        try {
            localStorage.setItem(key, value);
            localStorage.setItem('__j0t_' + key, Date.now().toString());

            // Delegación de perfil estructural
            if (options.profile === 'ui-sync') {
                window.j0.vfs._writeUiCookie();
            }
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                window.j0.bus.emit('vfs:quota-exceeded', { key });
            }
            return false;
        }
    };

    window.j0.vfs.remove = function (key) {
        try {
            localStorage.removeItem(key);
            localStorage.removeItem('__j0t_' + key);
            // Si eliminamos una key que pertenece a ui-sync, reescribimos la cookie para purgarla
            if (UI_MAP[key]) window.j0.vfs._writeUiCookie();
        } catch (e) {}
    };

    window.j0.vfs.getSignatureEnabled = function () {
        return window.j0.vfs.get('fs_add_signature', 'true') !== 'false';
    };

    window.j0.vfs.setSignatureEnabled = function (isEnabled) {
        window.j0.vfs.set('fs_add_signature', isEnabled ? 'true' : 'false');
    };
})();