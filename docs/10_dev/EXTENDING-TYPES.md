# Extending JSOL: Type System Expansion

_Draft v.001 — 2026-08-18_

This document complements [`EXTENDING.md`](extending.md). It tracks the expansion of JSOL's type system beyond the JSON-native types that formed the initial specification. 

Where `EXTENDING-SEMANTIC-PARITY.md` catalogs divergences in _behavior_, this document catalogs divergences in _type existence_: types that exist natively in some targets but not others, types that JSOL needs for its domain but has not yet formalized, and types that are explicitly excluded with rationale.

**Status:** Exploratory reference. Living document.

Note that core JSON Types use a single character as a prefix (e.g. `$qAmount`). Types proposed in this document, if considered Custom types, should be implemented as 3+ characters prefixes as documented in [SPEC_CANDIDATES.md](../21_future/SPEC_CANDIDATES.md).

* * *

## Table of Contents

1.  Foundation: JSON Types
2.  Types in Active Definition
3.  Types Under Consideration
4.  Excluded Types

* * *

## Foundation: JSON Types

JSOL v0.2.x is built on the six JSON-native types (RFC 8259). This was a deliberate starting point: JSON is the de facto interchange standard for business data, and anything JSOL declares must have a defined JSON serialization.

| JSON Type | JSOL Prefix | Status |
| --- | --- | --- |
| number (integer) | `$q`, `$i`/`$int` | Implemented |
| number (float) | `$n`/`$num` | Implemented |
| string | `$s`/`$str` | Implemented |
| boolean | `$b`/`$bool` | Implemented |
| array | `$a`/`$arr` | Implemented |
| object | `$m`/`$map` | Implemented |
| null | _(not yet typed)_ | Gap — see B-02 in Semantic Parity |

**Principle:** a type is JSOL-native if and only if it has a defined JSON serialization. Types without a JSON representation are either host-orchestrated or explicitly excluded.

* * *

## Types in Active Definition

Types that are **reserved in the spec** (prefix assigned, linter rejects use) but not yet implemented. Each has a defined direction, open questions, and a rationale for why it exists in a business-logic DSL.

* * *

### `$y` — Byte Array (Binary Data)

**Status:** Reserved. Active definition in progress.

**Why it exists:** JSOL's origin project, IPAX, is a color-science and accessibility engine. Processing images (reading pixel data, parsing binary headers, computing checksums, encoding/decoding) requires raw byte manipulation. Without `$y`, IPAX cannot be fully expressed in JSOL.

**Definition in progress:**

```JavaScript
const $yPixelData \= Byte.fromHex("0f1a2b3c");
const $qChecksum \= Byte.crc32($yPixelData);
const $sBase64 \= Byte.toBase64($yPixelData);
```

**Proposed wrapper surface:**

```
Byte.len($y)          → $i    // byte count
Byte.get($y, $i)      → $q    // 0–255, ALWAYS unsigned
Byte.set($y, $i, $v)  → $b    // mutation (if allowed)
Byte.slice($y, $s, $e)→ $y    // sub-range
Byte.concat($a, $b)   → $y    // concatenation
Byte.fromHex($s)      → $y    // from hex string
Byte.toHex($y)        → $s    // canonical lowercase hex
Byte.toBase64($y)     → $s
Byte.fromBase64($s)   → $y
```

**Known divergences per target:**

| Target | Native type | Reading | Writing | Notes |
| --- | --- | --- | --- | --- |
| JavaScript | `Uint8Array` | `arr[i]` → 0–255 | `arr[i] = v` | `ArrayBuffer` is the underlying container |
| PHP | `string` (binary) | `ord($s[$i])` | `$s[$i] = chr($v)` | No array-like byte access |
| Python | `bytes` (immutable) / `bytearray` (mutable) | `b[i]` → 0–255 | `b[i] = v` (bytearray only) | Mutability decision needed |
| Go  | `[]byte` | `b[i]` → 0–255 | `b[i] = v` | Natural fit |
| Rust | `Vec<u8>` | `v[i]` → 0–255 | `v[i] = v` | Natural fit |
| Java | `byte[]` | `arr[i] & 0xFF` | `arr[i] = (byte)v` | **`byte` is signed** — masking required |
| C#  | `byte[]` | `arr[i]` → 0–255 | `arr[i] = v` | Natural fit |
| C   | `uint8_t[]` | `arr[i]` → 0–255 | `arr[i] = v` | No self-contained length — needs struct or explicit param |
| Swift | `[UInt8]` / `Data` | `arr[i]` → 0–255 | `arr[i] = v` | `Data` (Foundation) preferred |

**Open questions:**

1.  **Mutability:** Python `bytes` is immutable; `bytearray` is mutable. Is `$y` immutable (like `$s`) or mutable (like `$a`)? Recommendation: immutable, with `Byte.set` returning a new `$y` — consistent with Rule 5 (no mutation across function boundaries).
2.  **JSON serialization:** `$y` has no JSON representation. `Cast.toStr($y)` is a defined error. Serialization requires explicit `Byte.toHex` or `Byte.toBase64`.
3.  **Java signed byte:** `Byte.get` must compile to `bytes[i] & 0xFF` in Java. This is a compiler-level rule, invisible to the JSOL author.
4.  **C length tracking:** `uint8_t[]` has no length. Either compile to a struct `{uint8_t *data; size_t len;}` or require explicit `$i` length parameters on all `Byte.*` calls. Recommendation: struct.

* * *

### `$d`/`$date` — Date/Time

**Status:** $d is Reserved. Active definition in progress.

**Why it exists:** Business logic deals with dates constantly: invoices, contracts, deadlines, interest accrual. JSON has no date type — dates are transported as strings or timestamps. A business-logic DSL that cannot express "45 days after invoice date" is incomplete.

**Definition in progress:**

```JavaScript
const $dInvoiceDate \= Date.fromISO("2026-08-18");
const $dDueDate \= Date.addDays($dInvoiceDate, 45);
const $sFormatted \= Date.format($dDueDate, "YYYY-MM-DD");
```

**Known divergences per target:**

| Target | Native type | Timestamp unit | Notes |
| --- | --- | --- | --- |
| JavaScript | `Date` | milliseconds since 1970 UTC | `Date.now()` |
| PHP | `DateTime` / `int` | seconds (Unix) | Timezone-aware via `DateTimeZone` |
| Python | `datetime` | microseconds | Naive vs aware distinction |
| Go  | `time.Time` | nanoseconds | Monotonic clock component |
| Rust | `SystemTime` / `chrono` | nanoseconds | No timezone in std |
| Java | `Instant` / `LocalDate` | nanoseconds | Strongest stdlib |
| C#  | `DateTime` / `DateTimeOffset` | ticks (100ns) | Kind: Utc/Local/Unspecified |
| C   | `time_t` | seconds | No timezone, platform-dependent |

**Known pitfalls (from real-world libraries):**

-   **Timezone**: `2026-08-18` is ambiguous — midnight in which timezone? JS `Date` parses as UTC; PHP `DateTime` parses in default timezone; Python `date` is timezone-naive.
-   **DST**: Adding 1 day across a DST boundary can be 23 or 25 hours. Business rules ("45 days after") usually want _calendar_ days, not _elapsed_ hours.
-   **Leap seconds**: Unix time ignores them; some libraries handle them; most don't.
-   **Date-only vs. datetime**: `2026-08-18` (date) vs `2026-08-18T14:30:00Z` (instant) are different types. Excel uses a serial number for dates — fractional part is time.
-   **Year 2038 problem**: 32-bit `time_t` overflows in 2038. Relevant for embedded targets.
-   **Excel compatibility**: Excel date serial number: `45000` = 2023-03-15 (roughly). JSOL-X (Excel target) requires mapping JSOL dates to/from serial numbers.
-   **Library precedent**: Java `java.time` (JSR-310) is widely considered the best-designed date/time API. It distinguishes `Instant`, `LocalDate`, `LocalTime`, `ZonedDateTime`, `Duration`, `Period`. A JSOL `Date.*` namespace should learn from this rather than reinvent it.

**Open questions:**

1.  **What does `$date` store internally?** Options: (a) milliseconds since Unix epoch (JS-style), (b) date-only serial number (Excel-style), (c) structured date with calendar awareness.
2.  **Is `$date` date-only or datetime?** Business rules often want date-only ("payment due on the 15th") — Excel is date-only by default. IPAX doesn't need dates; this is forward-looking.
3.  **Timezone policy**: if `$date` is UTC-only, all timezone logic lives in the host. If `$date` is timezone-aware, the spec must define how timezones are represented and validated.
4.  **The Excel question**: the design declaration is that business logic starts with Excel as the incumbent. Excel's date model (serial number, no timezone, 1900 leap year bug) is the floor, not the ceiling. JSOL `$date` must map cleanly to Excel while remaining saner than Excel.

* * *

### `$c`/`$cur` — Currency

**Status:** Reserved. Definition not started.

**Why it exists:** Financial logic is core business logic. Currency is more than a number: it carries scale (2 decimals for USD, 0 for JPY, 3 for KWD) and rounding rules (half-up for commercial, half-even for banking).

**Related:** `$dec` decimal type (N-17 in Semantic Parity) is the numeric foundation. `$cur` would wrap `$dec` with currency semantics.

**Open questions:**

1.  Does `$cur` carry a currency code (USD, EUR, JPY)? Or is it just a fixed-decimal number?
2.  How does it serialize to JSON? As string `"19.99 USD"`? As number `19.99`? As object `{"amount": 19.99, "currency": "USD"}`?
3.  Excel: currency formatting is a _display_ concern in Excel, not a type. Does JSOL `$c` map to a number with format, or to a distinct type?

* * *

### `$p`/`$per` — Percentage

**Status:** Reserved. Definition not started.

**Why it exists:** Percentages are semantically distinct from floats: 15% is not 0.15, it's "15 percent". Mixing them silently is a source of real bugs (15% + 0.15 = ?).

**Open questions:**

1.  Internal representation: stored as 0.15 or as 15?
2.  Arithmetic: `$per + $per` = ? `$per * $num` = ? `$per * $cur` = ?
3.  Excel: percentage is a display format over a number, not a type.

* * *

### `$g`/`$geo`/`$deg` — Geometry/Angle

**Status:** Reserved. Definition not started.

**Why it exists:** Angles have units (degrees, radians, sexagesimal degrees-minutes-seconds) and periodic semantics (360° = 0°). Mixing degrees and radians silently is a classic bug in geometry code. This type would allow sexagecimal math (degrees-minutes-seconds).

**Relevance to IPAX:** Color science uses angles extensively (hue in HSL/HSV/OKLCH is an angle).

**Open questions:**

1.	Normalization: is 370° equal to 10°?
2.	Number format: the classic format `1° 15′ 25″ 36‴ 49⁗` uses characters that users can't type easily; there are _tutorials_ on the Internet about how to get them. Neugebauer's notational system (e.g. `29;31,50,8,20`) can be considered, as well as optional convenience formats as `359 59 59`. Output should follow a single standard, per Postel's Law.
3.	Prefix: `$g` was chosen as a single character without collision with other types.
If defined as a custom type, `$deg` may be more intuitive. While technically this type would be about sexagesimal math, using `$sex` is out of the question.

* * *

### `$t` — Time/Duration

**Status:** Reserved. Definition not started.

**Why it exists:** Durations ("90 minutes", "3 business days") are different from instants ("August 18, 2026 at 14:30"). Mixing them is a bug.

**Open questions:**

1.  Is `$t` a duration (elapsed time) or a time-of-day?
2.  If duration: what units internally? Milliseconds? Seconds? Days?
3.  Business durations: "business days" exclude weekends and holidays — is that calendar logic in the host or in JSOL?

* * *

## Types Under Consideration

Types that have been identified as potentially useful but are **not yet reserved** in the spec.

* * *

### `Set` — Unordered Collection of Unique Values

**JS native:** Yes (ES6 `Set`).  
**PHP native:** No — simulated with associative array keys.  
**Python native:** Yes (`set`).  
**Go native:** No built-in — uses `map[T]struct{}`.  
**Rust native:** Yes (`HashSet`, `BTreeSet`).

**Use cases:** deduplication, membership testing, set operations (union, intersection, difference), flood-fill visited tracking, unique color extraction from images.

**Why not yet reserved:** Everything expressible with `$m` (Map with boolean values or keys). The question is whether the added clarity justifies the added surface area.

**Open question:** iteration order — JS `Set` preserves insertion order; Python `set` does not guarantee; Go map keys are random. If `Set` is added, it must have the same deterministic ordering contract as `Map.keys`.

* * *

### `BigInt` — Arbitrary-Precision Integer

**JS native:** Yes (ES2020).  
**PHP native:** No — integers are platform-dependent (64-bit typically).  
**Python native:** Yes — all integers are arbitrary-precision.  
**Go native:** No (`math/big` is a library).  
**Java native:** Yes (`BigInteger`).

**Use cases:** cryptographic hashes, IDs beyond 2^53, exact integer arithmetic on very large values.

**Why not yet reserved:** `$q` already has a defined bounded domain (`[-(2^53-1), 2^53-1]`, pending N-23). BigInt is a different type with different serialization (`"123456789..."` as string in JSON).

**Open question:** JSON serialization. `BigInt` cannot be serialized by `JSON.stringify` without custom serialization. JSOL would need `Cast.toStr` for BigInt explicitly.

* * *

### TypedArrays — Fixed-Width Numeric Arrays

**JS native:** Yes (11 types: `Int8Array`, `Uint8Array`, `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `Float32Array`, `Float64Array`, `BigInt64Array`, `BigUint64Array`, `Uint8ClampedArray`).  
**PHP native:** No.  
**Python native:** Partially (`array` module, `memoryview`).  
**Go native:** Yes (`[]int32`, `[]float64`, etc.).  
**C native:** Yes (`int32_t[]`, `double[]`).

**Use cases:** efficient numeric processing — image pixels, audio samples, scientific data.

**Why not a JSOL type:** This is an _optimization_, not a semantic distinction. `$a` of numbers already expresses a list of numbers. The compiler can emit a TypedArray in JS when it can infer the element type, and a contiguous array in C. The JSOL author shouldn't need to care.

**Recommendation:** Compiler-level optimization, not language feature.

* * *

## Excluded Types

Types that exist in one or more target languages but are **deliberately excluded** from JSOL, with rationale.

| Type | Why excluded |
| --- | --- |
| `undefined` | JS-only concept. Creates a third state no other target has. All cases that would produce `undefined` are defined errors in JSOL. (B-03 in Semantic Parity) |
| `NaN` / `Infinity` as values | Not JSON-serializable. JSOL defines these as unreachable via defined error conditions (N-06, N-08). |
| `Function` as first-class value beyond `$f` | JSOL functions are declarations, not data. Functions cannot be stored in arrays, maps, or passed as dynamic values. |
| `Promise` / `async` | Explicitly excluded: JSOL is synchronous. All async orchestration lives in the host. (Rule: no async in JSOL) |
| `Symbol` | No business-logic use case. Irrelevant. |
| `WeakMap` / `WeakSet` | Garbage-collection-dependent. No deterministic semantics. |
| `Proxy` / `Reflect` | Metaprogramming. No place in a restricted DSL. |
| `Generator` / `Iterator` | Stateful, lazy evaluation. Breaks determinism guarantees. |
| `class` / `this` / `new` / inheritance | Explicitly excluded. Flat data only. (Spec Section 2) |
| `Error` as catchable type | JSOL has a defined error model (C-07) but does not support try/catch within JSOL code. Errors propagate to the host. |
| `RegExp` as native type | Replaced by JSOL's own Thompson VM regex engine (`Regex.*`). Native regex syntax is not JSOL. |

* * *

## Principle Summary

1.  **JSON-native types are the foundation.** Anything JSOL declares must have a defined JSON serialization or an explicit non-serialization contract.
2.  **A type is JSOL-native if business logic needs it, not if a target language has it.** `$y` (bytes) is needed for IPAX. `Symbol` is not needed for anything.
3.  **Reserved types are promises, not implementations.** A prefix being reserved means the spec has committed to the _name_ and _direction_ — not to the full semantics. Reserved types prevent Hyrum's Law: once someone writes `$d` in a JSOL file, the meaning can't be repurposed.
4.  **The Excel question applies to every type.** Excel is the incumbent lingua franca of business logic. Every JSOL type must either map cleanly to Excel (dates → serial numbers, percentages → display formats) or justify why it doesn't.
5.  **Types with no cross-target agreement are excluded.** `undefined`, `NaN`, `Symbol`, `Proxy` — if it doesn't exist in at least 6 of the 8 priority targets, it's not JSOL.

* * *

_This document was produced with systematic AI co-piloting as described in [`AI_ENGINEERING_METHODOLOGY.md`](ai_engineering_methodology.md/)._

* * *

_JSOL v0.2.x — 2026-08-18, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](https://../LICENSE)_