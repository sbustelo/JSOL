04 ESPECIFICACIÓN DE ISOMORFISMO, PARIDAD Y CRITERIO EXCEL (JSOL SPEC 0.3.0)

> DISCLAIMER PRE-1.0: Este documento define la especificación target para la versión 0.3.0, en proceso de validación experimental a partir del build de transición 0.2.97. Todo el contenido se encuentra en proceso de iteración y revisión continua. Ninguna interfaz o definición se considera estable o congelada hasta la declaración formal de la versión 1.0.0.

## 1\. EL CRITERIO EXCEL Y DESEMPATE ISOMÓRFICO

### 1.1 Filosofía de Desempate de Negocio

Cuando un operador o función nativa presenta comportamientos semánticamente divergentes entre los lenguajes de destino (ej. JavaScript, PHP, Python, C), JSOL considera **resolver a favor de la expectativa de un usuario de hojas de cálculo de negocios (Excel)**. La razón de esta decisión es que la inmensa mayoría de la lógica de negocio en el mundo real vive o fue modelada inicialmente en planillas ofimáticas.

### 1.2 Criterio de Rigor en Datos Sucios

A diferencia de los lenguajes dinámicos que fuerzan coerciones laxas e impredecibles, Excel es estricto cuando recibe entradas corruptas: `=VALOR("12abc")` devuelve un error explícito (`#¡VALOR!`) en lugar de truncar silenciosamente a `12`.

JSOL adopta esta rigidez: primitivas como `Cast.toInt("12abc")` o `Cast.toFloat("12abc")` fallan de forma determinista, registrando el error `PARSE_ERROR` en el Canal Sombra (`$JSOL_m_{v}_ok`), previniendo la contaminación de datos en el canal principal.

## 2\. PARIDAD MATEMÁTICA BIT-A-BIT (MATH SCIENCE)

### 2.1 Módulo Excel (`Math.modX`)

-   **Divergencia de Runtimes (N-02 / N-29):**
    
    -   En JavaScript, C y PHP, el operador `%` devuelve el signo del dividendo (`-5 % 3 = -2`).
    -   En Python, el operador `%` devuelve el signo del divisor (`-5 % 3 = 1`).
    -   En PHP, `%` trunca además los operandos flotantes a enteros antes de operar (`7.5 % 2 = 1`).
-   **Contrato Isomórfico JSOL:** Se prohíbe el uso de `%` en el código fuente. Se impone la función `Math.modX($a, $b)`, la cual adopta la fórmula matemática exacta de Excel (`MOD`):
    
    Math.modX(a,b)\=a−b×⌊a/b⌋
    
    El resultado toma obligatoriamente el signo del divisor en todos los lenguajes target.
    

### 2.2 Redondeo Financiero (`Math.roundX`)

-   **Divergencia de Runtimes (N-03):**
    
    -   Python usa _Banker's Rounding_ (Half-to-even: `round(2.5) = 2`, `round(1.5) = 2`).
    -   JavaScript `Math.round` redondea `.5` hacia +∞ (`Math.round(-1.5) = -1`).
    -   PHP `round` redondea `.5` lejos de cero (`round(-1.5) = -2`).
-   **Contrato Isomórfico JSOL:** Se define `Math.roundX($n)` aplicando la regla "Half away from zero" (coincidente con el estándar ofimático de Excel). Se compila mediante un helper matemático explícito en lugar de delegar al `round` nativo del target:
    
    Math.roundX(n)\=floor(∣n∣+0.5)×sign(n)
    
    Garantiza determinismo absoluto: `1.5` → `2` y `-1.5` → `-2` en cualquier plataforma.
    

### 2.3 Logaritmos Nativos y Base Arbitraria (`Math.ln` y `Math.logX`)

-   **Divergencia de Runtimes (N-11 / Extensión logX):** JavaScript carece de logaritmo con base arbitraria nativo (`Math.log` es natural). Derivar un logaritmo base 10 dividiendo `log(n) / log(10)` en runtime introduce deriva de punto flotante.
-   **Contrato Isomórfico JSOL:**
    
    -   `Math.ln($n)`: Logaritmo natural nativo directo del hardware.
    -   `Math.logX($number, $base = 10)`: Logaritmo en base arbitraria, coincidente con `LOG(number, [base])` de Excel (base 10 por defecto). Para bases constantes conocidas (2, 10), el compilador AOT emite la función nativa óptima (`Math.log10`/`Math.log2`); para bases dinámicas emite `ln(a) / ln(b)`.

### 2.4 División Flotante Real (`Math.div`)

-   **Divergencia de Runtimes (N-01 / N-08):** Dividir enteros en C, Go o Rust (`5 / 2`) ejecuta división entera truncada hacia cero (`2`). En JS, Python o PHP produce un flotante (`2.5`).
-   **Contrato Isomórfico JSOL:** `Math.div($n1, $n2, ...)` realiza división flotante real con asociatividad a la izquierda. Devuelve siempre un flotante `$n` (`$nf64`). En targets de bajo nivel (JSOL-C), la plantilla inyecta el casteo explícito de los operandos: `((double){0} / (dowuble){1})`. Si cualquier divisor es `0`, registra `DIVIDE_BY_ZERO` en el Canal Sombra.

## 3\. INTEGRIDAD DE TEXTO Y TRATAMIENTO UNICODE (`Str.*`)

### 3.1 Conteo y Corte de Cadenas (`$sa` ASCII vs `$su`/`$s` Code Points)

-   **Divergencia de Runtimes (S-01 / S-02 / S-03):**
    
    -   JavaScript `.length` y `.substring()` operan sobre unidades UTF-16 de 16 bits, partiendo _Surrogate Pairs_ de emojis y caracteres especiales por la mitad.
    -   PHP `strlen()` opera sobre bytes crudos.
    -   Python 3 opera sobre Code Points reales.
-   **Contrato Isomórfico JSOL:**
    
    -   **Semántica Universal por Defecto (`$su` / `$s`):** Por defecto, el dominio `Str.*` garantiza precisión absoluta sobre **Code Points Unicode**. En PHP, el compilador fuerza `mb_*` con `'UTF-8'` (`mb_strlen`, `mb_substr`). En JavaScript, las primitivas operan mediante iteradores de Code Points (`Array.from($s)` / `[...$s]`).
    -   **Optimización Vía Rápida (`$sa` ASCII Explícito):** Cuando una variable se declara explícitamente como `$sa` (ASCII), el compilador realiza un despacho estático AOT a funciones nativas por byte de acceso O(1) (`substring` en JS, `substr` en PHP, `len()` en Python), omitiendo la inspección Unicode O(N) sin ningún riesgo de corrupción, ya que el tipo `$sa` garantiza que cada carácter ocupa exactamente 1 byte.
    -   **Evaluación LAZY para Cadenas Genéricas (`$s`):** Si el tipo es `$s` (indeterminado), la primera operación funcional ejecuta una inspección ASCII O(N) y memoiza `"sa"` o `"su"` en el mapa del Canal Sombra (`$JSOL_m_{v}_ok`), permitiendo que los accesos subsiguientes utilicen la vía rápida O(1).

### 3.2 Concatenación Segura (`Str.concat`)

-   **Divergencia de Runtimes (S-14 / B-01):** El uso del operador `+` entre tipos mixtos produce textos divergentes: en JS `true + "1"` resulta en `"true1"`, mientras que en PHP `"1" . true` resulta en `"11"`.
-   **Contrato Isomórfico JSOL:** `Str.concat($a, $b, ...)` es variádico y exige un `Cast.toStr()` previo sobre cada argumento. Fija por contrato que `Cast.toStr(null)` es `""` y `Cast.toStr(false)` es `"false"`.

## 4\. INMUTABILIDAD Y PASAJE POR VALOR EN ESTRUCTURAS (`Arr.*` Y `Map.*`)

### 4.1 Semántica por Valor (Value Semantics)

-   **Divergencia de Runtimes (A-13 / C-05):** JavaScript y Python pasan arreglos y diccionarios por referencia (mutando el objeto original al modificarlo dentro de una función). PHP aplica _Copy-On-Write_ (pasaje por valor).
-   **Contrato Isomórfico JSOL:** Por defecto, las estructuras de datos (`Arr.*` y `Map.*`) operan bajo semántica por valor. Modificar un arreglo o mapa devuelve una copia/instancia nueva y no altera la variable original en scopes externos.

### 4.2 Excepciones Explícitas de Stack (`Arr.pop` y `Arr.shift`)

Como excepción funcional documentada para la gestión eficiente de Stacks de memoria, `Arr.pop($a)` y `Arr.shift($a)` **mutan in-place** el arreglo de entrada y retornan el elemento extraído. Si el arreglo está vacío, inyectan `EMPTY_ARRAY` en el Canal Sombra.

### 4.3 Concatenación e Inserción Inmutable (`Arr.concat`)

`Arr.concat($a1, $a2, ...)` combina arreglos generando una nueva instancia. Si detecta que uno de los argumentos es un escalar no-arreglo, lo envuelve automáticamente en un arreglo unitario `[$x]` antes de fusionarlo.

### 4.4 Ordenamiento Estricto (`Arr.sort`)

-   **Divergencia de Runtimes (A-08):** En JavaScript, `[10, 1, 2].sort()` convierte los elementos a string y ordena alfabéticamente (`[1, 10, 2]`). Python los ordena numéricamente.
-   **Contrato Isomórfico JSOL:** Queda prohibido ordenar arreglos sin un comparador. `Arr.sort($a, $fComparator)` exige obligatoriamente una función de comparación explícita (`$fSortNum`, `$fSortAlpha`). El Linter emite un error fatal si se omite el comparador.

## 5\. MATRIZ DE COERCIÓN LHS-DRIVEN (`TRUNC_CHECKED`)

### 5.1 El Contrato del LHS (Left-Hand Side)

En JSOL, la declaración de tipo de la variable de destino (LHS) actúa como un contrato rígido sobre la expresión asignada (RHS).

### 5.2 Adaptadores AOT e Isomorfismo de Bajo Nivel

Cuando la representación intermedia (JSOL VM) detecta que una expresión flotante `$n` (`$nf64`) se asigna a una variable entera física (ej. `$ni32`), la VM inyecta AOT el adaptador de coerción `"TRUNC_CHECKED"` consultando el SSOT (`semantics.json`):

Asignación: let $ni32\_resultado\=Math.div($nA,$nB);

⇓(JSOL VM - Inyección AOT)

LET("resultado",TRUNC\_CHECKED("resultado",Math.div($nA,$nB)))

-   **Renderizado en JavaScript / PHP:** El adaptador se emite como `Math.trunc(expr)`.
-   **Renderizado en C (JSOL-C):** Castear un `float` a `int32_t` en C cuando el valor es `NaN`, `Infinity` o excede los límites de 32 bits provoca un _Undefined Behavior_ (UB / crasheo de memoria). En C, `"TRUNC_CHECKED"` se emite como la función de runtime `jsol_trunc_safe(expr, &shadowMap)`. Si el valor es inválido, registra `OVERFLOW` o `NAN_ARGUMENT` en el Canal Sombra (`ok: false`) y devuelve un valor inerte clampeado.

## 6\. RELACIÓN CON EL CATÁLOGO DE DIVERGENCIAS (140+ IDs)

El catálogo extenso de 143 divergencias (`EXTENDING-SEMANTIC-PARITY-table.md`) permanece como el inventario pasivo de auditoría. La siguiente tabla mapea las reglas de esta spec contra los IDs de riesgo más críticos:

| ID de Riesgo | Dominio | Regla de Resolución en Spec 0.3.0 |
| --- | --- | --- |
| **N-01** | División por Cero / Int | `Math.div` fuerza flotante real y registra `DIVIDE_BY_ZERO` en el Canal Sombra. |
| **N-02 / N-29** | Módulo con Negativos / Floats | Prohibido `%`. Se impone `Math.modX` con fórmula Excel a−b×⌊a/b⌋. |
| **N-03** | Rounding Halfway | `Math.roundX` impone _Half away from zero_ (1.5→2,−1.5→−2). |
| **S-01 / S-02** | Conteo y Corte de Strings | Semántica estricta por Code Points Unicode (`$su`/`$s`). Despacho estático O(1) por byte cuando el tipo es `$sa` (ASCII). |
| **A-08** | Array Sort Default | `Arr.sort` exige comparador explícito; prohibido sort nativo laxo. |
| **A-13** | Aliasing vs Copy-On-Write | Semántica por valor por defecto en `Arr.*` y `Map.*`. |
| **C-07** | Manejo de Excepciones | Erradicación de excepciones no locales; uso exclusivo del Canal Sombra. |

## 7\. APÉNDICE: TABLA DE ESTADO Y TRAZABILIDAD (SPEC 0.3.0 / BUILD 0.2.97)

| Elemento / Feature | Estado de Disposición | Build / Target | Notas de Implementación |
| --- | --- | --- | --- |
| Criterio Excel de Desempate | DECIDIDO | Spec 0.3.0 | Regla filosófica de diseño de primitivas. |
| `Math.modX`, `Math.roundX` | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Fórmulas isomórficas inyectadas en polyfills. |
| `Math.logX` y `Math.ln` | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Mapeo directo y fallback ln(a)/ln(b). |
| Code Points en `Str.*` | IMPLEMENTADO / ESTABLE | Build 0.2.97 | `mb_*` en PHP y `Array.from` en JavaScript. |
| Coerción `TRUNC_CHECKED` | EN PRUEBA | Build 0.2.97 | Adaptador AOT para prevención de UB en C. |
| Comparador en `Arr.sort` | DECIDIDO | Spec 0.3.0 | Linter requiere comparador obligatorio. |
| Inmutabilidad de Estructuras | DECIDIDO | Spec 0.3.0 | Semántica por valor en `Arr.*` y `Map.*`. |