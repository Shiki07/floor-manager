import { useState } from "react";
import { Plus, ClipboardList, Bell, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReservationDialog } from "@/components/dialogs/ReservationDialog";
import { NewOrderDialog } from "@/components/dialogs/NewOrderDialog";
import { useCreateReservation } from "@/hooks/useReservations";
import { useCreateOrder } from "@/hooks/useOrders";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuickActionsProps {
  onNavigate?: (tab: string) => void;
  onTakeOrder?: () => void;
}

export function QuickActions({ onNavigate, onTakeOrder }: QuickActionsProps) {
  const [reservationOpen, setReservationOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const createReservation = useCreateReservation();
  const createOrder = useCreateOrder();

  const handleNewOrder = () => {
    // If we have a dedicated order taking view, use that
    if (onTakeOrder) {
      onTakeOrder();
    } else {
      setOrderOpen(true);
    }
  };

  const handleReservation = () => {
    setReservationOpen(true);
  };

  const handleKitchenAlert = () => {
    setAlertOpen(true);
  };

  const handleDailyReport = () => {
    setReportOpen(true);
  };

  const handleReservationSubmit = async (data: any) => {
    await createReservation.mutateAsync(data);
    setReservationOpen(false);
  };

  const handleOrderSubmit = async (data: any) => {
    await createOrder.mutateAsync(data);
    setOrderOpen(false);
  };

  const sendKitchenAlert = (message: string) => {
    toast.success("Kitchen Alert Sent", {
      description: message || "Alert sent to kitchen staff",
    });
    setAlertOpen(false);
  };

  const actions = [
    { icon: Plus, label: "New Order", variant: "default" as const, onClick: handleNewOrder },
    { icon: ClipboardList, label: "Take Reservation", variant: "secondary" as const, onClick: handleReservation },
    { icon: Bell, label: "Kitchen Alert", variant: "secondary" as const, onClick: handleKitchenAlert },
    { icon: FileText, label: "Daily Report", variant: "secondary" as const, onClick: handleDailyReport },
  ];

  // Get today's date for report
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant={action.variant}
                className="h-auto py-4 flex-col gap-2 animate-fade-in"
                style={{ animationDelay: `${300 + index * 100}ms` }}
                onClick={action.onClick}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Reservation Dialog */}
      <ReservationDialog
        open={reservationOpen}
        onOpenChange={setReservationOpen}
        onSubmit={handleReservationSubmit}
        isLoading={createReservation.isPending}
      />

      {/* New Order Dialog */}
      <NewOrderDialog
        open={orderOpen}
        onOpenChange={setOrderOpen}
        onSubmit={handleOrderSubmit}
        isLoading={createOrder.isPending}
      />

      {/* Kitchen Alert Dialog */}
      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Bell className="h-5 w-5 text-warning" />
              Send Kitchen Alert
            </DialogTitle>
            <DialogDescription>
              Send a quick alert to the kitchen staff
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            {[
              "🔥 Rush order - Priority!",
              "⚠️ Allergy alert on current order",
              "🍽️ Table ready for food pickup",
              "📋 Check special instructions",
              "🧊 86'd item - check availability",
            ].map((alert) => (
              <Button
                key={alert}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => sendKitchenAlert(alert)}
              >
                {alert}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Daily Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Daily Report
            </DialogTitle>
            <DialogDescription>{formattedDate}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-sm text-muted-foreground">Total Covers</p>
                <p className="text-2xl font-bold text-foreground">--</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold text-foreground">$--</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-sm text-muted-foreground">Reservations</p>
                <p className="text-2xl font-bold text-foreground">--</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-sm text-muted-foreground">Avg. Check</p>
                <p className="text-2xl font-bold text-foreground">$--</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Connect financial data to see real-time reports
            </p>
            <Button className="w-full" onClick={() => setReportOpen(false)}>
              Close Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
