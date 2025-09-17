import { db } from "./db";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import {
  users,
  passwords,
  categories,
  type User,
  type UpsertUser,
  type Password,
  type InsertPassword,
  type UpdatePassword,
  type Category,
  type InsertCategory,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getPasswords(userId: string, search?: string): Promise<Password[]> {
    if (search) {
      return await db
        .select()
        .from(passwords)
        .where(
          and(
            eq(passwords.userId, userId),
            or(
              ilike(passwords.website, `%${search}%`),
              ilike(passwords.username, `%${search}%`)
            )
          )
        )
        .orderBy(desc(passwords.updatedAt));
    }

    return await db
      .select()
      .from(passwords)
      .where(eq(passwords.userId, userId))
      .orderBy(desc(passwords.updatedAt));
  }

  async getPassword(id: string, userId: string): Promise<Password | undefined> {
    const [password] = await db
      .select()
      .from(passwords)
      .where(and(eq(passwords.id, id), eq(passwords.userId, userId)));
    return password;
  }

  async createPassword(password: InsertPassword): Promise<Password> {
    const [newPassword] = await db
      .insert(passwords)
      .values(password)
      .returning();
    return newPassword;
  }

  async updatePassword(id: string, userId: string, updates: UpdatePassword): Promise<Password | undefined> {
    const [updatedPassword] = await db
      .update(passwords)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(passwords.id, id), eq(passwords.userId, userId)))
      .returning();
    return updatedPassword;
  }

  async deletePassword(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(passwords)
      .where(and(eq(passwords.id, id), eq(passwords.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async getPasswordStats(userId: string): Promise<{ total: number; strong: number; weak: number; categories: number }> {
    const userPasswords = await db
      .select()
      .from(passwords)
      .where(eq(passwords.userId, userId));

    const userCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));

    const total = userPasswords.length;
    const strong = userPasswords.filter(p => (p.strength || 0) >= 3).length;
    const weak = userPasswords.filter(p => (p.strength || 0) <= 1).length;
    const categoriesCount = userCategories.length;

    return { total, strong, weak, categories: categoriesCount };
  }

  async getCategories(userId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: string, userId: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(updates)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
    return (result.rowCount || 0) > 0;
  }
}


