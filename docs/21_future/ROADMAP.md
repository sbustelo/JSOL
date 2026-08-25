# JSOL Roadmap

This document tracks where JSOL is and what is next, in priority order.
See docs/DESIGN_PHILOSOPHY.md for the architectural vision.

## The Vision: The Lingua Franca of Business Logic

The definitive vision for JSOL (not realistic, but as a driver for better design decisions) is to achieve a universal, deterministic language for business logic that compiles to whatever is needed: from back-end & front-end programming languages, to Excel.
1. Universal Algorithms: Math, geometry, physics, and parsers.
2. Business Logic Parity: E-commerce rules, tax calculations, and state machines evaluated on client and server.
3. Executable Pseudocode: A superior replacement for academic and documentation pseudocode.

## Where we are: v0.2.96 (Pipeline Refactor & Isomorphic Convergence)

The engine has achieved fixed-point convergence across four target languages (JS, PHP, TS, Python) without relying on Abstract Syntax Trees.

A growing set of examples with contracts is used also to test isomorphic parity before every release.

## Next Steps (Path to v0.3.0 - The Stabilization Release)

JSOL v0.3 focuses on extending the strict domain semantic parity and opening the architecture for third-party extensions without in-line compilation.

### Phase 1: Linter & Dynamic Types (Completed)
* Decouple the type prefix matrix from hardcoded linter rules.
* Enable 3+ letter custom domain prefixes (e.g., $csrgb, $col) via the SSOT, paving the way for the Color Science extension packages.

### Phase 2: The Shadow Channel (JSOL.ok)
* Eliminate magic numbers (-1, NaN) from the data channel.
* Implement a secondary invisible channel ($JSOL_ok_varName) to handle fallible operations like Str.indexOf, Map.get, and Cast.toInt.

### Phase 3: Core Isomorphic Expansion
* Math.modX, Math.roundX, Math.logX: Force Excel-like resolution for divergent native operations.
* Map.get and Arr.sort: Fill critical gaps. Enforce explicit comparators for sorting to avoid target-specific defaults.

### Phase 4: Architectural Debt & Orchestration
* Universal Pragma Regex: Support custom profile pragmas (@JSOL-C, @JSOL-X) dynamically.
* PHP Auto-use: Automate lexical capture detection for closures to officially deprecate JSOL.use in business logic.
* Python Keyword Sanitization: Detect PEP-8 keyword collisions upon sigil stripping and safely suffix them (e.g., pass_).

## Beyond v0.3.0

Once the core is completely host-transparent and extensions like Color Science are proven to compile reliably as decoupled, cacheable libraries, JSOL will declare v0.3.1 and be open to research of JSOL-C strict memory profiles.

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

---

*This document was produced with systematic AI co-piloting as described in [AI_ENGINEERING_METHODOLOGY.md](../10_dev/AI_ENGINEERING_METHODOLOGY.md). AI was used for architectural stress-testing, cross-model validation, and drafting; all content has been reviewed for technical accuracy and adherence to project constraints.*

---

*JSOL v0.2.96 — 2026-08-25, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*