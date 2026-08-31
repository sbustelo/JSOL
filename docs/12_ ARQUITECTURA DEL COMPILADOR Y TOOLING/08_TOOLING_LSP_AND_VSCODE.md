# 08\. ESPECIFICACIÓN DE TOOLING, LSP Y EXTENSIÓN DE VS CODE (JSOL SPEC 0.3.0)

> DISCLAIMER PRE-1.0: Este documento define la especificación target para la versión 0.3.0, en proceso de validación experimental a partir del build de transición 0.2.97. Todo el contenido se encuentra en proceso de iteración y revisión continua. Ninguna interfaz o definición se considera estable o congelada hasta la declaración formal de la versión 1.0.0.

## 1\. ARQUITECTURA DEL SERVIDOR LSP (`jsol-language-server`)

El ecosistema de herramientas de desarrollo de JSOL se fundamenta en un servidor del Protocolo de Servidor de Lenguaje (Language Server Protocol - LSP 3.17) independiente y desacoplado de cualquier editor específico.

```
[VS Code / Neovim / Fleet]
           │
           │ (JSON-RPC over stdio / IPC)
           ▼
┌────────────────────────────────────────────────────────┐
│ jsol-language-server                                   │
│ - Linter Guard (0300-linter-main.jsol)                 │
│ - Escáner AOT y Tabla de Símbolos (0400)               │
│ - Consumidor de SSOT (semantics.json, primitives.json) │
└────────────────────────────────────────────────────────┘
```

### 1.1 Desacoplamiento e Integración con el Compilador

-   **Reuso Directo de Módulos Core:** El servidor LSP consume directamente los módulos del compilador en Node.js (`0300-linter-main.jsol` para validaciones léxicas y `0400-compiler-helpers.jsol` para la Tabla de Símbolos AOT).
-   **Consumo de SSOT Dinámico:** Las reglas de autocompletado, tipos de datos, inspección de firmas y validación de prefijos se leen en tiempo real desde `semantics.json`, `primitives.json` y `types.json`. No existen definiciones de funciones ni firmas hardcodeadas en la extensión o servidor LSP.

## 2\. SERVICIOS Y CAPACIDADES DEL LSP

### 2.1 Diagnósticos en Tiempo Real (Diagnostics / Linter Live)

El servidor ejecuta el Linter en segundo plano ante cada evento de cambio en el documento (`onDidChangeTextDocument`), reportando tres niveles de diagnósticos en la interfaz del editor:

1.  **Errores Fatales (Severity: Error):**
    
    -   **Missing Pragma:** Ausencia del encabezado obligatorio `// @JSOL` en la Línea 1.
    -   **Root Collision:** Declaración de dos variables con distinto tipo físico e idéntica raíz en la misma profundidad de llaves (`$iBraceDepth`). Ej: `let $sCents = "00"; let $qCents = 0;`.
    -   **Missing Delimiter:** Variable cuyo prefijo no está separado de la raíz por `_` o CamelCase (ej. `$satexto` en lugar de `$sa_texto` o `$saTexto`).
    -   **Forbidden Constructs:** Uso de métodos imperativos prohibidos (`.length`, `.map()`, `.filter()`, `with`).
2.  **Advertencias de Migración (Severity: Warning):**
    
    -   Uso de azúcar sintáctico deprecado (ej. `JSOL.use()`).
    -   Inyección de bloques de escape nativo (`JSOL.JS`, `JSOL.PHP`, `JSOL.PY`).
3.  **Sugerencias de Tipo (Severity: Information/Hint):**
    
    -   Identificación de variables genéricas `$s` o `$n` proponiendo su especialización a tipos estáticos como `$sa` o `$ni32`.

### 2.2 Autocompletado Inteligente (CompletionItemProvider)

El autocompletado se divide en dos dominios principales:

-   **Primitivas del Lenguaje:** Al tipear un dominio (ej. `Str.`, `Math.`, `Arr.`), el LSP despliega las funciones registradas en `primitives.json`, mostrando su firma, descripción Markdown y los argumentos esperados.
-   **Símbolos del Contexto Local:** Al tipear `$`, el LSP consulta la Tabla de Símbolos AOT de la posición actual del cursor (filtrando por `$iBraceDepth`) y ofrece exclusivamente las variables declaradas y accesibles en el scope activo.

### 2.3 Inspección al Pasar el Cursor (HoverProvider)

Al posicionar el cursor sobre cualquier identificador o llamada a función:

-   **Sobre Variables:** Muestra el tipo físico resuelto (`physicalType`), la raíz normalizada (`rootName`) y la profundidad de scope (`braceDepth`).
-   **Sobre Primitivas (ej. `Map.get`):** Muestra la firma de la función, la indicación de si es falible (`fallible: true`) y el contrato exacto del Canal Sombra asociado (`$JSOL_m_{v}_ok`, indicando el código de error emitido en caso de falla, como `KEY_NOT_FOUND`).

### 2.4 Acciones Rápidas de Corrección (CodeActions / Quick Fixes)

El LSP expone transformaciones automáticas para resolver errores comunes reportados por el Linter:

-   **Inyección de Delimitador:** Convierte `$satexto` a `$saTexto` o `$sa_texto` con un solo clic.
-   **Sustitución de Propiedad Prohibida:** Reemplaza `$aData.length` por `Arr.count($aData)` para arreglos, o `Str.len($sTexto)` para cadenas.

## 3\. ESPECIFICACIÓN DE LA EXTENSIÓN PARA VS CODE (`vscode-jsol`)

La extensión oficial `vscode-jsol` actúa como cliente ligero del servidor LSP.

### 3.1 Estructura del Paquete

```
vscode-jsol/
├── syntaxes/
│   └── jsol.tmLanguage.json   // Gramática TextMate para resaltado de sintaxis
├── language-configuration.json // Reglas de comentarios, brackets y auto-closing
├── client/
│   └── extension.js           // Cliente LanguageClient acoplado a VS Code API
├── server/
│   └── server.js              // Instancia ejecutable de jsol-language-server
└── package.json               // Contrato de extensión y comandos
```

### 3.2 Resaltado Sintáctico (TextMate Grammar)

La gramática `jsol.tmLanguage.json` asigna identificadores de coloración semántica específicos:

-   **Variables por Prefijo (`variable.other.jsol`):** Otorga colores diferenciados según el tipo de dato indicado en el prefijo (ej. `$n` numérico, `$s` texto, `$a` arreglo, `$m` mapa, `$b` booleano, `$y` bytes).
-   **Dominios de Primitivas (`support.class.jsol`):** Destaca los espacios de nombres de funciones (`Str`, `Math`, `Arr`, `Map`, `Cast`, `Bool`, `JSOL`).
-   **Directiva de Pragma (`keyword.other.pragma.jsol`):** Colorea de forma prominente la cabecera `// @JSOL`.

## 4\. INTEGRACIÓN CON OTROS EDITORES E IDEs

Gracias al protocolo estándar LSP, la experiencia de desarrollo es idéntica en cualquier editor compatible:

-   **Neovim:** Configuración mediante `nvim-lspconfig` apuntando a `jsol-language-server --stdio`.
-   **Sublime Text:** Integración vía paquete `LSP-jsol`.
-   **JetBrains / Fleet:** Adaptador de plugin LSP estándar.

## 5\. APÉNDICE: TABLA DE ESTADO Y TRAZABILIDAD (SPEC 0.3.0 / BUILD 0.2.97)

| Componente / Feature | Estado de Disposición | Build / Target | Notas de Implementación |
| --- | --- | --- | --- |
| Servidor `jsol-language-server` | DECIDIDO | Spec 0.3.0 | Servidor JSON-RPC basado en módulos `0300` y `0400`. |
| Diagnósticos Live (Linter) | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Ejecutado sobre el motor Linter `0300-linter-main.jsol`. |
| Gramática TextMate (`vscode-jsol`) | DECIDIDO | Spec 0.3.0 | Resaltado sintáctico por sigilos y dominios. |
| Quick Fixes (CodeActions) | DECIDIDO | Spec 0.3.0 | Autocorrectores para `.length` y delimitadores faltantes. |
| Inspección Hover de Canal Sombra | DECIDIDO | Spec 0.3.0 | Muestra el tipo de error emitido en `$JSOL_m_{v}_ok`. |

