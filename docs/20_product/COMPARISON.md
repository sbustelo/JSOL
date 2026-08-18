# JSOL vs. the Alternatives

Before adopting JSOL, it's worth understanding why the standard industrial answers were considered and rejected.

## Haxe

The king of isomorphism. Write `.hx`, compile to JS, PHP, C++, and more.

**Why not**: requires installing the Haxe compiler (written in OCaml) at the OS level. That kills the zero-config philosophy of a lightweight PHP/JS environment. If your deployment target can't assume a build step exists, Haxe isn't an option, full stop.

## WebAssembly

Excellent for raw performance. Write in Rust or C, compile to Wasm.

**Why not**: requires a full toolchain, and the Wasm↔DOM communication boundary introduces real friction for anything that isn't pure number-crunching. For business rules and validation logic, it's substantial overhead for a problem that doesn't need it.

## JSON-driven math

Extract formulas into JSON: `{"sum": "a + b"}`.

**Why not**: works for simple algebra, collapses the moment you need loops or nontrivial branching. You end up designing a new, ad hoc, poorly specified programming language, hidden inside a JSON blob, with none of the tooling a real language gets.

## Feasibility matrix

| Approach | Zero-config | Handles loops/branching | Tooling support | Toolchain required |
|---|---|---|---|---|
| **JSOL** | ✅ | ✅ | ✅ (it's JS) | None |
| Haxe | ❌ | ✅ | ✅ | OS-level compiler |
| WebAssembly | ❌ | ✅ | ⚠️ (Rust/C toolchain) | Full build pipeline |
| JSON-driven math | ✅ | ❌ | ❌ | None |

## The tradeoff JSOL makes

Every alternative above buys generality (arbitrary language targets, arbitrary control flow, arbitrary performance ceiling) at the cost of either a toolchain or expressiveness. JSOL buys the opposite: it gives up expressiveness (no functional methods, no async, no OOP) and keeps zero toolchain, by restricting itself to exactly the subset that a regex-based transpiler can move safely between JS and PHP. See [docs/LANGUAGE_SPEC.md](../02_LANGUAGE_SPEC_CURRENT.md) for what that subset actually is, and [docs/ARCHITECTURE.md](../10_dev/ARCHITECTURE.md) for what that restriction costs and buys at the engine level.

---

*JSOL v0.2 — 2026-08-07, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*