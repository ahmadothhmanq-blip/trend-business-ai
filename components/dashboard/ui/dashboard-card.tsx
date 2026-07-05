import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const cardClass =
  "dashboard-card overflow-hidden border-white/[0.09] bg-transparent shadow-none transition-all duration-300";

export function DashboardCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return <Card className={cn(cardClass, className)} {...props} />;
}

export function DashboardCardHeader({
  className,
  ...props
}: React.ComponentProps<typeof CardHeader>) {
  return <CardHeader className={cn("pb-4", className)} {...props} />;
}

export function DashboardCardTitle({
  className,
  ...props
}: React.ComponentProps<typeof CardTitle>) {
  return (
    <CardTitle
      className={cn("text-lg font-bold tracking-tight text-white", className)}
      {...props}
    />
  );
}

export function DashboardCardDescription({
  className,
  ...props
}: React.ComponentProps<typeof CardDescription>) {
  return (
    <CardDescription
      className={cn("text-[14px] leading-relaxed text-white/45", className)}
      {...props}
    />
  );
}

export function DashboardCardContent({
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return <CardContent className={cn(className)} {...props} />;
}

export function DashboardPanel({
  className,
  children,
  gold,
}: {
  className?: string;
  children: React.ReactNode;
  gold?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6 sm:p-7",
        gold
          ? "border-premium-gold/20 glass-panel-gold glass-panel-premium"
          : "border-white/[0.09] glass-panel glass-panel-premium",
        className,
      )}
    >
      {children}
    </div>
  );
}
