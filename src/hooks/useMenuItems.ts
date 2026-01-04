import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { menuItemSchema } from "@/lib/schemas";
import { getSafeErrorMessage } from "@/lib/errorHandler";

type MenuItem = Tables<"menu_items">;
type MenuItemInsert = TablesInsert<"menu_items">;
type MenuItemUpdate = TablesUpdate<"menu_items">;

export function useMenuItems() {
  return useQuery({
    queryKey: ["menu_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("category", { ascending: true });
      
      if (error) throw error;
      return data as MenuItem[];
    },
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (menuItem: MenuItemInsert) => {
      // Validate input before sending to database
      const validation = menuItemSchema.safeParse(menuItem);
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError?.message || 'Invalid data provided');
      }
      
      const { data, error } = await supabase
        .from("menu_items")
        .insert(menuItem)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu_items"] });
      toast.success("Menu item added successfully");
    },
    onError: (error) => {
      toast.error(getSafeErrorMessage(error));
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: MenuItemUpdate & { id: string }) => {
      // Validate input before sending to database
      const validation = menuItemSchema.partial().safeParse(updates);
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError?.message || 'Invalid data provided');
      }
      
      const { data, error } = await supabase
        .from("menu_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu_items"] });
      toast.success("Menu item updated successfully");
    },
    onError: (error) => {
      toast.error(getSafeErrorMessage(error));
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu_items"] });
      toast.success("Menu item deleted successfully");
    },
    onError: (error) => {
      toast.error(getSafeErrorMessage(error));
    },
  });
}
