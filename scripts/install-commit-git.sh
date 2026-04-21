#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SOURCE_SCRIPT="${REPO_DIR}/commit_git"
SOURCE_LIB_DIR="${REPO_DIR}/lib"

PREFIX="${PREFIX:-${HOME}/.local}"
BIN_DIR="${BIN_DIR:-${PREFIX}/bin}"
APP_DIR="${APP_DIR:-${PREFIX}/share/commit_git}"
TARGET="${TARGET:-${BIN_DIR}/commit_git}"

if [[ ! -f "${SOURCE_SCRIPT}" ]]; then
  echo "Could not find source script at ${SOURCE_SCRIPT}" >&2
  exit 1
fi

if [[ ! -d "${SOURCE_LIB_DIR}" ]]; then
  echo "Could not find source library directory at ${SOURCE_LIB_DIR}" >&2
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
mkdir -p "${APP_DIR}/lib/providers"

install -m 0755 "${SOURCE_SCRIPT}" "${APP_DIR}/commit_git"
install -m 0644 "${REPO_DIR}/lib/args.mjs" "${APP_DIR}/lib/args.mjs"
install -m 0644 "${REPO_DIR}/lib/constants.mjs" "${APP_DIR}/lib/constants.mjs"
install -m 0644 "${REPO_DIR}/lib/git.mjs" "${APP_DIR}/lib/git.mjs"
install -m 0644 "${REPO_DIR}/lib/message.mjs" "${APP_DIR}/lib/message.mjs"
install -m 0644 "${REPO_DIR}/lib/prompt.mjs" "${APP_DIR}/lib/prompt.mjs"
install -m 0644 "${REPO_DIR}/lib/utils.mjs" "${APP_DIR}/lib/utils.mjs"
install -m 0644 "${REPO_DIR}/lib/providers/claude.mjs" "${APP_DIR}/lib/providers/claude.mjs"
install -m 0644 "${REPO_DIR}/lib/providers/codex.mjs" "${APP_DIR}/lib/providers/codex.mjs"
install -m 0644 "${REPO_DIR}/lib/providers/index.mjs" "${APP_DIR}/lib/providers/index.mjs"
install -m 0644 "${REPO_DIR}/lib/providers/shared.mjs" "${APP_DIR}/lib/providers/shared.mjs"

cat > "${TARGET}" <<EOF
#!/usr/bin/env bash
exec node "${APP_DIR}/commit_git" "\$@"
EOF
chmod 0755 "${TARGET}"

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
