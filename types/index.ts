export type ThemaId = "werk" | "relatie" | "identiteit" | "verbinding" | "kruispunt";

export interface IntakeBericht {
  rol: "ai" | "gebruiker";
  inhoud: string;
}

export interface IntakeAntwoord {
  vraag: string;
  antwoord: string;
}

export interface FaseData {
  id: string;
  faseNummer: number;
  faseTitel: string;
  vraag: string;
  fotoBase64?: string;
  gebruikersBeschrijving?: string;
  aiReflectie?: string;
  aiVervolgvraag?: string;
  gebruikersAntwoord?: string;
  voltooid: boolean;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

import type { InterneLink } from "@/lib/db/schema";
export type { InterneLink };

export interface Artikel {
  id: string;
  slug: string;
  titel: string;
  inhoud: string;
  excerpt: string | null;
  metaTitel: string | null;
  metaBeschrijving: string | null;
  trefwoorden: string[] | null;
  ogAfbeelding: string | null;
  categorie: string | null;
  tags: string[] | null;
  interneLinks: InterneLink[] | null;
  schemaMarkup: object | null;
  leestijd: number | null;
  seoScore: number | null;
  gepubliceerd: boolean;
  gepubliceerdOp: string | null;
  aangemaktOp: string;
  bijgewerktOp: string;
}

export interface SeoResultaat {
  metaTitel: string;
  metaBeschrijving: string;
  slug: string;
  excerpt: string;
  trefwoorden: string[];
  interneLinks: InterneLink[];
  schemaMarkup: object;
  leestijd: number;
  seoScore: number;
  verbeteringen: string[];
}
