import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Loads `.env` from the backend package root (`omkaarya-test-backend/.env`), then falls back to `process.cwd()/.env`.
 * Does not override existing env vars. Ensures `npm run migrate` works even when cwd is not the backend folder.
 */
export function loadEnvFile(): void {
  // On Vercel, env vars come from the project dashboard — never from a bundled `.env` file.
  if (process.env.VERCEL === "1") return;

  const here = dirname(fileURLToPath(import.meta.url));
  const backendRootEnv = join(here, "..", ".env");
  const cwdEnv = join(process.cwd(), ".env");

  for (const path of [backendRootEnv, cwdEnv]) {
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
    return;
  }
}

loadEnvFile();
