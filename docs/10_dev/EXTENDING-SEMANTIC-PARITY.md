# Extending JSOL: Semantic Parity Barriers

_Draft v.004 — 2026-08-17_

This document complements [`EXTENDING.md`](extending.md). Where `EXTENDING.md` addresses the _structural_ feasibility of targeting new languages (syntax, closures, memory models), this document addresses the _semantic_ barriers: divergences in runtime behavior across languages that, if unaddressed, silently break JSOL's core guarantee of **Deterministic Parity** — identical inputs producing bit-for-bit identical output across every compilation target.

A new target is not merely a compiler problem. Before a language can be declared a JSOL target, every divergence cataloged here must have a defined resolution: a wrapper that enforces canonical behavior, a compiler transformation that neutralizes the gap, or an explicit spec amendment. Until that resolution exists, the target is structurally compilable but semantically unproven.

> **Note on review status:** This document is a working draft, published before completing full editorial review. The volume of cataloged divergences — 143 entries across 8 domains, produced through multiple rounds of AI-assisted evaluation — results in cross-checking every claim against every target language being a work in progress. Entries marked **\[verified\]** have been confirmed by Anthropic's Claude AI executing real code in a sandbox during evaluation. All other entries reflect documented behavior in each language's specification, but have not yet been executed. Treat this document as a high-confidence map, not a certified survey. Corrections and additions are welcome.

**Status:** Exploratory reference. Living document.

* * *

## Table of Contents

1.	How this catalog was built
2.	Numeric Semantics
3.	String Semantics
4.	Array Semantics
5.	Map Semantics
6.	Boolean and Null Semantics
7.	Cross-Cutting Compiler Concerns
8.	Target Family Profiles
9.	Methodology

* * *

## How this catalog was built

The divergences in this document were identified through **redundant independent evaluation**: the same prompt was posed to multiple AI systems in independent sessions, each asked to enumerate semantic divergences across C-like languages that could threaten Deterministic Parity. The principle comes from usability engineering (Nielsen and Landauer, 1993): no single evaluator finds all problems, and aggregating independent findings dramatically improves coverage.

Identifying semantic divergences between programming languages is, by nature, a **debugging problem**. Debugging admits no logical procedure that can _prove_ completeness. You cannot enumerate all bugs by deterministic means (there is no algorithm that guarantees total coverage of a space of unknown unknowns); you can only:

1.  Survey what has been documented,
2.  Test hypotheses,
3.  Accept that undiscovered cases may remain.

_This is precisely the situation for which redundant independent evaluation was designed._ We cannot know in advance which divergences are critical, which are obscure, or which have been overlooked entirely. What we can do is reduce the probability of _catastrophic omission_ by diversifying the sources of analysis.

Entries marked **\[verified\]** were confirmed by executing real code in a sandbox (Node, Python, PHP, GCC) during evaluation, not just cited from documentation. This matters because several "well-known" behaviors turned out to be version-dependent or subtler than the evaluator's initial mental model.

* * *

## Numeric Semantics

### N-01: Integer Division vs. Float Division

| Language | `7 / 2` | `-7 / 2` |
| --- | --- | --- |
| JavaScript | `3.5` | `-3.5` |
| PHP | `3.5` | `-3.5` |
| Python 3 | `3.5` | `-3.5` |
| C / C++ / Rust / Zig | `3` | `-3` |
| Go  | `3` | `-3` |
| Java / C# / Kotlin / Swift | `3` | `-3` |
| Ruby | `3` | `-4` |
| Haskell (`div`) | `3` | `-4` |

When transpiling `$qTotal / $qCantidad` to Go or C#, the result silently changes from `3.5` to `3`. This is not a rounding bug — it is a semantic type change.

**Proposed Resolution:** `/` between `$q` operands could be prohibited, giving users unambiguos methods instead: `Math.div($a, $b)` produces `$n` (float division, all targets). `Math.idiv($a, $b)` produces `$q` (truncated toward zero, all targets).

**Status:** Unresolved. **Risk: 5**

* * *

### N-02: Modulo with Negative Operands

```
mod(7, 3)   = 1    in all languages
mod(-7, 3)  = -1   in JS, Java, C#, C, C++, Rust, Go
            = 2    in Python, Ruby, Haskell, Lua, R, Dart, Excel MOD()
mod(7, -3)  = 1    in JS, Java, C#
            = -2   in Python, Ruby, Haskell
            = ERROR in Zig
```

**\[verified\]** The formula `mod(a, n) = a - n * floor(a / n)` produces Euclidean modulo (Python/Ruby semantics), which is correct for business logic (calendars, rotations, circular indexing). It diverges from native `%` in all C-family languages.

**Proposed Resolution:** `Math.mod($a, $n)` — Euclidean modulo, result always ≥ 0 for n > 0. `Math.rem($a, $n)` — truncated remainder (C semantics), for interop when needed.

**Implementation note:** `Math.mod(0.3, 0.1)` with floats: `0.3 / 0.1 = 2.9999999999999996` → `floor = 2` → result ≈ 0.1, out of range. Requires correction step: `if ($r >= $n) { $r = $r - $n; } if ($r < 0) { $r = $r + $n; }`.

**Status:** Unresolved. **Risk: 5**

* * *

### N-03: Rounding Halfway Cases

**\[verified\]**

`Math.round(2.5)`:

| Language | Result | Mode |
| --- | --- | --- |
| JavaScript | `3` | Half up (toward +∞) |
| PHP | `3` | Half up (away from zero for negatives) |
| Python | `2` | Half even (banker's) |
| C#  | `2` | Half even (default) |
| Go  | `3` | Half away from zero |
| Rust | `3` | Half away from zero |
| Java | `3` | Half up |
| Haskell / R / WASM | `2` | Half even |
| Excel `ROUND` | `3` | Half away from zero |

`Math.round(-2.5)`: JS `-2`, PHP `-3`, Python `-2`, C# `-2`, Go `-3`.

**Three languages, three different results for the same call.**

**Proposed Resolution:** `Math.round($n)` = half away from zero (business default; native in PHP, Go, Rust, C). `Math.roundHalfEven($n)` = banker's rounding (financial). `Math.ceil($n)` must be added to spec. `Math.round` must compile to formula `sign($x) * Math.floor(Math.abs($x) + 0.5)` — never a native mapping.

**Status:** Unresolved. **Risk: 5**

* * *

### N-04: Decimal Fixed-Point Rounding (`toFixed` vs `round`)

**\[verified\]** `(1.005).toFixed(2)` → `"1.00"` in JS; `round(1.005, 2)` → `1.01` in PHP. PHP pre-rounds on decimal representation; JS operates on pure binary.

**Proposed Resolution:** The `$_castNumeric` mechanism must round on the **decimal string representation** (shortest round-trip), not on the binary value.

**Status:** Unresolved. **Risk: 5**

* * *

### N-05: Floating-Point Literal Precision (`0.1 + 0.2`)

**\[verified\]**

| Language | `0.1 + 0.2` |
| --- | --- |
| JavaScript | `0.30000000000000004` |
| PHP | `0.3` (displayed; internally `0.30000000000000004`) |
| Python | `0.30000000000000004` |
| C# `double` / Go / Rust | `0.30000000000000004` |
| C# `decimal` / Java `BigDecimal` | `0.3` |

**PHP lies.** `var_dump(0.1 + 0.2)` shows `float(0.3)` but stores `0.30000000000000004`.

**Proposed Resolution:** `$n` is defined as IEEE-754 binary64. No implicit decimal rounding occurs on assignment. `Cast.toStr($n)` is the single canonical serialization path.

**Status:** Unresolved. **Risk: 5**

* * *

### N-06: NaN and Infinity in JSON

| Operation | Behavior |
| --- | --- |
| `JSON.stringify(NaN)` in JS | `"null"` (silent corruption) |
| `json_encode(NAN)` in PHP | `false` (total failure) |
| `json.dumps(float('nan'))` in Python | `NaN` (invalid JSON) |
| `json.Marshal(math.NaN())` in Go | error |

**Proposed Resolution:** `Math.isNaN`, `Math.isFinite`, `Math.isInfinite` added to spec. JSON serialization contract: `NaN` → `null`, `Infinity` → `null`, `-Infinity` → `null`. Identical in all targets.

**Status:** Unresolved. **Risk: 5**

* * *

### N-07: `Math.min`/`Math.max` with NaN

| Language | `min(NaN, 5)` | `max(NaN, 5)` |
| --- | --- | --- |
| JavaScript | `NaN` | `NaN` |
| PHP | `5` | `5` |
| Python | `nan` (order-dependent!) | `nan` |
| Go / C# | `NaN` | `NaN` |

**PHP ignores NaN. Python's behavior depends on argument order.**

**Proposed Resolution:** Spec defines `Math.min`/`Math.max` propagate NaN (IEEE-754). PHP compiler must emit manual implementation.

**Status:** Unresolved. **Risk: 3**

* * *

### N-08: Division by Zero

**\[verified\]**

| Language | `7 / 0` |
| --- | --- |
| JavaScript | `Infinity` |
| PHP 8 | `DivisionByZeroError` (int) / `INF` (float) |
| Python | `ZeroDivisionError` |
| Go (int) | panic |
| C   | undefined behavior |
| Solidity | revert |
| Excel | `#DIV/0!` |

Pattern is **opposite by type**: float division is silent in 6/8 targets (Infinity), integer division throws in 6/8. JS is the outlier for int (Infinity), PHP/Python outliers for float (exception).

**Proposed Resolution:** `Math.div($n,$n)` and `Math.idiv($q,$q)` both produce a defined JSOL error on division by zero, in all targets. NaN/Infinity become unreachable values.

**Status:** Unresolved. **Risk: 5**

* * *

### N-09: Integer Overflow (32-bit)

| Language | `2147483647 + 1` |
| --- | --- |
| JavaScript | `2147483648` (safe, float64) |
| PHP 64-bit | `2147483648` |
| C `int32_t` | undefined behavior |
| Go / Java `int` | wraparound to `-2147483648` |
| R integer / WASM `i32` | wraparound |

**Proposed Resolution:** `$q`/`$i` compile to int64 or float64, never int32. Valid range documented: `[0, 2^53 - 1]`.

**Status:** Unresolved. **Risk: 4**

* * *

### N-10: `abs(MIN_INT)`

`Math.abs(Integer.MIN_VALUE)` in Java returns a **negative number**. In C, `abs(INT_MIN)` is **undefined behavior**.

**Proposed Resolution:** `Math.abs` compiles to wrapper handling the minimum integer case.

**Status:** Unresolved. **Risk: 2**

* * *

### N-11: Transcendental Functions (Bit-Exact Impossibility)

`Math.pow(0.01, 0.5)`:

| Language | Result |
| --- | --- |
| JavaScript / PHP / Python | `0.1` |
| Go  | `0.1` (sometimes `0.09999999999999999`) |
| C `pow()` | depends on libm |
| Haskell | `9.999999999999999e-2` |

`sin`, `cos`, `pow`, `exp`, `log` depend on libm. They differ in the last bit. If the core guarantee is "identical output," native transcendentals are incompatible with it.

**Additional semantic divergence:** `pow(-8, 1/3)`: JS `NaN`, PHP `NAN`, Python `**` complex `(1+1.73j)`, Python `math.pow` exception. Sub-case: `pow(0, 0)` = `1` in all languages except Excel (`#NUM!`).

**Proposed Resolution:** Two options: (1) declare an "approximate" subdomain with ±1 ulp tolerance, documented as approximate parity; (2) self-host an fdlibm in pure JSOL (consistent with the existing Thompson VM regex approach). `pow(0,0)` = `1` defined.

**Status:** Unresolved. **Risk: 4**

* * *

### N-12: Boolean Arithmetic

`true + 1` = `2` in JS, PHP, Python, C. Spec prohibits implicit coercion in conditionals but not arithmetic with booleans.

**Proposed Resolution:** Prohibited. Require `Cast.toInt($b)` / `Cast.toFloat($b)`.

**Status:** Unresolved. **Risk: 2**

* * *

### N-13: Numeric String Parsing

**\[verified\]**

| Input | JS `parseInt` | PHP `(int)` | Python `int()` |
| --- | --- | --- | --- |
| `"12abc"` | `12` | `12` | ValueError |
| `"1e3"` | `1` (cuts at e) | `1000` | `1000` |
| `"0x1A"` | `26` (auto-hex) | `0` | error |
| `""` | `NaN` | `0` | error |

**Proposed Resolution:** Accept only JSON numeric grammar. `Cast.toInt` accepts only decimal digits. `Cast.toFloat` accepts scientific notation. Everything else = defined error.

**Sub-case:** `Cast.toFloat("")` and `Cast.toFloat(" ")` = `0` in JS/PHP, ValueError in Python. Must be defined error in JSOL.

**Status:** Unresolved. **Risk: 4**

* * *

### N-14: Float-to-String Serialization

**\[verified\]**

| Language | `String(1.0)` | `String(1e21)` |
| --- | --- | --- |
| JavaScript / Go | `"1"` | `"1e+21"` |
| Python / Java / Lua | `"1.0"` | varies |
| PHP | `"1"` (precision=14) | `"1.0E+21"` |
| R   | `"1"` (7 sig digits) | `"1e+21"` |

Template literal `${0.1+0.2}`: JS `"0.30000000000000004"`, PHP `"0.3"`, R `"0.3"`.

**Proposed Resolution:** One canonical format: shortest round-trip, integer without `.0`, lowercase `e`. Implemented as JSOL runtime per target, never native coercion. C has no native shortest round-trip — requires explicit implementation (Grisu/Ryu or FFI).

**Status:** Unresolved. **Risk: 5**

* * *

### N-15: Integer vs. Float Distinction in JSON

JSON does not distinguish `1`, `1.0`, `1e0`. JSOL's parser must assign type based on JSOL semantics, not native parser behavior. `$q(1)` serializes as `1`; `$n(1.0)` serializes as `1.0`.

**Status:** Unresolved. **Risk: 3**

* * *

### N-16: Intermediate Overflow in Expressions

`$q * $q` can exceed safe range before a subsequent division "brings it down." In int64 this overflows; in float64 it loses precision.

**Proposed Resolution:** Rule 2 extended: intermediate results subject to same range constraint as final results.

**Status:** Unresolved. **Risk: 3**

* * *

### N-17: Decimal Type for Finance (`$dec`)

Binary floating-point is insufficient for financial calculations. Python `Decimal`, Java `BigDecimal`, C# `decimal` exist because of this.

**Proposed Resolution:** `$dec` type with `Dec.add/sub/mul/div/round/cmp/rem` wrappers. Implementation: **scaled integers** (cents as `$q`), the only representation that is 100% deterministic across all targets without external libraries. `$dec` literals preserve exact decimal representation; `$n` literals are IEEE-754 binary64 — this distinction is explicit.

**Status:** Reserved, not implemented. Strongest P0 candidate for v0.3. **Risk: 5**

* * *

### N-18: Negative Zero (`-0`)

| Language | `1 / -0` | `String(-0)` |
| --- | --- | --- |
| JavaScript | `-Infinity` | `"0"` |
| PHP | `-INF` | `"-0"` |
| Python | `-inf` | `"-0.0"` |
| Go / C / Rust | `-Inf` | `"-0"` |

`JSON.stringify(-0)` → `"0"` in JS; `json_encode(-0.0)` → `"-0"` in PHP.

**Proposed Resolution:** `-0` is not observable in JSOL. Any operation producing `-0` normalizes to `+0` before serialization. `Math.normalizeZero` / `Math.isNegativeZero` wrappers.

**Status:** Unresolved. **Risk: 3**

* * *

### N-19: Short-Circuit Returns

`"a" || "b"` returns `"a"` in JS/Python, `true` in PHP, compile error in Go/Rust/Java/C.

**Proposed Resolution:** `&&`/`||` are boolean-only operators in JSOL. Both operands must be `$b`, result is `$b`. For fallback: `Str.coalesce` / `Arr.coalesce` / `Map.coalesce`.

**Status:** Unresolved. **Risk: 3**

* * *

### N-20: Out-of-Range Float-to-Int Conversion

| Language | `(int)1e20` |
| --- | --- |
| JavaScript | `0` (ToInt32 wrap) |
| Python | `100000000000000000000` (bigint) |
| Rust | saturates to `i64::MAX` |
| C / C++ | undefined behavior |
| Go  | architecture-dependent |
| C#  | `OverflowException` (checked) or wrapped |

**Proposed Resolution:** `Cast.toInt($n)` validates `$n` within `[-(2^53-1), 2^53-1]` before casting. Outside range or NaN/Infinity = defined error. Never 0 silent.

**Status:** Unresolved. **Risk: 4**

* * *

### N-21: `Math.floor` Return Type

| Language | `floor(5)` |
| --- | --- |
| JavaScript | `5` (number) |
| PHP / Go / Java | `5.0` (float/double) |
| Python | `5` (int) |

**Proposed Resolution:** JSOL-defined return type: `$q` if input `$q`, `$n` if input `$n`. Compiler handles cast.

**Status:** Unresolved. **Risk: 2**

* * *

### N-22: Large Integer JSON Precision Loss

**\[verified\]** `JSON.stringify(9007199254740993)` → `9007199254740992` in JS (silent rounding); exact in Python/Go/Java.

**Proposed Resolution:** Enforce `$q` safe range `[-(2^53-1), 2^53-1]` for ALL targets. JS target uses BigInt internally for `$q` with custom JSON stringifier.

**Status:** Unresolved. **Risk: 4**

* * *

### N-23: Integer Width Definition

`$q` is semantically ambiguous: arbitrary mathematical integer? Signed 64-bit? Bounded domain?

**Proposed Resolution:** Choose one. Recommendation: `$q` = bounded `[-(2^53-1), 2^53-1]` (JS-safe), explicitly documented. Do NOT define as "int64 or float64 depending on target" — that weakens the parity guarantee.

**Status:** Unresolved. Foundational. **Risk: 5**

* * *

### N-24: Integer Literal Overflow at Parse Time

`$q = 999999999999999999999999999999` — reject? round? convert to float? BigInt?

**Proposed Resolution:** Compile-time semantic rule: literals outside `$q` range are rejected.

**Status:** Unresolved. **Risk: 2**

* * *

### N-25: Float Overflow/Underflow

`1e308 * 1e308` → `Infinity`. `1e-324` → underflow to zero. `0.0/0.0` → `NaN`.

**Proposed Resolution:** Explicitly define IEEE-754 binary64 behavior for `$n`. Add `Math.isFinite` / `Math.isInfinite` / `Math.isNaN`.

**Status:** Unresolved. **Risk: 3**

* * *

### N-26: Subnormal Float Flushing (FTZ)

`1e-315 / 2.0` = `5e-316` on x86, `0.0` on ARM/WASM with FTZ enabled, or with `-ffast-math` in C.

**Proposed Resolution:** Spec: valid `$n` domain excludes subnormal range. Operations producing subnormals error or clamp to `0.0`.

**Status:** Unresolved. **Risk: 1**

* * *

### N-27: `INT_MIN / -1` Overflow

C: UB (typically SIGFPE crash). Java: wraps silently to `MIN_VALUE`. Python: exact bigint. Rust: panic.

**Proposed Resolution:** Same as N-08: defined JSOL error on this specific case.

**Status:** Unresolved. **Risk: 3**

* * *

### N-28: Negative Base + Fractional Exponent

`pow(-8, 1/3)`: JS `NaN`, PHP `NAN`, Python `**` complex number, Python `math.pow` exception.

**Proposed Resolution:** Defined: base negative + non-integer exponent = NaN JSOL (never complex, never exception).

**Status:** Unresolved. **Risk: 2**

* * *

### N-29: Modulo on Floats

`5.5 % 2` = `1.5` in JS, `1` in PHP (truncates operands to int), compile error in C (no `%` for floats).

**Proposed Resolution:** Already covered by N-02: `Math.mod` handles floats; native `%` prohibited.

**Status:** Unresolved. **Risk: 4**

* * *

### N-30: Math Domain Errors

`sqrt(-1)`, `log(0)`, `acos(2)`: NaN silent in JS/C/Go/Rust, `ValueError` in Python, `NAN` in PHP.

**Proposed Resolution:** Defined: domain errors produce NaN JSOL (IEEE-754) with optional `Math.isNaN` check. Python compiler emits wrapper catching exception and returning NaN.

**Status:** Unresolved. **Risk: 3**

* * *

### N-31: Mixed Int/Float Comparison Above 2^53

`9007199254740993 == 9007199254740992.0` is `true` in JS/PHP (compare as float), `false` in Python/Go/Rust (exact comparison).

**Proposed Resolution:** JSOL equality on `$q` vs `$n` requires explicit cast to `$n` first. Mixed-type comparison without cast = linter error.

**Status:** Unresolved. **Risk: 4**

* * *

### N-32: Shift-Count Masking

`1 << 33` = `2` in JS/Java (mask mod 32), full value in Go, UB in C, panic or masked in Rust.

**Proposed Resolution:** `Bit.shiftL/shiftR` validate shift count: `0 <= count < width`. Outside range = defined error.

**Status:** Unresolved. **Risk: 3**

* * *

### N-34: String-to-Int Overflow in Runtime

Python 3.11+ has a 4300-digit limit on `int(str)` for DoS protection. Other targets don't.

**Proposed Resolution:** Document as Python-specific limit. `$q` range check makes this academic.

**Status:** Unresolved. **Risk: 1**

* * *

### N-35: `null` in Arithmetic

`null + 1` = `1` in JS/PHP, `TypeError` in Python, compile error in Go/Rust.

**Proposed Resolution:** Arithmetic with `null` is prohibited in JSOL. Linter rejects.

**Status:** Unresolved. **Risk: 3**

* * *

### N-36: NaN-to-Int Cast

Rust `as` saturates and NaN→0. JS ToInt32 wraps modular. C UB. Python `int(nan)` → ValueError.

**Proposed Resolution:** `Cast.toInt(NaN)` = defined error in all targets.

**Status:** Unresolved. **Risk: 2**

* * *

### N-37: FMA Contraction

`a*b+c` may compile with fused multiply-add (C `FP_CONTRACT`, Go per-architecture) producing different last-bit results vs JS/PHP which round intermediately.

**Proposed Resolution:** If bit-exact arithmetic is required: prohibit FMA contraction in C via pragma, in Go via `-gcflags=-c=1`. Document as known limitation.

**Status:** Unresolved. **Risk: 2**

* * *

### N-38: `min`/`max` with Signed Zero

`min(+0, -0)` = `-0` in JS, `+0` in C#. IEEE-754 defines `-0`, but C# deviates.

**Proposed Resolution:** `Math.min`/`max` normalize `-0` to `+0` before comparison. Same as N-18.

**Status:** Unresolved. **Risk: 2**

* * *

### N-39: `Cast.toFloat` with Empty String

`""` and `" "` = `0` in JS/PHP, `ValueError` in Python.

**Proposed Resolution:** Defined error. Only strings with at least one digit are valid.

**Status:** Unresolved. **Risk: 3**

* * *

### N-40: `Math.abs` with Subnormal + FTZ

`fabs(-DBL_MIN)` with FTZ flushes to 0. Same as N-26 applied to `abs`.

**Proposed Resolution:** Covered by N-26 domain exclusion.

**Status:** Unresolved. **Risk: 1**

* * *

### N-41: `Cast.toInt(1e20)` Returns 0 Silently

JS and PHP return `0` (not error, not saturation) for out-of-range float-to-int. `0` is a "normal" value that can pass unnoticed in calculations.

**Proposed Resolution:** Covered by N-20: defined error on out-of-range.

**Status:** Unresolved. **Risk: 4**

* * *

## String Semantics

### S-01: Length Unit

**\[verified\]**

| String | JS  | PHP | Python | Go  |
| --- | --- | --- | --- | --- |
| `"héllo"` | 5 (UTF-16) | 6 (bytes) | 5 (code points) | 6 (bytes) |
| `"🎉"` | 2 (surrogate) | 4 (bytes) | 1 (code point) | 4 (bytes) |

Swift is the outlier: `String.count` returns grapheme clusters.

**Proposed Resolution:** `Str.len` = Unicode code points (scalar values) in ALL targets. `Str.lenBytes` = UTF-8 bytes. `Str.lenCodeUnits` = UTF-16 units. `Str.graphemeCount` = grapheme clusters (optional, documented).

**Consistency requirement:** `Str.len`, `Str.char`, `Str.sub`, `Str.indexOf` must ALL use the same indexing unit. Code points recommended.

**Status:** Unresolved. **Risk: 5**

* * *

### S-02: String Indexing

**\[verified\]**

`"😀"[0]`: JS `"\uD83D"` (half surrogate), Python `"😀"` (full code point), Go/PHP first byte.

**Proposed Resolution:** `Str.char($s, $idx)` returns full code point. Never direct indexing.

**Status:** Unresolved. **Risk: 5**

* * *

### S-03: Substring with Code Points

`"😀".slice(0, 1)` cuts surrogate pair in JS, returns full emoji in Python.

**Proposed Resolution:** `Str.sub($s, $start, $len)` operates on code point offsets.

**Status:** Unresolved. **Risk: 4**

* * *

### S-04: `Str.indexOf` Return Value

`"abc".indexOf("x")`: `-1` in JS/Python/Go, `false` in PHP.

**Proposed Resolution:** `Str.indexOf` always returns `-1` for "not found". PHP compiler: `strpos(...) === false ? -1 : strpos(...)`.

**Status:** Unresolved. **Risk: 3**

* * *

### S-05: `Str.split` with Empty Delimiter

**\[verified\]**

`"abc".split("")`: `["a","b","c"]` in JS/PHP/Go, `ValueError` in Python, `["","a","b","c",""]` in Rust.

**Proposed Resolution:** `Str.split($s, "")` always returns array of characters. `Str.chars($s)` as alias.

**Status:** Unresolved. **Risk: 3**

* * *

### S-06: Unicode Normalization

`"é"` (U+00E9) vs `"e\u0301"` (e + combining acute) are different code point sequences.

**Proposed Resolution:** `Str.normalize($s, "NFC"/"NFD"/"NFKC"/"NFKD")`. `Str.eqNorm($a, $b, form)`. Rule: JSOL string equality is code-point equality unless normalization explicitly requested.

**Recommendation:** Normalize to NFC at input boundary before data reaches JSOL formulas.

**Status:** Unresolved. **Risk: 4**

* * *

### S-07: Case Mapping Locale-Sensitivity

-   PHP `strtoupper` is byte-based — does not touch non-ASCII.
-   C# `ToUpper()` with Turkish culture: `"i"` → `"İ"` (not `"I"`).
-   Unicode case mapping can change length: `"ß".toUpperCase()` → `"SS"`.
-   Greek final sigma: `"ABΣ"` lowercases to `"abς"` in JS/Python, `"abσ"` in PHP/Go.

**Proposed Resolution:** `Str.upper`/`Str.lower` = Unicode default case mapping, locale-invariant. `Str.upperInvariant` for explicit C#. `Str.caseFold` for comparison. `Str.lowerASCII` for ASCII-only.

**Status:** Unresolved. **Risk: 3**

* * *

### S-08: Whitespace in `Str.trim`

JS removes `\u00A0` and `\uFEFF`. PHP `trim()` does not (ASCII-only set). Java `.trim()` legacy only ≤ U+0020; `.strip()` (Java 11+) is Unicode-aware.

**Proposed Resolution:** Spec defines exact whitespace set (Unicode `White_Space` property). PHP compiler emits regex-based trim, not native.

**Status:** Unresolved. **Risk: 2**

* * *

### S-09: String Comparison Ordering

JS compares UTF-16 code units. PHP compares UTF-8 bytes. Agree for BMP, diverge for astral characters.

**Proposed Resolution:** Prohibit `<`/`>` on `$s`. `Str.compare($a, $b)` returns -1/0/1 by code point. `Str.sortLocale` for explicit collation.

**Status:** Unresolved. **Risk: 3**

* * *

### S-10: `Str.replace` Semantics

JS `replace` with string replaces first occurrence. PHP `str_replace` replaces all. JS replacement has metacharacters (`$&`, `$1`).

**Proposed Resolution:** `Str.replace` = replace-all, literal, no metacharacters. Empty search = defined error. For regex: `Regex.replace` explicitly.

**Status:** Unresolved. **Risk: 3**

* * *

### S-11: `Str.fromChar` Domain

PHP `chr()` = byte (0-255). JS `fromCharCode` = UTF-16 code unit. Python `chr()` = code point (0-0x10FFFF).

**Proposed Resolution:** `Str.fromChar(codepoint)` accepts Unicode scalar value (0-0x10FFFF, excluding surrogates 0xD800-0xDFFF).

**Status:** Unresolved. **Risk: 2**

* * *

### S-12: Grapheme Clusters

`"👨‍👩‍👧‍👦"` = 7 code points, 1 visual character.

**Proposed Resolution:** `Str.len` = code points (7). `Str.graphemeCount` = grapheme clusters (1). Do NOT make `Str.len` mean graphemes — introduces Unicode segmentation dependency.

**Status:** Unresolved. Optional layer. **Risk: 2**

* * *

### S-13: Invalid Unicode Strings

UTF-16 can contain isolated surrogates. Go strings can contain invalid bytes. RFC 8259 warns about isolated surrogates.

**Proposed Resolution:** `$s` must contain valid Unicode. Parser rejects invalid strings.

**Status:** Unresolved. **Risk: 3**

* * *

### S-14: String Concatenation with Numbers

`"Total: " + 42` works in JS/Java, TypeError in Python, compile error in Go.

**Status:** Covered by Rule 9. **Risk: 2**

* * *

### S-15: Embedded Null Bytes

`"a\0b"`: JS/Python/Go/Rust keep 3 chars. C `strlen` returns 1 (truncates at `\0`). PHP internal 3, OS interop 1.

**Proposed Resolution:** Prohibit raw `\0` in `$s` literals. Binary data with null bytes requires `$y` byte buffer type.

**Status:** Unresolved. **Risk: 2**

* * *

### S-16: Unicode Version Dependency

Case mapping, normalization, grapheme segmentation change between Unicode versions.

**Proposed Resolution:** Spec pins: "JSOL Unicode semantics conform to Unicode X.Y." All runtimes use that version or bundled implementation.

**Status:** Unresolved. **Risk: 1**

* * *

### S-17: Numeric-String Comparison in PHP

`"10" < "9"` = `false` in PHP (numeric compare), `true` elsewhere (lexicographic).

**Proposed Resolution:** `Str.compare` uses code point order always. PHP compiler emits `strcmp`, never native `<`.

**Status:** Unresolved. **Risk: 4**

* * *

### S-18: String Index Out of Range

`"abc"[99]`: undefined in JS, `""` + warning in PHP, IndexError in Python, panic in Go/Rust, garbage in C.

**Proposed Resolution:** Same as A-01: out-of-range = defined error. `Str.char` validates bounds.

**Status:** Unresolved. **Risk: 3**

* * *

### S-19: Split Trailing Empties

`"a,b,".split(",")` drops trailing empty in JS, keeps in Python.

**Proposed Resolution:** Spec defines: trailing empties preserved. PHP compiler: use `explode` with limit, not `split`.

**Status:** Unresolved. **Risk: 2**

* * *

### S-20: Negative/Inverted Slice Ranges

`"abc".slice(0,-1)` works in JS/Python/PHP (from end), no native equivalent in Go/Rust. `substring(3,1)` swaps args in JS, clamps in Python.

**Proposed Resolution:** Negative indices prohibited by linter. `Str.sub` with `start > end` = defined error.

**Status:** Unresolved. **Risk: 3**

* * *

### S-21: String Repetition

`"ab" * 3` = `"ababab"` in Python/Ruby, `NaN` in JS, no `*` for strings in PHP/Go.

**Proposed Resolution:** Not part of JSOL grammar. `Str.repeat($s, $n)` wrapper if needed.

**Status:** Unresolved. **Risk: 1**

* * *

### S-22: String Index Assignment

`$s[0] = "x"` mutates in PHP, silent no-op in JS (non-strict), TypeError in Python.

**Proposed Resolution:** Strings are immutable in JSOL. No indexed assignment. Linter rejects.

**Status:** Unresolved. **Risk: 2**

* * *

### S-23: Compare Return Magnitude

`strcmp("a","b")` returns negative value in C, but magnitude varies. Rust `Ordering` and PHP `<=>` are exact ±1 or 0.

**Proposed Resolution:** `Str.compare` returns exactly -1/0/1.

**Status:** Unresolved. **Risk: 1**

* * *

### S-24: `null` in String Interpolation

`"value: " + null` = `"value: null"` in JS, `"value: "` in PHP (null becomes empty), `"value: None"` in Python.

**Proposed Resolution:** Template literals require `Cast.toStr($val)` explicitly. `Cast.toStr(null)` = defined output (proposed: `"null"`).

**Status:** Unresolved. **Risk: 2**

* * *

### S-25: `Str.indexOf` with Empty Needle

`indexOf("abc", "")` = `0` in JS/Python/Go, `false` in PHP 7, `0` in PHP 8.

**Proposed Resolution:** Empty needle = defined error. Consistent with S-05.

**Status:** Unresolved. **Risk: 2**

* * *

### S-26: `Str.replace` with `$` in Replacement

`"$100".replace(/\$100/, "$200")` in JS: `$2` is backreference, result corrupt. With string search, no problem. The wrapper must escape `$` when using regex internally.

**Proposed Resolution:** `Str.replace` literal-only. `$` in replacement is literal character. Regex replacement uses `Regex.replace` explicitly.

**Status:** Unresolved. **Risk: 3**

* * *

## Array Semantics

### A-01: Out-of-Bounds Read

| Language | `arr[99]` (len 3) |
| --- | --- |
| JavaScript | `undefined` |
| PHP | `null` + warning |
| Python | `IndexError` |
| Go / Rust | panic |
| C   | garbage value |
| Lua | `nil` |

Failure is asymmetric: `undefined + 1 = NaN`, `null + 1 = 1`.

**Proposed Resolution:** Out-of-range read = defined JSOL error. `Arr.get($a, $idx, $default)` wrapper for safe access.

**Status:** Unresolved. **Risk: 5**

* * *

### A-02: Negative Array Indices

`arr[-1]` = last element in Python/Ruby, undefined/null in JS/PHP, panic in Go/Rust.

**Proposed Resolution:** Prohibit negative indices. `Arr.last($a)` for last element.

**Status:** Unresolved. **Risk: 3**

* * *

### A-03: Array/Map Equality

`[1,2] === [1,2]`: `false` in JS (identity), `true` in PHP/Python (deep).

**Proposed Resolution:** Prohibit `===` on `$a`/`$m`. `Arr.equal` / `Map.equal` structural wrappers.

**Status:** Unresolved. **Risk: 5**

* * *

### A-04: `Arr.slice` Signature Asymmetry

JS `slice(start, end)` — end index. PHP `array_slice(start, length)` — COUNT.

**Proposed Resolution:** `Arr.slice($a, $start, $end)` with `$end` exclusive (JS semantics). PHP compiler translates.

**Status:** Unresolved. **Risk: 3**

* * *

### A-05: `Arr.indexOf` with NaN and Loose Comparison

JS `indexOf` uses `===`, never finds NaN. PHP `array_search` loose by default.

**Proposed Resolution:** `Arr.indexOf` uses strict JSOL equality. NaN never matches.

**Status:** Unresolved. **Risk: 3**

* * *

### A-06: `Arr.pop`/`shift` on Empty

`[].pop()`: undefined in JS, null in PHP, IndexError in Python, panic in Go/Rust.

**Proposed Resolution:** Defined error.

**Status:** Unresolved. **Risk: 3**

* * *

### A-07: Array Homogeneity

JSON allows `[1, "a", true]`. C/Java/Rust do not.

**Proposed Resolution:** JSOL arrays are homogeneous. Mixed arrays = compile error.

**Status:** Unresolved. **Risk: 3**

* * *

### A-08: Array Sort Default

**\[verified\]** `[10,1,2].sort()` = `[1,10,2]` in JS (alphabetical), `[1,2,10]` in Python.

**Proposed Resolution:** `Arr.sort($a, mode)` requires explicit mode (`"numeric"` or `"string"`). Stability guaranteed.

**Status:** Unresolved — `Arr.sort` not in spec yet. **Risk: 3**

* * *

### A-09: Sparse Arrays via Out-of-Bounds Write

`a[10] = 1` on empty: sparse array in JS (count=11), associative key in PHP (count=1), IndexError in Python.

**Proposed Resolution:** `Arr.set($a, $idx, $value)` valid only if `0 <= idx < Arr.count`. Direct indexed assignment linter-rejected.

**Status:** Unresolved. **Risk: 3**

* * *

### A-10: Cyclic Structures

Circular array: `JSON.stringify` throws TypeError in JS, `json_encode` returns false in PHP, stack overflow in Go.

**Proposed Resolution:** Cyclic structures invalid in JSOL. Serializer detects cycles → defined error.

**Status:** Unresolved. **Risk: 2**

* * *

### A-11: `Arr.join` with Null Elements

`["A",null,"B"].join("-")`: `"A--B"` in JS, `"A-B"` in PHP (skips null), TypeError in Python.

**Proposed Resolution:** `Arr.join` requires `$s` elements or explicit `Cast.toStr`. Null = defined behavior (recommended: empty string).

**Status:** Unresolved. **Risk: 3**

* * *

### A-12: Array Element Deletion

`delete arr[1]` on `[1,2,3]`: hole in JS (count still 3), shift in Python (count 2), preserved keys in PHP (count 2, keys 0 and 2).

**Proposed Resolution:** `Arr.remove($a, $idx)` shifts subsequent elements, reduces count by 1. JS target emits `splice`, never `delete`.

**Status:** Unresolved. **Risk: 2**

* * *

### A-13: Assignment/Aliasing Semantics

`$b = $a; push($b, 1)` mutates `$a` in JS/Python/Java, does NOT in PHP (copy-on-write).

**Proposed Resolution:** JSOL rule: assignment creates an alias. Mutation observable through all aliases. `Arr.clone`/`Map.clone` for value semantics.

**Status:** Unresolved. **Risk: 5**

* * *

### A-14: Mutation During Iteration

`for` loop pushing during iteration: targets disagree on whether iteration observes mutation.

**Proposed Resolution:** Mutation of collection being iterated = prohibited by linter.

**Status:** Unresolved. **Risk: 3**

* * *

### A-15: `Arr.push` Return Value

JS `.push()` returns new length. Python `.append()` returns `None`. Rust `Vec::push()` returns unit. If `Arr.push` has a return value in JSOL, no two targets agree.

**Proposed Resolution:** `Arr.push` returns `$b` success (true) or no return value (documented as statement).

**Status:** Unresolved. **Risk: 3**

* * *

### A-16: Go Append Aliasing

Go `append` on shared slice may mutate caller's array or not, depending on capacity — invisible from formula level.

**Proposed Resolution:** Go target never uses native `append` on slices shared across function boundaries. `Arr.push` compiles to explicit copy-then-append.

**Status:** Unresolved. **Risk: 3**

* * *

### A-17: Sort with NaN/Undefined

JS moves `undefined` to end without calling comparator. Python crashes comparing NaN. Mixed-type sort behavior undefined.

**Proposed Resolution:** `Arr.sort` requires homogeneous array. NaN/undefined = defined error.

**Status:** Unresolved. **Risk: 2**

* * *

### A-18: PHP Array `+` vs `array_merge`

PHP `+` on arrays = key union (left wins). `array_merge` = renumber and append. Neither equals JS `concat`.

**Proposed Resolution:** `Arr.concat` wrapper with defined semantics (append, renumber). PHP compiler emits `array_merge`.

**Status:** Unresolved. **Risk: 2**

* * *

### A-19: Go Slice Aliasing by Capacity

Two slices sharing backing array: mutate through one, the other sees it — but only if capacity allows.

**Proposed Resolution:** Go target treats slices as value types: copy on assignment unless explicitly aliased.

**Status:** Unresolved. **Risk: 3**

* * *

### A-20: Array Relational Comparison

`[1,2] < [1,3]` = true in Python (lexicographic), `"1,2" < "1,3"` in JS (string coercion), undefined in PHP.

**Proposed Resolution:** Prohibited. No `<`/`>` between arrays in JSOL.

**Status:** Unresolved. **Risk: 2**

* * *

### A-21: Indexing Null

`null[0]`: TypeError in JS, null+warning in PHP, TypeError in Python.

**Proposed Resolution:** Indexing `null` = defined error. Linter catches.

**Status:** Unresolved. **Risk: 2**

* * *

### A-22: `Arr.slice` End Beyond Count

`[1,2,3].slice(0,99)` clamps in JS/Python/PHP, panics in Go/Rust.

**Proposed Resolution:** `Arr.slice` clamps `$end` to `Arr.count`. Go/Rust emit explicit check.

**Status:** Unresolved. **Risk: 2**

* * *

### A-23: `Array(n)` Holes in JS

`new Array(3)` = `[empty × 3]` in JS (holes, count=3 but no elements), `[0,0,0]` in most other languages.

**Proposed Resolution:** Prohibited. `Arr.create` only accepts explicit elements. Pre-allocation via `Arr.fill($n, $value)`.

**Status:** Unresolved. **Risk: 3**

* * *

## Map Semantics

### M-01: Key Iteration Order

| Language | Order |
| --- | --- |
| JavaScript (Map) | Insertion |
| PHP | Insertion |
| Python 3.7+ | Insertion |
| Go  | Random |
| Rust HashMap | Random |
| Java HashMap | Not guaranteed |

**Proposed Resolution:** `Map.keys($m)` returns keys **sorted lexicographically** (deterministic across all targets). `OrderedMap` as separate type if insertion order is semantically needed. Go/Rust targets need ordered map implementation.

**Status:** Unresolved. **Risk: 5**

* * *

### M-02: PHP Key Casting

**\[verified\]** PHP casts: `"1"` → `1`, `true` → `1`, `null` → `""`, `1.9` → `1`. `"01"` stays string. Key `1` and `"1"` collide in PHP but are distinct in JS Map.

**Proposed Resolution:** `Map.create` keys must be `$s` literals validated at compile time. Numeric keys prohibited (Rule 3 extended).

**Status:** Unresolved. **Risk: 4**

* * *

### M-03: `Map.has` in PHP

`isset($map[$key])` returns `false` if value is `null`. `array_key_exists` returns `true` if key exists.

**Proposed Resolution:** `Map.has` compiles to `array_key_exists`, never `isset`.

**Status:** Unresolved. **Risk: 3**

* * *

### M-04: Missing Key Access

| Language | `map["missing"]` |
| --- | --- |
| JavaScript | `undefined` |
| PHP | `null` + warning |
| Python | `KeyError` |
| Go  | zero value (dangerous!) |
| Rust | panic |

**Proposed Resolution:** Missing key access = defined error. `Map.get($m, $key, $default)` for safe access. `Map.has` required before direct access.

**Status:** Unresolved. **Risk: 5**

* * *

### M-05: Duplicate Keys

JS: last wins silently. JSON spec: undefined. Python: last wins.

**Proposed Resolution:** `Map.create` with duplicate keys = parse error.

**Status:** Unresolved. **Risk: 3**

* * *

### M-06: Map Equality

`{a:1, b:2}` vs `{b:2, a:1}` — equal? PHP/Python yes (deep), JS identity no.

**Proposed Resolution:** `Map.equal($m1, $m2)` structural, order-independent.

**Status:** Unresolved. **Risk: 3**

* * *

### M-07: Mutation During Iteration

Adding/removing keys while iterating: behavior differs.

**Proposed Resolution:** Snapshot before iteration. Mutation during iteration = undefined.

**Status:** Unresolved. **Risk: 2**

* * *

### M-08: JSON Serialization of Maps

PHP `json_encode` escapes `/` as `\/` and Unicode by default. `JSON.stringify` does not. PHP array with non-sequential keys emits object. Go `json.Marshal` of map: random order.

**Proposed Resolution:** JSOL JSON serializer is spec-defined primitive with canonical flags. Never native call.

**Status:** Unresolved. **Risk: 4**

* * *

### M-09: Prototype Pollution

Key `"__proto__"` in JS plain object overwrites prototype. Harmless string in PHP/Python/Go.

**Proposed Resolution:** JS target uses `Map` (ES6) or `Object.create(null)`, never plain `{}`.

**Status:** Unresolved. **Risk: 3**

* * *

### M-10: Map Key Type Semantics

`1` and `"1"` as keys: distinct in JS Map, collide in PHP. `true` and `1`: distinct in JS, collide in Python.

**Proposed Resolution:** `$m` keys are `$s` only. Hard rule.

**Status:** Unresolved. **Risk: 4**

* * *

### M-11: Presence vs. Null

`{}` vs `{"x": null}` vs `{"x": ""}` — three distinct states. Go blurs them (zero value).

**Proposed Resolution:** `Map.has` distinguishes. `Map.get` with default wrapper. Go runtime uses pointer types for values.

**Status:** Unresolved. **Risk: 4**

* * *

### M-12: Bool/Int Key Collision in Python

**\[verified\]** `{True: 'a'}` then `d[1] = 'b'` overwrites same entry (`hash(True) == hash(1)` in Python).

**Proposed Resolution:** Covered by M-10: keys are `$s` only. Bool/int keys prohibited.

**Status:** Unresolved. **Risk: 2**

* * *

### M-13: Empty Map vs Empty Array in PHP JSON

**\[verified\]** `json_encode([])` always `"[]"`, never `"{}"` — even if array had string keys that were all unset. Empty map and empty array indistinguishable in PHP.

**Proposed Resolution:** JS target must preserve type distinction. PHP compiler wraps maps in a class or uses `(object)[]` cast when serializing.

**Status:** Unresolved. **Risk: 3**

* * *

### M-14: `Object.keys()` Numeric Key Reordering

`Object.keys({10:"a", 2:"b", x:"c"})` → `["2", "10", "x"]` — numeric keys reordered first, ascending. Current JS compiler uses `Object.keys()` for `Map.keys()`. **This is a bug today, not future.**

**Proposed Resolution:** JS compiler emits ES6 `Map` or maintains parallel key array. Never `Object.keys()` on plain object.

**Status:** **Bug in current compiler.** **Risk: 4**

* * *

## Boolean and Null Semantics

### B-01: `Cast.toStr` on Booleans

`String(true)`: `"true"` in JS, `"1"` in PHP, `"True"` in Python. `String(false)`: `"false"` in JS, `""` in PHP (empty string!), `"False"` in Python.

**Proposed Resolution:** `Cast.toStr($b)` always `"true"`/`"false"` (JSON style).

**Status:** Unresolved. **Risk: 3**

* * *

### B-02: `null` Type Not in Spec

JSON has `null`. JSOL type matrix does not include it.

**Proposed Resolution:** Add `$z` as null type. `Map.has(m,"x") == false` ≠ `Map.get(m,"x") == null` — these are distinct.

**Status:** Unresolved. **Risk: 4**

* * *

### B-03: `undefined` vs. `null`

JS has both. All other targets only `null`. Any wrapper returning `undefined` creates a third state no other target has.

**Proposed Resolution:** JSOL knows only `null`. No wrapper ever returns `undefined`. Cases that would (empty pop, missing key, OOB) are defined errors.

**Status:** Unresolved. **Risk: 4**

* * *

### B-04: Empty vs. Null vs. Absent in Go

Go: empty string and missing string both `""`. `{"key": ""}` and `{}` look identical.

**Proposed Resolution:** Go runtime uses wrapper types (`*string`) for nullable values.

**Status:** Unresolved. **Risk: 2**

* * *

### B-05: Falsy Set

`"0"`: falsy in PHP, truthy in JS/Python. `[]`: falsy in PHP/Python, truthy in JS. `{}`: falsy in Python, truthy in JS. Ruby: only `nil`/`false` falsy.

**Proposed Resolution:** Already covered by Rule 4 (no implicit truthiness). Confirm enforcement.

**Status:** Partially resolved. **Risk: 4**

* * *

### B-06: Weak Equality Matrix

`0 == "foo"`: true in PHP 7, false in PHP 8. `null == undefined`: true in JS only. `switch` uses `==` in PHP, `===` in JS.

**Proposed Resolution:** `==` prohibited (Rule: loose equality). `switch` not in JSOL grammar yet — if added, requires strict matching spec.

**Status:** Partially resolved. **Risk: 3**

* * *

### B-07: Relational Comparison with Null

`null < 1` = true in JS (coerces to 0), TypeError in Python, compile error in statics.

**Proposed Resolution:** Prohibited. Comparison with `null` = linter error.

**Status:** Unresolved. **Risk: 2**

* * *

## Cross-Cutting Compiler Concerns

### C-01: Full Parenthesization

`-2^2` = 4 in Excel, -4 in Python, SyntaxError in JS. PHP changed `.` vs `+` precedence in 8.0.

**Proposed Resolution:** Compiler policy: every binary operation emitted parenthesized.

**Status:** Unresolved. **Risk: 2**

* * *

### C-02: PHP Block Scope

PHP: `$i` from `for` loop remains alive after loop. JS: `let` is block-scoped.

**Proposed Resolution:** Linter: no shadowing, unique names per function.

**Status:** Unresolved. **Risk: 2**

* * *

### C-03: Language Version Pinning

Sort stability: ES2019 / PHP 8.0. `"abc" == 0`: PHP 7 true / 8 false. Division by zero: PHP 7 false / 8 exception.

**Proposed Resolution:** Spec pins minimum versions: PHP 8.0+, JS ES2019+.

**Status:** Unresolved. **Risk: 3**

* * *

### C-04: Clock and RNG as Inputs

`Date.now()` / `random()` inside `.jsol` = non-deterministic by definition.

**Proposed Resolution:** All non-deterministic inputs are host-supplied arguments.

**Status:** Unresolved. **Risk: 3**

* * *

### C-05: Pass-by-Reference vs. Copy-on-Write

Pass `$a` to function, mutate inside: JS/Python/Java mutate original. PHP does NOT (COW). Go slice mutates unless reallocated.

**Proposed Resolution:** JSOL rule: assignment creates alias, mutation observable through all aliases. `Arr.clone` / `Map.clone` for value semantics. (ChatGPT recommendation.)

**Status:** Unresolved. **Risk: 5**

* * *

### C-06: Bitwise Width and Zero-Fill Shift

`-1 >>> 1` = 2147483647 in JS, no equivalent in PHP/C. `1 << 63`: UB in C, wrap in PHP, 0 in JS (32-bit).

**Proposed Resolution:** `Bit.*` operations defined over explicit bit width (32 or 64). Overflow wraps. Shift counts validated. `Bit.shiftRLogical` for zero-fill.

**Status:** Unresolved. **Risk: 3**

* * *

### C-07: Error Model

"Error" is not defined in JSOL: throw? return null? panic? exception? process termination?

**Proposed Resolution:** Define JSOL error model: `Error.divZero`, `Error.indexOutOfBounds`, `Error.invalidCast`, `Error.invalidUnicode`, `Error.missingKey`. Defined propagation.

**Status:** Unresolved. Foundational. **Risk: 5**

* * *

### C-08: Error Propagation

If `foo()` fails: does `bar()` execute? Is error catchable? Does it abort function or program?

**Proposed Resolution:** Error aborts current function, propagates to caller, host orchestrator catches.

**Status:** Unresolved. **Risk: 4**

* * *

### C-09: Evaluation Order and Side Effects

`f(g(), h())`: argument order unspecified in C, left-to-right in JS. Side effects in arguments diverge.

**Proposed Resolution:** Linter prohibits side effects (`++`, `--`, mutation) in argument expressions. Or: all expressions evaluate left-to-right, arguments exactly once.

**Status:** Unresolved. **Risk: 4**

* * *

### C-10: Locale Independence

Locale affects number formatting, string comparison, date formatting, case mapping in Java/C#/PHP.

**Proposed Resolution:** Global rule: JSOL core semantics are locale-independent. Locale-sensitive operations require explicit parameter.

**Status:** Unresolved. **Risk: 2**

* * *

### C-11: Regex Semantics

Lookbehind (Python fixed-width only, JS variable, Go rejects). Backreferences (V8 backtracking, RE2 linear). Unicode properties. Replacement syntax.

**Proposed Resolution:** `Regex.*` needs its own parity section. Either restricted subset or self-hosted Thompson VM (already exists in JSOL 2.90).

**Status:** Unresolved. **Risk: 3**

* * *

### C-12: Date/Time Semantics

Timezone, DST, locale, calendar, leap seconds.

**Proposed Resolution:** Explicitly out of scope v0.2.x. Later: fully specified `Date.*` namespace.

**Status:** Out of scope. **Risk: 2**

* * *

### C-13: Recursion Stack Limits

Python ~1000 frames, JS ~10000, Go dynamic, C stack-dependent.

**Proposed Resolution:** Extend grammar restriction: no self-referencing functions. Iterative loops only (already the JSOL way).

**Status:** Unresolved. **Risk: 2**

* * *

### C-14: Canonical JSON Contract

JSON→JSOL parsing: `9007199254740993` precision, `1e400` overflow, `-0`, duplicate keys, BOM, leading zeros. JSOL→JSON: key order, escaping, exponent notation, `-0`.

**Proposed Resolution:** JSON is its own semantic section. Canonical serializer as spec-defined primitive.

**Status:** Unresolved. **Risk: 4**

* * *

### C-15: Tail-Call Optimization

Haskell/Elixir/Swift optimize. JS (V8), Python, PHP, Java do not guarantee. Same recursive formula: stack overflow in one family, runs in another.

**Proposed Resolution:** Loops required; recursion not part of JSOL grammar. Non-issue for JSOL core.

**Status:** Partially resolved. **Risk: 2**

* * *

### C-16: Lazy Evaluation (Haskell)

Error in unfocused branch may never occur. A formula that always fails in eager targets runs silently in Haskell.

**Proposed Resolution:** Haskell target out of scope for v0.x. Documented as paradigm barrier (T-01).

**Status:** Unresolved. **Risk: 2**

* * *

### C-17: Assertions Removed by Build Mode

`assert` removed in release builds (C `NDEBUG`, Python `-O`, Rust release).

**Proposed Resolution:** JSOL has no `assert` primitive. Validation via explicit `if` + error.

**Status:** Partially resolved. **Risk: 1**

* * *

### C-18: Switch Semantics

Fallthrough in JS/C/PHP, break implicit in Go, no switch in Python, pattern matching in Rust.

**Proposed Resolution:** `switch` not in JSOL grammar. If added: explicit `break` required, strict equality.

**Status:** Not in spec. **Risk: 3**

* * *

### C-19: Chained Comparisons

`3 > 2 > 1` = true in Python (chained), false in JS (coerces boolean to number).

**Proposed Resolution:** Chained comparison prohibited. Each comparison must be explicit.

**Status:** Unresolved. **Risk: 2**

* * *

### C-20: Bitwise on Non-Integers

`2.9 | 0` = 2 in JS (ToInt32), error in Python, bytewise on strings in PHP.

**Proposed Resolution:** `Bit.*` requires `$q` operands. Linter rejects floats and strings.

**Status:** Unresolved. **Risk: 2**

* * *

### C-21: Default Parameter Evaluation Timing

Python evaluates defaults once at definition (mutable default trap). JS/PHP per call.

**Proposed Resolution:** Default parameters not in JSOL grammar. Explicit initialization inside function body.

**Status:** Not in spec. **Risk: 2**

* * *

### C-22: NaN Payload Canonicalization

NaN payload bits preserved in C/Rust, canonicalized in JS, unspecified in WASM.

**Proposed Resolution:** Only relevant if JSOL serializes bitwise. NaN not observable in JSOL (covered by N-06).

**Status:** Partially resolved. **Risk: 1**

* * *

### C-23: Loop Bound Evaluation

`for ($i = 0; $i < Arr.count($a); $i = $i + 1)` with mutation inside: bound re-evaluated per iteration in JS/PHP. If compiler optimizes to cached variable, loop ends early.

**Proposed Resolution:** Spec defines: bound evaluated **each iteration**. If once-evaluation needed, use explicit variable.

**Status:** Unresolved. **Risk: 3**

* * *

## Target Family Profiles

### T-01: Functional Pure Languages (Elixir, Haskell, Clojure)

No `for`/`while` loops — must compile to recursion, inverting the Section 3 restriction. Clojure `(/ 1 3)` = `1/3` exact Ratio. Elixir map order = term order. Haskell `String` is linked list → `Str.char` is O(n). **Lazy evaluation** (Haskell) means errors in unfocused branches never occur.

### T-02: Vectorized Languages (R, Julia)

1-based indexing. R recycles vectors in arithmetic. R integer is 32-bit. R prints 7 significant digits. Julia/R: `missing`/`NA` three-valued logic propagation.

### T-03: Bare Metal (WASM, LLVM IR)

Only `i32`/`i64`/`f32`/`f64`. No strings, no maps, no JSON — entire runtime must be written, not mapped. WASM `f64.nearest` = banker's rounding. WASM NaN canonicalization differs from JS host. i64↔JS boundary is lossy.

### T-04: Consensus (Solidity)

No floats — `$n` requires fixed-point emulation. Overflow = revert. Out-of-gas failure mode: logically correct formula can fail purely on execution cost.

### T-05: Haxe

Inherits semantics of underlying target — cannot be assumed to have its own behavior.

### T-06: Excel

`MOD` = sign of divisor (matches `Math.mod`). `ROUND` = half away from zero (matches `Math.round`). `INT` = floor, `QUOTIENT` = trunc. `=-2^2` = `4`. `=0^0` = `#NUM!`.

### T-07: Lua

1-based indexing. `#` operator undefined on tables with holes. String↔number auto-coercion in arithmetic (`"10"+1` = 11). Assigning `nil` deletes key. No integer subtype before 5.3.

### T-08: Julia/R

`missing`/`NA` three-valued logic propagation (extended T-02). 1-based indexing.

### T-09: WASM

No native strings, maps, or arrays. NaN canonicalization. i64↔JS host boundary lossy.

* * *

## Evidence Markers

Entries marked **\[verified\]** were confirmed by executing real code in a sandbox during evaluation (Node, Python 3, PHP 8.3, GCC), not solely cited from documentation.

Verified entries: N-02, N-03, N-04, N-05, N-08, N-13, N-14, N-22, S-01, S-02, S-05, A-08, M-02, M-12, M-13, A-15 (push return), A-16 (Go append), B-05 (Ruby falsy).

* * *

## Methodology

Eight AI systems participated across three evaluation rounds. Each round fed the consolidated findings back to the evaluators and asked: _what's missing?_ Two systems (Gemini, [Z.ai](https://z.ai/)) have now responded that they can find no further gaps. This is not proof of completeness — no method can guarantee that — but it is the best available signal short of shipping targets and discovering divergences in production.


### Theoretical Foundation

The effectiveness of this technique was formalized by Jakob Nielsen and Thomas Landauer in their 1993 paper, _"A Mathematical Model of the Finding of Usability Problems"_, presented at the ACM/IFIP INTERCHI'93 Conference. Their analysis of eleven independent studies modeled problem detection as a Poisson process and demonstrated that:

> _"For a 'medium' example, we estimate that 16 evaluations would be worth their cost, with maximum benefit/cost ratio at four."_

Nielsen's earlier work on heuristic evaluation (Nielsen and Molich, 1990; Nielsen 1994) established that **no single evaluator finds all usability problems**, and —critically— that the hardest-to-find problems are often discovered by evaluators who otherwise perform poorly.

For a complete exposition of the theory, see:

-   **The Theory Behind Heuristic Evaluations** — Nielsen Norman Group  
    [https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/theory-heuristic-evaluations/](https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/theory-heuristic-evaluations/)
-   **Nielsen, J., and Landauer, T. K. (1993).** A mathematical model of the finding of usability problems. _Proceedings ACM/IFIP INTERCHI'93 Conference_ (Amsterdam, April 24–29), 206–213.


### How It Was Executed

**First round:**

```
I'm designing \*\*JSOL\*\*, a business-logic DSL that transpiles to C-like languages (JS, PHP, Python, Go, C#, Java, Rust, C, etc.).
\*\*Core guarantee:\*\* Deterministic Parity — same input, identical output across all targets.
\*\*Current spec (v0.2.91):\*\*
\- Type prefixes: \`$i\` index, \`$q\` integer, \`$n\` float, \`$s\` string, \`$a\` array, \`$m\` map, \`$b\` boolean
\- Wrappers: \`Math.floor/abs/pow/min/max/round\`, \`Str.len/sub/indexOf/replace/char/fromChar/upper/lower/trim/split\`, \`Arr.count/push/pop/shift/slice/indexOf/join\`, \`Map.create/has/keys\`, \`Bit.and/or/xor/not/shiftL/shiftR\`, \`Cast.toStr/toInt/toFloat\`
\- Prohibited: divergent native operators, implicit coercion, functional methods
\*\*I need:\*\* semantic divergences across languages that affect ported formulas, in JSON types (numbers, strings, maps, arrays). With concrete examples and a proposed JSOL wrapper to resolve each.
\*\*Priority:\*\* finance, decimals, Unicode strings.
\*\*Format:\*\* divergence table → demonstrative snippet → proposed wrapper.
```

**Second round:** same prompt, with the compiled first-round findings attached, plus the extended target list (Swift, Kotlin, Dart, Lua, Ruby, Scala, Objective-C, Zig, Nim, Vala, Haxe, Elixir, Haskell, Clojure, R, Julia, Solidity, WebAssembly, LLVM IR).

**Third round:** the compact checklist ([`EXTENDING-SEMANTIC-PARITY-table.md`](extending-semantic-parity-table.md)) was given to evaluators with instructions to identify missing entries only, not re-explain existing ones.


### AI systems employed

| System | Model | Rounds | Mode |
| --- | --- | --- | --- |
| Anthropic | Claude Sonnet 5 Extra | 1, 2   | Standard, with sandbox verification |
| OpenAI | ChatGPT GPT-5.6 Luna | 1, 2, 3 | Thinking Mode |
| Microsoft | Copilot | 1   | Default |
| DeepSeek | V3 (0324) | 1, 2, 3 | Expert analytical depth |
| Moonshot AI | Kimi K3 Max | 1, 2, 3 | Standard |
| Zhipu AI | GLM-5.2 Deep Think Max | 1, 2, 3 | Standard |
| Google | Gemini 3.1 Pro | 1, 2, 3 | Standard |
| Google | Gemini 3.6 Thinking | 2, 3   | Deep analysis |

In several observed instances, the models independently wrote and (in the case of Claude) executed small test programs to validate their own claims before including them in their responses. Entries marked **\[verified\]** in the catalog reflect Claude's sandbox execution specifically.

### On the Limits of This Method

These systems have been trained on vast corpora that include documentation, source code, and technical literature for all the target languages relevant to JSOL. However, they exhibit **training blind spots and response biases** — empirically verifiable from the fact that the systems disagreed substantially in what they found. Some identified divergences that others missed entirely. Some proposed different wrappers for the same problem, revealing different underlying mental models of language semantics.

By posing the same question to multiple systems across several rounds, we reduce the probability that a critical divergence remains entirely uncovered. We do not eliminate it. **No claim of completeness is made, and none should be inferred.**

This document is a **living artifact**. As additional AI or human findings become available, new divergences are identified through target testing, or production incidents reveal gaps, it should be updated.

The goal is not perfection but the **systematic reduction of unknown risk**.

### On AI Co-Piloting

This document was produced with systematic AI co-piloting as described in [`AI_ENGINEERING_METHODOLOGY.md`](https://ai_engineering_methodology.md/). AI was used for architectural stress-testing, cross-model validation, and drafting; all content is being reviewed for technical accuracy and adherence to project constraints.

* * *

_JSOL v0.2.93 — 2026-08-17, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)_