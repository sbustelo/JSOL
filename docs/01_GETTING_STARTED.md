# Getting Started

JSOL ships as three separate distributions in v0.2.96.
Pick the one that matches what you are doing.

| I want to... | Use |
|---|---|
| Compile my `.jsol` files with Node | `jsol-compiler-node/` |
| Compile my `.jsol` files with PHP | `jsol-compiler-php/` |
| Compile my `.jsol` files with Python | `jsol-compiler-py/` |
| Modify the compiler itself | `jsol-compiler-src/` |

Each distribution is self-contained: copy the folder into your project and it works, no shared dependency on the others.

## CLI Arguments Reference

The Node.js, PHP, and Python host compilers accept the exact same arguments for granular control over the compilation process:

- --source="path/file.jsol" : (Required if --source-dir is omitted) Path to the input source file.
- --source-dir="path/dir" : (Required if --source is omitted) Path to a directory containing `.jsol` files. Compiles all valid files in batch mode.
- --out-dir="path/dir" : (Optional) Destination directory. Defaults to the source file's directory.
- --targets="js,php,ts,py" : (Optional) Comma-separated list of targets to generate. Defaults to all available targets.
- --target="profileId" : (Optional) Applies a unified profile from targets.json (which defines prefixes and suffixes) across all output languages.
- --js-target="id", --php-target="id", --ts-target="id", --py-target="id" : (Optional) Applies a specific profile from targets.json only to the matched language.
- --js-prefix="str", --php-prefix="str", --ts-prefix="str", --py-prefix="str" : (Optional) Overrides the prefix wrapper for the specified language.
- --js-suffix="str", --php-suffix="str", --ts-suffix="str", --py-suffix="str" : (Optional) Overrides the suffix wrapper for the specified language.

Note: Explicit prefix/suffix CLI flags take precedence over profiles defined in targets.json.

## Compiling with Node

    node jsol-compiler-node/index.js --source="./my-file.jsol" --out-dir="./out"

Produces `./out/my-file.js`, `./out/my-file.php`, `./out/my-file.ts` and `./out/my-file.py`. By default, every compile emits all available targets to ensure isomorphic parity. However, you can filter specific targets using the --targets flag (e.g., --targets=js,php).

## Compiling with PHP

    php jsol-compiler-php/index.php --source="./my-file.jsol" --out-dir="./out"

Same output, same targets.

## Compiling with Python

    python3 jsol-compiler-py/index.py --source="./my-file.jsol" --out-dir="./out"

Same output, same targets. Node, PHP, and Python hosts are tested to produce byte-identical output from the same `.jsol` source (see `10_dev/SELF_HOSTING.md`), so it does not matter which one you use day to day.

## Compiling multiple files (Batch Mode)

All hosts (`index.js`, `index.php`, and `index.py`) support native batch compilation. Instead of writing shell loops, pass a directory to the `--source-dir` flag:

    node jsol-compiler-node/index.js --source-dir="./src" --out-dir="./out"

This will automatically scan `./src` for `.jsol` and `.jsol.js` files (ignoring files prefixed with an underscore `_`), compile them in memory, and output all targets to `./out`.

## Target configuration

`targets.json`, present in each distribution, controls per-output prefix/suffix wrapping (for example, wrapping PHP output in `&lt;?php ... ?&gt;` or adding a license header to JS output). Edit it directly, no rebuild required, it is read at compile time.

## Editor setup

Name your source files `something.jsol`. If you want your editor to apply JavaScript syntax highlighting, linting, and autocomplete to them (most editors match by extension and do not recognize `.jsol` out of the box), name them `something.jsol.js` instead — the compiler only cares about the content, not the exact extension, and `.jsol.js` gets you full JS tooling for free while still being unambiguous about what the file is.

## Modifying the compiler

`jsol-compiler-src/` contains the compiler's own `.jsol` source (`lexer.jsol`, `linter.jsol`, `js-compiler.jsol`, `php-compiler.jsol`, `python-compiler.jsol`, `engine.jsol`, `cli-parser.jsol`, `config-parser.jsol`) plus the orchestrators (`index.js` / `index.php` / `index.py`) and `targets.json`. It compiles itself the same way it compiles anything else:

    cd jsol-compiler-src
    node index.js --source="php-compiler.jsol" --out-dir="."

After changing anything here, re-run the fixed-point check described in `10_dev/SELF_HOSTING.md` before trusting the result: compile the compiler with itself twice in a row, on all hosts, and diff. If generation N+1 and generation N+2 are not identical, something in the change broke isomorphism, and that is worth knowing before it ships.

---

*JSOL v0.2.96 — 2026-08-25, Santiago Bustelo • MIT License*