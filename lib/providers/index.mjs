import { fail } from "../utils.mjs";
import {
  ensureCodexAvailable,
  findCodexBinary,
  generateWithCodex,
} from "./codex.mjs";
import {
  ensureClaudeAvailable,
  findClaudeBinary,
  generateWithClaude,
} from "./claude.mjs";

export function resolveProvider(requestedProvider) {
  const codexBinary = findCodexBinary();
  const claudeBinary = findClaudeBinary();

  if (requestedProvider === "codex") {
    if (!codexBinary) {
      fail(
        "Could not find the Codex CLI. Expected `codex` on PATH or at /Applications/Codex.app/Contents/Resources/codex.",
      );
    }
    if (!ensureCodexAvailable(codexBinary)) {
      fail("Codex CLI is installed but not available to this script");
    }
    return { provider: "codex", generate: generateWithCodex, binary: codexBinary };
  }

  if (requestedProvider === "claude") {
    if (!claudeBinary) {
      fail("Could not find the Claude CLI. Expected `claude` on PATH.");
    }
    if (!ensureClaudeAvailable(claudeBinary)) {
      fail("Claude CLI is installed but not available to this script");
    }
    return { provider: "claude", generate: generateWithClaude, binary: claudeBinary };
  }

  if (codexBinary && ensureCodexAvailable(codexBinary)) {
    return { provider: "codex", generate: generateWithCodex, binary: codexBinary };
  }

  if (claudeBinary && ensureClaudeAvailable(claudeBinary)) {
    return { provider: "claude", generate: generateWithClaude, binary: claudeBinary };
  }

  fail(
    "Could not find a supported CLI backend. Expected `codex` or `claude` on PATH, or Codex at /Applications/Codex.app/Contents/Resources/codex.",
  );
}
