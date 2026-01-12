import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardView } from "@/components/views/DashboardView";
import { StaffView } from "@/components/views/StaffView";
import { MenuView } from "@/components/views/MenuView";
import { ReservationsView } from "@/components/views/ReservationsView";
import { InventoryView } from "@/components/views/InventoryView";
import { FinancesView } from "@/components/views/FinancesView";
import { SettingsView } from "@/components/views/SettingsView";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "staff":
        return <StaffView />;
      case "menu":
        return <MenuView />;
      case "reservations":
        return <ReservationsView />;
      case "inventory":
        return <InventoryView />;
      case "finances":
        return <FinancesView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Main content - responsive padding */}
      <main className="min-h-screen pt-14 lg:pt-0 lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Index;