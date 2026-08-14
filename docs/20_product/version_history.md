# JSOL Version History

## v0.2.93 (2026-08-14)
Structural enforcement of the Type Prefix Matrix, control flow strictness, and Web/CLI decoupling.

* Type Prefix Matrix Implemented in JSOL compiler's source files: Completely refactored the self-hosted compiler source code to enforce the single-character static typing prefixes ('$s' for string, '$i' for index, '$a' for array, '$m' for map, etc.).
* Environment Decoupling (Browser/CLI): Decoupled 'index.js' and 'index.php' from their strict CLI environments. Added 'ui.php' for a barebones Web SAPI interface in PHP, and fallback 'window.JSOL_Compiler' binding in JS for offline browser execution.
* Control Flow Strictness: The linter now strictly forbids the 'with' statement.
* Pragma Expansion: The linter now recognizes specific profiles like '// @JSOL-X' and '// @JSOL-C'.
* JSOL-C Memory Stubs: 'js-compiler.jsol' and 'php-compiler.jsol' now parse 'JSOL.set' and 'JSOL.unset', treating them as '/* mem-op */' no-ops for Managed profile compatibility.
* Interpreter Portability: 'boot.php' now supports a self-contained topology, checking for a bundled 'jsol-compiler-php/' inside its own directory before scanning upwards.
* Regex Documentation Update: Formally documented that the internal Thompson VM functions use '$mRegexMatch' and '$sRegexReplace' to bypass the AST-free compiler and avoid recursive scope collisions.
* Domain Specification Completeness: Formalized transpilation rules for Arr.pop, Arr.shift, Arr.indexOf, and Map.keys within js-compiler.jsol and php-compiler.jsol to fulfill the v0.3 Vocabulary Matrix.
* Isomorphic Physics for Array Search: Implemented JSOL::arrIndexOf in the PHP bridge to guarantee -1 returns instead of false, matching V8 behavior natively.
* Runtime Polyfill Upgrades: Expanded the native fallback bindings (window.Arr, window.Map, jsolGlobal) in repl.js and index.js to prevent TypeError crashes during uncompiled REPL execution.
* Core Primitives Health Check: Added core-primitives-test.jsol.js and core-primitives-test.switch.jsol.js to examples/01-basics/ to provide a row-by-row runtime validation suite for all 35 domain methods.

## v0.2.92 (2026-08-13)
* Fixed a critical bug uncovered by the interpreter: JS and PHP compilers were not transpiling the full spec.
* Included selfhost-verify.sh
* Growing /examples library.

## v0.2.91 (2026-08-12)
Architectural stabilization of the self-hosted compiler and resolution of the regular expression engine technical debt.

* Regex Domain Consolidation: Formalized Regex.match and Regex.replace as standard language APIs. This officially retires the need for isolated escape blocks (JSOL.JS and JSOL.PHP) for regex operations.
* Resolution - Static Translation (AST-Free): Injected direct transpilation rules into js-compiler.jsol and php-compiler.jsol to convert Regex domain invocations to internal flat constants ($regexMatch and $regexReplace), bypassing the PHP Fatal error when attempting to convert Closures to Strings.
* Resolution - Isomorphic Fixed Point (Code Point Parity): Resolved the Bootstrap Paradox using an Intermediate Node Generation. Mathematically validated the compiler, ensuring that Generation 3 of Node and PHP produce byte-by-byte identical logical outputs.
* docs/ ordered by folders: `10 dev`, `20 product`, `21 future`, `30 tools`.
* examples/ ordered by folders: `01-basics`, `02-finance`, `03-business-logic`, `04-validation`, `05-sorting-searching`, `06-string-algorithms`, `07-math-numeric`, `08-calendar-date`, `11-clrs`.
* Interactive Visual REPL Interpreter (`interpreter/`) introduced.

## v0.2.90 (2026-08-11)
Launch of the modular self-hosted compiler base architecture and first self-hosting without closure escapes.

* Thompson NFA VM: Redesigned the regex engine from scratch into a flat Thompson/Pike Virtual Machine. Eliminated nested closures for backtracking, achieving 20/20 test passes with ZERO closures, opening the door for direct C transpilation.
* The Linter Paradox Resolved: Solved the compiler bootstrap block where the linter forbade .length access but the compiler needed the literal string .length for replacement rules. Implemented a two-pass pipeline (Structural Pragma pass, then Token Pattern pass after masking).
* Nesting Diagnostics via Balance Counter: Implemented a parenthesis balance counter for nested structures instead of relying on a heavy AST parser, maintaining the 100 percent AST-free, lightweight, zero-dependency promise.
* Continuous Verification (5 Bugs): The strict fixed-point discipline caught and prevented a chain of 5 real-time bugs (e.g., double escaping backslashes, loop bound drifts, missing let prefixes, mb_strlen parameter regressions).
* Perkele Protocol & Multi-AI Governance: Discovered and documented the Silent Defeat phenomenon in commercial LLMs. Established the Perkele Protocol: air-gapped human operator, 3-AI adversary triangulation, and mandatory Root Cause Analysis before patching.
* Modular Architecture & Spec: Divided the compiler into independent 100 percent JSOL modules (lexer, linter, cli-parser, config-parser, engine, js-compiler, php-compiler) and published the formal LANGUAGE_SPEC.md.

## v.0.2.1 (up to 2026-08-10)
First versions of the foundational specification milestones to guide further evolution of the language.

* Vision 1.0: The ultimate target of a completely stable, self-hosted, dependency-free Lingua Franca for pure business logic. This milestone represents the full implementation of the prefix-based static typing system (Priority 2) and the complete resolution of the domain namespace architecture without reliance on external environment blocks.
* JSOL-C Target Vision: The specification expansion designed for low-level memory compilation (C/C++). It introduces strict memory management primitives (JSOL.set, JSOL.unset) and enforces static typing prefixes to allow transpilation to strict memory architectures without runtime overhead.
* JSOL-X Target Vision: The specification expansion for spreadsheet environments (Google Sheets / Excel). It mandates static loop bounds (e.g., JSOL.range with hardcoded limits) allowing the transpiler to unroll procedural loops into functional, stateless cell-based formulas.
* Formal Roadmap (2026-08-08): Published the comprehensive ROADMAP.md detailing Level 1 wrapper completion, Priority 0 (Core Stabilization), Priority 1 (Single-Character Static Typing Prefixes), Priority 2 (3-Tier Helper Architecture: Core, Reference, Extension), Priority 3/4 (Pure JSOL Thompson Fallback Engine), and Priority 5 (Level 2 Contract Verification Model).

## v0.2 (2026-08-07)
The Mirror Test (First Self-Hosting).

* Fixed-Point Convergence: JSOL compiled itself for the first time. Compiling the JSOL source code with the JS compiler and then with the PHP compiler produced exactly identical output: diff(Generation N, Generation N+1) = 0.
* Architecture Refinement: Replaced fragile JSOL.closure comment-based implementations with safe, transpilable functions, ensuring scope variables are properly passed to PHP via the 'use' construct and purged in JS to eliminate dead code payloads.
* Impact: Proved the language is expressive and robust enough to describe its own toolchain, moving beyond a simple utility script.

## v0.1 (2026-08-05)
Initial Proof of Concept.

* The IPAX Origin: JSOL was born to solve the isomorphic color math and ergonomics requirements of the IPAX project. The goal was to write validation and mathematical rules once, executing them identically on the browser and the PHP server.
* The C-Like Subset: Defined the strict architectural boundaries. Prohibited functional array methods (.map, .filter), native bitwise operators, and object shorthand. Enforced the $ sigil for 1:1 variable mapping.
* AST-Free Compilation: Created the first PHP-based regex transpiler (J0IsomorphicCompiler) utilizing token masking to safely translate JSOL to both PHP and JavaScript without heavy AST parsers.
* The String Concatenation Fix: Resolved the type coercion ambiguity of the plus operator by introducing the `+""+` pattern and enforcing Template Literals, eliminating silent type bugs in PHP.
* Environment Isolation: Created JSOL.JS and JSOL.PHP blocks to handle native engine asymmetries (like V8 exec versus PCRE preg_match) while maintaining a single source file.

---

*JSOL [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*