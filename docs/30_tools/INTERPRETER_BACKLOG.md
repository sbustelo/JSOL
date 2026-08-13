# JSOL Interpreter/Table Backlog

Product notes for the PHP interpreter that runs .jsol files and displays them in a table-like interface. Separate from the JSOL language backlog: this is primarily about the tool, not the core.

> **Status: Ideas and Speculations.** The concepts outlined below (especially regarding SSOT, graphing, and custom types) are exploratory ideas and architectural speculations, not firm commitments or resolved features. They serve as a vision board for the tool's evolution.

## Positioning (read before adding features)

The vision is that a business person would prefer JSOL over Excel to express a rule. This means that, from the list below downward, everything falls into the 'another JavaScript playground' category if we're not careful. The output of JSOL in this interpreter isn't 'running code': it's a "business-friendly" artifact, e.g. a table.

Any new feature should be first evaluated against this identity: does it bring the experience closer to a spreadsheet or a tool a business user would understand and prefer, or does it bring it closer to VS Code? If it's the latter, it gets reconsidered or dropped.

## Specification & Execution SSOT (Single Source of Truth)

- **Unified Execution:** Explore an SSOT for JS execution between the compiler and the interpreter to avoid catching manual deviations. Ideas include having the same JSOL core that runs the compiler also run the interpreter, or treating the interpreter itself as a direct compilation target.
- **The jsol-spec.json Concept:** A centralized specification file is needed for the interpreter to power advanced UX, including autocomplete and syntax highlighting.
- **Apple Numbers UX:** When a user types a function or formula name, the interpreter uses the SSOT to display an interface with placeholders for arguments, while a sidebar Inspector shows the contextual help manual.
- **Compiler Synergy:** Documenting this JSON SSOT solves multiple architectural issues in one step across both the compiler and the interpreter. It separates the compiler's Core parser from the Domain rules, streamlining the systematic addition of new targets.

## Iteration, Graphing, and Custom Data Types

- **Iteration Interface:** Beyond evaluating manual grids, present an interface for programmatic iteration (similar to macOS Graph).
- **Combinatorics vs. Animation:** If there are multiple inputs, allow users to choose between combinatorial matrices (all-vs-all) or using one of the axes as a timeline/slider for animation.
- **Visualization Types:** Support spreadsheet-style charts, 2D/3D graphs, and spatial plots (e.g., populating a grid where the formula returns x, y, and a magnitude or color).
- **Custom Data Types:** Introduce support for domain-specific data types. Even if they are not core primitives in JSOL, they could be declared via JSON/JSOL so the interpreter knows how to parse and graph them.
- **Use Case (IPAX & WCAG):** This combinatorics and graphing engine would allow JSOL to natively host and auto-generate complex UIs, such as the current IPAX Color Contrast Matrix (evaluating accessibility across all pairs from a list of hex values combined with itself).

## Multi-algorithm Comparison (the use case that triggered this note)

- Ability to combine several .jsol files into a single comparison table: checkboxes in the listing, all selected files receive the same input values, each returns its result in its own column.
- Use case: comparing different search or sort algorithms with the same input, or comparing greedy vs. DP on the same problem (e.g., coin-change) to show where greedy fails to reach the optimum.
- If you want to compare performance between algorithms, the evaluated function should be able to return something like an operation counter in its return value, not a timestamp (a timestamp is neither comparable nor reproducible across runs).

## General Features

- **Editing and versioning:** ability to edit the code, and while it's not running, be able to go back—not just with a simple UNDO but with intelligent versioning.
- **Persistence:** 'save as' to the filesystem if local, download, plus basic persistence in localStorage just to avoid accidentally losing the session.
- **Two-panel layout:** input (currently the examples listing, later the code) and output. The output could work with tabs: current table, console (debugging), compiled code (JS, or any supported language, though what actually runs is JS).
- **Manual/reference:** available within the tool, equivalent to what a spreadsheet has for its functions.
- **Future (further out):** autocomplete and suggestions, but designed for someone with no programming experience and no specific JSOL knowledge—not IDE-style autocomplete.

## General Principle

The experience should feel more like Excel and familiar office tools than VS Code, in every interface design decision.

---

*JSOL v0.2.92 — 2026-08-13, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*