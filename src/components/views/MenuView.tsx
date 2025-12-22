import { useState } from "react";
import { Plus, Search, Edit, Trash2, Star, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  popular: boolean;
  image?: string;
}

const categories = ["All", "Appetizers", "Mains", "Desserts", "Drinks", "Specials"];

const menuItems: MenuItem[] = [
  { id: "1", name: "Truffle Risotto", description: "Arborio rice with black truffle and parmesan", price: 28, category: "Mains", available: true, popular: true },
  { id: "2", name: "Seared Salmon", description: "Atlantic salmon with lemon butter sauce", price: 32, category: "Mains", available: true, popular: true },
  { id: "3", name: "Caesar Salad", description: "Romaine lettuce with classic caesar dressing", price: 14, category: "Appetizers", available: true, popular: false },
  { id: "4", name: "Tiramisu", description: "Classic Italian coffee-flavored dessert", price: 12, category: "Desserts", available: true, popular: true },
  { id: "5", name: "Beef Carpaccio", description: "Thinly sliced raw beef with arugula", price: 18, category: "Appetizers", available: false, popular: false },
  { id: "6", name: "Lobster Bisque", description: "Creamy lobster soup with sherry", price: 16, category: "Appetizers", available: true, popular: false },
  { id: "7", name: "Filet Mignon", description: "8oz prime beef with red wine reduction", price: 48, category: "Mains", available: true, popular: true },
  { id: "8", name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center", price: 14, category: "Desserts", available: true, popular: true },
  { id: "9", name: "Signature Martini", description: "House-infused gin with citrus", price: 16, category: "Drinks", available: true, popular: false },
  { id: "10", name: "Chef's Special", description: "Daily rotating special from the kitchen", price: 38, category: "Specials", available: true, popular: true },
];

export function MenuView() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in opacity-0">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground mt-1">Update dishes, prices, and availability</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Dish
        </Button>
      </div>

      {/* Search */}
      <div className="relative animate-fade-in opacity-0" style={{ animationDelay: "100ms" }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 animate-fade-in opacity-0" style={{ animationDelay: "150ms" }}>
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

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "rounded-2xl bg-card p-5 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 animate-fade-in opacity-0",
              !item.available && "opacity-60"
            )}
            style={{ animationDelay: `${200 + index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  {item.popular && (
                    <Star className="h-4 w-4 text-primary fill-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xl font-display font-bold text-primary">
                ${item.price}
              </span>
              <span className="text-xs px-2 py-1 rounded-lg bg-secondary text-secondary-foreground">
                {item.category}
              </span>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <button
                className={cn(
                  "flex items-center gap-1 text-sm",
                  item.available ? "text-success" : "text-muted-foreground"
                )}
              >
                {item.available ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Available
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hidden
                  </>
                )}
              </button>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
