import { requireRol } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRol("superadmin");

  return (
    <div className="flex h-screen bg-[#FAF7F2] overflow-hidden">
      <AdminNav titel="Brickme Admin" rolLabel="Super Admin" />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
