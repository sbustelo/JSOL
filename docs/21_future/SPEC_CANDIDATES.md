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


### Injected numeric coercion (`$i`/`$q` drift, `$n<digits>` precision)

- **First encountered in:** discussion of `$i` incremented by a non-integer
  step (`.05`). In JS and PHP this silently produces a float, no error,
  no warning. In C — the target `$q`/`$i`'s own naming comes from
  (`i` for a C `signed`/`unsigned int` iterator) — the same source would
  either truncate silently or misbehave depending on how the variable is
  declared on that side. Same JSOL source, three different numeric
  behaviors depending on target: a direct violation of Deterministic
  Parity, not a convenience gap like most other entries in this file.
- **Current workaround:** none. Nothing today prevents `$i`/`$q` from
  accumulating fractional drift; correctness depends entirely on the
  programmer never writing an operation that could introduce a fraction.
- **Proposal:** the compiler injects a coercion call at every assignment
  to a `$i`/`$q`/`$n<digits>` variable, rather than relying on the linter
  to catch it statically. Static analysis only catches the obvious case
  (`$i = 4.05`); it can't catch `$i = $i + $nOther`, where drift only
  shows up at runtime depending on `$nOther`'s value. Proposed shape,
  consistent with the `$_` reserved-name convention already established
  for `$_i` / `$_i_[Name]`: `$_castNumeric($value, "$i")` for integer
  types, `$_castNumeric($value, "$n2Tax", 2)` for a precision-suffixed
  `$n` (the digit after `$n` declares a fixed decimal count — same prefix
  extraction regex already stops at the first non-`[a-z]` character, the
  digit is read separately). The cast rounds *and* emits a warning when it
  had to.
- **Generalizes, doesn't just patch:** a single injected-coercion
  mechanism, parametrized by decimal count instead of "integer yes/no",
  covers `$i`/`$q` (0 decimals) and `$n<digits>` (fixed decimals) with one
  code path. This also makes the manual "multiply, round, divide" pattern
  in `invoice-tax-rounding.jsol.js` (`02-finance`) obsolete in the good
  sense — `$n2Tax` in the signature would get that for free instead of
  three hand-written lines per file that needs fixed rounding.
- **Open sub-decision:** wrap *every* assignment to a typed-numeric
  variable, or only ones where the right-hand side could actually produce
  a fraction (division, multiplication by a non-integer literal)?
  Wrapping everything is mechanical and consistent with the project's
  existing bias toward "simple over clever" (same bias that keeps the
  compiler regex-based instead of AST-based), but spends a check on
  operations that were already safe. Being surgical requires the compiler
  to understand the shape of the right-hand expression, which is the same
  category of work as the `Str.sub` positional-template DSL already
  accepted for Hito 3 of 0.2.94 — not a small ask, shouldn't be assumed
  free just because it's "more correct."
- **Dependency:** the warning mechanism itself needs its own
  domain/target entries in the SSOT (`console.warn` doesn't exist in
  PHP) — this isn't a special case, it's one more primitive for the
  cross-validation gate already defined in the 0.2.94 architecture plan,
  and a good early real test that the gate actually catches a missing
  target rule.
- **Initial verdict (2026-08-14):** Lean **accept** the injected-coercion
  mechanism itself — this touches the core determinism guarantee
  directly, it isn't optional polish. The wrap-everything-vs-wrap-risky-
  only question stays open and needs a decision before implementation,
  not during it.
- **Status:** PENDING REVIEW — highest priority of the pending entries so
  far, given what it protects.


### Custom type prefixes: minimum length as the disambiguation rule

- **First encountered in:** discussion prompted by wanting hex numbers and
  CSS-legal color syntax (`#rrggbb`, `rgb()`, `hsl()`, `oklch()`, etc.) as
  first-class values for color-science examples, and the same question
  showing up for JSOL-X's `$p` (percentage) prefix.
- **Proposal:** the kernel/core type prefixes (`$s`, `$q`, `$n`, `$i`,
  `$b`, `$a`, `$m`, ...) stay as short as 1 character, exactly as today.
  Any *custom* type prefix — one that is not part of the kernel — must be
  at least 3 characters. `$c` is reserved/ambiguous (color? currency?
  circle?); `$col` / `$color` is not, and cannot collide with a kernel
  prefix because no kernel prefix is 3+ characters. Same reasoning fixes
  `$g` for angle (already close to `$a` for array): `$ang` / `$angle` has
  no such collision.
- **Framing:** JSOL-X's `$p` (percentage) stops being a special case bolted
  onto the language for Excel's sake, and becomes one *flavor* of custom
  type among others (a color-science flavor, a future finance flavor,
  etc.), all governed by the same length rule.
- **Open problem this does not solve on its own:** the rule prevents
  custom-vs-kernel collisions, but not custom-vs-custom collisions across
  independently developed flavors (e.g. two different domains both wanting
  `$ang` for unrelated things). That still needs a single registry of
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

### `Math.sin` / `Math.cos` / `Math.atan2` (trigonometric functions)

- **First encountered in:** attempting `examples/09-color-science/oklch-to-rgb.jsol.js`
  and `rgb-to-oklch.jsol.js`, both abandoned because of this gap.
- **Current workaround:** none. `Math.pow($x, 0.5)` stands in for square
  root (already used in `01-basics/prime-check.jsol.js`), but no
  combination of `floor / abs / pow / min / max / round` can produce sine,
  cosine, or `atan2`. This is unlike every other entry in this file: those
  had an honest, if sometimes verbose, way to express the same result with
  existing primitives. This one genuinely cannot be done.
- **Design tension:** low on the "does JSOL need trig" question — any
  serious color-science, geometry, or signal-processing domain needs it,
  and OKLCH specifically (the color space this project already leans on
  for IPAX) is unreachable without it. The real design question is
  narrower: whether these map 1:1 to the target languages' native
  functions (`Math.sin`/`Math.cos` in JS, `sin()`/`cos()` in PHP — same
  shape as the existing `floor`/`abs`/`pow` mappings) or need their own
  wrapper considerations (e.g. `atan2`'s two-argument form, PHP's
  `atan2($y, $x)` matches JS `Math.atan2($y, $x)` argument order exactly,
  so this should be as direct as the rest of `Math.*`).
- **Initial verdict (2026-08-13):** Lean **accept**, this one is not
  really optional. Blocks: OKLCH-RGB conversion (IPAX), and by extension
  the "Custom Data Types" / color declarations further up this file.
- **Status:** PENDING REVIEW

### Map mutation (`Map.set` / growable dictionaries)

- **First encountered in:** attempting a Markov chain example (build an
  n-gram frequency dictionary from arbitrary input text — unknown keys in
  advance, keys added one at a time as new n-grams are seen).
- **Current workaround:** none clean. `Map.create()` is documented as
  producing an *immutable* dictionary (`LANGUAGE_SPEC.md`, "Creation of
  immutable dictionaries with Map.create()") — this isn't a missing
  method, it's a stated design choice. A frequency table with unknown
  keys ahead of time can be approximated with two parallel arrays (a
  `$aKeys` array searched linearly, a `$aCounts` array updated by index),
  the same technique `anagram-check.jsol.js` uses for a *fixed* 26-slot
  alphabet — but that only works because the alphabet is small and known
  in advance. For arbitrary vocabulary, the same technique degrades to
  O(n) lookup per insertion with no upper bound on n, which is a much
  uglier workaround than any other entry in this file, not just a more
  verbose one.
- **Design tension: real, not cosmetic.** This is not "convenience vs.
  surface area" like `Str.split`. Immutable dictionaries are plausibly
  load-bearing for the determinism/parity guarantees the whole project is
  built on — a mutable hash map is exactly the kind of shared, ordered,
  stateful structure that tends to produce iteration-order and
  aliasing bugs that diverge between a JS engine and a PHP engine (the
  same family of risk already flagged for `jsol-spec.json`'s rule
  ordering in the 0.2.94 plan). Adding `Map.set` needs to be evaluated
  against that risk explicitly, not decided on the strength of "an
  example needed it."
- **Initial verdict (2026-08-14):** No lean either way. Needs a real
  design conversation about whether growable maps compromise the
  determinism story, before anything is written for either side. Flagged
  as blocking a clean Markov chain example (INTERPRETER_BACKLOG.md).
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

## Rejected

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
- **Status:** REJECTED on v0.2.92. Could be re-considered if a stronger case arises.

---

*JSOL v0.2.92 — 2026-08-15, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*