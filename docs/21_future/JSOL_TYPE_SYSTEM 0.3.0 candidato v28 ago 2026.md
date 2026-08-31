# JSOL — Sistema de Tipos Final (Type Prefix Matrix v0.3)

> Reemplaza la Type Prefix Matrix v0.2. `$i` y `$q` quedan **eliminados** como
> prefijos de primera clase. No hay migración retroactiva que proteger:
> pre-1.0, sin adopción externa, Hyrum's Law no aplica todavía.

**Targets considerados:**

```
Shipping:   JavaScript (browser, Node), PHP, TypeScript, Python
Next:       Google Apps Script
Future:     Go, C#, Java, Kotlin, Swift, Dart, Ruby, Rust
Not C-like: Excel (JSOL-X vision)
Ambitious:  C, C++ (JSOL-C vision)
Improbable: Objective-C, Lua, Scala, Haskell, R, Haxe, Zig, Nim, Vala,
            Elixir, Clojure, Julia, Solidity, WebAssembly, LLVM IR
```

**Regla de nomenclatura (fijada):** el tipo genérico es siempre **1 letra**.
El subtipo, cuando existe, es de **1 a 2 letras**, seguidas de **dígitos si
hace falta especificar ancho físico**. Tres letras o más quedan reservadas
exclusivamente para tipos custom del usuario (`$colHex`, etc.).

---

## 1. Principio de diseño: dos ejes ortogonales

Todo tipo numérico en JSOL vive en dos ejes independientes que **no se
mezclan en el mismo carácter**:

- **Eje semántico** (nivel de tipo genérico, 1 letra): qué es esto para el
  negocio. Resuelto por el usuario o por contexto sintáctico. No le importa
  a C.
- **Eje físico** (nivel de subtipo, letras + dígitos): cuántos bytes ocupa
  y con qué representación. Solo le importa a targets sin GC (C/C++, y
  potencialmente Rust/Go si se decide no delegar en su propio runtime).
  Resuelto por el compilador, expuesto al usuario solo cuando el target lo
  exige.

`$i` y `$q` murieron porque mezclaban ambos ejes en una sola letra
(semántica de "índice"/"cantidad" + ancho físico implícito). Eso generaba
fricción a un usuario de JS/Excel que nunca debería razonar sobre signo o
ancho de bits.

---

## 2. Tipos Core (1 letra) — lo único que el usuario de JS/PHP/TS/Python/Excel escribe

| Prefijo | Nombre | Descripción |
|---|---|---|
| `$n` | Number | Numérico genérico. Cubre lo que antes eran `$i`/`$q` además de floats. Ambiguo por diseño — la Symbol Table resuelve el subtipo físico internamente por contexto sintáctico estático (ver §4). |
| `$s` | String | Texto genérico. |
| `$a` | Array | Lista ordenada, homogénea (regla de oro de determinismo). |
| `$m` | Map | Diccionario clave-valor. |
| `$b` | Boolean | `true`/`false`. Mapea a `TRUE`/`FALSE` en Excel, nunca localizado. |
| `$f` | Function | Rutina lógica. No first-class más allá de la declaración. |
| `$x` | Regex | Motor Thompson VM propio de JSOL, no regex nativo del host. |
| `$y` | Byte/Binary | Datos binarios genéricos. |

**Nada de esto cambia respecto a hoy**, salvo que `$n` absorbe el rol que
antes cubrían `$i`/`$q`.

---

## 3. Subtipos físicos — expuestos solo cuando el target lo exige

### 3.1 `$n` — el único tipo con subtipado por ancho real

Tres familias físicas, sin excepción — nada de nombres heredados de
"Quantity"/"Index":

| Subtipo | Tipo físico (C) | Familia |
|---|---|---|
| `$ni8` | `int8_t` | Signed integer |
| `$ni16` | `int16_t` | Signed integer |
| `$ni32` | `int32_t` | Signed integer |
| `$ni64` | `int64_t` | Signed integer |
| `$nu8` | `uint8_t` | Unsigned integer |
| `$nu16` | `uint16_t` | Unsigned integer |
| `$nu32` | `uint32_t` | Unsigned integer |
| `$nu64` | `uint64_t` | Unsigned integer |
| `$nf32` | `float` | Float |
| `$nf64` | `double` | Float |

El usuario **nunca está obligado** a tipear estos diez en managed
(JS/PHP/TS/Python/GAS). Solo aparecen: (a) forzados explícitamente por el
usuario, a su propio criterio — igual que hoy alguien puede declarar `$sa`
en vez de `$s` genérico para ganar performance sin que el compilador se lo
exija —, o (b) exigidos por el linter cuando el target es JSOL-C y la
inferencia estática no puede resolver sin ambigüedad. Hoy el compilador no
tiene perfil JSOL-C implementado; el caso (b) es la meta a futuro para que
el compilador sea realmente universal, no una restricción activa todavía.

### 3.2 `$s` — ya cerrado, sin cambios

| Subtipo | Descripción | Motivo |
|---|---|---|
| `$sa` | ASCII estricto | Acceso O(1), nativo en PHP/C |
| `$su` | Unicode/UTF-8 | Iteración O(N) segura — PHP no maneja bien Unicode nativo |

### 3.3 `$a` — un solo subtipo, no por tipo de elemento

| Subtipo | Descripción | Motivo |
|---|---|---|
| `$af` | Longitud fija | Único dato no derivable del contenido; necesario en C/Rust/Go/Java para decidir `struct` de memoria contigua vs. contenedor dinámico. |

> **Punto abierto, no cerrado en esta revisión:** la derivación automática
> del tipo de elemento asume homogeneidad (`["a", "b"]`, nunca `["a", 1]`).
> Esa regla **no está confirmada en la spec actual** — fue un supuesto
> introducido en esta conversación sin verificar contra la spec real, y
> hay que corregirlo acá en vez de dejarlo pasar. Si JSOL permite arrays
> heterogéneos (`["a", 1]`), la derivación automática no alcanza para
> JSOL-C: no hay un `struct` único de memoria contigua que cubra tipos
> mixtos sin heap + puntero genérico, exactamente lo que el perfil
> JSOL-C busca evitar. Decisión pendiente, a resolver por vos: (a) fijar
> homogeneidad como regla nueva de la spec — ahí la derivación automática
> de §3.3 queda válida tal cual —, o (b) confirmar que los arrays son
> heterogéneos — ahí hace falta retomar el subtipado por elemento
> (`$as`/`$an`/etc., evaluado y descartado más arriba en la conversación
> solo bajo el supuesto de homogeneidad) o alguna otra resolución para
> C/Rust/Go/Java.

### 3.4 `$m` — sin subtipos

Clave y valor se derivan del primer par asignado, mismo motivo que `$a`.
La única obligación real es del **compilador, no del usuario**: en targets
donde el mapa nativo no garantiza orden de inserción (Go `map`, Rust
`HashMap`, Java `HashMap` sin `Linked`), el emisor debe usar siempre la
variante ordenada (`LinkedHashMap`, `IndexMap`, o mapa + lista de claves
paralela en Go). Esto es responsabilidad de `Map.*`, no del sistema de
tipos.

### 3.5 `$y` — subtipos por ancho de palabra, misma convención que `$n`

`$y32`/`$y64` no rompen la regla de nomenclatura — la regla limita las
**letras** a 1-2, no los dígitos. Corrijo la numeración anterior
(`$y1`/`$y4`/`$y8`, en bytes) porque quedaba inconsistente con `$ni8`
etc. (en bits): todo el sistema usa ancho en **bits**, sin excepción.

| Subtipo | Tipo físico (C) |
|---|---|
| `$y8` | `uint8_t*` (byte individual) |
| `$y32` | `uint32_t*` (word 32 bits) |
| `$y64` | `uint64_t*` (word 64 bits) |

### 3.6 `$b`, `$f`, `$x` — sin subtipos

No hay divergencia física entre targets que lo justifique.

---

## 4. Resolución de `$n` — cómo se infiere sin romper Portability

La Symbol Table infiere el subtipo físico de cada `$n` por **contexto
sintáctico estático**, nunca por heurística sobre el valor en runtime. La
regla de inferencia queda fijada en la spec (no es "mejor esfuerzo" del
compilador), así que dos generaciones del compilador siempre infieren
igual para el mismo source — preserva Deterministic Parity.

Reglas de inferencia (candidatas, a cerrar antes de v0.3):

- `$n` usado para indexar un array (`$arr[$n]`), como resultado de
  `.length`, o como variable de control de `for` → `$nu32` interno.
- `$n` con literal entero en contexto de conteo/cantidad de negocio →
  `$ni64` interno.
- `$n` con punto decimal, o resultado de división, o de `Math.*`
  no-entero → `$nf64` interno.

Si el linter en perfil JSOL-C no puede resolver sin ambigüedad, exige uno
de los diez subtipos de §3.1 de forma explícita — error de compilación, no
warning, porque en C no hay margen para improvisar tamaño de memoria.

**Tabla de Símbolos — estructura:**

```typescript
interface SymbolEntry {
  declared: string;              // '$n', '$a', '$s', etc. — lo que escribió el usuario
  inferred_physical: string | null; // '$ni64', '$nf64', '$sa', etc. — null si es ambiguo
  target_resolution: Record<string, string>; // { c: 'int64_t', go: 'int64', js: 'number' }
}
```

---

## 5. Reservados — el espacio completo de 1 letra es del core, siempre

**Las 26 letras de 1 carácter están reservadas para JSOL, tengan o no
semántica asignada hoy.** Ese es precisamente el motivo de la regla de
§0 (custom types exigen 3+ caracteres): si un tipo custom pudiera usar
2 letras, cualquier letra suelta que el core decida usar en el futuro
podría colisionar con un tipo que un usuario ya declaró. El mínimo de 3
caracteres no es arbitrario, es la garantía de no-colisión permanente
entre el espacio del lenguaje y el espacio del usuario.

**Ya implementadas (§2):** `$n`, `$s`, `$a`, `$m`, `$b`, `$f`, `$x`, `$y`.

**Con nombre y dirección ya comprometidos, semántica sin cerrar** — las
únicas consideradas hasta ahora en esta conversación, no una lista
cerrada del alfabeto completo:

| Prefijo | Nombre | Motivación |
|---|---|---|
| `$c` | Currency | Distinto de `$n`: precisión fija por moneda, reglas de redondeo (half-up comercial vs. half-even bancario). Ver JSOL-X. |
| `$p` | Percentage | Semánticamente distinto de float — mezclar `15%` con `0.15` es fuente real de bugs. |
| `$d` | Date | Ver tabla de divergencias por target en el spec de JSOL-X — timezone, DST, leap seconds, year 2038. |
| `$g` | Geometry/Angle | Relevante para IPAX (hue en HSL/HSV/OKLCH). Normalización 360°=0°, notación sexagesimal. |
| `$t` | Time/Duration | Distinto de `$d`: duración vs. instante. |

`$c` y `$p`, cuando se implementen, van a necesitar el mismo tratamiento de
subtipado físico que `$n` (§3.1) para JSOL-C — son el mismo problema en
otro nombre semántico, no un problema nuevo.

**El resto del alfabeto** (todas las letras sin nombre asignado todavía)
sigue reservado para el core por el mismo motivo, aunque no tenga
propuesta de uso concreta hoy.

---

## 6. Excluidos — con motivo, para no reabrir la discusión

| Tipo | Por qué queda fuera |
|---|---|
| `undefined` | Concepto exclusivo de JS. Todo caso que lo produciría es un error definido en JSOL. |
| `NaN`/`Infinity` como valores | No serializables a JSON. Errores definidos en su lugar. |
| `Function` first-class más allá de `$f` | JSOL no permite funciones como datos. |
| `Promise`/`async` | JSOL es síncrono por diseño. |
| `Symbol`, `WeakMap`/`WeakSet`, `Proxy`/`Reflect`, `Generator` | Sin caso de uso en lógica de negocio, o dependientes de GC/comportamiento no determinístico. |
| `class`/`this`/`new`/herencia | Excluido por spec — datos planos únicamente. |
| Subtipos de elemento en `$a`/`$m` (`$an`, `$as`, `$ms`, etc.) | Evaluados y descartados — no escalan, se derivan en su lugar (§3.3, §3.4). |
| `$i`, `$q` como prefijos de primera clase | Eliminados en esta revisión — mezclaban eje semántico y eje físico (§1). |

---

## 7. Resumen ejecutivo

**Lo que el usuario escribe, siempre, en cualquier target managed:**
`$n`, `$s`, `$a`, `$m`, `$b`, `$f`, `$x`, `$y` — ocho letras, cero
fricción, cero conocimiento de C requerido.

**Lo que existe para JSOL-C, expuesto solo cuando hace falta:**
diez subtipos de `$n` (§3.1), dos de `$s` (ya existentes), uno de `$a`
(`$af`), tres de `$y`. Total: dieciséis subtipos para cubrir C/C++, con el
mismo mecanismo listo para reutilizarse en Go/Rust/Java/C#/Kotlin/Swift/Dart
cuando les llegue el turno, sin tocar la sintaxis que ya usan los targets
shipping.
