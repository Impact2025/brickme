export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { gebruikers, sessies, coachingRelaties, workshops, workshopDeelnemers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  openai,
  AI_MODEL,
  buildAssistentSystemPrompt,
  getAssistentChips,
  AssistentContext,
} from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { berichten } = await req.json();

  // Laad gebruikersprofiel
  const gebRijen = await db
    .select()
    .from(gebruikers)
    .where(eq(gebruikers.userId, userId))
    .limit(1);
  const rol = gebRijen[0]?.rol ?? "gebruiker";
  const naam = gebRijen[0]?.naam ?? null;

  const context: AssistentContext = { rol, naam };

  // Context laden per rol
  if (rol === "gebruiker" || rol === "superadmin") {
    const userSessies = await db
      .select({ themaLabel: sessies.themaLabel, status: sessies.status })
      .from(sessies)
      .where(eq(sessies.userId, userId))
      .orderBy(desc(sessies.aangemaktOp))
      .limit(10);
    context.sessies = userSessies;
  }

  if (rol === "coach") {
    const relaties = await db
      .select({ clientUserId: coachingRelaties.clientUserId })
      .from(coachingRelaties)
      .where(eq(coachingRelaties.coachId, userId));

    context.clienten = await Promise.all(
      relaties.slice(0, 8).map(async (r) => {
        const geb = await db
          .select({ naam: gebruikers.naam })
          .from(gebruikers)
          .where(eq(gebruikers.userId, r.clientUserId))
          .limit(1);
        const clientSessies = await db
          .select({ themaLabel: sessies.themaLabel, status: sessies.status })
          .from(sessies)
          .where(eq(sessies.userId, r.clientUserId))
          .orderBy(desc(sessies.aangemaktOp))
          .limit(5);
        return {
          naam: geb[0]?.naam ?? null,
          aantalSessies: clientSessies.length,
          recentThema: clientSessies[0]?.themaLabel,
        };
      })
    );
  }

  if (rol === "facilitator") {
    const wsLijst = await db
      .select()
      .from(workshops)
      .where(eq(workshops.facilitatorId, userId))
      .orderBy(desc(workshops.aangemaktOp))
      .limit(5);

    context.workshops = await Promise.all(
      wsLijst.map(async (w) => {
        const deelnemers = await db
          .select({ id: workshopDeelnemers.id })
          .from(workshopDeelnemers)
          .where(eq(workshopDeelnemers.workshopId, w.id));
        return { naam: w.naam, aantalDeelnemers: deelnemers.length, status: w.status };
      })
    );
  }

  // Eerste aanroep: geef alleen chips terug (geen berichten nog)
  const heeftSessies = (context.sessies?.length ?? 0) > 0;
  if (!berichten || berichten.length === 0) {
    return NextResponse.json({ bericht: null, chips: getAssistentChips(rol, heeftSessies) });
  }

  // Stuur berichten naar AI
  const messages = berichten.map((b: { rol: string; inhoud: string }) => ({
    role: b.rol === "ai" ? "assistant" : "user",
    content: b.inhoud,
  }));

  let response;
  try {
    response = await openai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: 400,
      messages: [
        { role: "system", content: buildAssistentSystemPrompt(context) },
        ...messages,
      ],
    });
  } catch (err) {
    console.error("[assistent] AI call mislukt:", err);
    return NextResponse.json({ error: "AI tijdelijk niet beschikbaar." }, { status: 503 });
  }

  const bericht = response.choices[0]?.message?.content ?? "";
  return NextResponse.json({ bericht });
}
