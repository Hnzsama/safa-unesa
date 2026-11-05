"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Code2,
  Users,
  ArrowLeft,
  ShieldCheck,
  Database,
  Layers,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export function DocsNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      name: "Ringkasan",
      href: "/docs",
      icon: BookOpen,
      badge: "Intro",
      active: pathname === "/docs",
    },
    {
      name: "Dokumentasi Developer",
      href: "/docs/developer",
      icon: Code2,
      badge: "Teknis",
      active: pathname === "/docs/developer",
    },
    {
      name: "Panduan Pengguna",
      href: "/docs/user",
      icon: Users,
      badge: "SOP",
      active: pathname === "/docs/user",
    },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 sm:h-16 flex items-center justify-between gap-3">
            {/* Left: Brand & Return */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">App</span>
                <span className="xs:hidden">Kembali</span>
              </Link>

              <div className="h-4 w-px bg-border shrink-0" />

              <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-foreground">
                  SAFA
                </span>
                <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
                  Dokumentasi
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links (md+) */}
            <div className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                      link.active
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-hidden"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card text-card-foreground px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-lg">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2">
              Menu Navigasi
            </p>
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      link.active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.name}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">
                      {link.badge}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground px-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                SAFA UNESA v1.0
              </span>
              <span className="text-[11px]">Auth.js + Supabase</span>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export function DocsSidebar() {
  const pathname = usePathname();

  const links = [
    {
      name: "Pengantar SAFA",
      href: "/docs",
      icon: BookOpen,
      active: pathname === "/docs",
    },
    {
      name: "Dokumentasi Developer",
      href: "/docs/developer",
      icon: Code2,
      active: pathname === "/docs/developer",
    },
    {
      name: "Panduan Pengguna",
      href: "/docs/user",
      icon: Users,
      active: pathname === "/docs/user",
    },
  ];

  return (
    <aside className="hidden lg:block lg:col-span-3">
      <div className="sticky top-24 space-y-6 p-4 rounded-xl border border-border bg-card text-card-foreground shadow-xs">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Portal Navigasi
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    link.active
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.name}</span>
                  </div>
                  {link.active && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">Supabase Postgres & Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">NextAuth.js (Auth.js)</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">Next.js 16 + Tailwind CSS</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
