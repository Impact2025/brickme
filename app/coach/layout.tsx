import { requireAdminOfRol } from "@/lib/auth";
import { CoachNav } from "@/components/admin/CoachNav";

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  await requireAdminOfRol("coach");

  return (
    <div className="flex h-screen bg-[#FAF7F2] overflow-hidden">
      <CoachNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
