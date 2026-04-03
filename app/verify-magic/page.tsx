"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

function VerifyMagic() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"bezig" | "fout">("bezig");
  const [fout, setFout] = useState("");

  useEffect(() => {
    const token = params.get("token");
    const email = params.get("email");

    if (!token || !email) {
      setFout("Ongeldige link.");
      setStatus("fout");
      return;
    }

    signIn("credentials", { email, magicToken: token, redirect: false }).then((result) => {
      if (result?.error) {
        setFout("De link is verlopen of ongeldig. Vraag een nieuwe aan.");
        setStatus("fout");
      } else {
        router.push("/start");
      }
    });
  }, [params, router]);

  return (
    <main className="min-h-dvh bg-secondary flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <Image src="/icon.svg" alt="Brickme" width={56} height={56} unoptimized className="mx-auto mb-6" />

        {status === "bezig" ? (
          <>
            <h1 className="text-2xl font-serif text-bricktext mb-2">Inloggen...</h1>
            <p className="text-muted text-sm">Even geduld, je wordt doorgestuurd.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-serif text-bricktext mb-2">Link verlopen</h1>
            <p className="text-muted text-sm mb-6">{fout}</p>
            <a
              href="/sign-in"
              className="btn-primary inline-block px-6 py-3"
            >
              Nieuwe link aanvragen
            </a>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyMagicPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-secondary" />}>
      <VerifyMagic />
    </Suspense>
  );
}
