"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
};

export function DashboardHeader({
  title,
  description,
  userEmail,
  userName,
}: DashboardHeaderProps) {
  const initials = (userName || userEmail || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="dashboard-header sticky top-0 z-30 border-b border-white/[0.08] px-4 py-5 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-xl font-bold tracking-[-0.02em] text-white sm:text-2xl lg:text-[1.75rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-[14px] text-white/45 sm:text-[15px]">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ThemeToggle variant="outline" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative size-10 rounded-xl border border-white/[0.08] bg-white/[0.03] p-0 hover:border-premium-gold/25 hover:bg-premium-gold/10"
              >
                <Avatar className="size-9">
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
              <DropdownMenuItem asChild className="text-white/70 focus:bg-premium-gold/10 focus:text-premium-gold-light">
                <Link href="/dashboard/profile">
                  <User className="size-4" />
                  Profile settings
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
    </header>
  );
}
