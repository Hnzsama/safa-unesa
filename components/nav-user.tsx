"use client";

import { useSession, signOut } from "next-auth/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  EllipsisVerticalIcon,
  CircleUserRoundIcon,
  BellIcon,
  LogOutIcon,
  ShieldCheck,
  GraduationCap,
  Briefcase,
} from "lucide-react";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { data: session } = useSession();

  const currentUser = session?.user
    ? {
        name: session.user.name || user.name,
        email: session.user.email || user.email,
        avatar: session.user.image || user.avatar,
        role: session.user.role,
        identity: session.user.identity_number,
      }
    : {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: undefined,
        identity: undefined,
      };

  const getRoleLabel = (role?: string) => {
    if (role === "facility_staff") return "Staf Sarpras";
    if (role === "lecturer") return "Dosen";
    if (role === "student") return "Mahasiswa";
    return "Civitas UNESA";
  };

  const getRoleIcon = (role?: string) => {
    if (role === "facility_staff") return <ShieldCheck className="size-3.5 text-primary" />;
    if (role === "lecturer") return <Briefcase className="size-3.5 text-primary" />;
    return <GraduationCap className="size-3.5 text-primary" />;
  };

  const initials = currentUser.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "UN";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{currentUser.name}</span>
              <span className="truncate text-xs text-foreground/70 flex items-center gap-1">
                {getRoleIcon(currentUser.role)}
                <span>{getRoleLabel(currentUser.role)}</span>
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-60"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-semibold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{currentUser.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {currentUser.email}
                    </span>
                    {currentUser.identity && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        NIM/NIP: {currentUser.identity}
                      </span>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <CircleUserRoundIcon className="size-4 mr-2" />
                Profil Saya
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <BellIcon className="size-4 mr-2" />
                Notifikasi
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOutIcon className="size-4 mr-2" />
              Keluar (Log out)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
