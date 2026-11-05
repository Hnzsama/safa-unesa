"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CirclePlusIcon, BellIcon } from "lucide-react";

export function NavMain({
  items,
  quickAction,
  showNotification = true,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    badge?: string;
  }[];
  quickAction?: {
    title: string;
    url: string;
    icon?: React.ReactNode;
  };
  showNotification?: boolean;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {quickAction && (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip={quickAction.title}
                render={<Link href={quickAction.url} />}
                className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              >
                {quickAction.icon || <CirclePlusIcon className="size-4" />}
                <span className="font-medium">{quickAction.title}</span>
              </SidebarMenuButton>
              {showNotification && (
                <Link
                  href="/notifications"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "size-8 group-data-[collapsible=icon]:opacity-0 shrink-0"
                  )}
                >
                  <BellIcon className="size-4" />
                  <span className="sr-only">Notifikasi</span>
                </Link>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        )}

        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname?.startsWith(item.url));
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  render={<Link href={item.url} />}
                >
                  {item.icon}
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {item.badge}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
