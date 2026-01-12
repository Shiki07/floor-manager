import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  className?: string;
  delay?: number;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className,
  delay = 0,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl md:rounded-2xl bg-card p-4 md:p-5 lg:p-6 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 animate-fade-in",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 gradient-glow opacity-50" />
      
      <div className="relative flex items-start justify-between gap-2">
        <div className="space-y-1 md:space-y-2 min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-2xl md:text-3xl font-display font-bold text-foreground">{value}</p>
          {change && (
            <p
              className={cn(
                "text-xs md:text-sm font-medium truncate",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg md:rounded-xl bg-primary/10 shrink-0">
          <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
