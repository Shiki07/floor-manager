-- Allow customers (unauthenticated users) to insert orders
CREATE POLICY "Customers can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Allow customers to insert order items
CREATE POLICY "Customers can create order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for orders table so staff can see new orders instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;