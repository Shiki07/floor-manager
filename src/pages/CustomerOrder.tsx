import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Search, 
  Utensils,
  Check,
  Loader2
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export default function CustomerOrder() {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Fetch menu items (public access)
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["menu_items_public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("available", true)
        .order("category", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Create order mutation
  const createOrder = useMutation({
    mutationFn: async () => {
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({ 
          table_number: tableNumber || "Unknown", 
          notes: orderNotes, 
          total, 
          status: "pending" 
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
      }));
      
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      return order;
    },
    onSuccess: () => {
      setOrderPlaced(true);
      setCart([]);
      setOrderNotes("");
      toast.success("Order placed successfully!");
    },
    onError: (error) => {
      toast.error(getSafeErrorMessage(error));
      if (import.meta.env.DEV) {
        console.error(error);
      }
    },
  });

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(menuItems.map(item => item.category))];
    return cats.sort();
  }, [menuItems]);

  // Filter menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  // Cart functions
  const addToCart = (item: typeof menuItems[0]) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => 
          c.id === item.id 
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { 
        id: item.id, 
        name: item.name, 
        price: item.price, 
        quantity: 1 
      }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(c => 
          c.id === itemId 
            ? { ...c, quantity: c.quantity - 1 }
            : c
        );
      }
      return prev.filter(c => c.id !== itemId);
    });
  };

  const getCartQuantity = (itemId: string) => {
    return cart.find(c => c.id === itemId)?.quantity || 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mx-auto flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold">Order Placed!</h2>
            <p className="text-muted-foreground">
              Your order for Table {tableNumber} has been sent to the kitchen.
            </p>
            <p className="text-sm text-muted-foreground">
              A staff member will bring your order shortly.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => setOrderPlaced(false)}
            >
              Place Another Order
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-bold text-lg">Menu</h1>
                <p className="text-xs text-muted-foreground">Table {tableNumber}</p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <ShoppingCart className="h-4 w-4" />
              {cartItemCount}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 pb-32">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Categories */}
        <ScrollArea className="w-full whitespace-nowrap mb-4">
          <div className="flex gap-2 pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="shrink-0"
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="shrink-0"
              >
                {category}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Menu Items */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const quantity = getCartQuantity(item.id);
              return (
                <Card key={item.id} className="overflow-hidden">
                  {item.image_url && (
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                      {item.popular && (
                        <Badge className="absolute top-2 left-2" variant="secondary">
                          Popular
                        </Badge>
                      )}
                    </div>
                  )}
                  <CardContent className={item.image_url ? "p-4" : "p-4 pt-4"}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-primary ml-2">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    
                    {quantity > 0 ? (
                      <div className="flex items-center justify-between mt-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-medium">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => addToCart(item)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full mt-3" 
                        size="sm"
                        onClick={() => addToCart(item)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Order
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Footer */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 space-y-3">
          <div className="container mx-auto">
            {/* Cart Summary */}
            <div className="space-y-2 mb-3">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Notes */}
            <Textarea
              placeholder="Special requests or allergies..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value.slice(0, 500))}
              className="mb-3 text-sm"
              rows={2}
              maxLength={500}
            />
            {orderNotes.length > 400 && (
              <p className="text-xs text-muted-foreground mb-2">
                {500 - orderNotes.length} characters remaining
              </p>
            )}

            {/* Place Order Button */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => createOrder.mutate()}
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Place Order - ${cartTotal.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}