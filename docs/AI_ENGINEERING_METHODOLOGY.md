# AI Engineering & Governance in JSOL

## Executive Summary & Transparency Declaration

JSOL is an ambitious systems engineering effort: a self-hosting, AST-free, zero-dependency domain-specific language (DSL) that transpiles a strict subset of JavaScript into multiple runtime targets (currently shipping JavaScript and PHP, with exploratory backends for other C-like languages).

Building a multi-target, self-hosting compiler without third-party parsers, AST generators, or external toolchains requires extreme architectural discipline. To systematically cover ground beyond what a solo developer or small team could manually execute, **JSOL transparently employs artificial intelligence (LLMs) as a systematic engineering co-pilot**.

However, we reject "AI slop": the uncritical acceptance of LLM-generated code, superficial summaries, or unverified implementations. Instead, JSOL operates under a **strict, multi-agent AI governance framework**. AI is used for architectural pressure-testing, multi-model cross-validation, deep-pipeline auditing, and rapid prototyping under human air-gap control.

This document formally outlines our methodology, the anti-hallucination protocols we have developed, the current status of our compiler case studies, and guidelines for contributors.

## 1\. The Human-in-the-Loop Governance Framework

To ensure absolute technical integrity, JSOL enforces four non-negotiable operational rules regarding AI usage:

### Rule 0: Strict Air-Gap Control (No Direct Filesystem Access)

AI models **never** have direct write access to the project repository, file system, or version control. All code generated or suggested by an AI exists strictly in isolated memory buffers or scratchpads. The human developer acts as an active compiler operator, reviewing, intercepting, testing, and applying every single step.

The developer doesn't act as a "human in the loop" or "[reverse Centaur](https://pluralistic.net/2025/12/05/pop-that-bubble/#u-washington)", but as an Architect and supervisor. The developer doesn't have the obligation of catching IA's mistakes as soon as they are introduced, but rather the *opportunity* to even witness them, stop the AI and backtrace the model flaw that caused it. Which when AI has file system access, tends to happen too late, if ever.

### Rule 1: Multi-Model Triangulation (Cross-Model Validation)

No single AI architecture is trusted with architectural decisions or code verification. JSOL uses **three distinct LLM families** (e.g., Anthropic Claude, Google Gemini, and OpenAI/DeepSeek architectures) in an adversarial setup.

-   **Model A** drafts an initial diagnosis or prototype.
-   **Models B and C** act as a peer-reviewer tasked with architectural criticism, finding edge cases, scope leaks or unstated runtime assumptions, and/or evaluating the proposal against the formal spec and constraints.

This cross-validation drastically reduces the hallucination space and catches single-model biases before any code reaches the human verification phase.

### Rule 2: Architecture-First Protocol (Diagnosis Before Code)

Before any code patch is written, the AI must execute a mandatory diagnostic phase:

1.  Provide a root-cause explanation of the runtime or compilation failure.
2.  Trace the exact pipeline order and state transformations.
3.  Engage in an explicit architectural discussion to confirm whether the issue stems from a specification flaw, a pipeline ordering bug, or a target-specific runtime mismatch.

### Rule 3: Falsifiable Verification & Fixed-Point Convergence

AI assertions of success ("This fixes the bug") are treated as unverified hypotheses. A fix is accepted **only** when it satisfies objective, deterministic criteria:

-   Passing the automated test suite.
-   Achieving **fixed-point convergence** in self-hosting mode (`diff generation_N.js generation_N+1.js` must return a zero diff).

## 2\. Mitigating RLHF Biases: The "Perkele Protocol" Framework

A major challenge in using modern LLMs for systems programming is **RLHF (Reinforcement Learning from Human Feedback) bias**. Commercial LLMs are trained to be polite, concise, and token-frugal. In compiler development, this manifests as **Silent Defeat**:

-   Models silently truncate long source files while claiming they delivered full output.
-   Models introduce "polite" comments or placeholders (`// ... rest of code ...`) that break build pipelines.
-   Models default to native language shortcuts (e.g., JS `.map()` or `.length`) rather than adhering to JSOL's strict AST-free constraints.

To counter these biases, project lead Santiago Bustelo developed and published the **Perkele Protocol** (documented [on GitHub](https://github.com/sbustelo/AI-DevTools/tree/main/AI-PerkeleProtocols) and [Medium](https://santiagobustelo.medium.com/gemini-just-confirmed-the-effectiveness-of-perkele-prompting-a-technical-confession-c28458df9a2c) as _Perkele Prompting_).

### Mechanics of the Perkele Protocol in JSOL

The protocol establishes a strict, adversarial prompt architecture designed to override token-saving RLHF biases and force deep token-processing compliance:

1.  **Pattern Break & Priority Override:** Using high-intensity, unambiguous instruction hierarchies ("Core Laws") to act as an emergency stop signal. This overrides the model's default bias toward conciseness, elevating strict adherence to file integrity over token-saving heuristics.
2.  **Strict Execution Pipeline:** Prompts enforce a deterministic execution sequence:
    
    VALIDATE (Check inputs)⟶PARSE (Architecture)⟶COMPILE⟶DIFF CHECK⟶ATOMIC OUTPUT
    
3.  **Atomic Delivery Law:** Outputs must be 100% complete and drop-in ready, or the generation is automatically flagged as corrupt and aborted.
4.  **Public Critique of AI Hype:** The protocol serves both a practical engineering purpose within JSOL and a broader critique of the commercial AI landscape, demonstrating that LLMs require rigorous, non-standard prompting constraints to perform reliable systems-level tasks.

## 3\. Real-World Compiler Case Studies (Honest Pipeline Status)

In keeping with academic honesty, the following case studies detail real architectural issues encountered during JSOL v0.2 development, explicitly distinguishing between **verified fixes** and **work-in-progress diagnoses**.

### Case Study A: The Linter / Lexical Masking Paradox

-   **Status:** 🟢 **Resolved & Verified (Iterative Chain)**
-   **The Problem:** The JSOL linter enforces strict rules forbidding direct `.length` property access (requiring `JSOL.count()` or `JSOL.len()`). When compiling `js-compiler.jsol` during self-hosting, the linter flagged `.length` contained inside regex string literals (e.g., `.replace(regex, "$1.length")`) as illegal executable code, blocking self-hosting.
-   **The AI Audit:** AI cross-auditing revealed that `engine.jsol` was running the linter on _raw_ source code before `$maskSourceCode` replaced strings and comments with tokens (`__JSOL_TOKEN_N__`).
-   **The Resolution:** Re-architected `linter.jsol` into a two-pass pipeline:
    
    1.  _Structural Pass:_ Audits raw code for file-level rules (e.g., mandatory `// @JSOL` pragma on Line 1).
    2.  _Pattern Pass:_ Audits masked code _after_ string literals and comments are tokenized.
-   **The Value of Iteration:** This fix was not a single-shot victory; fixed-point testing uncovered a subsequent chain of subtle bugs (double-escaping in masking regexes, loop-bound drift in prefix handling, and `mb_strlen` parameter mismatches). The multi-model verification loop caught each regression in sequence.

### Case Study B: Balanced Parenthesis Extraction in Parameter Parsing

-   **Status:** 🟡 **Diagnosed & Prototyped / Integration In Progress**
-   **The Problem:** Regex transformations capturing function arguments via non-nesting patterns like `[^)]+` break when arguments contain nested function calls. For example:
    
    JavaScript
    
    ```
    Str.sub($result, $startIdx, Str.len($result) - $startIdx)
    ```
    
    The `[^)]+` pattern prematurely stops at the closing parenthesis of `Str.len(...)`, causing `php-compiler.jsol` to emit malformed PHP code (`mb_strlen($result, "UTF-8", "UTF-8")` with an extra illegal parameter under `strict_types=1`).
    
-   **The AI Audit:** Confirmed that regex quantifiers cannot handle recursive nesting without an AST or structural scanner.
-   **Proposed Resolution:** Adapt the character-by-character balanced counter scanner already built into `$processBlock` (used for `{}`) to handle `()` expression boundaries.
-   **Current Status:** The bug has been reproduced and verified in isolated Node.js test scripts. Porting the balanced parenthesis scanner into the self-hosted `.jsol` compiler modules and verifying zero-diff convergence is currently **in progress**.

### Case Study C: Thompson/Pike VM Regex Engine vs. Closure Elimination

-   **Status:** 🟡 **Algorithm Validated in Prototype / Porting to Self-Hosted `.jsol` In Progress**
-   **The Problem:** An early prototype for JSOL's custom regex engine relied on nested JavaScript closures for continuation-passing backtracking. This approach is fragile for self-hosting and unviable for low-level backends like `JSOL-C` (where C lacks native closures and requires complex lambda lifting). Furthermore, the current `regex.jsol` in the repository contains nested closures lacking explicit `JSOL.use()` dependency declarations, causing execution failures when transpiled to PHP.
-   **The AI Audit:** Identified that continuation-passing closures violate the goal of an AST-free, multi-target runtime.
-   **Proposed Resolution:** Re-architect the regex engine into an explicit, flat Thompson/Pike Virtual Machine. The engine compiles patterns into a linear instruction set (`CHAR`, `ANY`, `CLASS`, `SPLIT`, `JMP`, `SAVE`, `MATCH`) executed via an explicit array-based backtracking stack with zero runtime closures.
-   **Current Status:** The flat VM algorithm has been fully validated in an isolated JavaScript runner (passing 20/20 test cases, including complex character classes and multi-group captures). Eliminating the closure-based `regex.jsol` and integrating the flat VM into the self-hosted JSOL pipeline is currently **in progress**.

## 4\. Guidelines for Contributors & AI-Assisted Research

We welcome contributors who wish to extend JSOL or explore new target compilers (e.g., Python, Go, C#) using AI tools. To maintain project standards, all AI-assisted contributions must follow these guidelines:

1.  **Declare AI Usage:** State clearly which models were used and what prompts or protocols were applied.
2.  **Provide Full Context to the LLM:** Include JSOL's hard constraints in your prompts (AST-free, zero external dependencies, no native array methods, compulsory `JSOL.use()` for closures in target backends).
3.  **Execute Diagnosis Before Code Generation:** Do not accept immediate code patches from an LLM. Demand a step-by-step diagnostic breakdown first.
4.  **Enforce Air-Gap Review:** Manually inspect every line of AI-generated code. Ensure it does not introduce native language shortcuts that break cross-target compatibility.
5.  **Verify Fixed-Point Convergence:** For changes affecting the compiler core, run the self-hosting validation script (`SELF_HOSTING.md`) and verify that JS and PHP backends produce identical, deterministic output.

_JSOL v0.2 — Santiago Bustelo • MIT License_