# commit_git

`commit_git` stages changes, asks Codex for a short conventional commit message, creates the commit, and can optionally push the current branch.

## Install

```bash
git clone <repo-url>
cd commit_git
bash scripts/install-commit-git.sh
```

Default install target:

```bash
~/.local/bin/commit_git
```

The installer places the executable launcher in `~/.local/bin/commit_git` and the app files in `~/.local/share/commit_git`.

Custom install prefix:

```bash
PREFIX="$HOME/.local" bash scripts/install-commit-git.sh
```

## Prerequisites

- `node`
- `git`
- `codex`

## Usage

Run from any Git repository:

```bash
commit_git
commit_git --push
commit_git --cached
commit_git --print
commit_git --provider claude
commit_git --type fix
```

Behavior:

- `commit_git` stages current changes, generates a message, and commits
- `commit_git --push` commits and pushes the current branch
- `commit_git --cached` commits only what is already staged
- `commit_git --print` prints the generated message without committing
- `commit_git --provider claude` uses Claude instead of Codex

Provider selection:

- `commit_git` defaults to `--provider auto`
- `auto` prefers Codex first, then falls back to Claude if Codex is unavailable
- You can force a backend with `--provider codex` or `--provider claude`
- You can also set `COMMIT_GIT_PROVIDER=codex` or `COMMIT_GIT_PROVIDER=claude`

When a repository has commit hooks that add required metadata such as Jira ticket footers, `commit_git` keeps those hooks in the flow.
