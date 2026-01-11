import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TableStatus = "available" | "occupied" | "reserved" | "cleaning";

export interface FloorTable {
  id: string;
  table_number: number;
  seats: number;
  status: TableStatus;
  created_at: string;
  updated_at: string;
}

export function useFloorTables() {
  return useQuery({
    queryKey: ["floor-tables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("floor_tables")
        .select("*")
        .order("table_number", { ascending: true });

      if (error) throw error;
      return data as FloorTable[];
    },
  });
}

export function useUpdateTableStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TableStatus }) => {
      const { data, error } = await supabase
        .from("floor_tables")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["floor-tables"] });

      // Snapshot the previous value
      const previousTables = queryClient.getQueryData<FloorTable[]>(["floor-tables"]);

      // Optimistically update to the new value
      if (previousTables) {
        queryClient.setQueryData<FloorTable[]>(
          ["floor-tables"],
          previousTables.map((table) =>
            table.id === id ? { ...table, status } : table
          )
        );
      }

      return { previousTables };
    },
    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousTables) {
        queryClient.setQueryData(["floor-tables"], context.previousTables);
      }
      toast.error("Failed to update table status");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["floor-tables"] });
    },
  });
}
