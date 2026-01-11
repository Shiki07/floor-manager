import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFloorTables, useUpdateTableStatus, TableStatus as TStatus } from "@/hooks/useFloorTables";
import { useIsManager } from "@/hooks/useUserRole";
import { Loader2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableManagementDialog } from "@/components/dialogs/TableManagementDialog";

const statusColors = {
  available: "bg-success/20 border-success text-success",
  occupied: "bg-destructive/20 border-destructive text-destructive",
  reserved: "bg-warning/20 border-warning text-warning",
  cleaning: "bg-muted border-muted-foreground text-muted-foreground",
};

const statusOrder: TStatus[] = ["available", "occupied", "reserved", "cleaning"];

export function TableStatus() {
  const { data: tables = [], isLoading } = useFloorTables();
  const updateStatus = useUpdateTableStatus();
  const { isManager } = useIsManager();
  const [managementOpen, setManagementOpen] = useState(false);

  const cycleStatus = (tableId: string, currentStatus: TStatus) => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    updateStatus.mutate({ id: tableId, status: statusOrder[nextIndex] });
  };

  const counts = {
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "450ms" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-lg font-semibold text-foreground">Floor Plan</h3>
            {isManager && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setManagementOpen(true)}
                title="Manage Tables"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-4 text-xs">
            <span className="text-success">{counts.available} free</span>
            <span className="text-destructive">{counts.occupied} busy</span>
            <span className="text-warning">{counts.reserved} reserved</span>
          </div>
        </div>

        {tables.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tables configured yet.</p>
            {isManager && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setManagementOpen(true)}
              >
                Add Tables
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {tables.map((table, index) => (
              <button
                key={table.id}
                onClick={() => cycleStatus(table.id, table.status)}
                disabled={updateStatus.isPending}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer animate-fade-in disabled:opacity-50",
                  statusColors[table.status]
                )}
                style={{ animationDelay: `${550 + index * 50}ms` }}
              >
                <span className="font-display font-bold text-lg">T{table.table_number}</span>
                <span className="block text-xs opacity-75">{table.seats} seats</span>
                <span className="block text-[10px] font-medium uppercase tracking-wide mt-1 opacity-90">
                  {table.status}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-border">
          {Object.entries(statusColors).map(([status, colors]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full border", colors.split(" ").slice(0, 2).join(" "))} />
              <span className="text-xs text-muted-foreground capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      <TableManagementDialog open={managementOpen} onOpenChange={setManagementOpen} />
    </>
  );
}
