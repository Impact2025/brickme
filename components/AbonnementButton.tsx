"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AbonnementButton() {
  const [bezig, setBezig] = useState(false);
  const router = useRouter();

  async function handleKlik() {
    setBezig(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "abonnement" }),
    });

    if (res.status === 401) {
      // Niet ingelogd — stuur naar sign-in met terugkeer naar #prijzen
      router.push("/sign-in?callbackUrl=%2F%23prijzen");
      return;
    }

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setBezig(false);
    }
  }

  return (
    <button
      onClick={handleKlik}
      disabled={bezig}
      className="bg-white text-primary font-medium text-sm text-center py-3.5 rounded-2xl hover:bg-secondary transition-colors shadow-sm w-full disabled:opacity-70"
    >
      {bezig ? "Moment..." : "Start gratis →"}
    </button>
  );
}
