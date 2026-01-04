import { cn } from "@/lib/utils";
import { Clock, User } from "lucide-react";
import { useStaffMembers } from "@/hooks/useStaffMembers";
import { Skeleton } from "@/components/ui/skeleton";

export function StaffSchedule() {
  const { data: staffMembers = [], isLoading } = useStaffMembers();

  const activeStaff = staffMembers.filter(s => s.status === "active").slice(0, 5);
  const onDutyCount = staffMembers.filter(s => s.status === "active").length;

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "300ms" }}>
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">Today's Staff</h3>
        <span className="text-sm text-muted-foreground">
          {onDutyCount} on duty
        </span>
      </div>

      {staffMembers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No staff members yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(activeStaff.length > 0 ? activeStaff : staffMembers.slice(0, 5)).map((staff, index) => (
            <div
              key={staff.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors animate-slide-in"
              style={{ animationDelay: `${400 + index * 100}ms` }}
            >
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                {staff.avatar_url ? (
                  <img src={staff.avatar_url} alt={staff.full_name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{staff.full_name}</p>
                <p className="text-xs text-muted-foreground">{staff.role}</p>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                    staff.status === "active" && "bg-success/20 text-success",
                    staff.status === "off" && "bg-muted text-muted-foreground",
                    staff.status === "vacation" && "bg-warning/20 text-warning"
                  )}
                >
                  {staff.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
