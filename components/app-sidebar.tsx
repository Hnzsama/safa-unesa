"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Building2,
  LayoutDashboard,
  Inbox,
  Wrench,
  CheckCircle2,
  ChartBar,
  Layers,
  History,
  BookOpen,
  CircleHelp,
  Settings2,
  ShieldCheck,
} from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  // Konfigurasi Navigasi Khusus Portal Staf Sarpras (facility_staff)
  const staffConfig = {
    quickAction: {
      title: "Verifikasi Laporan",
      url: "/dashboard/incoming",
      icon: <ShieldCheck className="size-4" />,
    },
    navMain: [
      {
        title: "Dashboard Overview",
        url: "/dashboard",
        icon: <LayoutDashboard className="size-4" />,
      },
      {
        title: "Antrean Laporan Masuk",
        url: "/dashboard/incoming",
        icon: <Inbox className="size-4" />,
        badge: "Baru",
      },
      {
        title: "Sedang Ditangani",
        url: "/dashboard/in-progress",
        icon: <Wrench className="size-4" />,
      },
      {
        title: "Laporan Selesai",
        url: "/dashboard/resolved",
        icon: <CheckCircle2 className="size-4" />,
      },
      {
        title: "Analitik & Tren Kerusakan",
        url: "/dashboard/analytics",
        icon: <ChartBar className="size-4" />,
      },
    ],
    managementGroup: {
      label: "Master Data Sarpras",
      items: [
        {
          name: "Lokasi & Gedung Kampus",
          url: "/dashboard/locations",
          icon: <Building2 className="size-4" />,
        },
        {
          name: "Kategori Fasilitas",
          url: "/dashboard/categories",
          icon: <Layers className="size-4" />,
        },
        {
          name: "Log Riwayat / Audit Trail",
          url: "/dashboard/logs",
          icon: <History className="size-4" />,
        },
      ],
    },
  };

  const navSecondary = [
    {
      title: "Dokumentasi SAFA",
      url: "/docs",
      icon: <BookOpen className="size-4" />,
    },
    {
      title: "Pusat Bantuan (SOP)",
      url: "/docs/user",
      icon: <CircleHelp className="size-4" />,
    },
    {
      title: "Pengaturan Akun",
      url: "/profile",
      icon: <Settings2 className="size-4" />,
    },
  ];

  const defaultUser = {
    name: session?.user?.name || "Budi Santoso, S.T.",
    email: session?.user?.email || "staff@unesa.ac.id",
    avatar: session?.user?.image || "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0 shadow-xs">
                <Building2 className="size-4.5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-extrabold text-foreground">SAFA UNESA</span>
                <span className="truncate text-[11px] text-muted-foreground">Portal Staf Sarpras</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Tombol Aksi Verifikasi Laporan */}
        <div className="px-3 pt-2">
          <Link
            href={staffConfig.quickAction.url}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-colors"
          >
            {staffConfig.quickAction.icon}
            <span>{staffConfig.quickAction.title}</span>
          </Link>
        </div>

        {/* Menu Navigasi Utama */}
        <NavMain items={staffConfig.navMain} />

        {/* Master Data Sarpras */}
        <NavDocuments
          items={staffConfig.managementGroup.items}
          label={staffConfig.managementGroup.label}
        />

        {/* Menu Sekunder (Dokumentasi & SOP) */}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={defaultUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
