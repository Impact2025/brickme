import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Algemene Voorwaarden — Brickme",
  description: "De algemene voorwaarden van Brickme door WeAreImpact B.V.",
};

export default function VoorwaardenPage() {
  return (
    <main className="min-h-dvh bg-secondary">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-secondary/90 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Brickme" width={28} height={28} unoptimized />
            <span className="font-serif text-primary text-lg">Brickme</span>
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-bricktext transition-colors">← Terug</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 pb-24">
        {/* Titel */}
        <div className="mb-10 pb-8 border-b border-border">
          <p className="text-xs text-muted uppercase tracking-wider mb-2">Juridisch</p>
          <h1 className="text-4xl font-serif text-bricktext mb-3">Algemene Voorwaarden</h1>
          <p className="text-sm text-muted">Versie 1.1 — 1 januari 2026 · WeAreImpact B.V. — Brickme.nl</p>
          <p className="text-sm text-muted mt-1">KVK: 70285888 · BTW: NL858236369B01 · <a href="mailto:info@brickme.nl" className="text-primary hover:underline">info@brickme.nl</a></p>
        </div>

        <div className="legal">
          <h2>Artikel 1 — Definities</h2>
          <ul>
            <li><strong>Brickme:</strong> het digitale platform op brickme.nl, aangeboden door WeAreImpact B.V.</li>
            <li><strong>Gebruiker:</strong> iedere natuurlijke persoon van 16 jaar of ouder die een account aanmaakt of een sessie start.</li>
            <li><strong>Sessie:</strong> een door de Gebruiker gestarte reflectie-ervaring bestaande uit een intake, bouwfases en een door Brickme gegenereerde reflectie.</li>
            <li><strong>Rapport:</strong> het persoonlijke document dat de Gebruiker ontvangt na afronding van een Sessie.</li>
            <li><strong>Brickme-reflectie:</strong> de door Brickme (op basis van Claude van Anthropic) gegenereerde tekst op basis van de foto en beschrijving van de Gebruiker.</li>
          </ul>

          <h2>Artikel 2 — Toepasselijkheid</h2>
          <p>Deze voorwaarden zijn van toepassing op alle gebruik van Brickme, inclusief het aanmaken van een account, het starten van een Sessie en het downloaden van een Rapport. Door gebruik te maken van Brickme ga je akkoord met deze voorwaarden.</p>

          <h2>Artikel 3 — De dienst</h2>
          <p><strong>3.1</strong> Brickme biedt een digitale reflectietool gebaseerd op principes van begeleid bouwen en geautomatiseerde analyse. Brickme is geen psychologische behandeling, geen therapie en geen medisch advies.</p>
          <p><strong>3.2</strong> De Brickme-reflecties zijn gegenereerd door een taalmodel (Claude van Anthropic). Wij staan niet in voor de juistheid, volledigheid of geschiktheid van de reflecties voor jouw specifieke situatie. De reflecties zijn indicatief van aard.</p>
          <div className="warning">
            <strong>Brickme is niet bedoeld voor personen in acute psychische crisis.</strong> Als je kampt met ernstige psychische klachten, neem dan contact op met je huisarts of bel de crisislijn: <strong>0900-0113</strong> (24/7 bereikbaar, gratis).
          </div>
          <p><strong>3.3</strong> Wij spannen ons in om de dienst 24/7 beschikbaar te houden, maar garanderen geen ononderbroken beschikbaarheid.</p>

          <h2>Artikel 4 — Account en leeftijdsgrens</h2>
          <p><strong>4.1</strong> Om een Sessie te starten heb je een account nodig. Brickme is uitsluitend bestemd voor personen van <strong>16 jaar of ouder</strong>. Door een account aan te maken verklaar je aan deze leeftijdsgrens te voldoen.</p>
          <p><strong>4.2</strong> Je bent verantwoordelijk voor de juistheid van de door jou verstrekte gegevens en voor het geheimhouden van je inloggegevens. Meld vermoed misbruik direct via <a href="mailto:info@brickme.nl">info@brickme.nl</a>.</p>
          <p><strong>4.3</strong> Je mag je account op elk moment verwijderen via accountinstellingen. Wij wissen jouw data binnen 30 dagen conform onze <Link href="/privacy">Privacyverklaring</Link>.</p>

          <h2>Artikel 5 — Herroepingsrecht</h2>
          <p><strong>5.1</strong> Als consument heb je het recht om een overeenkomst op afstand binnen <strong>14 dagen</strong> te herroepen, zonder opgave van reden.</p>
          <p><strong>5.2</strong> Voor digitale diensten (Sessies, abonnementen) geldt een uitzondering: zodra jij uitdrukkelijk verzoekt de dienst vóór het verstrijken van de herroepingstermijn te starten én je uitdrukkelijk afstand doet van je herroepingsrecht, vervalt dit recht op het moment dat de Sessie wordt gestart of het abonnement ingaat.</p>
          <p><strong>5.3</strong> Het herroepingsrecht is niet van toepassing op Rapporten die je expliciet hebt gedownload, omdat het een voltooid digitaal product betreft.</p>
          <p><strong>5.4</strong> Om gebruik te maken van het herroepingsrecht stuur je een e-mail naar <a href="mailto:info@brickme.nl">info@brickme.nl</a> met de vermelding &ldquo;Herroeping&rdquo; en de datum van aankoop. Wij restitueren het betaalde bedrag binnen 14 dagen.</p>

          <h2>Artikel 6 — Betaling</h2>
          <p><strong>6.1</strong> Prijzen zijn vermeld op brickme.nl en zijn inclusief BTW, tenzij anders vermeld.</p>
          <p><strong>6.2</strong> Betalingen verlopen via Stripe. Stripe is deels zelfstandig verwerkingsverantwoordelijke (o.a. voor fraudedetectie). WeAreImpact B.V. heeft geen toegang tot jouw volledige betaalgegevens.</p>
          <p><strong>6.3</strong> Abonnementen worden automatisch verlengd. Je kunt opzeggen tot 24 uur vóór de verlengingsdatum via accountinstellingen.</p>
          <p><strong>6.4</strong> Losse Sessies worden niet gerestitueerd nadat de Sessie is gestart, tenzij er sprake is van een technische fout waardoor de Sessie niet kon worden voltooid. In dat geval ontvang je een tegoedbon of restitutie naar keuze.</p>

          <h2>Artikel 7 — Intellectueel eigendom</h2>
          <p><strong>7.1</strong> Alle inhoud van Brickme — waaronder teksten, ontwerpen, code en prompts — is eigendom van WeAreImpact B.V. of wordt gebruikt onder licentie.</p>
          <p><strong>7.2</strong> Jouw sessie-inhoud (antwoorden, foto&apos;s, beschrijvingen) blijft van jou. Je verleent ons een beperkte licentie om deze te verwerken voor het leveren van de dienst. Wij gebruiken jouw inhoud nooit voor marketing, modeltraining of enig ander doel zonder jouw expliciete toestemming.</p>
          <p><strong>7.3</strong> De Brickme-reflecties zijn gegenereerd op basis van jouw input en zijn bedoeld voor jouw persoonlijk gebruik. Je mag ze vrij delen, printen of bewaren.</p>
          <div className="notice">
            Brickme is geïnspireerd op de principes van LEGO® Serious Play. LEGO® is een geregistreerd handelsmerk van The LEGO Group. WeAreImpact B.V. is niet gelieerd aan, gecertificeerd door, of goedgekeurd door The LEGO Group.
          </div>

          <h2>Artikel 8 — Aansprakelijkheid</h2>
          <p><strong>8.1</strong> Brickme is een reflectietool voor persoonlijk gebruik. Wij zijn niet aansprakelijk voor beslissingen die je neemt op basis van een Brickme-reflectie of Rapport.</p>
          <p><strong>8.2</strong> Onze aansprakelijkheid is in alle gevallen beperkt tot het bedrag dat jij in de betreffende kalendermaand aan Brickme hebt betaald.</p>
          <p><strong>8.3</strong> Wij zijn niet aansprakelijk voor indirecte schade, gederfde winst of gevolgschade.</p>
          <p><strong>8.4</strong> Deze beperkingen gelden niet bij opzet of grove nalatigheid van WeAreImpact B.V., en gelden niet verder dan dwingend consumentenrecht toestaat.</p>

          <h2>Artikel 9 — Gedragsregels</h2>
          <p>Je mag Brickme niet gebruiken voor het uploaden van inhoud die illegaal is, derden schaadt of inbreuk maakt op rechten van anderen. Wij behouden het recht accounts te blokkeren bij misbruik, zonder restitutie van reeds betaalde bedragen.</p>

          <h2>Artikel 10 — Wijzigingen</h2>
          <p>Wij kunnen deze voorwaarden aanpassen. Bij wezenlijke wijzigingen informeren wij je minimaal <strong>30 dagen</strong> van tevoren per e-mail. Blijf je Brickme gebruiken na de ingangsdatum, dan ga je akkoord met de nieuwe voorwaarden.</p>

          <h2>Artikel 11 — Toepasselijk recht en geschillen</h2>
          <p>Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in het arrondissement Amsterdam, tenzij dwingend recht anders bepaalt. Bij consumentengeschillen kun je ook terecht bij het Europees ODR-platform: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.</p>
        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-6 text-sm text-muted">
          <Link href="/privacy" className="hover:text-bricktext transition-colors">Privacyverklaring</Link>
          <a href="mailto:info@brickme.nl" className="hover:text-bricktext transition-colors">info@brickme.nl</a>
          <span className="text-muted-light">© 2025 WeAreImpact B.V.</span>
        </div>
      </div>

      <style>{`
        .legal h2 { margin-top: 2.5rem; margin-bottom: 0.75rem; font-size: 1.25rem; font-weight: 600; color: #2C1F14; }
        .legal h3 { margin-top: 1.5rem; margin-bottom: 0.4rem; font-size: 1rem; font-weight: 600; color: #2C1F14; }
        .legal p { margin-bottom: 0.875rem; line-height: 1.75; color: #8B7355; }
        .legal ul { margin-bottom: 0.875rem; padding-left: 1.5rem; list-style: disc; color: #8B7355; line-height: 1.75; }
        .legal li { margin-bottom: 0.35rem; }
        .legal a { color: #C8583A; text-decoration: underline; text-underline-offset: 2px; }
        .legal strong { color: #2C1F14; }
        .legal .notice { background: #F5F0E8; border-left: 3px solid #C8583A; padding: 0.875rem 1rem; margin-bottom: 1rem; border-radius: 0.5rem; color: #8B7355; font-size: 0.9rem; line-height: 1.6; }
        .legal .warning { background: #ffdad6; border-left: 3px solid #ba1a1a; padding: 0.875rem 1rem; margin-bottom: 1rem; border-radius: 0.5rem; color: #410002; font-size: 0.9rem; line-height: 1.6; }
      `}</style>
    </main>
  );
}
