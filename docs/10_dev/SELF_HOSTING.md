# Self-Hosting: The Compiler Compiles Itself

The JSOL compiler ('jsol-compiler-src/') is written in JSOL. It compiles itself to all its supported targets, and the result of that self-compilation is byte-for-byte identical to the compiler it started from.

## Milestone v0.2.90: Thompson VM Integration & Self-Hosting Purity

In v0.2.90, the compiler integrated its own Thompson VM Regex Engine ('regex.jsol') written in 100% pure JSOL. This eliminated target-specific environment isolation blocks ('JSOL.JS' / 'JSOL.PHP') from the compiler source logic.

Fixed-point convergence holds across both Node.js and PHP hosts, producing byte-identical transpiled output.

## What "self-hosting" means here

There are two distinct claims, and it's worth keeping them separate:

1. The compiler is written in the language it compiles. 'js-compiler.jsol', 'php-compiler.jsol', 'lexer.jsol', 'linter.jsol', and the rest of 'jsol-compiler-src/' are '.jsol' files. Nothing about the compiler's own source gets a syntactic exemption.
2. Fixed-point convergence. Take the compiler (generation N), have it compile its own source (generation N+1). Take generation N+1, have it compile the same source again (generation N+2). If generation N+1 and generation N+2 are identical, the compiler has reached a fixed point: it no longer changes when it compiles itself.

Claim 2 is the one that actually matters. A compiler can be "written in its own language" trivially and still be wrong. Fixed-point convergence is the proof that it's stable.

## Why this was hard, and what it caught

Getting to a fixed point surfaced real, load-bearing bugs, not cosmetic ones:
- The meta-compilation paradox (linter forbidding '.length').
- A masking regex asymmetry between engines.
- An incomplete prefix list in the 'let'/'const'/'var' stripping logic.
- A real, silent correctness regression inside the 'JSOL.len()' wrapper.

## Running the Fixed-Point Verification

The manual compilation steps have been superseded by an automated fixed-point verification suite ('00-compile-verify-jsol.sh'). 

For instructions on how to run this test and deploy the compiler distributions, see [docs/30_tools/CODE_POINT_VERIFICATION.md](../30_tools/CODE_POINT_VERIFICATION.md).

* * *

*JSOL v0.2.95 — 2026-08-21, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*