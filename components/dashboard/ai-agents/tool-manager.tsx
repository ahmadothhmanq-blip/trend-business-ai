"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ToolManager() {
  const [tools, setTools] = useState<string[]>([]);
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/ai-agents/tools").then((r) => r.json()).then((d) => setTools(d.tools ?? [])).catch(() => undefined);
  }, []);

  const testTool = async (toolKey: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-agents/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult(data.result);
      toast.success(`Ran ${toolKey}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">Platform Tools</p>
        <div className="space-y-2">
          {tools.map((t) => (
            <div key={t} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2">
              <span className="text-sm text-white/70">{t}</span>
              <Button size="sm" variant="outline" disabled={loading} onClick={() => void testTool(t)}>Test</Button>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">Tool Output</p>
        {result ? (
          <pre className="max-h-96 overflow-auto text-xs text-white/60">{JSON.stringify(result, null, 2)}</pre>
        ) : (
          <p className="text-sm text-white/30">Test a tool to see output.</p>
        )}
      </div>
    </div>
  );
}
