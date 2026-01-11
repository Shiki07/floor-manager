import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transaction } from "@/hooks/useTransactions";
import { cn } from "@/lib/utils";
import { Coffee, Sun, Moon, UtensilsCrossed, ChevronDown, ChevronUp } from "lucide-react";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  defaultType?: "income" | "expense";
  onSubmit: (data: Partial<Transaction>) => void;
  isLoading?: boolean;
}

const incomeCategories = ["Food Sales", "Beverages", "Catering", "Events", "Tips", "Other Income"];
const expenseCategories = ["Inventory", "Payroll", "Rent", "Utilities", "Equipment", "Marketing", "Maintenance", "Supplies", "Other Expense"];
const paymentMethods = ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Check", "Mixed", "Other"];

const mealPresets = [
  { id: "breakfast", label: "Breakfast", icon: Coffee, description: "Breakfast check" },
  { id: "lunch", label: "Lunch", icon: Sun, description: "Lunch check" },
  { id: "dinner", label: "Dinner", icon: Moon, description: "Dinner check" },
  { id: "custom", label: "Custom", icon: UtensilsCrossed, description: "" },
];

export function TransactionDialog({ 
  open, 
  onOpenChange, 
  transaction, 
  defaultType = "income",
  onSubmit, 
  isLoading 
}: TransactionDialogProps) {
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    type: defaultType as "income" | "expense",
    category: "",
    description: "",
    amount: 0,
    transaction_date: new Date().toISOString().split("T")[0],
    payment_method: "",
    reference_number: "",
    notes: "",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount,
        transaction_date: transaction.transaction_date,
        payment_method: transaction.payment_method || "",
        reference_number: transaction.reference_number || "",
        notes: transaction.notes || "",
      });
      setSelectedMeal(null);
      setTableNumber("");
      setShowAdvanced(true);
    } else {
      setFormData({
        type: defaultType,
        category: defaultType === "income" ? "Food Sales" : "",
        description: "",
        amount: 0,
        transaction_date: new Date().toISOString().split("T")[0],
        payment_method: "",
        reference_number: "",
        notes: "",
      });
      setSelectedMeal(defaultType === "income" ? null : null);
      setTableNumber("");
      setShowAdvanced(defaultType === "expense");
    }
  }, [transaction, open, defaultType]);

  const handleMealSelect = (mealId: string) => {
    setSelectedMeal(mealId);
    if (mealId !== "custom") {
      const preset = mealPresets.find(m => m.id === mealId);
      if (preset) {
        const desc = tableNumber 
          ? `${preset.description} - Table ${tableNumber}` 
          : preset.description;
        setFormData(prev => ({
          ...prev,
          category: "Food Sales",
          description: desc,
        }));
      }
    }
  };

  const handleTableChange = (value: string) => {
    setTableNumber(value);
    if (selectedMeal && selectedMeal !== "custom") {
      const preset = mealPresets.find(m => m.id === selectedMeal);
      if (preset) {
        const desc = value 
          ? `${preset.description} - Table ${value}` 
          : preset.description;
        setFormData(prev => ({
          ...prev,
          description: desc,
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const categories = formData.type === "income" ? incomeCategories : expenseCategories;
  const isQuickMode = formData.type === "income" && !transaction;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Edit Transaction" : formData.type === "income" ? "Add Payment" : "Add Expense"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Meal Check Section - Only for new income */}
          {isQuickMode && (
            <div className="space-y-3">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">Quick Meal Check</Label>
              <div className="grid grid-cols-4 gap-2">
                {mealPresets.map((meal) => {
                  const Icon = meal.icon;
                  return (
                    <button
                      key={meal.id}
                      type="button"
                      onClick={() => handleMealSelect(meal.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                        selectedMeal === meal.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-secondary"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{meal.label}</span>
                    </button>
                  );
                })}
              </div>

              {selectedMeal && selectedMeal !== "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="table_number">Table #</Label>
                    <Input
                      id="table_number"
                      value={tableNumber}
                      onChange={(e) => handleTableChange(e.target.value)}
                      placeholder="e.g. 5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quick_amount">Amount ($)</Label>
                    <Input
                      id="quick_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount || ""}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {selectedMeal && selectedMeal !== "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="quick_payment_method">Payment Method</Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedMeal && selectedMeal !== "custom" && (
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showAdvanced ? "Hide" : "Show"} more options
                </button>
              )}

              {(selectedMeal === "custom" || !selectedMeal) && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  Select a meal type above or fill in the details below
                </div>
              )}
            </div>
          )}

          {/* Full Form - Show always for expense, edit, or when advanced/custom */}
          {(formData.type === "expense" || transaction || showAdvanced || selectedMeal === "custom" || !selectedMeal) && (
            <>
              {isQuickMode && selectedMeal && selectedMeal !== "custom" && (
                <div className="border-t border-border pt-4" />
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: "income" | "expense") => {
                      setFormData({ ...formData, type: value, category: "" });
                      if (value === "expense") {
                        setSelectedMeal(null);
                        setShowAdvanced(true);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income / Payment</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Dinner service, Produce delivery"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount || ""}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction_date">Date</Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference_number">Reference #</Label>
                  <Input
                    id="reference_number"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details..."
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || formData.amount <= 0}>
              {isLoading ? "Saving..." : transaction ? "Update" : "Add Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
