# JSOL-X Interpreter Vision

> **Status: Vision / Pre-specification.** This document describes a tool that does not exist. It is the most speculative document in the JSOL-X directory. It exists because the question "how would a business person validate JSOL-X logic without waiting for a developer to compile and deploy?" revealed a missing piece in the JSOL ecosystem — one that, if built, would change the development experience for every JSOL target, not just Excel. See `JSOL-X_README.md` for context.

* * *

## The missing piece

The JSOL ecosystem, as currently projected, would have three components:

1.  **Compiler:** source `.jsol` → target languages (JS, PHP, C#, Java, Go).
2.  **Linter:** verifies that a `.jsol` file obeys the rules of its declared profile (Managed, JSOL-C, JSOL-X).
3.  **Contract test runner:** executes `JSOL.contract()` blocks against compiled outputs and verifies parity across targets.

The compiler and the contract runner share a common assumption: you must compile before you can see results. This is fine for a developer. It is not fine for the analyst who needs to verify a tax calculation, or the sales manager who wants to test a commission structure with last quarter's numbers, or the auditor who needs to trace an output back through intermediate steps.

These people do not use compilers. They use spreadsheets.

The interpreter is the fourth component. It runs JSOL-X source code directly, without compilation, and displays inputs and outputs in a reactive grid that behaves like a spreadsheet but derives its logic from version-controlled source code.

* * *

## What the interpreter does

Given a `.jsol` file containing one or more public functions, the interpreter:

1.  Extracts every public function's signature: name, typed parameters (inputs), and return type (output).
2.  Renders each function as a tab in a grid view.
3.  Within each tab, renders a table where columns are parameters and outputs, and rows are independent scenarios.
4.  When the user types a value into an input cell, the interpreter immediately re-evaluates the function and updates all output cells in that row.
5.  Allows the user to add rows, delete rows, and export rows as `JSOL.contract()` test cases.

The interpreter does not produce an `.xlsx` file. It does not compile to formulas. It executes JSOL-X logic in a sandboxed JavaScript runtime (or a purpose-built evaluator) and renders the results in an HTML grid. The grid is the interface; the source file is the authority.

* * *

## A session in the interpreter

Let's walk through what a business analyst experiences when using the interpreter with the tiered commission example from `JSOL-X_EXAMPLES.md`.

### Step 1: Open the file

The analyst opens `commissions.jsol` in the interpreter. The interpreter finds two functions: `$cCalculateCommission` and `$cCalculateTier`. The first is public (declared at the top level). The second is private (declared inside another function, or marked as a helper). Only public functions get tabs.

The interpreter renders a single tab: "Calculate Commission."

### Step 2: The grid appears

The tab shows a table with four columns. Three are inputs, derived from the function signature. One is the output.

| $cTotalSales (INPUT) | $cTier1 (OUTPUT) | $cTier2 (OUTPUT) | $cTier3 (OUTPUT) | Total Commission (OUTPUT) |
| --- | --- | --- | --- | --- |
| \\[\\_\\_\\_\\_\\_\\_\\] |     |     |     |     |

The output columns correspond to the intermediate SSA variables inside the function body, plus the final return value. The interpreter exposes them because the whole point of SSA is auditability: every step has a name, and every name can be a column.

### Step 3: Enter a value

The analyst types `150000` in the first input cell and presses Enter. The interpreter evaluates the function with `$cTotalSales = 150000` and populates the row:

| $cTotalSales (INPUT) | $cTier1 (OUTPUT) | $cTier2 (OUTPUT) | $cTier3 (OUTPUT) | Total Commission (OUTPUT) |
| --- | --- | --- | --- | --- |
| 150000 | 5000.00 | 3500.00 | 0.00 | 8500.00 |

### Step 4: Add scenarios

The analyst clicks "Add Row" twice and enters different values. Each row is an independent evaluation.

| $cTotalSales (INPUT) | $cTier1 (OUTPUT) | $cTier2 (OUTPUT) | $cTier3 (OUTPUT) | Total Commission (OUTPUT) |
| --- | --- | --- | --- | --- |
| 150000 | 5000.00 | 3500.00 | 0.00 | 8500.00 |
| 50000 | 2500.00 | 0.00 | 0.00 | 2500.00 |
| 250000 | 5000.00 | 7000.00 | 5000.00 | 17000.00 |

The analyst can now see at a glance how the commission structure behaves across low, medium, and high performers. They can add edge cases: zero sales, negative sales (to see if the formula handles it), a million-dollar sale.

### Step 5: Trace an output

The analyst clicks on the value `8500.00` in the first row. The interpreter highlights the chain of calculations that produced it. It shows that `$cTier1 = 5000.00` came from `$cCalculateTier(150000, 0, 100000, 0.05)`, which in turn computed `$cTierBase = 100000` and `$cTierAmount = 100000`. Every SSA variable is inspectable.

This is the audit trail. The analyst does not need to read JavaScript. They need to see the arithmetic, step by step, with real numbers.

* * *

## What the interpreter is not

The interpreter is not a spreadsheet application. It does not support arbitrary cell formulas. The user cannot type `=A1*B1` into a cell. The logic is fixed; it comes from the source file. The user manipulates only the input values.

The interpreter is not a development environment. It does not have a code editor, syntax highlighting, or debugging breakpoints. The developer writes JSOL-X in their own editor, version-controls it, and opens the interpreter only to validate with business stakeholders.

The interpreter is not a replacement for compiled Excel output. The `.xlsx` file is the distribution format for offline use, printing, and email. The interpreter is the validation format for interactive exploration and sign-off.

* * *

## Why this changes the development cycle

Without the interpreter, the cycle for business logic is:

1.  Developer writes JSOL-X.
2.  Developer compiles to JS/PHP for the application.
3.  Developer compiles to `.xlsx` for the analyst.
4.  Developer emails the `.xlsx`.
5.  Analyst opens it, tests values, finds an issue.
6.  Analyst emails feedback to developer.
7.  Developer interprets feedback, edits source, repeats from step 2.

Each round trip costs hours to days, depending on developer availability. The Excel file becomes a communication medium, not just an output format.

With the interpreter, the cycle becomes:

1.  Developer writes JSOL-X.
2.  Developer shares a link to the interpreter with the analyst.
3.  Analyst opens the link, tests values, finds an issue.
4.  Analyst shares the URL of their scenario set (all rows are preserved in the URL or a saved session).
5.  Developer opens the same URL, sees the exact inputs that produced the issue, edits the source, and the analyst refreshes to see the corrected output.

Steps 2 through 5 can happen in a single meeting. The source file remains the authority; the interpreter is a window into it, not a fork of it.

* * *

## The grid as a test case generator

Every row in the interpreter is a potential test case. The analyst, by typing values and verifying outputs, is creating test data. The "Export as Contract" button converts all rows into a `JSOL.contract()` block:

text

Copiar

Descargar

// Auto-generated from interpreter session, 2026-08-10
JSOL.contract('$cCalculateCommission', \[
    { inputs: \[150000\], output: 8500.00 },
    { inputs: \[50000\], output: 2500.00 },
    { inputs: \[250000\], output: 17000.00 },
\]);

The developer pastes this block into the source file. The CI pipeline now verifies, on every commit, that the compiled output produces exactly these values. What the analyst validated visually becomes what the machine verifies automatically.

This closes the loop between business validation and automated testing. The analyst does not need to learn a test framework. They need to do what they already do: type values and check results.

* * *

## Technical sketch

The interpreter requires three components:

### 1\. JSOL-X evaluator

A runtime that executes JSOL-X source directly. Because JSOL-X is a strict subset of JavaScript, the simplest evaluator is `eval()` in a sandboxed context (Web Worker, iframe, or server-side isolated VM). A custom evaluator written in JavaScript would provide better error messages and step-through inspection, but is not required for a minimum viable version.

The evaluator must handle all JSOL-X types: Currency (`$c`), Percentage (`$p`), Quantity (`$q`), Index (`$i`), String (`$s`), Boolean (`$b`), Date (`$d`), Array (`$a`), Map (`$m`), and Function (`$f`). It must implement the Core Helpers (`Str.len`, `Cast.toInt`, etc.) and the `JSOL.range()` generator.

### 2\. Signature extractor

A static analyzer that parses a `.jsol` file and extracts, for each public function:

-   Function name and return type (from the first character).
-   Parameter names, types, and default values.
-   All intermediate `const` declarations in the function body (the SSA variables that become output columns).

This does not require a full AST. The same regex-based approach used by the JSOL compiler can identify function boundaries, parameter lists, and `const` declarations.

### 3\. Reactive grid renderer

A web-based UI component that:

-   Renders a table with fixed columns for inputs and outputs.
-   Allows editing of input cells (yellow background, matching the Excel convention).
-   Re-evaluates the function on input change and updates output cells.
-   Supports adding, deleting, and reordering rows.
-   Exports rows as `JSOL.contract()` blocks.
-   Serializes the current state (function, rows, values) to a shareable URL.

* * *

## Relationship to the compiled Excel output

The interpreter and the `.xlsx` compiler serve different purposes:

|     | Interpreter | Compiled Excel |
| --- | --- | --- |
| **Audience** | Developer + analyst, together | Analyst, independently |
| **Interaction** | Real-time, collaborative | Offline, single-user |
| **Logic source** | Evaluated from `.jsol` directly | Translated to Excel formulas |
| **Distribution** | URL or local server | `.xlsx` file via email/filesystem |
| **Use case** | Validation, sign-off, exploration | Distribution, auditing, archiving |
| **Lifetime** | Ephemeral (session-based) | Permanent (file-based) |

They are complementary, not competing. The interpreter answers "is this logic correct?" before compilation. The Excel output answers "here is the logic, in a format you can use forever."

* * *

## Why this matters beyond JSOL-X

The interpreter was conceived for JSOL-X because Excel is the surface where business people interact with logic. But once it exists, it is useful for every JSOL target.

A developer writing a JSOL function for a Node.js backend can open the interpreter, type a few inputs, and verify the output before writing a single test. The interpreter becomes a REPL for business logic.

An educator teaching programming with JSOL (the "executable pseudocode" use case) can use the interpreter as an interactive textbook: students type values, see results, and trace the execution step by step.

The interpreter is the bridge between "code that developers read" and "results that humans understand." It just happens that JSOL-X, with its Excel target and its business audience, is the use case that makes that bridge necessary.

---

*This document was produced with systematic AI co-piloting as described in [`AI_ENGINEERING_METHODOLOGY.md`](../AI_ENGINEERING_METHODOLOGY.md). AI was used for architectural stress-testing, cross-model validation, and drafting; all content has been reviewed for technical accuracy and adherence to project constraints.*

* * *

_JSOL v0.2 — 2026-08-10, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](https://../LICENSE)_