import Link from "next/link";
import { Users, BookOpen, Building2, ChevronRight, BarChart3, FileText, Settings, UserCheck } from "lucide-react";

export const metadata = {
  title: "Brickme voor professionals — coaches, LSP-facilitators & HR",
  description:
    "Gebruik Brickme met je cliënten, deelnemers of medewerkers. Dashboard voor coaches, LSP-facilitators en HR-professionals.",
};

export default function ProfessionalsPage() {
  return (
    <div className="min-h-dvh bg-secondary text-bricktext">

      {/* ── NAVIGATIE ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-secondary/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="6" width="6" height="4" rx="0.5" fill="white" opacity="0.9"/>
                <rect x="9" y="6" width="6" height="4" rx="0.5" fill="white" opacity="0.9"/>
                <rect x="4" y="10" width="8" height="4" rx="0.5" fill="white"/>
                <rect x="4" y="2" width="8" height="4" rx="0.5" fill="white" opacity="0.7"/>
              </svg>
            </div>
            <span className="font-serif text-xl text-primary">Brickme</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted">
            <Link href="/" className="hover:text-bricktext transition-colors">Voor mijzelf</Link>
            <a href="#rollen" className="hover:text-bricktext transition-colors">Jouw rol</a>
            <a href="#dashboard" className="hover:text-bricktext transition-colors">Dashboard</a>
            <a href="#aan-de-slag" className="hover:text-bricktext transition-colors">Aan de slag</a>
          </div>

          <Link href="/sign-in" className="btn-primary text-sm px-5 py-2.5">
            Inloggen op dashboard →
          </Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="py-24 md:py-36 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(200,88,58,0.07) 0%, transparent 65%)" }}/>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-8">
            <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
              Voor professionals
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] text-bricktext mb-6">
            Brickme als professioneel instrument
          </h1>

          <p className="font-serif italic text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Als coach, LSP-facilitator of HR-professional gebruik je Brickme met je
            cliënten, deelnemers of medewerkers. Jij begeleidt. Brickme verdiept.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-in" className="btn-primary px-8 py-4 text-base">
              Naar mijn dashboard →
            </Link>
            <a href="#rollen" className="btn-ghost px-8 py-4 text-base">
              Bekijk jouw rol
            </a>
          </div>
        </div>
      </section>

      {/* ── DRIE ROLLEN ───────────────────────────────────────────── */}
      <section id="rollen" className="py-24 px-6 bg-surface/50">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent mb-4 block">Jouw rol</span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-bricktext mb-4">
              Drie manieren om Brickme in te zetten
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Coach */}
            <div className="bg-surface border border-border rounded-3xl p-8 flex flex-col">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Coach</p>
              <h3 className="font-serif text-2xl text-bricktext mb-4">Individuele begeleiding</h3>
              <p className="text-sm text-muted leading-relaxed mb-6 flex-grow">
                Koppel cliënten aan jouw account. Volg hun sessies, lees hun rapporten
                (met toestemming) en gebruik de reflecties als gespreksbasis in je
                volgende coachgesprek. LSP in digitale vorm — zonder dat je fysiek
                aanwezig hoeft te zijn.
              </p>
              <ul className="space-y-2 text-sm text-muted mb-8">
                {[
                  "Cliëntenoverzicht met sessiehistorie",
                  "Rapporten inzien na toestemming",
                  "Voortgang volgen over tijd",
                  "Eigen cliënten uitnodigen",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/coach" className="btn-ghost w-full text-center text-sm py-3.5">
                Coach-dashboard →
              </Link>
            </div>

            {/* LSP-Facilitator — featured */}
            <div className="bg-primary rounded-3xl p-8 flex flex-col relative shadow-xl shadow-primary/25 ring-4 ring-primary ring-offset-4 ring-offset-secondary">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-medium bg-accent text-white px-4 py-1.5 rounded-full shadow-sm">
                  Jouw thuis
                </span>
              </div>
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs font-medium text-white/60 uppercase tracking-widest mb-2">LSP-Facilitator</p>
              <h3 className="font-serif text-2xl text-white mb-4">Workshops &amp; groepen</h3>
              <p className="text-sm text-white/75 leading-relaxed mb-6 flex-grow">
                Brickme is gebouwd op de principes van LEGO® Serious Play. Als
                LSP-facilitator run je workshops voor groepen — Brickme beheert de
                deelnemers, genereert individuele én collectieve rapporten, en geeft
                jou inzicht in de groepsdynamiek.
              </p>
              <ul className="space-y-2 text-sm text-white/85 mb-8">
                {[
                  "Workshops aanmaken en beheren",
                  "Deelnemers uitnodigen via link",
                  "Individueel én groepsrapport",
                  "Methodologie van binnenuit gebouwd",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-white/70 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/facilitator" className="bg-white text-primary font-medium w-full text-center text-sm py-3.5 rounded-2xl hover:bg-white/90 transition-colors">
                Facilitator-dashboard →
              </Link>
            </div>

            {/* HR */}
            <div className="bg-surface border border-border rounded-3xl p-8 flex flex-col">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6 text-accent" />
              </div>
              <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">HR &amp; Organisatie</p>
              <h3 className="font-serif text-2xl text-bricktext mb-4">Medewerkersbegeleiding</h3>
              <p className="text-sm text-muted leading-relaxed mb-6 flex-grow">
                Zet Brickme in als onderdeel van onboarding, loopbaangesprekken of
                vitaliteitsprogramma&apos;s. Medewerkers reflecteren zelfstandig;
                jij krijgt anonieme inzichten op teamniveau — zonder privacyschending.
              </p>
              <ul className="space-y-2 text-sm text-muted mb-8">
                {[
                  "Medewerkers uitnodigen per afdeling",
                  "Anonieme teamanalyse",
                  "Integreerbaar in bestaand traject",
                  "Privacy-by-design",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="mailto:info@brickme.nl" className="btn-ghost w-full text-center text-sm py-3.5">
                Neem contact op →
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── DASHBOARD FEATURES ────────────────────────────────────── */}
      <section id="dashboard" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent mb-4 block">Dashboard</span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-bricktext mb-4">
              Alles in één overzicht
            </h2>
            <p className="font-serif italic text-lg text-muted max-w-xl mx-auto">
              Jouw professionele omgeving geeft je real-time inzicht in sessies,
              rapporten en voortgang — van al je cliënten of deelnemers tegelijk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <Users className="w-5 h-5 text-primary" />,
                titel: "Cliënten &amp; deelnemers",
                tekst: "Overzicht van iedereen die aan jou gekoppeld is. Uitnodigen via e-mail of deellink.",
              },
              {
                icon: <FileText className="w-5 h-5 text-primary" />,
                titel: "Rapporten inzien",
                tekst: "Lees sessierapporten van cliënten die toestemming hebben gegeven. Exporteer als PDF.",
              },
              {
                icon: <BarChart3 className="w-5 h-5 text-primary" />,
                titel: "Groepsanalyse",
                tekst: "Zie thema's, patronen en inzichten op groepsniveau — volledig geanonimiseerd.",
              },
              {
                icon: <Settings className="w-5 h-5 text-primary" />,
                titel: "Eigen instellingen",
                tekst: "Stel thema's in per workshop, kies de intakevragen en pas de sessieduur aan.",
              },
            ].map((item) => (
              <div key={item.titel} className="bg-surface border border-border rounded-2xl p-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-serif text-lg text-bricktext mb-2" dangerouslySetInnerHTML={{ __html: item.titel }} />
                <p className="text-sm text-muted leading-relaxed">{item.tekst}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── HOE HET WERKT ─────────────────────────────────────────── */}
      <section id="aan-de-slag" className="py-24 px-6 bg-surface/50">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-16">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent mb-4 block">Aan de slag</span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-bricktext mb-4">
              In drie stappen live
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                nr: "01",
                titel: "Account aanvragen",
                tekst: "Stuur een e-mail naar info@brickme.nl met jouw rol (coach, facilitator of HR). Wij activeren jouw professionele account binnen één werkdag.",
              },
              {
                nr: "02",
                titel: "Cliënten of deelnemers uitnodigen",
                tekst: "Vanuit je dashboard stuur je een uitnodigingslink of e-mail. Zodra zij een account aanmaken en toestemming geven, zie jij hun sessies.",
              },
              {
                nr: "03",
                titel: "Begeleiden via de rapporten",
                tekst: "Gebruik de gegenereerde rapporten als input voor je coaching- of facilitatiegesprek. De reflectie is al gedaan — jij gaat de verdieping in.",
              },
            ].map((stap) => (
              <div key={stap.nr} className="bg-surface border border-border rounded-2xl p-8 flex gap-6 items-start">
                <span className="font-serif text-3xl text-primary/30 leading-none shrink-0 w-12">{stap.nr}</span>
                <div>
                  <h3 className="font-serif text-xl text-bricktext mb-2">{stap.titel}</h3>
                  <p className="text-sm text-muted leading-relaxed">{stap.tekst}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl leading-tight text-bricktext mb-6">
            Klaar om te beginnen?
          </h2>
          <p className="font-serif italic text-lg text-muted mb-10">
            Heb je al een professioneel account? Log direct in.
            Nog geen account? Stuur ons een bericht.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-in" className="btn-primary px-8 py-4 text-base">
              Inloggen op dashboard →
            </Link>
            <a href="mailto:info@brickme.nl?subject=Professioneel account aanvragen" className="btn-ghost px-8 py-4 text-base">
              Account aanvragen
            </a>
          </div>
          <p className="text-xs text-muted mt-8">
            Vragen? Mail naar{" "}
            <a href="mailto:info@brickme.nl" className="text-primary hover:underline">
              info@brickme.nl
            </a>
            {" "}— we reageren binnen één werkdag.
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
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
              <Link href="/" className="hover:text-white/70 transition-colors">Voor mijzelf</Link>
              <Link href="/professionals" className="hover:text-white/70 transition-colors">Voor professionals</Link>
              <a href="/privacy" className="hover:text-white/70 transition-colors">Privacy</a>
              <a href="/voorwaarden" className="hover:text-white/70 transition-colors">Voorwaarden</a>
              <a href="mailto:info@brickme.nl" className="hover:text-white/70 transition-colors">Contact</a>
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
