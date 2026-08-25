# AI Engineering & Governance in JSOL

## Executive Summary & Transparency Declaration

JSOL is an ambitious systems engineering effort: a self-hosting, AST-free, zero-dependency domain-specific language (DSL) that transpiles a strict subset of JavaScript into multiple runtime targets (currently shipping JavaScript, PHP, TypeScript and Python, with exploratory backends for other C-like languages).

Building a multi-target, self-hosting compiler without third-party parsers, AST generators, or external toolchains requires architectural discipline. To systematically cover ground beyond what a solo developer or small team could manually execute, **JSOL transparently employs artificial intelligence (LLMs) as a systematic engineering co-pilot**.

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




---

*JSOL v0.2.96 — 2026-08-25, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../LICENSE)*