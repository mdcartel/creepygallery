import { Pool } from 'pg';

// In-memory fallback storage
interface DatabaseTable {
  [key: string]: any[];
}

const fallbackDatabase: DatabaseTable = {
  users: [],
  gallery_items: []
};

// Create PostgreSQL connection pool
let pool: Pool | null = null;
let databaseAvailable = false;

try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  // Test connection
  pool.connect()
    .then(client => {
      console.log('✅ Database connection successful!');
      databaseAvailable = true;
      client.release();
      initializeDatabase();
    })
    .catch(error => {
      console.warn('⚠️ Database connection failed, using in-memory storage:', error.message);
      databaseAvailable = false;
    });
} catch (error) {
  console.warn('⚠️ Database initialization failed, using in-memory storage:', error);
  databaseAvailable = false;
}

// Template literal tag function for SQL queries with fallback
export async function sqlQuery<T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T[]> {
  if (databaseAvailable && pool) {
    // Try database first
    let client;
    try {
      client = await pool.connect();
      
      // Build the query string
      let query = '';
      for (let i = 0; i < strings.length; i++) {
        query += strings[i];
        if (i < values.length) {
          query += `$${i + 1}`;
        }
      }
      
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Database query error, falling back to in-memory:', error);
      databaseAvailable = false;
      // Fall through to in-memory implementation
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  
  // In-memory fallback implementation
  return new Promise((resolve) => {
    try {
      const query = strings.join('?').toLowerCase();
      
      if (query.includes('insert into users')) {
        const [id, email, username, password] = values;
        const newUser = {
          id,
          email,
          username,
          password,
          created_at: new Date()
        };
        
        fallbackDatabase.users.push(newUser);
        resolve([newUser] as T[]);
      } else if (query.includes('select * from users where email')) {
        const email = values[0];
        const user = fallbackDatabase.users.find(u => u.email === email);
        resolve(user ? [user] as T[] : []);
      } else if (query.includes('select id, email, username')) {
        const id = values[0];
        const user = fallbackDatabase.users.find(u => u.id === id);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          resolve([{ ...userWithoutPassword, createdAt: user.created_at }] as T[]);
        } else {
          resolve([]);
        }
      } else if (query.includes('insert into gallery_items')) {
        // Handle gallery item insertion
        const [title, image_url, author, tags, chill_level, user_id] = values;
        const newItem = {
          id: Date.now() + Math.random(), // Generate unique ID
          title,
          image_url,
          author,
          tags,
          chill_level,
          user_id,
          date_uploaded: new Date(),
          downloads: 0
        };
        
        fallbackDatabase.gallery_items.unshift(newItem); // Add to beginning
        
        // Keep only last 50 items to prevent memory issues
        if (fallbackDatabase.gallery_items.length > 50) {
          fallbackDatabase.gallery_items = fallbackDatabase.gallery_items.slice(0, 50);
        }
        
        resolve([newItem] as T[]);
      } else if (query.includes('select * from gallery_items')) {
        // Handle gallery items retrieval
        const items = [...fallbackDatabase.gallery_items].sort((a, b) => 
          new Date(b.date_uploaded).getTime() - new Date(a.date_uploaded).getTime()
        );
        resolve(items as T[]);
      } else if (query.includes('update gallery_items set downloads')) {
        // Handle download count update
        const id = values[0];
        const item = fallbackDatabase.gallery_items.find(item => item.id === id);
        if (item) {
          item.downloads = (item.downloads || 0) + 1;
        }
        resolve([] as T[]);
      } else if (query.includes('delete from gallery_items')) {
        // Handle gallery item deletion
        const [id, user_id] = values;
        const index = fallbackDatabase.gallery_items.findIndex(item => 
          item.id === id && item.user_id === user_id
        );
        if (index !== -1) {
          fallbackDatabase.gallery_items.splice(index, 1);
          resolve([{ deleted: true }] as T[]);
        } else {
          resolve([]);
        }
      } else {
        console.warn('Unknown query in fallback mode:', query);
        resolve([]);
      }
    } catch (error) {
      console.error('Fallback database error:', error);
      resolve([]);
    }
  });
}

// Initialize database tables (only if database is available)
async function initializeDatabase() {
  if (!databaseAvailable || !pool) return;
  
  try {
    await sqlQuery`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sqlQuery`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url TEXT,
        date_uploaded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        downloads INTEGER DEFAULT 0,
        author VARCHAR(255) NOT NULL,
        tags TEXT[] DEFAULT '{}',
        chill_level INTEGER DEFAULT 1,
        user_id VARCHAR(255) REFERENCES users(id)
      )
    `;
    
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    databaseAvailable = false;
  }
}

// Helper functions for debugging
export function getDatabaseStatus() {
  return { databaseAvailable, fallbackUsers: fallbackDatabase.users.length };
}

export function clearFallbackDatabase() {
  fallbackDatabase.users = [];
  fallbackDatabase.gallery_items = [];
}