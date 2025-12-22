import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StaffSchedule } from "@/components/dashboard/StaffSchedule";
import { ReservationsWidget } from "@/components/dashboard/ReservationsWidget";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { OrdersChart } from "@/components/dashboard/OrdersChart";
import { TableStatus } from "@/components/dashboard/TableStatus";

export function DashboardView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Revenue"
          value="$4,832"
          change="+12.5% from yesterday"
          changeType="positive"
          icon={DollarSign}
          delay={100}
        />
        <MetricCard
          title="Orders"
          value="156"
          change="+8 in last hour"
          changeType="positive"
          icon={ShoppingBag}
          delay={150}
        />
        <MetricCard
          title="Active Staff"
          value="12"
          change="2 on break"
          changeType="neutral"
          icon={Users}
          delay={200}
        />
        <MetricCard
          title="Avg Order Value"
          value="$31.00"
          change="+$2.50 vs avg"
          changeType="positive"
          icon={TrendingUp}
          delay={250}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <OrdersChart />
          <TableStatus />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <QuickActions />
          <StaffSchedule />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReservationsWidget />
        <InventoryAlerts />
      </div>
    </div>
  );
}
