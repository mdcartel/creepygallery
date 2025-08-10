const { createUserInFile, findUserByEmailInFile, getUserStats } = require('./lib/user-file-storage.js');

async function testFileStorage() {
  console.log('🧪 Testing file-based user storage...');
  
  try {
    // Test creating a user
    console.log('\n1. Creating test user...');
    const newUser = await createUserInFile('test@file.com', 'TestUser', 'password123');
    console.log('✅ User created:', { id: newUser.id, email: newUser.email, username: newUser.username });
    
    // Test finding user
    console.log('\n2. Finding user by email...');
    const foundUser = findUserByEmailInFile('test@file.com');
    console.log('✅ User found:', foundUser ? { id: foundUser.id, email: foundUser.email } : 'Not found');
    
    // Test stats
    console.log('\n3. Getting user stats...');
    const stats = getUserStats();
    console.log('✅ User stats:', stats);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFileStorage();