import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Receipt, PiggyBank, Plus, Edit, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction, Transaction } from "@/hooks/useTransactions";
import { TransactionDialog } from "@/components/dialogs/TransactionDialog";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, parseISO } from "date-fns";

export function FinancesView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [defaultType, setDefaultType] = useState<"income" | "expense">("income");

  // Get transactions for the current week
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  
  const { data: transactions = [], isLoading } = useTransactions();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  // Filter transactions for current week
  const weekTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = parseISO(tx.transaction_date);
      return isWithinInterval(txDate, { start: weekStart, end: weekEnd });
    });
  }, [transactions, weekStart, weekEnd]);

  // Calculate weekly stats
  const weekRevenue = weekTransactions
    .filter(tx => tx.type === "income")
    .reduce((acc, tx) => acc + tx.amount, 0);
  
  const weekExpenses = weekTransactions
    .filter(tx => tx.type === "expense")
    .reduce((acc, tx) => acc + tx.amount, 0);
  
  const weekProfit = weekRevenue - weekExpenses;

  // Generate chart data for the week
  const chartData = useMemo(() => {
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayTransactions = transactions.filter(tx => tx.transaction_date === dayStr);
      const revenue = dayTransactions.filter(tx => tx.type === "income").reduce((acc, tx) => acc + tx.amount, 0);
      const expenses = dayTransactions.filter(tx => tx.type === "expense").reduce((acc, tx) => acc + tx.amount, 0);
      return {
        day: format(day, "EEE"),
        revenue,
        expenses,
      };
    });
  }, [transactions, weekStart, weekEnd]);

  // Calculate category breakdown for income
  const categoryData = useMemo(() => {
    const incomeTransactions = weekTransactions.filter(tx => tx.type === "income");
    const total = incomeTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    const categoryTotals: Record<string, number> = {};
    
    incomeTransactions.forEach(tx => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });

    const colors = [
      "hsl(32, 95%, 55%)",
      "hsl(142, 70%, 45%)",
      "hsl(45, 93%, 47%)",
      "hsl(200, 80%, 50%)",
      "hsl(280, 70%, 55%)",
      "hsl(350, 80%, 55%)",
    ];

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value: total > 0 ? Math.round((value / total) * 100) : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [weekTransactions]);

  // Recent transactions (last 10)
  const recentTransactions = transactions.slice(0, 10);

  const handleSubmit = (data: Partial<Transaction>) => {
    if (selectedTransaction) {
      updateTransaction.mutate({ id: selectedTransaction.id, ...data } as any, {
        onSuccess: () => {
          setDialogOpen(false);
          setSelectedTransaction(null);
        },
      });
    } else {
      createTransaction.mutate(data as any, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    }
  };

  const handleDelete = () => {
    if (selectedTransaction) {
      deleteTransaction.mutate(selectedTransaction.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedTransaction(null);
        },
      });
    }
  };

  const openAddPayment = () => {
    setSelectedTransaction(null);
    setDefaultType("income");
    setDialogOpen(true);
  };

  const openAddExpense = () => {
    setSelectedTransaction(null);
    setDefaultType("expense");
    setDialogOpen(true);
  };

  const openEditDialog = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setDefaultType(tx.type);
    setDialogOpen(true);
  };

  const openDeleteDialog = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in opacity-0">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Finances</h1>
          <p className="text-muted-foreground mt-1">Track revenue, expenses, and profitability</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={openAddExpense}>
            <TrendingDown className="h-4 w-4" />
            Add Expense
          </Button>
          <Button className="gap-2" onClick={openAddPayment}>
            <Plus className="h-4 w-4" />
            Add Payment
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Weekly Revenue</p>
              <p className="text-2xl font-display font-bold text-foreground">${weekRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {weekTransactions.filter(tx => tx.type === "income").length} payments
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Weekly Expenses</p>
              <p className="text-2xl font-display font-bold text-foreground">${weekExpenses.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {weekTransactions.filter(tx => tx.type === "expense").length} expenses
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-destructive/20 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={cn(
                "text-2xl font-display font-bold",
                weekProfit >= 0 ? "text-primary" : "text-destructive"
              )}>
                {weekProfit >= 0 ? "" : "-"}${Math.abs(weekProfit).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {weekRevenue > 0 ? ((weekProfit / weekRevenue) * 100).toFixed(1) : 0}% margin
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <PiggyBank className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "250ms" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-display font-bold text-foreground">{transactions.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                All time
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "300ms" }}>
          <h3 className="font-display text-lg font-semibold text-foreground mb-6">Revenue vs Expenses (This Week)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 20%)" />
                <XAxis dataKey="day" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 18%, 12%)",
                    border: "1px solid hsl(222, 15%, 20%)",
                    borderRadius: "0.75rem",
                    color: "hsl(40, 20%, 95%)",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                />
                <Bar dataKey="revenue" fill="hsl(32, 95%, 55%)" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="hsl(222, 15%, 30%)" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "350ms" }}>
          <h3 className="font-display text-lg font-semibold text-foreground mb-6">Revenue by Category</h3>
          {categoryData.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 18%, 12%)",
                        border: "1px solid hsl(222, 15%, 20%)",
                        borderRadius: "0.75rem",
                        color: "hsl(40, 20%, 95%)",
                      }}
                      formatter={(value: number) => [`${value}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              No income data for this week
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "400ms" }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Recent Transactions</h3>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transactions yet. Add your first payment or expense!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx, index) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors animate-fade-in opacity-0"
                style={{ animationDelay: `${450 + index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      tx.type === "income" ? "bg-success/20" : "bg-destructive/20"
                    )}
                  >
                    {tx.type === "income" ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {tx.category} • {format(parseISO(tx.transaction_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "font-display font-bold",
                      tx.type === "income" ? "text-success" : "text-destructive"
                    )}
                  >
                    {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditDialog(tx)}
                      className="p-2 hover:bg-background rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(tx)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={selectedTransaction}
        defaultType={defaultType}
        onSubmit={handleSubmit}
        isLoading={createTransaction.isPending || updateTransaction.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Transaction"
        description={`Are you sure you want to delete "${selectedTransaction?.description}"? This action cannot be undone.`}
        isLoading={deleteTransaction.isPending}
      />
    </div>
  );
}
