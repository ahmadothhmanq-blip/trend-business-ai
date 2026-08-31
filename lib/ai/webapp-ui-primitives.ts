/**
 * Canonical App Builder UI primitives — deterministic scaffolds for components/ui.tsx.
 * Missing imports are always repaired locally; never via DeepSeek.
 */

export const CANONICAL_UI_PRIMITIVES = [
  "Button",
  "Input",
  "Textarea",
  "Label",
  "Card",
  "CardHeader",
  "CardTitle",
  "CardDescription",
  "CardContent",
  "CardFooter",
  "Badge",
  "Alert",
  "Select",
  "Checkbox",
  "Switch",
  "RadioGroup",
  "Tabs",
  "Dialog",
  "Sheet",
  "DropdownMenu",
  "Popover",
  "Tooltip",
  "Avatar",
  "Separator",
  "Skeleton",
  "Table",
  "TableHeader",
  "TableBody",
  "TableFooter",
  "TableRow",
  "TableHead",
  "TableCell",
  "ScrollArea",
  "Progress",
  "Breadcrumb",
  "Pagination",
] as const;

export type CanonicalUiPrimitive = (typeof CANONICAL_UI_PRIMITIVES)[number];

export function isCanonicalUiPrimitive(name: string): boolean {
  return (CANONICAL_UI_PRIMITIVES as readonly string[]).includes(name);
}

/** Lightweight production-ready fallbacks (no radix dependency required). */
export const CANONICAL_UI_SNIPPETS: Record<string, string> = {
  Button: `
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
      variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
      size === "default" && "h-10 px-4 py-2",
      size === "sm" && "h-9 rounded-md px-3",
      size === "lg" && "h-11 rounded-md px-8",
      size === "icon" && "h-10 w-10",
      className,
    );
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(classes, (children as React.ReactElement<{ className?: string }>).props.className),
      });
    }
    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
`,
  Input: `
export function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
`,
  Textarea: `
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
`,
  Label: `
export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
`,
  Card: `
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)} {...props} />;
}
`,
  CardHeader: `
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}
`,
  CardTitle: `
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />;
}
`,
  CardDescription: `
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
`,
  CardContent: `
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
`,
  CardFooter: `
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}
`,
  Badge: `
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground border-transparent",
  secondary: "bg-secondary text-secondary-foreground border-transparent",
  destructive: "bg-red-100 text-red-800 border-transparent",
  outline: "border border-input bg-background",
};
export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: BadgeVariant }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        badgeVariants[variant] ?? badgeVariants.default,
        className,
      )}
      {...props}
    />
  );
}
`,
  Alert: `
export function Alert({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={cn("relative w-full rounded-lg border px-4 py-3 text-sm", className)}
      {...props}
    />
  );
}
`,
  Select: `
export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
`,
  Checkbox: `
export function Checkbox({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
`,
  Switch: `
export function Switch({
  className,
  checked,
  onCheckedChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={cn(
        "peer h-5 w-9 appearance-none rounded-full bg-input transition-colors checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
`,
  RadioGroup: `
export function RadioGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="radiogroup" className={cn("grid gap-2", className)} {...props} />;
}
`,
  Tabs: `
export function Tabs({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full", className)} {...props} />;
}
`,
  Dialog: `
export function Dialog({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="dialog" className={cn("fixed inset-0 z-50", className)} {...props} />;
}
`,
  Sheet: `
export function Sheet({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="dialog" className={cn("fixed inset-y-0 z-50 w-full max-w-sm border bg-background p-6 shadow-lg", className)} {...props} />;
}
`,
  DropdownMenu: `
export function DropdownMenu({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative inline-block", className)} {...props} />;
}
`,
  Popover: `
export function Popover({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative inline-block", className)} {...props} />;
}
`,
  Tooltip: `
export function Tooltip({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative inline-block", className)} {...props} />;
}
`,
  Avatar: `
export function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted", className)}
      {...props}
    />
  );
}
`,
  Separator: `
export function Separator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("shrink-0 bg-border h-[1px] w-full", className)} {...props} />;
}
`,
  Skeleton: `
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
`,
  Table: `
export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}
`,
  TableHeader: `
export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}
`,
  TableBody: `
export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}
`,
  TableFooter: `
export function TableFooter({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot className={cn("border-t bg-muted/50 font-medium", className)} {...props} />;
}
`,
  TableRow: `
export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)}
      {...props}
    />
  );
}
`,
  TableHead: `
export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}
`,
  TableCell: `
export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />;
}
`,
  ScrollArea: `
export function ScrollArea({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative overflow-auto", className)} {...props} />;
}
`,
  Progress: `
export function Progress({
  className,
  value = 0,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value?: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
      <div className="h-full bg-primary transition-all" style={{ width: \`\${pct}%\` }} />
    </div>
  );
}
`,
  Breadcrumb: `
export function Breadcrumb({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav aria-label="breadcrumb" className={cn("flex flex-wrap items-center gap-1 text-sm", className)} {...props} />;
}
`,
  Pagination: `
export function Pagination({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav role="navigation" aria-label="pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />;
}
`,
};

const UI_BARREL_HEADER = `import * as React from "react";
import { cn } from "@/lib/utils";
`;

export function buildFullCanonicalUiBarrel(): string {
  const body = CANONICAL_UI_PRIMITIVES.map((name) => CANONICAL_UI_SNIPPETS[name] ?? "")
    .filter(Boolean)
    .join("\n");
  return `${UI_BARREL_HEADER}\n${body}\n`;
}

export function ensureReactAndCnImports(content: string): string {
  let next = content;
  if (!/\bfrom\s+['"]react['"]/.test(next) && !/\bimport\s+\*\s+as\s+React\b/.test(next)) {
    next = `import * as React from "react";\n${next}`;
  }
  if (!/\bcn\b/.test(next) || !/from\s+['"]@\/lib\/utils['"]/.test(next)) {
    if (!/from\s+['"]@\/lib\/utils['"]/.test(next)) {
      next = `import { cn } from "@/lib/utils";\n${next}`;
    }
  }
  return next;
}

export type UiBarrelInjectionResult = {
  content: string;
  injected: string[];
  corrected: string[];
  createdBarrel: boolean;
};

/**
 * Correct Button size/asChild contracts so apps never need LLM repair for UI typings.
 */
export function correctCanonicalButtonContracts(content: string): string {
  if (!/\b(?:export\s+)?(?:const|function)\s+Button\b/.test(content) && !/\binterface\s+ButtonProps\b/.test(content)) {
    return content;
  }

  let next = content;

  next = next.replace(
    /size\?\s*:\s*"default"\s*\|\s*"sm"\s*\|\s*"lg"(?!\s*\|\s*"icon")/g,
    'size?: "default" | "sm" | "lg" | "icon"',
  );

  if (/size === "lg"/.test(next) && !/size === "icon"/.test(next)) {
    next = next.replace(
      /(size === "lg" && "[^"]*",?)/,
      `$1\n      size === "icon" && "h-10 w-10",`,
    );
  }

  // cloneElement must not pass `ref` (breaks React 19 / TS overloads).
  next = next.replace(
    /(React\.cloneElement\([^,]+,\s*\{)([^}]*)(\})/g,
    (_full, open: string, props: string, close: string) => {
      const cleaned = props
        .replace(/(?:^|,)\s*ref\s*,?/g, ",")
        .replace(/,\s*,/g, ",")
        .replace(/^,\s*/, "")
        .replace(/,\s*$/, "")
        .trim();
      return `${open}${cleaned ? ` ${cleaned} ` : " "}${close}`;
    },
  );

  return next;
}

/**
 * Inject/correct all canonical UI exports in components/ui.tsx.
 * Always covers the full primitive set — never relies on DeepSeek for UI gaps.
 */
export function injectMissingCanonicalUiExports(
  uiContent: string | null,
  requiredExports: Iterable<string> = [],
): UiBarrelInjectionResult {
  const required = [
    ...new Set([...CANONICAL_UI_PRIMITIVES, ...requiredExports]),
  ].filter(isCanonicalUiPrimitive);
  let createdBarrel = false;
  let content = uiContent?.trim() ? uiContent : "";
  const corrected: string[] = [];

  if (!content) {
    content = buildFullCanonicalUiBarrel();
    createdBarrel = true;
    return {
      content: correctCanonicalButtonContracts(content),
      injected: [...CANONICAL_UI_PRIMITIVES],
      corrected: ["Button"],
      createdBarrel,
    };
  }

  content = ensureReactAndCnImports(content);
  const injected: string[] = [];

  for (const name of required) {
    if (hasUiExport(content, name)) continue;
    const snippet = CANONICAL_UI_SNIPPETS[name];
    if (!snippet) continue;
    content = `${content.trimEnd()}\n${snippet}`;
    injected.push(name);
  }

  const beforeButton = content;
  content = correctCanonicalButtonContracts(content);
  if (content !== beforeButton) corrected.push("Button");

  return { content, injected, corrected, createdBarrel };
}

function hasUiExport(content: string, symbol: string): boolean {
  if (new RegExp(`\\bexport\\s+(?:const|function|class|type|interface)\\s+${symbol}\\b`).test(content)) {
    return true;
  }
  if (new RegExp(`\\b(?:const|function)\\s+${symbol}\\b`).test(content)) return true;
  if (new RegExp(`export\\s*\\{[^}]*\\b${symbol}\\b`).test(content)) return true;
  return false;
}

/** UI barrel paths that must never enter DeepSeek repair. */
export function isUiBarrelPath(path: string): boolean {
  const normalized = path.replaceAll("\\", "/");
  return (
    normalized === "components/ui.tsx" ||
    normalized === "components/ui.ts" ||
    normalized.startsWith("components/ui/")
  );
}
