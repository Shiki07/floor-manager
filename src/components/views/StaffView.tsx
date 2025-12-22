import { useState } from "react";
import { Plus, Search, Filter, MoreVertical, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: "active" | "off" | "vacation";
  hoursThisWeek: number;
  avatar?: string;
}

const staffMembers: StaffMember[] = [
  { id: "1", name: "Maria Garcia", role: "Head Chef", email: "maria@resto.com", phone: "(555) 123-4567", status: "active", hoursThisWeek: 42 },
  { id: "2", name: "James Wilson", role: "Sous Chef", email: "james@resto.com", phone: "(555) 234-5678", status: "active", hoursThisWeek: 38 },
  { id: "3", name: "Sarah Chen", role: "Server", email: "sarah@resto.com", phone: "(555) 345-6789", status: "active", hoursThisWeek: 32 },
  { id: "4", name: "Mike Johnson", role: "Bartender", email: "mike@resto.com", phone: "(555) 456-7890", status: "off", hoursThisWeek: 28 },
  { id: "5", name: "Emma Davis", role: "Host", email: "emma@resto.com", phone: "(555) 567-8901", status: "active", hoursThisWeek: 35 },
  { id: "6", name: "Carlos Rodriguez", role: "Line Cook", email: "carlos@resto.com", phone: "(555) 678-9012", status: "vacation", hoursThisWeek: 0 },
  { id: "7", name: "Lisa Park", role: "Server", email: "lisa@resto.com", phone: "(555) 789-0123", status: "active", hoursThisWeek: 30 },
  { id: "8", name: "David Kim", role: "Dishwasher", email: "david@resto.com", phone: "(555) 890-1234", status: "active", hoursThisWeek: 40 },
];

export function StaffView() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStaff = staffMembers.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in opacity-0">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage your team and schedules</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in opacity-0" style={{ animationDelay: "100ms" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in opacity-0" style={{ animationDelay: "150ms" }}>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total Staff</p>
          <p className="text-2xl font-display font-bold text-foreground">{staffMembers.length}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">On Duty</p>
          <p className="text-2xl font-display font-bold text-success">{staffMembers.filter(s => s.status === "active").length}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Off Today</p>
          <p className="text-2xl font-display font-bold text-muted-foreground">{staffMembers.filter(s => s.status === "off").length}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">On Vacation</p>
          <p className="text-2xl font-display font-bold text-warning">{staffMembers.filter(s => s.status === "vacation").length}</p>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((staff, index) => (
          <div
            key={staff.id}
            className="rounded-2xl bg-card p-5 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-fade-in opacity-0"
            style={{ animationDelay: `${200 + index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-lg font-semibold text-foreground">
                    {staff.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{staff.name}</h3>
                  <p className="text-sm text-muted-foreground">{staff.role}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{staff.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{staff.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  staff.status === "active" && "bg-success/20 text-success",
                  staff.status === "off" && "bg-muted text-muted-foreground",
                  staff.status === "vacation" && "bg-warning/20 text-warning"
                )}
              >
                {staff.status}
              </span>
              <span className="text-sm text-muted-foreground">
                {staff.hoursThisWeek}h this week
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
