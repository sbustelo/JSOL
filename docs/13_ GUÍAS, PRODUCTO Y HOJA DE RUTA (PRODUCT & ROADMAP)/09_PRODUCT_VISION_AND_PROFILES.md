# 09\. ESPECIFICACIÓN DE VISIÓN DE PRODUCTO Y PERFILES DE COMPILACIÓN (JSOL SPEC 0.3.0)

> DISCLAIMER PRE-1.0: Este documento define la especificación target para la versión 0.3.0, en proceso de validación experimental a partir del build de transición 0.2.97. Todo el contenido se encuentra en proceso de iteración y revisión continua. Ninguna interfaz o definición se considera estable o congelada hasta la declaración formal de la versión 1.0.0.

## 1\. VISIÓN Y PROPÓSITO DEL LENGUAJE

JSOL es un lenguaje de especificación isomórfico y transpilable AOT (Ahead-Of-Time) diseñado para resolver la fragmentación de lógica de negocio en ecosistemas heterogéneos (Web, Móvil, Backend, Sistemas Embebidos), fundamentando su sistema de tipos en la especificación JSON (`$n`, `$s`, `$a`, `$m`, `$b`, `$y`, `$x`, `$f`).

### 1.1 Principios Fundamentales de Producto

-   **Cero Dependencias de Runtime:** El código compilado no requiere librerías pesadas ni entornos de ejecución propietarios. Transpila a código nativo e idiomático en JavaScript, PHP, Python, TypeScript y C.
-   **Determinismo Isomórfico Absoluto:** Una misma función escrita en JSOL produce exactamente el mismo resultado numérico, lógico y estructural sin importar el runtime target (Node.js, PHP-FPM, C en microcontroladores, Python).
-   **Manejo de Errores Out-of-Band:** Erradica las excepciones no locales y la contaminación de valores de retorno mediante el Canal Sombra (`$JSOL_m_{v}_ok` y `$JSOL_m_lastFunction_ok`).

## 2\. PERFILES DE COMPILACIÓN (COMPILATION PROFILES)

El compilador JSOL permite ajustar las transformaciones de código según los requerimientos de rendimiento y seguridad del entorno de despliegue mediante cuatro perfiles oficiales:

### 2.1 Perfil FAST (Rendimiento Máximo)

-   **Propósito:** Optimizado para entornos de alta frecuencia de ejecución donde la entrada de datos ya ha sido sanitizada previamente en los límites del sistema.
-   **Comportamiento:**
    
    -   Inactivación de comprobaciones de seguridad e inyecciones de guardas de rango en runtime.
    -   Omisión de envolturas defensivas (`TRUNC_CHECKED`).
    -   Despacho estático directo a funciones nativas del host target (O(1)).

### 2.2 Perfil SAFE (Seguridad Estricta / Por Defecto)

-   **Propósito:** Entorno estándar de ejecución para lógica de negocio crítica, financiera o de cálculo.
-   **Comportamiento:**
    
    -   Inyección automática AOT de adaptadores de coerción (`TRUNC_CHECKED`) al asignar flotantes a enteros.
    -   Verificación preventiva de límites de frontera en arreglos y cadenas.
    -   Generación completa de metadatos en el Canal Sombra ante fallos o avisos.

### 2.3 Perfil SILENT (Resiliencia frente a Caídas)

-   **Propósito:** Sistemas de alta disponibilidad donde un fallo de cálculo no debe detener bajo ninguna circunstancia el proceso principal.
-   **Comportamiento:**
    
    -   El hilo de ejecución jamás lanza excepciones ni interrumpe la secuencia.
    -   Ante una falla (ej. división por cero o clave no encontrada), el Canal Sombra registra el error (`ok: false`), mientras que la variable de datos recibe un valor nativo inerte predecible (`0` para números, `""` para strings, `false` para booleanos, `[]` para arreglos).

### 2.4 Perfil DEBUG (Trazabilidad y Depuración Extendida)

-   **Propósito:** Entornos de desarrollo local, depuración interactiva y ejecución en el REPL visual.
-   **Comportamiento:**
    
    -   Payload del Shadow Map extendido: inyecta campos de contexto extra (`details`, argumentos de llamada y origen de la primitiva).
    -   Inyección de nombres de variables originales y símbolos para inspección paso a paso.

## 3\. AUDIENCIA Y CASOS DE USO DEL ECOSISTEMA

-   **Motores de Cálculo y Reglas de Negocio (Calcu-Engines):** Definición de reglas financieras, comisiones, impuestos o cotizaciones escritas una sola vez e integradas nativamente en la app móvil (JS/TS), el backend de pagos (PHP/Python) y procesos batch.
-   **Ciencia del Color y Procesamiento Gráfico (IPAX):** Algoritmos de conversión de espacios de color y modelos de apariencia del color donde los avisos de gama (`GAMUT_CLAMP`) fluyen en el Canal Sombra sin interrumpir la renderización.
-   **Sistemas Embebidos e IoT (JSOL-C):** Lógica transpilada directamente a C estricto para ejecución en hardware con restricciones de memoria y tiempo real.

## 4\. APÉNDICE: TABLA DE ESTADO Y TRAZABILIDAD (SPEC 0.3.0 / BUILD 0.2.97)

| Componente / Feature | Estado de Disposición | Build / Target | Notas de Implementación |
| --- | --- | --- | --- |
| Perfil SAFE (Por Defecto) | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Comportamiento base con canal sombra y adaptadores. |
| Perfil FAST | DECIDIDO | Spec 0.3.0 | Flag de compilación para omitir guardas en la fase AOT. |
| Perfil SILENT | DECIDIDO | Spec 0.3.0 | Mapeo de fallos a valores inertes sin caídas de hilo. |
| Perfil DEBUG | DECIDIDO | Spec 0.3.0 | Expansión de payload en el Shadow Map para REPL/Tooling. |

# 10\. HOJA DE RUTA Y PLAN DE MIGRACIÓN (JSOL SPEC 0.3.0)

> DISCLAIMER PRE-1.0: Este documento define la especificación target para la versión 0.3.0, en proceso de validación experimental a partir del build de transición 0.2.97. Todo el contenido se encuentra en proceso de iteración y revisión continua. Ninguna interfaz o definición se considera estable o congelada hasta la declaración formal de la versión 1.0.0.

## 1\. HITOS DE LA HOJA DE RUTA (ROADMAP)

### 1.1 Build 0.2.97 (Transición y Corrección de Infraestructura) - ESTADO ACTUAL

-   **Infraestructura SSOT & Router:** Implementación del enrutador ciego (_Blind Router_), consumo dinámico de `semantics.json` y `rules.json`, y refactor OCP `$mBackendRegistry`.
-   **Tabla de Símbolos & Linter:** Validación estática de delimitadores (`_` o CamelCase), aislamiento de scope por `$iBraceDepth` y bloqueo por colisión de raíz.
-   **Transparencia Host & Unicode:** Extractor de closures en PHP (`1110`), sanitización Python Nivel 2 (`1220`) y polyfills Unicode por Code Points (`mb_*` y `Array.from`).
-   **Primitivas Core Excel:** Inclusión de `Math.modX`, `Math.roundX`, `Math.logX`, `Math.ln`, y unificación de corte en `Str.sub` y `Arr.slice` a `(start, end)`.

### 1.2 Build 0.2.98 (Estabilización y Purga de Deprecaciones)

-   **Purga Definitiva:** Eliminación total en el compilador del soporte de entrada para características legacy: `JSOL.use()`, `Arr.count`, `Str.replace`, `Str.trim` y `Str.equals`.
-   **Advertencias de Linter:** Emisión de _Warnings_ obligatorios al detectar bloques de escape nativo (`JSOL.JS`, `JSOL.PHP`, `JSOL.PY`).
-   **Estabilización JCF:** Consolidación AOT de la representación intermedia JSOL Canonical Form.

### 1.3 Release 0.3.0 (Congelamiento de Especificación y Distribución)

-   **Congelamiento de Tipos Core:** Tipos de primera clase congelados: `$n`, `$s`, `$a`, `$m`, `$b` + `$y`, `$x`, `$f`.
-   **Extension Packs:** Soporte de manifiesto `extensions.json` para paquetes de dominio externo (Fechas `$d`, Color Science / IPAX).
-   **Artefactos de Release:** Script de build `tools/build-standalone.js` generando las distribuciones standalone y minificadas (`.min.js`).

## 2\. GUÍA DE MIGRACIÓN PARA DESARROLLADORES (USERLAND MIGRATION)

Para adaptar código fuente escrito en versiones anteriores a las reglas estrictas de JSOL 0.3.0, aplique los siguientes reemplazos:

### 2.1 Reemplazo de Propiedades y Métodos Prohibidos

-   **Longitud de Secuencias:**
    
    -   _Incorrecto:_ `$aLista.length` o `Str.replace(...)`
    -   _Correcto:_ Usar `Arr.count($aLista)` para arreglos y `Str.len($sTexto)` para cadenas.
-   **Operador Módulo:**
    
    -   _Incorrecto:_ `$n1 % $n2`
    -   _Correcto:_ `Math.modX($n1, $n2)`
-   **Paso de Contexto en Closures:**
    
    -   _Incorrecto:_ Llamadas manuales `JSOL.use($v1, $v2)`
    -   _Correcto:_ Omitir la llamada; el extractor AOT inyecta automáticamente el paso de contexto.

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
| Script `tools/build-standalone.js` | NOT STARTED | 0.2.97 | Crear script de bundling post-QA. |
| Purga Total de `JSOL.use()` | NOT STARTED | 0.2.98 | Eliminar soporte en la matriz de parseo. |
| Manifiesto `extensions.json` | NOT STARTED | 0.3.0 | Implementar el cargador de Extension Packs. |
