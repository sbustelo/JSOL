# JSOL Language Specification — v0.3 Target

This is the next spec, not the current one. `LANGUAGE_SPEC.md` describes what ships today. This document describes what gets locked for v0.3: names, syntax, and grammar decided now so that anything written against this spec stays valid JSOL through 1.0, with zero escape hatches.

**Explicitly out of scope for this milestone**: compiler self-hosting purity (Priority 4), JSOL-X (the Excel profile — separate spec, separate roadmap, not touched here beyond reserving the pragma), and full implementations of the business types (`$c`/`$p`/`$g`/`$t`/`$d`). What's in scope: making sure IPAX, and any `.jsol` file written today, never needs a `JSOL.JS`/`JSOL.PHP` escape hatch for anything this document covers.

---

## 1. The Namespace Revamp (mandatory, not deferrable)

`JSOL.*` is retired for anything with a clear domain. Six namespaces, hardcoded in the compiler:

| Namespace | Domain | v0.3 members |
|---|---|---|
| `Math.*` | FPU / float arithmetic | `Math.floor`, `Math.abs`, `Math.pow`, `Math.min`, `Math.max`, `Math.round` |
| `Str.*` | String manipulation | `Str.len`, `Str.sub`, `Str.char` (charCodeAt), `Str.fromChar` (fromCharCode), `Str.upper`, `Str.lower`, `Str.indexOf` |
| `Arr.*` | Sequential memory | `Arr.count`, `Arr.push`, `Arr.pop`, `Arr.shift`, `Arr.slice`, `Arr.indexOf` |
| `Map.*` | Hash maps (renamed from `Dict`) | `Map.create`, `Map.has`, `Map.keys` |
| `Bit.*` | Bitwise logic | `Bit.and`, `Bit.or`, `Bit.xor`, `Bit.not`, `Bit.shiftL`, `Bit.shiftR` |
| `Cast.*` | Type coercion | `Cast.toStr`, `Cast.toInt` |

`JSOL.dict(...)` becomes `Map.create(...)`. `JSOL.hasKey` becomes `Map.has`. `JSOL.count`/`JSOL.len` split by domain into `Arr.count`/`Str.len`. `JSOL.closure`/`JSOL.use` stay as-is — they're not domain operations, they're a language-level closure mechanism, no namespace fits better than the bare `JSOL.*` they already have.

This is Priority 0 from `ROADMAP.md`, confirmed non-optional: every day more code ships against `JSOL.count`-style naming is a day more expensive to migrate later. Doing it now, while the ecosystem is the compiler, the examples, and IPAX, is cheap. Waiting for v1.0 is not.

## 2. Type Prefix Matrix — locked for v0.3

**Implemented and enforced now:**

`$i` (index), `$q` (quantity), `$n` (number/float), `$s` (string), `$a` (array), `$m` (Map), `$b` (boolean), `$f` (function, typed-parameter position only), `$x` (regex, see §4), `$y` (byte/binary).

**Reserved, not implemented — linter rejects any use:**

`$c` (Currency), `$p` (Percentage), `$g` (Geometry/Angle), `$t` (Time/Duration), `$d` (Date).

Reserving without implementing is a mechanical linter rule, not a feature: any variable declared with one of these five prefixes fails compilation with a clear message ("`$d` is reserved for the future Date type, not yet implemented — use a descriptive name without a type prefix, or `$m` if this is actually a Map"). This is what makes the reservation real. Without an active rejection, someone writes `$dConfig` as a Map next month out of habit, and the letter is burned before Date ever ships.

**Function-name return-type prefix (style convention, not linter-enforced):**

A function's name may optionally be prefixed with the type it returns, prefix first: `$mCalculatePenalties`, `$bCheckPasswordRules`, `$cApplyDiscount`. Documented as convention in `LANGUAGE_SPEC.md`'s style section once this ships; no retroactive renaming required anywhere.

## 3. `JSOL.range()` — new `for` syntax, resolved entirely at compile time

```js
for (let $i of JSOL.range($from, $to, $step, $maxLimit)) {
    // body
}
```

This is not a function call. There is no runtime iterator, no generator, nothing named `range` exists in the compiled output. The compiler recognizes this exact syntactic shape and rewrites it directly into the target's native `for` loop at compile time.

**Semantics**: half-open interval, `$from` inclusive, `$to` exclusive — `JSOL.range(1, 5, 1)` produces `1, 2, 3, 4`, matching the convention most languages already use for range-style iteration, so nobody has to learn a new counting rule.

**`$maxLimit`**: optional fourth argument. For Managed and JSOL-C targets, it compiles into a runtime guard — if the loop would run more iterations than `$maxLimit`, it throws, rather than being silently ignored. This keeps behavior uniform across every target instead of being a real safety bound in one profile and a no-op comment in the rest. For JSOL-X specifically (out of scope for this document, noted for consistency), `$maxLimit` isn't optional at all — Excel unrolls the loop into physical rows, so the bound has to be a static literal known at compile time, not a runtime guard.

Compiled output, JS:

```js
for (let $i = $from; $i < $to; $i += $step) { /* body */ }
```

Compiled output, PHP:

```php
for ($i = $from; $i < $to; $i += $step) { /* body */ }
```

**Scope note**: this is the only `for...of` form the grammar accepts. It is not general support for `for...of` over arbitrary iterables — that reopens the iteration-order asymmetry risk already flagged for `for...in`/`foreach` elsewhere in the spec. Any `for...of` that isn't exactly `JSOL.range(...)` as its iterable is a linter error, not a silent pass-through.

## 4. Regex, resolved now, without waiting on the full reference engine

IPAX's actual production regex usage (`$parseHexToRGB` and anywhere else a `JSOL.JS`/`JSOL.PHP` pair exists solely to call a regex engine) is the concrete debt this spec exists to close. The pure-JSOL "safe" Thompson-construction engine (`ROADMAP.md` Priority 4) is a larger, separate project and doesn't need to exist for v0.3 to close this debt — what needs to exist now is a **stable name and calling convention**, so code written against it today doesn't change shape once the reference engine ships later.

```js
Regex.match($pattern, $str, $flags)
Regex.replace($pattern, $replacement, $str, $flags)
Regex.test($pattern, $str, $flags)
```

For v0.3, these compile to each target's native engine (`.exec()`/`preg_match()` under the hood) — this is the `"fast"` mode from `ROADMAP.md` Priority 4, available now under its permanent name, with the `"safe"` pure-JSOL mode arriving later as a second mode on the same call rather than a rename. Until Priority 6's contract model ships in full, any function calling `Regex.*` should carry the `// @UNVERIFIED-PARITY: <reason>` pragma already defined in `ROADMAP.md` — the honesty mechanism doesn't need the full test-runner infrastructure to start being useful today.

This is what actually retires the `JSOL.JS`/`JSOL.PHP` dual-block from IPAX's source: not a promise for later, a name that exists now.

## 5. Pragma grammar, generalized once

Today's compiler recognizes `// @JSOL` on line 1. v0.3 generalizes this into one rule that covers every current and future profile without touching the parser again per profile:

```
^\s*//\s*@?JSOL(-[A-Z]+)?\b
```

No suffix (`// @JSOL`) is Managed Profile, the default. A suffix (`// @JSOL-C`, `// @JSOL-X`) selects that profile's grammar rules. The `@` is optional (`// JSOL-C` also matches) for the same reason the original pragma check already tolerated minor formatting variance. `@JSOL-X` is reserved by this rule today; its actual grammar (the Excel profile) is a separate spec, not defined here.

## 6. JSOL-C stubs, syntax locked, full semantics still open

```js
JSOL.set(...)     // reserve memory — argument shape (capacity alone vs. capacity + initial values) still undecided, see ROADMAP.md Priority on memory
JSOL.unset(...)   // free memory
```

Locking the *names* now, even with the calling convention still open, means JSOL-C-flagged files can start being written without the syntax shifting under them later. In any Managed-profile compilation, both compile to near no-ops (the host's GC is already handling it) — this is what lets someone practice JSOL-C discipline with instant Managed-target feedback before ever targeting real C.

---

## Migration note for IPAX

Once this ships: `JSOL.count` → `Arr.count`, `JSOL.len` → `Str.len`, `JSOL.dict` → `Map.create`, `JSOL.hasKey` → `Map.has`, and every `JSOL.JS`/`JSOL.PHP` pair wrapping a regex call → `Regex.match`/`Regex.replace` plus an `@UNVERIFIED-PARITY` pragma. Nothing else in IPAX's existing logic needs to change shape — this is a rename and a wrapper-migration pass, not a rewrite.
