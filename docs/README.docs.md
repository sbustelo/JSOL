# JSOL Documentation

## For new users

→ [`01_GETTING_STARTED.md`](01_getting_started.md/) — How to install, compile, and run your first `.jsol` file.

## Language reference

→ [`02_LANGUAGE_SPEC_CURRENT.md`](02_language_spec_current.md/) — The complete, authoritative specification of JSOL v0.2.91.

* * *

## 10 dev/ — For developers working on JSOL itself

| File | What it covers |
| --- | --- |
| `ARCHITECTURE.md` | Why the grammar restrictions exist, and what they cost/gain at the engine level. |
| `EXTENDING.md` | Adding new language targets (Python, C#, Go, C, etc.). Feasibility analysis. |
| `SELF_HOSTING.md` | The compiler compiles itself. Fixed-point verification runbook. |
| `AI_ENGINEERING_METHODOLOGY.md` | How we use AI (Perkele Protocol, multi-model validation, air-gap). |
| `JSOL_AI_INSTRUCTIONS.md` | The system prompt used for AI-assisted JSOL development. |

* * *

## 20 product/ — Product and business context

| File | What it covers |
| --- | --- |
| `DESIGN_PHILOSOPHY.md` | Why decisions are made: projecting the spec one release ahead. |
| `ADOPTION_ECONOMICS.md` | When JSOL pays off: the formula and decision table. |
| `COMPARISON.md` | JSOL vs Haxe, WebAssembly, JSON-driven math. |
| `version_history.md` | Changelog from v0.1 to v0.2.91. |

* * *

## 21 future/ — Plans and experiments (not shipped)

| File/Dir | What it covers |
| --- | --- |
| `ROADMAP.md` | Priority-ordered backlog: what's next (v0.3 and beyond). |
| `LANGUAGE_SPEC_NEXT.md` | v0.3 target: namespace revamp, type prefixes, `JSOL.range()`, regex. |
| `SPEC_CANDIDATES.md` | Proposed new methods (`Arr.copy`, `Str.split`) — pending decisions. |
| `JSOL-X_vision/` | Excel compilation vision (pre-spec). Nothing implemented. |

* * *

## 30 tools/ — Tools built around JSOL

| File | What it covers |
| --- | --- |
| `INTERPRETER_BACKLOG.md` | Product notes for the PHP interpreter/table UI (more Excel than VS Code). |

* * *

**Tip:** If you're new, read `01_GETTING_STARTED.md`. If you're contributing, start with `10 dev/ARCHITECTURE.md`. If you're planning, start with `21 future/ROADMAP.md`. Everything else is detail.

---

*JSOL v0.2.91 — 2026-08-13, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*