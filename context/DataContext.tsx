import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Store, Product, StockItem, Sale, UserRole, SaleItem, SaleStatus } from '../types';
import { dbService } from '../services/db';

interface DataContextType {
  isLoading: boolean;
  users: User[];
  stores: Store[];
  products: Product[];
  stock: StockItem[];
  sales: Sale[];
  addUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addStore: (store: Store) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (productId: string, storeId: string, quantity: number) => Promise<void>;
  processSale: (storeId: string, sellerId: string, sellerName: string, items: SaleItem[], customerName?: string, status?: SaleStatus) => Promise<void>;
  updateSaleStatus: (saleId: string, newStatus: SaleStatus) => Promise<void>;
  getStock: (productId: string, storeId: string) => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const refreshData = async () => {
      try {
        const [u, s, p, st, sa] = await Promise.all([
            dbService.getUsers(),
            dbService.getStores(),
            dbService.getProducts(),
            dbService.getStock(),
            dbService.getSales()
        ]);
        setUsers(u);
        setStores(s);
        setProducts(p);
        setStock(st);
        setSales(sa);
      } catch (error) {
          console.error("Error fetching data:", error);
      }
  };

  useEffect(() => {
    const init = async () => {
        setIsLoading(true);
        if (!dbService.isConnected()) {
            console.warn("No DB Connection Configured. Using memory/initial fallbacks inside service.");
            setIsConfigured(false);
            // Even if not connected (using fallbacks), we load
        }
        
        try {
            await dbService.init();
            await refreshData();
        } catch (e) {
            console.error("DB Init Failed", e);
        } finally {
            setIsLoading(false);
        }
    };
    init();
  }, []);

  const addUser = async (user: User) => {
      await dbService.createUser(user);
      await refreshData();
  };
  
  const deleteUser = async (id: string) => {
      await dbService.deleteUser(id);
      await refreshData();
  };

  const addStore = async (store: Store) => {
      await dbService.createStore(store);
      await refreshData();
  };
  
  const deleteStore = async (id: string) => {
      await dbService.deleteStore(id);
      await refreshData();
  };

  const addProduct = async (product: Product) => {
      await dbService.createProduct(product);
      await refreshData();
  };
  
  const updateProduct = async (product: Product) => {
      await dbService.updateProduct(product);
      await refreshData();
  };
  
  const deleteProduct = async (id: string) => {
      await dbService.deleteProduct(id);
      await refreshData();
  };

  const updateStockInDb = async (productId: string, storeId: string, quantity: number) => {
    await dbService.updateStock(productId, storeId, quantity);
    // Optimistic update for UI responsiveness could go here, but for now we refresh
    await refreshData();
  };

  const getStock = (productId: string, storeId: string) => {
    return stock.find(s => s.productId === productId && s.storeId === storeId)?.quantity || 0;
  };

  const processSale = async (storeId: string, sellerId: string, sellerName: string, items: SaleItem[], customerName?: string, status: SaleStatus = SaleStatus.COMPLETED) => {
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

    // 1. Save Sale
    await dbService.createSale(newSale);

    // 2. Deduct Stock immediately (Logic: Pending orders also reserve stock)
    for (const item of items) {
        const currentQty = getStock(item.productId, storeId);
        const newQty = currentQty - item.quantity;
        await dbService.updateStock(item.productId, storeId, newQty);
    }

    await refreshData();
  };

  const updateSaleStatus = async (saleId: string, newStatus: SaleStatus) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    // Logic for restoring stock if cancelled
    if (newStatus === SaleStatus.CANCELLED && sale.status !== SaleStatus.CANCELLED) {
        for (const item of sale.items) {
            const currentQty = getStock(item.productId, sale.storeId);
            await dbService.updateStock(item.productId, sale.storeId, currentQty + item.quantity);
        }
    }

    // Logic if we were to support re-opening a cancelled order
    if (sale.status === SaleStatus.CANCELLED && newStatus !== SaleStatus.CANCELLED) {
         for (const item of sale.items) {
            const currentQty = getStock(item.productId, sale.storeId);
            await dbService.updateStock(item.productId, sale.storeId, currentQty - item.quantity);
        }
    }

    await dbService.updateSaleStatus(saleId, newStatus);
    await refreshData();
  };

  return (
    <DataContext.Provider value={{
      isLoading,
      users, stores, products, stock, sales,
      addUser, deleteUser, addStore, deleteStore,
      addProduct, updateProduct, deleteProduct,
      updateStock: updateStockInDb, processSale, updateSaleStatus, getStock
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