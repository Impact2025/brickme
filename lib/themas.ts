export const THEMAS = {
  werk: {
    id: "werk",
    label: "Werk & energie",
    ondertitel: "Ik loop leeg",
    beschrijving: "Je werk geeft je geen energie meer — of je weet niet meer waarom je het doet.",
    kleur: "from-amber-100 to-orange-50",
    faseTitels: [
      "Hoe het voelt",
      "Hoe het zou kunnen zijn",
      "Wat jou energie geeft",
    ] as [string, string, string],
    bouwvragen: [
      "Bouw een dag op je werk — zet neer wat energie opvreet en wat energie geeft. Gebruik positie, grootte en afstand.",
      "Bouw de werkdag die jou 's avonds tevreden naar huis stuurt. Wat is er anders dan nu?",
      "Bouw de mensen, condities of krachten die je nodig hebt om daar te komen.",
    ],
  },
  relatie: {
    id: "relatie",
    label: "Liefde & relatie",
    ondertitel: "Ik voel me niet gezien",
    beschrijving: "Je voelt je niet gezien of gehoord door je partner — of je vraagt je af of jullie nog op dezelfde pagina zitten.",
    kleur: "from-rose-100 to-pink-50",
    faseTitels: [
      "Hoe jullie er nu voor staan",
      "Hoe je het wil voelen",
      "Wat de verbinding herstelt",
    ] as [string, string, string],
    bouwvragen: [
      "Bouw hoe jij en de ander nu staan — de afstand, de richting, wie de meeste ruimte inneemt.",
      "Bouw hoe je wilt dat jullie staan. Wat is er anders?",
      "Bouw wat er tussen jullie nodig is — wat er nu ontbreekt, of wat er te veel is.",
    ],
  },
  identiteit: {
    id: "identiteit",
    label: "Wie ben ik",
    ondertitel: "Ik weet niet meer wie ik ben",
    beschrijving: "Je bent jezelf kwijtgeraakt — of je zoekt naar wie je werkelijk bent, onder alles wat je voor anderen bent.",
    kleur: "from-purple-100 to-violet-50",
    faseTitels: [
      "Wie je nu bent",
      "Wie je wil zijn",
      "Wat je al in je hebt",
    ] as [string, string, string],
    bouwvragen: [
      "Bouw jezelf — alle kanten die je laat zien én de kanten die je verbergt.",
      "Bouw de versie van jou die je wil zijn.",
      "Bouw wat je al in je hebt, en wat je nog nodig hebt om die persoon te zijn.",
    ],
  },
  verbinding: {
    id: "verbinding",
    label: "Verbinding",
    ondertitel: "Ik sta er alleen voor",
    beschrijving: "Je voelt je eenzaam, ook als er mensen om je heen zijn. Je mist echte diepgang in vriendschappen of familie.",
    kleur: "from-teal-100 to-cyan-50",
    faseTitels: [
      "Hoe jouw wereld er nu uitziet",
      "Hoe je die wereld wil",
      "Wat jou naar mensen trekt",
    ] as [string, string, string],
    bouwvragen: [
      "Bouw jouw wereld van mensen — wie staat echt dichtbij, wie is ver weg, wie ontbreekt?",
      "Bouw hoe je die wereld wil hebben. Wie staat er dan bij je?",
      "Bouw wat jou naar mensen toetrekt — of wat jou nu tegenhoudt.",
    ],
  },
  kruispunt: {
    id: "kruispunt",
    label: "Kruispunt",
    ondertitel: "Ik weet niet welke kant ik op moet",
    beschrijving: "Je staat voor een grote keuze of verandering. Je weet het eigenlijk al, maar je durft het nog niet.",
    kleur: "from-green-100 to-emerald-50",
    faseTitels: [
      "Waar je nu staat",
      "Waar je naartoe wil",
      "Wat jou vrij maakt",
    ] as [string, string, string],
    bouwvragen: [
      "Bouw het kruispunt waar je staat — alle richtingen, alle opties, de verwarring.",
      "Bouw de weg die jou het meest aanspreekt — hoe die eruit ziet als je hem op gaat.",
      "Bouw wat jou vrij maakt om die keuze te maken.",
    ],
  },
  rouw: {
    id: "rouw",
    label: "Rouw & verlies",
    ondertitel: "Ik weet niet hoe ik verder moet",
    beschrijving: "Je hebt iets of iemand verloren — en je weet niet hoe je verder gaat zonder dat het voelt als loslaten.",
    kleur: "from-slate-100 to-stone-50",
    faseTitels: [
      "Wat je verloren hebt",
      "Wat er nog steeds is",
      "Wat jou draagt",
    ] as [string, string, string],
    bouwvragen: [
      "Bouw wat je verloren hebt — het kan een persoon zijn, een plek, een periode, een versie van jezelf.",
      "Bouw wat er ondanks alles nog steeds is — wat je meedraagt, wat je gekregen hebt, wat gebleven is.",
      "Bouw wat jou helpt verder te gaan — niet om te vergeten, maar om toch een stap te zetten.",
    ],
  },
} as const;

export type ThemaId = keyof typeof THEMAS;
