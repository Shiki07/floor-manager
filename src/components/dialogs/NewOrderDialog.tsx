import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useFloorTables } from "@/hooks/useFloorTables";
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    table_number: string;
    notes?: string;
    items: Omit<OrderItem, "name">[];
  }) => void;
  isLoading?: boolean;
}

export function NewOrderDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: NewOrderDialogProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: menuItems = [] } = useMenuItems();
  const { data: tables = [] } = useFloorTables();

  const availableItems = menuItems.filter((item) => item.available);
  const categories = ["All", ...new Set(availableItems.map((item) => item.category))];

  const filteredItems = selectedCategory === "All"
    ? availableItems
    : availableItems.filter((item) => item.category === selectedCategory);

  const addItem = (menuItem: { id: string; name: string; price: number }) => {
    const existingIndex = orderItems.findIndex(
      (item) => item.menu_item_id === menuItem.id
    );

    if (existingIndex >= 0) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += 1;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          menu_item_id: menuItem.id,
          name: menuItem.name,
          quantity: 1,
          price: menuItem.price,
        },
      ]);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...orderItems];
    updated[index].quantity += delta;

    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }

    setOrderItems(updated);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmit = () => {
    if (!tableNumber) return;

    onSubmit({
      table_number: tableNumber,
      notes: orderNotes || undefined,
      items: orderItems.map(({ menu_item_id, quantity, price, notes }) => ({
        menu_item_id,
        quantity,
        price,
        notes,
      })),
    });

    // Reset form
    setTableNumber("");
    setOrderNotes("");
    setOrderItems([]);
  };

  const resetForm = () => {
    setTableNumber("");
    setOrderNotes("");
    setOrderItems([]);
    setSelectedCategory("All");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            New Order
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Left side - Menu items */}
          <div className="flex flex-col min-h-0">
            <div className="mb-3">
              <Label>Select Items</Label>
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1 border rounded-xl p-2">
              <div className="grid grid-cols-2 gap-2">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left"
                  >
                    <p className="font-medium text-sm text-foreground line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-primary font-semibold mt-1">
                      ${item.price.toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right side - Order summary */}
          <div className="flex flex-col min-h-0">
            <div className="space-y-3 mb-4">
              <div>
                <Label htmlFor="table">Table</Label>
                <Select value={tableNumber} onValueChange={setTableNumber}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem
                        key={table.id}
                        value={table.table_number.toString()}
                      >
                        Table {table.table_number} ({table.seats} seats)
                      </SelectItem>
                    ))}
                    <SelectItem value="takeout">Takeout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Order Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Special instructions..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="mt-1 h-16"
                />
              </div>
            </div>

            <div className="flex-1 border rounded-xl p-3 min-h-0 flex flex-col">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Order Items ({orderItems.length})
              </p>

              {orderItems.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  Click items to add to order
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="space-y-2">
                    {orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(index, -1)}
                            className="p-1 rounded hover:bg-background transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(index, 1)}
                            className="p-1 rounded hover:bg-background transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeItem(index)}
                            className="p-1 rounded hover:bg-destructive/10 transition-colors ml-1"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!tableNumber || orderItems.length === 0 || isLoading}
              >
                {isLoading ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
