import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (resets on function cold start)
// For production, use Redis or database-backed rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_ORDERS_PER_WINDOW = 10; // Max 10 orders per IP per hour

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIP);
  
  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  
  if (entry.count >= MAX_ORDERS_PER_WINDOW) {
    return true;
  }
  
  entry.count++;
  return false;
}

interface OrderItem {
  menu_item_id: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface CreateOrderRequest {
  table_number: string;
  notes?: string;
  items: OrderItem[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("x-real-ip") 
      || "unknown";

    // Check rate limit
    if (isRateLimited(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Too many orders. Please try again later." }),
        { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Parse request body
    const body: CreateOrderRequest = await req.json();
    const { table_number, notes, items } = body;

    // Validate table_number format (alphanumeric, hyphens, underscores, max 20 chars)
    const tableNumberRegex = /^[0-9A-Za-z_-]{1,20}$/;
    if (!table_number || !tableNumberRegex.test(table_number)) {
      return new Response(
        JSON.stringify({ error: "Invalid table number format" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Order must contain at least one item" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.menu_item_id || typeof item.menu_item_id !== "string") {
        return new Response(
          JSON.stringify({ error: "Invalid menu item ID" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      if (!item.quantity || item.quantity < 1 || item.quantity > 100) {
        return new Response(
          JSON.stringify({ error: "Invalid item quantity" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      if (typeof item.price !== "number" || item.price < 0) {
        return new Response(
          JSON.stringify({ error: "Invalid item price" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    // Validate notes length
    const sanitizedNotes = notes?.slice(0, 500) || null;

    // Create Supabase client with service role for bypassing RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate that all menu items exist and are available
    const menuItemIds = items.map(item => item.menu_item_id);
    const { data: validMenuItems, error: menuError } = await supabase
      .from("menu_items")
      .select("id, price, available")
      .in("id", menuItemIds);

    if (menuError) {
      console.error("Menu validation error:", menuError);
      return new Response(
        JSON.stringify({ error: "Failed to validate menu items" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Check all items are valid and available
    const validItemMap = new Map(validMenuItems?.map(m => [m.id, m]) || []);
    for (const item of items) {
      const menuItem = validItemMap.get(item.menu_item_id);
      if (!menuItem) {
        return new Response(
          JSON.stringify({ error: `Menu item not found: ${item.menu_item_id}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      if (!menuItem.available) {
        return new Response(
          JSON.stringify({ error: "One or more items are no longer available" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    // Calculate total using validated prices from database
    const total = items.reduce((sum, item) => {
      const menuItem = validItemMap.get(item.menu_item_id);
      return sum + (menuItem?.price || 0) * item.quantity;
    }, 0);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        table_number,
        notes: sanitizedNotes,
        total,
        status: "pending"
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create order items with validated prices
    const orderItems = items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      price: validItemMap.get(item.menu_item_id)?.price || item.price,
      notes: item.notes?.slice(0, 200) || null
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      // Clean up the order if items failed
      await supabase.from("orders").delete().eq("id", order.id);
      return new Response(
        JSON.stringify({ error: "Failed to create order items" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, order }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
