# JSOL REPL Interpreter

This directory contains the interactive visual interpreter for JSOL.

<img src="../assets/interpreter/repl-luhn-example.png" width="100%" alt="JSOL REPL Interpreter">

**Live demo:** https://jsol.bustelo.com.ar/


## What is it?
`interpreter.php` scans its current directory looking for `.jsol` files, compiles them into a configurable output directory (`_jsol-bin` by default), and displays an interface to dynamically interact with JSOL logic without needing to integrate it into a host app.

## Portability
The `interpreter.php` file is designed to be copied to **any subdirectory** within the JSOL distribution (for example, to `/examples/`).

When executed in a new directory:
1. It will recursively scan from its current location to find `.jsol` algorithms.
2. It will navigate upwards in the file system looking for its original parent directory (`interpreter/`) to load its isolated CSS and JS.
3. It will navigate upwards to locate the compiler engine (`jsol-compiler-php/index.php`).

## Embedding the REPL
You can embed the REPL inside any host application UI seamlessly.
1. Look at <code>embedding-example.php</code> for a complete structural reference.
2. The REPL container automatically fills 100% of its parent's width and height.
3. The UI supports native theming via the <code>data-theme</code> attribute on the container wrapper (e.g., <code>data-theme="light"</code> or <code>data-theme="dark"</code>).

## Configurable Build Directory
By default, compiled JavaScript artifacts are saved to `_jsol-bin/` inside the running directory. You can customize this directory name by setting the $tempBinDirName variable inside interpreter.php before launching:

```php
$tempBinDirName = '_my-custom-bin';
```

## Documentation and Live Contracts
The REPL parses two optional `/** ... */` comment blocks above the main function:
1. @contract: A JSON object declaring the test cases to pre-populate the grid and perform runtime assertion checks.
2. General Documentation: Any other docblock comment will be rendered directly below the table.

## Grid Interaction
- **Keyboard**: Press `RETURN` while inside any input cell to jump to the next row or create a new row if you are on the last one.
- **Touch / Mouse**: Click the `+ Create new row` button below the table to append a new row on mobile or desktop."

---

*JSOL v0.2.93 — 2026-08-17, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*