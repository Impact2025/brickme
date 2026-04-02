import { type Rol } from "@/lib/auth";

const config: Record<string, { label: string; klassen: string }> = {
  superadmin: { label: "Super Admin", klassen: "bg-[#C8583A]/15 text-[#C8583A] border border-[#C8583A]/30" },
  facilitator: { label: "Facilitator", klassen: "bg-[#2D4A3E]/15 text-[#2D4A3E] border border-[#2D4A3E]/30" },
  coach: { label: "Coach", klassen: "bg-amber-100 text-amber-800 border border-amber-300" },
  gebruiker: { label: "Gebruiker", klassen: "bg-[#F5F0E8] text-[#8B7355] border border-[#E8DDD0]" },
};

export function RolBadge({ rol }: { rol: string }) {
  const { label, klassen } = config[rol] ?? config.gebruiker;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${klassen}`}>
      {label}
    </span>
  );
}
