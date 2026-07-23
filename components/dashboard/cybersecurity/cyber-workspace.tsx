"use client";

import { useState } from "react";
import { Shield, AlertTriangle, Server, Bug, Bell, Siren, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CyberOverview } from "./cyber-overview";
import { ThreatIntelligencePanel } from "./threat-intelligence-panel";
import { AssetsPanel } from "./assets-panel";
import { VulnerabilitiesPanel } from "./vulnerabilities-panel";
import { AlertsPanel } from "./alerts-panel";
import { IncidentsPanel } from "./incidents-panel";
import { ReportsPanel } from "./reports-panel";
import { CyberAssistantPanel } from "./assistant-panel";
import type { CyberAnalyticsSummary } from "@/types/cyber";

const TABS = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "threats", label: "Threats", icon: AlertTriangle },
  { id: "assets", label: "Assets", icon: Server },
  { id: "vulnerabilities", label: "Vulnerabilities", icon: Bug },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "incidents", label: "Incidents", icon: Siren },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "assistant", label: "AI Assistant", icon: Sparkles },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Props = { analyticsSummary?: CyberAnalyticsSummary };

export function CyberWorkspace({ analyticsSummary }: Props) {
  const [tab, setTab] = useState<TabId>("overview");
  const summary = analyticsSummary ?? {
    riskScore: 0, activeThreats: 0, openVulnerabilities: 0, openIncidents: 0,
    openAlerts: 0, alertVolume24h: 0, avgResponseTimeMs: 0, assetCount: 0, criticalFindings: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium",
            tab === id ? "bg-premium-gold/10 text-premium-gold-light" : "text-white/40 hover:text-white/60",
          )}>
            <Icon className="size-3.5" /> <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
      {tab === "overview" && <CyberOverview summary={summary} />}
      {tab === "threats" && <ThreatIntelligencePanel />}
      {tab === "assets" && <AssetsPanel />}
      {tab === "vulnerabilities" && <VulnerabilitiesPanel />}
      {tab === "alerts" && <AlertsPanel />}
      {tab === "incidents" && <IncidentsPanel />}
      {tab === "reports" && <ReportsPanel />}
      {tab === "assistant" && <CyberAssistantPanel />}
    </div>
  );
}
