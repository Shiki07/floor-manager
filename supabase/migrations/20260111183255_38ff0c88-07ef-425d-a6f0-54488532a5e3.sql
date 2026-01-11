-- Create transactions table for payments and expenses
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for staff access
CREATE POLICY "Staff can view all transactions" 
ON public.transactions 
FOR SELECT 
USING (is_staff_or_higher(auth.uid()));

CREATE POLICY "Staff can create transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (is_staff_or_higher(auth.uid()));

CREATE POLICY "Managers can update transactions" 
ON public.transactions 
FOR UPDATE 
USING (is_manager_or_admin(auth.uid()));

CREATE POLICY "Managers can delete transactions" 
ON public.transactions 
FOR DELETE 
USING (is_manager_or_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();