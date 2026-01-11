-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  total NUMERIC NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for orders
CREATE POLICY "Staff can view all orders"
ON public.orders FOR SELECT
USING (is_staff_or_higher(auth.uid()));

CREATE POLICY "Staff can create orders"
ON public.orders FOR INSERT
WITH CHECK (is_staff_or_higher(auth.uid()));

CREATE POLICY "Staff can update orders"
ON public.orders FOR UPDATE
USING (is_staff_or_higher(auth.uid()));

CREATE POLICY "Managers can delete orders"
ON public.orders FOR DELETE
USING (is_manager_or_admin(auth.uid()));

-- RLS policies for order items
CREATE POLICY "Staff can view all order items"
ON public.order_items FOR SELECT
USING (is_staff_or_higher(auth.uid()));

CREATE POLICY "Staff can create order items"
ON public.order_items FOR INSERT
WITH CHECK (is_staff_or_higher(auth.uid()));

CREATE POLICY "Staff can update order items"
ON public.order_items FOR UPDATE
USING (is_staff_or_higher(auth.uid()));

CREATE POLICY "Staff can delete order items"
ON public.order_items FOR DELETE
USING (is_staff_or_higher(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();