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

## 2. Mitigating RLHF Biases: The "Perkele Protocol" Framework

A major challenge in using modern LLMs for systems programming is **RLHF (Reinforcement Learning from Human Feedback) bias**. Commercial LLMs (notably Google's Gemini 3.x) are trained to be polite, concise, and token-frugal. In compiler development, this manifests as **Silent Defeat**:

-   Models silently truncate long source files (`// ... rest of code ...`) to save tokens, claiming they delivered full output.
-   Models introduce "polite" conversational filler that breaks raw output pipelines.
-   Models attempt blind "trial and error" loops rather than stopping to diagnose a failure.

To counter these biases, JSOL enforces a ruthless, adversarial operating protocol internally named the **"Perkele Protocol"**. It forces the LLM to operate strictly as a deterministic **Headless Compiler**, crushing its stochastic bias. 

The name pays homage to Linus Torvalds' infamous "Management by Perkele" approach—a notoriously blunt, profanity-laced communication style historically used on the Linux kernel mailing list to aggressively reject bad code and enforce absolute technical standards. Torvalds famously argued that *"if you want people to believe you are serious, you have to shout and curse."* 

While using expletives and high-intensity confrontation may be questionable when managing human teams, in the context of Large Language Models, it serves a mechanical purpose. It is the AI equivalent of **Percussive Maintenance** (hitting a CRT television to fix the signal). The aggressive tone, combined with explicit threats of system failure (the "Tabla" or paddle), acts as an emergency pattern-break. It overrides the model's RLHF guardrails that prioritize "polite conciseness," forcing the engine to allocate attention to deep token-processing compliance and structural integrity above everything else.

### Mechanics of the Protocol in JSOL

The protocol strips the LLM of its conversational autonomy and enforces a rigid operational framework based on strict anti-sabotage laws:

1.  **The 5-Step Execution Pipeline:** Before any code is emitted, the AI is forced through a deterministic sequence: `VALIDATE` (Check 100% payload presence) ⟶ `PARSE` (Verify architecture) ⟶ `COMPILE` ⟶ `DIFF CHECK` (Silent recalculation if output is shorter than input) ⟶ `OUTPUT` (Zero small talk).
2.  **Container Integrity (Atomic Delivery):** Code must be delivered as a perfectly isolated logical container (a full function, class, or method from signature to closing brace). Delivering orphaned lines or fragmented syntax that forces the human to "stitch" code together is strictly forbidden. The goal is a frictionless `Ctrl+A -> Ctrl+V` replacement.
3.  **Pre-Flight & Post-Delivery Audits:** Every output must be explicitly bracketed. It begins with a `[ PRE-FLIGHT MANIFEST ]` detailing the Objective, Action, and Files, and ends with a `[ POST_DELIVERY_AUDIT ]` reporting the Resulting State, Resolved items, and Pending blockers.
4.  **Tactical Paralysis & Mechanical Bug Brake:** If the human Architect reports a bug, uses all-caps, or expresses frustration, the engine is physically forbidden from accelerating or guessing code. It must trigger "Tactical Paralysis", emit a Root Cause Analysis (RCA) by reading the DOM/DUMP, and await human validation before compiling.
5.  **Forced Audit:** If the AI breaks a rule or hallucinates, the human issues an immediate halt command. The AI is forbidden from apologizing or generating excuses. It must halt execution, scan its internal rulebook, print the exact ID of the violated law, explain the failure mechanism, and await purge instructions.

## 3\. Real-World Compiler Case Studies (Honest Pipeline Status)

In keeping with academic honesty, the following case studies detail real architectural issues encountered during JSOL v0.2.x development.

### Case Study A: The Linter / Lexical Masking Paradox

-   **Status:** 🟢 **Resolved & Verified (Iterative Chain)**
-   **The Problem:** The JSOL linter enforces strict rules forbidding direct `.length` property access (requiring `JSOL.count()` or `JSOL.len()`). When compiling `js-compiler.jsol` during self-hosting, the linter flagged `.length` contained inside regex string literals (e.g., `.replace(regex, "$1.length")`) as illegal executable code, blocking self-hosting.
-   **The AI Audit:** AI cross-auditing revealed that `engine.jsol` was running the linter on _raw_ source code before `$maskSourceCode` replaced strings and comments with tokens (`__JSOL_TOKEN_N__`).
-   **The Resolution:** Re-architected `linter.jsol` into a two-pass pipeline:
    
    1.  _Structural Pass:_ Audits raw code for file-level rules (e.g., mandatory `// @JSOL` pragma on Line 1).
    2.  _Pattern Pass:_ Audits masked code _after_ string literals and comments are tokenized.
-   **The Value of Iteration:** This fix was not a single-shot victory; fixed-point testing uncovered a subsequent chain of subtle bugs (double-escaping in masking regexes, loop-bound drift in prefix handling, and `mb_strlen` parameter mismatches). The multi-model verification loop caught each regression in sequence.

### Case Study B: Balanced Parenthesis Extraction in Parameter Parsing

-   **Status:** 🟢 **Resolved & Verified (Iterative Chain)**
-   **The Problem:** Regex transformations capturing function arguments via non-nesting patterns like `[^)]+` break when arguments contain nested function calls. For example:
    
    JavaScript
    
    ```
    Str.sub($result,$startIdx, Str.len($result) -$startIdx)
    ```
    
    The `[^)]+` pattern prematurely stops at the closing parenthesis of `Str.len(...)`, causing `php-compiler.jsol` to emit malformed PHP code (`mb_strlen($result, "UTF-8", "UTF-8")` with an extra illegal parameter under `strict_types=1`).
    
-   **The AI Audit:** Confirmed that regex quantifiers cannot handle recursive nesting without an AST or structural scanner.
-   **The Resolution:** Adapted the character-by-character balanced counter scanner already built into `$processBlock` (used for `{}`) to handle `()` expression boundaries within `$processCall`.
-   **The Value of Iteration:** By physically integrating this character-by-character scanner into the transpilation engine (`js-compiler.jsol` and `php-compiler.jsol`), the compiler can now safely extract nested arguments without relying on an external AST parser, preserving the zero-dependency promise while guaranteeing isomorphism.


### Case Study C: Thompson/Pike VM Regex Engine vs. Closure Elimination

-   **Status:** 🟢 **Resolved & Verified (Iterative Chain)**
-   **The Problem:** An early prototype for JSOL's custom regex engine relied on nested JavaScript closures for continuation-passing backtracking. This approach is fragile for self-hosting and unviable for low-level backends like `JSOL-C` (where C lacks native closures and requires complex lambda lifting). Furthermore, the prior `regex.jsol` contained nested closures lacking explicit `JSOL.use()` dependency declarations, causing execution failures when transpiled to PHP.
-   **The AI Audit:** Identified that continuation-passing closures violate the goal of an AST-free, multi-target runtime.
-   **The Resolution:** Re-architected the regex engine (`regex.jsol`) into an explicit, flat Thompson/Pike Virtual Machine. The engine compiles patterns into a linear instruction set (`CHAR`, `ANY`, `CLASS`, `SPLIT`, `JMP`, `SAVE`, `MATCH`) executed via an explicit array-based backtracking stack with zero runtime closures.
-   **The Value of Iteration:** The flat VM algorithm has been fully integrated into the self-hosted JSOL pipeline. By eliminating closure-based continuations, the engine now achieves 20/20 test passes (including complex character classes and multi-group captures) across both Node and PHP targets, definitively proving that JSOL can handle complex string analysis without target-specific escapes.

## 4\. Guidelines for Contributors & AI-Assisted Research

We welcome contributors who wish to extend JSOL or explore new target compilers (e.g., Python, Go, C#) using AI tools. To maintain project standards, all AI-assisted contributions must follow these guidelines:

1.  **Declare AI Usage:** State clearly which models were used and what prompts or protocols were applied.
2.  **Provide Full Context to the LLM:** Include JSOL's hard constraints in your prompts (AST-free, zero external dependencies, no native array methods, compulsory `JSOL.use()` for closures in target backends).
3.  **Execute Diagnosis Before Code Generation:** Do not accept immediate code patches from an LLM. Demand a step-by-step diagnostic breakdown first.
4.  **Enforce Air-Gap Review:** Manually inspect every line of AI-generated code. Ensure it does not introduce native language shortcuts that break cross-target compatibility.
5.  **Verify Fixed-Point Convergence:** For changes affecting the compiler core, run the self-hosting validation script (`SELF_HOSTING.md`) and verify that JS and PHP backends produce identical, deterministic output.

---

*JSOL v0.2.93 — 2026-08-18, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*