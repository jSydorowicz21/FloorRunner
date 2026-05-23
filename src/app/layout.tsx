import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Floor Runner — CNC Job Tracker",
  description: "Shop floor CNC job tracking and scheduling",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen overflow-hidden bg-background text-foreground">
        {/* Desktop sidebar — hidden on mobile */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
