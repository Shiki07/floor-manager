import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";

type InventoryItem = Tables<"inventory_items">;

interface InventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  onSubmit: (data: Partial<InventoryItem>) => void;
  isLoading?: boolean;
}

const categories = ["Proteins", "Produce", "Dairy", "Dry Goods", "Beverages", "Supplies"];

export function InventoryItemDialog({ open, onOpenChange, item, onSubmit, isLoading }: InventoryItemDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    current_stock: 0,
    minimum_stock: 0,
    maximum_stock: 0,
    unit: "",
    cost_per_unit: 0,
    supplier: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        category: item.category || "",
        current_stock: item.current_stock || 0,
        minimum_stock: item.minimum_stock || 0,
        maximum_stock: item.maximum_stock || 0,
        unit: item.unit || "",
        cost_per_unit: item.cost_per_unit || 0,
        supplier: item.supplier || "",
      });
    } else {
      setFormData({
        name: "",
        category: "",
        current_stock: 0,
        minimum_stock: 0,
        maximum_stock: 0,
        unit: "",
        cost_per_unit: 0,
        supplier: "",
      });
    }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_stock">Current Stock</Label>
              <Input
                id="current_stock"
                type="number"
                step="0.01"
                min="0"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Min Stock</Label>
              <Input
                id="minimum_stock"
                type="number"
                step="0.01"
                min="0"
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maximum_stock">Max Stock</Label>
              <Input
                id="maximum_stock"
                type="number"
                step="0.01"
                min="0"
                value={formData.maximum_stock}
                onChange={(e) => setFormData({ ...formData, maximum_stock: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g. lbs, kg, pcs"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_per_unit">Cost per Unit ($)</Label>
              <Input
                id="cost_per_unit"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_per_unit}
                onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : item ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
