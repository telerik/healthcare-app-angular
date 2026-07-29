#!/usr/bin/env bash

# ---------------------------------------------------------------------------
# Healthcare App (Angular) + Nia CLI Dev Container Setup
#
# This script prepares the dev container so a user can:
#   1. Run the Angular application (npm start / ng serve on port 4200)
#   2. Use AI coding agents: GitHub Copilot CLI, OpenCode, Claude Code
#   3. Use the Nia CLI installed from the public telerik/project-nia repo
#      (latest GitHub release, falling back to the latest pre-release)
#
# Design goals: idempotent, defensive, and self-reporting.
# ---------------------------------------------------------------------------

set -euo pipefail

# Resolve the workspace root (parent of this script's .devcontainer directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# --- Nia release source -----------------------------------------------------
NIA_REPO="telerik/project-nia"

# Track non-fatal installation failures for the final summary
INSTALL_FAILURES=""

mark_failure() {
    INSTALL_FAILURES="${INSTALL_FAILURES} $1"
}

verify_command() {
    local cmd="$1"
    local version_flag="${2:---version}"
    if command -v "$cmd" &> /dev/null && "$cmd" "$version_flag" &> /dev/null; then
        return 0
    fi
    return 1
}

# ---------------------------------------------------------------------------
# Step 1: Shell profile
# ---------------------------------------------------------------------------
if [ -f "${SCRIPT_DIR}/.bashrc" ]; then
    echo "→ Configuring custom .bashrc..."
    cp "${SCRIPT_DIR}/.bashrc" "${HOME}/.bashrc"
    echo "✓ .bashrc configured"
fi

# Place a custom npm configuration (e.g. private registry / auth token) into
# the container user's home so every npm command — the agent installs below and
# the project's `npm install` — respects it. The file is gitignored and copied
# from the host into .devcontainer/.npmrc.
if [ -f "${SCRIPT_DIR}/.npmrc" ]; then
    echo "→ Configuring custom .npmrc..."
    cp "${SCRIPT_DIR}/.npmrc" "${HOME}/.npmrc"
    chmod 600 "${HOME}/.npmrc"
    echo "✓ .npmrc configured"
else
    echo "ℹ No custom .devcontainer/.npmrc found — using default npm configuration"
fi

# ---------------------------------------------------------------------------
# Step 2: Base system dependencies
# ---------------------------------------------------------------------------
echo "→ Updating package manager cache..."
if sudo apt-get update -y; then
    echo "✓ Package cache updated"
else
    echo "✗ Error: Failed to update package cache"
    exit 1
fi

echo "→ Installing base dependencies (curl, jq, ca-certificates, gnupg)..."
if sudo apt-get install -y curl jq ca-certificates gnupg; then
    echo "✓ Base dependencies installed"
else
    echo "✗ Error: Failed to install base dependencies"
    exit 1
fi

# ---------------------------------------------------------------------------
# Step 3: AI coding agents (installed globally via npm, always latest)
# ---------------------------------------------------------------------------

# Generic idempotent npm agent installer with retry + verification.
# Args: <display name> <command to verify> <npm package>
install_npm_agent() {
    local name="$1"
    local cmd="$2"
    local pkg="$3"

    echo "→ Installing ${name} (latest)..."

    if ! command -v npm &> /dev/null; then
        echo "✗ Error: npm is required but not available"
        return 1
    fi

    if command -v "$cmd" &> /dev/null; then
        echo "✓ ${name} already installed ($("$cmd" --version 2>&1 | head -1))"
        return 0
    fi

    local max_attempts=3
    local attempt=1
    while [ "$attempt" -le "$max_attempts" ]; do
        echo "  Installing ${pkg}@latest (attempt ${attempt}/${max_attempts})..."
        if npm install -g "${pkg}@latest"; then
            if command -v "$cmd" &> /dev/null; then
                echo "✓ ${name} installed ($("$cmd" --version 2>&1 | head -1))"
                return 0
            fi
            echo "  Warning: package installed but '${cmd}' command not found on PATH"
        else
            echo "  Error: npm install failed (attempt ${attempt}/${max_attempts})"
        fi

        if [ "$attempt" -lt "$max_attempts" ]; then
            echo "  Retrying in 5 seconds..."
            sleep 5
        fi
        attempt=$((attempt + 1))
    done

    echo "✗ Error: Failed to install ${name} after ${max_attempts} attempts"
    return 1
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Installing AI Coding Agents"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

install_npm_agent "GitHub Copilot CLI" "copilot" "@github/copilot" || mark_failure "copilot"
install_npm_agent "OpenCode" "opencode" "opencode-ai" || mark_failure "opencode"
install_npm_agent "Claude Code" "claude" "@anthropic-ai/claude-code" || mark_failure "claude"

# ---------------------------------------------------------------------------
# Step 4: Nia CLI (from telerik/project-nia)
# ---------------------------------------------------------------------------

# Detect operating system and CPU architecture for the correct release asset.
detect_os() {
    case "$(uname -s)" in
        Linux*)  echo "linux" ;;
        Darwin*) echo "darwin" ;;
        *)       echo "unsupported" ;;
    esac
}

detect_arch() {
    case "$(uname -m)" in
        x86_64|amd64)   echo "x86_64" ;;
        aarch64|arm64)  echo "aarch64" ;;
        *)              echo "unsupported" ;;
    esac
}

# Resolve the target release tag:
#   - Prefer the latest stable (non-draft, non-prerelease) release.
#   - Fall back to the latest pre-release when no stable release exists.
# Emits: "<tag>|<is_prerelease>" on stdout, or empty string on failure.
resolve_nia_release() {
    local api="https://api.github.com/repos/${NIA_REPO}/releases?per_page=100"
    local auth_header=()
    # Use GITHUB_TOKEN if present to avoid low unauthenticated rate limits.
    if [ -n "${GITHUB_TOKEN:-}" ]; then
        auth_header=(-H "Authorization: Bearer ${GITHUB_TOKEN}")
    fi

    local releases_json
    if ! releases_json=$(curl -fsSL "${auth_header[@]}" \
        -H "Accept: application/vnd.github+json" "${api}" 2>/dev/null); then
        return 1
    fi

    local stable_tag
    stable_tag=$(echo "${releases_json}" \
        | jq -r 'map(select(.draft == false and .prerelease == false)) | .[0].tag_name // empty')
    if [ -n "${stable_tag}" ]; then
        echo "${stable_tag}|false"
        return 0
    fi

    local prerelease_tag
    prerelease_tag=$(echo "${releases_json}" \
        | jq -r 'map(select(.draft == false)) | .[0].tag_name // empty')
    if [ -n "${prerelease_tag}" ]; then
        echo "${prerelease_tag}|true"
        return 0
    fi

    return 1
}

install_nia_cli() {
    echo "→ Installing Nia CLI from ${NIA_REPO}..."

    if command -v nia &> /dev/null; then
        echo "✓ Nia CLI already installed ($(nia --version 2>&1 | head -1))"
        return 0
    fi

    local os arch
    os="$(detect_os)"
    arch="$(detect_arch)"
    if [ "${os}" = "unsupported" ] || [ "${arch}" = "unsupported" ]; then
        echo "✗ Error: Unsupported platform ($(uname -s)/$(uname -m)) for Nia CLI"
        return 1
    fi
    echo "  Detected platform: ${arch}-${os}"

    local resolved tag is_prerelease
    if ! resolved="$(resolve_nia_release)"; then
        echo "✗ Error: Could not resolve a Nia release from GitHub"
        return 1
    fi
    tag="${resolved%%|*}"
    is_prerelease="${resolved##*|}"
    local version="${tag#v}"

    if [ "${is_prerelease}" = "true" ]; then
        echo "  No stable release found — using latest pre-release: ${tag}"
    else
        echo "  Using latest stable release: ${tag}"
    fi

    # Primary path: the vendor install.sh from the resolved release tag.
    local installer_url="https://github.com/${NIA_REPO}/releases/download/${tag}/install.sh"
    local tmp_installer
    tmp_installer="$(mktemp)"
    if curl -fsSL "${installer_url}" -o "${tmp_installer}" 2>/dev/null && [ -s "${tmp_installer}" ]; then
        echo "  Running vendor installer (version ${version})..."
        local installer_args=(--version "${version}")
        if [ "${is_prerelease}" = "true" ]; then
            installer_args=(--pre-release)
        fi
        if sh "${tmp_installer}" "${installer_args[@]}"; then
            rm -f "${tmp_installer}"
            if command -v nia &> /dev/null; then
                echo "✓ Nia CLI installed ($(nia --version 2>&1 | head -1))"
                return 0
            fi
        fi
        echo "  Vendor installer did not complete — falling back to direct binary download"
    fi
    rm -f "${tmp_installer}"

    # Fallback path: download the platform binary directly and verify checksum.
    local asset="nia-${version}-${arch}-${os}"
    local binary_url="https://github.com/${NIA_REPO}/releases/download/${tag}/${asset}"
    local sums_url="https://github.com/${NIA_REPO}/releases/download/${tag}/SHA256SUMS.asc"
    local install_dir="${HOME}/.local/bin"
    mkdir -p "${install_dir}"

    local tmp_bin
    tmp_bin="$(mktemp)"
    echo "  Downloading ${asset}..."
    if ! curl -fsSL "${binary_url}" -o "${tmp_bin}"; then
        echo "✗ Error: Failed to download Nia binary (${asset})"
        rm -f "${tmp_bin}"
        return 1
    fi

    # Best-effort checksum verification against the (clear-signed) SHA256SUMS.
    local expected_sum
    if expected_sum=$(curl -fsSL "${sums_url}" 2>/dev/null | grep -F "${asset}" | awk '{print $1}' | head -1) \
        && [ -n "${expected_sum}" ]; then
        local actual_sum
        actual_sum=$(sha256sum "${tmp_bin}" | awk '{print $1}')
        if [ "${expected_sum}" != "${actual_sum}" ]; then
            echo "✗ Error: Checksum verification failed for ${asset}"
            rm -f "${tmp_bin}"
            return 1
        fi
        echo "  Checksum verified"
    else
        echo "  Warning: could not verify checksum (SHA256SUMS unavailable)"
    fi

    install -m 755 "${tmp_bin}" "${install_dir}/nia"
    rm -f "${tmp_bin}"

    if "${install_dir}/nia" --version &> /dev/null; then
        echo "✓ Nia CLI installed to ${install_dir}/nia ($("${install_dir}/nia" --version 2>&1 | head -1))"
        return 0
    fi

    echo "✗ Error: Nia CLI was downloaded but is not runnable"
    return 1
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Installing Nia CLI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
install_nia_cli || mark_failure "nia"

# ---------------------------------------------------------------------------
# Step 5: Project bootstrap (install Angular dependencies)
# ---------------------------------------------------------------------------
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Installing Angular project dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "${WORKSPACE_ROOT}/package.json" ]; then
    echo "→ Running npm install..."
    if (cd "${WORKSPACE_ROOT}" && npm install); then
        echo "✓ Angular dependencies installed"
    else
        echo "✗ Error: npm install failed"
        mark_failure "npm-install"
    fi
else
    echo "✗ Warning: package.json not found at ${WORKSPACE_ROOT}"
fi

# ---------------------------------------------------------------------------
# Step 6: Summary and next steps
# ---------------------------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════"
echo "  Dev Container Setup Summary"
echo "═══════════════════════════════════════════════"
verify_command "node" && echo "  ✓ Node.js:            $(node --version)"    || echo "  ✗ Node.js:            not installed"
verify_command "npm"  && echo "  ✓ npm:                $(npm --version)"     || echo "  ✗ npm:                not installed"
verify_command "copilot"  && echo "  ✓ GitHub Copilot CLI: $(copilot --version 2>&1 | head -1)"  || echo "  ✗ GitHub Copilot CLI: not installed"
verify_command "opencode" && echo "  ✓ OpenCode:           $(opencode --version 2>&1 | head -1)" || echo "  ✗ OpenCode:           not installed"
verify_command "claude"   && echo "  ✓ Claude Code:        $(claude --version 2>&1 | head -1)"   || echo "  ✗ Claude Code:        not installed"
verify_command "nia"      && echo "  ✓ Nia CLI:            $(nia --version 2>&1 | head -1)"       || echo "  ✗ Nia CLI:            not installed"
echo "═══════════════════════════════════════════════"

echo ""
echo "───────────────────────────────────────────────"
echo "  NEXT STEPS TO FINALIZE YOUR SETUP (manual)"
echo "───────────────────────────────────────────────"
echo "  Authentication is required before the agents and Nia CLI can run."
echo ""
echo "  1. Authenticate the GitHub CLI (used by Nia workflows):"
echo "       gh auth login"
echo ""
echo "  2. Authenticate the AI coding agents you plan to use:"
echo "       copilot        # GitHub Copilot CLI — sign in when prompted"
echo "       claude         # Claude Code — set ANTHROPIC_API_KEY or sign in"
echo "       opencode auth login"
echo ""
echo "  3. Configure Nia CLI credentials / agent (PLACEHOLDER — replace with"
echo "     your organisation's onboarding values):"
echo "       # export NIA_API_KEY=\"<your-nia-api-key>\""
echo "       # export ANTHROPIC_API_KEY=\"<your-anthropic-api-key>\""
echo "       nia --help                 # explore available commands"
echo "       nia learn                  # guided, hands-on onboarding tutorials"
echo ""
echo "  4. Run the Angular application:"
echo "       npm start                  # serves on http://localhost:4200"
echo "───────────────────────────────────────────────"

if [ -n "${INSTALL_FAILURES}" ]; then
    failures_trimmed="${INSTALL_FAILURES# }"
    echo ""
    echo "✗ Some components failed to install: ${failures_trimmed// /, }"
    echo "  Review the logs above; you can re-run: bash .devcontainer/setup.sh"
    exit 1
fi

echo ""
echo "✓ Dev container setup complete."
