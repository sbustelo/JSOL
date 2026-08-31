# GRAMÁTICA, OPERADORES Y DOMINIOS CORE (JSOL SPEC 0.3.0, draft 0.2.97 2026-08-28)

> DISCLAIMER PRE-1.0: Este documento define la especificación target para la versión 0.3.0, en proceso de validación experimental a partir del build de transición 0.2.97. Todo el contenido se encuentra en proceso de iteración y revisión continua. Ninguna interfaz o definición se considera estable o congelada hasta la declaración formal de la versión 1.0.0.

> En evaluación: JSOL es actualmente compilado en todos los casos, incluso en el REPL. Mantener a JSOL como JavaScript válido permitiría interpretación con polyfills. Ello plantea conflictos con algunas especificaciones de este draft.

## 1\. CRITERIO DE ESTRICTEZ Y LA LEY DE POSTEL

La versión 0.3.0 nace **estricta**. JSOL debe probar que funciona y logra paridad funcional absoluta y determinista en todos los lenguajes target (actualmente JavaScript, PHP, Python, TypeScript; la visión es llegar a C).


La "Ley de Postel" (ser liberal en lo que se recibe) se aplica temporalmente en el build de transición 0.2.97 casi de forma exclusiva para garantizar la compatibilidad del compilador consigo mismo (self-hosting) permitiendo prefijos legacy como `$i` o `$q`. La Experiencia de Desarrollador (DX) está en el roadmap, pero es estrictamente secundaria frente a la obligación matemática de asegurar que el código compila y produce resultados idénticos en cualquier runtime.


## 2\. OPERADORES Y REPRESENTACIÓN INTERMEDIA (JCF)

### 2.1 Sintaxis en Userland (Código Fuente `.jsol`) vs JCF (Fase Interna)

-   **Claridad como Pilar Supremo (Userland):** Para el creador de lógica de negocio o usuario de Excel, el código fuente `.jsol` debe ser totalmente expresivo, legible y natural. El usuario escribe expresiones infijas normales (`$a + $b`, `$x * $y`, `$a === $b`, `cond ? a : b`).
    
-   **JCF (JSOL Canonical Form):** Es una representación intermedia (IR) desazucarada _proyectada/futura para el compilador_. Transforma la sintaxis infija a llamadas funcionales aplicativas (`SUM($a, $b)`, `JSOL.LET("$a", 1)`) en una fase AOT interna para aplanar la sintaxis, eliminar la necesidad de resolver precedencia de operadores (PEMDAS) sin un AST pesado, y servir de punto único para dispatch de tipos e inyección de casts. **JCF no debería ser sintaxis obligada al usuario.**
    

### 2.2 Operadores Permitidos en Código Fuente (Userland)

Los siguientes operadores infijos estándar están permitidos en el código fuente JSOL, ya que la Tabla de Símbolos resuelve AOT los tipos de los operandos antes de la emisión:


-   **Aritméticos Infijos (`+`, `-`, `*`, `/`):** Permitidos para expresiones numéricas.
    
-   **Concatenación de Strings (`+""+`):** Permitido única y exclusivamente cuando ambos operandos son cadenas estrictas (ej. `$sA + "" + $sB`). Todo intento de usar `+` para combinar tipos heterogéneos (ej. string y booleano) está prohibido, ya que JavaScript produce `"true1"` y PHP produce `"11"`. Para mezclar tipos se debe usar la función explícita `Str.concat()`.
    
-   **Comparación Relacional Estricta (`===`, `!==`, `<`, `>`, `<=`, `>=`):** Permitidos para comparaciones escalares.
    
-   **Lógicos (`&&`, `||`, `!`):** Permitidos con evaluación short-circuit consistente entre targets.
    
-   **Ternario (`? :`):** Permitido para expresiones condicionales.
    
-   **Asignación (`=`):** Permitido en código fuente.
    
-   **Acceso a Propiedades y Métodos (`.` y `[]`):** Permitidos para invocar funciones de dominio (`Math.sum`) o acceder a elementos por índice (`$aLista[0]`).
    

### 2.3 Operadores Prohibidos en Código Fuente

-   **PROHIBIDO `%` (Módulo):** Excepción estricta en Userland. Debido a las divergencias de signo y truncamiento entre runtimes (JS/C devuelven el signo del dividendo, Python devuelve el signo del divisor, PHP trunca a entero), y **dado que la fase de desazucarado JCF aún no existe en el compilador actual**, `%` debe estar **estrictamente prohibido en el código fuente**. Si el usuario requiere una operación de módulo, DEBE escribir explícitamente `Math.modX($a, $b)`. En el futuro, el compilador _podría_ mapear internamente `%` a `Math.modX`, pero por ahora la prohibición es absoluta.
    
-   **Prohibidos `==` y `!=` (Comparación Laxa):** Prohibidos para evitar coerciones implícitas no deterministas entre tipos dinámicos.
    
-   **Prohibidos Métodos y Accesores Nativos del Lenguaje Host:**
    
    -   Prohibido `.length` (forzando el uso de `Str.len` o `Arr.len`).
        
    -   Prohibidos métodos de orden superior nativos atados a arreglos como `.map()`, `.filter()`, `.reduce()`, `.forEach()`, `.find()` (bloqueados por Linter; se deben usar primitivas de dominio `Arr.map`, `Arr.filter`, etc., o bucles `for`).
        
    -   Prohibidos bloques de manipulación de contexto como `with()`.
        

## 3\. CORE VS EXTENSIONES Y DESARROLLO FUTURO

Para mantener la transpilación económica y el motor compilador ligero, se establece una frontera estricta entre el núcleo del lenguaje y los desarrollos futuros:


-   **CORE:** Se consideran núcleo y prioridad estricta los tipos de datos de la especificación JSON (`$n`, `$s`, `$a`, `$m`, `$b`), sumados a los tipos básicos fundamentales de bajo nivel y control: `$y` (bytes/binary), `$x` (regex acotado a subset seguro) y `$f` (referencia a función/closure). Estos tipos constituyen la base sobre la cual debe ser posible construir cualquier abstracción posterior dentro del propio lenguaje.
    
-   **EXTENSIONES Y DESARROLLO FUTURO:** Todo lo que no pertenezca al Core actual queda reservado para futuro desarrollo como extensión de tipo o de dominio. En particular, se decidió explícitamente dejar el manejo de fechas (tipo `$d`) fuera del Core por no constituir un tipo de dato nativo en la especificación JSON y por su elevada complejidad y variabilidad semántica entre runtimes target (divergencias estructurales en unidades de epoch/timestamp entre segundos, milisegundos, microsegundos y nanosegundos, comportamiento naive vs. timezone-aware, mutabilidad y parseo de calendarios). Toda funcionalidad extendida (como fechas, color science o formatos financieros) debe poder construirse e integrarse como paquete externo escrito en el propio JSOL utilizando exclusivamente los tipos y primitivas del Core.
    

## 4\. DOMINIOS Y FUNCIONES CORE (CLASIFICACIÓN Y ESTADO)

A continuación, la lista exhaustiva de dominios Core. Las primitivas marcadas como **(Falible)** inyectan obligatoriamente metadatos en el Canal de Sombras (`$mJSOL_var_ok`) en lugar de devolver "números mágicos" o valores centinela (como `-1` o `NaN`).


### 4.1 Dominio `Math.*` (Aritmética Universal)

Las divergencias semánticas de los motores nativos se resuelven adoptando el "Criterio Excel" (indicado con el sufijo `X`).


**Funciones Estables / Candidatas para 0.3.0:**

-   `Math.sum($n1, $n2, ...)`: Suma variádica.
    
-   `Math.sub($n1, $n2, ...)`: Resta variádica secuencial.
    
-   `Math.mul($n1, $n2, ...)`: Producto variádico.
    
-   `Math.div($n1, $n2, ...)`: División flotante variádica con asociatividad a la izquierda. Devuelve siempre flotante `$n`. **(Falible: DIVIDE\_BY\_ZERO)** (si cualquiera de los divisores es `0`).
    
-   `Math.idiv($n1, $n2)`: División entera explícita (Trunc\_Zero).
    
-   `Math.modX($a, $b)`: Módulo determinista con convención Excel (resultado toma el signo del divisor). Fórmula `$a - $b * Math.floor($a / $b)`.
    
-   `Math.trunc($n)`: Corte decimal explicito (eliminando la parte fraccionaria).
    
-   `Math.roundX($n)`: Redondeo "Half away from zero" estricto (Excel).
    
-   `Math.floor($n)`, `Math.ceil($n)`, `Math.trunc($n)`: Redondeos y cortes direccionales.
    
-   `Math.abs($n)`, `Math.pow($b, $e)`: Magnitud y potencia.
    
-   `Math.sqrt($n)`, `Math.cbrt($n)`: Raíces cuadradas y cúbicas reales.
    
-   `Math.min($a, $b, ...)`, `Math.max($a, $b, ...)`: Extremos. **(Falible: NAN\_ARGUMENT)**.
    
-   `Math.ln($n)`: Logaritmo natural nativo del hardware.
    
-   `Math.logX($number, $nBase=10)`: Logaritmo base N (default 10), transpila a función nativa del target para $nBase nativos (ej. base 2 en JavaScript).
    
-   Trigonometría: `Math.sin`, `Math.cos`, `Math.tan`, `Math.asin`, `Math.acos`, `Math.atan`, `Math.atan2`.
    
-   Constantes: `Math.E`, `Math.PI`.
    
-   Comparadores explícitos: `Math.eq`, `Math.neq`, `Math.gt`, `Math.lt`, `Math.gte`, `Math.lte`.
    

**Math.div y Math.sub:**

-   **Definición Matemática:** `Math.div` en modo variádico se define como una operación **asociativa a la izquierda (fold-left secuencial)**: `Math.div(a1, a2, a3, ..., an) = (((a1 / a2) / a3) / ... / an)`. Ejemplo numérico: `Math.div(100, 2, 5) -> (100 / 2) / 5 = 50 / 5 = 10`.
    
-   **Regla de Fallo:** Si **cualquiera** de los divisores es igual a `0`, la operación se detiene, inyecta en el Canal de Sombras `$mJSOL_var_ok` el error `type: "DIVIDE_BY_ZERO"`, registra `ok: false`, y devuelve el valor nulo/inerte.
    
-   **Misma semántica para `Math.sub`:** Asociatividad a la izquierda. `Math.sub(100, 20, 5) -> (100 - 20) - 5 = 75`.
    

### 4.2 Dominio `Str.*` (Texto y Code Points)

Opera exclusivamente sobre Code Points Unicode para garantizar paridad (evitando contar bytes como en PHP o unidades UTF-16 como en JS).


**Funciones Estables / Candidatas para 0.3.0:**

-   `Str.len($s)`: Conteo estricto por Code Points.
    
-   `Str.sub($s, $start, $end)`: Extracción de subcadena por Code Points desde el índice `$start` (inclusive) hasta `$end` (exclusive), unificado con la convención de corte de rango de `Arr.slice`. Nunca parte un surrogate pair.
    
-   `Str.char($s, $idx)`: Extrae Code Point en índice.
    
-   `Str.fromChar($code)`: Construye desde Code Point Unicode.
    
-   `Str.indexOf($s, $needle)`: Búsqueda de índice. **(Falible: NOT\_FOUND)**.
    
-   `Str.contains($s, $needle)`: Presencia booleana infalible.
    
-   `Str.startsWith($s, $needle)`, `Str.endsWith($s, $needle)`: Evaluaciones periféricas.
    
-   `Str.split($s, $d)`: Partición a Array. Delimitador vacío divide por Code Points.
    
-   `Str.replaceAll($s, $search, $rep)`: Reemplazo explícito.
    
-   `Str.same($sA, $sB, $mStrOptions?)`: Comparación flexible (`ignoreCase`, `ignoreDiacritics`).
    
-   `Str.padStart($s, $len, $pad)`, `Str.padEnd($s, $len, $pad)`: Relleno.
    
-   `Str.repeat($s, $q)`: Repetición de cadenas.
    
-   `Str.concat($a, $b, ...)`: Concatenación variádica segura con coerción `Cast.toStr`.
    
-   `Str.eq($s1, $s2)`, `Str.neq($s1, $s2)`: Comparadores de identidad.
    

**Funciones Deprecadas / Descartadas:**

-   `Str.replace`, `Str.trim`, `Str.equals`, `Str.like`: Deprecadas o trasladadas a Core-2 / Extensiones.
    
-   `Str.replaceFirst`: _Descartada del core._
    

### 4.3 Dominio `Arr.*` (Arreglos Secuenciales)

Inmutabilidad (pasaje por valor) por defecto, con excepciones funcionales documentadas de mutación in-place para simular Stacks de memoria.


**Funciones Estables / Candidatas para 0.3.0:**

-   `Arr.len($a)`: Longitud del arreglo.
    
-   `Arr.push($a, $item)`: Apendiza elemento.
    
-   `Arr.pop($a)`: **Muta in-place** y retorna elemento final. **(Falible: EMPTY\_ARRAY)**.
    
-   `Arr.shift($a)`: **Muta in-place** y retorna primer elemento. **(Falible: EMPTY\_ARRAY)**.
    
-   `Arr.unshift($a, $item)`: Inserta elemento al principio.
    
-   `Arr.slice($a, $start, $end)`: Copia de rango estilo `(start, end)`.
    
-   `Arr.indexOf($a, $item)`: Búsqueda estricta por tipo. **(Falible: NOT\_FOUND)**.
    
-   `Arr.contains($a, $item)`: Presencia booleana infalible.
    
-   `Arr.join($a, $d)`: Unión a string (parsea `null` a `""`).
    
-   `Arr.concat($a1, $a2, ...)`: Fusión variádica inmutable.
    
-   `Arr.sort($a, $fComparator)`: Ordenamiento. **Exige obligatoriamente comparador explícito** (`$fSortNum`, `$fSortAlpha`) para bloquear la divergencia donde JS ordena `[10, 1, 2]` como `[1, 10, 2]`.
    
-   `Arr.map($a, $f)`, `Arr.filter($a, $f)`, `Arr.reduce($a, $f)`: Iteradores funcionales. El argumento `$f` debe pasarse estrictamente como una **función nombrada por referencia** o como una **lambda inline de expresión única sin bloque**. Quedan prohibidas las lambdas inline con bloques multilínea `{ ... }`.
    
-   `Arr.eq($a1, $a2)`, `Arr.neq($a1, $a2)`: Comparación profunda (Deep Equal).
    

### 4.4 Dominio `Map.*` (Diccionarios Hash)

Garantizan orden de inserción y evitan coerción destructiva de claves.


**Funciones Estables / Candidatas para 0.3.0:**

-   `Map.create(...)`: Inicialización asociativa (last-wins en colisiones).
    
-   `Map.has($m, $key)`: Presencia booleana infalible (evalúa existencia de clave, no valor).
    
-   `Map.get($m, $key)`: Lectura de valor. **(Falible: KEY\_NOT\_FOUND)**.
    
-   `Map.keys($m)`, `Map.values($m)`: Extracción de listas uniaxiales.
    
-   `Map.count($m)`: Cantidad de pares clave-valor.
    
-   `Map.merge($m1, $m2, ...)`: Fusión inmutable.
    
-   `Map.eq($m1, $m2)`, `Map.neq($m1, $m2)`: Igualdad profunda.
    

### 4.5 Dominio `Bool.*` (Lógica Booleana)

En código fuente Userland se utilizan los operadores lógicos estándar (`&&`, `||`, `!`). El dominio `Bool.*` se define para evaluaciones proposicionales variádicas avanzadas y como destino AOT en la representación JCF:

-   `Bool.and($b1, $b2, ...)`: AND variádico con short-circuit garantizado por el target.
    
-   `Bool.or($b1, $b2, ...)`: OR variádico con short-circuit.
    
-   `Bool.xor($b1, $b2, ...)`: XOR variádico de paridad (devuelve `true` si una cantidad impar de argumentos es `true`, homólogo a la función `XO`/`XOR` de Excel).
    
-   `Bool.not($b)`: Negación lógica unaria.
    
-   `Bool.eq($b1, $b2, ...)`, `Bool.neq($b1, $b2)`: Comparadores explícitos de estado booleano.
    

### 4.6 Dominio `Bit.*` (Lógica Binaria)

Opera exclusivamente sobre magnitudes sin signo (unsigned), 32-bits por defecto. Zero-extend garantizado al cruzar anchos.

-   `Bit.and`, `Bit.or`, `Bit.xor`, `Bit.not`: Operaciones binarias unsigned.
    
-   `Bit.shiftL`, `Bit.shiftR`: Desplazamientos lógicos unívocos.
    

### 4.7 Dominio `Cast.*` (Conversión Fuerte)

Disciplina estricta para cruce de tipos. No toleran basura.

-   `Cast.toInt($val)`: Conversión estricta a entero. **(Falible: PARSE\_ERROR / OVERFLOW)**.
    
-   `Cast.toFloat($val)`: Conversión estricta a flotante. **(Falible: PARSE\_ERROR)**.
    
-   `Cast.toStr($val)`: Serialización determinista (`null` → `""`, `false` → `"false"`).
    
-   `Cast.toBool($val)`: Normaliza la verdad lógica ("Truthiness").
    
-   `Cast.toIntBase($s, $base)`, `Cast.toStrBase($num, $base)`: Conversiones radix universales (2 a 36). **(Falible: INVALID\_BASE)**.
    

### 4.8 Dominio `Regex.*` (Expresiones Seguras)

Subconjunto restringido compatible de forma cruzada (RE2 / Rust compatibles).

-   `Regex.match($s, $x)`: Búsqueda y extracción.
    
-   `Regex.replace($s, $x, $rep)`: Sustitución usando `$1`, `$2`.
    
-   `Regex.test($s, $x)`: Validación rápida.
    
-   **Restricciones de subset:** Prohibidos lookarounds (`?=`, `?!`) y backreferences complejas. Único flag soportado: `i` (case-insensitive).
    

### 4.9 Dominio `JSOL.*` (Manejo de Ecosistema y Control Interno)

-   `JSOL.LET(target, expr, sourceRef)`: Primitiva interna de asignación y pass-through JCF. Muta metadata de tipo en runtime (Managed) o colapsa a asignación estática (JSOL-C/bajo nivel).
    
-   `JSOL.ok()`: Verificación anónima del canal de sombras.
    
-   `JSOL.ok($var)` o `JSOL.ok("$var")`: Verificación nombrada del canal de sombras.
    
-   `JSOL.range($nFrom, $nTo, $nStep, $nMaxTimes)`: Bucles declarativos con cap forzado e inyección de `$JSOL_i`.
    
-   `JSOL.times($n)`: Alias para conteo fijo.
    

### Apartado — `JSOL.LET` e Infraestructura Interna

Toda asignación imperativa (`let $x = expr;`) se desazucariza en la fase JCF a `LET(target, expr, sourceRef)`. No es sintaxis que el usuario escribe — es exclusivamente la forma intermedia producida por la fase de compilación antes de llegar al Enrutador Ciego. Existe para ser el punto único donde el compilador **registra y propaga** qué tipo físico terminó teniendo cada variable al Canal Sombra o a la Symbol Table.

### Nomenclatura Estándar y Estructura del Canal de Sombras (Shadow Map)

1.  **Prefijo Reservado e Identificadores:** Inician con `$JSOL_m_` y finalizan con `_ok`.
    
    -   Sombra Anónima: `$JSOL_m_lastFunction_ok`.
        
    -   Sombra Nombrada: `$JSOL_m_{v}_ok`.
        
2.  **Estructura del Mapa (Contrato Base + Extensión):**
    
    -   Obligatorio: `ok` (boolean), `type` (string), `source` (string), `args` (map).
        
    -   Opcional: `warnings`, `details`.
        
3.  **Mecanismo de Bloqueo por Primer Fallo (First-Failure Lock):** El primer fallo (`ok: false`) **bloquea** el mapa de la línea, impidiendo que llamadas posteriores tapen el error inicial y preservando la causa raíz.
    

### Funciones Deprecadas / Legacy / Transición en 0.2.97

-   `JSOL.use()`: Deprecada. El Linter emite warning; el compilador extrae automáticamente variables libres para PHP `use (&$var)`.
    
-   `JSOL.count`, `JSOL.len`: Redundancias en favor de `Arr.len` / `Str.len`.
    
-   Closures nativos (`JSOL.JS`, `JSOL.PHP`, `JSOL.PY`): Emiten Warning de Linter por romper la portabilidad.
    

## 5\. TAXONOMÍA DE LA LIBRERÍA ESTÁNDAR (CORE-0, CORE-1, CORE-2)

Para garantizar la mantenibilidad y el rendimiento del isomorfismo, las primitivas y funciones del lenguaje se dividen en tres estratos arquitectónicos estrictos según su mecanismo de resolución y transpilación:

### CORE-0: Intrinsics (Mapeo Directo Cero-Costo)

Funciones fundamentales que se delegan 100% a operadores o funciones nativas en todos los lenguajes destino mediante inyección AOT en `rules.json`. No requieren código de runtime ni polyfills.

-   Math: `abs`, `pow`, `sqrt`, `floor`, `ceil`, `trunc`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`, `ln`, `E`, `PI`, `eq`, `neq`, `gt`, `lt`, `gte`, `lte`.
-   Str: `len`, `sub`, `indexOf`, `char`, `fromChar`, `upper`, `lower`, `split`, `contains`, `startsWith`, `endsWith`, `repeat`, `replace`, `eq`, `neq`.
-   Arr: `len`, `push`, `pop`, `shift`, `unshift`, `slice`, `indexOf`, `join`, `contains`.
-   Map: `has`, `keys`, `values`, `count`.
-   Bit: `and`, `or`, `xor`, `not`, `shiftL`, `shiftR`.
-   JSOL: `hasKey`, `len`, `set`, `unset`.

### CORE-1: Hybrid Polyfills (Optimización Condicional)

Primitivas que se delegan a funciones nativas en los lenguajes que las soportan (Fast-Path), pero que inyectan wrappers, adaptadores o manejo de sombras (Shadow Map) en los lenguajes que carecen de soporte nativo o presentan divergencias semánticas.

-   Math: `cbrt`, `logX`, `min`, `max`.
-   Str: `padStart`, `padEnd`.
-   Arr: `sort`.
-   Map: `get`.
-   Cast: `toInt`, `toFloat`, `toStr`.
-   Regex: `match`, `replace`, `test`.
-   JSOL: `ok`, `resetShadow`.

### CORE-2: Self-Hosted Standard Library (Puro JSOL)

Funciones escritas 100% en el propio lenguaje JSOL. Garantizan paridad isomórfica absoluta y determinista porque el algoritmo compilado es idéntico en todos los backends. No delegan a la plataforma subyacente, evadiendo por completo las divergencias de implementación de los runtimes (JS, PHP, Python, C).

-   Math: `sum`, `sub`, `mul`, `div`, `idiv`, `modX`, `roundX`.
-   Str: `concat`, `same`, `replaceAll`, `trim`.
-   Arr: `map`, `filter`, `reduce`, `concat`, `eq`, `neq`.
-   Map: `create`, `merge`, `eq`, `neq`.
-   Cast: `toBool`, `toIntBase`, `toStrBase`.
-   Bool: `and`, `or`, `xor`.
-   JSOL: `range`, `times`.

## 6\. TABLA DE ESTADO Y TRAZABILIDAD (0.2.97 → 0.3.0)

| Elemento / Feature | Estado de Disposición | Build / Target | Notas de Implementación |
| --- | --- | --- | --- |
| Operadores Infijos Userland (`+`, `-`, `*`, `/`, `===`, `&&`, etc.) | PERMITIDO EN USERLAND | Build 0.2.97 | Expresivos y legibles en fuente; la fase JCF se proyecta AOT interna. MD |
| Operador Módulo `%` | PROHIBIDO EN USERLAND | Build 0.2.97 | Prohibido en fuente por divergencia semántica. Exige `Math.modX($a, $b)`. MD |
| Concatenación `+` Mixta | PROHIBIDA EN USERLAND | Build 0.2.97 | Solo permitida para strings puros (`$sA + "" + $sB`). Mixtos usan `Str.concat`. MD |
| `Math.modX`, `Math.roundX`, `Math.logX`, `Math.ln` | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Criterio Excel inyectado en `primitives.json` y `rules.json`. MD |
| `Arr.len`, `Str.len` vs `count`/`length` | ESTABLE / DEPRECACIÓN | Build 0.2.97 | `.length` bloqueado por Linter. `Arr.count` deprecado en favor de `Arr.len`. MD |
| `JSOL.use()` | DEPRECADO | Build 0.2.97 | Linter advierte deprecación. Inyección auto de `use (&$var)` en PHP. MD |
| Dominio `Bool.*` (`and`, `or`, `xor`, `not`) | PENDIENTE 0.3.0 | Spec 0.3.0 | A incorporar en `primitives.json` para la fase JCF interna. MD |
