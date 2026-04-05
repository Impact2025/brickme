import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Privacyverklaring — Brickme",
  description: "Hoe Brickme omgaat met jouw persoonsgegevens.",
};

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-serif text-bricktext mb-3">Privacyverklaring</h1>
          <p className="text-sm text-muted">Versie 1.1 — 1 januari 2026 · WeAreImpact B.V.</p>
        </div>

        <div className="legal">
          {/* Notice */}
          <div className="notice">
            <strong>Verwerkingsverantwoordelijke:</strong> WeAreImpact B.V., ingeschreven bij de KVK onder nummer 70285888.<br />
            Contactpersoon privacy: Vincent van Munster &nbsp;|&nbsp; <a href="mailto:privacy@brickme.nl">privacy@brickme.nl</a><br />
            Wij hebben een <strong>Data Protection Impact Assessment (DPIA)</strong> uitgevoerd voor de verwerking van bijzondere persoonsgegevens via geautomatiseerde analyse. Dit document is beschikbaar op verzoek.
          </div>

          <h2>Wie wij zijn</h2>
          <p>Brickme.nl is een product van WeAreImpact B.V. Wij zijn de verwerkingsverantwoordelijke voor alle persoonsgegevens die via dit platform worden verwerkt. Heb je vragen? Stuur een e-mail naar <a href="mailto:privacy@brickme.nl">privacy@brickme.nl</a>.</p>

          <h2>Leeftijdsgrens</h2>
          <p>Brickme is niet bestemd voor personen onder de 16 jaar. Door een account aan te maken verklaar je 16 jaar of ouder te zijn. Wij verwerken niet bewust persoonsgegevens van minderjarigen. Indien wij constateren dat een gebruiker jonger is dan 16 jaar, verwijderen wij het account en alle bijbehorende gegevens zo spoedig mogelijk.</p>

          <h2>Welke gegevens we verwerken en waarom</h2>

          <h3>1. Accountgegevens</h3>
          <p><strong>Wat:</strong> naam, e-mailadres.<br />
          <strong>Waarom:</strong> inloggen en sessies aan jou koppelen.<br />
          <strong>Grondslag:</strong> uitvoering van de overeenkomst (AVG art. 6 lid 1 sub b).<br />
          <strong>Bewaarperiode:</strong> zolang je account actief is, plus 12 maanden daarna.</p>

          <h3>2. Sessie-inhoud</h3>
          <p><strong>Wat:</strong> antwoorden tijdens de intake, tekstvelden tijdens het bouwen, beschrijvingen van je bouwsel.<br />
          <strong>Waarom:</strong> de sessie op maat maken en jouw rapport genereren.<br />
          <strong>Grondslag:</strong> uitvoering van de overeenkomst + uitdrukkelijke toestemming bij aanvang van de sessie.<br />
          <strong>Bewaarperiode:</strong> jij bepaalt dit zelf. Je kunt sessies op elk moment verwijderen. Bij verwijdering van je account worden alle sessies binnen 30 dagen gewist. Na 24 maanden inactiviteit ontvang je een herinneringsmail.</p>

          <h3>3. Foto&apos;s van jouw bouwsels</h3>
          <p><strong>Wat:</strong> afbeeldingen die jij uploadt of fotografeert tijdens een sessie.<br />
          <strong>Waarom:</strong> Claude Vision (Anthropic) de foto laten analyseren voor jouw reflectie.<br />
          <strong>Grondslag:</strong> uitdrukkelijke toestemming (AVG art. 6 lid 1 sub a).<br />
          <strong>Bewaarperiode:</strong> foto&apos;s staan in jouw sessie-archief. Je kunt ze op elk moment verwijderen. Bij verwijdering van je account worden foto&apos;s binnen 30 dagen gewist.</p>

          <div className="notice">
            <strong>Let op:</strong> Jouw foto&apos;s worden tijdelijk gedeeld met Anthropic (de maker van Claude) voor het genereren van jouw reflectie. Anthropic verwerkt deze data als subverwerker onder een verwerkersovereenkomst. Anthropic gebruikt jouw data <strong>niet</strong> voor het trainen van hun modellen wanneer dit via de API wordt aangeboden — zie <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">anthropic.com/privacy</a>. Wij sturen nooit meer data dan strikt noodzakelijk.
          </div>

          <h3>4. Gevoelige inhoud (bijzondere persoonsgegevens)</h3>
          <p>Brickme vraagt naar persoonlijke thema&apos;s zoals werk, relaties, identiteit en emotioneel welzijn. Dit kwalificeert als bijzondere persoonsgegevens in de zin van de AVG (art. 9). Wij verwerken deze gegevens uitsluitend op basis van jouw <strong>uitdrukkelijke toestemming</strong>, die je geeft bij het starten van een sessie.</p>
          <p>Je kunt deze toestemming op elk moment intrekken via <strong>accountinstellingen → Privacy</strong>, zonder gevolgen voor reeds verleende diensten.</p>

          <h3>5. Betalingsgegevens</h3>
          <p><strong>Wat:</strong> transactie-ID, bedrag, datum. Wij slaan geen volledige betaalkaartgegevens op.<br />
          <strong>Waarom:</strong> betaling verwerken en wettelijke factuurplicht.<br />
          <strong>Verwerking via:</strong> Stripe Inc. Zie <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a>.<br />
          <strong>Bewaarperiode:</strong> 7 jaar (wettelijke bewaarplicht boekhouding).</p>

          <h3>6. Technische gegevens</h3>
          <p><strong>Wat:</strong> IP-adres, browsertype, sessieduur, foutmeldingen.<br />
          <strong>Waarom:</strong> beveiliging, foutopsporing en platformbeheer.<br />
          <strong>Grondslag:</strong> gerechtvaardigd belang (AVG art. 6 lid 1 sub f).<br />
          <strong>Bewaarperiode:</strong> 90 dagen in logs.</p>

          <h2>Subverwerkers</h2>
          <p>Wij werken met de volgende partijen die jouw data (deels) verwerken. Met alle subverwerkers is een verwerkersovereenkomst gesloten.</p>

          <table>
            <thead>
              <tr>
                <th>Partij</th>
                <th>Doel</th>
                <th>Land</th>
                <th>Grondslag doorgifte</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Anthropic</td><td>Analyse van foto&apos;s en tekst voor reflecties</td><td>VS</td><td>Standard Contractual Clauses</td></tr>
              <tr><td>Neon Inc.</td><td>Databaseopslag</td><td>VS / EU</td><td>Standard Contractual Clauses</td></tr>
              <tr><td>Vercel Inc.</td><td>Hosting van de applicatie</td><td>VS / EU</td><td>Standard Contractual Clauses</td></tr>
              <tr><td>Stripe Inc.</td><td>Betalingsverwerking</td><td>VS</td><td>Standard Contractual Clauses</td></tr>
            </tbody>
          </table>

          <h2>Jouw rechten</h2>
          <p>Onder de AVG heb je de volgende rechten. Je kunt ze uitoefenen via <a href="mailto:privacy@brickme.nl">privacy@brickme.nl</a>. Wij reageren binnen 30 dagen.</p>
          <ul>
            <li><strong>Inzage</strong> — opvragen welke gegevens wij van je bewaren</li>
            <li><strong>Correctie</strong> — onjuiste gegevens laten aanpassen</li>
            <li><strong>Verwijdering</strong> — account en alle bijbehorende data laten wissen</li>
            <li><strong>Beperking</strong> — verwerking tijdelijk laten stopzetten</li>
            <li><strong>Bezwaar</strong> — bezwaar maken tegen verwerking op gerechtvaardigd belang</li>
            <li><strong>Overdraagbaarheid</strong> — sessiedata opvragen in een leesbaar formaat (JSON of PDF)</li>
            <li><strong>Intrekking toestemming</strong> — via accountinstellingen → Privacy, zonder gevolgen voor eerder verleende diensten</li>
          </ul>
          <p>Ben je het niet eens met onze reactie? Je hebt het recht een klacht in te dienen bij de <a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">Autoriteit Persoonsgegevens</a>.</p>

          <h2>Beveiliging</h2>
          <p>Jouw data wordt versleuteld opgeslagen en verstuurd (TLS 1.2+/HTTPS). Toegang tot de database is beperkt tot systemen die daarvoor technisch zijn geautoriseerd. Bij een datalek dat jouw rechten en vrijheden in gevaar brengt, informeren wij je binnen 72 uur.</p>

          <h2>Wijzigingen</h2>
          <p>Als wij deze verklaring wezenlijk aanpassen, informeren wij je per e-mail minimaal <strong>30 dagen</strong> van tevoren. De actuele versie staat altijd op brickme.nl/privacy.</p>
        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-6 text-sm text-muted">
          <Link href="/voorwaarden" className="hover:text-bricktext transition-colors">Algemene voorwaarden</Link>
          <a href="mailto:privacy@brickme.nl" className="hover:text-bricktext transition-colors">privacy@brickme.nl</a>
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
        .legal table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.875rem; }
        .legal th { background: #F5F0E8; text-align: left; padding: 0.6rem 0.75rem; font-weight: 600; color: #2C1F14; border: 1px solid #e8ddd0; }
        .legal td { padding: 0.6rem 0.75rem; border: 1px solid #e8ddd0; color: #8B7355; vertical-align: top; }
        .legal .notice { background: #F5F0E8; border-left: 3px solid #C8583A; padding: 0.875rem 1rem; margin-bottom: 1rem; border-radius: 0.5rem; color: #8B7355; font-size: 0.9rem; line-height: 1.6; }
      `}</style>
    </main>
  );
}
