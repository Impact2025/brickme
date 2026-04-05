/**
 * Genereert een magic-link code voor een demo account.
 * Gebruik: npx tsx scripts/demo-code.ts coach
 *          npx tsx scripts/demo-code.ts facilitator
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { gebruikers } from "../lib/db/schema";
import { eq } from "drizzle-orm";

const DEMO_ACCOUNTS: Record<string, string> = {
  coach: "coach@demo.brickme.nl",
  facilitator: "facilitator@demo.brickme.nl",
  emma: "emma@demo.brickme.nl",
  thomas: "thomas@demo.brickme.nl",
};

async function main() {
  const arg = process.argv[2] || "coach";
  const email = DEMO_ACCOUNTS[arg] ?? arg;

  const db = drizzle(neon(process.env.DATABASE_URL!), { schema: { gebruikers } });

  const [gebruiker] = await db
    .select()
    .from(gebruikers)
    .where(eq(gebruikers.email, email))
    .limit(1);

  if (!gebruiker) {
    console.error(`Geen account gevonden voor: ${email}`);
    process.exit(1);
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const verloptOp = new Date(Date.now() + 60 * 60 * 1000); // 1 uur geldig

  await db
    .update(gebruikers)
    .set({ verificatieCode: code, verificatieVerloptOp: verloptOp })
    .where(eq(gebruikers.userId, gebruiker.userId));

  console.log(`\n✓ Login code voor ${gebruiker.naam} (${email}):`);
  console.log(`\n  CODE: ${code}\n`);
  console.log(`  Geldig tot: ${verloptOp.toLocaleTimeString("nl-NL")}`);
  console.log(`  Stap 1: ga naar /sign-in, vul e-mail in: ${email}`);
  console.log(`  Stap 2: voer bovenstaande code in\n`);
}

main().catch(console.error);
