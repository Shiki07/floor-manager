import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { staffMemberSchema } from "@/lib/schemas";
import { getSafeErrorMessage } from "@/lib/errorHandler";

type StaffMember = Tables<"staff_members">;
type StaffMemberInsert = TablesInsert<"staff_members">;
type StaffMemberUpdate = TablesUpdate<"staff_members">;

export function useStaffMembers() {
  return useQuery({
    queryKey: ["staff_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_members")
        .select("*")
        .order("full_name");
      
      if (error) throw error;
      return data as StaffMember[];
    },
  });
}

export function useCreateStaffMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (staffMember: StaffMemberInsert) => {
      // Validate input before sending to database
      const validation = staffMemberSchema.safeParse(staffMember);
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError?.message || 'Invalid data provided');
      }
      
      const { data, error } = await supabase
        .from("staff_members")
        .insert(staffMember)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_members"] });
      toast.success("Staff member added successfully");
    },
    onError: (error) => {
      toast.error(getSafeErrorMessage(error));
    },
  });
}

export function useUpdateStaffMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: StaffMemberUpdate & { id: string }) => {
      // Validate input before sending to database
      const validation = staffMemberSchema.partial().safeParse(updates);
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError?.message || 'Invalid data provided');
      }
      
      const { data, error } = await supabase
        .from("staff_members")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_members"] });
      toast.success("Staff member updated successfully");
    },
    onError: (error) => {
      toast.error(getSafeErrorMessage(error));
    },
  });
}

export function useDeleteStaffMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("staff_members")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_members"] });
      toast.success("Staff member deleted successfully");
    },
    onError: (error) => {
      toast.error(getSafeErrorMessage(error));
    },
  });
}
