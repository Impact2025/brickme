import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { gebruikers } from "../lib/db/schema";

config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL niet gevonden in .env.local");

  const db = drizzle(neon(url), { schema: { gebruikers } });
  const rijen = await db.select().from(gebruikers);
  console.table(rijen.map((r) => ({ userId: r.userId, naam: r.naam, email: r.email, rol: r.rol })));
}

main().catch(console.error);
