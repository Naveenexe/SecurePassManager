import fs from "fs";
import path from "path";
import CryptoJS from "crypto-js";
import type { IStorage } from "./storage";
import type {
  User,
  UpsertUser,
  Password,
  InsertPassword,
  UpdatePassword,
  Category,
  InsertCategory,
} from "@shared/schema";

type DatabaseShape = {
  users: Record<string, User>;
  categories: Record<string, Category>;
  passwords: Record<string, Password>;
};

const DATA_DIR = path.resolve(import.meta.dirname, "..", "data");
const DATA_FILE = path.resolve(DATA_DIR, "local-data.json");

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const empty: DatabaseShape = { users: {}, categories: {}, passwords: {} };
    fs.writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2), "utf-8");
  }
}

async function readDb(): Promise<DatabaseShape> {
  ensureDataFile();
  const raw = await fs.promises.readFile(DATA_FILE, "utf-8");
  const parsed = JSON.parse(raw) as DatabaseShape;
  return parsed;
}

async function writeDb(db: DatabaseShape): Promise<void> {
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
}

function generateId(): string {
  return globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
}

function now(): Date {
  return new Date();
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-in-production";

export class JsonFileStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const db = await readDb();
    return db.users[id];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const db = await readDb();
    const id = userData.id || generateId();
    const existing = db.users[id];
    const user: User = {
      id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      createdAt: existing?.createdAt ? new Date(existing.createdAt as any) : now(),
      updatedAt: now(),
    } as unknown as User;
    db.users[id] = user;
    await writeDb(db);
    return user;
  }

  async getPasswords(userId: string, search?: string): Promise<Password[]> {
    const db = await readDb();
    let list = Object.values(db.passwords).filter(p => p.userId === userId);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => (p.website || "").toLowerCase().includes(q) || (p.username || "").toLowerCase().includes(q));
    }
    return list.sort((a, b) => (new Date(b.updatedAt as any).getTime()) - (new Date(a.updatedAt as any).getTime()));
  }

  async getPassword(id: string, userId: string): Promise<Password | undefined> {
    const db = await readDb();
    const pw = db.passwords[id];
    if (!pw || pw.userId !== userId) return undefined;
    return pw;
  }

  async createPassword(password: InsertPassword): Promise<Password> {
    const db = await readDb();
    const id = generateId();
    const pw: Password = {
      id,
      website: password.website,
      username: password.username,
      encryptedPassword: password.encryptedPassword,
      notes: (password as any).notes ?? null,
      categoryId: (password as any).categoryId ?? null,
      userId: password.userId,
      isFavorite: password.isFavorite ?? false,
      strength: password.strength ?? 0,
      createdAt: now(),
      updatedAt: now(),
    } as unknown as Password;
    db.passwords[id] = pw;
    await writeDb(db);
    return pw;
  }

  async updatePassword(id: string, userId: string, updates: UpdatePassword): Promise<Password | undefined> {
    const db = await readDb();
    const existing = db.passwords[id];
    if (!existing || existing.userId !== userId) return undefined;
    const updated: Password = { ...existing, ...updates, updatedAt: now() } as unknown as Password;
    db.passwords[id] = updated;
    await writeDb(db);
    return updated;
  }

  async deletePassword(id: string, userId: string): Promise<boolean> {
    const db = await readDb();
    const existing = db.passwords[id];
    if (!existing || existing.userId !== userId) return false;
    delete db.passwords[id];
    await writeDb(db);
    return true;
  }

  async getPasswordStats(userId: string): Promise<{ total: number; strong: number; weak: number; categories: number }> {
    const db = await readDb();
    const userPasswords = Object.values(db.passwords).filter(p => p.userId === userId);
    const userCategories = Object.values(db.categories).filter(c => c.userId === userId);
    const total = userPasswords.length;
    const strong = userPasswords.filter(p => (p.strength || 0) >= 3).length;
    const weak = userPasswords.filter(p => (p.strength || 0) <= 1).length;
    const categoriesCount = userCategories.length;
    return { total, strong, weak, categories: categoriesCount };
  }

  async getCategories(userId: string): Promise<Category[]> {
    const db = await readDb();
    const list = Object.values(db.categories).filter(c => c.userId === userId);
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const db = await readDb();
    const id = generateId();
    const cat: Category = {
      id,
      name: category.name,
      color: (category as any).color ?? '#3b82f6',
      userId: category.userId,
      createdAt: now(),
    } as unknown as Category;
    db.categories[id] = cat;
    await writeDb(db);
    return cat;
  }

  async updateCategory(id: string, userId: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const db = await readDb();
    const existing = db.categories[id];
    if (!existing || existing.userId !== userId) return undefined;
    const updated: Category = { ...existing, ...updates } as unknown as Category;
    db.categories[id] = updated;
    await writeDb(db);
    return updated;
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    const db = await readDb();
    const existing = db.categories[id];
    if (!existing || existing.userId !== userId) return false;
    delete db.categories[id];
    await writeDb(db);
    return true;
  }
}

export async function seedJsonIfEmpty(): Promise<void> {
  if (String(process.env.DEV_LOCAL).toLowerCase() !== "true") return;
  if (String(process.env.DEV_LOCAL_SEED).toLowerCase() === "false") return;
  ensureDataFile();
  const db = await readDb();
  const localUserId = "local-user";
  if (db.users[localUserId]) return;

  const user: User = {
    id: localUserId,
    email: "local@example.com",
    firstName: "Local",
    lastName: "User",
    profileImageUrl: "",
    createdAt: now(),
    updatedAt: now(),
  } as unknown as User;
  db.users[user.id] = user;

  // Only create user and categories, no default passwords
  const catPersonal: Category = {
    id: generateId(),
    name: "Personal",
    color: "#3b82f6",
    userId: user.id,
    createdAt: now(),
  } as unknown as Category;
  const catWork: Category = {
    id: generateId(),
    name: "Work",
    color: "#16a34a",
    userId: user.id,
    createdAt: now(),
  } as unknown as Category;
  db.categories[catPersonal.id] = catPersonal;
  db.categories[catWork.id] = catWork;

  // No default passwords - user starts with clean slate
  await writeDb(db);
}


