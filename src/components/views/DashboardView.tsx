import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StaffSchedule } from "@/components/dashboard/StaffSchedule";
import { ReservationsWidget } from "@/components/dashboard/ReservationsWidget";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { OrdersChart } from "@/components/dashboard/OrdersChart";
import { TableStatus } from "@/components/dashboard/TableStatus";
import { LiveOrdersWidget } from "@/components/dashboard/LiveOrdersWidget";
import { useStaffMembers } from "@/hooks/useStaffMembers";
import { useReservations } from "@/hooks/useReservations";
import { useMenuItems } from "@/hooks/useMenuItems";

interface DashboardViewProps {
  onTakeOrder?: () => void;
}

export function DashboardView({ onTakeOrder }: DashboardViewProps) {
  const today = new Date().toISOString().split("T")[0];
  const { data: staffMembers = [] } = useStaffMembers();
  const { data: reservations = [] } = useReservations(today);
  const { data: menuItems = [] } = useMenuItems();

  const activeStaff = staffMembers.filter(s => s.status === "active").length;
  const onBreak = staffMembers.filter(s => s.status === "off").length;
  const todayReservations = reservations.filter(r => r.status !== "cancelled").length;
  const expectedGuests = reservations.reduce((acc, r) => acc + r.guests, 0);
  const avgMenuPrice = menuItems.length > 0 
    ? menuItems.reduce((acc, m) => acc + m.price, 0) / menuItems.length 
    : 0;

  return (
    <div className="space-y-4 md:space-y-5 lg:space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Metrics Grid - 2 cols on tablet, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          title="Today's Reservations"
          value={todayReservations.toString()}
          change={`${expectedGuests} expected guests`}
          changeType="neutral"
          icon={DollarSign}
          delay={100}
        />
        <MetricCard
          title="Menu Items"
          value={menuItems.length.toString()}
          change={`Avg $${avgMenuPrice.toFixed(0)} per item`}
          changeType="neutral"
          icon={ShoppingBag}
          delay={150}
        />
        <MetricCard
          title="Active Staff"
          value={activeStaff.toString()}
          change={onBreak > 0 ? `${onBreak} off today` : "All working"}
          changeType="neutral"
          icon={Users}
          delay={200}
        />
        <MetricCard
          title="Total Staff"
          value={staffMembers.length.toString()}
          change="Team members"
          changeType="neutral"
          icon={TrendingUp}
          delay={250}
        />
      </div>

      {/* Main Content Grid - optimized for tablet */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
        {/* Charts - full width on mobile, spans 2 on tablet, 2 on desktop */}
        <div className="md:col-span-2 xl:col-span-2 space-y-4 md:space-y-5 lg:space-y-6">
          <LiveOrdersWidget />
          <OrdersChart />
          <TableStatus />
        </div>

        {/* Right Column - stacks on tablet beside charts on xl */}
        <div className="md:col-span-2 xl:col-span-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4 md:gap-5 lg:gap-6">
          <QuickActions onTakeOrder={onTakeOrder} />
          <StaffSchedule />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
        <ReservationsWidget />
        <InventoryAlerts />
      </div>
    </div>
  );
}
