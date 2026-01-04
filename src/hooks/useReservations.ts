import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { reservationSchema } from "@/lib/schemas";
import { getSafeErrorMessage } from "@/lib/errorHandler";

type Reservation = Tables<"reservations">;
type ReservationInsert = TablesInsert<"reservations">;
type ReservationUpdate = TablesUpdate<"reservations">;

export function useReservations(date?: string) {
  return useQuery({
    queryKey: ["reservations", date],
    queryFn: async () => {
      let query = supabase
        .from("reservations")
        .select("*")
        .order("reservation_date", { ascending: true })
        .order("reservation_time", { ascending: true });
      
      if (date) {
        query = query.eq("reservation_date", date);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Reservation[];
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reservation: ReservationInsert) => {
      // Validate input before sending to database
      const validation = reservationSchema.safeParse(reservation);
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError?.message || 'Invalid data provided');
      }
      
      const { data, error } = await supabase
        .from("reservations")
        .insert(reservation)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Reservation created successfully");
    },
    onError: (error) => {
      toast.error(getSafeErrorMessage(error));
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ReservationUpdate & { id: string }) => {
      // Validate input before sending to database
      const validation = reservationSchema.partial().safeParse(updates);
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError?.message || 'Invalid data provided');
      }
      
      const { data, error } = await supabase
        .from("reservations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Reservation updated successfully");
    },
    onError: (error) => {
      toast.error(getSafeErrorMessage(error));
    },
  });
}

export function useDeleteReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Reservation deleted successfully");
    },
    onError: (error) => {
      toast.error(getSafeErrorMessage(error));
    },
  });
}
