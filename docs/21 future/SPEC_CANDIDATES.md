# JSOL Core Vocabulary Candidates

This document is separate from `LANGUAGE_SPEC.md` and `LANGUAGE_SPEC_NEXT.md`
on purpose. Those two are the single source of truth for what JSOL *is*
today and what is *committed* for the next version. This file is neither:
it is a running log of methods, keywords, or constructs that writing real
`examples/` surfaced as missing, together with an initial design verdict
recorded at the moment the gap was found.

Nothing here is part of the language until it is explicitly promoted into
`LANGUAGE_SPEC_NEXT.md` and implemented in the compiler. This file exists so
that promotion decisions are made deliberately, weighing JSOL's core design
pillars (determinism, JS/PHP parity, minimal surface area) against
convenience, rather than reactively every time an example is inconvenient
to write.

Each entry stays until a decision is made, then moves to the "Resolved"
section at the bottom with the outcome.

---

## Pending

### `Arr.copy($a)`

- **First encountered in:** `examples/05-sorting-searching/bubble-sort.jsol.js`, `insertion-sort.jsol.js`
- **Current workaround:** `Arr.slice($a, 0, Arr.count($a))`
- **Design tension:** Pure sugar over an existing kernel primitive (`Arr.slice`).
  Adds no new capability and no new JS/PHP parity surface, since `Arr.slice`
  already has to be correct. Every additional method is one more thing a
  newcomer has to learn and one more thing to keep in parity forever.
- **Initial verdict (2026-08-13):** Lean **reject**. "Slice the full range"
  is already the idiomatic way to copy an array in several reference
  languages (Python's `a[:]`), so this is a documentation problem
  ("here is the idiom for a copy"), not a missing-primitive problem.
- **Status:** PENDING REVIEW

### `Str.split($s, $delimiter)`

- **First encountered in:** `examples/06-string-algorithms/reverse-word-order.jsol.js`
- **Current workaround:** Manual character-by-character scan, building an
  array by hand and flushing on each delimiter match (~15 lines for what
  is a single call in JS, PHP, and Python).
- **Design tension:** Not sugar over an existing primitive — no combination
  of `Str.len` / `Str.sub` / `Str.indexOf` reaches this in a single call,
  every use site re-implements the same scan. It is also a genuinely
  fundamental string operation (CSV fields, query strings, path segments,
  tag lists), likely to recur across many future examples, not a one-off
  convenience. Real design cost: PHP's `explode()` and JS's `.split()` do
  not share exact limit/argument semantics, so the wrapper needs a
  carefully specified contract, the same kind of work already done for
  `Str.sub` / `Str.char`.
- **Initial verdict (2026-08-13):** Lean **accept**. High reuse value,
  category is "missing fundamental," not "missing convenience."
- **Status:** PENDING REVIEW

---

## Resolved

*(none yet)*

---

*JSOL v0.2.91 — 2026-08-13, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*