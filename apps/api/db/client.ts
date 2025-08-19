import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

export async function createDb() {
  const databaseUrl = Deno.env.get("DATABASE_URL");
  if (!databaseUrl) {
    throw new Error("DATABASE_URL not set");
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  const db = drizzle(client);

  return { db, client } as const;
}
