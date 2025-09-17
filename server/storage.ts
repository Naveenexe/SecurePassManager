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

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Password operations
  getPasswords(userId: string, search?: string): Promise<Password[]>;
  getPassword(id: string, userId: string): Promise<Password | undefined>;
  createPassword(password: InsertPassword): Promise<Password>;
  updatePassword(id: string, userId: string, updates: UpdatePassword): Promise<Password | undefined>;
  deletePassword(id: string, userId: string): Promise<boolean>;
  getPasswordStats(userId: string): Promise<{ total: number; strong: number; weak: number; categories: number }>;
  
  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, userId: string, updates: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string, userId: string): Promise<boolean>;
}


// In-memory storage for local development (DEV_LOCAL)
class InMemoryStorage implements IStorage {
  private usersById: Map<string, User> = new Map();
  private categoriesById: Map<string, Category> = new Map();
  private passwordsById: Map<string, Password> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.usersById.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    let user = this.usersById.get(userData.id!);
    if (!user) {
      user = {
        id: userData.id || String(Math.random()),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        createdAt: now,
        updatedAt: now,
      } as User;
    } else {
      user = { ...user, ...userData, updatedAt: now } as User;
    }
    this.usersById.set(user.id, user);
    return user;
  }

  async getPasswords(userId: string, search?: string): Promise<Password[]> {
    const all = Array.from(this.passwordsById.values()).filter(p => p.userId === userId);
    const filtered = search
      ? all.filter(p =>
          (p.website?.toLowerCase() || '').includes(search.toLowerCase()) ||
          (p.username?.toLowerCase() || '').includes(search.toLowerCase()),
        )
      : all;
    return filtered.sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async getPassword(id: string, userId: string): Promise<Password | undefined> {
    const pw = this.passwordsById.get(id);
    if (!pw || pw.userId !== userId) return undefined;
    return pw;
  }

  async createPassword(password: InsertPassword): Promise<Password> {
    const now = new Date();
    const id = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) as string;
    const pw: Password = {
      id,
      website: password.website,
      username: password.username,
      encryptedPassword: password.encryptedPassword,
      notes: password.notes ?? null as any,
      categoryId: (password as any).categoryId ?? null,
      userId: password.userId,
      isFavorite: password.isFavorite ?? false,
      strength: password.strength ?? 0,
      createdAt: now,
      updatedAt: now,
    } as unknown as Password;
    this.passwordsById.set(id, pw);
    return pw;
  }

  async updatePassword(id: string, userId: string, updates: UpdatePassword): Promise<Password | undefined> {
    const existing = await this.getPassword(id, userId);
    if (!existing) return undefined;
    const updated: Password = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    } as Password;
    this.passwordsById.set(id, updated);
    return updated;
  }

  async deletePassword(id: string, userId: string): Promise<boolean> {
    const existing = await this.getPassword(id, userId);
    if (!existing) return false;
    return this.passwordsById.delete(id);
  }

  async getPasswordStats(userId: string): Promise<{ total: number; strong: number; weak: number; categories: number }> {
    const userPasswords = Array.from(this.passwordsById.values()).filter(p => p.userId === userId);
    const userCategories = Array.from(this.categoriesById.values()).filter(c => c.userId === userId);
    const total = userPasswords.length;
    const strong = userPasswords.filter(p => (p.strength || 0) >= 3).length;
    const weak = userPasswords.filter(p => (p.strength || 0) <= 1).length;
    const categoriesCount = userCategories.length;
    return { total, strong, weak, categories: categoriesCount };
  }

  async getCategories(userId: string): Promise<Category[]> {
    return Array.from(this.categoriesById.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) as string;
    const cat: Category = {
      id,
      name: category.name,
      color: (category as any).color ?? '#3b82f6',
      userId: category.userId,
      createdAt: new Date(),
    } as unknown as Category;
    this.categoriesById.set(id, cat);
    return cat;
    }

  async updateCategory(id: string, userId: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categoriesById.get(id);
    if (!existing || existing.userId !== userId) return undefined;
    const updated: Category = { ...existing, ...updates } as unknown as Category;
    this.categoriesById.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    const existing = this.categoriesById.get(id);
    if (!existing || existing.userId !== userId) return false;
    return this.categoriesById.delete(id);
  }
}

export const memoryStorage = new InMemoryStorage();
