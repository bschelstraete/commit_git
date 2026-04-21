import { findBinaryOnPath, run } from "../utils.mjs";
import { parseStructuredOutput } from "./shared.mjs";

export function findClaudeBinary() {
  return findBinaryOnPath("claude");
}

export function ensureClaudeAvailable(binary) {
  const result = run(binary, ["--version"], process.cwd());
  return result.status === 0;
}

export function generateWithClaude(binary, workingDirectory, prompt, schema) {
  const args = [
    "--print",
    "--output-format",
    "json",
    "--json-schema",
    JSON.stringify(schema),
    "--no-session-persistence",
    "--permission-mode",
    "bypassPermissions",
    prompt,
  ];

  const result = run(binary, args, workingDirectory);

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "Claude failed to generate a commit message").trim());
  }

  return parseStructuredOutput(result.stdout, "Claude");
}
