import { useState } from "react";
import { Plus, Search, Edit, Trash2, Star, Eye, EyeOff, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from "@/hooks/useMenuItems";
import { MenuItemDialog } from "@/components/dialogs/MenuItemDialog";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";

type MenuItem = Tables<"menu_items">;

const categories = ["All", "Starters", "Main Courses", "Desserts", "Beverages", "Specials"];

export function MenuView() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const { data: menuItems = [], isLoading } = useMenuItems();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = (data: Partial<MenuItem>) => {
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

  const toggleAvailability = (item: MenuItem) => {
    updateItem.mutate({ id: item.id, available: !item.available });
  };

  const openEditDialog = (item: MenuItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const openDeleteDialog = (item: MenuItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in opacity-0">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground mt-1">Update dishes, prices, and availability</p>
        </div>
        <Button className="gap-2" onClick={() => { setSelectedItem(null); setDialogOpen(true); }}>
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
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery || selectedCategory !== "All" 
            ? "No menu items match your filters." 
            : "No menu items yet. Add your first dish!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "rounded-2xl bg-card overflow-hidden shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 animate-fade-in opacity-0",
                !item.available && "opacity-60"
              )}
              style={{ animationDelay: `${200 + index * 50}ms` }}
            >
              {/* Image */}
              <div className="h-40 bg-secondary relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                {item.popular && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-primary/90 backdrop-blur-sm flex items-center gap-1">
                    <Star className="h-3 w-3 text-primary-foreground fill-primary-foreground" />
                    <span className="text-xs font-medium text-primary-foreground">Popular</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <span className="text-lg font-display font-bold text-primary">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {item.description}
                </p>
                <span className="text-xs px-2 py-1 rounded-lg bg-secondary text-secondary-foreground">
                  {item.category}
                </span>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <button
                    onClick={() => toggleAvailability(item)}
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        menuItem={selectedItem}
        onSubmit={handleSubmit}
        isLoading={createItem.isPending || updateItem.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Menu Item"
        description={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        isLoading={deleteItem.isPending}
      />
    </div>
  );
}
