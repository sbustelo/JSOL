# JSOL Version History

## v0.2.97 (2026-08-31)

* **Blind Router Architecture (AST-Free):** The compiler abandoned hardcoded syntax replacements. Operations are now mapped purely via a Single Source of Truth (semantics.json and rules.json), dynamically substituting templates ({0}, {1}) without relying on target-specific strings within the engine's core.
* **AOT Symbol Table & Scope Isolation:** Implemented the first iteration of the Symbol Table (0400-compiler-helpers.jsol). Variables are registered using Longest-Prefix Match against semantics.json, normalizing roots to lowercase. Scope is now successfully isolated using $iBraceDepth tracking, allowing safe root reuse across parallel blocks.
* **Linter Fatal Errors (Root Collisions & Delimiters):** The linter now strictly enforces type prefix delimiters (_ or CamelCase). It aborts compilation immediately if two different physical types attempt to claim the same root name within the same brace depth, ensuring AOT predictability.
* **Shadow Channel Infrastructure (Injected):** The compiler now successfully evaluates the {shadowMap:N} placeholder param, extracts the variable root from the Symbol Table, and maps it to target-specific templates (e.g., $mJSOL_{root}_ok in JS or mJSOL_{root}_ok in C/PHP) to prepare the ground for Out-of-Band error signaling.
* **PHP Auto-Use Extractor (Closure Analyzer):** Implemented a flat cyclomatic complexity parser (1110-php-use-extractor.jsol) that analyzes closure bodies, identifies free variables, and automatically injects the use (&$var) clause in PHP. This deprecates the manual JSOL.use() requirement in business logic.
* **Python Control Flow & Ternary Transpilation:** Extended the Python backend to translate C-like operators, inline ternary expressions (A ? B : C to B if A else C), and control flow statements (while, for, switch/case to elif chains) via pure regex-based parsing passes. Fixed pipeline ordering (1230 running before 1240) to prevent syntax corruption.
* **TypeScript Strict Typings Fix:** Eliminated null assignments in compiler variables ($saMetaShadowRef =) and function returns (Map.create(valid, false)), passing strict tsc validation without implicit any fallbacks.
* **Core-0 Intrinsics Expansion:** Established the Core-0, Core-1, and Core-2 architectural taxonomy for the Standard Library. Successfully mapped new Core-0 comparison primitives (Math.eq, Math.gt, Str.eq, etc.) directly to native operators across all targets via rules.json, achieving zero-cost transpilation without relying on runtime polyfills.
* **Floating-Point & Type Parity Mechanisms:** Fixed target-specific edge cases to achieve 100% isomorphic parity. PHP polyfills for Math.modX and Math.roundX now preserve integer types for strict comparisons (resolving loops in Euclidean GCD and Luhn). JavaScript Math.logX implements epsilon rounding and native fast-paths (log2, log10) to mitigate V8 precision artifacts. Python Math.pow delegates to math.pow to resolve operator precedence conflicts, and regex compilation in PHP now auto-converts Unicode escape sequences to support JS-like whitespace trimming.
* **Isomorphic Testing Runner Upgrades:** The contract-runner.js batch suite now supports continuous execution (--no-bail) and targeted case filtering (--filter). Test arguments are now deeply cloned via JSON parsing to prevent pass-by-reference cross-contamination across runtimes during isomorphic validation (e.g., order-clone-aliasing).

## v0.2.96 (2026-08-25)
* **Unified Backend Registry:** Replaced hardcoded per-target logic with pattern-based parsing and a unified backend registry. Adding a new target now requires only a new $fCompileBackendX function plus one line in the registry.
* **Dynamic Compiler Loading (OCP):** Host runners (index.js/php/py) no longer hardcode the list of compiler parts. Files are discovered via directory scan at load time; any filename containing an underscore (_) is excluded, honoring the project-wide "_ = ignore" convention. Dropping in a new compiler module now requires zero changes to the host files.
* **Dynamic Linter SSOT:** Type prefixes moved out of the linter's hardcoded logic into types.json (Single Source of Truth). The linter now supports type aliases and validates custom prefixes of 3+ characters, laying the groundwork for domain-specific type systems (e.g. Color Science).
* **QA Batch Mode:** Refactored test-runner.sh and contract-runner.js to compile and validate examples in batch instead of one at a time, and isolated TypeScript validation from the main loop. QA suite runtime dropped from minutes to seconds.
* **Interactive REPL Overhaul:** The visual interpreter now shows the compiled output for every target side by side, renders the @description block as Markdown, and applies syntax highlighting to code samples. Comments in code samples can be toggled show/hide. Code samples can be copied or downloaded individually, and each case now has a button to download the source .jsol plus every compiled target in one shot.


## v0.2.95 (2026-08-21)
Official Python Target and 4-Way Isomorphic Parity.

* Python Target: Successfully added native Python 3 compilation ('jsol-compiler-py'). Expanded the AST-free architecture to handle indentation-based scoping, dynamic 'for'-to-'while' loop unrolling, and strict identifier sanitization, proving that JSOL can transpile to non-C-like syntax families.
* 4-Way Isomorphic Parity: The 'contract-runner.js' QA suite now enforces mathematical and logical fixed-point parity across four simultaneous execution environments: Node.js (JS), PHP, TypeScript, and Python. All 66 mathematical contracts pass seamlessly.
* Control Flow Normalization: Upgraded 'python-compiler.jsol' to safely map C-like structures ('switch'/'case') to Python 'elif' chains (maintaining compatibility with Python < 3.10), translate logical operators, and safely sanitize JSOL's '$' sigil to '_' for Python variables.
* Structural Indentation Engine: Engineered 'python-brace-strip.jsol' to consume the generic C-like layout and output mathematically perfect, brace-less Python indentation line-by-line without relying on Abstract Syntax Trees.
* Native Polyfill Orchestration: Python's runtime fallback ('jsol_core.py'), which wraps the native 're' module to guarantee regex parity, is now bundled automatically into the Single Source of Truth (SSOT) via the Bootstrapper.

## v0.2.94 (2026-08-20)
Modular Architecture, Single Source of Truth (SSOT) implementation, and TypeScript Target compilation.

* **TypeScript Target**: Successfully added a native TypeScript emitter (`jsol-compiler-ts`) with zero modifications to the core engine, proving the extensibility of the AST-free meta-regex architecture. The compiler correctly infers and maps JSOL's Single-Character Type Prefixes (e.g., `$s` to `string`, `$a` to `any[]`) into strict TS annotations.
* Single Source of Truth (SSOT): Abandoned the monolithic compiler design. The language specification is now strictly separated into a Domain Axis (`src/domains/`) and a Target Axis (`src/targets/`), dynamically assembled by `tools/bootstrap.js` into a unified `jsol-spec.json`.
* Cross-Validation Gate: The Bootstrapper now enforces absolute parity during the build step, automatically aborting if any primitive lacks a translation rule in any active target.
* Unified CI/CD Pipeline: Redesigned the `selfhost-verify.sh` pipeline to extract volatile seed engines (`_seed_engine`), execute SSOT synchronization, and validate temporal and isomorphic Fixed-Point convergence across 4 generations before deploying public distributions.
* Type Resolution Refinement: Eliminated unresolvable lookaheads and nested dependencies in the compiler rules, enabling zero-error passes under strict TypeScript validation (`tsc --noEmit --strict`).
* Polyfill Modularization: Native environment fallbacks (`jsol-core.js`, `jsol-core.php`) are now dynamically copied and bundled by the Bootstrapper, rather than being manually hardcoded into the compiler's entry points.
* Regex Catastrophic Backtracking Fix: Resolved an infinite loop (O(2^N) backtracking) in the PHP compiler rules caused by nested repetition operators `(?:\s+|__JSOL_COM_\d+__)*` when parsing `JSOL.use` directives.
* Seed Engine Orchestration: Fixed the `00-compile-verify-jsol.sh` pipeline to properly isolate the SSOT during asymmetric regeneration, preventing obsolete regex rules from corrupting the PHP seed distribution.
* Indenter Suite: Added `test-indenter.js` and `test-indenter-all.sh` to validate that the Brace-to-Indent Formatter (`indenter.jsol`) modifies exclusively the layout without altering behavioral execution or isomorphic parity. _This is the first step for future Python support._

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