import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardView } from "@/components/views/DashboardView";
import { StaffView } from "@/components/views/StaffView";
import { MenuView } from "@/components/views/MenuView";
import { ReservationsView } from "@/components/views/ReservationsView";
import { InventoryView } from "@/components/views/InventoryView";
import { FinancesView } from "@/components/views/FinancesView";
import { SettingsView } from "@/components/views/SettingsView";
import { OrderTakingView } from "@/components/views/OrderTakingView";
import { useSwipeRef } from "@/hooks/useSwipeNavigation";
import { cn } from "@/lib/utils";

const tabs = [
  "dashboard",
  "orders", // New dedicated order taking tab
  "staff",
  "menu",
  "reservations",
  "inventory",
  "finances",
  "settings",
] as const;

type Tab = typeof tabs[number];

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const navigateToTab = useCallback((direction: 'prev' | 'next') => {
    const currentIndex = tabs.indexOf(activeTab);
    let newIndex: number;
    
    if (direction === 'next') {
      newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : currentIndex;
      if (newIndex !== currentIndex) setSwipeDirection('left');
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
      if (newIndex !== currentIndex) setSwipeDirection('right');
    }
    
    if (newIndex !== currentIndex) {
      setActiveTab(tabs[newIndex]);
    }
  }, [activeTab]);

  // Reset swipe animation after it completes
  useEffect(() => {
    if (swipeDirection) {
      const timer = setTimeout(() => setSwipeDirection(null), 300);
      return () => clearTimeout(timer);
    }
  }, [swipeDirection]);

  const { ref: swipeRef } = useSwipeRef<HTMLDivElement>({
    minSwipeDistance: 80,
    maxSwipeTime: 400,
    onSwipeLeft: () => navigateToTab('next'),
    onSwipeRight: () => navigateToTab('prev'),
    enabled: true, // Enable on tablets/mobile
  });

  const handleTabChange = (tab: string) => {
    // Map sidebar tabs to internal tabs
    const tabMap: Record<string, Tab> = {
      dashboard: "dashboard",
      staff: "staff",
      menu: "menu",
      reservations: "reservations",
      inventory: "inventory",
      finances: "finances",
      settings: "settings",
    };
    setActiveTab(tabMap[tab] || "dashboard");
  };

  // Map activeTab to sidebar active state
  const sidebarActiveTab = activeTab === "orders" ? "dashboard" : activeTab;

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView onTakeOrder={() => setActiveTab("orders")} />;
      case "orders":
        return <OrderTakingView onBack={() => setActiveTab("dashboard")} />;
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
        return <DashboardView onTakeOrder={() => setActiveTab("orders")} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={sidebarActiveTab} onTabChange={handleTabChange} />
      {/* Main content - responsive padding for mobile/tablet/desktop */}
      <main 
        ref={swipeRef}
        className={cn(
          "min-h-screen pt-14 md:pt-0 md:pl-64 transition-transform duration-300",
          swipeDirection === 'left' && "animate-slide-in-right",
          swipeDirection === 'right' && "animate-slide-in-left"
        )}
      >
        {activeTab === "orders" ? (
          renderView()
        ) : (
          <div className="p-4 sm:p-5 md:p-6 lg:p-8">
            {renderView()}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;