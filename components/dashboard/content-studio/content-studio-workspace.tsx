"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CalendarDays, FolderKanban, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentDocument, ContentGeneration, ContentProject } from "@/types/content";

const ContentPlatformWorkspace = dynamic(
  () =>
    import("@/components/dashboard/content-studio/content-platform-workspace").then(
      (m) => m.ContentPlatformWorkspace,
    ),
  {
    loading: () => (
      <div className="rounded-xl border border-white/10 p-8 text-sm text-white/40">
        Loading workspace…
      </div>
    ),
  },
);

const ContentStudioTool = dynamic(
  () =>
    import("@/components/dashboard/content-studio/content-studio-tool").then(
      (m) => m.ContentStudioTool,
    ),
  {
    loading: () => (
      <div className="rounded-xl border border-white/10 p-8 text-sm text-white/40">
        Loading studio…
      </div>
    ),
  },
);

const ContentCalendar = dynamic(
  () =>
    import("@/components/dashboard/content-studio/content-calendar").then(
      (m) => m.ContentCalendar,
    ),
  {
    loading: () => (
      <div className="rounded-xl border border-white/10 p-8 text-sm text-white/40">
        Loading calendar…
      </div>
    ),
  },
);

type Tab = "workspace" | "studio" | "calendar";

type Props = {
  initialGenerations?: ContentGeneration[];
  initialDocuments?: ContentDocument[];
  initialProjects?: ContentProject[];
};

export function ContentStudioWorkspace({
  initialGenerations,
  initialDocuments,
  initialProjects,
}: Props) {
  const [tab, setTab] = useState<Tab>("workspace");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {(
          [
            { key: "workspace" as const, label: "Workspace", icon: FolderKanban },
            { key: "studio" as const, label: "AI Studio", icon: PenTool },
            { key: "calendar" as const, label: "Calendar", icon: CalendarDays },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              tab === key
                ? "bg-premium-gold/15 text-premium-gold-light shadow-sm"
                : "text-white/40 hover:bg-white/5 hover:text-white/60",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "workspace" && (
        <ContentPlatformWorkspace
          initialDocuments={initialDocuments}
          initialProjects={initialProjects}
        />
      )}
      {tab === "studio" && <ContentStudioTool initialGenerations={initialGenerations} />}
      {tab === "calendar" && <ContentCalendar />}
    </div>
  );
}
