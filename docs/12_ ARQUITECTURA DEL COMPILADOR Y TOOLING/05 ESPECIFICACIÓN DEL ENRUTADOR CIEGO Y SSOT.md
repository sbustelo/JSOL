# 05\. ESPECIFICACIÓN DEL ENRUTADOR CIEGO Y SSOT (JSOL SPEC 0.3.0)

> DISCLAIMER PRE-1.0: Este documento define la especificación target para la versión 0.3.0, en proceso de validación experimental a partir del build de transición 0.2.97. Todo el contenido se encuentra en proceso de iteración y revisión continua. Ninguna interfaz o definición se considera estable o congelada hasta la declaración formal de la versión 1.0.0.

## 1\. ARQUITECTURA DEL ENRUTADOR CIEGO (BLIND ROUTER)

El núcleo del compilador JSOL v0.3.0 abandona por completo el reemplazo de sintaxis hardcodeado en el código fuente. Opera como un **Enrutador Ciego (Blind Router)** que no posee conocimiento directo de los lenguajes de destino: el motor de compilación no contiene un solo literal que refiera a sintaxis específica de JavaScript, PHP, Python o C (desconoce palabras como `substring`, `mb_substr`, `strlen` o `int32_t`).

El compilador actúa como un procesador genérico de patrones que consume un **Single Source of Truth (SSOT)**. Su función se limita a:

1.  Analizar el código fuente JSOL extrayendo firmas de invocación y estructuras.
2.  Consultar la Tabla de Símbolos AOT para identificar los tipos de los operandos.
3.  Evaluar la semántica universal para determinar el método de despacho (_static_ vs _dynamic_).
4.  Cargar la plantilla sintáctica correspondiente desde el diccionario del target solicitado y realizar la sustitución posicional de argumentos y metadatos.

```
[Código Fuente JSOL] ───> [Escáner AOT & Tabla Símbolos]
                                    │
                                    ▼
[Enrutador Ciego] <─── [Semántica Universal: semantics.json]
       │
       ├───────────────────┬───────────────────┐
       ▼                   ▼                   ▼
[rules.json JS]     [rules.json PHP]    [rules.json C]
       │                   │                   │
       ▼                   ▼                   ▼
 (Código JS)         (Código PHP)        (Código C)
```

## 2\. ESTRUCTURA Y NORMAS DEL SSOT (SINGLE SOURCE OF TRUTH)

Toda la verdad sobre el lenguaje JSOL, sus tipos y su emisión sintáctica se divide estrictamente en dos capas declarativas JSON.

### 2.1 Semántica Universal (`domains/core/semantics.json`)

Es el conocimiento abstracto del lenguaje JSOL, idéntico e invariable para todos los lenguajes target.

-   **Familias de Tipos (`families`):** Clasifica los tipos según su comportamiento de despacho y su rango de dominancia (_rank_):
    
    -   **Tipos Estáticos (`dispatch: "static"`):** Subtipos físicos concretos con un rango numérico explícito (`rank`). Ejemplo en la familia `string`: `$sa` (`rank: 10`), `$su` (`rank: 20`). Ejemplo en `numeric`: `$ni32` (`rank: 10`), `$ni64` (`rank: 20`), `$nf32` (`rank: 30`), `$nf64` (`rank: 40`).
    -   **Tipos Dinámicos (`dispatch: "dynamic"`):** Tipos genéricos que representan incertidumbre en compilación (`$s`, `$n`). Tienen `"rank": null`, lo que impide que ganen por precedencia a un tipo estático y obliga al enrutador a derivar la operación a un _fallback_ de runtime.
-   **Salidas de Función (`function_outputs`):** Dicta el tipo de dato físico retornado naturalmente por cada primitiva (ej. `Math.div` siempre retorna `$nf64`, `Str.len` retorna `$ni32`).
-   **Matriz de Coerción (`coercions`):** Define las reglas de conversión cuando el tipo de destino (LHS) no coincide con el tipo retornado por la expresión (RHS). Asigna adaptadores explícitos (ej. de `$nf64` a `$ni32` asigna `"TRUNC_CHECKED"`) o declara la prohibición de la conversión (`"mode": "forbidden"`).

### 2.2 Sintaxis Target (`targets/<lang>/rules.json`)

Es la realización sintáctica en un lenguaje de destino específico. No contiene lógica de decisión, únicamente mapas de plantillas y reglas de sustitución.

-   **Operaciones (`operations`):**
    
    -   `type`: Tipo de regla (`call`, `block`, `binary`, `unary`).
    -   `dispatch`: Define el modo de despacho (`single` sobre un argumento principal, o `multi` sobre múltiples operandos) y la familia participante.
    -   `variants`: Mapeo de plantillas para tipos estáticos.
    -   `fallback`: Plantilla de reserva invocada cuando participa un tipo dinámico (`$s` o `$n`).
-   **Transformaciones (`transforms`):** Definición sintáctica de los adaptadores de coerción inyectados por la VM (ej. `"TRUNC_CHECKED"` se emite como `Math.trunc({1})` en JS, y como `jsol_trunc_safe({1}, &{shadowMap:0})` en C).
-   **Metadatos (`meta`):** Define plantillas de infraestructura del lenguaje, como la referencia al Canal Sombra (`shadow_map_ref`).

## 3\. SUSTITUCIÓN Y RESOLUCIÓN DE PLANTILLAS

### 3.1 Proceso de Selección de Variante

Cuando el Enrutador Ciego procesa una invocación (ej. `Str.sub($saTexto, 0, 5)`):

1.  Lee los tipos de los argumentos participantes desde la Tabla de Símbolos AOT (`$saTexto` → `$sa`).
2.  Consulta `semantics.json`. Al verificar que todos los argumentos relevantes tienen `"dispatch": "static"`, selecciona la variante de mayor `rank` (`$sa`).
3.  Busca en `targets/<lang>/rules.json` la clave `"sa"` dentro de `operations["Str.sub"].variants`.
4.  Si participa un argumento con `"dispatch": "dynamic"` (`$sTexto` → `$s`), ignora las variantes estáticas y carga directamente la plantilla de `"fallback"`.
5.  Si un target de bajo nivel (ej. JSOL-C) carece de variante estática y de fallback para una combinación de tipos, el compilador frena AOT con el error `TARGET_CAPABILITY_MISSING`.

### 3.2 El Marcador Paramétrico `{shadowMap:N}`

Para inyectar referencias al Canal Sombra de las variables sin hardcodear sintaxis en el motor:

1.  El Enrutador Ciego detecta el token `{shadowMap:N}` en una plantilla de `rules.json` (donde `N` es el índice del argumento).
2.  Extrae la variable ubicada en la posición `N` de los argumentos recibidos.
3.  Si el argumento es una variable (ej. `$nPos`), extrae su raíz normalizada desde la Tabla de Símbolos (`pos`). Si es un literal inyectado por la VM AOT (ej. `"nPos"`), toma la cadena cruda.
4.  Carga la plantilla `meta.templates.shadow_map_ref` del target actual (ej. `$JSOL_m_{root}_ok` para JS/PHP, o `JSOL_m_{root}_ok` para C).
5.  Sustituye `{root}` por la raíz extraída e inyecta la variable de sombra resultante en la posición del marcador.

## 4\. TABLA DE SÍMBOLOS AOT Y AISLAMIENTO DE SCOPE

### 4.1 Escáner AOT y Delimitadores (Regla del Linter)

Durante la Pasada 1 de escaneo, el compilador analiza las declaraciones de variables:

-   **Longest-Prefix Match:** Compara el prefijo de la variable contra la lista de tipos en `semantics.json`, extrayendo el tipo físico más largo que matchee (ej. `$ni32Pepito` → tipo `$ni32`).
-   **Delimitador Obligatorio:** El prefijo y la raíz de la variable DEBEN estar separados por un guion bajo (`_`) o por CamelCase (salto a mayúscula). Si no se detecta delimitador (ej. `$satexto`), el Linter detiene la compilación con un Error Fatal (`LINTER_PREFIX_DELIMITER_REQUIRED`).
-   **Normalización de Raíz:** La raíz del nombre se convierte e independiza a minúsculas. `$ni32Pepito`, `$ni32_pepito` y `$ni32_PEPITO` mapean exactamente a la misma raíz interna: `"pepito"`.

### 4.2 Registro y Aislamiento de Scope por Pila (`$iBraceDepth`)

Cada entrada en la Tabla de Símbolos AOT almacena:

-   `canonicalName`: Identificador completo con prefijo (ej. `$ni32Pepito`).
-   `physicalType`: Subtipo físico resuelto (ej. `ni32`).
-   `rootName`: Raíz normalizada (ej. `pepito`).
-   `braceDepth`: Profundidad de llaves en la que fue declarada (`$iBraceDepth`).

**Mecanismo de Purgado por Scope:** El compilador mantiene el contador `$iBraceDepth`. Al detectar una llave de apertura `{`, `$iBraceDepth` incrementa. Al detectar una llave de cierre `}`, el escáner elimina de la Tabla de Símbolos todas las entradas cuya propiedad `braceDepth` coincide con el nivel que se cierra. Esto aísla los contextos y permite reutilizar la misma raíz en bloques `if` o bucles paralelos sin generar colisiones ni interferencias.

### 4.3 Detección de Colisiones de Raíz

Si dentro de la misma profundidad de scope (`$iBraceDepth`) se intentan declarar dos variables con distinto tipo físico pero idéntica raíz (ej. `let $sCents = "00";` y `let $qCents = 0;`), el Linter aborta la compilación AOT con el error fatal `LINTER_FATAL_ROOT_COLLISION`.

## 5\. MEDIACIÓN DE TIPOS Y COERCIÓN LHS-DRIVEN

En JSOL, la declaración de tipo del lado izquierdo de la asignación (LHS, _Left-Hand Side_) actúa como un contrato absoluto que domina sobre el tipo producido por la expresión del lado derecho (RHS, _Right-Hand Side_).

### 5.1 Inyección AOT de Adaptadores de Coerción

1.  **Evaluación de Tipos:** El compilador analiza una asignación. Consulta `semantics.json#function_outputs` para obtener el tipo de retorno natural del RHS.
    
    -   Ejemplo: `let $ni32_resultado = Math.div($nA, $nB);`
    -   El LHS declara un entero físico `$ni32`. El RHS (`Math.div`) produce un flotante `$nf64`.
2.  **Consulta de la Matriz de Coerción:** El compilador busca en `semantics.json#coercions` la intersección entre el origen `$nf64` y el destino `$ni32`. Obtiene el adaptador de coerción correspondiente: `"TRUNC_CHECKED"`.
3.  **Inyección en JCF:** La VM AOT reescribe la asignación inyectando el adaptador alrededor del RHS:
    
    JSOL.LET("resultado",TRUNC\_CHECKED("resultado",Math.div($nA,$nB)))
    
4.  **Emisión Ciega:** El Enrutador Ciego recibe la función `TRUNC_CHECKED`, busca su plantilla en `targets/<lang>/rules.json#transforms` y sustituye los valores sin necesidad de evaluar reglas de tipo en tiempo de emisión.

## 6\. APÉNDICE: TABLA DE ESTADO Y TRAZABILIDAD (SPEC 0.3.0 / BUILD 0.2.97)

| Componente / Feature | Estado de Disposición | Build / Target | Notas de Implementación |
| --- | --- | --- | --- |
| Arquitectura Enrutador Ciego | IMPLEMENTADO / ESTABLE | Build 0.2.97 | $fProcessCall consume plantillas del SSOT sin hardcodeo en motor. |
| SSOT `semantics.json` | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Estructura de familias, rangos estáticos y despacho configurado. |
| SSOT `rules.json` (Targets) | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Plantillas con `variants`, `fallback` y `{shadowMap:N}`. |
| Tabla de Símbolos por Raíz | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Mapeo por `rootName` en `0400-compiler-helpers.jsol`. |
| Isolation de Scope por `$iBraceDepth` | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Purgado de símbolos al cerrar llaves `{}`. |
| Inyección de Coerción LHS-Driven | PENDIENTE 0.3.0 | Spec 0.3.0 | Requiere la estabilización AOT del desazucarado JCF. |
