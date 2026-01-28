import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Store, Product, StockItem, Sale, UserRole, SaleItem } from '../types';
import { INITIAL_USERS, INITIAL_STORES, INITIAL_PRODUCTS, INITIAL_STOCK } from '../constants';

interface DataContextType {
  users: User[];
  stores: Store[];
  products: Product[];
  stock: StockItem[];
  sales: Sale[];
  addUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addStore: (store: Store) => void;
  deleteStore: (id: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateStock: (productId: string, storeId: string, quantity: number) => void;
  processSale: (storeId: string, sellerId: string, sellerName: string, items: SaleItem[], customerName?: string) => void;
  getStock: (productId: string, storeId: string) => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state from local storage or constants
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('hm_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem('hm_stores');
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('hm_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [stock, setStock] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('hm_stock');
    return saved ? JSON.parse(saved) : INITIAL_STOCK;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('hm_sales');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to localStorage whenever state changes
  useEffect(() => localStorage.setItem('hm_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('hm_stores', JSON.stringify(stores)), [stores]);
  useEffect(() => localStorage.setItem('hm_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('hm_stock', JSON.stringify(stock)), [stock]);
  useEffect(() => localStorage.setItem('hm_sales', JSON.stringify(sales)), [sales]);

  const addUser = (user: User) => setUsers([...users, user]);
  const deleteUser = (id: string) => setUsers(users.filter(u => u.id !== id));

  const addStore = (store: Store) => setStores([...stores, store]);
  const deleteStore = (id: string) => setStores(stores.filter(s => s.id !== id));

  const addProduct = (product: Product) => setProducts([...products, product]);
  const updateProduct = (product: Product) => setProducts(products.map(p => p.id === product.id ? product : p));
  const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));

  const updateStock = (productId: string, storeId: string, quantity: number) => {
    setStock(prev => {
      const existing = prev.find(s => s.productId === productId && s.storeId === storeId);
      if (existing) {
        return prev.map(s => s.productId === productId && s.storeId === storeId ? { ...s, quantity } : s);
      }
      return [...prev, { productId, storeId, quantity }];
    });
  };

  const getStock = (productId: string, storeId: string) => {
    return stock.find(s => s.productId === productId && s.storeId === storeId)?.quantity || 0;
  };

  const processSale = (storeId: string, sellerId: string, sellerName: string, items: SaleItem[], customerName?: string) => {
    const totalAmount = items.reduce((acc, item) => acc + item.total, 0);
    
    const newSale: Sale = {
      id: `sale_${Date.now()}`,
      storeId,
      sellerId,
      sellerName,
      timestamp: Date.now(),
      items,
      totalAmount,
      customerName
    };

    // Update Stock
    const newStock = [...stock];
    items.forEach(item => {
      const stockIndex = newStock.findIndex(s => s.productId === item.productId && s.storeId === storeId);
      if (stockIndex >= 0) {
        newStock[stockIndex].quantity -= item.quantity;
      } else {
        // Should not happen if validation is correct, but safe fallback to negative stock (backorder)
        newStock.push({ productId: item.productId, storeId, quantity: -item.quantity });
      }
    });

    setStock(newStock);
    setSales([...sales, newSale]);
  };

  return (
    <DataContext.Provider value={{
      users, stores, products, stock, sales,
      addUser, deleteUser, addStore, deleteStore,
      addProduct, updateProduct, deleteProduct,
      updateStock, processSale, getStock
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
