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
      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Index;
