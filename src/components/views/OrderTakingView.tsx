import { useState } from "react";
import { Plus, Minus, Trash2, ShoppingCart, Search, ChevronLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useFloorTables } from "@/hooks/useFloorTables";
import { useCreateOrder } from "@/hooks/useOrders";
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

interface OrderTakingViewProps {
  onBack?: () => void;
}

export function OrderTakingView({ onBack }: OrderTakingViewProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: menuItems = [] } = useMenuItems();
  const { data: tables = [] } = useFloorTables();
  const createOrder = useCreateOrder();

  const availableItems = menuItems.filter((item) => item.available);
  const categoryOrder = ["Starters", "Main Courses", "Desserts", "Beverages", "Specials"];
  const uniqueCategories = [...new Set(availableItems.map((item) => item.category))];
  const allCategories = [...new Set([...uniqueCategories, "Specials"])];
  const sortedCategories = allCategories.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  const categories = ["All", ...sortedCategories];

  const filteredItems = availableItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = () => {
    if (!tableNumber || orderItems.length === 0) return;

    createOrder.mutate({
      table_number: tableNumber,
      notes: orderNotes || undefined,
      items: orderItems.map(({ menu_item_id, quantity, price, notes }) => ({
        menu_item_id,
        quantity,
        price,
        notes,
      })),
    }, {
      onSuccess: () => {
        setTableNumber("");
        setOrderNotes("");
        setOrderItems([]);
        onBack?.();
      },
    });
  };

  const clearOrder = () => {
    setOrderItems([]);
    setOrderNotes("");
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">Take Order</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">Select items from menu</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalItems > 0 && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <ShoppingCart className="h-4 w-4 mr-1" />
              {totalItems} items
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left Side - Menu Items */}
        <div className="flex-1 flex flex-col min-h-0 md:border-r border-border">
          {/* Search and Categories */}
          <div className="p-3 md:p-4 space-y-3 bg-background shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 md:h-11"
              />
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-3 md:px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Menu Grid */}
          <ScrollArea className="flex-1 px-3 md:px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
              {filteredItems.map((item) => {
                const inCart = orderItems.find(o => o.menu_item_id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className={cn(
                      "relative p-3 md:p-4 rounded-xl transition-all text-left group",
                      "bg-card hover:bg-card/80 border border-border hover:border-primary/50",
                      "hover:shadow-card active:scale-[0.98]",
                      inCart && "ring-2 ring-primary"
                    )}
                  >
                    {inCart && (
                      <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs">
                        {inCart.quantity}
                      </Badge>
                    )}
                    {item.image_url && (
                      <div className="w-full aspect-square mb-2 rounded-lg overflow-hidden bg-secondary">
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <p className="font-medium text-sm md:text-base text-foreground line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-sm md:text-base text-primary font-bold mt-1">
                      ${item.price.toFixed(2)}
                    </p>
                    {item.popular && (
                      <Badge variant="secondary" className="mt-2 text-xs">Popular</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right Side - Current Order - Full width on portrait tablets, fixed width on landscape */}
        <div className="w-full md:w-72 lg:w-80 xl:w-96 flex flex-col bg-card border-t md:border-t-0 shrink-0 max-h-[45vh] md:max-h-none">
          {/* Order Header */}
          <div className="p-3 md:p-4 border-b border-border shrink-0">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Current Order</Label>
              {orderItems.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearOrder} className="text-destructive hover:text-destructive">
                  Clear
                </Button>
              )}
            </div>
            <Select value={tableNumber} onValueChange={setTableNumber}>
              <SelectTrigger className="h-10 md:h-11">
                <SelectValue placeholder="Select table..." />
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

          {/* Order Items */}
          <ScrollArea className="flex-1 min-h-0">
            {orderItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">Tap menu items to add</p>
              </div>
            ) : (
              <div className="p-3 md:p-4 space-y-2">
                {orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 md:p-3 rounded-xl bg-secondary/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="p-1.5 rounded-lg bg-background hover:bg-muted transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="p-1.5 rounded-lg bg-background hover:bg-muted transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeItem(index)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Notes */}
                <Textarea
                  placeholder="Order notes (optional)..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="mt-3 h-16 text-sm resize-none"
                />
              </div>
            )}
          </ScrollArea>

          {/* Order Footer */}
          <div className="p-3 md:p-4 border-t border-border bg-card shrink-0">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-xl md:text-2xl font-bold text-primary">
                ${total.toFixed(2)}
              </span>
            </div>
            <Button
              className="w-full h-11 md:h-12 text-base gap-2"
              onClick={handleSubmit}
              disabled={!tableNumber || orderItems.length === 0 || createOrder.isPending}
            >
              <Send className="h-4 w-4" />
              {createOrder.isPending ? "Sending..." : "Send to Kitchen"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}