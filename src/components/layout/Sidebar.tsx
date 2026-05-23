"use client";

import { LayoutDashboard, Cpu, Users, Settings, LogOut, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarLinks = [
  { href: "/board", label: "Board", icon: LayoutDashboard },
  { href: "/machines", label: "Machines", icon: Cpu },
  { href: "/team", label: "Team", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-surface h-screen sticky top-0 shrink-0">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
          <Wrench size={16} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-foreground">Floor Runner</span>
          <span className="text-2xs text-muted-foreground font-mono">v0.1.0</span>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {sidebarLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section: plan badge + settings / sign out */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {/* Plan badge */}
        <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-md bg-primary/10 border border-primary/20">
          <span className="text-2xs font-semibold text-primary uppercase tracking-wider">Free Plan</span>
        </div>

        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            pathname === "/settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
          }`}
        >
          <Settings size={18} strokeWidth={1.5} />
          Settings
        </Link>

        <button
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          <LogOut size={18} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
