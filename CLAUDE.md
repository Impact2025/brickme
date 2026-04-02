# Brickme.nl — Claude Code Instructies

## Wat is dit?
Een LSP-geïnspireerde zelfreflectie-webapp. Gebruikers kiezen een levensthema, doen een AI-gedreven intake, bouwen een fysiek model met LEGO of huishoudspullen, fotograferen het, en ontvangen een persoonlijke AI-reflectie + eindrapport.

## Stack
- **Frontend**: Next.js 15 + Tailwind CSS
- **Database**: Neon (Postgres) + Drizzle ORM
- **Auth**: Clerk
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514) — tekst + vision
- **Betaling**: Stripe
- **Hosting**: Vercel

## Kleurenpalet (ALTIJD gebruiken)
```
--kleur-primary: #C8583A    (terracotta)
--kleur-secondary: #F5F0E8  (linnen/wit)
--kleur-accent: #2D4A3E     (donkergroen)
--kleur-text: #2C1F14       (warm espresso)
--kleur-muted: #8B7355      (warm grijs)
```

## Typography
- Headings: `font-serif` (Playfair Display of Cormorant)
- Body: `font-sans` (Inter)
- Geen harde zwart, altijd warme bruinen

## App Flow
1. **Startpagina** `/` — 5 thema-tiles, kies je thema
2. **Intake** `/sessie/nieuw` — AI-gesprek, 7-10 vragen
3. **Bouwen** `/sessie/[id]/bouwen` — timer + verborgen vragen + foto upload
4. **Reflectie** `/sessie/[id]/reflectie` — AI kijkt naar foto, geeft 1 vraag terug
5. **Rapport** `/sessie/[id]/rapport` — mooi PDF-rapport

## De 5 Thema's
1. **Werk & energie** — "Ik loop leeg"
2. **Liefde & relatie** — "Ik voel me niet gezien"  
3. **Wie ben ik** — "Ik weet niet meer wie ik ben"
4. **Verbinding** — "Ik sta er alleen voor"
5. **Kruispunt** — "Ik weet niet welke kant ik op moet"

## AI Principes (BELANGRIJK)
- De AI stelt altijd maar ÉÉN vervolgvraag na een reflectie
- De reflectie beschrijft SPECIFIEKE elementen uit de foto (niet generiek)
- Toon is: warm, direct, zonder jargon
- Nooit zeggen: "Ik zie dat..." maar gewoon beschrijven
- Model: altijd `claude-sonnet-4-20250514`

## Database Schema
Zie `lib/db/schema.ts` — tabellen: users, sessies, fases, uploads, reflecties

## Omgevingsvariabelen
Zie `.env.example` — kopieer naar `.env.local` en vul in

## Stijlregels
- Geen loading spinners → gebruik skeleton states
- Geen success toasts → subtiele state changes
- Geen modals → inline feedback
- Transities zijn langzaam en intentioneel (300-500ms)
- Mobile-first design

## Bestandsstructuur
```
app/
  (auth)/           — Clerk sign-in/sign-up pagina's
  api/              — API routes
    intake/         — AI intake gesprek
    reflectie/      — Claude Vision reflectie
    rapport/        — Rapport genereren
    sessie/         — Sessie CRUD
  sessie/
    nieuw/          — Nieuwe sessie starten (intake)
    [id]/
      bouwen/       — Bouwfase
      reflectie/    — Reflectiefase
      rapport/      — Eindrapport
components/
  ui/               — Herbruikbare UI componenten
  sessie/           — Sessie-specifieke componenten
lib/
  db/               — Drizzle config + schema
  ai.ts             — Claude API helpers
  utils.ts          — Utility functies
hooks/              — Custom React hooks
types/              — TypeScript types
```
