import { User, UserRole, Store, Product, ProductCategory, StockItem } from './types';

export const INITIAL_STORES: Store[] = [
  { id: 'store_1', name: 'Matriz - Centro', location: 'Rua das Ervas, 123' },
  { id: 'store_2', name: 'Filial - Shopping', location: 'Av. Comercial, 500' },
];

export const INITIAL_USERS: User[] = [
  { id: 'admin_1', username: 'admin', name: 'João Admin', role: UserRole.ADMIN, password: 'admin' },
  { id: 'seller_1', username: 'vendedor', name: 'Maria Vendedora', role: UserRole.SELLER, storeId: 'store_1', password: '123' },
  { id: 'client_1', username: 'cliente', name: 'Carlos Cliente', role: UserRole.CLIENT, password: '123' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'prod_1', 
    name: 'Camomila Premium', 
    category: ProductCategory.HERB, 
    weightUnit: '50g', 
    price: 15.00, 
    description: 'Camomila selecionada para chás relaxantes.', 
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600&auto=format&fit=crop'
  },
  { 
    id: 'prod_2', 
    name: 'Ginkgo Biloba', 
    category: ProductCategory.PILL, 
    weightUnit: '60 caps', 
    price: 45.90, 
    description: 'Suplemento natural para memória e circulação.', 
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=600&auto=format&fit=crop'
  },
  { 
    id: 'prod_3', 
    name: 'Argila Verde', 
    category: ProductCategory.POWDER, 
    weightUnit: '200g', 
    price: 22.50, 
    description: 'Argila pura para máscaras faciais detox.', 
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1610555356070-d0efb6505f81?q=80&w=600&auto=format&fit=crop'
  },
  { 
    id: 'prod_4', 
    name: 'Hortelã Seca', 
    category: ProductCategory.HERB, 
    weightUnit: '30g', 
    price: 8.00, 
    description: 'Folhas de hortelã secas naturalmente.', 
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1628556270448-e7d47ca0d3af?q=80&w=600&auto=format&fit=crop'
  },
];

export const INITIAL_STOCK: StockItem[] = [
  { productId: 'prod_1', storeId: 'store_1', quantity: 50 },
  { productId: 'prod_1', storeId: 'store_2', quantity: 20 },
  { productId: 'prod_2', storeId: 'store_1', quantity: 15 },
  { productId: 'prod_3', storeId: 'store_1', quantity: 10 },
  { productId: 'prod_3', storeId: 'store_2', quantity: 5 },
  { productId: 'prod_4', storeId: 'store_2', quantity: 100 },
];