export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { openai, AI_MODEL } from "@/lib/ai";
import { db } from "@/lib/db";
import { artikelen, gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

async function checkAdmin() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const rijen = await db.select({ rol: gebruikers.rol }).from(gebruikers).where(eq(gebruikers.userId, userId)).limit(1);
  if (rijen[0]?.rol !== "superadmin") return null;
  return session;
}

const seoRequestSchema = z.object({
  titel: z.string().min(1).max(200),
  inhoud: z.string().min(1),
  huidigSlug: z.string().optional(),
  siteNaam: z.string().optional().default("Brickme"),
  siteUrl: z.string().optional().default("https://brickme.nl"),
});

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function berekenLeestijd(tekst: string): number {
  return Math.max(1, Math.ceil(tekst.split(/\s+/).length / 200));
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });

  const parsed = seoRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { titel, inhoud, huidigSlug, siteNaam, siteUrl } = parsed.data;
  const plainTekst = stripHtml(inhoud);
  const leestijd = berekenLeestijd(plainTekst);

  let bestaandeArtikelen: { slug: string; titel: string; excerpt: string | null }[] = [];
  try {
    const rows = await db.select({ slug: artikelen.slug, titel: artikelen.titel, excerpt: artikelen.excerpt })
      .from(artikelen).where(eq(artikelen.gepubliceerd, true));
    bestaandeArtikelen = rows.filter(r => r.slug !== huidigSlug);
  } catch { /* tabel bestaat nog niet */ }

  const bestaandeLinksContext = bestaandeArtikelen.length > 0
    ? `\n\nBestaande gepubliceerde artikelen op ${siteUrl}/blog:\n` +
      bestaandeArtikelen.map(a => `- "${a.titel}" → /blog/${a.slug}`).join("\n")
    : "\n\nEr zijn nog geen andere gepubliceerde artikelen voor interne links.";

  const prompt = `Je bent een wereldklasse SEO-expert voor Nederlandse content. Analyseer dit artikel en geef een volledig SEO-pakket terug als valide JSON.

ARTIKEL TITEL: ${titel}

ARTIKEL INHOUD (eerste 3000 tekens):
${plainTekst.slice(0, 3000)}
${bestaandeLinksContext}

Geef ALLEEN een JSON-object terug (geen markdown, geen uitleg):

{
  "metaTitel": "exact 50-60 tekens, primair zoekwoord vooraan",
  "metaBeschrijving": "exact 145-155 tekens, zoekwoord aanwezig + CTA",
  "slug": "seo-slug-max-60-tekens",
  "excerpt": "2-3 zinnen, 120-160 tekens",
  "categorie": "1 of 2 woorden, hoofdcategorie van dit artikel (bv. 'Zelfreflectie', 'LEGO Serious Play', 'Persoonlijke groei', 'Loopbaan')",
  "trefwoorden": ["5-8", "semantische", "zoekwoorden"],
  "interneLinks": [{"ankerTekst": "...", "href": "/blog/slug", "context": "De zin uit het artikel"}],
  "schemaMarkup": {"@context": "https://schema.org", "@type": "Article", "headline": "...", "description": "...", "author": {"@type": "Organization", "name": "${siteNaam}"}, "publisher": {"@type": "Organization", "name": "${siteNaam}", "url": "${siteUrl}"}, "dateModified": "${new Date().toISOString().split("T")[0]}"},
  "seoScore": 0,
  "verbeteringen": ["concrete verbeterpunten"]
}

Bereken seoScore (0-100): metaTitel (0-20), metaBeschrijving (0-20), slug (0-10), trefwoorden (0-10), interne links (0-20), inhoud ${plainTekst.split(/\s+/).length} woorden ideaal 800+ (0-10), excerpt (0-10).

Geef ALLEEN de JSON terug.`;

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const rawContent = response.choices[0]?.message?.content ?? "";
  const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json({ error: "AI gaf geen valide JSON terug" }, { status: 500 });

  let seoData: Record<string, unknown>;
  try {
    seoData = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: "JSON parse mislukt" }, { status: 500 });
  }

  return NextResponse.json({ ...seoData, leestijd });
}
