<img src="../../assets/mascot/jsol-avatar.png" width="90" alt="JSOL mascot">

# JSOL-X: JSOL for Excel (Vision)

jsol-x-mascot-full.png

*Excel® and Microsoft® are registered trademarks of Microsoft Corporation. Google Sheets™ is a trademark of Google LLC. All other trademarks are property of their respective owners. Use of these names does not imply affiliation or endorsement.*

> **Status: Vision / Pre-specification.** Nothing in this directory is implemented, and nothing is promised for any particular release. JSOL-X is the most demanding projection the JSOL specification has been subjected to so far. It exists to stress-test today's type system, function naming, and compilation architecture against a target that is not a programming language at all — and to ensure that if the day comes when JSOL compiles to spreadsheets, nothing in today's spec will stand in its way.

## What is JSOL-X?

JSOL-X is the spec of a strict subset of JSOL that would compile to Microsoft Excel (`.xlsx`) workbooks. Same source file, two radically different surfaces: a developer's backend code, and an analyst's spreadsheet.

It is the most ambitious projection in JSOL's design philosophy: the question "what if JSOL compiled to Excel?" is unlikely to ever ship at scale, but asking it honestly forces answers that make every other target better. See `../DESIGN_PHILOSOPHY.md`.

## Why this directory exists

JSOL is at v0.2. JSOL-X is not on the roadmap for v1.0, or even v2.0. But the type prefixes being designed *right now* (`$c` for Currency, `$p` for Percentage, `$d` for Date) are being designed with JSOL-X in mind, because changing a type prefix after adoption is expensive, and getting it right before anyone depends on it is cheap.

This directory holds the working documents for that projection. They are speculative by design. Their purpose is to give direction to current specification efforts, not to describe something that exists.

<img src="../../assets/mascot/jsol-x-mascot-hologram-full.png" width="280" alt="JSOL-X mascot, full body">

_The JSOL-X mascot is a vision at the time: a fuzzy hologram with preliminary JSOL-X code for calculating Compound Interest_

## Documents

| Document | What it covers | Status |
|----------|---------------|--------|
| [JSOL-X_LANGUAGE_SPEC.md](JSOL-X_LANGUAGE_SPEC.md) | Syntax, types, operators, JSOL.range(), core helpers, compilation topology, linter rules | Preliminary draft |
| [JSOL-X_EXAMPLES.md](JSOL-X_EXAMPLES.md) | Luhn algorithm, tiered commissions, progressive tax, volume discounts — with source and expected Excel output | Preliminary draft |
| [JSOL-X_INTERPRETER_VISION.md](JSOL-X_INTERPRETER_VISION.md) | Interactive input/output grid for business validation, the missing piece between IDE and spreadsheet | Preliminary draft |
| [JSOL-X_GOOGLE_SHEETS_TARGET.md](JSOL-X_GOOGLE_SHEETS_TARGET.md) | Compiling JSOL-X to Google Sheets + Apps Script, where the logic runs as JavaScript with near-zero translation | Preliminary draft |

## Relationship to JSOL

JSOL-X is not a separate language. It is JSOL with additional rules that make Excel compilation possible. Any valid JSOL-X program is valid JSOL. The reverse is not true: JSOL allows mutation, closures, recursion, and procedural `if` — all things Excel cannot represent.

This is the same pattern as JSOL-C: same syntax, stricter rules, the linter should reject what the target cannot handle.