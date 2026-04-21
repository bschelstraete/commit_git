import { VALID_PREFIXES, VALID_PROVIDERS } from "./constants.mjs";
import { fail } from "./utils.mjs";

export function printHelp() {
  console.log(`Generate a short commit message from a diff via an LLM CLI and commit it.

Usage:
  commit_git [--cached] [--push] [--provider NAME] [--repo PATH] [--type PREFIX]
  commit_git --print [--cached|--unstaged|--all] [--provider NAME] [--repo PATH] [--type PREFIX]
  git diff --cached | commit_git --print

Options:
  --cached       Commit only staged changes, or print only the staged diff
  --unstaged     Print only unstaged changes
  --all          Print both staged and unstaged changes
  --print        Print the generated message without creating a commit
  --push         Push after creating the commit
  --provider     LLM backend: auto, codex, or claude
  --repo PATH    Run git commands in the given repository
  --type PREFIX  Force one prefix: chore, feat, or fix
  --help         Show this help
`);
}

export function parseArgs(argv) {
  const options = {
    mode: "auto",
    repo: process.cwd(),
    forcedPrefix: null,
    action: "commit",
    push: false,
    provider: process.env.COMMIT_GIT_PROVIDER || "auto",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    if (arg === "--cached" || arg === "--staged") {
      options.mode = "cached";
      continue;
    }

    if (arg === "--unstaged") {
      options.mode = "unstaged";
      continue;
    }

    if (arg === "--all") {
      options.mode = "all";
      continue;
    }

    if (arg === "--print" || arg === "--message-only") {
      options.action = "print";
      continue;
    }

    if (arg === "--push") {
      options.push = true;
      continue;
    }

    if (arg === "--provider") {
      const value = argv[index + 1];
      if (!value) {
        fail("Missing value for --provider");
      }
      if (!VALID_PROVIDERS.has(value)) {
        fail("Invalid --provider value. Use one of: auto, codex, claude");
      }
      options.provider = value;
      index += 1;
      continue;
    }

    if (arg === "--repo") {
      const value = argv[index + 1];
      if (!value) {
        fail("Missing value for --repo");
      }
      options.repo = value;
      index += 1;
      continue;
    }

    if (arg === "--type") {
      const value = argv[index + 1];
      if (!value) {
        fail("Missing value for --type");
      }
      if (!VALID_PREFIXES.has(value)) {
        fail("Invalid --type value. Use one of: chore, feat, fix");
      }
      options.forcedPrefix = value;
      index += 1;
      continue;
    }

    fail(`Unknown argument: ${arg}`);
  }

  return options;
}
