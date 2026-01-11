-- Create table for floor plan tables
CREATE TABLE public.floor_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number integer NOT NULL UNIQUE,
  seats integer NOT NULL DEFAULT 4,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.floor_tables ENABLE ROW LEVEL SECURITY;

-- Staff can view all tables
CREATE POLICY "Staff can view tables"
ON public.floor_tables
FOR SELECT
USING (is_staff_or_higher(auth.uid()));

-- Staff can update table status
CREATE POLICY "Staff can update tables"
ON public.floor_tables
FOR UPDATE
USING (is_staff_or_higher(auth.uid()));

-- Managers can manage tables (insert/delete)
CREATE POLICY "Managers can manage tables"
ON public.floor_tables
FOR ALL
USING (is_manager_or_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_floor_tables_updated_at
BEFORE UPDATE ON public.floor_tables
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default tables
INSERT INTO public.floor_tables (table_number, seats, status) VALUES
  (1, 2, 'available'),
  (2, 2, 'occupied'),
  (3, 4, 'occupied'),
  (4, 4, 'available'),
  (5, 6, 'reserved'),
  (6, 4, 'occupied'),
  (7, 2, 'cleaning'),
  (8, 8, 'occupied'),
  (9, 4, 'available'),
  (10, 2, 'occupied'),
  (11, 6, 'reserved'),
  (12, 4, 'available');