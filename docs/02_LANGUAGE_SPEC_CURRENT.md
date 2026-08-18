# JSOL Language Specification
2026, [Santiago Bustelo](https://www.bustelo.com.ar/) • MIT License

v.0.2.91 • 2026-08-12

This document is the authoritative definition of the JSOL language. It defines JSOL by what it **is**, not by what it forbids. A construct is valid JSOL if and only if it matches one of the forms defined in Section 2. The forbidden-features list in Section 6 is a derived reference, not the source of truth.

JSOL is 100% valid JavaScript. Not all JavaScript is JSOL.

---

## 1. Design Principles

Four pillars, in priority order when two of them conflict:

- **Clarity**: a JSOL algorithm has to be readable by the person who owns the business logic, not just by a compiler. When a portability rule would force an algorithm into an unreadable shape, the rule loses. JSOL only prescribes what changes the output a program produces (types, operators, control flow determinism) — it never prescribes code shape (nested functions vs. flat scope, for instance), because that's implementation structure, not business logic.
- **Portability**: the same source runs correctly on every proven target. **Deterministic Parity** is what Portability means for JSOL specifically: given identical inputs, every target's transpilation MUST produce bit-for-bit identical output.
- **Performance**: compiled output is no heavier and no slower than it has to be. **Zero Dead Code** follows directly: environment-specific blocks, unused helpers, and closure dependency declarations are stripped or inlined per target, so no output carries payload it doesn't use.
- **Developer Experience**: writing, compiling, and debugging JSOL is as frictionless as the other three pillars allow. Two things follow from this, not from Portability or Performance: the **AST-free compiler pipeline** (a lexer mask plus deterministic string transformations, no external toolchain, easy to embed in an existing build), and **Zero Runtime Dependencies** (JSOL source never touches `window`, `document`, `$_SERVER`, `$_GET`, or any host-environment global — orchestration lives outside the `.jsol` file, and nothing needs installing before you can start).

---

## 2. The Permitted Grammar

A `.jsol` file is a sequence of the following forms. Nothing outside this list is JSOL, regardless of whether it happens to be valid JavaScript.

### 2.1 File header

Every file starts with the pragma comment, on line 1:

```js
// @JSOL
```

### 2.2 Declarations

```js
const $name = <expression>;
let $name = <expression>;
```

All identifiers are prefixed with `$`. This is not cosmetic: it keeps variable references visually and mechanically distinct from bare words in generated PHP, where `$` is syntactically load-bearing. `var` is not part of the grammar.

### 2.3 Functions

```js
const $name = function($param1, $param2) {
    <statements>
};
```

Named function expressions assigned to a `const`, using the `function` keyword. Arrow function *expressions* (single expression, no braces) are permitted as values: `const $double = $x => $x * 2;`. Arrow functions *with a block body and parameters* are not part of the general grammar (see 2.7 for the one reserved exception).

### 2.4 Control flow

```js
if (<condition>) { <statements> }
else if (<condition>) { <statements> }
else { <statements> }

for (let $i = 0; $i < <bound>; $i = $i + 1) { <statements> }

while (<condition>) { <statements> }
```

`for...of`, `for...in`, and functional iteration are not part of the grammar. See Section 4 for why.

### 2.5 Data construction

```js
Map.create("key1", $val1, "key2", $val2)   // structured record, replaces object literals
[$a, $b, $c]                               // array literal, construction only
```

Object literal syntax (`{ key: value }`) and object shorthand are not part of the grammar; `Map.create()` is the only way to construct a keyed record. Array literals are permitted for construction; array *mutation* goes through explicit calls (`.push()`), not literal re-assignment tricks.

### 2.6 Expressions

Arithmetic (`+ - * /`), strict comparison (`=== !==`), logical (`&&`, `||`, `!`) on explicit boolean expressions, and template literals for string interpolation are permitted. Implicit truthiness, implicit coercion, and the loose equality operators (`== !=`) are not part of the grammar: every conditional must be an explicit, unambiguous boolean expression.

### 2.7 Environment isolation blocks (the one reserved exception)

```js
JSOL.JS(() => {
    <JS-only statements>
});

JSOL.PHP(() => {
    <PHP-only statements>
});
```

This is the single place in the grammar where an arrow function with a block body is permitted, and only in this exact zero-parameter form, passed directly as the sole argument to `JSOL.JS` or `JSOL.PHP`. See Section 5 for why this construct exists and why it is a closure and not a comment block.

### 2.8 The Vocabulary Matrix (v0.2.90 Standard)

These are language-level scoping and target-isolation mechanisms. They do not belong to a data domain and remain in the root namespace:

| Primitive | Purpose & Behavior |
|---|---|
| JSOL.use($v1, $v2, ...) | Declares parent scope variables captured by a closure (translates to 'use ($v1, $v2)' in PHP). |
| JSOL.closure([...deps], fn) | Explicit closure scope bridging across targets. |
| JSOL.JS(() => { ... }) | Executable closure unwrapped exclusively in JavaScript target output. |
| JSOL.PHP(() => { ... }) | Executable closure unwrapped exclusively in PHP target output. |

#### Domain Namespaces (Standard Data Operations)

All data manipulation operates through strict CS domain classifications.

The following are the complete, closed set of native-behavior wrappers. There is no escape hatch outside this list: if a wrapper doesn't exist for something, that something is not expressible in JSOL yet, and the answer is to propose a wrapper, not to reach for the native operator.

| Domain | Namespace | Primitive Methods |
|---|---|---|
| String | Str.* | Str.len($s), Str.sub($s, $start, $len), Str.indexOf($s, $needle), Str.replace($s, $search, $replace), Str.char($s, $idx), Str.fromChar($code), Str.upper($s), Str.lower($s), Str.trim($s), Str.split($s, $d) |
| Array | Arr.* | Arr.count($a), Arr.push($a, $item), Arr.pop($a), Arr.shift($a), Arr.slice($a, $start, $end), Arr.indexOf($a, $item), Arr.join($a, $d) |
| Hash Map | Map.* | Map.create('k1', $v1, ...), Map.has($m, $key), Map.keys($m) |
| Math | Math.* | Math.floor($n), Math.abs($n), Math.pow($b, $e), Math.min($a, $b), Math.max($a, $b), Math.round($n) |
| Bitwise | Bit.* | Bit.and($a, $b), Bit.or($a, $b), Bit.xor($a, $b), Bit.not($a), Bit.shiftL($a, $b), Bit.shiftR($a, $b) |
| Cast | Cast.* | Cast.toStr($val), Cast.toInt($val), Cast.toFloat($val) |
| Regex | Regex.* | Regex.match($pat, $str, $flags), Regex.replace($pat, $rep, $str, $flags), Regex.test($pat, $str, $flags) |

#### Type Prefix Matrix — locked for v0.3

First character of variables, in lowercase, declares its type.

**Implemented and enforced now:**

`$i` (index), `$q` (quantity), `$n` (number/float), `$s` (string), `$a` (array), `$m` (Map), `$b` (boolean), `$f` (function, typed-parameter position only), `$x` (regex, see §4), `$y` (byte/binary).

- **`$q` (Quantity):** Strict integer, e.g., `1234`. **Rationale:** Countable items are discrete; decimals are meaningless and can break downstream calculations. The compiler forces a number format with no decimals and applies `Math.trunc` on read to prevent a user from breaking the calculation by injecting decimals.
    - **Input:** `const $qUnits = 3;`
    - **Output:** Cell `=3` *(Format: Number, 0 decimal places)*

- **`$i` (Index):** Unsigned integer (greater than or equal to zero). **Rationale:** Used exclusively for iterating or measuring lengths (e.g., string lengths, loop counters). Negative values are nonsensical in this context.
    - **Input:** `const $iCounter = 0;`
    - **Output:** Cell `=0` *(Format: Number, 0 decimal places)*

- **`$s` (String / Text):** Plain text strings, e.g., `"Hello World"`. **Rationale:** Immutable text data for labels, messages, or keys.
    - **Input:** `const $sProduct = "Licencia PRO";`
    - **Output:** Cell `Licencia PRO` *(Format: Text)*

- **`$b` (Boolean):** True or False: `true`, `false`. **Rationale:** Binary logic gates. In Excel, maps to the English constants `TRUE` and `FALSE`. The compiler MUST NOT output localized versions.
    - **Input:** `const $bIsValid = true;`
    - **Output:** Cell `=TRUE` *(Format: Boolean)*

- **`$d` (Date):** Internally operates in milliseconds since 1970 UTC. **Rationale:** Provides a universal, timezone-aware integer for calculations before formatting. The compiler maps it to Excel's date serial number.
    - **Input:** `const $dToday = Date.now();`
    - **Output:** Cell `=45000` *(Format: Date, displays as configured)*

- **`$a` (Array / List):** A linear list. **Rationale:** Ordered collections for iteration or lookup. In Excel, compiles to a static column (e.g., `A1:A10`).
    - **Input:** `const $aItems = Arr.create("A", "B", "C");`
    - **Output:** Range `A1:A3` containing the three values.

- **`$m` (Map / Dictionary):** A two-dimensional table. **Rationale:** Key-value or relational data for searches. In Excel, compiles to a two-dimensional matrix range.
    - **Input:** `const $mTaxTable = Map.create(...);`
    - **Output:** A populated range like `A1:B2`.

- **`$f` (Function):** Used to declare logical routines. **Rationale:** Encapsulates reusable calculation blocks.
    - **Input:** `const $fDiscount = (...) => { ... };`
    - **Output:** No direct cell output; defines a compilable block.


**Reserved, not implemented — linter rejects any use:**

`$c` (Currency), `$p` (Percentage), `$g` (Geometry/Angle), `$t` (Time/Duration), `$d` (Date).

---

## 3. The Signature Asymmetry Problem

This section explains why functional array methods are excluded from the grammar rather than merely discouraged. It's not a style preference, it's that a regex-based compiler cannot transpile them correctly, ever.

JavaScript's array methods are object methods: the array owns the call, the callback is an argument.

```js
$arr.map(function($item) { return $item * 2; })
```

PHP's array functions are free functions, and their argument order is not even consistent with each other:

```php
array_map(function($item) { return $item * 2; }, $arr)     // callback first, array second
array_filter($arr, function($item) { return $item > 0; })  // array first, callback second
array_reduce($arr, function($acc, $item) { ... }, 0)        // array first, callback second, initial value last
```

To transpile `$arr.map(function($x){ ... }).filter(function($x){ ... })` correctly, a compiler needs to:

1. Locate the matching closing brace of the callback body, which for a regex engine means counting nested `{ }` by hand, character by character, because regex has no concept of nesting depth.
2. Reorder the array reference and the callback around each other, differently per method.
3. Resolve chaining into nested calls: `array_map(..., array_filter(..., $arr))`.

Any `if` inside the callback introduces its own `{ }` pair. A regex-based brace matcher that isn't doing genuine counting will terminate at the wrong `}`, truncate the callback body, and emit syntactically broken PHP. This is not a hypothetical: it's the exact class of bug that has come up repeatedly in JSOL's own self-hosting process, in code written specifically to do brace-matching carefully.

**Consequence**: JSOL requires imperative `for` / `while` loops, which compile to identical syntax in JS, PHP, and C-family languages generally, with no reordering, no chaining resolution, and no brace-counting risk.

```js
// Forbidden — not part of the grammar
const $doubled = $items.map(function($x) { return $x * 2; });

// JSOL
const $doubled = [];
const $count = Arr.count($items);
for (let $i = 0; $i < $count; $i = $i + 1) {
    $doubled.push($items[$i] * 2);
}
```

### Imperative loops are also faster, not just safer to transpile

Independent of the transpilation argument, imperative loops outperform functional methods on both V8 and PHP. A `for` loop is a direct jump instruction; `.map()`/`.filter()`/`.reduce()` instantiate, invoke, and tear down a callback function once per element, pushing stack frames on every iteration. On a 10,000-element array, that's 10,000 function invocations versus one loop. The industry favors `.map()` for readability, not speed — at the hardware level, the imperative form wins. JSOL's transpilation constraint and JSOL's performance profile point in the same direction, which is not a coincidence: restrictions chosen for isomorphism tend to be restrictions that also compile down to primitive CPU operations.

---

## 4. Performance Consequences of the Restricted Grammar

The restrictions in Section 2 aren't purely about transpilation safety. They have measurable engine-level effects, in both directions.

### Gains

- **No prototype chain traversal.** Forbidding `class`, `this`, `new`, and inheritance means every value is a flat dict or a primitive. V8 builds hidden classes for flat objects almost instantly, and PHP associative arrays are cheaper than instantiated objects with visibility rules.
- **Zero DOM coupling by construction.** JSOL code cannot reference `window` or `document`, so it structurally cannot trigger a reflow or repaint. Every millisecond of execution stays on the CPU.
- **No catastrophic backtracking.** V8 and PCRE are different regex engines; a pattern that resolves in milliseconds in one can hang the other (ReDoS). By excluding native regex from business logic and requiring procedural string parsing instead, execution time stays linear and deterministic in both targets.
- **No optional-chaining overhead.** `if ($obj !== null && $obj.prop)` is more to type than `$obj?.prop`, but explicit checks are cheaper for a JIT to optimize than the desugaring machinery optional chaining requires under the hood.

### Costs

- **Single-thread blocking.** No `async`, `await`, `Promise`, or Worker API inside JSOL means JSOL is strictly synchronous. A 10-million-iteration computation written in JSOL will freeze the tab until it finishes. There is no way to delegate JSOL work to a background thread *from inside JSOL itself* without breaking PHP parity. See Section 5.1 for the correct pattern.
- **More GC pressure on sustained workloads.** Without classes or `this.state`, all state passes explicitly between function calls. Processing large arrays means copying or passing references repeatedly rather than mutating a long-lived object, which can mean more frequent garbage collection pauses in long-running applications.

---

## 5. Rules Reference

### Rule 1: Never index strings directly

V8 strings are UTF-16 code units; PHP strings are byte sequences. `$str[$i]` or direct character iteration will drift out of sync the moment a multi-byte character (accents, emoji) appears. Use `Str.len()` and procedural transforms, or an isolated `JSOL.JS`/`JSOL.PHP` pair.

### Rule 2: Integer bounds and division

Keep integers strictly below `Number.MAX_SAFE_INTEGER` (2^53 - 1). Always use `Math.floor()` for integer division.

### Rule 3: No numeric-string dictionary keys

PHP auto-casts numeric string keys to integers (`['10' => $v]` becomes `[10 => $v]`), which breaks strict-equality comparisons against a JS object with the same nominal keys. Never use pure numeric strings as `Map.create()` keys.

### Rule 4: No implicit truthiness

`"0"` and `[]` are truthy in JS, falsy in PHP. `if ($x)` is never valid JSOL. Require explicit checks: `Str.len($str) > 0`, `Arr.count($arr) > 0`, `$x === null`.

### Rule 5: No array/object mutation across function boundaries

JS arrays and objects pass by reference; PHP arrays are copy-on-write value types. Logic that depends on a callee mutating a caller's array will behave correctly in JS and silently fail in PHP. Return new values instead of relying on mutation.

### Rule 6: Environment isolation blocks (`JSOL.JS` / `JSOL.PHP`)

**Isolation blocks should be used only as a provisional last resort**

JSOL's compiler was riddled with isolation blocks, which solved functionality temporarily, but thwarted portability and further development.

JSOL 2.90 sports its own Regex Engine (Thompson VM), regex.jsol.
Targeting native Regex engines remain as an example below.

…

Regex execution differs fundamentally between V8 (`.exec()`) and PCRE (`preg_match()`), and some operations have no shared syntax at all across the two targets. When a specific operation cannot be written once and compiled to both, isolate it:

```js
let $match = null;

JSOL.JS(() => {
    $match = /^#?([a-f\d]{2})$/i.exec($hex);
});

JSOL.PHP(() => {
    preg_match('/^#?([a-f\d]{2})$/i', $hex, $match);
    if (empty($match)) $match = null;
});
```

The compiler removes the block that doesn't match its current target entirely and unwraps the one that does. This is why the construct is a real, executable closure and not a comment: a comment can be stripped, reworded, or "cleaned up" by any downstream tool without changing whether the code still runs, including by an AI doing an unrelated refactor. A closure is code. Removing it removes behavior, so nothing touches it by accident.

### Rule 7: Closure dependency declaration (`JSOL.closure`, `JSOL.use`)

PHP anonymous functions do not auto-capture the enclosing scope; they require explicit `use (...)`. JSOL bridges this with `JSOL.closure([...deps], function(...) {...})`, or `JSOL.use($var1, $var2)` as the first statement inside a function body written the JS way.

```js
const $tax = 0.21;
const $discount = 10;

const $calculateTotal = JSOL.closure([$tax, $discount], function($price) {
    const $subtotal = $price - $discount;
    return $subtotal + ($subtotal * $tax);
});
```

Compiles to PHP with an explicit `use ($tax, $discount)`, and to JS with the dependency array stripped entirely (JS closures capture scope natively, so the array would be dead weight in the browser payload).

### Rule 8: Bitwise operations

Native `&`, `|`, `^`, `~`, `<<`, `>>` are excluded: V8 coerces to 32-bit signed integers for bitwise ops, PHP's integer width is platform-dependent (typically 64-bit). Use the `JSOL.bw*` wrapper table (Section 2.8).

### Rule 9: String concatenation

Bare `+` concatenation between strings is excluded. Use template literals, or the `+ "" +` pattern for legacy-style concatenation that still needs to be explicit about producing a string.

---

## 6. Forbidden Features (Quick Reference)

This table is a derived summary of Section 2. If something here contradicts Section 2, Section 2 wins; file it as a spec bug.

| Feature | Status | Use instead |
|---|---|---|
| Method chaining on scalars/wrappers | ⛔️ | Assign to an intermediate variable |
| Functional array methods (`.map`, `.filter`, `.reduce`, `.forEach`, `.find`) | ⛔️ | Imperative `for` / `while` |
| Implicit truthiness (`if ($str)`) | ⛔️ | Explicit comparisons |
| Arrow functions with parameters and a block body | ⛔️ | `function($x) { ... }` |
| Spread operator | ⛔️ | Explicit loop construction |
| Environment access (`window`, `document`, `$_POST`, `$_GET`) | ⛔️ | Host orchestration layer, outside `.jsol` |
| Native casting (`parseInt`, `parseFloat`, `.toString()`) | ⛔️ | `JSOL.hexToInt`, `+ "" +` |
| Native bitwise operators | ⛔️ | `Bit.and`, `Bit.or`, `Bit.xor` |
| Native array methods (.length, .push) | ⛔️ | `Arr.count`, `Arr.push` |
| Native string methods (.length, .substring) | ⛔️ | `Str.len`, `Str.sub` |
| `async` / `await` / `Promise` / `Worker` inside JSOL | ⛔️ | Orchestrate from outside; see Section 5.1 |

**Enforcement note**: this specification is the source of truth regardless of what the linter currently checks. The linter implements a growing subset of these rules as a convenience and a safety net, not as the definition of the language. A rule being unenforced by the linter today does not make code that violates it valid JSOL.

---

*JSOL v0.2.93 — 2026-08-14, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](LICENSE)*