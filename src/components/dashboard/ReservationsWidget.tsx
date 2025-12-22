import { CalendarDays, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reservation {
  id: string;
  name: string;
  time: string;
  guests: number;
  table: string;
  status: "confirmed" | "pending" | "seated";
}

const reservations: Reservation[] = [
  { id: "1", name: "Thompson Party", time: "6:00 PM", guests: 4, table: "T-12", status: "confirmed" },
  { id: "2", name: "Birthday - Lee", time: "6:30 PM", guests: 8, table: "T-5", status: "confirmed" },
  { id: "3", name: "Anderson", time: "7:00 PM", guests: 2, table: "T-3", status: "pending" },
  { id: "4", name: "Corporate Dinner", time: "7:30 PM", guests: 12, table: "Private", status: "confirmed" },
  { id: "5", name: "Rodriguez", time: "8:00 PM", guests: 6, table: "T-8", status: "pending" },
];

export function ReservationsWidget() {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">Upcoming Reservations</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>Today</span>
        </div>
      </div>

      <div className="space-y-3">
        {reservations.map((res, index) => (
          <div
            key={res.id}
            className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors animate-slide-in"
            style={{ animationDelay: `${500 + index * 100}ms` }}
          >
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Clock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{res.name}</p>
              <p className="text-xs text-muted-foreground">{res.time} • Table {res.table}</p>
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
    </div>
  );
}
