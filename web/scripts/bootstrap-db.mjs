import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`${name} is not set`);
  }
  return v;
}

async function main() {
  const databaseUrl = requiredEnv("DATABASE_URL");

  const here = path.dirname(fileURLToPath(import.meta.url));
  const schemaPath = path.resolve(here, "../supabase/schema.sql");
  const schemaSql = await fs.readFile(schemaPath, "utf8");

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query("begin");
    await client.query(schemaSql);
    await client.query("commit");
    console.log("Schema applied successfully from supabase/schema.sql");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Database bootstrap failed:", error);
  process.exit(1);
});

