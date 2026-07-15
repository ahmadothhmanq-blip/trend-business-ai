"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Save,
  Shield,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardPanel,
} from "@/components/dashboard/ui/dashboard-card";
import {
  dashboardInputClass,
  dashboardSelectClass,
} from "@/components/dashboard/ui/dashboard-styles";
import { cn } from "@/lib/utils";
import {
  PROVIDER_MODELS,
  getDefaultSettings,
  type AIProviderSettings,
  type ProviderSettingsEntry,
  type ProviderStatus,
} from "@/types/ai-settings";

function maskKey(key: string): string {
  if (!key || key.length < 8) return key ? "••••••••" : "";
  return `${key.slice(0, 4)}${"•".repeat(Math.min(24, key.length - 8))}${key.slice(-4)}`;
}

function StatusBadge({ status }: { status: ProviderStatus }) {
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        Connected
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">
        <span className="size-1.5 rounded-full bg-red-400" />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/50">
      <span className="size-1.5 rounded-full bg-white/30" />
      Not Configured
    </span>
  );
}

function ProviderCard({
  entry,
  isDefault,
  onUpdate,
  onTest,
  testing,
}: {
  entry: ProviderSettingsEntry;
  isDefault: boolean;
  onUpdate: (updated: ProviderSettingsEntry) => void;
  onTest: () => void;
  testing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const info = PROVIDER_MODELS[entry.name];
  const label = info?.label ?? entry.name;

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-all",
        entry.enabled
          ? "border-premium-gold/20 bg-premium-gold/[0.03]"
          : "border-white/[0.08] bg-white/[0.02]",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              entry.enabled
                ? "bg-premium-gold/15 text-premium-gold-light"
                : "bg-white/5 text-white/40",
            )}
          >
            <BrainCircuit className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{label}</span>
              {isDefault && (
                <span className="rounded-full border border-premium-gold/30 bg-premium-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-premium-gold-light">
                  Default
                </span>
              )}
            </div>
            <p className="text-xs text-white/40">{entry.model}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={entry.status} />
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={entry.enabled}
              onChange={(e) => onUpdate({ ...entry, enabled: e.target.checked })}
            />
            <div className="peer h-6 w-11 rounded-full border border-white/10 bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:bg-white/60 after:transition-all peer-checked:border-premium-gold/30 peer-checked:bg-premium-gold/30 peer-checked:after:translate-x-full peer-checked:after:bg-premium-gold-light" />
          </label>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/40 hover:text-white"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-5 space-y-4 border-t border-white/[0.06] pt-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">
              API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  value={entry.apiKey}
                  onChange={(e) => onUpdate({ ...entry, apiKey: e.target.value })}
                  placeholder={`Enter ${label} API key...`}
                  className={cn(dashboardInputClass, "pr-10 font-mono text-sm")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-11 gap-1.5 rounded-xl border-white/10 text-white/70 hover:border-premium-gold/25 hover:text-premium-gold-light"
                onClick={onTest}
                disabled={testing || !entry.apiKey}
              >
                {testing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Zap className="size-3.5" />
                )}
                Test
              </Button>
            </div>
            {entry.apiKey && !showKey && (
              <p className="mt-1 font-mono text-xs text-white/30">
                {maskKey(entry.apiKey)}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">
              Model
            </label>
            <select
              value={entry.model}
              onChange={(e) => onUpdate({ ...entry, model: e.target.value })}
              className={dashboardSelectClass}
            >
              {info?.models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export function AIProvidersSettings() {
  const [settings, setSettings] = useState<AIProviderSettings>(getDefaultSettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    fetch("/api/ai-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          const loaded = data.settings as AIProviderSettings;
          const allNames = Object.keys(PROVIDER_MODELS);
          const existing = new Set((loaded.providers ?? []).map((p: ProviderSettingsEntry) => p.name));
          const merged = [
            ...(loaded.providers ?? []),
            ...allNames
              .filter((n) => !existing.has(n))
              .map((name) => ({
                name,
                enabled: false,
                apiKey: "",
                model: PROVIDER_MODELS[name].defaultModel,
                status: "not_configured" as ProviderStatus,
              })),
          ];
          setSettings({ ...loaded, providers: merged });
        }
      })
      .catch(() => showToast("error", "Failed to load settings"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const updateProvider = (name: string, updated: ProviderSettingsEntry) => {
    setSettings((prev) => ({
      ...prev,
      providers: prev.providers.map((p) => (p.name === name ? updated : p)),
    }));
  };

  const testConnection = async (entry: ProviderSettingsEntry) => {
    if (!entry.apiKey) return;
    setTestingProvider(entry.name);
    try {
      const res = await fetch("/api/ai-settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: entry.name,
          apiKey: entry.apiKey,
          model: entry.model,
        }),
      });
      const data = await res.json();
      const result = data.result;
      const newStatus: ProviderStatus = result.success ? "connected" : "error";

      updateProvider(entry.name, { ...entry, status: newStatus });

      if (result.success) {
        showToast("success", `${PROVIDER_MODELS[entry.name]?.label ?? entry.name} connected (${result.latencyMs}ms)`);
      } else {
        showToast("error", result.error ?? "Connection failed");
      }
    } catch {
      showToast("error", "Connection test failed");
    } finally {
      setTestingProvider(null);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast("success", "Settings saved successfully");
      } else {
        const data = await res.json();
        showToast("error", data.error ?? "Failed to save settings");
      }
    } catch {
      showToast("error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-premium-gold/60" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
            toast.type === "success"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/25 bg-red-500/10 text-red-400",
          )}
        >
          {toast.type === "success" ? <Check className="size-4" /> : <X className="size-4" />}
          {toast.message}
        </div>
      )}

      {/* Provider Cards */}
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light">
              <BrainCircuit className="size-5" />
            </div>
            <div>
              <DashboardCardTitle>AI Providers</DashboardCardTitle>
              <DashboardCardDescription>
                Configure API keys and select models for each provider
              </DashboardCardDescription>
            </div>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent>
          <div className="space-y-3">
            {settings.providers.map((entry) => (
              <ProviderCard
                key={entry.name}
                entry={entry}
                isDefault={settings.default_provider === entry.name}
                onUpdate={(updated) => updateProvider(entry.name, updated)}
                onTest={() => testConnection(entry)}
                testing={testingProvider === entry.name}
              />
            ))}
          </div>
        </DashboardCardContent>
      </DashboardCard>

      {/* Global Settings */}
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light">
              <Shield className="size-5" />
            </div>
            <div>
              <DashboardCardTitle>Global Settings</DashboardCardTitle>
              <DashboardCardDescription>
                Default behavior for all AI generation features
              </DashboardCardDescription>
            </div>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent>
          <DashboardPanel className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Default Provider */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  Default Provider
                </label>
                <select
                  value={settings.default_provider}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, default_provider: e.target.value }))
                  }
                  className={dashboardSelectClass}
                >
                  {settings.providers
                    .filter((p) => p.enabled)
                    .map((p) => (
                      <option key={p.name} value={p.name}>
                        {PROVIDER_MODELS[p.name]?.label ?? p.name}
                      </option>
                    ))}
                  {settings.providers.filter((p) => p.enabled).length === 0 && (
                    <option value={settings.default_provider}>
                      {PROVIDER_MODELS[settings.default_provider]?.label ?? settings.default_provider}
                    </option>
                  )}
                </select>
              </div>

              {/* Auto Fallback */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  Automatic Fallback
                </label>
                <div className="flex h-11 items-center gap-3 rounded-xl border border-white/[0.1] bg-black/25 px-3">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={settings.auto_fallback}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, auto_fallback: e.target.checked }))
                      }
                    />
                    <div className="peer h-5 w-9 rounded-full border border-white/10 bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:size-4 after:rounded-full after:bg-white/60 after:transition-all peer-checked:border-premium-gold/30 peer-checked:bg-premium-gold/30 peer-checked:after:translate-x-full peer-checked:after:bg-premium-gold-light" />
                  </label>
                  <span className="text-sm text-white/70">
                    {settings.auto_fallback ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              {/* Retry Count */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  Retry Count
                </label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={settings.retry_count}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      retry_count: Math.min(10, Math.max(0, Number(e.target.value) || 0)),
                    }))
                  }
                  className={dashboardInputClass}
                />
              </div>

              {/* Temperature */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  Temperature
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={Math.round(settings.temperature * 100)}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        temperature: Number(e.target.value) / 100,
                      }))
                    }
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-[#d4af37]"
                  />
                  <span className="w-12 text-right font-mono text-sm text-white/70">
                    {settings.temperature.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  Max Tokens
                </label>
                <Input
                  type="number"
                  min={256}
                  max={128000}
                  step={256}
                  value={settings.max_tokens}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      max_tokens: Math.min(128000, Math.max(256, Number(e.target.value) || 4096)),
                    }))
                  }
                  className={dashboardInputClass}
                />
              </div>

              {/* Timeout */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  Timeout (seconds)
                </label>
                <Input
                  type="number"
                  min={10}
                  max={600}
                  value={settings.timeout_seconds}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      timeout_seconds: Math.min(600, Math.max(10, Number(e.target.value) || 120)),
                    }))
                  }
                  className={dashboardInputClass}
                />
              </div>
            </div>
          </DashboardPanel>
        </DashboardCardContent>
      </DashboardCard>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          variant="outline"
          className="h-11 gap-2 rounded-xl border-white/10 text-white/70 hover:border-white/20"
          onClick={() => setSettings(getDefaultSettings())}
        >
          <RefreshCw className="size-4" />
          Reset to Defaults
        </Button>
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="btn-gold h-11 gap-2 rounded-xl px-6 font-bold text-luxury-black"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
