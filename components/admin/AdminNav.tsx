"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
}

interface AdminNavProps {
  items: NavItem[];
  titel: string;
  rolLabel: string;
}

export function AdminNav({ items, titel, rolLabel }: AdminNavProps) {
  const pad = usePathname();

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-[#2C1F14] text-white">
      {/* Branding */}
      <div className="px-5 py-6 border-b border-white/10">
        <p className="font-serif text-lg text-[#F5F0E8]">{titel}</p>
        <p className="text-xs text-white/40 mt-0.5">{rolLabel}</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {items.map(({ href, label, Icon }) => {
          const actief = pad === href || (href !== "/" && pad.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${actief
                  ? "bg-[#C8583A] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/8"
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Terug naar app */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/start"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/8 transition-colors"
        >
          ← Terug naar app
        </Link>
      </div>
    </aside>
  );
}
