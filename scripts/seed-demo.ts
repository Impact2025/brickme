/**
 * Demo seed script — Brickme.nl
 *
 * Maakt demo-accounts aan voor een coach en een facilitator,
 * inclusief cliënten, voltooide sessies, workshops en notities.
 *
 * Gebruik: npm run db:seed
 *
 * Demo-accounts na het seeden:
 * ┌─────────────────────────────────────────┬──────────────────┐
 * │ E-mail                                  │ Wachtwoord       │
 * ├─────────────────────────────────────────┼──────────────────┤
 * │ coach@demo.brickme.nl                   │ Demo1234!        │
 * │ facilitator@demo.brickme.nl             │ Demo1234!        │
 * │ emma@demo.brickme.nl                    │ Demo1234!        │
 * │ thomas@demo.brickme.nl                  │ Demo1234!        │
 * │ sophie@demo.brickme.nl                  │ Demo1234!        │
 * │ pieter@demo.brickme.nl                  │ Demo1234!        │
 * │ anna@demo.brickme.nl                    │ Demo1234!        │
 * │ jan@demo.brickme.nl                     │ Demo1234!        │
 * │ marieke@demo.brickme.nl                 │ Demo1234!        │
 * └─────────────────────────────────────────┴──────────────────┘
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

if (!process.env.DATABASE_URL) {
  console.error("❌  DATABASE_URL niet gevonden in .env.local");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

// ─── Vaste demo-UUIDs (zodat het script idempotent is) ────────────────────────

const ID = {
  coach:       "demo-0001-0000-0000-000000000001",
  facilitator: "demo-0001-0000-0000-000000000002",
  emma:        "demo-0001-0000-0000-000000000003",
  thomas:      "demo-0001-0000-0000-000000000004",
  sophie:      "demo-0001-0000-0000-000000000005",
  pieter:      "demo-0001-0000-0000-000000000006",
  anna:        "demo-0001-0000-0000-000000000007",
  jan:         "demo-0001-0000-0000-000000000008",
  marieke:     "demo-0001-0000-0000-000000000009",
} as const;

// Sessie-UUIDs (geldig UUID-formaat)
const S = {
  emma1:    "00000000-0000-4000-8000-000000000001",
  emma2:    "00000000-0000-4000-8000-000000000002",
  thomas1:  "00000000-0000-4000-8000-000000000003",
  thomas2:  "00000000-0000-4000-8000-000000000004",
  thomas3:  "00000000-0000-4000-8000-000000000005",
  sophie1:  "00000000-0000-4000-8000-000000000006",
  pieter1:  "00000000-0000-4000-8000-000000000007",
  pieter2:  "00000000-0000-4000-8000-000000000008",
  anna1:    "00000000-0000-4000-8000-000000000009",
  jan1:     "00000000-0000-4000-8000-000000000010",
  marieke1: "00000000-0000-4000-8000-000000000011",
} as const;

// Workshop-UUIDs
const W = {
  zorg:  "00000000-0000-4000-8001-000000000001",
  leid:  "00000000-0000-4000-8001-000000000002",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function hashWw(pw: string) {
  return bcrypt.hash(pw, 12);
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🧱  Brickme demo-seed gestart…\n");

  const pw = await hashWw("Demo1234!");

  // ── 1. Gebruikers ────────────────────────────────────────────────────────────
  console.log("👤  Gebruikers aanmaken…");

  await db.insert(schema.gebruikers).values([
    { userId: ID.coach,       rol: "coach",       naam: "Lisa van den Berg",  email: "coach@demo.brickme.nl",       wachtwoord: pw },
    { userId: ID.facilitator, rol: "facilitator", naam: "Mark de Vries",      email: "facilitator@demo.brickme.nl", wachtwoord: pw },
    { userId: ID.emma,        rol: "gebruiker",   naam: "Emma Janssen",       email: "emma@demo.brickme.nl",        wachtwoord: pw },
    { userId: ID.thomas,      rol: "gebruiker",   naam: "Thomas Bakker",      email: "thomas@demo.brickme.nl",      wachtwoord: pw },
    { userId: ID.sophie,      rol: "gebruiker",   naam: "Sophie Willemsen",   email: "sophie@demo.brickme.nl",      wachtwoord: pw },
    { userId: ID.pieter,      rol: "gebruiker",   naam: "Pieter Hofman",      email: "pieter@demo.brickme.nl",      wachtwoord: pw },
    { userId: ID.anna,        rol: "gebruiker",   naam: "Anna de Boer",       email: "anna@demo.brickme.nl",        wachtwoord: pw },
    { userId: ID.jan,         rol: "gebruiker",   naam: "Jan Vermeer",        email: "jan@demo.brickme.nl",         wachtwoord: pw },
    { userId: ID.marieke,     rol: "gebruiker",   naam: "Marieke Smit",       email: "marieke@demo.brickme.nl",     wachtwoord: pw },
  ]).onConflictDoNothing();

  console.log("   ✓ 9 gebruikers\n");

  // ── 2. Sessies ───────────────────────────────────────────────────────────────
  console.log("📋  Sessies aanmaken…");

  await db.insert(schema.sessies).values([
    // Emma — Werk & Energie (6 weken geleden)
    {
      id: S.emma1, userId: ID.emma,
      thema: "werk", themaLabel: "Werk & energie",
      status: "voltooid",
      stemmingVoor: 3, stemmingNa: 7,
      aiSessieContext: "Emma (32) ervaart al 8 maanden een opbouwend gevoel van uitputting op het werk. Ze is accountmanager bij een zorginstelling en neemt structureel te veel hooi op haar vork. Ze heeft moeite met nee zeggen, wil graag overal voor iedereen klaarstaan. Haar grootste angst is dat ze 'niet goed genoeg' is als ze minder doet. Ze heeft een warme band met haar collega's maar voelt zich daardoor ook gevangen.",
      aangemaktOp: daysAgo(42), bijgewerktOp: daysAgo(42), voltooidOp: daysAgo(42),
    },
    // Emma — Identiteit (2 weken geleden)
    {
      id: S.emma2, userId: ID.emma,
      thema: "identiteit", themaLabel: "Wie ben ik",
      status: "voltooid",
      stemmingVoor: 5, stemmingNa: 8,
      aiSessieContext: "Emma (32) volgt deze sessie na een eerder traject rond werkstress. Ze heeft grenzen leren stellen maar voelt nu dat ze zichzelf kwijt is geraakt: wie is ze buiten haar werk- en zorgrol? Ze omschrijft zichzelf als 'altijd bezig voor anderen', en vraagt zich af of er ook een 'Emma voor zichzelf' bestaat. Ze is nieuwsgierig maar ook lichtelijk angstig voor wat ze kan tegenkomen.",
      aangemaktOp: daysAgo(14), bijgewerktOp: daysAgo(14), voltooidOp: daysAgo(14),
    },
    // Thomas — Kruispunt (10 weken geleden)
    {
      id: S.thomas1, userId: ID.thomas,
      thema: "kruispunt", themaLabel: "Kruispunt",
      status: "voltooid",
      stemmingVoor: 4, stemmingNa: 6,
      aiSessieContext: "Thomas (41) staat op een loopbaankruispunt. Hij werkt al 12 jaar als projectmanager in de bouw, maar voelt dat de energie er al jaren uit is. Er is een kans om een eigen adviesbureau te starten, maar hij durft de sprong niet te wagen. Zijn partner steunt hem, zijn ouders niet. Hij is analytisch en heeft de neiging om alles door te denken in plaats van te voelen. Het bouwen is voor hem bewust een andere ingang.",
      aangemaktOp: daysAgo(70), bijgewerktOp: daysAgo(70), voltooidOp: daysAgo(70),
    },
    // Thomas — Werk & Energie (5 weken geleden)
    {
      id: S.thomas2, userId: ID.thomas,
      thema: "werk", themaLabel: "Werk & energie",
      status: "voltooid",
      stemmingVoor: 5, stemmingNa: 7,
      aiSessieContext: "Thomas (41) heeft zijn eerste sessie als een eye-opener ervaren. Hij denkt serieus na over de stap naar zelfstandigheid. In deze sessie wil hij specifiek kijken naar wat hem nu energie geeft en wat hem weghoudt van de stap. Hij is iets opener geworden, maar blijft analytisch. Hij benoemt dat zijn identiteit sterk verweven is met zijn 'veilige inkomen'.",
      aangemaktOp: daysAgo(35), bijgewerktOp: daysAgo(35), voltooidOp: daysAgo(35),
    },
    // Thomas — Identiteit (1 week geleden)
    {
      id: S.thomas3, userId: ID.thomas,
      thema: "identiteit", themaLabel: "Wie ben ik",
      status: "voltooid",
      stemmingVoor: 6, stemmingNa: 9,
      aiSessieContext: "Thomas (41) heeft inmiddels de stap genomen: hij heeft zijn ontslag ingediend en start over 3 maanden zijn eigen bureau. Deze sessie gaat over wie hij is als hij niet meer zijn functietitel heeft. Er zit zowel opluchting als angst in zijn verhaal. Hij wil weten wie hij is los van wat hij doet.",
      aangemaktOp: daysAgo(7), bijgewerktOp: daysAgo(7), voltooidOp: daysAgo(7),
    },
    // Sophie — Relatie (3 weken geleden)
    {
      id: S.sophie1, userId: ID.sophie,
      thema: "relatie", themaLabel: "Liefde & relatie",
      status: "voltooid",
      stemmingVoor: 4, stemmingNa: 7,
      aiSessieContext: "Sophie (28) is 4 jaar samen met haar vriend maar voelt zich de laatste tijd niet gehoord. Ze omschrijft het als 'langs elkaar heen leven'. Ze heeft het geprobeerd te bespreken maar voelt dat haar vriend het wegspeelt. Ze twijfelt of ze te veel vraagt of dat er echt iets fundamenteels mist. Ze is helder en articulatief, maar vermijdt conflict van nature.",
      aangemaktOp: daysAgo(21), bijgewerktOp: daysAgo(21), voltooidOp: daysAgo(21),
    },
    // Pieter — Kruispunt (8 weken geleden)
    {
      id: S.pieter1, userId: ID.pieter,
      thema: "kruispunt", themaLabel: "Kruispunt",
      status: "voltooid",
      stemmingVoor: 3, stemmingNa: 6,
      aiSessieContext: "Pieter (55) is na een reorganisatie zijn managementfunctie kwijtgeraakt. Hij heeft een outplacementtraject gevolgd maar voelt zich vast zitten. Hij overweegt omscholing maar weet niet waarnaar. Er spelen ook vragen over wat hij echt wil nu zijn kinderen het huis uit zijn. Pieter is voorzichtig en heeft weinig vertrouwen in zijn eigen intuïtie.",
      aangemaktOp: daysAgo(56), bijgewerktOp: daysAgo(56), voltooidOp: daysAgo(56),
    },
    // Pieter — Verbinding (3 weken geleden)
    {
      id: S.pieter2, userId: ID.pieter,
      thema: "verbinding", themaLabel: "Verbinding",
      status: "voltooid",
      stemmingVoor: 4, stemmingNa: 7,
      aiSessieContext: "Pieter (55) is na zijn eerste sessie meer gaan nadenken over zijn sociale omgeving. Hij realiseert zich dat hij jarenlang gefunctioneerd heeft via zijn werk en dat zijn sociale netwerk vrijwel alleen uit werkkontacten bestaat. Nu dat netwerk weg is, voelt hij zich extra alleen. Hij wil nadenken over wat echte verbinding voor hem is.",
      aangemaktOp: daysAgo(21), bijgewerktOp: daysAgo(21), voltooidOp: daysAgo(21),
    },
    // Anna — Verbinding (4 weken geleden)
    {
      id: S.anna1, userId: ID.anna,
      thema: "verbinding", themaLabel: "Verbinding",
      status: "voltooid",
      stemmingVoor: 2, stemmingNa: 6,
      aiSessieContext: "Anna (45) is 3 jaar geleden verhuisd naar een andere stad voor haar werk. Ze heeft nauwelijks nieuwe vriendschappen kunnen opbouwen. Ze heeft een druk leven, maar voelt een diep gevoel van eenzaamheid dat ze moeilijk onder woorden kan brengen. Ze vraagt zich af of ze 'moeilijk te verbinden' is of dat het de omstandigheden zijn. Ze is nieuwsgierig maar kwetsbaar.",
      aangemaktOp: daysAgo(28), bijgewerktOp: daysAgo(28), voltooidOp: daysAgo(28),
    },
    // Jan — Werk & Energie (workshop deelnemer)
    {
      id: S.jan1, userId: ID.jan,
      thema: "werk", themaLabel: "Werk & energie",
      status: "voltooid",
      stemmingVoor: 5, stemmingNa: 7,
      aiSessieContext: "Jan (38) werkt als verpleegkundige en neemt deel aan een teamreflectieworkshop. Hij voelt dat de werkdruk in de zorg hem uitput, maar heeft weinig ruimte om dit bespreekbaar te maken. Hij neemt deel vanuit nieuwsgierigheid.",
      aangemaktOp: daysAgo(12), bijgewerktOp: daysAgo(12), voltooidOp: daysAgo(12),
    },
    // Marieke — Identiteit (workshop deelnemer)
    {
      id: S.marieke1, userId: ID.marieke,
      thema: "identiteit", themaLabel: "Wie ben ik",
      status: "voltooid",
      stemmingVoor: 4, stemmingNa: 8,
      aiSessieContext: "Marieke (52) is teamleider in de zorg. Ze is in een persoonlijke zoektocht na de dood van haar moeder vorig jaar. Ze vraagt zich af wie ze is buiten haar zorgrol — zowel professioneel als privé.",
      aangemaktOp: daysAgo(12), bijgewerktOp: daysAgo(12), voltooidOp: daysAgo(12),
    },
  ]).onConflictDoNothing();

  console.log("   ✓ 11 sessies\n");

  // ── 3. Fases ─────────────────────────────────────────────────────────────────
  console.log("🔨  Fases aanmaken…");

  // Helper om fases als blok in te voegen
  const fasesData = [

    // ── Emma sessie 1: Werk & Energie ──
    {
      sessieId: S.emma1, faseNummer: 1,
      faseTitel: "Hoe het voelt",
      vraag: "Bouw een dag op je werk — zet neer wat energie opvreet en wat energie geeft. Gebruik positie, grootte en afstand.",
      gebruikersBeschrijving: "Ik bouwde een hoge toren van grijze en bruine blokjes aan de ene kant, en één klein groen blokje helemaal aan de rand. De toren is mijn takenpakket — die groeit maar door. Het groene blokje is het ene moment in de week dat ik echt contact maak met een cliënt.",
      aiReflectie: "De toren neemt bijna de hele ruimte in. Het groene blokje staat aan de uiterste rand — niet geïntegreerd, maar ook niet weggegooid. Er zit spanning in die afstand: het waardevolle staat precies buiten bereik van het zware.",
      aiVervolgvraag: "Wat zou er gebeuren als je het groene blokje dichter bij zette — of er meer van maakte?",
      gebruikersAntwoord: "Dan zou ik weten waarom ik dit werk doe. Nu vergeet ik dat bijna.",
      voltooid: true, aangemaktOp: daysAgo(42),
    },
    {
      sessieId: S.emma1, faseNummer: 2,
      faseTitel: "Hoe het zou kunnen zijn",
      vraag: "Bouw de werkdag die jou 's avonds tevreden naar huis stuurt. Wat is er anders dan nu?",
      gebruikersBeschrijving: "Ik bouwde een cirkelvorm — geen begin en geen einde. Een paar blokjes staan rechtop, maar er zijn ook platte stenen die als rust- of overgangsplekken voelen. Er is ruimte in het midden.",
      aiReflectie: "De cirkel heeft geen hiërarchie — niets is urgenter dan iets anders. Het midden is opvallend leeg, maar niet leeg als 'ontbrekend'. Eerder als: er ís ruimte. De rechtopstaande blokjes staan in verhouding tot de rust.",
      aiVervolgvraag: "Wat is dat lege midden voor jou — wat mag daar zijn?",
      gebruikersAntwoord: "Stilte. Gewoon even niks moeten.",
      voltooid: true, aangemaktOp: daysAgo(42),
    },
    {
      sessieId: S.emma1, faseNummer: 3,
      faseTitel: "Wat jou energie geeft",
      vraag: "Bouw de mensen, condities of krachten die je nodig hebt om daar te komen.",
      gebruikersBeschrijving: "Ik bouwde drie figuren om mij heen. Eentje die naast mij staat (collega), eentje iets verder weg die me aanmoedigt (vriend), en één die ik van mij afduw — dat is de neiging om altijd 'ja' te zeggen.",
      aiReflectie: "Twee figuren zijn steun — maar de derde is al aanwezig en wordt actief weggeduwd. Dat 'wegduwen' staat al in de constructie. Je hebt hem al herkend en hem ook een plek gegeven.",
      aiVervolgvraag: "Die figuur die je wegduwt — heeft die ook een naam, of een moment dat hij opduikt?",
      gebruikersAntwoord: "Hij heet 'maar ze hebben me nodig'. En hij komt altijd op vrijdagmiddag.",
      voltooid: true, aangemaktOp: daysAgo(42),
    },

    // ── Emma sessie 2: Identiteit ──
    {
      sessieId: S.emma2, faseNummer: 1,
      faseTitel: "Wie je nu bent",
      vraag: "Bouw jezelf — alle kanten die je laat zien én de kanten die je verbergt.",
      gebruikersBeschrijving: "Ik bouwde een figuur met een groot schild aan de voorkant — kleurrijk en solide. Aan de achterkant hangen losse steentjes die bijna vallen. Die achterkant laat ik niemand zien.",
      aiReflectie: "De voorkant is stevig en verzorgd — er is duidelijk geïnvesteerd in hoe je verschijnt. Maar die losse steentjes achter: ze hangen er niet los bij als iets beschamends. Ze zijn verbonden. Ze horen bij de constructie, ook al zie je ze alleen van achteren.",
      aiVervolgvraag: "Welke van die losse steentjes zou je het liefst aan de voorkant willen laten zien?",
      gebruikersAntwoord: "Mijn twijfel. Dat ik het ook niet altijd weet. Maar ik ben bang dat mensen me dan minder serieus nemen.",
      voltooid: true, aangemaktOp: daysAgo(14),
    },
    {
      sessieId: S.emma2, faseNummer: 2,
      faseTitel: "Wie je wil zijn",
      vraag: "Bouw de versie van jou die je wil zijn.",
      gebruikersBeschrijving: "Die figuur heeft geen schild. Ze staat rechtop, met open armen. Er zijn kleine blokjes naast haar — die staan voor dingen die ze zelf doet, niet voor anderen.",
      aiReflectie: "De open armen zijn veelzeggend: niet uitgestoken om te helpen, maar gewoon open. Er is evenwicht in de houding — niets hangt over. Die kleine blokjes naast haar vallen op: ze staan er, maar ze definiëren haar niet.",
      aiVervolgvraag: "Wat zou er moeten veranderen zodat die figuur jij kunt zijn — al is het maar voor één ochtend?",
      gebruikersAntwoord: "Dat ik ophoud met bewijzen dat ik het waard ben. Dat ik gewoon mag zijn.",
      voltooid: true, aangemaktOp: daysAgo(14),
    },
    {
      sessieId: S.emma2, faseNummer: 3,
      faseTitel: "Wat je al in je hebt",
      vraag: "Bouw wat je al in je hebt, en wat je nog nodig hebt om die persoon te zijn.",
      gebruikersBeschrijving: "Ik bouwde twee stapels naast elkaar. De linker is hoog en stevig — dat is wat ik al heb: wilskracht, warmte, doorzettingsvermogen. De rechter is klein maar heeft een mooie kleur — dat is wat ik nog nodig heb: rust en zelfvertrouwen.",
      aiReflectie: "De linker stapel is imposant — niet als last, maar als fundament. De rechter is klein maar strak: er zit geen rommel in. Wat opvalt: de kleuren van de rechter stapel zijn ook terug te vinden in de linker. Het is niet iets wat ontbreekt. Het zit er al in.",
      aiVervolgvraag: "Als je een steen van de linker stapel op de rechter legt — welke zou dat zijn?",
      gebruikersAntwoord: "Moed. Die heb ik al bewezen. Ik moet hem alleen voor mezelf gebruiken, niet alleen voor anderen.",
      voltooid: true, aangemaktOp: daysAgo(14),
    },

    // ── Thomas sessie 1: Kruispunt ──
    {
      sessieId: S.thomas1, faseNummer: 1,
      faseTitel: "Waar je nu staat",
      vraag: "Bouw het kruispunt waar je staat — alle richtingen, alle opties, de verwarring.",
      gebruikersBeschrijving: "Ik bouwde een figuur midden op een kruis van wegen. Drie wegen gaan weg — maar ik heb ze alle drie afgesloten met een muur. Ik sta er midden in maar beweeg niet.",
      aiReflectie: "De muren zijn niet van buitenaf geplaatst — jij hebt ze gebouwd. Dat is precies de spanning: de blokkades komen van binnen. De figuur staat er niet hulpeloos bij; hij staat er midden in, rechtop.",
      aiVervolgvraag: "Welke muur voelt het meest als die van jezelf — en welke voelt als die van anderen?",
      gebruikersAntwoord: "De muur naar rechts — de weg van mijn eigen bureau — heb ik zelf gebouwd. De muren naar links en naar achteren voelen als wat mijn ouders en 'de maatschappij' van me verwachten.",
      voltooid: true, aangemaktOp: daysAgo(70),
    },
    {
      sessieId: S.thomas1, faseNummer: 2,
      faseTitel: "Waar je naartoe wil",
      vraag: "Bouw de weg die jou het meest aanspreekt — hoe die eruit ziet als je hem op gaat.",
      gebruikersBeschrijving: "Ik bouwde een lange smalle weg met aan het begin een brug. Die brug is onzeker — maar daarna is de weg breed en heeft hij kleur. Er staat één figuur op de weg: ik, alleen.",
      aiReflectie: "De brug is smal en staat er niet stabiel bij — maar hij staat. Daarna wordt de weg breder en kleurrijker. Dat is een keuze die je hebt gemaakt in de constructie: je hebt die brug niet weggelaten. Je hebt hem onzeker neergezet, maar aanwezig.",
      aiVervolgvraag: "Wat zou de brug iets stabieler maken — in het echt?",
      gebruikersAntwoord: "Drie klanten hebben al gezegd dat ze met mij willen werken als ik start. Dat is eigenlijk al een fundament.",
      voltooid: true, aangemaktOp: daysAgo(70),
    },
    {
      sessieId: S.thomas1, faseNummer: 3,
      faseTitel: "Wat jou vrij maakt",
      vraag: "Bouw wat jou vrij maakt om die keuze te maken.",
      gebruikersBeschrijving: "Ik bouwde een sleutel. Eén groot rood blokje met een lange steel. Vrijheid zit voor mij in één beslissing — niet in een proces.",
      aiReflectie: "De sleutel is groot en direct. Geen omwegen, geen trapjes. Eén beweging. Opvallend: je hebt hem rood gemaakt. Rood is niet voorzichtig.",
      aiVervolgvraag: "Wanneer zet je de sleutel in het slot?",
      gebruikersAntwoord: "Als mijn vrouw het ook voelt. Ze zegt dat ze het steunt, maar ik wil het in haar ogen zien.",
      voltooid: true, aangemaktOp: daysAgo(70),
    },

    // ── Thomas sessie 2: Werk & Energie ──
    {
      sessieId: S.thomas2, faseNummer: 1,
      faseTitel: "Hoe het voelt",
      vraag: "Bouw een dag op je werk — zet neer wat energie opvreet en wat energie geeft.",
      gebruikersBeschrijving: "De energie-eters zijn een grote grijze muur. Vergaderingen, e-mail, verantwoording. Energie-gevers zijn twee kleine figuren achter de muur — mijn teamleden waarmee ik echt samenwerk.",
      aiReflectie: "De muur staat tussen jou en wat energie geeft. Die twee figuren zijn er — maar ze zijn niet bereikbaar zolang de muur er is. De muur is ook groter dan de figuren.",
      aiVervolgvraag: "Hoe zou de muur er kleiner uit kunnen zien — wat zou er dan veranderen?",
      gebruikersAntwoord: "Als ik stomp kon zeggen wat ik doe en niet deed in documenten. De verantwoording vreet meer dan het werk zelf.",
      voltooid: true, aangemaktOp: daysAgo(35),
    },
    {
      sessieId: S.thomas2, faseNummer: 2,
      faseTitel: "Hoe het zou kunnen zijn",
      vraag: "Bouw de werkdag die jou 's avonds tevreden naar huis stuurt.",
      gebruikersBeschrijving: "Een open tafel met drie mensen eromheen. Ik in het midden. Iedereen kijkt naar hetzelfde punt — een project. Geen muur, geen afscheidingen.",
      aiReflectie: "Jij staat in het midden maar niet als baas — als verbinder. Iedereen kijkt dezelfde kant op. Dat is geen vergadermodel; dat is samen bouwen.",
      aiVervolgvraag: "Wanneer had je voor het laatste zo'n dag?",
      gebruikersAntwoord: "Drie jaar geleden, bij een klein project dat fout liep maar waar we het samen oplosten. Beste week van mijn loopbaan.",
      voltooid: true, aangemaktOp: daysAgo(35),
    },
    {
      sessieId: S.thomas2, faseNummer: 3,
      faseTitel: "Wat jou energie geeft",
      vraag: "Bouw de mensen, condities of krachten die je nodig hebt om daar te komen.",
      gebruikersBeschrijving: "Ik bouwde een startknop. Een grote oranje knop op een sokkel. Dat is wat ik nodig heb: de daad bij het woord voegen.",
      aiReflectie: "De knop staat op een sokkel — hij is verheven, zichtbaar. Hij wacht niet, hij staat klaar. Er is geen hand bij die hem indrukt. Dat is de enige ontbrekende schakel.",
      aiVervolgvraag: "Welke datum zet je op die knop?",
      gebruikersAntwoord: "1 september. Dan loopt mijn contract af.",
      voltooid: true, aangemaktOp: daysAgo(35),
    },

    // ── Thomas sessie 3: Identiteit ──
    {
      sessieId: S.thomas3, faseNummer: 1,
      faseTitel: "Wie je nu bent",
      vraag: "Bouw jezelf — alle kanten die je laat zien én de kanten die je verbergt.",
      gebruikersBeschrijving: "Ik bouwde een figuur in pak. Maar zonder hoofd. Het hoofd staat naast de figuur — los.",
      aiReflectie: "De figuur in pak is volledig en herkenbaar. Maar het hoofd staat er naast — het maakt geen deel uit van de constructie. Dat is niet chaotisch; dat is precies.",
      aiVervolgvraag: "Wanneer zit het hoofd wél op de figuur?",
      gebruikersAntwoord: "Als ik aan het bouwen ben. Of aan het fietsen. Of als ik met mijn dochter speel. Dan ben ik er echt.",
      voltooid: true, aangemaktOp: daysAgo(7),
    },
    {
      sessieId: S.thomas3, faseNummer: 2,
      faseTitel: "Wie je wil zijn",
      vraag: "Bouw de versie van jou die je wil zijn.",
      gebruikersBeschrijving: "Geen pak. Een figuur in beweging — alsof hij loopt. En het hoofd zit er op. Aan zijn hand een klein figuurtje — mijn dochter.",
      aiReflectie: "De beweging is ingebouwd in de houding. Het hoofd zit er op — er is eenheid. En er is een tweede figuur: niet als last of verplichting, maar als verbinding. Klein, maar aanwezig.",
      aiVervolgvraag: "Wat verlies je als je het pak uittrekt?",
      gebruikersAntwoord: "De zekerheid van wat mensen van me verwachten. Maar eerlijk? Ik ben dat al jaren moe.",
      voltooid: true, aangemaktOp: daysAgo(7),
    },
    {
      sessieId: S.thomas3, faseNummer: 3,
      faseTitel: "Wat je al in je hebt",
      vraag: "Bouw wat je al in je hebt, en wat je nog nodig hebt om die persoon te zijn.",
      gebruikersBeschrijving: "Een stevig fundament van gekleurde blokken. Ervaring, analytisch denken, doorzettingsvermogen. Bovenop een kleine brug — dat is vertrouwen in het onbekende. Dat heb ik nog maar half.",
      aiReflectie: "Het fundament is breed en gemengd van kleur — rijkdom aan materiaal. De brug bovenop is klein maar hij staat er al. Hij is niet afwezig; hij is begonnen.",
      aiVervolgvraag: "Wat heeft die brug nodig om af te zijn?",
      gebruikersAntwoord: "Één stap erop zetten. En ontdekken dat hij niet inzakt.",
      voltooid: true, aangemaktOp: daysAgo(7),
    },

    // ── Sophie sessie 1: Relatie ──
    {
      sessieId: S.sophie1, faseNummer: 1,
      faseTitel: "Hoe jullie er nu voor staan",
      vraag: "Bouw hoe jij en de ander nu staan — de afstand, de richting, wie de meeste ruimte inneemt.",
      gebruikersBeschrijving: "Twee figuren. Ik klein en kijkend naar hem. Hij groot en kijkend naar de horizon. Er zit een kloof tussen ons — letterlijk een lege ruimte.",
      aiReflectie: "De kloof is niet gevuld met iets negatiefs — hij is gewoon leeg. Jij kijkt naar hem; hij kijkt niet terug. Maar hij staat er nog. De constructie is geen breuk.",
      aiVervolgvraag: "Wat zou er nodig zijn om de kloof te overbruggen — van jouw kant?",
      gebruikersAntwoord: "Dat ik ophoud met wachten tot hij het zelf ziet. Ik moet het benoemen.",
      voltooid: true, aangemaktOp: daysAgo(21),
    },
    {
      sessieId: S.sophie1, faseNummer: 2,
      faseTitel: "Hoe je het wil voelen",
      vraag: "Bouw hoe je wilt dat jullie staan. Wat is er anders?",
      gebruikersBeschrijving: "Beide figuren even groot. Naast elkaar. Kijkend naar hetzelfde punt — iets in de toekomst. Er is geen kloof. Er is ook een derde element: een gezamenlijk bouwsel tussen hen in.",
      aiReflectie: "De grootte is gelijk — dat is de meest fundamentele verschuiving. Het gezamenlijke bouwsel is nieuw: iets wat jullie samen maken, geen van beiden alleen. En ze kijken samen naar iets buiten henzelf.",
      aiVervolgvraag: "Wat is dat bouwsel tussen jullie — wat zouden jullie samen bouwen als alles klopte?",
      gebruikersAntwoord: "Een leven buiten de stad. We hebben het er vroeger over gehad maar het onderwerp is weggegleden.",
      voltooid: true, aangemaktOp: daysAgo(21),
    },
    {
      sessieId: S.sophie1, faseNummer: 3,
      faseTitel: "Wat de verbinding herstelt",
      vraag: "Bouw wat er tussen jullie nodig is — wat er nu ontbreekt, of wat er te veel is.",
      gebruikersBeschrijving: "Een brug van woorden — letterlijk kleine blokjes die een verbinding vormen. Maar er is ook een te grote steen die ik eraf heb gehaald: mijn neiging om het te sussen in plaats van te zeggen.",
      aiReflectie: "Je hebt iets weggehaald — dat is zeldzaam in een bouwsessie. De steen die je eraf haalde staat er nog naast: hij is zichtbaar, niet verdwenen. De brug is smaller geworden maar ook directer.",
      aiVervolgvraag: "Wanneer zeg je het — en hoe begin je de zin?",
      gebruikersAntwoord: "Vanavond. 'Ik mis jou.'",
      voltooid: true, aangemaktOp: daysAgo(21),
    },

    // ── Pieter sessie 1: Kruispunt ──
    {
      sessieId: S.pieter1, faseNummer: 1,
      faseTitel: "Waar je nu staat",
      vraag: "Bouw het kruispunt waar je staat — alle richtingen, alle opties, de verwarring.",
      gebruikersBeschrijving: "Een cirkel van stenen. Ik sta in het midden maar alle stenen kijken naar buiten — weg van mij. Er is geen duidelijke richting.",
      aiReflectie: "De cirkel keert zich af — niet agressief, maar richtingloos. Toch sta je in het centrum. Je bent er. Midden in de verwarring maar niet omgevallen.",
      aiVervolgvraag: "Als één steen zich omdraait en naar jou kijkt — welke zou dat zijn?",
      gebruikersAntwoord: "De steen die mijn interesse in onderwijs voorstelt. Ik heb altijd iets met leren gehad.",
      voltooid: true, aangemaktOp: daysAgo(56),
    },
    {
      sessieId: S.pieter1, faseNummer: 2,
      faseTitel: "Waar je naartoe wil",
      vraag: "Bouw de weg die jou het meest aanspreekt.",
      gebruikersBeschrijving: "Een weg die begint smal maar breder wordt. Er zijn groenblauwe blokken langs de kant — dat zijn mensen die helpen.",
      aiReflectie: "De verbreding zit ingebouwd in de richting. Je hebt die mensen langs de kant gezet — niet ervoor of ertegen. Ze begeleiden.",
      aiVervolgvraag: "Wie is de eerste persoon langs die weg in het echt?",
      gebruikersAntwoord: "Mijn oud-collega Henk. Die is trainer geworden en heeft me al eens uitgenodigd voor een gesprek.",
      voltooid: true, aangemaktOp: daysAgo(56),
    },
    {
      sessieId: S.pieter1, faseNummer: 3,
      faseTitel: "Wat jou vrij maakt",
      vraag: "Bouw wat jou vrij maakt om die keuze te maken.",
      gebruikersBeschrijving: "Ik bouwde een spiegel. Een platte lichte steen rechtop. Vrijheid zit voor mij in mezelf durven zien.",
      aiReflectie: "De spiegel is leeg — er staat geen figuur in. Maar hij staat er. Oprecht en rechtop. Niet weggekeken.",
      aiVervolgvraag: "Wat zie je als je nu in de spiegel kijkt?",
      gebruikersAntwoord: "Iemand die meer weet dan hij denkt, maar het zichzelf moeilijk maakt om dat te geloven.",
      voltooid: true, aangemaktOp: daysAgo(56),
    },

    // ── Pieter sessie 2: Verbinding ──
    {
      sessieId: S.pieter2, faseNummer: 1,
      faseTitel: "Hoe jouw wereld er nu uitziet",
      vraag: "Bouw jouw wereld van mensen — wie staat echt dichtbij, wie is ver weg, wie ontbreekt?",
      gebruikersBeschrijving: "Ik in het midden. Mijn vrouw vlakbij. Dan een grote lege vlakte. Aan de rand staan een paar figuren — oud-collega's — maar ze staan met hun rug naar mij toe.",
      aiReflectie: "De lege vlakte is het meest aanwezig. Je hebt hem niet gevuld met iets opzettelijks — hij is er gewoon. De oud-collega's staan er nog, maar de ruggen zeggen iets over richting: ze zijn nog niet weg, maar ook niet aanwezig.",
      aiVervolgvraag: "Wie van die figuren aan de rand zou je het meest willen omdraaien?",
      gebruikersAntwoord: "Henk. We hebben te lang niets van elkaar gehoord.",
      voltooid: true, aangemaktOp: daysAgo(21),
    },
    {
      sessieId: S.pieter2, faseNummer: 2,
      faseTitel: "Hoe je die wereld wil",
      vraag: "Bouw hoe je die wereld wil hebben. Wie staat er dan bij je?",
      gebruikersBeschrijving: "Er zijn nu meer figuren rondom mij. Ze staan er niet dicht op, maar ze staan wél naar mij toe gekeerd. Er is ook een nieuw figuur — iemand die ik nog niet ken.",
      aiReflectie: "De afstand is bewaard — niet iedereen staat dicht op jou, en dat is een bewuste keuze. De nieuwe figuur is betekenisvol: je hebt ruimte gelaten voor iemand die er nog niet is.",
      aiVervolgvraag: "Wie zou die nieuwe figuur kunnen zijn?",
      gebruikersAntwoord: "Iemand vanuit een nieuwe context. Een cursus misschien, of iemand via Henk.",
      voltooid: true, aangemaktOp: daysAgo(21),
    },
    {
      sessieId: S.pieter2, faseNummer: 3,
      faseTitel: "Wat jou naar mensen trekt",
      vraag: "Bouw wat jou naar mensen toetrekt — of wat jou nu tegenhoudt.",
      gebruikersBeschrijving: "Twee dingen naast elkaar. Links: een anker — wat me tegenhoudt. Ik voel me snel een last voor anderen. Rechts: een vlam — wat me trekt. Gesprekken die echt ergens over gaan.",
      aiReflectie: "Het anker en de vlam staan naast elkaar — geen van beide domineert. Maar de vlam heeft kleur. Het anker is grijs. Dat is een keuze die je gemaakt hebt in het bouwen.",
      aiVervolgvraag: "Wat zou je nodig hebben om het anker even los te laten — niet weg te gooien, maar los?",
      gebruikersAntwoord: "Eén goed gesprek. Als bewijs dat ik geen last ben.",
      voltooid: true, aangemaktOp: daysAgo(21),
    },

    // ── Anna sessie 1: Verbinding ──
    {
      sessieId: S.anna1, faseNummer: 1,
      faseTitel: "Hoe jouw wereld er nu uitziet",
      vraag: "Bouw jouw wereld van mensen — wie staat echt dichtbij, wie is ver weg, wie ontbreekt?",
      gebruikersBeschrijving: "Een figuur midden op een groot leeg vlak. Aan de horizon kleine stipjes — dat zijn vrienden en familie, ver weg. Er zijn geen figuren dichtbij.",
      aiReflectie: "De leegte is groot en concreet in de constructie. De stipjes aan de horizon zijn er — ze zijn niet verdwenen, maar de afstand is reëel. Jij staat midden op het vlak: niet aan de rand, maar ook niet beschut.",
      aiVervolgvraag: "Wat staat er tussen jou en die stipjes?",
      gebruikersAntwoord: "Afstand, maar ook mezelf. Ik wacht tot iemand naar mij toekomt.",
      voltooid: true, aangemaktOp: daysAgo(28),
    },
    {
      sessieId: S.anna1, faseNummer: 2,
      faseTitel: "Hoe je die wereld wil",
      vraag: "Bouw hoe je die wereld wil hebben. Wie staat er dan bij je?",
      gebruikersBeschrijving: "Er staan nu twee figuren dichtbij. Geen grote groep — dat voelt onecht. Maar twee mensen die ik echt ken. Er is ook iets kleins in het midden: een tafel. Wij rondom.",
      aiReflectie: "De schaal is intiem — twee figuren, een tafel. Dat is geen verlangen naar veel; dat is verlangen naar diepte. De tafel is het middelpunt: er is iets om te doen samen, iets om naartoe te zitten.",
      aiVervolgvraag: "Wie zijn die twee figuren — bestaan ze al?",
      gebruikersAntwoord: "Eentje wel — mijn collega Roos. De ander bestaat nog niet. Maar ik wil haar vinden.",
      voltooid: true, aangemaktOp: daysAgo(28),
    },
    {
      sessieId: S.anna1, faseNummer: 3,
      faseTitel: "Wat jou naar mensen trekt",
      vraag: "Bouw wat jou naar mensen toetrekt — of wat jou nu tegenhoudt.",
      gebruikersBeschrijving: "Ik bouwde een deur. Niet open, niet dicht — op een kier. Achter de deur is licht. Ik sta er vlak voor, hand aan de klink.",
      aiReflectie: "De hand zit al aan de klink. Dat is de constructie die je gemaakt hebt. De deur is niet op slot; hij staat op een kier. Het licht is er al — het lekt naar buiten.",
      aiVervolgvraag: "Wat weerhoudt je ervan de deur verder open te duwen?",
      gebruikersAntwoord: "Dat niemand er blij mee is als ik binnenkom. Dat ik te laat ben, of te anders.",
      voltooid: true, aangemaktOp: daysAgo(28),
    },

    // ── Jan sessie 1: Werk & Energie ──
    {
      sessieId: S.jan1, faseNummer: 1,
      faseTitel: "Hoe het voelt",
      vraag: "Bouw een dag op je werk — zet neer wat energie opvreet en wat energie geeft.",
      gebruikersBeschrijving: "Een grote hoop kleurloze stenen voor de werkdruk. Eén helder geel blokje: het moment dat een patiënt zegt 'dank je wel'.",
      aiReflectie: "De verhouding is overweldigend — één geel blokje tegen de hoop. Maar die gele steen staat er los van: hij raakt de hoop niet. Dat is ook een keuze.",
      aiVervolgvraag: "Hoe vaak per week heb je zo'n geel moment?",
      gebruikersAntwoord: "Eerlijk? Elke dag wel. Maar ik vergeet het meteen weer.",
      voltooid: true, aangemaktOp: daysAgo(12),
    },
    {
      sessieId: S.jan1, faseNummer: 2,
      faseTitel: "Hoe het zou kunnen zijn",
      vraag: "Bouw de werkdag die jou 's avonds tevreden naar huis stuurt.",
      gebruikersBeschrijving: "Minder stenen maar ze zijn geordend. En er zijn meer gele blokjes — niet meer dan de grijze, maar zichtbaarder.",
      aiReflectie: "De orde is ingebracht door herschikking, niet door weggooien. De gele blokjes zijn niet meer in aantal maar zijn zichtbaarder — dat is een verschil in aandacht, niet in hoeveelheid.",
      aiVervolgvraag: "Wat zou er anders moeten zijn om die gele blokjes meer op te merken?",
      gebruikersAntwoord: "Minder ruis. Minder formulieren na een dienst.",
      voltooid: true, aangemaktOp: daysAgo(12),
    },
    {
      sessieId: S.jan1, faseNummer: 3,
      faseTitel: "Wat jou energie geeft",
      vraag: "Bouw de mensen, condities of krachten die je nodig hebt.",
      gebruikersBeschrijving: "Mijn team als cirkel om mij heen. Niet hiërarchisch — gewoon samen. En ruimte aan het einde van een dienst om even stil te staan.",
      aiReflectie: "De cirkel is gelijkwaardig — er is geen hoofd. Ruimte aan het einde staat er letterlijk als lege ruimte in de constructie: je hebt hem niet gevuld.",
      aiVervolgvraag: "Bestaat die ruimte al ergens in je week?",
      gebruikersAntwoord: "Nee. Maar ik ga hem maken.",
      voltooid: true, aangemaktOp: daysAgo(12),
    },

    // ── Marieke sessie 1: Identiteit ──
    {
      sessieId: S.marieke1, faseNummer: 1,
      faseTitel: "Wie je nu bent",
      vraag: "Bouw jezelf — alle kanten die je laat zien én de kanten die je verbergt.",
      gebruikersBeschrijving: "Een figuur in twee lagen. De bovenste laag is strak en geordend — teamleider. De onderste laag is wanordelijk en breekbaar. Die verberg ik.",
      aiReflectie: "De onderste laag draagt de bovenste. Ze is chaotischer maar hij is ook het fundament — zonder hem valt de geordende laag om. Dat is geen zwakte in de constructie.",
      aiVervolgvraag: "Welk deel van die onderste laag is het allermoeilijkst te laten zien?",
      gebruikersAntwoord: "Hoe erg ik mijn moeder mis. Ik ben teamleider van een team en mag niet wankelen.",
      voltooid: true, aangemaktOp: daysAgo(12),
    },
    {
      sessieId: S.marieke1, faseNummer: 2,
      faseTitel: "Wie je wil zijn",
      vraag: "Bouw de versie van jou die je wil zijn.",
      gebruikersBeschrijving: "Dezelfde twee lagen, maar ze zijn vermengd. Niet chaotisch — verweven. Er zijn ook bloemen. Die staan voor levensplezier dat ik al lang niet meer heb gehad.",
      aiReflectie: "Het vermengen is een bewuste daad — je hebt de scheiding opgeheven. De bloemen zijn er niet als decoratie: ze staan er rechtop, even hoog als de rest. Ze zijn gelijkwaardig.",
      aiVervolgvraag: "Wanneer heb je voor het laatste bloemen in je leven laten staan?",
      gebruikersAntwoord: "Mijn moeder had altijd bloemen in huis. Na haar dood heb ik ze weggelaten.",
      voltooid: true, aangemaktOp: daysAgo(12),
    },
    {
      sessieId: S.marieke1, faseNummer: 3,
      faseTitel: "Wat je al in je hebt",
      vraag: "Bouw wat je al in je hebt, en wat je nog nodig hebt.",
      gebruikersBeschrijving: "Twee stapels. Eén hoge: sterkte, loyaliteit, doorzettingsvermogen. Die zijn van mij. Eén kleine, kleurrijke: zachtheid voor mezelf. Dat heb ik nodig.",
      aiReflectie: "De kleine stapel is niet weg — hij is kleurrijker dan de hoge. Zachtheid staat er niet als iets kleins en beschamends, maar als iets levendigs. Het wacht er gewoon nog op.",
      aiVervolgvraag: "Hoe zou je één moment van zachtheid voor jezelf er deze week uit kunnen laten zien?",
      gebruikersAntwoord: "Bloemen kopen. Voor mezelf.",
      voltooid: true, aangemaktOp: daysAgo(12),
    },
  ];

  for (const fase of fasesData) {
    await db.insert(schema.fases).values(fase).onConflictDoNothing();
  }

  console.log(`   ✓ ${fasesData.length} fases\n`);

  // ── 4. Rapporten ─────────────────────────────────────────────────────────────
  console.log("📄  Rapporten aanmaken…");

  await db.insert(schema.rapporten).values([
    {
      sessieId: S.emma1,
      samenvattingTekst: "Emma's sessie laat een helder patroon zien: de last is tastbaar en precies benoemd. In het midden verschijnt ruimte — ze weet hoe het anders kan voelen. En in de derde fase staat de figuur die haar tegenhoudt er al — met een naam en een tijdstip. Dat is geen probleem meer dat ontdekt moet worden; het is al zichtbaar gemaakt.",
      inzichten: JSON.stringify([
        "In elke fase draait het om ruimte: wanneer die er niet is, wanneer die er wél kan zijn, en wat haar ervan weerhoudt die te nemen.",
        "De blokkade heeft een naam en een patroon: 'maar ze hebben me nodig' verschijnt elke vrijdagmiddag.",
        "Het groene blokje — het contact met de cliënt — is haar eigenlijke reden om dit werk te doen. Het is er al, maar staat te ver weg.",
      ]),
      eersteStap: "Zet vrijdagmiddag voor de komende twee weken een alarm: 'nee oefenen'. Niet vanuit verplichting, maar om te ontdekken hoe het voelt.",
      aangemaktOp: daysAgo(42),
    },
    {
      sessieId: S.emma2,
      samenvattingTekst: "Emma heeft in deze sessie de overstap gemaakt van het probleem (werkstress) naar de vraag erachter: wie is ze? Het schild dat ze draagt is niet vals — het is echt en sterk. Maar de achterkant, de twijfel, wil naar voren. De moed die ze voor anderen inzet, mag ze nu voor zichzelf gebruiken.",
      inzichten: JSON.stringify([
        "In elke fase keert het thema terug: Emma laat anderen de voorkant zien, maar verbergt wat haar menselijker maakt.",
        "De eigenschappen die ze nodig heeft — rust en zelfvertrouwen — zitten al verborgen in het fundament dat ze heeft opgebouwd.",
        "Moed is voor Emma geen abstractie; het is iets dat ze al bezit. Het vraagt om een nieuwe richting: naar binnen, niet naar buiten.",
      ]),
      eersteStap: "Deel deze week één twijfel met iemand die je vertrouwt — niet als zwakte, maar als experiment. Kijk wat er dan gebeurt.",
      aangemaktOp: daysAgo(14),
    },
    {
      sessieId: S.thomas1,
      samenvattingTekst: "Thomas staat op een kruispunt dat hij zelf herkenbaar heeft gemaakt: de muren zijn van hemzelf. De weg naar het eigen bureau is concreet — er zijn al klanten, er is al een fundament. De sleutel is groot en rood: geen aarzeling in het beeld, alleen in het moment.",
      inzichten: JSON.stringify([
        "In elke fase bouwde Thomas de blokkade zelf — en herkende hem ook zelf. Dat is een cruciaal onderscheid.",
        "Er zijn al drie klanten die hem willen — de brug is smaler dan hij voelt, maar staat al.",
        "Zijn vrouw is de doorslaggevende factor: niet als obstakel, maar als barometer van zijn eigen zekerheid.",
      ]),
      eersteStap: "Spreek vanavond met je vrouw over de datum van 1 september. Niet om overtuiging te zoeken, maar om het hardop te zeggen.",
      aangemaktOp: daysAgo(70),
    },
    {
      sessieId: S.thomas2,
      samenvattingTekst: "Thomas heeft een datum gezet. De knop staat klaar. Wat deze sessie toevoegt: hij weet nu ook welk type werk hem energie geeft — klein, direct, samen. Dat is het kompas voor zijn bureau.",
      inzichten: JSON.stringify([
        "In elke fase keerde hetzelfde beeld terug: Thomas heeft energie van klein en echt, niet van groot en formeel.",
        "De muur van verantwoording en vergaderingen is niet het werk — het is de verpakking om het werk. Die verpakking valt weg als hij voor zichzelf werkt.",
        "De beste week van zijn loopbaan was er al: drie jaar geleden, bij een klein project. Hij hoeft niet iets nieuws te uitvinden.",
      ]),
      eersteStap: "Schrijf de drie kernprincipes op voor jouw bureau — gebaseerd op die beste week. Dat wordt je koers.",
      aangemaktOp: daysAgo(35),
    },
    {
      sessieId: S.thomas3,
      samenvattingTekst: "Thomas heeft de stap gezet. Deze sessie gaat over wie hij is als de functietitel verdwenen is. Het antwoord dat hij bouwt is helder: iemand in beweging, met zijn hoofd op z'n plek, hand in hand met zijn dochter. Dat is de kern.",
      inzichten: JSON.stringify([
        "In elke fase verdween het pak — en verscheen er iets echters: beweging, verbinding, aanwezigheid.",
        "Zijn identiteit zit niet in wat hij doet maar in hoe hij aanwezig is: met zijn hoofd erop, bij de mensen die hem echt kennen.",
        "De brug naar het nieuwe is niet af, maar hij staat er al — en één stap erop zetten is genoeg om te ontdekken dat hij stevig is.",
      ]),
      eersteStap: "Plan deze week een dag zonder agenda met je dochter. Niet als beloning achteraf, maar als bewijs dat jij er al bent.",
      aangemaktOp: daysAgo(7),
    },
    {
      sessieId: S.sophie1,
      samenvattingTekst: "Sophie weet wat ze wil — ze wil gezien worden en ze wil samen bouwen. Ze heeft het al benoemd, en in de derde fase heeft ze de zin al klaar: 'Ik mis jou.' Dat is geen conclusie van de sessie; dat is een actie die al klaarstaat.",
      inzichten: JSON.stringify([
        "In elke fase verscheen hetzelfde verlangen: gelijkwaardigheid, een gezamenlijk perspectief, iets om samen naar toe te werken.",
        "Sophie sust eerder dan dat ze spreekt — dat patroon is haar bewust geworden. De steen die ze uit de constructie haalde zegt alles.",
        "Het verlangen naar een leven buiten de stad is al eerder besproken; het is niet verdwenen, alleen weggegleden. Het is er nog.",
      ]),
      eersteStap: "Zeg vanavond 'Ik mis jou' — en laat de stilte daarna gewoon bestaan.",
      aangemaktOp: daysAgo(21),
    },
    {
      sessieId: S.pieter1,
      samenvattingTekst: "Pieter heeft ontdekt dat er één richting is die al zijn aandacht trekt: onderwijs, leren, begeleiden. En er is een concrete persoon: Henk. De spiegel die hij bouwde laat iemand zien die meer weet dan hij gelooft. Dat klopt.",
      inzichten: JSON.stringify([
        "In elke fase keerde het thema onderwijs en begeleiding terug — als wens, als weg en als vrijheid.",
        "De blokkade zit niet in de omstandigheden maar in zijn vertrouwen in zijn eigen oordeel.",
        "Henk is al een opening: de uitnodiging is er, alleen de stap nog niet.",
      ]),
      eersteStap: "Bel Henk deze week. Niet om een antwoord te hebben, maar om het gesprek te starten.",
      aangemaktOp: daysAgo(56),
    },
    {
      sessieId: S.pieter2,
      samenvattingTekst: "Pieter heeft ontdekt dat eenzaamheid voor hem niet gaat over aantallen maar over echtheid. Hij wil geen grote groep; hij wil diepgang. En hij weet wat hem tegenhoudt: de gedachte dat hij een last is. Dat anker heeft hij benoemd en naast de vlam gezet.",
      inzichten: JSON.stringify([
        "In elke fase draaide het om kwaliteit van verbinding, niet kwantiteit. Twee echte figuren en een tafel zijn genoeg.",
        "Het anker — 'ik ben een last' — is benoemd en zichtbaar gemaakt. Dat is de eerste stap naar loslaten.",
        "Eén goed gesprek met Henk kan als tegenbewijs dienen. De verwachting is niet te groot — de stap is concreet.",
      ]),
      eersteStap: "Stuur Henk vandaag een appje. Eén zin is genoeg: 'Ik wil graag een keer afspreken.'",
      aangemaktOp: daysAgo(21),
    },
    {
      sessieId: S.anna1,
      samenvattingTekst: "Anna staat met haar hand aan de klink. De deur staat al op een kier. Ze wacht niet meer op iemand anders — ze wacht op het bewijs dat ze welkom is. Roos bestaat al. Dat is genoeg voor nu.",
      inzichten: JSON.stringify([
        "In elke fase verscheen de leegte niet als verdwijning maar als open ruimte die wacht op iemand die een stap zet.",
        "Anna wacht op toestemming — maar de hand zit al aan de klink. Ze heeft die al gegeven.",
        "Roos is de eerste echte figuur: ze bestaat al. De tweede figuur — degene die ze nog wil vinden — heeft ruimte gekregen.",
      ]),
      eersteStap: "Vraag Roos deze week iets simpels: koffie, lunch, een wandeling. Niet als groot plan — gewoon een begin.",
      aangemaktOp: daysAgo(28),
    },
    {
      sessieId: S.jan1,
      samenvattingTekst: "Jan heeft gele blokjes. Elke dag. Hij vergat ze alleen. Deze sessie heeft ze zichtbaar gemaakt — en dat is genoeg om iets te veranderen in hoe hij zijn werk ervaart.",
      inzichten: JSON.stringify([
        "In elke fase bleek dat Jan de energie al heeft — hij herkent hem alleen niet meer op het moment zelf.",
        "De gele blokjes zijn dagelijkse momenten. Ze hoeven niet groter te worden, alleen meer gezien.",
        "Ruimte aan het einde van een dienst is er niet — maar hij heeft hem al gebouwd in zijn hoofd. Dat is een voornemen dat wacht op uitvoering.",
      ]),
      eersteStap: "Schrijf aan het einde van elke dienst de komende week één geel moment op. Één zin. Niks meer.",
      aangemaktOp: daysAgo(12),
    },
    {
      sessieId: S.marieke1,
      samenvattingTekst: "Marieke draagt haar rouw in de onderste laag van wie ze is. Ze heeft hem niet weggestopt — ze heeft hem verborgen om voor anderen sterk te zijn. De bloemen zijn haar weg terug. Klein, kleurrijk en levend.",
      inzichten: JSON.stringify([
        "In elke fase was de zachtheid er al — eerst verborgen, dan vermengd, en uiteindelijk benoemd als iets dat wacht.",
        "Marieke's kracht en haar kwetsbaarheid zijn niet tegenovergesteld; in de tweede fase verweefde ze ze zelf.",
        "Bloemen zijn een concreet symbool dat ze zelf benoemde. Het is geen metafoor — het is een actie die ze kan nemen.",
      ]),
      eersteStap: "Koop bloemen voor jezelf. Deze week. Zet ze neer en kijk er dagelijks naar.",
      aangemaktOp: daysAgo(12),
    },
  ]).onConflictDoNothing();

  console.log("   ✓ 11 rapporten\n");

  // ── 5. Coaching-relaties (Lisa is coach van 5 cliënten) ──────────────────────
  console.log("🤝  Coachingrelaties aanmaken…");

  await db.insert(schema.coachingRelaties).values([
    { id: "00000000-0000-4000-8002-000000000001", coachId: ID.coach, clientUserId: ID.emma,   status: "actief", aangemaktOp: daysAgo(50) },
    { id: "00000000-0000-4000-8002-000000000002", coachId: ID.coach, clientUserId: ID.thomas, status: "actief", aangemaktOp: daysAgo(75) },
    { id: "00000000-0000-4000-8002-000000000003", coachId: ID.coach, clientUserId: ID.sophie, status: "actief", aangemaktOp: daysAgo(25) },
    { id: "00000000-0000-4000-8002-000000000004", coachId: ID.coach, clientUserId: ID.pieter, status: "actief", aangemaktOp: daysAgo(60) },
    { id: "00000000-0000-4000-8002-000000000005", coachId: ID.coach, clientUserId: ID.anna,   status: "actief", aangemaktOp: daysAgo(32) },
  ]).onConflictDoNothing();

  console.log("   ✓ 5 coachingrelaties\n");

  // ── 6. Coach-notities ────────────────────────────────────────────────────────
  console.log("📝  Coachnotities aanmaken…");

  await db.insert(schema.coachNotities).values([
    {
      id: "00000000-0000-4000-8003-000000000001",
      coachId: ID.coach, clientUserId: ID.emma,
      sessieId: S.emma1,
      tekst: "Eerste sessie was een doorbraak. Emma was verrast door wat het bouwen bij haar losmaakte. Ze was gewend om alles in woorden te vangen — dit keer kwamen de inzichten via haar handen. Aandachtspunt: grenzen stellen in relatie tot collega-binding.",
      aangemaktOp: daysAgo(41),
    },
    {
      id: "00000000-0000-4000-8003-000000000002",
      coachId: ID.coach, clientUserId: ID.emma,
      sessieId: S.emma2,
      tekst: "Mooie progressie. Emma verbindt haar werkthema nu aan een diepere vraag over identiteit. Het schild dat ze draagt beschermt haar, maar sluit ook iets in. Ze staat open voor het idee dat kwetsbaarheid haar geloofwaardiger maakt, niet minder.",
      aangemaktOp: daysAgo(13),
    },
    {
      id: "00000000-0000-4000-8003-000000000003",
      coachId: ID.coach, clientUserId: ID.emma,
      sessieId: null,
      tekst: "Emma groeit snel. Ze is analytisch en reflectief van nature — het bouwen doorbreekt haar neiging tot overdenken op een productieve manier. Volgende sessie: verder op het identiteitsthema, mogelijk richting wat ze voor zichzelf wil creëren buiten werk.",
      aangemaktOp: daysAgo(10),
    },
    {
      id: "00000000-0000-4000-8003-000000000004",
      coachId: ID.coach, clientUserId: ID.thomas,
      sessieId: S.thomas1,
      tekst: "Thomas is analytisch ingesteld — het fysieke bouwen heeft zijn denkmodus echt doorbroken. Voor het eerst benoemde hij iets zonder het te rationaliseren. Het kruispunt-thema is raak: hij weet het al, hij hoeft het alleen nog te voelen.",
      aangemaktOp: daysAgo(69),
    },
    {
      id: "00000000-0000-4000-8003-000000000005",
      coachId: ID.coach, clientUserId: ID.thomas,
      sessieId: S.thomas2,
      tekst: "Thomas heeft de datum gezet: 1 september. Dat is een significante stap voor iemand die lang heeft afgewacht. Zijn vrouw is de sleutel — niet als gatekeepeer maar als getuige. Dat is subtiel maar belangrijk.",
      aangemaktOp: daysAgo(34),
    },
    {
      id: "00000000-0000-4000-8003-000000000006",
      coachId: ID.coach, clientUserId: ID.thomas,
      sessieId: S.thomas3,
      tekst: "Thomas heeft het gedaan. Ontslag ingediend. Deze sessie was een soort landing: wie ben ik nu? Het antwoord dat hij bouwde was concreet en warm. Hij is er klaar voor. Check-in over 6 weken na zijn eerste maand als zelfstandige.",
      aangemaktOp: daysAgo(6),
    },
    {
      id: "00000000-0000-4000-8003-000000000007",
      coachId: ID.coach, clientUserId: ID.sophie,
      sessieId: S.sophie1,
      tekst: "Sophie vertrok met een concrete zin klaar: 'Ik mis jou.' Eenvoudig en direct. Ze is iemand die weet wat ze wil maar conflict vermijdt. De sessie heeft haar geholpen om te zien dat benoemen geen conflict is — het is contact.",
      aangemaktOp: daysAgo(20),
    },
    {
      id: "00000000-0000-4000-8003-000000000008",
      coachId: ID.coach, clientUserId: ID.pieter,
      sessieId: S.pieter1,
      tekst: "Pieter is voorzichtig en heeft weinig vertrouwen in zijn eigen intuïtie — maar die is er wel. Het onderwijs-thema verscheen in elke fase. Henk is een concrete ingang. Ik heb hem aangeraden om gewoon te bellen, zonder plan.",
      aangemaktOp: daysAgo(55),
    },
    {
      id: "00000000-0000-4000-8003-000000000009",
      coachId: ID.coach, clientUserId: ID.pieter,
      sessieId: S.pieter2,
      tekst: "Mooie verdieping op het verbindingsthema. Pieter heeft het anker benoemd: de gedachte dat hij een last is. Dat is een lang meegedragen overtuiging. Eén goed gesprek met Henk kan als tegenbewijs werken — ik hoop dat hij belt.",
      aangemaktOp: daysAgo(20),
    },
    {
      id: "00000000-0000-4000-8003-000000000010",
      coachId: ID.coach, clientUserId: ID.anna,
      sessieId: S.anna1,
      tekst: "Anna is kwetsbaar maar krachtig. Ze heeft de metafoor van de deur gebouwd — en haar hand zat al aan de klink. Ze wacht op bewijs dat ze welkom is. Roos is een concrete eerste stap. Volgende sessie inplannen over 3 weken.",
      aangemaktOp: daysAgo(27),
    },
  ]).onConflictDoNothing();

  console.log("   ✓ 10 coach-notities\n");

  // ── 7. Workshops (Mark is facilitator) ───────────────────────────────────────
  console.log("🏗️  Workshops aanmaken…");

  await db.insert(schema.workshops).values([
    {
      id: W.zorg,
      facilitatorId: ID.facilitator,
      naam: "Teamreflectie Zorg & Welzijn",
      beschrijving: "Een reflectietraject voor zorgprofessionals rondom werkbeleving en persoonlijk leiderschap. Deelnemers verkennen hun relatie met werk, energie en verbinding via LEGO Serious Play.",
      code: "ZORGW1",
      status: "actief",
      aangemaktOp: daysAgo(20),
    },
    {
      id: W.leid,
      facilitatorId: ID.facilitator,
      naam: "Leiderschapsontwikkeling 2026",
      beschrijving: "Programma voor leidinggevenden in transitie. Focus op identiteit, keuzes en persoonlijk leiderschap met behulp van de LSP-methode.",
      code: "LEID26",
      status: "actief",
      aangemaktOp: daysAgo(30),
    },
  ]).onConflictDoNothing();

  console.log("   ✓ 2 workshops\n");

  // ── 8. Workshop-deelnemers ────────────────────────────────────────────────────
  console.log("👥  Workshopdeelnemers aanmaken…");

  await db.insert(schema.workshopDeelnemers).values([
    // Zorg & Welzijn — 6 deelnemers
    { id: "00000000-0000-4000-8004-000000000001", workshopId: W.zorg, userId: ID.emma,    uitgenodigd: true, toegetreden: true,  aangemaktOp: daysAgo(19) },
    { id: "00000000-0000-4000-8004-000000000002", workshopId: W.zorg, userId: ID.thomas,  uitgenodigd: true, toegetreden: true,  aangemaktOp: daysAgo(19) },
    { id: "00000000-0000-4000-8004-000000000003", workshopId: W.zorg, userId: ID.sophie,  uitgenodigd: true, toegetreden: true,  aangemaktOp: daysAgo(18) },
    { id: "00000000-0000-4000-8004-000000000004", workshopId: W.zorg, userId: ID.jan,     uitgenodigd: true, toegetreden: true,  aangemaktOp: daysAgo(18) },
    { id: "00000000-0000-4000-8004-000000000005", workshopId: W.zorg, userId: ID.marieke, uitgenodigd: true, toegetreden: true,  aangemaktOp: daysAgo(17) },
    { id: "00000000-0000-4000-8004-000000000006", workshopId: W.zorg, userId: ID.anna,    uitgenodigd: true, toegetreden: true,  aangemaktOp: daysAgo(17) },
    // Leiderschapsontwikkeling — 4 deelnemers
    { id: "00000000-0000-4000-8004-000000000007", workshopId: W.leid, userId: ID.thomas,  uitgenodigd: true, toegetreden: true,  aangemaktOp: daysAgo(29) },
    { id: "00000000-0000-4000-8004-000000000008", workshopId: W.leid, userId: ID.pieter,  uitgenodigd: true, toegetreden: true,  aangemaktOp: daysAgo(28) },
    { id: "00000000-0000-4000-8004-000000000009", workshopId: W.leid, userId: ID.anna,    uitgenodigd: true, toegetreden: true,  aangemaktOp: daysAgo(27) },
    { id: "00000000-0000-4000-8004-000000000010", workshopId: W.leid, userId: ID.jan,     uitgenodigd: true, toegetreden: false, aangemaktOp: daysAgo(26) },
  ]).onConflictDoNothing();

  console.log("   ✓ 10 workshopdeelnemers\n");

  // ── Klaar ─────────────────────────────────────────────────────────────────────
  console.log("✅  Demo-seed voltooid!\n");
  console.log("┌─────────────────────────────────────────┬────────────────┬───────────────────┐");
  console.log("│ E-mail                                  │ Wachtwoord     │ Rol               │");
  console.log("├─────────────────────────────────────────┼────────────────┼───────────────────┤");
  console.log("│ coach@demo.brickme.nl                   │ Demo1234!      │ coach             │");
  console.log("│ facilitator@demo.brickme.nl             │ Demo1234!      │ facilitator       │");
  console.log("│ emma@demo.brickme.nl                    │ Demo1234!      │ gebruiker         │");
  console.log("│ thomas@demo.brickme.nl                  │ Demo1234!      │ gebruiker         │");
  console.log("│ sophie@demo.brickme.nl                  │ Demo1234!      │ gebruiker         │");
  console.log("│ pieter@demo.brickme.nl                  │ Demo1234!      │ gebruiker         │");
  console.log("│ anna@demo.brickme.nl                    │ Demo1234!      │ gebruiker         │");
  console.log("│ jan@demo.brickme.nl                     │ Demo1234!      │ gebruiker         │");
  console.log("│ marieke@demo.brickme.nl                 │ Demo1234!      │ gebruiker         │");
  console.log("└─────────────────────────────────────────┴────────────────┴───────────────────┘");
}

seed().catch((err) => {
  console.error("❌  Seed mislukt:", err);
  process.exit(1);
});
