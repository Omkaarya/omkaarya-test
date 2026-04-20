import { createApp } from "../src/app.js";

// Catch-all Vercel Serverless Function for `/api/*`.
export default createApp({ apiMountPath: "/api" });

