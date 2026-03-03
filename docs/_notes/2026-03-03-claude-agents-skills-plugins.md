---
title: Claude Code — Agents, Skills, Plugins
tags: AI, Claude, agents, skills, plugins, automation
date: 2026-03-03
---

## Overview

Claude Code extends beyond the base model through a layered extensibility system: **agents** (specialized subagents), **skills** (packaged expertise and workflows), and **plugins** (bundles of all of the above). Together they let you tailor Claude to your project and team.

---

## Skills

Skills are markdown files (`SKILL.md`) that teach Claude how to perform specific tasks. Claude can invoke them automatically when context suggests they're relevant, or you can invoke them manually via `/skill-name`.

| Aspect | Details |
|--------|---------|
| **Structure** | Directory with `SKILL.md`, optional `reference.md`, `examples.md`, `scripts/` |
| **Locations** | User: `~/.claude/skills/` — Project: `.claude/skills/` — Plugin: bundled in plugin |
| **Invocation** | `disable-model-invocation: true` → user-only (deploy, commit, send) |
| | `user-invocable: false` → Claude-only (background knowledge) |
| | Default → both can invoke |

**When to create skills:**
- Frequently repeated prompts or workflows
- Project-specific tasks with arguments
- Applying templates or scripts
- Workflows that should run in isolation (`context: fork`)

---

## Agents (Subagents)

Agents are specialized subagents Claude invokes for specific domains. They run in parallel, have their own system prompts, and can use tools.

| Use Case | Agent Type |
|----------|------------|
| Large codebase (>500 files) | **code-reviewer** — parallel code review |
| Auth/payments code | **security-reviewer** — security audits |
| API project | **api-documenter** — OpenAPI generation |
| Performance critical | **performance-analyzer** — bottleneck detection |
| Frontend heavy | **ui-reviewer** — accessibility review |
| Needs more tests | **test-writer** — test generation |

**Location:** `.claude/agents/<name>.md`

---

## Skills vs Subagents

| Aspect | Skill | Subagent |
|--------|------|----------|
| **What it is** | Instructions the current agent follows | Separate agent instance |
| **Context** | Same as main agent | Isolated / focused |
| **Execution** | Main agent applies the skill | Runs autonomously with its own tools |

**When to use skills:** Single task, linear workflow, context sharing is useful.

**When to use subagents:**
- **Focus** — Main agent accumulates too much context and drifts. Subagents stay on one job.
- **Fresh perspective** — Subagent reviews "cold" without main agent's assumptions; catches what the main agent misses.
- **Parallelism** — Run security + performance + code review at once.
- **Isolation** — Different tool permissions, smaller context, failure containment.

> Skills extend the current agent. Subagents delegate to a separate agent. Use subagents when you need independence, parallelism, or focus — not just different instructions.

---

## Plugins

Plugins are self-contained directories that bundle multiple extension types. One install gives you skills, agents, hooks, MCP servers, and optionally LSP servers.

### Plugin Structure

```text
plugin-name/
├── .claude-plugin/plugin.json   # required manifest
├── commands/                    # slash commands
├── agents/                      # subagent definitions
├── skills/                      # agent skills
├── hooks/                       # event handlers (hooks.json)
├── .mcp.json                    # MCP server config
└── scripts/
```

### Plugin Components

| Component | Purpose |
|-----------|---------|
| **Skills** | `/name` shortcuts, model-invoked capabilities |
| **Agents** | Specialized subagents for specific tasks |
| **Commands** | Custom slash commands |
| **Hooks** | Event handlers (PreToolUse, PostToolUse, etc.) |
| **MCP servers** | External tool integrations (DBs, APIs, browsers) |
| **LSP servers** | Language intelligence for code navigation |

### Hook Events (examples)

- `PreToolUse` / `PostToolUse` — before/after tool execution
- `PostToolUseFailure` — after tool execution fails
- `SessionStart` / `SessionEnd`
- `UserPromptSubmit`
- `SubagentStart` / `SubagentStop`

---

## Automation Types at a Glance

| Type | Best For |
|------|----------|
| **Hooks** | Automatic actions on tool events (format on save, lint, block edits) |
| **Subagents** | Specialized reviewers/analyzers that run in parallel |
| **Skills** | Packaged expertise, workflows, repeatable tasks |
| **Plugins** | Collections of skills (and agents, hooks, MCP) — install as a unit |
| **MCP Servers** | External tool integrations (databases, APIs, docs) |

---

## Discovery & Install

- **Community registry:** [claude-plugins.dev](https://www.claude-plugins.dev/) — CLI for discovering and installing plugins
- **Official marketplace:** Search in Claude Code's `/plugin` Discover tab
- **MCP servers:** `claude mcp add <server-name>` (e.g. `context7`, `playwright`, `github`)

---

## Plugin Distribution (Without Official Marketplace)

To distribute plugins without publishing to the official Anthropic marketplace:

**1. Custom marketplace** — Host a `marketplace.json` that catalogs your plugins. Users add it with:

```bash
/plugin marketplace add ./my-marketplace              # local path
/plugin marketplace add owner/repo                    # GitHub
/plugin marketplace add https://gitlab.com/company/plugins.git
/plugin marketplace add https://example.com/marketplace.json
```

Then install plugins from that marketplace via `/plugin install`.

**2. Git repo** — Put the plugin in a public or private repo. If the repo root has a `marketplace.json` that references the plugin, users add the repo as a marketplace and install from there.

**3. Local / direct share** — For internal use: share the plugin directory (zip, clone, copy). Users run `claude --plugin-dir ./path-to-plugin` or add a local marketplace pointing to that path.

**4. Community registry** — Publish to [claude-plugins.dev](https://www.claude-plugins.dev/) instead of the official marketplace.

---

## Key Insight

> Skills teach *what* to do. Agents specialize *who* does it. Plugins package both for reuse. Hooks and MCP servers handle *when* and *with what tools* — the glue that makes automation automatic.
