export const dynamic = "force-dynamic";
export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { getGebruiker } from "@/lib/auth";
import { db } from "@/lib/db";
import { coachingRelaties, sessies, rapporten } from "@/lib/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const gebruiker = await getGebruiker();
  if (!gebruiker || (gebruiker.rol !== "coach" && gebruiker.rol !== "superadmin")) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { userId } = await params;

  if (gebruiker.rol !== "superadmin") {
    const [relatie] = await db
      .select()
      .from(coachingRelaties)
      .where(and(
        eq(coachingRelaties.coachId, gebruiker.userId),
        eq(coachingRelaties.clientUserId, userId),
        eq(coachingRelaties.status, "actief")
      ))
      .limit(1);

    if (!relatie) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }
  }

  const alleSessies = await db
    .select()
    .from(sessies)
    .where(and(eq(sessies.userId, userId), eq(sessies.status, "voltooid")))
    .orderBy(desc(sessies.aangemaktOp))
    .limit(10);

  if (alleSessies.length === 0) {
    return NextResponse.json({ error: "Geen voltooide sessies" }, { status: 404 });
  }

  const sessieIds = alleSessies.map(s => s.id);
  const alleRapporten = await db
    .select()
    .from(rapporten)
    .where(inArray(rapporten.sessieId, sessieIds));

  const chronologisch = [...alleSessies].reverse();

  const overzicht = chronologisch.map((s, i) => {
    const rapport = alleRapporten.find(r => r.sessieId === s.id);
    const inzichten = rapport?.inzichten as string[] | null;
    const delta = s.stemmingVoor != null && s.stemmingNa != null
      ? ` (∆${s.stemmingNa - s.stemmingVoor > 0 ? "+" : ""}${s.stemmingNa - s.stemmingVoor})`
      : "";

    return [
      `Sessie ${i + 1} — ${new Date(s.aangemaktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}`,
      `Thema: ${s.themaLabel}`,
      `Stemming: ${s.stemmingVoor ?? "?"}→${s.stemmingNa ?? "?"}${delta}`,
      rapport?.samenvattingTekst ? `Samenvatting: ${rapport.samenvattingTekst}` : null,
      inzichten?.length ? `Inzichten:\n${inzichten.map(iz => `- ${iz}`).join("\n")}` : null,
      rapport?.eersteStap ? `Eerste stap die de cliënt zichzelf gaf: ${rapport.eersteStap}` : null,
    ].filter(Boolean).join("\n");
  }).join("\n\n---\n\n");

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1200,
    system: `Je bent een ervaren coach die een diepgaande patroonanalyse schrijft op basis van iemands sessiegeschiedenis in Brickme — een op LEGO Serious Play gebaseerde zelfreflectie-app.

METHODOLOGISCH KADER:
- Elk Brickme-rapport heeft drie lagen: samenvatting (wat de cliënt ervoer), inzichten (wat ze in zichzelf herkenden), eerste stap (wat ze zichzelf beloofden te doen)
- Patroonanalyse gaat over wat er OVER sessies heen zichtbaar wordt — niet over één sessie op zichzelf
- De "eerste stap" is bijzonder waardevol: laat het je zien of de cliënt vorderingen maakt op eigen beloften

JOUW OBSERVATIESTIJL:
- Concreet en specifiek — verwijs naar elementen uit de sessies zelf, geen generalisaties
- Warm maar direct — schrijf over de cliënt in de derde persoon
- Niet therapeutisch — jij diagnosticeert niet, je observeert patronen
- Zie de stemmingsdelta (stemming voor → na sessie) als aanvullend signaal, niet als hoofdmaat`,
    messages: [{
      role: "user",
      content: `Analyseer de sessiegeschiedenis van deze cliënt:\n\n${overzicht}\n\nGeef je analyse als JSON — geen extra tekst, alleen het JSON-object:\n{\n  "terugkerendeThemas": ["maximaal 4 korte thema's die steeds opduiken in woorden of patronen"],\n  "kernspanning": "Één zin: de diepste spanning of onbeantwoorde vraag die door alle sessies loopt",\n  "groeipatroon": "2-3 zinnen over wat er concreet veranderd is van de eerste naar de laatste sessie — noem specifieke elementen",\n  "sterkePunten": ["2-3 krachten of resources die de cliënt steeds inzet of terug laat zien"],\n  "opvallendMoment": "Één specifieke observatie die verrast of die een sleutelmoment lijkt — mag een vraag bevatten",\n  "coachingTip": "Één concrete, uitvoerbare tip voor de coach voor het eerstvolgende gesprek — geen open deuren",\n  "aanbevelingType": "terugkeer of nieuwThema of pauze",\n  "aanbevelingToelichting": "Één zin waarom dit type vervolg past bij de huidige stand van de cliënt"\n}`,
    }],
  });

  const tekst = msg.content[0].type === "text" ? msg.content[0].text : "";
  const jsonMatch = tekst.match(/\{[\s\S]*\}/);
  let analyse: Record<string, unknown> = {};
  if (jsonMatch) {
    try {
      analyse = JSON.parse(jsonMatch[0]);
    } catch {
      analyse = { groeipatroon: tekst };
    }
  }

  return NextResponse.json({ aantalSessies: alleSessies.length, analyse });
}
