# Extending JSOL to Other Languages (Exploratory)

This is a roadmap sketch, not a commitment. JSOL today targets JS and PHP because that's what the regex-based, AST-free compiler pipeline was built for. Whether that pipeline generalizes to other languages depends entirely on how close each language's syntax is to the C-family shape JSOL already assumes.

## Feasibility, regex-only compilation

| Language | Basic transforms | Type system | Closures | Memory model | Overall feasibility |
|---|---|---|---|---|---|
| Python | Easy | Dynamic | Native | GC | 🟢 Very high |
| PHP | Easy (done) | Dynamic | Native | GC | 🟢 Shipping |
| JavaScript | Easy (done) | Dynamic | Native | GC | 🟢 Shipping |
| Go | Easy | Static | Native | GC | 🟡 Medium-high |
| C# | Easy | Static | Native | GC | 🟡 Medium-high |
| Java | Easy | Static | Interfaces only | GC | 🟡 Medium |
| C | Easy | Static | Not native | Manual | 🔴 Medium-low |
| Rust | Easy | Static | Native | Ownership | 🔴 Medium-low |

## Reading the matrix

**Straightforward**: Python, Go, C#. Python is close enough to JS/PHP in dynamism and native closures that a regex transpiler is a realistic near-term target. Go and C# are statically typed, which adds friction, but both have escape hatches (`interface{}`/`dynamic`) that avoid needing real type inference.

**Possible, with real effort**: Java (via `Map<String, Object>` and `java.util.function` to fake dynamism), C (requires generating structs and a small support runtime, since C has no native closures).

**Not realistic with regex alone**: Rust and C++. Rust's borrow checker and lifetimes require actual semantic analysis, not text transformation. C++ templates, overloading, and RAII are in the same category. Targeting either would mean abandoning the "no AST" constraint that makes JSOL's compiler as small and dependency-free as it is, which would mean it's not really JSOL's approach anymore, it'd be a different, heavier project wearing JSOL's syntax.

## The actual limiting factors, language-agnostic

1. **Type inference**, for any statically-typed target.
2. **Memory management**, for C/Rust specifically.
3. **Closures**, for C specifically (no native closures to lean on).

If JSOL's business logic stays strictly pure (no I/O, no side effects, which is already the rule), the ceiling for "compilable via regex plus a small support runtime" is higher than it looks. The constraint isn't really "which languages are hard," it's "which languages are close enough to JSOL's existing C-family shape that no AST is needed."

## This is an invitation, not a roadmap

C# in particular stands out as a plausible next target, given its `dynamic` escape hatch and native closures. Go and Python are right behind it. None of this is promised, scheduled, or in progress.

JSOL's compiler pipeline is deliberately modular: the lexer and linter don't know or care what target you're generating for (see the target-extensibility notes in the compiler's own architecture). Adding a language means writing one `<language>-compiler.jsol` file that takes already-masked, already-linted source and applies its own regex substitution rules, plus an entry in `targets.json`. Nothing about the core has to change.

If Python, Go, C#, or something not even on this list is useful to you, this is the license to go build it. No permission needed, no request to file. Fork it, write the target compiler, ship it under your own name if you want.

## Support

This project is maintained on personal time, for free, with no plan to charge for it. If a target you built, or JSOL itself, saved you real work and you want to say thanks, there's a "buy me a coffee" link at [your-link-here]. Entirely optional, never required.

---

*JSOL v0.2 — 2026-08-07, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*