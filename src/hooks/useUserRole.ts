import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  return useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.role || null;
    },
  });
}

export function useIsManager() {
  const { data: role, isLoading } = useUserRole();
  return {
    isManager: role === "manager" || role === "admin",
    isAdmin: role === "admin",
    role,
    isLoading,
  };
}
