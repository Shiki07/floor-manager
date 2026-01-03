import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  CalendarDays,
  Package,
  DollarSign,
  Settings,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "staff", label: "Staff", icon: Users },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "reservations", label: "Reservations", icon: CalendarDays },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "finances", label: "Finances", icon: DollarSign },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, userRole, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const roleLabel = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Staff';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <ChefHat className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-display text-lg font-bold text-foreground">
                RestaurantOS
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 animate-fade-in",
                  isActive
                    ? "bg-primary/10 text-primary shadow-glow"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-sm font-semibold text-foreground">{initials}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={handleSignOut}
            className={cn("mt-3 w-full text-muted-foreground hover:text-foreground", collapsed && "px-0")}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
