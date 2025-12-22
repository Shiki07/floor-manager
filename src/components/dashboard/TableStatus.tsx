import { cn } from "@/lib/utils";

interface Table {
  id: string;
  number: number;
  seats: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
}

const tables: Table[] = [
  { id: "1", number: 1, seats: 2, status: "available" },
  { id: "2", number: 2, seats: 2, status: "occupied" },
  { id: "3", number: 3, seats: 4, status: "occupied" },
  { id: "4", number: 4, seats: 4, status: "available" },
  { id: "5", number: 5, seats: 6, status: "reserved" },
  { id: "6", number: 6, seats: 4, status: "occupied" },
  { id: "7", number: 7, seats: 2, status: "cleaning" },
  { id: "8", number: 8, seats: 8, status: "occupied" },
  { id: "9", number: 9, seats: 4, status: "available" },
  { id: "10", number: 10, seats: 2, status: "occupied" },
  { id: "11", number: 11, seats: 6, status: "reserved" },
  { id: "12", number: 12, seats: 4, status: "available" },
];

const statusColors = {
  available: "bg-success/20 border-success text-success",
  occupied: "bg-destructive/20 border-destructive text-destructive",
  reserved: "bg-warning/20 border-warning text-warning",
  cleaning: "bg-muted border-muted-foreground text-muted-foreground",
};

export function TableStatus() {
  const counts = {
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
  };

  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "450ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">Floor Plan</h3>
        <div className="flex gap-4 text-xs">
          <span className="text-success">{counts.available} free</span>
          <span className="text-destructive">{counts.occupied} busy</span>
          <span className="text-warning">{counts.reserved} reserved</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {tables.map((table, index) => (
          <button
            key={table.id}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 animate-fade-in",
              statusColors[table.status]
            )}
            style={{ animationDelay: `${550 + index * 50}ms` }}
          >
            <span className="font-display font-bold text-lg">T{table.number}</span>
            <span className="block text-xs opacity-75">{table.seats} seats</span>
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-border">
        {Object.entries(statusColors).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full border", colors.split(" ").slice(0, 2).join(" "))} />
            <span className="text-xs text-muted-foreground capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
