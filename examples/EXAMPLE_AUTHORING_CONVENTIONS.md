# Example Authoring Conventions

This document defines the structural conventions every file in `examples/` must
follow. It complements `doc/10_dev/JSOL_AI_INSTRUCTIONS.md` and
`EXTENDING-SEMANTIC-PARITY.md` — this file governs *format and process*, those
govern *language semantics*. When in doubt, semantics wins; this file exists so
every example (human- or AI-authored) is structurally identical.

## 1. File header: the pragma line

Every example starts with a single-line pragma declaring the JSOL version the
file targets:

```javascript
// @JSOL v0.2.91
```

### Forward-declaring JSOL-X / JSOL-C compatibility

JSOL-X and JSOL-C do not exist yet — there is no reference compiler for
either. We can still anticipate, at authoring time, whether a given example's
constraints make it *likely* to also be valid JSOL-X and/or JSOL-C source. When
that's the case, add a second pragma-adjacent comment line naming which
variant(s) are anticipated, plus a plain-language note that this is
unverified:

```javascript
// @JSOL v0.2.91
// @anticipates: JSOL-X, JSOL-C
// This is valid JSOL. Given its constraints it is expected to also be valid
// JSOL-X and/or JSOL-C, but no reference compiler exists yet to confirm this.
// Left here for future validation once one exists.
```

If an example only anticipates one variant, name only that one. If an example
has no reasonable claim to either (e.g. it depends on something clearly out of
scope for X or C), omit the `@anticipates` line entirely — don't guess.

This is a forward-compat bookkeeping mechanism, not a compiler feature. Nothing
enforces it today; it exists so that when JSOL-X and JSOL-C compilers exist,
there's already a tagged corpus to run against them instead of re-auditing files from scratch.

## 2. Description block

Immediately after the pragma:

```javascript
/**
 @description

Markdown-formatted prose goes here. No leading asterisk on each line — the
opening `/**` and closing `*/` must be alone on their own lines, nothing else
on either. That exact shape (and only that shape) is the signal to expect
Markdown inside the block.

Basic Markdown is expected to be usable here: *italics*, **bold**, and
possibly links. There is no reference renderer yet (the REPL/table tool may
eventually have a WYSIWYG markdown editor for this), so keep formatting
simple and don't rely on anything exotic until there's an implementation to
verify against.

*/
```

Rule: the per-line leading asterisk convention (common in JSDoc) is explicitly
**not** used here, because it adds noise to what's meant to be readable
Markdown source, not a code-comment convention.

## 3. Contract block (optional)

A file may optionally declare example input/output cases via `@contract`,
directly after the description block:

```javascript
/**
 @contract
 {
   "cases": [
     { "$qTargets": 2, "$nNativeCostSetup": 2, "$nJsolCostSetup": 6, "$nNativeCostIteration": 0.8, "$nJsolCostIteration": 1 },
     { "$qTargets": 4, "$nNativeCostSetup": 2, "$nJsolCostSetup": 7, "$nNativeCostIteration": 0.8, "$nJsolCostIteration": 2 }
   ]
 }
*/
```

`cases` is a JSON array, and each entry can take one of two shapes, both
already accepted by the REPL today:

- **Shorthand** — a flat object of parameter names (with their type
  prefixes) directly at the top level, as above. This only pre-fills a row's
  *inputs*; it tests cross-target parity — that every compiled target
  produces the same result for the same input, without asserting what that
  result should be. Which targets are compiled against is whatever the
  compiler supports at the time; this convention doesn't assume any fixed
  set.
- **Full form** — an object with top-level `in` and `expect` keys. `in`
  holds the parameter object exactly as in the shorthand; `expect` holds
  the expected output, keyed by output name (`_result` for a single return
  value). This additionally tests correctness — that the (parity-agreed)
  result actually matches what's expected, not just that all targets agree
  with each other:

```javascript
/**
 * @contract
 * {
 *   "cases": [
 *     { "in": { "$sCardNumber": "1234 5678 9100 1234" }, "expect": { "_result": false } },
 *     { "$sCardNumber": "4509 9535 6623 3704" }
 *   ]
 * }
 */
```

A file can mix both shapes across its `cases` array — some entries parity-only,
others parity-plus-correctness — as in the example above.

The REPL already consumes `cases` today: each one is loaded as a pre-filled
row in the input/output table, plus one additional blank row for manual
entry. This is not purely forward bookkeeping for a future test runner —
declaring `cases` has an immediate, visible effect in the current tool.

## 4. The code itself

After the pragma and comment blocks, the JSOL source follows.

### Hard constraint: stay inside the current spec

Every example must compile against the *current* spec — nothing anticipated,
nothing hacked around. If the natural solution to a problem needs something
the spec doesn't have yet, that is itself the finding: document it as a
candidate in `SPEC_CANDIDATES.md` and solve the example with what's actually
available. This is how the missing critical `Str.*` and `Math.*` methods were
found in the first place — the examples are a stress test of the spec, not
just a demo of it.

### No escape-closures

If something isn't supported, never reach for a closure or native
language feature to route around the gap. That reintroduces the exact
cross-target asymmetry the whole project exists to eliminate, and it hides a
real spec gap behind a working example instead of surfacing it.

### Prefer closed-form expressions over native operators with known asymmetry

Where a native operator has confirmed divergent behavior across compilation
targets, don't use it — derive a closed-form expression from primitives
already confirmed in the spec. This rule applies regardless of which targets
are involved or how many are currently supported — it's a property of the
operator, not of a specific pair of engines. Example, from
`hsb-to-rgb.jsol.js`: instead of the native `%` operator (divergent across
targets — see `rgb-to-hsb.jsol.js` for the specifics of that divergence),
modulo is computed as:

```javascript
// $nHuePrime mod 2, as a closed-form expression instead of a loop:
// mod(a, n) = a - n * floor(a / n). Never touches the native % operator
// (divergent across compilation targets — see rgb-to-hsb.jsol.js for the
// specifics), and needs no primitive beyond Math.floor, already confirmed
// in the spec.
const $nHuePrimeMod2 = $nHuePrime - (2 * Math.floor($nHuePrime / 2));
```

If no honest closed-form workaround exists with currently-confirmed
primitives (as happened with OKLCH-RGB needing sin/cos/atan2), the example is
blocked, not hacked — document the blocker and move on.

---

*JSOL v0.2.93 — 2026-08-18, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*