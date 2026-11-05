import React from "react";
import { DocsNavbar, DocsSidebar } from "@/components/docs/docs-nav";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
      {/* Top Responsive Navbar */}
      <DocsNavbar />

      {/* Main Documentation Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Desktop-only Sidebar */}
          <DocsSidebar />

          {/* Main Body */}
          <main className="w-full min-w-0 lg:col-span-9">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
