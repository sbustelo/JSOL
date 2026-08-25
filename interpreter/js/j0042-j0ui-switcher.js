/* j042-j0ui-switcher.js — V1.0.0 */
/* Switcher : muestra un panel, oculta el resto dentro de un scope.              */
/* Activator: marca un trigger como activo, desmarca sus hermanos.               */
/* Ambos son funciones públicas en window.j0.ui.                                 */
/* Los tabs usan ambos. El inspector contextual usará solo el Switcher via bus.  */

(function () {
    'use strict';

    window.j0.ui = window.j0.ui || {};

    /* -------------------------------------------------------------------------
       SWITCHER
       scope  : elemento DOM o string → busca [data-j0-pane-group="string"]
       key    : valor de data-j0-panel a mostrar. null/undefined = oculta todos.
       ------------------------------------------------------------------------- */
window.j0.ui.switchPane = function (scope, key) {
        const container = (typeof scope === 'string')
            ? document.querySelector(`[data-j0-pane-group="${scope}"]`)
            : scope;

        if (!container) {
            if (window.j0?.logger) window.j0.logger.warn(`[j0ui:Switcher] scope no encontrado:`, scope);
            return;
        }

        container.querySelectorAll('[data-j0-panel]').forEach(panel => {
            // [!] FIX ESTRUCTURAL: Prevenir que el querySelector perfore contenedores anidados.
            // Solo operamos si el panel pertenece directamente a este grupo.
            const parentGroup = panel.closest('[data-j0-pane-group]');
            if (parentGroup === container) {
                const isTarget = panel.getAttribute('data-j0-panel') === key;
                panel.classList.toggle('j0ui-active', isTarget);
            }
        });
    };

    /* -------------------------------------------------------------------------
       ACTIVATOR
       group : elemento DOM que contiene los triggers (ej: .j0ui-tabs-row)
       item  : el trigger a marcar como activo
       ------------------------------------------------------------------------- */
    window.j0.ui.activateItem = function (group, item) {
        if (!group || !item) return;
        group.querySelectorAll('[data-j0-target]').forEach(t => t.classList.remove('j0ui-active'));
        item.classList.add('j0ui-active');
    };

    /* -------------------------------------------------------------------------
       DELEGATE UNIFICADO PARA TABS
       Escucha clicks en cualquier [data-j0-target] dentro de un [data-j0-tab-group].
       Llama a activateItem + switchPane.
       NO escucha tabs sin data-j0-tab-group (evita colisiones con otros usos de
       data-j0-target como dropdowns u otros switchers programáticos).
       ------------------------------------------------------------------------- */
    window.j0.DOM.delegate(document, 'click', '[data-j0-target]', '[data-j0-tab-group]', (trigger, tabGroup) => {
        const key = trigger.getAttribute('data-j0-target');

        // Activator: marca el trigger activo dentro del tab-group
        window.j0.ui.activateItem(tabGroup, trigger);

        // Switcher: encuentra el pane-group asociado
        // Primero busca por data-j0-pane-group explícito en tab-group,
        // si no lo tiene, usa el ancestro más cercano con data-j0-pane-group.
        const groupRef  = tabGroup.getAttribute('data-j0-tab-group');
        
        // [!] FIX LEY 51 y 52: Buscar el contenedor de paneles SOLO dentro de la ventana/módulo actual, jamás global.
        const scopeEl = tabGroup.closest('j0-window, j0-mount, body');
        const paneGroup = groupRef
            ? scopeEl.querySelector(`[data-j0-pane-group="${groupRef}"]`)
            : tabGroup.closest('[data-j0-pane-group]') || tabGroup.parentElement;

        window.j0.ui.switchPane(paneGroup, key);
    });

    if (window.j0?.logger) window.j0.logger.log('[j0ui:Switcher] inicializado.');

})();
