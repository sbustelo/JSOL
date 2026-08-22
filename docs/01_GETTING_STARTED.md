# Getting Started

JSOL ships as three separate distributions in v0.2.93.
Pick the one that matches what you're doing.

| I want to... | Use |
|---|---|
| Compile my `.jsol` files with Node | `jsol-compiler-node/` |
| Compile my `.jsol` files with PHP | `jsol-compiler-php/` |
| Compile my `.jsol` files with Python | `jsol-compiler-py/` |
| Modify the compiler itself | `jsol-compiler-src/` |

Each distribution is self-contained: copy the folder into your project and it works, no shared dependency on the others.

## CLI Arguments Reference

Both the Node.js and PHP host compilers accept the exact same arguments for granular control over the compilation process:

- --source="path/file.jsol" : (Required) Path to the input source file.
- --out-dir="path/dir" : (Optional) Destination directory. Defaults to the source file's directory.
- --targets="js,php,ts,py" : (Optional) Comma-separated list of targets to generate. Defaults to all available targets.
- --target="profileId" : (Optional) Applies a unified profile from targets.json (which defines prefixes and suffixes) across all output languages.
- --js-target="id", --php-target="id", --ts-target="id" : (Optional) Applies a specific profile from targets.json only to the matched language.
- --js-prefix="str", --php-prefix="str", --ts-prefix="str" : (Optional) Overrides the prefix wrapper for the specified language.
- --js-suffix="str", --php-suffix="str", --ts-suffix="str" : (Optional) Overrides the suffix wrapper for the specified language.

Note: Explicit prefix/suffix CLI flags take precedence over profiles defined in targets.json.

## Compiling with Node

```bash
node jsol-compiler-node/index.js --source="./my-file.jsol" --out-dir="./out"
```

Produces `./out/my-file.js`, `./out/my-file.php`, `./out/my-file.ts` and `./out/my-file.py`. By default, every compile emits all available targets to ensure isomorphic parity. However, you can filter specific targets using the `--targets` flag (e.g., `--targets=js,php`).

## Compiling with PHP

```bash
php jsol-compiler-php/index.php --source="./my-file.jsol" --out-dir="./out"
```

Same output, same three files. By default, every compile emits all available targets to ensure isomorphic parity. However, you can filter specific targets using the `--targets` flag (e.g., `--targets=js,php`). Node and PHP hosts are tested to produce byte-identical output from the same .jsol source (see [10_dev/SELF_HOSTING.md](10_dev/SELF_HOSTING.md)), so it doesn't matter which one you use day to day.

## Compiling multiple files

Both `index.js` and `index.php` accept a single `--source`. To compile a whole directory, loop over it from the shell:

```bash
for f in src/*.jsol; do
  node jsol-compiler-node/index.js --source="$f" --out-dir="./out"
done
```

## Target configuration

`targets.json`, present in each distribution, controls per-output prefix/suffix wrapping (for example, wrapping PHP output in `<?php ... ?>` or adding a license header to JS output). Edit it directly, no rebuild required, it's read at compile time.

## Editor setup

Name your source files `something.jsol`. If you want your editor to apply JavaScript syntax highlighting, linting, and autocomplete to them (most editors match by extension and don't recognize `.jsol` out of the box), name them `something.jsol.js` instead — the compiler only cares about the content, not the exact extension, and `.jsol.js` gets you full JS tooling for free while still being unambiguous about what the file is.

## Modifying the compiler

`jsol-compiler-src/` contains the compiler's own `.jsol` source (`lexer.jsol`, `linter.jsol`, `js-compiler.jsol`, `php-compiler.jsol`, `engine.jsol`, `cli-parser.jsol`, `config-parser.jsol`) plus `index.js`/`index.php` and `targets.json`. It compiles itself the same way it compiles anything else:

```bash
cd jsol-compiler-src
node index.js --source="php-compiler.jsol" --out-dir="."
```

After changing anything here, re-run the fixed-point check described in [10_dev/SELF_HOSTING.md](10_dev/SELF_HOSTING.md) before trusting the result: compile the compiler with itself twice in a row, on both hosts, and diff. If generation N+1 and generation N+2 aren't identical, something in the change broke isomorphism, and that's worth knowing before it ships.

---

*JSOL v0.2.95 — 2026-08-21, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](LICENSE)*