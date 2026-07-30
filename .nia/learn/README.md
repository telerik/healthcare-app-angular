# `.nia/learn` — Onboarding tutorial data

This folder holds data for the `nia learn` command — a guided, hands‑on onboarding tutorial
system that walks new users through Nia's core workflows against this repository
(`healthcare-app-angular` is the reference demo repo).

```bash
nia learn init          # configure your coding agent (run this first)
nia learn list          # show available tutorials
nia learn run <name>    # run a specific tutorial
nia learn next          # run the next incomplete tutorial
```

`nia learn init` must be run before the other subcommands. It explains the Nia config system,
prompts you to pick a coding agent (`github_copilot`, `claude_code`, or `opencode`), runs
`nia config init --agent <agent> --models stable` to generate [`../config/agents.toml`](../config/agents.toml),
and extracts the Nia docs. If `agents.toml` already exists, the other `learn` commands skip this
step. Progress is tracked in `.nia/config/learn.toml`.

The tutorials themselves (order, category, workflow, estimated time) are defined inside the Nia
binary. The files in this folder supply the _repository‑specific data_ those tutorials operate on.

---

## `lessons.toml` — Lesson → issue/ticket mapping

Records which real GitHub issue or ticket in this repository each learn lesson uses. It lets the
demo be refreshed (new issue/ticket numbers) without rebuilding Nia.

### Current configuration

```toml
# Tracks the Latest Project Nia Learn Demo Issues

[lessons.rfa-investigation]
ticket_id = 33

[lessons.issue-validation]
issue_number = 32

[lessons.issue-refactoring]
issue_number = 31

[lessons.security-review]
issue_number = 30
```

### Structure

| Element                 | Meaning                                                                                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[lessons.<lesson-id>]` | A table per lesson. The `<lesson-id>` matches a tutorial id in Nia (e.g. `rfa-investigation`, `issue-validation`, `issue-refactoring`, `security-review`). |
| `ticket_id`             | Number of the GitHub issue used as a _ticket_ (support/RFA‑style investigation lessons).                                                                   |
| `issue_number`          | Number of the GitHub issue used as a development _issue_ (issue‑to‑PR lessons).                                                                            |

These numbers must point at issues/tickets that actually exist in
`telerik/healthcare-app-angular`, since the tutorials fetch them at runtime.

### How it can be extended

- **Refresh the demo** — update the numbers to newly created issues/tickets.
- **Add a lesson mapping** — add a new `[lessons.<id>]` table whose `<id>` matches a tutorial that
  expects a GitHub issue or ticket:

  ```toml
  [lessons.<lesson-id>]
  issue_number = 16
  ```

Use `ticket_id` for investigation/ticket lessons and `issue_number` for development lessons.

---

## `questions/` (bundled)

Some "Quick Win" tutorials (`nia ask`) use fixed question prompts stored as Markdown files in a
`questions/` folder (e.g. `ask_1.md`, `ask_2.md`). In the Nia source these are compiled directly
into the binary, so they work offline. If present in a repo, each file is simply the natural‑language
question the tutorial asks about the codebase — edit the Markdown to change what the tutorial asks.
