import Link from "next/link";
import Image from "next/image";

export default async function AfmeldenPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; fout?: string }>;
}) {
  const { ok, fout } = await searchParams;

  return (
    <div className="min-h-dvh bg-[#F5F0E8] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <Link href="/">
          <Image src="/logo.png" alt="Brickme" width={40} height={40} unoptimized className="mx-auto" />
        </Link>

        {fout ? (
          <>
            <h1 className="font-serif text-3xl text-[#2C1F14]">Dat werkte niet</h1>
            <p className="text-[#8B7355] leading-relaxed">
              De afmeldlink lijkt ongeldig. Stuur een mail naar{" "}
              <a href="mailto:hello@brickme.nl" className="text-[#C8583A] hover:underline">
                hello@brickme.nl
              </a>{" "}
              en wij regelen het.
            </p>
          </>
        ) : ok ? (
          <>
            <h1 className="font-serif text-3xl text-[#2C1F14]">Afgemeld</h1>
            <p className="text-[#8B7355] leading-relaxed">
              Je ontvangt geen follow-up e-mails meer van Brickme. Transactionele berichten
              (zoals inlogcodes) blijven gewoon werken.
            </p>
            <p className="text-sm text-[#8B7355]">
              Wil je je weer aanmelden? Dat kan via je{" "}
              <Link href="/profiel" className="text-[#C8583A] hover:underline">
                profielpagina
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl text-[#2C1F14]">Afmelden</h1>
            <p className="text-[#8B7355]">Ongeldige aanvraag.</p>
          </>
        )}

        <Link
          href="/"
          className="inline-block text-sm text-[#8B7355] hover:text-[#2C1F14] transition-colors"
        >
          ← Terug naar Brickme
        </Link>
      </div>
    </div>
  );
}
