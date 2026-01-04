import { useState } from "react";
import { Plus, Search, Filter, AlertTriangle, Package, ShoppingCart, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInventoryItems, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem } from "@/hooks/useInventoryItems";
import { InventoryItemDialog } from "@/components/dialogs/InventoryItemDialog";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";

type InventoryItem = Tables<"inventory_items">;

const categories = ["All", "Proteins", "Produce", "Dairy", "Dry Goods", "Beverages", "Supplies"];

export function InventoryView() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const { data: inventoryItems = [], isLoading } = useInventoryItems();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();

  const filteredItems = inventoryItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const lowStockItems = inventoryItems.filter(i => i.current_stock < i.minimum_stock);
  const totalValue = inventoryItems.reduce((acc, i) => acc + (i.current_stock * (i.cost_per_unit || 0)), 0);

  const getStockStatus = (current: number, minimum: number) => {
    const percentage = (current / minimum) * 100;
    if (percentage < 50) return "critical";
    if (percentage < 100) return "low";
    return "good";
  };

  const handleSubmit = (data: Partial<InventoryItem>) => {
    if (selectedItem) {
      updateItem.mutate({ id: selectedItem.id, ...data }, {
        onSuccess: () => {
          setDialogOpen(false);
          setSelectedItem(null);
        }
      });
    } else {
      createItem.mutate(data as any, {
        onSuccess: () => {
          setDialogOpen(false);
        }
      });
    }
  };

  const handleDelete = () => {
    if (selectedItem) {
      deleteItem.mutate(selectedItem.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedItem(null);
        }
      });
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const openDeleteDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
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
          <Button className="gap-2" onClick={() => { setSelectedItem(null); setDialogOpen(true); }}>
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
      {isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery || selectedCategory !== "All" 
            ? "No items match your filters." 
            : "No inventory items yet. Add your first item!"}
        </div>
      ) : (
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
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => {
                  const status = getStockStatus(item.current_stock, item.minimum_stock);
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
                            {item.current_stock} / {item.minimum_stock} {item.unit}
                          </span>
                          <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                status === "critical" && "bg-destructive",
                                status === "low" && "bg-warning",
                                status === "good" && "bg-success"
                              )}
                              style={{ width: `${Math.min((item.current_stock / item.minimum_stock) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-foreground">${(item.cost_per_unit || 0).toFixed(2)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{item.supplier || "-"}</td>
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
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEditDialog(item)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button 
                            onClick={() => openDeleteDialog(item)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InventoryItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={selectedItem}
        onSubmit={handleSubmit}
        isLoading={createItem.isPending || updateItem.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Inventory Item"
        description={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        isLoading={deleteItem.isPending}
      />
    </div>
  );
}
