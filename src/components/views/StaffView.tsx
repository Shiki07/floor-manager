import { useState } from "react";
import { Plus, Search, Filter, MoreVertical, Mail, Phone, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStaffMembers, useCreateStaffMember, useUpdateStaffMember, useDeleteStaffMember } from "@/hooks/useStaffMembers";
import { StaffDialog } from "@/components/dialogs/StaffDialog";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { Tables } from "@/integrations/supabase/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

type StaffMember = Tables<"staff_members">;

export function StaffView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const { data: staffMembers = [], isLoading } = useStaffMembers();
  const createStaff = useCreateStaffMember();
  const updateStaff = useUpdateStaffMember();
  const deleteStaff = useDeleteStaffMember();

  const filteredStaff = staffMembers.filter(
    (staff) =>
      staff.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (data: Partial<StaffMember>) => {
    if (selectedStaff) {
      updateStaff.mutate({ id: selectedStaff.id, ...data }, {
        onSuccess: () => {
          setDialogOpen(false);
          setSelectedStaff(null);
        }
      });
    } else {
      createStaff.mutate(data as any, {
        onSuccess: () => {
          setDialogOpen(false);
        }
      });
    }
  };

  const handleDelete = () => {
    if (selectedStaff) {
      deleteStaff.mutate(selectedStaff.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedStaff(null);
        }
      });
    }
  };

  const openEditDialog = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setDialogOpen(true);
  };

  const openDeleteDialog = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setDeleteDialogOpen(true);
  };

  const stats = {
    total: staffMembers.length,
    active: staffMembers.filter(s => s.status === "active").length,
    off: staffMembers.filter(s => s.status === "off").length,
    vacation: staffMembers.filter(s => s.status === "vacation").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in opacity-0">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage your team and schedules</p>
        </div>
        <Button className="gap-2" onClick={() => { setSelectedStaff(null); setDialogOpen(true); }}>
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
          <p className="text-2xl font-display font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">On Duty</p>
          <p className="text-2xl font-display font-bold text-success">{stats.active}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Off Today</p>
          <p className="text-2xl font-display font-bold text-muted-foreground">{stats.off}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">On Vacation</p>
          <p className="text-2xl font-display font-bold text-warning">{stats.vacation}</p>
        </div>
      </div>

      {/* Staff Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? "No staff members match your search." : "No staff members yet. Add your first employee!"}
        </div>
      ) : (
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
                      {staff.full_name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{staff.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{staff.role}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(staff)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openDeleteDialog(staff)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{staff.email}</span>
                </div>
                {staff.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{staff.phone}</span>
                  </div>
                )}
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
              </div>
            </div>
          ))}
        </div>
      )}

      <StaffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        staff={selectedStaff}
        onSubmit={handleSubmit}
        isLoading={createStaff.isPending || updateStaff.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        description={`Are you sure you want to delete ${selectedStaff?.full_name}? This action cannot be undone.`}
        isLoading={deleteStaff.isPending}
      />
    </div>
  );
}
