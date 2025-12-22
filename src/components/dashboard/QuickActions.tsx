import { Plus, ClipboardList, Bell, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Plus, label: "New Order", variant: "default" as const },
  { icon: ClipboardList, label: "Take Reservation", variant: "secondary" as const },
  { icon: Bell, label: "Kitchen Alert", variant: "secondary" as const },
  { icon: FileText, label: "Daily Report", variant: "secondary" as const },
];

export function QuickActions() {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "200ms" }}>
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant={action.variant}
              className="h-auto py-4 flex-col gap-2 animate-fade-in opacity-0"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
