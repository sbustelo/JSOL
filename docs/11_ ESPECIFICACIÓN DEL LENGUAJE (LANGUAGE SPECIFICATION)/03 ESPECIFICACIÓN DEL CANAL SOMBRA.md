# 03 ESPECIFICACIÓN DEL Canal Sombra Y MANEJO DE ERRORES (JSOL SPEC 0.3.0, draft 0.2.97 2026-08-28)

> DISCLAIMER PRE-1.0: Este documento define una especificación propuesta para la versión 0.3.0, en proceso de validación experimental a partir del build de transición 0.2.97. Todo el contenido se encuentra en proceso de iteración y revisión continua. Ninguna interfaz o definición se considera estable o congelada hasta la declaración formal de la versión 1.0.0.

## 1\. FILOSOFÍA DEL CANAL SOMBRA Y FUNDAMENTOS

### 1.1 El Problema de los Números Mágicos (In-Band Signaling)

El manejo tradicional de errores en lenguajes imperativos suele mezclar datos y metadatos de estado en el mismo canal de retorno. El ejemplo canónico es `indexOf()` devolviendo `-1` para señalar "no encontrado", o `Cast.toInt()` devolviendo `NaN` o `null`. Esto constituye un antipatrón estructural: un entero de retorno se utiliza simultáneamente como un dato válido de negocio y como una señal de error de control.

Esta falla equivale a la señalización in-band de la telefonía primaria (donde los tonos de control compartían la misma banda de frecuencia que la voz). Ello permitió la explotación del sistema por "phreakers" (que podían _con un simple silbato_ tomar control de las terminales telefónicas y realizar llamadas internacionales gratuitas) hasta la llegada del protocolo SS7, que separó físicamente la señal de control del canal de voz.


### 1.2 La Solución JSOL: Out-of-Band Signaling

La separación de canales tiene también sus ventajas en diseño de lenguajes.
En capítulo aparte se mencionan los casos de Go y Rust, que fueron evaluados para JSOL.

JSOL no puede aplicar esos patrones, dado que necesita que el mismo código fuente produzca comportamiento idéntico en JS, PHP, Python y C — y ni el retorno múltiple de Go ni el `Option<T>` de Rust existen de forma equivalente en los cuatro,

La solución de JSOL es resolver la mezcla de datos y errores mediante dos canales paralelos:

-   **Canal de Datos (Data Channel):** La variable principal declarada por el usuario (`$s`, `$a`, `$m`, `$n`) mantiene su tipo nativo y recibe un valor válido dentro de su dominio.
-   **Canal Sombra (Shadow Channel):** Toda función marcada como falible (`"fallible": true` en `rules.json`) genera automáticamente una estructura asociativa paralela de metadatos (`Shadow Map`). Este canal fluye al lado del dato, permaneciendo invisible hasta que es consultado explícitamente mediante `JSOL.ok()`.

```
[Código JSOL] ---> $nPos = Arr.indexOf($a, $item);
                         |
                         +---> Canal de Datos:   $nPos = 0 (entero / valor tipo)
                         |
                         +---> Canal Sombra: $JSOL_m_nPos_ok = { ok: false, type: "NOT_FOUND", ... }
```

## 2\. IDENTIFICADORES Y NOMENCLATURA DEL RUNTIME

Para garantizar que el compilador AOT y los linters puedan generar e inspeccionar variables de infraestructura sin riesgo de colisión con el código de usuario ni incompatibilidades entre objetivos (ej. eliminación del sigilo `$` en Python), se define una convención estricta.

### 2.1 Reglas Léxicas de Infraestructura

1.  **Prefijo Reservado OBLIGATORIO:** Toda variable inyectada por el compilador para el Canal Sombra inicia con `$JSOL_m_` (donde `m` indica naturaleza de Mapa asociativo).
2.  **Sufijo Reservado OBLIGATORIO:** Toda variable de sombra finaliza con `_ok`.
3.  **Purgado de Sigilo en Python:** Al eliminar el sigilo `$`, el identificador se transforma en `JSOL_m_..._ok`, lo cual cumple con PEP 8 y evita el _name-mangling_ (que requiere dos guiones bajos iniciales `__`).

### 2.2 Variables Sombra del Sistema

-   **Sombra Nombrada (Asignación Directa a Variable `$v`):** Cuando una llamada falible se asigna directamente a una variable de usuario (ej. `let $nPos = Arr.indexOf($a, $x)`), el compilador genera un mapa asociativo local atado al nombre de la variable:
    
    Variable: $nPos⟹Sombra Nombrada: $JSOL\_m\_nPos\_ok
    
-   **Sombra Anónima (Statement / Línea / Llamadas Anidadas):** Para operaciones falibles que ocurren dentro de expresiones compuestas o anidadas sin asignación directa (ej. `Map.get($m, Arr.indexOf($a, $x))`), el runtime actualiza un mapa único de sentencia:
    
    Operacioˊn Anidada⟹Sombra Anoˊnima: $JSOL\_m\_lastFunction\_ok
    

## 3\. ESTRUCTURA Y CONTRATO DEL SHADOW MAP

El Mapa de Sombra no es una estructura rígida de tamaño fijo. Posee un contrato base obligatorio de 4 claves para garantizar la operatividad del Core, más la capacidad de alojar extensiones de dominio (como alertas no fatales de Color Science en IPAX).


```JavaScript
// Estructura canónica de un Shadow Map ($JSOL_m_nPos_ok)
{
  // --- CONTRATO BASE OBLIGATORIO (4 Claves) ---
  "ok": false,               // (boolean) Estado binario de éxito.
  "type": "NOT_FOUND",        // (string) Categoría constante del resultado/fallo.
  "source": "Arr.indexOf",   // (string) Firma de la primitiva que emitió la sombra.
  "args": { "item": "x" },   // (map) Argumentos recibidos en la llamada.

  // --- CLAVES OPCIONALES DE EXTENSIÓN ---
  "warnings": [],            // (array/map) Alertas no fatales (ej. GAMUT_CLAMP).
  "details": {}              // (map) Trazabilidad extendida en modo DEBUG.
}
```

### 3.1 Manejo de Avisos No Fatales (`warnings`)

En dominios como Color Science (IPAX), una conversión de espacio de color donde los canales rebasan la gama visible (ej. valores RGB de 300,300,50) no constituye una falla fatal de ejecución (`ok` permanece `true`). El procesador clampea el valor al límite visible y registra la alteración en el array `warnings` del Shadow Map. Esto permite a la aplicación inspeccionar recortes sin interrumpir el flujo de cálculo.

## 4\. MECANISMO DE RESET Y BLOQUEO POR PRIMER FALLO

Para expresiones que combinan múltiples llamadas falibles en una sola línea o sentencia, el motor de runtime aplica el principio de **"la cadena es tan fuerte como su eslabón más débil"**.

### 4.1 Ciclo de Vida de la Sombra Anónima en una Sentencia

1.  **Reset por Sentencia:** Al inicio de cada sentencia o línea física, el mapa `$JSOL_m_lastFunction_ok` se reinicializa a su estado limpio: `{ "ok": true, "type": "NONE", "source": "NONE", "args": {} }`.
2.  **First-Failure Lock (Bloqueo por Primer Fallo):** Dada la expresión: `$sNombre = Map.get($mUsuarios, Arr.indexOf($aIds, $sId));`
    
    -   **Paso 1:** Se evalúa la función interna `Arr.indexOf($aIds, $sId)`. Si la búsqueda falla ⟹ `$JSOL_m_lastFunction_ok` se actualiza a `ok: false`, `type: "NOT_FOUND"`, `source: "Arr.indexOf"`. **El estado `ok: false` TRABA la sombra de la sentencia.**
    -   **Paso 2:** Se evalúa la función externa `Map.get($mUsuarios, ...)` con el valor de fallback retornado por la interna. Al intentar actualizar `$JSOL_m_lastFunction_ok`, el runtime detecta que la sombra ya se encuentra trabada en `false` por un fallo previo en la misma sentencia y **NO sobrescribe el mapa**.
    -   **Paso 3:** Al consultar `JSOL.ok()` al final de la línea, la función devuelve `false` y preserva el error original de `Arr.indexOf`, garantizando que la causa raíz del fallo no sea enmascarada por la llamada externa.

## 5\. CATÁLOGO CANÓNICO DE TIPOS DE FALLO (`type`)

A continuación se detalla la lista oficial de categorías de error emitidas en el campo `type` de las sombras para el Core de JSOL 0.3.0:

| `type` (Categoría) | Primitivas Emisoras | Condición de Disparo | Payload en `args` |
| --- | --- | --- | --- |
| `NOT_FOUND` | `Str.indexOf`, `Arr.indexOf` | La subcadena o elemento no existe en la secuencia. | `{ "needle": val }` |
| `KEY_NOT_FOUND` | `Map.get` | La clave solicitada no existe en el diccionario. | `{ "key": val }` |
| `EMPTY_ARRAY` | `Arr.pop`, `Arr.shift` | Extracción sobre un arreglo con `Arr.len == 0`. | `{ "array": [] }` |
| `OUT_OF_RANGE` | `$a[$n]`, `Str.sub`, `Arr.slice`, `Str.char` | El índice o límite excede las fronteras físicas de la secuencia. | `{ "index": i, "len": L }` |
| `PARSE_ERROR` | `Cast.toInt`, `Cast.toFloat` | La cadena contiene caracteres no numéricos o formato inválido. | `{ "val": str }` |
| `OVERFLOW` | `Cast.toInt` | El valor excede la capacidad del ancho de bits destino (ej. > 64 bits). | `{ "val": str, "bits": 64 }` |
| `NAN_ARGUMENT` | `Math.min`, `Math.max` | Uno o más de los argumentos de entrada evaluados es `NaN`. | `{ "arg": "NaN" }` |
| `DIVIDE_BY_ZERO` | `Math.div` | El divisor (o cualquiera de los divisores en llamados variádicos) es `0`. | `{ "divisor": 0 }` |
| `INVALID_BASE` | `Cast.toIntBase`, `Cast.toStrBase` | La base radix solicitada está fuera del rango permitido (2 a 36). | `{ "base": b }` |
| `INVALID_SURROGATE` | `Str.sub`, `Str.char` | Secuencia UTF-16 malformada al intentar extraer Code Points. | `{ "codeUnit": cu }` |
| `GAMUT_CLAMP` | _(Extensiones de Color / IPAX)_ | Canal de color fuera de rango (<0 o \\>255) recortado al límite. | `{ "raw": [300,50] }` |

## 6\. EVALUACIÓN LAZY Y PROPAGACIÓN DE SUBTIPOS EN RUNTIME

Para optimizar el rendimiento sin sacrificar la seguridad de memoria en cadenas de texto genéricas (`$s`), el Canal Sombra aloja el metadato de resolución física de tipo.

### 6.1 Transición de Estado LAZY

1.  **Asignación Inicial (O(0)):** Cuando se instancia o asigna una cadena genérica (`let $sTexto = "ejemplo"`), la variable de datos recibe la cadena pura y su mapa de sombra asigna `"physicalType": "s"`. No se ejecuta ninguna inspección Regex.
2.  **Primer Uso Funcional (O(N)):** Al ingresar `$sTexto` a una primitiva que requiere conocer su codificación (ej. `Str.sub`), el runtime consulta `$JSOL_m_sTexto_ok["physicalType"]`. Al leer `"s"`, ejecuta la validación de rango ASCII vía Regex O(N) por única vez:
    
    -   Si es ASCII puro ⟹ actualiza el mapa a `"physicalType": "sa"`.
    -   Si contiene caracteres Unicode ⟹ actualiza a `"physicalType": "su"`.
3.  **Accesos Subsiguientes (O(1)):** En las siguientes invocaciones, la primitiva lee `"sa"` o `"su"` directamente de la sombra en O(1), derivando el despacho a la función de fast-path (`_a`) o Unicode seguro (`_u`).

### 6.2 Propagación Composicional O(1)

Cuando se realizan operaciones de transformación o combinación sobre cadenas ya evaluadas, el runtime actualiza el tipo físico en la sombra de salida mediante operaciones lógicas en O(1) sin re-inspeccionar el texto:

-   **Copia de Variable (`$sA = $sB`):** Copia la clave `physicalType` de la sombra de `$sB` a la de `$sA`.
-   **Concatenación Variádica (`Str.concat`):** Aplica un AND lógico sobre la propiedad ASCII:
    
    physicalType(concat(A,B))\=⎩![](data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.316em" style="width:0.8889em" viewBox="0 0 888.89 316" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V316 H384z M384 0 H504 V316 H384z"></path></svg>)⎨![](data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.316em" style="width:0.8889em" viewBox="0 0 888.89 316" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V316 H384z M384 0 H504 V316 H384z"></path></svg>)⎧​"sa""su""s"​si type(A)\="sa"∧type(B)\="sa"si alguno es "su"si alguno no ha sido evaluado ("s")​
    

## 7\. ANÁLISIS COMPARATIVO DE ARQUITECTURA

| Modelo | Estrategia de Error | Impacto en Flujo de Datos | Modificación de Tipos | Evaluacion en Prototipado |
| --- | --- | --- | --- | --- |
| **Excepciones** (Java / Python) | Canal invisible vía Stack Unwinding | Interrumpe el flujo; requiere bloques `try/catch` no locales | No modifica tipo; retorno invisible en firma | Rígido; detiene el proceso si no se captura |
| **Retorno Múltiple** (Go) | Retorno explícito `(val, err)` | Interrumpe flujo; exige recibir ambos valores siempre | No modifica tipo; duplica variables asignadas | Verboso; obliga a llenar `if err != nil` |
| **`Result<T,E>`** (Rust) | El error forma parte del Tipo de Dato | Interrumpe flujo; requiere desenrollar (_unwrap/match_) | **Modifica tipo:** `$n` pasa a ser `Result<$n, E>` | Muy rígido; no compila sin manejo explícito desde el inicio |
| **Canal Sombra** (JSOL) | Canal lateral asociativo independiente | **Cero interrupción:** El dato fluye naturalmente por la variable | **Conserva tipos puros:** `$n` sigue siendo `$n` | **Gradual:** Ignorable al explorar, exigible por Linter en CI |

## 8\. COMPORTAMIENTO SEGÚN PERFILES DE COMPILACIÓN

El comportamiento del Canal Sombra se ajusta según el perfil de compilación seleccionado en la herramienta de build:

-   **FAST:** Generación de sombras optimizada. No realiza chequeos preventivos en asignaciones simples. Diseñado para rendimiento máximo en producción cuando el código fue validado previamente.
-   **SAFE:** Inyección de verificaciones de guardado y adaptadores de coerción (`TRUNC_CHECKED`). Garantiza la paridad determinista absoluta bit a bit incluso en casos de desbordamiento o divisiones por cero.
-   **SILENT:** El programa no detiene su ejecución ante fallos. El Canal Sombra registra el error (`ok: false`), mientras que el Canal de Datos entrega un valor inerte predecible (`0`, `""`, `false`), previniendo caídas catastróficas del proceso.
-   **DEBUG:** Payload de sombra expandido. Inyecta detalles de trazabilidad (`details`), pila de llamadas internas y datos de contexto para inspección en el REPL o herramientas de depuración.

## 9\. TABLA DE ESTADO Y TRAZABILIDAD (0.2.97 → 0.3.0)

| Elemento / Feature | Estado de Disposición | Build / Target | Notas de Implementación |
| --- | --- | --- | --- |
| Nomenclatura `$JSOL_m_{v}_ok` | DECIDIDO / EN PRUEBA | Build 0.2.97 | Implementado en la inyección de código del compilador. |
| Sombra Anónima `$JSOL_m_lastFunction_ok` | DECIDIDO / EN PRUEBA | Build 0.2.97 | Reseteada por sentencia; soporte para llamadas anidadas. |
| Contrato de 4 Claves Base | DECIDIDO | Build 0.2.97 | `ok`, `type`, `source`, `args` estandarizados. |
| Bloqueo por Primer Fallo (First-Failure Lock) | DECIDIDO | Build 0.2.97 | Lógica inyectada en polyfills para preservar causa raíz. |
| Evaluacion LAZY de `$s` en Sombra | DECIDIDO / EN PRUEBA | Build 0.2.97 | Memoización O(1) tras primera inspección O(N). |
| Catálogo de Errores (`type`) | DECIDIDO | Spec 0.3.0 | Unificado para todos los targets (JS, PHP, Python, C). |
| Payload Extensible (`warnings`) | DECIDIDO | Spec 0.3.0 | Habilitado para soporte de paquetes de dominio (IPAX/Color). |

**POST-DELIVERY AUDIT**