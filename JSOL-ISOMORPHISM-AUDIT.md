# JSOL-ISOMORPHISM-AUDIT.md

_Companion a [`EXTENDING-SEMANTIC-PARITY-table.md`](./EXTENDING-SEMANTIC-PARITY-table.md). Cruza cada primitiva del core contra el índice de divergencias (N/S/A/M/B/C) y asigna una resolución concreta: **Linter** (detecta y avisa, no cambia el compilado), **Helper** (el compilador inyecta lógica para forzar un único comportamiento), **Spec** (basta con fijar el contrato por escrito, el mapeo nativo ya es seguro), o **Arquitectura** (bloquea varias primitivas a la vez, ver sección final)._

Regla de cierre: **toda fila sin resolución asignada es un hueco de Deterministic Parity sin declarar.** El objetivo de este documento es que esa lista quede vacía — o, donde no se pueda vaciar (ver N-11, C-11), que quede documentada como límite conocido en vez de silenciosa.

* * *

## Str.*

| Primitiva | Divergencias que toca | Resolución | Contrato propuesto |
|---|---|---|---|
| `Str.len($s)` | S-01 | **Helper** | Cuenta *code points* Unicode, nunca UTF-16 units ni bytes. JS no puede usar `.length` nativo (rompe con astral chars/emoji) — necesita `[...s].length` o equivalente. PHP ya está bien si se fuerza `mb_strlen($s,"UTF-8")` (confirmado: así está implementado hoy en el compilador real). Go necesita `utf8.RuneCountInString`. |
| `Str.sub($s,$start,$len)` | S-01, S-02, S-03 | **Helper** | Indexa y corta por code point, nunca puede partir un surrogate pair a la mitad. JS: array de code points vía `Array.from`/spread, no slice de string crudo. |
| `Str.indexOf($s,$needle)` | S-04 | **Spec** | Contrato fijo: siempre retorna int, `-1` si no está. Nunca `false`/`null`. El wrapper ya alcanza para esto — no hace falta helper, solo documentar el sentinel. |
| `Str.replace($s,$search,$replace)` | S-10 | **Helper — prioridad alta** | Hay que fijar UNO: ¿primera ocurrencia o todas? Esto ya casi te muerde hoy: `str_replace` de PHP reemplaza todas por default, `.replace()` de JS solo la primera salvo regex `/g`. Recomiendo fijar **"todas"** (matchea PHP nativo; JS necesita `.replaceAll()` o el patrón split/join si el target no lo soporta). |
| `Str.char($s,$idx)` | S-01, S-02 | **Helper** | Mismo problema que `Str.sub` — indexar por code point, no por unidad UTF-16. |
| `Str.fromChar($code)` | S-11 | **Helper** | El dominio de entrada debe ser explícitamente "code point Unicode", no byte ni UTF-16 code unit. JS: `String.fromCodePoint`, **no** `String.fromCharCode` (ese trunca fuera del BMP — trampa silenciosa real). |
| `Str.upper($s)` / `Str.lower($s)` | S-07 | **Helper** | Debe fijarse a mapeo de caso *locale-invariant*, nunca depender del locale del host/SO. Java: `.toUpperCase(Locale.ROOT)`, no el default. C#: `.ToUpperInvariant()`. Sin esto, el mismo código produce resultados distintos según el locale del servidor donde corre — un divergencia invisible en dev y real en prod. |
| `Str.trim($s)` | S-08 | **Helper** | Fijar el set exacto de whitespace que se recorta (¿incluye NBSP `\u00A0`? ¿solo ASCII?). No confiar en el `trim()` nativo de cada target — ya difieren hoy (JS lo saca, PHP lo deja). |
| `Str.split($s,$d)` | S-05, S-19 | **Helper** | Fijar comportamiento con delimitador vacío (¿split por code point?) y con separadores al final del string (¿se conserva el string vacío final o se descarta?). |

## Arr.*

| Primitiva | Divergencias que toca | Resolución | Contrato propuesto |
|---|---|---|---|
| `Arr.count($a)` | — | **Spec** | Sin divergencia conocida — mapeo nativo directo en todos los targets. |
| `Arr.push($a,$item)` | A-13, A-14, C-05 | **Arquitectura** (ver abajo) | No se resuelve a nivel de función — depende de la decisión de semántica de mutación. |
| `Arr.pop($a)` / `Arr.shift($a)` | A-06 | **Helper** | Fijar el valor sentinel de "array vacío" (recomendado: `null` uniforme, nunca excepción, nunca `undefined`). |
| `Arr.slice($a,$start,$end)` | A-04 | **Helper** | JS usa `(start,end)`, PHP nativo usa `(offset,length)`. Fijar convención `(start,end)` estilo JS y que el wrapper de PHP haga la conversión `length = end - start` internamente — la firma de la primitiva ya lo sugiere, solo falta que el wrapper lo implemente así en cada target sin excepción. |
| `Arr.indexOf($a,$item)` | A-05 | **Helper** | Comparación siempre estricta por tipo (evita el loose-compare default de `in_array` en PHP — requiere el flag `true` explícito). |
| `Arr.join($a,$d)` | A-11 | **Helper** | `null` dentro del array siempre se trata como string vacío en el join, nunca lanza, nunca se omite el separador. |

## Map.*

| Primitiva | Divergencias que toca | Resolución | Contrato propuesto |
|---|---|---|---|
| `Map.create(...)` | M-01, M-05 | **Arquitectura** (ver abajo) — orden de iteración; **Spec** para keys duplicadas (last-wins, documentar y listo) | — |
| `Map.has($m,$key)` | M-03 | **Helper** | Debe implementarse con el equivalente a `array_key_exists`, nunca `isset` — si no, una key con valor `null` da falso negativo en PHP y el comportamiento diverge de JS `Map.has`. |
| `Map.keys($m)` | M-02, M-10 | **Arquitectura** (ver abajo) — coerción de keys | — |

## Math.*

| Primitiva | Divergencias que toca | Resolución | Contrato propuesto |
|---|---|---|---|
| `Math.floor($n)` / `Math.abs($n)` / `Math.pow($b,$e)` | — | **Spec** | Sin divergencia real de valor — mapeo nativo directo. (N-21: `floor` retorna int en Python y float en el resto — es diferencia de *tipo de retorno*, no de valor; si `$n` es tipo dinámico en JSOL no importa, pero si en algún momento hay tipado esto hay que anotarlo). |
| `Math.min($a,$b)` / `Math.max($a,$b)` | N-07, N-38 | **Helper** | Fijar propagación de `NaN`: si cualquier argumento es `NaN`, el resultado debe ser `NaN` siempre (matchea JS). PHP nativo `min()`/`max()` ignoran `NaN` silenciosamente — necesita chequeo explícito `is_nan()` antepuesto en el wrapper. |
| `Math.round(...)` | N-03 | Ver arriba — pasa a `Math.roundHalfOut` (o el nombre que elijan) | — |
| _(propuesto)_ `sin/cos/tan/asin/acos/atan/atan2` + `Math.PI` | N-11 | **No resoluble — documentar como límite conocido** | Mapeo nativo 1:1 en todos los targets, pero el último bit puede variar por diferencias de libm entre plataformas. No hay wrapper razonable que lo arregle sin escribir trigonometría en software puro — lo cual viola el criterio de core mínimo en la otra dirección. Se documenta como hueco aceptado, no se pretende resolver. |

## Bit.*

| Primitiva | Divergencias que toca | Resolución | Contrato propuesto |
|---|---|---|---|
| Todo el namespace | N-09, N-32, C-06 | **Arquitectura** (ver abajo) — ancho de bits | — |

## Cast.*

| Primitiva | Divergencias que toca | Resolución | Contrato propuesto |
|---|---|---|---|
| `Cast.toStr($val)` | N-04, N-05, N-14, B-01 | **Helper — el más caro de todo el core** | Necesita un formateador float→string determinista propio (shortest-round-trip, reglas fijas de notación exponencial), no delegable a ningún `printf`/`toString` nativo — mismo espíritu que el motor de regex propio. Booleanos: fijar un único literal (`"true"`/`"false"`, no el `"1"`/`""` de PHP). |
| `Cast.toInt($val)` | N-13, N-20, N-41 | **Bloqueado por decisión previa** | No se puede fijar el comportamiento de overflow sin primero definir el ancho de `$q` (ver N-23/N-24 en tu propia tabla — ya lo tenían anotado como abierto). |
| `Cast.toFloat($val)` | — | **Helper** | Fijar comportamiento con string no-numérico: `0` silencioso (estilo JS/PHP) vs error — recomiendo `0` silencioso + **regla de linter** que marque el uso de `Cast.toFloat` sobre un valor no verificado como numérico. |

## Regex.*

| Primitiva | Divergencias que toca | Resolución | Contrato propuesto |
|---|---|---|---|
| `Regex.match` / `Regex.replace` / `Regex.test` | C-11 | **Es la namespace de más riesgo hoy, no la más segura** | Estas tres existen específicamente para blindar contra C-11 (lookbehind/backreferences/Unicode properties difieren entre motores nativos) autohosteando un motor propio — pero acabamos de encontrar en vivo que ese motor propio no soporta grupos no-capturantes correctamente. La garantía de isomorfismo de este namespace es tan buena como la cobertura de sintaxis del motor, y hoy esa cobertura no está auditada ni documentada. Antes de seguir agregando primitivas en otros namespaces, esto necesita su propio pase: qué subconjunto de sintaxis regex está soportado y probado (grupos no-capturantes, lookahead, backreferences, clases Unicode) vs qué produce fallos silenciosos como el de hoy. |

* * *

## Decisiones de arquitectura (bloquean varias filas de arriba a la vez)

Estas cuatro no se resuelven escribiendo un wrapper por función — hay que decidirlas una vez, arriba de todo, porque cualquier primitiva que dependa de ellas necesita reescribirse si la decisión cambia después.

### 1. Semántica de mutación de `Arr.*` (A-13, A-14, C-05)
JSOL tiene que declarar explícitamente si los arrays son **por referencia** (como JS — `push` sobre una variable muta lo que ve cualquier otra variable apuntando al mismo array) o **por valor/copy-on-write** (como PHP nativo). Sea cual sea la elección, el target que no la comparte nativamente necesita un wrapper estructural — no una función, un *tipo de dato* distinto al nativo del lenguaje (en PHP, forzar paso por referencia explícito en cada función que reciba un array; en Go, envolver en un struct con puntero). Esto toca cada función de `Arr.*`, no solo `push`.

### 2. Orden de iteración y tipado de keys de `Map.*` (M-01, M-02, M-10)
Dos problemas empaquetados juntos: (a) el orden de iteración debe garantizarse **insertion order** siempre — lo cual es imposible con un `map` nativo de Go o Rust (orden aleatorio por diseño), así que ahí `Map.*` no puede compilar a un map nativo, necesita una estructura propia (par de arrays: keys ordenadas + valores, o una lista enlazada de buckets). (b) las keys no pueden coercionarse — PHP convierte automáticamente `"1"` a `1` en un array nativo, lo cual rompe la distinción que JS Map sí preserva. Mismo diagnóstico: en PHP, `Map.*` tampoco puede apoyarse en el array nativo, necesita su propio wrapper desde el día uno.

### 3. Ancho de bits fijo para `Bit.*` (N-09, N-32, C-06)
Cada lenguaje tiene su propio ancho nativo por default (JS fuerza 32-bit signed en cualquier operación bitwise, Go/Rust respetan el ancho declarado de la variable, C depende de la plataforma). Sin fijar esto, dos targets pueden dar resultados distintos para la misma operación sobre el mismo número apenas se pasa de 31 bits. Además `>>` (aritmético, preserva signo) y `>>>` (lógico, no existe fuera de JS) son operaciones *distintas* escondidas bajo el mismo símbolo en JS — eso ya es una señal de que `Bit.shiftR` necesita partirse en dos primitivas separadas (`Bit.shiftR` aritmético + `Bit.shiftRUnsigned`), mismo principio que aplicamos a `round`: un nombre nunca debe significar dos comportamientos.

### 4. El ancho/tipo de `$q` (N-23, N-24 — ya lo tenían señalado como abierto en su propia tabla)
`Cast.toInt` no se puede terminar de especificar (comportamiento de overflow: ¿satura, envuelve, o rechaza?) hasta que esto se cierre. Es la única de las cuatro que ya tenían identificada como pendiente — la marco acá para que quede explícito que bloquea una primitiva concreta del core actual, no es solo una preocupación teórica a futuro.

* * *

_JSOL — auditoría de isomorfismo, generada en sesión de diseño, 2026-08-20._
