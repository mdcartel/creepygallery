import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

export interface UserWithPassword extends User {
  password: string;
}

// In a real app, you'd use a database
// For now, we'll use a simple in-memory store
const users: UserWithPassword[] = [];

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      username: user.username 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
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

export function createUser(email: string, username: string, password: string): UserWithPassword {
  const user: UserWithPassword = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    username,
    password,
    createdAt: new Date()
  };
  
  users.push(user);
  return user;
}

export function findUserByEmail(email: string): UserWithPassword | undefined {
  return users.find(user => user.email === email.toLowerCase());
}

export function findUserById(id: string): UserWithPassword | undefined {
  return users.find(user => user.id === id);
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