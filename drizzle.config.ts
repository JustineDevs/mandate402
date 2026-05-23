import { defineConfig } from "drizzle-kit";

const connectionString =
  process.env.MANDATE402_DATABASE_DIRECT_URL ??
  process.env.DATABASE_DIRECT_URL ??
  process.env.MANDATE402_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Drizzle config requires MANDATE402_DATABASE_DIRECT_URL, DATABASE_DIRECT_URL, MANDATE402_DATABASE_URL, or DATABASE_URL.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: connectionString,
  },
  strict: true,
  verbose: true,
});
