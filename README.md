# JSOL (JavaScript Source Of Logic) - v.0.2
2026, Santiago Bustelo
MIT License

<img src="../assets/mascot/jsol-mascot-full.png" width="280" alt="JSOL mascot">

JSOL is an ultra-strict, isomorphic JavaScript subset designed to write pure business logic once and compile it seamlessly to both JavaScript (Frontend) and PHP (Backend).

It guarantees bit-for-bit output deterministic parity between V8 (Node/Browser) and Zend Engine (PHP 8.x) by eliminating syntax ambiguities, runtime environment dependencies, and asymmetric language features.

**Use Cases:**

1.  **Computational Mathematics:** Engines like IPAX (color, 2D physics, geometries).
2.  **Validation:** Strict form rules, length limits, and sanitization evaluated in real time on the client and re-verified on the server.
3.  **E-commerce Engines:** Tax calculations, discounts, and cart rules (what the client sees is exactly what the server bills).
4.  **State Machines:** Logic prediction in games or cooperative interfaces, running on clients to avoid initial lag, and then on the server to validate and synchronize.

## 1\. Why JSOL? (Origin & Architectural Comparison)

### The Origin: The IPAX Architectural Requirement

JSOL was born out of a critical necessity within the **[IPAX](https://ipax.bustelo.com.ar/) architecture**): the requirement to execute **identical, unforgeable business logic** across both the backend (PHP 8.x server nodes) and the frontend (JavaScript browser clients, PWAs, and mobile web views).

In modern distributed architectures like IPAX, domain rules —such as financial calculation engines, complex validation schemas, rate-limiting formulas, and state transition graphs— must exist in two places simultaneously:

1.  **Frontend (JS)**: To provide instant, zero-latency user feedback, interactive UI updates, and offline-first execution without round-tripping to the server.
2.  **Backend (PHP)**: To enforce security, data integrity, and unforgeable validation before persisting state to database storage.

Traditionally, teams either duplicated this logic by writing it twice (once in JS and once in PHP), leading to **drift, silent bugs, and maintenance nightmares**, or attempted to use heavy transpilers, virtual machines, or JSON-based logic interpreters. JSOL was engineered to solve this problem permanently with **zero runtime overhead**.

### Technical Comparison Matrix

| Feature / Metric | **JSOL** | **Haxe** | **WebAssembly (WASM)** | **TS-to-PHP Transpilers** | **JSON Math / Evaluators** |
| --- | --- | --- | --- | --- | --- |
| **Primary Syntax** | Strict JS (ES6) | Haxe (`.hx`) DSL | Rust / C / C++ / Go | TypeScript | JSON Trees / ASTs |
| **PHP Output Quality** | Native PHP 8.x (Hand-written) | Obfuscated with class shims | Binary `.wasm` blob | PHP with polyfill adapters | Interpreted AST execution |
| **Runtime Footprint** | **0 KB** (Zero dependencies) | 50 KB – 200 KB Runtime | Wasmtime extension required | 20 KB – 100 KB Shims | 10 KB – 50 KB Parser |
| **Compilation Speed** | **< 2ms** (AST-Free PHP Lexer) | Heavy external toolchain | Slow native compilation | Node.js build step required | Runtime interpretation |
| **Inspectability & Debugging** | 100% Native (Xdebug / DevTools) | Obfuscated / Source Maps | Black-box binary stream | Complex stack traces | Uninspectable JSON |
| **PHP Extensions** | **None** (Pure PHP) | None | Requires `ext-wasmtime` | None | None |
| **Memory Marshaling** | **Zero** (Native PHP types) | Moderate (Object wrappers) | **High** (Buffer serialization) | Moderate | High (Tree parsing) |

### Deep-Dive Comparison Against Alternatives

#### 1\. JSOL vs. Haxe

Haxe is a multi-target language, but introduces unacceptable trade-offs for high-performance web architectures:

-   **Language Friction**: Developers must learn a distinct syntax (`.hx`) rather than standard JavaScript.
-   **Runtime Bloat**: Haxe injects tens of kilobytes of runtime polyfills to simulate its object model in PHP.
-   **Unmaintainable Output**: Generates heavily abstract PHP code that cannot be comfortably inspected or debugged with Xdebug.
-   **External Toolchain**: Requires an OCaml/C++ binary compiler installed on host machines.

**Why JSOL Wins**: JSOL requires no new language learning, generates idiomatic PHP 8.x and ES6 code with **zero runtime libraries**, and compiles instantly inside PHP itself.

#### 2\. JSOL vs. WebAssembly (WASM)

Running Rust/C compiled to WebAssembly fails in web production environments:

-   **PHP Infrastructure Rigidity**: Running WASM in PHP requires custom C-extensions (`wasmtime`), which are forbidden in most managed, serverless, or cloud PHP environments (AWS Lambda, Bref, shared hosting).
-   **Data Serialization Bottlenecks**: Passing structured data (nested arrays, strings) into WASM memory buffers requires heavy serialization (`json_encode` / pointer manipulation), which often takes longer than executing the logic itself.

**Why JSOL Wins**: JSOL compiles directly to native PHP data structures (`array`, `string`, `int`), executing at native OpCache speed with zero memory serialization overhead.

#### 3\. JSOL vs. TypeScript-to-PHP Transpilers

Transpilers trying to map full TypeScript to PHP run into semantic divergences (e.g., structural subtyping, `async/await`, prototype manipulation), requiring complex polyfills that slow down execution.

**Why JSOL Wins**: Instead of transpiling a complex language and hiding divergences under polyfills, **JSOL achieves parity by strict restriction**. It eliminates non-isomorphic features at compile time, guaranteeing 100% deterministic, identical execution on V8 and Zend Engine.

#### 4\. JSOL vs. JSON Math / JSON Logic Evaluators

Some architectures represent logic as JSON AST trees (e.g., `{"and": [{"==": [1, 1]}]}`).

-   **Developer Ergonomics**: Writing business logic in JSON is painful, unreadable, and lacks IDE autocompletion or static linting.
-   **Performance Penalty**: Evaluating JSON logic requires recursive AST interpretation at runtime for every single request, multiplying CPU cycles.

**Why JSOL Wins**: JSOL allows developers to write standard, readable JS syntax with full VS Code Intellisense (`jsol-env.d.ts`), compiled down to compiled PHP code with zero runtime parsing.

### Isomorphic Use Cases Where JSOL Excels

1.  **Dual-Side Form & Domain Validation Engine (IPAX Core)**: Validating complex business forms (e.g., tax rules, discount eligibility). The browser runs `.js` for instant UI feedback; the server runs `.php` to re-evaluate the exact same logic upon submission, preventing API tampering.
2.  **Isomorphic Mathematical & Financial Engines**: Calculating pricing matrices, currency conversions, or interest schedules without rounding divergences using deterministic math wrappers (`JSOL.dict`, `Math.*`).
3.  **State Machine & Policy Evaluation**: Evaluating user permissions or workflow transitions instantly on the frontend while executing the identical policy script in PHP to authorize database writes.
4.  **Offline-First PWAs & Local Sync Reconciliation**: Local-first applications executing business operations offline and reconciling state with the server upon reconnection without logic drift.

## 2\. Core Principles

-   **Zero Runtime Dependencies**: JSOL source code never interacts directly with `window`, `document`, `$_SERVER`, or `$_GET`. Orchestration is strictly decoupled.
-   **Deterministic Parity**: Given identical inputs, the transpiled JS and PHP outputs MUST produce identical outputs.
-   **AST-Free Lexer Pipeline**: Fast, lightweight compilation pipeline using a Lexer mask and deterministic string transformations in PHP.
-   **No Dead Code Payload**: Environmental blocks and closure dependencies are stripped or inline-converted for zero bloat in target environments.

## 3\. Project Architecture

The JSOL ecosystem is split into a 4-tier modular pipeline:

```
jsol-root/
├── index.php                 # CLI Runner / Orchestrator entry point
├── jsol-env.d.ts             # TypeScript definitions for VS Code Intellisense
├── example/
│   ├── sample.jsol           # Source file
│   ├── sample.js             # Transpiled Frontend JS
│   └── sample.php            # Transpiled Backend PHP
└── jsol-compiler/
    ├── lexer.php             # Masking / Unmasking of strings and comments
    ├── linter.php            # Static rule validator (+ native JSLint bridge)
    ├── js-compiler.php       # JS Target transpiler & payload optimizer
    ├── php-compiler.php      # PHP Target transpiler & syntax transformer
    └── engine.php            # Compiler pipeline orchestrator
```

## 4\. Performance Rationale & Array Iteration

### Why Functional Array Methods Are Forbidden

JSOL strictly prohibits functional array methods (`.map()`, `.filter()`, `.reduce()`, `.forEach()`, `.find()`). While popular in modern JavaScript, these methods introduce severe performance and memory penalties across both V8 and PHP:

1.  **Call Stack & Closure Overhead**: Functional methods instantiate and invoke N anonymous callback functions in memory. This pollutes the call stack and triggers frequent Garbage Collection (GC) pauses.
2.  **PHP Engine Asymmetry**: In PHP, array functions like `array_map()` or `array_filter()` pass variables through closure boundaries, incurring significantly higher CPU overhead than native loops.

### The Imperative Solution: Mandatory `for` / `while` Loops

JSOL enforces traditional, imperative `for` and `while` loops. Imperative loops compile directly into low-level CPU opcodes in PHP OpCache and V8 JIT, delivering maximum execution performance and zero memory allocation overhead.

**🚫 Incorrect (Functional Method - FORBIDDEN ⛔️):**

JavaScript

```
const $doubled = $items.map(function($x) {
    return $x * 2;
});
```

**✅ Correct (JSOL Imperative Loop):**

JavaScript

```
const $doubled = [];
const $count = JSOL.count($items);
for (let $i = 0; $i < $count; $i++) {
    $doubled.push($items[$i] * 2);
}
```

## 5\. System Capabilities & Architecture Decoupling (Workers, Async, Multithreading)

### Pure Synchronous Core Principle

JSOL is designed exclusively for **Pure, Deterministic Business Logic** (validations, mathematical calculations, color metrics, data transformations). JSOL source code is strictly **synchronous and side-effect free**.

JSOL prohibits internal use of `Worker`, `async/await`, `Promise`, or asynchronous I/O primitives.

### Handling Web Workers & Multithreading

When business logic needs to execute off the main browser thread or across parallel PHP worker processes, JSOL remains completely decoupled:

1.  **Frontend (Web Workers)**: The compiled `.js` file is imported inside a Web Worker thread (`importScripts('sample.js')`). The worker host script listens for `onmessage` events and invokes the synchronous JSOL functions.
2.  **Backend (Swoole / RoadRunner / Fibers)**: The compiled `.php` file is included in worker process pools. Since JSOL logic is stateless and side-effect free, it executes safely across concurrent threads or coroutines without race conditions.

## 6\. Math Engine, Conversions & Type Safety

### 1\. Math Object Mapping (`Math.*` & `isNaN`)

JSOL maps JavaScript's native `Math` object directly to PHP native mathematical functions and constants:

-   `Math.PI` ➔ `M_PI`
-   `Math.floor($x)` ➔ `floor($x)`
-   `Math.ceil($x)` ➔ `ceil($x)`
-   `Math.abs($x)` ➔ `abs($x)`
-   `Math.max($a, $b)` ➔ `max($a, $b)`
-   `Math.min($a, $b)` ➔ `min($a, $b)`
-   `Math.round($x)` ➔ `round($x)`
-   `Math.pow($b, $e)` ➔ `pow($b, $e)`
-   `Math.sqrt($x)` ➔ `sqrt($x)`
-   `isNaN($x)` ➔ `is_nan($x)`

### 2\. Base Conversion Utility (`JSOL.hexToInt`)

To process hexadecimal strings (such as color codes or bitmasks) consistently across JS and PHP without relying on native casting functions (`parseInt`), JSOL provides `JSOL.hexToInt`:

JavaScript

```
const $intValue = JSOL.hexToInt("FF");
```

-   **PHP Output**: `$intValue = hexdec("FF");`
-   **JS Output**: `const $intValue = parseInt("FF", 16);`

### 3\. Truthiness & Explicit Type Coercion Rules

JavaScript and PHP evaluate boolean "truthiness" differently:

-   In JS, `"0"` is **truthy**. In PHP, `"0"` is **falsy**.
-   In JS, `[]` (empty array) is **truthy**. In PHP, `[]` is **falsy**.

To prevent dangerous runtime divergence, **implicit truthiness checks are strictly forbidden by the Linter**.

**🚫 Incorrect (Implicit Truthiness Check - FORBIDDEN ⛔️):**

JavaScript

```
if ($str) { ... } // DANGEROUS: "0" evaluates differently in JS and PHP!
if ($arr) { ... } // DANGEROUS: [] evaluates differently in JS and PHP!
```

**✅ Correct (Explicit Comparison):**

JavaScript

```
if (JSOL.len($str) > 0) { ... }
if (JSOL.count($arr) > 0) { ... }
if ($val === null) { ... }
```

## 7\. Strict Rules & Syntax Guide

### Rule 1: The Pragma Requirement (`// @JSOL`)

Every `.jsol` file MUST start with the `// @JSOL` pragma on line 1.

**Lexer Flexibility Physics:**

-   **Case-Insensitive**: Accepts `// @jsol`, `// @JSOL`, `// @Jsol`.
-   **Optional `@`**: Accepts `// JSOL` or `// @JSOL` (`@` is recommended for VS Code Intellisense).
-   **Whitespace Tolerant**: Accepts variable spaces before/after `//` (e.g., `// @JSOL`).
-   **Metadata Allowed**: Allows version or description comments on line 1 after the pragma (e.g., `// @JSOL v0.2.0 - Math Metrics Engine`).

**✅ Correct:**

JavaScript

```
// @JSOL v0.2.0 - Core Calculations
const $calculate = function($val) {
    return $val * 2;
};
```

**🚫 Incorrect:**

JavaScript

```
// Missing pragma on line 1 will trigger a Fatal Compiler Error
const $calculate = function($val) {
    return $val * 2;
};
```

### Rule 2: Sigil Variable Mandatory (`$`)

All variables MUST start with a dollar sign `$` to preserve direct readability and 1:1 mapping between JS and PHP.

**✅ Correct:**

JavaScript

```
let $totalScore = 100;
const $factor = 1.5;
```

**🚫 Incorrect:**

JavaScript

```
let totalScore = 100;
const factor = 1.5;
```

### Rule 3: Polymorphic Property Protection & No Method Chaining (`JSOL.count` & `JSOL.len`)

Accessing `.length` is strictly prohibited because JavaScript uses `.length` for both Strings and Arrays, whereas PHP uses `strlen()` vs `count()`.

**Method Chaining Prohibition**: In PHP, scalar primitive outputs (integers, strings) are not objects. Attempting to chain methods off utility returns (e.g., `JSOL.len($str).toString().trim()`) will trigger a PHP Fatal Error. Method chaining on scalar outputs is strictly forbidden; transformations must be procedural.

**✅ Correct:**

JavaScript

```
const $arrayLength = JSOL.count($myArray);
const $stringLength = JSOL.len($myString);

// Procedural transformation instead of chaining
const $lengthAsString = $stringLength + "";
```

**🚫 Incorrect:**

JavaScript

```
const $arrayLength = $myArray.length;
const $stringLength = $myString.length;

// FORBIDDEN: Method chaining on primitive scalar output
const $badChain = JSOL.len($myString).toString();
```

### Rule 4: Explicit Dictionary Constructor (`JSOL.dict`)

Object literals `{}` cannot be automatically transformed to PHP associative arrays `[]` via RegEx without breaking block statements (`if () {}`). You MUST use `JSOL.dict()`.

-   **PHP Target**: Transpiles to associative array `['key' => $val]`.
-   **JS Target**: Transpiles to native object `{ key: $val }`.

**✅ Correct:**

JavaScript

```
return JSOL.dict(
    "status", "success",
    "code", 200,
    "data", JSOL.dict("score", $score)
);
```

**🚫 Incorrect:**

JavaScript

```
return {
    status: "success",
    code: 200
};
```

### Rule 5: Multi-Variable Closure Scope Declaration (`JSOL.closure`)

PHP functions do not automatically inherit parent scope variables. They require explicit `use ($var1, $var2)`. JSOL uses `JSOL.closure()` with an array of dependencies to bridge this gap. You can pass single or multiple variables inside the dependency array.

**Payload Optimization**: The JS Compiler automatically purges the dependency array during JS target compilation, delivering **0 bytes of dead code** to the frontend client.

**✅ Correct (Multiple Variables):**

JavaScript

```
const $tax = 0.21;
const $discount = 10;
const $currency = "USD";

const $calculateTotal = JSOL.closure([$tax, $discount, $currency], function($price) {
    const $subtotal = $price - $discount;
    return $subtotal + ($subtotal * $tax);
});
```

**Transpiled Output (PHP):**

PHP

```
$tax = 0.21;
$discount = 10;
$currency = "USD";

$calculateTotal = function($price) use ($tax, $discount, $currency) {
    $subtotal = $price - $discount;
    return $subtotal + ($subtotal * $tax);
};
```

**Transpiled Output (JS - Dead Code Purged):**

JavaScript

```
const $tax = 0.21;
const $discount = 10;
const $currency = "USD";

const $calculateTotal = function($price) {
    const $subtotal = $price - $discount;
    return $subtotal + ($subtotal * $tax);
};
```

**🚫 Incorrect:**

JavaScript

```
const $tax = 0.21;
const $calculateTotal = function($price) {
    return $price * $tax; // FAILS IN PHP: Notice: Undefined variable $tax
};
```

### Rule 6: Environment Isolation Blocks & RegEx Asymmetries (`JSOL.JS` & `JSOL.PHP`)

Regular expression execution differs fundamentally between JavaScript (V8 `.exec()`) and PHP (PCRE `preg_match()`). When native engine specifics cannot be harmonized automatically, isolated environment closures are used. The compiler strips cross-environment blocks entirely during compilation.

**✅ Correct:**

JavaScript

```
let $match = null;

JSOL.JS(() => {
    $match = /^#?([a-f\d]{2})$/i.exec($hex);
});

JSOL.PHP(() => {
    preg_match('/^#?([a-f\d]{2})$/i', $hex, $match);
    if (empty($match)) $match = null;
});
```

### Rule 7: Complete Bitwise Operations Wrappers Table (`JSOL.bw*`)

Native bitwise operators (`&`, `|`, `^`, `~`, `<<`, `>>`) are forbidden due to 32-bit signed integer coercion in V8 versus 64-bit architecture dependency in PHP. You MUST use the full suite of `JSOL.bw*` wrappers:

| Operation | Native JS/PHP (Forbidden ⛔️) | JSOL Wrapper (Mandatory ✅) |
| --- | --- | --- |
| **AND** | `$a & $b` | `JSOL.bwAnd($a, $b)` |
| **OR** | `$a \\| $b` | `JSOL.bwOr($a, $b)` |
| **XOR** | `$a ^ $b` | `JSOL.bwXor($a, $b)` |
| **NOT** | `~$a` | `JSOL.bwNot($a)` |
| **Shift Left** | `$a << $b` | `JSOL.bwShiftL($a, $b)` |
| **Shift Right** | `$a >> $b` | `JSOL.bwShiftR($a, $b)` |

**✅ Correct:**

JavaScript

```
const $masked = JSOL.bwAnd($byte, 0xFF);
const $shifted = JSOL.bwShiftL($masked, 2);
const $inverted = JSOL.bwNot($flags);
```

**🚫 Incorrect:**

JavaScript

```
const $masked = $byte & 0xFF; // FAILS LINTER
const $shifted = $masked << 2; // FAILS LINTER
```

### Rule 8: Mandatory String Concatenation Pattern

The `+` operator for raw string concatenation is forbidden. Use Template Literals or the `+ ""` + operator pattern.

**✅ Correct:**

JavaScript

```
const $message = `User ID: ${$userId}`;
const $legacyConcat = "Score: " + "" + $score;
```

**🚫 Incorrect:**

JavaScript

```
const $message = "User ID: " + $userId; // FAILS LINTER
```

## 8\. Summary of Forbidden Features ⛔️

-   ⛔️ **No Method Chaining on Scalars**: You cannot chain methods off primitive values or JSOL utilities (e.g., `JSOL.len($str).toString()`).
-   ⛔️ **No Functional Array Methods**: `.map()`, `.filter()`, `.reduce()`, `.forEach()`, `.find()` are prohibited. Use imperative `for` or `while` loops.
-   ⛔️ **No Implicit Truthiness Checks**: `if ($str)` or `if ($arr)` is prohibited. Use explicit length checks (`JSOL.len($str) > 0`).
-   ⛔️ **No Arrow Functions with Body**: `($x) => { ... }` is prohibited. Use `function($x) { ... }`.
-   ⛔️ **No Object Literals / Shorthand**: `{ $a }` or `{ key: val }` is prohibited. Use `JSOL.dict("key", $val)`.
-   ⛔️ **No Spread Operator**: `...` is prohibited.
-   ⛔️ **No Environment Access**: `window`, `document`, `$_POST`, `$_GET` are prohibited.
-   ⛔️ **No Native Casting Functions**: `parseInt()`, `parseFloat()`, `.toString()` are prohibited. Use `JSOL.hexToInt` or `+ "" +`.
-   ⛔️ **No Native Bitwise Operators**: `&`, `|`, `^`, `~`, `<<`, `>>` are prohibited. Use `JSOL.bw*`.

## 9\. CLI Execution & Orchestration: Example

To compile all `.jsol` files inside the `example/` directory, run:

Bash

```
php index.php
```

The orchestrator will scan modified timestamp buffers (`filemtime`) and compile `.js` and `.php` targets atomically only when changes are detected.