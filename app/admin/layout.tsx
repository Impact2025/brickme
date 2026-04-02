import { requireRol } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { LayoutDashboard, Users, BookOpen, BarChart3 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/gebruikers", label: "Gebruikers", Icon: Users },
  { href: "/admin/sessies", label: "Sessies", Icon: BookOpen },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRol("superadmin");

  return (
    <div className="flex h-screen bg-[#FAF7F2] overflow-hidden">
      <AdminNav items={NAV_ITEMS} titel="Brickme Admin" rolLabel="Super Admin" />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
