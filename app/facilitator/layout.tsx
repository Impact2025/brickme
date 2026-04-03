import { requireAdminOfRol } from "@/lib/auth";
import { FacilitatorNav } from "@/components/admin/FacilitatorNav";

export default async function FacilitatorLayout({ children }: { children: React.ReactNode }) {
  await requireAdminOfRol("facilitator");

  return (
    <div className="flex h-screen bg-[#FAF7F2] overflow-hidden">
      <FacilitatorNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
