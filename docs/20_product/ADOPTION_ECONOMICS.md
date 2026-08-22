# Adoption Economics: When JSOL Actually Pays Off

JSOL costs more to write than a native implementation. The isomorphism constraints (no functional array methods, no native rounding, no regex outside the reference engine, mandatory imperative loops) make a `.jsol` file more expensive to produce, line for line, than the equivalent hand-written JS, PHP or Python you are used to.

The honest question isn't "is JSOL better." It's "under what conditions does the extra upfront cost pay for itself, and under what conditions doesn't it." This document answers that with a model.

## The two costs, and why the second one is the one that matters

Writing the same algorithm by hand in `N` target languages has two components:

- **Development cost**: writing and reviewing the logic once per language, `N × D`.
- **QA cost**: verifying the `N` independent implementations actually agree, `N × Q`. This is the cost JSOL exists to eliminate, and it recurs on every single change, forever, for as long as the algorithm is maintained.

Writing the algorithm once in JSOL instead:

- **JSOL development cost**: writing the `.jsol` file itself, which is more expensive per line than a native implementation because of the isomorphism constraints (call this `S`, and expect `S > D`).
- **Host adaptation cost**: wiring the compiled output into each target's surrounding application code, `N × H`. This is comparatively cheap — it's plumbing, not logic.
- **QA cost**: verifying the algorithm once (`Q_jsol`). For a Level 1 implementation (no `JSOL.JS`/`JSOL.PHP`, no regex), this is close to free — the compiler's own fixed-point guarantee already covers it. For anything touching the Level 2 contract model, it's the cost of writing and running the contract once.

## The formula

Per **setup** (writing the algorithm for the first time):

```
Cost_native  = N × (D + Q)
Cost_jsol    = S + N×H + Q_jsol
```

Per **iteration** (every subsequent change to the algorithm):

```
Cost_native  = N × (d + q)
Cost_jsol    = s + q_jsol + N×h
```

Lowercase variants (`d`, `q`, `s`, `h`) represent the cost of an incremental change rather than a from-scratch implementation — smaller than their uppercase counterparts, but the same relative shape.

The break-even point, in number of iterations `I*` before JSOL's higher setup cost is paid back:

```
I* = (Cost_jsol_setup − Cost_native_setup) / (Cost_native_iteration − Cost_jsol_iteration)
```

Below `I*` iterations, native wins. Above it, JSOL wins, and keeps winning by a growing margin with every further change.

## What the formula says as `N` grows

`Cost_native`'s setup term scales linearly with `N` — every new target language is a full new implementation, full new QA pass. `Cost_jsol`'s setup term barely moves with `N`, because `S` (the algorithm itself) is written once regardless of how many targets consume it; only the cheap `N×H` wiring term grows. This is the mechanical reason JSOL's case gets stronger, not just "more convenient," as more target languages enter the picture. Today that's JS and PHP (`N=2`). The moment a third target ships (see `EXTENDING.md`), the same JSOL source that was borderline break-even at `N=2` becomes a clear win at `N=3` without a single line of the algorithm changing.

## The decision table

| Scenario | JSOL worth it? | Why |
|---|---|---|
| One algorithm, frozen, `N=2` | **No.** Port it by hand. | No iteration cost to recover, and two targets isn't enough for the setup-cost gap to close. |
| One algorithm, frozen, `N≥3` | **Yes**, and more so as `N` grows. | Setup cost gap shrinks per target added; native cost keeps growing linearly. |
| One algorithm, actively iterating, `N≥2` | **Yes**, more so with more expected iterations. | Every iteration where JSOL avoids `N×q` QA cost pays down the setup gap further. |
| Many frozen algorithms sharing one host/wiring layer | **Yes**, even though no single algorithm alone would justify it. | `N×H` (wiring) is paid once for the whole package, not once per algorithm — the shared host amortizes the setup cost across everything routed through it. |

## Case studies against the table

**Luhn's algorithm, alone.** Row 1. It's not going to change; the check digit math has been fixed since 1954. Don't justify adopting JSOL for Luhn in isolation on economic grounds — use it as a code-clarity example, not an ROI example.

**A full form-validation package** (Luhn, email, password strength, SemVer, whatever a given project needs, all sharing one host wiring layer). Row 4. No individual validator changes often, but bundled together under one `.jsol` file with one host adaptation, the shared `N×H` cost gets amortized across all of them. This is the case for treating "the whole form's validation," not "one validator," as the unit of adoption.

**IPAX's color-science and ergonomics engines.** Row 3, and the actual origin case JSOL was built for. The algorithms are under active iteration — precisely the situation where `N×q` recurs on every tuning pass, and where a hand-maintained JS/PHP pair had already produced the exact kind of divergence bug (`toFixed` vs. `round`) this document exists to prevent. The cost isn't development time, it's error cost: every iteration where the two implementations silently disagreed was a production accessibility bug, not a missed deadline.

**APCA.** Row 3, with a twist: JSOL isn't just reducing iteration QA cost here, it's positioning for `N≥3` before a third target even exists, because the value of "APCA transpiles cleanly to whatever language your stack uses" grows with every additional real-world target that appears. Adopting JSOL for APCA now is a bet that `N` grows, made cheap by the fact that `N=2` already justifies it on iteration grounds alone.

## The honest caveat

This model assumes `S`, `H`, and `Q_jsol` are stable, known quantities. In practice, `S` (the cost of writing isomorphism-constrained JSOL) drops over time as the core primitive set matures — a `.jsol` file written against a complete String/Number/Array/Dict primitive set is cheaper to write than one written today, while gaps like `pop`/`peek`/`sort` are still being discovered by trying to build real examples against it (see `ROADMAP.md`). Adopting JSOL today is, in part, a bet on that curve continuing to improve, same as adopting any young language or toolchain is.

---

*JSOL v0.2.95 — 2026-08-21, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](LICENSE)*