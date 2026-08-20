# JSOL Roadmap

This document tracks where JSOL is and what's next, in priority order.
As a backlog, it is not (and cannot be) final nor accurate; actual work on it may uncover current imprecisions, mistakes, etc.

See `docs/DESIGN_PHILOSOPHY.md` for why this roadmap projects several releases past what's actually being built right now.

## The Vision: The Lingua Franca of Business Logic

The definitive vision for JSOL is to be the **universal, deterministic language for business logic that transpiles to C-like languages**.

This vision covers three primary use cases:

1.  **Universal Algorithms:** Math, geometry, physics, and parsers that must run everywhere exactly the same.
2.  **Business Logic Parity:** E-commerce rules, tax calculations, and state machines evaluated on the client and re-verified on the server.
3.  **Executable Pseudocode:** A superior replacement for academic and documentation pseudocode. JSOL is designed to be highly readable for teaching computer science fundamentals, with the advantage that it can be directly compiled and executed.

### Two memory profiles, not two languages

Target feasibility doesn't split by "how similar the syntax looks to C." It splits by memory model:

- **Managed Profile** — any target with automatic memory reclamation: tracing GC (JS, PHP, C#, Java, Go, Python), ARC (Swift), or RAII containers that free themselves without the user writing `delete` (C++, restricted to `std::vector`/`std::string`/`std::map` — JSOL's core never needs templates, overloading, or manual RAII authoring, so the parts of C++ that actually require semantic analysis never come into play). All of today's targets, plus Swift and a restricted slice of C++, live here. `Arr.push`, `Dict.create` (soon `Map.create`, see below), closures — all of it compiles the same way across this whole profile, because "who frees this" is never JSOL's problem here.
- **JSOL-C** — no automatic memory management assumed. Targets plain C, or any target where you don't want to rely on a runtime. Requires memory declared statically at the point of use (see `JSOL.set`/`JSOL.unset` below). This is a stricter subset of Managed, not a separate language: anything valid in JSOL-C is automatically valid in Managed, never the reverse.

A file declares its profile via pragma (`// @JSOL` for Managed, `// @JSOL-C` for the restricted profile). Mixing profiles inside one file is out of scope for v1 — the linter tracking which region of a file is under which regime is a lot of complexity for a need nobody has yet.

### `JSOL.set` / `JSOL.unset` (JSOL-C only)

Two separate primitives, not a replacement for `let`/`const`. In Managed Profile, `let`/`const` remain the only declaration mechanism — there's nothing to reserve by hand when the runtime already does it. `JSOL.set`/`JSOL.unset` only have meaning, and only compile, inside a `// @JSOL-C` file; the linter should treat their appearance in a Managed file as fatal.

Still open, not yet resolved: whether `JSOL.set` takes capacity alone (populate separately, indexed assignment in a loop) or capacity plus an initial value list in one call, and whether both forms coexist. `JSOL.unset` frees explicitly — named after PHP's `unset()` for familiarity, though the semantics aren't identical (PHP's `unset()` drops a binding and decrements a refcount; this is closer to `free()`). In Managed Profile compilations of the same JSOL-C source (useful for testing memory discipline with instant feedback before running against a real C target), both compile to near no-ops — the host's GC is already handling it, the discipline is what's being practiced, not the mechanism.

### On C++ specifically

Earlier drafts of this roadmap listed C++ as a stretch goal requiring "real semantic analysis," separate from C#/Java/Go. That was true for unrestricted C++, but not for the slice JSOL's core actually needs: `std::vector`, `std::string`, `std::map` are RAII, they free themselves, and JSOL's core never touches templates, operator overloading, or manual resource management. Restricted to that container set, C++ is Managed Profile, same tier as C#, no different mechanism required. Plain C is the one that needs JSOL-C, because C has no automatic reclamation of any kind to lean on.

Everything below this line outlines the path to JSOL v1.0, ensuring the specification is robust enough to support strict statically-typed target languages.

## Where we are: v0.2.90 (Fixed-Point Bootstrap & Thompson VM Engine Complete)

The v0.2.94 compiler proves the AST-free, regex-based compilation pipeline with pure JSOL self-hosting, a unified SSOT, and a stable TypeScript emitter. It covers what this document calls **Level 1**: wrappers backed by deterministic, engine-agnostic logic.

Level 1 wrappers require no runtime verification because the guarantee comes from the wrapper's implementation, proven once, by the compiler maintainer, forever. The compiler is self-hosted (see `SELF_HOSTING.md`) and fixed-point verified on both JS and PHP hosts.

However, to support the C-like universe and the educational use-case, the core needs structural shifts.


## Next Steps (Path to v0.3.0)

* **Refactor 'Regex.\*' Domain Namespace (Technical Debt):** Transition 'regex.jsol' functions ('$regexMatch', '$regexReplace') from bare global functions into the formal 'Regex.\*' domain namespace ('Regex.match', 'Regex.replace', 'Regex.test') to eliminate global scope pollution and unify with 'Str.\*'/'Arr.\*'.
* **Priority 3 (Helper Architecture):** Core vs. Reference vs. Extension packages.

### Completed in v0.2.94:
**Priority 6 (Contract Model):** Formalized cross-target test runner infrastructure (tools/contract-runner.js and execution pipeline).
* **Priority 7 (Specification SSOT):** Extract the language domain API (namespaces and wrappers) from Markdown files into a centralized Single Source of Truth. This JSON will feed the compiler rules, dynamically generate the Markdown documentation, and power the interactive syntax-highlighting/autocomplete features of the REPL Interpreter.
* **TypeScript Target:** Successfully added a native TypeScript emitter with zero modifications to the core engine.
* **Unified CI/CD Pipeline:** Redesigned the selfhost-verify.sh pipeline to extract volatile seed engines and validate fixed-point convergence.
* **Indenter Suite:** Added test-indenter.js and test-indenter-all.sh to validate the Brace-to-Indent Formatter. _This is a step for future Python support._

### Completed in v0.2.93:
* Priority 1 & 2 (Control Flow Strictness & Static Typing Prefixes): Enforce '$s' (string), '$i' (index), '$q' (quantity), '$a' (array), '$m' (map), '$b' (boolean) strictly across all source variables.
* Priority 2 (Static Typing Prefixes): Enforced '$s' (string), '$i' (index), '$q' (quantity), '$a' (array), '$m' (map), '$b' (boolean) strictly across all compiler source variables. DONE.
* Priority 5 (Host Orchestration Layer): Formalized environment detection in index.js (Node vs Browser) and index.php (CLI vs Web SAPI). Added ui.php. DONE.
* JSOL-C Memory Stubs: JSOL.set and JSOL.unset added to compiler rewriting rules as managed no-ops. DONE.


### Completed in v0.2.90:
- **Priority 0 (Academic Wrapper Redesign):** Core domain namespaces ('Str.*', 'Arr.*', 'Map.*', 'Math.*', 'Bit.*', 'Cast.*') fully integrated and active across the compiler source.
- **Priority 4 (Pure JSOL Regex Reference Engine):** Integrated Thompson VM ('regex.jsol') written in 100% pure JSOL. Eliminates environment isolation closures ('JSOL.JS' / 'JSOL.PHP') from the compiler, achieving full self-hosting purity.
- **Fixed-Point Convergence:** Verified byte-for-byte convergence across Node.js and PHP hosts.


Everything below this line doesn't exist yet. This is backlog, not changelog.

---

## Priority 0: Core Stabilization and the Generative Set

To act as the definitive business logic layer, JSOL's core must support all operations over the fundamental JSON data types, without bloating the compiler.

### The Academic Wrapper Redesign

Wrappers driven by implementation details (`JSOL.count`) ruin the educational value of the language. Wrappers must express the operational domain of Computer Science. We will deprecate the `JSOL.*` prefix for native operations in favor of strict domain classifications:

-   **`Math.*`**: FPU / Float arithmetic (`Math.floor`, `Math.abs`).
-   **`Str.*`**: String manipulation (`Str.len`, `Str.sub`, `Str.char`, `Str.fromChar`).
-   **`Arr.*`**: Sequential memory structures (`Arr.count`, `Arr.slice`, `Arr.push`, `Arr.pop`, `Arr.shift`).
-   **`Map.*`**: Hash Maps (`Map.create`, `Map.has`, `Map.keys`) — renamed from `Dict`, freeing `$d` for the Date type (see Priority 2).
-   **`Bit.*`**: Bitwise logical operations (`Bit.and`, `Bit.shiftL`).
-   **`Cast.*`**: Memory type coercion (`Cast.toStr`, `Cast.toInt`).

This is a breaking rename touching every already-written `.jsol` file, `LANGUAGE_SPEC.md`, `JSOL_AI_INSTRUCTIONS.md`, and every example. It doesn't happen piecemeal — `LANGUAGE_SPEC.md` and the examples keep the current `JSOL.*` naming until this ships as a real, compiler-supported change, so the spec never describes a compiler that doesn't exist yet.

### Completing the Generative Core

Add the missing primitives required to build any complex algorithm in pure JSOL:

-   Stack/Queue operators: `Arr.pop`, `Arr.shift`.
-   Map iteration: `Map.keys`.
-   String-to-character memory translation: `Str.char` (charCodeAt), `Str.fromChar` (fromCharCode).
-   Type conversion: `Cast.toStr`.

## Priority 1: Control Flow & Grammatical Strictness

To ensure seamless transpilation to statically typed C-like languages without generating invalid or divergent code, JSOL requires tighter control flow restrictions:

-   **Prohibition of `with`**: The `with` statement will be strictly forbidden as it destroys lexical scope and is untranslatable.
-   **Explicit Termination for `switch`**: The `switch` statement will be allowed, but execution *fallthrough* will be strictly forbidden. Every `case` containing executable statements must terminate with a `break;` or `return;`. Empty cases can still be stacked.

Note on scope: the `with` prohibition is an isomorphism rule — `with` genuinely can't transpile. The `switch` fallthrough rule is not; C, JS, PHP, Java, and Go already agree on fallthrough semantics, so this restriction doesn't fix a cross-engine divergence. It's a defensive-programming rule, adopted because fallthrough is a well-known source of accidental bugs in any C-family language, independent of JSOL's isomorphism mission.

## Priority 2: Static Typing via Single-Character Prefix

To support transpilation to strictly typed languages using a regex-only compiler (no AST), variable names declare their type explicitly and deterministically via a one-character prefix immediately following `$`. The linter should throw a fatal error on any variable that does not strictly adhere to this matrix.

**CS / Infrastructure types:**

-   `$i`: Index / Iterator (`size_t` / `uint`). Positive integer.
-   `$q`: Quantity (`int`). Standard integer.
-   `$n`: Number (`double` / `float64`). IEEE 754 floating point.
-   `$s`: String.
-   `$a`: Array.
-   `$m`: Map / Dictionary (renamed from `$d` — see below).
-   `$b`: Boolean.
-   `$f`: Function — only applies when a function is declared as a **typed parameter** to enable strict checking at that call boundary. It does not apply to ordinary function declarations; existing functions (`$calculatePenalties`, `$hexToOklch`, and every other function in any existing codebase) keep their descriptive names, no retroactive renaming.
-   `$x`: Regex — compiled patterns, under the Contract Model (Priority 6).
-   `$y`: Byte / Binary — for memory-level algorithms.

**Business types (Vision 2.0, not yet implemented):**

-   `$c`: Currency — fixed-point financial arithmetic, decimal precision without native float rounding error.
-   `$p`: Percentage — base-100 human logic (`$cSueldo * (1 - $pRetencion / 100)` reads and types like ordinary arithmetic, dispatched by declared type, the same mechanism as operator overloading in any typed language — never a silent, undocumented substitution).
-   `$d`: Date — absolute calendar logic. ISO-8601 string input (`"2026-08-09"`), parsed to an integer day count internally, never routed through either engine's native date object.
-   `$t`: Time / Duration — relative time magnitudes. `"01:59:59.0001"` notation (colon-separated, fractional seconds after the decimal point), syntactically invalid as a plain number on purpose, so it can never be confused with one.
-   `$g`: Geometry / Angle — sexagesimal (base-60) human notation. A plain number (`45`) means decimal degrees. A string with exactly two separating characters and three integer groups (`"0.30.0"`, degrees.minutes.seconds) means DMS, parsed to total arcseconds internally, never stored as a float. **Still open**: whether the parser enforces the two-separator rule strictly, or takes the more permissive approach of extracting the numeric groups from the string and discarding anything else — leaning toward the permissive form for source readability, not yet decided as spec, convention, linter rule, or parser detail.

**Discarded**: `$e` (Error) — rejected under Design by Contract. JSOL doesn't handle infrastructure exceptions internally; failures explode outward to the host orchestrator, which is where error handling belongs (see the OUT OF SCOPE list in `JSOL_AI_INSTRUCTIONS.md`).

### Runtime Type Guards

Because JSOL cannot track type mutations across lines (no AST), the compiler could introduce a `--strict-types` flag for testing. This would compile to JS/PHP wrapping every assignment in a type checker. If a developer mutates a type (e.g., assigning a string to `$nTotal`), the host would throw a runtime error.

This is a runtime check against whatever inputs a test run actually exercises — it strongly reduces the risk of type-assignment errors for the code paths covered by that run, the same way any test suite does. It is not a static proof and doesn't cover untested branches; describing it as a guarantee overstates what a dynamic check under test coverage can prove.

## Priority 3: Helper Architecture (Core vs. Reference vs. Extension)

JSOL will not export complex libraries inside the compiler. The architecture is split into three tiers:

1.  **The Core:** The generative primitives (`Math`, `Arr`, `Str`, etc.). Hardcoded in the compiler. Ships with the compiler, anyone using JSOL gets it, no setup.
2.  **The Official Reference Library:** Classic algorithms (Regex Engine, Parsers, Validation Rules, Sorters, calendar/date arithmetic) built entirely in _pure JSOL_ using only the Core primitives. These act as the definitive educational examples and are imported by projects as needed. They prove the language's Turing completeness and domain viability.
3.  **Extensions:** Third-party, project-specific logic (e.g., IPAX color engines), naming TBD (`JSOL.ext.<namespace>.<helperName>()` is one option). Live outside the compiler, one file per helper, discoverable rather than hardcoded. IPAX's helpers can become the first extension package; someone else's domain gets their own.

### Discovery is an input, not a runtime operation

This is the part worth getting right from the start, because getting it wrong means rebuilding it later. For Node and PHP-CLI, scanning a `/helpers/` directory at compile time is trivial — both have filesystem access. **A JS engine running in a browser does not**, and pretending it does bakes a Node/CLI assumption into what's supposed to be a host-agnostic compiler.

The resolution: helper discovery is never something the compiler does for itself mid-process. It's a step that happens *before* compilation and hands the compiler a manifest (a JSON list of available helpers and where their per-target implementations live). On Node/PHP-CLI, that manifest can be generated by scanning a directory. In a browser context, the exact same manifest shape arrives as compiler input however the host app wants to fetch it — bundled at build time, pulled from an API, whatever. The compiler's job is only ever "given this manifest, resolve these calls," never "go find out what helpers exist."

Practical consequence: only helpers actually referenced in a given `.jsol` file get included in that file's output (this is the same Zero Dead Code principle already in `LANGUAGE_SPEC.md` Section 1, just applied to a growing helper set instead of a fixed one).

### Open question to resolve before implementing

Do extension helpers ever get to be *written in JSOL itself* (for helpers with no engine asymmetry, recursively compiled the normal way), or are they always hand-written per-target like `JSOL.count`'s current implementation? Deterministic helpers (most of what IPAX needs beyond regex) could plausibly just be `.jsol` files that compile normally and get included as dependencies. Helpers backed by genuinely asymmetric primitives (anything regex-shaped) can't — they need the Priority 6 contract machinery regardless of which tier they live in.

A candidate strategy: the ultimate source of truth is JS/PHP helpers. JSOL-authored helpers, if any, get compiled first; their output then exists as ordinary JS/PHP files alongside hand-written "orphan" JS/PHP helpers, both discoverable through the same manifest. The manifest should preserve *provenance* even though the final artifact looks the same either way: a helper compiled from JSOL inherits Level 1's guarantee automatically (no contract needed); an orphan helper hand-written independently in both languages is Level 2 by definition, since nobody has verified the two independent implementations agree.

## Priority 4: Self-Hosting Purity and the Regex Problem

Currently, JSOL relies on host-environment regex engines (V8 vs. PCRE), which causes asymmetry. To solve this, developers currently use `JSOL.JS` and `JSOL.PHP` dual-blocks.

**The Goal:** The compiler must eventually compile itself _purely_, without any environment-isolation closures. If the compiler contains `JSOL.PHP`, it cannot compile itself to C++ or Go.

* Note on Regex Catch-22: The internal Thompson VM functions deliberately use the prefixes '$mRegexMatch' and '$sRegexReplace' rather than the public 'Regex.match' namespace. Attempting to force the self-hosted compiler to parse its own namespace generates infinite recursion in the AST-free translation rules and breaks host environment polyfills. This is a closed architectural decision; it must not be 'fixed' or refactored."

### The reference/fast-track split (the "math coprocessor" pattern)

Same shape as a language shipping a software float library for CPUs without an FPU, and switching to hardware floats where available, same instruction semantics either way:

```js
JSOL.re($pattern, $str, "safe")   // pure-JSOL reference engine
JSOL.re($pattern, $str, "fast")   // host's native regex engine
```

- **`safe`**: a Thompson's-construction NFA matcher, written entirely in pure JSOL, part of the Official Reference Library. Because it's built on Thompson construction rather than backtracking, it matches in **linear time by mathematical construction, regardless of pattern shape** — immune to catastrophic backtracking (ReDoS) by design, not by hoping a pattern doesn't trigger it. Slower than a native engine, since it's interpreted rather than JIT-optimized, but the only mode with a portability and safety guarantee. Default.
- **`fast`**: the host's native regex engine (V8's, PCRE's). Faster, but reintroduces the exact risk the reference engine exists to eliminate — native backtracking engines are not immune to catastrophic backtracking even for patterns that stay within the safe subset below (e.g. `(a+)+$`, no backreferences or lookaround needed to trigger exponential blowup). Opt-in, explicit, never the silent default.

The safe subset of regex syntax the reference engine supports: literals, `.`, character classes with ranges/negation, quantifiers (`* + ? {n,m}`, greedy and lazy), anchors, capture groups, alternation, and case-insensitive/multiline/dotall flags. Explicitly excluded, and why each one is excluded: lookahead/lookbehind (real implementation complexity, and the exact place V8/PCRE diverge most, e.g. variable-length lookbehind support), backreferences (the one exclusion that matters most — without them, Thompson construction and its linear-time guarantee are possible at all; with them, no known algorithm avoids worst-case exponential backtracking), recursive patterns (PCRE-specific, no V8 equivalent), Unicode property escapes (version- and database-dependent per engine), atomic groups and possessive quantifiers (PCRE-specific), and named capture groups (adds parsing complexity without adding real capability — everything expressible with named groups is equally expressible by capturing positionally and building a `Map` by hand in JSOL, see `examples/semver-precedence.jsol` when it exists).

### Compilation strategy, not yet finalized

For a **literal pattern** (known at compile time, the common case — `JSOL.re("^#?([a-fd]{2})...", $hex, "safe")`), the compiler can run Thompson construction itself, at compile time, and embed only the resulting state table plus a small generic table-walking interpreter in the output — no regex parser needed in the shipped artifact. For a **dynamic pattern** (built at runtime, rare but legitimate), the full constructor (parser + Thompson construction) has to ship in the output, since the state table can't be precomputed. The compiler distinguishes the two cases the same way it already distinguishes literals from expressions elsewhere in the pipeline (via masking), and only includes what a given file actually needs — Zero Dead Code applied to the regex engine specifically. Whether the state-table interpreter and the full constructor are themselves written in JSOL (self-hosted, elegant, but a real bootstrap-ordering question to work through) or hand-written once per host as part of the compiler itself (simpler now, smaller asymmetry surface to verify) is still open.

## Priority 5: Host Orchestration Layer

Formalize environment detection in the compiler tooling:

-   **`index.js`**: Detect Node vs. Browser. In Node, read `--source`/`--out-dir` from argv, write output via `fs`. In a browser, accept source and manifest as function/message input, return compiled output rather than writing files.
-   **`index.php`**: Detect CLI vs. Web SAPI. In CLI, read argv, write to disk. In a web context, read from `$_GET`/`$_POST`, respond over HTTP — this is what lets someone compile JSOL through a web UI with no shell access, matching what V1 already does today.

This is the prerequisite for Priority 6's contract runner to honor the constraint below: if the test runner is going to invoke "a JS engine," the orchestration layer is where that abstraction has to live, so it can default to Node today without hardcoding Node as a requirement forever.

## Priority 6: The Contract Model (Level 2)

### Why Level 2 is a different kind of guarantee than Level 1

The language cannot statically guarantee isomorphism the moment regex (in `"fast"` mode), or any other asymmetric host primitive, is involved. No amount of linting the pattern *string* can prove two engines will behave identically on it. What we can do is run both engines and compare real output, against a set of test cases the project itself provides.

### Proposed wrappers

```
JSOL.regexMatch($pattern, $string, $flags)
JSOL.regexReplace($pattern, $replacement, $string, $flags)
JSOL.regexTest($pattern, $string, $flags)
```

These map to `"fast"` mode specifically — `"safe"` mode, being pure JSOL, is Level 1 and needs no contract, same guarantee as any other Reference Library function.

### The enforcement rule (mechanical, not semantic)

Any function calling a Level 2 (asymmetric) wrapper **must** include a matching `JSOL.contract('functionName', [...cases])` block, or the linter should fail the build. The linter doesn't need to understand the regex to enforce this — it only needs to check that the directive exists for that function name. Syntactic check, same kind of check this project has any business trusting.

Escape hatch, explicit and loud: a function using a Level 2 wrapper without a contract could carry a `// @UNVERIFIED-PARITY: <reason>` pragma, required by the linter as the bare minimum if no contract is present.

### The contract test runner

Extracts `JSOL.contract(...)` blocks at compile time (never shipped to production output), compiles to the target languages, runs the declared inputs against each, serializes both outputs through a **shared canonicalization step** (raw `JSON.stringify`/`json_encode` don't guarantee matching key order or float formatting on their own), hashes, compares. Divergence fails the build.

**PHP is the only actual hard blocker; Node is not baked in as the only available JS engine.** JS has no single required runtime; PHP has exactly one. So the runner's JS-engine side is a pluggable backend — Node first, browser-based invocation as a documented future backend — never a hardcoded assumption.

### What this unlocks

Once this ships, IPAX's actual `"fast"`-equivalent regex usage migrates to `JSOL.regexMatch` plus a contract (or, once Priority 4 ships, simply to `JSOL.re(..., "safe")` with no contract needed at all), and the manual dual-block disappears from IPAX's business logic entirely.

---

## Summary: build order

DONE:

1. `JSOL.round`, `JSOL.upper`, and the rest of Priority 0's generative core — zero dependencies, ship first. DONE
4. Priority 4 (pure-JSOL regex engine) — the actual unlock for self-hosting purity and for C-like targets beyond JS/PHP. DONE

TO DO:

2. Priority 1 (control flow strictness) and Priority 2 (typing prefix, once the `$sconeP`-class collisions and the `$g` DMS parsing rule are resolved against real code).
3. Priority 3 (Helper Architecture) — unblocks moving IPAX-specific helpers out of core cleanly.
5. Priority 5 (Host Orchestration Layer) — infrastructure Priority 6's test runner needs to honor the PHP-is-the-only-blocker principle instead of accidentally requiring Node.
6. Priority 6 (the Contract Model) — for whatever asymmetric primitives remain once Priority 4 removes regex from that list.
7. Migrate IPAX's remaining hand-written `JSOL.JS`/`JSOL.PHP` blocks onto whichever of the above actually resolves them. This is the actual goal this whole roadmap exists to reach.

---

*This document was produced with systematic AI co-piloting as described in [AI_ENGINEERING_METHODOLOGY.md](../10_dev/AI_ENGINEERING_METHODOLOGY.md). AI was used for architectural stress-testing, cross-model validation, and drafting; all content has been reviewed for technical accuracy and adherence to project constraints.*

---

*JSOL v0.2.94 — 2026-08-20, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*