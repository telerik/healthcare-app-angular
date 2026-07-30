# `.nia/config` — Core Nia configuration

These TOML files describe the project to Nia's AI agents. Nia reads them when it loads
configuration and injects the values into agent prompts. Every file starts with
`schema_version = "1.0.0"`.

Validate any change with:

```bash
nia config validate
```

Files in this folder:

| File             | Required | Purpose                                                          |
| ---------------- | -------- | ---------------------------------------------------------------- |
| `project.toml`   | Yes      | Project metadata surfaced to agents.                             |
| `toolchain.toml` | No       | Issue trackers, code platforms, scanners agents may use.         |
| `agents.toml`    | No       | Which AI agent and models Nia drives. See `agents.toml.example`. |

`agents.toml.example` is a documented template — copy it to `agents.toml` and edit, or run
`nia config init --agent <agent> --models <profile>` to generate one.

---

## `project.toml` — Project metadata

Tells agents _what_ this project is: its language, framework, test runner, and package manager.
These values are surfaced to agents (and available as `{{placeholder}}` template variables in
prompts), so keeping them accurate directly improves the quality of Nia's output.

### Current configuration

```toml
schema_version = "1.0.0"

[project]
name = "healthcare-app-angular"
description = "Healthcare dashboard application with patient management, scheduling, and analytics"
language = "TypeScript"
framework = "Angular 22 with Kendo UI for Angular"
testing_framework = "Vitest"
package_manager = "npm"
```

### Required fields (`[project]` table)

| Field               | Purpose                                                 | Example                                  |
| ------------------- | ------------------------------------------------------- | ---------------------------------------- |
| `name`              | Identifies the project. Max 100 chars.                  | `"healthcare-app-angular"`               |
| `description`       | One‑line summary used for agent context. Max 250 chars. | `"Healthcare dashboard application…"`    |
| `language`          | Primary programming language.                           | `"TypeScript"`                           |
| `framework`         | Framework(s) in use, or `"None"`.                       | `"Angular 22 with Kendo UI for Angular"` |
| `testing_framework` | Test runner/command, or `"None"`.                       | `"Vitest"`                               |
| `package_manager`   | Package manager, or `"None"`.                           | `"npm"`                                  |

### How it can be extended

**Custom fields** — add any extra key/value under `[project]` and it becomes a template variable.
Names may use letters, numbers, `_`, and `-` (not starting with a number), must not reuse a core
field name, and values must be non‑empty, ≤ 250 chars, with no control characters. Never store
secrets here.

```toml
[project]
# …required fields…
documentation_framework = "Compodoc"
author = "Healthcare Team"
```

**Shared context** — attach files/directories so agents always see them:

```toml
[[project.context]]
type = "file"
path = "docs/architecture.md"
description = "System architecture overview"
```

**Commit / UI behavior** — optional tables:

```toml
[commit]
behavior = "tagged"     # controls how Nia generates commit messages

[ui]
show_command_hints = false
```

**Monorepo** — describe multiple services in one repo:

```toml
[monorepo]
enabled = true

[[monorepo.services]]
name = "api"
path = "services/api"
description = "REST API service"
language = "TypeScript"
framework = "NestJS"
testing_framework = "Jest"
package_manager = "npm"
```

Other optional fields include `repository_id` (override auto‑detected repo name for session
scoping) and `allow_app` (opt this repo into a multi‑repo application by UUID).

---

## `agents.toml` — AI agent & model selection

Selects which AI coding agent Nia drives and which model each workflow uses. This file is
**optional** — without it Nia falls back to defaults — and supports hierarchical loading
(repository → application → user → system). A documented template ships as
[`agents.toml.example`](agents.toml.example).

### Getting started

```bash
# Option A: copy the template and edit
cp .nia/config/agents.toml.example .nia/config/agents.toml

# Option B: let Nia generate one from a profile
nia config init --agent github_copilot --models stable
```

Then validate: `nia config validate`.

### Structure

```toml
schema_version = "1.0.0"

[agent]
default = "github_copilot"          # must match an [agent.<name>] table below

[agent.github_copilot]
model = "claude-sonnet-4.5"         # default model for all work

[agent.github_copilot.targets]      # optional: per-target overrides
issue = "claude-haiku-4.5"

[agent.github_copilot.operations]   # optional: per-operation overrides
"issue.plan" = "claude-opus-4.5"
```

### Key fields

| Field                                                        | Description                                                                                  |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `agent.default`                                              | Agent ID Nia uses: `github_copilot`, `opencode`, or `claude_code`. Must match a table below. |
| `[agent.<id>].model`                                         | Default model applied to every target/operation.                                             |
| `[agent.<id>].targets]`                                      | Per‑target model overrides (`issue`, `code`, `pr`, `docs`, …).                               |
| `[agent.<id>].operations]`                                   | Per‑`target.operation` overrides (e.g. `"issue.plan"`).                                      |
| `custom_agent` / `custom_agents` / `custom_agent_operations` | Select a named agent persona defined inside the coding agent.                                |
| `prompt_format`                                              | `"xml"` or `"markdown"`. Defaults to `xml` for Claude/Anthropic models.                      |
| `command`                                                    | Override the agent executable path if it is not on `PATH`.                                   |

### Model resolution order (most specific wins)

1. `--model` command‑line override
2. `operations["target.operation"]`
3. `targets["target"]`
4. agent default `model`

### Model profiles

`nia config init --models <profile>` generates sensible defaults:

| Profile    | Focus                                     |
| ---------- | ----------------------------------------- |
| `lite`     | Cheapest/fastest models.                  |
| `balanced` | Extra planning/review at reasonable cost. |
| `stable`   | Predictable behavior (recommended).       |
| `heavy`    | Highest‑cost models throughout.           |

### How it can be extended

- **Switch agents** — set `agent.default` and add the matching `[agent.<id>]` table (e.g.
  `opencode` uses `provider/model` names; `claude_code` uses hyphenated versions like `4-5`).
- **Tune per workflow** — add `targets` and/or `operations` overrides.
- **Attach personas** — use `custom_agents` / `custom_agent_operations`.
- **Extended form** — any target/operation value can be a table combining `model`, `commits`
  (`"on"`/`"off"`), `custom_agent`, and `prompt_format`:

  ```toml
  [agent.github_copilot.operations]
  "code.review" = { model = "claude-opus-4.5", commits = "off", custom_agent = "quality-auditor" }
  ```

See [`agents.toml.example`](agents.toml.example) for a fully commented starting point.

---

## `toolchain.toml` — Development tools

Describes the external tools agents may use — issue trackers, code platforms, ticket trackers, and
security scanners — and _how_ they are accessed. This does **not** install CLIs or start servers;
it only provides access instructions and context to the agents.

### Category rules

- `code_platform` — required (exactly one).
- At least one of `issue_tracker` / `ticket_tracker` — required.
- `issue_tracker`, `ticket_tracker`, `security_scanner` — at most one each; `security_scanner`
  is optional.

### Current configuration

This project defines three built‑in tools accessed through the GitHub CLI (`gh`), all pointed at
`telerik/healthcare-app-angular`:

- `issue_tracker` → `github_issues` (task/bug tracking)
- `code_platform` → `github` (PRs, reviews, merges)
- `ticket_tracker` → `github_issues` (RFA / support‑style tickets)

### Fields per tool definition

| Field         | Type              | Description                                                                                                                                 |
| ------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | String            | Tool identifier (e.g. `github`, `github_issues`, `jira`).                                                                                   |
| `type`        | String            | `"built-in"` (from Nia's catalog) or `"custom"`.                                                                                            |
| `method`      | String            | Access method: `"skill"` (default, recommended), `"cli"`, `"mcp"`, `"api"`, or `"local"`.                                                   |
| `description` | String            | Natural‑language usage notes. Optional for built‑in tools, **required** for custom tools. Max 2000 chars; may use `{{template}}` variables. |
| `repository`  | String (optional) | Git URL when issues/code live in a different repo.                                                                                          |
| `skill_name`  | String (optional) | Skill directory name when `method = "skill"`.                                                                                               |

### Built‑in tool names

- **Issue / ticket trackers:** `github_issues`, `jira`, `azure_devops`, `shortcut`, `local`
- **Code platforms:** `github`, `github_enterprise`, `bitbucket`, `azure_devops`, `local`
- **Security scanners:** `polaris`, `github_sast`

### How it can be extended

**Switch access method** — change `method` (and update/uncomment the matching `description`). For
example, move from `cli` to the token‑efficient `skill` method:

```toml
[issue_tracker]
name = "github_issues"
type = "built-in"
method = "skill"
```

**Add a security scanner:**

```toml
[security_scanner]
name = "github_sast"
type = "built-in"
method = "cli"
```

**Use a different platform** — e.g. Jira for issues:

```toml
[issue_tracker]
name = "jira"
type = "built-in"
method = "mcp"
```

**Define a custom tool** — requires a `description` and cannot reuse a built‑in name:

```toml
[issue_tracker]
name = "acme_tracker"
type = "custom"
method = "api"
description = "Internal tracker. List: GET /issues. View: GET /issues/{{issue_id}}."
```

Template variables such as `{{issue_tracker_repo_slug}}`, `{{code_platform_repo_slug}}`,
`{{issue_id}}`, and `{{pr_id}}` are substituted at runtime from the configured repository.
