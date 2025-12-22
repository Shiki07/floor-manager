import { DollarSign, TrendingUp, TrendingDown, CreditCard, Receipt, PiggyBank } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";

const revenueData = [
  { day: "Mon", revenue: 4200, expenses: 1800 },
  { day: "Tue", revenue: 3800, expenses: 1600 },
  { day: "Wed", revenue: 5100, expenses: 2100 },
  { day: "Thu", revenue: 4600, expenses: 1900 },
  { day: "Fri", revenue: 6800, expenses: 2400 },
  { day: "Sat", revenue: 8200, expenses: 2800 },
  { day: "Sun", revenue: 7100, expenses: 2500 },
];

const categoryData = [
  { name: "Food Sales", value: 65, color: "hsl(32, 95%, 55%)" },
  { name: "Beverages", value: 20, color: "hsl(142, 70%, 45%)" },
  { name: "Catering", value: 10, color: "hsl(45, 93%, 47%)" },
  { name: "Events", value: 5, color: "hsl(200, 80%, 50%)" },
];

const transactions = [
  { id: "1", description: "Dinner service", amount: 2840, type: "income", time: "9:45 PM" },
  { id: "2", description: "Wine order - Vineyard Select", amount: -680, type: "expense", time: "4:30 PM" },
  { id: "3", description: "Lunch service", amount: 1520, type: "income", time: "2:15 PM" },
  { id: "4", description: "Produce delivery - Green Valley", amount: -420, type: "expense", time: "10:00 AM" },
  { id: "5", description: "Catering deposit", amount: 1200, type: "income", time: "Yesterday" },
  { id: "6", description: "Staff payroll", amount: -3200, type: "expense", time: "Yesterday" },
];

export function FinancesView() {
  const weekRevenue = revenueData.reduce((acc, d) => acc + d.revenue, 0);
  const weekExpenses = revenueData.reduce((acc, d) => acc + d.expenses, 0);
  const weekProfit = weekRevenue - weekExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in opacity-0">
        <h1 className="font-display text-3xl font-bold text-foreground">Finances</h1>
        <p className="text-muted-foreground mt-1">Track revenue, expenses, and profitability</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Weekly Revenue</p>
              <p className="text-2xl font-display font-bold text-foreground">${weekRevenue.toLocaleString()}</p>
              <p className="text-sm text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4" />
                +12.5% vs last week
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
              <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                <TrendingDown className="h-4 w-4" />
                +5.2% vs last week
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
              <p className="text-2xl font-display font-bold text-primary">${weekProfit.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {((weekProfit / weekRevenue) * 100).toFixed(1)}% margin
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
              <p className="text-2xl font-display font-bold text-foreground">$42.80</p>
              <p className="text-sm text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4" />
                +$3.20 vs last week
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
              <BarChart data={revenueData}>
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
                  formatter={(value: number) => [`$${value}`, ""]}
                />
                <Bar dataKey="revenue" fill="hsl(32, 95%, 55%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="hsl(222, 15%, 30%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "350ms" }}>
          <h3 className="font-display text-lg font-semibold text-foreground mb-6">Revenue by Category</h3>
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
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "400ms" }}>
        <h3 className="font-display text-lg font-semibold text-foreground mb-6">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.map((tx, index) => (
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
                  <p className="text-sm text-muted-foreground">{tx.time}</p>
                </div>
              </div>
              <span
                className={cn(
                  "font-display font-bold",
                  tx.type === "income" ? "text-success" : "text-destructive"
                )}
              >
                {tx.type === "income" ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
