import { z } from 'zod';

/**
 * Validation schemas for all entities to ensure data integrity
 * before database operations.
 */

// Reservation validation schema
export const reservationSchema = z.object({
  customer_name: z.string()
    .trim()
    .min(1, 'Customer name is required')
    .max(100, 'Customer name must be less than 100 characters'),
  customer_phone: z.string()
    .trim()
    .min(1, 'Phone number is required')
    .max(20, 'Phone number must be less than 20 characters'),
  customer_email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  reservation_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  reservation_time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid time format'),
  guests: z.number()
    .int('Number of guests must be a whole number')
    .min(1, 'At least 1 guest is required')
    .max(100, 'Maximum 100 guests allowed'),
  table_number: z.string()
    .max(20, 'Table number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['pending', 'confirmed', 'seated', 'completed', 'cancelled'])
    .optional()
    .default('pending'),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

// Inventory item validation schema
export const inventoryItemSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Item name is required')
    .max(100, 'Item name must be less than 100 characters'),
  category: z.string()
    .trim()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  current_stock: z.number()
    .min(0, 'Current stock cannot be negative'),
  minimum_stock: z.number()
    .min(0, 'Minimum stock cannot be negative'),
  maximum_stock: z.number()
    .min(0, 'Maximum stock cannot be negative')
    .optional()
    .nullable(),
  unit: z.string()
    .trim()
    .min(1, 'Unit is required')
    .max(20, 'Unit must be less than 20 characters'),
  cost_per_unit: z.number()
    .min(0, 'Cost per unit cannot be negative')
    .optional()
    .nullable(),
  supplier: z.string()
    .max(100, 'Supplier name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
});

export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;

// Menu item validation schema
export const menuItemSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Item name is required')
    .max(100, 'Item name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(10000, 'Price seems too high'),
  category: z.string()
    .trim()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  available: z.boolean().optional().default(true),
  popular: z.boolean().optional().default(false),
  image_url: z.string()
    .url('Invalid image URL')
    .max(500, 'Image URL must be less than 500 characters')
    .optional()
    .or(z.literal(''))
    .nullable(),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;

// Staff member validation schema
export const staffMemberSchema = z.object({
  full_name: z.string()
    .trim()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters'),
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  phone: z.string()
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  role: z.string()
    .trim()
    .min(1, 'Role is required')
    .max(50, 'Role must be less than 50 characters'),
  status: z.enum(['active', 'off', 'vacation'])
    .optional()
    .default('active'),
  avatar_url: z.string()
    .url('Invalid avatar URL')
    .max(500, 'Avatar URL must be less than 500 characters')
    .optional()
    .or(z.literal(''))
    .nullable(),
  hire_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional(),
});

export type StaffMemberInput = z.infer<typeof staffMemberSchema>;

/**
 * Helper function to validate data and return user-friendly error message
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Get the first error message
  const firstError = result.error.errors[0];
  return { 
    success: false, 
    error: firstError?.message || 'Invalid data provided' 
  };
}
