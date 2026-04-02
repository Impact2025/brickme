import { requireAdminOfRol } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { LayoutDashboard, BookOpen, Users, FileText } from "lucide-react";

const NAV_ITEMS = [
  { href: "/facilitator", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/facilitator/workshops", label: "Workshops", Icon: BookOpen },
  { href: "/facilitator/workshops/nieuw", label: "Nieuw", Icon: Users },
];

export default async function FacilitatorLayout({ children }: { children: React.ReactNode }) {
  await requireAdminOfRol("facilitator");

  return (
    <div className="flex h-screen bg-[#FAF7F2] overflow-hidden">
      <AdminNav items={NAV_ITEMS} titel="Brickme" rolLabel="Facilitator" />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
