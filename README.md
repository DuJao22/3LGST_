# HerbalManager Pro

Sistema privado de gestão para loja de ervas com controle de estoque multi-loja, PDV e Dashboard.
**Desenvolvido por D22**

## 🚀 Como Hospedar no Render (Passo a Passo)

### ⚠️ LEIA ISSO PRIMEIRO: "Start Command" vs "Publish Directory"

Se você está vendo um campo vermelho escrito **Start Command** e ele é **Obrigatório** (Required), você selecionou a opção errada no Render.

*   ❌ **Errado:** New -> Web Service (Pede Start Command)
*   ✅ **Correto:** New -> **Static Site** (Pede Publish Directory)

**Recomendação:** Volte para a dashboard, clique em **New +** e selecione **Static Site**. É gratuito e mais rápido.

---

### Opção A: Hospedar como Static Site (Recomendado)

1. **Criar Serviço:**
   *   No Render, clique em **New +** -> **Static Site**.
   *   Conecte seu repositório GitHub.

2. **Configuração (IMPORTANTE: Copie exatamente assim):**
   *   **Build Command:** `npm install && npm run build`
   *   **Publish Directory:** `dist`
   *   *(Não existe campo Start Command aqui)*

3. **Variáveis (API Key):**
   *   Vá em "Environment" e adicione `API_KEY`.

---

### Opção B: Hospedar como Web Service (Se você realmente quiser)

Se você não quiser voltar e preferir continuar na tela de "Web Service":

1. **Configuração (IMPORTANTE: Copie exatamente assim):**
   *   **Build Command:** `npm install && npm run build`
   *   **Start Command:** `npm run start` 
   *   *(Adicionamos este comando especificamente para funcionar neste modo)*

2. **Variáveis (API Key):**
   *   Adicione `API_KEY` nas variáveis de ambiente.

*Nota: O modo Web Service pode desligar sozinho no plano gratuito após inatividade, enquanto o Static Site permanece sempre disponível.*

---

## 💻 Rodando Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz e adicione sua chave:
   ```
   API_KEY=sua_chave_aqui
   ```

3. Rode o projeto:
   ```bash
   npm run dev
   ```

---

## 🛠 Tecnologias Utilizadas

*   React 18
*   TypeScript
*   Tailwind CSS
*   Recharts (Gráficos)
*   Lucide React (Ícones)
*   Google Gemini API (IA)

---

**Créditos: D22**
