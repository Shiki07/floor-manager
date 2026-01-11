import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AppRole = "staff" | "manager" | "admin";

export interface UserWithRole {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: AppRole | null;
  role_id: string | null;
}

export function useUsersWithRoles() {
  return useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .order("full_name", { ascending: true });

      if (profilesError) throw profilesError;

      // Then get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role");

      if (rolesError) throw rolesError;

      // Combine the data
      const usersWithRoles: UserWithRole[] = profiles.map((profile) => {
        const userRole = roles.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          role: userRole?.role as AppRole | null,
          role_id: userRole?.id || null,
        };
      });

      return usersWithRoles;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      newRole, 
      existingRoleId 
    }: { 
      userId: string; 
      newRole: AppRole | null; 
      existingRoleId: string | null;
    }) => {
      if (newRole === null && existingRoleId) {
        // Remove role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("id", existingRoleId);
        if (error) throw error;
      } else if (newRole && existingRoleId) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("id", existingRoleId);
        if (error) throw error;
      } else if (newRole && !existingRoleId) {
        // Create new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      queryClient.invalidateQueries({ queryKey: ["user-role"] });
      toast.success("User role updated successfully");
    },
    onError: (error: Error) => {
      if (error.message.includes("row-level security")) {
        toast.error("Only admins can manage user roles");
      } else {
        toast.error("Failed to update user role");
      }
    },
  });
}
