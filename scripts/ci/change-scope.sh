#!/usr/bin/env bash
set -euo pipefail

mode="${1:-}"

matches_app() {
  case "$1" in
    src/app/*|src/components/*|src/lib/*|public/*|package.json|pnpm-lock.yaml|tsconfig.json|next.config.*|eslint.config.*|biome.json|vercel.json|scripts/ci/change-scope.sh)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

matches_go() {
  case "$1" in
    main.go|go.mod|go.sum)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

matches_contracts() {
  case "$1" in
    contracts/*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

list_files_from_head_commit() {
  git show --format= --name-only --first-parent HEAD | sed '/^$/d'
}

list_files_for_github_event() {
  case "${GITHUB_EVENT_NAME:-}" in
    pull_request)
      git fetch --no-tags origin "${GITHUB_BASE_REF:?}" --depth=1 >/dev/null 2>&1 || true
      if ! git diff --name-only "origin/${GITHUB_BASE_REF}...${GITHUB_HEAD_SHA:?}"; then
        list_files_from_head_commit
      fi
      ;;
    push)
      if [[ -z "${GITHUB_BEFORE:-}" || "${GITHUB_BEFORE}" =~ ^0+$ ]]; then
        list_files_from_head_commit
      elif ! git diff --name-only "${GITHUB_BEFORE}" "${GITHUB_SHA:?}"; then
        list_files_from_head_commit
      fi
      ;;
    *)
      list_files_from_head_commit
      ;;
  esac
}

classify_files() {
  local app=false
  local go=false
  local contracts=false
  local smoke=false

  while IFS= read -r file; do
    [[ -z "$file" ]] && continue

    if matches_app "$file"; then
      app=true
      smoke=true
    fi

    if matches_go "$file"; then
      go=true
      smoke=true
    fi

    if matches_contracts "$file"; then
      contracts=true
    fi
  done

  printf 'app=%s\n' "$app"
  printf 'go=%s\n' "$go"
  printf 'contracts=%s\n' "$contracts"
  printf 'smoke=%s\n' "$smoke"
}

case "$mode" in
  vercel-ignore)
    changed_files="$(list_files_from_head_commit)"
    should_deploy=false
    while IFS= read -r file; do
      [[ -z "$file" ]] && continue
      if matches_app "$file"; then
        should_deploy=true
        break
      fi
    done <<<"$changed_files"

    if [[ "$should_deploy" == "false" ]]; then
      echo "No app-affecting changes detected. Skip Vercel build."
      exit 0
    fi

    echo "App-affecting changes detected. Continue Vercel build."
    exit 1
    ;;
  github)
    changed_files="$(list_files_for_github_event)"
    echo "Changed files:"
    printf '%s\n' "$changed_files" | sed '/^$/d; s/^/- /'
    classify_files <<<"$changed_files" >> "${GITHUB_OUTPUT:?}"
    ;;
  *)
    echo "Unsupported mode: $mode" >&2
    exit 2
    ;;
esac
