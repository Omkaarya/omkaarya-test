import { createApp } from "../src/app.js";

// Vercel provides the HTTP server; export the Express app as the handler.
const app = createApp({ apiMountPath: "/api" });

export default app;

