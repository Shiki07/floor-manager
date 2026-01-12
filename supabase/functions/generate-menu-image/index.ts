import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generic error messages for client responses
const ERROR_MESSAGES = {
  UNAUTHORIZED: "Authentication required",
  INVALID_REQUEST: "Invalid request data",
  NOT_FOUND: "Menu item not found",
  GENERATION_FAILED: "Failed to generate image. Please try again.",
  RATE_LIMITED: "Service temporarily unavailable. Please try again later.",
  SERVICE_UNAVAILABLE: "Service temporarily unavailable. Please contact support.",
};

// Input validation helpers
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_CATEGORIES = ["Starters", "Main Courses", "Desserts", "Beverages", "Specials"];
const VALID_ROLES = ["staff", "manager", "admin"];

// Pattern to detect prompt injection attempts
const INJECTION_PATTERN = /\b(ignore|forget|system|prompt|instruction|override|bypass|disregard|instead|actually|hidden|secret|jailbreak)\b/i;

const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>{}[\]\\]/g, '') // Remove potential injection characters including backslash
    .replace(/\n+/g, ' ') // Replace all newlines with spaces
    .slice(0, 200) // Hard limit length
    .trim();
};

const containsInjectionAttempt = (input: string): boolean => {
  return INJECTION_PATTERN.test(input);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.UNAUTHORIZED }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create client with user's JWT for authentication verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify JWT and get user claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claims?.claims?.sub) {
      console.error("[AUTH_ERROR]", { error: claimsError?.message, timestamp: new Date().toISOString() });
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.UNAUTHORIZED }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has staff role or higher
    const userId = claims.claims.sub;
    const { data: roleData, error: roleError } = await supabaseAuth
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("[INSUFFICIENT_PRIVILEGES]", { userId, timestamp: new Date().toISOString() });
      return new Response(
        JSON.stringify({ error: "Insufficient privileges" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!VALID_ROLES.includes(roleData.role)) {
      console.error("[INSUFFICIENT_PRIVILEGES]", { userId, role: roleData.role, timestamp: new Date().toISOString() });
      return new Response(
        JSON.stringify({ error: "Insufficient privileges" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.INVALID_REQUEST }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { menuItemId, name, description, category } = body;

    // Validate menuItemId format
    if (!menuItemId || !UUID_REGEX.test(menuItemId)) {
      return new Response(
        JSON.stringify({ error: "Invalid menu item ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate name
    if (!name || typeof name !== 'string' || name.length < 1 || name.length > 200) {
      return new Response(
        JSON.stringify({ error: "Name must be between 1-200 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate description length
    if (description && (typeof description !== 'string' || description.length > 500)) {
      return new Response(
        JSON.stringify({ error: "Description must be less than 500 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for prompt injection attempts
    if (containsInjectionAttempt(name) || (description && containsInjectionAttempt(description))) {
      console.error("[INJECTION_ATTEMPT]", { name, description, timestamp: new Date().toISOString() });
      return new Response(
        JSON.stringify({ error: "Invalid content detected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate category if provided
    if (category && !VALID_CATEGORIES.includes(category)) {
      return new Response(
        JSON.stringify({ error: "Invalid category" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify menu item exists
    const { data: menuItem, error: fetchError } = await supabase
      .from("menu_items")
      .select("id")
      .eq("id", menuItemId)
      .single();

    if (fetchError || !menuItem) {
      console.error("[MENU_ITEM_NOT_FOUND]", { menuItemId, timestamp: new Date().toISOString() });
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.NOT_FOUND }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[CONFIG_ERROR]", { message: "LOVABLE_API_KEY not configured", timestamp: new Date().toISOString() });
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.SERVICE_UNAVAILABLE }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs before using in prompt
    const sanitizedName = sanitizeInput(name);
    const sanitizedDescription = description ? sanitizeInput(description) : "";
    const sanitizedCategory = category ? sanitizeInput(category) : "dish";

    // Create a detailed prompt for food photography
    const prompt = `Generate a professional food photography image of "${sanitizedName}". ${sanitizedDescription ? `Description: ${sanitizedDescription}.` : ""} Category: ${sanitizedCategory}. 
Style: High-end restaurant menu photography, beautifully plated on elegant dinnerware, soft natural lighting, shallow depth of field, appetizing and mouth-watering presentation. Top-down or 45-degree angle shot. Clean, neutral background.`;

    console.log("[GENERATING_IMAGE]", { menuItemId, name: sanitizedName, timestamp: new Date().toISOString() });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("[RATE_LIMITED]", { menuItemId, timestamp: new Date().toISOString() });
        return new Response(
          JSON.stringify({ error: ERROR_MESSAGES.RATE_LIMITED }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("[CREDITS_EXHAUSTED]", { menuItemId, timestamp: new Date().toISOString() });
        return new Response(
          JSON.stringify({ error: ERROR_MESSAGES.SERVICE_UNAVAILABLE }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("[AI_GATEWAY_ERROR]", { status: response.status, error: errorText, menuItemId, timestamp: new Date().toISOString() });
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.GENERATION_FAILED }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      console.error("[NO_IMAGE_GENERATED]", { menuItemId, timestamp: new Date().toISOString() });
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.GENERATION_FAILED }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert base64 to blob
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const fileName = `ai-generated/${menuItemId}-${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(fileName, binaryData, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("[UPLOAD_ERROR]", { menuItemId, error: uploadError.message, timestamp: new Date().toISOString() });
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.GENERATION_FAILED }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from("menu-images")
      .getPublicUrl(fileName);

    // Update the menu item with the new image URL
    const { error: updateError } = await supabase
      .from("menu_items")
      .update({ image_url: publicUrl })
      .eq("id", menuItemId);

    if (updateError) {
      console.error("[UPDATE_ERROR]", { menuItemId, error: updateError.message, timestamp: new Date().toISOString() });
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.GENERATION_FAILED }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[IMAGE_GENERATED]", { menuItemId, name: sanitizedName, timestamp: new Date().toISOString() });

    return new Response(
      JSON.stringify({ success: true, image_url: publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[FUNCTION_ERROR]", { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString() 
    });
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
