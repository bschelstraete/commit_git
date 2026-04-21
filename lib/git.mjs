import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fail, run } from "./utils.mjs";

export function git(repo, args) {
  return run("git", ["-C", repo, ...args], repo);
}

export function getRepoRoot(repo) {
  const result = git(repo, ["rev-parse", "--show-toplevel"]);
  if (result.status !== 0) {
    fail(`Could not find a Git repository at ${repo}`);
  }
  return result.stdout.trim();
}

export function hasAnyChanges(repo) {
  const result = git(repo, ["status", "--porcelain"]);
  if (result.status !== 0) {
    fail((result.stderr || "Failed to inspect git status").trim());
  }

  return result.stdout.trim().length > 0;
}

export function hasStagedChanges(repo) {
  const result = git(repo, ["diff", "--cached", "--quiet"]);
  return result.status === 1;
}

export function stageAllChanges(repo) {
  const result = git(repo, ["add", "-A"]);
  if (result.status !== 0) {
    fail((result.stderr || "Failed to stage changes").trim());
  }
}

export function createCommit(repo, message) {
  const tempDir = mkdtempSync(join(tmpdir(), "commit-git-message-"));
  const messagePath = join(tempDir, "COMMIT_EDITMSG");

  writeFileSync(
    messagePath,
    `${message}

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
`,
  );

  const result = git(repo, ["commit", "--cleanup=strip", "-F", messagePath]);
  rmSync(tempDir, { recursive: true, force: true });

  if (result.status !== 0) {
    fail((result.stderr || result.stdout || "git commit failed").trim());
  }

  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  if (output) {
    console.log(output);
  }

  console.log(`Committed as: ${message}`);
}

export function hasOriginRemote(repo) {
  const result = git(repo, ["remote", "get-url", "origin"]);
  return result.status === 0 && result.stdout.trim().length > 0;
}

export function pushBranch(repo, branch) {
  let result = git(repo, ["push"]);

  if (result.status !== 0) {
    const combined = `${result.stdout || ""}\n${result.stderr || ""}`;
    const missingUpstream =
      combined.includes("has no upstream branch") ||
      combined.includes("set the remote as upstream") ||
      combined.includes("--set-upstream");

    if (missingUpstream && branch && branch !== "detached-head" && hasOriginRemote(repo)) {
      result = git(repo, ["push", "-u", "origin", branch]);
    }
  }

  if (result.status !== 0) {
    fail((result.stderr || result.stdout || "git push failed").trim());
  }

  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  if (output) {
    console.log(output);
  }
}

export function getCurrentBranch(repo) {
  const result = git(repo, ["branch", "--show-current"]);
  if (result.status !== 0) {
    return "unknown";
  }

  const branch = result.stdout.trim();
  return branch || "detached-head";
}

export function getDiffSet(repo, diffArgs) {
  const statResult = git(repo, ["diff", "--stat", ...diffArgs]);
  const patchResult = git(repo, ["diff", "--no-ext-diff", ...diffArgs]);

  if (statResult.status !== 0 || patchResult.status !== 0) {
    fail((patchResult.stderr || statResult.stderr || "Failed to collect git diff").trim());
  }

  return {
    stat: statResult.stdout.trim(),
    patch: patchResult.stdout.trim(),
  };
}

export function collectGitDiff(repo, mode) {
  if (mode === "cached") {
    const data = getDiffSet(repo, ["--cached"]);
    return { ...data, source: "staged changes" };
  }

  if (mode === "unstaged") {
    const data = getDiffSet(repo, []);
    return { ...data, source: "unstaged changes" };
  }

  if (mode === "all") {
    const staged = getDiffSet(repo, ["--cached"]);
    const unstaged = getDiffSet(repo, []);
    const statBlocks = [];
    const patchBlocks = [];

    if (staged.stat) {
      statBlocks.push(`STAGED CHANGES\n${staged.stat}`);
    }
    if (unstaged.stat) {
      statBlocks.push(`UNSTAGED CHANGES\n${unstaged.stat}`);
    }
    if (staged.patch) {
      patchBlocks.push(`diff -- staged changes\n${staged.patch}`);
    }
    if (unstaged.patch) {
      patchBlocks.push(`diff -- unstaged changes\n${unstaged.patch}`);
    }

    return {
      stat: statBlocks.join("\n\n"),
      patch: patchBlocks.join("\n\n"),
      source: "staged and unstaged changes",
    };
  }

  const staged = getDiffSet(repo, ["--cached"]);
  if (staged.patch) {
    return { ...staged, source: "staged changes" };
  }

  const unstaged = getDiffSet(repo, []);
  return { ...unstaged, source: "unstaged changes" };
}
