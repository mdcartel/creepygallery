const users = require('./data/users.json');

console.log('📊 Current Users Saved in File Storage:');
console.log('=====================================');

users.forEach((user, index) => {
  console.log(`${index + 1}. ${user.username} (${user.email})`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Created: ${user.createdAt}`);
  console.log(`   Password: ${user.password.substring(0, 20)}...`);
  console.log('');
});

console.log(`Total Users: ${users.length}`);
console.log(`File Location: ${__dirname}\\data\\users.json`);