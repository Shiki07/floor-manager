import { CalendarDays, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReservations } from "@/hooks/useReservations";
import { Skeleton } from "@/components/ui/skeleton";

export function ReservationsWidget() {
  const today = new Date().toISOString().split("T")[0];
  const { data: reservations = [], isLoading } = useReservations(today);

  const upcomingReservations = reservations
    .filter(r => r.status !== "cancelled" && r.status !== "completed")
    .slice(0, 5);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "400ms" }}>
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">Upcoming Reservations</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>Today</span>
        </div>
      </div>

      {upcomingReservations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No reservations for today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingReservations.map((res, index) => (
            <div
              key={res.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors animate-slide-in"
              style={{ animationDelay: `${500 + index * 100}ms` }}
            >
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Clock className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{res.customer_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(res.reservation_time)} • {res.table_number || "No table"}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-foreground">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{res.guests}</span>
                </div>
                <span
                  className={cn(
                    "inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium",
                    res.status === "confirmed" && "bg-success/20 text-success",
                    res.status === "pending" && "bg-warning/20 text-warning",
                    res.status === "seated" && "bg-primary/20 text-primary"
                  )}
                >
                  {res.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
