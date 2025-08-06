-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gallery items table
CREATE TABLE IF NOT EXISTS gallery_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url TEXT,
  date_uploaded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  downloads INTEGER DEFAULT 0,
  author VARCHAR(255) NOT NULL,
  tags TEXT[],
  chill_level INTEGER CHECK (chill_level >= 1 AND chill_level <= 10),
  user_id VARCHAR(255) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_gallery_items_user_id ON gallery_items(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_date ON gallery_items(date_uploaded); 