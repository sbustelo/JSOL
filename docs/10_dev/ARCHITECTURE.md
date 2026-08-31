# JSOL Architecture: Scope, Design, and the AST Question

## 1. The Design Scope

JSOL was not created to build web servers, operating systems, or UI components. It was designed as a lightweight business-logic _lingua franca_ for zero-dependency ecosystems. Its primary mandate is **Deterministic Parity:** identical inputs must produce bit-for-bit identical outputs across multiple targets (JS, PHP, Python, etc.), ensuring that the math running in the client's browser perfectly matches the logic on the backend.

To achieve this, the language is heavily restricted. Forbidding `class`, `this`, `new`, and inheritance means every value in JSOL is a flat dict or a primitive. It relies on a closed set of primitive wrappers (`Str.*`, `Math.*`, `Arr.*`) to normalize the divergent behaviors of underlying language runtimes.

## 2. The Elephant in the Room: Why no AST?

You may be asking: *"Why are you reinventing the wheel with regular expressions, string parsing, and flat symbol tables? Just build an Abstract Syntax Tree (AST) and be done with it."*

And from a compiler-theory perspective, _you would be absolutely right._ Tracking scopes, hoisting variables, and injecting code is trivial when the source is parsed into a hierarchical tree in memory. But avoiding the AST is a foundational trade-off that defines the JSOL's experiment, which started as a simple compiler capable of producing PHP with only 25 lines, and JS with just 12.

### A. Zero Dependencies and Embeddability
To implement a true AST, you need a full JavaScript parser, which is far from free:
- A parser like Acorn would add megabytes of dependencies to the Node environment.
- Compiling JSOL via PHP would require rewriting or importing a massive JavaScript parser in PHP.
Eliminating full grammar parsing allows the compiler to remain ultra-lightweight, dependency-free, and directly embeddable within constrained execution environments. You should be able to drop just the JSOL compiler scripts onto any environment and run them instantly.

### B. The Restricted Grammar Trap
JSOL is not a general-purpose compiler; it enforces a strict, domain-specific subset (which in many cases as using the $ sigil for variables, may need to be the worst from all possible targets!). The language forbids variable shadowing, mandates strict prefixes, and demands fixed patterns for control structures. JSOL forces the developer to be Spartan precisely so the compiler doesn't need an AST to understand the code. The rigidity of the syntax compensates for the mechanical simplicity of the lexical compiler, which in turn makes easier to achieve the guarantee of semantic parity.

### C. The Balance of Technical Debt
JSOL's desing decisions led to building a Symbol Table and shadowing mechanisms using a top-down text scanner. That makes writing the compiler significantly harder, but shifts simplicity to the user and the deployment pipeline. The compiler remains (by vision and design) a set of plain text scripts that execute faster than the alternative, because they map linearly rather than building and traversing massive memory trees.

## 3. Conclusion: An Empirical Experiment

In the end, JSOL is an experiment that I stubbornly decided to start and mantain. As it evolves and tries to tackle more complex scenarios, it continuously accumulates complexities. For each new barrier that needs to be addressed, the decision process is simple: 
- leave that complexity out of scope, 
- absorb it using a mechanism true to the original zero-dependency spirit, or
- admit that it cannot be done and admit the ultimate defeat to that last Boss in the run.

At some point, the conditions required by the vision might become irreconcilable with the physical limits of AST-free parsing (or any other highly questionable design decision), and the attempt may need to be abandoned. This is the fate of many ambitious project that we never hear about due to survivorship bias. 

However, if JSOL ultimately fails embarrassingly (as is entirely possible), I am determined it will at least serve as a rigorously documented empirical warning. It will clearly define the exact boundary of how far a stateless, regex-driven, dependency-free isomorphic compiler can go, and exactly where it breaks. It will be a well-documented failure :)

> _“If you can't be a good example, then you'll just have to be a horrible warning.” ― Catherine Aird_

* * *

## Architecture: How the Restrictions Pay For Themselves

JSOL's grammar (see [LANGUAGE_SPEC.md](../02_LANGUAGE_SPEC_CURRENT.md)) reads as a list of prohibitions. It isn't arbitrary austerity. Each restriction has a measurable engine-level consequence, and honestly, not all of those consequences are gains. This document lays out both sides.

## Gains

### ✅ No prototype chain traversal

Forbidding `class`, `this`, `new`, and inheritance means every value in JSOL is a flat dict or a primitive. In V8, the engine builds "hidden classes" for flat, static object shapes almost instantly, so property access (`$color.h`) is effectively O(1). In PHP, working with associative arrays and free functions is measurably cheaper than instantiating classes with constructors and visibility rules.

### ✅ Zero DOM coupling, by construction

JSOL code cannot reference `window` or `document` — the grammar has no form that reaches them. That means JSOL execution structurally cannot trigger a browser reflow or repaint. Every millisecond spent inside a JSOL function is CPU time, not graphics-pipeline time.

### ✅ No catastrophic backtracking

V8 and PCRE are different regex engines. A pattern that resolves in 2ms in one can trigger catastrophic backtracking in the other (ReDoS), hanging a request. By excluding native regex from business logic and requiring procedural string parsing (explicit loops over indices) instead, execution time stays linear and deterministic — O(n), guaranteed, in both targets.

### ✅ No optional-chaining overhead

`if ($obj !== null && $obj.prop)` is more typing than `$obj?.prop`. At the bytecode level, though, explicit null checks tend to be easier for a JIT compiler to optimize than the desugaring machinery optional chaining requires under the hood. The verbose form isn't just safer to transpile, it's not meaningfully slower to run, and sometimes faster.

## Costs

### 👎 Single-thread blocking

No `async`, `await`, `Promise`, or Worker API inside JSOL means JSOL is strictly synchronous. A JSOL computation with 10 million iterations (mapping every pixel of a 4K image, say) will freeze the tab until it completes. There's no way to delegate JSOL work to a background thread *from inside JSOL* without breaking PHP parity, because async control flow has no shared syntax between the two targets.

**The correct pattern is Orchestrator/Engine, not a JSOL feature:**

- **Engine (JSOL)**: a pure function, `const $mapPixel = function($r, $g, $b, $a) { ... return $newColor; };`
- **Front-end orchestrator (native JS)**: reads the DOM, extracts `ImageData` from a canvas, spins up a `Worker`, chunks the array, and calls the transpiled `$mapPixel` from inside the worker, off the main thread.
- **Back-end orchestrator (native PHP)**: receives an image file, uses GD or Imagick, iterates pixels, and calls the *same* transpiled `$mapPixel` function, server-side.

JSOL doesn't need to know what a thread is. Isolating the math from the orchestration means the single-thread limitation is never JSOL's problem — it's an application architecture problem, solved natively on each side, outside the `.jsol` file.

### 👎 More GC pressure on sustained workloads

Without classes or `this.state`, all state passes explicitly between function calls. Processing large arrays means copying or passing references repeatedly instead of mutating one long-lived object. In applications that run this kind of processing continuously, that can mean more frequent garbage-collection pauses than an equivalent stateful, object-oriented implementation would have.

## ⚖ The net argument

None of the gains above were the primary goal. The primary goal was transpilation safety: a grammar simple enough that a regex-based compiler can move it between engines without an AST. That the same restrictions also tend to produce faster code isn't a coincidence: restrictions chosen for cross-engine determinism tend to be restrictions that also collapse toward primitive CPU operations, because primitive operations are exactly the things that behave identically across engines. The costs (blocking, GC pressure) are real and are the price for that determinism; JSOL doesn't pretend otherwise.

---

*JSOL v0.2.96 — 2026-08-25, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../../LICENSE)*