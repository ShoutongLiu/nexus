import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverEnv } from "@nexus/config/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

// 开发模式下避免 HMR 时反复创建连接池
const client =
  globalForDb.client ??
  postgres(serverEnv.DATABASE_URL, { max: 10, idle_timeout: 20, connect_timeout: 10 });

if (serverEnv.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, {
  schema,
  logger: serverEnv.NODE_ENV === "development",
});

export type Database = typeof db;
