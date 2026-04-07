import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { artikelen } from "../lib/db/schema";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL niet gevonden in .env.local");

  const db = drizzle(neon(url), { schema: { artikelen } });

  const result = await db
    .update(artikelen)
    .set({ weergaven: sql`${artikelen.weergaven} + 156` })
    .returning({ id: artikelen.id, titel: artikelen.titel, weergaven: artikelen.weergaven });

  console.log(`✅ ${result.length} artikel(en) bijgewerkt:`);
  result.forEach(a => console.log(`  - ${a.titel}: ${a.weergaven} weergaven`));
}

main().catch(console.error);
