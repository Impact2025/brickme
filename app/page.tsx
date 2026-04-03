import Link from "next/link";
import { Zap, Heart, User, Users, GitFork, Feather, MessageCircle, BookOpen, Bot } from "lucide-react";
import FaqAccordion from "@/components/FaqAccordion";
import { MobileNav } from "@/components/MobileNav";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-secondary text-bricktext">

      {/* ── NAVIGATIE ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-secondary/80 backdrop-blur-md border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <g fill="#C8583A">
                <path transform="translate(33,33) rotate(-45)" d="M -28,-24 A 14,14,0,0,0,0,-24 A 14,14,0,0,0,28,-24 Q 28,0 0,24 Q -28,0 -28,-24 Z"/>
                <path transform="translate(67,33) rotate(45)"  d="M -28,-24 A 14,14,0,0,0,0,-24 A 14,14,0,0,0,28,-24 Q 28,0 0,24 Q -28,0 -28,-24 Z"/>
                <path transform="translate(33,67) rotate(225)" d="M -28,-24 A 14,14,0,0,0,0,-24 A 14,14,0,0,0,28,-24 Q 28,0 0,24 Q -28,0 -28,-24 Z"/>
                <path transform="translate(67,67) rotate(135)" d="M -28,-24 A 14,14,0,0,0,0,-24 A 14,14,0,0,0,28,-24 Q 28,0 0,24 Q -28,0 -28,-24 Z"/>
              </g>
            </svg>
            <span className="font-serif text-xl text-primary">Brickme</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted">
            <a href="#hoe-het-werkt" className="hover:text-bricktext transition-colors">Hoe het werkt</a>
            <a href="#themas" className="hover:text-bricktext transition-colors">Thema&apos;s</a>
            <a href="#over" className="hover:text-bricktext transition-colors">Over</a>
            <a href="#prijzen" className="hover:text-bricktext transition-colors">Prijzen</a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/start" className="hidden md:inline-flex btn-primary text-sm px-5 py-2.5">
              Begin mijn sessie →
            </Link>
            <MobileNav />
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 py-24 text-center relative overflow-hidden">
        {/* achtergrond blob */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(700px,90vw)] h-[min(700px,90vw)] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(200,88,58,0.07) 0%, transparent 65%)" }}/>
          <div className="absolute bottom-1/4 right-1/4 w-[min(400px,60vw)] h-[min(400px,60vw)] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(45,74,62,0.07) 0%, transparent 65%)" }}/>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* badge */}
          <div className="inline-flex items-center gap-2 mb-8">
            <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
              Een concept van WeAreImpact
            </span>
          </div>

          {/* kop */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.0] tracking-tight text-bricktext mb-6">
            Bouw wat je<br/>
            <em className="text-primary">niet kunt zeggen</em>
          </h1>

          {/* subtitel */}
          <p className="font-serif text-xl md:text-2xl text-muted leading-relaxed max-w-2xl mx-auto mb-10">
            Sommige dingen zijn te groot voor woorden. Brickme helpt je ze zichtbaar te maken.
            Door te bouwen, te fotograferen en een reflectie te ontvangen van Brickme.
          </p>

          {/* knoppen */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Link href="/start" className="btn-primary text-lg px-10 py-4">
              Begin mijn sessie →
            </Link>
            <a href="#hoe-het-werkt" className="btn-ghost text-lg px-10 py-4">
              Hoe het werkt
            </a>
          </div>

          {/* statistieken */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted">
            <span>5 levensthema&apos;s</span>
            <span className="hidden sm:block w-px h-4 bg-border"/>
            <span>30–45 minuten per sessie</span>
            <span className="hidden sm:block w-px h-4 bg-border"/>
            <span>1 concrete eerste stap</span>
          </div>
        </div>
      </section>

      {/* ── DE PIJN ────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 bg-surface">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          <div>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary mb-4 block">
              Waarom Brickme bestaat
            </span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-bricktext mb-8">
              Praten over een probleem<br/>
              <em>lost het zelden op</em>
            </h2>
            <div className="space-y-5 font-serif text-lg text-muted leading-relaxed">
              <p>
                Je weet wat er speelt. Je hebt er al honderd keer over nagedacht. Misschien
                heb je het uitgesproken, opgeschreven, besproken. En toch blijft het hangen.
              </p>
              <p>
                Dat is geen onwil. Het is de manier waarop ons brein werkt. Grote emoties,
                diepe overtuigingen en vastgelopen patronen wonen niet in het taalcentrum.
                Ze wonen in je handen, je lichaam, je instinct.
              </p>
              <p>
                Brickme is gebaseerd op LEGO® Serious Play, een methode die wereldwijd
                gebruikt wordt door coaches, therapeuten en organisaties. Niet met LEGO
                verplicht, maar met hetzelfde principe:{" "}
                <strong className="font-medium text-bricktext">
                  bouw het, dan begrijp je het.
                </strong>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* quote */}
            <blockquote className="relative bg-secondary rounded-3xl p-8 border border-border">
              <div className="absolute -top-3 left-6 text-6xl leading-none text-primary/20 font-serif select-none">&ldquo;</div>
              <p className="font-serif text-xl md:text-2xl text-bricktext leading-relaxed mb-5 relative z-10">
                Coaching is te duur. Journaling is te koud. Chatbots zijn te oppervlakkig.
                Er was niets dat echt bij de kern kwam. Totdat ik het letterlijk
                in mijn handen had.
              </p>
              <footer className="text-sm text-muted">
                Wat gebruikers zeggen na hun eerste sessie
              </footer>
            </blockquote>

            {/* drie pillars */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <MessageCircle size={18} strokeWidth={1.5} />, label: "Coaching is te duur" },
                { icon: <BookOpen size={18} strokeWidth={1.5} />, label: "Journaling is te koud" },
                { icon: <Bot size={18} strokeWidth={1.5} />, label: "Chatbots zijn oppervlakkig" },
              ].map((p) => (
                <div key={p.label} className="bg-secondary rounded-2xl p-4 border border-border text-center">
                  <div className="flex justify-center mb-2 text-muted">{p.icon}</div>
                  <p className="text-xs text-muted leading-snug">{p.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── HOE HET WERKT ──────────────────────────────────────────── */}
      <section id="hoe-het-werkt" className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent mb-4 block">
              Hoe het werkt
            </span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-bricktext mb-4">
              Vier stappen. Eén echt inzicht.
            </h2>
            <p className="font-serif text-lg text-muted max-w-2xl mx-auto">
              Een Brickme-sessie duurt 30 tot 45 minuten. Je hebt alleen je telefoon
              en LEGO nodig. De methode is gebouwd op wat LEGO met je handen en je hoofd doet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                num: "01",
                titel: "Kies je thema",
                tekst:
                  "Carrière, liefde, identiteit, verbinding of een kruispunt. Jij bepaalt waar je op dit moment mee zit. Er is geen goed of fout antwoord. Alleen jouw waarheid.",
                accent: false,
              },
              {
                num: "02",
                titel: "Een gesprek dat echt luistert",
                tekst:
                  "Brickme stelt vragen, niet als een formulier maar als een nieuwsgierig iemand die echt wil begrijpen wat er speelt. Geen standaard script, altijd op maat.",
                accent: false,
              },
              {
                num: "03",
                titel: "Bouwen, fotograferen, beschrijven",
                tekst:
                  "Drie bouwfases, elk met een verborgen vraag. Je bouwt iets, fotografeert het en vertelt wat je ziet. Jouw handen weten dingen die je hoofd nog niet weet.",
                accent: false,
              },
              {
                num: "04",
                titel: "Een reflectie die raak is",
                tekst:
                  "Brickme kijkt naar je foto. Specifiek, niet generiek. Het beschrijft wat het ziet, verbindt het met wat jij hebt gezegd, en stelt één vraag. De ene vraag die overblijft.",
                accent: true,
              },
            ].map((stap) => (
              <div
                key={stap.num}
                className={
                  stap.accent
                    ? "bg-primary text-secondary rounded-3xl p-7"
                    : "bg-surface border border-border rounded-3xl p-7"
                }
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stap.accent ? "bg-white/15" : "bg-primary/10"}`}>
                    <span className={`text-sm font-medium ${stap.accent ? "text-white" : "text-primary"}`}>{stap.num}</span>
                  </div>
                </div>
                <h3 className={`font-serif text-xl mb-3 ${stap.accent ? "text-white" : "text-bricktext"}`}>
                  {stap.titel}
                </h3>
                <p className={`text-sm leading-relaxed ${stap.accent ? "text-white/80" : "text-muted"}`}>
                  {stap.tekst}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── RAPPORT BLOK ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 bg-accent relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="max-w-6xl mx-auto relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/50 mb-4 block">
              Aan het einde ontvang je
            </span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-white mb-5">
              Jouw persoonlijk<br/>reflectierapport
            </h2>
            <p className="font-serif text-lg text-white/70 mb-8 leading-relaxed">
              Een mooi opgemaakt document met al je bouwfoto&apos;s, de reflecties van Brickme,
              jouw antwoorden en één concrete eerste stap.{" "}
              <strong className="text-white font-medium">Iets dat je bewaart.</strong>
            </p>
            <Link href="/start" className="inline-flex items-center gap-2 bg-white text-accent font-medium px-7 py-3.5 rounded-2xl hover:bg-secondary transition-colors text-sm shadow-lg shadow-black/20">
              Begin mijn sessie →
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-5">
              Jouw rapport bevat
            </p>
            <ul className="space-y-4">
              {[
                { titel: "Alle foto's van je bouwsels", sub: "Drie fases, drie beelden" },
                { titel: "Persoonlijke reflectie per fase", sub: "Specifiek op jouw bouwsel, niet generiek" },
                { titel: "Drie kernthema's die naar voren kwamen", sub: "Samengesteld uit jouw hele sessie" },
                { titel: "Jouw stemming voor én na de sessie", sub: "Merk het verschil" },
                { titel: "Één concrete eerste stap", sub: "Van jezelf, niet van een coach" },
              ].map((item) => (
                <li key={item.titel} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{item.titel}</p>
                    <p className="text-white/45 text-xs mt-0.5">{item.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* ── LSP EXPERTISE ─────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent mb-4 block">
              Niet alleen technologie
            </span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-bricktext mb-4">
              Gebouwd door een gecertificeerd<br/>
              <em className="text-primary">LSP-facilitator</em>
            </h2>
            <p className="font-serif text-lg text-muted max-w-2xl mx-auto">
              Brickme is niet generiek. Het is opgebouwd op de kernmethodologie
              van LEGO® Serious Play, door iemand die de methode zelf heeft geleerd,
              toegepast en vertaald naar digitaal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
              {
                titel: "Hand knowledge",
                tekst: "Bouwen activeert andere cognities dan praten. Brickme begrijpt dit en duwt je nooit naar rationele verklaringen als je handen al weten wat er speelt.",
              },
              {
                titel: "Het model is de werkelijkheid",
                tekst: "In LSP is een bouwsel geen symbool. Het ís de werkelijkheid van de bouwer. Brickme interpreteert nooit zonder jouw bevestiging. Het observeert, en vraagt.",
              },
              {
                titel: "Één vraag per observatie",
                tekst: "Een gecertificeerd facilitator stapelt geen vragen. Brickme ook niet. Één gerichte observatie, één vraag. Dan ruimte voor jou.",
              },
            ].map((p) => (
              <div key={p.titel} className="bg-surface border border-border rounded-3xl p-7">
                <div className="w-1 h-8 bg-primary rounded-full mb-5" />
                <h3 className="font-serif text-lg text-bricktext mb-3">{p.titel}</h3>
                <p className="text-sm text-muted leading-relaxed">{p.tekst}</p>
              </div>
            ))}
          </div>

          <div className="bg-accent rounded-3xl p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-widest mb-3">Het verschil</p>
              <h3 className="font-serif text-2xl md:text-3xl text-white mb-4 leading-snug">
                Een chatbot vraagt.<br/>Een facilitator <em>kijkt</em>.
              </h3>
              <p className="font-serif text-white/70 leading-relaxed text-base">
                Brickme kijkt naar positie, hoogte, verbinding, kleur en wat ontbreekt.
                Precies zoals een LSP-facilitator voor een fysiek model staat.
                Niet wat het &ldquo;betekent&rdquo;. Wat er staat.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                { label: "Wat staat centraal versus aan de rand?" },
                { label: "Wat is hoog gebouwd, wat laag gehouden?" },
                { label: "Wat raakt elkaar en wat staat ver weg?" },
                { label: "Wat ontbreekt opvallend?" },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 flex-shrink-0" />
                  <p className="text-white/80 text-sm font-serif">{item.label}</p>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* ── DE 6 THEMA'S ──────────────────────────────────────────── */}
      <section id="themas" className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary mb-4 block">
              De zes thema&apos;s
            </span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-bricktext mb-4">
              Waar loop jij mee rond?
            </h2>
            <p className="font-serif text-lg text-muted max-w-xl mx-auto">
              Kies het thema dat het dichtst bij je zit. Brickme past de intake,
              de bouwvragen en de reflectie volledig aan op jouw keuze.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: "werk", label: "Werk & energie", sub: "Ik loop leeg", icon: <Zap size={20} strokeWidth={1.5} /> },
              { id: "relatie", label: "Liefde & relatie", sub: "Ik voel me niet gezien", icon: <Heart size={20} strokeWidth={1.5} /> },
              { id: "identiteit", label: "Wie ben ik", sub: "Ik weet niet meer wie ik ben", icon: <User size={20} strokeWidth={1.5} />, featured: true },
              { id: "verbinding", label: "Verbinding", sub: "Ik sta er alleen voor", icon: <Users size={20} strokeWidth={1.5} /> },
              { id: "kruispunt", label: "Kruispunt", sub: "Ik weet niet welke kant ik op moet", icon: <GitFork size={20} strokeWidth={1.5} /> },
              { id: "rouw", label: "Rouw & verlies", sub: "Ik weet niet hoe ik verder moet", icon: <Feather size={20} strokeWidth={1.5} /> },
            ].map((t) => (
              <Link
                key={t.id}
                href={`/start?thema=${t.id}`}
                className={
                  t.featured
                    ? "bg-primary text-secondary rounded-3xl p-6 shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-300"
                    : "bg-surface border border-border rounded-3xl p-6 hover:border-primary hover:shadow-md transition-all duration-300"
                }
              >
                <div className={`mb-4 ${t.featured ? "text-white/80" : "text-muted"}`}>{t.icon}</div>
                <h3 className={`font-serif text-base mb-1 ${t.featured ? "text-white" : "text-bricktext"}`}>
                  {t.label}
                </h3>
                <p className={`text-sm font-serif ${t.featured ? "text-white/70" : "text-muted"}`}>
                  &ldquo;{t.sub}&rdquo;
                </p>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── WIE WE ZIJN ───────────────────────────────────────────── */}
      <section id="over" className="py-24 md:py-32 px-6 bg-surface">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          <div>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary mb-4 block">
              Wie we zijn
            </span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-bricktext mb-8">
              Innovatie met een sociaal hart
            </h2>
            <div className="space-y-5 font-serif text-lg text-muted leading-relaxed">
              <p>
                Ik heb jaren gewerkt in het welzijn. Als bestuurder, als kwartiermaker,
                als iemand die gelooft dat technologie mensen verder kan helpen als je haar
                met een sociaal hart inzet.
              </p>
              <p>
                Brickme bouwde ik voor mezelf. Ik stond op een kruispunt, zakelijk én privé.
                En ergens tussen de blokjes ontdekte ik waar ik energie van krijg, hoe ik
                in mijn relatie sta, wat ik werkelijk wil. Niet door erover te praten.
                Door het te bouwen.
              </p>
              <p>
                Dat gevoel wil ik voor zoveel mogelijk mensen creëren. Geen grote woorden.
                Gewoon een uur de tijd nemen voor jezelf, en daarna net iets scherper weten
                wie je bent en wat je wil.
              </p>
              <p className="font-medium text-bricktext">
                Dat is mijn missie. Dat is Brickme.
              </p>
            </div>
            <ul className="mt-8 space-y-3">
              {[
                "Gecertificeerd LSP-facilitator aan het roer, geen hobbyist maar methodologie van binnenuit",
                "Observeert vóórdat het interpreteert, zoals een echte facilitator voor een model staat",
                "Gebouwd voor de Nederlandse markt, in het Nederlands",
                "Privacyvriendelijk, jouw sessies zijn van jou",
              ].map((punt) => (
                <li key={punt} className="flex items-start gap-3 text-sm text-muted">
                  <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  {punt}
                </li>
              ))}
            </ul>
          </div>

          {/* Vincent kaart */}
          <div className="bg-secondary rounded-3xl border border-border overflow-hidden shadow-sm">
            <div className="h-28 relative" style={{ background: "linear-gradient(135deg, #2D4A3E 0%, #3D6A5E 60%, #476558 100%)" }}>
              <div className="absolute bottom-0 left-8 translate-y-1/2">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center border-4 border-secondary shadow-lg">
                  <span className="text-2xl font-serif text-white font-bold">Vm</span>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <span className="text-xs text-white/60 bg-white/10 px-3 py-1 rounded-full">Oprichter</span>
              </div>
            </div>
            <div className="pt-14 pb-8 px-8">
              <h3 className="font-serif text-xl text-bricktext">Vincent van Munster</h3>
              <p className="text-sm text-primary font-medium mt-1 mb-4">Sociaal ondernemer &amp; oprichter van Brickme</p>
              <p className="text-sm text-muted leading-relaxed mb-5">
                Meer dan 15 jaar bestuurder en kwartiermaker in de zorg- en welzijnssector.
                Brickme is voortgekomen uit zijn eigen kruispunt, zakelijk én privé.
                Die ervaring staat aan de basis van elke sessie.
              </p>
              <blockquote className="border-l-2 border-primary/30 pl-4 font-serif text-sm text-muted mb-5">
                &ldquo;Geen grote woorden. Gewoon een uur de tijd nemen voor jezelf,
                en daarna net iets scherper weten wie je bent en wat je wil.&rdquo;
              </blockquote>
              <a href="https://weareimpact.nl" className="text-xs text-accent hover:underline font-medium">
                Een WeAreImpact venture · weareimpact.nl ↗
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ── PRIJZEN ────────────────────────────────────────────────── */}
      <section id="prijzen" className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent mb-4 block">Prijzen</span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-bricktext mb-4">
              Eenvoudig en eerlijk
            </h2>
            <p className="font-serif text-lg text-muted max-w-xl mx-auto">
              Geen abonnement dat je vergeet op te zeggen. Betaal per sessie,
              of kies een bundel als je dieper wil gaan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

            {/* Losse sessie */}
            <div className="bg-surface border border-border rounded-3xl p-8 flex flex-col">
              <p className="text-xs font-medium text-muted uppercase tracking-widest mb-3">Losse sessie</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-serif text-4xl text-bricktext">€&nbsp;14,95</span>
              </div>
              <p className="text-sm text-muted mb-7">Eenmalig proberen. Geen account nodig, geen verplichtingen.</p>
              <ul className="space-y-3 flex-grow mb-8 text-sm text-muted">
                {[
                  "Volledige sessie van 30–45 min",
                  "Intake op maat",
                  "3 bouwfases met timer",
                  "Claude Vision reflectie per foto",
                  "Persoonlijk PDF-rapport",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/start" className="btn-ghost w-full text-center text-sm py-3.5">
                Probeer eenmalig
              </Link>
            </div>

            {/* Maandabonnement — featured */}
            <div className="bg-primary rounded-3xl p-8 flex flex-col relative shadow-xl shadow-primary/25 ring-4 ring-primary ring-offset-4 ring-offset-secondary">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-medium bg-accent text-white px-4 py-1.5 rounded-full shadow-sm">
                  Meest gekozen
                </span>
              </div>
              <p className="text-xs font-medium text-white/60 uppercase tracking-widest mb-3">Maandabonnement</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-serif text-4xl text-white">€&nbsp;9,95</span>
                <span className="text-sm text-white/70">/ mnd</span>
              </div>
              <p className="text-sm text-white/70 mb-7">Voor mensen die vaker willen reflecteren en hun groei willen volgen.</p>
              <ul className="space-y-3 flex-grow mb-8 text-sm text-white/90">
                {[
                  "Onbeperkt sessies",
                  "Bouwarchief, al je sessies bewaard",
                  "Stemming voor/na tracking",
                  "Check-ins na verloop van tijd",
                  { label: "Eerste maand gratis", bold: true },
                ].map((f) => (
                  <li key={typeof f === "string" ? f : f.label} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-white/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {typeof f === "string" ? f : <strong>{f.label}</strong>}
                  </li>
                ))}
              </ul>
              <Link href="/start" className="bg-white text-primary font-medium text-sm text-center py-3.5 rounded-2xl hover:bg-secondary transition-colors shadow-sm">
                Start gratis →
              </Link>
            </div>

            {/* Coach licentie */}
            <div className="bg-surface border border-border rounded-3xl p-8 flex flex-col">
              <p className="text-xs font-medium text-muted uppercase tracking-widest mb-3">Coach licentie</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-serif text-4xl text-bricktext">€&nbsp;79</span>
                <span className="text-sm text-muted">/ mnd</span>
              </div>
              <p className="text-sm text-muted mb-7">Voor LSP-facilitators en coaches die Brickme inzetten bij hun cliënten.</p>
              <ul className="space-y-3 flex-grow mb-8 text-sm text-muted">
                {[
                  "Onbeperkt cliëntsessies",
                  "Coach-dashboard (met toestemming cliënt)",
                  "Rapporten inzien vóór sessie",
                  "Wit-label mogelijkheid",
                  "Ondersteuning via WeAreImpact",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="mailto:info@weareimpact.nl" className="btn-ghost w-full text-center text-sm py-3.5">
                Contact opnemen
              </a>
            </div>

          </div>

          <p className="text-center text-sm text-muted mt-8">
            Organisaties &amp; welzijnspartners:{" "}
            <a href="mailto:info@weareimpact.nl" className="text-primary hover:underline">
              neem contact op voor maatwerk.
            </a>
          </p>

        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 bg-surface">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary mb-4 block">
              Veelgestelde vragen
            </span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-bricktext">
              Alles wat je wil weten
            </h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto bg-primary rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
              backgroundSize: "16px 16px",
            }}
          />
          <div className="relative">
            <h2 className="font-serif text-4xl md:text-6xl leading-tight text-white mb-5">
              Klaar om te bouwen?
            </h2>
            <p className="font-serif text-xl text-white/75 mb-10 max-w-lg mx-auto">
              Je eerste sessie kost € 14,95. Of start vandaag gratis
              met de eerste maand van je abonnement.
            </p>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 bg-white text-primary font-medium text-lg px-12 py-4 rounded-2xl hover:bg-secondary active:scale-95 transition-all duration-150 shadow-xl shadow-black/20"
            >
              Begin mijn sessie →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-bricktext">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="6" width="6" height="4" rx="0.5" fill="white" opacity="0.9"/>
                    <rect x="9" y="6" width="6" height="4" rx="0.5" fill="white" opacity="0.9"/>
                    <rect x="4" y="10" width="8" height="4" rx="0.5" fill="white"/>
                    <rect x="4" y="2" width="8" height="4" rx="0.5" fill="white" opacity="0.7"/>
                  </svg>
                </div>
                <span className="font-serif text-lg text-white/90">Brickme.nl</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Een concept van WeAreImpact door Vincent van Munster
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-white/40">
              <Link href="/professionals" className="hover:text-white/70 transition-colors">Voor professionals</Link>
              <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
              <Link href="/voorwaarden" className="hover:text-white/70 transition-colors">Voorwaarden</Link>
              <a href="mailto:info@brickme.nl" className="hover:text-white/70 transition-colors">Contact</a>
              <a href="https://weareimpact.nl" className="hover:text-white/70 transition-colors">WeAreImpact.nl</a>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-white/25">
            <span>© 2025 Brickme · WeAreImpact B.V. · KVK 70285888</span>
            <span>LEGO® is een trademark van The LEGO Group. Brickme is hier niet aan verbonden.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
