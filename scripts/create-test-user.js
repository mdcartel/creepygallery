const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set');
    return;
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔄 Creating test user...');
    
    const email = 'test@creepygallery.com';
    const username = 'TestUser';
    const password = 'password123';
    const id = Date.now().toString();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Check if user already exists
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      console.log('✅ Test user already exists!');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      return;
    }
    
    // Create user
    await sql`
      INSERT INTO users (id, email, username, password) 
      VALUES (${id}, ${email}, ${username}, ${hashedPassword})
    `;
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Username:', username);
    console.log('');
    console.log('You can now log in with these credentials to test image uploads!');
    
  } catch (error) {
    console.error('❌ Failed to create test user:', error);
  }
}

require('dotenv').config({ path: '.env.local' });
createTestUser();