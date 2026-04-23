import type { NextConfig } from "next";

/**
 * `reactStrictMode` defaults to true in the App Router. In development, React
 * intentionally runs effects twice to catch unsafe side effects; client
 * `useEffect` + `fetch` to `/api/...` can therefore appear twice in the Network
 * tab. Production does not double-invoke those effects. To compare, run
 * `next build` then `next start` and inspect the Network tab.
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactStrictMode
 * @see https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-double-rendering-in-development
 */
const nextConfig: NextConfig = {
  // reactStrictMode: true, // default; set false only for temporary debugging
};

export default nextConfig;