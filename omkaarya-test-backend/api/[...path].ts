import { createApp } from "../src/app.js";

// Catch-all Vercel Serverless Function for `/api/*`.
//
// Depending on routing (automatic vs `vercel.json` routes), Vercel may invoke the function with
// a URL that includes `/api` or already has it stripped. Normalize to support both.
const app = createApp({ apiMountPath: "/" });

export default function handler(req: any, res: any) {
  const url: string = req?.url ?? "/";
  if (url === "/api") req.url = "/";
  else if (url.startsWith("/api/")) req.url = url.slice("/api".length);
  return app(req, res);
}

