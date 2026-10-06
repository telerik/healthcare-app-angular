#!/usr/bin/env bash
set -euo pipefail

usage() {
  printf '%s\n' \
    'Usage: bash reset-workspace.sh [--base BRANCH] [--dry-run] [--yes]' \
    '' \
    'Discard staged/unstaged changes, delete untracked files and directories,' \
    'switch to the base branch, close ALL open PRs in the origin GitHub repo,' \
    'and delete ALL branches on origin except the selected base branch.' \
    'Each step requires confirmation; answering no or pressing Enter skips it.' \
    'Ignored files, stashes, and local branches are preserved.' \
    'An untracked copy of this script is also deleted during cleanup.' \
    '' \
    'Requires Git remote write access and authenticated gh with PR write permission.' \
    '--base BRANCH  Override the GitHub default branch; existing local commits remain.' \
    '--dry-run      Preview without changing local files, refs, or GitHub PRs.' \
    '--yes          Approve ALL steps, including remote branch deletion, without prompts.'
}

confirm_step() {
  local prompt="$1" assume_yes="$2" answer
  if [[ "$assume_yes" == true ]]; then
    return 0
  fi
  while true; do
    printf '%s [y/N] ' "$prompt"
    if ! IFS= read -r answer; then
      printf '\nInput ended. Stopping; completed steps are not undone.\n' >&2
      exit 1
    fi
    case "$answer" in
      [yY]|[yY][eE][sS]) return 0 ;;
      ''|[nN]|[nN][oO]) return 1 ;;
      *) printf 'Please answer yes or no.\n' ;;
    esac
  done
}

main() {
  local base_branch='' dry_run=false confirmed=false
  local script_dir repo_root remote_url metadata repository default_branch
  local pull_requests number failed=0
  local remote_heads remote_oid remote_ref branch
  local remote_branches=()

  while (( $# > 0 )); do
    case "$1" in
      --base)
        if (( $# < 2 )) || [[ -z "$2" || "$2" == -* ]]; then
          printf 'Error: --base requires a branch name.\n' >&2
          return 1
        fi
        base_branch="$2"
        shift 2
        ;;
      --dry-run) dry_run=true; shift ;;
      --yes) confirmed=true; shift ;;
      -h|--help) usage; return 0 ;;
      *) printf 'Unknown argument: %s\n' "$1" >&2; usage >&2; return 1 ;;
    esac
  done

  command -v git >/dev/null || { printf 'Error: git is required.\n' >&2; return 1; }
  command -v gh >/dev/null || { printf 'Error: gh is required.\n' >&2; return 1; }
  script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
  repo_root="$(git -C "$script_dir" rev-parse --show-toplevel)"
  cd -- "$repo_root"
  remote_url="$(git remote get-url origin)"
  metadata="$(gh repo view "$remote_url" --json nameWithOwner,defaultBranchRef \
    --jq '[.nameWithOwner, .defaultBranchRef.name] | @tsv')"
  IFS=$'\t' read -r repository default_branch <<< "$metadata"
  base_branch="${base_branch:-$default_branch}"
  if [[ -z "$repository" || -z "$base_branch" ]]; then
    printf 'Error: could not resolve the origin repository and base branch.\n' >&2
    return 1
  fi
  git check-ref-format "refs/heads/$base_branch" >/dev/null
  git ls-remote --exit-code --heads origin "refs/heads/$base_branch" >/dev/null
  pull_requests="$(gh api --paginate "repos/$repository/pulls?state=open&per_page=100" \
    --jq '.[].number')"
  remote_heads="$(git ls-remote --heads origin)"
  while IFS=$'\t' read -r remote_oid remote_ref; do
    [[ "$remote_ref" == refs/heads/* ]] || continue
    branch="${remote_ref#refs/heads/}"
    [[ "$branch" == "$base_branch" ]] || remote_branches+=("$branch")
  done <<< "$remote_heads"

  printf 'Local repository: %s\nGitHub repository: %s\nBase branch: %s\n' \
    "$repo_root" "$repository" "$base_branch"
  printf '\nChanges to discard (ignored files are preserved):\n'
  git status --short
  git clean -nd
  printf '\nOpen PRs to close, across ALL authors and base branches:\n%s\n' \
    "${pull_requests:-(none)}"
  printf '\nRemote branches to delete from origin (keeping %s):\n' "$base_branch"
  if (( ${#remote_branches[@]} > 0 )); then
    printf '%s\n' "${remote_branches[@]}"
  else
    printf '(none)\n'
  fi
  printf '\nWARNING: Local changes and untracked files will be permanently lost.\n'
  printf 'Remote branch deletion affects collaborators and can close associated PRs.\n'

  if [[ "$dry_run" == true ]]; then
    printf 'Dry run complete. No changes made.\n'
    return 0
  fi

  if confirm_step '1/5: Discard all staged and unstaged changes to tracked files?' "$confirmed"; then
    git reset --hard HEAD
  else
    printf 'Skipped tracked-file cleanup.\n'
  fi

  if confirm_step '2/5: Delete all untracked files and directories (excluding ignored files)?' "$confirmed"; then
    git clean -fd
  else
    printf 'Skipped untracked-file cleanup.\n'
  fi

  if confirm_step "3/5: Fetch and switch to base branch $base_branch?" "$confirmed"; then
    git fetch origin "refs/heads/$base_branch:refs/remotes/origin/$base_branch"
    if git show-ref --verify --quiet "refs/heads/$base_branch"; then
      git switch --no-overwrite-ignore -- "$base_branch"
    else
      git switch --no-overwrite-ignore --create "$base_branch" --track "origin/$base_branch"
    fi
  else
    printf 'Skipped base-branch switch.\n'
  fi

  if [[ -z "$pull_requests" ]]; then
    printf '4/5: No open PRs to close.\n'
  elif confirm_step "4/5: Close ALL listed open PRs in $repository?" "$confirmed"; then
    while IFS= read -r number; do
      [[ -n "$number" ]] || continue
      if ! gh pr close "$number" --repo "$repository"; then
        printf 'Failed to close PR #%s.\n' "$number" >&2
        failed=1
      fi
    done <<< "$pull_requests"
  else
    printf 'Skipped PR closure.\n'
  fi

  if (( ${#remote_branches[@]} == 0 )); then
    printf '5/5: No non-base remote branches to delete.\n'
  elif confirm_step "5/5: Delete ALL listed branches on origin except $base_branch? This can also close associated PRs." "$confirmed"; then
    for branch in "${remote_branches[@]}"; do
      if ! git push origin --delete "refs/heads/$branch"; then
        printf 'Failed to delete remote branch %s (it may be protected).\n' "$branch" >&2
        failed=1
      fi
    done
  else
    printf 'Skipped remote branch deletion.\n'
  fi

  if (( failed != 0 )); then
    printf 'Cleanup finished with failures. See the errors above.\n' >&2
    return 1
  fi
  printf 'Cleanup finished. Approved steps completed; declined steps were skipped.\n'
}

main "$@"