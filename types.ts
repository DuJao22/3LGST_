export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  CLIENT = 'CLIENT'
}

export enum ProductCategory {
  HERB = 'Erva',
  PILL = 'Comprimido',
  POWDER = 'Pó/Cosmético',
  ACCESSORY = 'Acessório'
}

export enum SaleStatus {
  PENDING = 'PENDING',     // Solicitado pelo cliente, aguardando retirada
  COMPLETED = 'COMPLETED', // Entregue/Finalizado
  CANCELLED = 'CANCELLED'  // Cancelado (Estorno de estoque)
}

export interface Store {
  id: string;
  name: string;
  location: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  storeId?: string; // If seller, which store they belong to
  password?: string; // In a real app, this wouldn't be here or would be hashed
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  weightUnit: string; // e.g., "25g", "Frasco 60 caps"
  price: number;
  description: string;
  active: boolean;
  imageUrl?: string;
}

// Map StoreID -> Quantity
export interface StockItem {
  productId: string;
  storeId: string;
  quantity: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  storeId: string;
  sellerId: string; // User ID
  sellerName: string;
  timestamp: number;
  items: SaleItem[];
  totalAmount: number;
  customerName?: string; // Optional for tracking walk-ins vs registered
  status: SaleStatus;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}