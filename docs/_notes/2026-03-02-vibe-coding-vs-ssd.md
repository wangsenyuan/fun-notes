---
title: Vibe Coding + Spec-Driven Development (SDD)
tags: AI, LLM, coding, productivity, methodology
date: 2026-03-02
---

## The Problem with Vibe Coding Alone

Vibe coding — directing an AI with loose, intent-driven prompts and iterating until it "feels right" — is fast but **lossy**. Every session, intent evaporates. The AI does something reasonable, you accept it, and three weeks later nobody knows *why* the code is shaped the way it is.

Spec-Driven Development (SDD) is fundamentally a solution to that lossiness. **The spec is what survives between sessions.**

---

## SDD Is Not the Opposite of Vibe Coding

The right framing is not "vibe coding vs. SDD" — it is **SDD integrated into vibe coding**.

In the traditional SDLC, there are already specs at every phase:

```text
Requirements → [Spec] → Arch Design → [Spec] → Coding → [Spec] → Testing → Release
```

The spec is not a phase — it is the **living artifact that flows through all phases**, getting more precise at each step. At each stage, the AI can consume the spec to do the vibe-coding execution.

| SDLC Phase   | Spec Role                         | AI / Vibe Coding Role             |
|--------------|-----------------------------------|-----------------------------------|
| Requirements | Natural language, user stories    | AI helps formalize, find gaps     |
| Arch Design  | Interface contracts, data models  | AI proposes implementations       |
| Coding       | Spec as prompt context + guardrail| AI executes; spec catches drift   |
| Testing      | Spec → acceptance criteria        | AI generates test cases from spec |
| Release/Docs | Spec IS the documentation         | AI generates changelogs, API docs |

> **Vibe coding without a spec is chaotic. Vibe coding *against* a spec is engineering.**

---

## Who Writes the Spec?

The most powerful workflow:

1. **Human writes intent** — the core requirement, in rough natural language
2. **AI drafts the spec** — formalizes it into structured scenarios and constraints
3. **Human reviews and corrects** — much faster than writing from scratch

The AI is good at formalizing vague intent into structured scenarios. Reviewing a draft spec is faster than writing one. This keeps the "vibe" feeling while still producing a durable artifact.

The sweet spot for spec granularity: **behavioral specs with scenarios** — describe what the system does under specific conditions, not how it does it. Enough to constrain the AI without over-specifying implementation.

---

## The Hard Problems

### 1. Users Don't Review the Spec

This is the honest reality. Most developers will rubber-stamp a plausible-looking spec — the same way they rubber-stamp PRs. The value isn't always in the upfront review. It is in having an artifact to **interrogate after something breaks**. The spec is what you compare against when production behavior diverges from intent.

### 2. Spec History and Evaluation

- **History**: git is natural. The spec evolves in commits alongside code. Tools like [OpenSpec](https://github.com/Fission-AI/OpenSpec) use a delta model — each change has its own spec artifacts that archive into the main spec. Specs evolve *with* the system rather than decaying beside it.
- **Is this spec good?** A spec is good if it is *predictive* — does following it produce the intended behavior? One proxy: **scenario coverage** — does the spec have concrete examples for the important cases, or is it all vague prose?
- **How good/bad?** This needs a feedback loop. After each change ships, compare actual behavior against spec scenarios. The gap is the quality signal. Over time you learn which spec styles produce reliable implementations and which don't.

### 3. Large and Complex Projects

The spec has to be **hierarchical**. One flat spec cannot describe a large system. The natural decomposition follows the architecture:

```text
system spec       (invariants, principles)
  └── domain spec (bounded contexts)
        └── feature spec (behaviors, scenarios)
              └── change delta (this PR / session)
```

The AI loads only the relevant slice. This mirrors how senior engineers think about large systems. The challenge is maintaining consistency *across* levels.

### 4. Legacy Projects

You cannot write specs for what you do not understand, and legacy code is often not understood by anyone.

**Reverse-spec first:**
> Ask the AI to read the code and *generate* a spec describing what it currently does. You review and correct it. Now you have a baseline. Every future change goes through the delta model.

The reverse-spec will not be complete or correct — but it does not need to be. It just needs to be *good enough to catch drift*. Over time, as changes accumulate, the spec becomes more authoritative than the code itself.

---

## The Real Opportunity

The spec is only valuable if it is kept honest. That requires either discipline (hard) or tooling that makes dishonesty expensive (better).

The real product opportunity is not the spec format itself — it is the **enforcement layer**: tooling that automatically compares implementation against spec, flags drift, and closes the feedback loop without requiring the developer to remember to do it.

---

## Key Insight

> Vibe coding outsources *execution* to the AI. SDD ensures the AI is executing against *human intent*, not its own assumptions. The spec is how human judgment survives across sessions, team members, and time.

