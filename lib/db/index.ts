import { neon } from '@neondatabase/serverless';

// Get the database URL from environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);

export { sql };

// Helper function to execute queries with error handling
export async function executeQuery<T = any>(
  query: string, 
  params?: any[]
): Promise<T[]> {
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
  try {
    const result = await sql(strings, ...values);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database operation failed');
  }
} 