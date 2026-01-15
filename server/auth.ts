import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage.js";
import type { User } from "@shared/schema.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = "24h";

export interface AuthRequest extends Request {
  user?: User;
}

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Authentication middleware
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    // Handle both admin users and client users
    if (payload.role === 'client') {
      // For client tokens, get client info and create a pseudo-user object
      const client = await storage.getClient(payload.userId);
      if (!client) {
        return res.status(401).json({ error: 'Client not found' });
      }
      
      // Create a user-like object for the client
      req.user = {
        id: client.id,
        username: client.email,
        email: client.email,
        password: '', // Not needed for auth
        role: 'client',
        createdAt: client.createdAt
      };
    } else {
      // For admin users, look up in users table
      const user = await storage.getUser(payload.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      req.user = user;
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication error' });
  }
}

// Admin-only middleware
export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Client-only middleware  
export async function requireClient(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'client') {
    return res.status(403).json({ error: 'Client access required' });
  }
  next();
}

// Initialize admin user if doesn't exist
export async function initializeAdminUser() {
  try {
    const existingAdmin = await storage.getUserByUsername("CapturedbyChristian");
    if (!existingAdmin) {
      const hashedPassword = await hashPassword("Wordpass3211");
      await storage.createUser({
        username: "CapturedbyChristian",
        password: hashedPassword,
        email: "admin@capturedccollective.com",
        role: "admin"
      });
      console.log("✅ Admin user created successfully");
    } else {
      console.log("✅ Admin user already exists");
    }
  } catch (error) {
    console.error("❌ Failed to initialize admin user:", error);
  }
}