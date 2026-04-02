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
