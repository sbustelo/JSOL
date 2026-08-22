# BOOTSTRAP.md: SSOT Maintenance

Executing 'node tools/bootstrap.js' is required in 4 specific scenarios whenever the Single Source of Truth (SSOT) or execution environments are modified:

- Target rules changes (targets/): Whenever you edit or add substitution/conversion rules in targets/js/rules.json, targets/php/rules.json, targets/ts/rules.json, or targets/python/rules.json.
- Domain changes (domains/): When adding or modifying types in domains/core/types.json or primitives in domains/core/primitives.json.
- Polyfill modifications: Whenever you update the native polyfill code in domains/core/polyfills.js, domains/core/polyfills.php, or domains/core/polyfills.py.
- Initial setup / CI/CD: After cloning the repository or cleaning the dist/ directory, to generate the specification file dist/compiler/jsol-spec.json before starting the compilation or self-hosting cycle.

## How to Run bootstrap.js

To execute bootstrap.js and regenerate the dist/ directory with the updated SSOT specification, run the following command from the source root (jsol-compiler-src/):

```Bash
node tools/bootstrap.js
```

**Requirements and Behavior**

- Environment: Requires Node.js installed on the system.
- Required Directories: Must be executed with the domains/, targets/, and tools/ structure present in the root directory.
- Produced Output:
  * Validates rule parity across JS, PHP, TS, and Python targets (aborts execution if a translation is missing).
  * Creates the dist/compiler/ directory and writes the jsol-spec.json file.
  * Copies native polyfills to dist/stdlib/ (jsol-core.js, jsol-core.php, and jsol_core.py).

* * *

*JSOL v0.2.95 — 2026-08-21, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*