"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <main className="min-h-dvh bg-[#F5F0E8] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-xs w-full space-y-6">
        {/* Icoon */}
        <div className="w-16 h-16 rounded-2xl bg-[#C8583A]/10 flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8583A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 6s4-4 11-4 11 4 11 4"/>
            <path d="M1 10s4-3 11-3 11 3 11 3"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
            <path d="M10.71 5.05A16 16 0 0 1 22.54 9"/>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <line x1="12" y1="20" x2="12.01" y2="20"/>
          </svg>
        </div>

        <div>
          <h1 className="font-serif text-2xl text-[#2C1F14] mb-2">
            {isOnline ? "Je bent weer online" : "Je bent offline"}
          </h1>
          <p className="text-sm text-[#8B7355] leading-relaxed">
            {isOnline
              ? "Verbinding hersteld. Je kunt nu verder gaan."
              : "Geen internetverbinding. Als je midden in een bouwfase zit, loopt de timer gewoon door — je kunt hervat zodra je verbinding terug hebt."}
          </p>
        </div>

        {isOnline ? (
          <button
            onClick={() => window.history.back()}
            className="w-full py-3.5 bg-[#C8583A] text-white rounded-2xl text-sm font-medium hover:bg-[#b34d32] transition-colors"
          >
            Ga terug →
          </button>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3.5 border border-[#C8583A]/30 text-[#C8583A] rounded-2xl text-sm font-medium hover:bg-[#C8583A]/5 transition-colors"
          >
            Opnieuw proberen
          </button>
        )}

        <Link href="/" className="block text-xs text-[#8B7355] hover:text-[#2C1F14] transition-colors">
          Terug naar home
        </Link>
      </div>
    </main>
  );
}
