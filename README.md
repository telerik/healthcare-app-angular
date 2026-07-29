<div align="center">
  <a href="https://www.telerik.com/kendo-angular-ui/"><img src="https://d585tldpucybw.cloudfront.net/sfimages/default-source/productsimages/kendo-ui-for-angular/kendoka_with_logo-min.png?sfvrsn=568f4b7c_1" height="60" alt="Kendo UI for Angular" /></a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://angular.io/"><img src="https://www.vectorlogo.zone/logos/angular/angular-icon.svg" height="60" alt="Angular" /></a>
</div>

<h1 align="center">Healthcare Application — Kendo UI for Angular</h1>

<p align="center">
  A full-featured healthcare dashboard built with <a href="https://www.telerik.com/kendo-angular-ui/components">Kendo UI for Angular</a>, designed to demonstrate how clinical workflows can be modeled in a modern Angular application.
  <br />
  <a href="https://telerik.github.io/kendo-angular/healthcare-app"><strong>View Live Demo »</strong></a>
</p>

<p align="center">
  The app is organized into four main views:
</p>

<ul>
  <li><strong>Home</strong> — Personalized dashboard for a physician, featuring quick-action cards (add clinical notes, request lab tests), upcoming appointments, and an at-a-glance patient summary.</li>
  <li><strong>Patients</strong> — A searchable, sortable, and filterable grid of patients with vitals, risk levels, and lab results. Includes an AI Assistance panel and Excel export.</li>
  <li><strong>Patient Profile</strong> — Detailed view of an individual patient showing basic information, recent vitals (heart rate, blood pressure, O2 saturation, temperature), and medical history.</li>
  <li><strong>Schedule</strong> — A multi-view scheduler (day, week, month, agenda) for managing appointments, paired with a daily task list that supports search and inline task creation.</li>
  <li><strong>Clinical Analytics</strong> — Charts tracking patient vitals over time (systolic/diastolic BP, heart rate, SpO2, temperature) and a risk assessment overview with export support.</li>
</ul>

---

## Components Used

| Component  | Docs                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| Breadcrumb | [Breadcrumb](https://www.telerik.com/kendo-angular-ui/components/navigation/breadcrumb/) |
| Buttons    | [Buttons](https://www.telerik.com/kendo-angular-ui/components/buttons/button/)           |
| Dialog     | [Dialog](https://www.telerik.com/kendo-angular-ui/components/dialog/)                    |
| DropDowns  | [DropDowns](https://www.telerik.com/kendo-angular-ui/components/dropdowns/)              |
| Editor     | [Editor](https://www.telerik.com/kendo-angular-ui/components/editor/)                    |
| Gauges     | [Gauges](https://www.telerik.com/kendo-angular-ui/components/gauges/)                    |
| Grid       | [Grid Component](https://www.telerik.com/kendo-angular-ui/components/grid/)              |
| Icons      | [Icons](https://www.telerik.com/kendo-angular-ui/components/icons/icon/)                 |
| Indicators | [Indicators](https://www.telerik.com/kendo-angular-ui/components/indicators/)            |
| Inputs     | [Inputs](https://www.telerik.com/kendo-angular-ui/components/inputs/)                    |
| Layout     | [Layout](https://www.telerik.com/kendo-angular-ui/components/layout/)                    |
| Scheduler  | [Scheduler](https://www.telerik.com/kendo-angular-ui/components/scheduler/)              |
| Toolbar    | [Toolbar](https://www.telerik.com/kendo-angular-ui/components/toolbar/)                  |

---

## Getting Started

> The sample project runs with the [currently supported Angular version](https://www.telerik.com/kendo-angular-ui/components/installation/requirements/#toc-angular).

```bash
# 1. Clone the repository
git clone https://github.com/telerik/kendo-angular.git

# 2. Navigate to the project folder
cd examples-standalone/healthcare-app

# 3. Install dependencies
npm install
```

## Development Server

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The app reloads automatically when source files change.

## Build

```bash
ng build
```

Build artifacts are stored in the `dist/` directory.

---

## Dev Container — Get Started Fast with the Nia CLI

This repository ships a [Dev Container](.devcontainer) that provisions a ready-to-use
environment for both Angular development and AI-assisted workflows. It installs Node.js,
the GitHub CLI, three AI coding agents, and the **[Nia CLI](https://github.com/telerik/project-nia)**,
then installs the project's dependencies — so you can start coding (and running Nia) within minutes.

### What's included

| Component                          | Details                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js 24 + npm**               | Runs the Angular app and the npm-based agents                                                                                               |
| **GitHub CLI (`gh`)**              | Used by Nia workflows and for authentication                                                                                                |
| **GitHub Copilot CLI** (`copilot`) | AI coding agent (installed via npm)                                                                                                         |
| **OpenCode** (`opencode`)          | AI coding agent (installed via npm)                                                                                                         |
| **Claude Code** (`claude`)         | AI coding agent (installed via npm)                                                                                                         |
| **Nia CLI** (`nia`)                | Installed from the public `telerik/project-nia` repo — latest GitHub release, falling back to the latest pre-release; OS/arch auto-detected |
| **Angular dependencies**           | `npm install` runs automatically on create                                                                                                  |
| **Port 4200**                      | Forwarded for `ng serve`                                                                                                                    |

### Prerequisites

- [Docker](https://www.docker.com/) running locally
- One of:
  - [VS Code](https://code.visualstudio.com/) + the **Dev Containers** extension (`ms-vscode-remote.remote-containers`), or
  - the [Dev Containers CLI](https://github.com/devcontainers/cli) (`npm install -g @devcontainers/cli`)

### Open the container

**VS Code:** open the folder, then run **Dev Containers: Reopen in Container** from the Command Palette (`Cmd/Ctrl+Shift+P`).

**CLI:**

```bash
devcontainer up --workspace-folder .
devcontainer exec --workspace-folder . bash
```

On first create, the container runs [`.devcontainer/setup.sh`](.devcontainer/setup.sh),
which installs the agents, installs the Nia CLI, runs `npm install`, and prints a version
summary plus the manual next steps below.

### Finalize your setup (manual, one-time)

Authentication is intentionally left to you (credentials are user/org-specific):

```bash
# 1. Authenticate the GitHub CLI (used by Nia workflows)
gh auth login

# 2. Authenticate the AI coding agents you plan to use
copilot                 # GitHub Copilot CLI — sign in when prompted
claude                  # Claude Code — set ANTHROPIC_API_KEY or sign in
opencode auth login

# 3. Provide Nia / agent credentials (replace with your onboarding values)
# export NIA_API_KEY="<your-nia-api-key>"
# export ANTHROPIC_API_KEY="<your-anthropic-api-key>"
```

### Start using the Nia CLI

```bash
nia --version           # confirm the CLI is installed
nia --help              # explore available commands
nia learn               # guided, hands-on onboarding tutorials
```

Then run the app as usual:

```bash
npm start               # serves on http://localhost:4200
```

### Using a private/internal npm registry

If your environment requires a custom npm registry or auth token, place an `.npmrc` at
`.devcontainer/.npmrc`. It is **gitignored** and copied into the container's home directory
early in setup, so both the agent installs and `npm install` use it. If the file is absent,
the default npm configuration is used.

### Notes

- Agents are installed at their **latest** versions on each fresh create.
- The Nia repo currently publishes **pre-releases** only, so the CLI resolves to the latest
  pre-release automatically; once a stable release exists, it will be preferred.
- Re-run setup any time with: `bash .devcontainer/setup.sh`.
