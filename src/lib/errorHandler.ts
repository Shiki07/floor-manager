/**
 * Safe error handler utility to prevent database schema information leakage.
 * Maps database error messages to user-friendly messages.
 */
export function getSafeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || '');
  
  // RLS policy violations
  if (message.includes('row-level security policy') || message.includes('RLS')) {
    return 'You do not have permission to perform this action.';
  }
  
  // Check constraint violations
  if (message.includes('violates check constraint')) {
    return 'Invalid data provided. Please check your input.';
  }
  
  // Foreign key violations
  if (message.includes('violates foreign key') || message.includes('foreign key constraint')) {
    return 'Referenced item does not exist or cannot be removed.';
  }
  
  // Unique constraint violations
  if (message.includes('duplicate key value') || message.includes('already exists')) {
    return 'This item already exists.';
  }
  
  // Not null violations
  if (message.includes('violates not-null constraint') || message.includes('null value')) {
    return 'Required field is missing. Please check your input.';
  }
  
  // Generic PostgreSQL/PostgREST errors
  if (message.includes('pgrst') || message.includes('postgres') || message.includes('PGRST')) {
    return 'Database operation failed. Please try again.';
  }
  
  // Network or connection errors
  if (message.includes('network') || message.includes('Failed to fetch') || message.includes('timeout')) {
    return 'Connection error. Please check your internet and try again.';
  }
  
  // Authentication errors
  if (message.includes('not authenticated') || message.includes('JWT')) {
    return 'Please sign in to continue.';
  }
  
  // Default safe message - don't expose internal details
  return 'An error occurred. Please try again.';
}
