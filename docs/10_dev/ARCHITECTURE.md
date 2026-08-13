# Architecture: Why the Restrictions Pay For Themselves

JSOL's grammar (see [LANGUAGE_SPEC.md](LANGUAGE_SPEC.md)) reads as a list of prohibitions. It isn't arbitrary austerity. Each restriction has a measurable engine-level consequence, and honestly, not all of those consequences are gains. This document lays out both sides.

## Gains

### No prototype chain traversal

Forbidding `class`, `this`, `new`, and inheritance means every value in JSOL is a flat dict or a primitive. In V8, the engine builds "hidden classes" for flat, static object shapes almost instantly, so property access (`$color.h`) is effectively O(1). In PHP, working with associative arrays and free functions is measurably cheaper than instantiating classes with constructors and visibility rules.

### Zero DOM coupling, by construction

JSOL code cannot reference `window` or `document` — the grammar has no form that reaches them. That means JSOL execution structurally cannot trigger a browser reflow or repaint. Every millisecond spent inside a JSOL function is CPU time, not graphics-pipeline time.

### No catastrophic backtracking

V8 and PCRE are different regex engines. A pattern that resolves in 2ms in one can trigger catastrophic backtracking in the other (ReDoS), hanging a request. By excluding native regex from business logic and requiring procedural string parsing (explicit loops over indices) instead, execution time stays linear and deterministic — O(n), guaranteed, in both targets.

### No optional-chaining overhead

`if ($obj !== null && $obj.prop)` is more typing than `$obj?.prop`. At the bytecode level, though, explicit null checks tend to be easier for a JIT compiler to optimize than the desugaring machinery optional chaining requires under the hood. The verbose form isn't just safer to transpile, it's not meaningfully slower to run, and sometimes faster.

## Costs

### Single-thread blocking

No `async`, `await`, `Promise`, or Worker API inside JSOL means JSOL is strictly synchronous. A JSOL computation with 10 million iterations (mapping every pixel of a 4K image, say) will freeze the tab until it completes. There's no way to delegate JSOL work to a background thread *from inside JSOL* without breaking PHP parity, because async control flow has no shared syntax between the two targets.

**The correct pattern is Orchestrator/Engine, not a JSOL feature:**

- **Engine (JSOL)**: a pure function, `const $mapPixel = function($r, $g, $b, $a) { ... return $newColor; };`
- **Front-end orchestrator (native JS)**: reads the DOM, extracts `ImageData` from a canvas, spins up a `Worker`, chunks the array, and calls the transpiled `$mapPixel` from inside the worker, off the main thread.
- **Back-end orchestrator (native PHP)**: receives an image file, uses GD or Imagick, iterates pixels, and calls the *same* transpiled `$mapPixel` function, server-side.

JSOL doesn't need to know what a thread is. Isolating the math from the orchestration means the single-thread limitation is never JSOL's problem — it's an application architecture problem, solved natively on each side, outside the `.jsol` file.

### More GC pressure on sustained workloads

Without classes or `this.state`, all state passes explicitly between function calls. Processing large arrays means copying or passing references repeatedly instead of mutating one long-lived object. In applications that run this kind of processing continuously, that can mean more frequent garbage-collection pauses than an equivalent stateful, object-oriented implementation would have.

## The net argument

None of the gains above were the primary goal. The primary goal was transpilation safety: a grammar simple enough that a regex-based compiler can move it between engines without an AST. That the same restrictions also tend to produce faster code isn't a coincidence — restrictions chosen for cross-engine determinism tend to be restrictions that also collapse toward primitive CPU operations, because primitive operations are exactly the things that behave identically across engines. The costs (blocking, GC pressure) are real and are the price for that determinism; JSOL doesn't pretend otherwise.

---

*JSOL v0.2 — 2026-08-07, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*