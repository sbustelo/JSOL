# Design Philosophy: Ambition as a Specification Principle

This document isn't the spec. It's why the spec looks the way it does, and why decisions that seem premature for a 0.x project were made this early.

## The rule


Before any part of the specification gets treated as settled and considered for implementation, it has to survive being _projected_ at least one major release beyond what's actually being built right now. The question isn't "can we ship this feature"; it's "if we had to support this someday, would today's decision still hold, or would it need to be undone."
This isn't about promising features that don't exist. `docs/ROADMAP.md` already draws that line clearly: what's real is v0.2, self-hosted, JS and PHP, Level 1 primitives. Everything past that is explicitly marked as backlog, not shipped. This document is about something narrower and more important: why the *shape* of the specification already accounts for pressures that haven't arrived yet, even though most of what those pressures demand hasn't been built, and maybe there's not an actual case for doing so in the future.

## Why this matters more for a specification than for an application

An application that makes a bad call can be patched. A specification that offers other people to build against can't, not cleanly. The moment a third party writes a compiler, a helper, or a piece of business logic against a rule in `LANGUAGE_SPEC.md`, that rule stops being yours to casually revise: someone downstream is now depending on it behaving exactly as documented, intentionally or not. Fixing a specification mistake after adoption costs enormously more than fixing it before, and the earlier a language commits to a naming scheme, a type system, or a grammar rule, the more expensive it is to walk back once anyone else is relying on it. The only real defense is catching the mistake before anyone had the chance to depend on it, which means testing the design against more pressure than the present moment actually requires.

## How this is playing out, version by version

### v0.1: prove the mechanism works

The starting question was narrow: can a strict subset of JavaScript declare business logic once and transpile it to both JS and PHP, with no AST, no external toolchain. It could. That would have been a reasonable place to stop: a working tool solving IPAX's original problem, nothing more ambitious required.

### v0.2: the self-hosting question

Knowing that many language compilers are written in the language they compile raised an obvious question: could JSOL compile itself? Pursuing that, rather than treating it as a curiosity, produced v0.2 — and with it, an objective, falsifiable test that the language wasn't just "good enough to write scripts in," it was expressive enough to describe its own toolchain. Fixed-point convergence between generations, on both hosts, is the kind of claim that can be checked with a diff, not just argued for. See `SELF_HOSTING.md`.

### The portability ambition: what C++ bootstrapping via C already answered

Revisiting how C++ solved its own bootstrap problem in 1979, by transpiling to C rather than inventing a new toolchain, raised the next question: if JSOL contained zero hand-written escape hatches for either target, would adding a third language become dramatically cheaper. We don't know yet whether JSOL will ever need a third target; that's not the point. Treating "no target-specific escape hatches anywhere in the compiler" as a quality bar, rather than an optional nice-to-have, is what forced a real audit of every place the compiler depended on native JS or PHP behavior instead of a rule the language itself could guarantee. That audit produced the pure-JSOL regex engine design in `ROADMAP.md` Priority 4, and the Managed/JSOL-C memory-profile split. Neither exists yet. Both already shape what the current grammar will and won't allow.

### The educational stress test: what actually broke first

Asking "what audience would actually stress-test the claim that this language is simple and readable" pointed at teaching programming with JSOL as a replacement for textbook pseudocode — a use case with exactly zero real users today. That imagined audience found a real problem faster than any real user had: a single namespace absorbing every helper function (`JSOL.count`, `JSOL.hexToInt`, everything under one prefix) is convenient to write and genuinely bad to learn from, because it gives a beginner no way to see which operations belong to which domain. That's what forced the split into `Str.*`, `Arr.*`, `Math.*`, and the rest — nobody using JSOL today was asking for it. The projected audience was.

### The business ambition: Excel as the actual lingua franca

The most demanding question asked so far: if JSOL is meant to be the lingua franca of business logic, what already holds that position today? Actually, it's not a programming language, but Excel.

That single question is what's currently driving how to extend the single-character type-prefix system (`$c` for currency, `$p` for percentage, `$g` for sexagesimal angles) and the fixed-point arithmetic requirements behind it, long before any of it is implemented. It already cost several rounds of naming collisions worked out on a whiteboard instead of in production, preventing exactly what Hyrum's Law predicts: if an identifier ships and someone writes code against it, changing it later would cost far more than getting it right before anyone could depend on it.

## On the honesty of an unlikely goal

JSOL replacing Excel is extremely unlikely. Excel has forty years of adoption, a userbase in the hundreds of millions, and defaults so deeply embedded that undoing any one of them would break more than it fixes: the same inertia this document has been describing the whole way through, just on the other side of the table now, with JSOL as the newcomer instead of the incumbent.

But the value of aiming there was never because of an actual expectation of even getting there. It's what asking the question honestly forces you to define: what would actually be *better* than what a business person has today, and what would the world look like if that better thing existed. That's a real design question with a real answer, independent of whether JSOL personally ever ships it. And once that answer exists, it produces a test that's worth applying to every decision made today, however small: if everything else lined up tomorrow (e.g., the adoption, the tooling, the third-party compilers this document has been imagining) would today's specification still be sound… or would *it* be the reason the better outcome couldn't happen?

The goal isn't to guarantee the future arrives. It's to make sure that in the unlikely case it does, the spec should not be the thing standing in its way.

---

*This document was produced with systematic AI co-piloting as described in [`AI_ENGINEERING_METHODOLOGY.md`](AI_ENGINEERING_METHODOLOGY.md). AI was used for architectural stress-testing, cross-model validation, and drafting; all content has been reviewed for technical accuracy and adherence to project constraints.*