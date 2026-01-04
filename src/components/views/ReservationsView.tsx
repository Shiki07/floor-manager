import { useState } from "react";
import { Plus, Search, Calendar, Clock, Users, Phone, Check, X, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReservations, useCreateReservation, useUpdateReservation, useDeleteReservation } from "@/hooks/useReservations";
import { ReservationDialog } from "@/components/dialogs/ReservationDialog";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

type Reservation = Tables<"reservations">;

const statusConfig: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Confirmed", color: "bg-success/20 text-success" },
  pending: { label: "Pending", color: "bg-warning/20 text-warning" },
  seated: { label: "Seated", color: "bg-primary/20 text-primary" },
  completed: { label: "Completed", color: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", color: "bg-destructive/20 text-destructive" },
};

export function ReservationsView() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const { data: reservations = [], isLoading } = useReservations(selectedDate);
  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();

  const filteredReservations = reservations.filter((res) => 
    res.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayStats = {
    total: filteredReservations.length,
    confirmed: filteredReservations.filter(r => r.status === "confirmed").length,
    pending: filteredReservations.filter(r => r.status === "pending").length,
    guests: filteredReservations.reduce((acc, r) => acc + r.guests, 0),
  };

  const handleSubmit = (data: Partial<Reservation>) => {
    if (selectedReservation) {
      updateReservation.mutate({ id: selectedReservation.id, ...data }, {
        onSuccess: () => {
          setDialogOpen(false);
          setSelectedReservation(null);
        }
      });
    } else {
      createReservation.mutate(data as any, {
        onSuccess: () => {
          setDialogOpen(false);
        }
      });
    }
  };

  const handleDelete = () => {
    if (selectedReservation) {
      deleteReservation.mutate(selectedReservation.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedReservation(null);
        }
      });
    }
  };

  const handleStatusChange = (reservation: Reservation, newStatus: string) => {
    updateReservation.mutate({ id: reservation.id, status: newStatus });
  };

  const openEditDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDialogOpen(true);
  };

  const openDeleteDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDeleteDialogOpen(true);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in opacity-0">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground mt-1">Manage bookings and table assignments</p>
        </div>
        <Button className="gap-2" onClick={() => { setSelectedReservation(null); setDialogOpen(true); }}>
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
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery 
            ? "No reservations match your search." 
            : "No reservations for this date. Create a new one!"}
        </div>
      ) : (
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
                    <h3 className="font-semibold text-foreground">{res.customer_name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(res.reservation_time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {res.guests} guests
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {res.customer_phone}
                      </span>
                    </div>
                    {res.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">"{res.notes}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {res.table_number && (
                      <span className="text-sm font-medium text-foreground">{res.table_number}</span>
                    )}
                    <span
                      className={cn(
                        "block mt-1 px-3 py-1 rounded-full text-xs font-medium",
                        statusConfig[res.status]?.color || statusConfig.pending.color
                      )}
                    >
                      {statusConfig[res.status]?.label || res.status}
                    </span>
                  </div>
                  {res.status === "pending" && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusChange(res, "confirmed")}
                        className="p-2 rounded-lg bg-success/20 hover:bg-success/30 transition-colors"
                      >
                        <Check className="h-4 w-4 text-success" />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(res, "cancelled")}
                        className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/30 transition-colors"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditDialog(res)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button 
                      onClick={() => openDeleteDialog(res)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReservationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reservation={selectedReservation}
        onSubmit={handleSubmit}
        isLoading={createReservation.isPending || updateReservation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Reservation"
        description={`Are you sure you want to delete the reservation for ${selectedReservation?.customer_name}? This action cannot be undone.`}
        isLoading={deleteReservation.isPending}
      />
    </div>
  );
}
