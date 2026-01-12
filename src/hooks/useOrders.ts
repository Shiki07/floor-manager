import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getSafeErrorMessage } from "@/lib/errorHandler";

interface OrderItem {
  menu_item_id: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface CreateOrderData {
  table_number: string;
  notes?: string;
  items: OrderItem[];
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ table_number, notes, items }: CreateOrderData) => {
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Validate and sanitize notes (max 500 chars)
      const sanitizedNotes = notes?.slice(0, 500)?.trim() || undefined;
      
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({ table_number, notes: sanitizedNotes, total, status: "pending" })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items
      if (items.length > 0) {
        const orderItems = items.map(item => ({
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        }));
        
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);
        
        if (itemsError) throw itemsError;
      }
      
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order created successfully");
    },
    onError: (error) => {
      toast.error(getSafeErrorMessage(error));
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated");
    },
    onError: (error) => {
      toast.error(getSafeErrorMessage(error));
    },
  });
}
