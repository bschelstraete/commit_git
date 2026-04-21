import { existsSync, readFileSync } from "node:fs";
import { CODEX_FALLBACK_PATH } from "../constants.mjs";
import { findBinaryOnPath, run } from "../utils.mjs";
import { parseStructuredOutput } from "./shared.mjs";

export function findCodexBinary() {
  const binary = findBinaryOnPath("codex");
  if (binary) {
    return binary;
  }

  if (existsSync(CODEX_FALLBACK_PATH)) {
    return CODEX_FALLBACK_PATH;
  }

  return "";
}

export function ensureCodexAvailable(binary) {
  const result = run(binary, ["--version"], process.cwd());
  return result.status === 0;
}

export function generateWithCodex(binary, workingDirectory, prompt, schemaPath, outputPath) {
  const args = [
    "exec",
    "--skip-git-repo-check",
    "--sandbox",
    "read-only",
    "--color",
    "never",
    "--cd",
    workingDirectory,
    "--output-schema",
    schemaPath,
    "--output-last-message",
    outputPath,
    prompt,
  ];

  const result = run(binary, args, workingDirectory);

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "Codex failed to generate a commit message").trim());
  }

  if (!existsSync(outputPath)) {
    throw new Error("Codex finished without writing an output message");
  }

  return parseStructuredOutput(readFileSync(outputPath, "utf8"), "Codex");
}
