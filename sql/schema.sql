-- SCRIPT COMPLETO PARA GERAR O ARQUIVO .DB
-- Este script irá APAGAR dados antigos para garantir a estrutura correta.

BEGIN TRANSACTION;

-- 1. Limpeza (Drop tables antigos para evitar conflito de colunas)
DROP TABLE IF EXISTS stock;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS stores;

-- 2. Tabela de Lojas
CREATE TABLE stores (
  id TEXT PRIMARY KEY,
  name TEXT,
  location TEXT
);

-- 3. Tabela de Usuários (Com a coluna store_id correta)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT,
  name TEXT,
  role TEXT,
  store_id TEXT, -- Coluna essencial para vendedores
  password TEXT,
  FOREIGN KEY(store_id) REFERENCES stores(id)
);

-- 4. Tabela de Produtos
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  weight_unit TEXT,
  price REAL,
  description TEXT,
  active INTEGER,
  image_url TEXT
);

-- 5. Tabela de Estoque (Relacionamento Produto <-> Loja)
CREATE TABLE stock (
  product_id TEXT,
  store_id TEXT,
  quantity INTEGER,
  PRIMARY KEY (product_id, store_id),
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(store_id) REFERENCES stores(id)
);

-- 6. Tabela de Vendas
CREATE TABLE sales (
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

-- 7. DADOS INICIAIS (SEED)

-- Lojas
INSERT INTO stores (id, name, location) VALUES 
('store_1', 'Matriz - Centro', 'Rua das Ervas, 123'),
('store_2', 'Filial - Shopping', 'Av. Comercial, 500');

-- Usuários
INSERT INTO users (id, username, name, role, store_id, password) VALUES 
('admin_1', 'admin', 'João Admin', 'ADMIN', NULL, 'admin'),
('seller_1', 'vendedor', 'Maria Vendedora', 'SELLER', 'store_1', '123'),
('client_1', 'cliente', 'Carlos Cliente', 'CLIENT', NULL, '123');

-- Produtos
INSERT INTO products (id, name, category, weight_unit, price, description, active, image_url) VALUES 
('prod_1', 'Camomila Premium', 'Erva', '50g', 15.00, 'Camomila selecionada para chás relaxantes.', 1, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600&auto=format&fit=crop'),
('prod_2', 'Ginkgo Biloba', 'Comprimido', '60 caps', 45.90, 'Suplemento natural para memória e circulação.', 1, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=600&auto=format&fit=crop'),
('prod_3', 'Argila Verde', 'Pó/Cosmético', '200g', 22.50, 'Argila pura para máscaras faciais detox.', 1, 'https://images.unsplash.com/photo-1610555356070-d0efb6505f81?q=80&w=600&auto=format&fit=crop'),
('prod_4', 'Hortelã Seca', 'Erva', '30g', 8.00, 'Folhas de hortelã secas naturalmente.', 1, 'https://images.unsplash.com/photo-1628556270448-e7d47ca0d3af?q=80&w=600&auto=format&fit=crop');

-- Estoque Inicial
INSERT INTO stock (product_id, store_id, quantity) VALUES 
('prod_1', 'store_1', 50),
('prod_1', 'store_2', 20),
('prod_2', 'store_1', 15),
('prod_3', 'store_1', 10),
('prod_3', 'store_2', 5),
('prod_4', 'store_2', 100);

COMMIT;
