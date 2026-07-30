# `.nia` — Nia CLI Configuration

This folder holds the configuration and supporting data that the [Nia CLI](https://github.com/telerik/nia)
(`nia`) reads for this repository. Nia is an agentic SDLC command‑line tool that runs AI coding
agents against a project (answering questions, resolving issues, opening PRs, running workflows,
etc.). Everything in `.nia/` describes _this project_ to those agents.

Nia loads configuration hierarchically (highest priority first):

1. **Repository** — this `.nia/` folder
2. **Application** — multi‑repo/monorepo scenarios
3. **User** — `~/.config/nia/`
4. **System** — `/etc/nia/`

By default only the repository‑level configuration (this folder) is loaded, so the files here are
the primary way to control Nia's behavior for the healthcare app.

## Folder layout

| Path                   | Purpose                                                                                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`config/`](config/)   | Core Nia configuration: project metadata (`project.toml`), the development toolchain agents may use (`toolchain.toml`), and AI agent/model selection (`agents.toml`, with `agents.toml.example` template). |
| [`learn/`](learn/)     | Data for the `nia learn` guided onboarding tutorials — bundled questions and a mapping of lessons to the demo issues/tickets they use.                                                                     |
| [`license/`](license/) | Location for the Telerik / Kendo UI license file used by the app's UI components.                                                                                                                          |

Each subfolder has its own `README.md` describing the individual files and the options they support.

## Common commands

```bash
nia config init        # scaffold .nia/ and a default project.toml
nia config validate    # validate all .nia configuration files
nia config lock        # lock configuration before running workflows
nia learn list         # list the onboarding tutorials
```

## Extending

- **Add project facts** agents should know → edit [`config/project.toml`](config/project.toml).
- **Point agents at issue trackers / code platforms / scanners** → edit [`config/toolchain.toml`](config/toolchain.toml).
- **Choose the AI agent and models** → copy [`config/agents.toml.example`](config/agents.toml.example) to `config/agents.toml` and edit.
- **Adjust onboarding demo content** → edit files under [`learn/`](learn/).

Always run `nia config validate` after editing any file in this folder.
