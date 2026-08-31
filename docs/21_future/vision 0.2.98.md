# VISIÓN Y HOJA DE RUTA: VERSIÓN 0.2.98 y más allá

**OBJETIVO PRINCIPAL:** La versión 0.2.98 está proyectada como Release de Estabilización de la Spec 0.3.0. Congela la sintaxis, elimina la deuda técnica heredada, introduce la Arquitectura Modular para la Librería Estándar (Core-1/Core-2), consolida la arquitectura de pruebas basada en el SSOT e introduce la Fase de Representación Intermedia (JCF).

## 1. PURGA DEFINITIVA DE DEPRECACIONES (HARD BREAK)
En 0.2.97 se mantuvieron vivas las reglas de transpilación para código legacy y así evitar que el compilador se bloqueara a sí mismo. En 0.2.98, se eliminan físicamente del SSOT (`primitives.json` y `rules.json`):

- Eliminación de `Arr.count`, `Str.replace` (forzando `replaceAll`), `Str.trim` y `JSOL.use()`.
- Linter Fatal Error si se detecta el operador módulo `%` en Userland.
- Linter Warning si se detectan bloques de escape nativo (`JSOL.JS`, `JSOL.PHP`, `JSOL.PY`), desaconsejando romper el isomorfismo.

## 2. ARQUITECTURA MODULAR Y STANDARD LIBRARY (CORE-1 / CORE-2)
Para evitar la deuda técnica de escribir polyfills tres veces (JS, PHP, Python), 0.2.98 implementa una arquitectura verdaderamente modular donde las funciones complejas o divergentes (Core-1 y Core-2) se resuelven mediante archivos independientes escritos 100% en JSOL puro.

**Implementación del Linker/Discovery:**
1. **Orquestación:** Creación de un script Bash (`tools/build-standalone.js` o similar) que realice el *discovery* de los archivos `.jsol` en el directorio de la Librería Estándar y los pre-concatene en un único `stdlib.jsol`.
2. **Inyección en Pipeline:** Modificación de los orquestadores (`index.js`) y `targets.json` para que el código compilado de `stdlib.jsol` se inyecte como `prefix` en todos los archivos de salida, asegurando que las funciones (ej. `Str_Trim`) estén en scope para Userland.
3. **Limpieza del SSOT:** Las primitivas CORE-2 desaparecen del mapeo de `operations` en `rules.json`. Al estar escritas en JSOL, el compilador las trata como funciones estándar del usuario, eliminando la delegación forzada al lenguaje host.

**Funciones a implementar bajo esta nueva arquitectura en 0.2.98:**
- `Str.trim` (CORE-2): Algoritmo canónico escrito en puro JSOL.
- `Math.min`, `Math.max` (CORE-1): Wrappers para inyectar la sombra `NAN_ARGUMENT`.
- `Arr.map`, `Arr.filter`, `Arr.reduce` (CORE-2): Iteradores estrictos con control de contexto.
- `Arr.concat`, `Map.merge` (CORE-2): Fusión inmutable procedimental.
- `Arr.eq`, `Arr.neq`, `Map.eq`, `Map.neq` (CORE-2): Comparación profunda (Deep compare recursivo).
- `Cast.toBool`, `Cast.toIntBase`, `Cast.toStrBase` (CORE-1/2): Validación estricta de radix.
- `JSOL.times` (CORE-2): Estructura de control custom.


# v0.2.99 ?

## 3. IMPLEMENTACIÓN DE JCF (JSOL CANONICAL FORM)
Desazucarado Ahead-Of-Time (AOT) interno. El compilador abstraerá las asignaciones infijas hacia una representación aplicativa antes de pasarlas al Blind Router.

- Implementación de `JSOL.LET(target, expr, sourceRef)`.
- **Bandera de Debugging CLI:** Inyección del argumento `--emit-jcf` para guardar el estado intermedio en un archivo `.jsol.jcf.js`. Crítico para aislar bugs al mostrar exactamente cómo el motor aplanó los operadores.

## 4. CIERRE DE SYMBOL TABLE Y CANAL DE SOMBRAS
Con la fase JCF en pie, el compilador puede trackear asignaciones de forma segura, habilitando:

- **Coerción LHS-Driven (`TRUNC_CHECKED`):** El compilador detectará si una expresión `$n` (Float) se asigna a una variable `$ni32` (Integer) e inyectará automáticamente el adaptador de coerción, garantizando la seguridad en perfiles de bajo nivel (C, Rust) sin obligar casteos manuales.
- **Sombras Nombradas:** Despliegue de `$JSOL_m_{v}_ok` para asignaciones directas, superando el mapa anónimo `$JSOL_m_lastFunction_ok`.
- **Evaluación LAZY de Cadenas:** Memoización de subtipos `"sa"` (ASCII) y `"su"` (Unicode) en la sombra de cadenas genéricas, y su propagación O(1) vía operaciones AND lógicas en funciones como `Str.concat`.

## 5. SSOT-DRIVEN TESTING (ESPECIFICACIÓN EJECUTABLE)
Migración del paradigma de QA. El compilador pasa a ser auto-validable por definición.

- Creación del subdirectorio `domains/contracts/` para JSONs de validación normativa (ej. `math.contracts.json`).
- Refactorización de `tools/contract-runner.js`: Dejará de parsear bloques `@contract` en archivos estáticos. Leerá los contratos directamente desde el SSOT, generará el código JSOL dinámicamente en memoria, lo compilará y afirmará la Paridad Determinista Cross-Target (Differential Conformance Testing).

## 6. EXPLORACIÓN POST-0.3: EL KIT BOOTSTRAPPER PARA JSOL-C
Para alcanzar la versión 1.0, el compilador debe poder emitir C (el target más restrictivo). En 0.2.98 se redactará el documento de diseño fundacional que define esta estrategia.

- **El Problema:** El compilador actual usa enrutadores ciegos que asumen Garbage Collection. Un transpilador para C/Go/Rust implica duplicar y adaptar demasiada lógica de gestión de memoria.
- **La Solución (Bootstrapper de 2 Fases):** Aislar un "JSOL-C Mínimo" y un "Bootstrapper C Mínimo" en un directorio independiente del `jsol-compiler-src` actual. Este kit será la llave maestra para el autohospedaje en ecosistemas de memoria manual, asegurando el cumplimiento del SSOT en targets de bajo nivel.