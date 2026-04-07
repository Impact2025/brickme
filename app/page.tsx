import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Zap, Heart, User, Users, GitFork, Feather, MessageCircle, BookOpen, Bot } from "lucide-react";
import FaqAccordion from "@/components/FaqAccordion";
import { MobileNav } from "@/components/MobileNav";
import { AbonnementButton } from "@/components/AbonnementButton";

export const metadata: Metadata = {
  title: "Brickme — Bouw wat je niet kunt zeggen",
  description:
    "Een persoonlijke reflectiesessie waarbij je bouwt met LEGO, fotografeert en een AI-reflectie ontvangt. Nederlandstalig, methodologisch gegrond, voor mensen op een kruispunt.",
  alternates: { canonical: "https://brickme.nl" },
  openGraph: {
    title: "Brickme — Bouw wat je niet kunt zeggen",
    description: "Een nieuwe manier van zelfreflectie. Bouw, fotografeer, begrijp.",
    url: "https://brickme.nl",
    siteName: "Brickme",
    type: "website",
    locale: "nl_NL",
    images: [{ url: "https://brickme.nl/og-image.png", width: 1200, height: 630 }],
  },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Heb ik LEGO nodig?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LEGO is de ideale keuze, en de methode is er ook op gebouwd. Heb je geen LEGO bij de hand? Dan kun je ook andere bouwmaterialen gebruiken. Maar investeer in een setje, het maakt het verschil.",
      },
    },
    {
      "@type": "Question",
      name: "Is dit therapie?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nee. Brickme is een reflectietool, geen behandeling. Als je kampt met ernstige psychische klachten, raden wij altijd aan om professionele hulp te zoeken.",
      },
    },
    {
      "@type": "Question",
      name: "Wat gebeurt er met mijn foto's?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Je foto wordt alleen gebruikt om jouw reflectie te genereren. Daarvoor wordt de foto tijdelijk gedeeld met Anthropic via een beveiligde API. Anthropic gebruikt jouw foto niet voor het trainen van modellen. De afbeelding staat uitsluitend in jouw eigen sessie-archief.",
      },
    },
    {
      "@type": "Question",
      name: "Zijn mijn gegevens veilig?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja. Alle verbindingen zijn versleuteld via HTTPS/TLS. Betaalgegevens worden volledig verwerkt door Stripe — wij zien nooit jouw kaartgegevens. Jouw wachtwoord slaan wij niet leesbaar op.",
      },
    },
    {
      "@type": "Question",
      name: "Wie ziet mijn sessie-inhoud?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Alleen jij. Standaard is alles privé. Een coach ziet jouw sessies alleen als jij die relatie actief aangaat via de app.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe verschilt dit van een chatbot?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Een chatbot praat met je. Brickme laat je bouwen. Je handen activeren andere delen van je brein dan je taalcentrum. De reflectie is gericht op jouw specifieke foto, niet op generieke coachingsvragen.",
      },
    },
    {
      "@type": "Question",
      name: "Kan mijn coach of therapeut mijn rapport zien?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Alleen als jij dat wil. Je kunt je rapport exporteren als PDF en delen met wie jij kiest. Standaard is alles privé.",
      },
    },
  ],
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Brickme",
  url: "https://brickme.nl",
  description:
    "Een persoonlijke reflectiesessie waarbij je bouwt met LEGO, fotografeert en een AI-reflectie ontvangt.",
  publisher: {
    "@type": "Organization",
    name: "WeAreImpact B.V.",
    url: "https://weareimpact.nl",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-secondary text-bricktext">

      {/* ── NAVIGATIE ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-secondary/80 backdrop-blur-md border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Brickme" width={32} height={32} unoptimized />
            <span className="font-serif text-xl text-primary">Brickme</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted">
            <a href="#hoe-het-werkt" className="hover:text-bricktext transition-colors">Hoe het werkt</a>
            <a href="#themas" className="hover:text-bricktext transition-colors">Thema&apos;s</a>
            <a href="#over" className="hover:text-bricktext transition-colors">Over</a>
            <a href="#prijzen" className="hover:text-bricktext transition-colors">Prijzen</a>
            <Link href="/blog" className="hover:text-bricktext transition-colors">Blog</Link>
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
            <a href="https://weareimpact.nl/" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20 hover:bg-accent/15 transition-colors">
              Een concept van WeAreImpact
            </a>
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
            <span>6 levensthema&apos;s</span>
            <span className="hidden sm:block w-px h-4 bg-border"/>
            <span>45–75 minuten per sessie</span>
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
              Een Brickme-sessie duurt 45 tot 75 minuten. Je hebt alleen je telefoon
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
              Vincent van Munster · oprichter
            </span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-bricktext mb-8">
              Ik geloof dat het anders kan.
            </h2>
            <div className="space-y-5 font-serif text-lg text-muted leading-relaxed">
              <p>
                Jarenlang werkte ik als bestuurder en directeur aan systemen die mensen moesten helpen.
                Tot ik merkte dat de échte vragen — wie ben ik, wat wil ik, waarheen — nergens
                beantwoord werden.
              </p>
              <p>
                Dat is waarom ik Brickme bouwde.
              </p>
              <p className="border-l-2 border-primary pl-5 text-bricktext font-medium">
                "Ik ontwerp geen apps om je online te houden. Ik bouw tools die je helpen offline te leven."
              </p>
              <p className="text-primary font-medium">— Vincent</p>
            </div>
            <ul className="mt-8 space-y-3">
              {[
                "Gebaseerd op bewezen LSP-methodiek, geen coach, wel structuur",
                "Jouw data is van jou. Altijd. Geen adverteerders, geen analyses",
                "Gemaakt in Nederland, voor mensen die écht verder willen",
                "Geen antwoorden. Wel de juiste vragen.",
              ].map((punt) => (
                <li key={punt} className="flex items-start gap-3 text-sm text-muted">
                  <span className="text-primary flex-shrink-0 mt-0.5">✦</span>
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
              <p className="text-sm text-primary font-medium mt-1">Sociaal ondernemer &amp; oprichter van Brickme</p>

              <div className="mt-5 mb-1">
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-accent">WeAreImpact</span>
                <p className="text-xs text-muted mt-1 font-medium">Innovatie met een sociaal hart.</p>
              </div>

              <p className="font-serif text-sm text-muted leading-relaxed mt-3">
                Geen adviesbureau dat rapporten schrijft en weer vertrekt. Iemand die naast je staat,
                de handen uit de mouwen steekt — en pas weggaat als jouw team het zelf kan voortzetten.
              </p>

              <ul className="mt-5 space-y-2">
                {[
                  "15+ jaar ervaring in zorg, welzijn en gemeenten",
                  "Gecertificeerd Serious Play facilitator",
                  "Bouwen én besturen — geen keuze tussen de twee",
                  "Innovatie die blijft werken als ik weg ben",
                ].map((punt) => (
                  <li key={punt} className="flex items-start gap-2 text-xs text-muted">
                    <span className="text-primary flex-shrink-0">✦</span>
                    {punt}
                  </li>
                ))}
              </ul>

              <a href="https://weareimpact.nl" target="_blank" rel="noopener noreferrer" className="inline-block mt-6 text-xs text-accent hover:underline font-medium">
                weareimpact.nl ↗
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
              <AbonnementButton />
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
              <div className="flex items-center gap-2.5 mb-3">
                <Image src="/logo.png" alt="Brickme" width={28} height={28} unoptimized />
                <span className="font-serif text-lg text-white/90">Brickme.nl</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Een concept van{" "}
                <a href="https://weareimpact.nl/" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors underline underline-offset-2">WeAreImpact</a>
                {" "}door Vincent van Munster
              </p>
              {/* Social media */}
              <div className="flex items-center gap-3 mt-4">
                <a href="https://www.instagram.com/brickme.nl/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white/90 transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://www.facebook.com/brickmelsp" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white/90 transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://x.com/BrickmeLSP" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white/90 transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.pinterest.com/brickmeLSP" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white/90 transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
                </a>
              </div>
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
      />
    </div>
  );
}
