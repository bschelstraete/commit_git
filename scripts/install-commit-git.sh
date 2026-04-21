#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SOURCE_SCRIPT="${REPO_DIR}/commit_git"

PREFIX="${PREFIX:-${HOME}/.local}"
BIN_DIR="${BIN_DIR:-${PREFIX}/bin}"
TARGET="${TARGET:-${BIN_DIR}/commit_git}"

if [[ ! -f "${SOURCE_SCRIPT}" ]]; then
  echo "Could not find source script at ${SOURCE_SCRIPT}" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Missing prerequisite: node" >&2
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "Missing prerequisite: git" >&2
  exit 1
fi

mkdir -p "${BIN_DIR}"
install -m 0755 "${SOURCE_SCRIPT}" "${TARGET}"

echo "Installed commit_git to ${TARGET}"

case ":${PATH}:" in
  *:"${BIN_DIR}":*)
    ;;
  *)
    echo "Add ${BIN_DIR} to PATH to run commit_git directly."
    ;;
esac

if ! command -v codex >/dev/null 2>&1 && [[ ! -x /Applications/Codex.app/Contents/Resources/codex ]]; then
  echo "Codex CLI was not found on PATH. commit_git will need codex available at runtime."
fi
