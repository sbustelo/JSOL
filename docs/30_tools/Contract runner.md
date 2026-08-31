# JSOL Contract Runner Documentation

## Overview
The JSOL Contract Runner (jsol-compiler-src/tools/contract-runner.js) is the core isomorphic testing engine for the JSOL project. It parses '@contract' blocks embedded in JSOL source files, automatically compiles them to all supported target languages (JavaScript, PHP, TypeScript, Python), executes them natively in their respective environments, and mathematically asserts bit-for-bit parity across all outputs.

**Example**
```js
cd jsol-compiler-src
node tools/contract-runner.js --source-dir=../examples --no-bail
```

## CLI Arguments

### --source=[path]
Executes the contract runner against a single, specific JSOL file.
Example: node tools/contract-runner.js --source='../examples/01-basics/digit-sum.jsol.js'

### --source-dir=[path]
Scans a directory recursively for all valid JSOL files (ending in .jsol or .jsol.js) and adds them to the execution batch. Files starting with an underscore (_) are ignored.
Example: node tools/contract-runner.js --source-dir='../examples'

### --no-bail
By default, the runner stops execution and exits with status 1 on the very first compilation or parity error. Passing '--no-bail' forces the runner to log the error and continue executing the remaining test cases, summarizing all failures at the end of the run.
Example: node tools/contract-runner.js --source-dir='../examples' --no-bail

### --filter=[string]
Restricts the execution batch to files whose filename contains the specified substring. Useful for running targeted domains without executing the entire suite.
Example: node tools/contract-runner.js --source-dir='../examples' --filter='validator'

## Execution Pipeline

1. AST-Free Parsing: The runner scans the source files for '@contract' multi-line comment blocks using regular expressions.
2. Staging: Valid files are copied into a temporary staging area (_test_bin/staging_src).
3. Batch Compilation: The stable Node.js JSOL compiler (jsol-compiler-node) is invoked to transpile the staged files into JS, PHP, TS, and PY simultaneously.
4. TypeScript Sandbox: A temporary tsconfig is generated to transpile the resulting TypeScript files into executable JavaScript, ensuring type compliance.
5. Isomorphic Execution:
   - JS/TS: Executed via Node.js 'require'.
   - PHP: Executed via a temporary runner.php script spawned in a child process.
   - Python: Executed via a temporary runner.py script spawned in a child process.
6. Assertion: The outputs of all four environments are serialized to JSON and strictly compared. If any environment deviates, or if it deviates from an explicit 'expect' definition, a PARITY FAILURE or CONTRACT FAILURE is thrown."