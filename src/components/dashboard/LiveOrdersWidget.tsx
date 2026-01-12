import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  Loader2,
  Bell
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusConfig = {
  pending: { 
    label: "New", 
    variant: "destructive" as const,
    icon: Bell,
    nextStatus: "preparing",
    nextLabel: "Start Preparing"
  },
  preparing: { 
    label: "Preparing", 
    variant: "secondary" as const,
    icon: ChefHat,
    nextStatus: "ready",
    nextLabel: "Mark Ready"
  },
  ready: { 
    label: "Ready", 
    variant: "default" as const,
    icon: Clock,
    nextStatus: "completed",
    nextLabel: "Complete"
  },
  completed: { 
    label: "Completed", 
    variant: "outline" as const,
    icon: CheckCircle2,
    nextStatus: null,
    nextLabel: null
  },
};

export function LiveOrdersWidget() {
  const { data: orders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();

  // Filter to show only active orders (not completed)
  const activeOrders = orders.filter(o => o.status !== "completed").slice(0, 10);

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Live Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Live Orders
          </div>
          {activeOrders.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {activeOrders.filter(o => o.status === "pending").length} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No active orders</p>
            <p className="text-sm">Orders will appear here in real-time</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {activeOrders.map(order => {
                const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                const StatusIcon = config.icon;
                
                return (
                  <div 
                    key={order.id}
                    className={`p-3 rounded-lg border transition-all ${
                      order.status === "pending" 
                        ? "border-destructive bg-destructive/5 animate-pulse" 
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">Table {order.table_number}</span>
                          <Badge variant={config.variant} className="text-xs">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <span className="font-bold text-primary">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                    
                    {order.notes && (
                      <p className="text-sm text-muted-foreground mb-2 italic">
                        "{order.notes}"
                      </p>
                    )}
                    
                    {config.nextStatus && (
                      <Button
                        size="sm"
                        variant={order.status === "pending" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => updateStatus.mutate({ 
                          id: order.id, 
                          status: config.nextStatus! 
                        })}
                        disabled={updateStatus.isPending}
                      >
                        {config.nextLabel}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}