import { requireAdminOfRol } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { LayoutDashboard, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/coach", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/coach/clienten", label: "Cliënten", Icon: Users },
];

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  await requireAdminOfRol("coach");

  return (
    <div className="flex h-screen bg-[#FAF7F2] overflow-hidden">
      <AdminNav items={NAV_ITEMS} titel="Brickme" rolLabel="Coach" />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
