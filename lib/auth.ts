import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sqlQuery } from './db';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
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

export async function createUser(email: string, username: string, password: string): Promise<UserWithPassword> {
  const id = Date.now().toString();
  const hashedPassword = await hashPassword(password);
  
  await sqlQuery`
    INSERT INTO users (id, email, username, password) 
    VALUES (${id}, ${email.toLowerCase()}, ${username}, ${hashedPassword})
  `;
  
  return {
    id,
    email: email.toLowerCase(),
    username,
    password: hashedPassword,
    createdAt: new Date()
  };
}

export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
  const users = await sqlQuery<UserWithPassword>`
    SELECT * FROM users WHERE email = ${email.toLowerCase()}
  `;
  
  return users[0] || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const users = await sqlQuery<UserWithPassword>`
    SELECT id, email, username, created_at as "createdAt" 
    FROM users WHERE id = ${id}
  `;
  
  return users[0] || null;
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