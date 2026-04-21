import { fail } from "../utils.mjs";

function looksLikeCommitPayload(value) {
  return (
    value &&
    typeof value === "object" &&
    typeof value.prefix === "string" &&
    typeof value.summary === "string" &&
    typeof value.body === "string"
  );
}

export function parseStructuredOutput(rawOutput, providerName) {
  const raw = rawOutput.trim();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    fail(`Failed to parse ${providerName} output: ${error.message}`);
  }

  if (looksLikeCommitPayload(parsed)) {
    return parsed;
  }

  for (const key of ["result", "output", "response", "text"]) {
    const value = parsed?.[key];
    if (looksLikeCommitPayload(value)) {
      return value;
    }
    if (typeof value === "string") {
      try {
        const nested = JSON.parse(value);
        if (looksLikeCommitPayload(nested)) {
          return nested;
        }
      } catch {
        // Ignore non-JSON string payloads.
      }
    }
  }

  if (Array.isArray(parsed?.content)) {
    const text = parsed.content
      .filter((item) => item && typeof item.text === "string")
      .map((item) => item.text)
      .join("\n")
      .trim();

    if (text) {
      try {
        const nested = JSON.parse(text);
        if (looksLikeCommitPayload(nested)) {
          return nested;
        }
      } catch {
        // Ignore non-JSON content payloads.
      }
    }
  }

  fail(`Could not extract commit payload from ${providerName} output.`);
}
