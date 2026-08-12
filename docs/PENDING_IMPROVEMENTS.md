# Pending Improvements & Technical Debt

This document tracks known technical debt and pending refactors identified in JSOL v0.2.90.

## 1. Formalization of 'Regex.*' Domain Namespace

### Current Physical State in v0.2.90:
1. In 'regex.jsol', the Thompson VM functions are declared as top-level functions ('$parsePattern', '$compileRegex', '$runRegex', '$regexMatch', '$regexReplace').
2. The compiler uses '$regexReplace' directly rather than dispatching calls through a 'Regex.*' domain structure.

### Architectural Violations:
1. **Global Namespace Pollution:** Exposes internal parser helpers ('$parseAtom', '$parseConcat', etc.) in the global scope of transpiled output.
2. **Spec Asymmetry:** 'LANGUAGE_SPEC.md' defines 'Regex.match', 'Regex.replace', and 'Regex.test' under the 'Regex.*' namespace, but current runtime implementation relies on bare '$regexReplace' / '$regexMatch'.

### Target Refactor for v0.3.0:
- Wrap Thompson VM methods into a formal 'Regex.*' namespace dispatch in 'regex.jsol'.
- Update 'js-compiler.jsol' and 'php-compiler.jsol' to transpile 'Regex.replace(...)' and 'Regex.match(...)' consistently alongside 'Str.*' and 'Arr.*'.

---

*JSOL v0.2.90 — 2026-08-11, Santiago Bustelo • MIT License*",