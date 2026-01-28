import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Store, Product, StockItem, Sale, UserRole, SaleItem, SaleStatus } from '../types';
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
  processSale: (storeId: string, sellerId: string, sellerName: string, items: SaleItem[], customerName?: string, status?: SaleStatus) => void;
  updateSaleStatus: (saleId: string, newStatus: SaleStatus) => void;
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

  const processSale = (storeId: string, sellerId: string, sellerName: string, items: SaleItem[], customerName?: string, status: SaleStatus = SaleStatus.COMPLETED) => {
    const totalAmount = items.reduce((acc, item) => acc + item.total, 0);
    
    const newSale: Sale = {
      id: `sale_${Date.now()}`,
      storeId,
      sellerId,
      sellerName,
      timestamp: Date.now(),
      items,
      totalAmount,
      customerName,
      status
    };

    // Deduct stock immediately (Reservation logic)
    // If it is pending, stock is reserved. If completed, it stays deducted.
    const newStock = [...stock];
    items.forEach(item => {
      const stockIndex = newStock.findIndex(s => s.productId === item.productId && s.storeId === storeId);
      if (stockIndex >= 0) {
        newStock[stockIndex].quantity -= item.quantity;
      } else {
        newStock.push({ productId: item.productId, storeId, quantity: -item.quantity });
      }
    });

    setStock(newStock);
    setSales([...sales, newSale]);
  };

  const updateSaleStatus = (saleId: string, newStatus: SaleStatus) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    // Logic for restoring stock if cancelled
    if (newStatus === SaleStatus.CANCELLED && sale.status !== SaleStatus.CANCELLED) {
        const newStock = [...stock];
        sale.items.forEach(item => {
            const stockIndex = newStock.findIndex(s => s.productId === item.productId && s.storeId === sale.storeId);
            if (stockIndex >= 0) {
                newStock[stockIndex].quantity += item.quantity;
            }
        });
        setStock(newStock);
    }

    // Logic if we were to support re-opening a cancelled order (optional, but good for safety)
    if (sale.status === SaleStatus.CANCELLED && newStatus !== SaleStatus.CANCELLED) {
         const newStock = [...stock];
         sale.items.forEach(item => {
             const stockIndex = newStock.findIndex(s => s.productId === item.productId && s.storeId === sale.storeId);
             if (stockIndex >= 0) {
                 newStock[stockIndex].quantity -= item.quantity;
             }
         });
         setStock(newStock);
    }

    setSales(sales.map(s => s.id === saleId ? { ...s, status: newStatus } : s));
  };

  return (
    <DataContext.Provider value={{
      users, stores, products, stock, sales,
      addUser, deleteUser, addStore, deleteStore,
      addProduct, updateProduct, deleteProduct,
      updateStock, processSale, updateSaleStatus, getStock
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