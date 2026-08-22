# Code Point Verification (Fixed-Point Parity)

The ultimate test of JSOL's self-hosting architecture. The script '00-compile-verify-jsol.sh' verifies that the compiler can compile itself without mutating infinitely, reaching a 'Fixed-Point'.

## Running the Verification

To run the verification suite from a clean checkout, execute the following script from the repository root:

    cd jsol-compiler-src
    bash 00-compile-verify-jsol.sh

## What the script does automatically:

1. Bootstrap & Seed Preparation: Runs 'tools/bootstrap.js' to assemble the SSOT and copies the current stable distributions into a temporary '_seed_engine'.
2. Compile Generation 3: Uses the seed Node and PHP engines to compile the 'jsol-compiler-src/*.jsol' source code into '_build_node_gen3' and '_build_php_gen3'.
3. Compile Generation 4: Uses the newly minted Generation 3 orchestrators to compile the source code again into '_build_node_gen4' and '_build_php_gen4'.
4. Fixed-Point Verification:
   - Compares Node Gen 3 vs Node Gen 4 (Temporal fixed-point).
   - Compares PHP Gen 3 vs PHP Gen 4 (Temporal fixed-point).
   - Compares Node Gen 4 vs PHP Gen 4 (Isomorphic fixed-point).
5. TypeScript Validation: Runs 'npx tsc --noEmit' against the Generation 4 TS output to ensure zero strict-typing errors.
6. Deployment: If all assertions pass, it prompts the developer for permission to overwrite the public distributions ('jsol-compiler-node', 'jsol-compiler-php', 'jsol-compiler-ts', 'jsol-compiler-py') with the verified Generation 4 artifacts.

Any divergence, undefined variable, or compilation timeout will instantly abort the script, preventing unstable artifacts from reaching the distribution directories.

* * *

*JSOL v0.2.95 — 2026-08-21, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*