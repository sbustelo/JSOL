# JSOL Roadmap

This document tracks where JSOL is and what's next, in priority order.
As a backlog, it is not (and cannot be) final nor accurate; actual work on it may uncover current imprecisions, mistakes, etc.

## The Vision: The Lingua Franca of Business Logic

The definitive vision for JSOL is to be the **universal, deterministic language for business logic that transpiles to C-like languages** (JavaScript, PHP, C#, Java, Go, with C++ as a longer-term stretch goal — see the caveat below).

This vision covers three primary use cases:

1.  **Universal Algorithms:** Math, geometry, physics, and parsers that must run everywhere exactly the same.
2.  **Business Logic Parity:** E-commerce rules, tax calculations, and state machines evaluated on the client and re-verified on the server.
3.  **Executable Pseudocode:** A superior replacement for academic and documentation pseudocode. JSOL is designed to be highly readable for teaching computer science fundamentals, with the advantage that it can be directly compiled and executed.

**On C++ specifically**: the regex-substitution compiler pipeline that makes JS/PHP/C#/Java/Go tractable does not, by itself, get JSOL to C++. Templates, operator overloading, and RAII require real semantic analysis, not text substitution (see `EXTENDING.md`). C++ stays on the long-term vision, but it's a different tier of difficulty than the rest of this list, and nothing in this roadmap should imply it's solved by the same mechanism as the others.

Everything below this line outlines the path to JSOL v1.0, ensuring the specification is robust enough to support strict statically-typed target languages.

## Where we are: v0.2.0, Level 1 complete

The published compiler proves the AST-free, regex-based compilation pipeline works for dynamic targets (JS/PHP). It covers what this document calls **Level 1**: wrappers backed by deterministic, engine-agnostic logic (`JSOL.count`, `JSOL.len`, `JSOL.dict`, the `JSOL.bw*` family, `JSOL.closure`/`JSOL.use`).

Level 1 wrappers require no runtime verification because the guarantee comes from the wrapper's implementation, proven once, by the compiler maintainer, forever. The compiler is self-hosted (see `SELF_HOSTING.md`) and fixed-point verified on both JS and PHP hosts.

However, to support the C-like universe and the educational use-case, the core needs structural shifts.

Everything below this line doesn't exist yet. This is backlog, not changelog.

---

## Priority 0: Core Stabilization and the Generative Set

To act as the definitive business logic layer, JSOL's core must support all operations over the fundamental JSON data types, without bloating the compiler.

### The Academic Wrapper Redesign

Wrappers driven by implementation details (`JSOL.count`) ruin the educational value of the language. Wrappers must express the operational domain of Computer Science. We will deprecate the `JSOL.*` prefix for native operations in favor of strict domain classifications:

-   **`Math.*`**: FPU / Float arithmetic (`Math.floor`, `Math.abs`).
-   **`Str.*`**: String manipulation (`Str.len`, `Str.sub`, `Str.char`, `Str.fromChar`).
-   **`Arr.*`**: Sequential memory structures (`Arr.count`, `Arr.slice`, `Arr.push`, `Arr.pop`, `Arr.shift`).
-   **`Dict.*`**: Hash Maps (`Dict.create`, `Dict.has`, `Dict.keys`).
-   **`Bit.*`**: Bitwise logical operations (`Bit.and`, `Bit.shiftL`).
-   **`Cast.*`**: Memory type coercion (`Cast.toStr`, `Cast.toInt`).

This is a breaking rename touching every already-written `.jsol` file, `LANGUAGE_SPEC.md`, `JSOL_AI_INSTRUCTIONS.md`, and every example. It doesn't happen piecemeal — `LANGUAGE_SPEC.md` and the examples keep the current `JSOL.*` naming until this ships as a real, compiler-supported change, so the spec never describes a compiler that doesn't exist yet.

### Completing the Generative Core

Add the missing primitives required to build any complex algorithm in pure JSOL:

-   Stack/Queue operators: `Arr.pop`, `Arr.shift`.
-   Dictionary iteration: `Dict.keys`.
-   String-to-character memory translation: `Str.char` (charCodeAt), `Str.fromChar` (fromCharCode).
-   Type conversion: `Cast.toStr`.

## Priority 1: Control Flow & Grammatical Strictness

To ensure seamless transpilation to statically typed C-like languages without generating invalid or divergent code, JSOL requires tighter control flow restrictions:

-   **Prohibition of `with`**: The `with` statement will be strictly forbidden as it destroys lexical scope and is untranslatable.
-   **Explicit Termination for `switch`**: The `switch` statement will be allowed, but execution *fallthrough* will be strictly forbidden. Every `case` containing executable statements must terminate with a `break;` or `return;`. Empty cases can still be stacked.

Note on scope: the `with` prohibition is an isomorphism rule — `with` genuinely can't transpile. The `switch` fallthrough rule is not; C, JS, PHP, Java, and Go already agree on fallthrough semantics, so this restriction doesn't fix a cross-engine divergence. It's a defensive-programming rule, adopted because fallthrough is a well-known source of accidental bugs in any C-family language, independent of JSOL's isomorphism mission. Worth keeping the two categories distinct in how this section reads, so future rules don't all get justified under "needed for transpilation" when some are really just good practice.

## Priority 2: Static Typing via Single-Character Prefix

To support transpilation to strictly typed languages (C++, Java, Go) using a regex-only compiler (no AST), variable names should declare their hardware/memory type explicitly and deterministically.

The specification could enforce a **1-Character Prefix Matrix** immediately following the `$` sign. The linter could throw a fatal error on any variable that does not strictly adhere to this matrix:

-   `$i`: Index / Iterator (`size_t` / `uint`). Positive integer. Enables future bounds-checking. Examples: `$i`, `$ix`, `$iTarget`, `$indexTarget`, `$i_loopIndex`.
-   `$q`: Quantity (`int`). Standard integer. Examples: `$qItems`, `$q_total`, `$qTries`, `$quantThings`, `$quantityItems`.
-   `$n`: Number (`double` / `float64`). IEEE 754 Floating point. Examples: `$nPrice`, `$n_average`, `$nMid`, `$numPrice`, `$numberTemperature`.
-   `$s`: String (`std::string` / `String`). Examples: `$sName`, `$s_hexColor`, `$sToken`, `$strSurname`, `$stringNickname`.
-   `$a`: Array (`vector` / `T[]`). Examples: `$aList`, `$a_nodes`, `$aTokens`, `$arrList`, `$arrayNodes`.
-   `$d`: Dictionary (`map` / `HashMap`). Examples: `$dRules`, `$d_config`, `$dMap`, `$dictRules`, `$dictionaryMap`.
-   `$b`: Boolean (`bool`). Strictly locked to `b` for O(1) compiler extraction. Examples: `$bValid`, `$b_hasMatch`, `$bActive`, `$beOverload`, `$boolIsActive`.

**Not yet resolved — a real collision already exists.** `$sconeP` in IPAX's own ergonomics engine (a float tracking an S-cone penalty score, nothing to do with strings) starts with `s`, which this matrix reads as String. The disambiguation rule can't be "first character" as stated; it needs a precise boundary rule (e.g. requiring an uppercase letter or underscore immediately after the type letter) validated against real, already-existing code before this becomes a linter-enforced fatal error, not just against new examples written to fit the scheme. Until that boundary rule is nailed down and re-checked against IPAX's actual variable names, treat this prefix matrix as a draft, not a spec.

### Runtime Type Guards

Because JSOL cannot track type mutations across lines (no AST), the compiler could introduce a `--strict-types` flag for testing. This would compile to JS/PHP wrapping every assignment in a type checker (`JSOL.chk('n', $val)`). If a developer mutates a type (e.g., assigning a string to `$nTotal`), the JS/PHP host would throw a runtime error.

This is a runtime check against whatever inputs a test run actually exercises — it strongly reduces the risk of type-assignment errors for the code paths covered by that run, the same way any test suite does. It is not a static proof and doesn't cover untested branches; describing it as a guarantee overstates what a dynamic check under test coverage can prove.

## Priority 3: Helper Architecture (Core vs. Reference vs. Extension)

JSOL will not export complex libraries inside the compiler. The architecture is split into three tiers:

1.  **The Core:** The generative primitives (`Math`, `Arr`, `Str`, etc.). Hardcoded in the compiler. Ships with the compiler, anyone using JSOL gets it, no setup.
2.  **The Official Reference Library:** Classic algorithms (Regex Engine, Parsers, Validation Rules, Sorters) built entirely in _pure JSOL_ using only the Core primitives. These act as the definitive educational examples and are imported by projects as needed. They prove the language's Turing completeness and domain viability.
3.  **Extensions:** Third-party, project-specific logic (e.g., IPAX color engines), naming TBD (`JSOL.ext.<namespace>.<helperName>()` is one option). Live outside the compiler, one file per helper, discoverable rather than hardcoded. IPAX's helpers can become the first extension package; someone else's domain gets their own.

### Discovery is an input, not a runtime operation

This is the part worth getting right from the start, because getting it wrong means rebuilding it later. For Node and PHP-CLI, scanning a `/helpers/` directory at compile time is trivial — both have filesystem access. **A JS engine running in a browser does not**, and pretending it does bakes a Node/CLI assumption into what's supposed to be a host-agnostic compiler.

The resolution: helper discovery is never something the compiler does for itself mid-process. It's a step that happens *before* compilation and hands the compiler a manifest (a JSON list of available helpers and where their per-target implementations live). On Node/PHP-CLI, that manifest can be generated by scanning a directory. In a browser context, the exact same manifest shape arrives as compiler input however the host app wants to fetch it — bundled at build time, pulled from an API, whatever. The compiler's job is only ever "given this manifest, resolve these calls," never "go find out what helpers exist."

Practical consequence: only helpers actually referenced in a given `.jsol` file get included in that file's output (this is the same Zero Dead Code principle already in `LANGUAGE_SPEC.md` Section 1, just applied to a growing helper set instead of a fixed one). A `.jsol` file that never calls an IPAX helper never pulls IPAX code into its compiled output, even if IPAX's helper package is installed alongside it.

### Open question to resolve before implementing

Do extension helpers ever get to be *written in JSOL itself* (for helpers with no engine asymmetry, recursively compiled the normal way), or are they always hand-written per-target like `JSOL.count`'s current implementation? Deterministic helpers (most of what IPAX needs beyond regex) could plausibly just be `.jsol` files that compile normally and get included as dependencies. Helpers backed by genuinely asymmetric primitives (anything regex-shaped) can't — they need the Priority 6 contract machinery regardless of which tier they live in.

A candidate strategy: the ultimate source of truth is JS/PHP helpers. JSOL-authored helpers, if any, get compiled first; their output then exists as ordinary JS/PHP files alongside hand-written "orphan" JS/PHP helpers, both discoverable through the same manifest. The manifest should preserve *provenance* even though the final artifact looks the same either way: a helper compiled from JSOL inherits Level 1's guarantee automatically (no contract needed); an orphan helper hand-written independently in both languages is Level 2 by definition, since nobody has verified the two independent implementations agree. Without that distinction in the manifest, the linter can't tell which helpers actually need a mandatory contract and which don't. We'll see how this develops in practice.

## Priority 4: Self-Hosting Purity and the Regex Problem

Currently, JSOL relies on host-environment regex engines (V8 vs. PCRE), which causes asymmetry. To solve this, developers currently use `JSOL.JS` and `JSOL.PHP` dual-blocks.

**The Goal:** The compiler must eventually compile itself _purely_, without any environment-isolation closures. If the compiler contains `JSOL.PHP`, it cannot compile itself to C++ or Go. **The Solution:** We are evaluating the implementation of a pure-JSOL Regex fallback (e.g., Thompson's construction algorithm) as part of the Official Reference Library. Once a regex engine is written in pure JSOL, the compiler can use it to parse code, freeing the compiler from target-specific dependencies and achieving 100% C-like portability.

## Priority 5: Host Orchestration Layer

Formalize environment detection in the compiler tooling:

-   **`index.js`**: Detect Node vs. Browser (`typeof process !== "undefined" && process.versions?.node` vs. `typeof window !== "undefined"`). In Node, read `--source`/`--out-dir` from argv, write output via `fs`. In a browser, accept source and manifest as function/message input, return compiled output rather than writing files, since there's nothing to write to.
-   **`index.php`**: Detect CLI vs. Web SAPI (`PHP_SAPI === 'cli'` vs. not). In CLI, read argv, write to disk. In a web context, read from `$_GET`/`$_POST`, respond over HTTP instead of touching the filesystem — this is what lets someone compile JSOL through a web UI with no shell access at all, matching what V1 already does today.

This isn't just DX polish. It's the prerequisite for Priority 6's contract runner to honor the constraint below: if the test runner is going to invoke "a JS engine," the orchestration layer is where that abstraction has to live, so it can default to Node today without hardcoding Node as a requirement forever.

## Priority 6: The Contract Model (Level 2)

### Why Level 2 is a different kind of guarantee than Level 1

The language cannot statically guarantee isomorphism the moment regex, or any other asymmetric host primitive (a specific crypto library, the host's native high-performance regex engine instead of the pure-JSOL fallback), is involved. PCRE and V8 are different engines with real, non-textual differences (variable-length lookbehind support, backtracking behavior, Unicode property handling). No amount of linting the pattern *string* can prove two engines will behave identically on it. What we can do is run both engines and compare real output, against a set of test cases the project itself provides.

### Proposed wrappers

```
JSOL.regexMatch($pattern, $string, $flags)
JSOL.regexReplace($pattern, $replacement, $string, $flags)
JSOL.regexTest($pattern, $string, $flags)
```

Compiler-resolved, same principle as `JSOL.count`: the user never writes `.exec()` vs. `preg_match()` by hand, the compiler picks the right native call per target.

### The enforcement rule (mechanical, not semantic)

Any function calling an asymmetric wrapper **must** include a matching `JSOL.contract('functionName', [...cases])` block, or the linter should fail the build. The linter doesn't need to understand the regex (or whatever the asymmetric primitive is) to enforce this — it only needs to check that the directive exists for that function name. That's a syntactic check, which is the only kind of check this project has any business trusting after everything that went wrong trying to text-match `.length`.

Escape hatch, explicit and loud: a function that uses a Level 2 wrapper without a contract could carry a `// @UNVERIFIED-PARITY: <reason>` pragma, which the linter could require as the bare minimum if no contract is present. This exists for the developer who genuinely cannot run both engines — it doesn't remove the risk, it makes the risk impossible to miss when reading the code later.

### The contract test runner

Extracts `JSOL.contract(...)` blocks at compile time (never shipped to production output — zero bloat, same principle as everything else), compiles to the target languages, runs the declared inputs against each, serializes both outputs through a **shared canonicalization step** (this matters: `JSON.stringify` and `json_encode` don't guarantee matching key order or float formatting on their own, so hashing raw output from each side independently is a false sense of security, not a real check), hashes, compares. Divergence fails the build.

**PHP is the only actual hard blocker; Node is not baked in as the only available JS engine.** JS has no single required runtime — it runs in Node, in a browser, in a headless browser, in any embedded JS engine. PHP has no equivalent flexibility: there is exactly one way to run PHP, which is PHP. So the real constraint is:

- **PHP availability is a hard, unavoidable requirement** for anything that needs to verify PHP-side behavior.
- **JS availability is flexible.** The runner's "JS engine" side is a pluggable backend — Node first, browser-based invocation as a documented future backend — never a hardcoded assumption.

This is why Priority 5 (Host Orchestration Layer) comes before this one in build order: the abstraction this section needs already has to exist.

### What this unlocks

Once this ships, IPAX's actual regex usage (`$parseHexToRGB` and anywhere else a `JSOL.JS`/`JSOL.PHP` pair exists purely to call a regex engine) migrates to `JSOL.regexMatch` plus a contract, and the manual dual-block disappears from IPAX's business logic entirely. That migration is the actual finish line for "IPAX runs on JSOL without hand-split JS/PHP code," not this priority shipping by itself.

---

## Summary: build order

1. `JSOL.round`, `JSOL.upper`, and the rest of Priority 0's generative core — zero dependencies, ship first.
2. Priority 1 (control flow strictness) and Priority 2 (typing prefix, once the `$sconeP`-class collisions are resolved against real code).
3. Priority 3 (Helper Architecture) — unblocks moving IPAX-specific helpers out of core cleanly.
4. Priority 4 (pure-JSOL regex engine) — the actual unlock for self-hosting purity and for C-like targets beyond JS/PHP.
5. Priority 5 (Host Orchestration Layer) — infrastructure Priority 6's test runner needs to honor the PHP-is-the-only-blocker principle instead of accidentally requiring Node.
6. Priority 6 (the Contract Model) — for whatever asymmetric primitives remain once Priority 4 removes regex from that list.
7. Migrate IPAX's remaining hand-written `JSOL.JS`/`JSOL.PHP` blocks onto whichever of the above actually resolves them. This is the actual goal this whole roadmap exists to reach.

---

*JSOL v0.2 r. 2026-08-08, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*
