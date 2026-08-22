# QA Pipeline & Validation Tools

The JSOL validation ecosystem is designed to guarantee 100% Isomorphic Parity across all supported targets. It consists of three layers: the official batch orchestrator, the individual contract runner, and the standalone experimental validators.

## 1. The Official Batch Orchestrator: test-runner.sh

The primary QA tool. It searches for all '.jsol.js' files within a target directory (defaults to 'examples/'), runs the mathematical contracts, and returns an aggregated result.

Usage from the compiler source root:

    bash tools/test-runner.sh ../examples

Behavior:
- If 100% of contracts pass across all targets (JS, PHP, TS, Python), it cleans up the temporary compilation directory ('_test_bin/') and returns success.
- If a single case fails on any target, it leaves the compiled artifacts intact for debugging and exits with an error code.

## 2. The Contract Runner: contract-runner.js

The engine behind the orchestrator. It parses the '@contract' block inside a specific '.jsol' file, compiles the logic to all 4 targets, executes the targets natively (using 'node', 'php', 'python3', and 'tsc'), and verifies that the output matches bit-for-bit.

Usage:

    node tools/contract-runner.js --source=../examples/01-basics/fizzbuzz.jsol.js

## 3. Standalone Validators (Experimental pipelines)

These tools are used exclusively during compiler development to validate new transpilation steps *before* wiring them into the main 'engine.jsol' orchestrator. They operate on raw uncompiled modules loaded dynamically.

- 'test-indenter.js': Validates that the Brace-to-Indent formatter ('indenter.jsol') only alters physical layout without changing execution behavior.
- 'test-python-pipeline.js': Chains the target-specific mutators (e.g. ternary conversion, while unrolling, identifier sanitation, brace stripping) to validate the AST-free pipeline logic independently.

Note: Once an experimental pipeline reaches 100% success across all examples, its logic is integrated into the core engine and these scripts act purely as regression tests.

* * *

*JSOL v0.2.95 — 2026-08-21, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*