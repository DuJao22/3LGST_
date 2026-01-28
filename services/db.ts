import { Database } from '@sqlitecloud/drivers';
import { User, Store, Product, StockItem, Sale, SaleItem, SaleStatus } from '../types';
import { INITIAL_USERS, INITIAL_STORES, INITIAL_PRODUCTS, INITIAL_STOCK } from '../constants';

// 1. Tenta pegar a string do ambiente (Configuração do Render)
// 2. Se não existir, usa a string hardcoded (Fallback/Local)

// Safety check for import.meta.env to prevent "Cannot read properties of undefined"
const getEnvConnectionString = () => {
    try {
        // Use optional chaining or explicit check
        const meta = import.meta as any;
        if (typeof meta !== 'undefined' && meta.env) {
            return meta.env.VITE_DB_CONNECTION_STRING;
        }
    } catch (e) {
        console.warn("Error reading environment variables:", e);
    }
    return undefined;
};

const ENV_CONNECTION_STRING = getEnvConnectionString();
const FALLBACK_CONNECTION_STRING = 'sqlitecloud://cbw4nq6vvk.g5.sqlite.cloud:8860/3LGESTAO.db?apikey=CCfQtOyo5qbyni96cUwEdIG4q2MRcEXpRHGoNpELtNc';

const CONNECTION_STRING = ENV_CONNECTION_STRING || FALLBACK_CONNECTION_STRING;

class DatabaseService {
  private db: Database | null = null;

  constructor() {
    // Verificação de segurança básica para garantir que temos uma string válida
    if (CONNECTION_STRING && (CONNECTION_STRING.includes('sqlitecloud://') || CONNECTION_STRING.includes('sqlite:'))) {
        try {
            this.db = new Database(CONNECTION_STRING);
            console.log("Database Driver Initialized");
        } catch (error) {
            console.error("Failed to initialize Database driver:", error);
        }
    } else {
        console.warn("Invalid Connection String provided.");
    }
  }

  isConnected(): boolean {
    return this.db !== null;
  }

  async init() {
    if (!this.db) {
        console.warn("SQLite Cloud Connection String not configured or invalid.");
        return;
    }

    // 1. Create Tables
    await this.db.sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT,
        name TEXT,
        role TEXT,
        store_id TEXT,
        password TEXT
      );
    `;

    await this.db.sql`
      CREATE TABLE IF NOT EXISTS stores (
        id TEXT PRIMARY KEY,
        name TEXT,
        location TEXT
      );
    `;

    await this.db.sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        weight_unit TEXT,
        price REAL,
        description TEXT,
        active INTEGER,
        image_url TEXT
      );
    `;

    // Composite Key for Stock
    await this.db.sql`
      CREATE TABLE IF NOT EXISTS stock (
        product_id TEXT,
        store_id TEXT,
        quantity INTEGER,
        PRIMARY KEY (product_id, store_id)
      );
    `;

    await this.db.sql`
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        store_id TEXT,
        seller_id TEXT,
        seller_name TEXT,
        timestamp INTEGER,
        total_amount REAL,
        customer_name TEXT,
        status TEXT,
        items_json TEXT
      );
    `;

    // --- MIGRATIONS (Auto-Fix Schema) ---
    // Fix: Add store_id to users if it was created without it (Legacy/Manual creation issue)
    try {
        await this.db.sql`ALTER TABLE users ADD COLUMN store_id TEXT`;
        // console.log("Migration Applied: Added store_id to users table.");
    } catch (e) {
        // Ignore error if column already exists (Expected behavior for subsequent runs)
    }

    // --- FIX: FORCE ADMIN PASSWORD UPDATE ---
    // Como o banco já existe, o seed inicial não roda. Forçamos a atualização da senha do admin aqui.
    try {
        await this.db.sql`UPDATE users SET password = '30031936Vo.' WHERE username = 'admin'`;
        console.log("Admin password synced to latest version.");
    } catch (e) {
        console.error("Failed to sync admin password:", e);
    }

    // 2. Seed Initial Data if empty
    try {
        const userCount = await this.db.sql`SELECT count(*) as c FROM users`;
        // @ts-ignore
        if (userCount && userCount[0] && userCount[0].c === 0) {
            console.log("Seeding Database...");
            for (const u of INITIAL_USERS) {
                await this.createUser(u);
            }
            for (const s of INITIAL_STORES) {
                await this.createStore(s);
            }
            for (const p of INITIAL_PRODUCTS) {
                await this.createProduct(p);
            }
            for (const st of INITIAL_STOCK) {
                await this.updateStock(st.productId, st.storeId, st.quantity);
            }
        }
    } catch (error) {
        console.error("Error during seeding:", error);
    }
  }

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    if (!this.db) return INITIAL_USERS;
    const res = await this.db.sql`SELECT * FROM users`;
    return res.map((r: any) => ({
        id: r.id,
        username: r.username,
        name: r.name,
        role: r.role as any,
        storeId: r.store_id || undefined,
        password: r.password
    }));
  }

  async createUser(user: User) {
    if (!this.db) return;
    await this.db.sql`INSERT INTO users (id, username, name, role, store_id, password) 
        VALUES (${user.id}, ${user.username}, ${user.name}, ${user.role}, ${user.storeId || null}, ${user.password})`;
  }

  async deleteUser(id: string) {
    if (!this.db) return;
    await this.db.sql`DELETE FROM users WHERE id = ${id}`;
  }

  // --- STORES ---
  async getStores(): Promise<Store[]> {
    if (!this.db) return INITIAL_STORES;
    return await this.db.sql`SELECT * FROM stores` as Store[];
  }

  async createStore(store: Store) {
    if (!this.db) return;
    await this.db.sql`INSERT INTO stores (id, name, location) VALUES (${store.id}, ${store.name}, ${store.location})`;
  }

  async deleteStore(id: string) {
    if (!this.db) return;
    await this.db.sql`DELETE FROM stores WHERE id = ${id}`;
  }

  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    if (!this.db) return INITIAL_PRODUCTS;
    const res = await this.db.sql`SELECT * FROM products`;
    return res.map((r: any) => ({
        ...r,
        imageUrl: r.image_url,
        weightUnit: r.weight_unit,
        active: r.active === 1
    }));
  }

  async createProduct(p: Product) {
    if (!this.db) return;
    await this.db.sql`INSERT INTO products (id, name, category, weight_unit, price, description, active, image_url)
        VALUES (${p.id}, ${p.name}, ${p.category}, ${p.weightUnit}, ${p.price}, ${p.description}, ${p.active ? 1 : 0}, ${p.imageUrl})`;
  }

  async updateProduct(p: Product) {
    if (!this.db) return;
    await this.db.sql`UPDATE products SET 
        name=${p.name}, category=${p.category}, weight_unit=${p.weightUnit}, price=${p.price}, 
        description=${p.description}, active=${p.active ? 1 : 0}, image_url=${p.imageUrl}
        WHERE id=${p.id}`;
  }

  async deleteProduct(id: string) {
    if (!this.db) return;
    await this.db.sql`DELETE FROM products WHERE id = ${id}`;
  }

  // --- STOCK ---
  async getStock(): Promise<StockItem[]> {
    if (!this.db) return INITIAL_STOCK;
    const res = await this.db.sql`SELECT * FROM stock`;
    return res.map((r: any) => ({
        productId: r.product_id,
        storeId: r.store_id,
        quantity: r.quantity
    }));
  }

  async updateStock(productId: string, storeId: string, quantity: number) {
    if (!this.db) return;
    // SQLite Cloud supports UPSERT (INSERT OR REPLACE/ON CONFLICT)
    await this.db.sql`
        INSERT INTO stock (product_id, store_id, quantity) VALUES (${productId}, ${storeId}, ${quantity})
        ON CONFLICT(product_id, store_id) DO UPDATE SET quantity = ${quantity}
    `;
  }

  // --- SALES ---
  async getSales(): Promise<Sale[]> {
    if (!this.db) return [];
    const res = await this.db.sql`SELECT * FROM sales`;
    return res.map((r: any) => ({
        id: r.id,
        storeId: r.store_id,
        sellerId: r.seller_id,
        sellerName: r.seller_name,
        timestamp: r.timestamp,
        totalAmount: r.total_amount,
        customerName: r.customer_name,
        status: r.status as SaleStatus,
        items: JSON.parse(r.items_json)
    }));
  }

  async createSale(sale: Sale) {
    if (!this.db) return;
    const itemsJson = JSON.stringify(sale.items);
    await this.db.sql`INSERT INTO sales (id, store_id, seller_id, seller_name, timestamp, total_amount, customer_name, status, items_json)
        VALUES (${sale.id}, ${sale.storeId}, ${sale.sellerId}, ${sale.sellerName}, ${sale.timestamp}, ${sale.totalAmount}, ${sale.customerName}, ${sale.status}, ${itemsJson})`;
  }

  async updateSaleStatus(saleId: string, status: string) {
    if (!this.db) return;
    await this.db.sql`UPDATE sales SET status = ${status} WHERE id = ${saleId}`;
  }
}

export const dbService = new DatabaseService();