import { createApp } from "../src/app.js";

// Catch-all Vercel Serverless Function for `/api/*`.
//
// Depending on routing (automatic vs `vercel.json` routes), Vercel may invoke the function with
// a URL that includes `/api` or already has it stripped. Normalize to support both.
const app = createApp({ apiMountPath: "/" });

export default function handler(req: any, res: any) {
  const raw: string = req?.url ?? req?.originalUrl ?? "/";
  let normalized = raw;
  if (normalized === "/api") normalized = "/";
  else if (normalized.startsWith("/api/")) normalized = normalized.slice("/api".length);

  // Ensure Express/router sees the normalized URL.
  req.url = normalized;
  req.originalUrl = normalized;
  if (req._parsedUrl) req._parsedUrl = undefined;
  return app(req, res);
}

