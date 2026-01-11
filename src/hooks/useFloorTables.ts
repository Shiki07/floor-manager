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
      await queryClient.cancelQueries({ queryKey: ["floor-tables"] });
      const previousTables = queryClient.getQueryData<FloorTable[]>(["floor-tables"]);

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

export function useCreateFloorTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ table_number, seats }: { table_number: number; seats: number }) => {
      const { data, error } = await supabase
        .from("floor_tables")
        .insert({ table_number, seats, status: "available" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floor-tables"] });
      toast.success("Table added successfully");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.error("A table with this number already exists");
      } else {
        toast.error("Failed to add table");
      }
    },
  });
}

export function useUpdateFloorTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, seats, table_number }: { id: string; seats: number; table_number: number }) => {
      const { data, error } = await supabase
        .from("floor_tables")
        .update({ seats, table_number })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floor-tables"] });
      toast.success("Table updated successfully");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.error("A table with this number already exists");
      } else {
        toast.error("Failed to update table");
      }
    },
  });
}

export function useDeleteFloorTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("floor_tables")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floor-tables"] });
      toast.success("Table removed successfully");
    },
    onError: () => {
      toast.error("Failed to remove table");
    },
  });
}
