import { cn } from "@/lib/utils";
import { Clock, User } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  shift: string;
  status: "active" | "break" | "upcoming";
  avatar?: string;
}

const staffData: StaffMember[] = [
  { id: "1", name: "Maria Garcia", role: "Head Chef", shift: "6:00 AM - 2:00 PM", status: "active" },
  { id: "2", name: "James Wilson", role: "Sous Chef", shift: "10:00 AM - 6:00 PM", status: "active" },
  { id: "3", name: "Sarah Chen", role: "Server", shift: "11:00 AM - 7:00 PM", status: "break" },
  { id: "4", name: "Mike Johnson", role: "Bartender", shift: "4:00 PM - 12:00 AM", status: "upcoming" },
  { id: "5", name: "Emma Davis", role: "Host", shift: "5:00 PM - 11:00 PM", status: "upcoming" },
];

export function StaffSchedule() {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">Today's Staff</h3>
        <span className="text-sm text-muted-foreground">
          {staffData.filter(s => s.status === "active").length} on duty
        </span>
      </div>

      <div className="space-y-3">
        {staffData.map((staff, index) => (
          <div
            key={staff.id}
            className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors animate-slide-in opacity-0"
            style={{ animationDelay: `${400 + index * 100}ms` }}
          >
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{staff.name}</p>
              <p className="text-xs text-muted-foreground">{staff.role}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{staff.shift}</span>
              </div>
              <span
                className={cn(
                  "inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  staff.status === "active" && "bg-success/20 text-success",
                  staff.status === "break" && "bg-warning/20 text-warning",
                  staff.status === "upcoming" && "bg-muted text-muted-foreground"
                )}
              >
                {staff.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
