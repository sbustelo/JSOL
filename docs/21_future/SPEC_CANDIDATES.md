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

### Custom type prefixes: minimum length as the disambiguation rule

- **First encountered in:** evaluating proper support of hex numbers and
  CSS-legal color syntax (`#rrggbb`, `rgb()`, `hsl()`, `oklch()`, etc.) as
  first-class values for color-science examples, and revising the decisions for JSOL-X's `$p` (percentage) prefix proposal.
- **Proposal:** the kernel/core type prefixes (`$s`, `$q`, `$n`, `$i`,
  `$b`, `$a`, `$m`, ...) can stay as short as 1 character, exactly as today.
  Any *custom* type prefix — one that is not part of the kernel — must be
  at least 3 characters, without clashing with the core types (`$numeric` would pass against `$number`; `$num` would not) . `$c` was reserved/ambiguous (color? currency?
  circle?); `$cur` / `$currency`, `$col` / `$color` are not, and cannot collide with a kernel
  prefix. Same reasoning fixes `$g` for angle (already close to `$a` as short for `arr`/`array`): `$ang` / `$angle` has no such collision.
- **Framing:** JSOL-X's `$p` (percentage) stops being a special case bolted onto the language for Excel's sake, and becomes one *flavor* of custom type among others (a color-science flavor, a future finance flavor, etc.), all governed by the same length rule.
- **Open problem this does not solve on its own:** the rule prevents
  custom-vs-kernel collisions, but not custom-vs-custom collisions across
  independently developed flavors (e.g. two different domains both wanting
  `$ang` for unrelated things). A solution would be a single registry of
  reserved custom prefixes, documented in one place, the same "single
  source of truth" problem already flagged for the docs in general.
- **Design tension:** low. This is a naming/lexer convention, not a new
  runtime capability by itself, but it has real operational weight because
  type prefixes already drive REPL/contract input coercion (see the
  digit-sum.jsol.js $s-vs-$q bug in the language's own commit history) —
  so a future `$color`/`$angle` custom type needs its own coercion and
  (for the interpreter) its own parsing/rendering logic, not just a name.
  Related: see `INTERPRETER_BACKLOG.md`, "Custom Data Types" section.
- **Initial verdict (2026-08-13):** Lean **accept** the length rule itself.
  Still needs the registry mechanism designed before any real custom type
  ships.
- **Status:** PENDING REVIEW


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

---

## Resolved

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
- **Status:** RESOLVED (v0.2.92). Included in both JS and PHP compilers as a native transpilation rule to handle argument signature asymmetry (`s.split(d)` vs `explode(d, s)`).

---

*JSOL v0.2.92 — 2026-08-13, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*