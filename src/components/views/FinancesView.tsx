import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Receipt, PiggyBank, Plus, Edit, Trash2, Download, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction, Transaction } from "@/hooks/useTransactions";
import { TransactionDialog } from "@/components/dialogs/TransactionDialog";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, isWithinInterval, parseISO, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";

type DateRangePreset = "today" | "week" | "month" | "year" | "custom";

export function FinancesView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [defaultType, setDefaultType] = useState<"income" | "expense">("income");
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("week");
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Calculate date range based on preset
  const dateRange = useMemo(() => {
    const today = new Date();
    switch (dateRangePreset) {
      case "today":
        return { start: today, end: today };
      case "week":
        return { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
      case "month":
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case "year":
        return { start: startOfYear(today), end: endOfYear(today) };
      case "custom":
        return {
          start: customDateRange.from || today,
          end: customDateRange.to || today,
        };
      default:
        return { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
    }
  }, [dateRangePreset, customDateRange]);

  const { data: transactions = [], isLoading } = useTransactions();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  // Filter transactions for selected date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = parseISO(tx.transaction_date);
      return isWithinInterval(txDate, { start: dateRange.start, end: dateRange.end });
    });
  }, [transactions, dateRange]);

  // Calculate stats for selected period
  const periodRevenue = filteredTransactions
    .filter(tx => tx.type === "income")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const periodExpenses = filteredTransactions
    .filter(tx => tx.type === "expense")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const periodProfit = periodRevenue - periodExpenses;

  // Generate chart data based on date range
  const chartData = useMemo(() => {
    const daysDiff = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 7) {
      // Daily breakdown for week or less
      const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
      return days.map(day => {
        const dayStr = format(day, "yyyy-MM-dd");
        const dayTransactions = transactions.filter(tx => tx.transaction_date === dayStr);
        const revenue = dayTransactions.filter(tx => tx.type === "income").reduce((acc, tx) => acc + tx.amount, 0);
        const expenses = dayTransactions.filter(tx => tx.type === "expense").reduce((acc, tx) => acc + tx.amount, 0);
        return {
          label: format(day, "EEE"),
          revenue,
          expenses,
        };
      });
    } else if (daysDiff <= 31) {
      // Weekly breakdown for month
      const weeks = eachWeekOfInterval({ start: dateRange.start, end: dateRange.end }, { weekStartsOn: 1 });
      return weeks.map((weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const weekTransactions = transactions.filter(tx => {
          const txDate = parseISO(tx.transaction_date);
          return isWithinInterval(txDate, { start: weekStart, end: weekEnd });
        });
        const revenue = weekTransactions.filter(tx => tx.type === "income").reduce((acc, tx) => acc + tx.amount, 0);
        const expenses = weekTransactions.filter(tx => tx.type === "expense").reduce((acc, tx) => acc + tx.amount, 0);
        return {
          label: `W${index + 1}`,
          revenue,
          expenses,
        };
      });
    } else {
      // Monthly breakdown for year
      const months = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
      return months.map(month => {
        const monthEnd = endOfMonth(month);
        const monthTransactions = transactions.filter(tx => {
          const txDate = parseISO(tx.transaction_date);
          return isWithinInterval(txDate, { start: month, end: monthEnd });
        });
        const revenue = monthTransactions.filter(tx => tx.type === "income").reduce((acc, tx) => acc + tx.amount, 0);
        const expenses = monthTransactions.filter(tx => tx.type === "expense").reduce((acc, tx) => acc + tx.amount, 0);
        return {
          label: format(month, "MMM"),
          revenue,
          expenses,
        };
      });
    }
  }, [transactions, dateRange]);

  // Calculate category breakdown for income
  const categoryData = useMemo(() => {
    const incomeTransactions = filteredTransactions.filter(tx => tx.type === "income");
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
        amount: value,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Export functions
  const exportToCSV = () => {
    const headers = ["Date", "Type", "Category", "Description", "Amount", "Payment Method", "Reference", "Notes"];
    const rows = filteredTransactions.map(tx => [
      tx.transaction_date,
      tx.type,
      tx.category,
      tx.description,
      tx.type === "expense" ? -tx.amount : tx.amount,
      tx.payment_method || "",
      tx.reference_number || "",
      tx.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `financial-report-${format(dateRange.start, "yyyy-MM-dd")}-to-${format(dateRange.end, "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    // Create a printable HTML document
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const totalIncome = filteredTransactions.filter(tx => tx.type === "income").reduce((acc, tx) => acc + tx.amount, 0);
    const totalExpenses = filteredTransactions.filter(tx => tx.type === "expense").reduce((acc, tx) => acc + tx.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #e5a855; padding-bottom: 10px; }
          h2 { color: #444; margin-top: 30px; }
          .summary { display: flex; gap: 40px; margin: 20px 0; }
          .summary-item { padding: 15px 25px; background: #f5f5f5; border-radius: 8px; }
          .summary-item h3 { margin: 0 0 5px 0; font-size: 14px; color: #666; }
          .summary-item p { margin: 0; font-size: 24px; font-weight: bold; }
          .income { color: #22c55e; }
          .expense { color: #ef4444; }
          .profit { color: #e5a855; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f5f5f5; font-weight: 600; }
          .amount-income { color: #22c55e; }
          .amount-expense { color: #ef4444; }
          .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Financial Report</h1>
        <p><strong>Period:</strong> ${format(dateRange.start, "MMMM d, yyyy")} - ${format(dateRange.end, "MMMM d, yyyy")}</p>
        
        <div class="summary">
          <div class="summary-item">
            <h3>Total Income</h3>
            <p class="income">$${totalIncome.toLocaleString()}</p>
          </div>
          <div class="summary-item">
            <h3>Total Expenses</h3>
            <p class="expense">$${totalExpenses.toLocaleString()}</p>
          </div>
          <div class="summary-item">
            <h3>Net Profit</h3>
            <p class="${netProfit >= 0 ? 'profit' : 'expense'}">${netProfit >= 0 ? '' : '-'}$${Math.abs(netProfit).toLocaleString()}</p>
          </div>
        </div>

        <h2>Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions.map(tx => `
              <tr>
                <td>${format(parseISO(tx.transaction_date), "MMM d, yyyy")}</td>
                <td>${tx.type === "income" ? "Income" : "Expense"}</td>
                <td>${tx.category}</td>
                <td>${tx.description}</td>
                <td class="amount-${tx.type}">${tx.type === "income" ? "+" : "-"}$${tx.amount.toLocaleString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="footer">
          Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

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

  const getDateRangeLabel = () => {
    switch (dateRangePreset) {
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      case "custom":
        if (customDateRange.from && customDateRange.to) {
          return `${format(customDateRange.from, "MMM d")} - ${format(customDateRange.to, "MMM d, yyyy")}`;
        }
        return "Custom Range";
      default:
        return "This Week";
    }
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
        <div className="flex flex-wrap gap-3">
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

      {/* Date Range & Export Controls */}
      <div className="flex flex-wrap items-center gap-3 animate-fade-in opacity-0" style={{ animationDelay: "50ms" }}>
        <Select value={dateRangePreset} onValueChange={(value: DateRangePreset) => setDateRangePreset(value)}>
          <SelectTrigger className="w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {dateRangePreset === "custom" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                {customDateRange.from && customDateRange.to
                  ? `${format(customDateRange.from, "MMM d")} - ${format(customDateRange.to, "MMM d")}`
                  : "Pick dates"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={{ from: customDateRange.from, to: customDateRange.to }}
                onSelect={(range) => setCustomDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}

        <div className="flex-1" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="end">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={exportToCSV}>
                Export as CSV
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={exportToPDF}>
                Export as PDF
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Period Label */}
      <div className="text-sm text-muted-foreground animate-fade-in opacity-0" style={{ animationDelay: "75ms" }}>
        Showing data for: <span className="font-medium text-foreground">{getDateRangeLabel()}</span>
        {" "}({filteredTransactions.length} transactions)
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-display font-bold text-foreground">${periodRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredTransactions.filter(tx => tx.type === "income").length} payments
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
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="text-2xl font-display font-bold text-foreground">${periodExpenses.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredTransactions.filter(tx => tx.type === "expense").length} expenses
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
                periodProfit >= 0 ? "text-primary" : "text-destructive"
              )}>
                {periodProfit >= 0 ? "" : "-"}${Math.abs(periodProfit).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {periodRevenue > 0 ? ((periodProfit / periodRevenue) * 100).toFixed(1) : 0}% margin
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
              <p className="text-sm text-muted-foreground">Avg Transaction</p>
              <p className="text-2xl font-display font-bold text-foreground">
                ${filteredTransactions.length > 0
                  ? Math.round((periodRevenue + periodExpenses) / filteredTransactions.length).toLocaleString()
                  : 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Per transaction
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
          <h3 className="font-display text-lg font-semibold text-foreground mb-6">Revenue vs Expenses</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 20%)" />
                <XAxis dataKey="label" stroke="hsl(220, 10%, 55%)" fontSize={12} />
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
                      formatter={(value: number, name: string, props: any) => [
                        `${value}% ($${props.payload.amount.toLocaleString()})`,
                        ""
                      ]}
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
              No income data for this period
            </div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "400ms" }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Transactions</h3>
        </div>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transactions for this period.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {filteredTransactions.map((tx, index) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors animate-fade-in opacity-0"
                style={{ animationDelay: `${450 + index * 30}ms` }}
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
                      {tx.payment_method && ` • ${tx.payment_method}`}
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
