# Extending JSOL to Other Languages (Exploratory)

This is an architectural sketch, not a roadmap commitment. JSOL today targets JavaScript and PHP because its lightweight, AST-free transpilation pipeline was built for dynamic C-family languages sharing very close scope semantics. Whether this pipeline generalizes to other languages depends on how closely a target matches JSOL's assumed grammar and runtime model.

## Architectural Rationale: Why an AST-Free Pipeline?

One of the central design decisions in JSOL is its avoidance of an Abstract Syntax Tree (AST) in favor of a regex-based lexical transformation pipeline. This choice is deliberate and driven by the following considerations:

1.  **Embeddability and Zero Dependencies:** Eliminating full grammar parsing allows the compiler to remain ultra-lightweight, dependency-free, and directly embeddable within constrained execution environments (e.g., edge workers, embedded scripts, or minimal runtimes).
2.  **Deterministic Language Subset:** JSOL is not a general-purpose JavaScript compiler. It enforces a strict, domain-specific subset of JavaScript designed from the ground up to map deterministically to other target languages without requiring full semantic analysis.
3.  **Targeted State Passes over Full Parsing:** Where target languages require structural adjustments (such as tracking block depths for Python or walking scope for C lambda lifting) JSOL introduces minimal, targeted state scanners rather than building a heavy multi-pass AST parser.

This is a deliberate design trade-off: a conventional recursive-descent parser would be simpler for some transformations, but would add weight and abstraction that JSOL avoids by constraining the source grammar to a subset that can be processed with deterministic text substitutions.

## Feasibility Matrix (AST-Free Transpilation)

> **Note on Metrics:** _Feasibility_ evaluates structural and paradigm alignment with JSOL's core design. A target can have **High Feasibility** (conceptually straightforward without paradigm shifts) while still requiring **Medium Effort** to implement specific state passes (e.g., tracking indentation depth).

| Language | Basic Transforms | Type System | Closure Support | Memory Model | Feasibility |
| --- | --- | --- | --- | --- | --- |
| **JavaScript** | Native | Dynamic | Native | GC  | 🟢 Shipping |
| **PHP** | Native | Dynamic | Native | GC  | 🟢 Shipping |
| **Python** | Medium (Indentation tracking) | Dynamic | Native | GC  | 🟢 High |
| **C#** | Easy | Static (`dynamic` escape hatch) | Native | GC  | 🟡 Medium-High |
| **Go** | Easy syntax | Static (Requires runtime helpers) | Native | GC  | 🟡 Medium |
| **Java** | Easy | Static (Wrapper classes) | Lambdas / Interfaces | GC  | 🟡 Medium |
| **C** | High (Struct generation) | Static | Manual (Lambda lifting) | Manual | 🔴 Low (Standalone) |
| **Rust** | High | Static | Native | Borrow Checker | 🔴 Unrealistic via Regex |

## Technical Feasibility Breakdown

### 1\. High Feasibility: Python

Python shares dynamic semantics with JS and PHP, but its reliance on indentation blocks (the off-side rule) requires a stack-aware block-depth tracker alongside standard regex rules. It remains highly feasible without an AST, provided the pipeline tracks brace nesting depth to emit proper whitespace. This tracking operates on lexer-masked source, where string and comment contents are already tokenized, so braces inside string literals do not affect depth counting.

### 2\. Medium Feasibility: C# and Go

-   **C#:** Highly feasible using C#'s `dynamic` escape hatch (or alternatively, `System.Object` with runtime reflection helpers), deferring type evaluation to runtime and avoiding static type inference.
-   **Go:** While Go is syntactically clean, `interface{}` alone cannot be used with operators like `+`. A Go target must emit lightweight runtime helper functions (e.g., `jsol.Add(a, b)`) to handle dynamic operator dispatch.

### 3\. High Effort & Paradigm Boundaries: C, Rust, C++

-   **C Target:** C has no native closures, dynamic strings, or garbage collection. Compiling nested functions to C requires **closure conversion (lambda lifting)**: extracting captured variables into an environment struct. Because C has no automatic memory management, targeting C is only feasible under the **JSOL-C profile**, a stricter subset of the Managed profile that introduces explicit memory primitives (`JSOL.set`/`JSOL.unset`) and requires static memory declaration at point of use. This profile is specified in `LANGUAGE_SPEC_NEXT.md` and `ROADMAP.md`. The JSOL-C profile is not a separate language: anything valid in JSOL-C is automatically valid in Managed, never the reverse.
-   **Rust & C++:** Not realistic via regex transformation alone. Rust’s lifetime/ownership model and C++ template/RAII resolution require genuine semantic analysis (ASTs and symbol tables). The practical way to reach these languages is by compiling JSOL to C first and leveraging native FFI bindings.

## The JSOL-C Leverage Effect

On its own, JSOL-C seems inefficient: plain C requires manual memory management (`JSOL.set`/`JSOL.unset`), runtime dynamic string libraries, and closure structs.

However, **JSOL-C is a leverage target, not a standalone target.** C remains a foundational systems language and a uniquely well-supported compilation target across diverse toolchains.

```text
              ┌─► C++ / Objective-C (Direct compilation)
              ├─► WebAssembly (via Emscripten / WASI SDK)
[JSOL Source] ──► [JSOL-C Backend] ──► [C Source] ┼─► LLVM IR (via Clang flag)
              ├─► Rust / Go / Swift (via FFI / CGO)
              └─► Zig / Nim / Vala (via Native C interop)
```

Once JSOL-C emits valid C code, dozens of low-level and systems targets become reachable with **minimal marginal effort**.

Crucially, `JSOL.set`/`JSOL.unset` are JSOL-C–only primitives; in Managed targets (JS, PHP) they compile to no-ops, allowing the exact same source codebase to be tested for memory discipline without sacrificing the safety of a garbage collector.

### Why JSOL-C Matters for Computer Science Education

For CS educators and students, building a JSOL-C backend offers a well-bounded, pedagogically rich compiler design problem:

1.  **Lambda Lifting & Scope Resolution:** Implementing explicit closure conversion under deterministic constraints.
2.  **Explicit Memory Profiles:** Designing source-level primitives (`JSOL.set`/`JSOL.unset`) that compile to no-ops in JS/PHP (the host GC handles reclamation automatically), but emit explicit allocation/free logic in C.
3.  **Target Cascading:** Demonstrating how targeting an Intermediate Representation (C) unlocks WebAssembly, LLVM, and modern systems languages without rewriting the frontend linter/lexer.

## Curated Target Reference Guide

| Language | Paradigm | Key Structural Differences | JSOL Difficulty (1–5) | Key Challenge |
| --- | --- | --- | --- | --- |
| **TypeScript** | Static / Structural | Identical to JS with type signatures | **1 (Near-native)** | Strip or emit type annotations. |
| **Python** | Dynamic | Indentation blocks, `and/or/not` | **3 (Medium effort)** | Converting `{}` to indentation depth via block tracking. |
| **Go** | Static / Imperative | No classes, strict type assertions | **3 (Medium effort)** | Requires runtime helpers for dynamic operators. |
| **C#** | Static / OOP | Properties, LINQ, `dynamic` keyword | **3 (Medium effort)** | Mapping dynamic logic via `dynamic` or `System.Object`. |
| **Java** | Static / Strict OOP | Class-enforced, no free functions | **3 (Medium effort)** | Wrapping top-level logic in container classes. |
| **C** | Static / Procedural | No GC, no closures, manual memory | **4 (High effort)** | Requires context structs for closures and explicit memory primitives. |
| **Rust** | Static / Ownership | Lifetimes, strict borrow checker | **5 (Paradigm Break)** | Unfeasible via regex; reachable only via C FFI. |
| **WebAssembly** | Bytecode Target | Stack-based virtual machine | **5** | Requires C backend first; via C it drops to 1. |

## An Invitation to Extend

JSOL’s transpilation pipeline is deliberately modular: the lexer and linter clean and validate source logic independently of the code generator.

Adding a target language means defining a single `<language>-compiler.jsol` file containing substitution rules, plus a configuration entry in `targets.json`. Core logic remains untouched.

If Python, Go, C#, or a custom backend is useful for your research or coursework, feel free to fork the repository, write the target definition, and ship it.

## Appendix: Extended Target Exploration

This reference list presents potential transpilation targets beyond the core set discussed above. It is provided for exploratory discussion and relative comparison, not as a roadmap commitment.

### Difficulty Scale (1–5):

-   **1** = Minimal effort / Near-native (dialect of JS, or direct compilation flag via JSOL-C)
-   **2** = Low effort (close syntax, 1:1 wrapper mapping, or thin FFI layer)
-   **3** = Medium effort (static typing, wrapper classes, indentation tracking, or helper runtimes)
-   **4** = High effort (manual memory, struct generation, or lambda lifting)
-   **5** = Paradigm break (unfeasible via AST-free substitution alone)

| Language | Presence (1–5) | Trend (1–5) | Key Differences from C-like Languages | Standalone Difficulty (0–5) | Difficulty via JSOL-C (1–5) |
| --- | --- | --- | --- | --- | --- |
| **JavaScript** | 5   | 5   | Wrapper mapping (`Str.*`, `Arr.*`), isolation block processing, string concatenation rules. | **0** (Shipping) | —   |
| **PHP** | 5   | 3   | `$` variables, `use()` for closures, `array_*` functions instead of method calls. | **0** (Shipping) | —   |
| **TypeScript** | 5   | 5   | Superset of JS with static types, interfaces, generics. Compiles natively to JS. | **1** | —   |
| **Google Apps Script** | 3   | 3   | JS dialect with Google Workspace APIs integrated; sync-only execution. | **1** | —   |
| **Python** | 5   | 5   | Indentation-based, `and/or/not` operators, `None/True/False` casing. | **3** | —   |
| **Go** | 4   | 4   | No classes, explicit error returns, `func` keyword. Requires dynamic operator helpers. | **3** | **2** (via cgo) |
| **C#** | 4   | 4   | Properties, LINQ, `dynamic` / `System.Object` escape hatch, value vs. reference types. | **3** | —   |
| **Java** | 5   | 3   | Everything in classes, strict static typing, `java.util.function` for closures. | **3** | —   |
| **Kotlin** | 3   | 4   | Extension functions, data classes, null safety. Similar to Java but cleaner. | **3** | —   |
| **Swift** | 3   | 3   | Optionals, protocol-oriented, ARC memory management, labeled parameters. | **3** | **2** (Native C import) |
| **Dart** | 2   | 4   | Null safety, async/await, mixins. Syntax very close to modern JS. | **2** | —   |
| **Lua** | 2   | 3   | `then/end` blocks, 1-indexed arrays, `nil` instead of `null`, tables as primary structure. | **3** | —   |
| **Ruby** | 3   | 2   | `end` keywords, no semicolons, `nil`, blocks/procs mapping to closures. | **2** | —   |
| **Scala** | 2   | 2   | Hybrid OOP/Functional, case classes, pattern matching. | **3** | —   |
| **C** | 4   | 2   | No objects, no native dynamic strings, no GC, no closures, manual memory. | **4** | **1** (Target itself) |
| **C++** | 4   | 3   | Classes, templates, RAII, operator overloading. | **4** | **2** (Restricted C++) |
| **Objective-C** | 2   | 1   | Smalltalk-style messaging (`[obj method]`), ARC, C superset. | **4** | **1** (Direct C superset) |
| **Rust** | 3   | 4   | Ownership/borrowing, lifetimes, no GC, pattern matching, no null. | **5** | **2** (via `unsafe` C FFI) |
| **Zig** | 1   | 3   | No GC, no classes, manual memory, direct C interop. | **4** | **2** (Direct C interop) |
| **Nim** | 1   | 2   | Indentation or braces, compiles natively to C. | **3** | **2** (Compiles to C) |
| **Vala** | 1   | 1   | C-like syntax compiling to C with GObject ARC runtime. | **3** | **1** (Compiles to C) |
| **Haxe** | 1   | 2   | Cross-platform compiler target with clean OOP grammar. | **2** | **2** (Native C module) |
| **Elixir** | 1   | 3   | Functional pure, immutability, pattern matching, `do/end` blocks, no loops. | **4** | —   |
| **Haskell** | 1   | 1   | Functional pure, lazy evaluation, monads, immutability. | **5** | —   |
| **Clojure** | 1   | 1   | Lisp prefix notation, immutability, persistent data structures. | **4** | —   |
| **R** | 2   | 3   | Vectorized operations, `<-` assignment, 1-indexed arrays. | **4** | —   |
| **Julia** | 1   | 3   | `end` keywords, 1-indexed, multiple dispatch model. | **3** | —   |
| **Solidity** | 1   | 2   | No floats, gas metering per operation, integer-only domain. | **4** | —   |
| **WebAssembly** | 3   | 4   | Binary stack machine. | **5** | **1** (via Emscripten/WASI) |
| **LLVM IR** | 5   | 5   | Intermediate representation. | **5** | **1** (via Clang flag) |

### Notes on the table

-   **All score columns use a single-digit 0–5 scale** followed by a qualitative note. This ensures alphabetical sorting of the numeric prefix aligns with the intended ordinal order.
-   **Presence and Trend scores** (1–5 scale) reflect qualitative market awareness, repository prevalence, and active adoption reports as of 2025–2026. They are intended for rough sorting, not precise measurement.
-   **The JSOL Difficulty score reflects today's reality**: the effort required to build a target compiler from scratch with the current regex-based, AST-free pipeline, assuming no JSOL-C backend exists yet. Several languages in this table (Objective-C, C++, D, Nim, Zig, Vala, Haxe, Rust, Go, Swift, WebAssembly, LLVM IR) will see their effective difficulty drop dramatically if JSOL-C is implemented. See the next section for that analysis.
-   **"C-like"** here means the language uses C-style curly braces (`{}`), semicolons, and similar control structures. Languages marked "Not C-like" use indentation, `end` keywords, or Lisp-style prefix notation. This distinction is about syntax only; it does not imply a language is more or less suitable as a JSOL target.
-   **JavaScript and PHP are scored 0 in the table because they are already shipping targets.** The effort to build them from scratch would be approximately 2 on this scale: JSOL→JS involves wrapper mapping (`Str.*`, `Arr.*`, `Map.*`, `Bit.*`, `Cast.*`), `JSOL.use`/`JSOL.closure` resolution, `JSOL.JS`/`JSOL.PHP` block processing, and `+""+` concatenation enforcement. The JSOL 0.2.90 JS compiler is 164 lines, plus the ~500-line custom Regex implementation shared across targets.
-   **TypeScript and Google Apps Script are scored 1**, as they are near-native dialects where JSOL transformations apply with minimal additional rewriting from the current JS implementation.
-   **WebAssembly is scored 5 in the curated table** because direct generation from JSOL is not feasible without first going through C. Its score drops to 1 in the appendix table once JSOL-C exists, via Emscripten/WASI.
-   **Rust via JSOL-C Note**: Rust's difficulty drops to 2 via C FFI by generating C ABI bindings wrapped in `extern "C"` and `unsafe` blocks. It does not produce native, idiomatic Rust borrow-checked code.

* * *

_This document was produced with systematic AI co-piloting as described in [`AI_ENGINEERING_METHODOLOGY.md`](AI_ENGINEERING_METHODOLOGY.md)._

---

*JSOL v0.2.90 — 2026-08-12, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*