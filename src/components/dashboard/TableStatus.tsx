import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFloorTables, useUpdateTableStatus, TableStatus as TStatus } from "@/hooks/useFloorTables";
import { useIsManager } from "@/hooks/useUserRole";
import { Loader2, Settings2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableManagementDialog } from "@/components/dialogs/TableManagementDialog";
import { TableQRDialog } from "@/components/dialogs/TableQRDialog";

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
  const [qrDialogTable, setQrDialogTable] = useState<number | null>(null);

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
      <div className="rounded-2xl bg-card p-3 md:p-4 lg:p-6 shadow-card animate-fade-in" style={{ animationDelay: "450ms" }}>
        <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <h3 className="font-display text-base md:text-lg font-semibold text-foreground">Floor Plan</h3>
            {isManager && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-8 md:w-8"
                onClick={() => setManagementOpen(true)}
                title="Manage Tables"
              >
                <Settings2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-2 md:gap-4 text-[10px] md:text-xs">
            <span className="text-success">{counts.available} free</span>
            <span className="text-destructive">{counts.occupied} busy</span>
            <span className="text-warning">{counts.reserved} rsv</span>
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-3">
            {tables.map((table, index) => (
              <div
                key={table.id}
                className={cn(
                  "relative p-2 md:p-3 lg:p-4 rounded-lg md:rounded-xl border-2 transition-all duration-200 animate-fade-in",
                  statusColors[table.status]
                )}
                style={{ animationDelay: `${550 + index * 50}ms` }}
              >
                <button
                  onClick={() => cycleStatus(table.id, table.status)}
                  disabled={updateStatus.isPending}
                  className="w-full text-left hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  <span className="font-display font-bold text-sm md:text-base lg:text-lg">T{table.table_number}</span>
                  <span className="block text-[10px] md:text-xs opacity-75">{table.seats}s</span>
                  <span className="block text-[8px] md:text-[10px] font-medium uppercase tracking-wide mt-0.5 md:mt-1 opacity-90">
                    {table.status}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-60 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQrDialogTable(table.table_number);
                  }}
                  title="Show QR Code"
                >
                  <QrCode className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center gap-3 md:gap-4 lg:gap-6 mt-3 md:mt-4 lg:mt-6 pt-3 md:pt-4 border-t border-border flex-wrap">
          {Object.entries(statusColors).map(([status, colors]) => (
            <div key={status} className="flex items-center gap-1 md:gap-2">
              <div className={cn("w-2 h-2 md:w-3 md:h-3 rounded-full border", colors.split(" ").slice(0, 2).join(" "))} />
              <span className="text-[10px] md:text-xs text-muted-foreground capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      <TableManagementDialog open={managementOpen} onOpenChange={setManagementOpen} />
      
      {qrDialogTable !== null && (
        <TableQRDialog 
          open={qrDialogTable !== null} 
          onOpenChange={(open) => !open && setQrDialogTable(null)}
          tableNumber={qrDialogTable}
        />
      )}
    </>
  );
}
