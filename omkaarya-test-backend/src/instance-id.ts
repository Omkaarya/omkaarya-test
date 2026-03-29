import { randomUUID } from "node:crypto";

/** New UUID each time the Node process starts — use to confirm Postman hits this server. */
export const INSTANCE_ID = randomUUID();

export const STARTED_AT_ISO = new Date().toISOString();
