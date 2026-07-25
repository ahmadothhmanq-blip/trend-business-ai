"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useProductT } from "@/lib/i18n/use-scoped-t";

export function ToolManager() {
  const pt = useProductT("aiAgents");
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
      if (!res.ok) throw new Error(data.error ?? pt("toasts.failed"));
      setResult(data.result);
      toast.success(pt("panels.tools.ran", { tool: toolKey }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : pt("toasts.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">{pt("panels.tools.platformTools")}</p>
        <div className="space-y-2">
          {tools.map((tool) => (
            <div key={tool} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2">
              <span className="text-sm text-white/70">{tool}</span>
              <Button size="sm" variant="outline" disabled={loading} onClick={() => void testTool(tool)}>{pt("panels.tools.test")}</Button>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">{pt("panels.tools.toolOutput")}</p>
        {result ? (
          <pre className="max-h-96 overflow-auto text-xs text-white/60">{JSON.stringify(result, null, 2)}</pre>
        ) : (
          <p className="text-sm text-white/30">{pt("panels.tools.testHint")}</p>
        )}
      </div>
    </div>
  );
}
