import { neon } from '@neondatabase/serverless';

// Get the database URL from environment variables
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set - database features will be disabled');
}

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export { sql };

// Helper function to execute queries with error handling
export async function executeQuery<T = any>(
  query: string, 
  params?: any[]
): Promise<T[]> {
  if (!sql) {
    throw new Error('Database not configured');
  }
  
  try {
    // For Neon, we need to use template literals for parameterized queries
    // This is a simplified approach - in practice, you'd use template literals
    const result = await sql`${query}`;
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database operation failed');
  }
}

// Helper function for single row queries
export async function executeQuerySingle<T = any>(
  query: string, 
  params?: any[]
): Promise<T | null> {
  if (!sql) {
    throw new Error('Database not configured');
  }
  
  try {
    const result = await sql`${query}`;
    return (result[0] as T) || null;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database operation failed');
  }
}

// Direct SQL function for template literal queries
export async function sqlQuery<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T[]> {
  if (!sql) {
    console.error('Database not configured - DATABASE_URL missing');
    throw new Error('Database not configured');
  }
  
  try {
    console.log('Executing SQL query:', { 
      query: strings.join('?'), 
      values: values.map(v => typeof v === 'string' ? v.substring(0, 50) + '...' : v)
    });
    
    const result = await sql(strings, ...values);
    console.log('Query successful, returned', result?.length || 0, 'rows');
    return result as T[];
  } catch (error: any) {
    console.error('Database query error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      stack: error.stack
    });
    
    // Handle specific connection errors
    if (error.message?.includes('timeout') || error.message?.includes('fetch failed')) {
      throw new Error('Database connection timeout - please try again');
    }
    
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      throw new Error('Database table does not exist - please run database setup');
    }
    
    throw new Error(`Database operation failed: ${error.message}`);
  }
} 