# JSOL Interpreter/Editor Backlog

Product notes for the PHP interpreter that runs .jsol files and displays them in a table-like interface. Separate from the JSOL language backlog: this is primarily about the tool, not the core.

> **Status: Ideas and Speculations.** The concepts outlined below (especially regarding SSOT, graphing, and custom types) are exploratory ideas and architectural speculations, not firm commitments or resolved features. They serve as a vision board for the tool's evolution.

## Positioning (read before adding features)

The vision is that a business person would prefer JSOL over Excel to express a rule. This means that, from the list below downward, everything falls into the 'another JavaScript playground' category if we're not careful. The output of JSOL in this interpreter isn't 'running code': it's a "business-friendly" artifact, e.g. a table.

Any new feature should be first evaluated against this identity: does it bring the experience closer to a spreadsheet or a tool a business user would understand and prefer, or does it bring it closer to VS Code? If it's the latter, it gets reconsidered or dropped.

## Specification & Execution SSOT (Single Source of Truth)

-   **Unified Execution:** Explore an SSOT for JS execution between the compiler and the interpreter to avoid catching manual deviations. Ideas include having the same JSOL core that runs the compiler also run the interpreter, or treating the interpreter itself as a direct compilation target.
-   **The jsol-spec.json Concept:** A centralized specification file is needed for the interpreter to power advanced UX, including autocomplete and syntax highlighting.
-   **Apple Numbers UX:** When a user types a function or formula name, the interpreter uses the SSOT to display an interface with placeholders for arguments, while a sidebar Inspector shows the contextual help manual.
-   **Compiler Synergy:** Documenting this JSON SSOT solves multiple architectural issues in one step across both the compiler and the interpreter. It separates the compiler's Core parser from the Domain rules, streamlining the systematic addition of new targets.

## Iteration, Graphing, and Stateful Rows

-   **Iteration Interface:** Beyond evaluating manual grids, present an interface for programmatic iteration (similar to macOS Graph).
-   **Combinatorics vs. Animation vs. Head-to-Head vs. Parallel Comparison:** With multiple inputs, four distinct modes are needed, not two:
    
    -   **Combinatorics:** all-vs-all matrix (e.g. the IPAX contrast matrix below).
    -   **Animation/Timeline:** one axis becomes a sequence of steps, each step's inputs partly determined by prior steps' outputs (see "Stateful Rows" below).
    -   **Head-to-Head:** two selected algorithms run against _each other_ round over round, each one's output feeding the other's next input (see Prisoner's Dilemma below). This is animation/timeline's stricter sibling: state doesn't just carry forward from a function to itself, it crosses between two different selected columns.
    -   **Parallel Comparison:** several _different_ algorithms run against the _same_ static input, side by side, one column per algorithm, with no state threading between rows or columns at all (see "Multi-algorithm Comparison" below). This is the simplest of the four modes, and likely the most commonly used — comparing bubble-sort against merge-sort on the same array is Parallel Comparison, not Combinatorics.

### Stateful Rows: the `@carry` tag

JSOL functions stay pure and stateless — that doesn't change, it's not up for revision. What changes is that the interpreter can thread a value from one row into the next row's input, so a function written to compute a single step can be run repeatedly to simulate a sequence, without the function itself ever holding memory.

Two real use cases surfaced this, from unrelated domains, which is why it's worth specifying properly instead of one-off hacking it per example:

-   **Iterated Prisoner's Dilemma** (`examples/13-game-theory/`): a strategy function (`tit-for-tat.jsol.js`, `grim-trigger.jsol.js`, etc.) takes the _opponent's_ move history as an array argument and returns this round's move. Running N rounds means calling the same pure function N times, each time with the opponent's history one move longer — and the value being carried forward comes from a _different_ selected function (the opponent's), not from the function's own prior output.
-   **Conway's Game of Life** (`examples/14-cellular-automata/`, proposed): a step function takes the current grid (`array<array<boolean>>`) and returns the next generation. Running N generations means calling the same function N times, each time feeding in exactly what the _same_ function returned last time — the entire state is replaced each step, nothing accumulates.

These two cases need different combination semantics (append a value to a growing list, vs. replace entirely) and different sources (self vs. a different selected column), so a naming convention alone ("call the accumulator `$mState`" or similar) can't carry enough information — it can't say _how_ to combine, and it can't say _whose_ output to use in Head-to-Head mode. This needs a declarative tag, the same shape as `@contract`, not a guess based on a variable name:

js

Copy

Download

/\*\*
 \* @carry
 \* {
 \*   "param": "$aOpponentHistory",
 \*   "from": "column:opponent",
 \*   "mode": "append"
 \* }
 \*/
const $sTitForTat \= function($aOpponentHistory) { ... };

js

Copy

Download

/\*\*
 \* @carry
 \* {
 \*   "param": "$aGrid",
 \*   "from": "self",
 \*   "mode": "replace"
 \* }
 \*/
const $aNextGeneration \= function($aGrid) { ... };

-   `"param"`: which of the function's own parameters receives the carried value.
-   `"from"`: `"self"` (this same function's own previous return value) or `"column:<name>"` (another selected algorithm's previous return value — only meaningful in Head-to-Head mode, and the interpreter needs a way to let the user assign which selected function is `"opponent"`, `"player1"`, etc. when more than two are selected).
-   `"mode"`: `"replace"` (the carried value becomes the new value of `param` outright — Conway) or `"append"` (the carried value is pushed onto `param`, which must be an array — Prisoner's Dilemma).

First row of any timeline/Head-to-Head run has nothing to carry yet; `param` gets whatever empty/default value its type implies (`[]` for an array parameter, per `mode: "append"`'s requirement that it be array-typed).

### Rendering hints: the `@visualize` tag

Conway's grid doesn't need a new core type — `array<array<boolean>>` already exists. What's missing is telling the interpreter this particular return value should be painted as a pixel grid instead of shown as a nested data table. Same shape of solution as `@carry`, a declarative tag instead of an inferred convention:

js

Copy

Download

/\*\*
 \* @visualize
 \* { "type": "grid", "true": "#000000", "false": "#ffffff" }
 \*/

For a richer variant where each cell is a magnitude rather than boolean (heat maps, generational age-coloring), `"type": "grid"` over `array<array<number>>` with a color-scale spec instead of a two-color map covers it with the same tag shape — no second mechanism needed.

### Custom I/O Adapters

Not every example fits the generic spreadsheet-table paradigm, and forcing all of them into it would be the same mistake as inventing a naming convention for `@carry` — technically possible, but hiding real structure. A Markov chain example is the clearest case: it naturally wants a multi-file input (upload a text corpus, possibly several files at once) feeding the model-building step, and a live textarea next to it where typed or generated text can be edited — the generator reads back as many trailing words as its n-gram size needs and continues from there, so editing the textarea and continuing is a normal part of using the example, not a special mode.

This is a distinct concept from `@carry`/`@visualize`: those describe how _rows_ relate to each other in the default table view; a custom I/O adapter replaces the _view itself_ for one example. Proposed shape, same declarative-tag family:

js

Copy

Download

/\*\*
 \* @interface
 \* { "type": "text-generator", "input": "multi-file", "output": "editable-textarea" }
 \*/

Left open deliberately: how many `@interface` types are worth building before this becomes "another JS playground with extra steps" (see Positioning, above) — start with the one concrete case (Markov) rather than designing a general plugin system speculatively.

### Markov Chains — blocked, not scoped

A Markov text generator needs two steps: build an n-gram frequency dictionary from input text (arbitrary vocabulary, keys unknown ahead of time), then walk it to generate text. The first step needs a growable dictionary; `Map.create()` is documented as producing an _immutable_ structure by design (see `SPEC_CANDIDATES.md`). This is not scoped for `examples/` yet — it depends on a language-level decision (does JSOL ever get a mutable `Map.set`, and if so, at what cost to the determinism guarantees a mutable shared structure puts at risk), not on interpreter work.

### Other Visualization Types

-   Support spreadsheet-style charts, 2D/3D graphs, and spatial plots (e.g., populating a grid where the formula returns x, y, and a magnitude or color) — the general case `@visualize`'s grid mode is one instance of.

### Custom Data Types

Introduce support for domain-specific data types. Even if they are not core primitives in JSOL, they could be declared via JSON/JSOL so the interpreter knows how to parse and graph them. Tied to the custom-type-prefix proposal (minimum 3 characters) in `SPEC_CANDIDATES.md` — note that neither Conway nor the Prisoner's Dilemma actually needed a custom type to get this far; core arrays plus a rendering hint covered both. Custom types remain relevant for color (once the trig-function gap in `SPEC_CANDIDATES.md` is resolved) and similar domain values with their own parsing/validation rules, not for "this array should be drawn differently," which `@visualize` already covers.

### Use Case (IPAX & WCAG)

This combinatorics and graphing engine would allow JSOL to natively host and auto-generate complex UIs, such as the current IPAX Color Contrast Matrix (evaluating accessibility across all pairs from a list of hex values combined with itself) — a Combinatorics-mode use case, distinct from the Animation/Head-to-Head/Parallel Comparison modes above.

## Multi-algorithm Comparison (Parallel Comparison mode — see "Combinatorics vs. Animation vs. Head-to-Head vs. Parallel Comparison" above)

-   Ability to combine several .jsol files into a single comparison table: checkboxes in the listing, all selected files receive the same input values, each returns its result in its own column.
-   Use case: comparing different search or sort algorithms with the same input, or comparing greedy vs. DP on the same problem (e.g., coin-change) to show where greedy fails to reach the optimum.
-   If you want to compare performance between algorithms, the evaluated function should be able to return something like an operation counter in its return value, not a timestamp (a timestamp is neither comparable nor reproducible across runs).

## Evaluable Input Cells

Input cells today accept only literal values. This section documents the requirement to let a cell hold a JSOL expression instead (`4+6`, `"Hola"+""+"mundo"`, and eventually cross-row references — see below).

**Execution model:** the cell's content is JSOL source, wrapped in an implicit `return (...)`. It does not compile to JS text and run that; the interpreter keeps a deterministic JS interpreter, loaded with the same polyfills as `dist/stdlib/jsol-core.js` (0.2.94 architecture plan, Hito 1), and evaluates the expression directly against it, inside the same Web Worker sandbox already defined for the REPL (hardened linter, no `eval`/`window`, execution timeout). This is not a new runtime — it is the existing polyfill library, applied one level below the whole-file case it was built for.

**This introduces a determinism claim that needs its own verification, not an assumption:** interpreting JSOL source directly against the polyfills must produce bit-for-bit identical results to what compiling that same source to JS and running it would produce. Nothing today checks this. It needs a third leg alongside the JS↔PHP fixed-point convergence already covered by `selfhost-verify.sh`: interpreted-with-polyfills↔compiled-JS. Cheap to get wrong quietly, since both paths "look like JS" — that similarity is exactly why it can't be assumed equivalent without a check.

**Type resolution:** an evaluated cell's result is coerced against the destination parameter's `$`\-prefix, the same rule `@contract` already uses to bind input values — no second typing system.

## Cross-Row Reference Syntax (open, not decided)

Grid mode shows inputs and outputs in columns, one row per iteration. Some cases already need a row's input expression to reference other rows' values; the syntax for this is undecided, but the known cases below define hard requirements it has to satisfy, whatever shape it ends up taking. Reserved-name family `$_` applies (same convention as `$_i` / `$_i_[Name]`), exact form open.

**Known cases, and which requirement each one forces:**

-   **Tit-for-Tat** (`13-game-theory/tit-for-tat.jsol.js`): only needs the _immediately preceding_ row's value (opponent's last move). Single-row reference is sufficient here.
-   **Grim Trigger** (`13-game-theory/grim-trigger.jsol.js`): needs _every_ preceding row (scans full history for any past defection). Single-row reference is not sufficient for this case — it forces support for a full-history range.
-   **Conway's Game of Life** (`14-cellular-automata/`, proposed): needs the immediately preceding row's value, but as a _replacement_, not an item to append to a list (see `@carry`'s `mode: "replace"`). Same cardinality as Tit-for-Tat (one row), different combination semantics — the reference syntax and the `@carry` combination mode are separate concerns, this case is why they can't be collapsed into one.
-   **Markov generation step** (blocked on `Map.set`, see `SPEC_CANDIDATES.md`, but the reference requirement stands independent of that block): needs a _bounded trailing window_ — the last N rows, where N is the model's n-gram size, neither one row nor the entire history.
-   **Moving average / running total** (no example written yet, raised in this conversation as the case that surfaces the next requirement): needs a range of preceding rows _pre-aggregated_ before it reaches the expression — not the raw array of N values for the expression to loop over itself, but something like `SUM(range)` or `AVERAGE(range)` already reduced to a scalar. This is the case that forces Excel-style aggregate functions (`SUM`, `AVERAGE`, `SUMIF`, ...) to exist as callable names inside a cell expression, not just array values to reference.

**Consequence that follows directly from the cases above, not a separate proposal:** a range reference has to be able to arrive at the destination parameter two different ways — as a raw array (for Grim Trigger, which needs to inspect every element itself) or pre-reduced through an aggregate function (for a moving average, which never wants the raw array at all). Whatever syntax gets designed needs to support both without the caller writing a loop for the second case — that is the entire point of an aggregate function existing.

## Spreadsheet Extensions and Distribution Policy

Evaluable cells bring the Excel metaphor all the way in, which forces a question the project hasn't had to answer yet: aggregate functions (`SUM`, `SUMIF`, ...) and domain-specific types (hex colors, CSS color syntax for IPAX, eventually `$col`/`$ang`\-style custom prefixes) are not part of the JSOL core, and don't belong in it — but they need _some_ defined way to reach a compiled target.

**Three distribution modes, not a hypothetical menu — each one is already forced by a real target that exists today:**

1.  **Inline / compiled directly.** The extension's logic is transpiled into the call site the same way core primitives are, using the same domains/targets SSOT mechanism from the 0.2.94 architecture plan — `src/domains/ipax-colors/` was already named as an example domain in that doc, this is not a new mechanism, it's domains/targets applied to something other than core. **JSOL-X has no other option:** a spreadsheet is a single self-contained file, it cannot load an external library, so any extension used inside JSOL-X _must_ compile inline, full stop.
2.  **Linked runtime library.** The compiler emits a bare call (`JsolColorScience.toHex(...)`) against a separate compiled library, shipped alongside the output — the same model APCA/Myndex uses for their own color library, at a more basic layer. Better fit for something like IPAX in a real JS/PHP app: many files reusing the same non-trivial color math repeatedly, where inlining would duplicate that logic into every compiled output instead of sharing one runtime copy.
3.  **Both, selected by a compile flag.** Not "why not offer both" for its own sake — two targets that already exist force two different answers (JSOL-X needs inline, a linked JS/PHP deployment benefits from a shared library), so the flag isn't speculative flexibility, it's already required by the targets on the table today.

**What stays non-negotiable regardless of how this resolves:** the _core_ (`Str.*`, `Arr.*`, `Map.*`, `Math.*`, `Bit.*`, `Cast.*`) always compiles inline, zero dependency, no exception — that guarantee is what "no toolchain to install before you can start" actually means, and it's not up for revision by this question. Only extensions are in scope for modes 2 and 3.

**Where this needs to live:** this question also touches the domains/targets architecture directly (mode 1 depends on it, and the SSOT cross-validation gate would need to know which mode each domain declares). Worth a pointer from `SPEC_CANDIDATES.md` back to this section rather than duplicating the reasoning in both places.

## General Features

-   **Editing and versioning:** ability to edit the code, and while it's not running, be able to go back—not just with a simple UNDO but with intelligent versioning.
-   **Persistence:** 'save as' to the filesystem if local, download, plus basic persistence in localStorage just to avoid accidentally losing the session.
-   **Two-panel layout:** input (currently the examples listing, later the code) and output. The output could work with tabs: current table, console (debugging), compiled code (JS, or any supported language, though what actually runs is JS).
-   **Manual/reference:** available within the tool, equivalent to what a spreadsheet has for its functions.
-   **Future (further out):** autocomplete and suggestions, but designed for someone with no programming experience and no specific JSOL knowledge—not IDE-style autocomplete.

## General Principle

The experience should feel more like Excel and familiar office tools than VS Code, in every interface design decision.

* * *

## Business Document Layer: Markdown Comments

The interpreter/editor should explore treating block comments as a rich business-document layer rather than as conventional programming comments.

The fundamental idea is that JSOL source can contain two complementary layers:

-   **Business narrative:** Markdown text explaining rules, assumptions, context, decisions, exceptions, examples, etc.
-   **Executable logic:** JSOL code implementing those rules.

The code remains the executable source of truth, but the business narrative should be the primary reading experience for non-programmers.

### Markdown in Comments

-   Support Markdown inside `/* ... */` comments.
-   The JSOL parser continues to treat the entire block as a comment; Markdown is an editor/interpreter concern, not a new semantic feature of the language.
-   Render Markdown comments as formatted content in the editor rather than displaying them as greyed-out source code.
-   Support common Markdown constructs initially:
    
    -   headings
    -   paragraphs
    -   emphasis
    -   ordered and unordered lists
    -   blockquotes
    -   links
    -   inline code
    -   code blocks
    -   tables
-   Keep the original Markdown as the persisted source. Rendered HTML is a presentation layer, not the source of truth.

### Business View vs. Code View

The editor should not necessarily follow the traditional IDE hierarchy where code is the protagonist and comments are secondary.

A JSOL document may instead be presented primarily as a business document:

text

Copy

Download

\# Eligibility for financing
A customer is eligible when:
\- They are over 18
\- They have no overdue debt
\- Their score is above 650
▸ Implementation

The implementation can be disclosed on demand:

text

Copy

Download

▾ Implementation
if (customer.age > 18
    && customer.overdueDebt == 0
    && customer.score > 650) {
    eligible = true
}

This suggests at least two complementary presentation modes:

-   **Business View:** Markdown/narrative content is prominent; implementation details are collapsed.
-   **Code View:** The underlying JSOL source is displayed normally.
-   Potentially a third **Split View**, showing narrative and implementation together.

The disclosure state should be per block or section rather than necessarily global.

### WYSIWYG Markdown Editing

A rendered Markdown block should eventually be directly editable.

Possible interaction:

-   A Markdown/business-text block has a toggle between **Source** and **Visual**.
-   Source mode exposes the actual Markdown.
-   Visual mode provides WYSIWYG editing.
-   Editing in Visual mode updates the underlying Markdown.
-   Switching back to Source exposes the generated Markdown.
-   The Markdown remains the canonical representation of the business narrative.

This should make it possible for a business user to edit the explanatory/documentary layer without ever having to understand Markdown syntax.

### Business Document Semantics

The distinction between "comment" and "business documentation" should be considered carefully.

From the JSOL language's perspective, these remain comments.

From the editor's perspective, they can represent:

-   business rules
-   explanations
-   assumptions
-   definitions
-   exceptions
-   warnings
-   examples
-   decisions
-   rationale
-   instructions
-   contextual information
-   references to external documentation

This potentially makes a JSOL file closer to an executable business document than to a conventional source-code file.

A useful conceptual model is:

> **The Markdown explains what the business means. JSOL expresses how that meaning is executed.**

### Embedded Results and Dynamic Business Content

A further possibility is allowing Markdown documents to reference evaluated JSOL expressions or results.

For example, some lightweight syntax could allow a business document to contain dynamically generated values:

text

Copy

Download

\## Current eligibility threshold  
The minimum score is \*\*{{ customer.scoreThreshold }}\*\*.

Or a computed result:

text

Copy

Download

\### Result
The customer is \*\*{{ eligible ? "eligible" : "not eligible" }}\*\*.

The exact syntax should not be decided yet. Possibilities include:

-   interpolation syntax such as `{{ ... }}`
-   shortcodes
-   dedicated tags
-   fenced blocks
-   named result references

The important architectural question is whether these references are evaluated by JSOL itself or by a separate presentation layer.

### Embedded Tables

The same mechanism could potentially expose JSOL results directly inside the business document.

For example:

text

Copy

Download

\## Eligible products
\[dynamic table: eligibleProducts\]

which could render as:

| Product | Rate | Maximum |
| --- | --- | --- |
| Standard | 8.5% | $10,000 |
| Premium | 7.2% | $25,000 |
| Enterprise | 6.1% | $100,000 |

The table would not be manually maintained documentation. It would be generated from the same JSOL logic/data used by the executable document.

Column headers are derived from the keys of the first Map in the returned array, in the order those keys were passed to `Map.create()` — the same ordering guarantee `@contract`'s cases already rely on for the default table view, no separate rule needed.

This could eventually support:

-   dynamic values
-   tables
-   lists
-   calculated summaries
-   charts
-   matrices
-   status indicators
-   selected output fields
-   potentially interactive controls

### Relationship to `@carry` / `@visualize` / `@interface`

The tags introduced under "Iteration, Graphing, and Stateful Rows" (`@carry`, `@visualize`, `@interface`) and the interpolation/embedding syntax proposed here (`{{ ... }}`, `[dynamic table: ...]`) are two different mechanisms, not competing proposals for the same problem — and that distinction should stay explicit as both develop further:

-   `@carry` / `@visualize` / `@interface` are metadata _about a function_: how its parameters relate to previous rows, how its return value should be rendered, what kind of custom UI it needs. They live in the JSDoc block above the function and apply uniformly to every row/call.
-   `{{ ... }}` / `[dynamic table: ...]` are references _inside free narrative text_: a specific value or result surfaced at a specific point in the prose, not a rule about the function's behavior as a whole.

A function can have both at once: a `@carry` tag governing how it behaves across rows in the table view, while its individual results are still referenced via `{{ }}` inside a Business View narrative describing one particular row's outcome. Keep both mechanisms narrow and single-purpose rather than merging them into one generalized templating system — that merge is exactly the kind of scope creep the Positioning section warns against.

### JSOL as an Executable Business Document

If the above concepts converge, the resulting artifact is neither a traditional source-code file nor a conventional document.

It could be thought of as something closer to:

> **Apple Numbers, but the spreadsheet is replaced by executable business logic.**

Or:

> **A business document whose narrative, calculations, rules, tables and visualizations are generated from the same executable source.**

The analogy with Numbers/Excel is particularly relevant because the user should be able to inspect the result without necessarily understanding the implementation.

A document might therefore contain:

1.  **Narrative** — what the business rule means.
2.  **Inputs** — what the user can change.
3.  **Rules** — executable JSOL logic.
4.  **Results** — calculated values and tables.
5.  **Visualizations** — graphs/matrices where appropriate.
6.  **Implementation** — optionally disclosed for technical users.

Items 1–3 already exist today, not as a future design: `@description` is the narrative, `@contract` is the inputs (and doubles as the example values a business reader would see), and the JSOL function body is the rules. `examples/` already has close to 90 files written in exactly this shape. Items 4–6 (results, visualizations, disclosed implementation) are the actual net-new work — rendering what's already there, not inventing a new document format to hold it.

### Potential Interaction Model

A JSOL document could eventually look conceptually like:

text

Copy

Download

┌──────────────────────────────────────────────┐
│ CREDIT ELIGIBILITY                           │
│                                              │
│ A customer qualifies for financing when...   │
│                                              │
│ • Age ≥ 18                                   │
│ • No overdue debt                            │
│ • Score ≥ 650                                │
│                                              │
│ Customer                                     │
│ ┌──────────────────────────────────────────┐ │
│ │ Age       42                             │ │
│ │ Score     712                            │ │
│ │ Debt      $0                             │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ RESULT                                       │
│ ✓ Eligible                                   │
│                                              │
│ ▸ Implementation                             │
└──────────────────────────────────────────────┘

The same `.jsol` file would contain both the narrative and the executable logic required to produce this result.

### Security and Trust Boundaries

Dynamic Markdown introduces an important security boundary.

-   Rendered Markdown should not automatically allow arbitrary executable HTML/JavaScript.
-   Raw HTML support should be evaluated separately from Markdown support.
-   Dynamic expressions embedded in Markdown must run within the same controlled JSOL execution model defined for the REPL sandbox (Web Worker execution timeout, hardened linter, prototype-pollution prevention — see the 0.2.94 architecture doc, Section 2). This section should reference that spec directly rather than restate the requirement in the abstract, so the two don't drift apart if the sandbox rules change.
-   The distinction between static Markdown and executable interpolation should remain explicit.
-   Sanitization may be required before rendering generated HTML.

### Architectural Questions

Before committing to this direction, investigate:

-   Which Markdown parser best fits the existing PHP/JS architecture?
-   Should Markdown rendering happen in PHP, JavaScript, or both?
-   Is Markdown required to be CommonMark-compatible?
-   Should raw HTML be allowed?
-   How should Markdown comments map to editor blocks?
-   How should WYSIWYG editing preserve Markdown?
-   How should dynamic expressions be evaluated?
-   How should dynamic tables reference JSOL values?
-   Can the existing execution model expose results safely to the presentation layer?
-   Should embedded content be declarative rather than executable?
-   How should the system behave when a referenced value does not exist or evaluation fails?

## Feasibility / Assessment

This direction appears technically feasible, but it should be treated as a layered evolution rather than a single feature.

The basic Markdown layer is low risk:

-   Markdown inside existing comments requires no change to JSOL semantics.
-   Markdown can be parsed independently by the editor.
-   Existing `.jsol` files remain valid.
-   The original source can remain the SSOT.

Business View and collapsible implementation are also relatively low risk because they are primarily editor/presentation concerns.

WYSIWYG editing introduces more complexity because the system needs a reliable Markdown ↔ document-model conversion. A mature Markdown editor framework could substantially reduce this work.

Dynamic content is a larger architectural step. Once Markdown can contain evaluated JSOL expressions, tables or other generated artifacts, the document layer becomes coupled to the execution engine. This should therefore be designed after the static Markdown/business-document layer has been validated.

The largest risk is not technical. It is **product drift**.

The feature is valuable if it makes JSOL more understandable to business users. It becomes counterproductive if it evolves into a general-purpose rich-text editor, HTML renderer, or programming IDE.

The governing principle should remain:

> **Every capability should make the JSOL artifact more useful as a business document, not merely make the editor more powerful.**

## Next Steps

### Phase 1 — Validate the concept

-   Add Markdown rendering to existing block comments.
-   Start with a deliberately limited Markdown subset.
-   Render comments as document content rather than grey source-code comments.
-   Add collapse/expand controls for implementation blocks.
-   Select 3–5 representative JSOL documents from the existing `examples/` corpus (~90 files already written with `@description` + `@contract` + code) rather than authoring new ones — the raw material for this phase already exists.
-   Test the documents with both technical and non-technical readers.
-   Validate whether the Business View is actually easier to understand than the current table/code presentation.

### Phase 2 — Prototype the document model

-   Define how a JSOL source file maps to document sections.
-   Determine whether comments naturally provide sufficient structure or whether lightweight metadata is eventually required.
-   Prototype Business View, Code View and Split View.
-   Establish Markdown as the canonical representation of narrative content.
-   Evaluate `markdown-it`, `marked`, `micromark` and `remark` against the actual requirements.

### Phase 3 — WYSIWYG

-   Prototype a single editable Markdown comment.
-   Evaluate an existing Markdown WYSIWYG/document model rather than building one from scratch.
-   Test Markdown → visual → Markdown round-tripping.
-   Establish which Markdown constructs can be safely edited visually.
-   Keep source fidelity as a requirement.

### Phase 4 — Dynamic content

Only after the static document model works:

-   Prototype a single dynamic value.
-   Prototype a dynamically generated table.
-   Define a minimal interpolation/shortcode syntax.
-   Determine how dynamic content references JSOL execution results.
-   Establish security and evaluation boundaries.
-   Test whether dynamic content genuinely improves business comprehension.

### Phase 5 — Validate the larger product idea

Build a small number of complete "executable business documents" combining:

-   Markdown narrative
-   inputs
-   JSOL rules
-   calculated results
-   tables
-   collapsed implementation

Then compare them directly with equivalent Excel/Numbers documents.

The key validation question is not:

> "Can JSOL do this?"

It is:

> **"Would a business person rather read, modify and trust this JSOL document than the equivalent spreadsheet?"**

If the answer is consistently yes, this becomes a foundational direction for the interpreter/editor rather than merely another editor feature.

* * *

_JSOL v0.2.93 — 2026-08-18, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](https://../LICENSE)_