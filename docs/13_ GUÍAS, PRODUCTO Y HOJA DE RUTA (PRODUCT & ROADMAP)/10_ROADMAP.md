# 10\. HOJA DE RUTA Y PLAN DE MIGRACIÓN (JSOL SPEC 0.3.0)

> DISCLAIMER PRE-1.0: Este documento define la especificación target para la versión 0.3.0, en proceso de validación experimental a partir del build de transición 0.2.97. Todo el contenido se encuentra en proceso de iteración y revisión continua. Ninguna interfaz o definición se considera estable o congelada hasta la declaración formal de la versión 1.0.0.

## 1\. HITOS DE LA HOJA DE RUTA (ROADMAP)

### 1.1 Build 0.2.97 (Transición y Corrección de Infraestructura) - ESTADO ACTUAL

PRIORIDAD: implementación completa de la spec actual para 0.3, manteniendo compatibilidad con versión anterior para no romper el build ni los ejemplos.

Para considerar esta versión lista para salir: 
- La spec 0.3 debe estar integramente implementada.
- Los ejemplos deben estar todos actualizados.
- La REPL debe funcionar correctamente en todos los casos.


-   **Infraestructura SSOT & Router:** Implementación del enrutador ciego (_Blind Router_), consumo dinámico de `semantics.json` y `rules.json`, y refactor OCP `$mBackendRegistry`.
-   **Tabla de Símbolos & Linter:** Validación estática de delimitadores (`_` o CamelCase), aislamiento de scope por `$iBraceDepth` y bloqueo por colisión de raíz.
-   **Transparencia Host & Unicode:** Extractor de closures en PHP (`1110-php-use-extractor.jsol`), sanitización Python Nivel 2 (`1220-py-translators.jsol`) y polyfills Unicode por Code Points (`mb_*` en PHP y `Array.from` en JavaScript).
-   **Primitivas Core 0.3 & Excel:** Inclusión de `Math.modX`, `Math.roundX`, `Math.logX`, `Math.ln`, y unificación de corte en `Str.sub` y `Arr.slice` a `(start, end)`.


### 1.2 Build 0.2.98 (Estabilización y Purga de Deprecaciones)

-   **Purga Definitiva:** Eliminación total en el compilador del soporte de entrada para características legacy (de versiones anteriores de JSOL): `JSOL.use()`, `Arr.count`, `Str.replace`, `Str.trim` y `Str.equals`.
-   **Advertencias de Linter:** Emisión de _Warnings_ obligatorios al detectar bloques de escape nativo (`JSOL.JS`, `JSOL.PHP`, `JSOL.PY`).
-   **Estabilización JCF:** Consolidación AOT de la representación intermedia JSOL Canonical Form (JCF) para eliminar operadores infijos intermedios.

### 1.3 Release 0.3.0 (Congelamiento de Especificación y Distribución)

-   **Congelamiento de Tipos Core:** Tipos de primera clase congelados: `$n`, `$s`, `$a`, `$m`, `$b` + `$y`, `$x`, `$f`.
-   **Extension Packs:** Soporte de manifiesto `extensions.json` para paquetes de dominio externo (Fechas `$d`, Color Science / IPAX).
-   **Artefactos de Release:** Script de build `tools/build-standalone.js` generando las distribuciones standalone y minificadas (`.min.js`).

## 2\. GUÍA DE MIGRACIÓN PARA DESARROLLADORES (USERLAND MIGRATION)

Para adaptar código fuente escrito en versiones anteriores a las reglas estrictas de JSOL 0.3.0, apli
que los siguientes reemplazos:

### 2.1 Reemplazo de Propiedades y Métodos Prohibidos

-   **Longitud de Secuencias:**
    
    -   _Incorrecto:_ `$aLista.length` o `Str.replace(...)`
    -   _Correcto:_ Usar `Arr.count($aLista)` para arreglos y `Str.len($sTexto)` para cadenas.
-   **Operador Módulo:**
    
    -   _Incorrecto:_ `$n1 % $n2`
    -   _Correcto:_ `Math.modX($n1, $n2)`
-   **Paso de Contexto en Closures:**
    
    -   _Incorrecto:_ Llamadas manuales `JSOL.use($v1, $v2)`
    -   _Correcto:_ Omitir la llamada; el extractor AOT inyecta automáticamente el paso de contexto en PHP.

### 2.2 Unificación de Firmas y Desuso de Tipos Legacy

-   **Subcadena por Rango:**
    
    -   _Incorrecto:_ `Str.sub($s, $start, $len)` (por longitud)
    -   _Correcto:_ `Str.sub($s, $start, $end)` (por índice de fin exclusivo, idéntico a `Arr.slice`).
-   **Migración de Tipos Enteros:**
    
    -   _Legacy (0.2.97):_ Prefijos `$i` y `$q` (soportados vía mapeo AOT provisional).
    -   _Objetivo (0.3.0):_ Usar explícitamente `$ni32` y `$ni64`.

## 3\. CHECKLIST DE AUDITORÍA Y TRAZABILIDAD (ROADMAP TO 0.3.0)

| Tarea / Hito | Estado | Target Build | Acción Requerida |
| --- | --- | --- | --- |
| Polyfills Unicode Code Points | DONE | 0.2.97 | Verificado en `polyfills.js` y `polyfills.php`. |
| Blind Router y Registry OCP | DONE | 0.2.97 | Verificado en `1010-js-calls.jsol` y `9000-engine-pipeline.jsol`. |
| Extractor Closures PHP | DONE | 0.2.97 | Verificado en `1110-php-use-extractor.jsol`. |
| Integración Primitivas `Math.*X` | WIP | 0.2.97 | Sincronizar entradas en `primitives.json`. |
| Script `tools/build-standalone.js` | NOT STARTED | 0.2.98 | Crear script de bundling post-QA. |
| Purga Total de `JSOL.use()` | NOT STARTED | 0.2.98 | Eliminar soporte en la matriz de parseo. |
| Manifiesto `extensions.json` | NOT STARTED | 0.3.0 | Implementar el cargador de Extension Packs. |

