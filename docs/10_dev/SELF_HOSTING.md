# Self-Hosting: The Compiler Compiles Itself

The JSOL compiler (`jsol-compiler-src/`) is written in JSOL. It compiles itself, to both its own JS and PHP targets, and the result of that self-compilation is byte-for-byte identical to the compiler it started from. This document explains what that means and why it's a real milestone, not a party trick.

## Milestone v0.2.90: Thompson VM Integration & Self-Hosting Purity

In v0.2.90, the compiler integrated its own Thompson VM Regex Engine ('regex.jsol') written in 100% pure JSOL. This eliminated target-specific environment isolation blocks ('JSOL.JS' / 'JSOL.PHP') from the compiler source logic.

Fixed-point convergence holds across both Node.js and PHP hosts, producing byte-identical transpiled output.

## What "self-hosting" means here

There are two distinct claims, and it's worth keeping them separate:

1.  **The compiler is written in the language it compiles.** `js-compiler.jsol`, `php-compiler.jsol`, `lexer.jsol`, `linter.jsol`, and the rest of `jsol-compiler-src/` are `.jsol` files, subject to the same grammar as any business-logic file. Nothing about the compiler's own source gets a syntactic exemption.
2.  **Fixed-point convergence.** Take the compiler (generation N), have it compile its own source (generation N+1). Take generation N+1, have it compile the same source again (generation N+2). If generation N+1 and generation N+2 are identical, the compiler has reached a fixed point: it no longer changes when it compiles itself, on either the Node or the PHP host.

Claim 2 is the one that actually matters. A compiler can be "written in its own language" trivially and still be wrong — self-referential in form but not stable in practice. Fixed-point convergence is the proof that it's stable: the compiler's own understanding of the language doesn't drift the more generations you run it through.

## Why this was hard, and what it caught

Getting to a fixed point surfaced real, load-bearing bugs, not cosmetic ones:

-   **The meta-compilation paradox.** The linter forbids `.length` as a native property access, but the compiler's own transpilation logic needs the literal string `.length` inside a replacement pattern (to turn `JSOL.count($x)` into `$x.length` for the JS target). A naive text-scanning linter can't tell "code" from "the string data a compiler legitimately needs to write." The fix wasn't an exemption list; it was making the linter check tokens, not raw text, using the same masking pass the compiler already uses to separate string/comment literals from executable code before doing anything else with them.
-   **A masking regex asymmetry between engines.** A single over-escaped character class in the JS branch of the source-masking pattern caused line comments to be matched incorrectly under Node — silently, only when the comment happened to contain certain letters, which is to say: almost always.
-   **An incomplete prefix list in the `let`/`const`/`var` stripping logic.** PHP-target output kept a stray `let` in any `for (let $i = ...)` loop, because the stripping logic only recognized declarations preceded by whitespace, not by `(`. This is exactly the kind of gap that a hand-written regex transpiler is prone to, and exactly the kind of gap fixed-point testing is designed to catch, because it doesn't just check that output looks right, it checks that the compiler agrees with itself.
-   **A real, silent correctness regression.** The self-hosted `JSOL.len()` wrapper resolved to PHP's `strlen()` (byte length) instead of `mb_strlen($x, "UTF-8")` (codepoint length) — reintroducing, inside the compiler meant to prevent it, the exact JS/PHP string-length asymmetry `JSOL.len()` exists to eliminate.

None of these were caught by comparing the compiler's output to what a human expected it to look like. They were caught by comparing the compiler's output to itself, across two independent host runtimes, across two generations.

## Why it matters going forward

Once fixed-point convergence holds, the legacy bootstrap compiler (`jsol-compiler1/`, hand-written in PHP) is no longer required for JSOL's continued development. Any future change to the language or the compiler goes through JSOL itself: write the change in `.jsol`, compile it with the current self-hosted compiler, verify the fixed point still holds. The language is now provably expressive enough to describe its own toolchain, and that toolchain is provably stable under its own scrutiny. That's the bar this milestone represents.

## Running the Fixed-Point Verification

The manual compilation steps have been superseded by an automated fixed-point verification suite. The pipeline guarantees that the seed engine can compile Generation 3, which in turn compiles Generation 4, achieving 100% Code Point and Fixed-Point parity across both Node and PHP targets.

To run the verification suite from a clean checkout, execute the following script from the repository root:

```bash
cd jsol-compiler-src
./00-compile-verify-jsol.sh
```

### What the script does automatically:

1.  **Bootstrap & Seed Preparation:** Runs `tools/bootstrap.js` to assemble the Single Source of Truth (SSOT) into `dist/compiler/jsol-spec.json` and copies the current stable distributions into a temporary `_seed_engine`.
2.  **Compile Generation 3:** Uses the seed Node and PHP engines to compile the `jsol-compiler-src/*.jsol` source code into `_build_node_gen3` and `_build_php_gen3`.
3.  **Compile Generation 4:** Uses the newly minted Generation 3 orchestrators to compile the source code again into `_build_node_gen4` and `_build_php_gen4`.
4.  **Fixed-Point Verification:**
    
    -   Compares Node Gen 3 vs Node Gen 4 (Temporal fixed-point).
    -   Compares PHP Gen 3 vs PHP Gen 4 (Temporal fixed-point).
    -   Compares Node Gen 4 vs PHP Gen 4 (Isomorphic fixed-point).
5.  **TypeScript Validation:** Runs `npx tsc --noEmit` against the Generation 4 TS output to ensure zero strict-typing errors.
6.  **Deployment:** If all assertions pass, it prompts the developer for permission to overwrite the public distributions (`../jsol-compiler-node`, `../jsol-compiler-php`, `../jsol-compiler-ts`) with the verified Generation 4 artifacts.

Any divergence, undefined variable, or compilation timeout will instantly abort the script, preventing unstable artifacts from reaching the distribution directories.

* * *

*JSOL v0.2.94 — 2026-08-20, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*