import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'user-backups');

interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  createdAt: string;
}

// Ensure data directories exist
function ensureDirectories() {
  const dataDir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

// Load users from file
function loadUsers(): User[] {
  try {
    ensureDirectories();
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      const users = JSON.parse(data);
      console.log(`📁 Loaded ${users.length} users from file storage`);
      return users;
    }
  } catch (error) {
    console.error('❌ Error loading users from file:', error);
  }
  return [];
}

// Save users to file with backup
function saveUsers(users: User[]): void {
  try {
    ensureDirectories();
    
    // Create backup first
    if (fs.existsSync(USERS_FILE)) {
      const backupFile = path.join(BACKUP_DIR, `users_backup_${Date.now()}.json`);
      fs.copyFileSync(USERS_FILE, backupFile);
    }
    
    // Save new data
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log(`💾 Saved ${users.length} users to file storage`);
    
    // Keep only last 10 backups
    const backupFiles = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('users_backup_'))
      .sort()
      .reverse();
    
    if (backupFiles.length > 10) {
      backupFiles.slice(10).forEach(file => {
        fs.unlinkSync(path.join(BACKUP_DIR, file));
      });
    }
    
  } catch (error) {
    console.error('❌ Error saving users to file:', error);
    throw error;
  }
}

// Create new user
export async function createUserInFile(email: string, username: string, password: string): Promise<User> {
  const users = loadUsers();
  
  // Check if user already exists
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  // Add to users array
  users.push(newUser);
  
  // Save to file
  saveUsers(users);
  
  console.log(`✅ Created user: ${username} (${email})`);
  return newUser;
}

// Find user by email
export function findUserByEmailInFile(email: string): User | null {
  const users = loadUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
}

// Find user by ID
export function findUserByIdInFile(id: string): User | null {
  const users = loadUsers();
  const user = users.find(u => u.id === id);
  return user || null;
}

// Verify password
export async function verifyUserPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Get all users (for admin purposes)
export function getAllUsers(): Omit<User, 'password'>[] {
  const users = loadUsers();
  return users.map(({ password, ...user }) => user);
}

// Delete user
export function deleteUser(id: string): boolean {
  const users = loadUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index !== -1) {
    users.splice(index, 1);
    saveUsers(users);
    console.log(`🗑️ Deleted user with ID: ${id}`);
    return true;
  }
  
  return false;
}

// Update user
export function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
  const users = loadUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    console.log(`✏️ Updated user with ID: ${id}`);
    return users[index];
  }
  
  return null;
}

// Get user statistics
export function getUserStats() {
  const users = loadUsers();
  return {
    totalUsers: users.length,
    recentUsers: users.filter(u => {
      const createdAt = new Date(u.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return createdAt > weekAgo;
    }).length,
    oldestUser: users.length > 0 ? users.reduce((oldest, user) => 
      new Date(user.createdAt) < new Date(oldest.createdAt) ? user : oldest
    ).createdAt : null
  };
}