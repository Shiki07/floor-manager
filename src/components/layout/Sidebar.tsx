import { useState, useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  // Default to collapsed on tablets (portrait mode optimization)
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const roleLabel = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Staff';

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [activeTab]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setMobileOpen(false);
  };

  // Check if we're showing compact mode (collapsed on desktop/tablet or mobile overlay closed)
  const isCompact = collapsed && !mobileOpen;

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile Header - only on small screens */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-sidebar-border flex items-center px-4 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-glow">
            <ChefHat className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-base font-bold text-foreground">
            Floor Manager
          </span>
        </div>
      </header>

      {/* Mobile Overlay - semi-transparent to keep page visible */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          // Desktop/Tablet - always visible, z-50
          "hidden md:block md:z-50",
          collapsed ? "md:w-20" : "md:w-64",
          // Mobile - slide-in style with higher z-index than overlay, narrower width
          mobileOpen && "block w-64 z-50 shadow-2xl"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow shrink-0">
                <ChefHat className="h-5 w-5 text-primary-foreground" />
              </div>
              {!isCompact && (
                <span className="font-display text-lg font-bold text-foreground">
                  Floor Manager
                </span>
              )}
            </div>
            {/* Desktop/Tablet collapse button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors hidden md:block"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors md:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              const buttonContent = (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 animate-fade-in",
                    isActive
                      ? "bg-primary/10 text-primary shadow-glow"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                    isCompact && "justify-center px-0"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                  {!isCompact && <span>{item.label}</span>}
                </button>
              );

              // Show tooltip when collapsed
              if (isCompact) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      {buttonContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return buttonContent;
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-sidebar-border p-4">
            <div className={cn("flex items-center gap-3", isCompact && "justify-center")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 cursor-default">
                    <span className="text-sm font-semibold text-foreground">{initials}</span>
                  </div>
                </TooltipTrigger>
                {isCompact && (
                  <TooltipContent side="right">
                    <p className="font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{roleLabel}</p>
                  </TooltipContent>
                )}
              </Tooltip>
              {!isCompact && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
                </div>
              )}
            </div>
            {isCompact ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="mt-3 w-full text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign Out</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="mt-3 w-full text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2">Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}