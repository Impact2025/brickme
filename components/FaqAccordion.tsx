"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const VRAGEN = [
  {
    vraag: "Heb ik LEGO nodig?",
    antwoord:
      "LEGO is de ideale keuze, en de methode is er ook op gebouwd. Als LEGO-Serious-Play-facilitator geloof ik oprecht in wat LEGO doet met je handen en je hoofd. Heb je geen LEGO bij de hand? Dan kun je ook andere bouwmaterialen gebruiken. Maar investeer in een setje, het maakt het verschil.",
  },
  {
    vraag: "Is dit therapie?",
    antwoord:
      "Nee. Brickme is een reflectietool, geen behandeling. Als je kampt met ernstige psychische klachten, raden wij altijd aan om professionele hulp te zoeken. Brickme is bedoeld voor mensen die willen nadenken over hun leven, niet voor crisis.",
  },
  {
    vraag: "Wat gebeurt er met mijn foto's?",
    antwoord:
      "Je foto wordt alleen gebruikt om jouw reflectie te genereren. We slaan geen afbeeldingen op buiten jouw eigen sessie-archief. Jouw data is van jou.",
  },
  {
    vraag: "Hoe verschilt dit van een chatbot?",
    antwoord:
      "Een chatbot praat met je. Brickme laat je bouwen. Het verschil is fundamenteel: je handen activeren andere delen van je brein dan je taalcentrum. En de reflectie is gericht op jouw specifieke foto, niet op generieke coachingsvragen.",
  },
  {
    vraag: "Kan mijn coach of therapeut mijn rapport zien?",
    antwoord:
      "Alleen als jij dat wil. Je kunt je rapport exporteren als PDF en delen met wie jij kiest. Standaard is alles privé.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {VRAGEN.map((item, i) => (
        <div
          key={i}
          className="bg-surface border border-border rounded-3xl overflow-hidden"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-7 py-5 text-left"
          >
            <span className="font-serif text-base text-bricktext">{item.vraag}</span>
            <svg
              className={cn(
                "w-5 h-5 text-muted flex-shrink-0 ml-4 transition-transform duration-300",
                open === i && "rotate-180"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              open === i ? "max-h-48" : "max-h-0"
            )}
          >
            <p className="px-7 pb-6 text-sm text-muted leading-relaxed italic font-serif border-t border-border pt-4">
              {item.antwoord}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
