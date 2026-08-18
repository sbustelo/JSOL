# JSOL-X → Google Sheets Target (Vision)

> **Status: Vision / Pre-specification.** This document explains why Google Sheets, via Google Apps Script, is **not a JSOL-X target**. It is a candidate target for standard JSOL. Understanding why requires examining each JSOL-X restriction against the capabilities of Google Apps Script. This analysis also identifies what must be resolved in JSOL's core before Google Sheets becomes a viable compilation target. See `JSOL-X_README.md` for context.

* * *

## The insight: Google Apps Script is JavaScript

JSOL-X exists because of a target constraint. Excel's computation engine is a grid of cells connected by formulas. It has no call stack, no lexical scope, no closures, no recursion, and no mutation outside of row-above references in an unrolled loop. JSOL-X is JSOL restricted to fit within that computational model.

Google Sheets, when combined with Google Apps Script, has none of these constraints. Apps Script is a JavaScript runtime. It runs on Google's servers. It supports closures, recursion, mutation, lexical scope, `if` statements, `while` loops, `switch` with fallthrough, and every other capability of a standard imperative programming language. Custom functions written in Apps Script are callable from spreadsheet cells exactly like `=SUM()` or `=IF()`.

This means JSOL-X is not necessary for Google Sheets. The restrictions that make JSOL-X compilable to Excel formulas are restrictions the Google Sheets target does not need. Standard JSOL compiles to Apps Script almost directly, with only cosmetic adaptations.

* * *

## JSOL-X restrictions: which ones apply to Google Sheets?

Below is every restriction defined in `JSOL-X_LANGUAGE_SPEC.md` Part III, evaluated against Google Apps Script as a target.

### Rule 1: SSA (Static Single Assignment)

**JSOL-X rule:** Mutating variables is forbidden outside of `JSOL.range()` loops.  
**Applies to Google Sheets?** No.

Apps Script is JavaScript. Variables can be reassigned freely. `let qSum = 0; qSum = qSum + qValue;` works exactly as expected. There is no need to generate a new `const` for every intermediate step, because the runtime handles mutation natively. The compiler does not need to map variable mutation to row-above cell references, because there are no rows and no cells for intermediate values — only function scope.

### Rule 2: Zero Procedural `if` Statements

**JSOL-X rule:** All conditionals must use the ternary `? :` operator.  
**Applies to Google Sheets?** No.

Apps Script supports `if`, `else if`, and `else` blocks. The compiler can emit standard JavaScript conditional statements. There is no need to force everything through the ternary operator, because the target is not a formula language where every conditional must resolve to a single expression.

### Rule 3: Zero Recursion

**JSOL-X rule:** Functions cannot call themselves.  
**Applies to Google Sheets?** No.

Apps Script has a call stack. Recursive functions work, subject to standard JavaScript stack limits. A JSOL function that calculates factorial recursively will compile and run correctly in Apps Script. The compiler does not need to detect and reject recursion, nor unroll it into iteration.

### Rule 4: Scope Isolation (No Closures)

**JSOL-X rule:** Reading variables from an outer scope is forbidden. Every dependency must be an explicit parameter.  
**Applies to Google Sheets?** No.

Apps Script supports lexical scope. A function defined inside another function can capture variables from its enclosing scope. A function can reference a constant defined at the top level of the script without receiving it as a parameter. This is standard JavaScript behavior and requires no special handling from the compiler.

### Rule 5: Single Return Value (No Destructuring)

**JSOL-X rule:** A function returns one value. Destructuring assignment is illegal.  
**Applies to Google Sheets?** Partially, but not as a restriction.

A custom function in Google Sheets, when called from a spreadsheet cell, returns a value to that cell. However, if the function returns an array, Sheets automatically expands it into adjacent cells. This is native behavior, not a limitation the compiler must enforce. A JSOL function that returns an array can be called from a sheet cell and will populate a row or column automatically.

Within the Apps Script code itself, destructuring works normally. The compiler does not need to prohibit it.

### Rule 6: Type Immutability Across Branches

**JSOL-X rule:** All branches of a ternary must return the same type.  
**Applies to Google Sheets?** No.

JavaScript does not enforce type uniformity across branches. A function can return a number in one branch and a string in another. This is generally poor practice for business logic, but it is not a compilation constraint. The linter may warn, but the compiler does not need to reject it.

### Rule 7: Physically Bounded Arrays

**JSOL-X rule:** `Arr.push()` without a predefined limit is forbidden. All array manipulation must occur within a bounded `JSOL.range(..., Max)` block.  
**Applies to Google Sheets?** No.

Apps Script arrays are standard JavaScript arrays. They grow dynamically. There is no need to preallocate rows or enforce a maximum size, because the runtime manages memory. The compiler can emit standard `Array.push()` calls.

### Rule 8: No Short-Circuit Dependence

**JSOL-X rule:** Side effects in conditional branches are prohibited because Excel evaluates all branches.  
**Applies to Google Sheets?** No.

JavaScript has genuine short-circuit evaluation. `A && B()` will not execute `B()` if `A` is falsy. The runtime behavior matches JSOL semantics exactly. No compiler intervention needed.

### Rule 9: No `while` Loops

**JSOL-X rule:** All iteration must use `JSOL.range()` with a static `Max` limit.  
**Applies to Google Sheets?** No.

Apps Script supports `while` loops natively. The compiler can emit them directly. There is no need to know at compile time how many iterations will occur.

### Rule 10: No `switch` Fallthrough

**JSOL-X rule:** `switch` cases cannot fall through.  
**Applies to Google Sheets?** No.

Apps Script supports standard JavaScript `switch` semantics, including fallthrough. The compiler does not need to enforce this restriction, though the JSOL linter may still warn about fallthrough as a best practice independent of target.

### Rule 11: Acyclic Dependency Graph

**JSOL-X rule:** The dependency graph between variables must be a DAG.  
**Applies to Google Sheets?** No.

Apps Script has no concept of cell dependency graphs. Variables reference each other through standard JavaScript scoping. Circular references that would cause infinite recursion are a runtime problem, not a compile-time constraint unique to spreadsheets.

* * *

## Summary: zero restrictions carry over

| Rule | Applies to Excel (.xlsx) | Applies to Google Sheets (Apps Script) |
| --- | --- | --- |
| 1\\. SSA | Yes | No  |
| 2\\. No `if` statements | Yes | No  |
| 3\\. No recursion | Yes | No  |
| 4\\. No closures | Yes | No  |
| 5\\. No destructuring | Yes | No (Sheets handles array expansion) |
| 6\\. Uniform branch types | Yes | No  |
| 7\\. Bounded arrays | Yes | No  |
| 8\\. Short-circuit warning | Yes | No  |
| 9\\. No `while` | Yes | No  |
| 10\\. No `switch` fallthrough | Yes | No  |
| 11\\. Acyclic dependency graph | Yes | No  |

Not a single restriction that defines JSOL-X is required by the Google Sheets target. Google Sheets + Apps Script is a target for standard JSOL, not for JSOL-X.

* * *

## What this means for JSOL's evolution

### Google Sheets as a standard JSOL target

The current JSOL compiler accepts two targets: JavaScript and PHP. The architecture already supports the concept of multiple backends behind a common compilation pipeline. Adding Google Apps Script as a third target is architecturally natural.

The adaptation from JSOL to Apps Script is minimal:

-   Strip the `$` prefix from variable names (or retain as a naming convention for readability).
-   Translate JSOL Core Helpers to their JavaScript equivalents (`Str.len` → `.length`, `Cast.toInt` → `parseInt`, etc.).
-   Wrap public functions so they are exposed as custom functions callable from spreadsheet cells.
-   Handle JSOL types (`$c`, `$p`, `$d`, `$t`, `$g`) according to the type system defined in the JSOL specification — the same treatment they receive when compiling to JavaScript or PHP.

The compiler does not need a separate "JSOL-X mode" for this target. It uses the standard JSOL pipeline.

### What must be resolved first

Declaring Google Sheets as a supported target requires resolving several open items in the JSOL roadmap, all of which are already identified in `ROADMAP.md`:

**1\. Type system stabilization (Priority 2).** The single-character type prefixes (`$c` for Currency, `$p` for Percentage, `$d` for Date, `$t` for Time/Duration, `$g` for Geometry/Angle) must be specified, implemented in the linter, and supported by the compiler before any business-oriented target can be credible. Google Sheets is a business tool; its users expect currency formatting, percentage display, and date handling to work correctly.

**2\. Core Helper parity across targets (Priority 0).** The generative set (`Str.*`, `Arr.*`, `Map.*`, `Math.*`, `Cast.*`) must be fully specified and implemented for JavaScript and PHP before adding a third target. Adding a target before the core library is stable means writing the same helper implementations three times instead of two.

**3\. Date type resolution (Priority 2, and the hardest problem).** This deserves its own section.

* * *

## The Date problem

### Why Date is the critical path

Every business spreadsheet deals with dates. Loan amortization, tax filing deadlines, invoice due dates, contract effective dates, age calculations, fiscal year boundaries. A JSOL target for Google Sheets that cannot handle dates correctly is not useful for business logic.

The JavaScript `Date` object is notoriously problematic. The Google Sheets date system has its own quirks. Reconciling them — and ensuring that the same JSOL date logic produces the same results whether compiled to JavaScript (browser), JavaScript (Node), PHP, Google Apps Script, or Excel — is a hard problem.

### The falsehoods

The document [Falsehoods programmers believe about time](https://gist.github.com/timvisee/fcda9bbdff88d45cc9061606b4b923ca) compiles falsehoods programmers tend to believe about dates. Several are directly relevant to cross-target date compilation:

-   **"There are always 24 hours in a day."** False. Days with DST transitions have 23 or 25 hours. Different targets handle DST differently, or not at all.
-   **"A date always represents a single instant in time."** False. A date like "2026-08-10" is a calendar date, not a timestamp. It represents a different instant depending on the timezone of the observer.
-   **"Timezones are simple offsets from UTC."** False. Timezone rules change. Governments add, remove, and shift DST transitions. A date calculation that depends on timezone offsets can produce different results depending on whether the runtime's timezone database is up to date.
-   **"All systems agree on what day it is."** False. At any given UTC instant, it is a different calendar date in different timezones.

### The constraint: compatibility with existing tools

The resolution of the Date type cannot be a purely theoretical exercise in correctness. The business users who will adopt JSOL-compiled Google Sheets already use Excel and Google Sheets directly. They have existing spreadsheets with date calculations that produce specific results. If JSOL's date semantics differ from what those tools produce today, JSOL will be rejected — not because it is wrong, but because it gives different answers from the tool the business already trusts.

This means the Date type specification must be guided by:

-   How Excel stores and calculates dates (serial numbers, the 1900/1904 date system, the Lotus 1-2-3 bug compatibility).
-   How Google Sheets stores and calculates dates (similar serial number system, but with some differences from Excel).
-   What spreadsheet users expect: `=DATE(2026, 12, 31) - DATE(2026, 1, 1)` should produce the same result in JSOL-compiled output as it does in the spreadsheet the analyst already uses.

The Date type design must reconcile mathematical correctness with de facto compatibility. It is likely that JSOL will adopt an internal representation (integer day count from a defined epoch, as suggested in the roadmap) and define conversion rules for each target that produce the expected results on that target — even if the internal representation is more rigorous than any target's native date type.

This is not a JSOL-X problem. It is a JSOL core problem that must be resolved before Google Sheets (or Excel, for that matter) becomes a viable business target.

* * *

## A plausible milestone sequence

Given the above analysis, a realistic sequence for JSOL's target expansion could be:

### JSOL 2.x: Core stabilization

-   Priority 0 (Core Helpers) complete and consistent across JS and PHP.
-   Priority 2 (Type prefixes) specified and implemented in the linter.
-   Date type designed and specified, with reference implementations for JS and PHP.
-   All other business types (`$c`, `$p`, `$t`, `$g`) specified.

### JSOL 3.0: Google Sheets as a business target

-   The compiler accepts `--target gas` (or equivalent) and produces Apps Script.
-   Core Helpers have Apps Script implementations where needed.
-   Date type compiles to Google Sheets-compatible date handling.
-   Custom functions are generated and callable from spreadsheet cells.
-   This milestone delivers the "executable business logic in a collaborative spreadsheet" vision **without** requiring the JSOL-X compiler. Standard JSOL, compiled to Apps Script, achieves the same user-facing result.

### JSOL 3.5 or later: JSOL-X for static spreadsheets

-   The JSOL-X compiler is developed as a separate compilation path.
-   Excel `.xlsx` output is the primary target.
-   This milestone covers environments where Google Sheets is not available: offline use, air-gapped networks, organizations that require file-based distribution, and users who need the `.xlsx` format for archiving or regulatory compliance.

The key insight is that Google Sheets is **easier** than Excel. The compiler for Google Sheets is a thin adaptation layer over the standard JSOL-to-JavaScript pipeline. The compiler for Excel requires a fundamentally different approach: semantic translation to a non-Turing-complete formula grid, loop unrolling, Gatekeeper formulas, cross-sheet reference management, and cell formatting metadata.

Google Sheets can arrive first, with a fraction of the compiler complexity, and deliver most of the business value.

---

*This document was produced with systematic AI co-piloting as described in [AI_ENGINEERING_METHODOLOGY.md](../../10_dev/AI_ENGINEERING_METHODOLOGY.md). AI was used for architectural stress-testing, cross-model validation, and drafting; all content has been reviewed for technical accuracy and adherence to project constraints.*

* * *

_JSOL v0.2 — 2026-08-10, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../../LICENSE)_