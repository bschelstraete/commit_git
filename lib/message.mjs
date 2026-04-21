import { MAX_COMMIT_BODY_CHARS, MAX_COMMIT_SUBJECT_CHARS } from "./constants.mjs";
import { fail } from "./utils.mjs";

export function capitalizeSummary(summary) {
  for (let index = 0; index < summary.length; index += 1) {
    const char = summary[index];
    if (/[A-Za-z]/.test(char)) {
      return `${summary.slice(0, index)}${char.toUpperCase()}${summary.slice(index + 1)}`;
    }
  }

  return summary;
}

export function normalizeSummary(prefix, summary) {
  const cleaned = summary
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^(chore|feat|fix):\s*/i, "")
    .replace(/\s+/g, " ")
    .replace(/[.]+$/g, "");

  if (!cleaned) {
    fail("LLM returned an empty commit summary");
  }

  const capitalized = capitalizeSummary(cleaned);
  const maxSummaryLength = Math.max(10, MAX_COMMIT_SUBJECT_CHARS - `${prefix}: `.length);
  if (capitalized.length <= maxSummaryLength) {
    return capitalized;
  }

  const words = capitalized.split(" ");
  while (words.length > 1 && words.join(" ").length > maxSummaryLength) {
    words.pop();
  }

  const shortened = words.join(" ").trim();
  return shortened || capitalizeSummary(capitalized.slice(0, maxSummaryLength).trim());
}

export function normalizeBody(body) {
  const cleaned = String(body || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, " ");

  if (!cleaned) {
    return "";
  }

  if (cleaned.length <= MAX_COMMIT_BODY_CHARS) {
    return cleaned;
  }

  const words = cleaned.split(" ");
  while (words.length > 1 && words.join(" ").length > MAX_COMMIT_BODY_CHARS - 3) {
    words.pop();
  }

  const shortened = words.join(" ").trim();
  if (shortened) {
    return `${shortened}...`;
  }

  return `${cleaned.slice(0, MAX_COMMIT_BODY_CHARS - 3).trim()}...`;
}

export function buildCommitMessage(prefix, summary, body) {
  const sections = [`${prefix}: ${summary}`];

  if (body) {
    sections.push(body);
  }

  return sections.join("\n\n");
}
