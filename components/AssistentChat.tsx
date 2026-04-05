"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

type Bericht = { rol: "gebruiker" | "ai"; inhoud: string };

const ONBOARDING_ROUTES = ["/start", "/betalen", "/sessie/nieuw", "/sessie/"];

export default function AssistentChat() {
  const { status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [berichten, setBerichten] = useState<Bericht[]>([]);
  const [chips, setChips] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [laden, setLaden] = useState(false);
  const [chipsGeladen, setChipsGeladen] = useState(false);
  const onderRef = useRef<HTMLDivElement>(null);

  const isIngelogd = status === "authenticated";
  const apiEndpoint = isIngelogd ? "/api/assistent" : "/api/assistent-publiek";

  // Laad chips bij eerste opening
  useEffect(() => {
    if (open && !chipsGeladen && status !== "loading") {
      fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ berichten: [] }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.chips) setChips(data.chips);
          setChipsGeladen(true);
        })
        .catch(() => setChipsGeladen(true));
    }
  }, [open, chipsGeladen, status]);

  // Scroll naar onder bij nieuw bericht
  useEffect(() => {
    onderRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [berichten, laden]);

  if (ONBOARDING_ROUTES.some((r) => pathname?.startsWith(r))) return null;

  async function verstuur(tekst: string) {
    if (!tekst.trim() || laden) return;

    const nieuweBerichten: Bericht[] = [...berichten, { rol: "gebruiker", inhoud: tekst }];
    setBerichten(nieuweBerichten);
    setInput("");
    setLaden(true);

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ berichten: nieuweBerichten }),
      });
      const data = await res.json();
      if (data.bericht) {
        setBerichten((prev) => [...prev, { rol: "ai", inhoud: data.bericht }]);
      }
    } catch {
      setBerichten((prev) => [
        ...prev,
        { rol: "ai", inhoud: "Er ging iets mis. Probeer het opnieuw." },
      ]);
    } finally {
      setLaden(false);
    }
  }

  return (
    <>
      {/* Floating knop */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Sluit assistent" : "Open AI assistent"}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 50,
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "9999px",
          backgroundColor: "#C8583A",
          color: "#F5F0E8",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(200,88,58,0.35)",
          transition: "transform 200ms, box-shadow 200ms",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "5.5rem",
            right: "1.5rem",
            zIndex: 50,
            width: "min(22rem, calc(100vw - 2rem))",
            height: "min(32rem, calc(100vh - 7rem))",
            backgroundColor: "#F5F0E8",
            borderRadius: "1rem",
            boxShadow: "0 8px 32px rgba(44,31,20,0.18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid rgba(44,31,20,0.1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#2D4A3E",
              color: "#F5F0E8",
              padding: "0.875rem 1rem",
              fontFamily: "serif",
              fontSize: "0.95rem",
              fontWeight: 600,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Brickme Assistent
          </div>

          {/* Berichten */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {berichten.length === 0 && !laden && (
              <p style={{ color: "#8B7355", fontSize: "0.875rem", margin: 0, lineHeight: 1.5 }}>
                {isIngelogd
                  ? "Hoi! Ik ben je persoonlijke gids in Brickme. Stel een vraag of kies een onderwerp:"
                  : "Hoi! Ik kan je alles vertellen over Brickme. Stel gerust een vraag:"}
              </p>
            )}

            {berichten.map((b, i) => (
              <div
                key={i}
                style={{
                  alignSelf: b.rol === "gebruiker" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  backgroundColor: b.rol === "gebruiker" ? "#C8583A" : "#fff",
                  color: b.rol === "gebruiker" ? "#F5F0E8" : "#2C1F14",
                  padding: "0.6rem 0.875rem",
                  borderRadius: b.rol === "gebruiker" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                  fontSize: "0.875rem",
                  lineHeight: 1.55,
                  boxShadow: "0 1px 4px rgba(44,31,20,0.08)",
                }}
              >
                {b.inhoud}
              </div>
            ))}

            {laden && (
              <div
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#fff",
                  padding: "0.6rem 0.875rem",
                  borderRadius: "1rem 1rem 1rem 0.25rem",
                  fontSize: "0.875rem",
                  color: "#8B7355",
                  boxShadow: "0 1px 4px rgba(44,31,20,0.08)",
                }}
              >
                <span style={{ letterSpacing: "0.1em" }}>···</span>
              </div>
            )}
            <div ref={onderRef} />
          </div>

          {/* Quick-start chips */}
          {chips.length > 0 && berichten.length === 0 && (
            <div
              style={{
                padding: "0 1rem 0.75rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.4rem",
                flexShrink: 0,
              }}
            >
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => verstuur(chip)}
                  style={{
                    background: "none",
                    border: "1px solid #C8583A",
                    color: "#C8583A",
                    borderRadius: "9999px",
                    padding: "0.3rem 0.75rem",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "background 150ms, color 150ms",
                    fontFamily: "sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "#C8583A";
                    el.style.color = "#F5F0E8";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "none";
                    el.style.color = "#C8583A";
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            style={{
              borderTop: "1px solid rgba(44,31,20,0.08)",
              padding: "0.75rem",
              display: "flex",
              gap: "0.5rem",
              flexShrink: 0,
              backgroundColor: "#fff",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && verstuur(input)}
              placeholder="Stel een vraag..."
              disabled={laden}
              style={{
                flex: 1,
                border: "1px solid rgba(44,31,20,0.15)",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
                outline: "none",
                backgroundColor: "#F5F0E8",
                color: "#2C1F14",
                fontFamily: "sans-serif",
              }}
            />
            <button
              onClick={() => verstuur(input)}
              disabled={!input.trim() || laden}
              style={{
                backgroundColor: (input.trim() && !laden) ? "#C8583A" : "#e0d5c8",
                color: (input.trim() && !laden) ? "#F5F0E8" : "#8B7355",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.75rem",
                cursor: (input.trim() && !laden) ? "pointer" : "default",
                transition: "background 150ms",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Verstuur"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
