# JSOL Language Specification

2026, [Santiago Bustelo](https://www.bustelo.com.ar/) • MIT License

v.0.2.97 • 2026-08-31

This document is the authoritative definition of the JSOL language. It defines JSOL by what it **is**, not by what it forbids. A construct is valid JSOL if and only if it matches one of the forms defined in Section 2. The forbidden-features list is a derived reference, not the source of truth.

JSOL is 100% valid JavaScript. Not all JavaScript is JSOL.

## 1\. Design Principles

Four pillars, in priority order when two of them conflict:

-   **Clarity**: a JSOL algorithm has to be readable by the person who owns the business logic, not just by a compiler. When a portability rule would force an algorithm into an unreadable shape, the rule loses. JSOL only prescribes what changes the output a program produces (types, operators, control flow determinism) — it never prescribes code shape (nested functions vs. flat scope, for instance), because that's implementation structure, not business logic.
-   **Portability**: the same source runs correctly on every proven target. **Deterministic Parity** is what Portability means for JSOL specifically: given identical inputs, every target's transpilation MUST produce bit-for-bit identical output.
-   **Performance**: compiled output is no heavier and no slower than it has to be. **Zero Dead Code** follows directly: environment-specific blocks, unused helpers, and closure dependency declarations are stripped or inlined per target, so no output carries payload it doesn't use.
-   **Developer Experience**: writing, compiling, and debugging JSOL is as frictionless as the other three pillars allow. Two things follow from this, not from Portability or Performance: the **AST-free compiler pipeline** (a lexer mask plus deterministic string transformations, no external toolchain, easy to embed in an existing build), and **Zero Runtime Dependencies** (JSOL source never touches `window`, `document`, `$_SERVER`, `$_GET`, or any host-environment global — orchestration lives outside the `.jsol` file, and nothing needs installing before you can start).

## 2\. The Permitted Grammar

A `.jsol` file is a sequence of the following forms. Nothing outside this list is JSOL, regardless of whether it happens to be valid JavaScript.

### 2.1 File header

Every file starts with the pragma comment, on line 1:

JavaScript

```
// @JSOL
```

### 2.2 Declarations

JavaScript

```
const $name = <expression>;
let $name = <expression>;
```

All identifiers are prefixed with `$`. This is not cosmetic: it keeps variable references visually and mechanically distinct from bare words in generated PHP, where `$` is syntactically load-bearing. `var` is not part of the grammar.

**Prefix Delimiters (Mandatory):** In the first declaration of a variable, the type prefix MUST be separated from the root name using an underscore (`_`) or CamelCase boundary. Example: `let $ni32_pepito = 10;` or `let $ni32Pepito = 10;`. Omitting the delimiter (`$npepito`) triggers a fatal linter error.

**Type Prefix Matrix (v0.2.97):**

-   `$n` (number/float): Double precision floating point.
-   `$s` (string): Generic/indeterminate text.
-   `$a` (array): Sequential list.
-   `$m` (Map): Hash dictionary.
-   `$b` (boolean): Strict `true` or `false`.
-   `$y` (byte/binary): Raw byte buffer.
-   `$x` (regex): Safe-subset regular expression.
-   `$f` (function): Typed-parameter position only.

_(Note: The `$i` and `$q` prefixes are legacy transitional types. See Section 8)._

### 2.3 Functions

JavaScript

```
const $name = function($param1, $param2) {
    <statements>
};
```

Named function expressions assigned to a `const`, using the `function` keyword. Arrow function _expressions_ (single expression, no braces) are permitted as values: `const $double = $x => $x * 2;`. Arrow functions _with a block body and parameters_ are not part of the general grammar.

### 2.4 Control flow

JavaScript

```
if (<condition>) { <statements> }
else if (<condition>) { <statements> }
else { <statements> }

for (let $i = 0; $i < <bound>; $i = $i + 1) { <statements> }

for (const $i of JSOL.range($start, $end, $maxIter)) { <statements> }

while (<condition>) { <statements> }
```

`for...of` (except when strictly bound to `JSOL.range($start, $end, $maxIter)`), `for...in`, and functional iteration are not part of the grammar. See Section 3 for why.

Standard for loops require explicit step assignments `($i = $i + 1)`. Bounded, deterministic numeric range iteration across all target generators is expressed strictly via `JSOL.range($start, $end, $maxIter)`, where the optional third parameter `$maxIter` specifies a hard iteration limit reserved for static analysis bounds in JSOL-X.

### 2.5 Data construction

JavaScript

```
Map.create("key1", $val1, "key2", $val2)   // structured record, replaces object literals
[$a, $b, $c]                               // array literal, construction only
```

Object literal syntax (`{ key: value }`) and object shorthand are not part of the grammar; `Map.create()` is the only way to construct a keyed record. Array literals are permitted for construction; array _mutation_ goes through explicit calls (`Arr.push()`), not literal re-assignment tricks.

### 2.6 Expressions

Arithmetic (`+ - * /`), strict comparison (`=== !==`, `>`, `<`, `>=`, `<=`), logical (`&&`, `||`, `!`) on explicit boolean expressions, and template literals for string interpolation are permitted. Implicit truthiness, implicit coercion, and the loose equality operators (`== !=`) are not part of the grammar: every conditional must be an explicit, unambiguous boolean expression.

The `%` (modulo) operator is **strictly forbidden** in Userland due to cross-platform semantic divergence. Use `Math.modX($a, $b)` instead.

## 3\. The Signature Asymmetry Problem

This section explains why functional array methods are excluded from the grammar rather than merely discouraged. It's not a style preference, it's that a regex-based compiler cannot transpile them correctly, ever.

JavaScript's array methods are object methods: the array owns the call, the callback is an argument.

JavaScript

```
$arr.map(function($item) { return $item * 2; })
```

PHP's array functions are free functions, and their argument order is not even consistent with each other:

PHP

```
array_map(function($item) { return $item * 2; }, $arr)     // callback first, array second
array_filter($arr, function($item) { return $item > 0; })  // array first, callback second
array_reduce($arr, function($acc, $item) { ... }, 0)        // array first, callback second, initial value last
```

To transpile `$arr.map(function($x){ ... }).filter(function($x){ ... })` correctly, a compiler needs to:

1.  Locate the matching closing brace of the callback body, which for a regex engine means counting nested `{ }` by hand, character by character, because regex has no concept of nesting depth.
2.  Reorder the array reference and the callback around each other, differently per method.
3.  Resolve chaining into nested calls: `array_map(..., array_filter(..., $arr))`.

Any `if` inside the callback introduces its own `{ }` pair. A regex-based brace matcher that isn't doing genuine counting will terminate at the wrong `}`, truncate the callback body, and emit syntactically broken PHP. This is not a hypothetical: it's the exact class of bug that has come up repeatedly in JSOL's own self-hosting process.

**Consequence**: JSOL requires imperative `for` / `while` loops, which compile to identical syntax in JS, PHP, Python, and C-family languages generally, with no reordering, no chaining resolution, and no brace-counting risk. Iterators like `Arr.map` or `Arr.filter` must be passed exclusively as named function references or single-expression inline lambdas.

## 4\. Performance Consequences of the Restricted Grammar

The restrictions in Section 2 aren't purely about transpilation safety. They have measurable engine-level effects, in both directions.

### Gains

-   **No prototype chain traversal.** Forbidding `class`, `this`, `new`, and inheritance means every value is a flat dict or a primitive. V8 builds hidden classes for flat objects almost instantly, and PHP associative arrays are cheaper than instantiated objects.
-   **Zero DOM coupling by construction.** JSOL code cannot reference `window` or `document`, so it structurally cannot trigger a reflow or repaint. Every millisecond of execution stays on the CPU.
-   **No catastrophic backtracking.** V8 and PCRE are different regex engines; a pattern that resolves in milliseconds in one can hang the other (ReDoS). By enforcing a safe subset, execution time stays linear and deterministic in all targets.
-   **No optional-chaining overhead.** `if ($obj !== null && Map.has($obj, "prop"))` is more to type, but explicit checks are cheaper for a JIT to optimize.

### Costs

-   **Single-thread blocking.** No `async`, `await`, `Promise`, or Worker API inside JSOL means JSOL is strictly synchronous. A 10-million-iteration computation written in JSOL will freeze the tab until it finishes. There is no way to delegate JSOL work to a background thread _from inside JSOL itself_ without breaking PHP/Python parity.
-   **More GC pressure on sustained workloads.** Without classes or `this.state`, all state passes explicitly between function calls. Processing large arrays means copying or passing references repeatedly rather than mutating a long-lived object, which can mean more frequent garbage collection pauses.

## 5\. `JSOL.range()` — `for` syntax resolved entirely at compile time

JavaScript

```
for (let $i of JSOL.range($from, $to, $step, $maxLimit)) {
    // body
}
```

This is not a function call. There is no runtime iterator, no generator, nothing named `range` exists in the compiled output. The compiler recognizes this exact syntactic shape and rewrites it directly into the target's native `for` loop at compile time.

**Semantics**: half-open interval, `$from` inclusive, `$to` exclusive — `JSOL.range(1, 5, 1)` produces `1, 2, 3, 4`.

Compiled output, JS:

JavaScript

```
for (let $i = $from; $i < $to; $i += $step) { /* body */ }
```

**Scope note**: this is the only `for...of` form the grammar accepts. Any `for...of` that isn't exactly `JSOL.range(...)` as its iterable is a linter error.

## 6\. Rules Reference

### Rule 1: Never index strings directly

V8 strings are UTF-16 code units; PHP strings are byte sequences. `$str[$i]` or direct character iteration will drift out of sync the moment a multi-byte character appears. Use `Str.len()`, `Str.char()`, and `Str.sub()`.

### Rule 2: Integer bounds and division

Keep integers strictly below `Number.MAX_SAFE_INTEGER` (2^53 - 1). Always use `Math.idiv()` or `Math.trunc()` for integer operations.

### Rule 3: No numeric-string dictionary keys

PHP auto-casts numeric string keys to integers (`['10' => $v]` becomes `[10 => $v]`), which breaks strict-equality comparisons against a JS object with the same nominal keys. Never use pure numeric strings as `Map.create()` keys.

### Rule 4: No implicit truthiness

`"0"` and `[]` are truthy in JS, falsy in PHP. `if ($x)` is never valid JSOL. Require explicit checks: `Str.len($str) > 0`, `Arr.len($arr) > 0`, `$x !== null`.

### Rule 5: No array/object mutation across function boundaries

JS arrays and objects pass by reference; PHP arrays are copy-on-write value types. Logic that depends on a callee mutating a caller's array will behave correctly in JS and silently fail in PHP. Return new values instead of relying on mutation. (Exceptions: `Arr.push`, `Arr.pop`, `Arr.shift`, `Arr.unshift` mutate in-place).

### Rule 6: Bitwise operations

Native `&`, `|`, `^`, `~`, `<<`, `>>` are excluded due to coercion and bit-width differences across runtimes. Use the `Bit.*` domain primitives (`Bit.and`, `Bit.or`, `Bit.xor`, `Bit.not`, `Bit.shiftL`, `Bit.shiftR`).

### Rule 7: String concatenation and coercion

Bare `+` concatenation between mixed types is strictly forbidden as it produces fatal TypeErrors in Python and implicit coercion bugs in PHP. To safely concatenate strings and numbers across all target runtimes, explicitly cast numbers using `Cast.toStr($val)` prior to concatenation, or use `Str.concat($s1, $s2, ...)`.

## 7\. Taxonomy of the Standard Library (CORE-0, CORE-1, CORE-2)

To guarantee maintainability and performance of the isomorphism, primitives and language functions are divided into three strict architectural strata based on their resolution and transpilation mechanism:

### CORE-0: Intrinsics (Zero-Cost Direct Mapping)

Fundamental functions that map 100% to native operators or native functions in all target languages via AOT injection in `rules.json`. They require no runtime code or polyfills.

-   **Math:** `abs`, `pow`, `sqrt`, `floor`, `ceil`, `trunc`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`, `ln`, `E`, `PI`, `eq`, `neq`, `gt`, `lt`, `gte`, `lte`.
-   **Str:** `len`, `sub`, `indexOf`, `char`, `fromChar`, `upper`, `lower`, `split`, `contains`, `startsWith`, `endsWith`, `repeat`, `replace`, `eq`, `neq`.
-   **Arr:** `len`, `push`, `pop`, `shift`, `unshift`, `slice`, `indexOf`, `join`, `contains`.
-   **Map:** `has`, `keys`, `values`, `count`.
-   **Bit:** `and`, `or`, `xor`, `not`, `shiftL`, `shiftR`.
-   **JSOL:** `hasKey`, `len`, `set`, `unset`.

### CORE-1: Hybrid Polyfills (Conditional Optimization)

Primitives delegated to native functions on platforms that support them natively (Fast-Path), but which inject wrappers, adapters, or Shadow Map handling on languages that lack native support or present semantic divergences.

-   **Math:** `cbrt`, `logX`, `min`, `max`.
-   **Str:** `padStart`, `padEnd`.
-   **Arr:** `sort`.
-   **Map:** `get`.
-   **Cast:** `toInt`, `toFloat`, `toStr`.
-   **Regex:** `match`, `replace`, `test`.
-   **JSOL:** `ok`, `resetShadow`.

### CORE-2: Self-Hosted Standard Library (Pure JSOL)

Functions written 100% in the JSOL language itself. They guarantee absolute and deterministic isomorphic parity because the compiled algorithm is identical across all backends. They do not delegate to the underlying platform, completely evading implementation divergences among runtimes (JS, PHP, Python, C).

-   **Math:** `sum`, `sub`, `mul`, `div`, `idiv`, `modX`, `roundX`.
-   **Str:** `concat`, `same`, `replaceAll`, `trim`.
-   **Arr:** `map`, `filter`, `reduce`, `concat`, `eq`, `neq`.
-   **Map:** `create`, `merge`, `eq`, `neq`.
-   **Cast:** `toBool`, `toIntBase`, `toStrBase`.
-   **Bool:** `and`, `or`, `xor`.
-   **JSOL:** `range`, `times`.

## 8\. Deprecated & Transitional Features

The following features remain in the 0.2.97 build for self-hosting transition and legacy support, but are slated for removal or trigger linter warnings. They MUST NOT be used in new JSOL code.

### 8.1 The Modulo Operator (`%`)

Replaced universally by `Math.modX($a, $b)`. Emits linter errors.

### 8.2 Array/String Length Properties (`.length`, `count()`)

-   `.length` property access is forbidden.
-   `Arr.count` and `JSOL.count` are deprecated. Use `Arr.len($a)` and `Str.len($s)`.

### 8.3 Environment Isolation Blocks (`JSOL.JS`, `JSOL.PHP`, `JSOL.PY`)

Closures that selectively unwrap logic per target break isomorphism by definition. They are supported by the engine but trigger linter warnings. They should be phased out entirely as the Core-1/Core-2 Standard Library expands to cover missing capabilities natively.

### 8.4 Manual Closure Scope (`JSOL.use`)

PHP anonymous functions previously required `JSOL.use($var)` to capture external scope. The PHP compiler target now implements a Closure Analyzer (`1110-php-use-extractor.jsol`) that auto-injects `use (&$var)` for free variables. Manual `JSOL.use()` is deprecated.

### 8.5 Legacy Type Prefixes (`$i`, `$q`)

-   `$i` (Index) and `$q` (Quantity) are accepted by the linter but mapped internally to `$ni32` and `$ni64`. Developers should transition to the core numeric type `$n` or explicit physical types for C targets.
