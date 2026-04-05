import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { gebruikers } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!), { schema: { gebruikers } });
  const rijen = await db.select().from(gebruikers).where(eq(gebruikers.email, "coach@demo.brickme.nl"));
  const g = rijen[0];
  console.log("actief:", g.actief);
  console.log("heeft wachtwoord:", !!g.wachtwoord);
  if (g.wachtwoord) {
    const ok = await bcrypt.compare("Demo1234!", g.wachtwoord);
    console.log("wachtwoord klopt:", ok);
  }
}
main().catch(console.error);
