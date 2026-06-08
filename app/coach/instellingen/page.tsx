import { getGebruiker } from "@/lib/auth";
import { CoachLogin } from "../CoachLogin";
import { User, Mail, Shield } from "lucide-react";
import CoachInstellingenForm from "./CoachInstellingenForm";

export default async function CoachInstellingen() {
  const gebruiker = await getGebruiker();
  if (!gebruiker || (gebruiker.rol !== "coach" && gebruiker.rol !== "superadmin")) {
    return <CoachLogin />;
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <p className="text-xs text-[#8B7355] uppercase tracking-widest mb-1">Coach-omgeving</p>
        <h1 className="font-serif text-3xl text-[#2C1F14]">Instellingen</h1>
        <p className="text-[#8B7355] text-sm mt-1">Beheer je profiel en voorkeuren</p>
      </div>

      {/* Profiel */}
      <section className="bg-white rounded-2xl border border-[#E8DDD0] p-6 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-[#2D4A3E]/10 flex items-center justify-center">
            <User size={15} className="text-[#2D4A3E]" />
          </div>
          <h2 className="font-serif text-lg text-[#2C1F14]">Profiel</h2>
        </div>

        <CoachInstellingenForm
          huidigNaam={gebruiker.naam ?? ""}
          huidigEmail={gebruiker.email ?? ""}
        />
      </section>

      {/* Account info */}
      <section className="bg-white rounded-2xl border border-[#E8DDD0] p-6 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-[#2D4A3E]/10 flex items-center justify-center">
            <Mail size={15} className="text-[#2D4A3E]" />
          </div>
          <h2 className="font-serif text-lg text-[#2C1F14]">Account</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[#F5F0E8]">
            <span className="text-sm text-[#8B7355]">E-mailadres</span>
            <span className="text-sm text-[#2C1F14] font-medium">
              {gebruiker.email ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#F5F0E8]">
            <span className="text-sm text-[#8B7355]">Rol</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2D4A3E] bg-[#2D4A3E]/10 px-2.5 py-1 rounded-full">
              <Shield size={11} />
              {gebruiker.rol === "superadmin" ? "Superadmin" : "Coach"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[#8B7355]">Actief sinds</span>
            <span className="text-sm text-[#2C1F14]">
              {new Date(gebruiker.aangemaktOp).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </section>

      <p className="text-xs text-[#8B7355] text-center opacity-60">
        Problemen met je account?{" "}
        <a href="mailto:hello@brickme.nl" className="hover:text-[#2C1F14] transition-colors">
          Neem contact op
        </a>
      </p>
    </div>
  );
}
