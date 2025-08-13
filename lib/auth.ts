import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sqlQuery } from './db';
// Import file storage - always try to load it
let fileStorageModule: any = null;
try {
  fileStorageModule = require('./user-file-storage.js');
  console.log('✅ File storage module loaded successfully');
} catch (error) {
  console.log('❌ File storage module not available:', error);
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('JWT_SECRET not set, using default for demo');
  // Use a default secret for demo purposes
  const JWT_SECRET_FALLBACK = 'demo-secret-key-for-testing';
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

export interface UserWithPassword extends User {
  password: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  const secret = JWT_SECRET || 'demo-secret-key-for-testing';
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      username: user.username 
    },
    secret,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): User | null {
  try {
    const secret = JWT_SECRET || 'demo-secret-key-for-testing';
    const decoded = jwt.verify(token, secret) as any;
    return {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      createdAt: new Date()
    };
  } catch (error) {
    return null;
  }
}

export async function createUser(email: string, username: string, password: string): Promise<UserWithPassword> {
  try {
    // Try database first
    const id = Date.now().toString();
    const hashedPassword = await hashPassword(password);
    
    console.log('🔄 Attempting to create user in database:', { id, email: email.toLowerCase(), username });
    
    const result = await sqlQuery`
      INSERT INTO users (id, email, username, password) 
      VALUES (${id}, ${email.toLowerCase()}, ${username}, ${hashedPassword})
    `;
    
    console.log('✅ User created in database, result:', result);
    return {
      id,
      email: email.toLowerCase(),
      username,
      password: hashedPassword,
      createdAt: new Date()
    };
  } catch (dbError: any) {
    console.error('❌ Database user creation failed:', dbError.message);
    console.log('❌ Database failed, checking for file storage fallback');
    
    // Fallback to file storage
    if (fileStorageModule) {
      console.log('🔄 Using file storage fallback for user creation');
      const fileUser = await fileStorageModule.createUserInFile(email, username, password);
      return {
        ...fileUser,
        createdAt: new Date(fileUser.createdAt)
      };
    }
    
    // If no fallback available, throw error
    throw new Error('Database unavailable and no fallback storage configured');
  }
}

export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
  try {
    // Try database first
    console.log('🔍 Looking for user in database:', email.toLowerCase());
    const users = await sqlQuery<UserWithPassword>`
      SELECT * FROM users WHERE email = ${email.toLowerCase()}
    `;
    
    console.log('📊 Database query result:', users.length, 'users found');
    
    if (users[0]) {
      console.log('✅ User found in database');
      return users[0];
    }
  } catch (dbError: any) {
    console.error('❌ Database user lookup failed:', dbError.message);
    console.log('❌ Database failed, checking file storage');
  }
  
  // Fallback to file storage
  if (fileStorageModule) {
    console.log('🔄 Checking file storage for user');
    const fileUser = fileStorageModule.findUserByEmailInFile(email);
    if (fileUser) {
      console.log('✅ User found in file storage');
      return {
        ...fileUser,
        createdAt: new Date(fileUser.createdAt)
      };
    }
  }
  
  console.log('❌ User not found in database or file storage');
  return null;
}

export async function findUserById(id: string): Promise<User | null> {
  try {
    // Try database first
    const users = await sqlQuery<UserWithPassword>`
      SELECT id, email, username, created_at as "createdAt" 
      FROM users WHERE id = ${id}
    `;
    
    if (users[0]) {
      console.log('✅ User found in database');
      return users[0];
    }
  } catch (dbError) {
    console.log('❌ Database failed, checking file storage');
  }
  
  // Fallback to file storage (development only)
  if (fileStorageModule && process.env.NODE_ENV === 'development') {
    const fileUser = fileStorageModule.findUserByIdInFile(id);
    if (fileUser) {
      console.log('✅ User found in file storage');
      const { password, ...userWithoutPassword } = fileUser;
      return {
        ...userWithoutPassword,
        createdAt: new Date(fileUser.createdAt)
      };
    }
  }
  
  return null;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 