"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";

type Vuln = { id: string; title: string; severity: string; cvss_score: number; cve_id: string };
type Scan = { id: string; name: string; target: string; status: string; findings_count: number };

export function VulnerabilitiesPanel() {
  const [vulns, setVulns] = useState<Vuln[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");

  const load = () => {
    void fetch("/api/cyber/vulnerabilities").then((r) => r.json()).then((d) => setVulns(d.vulnerabilities ?? [])).catch(() => undefined);
    void fetch("/api/cyber/vulnerabilities?type=scans").then((r) => r.json()).then((d) => setScans(d.scans ?? [])).catch(() => undefined);
  };
  useEffect(() => { load(); }, []);

  const addVuln = async () => {
    if (!title.trim()) return;
    await fetch("/api/cyber/vulnerabilities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, severity: "high", cvssScore: 7.5 }) });
    setTitle(""); load(); toast.success("Vulnerability added");
  };

  const runScan = async () => {
    if (!target.trim()) return;
    await fetch("/api/cyber/vulnerabilities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: `Scan ${target}`, target }) });
    setTarget(""); load(); toast.success("Scan completed");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">Vulnerabilities</p>
        <div className="mb-3 flex gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="CVE / finding" className={dashboardInputClass} />
          <Button onClick={() => void addVuln()}>Add</Button>
        </div>
        <ul className="space-y-1 text-sm text-white/60">
          {vulns.map((v) => <li key={v.id}>{v.title} · {v.severity} · CVSS {v.cvss_score}</li>)}
        </ul>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">Scans</p>
        <div className="mb-3 flex gap-2">
          <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Scan target" className={dashboardInputClass} />
          <Button onClick={() => void runScan()}>Run Scan</Button>
        </div>
        <ul className="space-y-1 text-sm text-white/60">
          {scans.map((s) => <li key={s.id}>{s.name} · {s.status} · {s.findings_count} findings</li>)}
        </ul>
      </div>
    </div>
  );
}
