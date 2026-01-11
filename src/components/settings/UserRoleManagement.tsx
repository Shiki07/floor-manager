import { useState } from "react";
import { useUsersWithRoles, useUpdateUserRole, AppRole } from "@/hooks/useUsersWithRoles";
import { useIsManager } from "@/hooks/useUserRole";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, ShieldAlert, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

const roleConfig: Record<AppRole, { label: string; color: string; icon: typeof Shield }> = {
  staff: { label: "Staff", color: "bg-blue-500/20 text-blue-500", icon: User },
  manager: { label: "Manager", color: "bg-warning/20 text-warning", icon: ShieldCheck },
  admin: { label: "Admin", color: "bg-destructive/20 text-destructive", icon: ShieldAlert },
};

export function UserRoleManagement() {
  const { data: users = [], isLoading } = useUsersWithRoles();
  const updateRole = useUpdateUserRole();
  const { isAdmin, isLoading: roleLoading } = useIsManager();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  if (isLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium text-foreground mb-2">Admin Access Required</h3>
        <p className="text-sm text-muted-foreground">
          Only administrators can manage user roles. Contact an admin for assistance.
        </p>
      </div>
    );
  }

  const handleRoleChange = async (userId: string, newRole: string, existingRoleId: string | null) => {
    const role = newRole === "none" ? null : (newRole as AppRole);
    await updateRole.mutateAsync({ userId, newRole: role, existingRoleId });
    setEditingUserId(null);
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || "??";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-medium text-foreground">Team Members</h3>
          <p className="text-sm text-muted-foreground">{users.length} users in the system</p>
        </div>
      </div>

      <div className="space-y-3">
        {users.map((user, index) => {
          const RoleIcon = user.role ? roleConfig[user.role].icon : User;
          
          return (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 animate-fade-in"
              style={{ animationDelay: `${100 + index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user.full_name, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{user.full_name || "Unnamed User"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {editingUserId === user.id ? (
                  <div className="flex items-center gap-2">
                    <Select
                      defaultValue={user.role || "none"}
                      onValueChange={(value) => handleRoleChange(user.id, value, user.role_id)}
                      disabled={updateRole.isPending}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Role</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUserId(null)}
                      disabled={updateRole.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    {user.role ? (
                      <Badge
                        variant="secondary"
                        className={cn("gap-1.5", roleConfig[user.role].color)}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {roleConfig[user.role].label}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        No Role
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUserId(user.id)}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No users found in the system.</p>
          </div>
        )}
      </div>
    </div>
  );
}
