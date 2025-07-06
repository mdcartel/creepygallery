import { sql } from '@vercel/postgres';

export { sql };

// Helper function to execute queries with error handling
export async function executeQuery<T = any>(
  query: string, 
  params?: any[]
): Promise<T[]> {
  try {
    const result = await sql.query(query, params);
    return result.rows;
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
    const result = await sql.query(query, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database operation failed');
  }
} 