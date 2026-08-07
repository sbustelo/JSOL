<img src="assets/mascot/jsol-avatar.png" width="90" alt="JSOL mascot">

# JSOL: JavaScript Source Of Logic
2026, [Santiago Bustelo](https://www.bustelo.com.ar/) • MIT License

**An isomorphic business-logic standard for zero-dependency ecosystems.**

## What is JSOL?

Over a decade ago, Douglas Crockford took JavaScript, amputated all executable code from it, and gave us **JSON**: the de facto standard for transporting *data*.

**JSOL** does the inverse. It takes JavaScript, amputates access to the host environment (DOM, window, I/O), and restricts its syntax to a strict, C-style subset, to give us a universal format for *business logic*.

JSOL lets you write complex mathematical and procedural rules once, run them natively in the browser, and transpile them to pure PHP for the backend, with no Abstract Syntax Tree and no external toolchain. It's the missing link for isomorphism in lightweight frameworks.

## Why JSOL exists

JSOL was born out of a real requirement in [IPAX](https://icograma.com), a color-accessibility engine doing intensive math (OKLCH conversions, APCA/WCAG contrast, physiological vision modeling) that has to run instantly in the browser and be re-validated, with the exact same results, on the server. Hand-maintaining two parallel implementations guarantees drift and bugs. JSOL is the alternative to that: one file, two native targets, guaranteed parity.

It was built inside **j0**, a zero-config, zero-binary-dependency PHP/JS framework. That constraint ruled out the standard industrial answers (see [docs/COMPARISON.md](docs/COMPARISON.md) for why Haxe, WebAssembly, and JSON-driven math were each considered and rejected). The answer that fit was a JS subset trivial enough to convert to PHP with regular expressions and a small hand-written lexer.

<img src="assets/mascot/jsol-mascot-full.png" width="280" alt="JSOL mascot, full body">

## Advantages and honest tradeoffs

**Advantages**
- Zero learning curve — it's JavaScript.
- Native IDE support (formatting, linting, autocomplete work out of the box).
- The compiler fits in a few hundred lines of PHP or JS, no npm, no binaries on the server.
- The compiler now compiles itself — see [docs/SELF_HOSTING.md](docs/SELF_HOSTING.md).

**Tradeoffs**
- Spartan syntactic discipline. The rules aren't suggestions.
- No real static typing.
- No modern JS conveniences: no functional array methods, no native async.

## Quick start

```bash
node jsol-compiler-node/index.js --source="./my-file.jsol" --out-dir="./out"
# or
php jsol-compiler-php/index.php --source="./my-file.jsol" --out-dir="./out"
```

Full setup, per distribution, in [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md).

## Documentation

| Doc | What's in it |
|---|---|
| [docs/LANGUAGE_SPEC.md](docs/LANGUAGE_SPEC.md) | The permitted grammar, the wrapper vocabulary, the rules |
| [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) | How to compile a `.jsol` file, per distribution |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Why each restriction exists, the performance case, costs included |
| [docs/COMPARISON.md](docs/COMPARISON.md) | JSOL vs. Haxe, WebAssembly, JSON-driven math |
| [docs/SELF_HOSTING.md](docs/SELF_HOSTING.md) | What it means that the compiler compiles itself |
| [docs/EXTENDING.md](docs/EXTENDING.md) | Feasibility notes on other target languages (exploratory) |
| [docs/JSOL_AI_INSTRUCTIONS.md](docs/JSOL_AI_INSTRUCTIONS.md) | System prompt for AI assistants generating or refactoring JSOL |

## Examples

See [examples/](examples/), starting with [examples/hello-world.jsol](examples/hello-world.jsol).

## ☕ Say thanks

This project is maintained on personal time, for free, with no plan to charge for it. If you want to say thanks, you can [buy me a coffee](https://cafecito.bustelo.com.ar/).

Entirely optional, never required.

## License

See [LICENSE](LICENSE).