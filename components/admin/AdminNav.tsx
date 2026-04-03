"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, BarChart3, Newspaper } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/gebruikers", label: "Gebruikers", Icon: Users },
  { href: "/admin/sessies", label: "Sessies", Icon: BookOpen },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/admin/blog", label: "Blog", Icon: Newspaper },
];

type Props = {
  titel?: string;
  rolLabel?: string;
};

export function AdminNav({ titel = "Admin", rolLabel = "Admin" }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 bg-[#2D4A3E] flex flex-col h-full">
      <div className="px-5 py-6 border-b border-white/10">
        <p className="font-serif text-[#F5F0E8] font-semibold text-lg leading-tight">{titel}</p>
        <p className="text-xs text-white/50 mt-0.5">{rolLabel}</p>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const actief = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                actief
                  ? "bg-white/15 text-[#F5F0E8] font-medium"
                  : "text-white/60 hover:bg-white/10 hover:text-[#F5F0E8]"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <Link href="/start" className="text-xs text-white/40 hover:text-white/70 transition-colors">
          ← Terug naar app
        </Link>
      </div>
    </aside>
  );
}
