import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

type InventoryItem = Tables<"inventory_items">;
type InventoryItemInsert = TablesInsert<"inventory_items">;
type InventoryItemUpdate = TablesUpdate<"inventory_items">;

export function useInventoryItems() {
  return useQuery({
    queryKey: ["inventory_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("category", { ascending: true });
      
      if (error) throw error;
      return data as InventoryItem[];
    },
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: InventoryItemInsert) => {
      const { data, error } = await supabase
        .from("inventory_items")
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory_items"] });
      toast.success("Inventory item added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add inventory item: " + error.message);
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: InventoryItemUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("inventory_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory_items"] });
      toast.success("Inventory item updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update inventory item: " + error.message);
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory_items"] });
      toast.success("Inventory item deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete inventory item: " + error.message);
    },
  });
}
