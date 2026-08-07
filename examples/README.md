# Examples

| File | Demonstrates |
|---|---|
| `hello-world.jsol` | Minimal deterministic function: `const`, `if`, `JSOL.dict()`. No environment blocks, no wrappers beyond `dict`. Start here. |
| `color-metrics.jsol` | `JSOL.JS`/`JSOL.PHP` environment isolation blocks for regex (Rule 6), `JSOL.hexToInt`, `JSOL.bwAnd`, `JSOL.use` for closure dependency declaration, template literals. |

Compile either one with:

```bash
node ../jsol-compiler-node/index.js --source="hello-world.jsol" --out-dir="./out"
```

See [../docs/GETTING_STARTED.md](../docs/GETTING_STARTED.md) for the PHP-host equivalent.
