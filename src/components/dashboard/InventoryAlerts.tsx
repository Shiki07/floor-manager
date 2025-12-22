import { AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  name: string;
  current: number;
  minimum: number;
  unit: string;
  urgency: "critical" | "low" | "warning";
}

const lowStockItems: InventoryItem[] = [
  { id: "1", name: "Salmon Fillet", current: 5, minimum: 15, unit: "lbs", urgency: "critical" },
  { id: "2", name: "House Red Wine", current: 8, minimum: 20, unit: "bottles", urgency: "critical" },
  { id: "3", name: "Fresh Basil", current: 12, minimum: 25, unit: "bunches", urgency: "low" },
  { id: "4", name: "Olive Oil", current: 6, minimum: 10, unit: "liters", urgency: "warning" },
];

export function InventoryAlerts() {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "500ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">Low Stock Alerts</h3>
        <span className="flex items-center gap-1 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          {lowStockItems.filter(i => i.urgency === "critical").length} critical
        </span>
      </div>

      <div className="space-y-3">
        {lowStockItems.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors animate-slide-in opacity-0"
            style={{ animationDelay: `${600 + index * 100}ms` }}
          >
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                item.urgency === "critical" && "bg-destructive/20",
                item.urgency === "warning" && "bg-warning/20",
                item.urgency === "low" && "bg-muted"
              )}
            >
              <Package
                className={cn(
                  "h-5 w-5",
                  item.urgency === "critical" && "text-destructive",
                  item.urgency === "warning" && "text-warning",
                  item.urgency === "low" && "text-muted-foreground"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.current} / {item.minimum} {item.unit}
              </p>
            </div>
            <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  item.urgency === "critical" && "bg-destructive",
                  item.urgency === "warning" && "bg-warning",
                  item.urgency === "low" && "bg-success"
                )}
                style={{ width: `${(item.current / item.minimum) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
