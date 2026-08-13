# JSOL Interpreter/Table Backlog

Product notes for the PHP interpreter that runs .jsol files and displays them in a table-like interface. Separate from the JSOL language backlog: this is about the tool, not the core.

## Positioning (read before adding features)

The vision is that a business person would prefer JSOL over Excel to express a rule. This means that, from the list below downward, everything falls into the "another JavaScript playground" category if we're not careful. The output of JSOL in this interpreter isn't "running code": it's a table. 

Any new feature should be first evaluated against this identity: does it bring the experience closer to a spreadsheet or a tool a business user would understand and prefer, or does it bring it closer to VS Code? If it's the latter, it gets reconsidered or dropped.

## Multi-algorithm Comparison (the use case that triggered this note)

-   Ability to combine several .jsol files into a single comparison table: checkboxes in the listing, all selected files receive the same input values, each returns its result in its own column.
-   Use case: comparing different search or sort algorithms with the same input, or comparing greedy vs. DP on the same problem (e.g., coin-change) to show where greedy fails to reach the optimum.
-   If you want to compare performance between algorithms, the evaluated function should be able to return something like an operation counter in its return value, not a timestamp (a timestamp is neither comparable nor reproducible across runs).

## General Features

-   **Editing and versioning:** ability to edit the code, and while it's not running, be able to go back—not just with a simple UNDO but with intelligent versioning.
-   **Persistence:** "save as" to the filesystem if local, download, plus basic persistence in localStorage just to avoid accidentally losing the session.
-   **Two-panel layout:** input (currently the examples listing, later the code) and output. The output could work with tabs: current table, console (debugging), compiled code (JS, or any supported language, though what actually runs is JS).
-   **Manual/reference:** available within the tool, equivalent to what a spreadsheet has for its functions.
-   **Future (further out):** autocomplete and suggestions, but designed for someone with no programming experience and no specific JSOL knowledge—not IDE-style autocomplete.

## General Principle

The experience should feel more like Excel and familiar office tools than VS Code, in every interface design decision.

---

*JSOL v0.2.91 r. 2026-08-12, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*
