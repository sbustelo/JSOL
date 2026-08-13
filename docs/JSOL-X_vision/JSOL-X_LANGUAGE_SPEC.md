# JSOL-X Language Specification (Preliminary)

> **Status: Vision / Pre-specification.** This document describes a language that does not yet have a compiler. It exists to stress-test the JSOL type system, function naming, and compilation architecture against the hardest target imaginable: a spreadsheet grid. See `../DESIGN_PHILOSOPHY.md` for why this projection matters now, even though JSOL-X is not on any near-term roadmap.
>
> Stable support for JSOL-X features and functions is planned for JSOL v.3.0. JSOL is currently at v.0.2.

Part of the vision for JSOL-X is that it shares a set of core types and functions with JSOL (e.g., Date), and provides its own function library to achieve parity with Excel. The development of the Date type, considering its complexities and the need to ensure transpilability to all C-like languages that JSOL must formally support, is non-trivial.

---

### FOUNDATIONAL NOTICE TO THE READER AND COMPILER

**There is currently no automated compiler for JSOL-X.** This specification serves as the strict input for an Artificial Intelligence (or a future parsing engine) to fill that role, reading JSOL-X source code and physically constructing the corresponding Microsoft Excel (`.xlsx`) file. For this reason, this document details both the functional syntax of the language and the physical, visual, and mechanical conditions for its correct compilation into spreadsheets.

---

## PART I: POSITIVE DEFINITION (What JSOL-X DOES support)

*A functional guide written from scratch. Everything JSOL-X allows you to write **must** have a possible mathematical mapping in Excel.*

### 1. Variable Assignment and Strict Typing (The Prefixes)

**What it supports:** The creation of values using the `const` instruction. In JSOL-X, every variable **MUST** start with a dollar sign (`$`) followed by a specific letter that defines exactly what type of data it contains.
**Rationale:** In Excel, a cell cannot magically change its format or type in the middle of a calculation. Using `const` ensures the value is born and dies the same (immutability). The prefixes tell the compiler what visual format to apply to the Excel cell and how to protect it.

**Formula Output Language:** Microsoft implemented formula translation for most European languages: "IF" appears as "SI" in Spanish, "SE" in Portuguese, "WENN" in German, etc. Other applications (e.g., Apple Numbers) do not offer this support. Therefore, JSOL-X **strictly adopts English function nomenclature in its output**. Since Excel internally translates between versions, this should pose no problem for the end user. The compiler MUST always output `IF`, never `SI`; `SUM`, never `SUMA`; `VLOOKUP`, never `BUSCARV`; `TRUE`/`FALSE`, never `VERDADERO`/`FALSO`.

**Complete and Mandatory List of Types (preliminary):**

- **`$c` (Currency):** Floating-point number, e.g., `1200.50`. **Rationale:** Represents monetary values requiring precision and specific formatting. The compiler assigns an accounting format (`$ 1,200.50`).
    - **Input:** `const $cPrice = 1500.00;`
    - **Output:** Cell `=1500` *(Format: Currency/Accounting)*

- **`$p` (Percentage):** Floating-point number `15.00` or string `15%`. **Rationale:** Percentages are semantically distinct from raw floats; they divide by 100 visually and logically. The compiler assigns a percentage format (`15.00%`).
    - **Input:** `const $pTax = 21.00;`
    - **Output:** Cell `=0.21` *(Format: Percentage, displays as 21.00%)*

- **`$q` (Quantity):** Strict integer, e.g., `1234`. **Rationale:** Countable items are discrete; decimals are meaningless and can break downstream calculations. The compiler forces a number format with no decimals and applies `Math.trunc` on read to prevent a user from breaking the calculation by injecting decimals.
    - **Input:** `const $qUnits = 3;`
    - **Output:** Cell `=3` *(Format: Number, 0 decimal places)*

- **`$i` (Index):** Unsigned integer (greater than or equal to zero). **Rationale:** Used exclusively for iterating or measuring lengths (e.g., string lengths, loop counters). Negative values are nonsensical in this context.
    - **Input:** `const $iCounter = 0;`
    - **Output:** Cell `=0` *(Format: Number, 0 decimal places)*

- **`$s` (String / Text):** Plain text strings, e.g., `"Hello World"`. **Rationale:** Immutable text data for labels, messages, or keys.
    - **Input:** `const $sProduct = "Licencia PRO";`
    - **Output:** Cell `Licencia PRO` *(Format: Text)*

- **`$b` (Boolean):** True or False: `true`, `false`. **Rationale:** Binary logic gates. In Excel, maps to the English constants `TRUE` and `FALSE`. The compiler MUST NOT output localized versions.
    - **Input:** `const $bIsValid = true;`
    - **Output:** Cell `=TRUE` *(Format: Boolean)*

- **`$d` (Date):** Internally operates in milliseconds since 1970 UTC. **Rationale:** Provides a universal, timezone-aware integer for calculations before formatting. The compiler maps it to Excel's date serial number.
    - **Input:** `const $dToday = Date.now();`
    - **Output:** Cell `=45000` *(Format: Date, displays as configured)*

- **`$a` (Array / List):** A linear list. **Rationale:** Ordered collections for iteration or lookup. In Excel, compiles to a static column (e.g., `A1:A10`).
    - **Input:** `const $aItems = Arr.create("A", "B", "C");`
    - **Output:** Range `A1:A3` containing the three values.

- **`$m` (Map / Dictionary):** A two-dimensional table. **Rationale:** Key-value or relational data for searches. In Excel, compiles to a two-dimensional matrix range.
    - **Input:** `const $mTaxTable = Map.create(...);`
    - **Output:** A populated range like `A1:B2`.

- **`$f` (Function):** Used to declare logical routines. **Rationale:** Encapsulates reusable calculation blocks.
    - **Input:** `const $fDiscount = (...) => { ... };`
    - **Output:** No direct cell output; defines a compilable block.

**Source Code Example:**

```javascript
const $cBasePrice = 1500.00;
const $qUnits = 3;
const $sProduct = "Licencia PRO";
```

**Output Object (Excel):**

> Cell A1: `=1500` _(Format: Currency)_  
> Cell A2: `=3` _(Format: Number, Integer)_  
> Cell A3: `Licencia PRO` _(Format: Text)_

### 2\. Mathematical Operations

**What it supports:** Addition (`+`), subtraction (`-`), multiplication (`*`), and division (`/`).  
**Rationale:** These are the foundation of financial and scientific calculations, mapping identically to native Excel operators.

**Source Code Example:**

```javascript
const $cTotal \= $cBasePrice \* $qUnits;
```

**Output Object (Excel):**

> Cell A4: `=A1 * A2`

### 3\. Text Concatenation (Operator `+""+`)

**What it supports:** Joining text using _only and exclusively_ the `+""+` structure.  
**Rationale:** In native JavaScript, the `+` symbol is ambiguous (it sums numbers or concatenates strings based on context). To eliminate all ambiguity during transpilation, JSOL-X mandates `+""+`, which the compiler ALWAYS and unambiguously translates to Excel's `&` operator.

**Source Code Example:**

```javascript
const $sName \= "Invoice";
const $sFull \= $sName +""+ " Issued";
```

**Output Object (Excel):**

> Cell B1: `=A1 & " Issued"`

### 4\. Logical Conditionals (The Ternary Operator)

**What it supports:** Making decisions using the syntax: `Condition ? TrueValue : FalseValue`.  
**Rationale:** JSOL-X forbids the traditional `if { ... }` block because Excel does not understand it. Excel uses the `IF()` function, where the result is injected into a single cell. The ternary operator is the exact representation of this mechanics.

**Source Code Example:**

```javascript
const $cDiscount \= $qUnits \> 10 ? 500 : 0;
```

**Output Object (Excel):**

> Cell C1: `=IF(A2 > 10, 500, 0)`

### 5\. Static Reference Tables

**What it supports:** Creation of immutable dictionaries with `Map.create()`.  
**Rationale:** Maps directly to support tables in Excel, enabling vertical lookups.

**Source Code Example:**

```javascript
const $mTaxes \= Map.create(
    "country", Arr.create("AR", "CL"),
    "rate", Arr.create(0.21, 0.19)
);
const $pRate \= $mTaxes.get("AR");
```

**Output Object (Excel):**

> _In Support Sheet:_ Range A1:B2 contains the table.  
> _In Dashboard Sheet:_ `=VLOOKUP("AR", Support!A1:B2, 2, FALSE)`

### 6\. Physically Bounded Iterations

**What it supports:** Loops via `for (let $i of JSOL.range(Start, End, Step, Max))`.  
**Rationale:** Excel cannot run a loop in the abstract; it needs physical rows. The last argument (`Max`) is a mandatory requirement that tells the compiler exactly how many rows to draw on the spreadsheet for that loop, preventing Excel from collapsing.

**Critical constraint:** `Max` **MUST be a static numeric literal**, not a variable. The compiler extracts this value at compile time to determine physical row count. A variable `Max` cannot be resolved statically and will cause a linter error.

```javascript
// VALID: 10 is static
for (let $i of JSOL.range(1, $qSections, 1, 10)) { ... }
// INVALID in JSOL-X: $qMax is a variable
const $qMax \= 10;
for (let $i of JSOL.range(1, $qSections, 1, $qMax)) { ... }
```

**Source Code Example:**

```javascript
for (let $i of JSOL.range(1, $qSections, 1, 10)) {
    const $cInterest \= $cCapital \* 0.05;
}
```

**Output Object (Excel):**

> The compiler draws 10 rows and wraps them in a Gatekeeper:  
> Row 1: `=IF(1 <= $qSections, Capital * 0.05, "")`  
> Row 2: `=IF(2 <= $qSections, Capital * 0.05, "")`  
> (Repeats up to row 10).

### 7\. Core Helpers

**What it supports:** Calls to primitive system methods, such as `Str.len($s)` or `Date.part($d, "Y")`.  
**Rationale:** These are operations JSOL-X delegates to the compiler to translate into Excel's fastest formulas (`=LEN()`, `=YEAR()`), avoiding inefficient re-implementation of calendar or string mathematics.

**Allowed string operations** are limited to those with direct Excel formula equivalents: `LEFT`, `RIGHT`, `MID`, `LEN`, `CONCATENATE` (`&`), `FIND`, `SUBSTITUTE`, `UPPER`, `LOWER`, `TRIM`, `VALUE`, `TEXT`. Operations requiring a regex engine (`Str.split` with regex, `Str.replace` with regex) are **not supported** in JSOL-X, as Excel has no native regex engine outside VBA.

**Source Code Example:**

```javascript
const $iLength \= Str.len($sName);
```

**Output Object (Excel):**

> Cell: `=LEN(A1)`

* * *

## PART II: COMPILATION CONDITIONS AND EXCEL TOPOLOGY

The compiler (AI) must build the `.xlsx` file adhering meticulously to this spatial architecture:

### 1\. User Interfaces (Sheets 1 to N)

Each public function declared in the source code generates its own tab (Sheet) that acts as an Interface/Dashboard.

-   **Row A (Headers):** Contains the exact names of the input arguments and the output variable(s) (return).
-   **Row B (Interaction):**
    
    -   **Inputs:** The cells corresponding to the arguments have a **yellow background**.
    -   **Default Values:** If the function signature in JSOL-X specifies a default (`function($qMonths = 12)`), the yellow cell must be automatically filled with that number (`12`). If there is no default, it remains empty or zero.
    -   **Outputs:** Show the final result calculated by the Engine.
-   **Extensibility:** This 2-row format allows the business user to copy Row B and paste it into Rows C, D, E... to test multiple input scenarios in parallel.

### 2\. Compilation Contracts (Meta-Spec JSON)

The JSOL-X code may include a compilation contract (e.g., a JSON object in initial comments).

-   **Mechanics:** Defines minimum, maximum values, or lists (`enums`) for each variable.
-   **Compilation:** The compiler reads this JSON and translates it into "Data Validation" rules in the yellow cells of Row B. For example, if the contract states that `$pRate` must be between 0 and 1, Excel will throw an error if the user types 5.

### 3\. Function Compilation: Inline vs. Sheet

A JSOL-X function has two possible compilation targets:

-   **Inline:** The compiler expands the function body at each callsite (like a C macro). Appropriate for small, single-use functions.
-   **Sheet separated:** The function becomes its own support sheet with inputs (arguments) and output (return). Callsites become cross-sheet references. Appropriate for functions called from multiple places or functions complex enough to deserve their own audit trail.

**Constraint:** A function compiled to a separate sheet must be **pure** (same inputs → same output, no side effects), and its arguments must be values, not mutable references.

### 4\. Private Functions and Lexical Extraction

**Definition:** A function is **Private** if declared _inside_ the body of another main function.  
**Compiler Mechanics:**

1.  The lexer/compiler detects and extracts it from the main flow.
2.  It is forcibly renamed to inject it into the correct scope (e.g., `$fPrivateName`).
3.  **It does not generate an Interface Sheet (1-N) for it.** It is compiled exclusively as a calculation engine in the support sheets.

### 5\. The Calculation Engine (Sheets N+1 to Z)

After the last public function, the compiler generates hidden or support sheets (e.g., `Support_1`, `Engine_2`).

-   Here, private functions, dictionaries (`$m`), and the unrolled rows of `JSOL.range` loops are printed.
-   If a public function on Sheet 2 depends on another on Sheet 1, the interfaces remain intact, but the Support Sheets cross-reference each other to carry the calculation.

* * *

## PART III: LIMITATIONS AND RESTRICTIONS (The JSOL-X Linter)

If the code violates any of these rules, the compiler must abort the operation. They are the indispensable bridge between linear programming and a Directed Acyclic Graph (DAG).

### Rule 1: SSA (Static Single Assignment)

Mutating variables is forbidden. Doing `$cTotal += 100` generates a Circular Reference in Excel. Every step generates a new `const`.  
**Exception:** Mutation inside `JSOL.range` loops is permitted, as it compiles to a reference to the row above in Excel.

```javascript
// INVALID outside a loop
$cTotal \= $cTotal + 100;
// VALID: inside JSOL.range, compiles to row-above reference
for (let $i of JSOL.range(1, $qN, 1, 100)) {
    $cAccum \= $cAccum + $cValues\[$i\];
}
```

### Rule 2: Zero Procedural `if` Statements

All conditionals must use the ternary `? :` operator. `if { ... }` blocks have no Excel equivalent.

### Rule 3: Zero Recursion

Functions cannot call themselves. Lacking a Stack, Excel would collapse. Everything is iterative.

### Rule 4: Scope Isolation (No Closures)

Reading variables from an outer scope is forbidden. Every dependency must be an explicit parameter.

```javascript
// INVALID: $pIVA captured from outer scope
const $pIVA \= 0.21;
const $fCalc \= function($cBase) {
    return $cBase \* (1 + $pIVA);
};
// VALID: explicit parameter
const $fCalc \= function($cBase, $pIVA) {
    return $cBase \* (1 + $pIVA);
};
```

**Rationale:** Excel has no lexical scope; a formula can only reference cells, not "the scope where it was defined."

### Rule 5: Single Return Value (No Destructuring)

A function returns one value, and a cell receives one value. Destructuring assignment is illegal.

```javascript
// INVALID
const \[$a, $b\] \= $fMyFunc();
// VALID: return a Map and access by key
const $mResult \= $fMyFunc();
// Use $mResult.min and $mResult.max separately
```

### Rule 6: Type Immutability Across Branches

All branches of a ternary must return the same type. A variable cannot be a number in one branch and a string in another.

```javascript
// INVALID: mixed types
const $result \= $bOk ? $cTotal : "ERROR";
// VALID: use a sentinel value
const $result \= $bOk ? $cTotal : \-1;
```

**Rationale:** In Excel, a cell has one type. Formulas referencing a cell that might change type will break.

### Rule 7: Physically Bounded Arrays

Using `Arr.push()` without a predefined limit is forbidden. All array manipulation must occur within a bounded `JSOL.range(..., Max)` block where `Max` is the maximum possible array size.

### Rule 8: No Short-Circuit Dependence

In JavaScript, `A && B()` ignores `B` if `A` is false. In Excel, `=IF(A, B, C)` calculates **both** branches unconditionally. JSOL-X prohibits side effects in branches because they will be executed regardless of the condition.  
**Note:** If all functions are pure (Rule 4, and by extension all JSOL-X functions), this is a performance consideration rather than a correctness one. The developer should be aware that expensive computations in unused branches still execute.

### Rule 9: No `while` Loops

`while` loops have no predetermined iteration count and cannot be expressed in Excel. All iteration must use `JSOL.range()` with a static `Max` limit.

### Rule 10: No `switch` Fallthrough

`switch` cases cannot be left open. Every case must terminate with `break` or `return`. Empty cases may stack. All `switch` statements compile to `=IFS()` or `=SWITCH()` in Excel.

```javascript
// VALID: every case terminates
switch ($qCategory) {
    case 1:
        $cRate \= 10;
        break;
    case 2:
        $cRate \= 20;
        break;
    default:
        $cRate \= 30;
}
// Compiles to: =IFS(A1=1, 10, A1=2, 20, TRUE, 30)
```

### Rule 11: Acyclic Dependency Graph

The dependency graph between variables must be a DAG. Circular references are rejected by Excel and must be caught by the linter.

```javascript
// INVALID: circular
const $a \= $b + 1;
const $b \= $a + 1;
```

Since JSOL-X enforces SSA (Rule 1), this graph can be built and verified statically at compile time.

---

*This document was produced with systematic AI co-piloting as described in [`AI_ENGINEERING_METHODOLOGY.md`](../AI_ENGINEERING_METHODOLOGY.md). AI was used for architectural stress-testing, cross-model validation, and drafting; all content has been reviewed for technical accuracy and adherence to project constraints.*

* * *

_JSOL v0.2 — 2026-08-10, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](https://../LICENSE)_