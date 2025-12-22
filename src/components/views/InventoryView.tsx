import { useState } from "react";
import { Plus, Search, Filter, AlertTriangle, TrendingDown, Package, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current: number;
  minimum: number;
  maximum: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  lastOrdered: string;
}

const categories = ["All", "Proteins", "Produce", "Dairy", "Dry Goods", "Beverages", "Supplies"];

const inventoryItems: InventoryItem[] = [
  { id: "1", name: "Salmon Fillet", category: "Proteins", current: 5, minimum: 15, maximum: 40, unit: "lbs", costPerUnit: 18.99, supplier: "Ocean Fresh", lastOrdered: "2024-01-10" },
  { id: "2", name: "Ribeye Steak", category: "Proteins", current: 25, minimum: 20, maximum: 50, unit: "lbs", costPerUnit: 24.99, supplier: "Prime Meats", lastOrdered: "2024-01-12" },
  { id: "3", name: "Fresh Basil", category: "Produce", current: 12, minimum: 25, maximum: 50, unit: "bunches", costPerUnit: 2.50, supplier: "Green Valley", lastOrdered: "2024-01-14" },
  { id: "4", name: "Heavy Cream", category: "Dairy", current: 8, minimum: 10, maximum: 25, unit: "quarts", costPerUnit: 4.99, supplier: "Dairy Direct", lastOrdered: "2024-01-13" },
  { id: "5", name: "Olive Oil", category: "Dry Goods", current: 6, minimum: 10, maximum: 20, unit: "liters", costPerUnit: 15.99, supplier: "Mediterranean Imports", lastOrdered: "2024-01-08" },
  { id: "6", name: "House Red Wine", category: "Beverages", current: 8, minimum: 20, maximum: 50, unit: "bottles", costPerUnit: 12.99, supplier: "Vineyard Select", lastOrdered: "2024-01-11" },
  { id: "7", name: "Arborio Rice", category: "Dry Goods", current: 30, minimum: 15, maximum: 40, unit: "lbs", costPerUnit: 3.99, supplier: "Italian Imports", lastOrdered: "2024-01-09" },
  { id: "8", name: "Parmesan Cheese", category: "Dairy", current: 15, minimum: 10, maximum: 30, unit: "lbs", costPerUnit: 22.99, supplier: "Italian Imports", lastOrdered: "2024-01-12" },
  { id: "9", name: "Cocktail Napkins", category: "Supplies", current: 500, minimum: 200, maximum: 1000, unit: "pcs", costPerUnit: 0.05, supplier: "Restaurant Supply Co", lastOrdered: "2024-01-05" },
  { id: "10", name: "Tomatoes", category: "Produce", current: 40, minimum: 30, maximum: 80, unit: "lbs", costPerUnit: 2.99, supplier: "Green Valley", lastOrdered: "2024-01-14" },
];

export function InventoryView() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = inventoryItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const lowStockItems = inventoryItems.filter(i => i.current < i.minimum);
  const totalValue = inventoryItems.reduce((acc, i) => acc + (i.current * i.costPerUnit), 0);

  const getStockStatus = (current: number, minimum: number, maximum: number) => {
    const percentage = (current / minimum) * 100;
    if (percentage < 50) return "critical";
    if (percentage < 100) return "low";
    return "good";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in opacity-0">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground mt-1">Track stock levels and manage orders</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Create Order
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in opacity-0" style={{ animationDelay: "100ms" }}>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total Items</p>
          <p className="text-2xl font-display font-bold text-foreground">{inventoryItems.length}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Low Stock</p>
          <p className="text-2xl font-display font-bold text-destructive">{lowStockItems.length}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Categories</p>
          <p className="text-2xl font-display font-bold text-foreground">{categories.length - 1}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-2xl font-display font-bold text-primary">${totalValue.toFixed(0)}</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 animate-fade-in opacity-0" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {lowStockItems.length} items are below minimum stock levels and need to be reordered
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in opacity-0" style={{ animationDelay: "200ms" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 animate-fade-in opacity-0" style={{ animationDelay: "250ms" }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              selectedCategory === category
                ? "gradient-primary text-primary-foreground shadow-glow"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-card shadow-card overflow-hidden animate-fade-in opacity-0" style={{ animationDelay: "300ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Item</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Category</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Stock Level</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Unit Cost</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Supplier</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => {
                const status = getStockStatus(item.current, item.minimum, item.maximum);
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border/50 hover:bg-secondary/50 transition-colors animate-fade-in opacity-0"
                    style={{ animationDelay: `${350 + index * 30}ms` }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{item.category}</td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-foreground">
                          {item.current} / {item.minimum} {item.unit}
                        </span>
                        <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              status === "critical" && "bg-destructive",
                              status === "low" && "bg-warning",
                              status === "good" && "bg-success"
                            )}
                            style={{ width: `${Math.min((item.current / item.minimum) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground">${item.costPerUnit.toFixed(2)}</td>
                    <td className="p-4 text-sm text-muted-foreground">{item.supplier}</td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          status === "critical" && "bg-destructive/20 text-destructive",
                          status === "low" && "bg-warning/20 text-warning",
                          status === "good" && "bg-success/20 text-success"
                        )}
                      >
                        {status === "critical" && "Critical"}
                        {status === "low" && "Low Stock"}
                        {status === "good" && "In Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
