import {
  MAX_COMMIT_BODY_CHARS,
  MAX_COMMIT_SUBJECT_CHARS,
  MAX_PATCH_CHARS,
  VALID_PREFIXES,
} from "./constants.mjs";

export function buildPrompt({ stat, patch, source, forcedPrefix }) {
  const truncatedPatch = patch.slice(0, MAX_PATCH_CHARS);
  const wasTruncated = patch.length > MAX_PATCH_CHARS;
  const prefixRule = forcedPrefix
    ? `- Use the prefix "${forcedPrefix}".`
    : "- Choose exactly one prefix from: chore, feat, fix.";

  return `You generate short Git commit messages.

Return JSON that matches the provided schema.

Rules:
${prefixRule}
- Use "feat" for a new capability or user-visible enhancement.
- Use "fix" for a bug fix, regression fix, or behavior correction.
- Use "chore" for refactors, tooling, tests, docs, cleanup, or other non-user-facing work.
- The summary must be a single short line in imperative mood.
- Capitalize the first letter of the summary.
- Keep it specific and concise.
- Do not include the prefix in the summary field.
- Do not add a trailing period.
- The full subject line ("prefix: summary") must be no more than ${MAX_COMMIT_SUBJECT_CHARS} characters.
- Prefer 6 to 12 words.
- Optionally include a short body only when it adds useful context.
- Return an empty string for the body when no extra context is needed.
- The body must be a single concise paragraph.
- Keep the body specific and under ${MAX_COMMIT_BODY_CHARS} characters.
- Do not repeat the subject in the body.

Diff source: ${source}
${wasTruncated ? `Patch note: the patch was truncated after ${MAX_PATCH_CHARS} characters.` : ""}

Diff stat:
${stat || "(not available)"}

Patch:
${truncatedPatch}`;
}

export function buildSchema(forcedPrefix) {
  const maxSummaryLength = Math.max(
    10,
    MAX_COMMIT_SUBJECT_CHARS - `${forcedPrefix || "chore"}: `.length,
  );

  return {
    type: "object",
    additionalProperties: false,
    required: ["prefix", "summary", "body"],
    properties: {
      prefix: forcedPrefix
        ? { type: "string", enum: [forcedPrefix] }
        : { type: "string", enum: [...VALID_PREFIXES] },
      summary: {
        type: "string",
        minLength: 4,
        maxLength: maxSummaryLength,
      },
      body: {
        type: "string",
        minLength: 0,
        maxLength: MAX_COMMIT_BODY_CHARS,
      },
    },
  };
}
