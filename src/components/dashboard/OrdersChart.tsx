import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { time: "10 AM", orders: 12 },
  { time: "11 AM", orders: 28 },
  { time: "12 PM", orders: 65 },
  { time: "1 PM", orders: 78 },
  { time: "2 PM", orders: 45 },
  { time: "3 PM", orders: 32 },
  { time: "4 PM", orders: 25 },
  { time: "5 PM", orders: 38 },
  { time: "6 PM", orders: 85 },
  { time: "7 PM", orders: 92 },
  { time: "8 PM", orders: 88 },
  { time: "9 PM", orders: 56 },
];

export function OrdersChart() {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in opacity-0" style={{ animationDelay: "350ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">Orders Today</h3>
        <span className="text-sm text-muted-foreground">
          Total: {data.reduce((acc, d) => acc + d.orders, 0)} orders
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(32, 95%, 55%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(32, 95%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 20%)" />
            <XAxis
              dataKey="time"
              stroke="hsl(220, 10%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(220, 10%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 18%, 12%)",
                border: "1px solid hsl(222, 15%, 20%)",
                borderRadius: "0.75rem",
                color: "hsl(40, 20%, 95%)",
              }}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="hsl(32, 95%, 55%)"
              strokeWidth={2}
              fill="url(#orderGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
