#!/usr/bin/env bash

# ---------------------------------------------------------------------------
# Update Nia CLI to the latest release
#
# Standalone, on-demand companion to setup.sh's install_nia_cli step (which
# only installs Nia if it is missing). Run this script any time you want to
# force-refresh the Nia CLI to the newest available release from
# telerik/project-nia — prefers the latest stable release, falling back to
# the latest pre-release when no stable release exists.
#
# Usage:
#   .devcontainer/update-nia.sh          # update to latest (no-op if current)
#   .devcontainer/update-nia.sh --force  # reinstall even if already latest
#   .devcontainer/update-nia.sh --check  # only report current vs. latest
# ---------------------------------------------------------------------------

set -euo pipefail

NIA_REPO="telerik/project-nia"

FORCE=false
CHECK_ONLY=false
for arg in "$@"; do
    case "${arg}" in
        --force) FORCE=true ;;
        --check) CHECK_ONLY=true ;;
        *)
            echo "✗ Unknown option: ${arg}" >&2
            echo "  Usage: $0 [--force] [--check]" >&2
            exit 2
            ;;
    esac
done

detect_os() {
    case "$(uname -s)" in
        Linux*)  echo "linux" ;;
        Darwin*) echo "darwin" ;;
        *)       echo "unsupported" ;;
    esac
}

detect_arch() {
    case "$(uname -m)" in
        x86_64|amd64)  echo "x86_64" ;;
        aarch64|arm64) echo "aarch64" ;;
        *)             echo "unsupported" ;;
    esac
}

# Resolve the target release tag:
#   - Prefer the latest stable (non-draft, non-prerelease) release.
#   - Fall back to the latest pre-release when no stable release exists.
# Emits: "<tag>|<is_prerelease>" on stdout, or empty string on failure.
resolve_nia_release() {
    local api="https://api.github.com/repos/${NIA_REPO}/releases?per_page=100"
    local auth_header=()
    if [ -n "${GITHUB_TOKEN:-}" ]; then
        auth_header=(-H "Authorization: Bearer ${GITHUB_TOKEN}")
    fi

    local releases_json
    if ! releases_json=$(curl -fsSL "${auth_header[@]+"${auth_header[@]}"}" \
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

current_version=""
current_path=""
if command -v nia &> /dev/null; then
    current_path="$(command -v nia)"
    current_version="$(nia --version 2>&1 | head -1)"
    echo "→ Currently installed: ${current_version} (${current_path})"
else
    echo "→ Nia CLI is not currently installed"
fi

echo "→ Checking latest Nia CLI release from ${NIA_REPO}..."
resolved="$(resolve_nia_release)" || {
    echo "✗ Error: Could not resolve a Nia release from GitHub" >&2
    exit 1
}
tag="${resolved%%|*}"
is_prerelease="${resolved##*|}"
version="${tag#v}"

if [ "${is_prerelease}" = "true" ]; then
    echo "  No stable release found — latest pre-release: ${tag}"
else
    echo "  Latest stable release: ${tag}"
fi

if ${CHECK_ONLY}; then
    echo "✓ Check complete (no changes made). Re-run without --check to update."
    exit 0
fi

if [ -n "${current_version}" ] && [[ "${current_version}" == *"${version}"* ]] && ! ${FORCE}; then
    echo "✓ Already up to date (${current_version}). Use --force to reinstall anyway."
    exit 0
fi

os="$(detect_os)"
arch="$(detect_arch)"
if [ "${os}" = "unsupported" ] || [ "${arch}" = "unsupported" ]; then
    echo "✗ Error: Unsupported platform ($(uname -s)/$(uname -m)) for Nia CLI" >&2
    exit 1
fi
echo "  Detected platform: ${arch}-${os}"

# Remove the existing binary so the installer performs a clean reinstall.
if [ -n "${current_path}" ]; then
    echo "  Removing existing binary at ${current_path}..."
    if [ -w "$(dirname "${current_path}")" ]; then
        rm -f "${current_path}"
    else
        sudo rm -f "${current_path}"
    fi
fi

# Primary path: the vendor install.sh from the resolved release tag.
installer_url="https://github.com/${NIA_REPO}/releases/download/${tag}/install.sh"
tmp_installer="$(mktemp)"
trap 'rm -f "${tmp_installer}"' EXIT

installed=false
if curl -fsSL "${installer_url}" -o "${tmp_installer}" 2>/dev/null && [ -s "${tmp_installer}" ]; then
    echo "  Running vendor installer (version ${version})..."
    installer_args=(--version "${version}")
    if [ "${is_prerelease}" = "true" ]; then
        installer_args+=(--pre-release)
    fi
    if sh "${tmp_installer}" "${installer_args[@]}" && command -v nia &> /dev/null; then
        installed=true
    else
        echo "  Vendor installer did not complete — falling back to direct binary download"
    fi
fi

if ! ${installed}; then
    # Fallback path: download the platform binary directly and verify checksum.
    asset="nia-${version}-${arch}-${os}"
    binary_url="https://github.com/${NIA_REPO}/releases/download/${tag}/${asset}"
    sums_url="https://github.com/${NIA_REPO}/releases/download/${tag}/SHA256SUMS.asc"
    install_dir="${HOME}/.local/bin"
    mkdir -p "${install_dir}"

    tmp_bin="$(mktemp)"
    echo "  Downloading ${asset}..."
    if ! curl -fsSL "${binary_url}" -o "${tmp_bin}"; then
        echo "✗ Error: Failed to download Nia binary (${asset})" >&2
        rm -f "${tmp_bin}"
        exit 1
    fi

    expected_sum=$(curl -fsSL "${sums_url}" 2>/dev/null | grep -F "${asset}" | awk '{print $1}' | head -1 || true)
    if [ -n "${expected_sum}" ]; then
        actual_sum=$(sha256sum "${tmp_bin}" | awk '{print $1}')
        if [ "${expected_sum}" != "${actual_sum}" ]; then
            echo "✗ Error: Checksum verification failed for ${asset}" >&2
            rm -f "${tmp_bin}"
            exit 1
        fi
        echo "  Checksum verified"
    else
        echo "  Warning: could not verify checksum (SHA256SUMS unavailable)"
    fi

    install -m 755 "${tmp_bin}" "${install_dir}/nia"
    rm -f "${tmp_bin}"
fi

if command -v nia &> /dev/null; then
    echo "✓ Nia CLI updated: $(nia --version 2>&1 | head -1)"
else
    echo "✗ Error: Nia CLI was installed but is not runnable/on PATH" >&2
    exit 1
fi
