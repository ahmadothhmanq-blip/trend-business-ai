#!/usr/bin/env node
/** Wire CRM, ERP, BI, Cyber workspace tab labels to i18n */
import fs from "node:fs";
import path from "node:path";

const workspaces = [
  {
    file: "components/dashboard/crm/crm-workspace.tsx",
    scope: "crm",
    tabs: [
      "overview",
      "accounts",
      "contacts",
      "leads",
      "deals",
      "tasks",
      "activities",
      "analytics",
      "assistant",
    ],
  },
  {
    file: "components/dashboard/erp/erp-workspace.tsx",
    scope: "erp",
    tabs: [
      "overview",
      "finance",
      "inventory",
      "operations",
      "hr",
      "procurement",
      "analytics",
      "assistant",
    ],
  },
  {
    file: "components/dashboard/bi/bi-workspace.tsx",
    scope: "bi",
    tabs: [
      "overview",
      "dashboards",
      "metrics",
      "reports",
      "dataSources",
      "analytics",
      "assistant",
    ],
  },
  {
    file: "components/dashboard/cybersecurity/cyber-workspace.tsx",
    scope: "cyber",
    tabs: [
      "overview",
      "threats",
      "assets",
      "vulnerabilities",
      "alerts",
      "incidents",
      "reports",
      "assistant",
    ],
  },
];

for (const ws of workspaces) {
  const filePath = path.join(process.cwd(), ws.file);
  if (!fs.existsSync(filePath)) {
    console.log("skip missing", ws.file);
    continue;
  }
  let c = fs.readFileSync(filePath, "utf8");

  if (!c.includes("useWorkspaceT")) {
    c = c.replace(
      'import { cn } from "@/lib/utils";',
      'import { cn } from "@/lib/utils";\nimport { useWorkspaceT } from "@/lib/i18n/use-scoped-t";',
    );
  }

  if (!c.includes(`useWorkspaceT("${ws.scope}")`)) {
    c = c.replace(
      /export function \w+Workspace\([^)]*\) \{\n/,
      (m) => `${m}  const wt = useWorkspaceT("${ws.scope}");\n`,
    );
  }

  // Replace label: "X" with labelKey in tabs array if pattern exists
  c = c.replace(/label: "([^"]+)"/g, (match, label) => {
    return match; // keep for fallback - we'll use labelKey pattern below
  });

  // For cyber TABS const pattern
  if (c.includes("const TABS = [")) {
    c = c.replace(
      /\{ id: "(\w+)", label: "[^"]+", icon:/g,
      '{ id: "$1", labelKey: "tabs.$1", icon:',
    );
    c = c.replace(
      /\{TABS\.map\(\(\{ id, label, icon: Icon \}\)/,
      "{TABS.map(({ id, labelKey, icon: Icon })",
    );
    c = c.replace(
      /<span className="hidden sm:inline">\{label\}<\/span>/,
      '<span className="hidden sm:inline">{wt(labelKey)}</span>',
    );
  }

  // For CRM tabs array with key/label
  if (c.includes("const tabs = [")) {
    c = c.replace(
      /key: "(\w+)" as const, label: "[^"]+"/g,
      'key: "$1" as const, labelKey: "tabs.$1"',
    );
    c = c.replace(
      /tabs\.map\(\(\{ key, label, icon: Icon \}\)/,
      "tabs.map(({ key, labelKey, icon: Icon })",
    );
    c = c.replace(
      /<span className="hidden sm:inline">\{label\}<\/span>/,
      '<span className="hidden sm:inline">{wt(labelKey)}</span>',
    );
  }

  fs.writeFileSync(filePath, c);
  console.log("wired", ws.file);
}
