import { getGebruiker } from "@/lib/auth";
import { CoachNav } from "@/components/admin/CoachNav";
import { CoachLogin } from "./CoachLogin";

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const gebruiker = await getGebruiker();

  // Niet ingelogd → loginformulier tonen
  if (!gebruiker) {
    return <CoachLogin />;
  }

  // Ingelogd maar geen coach/superadmin → loginformulier met foutmelding
  if (gebruiker.rol !== "coach" && gebruiker.rol !== "superadmin") {
    return <CoachLogin />;
  }

  return (
    <div className="flex h-screen bg-[#FAF7F2] overflow-hidden">
      <CoachNav naam={gebruiker.naam} email={gebruiker.email} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
