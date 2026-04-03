import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { gebruikers } from "../lib/db/schema";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

const USER_ID = "090892ec-10c6-4230-9740-26d80bbad44c"; // Vincent - v.munster@weareimpact.nl

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL niet gevonden in .env.local");

  const sql = neon(url);
  const db = drizzle(sql, { schema: { gebruikers } });

  await db
    .update(gebruikers)
    .set({ rol: "superadmin" })
    .where(eq(gebruikers.userId, USER_ID));

  const check = await db.select().from(gebruikers).where(eq(gebruikers.userId, USER_ID));
  console.log(`✅ Rol is nu: ${check[0]?.rol}`);
}

main().catch(console.error);
