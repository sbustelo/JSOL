==================================================
FILE: docs/README.docs.md
==================================================
# JSOL Documentation

## For new users

→ [01_GETTING_STARTED.md](01_GETTING_STARTED.md) — How to install, compile, and run your first '.jsol' file.

## Language reference

→ [02_LANGUAGE_SPEC_CURRENT.md](02_LANGUAGE_SPEC_CURRENT.md) — The complete, authoritative specification of JSOL v0.2.95.

* * *

## 10 dev/ — For developers working on JSOL itself

| File | What it covers |
| --- | --- |
| ARCHITECTURE.md | Why the grammar restrictions exist, and what they cost/gain at the engine level. |
| INTEGRATING.md | How to integrate the JSOL compiler within your own infrastructure, framework, or deployment pipeline (CI/CD). |
| JSOL_AI_INSTRUCTIONS.md | The system prompt used for AI-assisted JSOL development. |
| SELF_HOSTING.md | The compiler compiles itself. Explanation of the self-hosting architecture. |
| AI_ENGINEERING_METHODOLOGY.md | How AI is used to develop JSOL: multi-model triangulation, air-gap control, verification protocols. |

* * *

## 20 product/ — Product and business context

| File | What it covers |
| --- | --- |
| DESIGN_PHILOSOPHY.md | Why decisions are made: projecting the spec one release ahead. |
| ADOPTION_ECONOMICS.md | When JSOL pays off: the formula and decision table. |
| COMPARISON.md | JSOL vs Haxe, WebAssembly, JSON-driven math. |
| version_history.md | Changelog from v0.1 |

* * *

## 21 future/ — Plans and experiments (not shipped)

| File/Dir | What it covers |
| --- | --- |
| ROADMAP.md | Priority-ordered backlog: what's next (v0.3 and beyond). |
| 0.3 SPEC CANDIDATE 0.2.96 - 2026 08 23.md | v0.3 target: namespace revamp, semantic parity, type prefixes. |
| SPEC_CANDIDATES.md | Proposed new methods and pending decisions. |
| EXTENDING.md | Structural feasibility of new language targets: syntax, closures, memory models, AST-free pipeline rationale. |
| EXTENDING-TYPES.md | Type system expansion beyond current JSON natives. |
| EXTENDING-SEMANTIC-PARITY.md | Semantic divergences across target languages that threaten Deterministic Parity. The full catalog with proposed resolutions. |
| EXTENDING-SEMANTIC-PARITY-table.md | Compact one-line-per-divergence reference for AI-assisted gap analysis. Companion to the full parity doc. |
| JSOL-X_vision/ | Excel compilation vision (pre-spec). Nothing implemented. |

* * *

## 30 tools/ — Tools built around JSOL

| File | What it covers |
| --- | --- |
| INTERPRETER_BACKLOG.md | Product notes for the interpreter/editor. |
| BOOTSTRAP.md | SSOT Maintenance and rules compilation (tools/bootstrap.js). |
| QA_PIPELINE.md | Architecture of the QA pipeline and test runners. |
| CODE_POINT_VERIFICATION.md | Instructions for running the Fixed-Point Parity test (00-compile-verify-jsol.sh). |

* * *

**Tip:** If you're new, read 01_GETTING_STARTED.md. If you're contributing, start with 10 dev/ARCHITECTURE.md. If you're planning, start with 21 future/ROADMAP.md. Everything else is detail.

---

*JSOL v0.2.96 — 2026-08-25, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*