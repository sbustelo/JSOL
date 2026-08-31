# 07\. ESPECIFICACIÓN DE BUNDLING Y DISTRIBUCIÓN DEL COMPILADOR (JSOL SPEC 0.3.0)

> DISCLAIMER PRE-1.0: Este documento define la especificación target para la versión 0.3.0, en proceso de validación experimental a partir del build de transición 0.2.97. Todo el contenido se encuentra en proceso de iteración y revisión continua. Ninguna interfaz o definición se considera estable o congelada hasta la declaración formal de la versión 1.0.0.

## 1\. MODELO DE DESARROLLO VS. ARTEFACTOS DE RELEASE

La arquitectura de construcción de JSOL separa estrictamente el entorno de desarrollo y pruebas (_In-Tree / Source_) del proceso de empaquetado de distribuciones (_Release Pipeline_).

```
[DESARROLLO / PRUEBAS IN-TREE]
Módulos individuales (0300, 0400, 1010, 9000...)
         │
         ▼ (Ejecución de Suite de Pruebas & Contratos QA)
  [QA 100% OK]
         │
         ▼ (Pipeline de Bundling: tools/build-standalone.js)
[ARTEFACTOS DE RELEASE DISTINGUIDOS]
  ├─ Standalone Bundle  (.js / .php / .py)
  └─ Minified Release   (.min.js para npm/browser)
```

### 1.1 Entorno de Desarrollo y Debugging (In-Tree)

Durante la fase de desarrollo, mantenimiento y ejecución de la suite de pruebas:

-   Los compiladores de cada target se mantienen exactamente en su estructura modular (archivos separados por pasadas: `0300-linter-main.jsol`, `0400-compiler-helpers.jsol`, `1010-js-calls.jsol`, `9000-engine-pipeline.jsol`, etc.).
-   Los host runners (`index.js`, `index.php`, `index.py`) leen e incluyen dinámicamente los módulos fuente desde el disco sin requerir ningún paso previo de compilación o concatenación.
-   Esta estructura facilita la trazabilidad de errores, los _stack traces_ precisos por número de archivo y la edición quirúrgica de cada etapa del pipeline.

### 1.2 Pipeline de Distribución Post-QA

El empaquetado y la minificación son etapas exclusivamente de **post-procesamiento de release**:

-   Se ejecutan únicamente **después** de que la suite completa de pruebas unitarias y contratos de compilación (`test-runner.sh`, `contract-runner.js`) haya pasado al 100%.
-   Ningún artefacto de distribución se genera ni se publica si existen fallos en las pruebas.

## 2\. NIVELES DE ARTEFACTOS DE SALIDA (PIPELINE DE DISTRIBUCIÓN)

El proceso de empaquetado genera tres niveles de artefactos equivalentes a la convención clásica `script.src.js` → `script.js` → `script.min.js`:

1.  **Nivel 1: Fuentes Modulares (`*.src.js` / `src/`)**
    
    -   Código fuente completo dividido en módulos numerados.
    -   Orientado a desarrollo, extensión del compilador y ejecución de pruebas de integración.
2.  **Nivel 2: Bundle Standalone (`jsol-compiler.js` / `.php` / `.py`)**
    
    -   Unificación de todos los módulos del motor, polyfills de runtime y diccionarios SSOT (`semantics.json`, `primitives.json`, `targets/*/rules.json`) en un único archivo ejecutable autocontenido.
    -   Permite distribuir el compilador como un solo archivo ejecutable sin dependencias externas de carpeta ni lecturas dispersas de disco.
3.  **Nivel 3: Bundle Minificado (`jsol-compiler.min.js`)**
    
    -   Compresión y minificación opcional aplicada exclusivamente sobre el artefacto JavaScript standalone.
    -   Diseñado para despliegue ligero en entornos donde el tamaño del payload es crítico (paquetes npm, cliente web/browser, REPL visual y extensiones de IDE).

## 3\. ESPECIFICACIÓN DEL SCRIPT DE BUILD (`tools/build-standalone.js`)

El empaquetado AOT de los artefactos de release es orquestado por el script `tools/build-standalone.js` ejecutado sobre Node.js.

### 3.1 Algoritmo de Ejecución del Bundler

1.  **Verificación de QA:** Consulta el estado de la suite de pruebas. Si el flag de validación no es exitoso, aborta el proceso inmediatamente.
2.  **Concatenación de Módulos:** Lee en orden secuencial los archivos `.jsol` del motor y los une en una sola estructura de memoria.
3.  **Incrustación del SSOT:** Inyecta como constantes/literales de código las reglas de `semantics.json` y `targets/*/rules.json`, eliminando la necesidad de parsear archivos JSON externos en runtime.
4.  **Sanitización Léxica:**
    
    -   **PHP (`jsol-compiler.php`):** Remueve etiquetas `<?php` intermedias de los módulos fuente.
    -   **Python (`jsol-compiler.py`):** Eleva (_hoisting_) todas las sentencias `import` de librerías del sistema al inicio del archivo final y elimina duplicados.
5.  **Minificación (Paso Opcional JS):** Pasa el código de `dist/jsol-compiler.js` por el minificador (ej. Terser) para generar `dist/jsol-compiler.min.js`.
6.  **Escritura en `dist/`:** Emite los archivos de release listos para producción en el directorio de salida.

## 4\. INTEGRACIÓN Y CASOS DE USO DE LOS ARTEFACTOS

-   **Desarrollo Local:** Los desarrolladores y contribuidores trabajan directamente sobre los archivos en `src/` (o raíz del proyecto) usando los host runners nativos.
-   **Distribución CLI:** El paquete distribuido para terminales utiliza los bundles standalone (`jsol-compiler.js`, `jsol-compiler.php`, `jsol-compiler.py`).
-   **Integración Web / NPM / REPL:** Aplicaciones web, navegadores o el intérprete visual consumen `jsol-compiler.min.js` cargándolo como un script único e independiente.

## 5\. APÉNDICE: TABLA DE ESTADO Y TRAZABILIDAD (SPEC 0.3.0 / BUILD 0.2.97)

| Componente / Tarea | Estado de Disposición | Build / Target | Notas de Implementación |
| --- | --- | --- | --- |
| Estrategia de Módulos In-Tree | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Módulos numéricos leídos dinámicamente en desarrollo. |
| Pipeline Post-QA | DECIDIDO | Spec 0.3.0 | Empaquetado subordinado al éxito de la suite de pruebas. |
| Script `tools/build-standalone.js` | PENDIENTE 0.2.97 | Build 0.2.97 | Script de concatenación AOT e incrustación SSOT. |
| Generación de `.min.js` | DECIDIDO | Spec 0.3.0 | Minificación opcional para distribución npm/browser. |
