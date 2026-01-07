import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storageProvider";
import { setupAuth, isAuthenticated } from "./auth";
import { insertCategorySchema } from "@shared/schema";
import CryptoJS from "crypto-js";
import { z } from "zod";

// Encryption key - in production this should be from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-in-production";

function encryptPassword(password: string): string {
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
}

function decryptPassword(encryptedPassword: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

function calculatePasswordStrength(password: string): number {
  let score = 0;

  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character types
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return Math.min(4, score);
}

// API validation schemas (match client payloads)
const apiInsertPasswordSchema = z.object({
  website: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  notes: z.string().optional().nullable(),
  categoryId: z.string().optional(), // 'none' or real id; handled below
  isFavorite: z.boolean().optional(),
});

const apiUpdatePasswordSchema = z.object({
  website: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  notes: z.string().optional().nullable(),
  categoryId: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        // Create a default user for local mode
        const defaultUser = await storage.upsertUser({
          id: userId,
          email: "user@securepass.local",
          firstName: "SecurePass",
          lastName: "User",
          profileImageUrl: "",
        });
        return res.json(defaultUser);
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, email } = req.body;

      const updatedUser = await storage.upsertUser({
        id: userId,
        firstName,
        lastName,
        email,
        profileImageUrl: "",
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Password routes
  app.get('/api/passwords', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const search = req.query.search as string;
      const passwords = await storage.getPasswords(userId, search);

      // Decrypt passwords for client
      const decryptedPasswords = passwords.map(p => ({
        ...p,
        password: decryptPassword(p.encryptedPassword),
        encryptedPassword: undefined, // Don't send encrypted version to client
      }));

      res.json(decryptedPasswords);
    } catch (error) {
      console.error("Error fetching passwords:", error);
      res.status(500).json({ message: "Failed to fetch passwords" });
    }
  });

  app.get('/api/passwords/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getPasswordStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching password stats:", error);
      res.status(500).json({ message: "Failed to fetch password stats" });
    }
  });

  app.post('/api/passwords', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = apiInsertPasswordSchema.parse(req.body);

      const encryptedPassword = encryptPassword(validatedData.password);
      const strength = calculatePasswordStrength(validatedData.password);

      const passwordData = {
        website: validatedData.website,
        username: validatedData.username,
        encryptedPassword,
        notes: validatedData.notes,
        categoryId: validatedData.categoryId === 'none' ? null : validatedData.categoryId,
        userId,
        isFavorite: validatedData.isFavorite || false,
        strength,
      };

      const password = await storage.createPassword(passwordData);
      res.json({
        ...password,
        password: validatedData.password,
        encryptedPassword: undefined,
      });
    } catch (error) {
      console.error("Error creating password:", error);
      res.status(500).json({ message: "Failed to create password" });
    }
  });

  app.put('/api/passwords/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const passwordId = req.params.id;
      const validatedData = apiUpdatePasswordSchema.parse(req.body);

      const updateData: any = {};
      if (validatedData.website !== undefined) updateData.website = validatedData.website;
      if (validatedData.username !== undefined) updateData.username = validatedData.username;
      if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
      if (validatedData.categoryId !== undefined) {
        updateData.categoryId = validatedData.categoryId === 'none' ? null : validatedData.categoryId;
      }
      if (validatedData.isFavorite !== undefined) updateData.isFavorite = validatedData.isFavorite;

      if (validatedData.password) {
        updateData.encryptedPassword = encryptPassword(validatedData.password);
        updateData.strength = calculatePasswordStrength(validatedData.password);
      }

      const password = await storage.updatePassword(passwordId, userId, updateData);

      if (!password) {
        return res.status(404).json({ message: "Password not found" });
      }

      res.json({
        ...password,
        password: validatedData.password ? validatedData.password : decryptPassword(password.encryptedPassword),
        encryptedPassword: undefined,
      });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  app.delete('/api/passwords/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const passwordId = req.params.id;

      const success = await storage.deletePassword(passwordId, userId);

      if (!success) {
        return res.status(404).json({ message: "Password not found" });
      }

      res.json({ message: "Password deleted successfully" });
    } catch (error) {
      console.error("Error deleting password:", error);
      res.status(500).json({ message: "Failed to delete password" });
    }
  });

  // Category routes
  app.get('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCategorySchema.parse({
        ...req.body,
        userId,
      });

      const category = await storage.createCategory(validatedData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categoryId = req.params.id;
      const updates = req.body;

      const category = await storage.updateCategory(categoryId, userId, updates);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categoryId = req.params.id;

      const success = await storage.deleteCategory(categoryId, userId);

      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Export/Import routes
  app.get('/api/export', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const passwords = await storage.getPasswords(userId);
      const categories = await storage.getCategories(userId);

      const decryptedPasswords = passwords.map(p => ({
        website: p.website,
        username: p.username,
        password: decryptPassword(p.encryptedPassword),
        notes: p.notes,
        category: p.categoryId,
        createdAt: p.createdAt,
      }));

      const exportData = {
        passwords: decryptedPasswords,
        categories,
        exportedAt: new Date().toISOString(),
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="securepass-export.json"');
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
