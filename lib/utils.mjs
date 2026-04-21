import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

export function fail(message) {
  console.error(message);
  process.exit(1);
}

export function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });

  if (result.error) {
    throw result.error;
  }

  return result;
}

export function readStdin() {
  return new Promise((resolveStdin, rejectStdin) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolveStdin(data));
    process.stdin.on("error", rejectStdin);
  });
}

export function findBinaryOnPath(name) {
  const pathEntries = (process.env.PATH || "").split(":").filter(Boolean);

  for (const entry of pathEntries) {
    const candidate = join(entry, name);
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return "";
}
