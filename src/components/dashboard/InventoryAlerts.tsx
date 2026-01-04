import { AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { Skeleton } from "@/components/ui/skeleton";

export function InventoryAlerts() {
  const { data: inventoryItems = [], isLoading } = useInventoryItems();

  const lowStockItems = inventoryItems
    .filter(item => item.current_stock < item.minimum_stock)
    .map(item => {
      const percentage = (item.current_stock / item.minimum_stock) * 100;
      let urgency: "critical" | "warning" | "low" = "low";
      if (percentage < 50) urgency = "critical";
      else if (percentage < 75) urgency = "warning";
      return { ...item, urgency };
    })
    .slice(0, 5);

  const criticalCount = lowStockItems.filter(i => i.urgency === "critical").length;

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "500ms" }}>
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "500ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">Low Stock Alerts</h3>
        {criticalCount > 0 ? (
          <span className="flex items-center gap-1 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {criticalCount} critical
          </span>
        ) : lowStockItems.length > 0 ? (
          <span className="text-sm text-warning">{lowStockItems.length} low</span>
        ) : (
          <span className="text-sm text-success">All stocked</span>
        )}
      </div>

      {lowStockItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">All inventory items are well stocked</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lowStockItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors animate-slide-in"
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
                  {item.current_stock} / {item.minimum_stock} {item.unit}
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
                  style={{ width: `${(item.current_stock / item.minimum_stock) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
