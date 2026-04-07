"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#hoe-het-werkt", label: "Hoe het werkt" },
  { href: "#themas",        label: "Thema's" },
  { href: "#over",          label: "Over" },
  { href: "#prijzen",       label: "Prijzen" },
  { href: "/blog",          label: "Blog" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  // Sluit menu bij resize naar desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Voorkom body scroll als menu open is
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Hamburger knop — alleen zichtbaar op mobiel */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Menu sluiten" : "Menu openen"}
        aria-expanded={open}
        className="md:hidden flex flex-col justify-center gap-[5px] w-10 h-10 rounded-xl hover:bg-border transition-colors"
      >
        <span className={`block h-[2px] w-5 mx-auto bg-bricktext rounded-full transition-all duration-300 ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
        <span className={`block h-[2px] w-5 mx-auto bg-bricktext rounded-full transition-all duration-300 ${open ? "opacity-0" : ""}`} />
        <span className={`block h-[2px] w-5 mx-auto bg-bricktext rounded-full transition-all duration-300 ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
      </button>

      {/* Overlay + slide-down drawer */}
      {open && (
        <>
          {/* Achtergrond dimmer */}
          <div
            className="md:hidden fixed inset-0 top-[57px] bg-bricktext/20 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="md:hidden fixed left-0 right-0 top-[57px] z-50 bg-secondary border-b border-border shadow-lg animate-slide-up">
            <nav className="px-6 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-muted hover:text-bricktext hover:bg-surface transition-all duration-150 py-3 px-3 rounded-xl text-base"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
                {session?.user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="text-muted hover:text-bricktext hover:bg-surface transition-all duration-150 py-3 px-3 rounded-xl text-base text-center"
                    >
                      Mijn sessies
                    </Link>
                    <button
                      onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="text-muted hover:text-bricktext hover:bg-surface transition-all duration-150 py-3 px-3 rounded-xl text-base text-center w-full"
                    >
                      Uitloggen
                    </button>
                  </>
                ) : (
                  <Link
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                    className="text-muted hover:text-bricktext hover:bg-surface transition-all duration-150 py-3 px-3 rounded-xl text-base text-center"
                  >
                    Inloggen
                  </Link>
                )}
                <Link
                  href="/start"
                  onClick={() => setOpen(false)}
                  className="btn-primary block text-center py-3.5 text-base"
                >
                  Begin mijn sessie →
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
