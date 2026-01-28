-- Execute este script no Console do SQLite Cloud (WeAdmin) ou via CLI
-- Isso criará a estrutura necessária para o sistema 3L Gestão

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT,
  name TEXT,
  role TEXT,
  store_id TEXT,
  password TEXT
);

-- 2. Tabela de Lojas (Nós)
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT,
  location TEXT
);

-- 3. Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  weight_unit TEXT,
  price REAL,
  description TEXT,
  active INTEGER, -- SQLite não tem booleano nativo, usa 0 ou 1
  image_url TEXT
);

-- 4. Tabela de Estoque (Relacionamento Produto <-> Loja)
CREATE TABLE IF NOT EXISTS stock (
  product_id TEXT,
  store_id TEXT,
  quantity INTEGER,
  PRIMARY KEY (product_id, store_id)
);

-- 5. Tabela de Vendas
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  store_id TEXT,
  seller_id TEXT,
  seller_name TEXT,
  timestamp INTEGER,
  total_amount REAL,
  customer_name TEXT,
  status TEXT,
  items_json TEXT -- Armazena os itens da venda como JSON string
);

-- 6. DADOS INICIAIS (SEED)
-- Apenas execute se o banco estiver vazio

-- Usuários Padrão
INSERT OR IGNORE INTO users (id, username, name, role, store_id, password) VALUES 
('admin_1', 'admin', 'João Admin', 'ADMIN', NULL, 'admin'),
('seller_1', 'vendedor', 'Maria Vendedora', 'SELLER', 'store_1', '123'),
('client_1', 'cliente', 'Carlos Cliente', 'CLIENT', NULL, '123');

-- Lojas Padrão
INSERT OR IGNORE INTO stores (id, name, location) VALUES 
('store_1', 'Matriz - Centro', 'Rua das Ervas, 123'),
('store_2', 'Filial - Shopping', 'Av. Comercial, 500');

-- Produtos Padrão
INSERT OR IGNORE INTO products (id, name, category, weight_unit, price, description, active, image_url) VALUES 
('prod_1', 'Camomila Premium', 'Erva', '50g', 15.00, 'Camomila selecionada para chás relaxantes.', 1, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600&auto=format&fit=crop'),
('prod_2', 'Ginkgo Biloba', 'Comprimido', '60 caps', 45.90, 'Suplemento natural para memória e circulação.', 1, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=600&auto=format&fit=crop'),
('prod_3', 'Argila Verde', 'Pó/Cosmético', '200g', 22.50, 'Argila pura para máscaras faciais detox.', 1, 'https://images.unsplash.com/photo-1610555356070-d0efb6505f81?q=80&w=600&auto=format&fit=crop'),
('prod_4', 'Hortelã Seca', 'Erva', '30g', 8.00, 'Folhas de hortelã secas naturalmente.', 1, 'https://images.unsplash.com/photo-1628556270448-e7d47ca0d3af?q=80&w=600&auto=format&fit=crop');

-- Estoque Inicial
INSERT OR IGNORE INTO stock (product_id, store_id, quantity) VALUES 
('prod_1', 'store_1', 50),
('prod_1', 'store_2', 20),
('prod_2', 'store_1', 15),
('prod_3', 'store_1', 10),
('prod_3', 'store_2', 5),
('prod_4', 'store_2', 100);
