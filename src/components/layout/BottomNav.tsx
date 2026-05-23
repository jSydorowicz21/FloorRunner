"use client";

import { LayoutDashboard, Cpu, Plus, Users, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/board", label: "Board", icon: LayoutDashboard },
  { href: "/machines", label: "Machines", icon: Cpu },
  { href: "/jobs/new", label: "New", icon: Plus },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-surface px-2 py-2 md:hidden safe-area-bottom">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <a
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-2xs transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="font-medium">{label}</span>
          </a>
        );
      })}
    </nav>
  );
}
