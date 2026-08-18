# Getting Started

JSOL ships as three separate distributions in v0.2.93.
Pick the one that matches what you're doing.

| I want to... | Use |
|---|---|
| Compile my `.jsol` files with Node | `jsol-compiler-node/` |
| Compile my `.jsol` files with PHP | `jsol-compiler-php/` |
| Modify the compiler itself | `jsol-compiler-src/` |

Each distribution is self-contained: copy the folder into your project and it works, no shared dependency on the others.

## Compiling with Node

```bash
node jsol-compiler-node/index.js --source="./my-file.jsol" --out-dir="./out"
```

Produces `./out/my-file.js` and `./out/my-file.php`. Every compile emits both targets — there's no flag to compile to only one, because parity between the two is the entire point.

## Compiling with PHP

```bash
php jsol-compiler-php/index.php --source="./my-file.jsol" --out-dir="./out"
```

Same output, same two files. Node and PHP hosts are verified to produce byte-identical output from the same `.jsol` source (see [10_dev/SELF_HOSTING.md](10_dev/SELF_HOSTING.md)), so it doesn't matter which one you use day to day.

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

*JSOL v0.2.93 — 2026-08-14, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](LICENSE)*