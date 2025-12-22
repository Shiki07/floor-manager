import { useState } from "react";
import { Plus, Search, Calendar, Clock, Users, Phone, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  table: string;
  status: "confirmed" | "pending" | "seated" | "completed" | "cancelled";
  notes?: string;
}

const reservations: Reservation[] = [
  { id: "1", name: "Thompson Party", phone: "(555) 111-2222", date: "2024-01-15", time: "6:00 PM", guests: 4, table: "T-12", status: "confirmed", notes: "Anniversary dinner" },
  { id: "2", name: "Lee Birthday", phone: "(555) 222-3333", date: "2024-01-15", time: "6:30 PM", guests: 8, table: "T-5", status: "confirmed", notes: "Birthday cake requested" },
  { id: "3", name: "Anderson", phone: "(555) 333-4444", date: "2024-01-15", time: "7:00 PM", guests: 2, table: "T-3", status: "pending" },
  { id: "4", name: "Corporate Dinner", phone: "(555) 444-5555", date: "2024-01-15", time: "7:30 PM", guests: 12, table: "Private Room", status: "confirmed", notes: "Business meeting" },
  { id: "5", name: "Rodriguez Family", phone: "(555) 555-6666", date: "2024-01-15", time: "8:00 PM", guests: 6, table: "T-8", status: "pending" },
  { id: "6", name: "Smith Wedding", phone: "(555) 666-7777", date: "2024-01-16", time: "7:00 PM", guests: 20, table: "Event Space", status: "confirmed", notes: "Engagement party" },
  { id: "7", name: "Johnson", phone: "(555) 777-8888", date: "2024-01-16", time: "6:00 PM", guests: 3, table: "T-9", status: "confirmed" },
  { id: "8", name: "Williams", phone: "(555) 888-9999", date: "2024-01-16", time: "8:30 PM", guests: 4, table: "T-7", status: "pending" },
];

const statusConfig = {
  confirmed: { label: "Confirmed", color: "bg-success/20 text-success" },
  pending: { label: "Pending", color: "bg-warning/20 text-warning" },
  seated: { label: "Seated", color: "bg-primary/20 text-primary" },
  completed: { label: "Completed", color: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", color: "bg-destructive/20 text-destructive" },
};

export function ReservationsView() {
  const [selectedDate, setSelectedDate] = useState("2024-01-15");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReservations = reservations.filter((res) => {
    const matchesDate = res.date === selectedDate;
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const todayStats = {
    total: filteredReservations.length,
    confirmed: filteredReservations.filter(r => r.status === "confirmed").length,
    pending: filteredReservations.filter(r => r.status === "pending").length,
    guests: filteredReservations.reduce((acc, r) => acc + r.guests, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in opacity-0">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground mt-1">Manage bookings and table assignments</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Reservation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in opacity-0" style={{ animationDelay: "100ms" }}>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total Bookings</p>
          <p className="text-2xl font-display font-bold text-foreground">{todayStats.total}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Confirmed</p>
          <p className="text-2xl font-display font-bold text-success">{todayStats.confirmed}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-display font-bold text-warning">{todayStats.pending}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Expected Guests</p>
          <p className="text-2xl font-display font-bold text-primary">{todayStats.guests}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in opacity-0" style={{ animationDelay: "150ms" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reservations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.map((res, index) => (
          <div
            key={res.id}
            className="rounded-2xl bg-card p-5 shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in opacity-0"
            style={{ animationDelay: `${200 + index * 50}ms` }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow shrink-0">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{res.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {res.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {res.guests} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {res.phone}
                    </span>
                  </div>
                  {res.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">"{res.notes}"</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-sm font-medium text-foreground">{res.table}</span>
                  <span
                    className={cn(
                      "block mt-1 px-3 py-1 rounded-full text-xs font-medium",
                      statusConfig[res.status].color
                    )}
                  >
                    {statusConfig[res.status].label}
                  </span>
                </div>
                {res.status === "pending" && (
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-success/20 hover:bg-success/30 transition-colors">
                      <Check className="h-4 w-4 text-success" />
                    </button>
                    <button className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/30 transition-colors">
                      <X className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
