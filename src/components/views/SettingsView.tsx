import { useState } from "react";
import { Save, Bell, Clock, Globe, Shield, Palette, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserRoleManagement } from "@/components/settings/UserRoleManagement";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
const settingsSections = [
  { id: "general", label: "General", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "hours", label: "Operating Hours", icon: Clock },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "team", label: "Team & Roles", icon: Users },
];

export function SettingsView() {
  const [activeSection, setActiveSection] = useState("general");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in opacity-0">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your restaurant preferences</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
        {/* Sidebar - horizontal scroll on mobile, vertical on tablet+ */}
        <div className="rounded-xl md:rounded-2xl bg-card p-3 md:p-4 shadow-card h-fit animate-fade-in opacity-0 md:order-none order-first" style={{ animationDelay: "100ms" }}>
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 md:space-y-1">
            {settingsSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm font-medium transition-all animate-fade-in opacity-0 whitespace-nowrap shrink-0 md:w-full",
                    activeSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  style={{ animationDelay: `${150 + index * 50}ms` }}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-4 md:space-y-5 lg:space-y-6">
          {activeSection === "general" && (
            <div className="rounded-xl md:rounded-2xl bg-card p-4 md:p-5 lg:p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "200ms" }}>
              <h2 className="font-display text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">General Settings</h2>
              
              <div className="space-y-4 md:space-y-5 lg:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Restaurant Name</label>
                  <input
                    type="text"
                    defaultValue="The Grand Kitchen"
                    className="w-full h-10 px-4 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                  <input
                    type="text"
                    defaultValue="123 Culinary Street, Foodville, FC 12345"
                    className="w-full h-10 px-4 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue="(555) 123-4567"
                      className="w-full h-10 px-4 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="info@grandkitchen.com"
                      className="w-full h-10 px-4 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
                  <select className="w-full h-10 px-4 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Eastern Time (ET)</option>
                    <option>Central Time (CT)</option>
                    <option>Mountain Time (MT)</option>
                    <option>Pacific Time (PT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
                  <select className="w-full h-10 px-4 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                    <option>CAD ($)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === "hours" && (
            <div className="rounded-2xl bg-card p-4 sm:p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "200ms" }}>
              <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">Operating Hours</h2>
              
              <div className="space-y-3 sm:space-y-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => (
                  <div
                    key={day}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl bg-secondary/50 animate-fade-in opacity-0 gap-2 sm:gap-4"
                    style={{ animationDelay: `${250 + index * 50}ms` }}
                  >
                    <span className="font-medium text-foreground text-sm sm:text-base sm:w-28">{day}</span>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <input
                        type="time"
                        defaultValue={day === "Sunday" ? "10:00" : "11:00"}
                        className="h-9 sm:h-10 px-2 sm:px-3 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1 sm:flex-initial"
                      />
                      <span className="text-muted-foreground text-sm">to</span>
                      <input
                        type="time"
                        defaultValue={day === "Sunday" ? "21:00" : "23:00"}
                        className="h-9 sm:h-10 px-2 sm:px-3 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1 sm:flex-initial"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="rounded-xl md:rounded-2xl bg-card p-4 md:p-5 lg:p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "200ms" }}>
              <h2 className="font-display text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">Notification Preferences</h2>
              
              <div className="space-y-3 md:space-y-4">
                {[
                  { title: "New reservations", description: "Get notified when new reservations are made" },
                  { title: "Low inventory alerts", description: "Alert when stock falls below minimum levels" },
                  { title: "Staff schedule changes", description: "Notify when staff schedules are modified" },
                  { title: "Daily summary", description: "Receive a daily summary of restaurant performance" },
                  { title: "Customer reviews", description: "Get notified about new customer reviews" },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between p-3 md:p-4 rounded-lg md:rounded-xl bg-secondary/50 animate-fade-in opacity-0 gap-3"
                    style={{ animationDelay: `${250 + index * 50}ms` }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm md:text-base">{item.title}</p>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{item.description}</p>
                    </div>
                    <button className="relative h-6 w-11 rounded-full bg-primary transition-colors shrink-0">
                      <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-primary-foreground transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "team" && (
            <div className="rounded-xl md:rounded-2xl bg-card p-4 md:p-5 lg:p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "200ms" }}>
              <h2 className="font-display text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">Team & Role Management</h2>
              <UserRoleManagement />
            </div>
          )}

          {activeSection === "security" && (
            <div className="rounded-xl md:rounded-2xl bg-card p-4 md:p-5 lg:p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "200ms" }}>
              <h2 className="font-display text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">Security Settings</h2>
              <SecuritySettings />
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="rounded-xl md:rounded-2xl bg-card p-4 md:p-5 lg:p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "200ms" }}>
              <h2 className="font-display text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6 capitalize">Appearance Settings</h2>
              <p className="text-muted-foreground text-sm md:text-base">Configure your appearance preferences here. This section is under development.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
