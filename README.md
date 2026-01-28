# HerbalManager Pro

Sistema privado de gestão para loja de ervas com controle de estoque multi-loja, PDV e Dashboard.
**Desenvolvido por D22**

## 🚀 Como Hospedar no Render (Guia Atualizado)

### 1. Criar Serviço
1.  No Render, clique em **New +** -> **Static Site**.
2.  Conecte seu repositório.

### 2. Configurações de Build
*   **Build Command:** `npm install && npm run build`
*   **Publish Directory:** `dist`

### 3. Configurar Variáveis de Ambiente (Opcional mas Recomendado)
Para maior segurança, vá na aba **Environment** e adicione:
*   **Key:** `VITE_DB_CONNECTION_STRING`
*   **Value:** `sqlitecloud://...sua_string_de_conexao...`

*Se você não configurar isso, o sistema usará a string de conexão padrão embutida no código.*

### 4. ⚠️ IMPORTANTE: Configurar Rewrite (SPA)
Para que a navegação funcione ao recarregar a página, você DEVE configurar isso:

1.  Vá na aba **Redirects/Rewrites**.
2.  Adicione uma nova regra:
    *   **Source:** `/*`
    *   **Destination:** `/index.html`
    *   **Action:** `Rewrite`

---

## 💻 Rodando Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Rode o projeto:
   ```bash
   npm run dev
   ```

---

## 🛠 Tecnologias Utilizadas

*   React 18 + Vite
*   TypeScript
*   SQLite Cloud (Driver Oficial)
*   Tailwind CSS
*   Recharts

---

**Créditos: D22**