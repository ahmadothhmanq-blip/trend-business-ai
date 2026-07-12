"use client";

import Link from "next/link";
import { Bell, ChevronsUpDown, LogOut, Search, User } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { DASHBOARD_WORKSPACES } from "@/lib/constants/dashboard-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DashboardHeaderProps = {
  title: string;
  description?: string;
  userEmail?: string;
  userName?: string;
  avatarUrl?: string | null;
};

export function DashboardHeader({
  title,
  description,
  userEmail,
  userName,
  avatarUrl,
}: DashboardHeaderProps) {
  const initials = (userName || userEmail || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="dashboard-header sticky top-0 z-30 border-b border-white/[0.08] bg-[#050505]/80 px-4 py-3.5 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-xl font-bold tracking-[-0.02em] text-white sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-[14px] text-white/45">{description}</p>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-11 justify-between gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 text-white/80 hover:border-premium-gold/25 hover:bg-premium-gold/10 hover:text-premium-gold-light sm:w-[200px]"
              >
                <span className="min-w-0 text-left">
                  <span className="block truncate text-[13px] font-semibold">
                    {DASHBOARD_WORKSPACES[0].name}
                  </span>
                  <span className="block truncate text-[11px] text-white/40">
                    {DASHBOARD_WORKSPACES[0].plan}
                  </span>
                </span>
                <ChevronsUpDown className="size-4 shrink-0 text-white/35" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 border-white/10 bg-[#141414]/95 backdrop-blur-xl"
            >
              <DropdownMenuLabel className="text-white/50">
                Workspaces
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              {DASHBOARD_WORKSPACES.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  className="flex flex-col items-start gap-0.5 text-white/75 focus:bg-premium-gold/10 focus:text-premium-gold-light"
                >
                  <span className="font-medium">{ws.name}</span>
                  <span className="text-[11px] text-white/40">{ws.plan}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <form
            action="/dashboard/search"
            className="relative min-w-0 flex-1 xl:w-[320px] xl:flex-none"
          >
            <label>
              <span className="sr-only">Search workspace</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/30" />
              <Input
                type="search"
                name="q"
                placeholder="Search projects, templates, history..."
                className="h-11 rounded-2xl border-white/[0.08] bg-white/[0.035] pl-10 pr-4 text-white placeholder:text-white/30 focus-visible:border-premium-gold/30 focus-visible:ring-premium-gold/15"
              />
            </label>
          </form>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon-lg"
              asChild
              className="relative rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-premium-gold/25 hover:bg-premium-gold/10 hover:text-premium-gold-light"
            >
              <Link href="/dashboard/notifications" aria-label="Notifications">
                <Bell className="size-4" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-premium-gold shadow-[0_0_14px_rgb(212_175_55/0.8)]" />
              </Link>
            </Button>
            <ThemeToggle variant="outline" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative size-10 rounded-xl border border-white/[0.08] bg-white/[0.03] p-0 hover:border-premium-gold/25 hover:bg-premium-gold/10"
                  aria-label="User menu"
                >
                  <Avatar className="size-9">
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                    <AvatarFallback className="bg-premium-gold/20 text-xs font-bold text-premium-gold-light">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-white/10 bg-[#141414]/95 backdrop-blur-xl"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-white">
                      {userName || "User"}
                    </span>
                    <span className="text-xs font-normal text-white/45">
                      {userEmail}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  asChild
                  className="text-white/70 focus:bg-premium-gold/10 focus:text-premium-gold-light"
                >
                  <Link href="/dashboard/profile">
                    <User className="size-4" />
                    Profile settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="text-white/70 focus:bg-premium-gold/10 focus:text-premium-gold-light"
                >
                  <Link href="/dashboard/settings">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="text-red-400 focus:bg-red-400/10 focus:text-red-400"
                  onClick={() => signOut()}
                >
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
