# Brickme.nl

> Bouw wat je niet kunt zeggen

Een LSP-geïnspireerde zelfreflectie-webapp. Gebruikers kiezen een levensthema, doen een AI-intake, bouwen een fysiek model, fotograferen het, en ontvangen een persoonlijke AI-reflectie + eindrapport.

## Snel starten

### 1. Installeer dependencies
```powershell
npm install
```

### 2. Zet je environment variabelen
```powershell
Copy-Item .env.example .env.local
# Vul je keys in in .env.local
```

Je hebt nodig:
- **Neon** account → https://neon.tech (gratis tier)
- **Clerk** account → https://clerk.com (gratis tier)
- **Anthropic** API key → https://console.anthropic.com

### 3. Maak de database aan
```powershell
npm run db:push
```

### 4. Start de dev server
```powershell
npm run dev
```

Open http://localhost:3000

## Deploy naar Vercel

```powershell
npx vercel
```

Voeg je environment variabelen toe via het Vercel dashboard.

## Stack
- **Next.js 15** — App Router
- **Tailwind CSS** — Styling met Brickme design tokens
- **Clerk** — Authenticatie
- **Neon + Drizzle** — Database
- **Claude API** — AI intake + vision reflectie
- **Stripe** — Betalingen (later)

## Mappenstructuur
```
app/
  (auth)/           Clerk auth pagina's
  api/
    intake/         AI intake gesprek
    reflectie/      Claude Vision reflectie op foto
    rapport/        Rapport genereren + ophalen
    sessie/         Sessie data CRUD
  sessie/
    nieuw/          Intake flow
    [id]/
      bouwen/       Bouwfase met timer + camera
      reflectie/    AI reflectie bekijken
      rapport/      Eindrapport
lib/
  ai.ts             Claude prompts + thema configuratie
  db/               Drizzle schema + connectie
  utils.ts          Hulpfuncties
types/              TypeScript types
```

## Claude Code gebruiken
Start Claude Code in deze map:
```powershell
claude
```

Zie `CLAUDE.md` voor alle instructies die Claude Code nodig heeft.
