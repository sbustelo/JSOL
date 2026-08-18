# EXTENDING-SEMANTIC-PARITY-table.md

_Compact reference for AI-assisted gap analysis. Companion to [`EXTENDING-SEMANTIC-PARITY.md`](extending-semantic-parity.md), a complement of [`EXTENDING.md`](extending.md)._

JSOL exists to guarantee **Deterministic Parity**: the same `.jsol` source compiled to any target language must produce bit-for-bit identical output. Semantic divergences between languages — where the same expression means something slightly different depending on the target — are the primary blockers to that guarantee.

This table lists every divergence identified across multiple rounds of AI evaluation, condensed to one line each: the problem, the example, the risk. **Risk 5** = can produce silently wrong business results in JS/PHP today; **Risk 1** = theoretical or requires exotic target/build flags. The full analysis, proposed wrappers, and per-target implementation notes live in the companion document.

* * *

# JSOL Semantic Parity — Divergence Index

## Numeric (N)

| ID  | Problem | Risk |
| --- | --- | --- |
| N-01 | `7/2` = 3.5 in JS/PHP, 3 in C/Go/Java — integer division truncates | **5** |
| N-02 | `-7 % 3` = -1 in JS/C, 2 in Python/Ruby — modulo sign differs | **5** |
| N-03 | `round(2.5)` = 3 in JS/Go, 2 in Python/C# — banker's vs half-up | **5** |
| N-04 | `(1.005).toFixed(2)` = "1.00" in JS, 1.01 in PHP — decimal rounding | **5** |
| N-05 | `0.1 + 0.2` = 0.30000000000000004 in JS, "0.3" in PHP display | **5** |
| N-06 | `JSON.stringify(NaN)` = "null" in JS, `false` in PHP, error in Go | **5** |
| N-07 | `min(NaN, 5)` = NaN in JS, 5 in PHP — PHP ignores NaN | **3** |
| N-08 | `7/0` = Infinity in JS, exception in Python/PHP, UB in C | **5** |
| N-09 | `2147483647 + 1` wraps in Go/Java, UB in C, safe in JS | **4** |
| N-10 | `abs(-9223372036854775808)` = negative in Java, UB in C | **2** |
| N-11 | `sin`, `cos`, `pow` differ in last bit across targets (libm variance) | **4** |
| N-12 | `true + 1` = 2 in all, but spec doesn't say if allowed | **2** |
| N-13 | `"12abc"` as int = 12 in JS/PHP, error in Python/Go | **4** |
| N-14 | `String(0.1+0.2)` = "0.30000000000000004" in JS, "0.3" in PHP | **5** |
| N-15 | JSON `1` vs `1.0` — some parsers lose the distinction | **3** |
| N-16 | `$q * $q` can overflow even if final result fits | **3** |
| N-17 | No decimal type for exact money math (0.1+0.2 problem) | **5** |
| N-18 | `-0` serializes as "0" in JS, "-0" in PHP, "-0.0" in Python | **3** |
| N-19 | `"a" \\|\\| "b"` returns "a" in JS, true in PHP, error in Go | **3** |
| N-20 | `(int)1e20` = 0 in JS, bigint in Python, UB in C | **4** |
| N-21 | `floor(5)` returns int in Python, float in PHP/Go/Java | **2** |
| N-22 | `9007199254740993` loses precision in JS, exact in Go/Java | **4** |
| N-23 | `$q` undefined: 64-bit? arbitrary? bounded? | **5** |
| N-24 | `$q = 99999999999999999999999` — reject? round? BigInt? | **2** |
| N-25 | `1e308 * 1e308` = Infinity in most, exception in some | **3** |
| N-26 | `1e-315 / 2` = 5e-316 in x86, 0.0 in ARM/WASM (FTZ) | **1** |
| N-27 | `INT_MIN / -1` = wrap in Java, UB in C, panic in Rust | **3** |
| N-28 | `pow(-8, 1/3)` = NaN in JS, complex number in Python | **2** |
| N-29 | `5.5 % 2` = 1 in PHP (truncates), 1.5 in JS, error in C | **4** |
| N-30 | `sqrt(-1)` = NaN in JS/C, exception in Python | **3** |
| N-31 | `9007199254740993 == 9007199254740992.0` true in JS, false in Python | **4** |
| N-32 | `1 << 33` = 2 in JS/Java (mask), full value in Go, UB in C | **3** |
| N-34 | `int("9"*5000)` error in Python (4300 digit limit), OK elsewhere | **1** |
| N-35 | `null + 1` = 1 in JS/PHP, TypeError in Python, compile error in Go | **3** |
| N-36 | `(int)NaN` = 0 in Rust, error in Python, UB in C | **2** |
| N-37 | `a*b+c` with FMA can differ in last bit (C/Go vs JS/PHP) | **2** |
| N-38 | `min(+0, -0)` = -0 in JS, +0 in C# | **2** |
| N-39 | `""` as float = 0 in JS/PHP, ValueError in Python | **3** |
| N-40 | `abs(-DBL_MIN)` with FTZ flushes to 0 | **1** |
| N-41 | `(int)1e20` = 0 silently in JS/PHP (not error, not saturation) | **4** |

* * *

## String (S)

| ID  | Problem | Risk |
| --- | --- | --- |
| S-01 | `"😀".length` = 2 in JS (UTF-16), 1 in Python (code point), 4 in Go (bytes) | **5** |
| S-02 | `"😀"[0]` = half surrogate in JS, full char in Python, byte in Go | **5** |
| S-03 | `"😀".slice(0,1)` cuts emoji in half in JS, full emoji in Python | **4** |
| S-04 | `"abc".indexOf("x")` = -1 in JS/Python, false in PHP | **3** |
| S-05 | `"abc".split("")` works in JS/PHP, ValueError in Python, extra empties in Rust | **3** |
| S-06 | `"é"` vs `"e\\u0301"` — visually same, different code points, comparison fails | **4** |
| S-07 | `"i".toUpperCase()` = "İ" in Turkish locale (Java/C#), "I" elsewhere | **3** |
| S-08 | `"\\u00A0".trim()` removes in JS, keeps in PHP | **2** |
| S-09 | `"😀" < "\\uE000"` = true in JS (UTF-16), false in Python (code point) | **3** |
| S-10 | `replace("a","X")` = first only in JS, all in PHP/Python | **3** |
| S-11 | `fromChar(65)` = "A" in all, but domain differs: byte vs UTF-16 vs code point | **2** |
| S-12 | `"👨‍👩‍👧‍👦".length` = 7 code points but 1 visual character | **2** |
| S-13 | Isolated surrogate `"\\uD800"` valid in JS, invalid in Go/Python | **3** |
| S-14 | `"Total: " + 42` works in JS/Java, TypeError in Python/Go | **2** |
| S-15 | `"a\\0b"` — C truncates at `\\0`, JS/Python keep 3 chars | **2** |
| S-16 | Unicode version changes case mapping and normalization | **1** |
| S-17 | `"10" < "9"` = false in PHP (numeric compare), true elsewhere | **4** |
| S-18 | `"abc"[99]` = undefined in JS, error in Python, panic in Go | **3** |
| S-19 | `"a,b,".split(",")` drops trailing empty in JS, keeps in Python | **2** |
| S-20 | `"abc".slice(0,-1)` works in JS/Python, no equivalent in Go | **3** |
| S-21 | `"ab" * 3` = "ababab" in Python, NaN in JS, no operator in PHP | **1** |
| S-22 | `$s[0] = "x"` mutates in PHP, silent no-op in JS | **2** |
| S-23 | `strcmp("a","b")` returns -1 in C, but magnitude varies by implementation | **1** |
| S-24 | `"value: " + null` = "value: null" in JS, "value: " in PHP | **2** |
| S-25 | `indexOf("abc", "")` = 0 in PHP 8, false in PHP 7 | **2** |
| S-26 | `replace("$100", "$200")` — `$` is backreference in JS regex mode | **3** |

* * *

## Array (A)

| ID  | Problem | Risk |
| --- | --- | --- |
| A-01 | `arr[99]` (len 3) = undefined in JS, IndexError in Python, garbage in C | **5** |
| A-02 | `arr[-1]` = last element in Python/Ruby, error in Go/Rust | **3** |
| A-03 | `[1,2] === [1,2]` = false in JS (identity), true in PHP/Python (deep) | **5** |
| A-04 | `slice(1,3)` = end index in JS, length in PHP | **3** |
| A-05 | `[1,"1"].indexOf(1)` — loose in PHP, strict in JS | **3** |
| A-06 | `[].pop()` = undefined in JS, null in PHP, IndexError in Python | **3** |
| A-07 | `[1,"a",true]` valid JSON, invalid in Go/Rust/Java | **3** |
| A-08 | `[10,1,2].sort()` = \\[1,10,2\\] in JS (alphabetical), \\[1,2,10\\] in Python | **3** |
| A-09 | `a[10] = 1` on empty: sparse array in JS, key "10" in PHP, error in Python | **3** |
| A-10 | Circular array (`a.push(a)`) — JSON.stringify throws, json\\_encode returns false | **2** |
| A-11 | `["A",null,"B"].join("-")` = "A--B" in JS, "A-B" in PHP, TypeError in Python | **3** |
| A-12 | `delete arr[1]` = hole in JS, shifts in Python, preserves keys in PHP | **2** |
| A-13 | `$b = $a; push($b, 1)` mutates `$a` in JS, not in PHP (COW) | **5** |
| A-14 | `push()` during loop iteration — behavior undefined in most | **3** |
| A-15 | `push()` returns new length in JS, None in Python, unit in Rust | **3** |
| A-16 | Go `append` on shared slice may mutate caller or not, depending on capacity | **3** |
| A-17 | `sort` with NaN/undefined — JS moves undefined to end, Python crashes | **2** |
| A-18 | PHP `+` on arrays = key union, not concatenation | **2** |
| A-19 | Go slice aliasing — two slices share backing array silently | **3** |
| A-20 | `[1,2] < [1,3]` = true in Python (lexicographic), "1,2"<"1,3" in JS | **2** |
| A-21 | `null[0]` = TypeError in JS, null+warning in PHP | **2** |
| A-22 | `[1,2,3].slice(0,99)` clamps in JS/Python, panics in Go/Rust | **2** |
| A-23 | `new Array(3)` = holes in JS, \\[0,0,0\\] in other languages | **3** |

* * *

## Map (M)

| ID  | Problem | Risk |
| --- | --- | --- |
| M-01 | Map iteration order: insertion in JS/PHP/Python, random in Go/Rust | **5** |
| M-02 | PHP casts keys: `"1"` becomes `1`, `true` becomes `1`, `null` becomes `""` | **4** |
| M-03 | `isset($m["x"])` = false if value is null in PHP — must use `array_key_exists` | **3** |
| M-04 | Missing key: undefined in JS, zero-value in Go (dangerous!), panic in Rust | **5** |
| M-05 | Duplicate keys in `Map.create` — last wins in JS/Python, undefined in JSON spec | **3** |
| M-06 | `{a:1,b:2}` vs `{b:2,a:1}` — equal? PHP/Python yes, JS identity no | **3** |
| M-07 | Mutating map during iteration — behavior differs or crashes | **2** |
| M-08 | PHP `json_encode` escapes `/` as `\\/` and Unicode, JS doesn't | **4** |
| M-09 | Key `"__proto__"` overwrites prototype in JS plain object, harmless in PHP | **3** |
| M-10 | `1` and `"1"` as map keys: distinct in JS Map, collide in PHP | **4** |
| M-11 | `{}` vs `{"x": null}` vs `{"x": ""}` — three different states, some languages blur them | **4** |
| M-12 | `{True: 'a'}` and `{1: 'b'}` collide in Python (hash(True)==hash(1)) | **2** |
| M-13 | Empty map `{}` serializes as `[]` in PHP if it was ever an array | **3** |
| M-14 | `Object.keys({10:"a",2:"b"})` reorders numeric keys in JS — compiler bug today | **4** |

* * *

## Boolean/Null (B)

| ID  | Problem | Risk |
| --- | --- | --- |
| B-01 | `String(true)` = "true" in JS, "1" in PHP, "True" in Python | **3** |
| B-02 | JSON has `null`, JSOL spec doesn't define it | **4** |
| B-03 | JS has `undefined` AND `null`; others only `null` | **4** |
| B-04 | Go: empty string and missing string are indistinguishable | **2** |
| B-05 | Falsy set differs: `"0"` falsy in PHP, truthy in JS; `[]` falsy in PHP, truthy in JS | **4** |
| B-06 | `0 == "foo"` true in PHP 7, false in PHP 8; `null == undefined` only JS | **3** |
| B-07 | `null < 1` = true in JS (coerces to 0), TypeError in Python | **2** |

* * *

## Cross-Cutting (C)

| ID  | Problem | Risk |
| --- | --- | --- |
| C-01 | `-2^2` = 4 in Excel, -4 in Python, SyntaxError in JS — precedence not portable | **2** |
| C-02 | PHP: `$i` from `for` loop remains alive after loop — no block scope | **2** |
| C-03 | PHP 7 vs 8 changes `"abc" == 0`, sort stability, division by zero | **3** |
| C-04 | `Date.now()` / `random()` inside JSOL = non-deterministic by definition | **3** |
| C-05 | Pass array to function, mutate inside: JS mutates original, PHP doesn't (COW) | **5** |
| C-06 | `-1 >>> 1` = 2147483647 in JS, doesn't exist in PHP/C | **3** |
| C-07 | "Error" undefined in spec: throw? return null? panic? exception? | **5** |
| C-08 | If `foo()` errors, does `bar()` still run? Is error catchable? | **4** |
| C-09 | `f(g(), h())` — argument evaluation order unspecified in C, left-to-right in JS | **4** |
| C-10 | Locale affects number formatting, case mapping, collation in Java/C#/PHP | **2** |
| C-11 | Regex: lookbehind, backreferences, Unicode properties all differ | **3** |
| C-12 | Dates/timezones — explicitly out of scope v0.2.x | **2** |
| C-13 | Recursion depth limit: ~1000 in Python, ~10000 in JS, variable in Go | **2** |
| C-14 | JSON parse/serialize contract: key order, escaping, `-0`, exponents | **4** |
| C-15 | Tail-call optimization: Haskell/Elixir yes, JS/Python/Java no | **2** |
| C-16 | Haskell lazy evaluation: errors in unfocused branches never occur | **2** |
| C-17 | `assert` removed in release builds (C NDEBUG, Python -O, Rust release) | **1** |
| C-18 | `switch`: fallthrough in JS/C/PHP, break in Go, no switch in Python | **3** |
| C-19 | `3 > 2 > 1` = true in Python (chained), false in JS (coerces boolean to number) | **2** |
| C-20 | `2.9 \\| 0` = 2 in JS (ToInt32), error in Python, bytewise on strings in PHP | **2** |
| C-21 | Default args evaluated once in Python (mutable default trap), per-call in JS | **2** |
| C-22 | NaN payload bits preserved in C/Rust, canonicalized in JS | **1** |
| C-23 | `for (i < Arr.count(a))` with mutation inside: bound re-evaluated per iteration? | **3** |

* * *

## Target Families (T)

| ID  | Observation |
| --- | --- |
| T-01 | Functional pure (Haskell, Elixir, Clojure): no loops, exact rationals |
| T-02 | Vectorized (R, Julia): 1-based indexing, vector recycling |
| T-03 | Bare metal (WASM, LLVM IR): no strings, manual memory |
| T-04 | Solidity: no floats, revert on overflow |
| T-05 | Haxe: inherits underlying target semantics |
| T-06 | Excel: MOD sign, ROUND mode, `0^0` = error |
| T-07 | Lua: 1-based, `#` undefined on holes, string↔number coercion |
| T-08 | Julia/R: `missing`/`NA` three-valued logic propagation |
| T-09 | WASM: no strings, NaN canonicalization, i64↔JS boundary |

* * *

## Summary

| Domain | Entries | Risk 5 | Risk 4 |
| --- | --- | --- | --- |
| Numeric | 41  | 8   | 10  |
| String | 26  | 2   | 4   |
| Array | 23  | 2   | 0   |
| Map | 14  | 2   | 5   |
| Boolean/Null | 7   | 0   | 3   |
| Cross-Cutting | 23  | 2   | 4   |
| Target Families | 9   | 0   | 0   |
| **Total** | **143** | **16** | **26** |

* * *

_Risk 5 = silently wrong business results possible in JS/PHP today with current compilers. Risk 1 = requires exotic target, specific build flags, or theoretical scenario._